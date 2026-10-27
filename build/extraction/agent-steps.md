# agent-worker → agent-steps — split map (N1205, N1218)

**Status** · Draft by a planning worker for BOB (T51 planning; entries T51-45 and T51-65). Not yet reviewed. N1205, N1218; K617, K624, K3717, K3809 (3), K3850.

**Why.** `agent-worker/src` is 4,421 lines after T50-65 (4,465 with `scripts/build.mjs`), past K617's ~4,000. Nearly all of it that is not a route is `index.mjs` (2,362): the segment driver, `performStep` and the sub-sessions are 1,490 of those lines. The split is for P6 only: no assistant work (K3717), no change of any requirement's meaning. It is done in T51 by copy, then delete (K624): T51-45 builds `agent-steps` and merges early, T51-65 deletes `agent-worker`'s copy and delegates.

**Read whole:** `requirements/agent-worker.md`, `requirements/README.md`, `plan/next.md` N1205 and N1218, K617, K624, K3717 in `rulings.md`, and every function named in §2 in `agent-worker/src/index.mjs`.
**Line numbers:** `tranche/T51` @ `9b21036cae`, `agent-worker/src/index.mjs` (2,362 lines). T51-45 is first in L6 and nothing else edits this module before T51-65, so the ranges hold; the job re-takes them at its START.

## 0. The answer

**The cut is the step machinery.** To a new module `agent-steps` go, from `index.mjs`: `driveHarness` (the segment driver: the function that walks the control-flow table for one segment), `settleAtDispatch`, `performStep` and `performPlanStep` (what each row does against the plane), `reexaminationReads`, `runSubsessions`, and the small readers only they and the shell share (`planeAnswer`, `publishedPack`, `loadableLayers`, `loadLayer`, `modelHalf`, `loggable`, `conditionFault`, `meaningRead`, `levelTargets`, `splitAddress`), plus `reads.mjs` and `holdings.mjs` whole and three constants of `ops.mjs`.

**`agent-worker` keeps the Worker shell:** the routes and the default export, `checkRun`, `handleRun`, `runSegment`, `segmentAnswer` (R28's answer, assembled from `driveHarness`' result), the `SegmentDriver` and `CheckRecord` Durable Object classes (a Worker entry must export them), `SURFACE`, `accountOf`, `assistantReady`, `handleVersion`, `askPlane`, `json`, `refusal`, the four fixed refusals (`planeSilent`, `planeRefused`, `modelSilent`, `modelRefused`), `ASK_DEPS`, and the files for `/ask`, `/draft`, `/signin`, `/transcribe`, the cascade, the remote road and `ops.mjs`.

"The segment driver" in N1205 is read as `driveHarness`, not the `SegmentDriver` Durable Object (R91): the class is an exported handler of the Worker entry and stays (doubt 1).

| | lines (with comments) |
|---|---|
| `agent-worker/src` before | **4,421** (`index.mjs` 2,362; `ask.mjs` 379, `draft.mjs` 519, `action-drafts.mjs` 303, `transcribe.mjs` 195, `signin.mjs` 189, `cascade.mjs` 114, `ops.mjs` 112, `reads.mjs` 81, `remote.mjs` 87, `holdings.mjs` 54, `untested.mjs` 26); 4,465 with `scripts/build.mjs` (44) |
| `agent-worker/src` after T51-65 | about **2,730**: `index.mjs` about 830, the others 1,902 (`ops.mjs` about 90; `reads.mjs` and `holdings.mjs` gone) |
| `agent-steps/src` | about **1,760**: 1,493 from `index.mjs`, 81 + 54 whole, 22 from `ops.mjs`, about 110 of headers, imports and the barrel |

Both well under 4,000. `agent-worker` has about 1,270 lines of room for the T52 and later work that was queued behind this split.

## 1. The new module

