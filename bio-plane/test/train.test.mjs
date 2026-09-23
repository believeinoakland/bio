/* M0-111 — ONE LANE LANDS ON `main`, IN BATCHES: the train (`tools/train.mjs`) and the push guard's `main` arm
 * (`tools/pushguard.mjs` `mainArmCheck`). Design: `docs/development/TREE-SHARING.md` §2, ruled by Bob 2026-09-22.
 *
 * ACCEPTS WHEN (the row): two lanes' `land/*` branches land in one train with one gate record, and a lane's direct
 * push to `main` is refused by name.
 *
 * WHY A FIXTURE AND NEVER THIS REPOSITORY: a refusal or a landing arranged against this repository's remote would be
 * a real push to the real `main`. So every arm drives REAL git — a throwaway bare remote in the OS temp dir, three
 * REAL clones of it (two lanes and the integrator), the REAL `train.mjs`, `gates.mjs` and `pushguard.mjs` copied in
 * and the REAL hook installed the way `plancheck` installs it. Only the steps the gate RUNS are stand-ins (the
 * battery, coverage, the UI harness, plancheck); plancheck's stub fails when the tree carries `docs/RED.flag`, which
 * is how an arm makes a branch RED.
 *
 * HOW A LIAR PASSES THIS SUITE, STATED BEFORE WHAT IT CHECKS:
 *   - a guard that refuses EVERY push passes the refusal arm; so the lanes' `land/*` pushes and the train's own push
 *     of `main` are asserted to LAND, read from the REMOTE;
 *   - a refusal read from the exit status alone passes over a push that failed for another reason (a
 *     non-fast-forward); so every refusal is read from the guard's OWN text, naming `refs/heads/main`;
 *   - a train that claims its deletions passes the delete arm on any remote that honours them; so one arm runs
 *     against a remote that KEEPS a deleted ref while the push EXITS 0 (stricter than the cloud proxy's measured
 *     refusal, HTTP 403 at exit 1 under "Everything up-to-date") and asserts NOT DELETED, and that the next train
 *     reads the ref LANDED by ancestry;
 *   - "one gate record" read from the train's own summary is its own word; so the record is read back from the gate's
 *     record directory for the tree the REMOTE's `main` now holds.
 * AND THE GUARD'S OWN LIMIT IS DRIVEN, NOT IMPLIED CLOSED: forging the trailer, the train record and a GREEN gate
 * record by hand PASSES the `main` arm (section 8) — the mark proves a procedure, never an actor.
 *
 * NEGATIVE CONTROL: `node bio-plane/test/train.control.mjs` from the repo root, each arm ALONE against pristine copies
 * restored by sha256 AND `cmp` —
 *   (1) the guard's `main` arm dropped (its call site in `run`) -> "A LANE'S DIRECT PUSH TO main IS REFUSED BY NAME"
 *       FAILS; the train still lands, the land/* pushes still land;
 *   (2) the train reports a deletion from the push's exit status, never from the remote -> "A DELETE THE REMOTE
 *       REFUSED IS REPORTED NOT DELETED" FAILS; the landing and the ancestry arm hold;
 *   (3) prune-by-ancestry dropped (every land/* ref read WAITING) -> "...and the NEXT train reads it LANDED by
 *       ancestry" FAILS; the first landing holds;
 *   (4) the train's trailer dropped from its merges -> "THE TRAIN LANDS BOTH LANES" FAILS — the guard binds the
 *       train too, so the mark is load-bearing; the direct-push refusal holds.
 *   RUN 2026-09-23 by the M0-111 worker, all four AS DECLARED: baseline 34 pass / 0 fail, each arm alone, every declared
 *   must-stay-green assertion green and the collateral assertion never red; failing counts per arm 7, 1, 1, 12; driver
 *   34 pass / 0 fail, every restore byte-identical by sha256 and `cmp`, closing 34 / 0, pen removed. ARM (4)'s FIRST RUN
 *   FOUND ITS OWN DECLARATION WRONG: it declared "THE LONE RED BRANCH IS RETURNED BY NAME" must stay green, and it went
 *   red because every refused train leaves the earlier sections' branches WAITING, so the "lone" branch shares its
 *   train — a cascade of the arm, not collateral; the declaration now names only arms that run no train.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { install, readRuns, appendRun, trainDir, HOOK_MARKER } from "../../tools/pushguard.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const REPO = join(DIR, "../..");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const SECTIONS = 9;
let reached = 0;
const section = (name) => { reached++; console.log(`\n--- ${name} ---`); };

const SANDBOX = mkdtempSync(join(tmpdir(), "train-"));
let tick = 0;
/* Every lane commit gets its own fixed, increasing committer date, so the train's oldest-first order is the order
   this suite wrote — never a race on the wall clock. */
