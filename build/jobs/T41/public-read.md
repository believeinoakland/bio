# public-read (T41)

**Status** · session_01GmwKwFGVsgqKaYYdEX3pJa · depth 2 · WORKING · handled B2

## J1 · QUESTION

Two readings of R3's `label_key` (T41-38), building on both meanwhile:

(1) **Marked.** R3 says `photo.obscured.label` for a photo's copy "whose signed `label` is not null or whose row states it marked". From T40 an unmarked photo's copy is signed with case-carriage's `PUBLISHED_LABEL`, which is not null, so read literally every T40+ photo would key `photo.obscured.label`. My reading: "marked" exactly as `case-grammar` R12 reads it: `obscured_marked` when the row states it, else by the label (not null = marked), so T40+ rows go by `obscured_marked` and earlier rows by their label. `photo.published.label` otherwise. Until case-grammar's merge I read `marked` from `materialsOf`'s `obscured.marked` when present, else the raw row's `obscured_marked`, else the label.

(2) **Photo or member document.** Nothing in a `materials:` row tells a photo's copy from a member document's cleaned copy (case-grammar's own `complete.mjs` says so and reads the copy's bytes), and `publishedCase` is a synchronous read over the published projection with no bytes in reach. My reading: a copy whose signed label is word for word `case-carriage`'s `COPY_CLEANED_LABEL` (R15; every member document's copy carries it, never a photo's) keys `document.cleaned.label`; every other copy is a photo's. That adds the edge public-read → case-carriage (`COPY_CLEANED_LABEL` only; case-carriage precedes public-read in layer 8 and does not use it), which I will record in my final `uses`. Alternative if you prefer no new edge: case-grammar exports a predicate — another module's change, not mine.
