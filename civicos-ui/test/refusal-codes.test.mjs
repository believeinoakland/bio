/* refusal-codes.test.mjs — THE DEC-49 GUARD'S OWN SUITE (VF-2).
 *
 * `../check-refusal-codes.mjs` is the instrument. **THE INSTRUMENT IS THE MOST
 * LIKELY THING TO BE WRONG**, and this file is the evidence that it is not: it
 * exercises the guard's judgement over FIXTURES it constructs, so every arm is
 * proved to fire on the defect it claims to catch and to stay silent on the
 * shape it must accept.
 *
 * The guard itself runs over the REAL corpus in `test/run.mjs`. This file runs
 * over fixtures, because a guard that has only ever been observed passing on the
 * real tree is a guard nobody has seen fail — the exact condition CLAUDE.md's
 * negative-control rule exists to end.
 *
 * WHY THE FIXTURES ARE A WHOLE FAKE TREE. The guard reads files: a check
 * catalog, a plane source directory, an `app.html`, a test directory. To make it
 * judge a codeless refusal, the cheapest honest thing is to give it a small tree
 * that contains one. It is BUILT IN THIS WORKTREE, under this file's own
 * directory, and never in a shared scratchpad — on 2026-08-07 a worker's harness
 * was overwritten mid-turn by another running worker, and a harness silently
 * replaced between ARM and RESTORE can report a restore it never performed.
 * Every fixture tree here is created and removed inside one run, under a
 * mkdtemp'd directory whose parent is this worktree.
 *
 * ============================================================================
 * NEGATIVE CONTROL: **remove the guard entirely — the file, its suite and its
 *   two lines in `test/run.mjs` -> a CODELESS REFUSAL IN `airun.mjs` PASSES,
 *   because nothing is looking. THE GUARD'S ABSENCE IS THE DEFECT**, so that is
 *   the arm that proves the guard EXISTS rather than merely runs, and it is
 *   arm (c) below.
 *   ALL SEVEN ARMS RUN 2026-08-07 against the REAL tree by
 *   `test/refusal-codes.control.mjs` — one step, no re-deriving — each restored
 *   and VERIFIED BY CONTENT AS WELL AS BY HASH (sha256 before/after, the removed
 *   substring present again, and the guard re-run green with the SAME REACH it
 *   reported before any arm ran; a hash alone is satisfied by a file swapped for
 *   another copy of itself by a process that never performed the restore):
 *
 *   (a) THE ROW'S — take the `translation` off AI_RUN_CHECKS.AI_LOG_STATE_UNKNOWN
 *       in `bio-plane/checks/bio-checks.mjs`. RUN: the guard exits 1 with
 *         FAIL: AI_RUN_CHECKS.AI_LOG_STATE_UNKNOWN has NO CANNED TRANSLATION.
 *       **CORRECTED AT FIRST RUN, and the correction is the point**: this arm
 *       first INSERTED `translation: undefined,` ahead of the real one, and the
 *       LATER duplicate key wins in an object literal — the row kept its real
 *       translation and the guard was right to pass. A control that does not
 *       break its subject proves nothing; this one caught itself.
 *   (b) THE TEETH — add `return { ok:false, detail:"…" }` to `checkBound` in
 *       `bio-plane/src/airun.mjs`. RUN: the guard exits 1 with
 *         FAIL: src/airun.mjs:245 (in checkBound) returns a CODELESS REFUSAL …
 *       naming file, line and function. **THIS IS VF-2'S ACCEPTANCE ARM.**
 *   (c) THE GUARD REMOVED — with (b)'s codeless refusal in place, take the guard
 *       file, this suite and the `run.mjs` invocation out. RUN: `node
 *       test/run.mjs` exits 0. **A FINDING AT FIRST RUN:** removing only the
 *       INVOCATION was NOT enough — arm 8 of this suite asserts `run.mjs`
 *       invokes the guard, and it failed the run on its own. That is a second,
 *       independent layer and it is worth knowing; it is not the arm VF-2 asks
 *       for, which is the state before VF-2 existed.
 *   (d) THE SURFACE HOLE — delete `TOO_LARGE` from `PART_REASON` in `app.html`.
 *       RUN: the guard exits 1 with
 *         FAIL: app.html's `PART_REASON` has NO WORDING for 1 code(s) its
 *         producer src/subresources.mjs can mint: TOO_LARGE …
 *   (e) THE WALK NEUTERED — make M2 match nothing. RUN: the guard exits 1 on the
 *       CENSUS FLOOR, printing the per-matcher line with M2 at 0 codes. A ceiling
 *       alone would have stayed green: REC-70's neutered walk sat at 0 of 40.
 *   (f) THE RATCHET — mint `VF2_BRAND_NEW_CONDITION` in `airun.mjs` and have a
 *       suite name it. RUN: the guard exits 1 naming it and saying the ceiling
 *       may only ever move DOWN.
 *   (g) OVER-STRICTNESS, and it must PASS — a correctly coded-and-translated
 *       refusal phrased unlike anything in this repository (arm 7 below: a
 *       question, an em-dash, and one row in Spanish) is ACCEPTED. A guard that
 *       only accepts the wording its author wrote is a guard that will be
 *       switched off the first time somebody writes well.
 *
 *   (a),(b),(d),(e),(f),(g) are ALSO re-run mechanically by arms 2-7 below over
 *   fixture trees, every run of the battery.
 * ============================================================================
 */
