# id-spaces (T34)

**Status** · session_01M4x59wQhwN7AXzMLPTFvn1 · depth 2 · WORKING · handled B0

## Completion

**Entries applied** (T34-7; N569, N613; K1574, K1682, K1725).
- R1: `spaces` lists eleven spaces in Provides' order, `body` and `office` after `person`, each with a generic label used only when the view gives none and `referent` `reading`. Both are recognised, normalised and judged from the view's forms exactly as every other space. A body's number and an office record's number are two spaces, so the same digits in each are never judged together (`judgePair` refuses with `TypeError`, R16/R22's contract).

**Improvements made in my module.** None beyond the entry: the code reads every space from one table, so the change is the table's two rows and the comments that counted nine.

**Deferred.** None.

**Found in other modules** (REPORT J1).
- entities: `bio-plane/test/m/entities/idmatch.test.mjs:26` (its R20 test) pins id-spaces' list as the nine literal names. It goes red once id-spaces merges (82 pass, 1 fail with this branch's id-spaces; 82/0 without), until entities' next job lists the eleven or drops the literal. The very next assertion already compares with `spaces()` over the view, which is what entities R20 requires; entities' code needs no change.
- Generated artifact made stale (§14): `bio-plane/dist/bio-plane.bundled.mjs` bundles `idspaces.mjs`.
- Tests graft `body` and `office` onto a combined view (`fixtures.mjs` `withNewSpaces`), because `jurisdictions.combine` refuses them (`UNKNOWN_SPACE`) until JURISDICTIONS' T34-2 job (its R3) merges; the graft is the view's own shape and stays valid after.

**Uses** (final, unchanged): jurisdictions (the view's shape only; nothing imported), court-citations (its data).

**Tests and checks run** (on `job/T34/id-spaces` after merging `tranche/T34` @ 9b3322ac45):
- `node --test bio-plane/test/m/id-spaces/`: tests 32, pass 32, fail 0 (a new R1 test for `body` and `office`; R22's sweep covers both).
- Users of id-spaces: court-doctypes 24/0; record-core 126/0 and `stats-disclosure.test.mjs` 1/0; entities 82 pass, 1 fail (R20 above); standards 47/0; calculations 31/0; jurisdictions 81/0.
- `format`: 126 modules, 125 requirements files; 0 failures. `architecture id-spaces`: 3 product files, 5 relative imports; 0 failures. `coverage id-spaces`: 28 of 28 live requirement ids named by a test; 0 failures. `ownership id-spaces tranche/T34`: 4 files changed (3 code files and this record); 0 failures.

Size (session_01M4x59wQhwN7AXzMLPTFvn1): test runs 4, module lines 1477

## J1 · REPORT

Two findings outside id-spaces, from T34-7 (job/T34/id-spaces): (1) entities: bio-plane/test/m/entities/idmatch.test.mjs:26 (its R20 test) pins id-spaces' list as nine literal names; with this branch's id-spaces, entities is 82 pass, 1 fail (that test), 82/0 without. Red from id-spaces' merge until entities' next job lists the eleven or drops the literal; the next assertion already compares with spaces() over the view, as entities R20 requires; entities' code needs no change. (2) Generated artifact stale (§14): bio-plane/dist/bio-plane.bundled.mjs bundles idspaces.mjs. Also: my tests graft body and office onto a combined view (fixtures.mjs withNewSpaces) because jurisdictions.combine refuses them until T34-2 (its R3) merges; the graft is the view's own shape and stays valid after.
