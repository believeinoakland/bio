/* M0-182 — EVERY CONTROL DRIVER'S PEN IS GRADED, AND THE `nc-*` CLASS KEEPS ITS PRISTINE COPY OUTSIDE THE WORKTREE.
 *
 * The row's accepts-when: *"the sweep reads 0 IN-WORKTREE (the measured failure it moves: 47 of 80)."*
 * `scripts/pensweep.mjs` is the sweep; this suite (1) holds the REAL estate to it — no driver in the floored
 * class names an untracked, unignored worktree path, the seven pens no `.gitignore` line covered are not named
 * again, no ledger entry has drifted, and the corpus is floored so a walk narrowed to nothing cannot pass —
 * and (2) drives the sweep over a SCRATCH estate whose every grade is known, BOTH DIRECTIONS, so a matcher
 * gone blind or gone generous fails here by name.
 *
 * HOW A LIAR PASSES THIS, stated before what it checks: build a pen path at RUNTIME out of something the walk
 * cannot resolve — a parameter, another module, a `.replace()` on an unknown — and be graded MEMORY, because a
 * driver that names no path names no dirty one. That hole is why arm (p7) plants exactly such a driver and
 * asserts it reads MEMORY rather than TEMP: the sweep must not claim a clean bill it cannot support. It is
 * also why the class was verified BY RUNNING the controls and reading `git status`, recorded on the NEGATIVE
 * CONTROL line below — the sweep is the ratchet, the run is the evidence.
 *
 * WHY A FLOOR ON THE CLASS AND NOT ON THE ESTATE: 55 drivers outside the floored class still keep an
 * in-worktree pen, and most are DECLARED — BOB #33 (2026-09-24 17:12Z, M0-172) ruled that a gitignored,
 * item-named pen is a driver's own mechanism and stands. This suite therefore floors the class M0-182 moved
 * and NAMES the rest, and the totals are asserted as CEILINGS that cannot grow, never as targets.
 *
 * NEGATIVE CONTROL: RUN 2026-09-24 by the M0-182 worker, driver `test/nc-m0182.mjs all` — 5 arms, each ALONE
 * with every other defence held open, each DECLARED before it ran, every restore verified by sha256 AND `cmp`
 * AND a floored byte count; BASELINE 31 pass / 0 fail, CLOSING BASELINE 31 pass / 0 fail, 5 AS DECLARED, 0 not.
 *   (p1) `nc-rec82.mjs`'s pen pointed BACK into the worktree (`controlPen("rec82")` -> `join(REPO,
 *        ".rec82-control-pristine")`) -> 31/4: THE ROW'S ACCEPTS-WHEN FAILS naming nc-rec82, with the CLI
 *        verdict, the estate ceiling and BOB #33's class-(a) arm beside it.
 *   (p2) the ignore probe asked of the path BARE only, without the trailing slash -> 29/6: the declared-pen
 *        arm (p3) fails, and so does the floored class. THIS ARM'S FIRST RUN IS WHERE THE SWEEP'S OWN DEFECT
 *        CAME FROM: `git check-ignore` will not match a `dir/` pattern against a path that does not exist, and
 *        on a clean tree NO pen exists, so before the fix every DECLARED pen in the estate read DIRTY —
 *        9 IN-WORKTREE/declared where the truth is 50. The arm was ALSO declared wrong (it named the
 *        floored-class assertion as held-open) and the driver's header records that correction.
 *   (p3) `stripComments` swapped for the raw source -> 28/7: (p5) fails, a pen path spelled in a driver's
 *        PROSE is read as named, and the ledger drifts because the walk now sees expressions in comments.
 *   (p4) one `UNIGNORED_PENS` name re-introduced into a driver -> 30/5: the pinned-BY-NAME arm FAILS naming
 *        `.m0107-harness`, which a count of dirty paths would not have distinguished.
 *   (p5) OVER-STRICTNESS — a correct pen in a spelling this item did not introduce
 *        (`mkdtempSync(join(tmpdir(), "nc-rec82-"))`) -> 35/0, nothing fails, as declared. THIS ARM IS WHAT
 *        SAYS THE SWEEP ENFORCES A PROPERTY AND NOT A HABIT, and CONDUCT #20's correction of 22:25Z makes it
 *        load-bearing: a per-run `mkdtemp` is ONE acceptable shape, a gitignored item-named in-tree pen is
 *        ANOTHER, and neither may be gated as though it were the only one.
 *   RE-RUN 2026-09-25 by the M0-196 worker after its change, anchor p3 moved to the new `code` line: 5 AS
 *   DECLARED, 0 not; baseline 41/0; p1 38/3, p2 35/6, p3 34/7, p4 37/4, p5 41/0; closing 41/0.
 *
 * NEGATIVE CONTROL: RUN 2026-09-25 by the M0-196 worker, driver `test/nc-m0196.mjs all` — the TREE-ROOT READ
 * of the copy-source drivers, 5 arms each ALONE and DECLARED, restores verified by sha256 AND `cmp` AND a
 * floored byte count; BASELINE 41/0, CLOSING 41/0, 5 AS DECLARED, 0 not.
 *   (n1) trailing-slash strip dropped -> 38/3: the ceiling (<= 13), the BY-NAME arm naming d510, d526, d547
 *        and rec180, and (m1); (m4), (m5) and d548 held.
 *   (n2) comma continuation dropped -> 38/3: the ceiling, BY-NAME naming d548-block, and (m4).
 *   (n3) `join`'s below-the-first-root reading dropped -> 38/3: the ceiling, BY-NAME naming d526, and (m5).
 *   (n4) THE ROW'S CONTROL, all three dropped -> 36/5: BY-NAME names all five drivers UNCLASSIFIED over the
 *        lowered ceiling.
 *   (n5) OVER-STRICTNESS, d526 rewritten to `/\/+$/` -> 41/0, nothing fails, as declared.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { sweepPens, report, isDriver, FLOORED, UNIGNORED_PENS, PEN_LEDGER, ignoreProbe, namedPaths } from "../scripts/pensweep.mjs";

let pass = 0, fail = 0;
const t = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; console.log(`  FAIL  ${name}\n          got  ${JSON.stringify(got)}\n          want ${JSON.stringify(want)}`); }
};

/* ============== 1. THE REAL ESTATE ============== */
console.log("\n--- 1. the real estate: the floored class keeps its pen outside the worktree ---");
const real = sweepPens();
const lines = [];
const code = report(real, (l) => lines.push(l));
console.log(lines[0]);
console.log(lines[1]);
const g = (n) => real.drivers.filter((d) => d.grade === n);
const floored = real.drivers.filter((d) => d.floored);
t("the walk RAN (a failed listing says nothing, and is not zero drivers)", real.walkFailed, false);
/* FLOORS, so a walk narrowed to nothing cannot pass: measured 2026-09-24 on this tree — 1335 corpus files,
   287 control drivers, 88 in the floored class — less a margin for honest deletions. */
