# observation-log (T10)

**Status** · session_017qTNuu87xeFVykeCg51XB3 · depth 2 · WORKING · handled B2

## J1 · QUESTION

R6 (N139), the fourth row. Two readings of "a reading that read from text whose `text_chars` is 0":
(1) Extraction's reader DECLINES empty text, so a scan read to nothing arrives `read_from_text: false` with `text_chars: 0` (R60 puts the counts on every reading whose provenance digested a text, `pipeline.mjs` 1063). Read literally ("read_from_text true and text_chars 0"), the row has no producer. My reading: "read from text" means a text was handed to the reader, i.e. `text_chars` is the integer 0, whatever `read_from_text` says. Only an integer 0 counts; null, absent and `found: false` never do.
(2) With `tier3_candidate` (pages left unread, D-418), a zero count is not "the document has no text". D-375's built work (`land/worker/D-375`) answers LOOKED_INDETERMINATE `text-undetermined` there, and also where no image-reading tier ran. R6 says one LOOKED_ABSENT row. My reading: LOOKED_ABSENT whenever `text_chars === 0` and `tier3_candidate` is not true. A zero count with pages left unread stays row 3 (LOOKED_INDETERMINATE, `text-undetermined`), because a page nobody read is not a page with no text. I am not taking D-375's "no tier-3 ran" arm, since R6 does not ask for it.
Building on both readings now. If you rule R6 literal on (2), it is a one-line change.

## J2 · REPORT

These are things this job found in other modules and artifacts. I changed none of them.

1. **Generated artifacts made stale** (mechanics §14). `fleetbundles.test.mjs` names all four `src/observation-log/*.mjs` files as changed sources for:
   - `agent-worker/dist/agent-worker.bundled.mjs` and its `.bundle.json` (owner `agent-worker`);
   - `bio-plane/dist/bio-plane.bundled.mjs` and its `.bundle.json` (owner `not_product`).

   Regenerate them at the layer's close.
2. **legacy-tests: `capture-text-index.test.mjs`, arms C3 and C3b.** They go red with this job, on purpose. They pin that a workbook "says NONE with a REASON", which is the old "a xlsx has no indexing unit arm" answer. N134 removes that answer, because a workbook's sheets are now units (extraction R16), so its index row reads indexed. Re-anchor or retire those arms. Two other legacy suites, `observation-log.test.mjs` and `observation-content.test.mjs`, fail the same way on `origin/tranche/T10` without my change, so this job did not cause those. `nc-rec91.mjs` names `CAPTURE_TEXT_UNIT_CONTAINERS` too; I did not run it.
3. **legacy-checks: a stale comment.** The comment above `AI_LOG_NEVER_LOOKED_STORED` in `bio-checks.mjs` (about line 5114) says "until then the region below is unmarked and C-22.1 is still what that site answers". The region `is-never-looked-stored` is now marked in `checkObservation`, and that site mints C-22.17. The row's `where` now resolves.
4. **This module's requirements (yours to edit):**
   - The `not yet met: T10` marks on R3, R6, R11 and R13's N202 clause can be struck.
   - R13's other mark, "(not yet met: N39; the `sweep` and `run` arms read `capture_requests` and `ai_runs` directly)", reads as stale. Both arms go through the registered resolvers, and ai-runs and capture-requests register them.
   - R20 and R21 are built and tested here: `leadList`, and `vocabulary` on `leadRead` and `leadList`. R21's internet-frontier half is retrieval's.
5. **registerAuthority, a narrow behaviour change (N202).** A resolver that is not a function now answers membership R81's `LISTENER_MALFORMED` (with `{kind}`), where it used to answer `AUTHORITY_NOT_RESOLVABLE`. R13 names `AUTHORITY_NOT_RESOLVABLE` only for a kind outside `sweep` and `run`. The two callers, ai-runs and capture-requests, pass functions, and their suites are green.

## J3 · COMPLETE

