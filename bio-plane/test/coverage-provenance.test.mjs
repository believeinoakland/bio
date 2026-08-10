/* M0-16 / D-238: `coverage.mjs` MUST NAME ANY SUITE OR MANIFEST IT COUNTED THAT
 * IS NOT IN A COMMIT — AND MUST PRINT THE FIGURE A FLOOR MAY BE MOVED TO.
 *
 * WHY THIS SUITE EXISTS, AND WHY IT IS A SEPARATE ITEM FROM M0-15's. M0-15 closed
 * the battery's two discovery walks and NAMED the five it had not closed rather
 * than quietly fixing its own and stopping. `coverage.mjs` has three of them:
 * `test/` (the suites, and therefore the whole negative-control register), and
 * the repository root twice (fleet manifests, and Worker directories).
 *
 * THE CONSEQUENCE IS NOT HYPOTHETICAL AND IS THE REASON THIS IS AN ITEM. The
 * `REGISTER_FLOOR` in `scripts/coverage.mjs` is MOVED BY HAND to a figure a green
 * run PRINTED — seven different items moved it on 2026-08-08 alone, several of
 * them by CONDUCT at integration. A floor moved while a phantom suite was present
 * is PERMANENTLY TOO HIGH: it fails every honest run afterwards, and a gate that
 * fails honest runs gets switched off — which is `VERIFICATION.md`'s own stated
 * reason for not making `--strict` the gate yet. The payload of this defect is
 * not a wrong number; it is a disabled ratchet.
 *
 * AND THE MANIFEST PATH IS THE LARGER HOLE, because a manifest enrols a whole
 * DIRECTORY rather than one file — arm (c) drives exactly that.
 *
 * WHAT IS ASSERTED HERE is the INSTRUMENT, driven end to end rather than read.
 * Each arm builds a throwaway git repository in this process's sandboxed $TMPDIR,
 * copies the REAL `scripts/coverage.mjs` and the REAL modules it imports into it,
 * and runs it. A source-shape assertion would pass over an instrument whose
 * report never fires; this drives the report.
 *
 * THE CORPUS IS PRINTED by every arm, because a check narrowed to nothing reports
 * a spotless corpus of zero and passes — and this project has already been bitten
 * by exactly that inside a control harness (M0-15's restore check used a
 * BSD-absent `xargs` flag, compared two EMPTY files, and reported them
 * byte-identical: the sha256 of the empty string).
 *
 * NEGATIVE CONTROL: (0) neuter the guard — delete the `off.length` early return
 * from `reportProvenance` in scripts/provenance.mjs so nothing is ever named ->
 * arms (b) (c) (d) (e) FAIL as a DELTA with the corpus PRINTED, while (a) (f) (g)
 * and the reach arm stay green. RUN 2026-08-08, armed ALONE
 * (`sh test/coverage-provenance.control.sh`), each restore verified by sha256 AND
 * by `cmp` against a uniquely-named per-arm pristine copy. The arms:
 *   (a) OVER-STRICTNESS, first direction — a committed suite, a committed fleet
 *       manifest and an untracked NON-suite file must all pass IN SILENCE. An
 *       instrument that cries phantom on honest work gets ignored, which is the
 *       same end as one that never fires.
 *   (b) plant an untracked SUITE carrying a control declaration -> the run must
 *       NAME it, call it UNTRACKED, and print the REPRODUCIBLE register figures
 *       beside the contaminated ones. A passing phantom is the case that actually
 *       happened, so a check that only named failures would have missed it.
 *   (c) plant an untracked FLEET MANIFEST -> NAMED, identified as a manifest, and
 *       the suite the manifest ADMITTED is named too. This is the arm for the
 *       larger hole: a manifest enrols a DIRECTORY, and the fleet count rises.
 *   (d) THE ARM THAT PROVES `ls-tree` AND NOT `git status` — the same phantom,
 *       merely IGNORED rather than untracked. `git status` is asserted EMPTY in
 *       this arm, and the run must STILL name the file. `.claude/worktrees/` is
 *       ignored in this repository, so this is the case that actually hid.
 *   (e) a suite `git add`ed but never committed -> NAMED, and distinguished from
 *       UNTRACKED: "I have not committed yet" and "this arrived from somewhere
 *       else" are different claims about the same absence.
 *   (f) git cannot answer -> UNVERIFIED, never clean, and the floor block says
 *       plainly not to move a floor from those figures.
 *   (g) REACH, and it is a correction this item made: `coverage.mjs`'s fleet walk
 *       carried NO dotfile filter while the battery's always has, so a manifest
 *       under a dot-directory could be ENROLLED HERE AND NEVER RUN THERE. A
 *       manifest under `.claude/` must now be invisible to both.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { mkdtempSync, mkdirSync, writeFileSync, copyFileSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
/* Built from the instrument's own constant, never typed as a literal: a real
   marker written in this file would plant a declaration in the corpus the
   register reads, and this suite's fixtures would then be counted as its own. */