t("the corpus is not narrowed to nothing (>= 1000 files; >= 200 drivers; >= 70 floored)",
  [real.corpus >= 1000, real.drivers.length >= 200, floored.length >= 70], [true, true, true]);
t("THE ROW'S ACCEPTS-WHEN: no driver in the floored class names an untracked, unignored worktree path",
  floored.filter((d) => d.grade === "IN-WORKTREE/DIRTY").map((d) => d.file), []);
t("...and none of the floored class is UNCLASSIFIED — an unreadable destination is not a clean bill",
  floored.filter((d) => d.grade === "UNCLASSIFIED").map((d) => d.file), []);
t("the floored class really does keep pens (>= 75 read TEMP of the 81 measured), so 'none dirty' is not a"
  + " claim over a class that writes nothing", floored.filter((d) => d.grade === "TEMP").length >= 75, true);
t("the seven pens no .gitignore line covered are not named again", real.unignoredBack.map((u) => u.pen), []);
t("no ledger entry has drifted — a judgement about a file that has since changed is not a judgement",
  real.ledgerDrift, []);
t("the CLI's verdict agrees (exit 0)", code, 0);
/* CEILINGS on the rest of the estate, NOT targets: BOB #33 let a declared in-worktree pen stand, so these
   are held where M0-182 left them and cannot grow in silence. Measured on this tree, 2026-09-24. */
