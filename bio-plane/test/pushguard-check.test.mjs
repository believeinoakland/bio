/* M0-114 — THE GATE'S VERDICT AS A CHECK ON THE COMMIT, READ BY THE PUSH GUARD.
 *
 * The subject is the check-reading arm of `tools/pushguard.mjs` (`parseVerdictAnnotation`,
 * `githubSlug`, `githubGet`, `githubCheckVerdict`, `checkVerdicts`, `checkRefusal`, and its one call
 * site in the hook body) and the writer it reads, `.github/workflows/gates.yml`. A local gate record
 * lives in one clone's git directory (D-293), so no other session can read it and a cloud session
 * starts with none (TREE-SHARING.md §3 as revised by §4); the workflow runs the gate on GitHub's
 * machines and leaves the verdict on the commit, as the `gate` check run's `gate verdict` annotation.
 *
 * HOW A LIAR PASSES THIS SUITE, STATED BEFORE WHAT IT CHECKS. A guard that never refuses passes
 * every "pushes" arm; one that refuses every failed check passes the RED arm. So the RED refusal is
 * read from the guard's OWN text and from the REMOTE (the ref did not land), and it is paired in the
 * same fixture with a FAILED check that carries no verdict (a job that died before the gate
 * recorded), which must PUSH. The writer and the reader are held to one grammar by building the
 * annotation FROM THE WORKFLOW'S OWN TEXT, never from a copy typed here.
 *
 * TRANSPORT. The end-to-end arms drive a REAL push through the REAL hook, with `BIO_GITHUB_API`
 * naming a `file://` fixture laid out as the API's paths, so `curl` — the transport the hook uses
 * against GitHub — reads it. What this cannot see: GitHub's own API answering (driven LIVE by the
 * M0-114 worker against run 35799183380's check, recorded in MEASUREMENTS.md), and the proxy.
 *
 * NEGATIVE CONTROL: break `tools/pushguard.mjs` one arm at a time, each ALONE, restored by sha256 —
 *   (1) `githubCheckVerdict` never sets `refuse` -> "A RED CHECK IS REFUSED" FAILS (the decision-table RED arm with it)
 *   (2) the tree comparison removed -> "a verdict for ANOTHER tree is UNDETERMINED" FAILS
 *   (3) a failed check with no verdict annotation read as RED -> "A FAILED JOB THAT RECORDED NOTHING PUSHES" FAILS
 *   (4) the call site in the hook body removed -> "A RED CHECK IS REFUSED" FAILS, and the GREEN note with it
 *   RUN 2026-09-22 by the M0-114 worker, all four AS DECLARED, and RE-RUN after the HTTP 422 arm changed the subject: baseline 40 pass / 0 fail; every anchor preflighted at
 *   exactly one match; failing counts per arm 5, 1, 3, 7 (arm (3) also fails "...did NOT reach the remote", because the
 *   no-verdict commit it refused never landed); every restore of `tools/pushguard.mjs` sha256 MATCH at 77,450 B;
 *   closing 40 / 0 (the first run, before that arm: 39 / 0, the same per-arm counts, at 77,111 B).
 *   (5) the workflow's `set +e` removed -> "the gate step turns OFF errexit" FAILS. RUN 2026-09-23 by the M0-114 worker:
 *   its FIRST run was a SURPRISING GREEN (41 / 0) — the assertion matched the step's own comment naming `set +e`; comment
 *   lines are now stripped, and the re-run read 40 pass / 1 fail at exactly that assertion; restore sha256 MATCH, cmp SAME
 *   at 5,026 B; closing 41 / 0.
 *   THE LIVE CONTROL (the row's own): break one suite on a branch and the check must read red at it. Its FIRST run
 *   (`m0114-negctl` @ c36c38c2, run 35799828324) FOUND A DEFECT IN THE WRITER: Actions runs a step as `bash -e`, so the RED
 *   gate killed the step before the annotation, and the guard read UNDETERMINED (the safe direction: not refused, not
 *   GREEN). The workflow now sets `set +e`; the re-run's result is in MEASUREMENTS.md M-104.
 *   M0-127, RUN 2026-09-23 (the writer moved to `tools/gateverdict.mjs`; the first section's arms were CORRECTED to drive
 *   it, dated at the site): baseline 49 pass / 0 fail; each arm ALONE, restored by sha256 AND `cmp` —
 *   (6) `parseVerdictAnnotation` gives every cause the kind `suite` -> 48 / 1, exactly "M0-127: each cause parses to its
 *   kind"; restore MATCH 1adee7b7…, 89,717 B. (7) the workflow's `node tools/gateverdict.mjs …` line replaced by `true`
 *   -> 48 / 1, exactly "the workflow RUNS the writer and writes no annotation of its own"; restore MATCH 26a46f6a…,
 *   4,680 B. Closing 49 / 0. The liar (RED with FAILED=none) is driven in `gateverdict.test.mjs`'s control.
 * NEGATIVE CONTROL (M0-170, RUN 2026-09-24 — the e2e section's carried modules DERIVED), driven by the M0-170 worker's scratchpad driver: a probe module `m0170probe.mjs` created beside the subject and `import "./m0170probe.mjs";` added to it, each arm ALONE, every touched file restored by sha256 AND `cmp` (all MATCH), probe removed.
 *   Baseline 49 / 0. (A2) the import in `tools/pushguard.mjs` -> 49 / 0, AS DECLARED. (B2) the same import with the OLD
 *   copy of the guard alone restored -> 42 / 7, first "NO CHECK: the push lands and the guard SAYS there is none".
 */
