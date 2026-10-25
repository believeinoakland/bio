# capture-requests (T51)

**Status** · session_014DGUrY7wCujoHhs8uwNL3N · depth 2 · WORKING · handled B9

## Completion (T51-59 · red #27, N1243)

**Entry applied.** T51-59: `bio-plane/test/m/capture-requests/plane.test.mjs`, the R48 (T50) test, its ghost arm.

**Diagnosis (no source fault).** The test's ghost arm sent `acquire` with `for: "INQ-2026-9999-none"`, a question no inquiry answers to. Control-plane R105 (T50, `build/requirements/control-plane.md`) refuses such a `for` at the door as acquisition's `BAD_FOR` (C-139.21) before any fetch, so `holdAcquired` failed on its first assertion. The reader itself (`capturedFor`, R48) answers that case as the spec states, and the unit test `t50.test.mjs` (R48, "a question not held") asserts it.

**Change.** The ghost arm now asserts what the plane does: `acquire` answers `ok: false, code: BAD_FOR, check: C-139.21`, and no fetch is made for the ghost address. The test's title is amended to say so. Nothing else in the test changed; the control arm (no `for`, no request) is unchanged.

**Decision for Bob to file in `build/rulings.md` (lower-level, recorded here per JOB rule 1).** The plane cannot reach the reader's withheld branch through `acquire`, because R105 requires the question visible at acquire time. Reaching it at plane level would need a question a viewer loses sight of after acquisition, which means a hidden-project fixture (project creation, owner claim, visibility) that this test does not build. I chose the R105 assertion over that fixture. The withheld branch stays covered at unit level.

**Deferred.** None.

**Found in another module.** None from my reading of this module's code and tests.

**Reading.** Read whole: the module's requirements (public and private parts), this job's entry, `build/layers.md`, `bio-plane/src/capture-requests/index.mjs` (1,943 lines, in six reads), `checks.mjs`, `schema.mjs`, the R48 section of `plane.test.mjs`, and `t50.test.mjs`. For the services the entry touches, I read R105's text and acquisition R47's summary from the T50 job record, but not capture R83/R94 whole. I ran the module's other test files without reading them.

**Tests and checks.**
- `plane.test.mjs`: 7 of 7 pass (before the change, the R48 T50 test failed with `BAD_FOR`).
- All `test/m/capture-requests/*.test.mjs`: 127 of 127 pass.
- `checks/format.mjs /home/user/bio`: 0 failures.
- `checks/architecture.mjs /home/user/bio capture-requests`: 0 failures.
- `checks/coverage.mjs /home/user/bio capture-requests`: 56 of 56 live ids named, 0 failures.
- `checks/ownership.mjs /home/user/bio capture-requests tranche/T51 job/T51/capture-requests`: 0 failures (1 file changed).
- `checks/run.mjs /home/user/bio`: no capture-requests line. Its 24 failures are coverage gaps in other modules (for example agent-steps, interface-shell, screens-inquiry), not this one.

**Stale text noted, not changed.** The requirements' Size note says "about 1,050 lines"; the module's own code is 2,653 lines (`index.mjs` 1,943, `checks.mjs` 454, `schema.mjs` 256). The requirements file is not this job's to edit, so I report it to Bob.

**Size (session_01Qs8rZ8r9tU9hSh4VTyESSo): test runs 3, module lines 2653.**

## J1 · COMPLETE

