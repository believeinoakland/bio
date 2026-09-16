/* THE ESTATE HOLD — the lock that keeps two ACCOUNTS out of one repository.
 *
 * THE UNIT IS THE ACCOUNT. Bob, 2026-09-16: *"the estate gate is held per account,
 * not per session."* That sentence is the whole design and this suite exists to
 * hold the code to it, because the code got it wrong twice in one day in OPPOSITE
 * directions and neither error was visible without an arm:
 *
 *   v1  identity = `scutil --get ComputerName` || `hostname -s`. A hostname
 *       identifies no account at all, and on the Claude Code cloud image it is the
 *       constant `vm`, so the load-bearing question was answered by a value that
 *       could not answer it. The `account=` field existed and was a hand-typed
 *       literal — the one field that mattered was the one nothing derived.
 *   v2  identity = a per-CLONE minted id. Distinct, stable, well-tested, and WRONG:
 *       an account's second session is a second clone, so it would have been
 *       refused its own estate. **The fail-open v2 was written to fix was not a
 *       defect at all** — two containers of ONE account reading each other's hold
 *       as `ours` is exactly right. v2 measured the mechanism correctly and
 *       mis-named the unit, which is why section 2 now pins the unit itself.
 *
 * THE LOCK HAD NO TESTS WHEN THIS WAS WRITTEN, found by grepping `test/` for
 * `estateVerdict` and getting nothing. On the one instrument nothing else here can
 * check — claims keep two SESSIONS out of one tree, worktrees keep two out of one
 * checkout, and neither knows a second account exists — that is M0-41's finding
 * one step earlier: not an instrument that is optional, an instrument with no
 * control.
 *
 * WHAT IS DRIVEN RATHER THAN REASONED ABOUT: real git repositories, a real
 * worktree, and the real CLI over a real `origin`, because the refusal path and
 * the fallback grain are properties of git that an argument would get wrong.
 *
 * NEGATIVE CONTROL — arms RUN 2026-09-16 against the account-keyed code, each
 * restored byte-identically (`cp` aside plus a sha256 check, never
 * `git checkout --`, which has silently discarded this project's own uncommitted
 * work twice). Figures are recorded beside each arm when it is re-run.
 * Baseline unarmed: 57 pass, 0 fail, exit 0.
 * (1) in `estateVerdict`, compare `machine === thisHolder` instead of
 *     `account === thisHolder` — i.e. RESTORE v2's mistake. RUN: 52 pass / 5 fail,
 *     exit 1, and the named arm is **"session 2 reads session 1's hold as OURS — an
 *     account is never refused its own estate"**, which is the one that catches v2
 *     exactly. DECLARED one and got five; the declaration is corrected to the
 *     measurement. The other four are the same fact from other angles — "this
 *     account's unexpired hold is OURS", "a DIFFERENT machine with the same account
 *     is still OURS", and two arms that build a hold and read it back, which stop
 *     round-tripping once the keyed field moves. That the round-trip arms fail is
 *     worth noting rather than trimming: they are not about the unit and they
 *     detect it anyway, so a future reader who deletes section 2 does not thereby
 *     make this defect invisible.
 * (2) make `accountIdentity` skip `CLAUDE_CODE_ACCOUNT_UUID` and fall straight to
 *     the per-clone id. RUN: 51 pass / 6 fail, exit 1, naming all four holder-key
 *     arms plus the same "never refused its own estate" arm — the fallback is
 *     deliberately NOT account-scoped, so two sessions of one account stop agreeing.
 *     This is the arm that says the fallback is a fallback and not the rule.
 * (3) `--git-common-dir` -> `--git-dir` in `machineIdFile` -> section 3's worktree
 *     arm FAILS: the machine label, and the fallback key derived from it, would be
 *     per-lane rather than per-clone.
 * (4) relax `sanitizeName` to a pass-through -> section 4's `|` and space arms
 *     FAIL and the one-line grammar the lock rests on stops holding.
 * (5) drop the `.replace` in `throughIso` -> section 5's coupling arm FAILS: the
 *     formatter's own output stops satisfying the predicate's strict check, which
 *     is the two-readers-of-one-rule defect this project keeps finding.
 * (6) remove the `v.kind === "theirs"` refusal in the CLI's claim -> section 6's
 *     "refuses and writes NOTHING" arm FAILS, the lock failing open.
 * (7) delete the `tools/estatehold.mjs` pointer from `ESTATE-HOLD.md` -> section 7
 *     FAILS. The arm `mintid.test.mjs` carries for `CONDUCT.md`, same rule: a
 *     mechanism not in the loop the reader actually runs is not a mechanism.
 */