const git = (args, cwd, env = {}) => spawnSync("git", args, { cwd, encoding: "utf8", env: { ...process.env, ...env } });
const out1 = (args, cwd) => git(args, cwd).stdout.trim();
const put = (root, rel, body) => { mkdirSync(dirname(join(root, rel)), { recursive: true }); writeFileSync(join(root, rel), body); };
const commitAll = (root, msg) => {
  tick++;
  const when = `2026-09-22T12:${String(Math.floor(tick / 60)).padStart(2, "0")}:${String(tick % 60).padStart(2, "0")}Z`;
  git(["add", "-A"], root);
  return git(["commit", "-q", "-m", msg], root, { GIT_COMMITTER_DATE: when, GIT_AUTHOR_DATE: when });
};
const ident = (root) => {
  git(["config", "user.email", "m0111@example.invalid"], root);
  git(["config", "user.name", "M0-111 suite"], root);
  git(["config", "commit.gpgsign", "false"], root);
};

const stub = (name) => [
  `import { existsSync } from "node:fs";`,
  `const red = ${JSON.stringify(name)} === "plancheck" && existsSync(new URL("../docs/RED.flag", import.meta.url));`,
  `process.exit(red ? 1 : 0);`, ""].join("\n");
const FILES = {
  "tools/plancheck.mjs": stub("plancheck"),
  "bio-plane/package.json": `${JSON.stringify({ name: "fixture-plane", private: true, type: "module", scripts: { "test:battery": "node scripts/battery.mjs" } })}\n`,
  "bio-plane/scripts/battery.mjs": stub("battery"),
  "bio-plane/scripts/coverage.mjs": stub("coverage"),
  "bio-plane/test/unrelated.test.mjs": "process.exit(0);\n",
  "civicos-ui/test/run.mjs": stub("ui-harness"),
  "docs/notes/a.md": "# a\n\nthe line two lanes will both rewrite\n",
  "CLAUDE.md": "# fixture\n",
  ".gitignore": "node_modules/\n",
};

function fixture(name) {
  const seed = join(SANDBOX, `${name}-seed`);
  for (const f of ["gates.mjs", "pushguard.mjs", "train.mjs"]) put(seed, `tools/${f}`, readFileSync(join(REPO, "tools", f)));
  for (const f of ["walkfloor.mjs", "provenance.mjs", "walkfigure.mjs"])
    put(seed, `bio-plane/scripts/${f}`, readFileSync(join(REPO, "bio-plane/scripts", f)));
  for (const [rel, body] of Object.entries(FILES)) put(seed, rel, body);
  git(["init", "-q", "-b", "main"], seed); ident(seed);
  commitAll(seed, "base");
  const remote = join(SANDBOX, `${name}-remote.git`);
  git(["init", "-q", "--bare", "-b", "main", remote], SANDBOX);
  /* The ONE unguarded push of `main` in this suite: the remote's creation, before any hook exists — the estate's own
     `main` was created the same way, long before a guard. Every later push goes through the REAL hook. */
  git(["push", "-q", remote, "main"], seed);
  const clone = (who) => {
    const dir = join(SANDBOX, `${name}-${who}`);
    git(["clone", "-q", remote, dir], SANDBOX); ident(dir); install({ repo: dir });
    return dir;
  };
  return { remote, A: clone("alpha"), B: clone("beta"), C: clone("conduct") };
}
const onRemote = (remote, ref) => out1(["rev-parse", "--verify", "--quiet", `refs/heads/${ref}`], remote);
const isAncestor = (remote, sha, ref = "main") => git(["merge-base", "--is-ancestor", sha, `refs/heads/${ref}`], remote).status === 0;
const push = (root, spec) => { const r = git(["push", "origin", spec], root); return { status: r.status, err: `${r.stdout}${r.stderr}` }; };
/* Refused BY THE MAIN ARM — the guard's own words, naming the ref — never the exit status alone. */
const refusedMain = (p) => p.status !== 0 && p.err.includes(`PUSH REFUSED — ${HOOK_MARKER}`) && p.err.includes("A DIRECT PUSH TO refs/heads/main (M0-111)");
const lane = (root, branch, rel, body, msg = `work on ${rel}`) => {
  git(["checkout", "-q", "-B", `work-${branch.replace(/\//g, "-")}`, "origin/main"], root);
  put(root, rel, body); commitAll(root, msg);
  const p = push(root, `HEAD:refs/heads/${branch}`);
  return { ...p, sha: out1(["rev-parse", "HEAD"], root) };
};
const fetchAll = (root) => git(["fetch", "-q", "origin"], root);
const train = (root, args = []) => {
  const r = spawnSync(process.execPath, [join(root, "tools/train.mjs"), ...args], { cwd: root, encoding: "utf8" });
  const text = `${r.stdout || ""}${r.stderr || ""}`;
  return { status: r.status, text, summary: (text.match(/^train: (LANDED|NOTHING|RED|PUSH FAILED|REFUSED|STOPPED|GATED)[^\n]*$/m) || [""])[0],
           gates: (text.match(/^=== train · gate:/gm) || []).length,
           returned: [...text.matchAll(/^train: RETURNED (\S+)[^\n]*$/gm)].map((m) => m[0]),
           refs: Object.fromEntries([...text.matchAll(/^train: ref (\S+): ([A-Z ]+?) — /gm)].map((m) => [m[1], m[2]])) };
};

