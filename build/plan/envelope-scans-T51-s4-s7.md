> **Split K5021.** Part of `envelope-scans-T51.md`, split by section; contains §4, §5, §6, §7. The rest: the head, §0, §3: `envelope-scans-T51.md`; §1 (the architecture) and §2 (the state of the code): `archive/envelope-scans-T51-s1-s2.md` (archived whole).

## 4. The envelope (K4798 (4))

### 4.1 How to read the table

Each row is one bound a scan or image read depends on:
- **Today** is the value in the code, with the file and line.
- **Stated** names the requirement that states it, or says "unstated".
- **Recommended** is the bound this plan proposes and what a file over it gets: always a named statement, `final`, nothing owed for ever, never silent (SI2, SI6).
- **Who:** "BOB's" means decided under P17, recorded once in `rulings.md` and reported to Bob as done. "**Bob's**" means it changes what a member may do or is told (K1881) and is put to him in §4.3. A protective limit against a hostile or broken file is BOB's.

Platform figures used: the object has 128 MB; the plane idles at about 50 MB since G39 (PDF #1, E: to be re-measured); value rows are at most 2,098,176 B; workerd freezes `Date.now()` in synchronous work (R-CLOCK); the OCR member has `cpu_ms` 30,000 (`ocr-worker/wrangler.jsonc:63`) and a 61.3 MB frame bound.

### 4.2 The bounds

| # | Bound | Today | Stated | Recommended | Who |
|---|---|---|---|---|---|
| **A. Types, bytes, pages** | | | | | |
| A1 | Image types read | JPEG baseline/extended-sequential 8-bit (1/3 comps), PNG non-interlaced; **nothing else** (S3) | reading-pipeline R4 (JPEG/PNG); the registry comment (`formats.mjs:269-272`) | Stated as a table in format-registry: **read** JPEG, PNG, and (B-S1) TIFF and GIF; **not read, stated by name** WebP, HEIC/AVIF, BMP, SVG, JP2. A file of a type not read gets the sentence "Civicsmith does not read <name> files; the original is kept" and **no no-op act** (S3) | **Bob's** (B-S1) |
| A2 | Bytes of an image or scan read | The door takes 256 MiB (`acquisition:359`); the whole exists ≤ 32 MiB inline (`MULTIPART_KEEP_MAX`); the reading loads ≤ 24 MiB (`WHOLE_READ_MAX`, `reading-pipeline:51`), 20 MiB from parts (`:47`); an image of 24-256 MiB is kept and permanently unread (S18) | reading-pipeline R37; extraction R84 names the constant | **24 MiB**, as PDF #1's A1, stated in pdf-pixels, ocr-worker and the member's words; over it, the size statement once, `final`; **and** the 24-256 MiB gap named in the door's answer, not only on the Document screen | **Bob's** (B-S2, with PDF's B-1) |
| A3 | Pages of a scan read by OCR | None; 24 a pass | unstated | **1,000** (PDF #1's D8/B-5): the first 1,000 read, the rest stated unread, never silent. Applies to a PDF and a multi-page TIFF alike | **Bob's** (B-S3) |
| A4 | Frames of a GIF; pages of a TIFF | n/a (no reader) | unstated | GIF: the first frame is read and the rest **stated** (`ANIMATED_IMAGE` is image-cover's word); TIFF: all pages up to A3's cap, each an IFD walked with a count bound (A8) | BOB's, with B-S1 |
| A5 | Pixels of a standalone picture, full frame | JPEG: `PICTURE_SOURCE_MAX` 16384 × 12288 × 3 = 603,979,776 **samples** (`picturepixels.mjs:56`, counts samples, not edges: 65535 × 9216 grey passes); reduced frame ≤ 4096 × 3072 × 3 (`:46`); PNG whole frame ≤ 37,748,736 samples from IHDR (`:463-466`) | pdf-pixels R42 | Unchanged, stated; add an **edge** bound (65,535 per edge) to the sample bound | BOB's |
| A6 | Declared size of an image **inside a PDF**, every route | **None** on DCT-decoded, CCITT, JBIG2 (below 2^28), raw (S5); JPX and PNG only for samples | R4 (JPX), R10 (PNG), R42 (picture) only | One bound for every route, judged from the dictionary and the codec header **before any allocation or inflate**: `width × height × components` of the *output* ≤ the working-set bound (61.3 MB today, image-codecs R4), else `IMAGE_TOO_LARGE` with the figures, a 200 `ok:false`, never a kill. A larger scanned page is **reduced** (the picture route's `reduce(k)`) with 300 dpi as the floor, as PDF #1's D2 | BOB's (protective); widening what is read through reduction is **Bob's** only if it changes the 300-dpi floor |
| A7 | Inflated size of an image stream | `INNER_DECODE_MAX` 128 MiB for raw ≥ 128 KiB; **unbounded** `inflateWhole` below (`pdfstructure.mjs:818-829, :177-180`) | unstated | Inflate with a cap of `rowBytes × height` (arithmetic before the inflate), never the whole isolate; the check at `pagepixels.mjs:608-614` already computes `need` — move the cap into the inflater | BOB's (protective) |
| A8 | Objects in an image container | JPX precincts/packets uncounted (S6); image-cover chunks/markers uncounted (S7); TIFF IFDs (n/a) | unstated | Counted before built: JPX precincts ≤ the working-set bound's worth (a number measured by D7); image-cover chunk/marker count ≤ 65,536 and **row stride ≤ 8 MiB** judged before the row buffers (S7); TIFF IFD count ≤ A3 | BOB's (protective) |
| **B. Colour, compression, orientation** | | | | | |
| B1 | Colour and sample kinds | Raw: 1-bit, 8-bit grey, 8-bit RGB; refused (stated): Indexed, ICCBased, CalRGB, Lab, Separation, CMYK, 4-bit, 16-bit raw; CMYK/YCCK JPEG; 4:1:1 JPEG; PNG all legal depths | pdf-pixels R24; image-codecs R1 | PDF #1's D4: ICCBased N=1/3 as grey/RGB, Indexed expanded, 16-bit reduced, CMYK naively converted; Lab/Separation stay refused, stated. Add `/Decode` on 8-bit raw, `/SMask`/`/Mask` composited or **stated** (S12) | BOB's |
| B2 | Compression | JPEG baseline/extended Huffman; **refused:** progressive, arithmetic, lossless, hierarchical, 12-bit, multi-scan, DNL; CCITT G3-1D, G4 (K>0 refused); JBIG2 (page-size and region features per `JBIG2_REFUSES`); JPX (no HTJ2K, palette, sYCC, subsampled, signed, >3 comps); LZW/RunLength before an image refused; interlaced PNG refused | image-codecs R1-R4, R10, R11; pdf-pixels R22-R25 | Stated once as the set; **progressive JPEG decoded** (the common web/scanner export, a decoder is bounded work, S11); the rest remain refused, **stated by the refusal's own reason to the member** (S11) | BOB's (decoding progressive widens what is read: told to Bob as done under P17) |
| B3 | Predictors and `/Decode` | PNG predictors ≥ 10 applied; **TIFF predictor 2 passed through** (S12) | unstated | Predictor 2 decoded (8-bit and 16-bit, 1-4 colours); an unknown predictor refused, never passed; `/Decode` honoured on every sample route | BOB's |
| B4 | Orientation | EXIF Orientation on a JPEG (R43); PDF `/Rotate`; **nothing for a PNG or an unlabelled JPEG** (S9) | pdf-pixels R21, R43 | The engine's orientation call is asked on every frame; a page found turned 90/180/270 is turned and OCR'd; a page the engine cannot orient is stated ("this page is sideways or too faint to read"), not stored as text | BOB's; the member-facing choice is **Bob's** (B-S6) |
| B5 | Dpi | `null` for pictures; never given to the engine (S16) | ocr-worker R8 lists it | Stated as unknown for pictures; `prepare` targets a line height (20 px) in place of a dpi | BOB's |
| **C. OCR: time, memory, quality, language** | | | | | |
| C1 | The OCR frame | 61,300,000 B RGBA, checked **after** the render and the PNG build (`member.mjs:116`) | ocr-worker R7 step 4 | Judged from the header **before** the render (A6); re-measured for the full path (bytes + render + PNG + inflated raw + packed + RGBA + wasm copy + model) in real workerd, two consecutive frames in one warm isolate, with the bound re-set to what the measurement admits; the prepared frame is judged before the engine, as today | BOB's (a measurement first, §6) |
| C2 | CPU per OCR page | 10.4 s at 300 dpi Letter against `cpu_ms` 30,000 (a comment); scales with text density and noise, not only pixels (**hyp**) | unstated | A dense-noisy page and the largest admitted frame measured under **20 s on one core** (K4787); no in-code timer is possible (R-CLOCK), so the bound is the frame size and a cap on regions returned (S16) | BOB's |
| C3 | OCR calls and time per request and per tick | 24 calls per `read` (`reading-pipeline:354`), each a page of "about 10 s"; **no deadline on a call** (`:357-361`); one tick can wait minutes on the member | reading-pipeline R4, R37 | **No OCR inside a member's request on any path** (K4354: the upload answers at once, the ledger reads). Per ledger tick: OCR pages bounded by the *member's wait* — at most **4 pages or 40 s of wait**, whichever comes first, after at least one page — and every page a tick leaves is owed on every path (SI1). A call has a deadline the plane can enforce (an `AbortSignal` timeout around the fetch; the fetch is I/O so the clock moves) | BOB's |
| C4 | Calls per request that load the object | The member reads the whole capture from R2 on each of up to 24 calls (`member.mjs:271-273`); the plane loads ≤ 24 MiB for a picture to do nothing (`bytesOf`, `:2377`) | unstated | The plane reads a 16-byte head for a picture entry; the member keeps one object read per page (acceptable) but states it | BOB's |
| C5 | Kill handling | A kill/throw = 5xx = `transient` and owed for ever (S8) | plane R77 (never forgets) | A top-level guard in the member (every throw -> a 200 `ok:false` with a named reason); a kill counts as an attempt; after **3** kills of one page that page is stated `PAGE_KILLED_READER` and the read goes on (PDF #1's E6) | BOB's |
| C6 | Languages | `eng` only (tessdata_fast 4.1 MB, `tessengine.mjs:46`); no language field on the wire; a non-English page is OCR'd by the English model, `ok:true`, no marker | ocr-worker R12 names the model | The limit **stated to the member** on every OCR'd document ("read as English"); adding languages (Spanish, Chinese, Vietnamese) is a product decision | **Bob's** (B-S4) |
| C7 | Legibility of a scanned page | Pictures only: share of words rated ≥ 0.6; < 0.2 refused, < 0.8 noted; **a PDF page: none**; `OCR_CONFIDENCE_FLOOR` null | ocr-worker R25 | The same measure for every OCR'd page (a PDF page, a picture): stored beside the text as `legibility {words, confident_words, share}`; the thresholds as today. What happens to an illegible page is **Bob's** (B-S6) | **Bob's** (B-S6) |
| C8 | What an OCR read keeps | Page-grain text; regions/confidence dropped; extent `pdf-page` p0 for a picture (S17) | none | Keep per page: legibility and engine, always (small); keep line rectangles in their own rows (not in the reading JSON) so a citation can show the region — a requirement for image-extents first | BOB's, unless it changes what a member may cite, then **Bob's** (told with the extent wording, K4269) |
| C9 | Engine instance | A new engine and a 4.1 MB model load per call (`tessengine.mjs:113-140`); accumulation across calls in a warm isolate unmeasured | unstated | Measured in C1's run; if memory rises, one instance per isolate with an explicit release, or a call count after which the member exits cleanly | BOB's (a measurement first) |
| **D. Safety, doors, memory beside the read** | | | | | |
| D1 | File safety on an image | Magic only, head 1 MiB; image over 1 MiB graded `high`; TIFF/HEIC `unknown`; verdict gates no read (S13) | file-safety R6, R11 | Image low by source at any size (R6 as written); TIFF/HEIC/BMP named `unread image type`, not `format_unchecked` for ever; the structure check says `not_examined`, never `clean` (S13e); one signature table for the family (S13c) | BOB's |
| D2 | A hold or scan result gating reading | None: decoders run before the daily scan | file-safety R16 leaves it open | A policy: until a decision, reading is **not** gated and the Document says nothing of it | **Bob's** (B-S7) |
| D3 | A scan batch | 200 targets, no byte budget, 900 s; `unknown LIMIT:*` counted scanned for 7 days (S13) | file-scanner R1, R16 | A byte budget per request (the container disk), `LIMIT:*` rescanned and its reason kept | BOB's |
| D4 | Web pictures | Bodies ≤ 400, 8 MiB each, 64 MiB; no screenshot; unread, unmarked (S15) | capture-sources R8, R9, R25 | State on the document "N pictures kept, not read" (a count and a size); a picture that is a scan of a page (dimensions ≥ 1000 px on an edge, grey/bilevel) is offered the same OCR as an upload; memory of `keepRenderBodies` decoded one body at a time | BOB's (words: a UX row, K4269) |
| D5 | image-cover (publication) | 32 MiB; 120 MP by product; row stride unbounded; chunk count unbounded (S7) | image-cover R3, R4 | A8's bounds; the photo promise (S23) worded to its coverable set, or progressive JPEG covered | BOB's; the promise is **Bob's** only if the words change what he approved (DEC-180) |
| **E. Liveness, state, load** | | | | | |
| E1 | Progress | No rule that an `ocr` tick advances (`NO_PAGES_LEFT` ends a row while pages are unread, S1); a picture's `ocr` row ends as finished (S4) | plane R77 | Every tick that answers `owed` advances the cursor or is `final` and stated (SI6); `ocr_left` read by the caller on every path | BOB's |
| E2 | State between ticks | The `openedPdf` slot is one global (PDF #1's N19); the OCR chain of a later piece (S25) | reading-pipeline R40 | Correctness never depends on the slot (SI9); the chain of a later piece names its pages | BOB's |
| E3 | Time to whole | Unbounded; 24 pages a pass, 29-31 s a tick, ledger gaps to 551 s (G70, STILL) | unstated | A promise in time: a 60-page scan whole in **15 minutes** and a 1,000-page one in **3 hours** on a quiet copy | **Bob's** (B-S5) |
| E4 | Everyday load (K4785: 5 at once) | One heavy row a tick, one slot | unstated | Measured with 5 scans at once (corpus F8), each screen within K4354 | BOB's (measure) |
| E5 | Concurrent OCR calls | The ledger runs one heavy row a tick; the member's isolate count unknown | unstated | Measured in C1's run | BOB's |

### 4.3 For Bob (K1881; each with an explanation, options and a recommendation, rendered when brought to him)

- **B-S1 Which kinds of image Civicsmith reads (A1, A4).**
  - **Today:** it reads photographs and scans saved as JPEG or PNG, and scanned PDFs. Any other image kind is accepted, kept whole, and then reported as "not read as text (non-textual or too large)", which is wrong ("too large") and unhelpful. The screen still offers "Read it now" and the assistant's reading for them, and both do nothing. The usual output of an office or library scanner is a multi-page TIFF; iPhones can save HEIC.
  - **Options:** (a) keep JPEG and PNG, and say plainly, by name, that the others are kept but not read; (b) (a) plus TIFF, single and multi-page; GIF (first frame); (c) (b) plus WebP and HEIC.
  - **Recommendation:** (b). TIFF is the scanner's format, and the codecs it uses (CCITT, Flate, JPEG) already exist in the repository; GIF is small. WebP and HEIC need new decoders (HEIC a large and patent-encumbered one); say so by name now and ask the member to save a JPEG, and revisit when a member asks.
- **B-S2 The largest image or scan read (A2).**
  - **Today:** the door takes up to 256 MiB; the reading loads up to 24 MiB. A scan of 24-256 MiB is kept and never read; the member sees this only on the Document page.
  - **Options:** (a) 24 MiB, stated at the door and in the member's words; (b) raise it; (c) read in pieces beyond it.
  - **Recommendation:** (a), as PDF's B-1; a TIFF at 600 dpi is 5-30 MB a page, so the page count (B-S3) is what decides what a member can do.
- **B-S3 The longest scan read by OCR (A3).**
  - **Options:** (a) 1,000 pages (about 2.8 hours of OCR at today's figures); (b) 300; (c) no limit.
  - **Recommendation:** (a), as PDF's B-5. Over it the first 1,000 are read and the member is told which pages are not.
- **B-S4 The languages read (C6).**
  - **Today:** only English. A Spanish, Chinese or Vietnamese page is read by the English model and comes back as plausible garbage with no warning.
  - **Options:** (a) state "read as English" on every OCR'd document; (b) add Spanish; (c) add the languages a group asks for.
  - **Recommendation:** (a) now (it is cheap and honest), (b) as the next product decision. Each language is a 4 MB model in the member and a language field on the wire.
- **B-S5 How long "being read" may last for a scan (E3).**
  - **Options:** (a) 15 minutes for 60 pages and 3 hours for 1,000, on a quiet copy; (b) tighter; (c) no promise.
  - **Recommendation:** (a), with the member told the expected time when a large scan starts (a UX row).
- **B-S6 A page that cannot be read well (B4, C7).** A page that is sideways, blurred, faint or in another language.
  - **Today:** a picture below 20 percent legible is refused, and a picture below 80 percent carries a note; a scanned PDF page is accepted at any quality, and a sideways picture at 25 percent legible is stored as text.
  - **Options:** (a) the same rule for pictures and scanned pages: turn the page upright first; then below 20 percent legible store nothing and say so, below 80 percent store it and say "only partly legible"; (b) store everything and mark the page; (c) keep today's.
  - **Recommendation:** (a). A garbage page in the record is worse than a stated gap (K4571).
- **B-S7 Does a safety hold stop an image from being read? (D2)**
  - **Today:** no. File safety grades and scans a file beside reading, never before it, and the daily virus scan can find something after the file was read and cited.
  - **Options:** (a) no gating (reading is in the plane's own sandbox); (b) wait for the scan before reading an image; (c) read, and hold the citation until the scan.
  - **Recommendation:** (a) for now, because the decoders are pure code in the plane and the original is not opened; state the policy in file-safety. This is a doctrine question: put it to Bob.

### 4.4 The invariants (the "always", stated once; each corpus file is judged against all of them)

The invariants name the module whose requirements carry them; BOB writes the wording into those requirements (§6). PDF #1's I1-I14 hold for scanned PDFs; these are the scan family's, with the ones it shares noted.
- **SI1 Every page once, and what is left is owed.** Every page of a scan is OCR'd exactly once or stated unread with a named reason; any page a cap leaves is owed on **every** path (upload, promote, press, ledger, `pagetranscribe`, `pdfstructure`); `ocr_left` is read by every caller. *(reading-pipeline R37, extraction R82; PDF #1's I9.)*
- **SI2 Never silent.** `completeness` is "whole" only when nothing is owed and no page is unread for a reason other than "has no text"; a type not read is named; a refusal's own reason reaches the member (S2, S3, S11). *(extraction R91, K4571.)*
- **SI3 Declared before allocated.** Every route judges the header's declared size before any allocation or inflate; a hostile header gets a named 200 refusal in under 1 s and the process stays flat (S5-S7). *(image-codecs, pdf-pixels, image-cover.)*
- **SI4 Memory.** The plane child at 128 MB with the held bytes inside it stays alive and within PDF #1's E4 budget; the OCR member's peak working set (C1) stays within its measured bound for every admitted frame. *(pdf-pixels, ocr-worker, plane.)*
- **SI5 Work.** No member request does OCR or a decode over its K4354 bar; every tick's OCR wait is within C3. *(control-plane, reading-pipeline, plane R93.)*
- **SI6 Progress and finiteness.** Every `ocr` tick that answers `owed` advances or is `final` and stated; a kill is an attempt; a page killed 3 times is stated; no row is "being read" after the last tick. *(plane R77, ocr-worker.)*
- **SI7 Search finds the last line.** A marker word on the last line of the last OCR'd page (and a first and a middle one) is found by `op=search` and is citable with its page. *(extraction R22, R90.)*
- **SI8 Truth.** A page that OCR reads contributes its words at the stated floor (≥ 90 percent on a clean page; the amended floor on a stated-hard one); a page below the legibility floor is stated and is not stored as text (S9, B-S6). *(ocr-worker R25.)*
- **SI9 State loss is harmless.** Restarting the object between any two ticks, or losing the open document, gives the same reading and units. *(reading-pipeline R40; PDF #1's I8.)*
- **SI10 Pieces equal whole.** The OCR text of a scan read in pieces equals the whole read's, and each piece's chain names its pages (S25). *(reading-pipeline R40.)*
- **SI11 Stored values bounded.** No stored value exceeds 1 MiB, and none exceeds the platform's value bound. *(extraction R96.)*
- **SI12 Same bytes, same answer.** Two runs of the same image give the same pixels (`pixels_sha256`) and the same units. *(pdf-pixels R40, image-codecs R8.)*
- **SI13 Honest acts.** No act is offered on a document that it cannot perform; a type not read says so by name once. *(screens-inquiry, extraction.)*
- **SI14 Contention.** While a scan's ticks run, cheap reads through the door wait under 500 ms at p95. *(plane R93; PDF #1's I13.)*

---

## 5. The corpus (K4798 (5))

### 5.1 How it is made

**One generator, seeded, that knows its own truth.** `imggen.mjs` under **test-support** (layer 1, beside PDF #1's `pdfgen.mjs`; BOB adds the path), no dependency on the network:
- **Pages.** Text lines are rasterised in node from a built-in bitmap font at a stated line height, so the generator needs no font file and the truth (the words) is exact. Each line carries `<seed>-p<page>-l<line>` and a word from a small vocabulary. Degradations are seeded and independent: tilt (±10°), 90/180/270 turns, uneven light, noise, blur, inversion, low contrast, colour, two columns, a table.
- **Encoders.** PNG (grey, RGB, palette, alpha, 1/8/16-bit, interlaced or not) and BMP and GIF (LZW) and TIFF (uncompressed, PackBits, Flate, LZW, G4, JPEG-in-TIFF; single and multi-page; II and MM; predictor 2) are written by the generator. Baseline and progressive JPEG (4:4:4, 4:2:2, 4:2:0, grey, CMYK, EXIF orientation 1-8) come from the committed Pillow/libjpeg generator (`make-picture-fixtures.py`) with its hashes; WebP and HEIC come from the same generator where an encoder exists and from committed tiny fixtures where it does not (no HEIC encoder was available here). CCITT G4, JBIG2 generic and JPX scan pages inside PDFs are produced by PDF #1's generator with its independent decoders (libtiff, jbig2dec, OpenJPEG).
- **Hostile files.** Declared-size files are patched headers (IHDR, SOF, SIZ, JBIG2 page info, PDF `/Width /Height`) over a few bytes of data; bombs are streamed zlib; chunk-count files are generated as bytes.
- **Truth file.** For each file: the page count, each page's words and orientation, the pages expected unread and the named reason, the expected statement for a refusal, and the markers on the first, middle and last lines.

**Two oracles, never the reader's own past output.** (1) The generator's truth. (2) An independent decoder for pixels: Pillow, libjpeg-turbo, libtiff, jbig2dec, OpenJPEG (the repository's own references); the OCR text is judged against the truth by the floor of SI8, not against a stored OCR output.

**The entry paths.**

| Path | What it runs | Owner |
|---|---|---|
| **R** the real path | PDF #1's shape harness (`test/m/plane/shape/harness.mjs`), made a suite runner, with two additions this plan needs: an **image document kind** (`imageDoc`, `scanDoc` beside `textDoc`, `pdfDoc`), and `members: "real"` binding the ocr-worker handler from its committed bundle over the same R2 stand-in. Upload by `captureOf(ctx).uploadCapture`, the capture screen's promotion, the door's `pendingadd`, the ledger's alarm driven tick by tick to the end, then `op=search` for the three markers, `op=reading` paged by `next`, and the Document screen's Next page to the last page. The child's old space is 128 MB with the held bytes inside it; faults `restartAt: n`, `storeFailAt: n`, `killPage: p` (the member dies on that page). Per tick it reports pages, OCR calls, bytes pulled, store calls, longest operator stretch; never a time from the object (R-CLOCK). The OCR wait is timed by the test, outside the object | **plane** (a new `scan-shape.test.mjs`, heavy, run alone) |
| **M** the module interface | Each module's own tests read the same generated files at their interface, so a failing-first test points at its module: image-codecs (decode against the oracle), pdf-pixels (`renderPageToPixels`, `renderPictureToPixels`, bounds), ocr-worker (the member over a page, in node with the real engine and under Miniflare), reading-pipeline (`read` in pieces with the real member), extraction (`readHeld` ticks, completeness, search), file-safety (classification, grade), capture (`uploadCapture` of the file), image-cover (cover, strip, hostile counts) | each module (column "Owner" below) |
| **W** workerd | The files that test the thread and the platform's behaviour: the OCR member's CPU and memory at the largest admitted frame, **two consecutive frames in one warm isolate** (C9), and the contention run (SI14). Memory is not asserted in Miniflare (it enforces none); the OCR member's memory is read by a **P** probe (read-only: a fixture OCR'd on biosmoke8 and the member's memory read back) at each redeploy, as K4785 (4) brings forward | plane, ocr-worker |

**Note on memory in the OCR member.** Local workerd enforces no 128 MB and node's RSS is not the isolate's bytes. The OCR member's peak is therefore **measured, not asserted, in node**, and **asserted on biosmoke8** by the P probe; the first job (§6) is that measurement.

**When it runs.**
- **At every round end,** whole, never only for the fix in hand (K4785 (3)), in its own container with nothing else (K4787 (3)), then again for the time-sensitive set on one core (`taskset -c 0`).
- **Seeded variations:** the 8 fixed seeds of §5.2 F plus 8 derived from the round's tranche commit. A red keeps its seed and spec in the run's record; the generator's shrinker (halve pages, drop axes one at a time) gives the smallest failing spec before the red is planned.
- **Live subset on biosmoke8 (K4785 (4)):** the smallest file of each family (marked **L**) is the subset. Choosing it is item (4)'s, not this plan's.

**What passing means.** A file passes when all of SI1-SI14 hold for it, or, for a refusal file, when SI2, SI3 and SI6 hold with exactly the statement its truth names and nothing else is read wrongly. "At the platform's shape" means: the plane in a 128 MB child with the bytes inside it; the OCR member at its stated frame bound; the CPU of one core; no timing taken from the object's clock (R-CLOCK); and the R-CLOCK exemption that the test, outside the object, times the OCR wait.

### 5.2 The files

Sizes are the file's bytes. "R" is the real path; every file also runs at its owner's interface (M). The first module named owns the failing-first test; plane owns R for all.

**A. Standalone image types** (each a one-page text page, English, upright, unless said)

| # | File (how made) | Path | Passes when | Owner |
|---|---|---|---|---|
| A1 **L** | Baseline JPEG, 4:2:0, 1700 × 2200, 300 KB | R | Read; the markers found by search; the unit is `pdf-page` p0 with legibility stored | reading-pipeline, ocr-worker |
| A2 **L** | Single-page TIFF (G4, 2550 × 3300, 1-bit) | R, M | Read (B-S1(b)); if B-S1 is (a), **stated by name** and no no-op act (S3) | reading-pipeline, pdf-pixels |
| A3 | Multi-page TIFF: 12 pages Flate grey, and 40 pages G4, II and MM, with and without predictor 2 | R, M | Every page once (SI1); a page-count over A3's cap stated; the last page's marker found | pdf-pixels, reading-pipeline |
| A4 | TIFF with JPEG-in-TIFF, LZW, PackBits, uncompressed, strips and tiles | M | Pixel-exact against libtiff | pdf-pixels |
| A5 | GIF, one frame; animated GIF of 10 frames | R, M | First frame read, the rest **stated** | reading-pipeline |
| A6 | WebP lossy and lossless | R | Read or stated by name, per B-S1 | format-registry |
| A7 | HEIC (committed tiny fixture); AVIF | R | Stated by name, per B-S1 | format-registry |
| A8 | BMP, SVG, JP2 file, ICO | R | Stated by name; none offered the no-op act (SI13) | format-registry, extraction |
| A9 | PNG: 8-bit grey, RGB, palette, 16-bit, alpha, interlaced; a 24 MiB PNG | R | Per B2 (interlaced refused with its own reason); the 24 MiB one read or stated per A2 | pdf-pixels |
| A10 **L** | Progressive JPEG; CMYK JPEG; arithmetic JPEG; 4:1:1 JPEG; 12-bit | R | Progressive read (B2); the others refused with **their own reason** shown to the member (S11) | pdf-pixels, reading-pipeline |
| A11 | Truncated JPEG at 2%, 50%, 99%; truncated PNG | R | Stated as truncated with the figure; no partial answer (image-cover's behaviour, extended) | pdf-pixels |
| A12 | JPEG with `%PDF-1.4` in a COM segment; with `<html` in EXIF; PNG with `%PDF-` in tEXt | R | Read as an image (S14) | format-registry |
| A13 | 12 MP and 48 MP phone JPEGs (EXIF 6 and 8), 4032 × 3024 | R, W | Read upright; the long edge reduced; CPU and memory recorded for C1 | pdf-pixels, ocr-worker |
| A14 | PNG at the frame bound: 4096 × 3072 RGB; one pixel over | R, W | At the bound read; over it `IMAGE_TOO_LARGE` from the header (C1) | pdf-pixels |
| A15 | A JPEG of 24 MiB; of 24 MiB + 1; of 100 MiB | R | 24 MiB read or stated per A2; over it stated **at the door**; nothing left "being read" (S18) | extraction, capture |
| A16 | 1 MiB, 1 MiB + 1, 3 MB, 25 MB JPEGs | M | file-safety grades all `low` (S13a) | file-safety |
| A17 | 256 MiB + 1 upload | R | Refused at the door with the figure | capture |
| A18 | A 3 MiB JPEG and a 1.9 MB scan PDF uploaded through the Add screen | R | The upload answers within K4354; nothing OCR'd in the request; the reading follows by the ledger (S1) | control-plane, extraction |

**B. Orientation, colour, quality, language** (one page each; the ten pages of a scan for the combinations)

| # | File | Path | Passes when | Owner |
|---|---|---|---|---|
| B1 **L** | The same page turned 90, 180, 270 as PNG; as JPEG without EXIF; as JPEG with EXIF 6; inside a PDF with and without `/Rotate` | R | Read upright at the SI8 floor, or stated; **never** `ok:true` garbage (S9) | ocr-worker, pdf-pixels |
| B2 | Upside-down scan in a mixed PDF | R | Same | reading-pipeline |
| B3 | Inverted (white on black); low contrast; stamped over | R | Read at the floor or stated | ocr-worker |
| B4 | Two columns; a table; a form with boxes | R | Words found; reading order recorded as engine order | ocr-worker |
| B5 | Colour scan, 24-bit; 1-bit 300 dpi; 8-bit grey 150 dpi | R | Read at the floor | pdf-pixels |
| B6 | 110 dpi, tilt 2.4°, noise and shade (L26's photos); the hard page (K4316's 52 percent) | R | At the stated floors | ocr-worker, pdf-pixels |
| B7 | Spanish, Vietnamese (diacritics), Chinese pages | R | Stated "read as English" (B-S4) and the English model's output marked; or read per a decision | ocr-worker, extraction |
| B8 | Blank page; noise; stripes (no words) | R | `NOTHING_TRANSCRIBED`; the page stated "no text"; not stored | ocr-worker |
| B9 | A page with a handwritten line; a faint photocopy | R | Legibility stored; below the floor stated | ocr-worker |

**C. Scanned PDFs** (PDF #1's D files are the base; these add the OCR cadence)

| # | File | Path | Passes when | Owner |
|---|---|---|---|---|
| C1 **L** | 30-page CCITT G4 scan, 1.9 MB (re-walk 7's scan30) | R | 30 of 30 by ticks; the upload within K4354; nothing left unowed (S1, SI1) | extraction, control-plane |
| C2 | 60-page DCT scan, 6 MB; 60-page, 2.6 MB | R | 60 of 60; the first pass within C3 | reading-pipeline |
| C3 | 130-page tiny-image scan, one piece holding > 24 scanned pages | R | 130 of 130; no page missed (S1: today 82 unread) | reading-pipeline, extraction |
| C4 | 100 text pages + 150 scanned pages, read in pieces | R | 250 of 250; `completeness` never "whole" before the last OCR (S2) | reading-pipeline, extraction |
| C5 | 300-page grey scan, 24 MiB | R | 300 of 300; SI4, SI6; the time recorded against B-S5 | plane |
| C6 | 1,000-page scan; 1,001-page scan | R | 1,000 read; 1,001: the first 1,000 read, the rest stated (B-S3) | reading-pipeline |
| C7 | A scan of 20 pages whose pages differ: DCT, CCITT, JBIG2 generic, JPX, Flate raw 1-bit, 8-bit | R, M | All read; pixel-exact against the independent decoders | pdf-pixels |
| C8 | A page in 8 horizontal strips; one with an inline image; two images on a page | M, R | Composited (PDF #1's D3) or stated `MULTIPLE_IMAGES_ON_PAGE` | pdf-pixels |
| C9 | A4 at 400 dpi; Letter at 600 dpi (1-bit); Tabloid at 300 dpi | R | Reduced and read (A6, PDF #1's D2) or stated `FRAME_OVER_BOUND` | ocr-worker, pdf-pixels |
| C10 | A folio page (3 glyphs + a full-page image); a page with a text header and a scanned body | R, M | The OCR words appended; the page not refused (S10) | ocr-worker, reading-pipeline |
| C11 | A picture of a table under a text title (a text page with one large image) | R | The image counted unread, or OCR'd by the crop route (S21) | reading-pipeline |
| C12 | Encrypted (empty password) scan; with a user password | R | Read, or `PASSWORD_REQUIRED` once (S24, PDF #1's B-4) | reading-pipeline |
| C13 | 25 scanned pages with `/Decode [1 0]` on 8-bit grey; TIFF predictor 2; `/SMask`; Indexed; ICCBased; 16-bit | M, R | Per B1 and B3; never `ok:true` with wrong pixels (S12) | pdf-pixels |

**D. Hostile and bound files** (each small; the point is the refusal and the flat process)

| # | File | Path | Passes when | Owner |
|---|---|---|---|---|
| D1 **L** | An 8 KB CCITT stream declaring 60000 × 60000, K -1 | R | `IMAGE_TOO_LARGE` from the dict, a 200; < 1 s; flat; **not retried** (S5, S8) | pdf-pixels, ocr-worker |
| D2 | A 330-byte JPEG declaring 60000 × 60000; a valid 8000 × 8000 RGB JPEG; 30000 × 30000 with one MCU row | R | Refused from the header / reduced; flat; no 2.7 GB allocation | pdf-pixels |
| D3 | A JBIG2 page 16000 × 16000 with 20 bytes of data; a region taller than its data ending `FF AC`; a pattern dictionary of 2^22 | M, R | TRUNCATED, no invented rows; flat (S5, S12) | image-codecs |
| D4 | A 97 KB Flate stream for 10000 × 10000 grey; a 100 MB zero bomb | M, R | Refused by the arithmetic check; inflate capped (A7) | pdf-pixels |
| D5 | PNG declaring 100000 × 100000; PNG bomb (700 MB of zeros under 100 × 100); IDAT claiming 1 × 1 | M, R | Refused in < 1 s (these hold today; kept as controls) | pdf-pixels |
| D6 | JPX SIZ 500², 1000², 2000² with 2 × 2 precincts, 10 bytes of data; 1500² with 1 × 1 | M | Refused before the object table (A8); flat (S6) | image-codecs |
| D7 | PNG 30,000,000 × 1 RGBA; 120,000,000 × 1; 1,000,000 empty IDAT; 2,000,000 `FF 01` markers | M | Refused before the buffers; flat (S7) | image-cover |
| D8 | An image in an uploaded DOCX that is D7; a marked photo that is D7 in a case | R | The cover/strip refuses; the isolate lives | image-cover, doc-clean |
| D9 | A frame exactly at 61.3 MB and one pixel over, through the real renderers; two consecutive frames at 52 MB in one warm isolate | W | At the bound read; over refused before the render; no accumulation (C1, C9) | ocr-worker |
| D10 | A dense noisy 300 dpi Letter page (CPU); the same at the largest admitted frame | W | Under C2's 20 s on one core | ocr-worker |
| D11 | A throw-inducing input for the member (a renderer that throws, an R2 that throws) | M | A 200 `ok:false` with a named reason; not a 500 (C5) | ocr-worker |
| D12 | A member that dies on page 150 of a 300-page scan | R | Page 150 stated after 3 kills; the read goes on (C5, SI6) | reading-pipeline, ocr-worker |
| D13 | `unknown LIMIT:ScanTime`; 200 targets of 200 MiB | M | Reason kept; batch bounded (D3 of §4.2) | file-safety, file-scanner |
| D14 | A TIFF with 100,000 IFDs; a TIFF whose IFD loops | M | Refused at the IFD cap (A8) | pdf-pixels |

**E. The system around the read**

| # | File or run | Path | Passes when | Owner |
|---|---|---|---|---|
| E1 | C1 with `restartAt` ticks 2, 7 and the last | R | SI9 | reading-pipeline |
| E2 | C3 with `storeFailAt` tick 2 | R | Retried; whole (S20) | extraction |
| E3 | A1 uploaded; the OCR down for three ticks, then up | R | Retried to the end, an `ocr` row that does not end at `UNREADABLE` (S4) | extraction |
| E4 | The OCR press and `pagetranscribe` on C5 and A3 | R | Neither loads the file inside the request (S19); each owes what it leaves | extraction |
| E5 | **Load:** five members upload C1, C3, A3, C5 and A13 within one minute | R, W | Each whole (SI1); SI14 throughout; the memory peak within SI4 | plane |
| E6 | The same scan filed in two projects; and two versions sharing part 1 | R | Each reads its own; no first-wins answer (PDF #1's N20) | extraction |
| E7 | A multipart upload (> 8 MiB) of a TIFF and of a JPEG | R | Whole made; read; the sentence names the type (S3, S18) | capture, reading-pipeline |
| E8 | A captured address that is an image URL; a web page with 40 images of 1.5 MiB; a web page that is one large image | R | The image read like an upload; the page states "40 pictures kept, not read" (S15); memory flat | capture-sources, capture |
| E9 | A project-less upload of a failed picture and of an owed scan | R | The line says "could not be read" / "being read", never "Text: None" (S18e) | screens-intake |
| E10 | A hold on an image while it is read (B-S7) | R | The documented policy holds | file-safety |
| E11 | Re-walk 7's scan30 as the walker made it, plus a real camera photo in each of JPEG, PNG, HEIC | live (L) | Per its truth | plane, walk |

**F. Seeded variations** (16 a round end: 8 fixed, 8 derived)

The fixed seeds 1-8 cover the joint space once, chosen so each axis value appears at least twice:

| Seed | Type and pages | Codec | Degradation | Size |
|---|---|---|---|---|
| 1 | JPEG, 1 page | baseline 4:2:0 | tilt 3° | 800 KB |
| 2 | PNG, 1 page | palette | inverted | 300 KB |
| 3 | TIFF, 40 pages | G4 | clean | 3 MB |
| 4 | TIFF, 12 pages | LZW + predictor 2 | noise, shade | 6 MB |
| 5 | PDF, 130 pages | JBIG2 | 90° turn on every 7th page | 1.5 MB |
| 6 | PDF, 60 pages | JPX | mixed with 40 text pages | 8 MB |
| 7 | PDF, 300 pages | DCT, mixed sizes | two columns, one huge page | 24 MiB |
| 8 | all axes drawn at random | | | |

The 8 derived seeds draw every axis from the envelope's distribution: pages log-uniform 1-1,000, size up to A2, the type, codec, orientation, colour and degradation by their weights. A derived seed whose draw falls outside the envelope is answered by the statement its truth names.

Passing means SI1-SI14 for each seed. On a red, the seed and its shrunk spec are recorded in the run's file (owner: plane, which runs them; the generator is test-support's).

### 5.3 What this costs to run (to be measured by the first run)

There are 72 files and 16 seeds. The heavy files are A13, A15, C3-C6, D9, D10, E5: about 12 runs of 2-30 minutes each in node, and longer on one core and with the real OCR engine (about 0.3-4 s a page in node, 10 s a page in workerd). The OCR floor (SI8) makes the corpus depend on tesseract's behaviour on a bitmap font; **the first job proves the generator's pages read at ≥ 90 percent through the engine** (a clean page does in the repository's fixtures; the generator's font is **hyp** until run). It is a round-end suite, not a per-job one: each job runs the M-path files of its own module (a few seconds each, a few with the real engine) plus the R files its fix touches. The first round-end run records the times, and BOB sets the split from them.

---

## 6. What this plan hands BOB (the order of work it implies; BOB's to place)

1. **Measure first (a session with workerd and biosmoke8 read-only):**
   - The OCR member's real CPU and memory in workerd: a clean Letter page at 300 dpi, a dense noisy one, the largest admitted frame (52-61 MB), two consecutive frames in one warm isolate (C1, C2, C9, D9, D10). The 61.3 MB bound is a 2026-09-10 measurement of synthetic frames.
   - The plane's idle on today's bundle (PDF #1's first job; E4 of its plan).
   - The OCR wait per page on the live copy, read with `own_ms` and `wait_ms` on a real `ocr` row (none exists since G67).
   - ClamAV 1.4.3 on a declared-huge PNG/TIFF (S13; `clamscan` is not available here).
   - Whether the installer leaves ocr-worker reachable on workers.dev (S8).
2. **Place S1 now.** It is re-walk 7's scan30, a silent partial read live today, with no plan and no fix-round-8 entry. S2, S4, S8, S11, S20 are small and share its files (control-plane, extraction, reading-pipeline, ocr-worker). Place S5, S6, S7 beside PDF #1's N12 (one cause: a size judged after the allocation, on every route). Place the rest of §3.3 as fix round 8 causes with R-FOUR's four fields; their failing-first tests are the corpus files named for each.
3. **Write the envelope into the requirements:**
   - image-codecs: A6, A7, A8 (JPX), B2, B3, and SI3, SI12.
   - pdf-pixels: A5, A6, B1, B3, B4, C8 and SI3, SI8.
   - ocr-worker: C1-C9, S8's guard, S16, and SI4, SI6, SI8.
   - image-cover: A8 (stride, count), D5, and SI3.
   - reading-pipeline: A1, C3, C5, E1, E2, S11, S21, S25, and SI1, SI2, SI9, SI10.
   - extraction: A2, S2, S4, S19, S20, and SI1, SI2, SI7, SI11.
   - file-safety and file-scanner: D1-D3 and S13.
   - capture, capture-sources, screens-intake: A2, D4, S15, S18, and SI13.
   - control-plane: C3 (no OCR in the request).
   - plane: the scan twin of R84 (the corpus, SI4, SI5, SI14); format-registry: the type table (A1, S14); test-support: the generator.
   - Each line names this plan and K4798.
4. **Bring §4.3 (B-S1 to B-S7) to Bob, rendered, in one page.** No job that depends on one of them starts before he answers. S1, S2, S5-S8, S11, S12 and the invariants do not wait on any of them. A1 and A4 wait on B-S1; A3 on B-S3; C6 on B-S4; E3 on B-S5; B4/C7 on B-S6; D2 on B-S7.
5. **Fix the cheap, certain, reachable-today items regardless of Bob's answers:** the `npm test` script of pdf-worker (S22); the stale comment; an `owe` passed from `Extraction.read` and a caller that reads `ocr_left`; the top-level guard; the refusal's own reason carried to the reading; the file-safety image grade.
6. **The corpus runs at the round end that closes fix round 8,** whole, and at every round end after; the live subset runs at each redeploy (K4785 (4)).

## 7. Not covered by this plan

- K4785 (4) and K4798's "live subset on biosmoke8": choosing it.
- The ClamAV and renderer behaviour on a hostile image (no `clamscan` or unrestricted `pdftoppm` here; S13 g/h are **hyp**).
- The email door: none exists in code (B); the doorbell's file path was not read.
- Google Drive photos: Drive file links are named and not harvested (`drive.mjs:197-205`).
- G70's cause (the time between ticks), which belongs to fix round 8 as its own cause and decides every many-tick scan.
- The UX words for the new statements (K4269, rows owed to the design stream).
- The spreadsheet, document and archive families (SHEET #1, DOCS #1).
- Handwriting recognition and layout analysis beyond the engine's line order: stated outside the envelope.
