# K4990 audit, part 2: module `plane` (tests not read in full by part 1)

Branch tranche/T51, read only. Paths are from the repository root. `bio-plane/test/m/plane/` is written `P/` below. Provider indexes are positions in build/modules.json (lower = earlier). The user module of every row is `plane` (170), so the "per-user counts" are one line. Method, row format and classes A/B/C follow part 1 (`build/plan/audit-fixtures-K4990.md`): A = the provider publishes a fixture made by its real code and the test re-points (judgment); B = mechanical re-point to a fixture that exists or is trivial; C = acceptable. A* does not occur here (see finding 1).

## Header: covered / not covered

**Read in full (every line), this part:** P/fixture.mjs, t33, t34, t36, t39, t41, t42, t43, t44, t45, t46, t47, t48, t50, ask, door, store, worker, disclosures, notices, words, sweep, compose, docket, g42-storage-seam, accepted (all 172 lines), findings, round6-extraction, round6-reevaluation, watch, declarations, wizards, split, declared-ops, release, hosts, hold, step, limits, stats, roster, g48-classify, g83-location, g83-census, g83-entry, g41-shape.test, shape-harness.test, r9-memory, r8-lag, g123h-preload, g44-shape.test, watchdog, l75, l75-entry, l77, l77-traffic, l77-size, l77-size-child, l79, l79-entry, r7-contention, r7-contention-entry, r7-founder, r7-lastmem, r7-lastms, r8-headofline, r8-headofline-entry, r8-heal-door, r8-timing-hook, r8-wave, r8-wave-kit, r9-bookkeeping, r108-project, t49 (read to line 37 of 37), fix6-pending, g54-l, g54-l-entry, g54-seed, g54-sweep, g55-alarm-l, g55-alarm-l-entry, g55-L.probe, g57-heal, g57-heal-entry, r42-entry, body.

