# PDF reading over its whole envelope: the cause families, the bounds, the corpus (K4785 (1)-(3))

> **Split K5021.** This file is part 1; the rest of it was moved whole, unchanged, to: §2 (the envelope) and §3 (the corpus): `pdf-envelope-T51-s2-s3.md`. A reference "pdf-envelope-T51.md §n" finds §n in the part named here.

**Status** · DRAFT for BOB, written by PDF #1 on `prep/account3-pdf` (from `origin/tranche/T51` at 18d315ff27). This is a plan: no code and no requirement was changed. Nothing was run against biosmoke8 or any live site. Planned under K4785 (Bob: "We want a system that we have confidence will ALWAYS operate correctly within the bounds of the system requirements"), K4426 (the four fields), K4571 (never a silent partial read), K4787 (no load-dependent test; one core), K1881 (a bound that changes what a member may do is Bob's), P17, and `fix-round-7-T51.md` §0 (R-FOUR, R-SEAM/R-ONE, R-STOP, R-CLOCK, R-PROXY, R-QUIET).

**Read whole for this plan.** I read these myself: K4785 and K4426, K4571, K4693, K4354 and K1881 in `rulings.md`; `fix-round-7-T51.md` §0 and `archive/fix-round-7-T51-s1-s5.md` §1; `requirements/pdf-reader.md`, `pdf-pixels.md` and `reading-pipeline.md`; `plane.md` R77, R84 and R93; `modules.json`; the shape harness header `test/m/plane/shape/harness.mjs`; and the test PDF builders `test/m/pdf-reader/pdf.mjs` and `indexed.mjs`.

Six helpers (sonnet, medium) read the rest in shares. Each share is over 150 KB or spans many files. Their findings are kept at `/tmp/claude-0/-home-user-bio/3bb28c84-77be-50ca-a280-47f07f833d14/scratchpad/k4785/`, named A to F:
- **A. pdf-reader:** `pdfstructure.mjs` (4,598 lines) with its requirements, plus 4 probes run against the real module.
- **B. reading-pipeline:** all of `src/reading-pipeline/` with its requirements and its PDF tests, plus 6 probes.
- **C. extraction:** `extraction.md`, `extractrun.mjs` and `src/extraction/`.
- **D. pdf-pixels:** `pdf-pixels.md`, `pdf-worker/src/` (the codecs read for their bounds), and the callers in ocr-worker and the plane.
- **E. The causes:** the cause entries of every T51 fix round (`fix-round-T51`, `-4`, `-4b`, `-5`, `-6`, `-7`, `-7-added`, `-pass`) and the diagnoses they cite.
- **F. The walks:** every walk record (`walk-T51-build`, `-live`, `-rewalk`, `-rewalk4` to `-rewalk7`), plus `walk-coverage-T51.md` and `walk-T51-findings.md`.

The probes were read-only scripts in that directory. They import the repository's modules and changed nothing. Where this plan states a fact from a share, the share letter is given. I checked the load-bearing facts again in source: `pdfstructure.mjs:4508-4530`, `reading-pipeline/index.mjs:1548-1559`, `extraction/index.mjs:683-692`, and `pdfstructure.mjs:162-182, 815-824`.

Evidence words: **ran** means reproduced by a probe; **code** means read at the line cited; **hypothesis** means read from the code but not run, so the corpus must confirm it or drop it.

---

## 0. In short

**Why "it works, then fails again later".** No requirement states the envelope of a PDF read. Each fix proved one bar on the file the walker used, and the next file found the next unstated bound. The 1,354-page volume (BUDGET-2024-APP) was the walker's file through nine causes: C5a, E2, G26, G37, G38, G56, G68, G82 and G86. Each fix passed that file. A file of another shape then found the next layer at once. The 23 MB file at 0.77 MB a page got one page a tick (G68). The 1.9 MB scan stopped at page 24 (scan30).

