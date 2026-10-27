> **Split K5021.** Part of `envelope-docs-T51.md`, split by section; contains §5 (the corpus). The rest: the head, §0, §3, §6, §7: `envelope-docs-T51.md`; §2 (the state of the code, with X1-X36 at §2.2): `envelope-docs-T51-s2.md`; §4 (the envelope): `envelope-docs-T51-s4.md`; §1 (the architecture): `archive/envelope-docs-T51-s1.md` (archived whole).

## 5. The corpus (K4798 (5), as K4785 (3))

### 5.1 How it is made

**One generator, seeded, that knows its own truth** (the PDF plan's design, so one runner serves both). A new `docgen.mjs` in **test-support** (`bio-plane/test/` beside `make-zip.mjs` and `pdfgen.mjs`; BOB adds the path to `modules.json`). It writes through the **one** ZIP writer, `make-zip.mjs`, which already makes hostile and conforming ZIPs byte-exactly, plus `zipBomb` and `nestedZip`, and has two external oracles (`unzip -t`, Python `zipfile`) (H20). The six independent ZIP writers in module tests (office-readers `fixtures.mjs`/`large.mjs`, odf-reader `pkg.mjs`, ooxml `zip.mjs`, doc-clean, file-safety, `xlsx-gen.mjs`'s `zipChunks`) and the eighteen inline ones are moved onto it as each module's job touches its tests (P7: the module owner does it). Two things the shared writer lacks and must gain: **ZIP64** in the streaming writer (`zipChunks` has none; needed for archives over 4 GiB declared and 65,535+ entries) and a **lazy streaming mode** so a 100 MB or 500 MB file is never in the generator's memory (H20 ran: 500 MiB-declared ZIP 2.9 s, 100 MiB RTF 0.25 s, 5,000-slide PPTX 0.8 s, 10 MiB random-text DOCX 1.9 s: generation is cheap).

Its input is a spec of these axes:
- **kind** (text, html, docx, odt, pptx, odp, rtf, eml, doc/ole, zip, a served page);
- **size axes**: bytes, decoded characters, paragraphs/slides/cells/links/tables, entries, entry-name length, nesting depth, compression ratio, requests, DOM size;
- **content axes**: part kinds present (footnote, header, comment, deleted, notes, hidden slide, text box, image-only), unit length (one 3 MB line; 25-byte lines), line endings, the encoding (UTF-8, UTF-8 BOM, UTF-16LE/BE with BOM, Latin-1, Windows-1252, a bad byte), a charset declaration (header, `<meta>`, XML declaration), markup shape (nesting depth, unterminated tags, `<main>` present/absent, link-only lists);
- **package axes**: classic vs ZIP64, central directory in physical or shuffled order, a lying directory, an encrypted member, trailing garbage, macro-enabled flavour, a polyglot prefix;
- **served-page axes** (for the loopback origin of §5.2 path W): status, content type, `Content-Encoding`, redirects, a delay, a body that never settles, a client-rendered shell and its hydrated DOM;
- **a seed**.