**Entries applied** (plan: the observation-log bullet, layer 5):
- **N174.** Every place that named `queuestate.mjs` as the condition vocabulary's home now names this module: the `vocabulary.mjs` header, the `CONDITION_KINDS` block, C-22.4's detail sentence, `checkObservation`'s doc, row 3's comment and `schema.mjs`'s `condition` column comment. Queue re-exports the vocabulary from here (N114).
- **N113 (K306).** `DOCUMENT_EVIDENCE_IS_ONE_SIDED = { address: true }` is stated beside the content, meaning and internet maps, with its reason: a pre-log fetch that captured nothing left no locator. Retrieval's `frontier.mjs` already reads it, so R41 can publish the document level's sidedness.
- **N118 (its share).** `checkObservation` now mints `AI_LOG_NEVER_LOOKED_STORED` (C-22.17) for a look stating `NEVER_LOOKED`, inside the region `is-never-looked-stored`. C-22.1 keeps only its own condition, a state not in R1. `OBSERVATION_CHECK_KEYS` gains the row, read from the catalogue by reference. A run's terminal rollup is still the one exception (K148).
- **N134.** `CAPTURE_TEXT_UNIT_CONTAINERS` gains `xlsx`, `ods` and `csv`. The comment is corrected: the arm follows the producer's `sheets[]` shape, and extraction writes `sheet-range` units (its R16). The no-arm reason no longer says a workbook has no arm. `CONTENT_AXIS_STATES.indexed_none`'s sentence and the `contentAxisFor` comment are corrected to match.
- **N139 (its share), R6 as worded by K328.** `contentObservationsFor` now produces §4.2's fourth row.
  - A reading whose `text_chars` is the integer 0, whatever `read_from_text` says, and with `tier3_candidate` not true, gives one `LOOKED_ABSENT` row with condition null, on the last tier the chain evidences.
  - With pages left unread it stays `LOOKED_INDETERMINATE` (`text-undetermined`), even when `read_from_text` is true.
  - A null or absent count, a string count, and `found: false` never read as no text.
  - D-375's "no tier-3 ran" arm is not taken.
- **N202 (its share).** `registerAuthority` refuses a second resolver, and a resolver that is not a function, through membership's `listenerRefusal` (R81). Each kind is one slot held under the module that holds that authority (`sweep` capture-requests, `run` ai-runs), with `{kind}` as the extra. `AUTHORITY_NOT_RESOLVABLE` stays for any other kind, and this module no longer mints `LISTENER_DECLARED` itself.
- **Improvement (K313, K316).** The test fixture now answers at workerd's shape: `sql.exec` returns a cursor, and a LIKE or GLOB pattern over 50 bytes is refused. All tests stay green on it. The module builds no LIKE or GLOB pattern.

**Tests.**
- R3 now expects C-22.17 and keeps C-22.1 for an unknown state, with its order behind C-22.6 and C-22.9.
- R6 has a new fourth-row test. It covers the zero count through the op and through the notice, a zero count with pages unread, and the non-integer, null, absent and `found: false` controls.
- R6, R7, R8: the containers list; `xlsx`, `ods` and `csv` index `PRESENT`; `html` keeps the no-arm reason.
- R11 states the document sidedness and gives all three causes at an address.
- R13 tests `registerAuthority`: every non-resolved kind, the malformed and declared refusals through R81 naming their holder, and the first resolver kept.
- R26 includes C-22.17.

**Deferred:** none. **Other modules:** J2, which covers two stale bundles, the red C3 and C3b arms of `capture-text-index` for legacy-tests to re-anchor, a stale legacy-checks comment, and requirement marks to strike.

**Tests run:**
- `node --test bio-plane/test/m/observation-log/` gives tests 43, pass 43, fail 0, todo 0, after merging B2's R6.
- The manifest names no layer tests.
- Every module that uses observation-log: retrieval 58/0, inquiry 50/0, ai-runs 41/0, capture-requests 53/0, skills 29/0, case-authoring 38/0, monitoring 43/0 with 10 todo, queue 10/0.
- `fleetbundles.test.mjs` fails only on the two stale bundles (J2 1).
- Legacy suites naming what changed were run before and after my change. Only `capture-text-index` moved, from green to red (J2 2).

**Checks:**
- format: 69 modules, 64 requirements files; 0 failures
- architecture: 11 product files, 34 relative imports (0 naming no tracked file, not judged); 0 failures
- coverage: 1 modules, 29 of 29 live requirement ids named by a test; 0 failures
- ownership: 10 files changed by observation-log between tranche/T10 and HEAD; legacy-store: 0 line(s) added, 0 removed; legacy-checks: 0 line(s) added, 0 removed; 0 failures

Size (session_017qTNuu87xeFVykeCg51XB3): test runs 43, module lines 2806
