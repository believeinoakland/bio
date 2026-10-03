# promotion (T28)

**Status** · session_01JXCfBLEWnwDJYd7wTMihga · depth 2 · COMPLETE · handled B1

## Completion

Stamp commit `6ebafeec57` on `job/T28/promotion` (from `tranche/T28` @ 1468eafaa3, T28 L2 started).

**Entries applied.** S4 (accepted red 2), from BOB's B1 START:
- (1) The stamp: `CATALOG_VERSION` 1.56.0 → 1.57.0 (`bio-plane/src/gate.mjs`), MINOR. The note follows 1.56.0's form. **Thirty arrivals**, none changed, no departure: C-117.23 `HOLD_RELEASE_IS_ITS_OWN_ACT`, C-117.24 `HOLD_PROJECTS_REFUSED`, C-117.25 `HOLD_ALREADY_RELEASED` (action-grammar; `build/jobs/T27/action-grammar.md`:14); C-69.5 `PURGE_HOLD_IN_PLACE` (control-plane; `control-plane.md`:20); C-129.1–C-129.26 in docket's new `DOCKET_CHECKS` (`docket.md`:31). CHANGED IN WHAT THE GATES RUN: nothing. Docket registers no step, grammar or listener, and the case gate's catalogue is unmoved. `GATE_VERSION`'s form is kept (R34). `ROW_CENSUS` is re-pinned at **1103 rows**, `966af5b4736d874c29c44d81e1e3d6d7f1c1479721af0aa663609f19b15e9226`.
- Census against the records: the census of the tree moved from the 1.56.0 pin by exactly these thirty lines (30 added, 0 gone). Each one is named `awaiting stamp` by its T27 record. **public-read's and signatures' T27 records add no row** (`public-read.md`:13: "none (R21 reuses C-98.8)"; `signatures.md`:11: "none added"), so S4 has nothing to stamp for them. No other T27 record names a row (I checked all fifteen).
- (2) The T28 drafts' rows: **none exists at this stamp**, so none is stamped. C-120.8, C-120.10–C-120.13 (case-authoring), C-122.2–C-122.4 (publication), C-21.3 (inquiry-grammar), C-21.4–C-21.5 (accepted-work) and case-import's new family are all L6–L8 work. C-58.5's and C-92.10's re-wordings are ratification's own table (its R14, L8); today both rows still read as 1.53.0 stamped them. **For T29** (next.md S5), stamped when each lands: C-120.8; C-120.10, C-120.11, C-120.12, C-120.13; C-122.2, C-122.3, C-122.4; C-21.3, C-21.4, C-21.5; case-import's family (its number is still unminted); C-58.5 re-worded; C-92.10 re-worded. C-120.9 is withdrawn (K1277). Its number is not reused, and the 1.57.0 note says so.
- (3) The census fixture (R50): I added `bio-plane/test/fixtures/row-census-1.57.0.jsonl` (1103 lines, written by `row-census.mjs`'s own `censusOf` over the tree). The suite holds it to the pin ("the stamp's own lines are the pin": PASS). I deleted `row-census-1.56.0.jsonl`. `AWAITING_STAMP` and `COMPOSITIONS_AWAITING` are empty, each re-anchored at 1.57.0, and the suite's header gains the 1.57.0 re-pin note. **BOB swaps my `tests` entry** from `bio-plane/test/fixtures/row-census-1.56.0.jsonl` to `bio-plane/test/fixtures/row-census-1.57.0.jsonl` (K1027's form).
- Negative control: its arms in the suite pass. On a scratch worktree of the stamp commit I added `C-59.99 CONTROL_ROW` to record-core's `RECORD_CORE_CHECKS`. The suite went to 7 pass, 1 fail, with `CENSUS MOVED: arrived with no record: C-59.99 CONTROL_ROW`. I then removed the worktree, and the real tree reads 8 pass, 0 fail.
- Re-scan for the N502/N508 kind; I read every file of the module and its tests whole. 1.56.0's note ended "Rows T26's layers 3–11 change are T27's stamp". It now ends "were T27's stamp, and T27's were T28's, taken by 1.57.0" (T26's layers 3–11 changed no row). Nothing else is of the kind. `checks.mjs`'s `src/store.mjs` and "the store's `promote`" mentions are each dated "when this row/note was written", and `index.mjs`:964's "Moved from `store.mjs` … T6" is dated history, so all of them stay. So do d526's dated history and the fixtures' `legacy-store` registrant, which is only a label.

**Deferred.** None.

**Found in other modules.**
- `membership` (MEMBERSHIP #21, this layer): `MODULE_ORDER` does not yet name accepted-work, case-checker and case-import, which `modules.json` registers (its R83, this layer's entry). That fails one test of mine: `registry.test.mjs`:58, R39/R45/R46, the modules' total order. It also fails two of membership's own: `module-order.test.mjs`:12 R83 and `t9-notice-sight-bounds.test.mjs`:185 R79. My code is not the cause. On a scratch merge of `origin/job/T28/membership` (d5c782c31a) into my stamp commit, promotion's suite is **102/102**. So the order is merge membership, then promotion, and my test is green at my merge.
- Generated artifact: `bio-plane/dist/bio-plane.bundled.mjs` is stale from this stamp (`fleetbundles.test.mjs`: "bio-plane: STALE BUNDLE — the source src/gate.mjs has changed"). The owner is `not_product`, and BOB regenerates it at the layer close. I regenerated nothing.

**Tests and checks** (on `6ebafeec57`):
- `node bio-plane/test/system/row-census.test.mjs`: `row-census: 8 pass, 0 fail` (CENSUS 1103 rows `966af5b4…`, PIN 1.57.0 matches, nothing awaiting). This clears T27's red 2.
- `node --test bio-plane/test/m/promotion/`: 102 tests, 101 pass, 1 fail (R39/R45/R46 total order, membership's pending R83, above). With membership's branch merged: 102/102.
- `node bio-plane/test/d526-refusal-order.test.mjs`: 31 passed, 0 failed.
- `node --test --test-timeout=120000 bio-plane/test/m/`: 5458 tests, 5444 pass, 3 fail, 0 cancelled, 11 todo. The 3 failures are the three `MODULE_ORDER` tests above, all membership's R83.
- `checks/format.mjs`: 1 failure, the `tests` entry for the 1.56.0 fixture (BOB's swap). `architecture.mjs`: 25 files, 87 imports, 0 failures. `coverage.mjs`: 56 of 56, 0 failures. `ownership.mjs … tranche/T28`: 5 files, 1 failure, the 1.57.0 fixture outside my `tests` until the swap.
- Module size: 3,262 lines (`gate.mjs` and `promotion/`), under P6's bound.

Size (session_01JXCfBLEWnwDJYd7wTMihga): test runs 11, module lines 3262
