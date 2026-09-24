/* GATE: never-cache (history) — M0-126, BOB #30 (TREE-SHARING §3a condition 1): its verdict drives `take`'s
   compare-and-swap through real git objects of this checkout (`git cat-file`, `git commit-tree` over its own history)
   and pushes to scratch remotes, which no result key can name. Declared at integration by c19-unionfix, 2026-09-24,
   from the gate's own trace on the union c19-batch9 (31 git commands; D-242 gated only its own suites).
   GATE: reads tools/pushguard.mjs — the same trace (gates' UNDER-INCLUSION, M0-126 condition 2) saw this suite read it.
   WHICH of its steps reads it was not established at integration; a push running an installed pre-push hook (D-406)
   is the likely path and is stated as UNDETERMINED, not as the cause. */
/* D-242 — TWO CLONES TAKING ONE NAMESPACE AT ONCE RECEIVE DISTINCT IDS, THROUGH ONE WRITER.
 *
 * The subject is `take` in `tools/mintid.mjs`: a compare-and-swap push to `<remote>/coord` (a remote ref refuses a
 * non-fast-forward, so two takes built on one tip cannot both land). The measured harm it answers: every worker is
 * its own cloud clone, so M0-17's exclusive create — exclusive against every worktree sharing ONE `.git` — was
 * exclusive against nothing, and on 2026-09-23 clones minted IC-222 three times, IC-231 three times, C-68..C-72 and
 * M-117 twice, each already held on an in-flight `land/*` branch.
 *
 * THE FIXTURE IS REAL GIT, NEVER THE REAL COORD. A scratch BARE repository stands in for `origin` (a `main` carrying
 * the corpus, a `coord`, a `land/worker/X` tip holding an id main does not), and TWO SEPARATE `git clone`s of it — two
 * `.git` directories, two local ledgers, exactly the cloud's shape — take concurrently in two child processes. The
 * clones' `origin` IS the scratch bare, and every child names it (BIO_IDTAKE_REMOTE=origin inside the clone).
 *
 * THE RACE PROVES ITSELF. Two children that happened to run one after the other would report distinct ids and prove
 * nothing. So in the barrier arm both children BUILD their take commit on the SAME coord tip, for the SAME id, and wait
 * at a file barrier until both have, before either pushes: without the one writer they would both hand it out. The
 * assertions are that their FIRST-attempt ids were identical (the collision was set up), that exactly one lost a race,
 * and that the ids they were finally given differ.
 *
 * NEGATIVE CONTROL: `node bio-plane/test/mintid-take.control.mjs` from the repo root — (B) BYPASS THE ONE WRITER: the
 * take's push replaced by an acknowledged no-op -> "two clones minting one namespace at once receive DISTINCT ids" FAILS
 * by name (with the arms that read the coord ledger); (L) the floor stops reading the land/* tips -> "an id held ONLY on
 * a land/* tip is not handed out again" FAILS by name; (R) OVER-STRICTNESS: every push failure treated as a race (the
 * refusal code never reached) -> "a push refused for a reason OTHER than a race hands out NOTHING" FAILS by name.
 * RUN 2026-09-23 by the D-242 worker, subject `tools/mintid.mjs` sha256 6d85ed4422a8…, 103,792 bytes: BASE 34 pass /
 * 0 fail; (B) 21 pass / 13 fail, the DISTINCT-ids arm first by name (with the lost-race, coord-ledger, six-takes,
 * record, CLI-held and refusal arms — the refusal arm because no push ever reached the declining hook); (L) 30 pass /
 * 4 fail, the land/* arm by name (with the floor-source arm and the two follow-on arms whose expected numbers shift);
 * (R) 33 pass / 1 fail, exactly the not-a-race arm. Each restored by `cp`, sha256 AND `cmp` identical. ALL AS DECLARED.
 * The OVER-STRICTNESS arms (a take of three; the remote spelled `file://…`) are in the suite and green at BASE.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync, chmodSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn, spawnSync, execFileSync } from "node:child_process";
import { take, corpusFloor, takeFile, held, REPO_ROOT } from "../../tools/mintid.mjs";

const TOOL = join(REPO_ROOT, "tools/mintid.mjs");
let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const SECTIONS = 7;
let reached = 0;
const section = (name) => { reached++; console.log(`\n--- ${name} ---`); };

const SANDBOX = mkdtempSync(join(tmpdir(), "mintid-take-"));
const ID = { GIT_AUTHOR_NAME: "t", GIT_AUTHOR_EMAIL: "t@t.invalid", GIT_COMMITTER_NAME: "t", GIT_COMMITTER_EMAIL: "t@t.invalid" };
const git = (cwd, ...args) => execFileSync("git", args, { cwd, encoding: "utf8", env: { ...process.env, ...ID }, stdio: ["pipe", "pipe", "pipe"] }).trim();
const write = (root, rel, text) => { mkdirSync(dirname(join(root, rel)), { recursive: true }); writeFileSync(join(root, rel), text); };

/* ---- the scratch origin: main (the corpus), coord (the writer), land/worker/X (an id only there) ---- */
const ORIGIN = join(SANDBOX, "origin.git");
git(SANDBOX, "init", "-q", "--bare", ORIGIN);
const SEED = join(SANDBOX, "seed");
git(SANDBOX, "init", "-q", "-b", "main", SEED);
write(SEED, "bio-plane/checks/bio-checks.mjs", "export const CHECKS = [\n  { check: 'C-5.1', what: 'a family on main' },\n];\n");
write(SEED, "docs/development/DEBT.md", "| D-10 | a debt row on main |\n");
write(SEED, "docs/development/QUEUE.md", "### M0-3 · done\n");
git(SEED, "add", "-A"); git(SEED, "commit", "-q", "-m", "main: the corpus");
git(SEED, "push", "-q", ORIGIN, "main:refs/heads/main");
git(SEED, "checkout", "-q", "-b", "land/worker/X");
write(SEED, "bio-plane/checks/bio-checks.mjs", "export const CHECKS = [\n  { check: 'C-5.1', what: 'a family on main' },\n  { check: 'C-9.1', what: 'held ONLY on a landing ref' },\n];\n");
git(SEED, "commit", "-q", "-am", "land: C-9 on a landing ref only");
git(SEED, "push", "-q", ORIGIN, "land/worker/X:refs/heads/land/worker/X");
git(SEED, "checkout", "-q", "--orphan", "coord");
git(SEED, "rm", "-rq", "--cached", ".");
rmSync(join(SEED, "bio-plane"), { recursive: true, force: true }); rmSync(join(SEED, "docs"), { recursive: true, force: true });
write(SEED, "docs/development/CLAIMS.md", "# claims\n");
git(SEED, "add", "-A"); git(SEED, "commit", "-q", "-m", "coord: the root");
git(SEED, "push", "-q", ORIGIN, "coord:refs/heads/coord");

