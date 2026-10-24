# K4990 audit, part 3: control-plane's tests (user module `control-plane`, index 169)

Branch tranche/T51, read only. Paths are from the repository root; all test files are under `bio-plane/test/m/control-plane/` (abbreviated `cp/` below). Line numbers are of the checkout (it equals `origin/tranche/T51` for this directory). Provider indexes are positions in `build/modules.json`. Method, row format and classes A / B / C / A* are part 1's (`build/plan/audit-fixtures-K4990.md`). Every row's user module is `control-plane`; rows are seams (one hand-built provider answer, used by one or more files).

## Header: what was read, what was not

**Part 1 had read in full (not repeated here):** cp/harness.mjs, r130-jobs, r135-job-state, r117-held, t51-held-failed.

**Read in full by me (every line; very long lines were cut at 200-260 columns, so the tail of a few over-wide lines was not seen):** r124-owed-render, r72-parted, r123-reading, r8-seam-capture.mjs, r8-seam-misc.mjs, r8-kit.mjs, t51-g43-embed, t51-g83-location, t51-visitor-copy, statementack, t51-defer-reading, archive, digest-channel, r133-r134-follow, t51-reading-follows, t51-large-pdfs, t46-door, t51-acquire-timings, t51-round5-door, t51-round6-door, inbox-door, declared-ops, r118-shared, record.mjs, door-routes.mjs, app-screens.mjs, register-declared.mjs, wrap-entry.mjs.

**Read in part (the row says the lines):** r9-seam-reading.mjs (1-520 of 708, then grep of the rest), r9-seam-limits.mjs (1-150, 150-305, 355-372 of 626, grep of the rest), r9-seam-documents.mjs (1-130, 498-525, 600-625 of 702, grep of the rest), t51-round5-seam (1-120 of 235), t51-round7-seam (12-138 of 800), t37-door (1-80 of 225), t47-door (1-75 of 309), t50-door (1-30, 80-130, 150-260 of 370), doorbell.test (1-60, 215-330, 395-500 of 553), owner-ops.test (9-60 of 196, grep of the rest), envelope.test (1-40, 76-112, 388-400, 430-450, 538-571 of 571, grep of the rest), r131-gate (5-60 and 115-126 of 252), r100-upload (6-60 of 140), r53-routes (140-160 of 265), t42-door (1-12, 95-152 of 152), r8-bootstrap-fanout (6-40), t51-reviewcomment (5-45), t49-door (56-75, 222-252 of 356), draft.test (6-40 of 141), converts.test (grep lines only).

**Header (first 4-9 lines) and grep of answer-building lines only, so no claim beyond what those lines show:** affordances-pack, declarations, declared-disagree, declared-registration, doors, gates, lease, limits, members-pin, new-ops, option-preview, page-policy, provenance-split, purge, r101-favicon, r128-op-shape, r128-timing-desc-bytes, r129-isolate-age, r45-routes, r48-routes, r49-routes, r49-case-inputs-public, r50-routes, r52-routes, routes, refusal-tally, stamps, stamps-action, stats, stats-capacity, storage-words, surfaced-by, t34-routes, t35-door, t36-door, t38-door, t41-door, t46-app, t46-e2e, t47-e2e, t48-door, t51-bootstrap, t51-contradictionflag, t51-hops, t51-interfacewords, t51-page-log, t51-round5-press-seam, t51-round6-seam, t51-routes, t51-server-timing, t51-taskdecide, template-grant, totality, r8-door-phases, r8-hops, r8-phase-clock, r8-caseratify-calls, r8-wrap-entry, r8-words-cache, r8-words-door, r9-words-no-language, t51-round8-seam and t51-round9-seam (15-line entry files calling the sections files read above).

**NOT read, no claim:** the bodies of the files in the previous paragraph. Of these the likeliest to hold more rows (they script `plane` answers): t34-routes (websiteinvite/joinlinkinvite/groupdescription answers), t36-door (byte ops served by `served()`), t41-door (accountusesset, projectkeyset, handlecheck, handlechange answers), t48-door, t49-door outside the lines above, t50-door outside the lines above, stamps, gates, new-ops, template-grant, surfaced-by, r8-words-cache/r8-words-door, t51-server-timing, r8-door-phases (acquire answers with timings), t51-round5-press-seam, t51-round6-seam, t51-round7-seam beyond line 138. The `.cache/` directory and `wrap-entry.worker.txt` are not tests.

**Codes checked by a mechanical pass.** I extracted every `reason:` / `code:` / `why:` literal of the directory (88 distinct) and grepped `bio-plane/src`, `agent-worker/src`, `ocr-worker/src` for each. 14 are absent from every source file (list under "Invented codes"). Codes present in src are marked "exists" in rows, which says only that the code exists somewhere, not that the provider's code path can produce it at that seam.

## Structural findings for BOB (not row-level)

