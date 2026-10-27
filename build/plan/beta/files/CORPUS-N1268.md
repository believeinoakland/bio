# N1268: the beta's acceptance corpus, drafted

**Status** · READY (F3; the type list is settled; S2 sampling continues and may change source rows). First drafted by FILES #1 (F2), 2026-10-27. Not READY: waits on the final type list. Bob (K4632): for the beta. Kept in the build state and re-run every tranche on the live test copy (K4628 (4)).

## 1. What it is

Per type: a **small**, a **typical** and a **largest-allowed** file (SIZES-N1267 §2), plus a **just-over** file for each bound (refusal with its size). Each goes in by **upload** and, where a web address can hold it, by **web capture**, on the live test copy. Pass means, for each:
1. it is read whole, and **a token on its last line/page/row is found by search**;
2. a citation reaches its page, row or cell, and opens at it;
3. structure is kept (a table's rows and columns, a sheet's cell address, an email's attachments as members), and every part is marked with its kind (footnote, comment, speaker note);
4. a scan is read by OCR, Spanish pages in Spanish; unreadable pages are stated;
5. large files read in the background with progress, and the member told at finish (K4354);
6. the type is detected by content: a copy renamed with the wrong extension is read as what it is;
7. the just-over file is refused in plain words with its size and limit, never half read;
8. a held-and-named type (Tier 4) is held whole and named, not read.

## 2. Where the files come from

| source | gives | use |
|---|---|---|
| **Legistar** attachments (public API, all 1,243 sampled were PDF) | real council PDFs, small to very large | PDF small and typical; the largest packets measured for the top of the range |
| **Open data portal** uploaded files (102; PDF, ZIP, old Excel, one .doc, one text, images) | real request releases: .xls, ZIP, .doc | legacy Excel, ZIP, DOC, text, PNG/JPEG (and one video for held-and-named) |
| **Open data portal** tables | CSV, JSON, XML, and GeoJSON/KML/shapefile exports of map tables | CSV, TSV (a tab export), JSON, XML, GeoJSON, KML |
| **Generated** by the seeded generator of GAP-1.1, with a truth token per page, row and member | any size, any shape | the largest-allowed and just-over of every type; and types with no public sample: HEIC, WebP, GIF, multi-page TIFF, RTF, EML, MSG, MBOX, TAR, 7z, XLSM, ICS, SVG, SRT |

Real files are not copied into the repository when large; a list gives each one's address, size and whole-file digest, and a script fetches and checks it. Generated files are built on demand from a seed.

## 3. Per type (the plan)

| type | small | typical | largest | just over |
|---|---|---|---|---|
| PDF, text layer | portal PDF | Legistar PDF | generated 100 MB / 5,000 pages | 5,001 pages; 100 MB + 1 |
| PDF, scanned | 1 page | 40 pages | generated scan, 5,000 pages | as above |
| DOCX, DOC, PPTX, PPT, ODT, ODP, RTF | portal / generated | portal / generated | generated 100 MB | 100 MB + 1 |
| XLSX, XLSM, XLS, ODS | portal "PRR" sheets | portal sheets | generated 50 MB / ~1M rows | 50 MB + 1; 1,048,577 rows |
| CSV, TSV | portal table | portal table | generated 50 MB / 1M rows | over both |
| text-like, JSON, XML, HTML | portal exports | portal exports | generated 100 MB | 100 MB + 1 |
| images (JPEG, PNG, TIFF, HEIC, GIF, WebP, BMP) | portal / generated | phone-size | 50 MB each | 50 MB + 1; pixel limit |
| EML, MSG | generated | with 3 attachments | message at the document bound | over |
| ZIP, TAR, GZ, 7z, MBOX | portal ZIPs | portal ZIPs, nested depth 2 | 500 MB / 2 GB unpacked | depth 4; ratio over 1,100; RAR |
| held-and-named | the portal's video | an unlisted type | n/a | n/a |

Edge cases, always: an encrypted file, a corrupt file, a renamed file, a macro file (read, macro not run), a legacy encoding (windows-1252), a page that kills its reader (the rest read), a file with false declared sizes.

## 4. Open
- Which of the portal's "Excel" files are really binary Excel (S2).
- Copyright and privacy of public files used in tests: all are published by the city; generated files otherwise. BOB confirms.
- The live-copy time budget for the largest files (PLATFORM).
- Bob's answers F1-F3 set the type rows.