import "./stdio.mjs";
import "./sandbox.mjs";
import { mkdtempSync, writeFileSync, readFileSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { estateVerdict, machineIdentity, accountIdentity, machineIdFile, sanitizeName,
         claimWindowHours, throughIso, holdLine, rewriteHold, HOLD_RE } from "../../tools/estatehold.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const REPO = join(DIR, "../..");
const TOOL = join(REPO, "tools/estatehold.mjs");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const SECTIONS = 7;
let reached = 0;
const section = (name) => { reached++; console.log(`\n--- ${name} ---`); };

const SANDBOX = mkdtempSync(join(tmpdir(), "estatehold-"));
const NOW = "2026-09-16T12:00:00Z";
const git = (cwd, ...args) =>
  execFileSync("git", ["-C", cwd, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();

const HOLD_DOC = "docs/development/ESTATE-HOLD.md";
const docWith = (line) => `# lock\n\nprose a reader must not read instead of the line\n\n${line}\n\nmore prose\n`;
/** The ACCOUNT is the keyed field; the machine rides along as a label, so every
 *  fixture sets a machine DIFFERENT from the holder to keep the two from being
 *  accidentally interchangeable in an assertion. */
const held = (account, through, machine = "some-box-1111aaaa") =>
  holdLine({ machine, account, status: "HELD", through });

function scratchClone(name, holdLineText) {
  const origin = join(SANDBOX, `${name}.git`);
  const work = join(SANDBOX, name);
  execFileSync("git", ["init", "--bare", "-b", "main", origin], { stdio: "ignore" });
  execFileSync("git", ["clone", origin, work], { stdio: "ignore" });
  git(work, "config", "user.email", "t@example.invalid");
  git(work, "config", "user.name", "t");
  mkdirSync(join(work, "docs/development"), { recursive: true });
  writeFileSync(join(work, HOLD_DOC), docWith(holdLineText));
  git(work, "add", "-A");
  git(work, "commit", "-m", "hold");
  git(work, "push", "origin", "HEAD:main");
  return { origin, work };
}
const RELEASED = holdLine({ machine: "none", account: "none", status: "RELEASED", through: "1970-01-01T00:00Z" });

/* ========================================================================== */
section("the predicate: every verdict kind, keyed on the ACCOUNT");
{
  const future = "2026-09-17T12:00Z", past = "2026-09-15T12:00Z";
  t("another ACCOUNT's unexpired hold is THEIRS — the refusal",
    estateVerdict(held("acct-other", future), "acct-me", NOW).kind, "theirs");
  t("this account's unexpired hold is OURS",
    estateVerdict(held("acct-me", future), "acct-me", NOW).kind, "ours");
  t("this account's EXPIRED hold is ours-expired, not ours — it expired UNDER us",
    estateVerdict(held("acct-me", past), "acct-me", NOW).kind, "ours-expired");
  t("another account's expired hold is FREE — expiry is a FACT, not an adjudication",
    estateVerdict(held("acct-other", past), "acct-me", NOW).kind, "free");
  t("RELEASED is free even with a future date",
    estateVerdict(holdLine({ machine: "m", account: "acct-me", status: "RELEASED", through: future }), "acct-me", NOW).kind, "free");
  t("absent file is UNREADABLE and never free", estateVerdict("", "acct-me", NOW).kind, "unreadable");
  t("a file with no HOLD line is UNPARSEABLE and never free",
    estateVerdict("# lock\n\nonly prose\n", "acct-me", NOW).kind, "unparseable");
  /* THE MACHINE FIELD IS NOT LOAD-BEARING, and this is the arm that says so. A
     reader who assumes it is will write v1 or v2 again. */
  t("the MACHINE field cannot grant a hold — matching it while the account differs is THEIRS",
    estateVerdict(held("acct-other", future, "my-box-2222bbbb"), "acct-me", NOW).kind, "theirs");
  t("...and a DIFFERENT machine with the same account is still OURS, which is the whole ruling",
    estateVerdict(held("acct-me", future, "a-totally-different-box"), "acct-me", NOW).kind, "ours");
  t("...and the machine is still REPORTED, because a human reading the line wants it",
    estateVerdict(held("acct-me", future, "my-box-2222bbbb"), "acct-me", NOW).machine, "my-box-2222bbbb");
  /* THE ZONE ARM. A time without a Z is read as LOCAL, the disagreement the Z
     removes; it must be refused rather than guessed at. */
  t("a through= without the Z is BADTIME — refused, not guessed",
    estateVerdict(held("acct-me", "2026-09-17T12:00"), "acct-me", NOW).kind, "badtime");
  t("...and so is a bare date, because one form is cheaper to get right than two",
    estateVerdict(held("acct-me", "2026-09-17"), "acct-me", NOW).kind, "badtime");
}

/* ========================================================================== */
section("THE UNIT: one account many sessions, two accounts refused");
/* THE SECTION THIS SUITE EXISTS FOR. Both of the code's errors are pinned here as
   consequences rather than described in prose, so neither can come back quietly. */
{
  /* THESE ARMS DROVE `CLAUDE_CODE_ACCOUNT_UUID` AND THE RULE CHANGED UNDER THEM —
     corrected, never exempted. The old assertions were not wrong about the UNIT;
     they were wrong about WHERE THE UNIT IS READ FROM, and they passed because the
     suite supplied the variable the real platform does not. Measured 2026-09-16 on
     a desktop session: 26 `CLAUDE_*` variables and not that one. A suite that hands
     its subject an input the world never supplies is testing something else — the
     negative-control rule, arriving through the fixture instead of through the
     method. The account now comes from `~/.claude.json`, so the fixture is a HOME
     and not an env. */
  const home = (name, uuid) => {
    const h = join(SANDBOX, `home-${name}`);
    mkdirSync(h, { recursive: true });
    writeFileSync(join(h, ".claude.json"), JSON.stringify({
      machineID: "a-machine-not-an-account",
      oauthAccount: { accountUuid: uuid, emailAddress: `${name}@example.test` },
    }));
    return h;
  };
  const A = home("acctA", "11111111-1111-1111-1111-111111111111");
  const B = home("acctB", "22222222-2222-2222-2222-222222222222");
  const NOHOME = join(SANDBOX, "home-empty");
  mkdirSync(NOHOME, { recursive: true });
  /* TWO SESSIONS OF ONE ACCOUNT ARE TWO CLONES — the cloud case exactly, since a
     container clones fresh every session. They must agree. */
  const s1 = scratchClone("acctA-s1", RELEASED);
  const s2 = scratchClone("acctA-s2", RELEASED);
  const k1 = accountIdentity({ repo: s1.work, env: {}, home: A });
  const k2 = accountIdentity({ repo: s2.work, env: {}, home: A });
  t("two SESSIONS of one account derive the SAME holder key, though they are different clones",
    k1.key === k2.key, true);
  t("...and it is derived from the config's account uuid rather than typed or observed",
    k1.source, "~/.claude.json oauthAccount.accountUuid (hashed)");
  t("...and it does not disclose the uuid it came from",
    [/^acct-[0-9a-f]{8}$/.test(k1.key), k1.key.includes("1111")], [true, false]);
  const kB = accountIdentity({ repo: s1.work, env: {}, home: B });
  t("a DIFFERENT account derives a different key from the same clone", kB.key !== k1.key, true);
  /* THE REGRESSION THAT COST A DAY, pinned as a consequence: the machine's OWN
     identity must never be read off the machine. `machineID` sits in the same file
     and is not the answer. */
  t("...and the key is NOT derived from the machineID sitting beside it in that file",
    k1.key, `acct-${createHash("sha256").update("11111111-1111-1111-1111-111111111111").digest("hex").slice(0, 8)}`);

  const future = "2026-09-17T12:00Z";
  const aHolds = held(k1.key, future, machineIdentity({ repo: s1.work, env: {} }).id);
  /* THE ARM THAT CATCHES v2. Session 2 must read session 1's hold as ITS OWN. */
  t("session 2 reads session 1's hold as OURS — an account is never refused its own estate",
    estateVerdict(aHolds, k2.key, NOW).kind, "ours");
  /* THE ARM THAT CATCHES v1. The other account must be refused. */
  t("the OTHER account is REFUSED by that same hold — the collision the lock exists for",
    estateVerdict(aHolds, kB.key, NOW).kind, "theirs");
  /* THE PRECEDENCE, because a demoted fallback that quietly still wins is the same
     defect with the sources swapped. */
  t("the config uuid BEATS CLAUDE_CODE_ACCOUNT_UUID, which is now the fallback",
    accountIdentity({ repo: s1.work, home: A,
      env: { CLAUDE_CODE_ACCOUNT_UUID: "99999999-9999-9999-9999-999999999999" } }).key, k1.key);
  t("...and that variable is still USED where there is no config file to read",
    accountIdentity({ repo: s1.work, home: NOHOME,
      env: { CLAUDE_CODE_ACCOUNT_UUID: "11111111-1111-1111-1111-111111111111" } }).source,
    "CLAUDE_CODE_ACCOUNT_UUID (hashed)");
  /* AND THE FALLBACK IS HONEST ABOUT NOT BEING ACCOUNT-SCOPED, which is what keeps
     a machine with neither source from silently claiming per-clone. */
  const fb = accountIdentity({ repo: s1.work, env: {}, home: NOHOME });
  t("with no account uuid the key falls back to the per-clone id and SAYS it is not account-scoped",
    [fb.discriminating, /NOT account-scoped/.test(fb.source)], [true, true]);
  t("BIO_HOLD_ACCOUNT beats both, which is what lets a control drive the unit",
    accountIdentity({ repo: s1.work, home: A, env: { BIO_HOLD_ACCOUNT: "acct-fixed" } }).key, "acct-fixed");
  /* A CONFIG THAT IS PRESENT AND USELESS MUST FALL THROUGH, NOT THROW: an unparseable
     or half-written file is the state a crashed CLI leaves behind, and a lock that
     dies on it is worse than one that falls back and says so. */
  for (const [what, body] of [["unparseable", "{not json"], ["no oauthAccount", "{}"],
                              ["empty uuid", JSON.stringify({ oauthAccount: { accountUuid: "" } })]]) {
    const h = join(SANDBOX, `home-bad-${what.replace(/\W+/g, "-")}`);
    mkdirSync(h, { recursive: true });
    writeFileSync(join(h, ".claude.json"), body);
    t(`a config that is ${what} falls through to the fallback instead of throwing`,
      /NOT account-scoped/.test(accountIdentity({ repo: s1.work, env: {}, home: h }).source), true);
  }
}

/* ========================================================================== */
section("the machine label, and the grain of the fallback key");
{
  const c = scratchClone("grain", RELEASED);
  const first = machineIdentity({ repo: c.work, env: {} });
  t("a second derivation on the same clone returns the SAME machine label",
    machineIdentity({ repo: c.work, env: {} }).id, first.id);
  t("...and the id is persisted where the gitdir is, not in the tree",
    machineIdFile({ repo: c.work }).endsWith("bio-machine"), true);
  /* A WORKTREE IS A CHECKOUT OF A COMMIT AND NOT A SECOND MACHINE. It matters for
     the label, and it matters more for the FALLBACK key, which is derived from it
     on a machine with no account uuid. */
  const wt = join(SANDBOX, "grain-wt");
  git(c.work, "worktree", "add", "-b", "lane", wt, "HEAD");
  t("a WORKTREE of that clone derives the same label — one machine, one label",
    machineIdentity({ repo: wt, env: {} }).id, first.id);
  t("...so two LANES on one machine share the fallback holder key too",
    accountIdentity({ repo: wt, env: {} }).key, accountIdentity({ repo: c.work, env: {} }).key);
  t("BIO_MACHINE_ID overrides the label",
    machineIdentity({ repo: c.work, env: { BIO_MACHINE_ID: "fixed-name" } }).id, "fixed-name");
  t("...and an override is sanitized, so it cannot break the grammar",
    machineIdentity({ repo: c.work, env: { BIO_MACHINE_ID: "a|b c" } }).id, "a-b-c");
  const bare = join(SANDBOX, "not-a-repo");
  mkdirSync(bare, { recursive: true });
  /* `home` is pinned at an empty directory for the same reason the section above
     changed: reading the RUNNER's real config would make this arm assert about
     whoever is running the suite rather than about the subject. */
  const noHome = join(SANDBOX, "home-none");
  mkdirSync(noHome, { recursive: true });
  t("outside a repository, with no account uuid, the key reports NOT DISCRIMINATING rather than guessing",
    accountIdentity({ repo: bare, env: {}, home: noHome }).discriminating, false);
}

/* ========================================================================== */
section("the one-line grammar, which is what makes two claimants collide");
{
  t("a pipe cannot survive into a name", sanitizeName("a|b"), "a-b");
  t("nor can a space — a Mac's ComputerName routinely has them",
    sanitizeName("Bob's Mac Mini"), "Bob-s-Mac-Mini");
  t("an empty or all-punctuation name becomes `unknown` rather than an empty field",
    [sanitizeName(""), sanitizeName("///")], ["unknown", "unknown"]);
  const doc = docWith(held("acct-old", "2026-09-17T12:00Z"));
  const next = rewriteHold(doc, { machine: "m2", account: "acct-new", status: "HELD", through: "2026-09-18T12:00Z" });
  t("rewriteHold replaces the WHOLE line and the result parses",
    estateVerdict(next, "acct-new", NOW).kind, "ours");
  t("...and leaves exactly ONE hold line, never appending a second the predicate would race",
    (next.match(/HOLD: machine=/g) || []).length, 1);
  t("...and the old values are gone rather than merged", /acct-old/.test(next), false);
  let threw = null;
  try { rewriteHold("# no line here\n", { machine: "m", account: "acct-me", status: "HELD", through: "2026-09-17T12:00Z" }); }
  catch { threw = "threw"; }
  t("rewriting a file with no HOLD line THROWS rather than appending one", threw, "threw");
}

/* ========================================================================== */
section("the window, and the formatter the predicate has to accept");
{
  /* ONE WINDOW, AND IT IS BOB'S. An earlier draft cut it to 4 h on an ephemeral
     machine, reasoning the holder could not be relied on to release. That assumed
     the holder dies with the container; the holder is the ACCOUNT, which does not,
     so the account's next session reads `ours` and refreshes. The short window
     would only have expired under a working account — the failure the file says a
     short window causes. */
  t("one window, 48 h, whatever the machine is", claimWindowHours({ env: {} }).hours, 48);
  t("...including on an ephemeral container, because the ACCOUNT outlives it",
    claimWindowHours({ env: { CLAUDE_CODE_REMOTE: "1" } }).hours, 48);
  t("BIO_HOLD_HOURS overrides it", claimWindowHours({ env: { BIO_HOLD_HOURS: "2" } }).hours, 2);
  t("...and a nonsense value is ignored rather than producing a zero-length hold",
    claimWindowHours({ env: { BIO_HOLD_HOURS: "nope" } }).hours, 48);
  /* THE COUPLING ARM: the formatter and the parser are two readers of one rule. */
  const through = throughIso(Date.parse(NOW), 48);
  t("throughIso emits the ONE form the predicate accepts", /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}Z$/.test(through), true);
  t("...and a hold built from it reads OURS rather than BADTIME",
    estateVerdict(held("acct-me", through), "acct-me", NOW).kind, "ours");
  t("...and really is in the future by that many hours",
    Date.parse(through) - Date.parse(NOW), 48 * 3600 * 1000);
}

/* ========================================================================== */
section("the CLI: the acts, and the refusal that must write NOTHING");
{
  const c = scratchClone("cli", held("acct-someoneelse", throughIso(Date.now(), 48)));
  const run = (args, env = {}) => {
    try {
      const out = execFileSync("node", [TOOL, ...args],
        { cwd: c.work, encoding: "utf8", env: { ...process.env, BIO_HOLD_ACCOUNT: "acct-mine", ...env },
          stdio: ["ignore", "pipe", "pipe"] });
      return { code: 0, out };
    } catch (e) { return { code: e.status, out: `${e.stdout || ""}${e.stderr || ""}` }; }
  };
  const before = readFileSync(join(c.work, HOLD_DOC), "utf8");
  const claimed = run(["claim"]);
  t("a claim against ANOTHER account's unexpired hold exits non-zero", claimed.code !== 0, true);
  t("...and says which holder has it, by name", /acct-someoneelse/.test(claimed.out), true);
  t("...and WRITES NOTHING — a refusal that edited the file would be the lock failing open",
    readFileSync(join(c.work, HOLD_DOC), "utf8"), before);
  t("...and does not push: origin/main still carries the other account's hold",
    /acct-someoneelse/.test(git(c.work, "show", "origin/main:" + HOLD_DOC)), true);
  t("show prints the HOLDER and the machine separately, and touches nothing",
    [/this holder:\s+"acct-mine"/.test(run(["show"]).out),
     /this machine:/.test(run(["show"]).out),
     readFileSync(join(c.work, HOLD_DOC), "utf8") === before], [true, true, true]);
  /* THE FREE CASE, and --no-push, which writes but ALLOCATES NOTHING: the push is
     the allocator, so a session that stops before it has not taken the estate. */
  const free = scratchClone("cli-free", RELEASED);
  const runFree = (args) => {
    try {
      const out = execFileSync("node", [TOOL, ...args],
        { cwd: free.work, encoding: "utf8", env: { ...process.env, BIO_HOLD_ACCOUNT: "acct-taker", BIO_HOLD_HOURS: "6" },
          stdio: ["ignore", "pipe", "pipe"] });
      return { code: 0, out };
    } catch (e) { return { code: e.status, out: `${e.stdout || ""}${e.stderr || ""}` }; }
  };
  const dry = runFree(["claim", "--no-push"]);
  t("--no-push writes the line locally", /account=acct-taker/.test(readFileSync(join(free.work, HOLD_DOC), "utf8")), true);
  t("...and SAYS that nothing is allocated yet, because the push is the allocator",
    /NOT pushed, so nothing is allocated/.test(dry.out), true);
  t("...and origin/main is untouched, which is the fact that matters",
    /account=none/.test(git(free.work, "show", "origin/main:" + HOLD_DOC)), true);

  /* THE GATE RUNS BEFORE THE WRITE, PINNED AT SOURCE LEVEL AND HERE IS WHY.
     This arm exists because the defect it guards SHIPPED: writeAndPush wrote the
     HOLD line and only then ran plancheck, so plancheck's UNPUBLISHED arm saw the
     tool's OWN uncommitted write and refused every time. A refresh that could
     never succeed, on the command the handoff tells the next session to run, and
     it was caught by using it for real rather than by any assertion above —
     because NEITHER driven path reaches the gate: --no-push skips it by design,
     and the other-holder path refuses before it.
     It cannot be driven end-to-end from a scratch clone either: plancheckClean
     shells `node tools/plancheck.mjs` in the repo it is given, and a scratch clone
     has no tools/ tree, so the gate fails there for a reason that has nothing to
     do with the order. Rather than weaken the gate to make it testable — which
     would trade a real guard for a green arm — the ORDER is asserted in the
     source, the way hygiene.test.mjs pins source-level hazards. THE LIMIT IS
     STATED: this arm proves the call order, not the gate's behaviour. */
  const src = readFileSync(TOOL, "utf8");
  const body = src.slice(src.indexOf("function writeAndPush"), src.indexOf("async function main"));
  t("the gate is consulted BEFORE the hold line is written, not after",
    body.indexOf("plancheckClean(repo)") < body.indexOf("writeFileSync(path, next)"), true);
  t("...and a refused gate says the file was left untouched, so the caller is not left guessing",
    /Nothing was written: the hold line is untouched/.test(body), true);
}

/* ========================================================================== */
section("the mechanism is in the loop the reader actually runs");
{
  const lock = readFileSync(join(REPO, HOLD_DOC), "utf8");
  t("ESTATE-HOLD.md points at the command rather than describing the edit",
    /node tools\/estatehold\.mjs/.test(lock), true);
  t("...and names all four acts, so no reader has to infer one",
    ["show", "claim", "refresh", "release"].map((a) => new RegExp(`estatehold\\.mjs\\s+${a}`).test(lock)
      || new RegExp(`\`${a}\``).test(lock)), [true, true, true, true]);
  t("...and still carries the single HOLD line the predicate reads", HOLD_RE.test(lock), true);
  /* THE UNIT IS PINNED IN THE PROSE TOO. A doc that still says the lock is
     per-machine will produce v2 again in the next reader. */
  t("...and says the holder is the ACCOUNT, which is the ruling the code got wrong twice",
    /per account, not per session|the unit is the account/i.test(lock), true);
  const newMachine = readFileSync(join(REPO, "docs/development/kickoffs/NEW-MACHINE.md"), "utf8");
  t("NEW-MACHINE.md carries the RULED phrase, not a gesture at it",
    /claim before you verify/i.test(newMachine), true);
  t("...and so does the lock itself, so the two cannot drift",
    /claim before you verify/i.test(lock), true);
  t("...and CLAUDE.md still routes a session to the lock at all",
    /ESTATE-HOLD\.md/.test(readFileSync(join(REPO, "CLAUDE.md"), "utf8")), true);
}

/* ========================================================================== */
rmSync(SANDBOX, { recursive: true, force: true });
t(`this suite reached its own FOOT — all ${SECTIONS} sections ran (${reached})`, reached, SECTIONS);
console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
