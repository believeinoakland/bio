# structured-text-reader (T53)

**Status** · session_018BhcedH8QG1p1M2ABfYXVF · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-28)

**Entries applied** · T53-35 (N1266; K5435): the new module `structured-text-reader`, at `bio-plane/src/structured-text-reader/` (index, window, limits, detect, json, xml, lines) with its tests at `bio-plane/test/m/structured-text-reader/` (44 tests; R1's 100 MB reads in `r1-large-a` and `r1-large-b`, about 50 s together). It has eleven registry entries, `STRUCTURED_TEXT_ENTRIES` (json, ndjson, xml, svg, kml, kmz, geojson, ics, vcf, srt, vtt), each in format-registry's shape with `plan(source)` and `read(source, cursor, budget)` over `{size, readRange}`. Each entry detects by content (`certain`); a declared type is asked only when no bytes are given (`likely`). Streaming parsers for the JSON, XML and line families each look at every character once and carry their state in an opaque cursor. Ceilings come from `runtime-limits` through `boundOf` (`text.bytes`, `text.nesting`, `text.calendar_events` (K5578), and `xml.tag`).

**Readings taken (BOB's to confirm)**
- `budget.objects` is a cap on the units one step writes; it is checked between windows. `budget.bytes` caps the bytes a step decodes, give or take one character.
- A KMZ is read in one step: its KML member is streamed through `ooxml.listArchive` and `streamMember` and never held whole, but a deflate stream cannot resume from a cursor. Its member is bounded by the text bound.
- Nesting over the limit and events over the limit answer `{ok:false, failure:"final", whole:true}` on the step that finds them. Units from earlier steps of the same read are void, which is the caller's to drop.
- A malformed file ends with `final.whole:false` and `final.stopped {line, why, detail}`, and `counters.skipped` is 1.
- The `text` slot answers `{ok, container, text, units, encoding, whole, stopped, facts, images:[], metadata:null, active, undetermined, counts}`.

**Not done** · nothing. The `runtime-limits` rows (K5602) and the `modules.json` row (K5578 (1)) are on the tranche and merged.

**Found in other modules**
- `setup-words`: 22 new `structured-text.*` sentences make `rows.mjs` and `words-unreviewed.json` stale. Its regenerate command at the merge picks them up.
- `format-registry`: register `STRUCTURED_TEXT_ENTRIES` unmodified (its R23, R33). `kmz.detect` is synchronous (`ooxml.readContainer`) and answers only over bytes that hold the central directory. A head-only buffer answers null, so a large KMZ needs the tail read (its R32).
- `reading-pipeline`: these entries carry `plan`/`read` (its R45); its own wiring of them is its job.
- `mail-reader`: the window helpers are exported for its bodies (`sniffEncoding`, `alignedLength`, `decodeWindow`, `bytesSource`, `HEAD_BYTES`, `WINDOW_BYTES`).

**Met** · R1, R2, R3, R4, R5, R6, R7, R8, R9, R10

Tests: 44/44. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcedH8QG1p1M2ABfYXVF): test runs 1, module lines 1511