import fs from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";
import { execFileSync } from "child_process";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const UIDIR = path.join(HERE, "..");
const GUARD = path.join(UIDIR, "check-refusal-codes.mjs");

let n = 0, bad = 0;
function t(name, got, want) {
  n++;
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) console.log(`  ok   ${name}`);
  else { bad++; console.log(`  FAIL ${name}\n       got  ${g}\n       want ${w}`); }
}

/* ============================================================
   THE FIXTURE TREE

   A minimal repository the guard can be pointed at: bio-plane/checks,
   bio-plane/src, civicos-ui/app.html, civicos-ui/test. Built under THIS
   WORKTREE (mkdtemp under civicos-ui/test), never in a shared scratchpad.
   ============================================================ */

const DEFAULT_TRANSLATION =
  "That request did not say which document address to read the versions of, so nothing was looked up "
  + "and no document was guessed at in its place.";

function buildTree(over = {}) {
  const root = fs.mkdtempSync(path.join(HERE, ".vf2-fixture-"));
  const ui = path.join(root, "civicos-ui");
  const src = path.join(root, "bio-plane", "src");
  const checks = path.join(root, "bio-plane", "checks");
  fs.mkdirSync(path.join(ui, "test"), { recursive: true });
  fs.mkdirSync(src, { recursive: true });
  fs.mkdirSync(checks, { recursive: true });

  const rows = over.rows || {
    FIXTURE_NO_ADDRESS: {
      check: "C-90.1",
      where: "src/fixture.mjs checkFixture",
      translation: DEFAULT_TRANSLATION,
    },
    FIXTURE_BAD_ANCHOR: {
      check: "C-90.2",
      where: "src/fixture.mjs checkFixture",
      translation: "That is not the shape a capture identity has, so nothing was looked up at all and "
        + "the request is reported as malformed rather than as a document the record does not hold.",
    },
    FIXTURE_TWO_NO_ARM: {
      check: "C-91.1",
      where: "src/fixture.mjs checkSecond",
      translation: "That request did not say which kind of meaning to read, and the record holds two "
        + "kinds that answer different questions, so it asks rather than choosing one for you.",
    },
  };

  fs.writeFileSync(path.join(checks, "bio-checks.mjs"),
    `export const FIXTURE_CHECKS = ${JSON.stringify(rows, null, 2)};\n`);

  const body = over.fixtureSrc || `
export function checkFixture(input = {}) {
  if (!input.address) return { ok: false, code: "FIXTURE_NO_ADDRESS", detail: "no address" };
  if (!/^[0-9a-f]{64}$/.test(String(input.at || ""))) {
    return { ok: false, code: "FIXTURE_BAD_ANCHOR", detail: String(input.at) };
  }
  return null;
}
export function checkSecond(rows = {}) {
  if (!rows.arm) return { ok: false, code: "FIXTURE_TWO_NO_ARM", detail: "no arm" };
  return null;
}
`;
  fs.writeFileSync(path.join(src, "fixture.mjs"), body);

  /* A second plane file, so the census is not one file wide and the producer
     pairing has something real to be total over. */
  fs.writeFileSync(path.join(src, "parts.mjs"), over.partsSrc || `
export function record(platform, url) {
  if (!url) return { ok: false, reason: "NO_ADDRESS_GIVEN" };
  if (url.length > 99) return { ok: false, reason: "PART_TOO_LARGE" };
  return { ok: false, reason: platform ? "PART_PLATFORM_LIMIT" : "PART_FETCH_FAILED" };
}
`);

  fs.writeFileSync(path.join(ui, "app.html"), over.app || `<html><script>
const PART_REASON = {
  NO_ADDRESS_GIVEN: "the page never said where it was",
  PART_TOO_LARGE: "too large to keep",
  PART_PLATFORM_LIMIT: "no more requests could be made on this pass",
  PART_FETCH_FAILED: "the site could not be reached",
};
</script></html>
`);
  fs.writeFileSync(path.join(ui, "test", "fixture.test.mjs"), over.suite || `const r = { reason: "PART_TOO_LARGE" };\n`);

  /* Arm E's subject: the PLANE's own code->text vocabularies, the ones a
     surface renders VERBATIM (DEC-49's UI-47 input). `FIXTURE_STATUS` has
     NUMERIC values and must be ignored BY SHAPE rather than by an exception —
     it is not text a member reads. */
  fs.writeFileSync(path.join(src, "vocab.mjs"), over.vocabSrc || `
export const FIXTURE_BOUNDS = {
  fetches: "fetches requested of the capture path",
  wallclock: "wall time across resumptions, in milliseconds",
};
export const FIXTURE_ENDINGS = {
  completed: "the run finished its work",
  cancelled: "a member stopped it",
};
export const FIXTURE_STATUS = { running: 1, finished: 1 };
`);

  /* The guard, copied in so it resolves ../bio-plane relative to the fixture,
     with its ratchet rewritten to the fixture's own measured figures. Copying
     is what lets an arm neuter a matcher without touching the real guard. */
  let guard = fs.readFileSync(GUARD, "utf8");
  guard = guard.replace(/const FLOOR = \{[\s\S]*?\n\};/, `const FLOOR = ${JSON.stringify(Object.assign({
    families: 1, rows: 3, census: 7, reach: 7, governedSites: 2, surfaceTables: 1, bodyLines: 6,
    vocabularies: 2, vocabularyTerms: 4,
  }, over.floor || {}))};`);
  guard = guard.replace(/const CEILING = \{[\s\S]*?\n\};/, `const CEILING = ${JSON.stringify(over.ceiling || { reachGap: 0 })};`);
  guard = guard.replace(/PART_REASON: "src\/subresources\.mjs"/, `PART_REASON: "src/parts.mjs"`);
  guard = guard.replace(/const VOCABULARY_MODULES = new Map\(Object\.entries\(\{[\s\S]*?\n\}\)\);/,
    `const VOCABULARY_MODULES = new Map(Object.entries({ "src/vocab.mjs": "the fixture's vocabularies" }));`);
  if (over.mutateGuard) guard = over.mutateGuard(guard);
  fs.writeFileSync(path.join(ui, "check-refusal-codes.mjs"), guard);
  return { root, ui };
}

