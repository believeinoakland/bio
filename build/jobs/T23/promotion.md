# promotion (T23)

**Status** · session_01HB6f4fF8NP2uzL8Dazjrop · depth 2 · COMPLETE · handled B3

## Completion

Stamp commit `d696f595bf` on `job/T23/promotion` (tranche/T23 merged in at `85f74eb7ef`, after membership's K1123 and record-core's K1124 merges). R45's test commit `68ede6614e` (J1 named it wrongly as "1da1…").

**Entries applied** (`build/plan/current.md` T23 L2, promotion; START B1, ANSWER B2, CHANGE B3):
- (1) The stamp: `CATALOG_VERSION` 1.52.0 → 1.53.0 (`bio-plane/src/gate.mjs`), with a note in 1.52.0's form: 25 ARRIVED, 10 CHANGED (translations of C-33.44, C-112.17, C-118.3, C-85.1–.5; `where`s of C-116.5–.7), no departure, no change in what the gates run beyond those rows, the rule-17 sentence, ending "Rows T23's layers 3–11 change are T24's stamp". The 35 rows are the census's on the merged tree; each is named `awaiting stamp` by its T22 record (list in J1). `ROW_CENSUS` re-pinned: 1046 rows, `28dc9ebb47bf812a1268e50f885ade3ad245fd76b00a04089ce88a88edb3e7e4`. `GATE_VERSION`'s form unchanged (R34).
- (2) The census (R50): new `bio-plane/test/fixtures/row-census-1.53.0.jsonl` (1046 lines), written by `row-census.mjs` (`censusRows` + `censusOf`) on the stamp tree; `bio-plane/test/fixtures/row-census-1.52.0.jsonl` deleted. `AWAITING_STAMP` and `COMPOSITIONS_AWAITING` empty, each with a re-anchoring note; header gains the 1.53.0 re-pin note. **BOB swaps my `tests` entry** from the 1.52.0 fixture to the 1.53.0 one.
- (3) R45's ratified-sweep arm needs no new code: `onCommitted` already tells every listener of every accepted, committed promotion, and the listener reads the bundle. New test (`registry.test.mjs`, named R45) at the interface: one leaving a bundle monitored and one holding a ratified sweep are each told once, after the commit, with the record then holding what the listener reads; also a revision that ratifies a sweep and a replay; never a CAS_STALE, a `wrote:false` repeat or one rolled back with its caller. R45's `(not yet met: T23 …)` mark is BOB's to strike.

**Deferred:** none.

**Other modules:**
- Generated artifact made stale: `bio-plane/dist/bio-plane.bundled.mjs` (`gate.mjs` is an input). Not regenerated (manifest, "Generated artifacts").
- Old `awaiting stamp` notes in other modules' source comments name tranches stamped long ago (e.g. `action-plans/checks.mjs`:4, `run-rules/checks.mjs`:5, `capture-requests/checks.mjs`:6, `admission/checks.mjs`:8, `conformance/checks.mjs`:17, `control-plane/checks.mjs`:55, :121, all "T16"/"T19"). Wording only: each owner can update them in a later job. My stamp makes T22's ones (monitoring, strength, content, filings) stale in the same way.

