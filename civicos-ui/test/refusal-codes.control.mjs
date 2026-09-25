#!/usr/bin/env node
/* refusal-codes.control.mjs — THE DEC-49 GUARD'S NEGATIVE CONTROLS, RUN
 * AGAINST THE REAL TREE (VF-2).
 *
 * `test/refusal-codes.test.mjs` proves the guard's judgement over FIXTURES and
 * runs in the battery. This file proves it over the ACTUAL repository, which is
 * a different claim: a guard can be right about a fixture tree and blind to the
 * real one — the real `bio-checks.mjs`, the real `airun.mjs`, the real
 * `app.html`, the real `test/run.mjs`. It is DESTRUCTIVE while it runs, so it
 * is deliberately NOT a `.test.mjs` and the battery does not run it.
 *
 *     node test/refusal-codes.control.mjs
 *
 * WHY IT IS A SCRIPT AND NOT A PARAGRAPH IN A COMMENT. VERIFICATION.md asks
 * that a control be re-runnable "in one step instead of re-deriving how to
 * break the subject". A prose recipe is re-derived every time and drifts the
 * moment a line number moves.
 *
 * IT LIVES IN THIS WORKTREE AND WRITES ONLY INSIDE IT. On 2026-08-07 a worker's
 * harness in a shared scratchpad was overwritten mid-turn by another running
 * worker — and a harness silently replaced between ARM and RESTORE can report a
 * restore it never performed.
 *
 * SO EVERY RESTORE IS VERIFIED BY CONTENT AS WELL AS BY HASH, and the two are
 * different claims. The hash says the bytes came back. The CONTENT check says
 * the thing this control was supposed to have broken is actually back — the
 * exact substring it removed, present again — and the RE-RUN says the subject
 * is green again. A hash alone would be satisfied by a file swapped for another
 * copy of itself by a process that never performed the restore.
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282 / M0-36: a writer's own exit must not
   discard the writer's own output. SHARED from the plane's test estate rather than copied into
   this one — ONE implementation, so `bio-plane/test/tally-through-pipe.test.mjs` guards it for
   both estates and a node release closing the private door goes red once instead of half. The
   import is for its SIDE EFFECT and is idempotent. Census: `stdio-census.test.mjs`. */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { execFileSync } from "child_process";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const UI = path.join(HERE, "..");
const PLANE = path.join(UI, "..", "bio-plane");

const F = {
  catalog: path.join(PLANE, "checks", "bio-checks.mjs"),
  airun:   path.join(PLANE, "src", "airun.mjs"),
  store:   path.join(PLANE, "src", "store.mjs"),
  app:     path.join(UI, "app.html"),
  guard:   path.join(UI, "check-refusal-codes.mjs"),
  /* D-254: the guard IMPORTS REC-76's verdict reader from here, so an arm that
     breaks how arm C reads a verdict ((n2), (n6)) breaks THIS file now — the
     guard's own text no longer holds those functions. */
  reader:  path.join(PLANE, "test", "verdict-reader.mjs"),
  runner:  path.join(HERE, "run.mjs"),
  /* D-542: the guard's by-op walk (R5, R6). */
  rbo:     path.join(UI, "reach-by-op.mjs"),
};

/* THE FLOOR ANCHORS ARE READ, NOT TYPED — corrected 2026-09-21 by D-254, never
   exempted. (n2) anchored on `  refusalsJudged: 124,`, `  codesChecked: 122,` and
   `  unclassifiedOutcomes: 3,` — FIGURES, which every landing that moves a floor
   changes. They had moved (319 / 319 / 1), so `arm()` threw "the text this
   control removes is not in check-refusal-codes.mjs" and ABORTED this file at
   (n2): (n3)-(n6) and (z) were not running on `main` — measured on `fc94b045`
   before this edit. (The August D-254 branch `9e24ef6e` met the same abort at
   148/145 and fixed it on a branch that never merged.) The anchor is the KEY now,
   and its figure is read from the file at arm time, asserted to occur ONCE. */
function figure(file, key) {
  const all = [...fs.readFileSync(file, "utf8").matchAll(new RegExp(`^  ${key}: \\d+,`, "gm"))];
  if (all.length !== 1)
    throw new Error(`figure(${key}): ${all.length} line(s) in ${path.basename(file)}, expected exactly 1 — an arm `
      + `that cannot find what it breaks proves nothing`);
  return all[0][0];
}

const sha = f => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");

function run(cmd) {
  try { return { exit: 0, out: String(execFileSync("node", [cmd], { stdio: "pipe" })) }; }
  catch (e) { return { exit: e.status ?? -1, out: String(e.stdout || "") + String(e.stderr || "") }; }
}
const guard  = () => run(F.guard);
/* `test/run.mjs` runs the whole UI harness; the (c) arm needs its exit status
   and nothing else, and it is the only arm that pays for the full pass. */
const runner = () => run(F.runner);

let failures = 0;
function report(name, ok, detail) {
  if (ok) console.log(`  ok   ${name}`);
  else { failures++; console.log(`  FAIL ${name}\n       ${detail}`); }
}

/* ARM: edit files (and optionally move whole files ASIDE, which is what
   "remove the guard" actually means), run something, restore, verify by hash
   AND by content AND by re-running. `edits` is [{file, from, to}]; `aside` is
   [file] — moved out of the tree entirely and moved back. */