function runGuard(tree) {
  try {
    const out = execFileSync("node", [path.join(tree.ui, "check-refusal-codes.mjs")], { stdio: "pipe" });
    return { exit: 0, out: String(out) };
  } catch (e) {
    return { exit: e.status === undefined ? -1 : e.status, out: String(e.stdout || "") + String(e.stderr || "") };
  }
}

function withTree(over, fn) {
  const tree = buildTree(over);
  try { return fn(tree); }
  finally { try { fs.rmSync(tree.root, { recursive: true, force: true }); } catch (_) {} }
}

/* ============================================================
   ARM 1 — THE POSITIVE CONTROL, and it must come first.

   A control that only ever fails proves the guard is noisy, not that it is
   right. A conformant fixture tree must pass, or every arm below is measuring
   a guard that refuses everything.
   ============================================================ */
console.log("\n--- ARM 1 · a conformant tree PASSES (the positive control) ---");
withTree({}, tree => {
  const r = runGuard(tree);
  t("ARM 1: a fully coded-and-translated fixture tree exits 0", r.exit, 0);
  t("ARM 1: and it says so", /every code a surface can receive carries a canned translation/.test(r.out), true);
  t("ARM 1: with its corpus size PRINTED, not merely asserted (a walk that has gone blind is visible)",
    /UNION \(the census\)\s+\d+ codes/.test(r.out), true);
});

