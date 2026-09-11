/* THE CROSS-FILE WALK->FLOOR DETECTOR, DRIVEN.  M0-21 / D-268.
 *
 * `scripts/walkfloor.mjs` exists because M0-16's class census in `hygiene.test.mjs`
 * grades a file by whether THAT FILE contains a literal `readdirSync(`, so a floor
 * standing one import away from its walk is invisible to it.  The measured instance
 * is `scripts/op-claims.mjs` + `test/op-claims.test.mjs`; the reasoning is in the
 * detector's own header and in D-268.
 *
 * WHY THIS SUITE IS MOSTLY FIXTURES AND NOT MOSTLY THE ESTATE.  The estate has ONE
 * cross-file instance today.  An instrument proved only against the one shape it
 * was built for is a mechanism believed on its existence: it cannot show that the
 * NEXT spelling will be caught, and it cannot show that the benign spellings will
 * be left alone.  So every benign shape is BUILT and driven, each in a sandbox this
 * suite creates, and the estate is then driven as well — because a fixture-only
 * suite would have agreed with BOTH of this detector's own first-draft bugs, each of
 * which reported a perfectly clean estate (§0 records them).
 *
 * NEGATIVE CONTROL: `node test/walkfloor.control.mjs [arm]` — ELEVEN arms, each armed
 * ALONE with every other defence held OPEN, each DECLARING before it ran what must
 * fail and what must not, every restore verified by sha256 AND by a byte compare
 * against a UNIQUELY NAMED per-arm pristine copy with the byte count printed and
 * floored against the empty-string digest.  RE-RUN WHOLE 2026-09-10 by D-302, all
 * eleven AS DECLARED, every restore VERIFIED.  RE-RUN WHOLE AGAIN 2026-09-10 by D-301,
 * which touches this lexer: all eleven AS DECLARED, every restore VERIFIED, AND ARM (6)
 * CAME BACK `DID NOT ARM` ON THE FIRST OF THOSE RUNS — recorded at (6) below and fixed
 * at its anchor.  EVERY FIGURE BELOW IS RE-MEASURED FROM THAT RUN'S PRINT, AND THE
 * TWO HALVES OF THE MOVE HAVE DIFFERENT CAUSES — attributed by re-running, never by
 * subtracting: the walkfloor column moved 39 -> 44 because D-301 adds five arms to
 * section 1, and the hygiene column moved 665 -> 678 because CPDF-13, CASE-5b and
 * M0-24 merged between D-302's run and this one.  **D-301 ADDS NOTHING TO HYGIENE'S
 * TALLY** — it replaces a reader and moves a floor, and the census still makes the
 * same three ASSERTIONS (reach, guarded-or-named, not-gone-stale).  Measured across
 * the whole battery: the only suite that moved is this one, 39 -> 44, and the total
 * closes exactly at 10,747 -> 10,752.  A hand-kept list of figures goes stale on
 * whatever schedule the REST of the estate keeps, which is the half that is easy to
 * miss.  Figures are walkfloor pass/fail · hygiene pass/fail, except (9) which is
 * op-claims pass/fail.
 *
 *   (1) baseline — NO EDIT AT ALL: 44/0 · 678/0, GREEN as declared.  The row that
 *       makes every other row interpretable.  (Was 31/0 · 570/0 on 2026-08-09 and
 *       39/0 · 665/0 on D-302's run the same day.)
 *   (2) hop — never seed a binding from an imported walk-derived export: 34/10 · 673/5.
 *   (3) destructured — restore first-draft bug (a), a destructured parameter list
 *       read as a function body: 34/10 · 672/6.
 *   (4) stringstrip — restore first-draft bug (b), imports read off source with
 *       string literals blanked: 33/11 · 673/5.
 *   (5) modulegrain — grade at MODULE granularity instead of BINDING granularity:
 *       40/4 · 673/5.  THE ARM THAT PROVES THE FALSE-POSITIVE GUARD IS REAL, AND
 *       ON 2026-09-10 IT FOUND THE INSTRUMENT RATHER THAN THE SUBJECT: D-302's
 *       first-draft grade read `info.from` off an `undefined`, because this arm
 *       makes every identifier live by construction, and hygiene died with a
 *       TypeError reporting NO tally (-1/-1) instead of a low one.  Recorded, not
 *       smoothed; an unresolved root is now graded UNCLASSIFIED at the site.
 *   (6) stripper — make the stripper a no-op, so prose and regex literals count as
 *       code: 34/10 · 673/5.  **THIS ARM REPORTED `DID NOT ARM` ON D-301'S FIRST RUN
 *       AND THAT IS THE FINDING, NOT THE FIX**: its anchor named `strip`'s full
 *       SIGNATURE, D-301 added one option to it, the patch matched ZERO TIMES, and the
 *       arm neutered nothing while both suites read a comfortable green.  Only the
 *       driver's zero-match check made it visible.  Anchored on the function BODY now,
 *       where a signature change cannot reach it.
 *   (7) overstrict — a NEW consumer that floors on the figure a walk declares
 *       REPRODUCIBLE: 44/0 · 678/0, GREEN as declared.  D-302 CORRECTED THIS
 *       FIXTURE: it used to floor on a WORKING-TREE figure and import
 *       `provenance.mjs`, which was correct work only under the predicate D-302
 *       removed — so it asserted that the ratchet must not fire on a real instance.
 *   (8) ratchet — the SAME fixture reading a WORKING-TREE figure instead:
 *       44/0 · 677/1, and the failure NAMES the new file.  A delta over one
 *       identifier rather than a claim about a fixture.
 *   (9) phantom — D-302's own arm, and the one the item exists for.  An UNCOMMITTED
 *       file carrying a TRUE routing claim — the publish op, stated in op-claims'
 *       attribution grammar to dispatch to the method the table really routes it
 *       to, with the token COMPOSED AT RUNTIME so this control does not plant a
 *       claim in the corpus it measures — is planted and `test/op-claims.test.mjs` is run:
 *       35/0, GREEN, and its label prints `5 of 6 attribution(s)` — the working-tree
 *       count MOVED to 6, which is the figure the fifth floor read before this item
 *       and is the BEFORE proved rather than described, while the reproducible
 *       figure the floor now reads stayed 5.  Removing the phantom prints 5 of 5.
 *  (10) guardimport — point the grade back at the import spelling: 44/0 · 674/4,
 *       and the failures NAME `op-claims.test.mjs`, whose five genuinely-guarded
 *       floors the old predicate misgrades because that file does not import
 *       `provenance.mjs`.  The discarded predicate kept as a CONTROL.
 *  (11) reportonly — OVER-STRICTNESS, second direction: a consumer that imports a
 *       walk and only PRINTS its working-tree figures, no comparison and no unwrap:
 *       44/0 · 678/0, GREEN as declared.  A report is not a floor (D-257), and a
 *       detector that flagged one would make every diagnostic line a finding.
 *
 * THE ARMS ARE ENUMERATED, AND THEY SIT DIRECTLY UNDER THE MARKER'S OWN PARAGRAPH.
 * NEITHER IS A STYLE CHOICE, AND BOTH WERE MEASURED RATHER THAN GUESSED.  This
 * declaration was first written as a COLUMN TABLE and `control-register.mjs` read
 * TWO arms out of it against a real eight — the D-233 under-count class, in which
 * `bias.test.mjs` stated thirteen arms in a grammar the detector could not see and
 * scored ZERO.  Rewriting it as an enumerated list fixed the count to 8 but put an
 * explanatory paragraph BETWEEN the marker and the list, which ends a declaration
 * under the register's paragraph rule: the suite then scored `arms: null` and
 * dropped OUT of `classified` altogether (137 -> 136, arms 659 -> 657), and
 * `--strict` exited 1.  An under-declared arm count installs slack in the
 * `REGISTER_FLOOR` ratchet, which is D-238's payload; an unclassifiable one is
 * worse, because the register can no longer see the suite at all.  BOTH STATES
 * WERE OBSERVED IN THIS FILE IN ONE SITTING, and the order that works is: marker
 * paragraph, then the list, then any prose.
 *
 * TWO ARMS CAME BACK OTHER THAN DECLARED ON THE FIRST RUN AND ARE RECORDED RATHER
 * THAN SMOOTHED: `baseline` and `overstrict` both read hygiene 569/1, and the
 * BASELINE ROW IS THE ONLY REASON THAT WAS INTERPRETABLE — the failure was not the
 * arm, it was THIS FILE, which minted temp directories without `import
 * "./sandbox.mjs"` and was caught by the D-186 rule `hygiene.test.mjs` has enforced
 * since M0-8.  Fixed at the site; both arms then came back as declared.  A harness
 * whose every row reads red and a harness whose subject is broken look identical
 * without that row.
 */

