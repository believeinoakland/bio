/* D-293 WITH M0-98 — THE GATE'S VERDICT, RECORDED BY TREE AND REFUSED AT THE PUSH; AND THE TARGETED
 * CLASS WITH `--since`. One file set (`tools/gates.mjs`, `tools/pushguard.mjs`), one suite, one gate.
 *
 * NEGATIVE CONTROL: RAN 2026-09-21 by the D-293/M0-98 worker, driver `test/gates.control.mjs` (thirteen arms plus
 * a baseline), each arm ALONE against pristine copies restored by sha256 AND `cmp` AND a byte floor; baseline
 * 62 pass / 0 fail, closing 62 / 0, the driver 96 pass / 0 fail (its D-331 preflight refused to arm ANYTHING on
 * an earlier run, when the comment-blind refactor had moved arm 4's anchor — the driver law doing its job) —
 *   (1) the guard's lookup dropped, BOB #22's own control -> "a RED gate then a push of that tree is REFUSED" FAILS
 *       by name, with the amend, other-worktree, narrower-GREEN and GREEN-note arms; an unrecorded, a GREEN, a changed
 *       tree and a GREEN re-run each still push;
 *   (2) the record keyed on the COMMIT, writer and reader alike -> the AMEND arm FAILS, and every arm reading the
 *       record by the tree; the plain RED-then-push refusal HOLDS, same commit, which is why a commit key looks right;
 *   (3) `bio-plane/src/` dropped from FULL -> "a src/ edit BESIDE a tools edit reads FULL" FAILS, and the plane-merge
 *       `--since` arm with it; tools-only still reads TARGETED and every other FULL category still FULL;
 *   (4) selection by import alone -> the COMPUTED-path arm FAILS, with the walker arm; the importer is still selected;
 *   (5) the clean-at-start check removed -> "...and the gate says why" FAILS; the dirty run is still not recorded,
 *       because the end-of-run check backs it — a real redundancy, kept;
 *   (6) the end-of-run check removed -> "a tree that CHANGES while the gate runs is NOT recorded" FAILS;
 *   (7) `--since` ignoring the record -> both fallback arms FAIL; disjoint docs still re-run only plancheck;
 *   (8) both sides read as the SAME FILE changed on both -> "a unit reading BOTH sides re-runs" FAILS;
 *   (9) the register gate dropped -> "selects the register gate (coverage --strict)" FAILS;
 *   (10) the last run's verdict wins -> "a NARROWER GREEN does not clear a WIDER RED" FAILS, with the guard's own
 *       in-process control; a GREEN re-run still clears and a lone RED still refuses;
 *   (11) a change made after the gate read as the other side's -> "a commit made AFTER the gate is re-checked"
 *       FAILS; disjoint docs and both-sides hold;
 *   (12) an imported helper read WITH its comments -> the helper-COMMENT arm FAILS (the suite is selected over a
 *       path its helper only cites in prose); the helper-CODE arm holds;
 *   (13) the other side's prose read unbounded by DOCS in a `--since` pairing -> the CITES arm FAILS (a suite
 *       that only names the moved note in its own prose re-runs); the doc-facing reader still re-runs.
 * THE ELEVENTH ARM EXISTS BECAUSE THE FIRST `--since` WAS UNSOUND, found while measuring this item's own landing:
 * it read EVERY difference from the measured tree as the other side's already-gated change, so a commit added
 * on top of a GREEN tree re-ran nothing of its own. The difference the other side does not explain is now
 * re-checked as TARGETED would; the bases are taken against `origin/main`, never against HEAD.
 * TWO ARMS FOUND DEFECTS IN THIS SUITE BEFORE THOSE FIGURES, both fixed and both said at their sites: the first
 * run of arm 1 left the amend arm GREEN because the amended push failed as a NON-FAST-FORWARD over the pre-amend
 * commit the broken guard had let land — so every refusal is now read from the guard's own text and pushed to a
 * ref of its own; and the first run of arm 4 broke the mid-run arm through SELECTION (no suite selected, so the
 * dirtying battery step never ran), so that arm now runs `--full`.
 * RE-RUN 2026-09-22 by the M0-99 worker, after the fixture stopped copying `decided.mjs` and regenerating the index
 * before each commit: all thirteen as declared again, driver 96 pass / 0 fail, baseline and closing 62 / 0.
 *
 * WHY THIS SUITE DRIVES A FIXTURE AND NEVER THIS REPOSITORY. `gates.mjs` is every lane's gate and
 * `pushguard.mjs` runs on every lane's push; a refusal arranged against this repository's remote
 * would be a real refusal of a real push. So every arm builds a REAL repository under the battery's
 * own temp ground — the REAL `gates.mjs` and `pushguard.mjs` copied in (and, until M0-99, `decided.mjs`), the REAL hook
 * installed the way `plancheck` installs it, a REAL bare remote — and stubs only the four gates the
 * gate RUNS (battery, coverage, the UI harness, plancheck), each of which logs what it was asked to
 * run and exits as the arm tells it. The verdict, the record, the refusal and the selection are the
 * real code; only the suites a gate would execute are stand-ins.
 *
 * HOW A LIAR PASSES THIS, STATED BEFORE WHAT IT CHECKS:
 *   - D-293's: keying the record on the COMMIT. An amend of the message alone makes a new commit over
 *     the same tree; a commit-keyed record reads it as never measured. So an arm AMENDS and asserts the
 *     refusal holds, and another asserts the key is `HEAD^{tree}` read by this suite, not the module.
 *   - M0-98's: selecting by exact IMPORT alone, which misses a suite reading its tool through a
 *     COMPUTED path. So the fixture carries one (`join(REPO, "tools", NAME + ".mjs")`) and an arm
 *     asserts it is selected.
 *   - `--since`'s: re-running only suites that read a file changed on both sides (the intersection of
 *     the two FILE sets). A tool moved on one side and its suite on the other shares no file, and that
 *     pairing was never measured anywhere. So an arm asserts the suite re-runs.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, appendFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { install, hooksDir, readRuns, effectiveVerdict, recordDir } from "../../tools/pushguard.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const REPO = join(DIR, "../..");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
/* The FOOT sentinel (`mintid.test.mjs`'s): a TypeError inside an assertion ends the module while the
   tally still reads clean, so every section bumps this and the last assertion requires all of them. */