/* ========================================================================== */
section("THE FIXTURE — a real remote, two lanes and an integrator, the real tools and the real hook");
const F = fixture("fx");
{
  t("the fixture carries the REAL train.mjs, gates.mjs and pushguard.mjs",
    ["train.mjs", "gates.mjs", "pushguard.mjs"].every((f) => readFileSync(join(F.C, "tools", f)).equals(readFileSync(join(REPO, "tools", f)))), true);
  t("each clone has the hook installed", [F.A, F.B, F.C].every((d) => readFileSync(join(d, ".git/hooks/pre-push"), "utf8").includes(HOOK_MARKER)), true);
  t("the remote's main exists", onRemote(F.remote, "main").length, 40);
}

/* ========================================================================== */
section("OVER-STRICTNESS — a lane's land/<lane>/<topic> push LANDS on the remote");
const a1 = lane(F.A, "land/alpha/one", "docs/notes/alpha.md", "# alpha's work\n");
const b1 = lane(F.B, "land/beta/two", "docs/notes/beta.md", "# beta's work\n");
{
  t("lane alpha's land/alpha/one push is accepted", a1.status, 0);
  t("...and it is on the remote at the lane's sha", onRemote(F.remote, "land/alpha/one"), a1.sha);
  t("lane beta's land/beta/two push is accepted", [b1.status, onRemote(F.remote, "land/beta/two")], [0, b1.sha]);
}

/* ========================================================================== */
section("THE REFUSAL — a lane's direct push to main is refused BY NAME, and main does not move");
{
  const before = onRemote(F.remote, "main");
  git(["checkout", "-q", "-B", "direct", "origin/main"], F.A);
  put(F.A, "docs/notes/direct.md", "# a lane that lands itself\n"); commitAll(F.A, "a lane pushing main itself");
  const d = push(F.A, "HEAD:main");
  t("A LANE'S DIRECT PUSH TO main IS REFUSED BY NAME — the guard's own text names refs/heads/main", refusedMain(d), true);
  t("...and says what to do instead (push land/<lane>/<topic>)", d.err.includes("git push origin HEAD:refs/heads/land/<lane>/<topic>"), true);
  t("...and main on the remote did NOT move (a fast-forward the guard alone stopped)", onRemote(F.remote, "main"), before);

  git(["commit", "-q", "--amend", "-m", "a lane pretending to be a train\n\nBio-Train: train-20260922T120000Z-1"], F.A);
  const forged = push(F.A, "HEAD:main");
  t("a TRAILER ALONE is refused — no train record names that commit", [refusedMain(forged), /no train record/.test(forged.err)], [true, true]);
  const del = push(F.A, ":main");
  t("a DELETION of main is refused by name", [refusedMain(del), /a DELETION of main/.test(del.err), onRemote(F.remote, "main")], [true, true, before]);
}