import { statedJSON } from "./stated.mjs";
import "./stdio.mjs";                 /* D-282 */
import "./sandbox.mjs";
import { mkdtempSync, writeFileSync, readFileSync, mkdirSync, cpSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import * as guard from "../../tools/pushguard.mjs";
import { moduleClosure } from "./moduleclosure.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const REPO = join(DIR, "../..");
const WORKFLOW = join(REPO, ".github/workflows/gates.yml");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};
const SECTIONS = 5;
let reached = 0;
const section = (name) => { reached++; console.log(`\n--- ${name} ---`); };

const SANDBOX = mkdtempSync(join(tmpdir(), "pushguard-check-"));
const git = (args, cwd, env) => spawnSync("git", args, { cwd, encoding: "utf8", env: env ? { ...process.env, ...env } : process.env });
const T1 = "1".repeat(40), T2 = "2".repeat(40), SHA = "a".repeat(40);

/* ========================================================================== */
section("THE WRITER AND THE READER SPEAK ONE GRAMMAR — the annotation is built from the workflow's own text");
const wf = readFileSync(WORKFLOW, "utf8");
/* CORRECTED 2026-09-23 by M0-127, never exempted. These arms read the annotation TEMPLATE out of the workflow's shell
   (`echo "::notice title=…::VERDICT=${verdict} … FAILED=${failed:-none}"`) and filled it. That writer took FAILED= from
   the battery's `  FAILED:` line alone, so the GitHub run on tree 6ef503c4 — RED on D-186's residue check with 282/282
   suites green — read `FAILED=none`, and these arms passed over it: a template filled with a suite list cannot show what
   the writer does when the cause is not a suite. The writer is now `tools/gateverdict.mjs`, which the workflow RUNS, so
   the arms drive THAT writer on gate logs and parse what it prints; the one-grammar property is kept, from the writer's
   own output rather than a template. */
const WRITER = join(REPO, "tools/gateverdict.mjs");
const { composeVerdict } = await import(pathToFileURL(WRITER).href);
t("the workflow RUNS the writer and writes no annotation of its own",
  [/node tools\/gateverdict\.mjs --log "\$log" --tree "\$tree" --exit "\$rc"/.test(wf), (wf.match(/::notice title=/g) || []).length], [true, 0]);
const gateLog = (verdict, causes = "") => `=== gates · battery (all): npm run test:battery\n\ngates: ${verdict} · class FULL\n`
  + (causes ? `gates: CAUSES ${causes}\n` : "") + `gates: RECORDED ${verdict} for tree ${T1.slice(0, 8)} (class FULL) — x; the push guard reads it (D-293)\n`;
