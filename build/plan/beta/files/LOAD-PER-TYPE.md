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
| M14 | **L3 photo redraw, local, libvips 8.15.1, full decode and re-encode with metadata stripped (JPEG Q85, noise images, the worst case for size)**: 12 MP (5.8 MB) 0.19 s, 49 MB peak; 24 MP (11.6 MB) 0.32 s, 61 MB; 48 MP (23.3 MB) 0.55 s, 80 MB. Default and sequential access gave the same. HEIC not measured (no HEIC plugin here) | L3, this session (local, 4-core shared box) |
| M15 | **L4 legacy Office, local, LibreOffice 24.2**: .xls of 65,535 rows × 20 columns (19.9 MB) to CSV 2.15 s, 215 MB; (building that .xls from CSV took 13 s, 481 MB); an RTF of 20 MB of text to text 19.8 s, 256 MB; the same as .doc (40.9 MB) to text 20.8 s, 232 MB. About 1 s per MB of text; the floor is ~215 to 260 MB, not growing with size in these runs | L4, this session (local) |
| M16 | **L5 archives, local, 7-Zip 16.02 / tar**: 20 members, 1.9 GB unpacked (incompressible; archive 1.5 to 1.6 GB, so over the 500 MB upload limit: this tests unpacking, not the upload bound): list < 0.01 s, 11 MB; one member to stdout 1.05 s, 11 MB; **stream all 1.9 GB**: zip 20.5 s, 11 MB; tar.gz 16.0 s, 11 MB; 7z 24.7 s, 14 MB. Building them took 20 s (zip), 105 s (tar.gz), 63 s (7z) | L5, this session (local) |
| M13 | Container cold start, idle cost, R2 to container: **not measured** (P-M17 not run) | stage0 |

## 2. Per type

"Held" = bytes in R2 (always the whole original). "Units" = text units landed in the team's record (SQLite), by rule (M3): **about 1.4 to 1.5 times the extracted text's size**, D. Extracted text ≈ the visible text; dense page ≈ 6.7 KB (M12), so units ≈ **9 to 10 KB per dense page, less for ordinary pages**, D. A reading's index adds the rows of M3's 3-index case.

