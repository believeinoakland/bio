# promotion (T30)

**Status** · session_011zouuDt37KpxHQBHzQxiy3 · depth 2 · COMPLETE · handled B1

## Completion

Stamp commit `1b10a766cb` on `job/T30/promotion` (from `tranche/T30` @ e6f168ff24).

**Entries applied.** S6, from BOB's B1 START:
- The stamp: `CATALOG_VERSION` 1.58.0 → 1.59.0 (`bio-plane/src/gate.mjs`), MINOR, its note in 1.58.0's form. `GATE_VERSION`'s form is kept (R34). `ROW_CENSUS` is re-pinned at **1128 rows**, `61929a985736a8e24b0d7a5e8d59cd78bd2fdc39d1f50bd851bd8be3cde23acf` (R50).
- Census against the records: the tree moved from the 1.58.0 pin by exactly the rows B1 lists, and nothing else. 14 lines arrived and 14 departed (1128 → 1128):
  - **12 `where`s changed** (code, number and translation unmoved): C-120.1–.8 and C-120.10–.13, now naming `src/case-disclosures/index.mjs <method> > <region>`, C-120.3's method `tensionsUndetermined` (`case-disclosures.md`:20; `case-authoring.md`:18, :22; `control-plane.md`:8–10).
  - **2 re-keys:** C-129.12 PRESSURE_MARKED → DOCKET_PRESSURE_MARKED, C-129.13 PRESSURE_REFUSED → DOCKET_PRESSURE_REFUSED (`docket.md`:7, :13).
- No gate composition changed: case-disclosures and docket register no step, grammar, fact or case catalogue. 1.58.0's note now reads "were T30's stamp, taken by 1.59.0".
- Census fixture (R50): I added `bio-plane/test/fixtures/row-census-1.59.0.jsonl` (1128 lines, written by `row-census.mjs`'s own `censusOf`) and deleted 1.58.0's. `AWAITING_STAMP` and `COMPOSITIONS_AWAITING` are re-anchored at 1.59.0, both empty. The suite header gains the 1.59.0 re-pin note. **BOB swaps my `tests` entry** from `row-census-1.58.0.jsonl` to `row-census-1.59.0.jsonl` (K1027's form).
- Negative control: its arms in the suite pass on the stamp commit.

**Deferred.** None.

**Found in other modules.**
- Generated artifacts made stale by `gate.mjs` (I regenerated neither):
  - `bio-plane/src/case-checker/program.mjs` (case-checker's; it embeds `CATALOG_VERSION`). `case-checker/program.test.mjs` R13 and R13/R16 fail on my branch and are 27/27 on `tranche/T30` without it. Regenerate with `node bio-plane/src/case-checker/build-program.mjs`.
  - `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`).
- `case-disclosures`: `test/m/case-disclosures/seam.test.mjs:238` holds the literal `checks: "1.58.0"` as fixture data. It still passes (46/46) and asserts nothing about the live version, so it needs no change; noted only because it names a superseded stamp.

**Tests and checks** (on `1b10a766cb`):
- `node bio-plane/test/system/row-census.test.mjs`: `row-census: 8 pass, 0 fail` (CENSUS 1128 rows `61929a98…`, PIN 1.59.0). This clears T29's red 2.
- `node --test bio-plane/test/m/promotion/`: 102 tests, 102 pass, 0 fail.
- `node bio-plane/test/d526-refusal-order.test.mjs`: 31 passed, 0 failed.
- `node --test --test-timeout=120000 bio-plane/test/m/`: 5793 tests, 5780 pass, 2 fail, 0 cancelled, 11 todo. Both failures are case-checker's stale program (above).
- `checks/format.mjs`: 1 failure, the `tests` entry for the 1.58.0 fixture (BOB's swap).
- `architecture.mjs`: 25 files, 87 imports, 0 failures.
- `coverage.mjs`: 56 of 56, 0 failures.
- `ownership.mjs … tranche/T30`: 5 files, 1 failure, the 1.59.0 fixture, which is outside my `tests` until the swap.
- Module size: 3,305 lines (`gate.mjs` and `promotion/`).

Size (session_011zouuDt37KpxHQBHzQxiy3): test runs 8, module lines 3305

## J1 · COMPLETE

S6 stamped on job/T30/promotion (1b10a766cb): CATALOG_VERSION 1.58.0 -> 1.59.0; C-120.1-.8, .10-.13 where re-pointed to case-disclosures; C-129.12/.13 re-keyed to DOCKET_PRESSURE_MARKED/REFUSED; nothing else moved, no composition change. ROW_CENSUS 1128 rows 61929a98...; fixture row-census-1.59.0.jsonl (swap my tests entry from 1.58.0's). row-census 8/0 (T29 red 2 cleared); promotion 102/102; d526 31/0; test/m 5780/5793, the 2 fails case-checker's stale program.mjs (regenerate build-program.mjs) - plane bundle also stale, yours at the close.
