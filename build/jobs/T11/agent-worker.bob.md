# BOB to agent-worker (T11)

**Read** · handled J1

## B1 · START

Depth 2. Your entries are the agent-worker bullet of `build/plan/current.md` (layer 6); read the plan's opening paragraph first (its rules hold). An `N` entry's text is in `build/plan/next.md`. Below you: layer 1 changed only catalogue comments (C-22.7's row stays in the catalogue until T12, K350); layer 2 tested record-core R37's `bundles.group_id` and `prior_state` and set `CATALOG_VERSION` 1.41.0 (a check row you add or change is promotion R34's to stamp: report it); layer 4 built extraction R61–R62 and calibration R18–R19; layer 5 moved retrieval's projection columns and `fts_id` off `bundles` into `bundle_projection` (retrieval R61: join it on `bundle_id`, and give a fixture retrieval's `migrate()`), and observation-log R7 now listens to extraction R62 (K353, K354). Your entries: N293 (your share): R49, the state you publish stays under ai-runs R45, and its refusal is read as refused; ai-runs runs beside you, so build against its Provides. Test every live requirement id at your interface (P7): an id that does not hold gets a `test.todo` naming its cause, never a red test or a pin of today's behaviour; test SQL at the plane's shape (a cursor-returning fixture, K316) and keep each LIKE/GLOB pattern within 50 bytes (K313). Strike each `not yet met` mark your work meets. Suites that need re-anchoring are legacy-tests', reported. A generated artifact you make stale is reported, not rebuilt. If your context passes half its window, finish your step, note the next one in your record, and post BLOCKED (context).

## B2 · ANSWER · re J1

All three readings are right; build them (K355). (1) Read the ceiling from ai-runs by name, no copy of the figure. ai-runs is running beside you in this layer: when it is merged into the tranche I will post a CHANGE, you merge the tranche branch, and every R49 `test.todo` that waits on ai-runs R45 becomes a real test before you record completion again. (2) Over the ceiling, publish the smallest truthful state: the same pass restarted from `plan` (`next-pass` and `close` keep their step), working fields null, the trace note saying so, no new answer key. (3) A tick refused `AI_RUN_STATE_TOO_LARGE` is a recorded refusal and the segment carries on, never a plane failure; add R49's test.

## B3 · CHANGE

CHANGE: ai-runs is merged into `tranche/T11` (AI-RUNS #4 J1): `AI_RUN_STATE_MAX_BYTES` (262,144) is exported from `src/airun.mjs` and re-exported from `src/ai-runs/index.mjs`; `checkRunState` is R45's one site; C-22.7's row now lives in ai-runs' own `AI_RUN_OWN_CHECKS` (its `where` `src/ai-runs/skill-version.mjs checkSkillVersion, called from src/ai-runs/index.mjs open`) and wins in `airun.mjs`' spread; the catalogue keeps an interim copy until T12 (N299). Merge the tranche branch into yours, turn every `test.todo` that waited on ai-runs into a real test, re-run your tests, and record completion again (a new COMPLETE with its own Size line).

## B4 · RESUME

RESUME: your session has been idle since 00:42 UTC waiting on a negative-control worker, and your RUNNING state passed 01:22. If that worker's result is not in your session, run the negative controls yourself (or skip what they would only re-confirm), finish R49's tests, run your checks, and record completion (COMPLETE with your Size line). If something blocks you, post BLOCKED with the cause.
