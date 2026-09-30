# promotion (T16)

**Status** · session_01SV3MUwaJQVfxezqBTByPmU · depth 2 · WORKING · handled B4

## Completion

**Entries applied** (B1; B2 = K534; B3, B4):
1. **N361's share (K529).** `gate.mjs` and `promotion/index.mjs` no longer import the catalogue's `checkCaseDocument`. `runCaseGate(args, catalogue)` has no default catalogue. With none (or a non-function), it runs no fallback and answers C-102.9 `CASE_CATALOGUE_FAILED` as R29's verdict. The instance's `runCaseGate` passes the registered catalogue, else nothing. Comments re-worded.
2. **N242's share (K534).** C-102.9's answer keeps R29's four-key verdict, its one finding naming `CASE_CATALOGUE_FAILED`; no `reason`/`code` was added (J1's reading withdrawn). With (1), the region answers C-102.9 whenever nothing judges the document. The guard's codeless arm is legacy-tests' (below).
3. **The stamp.** `CATALOG_VERSION` 1.45.0 → 1.46.0, with its note above the constant. `ROW_CENSUS` is `{1.46.0, 877, 1002f8718b347437100c7a9a10f32edf76b9b27cda351c97b2a53fcdc0040caa}`, read with legacy-tests' `test/row-census.mjs` on `tranche/T16` after MEMBERSHIP #9's merge (d5efecdc39). No file blind; 8 unimportable, none holding a row literal.
   - Method: diff against `test/fixtures/row-census-1.45.0.jsonl`: 52 arrived, 3 changed, 0 departed.
   - Each is named by a record: every T15 record read whole; T16's layer 1 moved none (`jobs/T16/legacy-checks.md`); membership's C-96.15, C-96.16 (B3, B4).

**Check rows stamped, and the composition** (N318):
- Arrived:
  - C-91.7 (entities);
  - C-2.11–C-2.17 (inquiry);
  - C-60.2, C-60.3, C-93.8–C-93.39 (contradiction);
  - C-120.1–C-120.3 (case-authoring);
  - C-113.24–C-113.28 (conformance; C-113.28 by K503, not in B1's list but named by CONFORMANCE's J2);
  - C-96.15, C-96.16 (membership).
- Changed `where`: C-93.1–C-93.3.
- Composition:
  - contradiction's registered promote step (R38);
  - inquiry's step running R47's arm and C-2.17;
  - the case gate's no-fallback change (mine).
- Promotion added, moved or retired no row of its own.

**`not yet met` marks my work meets** (K460): R33's `*(its no-fallback arm not yet met: N361)*`, tested by `gate.test.mjs` "R33 (K529)" and `registry.test.mjs` R47.

**Deferred:** nothing.

