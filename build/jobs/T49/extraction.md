# extraction (T49)

**Status** · session_01X1a6atrMd6RYfkvAD912aB · depth 2 · WORKING · handled B1

## Completion

**Read, how** · requirements `extraction.md` whole; plan entry T49-35; `readingFor`, `#unreadOf`, `unitsOf` and the code around them in `extraction/index.mjs` (lines 935–1115) whole; `store.test.mjs` (the R27, R36 tests) whole. The other tests were run, not read. No used service was touched (the change is read-only over this module's own tables), so none was read.

**Entries applied** · T49-35 / R76: `readingFor` (`op=reading`, R27) answers `text_units`, built from `unitsOf` (R36) as `{extent, reference, text, truncated}` in seq order (at most 4,096, the bound `unitsOf` already holds), withheld exactly as the bundle is from a viewer who may not see it (the same gate as `unread_pages`), `[]` for a capture read and never indexed (absent, empty and null stay three facts, R45), absent for a capture not read. Code: `extraction/index.mjs` `readingFor`. Test: `store.test.mjs` "R76 R27 R36 …" (units in seq order and field for field against `unitsOf`; control: a viewer refused the bundle receives none; read-but-unindexed answers `[]`; not read answers none; the 4,096 bound).

**Deferred** · none.

**Found in other modules** · `journey-check` local arm (`journey.test.mjs` R1 (a)) fails at "journey 28 · setup: claim; she is the group's first administrator: the claim is not shown on /app/setup", before any reading is requested; it fails the same way independent of this change (a setup-screen walk defect, not `op=reading`). Its `walker.test.mjs` did not finish in 300 s here. `npm ci` was needed in `bio-plane/src/journey-check` for `playwright-core` (the environment had none). Three `screens-*` tests are red with and without my change (checked by stash): "R1–R13 (interface-shell R21, R38)…", "R1 every refusal is drawn beside its act…", "R8 the path Settings › Wizards…" (806 of 809 pass).

**Ran** · `node --test bio-plane/test/m/extraction/`: tests 173, pass 173, fail 0. `node --test bio-plane/test/m/screens-*/`: tests 809, pass 806, fail 3 (the same three without my change). `journey-check`: 26 of 27 pass, the local arm red as above.
Checks: `format: 170 modules, 169 requirements files; 0 failures` · `architecture: 34 product files, 122 relative imports (0 naming no tracked file, not judged); 0 failures` · `coverage: 1 modules, 52 of 52 live requirement ids named by a test; 0 failures` · `ownership: 1 files changed by extraction between tranche/T49 and HEAD; 0 failures`.

Size (session_01X1a6atrMd6RYfkvAD912aB): test runs 9, module lines 6897
