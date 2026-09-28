# legacy-checks (T9)

**Status** · session_01362JGtE3gn5X3QqZps3xue · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

Two readings, each with my best reading. I carry on with both as stated; neither blocks the rest of the job.

1. **N214: `MINT_EXHAUSTED` is minted at four sites in three modules, for one condition.** Each site draws an opaque id from record-core's `mintOpaqueId`, gets `null` (no free id), and refuses with `MINT_EXHAUSTED`:
   - promotion `promote`, the new project's id (`src/promotion/index.mjs` 500);
   - review `#draft` and `#grant` (`src/review/index.mjs` 426, 462);
   - case-authoring `#publishCase`, a new case's id (`src/case-authoring/index.mjs` 573).

   One `where` claims one site, so a row now would fail the guard's arms C and G, as `STEP_DECLARED` did in T8.
   Under K275 the condition is the same, so the earliest module provides the one helper and holds the row. That is record-core, which owns `mintOpaqueId` (R6), or promotion if record-core should not refuse.
   **Best reading:** no `MINT_EXHAUSTED` row in this job. It waits, like the listener rows, until its four sites call one helper (for example record-core's `mintExhausted(kind)`). The row then names that helper, in legacy-checks' next job. I add `CASE_MEMBER_REFUSED` now: one site, `src/ratification/index.mjs check`, a whole-function `where` (the function mints only that code).
2. **N212 and N214: the two emptied families still have readers, so removing them breaks two other modules' suites.**
   - `CASE_DERIVATION_CHECKS`: `test/m/case-authoring/invariants.test.mjs` imports it by name from the catalogue (line 9, R29's arm at line 88). A missing named export fails the whole suite at load. store.mjs no longer reads it.
   - `ATTRIBUTION_CHECKS`: `test/m/ratification/checks.test.mjs` R14 (line 249) indexes `CAT.ATTRIBUTION_CHECKS[code]`. Once the export is gone that throws a TypeError.

   Both arms assert "this code left the catalogue", which holds vacuously once the family is gone. Each needs a one-line change in its own module (layer 8, T10).
   **Best reading:** keep both as empty exports in this job, and rewrite their headers to say they are empty and why they remain. Route the two one-line test changes to case-authoring's and ratification's next jobs. The two removals then follow in legacy-checks' next job.
   The alternative is to remove both now, leaving those two suites red until T10. That is yours to choose.

Also applied, no answer needed: C-32.6's and C-33.14's `where`s name `#publishCase`, not `publishCase`, because both regions sit in the private method. The public `publishCase` only opens the transaction.

## J2 · QUESTION

**N206: the two new rows' `where`s, measured with the guard (`civicos-ui/check-refusal-codes.mjs`).** This adds to J1 and replaces nothing in it.

I added the two rows as the entry words them: `STEP_DECLARED` C-102.8 at `src/promotion/index.mjs stepDeclared`, and `CASE_CATALOGUE_FAILED` C-102.9 at `src/gate.mjs runCaseGate` (whole function, promotion's J2.1 proposal). The guard then makes two new findings:
- **arm C: "could not find function stepDeclared".** `stepDeclared` is an arrow constant, `const stepDeclared = (held, detail) => …`, and the guard's `functionBody` resolves only a declaration or a method header.
- **arm C: "src/gate.mjs:377 (in runCaseGate) returns a CODELESS REFUSAL".** Once `runCaseGate` is a governed site, its ordinary answer `{gateVersion, ok, findings, warnings}` counts as a refusal with no code, because its `ok` is computed.

Both rows are right in substance: each code is minted at exactly one place. What has to change is the shape at promotion's site, in promotion's files (`src/promotion/`, `src/gate.mjs`), which promotion's layer-2 job owns in T9.

**Best reading** (K238 (4)'s pattern: "the `mint.X` helpers become named functions"):
1. Promotion declares `function stepDeclared(held, detail) { … }`, same body. The row stays `src/promotion/index.mjs stepDeclared`.
2. Promotion moves the failed-catalogue finding into a named function in `src/gate.mjs`, `caseCatalogueFailed(e)`, which returns the one finding and which `runCaseGate`'s catch calls. The row's `where` becomes `src/gate.mjs caseCatalogueFailed`. The gate's answer shape (R33) does not change.

I am writing the rows that way now (C-102.9's `where` = `src/gate.mjs caseCatalogueFailed`). Until promotion's job lands the two changes, the guard reports "could not find function" for both. That is the same state as T8's C-102.6/.7 before promotion marked its regions.
If you would rather C-102.9 name a region promotion marks inside `runCaseGate`, say so and I will re-point it.

## J3 · COMPLETE

**Every entry is applied. `MINT_EXHAUSTED`'s row is deferred (K278, N250), and so are the removals of the two emptied families (K278, N251).** The only file changed is `bio-plane/checks/bio-checks.mjs` (commit 58bef58b91; `tranche/T9` merged at b28f840a00). `CATALOG_VERSION` is untouched.

## Entries applied

- **N206** (K231, K233, K279):
  - `STEP_DECLARED` is **C-102.8** at `src/promotion/index.mjs stepDeclared`.
  - `CASE_CATALOGUE_FAILED` is **C-102.9** at `src/gate.mjs caseCatalogueFailed`, with promotion's J2.1 sentence.
  - Promotion declares both functions (N254). C-102's header now states the three T9 rows, and that the listener rows wait on N202.
- **N212** (K243, K278):
  - C-32.6 `MACHINE_CANNOT_PUBLISH` → `src/case-authoring/index.mjs #publishCase > is-machine-publish`.
  - C-33.14 `NO_STATEMENT` → `… #publishCase > is-publish-statement`. Both regions sit in the private method.
  - `CASE_DERIVATION_CHECKS` stays an empty export. Its header now says it is empty, where its rows went, and that it remains only for case-authoring's R29 suite (N251). The stale "store.mjs imports this" sentence is gone.
- **N214** (K278):
  - `CASE_MEMBER_REFUSED` is **C-102.10** at `src/ratification/index.mjs check`, a whole function that mints only that code.
  - The header above `INSTALLATION_CHECKS` no longer claims C-68.5 as its own; it says the row is publication's `PUBLISHED_STORE_CHECKS`.
  - Above `ATTRIBUTION_CHECKS`: C-92's header says the family is empty, that C-92.1–.9 are publication's `ATTRIBUTION_ACT_CHECKS` and C-92.10–.12 ratification's `RATIFY_ATTRIBUTION_CHECKS`, and that the export remains only for ratification's R14 suite (N251).
  - MK-1's header (also above it) now says C-53.10–.12 are ratification's `RATIFY_TESTIMONY_CHECKS` and C-92 is publication's and ratification's.
- **N226:** C-48.8 → `src/monitoring/index.mjs monitor > is-drive-tick-export`; C-48.9 → `… monitor > is-drive-tick-bytes`.

**Rows for the census (B1):**
- added: C-102.8 `STEP_DECLARED`, C-102.9 `CASE_CATALOGUE_FAILED`, C-102.10 `CASE_MEMBER_REFUSED`;
- `where` moved: C-32.6, C-33.14, C-48.8, C-48.9;
- none retired.

## Deferred

- **`MINT_EXHAUSTED`'s row** (K278, N250): it is minted at four sites for one condition. It follows once record-core's helper beside `mintOpaqueId` is what promotion, review and case-authoring call.
- **Removing `CASE_DERIVATION_CHECKS` and `ATTRIBUTION_CHECKS`** (K278, N251): case-authoring's `invariants.test.mjs` (R29, a named import) and ratification's `checks.test.mjs` (R14, line 249) still read them.
- `LISTENER_DECLARED`, `LISTENER_MALFORMED`: T10, N202 (B1).

## Found in other modules (REPORT)

K278/K279 already route N250, N251 and N254 (promotion declares `stepDeclared` and `caseCatalogueFailed` as functions), so they are not repeated.

1. **case-authoring** (T10): C-32.6's region `is-machine-publish` in `#publishCase` returns `{ ...refusal(MACHINE_FENCE_CHECKS, "MACHINE_CANNOT_PUBLISH"), detail }`. The guard's arm C judges no refusal inside it, and adds one inherited verdict from a spread (the ceiling is 4; now 8). The region was unclaimed before this job, so the guard never read it; the `where` is right. A literal `ok: false, reason` at the site, or a named helper, fixes both.
2. **publication** (T10): `src/publication/checks.mjs` lines 5, 8 and 167 still say C-44.1/.3–.5 and C-92.10–.12 "stay in the catalogue". They are case-authoring's and ratification's. These are stale comments.
3. **legacy-tests: the guard** (`civicos-ui/check-refusal-codes.mjs`, against `tranche/T9` @ 750906ecde): **126 failures before, 135 after.**
   - **Cleared:** the four stale-region failures (C-32.6, C-33.14, C-48.8, C-48.9), and four of the seven orphan markers (7 → 3). `refusal-wire` is item 5.
   - **Expected until promotion lands N254:** "could not find function" for `stepDeclared` and `caseCatalogueFailed` (K279).
   - **New:** case-authoring's region (item 1), one failure plus the spread count 7 → 8.
   - **Ratchets to re-pin from its print:** rows 776→779, census 1060→1061, reach 799→802, governedSites 464→467, regions 389→393, regionLines 4996→5060, codesChecked 844→848, outcomeReturns 254→259, refusalsJudged 823→827, and arm F's untranslated floor 294→292 (`STEP_DECLARED` and `CASE_MEMBER_REFUSED` now translated).
4. **legacy-tests: the old battery.** All 226 suites that read the catalogue ran on the base and on this branch, eight at a time, and every changed suite was re-run on its own:
   - **Improved:** `refusal-wire` 41/1 → 42/0 (C-32.6's `where`; N248's refusal-wire 41/1 is now cleared).
   - `capturerequests` read 136/4 once under parallel load, and 140/0 in three runs on its own, as on the base. It is not this change: no capture-requests row moved.
   - `d470-catalog-census` is 11/2 on both until promotion's N240 stamp.
   - **Every other suite is unchanged.**
5. **Generated artifacts (manifest §14):** `fleetbundles` 96/0 → 88/8. The bio-plane, agent-worker and newgroup bundles embed the catalogue and are stale; they are regenerated at the layer close.

## Tests and checks

- My module has no requirements and no `tests` path, and `build/manifest.md` names no layer tests.
- **Every module suite** (`node --test bio-plane/test/m/*/*.test.mjs`): base 2277 pass, 2 fail; branch 2277 pass, 2 fail. The two reds are the same on both: citation R5 (retiring types) and connections R24/R18/K155.
- **The DEC-49 guard:** REPORT 3.
- **The old battery:** REPORT 4.
- **Checks** (civicos-process `main` @ 5c397bd):
  - `format: 69 modules, 64 requirements files; 0 failures`
  - `architecture: 1 product files, 0 relative imports (0 naming no tracked file, not judged); 0 failures`
  - `coverage: 0 modules, 0 of 0 live requirement ids named by a test; 0 failures`
  - `ownership: 2 files changed by legacy-checks between tranche/T9 and HEAD; 0 failures`
- **Reading:** the catalogue is 12,315 lines (807 KB). I read in full every family and header this job touched, and the code at every site each changed `where` names. I did not read the whole file: reading it would have taken about half this session's context window.

Size (session_01362JGtE3gn5X3QqZps3xue): test runs 470, module lines 12315
