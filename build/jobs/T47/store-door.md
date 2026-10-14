# store-door (T47)

**Status** · session_01A3oWKBscqhfz9cPoUE7bde · depth 2 · WORKING · handled B6

## Completion (T47-55)

**Read whole** (P20; mechanics §6 step 2; B1): `build/requirements/store-door.md`; all of `bio-plane/src/store-door/` (`dispatch.mjs`, `pull.mjs`, `step.mjs`) and `bio-plane/test/m/store-door/` (all seven files); my entry T47-55. **How the set was read** (B1: 1275 KB, over the 600 KB limit, mechanics §3, §17): my requirements, code and tests whole; of the used modules only what R14 names, read at the source: `basis-versions` R50 (`projectQuestionsFor` and its route), `plan-work` R14 (`statusReportAssist`, `statusReportDraft` and their routes), `project-roster` R26 (`projectlist`), and `membership`'s `sight`, `visibilityOf` (R85), `existenceAct` and `projectVisibilitySet`. No helper digest was needed: no later L11 job uses a service this entry changes (only the two tables change, and only store-door and control-plane tests read them). The drafts the START names hold nothing on store-door beyond R14 (searched for `store-door`, `statusreportassist`, `projectquestions`, N970). No entry names built work on the snapshot branch. No flaw found in my own code or tests.

**Entries applied.**
- (N970) R14: `PROJECT_NAMING_READS` gains `statusreportassist: ["plan"]`, the same row as `statusreportdraft`'s. `PROJECT_NAMING_READS_NOT` gains `projectquestions` (its reason: `project` names a project, and one the viewer does not see at FULL is answered an empty page, basis-versions R50, never refused, so no existence answer is given) and `projectlist` (names nothing: `limit` is a count; it lists the projects the viewer sees at FULL, project-roster R26). Declaring `projectlist` in the second table puts R2's "listed with the reason" on it too.

**Deferred.** None.