const SECTIONS = 6;
let reached = 0;
const section = (name) => { reached++; console.log(`\n--- ${name} ---`); };

const SANDBOX = mkdtempSync(join(tmpdir(), "gates-"));
const LOG = join(SANDBOX, "stub.log");
const ID = ["-c", "user.email=d293@example.invalid", "-c", "user.name=D-293 suite"];
const git = (args, cwd) => spawnSync("git", args, { cwd, encoding: "utf8" });
const out1 = (args, cwd) => git(args, cwd).stdout.trim();

/* ------------------------------------------------------------------ the fixture
 *
 * The stubs: each logs `<name> <argv>` to GATES_FIXTURE_LOG and exits 1 when its name is in
 * GATES_FIXTURE_FAIL. The battery stub, told GATES_FIXTURE_DIRTY=<repo-relative path>, writes that
 * TRACKED file mid-run — the tree changing under a running gate. The path arrives by environment so
 * no stub's SOURCE names a fixture file: a stub that did would read, to MENTION, as a unit reading it. */
const stub = (name) => [
  `import { appendFileSync, writeFileSync } from "node:fs";`,
  `const name = ${JSON.stringify(name)};`,
  `if (process.env.GATES_FIXTURE_LOG) appendFileSync(process.env.GATES_FIXTURE_LOG, name + " " + process.argv.slice(2).join(" ") + "\\n");`,
  `if (name === "battery" && process.env.GATES_FIXTURE_DIRTY) writeFileSync(new URL("../../" + process.env.GATES_FIXTURE_DIRTY, import.meta.url), "dirtied mid-run\\n");`,
  `process.exit(String(process.env.GATES_FIXTURE_FAIL || "").split(",").includes(name) ? 1 : 0);`,
  "",
].join("\n");