**Partly read (the lines are stated):** P/maps.mjs lines 1-20 and a grep of the rest (it builds the real modules' own ops maps; no hand-built answer found); P/shape/harness.mjs lines 1-30 and 150-276, 329 and greps of the rest (467 lines); P/g123f-cells.test.mjs lines 1-10 of 65; P/g48-corpus.mjs lines 1-22 of 27; P/make-g48-plane-answers.mjs lines 1-25 of 27; bio-plane/test/system/migrate-released.test.mjs lines 1-60, 360-400 and a grep of the rest (537 lines).

**NOT read, so no claim:** P/shape/{bars,cap,fault.probe,g13.probe,g15.probe,g26.probe,g41.probe,g44-gen,g44.probe,keep40.probe}.mjs (about 330 lines); P/fixtures/g48-plane-answers.json (2,130 lines of recorded data), P/fixtures/t43-page.png and t43-photo-o6.jpg (binary); the rest of g123f-cells.test.mjs (lines 11-65); the rest of shape/harness.mjs (lines 31-149, 277-467) and of migrate-released.test.mjs. Part 1's files are not repeated (r9-jobs, fix3-r74, fix4-defer, r7-keephome, fix4-seam, fix4-r75, fix4b-r77, fix4b-r77-owners, fix5-r77); the seams they hold are cross-referenced where the same double reappears.

Candidate search was by grep (stub/fake/double/canned, `fetch:`/`new Response`, `INSERT INTO`, `AGENT_WORKER|FILE_SCANNER|OCR_WORKER|PDF_WORKER|RENDERER|SHEET_WORKER|SELF`, `readHeld|owedFetch|owedRun`, `ok:`/`reason:`/`why:`/`code:` literals); every row below comes from a file in the "read in full" list, or from the exact line range stated. I checked the reason/code strings of every file in scope against src of bio-plane, agent-worker, file-scanner, pdf-worker, ocr-worker, sheet-worker, docprofile and the doctype modules by script: 53 distinct strings, 8 absent from src (3 are in this part: `FETCH_REFUSED`, `UPSTREAM_SLOW`, `NOT_RENDERED`; the other 5 are part 1's files).

## Findings for BOB

1. **Order does not block this part.** Every provider named below has an index lower than plane (170), including control-plane (169). The rule can be met as written for all 52 rows; the only provider that is later-or-equal is plane itself (its own Store), rows PL1-PL5, all C.
2. **A hand-built double hides a probable defect (row AW4).** `bio-plane/src/plane/ask.mjs:449` builds the member's reading from `answer.translation`. Real agent-worker answers a `readtranslate` as `{ok:true, task, draft:{text, language, from_language}, label, usage, calls}` (`agent-worker/src/draft.mjs:429-433, 480`); no file in `agent-worker/src` writes a `translation` key. The plane tests (t48.test.mjs:42-45, declared-ops.test.mjs:31-34) hand the plane `{ok:true, translation:"[es] ...", language, usage, calls}`, so every test passes and a real reading would carry `translation: undefined`. Found by reading; I did not run it against the real worker.
3. **A control that never runs (row AC2).** `P/fix6-pending.test.mjs:89-96` asserts the `NO_OWNER` outcome only `if (typeof owedFetch !== "function")`. `owedFetch` is exported (`bio-plane/src/acquisition/index.mjs:2531`), so the block is dead and its assertion never executes.
4. **A seam no test exercises (row CP2).** Control-plane's real `op=unpack` answers an unfinished archive with HTTP 200 `{ok:true, result:{ok:true, complete:false, waiting_on:{code:"ARCHIVE_NOT_FILED"}}}` (`control-plane/index.mjs:2453`). `unpackOutcome` (`plane/unpack.mjs:36-40`) returns "remove" for any 2xx whose body.ok is not false, so the drain would drop the event. The plane tests only feed it `{ok:true,result:{unpacked:1}}` (a key control-plane never writes) or `{ok:true,complete:true}` (no `result` envelope). Whether dropping is intended is for plane/control-plane to say; I did not verify.
5. **Copy-paste families, each a drift risk.** (a) "File an uploaded capture as the capture screen does" (hand-made `document` + hand-written bundle.md + `promote`): six copies, row SI1. (b) The agent-worker double: eleven files, four variants of `/transcribe`, three of `/draft`, rows AW1-AW6. (c) The file-scanner verdict: three copies, two shapes, rows FS1-FS2. (d) Hand-written bundle markdown: row RG1. (e) Hand-inserted rows into `members` (28 files), `sessions` (11), `bundles` (10), `register`/`files` (4), `ai_runs` (2): rows ME1, CR2, RC1, RC2, AR1. (f) Eleven-plus private in-memory R2 buckets, row RC3.
6. **Good models already in this part** (keep): t44 and t43 feed pdf-worker's real renderers real byte fixtures; t39 and disclosures use case-carriage/fixture.mjs and provenance/fixture.mjs (`bucketStandIn`, `sha`, `infoMd`, `provDoc`, `makePng`); round6-reevaluation uses reevaluation/fixture.mjs; g57-heal uses ratification/fixture.mjs (`newKey`, `signBundle`); watch uses case-checker/fixture.mjs with real sshsig signing; g48-classify/g48-corpus read the doctype, roster, budget and court modules' own test fixtures and a JSON recorded from the real classifier (make-g48-plane-answers.mjs); r8-headofline and r8-wave-kit drive the real `captureupload` door; shape/harness.mjs's default branch uses the real `uploadCapture`; migrate-released.test.mjs builds the "old store" with the released plane's own signed bytes (its stated principle); g42-storage-seam uses screens-settings' kit/fixtures over the real door.

## Tables by provider (modules.json order)

### record-grammar (1)

| # | test file:line | user | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| RG1 | P/findings.test.mjs:25-47 (`projMd`:25, `infoMd`:29, `lensMd`:32, `inquiryMd`:40); P/g54-seed.mjs:13-19 (`projMd`:13, `inquiryMd`:16); P/step.test.mjs:11, stats.test.mjs:26, roster.test.mjs:33 (same text), t50.test.mjs:71 (with `refs`); P/g55-alarm-l-entry.mjs:22 and g55-L.probe.mjs:29 (`info`); P/g57-heal-entry.mjs:14 (`cleanInqMd`); P/r7-contention-entry.mjs:49-52, r8-headofline-entry.mjs:71-74, l77-size-child.mjs:54-57, shape/harness.mjs:255-258, r8-wave-kit.mjs:43-48 (information bundle.md, one text five times) | plane | bundle documents (project@1, information@1/2, inquiry@1, bias lens) handed to `promotionOf(ctx).promote` | markdown typed per file; six copies of `projMd`, five of the information text | the real promote accepts them (the tests assert `ok`), but nothing ties the texts to the grammar: `infoMd` exists in provenance/fixture.mjs and reevaluation/fixture.mjs, `cleanInqMd` in ratification/fixture.mjs, `inquiryMd` in reevaluation/fixture.mjs | B |

### pdf-pixels (28) (pdf-worker/src/pagepixels.mjs, picturepixels.mjs)

| # | test file:line | user | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| PX1 | P/t42.test.mjs:375-398; t44.test.mjs:135-158; t43.test.mjs:102-125 (`render` and `picture` arguments of `renderPages`/`renderAsked`) | plane | `renderPageToPixels` / `renderPictureToPixels` answers | `{ok:false, reason:"PAGE_HAS_TEXT_LAYER", why, page}`; `{ok:false, reason:"UNSUPPORTED_JPEG_PROCESS", jpeg:"UNSUPPORTED_PROCESS", process:"lossless-huffman", page}`; `{ok:false, reason:"NOT_A_PDF"}`; `{ok:false, reason:"IMAGE_TOO_LARGE"}`; `{ok:true, mediaType:"image/png", bytes:<empty or over-cap>}`; a throw | reasons yes (`pagepixels.mjs:105-120` lists NOT_A_PDF, NOT_A_PICTURE, NO_SUCH_PAGE, PAGE_HAS_TEXT_LAYER, NOT_IMAGE_ONLY, UNSUPPORTED_JPEG_PROCESS, IMAGE_TOO_LARGE); `jpeg:` key unknown; the throw and the over-cap PNG are the plane's own fault inputs. The same file already feeds the real renderer real bytes for three of these (t44:87-117, t43:76-100: progressive JPEG, 20000x15000 frame, vector PDF) | B (refusals) / C (throw, over-cap PNG) |

### ocr-worker (32) (and pdf-worker (31))

| # | test file:line | user | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| OC1 | P/r7-contention.test.mjs:29-31; P/r7-lastms.test.mjs:49-50 | plane | OCR_WORKER `POST /transcribe`; PDF_WORKER binding | `OCR_WORKER: async () => { wait 25 s; return new Response("page 1 read") }`; `{fetch: async () => { advance(25_000); return {ok:true} }}` for both OCR_WORKER and PDF_WORKER | the bodies are never read (the readHeld stand-in discards them); a real OCR answer is `{ok, engine, ..., pages:[{page, regions}]}` (part 1, ocr-worker row) so these are not answers of the member | B (a `slowMember(ms)` fixture from the members) |

### sheet-worker (33)

| # | test file:line | user | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| SW1 | P/t33.test.mjs:206-212 | plane | SHEET_WORKER `POST /recompute` refusal | `{ok:false, reason:"NOT_ENABLED"}` | reason yes; the real refusal also carries `not_recomputed` and `detail` (`sheet-worker/src/member.mjs:135`), and the plane's `sheetRecompute` returns it as given | B |

### file-scanner (34)

| # | test file:line | user | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| FS1 | P/t36.test.mjs:42-57 (`scanner()`); used at :159-206, :284-316 | plane | FILE_SCANNER `/scan`, `/provider/reputation` | verdict `{tool, engine, engine_version:"1.4.1", signatures:"27000", scanned_at, result:"clean", findings:[]}` (no `capture_sha`, no `latency_ms`); `{ok:true, listed:false, categories:[]}` | NO for `signatures`: real is `{main, daily, bytecode, published}` (`file-scanner/src/clamav.mjs:33-39`); real verdict also has `capture_sha`, `latency_ms` (`clamav.mjs:77-79`); real reputation answer also has `risk`, `source` (`providers/routes.mjs:242`) | A |
| FS2 | P/r8-headofline.test.mjs:25-26, 40-55; P/r8-heal-door.test.mjs:22-23, 39-48 | plane | FILE_SCANNER `/scan`, `/render` | `clean(sha)` = `{capture_sha, tool, engine, engine_version:"1.0", signatures:{main:62, daily:27000, bytecode:335, published}, scanned_at, result:"clean", findings:[], latency_ms:1}`; `/render` answers JSON 422 `{ok:false, code:"NOT_RENDERED"}` | `clean` matches the real shape (and differs from FS1's); `/render` NO: real passes a PDF of page images through (`file-scanner/src/render.mjs:1-2`); `NOT_RENDERED` is in no src file; the two `clean` copies are identical to each other | A |

### record-core (36)

| # | test file:line | user | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| RC1 | P/t33.test.mjs:291-292 (`bundle()` in seedRosters); t42:450-451; t43:167-168; t46:323-324; t48:160-161; t50:84-85; sweep.test.mjs:147-148; store.test.mjs:149-152 (built from `PRAGMA table_info`, `"x"`/0 filler); round6-extraction.test.mjs:87-88, 124-125, 170-171 | plane | the `bundles` row a promotion leaves | raw `INSERT INTO bundles (...)` with `bundle_sha:'x'`/`'sha'`, `created:'t'` | a real `promote` leaves a row with a real digest and row_version; `promote` is used for the same purpose in step/stats/roster/findings, so the raw rows are avoidable | B |
| RC2 | P/t50.test.mjs:96-101; disclosures.test.mjs:127-133; round6-extraction.test.mjs:89-92, 112-113, 126, 176-177 | plane | `register` and `files` rows (capture homes, file digests) | raw `INSERT INTO register ... 'utf8', 1` and `INSERT INTO files ... content 'x', bytes 1`; disclosures overwrites a promoted `data/provenance.json` with a hand document (:131-133) | `promote(... register:[...])` writes both; in disclosures the same test already promotes a real text and uses `provDoc` | B |
| RC3 | P/t42:47-56, t43:128-137, t44:57-63, t46:305-312, t36:29-40, sweep.test.mjs:20-31, hosts.test.mjs:34, split.test.mjs:86, and part 1's files | plane | the CAPTURES R2 binding | a private in-memory bucket per file, in at least four shapes (counting `calls`; with `body`/`text`; with `list`; only `get/head/put`) | platform binding, not a module's answer; published bucket stand-ins exist: `multipartBucket` (record-core/storage.mjs), `bucketStandIn` (case-carriage/fixture.mjs) and are used elsewhere in the same directory | B |
| RC4 | P/shape/harness.mjs:157-168 | plane | R2 multipart upload | `createMultipartUpload` whose `complete` stores a zero-length `Uint8Array` with `length` redefined as the size, so the whole "exists" without bytes | platform stand-in, stated in its comment; `multipartBucket` exists | C |
| RC5 | P/fixture.mjs:260-310; P/door.test.mjs:29-50 | plane | Durable Object storage and `cloudflare:workers` | node:sqlite behind `sql.exec`, a stand-in `DurableObject` class; "nothing else is stubbed" (fixture.mjs:256-259) | platform stand-in, deliberate | C |

### membership (37)

| # | test file:line | user | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| ME1 | `INSERT ... INTO members` in 28 files: ask:35-40, compose:108,122, declared-ops:39, disclosures:117, docket:125, findings:62, g54-seed:38, g55-L.probe, g55-alarm-l-entry, hosts:41,60, r7-founder:21, r8-headofline-entry:85, roster:42, stats:35, step:20, t33 (4), t36, t41 (5), t42 (2), t43 (2), t45 (2), t46 (2), t47:29, t48:55, t50 (4), watch (2), watchdog:195-196, wizards (2); also `UPDATE members SET capabilities` g57-heal-entry:32 | plane | membership `memberAdd` / `enroll` (`membership/index.mjs:1289, 1293`) | `INSERT INTO members (member_id, cover, handle, role, status, capabilities, created, updated) VALUES (..., 'active', '["contribute"]', 't', 't')` | the row shape is plausible but `created:'t'` is not an instant and the invite/enrol path (which also writes sight and sessions) is skipped | B |

### ai-accounts (39)

| # | test file:line | user | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| AA1 | P/t46.test.mjs:148, 160 (`AWAY = {ok:false, reason:"PROJECT_AI_KEPT_AWAY", code, detail:"kept away for the test"}`); P/t48.test.mjs:192-199 (`{ok:false, reason:"AI_KEPT_AWAY", code:"AI_KEPT_AWAY"}`) | plane | `aiKeptAway` (the refusal the draft/ask doors relay) | the instance's `aiKeptAway` is replaced by a function returning the typed refusal | real `AI_KEPT_AWAY` carries `check:"C-29.31"`, `translation`, `keep_away:{reason, set_by, set_at}` (asserted by ask.test.mjs:106-117, which uses the real one); the two typed shapes omit them, and `PROJECT_AI_KEPT_AWAY` is shaped by hand; the real project-level keep-away is reachable (`aiKeepAwaySet`) | A |

### credentials (40)

| # | test file:line | user | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| CR1 | P/g42-storage-seam.test.mjs:31, 37-41, 47 | plane | `credentials` route `session` (`credentials/index.mjs:554-569, 2104`) | the store stub answers `/session` with `{ok:true, result:{session:{role, capabilities, administer, rootOfTrust, handle}}}` and lets every other route reach the real object | real `session()` adds `device`, `locked` and decides `rootOfTrust` from the row (:569); the minimal object is typed by hand; control-plane's harness holds the same typed shape (part 1, credentials row) | A |
| CR2 | `INSERT INTO sessions` in ask.test:42, declared-ops:44, g55-alarm-l-entry:77, g57-heal-entry:37, r8-headofline-entry:86, t41:195, t45:177, t46:58, t47:152, t48:61, t50:184 | plane | the session credentials mints (`credentials/index.mjs:502`) | `INSERT INTO sessions (token_sha, role, expires, created[, device, last_active, reauth_until])` | the real mint writes `device`, `last_active` and the reauth window; some tests hand-write those columns, some leave them default | B |

### provenance (43)

| # | test file:line | user | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| PV1 | P/disclosures.test.mjs:131-133 | plane | the provenance document of a captured photo | `{documents:[{file, capture:{method:"acquire", grade:"B", sha256, encoding, bytes, content_type:"image/png"}}]}` (no `locator`, `retrieved`) written over the promoted file | `provDoc({path, text})` from provenance/fixture.mjs is used in the same function for the text file (:122) | B |

### capture-sources (46)

| # | test file:line | user | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| CS1 | P/round6-extraction.test.mjs:36-40 (`renderAnswer`, `slowRenderer`) | plane | RENDERER answer (render.mjs) | `{ok:true, html, elapsed_ms, engine:"Chrome", engine_version:"1", viewport, dpr, locale, timezone, navigated_to, status, requests:[], scripts:[], wait:{asked:RENDER_DEFAULTS.wait, fired:"networkidle"}}` | ok-answer fields as part 1's capture-sources row (same typed answer a ninth time); `wait.asked` here is the real constant, unlike plane/fix4b-r77-owners.test.mjs:98 | A |

### acquisition (47)

| # | test file:line | user | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| AC1 | P/round6-extraction.test.mjs:127-129, 173-175; P/r7-contention-entry.mjs:45-47; P/l77-size-child.mjs:51-53; P/shape/harness.mjs:234-237 (held-feed branch) | plane | `acquire` / `uploadCapture` document (provenance.json `documents[]`) | `{file, locator, retrieved, profile:{format:{format, confidence:"certain", signals:[]}}, authority_state:"undetermined", authority_basis:"held", origin:{kind:"named_request"}, capture:{sha256, bytes, content_type, method:"upload", grade:"C", actor_class:"member", encoding:"binary"}}`; round6 variants add `transport:{http_headers}` and `parts` | partial: the real upload document (the harness's other branch, harness.mjs:238-243; r8-wave-kit.mjs:34-41) carries more keys; round6-extraction's two copies differ from each other (`profile.format.format:"undetermined"`) | A |
| AC2 | P/fix6-pending.test.mjs:28-34, 52, 71, 82-84, 89-96 | plane | acquisition `owedFetch` / `owedRun` answers | `{ok:true, done:true}`; `{final:true, reason:"FETCH_REFUSED"}`; `{ok:false, reason:"UPSTREAM_SLOW"}`; `{ok:true, done:true}` for `owedRun`; header calls them "a scripted double of the interface the plan states" | `FETCH_REFUSED` and `UPSTREAM_SLOW` are in no src file; the real chain's shape is part 1's row (acquisition #1). The seam test at :231-254 runs the real `acquire` then real `owedFetch` (good). Line 89-96 is dead (finding 3) | A |

### reading-pipeline (53)

| # | test file:line | user | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| RP1 | P/t42.test.mjs:452-454; t43.test.mjs:169-171; t46.test.mjs:325-326 (`writeReading({reading:{content_type:"generic", reader_version:1, read_from_text:false, found:false, entities:[], facts:{}, at, basis:"b", text_source:null, page_count:1}})`); P/round6-extraction.test.mjs:108-110 (`OLD()` = `{found:false, entities:[], failure:"final", content_type:null, text_source:null, basis}`) | plane | the "not read as text" reading a scanned page leaves | two different hand-built readings for the same state | the real reader's reading for such a file has more keys (part 1: reading-pipeline #3); the two shapes differ from each other, so at most one is right | A |

### extraction (54)

| # | test file:line | user | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| EX1 | `extractionOf(ctx).readHeld = ...`: P/watchdog.test.mjs:124 (`{ok:true, read:true}`); P/r7-contention-entry.mjs:63-66, 72 (`{ok:true, more:true, read:true, detail:{piece:n}}` five times then `{ok:true, read:true}`; an OCR-calling owner); P/l79-entry.mjs:18; P/l75-entry.mjs:39, 50, 57-61 (`{ok:true, read:true, owed:<bool>, why:"READING_HELD"\|undefined}`); P/r7-lastms.test.mjs:52-57; P/fix6-pending.test.mjs:32, 71, 135, 145, 156, 175-178 (`{ok:true, more:true, detail:{cursor:"c1"}}`) | plane | extraction `readHeld` (extraction/index.mjs:861; part 1, extraction #1-#2) | scripted owner answers | same verdict as part 1: `read:true` always carries `bundle_id`/`found`; `READING_HELD` is `read:false`; `{cursor}` is not what a piece answers (`detail:{read_through,total}`); l75-entry's `read:true` with `why:"READING_HELD"` contradicts part 1's reading of :881-885 | B (re-point to part 1's `readHeldAnswers`) |
| EX2 | P/r7-lastms.test.mjs:18-20, 38; P/r7-lastmem.test.mjs:22, 41, 59-61 (`pendingOf(ctx, {workers:{reading: ...}})`): `{ok:true, more:true, detail:{cursor:1}}`, `{ok:false, reason:"SLOW"}`, `{ok:false, reason:"AGAIN"}`, `{final:true, why:"NO_TEXT"}` | plane | the owner answer the plane's ledger classifies | answers typed to drive the ledger's outcome (`finished/retried/more/final`) | the ledger's own contract; but they are extraction's answer shapes, so the same fixture serves | B |
| EX3 | P/t33.test.mjs:283-316 (`seedRosters`): `INSERT INTO entities`, `readings (reading '{}')`, `capture_text (extent_kind 'doc-para', chain_kind 'text', ref 'para n')`, `resolutions`, `calc_tables (schema_json '{}', declared_by 'class:daemon')`, `calc_table_bytes` | plane | extraction `writeReading`/text index, entities `createEntity`, calculations `declareTable` | whole held rosters laid as rows | the comment says "seeded as the modules that own them hold them"; entities and calculations expose real writers (used in g55-alarm-l-entry.mjs:49-72); `capture_text` rows skip the index (`capture_text_state`, fts) a real read writes | A |

### lines (58), local-facts (59), standards (63)

| # | test file:line | user | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| LF1 | P/compose.test.mjs:120 | plane | local-facts `factsDue` | `localFactsOf(ctx).factsDue = (a) => { ...; return {ok:true, due:[], unknown:[]} }` | the real instance is the same object; an empty due list is producible with real facts | A |
| ST1 | P/t33.test.mjs:191-204 (`retrievalTerms({standards, lines, sql})`) | plane | standards `standardsFor`, lines `holderAt` | `{ok:true, items:[{standard:"STD-1"},{standard:null}]}`; `{holder:"ENT-p"}` / `{undetermined:"no line"}`; a `sql.exec` answering two entity rows | shapes unverified (not compared with standards/lines code); the wiring function is the plane's | A |

### bias (70), inquiry (79)

| # | test file:line | user | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| BI1 | P/findings.test.mjs:134-135 (`empty = {list:()=>[], read:async()=>null, visible:async()=>false}`) | plane | inquiry `inquiryFindings` registered as bias's `finding` work products | an object occupying the slot first, as the negative control | its content is never read; `inquiryFindings(ctx)` is the real thing the main test uses | C |

### hypotheses (80)

| # | test file:line | user | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| HY1 | P/r42-entry.mjs:12-46 | plane | hypotheses' notes tables as an earlier release left them | `CREATE TABLE member_notes (note_id INTEGER PRIMARY KEY AUTOINCREMENT, ...)`, `member_note_turns`, seven notes, five turns, two deleted | no: the current code cannot make the old shape; the DDL is typed from memory of the old release. `migrate-released.test.mjs` shows the alternative (the released plane's own bytes make the store) | A |

### ai-runs (89)

| # | test file:line | user | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| AR1 | P/t41.test.mjs:163-166 (columns read from `PRAGMA table_info(ai_runs)`, `"x"`/0 filler for not-null columns, `status:'running'`); P/sweep.test.mjs:150-152 (`INSERT INTO ai_runs (run, status, context_type, context_id, principal_plane, principal_claude, created, updated, expires, state)`) | plane | ai-runs run-opening function | raw run rows | a real run is opened by ai-runs' own code (its R-numbers: dispatchMemberRun and the open path); the t41 filler derives columns from the schema, so it cannot drift but ignores invariants | B |

### answers (95)

| # | test file:line | user | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| AN1 | P/t41.test.mjs:215-223 (`REFUSED = {ok:false, reason:"AI_LIMIT_REACHED", code, detail:"the test's limit"}` as `a.askAccount`) | plane | answers `askAccount` refusal | typed refusal swapped onto the instance | producible: the same test does it for real at :226-233 (`aiLimitSet` + `countAskUsage`), so the typed copy is redundant | B |

### agent-worker (100)

| # | test file:line | user | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| AW1 | P/t42.test.mjs:58-67 (`agentWorker`), 59-61; t43.test.mjs:139-146; t44.test.mjs:65-71; t46.test.mjs:313-315, 348 (`worker(status, answer)`) | plane | AGENT_WORKER `POST /transcribe`, ok answer | `{ok:true, engine:"claude-test", version:null, pages:[{page,text}], not_transcribed:[], usage, calls}`; t44 has no `usage`/`calls` | real is `{ok:true, engine, version:null, pages, not_transcribed, label:TRANSCRIBE_LABEL, usage, calls}` (`agent-worker/src/transcribe.mjs:30, 184`): none of the four copies has `label`; t44 lacks `usage`/`calls` (the real keys are always present, possibly null) | A |
| AW2 | P/t42.test.mjs:349 (`{ok:false, reason:"MODEL_SILENT", ending:"silent", usage, calls}`), :358 (`{ok:false, code:"BAD_PAGES"}`); t46.test.mjs:248-253 (REFUSED `SIGNIN_TOKEN_REFUSED`, 401), :333 (`{ok:false, code:"BAD_PAGES", detail}`, 400), :340 (`NO_ACCOUNT`, 409) | plane | AGENT_WORKER refusals | typed refusals; t42's are answered HTTP 200 | real refusals are `{ok:false, reason, code, detail, worker:"agent-worker", ...}` (`agent-worker/src/index.mjs:258-259`); MODEL_SILENT is 502 and also carries `detail_from_model` (`transcribe.mjs:176-181`); t46's statuses (400, 409, 401) match the real ones, t42's 200 does not; none carries `worker` | A |
| AW3 | P/t41.test.mjs:184; t45.test.mjs:167; t46.test.mjs:35 (`DRAFT_ANSWER`), 46; t47.test.mjs:143; ask.test.mjs:17-18 (`DRAFT`) | plane | AGENT_WORKER `POST /draft`, ok answer for writinghelp etc. | `{ok:true, draft:{text:"t"}, label:{kind:"machine"}}`; ask.test.mjs adds `task`, `usage`, `calls` | real is `{ok:true, task, draft, ...labelled, label:{kind:"machine"}, usage, calls}` (`draft.mjs:253, 480`): four copies lack `task`/`usage`/`calls`, one has them | A |
| AW4 | P/t48.test.mjs:42-45; P/declared-ops.test.mjs:31-34 | plane | AGENT_WORKER `POST /draft` for `readtranslate` | `{ok:true, translation:"[es] text", language, usage:{input_tokens, output_tokens}, calls:1}` | NO. Real is `{ok:true, task, draft:{text, language, from_language}, label, usage, calls}` (`agent-worker/src/draft.mjs:429-433, 480`). `plane/ask.mjs:449` reads `answer.translation`, a key agent-worker never writes: see finding 2 | A (priority) |
| AW5 | P/ask.test.mjs:27-28; t41:185; t45:168; t46:49; t48:49; t50:162-163, 171; declared-ops:34 | plane | AGENT_WORKER `POST /ask` NDJSON stream | `{"event":"step","step":"interpreting"}` and `{"event":"answer","ok":true}` lines | events and the step name are real (`agent-worker/src/ask.mjs:28, 278`); the real `answer` event also has `answer`, `withheld` (:34); the plane relays the stream unchanged and the tests assert only that | C (opaque relay); B if an `askStream()` fixture is wanted |
| AW6 | P/t50.test.mjs:171 | plane | AGENT_WORKER non-/ask call (sign-in door) | `{"ok":false,"reason":"NOT_SIGNED_IN"}` | NO: `NOT_SIGNED_IN` is a credentials check (`bio-plane/src/credentials/checks.mjs:183`), not a code agent-worker answers; its sign-in codes are `agent-worker/src/signin.mjs:50-57` (e.g. `SIGNIN_NOT_HELD`) | A |
| AW7 | P/t42.test.mjs:365; ask.test.mjs:327; t47.test.mjs:117 (`{fetch: async () => new Response("{}")}`) | plane | AGENT_WORKER fault inputs (throws, non-JSON, `{}`) | faults | fault injection; the throw and the non-JSON are what the plane's AGENT_WORKER_SILENT branch is for | C |

### publication (108)

| # | test file:line | user | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| PB1 | P/g54-seed.mjs:13-81 (used by g54-sweep, g54-l-entry, g57-heal-entry) | plane | publication `storeCaseDocument`, `commitCaseEdition`, `commitEdition`; case document text | hand-written `projMd`/`inquiryMd`/`caseDocText`, `sigArmored:"-----BEGIN SSH SIGNATURE-----\nsig\n-----END SSH SIGNATURE-----"`, `attestorKey:"AAAAC3NzaC1lZDI1NTE5AAAAIKEY"`, `gateVersion:"plane-gate/test"` | the commits are the real module calls (header: "ported from ratification's g54-entry.mjs"); the signature and key are not real, and the file duplicates ratification's seed, which g54-l-entry already imports as its default export (`ratification/g54-entry.mjs`) | B |

### docket (110)

| # | test file:line | user | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| DK1 | P/watch.test.mjs:27-39 (`entry()`, `DOCKET`); P/docket.test.mjs:128 (`coreDue = (a) => ({ok:true, cases:[]})`) | plane | docket's public entries answer (R24) and `coreDue` | `{ok:true, result:{ok:true, case, group, entries:[{seq, entry, digest, json, fields, signature, published_at, taken_back:null}], captures:{}, captures_omitted:true, last_entry, feed:"x"}}`; entries hand-signed with `signSshsig` | entry keys match `docket/index.mjs:1000-1001`; `feed:"x"`, `captures:{}` are placeholders I did not compare; the docket module signs its own entries | A |

### network-notices (113)

| # | test file:line | user | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| NN1 | P/t48.test.mjs:180-183 | plane | network-notices `noticesOf` (`network-notices/index.mjs:861-885`) | `{ok:true, project, notices:[{notice:"NOTICE-1", revisions:[{revision, json:{wording, body, matter}}]}]}`; `{ok:false, reason:"NO_SUCH_PROJECT", project}` | real notices also carry `status`, `opened_at`, per-revision `digest`/`published_at`, `attestations`, `level`, `next_monthly`...; the plane reads the latest revision's `json`, which a real notice supplies | A |

### action-clocks (130), filing-templates (132)

| # | test file:line | user | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| AK1 | P/compose.test.mjs:119 | plane | action-clocks `calendarFactsRead` | `{ok:true, paths:[{path:"profile:p/time_zone", actions:[{action:"ACT-1", project:null, created_by:"bob"}]}]}` | shape unverified; the real instance can hold such an action | A |
| FT1 | P/compose.test.mjs:115-118 | plane | filing-templates `reviewsRequested` | `{ok:true, items:[{template, version, name, kind, member, asked_by:{id,name}, asked_at}], limit:500, truncated:false, cursor:null}` | shape unverified; a review can be asked through the real op | A |

### instance-setup (151)

| # | test file:line | user | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| IS1 | P/t33.test.mjs:166-178 | plane | instance-setup `officeOf`, `officeEntityOf` (via `officePorts`) | `officePorts(() => ({officeOf: (id,p) => id==="ENT-1" ? {role:"Clerk", body:p} : null, officeEntityOf: ...}))`, and `{}`/throwing variants as controls | the plane's `officePorts` is under test; the answered office shape is typed; the real answer comes from seeded offices (`officesseed`) | A |
| IS2 | P/t48.test.mjs:252-253 | plane | instance-setup `release_notices` row (its R88) | `INSERT INTO release_notices (version, date, manifest '{}', security 0, notes '{}', sig 'sig', found_at)` | the real row is verified before it is stored; here `sig:'sig'`, `manifest:'{}'` | B |

### screens-intake (163)

| # | test file:line | user | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| SI1 | P/r7-contention-entry.mjs:49-58; r8-headofline-entry.mjs:68-81 (`/r8/file`); l77-size-child.mjs:54-64; shape/harness.mjs:255-276; r8-wave-kit.mjs:43-59 (`file()`); (part 1: fix4b-r77-owners.test.mjs:25-42 `promoteDoc`) | plane | the capture screen's filing of an uploaded document (screens-intake's composition: bundle.md + data/provenance.json + data/dataset.json + the file, `register`) | the whole composition typed again in each file; the document is the upload's own in r8-headofline-entry and r8-wave-kit but hand-made in the other three | the plane's `promote` accepts all six; nothing ties any copy to what the screen sends. Part 1 named the fixture `promotionBodyFor(doc)` | A |

### control-plane (169)

| # | test file:line | user | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| CP1 | P/round6-extraction.test.mjs:24-33 (`doAnswer`), 33 (`storeSilent`) | plane | control-plane's `doAnswer` relay | a copy: "control-plane's doAnswer, R23/R25, as extraction's relays tests state it"; `storeSilent` = 502 `{ok:false, reason:"STORE_DID_NOT_ANSWER", op}` | `STORE_DID_NOT_ANSWER` is real; `doAnswer` is not exported by control-plane/index.mjs (`grep` finds it as an internal), so the copy cannot be replaced until it is | A |
| CP2 | P/unpack.test.mjs:17-26, 40-90 (`[200,{ok:true,result:{unpacked:1}}]`, `[409,{ok:false,reason:"ARCHIVE_NOT_HELD"}]`, `[503,{ok:false,reason:"STORE_DID_NOT_ANSWER"}]`, "throw"); P/t36.test.mjs:73-75 (`{ok:true,result:{unpacked:1}}`); P/r108-project.test.mjs:17 (`{ok:true, complete:true}`) | plane | control-plane's `op=unpack` (daemon door) answers through `SELF` | three different typed success bodies | NO for `unpacked`/the bare `complete:true`; real incomplete answer is 200 `{ok:true, result:{ok:true, complete:false, waiting_on:{code}}}` (`control-plane/index.mjs:2453`), never fed to `unpackOutcome` (finding 4) | A |
| CP3 | P/r8-timing-hook.test.mjs:96, 109 (`mock.module(control-plane/index.mjs, {caseReader: async () => reader})`, readers `{viewer:"member:ada", cls:"member"}`, `{viewer:""}`, `{viewer:"class:member", cls:"member"}`) | plane | control-plane `caseReader` (`control-plane/index.mjs:400-405`) | the readers are typed | shape matches (`{viewer, cls}` or `{silent, correlation}`); a real session row (CR2) would let the real reader run | B |

### plane (170) (the plane as its own provider)

| # | test file:line | user | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| PL1 | stand-ins of the plane's own Store namespace/stub: t42:154-156, 422-423; t43:208-211; t44:166-169; t45:378-380 (`draft`, `fetch` answering `{ok:true,result:{status:200,body:{ok:true}}}`); body.test.mjs:19-22; g83-location:25-30; t34:17 (`ratificationWorker` over the real door); split.test.mjs:84-86; declarations.test.mjs:94 | plane | the plane's Store (RPC `ask`/`draft`/`fetch` and the control-plane envelope `{ok, result}`) | recording stubs for the Worker half's arms | the provider is the plane itself; the envelope is control-plane's and matches door.test.mjs:141-171 | C (B where g42 and t46 already drive the real object instead) |
| PL2 | P/watchdog.test.mjs:16-22, 24 (`binding(answers)`, `ok()`) | plane | the plane's Store `watchdog(at)` | `{alarm_at:null, last_run:null, running_since:null, rearmed:false, why:null}` | plane's own method; fields as the real one's (R103 fields in :181) | C |
| PL3 | platform-check entries: `Held`, `Contended`, `Watched`, `Headline`, `G54Plane`, `G57Plane`, `G55Plane`, `Seeded`, `TempBoot` (subclasses of the real `Store` with debug routes); r8-timing-hook.test.mjs:19-34 (child process `mock.module` of ratification/extraction/attestation/monitoring/capture handlers returning `new Response("{}")`, asserting only that `stateTiming` reaches them) | plane | the real Store; other modules' op handlers as opaque probes | real object plus routes; handler stand-ins whose answers are unused | wiring probes; no provider answer is asserted | C |
| PL4 | fault injection: shape/harness.mjs:329 (`readHeld` that throws), :184 (writes refused), kill/restart; g54-l-entry.mjs:49-62 (PUBLISHED proxy that throws once or hangs); sweep.test.mjs:55-56; g57-heal bucket modes | plane | R2/storage faults | faults | the fault is the input | C |
| PL5 | `globalThis.fetch` network stubs: sweep.test.mjs:125-139, watch.test.mjs:52-60, hosts.test.mjs:49-50, fix6-pending.test.mjs:236-240, round6-reevaluation.test.mjs:38-42 | plane | the network | pages and a docket answer (the docket part is DK1) | the network is outside every module | C |

## Summary

### Published fixtures each provider would need (this part)

- **record-grammar / promotion**: `projectBundle(title)`, `informationBundle(id)`, `inquiryBundle(id)` bodies made by the real grammar (replaces about 14 private copies); `seedBundle(ctx, ...)` through the real `promote` (replaces raw `bundles`/`register`/`files` inserts)
- **pdf-pixels**: byte inputs the real renderer refuses with `PAGE_HAS_TEXT_LAYER`, `UNSUPPORTED_JPEG_PROCESS` (lossless), `NOT_A_PDF`, plus the three already used in t44
- **ocr-worker / pdf-worker**: `slowMember(ms, answer)` for a service binding
- **sheet-worker**: `notEnabledAnswer()`
- **file-scanner**: `scanVerdicts(targets, {result})` and `reputationAnswer(...)` made by the real handler over a fake engine; a `/render` answer that is a PDF
- **record-core**: `multipartBucket` / `bucketStandIn` as the one R2 stand-in (already published); DO storage stand-in stays with test-support
- **membership**: `enrollMembers(ctx, [{id, role}])` through the real `enroll`
- **credentials**: `signedInSession(ctx, member, {reauth})` through the real mint; `sessionAnswer(...)` made by `session()`
- **ai-accounts / answers**: `keptAwayRefusal({project?})` and `limitReachedRefusal()` made by the real code
- **provenance**: `provDoc` for any document (exists)
- **capture-sources**: `renderAnswer()` (part 1)
- **acquisition**: `uploadedDocument(bytes, {name, type})` made by the real `uploadCapture`; `owedFetchAnswers` (part 1)
- **reading-pipeline**: `notReadAsText(page_count)` reading made by the real reader
- **extraction**: `readHeldAnswers` (part 1); `heldRoster(...)` seeding a reading plus text index plus resolutions through the real writers
- **local-facts, action-clocks, filing-templates, standards, lines**: a way to hold a real fact/action/review/standard/holder, so the canned `factsDue`, `calendarFactsRead`, `reviewsRequested`, `standardsFor`, `holderAt` are not needed
- **hypotheses**: a legacy-notes store made by the released bytes (the migrate-released approach), not typed DDL
- **ai-runs**: `openRun(ctx, {...})`
- **agent-worker**: one `agentWorkerBinding({transcribe, draft, ask, signin})` whose answers come from the real handlers over a fake model; it must produce the real `/transcribe` ok and refusals (with `label`, `usage`, `calls`, `worker`, status), `/draft` for every op including `readtranslate` (`draft:{text,language,from_language}`), and `/ask` events
- **publication / ratification**: `seedEdition`/`completeEdition` published once (ratification's g54-entry.mjs), with a real signature
- **docket**: `signedEntries(case, n)` made by the module
- **network-notices**: `noticesAnswer(project)` made by `noticesOf`
- **instance-setup**: `releaseNoticeRow(version)` through its verifier; `seededOffices()`
- **screens-intake**: `promotionBodyFor(doc)` (part 1) used by all six filing copies
- **control-plane**: export `doAnswer`; `unpackAnswers()` (done, refused, incomplete, no-session) made by the real door
- **plane (as provider)**: nothing; keep the Store stubs C

### Rows by user module (A / B / C)

| user module | A | B | C | total |
|---|---|---|---|---|
| plane (this part) | 25 | 17 | 10 | 52 |

A: FS1, FS2, AA1, CR1, CS1, AC1, AC2, RP1, EX3, LF1, ST1, HY1, AW1, AW2, AW3, AW4, AW6, DK1, NN1, AK1, FT1, IS1, SI1, CP1, CP2. B: RG1, PX1, OC1, SW1, RC1, RC2, RC3, ME1, CR2, PV1, EX1, EX2, AR1, AN1, PB1, IS2, CP3. C: RC4, RC5, BI1, AW5, AW7, PL1, PL2, PL3, PL4, PL5. (PX1 is B for the refusals and C for the throw and the over-cap PNG; AW5 is C with a B option; PL1 is C with a B note where the real object is already driven.) Rows are seams, not files; a row naming many files counts once. Added to part 1's plane rows (5 A, 3 B, 6 C), the plane user has 30 A, 20 B, 16 C = 66 rows known so far, not counting the files listed as not read.

### Where the same pattern is likely in the files not read

P/shape/*.probe.mjs and g44-gen (the feed and document shapes come from harness.mjs, so SI1/AC1 likely recur); the rest of g123f-cells and the rest of harness.mjs (cells and workbook answers generated by `sheetGenerate`, which is input bytes, class C if so).