/* ========================================================================== */
section("THE TRAIN — two lanes' land/* branches land in ONE train with ONE gate record");
{
  fetchAll(F.C);
  const list = spawnSync(process.execPath, [join(F.C, "tools/train.mjs"), "list"], { cwd: F.C, encoding: "utf8" }).stdout;
  t("`train.mjs list` names both lanes' branches WAITING", [/WAITING\s+land\/alpha\/one/.test(list), /WAITING\s+land\/beta\/two/.test(list)], [true, true]);
  const r = train(F.C, ["run"]);
  const main = onRemote(F.remote, "main");
  t("THE TRAIN LANDS BOTH LANES — exit 0, and both lane tips are ancestors of the REMOTE's main",
    [r.status, isAncestor(F.remote, a1.sha), isAncestor(F.remote, b1.sha)], [0, true, true]);
  if (r.status !== 0) console.log(r.text.split("\n").slice(-25).join("\n"));
  t("...ONE gate run in the train's own output", r.gates, 1);
  const tree = out1(["rev-parse", `${main}^{tree}`], F.remote);
  const runs = readRuns({ repo: F.C, tree }).runs;
  t("...and ONE gate record for the tree the remote's main now holds, GREEN", [runs.length, runs[0] && runs[0].verdict], [1, "GREEN"]);
  const id = (out1(["log", "-1", "--format=%B", main], F.remote).match(/^Bio-Train: (\S+)$/m) || [])[1];
  const recFile = id ? join(trainDir({ repo: F.C }), `${id}.json`) : "";
  const rec = recFile && existsSync(recFile) ? JSON.parse(readFileSync(recFile, "utf8")) : {};
  t("...and the train record names both branches, the pushed commit and that gate record",
    [(rec.landed || []).map((l) => l.branch), rec.head, rec.pushed, !!rec.gate && rec.gate.file === (runs[0] && runs[0].file)],
    [["land/alpha/one", "land/beta/two"], main, true, true]);
  t("...and the guard SAID it verified the train's mark on the push", /main carries the train's mark \(M0-111\)/.test(r.text), true);
  t("...and each landed ref is DELETED, verified from the remote",
    [r.refs["land/alpha/one"], r.refs["land/beta/two"], onRemote(F.remote, "land/alpha/one"), onRemote(F.remote, "land/beta/two")],
    ["DELETED", "DELETED", "", ""]);
}

/* ========================================================================== */
section("THE MEASURED CONSTRAINT — a deletion the remote drops is REPORTED, never claimed, and ancestry prunes it");
{
  /* The cloud's shape, MEASURED 2026-09-23T00:01Z by the M0-111 worker: the proxy answers a delete push HTTP 403, git
     exits 1 and still prints "Everything up-to-date", and the ref is still there. The fixture holds the train to the
     STRICTER shape — the push EXITS 0 and the ref stays (a post-receive hook puts every deleted ref back) — so a train
     reading the exit status, or git's words, cannot pass; only `ls-remote` can. */
  const HOOK = join(F.remote, "hooks/post-receive");
  writeFileSync(HOOK, ["#!/bin/sh", "while read old new ref; do",
    `  if [ "$new" = "${"0".repeat(40)}" ]; then git update-ref "$ref" "$old"; fi`, "done", ""].join("\n"), { mode: 0o755 });
  const a3 = lane(F.A, "land/alpha/three", "docs/notes/alpha3.md", "# alpha, again\n");
  const probe = push(F.A, ":refs/heads/land/alpha/three");
  t("(the fixture reproduces the shape: a delete push exits 0 and the ref is still on the remote)",
    [probe.status, onRemote(F.remote, "land/alpha/three")], [0, a3.sha]);
  const r = train(F.C, ["run"]);
  t("the train lands it", [r.status, isAncestor(F.remote, a3.sha)], [0, true]);
  t("A DELETE THE REMOTE REFUSED IS REPORTED NOT DELETED — the ref is still on the remote, and the train says so",
    [r.refs["land/alpha/three"], onRemote(F.remote, "land/alpha/three")], ["NOT DELETED", a3.sha]);
  const main = onRemote(F.remote, "main");
  const again = train(F.C, ["run"]);
  t("...and the NEXT train reads it LANDED by ancestry: nothing to land, no gate, main unmoved",
    [again.status, /NOTHING TO LAND/.test(again.summary), again.gates, onRemote(F.remote, "main")], [0, true, 0, main]);
  rmSync(HOOK, { force: true });
  const pruned = train(F.C, ["run"]);
  t("...and once the remote honours deletions, the stale landed ref is pruned", [pruned.refs["land/alpha/three"], onRemote(F.remote, "land/alpha/three")], ["DELETED", ""]);
}

/* ========================================================================== */
section("A CONFLICT — returned to its lane BY NAME, and the rest land");
{
  const c1 = lane(F.A, "land/alpha/c1", "docs/notes/a.md", "# a\n\nalpha rewrote the line\n");
  const c2 = lane(F.B, "land/beta/c2", "docs/notes/a.md", "# a\n\nbeta rewrote the line differently\n");
  const r = train(F.C, ["run"]);
  t("the first lands", [r.status, isAncestor(F.remote, c1.sha)], [0, true]);
  t("THE CONFLICTING BRANCH IS RETURNED TO ITS LANE BY NAME, with the conflicted path",
    r.returned.some((l) => l.includes("land/beta/c2") && l.includes("to lane beta") && l.includes("CONFLICT in docs/notes/a.md")), true);
  t("...it did not land, and its ref is kept for the lane", [isAncestor(F.remote, c2.sha), onRemote(F.remote, "land/beta/c2")], [false, c2.sha]);
  t("...and the integrator's checkout holds no half-made merge", [existsSync(join(F.C, ".git/MERGE_HEAD")), out1(["status", "--porcelain"], F.C)], [false, ""]);
  push(F.B, ":refs/heads/land/beta/c2");   /* the lane takes its branch back */
}

/* ========================================================================== */
section("A RED GATE — nothing is pushed, a lone branch is returned by name, and --isolate names the red one of several");
{
  const before = onRemote(F.remote, "main");
  const red = lane(F.A, "land/alpha/red", "docs/RED.flag", "plancheck fails while this file exists\n");
  const r = train(F.C, ["run"]);
  t("a RED train exits non-zero and main does NOT move", [r.status !== 0, onRemote(F.remote, "main")], [true, before]);
  t("THE LONE RED BRANCH IS RETURNED BY NAME", r.returned.some((l) => l.includes("land/alpha/red") && l.includes("to lane alpha") && l.includes("RED")), true);
  const fine = lane(F.B, "land/beta/fine", "docs/notes/fine.md", "# beta, fine\n");
  const both = train(F.C, ["run"]);
  t("RED over TWO branches without --isolate: UNDETERMINED, both named, nothing pushed",
    [both.status !== 0, /UNDETERMINED which/.test(both.summary + both.text), onRemote(F.remote, "main")], [true, true, before]);
  const iso = train(F.C, ["run", "--isolate"]);
  t("--isolate returns the RED branch BY NAME and lands the other in one more train",
    [iso.status, iso.returned.some((l) => l.includes("land/alpha/red") && l.includes("RED ALONE")), isAncestor(F.remote, fine.sha), isAncestor(F.remote, red.sha)],
    [0, true, true, false]);
}

/* ========================================================================== */
section("THE STATED LIMIT, DRIVEN — forging all three artifacts by hand PASSES the main arm (a procedure, never an actor)");
/* Pinned so the limit cannot be quietly believed closed: the guard's comment says a liar passes this way, and this
   arm is the evidence. It runs on a fixture of its own so its forged main moves nothing any arm above reads. */
{
  const L = fixture("liar");
  git(["checkout", "-q", "-B", "forge", "origin/main"], L.A);
  put(L.A, "docs/notes/forged.md", "# landed without a train\n");
  commitAll(L.A, "forged\n\nBio-Train: train-20260922T120000Z-2");
  const head = out1(["rev-parse", "HEAD"], L.A), tree = out1(["rev-parse", "HEAD^{tree}"], L.A);
  put(trainDir({ repo: L.A }), "train-20260922T120000Z-2.json", JSON.stringify({ id: "train-20260922T120000Z-2", head, tree }));
  const withoutGate = push(L.A, "HEAD:main");
  t("a forged trailer and train record WITHOUT a GREEN gate record are still refused", [refusedMain(withoutGate), /not GREEN/.test(withoutGate.err)], [true, true]);
  appendRun({ repo: L.A, run: { tree, verdict: "GREEN", class: "FULL", steps: [{ label: "forged", units: ["plane:*", "fleet:*", "ui:*", "coverage", "plancheck"], ok: true }] } });
  const liar = push(L.A, "HEAD:main");
  t("A LIAR WHO FORGES THE TRAILER, THE TRAIN RECORD AND A GREEN GATE RECORD PASSES — the limit is real and stated",
    [liar.status, onRemote(L.remote, "main")], [0, head]);
}

/* ========================================================================== */
section("FOOT");
t(`FOOT — all ${SECTIONS} sections reached (a section that dies silently cannot leave a green count)`, reached, SECTIONS);
rmSync(SANDBOX, { recursive: true, force: true });
console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