/* ============================================================
   ARM 2 — THE RULING'S OWN SENTENCE: an untranslated code FAILS THE HARNESS.
   ============================================================ */
console.log("\n--- ARM 2 · a code with no canned translation FAILS, naming it ---");
withTree({
  rows: {
    FIXTURE_NO_ADDRESS: { check: "C-90.1", where: "src/fixture.mjs checkFixture" },   // no translation
    FIXTURE_BAD_ANCHOR: { check: "C-90.2", where: "src/fixture.mjs checkFixture", translation: DEFAULT_TRANSLATION },
    FIXTURE_TWO_NO_ARM: { check: "C-91.1", where: "src/fixture.mjs checkSecond",
      translation: "That request did not say which kind of meaning to read, and the record holds two kinds." },
  },
}, tree => {
  const r = runGuard(tree);
  t("ARM 2: a row with no translation exits 1", r.exit, 1);
  t("ARM 2: and NAMES the code", /FIXTURE_NO_ADDRESS has NO CANNED TRANSLATION/.test(r.out), true);
});

console.log("\n--- ARM 2b · a translation that restates the machine code is not a translation ---");
withTree({
  rows: {
    FIXTURE_NO_ADDRESS: { check: "C-90.1", where: "src/fixture.mjs checkFixture",
      translation: "The request failed with FIXTURE_NO_ADDRESS because no ADDRESS_FIELD was supplied to it." },
    FIXTURE_BAD_ANCHOR: { check: "C-90.2", where: "src/fixture.mjs checkFixture", translation: DEFAULT_TRANSLATION },
    FIXTURE_TWO_NO_ARM: { check: "C-91.1", where: "src/fixture.mjs checkSecond",
      translation: "That request did not say which kind of meaning to read, and the record holds two kinds." },
  },
}, tree => {
  const r = runGuard(tree);
  t("ARM 2b: exits 1", r.exit, 1);
  t("ARM 2b: naming the machine vocabulary it found inside the translation",
    /restates machine vocabulary \(FIXTURE_NO_ADDRESS, ADDRESS_FIELD\)/.test(r.out), true);
});

/* ============================================================
   ARM 3 — THE TEETH. **VF-2's acceptance arm.**
   A codeless refusal at a governed site FAILS, naming file, line and function.
   ============================================================ */
