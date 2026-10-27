# What each file type adds to a team's record and to the container (for PLATFORM, via BOB)

**Status** · READY with unmeasured cells marked (FILES #1, F5, 2026-10-27). Answers MAP.md §2 "the record size and load each capability adds at each service level" and BOB #321's relay. **Every figure is marked: M = measured (source named), D = derived by arithmetic from M, U = unmeasured, with the measurement that would fill it.** I assert no figure that is not one of these. Local figures (spikes, a shared 4-core box) are indicative only; live figures are stage 0's (account `20b53357…`).

## 1. Measured figures this table rests on

| id | figure | source |
|---|---|---|
| M1 | A Worker or Durable Object dies at about 256 MiB of buffers (not 128); one buffer ≤ ~128 MiB; a step shares that | stage0 P-M2, P-M16 (live) |
| M2 | CPU: 30 s default; `cpu_ms` raises it (300 s tried); each retry and each chained alarm gets a fresh budget | stage0 P-M5 (live) |
| M3 | SQLite landing: 1 KB rows with 1 index, ~1.4 KB stored per row; ~28 to 58 ms per 1 MB batch (3 indexes: 30 to 72 ms, ~1.45 KB); a write blocks the object for its duration | stage0 P-M9 (live) |
| M4 | A byte pass with streaming SHA-256 and CRC in JavaScript: ~22 ns/byte (2.3 s per 100 MiB) with 64 MB of heap | spikes R (local) |
| M5 | csv-reader (the alpha's Workers reader): ~31 MB above idle for a 20.9 MB body; dies from 17.75 MiB | K4652 (live-shape) |
| M6 | Native PDF text: 1.3 ms/page, 17.5 MB peak (poppler); 1.8 ms/page, 10 MB (mupdf); both take a page range | spikes N (local) |
| M7 | Native OCR (Tesseract 5.3.4, `eng`): 5.0 s dense page, 1.45 s sparse third; 146 MB peak (55 MB sparse); threads do not help; 4 processes ≈ 1.4 s/page effective on 4 cores; wasm engine 6.7 to 7.9 s dense, 295 to 327 MB | spikes N (local) |
| M8 | Rendering a page at 300 dpi to PNG: 1.31 s, 50 MB; to grayscale: 42 ms, 34 MB | spikes N (local) |
| M9 | LibreOffice: ~1.2 to 4 s per file and ~220 MB floor per process (200-paragraph .docx 1.85 s/219 MB; 20,000-row .xlsx to CSV 4.0 s/221 MB) | spikes N (local) |
| M10 | 7z listing a 92 MB zip of 300 members: under 10 ms, 6 MB; extracting one member: under 10 ms, 6 MB | spikes N (local) |
| M11 | libvips thumbnail of a 48-megapixel JPEG: 0.16 s, 43 MB; ImageMagick full convert of the same: 9.3 s, 388 MB | spikes N (local) |
| M12 | Text density used: a dense text page ≈ 6,700 characters | spikes N |
| M13 | Container cold start, idle cost, R2 to container: **not measured** (P-M17 not run) | stage0 |

## 2. Per type

"Held" = bytes in R2 (always the whole original). "Units" = text units landed in the team's record (SQLite), by rule (M3): **about 1.4 to 1.5 times the extracted text's size**, D. Extracted text ≈ the visible text; dense page ≈ 6.7 KB (M12), so units ≈ **9 to 10 KB per dense page, less for ordinary pages**, D. A reading's index adds the rows of M3's 3-index case.

| type (route) | held | units added to the record | load: CPU and memory | status |
|---|---|---|---|---|
| **PDF text layer** (container, native) | file size | ≈ 9 to 10 KB/dense page; 5,000 dense pages ≈ 45 to 50 MB | extraction ≈ 1.3 ms/page, ≈ 18 MB (5,000 pages ≈ 6.5 s) | M6, D; container itself U (M13) |
| **PDF scanned, OCR** (container) | file size | same as text for the pages read | render ≈ 1.3 s (to PNG) or 42 ms (gray) + OCR 1.5 to 5 s/page, ≈ 55 to 150 MB; 5,000 pages ≈ 2 to 7 h on one process, ≈ 1.9 h on 4 | M7, M8; width and cost U (P-M11, M13) |
| **DOCX, PPTX, ODT, ODP** (JS now, container later) | file size | ≈ 1.4 to 1.5 × visible text, plus its parts (notes, comments) as units | JS reader in Workers: U per MB (to measure on DOCS corpus); container: parsers streaming, U | U |
| **DOC, PPT, RTF, XLS** (container, LibreOffice) | file size | as the converted format | ≈ 1.2 to 4 s and ≈ 220 MB per file (floor) | M9 (small files); large-file scaling U |
| **XLSX, XLSM, ODS** (JS now, container later) | file size | rows of text indexed in pieces (K4636) + cell access points: ≈ 1.4 to 1.5 × text of all cells; cells interpreted only when opened or cited | JS: held-cell cost U; LibreOffice to CSV 20,000 rows 4 s/221 MB | M9, D; 1M-row scaling U |
| **CSV, TSV** (Workers) | file size | ≈ 1.4 to 1.5 × text size; a 50 MB CSV ≈ 70 to 75 MB | alpha: ~31 MB above idle per 21 MB (M5), dies near 17.75 MiB; beta windowed reader U | M5; beta U |
| **text, JSON, NDJSON, XML, SVG, KML, GeoJSON, ICS, VCF, SRT, VTT** (Workers, windows) | file size | ≈ 1.4 to 1.5 × text size; a 100 MB file ≈ 140 to 150 MB of units | byte pass floor 22 ns/B (100 MB ≈ 2.3 s) before parsing (M4); parse cost U | M4, D; parse U |
| **HTML, MHTML** (Workers) | file size | ≈ 1.4 to 1.5 × cleaned text (much less than the HTML) | streaming cleaner U | U |
| **Images, OCR** (container, libvips + Tesseract) | file size | OCR text only (small; a page of text ≈ 9 to 10 KB) | decode: shrink-on-load 0.16 s/43 MB for 48 MP; full decode memory ≈ pixels × 3 bytes (48 MP ≈ 144 MB raw), D; OCR as above | M11, M7, D; full-decode time U |
| **TIFF multi-page** | file size | per page as scans | per page as OCR; page count up to 5,000 | as scans |
| **Photo redraw (DEC-460 A4)** | original + safe picture (≈ the original's size, D) | metadata fields only (time, place, orientation: < 1 KB) | **U**: a full-resolution decode and re-encode, not a shrink-on-load; memory ≥ pixels × 3 bytes if held whole, so streaming is required above ~40 MP; time U | U: measure 12, 24, 48 MP JPEG and HEIC |
| **EML, MSG** (Workers / container) | file size | headers + body text ≈ 1.4 to 1.5 × text; attachments are their own documents (their rows) | small; U | U |
| **MBOX** (Workers stream) | file size (up to 500 MB) | per message as EML; ≤ 100,000 messages (K5439) | byte pass 22 ns/B (500 MB ≈ 11 s) + per-message parse U | M4, D |
| **ZIP, TAR, GZ, 7z** (container) | file size; each member its own document | listing: one row per member (≤ 10,000, K5439) of small size; members as their own types | list 6 MB, < 10 ms; extract one member < 10 ms; streaming 2 GB unpacked: U | M10; large unpack U |
| **Held and named** (Tier 4) | file size | one row: name, type name, details (≈ 1 to 2 KB, D); no units | safe-grade by head and tail range reads only, no read | D |
| **Refused** | none | none | none | |

## 3. Reading the table for a service level

- **What grows the team's record** is the units: ≈ **1.4 to 1.5 × the extracted text**, never the file's size (the file sits in R2). So the load is set by text volume, not bytes: a 100 MB scanned PDF with little text adds little; a 100 MB text file adds ~140 to 150 MB.
- **The worst single cases** for the record: a 100 MB text file or CSV (≈ 150 MB of units), a 5,000 dense page PDF (≈ 45 to 50 MB), a 500 MB mailbox of text mail (up to the 100,000-message cap).
- **The worst for the container**: a 5,000 page scan (hours), a 1M-row XLSX (U), a 2 GB unpack (U), a 48 MP photo redraw (U).
- Landing is a write that **blocks the object** (M3): batches of ~1 MB at 30 to 70 ms each, so 150 MB of units is ~150 batches, ~5 to 11 s of blocked time spread across the read, D.

## 4. Measurements to fill the U cells (proposed, BOB's to place)

| id | measure | where | fills |
|---|---|---|---|
| L1 | Workers reader CPU and memory per MB on the corpus: text/JSON/XML/NDJSON at 10, 50, 100 MB; CSV at 50 MB | live throwaway Worker (stage 0 method) | text, CSV, HTML rows |
| L2 | XLSX/ODS windowed read at 10 MB, 50 MB, 250,000 and 1M cells | same | spreadsheet rows, N1267a |
| L3 | Photo redraw at 12, 24, 48 MP (JPEG, HEIC) on the container | container (P-M17 first) | photo row |
| L4 | LibreOffice on a 50 MB .xls and a 100 MB .doc | container | legacy rows |
| L5 | Archive unpack of 500 MB / 2 GB | container | archive row |
| L6 | Container cold start and idle cost | P-M17 | all container rows |

## 5. What I need
PLATFORM: confirm whether units count as 1.4 to 1.5 × text (M3 was measured on 1 KB rows with 1 and 3 indexes; real unit rows differ). BOB: place L1 to L6.
