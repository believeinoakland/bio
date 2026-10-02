# promotion (T24)

**Status** · session_01SwJ6zqWV8DAK53y4TjpSJf · depth 2 · WORKING · handled B2

## Completion

Stamp commit `bcb9612a12` on `job/T24/promotion` (tranche/T24 merged in at `9e36109c28`, after record-core's, credentials' and membership's merges, K1186). Re-scan commit `ae3d64d88a`.

**Entries applied** (`build/plan/current.md` T24 L2, promotion; START B1, ANSWER B2, CHANGE B3):
- (1) S1, the stamp: `CATALOG_VERSION` 1.53.0 → 1.54.0 (`bio-plane/src/gate.mjs`), with a note in 1.53.0's form: 27 ARRIVED (network-notices C-127.1–C-127.16; acquisition C-128.1, C-128.2; monitoring C-18.16–C-18.18; capture-requests C-28.19; ratification C-41.17; public-read C-98.10; record-core C-59.7–C-59.9), none changed, no departure, no change in what the gates run beyond those rows, the rule-17 sentence, ending "Rows T24's layers 3–11 change are T25's stamp". Each row is named `awaiting stamp` by its T23 record (J1), record-core's by B3. `ROW_CENSUS` re-pinned: 1073 rows, `f1f0ad54195cd4b1b4df532eecf2377b4820e6589b9413053a9fcaeea8cc4fb7`. `GATE_VERSION`'s form unchanged (R34).
- (2) The census (R50): new `bio-plane/test/fixtures/row-census-1.54.0.jsonl` (1073 lines), written by `row-census.mjs` (`censusRows` + `censusOf`) on the stamp tree; `bio-plane/test/fixtures/row-census-1.53.0.jsonl` deleted. `AWAITING_STAMP` and `COMPOSITIONS_AWAITING` empty, each with a re-anchoring note; the header gains the 1.54.0 re-pin note. **BOB swaps my `tests` entry** from the 1.53.0 fixture to the 1.54.0 one.
- (3) `gate.mjs`'s 1.53.0 note (was :557) now ends "Rows T23's layers 3–11 change were T24's stamp, taken by 1.54.0".
- Re-scan (N469's rule): `d526-refusal-order.test.mjs`:148, :174 named legacy-store as the live registrant of those fences; re-worded to actions' and ai-runs' `registerStep`. Others left as history (J1 (2)).

**Deferred:** none.

**Other modules:**
- Generated artifact made stale: `bio-plane/dist/bio-plane.bundled.mjs` (`gate.mjs` is an input). Not regenerated (manifest, "Generated artifacts").
- Owners' own S1 notes (acquisition `checks.mjs`:228, monitoring :119, capture-requests :296, public-read :9, :146 and its test :47, network-notices :2) still say `awaiting stamp`; theirs to re-word to 1.54.0 (B1). Record-core's C-59.7–C-59.9 notes likewise, if they say so.
- J1 (3), membership's `MODULE_ORDER` lacking `link-sweep`: fixed by membership's T24 job; `registry.test.mjs`:58 green.

**Tests and checks** (on the stamp commit):
- `node bio-plane/test/system/row-census.test.mjs`: `row-census: 8 pass, 0 fail` (CENSUS 340 files, 1073 rows, f1f0ad54…; PIN 1.54.0 matches). Accepted red 1 cleared.
- Negative control: the suite's arm passes; on the real tree a `C-59.99 CONTROL_ROW` added to record-core's `RECORD_CORE_CHECKS` → `7 pass, 1 fail`, `CENSUS MOVED: arrived with no record: C-59.99 CONTROL_ROW`; restored with `git checkout`.
- `node --test bio-plane/test/m/promotion/ bio-plane/test/d526-refusal-order.test.mjs bio-plane/test/m/ratification/converted-d.test.mjs`: tests 122, pass 122, fail 0.
- `node --test bio-plane/test/m/`: tests 5230, pass 5219, fail 0, todo 11, skipped 0. No red.
- `checks/format.mjs bio`: 3 failures: `modules.json` promotion `tests` still names `row-census-1.53.0.jsonl` (BOB's swap); link-sweep's `paths` and `tests` absent (accepted red 4).
- `checks/architecture.mjs bio promotion`: 0 failures.
- `checks/coverage.mjs bio promotion`: 56 of 56 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs bio promotion tranche/T24`: 1 failure: `row-census-1.54.0.jsonl` outside my `tests` until BOB's swap. Otherwise only my files changed.

Size (session_01SwJ6zqWV8DAK53y4TjpSJf): test runs 7, module lines 3206

## J1 · REPORT

Ready to stamp; waiting on your word that record-core and credentials have merged (START: merge last in L2).
(1) The rows. On `job/T24/promotion` (= tranche/T24 @ 622e0dac14), `row-census.test.mjs` names exactly 24 rows, 1,070 against the 1.53.0 pin's 1,046: 24 arrived, none changed, none departed. Each is named `awaiting stamp` by a T23 record: network-notices C-127.1–C-127.16 (its record's list, :61); acquisition C-128.1 SWEEP_SCOPE_MISSING, C-128.2 SWEEP_REDIRECT_OUT_OF_SCOPE (:18); monitoring C-18.16 SWEEP_TERM_REFUSED, C-18.17 SWEEP_NOT_A_MEMBER, C-18.18 SWEEP_RATIFY_NOT_AN_OWNER (:17); capture-requests C-28.19 CAPTURE_SWEEP_OUT_OF_SCOPE (:15); public-read C-98.10 PUBLIC_READ_NOT_REGISTERED (:54; its `checks.mjs`:146 is that row's own comment); ratification C-41.17 WORKING_ON (:9; in `CASE_DOCUMENT_FAMILY`, the case gate's catalogue, counted as the row's arrival as C-41.16 was). C-41.17 is not in START's list but its record names it; no QUESTION. N486 (signatures) added no row. No composition change since 1.53.0: no T23 record names one, and `git diff d696f595bf` shows no gate registration's ids moved (new registrations are capture-requests' `registerSweepScope`, network-notices' mint seed and public reads: none a gate's catalogue).
(2) Re-scan (N469's rule): `d526-refusal-order.test.mjs`:148, :174 said those fences are checks "legacy-store REGISTERS"; re-worded to their owners' `registerStep` (actions', ai-runs'), pushed ae3d64d88a. `promotion/checks.mjs`:226 names `src/store.mjs` only "when this row was written" (history); `gate.mjs`:212 is per-stamp history; test fixtures that register under the module id "legacy-store" use it as an arbitrary name. Left as they are.
(3) A red not in your list: `test/m/promotion/registry.test.mjs`:58 (R39, R45, R46, the modules' total order) fails because `membership`'s `MODULE_ORDER` (`membership/index.mjs`:167) lacks `link-sweep`, which N506's opening fold put in `modules.json` (layer 10). Membership's to fix (or an accepted red until it is); my code and test are right. `test/m/promotion/` + d526: 103 tests, 102 pass, 1 fail (that one).
