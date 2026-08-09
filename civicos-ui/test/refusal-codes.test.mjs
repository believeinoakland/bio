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
 *
 *   REC-71's FOUR, ADDED AND RUN 2026-08-08 in worktree agent-ab9e84c9e27f4eff7,
 *   against the REAL `store.mjs` and the REAL two rows — because this item exists
 *   precisely because a span behaved differently on the real file than anyone
 *   expected, and a fixture alone would not have found it:
 *
 *   (r1) THE TEETH INSIDE THE NARROWED REGION, and it is the whole point of the
 *        item: put a codeless `ok:false` inside `promote`'s marked
 *        `basis-version-freeze` arm. RUN: the guard exits 1 with
 *          FAIL: src/store.mjs:7568 (in promote > basis-version-freeze) returns a
 *          CODELESS REFUSAL …
 *        naming FILE, LINE, FUNCTION and REGION. **Narrowing the scope did not
 *        blind the guard, and that is PROVED rather than asserted.**
 *   (r2) THE FIX IS THE FIX — put the WHOLE-FUNCTION `where` back on both rows.
 *        RUN: the guard exits 1 with **EXACTLY 32** `refuses with code … which is
 *        NOT a row` failures — the same 32 that turned `main` red — plus the
 *        region floor and two now-orphaned markers. So the narrowing is SHOWN to
 *        be what removed them rather than assumed to be.
 *        **A DEFECT IN `refusal-codes.control.mjs`'s OWN `arm()` FOUND BY THIS
 *        ARM, and corrected rather than worked around:** two edits to the SAME
 *        file each started from the ORIGINAL text, so the second silently
 *        discarded the first. This arm reverts two `where` fields in one file; it
 *        armed only one and measured 34. `arm()` now applies edits cumulatively
 *        and throws if an anchor was consumed by an earlier edit. **A control
 *        that does not arm what it says it arms is that file's own subject, and
 *        it caught itself for the second time.**
 *   (r3) OVER-STRICTNESS ON THE REAL TREE — put a codeless `ok:false` in
 *        `promote` but OUTSIDE both marked arms. RUN: the guard exits 0.
 *        Narrowing a `where` narrows what is GOVERNED, on purpose: the rest of
 *        `promote` answers to REC-64's sweep on its own schedule. An arm that
 *        failed here would be REC-64 arriving early in the worst possible place.
 *   (r4) THE MARKER REMOVED from the real `store.mjs`. RUN: the guard exits 1
 *        with `found 0 DEC-49 REGION basis-version-freeze opening marker(s)`.
 *        A `where` whose region has vanished FAILS rather than judging an empty
 *        span — an empty span passes everything.
 *
 *   REC-71's TWO MORE, ADDED AT RE-INTEGRATION 2026-08-08 onto a tree carrying
 *   PL-12 and UI-51 — **because the same defect appeared in a second family
 *   within hours, before the convention that fixes it existed.** PL-12's
 *   `BIAS_CHECKS.BIAS_REFUSED` carried `where: 'src/store.mjs promote'` at
 *   whole-function granularity and conscripted **36** refusals in exactly the way
 *   PL-1's two rows had:
 *
 *   (r5) THE TEETH INSIDE THE **BIAS** REGION — a codeless `ok:false` planted in
 *        the newly marked `bias-set-refusal` arm. RUN: the guard exits 1 naming
 *        file, line, function and region. **Each newly narrowed region owes its
 *        own teeth arm**; a narrowing is only as good as the arm showing it did
 *        not blind the guard, and inheriting another region's is not that.
 *   (r6) THE FIX IS THE FIX, SECOND FAMILY — restore `BIAS_REFUSED`'s
 *        whole-function `where`. RUN: exactly **36** conscripted into
 *        `BIAS_CHECKS`. **36 and not 34**, because a whole-function `where` also
 *        conscripts the two refusals the OTHER family's regions correctly govern.
 *
 *   **(r2)'s PIN WAS CORRECTED HERE, NOT EXEMPTED, and the correction is the
 *   defect in miniature.** It pinned 32 — `main`'s figure on the PL-1-only tree —
 *   and measured 33 once PL-12 landed, because PL-12 added a refusal to `promote`
 *   and **a whole-function `where` conscripts refusals that arrive AFTER the row
 *   is written.** The set such a `where` claims is not fixed when it is written;
 *   it grows with the function. Both counts are now family-specific so (r2) and
 *   (r6) cannot borrow each other's failures.
 *
 *   AND ONE MORE FOUND WHILE RUNNING THEM (REC-71): **arm (e) had gone GREEN.**
 *   PL-1 grew the census 311 -> 330 while the FLOOR stayed at 311, so neutering
 *   the widest matcher dropped it to 325 — still above the floor, so the guard
 *   passed a reader that had gone partially blind. **19 codes of slack, and slack
 *   in a floor is the floor not being a ratchet.** Every corpus floor in the
 *   guard is now the MEASURED figure, with the reason recorded at the site.
 *
 *   (a),(b),(d),(e),(f),(g) are ALSO re-run mechanically by arms 2-7 below over
 *   fixture trees, every run of the battery; (r1)-(r4) by ARM 9's fifteen fixture
 *   arms, which additionally cover the ways a span can be wrong that are awkward
 *   to arm on the real tree — a DUPLICATED marker, a COLLAPSED span, a region
 *   that judges NOTHING, an ORPHAN region no `where` claims, and a region that
 *   has DRIFTED OUT of the function its `where` names.
 *
 *   REC-76's SIX, ADDED AND RUN 2026-08-08 in worktree agent-a7c06631e829a208f,
 *   against the REAL tree by `test/refusal-codes.control.mjs` — because D-236 was
 *   found by a real governed site coming back `0 judged, 0 checked`, and a
 *   fixture alone cannot show that the site the guard reported clean was one it
 *   could not see:
 *
 *   (n1) A REFUSAL IN A SHAPE THE MATCHER WAS NEVER TAUGHT — a codeless
 *        `{ started: false, … }` planted in the real `checkBound`. DECLARED MUST
 *        FAIL. RUN: the guard exits 1 naming checkBound AND the verdict field it
 *        read. **THE ARM THIS ITEM EXISTS FOR.**
 *   (n2) THE SAME PLANTED REFUSAL UNDER THE OLD ONE-VOCABULARY CLASSIFIER.
 *        DECLARED MUST PASS. RUN: exit 0 — the codeless refusal sits at a
 *        governed site and is not seen. **Neither (n1) nor (n2) is evidence
 *        alone**; a widening that fires is only interesting if what it replaced
 *        did not.
 *   (n3) OVER-STRICTNESS — a SUCCESS in an unanticipated spelling
 *        (`{ found: true, … }`, REC-70's own example) at a real governed site.
 *        DECLARED MUST PASS. This is the direction that would flood the guard
 *        with false sites and get it switched off.
 *   (n4) THE TEETH INSIDE THE NEW REGION — SET_MOVED's code taken off the real
 *        refusal inside `is-selection-moved`. DECLARED MUST FAIL. Each newly
 *        narrowed region owes its OWN teeth arm (REC-71's (r5) rule).
 *   (n5) THE NEW REGION'S MARKER REMOVED. DECLARED MUST FAIL — a `where` whose
 *        region has vanished must fail rather than judge an empty span.
 *   (n6) THE OUTCOME WALK NEUTERED. DECLARED MUST FAIL on the CORPUS floor with
 *        the corpus PRINTED at 0. A headline that passes over an EMPTY CORPUS is
 *        this repository's most recent instrument defect.
 *
 *   (n1),(n3) and (n6) are ALSO re-run mechanically by ARM 10 below over fixture
 *   trees, every run of the battery, together with the computed-verdict shape in
 *   both directions and the unclassified-outcome bucket.
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
    /* REC-71's three, STATED for the fixture rather than left undefined. An
       absent floor compares `n < undefined` -> false and never fails, so an
       omitted key is a floor that silently does not exist — the generous
       direction, which is the one this file is for. The default tree has no
       region, so `regions`/`regionLines` are 0 and the arms that need a floor
       set one explicitly. */
    regions: 0, regionLines: 0, codesChecked: 3,
    /* REC-76's three, STATED for the fixture for the same reason as REC-71's
       three above: an absent floor compares `n < undefined` -> false and never
       fails, so an omitted key is a floor that silently does not exist. The
       default tree's two governed functions hand back THREE outcomes, all three
       refusals, none of them unclassifiable. */
    outcomeReturns: 3, refusalsJudged: 3,
  }, over.floor || {}))};`);
  guard = guard.replace(/const CEILING = \{[\s\S]*?\n\};/, `const CEILING = ${JSON.stringify(Object.assign(
    { reachGap: 0, unclassifiedOutcomes: 0 }, over.ceiling || {}))};`);
  guard = guard.replace(/PART_REASON: "src\/subresources\.mjs"/, `PART_REASON: "src/parts.mjs"`);
  guard = guard.replace(/const VOCABULARY_MODULES = new Map\(Object\.entries\(\{[\s\S]*?\n\}\)\);/,
    `const VOCABULARY_MODULES = new Map(Object.entries({ "src/vocab.mjs": "the fixture's vocabularies" }));`);
  if (over.mutateGuard) guard = over.mutateGuard(guard);
  fs.writeFileSync(path.join(ui, "check-refusal-codes.mjs"), guard);

  /* ---- D-257: THE FIXTURE IS NOW A REPOSITORY, BECAUSE THE GUARD ASKS ONE ----
     The guard imports `bio-plane/scripts/provenance.mjs` and compares its census
     and reach floors against the figures `git ls-tree HEAD` says another checkout
     reproduces. Two things follow for this fixture, and neither is optional:

       1. THE MODULE MUST EXIST IN THE TREE. It is COPIED from the real one rather
          than re-written here — a hand copy agrees with the original at zero cost
          and then goes stale in one of its homes, which is the failure the module
          itself was created to avoid.
       2. THE TREE MUST BE A CHECKOUT. A `mkdtemp` directory inside this worktree
          is inside a repository whose HEAD does not describe it, so `git ls-tree
          HEAD` answers EMPTY — verified, and every fixture file UNTRACKED, which
          would floor the guard's census at zero and fail every arm. Initialising
          and committing the fixture makes it what the guard is entitled to
          assume, and it exercises the VERIFIED path rather than the degraded one,
          which is the better half to cover.

     The nested `.git` lives and dies with the fixture: the residue arm at the
     foot of this file already asserts no `.vf2-fixture-*` survives the run. */
  const provDir = path.join(root, "bio-plane", "scripts");
  fs.mkdirSync(provDir, { recursive: true });
  fs.copyFileSync(fileURLToPath(new URL("../../bio-plane/scripts/provenance.mjs", import.meta.url)),
                  path.join(provDir, "provenance.mjs"));
  const git = (...args) => execFileSync("git", args, { cwd: root, stdio: "pipe" });
  git("init", "-q");
  git("-c", "user.email=fixture@bio.test", "-c", "user.name=VF-2 fixture", "add", "-A");
  git("-c", "user.email=fixture@bio.test", "-c", "user.name=VF-2 fixture",
      "commit", "-q", "-m", "the fixture tree, so the guard's provenance check has a commit to ask about");
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
  /* CORRECTED 2026-08-09 (D-257), NEVER EXEMPTED. The old pin was
     `/the plane census is \d+ refusal codes, floor is/`, and it was right for the
     sentence the guard used to compose. The guard now floors on the REPRODUCIBLE
     census — the codes `git ls-tree HEAD` says another checkout gets — and says
     both figures, so the sentence reads "... N refusal codes that are in the
     commit at HEAD (M over the working tree), floor is X". The old spelling is
     wrong rather than merely narrower: it would pass over a guard that had gone
     back to flooring on the contaminated figure. This pin requires BOTH numbers,
     so the two-figure form is what is asserted. */
  t("ARM 5: on the CENSUS FLOOR, and it states the reproducible figure beside the contaminated one",
    /the plane census is \d+ refusal codes that are in the commit at HEAD \(\d+ over the working tree\), floor is/.test(r.out), true);
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
/* ============================================================
   ARM 9 — REGION `where`s (REC-71). THE NARROWING, AND ITS TEETH.

   A `where` may name a REGION inside a function instead of the whole function.
   The whole risk of that is a walk that takes the WRONG SPAN and reports a
   clean verdict over bytes that could not have carried what it sought — sighted
   twice in one week in this repository, including inside this very guard (a
   parameter list read as a body). So every arm below is a way the span can be
   wrong, and each one must FAIL rather than narrow to nothing.

   THE FIXTURE. `checkFixture` holds a governed REGION containing one coded
   refusal, and — outside it — a refusal with a code NO ROW HOLDS. On the
   function `where` that second refusal fails the guard; on the region `where`
   it must not. That is the whole of REC-71 in one fixture, in both polarities.
   ============================================================ */
const REGION_OPEN = "/* DEC-49 REGION fixture-arm\n     the governed span. */";
const REGION_SHUT = "/* END DEC-49 REGION fixture-arm */";
const REGION_SRC = `
export function checkFixture(input = {}) {
  /* OUTSIDE the region, and it refuses with a code no row holds — the ~32
     long-standing refusals inside \`promote\` in one line. */
  if (input.other) return { ok: false, code: "FIXTURE_UNGOVERNED", detail: "not this row's business" };
  ${REGION_OPEN}
  if (!input.address) return { ok: false, code: "FIXTURE_NO_ADDRESS", detail: "no address" };
  if (!/^[0-9a-f]{64}$/.test(String(input.at || ""))) {
    return { ok: false, code: "FIXTURE_BAD_ANCHOR", detail: String(input.at) };
  }
  ${REGION_SHUT}
  return null;
}
export function checkSecond(rows = {}) {
  if (!rows.arm) return { ok: false, code: "FIXTURE_TWO_NO_ARM", detail: "no arm" };
  return null;
}
`;
const REGION_ROWS = (where) => ({
  FIXTURE_NO_ADDRESS: { check: "C-90.1", where, translation: DEFAULT_TRANSLATION },
  FIXTURE_BAD_ANCHOR: { check: "C-90.2", where,
    translation: "That is not the shape a capture identity has, so nothing was looked up at all and the "
      + "request is reported as malformed rather than as a document the record does not hold." },
  FIXTURE_TWO_NO_ARM: { check: "C-91.1", where: "src/fixture.mjs checkSecond",
    translation: "That request did not say which kind of meaning to read, and the record holds two "
      + "kinds that answer different questions, so it asks rather than choosing one for you." },
});
const REGION_WHERE = "src/fixture.mjs checkFixture > fixture-arm";
const FN_WHERE = "src/fixture.mjs checkFixture";
const regionTree = (over = {}) => Object.assign({
  fixtureSrc: REGION_SRC, rows: REGION_ROWS(REGION_WHERE),
  floor: { families: 1, rows: 3, census: 7, reach: 7, governedSites: 2, surfaceTables: 1, bodyLines: 6,
           vocabularies: 2, vocabularyTerms: 4, regions: 1, regionLines: 3, codesChecked: 3 },
}, over);

/* THE POLARITY PAIR, and it is the item itself. Same tree, same refusals, ONE
   field different: the `where`. RED on the function, GREEN on the region. */
console.log("\n--- ARM 9 · the FUNCTION `where` conscripts an unrelated refusal — RED (this is REC-71's defect) ---");
withTree(regionTree({ rows: REGION_ROWS(FN_WHERE), floor: undefined }), tree => {
  const r = runGuard(tree);
  t("ARM 9: a whole-function `where` exits 1", r.exit, 1);
  t("ARM 9: naming the UNRELATED refusal it conscripted — not the row's business, and the row never said it was",
    /refuses with code FIXTURE_UNGOVERNED, which is NOT a row/.test(r.out), true);
  t("ARM 9: and the failure TELLS the next allocator the fix is a region `where`, not a translation",
    /names a WHOLE FUNCTION[\s\S]*REGION `where`/.test(r.out), true);
});

console.log("\n--- ARM 9b · the REGION `where` judges the arm and nothing else — GREEN (the fix) ---");
withTree(regionTree(), tree => {
  const r = runGuard(tree);
  t("ARM 9b: the region `where` exits 0 over the SAME source", r.exit, 0);
  t("ARM 9b: and the span it judged is PRINTED, so a narrowing that went too far is visible",
    /checkFixture > fixture-arm \d+L \(\d+ judged, \d+ code\(s\) checked\)/.test(r.out), true);
  t("ARM 9b: it reports the region as narrowed rather than as a whole function",
    /1 narrowed REGION\(s\)/.test(r.out), true);
});

/* ---- THE TEETH, and the whole point of the item: narrowing must not blind it. */
console.log("\n--- ARM 9c · a CODELESS refusal INSIDE the narrowed region still FAILS (the teeth survive) ---");
withTree(regionTree({
  fixtureSrc: REGION_SRC.replace(`  if (!input.address)`,
    `  if (input.broken) return { ok: false, detail: "a refusal nobody gave a code" };\n  if (!input.address)`),
}), tree => {
  const r = runGuard(tree);
  t("ARM 9c: exits 1", r.exit, 1);
  t("ARM 9c: naming file, line, function AND region",
    /src\/fixture\.mjs:\d+ \(in checkFixture > fixture-arm\) returns a CODELESS REFUSAL/.test(r.out), true);
});

console.log("\n--- ARM 9d · a codeless refusal OUTSIDE the region PASSES — the over-strictness arm ---");
/* THIS ARM ASSERTS A **PASS**, which is the shape that can succeed while
   asserting nothing: if the edit below silently failed to apply, the tree would
   be arm 9b's and exit 0 for a reason that has nothing to do with this claim.
   So the planted text is CHECKED ON DISK, and checked to be OUTSIDE the markers,
   before the verdict is believed. A control that cannot find what it planted
   proves nothing and must not pass silently. */
const OUTSIDE_PLANT = `  if (input.elsewhere) return { ok: false, detail: "outside every governed span" };`;
const outsideSrc = REGION_SRC.replace(`  ${REGION_OPEN}`, `${OUTSIDE_PLANT}\n  ${REGION_OPEN}`);
withTree(regionTree({ fixtureSrc: outsideSrc }), tree => {
  const onDisk = fs.readFileSync(path.join(tree.root, "bio-plane", "src", "fixture.mjs"), "utf8");
  t("ARM 9d: the codeless refusal this arm plants is ACTUALLY IN THE FIXTURE (else the pass below is vacuous)",
    onDisk.includes(OUTSIDE_PLANT.trim()), true);
  t("ARM 9d: and it sits OUTSIDE the marked region, which is the only reason it may pass",
    onDisk.indexOf(OUTSIDE_PLANT.trim()) < onDisk.indexOf("DEC-49 REGION fixture-arm"), true);
  const r = runGuard(tree);
  /* THE BOUNDARY, STATED RATHER THAN IMPLIED. Narrowing a `where` narrows what
     is GOVERNED, and that is the point: the rest of the function answers to
     REC-64's sweep on its own schedule, not to this row today. An arm that
     failed here would be the guard doing REC-64's work in the worst place. */
  t("ARM 9d: exits 0 — a span nobody claimed is not this row's site", r.exit, 0);
});

/* AND THE SAME PLANT, MOVED INSIDE, MUST FAIL. Two arms differing only in WHERE
   the identical line sits is the strongest form this pair takes: it removes the
   possibility that 9d passed because of anything about the line itself. */
console.log("\n--- ARM 9d2 · the IDENTICAL line moved INSIDE the region FAILS (the pair that isolates position) ---");
withTree(regionTree({
  fixtureSrc: REGION_SRC.replace(`  if (!input.address)`, `${OUTSIDE_PLANT}\n  if (!input.address)`),
}), tree => {
  const r = runGuard(tree);
  t("ARM 9d2: exits 1 — the same bytes, inside the span, are the guard's business", r.exit, 1);
  t("ARM 9d2: naming it as codeless at the region",
    /\(in checkFixture > fixture-arm\) returns a CODELESS REFUSAL/.test(r.out), true);
});

/* ---- EVERY WAY THE SPAN CAN BE WRONG. Each must FAIL, not narrow to nothing. */
console.log("\n--- ARM 9e · a `where` naming a region the source does not declare FAILS ---");
withTree(regionTree({ fixtureSrc: REGION_SRC.replace(REGION_OPEN, "").replace(REGION_SHUT, "") }), tree => {
  const r = runGuard(tree);
  t("ARM 9e: exits 1", r.exit, 1);
  t("ARM 9e: naming the undeclared region rather than judging an empty span",
    /found 0 `DEC-49 REGION fixture-arm` opening marker\(s\)/.test(r.out), true);
});

console.log("\n--- ARM 9f · an UNCLOSED region FAILS ---");
withTree(regionTree({ fixtureSrc: REGION_SRC.replace(REGION_SHUT, "") }), tree => {
  const r = runGuard(tree);
  t("ARM 9f: exits 1", r.exit, 1);
  t("ARM 9f: naming the missing END marker", /found 0 `END DEC-49 REGION fixture-arm` marker\(s\)/.test(r.out), true);
});

console.log("\n--- ARM 9g · a DUPLICATED region marker FAILS rather than the guard picking one ---");
withTree(regionTree({ fixtureSrc: REGION_SRC.replace(`  ${REGION_OPEN}`, `  ${REGION_OPEN}\n  ${REGION_OPEN}`) }), tree => {
  const r = runGuard(tree);
  t("ARM 9g: exits 1", r.exit, 1);
  t("ARM 9g: naming the ambiguity", /found 2 `DEC-49 REGION fixture-arm` opening marker\(s\)/.test(r.out), true);
});

console.log("\n--- ARM 9h · a COLLAPSED span FAILS on the trivial-span floor (the wrong-span defence) ---");
withTree(regionTree({
  fixtureSrc: REGION_SRC.replace(`  ${REGION_OPEN}\n`, `  ${REGION_OPEN}\n  ${REGION_SHUT}\n`).replace(
    /\n  \/\* END DEC-49 REGION fixture-arm \*\/\n  return null;/, "\n  return null;"),
}), tree => {
  const r = runGuard(tree);
  t("ARM 9h: exits 1", r.exit, 1);
  t("ARM 9h: naming the collapsed span rather than reporting a clean verdict over nothing",
    /below the \d+-line \/ \d+-character floor/.test(r.out), true);
});

console.log("\n--- ARM 9i · a region that judges NO refusal FAILS — a marker drifted off its arm ---");
withTree(regionTree({
  /* The markers are well-formed, non-trivial and correctly nested; they have
     simply drifted onto code that refuses nothing. EVERY other arm passes over
     this, which is exactly why it needs one of its own. */
  fixtureSrc: `
