# K4990 audit (plan item 7a): module tests that hand-build another module's answer

Branch tranche/T51, read only. Paths are from the repository root. Line numbers are of the checkout. Provider indexes are positions in build/modules.json (lower = earlier).

## Header

**Method.** Candidates found by grep (stub/fake/double/stand-in words, `registerJob`, `readHeld`, `armJobs`, `owedLater`, `keepLater`, `deliver`, `partsOf`, object literals with `ok:`/`reason:`/`detail:`, `extent: {kind`). Each file listed as read was then read from top to bottom. "Real can produce" was checked against the provider's source where a file:line is given; "unknown" means I did not compare. Class A = provider publishes a fixture made by its real code, user re-points (judgment); B = mechanical re-point once the fixture exists; C = acceptable. **A\*** = A, but the provider is LATER than the user in modules.json order, so the rule cannot be met as written (see Structural findings).

**Read in full (every line):** acquisition: fixture.mjs, acquire.test.mjs, r9-registrar, r9-pictures-unread, r9-failed-ends, r9-read-range, r7-fetchdone, r7-render-failed, r8-fetch-refused, r123-batch-d, r8-open-captures, r9-ceilings, r9-pending-render, fix5-render-owed, r8-render-bar, r9-render-charge, r9-multipart-memory, r9-unpack-transient, unpack.test.mjs, r17-name-type, r9-format-range. plane: r9-jobs, fix3-r74, fix4-defer, r7-keephome, fix4-seam, fix4-r75, fix4b-r77, fix4b-r77-owners, fix5-r77. control-plane: harness.mjs, r130-jobs, r135-job-state, r117-held, t51-held-failed. extraction: fixture.mjs, r8-owe, s25-pieces-chain. capture: none whole. doorbell: r9-t51. file-safety: r1-registrar. screens-inquiry: r9-document. test-support: job-registrar-stub.mjs.

**Partly read (the row says which lines):** control-plane r123-reading (lines 1-130 of 208) and r9-seam-reading.mjs (1-160 of 708); capture r9-t51 (1-312 of 511); extraction r103 (1-121 of 165); reading-pipeline r9-reader (1-60 and 130-200 of 472).

**NOT read (only grep-counted, so no claim):** every other file under plane/ (about 100: watchdog, t42, t44, round6-*, r7-*/r8-* entries and probes, l75/l77/l79, shape/harness.mjs), control-plane/ (about 110: envelope, inbox-door, statementack, doorbell, door tests, r9-seam-limits, r72-parted, r8-seam-*), acquisition (archivelist, profile, keyed, budgets, fix3/fix4b/fix6/t50, etc.), extraction (r99-r107, pdfstructure, r80*, round5/6, g3x/g4x, ~45 more), capture (g127f-t51, g127f-plane, r103, r7-upload), reading-pipeline (68 more), content, office-readers (18 of 19 files), odf-reader, format-registry, pdf-reader, pdf-pixels, image-codecs, pdf-worker, ocr-worker, bundler, promotion, provenance, queue, ratification, public-read, publication, all screens-* (except r9-document), interface-shell, op-declarations, affordances and the remaining ~120 modules. The census at the end says where the same pattern is likely.

## Structural findings for BOB (not row-level)

