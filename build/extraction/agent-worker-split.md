<!-- Split map for agent-worker (K617, K624, K1821; plan T41 doubt 7 and "Left out"), written for BOB on 2026-10-10 on tranche/T41 (@ 9ec9200ddf) by a worker, uncommitted, for T42's P18 prep. BOB reviews it. -->
# agent-worker → agent-ask, agent-run — split map (contingent)

**Status** · DRAFT for BOB, 2026-10-10, on `tranche/T41`, uncommitted. **Why:** plan T41-31 (`plan/current.md`:120), "Left out" (:190) and doubt 7 (:212): agent-worker measures 7,510 lines over its own `paths` (K1821), past K617's ~4,000, so a split map is owed for T42. **Read whole:** agent-worker's `modules.json` entry (:97) and every module naming it in `uses` (only `control-plane`, :146); `requirements/agent-worker.md`; every file in agent-worker's own paths outside `test/` (`src/index.mjs`, `ask.mjs`, `draft.mjs`, `cascade.mjs`, `ops.mjs`, `reads.mjs`, `signin.mjs`, `scripts/build.mjs`, `wrangler.jsonc`, `fleet-member.json`, `package.json`, `dist/agent-worker.bundle.json`, and `dist/agent-worker.bundled.mjs` 1–4740); `extraction/publication-split-3.md` (the format); `manifest.md` "Generated artifacts"; rulings K617, K624, K625, K1821, K2053, K2085. **Tests** were mapped by their headers, imports and `section(...)` lines, not read whole (they are not own code, K1821). **Callers** found by grep of every agent-worker path over the repository (bundles excluded).

## 0. The answer

**The 7,510 is mostly a generated file. Recommended: no split, and a one-line ruling on the measure (doubt 1).**

| what is counted in `agent-worker/` (`.mjs`, no tests) | lines |
|---|---|
| `src/` (7 files), hand-written | 2,733 |
| `scripts/build.mjs`, hand-written | 44 |
| `dist/agent-worker.bundled.mjs`, **generated** by `bundler` (manifest §14; no job edits it) | 4,740 |
| total today (T40 measured 7,510) | 7,517 |

- Of the bundle's 4,740 lines, 2,036 re-emit agent-worker's own `src/` and **2,704 are other modules' code** inlined: agent-harness 993 (bundle 1–697, 2593–2888), agent-model 695 (2955–3648), run-rules 646 (1064–1540, 1630–1797), observation-log 249 (904–1063, 1541–1629), record-grammar 106 (798–903), runtime-limits' `tokens.mjs` 15 (2889–2903).
- Hand-written code is **2,777**, which the module's own Status line also says ("2,780 lines of source", `requirements/agent-worker.md`:5). That is under ~4,000, with ~1,200 lines of headroom (N832's `POST /transcribe`, `plan/next.md`:17, is the next known growth).
- Precedent for not counting the bundle: K2085 measured `file-scanner` "2,721 without [tests] … no split" while its `dist/` bundle existed. Counted the T41 way, file-scanner is 6,760 today, `pdf-worker` 42,336 and `ocr-worker` 10,320, and none of them is planned for a split. K2053 already separates "its own hand-written code" from "generated artifacts … never read".
- **No source split can clear the T41 count.** The bundle is the whole Worker's build. It stays with the module that owns the entry (`fleet-member.json`:2–9, `wrangler.jsonc`:53 `main`). After the split below, agent-worker would still be about 1,060 + 4,740 ≈ **5,800**.

**If BOB still wants a split** (for headroom, or for cohesion), the seams are two capabilities that already reach the Worker shell only through pieces it hands them:
- **`agent-run`**: one AI run's segment. This is the driver that turns `agent-harness`' table rows into plane calls (R9–R12, R17–R27, R38, R39, R49, R51, R52, and R48's run share). About **1,070** lines.
- **`agent-ask`**: a member's own one-conversation acts, `POST /ask` and `POST /draft` (R54, R55, R59, R68–R70, and R64's `ask.mjs` rows). About **720** lines. `ask.mjs` and `draft.mjs` already take the shell's plumbing as an injected `deps` argument (`ASK_DEPS`, `index.mjs`:1685). That is K625's pattern ("admission receives the door's `doAnswer` as a parameter").
- **`agent-worker` stays the Worker:** the routes, `/run`'s door checks (R1–R8), the answer (R28, R29), the plane call (R60), the plane-answer reading, the account judgement and cascade (R6, R32, R33, R57, R71), the read filter (R63), the sign-in relay (R66, R67), the build and the bundle. About **1,060** hand-written lines.