function arm(name, spec, runIt, expect) {
  const edits = Array.isArray(spec) ? spec : (spec.edits || []);
  const aside = (Array.isArray(spec) ? [] : (spec.aside || []));
  /* `touch` (M0-79, 2026-09-21): files the arm's OWN RUN writes between its phases —
     the landing-in-the-same-turn arms read the figure the guard printed and only then
     move the floor to it, so the edit cannot be written before arming. Each is
     snapshotted here, restored FIRST in the `finally` with the rest, and verified by
     hash and by every byte below. */
  const touch = (Array.isArray(spec) ? [] : (spec.touch || []));
  const before = new Map();
  for (const e of edits) before.set(e.file, { text: fs.readFileSync(e.file, "utf8"), hash: sha(e.file) });
  for (const f of aside) before.set(f, { text: fs.readFileSync(f, "utf8"), hash: sha(f) });
  for (const f of touch) if (!before.has(f)) before.set(f, { text: fs.readFileSync(f, "utf8"), hash: sha(f) });

  /* EDITS ARE APPLIED CUMULATIVELY PER FILE, and this is a CORRECTION rather
     than a detail (REC-71, 2026-08-08 — corrected, never exempted).

     This loop used to read `before.get(e.file).text` as its base EVERY time, so
     TWO edits to the SAME file each started from the original and **the second
     silently discarded the first**. REC-71's arm (r2) has to revert two `where`
     fields in `bio-checks.mjs` at once; it armed only one, the tree was left in
     a state nobody designed, and the arm failed with a count (34) that was the
     honest answer to a question it had not meant to ask. **A control that does
     not arm what it says it arms is the exact failure this whole file exists to
     catch, and it caught itself for the second time** — arm (a) did the same in
     VF-2's own first run, by a different mechanism.

     The `includes` check now runs against the RUNNING text too, so an edit whose
     anchor was consumed by an earlier edit throws instead of passing silently. */
  const working = new Map();
  for (const e of edits) {
    const t = working.has(e.file) ? working.get(e.file) : before.get(e.file).text;
    if (!t.includes(e.from))
      throw new Error(`${name}: the text this control removes is not in ${path.basename(e.file)} — the `
        + `subject moved, or an earlier edit in this same arm already consumed it. A control that cannot `
        + `find what it breaks proves nothing and MUST NOT pass silently. Looked for: `
        + `${JSON.stringify(e.from.slice(0, 90))}`);
    working.set(e.file, t.replace(e.from, e.to));
  }
  for (const [file, text] of working) fs.writeFileSync(file, text);
  for (const f of aside) fs.rmSync(f);

  let result;
  try { result = runIt(); }
  finally {
    /* RESTORE FIRST, whatever happened above. */
    for (const e of edits) fs.writeFileSync(e.file, before.get(e.file).text);
    for (const f of aside) fs.writeFileSync(f, before.get(f).text);
    for (const f of touch) fs.writeFileSync(f, before.get(f).text);
  }

  const verdict = expect(result);
  report(`${name} — ${verdict.what}`, verdict.ok,
    `exit ${result.exit}; output did not contain what this arm requires.\n       ${result.out.slice(-700)}`);

  /* THE RESTORE, three ways. */
  for (const e of edits) {
    const b = before.get(e.file);
    report(`${name} — ${path.basename(e.file)} restored BY HASH`, sha(e.file) === b.hash, `sha differs`);
    report(`${name} — ${path.basename(e.file)} restored BY CONTENT (the removed text is present again)`,
      fs.readFileSync(e.file, "utf8").includes(e.from),
      `the bytes hash the same but the substring this control removed is absent — establish which file you are looking at`);
  }
  for (const f of aside) {
    const b = before.get(f);
    report(`${name} — ${path.basename(f)} restored BY HASH`, fs.existsSync(f) && sha(f) === b.hash, `sha differs or file absent`);
    report(`${name} — ${path.basename(f)} restored BY CONTENT (its first declaration is back)`,
      fs.existsSync(f) && fs.readFileSync(f, "utf8").startsWith(b.text.slice(0, 200)),
      `the file is back but does not begin as it did — establish which file you are looking at`);
  }
  for (const f of touch) {
    if (edits.some(e => e.file === f)) continue;          // already verified above, as an edited file
    const b = before.get(f);
    report(`${name} — ${path.basename(f)} (written by the arm's own run) restored BY HASH`, sha(f) === b.hash, `sha differs`);
    report(`${name} — ${path.basename(f)} (written by the arm's own run) restored BY CONTENT (every byte)`,
      b.text.length > 1000 && fs.readFileSync(f, "utf8") === b.text,
      `the bytes differ from the snapshot, or the snapshot was implausibly small — establish which file you are looking at`);
  }
  return result;
}

/* ================================================================ M0-79 helpers
   THE GUARD'S RATCHET TABLE, READ FROM ITS OWN PRINT — one `ratchet:` line per
   FLOOR and CEILING key, with the figure it is pinned to, the measured value, the
   slack and the bound (or EXEMPT). Every M0-79 arm below reads its figures here or
   from the file, never from a number typed into this driver: (n2)'s typed floor
   anchors are exactly how this harness aborted for a month (D-254's note above). */
function ratchets(out) {
  const table = new Map();
  for (const x of out.matchAll(/^\s*ratchet:\s+(\w+)\s+(floor|ceiling)\s+(-?\d+) · measured\s+(-?\d+) · slack\s+(-?\d+)(?: \/ bound (\d+))?/gm))
    table.set(x[1], { dir: x[2], set: +x[3], measured: +x[4], slack: +x[5],
                      bound: x[6] === undefined ? null : +x[6], exempt: x[6] === undefined });
  return table;
}
/* A key's `SLACK` line, read by KEY and asserted to occur exactly once. */
function slackLine(file, key) {
  const all = [...fs.readFileSync(file, "utf8").matchAll(new RegExp(`^  ${key}:\\s+\\{ (?:bound|exempt): [^\\n]*$`, "gm"))];
  if (all.length !== 1)
    throw new Error(`slackLine(${key}): ${all.length} line(s) in ${path.basename(file)}, expected exactly 1 — an arm that `
      + `cannot find what it breaks proves nothing`);
  return all[0][0];
}
/* A key's `MEASURE(...)` call, when it is written on ONE line, read by key and asserted once. */
function measureLine(file, key) {
  const all = [...fs.readFileSync(file, "utf8").matchAll(new RegExp(`^ *MEASURE\\("${key}",[^\\n]*\\);$`, "gm"))];
  if (all.length !== 1)
    throw new Error(`measureLine(${key}): ${all.length} one-line call(s) in ${path.basename(file)}, expected exactly 1`);
  return all[0][0];
}
/* "  key: N," — the FIGURE a FLOOR or CEILING line holds, as a number. */
const figureValue = (file, key) => Number(/: (\d+),$/.exec(figure(file, key))[1]);
const failLines = out => out.split("\n").filter(l => /^FAIL: /.test(l));

console.log("\n=== DEC-49 GUARD · NEGATIVE CONTROLS AGAINST THE REAL TREE ===\n");

const clean = guard();
report("PRECONDITION: the guard is GREEN on the untouched tree", clean.exit === 0, `exit ${clean.exit}`);

/* ---------------------------------------------------------------- (a)
   CORRECTED 2026-08-07 AT FIRST RUN, and the correction is recorded because it
   is the arming that was wrong rather than the guard. The first version of this
   arm INSERTED `translation: undefined,` before the real row's translation —
   and in a JavaScript object literal the LATER duplicate key wins, so the row
   still carried its real translation and the guard was right to pass. A control
   that does not actually break its subject is the failure this whole discipline
   exists to catch, and it caught itself. It now REMOVES the translation. */
console.log("\n(a) THE ROW'S — a family row loses its canned translation");
arm("(a)", [{
  file: F.catalog,
  from: `    translation: 'That observation does not say which kind of absence it found. '`,
  to: `    removed_by_vf2_control: 'That observation does not say which kind of absence it found. '`,
}], guard, r => ({
  ok: r.exit === 1 && /AI_LOG_STATE_UNKNOWN has NO CANNED TRANSLATION/.test(r.out),
  what: "the guard exits 1 naming AI_RUN_CHECKS.AI_LOG_STATE_UNKNOWN",
}));