const FILES = {
  "tools/plancheck.mjs": stub("plancheck"),
  "tools/widget.mjs": "export const widget = () => 1;\n",
  "tools/computed.mjs": "export const computed = () => 2;\n",
  "tools/lonely.mjs": "export const lonely = () => 3;\n",
  "bio-plane/package.json": `${JSON.stringify({ name: "fixture-plane", private: true, type: "module",
    scripts: { "test:battery": "node scripts/battery.mjs" } }, null, 1)}\n`,
  "bio-plane/scripts/battery.mjs": stub("battery"),
  "bio-plane/scripts/coverage.mjs": stub("coverage"),
  "bio-plane/src/index.mjs": `import { registry } from "../../docprofile/registry.mjs";\nexport default { registry };\n`,
  "bio-plane/src/store.mjs": "export const store = 1;\n",
  "bio-plane/checks/checks.mjs": "export const checks = [];\n",
  /* the IMPORTER of tools/widget.mjs */
  "bio-plane/test/widget.test.mjs": `import { widget } from "../../tools/widget.mjs";\nprocess.exit(widget() === 1 ? 0 : 1);\n`,
  /* a suite reading its tool through a COMPUTED path — no import edge names it */
  "bio-plane/test/computed.test.mjs": [
    `import { join, dirname } from "node:path";`,
    `import { fileURLToPath } from "node:url";`,
    `const REPO = join(dirname(fileURLToPath(import.meta.url)), "../..");`,
    `const NAME = "computed";`,
    `const mod = await import(join(REPO, "tools", NAME + ".mjs"));`,
    `process.exit(mod.computed() === 2 ? 0 : 1);`, ""].join("\n"),
  /* a suite that WALKS tools/ */
  "bio-plane/test/walker.test.mjs": [
    `import { readdirSync } from "node:fs";`,
    `import { join, dirname } from "node:path";`,
    `import { fileURLToPath } from "node:url";`,
    `const REPO = join(dirname(fileURLToPath(import.meta.url)), "../..");`,
    `process.exit(readdirSync(join(REPO, "tools")).length > 0 ? 0 : 1);`, ""].join("\n"),
  /* a doc-facing suite */
  "bio-plane/test/prose.test.mjs": `// reads docs/notes/a.md\nprocess.exit(0);\n`,
  /* a suite whose own prose CITES a note by its bare name and reads no prose at all — NOT doc-facing */
  "bio-plane/test/cites.test.mjs": `// the a.md note explains this suite's shape; the suite reads nothing\nprocess.exit(0);\n`,
  /* two suites through a shared HELPER: one helper names a tool only in a COMMENT, the other in CODE */
  "bio-plane/test/helper-prose.mjs": `/* this helper's prose cites tools/lonely.mjs and reads nothing */\nexport const h = 1;\n`,
  "bio-plane/test/helped.test.mjs": `import { h } from "./helper-prose.mjs";\nprocess.exit(h === 1 ? 0 : 1);\n`,
  "bio-plane/test/helper-code.mjs": `export const TOOL = "tools/computed.mjs";\n`,
  "bio-plane/test/helped2.test.mjs": `import { TOOL } from "./helper-code.mjs";\nprocess.exit(TOOL ? 0 : 1);\n`,
  "bio-plane/test/unrelated.test.mjs": "process.exit(0);\n",
  "civicos-ui/test/run.mjs": stub("ui-harness"),
  "civicos-ui/test/uiwidget.test.mjs": `// drives tools/widget.mjs from the UI side\n${stub("ui-uiwidget")}`,
  "civicos-ui/app.html": "<!doctype html>\n",
  "pdf-worker/fleet-member.json": `${JSON.stringify({ name: "pdf-worker", entry: "src/index.mjs", testDir: "test" })}\n`,
  "pdf-worker/src/index.mjs": "export default {};\n",
  "pdf-worker/test/member.test.mjs": "process.exit(0);\n",
  "newgroup/src/index.mjs": "export default {};\n",
  "docprofile/registry.mjs": "export const registry = 1;\n",
  "docs/notes/a.md": "# a\n",
  "docs/notes/b.md": "# b\n",
  "CLAUDE.md": "# fixture\n",
  ".gitignore": "node_modules/\n",
};
const put = (root, rel, body) => { mkdirSync(dirname(join(root, rel)), { recursive: true }); writeFileSync(join(root, rel), body); };
/* CORRECTED 2026-09-22 (M0-99), never exempted. Every commit here used to regenerate `docs/DECIDED.md`
   first and commit it, so the guard's index arm was never the refusal an arm saw; and the fixture carried
   the REAL `decided.mjs` for that step. M0-99 retired that arm and took the index out of every commit, so
   the regeneration guarded against a refusal that no longer exists — and committing the index in a
   fixture would model the very shape M0-99 removed. Both go: the fixture carries the two tools it tests. */