import { CONTROL_MARKER } from "../scripts/control-register.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const SCRIPTS = join(DIR, "..", "scripts");
/* The REAL instrument and the REAL modules it imports. A fixture copy of the
   check would agree with itself at zero cost and prove nothing about what runs. */
/* D-277, 2026-08-09: `declared-source.mjs` and `walkfloor.mjs` JOIN THE LIST, and
   this list being hand-kept is why the addition is stated rather than made
   quietly. `coverage.mjs` now takes its check-catalog corpus from DECLARED CODE
   instead of raw source, through `declared-source.mjs`, which imports the
   estate's ONE comment-stripping lexer out of `walkfloor.mjs` rather than
   growing a third copy of it. Miss either here and the scratch repository throws
   ERR_MODULE_NOT_FOUND, this suite reports nineteen failures with no obvious
   cause, and the failure is in the HARNESS. Measured on the day: dropping them
   left `9 pass, 19 fail`. */
const REAL = ["coverage.mjs", "control-register.mjs", "provenance.mjs",
              "declared-source.mjs", "walkfloor.mjs"];

let pass = 0, fail = 0;
const t = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  if (!ok) console.log(`FAIL: ${name}\n  got:  ${JSON.stringify(got)}\n  want: ${JSON.stringify(want)}`);
};

/* ---- the smallest tree `coverage.mjs` can measure at all ------------------ */
const opsSrc = `const OPS = {\n  ping: { mutating: false, classes: null },\n};\nexport { OPS };\n`;
const checksSrc = `/* C-1.1 the scratch catalog's only check */\nexport const CHECKS = ["C-1.1"];\n`;
/* A suite that reaches the op through the control plane, names the check, and
   declares a control with `arms` countable arms — so a PHANTOM moves the register
   figures and the contaminated/reproducible difference is real rather than nominal. */
const suiteSrc = (arms) =>
  `/* ${CONTROL_MARKER} the arms, each RUN\n`
  + Array.from({ length: arms }, (_, i) => `   (${i + 1}) break check ${i + 1} -> its own assertion fails`).join("\n")
  /* `doGet("ping")` and NOT the query-parameter spelling, deliberately.
     `op-claims.test.mjs` sweeps every comment in this estate for a query-shaped op
     mention and refuses one the plane's dispatch table does not route — and it
     caught this fixture naming `ping`, which exists only inside a scratch
     repository this suite builds. The instrument was right and the fixture was
     wrong. `coverage.mjs`'s call-shaped matcher reads this form equally well, so
     nothing about the arm changed. (Nor may this comment use that spelling: the
     sweep reads comments, and an explanation of the rule must obey it.) */
  + ` */\n/* drives doGet("ping") via dispatchFetch, names C-1.1 */\nconsole.log("scratch ok");\n`;
const surfaceSrc = `const SURFACE = {\n  version: { mutating: false },\n};\nexport { SURFACE };\n`;
const memberSuiteSrc = `/* names "/version" */\nconsole.log("member ok");\n`;

let corpus = 0;
/* Build a throwaway repository, run the REAL instrument in it, return its output.
   `commit` lands in a commit; `stage` is written and `git add`ed but not
   committed; `leave` is written afterwards and never committed; `ignore` is a
   list of patterns written into a COMMITTED .gitignore before anything else. */
