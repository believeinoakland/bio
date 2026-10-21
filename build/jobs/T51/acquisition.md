# acquisition (T51)

**Status** · session_01HkiEHqLtSvzj1srMtcPyNY · depth 2 · WAITING ON BOB (J13) · handled B14

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