const commitAll = (root, msg) => { git(["add", "-A"], root); return git([...ID, "commit", "-q", "-m", msg], root); };

function fixture(name) {
  const root = join(SANDBOX, name);
  for (const f of ["gates.mjs", "pushguard.mjs"]) put(root, `tools/${f}`, readFileSync(join(REPO, "tools", f)));
  /* the estate's ONE lexer, which the gate reads imported files through, and what it imports */
  for (const f of ["walkfloor.mjs", "provenance.mjs", "walkfigure.mjs"])
    put(root, `bio-plane/scripts/${f}`, readFileSync(join(REPO, "bio-plane/scripts", f)));
  for (const [rel, body] of Object.entries(FILES)) put(root, rel, body);
  git(["init", "-q", "-b", "main"], root);
  commitAll(root, "base");
  const remote = join(SANDBOX, `${name}-remote.git`);
  git(["init", "-q", "--bare", remote], SANDBOX);
  git(["remote", "add", "origin", remote], root);
  install({ repo: root });
  git(["push", "-q", "origin", "main"], root);
  git(["fetch", "-q", "origin"], root);
  return { root, remote };
}

const gates = (root, args = [], env = {}) => {
  writeFileSync(LOG, "");
  const r = spawnSync(process.execPath, [join(root, "tools/gates.mjs"), ...args],
    { cwd: root, encoding: "utf8", env: { ...process.env, GATES_FIXTURE_LOG: LOG, ...env } });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  return { status: r.status, out,
           cls: (out.match(/^gates: change class (\w+)/m) || [])[1] || null,
           plan: (out.match(/^gates: plan — (.*)$/m) || [])[1] || null,
           units: [...out.matchAll(/^gates: {3}(\S+) {2}<- /gm)].map((m) => m[1]),
           ran: readFileSync(LOG, "utf8").split("\n").filter(Boolean) };
};
const push = (root, spec) => { const r = git(["push", "origin", spec], root); return { status: r.status, err: `${r.stdout}${r.stderr}` }; };
/* REFUSED BY THE GATE RECORD, not merely refused: a push can fail for a reason that is not the
   guard at all — a non-fast-forward, say — and an assertion reading only the exit status passes
   over it. Found by G1's first run: with the lookup dropped, the amend arm still "held", because
   the amended commit was a non-fast-forward over the pre-amend one the broken guard had let land. */
const refusedByGate = (p) => p.status !== 0 && p.err.includes("THE GATE RECORDED THIS TREE RED (D-293)");
const onRemote = (remote, ref) => out1(["rev-parse", "--verify", "--quiet", `refs/heads/${ref}`], remote);
const treeAt = (root, rev = "HEAD") => out1(["rev-parse", `${rev}^{tree}`], root);
const runsFor = (root, tree) => readRuns({ repo: root, tree }).runs;
const branch = (root, b, from = "origin/main") => git(["checkout", "-q", "-B", b, from], root);
/* Uncommitted edits for an --explain arm, restored after it (the fixture is this suite's own). */
function withEdits(root, rels, fn) {
  for (const rel of rels) {
    if (existsSync(join(root, rel))) appendFileSync(join(root, rel), rel.endsWith(".json") ? " " : "\n// edited by an arm\n");
    else put(root, rel, "created by an arm\n");
  }
  try { return fn(); } finally { git(["checkout", "-q", "--", "."], root); git(["clean", "-qfd"], root); }
}
const planOf = (g) => (g.plan || "").split(" · ");
const batteryOf = (g) => ((g.plan || "").match(/battery \[([^\]]*)\]/) || [, ""])[1].split(", ").filter(Boolean).sort();

