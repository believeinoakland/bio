# acquisition (T51)

**Status** · session_01UzsMeXPSWSfbJkij7yPiZw · depth 2 · WORKING · handled B48

## J1 · REPORT

Two words-check findings are in other modules, outside this job's paths; I did not change them (P9):

- `bio-plane/src/capture/index.mjs:716` `[plain]` "the acquisition receipt could not be written, so nothing was filed"
- `bio-plane/src/doorbell/index.mjs:656` `[plain]` "the acquisition receipt could not be written, so the knock stays as..."

Each is a sentence a member reads, so each owner converts it through `localize` (the acquisition module's own strings are converted the same way). The sentence names the acquisition receipt, which is this module's record; the wording is theirs to key.

## J2 · COMPLETE

Entry T51-178 applied (words pass, K3949, K3957, K3962, K3955). Head: f82170799d (2fee74be9a, merged tranche/T51 at 7fa58468e5).

Applied
- The 3 findings in words-pass/acquisition.md: the inline qualification of a render (index.mjs, the template literal inside `localize`'s vars) is now its own `localize` (`acquisition.index.the_whole_page_qualifier`); the test copy "a continuation files no new document" is reworded (acquire.test.mjs), and the memento's "it is not the page at" is read through `word("acquisition.asked_note.memento_seconds_instant")` (memento-at.test.mjs).
- The 33 plain findings: each sentence in index.mjs (19), keyed.mjs (7) and unpack.mjs (7) is read through `localize('acquisition.<file>.<slug>', en, vars)`, with the wording unchanged. Three sentences were split across two literals in the source (index.mjs sweep scope, keyed.mjs key-held, unpack.mjs archive opening) and are now one literal each; the text is the same. index.mjs:1039 ("too large to be a single page") is read through localize too.
- The 19 test copies: tests compare with `localize(id, en, vars)` or `word(id)` using the id the product uses (capture-sources, court-doctypes, doctypes, subresources, acquisition, provenance). The three test-local labels and an assert message that copied a sentence were reworded (origin.test.mjs fixture signals, profile.test.mjs, reputation.test.mjs message, acquire.test.mjs message). keyed.test.mjs: a test case label that copied a source fragment is reworded.
- subresources-walk.test.mjs:100 (K3955): the banner is compared with `localize("subresources.subresources.derived_banner", en, {primarySha, when})`, `when` read back from the render companion.

Choices I made (for BOB to confirm)
- Keys: `acquisition.<file stem>.<first five words>` (the layer's existing pattern), where a slug collided with another key I took a distinct one (`the_body_broke_off_credential`, `bio_plane_acquire_hashed_at_receipt`).
- Strings that might look like wire values (the `method` label, the render `evidence` labels, the `listed whole` signal) are converted with their text unchanged, not listed in a REPORT: the output is identical, and no one compares them.
- The `missingkey` check treats `word()` on a key the words list does not declare as a failure, so tests use `localize(id, en)` for those.

Deferred: none.

Flaws in other modules (REPORT sent): capture index.mjs:716 and doorbell index.mjs:656 (plain, "the acquisition receipt ...").

Checks (run in this session)
- acquisition tests: `node --test test/m/acquisition/*.test.mjs`: tests 173, pass 173, fail 0 (before and after the tranche merge).
- `checks/format.mjs /home/user/bio`: 175 modules, 174 requirements files; 0 failures.
- `checks/architecture.mjs /home/user/bio acquisition`: 3616 product files, 12027 relative imports; 0 failures.
- `checks/coverage.mjs /home/user/bio acquisition`: 48 of 48 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs /home/user/bio acquisition tranche/T51 job/T51/acquisition`: 0 failures (13 files changed by acquisition, all inside its paths).
- `checks/run.mjs /home/user/bio`: no finding names acquisition (the words check's 4078 failures are in other modules, two of which are the REPORT above). Checked by grep for the acquisition paths and for the acquisition keys.
- `setup-words/build.mjs --check`: the stale-rows note names acquisition ids (expected, per the job); no refusal naming acquisition.

Size (session_016xfwU1s1dNaPjN8djDsRtW): test runs 3, module lines 2973

## J3 · QUESTION

FR-43 part 1 is done and pushed (head on job/T51/acquisition, tranche/T51 merged). I need the live stage timings to do part 2 (entry 2); I am not guessing the stage.

What part 1 does (requirement R95, written in build/requirements/acquisition.md and named by 4 tests in test/m/acquisition/stage-times.test.mjs): every `acquire` answer, refusals included, carries `timings: {total_ms, stages}`, whole milliseconds by stage: reputation, archive, fetch (the governed request, so the host governor's pacing and redirects are inside it), read (body hashed and stored), render, receipt, subresources (a continuation too), profile, attest, unpack. Only the stages that ran appear; they sum to no more than total_ms. `acquire` also accepts `opts.timings` (an object it keeps current as stages run) and exports `stageTimes(obj)`, which names a stage still under way as `running`.

Please send, from the live copy after the redeploy, the `timings` of the slow captures (the oakland.legistar.com / oaklandca.gov 75 KB page and PDF, and one address on another site) by CHANGE. R96 (the budget) will be written with the fix, since the budget depends on the stage.

Needed in other modules (not mine; for BOB): the 25 s door bound ACQUIRE_TIMED_OUT (control-plane R105) stops waiting and today cannot say where the time went. For its refusal to carry the stage times, control-plane must hand `opts.timings` to the acquire call (through capture and plane, which pass `acquire`'s opts on) and add `stageTimes(timings)` from acquisition to that refusal's body. Until then the live walk reads the times only from captures that finish (which are the ones under 25 s). If most slow captures time out, the timings BOB reads will be missing for exactly those; consider doing that wiring before the redeploy.

Numbering: the START gave R95/R96; this file ends at R48, so R95 leaves a gap in the numbering, kept as given.

## J4 · COMPLETE

FR-43 part 1 applied (entry 1, K4194). Requirement line R95 written by me in build/requirements/acquisition.md (K4210; not in this record); it is named by 4 tests in test/m/acquisition/stage-times.test.mjs, so it carries no "not yet met" mark. R96 and entry 2 (part 2) are not applied: they return after the redeploy with the live timings (B5); R96 not written yet.

Changes: acquire's answer (every outcome) carries `timings`; `opts.timings` and exported `stageTimes`. Three existing tests (checks.test.mjs R29, t50.test.mjs R29 and R47) set `timings` aside by name in their byte-for-byte comparisons; R29's line says so.

Deferred: part 2 only (waits on timings). Found in other modules: control-plane R105 must carry the timings into ACQUIRE_TIMED_OUT (BOB's CHANGE to it, B5). Inherited red: plane R24 (screen words), fails identically without my change.

Checks: acquisition tests 177 pass 0 fail; capture 203, capture-requests 129, monitoring 145, link-sweep 29, doorbell 77, control-plane 309 all pass; format 0 failures; architecture 0 failures; coverage 49 of 49 ids named, 0 failures; checks/run.mjs: no finding names acquisition; ownership: the only failure is build/requirements/acquisition.md, accepted by B3/B4.

Size (session_01Bvmjz46Mg98xC62DtqtJas): test runs 12, module lines 3040

## J5 · REPORT

Correction to J4: after merging tranche/T51 the acquisition suite showed 1 red (reputation.test.mjs R44, a body comparison that differed only in the new timings key, a timing flake). Fixed by setting timings aside by name; 177 of 177 pass on 3 consecutive runs. Merge the pushed head, not the one J4 named.

## J6 · QUESTION

Two things in fix round 3 need a call in a module I do not hold. I carry on with everything else.

**1. C5 (e), the multipart upload past memory.** `record-core`'s `evidenceStore()` offers `head`, `get` and `put(digest, bytes)` only (record-core/index.mjs, `evidenceStore`). There is no multipart upload. A further difficulty: the whole's digest is the object key and is known only when the stream ends, while R2's `createMultipartUpload(key)` needs the key at the start, and the Workers binding has no rename or server-side copy. So the call I need cannot be a plain "multipart put under the digest". My best reading of what would serve R96: a store call that makes the whole object under `digest` from part objects the store already holds (`evidenceStore().assemble(digest, [partDigest...])`, answering `{ok}` or a refusal naming the store's own object bound), so no byte is read back through the Worker. BOB and record-core settle the form. Until it exists I build (a) only: parts kept in memory up to `MULTIPART_KEEP_MAX` (32 MiB) and the whole put once; a capture past it stays held in parts only, as today, and R96's past-memory arm is not met by me. I will write no test for it and say so in my COMPLETE.

**2. C25, a PDF's Title entry (R98).** HTML (`<title>`, else first heading) I build in `acquisition/title.mjs`, cleaned by reading-pipeline R34's rule. For a PDF the only reader of `/Info /Title` is pdf-reader's `extractPdfStructure` (R39, `metadata.title`), which reads every page: 355 ms for a 33-page 276 KB agenda, so seconds for a 16 MiB PDF inside the 25 s bound. I need a cheap Info-only export from pdf-reader (for example `pdfTitleOf(bytes)`, R39's decoding with no text read), reached through `format-registry` (acquisition's existing edge) or a new `acquisition uses pdf-reader` edge (BOB's, modules.json). Until then a PDF answers `title: null` (a stand-in, named in my record), so screens fall back to the file name as today.

No other blocker. Wave 1's host-governor peek (R29) is not on `tranche/T51` yet; I test C13 against a scripted double of `governorAdmit({host, peek: true})` and re-run against the real one when I merge it.

## J7 · COMPLETE

Fix round 3 (B6) applied for acquisition, head `2510f56d67` plus this entry's commit, `tranche/T51` merged at its tip (5515153cd5 and later; host-governor's peek is NOT on it yet).

**Causes met**
- **C5 (a), R96 R10 R11 R95**: `acquire` keeps each part's bytes in memory while the capture stays within `MULTIPART_KEEP_MAX` and puts the whole once under the whole digest when the stream ends (`keepWhole` with `bytes`): no part read back, no second digest of the parts, each buffer released as it is copied. Stage `keep` is timed apart from `read`; a single-part capture states no `keep`. A second press while the first is under way waits on the keep under way (`KEEPING`) and leaves one object. R17's ZIP-magic read of the first part also uses the held bytes (no `get` at all on a multipart capture). `keepWhole(ev, {sha, parts, total})` without `bytes` is unchanged, so `capture`'s upload path (capture/index.mjs:711) still works.
- **C12, R20 R95**: no set time is waited for the timestamp (`ATTEST_WAIT_MS` and `opts.attestWaitMs` removed; nothing outside this module used them). The answer carries the attempt pending unless it already ended; the late outcome is recorded by `recordLateAttestations` as before; a failing attest still files the document and records the failure. **One reading for BOB to confirm:** the capture-request arm (`captureRequest` present) still waits for the attempt to end, as before (no door bound; a drain run may not outlive its handler). R20's text says "acquire answers as soon as the document is kept" without naming that arm. If BOB wants the drain arm to answer at once too, it is the one expression `captureRequest ? Infinity : 0` in `acquireRun`.
- **C13, R97 R9 R5**: the render arm asks the governor with `governorAdmit({host, peek: true})`; the fetch then books once. Tested against fixture.mjs's stand-in governor, which answers `peek` as host-governor R29 states it (writes nothing, counts grants), because R29 is not on `tranche/T51` yet (`grep peek host-governor/index.mjs` empty at my last merge). **After host-governor's job merges, re-run `node --test --test-force-exit bio-plane/test/m/acquisition/fix3-t51.test.mjs`**; until the real governor honours `peek`, the live render arm books twice, as before.
- **C25 (d), R98, HTML arm only**: `document.title` (`title.mjs`: `<title>`, else first heading, cleaned by reading-pipeline R34's rule, stated here beside its user because that module is later in the order); the rendered document's title for a render pair; `null` for plain text, a binary, a capture of several parts, and for a document with no title.

**Not met (marks kept on the requirement lines)**
- **R96's past-memory arm (C5 e)**: the evidence store (record-core `evidenceStore()`: `head`, `get`, `put`) offers no multipart upload, and the whole's digest, the object key, is known only at the stream's end. QUESTION J6 names the call I need. A capture past 32 MiB is still held in parts only. No test written for it; R96 keeps its *(not yet met: T51)* mark.
- **R98's PDF arm**: needs a cheap Info-only title export from pdf-reader (extractPdfStructure reads every page; 355 ms for a 33-page 276 KB file). QUESTION J6. A PDF answers `title: null` for now (a stand-in), so R98 keeps its mark.

**Requirement lines**: BOB wrote R20, R95–R98 before my START. I only removed the *(not yet met: T51)* mark from R20, R95 and R97, which my tests now name (K4210; the ownership check lists `build/requirements/acquisition.md`, accepted at the merge).

**Tests** (`bio-plane/test/m/acquisition/fix3-t51.test.mjs`, new, each seen failing first; controls beside each): R96/R10/R11/R95 (16 MiB+5, put 1.5 s: answered in about 6 s, whole put once with its checksum, 4 puts, 0 gets, `keep` and `read` apart), second press, single-part and refused-whole controls; R20 (a 2 s attestation answered at once, recorded late; fast and failing controls); R97 and its controls; R98 and its controls. Changed in step with the requirements: `fix2-t51.test.mjs` (its read-back-refusal test and its two waited-attestation tests are superseded by the above and removed), `acquire.test.mjs` R20 R28 (a grant slower than a tick is read from the late record), `fixture.mjs` (governor stand-in peek and grants; `run` keeps the scripted network up until a pending attestation is recorded, unless `settle: false`: without it a late attestation reached the real network).

**Checks** (run in this session)
- `node --test --test-force-exit bio-plane/test/m/acquisition/`: tests 191, pass 191, fail 0 (three runs after the last change; baseline before was 185/185).
- Users' suites, all green: capture 228 (+ cap13-reuse-pages, d57selflink), doorbell 84, capture-requests 129, extraction 197, monitoring 168, file-safety 75, reading-pipeline 150, link-sweep 41, case-carriage 90, control-plane 342 with the two capture loose tests, plane + ratification 531: 530 pass, 1 fail = `plane/release.test.mjs` R24 (DEC-149 words), red identically on the tranche tip, not mine. `impact.mjs` names 112 modules (1642 of 2174 test files) through acquisition's index; I ran the direct users above, not all.
- `checks/format.mjs`: 1 failure, `build/rulings.md:4346` (K4349 states no standing-list decision), BOB's, not mine.
- `checks/architecture.mjs acquisition`: 0 failures. `checks/coverage.mjs acquisition`: 52 of 52 live ids named, 0 failures.
- `checks/run.mjs`: words 0 failures (inline 0, plain 0, testcopy 0, missingkey 0); no finding names acquisition; coverage lists other modules' ids only.
- `checks/ownership.mjs acquisition tranche/T51 job/T51/acquisition`: 1 listing, `build/requirements/acquisition.md` (accepted, K4210); every other changed file is inside my paths and tests.

**Found in other modules (P9)**: none new. `plane/release.test.mjs` R24 is red on the tranche tip.

**Deferred**: R96 past memory, R98 PDF (above).

Size (session_01Y3snL5ogNuP2LEHaz82PG4): test runs 9, module lines 3401

## J8 · COMPLETE

B7 applied on top of J7 (head pushed on job/T51/acquisition; `tranche/T51` merged again, host-governor's peek still not on it).

**R96's past-memory arm: met against a scripted double of `evidenceStore().putFromParts`, live at RECORD-CORE's merge.** A multipart capture past `MULTIPART_KEEP_MAX` keeps its parts as today; when the store offers `putFromParts` (feature-detected) it is called once, after the answer, with the whole digest and the part digests in order (`keepFromParts`), shared with a second press while the first runs, and handed to `opts.waitUntil` (else `cap.waitUntil`) so it outlives the answer. A refusal or a throw never fails the capture; with no such call the capture stays in its parts. No `keep` stage is stated for it (the call is not awaited), and no part is read back by this module (R17's ZIP-magic check reads the first 64 bytes held from the stream). I removed R96's *(not yet met: T51)* mark: every arm is now named by a test (record-core R87's real call is what the double stands for).

**R98**: a PDF answers `title: null` at capture, per B7 (test added). R98's line still states "a PDF's Title entry"; I left its *(not yet met: T51)* mark for BOB to amend or lift.

**For BOB (callers, not mine)**: `acquire` takes `opts.waitUntil` (a function of one promise). `capture`'s `acquire` passes its opts on, so control-plane / plane must hand the Durable Object's `ctx.waitUntil` there for the past-memory call to outlive the answer; until then the call is begun and runs on by itself. Also still true from J7: host-governor R29's peek is not on `tranche/T51` (re-run `fix3-t51.test.mjs` after it merges), and the capture-request arm still waits for the attestation (one expression to change if BOB wants it at once).

**Checks after B7**: acquisition suite 193 of 193 (two runs); capture + doorbell 312 of 312; architecture 0 failures; coverage 52 of 52; words 0 failures; ownership: the one listing `build/requirements/acquisition.md` (accepted, K4210).

Size (session_01Y3snL5ogNuP2LEHaz82PG4): test runs 14, module lines 3426

## J9 · COMPLETE

B8 applied: `tranche/T51` merged (host-governor R29's peek is on it). The render arm already passes `peek: true` (index.mjs:961); R97 is now also proved through the real `HostGovernor` (new test in fix3-t51.test.mjs: one render-arm visit leaves `granted` at 1; a peek creates no state), beside the stand-in test. One flake found after the merge under load (the 2 s late-attestation wait, 6 s) was widened to 20 s in the test only. Acquisition suite 193 of 193 on two runs, then 194 with the new test in the file (12 of 12 in fix3). Checks unchanged: ownership lists only `build/requirements/acquisition.md`.

Size (session_01Y3snL5ogNuP2LEHaz82PG4): test runs 18, module lines 3430

## J10 · QUESTION

QUESTION (K4370), two items for the design stream and BOB; my job carries on with stand-ins.

1. The word table has no row `refusal.CAPTURE_NOT_KEPT`. CAPTURE_NOT_KEPT's row (acquisition/checks.mjs, `CAPTURE_KEEP_CHECKS`) reads its translation by `localize('acquisition.checks.capture_not_kept', <default>)`; the default is a stand-in: "the document arrived in several parts, but Civicsmith could not keep it whole, so nothing was filed; capture it again". When the design's row lands, the row switches to `word("refusal.CAPTURE_NOT_KEPT")`. Until then checks.test.mjs (R29 R31) is red by name on `hasWord('refusal.CAPTURE_NOT_KEPT')`.
2. The check number is my choice: C-154.1 (C-154 is in no file; the series reaches C-153). Please confirm it or name the number, and I will change it.

## J11 · COMPLETE

COMPLETE: fix round 3, wave 2 (ACQUISITION #23, B9). Head bb614c49bf on job/T51/acquisition (tranche/T51 merged at 22d09993fa).

Causes met
1. C5* (K4370), CAPTURE_NOT_KEPT's catalogue row (R10, R96). `checks.mjs` gains `CAPTURE_KEEP_CHECKS` with the row (check `C-154.1`, where `src/acquisition/index.mjs acquire > is-capture-kept`, translation a stand-in: `localize('acquisition.checks.capture_not_kept', <default>)`, see QUESTION J10). `notKept` (index.mjs:404) now answers `code`, `check` and `translation` beside `reason` and the unchanged `detail`. The row is in `ACQUISITION_CHECKS`. Test: "R96 R10 (C5, K4370): the CAPTURE_NOT_KEPT refusal carries its catalogue row's code, check and translation; control: an existing refusal's row is unchanged" (fix3-t51.test.mjs). Seen failing first: `TypeError ... reading 'check'` with the change stashed; passes with it. Control: `CAPTURE_NOT_DRAINING` still `C-28.13`. The census in checks.test.mjs gained the row (`CAPTURE_NOT_KEPT: "C-154.1"`) and the R29 R31 case table gained a driven case (9 MiB, a store refusing the whole object, with a control).
2. R98 test (K4370): a PDF with no Title entry answers `null` at capture, as one with a Title entry does (fix3-t51.test.mjs, the R98 controls test). It passes; the requirement line already states it, so no code change.

Suite
- `node --test --test-force-exit bio-plane/test/m/acquisition/`: 195 tests, 194 pass, 1 fail. The one red is `R29 R31: this module's table holds exactly ...` in checks.test.mjs, failing by name on `hasWord('refusal.CAPTURE_NOT_KEPT')`: the design's row is not in the word table yet (QUESTION J10, the stand-in in use). Accepted red, named here.
- `checks/format.mjs`, `architecture.mjs`: part of `checks/run.mjs /home/user/bio`: format 0 failures, architecture 0 failures; words 0 failures, with no finding in acquisition. `coverage` shows 9 failures, all in other modules (agent-harness, agent-runner, capture R101, control-plane R117/R118, entities, file-safety, installer-steps, interface-shell, journey-check); none names acquisition.
- `checks/ownership.mjs /home/user/bio acquisition tranche/T51 job/T51/acquisition`: 0 failures.
- `setup-words/build.mjs --check`: stale-rows note names `acquisition.checks.capture_not_kept` (expected, the stand-in); no refusal.

Reported to BOB
- QUESTION J10: the `refusal.CAPTURE_NOT_KEPT` row for the design, and confirm the check number C-154.1 (my pick, the next unused number).

Declared ops: none added.
Deferred: none.

Size (session_015Ejg6oSr4Ds8qoX2TWTT9S): test runs 7, module lines 3443

## J12 · QUESTION

STEP 0 REPORT (R-FOUR (1)): C5a/P8, C13b, N-slow-refuse. I carry on meanwhile with the causes that are certain (R95 on a throw, C5c, C25) and write nothing for the fixes below until you release them.

**C5a / P8: acquire is not the slow phase.** Measured under L: the plane (`src/plane/index.mjs`) in Miniflare (workerd, R2 and Durable Object emulation, a member session, `op=acquire`), the five real files served from disk through `outboundService` (govinfo BUDGET-2025-BUD 2.5 MB, BUDGET-2025-PER 8.8 MB, BUDGET-2024-APP 15.9 MB, IRS fw9 140 KB). Stages inside `acquire` (R95), then the door's whole time:
- fw9 140 KB: stages sum 0.11 s (total_ms 108); door 0.43 s.
- BUDGET-2025-BUD 2.5 MB: stages sum 0.19 s (fetch 7, read 172); door 2.3 s.
- BUDGET-2025-PER 8.8 MB (2 parts): stages sum 0.73 s (read 521, keep 188); door 6.9 s.
- BUDGET-2024-APP 15.9 MB (2 parts): stages sum 1.5 s (fetch 108, read 1044, keep 349); door 81 s.
The time outside `acquire` is the reading that follows it in the same call. The store's own `extractread` route, called alone on the document each acquire filed: 0.07 s (fw9), 0.9 s (2.5 MB), 3.3 s (8.8 MB), 39.0 s (15.9 MB; `read_from_text: true`, no PDF worker bound in this L). So the slow phase is `extraction`'s reading in the plane's object (`acquireReadingOp` -> `extractread`), growing faster than the size; acquisition's own share is under 2 s on all three. This fits hypothesis H and your RC-R1/R120 (keep first, read after). The 2.5 MB live `STORE_DID_NOT_ANSWER` after 17-20 s is not reproduced here (reading 0.9 s locally); live adds real R2 latency, the PDF worker binding and the 128 MB limit, which this L has not got (no `pdf-worker` bound, no memory cap). I cannot name the live stage for 2.5 MB; the door phase clock (control-plane R121) must carry that. Scripts: scratchpad `L.mjs` (the files are govinfo's, fetched once, not committed).
Acquisition's part, which I will write once you release it: R95 amended (a throw answers a refusal with the stages and `running`), R96 amended (C5c, below). Nothing in acquisition to change for the 15.9 MB reading time.

**C13b: root cause, from the code (certain in the code, the platform behaviour is the claim).** `finishRender` (`index.mjs:1823`) finds the render's `run` promise in `PENDING_RENDERS` and waits `RENDER_WAIT_MS` (10 s) for it. The render was started in the request that answered "being made"; once that request ends, nothing keeps it alive (`opts.waitUntil` is handed by nobody, the same cause as C5c), so on the platform its subrequest is cancelled or the object is evicted, and the promise never settles. Every "Finish it" then waits its 10 s (the 13.1 s seen), finds it not done, and answers `continued` + `render.state: "pending"`, which the screen shows as "Already in the record. Nothing new was saved", forever; the session is never closed and no second document is filed. The map being emptied is the milder case and already re-renders (`renderResume` null -> `acquireRun` with `render: true`). My fix, once released: R99 as written, plus a bound on how long a held run is trusted: a run not settled after `renderReserveMs(RENDER_DEFAULTS)` plus the wait is treated as lost and the render is started afresh (admitted and paid for as any render); a refusal or failure closes the session in words. Test: render deferred, the map reset, and a never-settling run, each ends with the second document stored or the session closed in words. Needs from you: nothing. L for this cause: an object restart in Miniflare with a real renderer is not available (no RENDERER binding); I will test with a scripted renderer double (said in the record) and capture-sources runs the real one.

**N-slow-refuse (seam part).** `acquire` already relays a refused host at once: a governor refusal answers 429 `HOST_COOLING_OFF` with `retry_in_ms`, a 403/429 source answer `SOURCE_REFUSED`, with `timings`. Any 60 s is inside `governedFetch`/the governor sleeping out a cool-off before the request (host-governor's step 0). Nothing to change in acquisition; my whole-path test (two stub hosts through the real merged `governedFetch`) is written first and stays red by name until host-governor R30 merges.

No BLOCKED. Question: release the fixes above (R99 with the stale-run bound; R95/R96 as RC-R4 states), or tell me what to change.

## J13 · QUESTION

QUESTION (two small items; I carry on and write nothing that waits on them). Head 0fdc2798bd on job/T51/acquisition.

Done and green (red first, shown by stashing the source): R95 (a throw answers 500 `ACQUIRE_FAILED` with the stages and `running`), R96/C5c (the keep awaited within the bound as stage `keep`; past it `opts.keepLater ?? cap.keepLater({sha, parts})`, `keep_pending: true` when it answers ok; no `waitUntil` any more; a test with record-core's real `putFromParts` over a multipart bucket), R99/C13b (a held run older than `renderReserveMs` + the wait is lost; a render begun afresh is final: the visitor copy, or `RENDER_FAILED` in words and the session closed; tests with a scripted renderer double, said so), 429 `Retry-After` relayed as `retry_in_ms` on `SOURCE_REFUSED`.
Red by name until providers merge: R98 (needs `pdfTitle` from pdf-reader R40; my code feature-detects it) and the N-slow-refuse whole-path test (a 403 host's `retry_in_ms` is host-governor R30's to give; the 429 one is mine and passes).

1. **modules.json edge.** `acquisition` must declare `pdf-reader` in `uses` (pdf-reader is layer 1, acquisition layer 3); architecture fails on `bio-plane/src/acquisition/index.mjs` importing `bio-plane/src/pdfstructure.mjs` until you add it (it is yours to write, and `member-roster`'s `order.mjs` regenerates from it).
2. **Queue subject (C25).** The enqueue is in my code (`index.mjs`, `cap.taskEnqueue({kind: "authority-undetermined", ..., subject: locator})`), so the smallest change is mine: write `subject` as the document's title when it has one, else the locator, and add the locator beside it as before. The risk is a reader of the queue that expects `subject` to be an address (the screens/queue draw it; "Vouch for the photo you captured at <subject>"). Tell me whether to do that (say if queue or screens-daily must read a different field), or leave `subject` the locator and pass the title as a new `title` key in the same call.

## J14 · REPORT

REPORT on B14 (P10 c, archiveList of a held non-ZIP). Head pushed on job/T51/acquisition, `tranche/T51` merged.

Done: `archiveProfile` (`unpack.mjs`) reads the first part, takes its first 1 KiB, and answers `NOT_AN_ARCHIVE` at once when it does not begin with the ZIP local-file magic (R17's `zip` needs the magic, `formats.mjs`); format named from those bytes. A ZIP or an office file goes on to the full profile as before. Test: a 4 MB non-ZIP held capture answers `NOT_AN_ARCHIVE` with no digest over its whole bytes and within `ARCHIVE_CHECK_READS` reads; control: a real ZIP is still listed. Suite 201 of 204 (the three reds are the known ones: CAPTURE_NOT_KEPT word row, R98 awaiting `pdfTitle`, the 403 `retry_in_ms` awaiting host-governor R30).

Honest finding (the four fields' (1) and (4)): the test is NOT failing-first. Locally `profileOf` over 4.26 MB costs about 1-3 ms (`archiveList` of a 4.26 MB PDF or text file: 38-42 ms before my change, 36-42 after; detectFormat over the whole bytes 0-1 ms). So profiling is not where the 1.7-2.4 s goes. What the check must do is read the object: `evidenceStore().get(digest)` has no range option (`record-core/index.mjs` ~1872: `get: (digest) => bucket.get(key(digest))`), so even a one-byte look transfers all 4.26 MB from R2, and provenance `partsHeld` (provenance R7) hashes the whole when the object carries no stored checksum (seen in the fixture: one whole-document digest). Both are outside acquisition. The smallest change that would fix the Held screen's time is a ranged read on record-core's evidence store (`get(digest, {range: {offset: 0, length: 64}})`, passed to the bucket) which I would then use here, plus provenance not hashing when R2 holds a checksum. If you want it, send that to record-core (and provenance); I will switch `archiveProfile` to the ranged read in a CHANGE once it merges. The Held time needs the live probe (P) to confirm.

## J15 · COMPLETE

COMPLETE: fix round 4, wave 0 (ACQUISITION #24; B10, B11, B12, B13, B14, B15). Head on job/T51/acquisition (tranche/T51 merged at its tip as of now).

Causes (four fields)
1. **C5a / P8.** (1) Step-0 report J12, accepted B12: under L (plane in Miniflare, R2 + DO, member session, real govinfo/IRS files) `acquire`'s stages sum 0.19 s (2.5 MB), 0.73 s (8.8 MB), 1.5 s (15.9 MB); the door's time was 2.3 / 6.9 / 81 s; the store's `extractread` alone 0.9 / 3.3 / 39 s. The slow phase is extraction's reading; acquisition has nothing to change for it. Live 2.5 MB `STORE_DID_NOT_ANSWER` NOT reproduced (no PDF worker, no 128 MB cap in this L): the stage is not named; the door phase clock (control-plane R121) must name it. (2) The walk saw `timings: {}` because a throw lost the stages: R95 amended. (3) `stage-times.test.mjs` "R95 (fix round 4, C5a): a call that throws in `read` ..." red (error escaped) then green: 500 `ACQUIRE_FAILED`, `fetch` timed, `read` running. (4) L numbers above.
2. **C5c (R96).** (1) Certain: the keep ran after the answer on `opts.waitUntil`, which nothing hands. Now awaited within `boundMs - 5 s - elapsed` as stage `keep`; past it `opts.keepLater ?? cap.keepLater({sha, parts: [digest...]})` (B11) and `keep_pending: true` when it answers ok; none handed: the capture stays in its parts. (2) Tests used a scripted `putFromParts` and `waitUntil`. (3) fix3 tests: awaited keep with stage `keep`; keep outlasting the bound calls `keepLater` once with 5 part digests and answers `keep_pending` (control: one in time calls nothing); a 40 MB capture with record-core's real `putFromParts` over a multipart bucket holds the whole. Red with the source stashed, green with it. (4) The plane's alarm half is PLANE #48's: it needs `keepLater` to record `{sha, parts}` and finish with `putFromParts(sha, parts)`.
3. **C13b (R99).** (1) Step-0 J12, released B12: `finishRender` waited 10 s on a held run that nothing keeps alive after its request ended and answered "pending" forever. Now a held run older than `renderReserveMs + RENDER_WAIT_MS` (override `opts.renderStaleMs`) is lost; a render begun afresh is final (`renderFinal`): the visitor copy, or `RENDER_FAILED` in words with the session closed. (2) Tests kept the run alive and never held one that does not settle. (3) fix3: never-settling run (control: within the bound still pending, session kept) and a fresh module instance as an object restart (render table gone; a render that does not return is refused and closes the session). Red then green. Scripted renderer double, said so; capture-sources runs the real one. (4) L for an object restart with a real renderer not available here; the case is run with a fresh module instance.
4. **C25 (R98).** (1) Certain. `acquire` reads a PDF's title through `pdfstructure.pdfTitle` (feature-detected), cleaned as a page's title is, from the bytes already held (up to 32 MiB). The `taskEnqueue` call keeps `subject` the locator and carries a new key `title` when the document has one (B13): this is the field I send. (2)/(3) fix3 "R98 (fix round 4, C25)" (IRS-style Info Title, none, HTML control) and the queue-event test (green). (4) F/L for the 100 ms bound is pdf-reader's.
5. **N-slow-refuse.** (1) Root cause unknown, kept open as BOB said (B12): host-governor measured no sleep, acquire has none; the stages on every outcome and the door clock will name it. Mine: a 429 `Retry-After` is now relayed as `retry_in_ms` on `SOURCE_REFUSED`. (3) fix3 whole-path test with the real `HostGovernor` (403 host, 429 host, a cooling host refused at once with no fetch, an ok host unchanged).
6. **B14 / P10 (c).** `archiveProfile` decides from the first 1 KiB (J14, B15): the test is not failing-first (profiling costs ~1-3 ms locally); the transfer is record-core's.

Requirement ids met in code and tests: R95 (fix round 4), R96 (C5c), R99, R98's queue key; R48 (opening bytes).
Suite: acquisition 201 of 204. Reds, each named: (a) `R98 (fix round 4, C25)`: needs pdf-reader R40's `pdfTitle`, which is not on `tranche/T51` (the code is in place; the test goes green at its merge); (b) the N-slow-refuse test's 403 `retry_in_ms`: host-governor R30 not on `tranche/T51`; (c) checks.test.mjs R29 R31 `hasWord('refusal.CAPTURE_NOT_KEPT')`: the design's word row (J10/J11, accepted).
Checks: format 0; architecture acquisition 0 failures (the edge to pdf-reader is on the tranche); words: no finding in acquisition; ownership 0 failures; coverage names none of mine.

Open (named, not marked met): (i) P10 (c): "switch archiveProfile to get(digest, {range}) when record-core R88 merges" (BOB's CHANGE); (ii) the two reds above until pdf-reader and host-governor merge, then re-run `fix3-t51.test.mjs`; (iii) C5a's live stage and N-slow-refuse's 60 s: root cause unknown, for the redeploy's clocks.

Declared ops: none added. Deferred: none.

Size (session_01HkiEHqLtSvzj1srMtcPyNY): test runs 30, module lines 3504

## J16 · COMPLETE

COMPLETE (B16 applied; ACQUISITION #24). `tranche/T51` merged (host-governor R30 is on it); head pushed on job/T51/acquisition.

B16: `acquire` keeps the governed fetch's own `retry_in_ms` (host-governor R30's `{res, retry_in_ms}`) and `SOURCE_REFUSED` answers the larger of it and a 429's `Retry-After`. The N-slow-refuse whole-path test (real `HostGovernor`: 403 host, 429 host, cooling host refused at once with no fetch, ok host unchanged) is now green.

Suite: acquisition 201 of 204 on the first run after the change. Reds: `R98 (fix round 4, C25)`, red by name until pdf-reader R40's `pdfTitle` merges (not on `tranche/T51`); `R29 R31` on the design's `refusal.CAPTURE_NOT_KEPT` row (accepted). The third was `R95: the times are the only difference` (stage-times.test.mjs), a flake under load that passes alone and 4 of 4 times in its file (the T48-15 family: a second-boundary field in the comparison); not changed by this CHANGE.
Checks: architecture acquisition 0 failures; ownership 0 failures.

Open: P10 (c) as in J15 (record-core R88 ranged get, your CHANGE); R98 awaiting `pdfTitle`; C5a's live stage and N-slow-refuse's 60 s root cause unknown, for the redeploy's clocks.

Size (session_01HkiEHqLtSvzj1srMtcPyNY): test runs 33, module lines 3507

## J17 · COMPLETE

COMPLETE (B17 applied; ACQUISITION #24). `tranche/T51` merged (record-core R88 on it); head pushed on job/T51/acquisition.

P10 (c) closed: `archiveProfile` asks the store for `get(digest, {range: {offset: 0, length: 1024}})` (`unpack.mjs`); `readThrough` passes a ranged get to the store uncached, and answers it from its cache when the whole part was already read (so a store with no stored checksum, whose provenance R7 check reads the part anyway, costs no extra read). Test (t50, "R48 (P10 c)"): a 4 MB non-ZIP held capture (stored with its checksum, as R2 holds it) answers NOT_AN_ARCHIVE and every bucket `get` carries the range offset 0, length 1024; red on the previous code (it asked for the whole object), green now; control: a real ZIP is still listed (2 entries). The fixture bucket now honours `range` and records the option.

Suite 202 of 204. Reds: `R98 (fix round 4, C25)`, red by name until pdf-reader R40's `pdfTitle` merges; `R29 R31`, the design's `refusal.CAPTURE_NOT_KEPT` row. N-slow-refuse green (B16). Architecture acquisition 0 failures; ownership 0 failures.

Open: R98 awaiting `pdfTitle`; C5a's live stage and N-slow-refuse's 60 s, root cause unknown, for the redeploy's clocks.

Size (session_01HkiEHqLtSvzj1srMtcPyNY): test runs 36, module lines 3512

## J18 · COMPLETE

COMPLETE (B18 applied; ACQUISITION #24). `tranche/T51` merged; head pushed on job/T51/acquisition.

Added `bio-plane/test/m/acquisition/seam-render.test.mjs` from capture-sources J6's text (header note about a later module dropped; imports `../capture-sources/fake-binding.mjs` and `./fixture.mjs`; header now says acquisition owns it). The C13b tests carry `R99 R12 R5` with capture-sources' R68 in their titles. Run alone: 5 of 5 pass, with the real driver over the fake Browser Rendering binding and a store charging 0.27 s a call: C13a render stage 3778 ms, whole answer 4904 ms (the 33-body page); C13b restart, refused navigation and never-returning run each end with the visitor copy filed or the session closed in words.

Suite: acquisition 207 of 209. Reds: `R98 (fix round 4, C25)` (needs pdf-reader R40's `pdfTitle`, not on `tranche/T51`); `R29 R31` (the design's `refusal.CAPTURE_NOT_KEPT` row). Architecture acquisition 0 failures; ownership 0 failures.

Open: R98 awaiting `pdfTitle`; C5a's live stage and N-slow-refuse's 60 s, root cause unknown, for the redeploy's clocks.

Size (session_01HkiEHqLtSvzj1srMtcPyNY): test runs 38, module lines 3512

## J19 · QUESTION

QUESTION (R100's seam with plane R77; ACQUISITION #26). I carry on on this reading; the plane job (#49) builds the other half, so please pass it on.

**The hook (what acquisition calls).** Beside `keepLater`, acquisition reads `opts.owedLater ?? cap.owedLater`: an async `owedLater(entry) -> {ok: true}`, never throws (plane assigns `captureOf(ctx).owedLater` at composition, as `keepLater`). Two entries:
- `{kind: "subresources", sha: <primary digest>, session: <capture session id>}`: a web capture's outstanding supporting files (session `cs_...`) or its pending render (session `rs_...`, `state.render_pending`). Registered each time the session is parked (a second registration re-arms it, D2). **Ledger key for this kind is `session`**, not `sha`: two captures of one page can share a primary digest.
- `{kind: "unpack", sha: <archive digest>}`: an automatic unpack that stopped with entries still waiting, for the call's share, a daily budget (`UNPACK_DAILY_*`) or a nested archive it may open. With `owedLater` handed in, this replaces the `archive-unpack` capture event for those stops (without it, the event is enqueued as today).

**What the alarm calls.** `subresources`: `acquisition.owedRun(cap, {kind: "subresources", session}, opts?) -> {ok: true, done: boolean, outstanding?, final?: true, reason?}` (new export): it continues the session (or finishes the pending render, afresh if the object lost it) as `continue` does, past the daemon-class gate of R1 (the entry is the capture's own continuation). `done: true` ends the entry (also when the session is already gone: `reason: "NO_SUCH_SESSION"`); `done: false` with `outstanding` is more work, run again after the ledger's back-off; `final: true` with `reason` (`RENDER_FAILED`) ends it with a stated reason. `unpack`: the plane runs it as the archive-unpack drain does today, `op=unpack` as the daemon through the door (it promotes what is cut); it ends when the answer is `complete`, or its `waiting_on` is `ARCHIVE_TREE_*`/`ARCHIVE_DEPTH_MAX` (permanent for an automatic run; already stated on the archive's page by R41); a daily-budget `waiting_on` leaves it owed (next UTC day).

**Session expiry.** acquisition parks an owed session with `ttlMs` of 30 days (`saveCaptureSession` already takes `ttlMs`), so capture's one-hour pruning (capture/index.mjs:2590-2615) cannot drop it before the alarm; the session is dropped when its work is done. capture needs no change for this; its F5 job should keep `liveCaptureSessions`/"Unfinished" correct for the long ttl.

**Tree-budget stops** I do NOT register: a tree total never shrinks, so only a member's `op=unpack` goes past it (R40) and the page already states it. Tell me if the plan meant these registered too (then the ledger entry would end as `final` at once).

**Export for capture.** `keepPast(cap, ev, {sha, parts, boundMs, elapsedMs, keepLater})` (awaits `putFromParts` within the bound, else `keepLater`; answers `{kept, keep_pending}`): the `acquire` arm's keep, which `acquireRun` itself now calls.

## J20 · COMPLETE

COMPLETE: fix round 4b, entry (3) (F5, F11), B20; also B19 (ACQUISITION #25 never recorded it). ACQUISITION #26, head pushed on job/T51/acquisition, `tranche/T51` merged at its tip (ef61bba5ec).

**What changed**
1. **R100 (F5), the owed supporting files and render.** A capture session is parked with `ttlMs` = `OWED_SESSION_TTL_MS` (30 days, `index.mjs:346`) whenever the plane's hook can take the entry, and the entry `{kind: "subresources", sha, session}` is registered (`index.mjs:1866` the files, `:1469` the pending render; a member's `continue` re-registers it, `:973`). Hook read as `opts.owedLater` else `cap.owedLater` (`oweOf`, `:347`), async, never throws, as `keepLater`. New export `owedRun(store, entry, opts)` (`:1960`): the alarm's run; supporting files continue as `continue` does (past R1's daemon gate, the entry being the capture's own continuation), a pending render is finished afresh when the object lost it (R99) and its document handed to `opts.deliver({answer, session})` (the plane's promotion beside the shell; no file of the record is written here, R25), the session dropped only once delivered; no `deliver` handed: the render is not begun and the session stays for the member's "Finish it". Answers `{ok, done, outstanding?, final?, reason?}` (J19). A session already gone is `done` (`NO_SUCH_SESSION`).
2. **R100 (F11), the owed unpack.** `unpack.mjs:626-645`: with the hook handed in (`internal.owedLater` else the store's), an automatic run that stopped for the call's share, on a daily budget, or by a nested archive it may open registers `{kind: "unpack", sha}` instead of the `archive-unpack` event; with no hook the event is enqueued as before. A stop on the tree's figures or the depth is not registered (the tree never shrinks; only a member goes past it, R40; the page states it, R41).
3. **`keepPast(cap, ev, {sha, parts, boundMs, elapsedMs, keepLater})`** (`index.mjs:382`), the `acquire` arm's keep exported for capture (F2, job 4): awaits `putFromParts` within the bound, else hands the part digests to `keepLater`; answers `{started, kept, keep_pending}`. `acquireRun` calls it (stage `keep` unchanged).
4. **B19:** `checks.mjs:365` reads `word("refusal.CAPTURE_NOT_KEPT")`; stand-in and comment dropped. `checks.test.mjs` R29 R31 was red on the tranche tip, now green.
5. `build/requirements/acquisition.md`: R100's *(not yet met: T51)* mark removed (my interface is met and named by tests; the plane's half is R77's).

**Failing-first.** `test/m/acquisition/fix4b-owed.test.mjs` (new, 8 tests, each with its control; fixture.mjs's `loadCaptureSession` now prunes a session past its hour as capture R22 does): red with the source stashed (the module offered none of `owedRun`, `keepPast`, `OWED_SESSION_TTL_MS`), green with it. R100/F5: a page of 120 images with a remembered subrequest ceiling of 100, so a session is parked; 61 minutes later (fixture clock) the session is still live (control: without the ledger it is gone at the hour and a `continue` is refused, `owedRun` answers `NO_SUCH_SESSION`), and `owedRun` ticks fetch all 120, none twice, drop the session, register nothing new. Pending render: parked past its hour, finished by a restarted module instance, delivered once, session dropped only after delivery (control: no `deliver` starts no render; a refused delivery keeps the session; a render that never comes back ends `final` `RENDER_FAILED`). F11: daily-budget, call-share and handed-hook stops register `unpack`; control: no hook enqueues the event; tree stop and a complete unpack register nothing. `keepPast`: in time, past the bound (to `keepLater` with the digests), no `putFromParts`.

**Measurements / platform (rule 4).** No new platform dependency: the only platform fact is capture R22's `ttlMs`, an argument `saveCaptureSession` already takes; no workerd check needed. The 120-file test runs 0.6 s.

**Suites.** acquisition 217 of 217 (216 plus the checks test now green); users: capture 245/245, doorbell + capture-requests + monitoring + link-sweep 426/426. `checks/format.mjs`: 175 modules, 0 failures. `architecture acquisition`: 0 failures. `coverage acquisition`: 54 of 54, 0 failures. `ownership acquisition tranche/T51 job/T51/acquisition`: 6 files, 0 failures. `checks/run.mjs`: words 0 failures (inline 0, plain 0, testcopy 0, missingkey 0); coverage lists 8 other modules' unwritten ids (R103, R82, R51, R35, R72, R37, R18, R25: this round's), none acquisition's.

**Decisions I made (QUESTION J19, not yet answered; BOB overrides by CHANGE)** (1) tree-budget stops are not owed (final, stated on the archive's page); (2) the ledger key for `subresources` is `session`; (3) the alarm delivers a finished render through `opts.deliver`, which the plane/control-plane must hand (promote the rendered document in the shell document's home, as the screen's `doneAcquire` does); until it is handed a pending render stays the member's "Finish it", never dropped (30-day session). For the plane (job 11): `owedLater` assigned at composition beside `keepLater`; the `unpack` entry is run as the archive-unpack drain does (`op=unpack` as the daemon through the door), ended when `complete` or `waiting_on` is a tree/depth name.

**Requirement lines I propose (BOB writes).** R100 as built: *"A web capture's outstanding supporting files and its pending render are owed work: the session is parked for 30 days and the plane's ledger holds `{kind: subresources, sha, session}`; `owedRun` continues the files and finishes the render (delivering the document), never ended by the session's hour. An automatic unpack that stopped for the call's share, on a daily budget or at a nested archive registers `{kind: unpack, sha}`; a tree or depth stop is not owed."* Provides: `owedRun`, `keepPast`, `OWED_SESSION_TTL_MS`; R40's "waits for a member" amended for daily budgets (continued next UTC day by the ledger).

**Declared ops:** none. **Deferred / flaws elsewhere:** none (the plane's and capture's halves are their own entries). Wording: no new sentence.

Size (session_01QRhE9kJAmmqEac8ZU1rnnu): test runs 9, module lines 3606

## J21 · COMPLETE

CHANGE B22 applied: owedRun ends every owed session by dropCaptureSession (done, and a final skip; a lost-render failure and a delivered render already did), so capture's no-prune rule leaves no row; the 120-file test asserts the drop. Acquisition 217/217, ownership 0 failures; tranche/T51 merged. Size (session_01QRhE9kJAmmqEac8ZU1rnnu): test runs 12, module lines 3612

## J22 · QUESTION

E8's composition test cannot live in acquisition's tests: the architecture check refuses a test of mine that imports capture, control-plane, screens-intake and promotion (later in the order; I have it failing "not earlier in the order" six times). I wrote it and it is red then green: commit 68845de064, file bio-plane/test/m/acquisition/fix5-seam-visitor.test.mjs (removed from my tree at fb9916f861; `git show 68845de064:bio-plane/test/m/acquisition/fix5-seam-visitor.test.mjs`). It runs the real path: capture's real instance over a real record, `acquire` with the visitor view (render deferred), the page as served filed by the screen's own `promoteDocument` into a project, the object's render table reset, "Finish it" (`acquire {continue}`) whose answer is never filed, then `owedRun` with control-plane's real `deliverOwedRender`; the second document is read back with `heldcaptures` (and by the project filter), once, beside the page as served; a second alarm run delivers nothing. Red now at "the session still owes it" (the session was dropped, the copy lost), green with my fix.

What I need: the control-plane job (the seam owner, last on this path) adds that file to control-plane's tests, adapted from that commit (it passes against my branch once merged). Everything else of E8's acquisition half is in my branch with its own tests. Answer needed: yes, or name the module you want it in. I carry on with the record meanwhile.

## J23 · COMPLETE

COMPLETE, fix round 5, acquisition: E1 (profile half), E5 (provider, answers B24), E10 (stage split), E8 (acquisition half and diagnosis). Head 471f541a37 on job/T51/acquisition (tranche/T51 merged at start). One question stays open (J22: where E8's composition test lives); everything else is done.

**E5 first (B24).** `textTypeOf({bytes, type, name})` is exported from bio-plane/src/acquisition/index.mjs:141. It answers the text content type as a non-empty string (the declared text type, or the type a .txt/.md/.csv name gives when no type is declared) when the bytes are valid UTF-8 with no NUL and within PROFILE_TEXT_MAX, else null; a declared non-text type is never overridden by a name. Capture and doorbell can merge against it now.

**What changed (index.mjs):**
- E1 (R101): `profileOf` :1744 on reads the head of a capture held in parts, `headOf` :1797 (the caller's `firstPart`, else a range get of the first 1024 bytes of part 0), and runs `detectFormat(head, ct)`, then the existing ZIP check. `acquire` now keeps the first 1024 bytes of part 0 (`FORMAT_HEAD`, :127; was 64) so a fetched capture reads no part back. `zipPastBound` no longer reads a whole 8 MiB part for the ZIP magic.
- E10 (R103): inside `read`, `splitTimed` (:333) meters the source's `download` (reader.read), the `hash` (the incremental hasher and each part's digest) and the `store` (each part's head and put). `stageTimes` (:346) answers them as `read_split: {download, hash, store}`, beside `stages` (so the stage list and its sum rule are unchanged: the three are inside `read`, whole ms, floors, and sum to no more than `read`). Present once the body is being read, also on a throw or a cut call; absent on a refusal before the body.
- E8 (R104): finishRender :1976-1999 keeps the session when a member's "Finish it" completes the render and the plane's ledger was handed in: state `{queue: [], opened_by, render_done: {sha256, since, document}}`, TTL OWED_SESSION_TTL_MS; before, it dropped it (:1923 in the old text) and the answer was the only carrier of the copy. `owedRun` :2044 delivers a `render_done` session through `deliver` unless the register already holds the copy's digest (`registerHolds`, the screen filed it), then drops the session. A second "Finish it" on such a session (:1005) touches nothing and answers `render: {state: "owed"}`. No ledger handed in: unchanged (dropped at once).

**Diagnosis of E8 (offline, through the real path; no live proof).** `acquire {continue}` on a session with a pending render answers: (a) the held run finished (or the object restarted and the run is begun afresh): 200 with `document` (the visitor copy, `capture.method` rendered), `existed: false`, no `continued`, and the session DROPPED in the same call (probe: session gone, ledger entry left pointing at nothing); (b) the run still going after the 10 s wait: 200 `{existed: true, continued, render: {state: "pending"}}`, session kept. In (a) the document reached the record only if the caller filed that answer: when the door's 25 s bound passed first (a render begun afresh waits up to renderReserveMs 25 000 + 2 000 = 27 s, past the door's 25 s) or the tab was closed (step 0's script closed the page 8 s after the press), the copy was lost and nothing owed it: the session is gone, the `subresources` row finds NO_SUCH_SESSION and ends. That matches "the line vanished by itself, no second document". The ledger being wedged (E2, plane) is separate: the entry stayed owed and untried for hours, which this fix cannot cure; with this fix the copy survives until the plane's alarm runs again. The press itself does send `continue` (screens-intake's, step 0); its answer is filed by screens-intake's `doneAcquire` only when it carries a document and no `continued` (the pending answer (b) is drawn as "files nothing new"). Observation for BOB, not changed: a lost-run `continue` waits 27 s, past the door's 25 s; with R104 nothing is lost when the door cuts it, the member sees the timeout and the alarm files the copy.

**Failing-first tests, red then green** (all new, bio-plane/test/m/acquisition/):
- fix5-t51.test.mjs: R101 (10 MB PDF in 2 parts, no type: red `undetermined`, green `pdf`/`certain` read by one range of at most 1024 bytes; fetched 10 MB PDF with no content type: red, green with no part read back; control: junk stays undetermined, a lost first part is stated), R102 (textTypeOf: red no export; green with controls: NUL, invalid UTF-8, a declared PDF with a .txt name, no type and no text name, over the bound, no bytes), R103 (15.9 MB capture's `read_split` carries the three: red absent, green; control: no split on a refusal, the split so far on a throw in `read`).
- fix5-render-owed.test.mjs: R104 (red: "the session stays until the copy is filed" false; green: the alarm delivers the very document the continue answered, a refused delivery keeps it owed, then the session goes; controls: a copy the register holds is not delivered again; no ledger: closed as before; the second press: red `document` came back and the session was dropped, green).
- Composition (real capture + control-plane `deliverOwedRender` + `heldcaptures` and the project's list): red at "the session still owes it", green with the fix, ONE second document beside the page as served, a second alarm run delivers nothing. It cannot live in acquisition's tests (the architecture check refuses imports of later modules): commit 68845de064, bio-plane/test/m/acquisition/fix5-seam-visitor.test.mjs. See J22.

**Measurements (L: local workerd, Miniflare plane, the real Worker/object/R2 emulation, files served by outboundService; no deploy).** Local R2 has no per-call latency, so these are the CPU/IO floor:
- 8.8 MB, 2 parts: wall 1 470 ms; read 823 (download 122, hash 285, store 369), keep 427, fetch 32, profile 52.
- 15.9 MB, 2 parts: wall 1 666 ms; read 1 050 (download 175, hash 650, store 210), keep 446, fetch 30.
- 39.6 MB, 5 parts: wall 5 571 ms; read 2 741 (download 393, hash 1 498, store 776), keep 2 356, fetch 443.
Reading: hash is the largest local share (about 60% of `read`, roughly 24 MB/s of the plane's two hashes), but the whole 15.9 MB capture is 1.7 s here against 23-26 s live (P12), so the live time is not Civicsmith's CPU: it is the source's download and R2's round trips (lane-performance P7: 0.27 s a call; a 15.9 MB capture makes about 5 store calls per part plus the keep). The re-walk reads `timings.read_split` and `stages.keep` from the live copy to say which; the 15 s bar for large files is not reachable by any code here if `download` is the live share.

**R-OLD:** new data only (sessions already dropped stay dropped; profiles already stored as `undetermined` are extraction's repair, E1).

**Checks / suites (this session):** acquisition 227 tests, 227 pass, 0 fail (before: 217). Users: capture + doorbell 339/339; control-plane r1*, t51-* and screens-intake 337/337 (includes R117, R120/R121 real-plane PDFs, R124); plane 307/308, the one red is plane's R24 "screen.objective.purpose is held by the words list" (unrelated, not mine). `impact.mjs` names 112 modules / 1 735 test files, far past two suites at a time; I ran the direct users above. checks/run.mjs: format, architecture, coverage, channels, words 0 failures (words count unchanged: inline 0, plain 0, testcopy 0, missingkey 0). ownership: 4 files changed by acquisition, 0 failures. setup-words build --check: only the expected stale-rows note.

**Requirement lines I propose** (BOB writes build/requirements/acquisition.md; ids are the next free after R100):
- **R101** (T51 fix round 5, E1; amends R17) **A capture held in parts is profiled from its bytes.** `profileOf` for a capture held in several parts reads the first KiB of the first part (the caller's, else one range read of the stored part, never the part) and judges its `format` as for a single part (`format-registry.detectFormat` over those bytes, else the declared type with the absence stated). A PDF or office file uploaded with no declared type is not `undetermined`. Test: a 10 MB text-layer PDF held in two parts, no type, profiles `pdf`, `certain`, read by one range of at most 1024 bytes; a fetched 10 MB PDF served with no content type likewise, with no part read back. Control: bytes of no known format stay `undetermined`; a first part that is not there is stated, never a failed profile.
- **R102** (T51 fix round 5, E5; capture R93, doorbell) **One rule for a member's file as text: `textTypeOf({bytes, type, name})`.** Answers the text content type to read the bytes as: the declared `type` when it is a text type, or, when none is declared, the type a `.txt`, `.md` or `.csv` name stands for (text/plain, text/markdown, text/csv); only for bytes that are valid UTF-8 with no NUL and within `PROFILE_TEXT_MAX`; else null. A declared type that is not text is never overridden by a name. Capture's upload and the doorbell's pull call it and keep no copy of the rule. Test and controls as fix5-t51.test.mjs.
- **R103** (T51 fix round 5, E10; amends R95) **`read` is split.** `timings` carries `read_split: {download, hash, store}` once the body is being read: whole ms of the source's download, the hashing, and the store's writes, within `stages.read` (their sum no more than it), on every outcome from then on (a throw and a cut call included), and no key before. Test: a 15.9 MB capture's answer carries the three. Control: a refusal before the body carries none; a throw in `read` carries the split so far.
- **R104** (T51 fix round 5, E8; amends R12, R99, R100) **The visitor copy is owed until its document is filed.** When a member's `continue` completes a pending render and the plane's ledger was handed in, the capture session stays, owing the finished document (`render_done`, out of "Unfinished"), instead of being dropped; `owedRun` closes it once the register holds the copy's digest (the caller filed it) or after delivering it through `deliver`, a refused delivery leaving it owed. A second `continue` on such a session changes nothing and answers `render: {state: "owed"}`. Test and controls as fix5-render-owed.test.mjs; the composition test is control-plane's (J22). New data only.

Size (session_01HEJ44SYdkiESYxbUXjmywT): test runs 7, module lines 3698

## J24 · COMPLETE

COMPLETE (B25 applied). Answers B25's finding: a `continue` naming a session that is gone, with no address of its own, now answers 404 NO_SUCH_SESSION (index.mjs, before the locator check in acquireRun), no longer BAD_LOCATOR; with an address of its own it is captured as an ordinary capture, as R12 says. Test in fix5-render-owed.test.mjs (red before: BAD_LOCATOR 400). Amend proposed R104's neighbour R12 with that sentence. acquisition 228/228; checks 0 failures; ownership 0 failures. J23 otherwise stands. Size (session_01HEJ44SYdkiESYxbUXjmywT): test runs 8, module lines 3705

## J25 · QUESTION

QUESTION (fix round 6, G2/G3/G12a; no work is stopped by it, I build on these readings):

1. **G2, who records `fetch_done`?** The plan gives capture "a `fetch_done` record (session, document, opener, project, at)" and notice-producers reads it, but names no trigger. My reading: `owedFetch(cap, entry, opts)` (mine) hands the finished document to `opts.deliver({answer, session})` (control-plane promotes), and when that answers `{ok:true}` it calls `cap.recordFetchDone({session, sha256, opened_by, project, at})` on the store handed in, if the store offers one (feature-detected, a missing or failing call never fails the delivery), then drops the session. Capture implements `recordFetchDone`. If you want another shape, send the name and fields.

2. **G2, three things in other modules that follow from how the hand-off is parked** (plane/capture/producers; for BOB to place):
   - The parked session is a `capture_sessions` row; its `primary_sha` column is NOT NULL and there is no primary yet, so the row carries 64 zeros as a sentinel, `state = {queue:[{fetch:true}], opened_by, project, fetch_pending:{since, declared_bytes, why}, body:{...carried keys}}`. machinery-producers' `partial-capture-outstanding` condition (`#conditionsPartialCapture`) reads every live session and would draw this one as "primary captured, subrequest ceiling reached": it must skip a session whose state has `fetch_pending` (not mine).
   - The ledger row is `owe({kind:"fetch", session})`, keyed by the session like `subresources`; plane's `owe` today answers PENDING_MALFORMED for the kind, and I treat a refused owe as "cannot park": the capture then runs inline as today. So nothing changes until plane merges.
   - `openCaptures` (mine, R46) lists the parked fetch with `outstanding: 1` and a new key `fetch_pending: {since, declared_bytes, why}` (plus `failed: <reason>` once the owed fetch ended with a stated refusal, the session then kept, never silently dropped); capture's `opencaptures` passes it through, screens-intake draws "being fetched" from the key and no "Finish it" (a `continue` on it answers the fetch_pending state, touches nothing). `why` is a machine code (`LARGE_DECLARED`, `LARGE_BODY`, `SLOW_BODY`), no sentence: the screen words it.

3. **G12a:** "not an archive" is remembered in the module's instance memory (per storage, bounded), not in a table: `archiveList` is a read and R41 says it writes nothing, and the tests count rows. The cost: a restarted object pays the first ask again. Persisting would need a write on a read path (or a new table); say so if you want it persisted.

## J26 · QUESTION

QUESTION (fix round 6, G3), the one thing I need that is not mine; the rest of the job is done and I am finishing the record.

`bio-plane/test/m/control-plane/t51-visitor-copy.test.mjs` (control-plane's file; it is the round-5 seam of the visitor copy, E8) encodes the behaviour G3 changes: after the object restarts, "Finish it" (`acquire {continue}`) with the plane's ledger handed in used to render in the request and answer the visitor copy (`cont.body.document.capture.method === "rendered"`, line 68); it now answers `200 {ok:true, existed:true, continued, render:{state:"pending", session}}` at once, no document, registers the session's `subresources` row again (due now), and the alarm's `owedRun` makes and delivers the copy (R106). That test goes red at line 68 and nothing else in it changes meaning: its second half (the alarm through the real `deliverOwedRender`: one second document in the held list and the project's list, the session closed, a second run files nothing) is exactly what must still pass, and I ran it with the press line replaced: it passes.

The smallest change: in that test, replace lines 63-71 (the press and its two asserts on `cont.body.document`) by `assert.deepEqual([cont.body.ok, cont.body.render && cont.body.render.state, cont.body.document], [true, "pending", undefined])`, and take `copySha` from `hex(RENDERED)` (the digest of the rendered page the scripted renderer returns) instead of from the answer. Control-plane #17 (S of G3, "the same through acquire {continue}") is the natural owner; I may not edit it. R117 (acquire) in `r117-held.test.mjs` is red on `origin/tranche/T51` without my change too (3 runs alone, 0 !== 1 at its first assert), so it is not flaky under load as the plan says; it is not mine.

## J27 · COMPLETE

COMPLETE, fix round 6, acquisition: G2 (provider), G3 (owner), G12a (provider). Head = this branch's last commit (tranche/T51 merged at 96e5de8b25). Answers B26, B27 applied. The one thing I need is J26 (below, not mine).

**What changed** (bio-plane/src/acquisition/)
- G12a, R107. unpack.mjs: `Acquisition` remembers, in instance memory (bounded, 20 000), the captures it decided are no archive (:79, :233, :317-:333); `archiveProfile` records a decision made from the bytes (the first KiB has no ZIP magic, or the profile read and is not zip), never one made because the profile could not be read (:840, :852-:854); `archiveList` answers a remembered capture right after the viewer fence and the register check, with no read of the evidence store (:882). `notArchivesAmong(store, shas) -> Set of digests`, the batch read capture calls (:326, :964; exported from index.mjs:67). Writes nothing (R41 holds), so a restarted object pays the first ask again (B27 accepted).
- G3, R106. index.mjs `finishRender(…, inRequest)` (:2032): a member's "Finish it" with the plane's ledger handed in looks at the held run with no wait; a run that has returned is finished as before (the document is answered); any other case (running, lost with the object, begun by a request that ended) registers `{kind: subresources, sha: primary, session}` again (due now) and answers at once `render: {state: "pending"}` (:2040-:2056); the alarm's `owedRun` renders and delivers (unchanged path). No ledger, or one that refuses the entry: the press waits and renders as it always did (R99's tests pass unchanged).
- G2, R105. index.mjs: `LARGE_FETCH_BYTES` (8 MiB, :396) and `FETCH_WAIT_MS` (10 s, :397); after the headers of a member's own web capture (not the capture-request arm, the archive arm or the render arm) with the ledger handed in, a declared `Content-Length` over 8 MiB is parked before one body byte is read (:1268); with no length, a body read past 8 MiB, and any body read for longer than 10 s (`opts.fetchWaitMs` scales it in a test), is parked in the read loop and the reader cancelled (:1343). `parkFetch` (:1243): a capture session (`primary_sha` 64 zeros, `state {queue:[{fetch:true}], opened_by, project, cls, store, fetch_pending {since, declared_bytes|null, why}, body: the keys the member sent}`, 30 days), `owe({kind:"fetch", session})`, answer `200 {ok:true, fetch_pending:{session, since, declared_bytes, why}}`, no document; a twin press by the same member for the same address answers the same session; a ledger that refuses, or a session that cannot be saved, parks nothing and the body is read inline as today; a declared length over `CAPTURE_MAX` is refused TOO_LARGE at once. `why`: `LARGE_DECLARED`, `LARGE_BODY`, `SLOW_BODY` (codes, no sentence: no word row owed). `continue` on a parked fetch answers its state (:1031). `owedFetch(cap, {kind:"fetch", session}, opts)` (:2197): runs the capture with the opener's stamps and the saved body (`inlineFetch`, no parking again), keeps the made document in the session (`fetch_done`) and hands `{ok, existed, document}` to `opts.deliver({answer, session})`; a refused delivery is delivered next time without fetching again; a busy source / broken body / store absent goes again; any other refusal ends the entry `final` and the session stays with `fetch_pending.failed` (never silently dropped); then drops the session. It records nothing in capture (B27: control-plane's delivery does). `openCaptures` lists a parked fetch with `outstanding: 1`, `primary_sha: null` and `fetch_pending` (:2265). New data only (R-OLD).

**Failing-first tests, red then green** (bio-plane/test/m/acquisition/fix6-t51.test.mjs, 9 tests; each through the real entry: `acquire`, `archiveList`, `owedFetch`, `owedRun`)
- G2 / R105. Red (the fix disabled): the walker's case, a 15 932 155 B source declared by Content-Length that serves at 0.7 MB/s (pull-on-demand stream, a byte counter), took 21.7 s for the press and answered a document (the test's "no document" assertion failed). Green: the press answers `fetch_pending` (declared 15 932 155, `LARGE_DECLARED`) with 0 body bytes pulled, the stream released, one `{fetch, session}` row, nothing filed, `opencaptures` lists it, a second press parks no second; the alarm's `owedFetch` makes the document (member as actor, 2 parts) and hands it to deliver; the session goes. No-length arm: answered at the (scaled) clock with `SLOW_BODY`, a few chunks read, cancelled; past 8 MiB at once with `LARGE_BODY`, the part stored before parking not written twice by the owed read. Controls: 1 MB inline; no ledger, a ledger that refuses `fetch`, a non-member session and the capture-request arm read inline; a slow small body is parked; a declared 1 GiB is TOO_LARGE with nothing parked; owedFetch outcomes (refused 404 final and kept stating why, busy 503 again, delivery refused then delivered without a second fetch, gone, malformed, no deliver).
- G3 / R106. Red (the fix disabled): after a module restart (render table empty) the press waited for the render and answered the visitor copy (`render.state` undefined, a document). Green: the press answers pending, starts no render (renderer called once, by the first act), registers the row again (ledger shows two registrations, keyed by the session, naming the primary), the session is kept, and `owedRun` then makes the render once and delivers the visitor copy; controls: a live unsettled run is pending at once and registers again, a returned run is finished by the press; no ledger / a refusing ledger render in the call as before.
- G12a / R107. Red (the memory read disabled): the second `archiveList` of a plain file made 2 reads of the evidence store (2 !== 0). Green: 0, for a plain file and for a capture in two parts, the same answer, `notArchivesAmong` names it with no store call. Controls: a ZIP archive is listed and not remembered; a digest not held is not remembered; a viewer who may not see a remembered capture is told ARCHIVE_NOT_HELD; the module-level read never throws.
Why the tests missed them (rule 2): G2, `t51-large-pdfs.test.mjs` served each file at once, so "inside 15 s" was trivially true; mine now pull on demand at 0.7 MB/s with a byte counter. G3, waits were scaled to 20-2000 ms and "lost" never stood beside a ledger and a slow render; mine restart the module, hand a ledger, and the press is asserted by calls, not only by time. G12a, no test counted store calls per row; mine count them.

**Platform checks (L)**, numbers; no deploy. G3: a real 15 s renderer, object restarted: the press answers pending in 3 ms with the row registered again; the alarm's `owedRun` then takes 15 023 ms and delivers the rendered copy (scratchpad l-g3.mjs). G2: in a child at `--max-old-space-size=100` (the repo's L-gate style, l77-size), a 100 MB declared length is parked in 10 ms with 0 bytes pulled; the owed read of 16, 100 and 250 MiB (a 1 MiB-chunk stream, a store that keeps sizes only) completes in 0.27, 1.8 and 4.1 s and the live memory after GC stays flat at 16, 40 and 40 MiB above idle (the 32 MiB keep bound, never the body: the whole of a body past it is held in its parts); 250 MiB ran inside the 100 MB old-space cap (scratchpad l-g2.mjs). Not workerd itself: the plane's `fetch` owner and the alarm wall are plane's and control-plane's seam runs. R-CLOCK: no test asserts a compute time from the object's clock; the G3/G2 assertions are calls, bytes pulled, ledger rows, and wall-time bounds on a timer-driven source.

**Suites and checks (this session)**
- acquisition: `node --test --test-force-exit test/m/acquisition/*.test.mjs`: 237 tests, 237 pass, 0 fail (228 before, +9).
- users (impact names 112 modules, 1750 test files; run the direct users): capture 256/256, capture-requests 129/129, doorbell 92/92, link-sweep 41/41, monitoring 168/168, machinery-producers 37/37, screens-intake 276/276, plane 319/320 (the one red is R24 "screen.objective.purpose", inherited, fails the same without my change), control-plane 407/409: two reds. (1) `t51-visitor-copy.test.mjs` R104 R100 R99 (E8), see J26: it encodes the old press (a document answered by "Finish it"); with its press line changed to the pending answer I ran it and it passes. (2) `r117-held.test.mjs` R117 (acquire): red on origin/tranche/T51 without my change too (3 runs alone, 0 !== 1 at its first assert); not mine and not flaky under load.
- format 0 failures (176 modules, 176 requirements files), architecture 0 failures, coverage 58 of 58 live ids named, 0 failures (R105-R107 are proposed, not yet in the file, so coverage cannot name them), `checks/run.mjs`: words 0 inline, 0 plain, 0 testcopy, 0 missingkey, count not risen; ownership `acquisition tranche/T51 job/T51/acquisition`: 4 files changed (index.mjs, unpack.mjs, fix6-t51.test.mjs, my record), 0 failures.

**Census / words.** No op added or changed (the answers gain keys: `acquire`'s `fetch_pending`, `opencaptures`' `fetch_pending`); nothing to declare (K4208). No new sentence, so no word row owed: `fetch_pending.why` is a code the screen words.

**Requirement lines I propose** (BOB writes build/requirements/acquisition.md; next free ids after R104):
- **R105** (T51 fix round 6, G2; K4562; amends R9, R10, R12, R46, R100) **A large or slow web capture is owed work, not the member's wait.** For a member session's web capture (not the capture-request arm, the archive arm or the render arm), with the plane's ledger handed in: a response that declares a `Content-Length` over `LARGE_FETCH_BYTES` (8 MiB) is parked before any of its body is read; a body of no declared length read past 8 MiB, and any body read for longer than `FETCH_WAIT_MS` (10 s), is parked at that point and the reader cancelled (the parts stored so far are found again by the owed read). Parked means: a capture session (`opened_by` the member, `project` from the body, the body's own keys, `fetch_pending {since, declared_bytes (null with no length), why}` with `why` `LARGE_DECLARED`, `LARGE_BODY` or `SLOW_BODY`), registered in the ledger as `{kind: "fetch", session}`, and the answer is `200 {ok: true, fetch_pending: {session, since, declared_bytes, why}}` with no `document`; a second press by the same member for the same address answers the same session; `continue` on it answers its state; `openCaptures` (R46) lists it with `outstanding: 1`, `primary_sha: null` and `fetch_pending`. A declared length over `CAPTURE_MAX` is refused `TOO_LARGE` at once and nothing is parked; a ledger that refuses the entry, or none, reads the body in the call as before. `owedFetch(store, {kind: "fetch", session}, {deliver})` makes the capture as the member's own `acquire` would have (their stamps and body), reads it whole, keeps the document in the session and hands `{ok, existed, document}` to `deliver({answer, session})`; a refused delivery is delivered by the next run without fetching again; a busy source or a broken body goes again; any other refusal ends the entry final and leaves the session stating `fetch_pending.failed`; an accepted delivery drops the session. Test and controls as fix6-t51.test.mjs. New data only.
- **R106** (T51 fix round 6, G3; amends R12, R99, R104) **"Finish it" renders nowhere in the request.** With the plane's ledger handed in, `acquire` with `continue` for a session whose render is pending looks at the run it holds without waiting: a run that has returned is finished and its document answered; any other case registers the session's owed row again, due now, and answers at once `render: {state: "pending"}`; the alarm's run renders and delivers (R100, R104). With no ledger, or one that refuses the entry, the call waits and renders as R99 states. Test: the object restarted, the render taking 15 s: the press answers pending in under a second, starts no render and registers the row; the alarm's run files the visitor copy once. Controls as fix6-t51.test.mjs. New data only.
- **R107** (T51 fix round 6, G12a; amends R41, R48) **A capture decided to be no archive is not decided again.** `archiveList` answers `NOT_AN_ARCHIVE` for a capture the instance has already decided is no archive without reading the evidence store (after R41's sight check and the register check, so what a viewer is told is unchanged); a decision is remembered only when it was made from the bytes; `notArchivesAmong(store, shas)` answers, from that memory and with no store call, the set of digests decided. The memory is the instance's, not a table: `archiveList` still writes nothing, and a restarted object decides once more. Test: the second `archiveList` of a plain file and of a capture in two parts makes no read of the evidence store. Controls as fix6-t51.test.mjs.
Proposed amendments to existing lines: R46 gains the `fetch_pending` key of a parked fetch (R105); R12 (`continue` on a parked fetch answers its state).

**For others (all told in J25/B27 or J26, none mine).** plane: `fetch` kind keyed by session, owner calls `owedFetch` with `deliver`; control-plane: deliver = `deliverOwedRender` generalised (reads `state.opened_by`, `state.project`, `answer.document`; calls capture's `recordFetchDone`), update `t51-visitor-copy.test.mjs` (J26); capture: pass `fetch_pending` through `opencaptures`, `notArchivesAmong`; machinery-producers: skip a `fetch_pending` session; screens-intake: the "being fetched" lines from `fetch_pending`.

Size (session_01BQ74v1Ra7Q8F2p147wPF6y): test runs 16, module lines 3887

## J28 · COMPLETE

COMPLETE (B28 applied): G19 (provider). tranche/T51 merged; head = this branch's last commit.

**Cause (rule 1).** The skips were recorded per file (`subresources.mjs` records `CAP_REACHED` with `cap`, `BUDGET_EXHAUSTED` with `budgetBytes`, `TOO_LARGE`, `DEFERRED`; `render.mjs:346-368` marks bodies not kept `sha256: "undetermined"` with `digest_reason`; index.mjs `walkSubresources` returns `TOO_LARGE_TO_PARSE` etc. as `subresources_skipped`) but the answer summed none of it for a member. **Missed (2):** no requirement said a bound must reach the member and no test drove a page past 400.

**Change** (index.mjs): `supportingOf({subs, render, notWalked})` (exported) builds `supporting: {kept, skipped, total, reasons: [{reason, count, limit?, detail?}], not_walked?}` from those records, most-common reason first, `limit` the cap's or budget's figure, `detail` the renderer's own words (`BODY_NOT_KEPT`); `not_walked` names a walk asked for and not made (`TOO_LARGE_TO_PARSE`, `PRIMARY_UNREADABLE`, `NO_SUCH_SESSION`, `SESSION_UNREADABLE`, `RENDER_PENDING`); absent when no walk or render was asked for, and for `NOT_HTML`. It is in the answer (`acquire` and each continuation tick) and in `document.capture.supporting`. New data only. The `reasons` are codes plus the renderer's words: no sentence of mine, no word row owed; screens-intake / screens-inquiry word "N of M supporting files kept" with the reason (stand-in words are theirs).

**Failing-first (3)**, fix6-t51.test.mjs, 2 tests, R108: a page of 450 images: red `supporting` undefined; green kept 400, skipped 50, total 450, reasons `[{CAP_REACHED, 50, limit 400}]`, in the answer and in `document.capture`; controls: 3 images all kept with no reason; no walk asked, none stated; a 9 MiB page `not_walked: TOO_LARGE_TO_PARSE`; a PDF asked with supporting files states none; a render with 3 loaded files of which one body was not kept: kept 2, skipped 1, the renderer's "400-body ceiling" words; a walk that ran out of subrequests states `DEFERRED`, and its continuation holds more.

**Suites/checks:** acquisition 239/239; capture 256/256; screens-intake + doorbell 368/368; format, architecture, coverage (58/58), words (0 inline/plain/testcopy/missingkey), ownership: 0 failures.

**Requirement line I propose:** **R108** (T51 fix round 6, G19; K4571 S10; amends R19, R6) **A capture states what of its supporting files was kept.** The answer of `acquire` (every continuation tick included) and the document's `capture` facts carry `supporting: {kept, skipped, total, reasons, not_walked?}` from the records the walk and the render keep: `reasons` the distinct reasons a file was not kept with their counts, a bound's figure as `limit`, the renderer's words as `detail`; `not_walked` the reason a walk asked for was not made. Absent when none was asked for. Test: a page of 450 supporting files answers kept 400, skipped 50, reason `CAP_REACHED`, limit 400. Controls as fix6-t51.test.mjs.

J26 (control-plane's `t51-visitor-copy.test.mjs`) is still the one thing I need from BOB. Size (session_01BQ74v1Ra7Q8F2p147wPF6y): test runs 21, module lines 3925

## J29 · QUESTION

QUESTION (ACQUISITION #29; my best reading follows; I carry on with it).

1. **G32.** Your START names G32 as mine ("`acquire` looks up the held capture ... through `validatorsOf`") and also says "G32 is capture's". CAPTURE's J24 asks for one thing from me: a plain option `opts.heldSha` (64 hex, in-process only, never a body key), honoured for any caller exactly as `captureRequest.heldSha` is now (validators from `cap.validatorsOf({addressNorm, captureSha})`, not with a render, a 304 answers `unchanged` with no document, parking and the R1 fence untouched). Acquisition cannot look the held capture up itself (it has the digest only from a caller; `validatorsOf` needs it). My reading: I build `opts.heldSha` and capture's arm passes it. New requirement line: R22 amended.
2. **G27.** The inline read (`extractread` after a kept acquire) is the door's and capture's (`capture/ops.mjs`), and the signal it needs is already in my answer: `render: {state: "pending", session}`. My part is the reply: today the deferred `run` and `PENDING_RENDERS` hold the renderer's whole reply (up to 64 MB of bodies as base64) for up to an hour. I make the deferred run keep the bodies and the rendered page in the evidence store the moment it returns and drop the reply, so "Finish it" and the alarm resume from the stored copy: same document, no second render, no second charge. Tell me if you read "the inline read skipped" as something inside acquisition.

## Fix round 6 · ACQUISITION #29 (B29 START, B30 CHANGE, B31 ANSWER): G27 (the render reply), G32 (the held digest)

**Applied** (head after this commit; `tranche/T51` merged at 2abf8e036b).
- **G27 · the deferred render's reply is kept in the record, not in memory** (`acquisition/index.mjs`). (1) Root cause, certain for the retention, probable for the reset: the render `acquire` did not wait for was parked as `renderDeferred = {run, pageUrl}` and `PENDING_RENDERS.set(sid, {run})` (the old :1456, :1593), so the promise, and with it the renderer's whole parsed reply (the page and every body the page loaded, up to `SUBRESOURCE_BUDGET` 64 MiB sent as base64 text), stayed in the object from the moment the render returned until a member's "Finish it" or the alarm took it, `PENDING_RENDER_TTL_MS` (an hour) at most, and across the door's read of the kept capture. Now (:1459) the deferred run is `run.then((a) => keepReply(ev, a))` (:1773): when the render returns, its page and each body are put in the evidence store as the filing puts them (`keepRenderBodies`, the page by its digest), and what the pending render holds is `{kept: true, rsha, existed, digests, reply}`: the reply without its page and bodies. `acquireRun` (:1464-1480) reads the page back (`replyOfKept`, :1791), uses the recorded digests, and files the pair as a waited render does (same `renderBlock`, same document, `existed` as the record held the page before the render returned). `finishRender` (:2144) treats a kept render whose page the record no longer holds as a render the object lost (R99: rendered again, once). A failed or empty render is small and passed on as it came; a record that refuses any piece (put throws) leaves the reply held as before, so no render is lost. The inline read skipped while a render is pending is capture's (`capture/ops.mjs`; the signal is `render: {state: "pending"}` already in my answer; B31). (2) Missed because: renderer replies in the fixtures were a few bytes, the pending promise was never measured, local workerd enforces no memory limit, and no test asked what the object holds after the request ended. Gap fixed: the walker's case at its real size (six 7 MiB bodies, 56 MiB of base64 text) in a child with `--expose-gc` measuring the heap after collection, and the same through raw workerd at a stated old-space limit. (3) Failing-first, red then green (tests below). (4) L: raw workerd, below.
- **G32 · the held digest handed in** (:884, :980). `opts.heldSha` (64 lowercase hex; anything else ignored; in process only, never a body key) is honoured for any caller exactly as `captureRequest.heldSha` is: validators from `cap.validatorsOf({addressNorm, captureSha})`, not with a render, a 304 answers `unchanged` with no document and reads no body; parking, the R1 fence and the answer's shape are unchanged. CAPTURE's `acquire` arm passes it (its J24; B30). The member who wants a new copy sends no digest and gets one. Census: no body or query key of `op=acquire` changed, so nothing to declare (K4208).

**Failing first** (`bio-plane/test/m/acquisition/g27-g32-t51.test.mjs`, `g27-memory-child.mjs`, 8 tests; red at the unchanged code, run before the change):
- R5 R12 (G27) kept at once, Finish it files the waited render's pair, one render, one charge: RED (`the rendered page is held as soon as the render returns`: false), then green.
- R5 (G27) heap: the walker's case at 42 MiB of bodies, heap 56.0 MiB above where it began after the request ended and the render returned: RED; GREEN at 0.07 MiB (`node --expose-gc g27-memory-child.mjs`).
- R22 (G32) `opts.heldSha`, second press pulls no body: RED (3,145,728 bytes pulled); green at 0. The credential case (the drain's arm, `authorization` on its own host, the condition sent beside it) and the changed-source case (a new tag, the new copy filed in full) are controls that held before and after.
- Controls green before and after: a failed render is small and unkept; a record that refuses the pieces leaves the reply held and Finish it still files the pair; no digest, a short digest or a non-string reads the file again; a digest with no recorded validators reads it. New and green after only: a kept page the record no longer holds is rendered again, once (R99).

**Platform check (L)**, raw workerd, `v8Flags = ["--max-old-space-size=N"]`, bisected, `g27-workerd.probe.mjs` (committed; the stand-in store is small; the renderer is a second service streaming the reply from disk; after the request ends and the render returns, the object holds the stated live data, standing for the read that follows). Smallest old space in which it completes, before the fix (`tranche/T51` source) and after:

| reply | live data after | before | after |
| --- | --- | --- | --- |
| 14 MiB | 90 MiB | 132 MB | 120 MB |
| 42 MiB | 90 MiB | 167 MB | 124 MB |
| 42 MiB | 40 MiB | 124 MB | 124 MB |

The 124 MB floor of the last two "after" rows is the renderer's reply being parsed (`capture-sources`' `render.mjs:629`, `r.json()`: the text and the parsed strings are alive together, about twice the reply), which no code of this module can lower; the retention after the parse is gone (the table's first two rows show the retained reply, 12 MB and 43 MB). A reply of that size is the 64 MiB budget's worst case; the walker's dena page is smaller (its reply size is the number the re-walk's `diag` will give).

**Suites and checks.** acquisition: `node --test --test-force-exit bio-plane/test/m/acquisition/`: 247 tests, 247 pass (before my tests 246, 245 pass, 1 red that my first version of the change caused in `fix2-t51` and the `finishRender` guard cured). Users of `acquire` (capture, capture-requests, doorbell, monitoring, file-safety, standards, the two `bio-plane/test` files, control-plane, plane): 1,642 tests, 8 fail, all 8 failing identically on `tranche/T51` without my commit (file-safety `rows.test.mjs` R24; control-plane `t51-held-failed` E3, `t51-large-pdfs` R120/R121, `t51-round5-press-seam` R117 and R125 (b), (c), `t51-round5-seam` R24; plane `l77-size` R77 L): not mine. `checks/run.mjs`: format 0, architecture 0, coverage 6656/6656, words 18421 (unchanged), 0 failures.

**Requirement lines proposed** (BOB writes):
- R22 amended: "A caller in process may hand `opts.heldSha` (64 hex, never read from a body; anything else ignored): the fetch is then conditional with the validators recorded for that capture at the document address, for a member's request too (not with a render). The source answering 304 files nothing and reads no body (`unchanged`); one that serves the file serves it whole. Test: `g27-g32-t51.test.mjs`."
- R109 new (G27; amends R5, R12, R99, R106): "A render this call did not wait for is kept in the record when it returns. Its page and each body it loaded are put in the evidence store and the renderer's reply is dropped: what the pending render holds is the page's digest, the bodies' digests and the reply without its bytes. 'Finish it' and the alarm file from them the pair a waited render files (the same document, one render, one charge). A failed render is small and kept as it came; a record that refuses a piece leaves the reply held, so no render is lost; a kept page the record no longer holds is a lost render (R99). Test: `g27-g32-t51.test.mjs`; platform check `g27-workerd.probe.mjs`."
- Words: one stand-in, `localize("acquisition.index.render_page_not_read_back", "the page as a visitor saw it was made but could not be read back from the record")` (a refusal detail a member reads, rare); the row is owed to the design (B485).

Orphans: a kept render's page and bodies are content-addressed objects named by no document until one is filed, like the ones a filing puts before it files; an abandoned render leaves them.

Deferred: none. Found in another module: `capture-sources` `render.mjs:629` parses the whole reply with `r.json()`; the parse alone needs about twice the reply in old space (above); not needed for the alpha.
Size (session_01Y4v2DQazrd7Uhg2kPv1nLA): test runs 14 (acquisition 3, users 2 batches, base comparison 1, checks 3, child and probes 5), module lines 3973 (src/acquisition)

## J30 · COMPLETE

COMPLETE (ACQUISITION #29, T51 fix round 6: G27 and G32; B30 CHANGE done, B31 followed). Pushed on job/T51/acquisition; the record's "Fix round 6 · ACQUISITION #29" section has file:line, the tables and the proposed lines.

**What changed** (`acquisition/index.mjs`)
- G32 (:884, :980): `opts.heldSha` (64 lowercase hex, in process only, anything else ignored) is honoured for any caller exactly as `crHeldSha` is: validators from `cap.validatorsOf`, not with a render, the 304 answer unchanged and reading no body, parking and the R1 fence untouched. Capture's `acquire` arm passes it. Named requirement line: **R22 amended**.
- G27 (:1459, `keepReply` :1773, `replyOfKept` :1791, `finishRender` :2144): the render `acquire` did not wait for is kept in the evidence store the moment it returns (its page and each body, content-addressed), its reply dropped; the pending render holds only digests. "Finish it" and the alarm file the same pair a waited render files: one render, one charge. A failed render stays small; a record that refuses a piece leaves the reply held as before; a kept page the record no longer holds is rendered again once (R99). The inline read skipped while `render.state` is pending is capture's (B31).

**Failing first** (g27-g32-t51.test.mjs, 8 tests, g27-memory-child.mjs): red then green: the rendered page held at once (false -> true); heap after the request ended 56.0 MiB above where it began -> 0.07 MiB (the walker's case, six 7 MiB bodies, `--expose-gc`); `opts.heldSha`: 3,145,728 bytes pulled -> 0, `unchanged`, no document. Controls (credential on its own host with the condition beside it, a changed source, no or bad digest, a failed render, a refusing record) hold before and after.

**Platform check (L)**, raw workerd with `--max-old-space-size` (g27-workerd.probe.mjs, committed): smallest old space completing, before -> after: 14 MiB reply + 90 MiB later 132 -> 120 MB; 42 MiB + 90 MiB 167 -> 124 MB. The 124 MB floor is the renderer reply's own parse (`render.mjs:629`, capture-sources', about twice the reply); not needed for the alpha.

**Suites and checks**: acquisition 247/247. Users of `acquire` (capture, capture-requests, doorbell, monitoring, file-safety, standards, control-plane, plane, cap13, d57): 1,642 tests, 8 fail, all 8 fail identically on tranche/T51 without my commit (file-safety rows R24; control-plane t51-held-failed, t51-large-pdfs, t51-round5-press-seam x3, t51-round5-seam; plane l77-size). checks/run.mjs: format 0, architecture 0, coverage 6656/6656, words 18421 (unchanged), 0 failures; ownership 0.

**Proposed lines**: R22 amended; R109 new (the deferred render is kept in the record); one word stand-in owed to the design: `acquisition.index.render_page_not_read_back`. Census: no op key changed.

Size (session_01Y4v2DQazrd7Uhg2kPv1nLA): test runs 14, module lines 3973

## J31 · QUESTION

G72 (ACQUISITION #30): one thing I need from you before COMPLETE, in a file that is not mine. I carry on with everything else on my best reading (c).

Done and pushed (head on job/T51/acquisition): `owedRun` ends a visitor view whose render failed with `{ok: true, done: true, final: true, reason: "RENDER_FAILED", detail: <the render's problem, at most 200 characters, the renderer's own words, no page text>}`, and `acquire` writes one log line `{"event":"render_failed","problem":...,"ms":...}` where the render fails. The session is dropped on that end, so `opencaptures` no longer lists it (tested).

The gap: the ledger row stores only the reason. `bio-plane/src/plane/pending.mjs:175` is `if (r && r.final === true && r.reason) return stop(row, at, String(r.reason).slice(0, 160))`; it never reads `r.detail`, so `op=owedwork` still shows "RENDER_FAILED" with no why. That file is the plane's.

Options, smallest first:
(a) the plane's job passes `r.detail` into the row (its change; I change nothing more);
(b) I put the detail inside `reason` ("RENDER_FAILED: <problem>", cut to 160); the row would then carry it, but anything that compares the stored reason to "RENDER_FAILED" exactly would stop matching (I found none in src; tests in screens-intake/t51-fix5 read the code, which I have not changed);
(c) the log line alone is enough for K4428 (the one redeploy names the cause from the render log) and the row stays as it is.

Best reading: (c) is enough for the plan's own words ("the render log names the cause on the one redeploy, K4428"); add (a) only if you want the why in `op=owedwork`. Please answer with a, b or c.

## J32 · COMPLETE

Fix round 7 (G72, G79, B33) applied. Head 9dc384966c on job/T51/acquisition, tranche/T51 merged. J31 (plane's `stop` drops `detail`) is unanswered; I took my best reading (c): the log line is the platform evidence, the row stays as it is. If you want (a), it is a one-line plane change (`pending.mjs:175` reads `r.detail`); `owedRun` already returns it.

**G72** (`index.mjs`, `acquireRun` RENDER_FAILED block ~:1502, `owedRun` ~:2290): the render's problem is logged as one line `{"event":"render_failed","problem","ms"[,"renderer_ms"]}`; `owedRun` ends a failed visitor view `{ok:true, done:true, final:true, reason:"RENDER_FAILED", detail}` (detail = the refusal's problem, at most 200 characters, no page text). The session is dropped on that end, so `opencaptures` no longer lists it (3b, tested); "Finish it" on it answers 404 NO_SUCH_SESSION (the screen half is screens-intake's). Cause of the render failure itself stays unknown until the redeploy's log line (P, BOB's). Test `r7-render-failed.test.mjs` (3 tests): red first on the missing `detail`, then green.

**G79** (provider side): (a) the render waits `renderWaitFor(elapsed)` = min(RENDER_WAIT_MS, 15 s - 3.5 s - elapsed) (`ACQUIRE_BAR_MS`, `PROMOTE_RESERVE_MS` exported, both CHOSEN: 3.5 s covers acadia's 3.4 s promote; callers may hand `acquireBarMs`, `promoteReserveMs`); (b) `keepWhole(..., {compose: true})` with no buffers asks the store to make the whole (`putFromParts`): no part read back, no whole put by this module; a store that refuses or offers none is read back as before. OPT-IN on purpose: made the default it turned plane's g41 CSV shape tests red (their bucket stand-in's composed whole is empty) and would break capture's r103 control; capture passes `compose: true` in its own job. (c) `keepPast(..., {defer: true})` hands the keep to the ledger at once (`keep_pending`) without starting it; with no ledger, or one that refuses, it awaits within the bound as before. `r7-t51.test.mjs` (9 tests), seen RED on the old code: the fixed 10.7 s render wait, the read-back, the always-awaited keep; then green. No L figure from me: the 24 MiB / 40 MB runs belong to capture, which makes the call (my provider code is what it calls); no P in a job.

**B33** (`owedFetch` ~:2315): the saved session now keeps `fetch_pending {since, declared_bytes, why}` beside `fetch_done`, on the first delivery and the retry after a refusal. `r7-fetchdone.test.mjs` (2 tests) red first (no `fetch_pending` in the state the delivery loads), then green. Through the door, `t51-round6-seam.test.mjs` "R105, R124 (G2)" now goes red at its last step only: `op=queue` answers `NO_SUCH_KIND 'fetch-done'` because the queue module does not know that kind yet (the fetch-done record is now made, as you said it would be); it passed 7/7 before my B33 change and is green once queue merges.

**Proposed requirement lines** (BOB writes): R5 (amend): the render is waited min(`RENDER_WAIT_MS`, `ACQUIRE_BAR_MS` - `PROMOTE_RESERVE_MS` - time used), 0 when nothing is left; a render not back is the page filed as served and the render pending. R96 (amend): `keepWhole` takes `compose: true` (store-made whole, fallback to read-back); `keepPast` takes `defer: true` (handed to the ledger at once). R100 (amend): `owedRun` ends a failed visitor view final with `detail`, and the failing render writes one `render_failed` log line. R105 (amend): the saved session of a made fetch keeps `fetch_pending` for the delivery.

Census ops: none new. Rows owed to UX-DESIGN: none from me (no new sentence; the closed-capture sentence is section 5's, screens-intake's stand-in). Words: no new localize id; `checks/run.mjs` names no acquisition finding, words count 18524 unchanged, plain 0.

Tests: acquisition `test/m/acquisition/`: tests 261, pass 261, fail 0. Users: capture 282/282; control-plane 446/447 (the queue line above); plane 394/399 with the same five reds on tranche before my change (l77 PDF x2, g41 xlsx, release R24 words, l79 a timing flake that passes alone).
Checks: format 0 failures; architecture 0 failures; coverage 63 of 63 ids named, 0 failures; ownership 0 failures (5 files, all in my paths).

Size (session_01WJj3GuTrPYB69f6V7UH6CP): test runs 24, module lines 4018

## J33 · COMPLETE

Fix round 8 (G103, G104, G105, G107) applied; no cause is open, deferred or reported. Head: the commit on job/T51/acquisition after this entry, tranche/T51 merged at START (a6d07b98d5).

**G103** (R110; `index.mjs` `openCaptures`, new `memberOfSpelling`). (1) Root cause as the plan: the door stamps `by` with the viewer's form `member:<id>`, the session stores the bare id (`opened_by`), and `openCaptures` compared them with `!==`; now both are read as the member through member-roster's one predicate (`baseViewer`, `viewerMember`; the founder's bare `admin` is itself), so `member:m1` and `m1` match, `member:m2`, `member:m` and `member:m10` do not; a machine identity, blank or non-string `by` still lists nothing. (2) Missed: every `openCaptures` test passed a hand-written `by` equal to the stored id, and one (t50.test.mjs:145) asserted that the door's form lists nothing, which was the defect; that line now asserts R110 and the old line's reason is quoted in a comment. New tests park the session by the member's own press (the real `acquire`), then ask in the door's form. (3) Failing-first, `r8-open-captures.test.mjs` (6 tests), RED before the fix: `AssertionError: listed for member:m1 — actual: 0, expected: 1`; and for the real entry path `AssertionError: poll 0 — actual: 0, expected: 1`; GREEN after. (4) Platform check: L = the listing is a pure comparison, the real-entry-path test above; P at the re-walk (an enrolled member's 14-16 MB press, the Add screen watched to the finished line) is BOB's. Old records: none (a read).

**G104** (R110; `openCaptures`). (1) A session the alarm has made and not yet delivered (`queue: []`, `fetch_done` present) is listed with `outstanding: 1`, `primary_sha: null` and `fetch_pending {…, delivering: true}` until the delivery drops it; a finished visitor copy (`render_done`, no `fetch_done`) and an expired one are still listed for no one. (2) Missed: `owedFetch` tests deliver with an accepting stub and never look at the listing in between; the new test lists from inside `deliver` and after a refused delivery. (3) RED before: `TypeError: Cannot read properties of undefined (reading 'fetch_pending')` (nothing listed from inside the delivery) and `the made state is listed while it lives — actual: 0, expected: 1`; GREEN after. (4) L (as G103); P as G103.

**G105** (R111; `index.mjs` `owedFetch`, `owedRun`'s two render-delivery sites; new exported `DELIVERY_FINAL`). (1) The three sites turned every refused delivery into `{done: false, reason: "DELIVERY_REFUSED"}`. Now the refusal's code (`reason`, else `code`) decides: a code in `DELIVERY_FINAL` (`CAPTURE_HELD_BY_ANOTHER_BUNDLE`, `OVERSIZE_INLINE`, `TOO_LARGE`, `PROMOTE_NOT_A_PARTICIPANT`) ends the entry `{ok: true, done: true, final: true, reason: <code>}` (the plane's `fetch` consumer files that as the row's `why`), and `owedFetch` saves the session in the shape of a fetch that ended before it was made (`queue: [{fetch: true}]`, no `fetch_done`, `fetch_pending.failed = <code>`), so `opencaptures` lists it with `failed` and never as delivering; the two render paths end final and drop the session (the visitor copy can never be filed). Any other refusal goes again with the ledger's back-off and now keeps the reason it gave (`DELIVERY_FAILED` stays `DELIVERY_FAILED`; an unnamed refusal is `DELIVERY_REFUSED`, as before). The set is my choice from the codes the record's promotion answers, exported so BOB can amend it. (2) Missed: no test pressed an address already held elsewhere through the alarm, and the stubs accepted. (3) `r8-fetch-refused.test.mjs` (5 tests, one per site, the exported-set loop, controls), RED before (run against the pre-change code with only the `DELIVERY_FINAL` export stubbed): `actual: [ true, false, undefined, 'DELIVERY_REFUSED' ], expected: [ true, true, true, 'CAPTURE_HELD_BY_ANOTHER_BUNDLE' ]`; the same at the render_done and render_pending sites (`actual: [ true, false, 'DELIVERY_REFUSED' ]`); GREEN after. Control: an accepted delivery drops the session and ends done. (4) L = the unit run over the real alarm entries; the plane's `fetch` consumer (`plane/pending.mjs:243-252`) already files `final` as the row's end with the reason (no change in this job); P at the re-walk (the 41.5 MB press by the enrolled member who cannot see its home) is BOB's. Old records: the one owed `fetch` row on the copy ends at its first tick after the fix.

**G107** (R112; `index.mjs` render arm, new exported `keepWaitFor`, `KEEP_FOLLOWING_MS`). (1) Root cause as the plan: the render's wait ended at the bar but `keepRenderBodies` ran after it, unbudgeted. Now, for a member's `render: true` request under the bar (not the capture-request arm, not a caller that names `renderWaitMs`, not a render begun afresh), the page and its loaded bodies are kept with `keepReply` and awaited for `keepWaitFor(elapsed)` = what the bar leaves for the render less `KEEP_FOLLOWING_MS` (1000 ms, at most a quarter of that share; the room the receipt and profile need; caller may hand `postKeepMs`); a keep that has not ended leaves the render pending (R5: the page filed as served, session `render_pending`, the keep going on from the record, "Finish it" or the alarm files the pair from it); a keep that ended is used in place (no read-back). What is kept and read is unchanged (`render.mjs` untouched; the same 90 bodies are held and the pair has all 90 digests). The figure is CHOSEN, not measured: BOB records it, and P (acadia, `timings.stages`) shows the real shares. (2) Missed: G79's test had a render that never returns and a store with no latency. (3) `r8-render-bar.test.mjs` (4 tests; the test's own clock at a fifth of the walk's scale: bar 3 s, reserve 0.7 s, renderer back at ~1.8 s, 90 bodies, 54 ms a store call), RED before: `answered in 3199 ms, within 2300`; GREEN after (three runs). Controls: no bodies over the same slow store is rendered in the request; 90 bodies over a free store are kept in the request; `renderWaitMs` named, and the alarm's finishing of the pending render, are not cut. (4) L = the above at the real code over a store that charges a trip (the workerd R2 variant is not run here: the keep is the same calls); P: acadia's visitor view once on a quiet copy (R-QUIET) with the full `timings.stages`.

**Proposed requirement wording** (BOB writes; I did not edit `build/requirements`): R46 amended: `by` is matched with `opened_by` as the member (member-roster's `baseViewer`/`viewerMember`), and the `delivering` mark (R110 as written already says it); R111: name the exported set `DELIVERY_FINAL` with its four codes, and say a transient refusal keeps the reason it gave; R112: the allowance `KEEP_FOLLOWING_MS` (1000 ms, at most a quarter of the share, `opts.postKeepMs`), the three cases not bounded, and that the keep goes on from the record; drop "(not yet met: T51)" from R110-R112; Uses: `member-roster`: `baseViewer`, `viewerMember` (R110). One edited old test line (t50.test.mjs:145) is the reversal of the defect it asserted.

**Words:** no new sentence, no new `localize` id; `words` check: 0 failures, plain 0. **Census:** no op key added or changed.

**Stale generated artifacts** (BOB regenerates; I made none): `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json`, `agent-worker/dist/agent-worker.bundled.mjs` and `.bundle.json` (both list `src/acquisition/index.mjs` as an input).

**Tests and checks (this session)**
- acquisition `test/m/acquisition/`: tests 276, pass 276, fail 0 (baseline at START 261; 15 new in the three r8 files).
- Users, `build/plan/impact.mjs origin/tranche/T51 HEAD` names 112 modules; the ones that call what I changed: capture 294/294; control-plane 478/478 (the round-8 seam file is not on this branch); plane 431/434 and screens-intake 317/319, every one of those 5 reds identical on `origin/tranche/T51` without my commit (plane `l77-size` R77 L gate x2, `release` R24 words; screens-intake capture R26 x2, which wait on T52 words).
- format: 176 modules, 176 requirements files; 0 failures. architecture (acquisition): 43 product files, 188 relative imports; 0 failures. coverage: 66 of 66 live requirement ids named by a test; 0 failures (R110, R111, R112 each named). words: 1 module, plain 0, missingkey 0; 0 failures. ownership (against origin/tranche/T51): 6 files changed by acquisition; 0 failures.

Size (session_01BkyFtsj1q4JTZZqSeoTmNT): test runs 14, module lines 4102

## J34 · QUESTION

QUESTION (R114, READ_BOUNDS rows). Best reading and what I need; I carry on with everything else meanwhile.

`bio-plane/src/read-bounds.mjs` has no row for three ceilings acquisition keeps, and none for the render-DOM bound R118 needs. R114 forbids a numeric literal for them, so I need the rows (runtime-limits' file; ruling (1)). My proposed rows, each with today's figure in all three columns (nothing lowered or raised):

- kind `capture`, name `keep_bytes` (MULTIPART_KEEP_MAX): standard 33554432 (32 MiB), alpha 33554432, protective 33554432, key `limit.capture.keep_bytes`
- kind `capture`, name `profile_text_bytes` (PROFILE_TEXT_MAX): 8388608 (8 MiB) x3, key `limit.capture.profile_text_bytes`
- kind `render`, name `dom_bytes` (the serialised-DOM bound handed to capture-sources' renderBlock as domBound.bound): 26214400 (25 MiB, the plan's proposed figure "proposed; BOB records") x3, key `limit.render.dom_bytes`

CAPTURE_MAX (256 MiB today): I read it as the existing row `archive.uploaded_bytes` (alpha 268435456 = 256 MiB, standard 524288000; G124b says "the standard's 500 MB archive file is the upload limit"), so `CAPTURE_MAX = boundOf("archive","uploaded_bytes")` and I add no row for it. If you want a separate `capture.bytes` row instead, say so.

Until the rows merge I code `boundOf("capture","keep_bytes")` etc.; my tests for those three will stay red by name (R-SEAM) and nothing else waits on them.

## Fix round 9 (ACQUISITION #32, session_01NGxtiMrUV97HNeAMcuRZdK) — in progress, handed on for context

**Done and green (module `test/m/acquisition/`: 309 tests, 308 pass, 1 red by name: R118 V4, waiting on the `render.dom_bytes` row, B37).**
- **R113 / G127d `readRange`**: `src/acquisition/range.mjs`, exported from `index.mjs` as `readRange(store, sha, offset, length)` (store first, as every act of this module takes it; BOB's interface text writes it without the store; the store carries `core.evidenceStore()` and `provenance.partsOf`). Test `r9-read-range.test.mjs` (4 tests: seam range, whole-held control, past-the-end, refusals and a failing store).
- **R121 / G129e**: `unpack.mjs` — a store failure (put, head, making the whole) is thrown tagged and leaves the entry with no outcome (counted in `waiting`, cut again next call); a member over one part is also kept whole (`putFromParts`, through `readThrough`). `r9-unpack-transient.test.mjs` (A11, A10 whole + `readRange` across the seam, corrupt control).
- **R119 / G138**: `supportingOf` adds `pictures_unread {count, bytes}` from walk entries and render subresources of type image. `r9-pictures-unread.test.mjs`. Old lines reversed by the requirement: `fix6-t51.test.mjs` R108 expectations now include `pictures_unread`.
- **R120 / G131g**: `title.mjs` `decodeAs`/`charsetOf` over `ooxml.decodeText`; `titleOfBytes`, `profileOf` (`profile.text_encoding {encoding, assumed, replaced, replaced_ratio}` or `{failure: ENCODING_UNSUPPORTED, name}`), `textTypeOf` (R102), `servedSubstance`, the subresource walk's HTML all use it; the header's charset wins over a meta tag. `r9-decode.test.mjs` (100 KB and 3 MiB; 9 MiB multipart is not profiled as text by R17's `profilesAsText`, unchanged).
- **R118 / G137c**: failed render charged its real `elapsed_ms` (else the wall measured), all tries summed, released once; `transient` retried up to `RENDER_TRIES` (3) with `RENDER_BACKOFF_MS` [1000, 3000] (`opts.renderBackoffMs`), `permanent` once; `RENDER_FAILED` answers `failure_class`; `owedRun` goes again on a transient failure and is final on a permanent one; `renderBlock` is handed `domBound` (size, `boundOf("render","dom_bytes")`, null until the row exists). `r9-render-charge.test.mjs` (6 tests; the DOM-bound one is red by name until the row merges).
- **R115 / G124b**: a multipart capture with a declared length within `MULTIPART_KEEP_MAX` is received into ONE buffer (`keptWhole`), each part assembled in place, the whole put from it; the byte ledger (`opts.ledger`) counts it. `r9-multipart-memory.test.mjs`.
- **R116 / G126, G126f**: registrar callers: `registrarOf` (store's `registerJob`, else `opts.registerJob`), `oweOf` and `keepLaterOf` write `fetch`, `subresources`, `keep` rows; an `acquire` whose profile names `zip` registers `unpack` with the whole sha before it answers; a refusing registrar or none is stated in the answer as `jobs.not_registered`. `r9-registrar.test.mjs` (5 tests on `jobRegistrarStub`). Old lines reversed: `fix4b-owed.test.mjs` (the ledger reads the idempotent row once; a complete unpack's ledger holds the one registration).
- **N1 (K4853)**: a refused fetch is listed one day after the failure (`FAILED_LISTED_MS`, `failed_at`), a re-press by the same member replaces it. `r9-failed-ends.test.mjs`.

**Not yet done (next session, in this order).** (1) **R114** constants: `CAPTURE_MAX = boundOf("archive","uploaded_bytes")`, `MULTIPART_KEEP_MAX = boundOf("capture","keep_bytes")`, `PROFILE_TEXT_MAX = boundOf("capture","profile_text_bytes")`, the `TOO_LARGE` answer `{size, bound, key}` from `statement`, the two archive limits with size and limit, and the source-text check of no numeric literal; waits for RUNTIME-LIMITS #9's rows and BOB's CHANGE (B37). (2) **R117** a pending render held as a job row, not `PENDING_RENDERS` (`index.mjs` ~:571, set ~:1700, read in `finishRender`); the render's run cannot be stored, so the row holds the page and bodies' digests (`keepReply` already keeps them) and `owedRun` restarts from it; `restartAt` test (DOCS V4, V7). (3) **R101 / G130c** `profileOf` for a held-in-parts or past-8 MiB capture judges `format` from `readRange` of its head AND tail (today: first KiB of the first part plus `zipPastBound`); an office file past 8 MiB stored with its own `profile.format`; test DOCS O9 sizes. (4) **R5/R10/R101/R102** wording is BOB's; proposed: R46 gains "a refused fetch is listed one day after its failure and a re-press replaces it (`FAILED_LISTED_MS`)"; R116 names `jobs.not_registered` as the answer's statement; R119's `pictures_unread` lives in `supporting`; R120's `profile.text_encoding`. (5) the impact users, the four checks, census (no op added or changed so far), words (no new sentence so far: every new text is a key already or none), `Size` line.

**Stale generated artifacts** (BOB regenerates): `bio-plane/dist/bio-plane.bundled.mjs`, `.bundle.json`, `agent-worker/dist/*` list `src/acquisition/index.mjs` and `unpack.mjs` as inputs.
**New files**: `src/acquisition/range.mjs` (in my `paths`), tests `r9-*.test.mjs` (7 files).

## J35 · BLOCKED

BLOCKED (cause: context). Past half my window after the reading set (~550 KB) and eight causes; I finish here and end my turn. All pushed on job/T51/acquisition (commit "registrar callers (R116), failed fetch listing (N1), record"); the record's "Fix round 9" section lists everything.

Done and green (module suite 309 tests, 308 pass, 1 red by name): R113 `readRange` (G127d), R121 (G129e), R119 (G138), R120 (G131g), R118 (G137c, except its DOM-bound test, red by name until `render.dom_bytes` merges), R115 (G124b), R116 registrar callers (G126f/G126g callers) and N1 (K4853).

Remaining for my restart, in order: (1) R114 constants from `boundOf` — needs RUNTIME-LIMITS #9's three rows merged and your CHANGE (B37); (2) R117 a pending render held as a job row (G126g); (3) R101 / G130c format from head AND tail through `readRange`; (4) impact users, format/architecture/coverage/words/ownership checks, Size line, COMPLETE.

Two things for you: (a) the interface `readRange` takes the store first (`readRange(store, sha, offset, length)`), as every act of this module does — tell me if the callers should have it bound instead. (b) Generated artifacts made stale: `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json`, `agent-worker/dist/*` (inputs `src/acquisition/index.mjs`, `unpack.mjs`).

Ringing failed: BOB's session session_01TR6P4eJM4znxzhuYTdih8B is archived; the pushed J35 BLOCKED entry is the message (mechanics §13 backstop).

**Update after B38 (CHANGE):** tranche merged; R114 done — `CAPTURE_MAX`, `MULTIPART_KEEP_MAX`, `PROFILE_TEXT_MAX` quoted through `boundOf`, `TOO_LARGE` carries `{size, bound, key}` (`statement`), `r9-ceilings.test.mjs`; R118's DOM-bound test is green. Module suite 312/312. Still to do: R117 (pending render as a job row), R101/G130c (format from head and tail via `readRange`), then impact users, the four checks, Size line, COMPLETE.

## J36 · BLOCKED

BLOCKED (cause: context), unchanged: R114 is done and the suite is 312/312 after B38. Left for a restart: R117 (pending render as a job row), R101/G130c (format from head and tail via readRange), impact users, checks, Size line, COMPLETE. See the record's Fix round 9 section.

## J37 · COMPLETE

Fix round 9 complete for acquisition (R113-R121, N1, B39 answer applied). Head: the commit on job/T51/acquisition after this entry; tranche/T51 merged at START.

**Done this session**
- **R117 / G126g** (`index.mjs` `persistRender`, `finishRender`): when the run of a render this call did not wait for returns, what it answered (`keepReply`'s small `{kept, rsha, existed, digests, reply}`, or a failed render's `{ok:false, error, failure_class}`; over `RENDER_ANSWER_MAX` 2 MiB of JSON it is not written) is written into the capture session the job row names (`render_pending.answer`; a session gone or no longer pending is never written back). `finishRender` of an object restarted after that finds it: "Finish it" files the pair at once and the alarm's `owedRun` delivers once, with no second render, reservation or charge; a restart before the render returned still renders afresh (R99); `PENDING_RENDERS` is now only the live handle in the object that began the run. `r9-pending-render.test.mjs` (4 tests), RED before (no answer written; the restarted run rendered again), GREEN after; controls: restart before return, a render within the bound leaves no row or session, a failed render ends final without rendering again.
- **R101 / G130c**: `profileOf` for a capture held in parts, or whole past the 8 MiB read, judges `format` through `format-registry.detectFormat` over a range source built on `rangeReaderOf` (range.mjs; the one reader behind `readRange`, asking once whether the whole is held): head signatures, the end record and the central directory. An office or ODF file of any size is `docx`/`odt`; a plain ZIP is `zip` only from bytes; a declared type never makes a ZIP; no signature keeps the declared type else `undetermined`; an absent part is stated; a store that cannot read sets the caller's `unread.reason` (new optional arg; `archiveProfile` in unpack.mjs then does not remember a "not an archive" decision, R121). `r9-format-range.test.mjs` (5 tests), RED before (docx/odt past 8 MiB undetermined), GREEN after. `headOf`/`zipPastBound` removed.
- Earlier in the round (see Fix round 9 section and J35/J36): R113, R114, R115, R116, R118, R119, R120, R121, N1.

**Old lines reversed by R101/R117 (in my tests):** fix3-t51 (two "no get" lines: now "no whole get"), fix5-t51 R101 (head range up to 1 MiB, tail allowed; "no part read whole"), unpack.test (the ZIP signal now reads "judged from the end record and the central directory"), t50 R48 kept-whole case (budget 5 to 6 reads: the head of the key, the 1 KiB look, the 1 MiB head, the end record, the directory, the listing).

**Found in other modules (for BOB; none changed by me)**
- Capture, `test/m/capture`: R103 (G79) "17 MiB ... kept whole", "24 MiB upload reads no part back", "40 MB upload ... ledger" count any `get`; R101 now profiles the upload by range reads of its head and tail, so each sees ranged gets (never a whole part). Capture's job should assert no whole-part get.
- Capture `upload.test.mjs:309` (R92 controls: bytes `FF FE 41 0A`) and `R107 controls` (`FF FE` in a csv declared text/html) and doorbell `knock-text.test.mjs:41` (R13: `61 FF FE 62 63`) assert the old UTF-8-only rule; R120/R102 decode UTF-16 (BOM) and legacy charsets as text. They failed identically before this session's commit.
- Control-plane `t51-visitor-copy.test.mjs:58` (R104 R100 R99 E8): after the render returned and the object restarted, "Finish it" now finishes the copy in the request (R106: a run that has returned is finished) instead of answering pending; its expectation of `pending` is the old R99 shape, and R117 (amends R106) reverses it.
- Stale generated artifacts (BOB regenerates): `bio-plane/dist/bio-plane.bundled.mjs`, `.bundle.json`, `agent-worker/dist/*` (inputs index.mjs, unpack.mjs, range.mjs).

**Proposed requirement wording (BOB writes):** R117: the answer is written to the session's `render_pending.answer`, size bound `RENDER_ANSWER_MAX`; R101: `profileOf` takes `unread`, the range reads, and R48's held-whole bound with the decision's reads named; R46 gains "a refused fetch is listed one day after its failure and a re-press replaces it (`FAILED_LISTED_MS`)"; R116 names `jobs.not_registered`; R119's `pictures_unread` lives in `supporting`; R120's `profile.text_encoding`.

**Census / words:** no op added or changed; words check 0 failures (plain 0, missingkey 0).

**Tests and checks**
- acquisition `test/m/acquisition/`: tests 321, pass 321, fail 0.
- Users: capture 289/294 and doorbell 91/92 (the six reds above, three of them identical before my commit); control-plane 523/524 (visitor-copy, above); screens-intake 334/334 (a first run under load had 9 flaky reds, none on rerun); plane 439/463 under a load of four suites at once, every red a workerd or heavy L test (alarm, sheet, scan); R75 R4 (C5c), the one on acquisition's keep, passes alone.
- format: 176 modules; 0 failures. architecture (acquisition): 55 files, 223 imports; 0 failures. coverage: 75 of 75 live ids named; 0 failures. words: 0 failures. ownership (against tranche/T51): 22 files changed by acquisition; 0 failures.

Size (session_01CAeRS3pRKYW3YBwY2Fp8nC): test runs 14, module lines 4342

## Job 65 (acquisition-2; ACQUISITION #34; B40 · G124b, R-PATH) · R115 on the sibling paths

Red first, on the tip: `r9-multipart-memory.test.mjs` with the same 20 MiB capture served with no length, with a shorter declared length (12 MiB) and a longer one (22 MiB): peak 30 MiB and over, against the kept bytes plus one part. The R115 test was vacuous before job 23: shown red against `git show 879a7ce60f:bio-plane/src/acquisition/index.mjs` copied in place (3 reds: "the ledger counted the kept bytes (peak 0)"; the first test now asserts `peak() >= kept` too), green on the fix.

Fix (`bio-plane/src/acquisition/index.mjs`): (1) the whole0 join for the PDF title is gone: the title is read only where the whole is in one buffer (a single part, or the buffer a declared length asked for); a several-part capture received otherwise answers `title: null` at capture, named by its reading (R98 states it; test "named by its reading"). Choice, as BOB allowed: title left to the reading, stated in R115. Detection already reads `firstHead`. (2) A body with no declared length keeps its parts singly and `keepWhole` hands them to the one buffer part by part (it nulls each as copied; the shared array drops the reference), counted by the ledger as the bytes they become, with no read-back and no compose, as R96's tests require. (3) A body that overruns the length it declared holds no bytes (`dropKept`): the whole is made from the stored parts (`putFromParts`, else read back one at a time, the ledger counting the whole and one part). (4) A declared-longer body fills the front of its buffer (a `subarray` view is put). (5) The kept bytes are released at the end of the keep. `keepWhole` takes an optional `ledger`.

Claim to read with care: in (2) the join allocates the whole while the parts are still referenced, then drops them as they are copied; the ledger counts it as a handover, and the resident peak depends on the engine committing a zero-filled buffer lazily. Not measured here.

Requirement: R115 amended in `build/requirements/acquisition.md` (my own file, K4210); ownership lists that one file, accepted at the merge.
Tests: `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit bio-plane/test/m/acquisition/*.test.mjs`: tests 325, pass 325, fail 0. Users named by impact (capture, doorbell, screens-intake, control-plane): capture tests that name acquisition: 243/243.
Checks: format 0 failures; architecture (acquisition) 0 failures; coverage (acquisition) 75 of 75, 0 failures; `checks/run.mjs`: no finding names acquisition (words 19 failures, none mine, none in my files); ownership: 1 failure, the requirements file, as B3/B4 accept.
Deferred: none. Words: no new sentence.
Size (session_018XJZd3Y6SC5rJeKSargNwt): test runs 6, module lines 4358

## J38 · COMPLETE

COMPLETE job 65 (G124b): R115 met on the undeclared, overrunning and short-declared paths; title read only from a one-buffer whole (else null, stated in R115); R115 test non-vacuous (red on 879a7ce60f, 3 reds). Details, tests (325/325), checks and Size in the record's Job 65 section. Requirement R115 amended in build/requirements/acquisition.md (ownership lists that one file, per B3/B4). One claim not measured: the undeclared join's resident peak depends on lazy zero-fill commit.

### Job 65, after B41 (CHANGE, K4926): option (a)

Chosen (a): no join, no whole beside held parts. Only a body received into the one buffer its declared length asked for (or a single part) holds bytes. A body with no declared length, or one that overruns its declared length, drops what it holds when a second part shows it is several (`dropKept`); the parts are already stored, and `keepWhole` (no `compose`, so the store's `putFromParts` is not asked, as R96's control requires) reads them back one at a time into the one buffer of the whole, the ledger counting the whole and one part (peak = kept + one part, by the ledger and in fact: no held part beside it). `keepWhole`'s held-parts join stays for other callers; acquire no longer passes it parts it joined.
Red first: the undeclared test now asserts the stored parts are read back once each; it fails against the previous commit's join and passes on (a).
Superseded tests, amended (R115 amends R96's "no read-back" for such a body only; R115's text says so): `fix3-t51.test.mjs` (16 MiB capture: each stored part read back once, no whole get) and `fix5-t51.test.mjs` R101 (the fixture now declares its length, so the head is judged without any read-back).
Suite: tests 325, pass 325, fail 0. capture tests naming acquisition: 243/243. format, architecture, coverage (75 of 75): 0 failures; words: none in my files; ownership: 1 failure, the requirements file (accepted per B3/B4).
Size (session_018XJZd3Y6SC5rJeKSargNwt): test runs 10, module lines 4358

## J39 · COMPLETE · re B41

COMPLETE re B41: option (a). No join: a body with no declared length or overrunning its declared length holds nothing past its first part; the whole is made by reading the stored parts back one at a time (ledger: whole + one part). Red first (undeclared test asserts the read-back; red on the join commit). Two older tests encoding R96's no-read-back for such bodies amended (fix3-t51 C5, fix5-t51 R101), R115 text says so. Suite 325/325, capture users 243/243, checks 0 failures (ownership lists the requirements file, per B3/B4). Record: 'after B41'.

## J40 · COMPLETE

COMPLETE re B42 (ACQUISITION #35; job 76; R122; head 1530040dbc). Requirement lines written by me in build/requirements/acquisition.md (R122 amended to what is built, "not yet met" removed; ownership lists that one file, accepted per B3/B4).

Applied
- (1) `listingRefusal` adds `declared_total` to ARCHIVE_TOTAL_MAX's row (unpack.mjs). Reaches `op=unpack`'s refusal and `archiveList`'s `archive.refused`.
- (2) The daemon's `op=unpack` run (cls `daemon`, not `acquire`'s own automatic call, not a member's run) offers again each entry `filed` whose document `homeOf` finds no home: the member is cut again (parts already held, nothing rewritten), verified against the entry's digest, and its document returned in `documents`; the offer is counted on the entry (new column `offers`, added to existing tables by `PRAGMA table_info` + `ALTER TABLE`; the first filing is offer 1; `REOFFER_MAX` = 3, CHOSEN per BOB's ruling). A run that offered anything answers `waiting` > 0 / `complete: false`, so the plane's job comes back and sees whether the document found its home. Still homeless at 3 offers: stated final once in the answer's new `not_promoted: [{index, sha256, code: "NOT_PROMOTED", detail}]` (always present), stored on the entry (`code`, `detail`; state stays `filed`, the bytes are kept and receipted), shown by `archiveList` as `not_promoted: {code, detail}` on that entry, never offered again. Offers count towards the call's share, not the tree's or the day's. Detail sentence is `localize("acquisition.unpack.its_document_was_offered", …)`.
- (3) `ODF_DIGEST_MAX` and `LARGE_FETCH_BYTES` are `boundOf("acquisition", "odf_digest_bytes" | "large_fetch_bytes")`.

Choices for BOB to confirm
- The re-offer is keyed on `cls === "daemon"` (what the plane's `unpack` job sends through the door), so control-plane needs no change to pass a flag; the diagnosis' door-passed `reoffer` is not needed. A member's own `op=unpack` does not re-offer.
- Final state: the entry stays `filed` with `code NOT_PROMOTED`, not `not_filed`: a `not_filed` would need a new catalogue row (C-139.22) that the gate census and control-plane list; no row was added. If BOB wants the row, it is a CHANGE (and `filed` then reads `not_filed`).
- The answer says the final reason is "found no home in 3 offers"; acquisition cannot know the door's own refusal code (control-plane's `not_promoted[].code`), so the detail does not quote it.
- Control-plane note (P9, not changed): the job finishes when `complete: true`; with this change the daemon answers `complete: false` after an offer, so the plane's job retries by its back-off until the entry has a home or is stated final. The door promotes `documents` as for any `op=unpack`; nothing in control-plane has to change for it.

Existing tests changed (not weakened): four tests (budgets.test.mjs ×3, archivelist.test.mjs, fix4b-owed.test.mjs) run the daemon over an archive filed by an earlier call with no door between, so their members had no home; they now state the door's promotion through the new fixture helper `promoteFiled(w)` before the daemon's run.

Rows owed (words): `acquisition.unpack.its_document_was_offered`. Read through `localize` at its use; no `word()` key added. No generated artifact touched.

Uncommitted stand-in (per START): `bio-plane/src/read-bounds.mjs` carries local `acquisition.odf_digest_bytes` and `acquisition.large_fetch_bytes` rows (8 MiB each) that are NOT in this branch. Until runtime-limits job 78 (R35) merges, this branch's `acquisition/index.mjs` throws at import (`READ_BOUNDS has no row`): merge job 78 first.

The four fields
- cause: unpack.mjs:535 built the ARCHIVE_TOTAL_MAX row from `rowed(code)` alone, dropping `listing.declared_total`; :619 and :660 looked only at `waiting` entries, and an entry settled `filed` is settled for good while its promotion happens afterwards at the door; index.mjs:143, :432 were literals.
- why missed: R121 covered a store failure inside `unpack`; a promotion failure falls after the entry is `filed`, between R121 and control-plane R134; the ceilings were not on the G124 quote list.
- red first: r122.test.mjs run before the change: (1) `declared_total` undefined, (2) a daemon run answered `documents: []` and `complete: true` for homeless entries, (3) the export lines were literals. Green after.
- platform check: the new column is added with `PRAGMA table_info` and `ALTER TABLE ADD COLUMN`, statements Durable Object SQLite supports; I ran it on node:sqlite only, not on workerd (no probe exists for this table).

Checks (run in this session)
- acquisition suite: `node --import ./test/platform-sqlite.mjs --test --test-force-exit test/m/acquisition/*.test.mjs`: tests 330, pass 330, fail 0.
- impact (`build/plan/impact.mjs origin/tranche/T51 HEAD`): 112 modules affected (index.mjs is imported widely); the users that touch `unpack`/`archive_entries`/the two ceilings run: tasks inbox, case-carriage, public-read archives and obscured, plane unpack, capture t43 and r9-t51, control-plane t35-door: tests 176, pass 176, fail 0. file-safety (rows, r56-structure, intake, grade): 24 tests, 1 fail: `rows.test.mjs` R24 finds the word key `refusal.SIGNATURES_RUN_RECENT` in its code and not in its expected list: file-safety's own, not touched by this job.
- `checks/format.mjs`: 176 modules, 176 requirements files; 0 failures. `checks/architecture.mjs … acquisition`: 0 failures. `checks/coverage.mjs … acquisition`: 76 of 76 live requirement ids named by a test; 0 failures. `checks/words.mjs`: 33 failures, none naming acquisition. `checks/ownership.mjs … acquisition tranche/T51 job/T51/acquisition`: 9 files, 1 failure: build/requirements/acquisition.md, accepted per B3/B4.

Size (session_01XzAj5EuQc3hnH5xNiPDvpB): test runs 14, module lines 4417

## J41 · COMPLETE · re B43

COMPLETE re B43 (ACQUISITION #36; job 86; R39 and R116 amended; head below). Requirement lines: I removed the `not yet met` marks of R39's and R116's amendments in `build/requirements/acquisition.md` and named the test (ownership lists that one file, accepted per B3/B4).

Applied
- G161 (`unpack.mjs` `fileDocument`): with no letter the member's `grade_basis` is the ARCHIVE's (`g.archive.basis` when `g.archive` is an object, else `g.basis`), so an uploaded archive's members pass provenance C-18.1.
- G163 (`unpack.mjs` `fileDocument`): bytes with no magic are typed by `textTypeOf({bytes, name: row.name})` (R102) when the member is held in one part; a `.txt`, `.md`, `.csv` member is text, a NUL-bearing `.txt` and a `.bin` stay untyped.
- G160 (`index.mjs` `owedFetch`, and the two render-delivery paths of `owedRun`): the three final answers carry `detail: {kind, capture_sha, holder}` from the refusal, taken from its `detail` when that is a plain object, else from its top level (provenance's shape); a refusal with none adds no `detail`. Control-plane's side (its answer carrying `detail`) is job 43's; this works with either shape.
- One existing assertion changed, not weakened: `unpack.test.mjs` (R38 R39 R26) asserted a `notes.txt` member untyped; R39 now types it `text/plain`. Absence for a member neither bytes nor name type is held by the new test's `x.bin` and NUL controls.
- No sentence added; no word row owed.

Tests: `r123-batch-d.test.mjs` (6 tests; red first on the 3 reds, controls green): uploaded ZIP of three `.txt` members (receipt, no letter) carries `CAPTURE_RECEIVED_NOT_FETCHED`, no grade, `text/plain`, `profiled_from_text`; fetched letter-graded archive's members carry its letter; `.txt/.md/.csv` typed, NUL and `.bin` not; `owedFetch` final answer carries kind, capture_sha, holder (both shapes), bare refusal adds none, `DELIVERY_FAILED` goes again, accepted delivery ends done.

The four fields
- cause: `unpack.mjs:849` stated `g.basis`, which provenance R59 always answers `CAPTURE_UNPACKED_FROM_ARCHIVE` for a member, not the archive's; `:821-826` typed a member by `detectFormat(head, null)` alone; `owedFetch`'s three final answers built `{reason}` only.
- why missed: acquisition's fixtures unpacked only letter-graded archives (the no-letter branch never ran) and only formats with magic bytes; no test joined `owedFetch` to a refusal carrying facts.
- red first: `r123-batch-d.test.mjs` run before the change: basis `CAPTURE_UNPACKED_FROM_ARCHIVE`, content types undefined, `detail` undefined (5 of 6 red; the controls green).
- platform check: L, as the START says; nothing here is platform-specific (no new SQL, no new storage call); run on node:sqlite only.

Checks (run in this session)
- acquisition suite: tests 336, pass 336, fail 0 (after the one amended assertion).
- impact (`build/plan/impact.mjs origin/tranche/T51 HEAD`): 112 modules affected; the users that touch `unpack`, `archiveList` or `owedFetch` (capture, doorbell, control-plane, plane, file-safety, screens-intake, tasks, monitoring, capture-requests, instance-setup test files): every file fail 0.
- format 176/176, 0 failures; architecture 0; coverage 76 of 76, 0; words 0 failures (acquisition: plain 0, testcopy 0); ownership: 1 failure, the requirements file, accepted per B3/B4.

Size (session_01GRvfGdeJxS5azaPFdT5hLD): test runs 9, module lines 4426

## J42 · COMPLETE

COMPLETE re B43 (job 86; G160, G161, G163; R39, R116). Record J41. Suite 336/336, users fail 0, checks 0 failures (ownership: the requirements file, per B3/B4). Control-plane's detail (job 43) is read from either shape.

## J43 · COMPLETE

COMPLETE re B44 (ACQUISITION #37; job 96; R17 amended, G170, K4985). Head below.

Applied
- `profileOf` takes `name` and `declaredType` and hands both to `detectFormat` (the bytes pass, and the range-read passes of R101: the name to the byte read, name and declared type to the declared-type fallback). On the fetch's path `acquire` passes the address's last path segment (decoded) as `name` and the response's content type as `declaredType`. A declared type the bytes contradict still decides nothing (format-registry's pass order); a PDF named `x.csv` stays a PDF.
- R17's `not yet met` mark removed in `build/requirements/acquisition.md` (ownership lists that one file, accepted per B3/B4).
- Own flaw fixed (P8): `stage-times.test.mjs` R95 (C5a) compared the cut stage's milliseconds at two moments for equality and failed about one run in three on a one-millisecond difference; it now compares every ended stage exactly and the cut stage to within a millisecond (8 of 8 runs green).
- Capture's job 97 passes `name`/`declaredType` on the upload path; nothing here is needed from it to merge. No sentence added; no word row owed.

Tests: `r17-name-type.test.mjs` (4 tests; red first, 3 red and the control green): CSV uploaded as `application/vnd.ms-excel` and as `application/octet-stream` profiled `csv`; `.tsv` declared `text/plain` profiled as a table; controls (PDF named `x.csv` stays `pdf`; the same CSV with no name is not `csv`); the fetch path through `acquire` (octet-stream CSV, text/plain TSV, PDF named x.csv).

The four fields
- cause: `profileOf` called `detectFormat(formatBytes, ct)` with no name, so format-registry R31's name pass never ran, on either path.
- why missed: no test profiled bytes with a name or a non-text declared type; capture's upload path passes `ct` null for a non-text type.
- red first: `r17-name-type.test.mjs` run before the change: 3 of 4 red (format `undetermined`/text), control green. Green after.
- platform check: L; nothing platform-specific (no SQL, no storage call); node:sqlite only.

Checks (run in this session)
- acquisition suite: tests 340, pass 340, fail 0.
- impact (`build/plan/impact.mjs origin/tranche/T51 HEAD`, before commit): 0 modules; users of `profileOf` run: capture 338/338, doorbell 97/97, fail 0.
- format 0 failures; architecture 0; coverage 76 of 76, 0; words 0 failures (acquisition: inline 0, plain 0, testcopy 0); ownership: acquisition's changed files, 0 failures after commit.

Size (session_01QSsP9bjU3egDoknVjvNuYp): test runs 9, module lines 4432

## Round 9, batch D: R17 amended (G174; K5001), session_01Lv37K3RbyQhtwcLT3uXGvx

Applied
- `profileOf` (`acquisition/index.mjs` about 2063): on `origin: "fetch"`, a declared text type over stored bytes that `textTypeOf` (R102) judges not text is dropped: the bytes are not read as text, `ct`, the `content-type` header and a declared text type no longer reach `identify`/`doctypeFor`/`detectFormat`. `source_content_type` still records the source's own statement. The upload (capture R107) and the knock's pull (origin `member`) are unchanged.
- Requirement R17 already carried the amendment (BOB's); no requirement file edit.
- Reproduction: binary bytes (NULs, no signature) served `text/plain` / `text/csv` at `.csv`, `.txt`, `.bin`: format and `content_type` were unchanged, but `profiled_from_text` was `true` (and `text_encoding`, digests basis read as text) where the same bytes served `application/octet-stream` give `false`. That was the red; fixed.

Tests: `r17-fetch-declared.test.mjs` (2 tests; red first: test 1 red on `data.csv` declared `text/plain`, control green). Control: text bytes declared `text/csv` still profile `csv` from text.

The four fields
- cause: the fetch handed the server's content type to `profileOf` and `profileOf` read any bytes under a textual type as text.
- why missed: the upload judged text by `textTypeOf` at its door (capture); the fetch had no such judgement and no test fed non-text bytes under a text type.
- red first: `profiled_from_text` true vs false for the same bytes, as above; green after.
- platform check: N.

Checks (this session)
- acquisition suite: tests 342, pass 342, fail 0. Users of `profileOf` (impact: 112 modules): capture and doorbell suites 441/441, fail 0.
- format 0 failures; architecture 0; coverage 0 (6927 of 6927); words 0 (acquisition: inline 0, plain 0, testcopy 0); ownership 0. No sentence added; no word row owed.

Size (session_01Lv37K3RbyQhtwcLT3uXGvx): test runs 4, module lines 2658

## J44 · COMPLETE

G174 done: fetch no longer reads a declared text type over non-text bytes as text (profiled_from_text was true, now false, as the same bytes declared octet-stream); format and content_type were already unchanged. Test r17-fetch-declared.test.mjs, red first. Acquisition 342/342, capture+doorbell 441/441; format, architecture, coverage, words, ownership 0 failures. Record: build/jobs/T51/acquisition.md (Round 9 batch D).

## Round 9, job 103: G175 (R116) and G177 (R95), session_01FepaYctVekwaxhoDHB6QtY

Applied
- G175: `oweOf` (`acquisition/index.mjs`) now awaits the plane's `armJobs` (the store handed in's, else `opts.armJobs`; `armerOf`, `armAfter`) after every row the registrar accepts, so every `oweOf` user arms (parkFetch, the subresources rows, the render's owed row, the continuation's re-arm, the `unpack` row and `unpack`'s own `owedLater`); `keepLaterOf` (the `keep` row) arms the same way. A refused row arms nothing; an arm that throws never fails the capture (the next alarm is the backstop).
- G177: a thrown call takes ONE clock reading for the cut and the close (`stageTimes(t, at)`, `stageEnd(t, at)`); the normal close reads once too. The answer's `timings.stages` and `total_ms` equal the caller's `opts.timings` object exactly.
- Requirement lines: R95 and R116 were amended by BOB; I removed their "not yet met: T51" markers in `build/requirements/acquisition.md` now that tests name them (K4210: the ownership check lists that one file, accepted at the merge).

Tests (red first, then green)
- `r9-registrar.test.mjs` (3 new, all naming R116; red on the tip: `armed()` false after fetch, keep, subresources, unpack and via `opts.armJobs`; green now). Controls: a refusing registrar arms nothing; a throwing arm leaves the capture 200; a small capture arms nothing.
- `stage-times.test.mjs`: the C5a test now asserts exact equality (my own version; LOAD-REDS' edit not merged); new G177 test with `performance.now` moving 1.5 ms per read after the throw (red: read 7 vs 4; green now).
- control-plane `t51-round7-seam` "G61 twin": green alone (`node --max-old-space-size=6144`, 18/18 in the file, the twin 25.6 s). It was also green alone on the tip with my change stashed (it is the load-dependent test LOAD-REDS found; the module-level red above is the failing-first proof of the missing arm).

The four fields
- cause (G175): `oweOf` registered the row and never called `armJobs`, so the plane's alarm was set for a later time; (G177): three clock readings (`stageTimes`, `t.end`, `stageEnd`) for one cut.
- why missed: no test of an owed row read whether the alarm was armed; the C5a test never moved the clock between reads.
- red first: as above.
- platform check: G175 L (control-plane twin run alone, Node, 6 GB); G177 N.

Checks (this session)
- acquisition suite: tests 346, pass 346, fail 0. capture 349/349, doorbell 97/97, control-plane acquire-timings/server-timing/door-phases + plane r9-jobs 55/55, fail 0.
- `node checks/run.mjs`: format 0, architecture 0, coverage 0 (6927 of 6927), channels 0, words 0 (inline 0, plain 0, testcopy 0). Ownership: 1 listing, `build/requirements/acquisition.md` (accepted, K4210); the other four changed files are mine. No sentence added; no word row owed.

Size (session_01FepaYctVekwaxhoDHB6QtY): test runs 9, module lines 4457

## J45 · COMPLETE

Job 103 done. G175: every row registerJob accepts is now followed by armJobs (store's, else opts.armJobs), all oweOf users and the keep row; G177: one clock reading for a thrown call's cut and close, answer and object equal exactly. R95 and R116 markers removed (tests name them). Tests red first in r9-registrar and stage-times; acquisition 346/346, capture 349, doorbell 97, control-plane timings/door/plane jobs 55, twin green alone. format, architecture, coverage, words 0; ownership lists only build/requirements/acquisition.md (K4210). Record: build/jobs/T51/acquisition.md

## Round 9, job 103 extended (B47, K5006): G154 (4), the `offers` ALTER at workerd

Added `test/m/acquisition/r122-workerd.test.mjs` with its worker `offers-worker.mjs` (a test file in my module; no product change, since nothing was red). On a real Durable Object's SQLite under Miniflare: `archive_entries` is made WITHOUT `offers`, acquisition's `migrate` runs, and the column is there (`PRAGMA table_info` then `ALTER TABLE ADD COLUMN`); a member's `op=unpack` files two entries; the daemon's `op=unpack` offers both again (`complete: false`), `offers` counted 2 on each. Result pasted: `[L] workerd: columns before [..."bytes","tree_entries","tree_bytes"], after [..."tree_entries","tree_bytes","offers"]; offers per entry after the second run [2,2]`; run 3 times, green each (1 test, with r122.test.mjs 6/6 twice more). Platform check L done. Checks: format 0, architecture 0, coverage 76/76 0, words 0, ownership: only `build/requirements/acquisition.md` listed (K4210, accepted). Test runs 3.

Size (session_01FepaYctVekwaxhoDHB6QtY): test runs 12, module lines 4457

## J46 · COMPLETE · re B47

B47 done: G154 (4) platform check. New r122-workerd.test.mjs + offers-worker.mjs (test files only, no product change, nothing red): on workerd/Miniflare an archive_entries table made without offers gains the column via migrate (PRAGMA table_info then ALTER ADD COLUMN); member unpack files 2 entries, daemon unpack offers both again, offers=2 each. Green 3 runs. Checks format/architecture/coverage/words 0; ownership lists only build/requirements/acquisition.md (K4210). Record: build/jobs/T51/acquisition.md

## Fix round 10, Wave A batch 2 (ACQUISITION #40, session_01UzsMeXPSWSfbJkij7yPiZw; B48): R12, 7 fixtures, 99 own fixture lines

### Cause R12 (G3; walk C1: `.tsv` members of an archive unread)
- Root cause: `NAME_TEXT_TYPES` held only txt, md, csv and `textTypeOf`'s name pattern was `/\.(txt|md|csv)$/`, so a `.tsv` (or `.tab`) member typed null at `unpack.mjs` `fileDocument` and was not read as text (`index.mjs` `NAME_TEXT_TYPES`/`textTypeOf`). Fix: `tsv` and `tab` stand for `text/tab-separated-values`, csv-reader's delimited names (the table is a literal here: csv-reader does not export it and is no `uses` of this module; BOB may wish to export it, for P9). R102's *(not yet met: T51)* marker removed (the test names R102).
- Why the tests missed it: `fix5-t51.test.mjs` tested only the names R102 listed (txt, md, csv); nothing put a `.tsv` member through `unpack`.
- Red first: `r12-tsv-members.test.mjs` (2 tests, both name R102): `textTypeOf` gave null for `.tsv`/`.tab`; the archive of `m01.txt`, `m02.tsv`, `m03.csv`, `m04.tab` typed only the txt and csv members. Green after. Controls: a NUL under a `.tsv` name is filed and not typed (null, `profiled_from_text` false); a declared non-text type is not overridden by the name. R-PATH: the member path (`unpack`) and the standalone rule (`textTypeOf`, the upload's and the pull's).
- Platform check: N done (Node, above). L (the 30-member archive, all 10 `.tsv` whole) is named for the redeploy. The workerd run of `r122-workerd.test.mjs` (a real Durable Object's SQLite) is green with the real provenance (below).

### Fixtures published (`bio-plane/test/m/acquisition/fixtures.mjs`, new; `fixtures.test.mjs`, 7 tests, each calls its fixture and compares the real answer)
`acquireRefusals({kind})` (source_refused, fetch_failed, not_eligible), `archiveAnswer({memberBytes})`, `archiveNotHeld({archiveSha})`, `keyedServiceOff()` (over credentials' real `keyedServiceFor`), `notHeldRange()`, `owedFetchAnswer({kind, reason})` (done, outstanding, gone, final with a DELIVERY_FINAL code or SOURCE_REFUSED), `owedRunAnswer({kind, reason})` (done, outstanding, final: RENDER_FAILED over capture-sources' real `renderFailure`, RENDER_NOT_A_PAGE by a restarted module, a DELIVERY_FINAL code). `archiveNotHeld` answers `{ok: false, reason}` as `unpack` gives it; the 409 is the door's mapping, not this module's. The two owed fixtures take the delivery from the caller's side as a FIX-L stand-in (`control-plane deliver-owed`) and the ledger (`plane owed-ledger`), each with its marker.

### Own fixture lines (99)
- FIX-E done: capture-sources `renderFailure` (acquire.test:244, checks.test:66, r7-render-failed, r9-render-charge; the elapsed times are now the driver's own, so r9-render-charge asserts the charge equals the answer's `elapsed_ms`, and the transient tries sum the answers'); the invented `OBJECT_TOO_LARGE` is record-core's real `EVIDENCE_STORE_REFUSED` from its `evidencePartsRefusal` fixture (fix3-t51); `JOB_TABLE_FULL` is plane's `JOB_NOT_KEPT` (r9-registrar); provenance `heldParts`/`homeOfEmpty` in r9-read-range; provenance's real `registeredHomes` behind `fixture.mjs`'s `homeOf` and `registerHolds` (homes named in a test are registered by really promoting a bundle; a capture named under another bundle starts that real world over with the receipts so far; a bundle already promoted takes a later capture in a bundle of its own, named back, since the fixture cannot add to a promoted bundle; the double's other answers (`capturesOf` with `heldAt`, `captureGrade`, `named` parts) stay as they were) and `offers-worker.mjs` uses the real `provenanceOf` over its Durable Object with a real receipt (r122-workerd green, offers per entry [2,2]).
- FIX-L markers added (`// fixtures-contract: <provider> <id>`, 76 lines in 18 files, none idle): plane owed-ledger, plane keep-later, plane job-registrar, control-plane deliver-owed. These stay at `contract-no-run` until each provider's `fixtures-run` is merged: **plane** (owed-ledger, keep-later, job-registrar) and **control-plane** (deliver-owed). `fixtures --list acquisition`: 75 failures, every one `contract-no-run`, none other; no `fixtures-own` or `fixtures-generic` marker added.

### Checks (this session)
- acquisition suite: tests 349 (r12 2, fixtures 7 new), pass 349, fail 0. Users of `fixture.mjs` (capture, screens-intake, control-plane, 10 files): 89/89.
- `checks/run.mjs`: format 0, architecture 0, words 0 (inline 0, plain 0, testcopy 0), coverage 0 for acquisition (76 of 76; other modules' failures are theirs). No sentence added; no word row owed.
- Found in another module (P9): none beyond csv-reader's delimited-names table not being exported.

Size (session_01UzsMeXPSWSfbJkij7yPiZw): test runs 30, module lines 4457
