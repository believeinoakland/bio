# N1266: the file types the beta reads, closely studied (for Bob, K4632)

**Status** · READY (F3). The list is settled by Bob: K5435 (A2: ruled list plus Tier 2), K5436 (B2: held and named), K5437 (D: MBOX in; PST, Access and Tier 3 held and named), K5427 (text 100 MB). Requirement drafts: `REQ-format-registry-beta.md`, `REQ-readers-beta.md`; screen needs: `UX-NEEDS.md`. First written as DRAFT 1 by FILES #1, 2026-10-27, for BOB to bring to Bob with options and a recommendation (P17). Decides nothing. Part 1 is written for Bob; parts 2 to 6 are the working study behind it. Inputs: K4628, K4630, K4632, K4636, K4831; `next.md` N1266 to N1268; `format-registry.md`; GAP.md and stage0/RESULTS.md of the reading lane; the CPRA text (Gov. Code 7922.570 to 7922.580).

## 1. For Bob

**What you asked.** The beta must capture and read "any type of file of any reasonable size" (K4628). You ruled the list is to be "closely studied before finalizing" (K4632). This is that study.

**What is already settled.** Your ruled list covers the everyday family: PDF (text and scanned), Word, Excel, CSV and TSV, PowerPoint, the OpenDocument trio, plain text, RTF, web pages, JSON, XML, six image types, email files (.eml, .msg) and ZIP; you later added TAR, GZ and 7z (not RAR). Audio, video and discussion forums wait for the release after 1.0 (N1270). Today the product reads PDF, DOCX, XLSX, PPTX, ODT, ODS, ODP, CSV, web pages, JPEG, PNG, and lists ZIPs.

**What the study found.** Four things the ruled list leaves open:

1. **The law makes members' files arrive in whatever form the city holds them.** Under the California Public Records Act an agency must give a record in any electronic format it holds (Gov. Code 7922.570), so a request can return a mailbox export, a database, a map file or a CAD drawing, not only a PDF. A list of fixed types will always meet a type it lacks. What the product does then matters as much as the list.
2. **Several types are cheap and valuable but were not named** (the same reader as a named type, or plain text): calendar files, mailbox files (MBOX), single-file web archives, vector images, map files (GeoJSON, KML), Excel and Word files with macros, line-delimited JSON, meeting-caption files.
3. **A few types are costly and the value is unproven:** Outlook archives (PST), Access databases, WordPerfect, Apple iWork, CAD. These are your call, and I recommend not building them blind.
4. **Two numbers disagree.** N1267 says documents and text go to 100 MB; the reading architecture and its fix round used 50 MB for text, JSON and XML. This needs one answer (question C below).

**Questions for you, each with my recommendation**

**A. How wide is the list?**
- **A1. Exactly what you ruled** (about 20 types). Smallest build; every unnamed type is a later request.
- **A2. What you ruled, plus the cheap siblings of §4 (Tier 2)** (about 15 more types, almost all the same reader or plain text). Recommended: a member who holds an .ics, .mbox, .mht, .svg, .kml or an .xlsm should not be told "not read" for want of a day's work.
- **A3. A2 plus the costly types of §5 (Tier 3).** Recommend not now: no evidence yet that a member holds them; see D.

**B. What does the product do with a file whose type it cannot read?**
- **B1. Refuse it.** Simple, but loses the file, and a later reader could never find it.
- **B2. Hold it whole, name the type plainly ("a Visio drawing; not read yet"), search it by name and details, and read it when a reader arrives.** Recommended: it matches your ruling that adding a document is not interpreting all of it (K4632) and K4571's "never silent".
- **B3. Guess: treat it as text.** Rejected: it would show garbage as if it were words.

Two things stay refused by name: RAR (your ruling) and programs, installers and disk images (safety).

**C. The text size (settled by BOB, K5427: 100 MB).** One bound for plain text, JSON, XML and the new text-like types: **100 MB** (N1267 as you ruled it) or **50 MB** (the figure the fix round used). Recommended: 100 MB, as ruled; the fix round's 50 MB was a working figure, and 100 MB costs nothing extra for text read in windows.

**D. Outlook archives (PST) and Access databases.** Offer to read these only if the acceptance corpus (N1268) or a team shows they turn up. Recommended: **MBOX in the beta** (A2), **PST, Access and the rest of §5 held and named (B2) until a real file asks**, then added by a small ruling each.

**What happens next.** On your answers I settle the type table (part 3), the size of every added type (part 6) and the acceptance corpus (N1268), and send the screens' wording needs to UX-DESIGN.

## 2. How the types were judged

Five tests per type: **value** to an investigation of a public body (what Oakland bodies publish, what a member holds, what a records request returns); **how a member gets it** (upload, web capture, request response); **reader cost** (a reader we have, plain text, or a new tool; Workers or the container, per GAP.md); **risk** (macros, encryption, hostile files; K4831 (6)); **licence** of any tool (GAP-3.0, checked before use).