export function checkFixture(input = {}) {
  if (!input.address) return { ok: false, code: "FIXTURE_NO_ADDRESS", detail: "no address" };
  if (!/^[0-9a-f]{64}$/.test(String(input.at || ""))) {
    return { ok: false, code: "FIXTURE_BAD_ANCHOR", detail: String(input.at) };
  }
  ${REGION_OPEN}
  const a = String(input.at || "");
  const b = a.trim().toLowerCase();
  const c = b.length;
  const d = c > 0 ? b : null;
  ${REGION_SHUT}
  return d === null ? null : null;
}
export function checkSecond(rows = {}) {
  if (!rows.arm) return { ok: false, code: "FIXTURE_TWO_NO_ARM", detail: "no arm" };
  return null;
}
`,
}), tree => {
  const r = runGuard(tree);
  t("ARM 9i: exits 1", r.exit, 1);
  t("ARM 9i: naming the region that judged nothing",
    /judged NO refusal inside the region `fixture-arm`/.test(r.out), true);
});

console.log("\n--- ARM 9j · an ORPHAN marker — a region declared that no `where` claims — FAILS ---");
withTree(regionTree({
  fixtureSrc: REGION_SRC + `
export function checkThird(x) {
  /* DEC-49 REGION nobody-claims-this
     a span that reads as governed and is not. */
  if (!x) return { ok: false, code: "FIXTURE_NO_ADDRESS" };
  /* END DEC-49 REGION nobody-claims-this */
  return null;
}
`,
}), tree => {
  const r = runGuard(tree);
  t("ARM 9j: exits 1", r.exit, 1);
  t("ARM 9j: naming the unclaimed region — a documented defence nobody wired is worse than a missing one",
    /marker\(s\) in the plane that NO row's `where` claims: src\/fixture\.mjs::nobody-claims-this/.test(r.out), true);
});

console.log("\n--- ARM 9k · a region that has DRIFTED OUT of the function its `where` names FAILS ---");
withTree(regionTree({
  /* Markers live in `checkSecond`; the `where` says they are in `checkFixture`.
     The pair is well-formed and non-trivial, so only the CONTAINMENT check sees
     it — and without that check this family's rows would be judging another
     function's refusals. */
  fixtureSrc: `