**Tests and checks** (on the stamp commit):
- `node bio-plane/test/system/row-census.test.mjs`: `row-census: 8 pass, 0 fail` (CENSUS 332 files, 1046 rows, 28dc9ebb…; PIN 1.53.0 matches). Accepted red 1 cleared.
- Negative control: the suite's arm (:229) passes. Also run on the real tree: added `C-59.99 CONTROL_ROW` to record-core's `RECORD_CORE_CHECKS` → `7 pass, 1 fail`, `CENSUS MOVED: arrived with no record: C-59.99 CONTROL_ROW`; restored with `git checkout`.
- `node --test bio-plane/test/m/promotion/ bio-plane/test/system/row-census.test.mjs bio-plane/test/d526-refusal-order.test.mjs bio-plane/test/m/ratification/converted-d.test.mjs` (users' re-test included): tests 123, pass 123, fail 0. Red 2 (`registry.test.mjs`:58) cleared with membership's merge.
- `node --test bio-plane/test/m/`: tests 5021, pass 5008, fail 1, todo 12, skipped 0. The one failure is accepted red 9 (control-plane `inbox-door.test.mjs`:81). No other red.
- `checks/format.mjs bio`: 1 failure: `modules.json` promotion `tests` still names `row-census-1.52.0.jsonl` (BOB's swap, above).
- `checks/architecture.mjs bio promotion`: 0 failures.
- `checks/coverage.mjs bio promotion`: 56 of 56 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs bio promotion tranche/T23`: 1 failure: `row-census-1.53.0.jsonl` outside my `tests` until BOB's swap. Otherwise only my files changed.

Size (session_01HB6f4fF8NP2uzL8Dazjrop): test runs 14, module lines 3187

## J1 · REPORT

Ready to stamp; waiting on your word that membership has merged (START: merge last in L2).
(1) The rows. On `job/T23/promotion` (tranche/T23 @ d5dd491571 + K1122), `row-census.test.mjs` names exactly your 35 rows, 1,046 against 1,022: 25 arrived, 10 changed (translations of C-33.44, C-112.17, C-118.3, C-85.1–.5; `where` only of C-116.5–.7, now `#pursuable`), none departed. Every one is named `awaiting stamp` by a T22 record by the suite's own paragraph reading: monitoring (C-18.11–.15), bias (C-26.21), queue (C-33.44, C-33.51), ratification (C-41.16, C-58.4, C-58.5), content (C-52.10), observation-log (C-54.11, C-54.12), case-authoring (C-82.8), capture (C-85.1–.5, C-118.3, C-118.7–.9), entities (C-91.8), publication (C-92.13), strength (C-107.3), reevaluation (C-110.29), standards (C-112.17, C-112.20), filings (C-115.44), escalation (C-116.5–.7, C-116.46). No QUESTION. No composition change since the 1.52.0 stamp (no T22 record names one; no registration's ids moved in `git diff 57160de53a`). The case gate's catalogue gains C-41.16's arm, which the census counts as that row's arrival.
(3) R45's sweep arm asks nothing new of my code: `onCommitted` tells every listener of every accepted promotion after its commit, and the listener reads the bundle to decide. New test `registry.test.mjs` "R45: a listener is told of an accepted promotion holding a ratified sweep, as of one leaving a bundle monitored …" (pushed, 1da1… on my branch): told once after commit with the record then holding the ratified sweep; a revision that ratifies one; a replay; never a CAS_STALE, a `wrote:false` repeat or one rolled back with its caller. `test/m/promotion/` + d526: 103 tests, 102 pass, 1 fail = red 2 (`registry.test.mjs`:58, MODULE_ORDER).

## J2 · COMPLETE

Complete; details in my record's Completion section. Stamp commit `d696f595bf` (tranche/T23 merged at `85f74eb7ef`, after K1123 and K1124); R45's test `68ede6614e` (J1's "1da1…" was wrong).
(1) `CATALOG_VERSION` 1.52.0 → 1.53.0, note in 1.52.0's form (25 arrived, 10 changed, no departure, no composition change, ending "Rows T23's layers 3–11 change are T24's stamp"). `ROW_CENSUS` re-pinned: 1046 rows, 28dc9ebb47bf812a1268e50f885ade3ad245fd76b00a04089ce88a88edb3e7e4. `GATE_VERSION`'s form kept.
(2) Fixtures, for your swap of my `tests`: ADD `bio-plane/test/fixtures/row-census-1.53.0.jsonl` (1046 lines, reproduced by `row-census.mjs` on the stamp tree); DELETED `bio-plane/test/fixtures/row-census-1.52.0.jsonl`. Until the swap, format.mjs (the 1.52.0 entry names no file) and ownership.mjs (the 1.53.0 file outside my tests) each report that one failure. Both declaration lists empty with re-anchoring notes. Negative control run: the suite's arm (:229) passes, and on the real tree a `C-59.99 CONTROL_ROW` added to `RECORD_CORE_CHECKS` turns it red naming it (restored).
(3) R45's sweep arm asks nothing new of my code (J1); the R45-named test is in `registry.test.mjs`. The not-yet-met mark is yours to strike.
Proof: row-census 8 pass 0 fail (red 1 cleared); `test/m/promotion/` + row-census + d526 + ratification `converted-d.test.mjs`: 123/123 (red 2 cleared); whole `bio-plane/test/m`: 5021 tests, 5008 pass, 1 fail = red 9 (`inbox-door.test.mjs`:81), 12 todo. architecture 0 failures; coverage 56/56.
Report: `bio-plane/dist/bio-plane.bundled.mjs` is stale (gate.mjs); nothing regenerated. Stale `awaiting stamp` wording in other modules' source comments (old tranches) is listed in the record. It is wording only.
