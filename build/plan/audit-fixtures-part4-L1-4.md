# K4990 audit part 4: test files of layers 1 to 4 (modules.json indexes 0 to 55) not read in full by part 1

Branch tranche/T51, read only. Paths are from the repository root (`bio-plane/test/m/...` is written as `m/...` below). Line numbers are of the checkout. Provider indexes are positions in build/modules.json. Class letters as in part 1 (`build/plan/audit-fixtures-K4990.md`): A = the provider should publish a fixture made by its real code and the user re-points (judgment); B = mechanical re-point (the real thing is already imported or can be); C = acceptable (fault injection, platform binding, or the module's own interface). **A\*** = A, but the provider is LATER in modules.json than the user, so the user publishes a contract fixture and the provider's tests run it.

## Header: covered and not covered

**Scope.** The test paths of modules 0 to 55 (setup-words to content) total about 173,000 lines in about 1,100 files. I could not read that. I picked by grep (stub/fake/mock/double/canned/stand-in/scripted, registerJob/readHeld/armJobs/keepLater/owedLater, object literals with `ok:`/`reason:`), ranked files by hits, and read the seams part 1 named first. Candidate list: scratchpad `cand4.txt` (395 files with at least one hit).

**Read in full (every line), by module.**
- capture: fixture.mjs, reader.mjs, relays, ops, trace, t35, t49, r6-t51, r103-t51, g27-t51, g127f-worker.mjs, g127f-t51. r9-t51: lines 300-511 (part 1 read 1-312, so the file is covered between us).
- doorbell: fixture.mjs, expect.mjs, r9-t51, invariants, doorbell.test.
- file-safety: fixture.mjs, r1-registrar.
- reading-pipeline: fixture.mjs, bare-stub, r10-refusals, convert-ocr, convert-tiers.
- extraction: r80-failed, relays, round6, r82, r104, r99-r107.
- content: fixture.mjs, realread.mjs.
- acquisition: fix4b-owed.
- provenance: testimony-slot. docprofile: test/seam.test.mjs.
- credentials/fixture.mjs, ai-accounts/fixture.mjs.

**Read as a stated line range.** content/seams.test 1-40; membership/fixture 1-60; project-roster/fixture 1-75; host-governor/ops.test 1-30 and 80-110; capture/held.test 85-125 and 345-400; capture/t47 95-135; capture/knocker 1-60 and 175-200; capture-sources/fake-binding 1-60; sources/fixture 1-12; test-support/doubles.test 1-40.

**Seen only as grep lines (not read, no row; listed at the end).** everything else in scope. The census at the end gives counts.

**Reading of the rule against this scope.** No test in layers 1 to 4 imports real code of a LATER module (checked by import graph: the only later-module import is image-codecs to pdf-worker test helpers). So the later-provider problem shows up as hand-built stand-ins, not imports. The recurring forms are: (1) a stand-in of an earlier module's answer (A/B rows), (2) a stand-in of a later module's answer, which needs a contract fixture (A\* rows), (3) a hand copy of a fixture another test directory already holds.

## Per-provider tables (modules.json order)

### office-readers (15), pdf-reader (17), format-registry (18)

| # | test file:line | user | provider function | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | m/extraction/r82.test.mjs:10; round6.test.mjs:11 `pdfEntry`; r80-failed.test.mjs:10; r104.test.mjs:11 `asText` (all read in full; swapped in through `withEntry`, m/reading-pipeline/fixture.mjs:104) | extraction | pdf-reader `structure()` answer via format-registry entry | `{ok: true, text: i2([...]), pages, notes: []}` and (round6) a `detect` that matches only the `%PDF-` prefix | NO for the shape: real answer is `{ok, container: "pdf", version, pages, links, counts, text, images, pageBoxes, active, metadata, ...}` (bio-plane/src/pdfstructure.mjs:5083-5100) and refuses with `{ok:false, container, reason: "TOO_LARGE_TO_READ" \| "NOT_A_PDF" \| "NOT_BYTES", failure: "final"}` (:4984, :4961-4966); `notes` is not a key. The `text` part (I2) is real. | A |
| 2 | m/reading-pipeline/r10-refusals.test.mjs:112 (a jpeg entry whose `structure` returns `{ok:true, pages:1, text:{...no_text_layer...}}`) | reading-pipeline | pdf-reader / format-registry entry | same partial answer, for a picture format | same as 1 (no container/links/counts/pageBoxes) | A |
| 3 | m/reading-pipeline/r10-refusals.test.mjs:83-90 `marker(guard, part)` handed to a zip entry's `text()` | reading-pipeline | office-readers `text()` size markers | `{document:"", undetermined:[{part, why, guard}], counts}` with guards `{ok:false, text:"undetermined", why:"over_size_bound", size, bound, boundName:"STREAMED_TEXT_BOUND_BYTES", final:true}` and `{why:"TOO_MANY_OBJECTS", n, bound, final:true}` | yes, those guard shapes are what bio-plane/src/formats-xlsx.mjs:962,1076 and docx.mjs:412 emit; the envelope around them (`document:""`, `pages: undefined`) is typed by hand | A (office-readers publishes `oversizeMarker(kind)` made by its reader over a bound-exceeding generated package) |

### pdf-worker (31)

| # | test file:line | user | provider function | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | m/reading-pipeline/convert-tiers.test.mjs:186-190 `tiers()` | reading-pipeline | PDF_WORKER member (tier 2) | `{ok:true, tier:2, notes:[], links:[], structure:{}, text:{document, pages, undetermined, counts}}`; transport faults `{status:500, body:{ok:false}}` (:252) | partly compared: the same file runs the REAL member (`realMember`, :31-37, over committed CPDF-20 PDFs) and so is the model; the scripted `tiers()` keys other than `text` were not compared to pdf-worker/src/index.mjs | A (pdf-worker publishes `tier2Answer(pagesText)`; the file already has the real call) |

### ocr-worker (32)

| # | test file:line | user | provider function | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | m/reading-pipeline/fixture.mjs:124 `ocrAnswer` (used by convert-tiers:189, and via fixture by emitted, hooks, picture, pieces, r8-inline-ocr; extraction r82:133, r99-r107:41) | reading-pipeline, extraction | OCR_WORKER `POST /transcribe` | `{ok, engine, version, cap, measured_by, confidence_floor, pages:[{page, regions:[{text, source:{kind:"pdf-page", ref, page, rect}, confidence:"none"}]}]}`, no `deferred`, no `notes` | NO: the real answer carries `deferred`, `notes`, and each region's `source` has `space: "image-px"` and `image: {...}` (ocr-worker/src/member.mjs:289, 349-354); `"none"` confidence is real (:175) | A |
| 2 | m/reading-pipeline/convert-ocr.test.mjs:109-123 `ENV0`/`region`/`chunked`; failure answers :193, :253-257, :269 | reading-pipeline | OCR_WORKER | a SECOND hand-built answer shape in the same module: `confidence: {value:0.97, basis:"engine"}` (real form, member.mjs:175) while fixture.mjs uses `"none"`; `source` lacks `space`/`image`; failures `{ok:false, reason:"PAGE_NOT_RENDERABLE", detail:"x", page, deferred, notes:[]}` (real adds `refusal: {..., render: {reason, why, detail}}`, member.mjs:93-96, 327-329) and `{ok:false, reason:"PAGE_TOO_LARGE"}` | `PAGE_TOO_LARGE` is in no source file. The same file runs the REAL member under Miniflare (:126-160, `ocrWorkerDef()`), the model to extend | A |
| 3 | m/reading-pipeline/r10-refusals.test.mjs:110 | reading-pipeline | OCR_WORKER refusal | `{ok:false, reason:"PAGE_NOT_RENDERABLE", refusal:{render:{reason: why}}}` for why in IMAGE_TOO_LARGE, TRUNCATED_IMAGE_DATA, UNSUPPORTED_JPEG_PROCESS | shape partly real (`refusal.render.reason`, member.mjs:94, read by reading-pipeline/index.mjs:379); `page`, `detail`, `deferred` omitted; the three `why` values were not compared to the renderer's `RENDER_REFUSALS` | A |
| 4 | m/extraction/r82.test.mjs:133 `perPage`, :169 `member(() => ({ok:false, reason:"UNREADABLE"}))` | extraction | OCR_WORKER | `perPage` honours one page per call (the real contract, ocr-worker/src/contract.mjs:176 `chooseChunk`); the decline answer is `UNREADABLE` | `UNREADABLE` is not an ocr-worker reason (real: PAGE_NOT_RENDERABLE, PIXELS_UNREADABLE, NOTHING_TRANSCRIBED, ENGINE_FAILED, ENGINE_ABSENT, BAD_PAGES, NO_SUCH_PAGE, NOT_FOUND ...; extraction/index.mjs:1095 says "never `UNREADABLE`") | A |
| 5 | m/extraction/r99-r107.test.mjs:41 `ocrOnePage` | extraction | OCR_WORKER | `ocrAnswer(pages.slice(0, 24))`: answers up to 24 pages per call | NO: the real member transcribes ONE page per invocation and defers the rest (member.mjs:308-329); r82's `perPage` and this one contradict each other | A |

### file-scanner (34)

| # | test file:line | user | provider function | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | m/file-safety/fixture.mjs:49-52 `verdict`, :74-170 `scanner(script)` (read in full; used by every file-safety test that binds FILE_SCANNER, and by acquisition/reputation.test) | file-safety | FILE_SCANNER binding: `/scan`, `/render`, `/provider/*`, `/mirror`, `/version` | a scripted fetch binding that builds verdicts `{capture_sha, tool, engine, engine_version: "1.0", signatures, scanned_at, result, findings, latency_ms}`, refusals `{ok:false, code: "R2_NOT_CONFIGURED" \| ...}` | mostly yes (the verdict keys follow file-scanner/src/providers/routes.mjs:104-110 and clamav.mjs:77-79), but values differ: real clamav verdict `engine_version` is `null` until the engine reports (clamav.mjs:79), the fixture says `"1.0"`; every path is a re-implementation of `handle(request, deps)` (file-scanner/src/handler.mjs:40). file-scanner's own test helpers already give an in-memory bucket and `putCapture` (file-scanner/test/helpers.mjs) | A (file-scanner publishes `scannerBinding({bucket, script})` that runs its real `handle`) |

### record-core (36)

| # | test file:line | user | provider function | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | m/credentials/fixture.mjs:37-61 `stubCore`; m/ai-accounts/fixture.mjs:33-57 `stubCore` (an exact second copy) | credentials, ai-accounts | record-core `bundleInfo`, `declarePurge`, `declareTable` | a stub that refuses `TABLE_DECLARED` (with `declaredBy`), `TABLE_CLASS_MISSING`, `TABLE_CLASS_UNKNOWN` as bare `{ok:false, reason, table, class}` | NO: real refusals are `rowRefusal(...)` answers carrying check/translation/code (record-core/index.mjs:1515-1528) and also refuse a derived-rebuildable table with no rebuild or key columns (:1521-1524), which the stub does not. Each fixture already imports `recordOf`/`RECORD_SCHEMA` for its own `realWorld()` | B |
| 2 | m/membership/fixture.mjs:24-31; m/project-roster/fixture.mjs:47-58 (+ `getSetting` stand-in) | membership, project-roster | record-core `declarePurge`, `declareTable`, `bundleInfo`, `getSetting` | `declarePurge` returns `undefined` (real `{ok:true}` or a refusal); `declareTable` returns `{ok:true}` always | NO (as 1) | B |
| 3 | m/capture/r103-t51.test.mjs (`core.evidenceStore = () => ({...real, putFromParts: ...})` in 6 tests, read in full) | capture | record-core `evidenceStore().putFromParts` | wraps the REAL store and makes it throw or answer `{ok:false, reason:"EVIDENCE_STORE_REFUSED"}` or hang | yes (EVIDENCE_STORE_REFUSED is real, record-core/index.mjs:1985-1988) | C (fault injection over the real store; the model for the rest) |
| 4 | m/acquisition/fix4b-owed.test.mjs:241 `evFast = {putFromParts: async () => ({ok:true})}` | acquisition | record-core `putFromParts` | `{ok:true}` | partial: real is `{ok:true, size}` or `{ok:true, already:true}` (record-core/index.mjs:1983-2005) | B |

### credentials (40), as provider to earlier users (all A\*)

| # | test file:line | user | provider function | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | m/membership/fixture.mjs:40-45 | membership | credentials `registerClaimed`, `registerPasswordSetter`, `onRevoked` registrations | `registerClaimed("credentials", () => creds.claimed)`, a password setter returning `{ok:true, role}`, a revocation recorder | unknown (credentials' real registration answers not compared; membership/index.mjs:1270-1271 forwards them) | A\* |
| 2 | m/project-roster/fixture.mjs:23-28 `standIns` | project-roster | same | `registerPasswordSetter(({role}) => ({ok:true, role}))` | unknown | A\* |
| 3 | m/ai-accounts/fixture.mjs:69-72 `seams` | ai-accounts | same | claimed fact; `registerPasswordSetter(() => ({ok:true}))` (a setter that stores nothing) | unknown | A\* |

### host-governor (42)

| # | test file:line | user | provider function | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | m/capture/fixture.mjs:59-69 `governor()` (used by capture's tests and, through doorbell/fixture.mjs re-export, by every doorbell test); m/capture/knocker.test.mjs:188 (patches `governorAdmit` to refuse) | capture, doorbell | governorAdmit / governorReport / governorConfig / isHeld | admit `{admitted:true, wait_ms:0, appetite_per_min:12}`; refuse `{admitted:false, reason:"cooling_off", retry_in_ms:5000}`; report `{recorded:true}` | NO for the refusal and the report: real cooling_off also carries `refusals`, `last_refusal_status` (host-governor/index.mjs:132-133) and a report answers `{recorded:true, refusals, cooloff_until, cooloff_ms}` (:180, :194); the admit answer is real (:165). g127f-worker.mjs:24 passes `governor: {}` | A |

### provenance (43)

| # | test file:line | user | provider function | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | m/capture/fixture.mjs:73-98 `provenance(s)`; tables hand-copied at :34-38 (`register`, `captured_locators`) | capture (and doorbell through the re-export) | recordReceipt, signReceipt, receiptsOfCapture, registerHolds | `recordReceipt` answers `{recorded:true}`; `registerHolds` recomputes `{ok, sha, asked, registered, acquired}` from the hand-made tables | `registerHolds` shape yes (provenance/index.mjs:995-1003, minus `parts`); `recordReceipt` NO: real answers `{recorded, address_norm, via, observation, listeners}` (:1121-1164, line 44 of that method). The tables are columns copied by hand, while t49/r6-t51 load the real `PROVENANCE_SCHEMA` | A |
| 2 | m/capture/g127f-worker.mjs:22-23 | capture | registerHolds, recordReceipt | `registerHolds: () => ({ok:true, registered:false, acquired:false})`, `recordReceipt: (r) => {...; return {recorded:true, observation:null}}` | NO (no `sha`/`asked`; real receipt keys missing); the worker is otherwise real (real DO SQLite, real R2 binding, real record-core/membership/credentials) | A |
| 3 | m/capture/g127f-t51.test.mjs:453 (also part 1's r9-t51 rows) | capture | registerHolds | `({sha: x}) => ({ok:true, sha:x, asked:true, registered: x===sha(file), acquired: x===sha(file)})` | shape yes; values set by the test, not by a receipt the real recordReceipt wrote | A |
| 4 | m/capture/r6-t51.test.mjs:164 | capture | captureGrade | `Object.assign(provenance(f.s), {captureGrade: () => ({grade:"B", route:"direct", determined:true, basis:"measured"})})` | yes (provenance/index.mjs:1267 builds `{grade, route:"direct", determined:true, basis:"measured"}`) | B |
| 5 | m/capture/t49.test.mjs:34-41; r6-t51.test.mjs:35, 98; t47.test.mjs:103-110 (lines read) | capture | provenance as a whole | imports `provenance` from m/acquisition/fixture.mjs (a sibling's hand-built stand-in, `homeOf` fixed per part 1) laid over the real `PROVENANCE_SCHEMA` and handed to real `acquisitionOf` | the schema is real, the object is acquisition's stand-in, not provenance's | A (provenance publishes `provenanceWorld`, part 1) |
| 6 | m/file-safety/r1-registrar.test.mjs:15-18 `answer(w, s)` | file-safety | recordReceipt listener answer | reads `r.listeners.find(l => l.module === "file-safety").answer` off the REAL provenance receipt (fixture.mjs:153 builds `provenanceOf`) | yes: this is the real thing | C (model; resolves part 1 row 9's "unread fixture" for the receipt half) |

### capture-sources (46)

| # | test file:line | user | provider function | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | m/acquisition/fix4b-owed.test.mjs:119 `R_ANSWER` | acquisition | RENDERER answer (render.mjs RENDER_ANSWER) | `{ok:true, html, elapsed_ms, engine, engine_version, viewport, dpr, locale, timezone, navigated_to, status, requests:[], scripts:[], wait:{asked: RENDER_DEFAULTS.wait, fired}}` | yes for the keys (part 1 row 1 of capture-sources); `wait.asked` here is the default object, as in 7 other files. Same fix: `renderAnswer()` made by the real driver over `fakeBinding`. m/capture-sources/fake-binding.mjs (lines 1-60 read) is a fake of the Cloudflare Browser Rendering binding: platform, C | A (answer) |

### acquisition (47)

| # | test file:line | user | provider function | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | m/reading-pipeline/fixture.mjs:80 `doc()` (every reading-pipeline test that reads); m/content/realread.mjs:68-76 `document` literal | reading-pipeline | acquisition `acquire` document (capture's answer) | `{file, locator, retrieved, profile:{profiled_from_text, format:{format, confidence:"certain", signals:[]}, jurisdiction_view:null}, provenance_chain, capture:{sha256, bytes, content_type, transport:{http_headers}}, parts?}` | partly (part 1 row acquisition #6: a real document carries authority_*, origin, attestation_attempts, ...) | A |
| 1b | same (content's copy) | content | same | same literal | same | A |
| 2 | m/capture/g27-t51.test.mjs:19; r6-t51.test.mjs:212; (trace.test.mjs:27 answers only a refusal) | capture | acquisition `acquire` answer as the store returns it | `kept = {ok:true, existed:false, document:{file:"f", locator, capture:{sha256}}}` inside `{ok:true, result:{status:200, body: kept}}` | partial (no profile, retrieved, note) | A |
| 3 | m/acquisition/fix4b-owed.test.mjs:20 `ledger`, :146 `deliver: async () => ({ok:false})` | acquisition | its own `owedLater`/`deliver` hooks | records what it is handed, answers `{ok:true}`; a refused delivery is `{ok:false}` | acquisition's own interface (acquisition/index.mjs:392-399); real `owedRun` turns it into `DELIVERY_REFUSED` (exists in src). The implementer (plane `owedLater`, pending.mjs:680) answers the registrar's `{ok, existed, state}` | C (A\* for the plane's side, part 1) |

### calibration (52)

| # | test file:line | user | provider function | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | m/reading-pipeline/fixture.mjs:44-53 `calibration({live, throws})` | reading-pipeline | calibration `liveCalibration` | an in-memory list the test fills (`live`), recording `asked` | real row is `{calibration_id, engine, version, at, cap, measured_by}` (calibration/index.mjs:436-446); the fixture returns whatever the test puts in `live` | B (the fixture can seed the real `calibrationOf`) |

### reading-pipeline (53)

| # | test file:line | user | provider function | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | m/extraction/round6.test.mjs:210-236 `pieces()` (replaces `w.x.read`) | extraction | reading-pipeline `read` with `pieces` (R40) | first answer `{reading:{found:true,...,words_total, words_read}, text_units, more, cursor, read_through, total, piece:{units, words}}`; units `{extent:{kind:"doc-para", para, run:null}, seq, text}`; refusals `{refused:{code:"CURSOR_MISMATCH" \| "NOT_PIECEWISE", why}}` | codes real (reading-pipeline/index.mjs:1219-1220, 1495, 3270); unit keys (no `kind`, `reference`) and `reading` not compared. The file says the real path is `round6-plane.test.mjs` (not read). Used by ~14 tests | A |
| 2 | m/extraction/round6.test.mjs:103-105 `notRead()` | extraction | reading-pipeline failed reading | `{found:false, entities:[], failure:"final", content_type:null, text_source:null, basis: localize("reading-pipeline.index.document_not_read_text", ..., {why: localize("...multipart")})}` | keys exist in reading-pipeline/index.mjs; whether the current `read` still emits this reading is not compared (the comment says "as the old chain wrote it") | A |
| 3 | m/extraction/r82.test.mjs:64-72 `failedWith(failure)` | extraction | reading-pipeline transient failed reading (R37) | `{content_type:null, reader_version:null, read_from_text:false, found:false, entities:[], facts:{}, at, text_source:null, text_tier:null, text_container:null, basis:"the reading could not be composed (store read error)", failure}` | yes in shape; and r82.test.mjs:119-129 makes the same failure by the real chain (evidence `get` throws once), so the hand-built twin is replaceable | B |

### extraction (54)

| # | test file:line | user | provider function | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | m/content/fixture.mjs:78-103 `readings()` and `r.provider` (every content test builds it through `world()`; about 130 call sites over 18 of 24 files by grep) | content | extraction `readingOf`, `unitsOf`, `capturesReadFor`, `onReading`, `cellsOf` | a table of `{chain, pageCount, containerExtent, textContainer, captureFormat, pageBoxes}` per sha and `{units, state}` per sha | partly: the keys content reads; extraction's real `readingOf`/`unitsOf` answers were not compared. content/realread.mjs reads a real workbook through the real `reading-pipeline.read` and hands the result to this stand-in (the persistence table alone is stood in): the model | A |
| 2 | m/content/fixture.mjs:80-93 (`cellsOf` re-implementation), :86 reason `cells_not_held` | content | extraction `cellsOf` | an in-memory ranged read of typed cells (box logic, `next_row`, `cellsRangeMax`); refusal `{cells:null, reason:"cells_not_held", why:"stand-in: ..."}` | NO for the reason: extraction's `cellsOf` refuses `no_reading`, `sheet_not_named`, `sheet_not_held`, `cells_not_interpretable`, `bytes_not_held` (+`transient`) (extraction/index.mjs:2124-2175); `cells_not_held` exists only in content/notice.mjs:265 | A |
| 3 | m/capture/fixture.mjs:188-211 `readerFor` (now reader.mjs), m/capture/g27-t51.test.mjs:22 `READ` (also g27-reset.probe, r6-t51, ops via `readAcquired`) | capture | extraction `acquireReadingOp` (extraction/ops.mjs:119-137) | a re-implementation of the op, and `READ = {ok:true, result:{reading:{read:true, units:3}, text_units:3}}` | NO: real relays the store's own refusal with its status (`unanswered`), where the stand-in answers `storeSilent("acquire")`; real `diag` carries `correlation` and logs once with `console.error`; `text_units` is an array there, a number here; real also places `text_units_over_bound` and `text_units_skipped` | A\* |

### content (55), as provider to earlier users

| # | test file:line | user | provider function | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | m/provenance/testimony-slot.test.mjs:105-106 (and the registrations at :31-:136, read in full) | provenance | content `testimonyCheck` / `testimonyProject` and extraction's / observation-log's registrations | `refusal = {ok:false, reason:"CONTENT_EXTENT_REFUSED", code:"CONTENT_EXTENT_REFUSED", check:"C-45.1", translation:"a stand-in row", detail}`; projections `{indexed:1}`, `{content_id:"CNT-0001"}`, `{looked:true}` | `CONTENT_EXTENT_REFUSED` is in no source file (content's C-45.1 code is `CONTENT_EXTENT_OUT_OF_RANGE`, m/content/seams.test.mjs:34); projection shapes match (extraction/index.mjs:673-677 `{indexed}`, content/index.mjs:695-701 `{content_id}`) | A\* |

### doctypes (22), as provider to docprofile (21)

| # | test file:line | user | provider function | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | docprofile/test/seam.test.mjs:20 `stub(key, marker)` (read in full) | docprofile | a doctypes member (detect/parse/assess) | types `{key, label, version, contract, detect, parse, assess}` built by hand and registered through `registerDoctype` | they are objects conforming to docprofile's own published `CONTRACT`, testing docprofile's registry, not an answer of doctypes. A shared contract fixture run by doctypes' tests would close the loop | C (A\* if BOB wants the contract run by doctypes) |

### capture-requests (91) and ratification (115), as providers to capture

| # | test file:line | user | provider function | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | m/capture/held.test.mjs:357-377 `capturedFor` (lines 345-400 read) | capture | capture-requests `capturedFor` reader (registered at capture-requests/index.mjs:1868) | `{questions:[{question, title, asker, visible, waiting}]}` with hidden-project logic typed by hand | yes: keys identical to capture-requests/index.mjs:1352-1356 | A\* |
| 2 | m/capture/t49.test.mjs:77-79 `counting` (read in full) | capture | ratification `examine` as `batch-examination` reader (ratification/index.mjs:1694) | `{eligible:true}` or `{eligible:false, class, reason}`, `never()` hangs, a throw | yes: ratification/index.mjs:1638-1642 answers exactly `{eligible:true}` / `{eligible:false, class, reason}`; the hang and throw are fault injection | A\* (answer) / C (faults) |

### answer-envelope (155), the provider of `doAnswer`, `storeSilent`, `storeRefusal`, `requiredArgument` (part 1 attributed them to control-plane; they live in bio-plane/src/answer-envelope/index.mjs:276-385)

| # | test file:line | user | provider function | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | m/capture/relays.test.mjs:17, 29; ops.test.mjs:12-16; trace.test.mjs:12, 20-21; r6-t51.test.mjs (`doAnswer` near :428, `storeSilent`); g27-t51.test.mjs:13-18; t35.test.mjs (`doAnswer`, `storeSilent` near :225-228); reads.test.mjs (grep); g27-reset.probe.mjs (grep) | capture | `doAnswer`, `storeSilent`, `storeRefusal`, `requiredArgument`, `storageAbsent` | four different hand copies of `doAnswer` (full, without the `correlation` branch, without the `refused` branch, `{answered, result}` only) and three of `storeSilent` | `doAnswer` (relays) equals the real one (answer-envelope/index.mjs:276-288); the others drop branches. `storeSilent`: NO, real adds `code`, `check`, `translation` from `dispatchRow` and `detail: STORE_SILENT_DETAIL` (:305-310); `requiredArgument`: NO, real returns `{ok:false, reason, check/translation/code, error, op, argument, shape, detail}` (:373-385), the stand-in `{reason, op, argument, shape, error}` has no `ok:false` | A\* |
| 2 | m/doorbell/invariants.test.mjs:107, 109, 120; doorbell.test.mjs:19, 209 (and grep: inbox:13-14, knocker:21-22, t35:18-19, rows:81-82, knock-name:11-12, ops:13-14) | doorbell | same | the same helpers copied again (8 files) | as 1 | A\* |
| 3 | m/extraction/relays.test.mjs:20, 32, 36 (read in full) | extraction | same | `doAnswer`/`storeSilent`/`storeRefusal`/`requiredArgument`/`storageAbsent` copied a fifth and sixth time; `HANDED` also tests "as legacy-index handed it" (retired code) | as 1 (`storageAbsent` not compared) | A\* |
| 4 | m/host-governor/ops.test.mjs:86-87 (lines 1-30, 80-110 read) | host-governor | same | `storeSilent` with `detail: "this instance could not consult its own record"`, a third wording | NO (real detail text differs) | A\* |

### control-plane (169) and plane (170): stores, ledgers, registrar

| # | test file:line | user | provider function | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | m/doorbell/doorbell.test.mjs:25-32 `stubOf`; inbox.test:18, knocker.test:26 (grep), t35:24, rows:86, knock-name:16, ops:15 (grep); m/host-governor/ops.test.mjs:14 `storeOver`; m/capture/ops.test.mjs (`stubOf`, read in full) | doorbell, host-governor, capture | the Durable Object stub as control-plane's `dispatch` answers it | `{ok:true, result: await route()}` over the module's OWN routes; failing stubs `{ok:false}` 500, non-JSON, thrown | the envelope is what `doAnswer` reads (answer-envelope/index.mjs:283-285); `dispatch` itself not compared. Because the routes are the module's own real ones, this is the good model | A\* (envelope) / C (routes real) |
| 2 | m/capture/g27-t51.test.mjs:28; r6-t51.test.mjs:431-433 `acquireStore`; trace.test.mjs:27 `recordingStore` | capture | the store's `/acquire` and `/extractread` replies | `{ok:true, result:{status:200, body:kept}}`; `/extractread` replies `READ` | see acquisition row 2 and extraction row 3 | A\* |
| 3 | m/capture/g127f-t51.test.mjs:87-98 `registrar`; :396 `registerJob = (e) => ++calls === 1 ? {ok:false, reason:"NO_ROOM"} : {ok:true, existed:false, state:"queued"}`; imports test-support `jobRegistrarStub` | capture | plane/pending.mjs `registerJob`/`armJobs` | the stub made part of `core.transact`; `NO_ROOM` | `NO_ROOM` is in no source file (real refusals JOB_ENTRY_INVALID, JOB_KIND_UNKNOWN, JOB_SESSION_MISSING, JOB_SHA_INVALID, JOB_NOT_KEPT; part 1). capture's own `JOB_NOT_REGISTERED` wrap is real (capture/index.mjs) | A\* |
| 4 | m/capture/r103-t51.test.mjs:31 `handOff` (`c.keepLater = async (k) => {...; return {ok:true}}`; `async () => ({ok:false})`; a thrower) | capture | plane `keepLater` (plane/pending.mjs:682 `h.owe(...)`) | `{ok:true}` / `{ok:false}` / throws | real answers the registrar's `{ok, existed, state}` or a refusal; the stand-in is thinner | A\* |
| 5 | m/doorbell/r9-t51.test.mjs:84 (read in full) | doorbell | registerJob | refusals `{ok:false, reason:"JOB_TABLE_FULL"}`, a throw, `undefined` | `JOB_TABLE_FULL` NOT in src | A\* |
| 6 | m/file-safety/r1-registrar.test.mjs:43 (read in full) | file-safety | registerJob | `e.kind === "grade" ? {ok:false, reason:"JOB_KIND_UNKNOWN"} : e.kind === "safe_view" ? throws : {ok:true, existed:false, state:"queued"}` | `JOB_KIND_UNKNOWN` real (plane/pending.mjs:244); `REGISTRAR_THREW` is file-safety's own | A\* (answer) / C (throw) |
| 7 | m/extraction/r99-r107.test.mjs:131 `jobRegistrarStub()` and :287 `registerOwe(jobs.registerJob)`, :313 `registerOwe(() => ({ok:false, reason:"JOB_TABLE_FULL"}))` | extraction | registerJob | the stub in test-support and the invented refusal | `JOB_TABLE_FULL` NOT in src | A\* |

## Fixtures each provider would need (from the rows above)

- **pdf-reader**: `pdfStructureAnswer(text)` made by the real `extractPdfStructure` over a pdfgen PDF (extraction r82, round6, r80-failed, r104; reading-pipeline).
- **office-readers**: `oversizeMarker(kind)`, from a generated over-bound package.
- **pdf-worker**: `tier2Answer(pagesText)` (the real call already exists in convert-tiers).
- **ocr-worker**: one `ocrAnswer(pages, opts)`, one `ocrDeclines(reason, page)` and `ocrRefusesRender(reason)`, made by the real member over a fake engine, honouring one page per call; replaces the three hand copies in reading-pipeline and extraction.
- **file-scanner**: `scannerBinding({bucket, script})` over its real `handle`.
- **record-core**: `recordServices({bundles})`, or simply `recordOf` with the `bundles` table (already imported in the same fixtures).
- **host-governor**: `governorWorld({refuse, held})` over the real governor (refusal with `refusals`, `last_refusal_status`).
- **provenance**: `provenanceWorld` (as part 1) also covering `recordReceipt`'s `{recorded, address_norm, via, observation, listeners}`.
- **acquisition**: `acquiredDocument(bytes, opts)` for reading-pipeline and content.
- **calibration**: `calibrationWorld({live})` over `calibrationOf`.
- **reading-pipeline**: `pieceReader(...)` and `transientFailure()` / `notReadAsText()` made by `read`.
- **extraction**: `readingsProvider` over a real instance (for content), including the real `cellsOf` refusal reasons.
- **Contract fixtures run by LATER providers (A\*)**: answer-envelope `envelopeHelpers()` (the one `doAnswer`/`storeSilent`/`storeRefusal`/`requiredArgument`/`storageAbsent`, imported by capture, doorbell, extraction, host-governor, provenance tests; today seven hand copies, three wordings of the silence); credentials `membershipRegistrations()`; capture-requests `capturedForAnswer`; ratification `examineAnswer`; content `testimonyRefusal`; extraction `acquireReadingOp` contract (for capture's `readerFor`); plane `registrarWorld()` with the real refusal list.

## Rows by user module

| user module | A (A\* counted in A) | of which A\* | B | C | total |
|---|---|---|---|---|---|
| extraction | 7 | 2 | 1 | 0 | 8 |
| reading-pipeline | 7 | 0 | 1 | 0 | 8 |
| content | 3 | 0 | 0 | 0 | 3 |
| capture | 13 | 7 | 1 | 1 | 15 |
| doorbell | 4 | 3 | 0 | 0 | 4 |
| file-safety | 2 | 1 | 0 | 1 | 3 |
| acquisition | 1 | 0 | 1 | 1 | 3 |
| credentials | 0 | 0 | 1 | 0 | 1 |
| ai-accounts | 1 | 1 | 1 | 0 | 2 |
| membership | 1 | 1 | 1 | 0 | 2 |
| project-roster | 1 | 1 | 1 | 0 | 2 |
| provenance | 1 | 1 | 0 | 0 | 1 |
| host-governor | 1 | 1 | 0 | 0 | 1 |
| docprofile | 0 | 0 | 0 | 1 | 1 |
| **all** | **42** | **18** | **8** | **4** | **54** |

Rows are seams (one hand-built answer, used by one or more files), not files. A row naming several files counts once under its first-named user, except acquisition #1 which is split in two (reading-pipeline, content). The number of files that repeat these seams is much larger (for instance, the answer-envelope helpers are copied in about 20 files in capture, doorbell and extraction alone, and `readings()` feeds 18 content files).

## New structural findings for BOB

1. **The envelope helpers are answer-envelope's (155), not control-plane's.** Part 1 and the test comments say "control-plane R23, R25, R30". The code is bio-plane/src/answer-envelope/index.mjs. It is the latest provider in the whole map relative to capture, doorbell, extraction and host-governor, so only a contract fixture works (A\*). Drift is already visible: `storeSilent` has three wordings and the stand-ins lack the real `code`/`check`/`translation`; `requiredArgument` lacks `ok:false`.
2. **Invented codes found in this scope** (grep of bio-plane/src, ocr-worker/src, pdf-worker/src, file-scanner/src finds none): `NO_ROOM`, `JOB_TABLE_FULL` (known from part 1, now also in doorbell, extraction r99-r107), `PAGE_TOO_LARGE`, `OVER_ENVELOPE` (reading-pipeline r37.test.mjs, grep only), `UNREADABLE` (extraction r82), `CONTENT_EXTENT_REFUSED` (provenance), `OBJECT_TOO_LARGE` (acquisition fix3-t51:152, grep only), `cells_not_held` as an extraction answer (content fixture), `R9_DOWN` (part 1).
3. **Same answer built two ways inside one module**: reading-pipeline has `ocrAnswer` (confidence `"none"`, no `deferred`) in fixture.mjs and `chunked`/`region` (confidence `{value, basis}`, with `deferred`) in convert-ocr/r37; extraction's `perPage` honours the one-page contract and `ocrOnePage` does not.
4. **Good models already in scope** (extend, do not replace): reading-pipeline convert-ocr (real ocr-worker in Miniflare) and convert-tiers (real pdf-worker over committed PDFs); extraction r80-failed and r99-r107 ("the real chain, never written by hand"); capture ops.test (real `captureOps` behind the stub), t49 (real `acquisitionOf`, real `PROVENANCE_SCHEMA`), r103-t51 (real `putFromParts` wrapped), g127f-worker (Miniflare, real DO SQLite and R2); file-safety fixture (real record-core, membership, credentials, provenance, acquisition) and r1-registrar (answer read off the real receipt); sources fixture (real record-core, membership, doorbell, capture, provenance); content realread.mjs.
5. **A fixture imported across test directories** (not a provider-published one): capture imports acquisition/fixture.mjs; doorbell imports capture/fixture.mjs; content imports extraction/fixture.mjs; file-safety imports provenance/fixture.mjs; reading-pipeline imports ocr-worker/test/memberworker.mjs and pdf-reader/dense.mjs. Their direction is later-user-from-earlier-provider (allowed by order), but the capture and doorbell cases import a stand-in, not the provider's real code.

## Seen only as grep lines (no row; not read in full)

Each is a pointer for the next audit, with what the grep line shows.

- acquisition: fix3-t51.test.mjs:108-152 (a "scripted double of `evidenceStore().putFromParts`" answering `{ok:false, reason:"OBJECT_TOO_LARGE"}`; real reasons are EVIDENCE_STORE_REFUSED / PART_MISSING / DIGEST_MISMATCH / PARTS_MALFORMED); fix6-t51.test.mjs:81-82, 143, 181, 286 (`owedLater` ledger answering `{ok:false, reason:"PENDING_MALFORMED"}`, which is real in plane/pending.mjs; `deliver` `{ok:false}`); keyed.test.mjs:16-24 (a credentials stand-in whose OFF row uses acquisition's own translation key `acquisition.keyed.the_team_s_key_for`, while credentials/index.mjs:2002-2008 uses `credentials.index.the_teams_key_for`: provider is EARLIER, so class A); reputation.test.mjs:107-108 (scripted FILE_SCANNER answering `REPUTATION_LIST_STALE` and `TOOL_SPEC_MALFORMED`, both real in file-scanner/src/providers/routes.mjs); g27-g32-t51 and r7-t51 (`owedLater`/`keepLater` stand-ins).
- reading-pipeline (all grep only): r37 (member(...) with `OVER_ENVELOPE`, `PAGE_NOT_RENDERABLE`), r8-liveness (worker answers `{ok:true, tier, text}`), r46-whole, picture, pieces (tier2Escalate/tier3Extend with scripted members), g41-held (`cellsIn` entries `{ok:false, why:"bad_range"}`), emitted, dec149, furniture, hooks, origin, pieces-formats, read.test, g48-first-tick, r10-skip, classify-once (`text: async () => ({ok:false, reason:"REFUSED"})`).
- extraction: pagetranscribe, g41, round5, t44, r101, r103 (part 1 read 1-121), t43, t46, t48, t50, g33, g40, round6-pieces, declared-ops, r7-words-read, r80-counters, plus 30 others.
- capture: held.test, t47, knocker (rest), services, upload, reads, evidence-absent, e13/fix2/fix3 files, g27-reset.probe.
- doorbell: inbox, knocker, t35, rows, knock-name, ops, instance (`declarePurge` refusals typed by hand at :76-82), held; file-safety: tools, scan, mirror, signatures, fail-closed, view, wakes, rows, deeper, open and 17 more; provenance: ops.test (header says "stand-in store, evidence bucket and envelope helpers"), receipts (`onReceipt` listeners returning `{ok:false, reason:"NOPE"}`, own interface), register, authority; credentials: seam.test:95/181, status-at:163, t35-misc:75, t35-signin:243 (more `declarePurge` stubs, B like row record-core 1); host-governor governor.test (stand-in governor recorder at :329-340, `declarePurge` stubs :534, :600); attestation (fixture), capture-sources (all but fake-binding), sources (all but fixture head), promotion, calibration, membership/member-roster/project-roster tests, ooxml, csv-reader, odf-reader, bundler, signatures, runtime-limits and the other layer 1 modules (their greps show only own-module mocks: `t.mock.timers`, fake clamscan/soffice binaries in file-scanner/test/stubs, which are platform C).

## Census of the unread (grep only; NOT findings)

Files with at least one candidate hit (the pattern is loose and counts the module's own mocks too), by module: extraction 40, acquisition 40, capture 38, reading-pipeline 28, file-safety 21, credentials 17, member-roster 15, file-scanner 15, membership 14, promotion 12, project-roster 11, doorbell 11, ai-accounts 11, pdf-reader 9, docprofile 9, csv-reader 8 (full list: scratchpad `cand4.txt`). Likeliest places for more rows, largest first: extraction (the unread files re-use `withEntry`, `ocrAnswer`, `register` stand-ins), reading-pipeline (scripted `member` answers in many files), capture (hand `readAcquired`/envelope copies in 8 unread files), file-safety (scripted scanner is shared, so rows mostly repeat file-scanner #1), acquisition (keyed, reputation, fix3, fix6).