/* ---------------------------------------------------------------- (b)
   VF-2'S ACCEPTANCE ARM: a codeless refusal introduced at a governed site. */
console.log("\n(b) THE TEETH — a CODELESS refusal at a governed site (VF-2's acceptance arm)");
arm("(b)", [{
  file: F.airun,
  from: `export function checkBound(bound) {`,
  to: `export function checkBound(bound) {
  if (bound === "__vf2_control__") return { ok: false, detail: "a refusal nobody gave a code" };`,
}], guard, r => ({
  ok: r.exit === 1 && /src\/airun\.mjs:\d+ \(in checkBound\) returns a CODELESS REFUSAL/.test(r.out),
  what: "the guard exits 1 naming src/airun.mjs, the line and checkBound",
}));

/* ---------------------------------------------------------------- (c)
   THE SHARP ONE, and VF-2's own row names it: **REMOVE the guard -> the codeless
   fixture PASSES -> re-add and record. The guard's ABSENCE is the defect**, so
   this arm is what proves the guard EXISTS rather than merely runs.

   CORRECTED 2026-08-07 AT FIRST RUN, and the correction is a FINDING rather
   than a fix. The first version removed only the INVOCATION from `run.mjs` —
   and the harness still exited 1, because `refusal-codes.test.mjs`'s arm 8
   asserts that `run.mjs` invokes the guard ("a mechanism not in the loop the
   reader runs is not a mechanism"). **That is a SECOND, INDEPENDENT layer, and
   it caught the removal on its own.** Worth knowing, and worth not mistaking
   for the arm this row asks for: removing the guard means removing the whole
   instrument, which is the state this repository was in before VF-2. So the
   arm now takes the guard AND its suite out of the tree entirely. */
console.log("\n(c) THE GUARD REMOVED — the codeless refusal PASSES, which is what proves the guard exists at all");
arm("(c)", {
  edits: [
    {
      file: F.airun,
      from: `export function checkBound(bound) {`,
      to: `export function checkBound(bound) {
  if (bound === "__vf2_control__") return { ok: false, detail: "a refusal nobody gave a code" };`,
    },
    {
      file: F.runner,
      from: `try{ execFileSync("node", [new URL("../check-refusal-codes.mjs", import.meta.url).pathname], {stdio:"inherit"}); }
catch(_){ fail++; }`,
      to: `/* VF-2 CONTROL (c): the guard removed from the loop. */`,
    },
  ],
  aside: [F.guard, path.join(HERE, "refusal-codes.test.mjs")],
}, runner, r => ({
  ok: r.exit === 0,
  what: "node test/run.mjs exits 0 — the whole UI harness is GREEN over a codeless refusal",
}));

/* ---------------------------------------------------------------- (d) */
console.log("\n(d) THE SURFACE HOLE — a code its producer mints, with no wording in the surface table");
arm("(d)", [{
  file: F.app,
  from: `  TOO_LARGE: "too large to keep",`,
  to: ``,
}], guard, r => ({
  ok: r.exit === 1 && /`PART_REASON` has NO WORDING for 1 code\(s\)[\s\S]*TOO_LARGE/.test(r.out),
  what: "the guard exits 1 naming PART_REASON, its producer and TOO_LARGE",
}));

/* ---------------------------------------------------------------- (e)
   A CEILING IS NOT A RATCHET. Neuter the widest matcher and the FLOOR fails —
   the half a ceiling alone can never see (REC-70's walk sat green at 0 of 40). */
console.log("\n(e) THE WALK NEUTERED — the FLOOR fails and the per-matcher line says which spelling went blind");
arm("(e)", [{
  file: F.guard,
  from: `  'M2 reason:<expr>':  src => {
    const out = new Set();`,
  to: `  'M2 reason:<expr>':  src => {
    const out = new Set(); if (out) return out;`,
}], guard, r => ({
  ok: r.exit === 1 && /the plane census is \d+ refusal codes, floor is/.test(r.out)
      && /M2 reason:<expr>\s+0 codes/.test(r.out),
  what: "the guard exits 1 on the CENSUS FLOOR with M2 printed at 0 codes",
}));

/* ---------------------------------------------------------------- (f)
   THE RATCHET'S CEILING. A new refusal code that a harness mock sends, with no
   translation, may not simply widen the gap. */
console.log("\n(f) THE RATCHET — a NEW receivable code with no translation may not widen the gap");
arm("(f)", [
  { file: F.airun, from: `export function checkBound(bound) {`,
    to: `export function checkBound(bound) {
  if (bound === "__vf2_control__") return { ok: false, reason: "VF2_BRAND_NEW_CONDITION" };` },
  { file: path.join(HERE, "refusal-codes.test.mjs"),
    from: `import fs from "fs";`,
    to: `import fs from "fs";\n/* VF-2 CONTROL (f): a mock sends "VF2_BRAND_NEW_CONDITION" */` },
], guard, r => ({
  ok: r.exit === 1 && /VF2_BRAND_NEW_CONDITION/.test(r.out) && /may only ever move it DOWN/.test(r.out),
  what: "the guard exits 1 naming VF2_BRAND_NEW_CONDITION and saying the ceiling may only fall",
}));

/* ================================================================ REC-71
   THE REGION `where` — ARMED AGAINST THE REAL `store.mjs`, not a fixture.

   `test/refusal-codes.test.mjs` arms all of this over fixture trees. These four
   arms are the same claims against the ACTUAL 18,000-line `store.mjs`, the
   ACTUAL `promote`, and the ACTUAL two rows — because the item exists precisely
   because a span behaved differently on the real file than anyone expected.
   ================================================================ */
const FREEZE_ANCHOR = `        for (const v of offered) {
          const prior = this.#one(`;
const REGION_MARK = `/* DEC-49 REGION basis-version-freeze`;

console.log("\n(r1) THE TEETH INSIDE THE NARROWED REGION — REC-71's whole point: narrowing must not blind the guard");
arm("(r1)", [{
  file: F.store,
  from: FREEZE_ANCHOR,
  to: `        if (pkg.__rec71_control__) return { ok: false, detail: "a refusal nobody gave a code" };
${FREEZE_ANCHOR}`,
}], guard, r => ({
  ok: r.exit === 1
      && /src\/store\.mjs:\d+ \(in promote > basis-version-freeze\) returns a CODELESS REFUSAL/.test(r.out),
  what: "the guard exits 1 naming src/store.mjs, the LINE, promote AND the region",
}));