1. **Order blocks the rule in several seams.** acquisition (47) is earlier than capture (48), control-plane (169) and plane (170), yet its tests need their answers (the capture store, `deliverOwedRender`, the job registrar). control-plane (169) is earlier than plane (170) and its whole harness fakes plane's Store. capture/doorbell/file-safety/extraction need the registrar, which lives in plane/pending.mjs. A provider fixture cannot be imported by an earlier module. Options: (a) the earlier module publishes the *contract fixture* (what it requires), the later provider's own test runs that contract against its real code (one test, one place); (b) move the seam tests to the later module (as control-plane's Miniflare seams already do).
2. **The registrar stub lives in test-support**, which "holds only the harness". It re-implements part of plane/pending.mjs registerJob (kind/sha checks, idempotence, `bump`). It is used in 14 files (acquisition 1, extraction 6, capture 2, doorbell 1, file-safety 1, control-plane 2, test-support 1). Every refusal reason these tests invent (`JOB_TABLE_FULL`, `NO_ROOM`) is absent from src; real reasons: JOB_ENTRY_INVALID, JOB_KIND_UNKNOWN, JOB_SESSION_MISSING, JOB_SHA_INVALID, JOB_NOT_KEPT (plane/pending.mjs:242-265).
3. **Invented codes** (grep of src finds none): `JOB_TABLE_FULL`, `NO_ROOM`, `CAPTURE_SESSION_GONE`, `READING_FINAL_NO_TEXT`, extent kinds `paragraph`/`line`/`heading`.
4. **Good models already in the tree:** acquisition seam-render.test.mjs and r9-pictures-unread.test.mjs (real driver over capture-sources' `fakeBinding`); plane fix4b-r77-owners.test.mjs and control-plane r117-held part two, t51-held-failed, r9-seam-reading (real owners / real plane under Miniflare); plane tests importing record-core's `multipartBucket`.

## Tables by provider module (modules.json order)

### test-support (index 6)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/test-support/doubles.test.mjs (145 lines, NOT read in full), alarm-double users scheduler/r8-stale, r8-budget, r9-visible (NOT read) | test-support | harness tests of the stub/alarm double | tests of the harness itself | n/a | C (not read) |

### office-readers (index 15)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/reading-pipeline/r9-reader.test.mjs:139-142 (read lines 1-60, 130-200 only) | reading-pipeline | docx.mjs `text()` answer via a swapped entry (`withEntry`, format x9parts) | `parts` for EVERY kind of the closed list (incl. speaker_note, master_text, cell_note) under `container: "docx"` | unknown: whether docx ever emits those three kinds (office-readers/parts-kinds.test.mjs:10 lists the kinds, :129-149 shows speaker/master under pptx) | A |
| 2 | bio-plane/test/m/reading-pipeline/r9-reader.test.mjs:158-162 | reading-pipeline | docx.mjs `text()` text_box part with `paras` | `{kind:"text_box", ref:"\u00b64", part, text, paras:[3]}` plus `paragraphs` | yes (office-readers/parts-kinds.test.mjs:65-83 asserts docx text_box `paras`) | A |
| 3 | bio-plane/test/m/reading-pipeline/r9-reader.test.mjs:182-187 | reading-pipeline | pptx.mjs `text()` slides + text_box parts | `slides[{bodyText}]` and `parts[{kind:"text_box", shapes:[1]}]` | yes (office-readers/parts-kinds.test.mjs:129-149) | A |
| 4 | bio-plane/test/m/extraction/fixture.mjs:254-290 `docx()`, `pptx()`, `zipOf()` (used by extraction tests; plane/fix4b-r77-owners.test.mjs imports the same fixture) | extraction | n/a (builds input bytes) | a hand-zipped OOXML package fed to the real readers | n/a: input bytes. test-support already has docgen.mjs/make-zip.mjs for this | B |

### pdf-reader (index 17)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/extraction/r8-owe.test.mjs:13; r103.test.mjs:243-244,286; plane/fix4b-r77-owners.test.mjs:53 (via extraction/fixture.mjs:181-187 `withEntry`) | extraction | pdf-reader `structure()` answer registered in format-registry | `{ok:true, text: i2([...]), pages, notes:[]}` and a `detect` that never parses | unknown (pdf-reader's real structure answer not compared) | A |

### format-registry (index 18)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/acquisition/r17-name-type.test.mjs:8-14 | acquisition | docprofile/format-registry `profileOf` inputs (`view`, `ev`) | `view = {view: undefined, ids: null}` and a hand-made `ev.get` evidence object; the name IS now given | yes for the name; `view` shape differs from `profileView(w.core)` which r9-format-range.test.mjs:88 uses | B |
| 2 | bio-plane/test/m/acquisition/r9-format-range.test.mjs:75-89,137 | acquisition | evidence store parts as an upload leaves them (`parts:[{sha256,bytes}]`, `held()`); `failing` ev (fault) | parts list typed by hand; fault store `get` throws | parts shape = provenance.partsOf (yes); fault injection | C (fault) / A (parts list) |

### ocr-worker (index 32)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/extraction/fixture.mjs:169-178 `member()`, :218-222 `ocrAnswer()`; used r8-owe.test.mjs:17, s25-pieces-chain.test.mjs:151, r103.test.mjs:269,347; plane/fix4b-r77-owners.test.mjs:58,80 | extraction | OCR_WORKER `POST /transcribe` | `{ok:true, engine, version, cap, measured_by, confidence_floor, pages:[{page, regions:[{text, source:{kind:"pdf-page",ref,page,rect}, confidence:"none"}]}], deferred}`; a 503 `{ok:false}` for down | unknown (ocr-worker/src not compared; ocr-worker/test/memberworker.mjs exists beside its tests) | A |
| 2 | bio-plane/test/m/control-plane/r9-seam-reading.mjs:138-156 `ocrMember()` | control-plane | OCR_WORKER `POST /transcribe` | same answer typed again, plus invented refusals `{ok:false, reason:"R9_DOWN"\|"R9_CALL_INSIDE_A_REQUEST"\|"R9_KILL"}` | ok-answer: as above; the three R9_* reasons are the test's own fault injection | A (answer) / C (R9_* faults) |

### membership (index 37)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/acquisition/fixture.mjs:129-131 | acquisition | membership `isAdministrator` (R64) | `{admins, isAdministrator}` | unknown | B (real membershipOf is already used by extraction/fixture.mjs:127) |
| 2 | bio-plane/test/m/capture/r9-t51.test.mjs:216-218 | capture | membership `isAdministrator`; `members` rows | `{isAdministrator: () => false}` and a raw `INSERT INTO members` for m1,m2 | unknown | B |

### ai-accounts (index 39)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/extraction/r103.test.mjs:296-297,313-314,327-328 (`registerTranscriber("plane", ...)`) | extraction | ai-accounts `accountFor` | `accounts:{accountFor: async () => ({ok:true, kind:"apikey", level:"member", key:"k"})}`, `useCheck: async () => null` | unknown | A |

### credentials (index 40)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/control-plane/harness.mjs:74-77,98-99 `cred()` | control-plane | plane route `aicredentiallook` (credentials) | `{found:true, credential:{tokenId, principal, writes, revoked, confinedTo, taskScope}}` | unknown (credentials row shape not compared) | A |
| 2 | bio-plane/test/m/acquisition/acquire.test.mjs:845 `cred()` | acquisition | capture-request row's `credential` | `{credential, kind, secret, supplied_by, scope, project}` | unknown | A |

### promotion (index 41)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/extraction/fixture.mjs:112-117 `promotion()` | extraction | promotion `registerStep` (R39) | a registry that records steps and refuses a second declaration | unknown (promotion's real registerStep not compared) | B |
| 2 | bio-plane/test/m/plane/fix4b-r77-owners.test.mjs:25-42 `promoteDoc()` | plane | promotion `promote({bundleId, files, register, ...})` (real) over a hand-written bundle.md/provenance.json | bundle text, provenance and dataset typed by hand (comment: the capture screen's composition is screens-intake's) | real `promote` is called; the INPUT is the screen's composition, hand-copied | A (screens-intake publishes `promotionBodyFor(doc)`) |

### host-governor (index 42)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/acquisition/fixture.mjs:67-80 `governor()` | acquisition | governorAdmit / governorReport / governorConfig / isHeld | admits always `{admitted:true, wait_ms:0, appetite_per_min:12}`; refusal `{admitted:false, reason:"cooling_off", retry_in_ms:5000}` | unknown (real answer shape not compared) | A |

### provenance (index 43)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/acquisition/fixture.mjs:86-126 `provenance()` | acquisition | recordReceipt, registerHolds, capturesOf, homeOf, captureGrade (incl. the `unpacked` chain) | in-memory receipts; `homeOf` returns fixed `{path:"data/x", bytes:0, registered:"T"}`; `captureGrade` re-derives letters (direct/archive/unpacked/doorbell/unrecorded) | unknown; the letters are re-implemented here instead of read from provenance's `captureGrade` | A |
| 2 | bio-plane/test/m/acquisition/r9-read-range.test.mjs:12-29 (`w.prov.partsOf = ...`) | acquisition | provenance `partsOf` (provenance/index.mjs:1043) | `[{sha256,bytes}]` or null | yes (provenance/index.mjs:1038-1049 returns exactly `[{sha256,bytes}]` or null) | B |
| 3 | bio-plane/test/m/acquisition/r123-batch-d.test.mjs:13-16 `hold()`; unpack.test.mjs:140,217-218,232,239,277,288,338-339 | acquisition | provenance `recordReceipt` | receipts written by hand with `via: "direct"\|"doorbell"\|"archive.org"` to stand for a held archive | `recordReceipt` is real-shaped; the seam is that the fixture provenance, not provenance, answers captureGrade | A |
| 4 | bio-plane/test/m/acquisition/unpack.test.mjs:1-365 (read in full) | acquisition | unpack over archives built by test-support `make-zip.mjs` | ZIPs of letter-graded (`direct`) receipts with magic-less text members; `doorbell`/no-letter archive only in r123-batch-d.test.mjs:19-32 | n/a (input bytes from the harness) | C (input), but the missing no-letter/doorbell cases are what K4990 names |
| 5 | bio-plane/test/m/capture/r9-t51.test.mjs:10,214 (imports `provenance` from acquisition/fixture.mjs), :102,119,240 (`registerHolds` overridden) | capture | provenance `registerHolds` | `({sha}) => ({ok:true, sha, asked:true, registered, acquired})` set per test on the fixture provenance | unknown | A |
| 6 | bio-plane/test/m/doorbell/r9-t51.test.mjs:14-17 | doorbell | provenance `homeOf` | `f.c.provenance.homeOf` replaced by a SQL join on `register` returning `{bundleId}` only | no: real homeOf answers `{bundleId, path, encoding, bytes, registered, authored}` (cf. acquisition/fixture.mjs:107) | A |
| 7 | bio-plane/test/m/extraction/r8-owe.test.mjs:14,22,26 | extraction | provenance `homeOf`, `onTestimony` | `register(rows)` = `{homeOf: (s)=>rows.get(s)??null, onTestimony: ()=>({ok:true})}`; row `{bundleId, path, encoding, bytes, registered, authored}` | row shape yes; `onTestimony` unknown | A |
| 8 | bio-plane/test/m/extraction/s25-pieces-chain.test.mjs:175 | extraction | provenance `homeOf`, `partsOf` | `{homeOf: (s) => ({bundleId:"B-1", bytes}), partsOf: () => null}` | no: homeOf lacks path/encoding/registered/authored | A |
| 9 | bio-plane/test/m/file-safety/r1-registrar.test.mjs:158-162; fixture.mjs (274 lines, NOT read) | file-safety | provenance `recordReceipt` listeners | listener `answer` read off `r.listeners` | unknown | A (unread fixture) |

### capture-sources (index 46)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/acquisition/acquire.test.mjs:107-109 `renderAnswer` + fixture.mjs:355-358 `rendererEnv`; r7-render-failed.test.mjs:73; r8-fetch-refused.test.mjs:238; r9-pending-render.test.mjs:287; fix5-render-owed.test.mjs:15; r8-render-bar.test.mjs:143; r9-render-charge.test.mjs:241,252,266,276 (all read in full) | acquisition | render.mjs RENDER_ANSWER / browserrender.mjs failure answer (render.mjs:248-285; browserrender.mjs:389) | `{ok:true, html, elapsed_ms, engine, engine_version, viewport, dpr, locale, timezone, navigated_to, status, requests, scripts, wait}`; failures `{ok:false, error, elapsed_ms, failure_class}` | ok-answer yes (contract fields); `wait.asked` is an object in 7 files and the number `1000` in plane/fix4b-r77-owners.test.mjs:98 (drift); failure with `{ok:false, reason:"RENDER_FAILED"}` (r9-multipart-memory.test.mjs:371) NO: real is error/failure_class/detail | A (capture-sources publishes `renderAnswer()` made by running the real driver over its `fakeBinding`, which seam-render.test.mjs and r9-pictures-unread.test.mjs already do) |
| 2 | bio-plane/test/m/plane/fix4b-r77-owners.test.mjs:96-98 | plane | RENDERER answer | typed again with `wait:{asked:1000, fired}` | no (wait.asked drift, see above) | A |

### acquisition (index 47)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/plane/r9-jobs.test.mjs:147-159, 564-581, 671-675 | plane | acquisition `owedFetch` (acquisition/index.mjs:2447,2473 `withFacts`) | `acquisitionOf(ctx).owedFetch = async () => ({ok:true, done:true, final:true, reason:"CAPTURE_HELD_BY_ANOTHER_BUNDLE", detail:{bundleId, capture_sha, kind:"part", holder}})`; also facts at top level and `refusal:{detail:{...}}` | NO: acquisition only copies what `deliver` gave, and control-plane's deliver gives only `holder` (control-plane/index.mjs:822); `kind`, `capture_sha`, `bundleId`, `refusal.detail` are never built by the real chain | A |
| 2 | bio-plane/test/m/plane/fix4b-r77.test.mjs:296-335 (`owedRun` spy answers `{ok:true,done:false,outstanding}`, `{ok:true,final:true,reason:"CAPTURE_SESSION_GONE"}`; `x.env.SELF.fetch` unpack answers) | plane | acquisition `owedRun`; control-plane daemon unpack door | `CAPTURE_SESSION_GONE` appears nowhere in src; unpack answers `{ok:true, result:{ok:true, complete:false, waiting_on:{code}}}` | reason: NO (grep of src finds no such code); unpack `waiting_on` yes (acquisition/unpack.mjs:731, control-plane/index.mjs:2453) | A |
| 3 | bio-plane/test/m/plane/fix4b-r77.test.mjs:296-335 first half; plane/fix4b-r77-owners.test.mjs:91-118 | plane | acquisition real `owedRun` (used) | real owner used (good model) | n/a | C |
| 4 | bio-plane/test/m/control-plane/r117-held.test.mjs:21-23,29,54-56,62-64,73,88,103,126,162,174 | control-plane | capture/acquisition `acquire` answer and `doc()` | `{ok:true, existed:true\|false\|null, document: doc(), note}`; `doc()` = `{file, locator, retrieved, profile:{}, capture:{sha256, bytes, method:"uploaded"}}` | answer keys yes (acquire.test.mjs:355: existed null + existed_undetermined); `doc()` lacks profile.format, content_type, provenance_chain, authority_*: never given by acquire | A* |
| 5 | bio-plane/test/m/control-plane/r123-reading.test.mjs:20-22,58,115-118 | control-plane | acquisition `acquire` / capture `captureupload` answer; `partsOf(n)` | `provDoc()` = `{file, locator, profile, capture:{sha256, bytes}}`; `acquired = {ok, existed:false, document, reading_pending:true}`; `partsOf(n)` = n parts of 8 MB | partial shapes (as above) | A* |
| 6 | bio-plane/test/m/extraction/fixture.mjs:157-166 `doc()`; used r8-owe.test.mjs:27, s25-pieces-chain.test.mjs:180, plane/fix4-r75 etc. | extraction | acquisition `acquire` document | `{file:"snapshots/x", locator, retrieved, profile:{profiled_from_text, format:{format,confidence:"certain",signals:[]}, jurisdiction_view:null}, provenance_chain, capture:{sha256, bytes, content_type, transport:{http_headers}}}` | partly (a real document carries many more keys: authority_state, origin, attestation_attempts, ...) | A (acquisition publishes `acquiredDocument(bytes, opts)` made by `acquire` over the scripted network) |

### capture (index 48)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/acquisition/fixture.mjs:138-248 `captureStore()` (whole file read) | acquisition | capture Provides: recordSourceOutcome, sourceReachability, saveCaptureSession/loadCaptureSession/liveCaptureSessions/dropCaptureSession, renderAdmit/renderSpend, recordValidators, recordCaptureActor, recordLateAttestations, taskEnqueue, captureLimit, recordSiteAssets, recordLinks, emit | a whole in-memory capture store (its own comment: acquisition is EARLIER than capture, so the real one cannot be imported) | unknown | A* (provider is later than user: order forbids the rule as written; BOB ruling needed) |
| 2 | bio-plane/test/m/acquisition/r8-open-captures.test.mjs:166-173,205-215; r9-failed-ends.test.mjs:18; r7-fetchdone.test.mjs:19; r8-fetch-refused.test.mjs:168; r9-pending-render.test.mjs:296; fix5-render-owed.test.mjs:26 etc. | acquisition | capture hooks `owedLater`, `saveCaptureSession` states | `w.store.owedLater = async () => ({ok:true})` (or a Map recorder); hand-written session states `{queue:[...], opened_by, fetch_pending, fetch_done, render_done}` | `{ok:true}` yes per acquisition's own contract (acquisition/index.mjs:392-399); states are acquisition's own | C (the hook is acquisition's own contract; its implementer, the plane, is later) with the registrar caveat above |
| 3 | bio-plane/test/m/plane/fix4-r75.test.mjs:44; fix4b-r77.test.mjs (captureOf(...).keepLater/owedLater used for real) | plane | capture `keepLater`/`owedLater` | real instance used | n/a | C |

### calibration (index 52)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/extraction/fixture.mjs:90-109 `calibration()` | extraction | calibration `liveCalibration`, `worseSupersessions`, `onCalibration` | arrays of canned rows; `fire(e)` runs listeners | unknown (fixture offers `cal:"module"` for the real one at :130-133) | B |

### reading-pipeline (index 53)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/extraction/s25-pieces-chain.test.mjs:163-173,225-226 | extraction | reading-pipeline `read()` answer for a later PDF range | the real reader wrapped so a later piece carries `reading.piece_chain` (stand-in for the unmerged half, K4911); a red-by-name twin runs the real reader | stand-in by design (temporary) | A (delete when reading-pipeline's half merges; the twin at :226 is the real test) |
| 2 | bio-plane/test/m/extraction/fixture.mjs:189-193 `pageUnits()`; r103.test.mjs:257 | extraction | reading-pipeline `text_units` | `{extent:{kind:"pdf-page", page}, text, seq: page}` | partly (real units also carry kind, reference, truncated, chain_kind) | A |
| 3 | bio-plane/test/m/screens-inquiry/r9-document.test.mjs:21-27,87,93-94,105-106 (file read in full) | screens-inquiry | reading-pipeline `failed(...)` / extraction `readingFor` answer | `unsupported(kind)` reading `{failure:"final", reason:"UNSUPPORTED_FORMAT", kind, entities:[]}`; units `extent:{kind:"paragraph", para}` with `kind` set by the test | unsupported reading: yes per file's comment; extent `paragraph`: NO (reading-pipeline/index.mjs:1299 builds `{kind:"doc-para", para, run}`, kind:"body") | A |
| 4 | bio-plane/test/m/screens-inquiry/fr28-document.test.mjs:210; fr6-document.test.mjs:65; t51-document.test.mjs:407 (single lines seen by grep; files NOT read) | screens-inquiry | reading-pipeline text_units extents | `{kind:"paragraph"}`, `{kind:"line"}`, `{kind:"heading"}` | NO (no such extent kind in content/extent.mjs:51 CONTENT_EXTENT_KINDS or textchain.mjs:1547) | A (unread) |

### extraction (index 54)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/plane/r9-jobs.test.mjs:30-36 (`readAnswer`) with answers :90-93,113,128,141,250,261,295-296,309,317-319,337,351-360,404,454,480,543,625-635,681,697,705 | plane | extraction `readHeld` (extraction/index.mjs:861; answers :881-885, :1076-1083) | scripted doubles: `{ok:true, more:true, detail:{cursor}, counters:{written,skipped,owed}, reader_version}`, `{ok:true, done:true, counters}`, `{ok:false, final:true, why}`, `{ok:true, more:true, count:0}`, `{ok:false, transient:true, reason}`, `{killed:[40]}`, `{ok:true, read:true, counters}` | NO for most: real `counters` only on `why:"READING_HELD"` (:881-885); a piece answers `detail:{read_through,total}` not `{cursor}`; `done`, `count`, `transient`, `reader_version` are not readHeld keys. YES: NO_HOME, READING_HELD+counters, UNREADABLE?, NO_PAGES_LEFT (left(...)) | A (extraction publishes `readHeldAnswers`: piece(), whole(), held(counters), noHome(), final(why), killedPage(), made by driving the real `readHeld` over a seeded corpus) |
| 2 | bio-plane/test/m/plane/fix3-r74.test.mjs:17,46; fix4-r75.test.mjs:31,34,102,109,122; fix4b-r77.test.mjs:26,198,245,247,261,276,291,301; fix5-r77.test.mjs:147,155,191,220,231,245-247,291; r7-keephome.test.mjs:19,37,150-152,170 | plane | extraction `readHeld` (extraction/index.mjs:861; answers :881-885, :1076-1083) | `{ok:true, read:true}` (no bundle_id/found), `{ok:true, read:false}` (no why), `{ok:true, read:true, why:"READING_HELD", owed}`, `{final:true, why:"READING_FINAL_NO_TEXT"}`, `{ok:false, reason:"STORE_DOWN"}`, `{ok:true,read:false,failure:"final",...}` | NO: real read:true always has bundle_id, found:true (:1076-1083); read:false always has `why` (left()); READING_HELD is read:false; `READING_FINAL_NO_TEXT` is in no src file; STORE_DOWN unknown. YES: NO_HOME, NO_WHOLE_OBJECT | B (re-point to the same fixture once it exists) |
| 3 | bio-plane/test/m/plane/r7-contention-entry.mjs:65-72; l75-entry.mjs:39-57; l79-entry.mjs:18; r7-lastms.test.mjs:52; shape/harness.mjs:329; r8-headofline-entry.mjs:24 (grep lines only; files NOT read) | plane | extraction `readHeld` (extraction/index.mjs:861; answers :881-885, :1076-1083) | readHeld replaced by counters/hangs/throws | contention/fault probes; `{ok:true,more:true,read:true,detail:{piece:n}}` at r7-contention-entry.mjs:66 | more answer lacks bundle_id/found; detail keys differ |
| 4 | bio-plane/test/m/plane/fix4b-r77.test.mjs:13; r8-headofline-entry.mjs:24-25 (wraps the REAL readHeld to count) ; fix4b-r77-owners.test.mjs:55-89 (real readHeld, ocr member hand-made) | plane | extraction `readHeld` (extraction/index.mjs:861; answers :881-885, :1076-1083) | real owner used with a counting wrapper | n/a | C |
| 5 | bio-plane/test/m/control-plane/r117-held.test.mjs:33,55,65,74,81,89-92,104-106,129,140,145-147,164,175,179 | control-plane | store-internal `readheldfor` (extraction `readHeld`) | `{ok:true, read:true, bundle_id, found:true}` (real); `{ok:true, read:true}` (partial); `{ok:true, read:false, why:"READING_HELD"}` (no counters); NO_HOME/NO_WHOLE_OBJECT (real); `{ok:false, reason:"NO"}` | mixed as above | A* |
| 6 | bio-plane/test/m/control-plane/r117-held.test.mjs:23,127; r123-reading.test.mjs:118,130 (`extractread` answers) | control-plane | store-internal `extractread` | `{reading:{found:true, entities:0}, text_units:[{extent:{kind:"document"}, text}]}`, `{reading:{found:true}, text_units:[{text:"x"}]}` | NO: real reading has `entities: []` array (screens fixture r9-document.test.mjs:26) and every unit has an `extent`/`seq` | A* |
| 7 | bio-plane/test/m/control-plane/r135-job-state.test.mjs:288-290,294,310,325 | control-plane | extraction `readingFor` answer | `readingAnswer(found)` = `{ok, found, capture_sha, reading:{found:true, completeness:"partial"}}` | NO: real `completeness` is a top-level object `{state, counts, counters,...}` (extraction/index.mjs:1962-1979) | A* |

### scheduler (index 140)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/plane/r9-jobs.test.mjs:423-433 | plane | scheduler `health()` | `health = async () => ({last_run:1, alarm_at:2, stale:false, ...})` | yes keys (WATCHDOG_FIELDS), values are placeholders; the real `schedulerOf(...).health()` is used in the very next test (:443) | B |

### control-plane / plane (the registrar: plane/pending.mjs registerJob, wired by control-plane jobs.mjs)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/acquisition/r9-registrar.test.mjs:15-16,72 (+ test-support/job-registrar-stub.mjs) | acquisition | registerJob / armJobs | `jobRegistrarStub()` (in test-support): rows() list, `armed()` flag; inline refusal `{ok:false, reason:"JOB_TABLE_FULL"}` | stub vs real: stub stores whatever kind/sha checks it re-implements (stub:23-33); real checks more (plane/pending.mjs:242-265, e.g. keep needs parts, carrier <= 400 chars). `JOB_TABLE_FULL` NOT in src (real refusals: JOB_ENTRY_INVALID/KIND_UNKNOWN/SESSION_MISSING/SHA_INVALID/NOT_KEPT) | A* (registrar lives in plane, LATER than every user: needs a ruling on where the published registrar fixture can live) |

### control-plane / plane (registrar)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/capture/r9-t51.test.mjs:12,52-65,131-140,158-159,167,254 (+ g127f-t51.test.mjs, not read) | capture | registerJob / armJobs | stub made part of `core.transact`; refusals `JOB_TABLE_FULL`, `NO_ROOM`, thrown, `{ok:true,existed:false,state:"queued"}` | NO for JOB_TABLE_FULL / NO_ROOM (not in src) | A* |
| 2 | bio-plane/test/m/doorbell/r9-t51.test.mjs:7,22-33,84 | doorbell | registerJob / armJobs | same stub and transact wrapper; refusals `JOB_TABLE_FULL`, thrown, `undefined` | NO for JOB_TABLE_FULL | A* |
| 3 | bio-plane/test/m/file-safety/r1-registrar.test.mjs:165-166,191 | file-safety | registerJob | stub; own double answering `JOB_KIND_UNKNOWN` for grade and throwing for safe_view | JOB_KIND_UNKNOWN yes (plane/pending.mjs:244); throw = fault | A* / C (fault) |
| 4 | bio-plane/test/m/extraction/r8-owe.test.mjs:11,37-38,49-50,73-80,108-109; r103.test.mjs:237,260-261; s25-pieces-chain.test.mjs:146,188; extraction/fixture.mjs:6,198-204 | extraction | registerJob / armJobs | stub, plus refusals `JOB_TABLE_FULL`, thrown `stub broken`, `PENDING_NOT_KEPT` (the last real, pending.mjs:675) | JOB_TABLE_FULL NO | A* |
| 5 | bio-plane/test/m/control-plane/r72-parted.test.mjs and r9-seam-limits.mjs (use the stub; NOT read) | control-plane | registerJob | not judged | unknown | A* (unread) |

### control-plane (index 169)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/acquisition/r7-fetchdone.test.mjs:30-34; r8-fetch-refused.test.mjs:173-177,207,211-215,260-284; r9-failed-ends.test.mjs:21-23; r9-pending-render.test.mjs:317; fix5-render-owed.test.mjs:54-55; r8-render-bar.test.mjs:223 (all read in full) | acquisition | control-plane `deliverOwedRender` (control-plane/index.mjs:764-822) | `deliver` hand-written: `{ok:true}`, `{ok:false}`, `null`, `{ok:false, code}` (no reason), `{ok:false, reason:"DELIVERY_FAILED"\|"NO_SUCH_SESSION"\|HELD}` | NO for `{ok:false}`, `null`, `{ok:false, code}` (real always sets `reason`, :819-822) and for the HELD refusal without `holder`; real ok answer is `{ok:true, bundleId, ...}`; `DELIVERY_FAILED` unknown | A* (control-plane is LATER than acquisition) |
| 2 | bio-plane/test/m/acquisition/r123-batch-d.test.mjs:70-93 | acquisition | control-plane `deliverOwedRender` refusal | `HELD = {ok:false, reason:"CAPTURE_HELD_BY_ANOTHER_BUNDLE", detail:{kind:"whole", capture_sha, holder:null}}` and the same facts at top level | NO (real: `{ok:false, reason, holder}` only, :822) | A* |
| 3 | bio-plane/test/m/plane/fix4b-r77.test.mjs:364-373 (RED BY NAME test for deliverOwedRender) ; fix4b-r77-owners.test.mjs real delivery | plane | deliverOwedRender | real function used in the owners test | n/a | C |

### plane (index 170)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/control-plane/harness.mjs:41-92 `makeEnv`, :153-172 `world` (every control-plane test uses it) | control-plane | plane Store routes: `session`, `aicredentiallook`, `groupidentitypublic`, `claim`, `reauthdue`, `securitycount`, `doorwindow`, default `{ok:true, echo:route}` | a fake Durable Object namespace; session rows `{role, capabilities, administer, rootOfTrust, handle}`; default echo answer for any route | unknown; `echo` default never real | A* (plane is LATER; real-plane seams exist under Miniflare: r117-held part two, t51-held-failed, r9-seam-*, which are the model) |
| 2 | bio-plane/test/m/control-plane/r130-jobs.test.mjs:17-47,24-46 (read in full) | control-plane | plane `pendingadd` answers | KEPT `{ok:true,result:{ok:true,existed:false,state:"queued"}}`, NOT_KEPT `{ok:false,reason:"PENDING_NOT_KEPT",detail}`, REFUSED 404 `UNKNOWN_ROUTE`, SILENT 500 | yes for KEPT and NOT_KEPT (plane/pending.mjs:265,675); the rest = transport faults | A* for the first two / C for faults |
| 3 | bio-plane/test/m/control-plane/r123-reading.test.mjs:32-33,117; r117-held.test.mjs (pendingadd -> `ok({ok:true})`) | control-plane | plane `pendingadd` answer | `ok({ok:true})` | partial (real adds existed/state) | A* |
| 4 | bio-plane/test/m/control-plane/r135-job-state.test.mjs:199,239-245,288-355 (read in full) | control-plane | plane `jobrow` / `owedwork` rows (plane/pending.mjs:626 `view`) | `row()` = `{sha, kind, state:"owed", job_state, attempts, written, ..., failed_why, priority}`; cursors `{page,pages}`, `{pages_done,total}`, `{next,size}`, `{offset}` | row keys yes (pending.mjs:626); cursor shapes: unknown, plane tests register `{next_page}` and `"c1"` (plane/r9-jobs.test.mjs:47,90) | A* |

### record-core (index (helper))

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/plane/r7-keephome.test.mjs:150,169 | plane | record-core `evidenceStore().putFromParts` | `() => ({putFromParts: async () => ({ok:true})})` | partial (real `{ok:true,size}` or `{ok:true,already:true}`, record-core/index.mjs:1978-2006) | B |
| 2 | bio-plane/test/m/plane/r9-jobs.test.mjs:526-527; fix4-r75 / fix4b via `multipartBucket` (record-core/storage.mjs) and `bucketStandIn` (case-carriage/fixture.mjs) | plane | R2 binding | stand-in bucket | platform binding, not a module's answer | C |

## Summary

### Published fixtures each provider would need

- **office-readers**: `docxText({parts})`, `pptxText(...)`, `docxBytes(body)` / `pptxBytes(slides)` (made by docgen + the real reader), so reading-pipeline stops typing `parts`/`paras`
- **pdf-reader**: `pdfStructureAnswer(text)` made by the real structure reader over a generated PDF
- **format-registry**: `profileView(core)` re-export and `profileInputs({bytes, name, type})` returning the exact `profileOf` arguments
- **ocr-worker**: `ocrAnswer(pages, opts)`, `ocrDown(status)`, `ocrDeclines(pages)` made by running the real worker handler over a fake engine
- **credentials**: `aiCredentialLook(row)` / `credentialForCapture(kind)`
- **ai-accounts**: `accountFor(...)` answer
- **membership**: `membershipWithAdmins(ids)`
- **promotion**: `stepRegistry()` (real registerStep)
- **host-governor**: `governorWorld({refuse, held})` over the real governor
- **provenance**: `provenanceWorld({homes, registered, receipts})` over the real provenance with seeded rows; `homeOf`/`partsOf`/`captureGrade` answers from it; archive cases `archiveHeld({via: direct|archive.org|doorbell|none})`
- **capture-sources**: `renderAnswer(url, {requests, status})`, `renderFailure({class, error})` made by the real driver over `fakeBinding`
- **acquisition**: `acquiredDocument(bytes, opts)`, `acquireAnswer({existed, parts, render})`, `owedFetchAnswer({final, reason, facts})` made by `acquire`/`owedFetch`; the hook contract for `owedLater`/`keepLater`/`deliver` (its own interface)
- **registrar (plane/pending.mjs, control-plane jobs.mjs)**: `registrarWorld()` = the real registerJob over a sqlite table + `armJobs`; `registerRefusals()` listing the real reasons (replaces test-support's stub); plane's contract test runs the same cases
- **capture**: `captureStoreContract()` the list of services acquisition needs, run against capture's real instance by capture's own tests
- **calibration**: `calibrationWorld({live, worse})` over `calibrationOf`
- **reading-pipeline**: `unitsFor(bytes, format)` real text_units; `unsupportedReading(kind)`; `pieceChain` once merged
- **extraction**: `readHeldAnswers`: piece(), whole(), held(counters), noHome(), noWholeObject(), final(why), killedPage(p); `readingAnswer({found, completeness})`; `extractReadAnswer(doc)`
- **scheduler**: none (re-point to `schedulerOf(...).health()`)
- **control-plane**: `deliverOwedRenderAnswers()`: ok, held-with-holder, no-session, no-opener, promote refusals, made by the real function
- **plane**: `storeStubFor(routes)` built by running plane's real route handlers (pendingadd, jobrow, owedwork, session, aicredentiallook) for control-plane's harness (A*: order)
- **record-core**: `evidenceStore` partial answers are fixed by calling the real `putFromParts`

### Rows by user module (A / B / C; A* counted in A)

| user module | A | B | C | total |
|---|---|---|---|---|
| acquisition | 9 | 3 | 3 | 15 |
| plane | 5 | 3 | 6 | 14 |
| extraction | 9 | 3 | 0 | 12 |
| control-plane | 12 | 0 | 0 | 12 |
| reading-pipeline | 3 | 0 | 0 | 3 |
| capture | 2 | 1 | 0 | 3 |
| doorbell | 2 | 0 | 0 | 2 |
| file-safety | 2 | 0 | 0 | 2 |
| screens-inquiry | 2 | 0 | 0 | 2 |
| test-support | 0 | 0 | 1 | 1 |
| **all** | 46 | 10 | 10 | 66 |

Rows are *seams* (one hand-built provider answer, used by one or more files), not files; a row naming several files counts once. The real total is higher: the unread files above repeat these seams.

### Census of the unread (grep only; NOT findings)

Files per module that mention stub/fake/double/stand-in/scripted, the seam names above, or a scripted `plane(...)` answer. Likeliest places for more rows, largest first: screens-inquiry (50 of 56 files mention stand-ins; 52 script `plane` answers), control-plane (46 / 11 / 23 of 118), public-read (45 of 59), plane (40 / 26 of 112), capture (32 / 4 of 53), acquisition (27 / 18 of 52), ratification (24; 19 script plane), extraction (24 / 27 of 58), queue (21 of 34), screens-investigate (20; 21 script plane), reading-pipeline (18 of 69), interface-shell (16; 27 script plane), file-safety (16 / 2), screens-intake (13; 35 script plane), screens-publish (10; 26 script plane), screens-settings (11), publication (11), instance-setup (11). The screens-* modules (159-168) test against a scripted plane whose op answers are typed by hand (screens-inquiry/r9-document.test.mjs is the one I read: its header says "copied from the shapes the real ops answer", and the extents it types do not exist); expect many rows there, provider = extraction, reading-pipeline, content, retrieval, control-plane ops.
