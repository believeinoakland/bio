# store-door (T47)

**Status** · session_01A3oWKBscqhfz9cPoUE7bde · depth 2 · COMPLETE · handled B1

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