/* ========================================================================== */
section("THE FIXTURE — a real repository, the real tools, a real remote, the real hook");
const F = fixture("main-fx");
{
  t("the fixture carries the REAL gates.mjs and pushguard.mjs",
    ["gates.mjs", "pushguard.mjs"].every((f) =>
      readFileSync(join(F.root, "tools", f)).equals(readFileSync(join(REPO, "tools", f)))), true);
  t("the fixture's origin/main exists, so the gate measures a real diff",
    out1(["rev-parse", "--verify", "--quiet", "origin/main"], F.root).length, 40);
  t("the hook is installed where git reads hooks", existsSync(join(hooksDir({ repo: F.root }).dir, "pre-push")), true);
  t("the fixture starts CLEAN", out1(["status", "--porcelain"], F.root), "");
}

/* ========================================================================== */
section("D-293 · THE RECORD — keyed by the TREE, written only for a CLEAN tree");
{
  branch(F.root, "g1");
  appendFileSync(join(F.root, "tools/lonely.mjs"), "// a committed change\n");
  commitAll(F.root, "g1: a tools change");
  const tree = out1(["rev-parse", "HEAD^{tree}"], F.root);
  const g = gates(F.root);
  t("a CLEAN run exits GREEN", g.status, 0);
  const runs = runsFor(F.root, tree);
  t("a CLEAN run is RECORDED, keyed by HEAD's tree", [runs.length, runs[0] && runs[0].tree], [1, tree]);
  t("...with its verdict, its class and every step's units",
    [runs[0] && runs[0].verdict, runs[0] && runs[0].class,
     !!(runs[0] && runs[0].steps.some((s) => s.label === "plancheck --local" && s.ok && s.units[0] === "plancheck"))],
    ["GREEN", "TARGETED", true]);
  t("...and the record lives in the git COMMON dir, not the working tree",
    [!!runs[0] && runs[0].file.startsWith(recordDir({ repo: F.root })), out1(["status", "--porcelain"], F.root)], [true, ""]);
  t("...and the gate SAYS it recorded", g.out.includes(`RECORDED GREEN for tree ${tree.slice(0, 8)}`), true);

  const ex = gates(F.root, ["--explain"]);
  t("--explain records nothing", [ex.status, runsFor(F.root, tree).length], [0, 1]);

  appendFileSync(join(F.root, "tools/lonely.mjs"), "// uncommitted\n");
  const dirty = gates(F.root);
  t("a DIRTY tree is NOT recorded", runsFor(F.root, tree).length, 1);
  t("...and the gate says why", dirty.out.includes("NOT RECORDED — the tree was not clean"), true);
  git(["checkout", "-q", "--", "."], F.root);

  /* --full, so the battery step that dirties the tree RUNS whatever the selection rule says: this arm
     is about the record, and must not move when an arm moves selection (found by G4's first run). */
  const mid = gates(F.root, ["--full"], { GATES_FIXTURE_DIRTY: "docs/notes/a.md" });
  t("a tree that CHANGES while the gate runs is NOT recorded", runsFor(F.root, tree).length, 1);
  t("...and it says the run measured a tree that never existed", mid.out.includes("measured a tree that never existed"), true);
  git(["checkout", "-q", "--", "."], F.root);
}