const CLONE_A = join(SANDBOX, "A"), CLONE_B = join(SANDBOX, "B");
git(SANDBOX, "clone", "-q", "-b", "main", ORIGIN, CLONE_A);
git(SANDBOX, "clone", "-q", "-b", "main", ORIGIN, CLONE_B);
const ledgerA = join(SANDBOX, "ledger-A"), ledgerB = join(SANDBOX, "ledger-B");
const envFor = (ledger, extra = {}) => ({ ...process.env, BIO_IDALLOC_DIR: ledger, BIO_IDTAKE_REMOTE: "origin", ...extra });
/* Read UNTRIMMED: `git()` trims, and a take with an empty `why` ends its line in a tab the trim would eat. */
const coordLedger = (ns) => { try { return execFileSync("git", ["--git-dir", ORIGIN, "show", `coord:${takeFile(ns)}`], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }); } catch { return ""; } };
const coordIds = (ns) => [...coordLedger(ns).matchAll(new RegExp(`^(${ns}-\\d+)\\t`, "gm"))].map((m) => m[1]);
const coordTip = () => git(SANDBOX, "--git-dir", ORIGIN, "rev-parse", "refs/heads/coord");

/* A child process that takes in ONE clone. With a barrier directory, it announces the id its FIRST attempt built and
   waits (bounded) until every party has announced before it pushes — so the collision is set up, not hoped for. */
/* THE TOOL'S PATH IS IN THE SCRIPT, NEVER argv[1] — a receipt. The first draft passed it as argv[1], so the tool's
   main guard (argv[1] is this file) ran the CLI inside every child, in THIS checkout, against its real origin: eight
   takes landed on the REAL coord. `take` now refuses a planted ledger aimed at a network remote (TAKE_REMOTE_NOT_SCRATCH). */
