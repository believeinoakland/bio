# case-carriage (T34)

**Status** · session_0156fAY8XA6y75Um2sHFrXS6 · depth 2 · WORKING · handled B1

## Completion

**Entries applied.**
- **T34-43** (N554; K1545, K1754): R6's purge test follows record-core's R80 refusal shape. Another module declaring either held-materials table is refused `TABLE_DECLARED` with `code`, `check` C-102.27, a translation and a detail naming the table, `declaredBy` `case-carriage`. The test checks those fields, not record-core's wording. This clears accepted red 5 (2) for case-carriage. No test of this module pins `TABLE_NAME_INVALID`.
- **T34-87** (DEC-149): the four member-facing `unheld` reasons in `index.mjs` (:124, :129, :139, :162) now say "your group's Civicsmith" instead of "this copy". New test `R1 (DEC-149) …` in `hold.test.mjs` names each changed string and checks that no outward answer says this/the copy, instance or plane. None of them is a check translation, so no catalogue version moves. No other module's test pins these strings (searched the whole repository).

**Deferred.** None.

**Found in other modules.** None.

**Tests and checks.**
- `node --test bio-plane/test/m/case-carriage/*.test.mjs`: tests 22, pass 22, fail 0.
- publication's tests, as the caller: pass 97, fail 0.
- No layer tests are named in `build/manifest.md`.
- `format`: 127 modules, 126 requirements files; 0 failures.
- `architecture case-carriage`: 6 product files, 24 relative imports; 0 failures.
- `coverage case-carriage`: 7 of 7 live requirement ids named by a test; 0 failures.
- `ownership case-carriage tranche/T34`: 4 files changed; 0 failures.

Size (session_0156fAY8XA6y75Um2sHFrXS6): test runs 3, module lines 341