/* ========================================================================== */
section("D-293 · THE REFUSAL — a RED record refuses the push of that tree, by name");
{
  branch(F.root, "red");
  appendFileSync(join(F.root, "tools/widget.mjs"), "// red change\n");
  commitAll(F.root, "red: a change the gate measures RED");
  const c1 = out1(["rev-parse", "HEAD"], F.root);
  const tree = treeAt(F.root);
  const g = gates(F.root, [], { GATES_FIXTURE_FAIL: "battery" });
  t("the gate is RED and RECORDS it", [g.status, g.out.includes(`RECORDED RED for tree ${tree.slice(0, 8)}`)], [1, true]);

  const p1 = push(F.root, "red");
  t("a RED gate then a push of that tree is REFUSED", refusedByGate(p1), true);
  t("...naming the record: the verdict, the tree and D-293",
    [p1.err.includes("THE GATE RECORDED THIS TREE RED (D-293)"), p1.err.includes(`tree ${tree.slice(0, 8)}`)], [true, true]);
  t("...and the RED bytes did NOT reach the remote", onRemote(F.remote, "red"), "");

  git([...ID, "commit", "-q", "--amend", "-m", "red: reworded, the same tree"], F.root);
  const c2 = out1(["rev-parse", "HEAD"], F.root);
  t("the amend made a NEW commit over the SAME tree", [c2 !== c1, treeAt(F.root) === tree], [true, true]);
  /* A ref of its own, so nothing but the guard can refuse it. */
  const p2 = push(F.root, "red:refs/heads/red-amended");
  t("AN AMEND OF THE MESSAGE ALONE does not clear the refusal (the key is the tree)", refusedByGate(p2), true);

  /* The record lives in the COMMON dir, so every worktree of the clone reads it. */
  const other = join(SANDBOX, "main-fx-second-worktree");
  git(["worktree", "add", "-q", "--detach", other, "red"], F.root);
  const p3 = push(other, "HEAD:refs/heads/red-elsewhere");
  t("a tree gated RED in one worktree is refused from ANOTHER worktree of the clone", refusedByGate(p3), true);

  const again = gates(F.root);
  t("the same tree re-gated GREEN (a flaky suite, say) records GREEN", again.status, 0);
  /* A ref of its own, so this arm cannot fail on a non-fast-forward when a control has let an
     earlier push of the pre-amend commit through (found by G1's first run). */
  t("a GREEN re-run of what failed, on the same tree, CLEARS it", push(F.root, "red:refs/heads/red-cleared").status, 0);
  t("...and the ref landed", onRemote(F.remote, "red-cleared"), c2);

  branch(F.root, "wide");
  appendFileSync(join(F.root, "tools/widget.mjs"), "// wide change\n");
  commitAll(F.root, "wide");
  const w1 = gates(F.root, ["--full"], { GATES_FIXTURE_FAIL: "battery" });
  const w2 = gates(F.root);
  t("the wide tree is RED under FULL, then GREEN under TARGETED", [w1.cls, w1.status, w2.cls, w2.status], ["FULL", 1, "TARGETED", 0]);
  t("a NARROWER GREEN does not clear a WIDER RED", refusedByGate(push(F.root, "wide")), true);
  appendFileSync(join(F.root, "tools/widget.mjs"), "// and fixed\n");
  commitAll(F.root, "wide: fixed");
  t("a CHANGED tree after a RED pushes (no verdict is recorded for it)", push(F.root, "wide").status, 0);

  branch(F.root, "fresh");
  appendFileSync(join(F.root, "tools/lonely.mjs"), "// never gated\n");
  commitAll(F.root, "fresh: never gated");
  const pf = push(F.root, "fresh");
  t("an UNRECORDED tree pushes", pf.status, 0);
  t("...and the guard SAYS NOTHING about a gate verdict it does not have",
    [pf.err.includes("gate verdict"), pf.err.includes("GATE RECORDED")], [false, false]);

  branch(F.root, "green");
  appendFileSync(join(F.root, "tools/computed.mjs"), "// gated green\n");
  commitAll(F.root, "green");
  gates(F.root);
  const pg = push(F.root, "green");
  t("a GREEN tree pushes", pg.status, 0);
  t("...and the guard says the GREEN record it read", pg.err.includes("gate verdict GREEN recorded"), true);

  t("a DELETION is never refused by a record", push(F.root, ":refs/heads/wide").status, 0);

  const ctl = spawnSync(process.execPath, [join(REPO, "tools/pushguard.mjs"), "--control"], { cwd: REPO, encoding: "utf8" });
  t("the guard's own in-process control passes, its D-293 verdict arms included",
    [ctl.status, (ctl.stdout || "").includes("a NARROWER GREEN cannot clear a WIDER failure")], [0, true]);
}