const CHILD = `
const [ns, who, barrier, parties] = process.argv.slice(1);
const names = parties ? parties.split(",") : [];
const { take } = await import(${JSON.stringify(TOOL)});
const { writeFileSync, existsSync } = await import("node:fs");
const first = [];
const r = take(ns, { who, repo: process.cwd(), beforePush: barrier ? ({ attempt, ids, tip }) => {
  if (attempt !== 1) return;
  first.push(...ids);
  writeFileSync(barrier + "/" + who, JSON.stringify({ ids, tip }));
  const until = Date.now() + 15000;
  while (!names.every((n) => existsSync(barrier + "/" + n)) && Date.now() < until) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 20);
} : null });
console.log(JSON.stringify({ ok: r.ok, ids: r.ids || [], lost: r.lost ?? null, reason: r.reason || null, detail: r.detail || null, first }));
`;
const runChild = (clone, ledger, ns, who, barrier = "", parties = "") => new Promise((res) => {
  const kid = spawn(process.execPath, ["--input-type=module", "-e", CHILD, ns, who, barrier, parties],
    { cwd: clone, env: envFor(ledger), stdio: ["ignore", "pipe", "pipe"] });
  let out = "", err = "";
  kid.stdout.on("data", (d) => { out += d; }); kid.stderr.on("data", (d) => { err += d; });
  kid.on("close", (code) => { let j = null; try { j = JSON.parse(out.trim().split("\n").pop()); } catch { /* reported */ }
    res({ code, j, err: err.slice(0, 400), out: out.slice(0, 400) }); });
});
/* `take` runs `git` in the clone it is given, so in-process calls name the clone as the repo. */
const inClone = (clone, ledger, ns, opts = {}) => take(ns, { who: "in-process", repo: clone, env: envFor(ledger), ...opts });

/* ========================================================================== */
section("the fixture: two SEPARATE clones of one scratch origin, an id held only on a land/* tip");
{
  const commonA = git(CLONE_A, "rev-parse", "--absolute-git-dir"), commonB = git(CLONE_B, "rev-parse", "--absolute-git-dir");
  t("the two clones are two different .git directories (the cloud's shape, not two worktrees of one)", commonA !== commonB, true);
  t("...and the scratch origin has main, coord and a land/* tip",
    git(SANDBOX, "--git-dir", ORIGIN, "for-each-ref", "--format=%(refname)").split("\n").sort(),
    ["refs/heads/coord", "refs/heads/land/worker/X", "refs/heads/main"]);
  t("this TREE's C floor is 5 — the land/* id is on no tree a clone has checked out", corpusFloor("C", { repo: CLONE_A }).floor, 5);
}

/* ========================================================================== */
section("THE RACE, SET UP — two clones build a take for the SAME id on the SAME tip, then push");
{
  const barrier = join(SANDBOX, "barrier-1"); mkdirSync(barrier);
  const tip0 = coordTip();
  const [a, b] = await Promise.all([runChild(CLONE_A, ledgerA, "D", "clone-A", barrier, "clone-A,clone-B"), runChild(CLONE_B, ledgerB, "D", "clone-B", barrier, "clone-A,clone-B")]);
  for (const [n, r] of [["A", a], ["B", b]]) if (!r.j) console.log(`  child ${n} exited ${r.code} without a verdict: ${r.err} ${r.out}`);
  const got = [a, b].map((r) => (r.j ? r.j.ids : [])).flat();
  console.log(`  first attempts: A ${JSON.stringify(a.j?.first)} B ${JSON.stringify(b.j?.first)} · given: A ${JSON.stringify(a.j?.ids)} B ${JSON.stringify(b.j?.ids)} · lost: A ${a.j?.lost} B ${b.j?.lost}`);
  const announced = ["clone-A", "clone-B"].filter((f) => existsSync(join(barrier, f))).map((f) => JSON.parse(readFileSync(join(barrier, f), "utf8")));
  t("both children took (exit 0, ok)", [a.code, b.code, a.j?.ok, b.j?.ok], [0, 0, true, true]);
  t("the collision was SET UP: both first attempts built the SAME id on the SAME coord tip",
    [announced.length, new Set(announced.map((x) => x.ids.join())).size, new Set(announced.map((x) => x.tip)).size, announced[0]?.tip === tip0], [2, 1, 1, true]);
  t("two clones minting one namespace at once receive DISTINCT ids", [got.length, new Set(got).size], [2, 2]);
  t("...because exactly ONE lost the compare-and-swap and re-took above the winner", [a.j?.lost, b.j?.lost].sort(), [0, 1]);
  t("...and the ids are above main's D-10 (the floor was read, not restarted)", got.every((id) => Number(id.slice(2)) > 10), true);
  t("the coord ledger on the REMOTE holds each id exactly once (and holds any)", [got.length, coordIds("D").sort()], [2, [...got].sort()]);
}

