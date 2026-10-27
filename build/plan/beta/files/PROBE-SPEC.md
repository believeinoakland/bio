# Probe specification for PLATFORM's S1 deploy cycle: the file reading measurements (L1, L2, L3-HEIC, L4, L5, L6)

**Status** · READY (FILES #1, F7, 2026-10-27), for BOB to relay to PLATFORM (K5448: P-M17 first, one scratch account). I deploy nothing. Local results already in `LOAD-PER-TYPE.md` M14 to M16; this lists what only the platform or the product's own readers can show. Every probe reports to a results table in the same form: input, size, wall time (client-side), peak memory where visible, outcome.

**Order.** P-M17 (PLATFORM's: cold start, R2 to container, deploy across a running call, idle cost) first, because the container image is the vehicle for L3 to L6. L1 and L2 run on Workers and may run in the same cycle.

| id | what | input | measure | pass looks like |
|---|---|---|---|---|
| L1 | the product's Workers readers (`structured-text-reader`, `csv-reader`, HTML cleaner) on a live Worker | generated text, JSON, NDJSON, XML, CSV at 10, 50, 100 MB from the seeded generator (GAP-1.1), in R2, read in 8 MiB windows | per file: wall time, whether it completes, peak memory by the byte ledger; and the same at 100 MB + 1 refused | 100 MB reads whole in steps under 30 s CPU each (M2); memory under 256 MiB (M1) |
| L2 | XLSX and ODS windowed read | workbooks of 10 MB, 50 MB, 250,000 cells, 1,000,000 cells | as L1; cells held vs interpreted | 50 MB / 1M rows reads without the 250,000-cell row held |
| L3-HEIC | photo redraw of HEIC (and TIFF multi-page, AVIF) | 12, 24, 48 MP HEIC; a 40-page TIFF | time and memory in the container at the instance type's limits | HEIC redraw in seconds, memory under the instance limit (JPEG local: 0.55 s/80 MB at 48 MP) |
| L4 | LibreOffice at size, at the instance type | .doc 50 and 100 MB; .xls at its 65,536-row limit with wide sheets; RTF 100 MB; .ppt 100 MB | time, memory, completion | linear ~1 s per MB (local), memory under the limit; a failure names its size |
| L5 | archive unpack at the instance type | 500 MB ZIP as uploaded, 2 GB unpacked in 10,000 members, depth 3, a depth-4 refusal, a ratio bomb | time, memory, disk use on the instance | streams at ~14 MB; refusals stated |
| L6 | container cold start and idle cost | a read job after sleep and after never run; a week idle | cold start seconds; cost per idle hour at `standard-1` and `standard-4` | PLATFORM's P-M17 figure; recorded in LOAD-PER-TYPE |

**Also from FILES for P-M17:** a half-vCPU instance will be about twice as slow on CPU-bound conversion as the local box (D), so L4's time bound should be set on the instance, not from my local figures.

**Not mine:** the deploy and the scratch account (BOB, K5434); whether a failure makes L1 to L5 gate Stage 3 (GAP-0.4, PLANNING).
