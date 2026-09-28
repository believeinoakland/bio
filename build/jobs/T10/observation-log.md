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