console.log("\n(r2) THE FIX IS THE FIX — put the WHOLE-FUNCTION `where` back and the 32 conscripted refusals RETURN");
arm("(r2)", [
  { file: F.catalog,
    from: `    where: 'src/store.mjs promote > basis-version-freeze, NOT reachable from a pure document check',`,
    to: `    where: 'src/store.mjs promote (the basis-version freeze arm), NOT reachable from a pure document check',` },
  { file: F.catalog,
    from: `    where: 'src/store.mjs promote > basis-version-resolve, NOT reachable from a pure document check',`,
    to: `    where: 'src/store.mjs promote (the basis-version resolve arm), NOT reachable from a pure document check',` },
], guard, r => {
  /* PIN CORRECTED 2026-08-08, NOT EXEMPTED, and the correction is itself the
     evidence the arm is live. It read 32 — the number `main`'s red harness
     reported on the PL-1-only tree — and measured 33 once PL-12 landed, because
     PL-12 added `BIAS_REFUSED` to `promote` and a whole-function `where`
     conscripts every refusal in the function INCLUDING ones that arrived after
     the row was written. **That drift is the defect in miniature: the set a
     whole-function `where` claims is not fixed at the time it is written, it
     grows with the function.** The count is now family-specific so this arm and
     (r6) cannot borrow each other's failures. */
  const n = (r.out.match(/refuses with code [A-Z_]+, which is NOT a row in BASIS_VERSION_CHECKS/g) || []).length;
  return {
    ok: r.exit === 1 && n === 33,
    what: `the guard exits 1 with EXACTLY 33 refusals conscripted into BASIS_VERSION_CHECKS again `
        + `(measured ${n}) — 32 on the PL-1-only tree plus PL-12's BIAS_REFUSED, so the narrowing is `
        + `shown to be what removed them`,
  };
});

console.log("\n(r3) OVER-STRICTNESS ON THE REAL TREE — a codeless refusal OUTSIDE the regions must still PASS");
arm("(r3)", [{
  file: F.store,
  /* Planted in `promote` but well outside both marked arms — the same position
     as the ~32 long-standing refusals REC-64 will reach on its own schedule.
     Narrowing a `where` narrows what is governed, and this arm is that boundary
     stated rather than implied. */
  from: `      if (basisLegs.length) {`,
  to: `      if (pkg.__rec71_outside__) return { ok: false, detail: "outside every governed span" };
      if (basisLegs.length) {`,
}], guard, r => ({
  ok: r.exit === 0,
  what: "the guard exits 0 — a span no row claims is not a governed site, and failing here would be "
      + "REC-64's sweep arriving early in the worst possible place",
}));

console.log("\n(r4) THE MARKER REMOVED from the real store.mjs — the `where` must FAIL, not judge an empty span");
arm("(r4)", [{
  file: F.store,
  from: REGION_MARK,
  to: `/* (rec-71 control: the marker taken out)`,
}], guard, r => ({
  ok: r.exit === 1 && /found 0 `DEC-49 REGION basis-version-freeze` opening marker\(s\)/.test(r.out),
  what: "the guard exits 1 naming the region the `where` claims and the source no longer declares",
}));

/* ---------------------------------------------------------------- (r5)
   THE SAME TREATMENT, THE SECOND FAMILY. PL-12's `BIAS_CHECKS.BIAS_REFUSED`
   carried `where: 'src/store.mjs promote'` at whole-function granularity and
   conscripted 34 refusals in exactly the way PL-1's two rows had days earlier —
   **the convention arriving in the family next door before it existed.** The
   teeth are re-proved INSIDE the newly narrowed region rather than assumed to
   work because they worked in the other one: a narrowing is only as good as the
   arm that shows it did not blind the guard, and each region owes its own. */
console.log("\n(r5) THE TEETH INSIDE THE **BIAS** REGION — each newly narrowed region owes its own arm");
arm("(r5)", [{
  file: F.store,
  from: `      if (normalizeType(meta.object_type) === "bias" && !pkg.replay) {`,
  to: `      if (normalizeType(meta.object_type) === "bias" && !pkg.replay) {
        if (pkg.__rec71_bias_control__) return { ok: false, detail: "a refusal nobody gave a code" };`,
}], guard, r => ({
  ok: r.exit === 1
      && /src\/store\.mjs:\d+ \(in promote > bias-set-refusal\) returns a CODELESS REFUSAL/.test(r.out),
  what: "the guard exits 1 naming src/store.mjs, the LINE, promote AND the bias-set-refusal region",
}));

console.log("\n(r6) THE FIX IS THE FIX, SECOND FAMILY — restore BIAS_REFUSED's whole-function `where`");
arm("(r6)", [{
  file: F.catalog,
  from: `    where: 'src/store.mjs promote > bias-set-refusal, reached from op=promote',`,
  to: `    where: 'src/store.mjs promote, reached from op=promote',`,
}], guard, r => {
  const n = (r.out.match(/refuses with code [A-Z_]+, which is NOT a row in BIAS_CHECKS/g) || []).length;
  return {
    ok: r.exit === 1 && n === 36,
    what: `the guard exits 1 with EXACTLY 36 refusals conscripted into BIAS_CHECKS again (measured `
        + `${n}) — the number CONDUCT measured on the merged tree, so the narrowing is shown to be `
        + `what removed them. Note 36 and not 34: a whole-function \`where\` also conscripts the two `
        + `refusals the OTHER family's regions correctly govern`,
  };
});

/* ================================================================
   REC-76 / D-236 — THE CLASSIFIER INVERTED. Six arms, each DECLARED before it
   was armed, each armed ALONE with the others held open, against the REAL tree.

   The point of the pair (n1)/(n2) is that neither alone is evidence. (n1) shows
   the new classifier catches a refusal in a shape nobody taught it; (n2) shows
   the OLD one did not, over the SAME planted refusal. A widening that fires is
   only interesting if what it replaced did not.
   ================================================================ */

/* ---------------------------------------------------------------- (n1)
   DECLARED: MUST FAIL. This is the arm the item exists for. */
console.log("\n(n1) A REFUSAL IN A SHAPE THE MATCHER WAS NEVER TAUGHT — planted at a REAL governed site");
arm("(n1)", [{
  file: F.airun,
  from: `export function checkBound(bound) {`,
  to: `export function checkBound(bound) {
  if (bound === "__rec76_control__") return { started: false, detail: "a refusal nobody gave a code" };`,
}], guard, r => ({
  ok: r.exit === 1 && /\(in checkBound\) returns a CODELESS REFUSAL — an outcome whose verdict `started` is `false`/.test(r.out),
  what: "the guard exits 1 naming checkBound AND the verdict field it read — `started`, a field name "
      + "this walk has never been told about, graded because it is a boolean verdict that is not `true`",
}));

