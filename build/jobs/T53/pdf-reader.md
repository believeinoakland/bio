# pdf-reader (T53)

**Status** · session_018Bhcefr6qakyreu8WK9cuR · depth 2 · WORKING
**Sessions** · 1

## Completion (2026-10-27)

# pdf-reader · T53 · report

## Entries applied

- **T53-41 · K5565 · English in tests.** Census for pdf-reader (`build/plan/beta/tests-sweep/CENSUS.md`, `CENSUS-RX.md`): literal sites A 0 / B 0; regex sites A 0 / B 0 / C 5 (1 file).
  - The five C sites are all in `bio-plane/test/pdfstructure.test.mjs` (lines 988, 991, 1109, 1128 twice). Each regex matches text the reader must extract from a fixture PDF (for example `/• To observe/`, `/City of Oakland Printed on /`, `/RESOLUTION CONFIRMING THE MAYOR'S APPOINTMENT OF/`, `/secure\. The TFO can then/`). This is the document's own text, the expected output of the reader, not product wording.
  - Decision: **kept as input data**. No words-table key applies, and the sentences are not in the product's words or source, so no conversion is due. No test line was changed.
  - `build/tests-english-baseline.json` has no line for a pdf-reader file (its `bio-plane/test/m/extraction/pdfstructure.test.mjs` line belongs to the extraction module), so the baseline has nothing to remove for this module.
  - Words check on the product now: `0 failures`, `testenglish 0`.

## Not done and why

- Nothing outstanding for T53-41. No code was changed, so no requirement ids moved.

## Found in other modules

- None.

**Met** · none

Tests: 201/201. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018Bhcefr6qakyreu8WK9cuR): test runs 1, module lines 5766

## Completion (2026-10-28)

# pdf-reader · T53 · report (CHANGE, BOB #327)

## Cause

A page tree whose `/Kids` array holds about 270,000 references is refused by doc-clean with "object 4 0 is referred to and cannot be read". The file is well formed. The cause is the direct-object bound (`pdf.direct_object`, 4 MiB, R47): the array's text passes 4,194,304 bytes, so `objects()` leaves object 4 absent (`unresolved: [{num:4, gen:0}]`) and the reader states `over_bound:direct_object:4194305:4194304`. The count alone is not the bound: 270,000 references at about 9 bytes each are about 2.4 MB, under it. Such a file passes only when its array text is under 4 MiB, so the file must carry about 16 bytes per reference.

Not the cause: the object bound (2,000,000) and the operands bound (65,536), neither reached.

## What changed

- `bio-plane/test/m/pdf-reader/bounds.test.mjs`: new R47 test. A 270,000-reference page-tree array with indentation, text past the bound. It checks that openPdf states `over_bound:direct_object:4194305:4194304`, that `resolve` answers null for object 4, and that `objects()` names `{num:4, gen:0}` as unresolved. 9/9 in the file pass.
- No code change. The reader already complies with R47 ("absent and stated"). The refusal names no bound, because the stated reason sits in `doc.notes` and `unresolved` carries only `{num, gen}`.

## Found in other modules

- `doc-clean/pdf.mjs` (lines 42-44 and 61): its refusal reads only `read.unresolved`, so the user sees "cannot be read" and not the bound. Its owner must read `doc.notes` for the `over_bound:` reason, or the reader must carry it.
- `pdfstructure.mjs` `extractPdfStructure`: a 270,000-page file (21 MB) answers `TOO_LARGE_TO_READ`, need 1,665 MB against `pdf.need_mb` 100. Not a defect of this change, but the same file shape also trips the estimate, so a BOB decision is needed on it too.

## Decisions for Bob

1. **Refuse (current behaviour, stated).** Keep the 4 MiB direct-object bound. Option: an R37 wording change so `unresolved` entries carry the bound. Proposed R47 wording (additive): "A reference that cannot be read because of the direct-object bound is listed in `unresolved` with `over: "direct_object"` and the figure `4194304`."
2. **Read it.** Raise `pdf.direct_object` (BOB's figure) so arrays of this size are read. Costs: a bigger parse window per direct object, memory to be measured.

Recommendation: option 1 now (the reason reaches the user through doc-clean's job), with option 2 decided on the measured memory.

**Met** · none

Tests: 202/202. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018Bhcefr6qakyreu8WK9cuR): test runs 2, module lines 5766
