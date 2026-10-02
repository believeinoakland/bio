# promotion (T25)

**Status** · session_0132mjJUXBPPWVGDGbsFCnND · depth 2 · RUNNING until 2026-10-02T17:34:36Z (node --test bio-plane/test/m/) · handled B1

## Completion

Stamp commit `4d709bcf9e` on `job/T25/promotion` (tranche/T25 merged in at `264b479664`, after membership's merge, K1222, B2). Draft commit before it: the 1.55.0 note and the suite's re-anchoring.

**Entries applied** (`build/plan/current.md` T25 L2, promotion, S2; START B1, CHANGE B2):
- (1) S2, the stamp: `CATALOG_VERSION` 1.54.0 → 1.55.0 (`bio-plane/src/gate.mjs`), MINOR, with a note in 1.54.0's form: three CHANGED, `where` only (C-18.16 SWEEP_TERM_REFUSED, C-18.17 SWEEP_NOT_A_MEMBER, C-18.18 SWEEP_RATIFY_NOT_AN_OWNER, re-pointed from monitoring to link-sweep, N506; LINK-SWEEP #1's record names each `awaiting stamp`), no arrival, no departure; CHANGED IN WHAT THE GATES RUN: C-18.5's sweep arms reach monitoring's promote step and audit through link-sweep's `registerSweep` registration (monitoring R66), moved line for line, so what judges a bundle is unmoved (1.50.0's form); the rule-17 sentence; ending "Rows T25's layers 3–11 change are T26's stamp". The census moved by exactly those three rows; no row is unnamed by a record, so no QUESTION. Membership's T25 merge moved no row (census identical before and after it). `ROW_CENSUS` re-pinned: 1073 rows, `735376fd77a0d28e5271c7f3972356664b5bcf43d527212937f47dad7b7f0fc8`. `GATE_VERSION`'s form unchanged (R34).
- (2) The census (R50): new `bio-plane/test/fixtures/row-census-1.55.0.jsonl` (1073 lines), reproduced byte for byte by `row-census.mjs` (`censusRows` + `censusOf`) on the stamp commit; `bio-plane/test/fixtures/row-census-1.54.0.jsonl` deleted. `AWAITING_STAMP` and `COMPOSITIONS_AWAITING` empty, each with a re-anchoring note in their form; the header gains the 1.55.0 re-pin note. **BOB swaps my `tests` entry** from `bio-plane/test/fixtures/row-census-1.54.0.jsonl` to `bio-plane/test/fixtures/row-census-1.55.0.jsonl`.
- (3) Re-scan for the N502/N508 kind (N469's rule), every file of the module read whole: `gate.mjs`' 1.54.0 note ended "Rows T24's layers 3–11 change are T25's stamp (`awaiting stamp`)"; re-worded "were T25's stamp, taken by 1.55.0". Nothing else: `promotion/checks.mjs`:226 (`src/store.mjs` "when this row was written"), `index.mjs`:964 ("Moved from `store.mjs` … T6") and the test fixtures registering under the label "legacy-store" are history or arbitrary labels; `registry.test.mjs`:295's "monitoring R29" is monitoring's live requirement.

**Deferred:** none.

**Other modules:**
- Generated artifact made stale: `bio-plane/dist/bio-plane.bundled.mjs` (`src/gate.mjs` is an input; `fleetbundles.test.mjs` names it STALE BUNDLE, and also `src/membership/index.mjs` from membership's merge). Not regenerated (manifest, "Generated artifacts").

**Tests and checks** (on the stamp commit):
- `node bio-plane/test/system/row-census.test.mjs`: `row-census: 8 pass, 0 fail` (CENSUS 1073 rows, 735376fd…; PIN 1.55.0 matches). Accepted red 1 cleared.
- Negative control: the suite's arm passes; on a scratch worktree of the stamp commit, a `C-59.99 CONTROL_ROW` added to record-core's `RECORD_CORE_CHECKS` → `row-census: 7 pass, 1 fail`, `CENSUS MOVED: arrived with no record: C-59.99 CONTROL_ROW`; worktree removed.
- `node --test bio-plane/test/m/promotion/`: tests 102, pass 102, fail 0 (red 5 cleared by membership's merge). `node bio-plane/test/d526-refusal-order.test.mjs`: 31 passed, 0 failed.
- `node --test bio-plane/test/m/`: tests 5290, pass 5279, fail 0, todo 11, skipped 0. No red.
- `checks/format.mjs bio`: 7 failures: promotion's `tests` still names `row-census-1.54.0.jsonl` (BOB's swap); attestation's, provenance-routes' and reading-pipeline's `paths` and `tests` absent (accepted red 4).
- `checks/architecture.mjs bio promotion`: 0 failures.
- `checks/coverage.mjs bio promotion`: 56 of 56 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs bio promotion tranche/T25`: 1 failure: `row-census-1.55.0.jsonl` outside my `tests` until BOB's swap. Otherwise only my files changed.

Size (session_0132mjJUXBPPWVGDGbsFCnND): test runs 7, module lines 3214