It adds no new Worker, binding, route or plane change: the plane still calls `https://agent-worker/{run,ask,draft,signin}`. The new edges are agent-worker → agent-ask and agent-run, and control-plane → agent-ask (one test pin). The test rework is large (doubt 3).

## 1. The new modules

| | `agent-ask` | `agent-run` |
|---|---|---|
| layer | 6 | 6 |
| place in `modules.json` | after `agent-runner` (:96), before `agent-run` | after `agent-ask`, directly before `agent-worker` (:97) (the two do not use each other, so either order works) |
| paths | `agent-ask/src/` (`ask.mjs`, `draft.mjs`, `ops.mjs`) | `agent-run/src/` (`run.mjs`) |
| tests | `agent-ask/test/` | `agent-run/test/` |
| entry point | `handleAsk(req, env, deps)`, `handleDraft(req, env, deps)` (route handlers with no state). It also exports `ASK_OPS`, `ASK_PLANE_OPS`, `readTool`, `admitRead`, `askTools`, `ASK_DECLARED`, `DRAFT_OPS`, `taskOf`, `translationTaskOf`, `toldOf` | `driveHarness(env, args, deps)` → the segment's facts or `{refusal}`. It also exports `MAX_STEPS`, `MEANING_ARM` |
| `deps` (handed in by agent-worker; nothing later is imported) | today's `ASK_DEPS` (`index.mjs`:1685–1686) plus `toolContent` | `askPlane`, `planeAnswer`, `publishedPack`, `refusal`, `json`, `loadableLayers`, `loadLayer`, `toolContent`, `droppedNote` |
| uses (each earlier) | `run-rules` (`ASK_BOUNDS`, `askBoundReached`, `draftMayRead`, `TRANSLATION_DRAFT_MAX_WORDS`). Tests: `answers` (`ASK_SCOPE`), `credentials` (`AI_GRANT_OPS`), `agent-model` (`MODEL_ENDPOINT`, `MODEL_FOR_MODE`, `USAGE_FIGURES`), `test-support` | `run-rules` (`AI_RUN_STATE_MAX_BYTES`), `agent-harness` (`harness.mjs`, `subsession.mjs`), `agent-model` (`converse`, `judgeTools`, `planJudgeTools`, `LOAD_LAYER`, `parentSystem`, `openRow`, `rowFacts`, `subsessionSystem`, `subsessionOpening`, `subsessionTools`). Tests: `test-support`, `record-grammar`, `query-language`, `retrieval`, `basis-versions`, `run-productions`, `capture-requests` (the `plane-*.mjs` fixtures' imports) |

`agent-worker` gains `agent-ask` and `agent-run` in `uses`. It keeps the rest for its remaining runtime code and tests.

## 2. What moves (by copy, K624)

| moved | file and lines today | to | id |
|---|---|---|---|
| harness imports | `src/index.mjs` 132–145 | `agent-run/src/run.mjs` | — |
| `AI_RUN_STATE_MAX_BYTES` import | `index.mjs` 158–160 | `run.mjs` | R49 |
| subsession imports | `index.mjs` 162–170 | `run.mjs` | — |
| agent-model imports, the driver's names (`converse`, `judgeTools` … `subsessionTools`) | `index.mjs` 179–185 (split: the shell keeps `segmentMeter`, `DEFAULT_MAX_SEGMENT_BYTES`, `SEGMENT_BYTES_SOURCE`, `converse`, `MODEL_FOR_MODE`) | `run.mjs` | — |
| `MAX_STEPS` | `index.mjs` 326–335 | `run.mjs` (the shell imports it for `handleRun`:1578) | R27 |
| `driveHarness` | `index.mjs` 337–751 | `run.mjs` | R9–R12, R26, R27, R38, R48 (run share), R49 |
| `MEANING_OP`, `meaningRead` | `index.mjs` 824–839 | `run.mjs` | R19, R22 |
| `performStep` | `index.mjs` 841–1183 | `run.mjs` | R17–R19, R21–R25 |
| `performPlanStep` | `index.mjs` 1185–1299 | `run.mjs` | R51, R52 |
| `runSubsessions` | `index.mjs` 1301–1364 | `run.mjs` | R19, R26 (drives agent-harness R7) |
| `modelSilent`, `modelRefused`, `planeSilent`, `planeRefused` (used only by the driver) | `index.mjs` 1404–1424 | `run.mjs` | R9, R11 |
| `MEANING_ARM` | `src/ops.mjs` 149–152 | `run.mjs` | R19, R22 |
| the whole file | `src/ask.mjs` 1–309 | `agent-ask/src/ask.mjs` | R54, R55 (`admitRead` 89–108), R64's rows (:158, :161, :177, :280, :285, :286, :290) |
| the whole file | `src/draft.mjs` 1–375 | `agent-ask/src/draft.mjs` | R59, R68–R70 |
| `ASK_OPS`, `ASK_PLANE_OPS` with comments | `src/ops.mjs` 154–179 | `agent-ask/src/ops.mjs` | R55, R54 |

**In the copy:**
- In `run.mjs`, each shell name becomes `deps.<name>`. The sites are:
  - `askPlane` at 356;
  - `planeAnswer` at 370, 411, 442, 631, 690, 838, 863, 927, 996, 1008, 1086, 1196, 1239, 1348;
  - `publishedPack` at 415;
  - `loadableLayers` at 433;
  - `loadLayer` at 526;
  - `toolContent` at 519, 1323;
  - `droppedNote` at 589;
  - `refusal` and `json` inside 384, 399, 418, 542, 565 and 1404–1424.
- In `agent-ask`, `ask.mjs`:36 and `draft.mjs`:27 (`toolContent` from `./reads.mjs`) become `deps.toolContent`, destructured at `ask.mjs`:123, `draft.mjs`:129 and :317. `./ops.mjs` resolves to agent-ask's own file.
- No other line changes. Every refusal text and code stays the same, and so does `worker: "agent-worker"`.

## 3. What stays in agent-worker

These stay:
- `index.mjs`:
  - 1–131: the header, re-worded to name the two modules, and `PLANE_ORIGIN`;
  - 147–156: the imports, re-pointed;
  - 172–177: the cascade import;
  - 187–324: R7's segment bound, R5's `AI_TOKEN_SHAPE`, `json`, `refusal`, `SURFACE` (R34) and `askPlane` (R60);
  - 753–822: `planeAnswer` (the Provides "Terms") and `publishedPack` (R48's whole-pack test);
  - 1366–1402: `loadableLayers`, `loadLayer` (R56) and `modelHalf` (R26's usage entry);
  - 1426–1463: `accountOf` (R6, R57, R71);
  - 1465–1672: `handleRun` (R1–R8, R28, R29, R58);
  - 1674–1705: `/version`, the deps, `MODEL_TURNS` and the routes (R30, R31).
- The other source files:
  - `cascade.mjs` (R32, R33);
  - `ops.mjs` 1–148: `NAMESPACES` (R4) and `PLANE_OPS` (R37, R53), so `control-plane/members-pin.test.mjs`:10 is unchanged;
  - `reads.mjs` (R63, used by all three routes);
  - `signin.mjs` (R66, R67).
- The build and deployment files: `scripts/build.mjs`, `wrangler.jsonc`, `fleet-member.json`, `package.json`, `dist/`.

**Removed with the copy** (by agent-worker's own job, after both new modules merge):
- `index.mjs` 132–145, 158–170, 326–751 except an import of `MAX_STEPS`, 824–1364 and 1404–1424, plus 179–185's driver names;
- `ops.mjs` 149–179;
- `src/ask.mjs` and `src/draft.mjs`, whole.

**Added:**
- imports of `handleAsk`, `handleDraft` (agent-ask) and `driveHarness`, `MAX_STEPS` (agent-run);
- `RUN_DEPS` (about 6 lines);
- `toolContent` added to `ASK_DEPS`;
- `handleRun`:1575 passes `RUN_DEPS`.

## 4. Requirement ids

| agent-worker | new | what |
|---|---|---|
| R9 | `agent-run` **R1** | `op=airun`: silent, refused, `NO_SUCH_RUN`; the record's mode |
| R10 | agent-run **R2** | `RUN_NAMES_A_DIFFERENT_PAYER` (with T41-31's B4 wording, doubt 6) |
| R11 | agent-run **R3** | `op=airunlog`, `resumed_from`, resume at the published state |
| R12 | agent-run **R4** | the target from the run's context |
| R17, R18, R19 | agent-run **R5, R6, R7** | fan-out, the internet level's capture requests, collect |
| R21, R22, R23, R24, R25 | agent-run **R8–R12** | holdings, compose, dedup, submit, adjust |
| R26, R49 | agent-run **R13, R14** | the tick and its log entry; the state ceiling |
| R27 | agent-run **R15** | close; `max_steps` |
| R51, R52 | agent-run **R16, R17** | mode `plan`'s reads and its compose, dedup and submit |
| R38, R39 | agent-run **R18, R19** | never writes an ending; no judgement sets control flow |
| R48 (run share) | agent-run **R20** | a segment refused `SKILL_VERSION_MISMATCH` before any turn |
| new | agent-run **R21** | the `deps` it is handed (K625's form) |
| R46 (copy) | agent-run **R22** | no place named |
| R54 | `agent-ask` **R1** | `POST /ask` |
| R55 | agent-ask **R2** | `ASK_OPS`, equal to `ASK_SCOPE` and `AI_GRANT_OPS`; `admitRead` |
| R59 | agent-ask **R3** | `POST /draft`, the own-words drafts |
| R68, R69, R70 | agent-ask **R4, R5, R6** | the translation draft |
| R64 (`ask.mjs`' 7 rows) | agent-ask **R7** | the words members read, in its own files |
| R46 (copy) | agent-ask **R8** | no place named |

**Retired in agent-worker as "moved to `agent-run` R<n>":** R9 → R1, R10 → R2, R11 → R3, R12 → R4, R17 → R5, R18 → R6, R19 → R7, R21 → R8, R22 → R9, R23 → R10, R24 → R11, R25 → R12, R26 → R13, R49 → R14, R27 → R15, R51 → R16, R52 → R17, R38 → R18, R39 → R19.

**Retired as "moved to `agent-ask` R<n>":** R54 → R1, R55 → R2, R59 → R3, R68 → R4, R69 → R5, R70 → R6.

**Re-worded in agent-worker** (wording only, BOB's):
- R48: `publishedPack` stays here; the run half is agent-run R20, and the ask and draft halves are agent-ask R1 and R3.
- R53: the declaration stays; the plan-mode run's write limit is agent-run R16–R17.
- R56: `loadableLayers` stays; `draft.mjs` 196–198 is agent-ask R3's share.
- R64: the `cascade.mjs` rows stay; the `ask.mjs` rows are agent-ask R7.
- R61 and R62 stay as whole-member invariants, tested at the Worker. They now cite agent-run and agent-ask.
- Purpose, Status (K1505 (1)'s form), Uses, and the Size line.

**Wording only in other modules:**
- `agent-harness` R2 (:30, "agent-worker R9, R11") and R7 (:48, "agent-worker R17");
- `action-plans` (:129, R51, R52);
- `agent-model` and `control-plane` R57 (agent-worker R59).

## 5. Callers and importers

| who (file:line) | uses | re-pointed by |
|---|---|---|
| the plane (`plane/ask.mjs`:79 `https://agent-worker/ask`; `control-plane/signin.mjs`:43; the draft through `plane/door.mjs`) | the Worker's routes, over the `AGENT_WORKER` binding | none: the routes and the Worker are unchanged |
| `control-plane` `test/m/control-plane/r53-routes.test.mjs`:12 | `ASK_PLANE_OPS` from `agent-worker/src/ops.mjs` | control-plane's next job (its `uses` gains `agent-ask`); red until then (doubt 7) |
| `control-plane` `members-pin.test.mjs`:10 | `PLANE_OPS`, `NAMESPACES` | none (both stay) |
| `bundler` `test/system/fleetbundles.test.mjs`:243 | agent-worker's 23 pinned inputs | bundler's job re-pins to 25 (§7) |
| `membership` `MODULE_ORDER` (`src/membership/index.mjs`:252) and `module-order.test.mjs`:34–36 | the module ids | membership gains `agent-ask`, `agent-run` (N415's precedent) |
| agent-worker's own tests: `ask.test.mjs`:10, `inprocess.mjs`:24, `t35.test.mjs`:15, `t36.test.mjs`:11 (`ASK_OPS`, `ASK_PLANE_OPS`); `agent-worker.test.mjs`:91, `fanout.test.mjs`:79, `harness.test.mjs`:97 (`MEANING_ARM`) | moved constants | agent-worker's job (they import the new modules, which are earlier) |

## 6. Tests

**To `agent-run/test/`:**
- `harness.test.mjs` (1–1820) and `harness.control.mjs`;
- `fanout.test.mjs` (1–897);
- `versions.test.mjs` (1–349) and `versions.control.mjs`;
- `wire-vocabulary.test.mjs` (1–276) and `wire-vocabulary.control.mjs`;
- `plan.test.mjs`, except R53 (290–314);
- from `requirements.test.mjs`: R9–R12 (455–605), R17–R27 and R49 (701–1052), R48's run arm (1179–1221), agent-harness R7 (1282–1322) and R38, R39 (1371–1388);
- R10's payer arm in `cascade.test.mjs` (its section 5);
- the fixtures `plane-meaning.mjs`, `plane-suggest.mjs`, `plane-capturerequest.mjs`, `plane-versions.mjs` and `account.mjs`. agent-worker's remaining tests import these from there.

**To `agent-ask/test/`:**
- `ask.test.mjs` 130–282 (R54, R55, R56's ask arm);
- `t35.test.mjs` 279–400 (R59) and R64's `ask.mjs` rows (inside 544–594);
- `t36.test.mjs` 109–132;
- `t37.test.mjs` 294–443 (R68–R70).

**Stay:**
- `agent-worker.test.mjs`, `agent-worker.control.mjs`, `cascade.test.mjs` (except section 5), `cascade.control.mjs`, `inprocess.mjs`;
- `requirements.test.mjs` 342–454, 1053–1178, 1222–1281, 1323–1370, 1389–1487;
- `ask.test.mjs` 283–369;
- `t35.test.mjs` 401–631;
- `t36.test.mjs` 46–108;
- `t37.test.mjs` 83–293;
- `plan.test.mjs` 290–314.

Each moved section today drives the Worker (`worker.fetch` from `src/index.mjs`, or miniflare). At its new interface it must drive `driveHarness`, `handleAsk` or `handleDraft` with stand-in `deps`, because a test cannot import a later module (doubt 3). The arm-by-arm split of `harness.test.mjs` and `fanout.test.mjs` between agent-run and agent-harness is the job's (doubt 5).

## 7. The bundle

There is still **one bundle, still agent-worker's**: entry `src/index.mjs`, `fleet-member.json`:2–9, `wrangler.jsonc`:53.
- **Inputs go from 23 to 25:** `src/ask.mjs` and `src/draft.mjs` leave; `../agent-ask/src/ask.mjs`, `../agent-ask/src/draft.mjs`, `../agent-ask/src/ops.mjs` and `../agent-run/src/run.mjs` arrive.
- **Its bytes change** (module section comments, `deps.` names), so it is stale from agent-worker's merge until it is regenerated at L6's close (§14). Its size stays about 4,750 lines.
- **`manifest.md`'s row** "its inputs come from" gains `agent-ask` and `agent-run`.
- **The pin:** `fleetbundles.test.mjs`:243's pin is red from agent-worker's merge to bundler's re-pin, accepted by name (K641's form).
- **R45** holds after regeneration.
- **The release copies** (`release/agent-worker.bundled.mjs`, `newgroup/src/release.mjs`' embedded string) change only at the next release.
- **Copy-then-delete window (K624):**
  - While both new modules are merged and agent-worker has not yet deleted its copies, the bundle does not change, because the entry still imports its own `ask.mjs` and `draft.mjs` and its own driver.
  - Each new module is bundled by nothing until agent-worker re-points to it.

## 8. Doubts for BOB (best readings)

1. **The measure.** Does P6 / K1821 count a module's §14 generated artifacts?
   - *Reading:* no. Count hand-written code only, as K2053 reads it and K2085 measured `file-scanner`.
   - Then agent-worker is **2,777**: no split, and T42 carries none. The other fleet members stop reading as "over" too.
   - Record it once (one K) and correct `requirements/agent-worker.md`:5's size to 2,777 at its next job.
2. **If the bundle counts,** no split of `src/` brings agent-worker under ~4,000. The bundle (4,740) is the whole Worker's and stays with the entry's module: about 5,800 after this split. The only remedy would be moving `dist/` out of agent-worker's `paths` (to `bundler` or `not_product`), and that is doubt 1's ruling in another form. *Reading:* rule doubt 1 rather than split.
3. **Test rework.** Moving R9–R27, R49, R51, R52, R54, R55, R59 and R68–R70 means rewriting roughly 6,000 lines of run tests and 700 lines of ask and draft tests from Worker-driven to interface-driven with stand-in `deps`. A stand-in `planeAnswer` weakens the D-276 arms, which stay agent-worker's.
   - *Alternative:* a third module, `agent-wire` (about 560 lines: `askPlane`, `planeAnswer`, `publishedPack`, `refusal`/`json`, `accountOf`, `cascade.mjs`, `reads.mjs`, layers, `modelHalf`; R6's account arm, R32, R33, R60, R63), placed first. Both new modules and their tests then import the real plumbing, with no injection. It costs one more module and three more edges.
   - *Reading:* only if BOB rejects doubt 1.
4. **Shared ids.** R48, R53, R56, R61, R62 and R64 span routes. *Reading:* they stay agent-worker's, re-worded (§4); only R64's `ask.mjs` rows move.
5. **agent-harness' ids tested here.**
   - `requirements.test.mjs` 606–700 and 777–810 test agent-harness R1–R5;
   - `harness.test.mjs` and `fanout.test.mjs` Part A walk its tables pure.
   - *Reading:* the pure walks go to `agent-harness/test/` (agent-harness is earlier); the driven arms go to agent-run.
6. **T41-31 is in flight** (B4, B5: R10 compares `principal_claude_ref`; R71's `level` `project` in `accountOf` and the cascade). Every line above is `tranche/T41` @ 9ec9200ddf, before its merge. *Reading:* T42's START re-takes the lines after T41-31 merges. R10 moves with B4's wording.
7. **The window.** `control-plane/test/m/control-plane/r53-routes.test.mjs`:12 is red from agent-worker's deletion of `ASK_PLANE_OPS` until control-plane re-points. R65 forbids a re-export to bridge the gap. *Reading:* an accepted red by name, or a one-line control-plane entry in the same tranche.
8. **Names.** `agent-ask` holds `/ask` and `/draft`, and N832's `POST /transcribe` would land there too (a member's act through `agent-model` under an account, like a draft). *Reading:* `agent-ask` is acceptable; `agent-acts` would cover all three.

## 9. Line counts (`.mjs`, no tests)

| | before | after |
|---|---|---|
| agent-worker, hand-written | 2,777 (`src/` 2,733 + `build.mjs` 44) | about 1,060 (`index.mjs` about 705, `cascade.mjs` 99, `ops.mjs` about 49, `reads.mjs` 81, `signin.mjs` 84, `build.mjs` 44) |
| agent-worker, with its bundle (the T41 count) | 7,517 (T40: 7,510) | about 5,800 |
| agent-ask | — | about 720 (309 + 375 + `ops.mjs` about 35) |
| agent-run | — | about 1,070 (moved 1,021 + `MEANING_ARM` 4 + header about 45) |
| sum, hand-written | 2,777 | about 2,850 (new headers and `deps`) |
