# plane (T51)

**Status** · session_01Ti86WihtuNpDK1TTmcsSAd · depth 2 · WORKING · handled B17

## Record (PLANE #41, T51-125)

**Entries applied**
- R24: `plane/screens.mjs` deleted (the 21 legacy entries); `store.mjs` hands `answers` `wizard-scripts`' `SCREEN_REGISTRY` (no copy); `wizards.mjs`' `screenFailures` defaults to it, reads `name` for `title`, and leaves `owed` apart. `t43`, `release`, `words` follow; `release` reads the screen count from the design's `registry.json` (71 in the file today, 73 after BOB's regeneration; the test accepts 71 up to the file's count).
- R64: `package.json` `build` is `node scripts/build-plane.mjs`; `embed:sign` deleted; `worker.test.mjs` pins both; its stale comment/title at :43 now says the interface page at the root.
- R65, R66 (new `t51.test.mjs`): the T51 reads are in the route map through their owners' maps and answer through the door as the owners' maps do; ops are read from `maps.mjs` (`opsServedBy`, `servedThroughDoor`: new helpers over `ownMaps`), never listed.
- K3997 `compose.test.mjs`:84 (the inherited red) cleared; `accepted`, `docket`, `t46`, `t47`, `t48`, `t50` hand-lists replaced by the owners' maps.
- K4051: `filingsOf` is handed `env` (`store.mjs`), so filings R64's registration with case-inputs runs in production; `t51.test.mjs` pins it with a bare-host control (checked red without the change).
- Words: 9 findings and the 6 test copies cleared (`release` keys, `hosts`/`t36` name the refusal by its declaration `CAPTURE_CREDENTIAL_CHECKS`, `disclosures`/`t39` assertion messages). `words.mjs plane`: 0 failures; over the whole product no line names the plane.

**Deferred:** none.

