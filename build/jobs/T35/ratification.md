# ratification (T35)

**Status** · session_01NxeehqzSPE3JC7CHa54KEs · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied (T35-57).**
- N597, ratification's share (K1643): `observationsNamingAuthor` and `attributionStatedFor` (`gateFacts`, R7), `attributionFacts` (the pre-flight and the act's facts, R2/R18; `caseTestimony`, R35; the scheduled publisher, R42) and `dischargeCaseFlags` (the commit, R3) are read from `case-tensions` directly, never through `publication`. The new lazy `caseTensions` dependency (a test passes its own, as every other use) reaches `publication` first, because publication's factory creates case-tensions and registers the provider it reads its tables through (publication R61), then answers `caseTensionsOf(host)`. No other call to a publication delegate remains: `caseRelation` was already not called (two comments now name it as case-tensions'). Nothing the module answers changed.
- Tests: the fixture's steered attribution reads moved from its publication stand-in to a case-tensions stand-in over the real module, recording calls the same way. Each test that steered them now steers case-tensions. A new test in `case-commit.test.mjs` ("R2, R3, R7, R18: … read from case-tensions, never through publication") makes all six publication delegates throw, then runs the pre-flight, `caseTestimony`, the commit and `gateFacts`. Negative control: pointing `dischargeCaseFlags` or `attributionStatedFor` back at publication turns it red.

**Deferred.** None.

**Found in other modules.** None. publication (T35-54) can drop the delegates once this merges. The plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`, `not_product`) is stale from this change, as from any plane source change. It is BOB's to regenerate at L8's close (§14).

**Tests and checks.**
- ratification `bio-plane/test/m/ratification/`: 213 pass, 0 fail. No layer tests are named in `build/manifest.md`. No provided service changed, so users' tests were not run.
- `format`: 130 modules, 0 failures.
- `architecture … ratification`: 0 failures.
- `coverage … ratification`: 47 of 47 live ids named, 0 failures.
- `ownership … ratification tranche/T35`: 9 files, 0 failures.

Size (session_01NxeehqzSPE3JC7CHa54KEs): test runs 6, module lines 3530

## J1 · COMPLETE

T35-57 applied: ratification reads observationsNamingAuthor, attributionStatedFor, attributionFacts and dischargeCaseFlags from case-tensions directly (a lazy caseTensions dependency that reaches publication first, so its provider is registered); no publication delegate is called. A new test makes all six delegates throw and runs the pre-flight, caseTestimony, the commit and gateFacts (negative control red). ratification 213/0; format, architecture, coverage 47/47, ownership 9 files: 0 failures. Nothing found elsewhere; the plane bundle is stale as from any plane source change (yours at L8's close). Ready to merge before publication. Details in the record's Completion section.
