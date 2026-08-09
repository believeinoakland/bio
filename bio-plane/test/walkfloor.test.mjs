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
 * NEGATIVE CONTROL: `node test/walkfloor.control.mjs [arm]` — EIGHT arms, each armed
 * ALONE with every other defence held OPEN, each DECLARING before it ran what must
 * fail and what must not, every restore verified by sha256 AND by a byte compare
 * against a UNIQUELY NAMED per-arm pristine copy with the byte count printed and
 * floored against the empty-string digest.  Run 2026-08-09, all eight AS DECLARED.
 * Figures are walkfloor pass/fail · hygiene pass/fail.
 *
 * THE ARMS ARE ENUMERATED RATHER THAN TABULATED, AND THAT IS NOT A STYLE CHOICE.
 * The first draft of this declaration was a column table, and `control-register.mjs`
 * read TWO arms out of it against a real eight — the D-233 under-count class, in
 * which `bias.test.mjs` stated thirteen arms in a grammar the detector could not
 * see and scored zero.  An under-declared arm count installs slack in the
 * `REGISTER_FLOOR` ratchet, which is the same payload D-238 is about.  Measured
 * with `countArms` directly before and after rewriting this block.
 *
 *   (1) baseline — NO EDIT AT ALL: 31/0 · 570/0, GREEN as declared.  The row that
 *       makes every other row interpretable.
 *   (2) hop — never seed a binding from an imported walk-derived export: 21/10 · 567/3.
 *   (3) destructured — restore first-draft bug (a), a destructured parameter list
 *       read as a function body: 21/10 · 567/3.
 *   (4) stringstrip — restore first-draft bug (b), imports read off source with
 *       string literals blanked: 20/11 · 567/3.
 *   (5) modulegrain — grade at MODULE granularity instead of BINDING granularity:
 *       27/4 · 569/1.  THE ARM THAT PROVES THE FALSE-POSITIVE GUARD IS REAL.
 *   (6) stripper — make the stripper a no-op, so prose and regex literals count as
 *       code: 28/3 · 570/0.
 *   (7) overstrict — a NEW consumer that floors on a walk one import away AND asks
 *       `provenance.mjs`: 31/0 · 570/0, GREEN as declared.  Correct work in a
 *       spelling the ratchet was not written against must PASS.
 *   (8) ratchet — a NEW consumer that floors and is NOT guarded: 31/0 · 569/1, and
 *       the failure NAMES the new file.
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
import "./sandbox.mjs";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  sweepWalkFloors, strip, stripComments, moduleFacts, functionsOf,
  importsOf, comparisonsOf, seededLocals, WALK_PRIMITIVES, REPO,
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
console.log(`  ESTATE: ${est.corpus.length} module(s) · ${est.walkModules.length} walk module(s) · `
  + `${est.sites.length} cross-file floor(s) (${trackedSites.length} in the commit) · `
  + `${est.ceilings.length} ceiling(s) at zero · ${est.unknowns.length} unclassified · provenance ${est.provenance}`);
for (const u of est.unknowns) console.log(`  UNCLASSIFIED ${u.file}:${u.line}  ${u.expr} — ${u.why}`);

t("the estate corpus is non-trivial — a sweep over nothing reports its verdict triumphantly",
  [est.corpus.length >= 200, est.walkModules.length >= 8], [true, true]);
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
t("`seededLocals` reaches a fixpoint through one further hop",
  [...seededLocals(strip(`const r = sweep();\nconst m = r;\nconst z = m.files;`), ["sweep"])].sort(),
  ["m", "r", "sweep", "z"]);

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