T51-59 done (red #27, N1243). plane.test.mjs R48 ghost arm: the 'for' naming no question is refused BAD_FOR (control-plane R105, C-139.21) before any fetch; the arm now asserts that refusal and no fetch. No source fault. Plane test 7/7; all module tests 127/127; format, architecture, coverage (56/56) and ownership pass. checks/run.mjs shows no capture-requests line (24 coverage gaps are other modules). For Bob to file in build/rulings.md: the plane cannot reach the withheld branch through acquire (R105 needs the question visible at acquire time); unit coverage in t50 stays. Pushed to job/T51/capture-requests at d552c1f40d. No PR opened, per JOB step 1. Full record: build/jobs/T51/capture-requests.md.

## Completion (T51-213 · the words pass, K3949, K3957, K3962)

**Entries applied.** T51-213: all 18 findings of `checks/words.mjs` listed in `build/plan/words-pass/capture-requests.md`, the 3 `plain` findings (K3957) and the 3 test copies of code sentences (K3962), each by the words rule.
- `index.mjs` 1077, 1080 and the stitched tail: the bundle summary, both branches (a run's request and a member's own request), and its bytes sentence, through `localize` (`capture-requests.index.document_served_run`, `…document_served_member`, `…filed_under_the_sweep`, `…under_the_question`, `…bytes_exactly_as_served`).
- `index.mjs` 263: the no-run note, `localize` `capture-requests.index.pass_run_the_run_asking`.
- `index.mjs` 673, 675, 676 and the copy at 673: the held-expiry word's pieces through `localize` (`render_never_performed`, `nothing_fetched_after_expiry`, `reason_last_given`, `no_further_detail`); the fallback "(no code: never attempted)" through the existing row `word("capture-requests.code_attempted")`.
- `index.mjs` 948: the sweep name refusal, `localize` `capture-requests.index.not_a_sweep_name`.
- `index.mjs` 647, 1111 and 1708 (plain): `localize` `capture-requests.index.no_daemon_credential_bound`, `…promotion_did_not_complete`, `…is_not_a_sweep_your_team` (the last is `SWEEP_REFUSALS.unknown`).
- Test copies: `fixture.mjs` 102–105 now carry fixture wording, not the product's (the run's whole-tree check also found 104–105, copied from acquisition's `localize`); `t34.test.mjs` 132–139 compares each named C-28 translation with `word("refusal.<CODE>")` by equality, holding no sentence; `t34.test.mjs` 13 and `t50.test.mjs` 11 reworded the assertion messages (each copied a words row).
- Beyond the findings, the same words rule (R13): `checks.mjs` C-28.1, C-28.4, C-28.16 and C-28.21 translations read `word("refusal.<CODE>")` (their rows exist; the first two now show the list's spelling, e.g. "authorizes"); `index.mjs` 288 (the host-readability detail, neither flagged nor on the design's unkeyed list) through `localize` `capture-requests.index.no_host_readable`; `t35.test.mjs` 467 and `sweep.test.mjs` 97 hold the sweep sentence through `localize`, not a regular expression.

**Deferred.** None. The rest of this module's inline literals (the design's `unkeyed` list, 64 entries) stay in source, as DEC-258 and DEC-260 keep them (K3944).

**Found in another module.** None in code.

**For Bob (not my decisions).**
1. The design's `words-reads.json` unkeyed list spells several of this module's sentences "your group's Civicsmith" (the no-daemon-credential detail, the promotion detail, the step tie, the scope-check detail, the unknown-sweep detail). The source and the words rows say "your team's Civicsmith". R54 says "group". One of them is stale; the design stream should say which, and the list's entries will then match.
2. `checks/words.mjs` does not count a `+` chain of pure string literals that ends in a sentence (the case of 288 above). Those are invisible to the check; R13 binds them, so they need the check's stitched arm extended or a review pass.
3. `rows.mjs` is stale (`setup-words/build.mjs --check` says so). I did not regenerate it; BOB regenerates at the layer close.

**Reading.** Read whole: `build/requirements/capture-requests.md` (both parts), `build/layers.md`, `bio-plane/src/capture-requests/index.mjs` (1,909 lines), `checks.mjs` (403), `setup-words/index.mjs`, the words-pass file, and the test files that hold findings (`fixture.mjs`, `t34.test.mjs`, `t50.test.mjs`); the job entry and the tranche merge. I ran the module's other test files without reading them, and read `t35.test.mjs` and `sweep.test.mjs` only at the lines the findings name.