**What the evidence is, honestly** (updated in F2, with a count; see §2a). I found no count of the formats agencies actually send; the web sources I could reach are guidance pages from journalists, records managers and archivists, not statistics (the statute is firm; the prevalence is not). They agree on the pattern: PDFs, often scanned or printed from a spreadsheet, dominate; spreadsheets and delimited text come when asked for; email comes as EML, MBOX, MSG or PST when native, and as PDF prints otherwise. **The count in §2a is a first one, from two Oakland sources.**

## 2a. A first count (F2, 2026-10-27, from the live sources)

**Legistar** (the city's agendas and attachments; its public API): the attachments of the 400 most recent matters, **1,243 attachments, all PDF (100 %)**. Council business arrives as PDF; the size and page count of those packets are not yet measured (S2 continues).

**Oakland's open data portal** (data.oaklandca.gov; its catalog API): 739 assets. **313 are tables** (served as CSV, JSON and XML by the platform; map tables also as GeoJSON, KML/KMZ and shapefile). **102 are uploaded files**, by the portal's detected type:

| type | files |
|---|---|
| PDF | 48 |
| ZIP | 26 |
| Excel 97-2003 (.xls) as detected | 22 |
| Word .doc | 1 |
| other Office (old binary) | 1 |
| plain text | 1 |
| PNG, JPEG | 2 |
| QuickTime video | 1 |

Many of the uploaded files are the city's own releases of public-records requests (their titles begin "PRR" and a request number): property lists, business-tax accounts, permit issuances, outcome tables. That is the closest picture so far of what a request returns.

**What it shows.** (1) **Legacy Excel and ZIP matter more than the ruled list's order suggests**: 22 of 102 are old binary Excel and 26 are ZIPs, so .xls and archive contents are not rarities; they are most of what is not PDF. (2) **PDF is the bulk of council business**, so large-PDF reading (5,000 pages) and OCR are the weight of the beta. (3) **One video** sits among the files, confirming that video will arrive and must be held and named (Tier 4/5). (4) No email, PST, Access, WordPerfect, CAD or map-file upload appeared; this is evidence for holding Tier 3 until asked, not proof of absence. (5) Detection by content matters: the portal's own label "Excel" may hide CSV or XML spreadsheets saved under that name (not yet checked file by file).

**Limits of the count.** Two sources; the open data portal's uploads are mostly 2014 to 2016 releases; types are the portal's, not mine; the zips' insides are not yet opened. The request system (NextRequest) returned no listing to an anonymous call, so its mix is unmeasured.

## 3. The type table

Routes (GAP.md): **W** = Workers, light kind, stays there; **C** = the container reader of Stage 3; **J** = JavaScript reader today, replaced in Stage 3. "Have" is the registry today.

### Tier 1 · ruled (K4628, K4831), the beta must read these

| type | have? | route | note |
|---|---|---|---|
| PDF (text) | yes | J then C | 100 MB or 5,000 pages |
| PDF (scanned) / images by OCR | yes, limited | J then C | OCR `eng` and `spa` (K4831 (9)) |
| DOCX / DOC | DOCX / no | J then C / C | .doc via LibreOffice, converted then read |
| XLSX / XLS | XLSX / no | J then C / C | .xls caps at 65,536 rows a sheet |
| CSV / TSV | CSV / no | W | TSV is the same reader with a tab; encodings per GAP-1.8 (b) |
| PPTX / PPT | PPTX / no | J then C / C | the ruled list says "PowerPoint"; .ppt is implied, named here to be sure |
| ODT, ODS, ODP | yes | J then C | |
| plain text | yes | W | |
| RTF | no | C | via LibreOffice |
| HTML | yes | W | streaming cleaner |
| JSON, XML | no | W | read in windows |
| JPEG, PNG | yes | J then C | |
| TIFF, HEIC, GIF, WebP | no | C | multi-page TIFF (fax, scanned records) is one page per frame; GIF first frame; HEIC is what phones now take |
| EML, MSG | no | C (or W for EML) | body decoded, each attachment a member with its own job |
| ZIP, TAR, GZ, 7z | ZIP listing | C | 500 MB uploaded, 2 GB unpacked; RAR refused |

**One gap in the ruled list:** GAP-3.3 reads **BMP** with the images though N1266 does not name it. Cheap (same decoder); put in Tier 2.

### Tier 2 · cheap siblings, recommended to add (option A2)

| type | why a member holds it | reader |
|---|---|---|
| .xlsm, .docm, .pptm, .xltx, .dotx, .potx | a macro-enabled or template copy of a named type | the named reader, **macros never run**, a macro's presence stated |
| .ics (calendar), .vcf (contacts) | meeting invitations, schedules, in email and request responses | W, plain text with structure |
| MBOX | the open mailbox format; native email from many systems | W stream: each message a member, as for EML |
| .mht / MHTML | a web page saved as one file | W: MIME parts, the page read as HTML |
| SVG | vector maps, charts and diagrams, with text inside | W: XML |
| BMP, AVIF/HEIF, JPEG 2000 (.jp2) | scans and exports from older systems; HEIF kin to HEIC | C: same decoder family (libvips) |
| JSON Lines / NDJSON | data exports and logs | W: JSON windows |
| GeoJSON, KML, KMZ | map layers: parcels, zones, routes | W: JSON, XML, ZIP; text and attributes read; display of maps is the places capability (N1257), not reading |
| .srt, .vtt (captions) | the text of meeting video, which audio/video 1.0 exclusion would otherwise lose | W: plain text with times |
| .log, .md, .yaml and other text | exports and notes | W: **by content, not by extension**: a file that is valid text in a known encoding is text |
| .tab, .psv, fixed pipe or tab data | delimited data under other names | W: the CSV dialect decision, already in csv-reader |
| .gz, .bz2, .xz, .zst over one file (.csv.gz) | a compressed single file | C with the archive work |

### Tier 3 · costly, value unproven (option A3; recommended held and named, B2)

| type | the case for | the cost |
|---|---|---|
| **PST / OST** (Outlook archive) | a native mailbox from an agency | a new library and its licence; often huge; the nested folders; attachments |
| **Access (.mdb, .accdb)** | the form many city databases still take | a new reader, tables as sheets; licence to check |
| **SQLite (.db, .sqlite)** | a portable database; data exports | easy in a container; tables as sheets; arbitrary schema |
| **xlsb** | big Excel files saved binary | a binary format of its own |
| Shapefile (zip of .shp .dbf .shx), GeoPackage | the standard map layers | attribute table (.dbf) is a table; geometry belongs to the places capability |
| Parquet and other analytics data | large data dumps | a reader and memory care; rare locally |
| WordPerfect (.wpd), Apple iWork (.pages .numbers .key), Visio, Publisher, OneNote, MS Project | older or niche office files | each its own reader; the first is government legacy; LibreOffice may read some |
| CAD (.dwg, .dxf), IFC | permits, plans | proprietary or heavy; the plan sets usually also exist as PDF |
| EPUB, MOBI | books | low value for an investigation |
| SPSS, Stata, SAS data | research data | low locally |

### Tier 4 · accepted whole, named, not read (option B2)

Anything else a member supplies or captures: held whole and safe-graded, searchable by its name and details, its type named in the member's words ("a Visio drawing; not read yet"), read when a reader is added. Never "non-textual or too large" (GAP-1.10, X10, X28).

### Tier 5 · refused by name

RAR (K4831); programs, installers, scripts-as-programs and disk images (safety); audio, video, forums (N1270, reconsidered after 1.0: their captions and transcripts are read now as text, per Tier 2).

## 4. Where Tier 2 and 3 meet the other lanes

- **CAPABILITIES:** map files (N1257, places in layers) and email capture (N824) both touch these types; a message forwarded in must reach the same email reader. To go through BOB.
- **PLATFORM:** the record each added type puts on a team's object (a mailbox, a database); the container's load for LibreOffice conversions.
- **UX-DESIGN:** the sentence for a held-and-named file; "macros not run"; a multi-page TIFF's pages; the list of types shown to a member before they upload. As needs only.

## 5. Risks and rules every type carries

1. **Safety first** (K4831 (6)): reading never waits on the scan, said plainly; macros, embedded objects and remote links are never run or followed; an encrypted file is stated "needs a password".
2. **Detection by content** (GAP-1.8 (a)): a file's type comes from its bytes, not its extension or declared type, so a renamed file is read as what it is.
3. **Parts are read**: footnotes, comments, speaker notes, tracked changes, sheet names, hidden rows and slides are units marked with their kind (K4831 (7)).
4. **Nothing guessed**: an unmapped character or unreadable page is stated (K4628 point 2).
5. **Licences before tools** (GAP-3.0): LibreOffice, Tesseract, libvips, libarchive or 7-Zip, plus any PST or Access library, each checked and recorded; a copyleft tool only as a separate program. I assert no licence here; each is for GAP-3.0.

## 6. Sizes (N1267) for the added types, proposed

| class | bound | applies to |
|---|---|---|
| document, text | 100 MB or 5,000 pages (question C of part 1) | text-like, RTF, legacy Word, PowerPoint, SVG, captions |
| spreadsheet | 50 MB or about 1M rows (.xls: its own 65,536 rows a sheet) | XLS, XLSM, delimited, SQLite/Access (Tier 3) tables |
| image | 50 MB each; multi-page TIFF counts pages within 5,000 | images |
| archive | 500 MB as uploaded, 2 GB unpacked, each member within its kind | ZIP, TAR, GZ, 7z, **MBOX** (a mailbox is an archive of messages), PST |
| message | a message within the document bound; attachments are members | EML, MSG |

A file over its bound is refused with its size, never half read (K4628, K4831 (4)). **Open:** the number of messages and members a mailbox may hold (a protective limit, BOB's per K4831 (8)).

## 7. Next steps (mine)

- **S1** On Bob's answers: finalize §3, then write the requirement drafts (format-registry entries, readers per type) in the house format.
- **S2** (begun, §2a) Continue the sample: open the 26 zips and 22 "Excel" files, measure packet sizes and pages from Legistar, try the request system's public pages.
- **S3** (done as DRAFT in `CORPUS-N1268.md`).
- **S4** (done as DRAFT in `SIZES-N1267.md`).
