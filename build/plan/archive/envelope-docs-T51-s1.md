> **Split K5021.** Archived whole, unchanged, from `build/plan/envelope-docs-T51.md` (finished: a family plan whose architecture K4798 (1) round 9 took up; no live document names its §1). Contains §1 (the architecture). The rest: the head, §0, §3, §6, §7: `envelope-docs-T51.md`; §2 (the state of the code, with X1-X36 at §2.2): `envelope-docs-T51-s2.md`; §4 (the envelope): `envelope-docs-T51-s4.md`; §5 (the corpus): `envelope-docs-T51-s5.md`.

## 1. The architecture (K4798 (1))

### 1.1 The flow, step by step

One document of these kinds reaches a member as a searchable, citable passage by one of four **entry paths**:

- **U, upload.** The member's browser sends the bytes: `capture.uploadCapture`.
- **F, fetch.** The member (or a monitor) gives an address: `acquisition.acquire` fetches the page or file, as sent.
- **V, visitor view.** The same address rendered in a browser: `acquire` with `render` asks the Browser Rendering binding for the DOM; the page as served stays the *shell*.
- **M, member of an archive.** `acquisition.unpack` cuts an archive's entries into captures of their own (only `acquire` calls it; §2.2 X3).

Every path then runs the same chain. Each step names the module, the code, and the requirement it serves. "—" means no requirement states it.

| # | Step | Module and code | Requirement | What the member sees |
| --- | --- | --- | --- | --- |
| 1 | **Admission of the bytes.** U: the request body streams in 8 MiB parts, each digested, `put` under its digest, the whole hashed (JS SHA-256, three passes); a refused or failed upload leaves its parts. F: `acquire` fetches (10 s wait, bar 15 s, owed past it), parts above 8 MiB. Cap 256 MiB, both paths | `capture/index.mjs:682-858`; `acquisition/index.mjs:359,1315,1384`; `record-core putFromParts` | acquisition R10, R95-R109 (R96, R100, R101, R103); capture R103 | "That file is too large to bring in this way. Nothing was written." with no figure (H08 D10) |
| 2 | **Format profile.** `detectFormat(bytes)` from the first KiB only above 8 MiB (`ODF_DIGEST_MAX`), the declared type only for `text/*` and a few XML types (`PROFILE_TEXT_MAX` 8 MiB), the name only for `.txt`, `.md`, `.csv` | `acquisition/index.mjs:130-160,1895-1948`; `formats.mjs` (format-registry) | acquisition (profile); format-registry; reading-pipeline R1, R2 | stored as `profile.format`: `docx` / `zip` / `undetermined` (X5) |
| 3 | **File safety and scan.** `file-scanner` (ClamAV in a container, content disarm and reconstruction, LibreOffice safe-view render), `file-safety` (grades, safe view, text view, held originals). **Neither gates reading**: the reading, extraction, acquisition and capture never consult a verdict or hold (H06) | `file-scanner/*`; `file-safety/*` (`formats.mjs:62-82` decides kind from bytes only) | file-scanner R3, R7, R16, R24; file-safety R1-R52 | a grade, "safe view", "scan pending"; a held or high file is read and searched the same |
| 4 | **Unpack (archives).** `unpack` lists the central directory (whole in memory), cuts 100 entries / 64 MiB a call, files each as a capture with `#zip:<index>` provenance, CRC-32 and SHA-256; the daemon drains the rest. Only ZIP | `acquisition/unpack.mjs:51-60,259-272,578-713`; `ooxml.mjs:1410-1819` (`listArchive`, `streamMember`); `plane/unpack.mjs`, `pending.mjs:255-274` | acquisition R38, R40, R100; ooxml R28, R30 | the archive screen: entries `waiting`, `filed`, `not_filed` |
| 5 | **Read** (the hot path). `reading-pipeline.read(sha, cursor)`: `bytesOf` (the object, or parts assembled to 20 MiB) → a **format entry** by kind → text, units, counts, provenance; one piece per tick | `reading-pipeline/index.mjs:2255-2784` | reading-pipeline R1, R2, R10-R15, R17, R24, R32-R35, R37-R42 | "being read", `words_read`, a statement or the units |
| 6 | **Container parse** (office/ODF): zip directory, verified inflate, content types, relationships | `ooxml.mjs:451-1236`; `odf.mjs:187-700` | ooxml R1-R35; office-readers R2, R4-R12; odf-reader R1-R48 | — |
| 7 | **Clean** (HTML): `visibleTextOfHtml` drops furniture, keeps `<main>`; **doc-clean** (a different clean: the *copy* of a document published with a case, metadata scrubbed) | `reading-pipeline/index.mjs:1023-1204`; `doc-clean/*` | reading-pipeline R32; doc-clean R1-R10 | the units; for a case, an obscured copy |
| 8 | **Profile and classify** (content type): `identify` (site handler: WordPress, ASP.NET WebForms, client-rendered, conservative) and `doctypeFor` (regulation, policy, minutes, agenda, calendar, staff directory, staff report) over the text | `docprofile/*`; `site-profiles/*`; `doctypes/*` | docprofile R18, R38, R39; doctypes R37; reading-pipeline R11, R42 | "an application that builds its pages in the browser", "unwatchable", a doctype |
| 9 | **Interpret.** The doctype's `parse` (entities, references, dates), `readText` for entries | `doctypes/*.mjs`; `docprofile/readtext.mjs` | doctypes R1-R37; text-chain R1-R104 (the provenance grammar the readings are written in) | entities, "this document is a regulation" |
| 10 | **Store and index.** `writeReading` (a reading row; 1 MiB guard), `indexUnits` (per-piece 2 MiB / 4,096 units), the FTS index | `extraction/index.mjs:1085-1550` | extraction R22, R90, R91, R96, R97 | search, the Document page, `completeness` |
| 11 | **Continue.** The ledger row `reading` is re-run one heavy row per alarm tick until no more; `#continueText` appends the next piece | `plane/pending.mjs:60-364`; `extraction/index.mjs:759-900` | plane R77, R84, R93; reading-pipeline R40 | "being read" until the last piece |
| 12 | **Web capture's bookkeeping.** held captures, sessions, links, site assets, render allowance | `capture/index.mjs` (the store behind acquisition) | capture R1-R106; capture-sources R1, R5, R6, R9, R20, R25, R26, R68 | the Capture and held-captures screens |
| 13 | **Visitor view.** CDP over Browser Rendering: navigate (10 s), wait (15 s, networkidle), serialise `documentElement.outerHTML`, collect subresource bodies (400 / 8 MiB / 64 MiB), file it as an ordinary `text/html` capture next to the shell | `browserrender.mjs`; `render.mjs`; `acquisition/index.mjs:1480-1530,2192-2286` | capture-sources R1, R5, R20, R23, R25, R26, R50, R68; acquisition R5, R99, R100, R106, R109 | a second document "as a visitor saw it", or "Unfinished", "Finish it" |

