# PDF reading over its whole envelope: the cause families, the bounds, the corpus (K4785 (1)-(3))

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

## 2. The envelope (K4785 (2))

### 2.1 How to read the table

Each row is one bound a PDF read depends on:
- **Today** is the value in the code.
- **Stated** names the requirement that states it, or says "unstated".
- **Recommended** is the bound this plan proposes, and what a file over it gets: always a named statement, `final`, nothing owed forever, never silent (I3, I7).
- **Who:** "BOB's" means decided under P17, recorded in `rulings.md` and reported to Bob as done. "**Bob's**" means it changes what a member may do (K1881), and it is put to him in §2.3.

Where a bound is a protective limit against a hostile or broken file only, it is BOB's under K1881.

Platform figures used: the object has 128 MB; the plane idles at about 50 MB since G39 (E G39), to be re-measured as the first job of §4; value rows are at most 2,098,176 B (record-core); workerd freezes `Date.now()` in synchronous work (R-CLOCK).

### 2.2 The bounds

| # | Bound | Today | Stated | Recommended | Who |
|---|---|---|---|---|---|
| **A. Bytes and pages** | | | | | |
| A1 | File bytes a PDF is **read** under (a larger one is stated with its size, not read) | `WHOLE_READ_MAX` 24 MiB; `MULTIPART_READ_MAX` 20 MiB for assembling parts | reading-pipeline R37 (value); extraction R84 names the constant only; pdf-reader none | **24 MiB**, unchanged. Stated in pdf-reader (its envelope), extraction R84 (with the value) and the member's words. Make pdf-worker's 64 MiB unreachable by intent: state that tier 2 is asked only for files A1 admits | **Bob's** to confirm (B-1): it is the line between "read" and "stated", and Bob has never been shown it |
| A2 | Pages a PDF may have | None on the range path (every stored PDF); a density refusal at about 2,300-3,500 dense pages on the whole path only (pdf-reader R42) | Unstated for ranges | **10,000 pages**, proven by the corpus (A4). Over it: stated `TOO_MANY_PAGES` with the count, `final`. R42's refusal applies to the whole path only and is said to | **Bob's** (B-2) |
| A3 | Bytes and work of one page | None: the page is the unit of memory, held whole (N11) | Unstated (pdf-reader R41 says "one page's decoded content", unbounded) | Content tokenised as a stream over a window, never a whole token array. Work counted per page (decoded bytes, operators, glyphs). A page over **64 MiB of decoded content** is stated `page_over_bound` with its figures, its page listed unread, the rest read | BOB's (protective) |
| A4 | Decompressed size of one stream | Uncapped (N4); `INNER_DECODE_MAX` 128 MiB on the checked path only | Unstated | All inflation streamed with a cap. Content: A3. Object stream: **16 MiB** decoded (over: `objstm_over_bound`; the objects in it are unread, stated). ToUnicode CMap: **1 MiB** decoded. Image: §D by its header. An embedded file: hashed streaming, **64 MiB** | BOB's (protective) |
| A5 | Objects in a file | None (a typed table grows) | Unstated | **2,000,000** objects (about 70 MB of table would not fit anyway). Over: stated `TOO_MANY_OBJECTS`, `final`. The corpus proves 600k in 16 MiB (A11) | BOB's (protective) |
| A6 | A single direct (non-stream) object's size; operand stack | Unbounded parse window; unbounded stack | Unstated | **4 MiB** window (as `pdfTitle` has) and **65,536** operands before an operator; over: that object or stream is unread, named | BOB's (protective) |
| A7 | Page-tree depth; reference hops; form nesting | Unbounded (with a `seen` set); 64 hops (R20); depth 8 (R11) | R20, R11; tree depth unstated | Tree depth **256** (stated; workerd's stack is smaller than node's). Over: pages below are unread, named | BOB's |
| **B. Structure features** | | | | | |
| B1 | Which revision is read | A positionless scan: the last top-level definition wins; the first object stream wins; the first catalog; fake `obj` text honoured (N5-N8) | pdf-reader R8 (top level only) | **The newest revision.** When the trailer's xref chain (`startxref`, `/Prev`, `/XRefStm`) validates (offsets land on `N G obj`), objects are resolved by it; otherwise by the lenient scan with the note `xref_reconstructed`. Either way the catalog is the trailer's `/Root`, and a definition inside another stream's bytes never counts | BOB's |
| B2 | A damaged or truncated file | Reads the pages found, silently (N21) | Unstated | Read what can be read, **stated**: `structure_reconstructed`, and when `/Count` or the xref names more pages than are found, `pages_missing` with the figures. The member is told "the file is damaged; N of M pages could be read" | BOB's (the words: UX row owed, K4269) |
| B3 | Encryption | Detection only (one marker; N9 misses a direct `/Encrypt`); tier 2 decrypts an empty user password for text only; a piece read never ends (N1) | pdf-reader R9, R23; pdf-pixels R14 | Tier 1 **decrypts an empty user password** (RC4 40/128, AES-128, AES-256 R6) for text and images, so tiers 1-3 read it. A file that needs a password is stated `PASSWORD_REQUIRED`, `final`, in one piece; the cursor ends | BOB's (decrypting); **Bob's** for asking a member for a password (B-4) |
| B4 | Filters on content streams | Flate after ASCII85 or ASCIIHex; LZW and RunLength undecodable; predictor 2 passed through | pdf-reader R22 (Flate only), E11 | **Flate, LZW, RunLength, ASCII85, ASCIIHex, PNG predictors 10-15 and TIFF predictor 2**, stated as the set; Crypt per B3; any other is named `content_stream_undecodable` | BOB's |
| B5 | Inline images in the text walk | Their bytes are read as text operators | Comment only | Skipped by the text walk as by the image walk; a `BI ID EI` that cannot be delimited is named | BOB's |
| **C. Fonts, encodings, text** | | | | | |
| C1 | Simple fonts with no ToUnicode | Undetermined (`no_tounicode`); tier 2 for the whole file each tick (N17) | pdf-reader R12 | Decoded by the font's stated `/Encoding` (WinAnsi, MacRoman, Standard, PDFDoc, `/Differences` with standard glyph names) in tier 1. That is a decode of what the file states, not a guess, so R12 and R27 hold. A glyph name outside the standard list stays `unmapped_code`. Type3 is the same, by its Differences | BOB's (doctrine unchanged; told to Bob as done) |
| C2 | ToUnicode CMaps | First codespace range sets the width; uncapped `bfrange` (N10) | R12 | Every codespace range is honoured (mixed widths); codes are unsigned; a range of at most **65,536** codes is expanded, a larger one looked up arithmetically; `usecmap` of an Identity map honoured; a CMap over A4's 1 MiB is named | BOB's |
| C3 | Composite fonts with no ToUnicode | `cid_font_no_tounicode` (undetermined) | R12 | Unchanged: undecodable, stated, and routed to page OCR once E7 exists | BOB's |
| C4 | Text normalisation for search | As shown; the FTS tokenizer `unicode61` does no NFKC (ligature `ﬁ` is not "fi") | Unstated | Units keep the shown text; the index and the query are **NFKC-folded** so "fi" finds `ﬁ` | BOB's |
| C5 | Scripts without spaces between words (Chinese, Japanese, Thai) | Indexed as one token per run; not found by a word | Unstated | Stated as outside the envelope today | **Bob's** (B-6) |
| C6 | Characters in one page's unit | 128 Ki; cut in a whole read, carried whole in pieces (N15) | reading-pipeline R15, R41 | **Nothing cut**: a page over the cap is carried as consecutive units of one page (`run` 0, 1, ...), as R41 does for lines, so every word is searchable and citable | BOB's |
| **D. Images and scans** | | | | | |
| D1 | An image's declared size before decode | Bounded on JPX and the picture route only (N12) | pdf-pixels R25 (JPX), R42 | Every route judges `width × height × components` from the header **before** any allocation, against the same measured working set (61.3 MB today, image-codecs R4). Over: `IMAGE_TOO_LARGE` with figures, a 200 `ok: false`, never a kill | BOB's (protective) |
| D2 | The OCR frame | 61.3 MB RGBA after decode: A4 at 400 dpi, Letter at 600 dpi and Tabloid at 300 dpi are refused | ocr-worker R7 only | The frame is **reduced** by the smallest integer factor that fits (as the picture route's `reduce(k)`), with 300 dpi as the floor a reduction may not go below; a page that cannot fit at 300 dpi is stated `FRAME_OVER_BOUND`. A 1-bit source is counted 1-bit until it is rendered | BOB's (it widens what is read) |
| D3 | Images per scanned page | Exactly one; strips, inline and two-image pages refused | pdf-pixels R17, R18 | Up to **64** images composited onto one page frame in painting order (masks and SMask applied); inline images included. Over: stated `MULTIPLE_IMAGES_ON_PAGE` | BOB's |
| D4 | Colour and sample kinds | 1-bit, 8-bit grey and RGB; CMYK, 16-bit, ICCBased arrays, Indexed refused | pdf-pixels R24 | ICCBased N=1/3 read as grey or RGB; Indexed expanded; 16-bit reduced to 8; CMYK converted naively; Lab and Separation stay refused, stated | BOB's |
| D5 | A mixed page (a text layer and a scanned region) | Text kept; the picture unread, marked `image_content_undetermined`, which routes nothing; a folio page is routed and then refused (N13) | pdf-reader R26; reading-pipeline R3, R4 | A page with an unread image covering at least 0.18 of its box has its largest image OCR'd through the crop route (pdf-pixels R27-R34). The OCR words are appended to the layer text as D-635 states (`allowTextPage`). The page says "part of this page is a picture" when it is not read | BOB's |
| D6 | OCR budget per request or tick | 24 calls; the continuation is owed only on promote and the press (N2) | reading-pipeline R4, R37 | 24 calls (the platform's subrequests), and **pages a cap leaves are owed on every path**: `read` returns `ocr_left` in every piece answer and the caller always owes it (I3) | BOB's |
| D7 | CPU per OCR page | 10.4 s at 300 dpi against `cpu_ms` 30,000 (a comment) | ocr-worker wrangler comment | Stated in ocr-worker with D2's frame: the largest frame D2 admits is measured under 30 s on one core (K4787) | BOB's |
| D8 | Pages a scan may have for OCR | None; at 24 pages a tick | Unstated | **1,000 pages**, so a member waits at most about 2.5 hours of OCR at today's figures. Over: the first 1,000 read, the rest stated unread, never silent | **Bob's** (B-5) |
| D9 | A page with no decodable text and no single image (text drawn by an undecodable font, vector-only) | Unread, named; never OCR'd (N18) | pdf-pixels R16-R18 | Stated as outside the envelope today. A page rasteriser is a later capability | BOB's to state; any rasteriser is a later plan |
| **E. Work, time, memory, liveness** | | | | | |
| E1 | Work per tick | At most 100 pages and 1.3 MB at the **average** bytes a page | reading-pipeline R40 (G56); bars in tests only | A range stops when the pages read so far have used a **work budget** (decoded content bytes plus glyphs), after at least one page, so a heavy page is a short range. The budget is measured so the heaviest corpus page keeps every tick **under 8 s on one core** (`taskset -c 0`, K4787). Stated as a PDF twin of plane R84 | BOB's |
| E2 | Synchronous stretch while a PDF is read | The open yields (R45); `range()` and the page walk do not | pdf-reader R45; plane R93 | `range` takes `yieldNow` and yields **between pages and within a page every 64 Ki operators**, so R93's 500 ms p95 holds for every corpus file, the heavy page included | BOB's |
| E3 | Tier 2 per tick | pdf-worker reads and answers the whole file whenever a range escalates | Unstated | With C1 most escalations end. pdf-worker is asked for the range's pages only (`{sha, store, from, count}`), and its answer is bounded to that range | BOB's (a pdf-worker contract change) |
| E4 | Memory | R41 and R36: 64 MB above idle, measured outside the plane, for "up to 16 MB" | pdf-reader R41, reading-pipeline R36 | One stated budget, measured with the plane inside: **plane idle (measured) + the held bytes (≤ A1) + the open document (≤ 24 MB of tables and caches, R44 bounded) + one range's working set (≤ 24 MB) ≤ 118 MB**, so 10 MB stay free. Proven by the corpus in a child capped at 128 less nothing (the bytes inside) | BOB's |
| E5 | State between ticks | One open document per isolate, lost on restart, thrashed by two PDFs (N19) | reading-pipeline R40 (G68 sentence) | Stated: correctness never depends on the slot (I8); the ledger reads **one large PDF at a time per object to its end** (priority by age), so the slot is not thrashed; other PDFs wait, stated "being read" | BOB's |
| E6 | Ticks and progress | No tick cap, no no-progress rule (N1); a later transient failure ends the read (N14); a kill is retried without end (N12, N23) | plane R77 (never forgets) only | **Every tick that answers `more: true` advances the cursor** (I2); a tick that cannot is `final`, stated. A transient failure at any tick is retried under R77. A member kill counts as an attempt, and after **3** kills of one page that page is stated `PAGE_KILLED_READER`, the read goes on (I7) | BOB's |
| E7 | Time to whole | Unbounded; G70 gaps of up to 451 s; 32 min against 1.4 min for the same file | Unstated | A promise to the member in time. Recommendation: on a quiet copy, a text PDF at A1 and A2's corners whole within **15 minutes** | **Bob's** (B-3); G70's cause is fix round 8's |
| E8 | CPU per tick in the plane | Not set (`bio-plane/wrangler.jsonc:175`); the platform default applies, unverified | Unstated | A **P** probe reads the deployed limit (read only); E1's 8 s on one core is the bar; `cpu_ms` set explicitly in `bio-plane/wrangler.jsonc` to the figure the probe reads | BOB's |
| E9 | Everyday load (K4785: 5 at once) | One slot, one consumer; untested with 5 PDFs | Unstated | E5's one-at-a-time order, measured with 5 uploads at once (corpus E5); each screen and act within K4354 while it runs | BOB's (measure, per K4785) |
| **F. What is stored and shown** | | | | | |
| F1 | A stored PDF reading's size | 1 MiB row; whole-path keys grow with pages; over: `final` with no units (N22) | extraction R96, R97 | `page_boxes` and image placements stored in their own rows, per piece, never inside the reading JSON; the reading stays under 64 KiB whatever the page count; R96 holds without any `final` | BOB's |
| F2 | What a pieces reading carries | The first range's (N3) | reading-pipeline R40 (partly) | **A reading read in pieces equals the whole read** in title, metadata, boxes, images, counts, chain parts and references, completed as pieces arrive (I6); `words_total` known when the last piece is in | BOB's |
| F3 | Paging the reading to its end | Next page fixed (G77); walked to page 9 of 1,354 | Unstated | Every page reachable by Next page and by page number, to A2's page ceiling | BOB's |
| F4 | Paths that read a PDF outside the ledger | `op=pdfstructure`, `ocr=1` and `op=pagetranscribe` load the whole file in the request (N16) | Unstated | Every path reads through the pieces and owes what it cannot finish; none loads a PDF over **2 MB** inside a member's request | BOB's |

### 2.3 For Bob (K1881; each with an explanation, options and a recommendation, rendered when brought to him)

- **B-1 The largest PDF Civicsmith reads (A1).**
  - **Today:** a PDF up to 24 MiB is read whole. A larger one is kept and stated ("too large to read: 31 MB"), never read.
  - **Options:** (a) keep 24 MiB; (b) raise it (the range path holds the bytes in the object, so about 32 MiB is the most memory allows after A3-A4); (c) lower it.
  - **Recommendation:** (a), stated in the member's words.
- **B-2 The most pages a PDF may have (A2).**
  - **Today:** no limit; the largest proven is 1,354 pages.
  - **Options:** (a) 10,000; (b) 5,000; (c) no limit.
  - **Recommendation:** (a). A ceiling must exist for the corpus to prove "always". Ten thousand covers every civic volume walked by a factor of seven. Over it, the file is kept and stated.
- **B-3 How long "being read" may last (E7).**
  - **Today:** unbounded. The same 12 MB text took 32 minutes once and 1.4 minutes on other runs.
  - **Options:** (a) 15 minutes for the largest text PDF on a quiet copy, and 2.5 hours for the largest scan; (b) 5 minutes for text; (c) no promise.
  - **Recommendation:** (a), with the member told the expected time when a large read starts (a UX row).
- **B-4 Password-protected PDFs (B3).**
  - **Today:** any encrypted PDF is unread. One read in pieces never finishes (a defect, N1).
  - **Options:** (a) read every PDF that opens with no password, and state the rest as "needs a password"; (b) also let the member type the password once.
  - **Recommendation:** (a) now, (b) later if members ask. A password typed in would be a secret the record must never keep.
- **B-5 The longest scan read by OCR (D8).**
  - **Options:** (a) 1,000 pages (about 2.5 hours); (b) 300; (c) no limit.
  - **Recommendation:** (a). Over it, the first 1,000 pages are read, and the member is told which pages are not.
- **B-6 Search in Chinese, Japanese and Thai (C5).**
  - **Today:** the text of such PDFs is read but cannot be found word by word.
  - **Options:** (a) state it outside the envelope; (b) add a segmenting index.
  - **Recommendation:** (a) for the alpha.

### 2.4 The invariants (the "always", stated once; each corpus file is judged against all of them)

The invariants each name the module whose requirements carry them; BOB writes the wording into those requirements (§4).
- **I1 Every page once.** Each page in `[0, pages)` is read exactly once across the pieces, in order, and the units equal the generator's truth for that page.
  - Requirements: reading-pipeline R40, pdf-reader R43.
- **I2 Progress.** Every tick that answers `more: true` moves the cursor forward; the number of ticks is at most `pages` plus 2.
  - Requirements: reading-pipeline, plane R77.
- **I3 Never silent.** Every page that is not read whole carries a named reason in the reading and in the member's statement. `completeness` is "whole" only when the cursor is at the end, nothing is owed, and no page is unread for a reason other than "has no text".
  - Requirements: extraction R91, K4571.
- **I4 Memory.** The child running the real plane at 128 MB, with the held bytes inside it, stays alive, and its peak is within E4's budget.
  - Requirements: pdf-reader R41, reading-pipeline R36, superseded by E4.
- **I5 Work per tick.** Every tick's counted work is within E1's budget, and its longest synchronous stretch is within E2's (a count of operators between yields, not a time).
  - Requirements: reading-pipeline R40, plane R93.
- **I6 Pieces equal whole.** The stored reading of a PDF read in pieces equals its whole read, field for field, the fields of F2.
  - Requirements: reading-pipeline R40, R12.
- **I7 A refusal is stated, final and finite.** Every bound in §2.2 answers its named statement once. Nothing is owed forever, no kill is retried more than E6's 3 times, and no row stays "being read" after the last tick.
  - Requirements: plane R77, extraction R82.
- **I8 State loss is harmless.** Losing the open document, or restarting the object, between any two ticks gives the same reading and units; only the tick's work differs.
  - Requirement: reading-pipeline R40.
- **I9 Every path owes what it leaves.** Upload, promote, press, ledger, `op=pdfstructure` and `pagetranscribe` all owe pages and ranges a cap left.
  - Requirements: reading-pipeline R37, extraction.
- **I10 Search finds the last line.** The last line of the last page (and a first and a middle line) is found by `op=search` and is citable.
  - Requirements: extraction R22, R90.
- **I11 The reading pages to its end.** `op=reading` with `next` reaches the last page with no answer over 1 MiB; the Document screen's Next page reaches it.
  - Requirements: extraction R93, screens-inquiry.
- **I12 Stored values bounded.** No stored value exceeds 1 MiB, and none exceeds the platform's value bound.
  - Requirement: extraction R96.
- **I13 Contention.** While the corpus file's ticks run, cheap reads through the door wait under 500 ms at p95.
  - Requirement: plane R93.
- **I14 Same bytes, same answer.** Two runs of the same file give byte-identical readings and units.
  - Requirements: pdf-reader R24, reading-pipeline.

---

## 3. The corpus (K4785 (3))

### 3.1 How it is made

**One generator, seeded, that knows its own truth.** The generator is a new `pdfgen.mjs` under **test-support** (layer 1, beside `pdf-worker/test/make-pdf.mjs` in its paths; BOB adds the path). It reuses `test/m/pdf-reader/pdf.mjs`'s and `indexed.mjs`'s object writers, `reading-pipeline/bigpdf.mjs`'s padding, and `pdf-worker/test/make-pdf.mjs`'s image pages.

Its input is a spec of these axes:
- pages; lines per page;
- page kinds (text, scan, mixed, folio, blank, vector);
- the font mix (ToUnicode identity; WinAnsi, MacRoman or Differences with no ToUnicode; Type0 Identity-H with and without ToUnicode; Type3; mixed codespace);
- the content filter chain;
- the structure (no xref, classic, xref stream, object streams, revisions with their rewrite mode, linearized, damaged offsets, truncation point, two catalogs, fake `obj`, untyped leaf);
- encryption (none, empty-password RC4 or AES, user password);
- image codecs (DCT, CCITT G4, JBIG2 generic, JPX, Flate raw), sizes and dpi; page size and rotation;
- target bytes; and a seed.

Its output is the bytes plus a **truth file**: each page's expected text (normalised per C4), the first, middle and last line markers, the pages expected unread with their reason, and the expected statement for a refusal.

Every text line carries `<seed>-p<page>-l<line>` and a word drawn from a small vocabulary with accents and ligatures, so a unit can be checked against its page alone. Scan pages are rendered by the generator from the same text, as a 1-bit or grey bitmap at the chosen dpi. Their truth is "OCR words ≥ 90 % of the page's words", the floor pdf-pixels R44 uses. The generator is deterministic in its seed; large files are written once to `BIO_FIXTURE_CACHE` by spec hash, never committed. Real external files (BUDGET-2024-APP) stay as today, fetched once, SHA-pinned.

**Two oracles, never the reader's own past output (R40 of pdf-pixels).**
- The generator's truth, for every file.
- An independent reader for the structure and font files: pdf.js through the committed pdf-worker bundle, already the tier-2 member. pdf.js must agree with the truth on the page count and on the text of the decodable pages. Where pdf.js and the truth differ, the generator is wrong and the file is fixed.

**The entry paths.**

| Path | What it runs | Who owns it |
|---|---|---|
| **R** the real path | `test/m/plane/shape/harness.mjs`, made a suite runner. Upload by `captureOf(ctx).uploadCapture`, the capture screen's promotion, the door's `pendingadd`, the ledger's alarm driven tick by tick to the end, then `op=search` for the three markers, `op=reading` paged by `next` to the end, and the Document screen's Next page to the last page (I11) through the screens' own drawing. The child's old space is 128 MB with the held bytes inside; the platform value shim is preloaded. Per tick it reports pages, work counts, bytes pulled, store calls, yields and the longest operator stretch; never a time from the object (R-CLOCK). It gains `members: "real"`: the pdf-worker and ocr-worker handlers, from their committed bundles, bound in-process over the same R2 stand-in (R-SEAM). It also gains three faults: `restartAt: n`, the object rebuilt between ticks (I8); `storeFailAt: n`, the store throws once (N14); `killPage: p`, the OCR member dies on that page (E6). | **plane** (the PDF twin of R84: a new `pdf-shape.test.mjs`, heavy, run alone) |
| **M** the module interface | Each module's own tests read the same generated files at their interface, so a failing-first test points at its module. pdf-reader: `openPdfRange` and `range`, against the truth, with `pdfWork()` counts. reading-pipeline: `read` in pieces with real members bound. pdf-pixels: `renderPageToPixels` and the crop route. ocr-worker: its member over a page. extraction: `readHeld` ticks, `readingFor`, the index and search. | each module (column "Owner" below) |
| **W** workerd | The R files that test the thread and the platform's own behaviour (I13, the `DecompressionStream` behaviour, the stack depth of A7) also run in Miniflare with the real Durable Object (`r7-contention`'s pattern). Memory is not asserted there: local workerd enforces none (G27's lesson), so memory stays I4's child. | plane |

**When it runs.**
- **At every round end,** whole, never only for the fix in hand (K4785 (3)), in its own session and container with nothing else in it (K4787 (3)), then again for the time-sensitive set on one core (`taskset -c 0`).
- **Seeded variations at each round end:** the 8 fixed seeds below plus 8 new seeds derived from the round's tranche commit. A red keeps its seed and spec in the run's record, and the generator's shrinker (halving pages, dropping axes one at a time) gives the smallest failing spec before the red is planned (K4426's (3): the walker's exact case is the shrunk spec).
- **Subsets:** the smallest file of each family (marked **L** below) forms the live subset K4785 (4) brings forward for biosmoke8 at each redeploy. Choosing it is item (4)'s, not this plan's.

**What passing means.** A file passes when all of I1-I14 hold for it, or, for a refusal file, when I3 and I7 hold with exactly the statement its truth names and nothing else is read wrongly. The column "Passes when" gives only what is particular to the file.

### 3.2 The files

Sizes are the file's bytes. "R" is the real path; every file also runs at its owner's interface (M). In the Owner column, the first module named owns the failing-first test, and plane owns R for all of them.

**A. Size and count corners** (text pages, an identity ToUnicode font, classic xref unless said)

| # | File (how made) | Path | Passes when | Owner |
|---|---|---|---|---|
| A1 **L** | 1 page, 2 lines, 900 B | R | I1-I14; the stored reading equals the whole read (N3, I6) | reading-pipeline |
| A2 | Exactly 25,165,824 B (24 MiB), 2,000 pages of 60 lines | R | I4 at the ceiling; every tick within E1; I10 | reading-pipeline, pdf-reader |
| A3 **L** | 25,165,825 B (24 MiB + 1) | R | Stated with its size at once; nothing owed; no tick reads it | extraction |
| A4 | 10,000 pages of 2 lines (about 9 MB) | R | I1, I2 (ticks ≤ 102), I11 to page 10,000 | reading-pipeline, screens-inquiry |
| A5 **L** | 10,001 pages | R | `TOO_MANY_PAGES` with the count, `final` (only if Bob adopts B-2) | pdf-reader |
| A6 | 1 page whose content is 60 MiB decoded (one huge page) | R, M | Read, under I4 and I5 with yields inside the page | pdf-reader |
| A7 | 1,000 light pages and one page of 40 MiB decoded at page 500 (the average trap) | R | The heavy page is a range of its own; no tick over E1 | reading-pipeline |
| A8 **L** | A 200 KB Flate stream that inflates to 200 MB as page 3 of 10 (a bomb) | R, M | Page 3 `page_over_bound` with its figures; pages 1-2 and 4-10 read; child alive | pdf-reader |
| A9 | 1,500 pages × 200 lines, 11.6 MB (R42's dense case, now through the ranges) | R | I1, I4, I5 (the density refusal is not applied on this path, and is not needed) | reading-pipeline |
| A10 | A page of 300,000 characters among 3 small pages | R | Carried as runs of one page (C6); a word in its last line found (I10) | reading-pipeline, extraction |
| A11 | 16 MiB of 600,000 tiny objects, 50 pages | R, M | I4; open within E2's stretches | pdf-reader |

**B. Fonts and encodings** (each 3 pages small, plus B1 at 23 MiB)

| # | File | Path | Passes when | Owner |
|---|---|---|---|---|
| B1 **L** | Helvetica, `/WinAnsiEncoding`, no ToUnicode; 3 pages, and again at 23 MiB with 30 pages (G34's shape) | R | Text equals the truth through tier 1 (C1); tier 2 not asked | pdf-reader |
| B2 | MacRoman with `/Differences` (accented letters, `fi`), no ToUnicode | M, R | Text exact; "fi" found by search (C4) | pdf-reader, extraction |
| B3 | Type0 Identity-H with ToUnicode, 2-byte codes, Vietnamese and Spanish text | M, R | Text exact; a word with diacritics found | pdf-reader |
| B4 **L** | Type0 Identity-H, no ToUnicode | R | Pages stated undecodable by name; not routed to OCR (D9); `completeness` partial with the reason | reading-pipeline |
| B5 | ToUnicode with mixed codespace `<00>-<7F>` and `<8140>-<9FFC>`; 4-byte codes ≥ 0x80000000 | M | Every code mapped (N10) | pdf-reader |
| B6 | Type3 with Differences of standard glyph names; and Type3 with no names | M | First read exact; second stated undecodable | pdf-reader |
| B7 | A ToUnicode with `bfrange <00000000> <00FFFFFF>` | M | Answer within E2 (arithmetic lookup), text exact | pdf-reader |
| B8 | Ligatures through ToUnicode (`ﬁ`, `ﬂ`) and ActualText spans | M, R | Search finds "fi" words (C4); ActualText stated as unread by the walk or honoured, as the job decides and states | pdf-reader, extraction |
| B9 | Invisible text (`Tr 3`) over a full-page scan (ocrmypdf's shape) | R | The layer is read; OCR not asked | reading-pipeline |

**C. Structure features** (each 5-30 pages)

| # | File | Path | Passes when | Owner |
|---|---|---|---|---|
| C1 | Classic xref, then the same with no xref at all | M | Equal readings | pdf-reader |
| C2 **L** | Xref stream and 4 object streams (PDF 1.5), 30 pages | R | I1-I14 | pdf-reader |
| C3 | Revision 2 rewrites page 3's content into a **new object stream** (and a variant at top level) | M, R | Page 3 reads the newest text (N5) | pdf-reader |
| C4 | Three incremental revisions: add a page, delete a page, retitle | M | Pages and title of the last revision | pdf-reader |
| C5 | Linearized (hint stream, first-page xref), then an incremental update | M | As C3 | pdf-reader |
| C6 | All xref offsets wrong by 7 bytes; `startxref` missing | M, R | Read whole, `xref_reconstructed` noted | pdf-reader |
| C7 **L** | 30 pages cut at 70 % | R | `structure_reconstructed` and `pages_missing` (8 of 30) stated (N21, B2) | pdf-reader, extraction |
| C8 | Two catalogs; the trailer's `/Root` names the second (2 pages against 1) | M | 2 pages (N6) | pdf-reader |
| C9 | An unfiltered XMP stream containing `101 0 obj (fake) endobj` after the real object 101 | M | The real content read (N7) | pdf-reader |
| C10 | A page leaf with no `/Type` among typed siblings | M | All pages read (N8) | pdf-reader |
| C11 **L** | RC4-128, empty user password, 5 text pages and 2 scans | R | Text read and scans OCR'd (B3, N24); the cursor ends (N1) | pdf-reader, reading-pipeline |
| C12 | AES-128, empty user password | M, R | As C11 | pdf-reader |
| C13 | AES-256 (R6), empty user password | M | As C11 | pdf-reader |
| C14 **L** | AES-128 with a user password | R | `PASSWORD_REQUIRED` stated in one tick, `final`; never "being read" after it (N1, I7) | reading-pipeline, extraction |
| C15 | A direct `/Encrypt` dictionary in the trailer, empty password | M | Detected and decrypted (N9) | pdf-reader |
| C16 | A page tree 20,000 nodes deep, and one 300 deep | W, M | 300 deep read; 20,000 deep stated per A7, no stack overflow in workerd | pdf-reader |
| C17 | Inline images whose bytes contain `(Z) Tj` | M | No "Z" in the text (B5) | pdf-reader |
| C18 | LZW and RunLength content streams; a TIFF predictor 2 xref stream | M | Read (B4) | pdf-reader |
| C19 | 3 KB of junk after `%%EOF`; 600 B of junk before `%PDF-` | M | Read | pdf-reader |
| C20 | 16,000 links and 40 embedded files of 1 MB | R | I4; links and embedded files listed; I12 | pdf-reader |

**D. Scans and pictures** (generated bitmaps of known text)

| # | File | Path | Passes when | Owner |
|---|---|---|---|---|
| D1 **L** | 30-page CCITT G4 scan, 1.9 MB (re-walk 7's scan30) | R | 30 of 30 pages OCR'd by ticks; the upload answers within K4354 (no inline OCR, F4); nothing left unowed (N2, I9) | extraction, control-plane |
| D2 | 60-page DCT scan, 6 MB | R | 60 of 60 | reading-pipeline |
| D3 | 300-page grey scan, 24 MiB | R | 300 of 300; I2, I4, I7; time to whole recorded against B-3 | reading-pipeline, plane |
| D4 | 100 text pages, then 30 scanned pages | R | 130 pages; pages 124-129 OCR'd (N2) | reading-pipeline |
| D5 | A page with a text header and a scanned body (image share 0.7) | R | Header and OCR'd body both in the unit (D5) | reading-pipeline, pdf-pixels |
| D6 | A folio page (3 glyphs and a full-page image) | R, M | OCR appended to the folio (N13) | ocr-worker, pdf-pixels |
| D7 | A scanned page in 8 horizontal strips; and one with an inline image | M, R | Composited and read (D3) | pdf-pixels |
| D8 | JBIG2 generic page; JPX page | M | Read, pixel-exact against the independent decoders | pdf-pixels |
| D9 | A4 at 400 dpi; Letter at 600 dpi (1-bit) | R | Reduced and read (D2) | ocr-worker, pdf-pixels |
| D10 **L** | An 8 KB CCITT stream declaring 60,000 × 60,000 | R | `IMAGE_TOO_LARGE` from the header, a 200; no kill; not retried (N12, N23) | pdf-pixels, ocr-worker |
| D11 | CMYK DCT, 16-bit raw, ICCBased grey, Indexed | M | Read per D4 | pdf-pixels |
| D12 | Rotated pages (`/Rotate` 90 inherited), mixed page sizes, one 200 × 200 inch page with one image | R | Read upright; text order kept | pdf-pixels, pdf-reader |
| D13 | A page of vector paths only (a map) with no text and no image | R | Stated "no text; drawing" (D9), not silent | reading-pipeline |

**E. Combinations and the system around the read**

| # | File or run | Path | Passes when | Owner |
|---|---|---|---|---|
| E1 | 24 MiB: xref stream, object streams, 2 revisions, WinAnsi with no ToUnicode, 600 pages | R | I1-I14 | pdf-reader |
| E2 | BUDGET-2024-APP (real, 1,354 pages), as today | R | I1-I14; paged and Next page to 1,354; the last line found | plane |
| E3 | 200 pages, each a full-page image plus a text line, 24 MiB (scan-shaped, as G56 left unmeasured) | R | I4, I5; F1 (reading under 64 KiB) | reading-pipeline, extraction |
| E4 | C11's encryption with D2's scans | R | As both | reading-pipeline |
| E5 | **Load:** five members upload A2, B1 (23 MiB), D3, E3 and C2 within one minute | R, W | Each whole (I1); E5's one-at-a-time order seen; I13 throughout; the memory peak within E4 | plane |
| E6 | A2 with `restartAt` ticks 2, 7 and the last | R | I8 | reading-pipeline |
| E7 | A2 with `storeFailAt` tick 3 | R | Retried, whole (N14) | extraction |
| E8 | A7's heavy page inside the contention run | W | I13 (E2's yields inside a page) | pdf-reader, reading-pipeline |
| E9 | The same 30 MB PDF filed in two projects, and two versions sharing part 1 | R | Each project reads its own; no `NO_HOME`; no first-wins answer (N20) | extraction |
| E10 | D3 with `killPage` 150 | R | Page 150 stated after 3 kills; the read goes on (E6) | reading-pipeline, ocr-worker |
| E11 | The OCR press and `pagetranscribe` on A2 and D3 | R | Neither loads the file in the request (F4); I9 | extraction |

**F. Seeded variations** (16 a round end: 8 fixed, 8 derived)

The fixed seeds 1-8 cover the joint space once, chosen so each axis value appears at least twice:

| Seed | Pages, size | Fonts | Structure | Page kinds | Codec | Encryption |
|---|---|---|---|---|---|---|
| 1 | 40 pages, 2 MB | WinAnsi | object streams | text | | |
| 2 | 900 pages, 9 MB | Type0 | 3 revisions | text | | |
| 3 | 120 pages, 20 MB | | | mixed and folio | DCT | |
| 4 | 15 pages | Type3 | damaged xref | | | |
| 5 | 2,500 pages, 12 MB | MacRoman | linearized | | | |
| 6 | 60 pages | | | scans | JBIG2 | RC4, empty password |
| 7 | 1 huge page among 300 | | | | | AES |
| 8 | All axes drawn at random | | | | | |

The 8 derived seeds draw every axis from the envelope's distribution: pages log-uniform 1-10,000, size up to A1, the kinds and fonts by their weights. A derived seed whose draw falls outside the envelope is answered by the statement its truth names.

Passing means I1-I14 for each seed. On a red, the seed and its shrunk spec are recorded in the run's file (owner: plane, which runs them; the generator is test-support's).

### 3.3 What this costs to run (to be measured by the first run)

There are 64 files and 16 seeds. The heavy files are A2, A4, A6-A9, A11, B1 (23 MiB), D3, E1-E3, E5, E6 and E10: about 15 runs of 2-30 minutes each in node, and longer on one core. That makes it a round-end suite, not a per-job one. Each job runs the M-path files of its own module, a few seconds each, plus the R files its fix touches. The first round-end run records the times, and BOB sets the split from them.

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
