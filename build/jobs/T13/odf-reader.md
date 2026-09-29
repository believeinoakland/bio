# odf-reader (T13)

**Status** · session_012x3jt5MEsquz9cY3RyQESF · depth 2 · WORKING · handled B0

## J1 · QUESTION

R45 bounds units (cells given at addresses, hidden row ranges, `text:c` spaces), and also says the reader "never ends in `reader_failed` for a repeat's size". Those two clauses conflict for one case: a repeated cell's own TEXT is copied into the output at every address, and that copy costs no unit as worded. A cell holding 20,000,000 literal characters (inside the 20 MiB bound), repeated across 27 columns, is 27 units, but `text()` joins 540 million characters and V8 throws `RangeError` (its string limit is about 2^29). That ends in `reader_failed`. A 1,000-character cell repeated 262,144 times (262,144 units, allowed) costs 262 MB of text.

**My best reading, which I am building now:** keep R45's units exactly as worded (BOB's four bound tests stand as given). Also bound the characters a repeat copies, by the parity argument BOB's measurement already makes: repeats may produce no more text than the COFF-6 bound admits written out. A repeated cell's displayed text, given at each address after its first, counts its characters against `MEASURED_OOXML_TEXT_BOUND_BYTES` (20,971,520). Past that, the same `over_repeat_bound` answer applies, with the marker `{text:"undetermined", why:"over_repeat_bound", units:<chars reached>, bound:20971520, boundName:"MEASURED_OOXML_TEXT_BOUND_BYTES", metric:"repeated_text_chars"}`. `text:c` spaces count as R45 says, once per expansion. A cell given at N addresses expands its text N times, so its spaces cost N times.

If BOB prefers another rule (for example one unit per copied character, which would make a text cell repeated 262,144 times cost more than one unit per address and break the 262,144-columns test), I will bring the code in line. R45's wording would need the second metric either way. Everything else in N30 does not depend on this.

## J2 · QUESTION

**Replaces J1.** Same question, plus one more case of the same kind.

R45 bounds units (cells given at addresses, hidden row ranges, `text:c` spaces) and also says the reader "never ends in `reader_failed` for a repeat's size". Two things a repeat copies cost nothing as worded, so hostile bytes inside the 20 MiB bound can still fail:
1. **A repeated cell's text.** It is copied into the output at every address. A cell holding 20,000,000 literal characters repeated across 27 columns is 27 units, but `text()` joins 540 million characters and V8 throws `RangeError` (its string limit is about 2^29), which ends in `reader_failed`.
2. **A repeated cell's links.** R17 attaches each at every address, and R45 lets them ride free on the cell. A cell with 10,000 `<text:a>` (about 400 KB) repeated 262,144 times makes 2.6 billion link records, which exhausts the heap. That is worse than `reader_failed`.

**My best reading, which I am building now:** R45's units stay exactly as worded, so BOB's four bound tests stand as given, with two additions:
- (a) **Copied text** is bounded by the parity argument BOB's measurement already makes: repeats produce no more text than the COFF-6 bound admits written out. A repeated cell's displayed text, at each address after its first, counts its characters against `MEASURED_OOXML_TEXT_BOUND_BYTES` (20,971,520). Past that, the answer is the same `over_repeat_bound`, with marker `{text:"undetermined", why:"over_repeat_bound", units:<chars reached>, bound:20971520, boundName:"MEASURED_OOXML_TEXT_BOUND_BYTES", metric:"repeated_text_chars"}`.
- (b) **A link at a repeated address after its first** costs one unit of `ODF_REPEAT_EXPANSION_MAX`, like the cell that carries it. The link at the cell's first address stays free, since it is literal markup.

`text:c` spaces cost once per expansion. A cell given at N addresses expands its text N times, so its spaces cost N times.

R45's wording would need both additions. If BOB prefers other rules, I will bring the code in line. Everything else in N30 does not depend on this answer.