export function checkFixture(input = {}) {
  if (!input.address) return { ok: false, code: "FIXTURE_NO_ADDRESS", detail: "no address" };
  if (!/^[0-9a-f]{64}$/.test(String(input.at || ""))) {
    return { ok: false, code: "FIXTURE_BAD_ANCHOR", detail: String(input.at) };
  }
  return null;
}
export function checkSecond(rows = {}) {
  ${REGION_OPEN}
  if (!rows.arm) return { ok: false, code: "FIXTURE_TWO_NO_ARM", detail: "no arm" };
  if (rows.other) return { ok: false, code: "FIXTURE_TWO_NO_ARM", detail: "again" };
  ${REGION_SHUT}
  return null;
}
`,
}), tree => {
  const r = runGuard(tree);
  t("ARM 9k: exits 1", r.exit, 1);
  t("ARM 9k: naming the containment failure rather than judging another function's refusals",
    /the marked region is NOT inside checkFixture's body/.test(r.out), true);
});

console.log("\n--- ARM 9l · the REGION FLOORS catch a narrowing that lost sight ---");
withTree(regionTree({ rows: REGION_ROWS(FN_WHERE), floor: {
  families: 1, rows: 3, census: 7, reach: 7, governedSites: 2, surfaceTables: 1, bodyLines: 6,
  vocabularies: 2, vocabularyTerms: 4, regions: 1, regionLines: 3, codesChecked: 3,
} }, ), tree => {
  const r = runGuard(tree);
  /* The rows went back to a FUNCTION `where`, so no region resolves — the exact
     shape of a narrowing silently reverted. A ceiling could never see this. */
  t("ARM 9l: exits 1", r.exit, 1);
  t("ARM 9l: on the REGION floor, naming that a region stopped resolving",
    /resolved 0 region `where`\(s\), floor is 1/.test(r.out), true);
});

console.log("\n--- ARM 9m · the CODES-CHECKED floor catches a site that reads lines and asserts nothing ---");
withTree(regionTree({ floor: {
  families: 1, rows: 3, census: 7, reach: 7, governedSites: 2, surfaceTables: 1, bodyLines: 6,
  vocabularies: 2, vocabularyTerms: 4, regions: 1, regionLines: 3, codesChecked: 99,
} }), tree => {
  const r = runGuard(tree);
  t("ARM 9m: exits 1", r.exit, 1);
  t("ARM 9m: saying plainly that lines read is not the measure",
    /compared only \d+ refusal code\(s\) against a family row, floor is 99/.test(r.out), true);
});

/* ============================================================
   ARM 10 — REC-76 / D-236: THE CLASSIFIER ASKS WHAT A REFUSAL IS IN
   PRINCIPLE, AND SAYS WHAT IT COULD NOT CLASSIFY.

   Arm C graded a refusal by ONE literal, `ok: false`. Measured over
   `bio-plane/src`: 704 `ok: false`, 5 `started: false`, 3 computed `ok: !x` —
   eight refusal objects invisible to the arm whose whole job is to fail on a
   codeless one. These six arms drive the inversion in BOTH directions, because
   a widening that over-fires floods the guard with false sites and gets it
   switched off, which is the failure that would cost more than the blindness.
   ============================================================ */

/* The default fixture with one extra return spliced into `checkFixture`. */
const withExtra = (extra) => `
export function checkFixture(input = {}) {
  if (!input.address) return { ok: false, code: "FIXTURE_NO_ADDRESS", detail: "no address" };
  if (!/^[0-9a-f]{64}$/.test(String(input.at || ""))) {
    return { ok: false, code: "FIXTURE_BAD_ANCHOR", detail: String(input.at) };
  }
${extra}
  return null;
}
export function checkSecond(rows = {}) {
  if (!rows.arm) return { ok: false, code: "FIXTURE_TWO_NO_ARM", detail: "no arm" };
  return null;
}
`;

console.log("\n--- ARM 10a · a refusal in a spelling the matcher was NEVER TAUGHT is COUNTED, not skipped ---");
withTree({ fixtureSrc: withExtra(`  if (input.late) return { started: false, note: "a run needs somewhere to be" };`) }, tree => {
  const r = runGuard(tree);
  /* `started: false` is a field name this walk has never been told about. It is
     graded because it is a BOOLEAN VERDICT that is not `true`, which is a
     property of the shape rather than of the vocabulary. */
  t("ARM 10a: exits 1 — the unfamiliar refusal was JUDGED and found codeless", r.exit, 1);
  t("ARM 10a: naming the verdict field it read, so the reader can see WHY it was graded a refusal",
    /returns a CODELESS REFUSAL — an outcome whose verdict `started` is `false`/.test(r.out), true);
});

console.log("\n--- ARM 10b · a COMPUTED verdict (`ok: !x`) is a refusal on at least one path — SET_MOVED's own shape ---");
withTree({ fixtureSrc: withExtra(`  if (input.late) return { ok: !input.fine, handle: "h", n: 0 };`) }, tree => {
  const r = runGuard(tree);
  /* THIS IS THE SHAPE THAT COST A TRANSLATION. `selectionResolve` refuses
     through `ok: !stopped`, so a region `where` around it judged ZERO and would
     have failed as a drifted marker — which is why `SET_MOVED` went untranslated
     for as long as it did. */
  t("ARM 10b: exits 1 — a computed verdict is not a declared success", r.exit, 1);
  t("ARM 10b: saying it refuses on at least one path rather than pretending it always refuses",
    /verdict `ok` is computed, so it refuses on at least one path/.test(r.out), true);
});

console.log("\n--- ARM 10c · the SAME computed verdict, CODED, is accepted (the inversion must not over-fire) ---");
withTree({ fixtureSrc: withExtra(
  `  if (input.late) return { ok: !input.fine, handle: "h", ...(input.fine ? {} : { reason: "FIXTURE_NO_ADDRESS" }) };`) }, tree => {
  const r = runGuard(tree);
  t("ARM 10c: exits 0 — a computed verdict carrying a coded refusal is exactly what DEC-49 asks for", r.exit, 0);
});

console.log("\n--- ARM 10d · a SUCCESS in an unanticipated spelling is NOT graded a refusal (over-strictness) ---");
withTree({ fixtureSrc: withExtra(`  if (input.late) return { found: true, rows: [], more: false };`) }, tree => {
  const r = runGuard(tree);
  /* `found: true` is REC-70's own example — the success spelling that hid 27
     ops one instrument over. A guard that graded it a refusal would demand a
     code for an answer, flood itself with false sites and be switched off. */
  t("ARM 10d: exits 0 — a return that declares itself a success is not a refusal", r.exit, 0);
  t("ARM 10d: and the walk SAYS it saw a declared success rather than silently dropping it",
    /graded \d+ REFUSAL\(s\) \/ [1-9]\d* declared SUCCESS\(es\)/.test(r.out), true);
});

console.log("\n--- ARM 10e · an outcome the walk CANNOT classify is NAMED, never silently scored zero ---");
withTree({ fixtureSrc: withExtra(`  if (input.late) return { note: "no verdict of any kind lives in here", detail: "x" };`) }, tree => {
  const r = runGuard(tree);
  /* THE HALF THAT LASTS (M0-14's precedent for the control register, CPDF-9's
     for the dark fleet member): a shape scored zero is indistinguishable from a
     site with nothing to judge, which is the whole of D-236. */
  t("ARM 10e: exits 1 — a new unclassifiable outcome is a new place a codeless refusal can hide", r.exit, 1);
  t("ARM 10e: NAMING it with file, line and the text itself",
    /carry NO verdict this walk can read[\s\S]*src\/fixture\.mjs:\d+ \(checkFixture\)/.test(r.out), true);
});

console.log("\n--- ARM 10f · a declared SUCCESS carrying a refusal CODE is a contradiction and FAILS ---");
withTree({ fixtureSrc: withExtra(`  if (input.late) return { ok: true, code: "FIXTURE_BAD_ANCHOR", detail: "x" };`) }, tree => {
  const r = runGuard(tree);
  /* The cross-check for the one thing the verdict rule cannot see on its own: a
     NEGATIVE-POLARITY verdict (`failed: true`) would read as a success. Gated at
     zero rather than ratcheted, because there is no honest instance of it. */
  t("ARM 10f: exits 1", r.exit, 1);
  t("ARM 10f: saying the two claims are in one object and the refusal would go unjudged",
    /DECLARES SUCCESS \(`true`\) while carrying refusal code\(s\) FIXTURE_BAD_ANCHOR/.test(r.out), true);
});

console.log("\n--- ARM 10g · the OUTCOME CORPUS floor fires when the return reader goes blind ---");
withTree({ mutateGuard: g => g.replace("function outcomeReturns(text) {", "function outcomeReturns(text) { return [];") }, tree => {
  const r = runGuard(tree);
  /* A CEILING IS NOT A RATCHET, and this is that lesson on the corpus rather
     than on the census: a walk that reads nothing asserts nothing, and without
     this floor it would report green over an empty corpus — the exact defect
     (an empty manifest, `cmp` comparing two empty files, the sha256 of the
     empty string) this repository measured hours before this arm was written. */
  t("ARM 10g: exits 1", r.exit, 1);
  t("ARM 10g: on the CORPUS floor, saying every verdict below it is a verdict over nothing",
    /THE CORPUS COLLAPSED/.test(r.out), true);
});

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
  + `on itself against the real RUN_ENDINGS.cancelled). AND REC-76's ARM 10 drives the INVERTED refusal `
  + `classifier in BOTH directions: a refusal in a spelling the matcher was never taught is COUNTED (10a), `
  + `a COMPUTED verdict is judged and its coded form accepted (10b/10c — SET_MOVED's own shape, the one `
  + `whose invisibility cost a translation), a SUCCESS in an unanticipated spelling is NOT graded a refusal `
  + `(10d), an outcome the walk cannot classify is NAMED rather than scored zero (10e), a declared success `
  + `carrying a refusal code FAILS as a contradiction (10f), and a neutered return reader fires the CORPUS `
  + `floor rather than reporting green over nothing (10g)`);
if (bad) process.exit(1);
