# One table: plain kind names and per-kind limits, for the screens

**Status** · READY for PLANNING (FILES #1, F12, 2026-10-27), owed by DEC-467 (FILES and PLANNING). The screens read this table for `{kind}` and for each kind's limit. The words themselves are UX-DESIGN's to refine (a name here is the plain noun phrase to start from, not final copy). Limits are `SIZES-N1267.md` and K5439; states are K5435 to K5437. The registry key is `format-registry`'s (`REQ-format-registry-beta.md`); one row per key, so a words check can compare this table with the roster (RF8).

**Columns.** `key`: the registry key. `{kind}`: the plain name, singular, that fits both "{kind}: kept whole…" and "{kind} files aren't kept". `state`: **read** / **kept, not read yet** / **not kept**. `limit`: what the screen states for a file over it.

## Read (Tier 1 and 2)

| key | {kind} | limit stated |
|---|---|---|
| pdf | PDF | 100 MB or 5,000 pages |
| docx, doc, docm, dotx | Word document | 100 MB or 5,000 pages |
| pptx, ppt, pptm, potx | PowerPoint presentation | 100 MB or 5,000 pages |
| xlsx, xlsm, xltx | Excel workbook | 50 MB or about 1,000,000 rows |
| xls | Excel 97-2003 workbook | 50 MB or 65,536 rows a sheet |
| odt, odp | OpenDocument text or presentation | 100 MB or 5,000 pages |
| ods | OpenDocument spreadsheet | 50 MB or about 1,000,000 rows |
| rtf | Rich Text document | 100 MB or 5,000 pages |
| csv, tsv | Delimited text table | 50 MB or about 1,000,000 rows |
| text | Text file | 100 MB |
| html, mhtml | Web page | 100 MB |
| json, ndjson | JSON data file | 100 MB; nesting 1,000 |
| xml, svg | XML file; SVG drawing | 100 MB; nesting 1,000 |
| kml, kmz, geojson | Map data file | 100 MB; nesting 1,000 |
| ics | Calendar file | 100 MB; 100,000 events |
| vcf | Contact file | 100 MB |
| srt, vtt | Caption file | 100 MB |
| jpeg, png, gif, webp, bmp, avif, heic, heif, jp2 | Picture | 50 MB |
| tiff | Multi-page picture (TIFF) | 50 MB; counts toward 5,000 pages |
| eml, msg | Email message | 100 MB uploaded; 25 MiB received by address |
| mbox | Mailbox | 500 MB; 100,000 messages |
| zip, tar, gz, 7z | Archive | 500 MB as uploaded; 2 GB unpacked; 10,000 files; nested 3 deep |

## Kept, not read yet (Tier 3 and 4; K5436, K5437)

| key (answer `named`) | {kind} | limit |
|---|---|---|
| pst, ost | Outlook mailbox | the archive bound, 500 MB |
| mdb, accdb | Access database | 50 MB |
| sqlite | SQLite database | 50 MB |
| parquet | Parquet data file | 50 MB |
| xlsb | Excel binary workbook | 50 MB |
| shapefile, gpkg | Map layer | 50 MB |
| wpd | WordPerfect document | 100 MB |
| pages, numbers, key | Apple document | 100 MB |
| vsd, vsdx | Visio drawing | 100 MB |
| pub, one, mpp | Publisher, OneNote or Project file | 100 MB |
| dwg, dxf | CAD drawing | 100 MB |
| epub | E-book | 100 MB |
| audio (mp3, wav, m4a and the rest) | Audio recording | the bound of the document class, 100 MB |
| video (mp4, mov and the rest) | Video | 100 MB (audio and video are read after 1.0, N1270) |
| any other | File of an unrecognised kind (shown with its extension, or "unnamed type") | 100 MB |

A kept-not-read file over its limit is refused like any other, stated with its size.

## Not kept (K5436)

| answer | {kind} | reason the screen gives |
|---|---|---|
| rar | RAR archive | they can't be unpacked safely here |
| exe, msi, dll, app, apk, dmg, pkg | Program or installer | they can run on a device |
| bat, cmd, ps1, sh, vbs, scr, jar | Script or program file | they can run on a device |
| iso, img, vhd | Disk image | it can hold programs; it is not unpacked here |

## Rules for this table
- A new type is a row and a words key (RF9); a type moving from kept-not-read to read changes its row, not the screens.
- Only the limit column is a bound; the bounds' single source is `runtime-limits` Level 1 (K5448 (8)), and this table is built from it, never the other way.
- Open: the `limit` for audio and video, which are not read until after 1.0; BOB confirms the document-class bound is the right stated figure.