const cli = spawnSync(process.execPath, [WRITER, "--log", "/dev/null/none", "--tree", T1, "--exit", "1", "--t0", "100", "--t1", "1077"], { encoding: "utf8" });
const noticeLine = (/^::notice title=([^:]+)::(.*)$/m.exec(cli.stdout || "") || ["", "", ""]);
t("the writer prints ONE annotation titled as the guard reads it", [(String(cli.stdout).match(/::notice title=/g) || []).length, noticeLine[1]], [1, guard.CHECK_ANNOTATION_TITLE]);
const cliParsed = guard.parseVerdictAnnotation(noticeLine[2]);
t("...and a gate that left no log reads UNDETERMINED, NAMED (never `none`), exit and WALL carried",
  cliParsed && [cliParsed.verdict, cliParsed.exit, cliParsed.wall, cliParsed.failed], ["UNDETERMINED", 1, 977, ["gate:no-record:before-any-step:exit=1"]]);
t("...and the writer's own exit is non-zero off GREEN (the job fails)", cli.status, 1);
const red = guard.parseVerdictAnnotation(composeVerdict({ log: gateLog("RED", "plane:caseobject.test.mjs plane:gates.test.mjs"), tree: T1, exit: 1, wall: 977 }).annotation);
t("a RED line the writer writes parses, with its tree, class, exit and failed suites",
  red && [red.verdict, red.tree, red.cls, red.exit, red.wall, red.failed], ["RED", T1, "FULL", 1, 977, ["plane:caseobject.test.mjs", "plane:gates.test.mjs"]]);
const green = guard.parseVerdictAnnotation(composeVerdict({ log: gateLog("GREEN"), tree: T1, exit: 0, wall: 977 }).annotation);
t("a GREEN line with no failed suite parses to an empty list (the writer's `none`)", green && [green.verdict, green.failed], ["GREEN", []]);
const nm = guard.parseVerdictAnnotation(composeVerdict({ log: gateLog("NOT MEASURED", "notmeasured:plane:x.test.mjs"), tree: T1, exit: 124 }).annotation);
t("NOT MEASURED — a verdict with a SPACE in it — parses", nm && nm.verdict, "NOT MEASURED");
const und = guard.parseVerdictAnnotation(composeVerdict({ log: "npm ERR! crashed\n", tree: T1, exit: 1 }).annotation);
t("UNDETERMINED with no class (the gate never recorded) parses, class `?`", und && [und.verdict, und.cls], ["UNDETERMINED", "?"]);
/* M0-127: THE EXTENDED GRAMMAR — `kind:detail` causes beside the legacy bare suite file, and the liar SAID. */
const rres = guard.parseVerdictAnnotation(`VERDICT=RED TREE=${T1} CLASS=FULL EXIT=1 WALL=9s FAILED=residue:/tmp/bio-battery-1-a/bio-battery-3964-x:by=publish.test.mjs:pid=3964 step:coverage--strict:exit=1 plane:a.test.mjs b.test.mjs`);
t("M0-127: each cause parses to its kind (residue, step, suite; a bare file is a suite, as before)",
  rres && rres.causes.map((c) => c.kind), ["residue", "step", "suite", "suite"]);
t("M0-127: ...with its detail, the residue's path and suite intact",
  rres && rres.causes[0].detail, "/tmp/bio-battery-1-a/bio-battery-3964-x:by=publish.test.mjs:pid=3964");
t("M0-127: ...and the flat `failed` list every older reader reads is unchanged in shape", rres && rres.failed.length, 4);
t("M0-127: a legacy comma-separated FAILED still splits (compatibility)",
  guard.parseVerdictAnnotation(`VERDICT=RED TREE=${T1} CLASS=FULL EXIT=1 FAILED=a.test.mjs, b.test.mjs`).failed, ["a.test.mjs", "b.test.mjs"]);
