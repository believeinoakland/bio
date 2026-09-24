/* M0-111 — ONE LANE LANDS ON `main`, IN BATCHES: the train (`tools/train.mjs`) and the push guard's `main` arm
 * (`tools/pushguard.mjs` `mainArmCheck`). Design: `docs/development/TREE-SHARING.md` §2, ruled by Bob 2026-09-22.
 *
 * ACCEPTS WHEN (the row): two lanes' `land/*` branches land in one train with one gate record, and a lane's direct
 * push to `main` is refused by name. M0-122 (the last two sections): a train whose push is rejected once because `main`
 * moved lands on the retry with one `--since` gate, not a FULL one; and a tree already recorded GREEN lands with no
 * gate run of its own.
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
 *   - M0-131: a train that skips the never-cached units on a reused tree, derives an EMPTY set, or runs them and ignores
 *     their verdict lands a merge that drops a carried edit; so its section drives exactly that union and asserts the
 *     refusal names `plane:carry.test.mjs`, and that the derived set is non-empty and holds it.
 * AND THE GUARD'S OWN LIMIT IS DRIVEN, NOT IMPLIED CLOSED: forging the trailer, the train record and a GREEN gate
 * record by hand PASSES the `main` arm (section 8) — the mark proves a procedure, never an actor.
 *
 *   - M0-159: a train that refuses EVERY `--drop` passes the refusal arm, so the valid comma list is asserted to LAND
 *     the branch it did not name and to leave the two it did WAITING on the remote, read from the remote.
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
 *   (5) M0-122 — THE RETRY DROPPED (a push rejected because main moved is final) -> "A TRAIN WHOSE PUSH IS REJECTED
 *       ONCE LANDS ON THE RETRY" FAILS, and "THE RETRY IS BOUNDED" with it; the train and the reuse arm hold;
 *   (6) M0-122 — THE REUSE DROPPED (every union gated) -> "A RECORDED-GREEN TREE LANDS WITH NO BATTERY RUN OF ITS OWN"
 *       FAILS; the train, the retry and "OVER-REUSE CLOSED" hold.
 *   (7) M0-131 — THE HISTORY CHECKS SKIPPED ON REUSE (`if (reuse) return reuse`, M0-122's shape) -> "A UNION WHOSE TREE IS
 *       RECORDED GREEN BUT WHOSE MERGE DROPS A CARRIED EDIT IS REFUSED BY THE TRAIN NAMING THE CHECK" FAILS (the bad merge
 *       LANDS), with "THE DERIVED SET IS NOT EMPTY"; the train, the retry and "OVER-REUSE CLOSED" hold.
 *   (8) M0-131 — THE DERIVED SET EMPTIED (gates.mjs `NEVER_SET = []`) -> the same refusal FAILS, with "THE DERIVED SET IS
 *       NOT EMPTY"; the train and the reuse arm hold.
 *   (9) M0-131 — THE VERDICT IGNORED (the never-cached run happens; the reused tree reads GREEN) -> the refusal FAILS
 *       (no "RED at plane:carry.test.mjs", nothing returned by name) while "THE DERIVED SET IS NOT EMPTY" holds.
 *  (10) M0-159 — THE REFUSAL DROPPED (the silent ignore restored: an unmatched --drop entry is accepted and drops
 *       nothing) -> "A --drop ENTRY NAMING NO BRANCH REFUSES THE TRAIN BY NAME" FAILS; the comma split, the
 *       over-strictness arm and the bare-flag refusal hold.
 *  (11) M0-159 — THE COMMA SPLIT DROPPED (a --drop value is one branch name again) -> "A VALID COMMA LIST DROPS EACH
 *       BRANCH IT NAMES" FAILS, and the OVER-STRICTNESS arm with it (both lists are now unmatched entries, which the
 *       refusal — still armed — catches); the refusal arm itself holds, which is what tells the two halves apart.
 *  (12) M0-159 — THE BARE-FLAG CHECK DROPPED (`--drop` last on the line is read as if never typed) -> "A FLAG WITH NO
 *       VALUE AFTER IT IS REFUSED BY NAME" FAILS; the refusal, the comma split and the over-strictness arm hold.
 *   RUN 2026-09-24 by the M0-159 worker, ALL TWELVE AS DECLARED: baseline 61 pass / 0 fail, closing 61 / 0, driver
 *   106 pass / 0 fail, 12 of 12 arms run, every restore byte-identical by sha256 and `cmp`, pen removed; failing counts
 *   per arm 9, 1, 1, 25, 7, 5, 5, 4, 1, 2, 3, 1. Arm 4's count moved 22 -> 25 because this section's three landing
 *   assertions cascade with every other train when the trailer is dropped — the arm working, on fixtures of their own.
 *   TWO OF ARM 10's DECLARATIONS CAME BACK WRONG ON ITS FIRST RUN AND ARE RECORDED RATHER THAN SMOOTHED, BOTH DEFECTS
 *   IN THE SUITE THIS CONTROL FOUND: (a) "...it names what it COULD have dropped" did NOT fail, because the train logs
 *   `WAITING <branch>` for every waiting branch, so a train that MERGED instead of refusing contained all three names
 *   for free — an equality that costs nothing to produce; the assertion now reads the REFUSAL's own
 *   `What it could drop:` list and nothing else. (b) "A FLAG WITH NO VALUE AFTER IT IS REFUSED BY NAME" went red as a
 *   CASCADE, not collateral: with the refusal disarmed, the unmatched-entry train LANDED and moved `main` under an
 *   assertion that shared its fixture; that arm now drives a fixture of its own, which is why this section has three.
 *   RUN 2026-09-23 by the M0-131 worker, all nine AS DECLARED: baseline 53 pass / 0 fail; failing counts per arm 9, 1, 1,
 *   22, 7, 5, 5, 4, 1; every restore byte-identical by sha256 and `cmp`, closing 53 / 0, driver 78 pass / 0 fail. Arm 7
 *   is the row's control: the bad merge landed. FOUND BY ARM 9, re-run alone: main still did NOT move — the never-cached
 *   run's RED is recorded against the TREE, so the guard's `main` arm refused the push of that tree; the refusal
 *   failed only its "RED at <check>" and returned-by-name halves. A second line of defence, not the train's own.
 *   RUN 2026-09-23 by the M0-122 worker, all six AS DECLARED: baseline 47 pass / 0 fail; failing counts per arm 9, 1, 1,
 *   16, 7, 2; every restore byte-identical by sha256 and `cmp`, closing 47 / 0, driver 50 pass / 0 fail, pen
 *   removed. Arm 5 failed exactly the seven assertions of the moved-main section and nothing else; arm 6 exactly the
 *   two of the recorded-GREEN arm. Arms 1 and 4 now also redden the M0-122 sections' assertions that read the guard's
 *   mark or need a train to land — the same cascade arm (4) already had, on fixtures of their own.
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
const SECTIONS = 13;
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

/* M0-122: plancheck's stub also runs the shell script `$TRAIN_FIXTURE_MOVE` names, if it exists, DURING the gate —
   which is how the moved-main arm moves `main` under a train's gate, exactly when CONDUCT #14's did. */