Its output is the bytes (or the origin's script) plus a **truth file**: each unit's expected text with its part kind (every paragraph/slide/line carries `<seed>-u<n>-k<part>` and a word from a small vocabulary with accents, ligatures, CJK, RTL and a combining mark, so a unit is checkable alone); the first, middle and last markers; the units expected *unread* with their named reason; the **expected statement** for a refusal (its code and its figures: `TOO_LARGE {size, bound}`, `UNSUPPORTED_FORMAT {kind}`, `ENCODING_UNSUPPORTED {name}`, `ENCRYPTED`, `STRUCTURE_OVER_BOUND {part, bound}`, `TOO_MANY_OBJECTS {n}`); the archive's expected member table (name, state, bytes, sha); the visitor view's expected fidelity statement. The generator is deterministic in its seed; large files are written once to `BIO_FIXTURE_CACHE` by spec hash and never committed. Real public files (the four government pages in `reading-pipeline/fixtures/`, plus N1268's fixed set once chosen) stay as they are, SHA-pinned.

**Two oracles, never the reader's own past output** (pdf-pixels R40's rule).
- The generator's truth, for every file.
- An independent reader: **LibreOffice** (`soffice --headless --convert-to txt`, present on the build machine and in the file-scanner image) for DOCX, ODT, PPTX, ODP, RTF, DOC; `unzip -t` and Python `zipfile` for every archive and package (as `make-zip` does); **Chromium** (`/opt/pw-browsers`, Playwright) for the visitor view's visible text and the HTML visible-text truth; ClamAV with EICAR for the scanner files. Where the oracle and the truth differ the generator is wrong and the file is fixed. Cases where the reader is *deliberately* stricter than LibreOffice (a tracked deletion is a unit with part kind `deleted`, not dropped) are listed in the truth file.

### 5.2 The entry paths

| Path | What it runs | Owner |
| --- | --- | --- |
| **R**, the real path | `test/m/plane/shape/harness.mjs` as a suite runner. It already feeds *any* file on disk unchanged (`{kind:"file", path, bytes, name, type, marks}` → `createReadStream`, `harness.mjs:183`; H20 ran a generated DOCX through it with no repository change): `captureOf(ctx).uploadCapture`, the capture screen's promotion, the door's `/pendingadd?kind=reading`, the ledger's `onAlarm` driven tick by tick to the end, then `op=search` for the markers and `op=reading` paged by `next` to the end. Memory by `capFor` (`128 + 39 − N`, the kinder convention, stated per file). Per tick it reports units, work counts, bytes pulled, store calls and the longest operator stretch, **never a time from the object (R-CLOCK)**; a wall bar only on one core (`taskset -c 0`) and judged against a control taken in the same run (K4787) | **plane** (the twin of R84: `docs-shape.test.mjs`, heavy, run alone), with the file's module naming the failing-first test |
| **R+** the harness gains (H20 §6): (a) a **truth file per document** (expected units and markers, not only counted marks); (b) the snippet regex widened (`harness.mjs:303`); (c) an **archive kind**: members become separate captured documents, so `done` gains a member table and each member is read and searched; (d) **web capture and unpack are driven** (it drives `uploadCapture` only today): `acquire` against a loopback origin, `unpack` by ledger, the owed `subresources` row; (e) per-tick peaks sampled *during* the alarm (the 2 ms timer is cleared at `harness.mjs:254-255` so tick peaks are one sample after the alarm), ArrayBuffers counted; (f) three faults beside the PDF plan's `restartAt`, `storeFailAt`: `entryThrowsAt` and `objectGoneAt` (the tick ≥ 2 failures, X13) and `killAt` (the object dies mid-tick: the poison document, X2) | plane (harness), test-support |
| **M**, the module interface | Each module's own tests read the same generated files at their interface, so a failing-first test points at its module: `docxEntry.parts/text/structure`, `odfEntry`, `pptxEntry` (with `pdfWork()`-style counts of bytes scanned and objects retained, R-CLOCK), `ooxml.readContainer/discriminate/listArchive`, `unpack`, `read` in pieces with real members bound, `visibleTextOfHtml`, `identify/doctypeFor`, `cleanDocument`, file-safety `formatOf/threatOf`, the scanner container's `/scan` and `/render` | each module (the "Owner" column) |
| **W**, workerd | The files that test the thread and the platform's own behaviour (contention I13, `DecompressionStream` behaviour, the visitor view, the alarm gap) also run in Miniflare with the real Durable Object (`r7-contention`'s pattern; the `l75`/`l77`/`g54`/`g55` family). Memory is not asserted there (local workerd enforces none, G27's lesson) | plane |
| **V**, the visitor view | The fake browser cannot show scroll, banners, shadow DOM or iframes. Two further sets: **fake-browser** (the module's existing path: statuses, errors, 3,000 requests, 64 MiB of bodies) and **real Chromium** against a **loopback origin** (Playwright, `proxy` unused, no live site) for fidelity and for the content test. The loopback origin is the corpus's "served page": a small `node:http` server the spec scripts (status, delay, redirects, `Content-Encoding`, client-rendered shell) | capture-sources (render), acquisition |
| **S**, safety | file-safety with the real scanner container for the EICAR and render files (`container-images` workflow's image; ClamAV is not on the build machine, so these run in the container job, which is also where `soffice` and `pdftoppm` are); the rest at file-safety's interface with the scanner scripted | file-scanner, file-safety |

**Never a live site.** The web files use the loopback origin only. The live subset on biosmoke8 (§5.5) uses files the corpus *uploads* and pages the corpus *serves from the test machine's own origin through the environment's proxy* (R-PROXY) only if Bob has a reachable test origin; otherwise web captures stay in the offline paths and the live subset is uploads only.

**When it runs.** At every round end, whole, never only for the fix in hand (K4785 (3)), in its own session and container with nothing else in it (K4787 (3)), then again for the time-sensitive set on one core (`taskset -c 0`). **Seeded variations:** the 8 fixed seeds of §5.4 plus 8 seeds derived from the round's tranche commit; a red keeps its seed and spec in the run's record, and the generator's shrinker (halve the size axis, drop axes one at a time) gives the smallest failing spec before the red is planned (K4426 (3): the walker's exact case is the shrunk spec). The module M tests run in each module's job as today; the R and W files run at the round end.

**What passing means.** A file passes when I1-I22 hold for it, or, for a refusal file, when I3, I7, I20, I21 and I22 hold with exactly the statement its truth names and nothing else is read wrongly. The "Passes when" column gives only what is particular to the file. **The bytes, calls and rows asserted are counts (R-CLOCK).**

### 5.3 The files

IDs: T text, H HTML, O DOCX, P PPTX, D ODF, R formats with no reader (statements), A archives, V web capture and visitor view, S safety and scanner, C doc-clean, Q profiling, F faults and combinations. **L** marks the smallest file of a family, the live subset (§5.5). "R" is the real path; every file also runs at its owner's interface (M) unless the path column says otherwise. In "Owner", the first module named owns the failing-first test; plane owns R for all of them.

Sizes are the file's bytes unless "declared". "Expected" is the outcome today (**RED** = reproduced red by this review, **UNKNOWN** = not run) and the outcome the bound in §4 requires.

**T. Plain text** (the family with the most prior work: windows work; the ladder and encodings do not)

| ID | File, how generated | Path | Passes when | Owner |
| --- | --- | --- | --- | --- |
| T1 **L** | 12 MB UTF-8, 100-byte lines, 2 parts (G70/G88 shape; `r7-texts.mjs`) | R, M, W | ticks ≤ units/4096 + 2; bytes pulled ≤ 67 MB; first, middle, last marker found; no stretch above the budget (I5) | reading-pipeline (has M), plane (R) |
| T2 | 24 MiB − 1, 24 MiB, 24 MiB + 1 | R | the first two read whole under I4; the third a named statement with its figure, `final`, nothing owed (until Q1's tier is built; then read) | reading-pipeline |
| T3 | 22 MiB with one U+2014 (two-byte string; +117 MB RSS in node) | R | I4 at the ceiling, or a stated refusal | reading-pipeline |
| T4 | 24 MiB of 25-byte lines (~1 M units) | R | ticks ≤ units/4096 + 2; A8 ceiling stated | reading-pipeline, extraction |
| T5 | one 3 MB line without spaces; one 3 MB line of CJK; one 300,009-char single line uploaded first (X14) | M, R | every word counted once (R35); last chunk found; **nothing cut and nothing owed that is not read** (I17) | reading-pipeline |
| T6 | CR-only, CRLF, LF, U+2028, U+0085, mixed (1 MB) | M | one unit rule (C6); each line citable | reading-pipeline |
| T7 | the encoding matrix: Latin-1, Windows-1252, UTF-16LE/BE with BOM, UTF-8 with BOM, UTF-8 with a bad byte at the middle and at the end; each as `text/plain` with and without `charset`, as upload and as fetched; at 100 KB, 3 MiB and 9 MiB (multipart) | M, R | the text equals the truth or `ENCODING_UNSUPPORTED {name}`; **never** `U+FFFD`/NUL units with `failure: null` (I16); the same file gives the same answer by upload, fetch and parts | reading-pipeline, acquisition |
| T8 | binary labelled `text/plain`: an OLE blob, random bytes, a PNG; single part and in parts | M | one `BIN` rule; stated (C2) | reading-pipeline, acquisition |
| T9 | empty, 1 byte, whitespace only, BOM only, 7 bytes of NUL | M | one stated answer each (not "non-textual or too large") | reading-pipeline |
| T10 | 30 MiB and 100 MB text (the tier) | R | until the tier is built: `TOO_LARGE {size, bound}`; after: read in windows to the last line within D1/D3 | reading-pipeline |
| T11 | multipart text 10 MiB and 19 MiB (X8: 111 and 211 ticks, 1.1 and 4.0 GB served) | R | bytes pulled ≤ 2 × file (a window cursor on the assembled whole); `transient` never unresolvable | reading-pipeline, acquisition |
| T12 | `.log`, `.json` (one 3 MB line), `.tsv`, `.xml`, `.md` as `text/plain` and `application/json` | M | read as lines; a one-line JSON is chunked and found at its last byte | reading-pipeline |
| T13 | a note that mentions `<html>`/`<!DOCTYPE html>` in the first KiB (X27) | M | read as text, not as HTML (the declared type wins when no tag structure follows) | format-registry, reading-pipeline |
| T14 | a hard-wrapped text with no blank line; a phrase spanning two lines and two chunks (X14) | M | a phrase across a seam is findable (overlap or seam stated) | reading-pipeline, extraction |
| T15 | the same text, whole and in pieces (I6); the same bytes twice (I14) | M | stored equal | reading-pipeline, extraction |

**H. HTML pages** (as sent; the visitor view is V)

| ID | File | Path | Passes when | Owner |
| --- | --- | --- | --- | --- |
| H1 **L** | the four real government pages in `fixtures/` + 12 seeded variants (nav, aside, dialog, share bar, `main` present/absent, template tokens) | M | the units equal the truth; cited extents resolve; **what was dropped is counted** (C5) | reading-pipeline (has M) |
| H2 | 6 MB HTML, 90,000 `<p>`, one part | R | I4; ticks do not re-pull the whole each time (X8) | reading-pipeline |
| H3 | 2 MiB, 2 MiB + 1, 8 MiB, 8 MiB + 1 (parts) | R | A5: read, or `TOO_LARGE {size, bound}`; never "(multipart)" | reading-pipeline, acquisition |
| H4 | closed nested `<div>` depth 2,000 / 4,000 / 8,000; 16,000 unclosed `<p>`; 4,000 unclosed `<li><a>`; 20,000 unbalanced `<div title="` | M | the stretch counted in elements between yields within D2 (X31); a link-only list kept or stated, not silently dropped | reading-pipeline |
| H5 | charset matrix pages: Windows-1252 with `<meta charset>`, Shift-JIS, UTF-16 with BOM, header and meta in conflict (the header wins) | M, R | I16; the page title, the profile and the reading decode alike | reading-pipeline, acquisition, site-profiles |
| H6 | `noscript`, `hidden`, `display:none`, `aria-hidden`, `<template>`, comments, `<script type=application/ld+json>` text; `<main>` holding 10 % of the words | M | C5 stated; no hidden text indexed as visible, or marked | reading-pipeline |
| H7 | a page with the markup of a client-rendered app plus 30 paragraphs of server text (X22); a Markdown text with ten `<word>` shapes; an XML data file; an RFC-822-looking text | M | not "unwatchable" unless CERTAIN; the verdict does not change the reading | site-profiles, docprofile |
| H8 | a 240 KB `<div` run; a 400 KB `a-a-a-…`; 16,000 addresses on one line; 40,000 definitions; 150,000 dates | M | each detect within its work count (D8); no object kill | docprofile, doctypes, site-profiles |

**O. DOCX** (the kind with the largest gap)

| ID | File | Path | Passes when | Owner |
| --- | --- | --- | --- | --- |
| O1 **L** | the size ladder by decoded text: 0.5, 2, 4.8, 9.7, 18, 20, 32, 32 MiB + 1; 100 MB of text (`bigDocx`, seeded, independent expected text) | R, M | within A2/A3 and D3: read whole, or `TEXT_OVER_BOUND` before the walk; ArrayBuffers counted (I15); ticks do not re-parse (I8, X8) | office-readers, reading-pipeline |
| O2 | the shape ladder at **equal bytes**: 19 MiB declared of one-cell tables; `<w:p/>`; 894,373 tiny paragraphs; 20,000 and 200,000 hyperlinks; 3,000 nested tables; 200 tables | R, M | **the object is never killed** (I15, X2); over A3: `TOO_MANY_OBJECTS {n}` named before the walk; no stretch above D2 | office-readers |
| O3 | tables of 500, 1,500, 3,000, 10,000 rows × 4 cells, with INTRO and ENDMARKER paragraphs | R, M | **the text units are present** (X1); `cells` held or omitted with a statement; row under 1 MiB (A9, I17) | office-readers, extraction |
| O4 | every part kind: footnotes, endnotes, headers, footers, comments, tracked insertions and deletions, text boxes, SDT content, SmartArt, a chart, a hyperlink, `noBreakHyphen`/`sym`, a field result | M, R | each text part is a unit with its part kind, or is named unread (I17, C4); truth file lists which; LibreOffice oracle agrees on the text | office-readers |
| O5 | a DOCX that is one image; text + scans; an embedded OLE object | R, M | `image_unread` marker, OCR owed when SCAN's route exists; the embedded object named "not read" | office-readers, reading-pipeline |
| O6 | package bombs: a 120 MiB zero-filled embedding (123 KB); 250 MiB; a 150 MiB `presentation.xml` / 100 MiB `.rels` / 20 MiB `[Content_Types].xml`; ratio 1,100 and 1,101; a `document.xml` declaring 2 GB | M, R | refused before inflation **by name** (B1, B2); peak ArrayBuffer within D3; object alive; the embedding streamed, never held | ooxml, office-readers |
| O7 | hostile XML: unterminated tag (953 bytes; 40,000 copies of `<a b="`), 20,000 unclosed `<w:comment `, unclosed `<!x>` × 200,000, `&#x110000;` / `&#99999999999;` / `&#xD800;` / `&#0;` / `&#12ab;` in `core.xml`, a rels target, `[Content_Types].xml` and the body, CDATA in `<w:t>`, a UTF-16LE `document.xml`, NUL | M | linear in the bytes (a count of bytes scanned ≤ 4 × the part); **never throws** (R21/R25); a deterministic failure is `final` with its reason, not `transient` (I20, X12); UTF-16 decoded or named; CDATA kept | office-readers, ooxml |
| O8 | package shape: 60,000 entries; 5,000-slide-sized (15,000+); ZIP64; trailing garbage; a lying central directory; an encrypted member (ZipCrypto, AES); macro-enabled (`.docm`); `.dotx`; a ZIP renamed `.docx`; a `.docx` with no `[Content_Types].xml` | M, R | per B3/B4/B9; the flavour table reads the templates; the rest is stated by cause | ooxml, office-readers |
| O9 | tier files: 8 MiB − 1, 8 MiB + 1 (two parts), 20 MiB + 1, 24 MiB + 1, 40 MB, 100 MB with large pictures and ~600 KB of text (the 84.8 MB deck's shape) | R | A1: read from the parts needed, or `TOO_LARGE`; **stored `profile.format` is `docx`, not `undetermined`** (X5); file-safety judges it from the directory, not the head (E3) | acquisition, file-safety, reading-pipeline |
| O10 | the same DOCX as an upload, as a fetched file served `application/vnd…`, as `text/html`, as `application/octet-stream`, with the wrong extension | R, V | one format, one reading, from the bytes (magic wins, stated); the member's name for it is the title (G4) | acquisition, capture |
| O11 | polyglots: a DOCM with `%PDF-1.7` in its first 1 KiB; a text starting `%PDF-1.4 is the version…`; a ZIP/PDF hybrid | M | kind from the structure, not the first KiB; macros seen (X18) | file-safety, format-registry |
| O12 | titles: a DOCX with `dc:title`, with none and a heading, with none | M | G4 | acquisition |

**P. PPTX**

| ID | File | Path | Passes when | Owner |
| --- | --- | --- | --- | --- |
| P1 **L** | 100 slides; 5,000; 10,000; 10,001 | R, M | A6; each slide a unit once; the 10,001st a named `TOO_MANY_SLIDES` | office-readers, reading-pipeline |
| P2 | one slide of 300,000 characters | M, R | chunked, not cut (A7); the last word found | reading-pipeline |
| P3 | speaker notes, hidden slides, slide master text, comments, SmartArt, a table of 5,000 cells, an embedded video | M | part kinds as O4; hidden slides read and marked hidden | office-readers |
| P4 | the 84.8 MB-of-pictures deck with 630 KB of text | R | A1/B1: read from the slide parts only; images streamed | office-readers, ooxml |
| P5 | `.ppsx`, `.potx`, `.pptm`, a `.ppt` (OLE) | M | flavour read, or `UNSUPPORTED_FORMAT {kind}` | ooxml, office-readers |
| P6 | hostile XML as O7 for `<a:t>` and `presentation.xml` | M | as O7 | office-readers |

**D. OpenDocument**

| ID | File | Path | Passes when | Owner |
| --- | --- | --- | --- | --- |
| D1 **L** | ODT 30,000 paragraphs with footnotes (the fusion case), tables, tracked changes (1,000 overlapping regions over 200 KB) | M, R | footnote words separated (X11); `structure()` linear in the regions (X6) | odf-reader |
| D2 | ODP 3,000 pages with nested `draw:g`; notes | M | pages once; nesting depth bounded | odf-reader |
| D3 | `content.xml` of 19.5 MiB (ODT, ODP) and 20 MiB + 1; flat ODF (`.fodt`) | R, M | D3 of §4: within the heap at the plane's shape or a named refusal; **a 100 MB ODT is not a 100 MB buffer** (B/A1 range source) | odf-reader |
| D4 | hostile: 96 KB of `<a ` with no `>` (9.7 s); `<!x>` × 200,000 in `styles.xml`, `meta.xml` | M | linear; the cleaner too (C3) | odf-reader, doc-clean |
| D5 | `content.xml` in ISO-8859-1, UTF-16, with an XML declaration; `&x;` custom entity; `&#xD800;` | M | I16: decoded by the declaration, or named | odf-reader |
| D6 | ODS with 20 MB `content.xml` (re-walk 7: "Unread" for ever) | R | shared with SHEET #1: a named refusal with a figure, nothing "Unread" | odf-reader (SHEET) |

**R. Kinds with no reader today** (the files exist to prove the *statement*, then the reader)

| ID | File | Path | Passes when | Owner |
| --- | --- | --- | --- | --- |
| R1 **L** | RTF: plain, with `\'e9`, `荤?`, tables, an embedded object, 3 MB; sent as `text/rtf`, `application/rtf`, octet-stream, `.rtf` | M, R | today RED (control words as text, or a false sentence). Required first: "RTF is not read yet" (G2, I22); later: the text equals the truth (LibreOffice oracle) and the object named | reading-pipeline (+ a new reader), acquisition |
| R2 | `.eml`: base64 body, quoted-printable, multipart/alternative, an attachment (a DOCX), `=?UTF-8?B?…?=` subject, 3 MB; `.msg`; `message/rfc822` | M, R | today RED (raw MIME indexed). Required: "email is not read yet"; later: the body decoded, the attachment a member of its own (I18), the headers cited | reading-pipeline, acquisition, doorbell |
| R3 | `.doc`, `.xls`, `.ppt` (OLE2), an encrypted OOXML package, a Word 6 file | M | `UNSUPPORTED_FORMAT {ole}` / `ENCRYPTED`, never "non-textual or too large"; no "Read it" button (X10) | reading-pipeline, file-safety |
| R4 | binary garbage with `.docx`, `.zip`, `.pdf` extensions; a ZIP with no content types; an empty file | M | stated by cause | format-registry |

**A. Archives and their members**

| ID | File | Path | Passes when | Owner |
| --- | --- | --- | --- | --- |
| A1 **L** | ZIP with 3 text members | R+, M | **an uploaded ZIP is opened like a fetched one** (X3); each member filed under the project, read, searchable; the archive's own reading says "archive of 3 members, read separately" (X28) | acquisition, capture |
| A2 | ZIP holding a DOCX, a PPTX, a PDF, a text, an `.eml` | R+ | each member's kind follows its own rules; the DOCX member's reading equals the DOCX uploaded alone (I6) | acquisition |
| A3 | nested depth 2, 3, 4; a ZIP inside a DOCX's `embeddings/` | M, R+ | depth 4 and the embedding named "not opened" (B6) | acquisition, ooxml |
| A4 | 10,000 and 10,001 entries (stored, 1 KB each) | R+ | I18: each entry accounted; the 10,001st archive refused whole by name | acquisition |
| A5 | 10,000 entries (192 MiB) with the central directory in shuffled order; in physical order | M, R+ | part reads ≤ 2 × the physical-order count (B5; today 9,180 vs 25); ticks do not list again | acquisition, ooxml |
| A6 | 2,000 entries with 60,000-byte names (229 MiB); 1 entry with a 65,535-byte name; duplicate names; `../` and absolute paths; names in CP437, UTF-8 flag off | M | directory ≤ 16 MiB, names ≤ 4,096 stated (B4); no path escapes; names decoded or kept raw with a flag; heap within D3 | acquisition, ooxml |
| A7 | ratio 1,100 and 1,101 per entry; 500 MB declared as 460 KB; 255.9 and 256.1 MiB expanded; the tier's 500 MB | M, R+ | B2/B7/Q8 outcomes by figure | acquisition |
| A8 | encrypted members (ZipCrypto, AES), an all-encrypted archive, a self-extracting stub, an empty ZIP (`PK\x05\x06`), ZIP64 > 4 GiB declared, 65,536 entries | M | named (B9), never `clean`, never `waiting` for ever | acquisition, ooxml |
| A9 | `.tar`, `.gz`, `.tar.gz`, `.7z`, `.rar` (with EICAR) | M, S | B8: "ZIP only" stated, or read; the scanner not `clean` for a RAR it could not open (X16) | acquisition, file-scanner |
| A10 | 100 DOCX members of 1 MB; 10 members of 50 MB (over the 8 MiB part line); one 100 MB member | R+ | each member read; a member over 8 MiB is whole under its own digest (X20: today parts only) | acquisition, reading-pipeline |
| A11 | the transient fault: a store put fails for entry 57 of 200; the promotion fails for entry 3; the object is killed between ticks; the daily budget stops the run | R+ | the entry is retried (I18); a stranded member never; a continuation member keeps the project (X20) | acquisition, plane |
| A12 | the same archive uploaded twice; fetched and uploaded; with 17 and 30 members promoted together | R+ | one set of members; all 30 followed (G18, X15) | acquisition, control-plane |

**V. Web capture and the visitor view** (offline; loopback origin)

| ID | File (served page) | Path | Passes when | Owner |
| --- | --- | --- | --- | --- |
| V1 **L** | a static page served as sent: 200 KB; 8 MiB; 15 MB; 41 MB | R+, V | within K4562: answered in 15 s up to ~8 MB, else "being fetched" at once; the member told when it completes (G85); `Content-Length` handled (G2) | acquisition, capture |
| V2 | the same page in Latin-1, Windows-1252, UTF-16, with header and meta charset; gzip-encoded; a gzip bomb (1 GB expanded); a redirect chain of 5 and of 50; a 403; a 429 | V, M | I16 (the title and the reading alike); the bomb refused by ratio; redirects bounded and stated | acquisition |
| V3 | a DOCX / RTF / ZIP / PDF served as `text/html`, `application/octet-stream`, or with a `Content-Disposition` | V | the bytes decide the kind; the member sees the file as that kind | acquisition |
| V4 | a client-rendered shell (empty `<div id=root>`) that hydrates in 3 s, 9 s, 12 s, never; with 3,000 requests; with 64 MiB of bodies; a DOM of 24 MiB and 25 MiB | V, W | the visitor copy filed with its fidelity (I19); the 12 s page takes the owed path and is **delivered** (G85, G72); 3,000 requests capped (F2); memory within F3; the 25 MiB DOM refused before the string is built (A11) | capture-sources, acquisition |
| V5 | a page that answers 403 / 404 / captcha to the browser but 200 to the fetch; a `chrome-error://` page; a blank page | V | **not filed as the document** (F6, I19); stated "the page did not render" | capture-sources |
| V6 | infinite scroll (a 300-row agenda that renders 20 rows at a time), `loading=lazy`, an iframe agenda viewer, an open shadow root, a cookie banner, a modal, an `alert` dialog | V (real Chromium) | the copy's words state first-load-only (F7); banner text marked; nothing hangs on the dialog | capture-sources |
| V7 | the render fails: session refused, 3 per second, open bound, page crash, an unreachable host | V | `transient` retried with back-off, `permanent` final **with its detail** (G72, F5); the daily allowance charged the real time (F4, X23); "Finish it" never answers `NO_SUCH_SESSION` | capture-sources, acquisition |
| V8 | a held 41.5 MB capture pressed again; a project the member is not in | R+ | no apology plus raw statement (G73); G74's refusal | screens-intake |
| V9 | web page title / name for a fetched DOCX | M | G75 | capture |

**S. Safety and scanner** (container job where ClamAV is needed)

| ID | File | Path | Passes when | Owner |
| --- | --- | --- | --- | --- |
| S1 **L** | EICAR in a DOCX, a ZIP, a nested ZIP, a RAR; a password ZIP/DOCX/PDF | S | found; **encrypted is `encrypted`, never `clean`** (B9, X16); a RAR not openable is `unknown`, stated | file-scanner, file-safety |
| S2 | a 21 MiB DOCX; a 1,875-page DOCX (192 KB); a 5,000-page document; a 362 KB DOCX expanding to 155 MB | S | judged from the directory (E3); derived PDF ≤ 32 MiB, `x-truncated`; the page cap applies before conversion; `TIME_LIMIT` is retried | file-scanner, file-safety |
| S3 | UTF-16 and Latin-1 text; HTML with inline `<svg`; two prose lines with equal commas; an RTF with an embedded object; an `.eml` with an executable attachment | M | kind by structure; RTF/email not graded low as plain text (X18) | file-safety |
| S4 | the renderer healthy 10 days after `TIME_LIMIT` (clock advanced) | M | requeued (X19) | file-safety |
| S5 | a 256 MiB archive with 5,000 members of 50 KB each; a 200-target batch | S | `threatOf` peak within D3 (no member retained to the call's end); batch disk stated | file-safety, file-scanner |

**C. doc-clean, Q. profiling** (hostile inputs; M only)

| ID | File | Path | Passes when | Owner |
| --- | --- | --- | --- | --- |
| C1 | a 70,009-entry DOCX; a 65,535-entry; a 16 MiB document; a crash mid-clean | M | `TOO_MANY_ENTRIES` or written count == read count (B12, X21); the next wake does not loop | doc-clean |
| C2 | metadata: `dc:title/description/subject/keyword`, `text:author-name` fields, nested docx/PDF parts outside `embeddings/`, document-statistic | M | the obscured copy holds none, or R6 names what it keeps (X21) | doc-clean |
| C3 | 800 KB of `<!x>`; 350 KB hostile manifest | M | linear | doc-clean |
| Q1 | Q-set: staff-directory regex 400 KB; 16,000 addresses on one line; 17 MB CSV of distinct addresses; `assess` of two 8 MiB ASP.NET pages; UTF-16 ASP.NET page | M | each within D8; the page profiled with its charset (G3) | doctypes, site-profiles |

**F. Faults and combinations** (the PDF plan's faults, for these kinds)

| ID | File | Path | Passes when | Owner |
| --- | --- | --- | --- | --- |
| F1 | tick ≥ 2 faults (`storeFailAt`, `entryThrowsAt`, `objectGoneAt`, `restartAt`, `killAt`) on T1, H2, O1, P1, A10 | R+ | the row retries and finishes, or ends `final` with its reason; never `partial` without one (I8, I20, X13) | extraction, plane |
| F2 | five documents (a text, an HTML, a DOCX, a PPTX, a ZIP) uploaded at once; then eight, to the K4785 figure of 5 | R+ | one heavy row a tick; all finish; cheap reads wait < 500 ms at p95 (I13) | plane |
| F3 | contention: a DOCX and an HTML tick running while `/`, `whoami`, `queue?count` are timed from outside | W | I13 (the thread is yielded by the entries, X8) | plane |
| F4 | the same document as upload / fetch / unpacked member / visitor-view copy | R+ | the same units (I6, I14), the same title, the same citations | extraction |
| F5 | a document read, edited (a DOCX with one word changed), re-uploaded | R | the newer-version path (G66, G89), prior units superseded | reevaluation, extraction |
| F6 | the cross product at small size: {format} × {encoding} × {part kinds} × {structure} × {tick fault}, 8 seeds a round (§5.4) | R | I1-I22 | each module |

### 5.4 Seeded variations

Eight fixed seeds (1-8) plus eight derived from the tranche commit run per round over the cross product F6 and over O2, O7, A4-A6, V4, H4 with the size axes sampled log-uniformly between the corners above. A file that fails keeps its (seed, spec); the shrinker halves the size axis and removes axes one at a time to the smallest failing spec, which becomes the failing-first test of the cause (K4426 (3)). The seeds' vocabulary exercises accents, ligatures (`ﬁ`), CJK, RTL and combining marks (C7, C8).

### 5.5 The live subset (K4785 (4), brought forward for these kinds)

The files marked **L** are the live subset on biosmoke8 at each redeploy; choosing the exact set is item (4)'s, not this plan's: **T1** (12 MB text; the G70 run), **O1** at 4.8 MB text (the smallest that fails at 48 MB heap), **O3** at 3,000 rows, **P1** at 100 slides, **D1**, **H1** (the four real pages, uploaded as files), **R1** (the RTF statement), **A1** (an uploaded 3-member ZIP: opened), **S1** (EICAR in a DOCX once the scanner has signatures), and, if Bob has a reachable test origin, **V1** and **V4**'s 9 s page. Each goes through the screens (the Add screen, the Document page's Next page to the last page, search for the last line), with the K4354 times beside the quiet re-time (R-QUIET). Until the web files can be served, they stay in the offline paths.

### 5.6 What running this costs (to be measured by the first run)

Generation is cheap (H20: seconds). The shape run is not: about 5 s per MiB of declared DOCX text in node (6 MiB: 22 ticks, 31.8 s; 8 MiB first tick 13.3 s); a 100 MB text of 80-byte lines is ~305 ticks. The R set is therefore heavy (K4792: a whole `module-tests.mjs` run already stopped at the 2-hour session bound with 170 of 176 modules reached): it runs alone, split in the corpus's own families, in a session-tracked background task. The M set is each module's own tests and adds seconds. Only the first run says the total; this plan does not guess it.

### 5.7 Owners

| Owner | Files |
| --- | --- |
| **plane** (R, the harness, W) | all R/R+ files; contention (F2, F3); the harness gaps R+ (a)-(f) |
| **test-support** | `docgen.mjs`, the shared ZIP writer (ZIP64, lazy), the loopback origin, the truth-file reader |
| **reading-pipeline** | T1-T15, H1-H6, O1, O4, O5, P1-P3, F1, F4 |
| **extraction** | T4, T14, T15, O3, F1, F4, F5 |
| **office-readers** | O1-O8, P1-P6 |
| **ooxml** | O6-O8, A3, A5, A6 |
| **odf-reader** | D1-D6 |
| **doc-clean** | C1-C3, D4 |
| **acquisition** | O9, O10, A1-A12, V1-V3, T7 |
| **capture** | A1, V1, V9, O10 |
| **capture-sources** | V4-V7 |
| **file-safety, file-scanner** | O9, O11, S1-S5, A9 |
| **docprofile, doctypes, site-profiles** | H7, H8, Q1 |
| **format-registry** | O11, R4, T13 |
| **text-chain** | T5 (R35), the chain algorithms' O(steps²) (X27) |
| **screens-intake, control-plane** | V8, A12 |
| **reevaluation** | F5 |

---