t("M0-127: the OLD writer's liar — RED with FAILED=none — parses, and is flagged `unnamed`",
  guard.parseVerdictAnnotation(`VERDICT=RED TREE=${T1} CLASS=FULL EXIT=1 WALL=9s FAILED=none`).unnamed, true);
t("M0-127: over-strictness — a GREEN with FAILED=none is not `unnamed`",
  guard.parseVerdictAnnotation(`VERDICT=GREEN TREE=${T1} CLASS=FULL EXIT=0 FAILED=none`).unnamed, false);
t("over-strictness: the minimal grammar, without WALL or FAILED, parses",
  !!guard.parseVerdictAnnotation(`VERDICT=GREEN TREE=${T1} CLASS=FULL EXIT=0`), true);
t("a free-text annotation is NOT a verdict", guard.parseVerdictAnnotation("the gate was red, trust me"), null);
t("a verdict outside the four is NOT a verdict", guard.parseVerdictAnnotation(`VERDICT=YELLOW TREE=${T1} CLASS=FULL EXIT=0`), null);
t("the job's check is named as the guard reads it", /\n  gate:\n    name: gate\n/.test(wf) && guard.CHECK_NAME === "gate", true);
const pushBranches = (/push:\s*\n(?:\s*#.*\n)*\s*branches:\s*\[([^\]]*)\]/.exec(wf) || [])[1] || "";
/* CORRECTED 2026-09-23 by BOB #29 on BOB'S RULING ("Ok, 1 github run per batch"; TREE-SHARING §3), never exempted.
   The old arm asserted `land/**` and never `main`, so the verdict existed BEFORE main moved. That design re-ran the whole
   battery on GitHub for every branch a lane had already gated GREEN locally, added ~15 min a push, and emailed Bob on
   runner-only defects. The run is now the independent audit of each LANDED batch — `main` moves only through the train —
   and the check arm on `land/*` pushes says "no check" and never refuses, as it always did for a commit without one. */
t("the trigger is `main` alone — one run per landed batch — and never `land/**` or `integrate/**` (Bob, 2026-09-23)",
  [/"main"/.test(pushBranches), /"land\/\*\*"/.test(pushBranches), /"integrate\/\*\*"/.test(pushBranches)], [true, false, false]);
t("no secret is handed to the gate (a suite needing one is a live probe, not a gate unit)", /secrets\./.test(wf), false);
/* CORRECTED 2026-09-23 by M0-127: this read the WORKFLOW's text for `gates: RECORDED`; the writer moved to
   `tools/gateverdict.mjs`, so the property is DRIVEN there — a gate that exited 1 and printed a RED line but no
   RECORDED line must not read RED, and one that exited 0 without recording must not read GREEN. */
t("the verdict comes from the gate's RECORDED line, never the exit alone",
  [composeVerdict({ log: "gates: RED · class FULL\ngates: CAUSES plane:a.test.mjs\n", tree: T1, exit: 1 }).verdict,
   composeVerdict({ log: "gates: GREEN · class FULL\n", tree: T1, exit: 0 }).verdict], ["UNDETERMINED", "UNDETERMINED"]);
/* Actions runs a step as `bash -e`: without `set +e` before the gate, a RED gate kills the step before the annotation
   is written, and every RED reads UNDETERMINED — found by the LIVE negative control on 2026-09-23 (run 35799828324). */
/* Comment lines stripped: the step's own comment NAMES `set +e`, and control arm (5)'s first run passed over its removal
   by matching that comment (a surprising green, recorded below). */
const gateStep = wf.slice(wf.indexOf("- name: gate")).split("\n").filter((l) => !/^\s*#/.test(l)).join("\n");
t("the gate step turns OFF errexit before running the gate, so a RED gate still writes its verdict",
  /\bset \+e\b/.test(gateStep) && gateStep.search(/\bset \+e\b/) < gateStep.indexOf("node tools/gates.mjs"), true);

/* ========================================================================== */
section("THE DECISION, over a stubbed API — only a RED verdict for THIS tree on a FAILED check refuses");
const run = (id, conclusion, at, status = "completed") =>
  ({ id, name: "gate", head_sha: SHA, status, conclusion, completed_at: at, html_url: `https://example.invalid/job/${id}` });
const note = (msg) => ({ title: guard.CHECK_ANNOTATION_TITLE, message: msg });
const line = (v, tree = T1, extra = "") => `VERDICT=${v} TREE=${tree} CLASS=FULL EXIT=${v === "GREEN" ? 0 : 1}${extra}`;
const stub = (runs, notes) => (path) => {
  if (path.endsWith("/check-runs")) return { ok: true, json: { check_runs: runs } };
  const m = /check-runs\/(\d+)\/annotations$/.exec(path);
  if (m) return { ok: true, json: notes[m[1]] || [] };
  return { ok: false, reason: "unexpected path" };
};
const decide = (runs, notes, tree = T1) => guard.githubCheckVerdict({ slug: "o/r", sha: SHA, tree, get: stub(runs, notes) });
{
  const r = decide([run(1, "failure", "2026-09-22T01:00:00Z")], { 1: [note(line("RED", T1, " WALL=9s FAILED=x.test.mjs"))] });
  t("A RED verdict for this tree on a failed check refuses, naming the suite", [r.state, r.refuse, r.verdict && r.verdict.failed], ["RED", true, ["x.test.mjs"]]);
  const g = decide([run(1, "success", "2026-09-22T01:00:00Z")], { 1: [note(line("GREEN"))] });
  t("GREEN on a successful check is said, not refused", [g.state, g.refuse], ["GREEN", false]);
  const other = decide([run(1, "failure", "2026-09-22T01:00:00Z")], { 1: [note(line("RED", T2))] });
  t("a verdict for ANOTHER tree is UNDETERMINED, never refused (D-293 keys by the tree)", [other.state, other.refuse], ["UNDETERMINED", false]);
  const died = decide([run(1, "failure", "2026-09-22T01:00:00Z")], { 1: [] });
  t("a failed check with no verdict annotation measured nothing: UNDETERMINED, not refused", [died.state, died.refuse], ["UNDETERMINED", false]);
  const nmv = decide([run(1, "failure", "2026-09-22T01:00:00Z")], { 1: [note(line("NOT MEASURED"))] });
  t("NOT MEASURED (M0-107) is said and never refused", [nmv.state, nmv.refuse], ["NOT MEASURED", false]);
  const liar = decide([run(1, "success", "2026-09-22T01:00:00Z")], { 1: [note(line("RED"))] });
  t("an annotation that disagrees with its check's conclusion is UNDETERMINED", [liar.state, liar.refuse], ["UNDETERMINED", false]);
  const two = decide([run(1, "failure", "2026-09-22T01:00:00Z")], { 1: [note(line("RED")), note(line("GREEN"))] });
  t("two verdicts on one check run are UNDETERMINED", two.state, "UNDETERMINED");
  const rerunGreen = decide([run(1, "failure", "2026-09-22T01:00:00Z"), run(2, "success", "2026-09-22T02:00:00Z")],
    { 1: [note(line("RED"))], 2: [note(line("GREEN"))] });
  t("a flake re-run GREEN: the LATEST completed run is read", [rerunGreen.state, rerunGreen.refuse], ["GREEN", false]);
  const rerunRed = decide([run(2, "success", "2026-09-22T01:00:00Z"), run(1, "failure", "2026-09-22T02:00:00Z")],
    { 1: [note(line("RED"))], 2: [note(line("GREEN"))] });
  t("...and a later RED is not forgiven by an earlier GREEN", [rerunRed.state, rerunRed.refuse], ["RED", true]);
  const pending = decide([run(1, null, null, "in_progress")], {});
  t("a check still running is PENDING, not refused", [pending.state, pending.refuse], ["PENDING", false]);
  t("no check at all is NONE", decide([], {}).state, "NONE");
  t("another check's name is not this gate's", decide([{ ...run(1, "failure", "x"), name: "lint" }], {}).state, "NONE");
  const down = guard.githubCheckVerdict({ slug: "o/r", sha: SHA, tree: T1, get: () => ({ ok: false, reason: "HTTP 403" }) });
  t("an API that cannot be read is UNDETERMINED, never refused", [down.state, down.refuse, /HTTP 403/.test(down.why)], ["UNDETERMINED", false, true]);
  const unknown = guard.githubCheckVerdict({ slug: "o/r", sha: SHA, tree: T1, get: () => ({ ok: false, code: "422", reason: "HTTP 422" }) });
  t("a commit GitHub has not seen (HTTP 422, the first push of it) is NONE, not UNDETERMINED", [unknown.state, unknown.refuse], ["NONE", false]);
  t("no GitHub remote is NONE", guard.githubCheckVerdict({ slug: null, sha: SHA, tree: T1 }).state, "NONE");
}

/* ========================================================================== */
section("THE REMOTE'S NAME — owner/repo from each URL form git carries");
t("https", guard.githubSlug("https://github.com/believeinoakland/bio"), "believeinoakland/bio");
t("https with .git", guard.githubSlug("https://github.com/believeinoakland/bio.git"), "believeinoakland/bio");
t("ssh", guard.githubSlug("git@github.com:believeinoakland/bio.git"), "believeinoakland/bio");
t("a URL that is not github.com (a proxy, another host) is not guessed at", guard.githubSlug("https://gitlab.example/git/believeinoakland/bio"), null);

/* ========================================================================== */
section("THE END-TO-END PUSH — git calls the hook, the hook reads the check through curl, and a RED check refuses");
{
  const root = join(SANDBOX, "e2e");
  mkdirSync(join(root, "tools"), { recursive: true });
  /* CORRECTED 2026-09-24 by M0-170: this copied `tools/pushguard.mjs` ALONE, a hand list of one. It is right today
     BY RULE, not by luck — the guard's header requires it to stay SELF-CONTAINED (its clone-wide copy in the common dir
     is one file), and `pushguard.test.mjs`'s D-406 section fails by name if it gains a relative import (measured by
     M0-170's control, arm A2). But that is THAT suite's property to enforce; a second fixture silently relying on it
     would fail here for the FIXTURE's reason (the hook dies on a missing module). So what is carried is derived by
     `moduleClosure`'s STATIC mode (M0-169), and this section measures the check-reading arm whatever the guard imports. */
  for (const rel of moduleClosure({ repo: REPO, roots: ["tools/pushguard.mjs"], dynamic: false })) {
    mkdirSync(dirname(join(root, rel)), { recursive: true });
    cpSync(join(REPO, rel), join(root, rel));
  }
  writeFileSync(join(root, "README.md"), "# scratch\n");
  git(["init", "-q", "-b", "main"], root);
  git(["config", "user.email", "m0114@example.invalid"], root);
  git(["config", "user.name", "M0-114 suite"], root);
  git(["config", "commit.gpgsign", "false"], root);
  /* `origin` names the repository whose checks are read; the push goes to `bare`. */
  git(["remote", "add", "origin", "https://github.com/fixture/repo"], root);
  const bare = join(SANDBOX, "bare.git");
  git(["init", "-q", "--bare", bare], SANDBOX);
  git(["remote", "add", "bare", bare], root);
  guard.install({ repo: root });
  const commit = (msg) => { writeFileSync(join(root, "README.md"), `# scratch\n${msg}\n`); git(["add", "-A"], root); git(["commit", "-q", "-m", msg], root);
    return { sha: git(["rev-parse", "HEAD"], root).stdout.trim(), tree: git(["rev-parse", "HEAD^{tree}"], root).stdout.trim() }; };
  const FX = join(SANDBOX, "api");
  const fixture = (sha, runs, notes) => {
    mkdirSync(join(FX, "repos/fixture/repo/commits", sha), { recursive: true });
    writeFileSync(join(FX, "repos/fixture/repo/commits", sha, "check-runs"), JSON.stringify({ check_runs: runs.map((r) => ({ ...r, head_sha: sha })) }));
    for (const [id, ns] of Object.entries(notes)) {
      mkdirSync(join(FX, "repos/fixture/repo/check-runs", id), { recursive: true });
      writeFileSync(join(FX, "repos/fixture/repo/check-runs", id, "annotations"), JSON.stringify(ns));
    }
  };
  const ENV = { BIO_GITHUB_API: pathToFileURL(FX).href, BIO_PUSHGUARD_CHECKS: "" };
  /* CORRECTED 2026-09-23 by CONDUCT #14 at the REC-168 + M0-114 train, where this item MET M0-111: the arms pushed
     HEAD:refs/heads/main, and M0-111's main arm (landed at c5c83dc4) now refuses any push of main without the train's mark,
     so all six push arms went red for a reason that is not this suite's subject. The check arm reads the pushed COMMIT's check
     whatever the ref, and a lane's real push is now a land/* ref, so the fixture pushes there — as M0-111 corrected
     pushguard.test.mjs to land/suite/work. The old assertion was not wrong about the check arm; its ref became one no lane may push. */
  const LANDED = "land/suite/work";
  const push = (env = ENV) => git(["push", "bare", `HEAD:refs/heads/${LANDED}`], root, env);
  const tip = () => git(["rev-parse", "--verify", "--quiet", `refs/heads/${LANDED}`], bare).stdout.trim();

  const a = commit("no check yet");
  fixture(a.sha, [], {}); /* the API answers a commit with no check runs 200, `check_runs: []` */
  const p0 = push();
  t("NO CHECK: the push lands and the guard SAYS there is none", [p0.status, tip() === a.sha, /GitHub check for .*: NONE/.test(p0.stderr)], [0, true, true]);

  const b = commit("a check that went green");
  fixture(b.sha, [run(11, "success", "2026-09-22T01:00:00Z")], { 11: [note(`VERDICT=GREEN TREE=${b.tree} CLASS=FULL EXIT=0 WALL=900s FAILED=none`)] });
  const p1 = push();
  t("A GREEN CHECK: the push lands and the guard says GREEN", [p1.status, tip() === b.sha, /GitHub check for .*: GREEN/.test(p1.stderr)], [0, true, true]);

  const c = commit("a job that died before the gate recorded");
  fixture(c.sha, [run(12, "failure", "2026-09-22T01:00:00Z")], { 12: [] });
  const p2 = push();
  t("A FAILED JOB THAT RECORDED NOTHING PUSHES, and is said UNDETERMINED",
    [p2.status, tip() === c.sha, /GitHub check for .*: UNDETERMINED/.test(p2.stderr)], [0, true, true]);

  const d = commit("a suite broken on this tree");
  fixture(d.sha, [run(13, "failure", "2026-09-22T01:00:00Z")],
    { 13: [note(`VERDICT=RED TREE=${d.tree} CLASS=FULL EXIT=1 WALL=900s FAILED=broken.test.mjs`)] });
  const p3 = push();
  t("A RED CHECK IS REFUSED — git called the hook, and it refused in its own words",
    [p3.status !== 0, p3.stderr.includes(`PUSH REFUSED — ${guard.HOOK_MARKER}`), p3.stderr.includes("GITHUB'S MACHINES RECORDED THIS TREE RED")], [true, true, true]);
  t("...naming the failed suite and the check", [p3.stderr.includes("broken.test.mjs"), p3.stderr.includes("https://example.invalid/job/13")], [true, true]);
  t("...and the refused commit did NOT reach the remote", tip(), c.sha);

  const off = push({ ...ENV, BIO_PUSHGUARD_CHECKS: "off" });
  t("BIO_PUSHGUARD_CHECKS=off skips the arm and SAYS so", [off.status, /GitHub check NOT READ/.test(off.stderr)], [0, true]);
}

/* ========================================================================== */
section("FOOT");
t(`FOOT — all ${SECTIONS} sections reached (a section that dies silently cannot leave a green count)`, reached, SECTIONS);

rmSync(SANDBOX, { recursive: true, force: true });
console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