Steps 5-11 are **one machine for every kind**; what differs by kind is the *format entry* chosen in step 5 and what it can return (§1.2).

### 1.2 Which reader each kind gets, and what reaches a searchable unit

(H11 §2.2-2.3, H12, H02, H03; file:line in `reading-pipeline/index.mjs` unless prefixed.)

| Kind | Format entry | Piece mechanism | Units |
| --- | --- | --- | --- |
| **DOCX** | `docxEntry` (`formats.mjs:212`): `parts`, `text`, `structure` | cursor = unit index; **the whole file is re-parsed every tick** (2377, 2571-2577, 2653-2669) | one `doc-para` unit per paragraph; each table cell is a unit; tables' `cells` also go into the reading JSON (2175-2182) |
| **ODT** | `odtEntry` (242) | as DOCX | `doc-para`; footnote text is *fused* onto its paragraph without a space (H11 D8, ran) |
| **PPTX / ODP** | `pptxEntry` (223), `odpEntry` (244) | as DOCX | one `slide-shape` unit per slide (shape null); a slide over 128 Ki chars is cut and flagged (1493-1496); speaker notes are a separate list, not units |
| **DOC** (OLE2) | none | `undetermined`; `final` "not read as text (non-textual or too large)" (2725-2729) | — (declared `text/plain`: read as binary junk, X10) |
| **RTF** | none (`doc-clean/index.mjs:84` refuses it by name) | `text/rtf` → plain text path; `application/rtf` → refused | the control words themselves |
| **Plain text** | none; the text path (2443-2514) | a byte-window cursor (G68): one 1 MiB range per tick after the first; **only when the object is held whole and single-part** | `doc-para` per paragraph, or per line with no blank line (R33) |
| **HTML** | `html` entry, detect only (`formats.mjs:152-176`) | text path; **the whole page is decoded and cleaned again every tick** (excluded from windows, 2402, 2457) | `doc-para` of the visible text less furniture |
| **Email** (`.eml`) | none | `text/plain` → raw text; `message/rfc822`, `.msg` → refused | raw MIME |
| **ZIP and other archives** | `zip` entry, detect + `parts: listArchive`, no `text` (324-348) | `final` "not read as text"; cursor → `NOT_PIECEWISE`; members read as captures of their own | — |
| **Visitor view** | none: a rendered capture is `text/html` bytes | as HTML | as HTML (hydrated apps' inline `<script>`/`<style>` included, H10) |

### 1.3 What is carried between ticks

Only the PDF open-document slot is held in the object between ticks (`openedPdf`, 1907). Text and CSV re-open a *window*. DOCX, ODT, PPTX, ODP and HTML re-open the whole object: ran, 13 ticks of a 90 KB DOCX are 13 parses and 13 × the file's bytes from the store; an 18 MB-text DOCX is 72 ticks, median 1.45 s each, 115 s of compute (H11 D2). The durable state is the cursor, the text state row (`capture_text_state`: `state`, `more`, `cursor`, `words_read`, `over_bound`, `truncated`) and the ledger row (`keeps_pending`).

### 1.4 What partial means today

A read is marked partial by: `more=1`, `over_bound`, `unaddressable`, `skipped_named`, `truncated`, `words_read < words_total`, `state="partial"` (`extraction/index.mjs:1399,1528`). The word *whole* has three meanings (H11): `bytesOf(...).whole` (the object under its own digest was read as one object), the index `state`, and `completeness.state`; `unitsOf().state` can say `whole` while `completeness` says `partial` (X14). A read that ends because a later tick failed is `partial` *with no reason and no retry* (X13).

---

