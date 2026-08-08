/* M0-15 / D-238: THE BATTERY MUST NAME ANY SUITE IT RAN THAT IS NOT IN A COMMIT.
 *
 * WHY THIS SUITE EXISTS. On 2026-08-08 a worker's first baseline discovered 124
 * suites including `machinefences-dec49.test.mjs` (57 pass) — another worker's
 * file, UNTRACKED, in no commit, and gone by the next run. Every worker in this
 * project is instructed to MEASURE ITS OWN BASELINE AND TRUST IT OVER ITS BRIEF;
 * a baseline that silently includes a phantom makes that instruction produce a
 * WRONG NUMBER WITH FULL CONFIDENCE, which is strictly worse than the stale
 * briefs it defeats — a stale brief is corrected by measurement, and this
 * defeats measurement itself.
 *
 * THE MECHANISM is named in `scripts/battery.mjs`'s own header and measured in
 * MEASUREMENTS.md: `git stash` is REPOSITORY-WIDE, not per-worktree, so a `pop`
 * in one worktree can deposit another worker's untracked files — including a
 * whole `.test.mjs` — into a tree that never wrote them.
 *
 * WHAT IS ASSERTED HERE is the RUNNER, driven end to end rather than read. Each
 * arm builds a throwaway git repository in this process's sandboxed $TMPDIR,
 * copies the REAL `scripts/battery.mjs` into it, and runs it. A source-shape
 * assertion would pass over a runner whose report never fires; this drives the
 * report.
 *
 * THE CORPUS IS PRINTED by every arm, because a check narrowed to nothing
 * reports a beautiful 100% over an empty corpus — the failure mode M0-14's
 * register floor exists to catch, one instrument over.
 *
 * NEGATIVE CONTROL: (1) delete the `off.length` branch from scripts/battery.mjs's
 * provenance block, so an uncommitted suite runs unnamed -> arms (b) (c) (e) and
 * (f) FAIL naming the file the run counted and never mentioned. RUN 2026-08-08
 * (`sh test/battery-provenance.control.sh arm3`, armed ALONE): branch made unreachable -> 14
 * pass, **9 fail** over a CORPUS OF 7 scratch repositories PRINTED by the suite;
 * restored, verified by sha256 (99fe720b…) AND by `cmp`, 23 pass 0 fail.
 * **DECLARED 8 FAILS AND GOT 9, AND THE DISCREPANCY IS RECORDED RATHER THAN THE
 * DECLARATION QUIETLY REWRITTEN:** the ninth is (b)'s "the contaminated total and
 * the reproducible total are BOTH printed", which also lives inside the neutered
 * branch. Arms (d) (g) (h) and the reach arm stayed GREEN as declared, which is
 * what makes this a delta rather than a suite falling over.
 *   (b) plant an untracked PASSING suite -> the runner must NAME it; a passing
 *       phantom is the case that actually happened, so a check that only names
 *       failures would have missed the whole defect.
 *   (c) plant an untracked FAILING suite -> still NAMED, and the run still
 *       reports the failure; provenance and result are independent claims.
 *   (d) OVER-STRICTNESS, first direction: a legitimately COMMITTED suite must
 *       pass without a word.
 *   (e) a suite `git add`ed but never committed -> NAMED, and distinguished from
 *       UNTRACKED, because "I have not committed yet" and "this arrived from
 *       somewhere else" are different claims about the same absence.
 *   (f) an untracked FLEET MANIFEST -> NAMED. Discovery has TWO paths since
 *       CPDF-9 and a manifest enrols a whole DIRECTORY, so it is the larger hole.
 *   (g) OVER-STRICTNESS, second direction: an untracked NON-suite file in the
 *       same directory must produce no word at all.
 *   (h) git unable to answer -> the run must say UNVERIFIED, never report clean.
 *       An instrument that reports "all good" when it could not look is D-233.
 */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { mkdtempSync, mkdirSync, writeFileSync, copyFileSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

const DIR = dirname(fileURLToPath(import.meta.url));
const REAL_RUNNER = join(DIR, "..", "scripts", "battery.mjs");
/* M0-16: the provenance rule moved into its own module and the runner imports it,
   so the scratch repository needs BOTH files or the runner cannot start. Copied
   from the real tree for the same reason the runner is: a fixture copy of the
   check would agree with itself and prove nothing about what actually runs. */
/* D-237 added `residue.mjs` to the runner's imports, so the scratch repository
   needs it too or the runner cannot start — which is exactly what happened on
   the first full battery after that item, and it is this list's whole purpose.
   Corrected, not exempted: the arms below are unchanged and still 23 pass. */
const REAL_MODULES = ["provenance.mjs", "residue.mjs"];

let pass = 0, fail = 0;
const t = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  if (!ok) console.log(`FAIL: ${name}\n  got:  ${JSON.stringify(got)}\n  want: ${JSON.stringify(want)}`);
};

