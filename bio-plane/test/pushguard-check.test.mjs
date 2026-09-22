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
 *   RUN 2026-09-22 by the M0-114 worker, all four AS DECLARED: baseline 39 pass / 0 fail; every anchor preflighted at
 *   exactly one match; failing counts per arm 5, 1, 3, 7 (arm (3) also fails "...did NOT reach the remote", because the
 *   no-verdict commit it refused never landed); every restore of `tools/pushguard.mjs` sha256 MATCH at 77,111 B;
 *   closing 39 / 0.
 */
import "./stdio.mjs";                 /* D-282 */
import "./sandbox.mjs";
import { mkdtempSync, writeFileSync, readFileSync, mkdirSync, cpSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import * as guard from "../../tools/pushguard.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const REPO = join(DIR, "../..");
const WORKFLOW = join(REPO, ".github/workflows/gates.yml");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
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
const tmpl = /echo "::notice title=([^:]+)::([^"]+)"/.exec(wf) || ["", "", ""];
t("the workflow writes exactly one verdict annotation", (wf.match(/::notice title=/g) || []).length, 1);
t("...titled as the guard reads it", tmpl && tmpl[1], guard.CHECK_ANNOTATION_TITLE);
const fill = (vars) => tmpl[2].replace(/\$\(\(t1 - t0\)\)/g, "977").replace(/\$\{(\w+)(?::-([^}]*))?\}/g,
  (_, k, dflt) => (vars[k] !== undefined && vars[k] !== "" ? vars[k] : (dflt ?? "")));
const red = guard.parseVerdictAnnotation(fill({ verdict: "RED", tree: T1, cls: "FULL", rc: "1", failed: "caseobject.test.mjs gates.test.mjs" }));
t("a RED line the workflow writes parses, with its tree, class, exit and failed suites",
  red && [red.verdict, red.tree, red.cls, red.exit, red.wall, red.failed], ["RED", T1, "FULL", 1, 977, ["caseobject.test.mjs", "gates.test.mjs"]]);
const green = guard.parseVerdictAnnotation(fill({ verdict: "GREEN", tree: T1, cls: "TARGETED", rc: "0", failed: "" }));
t("a GREEN line with no failed suite parses to an empty list (the workflow's `none`)", green && [green.verdict, green.failed], ["GREEN", []]);
const nm = guard.parseVerdictAnnotation(fill({ verdict: "NOT MEASURED", tree: T1, cls: "FULL", rc: "124" }));
t("NOT MEASURED — a verdict with a SPACE in it — parses", nm && nm.verdict, "NOT MEASURED");
const und = guard.parseVerdictAnnotation(fill({ verdict: "UNDETERMINED", tree: T1, cls: "", rc: "1" }));
t("UNDETERMINED with no class (the gate never recorded) parses, class `?`", und && [und.verdict, und.cls], ["UNDETERMINED", "?"]);
t("over-strictness: the minimal grammar, without WALL or FAILED, parses",
  !!guard.parseVerdictAnnotation(`VERDICT=GREEN TREE=${T1} CLASS=FULL EXIT=0`), true);
t("a free-text annotation is NOT a verdict", guard.parseVerdictAnnotation("the gate was red, trust me"), null);
t("a verdict outside the four is NOT a verdict", guard.parseVerdictAnnotation(`VERDICT=YELLOW TREE=${T1} CLASS=FULL EXIT=0`), null);
t("the job's check is named as the guard reads it", /\n  gate:\n    name: gate\n/.test(wf) && guard.CHECK_NAME === "gate", true);
const pushBranches = (/push:\s*\n(?:\s*#.*\n)*\s*branches:\s*\[([^\]]*)\]/.exec(wf) || [])[1] || "";
t("the trigger reads `land/**` and never `main` (the verdict must exist BEFORE main moves)",
  [/"land\/\*\*"/.test(pushBranches), /"main"/.test(pushBranches)], [true, false]);
t("no secret is handed to the gate (a suite needing one is a live probe, not a gate unit)", /secrets\./.test(wf), false);
t("the verdict comes from the gate's RECORDED line, never the exit alone", wf.includes("gates: RECORDED"), true);

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
  t("no GitHub remote is NONE", guard.githubCheckVerdict({ slug: null, sha: SHA, tree: T1 }).state, "NONE");
}

/* ========================================================================== */
section("THE REMOTE'S NAME — owner/repo from each URL form git carries");
t("https", guard.githubSlug("https://github.com/believeinoakland/bio"), "believeinoakland/bio");
t("https with .git", guard.githubSlug("https://github.com/believeinoakland/bio.git"), "believeinoakland/bio");
t("ssh", guard.githubSlug("git@github.com:believeinoakland/bio.git"), "believeinoakland/bio");
t("a proxy URL that is not github.com is not guessed at", guard.githubSlug("http://127.0.0.1:1234/git/believeinoakland/bio"), null);

/* ========================================================================== */
section("THE END-TO-END PUSH — git calls the hook, the hook reads the check through curl, and a RED check refuses");
{
  const root = join(SANDBOX, "e2e");
  mkdirSync(join(root, "tools"), { recursive: true });
  cpSync(join(REPO, "tools/pushguard.mjs"), join(root, "tools/pushguard.mjs"));
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
  const push = (env = ENV) => git(["push", "bare", "HEAD:refs/heads/main"], root, env);
  const tip = () => git(["rev-parse", "--verify", "--quiet", "refs/heads/main"], bare).stdout.trim();

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