const drive = ({ commit = {}, stage = {}, leave = {}, ignore = [], dropGit = false }) => {
  corpus++;
  const repo = mkdtempSync(join(tmpdir(), "m016-cov-"));
  const g = (...args) => spawnSync("git", ["-C", repo,
    "-c", "user.email=m016@example.invalid", "-c", "user.name=M0-16",
    "-c", "commit.gpgsign=false", ...args], { encoding: "utf8" });
  const put = (rel, body) => {
    mkdirSync(join(repo, dirname(rel)), { recursive: true });
    writeFileSync(join(repo, rel), body);
  };
  mkdirSync(join(repo, "bio-plane", "scripts"), { recursive: true });
  for (const f of REAL) copyFileSync(join(SCRIPTS, f), join(repo, "bio-plane", "scripts", f));
  put("bio-plane/src/index.mjs", opsSrc);
  put("bio-plane/checks/bio-checks.mjs", checksSrc);
  if (ignore.length) put(".gitignore", ignore.join("\n") + "\n");
  for (const [rel, body] of Object.entries(commit)) put(rel, body);
  g("init", "-q", "-b", "main");
  g("add", "-A");
  g("commit", "-q", "-m", "scratch base");
  for (const [rel, body] of Object.entries(stage)) put(rel, body);
  if (Object.keys(stage).length) g("add", "-A");
  for (const [rel, body] of Object.entries(leave)) put(rel, body);
  if (dropGit) rmSync(join(repo, ".git"), { recursive: true, force: true });
  const status = dropGit ? null : g("status", "--porcelain").stdout;
  const r = spawnSync(process.execPath, ["scripts/coverage.mjs"],
    { cwd: join(repo, "bio-plane"), encoding: "utf8", timeout: 60_000 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  rmSync(repo, { recursive: true, force: true });
  return { out, code: r.status, status };
};

const namesBlock = (out) => /NOT IN ANY COMMIT/.test(out);
const names = (out, path) => new RegExp(`^\\s+${path.replace(/[.\\/]/g, "\\$&")}\\s`, "m").test(out);
/* The two figures, read back out of the report rather than recomputed here. */
const armsPair = (out) => {
  const m = out.match(/(\d+) register arms were counted above; (\d+) of them come from suites/);
  return m ? [+m[1], +m[2]] : null;
};
const fleetCount = (out) => {
  const m = out.match(/^FLEET\s+(\d+) member/m);
  return m ? +m[1] : null;
};

const BASE = {
  "bio-plane/test/tracked.test.mjs": suiteSrc(5),
  "member-a/fleet-member.json": JSON.stringify({ name: "member-a" }),
  "member-a/src/index.mjs": surfaceSrc,
  "member-a/test/member.test.mjs": memberSuiteSrc,
};

/* ---- (a) OVER-STRICTNESS: honest work passes in silence ------------------- */
{
  const { out } = drive({
    commit: { ...BASE },
    leave: {
      "bio-plane/test/scratch-notes.md": "not a suite\n",
      "bio-plane/test/helper.mjs": "export const x = 1;\n",
      "m016-harness/arm.mjs": "// a worker's own control harness\n",
    },
  });
  t("(a) a committed tree prints no NOT-IN-ANY-COMMIT block", namesBlock(out), false);
  t("(a) it still states the provenance question was ASKED and answered",
    /provenance: \d+ of \d+ discovered item\(s\) are in the commit at HEAD/.test(out), true);
  t("(a) the committed suite is never named", names(out, "bio-plane/test/tracked.test.mjs"), false);
  t("(a) the committed fleet manifest is never named", names(out, "member-a/fleet-member.json"), false);
  t("(a) untracked NON-suite files produce no word at all",
    [/scratch-notes/.test(out), /m016-harness/.test(out)], [false, false]);
  t("(a) and no floor is described as contaminated",
    /MOVE THE FLOOR TO THE REPRODUCIBLE FIGURES/.test(out), false);
}

/* ---- (b) THE ARM THIS ITEM EXISTS FOR: a phantom SUITE inflates the register */
{
  const clean = drive({ commit: { ...BASE } });
  const { out } = drive({
    commit: { ...BASE },
    leave: { "bio-plane/test/phantom.test.mjs": suiteSrc(9) },
  });
  t("(b) the run NAMES the phantom suite", names(out, "bio-plane/test/phantom.test.mjs"), true);
  t("(b) and calls it UNTRACKED", /phantom\.test\.mjs\s+\(UNTRACKED\)/.test(out), true);
  t("(b) the CONTAMINATED and REPRODUCIBLE register arms are BOTH printed, and they differ",
    (() => { const p = armsPair(out); return p && p[0] === 14 && p[1] === 5; })(), true);
  t("(b) the reproducible figure equals what the clean tree printed — 5 arms, the phantom's 9 excluded",
    /REGISTER FLOOR  arms 5\//.test(out) && /REGISTER FLOOR  arms 5\//.test(clean.out), true);
  t("(b) and the reader is told, in the floor block, which figure to move a floor to",
    /MOVE THE FLOOR TO THE REPRODUCIBLE FIGURES AND NEVER TO THESE/.test(out), true);
  t("(b) the committed suite is still not named", names(out, "bio-plane/test/tracked.test.mjs"), false);
}

/* ---- (c) THE LARGER HOLE: an untracked MANIFEST enrols a whole directory --- */
{
  const clean = drive({ commit: { ...BASE } });
  const { out } = drive({
    commit: { ...BASE },
    leave: {
      "ghost-worker/fleet-member.json": JSON.stringify({ name: "ghost-worker" }),
      "ghost-worker/src/index.mjs": surfaceSrc,
      "ghost-worker/test/ghost.test.mjs": memberSuiteSrc,
    },
  });
  t("(c) the untracked manifest is named", names(out, "ghost-worker/fleet-member.json"), true);
  t("(c) and identified as a MANIFEST, not as a suite",
    /fleet-member\.json.*ghost-worker's fleet manifest/.test(out), true);
  t("(c) and the suite the manifest ADMITTED is named too",
    names(out, "ghost-worker/test/ghost.test.mjs"), true);
  t("(c) the manifest really did enrol a whole directory — the fleet count ROSE",
    [fleetCount(clean.out), fleetCount(out)], [1, 2]);
}

/* ---- (d) IGNORED, NOT UNTRACKED — the arm that proves `ls-tree` was used --- */
{
  const { out, status } = drive({
    commit: { ...BASE },
    ignore: ["phantom.test.mjs"],
    leave: { "bio-plane/test/phantom.test.mjs": suiteSrc(9) },
  });
  t("(d) `git status` is EMPTY in this arm — an IGNORED file is invisible to it",
    status.trim(), "");
  t("(d) and the run NAMES the phantom anyway, because it asked the COMMIT",
    names(out, "bio-plane/test/phantom.test.mjs"), true);
  t("(d) still as UNTRACKED — ignoring a file is not committing it",
    /phantom\.test\.mjs\s+\(UNTRACKED\)/.test(out), true);
  t("(d) and the register figures are still split", (() => {
    const p = armsPair(out); return p && p[0] === 14 && p[1] === 5;
  })(), true);
}

/* ---- (e) staged but never committed, told apart from an arrival ------------ */
{
  const { out } = drive({
    commit: { ...BASE },
    stage: { "bio-plane/test/mine.test.mjs": suiteSrc(2) },
  });
  t("(e) a staged-but-uncommitted suite is named", names(out, "bio-plane/test/mine.test.mjs"), true);
  t("(e) and is distinguished from an arrival, not lumped with it",
    /mine\.test\.mjs\s+\(staged, not yet committed\)/.test(out), true);
}

/* ---- (f) git cannot answer -> UNVERIFIED, never clean ---------------------- */
{
  const { out } = drive({ commit: { ...BASE }, dropGit: true });
  t("(f) with no git to ask, the run says UNVERIFIED", /provenance: UNVERIFIED/.test(out), true);
  t("(f) and does NOT claim everything is in a commit",
    /are in the commit at HEAD/.test(out), false);
  t("(f) it says plainly that is a different claim from 'all in a commit'",
    /not the same claim as "all in a commit"/.test(out), true);
  t("(f) and the floor block refuses to let a figure be quoted from it",
    /Do not move a floor from them/.test(out), true);
}

/* ---- (g) REACH: the dotfile filter this item added to the fleet walk ------- */
{
  const { out } = drive({
    commit: {
      ...BASE,
      ".claude/worktrees/other/fleet-member.json": JSON.stringify({ name: "another-checkout" }),
      ".claude/worktrees/other/src/index.mjs": surfaceSrc,
    },
  });
  t("(g) a manifest under a DOT directory is not enrolled — coverage now agrees with the battery",
    [fleetCount(out), /another-checkout/.test(out)], [1, false]);
}

/* THE REACH ARM. Every assertion above is a DELTA over a scratch repository this
   suite built, so the corpus is STATED rather than assumed: an instrument
   narrowed to nothing would report a clean tree eight times and pass. */
console.log(`corpus: ${corpus} scratch repositories driven through the REAL scripts/coverage.mjs`);
/* 9, not 10: seven arms, and (b) and (c) each drive a CLEAN tree as well so their
   deltas are measured rather than asserted against a remembered figure. This
   figure was written 10 on first draft and the arm caught it immediately, which is
   the only reason it is worth having — an absolute the author supplies is exactly
   the kind of number that goes stale. */
t("the reach arm drove every scratch repository it declared", corpus, 9);

console.log(`\ncoverage-provenance: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
