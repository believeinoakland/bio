# Fix round 4 of T51: the plan

**Status** · In force (K4429): drafted 2026-10-21 by a planning worker for BOB, reviewed whole by BOB with K4429's changes. Planned whole (K4297 (3)) under K4426 (understood, tested, fixed, then deployed): every STILL and NEW row of the round-3 re-walk (`walk-T51-rewalk3/A.md`, `B.md`) and P7-P10 (`lane-performance/HANDOFF.md`), grouped by cause, one job per module, providers before users, one redeploy only when section 2's four fields are closed for every cause. Template: `fix-round-3-T51.md`. Read whole: the round-3 plan and diagnosis, A.md, B.md, the performance HANDOFF, `fix-round-3-survivors.md` (classes a-h cited as "class"), `rulings-active.md` (K4426, K4427), `modules.json`, and the code named in each cause (`tranche/T51` at 8ff3a075f4).

## 0. Rules for every START (K4426 and the survivors' process causes)

- **R-FOUR.** Each cause below has four fields: (1) root cause with evidence (file:line, what happens), or **"root cause unknown"** and then the job's **first step is a diagnosis that reports to BOB before any fix is written** (BOB releases the fix step); (2) why the tests and fixtures missed it and the **test-gap fix** (which test or fixture changes); (3) a **failing-first test on the walker's exact case**, shown red in the job's record, then green; (4) where behaviour depends on the live platform, a **check at the platform's real shape before the deploy**, in one of four forms: **L** local workerd/miniflare run with the real limits (128 MB object memory, `waitUntil` cut about 30 s after the response, 25 s door bound, service binding) on the real-size file; **P** a read-only probe of the smoke copy (reads and `scanstatus`, no write, no capture); **F** a fixture saved from the live record or site and replayed; **N** none (pure code). A job that cannot run its L or P says so in its record and the cause stays open.
- **R-SEAM.** Where a cause spans modules, one job is the seam owner (**S**): the last-merged job on the path press -> stored result. Its test runs the whole path with the real, merged providers (inputs made by the member's own acts through the real ops: `conclude`, `acquire`, `knock`; no scripted double of an earlier-merged module, no hand-written answer shape). Providers test the same case at their interface. A seam test needing an unmerged provider is written first and stays red by name until it merges.
- **R-NOTMET.** No "not met", "deferred", REPORT or QUESTION may hold a cause at a job's end; the job names the smallest thing it needs and BOB answers in section 5 before the wave opens. BOB's merge entry copies each such line into an "Open" list; a cause is closed only when the list is empty (survivors §3.3).
- **R-OLD.** A fix to stored data says "new data only" or adds a repair entry; the re-walk scores old and new records apart (survivors §3.5, K4427). No row found STILL is NR; an NR row carries a dated fixture check.
- **R-LIVE (K4427).** For C5, C84, C13, C14, P7-P10 the job's first step is a measurement, numbers in its record. Every check that needs the live copy is marked **LIVE-CHECK**: a read-only read of the smoke copy, at any time. **No mid-round deploy** (Bob, K4428): the round's one deployment, after every job is merged and the four fields checked, carries every fix proven offline and, for a cause whose stage L cannot name, the logging that names it (the door phase clock, `Server-Timing`); that cause's fix then follows in the next round.
- **R-ONE.** One owning job per cause, with a through-the-door test (R-SEAM); the walker's row is copied verbatim into the job's START and the first test is named for it on the same entry path.

## 1. The round in numbers (section 8 has the table)

- **34 causes in jobs** (14 open from round 3's rows that the re-walk found STILL, 14 new in this walk, P7-P10), in **29 jobs**: wave 0 (priority: C5, P8) **6**, wave 1 **16**, wave 2 **7**. Models **27 sonnet, 2 haiku, 0 opus**.
- **Root cause unknown (diagnosis first, reports to BOB): 8** (C5a/P8, C13b, N-slow-refuse, C70, C14 acts, C49, C59, C48 detail). The rest are stated with file:line.
- Re-walk rows: A 42 table rows (21 FIXED, 8 STILL MAJOR/BLOCKER, 8 MINOR, 2 NEW), B 39 (23 FIXED, 13 STILL, 7 NEW). Every STILL and NEW row and P7-P10 is placed. FIXED and not touched: 44 rows (A 21, B 23), listed in the walkers' files.
- Wording only: 7 lines to `later-ux.md` (section 6); DESIGN: one handoff of 4 asks (section 7); requirement changes 11 (section 5), none changes a requirement's meaning in Bob's sense; one named (RC-R1).

## 2. Every cause, with the four fields

Key: job = module (K4164); **S** seam; *prov* provider; LU wording; NR not a defect. Classes a-h are `fix-round-3-survivors.md`'s.

### Priority

**C5a / P8** (A E07 8.8 MB 504 at 25-36 s `timings {}`, 15.9 MB no answer at 60 s then 504; P8 2.5 MB 502 `STORE_DID_NOT_ANSWER` 17-20 s 3 of 3; B first-try 502 at 36.8 s after a pause) · job **control-plane (S)** + acquisition, extraction, plane.
(1) **Root cause unknown; one hypothesis, probable.** Known: the door's 25 s bound wraps `acquire` and the reading together (`control-plane/index.mjs:2321-2331` -> `captureOp` -> `acquireOp`, then `readAcquired` = `extraction/ops.mjs:110` `acquireReadingOp` -> store `extractread`); `timings` is `{}` because the door reads stages from the object by a second call (`acquireStages`, :2306) which returns `{}` when the object answers none; `acquireReadingOp` relays a silence as `storeSilent("acquire")` (`extraction/ops.mjs:46`), so "acquire 502" may be the reading, not the capture. Ruled out by measurement (round-3 diagnosis): hashing (118 ms/16 MiB), the source (1.7-2.9 s), one part's `head`+`put` (0.27 s each) for a 2.5 MB single part. Hypothesis H: a large PDF's reading runs synchronously in the plane's object (JS PDF/text-unit work plus index writes), exhausting its CPU or 128 MB memory, so the object is busy or restarted, which loses the stage holder (`plane/acquire-timings.mjs`, in memory) and answers the walkers' other calls with silence. Not proved: no stage was ever recorded.
(2) Missed: the diagnosis was "inferred" (class b) and the job's test used a scripted store with `put` at 1.5 s on a 16 MiB fixture; no real PDF read in a real object was ever run. Test-gap fix: a real-size PDF fixture (2.5 MB, 8.8 MB, 15.9 MB, saved from govinfo) through the real door, acquisition, extraction and plane objects with the real limits.
(3) Step 0 (reports before any fix): **door phase clock** in `control-plane` (`acquire`, `reading`, `promote`, started and elapsed, in the door's isolate, so it survives the object's death) on every 502/504 as `timings.door`, plus `Server-Timing` per op; run the three PDFs under L and report which phase and why. Failing-first tests: `BUDGET-2025-BUD.pdf` (2.5 MB) and `BUDGET-2025-PER.pdf` (8.8 MB), `BUDGET-2024-APP.pdf` (15.9 MB) answer within 15 s with the capture kept and the reading either present or `pending`, never `{}`; the 140 KB IRS W-9 still answers with its reading. Provisional fix (released after the report): keep first, read after (RC-R1): reading outside the bound when it will not fit (bound minus 8 s, or a PDF over 2 MB), through `readHeld` after the screen's promotion and by the plane's alarm.
(4) **L required** (workerd with 128 MB, 30 s `waitUntil`, 25 s bound, real R2 emulation) on the three files; **LIVE-CHECK (P, read-only):** `op=reading` and `heldcaptures` of INFO-2026-0042, and the three files' real timings on the smoke copy; if L cannot name the stage, the round's deployment carries the phase clock and `Server-Timing` (K4428) and the fix follows; the job's report says which.

**C5b** (A INFO-2026-0042, 21 MB BAC packet re-captured twice: "already holds this document", `op=reading` found:true `reader_found:false`, basis "21036491 bytes in 3 parts, over the 20..."; page "Nothing here") · job **extraction** (prov) + **control-plane (S)**.
(1) **Certain.** The record was promoted in round 2 with a failed reading (`reading-pipeline/index.mjs:1373` `bytesOf`: `total > MULTIPART_READ_MAX` (20 MiB, :42) and no whole object -> `bytes: null`). `extraction.readHeld` (`extraction/index.mjs:636`) answers `READING_HELD` when any `readings` row exists, "a failed one too" (R80, on purpose), and the door's `readUploaded` accepts only `NO_HOME` (`control-plane/index.mjs:2381`). The re-capture holds the whole (21 MB < `MULTIPART_KEEP_MAX` 32 MiB) but nothing replaces the reading. (class c: the 20 MiB limit was nobody's job.)
(2) Missed: `readHeld`'s tests build a home with no reading; none starts from a home with a failed reading. Test-gap fix: a fixture built by the real chain (promote with a failed reading, then hold the whole).
(3) Failing-first: the real chain; second `acquire` of the same address -> `op=reading` has text and `reader_found:true`; control: a reading with text is not replaced; a failed one is replaced once.
(4) **P** (read-only) on INFO-2026-0042; **F**: the 21 MB reading under L (the PDF worker reading 21 MB inside limits); if the read exceeds the object's limits the same deferral as C5a applies.

**C5c** (round 3 J6: past-memory arm "not met", `waitUntil` unhanded) · **acquisition** + **plane**. Resolved in section 5.1.
(1) **Certain.** `acquisition/index.mjs:336-360` `keepFromParts` is called after the answer and relies on `opts.waitUntil`, which nothing hands (job record J6: "runs on by itself"); in the plane's object an un-awaited promise is not kept alive.
(2) Missed: tested "against a scripted double of `putFromParts`" (class b). Fix: a test with the real `record-core` `putFromParts` and a request that ends before the keep.
(3) Failing-first: a 40 MB three-part fixture (past `MULTIPART_KEEP_MAX`): after the answer, the whole is held by the alarm within a minute, and `readHeld` then reads it.
(4) **L** with the real object alarm and R2 multipart.

**C84** (A S-01: the run `started`, `scanstatus` unchanged for 4 min: `last_attempt` 04:17, `last_error "REFUSED:main.cvd:403"`; Security prints "(status 403)"; second press says "a few minutes ago") · **file-safety (S)** + **file-scanner** (prov). C83's "(status 403)" is folded in.
(1) **Certain from the code; the runtime cut inferred.** The plane side works: `file-safety.scanMirror` (`index.mjs:1008-1022`) calls `/mirror?async=1`, keeps its own note `mirror.started` and answers "started"; that note, not the scanner's, makes the second press refuse (`#lastAttempt`, :990-995). The scanner leaves no trace until the run ends: `file-scanner/src/clamav.mjs` `runMirror` (:150) writes `STATE` only at its end (:194 success, :200 caught error); `mirrorAsync` (:215-219) runs it in `ctx.waitUntil`, which the runtime cuts about 30 s after the response, and the first run has nothing to seed (`previous` null, :150) so it downloads ~200 MB (main.cvd ~160 MB; `UPDATE_TIME_MS` 900 s, `container/scanner.mjs:35`). A cancelled invocation cannot reach a write. The cron (`worker.mjs:69`) has a 15 min wall but fires 04:17 only. The stored string is the 04:17 cron's old-format one, so `#noSignatures` (:1065) correctly parses it: "(status 403)" is accurate to a stale record (class e/b).
(2) Missed: `mirror.test.mjs` "async 202 and outcome lands in /version" runs the run to completion under a test harness with no 30 s cut; the seed test starts from a previous set. Test-gap fix: a harness that cancels the invocation after the response (the real `waitUntil` shape) and a first-run case (no previous set).
(3) Failing-first: real handler + bucket double, `POST /mirror?async=1`, invocation cancelled 5 s after the response: `/version` shows `last_attempt` = now, `last_error RUN_STARTED`, a stage; then the cron tick resumes and finishes; Security words for `RUN_STARTED`, `REFUSED:main.cvd:403`, `MIRROR_REFUSED:exit 1: ... 403`. Fix: (a) state written at the start and at each stage (`seed`, `download`, `stage`, `verify`); (b) the async door records a request (`clamav/request.json`), the cron becomes `*/10 * * * *` and finishes an open request or runs daily; (c) `file-safety` words an unfinished run and waits for the tick before its 6 h self-start.
The 15-minute guard (`MIRROR_MIN_GAP_MS`, `scanMirror` :1020) compares against the plane's own `mirror.started`, so a dead run blocks the next press for 15 minutes and the Security page then says "checked a few minutes ago" over a run that never wrote: the guard must read the scanner's `RUN_STARTED` stage (alive or dead after 15 min) not the note. Old data: the stored 04:17 string is overwritten by the first new run (new data only). (4) **L** (workerd: the cancel after the response, the cron handler, R2 streaming of 200 MB with the 10-min container) and **LIVE-CHECK (P, read-only)** `scanstatus`/`/version` of the smoke copy before and after; the real `freshclam` run against the official host is first seen at the redeploy (cannot be checked earlier from a container without egress): section 9 item 3 holds the choice if it answers 403.

**N-slow-refuse** (B: refused captures (api.github.com/zen, timeanddate.com, random.org) 502 at 60.5 s, three times) · **host-governor** (prov) + acquisition.
(1) **Root cause unknown; probable:** `host-governor/index.mjs:28` `cooloff429BaseMs: 60_000` and the governed fetch sleeping out a cool-off inside the request; not read to the line.
(2) Missed: nothing tests a refusing host (class a). Fix: a fixture host answering 403 and one answering 429 with `Retry-After: 60`.
(3) Step 0 diagnosis reports the sleep's line; then failing-first: both hosts answer "refused" in under 3 s with `retry_after_ms`. (4) **F** (two stub hosts); **LIVE-CHECK:** the three refusing sites timed at the re-walk.

**N5** (A NEW: INFO-2026-0080 old unread photo: the page offers nothing to read it) · **extraction** (new op `readheld`, prov) + **screens-inquiry (S)** + control-plane (route).
(1) **Certain.** `screens-inquiry/document.mjs` correctly stops drawing a re-read for an unread copy (J19), and `readHeld` runs only after a new `existed:true` acquire or upload (`control-plane/index.mjs:2389`), so a record already stored unread has no door (class e/c; J19(b) "second half is control-plane's", carried by BOB, never built).
(2) Missed: the old-data case was not a fixture. Fix: the fixture is built by the real chain with the promote request aborted (as the walker did).
(3) Failing-first: that record: "Read it now" is drawn; the press stores the reading ("Read 22 of 22 words"). Repair entry for old data: this op is the repair for every record stored unread. (4) **LIVE-CHECK (P, read-only)** on INFO-2026-0080 before; the press is walked at the re-walk.

### Capture, reading, names

**C9** (A FC-07: `https://www.nps.gov/yose/index.htm`, held under INFO-2026-0083, project Add, Capture: "Open it", nothing filed under the project) · **screens-intake (S)** (provider capture already merged).
(1) **Certain.** `screens-intake/capture.mjs:446-453`: the pre-flight `heldat {check:true}` answering `held:true` draws `a64` and `return null`: no acquire is sent, so `doneAcquire`, the only caller of `alsoFiled` -> `captureseenin` (:520-530), never runs (class d: the diagnosis read `doneAcquire`, not the entry path).
(2) Missed: five tests through `doneAcquire`. Fix: tests enter by pressing the act, not by calling the done function.
(3) Failing-first: that address, that press: the project's `heldcaptures` lists it with `also_here`; the draw says "Filed here as well"; control: a viewer who cannot see the home gets the holder sentence. Fix: one `filedHeld` called from both paths. (4) N (`captureseenin` is merged and walked FIXED on the new-capture path).

**C25** (A FC-18(d): `https://www.irs.gov/pub/irs-pdf/f1040es.pdf`: "f1040es.pdf" on Add, list, Held, Find; "2026 Form 1040-ES" on the document page; "A PDF from www.irs.gov" in Queue/Home) · **acquisition (S)** + **pdfstructure** (prov).
(1) **Certain.** Acquisition answers `title: null` for a non-HTML capture (R98's PDF arm left a stand-in, J6: `extractPdfStructure` reads every page, 355 ms for 33 pages); lists draw the file name; the Queue's subject was written at capture with no title (`taskEnqueue subject: locator`); only the reading's `metadata.title` is drawn on the document page (class c: five screens, no owner).
(2) Missed: each screen tested its own fallback. Fix: one test from capture to Held, Find, Queue, Home.
(3) Failing-first: that PDF: answer `title` "2026 Form 1040-ES" via `pdfTitle` (Info/XMP only, bounded, <100 ms on 15.9 MB); every list and the Queue item name it so; a PDF with no Title falls back to the file name, one rule. Older records: new data only (R-OLD). (4) **F** (the real IRS file and the govinfo PDFs) under L for the 100 ms bound.

**C19** (A FC-10: grca page: "Explore Grand Canyon", "Park footer", "Contact Info", "Mailing Address:", "Search" each with a Cite) · **cause-reading-3** (reading-pipeline).
(1) **Certain.** `reading-pipeline/index.mjs:899-901` furniture = `header|footer|aside` and roles `banner|contentinfo|complementary|search`; `moreFurniture` (:941) adds dialogs and banners; nps.gov's footer is `div`/`section` with class names and no role, so it passes.
(2) Missed: three saved pages (yose, justice, acgov), none the walker's (class b). Fix: the grca page saved as a fixture; assert the listed strings absent.
(3) Failing-first: the saved grca page; fix: class/id tokens (`footer`, `contact`, `search`, `breadcrumb`, `share`, `social`, `sidebar`, `related`, `explore`) on a block holding no sentence of body prose, only beside a `main`/`article`; cited extents still resolve (R32 check). (4) **F**.

**C13a / P7** (visitor render: zion 16.1 s, legistar People 18.9 s, Departments 24.3 s, mozilla 504 at 25.8 s; render 13.6 s for 33 bodies) · **capture-sources**; seam **acquisition**.
(1) **Certain.** `capture-sources/render.mjs:343` `keepRenderBodies`: `await sha256; await put` one body at a time inside a `for` (~0.27 s per store trip, 33 bodies = 9.4 s); `browserrender.mjs:193` `collectBodies` likewise.
(2) Missed: a 20-body fixture with a 1 s fake body, never the store's trip cost; K4360's "7-9 s" was an expectation. Fix: the store double charges 0.27 s per call.
(3) Failing-first: 33 bodies at 0.27 s/put: render stage under 6 s (8 lanes, results by index, `head` before `put`). (4) **L** (real R2 latency shape); **LIVE-CHECK:** legistar Departments and People timed on the smoke copy before (numbers in the record) and at the re-walk against K4354's 15 s.

**C13b** (A: Zion "Unfinished ... waits for 1 of its attachments"; "Finish it" took 13.1 s, "already in the record ... nothing new saved", the line stays; no visitor copy in 10 min) · **acquisition (S)**.
(1) **Root cause unknown; probable:** `PENDING_RENDERS` (`acquisition/index.mjs:427`) is an in-memory map; lost when the object restarts or the request that began the render ended; `continue` then has no `renderResume` and meets the held shell.
(2) Missed: tests keep the map alive. Fix: a test that resets the map. (3) Step 0 diagnosis reports; failing-first: render deferred, map reset, "Finish it": the second document is filed or the session closed in words. (4) **L** (object restart).

### Words and screens

**C28** (A FC-22: knock handed in at /doorbell, a 19 KB photo: Inbox rows and detail show no file name or type) · **screens-publish (S)**.
(1) **Certain.** `screens-publish/doorbell.mjs:60-72` `send` builds `{contentB64, note, knockerSecret}` and never `fileName`/`mediaType`; `doorbell/door.mjs:126-127` accepts them and `doorbell.knock` stores them (:463). Round 3 placed it in doorbell/screens-intake, which were correct (class c).
(2) Missed: no test hands a file in through the real page and reads the Inbox row. Fix: that test. (3) Failing-first: `/doorbell`, a JPEG named `notice.jpg`: `inboxlist` row `file_name`, `media_type image/jpeg`; Inbox row and detail show both. (4) N.

**C70** (A S-03: band "Vouch for a capture 46", "79 items"; bell and sidebar 79) · **screens-daily (S)**.
(1) **Root cause unknown.** Contract is `cs.band(n)` (`screens-daily/queue.mjs:288`, shell `browser.mjs:470`, badge `TODO + BAND` :1260); live: band 46, badge 79: `band` called with 0, not called while the captures load, or the number read is not `TODO` (survivors A10).
(2) Missed: tested with a kit double on each side. Fix: one browser test over the real shell and real screen.
(3) Step 0 diagnosis (reproduce in Chromium with 46 held captures and 79 items, report the line); failing-first: that state: the Queue says what each number counts; bell and sidebar equal the items. BOB's detail (section 5.2): the vouch rows are not queue items. (4) **F** (a live-sized record set).

**P9 / P10 / C14** (screens Home 4.5-8.2 s, Held 5.6-7.8 s, Project 3.7-6.5 s, Queue 3.6-4.7 s, Question 5.5-7.1 s, Document 1.6-7.4 s, Action 8.4 s; `bootstrap` 1.0-1.3 s for 452 bytes 2-3 times; `queue` 117 KB 2-3 times; `heldcaptures` full rows 3.7-4.2 s for 27 rows; acts over 2 s: prepare edition 2.3-5.6 s, reattest 4.0 s, money trail 3.9 s, Start the request 3.2 s, new capture 5.1-7.1 s) · providers **control-plane**, **queue**, **capture**, **cause-shell-4**; users **screens-intake** (Held), **screens-inquiry**, **screens-daily**, **screens-investigate**, **screens-publish**, **screens-action**; seam each screen job for its screen.
(1) Known (lane): `capture/index.mjs` `#pageAnswers`/`#wholeOf` per-row batch examination, archive grouping, grade and store `head` (P10); the frame reads `bootstrap` and `queue` for itself and the screen again (P9); repeats left: `casedrafts` 3x, `projectquestions` 11x on Project, `inquirystrength` 2x. **Root cause unknown:** why `bootstrap` costs 1 s and which op each slow act spends its time in (no per-op server time exists).
(2) Missed: jobs counted reads, not time (class b; screens-intake "not re-measured against 2 s"). Fix: every screen test asserts its read set (one `queue`, one `bootstrap`, no per-project repeat) and each job records the screen's time on the smoke copy.
(3) Step 0 (control-plane, wave 0): `Server-Timing` per op, so the re-measure names the op. Failing-first: the read-set tests; `heldcaptures` 27 rows picker-first under 1 s alone. (4) **LIVE-CHECK (P, read-only):** the screens' reads timed on the smoke copy (by `Server-Timing` once deployed; before that by the lane's `probe.mjs`), numbers in each record; acts over 2 s are measured at the re-walk and carried as P11 if they miss (named, not silent).

### B: evidence, connections, conclusions, action

**C46** (B CA16/CA21: a concluded question reads "Finding 1 · <question> Not concluded yet" in the case editor and to the outside reader; raw question id under "The passages this case cites") · **screens-publish (S)**, **review** (prov).
(1) **Certain** (survivors B1). `review/index.mjs:286-306` `findingWords` takes the conclusion only from a front-matter string `conclusion`/`statement` or a body `## Conclusion`; a question concluded by a project keeps it as conclusion records/stance (`basis-versions/index.mjs:636` `fm.conclusions`, :666-706; `investigation/index.mjs:1304` `stance.claim`), and `publication/worker.mjs:705` reads `case_words.claim` first. `basis-versions/conclude.mjs:260` writes the string form only for a direct `conclude`. The raw id is `screens-publish/case-editor.mjs` (cites list).
(2) Missed: fixtures put a string `conclusion` in front matter (class d). Fix: the fixture is a question concluded by the real `conclude` and by a project adoption.
(3) Failing-first: both conclusions: editor row, review copy and outside reader show the sentence, no `## `, no "Not concluded yet"; the cites list shows the title. (4) N.

**C48 / N6** (B CA33: after reload the three stop reasons return, no "Edition 1 is prepared"; B NEW: editor says "names no case yet" after edition 1 published) · **screens-publish (S)**, **case-authoring**, **public-read** (`publishedAddress`).
(1) **Partly certain; detail unknown.** The pre-flight's `editions` come from `draftEditions({caseId})` (`case-authoring/index.mjs:1662`) where `caseId` is the case named, else the one published case the members serve, else the unsigned preparation (`#caseStood`, :1669-1676); "the act's own run is rolled back" so a minted case states neither (:1660); review R19 `editions` was tested against a scripted double of it (class b). Which of the three sources is empty on a fresh instance: **root cause unknown**, step 0 finds it by preparing and reloading in a fresh instance.
(2) Missed: scripted double. Fix: real `draftEditions` in the screen's test. (3) Failing-first: prepare edition 1, reload (fresh instance): "Edition 1 is prepared" and no stop reasons; publish: "Published: edition 1" and the address from one builder (resolves J13). (4) **L** (fresh object instance = reload).

**C49** (B CA32/CA62: chosen earlier draft: box kept, heading stays the newest's) · **screens-publish**.
(1) **Root cause unknown** (the job's test opened on the earlier draft; the walker chose it after load, class b). (2) Fix: the test presses the chooser. (3) Step 0 reproduces by pressing; failing-first: the chosen draft's scope and date head the page on the editor, review copy and ceremony. (4) N.

**C47** (B CA36/38: EVIDENCE lists the address, not the title or paragraph; "Relied on ·" stray dot) · **public-read** + **screens-publish (S)**. (1) **Certain:** the entry's name is the address (`public-read`); the dot is the screen's join. (2) Missed: tested on a scripted entry. Fix: the walker's published case through the real chain. (3) Failing-first: CASE-2026-4783: the document's title and "Paragraph 4"; no stray dot. (4) N.

**C40** (B CA28: row names late proof but the missing-proof label draws the raw key `screen.ceremony.conf.row.missing.co_archive`; the sentence below still says "neither") · **screens-publish**. (1) **Certain:** the word row was asked in K4398 and never written (draws as its key); the sentence is not re-read after `reattest`. (2) Missed: stand-ins by design; no test asserts the key resolves. Fix: the words check lists unresolved keys before the deploy (section 5.4). (3) Failing-first: after `reattest` the sentence names what is missing. (4) N.

**C51** (B: after the key file is loaded the page says "no signing key in this browser"; progress line shows `screen.ceremony.registering`; signed strings run together) · **cause-shell-4** + **screens-publish (S)**. (1) **Certain** (J18 point 2): the key-file text reaches `cs.signer` only through the dialog's box. (2) Missed: not tested end to end. (3) Failing-first: load a key file, the page says so; strings separated. (4) N.

**C69** (B CA60: old pair of identical NOTICED stays; new item sentence "was read as." missing a word) · **queue-producers** (haiku). (1) **Certain:** the sentence is built from the reference's stated state, absent for a capture read after its first (older items said "undetermined"). (2) Missed: fixtures always state it. (3) Failing-first: a newer copy of a page whose first reading was undetermined: ONE item reading "read as undetermined". Old data: the two identical NOTICED items already stored: a repair entry (queue-producers merges identical stored items once, at its next wake), not NR. (4) N.

**C8-words** (B E36: "FY2025-26" refused: "A follow names the days it covers") · **money** (haiku) + **screens-investigate**. (1) **Certain:** `money/index.mjs:226-260` refuses with `BAD_PERIOD`, the code `following` also uses; the translation is keyed by code (`refusal.BAD_PERIOD` = following's sentence), so money's real reason (`:248` "the profile's fiscal year for {body} names no period {fiscal}") is hidden (K446: distinct conditions, distinct codes). (2) Missed: each module tests its own code. Fix: the census test that two modules do not share a refusal code. (3) Failing-first: `recordfact` with `{fiscal:"FY2025-26", body}`: code `MONEY_BAD_PERIOD`, its detail shown. (4) N.

**C59 / N3** (B: Money "Nothing here", Timeline "Could not read this because your team&#39;s Civicsmith did not answer" for held `budget-note.txt`) · **screens-investigate (S)** + **cause-shell-4**. (1) **Root cause unknown** for the empty picker (the live `reading` read failed for a held text file: same unread-record family as N5, or the part drew another branch); the `&#39;` is the silent-store sentence escaped twice (shell refusal draw). (2) Missed: scripted `reading` answers. Fix: a real held text file captured through the app. (3) Step 0 reproduces and reports; failing-first: the file's passages listed or "this document has no reading yet"; apostrophe plain. (4) **F**.

**C64-template** (B NEW MAJOR: member, federal office: "Prepare the text" yields an empty box; a typed plain request is refused "You filled in a blank the text does not have") · **screens-action (S)**, **filing-templates**, **jurisdictions**. (1) **Certain for the refusal:** `screens-action/send-steps.mjs:275-290` sends `fills.period|form|cost_limit` whenever its boxes hold values and `filings/index.mjs:662-672` refuses any fill the text has no blank for (`FILL_UNKNOWN_BLANK`). **Root cause unknown** for the empty draft (probable: no template for 5 U.S.C. § 552 in `filing-templates`; not read). (2) Missed: round 3 tested the California path (class a: a MAJOR new row). Fix: the federal request is a fixture end to end. (3) Step 0 reports the template lookup; failing-first: the walker's member, "Office of Government Information Services", (A)(ii): a text is prepared; a typed plain request prepares. (4) N.

**C64-law** (B: help says "Answer within 10 days ... Cal. Gov. Code § 7922.535(a)" for a federal office; "the city can't send you updates"; DUE DATES kind `foia_appeal_response` for a first request) · **screens-action (S)** + **jurisdictions**. (1) **Certain** for the help (`screens-action/help-records.mjs` is California text); the kind label is the profile row's key drawn raw (jurisdictions' federal window carries the appeal kind). (2) Missed: no federal fixture. (3) Failing-first: the same request: help, send step and due date name 5 U.S.C. § 552(a)(6)(A)(ii), 20 business days, the first-request kind in words; "city" words LU. (4) N.

**C64-more** (B: "agency and office" one box split at the comma; naming the same office again makes another entry) · **screens-action** + **entities**. (1) **Certain** (`screens-action/request.mjs:204`; `entitycreate` creates without looking). (3) Failing-first: a name with no comma draws once; the same name twice returns the first. (4) N.

**C65** (B CA66: after a request is sent and answered no "Keep as a template") · **screens-action**. (1) **Root cause unknown** (never assigned, class a; `screens-action/action.mjs:374-377` draws the template line only from `templatesforaction` rows and nothing when none). (3) Step 0 reports which precondition fails; failing-first: sent and answered request: the control or its reason. (2) Fix: an NR row carries a fixture (R-OLD). (4) N.

**C53-min** (B: reminder date blank before choosing) · **screens-action**: date defaults to the option's first date. (1) `screens-action/plan.mjs`. (3) Failing-first: Choose without touching the date succeeds. (4) N.

**cite-refusal** (B NEW MAJOR: "Cite this" on a second passage with the only citation grouped: the page draws "C-2.8 1 basis leg carries no ground while 1 do: ...") · **screens-inquiry (S)** + **citation** (`repairs`). (1) **Certain:** `inquiry-grammar/grammar.mjs:950` finding C-2.8 is the module's own English; `citation/index.mjs:632-640` answers `BASIS_REFUSED` with findings; the screen draws them as they are. (2) Missed: refusal tested by code, not by what the member reads. Fix: the words check counts a finding's sentence drawn on a screen. (3) Failing-first: that state: a sentence in the member's words with two acts ("add it to the group", "take the first out"). (4) N.

**C36-aside** (B: "<project> ·" with nothing after the dot for a web page; the "fails if any one fails" list names only document and page) · **screens-inquiry**. (1) **Certain:** two lines the C36 fix did not name (class d). (3) Failing-first: both lists draw the cited words. (2) Fix: list every place that draws a citation. (4) N.

**C81** (A S-40, B CA18/CA61: case editor "Remove a citation" 44 x 267 px and review copy "Stop sharing" 44 x 229 px at 390, letters stacked; targets under 30 px) · **cause-shell-4 (S)**.
(1) **Certain for the squeeze:** `cs.row("", text, act)` leaves no first element and the phone grid sizes the act column wrongly; screens-inquiry's round-3 fix edited three screens' call sites; `screens-publish` has 11 more (`case-editor.mjs:70,111,156,160,176`, `published.mjs:83,99,111,120,147,159`, `parts.mjs:386`). Targets under 30 px and inline `cs-ref` 18-22 px: the design's stylesheet (interface-assets R7), DESIGN.
(2) Missed: phone tests measure named states with scripted data; "Remove a citation" is in no test (class d). Fix: measure the walker's two screens and a live-sized control count.
(3) Failing-first: both screens at 390 px: each button over 200 px wide, one line. (4) **L**/Chromium at 390 px (the shell's own browser test).

**C22** (A FC-17: second list "78 places": "A document" 13 times, raw ids `legislation:26-0788`) · **screens-daily**. (1) **Certain:** the rule "own words, else the document's title by one search, else the plain word" (R89) fixes documents; ids that are not documents fall to the plain word. (2) Missed: fixture without the live mix of place kinds. (3) Failing-first: a record with a legislation id and a document: each named. (4) **F**.

**FC-23 label** (A: the "Give a login" submit control has no text) · **screens-intake**: carries its key while the row is missing (every other act does). (1) Certain. (3) Failing-first: the control's text is non-empty. (4) N.

### NR and LU

- **NR (none of them a row found STILL):** N2 (cannot be made: no empty choice); **C87c** (survivors A12: `screens-settings/identity.mjs:70-73` refuses only when no kind is ticked and all boxes are empty; the walker ticked kinds; a different input, not a defect; dated fixture check at the re-walk); C41 (no contrived state; dated fixture); C4, C89, C90 (shared state; fixtures); old names of PDFs captured before this release (new records only, R-OLD; the re-walk uses new captures); the first-try `STORE_DID_NOT_ANSWER` after a pause is folded into C5a.
- **LU** (section 6): "Check it now" label, C71 reason, "Pages 1", C95 list, "the city" words, money's "follow" word, unresolved ceremony rows.

**Seam owners (K4431; supersede section 2's and section 8's where they differ):** the last-merged job on each path owns its through-the-door test: control-plane (C5a, C5b), plane (C5c), acquisition (N-slow-refuse), capture-sources (C13a, C13b), screens-daily (C25: capture to every list), screens-settings (C84), screens-intake (C9), screens-inquiry (N5, cite-refusal), screens-investigate (C59), screens-action (C64-template, C64-law, C64-more), screens-publish (C51, C81, C28, C46, C48); providers test the same case at their interface. The STARTs in `starts-T51-F4/` carry these.

## 3. Jobs

Every job: medium effort; its suites then `build/plan/impact.mjs tranche/T51 HEAD`; "declare every census op you own"; R-FOUR, R-SEAM, R-NOTMET, R-OLD.

| job | model | wave | merge | modules held | causes |
|---|---|---|---|---|---|
| pdf-reader | sonnet | 0 | 1 | pdf-reader | C25* |
| host-governor | sonnet | 0 | 2 | host-governor | N-slow-refuse |
| acquisition | sonnet | 0 | 3 | acquisition | C5a*, C5c, C13b (S), C25 (S) |
| extraction | sonnet | 0 | 4 | extraction | C5b*, N5* |
| plane | sonnet | 0 | 5 | plane | C5c* (alarm) |
| control-plane | sonnet | 0 | 6 | control-plane | C5a (S), C5b (S), `Server-Timing`, P9 |
| file-scanner | sonnet | 1 | 1 | file-scanner | C84* |
| capture-sources | sonnet | 1 | 2 | capture-sources | C13a |
| capture | sonnet | 1 | 3 | capture | P10 |
| file-safety | sonnet | 1 | 4 | file-safety | C84 (S) |
| cause-reading-3 | sonnet | 1 | 5 | reading-pipeline, text-chain | C19 |
| entities | sonnet | 1 | 6 | entities | C64-more* |
| money | haiku | 1 | 7 | money | C8-words* |
| citation | sonnet | 1 | 8 | citation | cite-refusal* |
| jurisdictions | sonnet | 1 | 9 | jurisdictions | C64-law*, C64-template* |
| filing-templates | sonnet | 1 | 10 | filing-templates | C64-template* |
| case-authoring | sonnet | 1 | 11 | case-authoring | C48* |
| review | sonnet | 1 | 12 | review | C46* |
| public-read | sonnet | 1 | 13 | public-read | C47*, C48* (`publishedAddress`) |
| queue-producers | haiku | 1 | 14 | queue-producers | C69 |
| queue | sonnet | 1 | 15 | queue | P9 (count for the frame) |
| journey-check | sonnet | 1 | 17 | journey-check | the local arm's moved fixture, R30 (K4435) |
| case-grammar | sonnet | 1 | 18 | case-grammar | C47* (`title` in the signed material row, K4438) |
| case-disclosures | sonnet | 1 | 19 | case-disclosures | C47* (writes `title`, K4438) |
| cause-shell-4 | sonnet | 1 | 16 | interface-assets, interface-shell | C81 (S), C14*, C51*, C59* |
| screens-settings | sonnet | 2 | 1 | screens-settings | words of C84, C14* |
| screens-intake | sonnet | 2 | 2 | screens-intake | C9 (S), FC-23, C14* |
| screens-daily | sonnet | 2 | 3 | screens-daily | C70 (S), C22, C14* |
| screens-inquiry | sonnet | 2 | 4 | screens-inquiry | N5 (S), cite-refusal (S), C36, C14* |
| screens-investigate | sonnet | 2 | 5 | screens-investigate | C59 (S), C8*, C14* |
| screens-publish | sonnet | 2 | 6 | screens-publish | C28, C46, C48, C49, C40, C47, C51 (S), C81*, C14* |
| screens-action | sonnet | 2 | 7 | screens-action | C64-template (S), C64-law (S), C64-more, C65, C53-min, C14* |
| affordances | haiku | 2 | 8 | affordances | `readheld` and `capturecredentiallist` explanations (K4437) |
| ratification | sonnet | 2 | 9 | ratification | P10 (d): `examineMember` asks `contradiction.candidatesFor` once per contested state, three identical scans per document; one read, states filtered after (K4445) |

**Wave 0** (priority; BOB merges in the table's order, runs the whole suite and the seam tests, and reads the two step-0 reports before releasing fixes): pdfstructure > host-governor > acquisition > extraction > plane > control-plane. **Wave 1** (16 providers, independent; merge as the table). **Wave 2** (7) starts when wave 1 is merged; it does not wait on the design's word rows (K4269): a missing row is drawn by its stand-in, and section 5.4's check lists every key still drawn raw before the deploy. A half a job finds in a module it does not hold goes to BOB as a QUESTION answered before the next wave opens (round 3's reserve).

## 4. START essentials (what is new; the cause blocks of section 2 are the rest)

**pdfstructure:** `pdfTitle(bytes)` from Info/XMP only, bounded. **host-governor:** refusal or cool-off answers at once with `retry_after_ms`; `admit` never sleeps past `maxWaitMs`. **acquisition:** stages kept and returned on every outcome including a throw; `putFromParts` awaited within the bound else registered for plane's alarm; `title`; `continue` with no live render starts it afresh. **extraction:** `readHeld` replaces a `found:false` reading once; op `readheld`. **plane:** object `alarm()`, `keeps_pending`, stage record survives a restart. **control-plane:** door phase clock, `Server-Timing`, deferral (RC-R1), `readHeld` after promotion, `bootstrap` once. Both step-0 reports (C5a, C13b) go to BOB before the fix step. **file-scanner / file-safety:** as C84. **cause-shell-4:** empty-first-part rows, shared frame reads, `cs.signer.sign(..., {keyFile})`, one escape. **Screens:** each cause's seam test through the real merged providers; reads counted and timed. **screens-publish** carries ten causes: if split, never two jobs at once in the module.

## 5. BOB's decisions and resolutions of round 3's open points

1. **J6 (R96's past-memory arm, `waitUntil`).** `putFromParts` exists (record-core R87). `waitUntil` cannot be handed from the door (the work runs in the object). Decision (BOB's detail): the call is **awaited** within the bound (stage `keep`); past the budget it is registered in `keeps_pending` and finished by the plane object's alarm. R98's PDF arm: pdfstructure's `pdfTitle`. J13 (address builder): `public-read` provides `publishedAddress(case, edition)`. J18 point 2: cause-shell-4. J20 / J8 / K4398 words: the batch of round 3 section 11 plus this round's is sent to UX-DESIGN before wave 2 and the rows must exist (C40 is that gap). screens-inquiry J19(a) was resolved at K4402. screens-investigate's deferred pickers: LU.
2. **C70, decided (BOB's detail, K4429):** the vouch band's rows are not queue items; the page says what each number counts; DESIGN's ask (4) may change it.
3. **RC-R1, decided (BOB's, P17; K4429).** A capture is answered when kept; a reading that will not fit the bound is `pending` and follows (`readHeld`), the page saying the reading is on its way. It changes when a member sees the reading, not whether, and follows from K4354's 15 s bar; released to the fix step only if C5a's step-0 report shows the reading is the slow phase.
4. **Words check before deploy:** the words check lists every key a screen draws that has no row (so C40's raw key cannot reach the walker); added to the pre-deploy checks (BOB's tooling).
5. **Requirement changes** (BOB writes before the wave that needs them): RC-R1 above; RC-R2 control-plane (`Server-Timing`; the door's phase on an `acquire` failure); RC-R3 extraction R80 (a failed reading replaced once; op `readheld`); RC-R4 acquisition R10/R96/R98 (awaited or alarmed keep; PDF title from Info); RC-R5 plane (alarm finishes pending keeps and readings; stage record survives a restart); RC-R6 file-scanner R6 (async door records a request; cron every 10 minutes; state names start and stage); RC-R7 file-safety R46/R50; RC-R8 host-governor R29 (a refused host answers at once); RC-R9 interface-shell (an empty-first-part row lays out with its act), money (own refusal code), citation (`repairs`); RC-R10 the screens' own lines (C9 pre-flight, C28, the help names the chosen law, `publishedAddress`); RC-R11 reading-pipeline R32 (furniture by class/id tokens on a block with no prose): BOB's, **told to Bob** as RC-8 was (it changes which passages a member may cite). None changes a requirement's meaning in Bob's sense.

## 6. WORDS: new lines for `later-ux.md` (BOB appends)

- Settings > Security · "Check it now" says nothing of what it checks · A S-01 · 2026-10-21
- Queue and doorbell · the generic reason "An item that needs you to read, check or decide..." is the same for every item · A S-33 (C71) · 2026-10-21
- Document · "Pages 1 are pictures of text" for a page that also has typed words · A FC-14 · 2026-10-21
- Document · "Cite in which question" holds every team question with no empty choice · B C95 · 2026-10-21
- Request, send, reply · "the city" for a federal office · B C64 · 2026-10-21
- Money · "A follow names the days it covers" shown for money's period (goes when the code is separate) · B E36 · 2026-10-21
- Case ceremony · rows not yet written drawn as keys · B CA28, CA34 · 2026-10-21
- Already listed, no new line: "Refused / Open it to vouch ...", "Awaiting review"/"held until you vouch", "Read N of M words", W1-W13, S-09, C55, C76's mark, the K4328 door.

## 7. DESIGN: one HANDOFF to the UX design lane (BOB posts it)

> **HANDOFF to the UX design lane from BOB (T51 fix round 4).** (1) **Words first:** the batch of rows jobs asked for (round 3 section 11 plus: unfinished and `RUN_STARTED` Security sentences, "Read it now" on an unread copy, "kept; the reading follows", the cite refusal's two repairs, `MONEY_BAD_PERIOD`, the federal request's help text) must exist before wave 2, or screens draw keys. (2) **The stylesheet:** 44 px targets for controls under 30 px (Home 120, Queue 89, Find 73, Projects 37) and the inline reference links (18-22 px) at 390 px. (3) **The "Give a login" submit label; whether "The agency and office" is two fields.** (4) **One number or two:** whether bell and sidebar count the vouch band or the band is drawn apart.

## 8. After the round, and the counts

1. **No redeploy until section 2's four fields are closed for every cause** (K4426): each job's COMPLETE lists its cause's four fields; BOB closes a cause only when the failing-first test was seen red, the test-gap fix is merged, and the platform check (L, P or F) is reported. Wave 0's two step-0 reports come first; "root cause unknown" causes are released to a fix only by BOB after their report.
2. BOB merges in the table's order, runs the whole suite and the seam tests per wave. Regenerate in the manifest's order (K1540, K4355); verify as in round 3 section 9 (2).
3. **Scanner:** C84's change is in the Worker bundle, not `container/scanner.mjs`: no new image unless the job changes the container. After the redeploy the first run starts by the cron or the button; read `scanstatus`. If the first complete run reads `MIRROR_REFUSED ... 403` the host refuses Cloudflare egress: to Bob with options (a) a mirror the team controls (recommended), (b) ask ClamAV for an allow, (c) files stay held unscanned and say so.
4. Redeploy biosmoke8; **targeted re-walk of exactly what changed** by each cause's failing-first case (old and new records scored apart), plus fixtures for the not-exercised rows (a pending endorsement of the last administrator, a second member, C41's contrived refusal, INFO-2026-0080 and INFO-2026-0042 re-pressed); PERFORMANCE re-measures against K4354 with `Server-Timing` and files P11 for what misses; one final pass (K4297 (3)); T51 closes.

**Counts.** Causes in jobs **34** (priority 6: C5a/P8, C5b, C5c, C84, N-slow-refuse, N5; capture/reading/names 5: C9, C25, C19, C13a, C13b; screens and words 23); P7-P10 all placed (P7 capture-sources; P8 control-plane, acquisition, extraction, plane; P9 control-plane, queue, cause-shell-4; P10 capture, screens). Jobs **29**: wave 0 **6**, wave 1 **16**, wave 2 **7**; models **27 sonnet, 2 haiku (money, queue-producers), 0 opus**. Seam owners: control-plane (C5a, C5b), file-safety (C84), acquisition (C25, C13b), screens-intake (C9), screens-publish (C51), screens-inquiry (N5, cite-refusal), screens-daily (C70), screens-investigate (C59), screens-action (C64), cause-shell-4 (C81). Root cause unknown (diagnosis first): **8**. NR: N2, C87c, C41, C4/C89/C90, old data. LU lines: 7. DESIGN: 1 handoff, 4 asks. Requirement changes: 11, one named. Could not place: none.
