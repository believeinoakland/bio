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

  for (const e of edits) {
    const t = before.get(e.file).text;
    if (!t.includes(e.from))
      throw new Error(`${name}: the text this control removes is not in ${path.basename(e.file)} — the `
        + `subject moved. A control that cannot find what it breaks proves nothing and MUST NOT pass `
        + `silently. Looked for: ${JSON.stringify(e.from.slice(0, 90))}`);
    fs.writeFileSync(e.file, t.replace(e.from, e.to));
  }
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