1. **Part 1's A\* marking of control-plane rows needs correcting.** A\* means the provider is later than the user in modules.json. control-plane is 169. Only plane (170) and the installer modules are later. Part 1 marked control-plane's seams on acquisition (47), extraction (54), capture (48) as A\*; those providers are EARLIER, so the rule applies as written (class A, the provider publishes a fixture) and nothing blocks it. In this part only the plane rows are A\*.
2. **The control-plane suite has two good models the others can follow, and uses them in places.** (a) Real owners over a real record: `record.mjs` composes about 25 earlier modules (the "composed from earlier modules only" fixture), used by r124-owed-render, t51-g43-embed (second half), archive (third test), doorbell.test and inbox-door (pull part), t51-visitor-copy. (b) Providers' own published fixtures: `declared-ops.test.mjs:12-15` imports capture/fixture.mjs, case-account/fixture.mjs, action-clocks/fixture.mjs, translations/fixture.mjs; `t51-reviewcomment` imports review/fixture.mjs; `t49-door` builds the real `AiAccounts`; `envelope.test.mjs:436` the real `AiAccounts`; `r72-parted` and `r9-seam-limits:271` capture/fixture.mjs. (c) The real plane under Miniflare with the member's own acts: r8-seam-capture, r8-seam-misc, r9-seam-*, t51-reading-follows, t51-large-pdfs, t51-bootstrap, t46-e2e, t47-e2e.
3. **One seam kit is typed seven times.** `person`, `founder`, `screenCall`, `serve`/`slowBody`, `pdfOf`, `projectOf`, `ownerOf`, `questionOf` exist in r8-kit.mjs (the intended home) and again in t51-round7-seam (the original; r8-kit says "taken as they stand"), t51-round6-seam, t51-round5-seam, t51-round5-press-seam, t51-reading-follows, t51-large-pdfs. The copies have drifted (see OCR row). This is control-plane's own code, not a provider's, but it is where the provider-shaped hand-built values multiply. r8-kit.mjs is the one to keep.
4. **The OCR member's answer is typed in six places and three of them cannot be produced.** Real ocr-worker answers ONE page per invocation and lists the rest in `deferred` (ocr-worker/src/contract.mjs:171 `chooseChunk`; member.mjs:34, :308-329). Typed with up to 24 pages per call: r9-seam-limits.mjs:361-370, t51-round5-seam (header/binding ~line 52-60, comment "its real call: 24 pages"), t51-round5-press-seam (~54-58). Typed with one page: r9-seam-reading.mjs:138-156, r9-seam-documents.mjs:604-620 (this one omits `deferred`).
5. **The "unknown route" refusal the tests raise is not the one the store gives.** Tests answer `{ok:false, reason:"UNKNOWN_ROUTE"}` at 404 (r123-reading:84, r117-held:89,146 and r130-jobs:20 from part 1). The store's door answers `{ok:false, error:"unknown op: <op>"}` at 400 (store-door/dispatch.mjs:406). `UNKNOWN_ROUTE` is in no src file.
6. **Answer-key drift between files typing the same thing:** `promote` answers `bundleId` (r123-reading:32, r133-r134, archive, g43; real promotion/index.mjs:969) but `bundle_id` in four places of t51-round6-door (lines 146, ~160, ~253, ~281); `opencaptures` answers `{ok, sessions:[]}` in t50-door:89 but `{ok, captures:[], truncated}` really (acquisition/index.mjs:2615, :2647) and `captures` in r8-seam-capture; `required_strength` is `"B"` in four files and the number `2` in t51-round6-door's batch copy; `reading.entities` is `0` in five files, an array in the real reading (extraction/index.mjs:484, :1375).
7. **Order:** the only later provider is plane (170). Its seams in this module (registrar stub, RPC stubs on the object, `pendingadd`, store routes) cannot take a plane-published fixture as written; they need the same ruling part 1 asks for (contract fixture published by control-plane, run by plane's tests), or these tests move to the Miniflare seams that already exist.

## Invented codes (grep of src finds none)

`UNKNOWN_ROUTE` (r123-reading:84; part 1's r117/r130), `NO_SUCH_LANGUAGE` (r8-words-cache:157-158,166; t51-interfacewords:98; src has `LANGUAGE_NOT_SET`, `LANGUAGE_MALFORMED`), `PROMOTE_REFUSED_HERE` (doorbell.test:459; inbox-door:97), `ID_SPACE_EXHAUSTED` (r133-r134 allocid test), `NOT_RENDERED` (r9-seam-reading.mjs:210; real file-scanner code `RENDER_FAILED`, file-scanner/src/render.mjs:58), `R9_DOWN`, `R9_CALL_INSIDE_A_REQUEST`, `R9_KILL` (r9-seam-reading.mjs ocrMember, the test's own fault injection), `INJECTED_OWN_REFUSAL` (r9-seam-documents.mjs:63, fault injection), `WRONG_PASSWORD` (envelope:209), and four generic passthrough sentinels `OWNERS_OWN_REFUSAL` (door-routes.mjs:62), `SOME_STORE_REASON` (envelope:171,376), `NO_ROW_FOR_THIS_CODE` (envelope:74), `HOOK_REACHED` (door-share:16) which are C (they test that the door relays an arbitrary code).

## Tables by provider module (modules.json order)

### test-support (index 6)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | cp/r8-kit.mjs:90-107 `pdfOf`; t51-reading-follows:27-46; t51-round5-seam (`pdfOf`, `scanOf`, `textOf`, read 1-120); t51-round6-seam:31, t51-round7-seam:245 (grep); r9-seam-reading.mjs:118-135 `scanOf` (its own comment says `// MOVE: imggen/pdfgen make a rasterised scan`) | control-plane | test-support pdfgen / imggen (input bytes, not an answer) | hand-assembled PDF objects: a text-layer PDF padded with a stream, and a one-image-per-page scan | n/a: input bytes; test-support/pdfgen.mjs exists and r9-seam-documents.mjs:30 already imports it | B |

### record-core (36)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | cp/r72-parted:27-43 `r2()`; r9-seam-limits.mjs:~270-275 (`b.createMultipartUpload = ...`) | control-plane | R2 multipart binding over capture's `bucket()` | `createMultipartUpload`/`uploadPart`/`complete`/`abort` stand-ins | part 1 records that record-core exports `multipartBucket` (record-core/storage.mjs) and plane tests import it | B |
| 2 | cp/record.mjs:66-71; r131-gate:116-126 `bucketOf`; t51-round5-door:140-142 `withBucket` | control-plane | R2 binding (`head`, `get` with `{range}`, `put`) | in-memory object maps | platform binding, not a module's answer | C |
| 3 | cp/r133-r134-follow:~139-143 (allocid test) | control-plane | record-core `allocId` | `{ok:false, reason:"ID_SPACE_EXHAUSTED"}` at 409 and 503 / throw for the first two draws | NO: code absent from src | A |

### membership (37)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | cp/doorbell.test:311-313 (read 215-330) | control-plane | membership `visibilityOf`, `existenceAct` handed to store-door `dispatch` | `membership: () => ({visibilityOf: (id) => id === PR ? "discoverable" : "hidden", existenceAct: (id) => ({ok:false, reason:"PROJECT_SEEN_NOT_A_PARTICIPANT", project:id})})` | code exists (action-plans/investigation checks); membership's own answer shape not compared; `record.mjs` builds the real `membershipOf(ctx)` so the real one is at hand | A |

### project-roster (38)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | cp/t49-door:226-250 | control-plane | project-roster `projectOwnerVotes` route | `{ok:true, projectId, votes:[{change,target,proposed_by,proposed_at,agreed,awaiting}]}`, `{ok:true, absent:true}`, `{ok:true, votes:[]}` | unknown (shape not compared) | A |
| 2 | cp/r118-shared:14-24 | control-plane | project-roster `projectList` (double) given review's `sharedDraftsOf` | `projectRoster: () => ({projectList: spy returning {ok:true, projects: a.sharedDraftsOf(...)}})` | unknown; part two of the same file runs the real plane (good) | A |

### ai-accounts (39)

No row: envelope.test:436 and t49-door:56-62 use the real `AiAccounts` / `aiAccountsOps` (good).

### credentials (40)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | cp/r53-routes:147-156 `grantWorld`; t51-g83-location:18; t36-door:44-45 (grep) | control-plane | credentials `aiGrantAdmit` (store route `aigrantadmit`) | the admit decision re-implemented: `token === GRANT`, `write !== false \|\| !AI_GRANT_OPS.includes(op)` gives `GRANT_OP_REFUSED`, else `{ok:true, member:"ann", viewer:"member:ann", expires:1}`; refusal rows built from real `ACCOUNT_CHECKS` | shape yes (credentials/index.mjs:1467 `#held`, :1471-1479); the decision is credentials' own and is copied | A |
| 2 | cp/t37-door:~55-70 (read 1-80) | control-plane | credentials `setpassword` route | `ok({ok:true, role:"member:ann", ended:1})`; `ok({ok:false, reason:"CURRENT_PASSWORD_WRONG", detail:"wrong"})` | code exists (credentials/checks.mjs, index.mjs); the typed refusal lacks the row's `check`/`translation`; ok shape not compared | A |
| 3 | cp/digest-channel:22-34 | control-plane | credentials `credentialsOps` over a stand-in instance | `credentials = {aiCredentialMint: (a) => ({ok:true, tokenId:"agent-1"})}` recording `secretSha`; the owner's real ops map reads the request | the ops map is real; the instance is typed | A |

### promotion (41)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | cp/r123-reading:32; r133-r134:36-38,125-140; archive:24-35; t51-g43-embed:31-36,85-90; t49-door:336-341; t51-round5-door:~44; t51-round6-door:146,~160,~253,~281 | control-plane | promotion `promote` (store route `promote`) | `ok({ok:true, bundleId})`; refusals typed bare: `ok({ok:false, reason:"FILE_DIGEST_MISMATCH"})`, 409 `{ok:false, reason:"PROVENANCE_REGISTER_REFUSED"}` (r133-r134:145); t51-round6-door types `bundle_id` | real answer `{ok, bundleId, bundleSha, rowVersion, owner, ...}` (promotion/index.mjs:969, :656 idempotent); the two codes exist (promotion/index.mjs:575, provenance/index.mjs) and carry `check`/`translation`; `bundle_id` is NOT a real key | A |
| 2 | cp/doorbell.test:400-417,422,464,492; inbox-door:97-103 | control-plane | promotion `promote` (stand-in passed to `pullAndFile`) | `promotionStandIn`: `{ok:true, bundleId, bundleSha:"b"x64}` after writing a `standin_writes` row; refusal `{ok:false, reason:"PROMOTE_REFUSED_HERE", detail:"raced"}`; a throw "a store fault" | NO for `PROMOTE_REFUSED_HERE` (absent from src); the same files elsewhere pass the real `promotionOf(r.ctx)` (record.mjs), so the real one is at hand | A |
| 3 | cp/g43-embed:85-90, archive:83-88, r133-r134:125-132, t49-door:336-341 | control-plane | promotion + record-core `allocId` behind `promoteArchive({stub})` | `stub = {fetch}` answering `/allocid` `{ok:true,result:{id}}` and any other path with `{ok:true,result:{ok:true,bundleId}}` | archive.test:85-111 does the same over the real record and promotion (good model) | B |

### provenance (43)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | cp/doorbell.test:424,493 | control-plane | provenance `homeOf` handed to `pullAndFile` | `provenance: {homeOf: () => null}` / `() => home` | real `homeOf` answers `{bundleId, path, encoding, bytes, registered, authored}` (part 1); the same file passes the real `provenanceOf(r.ctx)` at :464 | B |

### pdf-worker (31)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | cp/r9-seam-documents.mjs:502-520 `pdfMember` (read 498-525) | control-plane | PDF_WORKER binding, tier-2 text for a range | `{ok:true, tier:2, text:{document, pages:[{page,text,undetermined}], undetermined, counts}}` built from the generator's truth; locked: `{ok:true, tier:1, text:{..., undetermined:[{reason:"password_required"}]}}`; 404 `{ok:false, reason:"UNKNOWN"}` | unknown (pdf-worker's R42/R43 contract not compared) | A |

### ocr-worker (32)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | cp/r9-seam-reading.mjs:138-156; r9-seam-limits.mjs:361-370; r9-seam-documents.mjs:604-620; t51-round5-seam (binding ~52-60); t51-round5-press-seam (~54-58) | control-plane | OCR_WORKER `POST /transcribe` | `{ok:true, engine:"tess", version:"5.3", cap:"C", measured_by:"M-1", confidence_floor:null, pages:[{page, regions:[{text, source:{kind:"pdf-page",ref,page,rect}, confidence:"none"}]}]}`; three copies answer up to 24 pages per call; one copy omits `deferred` | NO for the 24-page copies: real member takes the first page only and lists the rest in `deferred` (ocr-worker/src/contract.mjs:171, member.mjs:308-329); the one-page copies match | A |
| 2 | cp/r9-seam-reading.mjs:138-156 | control-plane | OCR_WORKER faults | `{ok:false, reason:"R9_DOWN"}` 503, `R9_CALL_INSIDE_A_REQUEST` 500, `R9_KILL` 500 with `x-r9-kill` | the three reasons are the test's own fault injection (absent from src) | C |
| 3 | cp/t51-round5-door:111,132 | control-plane | OCR_WORKER presence | `{fetch: async () => new Response("{}")}` bound so "an OCR member is bound" holds; its answer is never read | n/a (presence only) | C |

### file-scanner (34)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | cp/r9-seam-reading.mjs:180-215 (read 1-520) | control-plane | FILE_SCANNER binding `/scan`, `/render`, default | `cleanVerdict` = `{capture_sha, tool:"clamav", engine, engine_version, signatures:{main,daily,bytecode,published}, scanned_at, result:"clean", findings:[], latency_ms}`; `/render` → 422 `{ok:false, code:"NOT_RENDERED"}`; default `{ok:true, name:"file-scanner", version:"1.0.0"}` | `NOT_RENDERED` NO (real render failure code `RENDER_FAILED`, file-scanner/src/render.mjs:58); verdict shape not compared | A |
| 2 | cp/r8-bootstrap-fanout:14-18 (also AGENT_WORKER) | control-plane | FILE_SCANNER `/version` | `Response.json({name, version:"9.9.9"})` after a counted 300 ms wait | unknown | A |

### capture-sources (46)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | cp/t51-visitor-copy:24-26 `R_ANSWER` | control-plane | RENDERER answer (render.mjs RENDER_ANSWER) | `{ok:true, html, elapsed_ms:12, engine:"Chrome", engine_version:"1", viewport, dpr, locale, timezone, navigated_to, status, requests:[], scripts:[], wait:{asked:{until,timeout_ms}, fired}}` | ok-shape yes (part 1, capture-sources row 1); the file runs the real acquisition and capture around it | A |

### acquisition (47)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | cp/t51-g43-embed:31-45; archive:21-40; r133-r134:120-130 `unpackWorld`; t51-round5-door:36-40; t51-round6-door:~200; t50-door:164-171; t51-defer-reading:14-27; t51-acquire-timings:140-145 | control-plane | acquisition `acquire` / `unpack` answers handed back by the plane hook or the `unpack` route | `{ok:true, existed:false\|null\|true, document, unpack:{ok:true, archive:{sha256}, documents:[...], complete:true}}`; `existed_undetermined:"captured in 5 parts"`; pair `{ok, document:{..., pair:{shell}, render:{status:200}}}`; pending `{ok, existed:true, continued:{session, primary}, render:{state:"pending", session}}` | key set partial: real unpack answer `{ok, archive:{sha256,bundle,grade,bytes,entries}, documents, already_held, not_filed, nested, ...}` (acquisition/unpack.mjs:729, :1026); `existed_undetermined` real (index.mjs:1921) | A |
| 2 | cp/r123-reading:20-30; r133-r134:28; r100-upload:20; t51-round5-door:18-21; t51-round6-door:20-23; t51-defer-reading:11; r131-gate:26; g43-embed:24, :109-113 `csvDoc`; r124-owed-render:27 `docOf` | control-plane | acquisition `acquire` document | `{file, locator, retrieved, profile:{format}, capture:{sha256, bytes, content_type, method}, parts?, reading?, text_units?}` typed per file (nine variants) | partly: a real document also carries authority_state, origin, provenance_chain, attestation_attempts... (part 1 acquisition row 6); parts rows `{sha256, bytes}` match provenance `partsOf` | A |
| 3 | cp/t51-acquire-timings:17,100-125,142; t51-round6-door:~205; t50-door:347-348 | control-plane | acquisition `stageTimes` | `{total_ms, stages:{reputation,fetch,read,receipt,profile,attest,subresources,unpack,render}, running}` typed per case | shape yes (acquisition/index.mjs:356 `stageTimes`, exported); typing it is avoidable | B |
| 4 | cp/t50-door:89 | control-plane | acquisition `openCaptures` | `ok({ok:true, sessions:[]})` | NO: real answer `{ok:true, captures:[], truncated:false}` (acquisition/index.mjs:2615, :2647); r8-seam-capture reads `captures` | A |
| 5 | cp/t51-round6-door:~190 | control-plane | acquisition `acquire` large-fetch answer | `{ok:true, fetch_pending:{session, since, declared_bytes, why:"LARGE"}}` | unknown (shape not compared); r8-seam-capture/r9 run the real one | A |
| 6 | cp/t51-visitor-copy:32 `ledger()` | control-plane | acquisition hook `owedLater` | `owedLater: async (e) => {entries.set(e.session, e); return {ok:true}}` | `{ok:true}` is acquisition's own contract (part 1 capture row 2) | C |
| 7 | cp/r124-owed-render:84-86,108,130-135 | control-plane | acquisition `owedRun` answer handed to `deliverOwedRender` | `answer: {ok:true, document}` and `{ok:true, existed:true, document}` | the real `owedRun` is used in t51-visitor-copy (good model); here typed | A |

### capture (48)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | cp/r72-parted:76-79,162-171; r9-seam-limits.mjs:282-285; r100-upload:35-37 | control-plane | capture `uploadCapture`, `beginPartedUpload`, `putUploadPart`, `completePartedUpload`, `abortPartedUpload` (spies) | `{capture: () => ({uploadCapture: (a) => {calls.push(a); return {ok:true};}})}` etc., to see the arguments the door passes | the argument contract is capture's; the same files also run the real `fresh()` instance (r72-parted:40-56) | A |
| 2 | cp/r123-reading:115-118 `landed`/`uploading`; t51-g83-location:72-74; t51-round5-door:~58; t51-round6-door:27-31 `storeFor`; r100-upload:~25; t41-door:152,173 (grep) | control-plane | capture `captureupload` answer | `{ok:true, existed, capture:{sha256, bytes}, receipt:{address:"upload:<sha>"}, document}`; refusal `{ok:false, reason:"EMPTY", status:400}` | `EMPTY` exists (capture/index.mjs); shape partial; capture/fixture.mjs `fresh()` already makes the real answer (used by r72-parted, declared-ops) | B |
| 3 | cp/t51-round6-door:~218 | control-plane | capture `loadCaptureSession`, `heldAt` routes | `{session:"rs_1", found:true, primarySha, state:{opened_by}}`; `{ok:true, held:true\|false}` | key set partial (capture/index.mjs:3241, :3771) | A |
| 4 | cp/r124-owed-render:117-130 | control-plane | capture `recordFetchDone` | spy returning `{ok:true}`, and a throw "boom" | fault injection; the next test (:135-150) uses the real one | C |

### doorbell (49)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | cp/r123-reading:121-127 `pulledAnswer`; doorbell.test:226-233; inbox-door:126-146 | control-plane | doorbell `inboxpullfile` / `inboxresolve` / `inboxList` answers | `{ok:true, existed:false, knockId, capture, document, bundle:{bundleId, bundleSha}}`; refusals typed bare with a status hint: `RESOLVE_NO_REASON` 400, `NO_SUCH_KNOCK` 404, `BAD_STATUS`, `KNOCK_DISCARDED` 409, `PULL_WITHIN_FAILED` 500, `REQUIRED_ARGUMENT_MISSING` 400 | codes exist (doorbell/checks.mjs, doorbell/index.mjs); same files run the real doorbell over the real record (good model) | A |

### file-safety (50)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | cp/t36-door:226-227,241 (grep only) | control-plane | file-safety safe-view byte ops | `served(headers)` raw bytes and `ok({ok:false, reason:"SAFE_VIEW_ONLY", code:"SAFE_VIEW_ONLY"})` | code exists (file-safety/checks.mjs); the row's check/translation absent in the typed value; body not read | A (lines grep only) |

### reading-pipeline (53) and extraction (54)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | cp/r123-reading:32-33,118; r133-r134:40-42; t51-round5-door:38-39; t51-round6-door:26-31,~146; t51-g83-location:73; r100-upload (via `answer`) | control-plane | extraction `readHeld` (store route `readheldfor`) | `{ok:true, read:true}`, `{ok:true, read:true, found:true}`, `{ok:true, read:true, owed:true}`, `{ok:true, read:true, found:true, more:true}`, `{ok:true, read:false, why:"NO_HOME"\|"NO_WHOLE_OBJECT"\|"READING_HELD"}` | real answers (extraction/index.mjs:881-885 `left`, :967 `more`, :1076-1083): `read:true` always has `bundle_id` and `found`; READING_HELD carries `counters`; `owed` and `more` are real keys; the partial ones are NOT producible | B (re-point to part 1's `readHeldAnswers`) |
| 2 | cp/r123-reading:117 `extractread`; r100-upload:22 `READ`; t51-round6-door:28 `READ`, :29 `STATED`; t51-g43-embed:27 `readingOf` | control-plane | extraction `read` (store route `extractread`) | `{reading:{found:true, entities:0}, text_units:[{extent:{kind:"document"}, text}]}`; `STATED` = `{reading:{found:false, failure:"final", basis:"the capture is 40014922 bytes in 5 parts, over the 25165824 B ..."}, text_units:[]}` | `extent {kind:"document"}` real (extraction/index.mjs:1867); `entities: 0` NOT (an array, :484, :1375); `basis` is a sentence the module composes from `statement()` and is typed by hand here | A |
| 3 | cp/t51-round5-door:~170; t51-round6-door:~120-125 | control-plane | extraction `readingFor` (route `reading`) | `{ok:true, found:true, bundle_id, reading:{found:true, tier3_candidate:true}}`; `{found:true, reading:{found:false, failure:"transient"}}`; `{ok:true,found:false}` | partial (part 1 row 7: `completeness` is a top-level object in the real answer) | A |
| 4 | cp/t51-round5-door:~187 | control-plane | extraction `readHeld` with `defer` | `{ok:true, read:false, why:"READING_PENDING"}` | YES (extraction/index.mjs:904, :931 `left("READING_PENDING")`) | B |
| 5 | cp/t42-door:114-116 (read 95-152) | control-plane | extraction Durable Object half of `pageTranscribeOp` | `{status:403, body:{ok:false, reason:"TRANSCRIBE_NOT_DEPLOYED", code, check:"C-51.7"}}`, `{status:200, body:{ok:true, performed:false, why:"no assistant is bound"}}`, `{status:200, body:{ok:true, performed:true, pages:[3,4]}}` | code exists in src; bodies not compared; real `pageTranscribeOp` is imported (good) | A |

### docket (110) and public-read (111)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | cp/r45-routes:192,219; r48-routes:148-165; r49-routes:176,195; r49-case-inputs-public:34,53,61 (grep lines only) | control-plane | public-read store route `publicread`; docket `docketpublic`, `docketfeed` | `{ok:true, read:<name>, module:"network-notices"\|"case-checker"\|"case-inputs", result:{n:1}\|{held:true}}`; `{ok:false, reason:"PUBLIC_READ_NOT_REGISTERED"}`; `{ok:true, case, entries:[], last_entry:null}`; `{ok:false, reason:"NOT_PUBLISHED"}` | `PUBLIC_READ_NOT_REGISTERED` exists (public-read/checks.mjs:127); the real `publicReadDoorOp` is imported and runs; answer shapes not compared | A (lines grep only) |
| 2 | cp/t46-door:~135-138 (group fields A, B); t50-door:~30-45 (R102) | control-plane | public-read `groupFields` (object RPC) | `{group, name, domain, domain_verified_at, stake, detail}` and a `matter_stake` variant | plane's `groupFields` calls `publicReadOf(ctx).groupFields` (plane/store.mjs:725-728); shape not compared | A |

### case-inputs (120)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | cp/statementack:13-34 `standIn` | control-plane | case-inputs `acknowledgeStatement` behind its real `caseInputsOps` | the act re-implemented: reasonless → `{ok:false, reason:"STATEMENT_ACK_NO_REASON", code, check:row.check, translation:row.translation}`; `D-DEAD`/non-member → review's `noReviewCopy()`; ok → `{ok:true, acknowledged:true, reason}` | the refusal exists and is built the same way (case-inputs/index.mjs:783 `ack(...)`); the decision is copied | A |
| 2 | cp/digest-channel:22-34 | control-plane | case-inputs `caseInputsOps` over a stand-in instance | `authoring = {acknowledgeStatement: rec("statementack")}` answering `{ok:true, route, admitted}` | ops map real, instance typed | A |

### review (122)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | cp/t46-door:~118 `copy`; converts:93,171; t50-door:~33 `copyOf`; t51-round6-door:~296 `copy(id)` and batch `{ok, kind:"review-copies", count, copies}` / `{kind:"review-drafts-batch", count, lists}` | control-plane | review `reviewCopy` (store route `reviewcopy`, `casedrafts`) | `{ok:true, draft, updated_by, required_strength:"B"\|2, last_change:{kind,at,by}, text}` (five typings) | batch kinds exist (review/index.mjs); `required_strength` is a letter in four files and the number 2 in one; real `projectBar` returns the letter-or-number the module defines (review/index.mjs:907) | A |
| 2 | cp/digest-channel:22-34 | control-plane | review `reviewOps` over a stand-in instance | `review = {act, copy, comment, list}` recorders | ops map real | A |
| 3 | cp/t51-reviewcomment:5-45 | control-plane | review `standard()` fixture + `reviewOps` | none: real fixture (review/fixture.mjs) | n/a (good model) | C |

### filing-templates (132)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | cp/digest-channel:22-34 | control-plane | filing-templates `filingTemplatesOps` over a stand-in instance | five typed methods (`templateRead`, `templateComments`, `templateReview`, `templateComment`, `templateReviewGrant`) recording `secretSha` | ops map real | A |

### case-authoring (121) / case-inputs

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | cp/converts:110-111 (grep) | control-plane | `casedocument` (case-authoring/case-inputs) | `{ok:true, case_id, edition:2, ratified:false, text, doc_sha}`; stranger `{ok:false, reason:"NO_CASE_DOCUMENT"}` | code exists; shape not compared (lines grep only) | A (lines grep only) |

### Thirteen owners behind owner-ops (ai-use 88, ai-runs 89, case-account 119, case-authoring 121, review 122, leg-earning 78, capture 48, steps 81, investigation 102, question-explorer 94, action-clocks 130, filings 133, action-plans 135)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | cp/owner-ops.test:9-24 `recorder`, :19 `GETTERS`, :41-77 `ACTS`; answers :105-110 (read 9-60 and grep) | control-plane | all thirteen services by method name | a `Proxy` owner answering `{ok:true, method, args}` for any method name; 54 method names typed in `ACTS`; `findDoors` → `{find, question, doors:["accept"]}`, `findMute` → `{ok:false, reason:"EXPLORE_NO_SUCH_FIND"}`, `step` → `{ok:false, reason:"NO_SUCH_STEP"}` | every one of the 54 names exists as a method in some `src/*/index.mjs` (grep); the codes exist (question-explorer/checks.mjs, steps/checks.mjs); the proxy would accept a misspelled name | A (each owner publishes its service-method list; the test checks the door calls only those) |

### inquiry (79)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | cp/t50-door:164-176 `acquireWorld`, `seesOnlyQ1` | control-plane | inquiry `inquirypartition` (sight of a question) | `ok({ok:true, id:"Q-1"})`, `ok({ok:false, reason:"NOT_AN_INQUIRY", target})`, `ok({ok:false, reason:"NO_SUCH_BUNDLE", target})`; real `ARCHIVE_CHECKS.BAD_FOR` is used | codes exist (citation/checks.mjs, steps); route is in inquiry/index.mjs; shape not compared | A |

### run-rules (87), ai-runs (89), affordances (143)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | cp/t46-door:19 `UNTESTED` | control-plane | run-rules `untestedLabel` | `{kind:"untested", part:"draft:writinghelp", set:"GT-1", set_version:1, words:"ai.label.untested"}` (comment: "run-rules' untestedLabel shape") | unknown (not compared) | A |
| 2 | cp/t46-door:~150-165 `runWorld` | control-plane | ai-runs `dispatchMemberRun` (object RPC) | `{run, found:true, dispatched:true, status:"running", dispatch:{state:"DISPATCHED"}}`; refusal `{run, dispatched:false, found:true, status:"running", code:"AI_RUN_NOT_PRINCIPAL", check:"C-22.12", translation:"not yours", detail}` | code exists (run-rules/checks.mjs); typed `check` and `translation` are the test's own copies; the RPC itself is plane's (see plane) | A |
| 3 | cp/t46-door:20-24 `packHooks`; draft.test:33-37 | control-plane | affordances `affordances` op | `{ok:true, result:{catalog:[], vocabularies:{}}}` | partial (affordances' untargeted shape per affordances R17, not compared) | A |

### agent-worker (100)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | cp/declared-ops:78-98 `agentWorker` | control-plane | AGENT_WORKER sign-in `step` | `AGENT_STEPS = ["start","code","state","signout"]` retyped; ok `{ok:true, member, step}`; other step 400 `{ok:false, code:"BAD_STEP", detail:"step is not one of start, code, state, signout"}` | step list duplicates agent-worker/src/signin.mjs (`SIGNIN_ROUTES`, :38); real BAD_STEP is `own("BAD_STEP", 400)` with its own translation (signin.mjs:100,130); the typed detail sentence differs | A |
| 2 | cp/t37-door:16-24 `agentWorker()` | control-plane | AGENT_WORKER binding | recorder with default `reply = () => ok({})` | the answer is unread by most cases; shape unknown | A |
| 3 | cp/r8-bootstrap-fanout:14-18 `fleet("agent-worker")` | control-plane | AGENT_WORKER `/version` | `{name, version:"9.9.9", runner:{state:"SERVING"}}` after 300 ms | unknown | A |
| 4 | cp/t46-door:25-55 `withObject`/`draftWorld`; t48-door:41-80; draft.test:21-30 (grep for t48) | control-plane | agent-worker `POST /draft` as the object's `draft` returns it | `{ok:true, task:{op}, label:{kind:"machine"}, usage:{input_tokens:10,output_tokens:5,cache_read_input_tokens:0,cache_creation_input_tokens:0,total_cost_usd:null}, calls, grant, suggestions, read, draft:{text,focus,purpose}}`; `{ok:false, code:"AI_PART_NOT_DEPLOYED", check:"C-22.29", detail}` at 403 | usage keys match agent-worker/src/draft.mjs:250 (`usage`, `calls`); codes exist (gate.mjs, plane/ask.mjs); the object RPC itself is plane's (plane row 1) | A |

### translations (150) and instance-setup (151)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | cp/t51-interfacewords:9 `WORDS`, :98; r8-words-cache:157-158,166 (grep) | control-plane | translations `interfacewords` | `{ok:true, result:{ok:true, language:"es", words_version:"s1", words:{"k.0":{shown, english}, ... 4000}}, store, tokenClass}`; refusal `NO_SUCH_LANGUAGE` at 200 and 409 | NO for `NO_SUCH_LANGUAGE` (absent; src has `LANGUAGE_NOT_SET`, `LANGUAGE_MALFORMED`); words shape not compared | A (lines grep only) |
| 2 | cp/t47-door:264-282 (grep and header) | control-plane | instance-setup `grouplogo` (setup.mjs:1484) | PNG/JPEG bytes at 200 with a type, 404 | route is instance-setup's; bytes typed | A (lines grep only) |

### interface-shell (159) and screens (160-168)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | cp/r124-owed-render:24-26 `screen`; t51-g43-embed:97-99; t51-visitor-copy:27-29; r8-kit.mjs `screenCall`; r8-seam-capture:54-71 `watching()` `cs`; t51-reading-follows:84-90; t51-large-pdfs:78-82; round5/6/7 seam copies | control-plane | screens-intake (163) `cs` context handed to `CAPTURE_SCREEN.parts.promoteDocument` | `{now, digest, w:(k)=>k, date:(d)=>d, call: async (op,{query,body}) => ...}` (record variants call `promotionOf(ctx).promote` directly; Miniflare variants call the plane; `watching()` adds `set`, `esc`, `later`) | the real `promoteDocument` is called every time (good); the context is the screen's own contract, retyped about nine times | A |
| 2 | cp/r8-kit.mjs:111-123 `projectOf`; :153-175 `questionOf` (comment: "`src/screens-inquiry/project.mjs` `promote`"); r118-shared:53-59; t51-round6-seam:120, t51-round7-seam:266,335 (grep) | control-plane | screens-intake / screens-inquiry (165) composition of a project and a question | hand-written `bundle.md` front matter for a project and an inquiry, `promote` bodies, then `drawquestion` | copied from the screens' own `promote`; if a screen changes its bundle these keep writing the old one; the screens module could publish `newProjectPackage(...)`, `newQuestionPackage(...)` | A |
| 3 | cp/r8-seam-capture:15 `DOCUMENT_STUB`; used :146 | control-plane | screens-inquiry document screen | `{id:"document", reads:()=>({}), render:()=>"", acts:[], words:[]}` appended to `SCREENS` so the shell boots | a stand-in for a screen module (comment: "without its second registration of the declared ops") | A |

(screens-publish's `fixtures.mjs` is imported by r8-seam-misc.mjs and t51-round7-seam: `CE.open(CEREMONY, {plane: {publishpreflight: CE.ok(R(asked))}})` hands the screen the door's own real answer; good model, no row.)

### plane (170): all A\*

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | cp/t46-door:25-31 `withObject`; t48-door:41-47; t50-door:20-25; draft.test:21-30; r124-owed-render:45,113; t51-g43-embed:~100 | control-plane | plane Store object RPC methods `draft`, `groupFields`, `dispatchMemberRun`; `STORE.get(id).fetch` recorder | `w.env.STORE.get = (id) => ({...get(id), draft: async (args) => ...})`, and `get: () => ({fetch: async (req) => {added.push(url); return {ok:true, result:{ok:true}}}})` | plane/store.mjs:725 `groupFields` exists; `draft`, `dispatchMemberRun` exist as plane RPC; answers typed | A\* |
| 2 | cp/r123-reading:32,118; r133-r134:40-42,172; t51-round5-door:38; t51-round6-door; g43-embed:35 (`pendingadd` answers) | control-plane | plane `pendingadd` | `ok({ok:true})`; `ok({ok:false, reason:"PENDING_NOT_KEPT"})`; `500 "<html>boom</html>"` | real `{ok, existed, state:"queued"}` (plane/pending.mjs:265); `PENDING_NOT_KEPT` real (pending.mjs:675) but bare; silence is a transport fault | A\* |
| 3 | cp/r72-parted:43-54; r9-seam-limits.mjs:276-281 | control-plane | plane `registerJob` / `armJobs` (test-support `jobRegistrarStub`) plus the `core.transact` wrapper that rolls a refusal back | stub registrar with its own rules | part 1 structural finding 2 (real reasons JOB_ENTRY_INVALID, JOB_KIND_UNKNOWN, JOB_SESSION_MISSING, JOB_SHA_INVALID, JOB_NOT_KEPT, plane/pending.mjs:242-265) | A\* |
| 4 | cp/r123-reading:84; r117-held:89,146 and r130-jobs:20 (part 1) | control-plane | plane's refusal of a route it does not have | `{ok:false, reason:"UNKNOWN_ROUTE"}` at 404 | NO (real: `{ok:false, error:"unknown op: <op>"}` at 400, store-door/dispatch.mjs:406) | A\* |
| 5 | cp/envelope:160-175,376,418-419; t51-round5-door:~215 (`server-timing: object;dur=7`) | control-plane | plane store answers: bare 500s, `{ok:false, error:"Error: boom\n at ..."}`, non-JSON, `ok:"true"`, a header | transport faults and header, to test the door's envelope | fault injection | C |
| 6 | cp/t49-door:159,187,200; t36-door; t41-door; t34-routes; t35-door (grep only) | control-plane | plane store routes `claim`, `founderhandleset`, `accountusesset`, `projectkeyset`, `handlecheck`, `handlechange`, `websiteinvite`, `doorwindow` | scripted `ok({...})` answers to see what the door sends and relays | bodies not read | A\* (lines grep only) |

### control-plane's own contract (no provider)

Not rows: `STORE_DID_NOT_ANSWER`, `PROMOTE_FAILED`, `READING_NOT_REGISTERED`, `unpack_pending`, `reading_pending`, `ACQUIRE_TIMED_OUT`, `kept`, `AGENT_WORKER_UNBOUND`, `REPLAY_UNVERIFIED`, `CREDENTIAL_IN_ADDRESS` are answers the door itself composes; the tests assert them correctly.

## Summary

### Published fixtures each provider would need

- **test-support**: `pdfgen` text-layer PDF with a stated padding size and `scanOf(pages)` (one image per page), so the seam files stop writing PDFs
- **record-core**: use `multipartBucket` in r72-parted and r9-seam-limits; `allocId` refusal reasons list (so `ID_SPACE_EXHAUSTED` is replaced by a real one or removed)
- **membership**: `membershipWithAdmins` / a `store.membership` that is `membershipOf(ctx)` (record.mjs already builds it)
- **project-roster**: `projectOwnerVotesAnswers({absent, votes})` made by the real route; `projectList` double replaced by the real module over review's `sharedDraftsByProject`
- **credentials**: `aiGrantWorld({grant, ops})` over the real `aiGrantAdmit` (a live grant row); `setPasswordAnswers()` ok / `CURRENT_PASSWORD_WRONG` with its row; a recording `aiCredentialMint` instance
- **promotion**: `promoteAnswers()` ok, idempotent, `FILE_DIGEST_MISMATCH`, `PROVENANCE_REGISTER_REFUSED` with rows; a `promotionThatRefuses(code)` over the real module for the doorbell's within-pull tests (replaces `PROMOTE_REFUSED_HERE`)
- **provenance**: pass `provenanceOf(r.ctx)` (already built) to `pullAndFile`
- **pdf-worker**: `pdfWorkerFor(truth)` running the real handler over the generator's PDF, locked and tier-2 answers
- **ocr-worker**: `ocrBinding({down, killPages})` running the real handler over a fake engine, one page per call with `deferred`; delete the three 24-page copies
- **file-scanner**: `fileScannerBinding({scanMs, renderMs})` with real verdict shape and `RENDER_FAILED`; a `/version` answer
- **capture-sources**: `renderAnswer(url, {...})` (part 1) for `R_ANSWER`
- **acquisition**: `acquiredDocument(bytes, opts)`, `acquireAnswer({existed, parts, render, unpack})`, `unpackAnswer(members)`, `openCapturesAnswer(sessions)`, `fetchPendingAnswer`, `stageTimesFor(stages)` (or call the exported `stageTimes`); the `owedRun` answer for `deliverOwedRender`
- **capture**: `fresh()` (exists) as the source of `captureupload` answers; `uploadCaptureContract()` recorder for the four parted arms; `loadCaptureSession` / `heldAt` answers
- **doorbell**: `pulledAnswer({existed})` and `doorbellRefusals()` with their status hints, made by the real doorbell
- **file-safety**: `safeViewOnly()` refusal with row and the served-bytes headers
- **extraction**: `readHeldAnswers` (part 1) incl. `piece`, `more`, `owed`, `held(counters)`, `noHome`; `extractReadAnswer(doc)` with `entities: []`; `statedReading(size, bound)`; `pageTranscribeBodies()`
- **docket / public-read**: `publicReadAnswer(module, name, result)` and `docketAnswers()`; `groupFields(project)` answer
- **case-inputs / review / filing-templates / credentials**: a recording instance over each real ops map (`digest-channel`, `statementack`), with the real act for the refusals; `reviewCopyAnswer({project, strength})` and batch kinds
- **thirteen owners behind owner-ops**: the list of service-method names each owner exports, for the recorder to be built from
- **inquiry**: `inquiryPartitionAnswers(viewer, ids)`
- **run-rules / ai-runs / affordances**: `untestedLabel(op)`, `dispatchMemberRunAnswers()`, `affordancesUntargeted()`
- **agent-worker**: `signinStep(step)` over the real `signin.mjs`; `/version`; `/draft` answers (`draftAnswer({op, grant, untested})`)
- **translations / instance-setup**: `interfaceWordsAnswer(lang)`, the real language refusal; `groupLogoAnswer`
- **screens-intake / screens-inquiry**: `screenContext({call})` for `promoteDocument`; `newProjectPackage()`, `newQuestionPackage()`; a document-screen stand-in published by screens-inquiry
- **plane (A\*)**: `storeStubFor(routes)` and the registrar world (part 1); control-plane publishes the contract fixture of the routes it calls (`pendingadd`, `readheldfor`, `extractread`, `promote`, `allocid`, `aigrantadmit`, object RPCs) and plane's tests run it

### Rows by provider (A / B / C / A\*)

| provider | A | B | C | A\* | rows |
|---|---|---|---|---|---|
| test-support | 0 | 1 | 0 | 0 | 1 |
| record-core | 1 | 1 | 1 | 0 | 3 |
| membership | 1 | 0 | 0 | 0 | 1 |
| project-roster | 2 | 0 | 0 | 0 | 2 |
| credentials | 3 | 0 | 0 | 0 | 3 |
| promotion | 2 | 1 | 0 | 0 | 3 |
| provenance | 0 | 1 | 0 | 0 | 1 |
| pdf-worker | 1 | 0 | 0 | 0 | 1 |
| ocr-worker | 1 | 0 | 2 | 0 | 3 |
| file-scanner | 2 | 0 | 0 | 0 | 2 |
| capture-sources | 1 | 0 | 0 | 0 | 1 |
| acquisition | 5 | 1 | 1 | 0 | 7 |
| capture | 2 | 1 | 1 | 0 | 4 |
| doorbell | 1 | 0 | 0 | 0 | 1 |
| file-safety | 1 | 0 | 0 | 0 | 1 |
| reading-pipeline / extraction | 3 | 2 | 0 | 0 | 5 |
| docket / public-read | 2 | 0 | 0 | 0 | 2 |
| case-inputs | 2 | 0 | 0 | 0 | 2 |
| review | 2 | 0 | 1 | 0 | 3 |
| filing-templates | 1 | 0 | 0 | 0 | 1 |
| case-authoring (casedocument) | 1 | 0 | 0 | 0 | 1 |
| thirteen owners (owner-ops) | 1 | 0 | 0 | 0 | 1 |
| inquiry | 1 | 0 | 0 | 0 | 1 |
| run-rules / ai-runs / affordances | 3 | 0 | 0 | 0 | 3 |
| agent-worker | 4 | 0 | 0 | 0 | 4 |
| translations / instance-setup | 2 | 0 | 0 | 0 | 2 |
| interface-shell / screens | 3 | 0 | 0 | 0 | 3 |
| plane | 0 | 0 | 1 | 5 | 6 |
| **all** | 48 | 8 | 7 | 5 | 68 |

### Rows by user module

| user module | A | B | C | A\* | total |
|---|---|---|---|---|---|
| control-plane | 48 | 8 | 7 | 5 | 68 |

Class A counts only rows whose provider is earlier than control-plane (so the rule can be met); the five A\* rows are plane's. Of the 48 A rows, 5 are marked "(lines grep only)" (file-safety 1, docket/public-read 1, case-authoring 1, translations 1, instance-setup 1) and rest on files read by header and grep, so those five are lower confidence; the A\* plane row 6 is the same. The real total is higher: the files listed under "NOT read" repeat these seams, and t34/t36/t41/t48/t49/t50 each script the plane's store routes by hand.
