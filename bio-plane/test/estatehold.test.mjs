/* THE ESTATE HOLD — the lock that keeps two MACHINES out of one repository.
 *
 * THIS SUITE EXISTS BECAUSE THE LOCK HAD NO TESTS AT ALL, which was found by
 * grepping for `estateVerdict` across `test/` on 2026-09-16 and getting nothing.
 * That is worse than an ordinary gap: `ESTATE-HOLD.md` says this is the one
 * collision nothing else here can see — claims keep two SESSIONS out of one
 * tree, worktrees keep two out of one checkout, and neither knows a second
 * machine exists — and M0-41's own finding is that an instrument which exists
 * and is optional is the common failure. An instrument with no control is the
 * same finding one step earlier.
 *
 * AND THE DEFECT IT WOULD HAVE CAUGHT WAS LIVE WHEN IT WAS WRITTEN. `plancheck`
 * derived this machine's name from `scutil --get ComputerName` || `hostname -s`.
 * On the Claude Code cloud image `hostname -s` is `vm` for EVERY container, so
 * two cloud machines read each other's hold as their OWN — verdict `ours`, no
 * refusal, not even a warning, just a note saying they hold the estate. Section
 * 2 is that arm, and it is written so it fails against the old rule rather than
 * describing it.
 *
 * WHAT IS DRIVEN RATHER THAN REASONED ABOUT: real git repositories, a real
 * worktree, and the real CLI over a real `origin`. The identity grain (one
 * machine is one identity however many worktrees) and the refusal path (a push
 * that loses the race must STOP, never rebase) are both properties of git that
 * an argument about them would get wrong.
 *
 * NEGATIVE CONTROL — FOUR ARMS RUN 2026-09-16, restored byte-identically after each
 * (`cp` aside and a sha256 check, never `git checkout --`, which has silently
 * discarded a session's own uncommitted work twice in this project). Baseline
 * unarmed: 50 pass, 0 fail, exit 0.
 *
 * (1) in `machineIdentity`, return `{ id: base }` right after the BIO_MACHINE_ID
 *     override — i.e. the pre-2026-09-16 bare-hostname rule. DECLARED one arm,
 *     GOT FOUR, 46 pass / 4 fail, exit 1: "two clones on ONE host derive DIFFERENT
 *     identities", "both are name-plus-suffix", "machine B is REFUSED by machine A's
 *     hold", and "outside a repository identity reports NOT DISCRIMINATING". **The
 *     declaration is corrected to the measurement rather than the arm to the
 *     declaration** — the fourth is real and informative: the early return also
 *     bypasses the no-gitdir path, so the old rule could not report an identity it
 *     was unable to persist. The arm is armed AFTER the override deliberately, so
 *     section 6's CLI arms (which pass BIO_MACHINE_ID) are not perturbed: a control
 *     whose method moves a second variable produces a refutation that looks more
 *     confident than the finding it refutes.
 * (2) `--git-common-dir` -> `--git-dir` in `machineIdFile`. 49 pass / 1 fail, exit 1:
 *     "a WORKTREE of that clone derives the same id". Exactly as declared, and it is
 *     the arm that catches identity scoped to one lane instead of one machine.
 * (3) drop `{ flag: "wx" }` in the id mint -> the concurrent-agreement property goes.
 *     NOT RUN as a suite arm: this suite derives twice in sequence rather than racing,
 *     so it would not fail, and saying so is better than implying a control that would
 *     not fire. `mintid.test.mjs` races the same primitive with eight real processes
 *     and is where that guarantee is actually driven.
 * (4) relax `sanitizeName` to a pass-through -> section 4's `|` and space arms fail.
 *     NOT RUN: the three arms are pure and call it directly, so the outcome is not in
 *     doubt in the way a control exists to settle. Stated so a reader knows it was
 *     considered and why it was skipped, rather than finding a gap and guessing.
 * (5) make `throughIso` emit seconds-and-millis -> section 5's coupling arm fails,
 *     the formatter's output stops satisfying the predicate. NOT RUN, same reason as (4).
 * (6) in the CLI's `claim`, change `v.kind === "theirs"` to `false`. DECLARED one arm,
 *     GOT TWO, 48 pass / 2 fail, exit 1: "WRITES NOTHING — a refusal that edited the
 *     file would be the lock failing open", and "show reports this machine and the
 *     remote's verdict without touching either". The second is a consequence and not
 *     noise: with the refusal gone the claim EDITED the file, so the later `show` arm
 *     comparing against the pre-state failed too. Both are the lock failing open, seen
 *     twice.
 * (7) replace every `node tools/estatehold.mjs` in `ESTATE-HOLD.md` with "hand-edit
 *     the HOLD line" — the protocol reverting to prose. 48 pass / 2 fail, exit 1:
 *     "points at the command rather than describing the edit" and "names all four
 *     acts". This is the arm that makes the doc load-bearing, the same one
 *     `mintid.test.mjs` carries for `CONDUCT.md`.
 */