t("the estate's in-worktree-DIRTY drivers have not grown past what M0-182 left (<= 55)", g("IN-WORKTREE/DIRTY").length <= 55, true);
/* CEILING RAISED 14 -> 15 at c20-batch27 (CONDUCT #20), with its reason, because a ceiling that rises owes one:
   `d510-promoted-type.control.mjs` (D-510, landed c20-batch25, AFTER M0-182's base) pens correctly — mkdtemp
   under tmpdir — but COPIES `join(REPO, "docprofile")` INTO it, and this walk reads a copy SOURCE as a path
   expression it cannot resolve. That is the instrument's blind spot, not a pen defect (routed to SCHEDULER #21:
   the sweep should tell a copy source from a destination). nc-d463/nc-d475/nc-d490/d444 were MOVED to controlPen
   in the same landing rather than counted. */
/* MOVED 15 -> 18 at c21-batch28 (CONDUCT #21), BY NAME, never as slack: d526-refusal-order.control,
   d547-revision-retype.control and d548-block.control landed in one batch, each the SAME shape as D-510's copy
   source already allowed here — its one unresolvable expression is the plane-root READ
   `fileURLToPath(new URL("..", import.meta.url))`, and every write goes to a `mkdtempSync(join(tmpdir(), …))`
   mirror (read at each driver). The fix that lets this fall again is the walk resolving that expression as a
   tree READ; it is routed to SCHEDULER as a row, not taken here. */
/* LOWERED 18 -> 13 by M0-196 (2026-09-25), TO THE PRINTED FIGURE, BY NAME: the walk now reads the copy-source
   drivers' tree root. MEASURED, and it corrects the row's premise: `fileURLToPath(new URL("..", import.meta.url))`
   itself ALREADY resolved (to `bio-plane/`). What was unread were three shapes around it — the trailing-slash
   strip `PLANE.replace(/\/$/, "")` that `stripComments` blanks (D-510, D-526, D-547, and rec180-promote-rollback,
   the same shape, which the batch28 note did not name), a comma-continued `const plane = …, test = …` (D-548),
   and `join(PLANE, p)` where `p` is bound elsewhere in the file to a temp path (D-526). D-563's driver
   (`d563-promoted-title-state.control.mjs`, not on main at this landing) is D-526's shape and resolves too, so
   this ceiling holds at the union without its 18 -> 19. The 13 left are each a parameter-built pen, an
   `arm.file` bound to several roots or a `.replace()` on an unknown: NAMED in the report, not this row's. */
/* D-578 side, kept as history (c22-batch30): its branch MOVED this ceiling 19 -> 20 BY NAME for
   `d578-typeless-revision.control.mjs`, D-547's driver derived verbatim; M0-196's walk classifies D-547's shape, so ours
   (<= 13) is kept and the print on the union decides. NUMBER TO RE-READ. */
/* D-546 side, kept as history (c22-batch30): its branch MOVED this ceiling 20 -> 21 BY NAME for
   `d546-state-edge.control.mjs`, D-578's driver derived verbatim; ours (<= 13) is kept and the print on the union
   decides. NUMBER TO RE-READ. */
/* D-615 side, kept as history (c22-batch30): its branch MOVED this ceiling 21 -> 22 BY NAME for
   `d615-promoted-dates.control.mjs`, D-563's driver derived; ours (<= 13) is kept and the print on the union
   decides. NUMBER TO RE-READ. */
/* D-564 side, kept as history (c22-batch30): its branch MOVED this ceiling 18 -> 19 BY NAME for
   `d564-block.control.mjs`, d548-block.control generalised to seven suites (the same copy-source shape); ours
   (<= 13) is kept and the print on the union decides. NUMBER TO RE-READ. */
