# structured-text-reader — requirements

**Status** · New in T53 (N1266; K5435, K5427, K5439): a layer-1 reader module, BOB's packaging of the structured text kinds Bob ruled into the beta (K5435), placed after `ooxml` and before `mail-reader` and `format-registry` in `modules.json` (`build/plan/beta/planning/CONSISTENCY.md` §2 row 10). Marked not yet met (T53); nothing is built. Lines from `build/plan/beta/files/REQ-readers-beta.md` SR1–SR7 (same ids), R8–R10 drafted by the worker.

## Public

### Purpose

Reads the structured text kinds that are not tables or documents (JSON, NDJSON, XML, SVG, KML and KMZ, GeoJSON, calendar, contact and caption files) in byte windows to the text bound, keeping each value's structure so a unit can be found and cited by its path, and reading as far as a malformed file parses. It runs in a Worker, holds no record and writes nothing; it fetches and runs nothing a file names.

### Provides

- **R1** (T53; N1266; K5435; `build/plan/beta/files/REQ-readers-beta.md` SR1) Reads JSON, NDJSON, XML, SVG, KML, GeoJSON, ICS, VCF, SRT and VTT in byte windows with a carry, to 100 MB (K5427; `runtime-limits` R37's text row, quoted through `boundOf`), the encoding (UTF-8, UTF-16 with or without BOM, windows-1252, ISO-8859-x) carried in the cursor and shown. Test: a generated 100 MB file of each reads whole; the last record's token is found; a file at 100 MB + 1 is refused with its size.
- **R2** (T53; N1266; K5435; `build/plan/beta/files/REQ-readers-beta.md` SR2) Text units keep their structure: a JSON path, an XML element path, a KML placemark name, a calendar event's summary, start and attendees, a caption's start time. A unit is addressable in a citation by that path. Test: a value deep in a JSON file is found and cited by path; an ICS event is found by its summary and cited by its date.
- **R3** (T53; N1266; K5435; `build/plan/beta/files/REQ-readers-beta.md` SR3) KML and KMZ: placemark names, descriptions and extended data are read; coordinates are kept as data on the unit. GeoJSON: each feature's properties are read and its geometry type and bounding box are kept. No map is drawn (a CAPABILITIES matter). A KMZ's KML is read through the archive route (`ooxml`'s member listing and cut, `listArchive` and `streamMember`). Test: a parcels GeoJSON's property is found; a KMZ's placemark found.
- **R4** (T53; N1266; K5435; `build/plan/beta/files/REQ-readers-beta.md` SR4) SVG: text elements and titles are read; scripts and external references are never run or fetched. Test: an SVG with a `<script>` and an external image: text found, nothing fetched.
- **R5** (T53; N1266; K5435; `build/plan/beta/files/REQ-readers-beta.md` SR5) A malformed file is read as far as it parses and the rest stated ("stopped at line N"), never dropped and never claimed whole. Test: a JSON file broken at 40 %: 40 % read, the break stated.
- **R6** (T53; N1266; K5435; `build/plan/beta/files/REQ-readers-beta.md` SR6) Each step's cost is bounded by bytes decoded; no quadratic scan. Test: a 100 MB single-line JSON and a deeply nested XML (depth 10,000) finish within the step budget; nesting deeper than 1,000 refuses the file whole, naming the limit (K5439; `runtime-limits` R37's nesting rows).
- **R7** (T53; N1266; K5435; `build/plan/beta/files/REQ-readers-beta.md` SR7) A calendar file of more than 100,000 events is refused whole with the limit named (K5439; `runtime-limits` R37's calendar row). Test: 100,001 events refused naming 100,000.
- **R8** (T53; N1266; K5435; `format-registry` R33–R35 and Uses say each new reader exports its own registry entry; drafted by the worker from them and from the reader contract of `reading-pipeline` R45; BOB reviews) **The module exports one registry entry for each format it reads.** `json`, `ndjson`, `xml`, `svg`, `kml`, `kmz`, `geojson`, `ics`, `vcf`, `srt` and `vtt`, each in `format-registry`'s entry shape (`format`, `detect(bytes, contentType)`, `parts`, `structure`, `text`; its R1–R5), which `format-registry` registers unmodified (its R33). Each `detect` answers by content as `format-registry` R34 and R35 require (a valid text in a known encoding, then the leading structure: `BEGIN:VCALENDAR`, numbered cues, one JSON object per line), never by extension alone; each entry reads over a range source `{size, readRange(offset, length)}` in windows with a carry (`reading-pipeline` R45's `plan(source)` and `read(source, cursor, budget)`), never loading the file whole. Test: for each format a generated small sample is answered with that `format` by `detect`; a PNG renamed `.json` is not; a window boundary falling inside a multi-byte character, a UTF-16 pair and a quoted string reads the same units as the whole text. Control: a text that merely mentions `BEGIN:VCALENDAR` after its first lines is not `ics`.

## Private

### Uses

- `ooxml`: `listArchive` and `streamMember` (R3: a KMZ's KML is read through the archive route), `decodeText` (R1: the encoding carried in the cursor and shown).
- `runtime-limits`: `READ_BOUNDS`, `boundOf(kind, name)` and `statement` for every ceiling this module keeps (R1, R6, R7, R9).
- `test-support` for tests (generated files at the sizes of R1).
- `setup-words`: `word`, `localize` (the words rule: a sentence people read is read by key; K3930, K3943, K3949).

### Invariants

- **R9** (T53; K4835 (1); drafted by the worker on the convention of `doc-clean` R12 and `runtime-limits` R31) No numeric literal in this module's code is a ceiling it keeps (the 100 MB text bound, the nesting depth 1,000, the 100,000 events): each is read from `READ_BOUNDS` through `boundOf`, and a test reads the module's source and finds none.
- **R10** (T53; K5435; drafted by the worker, as the other readers' invariants) Pure: no store, no network, no clock; nothing in a file is run or fetched (a script, an external reference, a linked image: R4). No place is named in this module's code or in any refusal text. Every "no" says which kind of no and why.

### Satisfies

- K5435 (the beta's list of types), K5427 (text to 100 MB), K5439 (the protective limits: nesting 1,000, 100,000 events), K4628 (a file read whole, searchable and citable at its place).

### Suggestions

- Reader choice and licences are GAP-3.0's. Whether this module also takes `text` and `html` or leaves them where they are is the draft's open point 2 (BOB's or PLANNING's placement): until it is placed, the module reads only the kinds R1 lists.
