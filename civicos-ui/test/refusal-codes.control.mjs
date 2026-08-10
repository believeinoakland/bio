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
 *
 * ---------------------------------------------------------------------------
 * 2026-08-09 (D-254) — THE ARMS (p1)…(p7) BELOW COVER THE GUARD'S SHAPE rather
 * than its judgement: it is now a MODULE as well as a SCRIPT, and both halves
 * are driven. **Running this file end to end also found two of its own arms had
 * stopped running on `main`, and both are corrected at their sites rather than
 * exempted:**
 *
 *   - (n2) anchored on `refusalsJudged: 124` / `codesChecked: 122`, which are
 *     FLOOR FIGURES. They moved to 148/145, the anchor stopped matching, and
 *     `arm()` threw — correctly. But a throw ABORTS this file, so **(n3), (n4),
 *     (n5) and (n6) had not run at all for as long as that was true.** Those
 *     three edits now anchor on the KEY (`/^  refusalsJudged: \d+,/m`), which is
 *     what the arm always meant.
 *   - (e) required the sentence `the plane census is N refusal codes, floor
 *     is …`. D-257 reworded it to print the reproducible census beside the
 *     working-tree one, so **(e) had been RED over a guard doing exactly what
 *     (e) asks** — verified on a pristine checkout of `19745ad` before anything
 *     here was changed.
 *
 * Both are the same class as D-254 itself: an instrument that stopped doing its
 * job while continuing to look like one.
 */
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
  runner:  path.join(HERE, "run.mjs"),
};

const sha = f => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");

function run(cmd) {
  try { return { exit: 0, out: String(execFileSync("node", [cmd], { stdio: "pipe" })) }; }
  catch (e) { return { exit: e.status ?? -1, out: String(e.stdout || "") + String(e.stderr || "") }; }
}
const guard  = () => run(F.guard);
/* `test/run.mjs` runs the whole UI harness; the (c) arm needs its exit status
   and nothing else, and it is the only arm that pays for the full pass. */
const runner = () => run(F.runner);
/* D-254 (p4) needs the guard's OWN SUITE rather than the whole harness: ARM 1
   there is the layer that notices a guard which stopped running. */
