# Measurement specification L1 and L2: Workers reader cost per MB, and windowed spreadsheets

**Status** · READY for PLANNING (FILES #1, F8, 2026-10-27). For READING-PIPELINE's first Stage 1 job (BOB, via PLANNING), then one live confirmation on `plat-s1` (K5453). Replaces the toy probe the F6 note rejected: the product's own readers are measured. Fills the U cells of `LOAD-PER-TYPE.md`. L6 and the container items wait for the image and P-M17 (`PROBE-SPEC.md`).

## 1. How

- **Harness (GAP-1.1):** raw workerd with a capped child for the heap and the byte ledger for backing stores, one cap convention, the 2 MB value shim, the per-tick peak sampler, bars on counts not wall time. Corpus from the seeded generator with a truth token on the last line, page, row and member of each file.
- **Readers measured:** `structured-text-reader` (JSON, NDJSON, XML, SVG, KML, GeoJSON, ICS, VCF, SRT, VTT), `csv-reader` (CSV, TSV), the HTML cleaner, the text reader, `mail-reader` (EML, MBOX), the XLSX and ODS readers. Each through the real entry paths (upload, multipart, `acquire`).
- **Windows:** 8 MiB byte windows with a carry, the encoding in the cursor; step sizes as set by GAP-0.2.

## 2. L1: per file type, per size

| input | sizes | note |
|---|---|---|
| text, JSON, NDJSON, XML (flat and deep to depth 1,000), CSV, TSV, HTML | 10, 50, 100 MB; 100 MB + 1 | CSV and TSV 50 MB and 1M rows; one single-line 100 MB JSON; one 10,000-depth XML (refused at 1,000, K5439) |
| UTF-8, UTF-16 with BOM, windows-1252 | 50 MB each | the encoding path costs |
| ICS 100,000 events and 100,001; VCF; SRT/VTT of 3 hours of cues | | K5439 limit |
| EML with 3 attachments; MBOX 10,000 and 100,000 messages and 100,001 | 500 MB | each message a member |

**Record per run:** completed or the stated refusal; client wall time; steps taken; peak memory by ledger and heap; CPU per step against 30 s (M2); units landed and bytes stored (to check the 1.4 to 1.5 factor); the last-line token found by search; and a restart injected mid-read (completes, no unit twice).

## 3. L2: spreadsheets

| input | sizes |
|---|---|
| XLSX, XLSM | 10 MB, 50 MB, 250,000 cells, 1,000,000 cells, 1,048,576 rows, 1,048,577 rows (refused) |
| ODS | 10 MB, 50 MB, 20 MB with a 1 MB zip-expansion ratio |
| wide: 16,384 columns; 1,000 sheets | protective limits |
| dates as numbers in every format | typed as dates, number kept (K4831 (7)) |

**Record per run:** as L1, plus cells held versus cells interpreted (only touched cells interpreted, K4636), rows of text indexed, and `cellsOf` on a cited range answered in under 2 s from stored access points (GAP-1.8 (d)). N1267a (cells by window, never every cell in one `text()` call) is the module change that makes the 250,000-and-above rows measurable.

## 4. Pass looks like
- Every file within its bound reads whole to its last line; every file past a bound or limit is refused whole with its size or limit named; no step over 30 s CPU; memory under 256 MiB (M1) with the ledger's own cap at the product's convention; a mid-read restart loses nothing and repeats nothing.
- The live confirmation on `plat-s1` repeats three sizes per type (10 MB, the largest allowed, and just over) and reports the same table; differences from workerd are the finding.

## 5. Output
A results table per reader in the same columns, written into `LOAD-PER-TYPE.md` against M-ids by the job (FILES updates the table on receipt). A figure outside the table's derived ones is reported to BOB, who tells PLATFORM.
