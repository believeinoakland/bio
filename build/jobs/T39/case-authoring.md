# case-authoring (T39)

**Status** · session_01KsXLvmNX6T1sjWsVXjcN7x · depth 2 · WORKING · handled B1

## Completion

**Entry applied:** T39-18 (N806; K2374). No requirement changed: R55 already states the relay ("it answers the first refusal of the first step that refuses"; `materialsJudged` is its fourth step), so no QUESTION was needed.
- `fixture.mjs`: case-disclosures is composed over the real case-carriage on the host, proxied so that `documentCopy` (case-carriage R16) is answered from `w.copies` (an answer, or a function that may write or throw) and otherwise `public` (`FETCHED_COPY`): the fixture's documents state they were acquired by this copy. `w.disclosures` is exposed. `photos.test.mjs`'s own stand-in answers `documentCopy` the same way.
- `documents.test.mjs` (new, 5 tests): `DOCUMENT_COPY_PENDING`, `DOCUMENT_NOT_CLEANABLE` and `DOCUMENT_COPY_UNDETERMINED` (an `undetermined` answer and a read that throws, load-bearing and supporting-only alike) are `op=publish`'s answer as case-disclosures R22's table holds them, with its named fields, and the pre-flight's `first` (R34). Nothing is written (R18), and that includes a queueing write the stand-in makes inside the act, as R16's does. Negative controls: pending and refused under a supporting member only publish, listed `included: false`. R6's order across the three refusals, and the bar's refusal first with the document refusals among blockers. R14: a `copy` row is `included: false`, `obscured: {copy, label: COPY_CLEANED_LABEL}`; `public` and `clean` travel whole.
- `invariants.test.mjs`, `preflight.test.mjs` (R29): the C-120 census names case-disclosures' new rows C-120.20–C-120.22 (provisional until promotion's stamp), their translations word for word from its R22 table.

**A flaw fixed in my module (step 4):** `publishPreflight` (R34: "It writes nothing") ran its independent reads (R6, R13, R14, R25, R27, R1 as R32 reads it) outside any transaction. With R16's real `documentCopy`, a pre-flight over a member document would have left the queue row behind; a source id minted by `sources.sourceOf` could do the same. Those reads now run inside a transaction the pre-flight rolls back, as its `publishCase` run already did. The new pending test failed on this before the fix: its snapshot after the pre-flight held the queue row.

**Deferred:** none. Once case-carriage merges (BOB's CHANGE), I will add an arm over its real `documentCopy` for a member document (no receipt) and re-run the whole suite.

**Found in other modules:** none beyond CASE-DISCLOSURES #7's J1, which found this entry.

**Tests and checks** (`bio-plane/`, `node --test test/m/case-authoring/`):
- On a scratch merge of `tranche/T39` + `job/T39/case-disclosures` with a local stand-in case-carriage (`documentCopy` answering `pending`, `COPY_CLEANED_LABEL`; never committed): before my change, `tests 164, pass 20, fail 144` (K2374's reds reproduced); after, `tests 169, pass 169, fail 0`.
- On this branch alone (neither provider merged): `tests 165, pass 162, fail 3`. All three wait on the providers' merges: `documents.test.mjs` imports case-carriage's `COPY_CLEANED_LABEL`, and the two R29 census tests name case-disclosures' C-120.20–C-120.22.
- `format: 139 modules, 137 requirements files; 0 failures`; `architecture: 28 product files, 153 relative imports (0 naming no tracked file, not judged); 0 failures`; `coverage: 1 modules, 46 of 46 live requirement ids named by a test; 0 failures`; `ownership: 7 files changed by case-authoring between tranche/T39 and HEAD; 0 failures`.

Size (session_01KsXLvmNX6T1sjWsVXjcN7x): test runs 4, module lines 3473