const suite  = () => run(path.join(HERE, "refusal-codes.test.mjs"));

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
  const before = new Map();
  for (const e of edits) before.set(e.file, { text: fs.readFileSync(e.file, "utf8"), hash: sha(e.file) });
  for (const f of aside) before.set(f, { text: fs.readFileSync(f, "utf8"), hash: sha(f) });

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
     anchor was consumed by an earlier edit throws instead of passing silently.

     `from` MAY BE A REGEXP, and that is a CORRECTION too (D-254, 2026-08-09 —
     corrected, never exempted). Arm (n2) anchored on `  refusalsJudged: 124,`
     and `  codesChecked: 122,`, which are FLOOR FIGURES: they moved to 148 and
     145 as the plane grew, the anchors stopped matching, and this function did
     exactly what it promises — it THREW. **But it throws, so the control ABORTS
     THERE, and arms (n3), (n4), (n5) and (n6) have not run on `main` since the
     floors moved.** A loud abort is the right behaviour for an anchor that has
     genuinely moved; it is the wrong price for an anchor that was never meant
     to name a number in the first place. Anchoring those three on
     `/^  refusalsJudged: \d+,/m` says what the arm actually means — *whatever
     this floor is, relax it* — and cannot go stale on the next floor move.
     Use NON-GLOBAL regexes: `.test` on a `/g` regex is stateful. */
  const has = (t, from) => from instanceof RegExp ? from.test(t) : t.includes(from);
  const show = from => from instanceof RegExp ? String(from) : JSON.stringify(from.slice(0, 90));
  const working = new Map();
  for (const e of edits) {
    const t = working.has(e.file) ? working.get(e.file) : before.get(e.file).text;
    if (!has(t, e.from))
      throw new Error(`${name}: the text this control removes is not in ${path.basename(e.file)} — the `
        + `subject moved, or an earlier edit in this same arm already consumed it. A control that cannot `
        + `find what it breaks proves nothing and MUST NOT pass silently. Looked for: `
        + `${show(e.from)}`);
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
  }

  const verdict = expect(result);
  report(`${name} — ${verdict.what}`, verdict.ok,
    `exit ${result.exit}; output did not contain what this arm requires.\n       ${result.out.slice(-700)}`);

  /* THE RESTORE, three ways. */
  for (const e of edits) {
    const b = before.get(e.file);
    report(`${name} — ${path.basename(e.file)} restored BY HASH`, sha(e.file) === b.hash, `sha differs`);
    report(`${name} — ${path.basename(e.file)} restored BY CONTENT (the removed text is present again)`,
      has(fs.readFileSync(e.file, "utf8"), e.from),
      `the bytes hash the same but the substring this control removed is absent — establish which file you are looking at`);
  }
  for (const f of aside) {
    const b = before.get(f);
    report(`${name} — ${path.basename(f)} restored BY HASH`, fs.existsSync(f) && sha(f) === b.hash, `sha differs or file absent`);
    report(`${name} — ${path.basename(f)} restored BY CONTENT (its first declaration is back)`,
      fs.existsSync(f) && fs.readFileSync(f, "utf8").startsWith(b.text.slice(0, 200)),
      `the file is back but does not begin as it did — establish which file you are looking at`);
  }
  return result;
}

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
  /* THE EXPECTATION WAS STALE, NOT THE ARM (D-254, 2026-08-09 — corrected,
     never exempted). It read `/the plane census is \d+ refusal codes, floor
     is/`, and D-257 REWORDED that sentence: the guard now prints the
     REPRODUCIBLE census beside the working-tree one — "the plane census is 424
     refusal codes that are in the commit at HEAD (424 over the working tree),
     floor is 429" — so the comma the regex needed is gone. **The arm has been
     RED on `main` ever since, over a guard that was behaving exactly as this
     arm requires**: measured 2026-08-09 on a pristine checkout of `19745ad`,
     the guard exits 1, the census falls 429 -> 424 and the per-matcher line
     reads `M2 reason:<expr>  0 codes`. Anchored now on the two claims that
     matter and not on the punctuation between them. */
  ok: r.exit === 1
      && /the plane census is \d+ refusal codes/.test(r.out)
      && /floor is \d+\. The WALK lost/.test(r.out)
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
   three ratchet figures are relaxed IN THIS ARM ONLY, and the reason is stated
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
  { file: F.guard, from: `    if (kind) return { key: p.key, kind };`, to: `    if (kind && p.key === "ok") return { key: p.key, kind };` },
  /* ANCHORED ON THE KEY, NOT ON THE NUMBER (D-254, 2026-08-09 — corrected,
     never exempted). These read `refusalsJudged: 124` and `codesChecked: 122`
     when they were written and both figures have since moved (148 and 145),
     so this arm THREW and the control ABORTED HERE — (n3)…(n6) had not run on
     `main` for as long as that was true. What the arm means is *whatever these
     floors are, relax them for this one emulation*, and that is now what it
     says. The trailing per-key comments survive: `.replace` only consumes the
     matched span, which ends at the comma. */
  { file: F.guard, from: /^  refusalsJudged: \d+,/m, to: `  refusalsJudged: 0,` },
  { file: F.guard, from: /^  codesChecked: \d+,/m, to: `  codesChecked: 0,` },
  { file: F.guard, from: /^  unclassifiedOutcomes: \d+,/m, to: `  unclassifiedOutcomes: 999,` },
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
arm("(n3)", [{
  file: F.airun,
  from: `export function checkBound(bound) {`,
  to: `export function checkBound(bound) {
  if (bound === "__rec76_control__") return { found: true, rows: [], more: false };`,
}], guard, r => ({
  ok: r.exit === 0,
  what: "the guard exits 0 — a return that declares itself a success is not a refusal and owes no code",
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
  file: F.guard,
  from: `function outcomeReturns(text) {`,
  to: `function outcomeReturns(text) { return [];`,
}], guard, r => ({
  ok: r.exit === 1 && /THE CORPUS COLLAPSED/.test(r.out)
      && /THE OUTCOME WALK — 0 return-position outcome\(s\) read/.test(r.out),
  what: "the guard exits 1 on the CORPUS floor, and the printed line shows the corpus at 0 rather than "
      + "leaving a reader to infer that a green run meant anything",
}));