**Found in other modules (for BOB)**
- `bio-plane/src/setup-words/rows.mjs` still holds the `plane.screens.*` rows (stale until BOB regenerates; `build.mjs --check` names one).
- `docs/development/ux-substrate/screens/words-reads.json` still lists the 26 `screen.*` keys for plane (the design lane's file); `words.test.mjs` no longer asserts them.
- `screen-registry.mjs` holds 71 screens; R24 expects 73 after regeneration (`glossary`, `actionnew`).
- `op-declarations` does not yet declare R77's reads or `holdsdue`, `templatebyhandle`, `rulefields` (`OPS`); the plane's tests do not depend on it.
- `scripts/embed-signpage.mjs` and the comment in `scripts/fleet-bundle.mjs`:24 remain (control-plane's / bundler's).
- `answers` reads no `deps.screens` (as the requirement already notes).

**Tests and checks**
- `node --test "bio-plane/test/m/plane/*.test.mjs"`: tests 264, pass 264, fail 0 (before: 258, 1 red inherited).
- `bio-plane/test/system/migrate-released.test.mjs`: pass 1, fail 0.
- format 0 failures; architecture 0 failures; coverage 66 of 66; ownership 22 files, 0 failures; words (plane) 0 failures; `setup-words build --check`: stale rows, expected.

Size (session_01LkcRK7mT8LTN4K87RmmRdp): test runs 5, module lines 2295

## J1 · COMPLETE

T51-125 applied; plane suite 264/264, migrate-released 1/1; format, architecture, coverage (66/66), ownership and words checks 0 failures. Details and findings for other modules in the record.

## Record: CHANGE B2 (K4076, instance-setup R95)
- `door.mjs` `publicOp`: the bootstrap report is handed `caller` as the control plane resolves it (`caseReader`, admission's `readerOf`): `{cls: "admin"}` for an admin-class token or an administrator's session, none otherwise (no credential, a member or unknown token, a store silence).
- `worker.test.mjs`: an admin token is told the seven facts; no credential, a member token and an unknown token are not (key set read from `BOOTSTRAP_FACT_KEYS`). `door.test.mjs`: 45 routes, `bootstrapfacts` driven.
- Verified with instance-setup's branch merged without committing (`git merge --no-commit`, then aborted): plane suite 265/265. `tranche/T51` does not yet hold instance-setup's change, so the two new assertions need it to merge first; on the tranche alone the admin assertion fails and the route count is 44.
- Checks: format, architecture, coverage (66/66), words, ownership: 0 failures.
- Size (session_01LkcRK7mT8LTN4K87RmmRdp): test runs 7, module lines 2306

## J2 · COMPLETE

CHANGE B2 applied: publicOp hands bootstrapOp the resolved admin caller; door.test counts 45 routes. Suite 265/265 with instance-setup's branch merged uncommitted; tranche/T51 alone needs instance-setup merged first for those two assertions. Checks 0 failures.

## Record: CHANGE B3 (K4098, control-plane R110)
- `store.mjs`: `controlPlaneOwnerOps` is handed `filings` and `actionPlans` getters. `t51.test.mjs`: `approvedunsent` and `checkpointsdue` answer through the plane (checked red without the getters). `door.test.mjs`: affordances' ops read from its map (its `affordancevocab` is new from the merged tranche), no pin.
- Merged `tranche/T51`. control-plane's change (the owner arms) is not on the tranche yet: with `origin/job/T51/control-plane` merged uncommitted (then aborted) the suite is 266/266 after the door.test fix; on the tranche alone two tests fail until it merges (the new one, and `op=sweeps` link-sweep R5, which control-plane's change also fixes). You merge plane after control-plane.
- Checks: format, architecture, coverage 66/66, words: 0 failures.
- Size (session_01LkcRK7mT8LTN4K87RmmRdp): test runs 10, module lines 2308

## J3 · COMPLETE

CHANGE B3 applied: filings and actionPlans getters handed to controlPlaneOwnerOps; both ops answer through the plane. 266/266 with control-plane's branch merged uncommitted; on the tranche alone 2 tests wait for control-plane to merge (merge it first).

## Record: CHANGE B4 (K4100, t50 R63 `groupidentity` 502)
- Diagnosis: not a route or wiring flaw. `groupIdentityOp` (and `instanceGroupOp`) ask the store stub `fetch("http://do/groupidentity")` with an address string, as a Durable Object stub accepts; `t50.test.mjs`' `askWorld` bound `env.STORE.get` to the bare `Store`, whose `fetch(req)` needs a Request, so the call threw and the door answered 502 `STORE_DID_NOT_ANSWER`. Screens-daily's Home reading is the first widest-screen read to go that way. Directly (`/groupidentity` through the store door) the route answers 200.
- Fix (test world, as the host builds it): `askWorld`'s stub wraps `fetch` to accept an address or a Request and delegates every other method. t50 8/8; plane suite 266/266; format, architecture, coverage 66/66, words: 0 failures. Nothing deferred; no other module affected.
- Size (session_01LkcRK7mT8LTN4K87RmmRdp): test runs 12, module lines 2308

## J4 · COMPLETE

CHANGE B4: the t50 R63 502 was the test world's store stub (a bare Store whose fetch needs a Request, asked with an address as a Durable Object stub accepts); fixed in the world, no plane flaw. Suite 266/266, checks 0 failures.

## J5 · COMPLETE

CR-24 (R67) applied: the ask's reading language is read from `translations` (`translationsOf(ctx).readingLanguage`, its R10) at `plane/ask.mjs`; instance-setup's delegate is no longer asked by the plane.
- `test/m/plane/door.test.mjs` (R1, R5, R67): instance-setup's routes are 36; translations' nine are compared against `translationsOps` and driven through the door; route set equals instance-setup's 36 plus translations' 9.
- `test/m/plane/t48.test.mjs` (R50, R67): the spy moves to `translations.readingLanguage`; controls unchanged (no language set answers LANGUAGE_NOT_SET; a malformed tag answers LANGUAGE_MALFORMED).
Deferred: none.

Found in other modules (for BOB, not fixed here):
- `checks/coverage.mjs` over all modules reports 7 modules with ids named by no test: agent-harness R17, agent-runner R36 R37 R38 R40, installer-steps R26 R31, instance-setup R99 (CHANGE after this merges, per CR-24), journey-check R19, screens-inquiry R83, screens-settings R62.
- Full `npm test` in bio-plane (all test/m, not only plane) shows 107 failures in other modules: journey-check (12 files), case-checker program R13/R25, doc-clean R4 (workerd memory). Plane's suite is green.

Tests and checks:
- `node --test "test/m/plane/*.test.mjs" test/system/migrate-released.test.mjs`: tests 267, pass 267, fail 0.
- door.test.mjs 6/6; t48.test.mjs 13/13.
- format 0 failures; architecture 0 failures; coverage (plane) 67 of 67; ownership (plane, tranche/T51, job/T51/plane) 0 failures; words 0 failures; `checks/run.mjs` ran: coverage fails only in other modules listed above.

Size (session_011vKkDz3Fp8T8FuWAfs336Z): test runs 4, module lines 2307

## J6 · QUESTION

QUESTION (PLANE #43, B6 / FR-32). Three points; I carry on with entries 1 and 5 on my best readings.

1. Entries 2, 3 and part of 4 need exports that are not on tranche/T51 (tip 62068caf14, merged into my branch): `captureSourcesOps` (capture-sources, FR-11, C20) and `investigationOps` (investigation, FR-15, C65) do not exist in any file under bio-plane/src, and the job branches job/T51/capture-sources and job/T51/investigation hold no such map either (their records show J2 COMPLETE / J1 COMPLETE from the earlier round). The START says every owner above merges before me. I cannot spread, test or write R69/R70 truthfully until they are on the tranche. Best reading: I do entries 1, 5 and the iterable parts of 4 now, post COMPLETE-pending-owners as a REPORT, and wait for a CHANGE that says capture-sources and investigation are merged; then I apply 2, 3 and re-run 4.

2. Entry 5, `ask`: the plane's arm (`askOp` / `askOnObject`) refuses nothing for a missing `question`; agent-worker's /ask does. Best reading: `fields.requires: []` and `accepts: ["question","conversation","project","store","token"]` (token: body or query, as `presentedToken` reads it). `readtranslate`: `accepts: ["subject","language"]`, `requires: ["subject"]` (the arm answers BAD_TASK 400 naming `subject`). `ask` is copied as classes admin+member, machineClasses [], mutating true, weight `caller-owned` (RUNG_ABSENT), description the NON_ACTS sentence; `readtranslate` as mutating false, weight `read`, description its NON_ACTS sentence. Tell me if `question` should be required.

3. Entry 1, shape: ES modules cannot enumerate their imports, so the assembly is `plane/declarations.mjs`: one static import per composed module that exports `DECLARED_OPS` (as `DECLARED_OPS as <module>`), the plane's own included, called once at the top of store.mjs before the Store class exists. Seven modules (answers, attestation, content, escalation, explore, provenance-routes, workbooks) declare in `ops.mjs` and do not re-export from `index.mjs`; I import their `ops.mjs` directly. `sources` is composed through store-door, not store.mjs; I import its declaration too. The test iterates `declaredOpsOf(root)` (modules.json) against the assembled table, so a module missing from the file fails by name; no test lists a module's ops.

## J7 · REPORT

REPORT (PLANE #43, FR-32): entries 1, 5 and the iterable part of 4 are applied and pushed; 2 and 3 wait for the owners.

Applied
- R68 (entry 1): `plane/declarations.mjs` (one static import per declaring module, the plane's own included; `assembleDeclaredOps` refuses a duplicate naming the op and both modules before either registration is called) and `plane/register.mjs`, the first import of both `index.mjs` and `store.mjs`. Registering inside store.mjs was not enough: `control-plane/index.mjs` reads the op tables when it loads and `index.mjs` imports it before `store.mjs`, so a late call would crash the Worker's start (R81, registered after the first read). Consequence for tests: a test that reads an op table before it imports the plane must import `register.mjs` first; t42 to t45 now do. The real modules register with no duplicate and no disagreement (219 ops, 55 owners).
- R72 (entry 5): `plane/declared.mjs` declares `ask` and `readtranslate`, copied from their hand rows; fields as BOB accepted at B7.
- R71 (entry 4, iterable part): every declared op is in the route map (door name or alias) or answered by a Worker arm or the plane's own doors; the ops of provenance, case-inputs, case-import, citation, monitoring, link-sweep and the store door (tasks, queue) answer through the door once each. Nothing needed spreading: all those maps were already spread (tasks and queue through store-door's map).
- Requirement lines R68 to R72 are written in build/requirements/plane.md (K4210); the ownership check lists that file, accepted. R69 and R70 are marked not yet met.

Waiting
- R69, R70 (entries 2, 3): `captureSourcesOps` and `investigationOps` are still not on tranche/T51 (tip 1cd462473b merged). Send a CHANGE when capture-sources and investigation are merged; I then spread them, add them to test/m/plane/maps.mjs, test them and re-run R71.

For BOB (modules.json, other modules)
1. architecture FAIL: plane/declarations.mjs imports `sources/index.mjs` (its DECLARED_OPS; sources is composed through store-door), and plane does not declare `sources` in uses. Please add the edge (earlier than plane). I keep the import; it is the only architecture failure.
2. `test/m/plane/release.test.mjs` R24 "a title or purpose a surface draws is the screen's own key" fails: `screen.bias.purpose` is not in docs/development/ux-substrate/screens/words.json (also so on the tranche, not caused by this job). The words list or the registry, not plane.
3. coverage fails in other modules only (agent-harness R17, agent-runner, citation R16 to R18, installer-steps, journey-check R19, link-sweep R13 to R15, monitoring R75 to R77).

Tests and checks: `node --test "test/m/plane/**/*.test.mjs"`: 235 tests, 230 pass, 5 fail at the first run; the 4 import-order failures (t42 to t45) fixed and re-run green (18, 6, 6, 14 pass); the fifth is item 2. New: declarations.test.mjs (6), declared-ops.test.mjs (3). format 0, words 0, ownership 0 failures (requirements file listed, accepted).
Size (session_01Wi1UPiyBRVvgj1bzVSUFVr): test runs 4, module lines 164 new (declarations 140, declared 16, register 8)

## Record: CHANGE B8, B9, B10 (K4213, K4219, K4221) · PLANE #44
- B8 (2): `store.mjs` spreads `captureSourcesOps(captureCredentialsOf(ctx), url, body)` and `investigationOps(investigationOf(ctx), url, body)` after capture-requests' map (R69, R70); `maps.mjs` lists both. B8 (3), B9 (b): `linkSweepOps` and `citationOps` are handed `body`. `t51.test.mjs`: R69 (the three credential ops once each, through the door as the owner's map answers, a machine credential refused each), R70 (`projectclose`, a non-owner's close refused by the owner's arm), the body hand-over (`sweepratify` answers for the sweep the body names; control: `{}` is the argument's refusal). All checked red without the change.
- B8 (1): `sources` is in plane's `uses`; B9 (a): case-import's ops (including the four new) are spread by `caseImportOps`; `accepted.test.mjs` reads them from the owner's map, nothing listed.
- B10: `registerCaseInputsPublicReads(ctx, {publicRead})` is called in `store.mjs` right after `caseAuthoringOf(ctx, …)`, not beside case-checker's: case-inputs' factory reads its deps on its first call and case-authoring's creation hands it its record, membership and clock, and `accepted.test.mjs` R17 pins case-inputs after case-import. `casedetailspublic` answers at `/publicread?name=casedetailspublic` (test; control: a second registration refused, an unknown name no read).
- R68: `declarations.mjs` imports the 22 modules that declare ops since the first job (member-roster, project-roster, credentials, provenance, capture-sources, file-safety, connections, inquiry, citation, run-productions, capture-requests, investigation, case-import, case-inputs, case-authoring, review, filings, monitoring, link-sweep, tasks, instance-setup (`setup.mjs`), store-door (`dispatch.mjs`)); `OWNERS` is in `modules.json` order. `t47` R45 reads case-inputs' ops from its map (no hand list); `notices` R2 expects case-inputs' public read beside case-checker's.

**For BOB (other modules and artifacts; none is plane's to change)**
1. The plane does not boot on `tranche/T51`: `register.mjs` stops at the first owner row that disagrees. Found by registering the owners one op at a time (nine ops, seven modules): citation `citeimported`, `withdrawimported` (op-declarations: NEEDS_MISSING); link-sweep `sweepset`, `sweepratify` (NEEDS_MISSING) and `sweeps` (op-grades: DECLARED_OP_BAD_WEIGHT, rung-on-read); ai-accounts `accountusesset` (description differs from op-grades' hand row, `t41.mjs`:126, "…switched by its owner…"); credentials `securitymap` (weight hand=caller-owned, owner=read); ratification `caseratify` (description differs from the hand row); store-door `groupdescriptiondraft` (DECLARED_OP_BAD_WEIGHT, rung-on-read). With those nine skipped (a local, uncommitted skip) the plane suite is 271 of 282.
2. `casedetailspublic` (case-inputs R24) is not routed: `control-plane/index.mjs`:97 `CASE_CHECKER_PUBLIC_READS` lists only case-checker's two, so `declarations.test.mjs` R71 ("every op an owner declares is reachable") names it. Add it to that list (or a case-inputs list beside it); the read answers at `op=publicread&name=casedetailspublic` today.
3. architecture: `plane/declarations.mjs` imports `member-roster/index.mjs` (its `DECLARED_OPS`), and `member-roster` is not in plane's `uses`: add the edge (as `sources` was).
4. ownership: `build/requirements/plane.md` (R68 to R72, K4210, written by the earlier job) is still listed as outside the paths; accepted as before. R69 and R70 are met by this job; their *(not yet met)* marks are BOB's to clear.
5. `release.test.mjs` R24 (`screen.bias.purpose` absent from words.json): the design's, accepted by name (B8 (4)).

**Tests and checks** (the nine ops skipped locally; workerd-run tests cannot take the skip and fail on the first row above: t42 R37, t46 R42, worker R6 ×2)
- `node --test "bio-plane/test/m/plane/*.test.mjs"`: tests 282, pass 271, fail 11: the three workerd files and R68 and R5 (`op=sweeps`) because of the skip, R71 (item 2), R24 (item 5).
- format 0 failures; coverage 72 of 72; words 0 failures; architecture 1 failure (item 3); ownership 1 failure (item 4).
- Size (session_01HpHBfhUsJDqQs6EQDqvKuj): test runs 14, module lines 150 new

## Record: CHANGE B11 (K4226) · PLANE #44
- (1) The queue's timing fields vary by run: every `mask` in the plane's tests (and `maps.mjs`' `servedThroughDoor`) now also masks `"ms"` and `"feeds_ms"` as `"<n>"`; the assertions are kept (the queue's answer is still compared whole). `door.test.mjs` R2, R5 (N13) and `t47.test.mjs` R45, R48 pass.
- (2) `door.mjs`: `gatedOp` takes `timings` (default null) and hands it to `captureOp` as `h.timings`. Deferred, with why: the end-to-end test (a timed-out `acquire` through the door answers the stages that ran) cannot be written green yet. `control-plane`'s part (R115: it creates `timings` and passes it to `gatedOp`) is on `job/T51/control-plane` only, not on `tranche/T51`; `capture/ops.mjs` (`acquireOp`) does not forward `h.timings` yet (CAPTURE #39), and `acquire` runs in the Store through `store.fetch`, so the hand-over from the arm to `acquisition`'s `opts.timings` is capture's design. Send a CHANGE when both are merged; I then add the test.
- Declarations: since B8 the ops of `action-holds` (`actionpressure`, `pressurerecord`: description differs from the hand row) also disagree and citation's two no longer do: nine ops in seven modules on this tranche tip (link-sweep `sweepset`, `sweepratify`, `sweeps`; ai-accounts `accountusesset`; credentials `securitymap`; ratification `caseratify`; action-holds `actionpressure`, `pressurerecord`; store-door `groupdescriptiondraft`).
- Suite with those nine skipped locally (uncommitted): tests 282, pass 271, fail 11 (the three workerd files, R68 and R5 `op=sweeps` because of the skip; R71 `casedetailspublic`, R24 as listed above). Size (session_01HpHBfhUsJDqQs6EQDqvKuj): test runs 20, module lines 160 new

## J8 · REPORT

REPORT (PLANE #44; B8 to B11): pushed on job/T51/plane; full detail in the record.
Applied: R69, R70 (capture-sources' and investigation's maps spread; tests checked red without); body to citation and link-sweep; case-inputs' public read registered at start (after case-authoring's creation, which keeps case-inputs after case-import); R68's assembly now imports the 22 modules that declare since; the queue's timing fields masked; `gatedOp` hands `timings` to captureOp.
Waiting on others (BOB):
1. The plane does not boot on tranche/T51: nine owner rows disagree with hand rows: link-sweep sweepset, sweepratify (NEEDS_MISSING), sweeps (rung-on-read); ai-accounts accountusesset, ratification caseratify, action-holds actionpressure and pressurerecord (descriptions); credentials securitymap (weight); store-door groupdescriptiondraft (rung-on-read). With them skipped locally the suite is 271 of 282; the 11 are explained in the record.
2. casedetailspublic is not routed: control-plane/index.mjs:97 CASE_CHECKER_PUBLIC_READS (R71 names it).
3. architecture: plane imports member-roster's DECLARED_OPS; add member-roster to plane's uses. ownership: build/requirements/plane.md (accepted as before); R69, R70 marks are yours to clear.
4. B11 (2) end-to-end test deferred: control-plane's R115 is only on its job branch and capture's acquireOp does not forward h.timings yet; send a CHANGE when both are merged.

## J9 · QUESTION

QUESTION (re B13; K4231): the timings cannot be carried on the answer, because on a timeout there is no answer, and the door's object cannot reach the object. Read from the code on the merged tranche:
- Worker side: `plane/door.mjs` `gatedOp` now hands `h.timings` to `captureOp` (capture/ops.mjs), but its `acquireOp` ignores it: it only does `store.fetch('http://x/acquire?…')`. Nothing there keeps or sends it.
- Object side: `plane/store.mjs`:765 calls `captureOps(captureOf(ctx), url, body, env)` with no `h`; capture's `acquire` arm would pass `h.timings` to `acquisition` (R95), which fills it as the stages run and puts `stageTimes` in the answer only when it ends. The object keeps running after the door's bound, so the object's times exist only inside the object.
Best reading, the smallest design that holds: (a) the route map passes a fresh `{timings}` into `captureOps` for `acquire` and keeps it in a small holder in the plane's Store keyed by the door's `trace` (already sent to the object as a query/body string, plane R55); (b) a new store-internal read `acquiretimings?trace=…` in the plane's route map answers `stageTimes` of the held object (undefined trace: none); (c) on its timeout the door (control-plane, R115) asks the object that read and answers `timings` from it, instead of from its own empty object; (d) capture's `acquireOp` must send `trace` with the `/acquire` request (capture). I build (a) and (b) with an in-process end-to-end test (a store whose acquire stalls, then the read answers the stages that ran); (c) and (d) are control-plane's and capture's, and the Worker-level proof waits for them. Alternatives: the object holds the timings in its answer to a later poll with no new op (not possible: nothing identifies the call). Please answer: (a)+(b) as above, or a different split.

## Record: CHANGE B13, ANSWER B14 (K4231, K4234) · PLANE #44
- New `plane/acquire-timings.mjs`: a holder per host (bounded at 64, each entry kept 60 s from its start, ended acquires included so a door that asks just after the end still reads them: a small departure from "dropped when the acquire ends", for that race), `acquireHandlerParts(host, url)` (the `h` for `captureOps`: `timings` is made when the `acquire` arm reads it, keyed by the request's `trace`; with no trace a fresh object is held nowhere) and `acquireTimingsOps` (`acquiretimings?trace=` answers `{ok, timings: stageTimes(...) | null}`).
- `store.mjs`: `acquiretimings` at acquisition's place (before capture's map, with the co-archive pair); `captureOps(..., acquireHandlerParts(ctx, url))`. `maps.mjs` lists the read in the `acquisition` entry (as the co-archive pair is), so R5 and R9 hold.
- Test `t51.test.mjs` R73: a stalled `acquire` (fetch held) through the route map, with `trace`, is read by `acquiretimings` while running (names the running stage) and after it ends (stages that ran, none running); controls: another trace, no trace, an unkeyed call, the bound. Red without the change (`acquiretimings` is an unknown op).
- For BOB: R73 is the id the test names; its requirement text (plane R73: the holder, the read, the bound and time to live) is yours to write. (c) control-plane #41 and (d) capture #40 are the remaining parts; the Worker-level proof follows them.
- Suite with the nine ops skipped locally: tests 283, pass 272, fail 11, the same eleven as before (accepted by name, B12). Size (session_01HpHBfhUsJDqQs6EQDqvKuj): test runs 26, module lines 210 new

## J10 · COMPLETE

COMPLETE (PLANE #44; B8 to B14): pushed on job/T51/plane; record in full.
B13/B14 built: `plane/acquire-timings.mjs` (bounded holder keyed by the door's trace, 64 entries, 60 s; `acquiretimings?trace=` read at acquisition's place in the route map; `acquire` is handed the held object); end-to-end test R73 in t51.test.mjs (stalled acquire read while running and after), red without the change. Departure: an ended acquire's entry stays until the time to live, so a late ask still reads it. R73's requirement text is BOB's to write (the test names R73). Remaining: (c) control-plane #41 asks the read on its timeout, (d) capture #40 sends trace with /acquire; the Worker-level proof follows.
Checks: format, architecture, coverage (72/72), words 0 failures; ownership as before.
Accepted reds (B12), 11 of 283 with the nine disagreeing owner rows skipped locally: t42 R37, t46 R42, worker R6 x2 (workerd), R68, R5 op=sweeps, R6 bootstrap (instance-setup R95), R71 (casedetailspublic, CONTROL-PLANE #41), R24 (design). After OP-GRADES #18 and LINK-SWEEP #5 merge I merge the tranche and re-run.

## Record: CHANGE B15 (K4236) · PLANE #44
- `door.mjs`: `gatedOp` hands the door's `trace` to `captureOp` beside `timings` (capture R99 sends it as `x-civicsmith-trace`).
- The object reads the header: `store-door`'s `HANDED` list names only its own headers, so `Store.fetch` (`store.mjs`) first calls `traceStamped` (`acquire-timings.mjs`): for a POST `acquire` it sets the in-process `trace` parameter from the header (printable, at most 200 characters) and removes any `trace` a caller put in the address, so the key is the door's alone. (A header handed on by store-door itself would be tidier: for BOB if wanted, store-door's R9 list.)
- `acquiretimings` answers `{ok: true, stageTimes}` (null when none is held), the shape control-plane R115 reads.
- `t51.test.mjs` R73 now runs the whole hop: `gatedOp` (door, with `trace`) -> capture's header -> the Store (held fetch) -> `acquiretimings` while running (names the running stage) and after (stages that ran); controls: another trace, none, an address trace, an unkeyed call, the bound.
- Suite with the seven still-disagreeing owner rows skipped locally: tests 283, pass 272, fail 11, the accepted eleven. Size (session_01HpHBfhUsJDqQs6EQDqvKuj): test runs 29, module lines 240 new

## J11 · COMPLETE

COMPLETE (PLANE #44; B15): pushed. `gatedOp` hands `trace` to captureOp; the object reads capture's header `x-civicsmith-trace` (Store.fetch sets the in-process `trace` for a POST acquire and strips a caller's own, because store-door's HANDED list does not carry it: you may prefer store-door to hand it on); `acquiretimings` answers {ok, stageTimes}. R73's test runs the whole hop (door -> header -> object's timings under the trace -> read, while running and after). Checks: format, architecture, coverage 0 failures. Suite (seven owner rows still disagreeing skipped locally): 272 of 283, the accepted eleven. R73's requirement text is yours to write.

## Record: CHANGE B16 (K4254) · PLANE #45
- (3) R68: `declarations.mjs` imports and lists `wizard-scripts`, `queue` and `control-plane` (`owner-ops.mjs`), in `modules.json` order. `declarations.test.mjs` R68 passes.
- (4) R71: the test now counts as reachable an op the control-plane door's own map serves (`OWNERS["control-plane"]`: `subscriptionsignin`) and a public read a module registered at start (`publicReadOf(ctx).publicReads()`: `casedetailspublic`; t51 R17 asks it). The two had a route, the door's own, which the test did not know. R71 passes.
- (2) R5: `sweep.test.mjs` expects link-sweep's map to hold `sweeps`, `sweepset`, `sweepratify` and finds monitoring's last op from `monitoringOps` (monitoring has more ops after `addressfrequencyset`). The route map already spread the whole map. Passes.
- (1) R24, not plane's: `screen.contradiction.purpose` is absent from `docs/development/ux-substrate/screens/words.json`. The registry (wizard-scripts, generated from the design) holds the screen's purpose; the design's `build_words.mjs` writes `screen.<id>.purpose` from `SCREEN_HELP` in `mock-refs.js`, which has no `contradiction` entry. The design's to add. The test stays unchanged and red until then.
- Suite: `node --test bio-plane/test/m/plane/`: 280 tests, 279 pass, 1 fail (R24 above). t46-e2e and t47-e2e: 7 of 7 pass. The plane boots on the tranche tip.
- Checks: format 0 failures; architecture 0; coverage 73 of 73; ownership 0.
- For BOB (requirement lines): R68 names `wizard-scripts`, `queue` and `control-plane` among the owners assembled. R71: an op reached through the control-plane door's own map or registered as a public read counts as reachable. R73's text is still yours to write (earlier entry).
- Size (session_01CLRkcMHppRTA6yFfn5t1Zg): test runs 8, module lines 8 new (declarations 6; tests 4 changed lines)

## J12 · COMPLETE

COMPLETE (PLANE #45; B16): R68, R71, R5 fixed; R24 is the design's. Details in the record. (3) R68: declarations.mjs assembles wizard-scripts, queue, control-plane. (4) R71: test counts the control-plane door's own ops (subscriptionsignin) and registered public reads (casedetailspublic) as reachable; both were routed. (2) R5: test expects sweeps, sweepset, sweepratify. (1) R24: screen.contradiction.purpose is missing in the design's words.json (SCREEN_HELP in mock-refs.js has no contradiction entry); the design's to add; test unchanged, red. Suite 279 of 280 (only R24); t46-e2e, t47-e2e 7 of 7. Checks: format, architecture, coverage 73/73, ownership 0 failures. Requirement lines: R68 lists wizard-scripts, queue, control-plane among assembled owners; R71 counts door-own ops and public reads as reachable. R73 text still yours.

## J13 · COMPLETE · re B17

## Record: CHANGE B17 (K4262) · PLANE #46

- (B17) `record-core` is added to `plane/declarations.mjs`: a static import of `DECLARED_OPS` beside the others, and an `OWNERS` entry in `build/modules.json` order (after `member-roster`). Two lines of module code (`c23360679f`).
- The `allocid` row (record-core R85) is accepted by both hand registrations (`op-declarations`, `op-grades`), checked alone in a process of its own.
- R68 test (`declarations.test.mjs`): the plane's start is refused at import by `DECLARED_OP_DISAGREES: groupdescriptiondraft description` (op-grades), the accepted red by name (K4258, until OP-GRADES #22 merges). That refusal names no other op, so the test cannot reach its assertions yet. The whole plane suite is held by the same refusal until OP-GRADES #22 merges; then re-run `node --test bio-plane/test/m/plane/`.
- Checks (`checks/run.mjs /home/user/bio`): format 0 failures; architecture 0 failures; ownership 0 failures (1 file, `bio-plane/src/plane/declarations.mjs`). Coverage and words show failures in other modules only (below).
- Deferred: none.
- Node modules installed where missing (K4113): `agent-runner`, `bio-plane/src/journey-check`, `file-scanner`, `sheet-worker`, `site`.

**Found in other modules (for BOB)**
- Coverage: live ids named by no test: `agent-harness` R17; `agent-runner` R37, R38, R40; `installer-steps` R26, R31; `journey-check` R19; `screens-inquiry` R110, R119; `screens-intake` R53.
- Words: `testcopy` at `bio-plane/test/m/op-grades/t37.test.mjs:32` (`translation-directed`, op-grades).

**For BOB (requirement line)**: R68 now names `record-core` among the assembled owners (T51, B17). The R68 test's assertions wait on OP-GRADES #22.

Size (session_019i2asULg4gBbzGXKQyLGgG): test runs 4, module lines 2