/* ---------------------------------------------------------------- (n2)
   DECLARED: MUST PASS (exit 0). THE DEFECT, DEMONSTRATED RATHER THAN ASSERTED.

   The classifier is reverted to the one-vocabulary form — a verdict is read only
   when the field is called `ok` — over the SAME planted refusal as (n1). The
   ratchet figures (three, and since D-254 a fourth — see it below) are relaxed
   IN THIS ARM ONLY, and the reason is stated
   because relaxing a floor inside a control is otherwise indistinguishable from
   buying a green run: with the old classifier in place the plane's own
   `started: false` refusals fall out of the judged set, so the FLOORS would fire
   on the emulation and hide the thing this arm is measuring. What is being
   measured is whether the PLANTED refusal is seen, and it is not. */
console.log("\n(n2) THE SAME PLANTED REFUSAL, UNDER THE OLD ONE-VOCABULARY CLASSIFIER — it PASSES");
arm("(n2)", [
  {
    file: F.airun,
    from: `export function checkBound(bound) {`,
    to: `export function checkBound(bound) {
  if (bound === "__rec76_control__") return { started: false, detail: "a refusal nobody gave a code" };`,
  },
  /* the classifier lives in the ONE reader since D-254 — see `F.reader` */
  { file: F.reader, from: `    if (kind) return { key: p.key, kind };`, to: `    if (kind && p.key === "ok") return { key: p.key, kind };` },
  { file: F.guard, from: figure(F.guard, "refusalsJudged"), to: `  refusalsJudged: 0,` },
  { file: F.guard, from: figure(F.guard, "codesChecked"), to: `  codesChecked: 0,` },
  { file: F.guard, from: figure(F.guard, "unclassifiedOutcomes"), to: `  unclassifiedOutcomes: 999,` },
  /* A FOURTH RELAXATION, for the SAME stated reason as the three above — added
     2026-09-21 by D-254, never exempted. Once the anchors above stopped aborting
     this arm, it ran for the first time since REC-79 and came back RED on a figure
     it never meant to measure: REC-79's `inheritedVerdicts` ceiling, 6 against 4.
     With only `ok` read as a verdict, outcomes whose verdict is `preview:` or
     `started:` beside a spread lose it and fall into the INHERITED bin — the
     emulation moving a ratchet, which is exactly what the three relaxations above
     exist to keep out of this arm's way. MEASURED identical on the untouched base
     `fc94b045` and on D-254's tree, so it is this arm's staleness, not D-254's. */
  { file: F.guard, from: figure(F.guard, "inheritedVerdicts"), to: `  inheritedVerdicts: 999,` },
  /* AND THE SLACK HALF OF THE SAME FIVE FIGURES — added 2026-09-21 by M0-79, a
     correction and never an exemption, for the SAME stated reason as the four above.
     M0-79 made the guard fail on slack as well as on a breach, so the relaxations
     above stopped relaxing: a floor set to 0 under a measured 300-odd is slack, and a
     ceiling of 999 over 6 is slack, and this arm came back RED on exactly those
     (measured: `CEILING SLACK — inheritedVerdicts: ceiling 999, measured 6`, with the
     floors beside it). Relaxing a ratchet now means relaxing BOTH halves, so each of
     these keys' `SLACK` line is marked EXEMPT, in this arm only, with the reason — read
     by key, never typed. The fifth, `outcomeReturns`, is the PLANT's: the planted
     refusal is one more outcome read, which a landing would move its floor for; here it
     is relaxed with the rest because what (n2) measures is the classifier, not the corpus. */
  ...["refusalsJudged", "codesChecked", "unclassifiedOutcomes", "inheritedVerdicts", "outcomeReturns"].map(k => ({
    file: F.guard, from: slackLine(F.guard, k),
    to: `  ${k}: { exempt: "relaxed in refusal-codes.control.mjs arm (n2) ONLY — the one-vocabulary emulation and its plant move this figure, and what the arm measures is whether the PLANTED refusal is seen" },`,
  })),
], guard, r => ({
  ok: r.exit === 0,
  what: "the guard exits 0 — a CODELESS refusal sits at a governed site and the one-vocabulary "
      + "classifier does not see it. That is D-236 reproduced on the real tree, and it is what "
      + "makes (n1) evidence rather than a tautology",
}));

/* ---------------------------------------------------------------- (n3)
   DECLARED: MUST PASS (exit 0). THE OVER-STRICTNESS DIRECTION, and it is the
   one that protects the guard: a widening that grades SUCCESSES as refusals
   floods it with false sites and gets it switched off, which is
   VERIFICATION.md's own reason for not making `--strict` the gate yet.
   `found: true` is REC-70's own example — the success spelling that hid 27 ops
   one instrument over. */
console.log("\n(n3) A SUCCESS IN AN UNANTICIPATED SPELLING — it must NOT be graded a refusal");
/* CORRECTED 2026-09-21 by M0-79, never exempted. This arm planted the success and
   required exit 0, and M0-79 turned it RED — measured, on the M0-79 guard with this
   harness unchanged — because the success is one more OUTCOME READ at a governed site,
   so `outcomeReturns` rises by one and a floor left behind by a landing is now a
   failure. The claim the arm exists for is untouched and is now made more sharply: the
   landing moves its floor IN THE SAME TURN, from the figure the guard PRINTED over the
   planted tree (never by adding one to the file), and the tree must then be GREEN. Had
   the success been graded a refusal, the second run would still fail — CODELESS, and on
   `refusalsJudged`'s slack — so exit 0 is the over-strictness claim. The first run's
   own verdict is (s3a)'s arm, below. */
arm("(n3)", {
  edits: [{
    file: F.airun,
    from: `export function checkBound(bound) {`,
    to: `export function checkBound(bound) {
  if (bound === "__rec76_control__") return { found: true, rows: [], more: false };`,
  }],
  touch: [F.guard],
}, () => {
  const first = guard();
  const o = ratchets(first.out).get("outcomeReturns");
  if (!o) return { exit: -2, out: first.out + "\n(n3): the guard printed no `ratchet:` line for outcomeReturns" };
  const text = fs.readFileSync(F.guard, "utf8");
  const at = new RegExp(`^  outcomeReturns: ${o.set},`, "m");
  if (!at.test(text)) return { exit: -2, out: `(n3): the FLOOR line for outcomeReturns does not read ${o.set}` };
  fs.writeFileSync(F.guard, text.replace(at, `  outcomeReturns: ${o.measured},`));
  const second = guard();
  return { ...second, phase1: { exit: first.exit, set: o.set, measured: o.measured } };
}, r => ({
  ok: r.exit === 0 && !!r.phase1 && r.phase1.exit === 1 && r.phase1.measured === r.phase1.set + 1,
  what: `the planted SUCCESS, with FLOOR.outcomeReturns moved to the figure the guard printed over it `
      + `(${r.phase1 ? `${r.phase1.set} -> ${r.phase1.measured}` : "not read"}), exits 0 — a return that declares itself `
      + `a success is not a refusal and owes no code, and a landing that moves its floor in the same turn stays green`,
}));