| type (route) | held | units added to the record | load: CPU and memory | status |
|---|---|---|---|---|
| **PDF text layer** (container, native) | file size | ≈ 9 to 10 KB/dense page; 5,000 dense pages ≈ 45 to 50 MB | extraction ≈ 1.3 ms/page, ≈ 18 MB (5,000 pages ≈ 6.5 s) | M6, D; container itself U (M13) |
| **PDF scanned, OCR** (container) | file size | same as text for the pages read | render ≈ 1.3 s (to PNG) or 42 ms (gray) + OCR 1.5 to 5 s/page, ≈ 55 to 150 MB; 5,000 pages ≈ 2 to 7 h on one process, ≈ 1.9 h on 4 | M7, M8; width and cost U (P-M11, M13) |
| **DOCX, PPTX, ODT, ODP** (JS now, container later) | file size | ≈ 1.4 to 1.5 × visible text, plus its parts (notes, comments) as units | JS reader in Workers: U per MB (to measure on DOCS corpus); container: parsers streaming, U | U |
| **DOC, PPT, RTF, XLS** (container, LibreOffice) | file size | as the converted format | ≈ 1.2 to 4 s and ≈ 220 MB per small file; ≈ 1 s per MB of text up to 20 MB, 215 to 260 MB (a 100 MB document ≈ 100 s, D) | M9, M15; 50 to 100 MB files U |
| **XLSX, XLSM, ODS** (JS now, container later) | file size | rows of text indexed in pieces (K4636) + cell access points: ≈ 1.4 to 1.5 × text of all cells; cells interpreted only when opened or cited | JS: held-cell cost U; LibreOffice to CSV 20,000 rows 4 s/221 MB | M9, D; 1M-row scaling U |
| **CSV, TSV** (Workers) | file size | ≈ 1.4 to 1.5 × text size; a 50 MB CSV ≈ 70 to 75 MB | alpha: ~31 MB above idle per 21 MB (M5), dies near 17.75 MiB; beta windowed reader U | M5; beta U |
| **text, JSON, NDJSON, XML, SVG, KML, GeoJSON, ICS, VCF, SRT, VTT** (Workers, windows) | file size | ≈ 1.4 to 1.5 × text size; a 100 MB file ≈ 140 to 150 MB of units | byte pass floor 22 ns/B (100 MB ≈ 2.3 s) before parsing (M4); parse cost U | M4, D; parse U |
| **HTML, MHTML** (Workers) | file size | ≈ 1.4 to 1.5 × cleaned text (much less than the HTML) | streaming cleaner U | U |
| **Images, OCR** (container, libvips + Tesseract) | file size | OCR text only (small; a page of text ≈ 9 to 10 KB) | decode: shrink-on-load 0.16 s/43 MB for 48 MP; full decode memory ≈ pixels × 3 bytes (48 MP ≈ 144 MB raw), D; OCR as above | M11, M7, D; full-decode time U |
| **TIFF multi-page** | file size | per page as scans | per page as OCR; page count up to 5,000 | as scans |
| **Photo redraw (DEC-460 A4)** | original + safe picture (≈ the original's size, D) | metadata fields only (time, place, orientation: < 1 KB) | JPEG: 0.19 s/49 MB at 12 MP, 0.55 s/80 MB at 48 MP (M14); far under the 4 GiB container and fast enough for a request-sized job; HEIC U | M14; HEIC, live container U |
| **EML, MSG** (Workers / container) | file size | headers + body text ≈ 1.4 to 1.5 × text; attachments are their own documents (their rows) | small; U | U |
| **MBOX** (Workers stream) | file size (up to 500 MB) | per message as EML; ≤ 100,000 messages (K5439) | byte pass 22 ns/B (500 MB ≈ 11 s) + per-message parse U | M4, D |
| **ZIP, TAR, GZ, 7z** (container) | file size; each member its own document | listing: one row per member (≤ 10,000, K5439) of small size; members as their own types | list 6 to 11 MB, < 10 ms; one member ~1 s per 100 MB; streaming 1.9 GB: 16 to 25 s, 11 to 14 MB | M10, M16 |
| **Held and named** (Tier 4) | file size | one row: name, type name, details (≈ 1 to 2 KB, D); no units | safe-grade by head and tail range reads only, no read | D |
| **Refused** | none | none | none | |

## 3. Reading the table for a service level

- **What grows the team's record** is the units: ≈ **1.4 to 1.5 × the extracted text**, never the file's size (the file sits in R2). So the load is set by text volume, not bytes: a 100 MB scanned PDF with little text adds little; a 100 MB text file adds ~140 to 150 MB.
- **The worst single cases** for the record: a 100 MB text file or CSV (≈ 150 MB of units), a 5,000 dense page PDF (≈ 45 to 50 MB), a 500 MB mailbox of text mail (up to the 100,000-message cap).
- **The worst for the container**: a 5,000 page scan (hours), a 1M-row XLSX (U), a 2 GB unpack (U), a 48 MP photo redraw (U).
- Landing is a write that **blocks the object** (M3): batches of ~1 MB at 30 to 70 ms each, so 150 MB of units is ~150 batches, ~5 to 11 s of blocked time spread across the read, D.

## 4. The measurements L1 to L6: state (F6)

| id | measure | state |
|---|---|---|
| L3 | photo redraw 12, 24, 48 MP | **done locally** (M14), JPEG; HEIC needs a HEIC-capable build (container image, GAP-3.1) |
| L4 | LibreOffice on large legacy files | **done locally** (M15) to 20 MB text and a 65,535-row .xls; 50 to 100 MB not run (disk and time; linear estimate in the table) |
| L5 | archive unpack at scale | **done locally** (M16): 1.9 GB streamed in 16 to 25 s, ≤ 14 MB |
| L1 | Workers reader cost per MB (text, JSON, XML, NDJSON, CSV) | **not run**: needs the product's readers on the live platform shape. A toy probe would measure my parser, not theirs. Recommend: READING-PIPELINE's first Stage 1 job measures it with the seeded corpus of GAP-1.1 under raw workerd, then one live confirmation by BOB's deploy. I will write that probe's spec on request |
| L2 | windowed XLSX/ODS at 10, 50 MB, 250,000, 1M cells | **not run**, same reason (N1267a is the module change that makes it measurable) |
| L6 | container cold start and idle cost | **not run**: needs the container image and BOB's deploy (P-M17). The local numbers above are the work *inside* a container, not the cold start |

All local figures: a shared 4-core, 16 GB box, no CPU or memory cap; a `standard-1` container (half a vCPU) will be slower by about 2 times on CPU-bound work, D from the earlier spike's half-vCPU note, and its memory cap is the limit to test.

## 5. What I need
PLATFORM: confirm whether units count as 1.4 to 1.5 × text (M3 was measured on 1 KB rows with 1 and 3 indexes; real unit rows differ). BOB: L1, L2, L6 as the table says.