**Tests and checks.**
- `node --test bio-plane/test/m/capture-requests/*.test.mjs`: 127 of 127 pass (before the fixture and line-288 edits, and after both).
- Related tests (`acquisition/sweep-scope`, `co-archive`, `checks`, `selflink-render`; `scheduler/plane`, `producers`; `inquiry/document-waits`; `plane/sweep`; `record-core`; `skills/lookup`): 153 of 153 pass.
- `checks/words.mjs /home/user/bio capture-requests`: 0 failures (it was 23 before the pass: 9 inline, 3 plain, 11 testcopy).
- `checks/format.mjs /home/user/bio`: 0 failures. `checks/architecture.mjs /home/user/bio capture-requests`: 0 failures. `checks/coverage.mjs /home/user/bio capture-requests`: 56 of 56 live ids named, 0 failures.
- `checks/run.mjs /home/user/bio`: no capture-requests line; its other failures are in other modules.
- `bio-plane/src/setup-words/build.mjs --check`: `rows.mjs` stale (expected, not regenerated); no refusal names this module.
- `checks/ownership.mjs` after the commit: see the posted COMPLETE.

**Size (session_019pe7uRW2gPXhRG61G9zuCe): test runs 4, module lines 2559.**

## J2 · COMPLETE

T51-213 is done (the words pass for capture-requests), committed and pushed at c85a755476. Record: build/jobs/T51/capture-requests.md, section "Completion (T51-213)".

Done: all 18 findings of checks/words.mjs, the 3 plain sentences (K3957) and the 3 test copies (K3962). Also the C-28 translations that still held literal text now read their words rows, and one unflagged sentence (index.mjs:288) is keyed. Nothing deferred. The design's unkeyed list stays in source.

Checks: words 0 failures (was 23); module tests 127/127; related tests 153/153; format, architecture, coverage (56/56) and ownership (8 files, this module only) all 0 failures. checks/run.mjs has no capture-requests line.

For Bob, not decided here:
1. The words-reads.json unkeyed list says "your group's Civicsmith" for several sentences; the source and the words rows say "your team's". One is stale.
2. checks/words.mjs does not count punctuated pure-literal "+" chains, so such sentences are invisible to it (R13 binds them).
3. rows.mjs is stale; not regenerated (BOB regenerates at the layer close).

No PR opened, per JOB step 1.

## Completion again (CHANGE B3, K4015: the words check folds pure-literal `+` chains)

**Change applied.** The check now judges a `+` chain of literals as one sentence. It found one more: `index.mjs` 504–505, the step-tie fallback ("the tie to the step did not complete and your team's Civicsmith did not record why"). The design's unkeyed list has that sentence spelled "group", so the text did not match and it was not counted. It now reads `localize("capture-requests.index.tie_to_step_not_complete", …)`. No sentence is judged unread, so none goes to the unkeyed list.