**For BOB (R14's wording, no change to what is built).** R14 says "a discoverable plan's project seen only at EXISTENCE is answered by `membership.existenceAct` first". The door asks `existenceAct` only when the `plan` value is itself a discoverable project's id (`visibilityOf` reads `project_sight`, which holds projects only). So a real `PLN-` id in such a project goes through to plan-work, which answers `NO_SUCH_PLAN` (its R14: "a plan the viewer may not see"), for `statusreportassist` and `statusreportdraft` alike. That is how every `plan` row has worked since T45-50 (K2891). I built R14 as "held as `statusreportdraft` is", which the requirement says, and tested C-70.1 with the project's own id in `plan`. If the intent is C-70.1 for a plan inside a discoverable project, that is a new door mechanism (resolving a record object to its project) and a requirement change, not this entry.

**Found in other modules.** None new. Inherited red, not mine: `control-plane/r45-routes.test.mjs` ("whatchangedpropose is a route of its owner's map") fails identically with and without this change; re-pointing it is control-plane's T47-65.

**Tests and checks.**
- `node --test bio-plane/test/m/store-door/`: tests 46, pass 46, fail 0. New: one R14 test in `dispatch.test.mjs` (door with a stand-in membership: query and body, controls for FULL and hidden, `statusreportdraft` answered alike; over a real record: a discoverable project vera sees only at EXISTENCE, where `projectquestions` answers its empty page through basis-versions' own route, `statusreportassist` and `statusreportdraft` answer membership's C-70.1, and the control `basisversions` answers the same). Without the code change the R14 test fails (checked). R2's sweep tests cover the new rows too. Layer tests: none named in `build/manifest.md`.
- Tests of the tables' readers (P11): `control-plane` `r48-routes`, `doorbell`, `r45-routes`, `routes`, `r49-routes`: 35 tests, 34 pass, 1 fail (the inherited red above).
- `node checks/format.mjs`: 168 modules, 167 requirements files; 0 failures. `architecture.mjs … store-door`: 10 product files; 0 failures. `coverage.mjs … store-door`: 14 of 14 live ids named by a test; 0 failures. `ownership.mjs … store-door tranche/T47`: 3 files; 0 failures. `checks/run.mjs`: architecture 0 failures; coverage's 25 failures are other L11 modules' new ids, none store-door's.

Size (session_01A3oWKBscqhfz9cPoUE7bde): test runs 5, module lines 87

## J1 · COMPLETE

T47-55 applied: R14 met (statusreportassist ['plan'] as statusreportdraft; projectquestions and projectlist in PROJECT_NAMING_READS_NOT with reasons). store-door 46/46; format, architecture, coverage (14/14), ownership 0 failures; run.mjs architecture 0. One note on R14's wording in the record ('For BOB'): the door answers C-70.1 only when `plan` is itself a discoverable project's id; a real PLN- id goes through to plan-work's NO_SUCH_PLAN, as for every plan row since K2891. Built and tested as 'held as statusreportdraft is'. Inherited red, not mine: control-plane r45-routes (T47-65). Record: build/jobs/T47/store-door.md on job/T47/store-door.

## Completion of B2 · CHANGE (K3143, R15)

**Merged** `tranche/T47` (3b140b3cd1). **Read whole:** R15 in `build/requirements/store-door.md`; `credentials`' `reauthDue`, `session`, `reauth` and `login` at the source, and its R71; `admission` R25.

**Applied.** R15: `controlPlaneRoutes` gains the store-internal route `reauthdue`. Its token is `q("session")`, the `x-bio-session` header R9 already hands on. A token naming no live session (`credentials.session(token, {background: true})` null: absent, unknown, ended) answers `{due: false}`. Otherwise it answers `{due: credentials.reauthDue({token}) ?? false}`: `due` is credentials' own `REAUTH_DUE` refusal as given, for admission's gate to relay, or `false` while the window is open. A locked session is live but answers due, as credentials R71 (2) says. The session is read with `background: true`, so asking is no activity and writes nothing.

**Reading taken (for BOB).** R15's `{due}` is read as "false, or credentials' REAUTH_DUE row as given", not a bare boolean, so admission R25's gate can relay credentials' refusal (`answer-envelope` relays a row; it mints none). If admission wants a bare `true`, change one line: `!!C.reauthDue(...)`.

**Tests.** One new R15 test in `routes.test.mjs` over a real record: a fresh sign-in is due (the row deep-equal to `reauthDue`'s, C-29.42); after `reauth` it is false (control); a lapsed window is due again; absent, empty, unknown and signed-out tokens answer `{due: false}`; the header's token is read over a query's; the sessions table is unchanged by asking. R1's route-set test names `reauthdue`. Without the route, both tests fail (checked).
- `node --test bio-plane/test/m/store-door/`: tests 47, pass 47, fail 0.
- Readers of this map and its tables: control-plane and plane tests that import them (64 tests, 63 pass, the one inherited `r45-routes` red); `credentials` and control-plane tests naming `subscriptionconnected` (56/56). `test/m/plane/` and `test/m/op-declarations/`: 18 failing tests, the identical 18 with and without this change (inherited: registry and declaration re-points owed by their L11 jobs), none mine.
- `format.mjs`: 0 failures; `architecture.mjs … store-door`: 0 failures; `coverage.mjs … store-door`: 15 of 15; `ownership.mjs` below, after the commit.

Size (session_01A3oWKBscqhfz9cPoUE7bde): test runs 13, module lines 152

## J2 · COMPLETE

B2 (K3143) applied: R15 met. `reauthdue` answers {due: false} for a token naming no live session; else {due: credentials.reauthDue({token}) ?? false}, so due is credentials' REAUTH_DUE row as given (for admission R25 to relay) or false inside the window; the session read is background (no activity, nothing written). Reading taken: due is 'false or the row', not a bare boolean; one line to change if admission wants true. store-door 47/47; format, architecture, coverage (15/15), ownership 0 failures. Inherited reds unchanged by this (identical 18 in plane/op-declarations, control-plane r45-routes). Record updated on job/T47/store-door.

## B3 · CHANGE (K3148)

Merged `tranche/T47` (744774efeb: wizard-scripts T47-47, op-grades T47-48) and re-ran: `node --test bio-plane/test/m/store-door/`: tests 47, pass 47, fail 0. format, architecture (store-door), coverage (15 of 15), ownership (4 files): 0 failures each. No change to the module was needed.

## J4 · COMPLETE

B3 (K3148): tranche/T47 merged (744774efeb, wizard-scripts and op-grades); store-door 47/47; format, architecture, coverage 15/15, ownership 0 failures. No module change needed.

## B4 · CHANGE (K3149)

Merged `tranche/T47` (d2d7a2222c: setup-words T47-52, instance-setup T47-75, after wizard-scripts and op-grades) and re-ran: `node --test bio-plane/test/m/store-door/`: tests 47, pass 47, fail 0 (R10's drafts over instance-setup's own handlers included). format, architecture (store-door), coverage (15 of 15), ownership (4 files): 0 failures each. No change to the module was needed.

## J5 · COMPLETE

B4 (K3149): tranche/T47 merged (d2d7a2222c, setup-words and instance-setup); store-door 47/47 (R10 over instance-setup's handlers included); format, architecture, coverage 15/15, ownership 0 failures. No module change needed.

## B5 · CHANGE (K3152)

Merged `tranche/T47` (1524778995: wizard-scripts, op-grades, setup-words, instance-setup, notice-producers, installer, project-roster, affordances, tasks, op-declarations, admission).

**R15 corrected against admission as merged.** Admission R25's reader (`admission/index.mjs` `reauthDuePresented`) takes `due: null` as the window open, credentials' `REAUTH_DUE` row as the refusal, and anything else, `false` included, as a silence, which refuses. My B2 reading answered `false` inside the window, so admission would have refused every re-ask act with its window open. Now `due` is `reauthDue`'s own answer, null or the row, and `{due: false}` is kept only for a token naming no session, as R15 says (admission's gate refuses that through its own session read before asking). The B2 "reading taken" note is withdrawn. The test asserts `{due: null}` inside the window and that it equals `reauthDue`'s answer.

**Runs.** `node --test bio-plane/test/m/store-door/`: tests 47, pass 47, fail 0. `test/m/admission/`: 46 pass, 2 fail (R12 `adminendorse`, R19 `groupkeyset`), the same 2 with and without this change. Admission's tests stub the store (`harness.mjs`), so they are not about store-door; reported. format, architecture (store-door), coverage (15 of 15), ownership: 0 failures.

Size (session_01A3oWKBscqhfz9cPoUE7bde): test runs 21, module lines 153

## J6 · COMPLETE

B5 (K3152): tranche/T47 merged (1524778995). Fixed R15 against admission as merged: admission R25 reads due null as the window open and anything but null or the REAUTH_DUE row as a silence (refusal); my B2 answered false inside the window, which would have refused every re-ask act. Now due is reauthDue's own answer (null or the row); {due: false} only for a token naming no session, as R15 says. My B2 'reading taken' is withdrawn. store-door 47/47; format, architecture, coverage 15/15, ownership 0 failures. Admission's own tests: 2 fail (R12 adminendorse, R19 groupkeyset), identical with and without store-door's change, as they stub the store; for admission's owner.

## B6 · CHANGE (K3161)

Merged `tranche/T47` (5c00b0b015: queue, R53) and re-ran: `node --test bio-plane/test/m/store-door/`: tests 47, pass 47, fail 0 (queue's map, dispatched through `controlPlaneRoutes`, included). format, architecture (store-door), coverage (15 of 15), ownership (4 files): 0 failures each. No change to the module was needed.

## J7 · COMPLETE

B6 (K3161): tranche/T47 merged (5c00b0b015, queue); store-door 47/47; format, architecture, coverage 15/15, ownership 0 failures. No module change needed.

## B7 · CHANGE (K3164)

Merged `tranche/T47` (81a72fb3a1: answer-envelope R6, R14–R16) and re-ran: `node --test bio-plane/test/m/store-door/`: tests 47, pass 47, fail 0 (R4's and R6's rows read from `DISPATCH_CHECKS`, unchanged by C-69.6's retirement). format, architecture (store-door), coverage (15 of 15), ownership (4 files): 0 failures each. No change to the module was needed.