/* ========================================================================== */
section("M0-98 · THE CLASS — TARGETED by MENTION, and what stays FULL");
{
  branch(F.root, "classes");
  const tools = withEdits(F.root, ["tools/widget.mjs"], () => gates(F.root, ["--explain"]));
  t("a tools-only diff reads TARGETED", tools.cls, "TARGETED");
  t("...and selects its IMPORTER", tools.units.includes("plane:widget.test.mjs"), true);
  t("...and the suite that WALKS tools/", tools.units.includes("plane:walker.test.mjs"), true);
  t("...and a UI suite that names the tool", tools.units.includes("ui:uiwidget.test.mjs"), true);
  t("...and NOT a suite that reads none of it",
    ["plane:unrelated.test.mjs", "plane:computed.test.mjs", "plane:prose.test.mjs", "fleet:pdf-worker/member.test.mjs"]
      .filter((u) => tools.units.includes(u)), []);
  t("...and runs no coverage when no test file changed", planOf(tools).includes("coverage --strict"), false);
  t("...and its plan names exactly what the battery runs", batteryOf(tools), ["walker.test.mjs", "widget.test.mjs"]);

  const withSuite = withEdits(F.root, ["tools/widget.mjs", "bio-plane/test/widget.test.mjs"], () => gates(F.root, ["--explain"]));
  t("a tools diff WITH its suite selects the register gate (coverage --strict)",
    [withSuite.cls, planOf(withSuite).includes("coverage --strict")], ["TARGETED", true]);

  const computed = withEdits(F.root, ["tools/computed.mjs"], () => gates(F.root, ["--explain"]));
  t("SELECTION IS BY MENTION: a suite reading its tool through a COMPUTED path is selected",
    computed.units.includes("plane:computed.test.mjs"), true);
  t("...and a suite whose imported HELPER names the tool in CODE is selected",
    computed.units.includes("plane:helped2.test.mjs"), true);
  const lonely = withEdits(F.root, ["tools/lonely.mjs"], () => gates(F.root, ["--explain"]));
  t("a path named only in the COMMENT of a helper a suite imports does NOT select that suite",
    [lonely.cls, lonely.units.includes("plane:helped.test.mjs")], ["TARGETED", false]);
  t("...because the estate's lexer read that helper as code, and the plan says so",
    lonely.out.includes("read as code, comments blanked"), true);

  const both = withEdits(F.root, ["bio-plane/src/store.mjs", "tools/widget.mjs"], () => gates(F.root, ["--explain"]));
  t("a src/ edit BESIDE a tools edit reads FULL", [both.cls, planOf(both)[0]], ["FULL", "battery (all)"]);

  const docs = withEdits(F.root, ["docs/notes/a.md"], () => gates(F.root, ["--explain"]));
  t("a docs-only diff still reads DOCS", docs.cls, "DOCS");

  const cats = {};
  for (const rel of ["civicos-ui/app.html", "pdf-worker/src/index.mjs", "newgroup/src/index.mjs", "bio-plane/package.json",
                     ".gitignore", "docprofile/registry.mjs"])
    cats[rel] = withEdits(F.root, [rel], () => gates(F.root, ["--explain"])).cls;
  t("every FULL category still reads FULL: the UI, a fleet member, the installer, a package file, a root dotfile, code the plane imports",
    Object.values(cats), ["FULL", "FULL", "FULL", "FULL", "FULL", "FULL"]);

  const om = out1(["rev-parse", "origin/main"], F.root);
  git(["update-ref", "-d", "refs/remotes/origin/main"], F.root);
  const noBase = withEdits(F.root, ["docs/notes/a.md"], () => gates(F.root, ["--explain"]));
  git(["update-ref", "refs/remotes/origin/main", om], F.root);
  t("no merge-base with origin/main reads FULL, never DOCS", noBase.cls, "FULL");
}