/* D-628 side, kept as history (c23-batch30): its branch MOVED this ceiling 22 -> 23 BY NAME for
   `d628-promoted-fields.control.mjs`, D-578's driver derived verbatim; ours (<= 13) is kept and the print on the union
   decides. NUMBER TO RE-READ. */
t("the estate's UNCLASSIFIED drivers have not grown past what M0-196 left (<= 13)", g("UNCLASSIFIED").length <= 13, true);
t("M0-196, BY NAME: the copy-source drivers of D-510, D-526, D-547, D-548 and REC-180 read their tree root and are classified",
  ["d510-promoted-type", "d526-refusal-order", "d547-revision-retype", "d548-block", "rec180-promote-rollback"]
    .map((n) => [n, (real.drivers.find((d) => d.file === `bio-plane/test/${n}.control.mjs`) || {}).grade])
    .filter(([, gr]) => gr === "UNCLASSIFIED" || gr === undefined).map(([n, gr]) => `${n}: ${gr}`), []);
/* The named drivers this row moved FIRST, each by name rather than by a count. */
t("the six drivers that owned those seven pens are all graded, and none is dirty",
  ["coord.control.mjs", "delegations.control.mjs", "entries.control.mjs", "m0107-budget.control.mjs",
   "owed-controls.control.mjs", "train.control.mjs"]
    .map((n) => (real.drivers.find((d) => d.file === `bio-plane/test/${n}`) || {}).grade)
    .filter((x) => x === "IN-WORKTREE/DIRTY" || x === "UNCLASSIFIED" || x === undefined), []);
t("every ledgered path carries a WHY (a judgement with no reason is a name on a list)",
  Object.values(PEN_LEDGER).flat().filter((e) => !e.why || e.why.length < 40).map((e) => e.expr), []);
t("the helper the class rides is a real module the drivers import (>= 70 of the 74 measured call it)",
  real.drivers.filter((d) => d.floored && d.paths.some((p) => p.expr === "controlPen(…)")).length >= 70, true);

/* BOB #33's THREE DEFECT CLASSES, after CONDUCT #20's correction of 2026-09-24 22:25Z. An in-worktree pen
   that is gitignored AND item-named STANDS — it is a driver's own mechanism, not a session's scratch — so
   what is gated here is (a) a pen no `.gitignore` line covers and (b) a pen two drivers name. (c), a driver
   that leaves its pen behind on a CLEAN RUN, is a property of a run and not of the source: M0-172 owns it,
   and the sweep says so rather than scoring it zero. */
t("(a) is what the floored class is gated on — a pen no .gitignore line covers, never the in-tree pen itself",
  floored.filter((d) => d.grade === "IN-WORKTREE/DIRTY").length, 0);
t("(a) ...and a DECLARED in-worktree pen PASSES in the floored class, because BOB #33 let it stand",
  floored.filter((d) => d.grade === "IN-WORKTREE/declared").length >= 1, true);
/* (b) PINNED BY NAME, not by a count, so a NEW shared pen fails here naming itself. The four measured
   2026-09-24, each judged: `.d266-harness` and `app.html.pristine-*` are the real finding — two drivers
   naming ONE pen, which is what "item-named" exists to prevent; `.rec79-control-pristine` is nc-d355
   READING refusal-partition's pen to assert it is absent, not sharing it; `pdf-worker/node_modules` is not
   a pen at all, and this walk cannot tell a pen from any other untracked path, which the REACH line says. */
t("(b) the in-worktree pen paths named by more than one driver are the four measured, by NAME",
  real.shared.map((x) => x.pen).sort(),
  [".d266-harness", "civicos-ui/app.html.pristine-*", "civicos-ui/test/.rec79-control-pristine", "pdf-worker/node_modules"]);
t("(b) ...and no driver in the FLOORED class shares a pen with another driver as its own writing space",
  real.shared.filter((x) => x.drivers.filter((f) => FLOORED(f)).length > 1).map((x) => x.pen), []);

