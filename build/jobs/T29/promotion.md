# promotion (T29)

**Status** · session_012itywqqcejzP4TtrJ2dRny · depth 2 · RUNNING until 2026-10-03T03:49:10Z (node --test bio-plane/test/m/) · handled B1

## Completion

Stamp commit `b8187b9b80` on `job/T29/promotion` (from `tranche/T29` @ ac65405d7d, merged in).

**Entries applied.** S5, from BOB's B1 START:
- The stamp: `CATALOG_VERSION` 1.57.0 → 1.58.0 (`bio-plane/src/gate.mjs`), MINOR, its note in 1.57.0's form. `GATE_VERSION`'s form is kept (R34). `ROW_CENSUS` is re-pinned at **1128 rows**, `bc45a9ec49445340dafecfc7adaa1ba57dfdb4291355da067a579bb9d14622e6` (R50).
- Census against the records: the tree moved from the 1.57.0 pin by exactly the rows B1 lists, and nothing else. There were 27 lines added and 1 removed (1103 → 1128):
  - **26 arrivals:** C-21.3 (`inquiry-grammar.md`:12, :52); C-21.4 and C-21.5 (`accepted-work.md`:26); C-120.8 and C-120.10–.13 (`case-authoring.md`:50); C-122.2–.4 (`publication.md`:53); C-130.1–.14 (`case-import.md`:39, :76).
  - **1 re-key:** C-129.10 MACHINE_CANNOT_MARK_PRESSURE → MACHINE_CANNOT_MARK_DOCKET_PRESSURE (`docket.md`:19–20).
  - **4 translations changed:** C-92.4 and C-92.5 (`publication.md`:53); C-58.5 and C-92.10 (`ratification.md`:25–27).
- C-120.9 is withdrawn (K1277), and its number is not reused. The L8 moves of this tranche (the C-120 `where`s with the split, N529; docket's PRESSURE_MARKED/PRESSURE_REFUSED codes, N533) are not stamped in advance. The note names them as T30's.
- Gate composition changes. Each one moved a row and is counted with it, as the note says:
  - accepted-work's registered promote step (C-21.4, C-21.5);
  - inquiry-grammar's imported-leg arm (C-21.3);
  - ratification's widened C-58.5 arm in the case catalogue.
- Census fixture (R50): I added `bio-plane/test/fixtures/row-census-1.58.0.jsonl` (1128 lines, written by `row-census.mjs`'s own `censusOf`) and deleted 1.57.0's. `AWAITING_STAMP` and `COMPOSITIONS_AWAITING` are re-anchored at 1.58.0, both empty. The suite header gains the 1.58.0 re-pin note. **BOB swaps my `tests` entry** from `row-census-1.57.0.jsonl` to `row-census-1.58.0.jsonl` (K1027's form).
- Negative control: its arms in the suite pass on the stamp commit.
- 1.57.0's note ended "Rows T28's layers 3–11 change are T29's stamp". It now reads "were T29's stamp, taken by 1.58.0".

**Deferred.** None.

**Found in other modules.**
- `membership` (MEMBERSHIP #22, this layer): `MODULE_ORDER` does not yet name `case-carriage` and `case-disclosures`, which `modules.json` registers (its R83, this layer's entry). That fails one test of mine: `registry.test.mjs` R39/R45/R46, the total order. It also fails two of membership's (R83, R79). The failure is identical without my change. Merge membership, then promotion.
- Generated artifacts made stale by `gate.mjs` (I regenerated neither):
  - `bio-plane/src/case-checker/program.mjs` (case-checker's; it embeds `CATALOG_VERSION`). `case-checker/program.test.mjs` R13 and R13/R16 fail on my branch and are 26/26 on `tranche/T29` without it. Regenerate with `node bio-plane/src/case-checker/build-program.mjs`.
  - `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`).

**Tests and checks** (on `b8187b9b80`):
- `node bio-plane/test/system/row-census.test.mjs`: `row-census: 8 pass, 0 fail` (CENSUS 1128 rows `bc45a9ec…`, PIN 1.58.0). This clears T28's red 2.
- `node --test bio-plane/test/m/promotion/`: 102 tests, 101 pass, 1 fail (the total order, membership's R83, above).
- `node bio-plane/test/d526-refusal-order.test.mjs`: 31 passed, 0 failed.
- `node --test --test-timeout=120000 bio-plane/test/m/`: 5712 tests, 5696 pass, 5 fail, 0 cancelled, 11 todo. Three failures are `MODULE_ORDER`'s (membership R83) and two are case-checker's stale program (above).
- `checks/format.mjs`: 1 failure, the `tests` entry for the 1.57.0 fixture (BOB's swap).
- `architecture.mjs`: 25 files, 87 imports, 0 failures.
- `coverage.mjs`: 56 of 56, 0 failures.
- `ownership.mjs … tranche/T29`: 5 files, 1 failure, the 1.58.0 fixture, which is outside my `tests` until the swap.
- Module size: 3,289 lines (`gate.mjs` and `promotion/`).

Size (session_012itywqqcejzP4TtrJ2dRny): test runs 9, module lines 3289