import "./stdio.mjs";
import "./sandbox.mjs";
import { mkdtempSync, writeFileSync, readFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { estateVerdict, machineIdentity, machineIdFile, sanitizeName, claimWindowHours,
         throughIso, holdLine, rewriteHold, HOLD_RE } from "../../tools/estatehold.mjs";

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

/** A scratch clone with an `origin` that really is a remote, because the CLI
 *  reads the hold from `origin/main` and a fixture that fakes that would be
 *  testing the fixture. */
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

/* ========================================================================== */
section("the predicate: every verdict kind, driven from text");
{
  const held = (machine, through) => `    HOLD: machine=${machine} | account=acct | status=HELD | through=${through}`;
  const future = "2026-09-17T12:00Z", past = "2026-09-15T12:00Z";
  t("another machine's unexpired hold is THEIRS — the refusal",
    estateVerdict(held("other", future), "me", NOW).kind, "theirs");
  t("this machine's unexpired hold is OURS",
    estateVerdict(held("me", future), "me", NOW).kind, "ours");
  t("this machine's EXPIRED hold is ours-expired, not ours — it expired UNDER us",
    estateVerdict(held("me", past), "me", NOW).kind, "ours-expired");
  t("another machine's expired hold is FREE — expiry is a FACT, not an adjudication",
    estateVerdict(held("other", past), "me", NOW).kind, "free");
  t("RELEASED is free even with a future date",
    estateVerdict(`    HOLD: machine=x | account=a | status=RELEASED | through=${future}`, "me", NOW).kind, "free");
  t("absent file is UNREADABLE and never free", estateVerdict("", "me", NOW).kind, "unreadable");
  t("a file with no HOLD line is UNPARSEABLE and never free",
    estateVerdict("# lock\n\nonly prose\n", "me", NOW).kind, "unparseable");
  /* THE ZONE ARM. A time without a Z is read as LOCAL, which is the disagreement
     the Z was added to remove; it must be refused rather than guessed at. */
  t("a through= without the Z is BADTIME — refused, not guessed",
    estateVerdict(held("me", "2026-09-17T12:00"), "me", NOW).kind, "badtime");
  t("...and so is a bare date, because one form is cheaper to get right than two",
    estateVerdict(held("me", "2026-09-17"), "me", NOW).kind, "badtime");
}

/* ========================================================================== */
section("THE ARM THIS SUITE WAS WRITTEN FOR: two machines, one hostname");
/* The cloud image answers `vm` for every container. Under the pre-2026-09-16
   rule identity WAS that string, so this is not a hypothetical: it is the state
   the estate was in when this file was written, reproduced over two real clones. */
{
  const a = scratchClone("hostA", holdLine({ machine: "unset", account: "a", status: "RELEASED", through: "1970-01-01T00:00Z" }));
  const b = scratchClone("hostB", holdLine({ machine: "unset", account: "a", status: "RELEASED", through: "1970-01-01T00:00Z" }));
  const idA = machineIdentity({ repo: a.work, env: {} });
  const idB = machineIdentity({ repo: b.work, env: {} });
  t("two clones on ONE host derive DIFFERENT identities", idA.id !== idB.id, true);
  t("...and both say they discriminate", [idA.discriminating, idB.discriminating], [true, true]);
  t("...and both are name-plus-suffix, so the line stays readable",
    [/^[A-Za-z0-9._-]+-[0-9a-f]{8}$/.test(idA.id), /^[A-Za-z0-9._-]+-[0-9a-f]{8}$/.test(idB.id)], [true, true]);
  t("...and they share the BASE, which is what made the old rule collide",
    idA.base === idB.base, true);
  /* THE CONSEQUENCE, ASSERTED ON THE FIX AND NOT ON THE DEFECT. Under the new
     rule, A's hold reads THEIRS to B — a refusal. The old rule is shown beside
     it as the value it would have produced, so a reader sees the delta without
     the suite depending on the broken code still existing. */
  const aHolds = holdLine({ machine: idA.id, account: "a", status: "HELD", through: "2026-09-17T12:00Z" });
  t("machine B is REFUSED by machine A's hold", estateVerdict(aHolds, idB.id, NOW).kind, "theirs");
  const aHoldsOldRule = holdLine({ machine: idA.base, account: "a", status: "HELD", through: "2026-09-17T12:00Z" });
  t("under the OLD bare-hostname rule the same hold read OURS to B — the lock failing open",
    estateVerdict(aHoldsOldRule, idB.base, NOW).kind, "ours");
}

/* ========================================================================== */
section("the grain: one machine is one identity, however many worktrees");
{
  const c = scratchClone("grain", holdLine({ machine: "unset", account: "a", status: "RELEASED", through: "1970-01-01T00:00Z" }));
  const first = machineIdentity({ repo: c.work, env: {} });
  t("a second derivation on the same clone returns the SAME id",
    machineIdentity({ repo: c.work, env: {} }).id, first.id);
  t("...and the id is persisted where the gitdir is, not in the tree",
    machineIdFile({ repo: c.work }).endsWith("bio-machine"), true);
  /* A WORKTREE IS A CHECKOUT OF A COMMIT AND NOT A SECOND MACHINE. If identity
     came from `--git-dir` instead of `--git-common-dir`, a machine running BOB
     and CONDUCT in two worktrees would refuse itself its own estate. */
  const wt = join(SANDBOX, "grain-wt");
  git(c.work, "worktree", "add", "-b", "lane", wt, "HEAD");
  t("a WORKTREE of that clone derives the same id — one machine, one identity",
    machineIdentity({ repo: wt, env: {} }).id, first.id);
  t("BIO_MACHINE_ID overrides everything, which is what lets a control drive this",
    machineIdentity({ repo: c.work, env: { BIO_MACHINE_ID: "fixed-name" } }).id, "fixed-name");
  t("...and an override is sanitized too, so it cannot break the grammar",
    machineIdentity({ repo: c.work, env: { BIO_MACHINE_ID: "a|b c" } }).id, "a-b-c");
  /* NO GITDIR, NO IDENTITY — and it must SAY so rather than fall back silently
     to a name that does not discriminate. Undetermined is first-class. */
  const bare = join(SANDBOX, "not-a-repo");
  mkdirSync(bare, { recursive: true });
  const none = machineIdentity({ repo: bare, env: {} });
  t("outside a repository identity reports NOT DISCRIMINATING rather than guessing",
    none.discriminating, false);
}

/* ========================================================================== */
section("the one-line grammar, which is what makes two claimants collide");
{
  t("a pipe cannot survive into a machine name", sanitizeName("a|b"), "a-b");
  t("nor can a space — a Mac's ComputerName routinely has them",
    sanitizeName("Bob's Mac Mini"), "Bob-s-Mac-Mini");
  t("an empty or all-punctuation name becomes `unknown` rather than an empty field",
    [sanitizeName(""), sanitizeName("///")], ["unknown", "unknown"]);
  const doc = docWith(holdLine({ machine: "old", account: "a", status: "HELD", through: "2026-09-17T12:00Z" }));
  const next = rewriteHold(doc, { machine: "new", account: "b", status: "HELD", through: "2026-09-18T12:00Z" });
  t("rewriteHold replaces the WHOLE line and the result parses",
    estateVerdict(next, "new", NOW).kind, "ours");
  t("...and leaves exactly ONE hold line, never appending a second the predicate would race",
    (next.match(/HOLD: machine=/g) || []).length, 1);
  t("...and the old values are gone rather than merged",
    /machine=old/.test(next), false);
  let threw = null;
  try { rewriteHold("# no line here\n", { machine: "m", account: "a", status: "HELD", through: "2026-09-17T12:00Z" }); }
  catch (e) { threw = "threw"; }
  t("rewriting a file with no HOLD line THROWS rather than appending one", threw, "threw");
}

/* ========================================================================== */
section("the window, and the formatter the predicate has to accept");
{
  t("a persistent machine defaults to Bob's 48 h, unchanged", claimWindowHours({ env: {} }).hours, 48);
  t("an ephemeral one claims SHORT, because it cannot be relied on to release",
    claimWindowHours({ env: { CLAUDE_CODE_REMOTE: "1" } }).hours, 4);
  t("BIO_HOLD_HOURS overrides both", claimWindowHours({ env: { BIO_HOLD_HOURS: "2" } }).hours, 2);
  t("...and a nonsense value is ignored rather than producing a zero-length hold",
    claimWindowHours({ env: { BIO_HOLD_HOURS: "nope" } }).hours, 48);
  /* THE COUPLING ARM. The formatter and the parser are two readers of one rule,
     which is how two answers to one question were allowed to differ before. */
  const through = throughIso(Date.parse(NOW), 48);
  t("throughIso emits the ONE form the predicate accepts", /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}Z$/.test(through), true);
  t("...and a hold built from it reads OURS rather than BADTIME",
    estateVerdict(holdLine({ machine: "me", account: "a", status: "HELD", through }), "me", NOW).kind, "ours");
  t("...and the hold it builds really is in the future by that many hours",
    Date.parse(through) - Date.parse(NOW), 48 * 3600 * 1000);
}