/* ========================================================================== */
section("M0-98 · --since — after a rebase, only what BOTH sides touched, plus plancheck");
{
  /* The other side moves: a commit on main, pushed, and fetched — `origin/main` moves as it does. */
  const upstream = (rel, text) => {
    branch(F.root, "main", "origin/main");
    appendFileSync(join(F.root, rel), text);
    commitAll(F.root, `upstream: ${rel}`);
    git(["push", "-q", "origin", "main"], F.root);
    git(["fetch", "-q", "origin"], F.root);
  };
  const mine = (b, rel, env = {}, gate = true) => {
    branch(F.root, b);
    appendFileSync(join(F.root, rel), `// ${b}\n`);
    commitAll(F.root, `${b}: my side`);
    return gate ? gates(F.root, [], env) : null;
  };
  const rebase = (b) => { git(["checkout", "-q", b], F.root); return git([...ID, "rebase", "-q", "origin/main"], F.root).status; };

  mine("since-docs", "tools/widget.mjs");
  upstream("docs/notes/b.md", "moved upstream\n");
  t("the rebase over the docs commit is clean", rebase("since-docs"), 0);
  const d = gates(F.root, ["--since", "--explain"]);
  t("a rebase over DISJOINT docs commits re-runs ONLY plancheck", [d.cls, d.plan], ["SINCE", "plancheck --local"]);
  const dRun = gates(F.root, ["--since"]);
  const newTree = treeAt(F.root);
  t("...and the --since run is GREEN and RECORDS the new tree",
    [dRun.status, runsFor(F.root, newTree).map((r) => r.class)], [0, ["SINCE"]]);

  /* A commit made AFTER the gate, with no rebase at all: it differs from the measured tree, the other
     side does not explain it, and nobody measured it — so it must be re-checked, never read as the
     other side's already-gated change. */
  mine("since-after", "tools/widget.mjs");
  const measured = out1(["rev-parse", "HEAD"], F.root);
  appendFileSync(join(F.root, "tools/computed.mjs"), "// a commit made after the gate\n");
  commitAll(F.root, "since-after: a commit on top of the measured tree");
  const af = gates(F.root, ["--since", measured, "--explain"]);
  t("a commit made AFTER the gate is re-checked as TARGETED would, never assumed measured",
    [af.cls, af.units.includes("plane:computed.test.mjs")], ["SINCE", true]);

  mine("since-both", "tools/widget.mjs");
  upstream("bio-plane/test/widget.test.mjs", "// the suite moved upstream\n");
  rebase("since-both");
  const b = gates(F.root, ["--since", "--explain"]);
  t("a unit reading BOTH sides re-runs, though no single file changed on both", b.units.includes("plane:widget.test.mjs"), true);
  t("...and a unit reading only ONE side does not", b.units.includes("ui:uiwidget.test.mjs"), false);

  mine("since-unrec", "tools/widget.mjs", {}, false);
  upstream("docs/notes/b.md", "moved again\n");
  rebase("since-unrec");
  const u = gates(F.root, ["--since", "--explain"]);
  t("--since over an UNRECORDED tree falls back to the ordinary class, and says so",
    [u.out.includes("cannot narrow — no verdict is recorded"), u.cls], [true, "TARGETED"]);

  mine("since-red", "tools/widget.mjs", { GATES_FIXTURE_FAIL: "battery" });
  upstream("docs/notes/b.md", "and again\n");
  rebase("since-red");
  const r = gates(F.root, ["--since", "--explain"]);
  t("--since over a RED tree falls back, and says so", [r.out.includes("is recorded RED"), r.cls], [true, "TARGETED"]);

  mine("since-plane", "bio-plane/src/store.mjs");
  upstream("docs/notes/a.md", "the prose a suite reads moved\n");
  rebase("since-plane");
  const pl = gates(F.root, ["--since", "--explain"]);
  t("a plane change gated FULL, rebased over docs, re-runs the READERS of those docs, not the battery",
    [pl.cls, pl.units.includes("plane:prose.test.mjs")], ["SINCE", true]);
  t("...and NOT a suite that only CITES the moved note in its own prose — the other side's prose is bounded by DOCS",
    [pl.units.includes("plane:cites.test.mjs"), batteryOf(pl)], [false, ["prose.test.mjs"]]);
}

/* ========================================================================== */
section("THE VERDICT RULE, driven over the module the guard imports");
{
  /* The record the gate wrote above, read back through the SAME functions the guard calls. */
  const tree = treeAt(F.root, "green");
  const eff = effectiveVerdict(runsFor(F.root, tree));
  t("the GREEN tree's record reads GREEN through the guard's own verdict rule", eff.verdict, "GREEN");
  t("a tree with no run reads NO verdict — not GREEN", effectiveVerdict(runsFor(F.root, "0".repeat(40))).verdict, null);
}

/* ========================================================================== */
t(`FOOT — all ${SECTIONS} sections reached (a section that dies silently cannot leave a green count)`, reached, SECTIONS);
console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