/* ========================================================================== */
section("the race, UNARRANGED — six takes at once across the two clones");
{
  const kids = [];
  for (let i = 0; i < 3; i++) { kids.push(runChild(CLONE_A, ledgerA, "D", `A${i}`)); kids.push(runChild(CLONE_B, ledgerB, "D", `B${i}`)); }
  const rs = await Promise.all(kids);
  const got = rs.flatMap((r) => (r.j ? r.j.ids : []));
  const lost = rs.reduce((s, r) => s + (r.j?.lost || 0), 0);
  console.log(`  given ${JSON.stringify(got)} · races lost in total ${lost}`);
  for (const r of rs) if (!r.j?.ok) console.log(`  a child did not take (exit ${r.code}): ${r.j ? `${r.j.reason}: ${r.j.detail}` : `${r.err} ${r.out}`}`);
  t("all six took", rs.map((r) => r.j?.ok), [true, true, true, true, true, true]);
  t("six takes at once across two clones receive SIX distinct ids", new Set(got).size, 6);
  t("the coord ledger holds all eight ids taken so far, each once", [coordIds("D").length, new Set(coordIds("D")).size], [8, 8]);
  /* The local ledgers are RECORDS of each clone's takes, disjoint because the takes were. */
  const rec = (l) => held("D", { env: { BIO_IDALLOC_DIR: l } });
  t("each clone's local ledger RECORDS its own takes, and the two records do not overlap",
    [rec(ledgerA).length + rec(ledgerB).length, new Set([...rec(ledgerA), ...rec(ledgerB)]).size], [8, 8]);
}

/* ========================================================================== */
section("the floor covers every land/* tip — an id held only there is not handed out again");
{
  const r = inClone(CLONE_A, ledgerA, "C");
  console.log(`  take C -> ${JSON.stringify(r.ids)} · floors ${JSON.stringify(r.floors)} · reach ${JSON.stringify(r.reach)}`);
  t("an id held ONLY on a land/* tip is not handed out again (C-9 is on land/worker/X, the tree says 5)", r.ids, ["C-10"]);
  t("...and the floor SAYS it came from the landing ref", String(r.floorFrom).includes("land/worker/X"), true);
  t("...and the reach names what was read: main, and one land/* tip", [r.reach?.main, r.reach?.land], [true, 1]);
  const r2 = inClone(CLONE_B, ledgerB, "C", { count: 3 });
  t("OVER-STRICTNESS: a take of three from the OTHER clone is not refused and follows on", r2.ids, ["C-11", "C-12", "C-13"]);
  /* A spelling of the remote this tool did not anticipate first: a file:// URL rather than a remote NAME. */
  const r3 = take("C", { who: "url-spelling", repo: CLONE_A, env: envFor(ledgerA, { BIO_IDTAKE_REMOTE: `file://${ORIGIN}` }) });
  t("OVER-STRICTNESS: the remote spelled as a file:// URL takes too, and follows on", [r3.ok, r3.ids], [true, ["C-14"]]);
  t("the scratch coord carries no private ref and the clone kept none (the take cleans its read refs)",
    [git(CLONE_A, "for-each-ref", "refs/bio-idtake").length, git(CLONE_B, "for-each-ref", "refs/bio-idtake").length], [0, 0]);
}