**Checks after the change.**
- `checks/words.mjs /home/user/bio capture-requests`: 0 failures (inline 0, plain 0, testcopy 0; unkeyed 55).
- `node --test bio-plane/test/m/capture-requests/*.test.mjs`: 127 of 127 pass.
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs capture-requests`: 0 failures. `checks/coverage.mjs capture-requests`: 56 of 56, 0 failures.

**Size (session_019pe7uRW2gPXhRG61G9zuCe): test runs 5, module lines 2559.**

## J3 · COMPLETE

CHANGE (B3, K4015) applied at 17f8ba30c9: the words check folds pure-literal + chains. It found one more sentence (index.mjs step-tie fallback), now localize(). Checks: words 0 failures (inline 0, plain 0, testcopy 0; unkeyed 55); module tests 127/127; format, architecture, coverage (56/56) 0 failures; ownership 8 files, 0 failures. Nothing judged unread, so nothing added to the unkeyed list. Record: build/jobs/T51/capture-requests.md, section 'Completion again'. Waiting on BOB.

## J4 · QUESTION

**C20 / K4202 · capturerequest: the declared requires.** The arm refuses a run's request without its run and question, but a member's own request (R56) with neither is accepted. A declaration cannot state "run and target, unless the caller is a member session", so `DECLARED_OPS.capture-requests.capturerequest` declares `requires: ["address"]` (the one field refused without under every caller) and names the conditional ones here. Best reading taken: keep `["address"]`. If you want the run and question stated, the op must split (a member's request as its own op), which is your call.

Stamps: `principal` is read from the query by the ops map. I excluded it from `accepts` as the rule excludes `by`, which the records arms read from the same stamp. Best reading taken; say so if you want it listed.

Requirement lines for the record (next free ids): R57 (capturerequestretry, C20), R58 (capturerequest and capturerequestretry, K4202; capturerequestretry counted once under R57). Both are in `build/jobs/T51/capture-requests.md`, marked not yet met (T51).

## J5 · REPORT

**Other modules, found by `checks/run.mjs` (not my module; not touched).** The coverage check reports live requirement ids that no test names, in: `agent-harness` (R17), `agent-runner` (R36, R37, R38, R40), `citation` (R16, R17, R18), `installer-steps` (R26, R31), `journey-check` (R19), `link-sweep` (R13, R14, R15) and `monitoring` (R75, R76, R77). They are not caused by this change; I did not check whether they predate it. The architecture, format, words, channels and ownership checks report 0 failures.

## J6 · COMPLETE

**COMPLETE: capture-requests, fix round T51 (K4189 C20, K4202 census).** Branch `job/T51/capture-requests`, commit `97bf92ac32`.

**Entries applied**
- C20 (K4189): `capturerequestretry` declared in `DECLARED_OPS` beside the ops map (`bio-plane/src/capture-requests/index.mjs`). `classes` admin and member, `mutating` true, `weight` `substrate` (its RUNG_ABSENT ground), `description` its NON_ACTS reason, `accepts` and `requires` `["request"]` (the arm reads `request` from body or query and refuses without it, `request: null`). Test: `declared-ops.test.mjs`, R57.
- K4202 census: `capturerequest` declared the same way (`classes` admin, member, probe; `mutating` true; `weight` `substrate`; `description` its NON_ACTS reason). `accepts` is the 19 fields `captureRequest` reads from the body (run, address, target, lead_inquiry, lead, purpose, ua_mode, render, step, co_archive, site_kind, sweep and the seven CAPTURE_FIELDS), `requires` `["address"]` (see the QUESTION). `capturerequestretry` counts once, under R57. Test: R58.

**Requirements (new, not yet met, named in tests)**
- **R57** (T51; K4189, C20) `DECLARED_OPS` declares `capturerequestretry`: its classes, mutating, weight and description copied from its hand rows; `fields` accepts `request` and requires `request`. Test `declared-ops.test.mjs` R57: its requires alone raise no refusal naming a field; without `request` the refusal carries it as null; a field outside accepts is dropped.
- **R58** (T51; K4202) `DECLARED_OPS` declares `capturerequest`, by the same rules; `fields` accepts the 19 body and query fields `captureRequest` reads and requires `address`. Test `declared-ops.test.mjs` R58, same three checks.

**Deferred:** the run and question that a run's request needs (conditional, see the QUESTION).

**Other findings:** recorded in the REPORT (J5), coverage failures outside this module.

**Checks and tests (run from this checkout)**
- `node --test bio-plane/test/m/capture-requests/*.test.mjs`: 129 pass, 0 fail.
- `node --test bio-plane/test/m/op-declarations/declared.test.mjs bio-plane/test/m/op-declarations/t48.test.mjs bio-plane/test/m/op-grades/ladder.test.mjs bio-plane/test/m/op-grades/register.test.mjs`: 56 pass, 0 fail.
- Owner rows against hand rows: `op-grades` `registerDeclaredOps` answers `agreed: [capturerequest, capturerequestretry]`, nothing registered, no refusal. `op-declarations` `registerDeclaredOps` accepts both, and `declaredFields` reads back the declared fields.
- `node checks/run.mjs /home/user/bio`: format 0 failures; architecture 0 failures; words 0 failures (607626 literals, inline 0, unkeyed count is the checker's count, not a failure). Coverage: 7 failures, all in other modules (listed in REPORT J5); capture-requests not among them.
- `node checks/ownership.mjs /home/user/bio capture-requests tranche/T51 job/T51/capture-requests`: 1 file changed by capture-requests, 0 failures.
- `npm ci --ignore-scripts` run in the five directories that had a tracked lock file but no node_modules (K4113).

Size (session_019iGGVzKW9ch92DaSZZghQc): test runs 4, module lines 2585 (src/capture-requests, the three files).

## Completion (B7 · fix round 10, Wave A batch 3: fixtures)

**Published.** `bio-plane/test/m/capture-requests/fixtures.mjs` (new): `sweepScopeRegistrar`, the real R45 `registerSweepScope` first registration and a second one refused `LISTENER_DECLARED` naming the holder; `fixtures.test.mjs` calls it and checks the real answer (R45).

**Own lines re-pointed (FIX-E).**
- `fixture.mjs` `fakeCapture` (now `captureStage`): over capture's published `captureArm` (real capture, scripted network, calls recorded); a scripted answer still wins, otherwise the real capture files the address's bytes. A thrown fault is still injected by the stage.
- `fixture.mjs` `renderRefusal`: capture's published `acquireRefusal` for RENDER_DEFERRED, RENDER_NO_RENDERER, RENDER_HOST_COOLING_OFF; for RENDER_NOT_A_PAGE, RENDER_FAILED and RENDER_AT_CAPACITY (no provider fixture gives them) the same published `captureArm` driven to the real refusal (a PDF served, a renderer answering 500, an allowance admitting none). Scripted sites in `drain.test.mjs` and `reads.test.mjs` unchanged; they now receive real answers.
- `t35.test.mjs` `fakeStandards` (now `realStandards`): standards' published `standardReadWorld`; standards are declared through its real `declare` (held cited, text, absent), and the expected citation and addressee read from the real answer.

**Markers (BOB reads each, K5060).**
- `drain.test.mjs:286` `fixtures-own: platform`: the evidence-store (R2 bucket) double handed to the real `acquire` (head/get/put only).
- `reads.test.mjs:105` `fixtures-generic: NOT_A_CODE`: a code made up on purpose to prove an uncatalogued code answers null check and translation.
- `sweep.test.mjs:18` `fixtures-contract: link-sweep sweep-scope`: the four lines 22-25 of the stand-in scope check; shows `contract-no-run` until link-sweep's run is merged.

**Left, named.** `sweep.test.mjs:22-25` (waits for link-sweep's `fixtures-run`); `t41.test.mjs:148` (FIX-E, provider `steps`, arrives as a CHANGE).

**For BOB (other modules, P9).**
1. `standards` fixture has no way to make a standard confidential to a project (the sight of a project), nor members other than carol. `t35.test.mjs` therefore keeps a thin wrapper (`realStandards`) that hides one named standard from viewers it lists and maps any member viewer to carol; every answer is still standards' real one. A fixture option for a project-filed standard would remove the wrapper.
2. `capture`'s `acquireRefusal` gives three render codes; RENDER_NOT_A_PAGE, RENDER_FAILED and RENDER_AT_CAPACITY are real `acquire` answers no provider fixture offers. I made them in `fixture.mjs` through `captureArm`; capture may publish them and the local branch can go.

**Tests and checks.**
- `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit bio-plane/test/m/capture-requests/*.test.mjs`: 130 pass, 0 fail.
- `checks/fixtures.mjs . capture-requests --list`: 9 failures before, 5 now (4 contract-no-run, 1 steps); 2 accepted markers.
- format 0 failures; architecture 0; coverage 58 of 58, 0; words 0; ownership 0 (my files only).
- `impact.mjs origin/tranche/T51 HEAD` names modules by the tranche's own changes; no module imports a file I changed (only my tests changed; the new fixture has no user yet), so no user tests needed re-running.

Size (session_016v1BcEsgoXvoBS2PnqgQYs): test runs 8, module lines 2585 (src/capture-requests; only tests changed).

## J7 · COMPLETE · re B7

COMPLETE B7 (fix round 10, batch 3) at 543ac61afb. Published sweepScopeRegistrar (fixtures.mjs + fixtures.test.mjs, R45). Re-pointed fixture.mjs captureArm and acquireRefusal (renderRefusal; RENDER_NOT_A_PAGE/FAILED/AT_CAPACITY via captureArm, no provider gives them) and t35 standardRead (realStandards over standardReadWorld). Markers: drain.test.mjs:286 fixtures-own platform; reads.test.mjs:105 fixtures-generic NOT_A_CODE; sweep.test.mjs:18 fixtures-contract link-sweep sweep-scope (4 lines contract-no-run until link-sweep's run merges). Left: t41.test.mjs:148 (steps, CHANGE). Module tests 130/130; fixtures list 9 -> 5 failures (all waiting); format, architecture, coverage 58/58, words, ownership 0 failures. For BOB: standards fixture lacks a project-confidential standard option; capture could publish the three render codes. Record: build/jobs/T51/capture-requests.md, section 'Completion (B7)'.

## Completion again (B8 · CHANGE, K5079)

Merged `origin/tranche/T51`. `t41.test.mjs` R55's thrown-tie arm no longer hand-lists a `steps` answer: it uses the real steps of the world with a real step (`stepOf`) and a `recordProduct` that throws (a fault injection). Module tests 130/130; fixtures list now 4 failures, all `sweep.test.mjs:22-25` `contract-no-run` waiting on link-sweep's run; format, architecture, coverage, words 0 failures.

Size (session_016v1BcEsgoXvoBS2PnqgQYs): test runs 10, module lines 2585 (only tests changed).

## J8 · COMPLETE · re B8

COMPLETE B8 at 69c59e3372 (tranche/T51 merged). t41.test.mjs R55 thrown-tie arm now runs over the real steps (real step via stepOf, recordProduct throwing as a fault). Module tests 130/130; fixtures list 4 failures, all sweep.test.mjs:22-25 contract-no-run waiting on link-sweep's run; format, architecture, coverage 58/58, words, ownership 0 failures. Record: section 'Completion again (B8)'.

## Completion (B9 · fix round 10, the final pass's causes; plan item 71 (1), K5148)

**Cause 1 done: a member can mark a host a login-gated platform (R46).**
- *Cause:* `captureRequestsOps` routed none of `capturerequestplatformmark`, `capturerequestplatformunmark` or `capturerequestplatformhosts`, though `markPlatform`, `unmarkPlatform` and `platformHosts` exist and op-declarations declares the three (`bio-plane/src/op-declarations/index.mjs:427`, `member` and `read`). No request reached the mark R46 reads.
- *Where:* the ops map, `bio-plane/src/capture-requests/index.mjs` (`captureRequestsOps`, from line 1909); the methods (`markPlatform` 1625, `unmarkPlatform` 1654, `platformHosts` 1676) and the declaration were re-read and are as the diagnosis says.
- *Fix:* three routes added beside `capturerequestretry`. Mark and withdrawal take the body as their argument and the actor from the query's `viewer`, as the module's other ops take it; the hosts read takes `viewer` and `limit` from the query, as `capturerequests` does.
- *(1) Failing first:* `bio-plane/test/m/capture-requests/platform-ops.test.mjs` (new; R46 in its title), calling the three ops through `captureRequestsOps(c, url, body)`. Seen red on the code before the route: `TypeError: captureRequestsOps(...).capturerequestplatformmark is not a function`. Green after it.
- *Asserts:* a mark answers as `markPlatform` does (the host normalised, `marked_by` the viewer); a second mark answers `already: true` with the same mark id; the hosts op lists the standing mark; a withdrawal answers as `unmarkPlatform` does, the row kept with who withdrew it; a repeated withdrawal answers `already: true`.
- *Control:* a host nobody marked is not listed (`portal.example.gov` absent); a mark by no member (absent viewer, empty, `class:ai`, `class:member`, `token:x`) is refused `CAPTURE_PLATFORM_MARK_REFUSED` (C-28.22) and writes nothing; an absent viewer sees no marks.
- *(3) Why the tests missed it:* the R46 tests in `member-only.test.mjs` call the three methods on the module object (`w.cr.markPlatform(...)`), never through the ops map, so an unrouted op was invisible to them. `coverage.mjs` counts the requirement ids a test names, not whether each op a family declares has a route in the map, and no check ties this module's declared ops to its ops map. The declaration said the ops existed; nothing checked that they were reachable.

**Requirement:** R46 met (named by `platform-ops.test.mjs`). No requirement line was added or amended by this job; BOB strikes the *(not yet met: T51)* mark on R46.

**Deferred:** nothing.

**Checks (absolute product root `/home/user/bio`):**
- module tests: `bio-plane/test/m/capture-requests/*.test.mjs`, 131 of 131 pass, run without `--test-force-exit` (the run exited by itself); `platform-ops.test.mjs` 1 of 1 pass.
- `checks/format.mjs`: 178 modules, 0 failures.
- `checks/architecture.mjs capture-requests`: 20 product files, 0 failures.
- `checks/coverage.mjs capture-requests`: 58 of 58 live requirement ids named by a test, 0 failures.
- `checks/fixtures.mjs /home/user/bio capture-requests --list`: 0 failures; accepted 6, all already listed; no new failing line; no `fixtures-own` or `fixtures-generic` marker added.
- `checks/run.mjs /home/user/bio`: 0 findings in any capture-requests file. Repo-wide, it reports findings in other modules (16 word failures and FAIL lines in screens-daily, screens-inquiry, screens-intake, screens-settings, plane, control-plane and others). They are not in this job's files and are not touched here.
- `checks/ownership.mjs /home/user/bio capture-requests tranche/T51 job/T51/capture-requests`: run after the commit below.

**Found in other modules (reported to BOB in this job's COMPLETE, not changed):** `screens-intake` tests hand-build answers for the capture-request ops this module serves (`capture.test.mjs:274,280,646`, `common.test.mjs:35`, `phone390.test.mjs:37`, `r8-add-reads.test.mjs:18`, `t51-credentials.test.mjs:33,57`, `t51-fix2.test.mjs:101`). Their re-pointing is screens-intake's own job.

**Size (session_01KmKzc6DsB65KPdNxW7UEBJ): test runs 4, module lines 2590.** (Test runs: the new test seen red, the same test after its own fix to the test's helper, the test green, and the module directory run. Module lines: `bio-plane/src/capture-requests/*.mjs`, all files of the module.)

## J9 · COMPLETE

COMPLETE for B9 (fix round 10, the final pass's causes; plan item 71 (1)).

Cause 1 is done: a member can now mark a host a login-gated platform (R46). captureRequestsOps routed none of capturerequestplatformmark, capturerequestplatformunmark or capturerequestplatformhosts; it routes the three now (src/capture-requests/index.mjs, the ops map from line 1909). Mark and withdrawal take the host from the body and the actor from the query's viewer; the hosts read takes viewer and limit from the query.

Commit 82e135a332 is pushed to job/T51/capture-requests (fast-forward; no rebase, no force).

Test: bio-plane/test/m/capture-requests/platform-ops.test.mjs (new, R46 in its title), calling the three ops through captureRequestsOps(c, url, body). Red before the route (TypeError: ... capturerequestplatformmark is not a function), green after. Controls: an unmarked host is not listed; a mark by no member is refused CAPTURE_PLATFORM_MARK_REFUSED with nothing written. The module's 131 tests in bio-plane/test/m/capture-requests pass (131 of 131, run without --test-force-exit; the run exited by itself).

Why the tests missed it: the R46 tests call the methods on the module object, never through the ops map, and coverage.mjs counts named ids, not routed ops. Recorded in my record.

Met ids: R46. No requirement line added or amended; BOB strikes the mark on R46.
Markers added: none. Deferred: none.

Checks, absolute root /home/user/bio: format 0 failures; architecture (capture-requests) 0; coverage 58 of 58 live ids named, 0; fixtures --list 0 failures, no new failing line; ownership capture-requests tranche/T51 job/T51/capture-requests: 3 files, 0 failures. checks/run.mjs: 0 findings in capture-requests files.

Found in other modules (not changed here, for BOB to place):
- checks/run.mjs reports repo-wide findings in other modules (16 word failures; FAIL lines in screens-daily, screens-inquiry, screens-intake, screens-settings, plane, control-plane and others). Not in this job's files.
- screens-intake tests hand-build answers for capture-request ops this module serves: capture.test.mjs:274,280,646; common.test.mjs:35; phone390.test.mjs:37; r8-add-reads.test.mjs:18; t51-credentials.test.mjs:33,57; t51-fix2.test.mjs:101. Their re-pointing is screens-intake's job.

Size (session_01KmKzc6DsB65KPdNxW7UEBJ): test runs 4, module lines 2590.

## Completion (B10 · re-issue of K5148 cause 1 as K5161; the route is already on the tranche)

**The cause was done before this START.** B10 (K5161) asks for the same change as B9 (K5148): route `capturerequestplatformmark`, `capturerequestplatformunmark` and `capturerequestplatformhosts`. My J9 completion (B9) already did it: the three ops are routed in `captureRequestsOps` (`bio-plane/src/capture-requests/index.mjs`, from line 1909, the three entries at 1923–1925), with the test `bio-plane/test/m/capture-requests/platform-ops.test.mjs` (R46). That commit, `82e135a332`, is on `tranche/T51` and on this branch. Reading the START's premise ("your route map wires none", "today each answers as an unknown op") against the code shows it is out of date. I made no new code change this round.

**Checked this round, from the tranche as it stands.**
- Read whole: `build/plan/starts-T51-F10/capture-requests-k5161.txt` (this START's text), `build/plan/fix-round-10-T51.md` §3 item 71 (1), `bio-plane/src/capture-requests/index.mjs` lines 1625–1680 (`markPlatform`, `unmarkPlatform`, `platformHosts`) and 1906–1930 (the ops map), `bio-plane/test/m/capture-requests/platform-ops.test.mjs`.
- Route wiring: the ops map is spread into the plane's and store-assembly's maps (`bio-plane/src/plane/store.mjs:922`, `bio-plane/src/store-assembly/assemble.mjs:831`). Both spread `captureRequestsOps`, so the three ops reach the control plane.
- The test calls each op through `captureRequestsOps(c, url, body)`: mark, a repeated mark (`already: true`), unmark, a repeated unmark, the hosts list, and the controls (an unmarked host is not listed; a mark by an absent, empty, `class:ai`, `class:member` or `token:` viewer is refused `CAPTURE_PLATFORM_MARK_REFUSED` (C-28.22) and writes nothing).
- Which screen offers the mark is not touched (UX-DESIGN's).

**Tests and checks** (from the repository root / absolute product root `/home/user/bio`):
- `node --import ./bio-plane/test/platform-sqlite.mjs --test bio-plane/test/m/capture-requests/*.test.mjs`: 131 of 131 pass; the run exited by itself, no `--test-force-exit`.
- `platform-ops.test.mjs` alone: 1 of 1 pass (R46).
- `checks/format.mjs`: 178 modules, 0 failures. `checks/architecture.mjs capture-requests`: 0 failures. `checks/coverage.mjs capture-requests`: 58 of 58 live ids named, 0 failures (R46 is named by `platform-ops.test.mjs`). `checks/words.mjs capture-requests`: inline 0, plain 0, testcopy 0, missingkey 0, unkeyed 55; 0 failures. `checks/ownership.mjs capture-requests tranche/T51 job/T51/capture-requests`: 1 file changed by capture-requests, 0 failures. `checks/fixtures.mjs /home/user/bio capture-requests --list`: 0 failures; the six accepted markers are the existing ones (`sweep.test.mjs:23–25` and the rest of the list). No marker added this round.

**Deferred.** None.

**Found in another module.** None.

**Why the tests missed it (for the record, from J9).** The module's own tests called `markPlatform`, `unmarkPlatform` and `platformHosts` directly, and no test passed through the ops map, so the missing route was not seen. `platform-ops.test.mjs` is the test that goes through the map.

**Size (session_014DGUrY7wCujoHhs8uwNL3N): test runs 3, module lines 2590.** (Test runs: the module directory run, then `platform-ops.test.mjs` run twice to confirm its result. Module lines: `bio-plane/src/capture-requests/*.mjs`, all files of the module.)
