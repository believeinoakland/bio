# N1267: the beta's file sizes, by kind, with the added types

**Status** · DRAFT 1 by FILES #1 (F2), 2026-10-27. Not READY: waits on Bob's answers F1-F3 (K5426) for which types are in. Figures: K4628 (3) option B, K4831 (3), (4), (8), (10), K5427 (text 100 MB). Requirement wording is BOB's (P17).

## 1. The rule

A file is read whole, searchable to the last line, citable at its page, row or cell (K4628, K4630), when it is within its kind's bound. A file over **either** limit of its kind is refused in plain words with its size and the limit, never half read (K4831 (4)). The alpha ships with its current, lower limits, each stated with size and limit and never shown as read (K4831 (3)); this table is the beta's.

## 2. The table

| kind | types | bound | notes |
|---|---|---|---|
| document | PDF, DOCX, DOC, PPTX, PPT, ODT, ODP, RTF | 100 MB **or** 5,000 pages | a PDF's pages counted from its page tree |
| text | text, JSON, XML, NDJSON, HTML, and the text-like (ICS, VCF, SVG, KML, GeoJSON, SRT, VTT, log, md) | 100 MB (K5427) | read in byte windows with the encoding carried; HTML's streaming cleaner needs it to the same bound (GAP-1.8 (b) had it at 24 MiB whole: to be raised) |
| spreadsheet | XLSX, XLSM, XLS, ODS, CSV, TSV | 50 MB **or** about 1,000,000 rows | XLS: 65,536 rows a sheet in the format itself; a workbook's rows counted over its sheets |
| image | JPEG, PNG, TIFF, HEIC, GIF, WebP, BMP, AVIF | 50 MB each | multi-page TIFF: pages count toward 5,000; GIF first frame; pixels a page: a protective limit |
| archive | ZIP, TAR, GZ, 7z, MBOX | 500 MB as uploaded, 2 GB unpacked | each member within its own kind's bound; depth 3; 10,000 members; ratio 1,100 (protective, K4831 (8)); RAR refused by name |
| message | EML, MSG | within the document bound | attachments are members, each its own job |

## 3. Things this draft surfaces

1. **Text: 100 MB.** GAP-1.8 (b) and K4906 had 50 MB; K5427 settles 100 MB. The reading-pipeline requirement text changes with it (BOB's).
2. **HTML** was whole to 24 MiB and stated above (K4906 (2)). Under 100 MB text it needs a streaming read all the way. Open: confirm HTML belongs to the text bound; recommend yes.
3. **Analysis workbooks**: held whole and interpreted only where touched, to 250,000 cells (K4831 (10)), distinct from the 1M-row reading bound. N1267a (the XLSX reader lists cells by window) is owed before any bound above 250,000.
4. **Rows and pages are counted before any byte is read**, from declared structure (GAP-1.4 plan step); a file with a false declaration is stopped at the first window past it, stated.
5. **Photos**: a safe picture is redrawn from the pixels, dropping only the metadata safety requires; when and where taken and orientation are read as data and shown beside it (DEC-460 A4). Sets what image reading must return: capture time, place, orientation as fields.
6. **Protective limits** (columns 16,384; characters per cell 32,767; sheets 1,000; and the rest of GAP-1.2's list) are BOB's to set and report (K4831 (8)); they are not repeated here.
7. **MBOX** counts as an archive (a message is a member). Open for BOB: the cap on messages in one mailbox, a protective limit.
8. **Time**: no promised time; progress, an "about" estimate once measurable, a notice at finish (K4831 (5), K4354).

## 4. Needs from other lanes

PLATFORM: the record a 100 MB document, a 1M-row sheet and a 2 GB-unpacked archive put on a team's object at each service level, and the time budget of the refusal and plan steps. UX-DESIGN: the sentence naming the size and limit in a refusal; the type-and-limit list shown before upload. Both through BOB.