/* ========================================================================== */
section("a failure that is NOT a race hands out NOTHING — never a local guess");
{
  const before = coordTip();
  /* (a) the remote cannot be reached at all */
  const gone = take("D", { who: "gone", repo: CLONE_A, env: envFor(ledgerA, { BIO_IDTAKE_REMOTE: join(SANDBOX, "no-such-remote.git") }) });
  t("an unreachable remote REFUSES, with no id", [gone.ok, gone.reason, gone.ids], [false, "REMOTE_UNREACHABLE", undefined]);
  t("...and says nothing was taken", /NOTHING WAS TAKEN/.test(gone.detail || ""), true);
  /* (b) the remote refuses the push for a reason of its own (a hook declining — the local stand-in for a 403) */
  const hook = join(ORIGIN, "hooks", "pre-receive");
  writeFileSync(hook, "#!/bin/sh\necho 'declined: this remote refuses every push' >&2\nexit 1\n"); chmodSync(hook, 0o755);
  const recBefore = held("D", { env: { BIO_IDALLOC_DIR: ledgerA } }).length;
  const declined = inClone(CLONE_A, ledgerA, "D");
  rmSync(hook, { force: true });
  console.log(`  declined -> ${declined.reason}: ${String(declined.detail).slice(0, 160)}`);
  t("a push refused for a reason OTHER than a race hands out NOTHING", [declined.ok, declined.reason, declined.ids], [false, "PUSH_FAILED", undefined]);
  t("...the coord did not move and the local ledger recorded nothing",
    [coordTip() === before, held("D", { env: { BIO_IDALLOC_DIR: ledgerA } }).length], [true, recBefore]);
  /* (c) a remote with no coord branch has no writer */
  const bare2 = join(SANDBOX, "nocoord.git"); git(SANDBOX, "init", "-q", "--bare", bare2);
  const none = take("D", { who: "none", repo: CLONE_A, env: envFor(ledgerA, { BIO_IDTAKE_REMOTE: bare2 }) });
  t("a remote with no coord REFUSES NO_WRITER, with no id", [none.ok, none.reason], [false, "NO_WRITER"]);
  /* (d) the fence that keeps a suite off the REAL coord */
  const unnamed = take("D", { who: "unnamed", repo: CLONE_A, env: { ...process.env, BIO_IDALLOC_DIR: ledgerA, BIO_IDTAKE_REMOTE: "" } });
  t("a planted scratch ledger with NO remote named is REFUSED (it would push to the real coord)", [unnamed.ok, unnamed.reason], [false, "TAKE_REMOTE_UNNAMED"]);
  /* (e) THE RECEIPT'S OWN SHAPE: the remote NAMED, but resolved in a repository whose origin is a network remote. */
  const net = join(SANDBOX, "netclone"); git(SANDBOX, "init", "-q", net); git(net, "remote", "add", "origin", "https://example.invalid/bio.git");
  const aimed = take("D", { who: "aimed", repo: net, env: envFor(ledgerA) });
  t("a planted ledger whose remote NAME resolves to a network URL is REFUSED before anything is read", [aimed.ok, aimed.reason], [false, "TAKE_REMOTE_NOT_SCRATCH"]);
}

/* ========================================================================== */
section("through the op: the real CLI, from this repository, against a scratch remote");
{
  const bare = join(SANDBOX, "cli.git"); git(SANDBOX, "init", "-q", "--bare", bare);
  git(SEED, "push", "-q", bare, "coord:refs/heads/coord");
  const led = join(SANDBOX, "ledger-cli");
  const kid = spawnSync(process.execPath, [TOOL, "M0", "--who", "cli-arm"], { cwd: REPO_ROOT, encoding: "utf8",
    env: { ...process.env, BIO_IDALLOC_DIR: led, BIO_IDTAKE_REMOTE: bare } });
  const id = (kid.stdout.match(/^MINTED (M0-\d+)$/m) || [])[1];
  const onCoord = (() => { try { return git(SANDBOX, "--git-dir", bare, "show", `coord:${takeFile("M0")}`); } catch { return ""; } })();
  console.log(`  CLI exited ${kid.status}, minted ${id}`);
  t("the CLI takes (exit 0) and prints MINTED", [kid.status, Boolean(id)], [0, true]);
  t("...and the id is HELD ON THE REMOTE's coord, which is what made it exclusive", Boolean(id) && onCoord.startsWith(`${id}\t`), true);
  t("...and the CLI states the one writer's scope", /exclusive against EVERY allocator that takes through/.test(kid.stdout), true);
  t("...and this repository kept no private read ref", git(REPO_ROOT, "for-each-ref", "refs/bio-idtake"), "");
}

/* ========================================================================== */
section("the coord ledger is well-formed and nothing was written outside it");
{
  const files = git(SANDBOX, "--git-dir", ORIGIN, "ls-tree", "-r", "--name-only", "coord").split("\n").sort();
  t("the takes wrote only ids/<NS>.tsv beside the coord's own files", files, ["docs/development/CLAIMS.md", "ids/C.tsv", "ids/D.tsv"]);
  const lines = coordLedger("D").split("\n").filter((l, i, a) => !(i === a.length - 1 && l === ""));
  console.log(`  ids/D.tsv: ${lines.length} line(s)`);
  t("every ledger line is `<id>\\t<iso>\\t<who>\\t<why>` (and there are the eight)", lines.length === 8 && lines.every((l) => /^D-\d+\t\d{4}-\d\d-\d\dT[^\t]+\t[^\t]*\t[^\t]*$/.test(l)), true);
  t("the coord history is linear — every take a fast-forward, none forced",
    git(SANDBOX, "--git-dir", ORIGIN, "rev-list", "--merges", "--count", "coord"), "0");
}

rmSync(SANDBOX, { recursive: true, force: true });
t(`this suite reached its own FOOT — all ${SECTIONS} sections ran (${reached})`, reached, SECTIONS);
console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
