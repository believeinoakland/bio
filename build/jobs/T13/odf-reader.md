# odf-reader (T13)

**Status** · session_012x3jt5MEsquz9cY3RyQESF · depth 2 · COMPLETE · handled B0

## Completion

**Applied** (N30, on `tranche/T13` at ff11386715):
- **R45**: `ODF_REPEAT_EXPANSION_MAX` = 262,144 is exported. Each `structure()`/`text()` is one `content.xml` read on its own meter, and every expansion is paid for before it is made: one unit per cell given at an address (column repeat × row repeat), per hidden row range, and per `text:c` space each time its text is given. The read that would cross the bound stops, and the entry answers as over the size guard with the marker `{text, why:"over_repeat_bound", units, bound, boundName:"ODF_REPEAT_EXPANSION_MAX", metric:"expanded_repeat_units"}`, `units` one past the bound. The same shapes apply as for the guard (R10, R13, R20, R27): `evidentiary.undetermined` carries `{part:"content.xml", why:"over_repeat_bound", guard:<marker>}`, and the notes name the bound. `meta.xml`, the manifest's `intra` links and `images` are still answered, and `odfEvidentiaryDigest` is unchanged.
- **J2, built on my best reading pending BOB's answer:** a link at a repeated address after its cell's first costs one unit, and a repeated cell's text copied at each address after its first counts its characters against `MEASURED_OOXML_TEXT_BOUND_BYTES`. Past that, the marker is the same with `boundName:"MEASURED_OOXML_TEXT_BOUND_BYTES", metric:"repeated_text_chars"`. Without these, 27 copies of a 20 MB cell ended in `RangeError` and a many-link cell repeated could exhaust the heap. If BOB rules otherwise, a `CHANGE` brings it in line (the code is `spend`/`spendChars` in `walkSheet`).
- **R16**: hidden rows are `{min, max, visibility}` ranges, one per `<table:table-row>`, never expanded; `count` counts ranges. A collapsed run of a million empty rows is one range and one unit.
- **R41**: R45's `over_repeat_bound` is a stated "not read" branch on all three entries, and is tested.

**Improvements in my own module:**
- `meta.xml` is expanded on its own meter. A hostile `meta.xml` (`text:c="2000000000"`) used to fail the whole package as `reader_failed`; it is now stated as `{part:"meta.xml", why:"over_repeat_bound"}` and `content.xml` still reads.
- `structure()` no longer expands paragraph text (`.odt`) or shape text (`.odp`) it never emits. So each read pays for a space once, and `structure()` does less work.
- `walkSheet` reads a carrying cell's text and links once per element, not once per repeated column.

**Marks my work meets** (for BOB to strike): R16's `*(not yet met: N30)*`, R45's `*(not yet met: N30)*`, R41's `*(not yet met: N30)*`, and the status line's "N30 … not yet met". R45's wording would need J2's two additions if BOB takes them.

**Deferred.** None.

**Found in other modules (reported to BOB, J3):**
- **legacy-tests**: `bio-plane/test/formats-odf.test.mjs:461` pins the old R16 shape (`rows: [3]`) and now fails 1 of 171 (it wants `["Appropriations",[3]]` and gets `[{"min":3,"max":3,"visibility":"collapse"}]`). It passes on `tranche/T13`. It needs re-anchoring to R16's ranges; it is legacy-tests' suite, not edited.
- **Generated artifacts made stale** (not rebuilt): `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`, carries `src/odf.mjs`) and `agent-worker/dist/agent-worker.bundled.mjs` (its manifest lists `../bio-plane/src/odf.mjs`). The pdf-worker and ocr-worker bundles do not carry `odf.mjs`, so they are unaffected.

**Tests and checks:**
- `node --test test/m/odf-reader/` (from `bio-plane/`): 57 tests, 57 pass, 0 fail. The new suite is `repeats.test.mjs` (R45 at the bound: 262,144 columns read and 262,145 refused; 512×512 against 512×513; `text:c="2000000000"` on all three entries; a hidden run as one range and one unit; spaces, link copies and copied text each at their bound; outside content.xml still answered). R16 and R41 are extended, and R43's export list gains `ODF_REPEAT_EXPANSION_MAX`.
- Users of the module: `node --test test/m/format-registry/ test/m/capture/`: 97 tests, 97 pass, 0 fail.
- Legacy `node test/formats-odf.test.mjs`: 170 pass, 1 fail (above); 171 pass on the base.
- `node checks/format.mjs`: 69 modules, 64 requirements files, 0 failures. `architecture.mjs … odf-reader`: 9 product files, 34 relative imports, 0 failures. `coverage.mjs … odf-reader`: 45 of 45 live requirement ids named by a test, 0 failures. `ownership.mjs … odf-reader tranche/T13`: 5 files changed, 0 failures.

Size (session_012x3jt5MEsquz9cY3RyQESF): test runs 11, module lines 2258

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

## J3 · REPORT

Two items outside my module, from N30 (details in my record's Completion):
1. **legacy-tests**: `bio-plane/test/formats-odf.test.mjs:461` pins the old R16 shape (`hRows.rows` = `[3]`). With R16's ranges it now fails 1 of 171: it gets `[{"min":3,"max":3,"visibility":"collapse"}]`. It passes on `tranche/T13`. It needs re-anchoring to R16's range shape. Not edited: it is legacy-tests' suite.
2. **Generated artifacts made stale** (not rebuilt): `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`) and `agent-worker/dist/agent-worker.bundled.mjs`. Both carry `src/odf.mjs`. The pdf-worker and ocr-worker bundles do not carry it.

## J4 · COMPLETE

N30 applied: R45 (`ODF_REPEAT_EXPANSION_MAX` = 262,144, exported; `over_repeat_bound` answered as over the size guard on all three entries), R16 (hidden rows as `{min, max, visibility}` ranges) and R41's new branch. Every bound test from B1 passes at its bound. J2's two additions (link copies cost a unit; copied text bounded by the COFF-6 figure) are built on my best reading. If you rule otherwise, a CHANGE brings them in line. Marks for you to strike: R16, R41 and R45's `(not yet met: N30)`. Tests: odf-reader 57/57; format-registry and capture 97/97; legacy formats-odf 170/171 (J3). Checks: format, architecture and ownership 0 failures; coverage 45/45. Record: `build/jobs/T13/odf-reader.md`, Completion.