| | `agent-steps` |
|---|---|
| purpose | Performs the steps of an AI run for the Worker shell: reads the run from the plane, holds it to its account and pack, walks `agent-harness`' table (the plane calls of each row, the model's judgements and the level sub-sessions when a model is handed to it, a tick after every step, the close), and holds the readers the shell shares with it. Decides no step, words no refusal of the shell's, writes nothing itself. Requirements: `requirements/agent-steps.md`. |
| layer | 6 |
| place in `modules.json` | directly before `agent-worker` (the row exists, index 96, after `agent-runner`; nothing to move). It must come after `agent-harness`, `agent-model`, `run-rules`, `record-grammar` and `query-language`, which it uses; `agent-worker` uses it. |
| paths | `["agent-steps/src/"]` |
| tests | `["agent-steps/test/"]` |
| from | none (not legacy; K624) |
| uses | runtime: `agent-harness`, `agent-model`, `run-rules`, `record-grammar`, `query-language`. Tests only: `test-support` (the sandbox), `retrieval`, `run-productions`, `capture-requests`, `ai-runs` (the plane stubs are derived from their checks and op declarations). So `["record-grammar", "test-support", "query-language", "retrieval", "run-rules", "run-productions", "capture-requests", "ai-runs", "agent-harness", "agent-model"]`, each earlier in the order. It names no `agent-runner`, `setup-words` or `bundler` (none of the moved code imports them). |
| `agent-worker`'s row afterwards | `paths` and `tests` unchanged; `uses` gains `agent-steps` (and keeps the rest: its remaining files still use `agent-harness`, `agent-model`, `run-rules`, `credentials` etc.). It no longer needs `record-grammar` (`BUNDLE_ID_RE`) or `query-language` (`MEANING`) at runtime for its own source; both stay in `uses` for its suites (the pins, `wire-vocabulary`). BOB edits `modules.json` at the fold of T51-45 / T51-65; neither job does (K1043). |