/* ========================================================================== */
section("the CLI: the acts, and the refusal that must write NOTHING");
{
  const other = holdLine({ machine: "someone-else-1234abcd", account: "them", status: "HELD",
    through: throughIso(Date.now(), 48) });
  const c = scratchClone("cli", other);
  const run = (args, env = {}) => {
    try {
      const out = execFileSync("node", [TOOL, ...args],
        { cwd: c.work, encoding: "utf8", env: { ...process.env, BIO_MACHINE_ID: "cli-machine", ...env },
          stdio: ["ignore", "pipe", "pipe"] });
      return { code: 0, out };
    } catch (e) { return { code: e.status, out: `${e.stdout || ""}${e.stderr || ""}` }; }
  };
  const before = readFileSync(join(c.work, HOLD_DOC), "utf8");
  const claimed = run(["claim"]);
  t("a claim against ANOTHER machine's unexpired hold exits non-zero", claimed.code !== 0, true);
  t("...and says which machine holds it, by name", /someone-else-1234abcd/.test(claimed.out), true);
  t("...and WRITES NOTHING — a refusal that edited the file would be the lock failing open",
    readFileSync(join(c.work, HOLD_DOC), "utf8"), before);
  t("...and does not push: origin/main still carries the other machine's hold",
    /someone-else-1234abcd/.test(git(c.work, "show", "origin/main:" + HOLD_DOC)), true);
  t("show reports this machine and the remote's verdict without touching either",
    [/this machine: "cli-machine"/.test(run(["show"]).out), readFileSync(join(c.work, HOLD_DOC), "utf8") === before],
    [true, true]);
  /* THE FREE CASE, and --no-push, which writes but ALLOCATES NOTHING. The push is
     the allocator, so a session that stops before it has not taken the estate —
     that gap is where every wrong status in this project has lived. */
  const free = scratchClone("cli-free", holdLine({ machine: "none", account: "none", status: "RELEASED", through: "1970-01-01T00:00Z" }));
  const runFree = (args) => {
    try {
      const out = execFileSync("node", [TOOL, ...args],
        { cwd: free.work, encoding: "utf8", env: { ...process.env, BIO_MACHINE_ID: "taker", BIO_HOLD_HOURS: "6" },
          stdio: ["ignore", "pipe", "pipe"] });
      return { code: 0, out };
    } catch (e) { return { code: e.status, out: `${e.stdout || ""}${e.stderr || ""}` }; }
  };
  const dry = runFree(["claim", "--no-push"]);
  t("--no-push writes the line locally", /machine=taker/.test(readFileSync(join(free.work, HOLD_DOC), "utf8")), true);
  t("...and SAYS that nothing is allocated yet, because the push is the allocator",
    /NOT pushed, so nothing is allocated/.test(dry.out), true);
  t("...and origin/main is untouched, which is the fact that matters",
    /machine=none/.test(git(free.work, "show", "origin/main:" + HOLD_DOC)), true);
}