/* A suite the scratch battery can run in milliseconds. It prints the tail line
   the runner parses, which is the only contract a suite has with it. */
const suiteSrc = (n, failing) =>
  `console.log("scratch: ${n} pass, ${failing ? 1 : 0} fail");\n`
  + `process.exit(${failing ? 1 : 0});\n`;

let corpus = 0;
/* Build a throwaway repository, run the REAL runner in it, return its output.
   `commit` lands in a commit; `leave` is written afterwards and never committed;
   `stage` is written and `git add`ed but not committed. */
const drive = ({ commit = {}, stage = {}, leave = {}, dropGit = false }) => {
  corpus++;
  const repo = mkdtempSync(join(tmpdir(), "m015-prov-"));
  const g = (...args) => spawnSync("git", ["-C", repo,
    "-c", "user.email=m015@example.invalid", "-c", "user.name=M0-15",
    "-c", "commit.gpgsign=false", ...args], { encoding: "utf8" });
  const put = (rel, body) => {
    mkdirSync(join(repo, dirname(rel)), { recursive: true });
    writeFileSync(join(repo, rel), body);
  };
  mkdirSync(join(repo, "bio-plane", "scripts"), { recursive: true });
  mkdirSync(join(repo, "bio-plane", "test"), { recursive: true });
  copyFileSync(REAL_RUNNER, join(repo, "bio-plane", "scripts", "battery.mjs"));
  for (const m of REAL_MODULES)
    copyFileSync(join(DIR, "..", "scripts", m), join(repo, "bio-plane", "scripts", m));
  for (const [rel, body] of Object.entries(commit)) put(rel, body);
  g("init", "-q", "-b", "main");
  g("add", "-A");
  g("commit", "-q", "-m", "scratch base");
  for (const [rel, body] of Object.entries(stage)) put(rel, body);
  if (Object.keys(stage).length) g("add", "-A");
  for (const [rel, body] of Object.entries(leave)) put(rel, body);
  if (dropGit) rmSync(join(repo, ".git"), { recursive: true, force: true });
  const r = spawnSync(process.execPath, ["scripts/battery.mjs"],
    { cwd: join(repo, "bio-plane"), encoding: "utf8", timeout: 60_000 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  rmSync(repo, { recursive: true, force: true });
  return { out, code: r.status };
};

/* The line the report prints when it found nothing wrong, and the block it
   prints when it did. Matched separately so an arm cannot pass on the wrong one. */
const namesBlock = (out) => /NOT IN ANY COMMIT/.test(out);
const names = (out, path) => new RegExp(`^\\s+${path.replace(/[.\\/]/g, "\\$&")}\\s`, "m").test(out);

const BASE = { "bio-plane/test/tracked.test.mjs": suiteSrc(5, false) };

/* ---- (d) OVER-STRICTNESS: a committed suite, and nothing else ------------- */
{
  const { out, code } = drive({ commit: { ...BASE } });
  t("(d) a committed-only tree runs green", code, 0);
  t("(d) a committed-only tree prints no NOT-IN-ANY-COMMIT block", namesBlock(out), false);
  t("(d) it still states the provenance question was ASKED and answered",
    /provenance: \d+ of \d+ discovered item\(s\) are in the commit at HEAD/.test(out), true);
  t("(d) the committed suite is never named", names(out, "bio-plane/test/tracked.test.mjs"), false);
}

/* ---- (b) THE ARM THIS ITEM EXISTS FOR: a PASSING phantom ------------------ */
{
  const { out, code } = drive({
    commit: { ...BASE },
    leave: { "bio-plane/test/phantom.test.mjs": suiteSrc(57, false) },
  });
  t("(b) a passing phantom does not fail the run — which is why silence hid it", code, 0);
  t("(b) the run NAMES the phantom", names(out, "bio-plane/test/phantom.test.mjs"), true);
  t("(b) and calls it UNTRACKED", /phantom\.test\.mjs\s+\(UNTRACKED\)/.test(out), true);
  t("(b) the contaminated total (62) and the reproducible total (5) are BOTH printed",
    /62 assertions were counted above; 5 of them come from suites/.test(out), true);
  t("(b) the committed suite is still not named", names(out, "bio-plane/test/tracked.test.mjs"), false);
}

/* ---- (c) a FAILING phantom is named too ----------------------------------- */
{
  const { out, code } = drive({
    commit: { ...BASE },
    leave: { "bio-plane/test/phantom.test.mjs": suiteSrc(3, true) },
  });
  t("(c) a failing phantom fails the run", code, 1);
  t("(c) and is STILL named — provenance does not depend on the result",
    names(out, "bio-plane/test/phantom.test.mjs"), true);
}

/* ---- (e) staged but never committed, told apart from UNTRACKED ------------ */
{
  const { out } = drive({
    commit: { ...BASE },
    stage: { "bio-plane/test/mine.test.mjs": suiteSrc(2, false) },
  });
  t("(e) a staged-but-uncommitted suite is named", names(out, "bio-plane/test/mine.test.mjs"), true);
  t("(e) and is distinguished from an arrival, not lumped with it",
    /mine\.test\.mjs\s+\(staged, not yet committed\)/.test(out), true);
}

/* ---- (f) the SECOND discovery path: an untracked fleet MANIFEST ----------- */
{
  const { out } = drive({
    commit: { ...BASE },
    leave: {
      "ghost-worker/fleet-member.json": JSON.stringify({ name: "ghost-worker" }),
      "ghost-worker/test/ghost.test.mjs": suiteSrc(9, false),
    },
  });
  t("(f) the untracked manifest that enrolled a whole directory is named",
    names(out, "ghost-worker/fleet-member.json"), true);
  t("(f) and so is the suite it admitted", names(out, "ghost-worker/test/ghost.test.mjs"), true);
  t("(f) the manifest is identified as a manifest, not as a suite",
    /fleet-member\.json.*ghost-worker's fleet manifest/.test(out), true);
}

/* ---- (g) OVER-STRICTNESS: an untracked NON-suite says nothing ------------- */
{
  const { out, code } = drive({
    commit: { ...BASE },
    leave: {
      "bio-plane/test/scratch-notes.md": "not a suite\n",
      "bio-plane/test/helper.mjs": "export const x = 1;\n",
      "m015-harness/arm.mjs": "// a worker's own control harness\n",
    },
  });
  t("(g) untracked NON-suite files leave the run green", code, 0);
  t("(g) and produce no NOT-IN-ANY-COMMIT block at all", namesBlock(out), false);
  t("(g) a worker's own untracked harness directory is not named",
    /m015-harness/.test(out), false);
}

/* ---- (h) git cannot answer -> UNVERIFIED, never clean --------------------- */
{
  const { out } = drive({ commit: { ...BASE }, dropGit: true });
  t("(h) with no git to ask, the run says UNVERIFIED", /provenance: UNVERIFIED/.test(out), true);
  t("(h) and does NOT claim everything is in a commit",
    /are in the commit at HEAD/.test(out), false);
  t("(h) it says plainly that is a different claim from 'all in a commit'",
    /not the same claim as "all in a commit"/.test(out), true);
}

/* THE REACH ARM. Every assertion above is a DELTA over a scratch repository this
   suite built, so the corpus is stated rather than assumed: a check narrowed to
   nothing would report a clean tree seven times and pass. */
console.log(`corpus: ${corpus} scratch repositories driven through the REAL scripts/battery.mjs`);
t("the reach arm drove every scratch repository it declared", corpus, 7);

console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