/* ================================================================ D-254
   THE ENTRY-POINT CHECK — IS THIS FILE IMPORTABLE, AND DOES THE SCRIPT HALF
   STILL BITE?

   D-254 moved the guard's run behind `if (INVOKED_AS_SCRIPT) await main()`.
   That change has two directions and BOTH have to be driven, because each one
   alone is satisfiable by a broken file: a guard that never runs is importable,
   and a guard that always runs is a gate. The arms below are:

     (p1) BASELINE — importing the guard runs NOTHING and the importer keeps its
          own exit status. Without this row, (p2)'s red and a six-arms-broken
          harness look identical.
     (p2) THE DEFECT RE-ARMED — the entry-point check removed, restoring the
          pre-D-254 shape. DECLARED: MUST show that importing runs the whole
          guard and takes the loading process's exit status away from it. This
          is the arm that proves the fix is what removed the hazard, rather than
          the hazard having never been there.
     (p3) THE SCRIPT HALF STILL BITES — a codeless refusal at a governed site,
          the guard run AS A SCRIPT. DECLARED: MUST FAIL, exit 1, naming the
          site. **If this ever passes, the entry-point check has turned a gate
          into a decoration**, which is worse than the defect it guards.
     (p4) THE CHECK NEUTERED — `INVOKED_AS_SCRIPT` forced false WITH a codeless
          refusal in the tree. DECLARED: the guard MUST go silently green (that
          is the hazard, stated), AND `refusal-codes.test.mjs` MUST catch it,
          because ARM 1 requires the guard's summary SENTENCE and not merely
          exit 0. An unrun guard prints nothing, so ARM 1 is the layer.
     (p7) THE PIN ITSELF — the entry-point check removed, and `refusal-codes.
          test.mjs` ARM 11 must FIRE. A control proves a property once, on the
          day somebody runs it; ARM 11 is the same property in the UI harness,
          which every worker's gate runs. This arm is what says ARM 11 is not
          decorative.
     (p5) OVER-STRICTNESS — the guard invoked through a SYMLINK, which is the
          one spelling where `argv[1]` and `import.meta.url` genuinely differ
          (measured: `===` and `path.resolve` both read false, `realpathSync`
          reads true). DECLARED: MUST STILL RUN and MUST STILL FAIL the tree —
          correct work in a spelling nobody anticipated may not be waved
          through, and may not be silently skipped either.
   ================================================================ */

const CODELESS = {
  file: F.airun,
  from: `export function checkBound(bound) {`,
  to: `export function checkBound(bound) {
  if (bound === "__d254_control__") return { ok: false, detail: "a refusal nobody gave a code" };`,
};
const ENTRY_LINE = `if (INVOKED_AS_SCRIPT) await main();`;

/* Import the guard from a child process that then exits 7. If loading the
   module runs the guard, the guard's own `process.exit` fires first and 7 never
   happens; if loading is inert, 7 is what comes back. The sentinel is checked
   as well as the status, because "exit 7" with no sentinel would mean the
   child died some other way. */
const importProbe = () => {
  const code = `const m = await import(${JSON.stringify("file://" + F.guard)});`
    + `console.log("D254-SENTINEL exports=" + Object.keys(m).sort().join(","));`
    + `process.exit(7);`;
  try { const out = execFileSync("node", ["--input-type=module", "-e", code], { stdio: "pipe" });
        return { exit: 0, out: String(out) }; }
  catch (e) { return { exit: e.status ?? -1, out: String(e.stdout || "") + String(e.stderr || "") }; }
};

console.log("\n(p1) BASELINE — importing the guard is INERT");
const inert = importProbe();
report("(p1) the importer keeps its own exit status (7), so nothing in the guard called process.exit",
  inert.exit === 7, `exit ${inert.exit}\n${inert.out.slice(-500)}`);
report("(p1) the importer reached its own code and got the six reader functions",
  /D254-SENTINEL exports=.*verdictOf/.test(inert.out) && /skipString/.test(inert.out),
  `sentinel absent or exports missing:\n${inert.out.slice(-500)}`);
report("(p1) and loading printed NONE of the guard's own output",
  !/check-refusal-codes: every code a surface/.test(inert.out) && !/UNION \(the census\)/.test(inert.out),
  `the guard's output appeared on an IMPORT:\n${inert.out.slice(-500)}`);

/* (p2) IS TWO ARMS BECAUSE THE FIRST DRAFT WAS ONE, AND IT CAME BACK WRONG.
   IT WAS DECLARED AS: with the entry-point check removed, importing the guard
   runs it AND the importer never reaches its own exit (7). **It came back
   `exit 7` WITH the guard's full output above the sentinel** — and that is a
   fact about the defect, not a fault in the fix. The pre-D-254 file has NO
   `process.exit(0)`: on a GREEN tree `main()` simply falls off the end, so the
   importing process survives — having silently spent a census walk, five arms
   and a `git ls-tree` inside itself. The KILL only arrives when the guard has
   something to report, which is **exactly the tree state a test most needs to
   run on**. So the hazard is split and both halves are declared:
     (p2a) importing RUNS the guard — on any tree;
     (p2b) importing KILLS the loader — on a tree the guard fails.
   Recorded rather than smoothed: a surprising green is a finding about the arm. */