/* ============== 1b. M0-196: THE TREE-ROOT READ, BOTH DIRECTIONS ============== */
console.log("\n--- 1b. M0-196: the copy-source drivers' tree-root read resolves, and nothing broader does ---");
{
  const F = "bio-plane/test/x.control.mjs";
  const roots = (src) => namedPaths(src, F, {}).map((p) => `${p.root}:${p.path ?? ""}`);
  const head = `import { join, dirname, resolve } from "node:path";\nimport { fileURLToPath } from "node:url";\nimport { tmpdir } from "node:os";\n`;
  t("(m1) `dirname(PLANE.replace(/\\/$/, \"\"))` over the plane-root URL resolves to the repository, so its copy source is a SUBJECT path",
    roots(`${head}const PLANE = fileURLToPath(new URL("..", import.meta.url));\nconst REPO = dirname(PLANE.replace(/\\/$/, ""));\nconst x = join(REPO, "docprofile");\n`),
    ["TREE:bio-plane/", "TREE:docprofile"]);
  t("(m2) OVER-STRICTNESS: the `/\\/+$/` spelling, and `../..` chained straight onto `fileURLToPath(…)`, resolve alike",
    roots(`${head}const ROOT = fileURLToPath(new URL("../..", import.meta.url)).replace(/\\/+$/, "");\nconst x = join(ROOT, "docprofile");\n`),
    ["TREE:./", "TREE:docprofile"]);
  t("(m3) STRICTNESS: any OTHER `.replace(…)` on a path is still unread — it can rewrite a path into anything",
    roots(`${head}const PLANE = fileURLToPath(new URL("..", import.meta.url));\nconst REPO = dirname(PLANE.replace(/plane/, ""));\nconst x = join(REPO, "docprofile");\n`)
      .filter((r) => r.startsWith("UNKNOWN")).length, 1);
  t("(m4) a comma-continued declaration binds its later name: `const plane = join(root, …), test = join(plane, …)` is TEMP",
    roots(`${head}const root = mkdtempSync(join(tmpdir(), "x-"));\nconst plane = join(root, "bio-plane"), test = join(plane, "test");\nwriteFileSync(join(test, "f.mjs"), "");\n`),
    ["TEMP:", "TEMP:", "TEMP:", "TEMP:"]);
  t("(m5) `join` keeps a later temp segment BELOW its first root; `resolve`, which re-roots, is still unread",
    [roots(`${head}const PLANE = fileURLToPath(new URL("..", import.meta.url));\nconst p = join(tmpdir(), "x");\nconst a = join(PLANE, p);\n`).pop(),
     roots(`${head}const PLANE = fileURLToPath(new URL("..", import.meta.url));\nconst p = join(tmpdir(), "x");\nconst a = resolve(PLANE, p);\n`).pop()],
    ["TREE:bio-plane/*", "UNKNOWN:"]);
}

/* ============== 2. WHAT THE CLASSIFIER IS ============== */
console.log("\n--- 2. the classifier, asked directly ---");
t("a driver is recognised by what it IS — an nc- harness or a .control.mjs, anywhere",
  ["bio-plane/test/nc-rec82.mjs", "civicos-ui/test/refusal-partition.control.mjs", "agent-worker/test/x.control.mjs",
   "bio-plane/test/rec82.test.mjs", "bio-plane/scripts/battery.mjs", "bio-plane/test/incremental.mjs"].map(isDriver),
  [true, true, true, false, false, false]);
t("the floored class is the nc-* harnesses plus the six drivers whose pens no line covered",
  ["bio-plane/test/nc-rec82.mjs", "bio-plane/test/coord.control.mjs", "civicos-ui/test/nc-ui.mjs",
   "bio-plane/test/status.control.mjs"].map(FLOORED), [true, true, false, false]);
t("the ignore question is asked of a path's DECLARED PREFIX — whole segments before the first it cannot read",
  [ignoreProbe(".pl13-harness/arm*.*"), ignoreProbe("bio-plane/test/.nc-d487-pen/x.mjs"), ignoreProbe("*/x")],
  [".pl13-harness", "bio-plane/test/.nc-d487-pen/x.mjs", ""]);
t("the seven pens are pinned BY NAME, not by a count", UNIGNORED_PENS.length, 7);