/* ---------------------------------------------------------------- (n4)
   DECLARED: MUST FAIL. **EACH NEWLY NARROWED REGION OWES ITS OWN TEETH ARM**
   (REC-71's (r5) rule); inheriting another region's proves nothing about this
   one. `is-selection-moved` is the region that could not be written until this
   item landed, so this is the arm that shows the narrowing did not blind the
   guard at the very site the blindness cost a translation. */
console.log("\n(n4) THE TEETH INSIDE `is-selection-moved` — SET_MOVED's code taken off the real refusal");
arm("(n4)", [{
  file: F.store,
  from: `      ...(stopped ? { reason: "SET_MOVED", code: "SET_MOVED",
                      check: ACT_SHAPE_CHECKS.SET_MOVED.check,
                      translation: ACT_SHAPE_CHECKS.SET_MOVED.translation,`,
  to: `      ...(stopped ? { rec76_control_no_code: true,`,
}], guard, r => ({
  ok: r.exit === 1 && /\(in selectionResolve > is-selection-moved\) returns a CODELESS REFUSAL/.test(r.out)
      && /verdict `ok` is computed/.test(r.out),
  what: "the guard exits 1 naming FILE, LINE, FUNCTION and REGION — and saying the verdict is COMPUTED, "
      + "which is the shape the old matcher could not see at all",
}));

/* ---------------------------------------------------------------- (n5)
   DECLARED: MUST FAIL. A `where` whose region has vanished must FAIL rather
   than judge an empty span — an empty span passes everything. */
console.log("\n(n5) THE NEW REGION'S MARKER REMOVED from the real store.mjs");
arm("(n5)", [{
  file: F.store,
  from: `    /* DEC-49 REGION is-selection-moved`,
  to: `    /* REC-76 CONTROL: the marker taken out`,
}], guard, r => ({
  ok: r.exit === 1 && /found 0 `DEC-49 REGION is-selection-moved` opening marker\(s\)/.test(r.out),
  what: "the guard exits 1 saying the region the `where` names is not declared in the source",
}));

/* ---------------------------------------------------------------- (n6)
   DECLARED: MUST FAIL. The walk neutered, and the failure must arrive as a
   DELTA against a floor with the CORPUS PRINTED — a headline that passes over
   an EMPTY CORPUS is this repository's most recent instrument defect, and a
   ceiling alone would have stayed green through it (REC-70). */
console.log("\n(n6) THE OUTCOME WALK NEUTERED — the CORPUS floor fires, with the corpus printed");
arm("(n6)", [{
  file: F.reader,   /* D-254: `outcomeReturns` is the ONE reader's now, imported by the guard */
  from: `function outcomeReturns(text) {`,
  to: `function outcomeReturns(text) { return [];`,
}], guard, r => ({
  ok: r.exit === 1 && /THE CORPUS COLLAPSED/.test(r.out)
      && /THE OUTCOME WALK — 0 return-position outcome\(s\) read/.test(r.out),
  what: "the guard exits 1 on the CORPUS floor, and the printed line shows the corpus at 0 rather than "
      + "leaving a reader to infer that a green run meant anything",
}));

/* ================================================================ M0-79
   A FLOOR WITH SLACK IS NOT A RATCHET — ARMED AGAINST THE REAL FLOOR TABLE.

   Before M0-79 the guard failed a floor only on a FALL and printed a rise (`GREW by
   N`) and passed, so four real floors sat 11 to 46 below their measurement on green
   runs. The row's negative control is ONE sentence: drop one floor by one and the
   guard fails BY NAME (before M0-79 it printed and passed). It is armed here for
   EVERY key the guard ratchets, one at a time, because the cheap way past a slack gate
   is to gate only the figures that happen to be equal — so the arm that covers one
   key proves nothing about the other eighteen.

   THE KEYS AND WHAT EACH ARM MUST DO ARE READ FROM THE PRISTINE RUN's OWN RATCHET
   TABLE (`clean`, above) AND PRINTED BEFORE ANYTHING IS ARMED: a floor key gated at a
   bound MUST FAIL naming the key, the lowered floor and the measured value; an EXEMPT
   floor key MUST PASS and say it is exempt; a ceiling key raised by one MUST FAIL
   naming the key, the raised ceiling and the measured value.
   ================================================================ */
const table = ratchets(clean.out);
const floorKeys = [...table].filter(([, v]) => v.dir === "floor").map(([k]) => k);
const ceilingKeys = [...table].filter(([, v]) => v.dir === "ceiling").map(([k]) => k);
console.log(`\n(s) M0-79 — DECLARED BEFORE ARMING, from the pristine run's own ratchet table (${table.size} key(s)):`);
for (const [k, v] of table)
  console.log(`      ${k.padEnd(21)} ${v.dir.padEnd(7)} ${String(v.set).padStart(5)} · measured ${String(v.measured).padStart(5)} — `
    + (v.dir === "ceiling" ? `raised by one, MUST FAIL naming it`
       : v.exempt ? `EXEMPT: lowered by one, MUST PASS and print it EXEMPT` : `lowered by one, MUST FAIL naming it`));
/* CORRECTED 2026-09-24 by D-550: 3 -> 4 ceilings, arm G's `multiSiteCodes` — the (s2) loop arms it like the rest. */
report("(s) PRECONDITION: the pristine ratchet table is NOT EMPTY — every key the guard ratchets, 16 floors and 4 ceilings, "
     + "each at its measured figure but the exempt one (a table read as empty would make every arm below vacuous)",
  floorKeys.length >= 16 && ceilingKeys.length >= 4
    && [...table.values()].every(v => v.exempt ? v.dir === "floor" : v.slack === 0),
  `read ${floorKeys.length} floor(s), ${ceilingKeys.length} ceiling(s): ${[...table].map(([k, v]) => `${k}=${v.slack}`).join(" ")}`);

for (const k of floorKeys) {
  const v = table.get(k), n = figureValue(F.guard, k);
  arm(`(s1 ${k})`, [{ file: F.guard, from: figure(F.guard, k), to: `  ${k}: ${n - 1},` }], guard, r => v.exempt
    ? { ok: r.exit === 0 && new RegExp(`ratchet:\\s+${k}\\s+floor\\s+${n - 1} · measured\\s+\\d+ · slack\\s+\\d+ · EXEMPT — `).test(r.out),
        what: `FLOOR.${k} lowered ${n} -> ${n - 1}: EXEMPT, so the guard exits 0 and prints it EXEMPT with its reason` }
    : { ok: r.exit === 1 && new RegExp(`FLOOR SLACK — \`${k}\`: floor ${n - 1}, measured ${n} — 1 above the floor`).test(r.out)
          && failLines(r.out).length === 1,
        what: `FLOOR.${k} lowered ${n} -> ${n - 1}: the guard exits 1 naming ${k}, its floor ${n - 1} and its measured `
            + `${n}, and nothing else fails (before M0-79 this printed and passed)` });
}
for (const k of ceilingKeys) {
  const n = figureValue(F.guard, k);
  arm(`(s2 ${k})`, [{ file: F.guard, from: figure(F.guard, k), to: `  ${k}: ${n + 1},` }], guard, r => ({
    ok: r.exit === 1 && new RegExp(`CEILING SLACK — \`${k}\`: ceiling ${n + 1}, measured ${n} — 1 below the ceiling`).test(r.out)
      && failLines(r.out).length === 1,
    what: `CEILING.${k} raised ${n} -> ${n + 1}: the guard exits 1 naming ${k}, its ceiling ${n + 1} and its measured ${n}, `
        + `and nothing else fails`,
  }));
}