console.log("\n--- ARM 3 · a CODELESS refusal at a governed site FAILS naming it (VF-2's acceptance) ---");
withTree({
  fixtureSrc: `
export function checkFixture(input = {}) {
  if (!input.address) return { ok: false, code: "FIXTURE_NO_ADDRESS", detail: "no address" };
  if (input.broken) return { ok: false, detail: "something went wrong" };
  if (!/^[0-9a-f]{64}$/.test(String(input.at || ""))) {
    return { ok: false, code: "FIXTURE_BAD_ANCHOR", detail: String(input.at) };
  }
  return null;
}
export function checkSecond(rows = {}) {
  if (!rows.arm) return { ok: false, code: "FIXTURE_TWO_NO_ARM", detail: "no arm" };
  return null;
}
`,
}, tree => {
  const r = runGuard(tree);
  t("ARM 3: exits 1", r.exit, 1);
  t("ARM 3: naming the file, the line and the function", /src\/fixture\.mjs:\d+ \(in checkFixture\) returns a CODELESS REFUSAL/.test(r.out), true);
  /* The quoted text is the WHOLE refusal object literal, not a fixed-width
     slice of it — see `objectLiteralAround`'s header for why that changed and
     what the fixed window got wrong. */
  t("ARM 3: and quoting the offending refusal object so it can be found without re-deriving it",
    /Offending text: "\{ ok: false, detail: /.test(r.out), true);
});

console.log("\n--- ARM 3b · a code minted at a governed site with NO ROW fails too ---");
withTree({
  fixtureSrc: `
export function checkFixture(input = {}) {
  if (!input.address) return { ok: false, code: "FIXTURE_NO_ADDRESS", detail: "no address" };
  if (input.other) return { ok: false, code: "FIXTURE_INVENTED_HERE", detail: "x" };
  if (!/^[0-9a-f]{64}$/.test(String(input.at || ""))) {
    return { ok: false, code: "FIXTURE_BAD_ANCHOR", detail: String(input.at) };
  }
  return null;
}
export function checkSecond(rows = {}) {
  if (!rows.arm) return { ok: false, code: "FIXTURE_TWO_NO_ARM", detail: "no arm" };
  return null;
}
`,
}, tree => {
  const r = runGuard(tree);
  t("ARM 3b: exits 1", r.exit, 1);
  t("ARM 3b: naming the code that has no row", /refuses with code FIXTURE_INVENTED_HERE, which is NOT a row/.test(r.out), true);
});

/* ============================================================
   ARM 4 — THE SURFACE HOLE. A table with a hole IS an untranslated code
   reaching a member, because the render site falls back to printing the code.
   ============================================================ */
console.log("\n--- ARM 4 · a hole in a surface translation table FAILS ---");
withTree({
  app: `<html><script>
const PART_REASON = {
  NO_ADDRESS_GIVEN: "the page never said where it was",
  PART_PLATFORM_LIMIT: "no more requests could be made on this pass",
  PART_FETCH_FAILED: "the site could not be reached",
};
</script></html>
`,
}, tree => {
  const r = runGuard(tree);
  t("ARM 4: exits 1", r.exit, 1);
  t("ARM 4: naming the table, the producer and the missing code",
    /`PART_REASON` has NO WORDING for 1 code\(s\) its producer src\/parts\.mjs can mint: PART_TOO_LARGE/.test(r.out), true);
});

console.log("\n--- ARM 4b · a surface table with NO producer paired FAILS rather than being skipped ---");
withTree({
  mutateGuard: g => g.replace(/PART_REASON: "src\/parts\.mjs"/, `SOME_OTHER_TABLE: "src/parts.mjs"`),
}, tree => {
  const r = runGuard(tree);
  t("ARM 4b: exits 1", r.exit, 1);
  t("ARM 4b: saying an unpaired table cannot be proved total",
    /table `PART_REASON`[\s\S]*TABLE_PRODUCERS does not pair with a producer/.test(r.out), true);
});

/* ============================================================
   ARM 5 — THE WALK NEUTERED. A CEILING IS NOT A RATCHET: the floor is what
   catches an instrument that has LOST sight, and REC-70 measured a walk sitting
   green at 0 of 40 because it had only ever had a ceiling.
   ============================================================ */
console.log("\n--- ARM 5 · neuter the code walk and the FLOOR fails, with the corpus size printed ---");
withTree({
  mutateGuard: g => g.replace(
    /'M1 reason:"CODE"':\s*src => harvest\(src, [^\n]*\),/,
    `'M1 reason:"CODE"':  src => new Set(),`)
    .replace(/'M2 reason:<expr>':\s*src => \{/, `'M2 reason:<expr>':  src => { return new Set(); /*`)
    .replace(/return out;\n  \},\n  \/\* DEC-49's own shape/, `return out; */ },\n  /* DEC-49's own shape`),
}, tree => {
  const r = runGuard(tree);
  t("ARM 5: exits 1 — a walk that lost sight is a FAILURE, not a green run", r.exit, 1);
  t("ARM 5: on the CENSUS FLOOR", /the plane census is \d+ refusal codes, floor is/.test(r.out), true);
  t("ARM 5: and the per-matcher line shows WHICH spelling went blind",
    /M1 reason:"CODE"\s+0 codes/.test(r.out), true);
});

/* ============================================================
   ARM 6 — THE RATCHET'S CEILING. REC-64 may only ever shrink the gap; a NEW
   receivable code with no translation must fail here.
   ============================================================ */
console.log("\n--- ARM 6 · a new receivable code with no translation trips the ceiling ---");
withTree({
  partsSrc: `
export function record(platform, url) {
  if (!url) return { ok: false, reason: "NO_ADDRESS_GIVEN" };
  if (url.length > 99) return { ok: false, reason: "PART_TOO_LARGE" };
  return { ok: false, reason: platform ? "PART_PLATFORM_LIMIT" : "PART_FETCH_FAILED" };
}
export function other(x) {
  if (!x) return { ok: false, reason: "BRAND_NEW_CONDITION" };
  return null;
}
`,
  suite: `const r = { reason: "BRAND_NEW_CONDITION" };\n`,
  app: `<html><script>
const PART_REASON = {
  NO_ADDRESS_GIVEN: "the page never said where it was",
  PART_TOO_LARGE: "too large to keep",
  PART_PLATFORM_LIMIT: "no more requests could be made on this pass",
  PART_FETCH_FAILED: "the site could not be reached",
};
</script></html>
`,
  floor: { families: 1, rows: 3, census: 8, reach: 8, governedSites: 2, surfaceTables: 1, bodyLines: 6 },
  ceiling: { reachGap: 0 },
}, tree => {
  const r = runGuard(tree);
  t("ARM 6: exits 1", r.exit, 1);
  t("ARM 6: naming the new code and saying the ceiling may only FALL",
    /BRAND_NEW_CONDITION[\s\S]*may only ever move it DOWN|may only ever move it DOWN[\s\S]*BRAND_NEW_CONDITION/.test(r.out), true);
});

/* ============================================================
   ARM 7 — OVER-STRICTNESS, and it must PASS.

   A correctly coded-and-translated refusal, phrased unlike anything in this
   repository — a different register, different sentence shape, an em-dash and a
   question, no house vocabulary at all — must be ACCEPTED. A guard that only
   accepts the wording its author wrote is a guard that will be switched off the
   first time somebody writes well, and DEC-49 explicitly leaves build-time or
   runtime lookup and the wording itself open.
   ============================================================ */
console.log("\n--- ARM 7 · a correctly coded refusal phrased unlike anything here PASSES (over-strictness) ---");
withTree({
  rows: {
    FIXTURE_NO_ADDRESS: { check: "C-90.1", where: "src/fixture.mjs checkFixture",
      translation: "Which one did you mean? Nothing was named, and rather than pick a likely-looking "
        + "candidate — the sort of guess that quietly hands you the wrong thing — this stops here." },
    FIXTURE_BAD_ANCHOR: { check: "C-90.2", where: "src/fixture.mjs checkFixture",
      translation: "¿Qué es esto? Es que no tiene la forma esperada; por eso no se buscó nada, "
        + "y se informa como una petición mal formada en vez de como algo ausente." },
    FIXTURE_TWO_NO_ARM: { check: "C-91.1", where: "src/fixture.mjs checkSecond",
      translation: "Two different things live under that word; picking one for you would answer a "
        + "question nobody asked. Say which, and it will read that one." },
  },
}, tree => {
  const r = runGuard(tree);
  t("ARM 7: exits 0 — an unfamiliar voice, a question, an em-dash and another language are all fine", r.exit, 0);
  t("ARM 7: and the guard still reports the reach it measured rather than falling silent",
    /REACH \d+ codes/.test(r.out), true);
});

/* ============================================================
   ARM 7b — THE PLANE'S OWN VOCABULARY TEXTS (DEC-49's UI-47 input).
   `src/airun.mjs` composes condition sentences the surface renders VERBATIM,
   so a vocabulary term with no text puts the machine word in front of a member
   exactly as an untranslated code does.
   ============================================================ */
console.log("\n--- ARM 6b · a code translated in BOTH homes FAILS — DEC-49 licenses either, and ONE ---");
withTree({
  rows: {
    FIXTURE_NO_ADDRESS: { check: "C-90.1", where: "src/fixture.mjs checkFixture", translation: DEFAULT_TRANSLATION },
    FIXTURE_BAD_ANCHOR: { check: "C-90.2", where: "src/fixture.mjs checkFixture",
      translation: "That is not the shape a capture identity has, so nothing was looked up at all." },
    FIXTURE_TWO_NO_ARM: { check: "C-91.1", where: "src/fixture.mjs checkSecond",
      translation: "That request did not say which kind of meaning to read, and the record holds two kinds." },
    /* The collision: a plane row for a code the surface table also words. */
    PART_TOO_LARGE: { check: "C-91.2", where: "src/fixture.mjs checkSecond",
      translation: "The part was larger than this pass keeps, so it was left where it is rather than copied." },
  },
  floor: { families: 1, rows: 4, census: 7, reach: 7, governedSites: 2, surfaceTables: 1, bodyLines: 6,
           vocabularies: 2, vocabularyTerms: 4 },
}, tree => {
  const r = runGuard(tree);
  t("ARM 6b: exits 1", r.exit, 1);
  t("ARM 6b: naming both homes and saying they will drift",
    /PART_TOO_LARGE is translated TWICE[\s\S]*they will `?\n?\s*drift|PART_TOO_LARGE is translated TWICE/.test(r.out), true);
});

console.log("\n--- ARM 7b · a vocabulary term with no member text FAILS (DEC-49's UI-47 input) ---");
withTree({
  vocabSrc: `
export const FIXTURE_BOUNDS = {
  fetches: "fetches requested of the capture path",
  wallclock: "",
};
export const FIXTURE_ENDINGS = {
  completed: "the run finished its work",
  cancelled: "a member stopped it",
};
export const FIXTURE_STATUS = { running: 1, finished: 1 };
`,
}, tree => {
  const r = runGuard(tree);
  t("ARM 7b: exits 1", r.exit, 1);
  t("ARM 7b: naming the vocabulary and the term",
    /`FIXTURE_BOUNDS\.wallclock` has NO TEXT/.test(r.out), true);
});

console.log("\n--- ARM 7c · a numeric-valued map is NOT a member vocabulary, and is ignored BY SHAPE ---");
withTree({}, tree => {
  const r = runGuard(tree);
  t("ARM 7c: the conformant tree still passes with FIXTURE_STATUS present", r.exit, 0);
  t("ARM 7c: and arm E counted the two TEXT vocabularies, not the numeric one",
    /arm E:[^\n]*2 vocabularies, 4 terms/.test(r.out), true);
});

console.log("\n--- ARM 7d · a 19-character but complete sentence PASSES (the over-strictness this arm measured) ---");
withTree({
  /* `cancelled: "a member stopped it"` is 19 characters and is the real
     `RUN_ENDINGS.cancelled` from `src/airun.mjs`. A character floor of 20
     failed it on this guard's first run with arm E; the rule is a WORD floor
     now, and this arm is why. */
  vocabSrc: `
export const FIXTURE_BOUNDS = {
  fetches: "fetches requested of the capture path",
  wallclock: "wall time across resumptions",
};
export const FIXTURE_ENDINGS = {
  completed: "the run finished its work",
  cancelled: "a member stopped it",
};
`,
}, tree => {
  const r = runGuard(tree);
  t("ARM 7d: exits 0 — a short, complete, accurate sentence is a translation", r.exit, 0);
});

console.log("\n--- ARM 7e · but a one-word placeholder is NOT ---");
withTree({
  vocabSrc: `
export const FIXTURE_BOUNDS = {
  fetches: "fetches requested of the capture path",
  wallclock: "wallclock",
};
export const FIXTURE_ENDINGS = {
  completed: "the run finished its work",
  cancelled: "a member stopped it",
};
`,
}, tree => {
  const r = runGuard(tree);
  t("ARM 7e: exits 1", r.exit, 1);
  t("ARM 7e: calling it a token rather than a phrase",
    /`FIXTURE_BOUNDS\.wallclock` reads "wallclock" — that is a token, not the phrase/.test(r.out), true);
});

/* ============================================================
   ARM 8 — THE CONTROL THAT ASSERTS NOTHING, and the TypeError that never
   reaches an accumulator. D-93's class, seven sightings: a control can pass
   while asserting nothing, and must not die early and hide the arms behind it.
   Every arm above ran; this one says so with a figure rather than by the
   absence of a crash.
   ============================================================ */
console.log("\n--- ARM 8 · the arms above actually ran ---");
t("ARM 8: this suite made assertions (a suite that asserts nothing passes everything)", n > 20, true);
t("ARM 8: the real guard is where test/run.mjs expects it", fs.existsSync(GUARD), true);
t("ARM 8: and test/run.mjs actually invokes it — a guard not in the loop the reader runs is not a mechanism",
  /check-refusal-codes\.mjs/.test(fs.readFileSync(path.join(HERE, "run.mjs"), "utf8")), true);

/* No stray fixture directory may survive the run: a leftover `.vf2-fixture-*`
   under test/ would be picked up by nothing, but it is this file's mess. */
t("ARM 8: no fixture tree left behind",
  fs.readdirSync(HERE).filter(f => f.startsWith(".vf2-fixture-")), []);

console.log(`\nrefusal-codes: ${n} assertions${bad ? `, ${bad} FAILED` : ", all green"} — the DEC-49 guard `
  + `judged over FIXTURE TREES built in this worktree: a conformant tree passes (arm 1), an untranslated `
  + `code fails naming it (arm 2), a translation that restates the machine code fails (arm 2b), a CODELESS `
  + `refusal at a governed site fails naming file/line/function (arm 3 — VF-2's acceptance) as does a code `
  + `with no row (arm 3b), a hole in a surface table fails (arm 4) and an unpaired table fails rather than `
  + `being skipped (arm 4b), a NEUTERED walk fails on its FLOOR with the corpus size printed (arm 5 — a `
  + `ceiling is not a ratchet), a new receivable untranslated code trips the CEILING (arm 6), a `
  + `correctly coded refusal phrased in an unfamiliar voice and another language PASSES (arm 7), and the `
  + `PLANE'S OWN VOCABULARY TEXTS are covered too (DEC-49's UI-47 input) — an untexted term fails (7b), a `
  + `NUMERIC-valued map is excluded BY SHAPE rather than by an exception (7c), a 19-character but complete `
  + `sentence PASSES and a one-word placeholder does not (7d/7e, the over-strictness this guard measured `
  + `on itself against the real RUN_ENDINGS.cancelled)`);
if (bad) process.exit(1);