**Found in other modules** (legacy-tests' re-pins, and artifacts):
- **`test/row-census.test.mjs`: 7 pass, 1 fail.**
  - The failure is the negative control, which needs `test/fixtures/row-census-1.46.0.jsonl`: 877 lines, reproducible with `row-census.mjs` on this branch.
  - T15's `awaiting stamp` declarations (53 rows and the composition) are now stamped and retire.
  - Its main arm ("the tree holds the pin") passes.
- **`test/d470-catalog-census.test.mjs`: 12 pass, 2 fail** (A3, A5).
  - It needs a 1.46.0 row: count 356, digest `968acdfb95e0ea07805a2727b1095090bf760ac6adac654a0c9f5ed80ab57510`, source `b7d4112b8a54b44118429e5ffaa63683c8959423c38cd6cc563529b594060181`, plus A5's literal `plane-gate/1.0 (bio-checks 1.46.0)`.
  - `bio-checks.mjs` did not change, so to stand apart from 1.45.0 (A4) the row names what changed: the module-table rows and the gates' composition above.
- **DEC-49 guard** (`civicos-ui/check-refusal-codes.mjs`):
  - its codeless arm at `src/gate.mjs` `caseCatalogueFailed` should read a gate verdict by its findings' `check` (K534);
  - its floors move with the T16 rows.
- **Suites calling the free `runCaseGate` with no catalogue** now get C-102.9: `test/d84-case-manifest`, `rec212-statement-writer`, `rec219-case-document-v4`. All pass today.
- **ratification:** `test/m/ratification/checks.test.mjs`:133 (K500) is still the one red, and its title names "promotion's fallback", which is now gone. It is ratification's to retire (layer 8).
- **Generated artifacts stale** (§14, not rebuilt): `agent-worker/dist/agent-worker.bundled.mjs` and `bio-plane/dist/bio-plane.bundled.mjs` (`gate.mjs`, `promotion/index.mjs`; membership's files too, from its merge).
- **Grep:** `civicos-ui/` and affordances name no code added or retired. The only hits are the guard's comments.

**Tests and checks:**
- `node --test bio-plane/test/m/promotion/`: tests 71, pass 71, fail 0, todo 0.
- `test/m/ratification/`: 73 pass, 1 fail (the K500 red above).
- Legacy readers of the stamp:
  - `ratify` 43/0, `conformance` 59/0;
  - `row-census` 7/1, `d470-catalog-census` 12/2 (the re-pins above);
  - `d84-case-manifest`, `rec212-statement-writer`, `rec219-case-document-v4` pass;
  - `fleetbundles` red only on the stale bundles.
- Layer tests: `build/manifest.md` names none.
- `format`: 72 modules, 67 requirements files; 0 failures. `architecture promotion`: 16 product files; 0 failures. `coverage promotion`: 51 of 51; 0 failures. `ownership promotion tranche/T16`: 5 files; legacy 0 lines; 0 failures.

Size (session_01SV3MUwaJQVfxezqBTByPmU): test runs 16, module lines 124

## J1 · QUESTION

Entry (2), N242's share: "C-102.9's region carries no code". The DEC-49 guard (`civicos-ui/check-refusal-codes.mjs`) fails `src/gate.mjs` `caseCatalogueFailed` as a CODELESS REFUSAL: `{gateVersion, ok: false, findings, warnings}` has no `code` and no `reason`. My best reading, which I am building: the case gate's C-102.9 answer keeps R29's four keys and gains the module's usual refusal keys beside them, `reason` and `code` `CASE_CATALOGUE_FAILED`, with `check` C-102.9 and its `translation` from `REGISTRATION_CHECKS`; its one finding is unchanged. Ratification's `op=caseratify` is unaffected (it tests `gate.reason && !Array.isArray(gate.findings)`, and `findings` stays an array, so it still answers GATE_REFUSED). This moves `registry.test.mjs`'s "R29's shape, whole (N275)" assertion (`Object.keys(r)` exactly the four), which I re-anchor to "R29's four keys, plus the refusal's code and row". If you read R33 as forbidding keys beyond R29's four, say so and I will instead leave the answer's shape and report the guard's arm as the guard's to read the finding's `check`.

## J2 · REPORT

Entries (1) and (2) are done on `job/T16/promotion` (B2 applied, K534: C-102.9 keeps R29's four-key verdict). Promotion's tests pass 70 of 71. The one failure is R39's modules-order test: membership's `MODULE_ORDER` still lacks `sources`, `tasks` and `queue-producers`, which is MEMBERSHIP #9's R83. format, architecture, coverage (51/51) and ownership: 0 failures.

Waiting for one thing: entry (3), the stamp, needs MEMBERSHIP #9 merged into `tranche/T16` (C-96.15, and C-96.16 per K535). **Please ring me when it merges.** I will then merge the tranche, move to 1.46.0, re-pin `ROW_CENSUS` and post COMPLETE. Pre-read on the tree before membership: 875 rows. Against 1.45.0's fixture, 50 rows arrived and 3 `where`s changed, each named `awaiting stamp` by a T15 record (C-113.28 included, conformance's J2). Nothing else moved.

Found so far, for legacy-tests:
- (a) The DEC-49 guard's codeless arm at `src/gate.mjs` `caseCatalogueFailed` should read a gate verdict by its findings' `check` (K534).
- (b) Suites calling the free `runCaseGate` with no catalogue now get C-102.9: `test/d84-case-manifest`, `rec212-statement-writer`, `rec219-case-document-v4`. All three still pass here.
- (c) Ratification's accepted red at `test/m/ratification/checks.test.mjs`:133 (K500) is unchanged.