/* (s3a) THE LANDING THAT LEAVES ITS FLOOR BEHIND — (n3)'s plant, the floor NOT moved.
   DECLARED: MUST FAIL, and on exactly one line: `outcomeReturns`' slack. That the ONLY
   failure is the floor is what says the planted success itself was judged correct;
   (n3) above is the same landing with its floor moved in the same turn, green. */
console.log("\n(s3a) THE LANDING THAT LEAVES ITS FLOOR BEHIND — a correct plant, the floor unmoved, fails on the floor alone");
arm("(s3a)", [{
  file: F.airun,
  from: `export function checkBound(bound) {`,
  to: `export function checkBound(bound) {
  if (bound === "__m079_control__") return { found: true, rows: [], more: false };`,
}], guard, r => {
  const m = /FLOOR SLACK — `outcomeReturns`: floor (\d+), measured (\d+) — 1 above the floor/.exec(r.out);
  return {
    ok: r.exit === 1 && !!m && +m[2] === +m[1] + 1 && failLines(r.out).length === 1,
    what: `the guard exits 1 naming outcomeReturns, floor ${m ? m[1] : "?"} and measured ${m ? m[2] : "?"}, and nothing `
        + `else — the plant is correct and the floor was left behind`,
  };
});

/* (s4) THE LIAR'S WAY PAST, ARMED: a key with no SLACK line at all. DECLARED: MUST FAIL
   naming the key as a ratchet nobody decided about — the coverage arm is what makes
   "gate only the figures that are currently equal" impossible to write quietly. */
console.log("\n(s4) A RATCHET KEY WITH NO STATED BOUND — `regionLines`' SLACK line deleted");
arm("(s4)", [{ file: F.guard, from: slackLine(F.guard, "regionLines") + "\n", to: `` }], guard, r => ({
  ok: r.exit === 1 && /RATCHET COVERAGE — `regionLines` is a floor with NO SLACK BOUND STATED/.test(r.out)
      && /1 NOT ACCOUNTED FOR/.test(r.out),
  what: "the guard exits 1 naming regionLines as a floor with NO SLACK BOUND STATED, and counts it NOT accounted for",
}));

/* (s5) A FIGURE ITS ARM STOPPED RECORDING. DECLARED: MUST FAIL naming the key — a gate
   with nothing to compare would otherwise pass everything, silently. */
console.log("\n(s5) A FIGURE NOBODY RECORDED — `vocabularyTerms`' MEASURE call removed");
arm("(s5)", [{ file: F.guard, from: measureLine(F.guard, "vocabularyTerms") + "\n", to: `` }], guard, r => ({
  ok: r.exit === 1 && /RATCHET COVERAGE — `vocabularyTerms` has NO RECORDED FIGURE/.test(r.out),
  what: "the guard exits 1 naming vocabularyTerms as a key with NO RECORDED FIGURE",
}));

/* (m1)-(m4) THE SLACK ARM'S OWN CONTROLS. The (s) arms prove the gate fires on the real
   table; these prove `refusal-codes.test.mjs`'s ARM 11 would notice the GATE ITSELF going
   wrong — each breaks one branch of the guard's slack arm and runs the fixture suite, and
   the suite must fail at exactly the named fixture arms and at nothing else. DECLARED
   before arming, each ALONE: (m1) the comparison neutered -> ARM 11a, 11h, 11j; (m2) the
   no-bound check neutered -> ARM 11c; (m3) the unrecorded-figure check neutered -> ARM
   11d; (m4) the bound hard-wired to zero, the over-strictness direction -> ARM 11i alone,
   its pair 11j held. */
const SUITE = path.join(HERE, "refusal-codes.test.mjs");
const suiteArmsFailing = out => [...new Set([...out.matchAll(/^ {2}FAIL (ARM [^:]+):/gm)].map(x => x[1]))].sort();
for (const [id, from, to, want] of [
  /* (m1) CORRECTED 2026-09-24 by D-550: + ARM 12b. 12b asserts a consolidated candidate leaves CEILING slack,
     which is this comparison's to see; the old list was true of a suite with no ARM 12. Measured by the
     harness's own first run with arm G in place: [ARM 11a, ARM 11h, ARM 11j, ARM 12b]. */
  ["(m1)", "    if (slack > s.bound) {", "    if (false) {", ["ARM 11a", "ARM 11h", "ARM 11j", "ARM 12b"]],
  ["(m2)", "    if (!s) { lose(", "    if (!s) { continue; lose(", ["ARM 11c"]],
  ["(m3)", "    if (!m) {\n", "    if (!m) { continue; } if (false) {\n", ["ARM 11d"]],
  ["(m4)", "    if (slack > s.bound) {", "    if (slack > 0) {", ["ARM 11i"]],
  /* D-550: arm G's by-name check neutered — the count still breaches, so ARM 12a still exits 1, and fails
     only where it asserts the code is NAMED and that arm G's two failures are the only ones. */
  ["(m5)", "  for (const c of open.filter(c => !MULTI_SITE_CANDIDATES.has(c))) {", "  for (const c of []) {", ["ARM 12a"]],
]) {
  console.log(`\n${id} THE SLACK ARM BROKEN IN THE GUARD — its suite must fail at exactly ${want.join(", ")}`);
  arm(id, [{ file: F.guard, from, to }], () => run(SUITE), r => {
    const got = suiteArmsFailing(r.out);
    return { ok: r.exit === 1 && got.join(",") === want.join(","),
             what: `refusal-codes.test.mjs exits 1 failing at exactly [${want.join(", ")}] (measured [${got.join(", ")}])` };
  });
}

/* ================================================================ D-550
   (g1) ONE CATALOGUED CODE, ONE MINT SITE — ARMED AGAINST THE REAL store.mjs. The row's negative control:
   plant a second mint site of a single-site code, and arm G fails NAMING THE CODE. MACHINE_CANNOT_MOVE_VERSION
   is minted once in store.mjs today (not in MULTI_SITE_CANDIDATES). The plant sits at module scope beside the
   default export, OUTSIDE every governed span, so arms C and F read nothing new and the census (a SET of
   codes) does not move. DECLARED BEFORE ARMING: MUST FAIL on exactly two lines, both arm G's — the code
   named with its two sites, and the ceiling breached; MUST NOT fail anything else. */