/* ========================================================================== */
section("the mechanism is in the loop the reader actually runs");
/* CLAUDE.md: documenting a step is necessary and never sufficient. The protocol
   used to be five prose instructions per claim; if the doc stops pointing at the
   command, it is prose again and this arm is what notices. */
{
  const lock = readFileSync(join(REPO, HOLD_DOC), "utf8");
  t("ESTATE-HOLD.md points at the command rather than describing the edit",
    /node tools\/estatehold\.mjs/.test(lock), true);
  t("...and names all four acts, so no reader has to infer one",
    ["show", "claim", "refresh", "release"].map((a) => new RegExp(`estatehold\\.mjs\\s+${a}`).test(lock)
      || new RegExp(`\`${a}\``).test(lock)), [true, true, true, true]);
  t("...and still carries the single HOLD line the predicate reads", HOLD_RE.test(lock), true);
  const newMachine = readFileSync(join(REPO, "docs/development/kickoffs/NEW-MACHINE.md"), "utf8");
  /* THE CANONICAL PHRASE, pinned rather than matched loosely. The first version of
     this arm accepted any sentence with "claim" near "before", which a doc could
     satisfy while saying something else entirely — an instrument that cannot fail
     is not an instrument. Both the lock and the bootstrap file must carry the ruled
     words, so a reader of either meets the same rule. */
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