const stub = (name) => [
  `import { existsSync } from "node:fs";`,
  `import { spawnSync } from "node:child_process";`,
  `const mv = ${JSON.stringify(name)} === "plancheck" && process.env.TRAIN_FIXTURE_MOVE;`,
  `if (mv && existsSync(mv)) spawnSync("sh", [mv], { stdio: "inherit" });`,
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

function fixture(name, extra = {}) {
  const seed = join(SANDBOX, `${name}-seed`);
  for (const f of ["gates.mjs", "pushguard.mjs", "train.mjs"]) put(seed, `tools/${f}`, readFileSync(join(REPO, "tools", f)));
  for (const f of ["walkfloor.mjs", "provenance.mjs", "walkfigure.mjs"])
    put(seed, `bio-plane/scripts/${f}`, readFileSync(join(REPO, "bio-plane/scripts", f)));
  for (const [rel, body] of Object.entries({ ...FILES, ...extra })) put(seed, rel, body);
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
const train = (root, args = [], env = {}) => {
  const r = spawnSync(process.execPath, [join(root, "tools/train.mjs"), ...args], { cwd: root, encoding: "utf8", env: { ...process.env, ...env } });
  const text = `${r.stdout || ""}${r.stderr || ""}`;
  return { status: r.status, text, summary: (text.match(/^train: (LANDED|NOTHING|RED|PUSH FAILED|REFUSED|STOPPED|GATED)[^\n]*$/m) || [""])[0],
           gates: (text.match(/^=== train · gate:/gm) || []).length,
           gateLines: [...text.matchAll(/^=== train · gate: ([^\n]*)$/gm)].map((m) => m[1]),
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
section("M0-122 · MAIN MOVES UNDER THE GATE — the rejected push is retried with ONE --since gate, bounded");
/* Its own fixture, so a train this section leaves unlanded (the bound arm) moves nothing any other section reads.
   `main` is moved by a MOVER clone with no hook installed — standing in for another train landing while this one
   gates (CONDUCT #14, c5c83dc4) — from inside the gate, through plancheck's stub (`$TRAIN_FIXTURE_MOVE`). */
{
  const M = fixture("moved");
  const mover = join(SANDBOX, "moved-mover");
  git(["clone", "-q", M.remote, mover], SANDBOX); ident(mover);
  const script = join(SANDBOX, "moved-move.sh");
  const moveScript = (oneShot) => writeFileSync(script, ["set -e", `cd "${mover}"`, "git fetch -q origin",
    "git checkout -q -B mv origin/main", "f=docs/notes/moved-$(date +%s%N).md", "echo \"# main moved\" > \"$f\"",
    "git add -A", "git commit -q -m \"main moves under the train\"", "git push -q origin HEAD:refs/heads/main",
    ...(oneShot ? [`rm -f "${script}"`] : []), ""].join("\n"));
  const readRec = (sha) => {
    const id = (out1(["log", "-1", "--format=%B", sha], M.remote).match(/^Bio-Train: (\S+)$/m) || [])[1];
    const f = id ? join(trainDir({ repo: M.C }), `${id}.json`) : "";
    return { id, rec: f && existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : {} };
  };

  const m1 = lane(M.A, "land/alpha/m1", "docs/notes/m1.md", "# alpha, landing while main moves\n");
  const before = onRemote(M.remote, "main");
  moveScript(true);
  const r = train(M.C, ["run"], { TRAIN_FIXTURE_MOVE: script });
  if (r.status !== 0) console.log(r.text.split("\n").slice(-30).join("\n"));
  const main = onRemote(M.remote, "main");
  const firstHead = ((r.text.match(/^train: attempt 1\/3 — push of (\S+) REJECTED/m) || [])[1]) || "";
  t("(the fixture moved main under the gate: the first push was REJECTED, and the move script ran exactly once)",
    [!!firstHead, /rejected/.test(r.text), existsSync(script)], [true, true, false]);
  t("A TRAIN WHOSE PUSH IS REJECTED ONCE LANDS ON THE RETRY — exit 0, the lane's tip AND the moved main are ancestors of the remote's main",
    [r.status, isAncestor(M.remote, m1.sha), main !== before && out1(["rev-list", "--count", `${before}..${main}`], M.remote) !== "0", /^train: attempt 2\/3 — push of \S+ LANDED/m.test(r.text)],
    [0, true, true, true]);
  const tree = out1(["rev-parse", `${main}^{tree}`], M.remote);
  const runs = readRuns({ repo: M.C, tree }).runs;
  const firstSha = firstHead && out1(["rev-parse", `${firstHead}^{commit}`], M.C);
  t("...with TWO gate runs in all, the retry's ONE a `--since <the GREEN tip>` gate",
    [r.gates, /^node tools\/gates\.mjs --with-never-cached \(tree/.test(r.gateLines[0] || ""), (r.gateLines[1] || "").startsWith(`node tools/gates.mjs --since ${firstSha} --with-never-cached `)], [2, true, true]);
  /* CORRECTED 2026-09-23 by M0-131: the first gate was asserted to be the bare `gates.mjs`, and the retry's `--since
     <tip>` alone. Both are narrowed selections, and a narrowed selection is a REUSE of what it leaves out, so under BOB
     #30's ruling each now also runs every never-cached unit (`--with-never-cached`); the old assertion pinned a gate
     that skipped the history readers on a new merge commit. */
  t("...and the landed tree's ONE gate record is class SINCE against that tip — NOT a FULL re-run",
    [runs.length, runs[0] && runs[0].verdict, runs[0] && runs[0].class, runs[0] && runs[0].since && runs[0].since.commit], [1, "GREEN", "SINCE", firstSha]);
  const { id, rec } = readRec(main);
  t("...and the pushed commit carries the RETRY's trailer, whose train record names it, its tree, the train it retries, and that gate",
    [/-retry1$/.test(id || ""), rec.head, rec.tree, !!rec.retryOf && id === `${rec.retryOf}-retry1`, rec.pushed, rec.gate && rec.gate.class, rec.gate && rec.gate.since],
    [true, main, tree, true, true, "SINCE", firstSha]);
  t("...and the guard verified the retry's mark on the push, and the landed ref is DELETED, verified from the remote",
    [/main carries the train's mark \(M0-111\)/.test(r.text), r.refs["land/alpha/m1"], onRemote(M.remote, "land/alpha/m1")], [true, "DELETED", ""]);

  const m2 = lane(M.A, "land/alpha/m2", "docs/notes/m2.md", "# alpha, while main never stops moving\n");
  moveScript(false);
  const b = train(M.C, ["run"], { TRAIN_FIXTURE_MOVE: script });
  rmSync(script, { force: true });
  t("THE RETRY IS BOUNDED — main moving under EVERY gate stops the train after 3 pushes, said, nothing landed",
    [b.status !== 0, /^train: attempt 3\/3 — push of \S+ REJECTED/m.test(b.text), /retry bound is spent/.test(b.summary), b.gates, isAncestor(M.remote, m2.sha)],
    [true, true, true, 3, false]);
  t("...and each retry's gate is `--since`, never FULL", b.gateLines.slice(1).every((l) => l.startsWith("node tools/gates.mjs --since ")) && b.gateLines.length === 3, true);
}

/* ========================================================================== */
section("M0-122 · A TREE ALREADY RECORDED GREEN LANDS WITHOUT A SECOND GATE — and a tree recorded RED is gated");
/* The lane here is a WORKTREE of the integrator's clone, so its gate writes its D-293 record into the SAME git common
   dir the train reads — the estate's shape, where every worktree of one clone shares `bio-gates/`. */
{
  const R = fixture("reuse");
  const wt = join(SANDBOX, "reuse-worktree");
  git(["worktree", "add", "-q", "-b", "wk", wt, "origin/main"], R.C);
  put(wt, "docs/notes/reuse.md", "# gated by its own lane\n"); commitAll(wt, "a lane's work, gated where it was made");
  const tip = out1(["rev-parse", "HEAD"], wt), tipTree = out1(["rev-parse", "HEAD^{tree}"], wt);
  const g = spawnSync(process.execPath, [join(wt, "tools/gates.mjs")], { cwd: wt, encoding: "utf8" });
  const own = readRuns({ repo: R.C, tree: tipTree }).runs;
  t("(the lane's own gate recorded its tip's tree GREEN in the clone's common dir)", [g.status, own.length, own[0] && own[0].verdict], [0, 1, "GREEN"]);
  const p = push(wt, "HEAD:refs/heads/land/alpha/reuse");
  t("(and its land/* push landed on the remote)", [p.status, onRemote(R.remote, "land/alpha/reuse")], [0, tip]);
  const r = train(R.C, ["run"]);
  if (r.status !== 0) console.log(r.text.split("\n").slice(-25).join("\n"));
  const main = onRemote(R.remote, "main");
  const runs = readRuns({ repo: R.C, tree: tipTree }).runs;
  /* CORRECTED 2026-09-23 by M0-131: this asserted NO gate run at all and ONE record for the tree. That was the defect:
     a tree record says nothing about the union's HISTORY (GitHub run #20, 4355bfda), so a reused tree now runs ONLY
     its never-cached units — one `gates.mjs --never-cached` run, a second record of class NEVERCACHE, and the full
     derived gate still NOT run. */
  t("A RECORDED-GREEN TREE LANDS WITH ONLY ITS NEVER-CACHED UNITS RUN — exit 0, landed, one `--never-cached` gate, and its record class NEVERCACHE",
    [r.status, isAncestor(R.remote, tip), r.gates, /^=== train · NO FULL GATE: tree \S+ is already recorded GREEN/m.test(r.text),
     /^node tools\/gates\.mjs --never-cached \(tree/.test(r.gateLines[0] || ""), runs.length, runs[1] && runs[1].class, runs[1] && runs[1].verdict],
    [0, true, 1, true, true, 2, "NEVERCACHE", "GREEN"]);
  const id = (out1(["log", "-1", "--format=%B", main], R.remote).match(/^Bio-Train: (\S+)$/m) || [])[1];
  const rf = id ? join(trainDir({ repo: R.C }), `${id}.json`) : "";
  const rec = rf && existsSync(rf) ? JSON.parse(readFileSync(rf, "utf8")) : {};
  t("...the landed tree IS the lane's tip's tree, the train record names the lane's own gate record, and the guard verified the mark",
    [out1(["rev-parse", `${main}^{tree}`], R.remote), rec.gate && rec.gate.reused, rec.gate && rec.gate.file === (own[0] && own[0].file), rec.pushed, /main carries the train's mark \(M0-111\)/.test(r.text)],
    [tipTree, true, true, true, true]);

  /* The converse: a tree whose record is RED is gated, never reused. The RED is recorded AFTER the lane's push (the
     D-293 guard would refuse the push of a RED tree) and names plancheck, which the train's own gate re-runs. */
  git(["checkout", "-q", "-B", "wk2", "origin/main"], wt);
  put(wt, "docs/notes/reuse2.md", "# recorded red\n"); commitAll(wt, "a lane whose tree is recorded RED");
  const t2 = out1(["rev-parse", "HEAD"], wt), t2Tree = out1(["rev-parse", "HEAD^{tree}"], wt);
  push(wt, "HEAD:refs/heads/land/alpha/reuse2");
  appendRun({ repo: R.C, run: { tree: t2Tree, verdict: "RED", class: "DOCS", steps: [{ label: "plancheck --local", units: ["plancheck"], ok: false }] } });
  const r2 = train(R.C, ["run"]);
  t("OVER-REUSE CLOSED — a tree recorded RED is GATED by the train (one gate run), and lands once that gate is GREEN",
    [r2.status, r2.gates, /NO FULL GATE/.test(r2.text), isAncestor(R.remote, t2)], [0, 1, false, true]);
  git(["worktree", "remove", "--force", wt], R.C);
}

/* ========================================================================== */
section("M0-131 · A REUSED GREEN TREE STILL RUNS THE NEVER-CACHED UNITS — a merge that drops a carried edit is REFUSED by name");
/* The 4355bfda shape, built in a fixture of its own. The fixture carries a HISTORY-READING suite, `carry.test.mjs`,
   marked `GATE: never-cache (history)` (the marker is written line by line below, so THIS file declares nothing): for
   every commit reachable from HEAD whose message carries `Carry: <path> :: <line>`, the tree must still hold that line.
   And a battery that really runs the suites it is named (the shared stub exits 0 whatever it is asked).
   THE SHAPE: a lane gates its work GREEN (tree T0); main then lands a CARRIED edit E; the lane takes main in with
   `merge -s ours`, which keeps T0 EXACTLY and drops E. So the lane's tip, and the train's `--no-ff` union, have T0 —
   recorded GREEN — while their history now holds E's carry, which T0 does not. Only a unit reading HISTORY sees it.
   HOW A LIAR PASSES, AND WHICH ASSERTION CATCHES IT: skipping the never-cached run on reuse (M0-122's shape) or deriving
   an EMPTY set lands the bad merge — "...IS REFUSED BY THE TRAIN NAMING THE CHECK" fails, and "THE DERIVED SET" fails;
   running the set but ignoring its verdict also lands it — the refusal fails while the derived-set assertion holds. */
{
  const CARRY = ["import { execFileSync } from \"node:child_process\";",
    "import { readFileSync, existsSync } from \"node:fs\";",
    "import { join, dirname } from \"node:path\";",
    "import { fileURLToPath } from \"node:url\";",
    "// GATE: never-cache (history)",
    "const ROOT = join(dirname(fileURLToPath(import.meta.url)), \"../..\");",
    "const log = execFileSync(\"git\", [\"log\", \"--format=%B%x01\", \"HEAD\"], { cwd: ROOT, encoding: \"utf8\" });",
    "let seen = 0, bad = 0;",
    "for (const m of log.matchAll(/^Carry: (\\S+) :: (.+)$/gm)) {",
    "  seen++;",
    "  const f = join(ROOT, m[1]);",
    "  if (!(existsSync(f) && readFileSync(f, \"utf8\").includes(m[2]))) { bad++; console.log(`  FAIL  carried edit dropped: ${m[1]} no longer holds \"${m[2]}\"`); }",
    "}",
    "console.log(`carry: ${seen} carried edit(s) in HEAD's history, ${bad} dropped from its tree`);",
    "process.exit(bad ? 1 : 0);", ""].join("\n");
  const BATTERY = ["import { readdirSync, writeFileSync } from \"node:fs\";",
    "import { spawnSync } from \"node:child_process\";",
    "import { join, dirname } from \"node:path\";",
    "import { fileURLToPath } from \"node:url\";",
    "const TEST = join(dirname(fileURLToPath(import.meta.url)), \"../test\");",
    "const want = process.argv.slice(2);",
    "const files = readdirSync(TEST).filter((f) => f.endsWith(\".test.mjs\") && (!want.length || want.some((w) => f.includes(w)))).sort();",
    "const failed = [], passed = [];",
    "for (const f of files) (spawnSync(process.execPath, [join(TEST, f)], { stdio: \"inherit\" }).status === 0 ? passed : failed).push(`plane:${f}`);",
    "if (process.env.BIO_BATTERY_VERDICT) writeFileSync(process.env.BIO_BATTERY_VERDICT, JSON.stringify({ v: 1, verdict: failed.length ? \"RED\" : \"GREEN\", failed, passed }));",
    "console.log(`battery (fixture): ${files.length} suite(s) · failed: ${failed.join(\", \") || \"none\"}`);",
    "process.exit(failed.length ? 1 : 0);", ""].join("\n");
  const K = fixture("carry", { "bio-plane/test/carry.test.mjs": CARRY, "bio-plane/scripts/battery.mjs": BATTERY });
  const wt = join(SANDBOX, "carry-worktree");
  git(["worktree", "add", "-q", "-b", "drop", wt, "origin/main"], K.C);
  put(wt, "docs/notes/lane.md", "# the lane's work, gated before main moved\n"); commitAll(wt, "a lane's work");
  const t0 = out1(["rev-parse", "HEAD^{tree}"], wt);
  const g0 = spawnSync(process.execPath, [join(wt, "tools/gates.mjs")], { cwd: wt, encoding: "utf8" });
  const own = readRuns({ repo: K.C, tree: t0 }).runs;

  /* main lands a CARRIED edit through the train, so its gate is the ordinary one — which now carries the never-cached
     units too, and must pass them here (the carry is in the tree). */
  const e = lane(K.B, "land/beta/carry", "docs/notes/carried.md", "# carried\n\nthe carried line\n",
    "beta carries an edit\n\nCarry: docs/notes/carried.md :: the carried line");
  const re = train(K.C, ["run"]);
  if (re.status !== 0) console.log(re.text.split("\n").slice(-25).join("\n"));
  t("(the fixture: the lane's tree T0 is recorded GREEN; main then landed the carried edit, through an ordinary gate that ran the never-cached carry check)",
    [g0.status, own.length, own[0] && own[0].verdict, re.status, isAncestor(K.remote, e.sha),
     /^node tools\/gates\.mjs --with-never-cached \(tree/.test(re.gateLines[0] || ""), /NEVER-CACHED plane:carry\.test\.mjs/.test(re.text)],
    [0, 1, "GREEN", 0, true, true, true]);

  git(["fetch", "-q", "origin"], wt);
  git(["merge", "-q", "-s", "ours", "--no-edit", "origin/main"], wt);
  const tip = out1(["rev-parse", "HEAD"], wt);
  const p = push(wt, "HEAD:refs/heads/land/alpha/drop");
  t("(the lane's `merge -s ours` kept T0 exactly and dropped the carried file; its tip descends from the carry; its land/* push landed)",
    [out1(["rev-parse", "HEAD^{tree}"], wt), existsSync(join(wt, "docs/notes/carried.md")), isAncestor(K.remote, e.sha, "main") && git(["merge-base", "--is-ancestor", e.sha, tip], wt).status === 0, p.status, onRemote(K.remote, "land/alpha/drop")],
    [t0, false, true, 0, tip]);

  const before = onRemote(K.remote, "main");
  const r = train(K.C, ["run"]);
  const ncLine = (r.text.match(/^train: the reused tree's never-cached run — (\S+(?: \S+)?), (\d+) unit\(s\) run: ([^\n]*)$/m) || []);
  const derived = (ncLine[3] || "").split(", ").filter((x) => x && x !== "NONE");
  t("(the train REUSED the tree record: the union's tree is T0, recorded GREEN, and its one gate was `--never-cached`)",
    [/^=== train · NO FULL GATE: tree \S+ is already recorded GREEN/m.test(r.text), r.gates, /^node tools\/gates\.mjs --never-cached \(tree/.test(r.gateLines[0] || "")],
    [true, 1, true]);
  t("THE DERIVED SET IS NOT EMPTY — the reused tree's never-cached run ran the history check (plane:carry.test.mjs), derived from its marker, and plancheck",
    [derived.length > 0, derived.includes("plane:carry.test.mjs"), derived.includes("plancheck")], [true, true, true]);
  t("A UNION WHOSE TREE IS RECORDED GREEN BUT WHOSE MERGE DROPS A CARRIED EDIT IS REFUSED BY THE TRAIN NAMING THE CHECK — exit non-zero, main unmoved, returned naming plane:carry.test.mjs",
    [r.status !== 0, onRemote(K.remote, "main"), /^train: RED at plane:carry\.test\.mjs/m.test(r.summary),
     r.returned.some((l) => l.includes("land/alpha/drop") && l.includes("to lane alpha") && l.includes("plane:carry.test.mjs"))],
    [true, before, true, true]);
  if (r.status === 0) console.log(r.text.split("\n").slice(-25).join("\n"));

  /* OVER-STRICTNESS: the same reuse, over a history that carries its edit, lands with only the never-cached run. */
  push(wt, ":refs/heads/land/alpha/drop");   /* the lane takes its branch back */
  git(["fetch", "-q", "origin"], wt);
  git(["checkout", "-q", "-B", "good", "origin/main"], wt);
  put(wt, "docs/notes/good.md", "# the lane's work, on a main that carries its edit\n"); commitAll(wt, "a lane's good work");
  const good = out1(["rev-parse", "HEAD"], wt);
  const g1 = spawnSync(process.execPath, [join(wt, "tools/gates.mjs")], { cwd: wt, encoding: "utf8" });
  push(wt, "HEAD:refs/heads/land/alpha/good");
  const ok = train(K.C, ["run"]);
  if (ok.status !== 0) console.log(ok.text.split("\n").slice(-25).join("\n"));
  t("OVER-STRICTNESS — a reused GREEN tree whose history KEEPS its carried edit lands, with only the never-cached units run",
    [g1.status, ok.status, isAncestor(K.remote, good), /NO FULL GATE/.test(ok.text), /^train: the reused tree's never-cached run — GREEN, \d+ unit\(s\) run: [^\n]*plane:carry\.test\.mjs/m.test(ok.text)],
    [0, 0, true, true, true]);
  git(["worktree", "remove", "--force", wt], K.C);
}

/* ========================================================================== */
section("M0-159 — A `--drop` THAT NAMES NOTHING REFUSES THE TRAIN; a comma list drops each branch it names");
{
  /* THE INCIDENT, DRIVEN (2026-09-24 07:08Z): `run --drop a,b,c` read the comma list as ONE branch name, which matched
     no WAITING row, so the train dropped NOTHING and began merging every waiting branch — the forbidden ones included.
     It was killed by PID before any gate or push. The only sign was `dropped: a,b,c` beside the waiting count, which
     reads exactly like it worked, so this section asserts on what MERGED and on the REMOTE, never on that line alone.
     HOW A LIAR PASSES THIS SECTION, stated before what it checks: a train that refused EVERY `--drop` would pass the
     refusal arm, so the valid comma list is asserted to LAND the branch it did not name and to leave the two it did
     WAITING on the remote; and a refusal read from the exit status alone would pass over a train refused for any
     other reason, so each refusal is read from the train's OWN text, naming the unknown entry. Its own fixture, so
     nothing here cascades from the sections above or into them. */
  /* THREE FIXTURES, AND THE REASON IS THE CONTROL, MEASURED: each REFUSAL arm here, when the control disarms it, lets
     its train MERGE AND PUSH — which moves every later assertion in the SAME fixture and makes a cascade
     indistinguishable from a collateral red. Control arm 10's first run proved it: with the refusal dropped, the
     unmatched-entry train landed, and the bare-flag assertion sharing its fixture went red on `main` having moved,
     against a declaration that said it must not. So each refusing arm has a fixture of its own (R and T), the
     dropping arms have S, and no arm's train can reach another's remote. */
  const R = fixture("dropbad");
  const d1 = lane(R.A, "land/alpha/d1", "docs/notes/d1.md", "# d1\n");
  const d2 = lane(R.B, "land/beta/d2", "docs/notes/d2.md", "# d2\n");
  const d3 = lane(R.A, "land/alpha/d3", "docs/notes/d3.md", "# d3\n");
  const before = onRemote(R.remote, "main");
  t("(fixture R: three lanes waiting, all three pushed, main not yet moved)",
    [d1.status, d2.status, d3.status, isAncestor(R.remote, d1.sha)], [0, 0, 0, false]);

  const bad = train(R.C, ["run", "--drop", "land/alpha/d1,land/typo/nope"]);
  t("A --drop ENTRY NAMING NO BRANCH REFUSES THE TRAIN BY NAME — nothing merged, no gate run, main unmoved, the unknown entry named",
    [bad.status !== 0, /^train: REFUSED — --drop names 1 branch\(es\) this train cannot drop/m.test(bad.summary),
     bad.text.includes("land/typo/nope"), bad.gates, onRemote(R.remote, "main"), isAncestor(R.remote, d1.sha), isAncestor(R.remote, d3.sha)],
    [true, true, true, 0, before, false, false]);
  /* READ FROM THE REFUSAL'S OWN LINE, never from `bad.text`: MEASURED by control arm 10's first run, a train that
     merged instead of refusing ALSO contained all three names, because it logs `WAITING <branch>` for each — an
     equality that costs nothing to produce, and the assertion passed over the disarmed subject. */
  const couldDrop = ((bad.summary || "").match(/What it could drop: ([^·]+)/) || [])[1] || "";
  t("...and the REFUSAL ITSELF names what it could have dropped, so the operator can see the spelling it missed",
    ["land/alpha/d1", "land/beta/d2", "land/alpha/d3"].every((b) => couldDrop.includes(b)), true);

  /* THE SAME CLASS ONE LEVEL OUT: `--drop` as the LAST token yields no value at all, so no entry reaches the check
     above and the train would merge everything — the incident's own shape in the one spelling the check cannot see.
     Its own fixture, because disarming the check above lets that train land (see the three-fixtures note). */
  const T_ = fixture("dropbare");
  const f1 = lane(T_.A, "land/alpha/f1", "docs/notes/f1.md", "# f1\n");
  const beforeT = onRemote(T_.remote, "main");
  const bareDrop = train(T_.C, ["run", "--drop"]);
  t("A FLAG WITH NO VALUE AFTER IT IS REFUSED BY NAME — a bare trailing --drop merges nothing and main does not move",
    [bareDrop.status !== 0, /^train: REFUSED — --drop given with no value after it/m.test(bareDrop.text),
     bareDrop.gates, f1.status, isAncestor(T_.remote, f1.sha), onRemote(T_.remote, "main")],
    [true, true, 0, 0, false, beforeT]);

  const S = fixture("dropok");
  const e1 = lane(S.A, "land/alpha/e1", "docs/notes/e1.md", "# e1\n");
  const e2 = lane(S.B, "land/beta/e2", "docs/notes/e2.md", "# e2\n");
  const e3 = lane(S.A, "land/alpha/e3", "docs/notes/e3.md", "# e3\n");
  const ok = train(S.C, ["run", "--drop", "land/alpha/e1,land/beta/e2"]);
  t("A VALID COMMA LIST DROPS EACH BRANCH IT NAMES — the one not named lands; the two named do not, and their refs are kept for their lanes",
    [ok.status, isAncestor(S.remote, e3.sha), isAncestor(S.remote, e1.sha), isAncestor(S.remote, e2.sha),
     onRemote(S.remote, "land/alpha/e1"), onRemote(S.remote, "land/beta/e2")],
    [0, true, false, false, e1.sha, e2.sha]);
  t("...and the train's own line names both dropped branches separately, never the comma list as one name",
    /· dropped: land\/alpha\/e1, land\/beta\/e2/.test(ok.text), true);

  /* OVER-STRICTNESS — a correct drop in a spelling this change did not anticipate must PASS: an `origin/` prefix (the
     spelling `train.mjs list` does NOT print, but `--branch` has always accepted) and a space after the comma. */
  const e4 = lane(S.B, "land/beta/e4", "docs/notes/e4.md", "# e4\n");
  const loose = train(S.C, ["run", "--drop", "origin/land/alpha/e1, land/beta/e2"]);
  t("OVER-STRICTNESS — an origin/ prefix and a space after the comma are ACCEPTED and DROP: e4 lands, the two named still do not",
    [loose.status, /REFUSED — --drop/.test(loose.text), isAncestor(S.remote, e4.sha), isAncestor(S.remote, e1.sha), isAncestor(S.remote, e2.sha)],
    [0, false, true, false, false]);

  /* THE LIMIT, DRIVEN rather than implied closed: the check accepts any row `list` names, not only a WAITING one. A
     drop naming a row that could never merge anyway (MALFORMED here; a LANDED one the same) is a NO-OP, not a typo —
     a branch that lands between the operator's `list` and the run must not become a refusal. */
  const mal = lane(S.B, "land/malformed", "docs/notes/mal.md", "# no lane in this name\n");
  const e5 = lane(S.A, "land/alpha/e5", "docs/notes/e5.md", "# e5\n");
  const limit = train(S.C, ["run", "--drop", "land/malformed"]);
  t("THE LIMIT — a drop naming a listed row that could never merge (MALFORMED) is ACCEPTED as a no-op, not refused, and the train lands",
    [limit.status, /REFUSED — --drop/.test(limit.text), isAncestor(S.remote, e5.sha), mal.status,
     limit.returned.some((l) => l.includes("land/malformed") && l.includes("MALFORMED"))],
    [0, false, true, 0, true]);
}

/* ========================================================================== */
section("FOOT");
t(`FOOT — all ${SECTIONS} sections reached (a section that dies silently cannot leave a green count)`, reached, SECTIONS);
rmSync(SANDBOX, { recursive: true, force: true });
console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
