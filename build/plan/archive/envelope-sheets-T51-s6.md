> **Split K5025.** Part of `envelope-sheets-T51.md`, split by section; contains §6 (what this plan hands BOB) and §7 (not covered). The rest: the head, §0, §3: `envelope-sheets-T51.md`; §4, §5: `envelope-sheets-T51-s4.md`; §1, §2: `archive/envelope-sheets-T51-s1.md` (archived whole).

## 6. What this plan hands BOB (the order of work it implies; BOB's to place)

**0 · First, measure on workerd (L), because three findings were run only in node:** (a) S-4: does workerd's `TextDecoder("latin1")` follow the WHATWG label (windows-1252) as node does; (b) S-2: run the 20.4 MB ODS through the ledger on a quiet copy with a log of the tick's last word before the object stops, and the planned G70 per-alarm log; (c) the deployed `cpu_ms` and the object's real memory with an ODS of 100k and 140k cells. These decide which causes are certain.

**1 · Cause entries, data loss first** (each with its four fields, R-FOUR): S-4, S-3, S-1, S-5, S-8, S-7, S-2, S-6, in that order of certainty and loss. Six are certain (ran) today.

**2 · The architecture the standard needs** (BOB's, P17; recommended): **one reading contract for every sheet-like kind**, `window(cursor) → {rows (typed cells with their place), next cursor}`, bounded by a window, yielding between windows, holding its cells in the file and carrying its state **in the cursor** (a byte or row offset and the open counters), not re-parsing:
- CSV: exists (`csvWindowTick`, R40/R41); keep, with the walker fixed (E-20) and the carrier fixed (E-17).
- XLSX: the zip central directory and the sheet part inflated in windows with a row cursor; the shared-string index read by range or bounded (E-12); retire the `u` cursor for sheets.
- ODS: a streaming tokenizer over `content.xml` inflated in windows, the repeat counters in the cursor, held cells and `cellsIn`, per-sheet expansion (E-6).
- The reading-row guard (extraction R96) never replaces a reading that could be indexed (J-12).
- Tables are built from **cells** (`cellsAt`/`cellsIn`, paged) or from **bytes** through csv-reader, **never from the reading's presentation text** (J-13); content R46's join and reading-pipeline R41's header are *presentation*, and R41 says so.

**3 · Jobs (proposed grouping; owners by module)**
| Job | Covers | Owner modules |
|---|---|---|
| A. csv-reader | S-4, S-5, S-6, S-22, F3, E-4, E-8, E-17..E-20; the cellsIn index for paging (S-20) | csv-reader, reading-pipeline (`scanBoundaries`) |
| B. ODS | S-1, S-2, S-14 (ODS), S-18 (ODS), S-19; E-6; D01 (DOCX the same contract) | odf-reader, office-readers (docx), reading-pipeline, extraction |
| C. tables | S-3, S-25, S-27, S-29, S-28; J-13 | calculations, content (R46 note), reading-pipeline (R41 note) |
| D. XLSX | S-14, S-15..S-17, S-21; E-5, E-7, E-9, E-10, E-12 | office-readers, ooxml, reading-pipeline |
| E. ticks, state, identity | S-7, S-8, S-10, S-23, S-33; E-13..E-16, E-19 | reading-pipeline, extraction, acquisition, capture, plane |
| F. workbooks | S-26, S-32; E-22 (after B-4), E-27 | workbooks, sheet-worker |
| G. interpretation | S-30, E-25, E-28 (after B-7), S-11 | calculations, office-readers |
| H. index and search shape | S-12, S-13, F13, F14, S-34 | reading-pipeline, text-chain, extraction |
| I. harness and corpus | S-24, S-36, S-38..S-41; §5 | test-support, plane |
| J. requirements | the envelope into the requirements (below) | each module |

**4 · The envelope into the requirements, by module** (written where missing; K4785 (2)): csv-reader R5/R6/R7/R9 (and R6's two numbers made one) and new E-3, E-4, E-8, E-17 to E-20; office-readers R12 (stale), R11 (styled), R35-R37 and E-5, E-7, E-9, E-12; odf-reader R45, R48 and the windowed contract; ooxml R30 for the reader path (E-10); reading-pipeline R37 (**the one table of big-file bounds**), R40 (per-tick counts, E-13, E-14), R41 (header is presentation; "nothing is cut" corrected); extraction R96/R97 (never delete an indexable reading), R98; file-safety R11, R51 (and the CSV sniff made one function with csv-reader); acquisition R17 (the identity rule); workbooks R1/R2 (B-4); calculations R1 (a table's rows are the source's data rows), R14 (E-25); sheet-worker R3/R14 (values); plane R84 (the sheet twin extended: ODS, XLSX at the bound, encodings, restart) and `wrangler.jsonc` `cpu_ms`; test-support (the generator).

**5 · Bob's** (§4.3): B-1 to B-8, rendered, before jobs A (E-17), B and F touch what a member may do. B-1 and B-3 first: they size everything else.

**6 · After**: the corpus runs at every round end; the L subset at each redeploy; every defect a cause of the running fix round (P10, P19).

---

## 7. Not covered by this plan

- **PDF tables, scans and images, word-processing, presentation and web text, archives:** PDF #1, SCAN #1 and DOCS #1. This plan covers a DOCX or HTML *table* only where a table reaches the sheet path (S-1 D01, S-34).
- **The accuracy of the recompute engine,** CSV export (none exists: no code writes a CSV), and formula evaluation outside `sheet-worker`.
- **Encrypted or password-protected workbooks** (X19 is a corpus file; the reading's behaviour is a hypothesis: file-safety names OLE `ole` and `NO_SAFE_VIEW`).
- **Not read by any helper:** `diagnosis-R6-idle.md` past 4.5 KB; the two round 7 reviews of G83 and G84 (keyword scan); `round6.test.mjs` whole (S-7's scripted provider); the daemon paths (`capture-requests`, `monitoring`) for the "is it a sheet" decision (hypothesis that they follow `textTypeOf`); the live site (not contacted).
- **Workerd:** every probe ran in node 26; the numbers for heap and times are indicators, bytes/rows/calls are exact; §6 step 0 settles the three that depend on it.
- **This plan changes no requirement.** Where it says "stated in R-n", it means the requirement says it today; where it says "Recommended", the requirement does not yet.