console.log("\n(p2a) THE DEFECT RE-ARMED — the entry-point check removed (the pre-D-254 shape)");
arm("(p2a)", [{ file: F.guard, from: ENTRY_LINE, to: `await main();` }], importProbe, r => ({
  ok: /check-refusal-codes: every code a surface/.test(r.out) && /UNION \(the census\)/.test(r.out),
  what: "merely IMPORTING the guard runs the whole DEC-49 walk — census, five arms and a git call — "
      + "inside the importing process, which is why D-240 could not import the verdict reader",
}));

console.log("\n(p2b) …AND ON A TREE THE GUARD FAILS, IMPORTING KILLS THE LOADER");
arm("(p2b)", [CODELESS, { file: F.guard, from: ENTRY_LINE, to: `await main();` }], importProbe, r => ({
  ok: r.exit === 1 && !/D254-SENTINEL/.test(r.out),
  what: `the importer is killed by the guard's own process.exit — it exits ${r.exit} rather than its own 7 `
      + `and NEVER REACHES ITS OWN CODE (no sentinel). A test that imported this file for one function `
      + `would have died here, reporting the guard's exit status as its own`,
}));

console.log("\n(p3) THE SCRIPT HALF STILL BITES — a codeless refusal, the guard run as a script");
arm("(p3)", [CODELESS], guard, r => ({
  ok: r.exit === 1 && /src\/airun\.mjs:\d+ \(in checkBound\) returns a CODELESS REFUSAL/.test(r.out),
  what: "the guard exits 1 naming the site — the entry-point check did NOT turn the gate into a decoration",
}));

console.log("\n(p4) THE CHECK NEUTERED — the guard goes silently green, and its SUITE is what catches that");
arm("(p4)", [CODELESS, { file: F.guard, from: ENTRY_LINE, to: `if (false) await main();` }],
  () => {
    /* `exit`/`out` are carried on the RESULT because `arm`'s failure detail
       reads `result.out.slice(-700)` EAGERLY — an arm whose runner returns a
       different shape crashes the control on its way to reporting a PASS. */
    const g = guard(), s = suite();
    return { exit: g.exit, out: `[guard exit ${g.exit}] ${g.out}\n[suite exit ${s.exit}] ${s.out.slice(-400)}`, g, s };
  }, r => ({
    ok: r.g.exit === 0 && !/check-refusal-codes:/.test(r.g.out) && r.s.exit === 1,
    what: `the neutered guard exits 0 printing nothing (guard exit ${r.g.exit}, ${r.g.out.trim().length} chars), `
        + `and refusal-codes.test.mjs exits ${r.s.exit} — ARM 1 asks for the guard's SENTENCE, so a gate that `
        + `silently stopped running cannot pass as a gate that passed`,
  }));

console.log("\n(p5) OVER-STRICTNESS — invoked through a SYMLINK, the guard must still run and still bite");
arm("(p5)", [CODELESS], () => {
  /* The link has to sit BESIDE the guard: this file resolves `../bio-plane`
     from its own location, and `import.meta.url` is the RESOLVED target, so a
     link in `civicos-ui/` gives the guard the same HERE it always had. It is a
     dotfile and it is removed in a `finally`, because an untracked `*.mjs`
     under a walked directory is D-238's payload (a phantom file raising a
     corpus somebody then floors to). */
  const link = path.join(UI, ".d254-entrypoint-link.mjs");
  try { fs.rmSync(link, { force: true }); fs.symlinkSync("check-refusal-codes.mjs", link); return run(link); }
  finally { fs.rmSync(link, { force: true }); }
}, r => ({
  ok: r.exit === 1 && /src\/airun\.mjs:\d+ \(in checkBound\) returns a CODELESS REFUSAL/.test(r.out),
  what: "a spelling where argv[1] is the LINK and import.meta.url is the TARGET still counts as being "
      + "INVOKED — a string compare would have exited 0 in silence here",
}));

console.log("\n(p7) THE PIN ITSELF — remove the entry-point check and ARM 11 of the SUITE must fire");
arm("(p7)", [{ file: F.guard, from: ENTRY_LINE, to: `await main();` }], suite, r => ({
  ok: r.exit === 1 && /ARM 11/.test(r.out),
  what: "refusal-codes.test.mjs exits 1 NAMING ARM 11 — the property is pinned in the loop the reader "
      + "actually runs, not only in this control, which nothing runs automatically",
}));

console.log("\n(p6) BASELINE AGAIN — the import is inert once more, after five arms edited this file");
const inert2 = importProbe();
report("(p6) importing is inert again (exit 7, sentinel present, no guard output)",
  inert2.exit === 7 && /D254-SENTINEL/.test(inert2.out) && !/UNION \(the census\)/.test(inert2.out),
  `exit ${inert2.exit}\n${inert2.out.slice(-500)}`);

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