The tests feed the reader its own builders' kind of PDF. That is a WinAnsi font with an identity ToUnicode map, a classic xref, Flate only, and text on every page. They measure outside the platform's shape. So every corner below the walkers' files is untested, and many of those corners are broken today.

**The failure classes** (§1.1) are the six K4785 names, plus six the causes forced, plus two that only appear once the code is read against the envelope. Each has its causes and the invariant it broke:
- **The six K4785 names:** MEM (memory at size), WORK (work per tick), ENC (encodings and fonts), PIECE (piece boundaries), STATE (state carried between ticks), SHAPE (the platform's shape).
- **Forced by the causes:** IDENT (document against part), SILENT (a silent partial read), INTAKE (work in the member's request), UI, FORMAT (format taken from metadata), STALEFAIL (a stored failure that outlives its cause).
- **Found by reading the code against the envelope:** LIVE (a read that can never finish, or never be retried), and PATH (a fix made on one entry path only).

Three findings recur across almost every class:
- **No stated envelope.** For most causes, "none stated it".
- **Fixed on the path the test used** (P5 in §1.4).
- **Measured outside the shape** (P4 in §1.4).

**Defects found by this review that are not yet causes** (§1.3, 24 items). The two most urgent, both reproduced by a probe:
- **N1 (ran):** an encrypted PDF read in pieces never finishes.
- **N2 (ran):** OCR past 24 pages in any later piece, and on the upload path, is dropped with nothing owed. This is re-walk 7's scan30.

Twelve more that a probe or the code shows today:
- **N3 (ran):** every stored PDF reading loses its title, page boxes, images and glyph counts against a whole read.
- **N4 (ran):** a Flate stream has no decompressed-size cap: 204 KB became 200 MB, and the process grew by 894 MB.
- **N5 (ran):** an incremental update that writes into an object stream reads the stale revision.
- **N6 (ran):** the catalog is the first one in the file, not the trailer's `/Root`.
- **N7 (ran):** a fake `N G obj` inside a later stream overrides the real object silently.
- **N8 (ran):** a page without `/Type` is dropped.
- **N9 (ran):** a direct `/Encrypt` dictionary is not detected.
- **N10 (ran):** a `bfrange` is expanded with no cap: 15 s.
- **N11 (ran):** one 30 MB page takes 20 s and about 400 MB, with no yield inside a range.
- **N12 (code):** a scanned image declared huge in its header is decoded before any bound, and a kill is retried forever.
- **N13 (code):** a folio page routed to OCR is refused by the renderer.
- **N14 (ran):** a failure at tick 2 or later ends the read instead of retrying it.

**The unstated bounds** (§2) are the ones today's code depends on that no requirement states:
- **Bytes and pages:** the byte ceiling a PDF is read under (24 MiB, stated only in reading-pipeline R37, against 64 MiB in pdf-worker and 16 MiB in pdf-reader R41); any page ceiling on the range path; the bytes of one page; the decompressed size of a stream; the size of a ToUnicode map; the number of objects.
- **Images and scans:** an image's declared dimensions on the DCT, CCITT, JBIG2 and raw routes; the OCR frame (61.3 MB RGBA, stated only in ocr-worker, which refuses A4 at 400 dpi and any 600 dpi page); images per scanned page (exactly one); the OCR budget per tick on paths that owe nothing.
- **Fonts and structure:** the font and encoding set (no WinAnsi, MacRoman, Standard or Differences decoding in tier 1); the structure features (object streams across revisions, catalog choice, encryption beyond detection).
- **Time and memory:** work and time per tick (stated only as test bars and in plane R84 for sheets; there is no PDF twin); the memory held between ticks (the open document); the plane's idle against 128 MB; CPU per tick (not set in `bio-plane/wrangler.jsonc`).
- **Liveness and load:** the number of ticks with a no-progress rule; the time between ticks (G70); concurrency (one open document per isolate).
- **What is stored and searched:** what a stored PDF reading may weigh (its page boxes and image placements against the 1 MiB row); what "found by search" means for ligatures and for scripts without spaces.

**Two capabilities are absent:** there is no rasteriser, and no password entry.

**Bob's** (§2.3). Six decisions change what a member may do, each with a recommendation:
- **B-1:** the byte ceiling a PDF is read under. Keep it at 24 MiB, stated.
- **B-2:** a page ceiling. Recommended: 10,000 pages.
- **B-3:** a time-to-whole promise for the member.
- **B-4:** password-protected PDFs. State them; offer no password entry now.
- **B-5:** a page ceiling for scans read by OCR.
- **B-6:** search in scripts that do not separate words by spaces.

Everything else is BOB's (P17), recorded once in `rulings.md`.

**The corpus** (§3) has 64 generated files over the corners and their combinations, plus 16 seeded variations at every round end. All of them come from one seeded generator with the truth of every page known. Each goes through the real entry path at the platform's shape: upload, ticks to whole, the last line found by search, the reading paged to its end. Passing is judged against one list of invariants (I1-I14), by work counted, never by the object's clock. Each module owns its own interface's share, and plane owns the end-to-end run (the PDF twin of R84).

---

## 1. The cause-family review (K4785 (1))

### 1.1 The failure classes, the causes in each, and the invariant broken

| Class | What fails | Causes (T51) | The invariant each broke, or that none stated it |
|---|---|---|---|
| **MEM** memory at size | The object (128 MB, shared with the plane's idle) dies or nears its line while a PDF is read or shown | C5a, E2, G26, G37, G38, G39, (G27); not yet causes: N4, N11, N12 | E2 broke pdf-reader R41 and reading-pipeline R36 (64 MB above idle), measured outside the plane's idle. G26 broke the same pair; none stated the object's total including the plane. G38 broke extraction R76 (bounded by units, not bytes). G39: none stated the plane's idle. **Today:** R41's 64 MB claim is scoped to "up to 16 MB", but files up to 24 MiB are read. No requirement bounds a stream's decompressed size, one page's content, a CMap, the object count, or the memory held between ticks (A §2g, B §2.4). |
| **WORK** work per tick or request | A tick or act exceeds the bar, or holds the object's one thread | E2 acquire half, G5, G26, G37, G56, G68, G82, G86, G88, G79; not yet causes: N11, N16 | G56 and G37: the 10 s bar was BOB's technical call and a test bar, stated in no requirement until plane R84 (sheets only). G68 broke pdf-reader R43 ("opens once per call", not per read). G82/G86 broke plane R93 (500 ms) by a stretch inside `range()`, which takes no `yieldNow` (A §2f, E G86; code `pdfstructure.mjs:4508`). **Today** the piece is sized by pages and by the average bytes a page, never by the work a page costs (A §2a). |
| **ENC** encodings, fonts, filters | Text the file states is read as "pictures of text", or dropped | E11 (ASCII85), G34 (WinAnsi without ToUnicode at 23 MB); not yet causes: N10, N17, N18 | E11: none stated the filter set; it was extended to the walker's filter, and LZW stays undecodable. G34: pdf-worker R8 (16 MiB) contradicted reading-pipeline's 24 MiB ceiling, and none stated "every file the reading ceiling admits is readable by every tier". **Today** tier 1 has no encoding tables: a Standard-14, Type1, TrueType or Type3 font with no ToUnicode is undetermined (A §4a, probe). The fallback is tier 2, which pdf-worker serves for the **whole file on every tick** that escalates (B §1.4). |
| **PIECE** piece boundaries | A cursor, window, range or answer page cuts or skips | G13, G14, G15, G38, G56, G71, E6; not yet causes: N2, N15 | G13 and G14 broke K4571, and extraction R22 stated the bound only as an answer field. G71: reading-pipeline R35's "equal when whole" was made unstatable for PDFs by G26's amendment, and nothing replaced it. **Today** a page over 128 Ki characters is cut in a whole read but carried whole in pieces, against reading-pipeline R41 (ran, B D3). |
| **STATE** state carried between ticks or requests | A counter, cursor, kept document or attempt count goes wrong across ticks | E2 (attempt accounting), G13 (cursor), G68 (the kept-open document), G71 (words_read), C5b; not yet causes: N1, N14, N19 | E2: none stated, and plane R77 was written after it. G68 created new state: a module variable holding one open document, lost on restart and thrashed by two PDFs at once (code `reading-pipeline/index.mjs:1902-1908`). No test moves it (E P6). **Today:** an encrypted PDF's cursor never moves (N1, ran). A later tick that fails ends the read instead of retrying it (N14, ran). |
| **SHAPE** the platform | Bars proven where they cannot be seen: frozen clock, no memory figure, one thread, value bounds, CPU | G26, G37, G39, G67, G69, G70, G82, G86, G41-family value bounds | G67: none defined a tick's time; plane R91 came after it. G69: workerd reports zero memory, and plane R92 says so. G70: none stated a latency between ticks; it is STILL open in re-walk 7. **Today** the plane sets no `cpu_ms` (`bio-plane/wrangler.jsonc:175`). The harness models the plane's idle at 87.6 MB, against about 50 MB after G39 (E G39). |
| **IDENT** document against part | A part's digest is taken for the document | F3, E1, G6, G33, (G73); not yet a cause: N20 | Each was "none stated" until provenance R72, reading-pipeline R39 and extraction R88. **Today** a part shared by two documents or two bundles answers first-wins or `NO_HOME`, against R81's sentence "never NO_HOME" (C §3.4, hypothesis). |
| **SILENT** a silent partial read | The member is led to believe a document is read whole when it is not | G13, G14, E3, E6, G6, G7, scan30; not yet causes: N2, N3, N15, N21 | K4571 each time. **Today** "read whole" for a PDF means the cursor reached the page count (B §1.6). A damaged file cut at 70 % reads as 22 of 30 pages with no marker (ran, B §3.4). Pages left unread in a later piece leave no trace (B D4). |
| **INTAKE** work in the member's request | A read or OCR runs inside the act, sized by bytes | C5a, E2 acquire half, G2, G5, G79, scan30; not yet a cause: N16 | K4354 (2 s act, 15 s capture). G5: control-plane R123 stated a byte rule that was wrong for text. **Today** a 1.9 MB scan sits under the 2 MB PDF bar and was OCR'd inline for 39 s (E scan30). `op=pdfstructure` and `op=pagetranscribe` load the whole object with no size check (C §2.1). |
| **UI** a control or statement on the screen | The screen cannot reach, or misstates, what the reading holds | G77, G73, E7, the "Nothing was kept" statement of re-walk 7 | G77: none stated that a control works on its second press. **Today** no walk paged a PDF past page 9 of 1,354 (F §3.2). |
| **FORMAT** format from metadata | The format is decided from the declared type, not the bytes | E1 | reading-pipeline R2 (single part only); fixed by R2's E1 amendment. |
| **STALEFAIL** a stored failure outlives its cause | A `final` or failed reading is never replaced | C5b, E1, E7, G8, G33; not yet a cause: N22 | extraction R80 (on purpose) until R82 and R85. **Today** a PDF reading over the 1 MiB row is stored `final`, never read again, though its text read (C §3.6, hypothesis). |
| **LIVE** liveness | A read that cannot finish, or a kill retried without end | G70 (gaps), scan30 (nothing owed); not yet causes: N1, N12, N14 | Plane R77 ("no count and no clock ends an entry") has no partner rule: **nothing states that every tick advances**, nor that a kill is classified after a bound. |
| **PATH** one entry path fixed | The same defect is left on the neighbouring path | E6 then scan30; E2 then G5; E3 then G6/G7/G73; E7; F3 then G6, G33, G73 | Never stated as a rule. A requirement is met at the module, but a second path into the module does not pass the hook (`owe`, the size gate) the first one passes (code `extraction/index.mjs:683-692`: `read` passes no `owe`). |

### 1.2 The named causes, one line each

These are the cause entries as E read them whole. "General" means the fix covers the class. "Exact" means it covers the walker's case and the plan says so.

| Cause | Symptom | Class | Broke | Fix |
|---|---|---|---|---|
| G5 | 12 MB text read inside the upload (27 s) | INTAKE, WORK | K4354; control-plane R123's byte rule wrong for text | Byte rule per format class; general for sizes, but the cost is pages for OCR (scan30) |
| G13 | Large text read in part, silently | SILENT, PIECE | K4571; extraction R22 stated only in a field | A cursor for every format; general. It became the model for PDF (G26) |
| G14 (and G15's PDF clause) | Completeness not stated; dense PDF over 16 MiB drawn as "pages have no text" | SILENT, PIECE | K4571 | extraction R91 `completeness`; general. G15: the 128 Ki unit cut is stated in a whole read and missing in pieces (N15) |
| G26 | 1,354-page PDF kills the object: every piece re-parsed everything | MEM, WORK | pdf-reader R41 and reading-pipeline R36 measured outside the plane's idle | Ranges (R43) at 200 pages; tuned on one file |
| G33 | A part-keyed `final` reading stays | IDENT, STATE | extraction R88 (new) | Migration; general for part-keyed readings |
| G34 | 23 MB WinAnsi PDFs end with no words | ENC, SHAPE | pdf-worker R8 against the 24 MiB ceiling; none stated tier coverage | 64 MiB, measured at two corners only. Tier 2 still reads the whole file every tick |
| G37 | Classifying costs more than the object has (12.4 s; 128/128 MB) | WORK, MEM | None: the 10 s bar was a test bar | Detectors, classify once; per input class (G48 and G88 returned) |
| G39 | Plane idles at 86 MB (two-byte bundle) | SHAPE | None stated the idle | ASCII bundle, about 50 MB; the harness still models 87.6 MB |
| G56 | First tick 11.7 s: pieces sized by page count | WORK | No requirement: K4670 was a test bar | 100 pages and 1.3 MB at the average bytes a page; parse bar loosened from 1.5 to 1.7; tuned on BUDGET-2024-APP |
| G68 | Every tick re-opens the whole file | WORK, STATE | pdf-reader R43 per call | `openPdfRange` (R44) and the open kept between ticks; new state, untested with two PDFs or a restart |
| G71 | `words_read` stuck at the first piece's | STATE, PIECE | R35 made unstatable for ranges by G26 | Override from the index state; general |
| G77 | "Next page" stuck at page 3 | UI | None stated | Radio id fixed; walked to page 9 of 1,354 only |
| G82 | The tick holds the object's thread | SHAPE, WORK | plane R93 | Yields between phases; STILL in re-walk 7 (Home 7.7 s, Queue 8.3 s) |
| G86 | Providers' synchronous stretches | SHAPE, WORK | pdf-reader R45, csv-reader R20 | The open yields; **`range()` does not** (code `pdfstructure.mjs:4508`; `reading-pipeline/index.mjs:2538` passes no `yieldNow`) |
| Found: C5a, E2 | Large PDF read in the request or object dies (rounds 4 and 5) | INTAKE, MEM, STATE | K4354; pdf-reader R41 | Partial, then G26 |
| Found: E1 | Uploads 10-29 MB stored "(multipart)" `final` | FORMAT, STALEFAIL, IDENT | reading-pipeline R2 | General; added R-STOP |
| Found: E3 | 40/41.5 MB kept, never stated | SILENT, STATE | reading-pipeline R37, unreached through the door | Round 6 general |
| Found: E6 then scan30 | OCR stops at 24 pages, nothing owed | PIECE, SILENT, PATH | reading-pipeline R37 (`owe`), extraction R91 | **Fixed for promote and the press only; open on the upload path and in later pieces** (N2) |
| Found: E11 | ASCII85 read as pictures of text | ENC | None stated the filter set | ASCII85 and ASCIIHex added; LZW and RunLength stay undecodable |
| Found: G6, G73 | A part's digest taken for the document; raw statement on one screen | IDENT, UI | reading-pipeline R39, extraction R88 (new) | General for the leak; three more doors found it |
| Found: G38 | The finished reading's display kills the object (13.99 MB page) | SHAPE, MEM, PIECE | extraction R76 bounded by units only | R93 1 MiB a page; general |
| Found: G70 | 12 MB text takes 32 min although ticks are seconds | SHAPE, LIVE | None stated a latency | Logging only; STILL. Decides how long every many-tick PDF takes |

### 1.3 Defects this review found that are not yet causes (for BOB to place, fix round 8)

Each has an owner module and a corpus file that shows it (§3). **ran** = reproduced by a helper's probe; **code** = certain from the lines cited; **hyp** = to be confirmed by the corpus. I re-read N1 and N2 in source (`pdfstructure.mjs:4525-4529`, `reading-pipeline/index.mjs:1552-1554`, `extraction/index.mjs:683-692`).

| # | Defect | Class | Evidence | Owner (providers) | Corpus |
|---|---|---|---|---|---|
| N1 | An encrypted PDF read in pieces never finishes: `readRange` answers `count: 0`, `next = from + 0`, `more` stays true, and the cursor is unchanged on every tick | LIVE, STATE | ran (B `probe/enc.mjs`: six ticks, same cursor, 0 units) | reading-pipeline (pdf-reader) | C11-C15 |
| N2 | OCR past 24 calls is dropped with nothing owed, (a) in any piece after the first and (b) on the upload's inline path: `Extraction.read` passes no `owe`. This is re-walk 7's scan30 | SILENT, PIECE, PATH | ran (B `probe/scan.mjs`: pages 124-129 no unit); code (E scan30, `control-plane/index.mjs:2729-2765`) | extraction (reading-pipeline, control-plane) | D1, D4 |
| N3 | Every stored PDF is read in pieces (`readHeld` always passes `cursor: null`), and its reading is the first range's alone. Lost against the whole read: `title`, `page_boxes`, `container_extent.images` (with a wrong `images_why`), `text_glyphs`, `words_total`; the chain, `tier3_candidate`, entities and refs are piece 1's | SILENT, PIECE | ran (B `probe/cmp.mjs` on the 33-page agenda); code (C §3.3, §3.9) | reading-pipeline (pdf-reader R43's thin answer), extraction | A1, every file (I6) |
| N4 | No cap on a Flate stream's decompressed size on the platform path. `INNER_DECODE_MAX` (128 MiB, the whole object) falls through to the uncapped decoder | MEM | ran (A: 204 KB became 200 MB, +894 MB RSS, 11 s, `ok: true`) | pdf-reader | A8 |
| N5 | An incremental update that rewrites an object into a new object stream is ignored: the first object stream wins | ENC (structure), SILENT | ran (A, two orderings) | pdf-reader | C3 |
| N6 | The catalog is the first `/Type /Catalog`, not the trailer's `/Root` | structure, SILENT | ran (A) | pdf-reader | C8 |
| N7 | A fake `N G obj` inside a later unfiltered stream (XMP, an attachment) overrides the real object; the page reads empty with no marker | structure, SILENT | ran (A) | pdf-reader | C9 |
| N8 | A page leaf with no `/Type` is dropped while its siblings are read | structure, SILENT | ran (A) | pdf-reader | C10 |
| N9 | A direct `/Encrypt` dictionary in the trailer is not detected: ciphertext is read as plaintext | structure, SILENT | ran (A) | pdf-reader | C15 |
| N10 | `bfrange` is expanded with no cap (16.7 M codes in 15 s); mixed 1-2 byte codespaces are misread; 4-byte codes at or above 0x80000000 sign-flip | ENC, WORK | ran (A) | pdf-reader | B5, B7 |
| N11 | One page's content is held whole (string and full token array): a 30 MB page took 20 s and about 400 MB. A range has no yield inside it, and `maxBytes` uses the average bytes a page, so a heavy page is never seen | MEM, WORK | ran (A) | pdf-reader, reading-pipeline | A6, A7, E8 |
| N12 | The DCT (decoded), CCITT, JBIG2 (below 2^28) and raw routes allocate from header dimensions before any bound. A G4 stream of about 8 KB can declare 60,000 × 60,000 and kill the member; the plane counts a kill as `transient` and asks again on every tick | MEM, LIVE | code (D §2.C, `ccittdecode.mjs:119-122`, `reading-pipeline/index.mjs:620-650`) | pdf-pixels (image-codecs, ocr-worker) | D12 |
| N13 | A folio page (`image_content_unread`) is routed to OCR, but `allowTextPage` is never passed, so the renderer refuses it. D-635's append path is unreachable | SILENT | code (D §1.3, `ocr-worker/src/member.mjs:101`), hyp until run | ocr-worker (pdf-pixels) | D6 |
| N14 | At tick 2 or later, a transient failure (store throws, object not held, open throws) comes back with no `more`. `#continueText` then writes `more=0` and ends the read, not retried | LIVE, SILENT | code (B §3.2, `extraction/index.mjs:881-885`) | extraction | E7 |
| N15 | A page over 128 Ki characters is carried whole in pieces (against R41) and cut by extraction's writer: the cut text is not searchable | PIECE | ran (B D3) | reading-pipeline, extraction | A10 |
| N16 | `op=pdfstructure` (and `ocr=1`) and `op=pagetranscribe` load and parse the whole object with no size check, in the member's request | INTAKE, MEM | code (C §2.1, `extraction/index.mjs:2194-2197, 2402-2404`) | extraction | A2 through the press |
| N17 | Tier 1 has no simple-font encodings (WinAnsi, MacRoman, Standard, Differences): every such font without ToUnicode is undetermined and escalated to tier 2, which reads the whole file on every tick | ENC, WORK | code and ran (A §4a) | pdf-reader (pdf-worker) | B1, B2, E1 |
| N18 | No rasteriser. A page whose text cannot be decoded (CID with no ToUnicode, Type3 glyphs only) can never be OCR'd: pdf-pixels renders one image, never a page | ENC, SILENT | code (D §1.1, pdf-pixels R16-R18) | pdf-pixels (a capability, §2.2 row E7) | B4, B6 |
| N19 | Two PDFs owed at once alternate in the one open-document slot, so each tick re-pulls up to 24 MiB and re-opens (3 s or more). The cost is unmeasured | STATE, WORK | code (`reading-pipeline/index.mjs:1902-1908`), hyp | reading-pipeline | E5 |
| N20 | A part shared by two documents or two bundles answers first-wins or `NO_HOME`; `r81.test.mjs:66-72` pins the `NO_HOME` | IDENT | code (C §3.4), hyp | extraction (provenance) | E9 |
| N21 | A damaged or truncated file reads the pages it can find and states nothing: 22 of 30 pages, `more: false`, no marker | SILENT | ran (B `probe/dmg.mjs`) | pdf-reader, reading-pipeline | C7 |
| N22 | A PDF reading over 1 MiB (`page_boxes` and image placements grow with pages in a whole read) is stored `final` with no units, while the same file read in pieces is stored | STALEFAIL | code (C §3.6), hyp | extraction | D3, E3 |
| N23 | ocr-worker has no top-level guard: a throw inside `render` is a 500, against ocr-worker R7 ("every finding a 200"). The plane counts it transient and asks again forever | LIVE | code (D G-D9) | ocr-worker | D12, D13 |
| N24 | An empty-password encrypted scan is never OCR'd: tier 1 marks it `encrypted`, tier 3 takes no pages, and only tier 2 (text) decrypts | ENC | code (D G-D14) | reading-pipeline, pdf-pixels | C11 with scans |

Smaller items for the jobs, not separate causes:
- **pdf-reader:** inline-image bytes are read as text operators (A §3); a TIFF predictor 2 stream is passed through undecoded (A §2c); an object stream missing `/N` or `/First` is skipped with no note (A 7a.14); the stale `#unreadOf` comment (C 4.14).
- **ocr-worker / plane:** the AI path silently cuts to 8 pages (D G-D12).
- **extraction:** `PRIOR_READING_COPY_MAX_BYTES` is unused (C 4.13); the OCR continuation writes with no compare-and-set (C §3.7).

### 1.4 Why the tests kept missing them (the patterns, E §7)

- **P1, the same file moved bar by bar.** See §0.
- **P2, a bound by count, not by work.** Pages (G56), bytes for OCR (G5 against scan30), units (G38), files (G34).
- **P3, a constant tuned to one measured file, then re-tuned.**
  - `PDF_RANGE_PAGES`: 200, then 100, plus 1.3 MB.
  - The parse bar: loosened from 1.5 to 1.7.
  - `MAX_PDF_BYTES`: 16 MiB, then 64 MiB.
- **P4, measured outside the shape.**
  - The memory caps: idle + 64 and idle + 88.
  - A plane-less child.
  - Miniflare with no memory cap.
  - Node wall time under R-CLOCK.
  - The shape harness is a probe, not a suite test; there is a PDF probe (`g26.probe.mjs`) but no PDF test like R84's.
- **P5, fixed on the path the test used.** E6 then scan30, E2 then G5, E3 then G6/G7/G73, E7, G13's test.
- **P6, a fix's new state is not moved by any test.** G68's slot, E2's attempts.
- **P7, a stored failure outlives its cause.**
- **P8, two fields disagree.**
  - "Whole 24" beside `ocr_left` 6.
  - "Read in full" beside a Next page that stopped.
  - `words_read` beside whole.
- **P9, ceilings disagree.** 16, 20, 24, 32 and 64 MiB, and 2 MB inline.
- **P10, time is unmeasurable in the object, so bars are read in places that cannot see them.**
- **P11, a bar added only after a finding.**

What the fixtures share explains P1-P4. F found that nearly every walked file was made with reportlab or ImageMagick: Latin text, one encoding, and no structure features (F §3.2). The test builders make one font with an identity ToUnicode, a classic xref or none, Flate, and text on every page (A §7c, B §6.1). No test reads a PDF in pieces with `PDF_WORKER` or `OCR_WORKER` bound (B §6.2.1), and none finds a PDF's last line by search (B §6.2.7).

---

## 4. What this plan hands BOB (the order of work it implies; BOB's to place)

1. **Measure first:**
   - The plane's idle on today's bundle (for E4).
   - The deployed `cpu_ms` (E8, **P**, read only).
   - The harness's `members: "real"` binding and its three faults.
   - (plane, test-support)
2. **Place the 24 defects of §1.3 as fix round 8 causes** with R-FOUR's four fields. Their failing-first tests are the corpus files named for each. N1 and N2 are the most urgent: a member's read that never ends, and a silent partial read live today.
3. **Write the envelope into the requirements:**
   - pdf-reader: A1-A7, B1-B5, C1-C2, C6, E2, and I1, I6, I14.
   - reading-pipeline: E1, E3, E5, E6, F2, and I1-I3, I6, I8, I9.
   - pdf-pixels and ocr-worker: D1-D8, I7.
   - extraction: A1 (the value), F1, F4, C4, and I3, I9-I12.
   - plane: the PDF twin of R84 (the corpus, I4, I5, I13) and E6's kill rule.
   - screens-inquiry: F3, I11.
   - test-support: the generator.
   - Each line names this plan and K4785.
4. **Bring §2.3 (B-1 to B-6) to Bob, rendered, in one page.** No job that depends on one of them starts before he answers. A1's work is unchanged by B-1(a). A2, D8 and C5 wait.
5. **The corpus runs at the round end that closes fix round 8, whole,** and at every round end after.

## 5. Not covered by this plan

- K4785 (4), the live subset on biosmoke8.
- G70's cause: the time between ticks, which belongs to fix round 8 as its own cause.
- The non-PDF formats. The same envelope method applies to them, with R84 as their shape run.
- The UX words for the new statements (K4269, rows owed to the design stream).
