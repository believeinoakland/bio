# question-explorer (T41)

**Status** · session_01243u4joqb8ZpywX663LU1U · depth 2 · WORKING · handled B7

## J1 · QUESTION

Readings I am building on now (carrying on; none stops the job). Answer any you would change.

1. **The run's work.** The model work of an exploring run is `agent-worker`'s (layer 6, after me). This module chooses (R1, R2), opens the run through `ai-runs` (R3: mode `investigate`, `origin: "explore"`, `step`, use `explore`, principal the paying owner, label `ai-use` R6's) after `steps.stepCreate` as a system step, and holds the in-process acts the run's work goes through: a look aimed at an entity (R9, R10 gate, refusals recorded on the run here), a find with its bearing (R4: the run's work supplies `{bearing, how}`; this module validates it and attaches `false_alarm_rate` and `gold_set` from the gate's `ai-runs` R75 record, `label: "machine"`, `enabled_by`; it never computes a bearing itself and stores no score), a capture request (R3, through `capture-requests` with `step`), a read inside a document (R13: refused for a document under a "no AI" limit for `read`/`explore`, else handed to `run-productions` R21 with the step), and the stop (R8, through `steps` R5 and `ai-runs` close). The live basis a find is gauged against is the question's CURRENT basis version (`basis-versions`), recorded on the find by name.
2. **Owners per question (R1).** For each worth-exploring question: `group`, each project drawing on it (`leg-earning` R13), and each member among its find recipients (`steps` R17); `ai-use.exploreAllowed` decides each pair. At most one exploring run per question a day.
3. **R2's "gained a capture whose resolved entities include its subject entity".** Read through `entities`' R35 read contract (`resolutions`): the count of distinct captures resolving to the subject entity, compared with the count recorded at the question's last exploring run. This adds `entities` (layer 5, earlier) to my `uses`.
4. **R9's "tied by a member".** A person entity (`entities` R35 `kind = 'person'`) is tied when it is the question's `subject_entity` and the question was `surfaced_by: human`, or when a member-asserted connection (`connections` R53) joins the question to a document resolving to that person. A machine-surfaced question whose subject is a person no member tied is never chosen (R2).
5. **R6's doors.** Dismiss within a project is `queue` R27's (layer 11); here: `findMute` (a follower outside every drawing project) and `findAccept({find, question, form, edit?, by})`, which records `record-grammar.acceptanceRecord` and answers the leg her own promotion would carry (writing no leg); "hold a hypothesis" and "start a step" are answered as routes (`hypotheses`, `steps.stepCreate`), not acts here.
6. **R7's gate part name** is `explore` in `ai-runs` R75's `part`, and `run-rules` R19's `deployable("investigate", …)`. R11 relays `ai-runs.groupTestResults({part: "explore", viewer})`.
7. **Not yet built providers** (`steps`, `ai-use`, and the T41 services of `ai-runs`, `run-rules`, `capture-requests`, `run-productions`, `credentials`): taken through the factory's `deps` only, never imported, until each merges and a CHANGE reaches me; my tests drive stand-ins written to their requirements (K61, K120).

## Completion (QUESTION-EXPLORER #1)

**Reading set** (mechanics §17). START measured 473 KB, an over-estimate (each used module's whole public part). Read as §3 and the START ask, whole, myself: my requirements (7.5 KB); layer 6's row and the "Layers 6 and 7" section of `build/layers.md`; my plan entry T41-28 and K1043, K2425, K2448, K2472; each used module's Purpose (17, about 8 KB); and the services my Uses names: `steps` and `ai-use` public parts whole, `run-rules` and `run-productions` public parts whole, `leg-earning` public part whole, `ai-runs` public part whole, `capture-requests` R1–R10, R23–R29, R41–R55, `credentials` R32, R35, R43, R54–R57, R60, `inquiry` R43, R59–R61, `record-grammar` R42, R52, `connections` Purpose and R53–R59, `retrieval` R23–R24, `entities` R35 (with its Terms), `content` R45, `basis-versions` R37 and its conclusion reads' heading. About 140 KB, under 300 KB: no worker, no summary. Code read whole for the module's conventions: `run-productions` `index.mjs`, `schema.mjs` and its test `fixture.mjs`. Provider code was also consulted in excerpts (not whole) to confirm call shapes already stated in their requirements: `membership` `viewerPredicate`/`inSight`/`sight`/participants, `credentials` `accountUses` and its switches, `leg-earning` R13/R14 and its factory, `ai-runs` `#dayOf` and its factory, `run-rules` `checkConsume`; I name it here as a departure from "read whole" (nothing I built rests on an excerpt beyond a signature its requirement states).

**Entries applied (T41-28): R1–R14, all**, on J1's seven readings, all taken by BOB (B2, K2482).
- R1 `exploreDue`, `exploreWake`, `exploreTick`; owners per question as reading 2; `{ask: true}` gathers one `exploreAsk` per owner per tick with the questions and `estimate` (R12); a pending Ask is looked at again after an hour; at most one run a question a day.
- R2 `questionsWorthExploring` (in-process): open or surfaced, a recipient (`steps.findRecipients`), never explored or `entities` R35 resolutions of the subject grown since the last run's count; at most 200 read a tick, least recently explored first; R9 applied first.
- R3 the run path: `steps.stepCreate` (system doer, the run's id, `enabled_by`), then `ai-runs.open` (`investigate`, `origin: "explore"`, use `explore`, `step`, `principalClaude` the owner, `enabledBy` the label, bounds `fetches`, `wallclock`, `pages`); a refused open deletes its untouched step. Sight: group = bundles outside every project; member = hers; project = any joined participant's. The sign-in arm (N796, K2425) is tested on the real `credentials`: off by default refused before `ai-use` is asked, on by her own act opens. Capture only through `capture-requests` with `step`; `CAPTURE_REQUEST_ADDRESS_NOT_HELD` names the page to the members as a `page` find.
- R4 `find`: capture (`retrieval.contentAxis`), content (`content` R45), connection (`connections.read`); bearing one of three with an account of how; answered `{bearing, how, false_alarm_rate, gold_set, label: "machine", enabled_by}` and `against` (each drawing project's CURRENT, `basis-versions.currentOf`, and the projected legs count, `leg-earning.basisFor`); tied by `steps.recordProduct`; no score column.
- R5, R7, R14 `findsFor`: gate open only; recipients who may see the question and the find's documents; key `explore-find:<find>:<question>`; `enabled_by` only to the paying account's owners; newest first then by id, the same item whatever the bearing.
- R6 `findDoors`, `findAccept` (`acceptanceRecord`, the leg her own promotion carries, writes none), `findMute` (outside every drawing project; inside, `EXPLORE_MUTE_IN_PROJECT`, the queue's).
- R7 `gate()`: the test bar record for part `explore` passed, false-alarm rate recorded and at most 20%, and `deployable` for `investigate` and `explore`; anything absent or unreadable shuts it.
- R8 `end`, `stopsFor` (owners of the enabling account only); R9, R10 `look`, `refusalsOn`, `EXPLORE_PERSON_CAP` 20; R11 `groupTestResults` relayed to active members, never read by the gate; R12 `runCost` (estimate and `ai-runs` R76's actual from `close`, owners only); R13 `read` (a few pages at a time, the `pages` bound through `boundOf`/`consumeBound`, refused under `credentials.aiKeptAway` for `read` or `explore`, group or the document's project).
- Rows: family C-145 (K2482), C-145.1–C-145.11 in `checks.mjs`.

**Paths and tests** (for `modules.json`, K1043): `paths` `bio-plane/src/question-explorer/` (`index.mjs`, `checks.mjs`, `schema.mjs`); `tests` `bio-plane/test/m/question-explorer/` (`fixture.mjs`, `choosing.test.mjs`, `runs.test.mjs`, `finds.test.mjs`, `module.test.mjs`).

**Final `uses`:** record-grammar, civil-time, record-core, membership, credentials, content, entities, connections, retrieval, leg-earning, inquiry, basis-versions, steps, run-rules, ai-use, ai-runs, run-productions, capture-requests. Against `modules.json` today: `entities` added (K2482) and `content` added (R4 reads its R45 read contract for a passage find); `contradiction` dropped (nothing here uses it).

**CHANGE B3 (K2485) applied:** tranche merged; the tests drive the real `leg-earning` (R13 `projectsDrawingOnPaged` over `refs`, R4 `basisFor`, R12 `writeBasis` in a test); `projectsShownOn` (R14) is not called: no requirement of mine shows projects to a member (a find names none, R5).

**Awaiting CHANGE (built against requirements; stand-ins in the tests; fail closed when absent):** `steps` (R1, R5, R6, R9, R17), `ai-use` (R6, R9, R10), `ai-runs` T41 (`open`'s `step`/`origin`/`use`/`enabledBy`, R75's record read here as `testBarOf({part})` and `verifications()`, `groupTestResults`, R76's actual on `close`), `run-rules` R19's `deployable`, `capture-requests` R55's `step`. Each read is by its requirement's name; a name that lands differently is a one-line change at its CHANGE.

**Deferred:** none.

**Found in another module:** J2 (REPORT) below: `steps` R1 and `ai-runs` R73 seam.

**Tests and checks.**
- `node --test bio-plane/test/m/question-explorer/*.test.mjs`: tests 26, pass 26, fail 0. Each R1–R14 named, each test with a negative control (K874). Mutation checks, each reverted: the cap at 21 (2 fail), the false-alarm bar at 30% (1 fail), finds ordered by bearing (1 fail), the sign-in switch ignored (1 fail).
- Layer tests: none named in `build/manifest.md`. No service of mine has users yet.
- In a local copy with my `paths`, `tests` and `entities` filled into `modules.json` (not committed): `format` 0 failures; `architecture … question-explorer` 8 product files, 31 relative imports, 0 failures; `coverage … question-explorer` 14 of 14, 0 failures; `ownership … origin/tranche/T41` 10 files, 1 failure, `build/modules.json` (that local edit, K1043's form). On this branch as committed, ownership lists my 8 files outside empty `paths`/`tests` until BOB fills them.

Size (session_01243u4joqb8ZpywX663LU1U): test runs 16, module lines 1022

## J2 · REPORT

A seam between steps (STEPS #1) and ai-runs (AI-RUNS #14), measured against their requirements: steps R1 lets a machine credential create a step 'only for a run it holds', and ai-runs R73 opens a run 'with step', so the step must exist before the run it is for. question-explorer mints the run id, calls steps.stepCreate({place, work, by, run, enabled_by}) naming that not-yet-opened run, then ai-runs.open({run, step, origin: 'explore', ...}), and deletes the untouched step (steps R6) when the open is refused. steps R1 should accept a run id its caller is about to open (or check the run at ai-runs' open instead); ai-runs R74's openMany has the same order. Nothing to change in question-explorer.

## J3 · COMPLETE

T41-28 done: R1–R14 built and tested (26/26, each R named with a negative control); checks format, architecture, coverage 0 in a copy with my paths filled; ownership only K1043's modules.json line. B2 (C-145, entities) and B3 (real leg-earning R13) applied. Paths, tests and final uses (adds entities and content, drops contradiction) in my record's Completion. Awaiting CHANGEs for steps, ai-use, ai-runs T41, run-rules R19 and capture-requests R55. J2 reports the steps R1 / ai-runs R73 seam.

## B4, B5 applied (QUESTION-EXPLORER #1)

- **B4 (K2489), run-rules merged.** The gate (R7) is `run-rules`' own computation: `partDeployableOn(set, "investigate", held)` and `partDeployableOn(set, "explore", held)` over `held = {verifications, testBars}`, the set `CIVICSMITH_TEST_SET` by default; the false-alarm rate and gold set are taken from the record that holds the bar (`checkTestBarRecord`, part `explore`, passed, the set's id and current version), at most 20%. `held` is read from `ai-runs` as `verifications()` and `testBars()` until it merges (fail closed). `EXPLORE_ORIGIN` is `RUN_ORIGINS`' `explore`; the `pages` bound is `RUN_BOUNDS`' key. A read under a "no AI" limit on `read` (the group's, or the document's project's through `projectsKeptAway`) is refused by `run-rules`' `checkPagesRead` (`AI_RUN_READ_NO_AI`), the one site; C-145.7 `EXPLORE_READ_KEPT_AWAY` stays for a limit on `explore`. `DRAFT_KINDS` and `ENQUIRE_MODE` are not read here: no requirement of mine names them. Since Civicsmith's set holds no matter yet, the gate stays shut over it (tested); the tests use a one-matter set.
- **B5 (K2490), the step.** This module creates no step: it passes `place` and `work` to `ai-runs.open`, which opens the run, creates the system step and answers it; an open that answers no step opens nothing here. It no longer calls `steps.stepCreate`, `stepDelete`, `stepEnd` or `recordProduct`: `ai-runs` ends the step at its close (R73), handed `stepEnd` and `reason` beside `bound` and `condition`; `recordProduct` is not a door `steps` R9 names for this module, so a find stays tied to its step through its run. `steps` is now used for `findRecipients` only.
- **Tests:** 26, pass 26, fail 0 (R3, R4, R7, R11, R13 re-stated; new negative controls: an open answering no step, an earlier set version, investigate's chain unverified, Civicsmith's empty set, a project's `read` limit).
- **Checks** (local copy with paths, `entities` and `content` filled, `contradiction` dropped): format 0; architecture 8 files, 33 imports, 0; coverage 14 of 14; ownership 1, K1043's `modules.json` line.

Size (session_01243u4joqb8ZpywX663LU1U): test runs 19, module lines 1029

## J4 · COMPLETE

B4 (run-rules: partDeployableOn gate, RUN_ORIGINS, pages, checkPagesRead) and B5 (ai-runs creates the step; I pass place and work, call no steps act but findRecipients) applied; 26/26; checks 0 but K1043's modules.json line. Details in my record.

## B6 applied (QUESTION-EXPLORER #1)

- **B6 (K2491), steps merged.** Tranche merged. The factory reaches the real `steps` through `stepsOf(host, {record, membership})` (an import now, `steps` earlier in layer 6); the tests drive the real `steps` (R17 `findRecipients` over the real `leg-earning`'s drawing projects and its own follows, R16 `questionFollow` making the followers), its promotion and observation-log registrations answered by stand-ins. Fixed with it: `findRecipients`' `next` is `{after}`, read so here (it was read as a bare cursor). Only `ai-use` remains through `deps` alone.
- **Uses edge:** `steps` is in my final `uses` (already in `modules.json`): final `uses` record-grammar, civil-time, record-core, membership, credentials, content, entities, connections, retrieval, leg-earning, inquiry, steps, basis-versions, run-rules, ai-use, ai-runs, run-productions, capture-requests (`contradiction` dropped).
- **Tests:** 26, pass 26, fail 0. **Checks** (local copy with paths and those uses): format 0; architecture 8 files, 35 imports, 0; coverage 14 of 14; ownership 1, K1043's `modules.json` line.

Size (session_01243u4joqb8ZpywX663LU1U): test runs 23, module lines 1031

## J5 · COMPLETE

B6 applied: real steps via stepsOf (factory and tests; findRecipients' {after} cursor read correctly); steps in final uses; 26/26; checks 0 but K1043's modules.json line. Record updated.

## B7 applied (QUESTION-EXPLORER #1)

- **B7 (K2488), ai-use merged.** Tranche merged. The factory reaches the real `ai-use` (`aiUseOf`); the tests drive it over the real `credentials` (switches, keys, keep-aways), with `zone` handed in. Brought in line with its answers: `exploreAllowed` answers `{ok, ask: false, label}` when allowed (read as allowed, its `label` attached); `exploreAsk`'s `what` is the list of questions (ai-use attaches R10's estimate to the Ask item it answers the owners, `exploreAsksPending`; tested); `estimate` is asked as the account's owner (the member, a project's first owner, the group's first active administrator, as ai-use reads an account itself) and its `estimate` kept, `"not known yet"` until ai-use has measured runs.
- **What changed in what is tested:** a member's own account is never in exploring's scope (ai-use R6, D36), so R3's member-sight arm is no longer reached by a run (the arm stays, untested by a run); R3's sign-in test now uses a project whose account is its sole member's sign-in (credentials R54), off by default and refused, on by the owner's own act and opened; her own sign-in at `no` is refused here before ai-use is asked.
- **Tests:** 26, pass 26, fail 0. **Checks** (local copy with paths and final uses filled): format 0; architecture 8 files, 37 imports, 0; coverage 14 of 14; ownership 1, K1043's `modules.json` line.
- Still through `deps` names only: `ai-runs` T41 (`open`'s `place`/`work`/`origin`/`use`, `verifications()`, `testBars()`, `groupTestResults`, `close`'s actual), `capture-requests` R55's `step`. I merge after ai-runs, run-productions and capture-requests, each reaching me by CHANGE.

Size (session_01243u4joqb8ZpywX663LU1U): test runs 31, module lines 1049

## J6 · COMPLETE

B7 applied: real ai-use (exploreAllowed's {ok, ask, label}, exploreAsk's what as the question list, estimate read as the account's owner); a member's own account is out of exploring's scope in ai-use, so R3's sign-in test runs through a project's sole-member sign-in account. 26/26; checks 0 but K1043's modules.json line. Record updated.