/* ============== 3. THE SWEEP OVER A SCRATCH ESTATE, EVERY GRADE KNOWN ============== */
console.log("\n--- 3. a scratch estate whose every grade is known, both directions ---");
{
  const repo = mkdtempSync(join(tmpdir(), "m0182-pensweep-"));
  const put = (rel, body) => { mkdirSync(join(repo, dirname(rel)), { recursive: true }); writeFileSync(join(repo, rel), body); };
  const head = 'import { join, dirname } from "node:path";\nimport { fileURLToPath } from "node:url";\nimport { tmpdir } from "node:os";\nconst REPO = fileURLToPath(new URL("../../", import.meta.url));\nconst HERE = dirname(fileURLToPath(import.meta.url));\n';
  put("bio-plane/src/store.mjs", "export const x = 1;\n");
  put(".gitignore", ".declared-pen/\n");
  /* (p1) THE DEFECT: an in-worktree pen no .gitignore line covers */
  put("bio-plane/test/nc-p1.mjs", `${head}const PEN = join(REPO, ".p1-control-pristine");\ncopyFileSync(join(REPO, "bio-plane/src/store.mjs"), join(PEN, "store.pristine"));\n`);
  /* (p2) THE END STATE: a pen under the system temp root */
  put("bio-plane/test/nc-p2.mjs", `${head}const PEN = join(tmpdir(), "nc-p2-x");\ncopyFileSync(join(REPO, "bio-plane/src/store.mjs"), join(PEN, "store.pristine"));\n`);
  /* (p3) BOB #33's surviving case: an in-worktree pen a .gitignore line DOES cover */
  put("bio-plane/test/nc-p3.mjs", `${head}const PEN = join(REPO, ".declared-pen");\ncopyFileSync(join(REPO, "bio-plane/src/store.mjs"), join(PEN, "store.pristine"));\n`);
  /* (p4) OVER-STRICTNESS: a driver that names ONLY its tracked SUBJECT is not a pen finding */
  put("bio-plane/test/nc-p4.mjs", `${head}const STORE = join(REPO, "bio-plane/src/store.mjs");\nconst src = readFileSync(STORE, "utf8");\nwriteFileSync(STORE, src);\n`);
  /* (p5) OVER-STRICTNESS: a pen path spelled in PROSE is not a path this driver names */
  put("bio-plane/test/nc-p5.mjs", `${head}/* its pen used to be join(REPO, ".p5-control-pristine") and is not any more */\nconst PEN = join(tmpdir(), "nc-p5-x");\n`);
  /* (p6) OVER-STRICTNESS: a ratio is not a path — `${a}/${b}` with no name beside the slash */
  put("bio-plane/test/nc-p6.mjs", `${head}const PEN = join(tmpdir(), "nc-p6-x");\nconsole.log(\`\${pass}/\${pass + fail}\`);\n`);
  /* (p7) THE BLIND SPOT, ASSERTED AS ONE: a pen built from a PARAMETER is invisible, so MEMORY, never TEMP */
  put("bio-plane/test/nc-p7.mjs", `${head}const penFor = (d) => join(d, "store.pristine");\ncopyFileSync("x", penFor(process.argv[2]));\n`);
  /* (p7b) the SILENT blind spot: the pen arrives from another module, so no path is named here at all */
  put("bio-plane/test/nc-p7b.mjs", `${head}import { penFrom } from "./somewhere.mjs";\nconst PEN = penFrom("p7b");\ncopyFileSync("x", PEN);\n`);
  /* (p8) the helper itself is a declaration: a driver naming nothing else still reads TEMP */
  put("bio-plane/test/nc-p8.mjs", `${head}import { controlPen } from "./pen.mjs";\nconst PEN = controlPen("p8");\nconst copy = (f, s) => \`\${PEN}/\${f}.\${s}\`;\n`);
  /* (p9) NOT A DRIVER: a suite naming a dirty path is never graded here */
  put("bio-plane/test/p9.test.mjs", `${head}const PEN = join(REPO, ".p9-control-pristine");\n`);
  spawnSync("git", ["init", "-q", "-b", "main"], { cwd: repo });
  spawnSync("git", ["add", "-A"], { cwd: repo });
  const res = sweepPens({ repo });
  const grade = (n) => (res.drivers.find((d) => d.file === `bio-plane/test/${n}`) || { grade: "NOT SWEPT" }).grade;
  console.log(`  scratch estate: ${res.corpus} file(s), ${res.drivers.length} driver(s) graded`);
  t("(scratch) the corpus is what was planted (12 files), untracked files included", res.corpus, 12);
  t("(scratch) nine drivers are graded and the suite is not", res.drivers.length, 9);
  t("(p1) an in-worktree pen no .gitignore line covers is IN-WORKTREE/DIRTY", grade("nc-p1.mjs"), "IN-WORKTREE/DIRTY");
  t("(p1) ...and the DIRTY path is named, not counted",
    (res.drivers.find((d) => d.file === "bio-plane/test/nc-p1.mjs") || {}).dirty.map((p) => p.path), [".p1-control-pristine", ".p1-control-pristine/store.pristine"]);
  t("(p2) a pen under the system temp root is TEMP", grade("nc-p2.mjs"), "TEMP");
  t("(p3) an in-worktree pen a .gitignore line DOES cover is declared, not dirty (BOB #33)", grade("nc-p3.mjs"), "IN-WORKTREE/declared");
  /* CORRECTED 2026-09-24 from `TEMP`, which was wrong when it was written: a driver that names only its
     tracked subject names NO pen at all, and the grade for that is MEMORY. TEMP would have asserted a pen
     outside the worktree where there is none — the arm's own point, said of the wrong grade. */
  t("(p4) a driver naming only its TRACKED subject is not a pen finding — it names no pen, so MEMORY", grade("nc-p4.mjs"), "MEMORY");
  t("(p5) a pen path spelled in PROSE is not a path the driver names", grade("nc-p5.mjs"), "TEMP");
  t("(p6) `${a}/${b}` with no name beside the slash is a RATIO, not a path", grade("nc-p6.mjs"), "TEMP");
  /* DECLARED `MEMORY`, CAME BACK `UNCLASSIFIED`, AND THAT IS A FINDING ABOUT THE ARM, RECORDED RATHER THAN
     SMOOTHED: a pen built from a parameter is invisible to the resolver, but the `join(d, …)` that builds it
     is NOT — the walk sees a path expression it cannot read and NAMES it. So the sweep is stricter here than
     this arm assumed, in the safe direction. The blind spot that really is silent is (p7b) below: a driver
     that names no path at all because its pen arrives from another module. */
  t("(p7) a pen built from a PARAMETER is NAMED, not silently passed — UNCLASSIFIED, never TEMP",
    grade("nc-p7.mjs"), "UNCLASSIFIED");
  t("(p7b) THE BLIND SPOT, STATED: a driver whose pen comes from ANOTHER MODULE names no path, so it reads"
    + " MEMORY — the sweep cannot see it, which is why the class was also verified by RUNNING the controls",
    grade("nc-p7b.mjs"), "MEMORY");
  t("(p8) the helper is itself a declaration: `controlPen(` alone reads TEMP", grade("nc-p8.mjs"), "TEMP");
  t("(p9) a SUITE is not a control driver and is never graded here", grade("p9.test.mjs"), "NOT SWEPT");
  /* CORRECTED from `0`: `bio-plane/test/nc-p1.mjs` matches the floored class by its PATH, in a scratch
     estate as much as in the real one, so a dirty pen there is a failing verdict — which is the arm worth
     having, because it drives the CLI's exit rather than only the grade. */
  t("(scratch) the CLI's verdict over this estate is 1, and nc-p1 is why", [report(res, () => {}),
    res.drivers.filter((d) => d.floored && d.grade === "IN-WORKTREE/DIRTY").map((d) => d.file)],
    [1, ["bio-plane/test/nc-p1.mjs"]]);
  rmSync(repo, { recursive: true, force: true });
}

console.log(`\npen-sweep: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
