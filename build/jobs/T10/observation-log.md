# observation-log (T10)

**Status** · session_017qTNuu87xeFVykeCg51XB3 · depth 2 · WORKING · handled B1

## J1 · QUESTION

R6 (N139), the fourth row. Two readings of "a reading that read from text whose `text_chars` is 0":
(1) Extraction's reader DECLINES empty text, so a scan read to nothing arrives `read_from_text: false` with `text_chars: 0` (R60 puts the counts on every reading whose provenance digested a text, `pipeline.mjs` 1063). Read literally ("read_from_text true and text_chars 0"), the row has no producer. My reading: "read from text" means a text was handed to the reader, i.e. `text_chars` is the integer 0, whatever `read_from_text` says. Only an integer 0 counts; null, absent and `found: false` never do.
(2) With `tier3_candidate` (pages left unread, D-418), a zero count is not "the document has no text". D-375's built work (`land/worker/D-375`) answers LOOKED_INDETERMINATE `text-undetermined` there, and also where no image-reading tier ran. R6 says one LOOKED_ABSENT row. My reading: LOOKED_ABSENT whenever `text_chars === 0` and `tier3_candidate` is not true. A zero count with pages left unread stays row 3 (LOOKED_INDETERMINATE, `text-undetermined`), because a page nobody read is not a page with no text. I am not taking D-375's "no tier-3 ran" arm, since R6 does not ask for it.
Building on both readings now. If you rule R6 literal on (2), it is a one-line change.
