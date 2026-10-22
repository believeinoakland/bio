# acquisition (T51)

**Status** · session_01HEJ44SYdkiESYxbUXjmywT · depth 2 · COMPLETE · handled B24

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