/* D-186 / M0-8: this suite mints temp directories, so the shared owner sweeps them
   even if it dies before its own cleanup runs. `hygiene.test.mjs` REQUIRES this
   line of every scanned suite and it CAUGHT ITS ABSENCE HERE on the first control
   run — the baseline arm went red at `walkfloor.test.mjs imports test/sandbox.mjs`,
   which is the estate catching a real mistake in the very item that adds a
   detector, and is recorded rather than quietly fixed. */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  sweepWalkFloors, strip, stripComments, moduleFacts, functionsOf,
  importsOf, comparisonsOf, seededLocals, WALK_PRIMITIVES, REPO,
  /* D-302: the grade is read off the figure's declared bucket, not off an import. */
  bucketsOf, gradeOf,
  /* D-301: the third strip mode, which is what `hygiene.test.mjs`'s class census now
     reads its corpus through — code only, with `${…}` kept. */
  stripToCode,
} from "../scripts/walkfloor.mjs";
/* GUARDED: this suite FLOORS on what `walkfloor.mjs`'s walk found (§4 below), which
   is precisely the class it is built to detect, so it asks the same question every
   other guarded walk asks rather than exempting itself. */
import { readGitProvenance, stateOf } from "../scripts/provenance.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}`
    + (ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`));
  ok ? pass++ : fail++;
};

/* ------------------------------------------------------------ 0. THE TWO BUGS */
/* Both of this module's first-draft defects PRODUCED A CLEAN REPORT, which is the
   exact failure mode D-268 is about arriving inside the instrument built to close
   it.  They are pinned here so a regression cannot restore either one quietly.
     (a) `braceBody` was called from the end of `function NAME(`, so a function with
         DESTRUCTURED PARAMETERS — `sweep({ root = REPO })` — had its parameter
         object read as its body.  `sweep` never appeared to call `corpus()`.
     (b) `importsOf` and the `guarded` test were run over source with STRING
         LITERALS BLANKED, so no import specifier and no `provenance.mjs` path could
         ever match.  Every file read as importing nothing and as unguarded. */
console.log("\n--- 0. the two first-draft bugs, pinned ---");
{
  const destructured = `export function sweep({ root = 1, roots = null } = {}) { return corpus(root); }
function corpus(d) { return readdirSync(d); }`;
  const f = moduleFacts(destructured);
  t("(a) a function with DESTRUCTURED parameters has its real body read, so derivation crosses it",
    [f.allDerived.has("corpus"), f.allDerived.has("sweep"), [...f.derivedExports]],
    [true, true, ["sweep"]]);

  const withImport = `import { corpus } from "./walker.mjs";\nimport { x } from "../scripts/provenance.mjs";`;
  t("(b) an import SPECIFIER survives the comment-only strip and is read",
    importsOf(stripComments(withImport)).map((i) => i.spec), ["./walker.mjs", "../scripts/provenance.mjs"]);
  t("(b) ...and the full strip DOES blank it, which is why the two modes both exist",
    importsOf(strip(withImport)).length, 0);
}

/* ------------------------------------------------------- 1. THE STRIPPER ALONE */
/* The census this replaces counts `readdirSync(` IN COMMENTS AND IN REGEX LITERALS
   — its own matcher is such a literal.  Grading a file by a word in its comments is
   the shape REC-70, REC-64 and M0-16's own first draft were each an item about. */
console.log("\n--- 1. the stripper: prose and patterns are not code ---");
{
  const src = `// readdirSync( in a line comment
/* readdirSync( in a block comment */
const re = /readdirSync\\s*\\(/g;
const s = "readdirSync(";
const tpl = \`readdirSync(\`;
const real = readdirSync(d);`;
  const st = strip(src);
  t("a walk primitive is counted ONCE — in the code, not in the comment, the regex, the string or the template",
    (st.match(/readdirSync\s*\(/g) || []).length, 1);
  t("the stripper preserves length and line count, so every offset still addresses the same place",
    [st.length === src.length, st.split("\n").length === src.split("\n").length], [true, true]);
  t("a module whose ONLY mention of a walk is prose is NOT a walk module",
    moduleFacts(`/* we could use readdirSync( here */\nexport const N = 1;`).walks, 0);

  /* D-301: THE THIRD MODE, AND IT WAS ADDED IN THE OVER-STRICTNESS DIRECTION.
     `hygiene.test.mjs`'s class census used to read its corpus through a stripper
     local to that file which knew about comments and nothing else, so a fixture
     string counted as a walk. Moving it onto THIS lexer fixes that — and would
     have broken something else, because a template literal's `${…}` is CODE THAT
     RUNS and two live files in this estate call a discovery primitive inside one
     (`scripts/battery.mjs:639`, `test/ref-variance-probe.mjs:414`). Neither would
     have left the census, since both have other code sites; the membership figures
     would have read correct while the matcher had gone blind. `keepInterpolations`
     is that correction, DEFAULT OFF so no caller that predates D-301 moved. */
  const interp = "const a = `holds ${readdirSync(dir).length} entr(ies)`;\n"
               + "const b = `the literal readdirSync( in template TEXT`;\n"
               + "const c = `${ \"readdirSync(\" }`;\n"
               + "const d = readdirSync(other);";
  const count = (s) => (s.match(/readdirSync\s*\(/g) || []).length;
  t("(D-301) the DEFAULT strip blanks an interpolation with the text — 1 site, the bare call only",
    count(strip(interp)), 1);
  t("(D-301) stripToCode KEEPS the interpolation: 2 sites, the bare call AND the one inside ${…}",
    count(stripToCode(interp)), 2);
  t("(D-301) ...and a string NESTED in an interpolation is still blanked — the recursion re-lexes",
    count(stripToCode(interp)) === 2 && !/"readdirSync\(/.test(stripToCode(interp)), true);
  t("(D-301) stripToCode preserves length and line count exactly as the other two modes do",
    [stripToCode(interp).length === interp.length,
     stripToCode(interp).split("\n").length === interp.split("\n").length], [true, true]);
  t("(D-301) a module whose ONLY primitive is inside a FIXTURE is not a walk module, in either quoting",
    [moduleFacts("const tpl = `export const f = (d) => readdirSync(d);`;\nexport const N = 1;").walks,
     moduleFacts("const s = \"export const f = (d) => readdirSync(d);\";\nexport const N = 1;").walks],
    [0, 0]);
}

/* --------------------------------------------------- 2. THE BENIGN SHAPES, BUILT */
/* Enumerated, built and DRIVEN.  A check that cries wolf gets switched off, and
   crossing a module boundary makes false positives much easier to produce, so the
   shapes that MUST NOT be reported are given at least as much weight as the one
   that must. */
console.log("\n--- 2. benign shapes: what must NOT be reported ---");

const sandboxes = [];
function sandbox(files) {
  const root = mkdtempSync(join(tmpdir(), "walkfloor-fixture-"));
  sandboxes.push(root);
  mkdirSync(join(root, "pkg", "lib"), { recursive: true });
  mkdirSync(join(root, "pkg", "use"), { recursive: true });
  for (const [rel, body] of Object.entries(files)) writeFileSync(join(root, rel), body);
  return sweepWalkFloors({ repo: root, roots: [["pkg", ["lib", "use"]]] });
}
const at = (r) => r.sites.map((s) => `${s.file}|${s.expr}`).sort();

/* The walking library every fixture below imports from.  `sweep` is walk-derived
   only THROUGH `corpus`; `LEDGER` and `pure` are not walk-derived at all. */
const LIB = `import { readdirSync } from "node:fs";
export function corpus(d) { return { files: readdirSync(d), chars: 10 }; }
export function sweep(opts = {}) { const c = corpus(opts.d); return { files: c.files.length, chars: c.chars, names: [] }; }
export const LEDGER = [1, 2, 3];
export function pure(text) { return text.split(",").length; }
`;

t("B1 — a floor on a STATIC export of a walking module is NOT a walk-derived floor",
  at(sandbox({ "pkg/lib/w.mjs": LIB,
    "pkg/use/a.mjs": `import { LEDGER, sweep } from "../lib/w.mjs";\nif (LEDGER.length >= 20) {}\n` })), []);

t("B2 — importing a walk-derived export and never COMPARING it is not a floor",
  at(sandbox({ "pkg/lib/w.mjs": LIB,
    "pkg/use/b.mjs": `import { sweep } from "../lib/w.mjs";\nconst r = sweep();\nconsole.log(r.files);\n` })), []);

t("B3 — a floor on a PURE (non-walking) export of a walking module is not walk-derived",
  at(sandbox({ "pkg/lib/w.mjs": LIB,
    "pkg/use/c.mjs": `import { pure } from "../lib/w.mjs";\nif (pure("a,b") >= 2) {}\n` })), []);

t("B4 — a walk and a floor in the SAME file are M0-16's census's business, not this one's",
  at(sandbox({ "pkg/lib/w.mjs": LIB,
    "pkg/use/d.mjs": `import { readdirSync } from "node:fs";\nconst n = readdirSync(".").length;\nif (n >= 5) {}\n` })), []);

t("B5 — a CEILING AT ZERO is classified as one and NOT reported as a floor (D-257: it fails safe)",
  (() => { const r = sandbox({ "pkg/lib/w.mjs": LIB,
    "pkg/use/e.mjs": `import { sweep } from "../lib/w.mjs";\nconst r = sweep();\nif (r.files === 0) {}\n` });
    return [r.sites.length, r.ceilings.length]; })(), [0, 1]);

/* ------------------------------------------------- 3. THE SPELLINGS THAT MUST FIRE */
/* OVER-STRICTNESS RUNS THE OTHER WAY TOO: a detector that only recognises the one
   spelling its author happened to meet is the classifier-grading-one-literal defect
   this project has now met in four instruments. */
console.log("\n--- 3. spellings that MUST be found ---");

t("F1 — the plain shape: a walk-derived value bound to a local and floored",
  at(sandbox({ "pkg/lib/w.mjs": LIB,
    "pkg/use/f.mjs": `import { sweep } from "../lib/w.mjs";\nconst r = sweep();\nif (r.files >= 300) {}\n` })),
  ["pkg/use/f.mjs|r.files >= 300"]);

t("F2 — a RENAMED import is the same floor under a different name",
  at(sandbox({ "pkg/lib/w.mjs": LIB,
    "pkg/use/g.mjs": `import { sweep as walkIt } from "../lib/w.mjs";\nconst r = walkIt();\nif (r.files >= 300) {}\n` })),
  ["pkg/use/g.mjs|r.files >= 300"]);

t("F3 — a NAMESPACE import reaching the walk-derived member",
  at(sandbox({ "pkg/lib/w.mjs": LIB,
    "pkg/use/h.mjs": `import * as lib from "../lib/w.mjs";\nconst r = lib.sweep();\nif (r.files >= 300) {}\n` })),
  ["pkg/use/h.mjs|r.files >= 300"]);

t("F4 — DESTRUCTURING the walk result, which binds a new name to the same value",
  at(sandbox({ "pkg/lib/w.mjs": LIB,
    "pkg/use/i.mjs": `import { sweep } from "../lib/w.mjs";\nconst { files } = sweep();\nif (files >= 300) {}\n` })),
  ["pkg/use/i.mjs|files >= 300"]);

t("F5 — the floor written the OTHER WAY ROUND (`300 <= n`), which is the same claim",
  at(sandbox({ "pkg/lib/w.mjs": LIB,
    "pkg/use/j.mjs": `import { sweep } from "../lib/w.mjs";\nconst r = sweep();\nif (300 <= r.files) {}\n` })),
  ["pkg/use/j.mjs|300 <= r.files"]);

t("F6 — `fs/promises` `readdir`, which was invisible to EVERY census before this one",
  at(sandbox({ "pkg/lib/p.mjs": `import { readdir } from "node:fs/promises";
export async function look(d) { return (await readdir(d)).length; }`,
    "pkg/use/k.mjs": `import { look } from "../lib/p.mjs";\nconst n = await look(".");\nif (n >= 12) {}\n` })),
  ["pkg/use/k.mjs|n >= 12"]);

t("F7 — derivation THROUGH A CHAIN of same-module calls, to a fixpoint",
  at(sandbox({ "pkg/lib/q.mjs": `import { readdirSync } from "node:fs";
function one(d) { return readdirSync(d); }
function two(d) { return one(d); }
export function three(d) { return two(d).length; }`,
    "pkg/use/l.mjs": `import { three } from "../lib/q.mjs";\nconst n = three(".");\nif (n >= 7) {}\n` })),
  ["pkg/use/l.mjs|n >= 7"]);

/* ------------------------------------------- 3b. WHAT IT CANNOT SEE, ASSERTED */
/* A matcher that hides its blind spots is read as though it had none.  These are
   the gaps the header states, PINNED — so that if one of them is ever closed, this
   suite fails and the header gets corrected instead of quietly going stale. */
console.log("\n--- 3b. the stated blind spots, pinned as blind ---");

t("BLIND — a RE-EXPORT chain does not connect a consumer to the walk behind it",
  at(sandbox({ "pkg/lib/w.mjs": LIB,
    "pkg/lib/re.mjs": `export { sweep } from "./w.mjs";`,
    "pkg/use/m.mjs": `import { sweep } from "../lib/re.mjs";\nconst r = sweep();\nif (r.files >= 300) {}\n` })), []);

t("BLIND — flow through a DATA STRUCTURE is not tracked",
  at(sandbox({ "pkg/lib/w.mjs": LIB,
    "pkg/use/n.mjs": `import { sweep } from "../lib/w.mjs";\nconst a = [];\na.push(sweep());\nif (a[0].files >= 300) {}\n` })), []);

t("UNCLASSIFIED — a comparison it cannot grade is NAMED, never silently scored zero",
  (() => { const r = sandbox({ "pkg/lib/w.mjs": LIB,
    "pkg/use/o.mjs": `import { sweep } from "../lib/w.mjs";\nconst r = sweep();\nconst k = other();\nif (r.files >= k) {}\n` });
    return [r.sites.length, r.unknowns.length, r.unknowns[0] && r.unknowns[0].why]; })(),
  [0, 1, "neither side is a numeric literal"]);

/* ------------------------------------------------------- 4. THE REAL ESTATE */
/* The fixtures above cannot show that the detector reaches real code — both of its
   first-draft bugs passed every shape-level intuition and returned a clean estate.
   So the estate is driven, its corpus PRINTED, and the floors taken over the
   TRACKED figure so a phantom in an uncommitted file cannot move them (D-238). */
console.log("\n--- 4. the real estate, and the floors are over the TRACKED figure ---");
const est = sweepWalkFloors({ repo: REPO });
const prov = readGitProvenance(REPO);
const trackedSites = prov.inHead === null
  ? est.sites
  : est.sites.filter((s) => stateOf(prov, s.file) === "in the commit");
console.log(`  ESTATE: ${est.corpus.count} module(s) · ${est.walkModules.count} walk module(s) · `
  + `${est.sites.length} cross-file floor(s) (${trackedSites.length} in the commit) · `
  + `${est.ceilings.length} ceiling(s) at zero · ${est.unknowns.length} unclassified · provenance ${est.provenance}`);
for (const u of est.unknowns) console.log(`  UNCLASSIFIED ${u.file}:${u.line}  ${u.expr} — ${u.why}`);

/* D-265: these two ARE floors, and they are floors on the WORKING TREE — an
   uncommitted `.mjs` under CENSUS_ROOTS inflates both. The detector's own result now
   says so, and the unwrap here is the site admitting it rather than the shape being
   indistinguishable from a tracked figure. Narrowing them to HEAD would make the
   REACH arm blind to a detector that stopped reading uncommitted work, which is the
   population this suite's own sandbox fixtures live in. */
const REACH_OVER_THE_WORKING_TREE =
  "a REACH floor, and reach is a claim about what the detector READ — including "
  + "uncommitted modules, which is where this suite's own fixtures live";
t("the estate corpus is non-trivial — a sweep over nothing reports its verdict triumphantly",
  [est.corpus.count.overWorkingTree(REACH_OVER_THE_WORKING_TREE) >= 200,
   est.walkModules.count.overWorkingTree(REACH_OVER_THE_WORKING_TREE) >= 8], [true, true]);
t("the REAL op-claims split is found across the module boundary, and it is the FIVE floors "
+ "the census could never name (the brief predicted four)",
  (() => { const s = trackedSites.filter((x) => x.file === "bio-plane/test/op-claims.test.mjs");
    return [s.length, s.every((x) => x.from.includes("bio-plane/scripts/op-claims.mjs"))]; })(),
  [5, true]);
t("and `op-claims.test.mjs` contains NO walk of its own — which is exactly why the "
+ "file-granularity census never enumerated it",
  moduleFacts(await import("node:fs").then((fs) => fs.readFileSync(join(DIR, "op-claims.test.mjs"), "utf8"))).walks, 0);
t("the `LEDGER.length >= 20` floor in that same suite is NOT reported — the benign shape "
+ "that a file-granularity detector would cry wolf on",
  est.sites.some((s) => /LEDGER/.test(s.expr)), false);

/* PROVENANCE, DRIVEN RATHER THAN IMPORTED: a fixture in a sandbox is in no commit,
   and the detector must SAY so rather than counting it silently. */
{
  const r = sandbox({ "pkg/lib/w.mjs": LIB,
    "pkg/use/p.mjs": `import { sweep } from "../lib/w.mjs";\nconst r = sweep();\nif (r.files >= 300) {}\n` });
  t("a site found in a file that is in no commit is LABELLED rather than counted silently",
    [r.sites.length, r.sites[0] && ["UNTRACKED", "UNVERIFIED"].includes(r.sites[0].state)], [1, true]);
}

/* ------------------------------------------------------------- 5. THE PARTS */
console.log("\n--- 5. the parts, driven on their own ---");
t("the walk-primitive list is the ONLY list of spellings in the module, and it is non-empty",
  [WALK_PRIMITIVES.length >= 5, WALK_PRIMITIVES.includes("readdir"), WALK_PRIMITIVES.includes("readdirSync")],
  [true, true, true]);
t("`functionsOf` finds a top-level function and spans its real body",
  functionsOf(strip(`function a(x) { return 1; }\nexport function b({ q = 2 } = {}) { return a(q); }`))
    .map((f) => f.name), ["a", "b"]);
t("`comparisonsOf` reads both operand roots and does not mistake `=>` or `>>` for a comparison",
  comparisonsOf(strip(`const f = (a) => a;\nconst g = x >> 2;\nif (r.files >= 300) {}`))
    .map((c) => `${c.left.root}${c.op}${c.right.atom.trim()}`), ["r>=300"]);
/* CORRECTED 2026-09-10 BY D-302, NEVER EXEMPTED. `seededLocals` returned a Set of
   names and now returns a Map name -> { from, key }, because a grade read off the
   FIGURE needs to know which figure a binding roots in — the old return could say a
   local was walk-derived and nothing more. The question is unchanged and the four
   names are the same four; what is added is the second arm, which is the new
   information and would have been unassertable before. */
{
  const live = seededLocals(strip(`const r = sweep();\nconst m = r;\nconst z = m.files;`), ["sweep"]);
  t("`seededLocals` reaches a fixpoint through one further hop",
    [...live.keys()].sort(), ["m", "r", "sweep", "z"]);
  t("...and each local carries the declared FIGURE it roots in, which is what the grade is read "
  + "off — `z` names `files` through two hops, `r` and `m` name none because they hold the whole result",
    [live.get("z").key, live.get("r").key, live.get("m").key], ["files", null, null]);
}
/* THE SHADOW RULE, DRIVEN — D-302's false-positive narrowing, as a DELTA. A name
   BOUND as an arrow parameter is not the live one, and the measured instance is in
   `hygiene.test.mjs`: a live `n` and, 1,478 lines away, `(n) => n.endsWith(...)`.
   Asserted in both directions, because a rule that stopped seeding anything at all
   would pass the first half alone. */
{
  const shadowed = seededLocals(strip(`const n = sweep();\nconst files = list.filter((n) => n.endsWith("x"));`), ["sweep"]);
  const real = seededLocals(strip(`const n = sweep();\nconst files = n.corpus;`), ["sweep"]);
  t("a name bound as an ARROW PARAMETER does not seed from the live one, while the same name "
  + "read as a value still does — the delta, not the absence",
    [shadowed.has("files"), real.has("files"), real.get("files")?.key], [false, true, "corpus"]);
}

/* ---- D-302 · THE BUCKET READER AND THE GRADE, DRIVEN ON THEIR OWN -----------
 *
 * These replaced a regex asking whether the file carrying a floor imports
 * `provenance.mjs` — a question about an import list used to grade a FIGURE, and
 * measured wrong in BOTH directions on this estate at once. The arms below are
 * built rather than read off the tree, so they hold when the tree moves. */
{
  const mod = `import { walkResult } from "./walkfigure.mjs";
export function w(d) { return walkResult({ about: "x",
  workingTree: { files: readdirSync(d).length, chars: 7 },
  reproducible: { filesRepro: 3, charsRepro: 4 },
  safe: { findings: [[], "asserted EMPTY by every caller, so a phantom reds it"] },
  data: { prov: null } }); }`;
  const b = bucketsOf(strip(mod));
  t("`bucketsOf` reads all four buckets out of a walkResult() call, shorthand keys included",
    [b.declared, b.calls, [...b.workingTree].sort(), [...b.reproducible].sort(),
     [...b.safe], [...b.data], [...b.conflicts]],
    [true, 1, ["chars", "files"], ["charsRepro", "filesRepro"], ["findings"], ["prov"], []]);
  /* THE COMMENT TRAP, WHICH THIS ESTATE HAS NOW PAID FOR IN FOUR SEPARATE
     INSTRUMENTS. `walkfloor.mjs`'s own header spells `walkResult(` in prose. */
  t("a walkResult() written only in a COMMENT declares nothing — the trap M0-16, REC-64 and "
  + "REC-70 were each an item about",
    bucketsOf(strip(`/* we call walkResult({ reproducible: { x: 1 } }) elsewhere */\nexport const N = 1;`)).declared,
    false);
  t("and the DEFINITION's destructured parameter list is not a declaration either — "
  + "`export function walkResult({ about, workingTree = {} })` in walkfigure.mjs",
    bucketsOf(strip(`export function walkResult({ about, workingTree = {}, reproducible = {} }) { return 1; }`)).declared,
    false);

  /* THE GRADE, EVERY BRANCH, INCLUDING THE ONES THAT MUST REFUSE TO ANSWER. */
  t("`gradeOf` answers from the bucket, and says WHY in every branch",
    [gradeOf(b, "filesRepro", "m").grade, gradeOf(b, "files", "m").grade,
     gradeOf(b, "findings", "m").grade, gradeOf(b, "prov", "m").grade,
     gradeOf(b, "nosuchkey", "m").grade, gradeOf(b, null, "m").grade,
     gradeOf(null, "filesRepro", "m").grade,
     [gradeOf(b, "filesRepro", "m"), gradeOf(b, "files", "m"), gradeOf(b, null, "m")]
       .every((g) => typeof g.why === "string" && g.why.length > 20)],
    ["GUARDED", "WORKING-TREE", "SAFE-BUCKET", "UNCLASSIFIED", "UNCLASSIFIED",
     "UNCLASSIFIED", "UNCLASSIFIED", true]);
  /* THE UNSAFE DIRECTION IS UNREACHABLE BY A SILENCE: only `reproducible` grades
     GUARDED, and every state this reader cannot resolve falls the other way. */
  t("nothing but the REPRODUCIBLE bucket grades GUARDED — an unresolved key, an undeclared "
  + "module and a data payload all fall to the side that still has to be NAMED",
    ["files", "findings", "prov", "nosuchkey", null]
      .map((k) => gradeOf(b, k, "m").grade === "GUARDED")
      .concat([gradeOf(null, "filesRepro", "m").grade === "GUARDED"]),
    [false, false, false, false, false, false]);
  /* A KEY TWO CALLS DISAGREE ABOUT IS A CONFLICT, NEVER A GUESS. */
  const conf = bucketsOf(strip(`walkResult({ workingTree: { n: 1 } });\nwalkResult({ reproducible: { n: 2 } });`));
  t("a key declared into two buckets by two calls is reported as a CONFLICT and refuses to grade",
    [[...conf.conflicts], conf.calls, gradeOf(conf, "n", "m").grade], [["n"], 2, "UNCLASSIFIED"]);
}

/* A probe that litters is counted by the next walk, which is the defect D-243 met
   in `mintid.test.mjs`. The floor is the MEASURED count (16 on the run that wrote
   this line), not a guessed one — the first draft of this arm floored at 18 against
   a real 16 and FAILED, which is a small instance of exactly the thing this item is
   about: a number written from intuition rather than from the instrument. */
for (const s of sandboxes) { try { rmSync(s, { recursive: true, force: true }); } catch { /* best effort */ } }
console.log(`  fixture sandboxes created and removed: ${sandboxes.length}`);
t(`every fixture sandbox this suite created was REMOVED (${sandboxes.length} created, floor 16)`,
  [sandboxes.length >= 16, sandboxes.every((s) => !existsSync(s))], [true, true]);

console.log(`\nwalkfloor: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
