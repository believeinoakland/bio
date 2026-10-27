# Requirement draft: the beta's new readers (light kinds in Workers; heavy kinds to the container client)

**Status** · Placement per K5448: `reader-container`, `structured-text-reader`, `mail-reader` are new layer-1 modules, readers after `ooxml` and before `format-registry`, `mail-reader` after `structured-text-reader`; the container unpacks archives and `control-plane` only routes (T52-85); N824 files email through `mail-reader`. READY for PLANNING (FILES #1, F3, 2026-10-27), with the open points at the end. Drafts lines for new `structured-text-reader` and `mail-reader`, and the additions the container client (`reading-pipeline`, `office-readers`, `acquisition`) takes in GAP-3.x. BOB writes the lines (P17). Bounds are SIZES-N1267.md. Each line ends with its Test. All readers use the reader contract of GAP-1.8 (`plan(source)`, `read(source, cursor, budget)` over `{size, readRange}`).

## New module: `structured-text-reader` (layer 1; uses `ooxml`, `setup-words`, `runtime-limits`, `test-support`)

- **SR1** Reads JSON, NDJSON, XML, SVG, KML, GeoJSON, ICS, VCF, SRT and VTT in byte windows with a carry, to 100 MB (K5427), the encoding (UTF-8, UTF-16 with or without BOM, windows-1252, ISO-8859-x) carried in the cursor and shown. Test: a generated 100 MB file of each reads whole; the last record's token is found; a file at 100 MB + 1 is refused with its size.
- **SR2** Text units keep their structure: a JSON path, an XML element path, a KML placemark name, a calendar event's summary, start and attendees, a caption's start time. A unit is addressable in a citation by that path. Test: a value deep in a JSON file is found and cited by path; an ICS event is found by its summary and cited by its date.
- **SR3** KML and KMZ: placemark names, descriptions and extended data are read; coordinates are kept as data on the unit. GeoJSON: each feature's properties are read and its geometry type and bounding box are kept. No map is drawn (a CAPABILITIES matter). A KMZ's KML is read through the archive route. Test: a parcels GeoJSON's property is found; a KMZ's placemark found.
- **SR4** SVG: text elements and titles are read; scripts and external references are never run or fetched. Test: an SVG with a `<script>` and an external image: text found, nothing fetched.
- **SR5** A malformed file is read as far as it parses and the rest stated ("stopped at line N"), never dropped and never claimed whole. Test: a JSON file broken at 40 %: 40 % read, the break stated.
- **SR7** A calendar file of more than 100,000 events is refused whole with the limit named (K5439). Test: 100,001 events refused naming 100,000.
- **SR6** Each step's cost is bounded by bytes decoded; no quadratic scan. Test: a 100 MB single-line JSON and a deeply nested XML (depth 10,000) finish within the step budget; nesting deeper than 1,000 refuses the file whole, naming the limit (K5439).

## New module: `mail-reader` (layer 1; uses `ooxml`, `structured-text-reader`, `setup-words`, `runtime-limits`, `test-support`)

- **ML1** EML: headers (from, to, cc, date, subject, message-id), the body (plain text, else the HTML cleaned), decoded from every transfer and character encoding. Test: quoted-printable, base64, a UTF-16 body, an HTML-only message.
- **ML2** MSG: read from its compound container (OLE), the same fields. Test: a generated MSG with body and attachment.
- **ML3** MBOX: split into messages by streaming, never loaded whole; each message a member read as EML; a mailbox of more than 100,000 messages is refused whole with the limit named (K5439). Test: a generated 500 MB mailbox reads every message once, a token in the last message found; a 100,001-message mailbox refused naming 100,000.
- **ML4** Each attachment is a member filed as its own capture with its own job, linked to its message; nested messages (an attached EML) to depth 3. Test: a message with a PDF, an XLSX and an inner EML: three members, each read.
- **ML5** Headers are searchable and cited as headers; remote content (images, tracking links) is never fetched. Test: a message with a remote image: no request made.
- **ML6** Email capture (N824) and forwarding use this reader; a forwarded message and an uploaded one of the same bytes are the same document (one whole sha). Test: the same bytes by both ways give one record.

## Container client additions (GAP-3.2 to 3.6; the container is `reader-container`)

- **CC1** Legacy and macro Office: `.doc`, `.xls`, `.ppt`, RTF read after conversion by the container reader to an open format, then by the existing parsers; the original is kept whole and cited; units carry the same kinds (footnote, comment, notes). `.xls` stops at its format's 65,536 rows a sheet. Test: the portal's old Excel releases, a generated `.doc` with a footnote, an RTF with a table.
- **CC2** Macros are never run: conversion runs with macros disabled and no external links followed; a macro's presence is stated on the document page. Test: a document whose macro writes a file: no file written, macros stated.
- **CC3** Images: JPEG, PNG, TIFF (every page of a multi-page file), HEIC, HEIF, AVIF, GIF (first frame), WebP, BMP and JPEG 2000 are decoded to OCR-ready frames, turned upright, within 50 MB and the pixel limit. Test: each type's sample read by OCR; a sideways photo read upright; a 40-page TIFF gives 40 pages.
- **CC4** (K5448 (2)) The safe picture is `file-safety`'s one redraw (A4): `image-cover` redraws JPEG and PNG; the container decodes every other image type to pixels and the same redraw and the `PHOTO_FACTS` table apply. This module adds no second redraw; it returns the decoded pixels and the facts the container can read (time, place, orientation) to that path. Test: a HEIC and a TIFF photo give the same safe picture and facts as the same photo as a JPEG. (Load: LOAD-PER-TYPE M14.)
- **CC5** Archives: ZIP, TAR, GZ, 7z open as streams within 500 MB uploaded, 2 GB unpacked, depth 3, 10,000 members, ratio 1,100; RAR is refused by name; each member is its own capture and job; an encrypted member is stated. A single-file `.gz`/`.bz2`/`.xz` is a one-member archive. Test: a 500 MB ZIP, a depth-4 ZIP (refused, stated), a ratio bomb (refused), a TAR.GZ.
- **CC6** A file of any kind over its bound is refused with its size and the limit in plain words, before any read (plan step). Test: each kind at bound + 1.

## Suggestions (bind nothing)
Reader choice and licences are GAP-3.0's; LibreOffice for conversion, libvips for images, libarchive or 7-Zip for archives, an OLE parser for MSG; none asserted here.

## Open points
1. Protective limits set by BOB (K5439): 100,000 messages a mailbox; JSON/XML depth 1,000; 100,000 events a calendar file; archive depth 3 and 10,000 members.
2. Whether `structured-text-reader` also takes `text` and `html` or leaves them where they are (a BOB or PLANNING placement).
3. N1267a (XLSX cells by window) before any workbook bound above 250,000 cells.