console.log("\n(g1) A SECOND MINT SITE OF A SINGLE-SITE CODE in the real store.mjs — arm G fails naming it");
arm("(g1)", [{
  file: F.store,
  from: `export default {\n  fetch(req, env) {\n    return env.STORE.get(env.STORE.idFromName("bio")).fetch(req);`,
  to: `const d550Control = () => ({ ok: false, reason: "MACHINE_CANNOT_MOVE_VERSION" });\n`
    + `export default {\n  fetch(req, env) {\n    return env.STORE.get(env.STORE.idFromName("bio")).fetch(req);`,
}], guard, r => {
  const f = failLines(r.out);
  return {
    ok: r.exit === 1 && f.length === 2 && f.every(l => /^FAIL: arm G: /.test(l))
      && /arm G: VERSION_ACT_CHECKS\.MACHINE_CANNOT_MOVE_VERSION is now minted at 2 literal sites/.test(r.out),
    what: `the guard exits 1 naming MACHINE_CANNOT_MOVE_VERSION at 2 sites, and nothing but arm G fails `
        + `(${f.length} FAIL line(s): ${f.map(l => l.slice(6, 60)).join(" | ")})`,
  };
});

/* ================================================================ D-542 / D-562
   (o1) THE ROW'S NEGATIVE CONTROL, ARMED AGAINST THE REAL app.html: take away every call the surface makes
   to a review-copy op (the seven UI-68 and D-150 built: casedraft, casedrafts, reviewgrant, reviewrevoke,
   reviewcopy, reviewcomment, statementack) and D-448's eleven codes leave R5 BY NAME. Each call's quoted op
   becomes `null`, so the helper still runs and the walk counts a computed op it cannot resolve.
   DECLARED BEFORE ARMING: MUST FAIL on R5's floor, and NO per-op R5 line may name any of the eleven; MUST NOT
   move the total reach — the eleven are D-448's family rows (R1) on main, which is why the control is read on
   R5's own lines and not on the total. Two public ops keep NO_REVIEW_COPY and REVIEW_NO_COMMENT_TEXT in R6,
   which is D-562's rule working, and is printed on the `D-562:` lines this check does not read.
   MEASURED 2026-09-25 on the item's tree: R5 335 -> 316, exit 1 on the floor, all eleven gone from R5.
   A FINDING ABOUT THE BRIEF'S ARM, kept: removing `reviewcopy`'s own two calls ALONE moved NOTHING (R5 335,
   exit 0). The ten act codes are minted by `reviewAct`, reached from casedraft/reviewgrant/reviewrevoke, and
   NO_REVIEW_COPY is carried by casedrafts, reviewcomment and statementack too; `reviewcopy`'s read mints one. */
const RVC_CALL = /\b(?:recR|apiQ|recPostR|actAsk|actAskPost|intentAsk|apiR)\(\s*"(?:casedraft|casedrafts|reviewgrant|reviewrevoke|reviewcopy|reviewcomment|statementack)"/g;
const rvcCalls = [...fs.readFileSync(F.app, "utf8").matchAll(RVC_CALL)].map(m => m[0]);
const { REVIEW_COPY_CHECKS } = await import("file://" + F.catalog + "?d542=" + Date.now());
const D448 = Object.keys(REVIEW_COPY_CHECKS);
const r5Lines = out => [...out.matchAll(/^ {2}arm B \/ D-542: {3}[^\n]*$/gm)].map(m => m[0]).join("\n");
console.log(`\n(o1) EVERY REVIEW-COPY OP CALL taken out of the real app.html (${rvcCalls.length} site(s)) — D-448's `
  + `${D448.length} codes leave R5 by name`);
arm("(o1)", rvcCalls.map(c => ({ file: F.app, from: c, to: c.replace(/"[a-z]+"/, "null") })), guard, r => {
  const still = D448.filter(c => new RegExp(`\\b${c}\\b`).test(r5Lines(r.out)));
  return {
    ok: r.exit === 1 && rvcCalls.length >= 7 && D448.length === 11 && still.length === 0
      && /R5 BY OP is \d+ code\(s\) minted on an op the surface calls, floor is \d+/.test(r.out)
      && reachOf(r.out) === reachOf(clean.out),
    what: `the guard exits 1 on R5's floor, no R5 line names any of D-448's ${D448.length} codes (still named: `
        + `${still.join(", ") || "none"}), and the total reach holds at ${reachOf(clean.out)} (read ${reachOf(r.out)})`,
  };
});

/* (o2) THE WALK'S ONE PRUNING DISARMED — the stop at ANOTHER op's entry method removed from
   reach-by-op.mjs. DECLARED: the fixture suite MUST fail at exactly ARM 13a, 13d and 13e (the three
   trees in which an op nobody calls is reached through the called op's entry and FIXTURE_FOREIGN leaks
   into reach) and MUST NOT fail 13b/13c (no call, so nothing is followed) or any other arm.
   MEASURED 2026-09-25 on the item's tree: exactly [ARM 13a, ARM 13d, ARM 13e]. */
console.log("\n(o2) THE STOP AT ANOTHER OP'S ENTRY removed from reach-by-op.mjs — its suite must fail at exactly ARM 13a, 13d, 13e");
arm("(o2)", [{ file: F.rbo, from: "      if (anyEntry.has(k) && !own.has(k)) continue;", to: "" }], () => run(SUITE), r => {
  const got = suiteArmsFailing(r.out), want = ["ARM 13a", "ARM 13d", "ARM 13e"];
  return { ok: r.exit === 1 && got.join(",") === want.join(","),
           what: `refusal-codes.test.mjs exits 1 failing at exactly [${want.join(", ")}] (measured [${got.join(", ")}])` };
});

/* ---------------------------------------------------------------- */
console.log("\n(z) THE TREE IS BACK — the guard is green again over the restored tree");
const after = guard();
report("(z) the guard exits 0 again", after.exit === 0, `exit ${after.exit}\n${after.out.slice(-700)}`);
report("(z) and reports the same reach it reported before any arm ran",
  reachOf(after.out) === reachOf(clean.out),
  `before ${reachOf(clean.out)} · after ${reachOf(after.out)} — a restore that changes the measurement is not a restore`);

function reachOf(out) { const m = /REACH (\d+) codes/.exec(out); return m ? m[1] : null; }

console.log(`\nrefusal-codes.control: ${failures ? `${failures} FAILED` : "all arms behaved"} — every arm armed against `
  + `the REAL tree, run, restored, and the restore verified BY HASH, BY CONTENT and by RE-RUNNING.`);
process.exit(failures ? 1 : 0);