Layout (suggested; the job's): `agent-steps/src/drive.mjs`, `work.mjs`, `subsessions.mjs`, `entries.mjs`, `plane.mjs`, `names.mjs`, `reads.mjs`, `holdings.mjs`, `index.mjs` (the exports). No `package.json`, no `fleet-member.json`: it is a library module like `agent-harness` (`agent-harness/src`, `agent-harness/test`), not a fleet member; its suite is run as `agent-harness`' is.

## 2. What moves (copy by T51-45; delete by T51-65)

Line ranges in `agent-worker/src/index.mjs`, with their leading comment blocks.

| what | lines | n | goes to |
|---|---|---|---|
| `MAX_STEPS`, `wallNow` | 357–369 | 13 | `drive.mjs` |
| `driveHarness` | 371–882 | 512 | `drive.mjs` |
| `settleAtDispatch` (R107) | 884–922 | 39 | `drive.mjs` |
| `LOG_DETAIL_MAX`, `loggable`, `CONDITIONS`, `JUDGED_WITH_CONDITION`, `conditionFault` (R92, R117) | 924–979 | 56 | `entries.mjs` |
| `planeAnswer`, `publishedPack` | 981–1050 | 70 | `plane.mjs` |
| `MEANING_OP`, `SNIPPET_TOKENS`, `meaningRead` | 1052–1070 | 19 | `work.mjs` |
| `performStep` | 1072–1536 | 465 | `work.mjs` |
| `performPlanStep` | 1538–1661 | 124 | `work.mjs` |
| `reexaminationReads` | 1663–1693 | 31 | `work.mjs` |
| `levelTargets`, `splitAddress` | 1695–1714 | 20 | `work.mjs` |
| `runSubsessions` | 1716–1818 | 103 | `subsessions.mjs` |
| `SUGGESTIONS_LAYER`, `loadableLayers`, `loadLayer` | 1820–1838 | 19 | `plane.mjs` |
| `modelHalf` | 1840–1861 | 22 | `plane.mjs` |
| **from `index.mjs`** | | **1,493** | |
| `reads.mjs` (`bytesIn`, `textOnly`, `droppedNote`, `toolContent`) | whole | 81 | `reads.mjs` |
| `holdings.mjs` (`withRecordIds`) | whole | 54 | `holdings.mjs` |
| `MEANING_ARM`, `RESPONSE_ID`, `SEGMENT_END_BY` from `ops.mjs` | the three declarations and their comments | 22 | `names.mjs` |

**State.** None is shared. `driveHarness` keeps all its state in its own closure (`calls`, `accounted`, `trace`, `refusals`, `logged`, the log sequence, the wall clock); `performStep`, `performPlanStep` and `runSubsessions` take `call`, `state`, `runId`, `model` and `logSeq` as parameters today and need no change. The only module-level values are constants and `CONDITIONS`, read once at load from `agent-harness`' `spawnContract` (it moves with `conditionFault`; the load-time call is the same).

**What stays that the moved code does not need:** `PLANE_ORIGIN`, `AI_TOKEN_SHAPE`, `DEFAULT_MAX_TURNS_PER_SEGMENT`, `BOUND_SOURCE`, `json`, `refusal`, `askPlane`, `SURFACE`, `refusalCodes`, `MODEL_TURNS`, `ASK_DEPS` and the header comment of `index.mjs` (130 lines).

## 3. Imports of the moved code

All earlier modules or its own:

| import | from | used by |
|---|---|---|
| `FIRST_STEP, LEVELS, REPORTING_LEVEL, BUDGET_BOUNDS, passLimit, nextStep, stepLog, applyJudgement, adjustedFrom, emptyLevelCandidates, runContextTarget, advance, publishableState, resumeFrom, PLAN_FLOW, PLAN_MAX_PASSES, OPTION_KEYS, flowFor, nextPlanStep, planAdvance, applyPlanJudgement, planDedup, PLAN_READS, PROFILE_FACTS, planSubjectReads, earlierPlans, whyWithUndetermined, resumeTargets, disagreementsToSettle` | `agent-harness/src/harness.mjs` | `drive.mjs`, `work.mjs` |
| `SUBSESSION_OPS, spawnContract, checkReport, takeReports, citedAddresses, documentHoldings, holdingsNote, LOOKED_STATES` | `agent-harness/src/subsession.mjs` | `work.mjs`, `subsessions.mjs`, `entries.mjs` (`spawnContract`) |
| `converse, openRow, rowFacts, judgeTools, planJudgeTools, LOAD_LAYER, parentSystem, subsessionSystem, subsessionOpening, subsessionTools, MODEL_FOR_MODE` | `agent-model/src/model.mjs` | `drive.mjs`, `subsessions.mjs`, `plane.mjs` (`modelHalf`) |
| `AI_RUN_STATE_MAX_BYTES, checkCondition, DEFINITIVE_STATES` | `bio-plane/src/run-rules/index.mjs` | `drive.mjs`, `entries.mjs`, `subsessions.mjs` |
| `BUNDLE_ID_RE` | `bio-plane/src/record-grammar/ids.mjs` | `work.mjs` |
| `MEANING` | `bio-plane/src/query.mjs` | `work.mjs` |
| `toolContent, droppedNote`; `withRecordIds`; `MEANING_ARM, RESPONSE_ID, SEGMENT_END_BY` | its own files | `drive.mjs`, `work.mjs`, `subsessions.mjs` |

None imports `agent-worker`'s `ops.mjs` (the three names move), `cascade.mjs`, `remote.mjs`, `signin.mjs`, `setup-words` or `bio-plane/src/tokens.mjs`. The moved code does not call `word()`: no member-facing sentence is chosen in it (the refusals the shell words are handed in, below).

**What `index.mjs` imports afterwards** from `agent-steps`: `driveHarness, MAX_STEPS, planeAnswer, publishedPack, loadableLayers, loadLayer, modelHalf, SEGMENT_END_BY`; and from `agent-model` still `DEFAULT_MAX_SEGMENT_BYTES, SEGMENT_BYTES_SOURCE, segmentMeter, converse`. Its imports of `agent-harness`, `subsession.mjs`, `run-rules`, `record-grammar/ids.mjs`, `query.mjs`, `reads.mjs`, `holdings.mjs` and `MEANING_ARM`, `RESPONSE_ID` go. `ask.mjs`, `draft.mjs` and `action-drafts.mjs` import `toolContent` from `agent-steps` instead of `./reads.mjs`.

## 4. How the moved code reaches the shell's state: the host

Five things the moved code needs are the shell's, and it reaches them through one argument. `driveHarness(host, env, opts)` (today `driveHarness(env, opts)`); `host` is exactly:

| member | what it is | used for |
|---|---|---|
| `askPlane(env, op, credential, store, query, body)` | the one call to `env.PLANE` (R60; `PLANE_ORIGIN` stays in the shell), answering `{reached, status, body}` or `{reached: false, detail}` | `driveHarness` builds `call` from it; everything below `call` is passed `call`, as today |
| `refusal(code, detail, status, extra)` | the shell's refusal response | `NO_SUCH_RUN`, `RUN_NAMES_A_DIFFERENT_PAYER`, `SKILL_VERSION_MISMATCH`, `JUDGEMENT_OVERREACH`, the spawn-contract codes |
| `planeSilent(asked)`, `planeRefused(runId, store, asked)` | the shell's `PLANE_SILENT` and `PLANE_REFUSED` responses (`index.mjs` 1874–1883) | the 9 and 5 sites in `driveHarness` |
| `modelSilent(silent, runId)`, `modelRefused(refused, runId)` | the shell's `MODEL_SILENT` and `MODEL_REFUSED` responses (1863–1872) | the 3 and 3 sites |

Why these stay in the shell: they are the member's own words, they carry `worker: "agent-worker"` and the member's refusal helper, and `handleRun` words the same two refusals itself. Moving them would have `agent-steps` name `agent-worker` in a body; injecting them is a narrower interface than injecting `json` and rewriting them. Nothing else crosses: `performStep`, `performPlanStep`, `runSubsessions`, `settleAtDispatch` take `call` and need no host; `modelHalf`, `planeAnswer`, `publishedPack`, `loadableLayers` and `loadLayer` are pure. The shell builds the host once, at module level: `const STEPS_HOST = { askPlane, refusal, planeSilent, planeRefused, modelSilent, modelRefused }`, and `segmentAnswer` calls `driveHarness(STEPS_HOST, env, {...})`. `env` is passed as it is (`PLANE`, `CLOCK`; the moved code reads no other key).

Every call site stays byte-equal in behaviour: the same `Response` objects reach the same places, so `segmentAnswer`' `drive.refusal.clone().json()` is unchanged.

## 5. What `agent-worker` ends with

`index.mjs` (about 830 lines): the header comment (130), the imports (about 35), `PLANE_ORIGIN`, the bound constants, `json`, `refusal`, `SURFACE`, `askPlane`, the four fixed refusals, `STEPS_HOST`, `accountOf`, `handleRun`, `checkRun`, `runSegment`, `refusalCodes`, `segmentAnswer`, `handleVersion`, `assistantReady`, `SegmentDriver`, `CheckRecord`, `ASK_DEPS` (now naming the imported helpers), `MODEL_TURNS`, the default export. The stale comment at line 287 (`civicos-ui/check-refusal-codes.mjs`, deleted in T20) goes in T51-65, as the entry says. The header comment's account of "what it does" stays true (`/run` drives the harness); a sentence says `agent-steps` drives it.

## 6. The ids

Moved ids are retired in `agent-worker.md` as "moved to `agent-steps` R<n> (T51, K3850)" and stay retired (K617, K624); none is reused. `agent-steps.md` carries them as R1–R42 ("moved from `agent-worker` R<n>"), all `*(not yet met: T51)*`:

| `agent-worker` | `agent-steps` | |
|---|---|---|
| R9, R10, R11, R12 | R1, R2, R3, R4 | |
| R17, R18, R19 | R6, R7, R8 | |
| R21, R22, R23, R24, R25 | R9, R10, R11, R12, R13 | |
| R26, R49, R27 | R14, R15, R16 | |
| R51, R52, R78, R90 | R17, R18, R19, R20 | |
| R92, R94, R95, R96, R97, R98, R99 | R21, R22, R23, R24, R25, R26, R27 | |
| R100, R101, R102, R103, R104, R105, R107, R108 | R28, R29, R30, R31, R32, R33, R34, R35 | |
| R114, R115, R116, R117, R118 | R36, R37, R38, R39, R40 | |
| R38, R39 | R41, R42 | invariants |

New in `agent-steps`: R5 (split from R48: the pack held to the run's record; R48 stays in `agent-worker` for the ask and the draft, with a T51 note), R43 (the host), R44 (`planeAnswer`, from the Terms), R45 (`textOnly`, split from R63, which stays), R46 (the layers, split from R56, which stays), R47 (`modelHalf`), R48 (the shared names, split from R37, which stays), R49 (no shared state).

New in `agent-worker`: **R119** (unmet, T51): the shell delegates; behaviour byte-identical; under 4,000 lines. Its own header, Uses, Size and Suggestions say the same. **Stay unmoved and why:** R1–R8 (`/run`'s body checks and the first call), R28–R34, R91, R93 (the answer, the segment's Durable Object), R35, R36, R43, R44, R45, R47, R57 (the shell's invariants; R43's list of refusal ids is re-pointed), R37, R53 (`PLANE_OPS` stays in `ops.mjs`, pinned by control-plane, N402), R54–R90 and R109–R113 (the other routes and the remote road), R6, R32, R33, R56, R71 (the account), R60–R63 (the carrier, record text, files).

## 7. Tests

`agent-worker/test` is 15,500 lines. Every suite drives the whole member through `worker.fetch` (`POST /run` and the other routes), so none can move to `agent-steps` unchanged: `agent-steps` must not import `index.mjs` (P4). Two groups:

**Move (copied by T51-45 and re-pointed to `driveHarness(host, env, opts)` with a recording test host; deleted by T51-65):** suites whose every arm is about a moved requirement and reads what the drive returns or what the plane stub records. A thin `host` for them is six lines (`refusal` building the same JSON response, the four fixed ones likewise); the model is `modelHalf({reference, runner, meter: segmentMeter(...)})` over the same scripted global `fetch`.

| suite | lines | requirements |
|---|---|---|
| `fanout.test.mjs` (Part A pure on `agent-harness`' contracts, Part B through the op) | 919 | R6, R7, R8, R22–R25 |
| `r096.test.mjs`, `r101.test.mjs`, `r103.test.mjs`, `r107.test.mjs` | 182, 148, 173, 210 | R24–R26, R28–R35 |
| `t49r90.test.mjs` (with the `withRecordIds` arms) | 192 | R20 |
| `versions.test.mjs`, `versions.control.mjs` | 349, 107 | R9, R37 |
| `plan.test.mjs` | 337 | R17, R18, R19 |
| fixtures `plane-meaning.mjs`, `plane-suggest.mjs`, `plane-capturerequest.mjs`, `plane-versions.mjs` | 77, 319, 106, 32 | the plane stubs of the moved calls |

About 3,150 lines. The fixtures are moved, not copied twice: the suites that stay in `agent-worker` (`harness.test.mjs` Part B, `agent-worker.test.mjs`) import them from `agent-steps/test/`, a later module's tests using an earlier module's, the direction of P4. New arms the job writes at the interface: R5, R43 (the host's identity, a tripwire `env`), R44, R45, R46, R47, R48, R49.

**Stay in `agent-worker` (the proof of delegation, R119):** `agent-worker.test.mjs`, `requirements.test.mjs`, `harness.test.mjs`, `inprocess.mjs` (the behavioural fence at the member's interface, N421), `owners.mjs`, `account.mjs`, `remote.mjs`, `r085.test.mjs` (R91–R93, the segment's end), `t35` to `t50`, `ask.test.mjs`, `cascade.*`, `wire-vocabulary.*`, `harness.control.mjs`, `agent-worker.control.mjs`. Import changes only: `MEANING_ARM`, `SEGMENT_END_BY` (and `RESPONSE_ID` where used) from `agent-steps`' `names.mjs`; `PLANE_OPS`, `NAMESPACES`, `ASK_*`, `TRANSCRIBE_*` still from `ops.mjs`. `harness.control.mjs`, `agent-worker.control.mjs`, `fleetbundles.control.mjs` edit real source by exact-string replacement: those pinning moved text are re-pointed to the new files in the same job (an arm whose string moved must throw if it matches nothing).

**Sequence of proof.** T51-45 changes no existing file of `agent-worker`: its suites pass unchanged, `agent-steps` has its own, and `agent-worker`'s bundle (which does not import `agent-steps` yet) stays fresh. T51-65 swaps the bodies for imports and runs every `agent-worker` suite unchanged but for the import lines above: that is the byte-identical claim of R119, observed, not argued. The suites that moved are then deleted from `agent-worker/test` (the files only `agent-steps` runs).

## 8. The bundle

`agent-worker` is a fleet member (`fleet-member.json`; bundle `dist/agent-worker.bundled.mjs`, manifest `dist/agent-worker.bundle.json`; `manifest.md` §Generated artifacts). `bundler`' `writeMember` builds with esbuild from `src/index.mjs` and records esbuild's metafile inputs, so `agent-steps/src/*.mjs` become bundle inputs by being imported (`../../agent-steps/src/index.mjs`), exactly as `agent-harness`' and `agent-model`' files are today. Nothing in `fleet-member.json` or `agent-worker`'s build needs to list them (`entry` and `bundle.entry` stay `src/index.mjs`; neither lists `agent-harness` now). Consequences:

- The bundle's manifest `inputs` gain the `agent-steps` files and lose `agent-worker/src/reads.mjs` and `holdings.mjs`; the bundle's bytes change (module order, names). The bundle is stale after T51-65 until BOB regenerates it at the layer's close (`agent-worker/`: `npm run build`); the job reports it stale and does not build it by hand (`manifest.md`). It is fresh after T51-45 (no import yet). `release/agent-worker.bundled.mjs` and `newgroup/src/release.mjs` are regenerated by the release assembly, not by either job.
- `manifest.md`'s row for the bundle ("`agent-worker`, the plane's `tokens.mjs` ... `run-rules` ...") gains `agent-steps`; BOB's edit. The set of plane files in the bundle does not change: the moved code imports `run-rules`, `record-grammar/ids.mjs` and `query.mjs` as `index.mjs` did.
- Behaviour: the same code, the same load-time order (`CONDITIONS` is read at load from `agent-harness`' contract as before). `fleetbundles.test.mjs` (verifyStatic, verifyFresh) must print 0 fail with no SKIP after the regeneration; the global-scope timing check is unaffected.
- `R109`'s check that the bundle holds no local-container path is asked of a fresh build and stays true.

## 9. The two jobs

- **T51-45 `agent-steps` (first in L6, K624):** creates `agent-steps/src` and `agent-steps/test` by copy as §§2–4 and §7 say; adds nothing to and removes nothing from `agent-worker`. Writes the interface tests for R5, R43–R49. Merges early. Does not edit `modules.json` (BOB sets `paths`, `tests` and `uses` of the row, §1).
- **T51-65 `agent-worker`:** deletes the moved code and `reads.mjs`, `holdings.mjs`, the three declarations in `ops.mjs`; builds `STEPS_HOST`; re-points `index.mjs`, `ask.mjs`, `draft.mjs`, `action-drafts.mjs` and the tests' imports; deletes the stale comment at 287 and the moved suites; edits `index.mjs`' header only where it now points to `agent-steps`; changes nothing else (no assistant work, K3717). Runs every remaining suite unchanged. Reports the bundle stale and the line count of `src` (about 2,730).

## 10. Things outside this module that go stale (BOB's, not either job's)

- `agent-harness/src/harness.mjs` line 5 says `MEANING_ARM` and `NAMESPACES` are "agent-worker's, declared once in its `ops.mjs`": after T51-65 `MEANING_ARM` is `agent-steps`'. A comment in another module's file: the next `agent-harness` job.
- `bio-plane/src/journey-check/local.mjs` line 8 ("agent-worker run from `agent-worker/src/index.mjs`") stays true.
- `bio-plane/test/m/control-plane/members-pin.test.mjs` and `r53-routes.test.mjs` import `PLANE_OPS`, `NAMESPACES`, `ASK_PLANE_OPS` from `agent-worker/src/ops.mjs`: unchanged, because those stay.
- `bio-plane/test/m/plane/t42.test.mjs` imports `TRANSCRIBE_*` from `ops.mjs`: unchanged.
- `build/manifest.md`'s bundle row (§8), `build/modules.json` (§1), `agent-worker.md`' Size line after T51-65 (measured).

## 11. Doubts, with the reading taken

1. **"The segment driver."** Read as `driveHarness` (what turns a segment into steps), not the `SegmentDriver` Durable Object (R91), which is an exported handler class of the Worker entry (`wrangler.jsonc` binds it by class name) and cannot move without a re-export, which R65 forbids. If N1205 meant the class, it is 36 lines and the cut is no cheaper.
2. **`reads.mjs`, `holdings.mjs` and `modelHalf` move although the shell also uses them** (`reads.mjs` by three route files, `modelHalf` by `/ask`). They are leaf helpers; the other placement (the shell keeps them and injects them) widens the host from six functions to nine and leaves the moved code unable to run in `agent-steps`' own suite without the shell. R63, R56 and R48 stay in `agent-worker` and cite the new ids.
3. **`PLANE_OPS` stays in `agent-worker/ops.mjs`** although `agent-steps` is the code that names the run's ops. The control plane pins it from there (N402) and `inprocess.mjs` measures the set at the member's interface; moving the declaration would change both pins for no size. `agent-steps` names no op outside it, held by the shell's fence suite, not by `agent-steps`' (R37 there).
4. **The suites that move.** Re-pointing a suite from `worker.fetch` to `driveHarness` changes how it reads its result (camelCase drive fields for the wire's snake_case). The list in §7 is by header, not arm by arm; the job's START confirms each (a suite that asserts R28's wire stays). If BOB prefers no suite to move until T51-65, the cost is `agent-steps` carrying only its new interface arms (R5, R43–R49) and the deletion of `agent-worker`'s suites being a decision for a later tranche. The P7 reading taken: a moved requirement is tested at its new module's interface.
5. **The host carries the shell's four fixed refusals.** A narrower `{askPlane, refusal, json}` is possible if they move (§4); not taken, for the `worker: "agent-worker"` literal.
6. **Size is by `wc -l`, with comments**, as K2513 measures; the "4,465" in the entries is that figure plus `scripts/build.mjs`. Without comments and blanks the shell is about 1,900.
