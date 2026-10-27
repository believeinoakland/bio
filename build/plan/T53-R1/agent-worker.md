# T53 R1 · agent-worker · rows

## plan-T53-draft.md

**run-rules**, **ai-runs**, **observation-log**, **agent-harness**, **agent-model**, **agent-runner**, **agent-steps**, **agent-worker**, **ai-use**, **ai-gate** (AI-DESIGN, K5457) · their entries: `planning/plan-T53-ai.md`
**English in tests** (K5565) · every module with sites carries one conversion entry for its own, done in this tranche; 58 modules gain a job by it alone · `planning/plan-T53-tests-english.md`

## plan-T53-tests-english.md

**The entry, the same for every module below** · T53 · K5565 · convert the module's English-in-test sites to the word key and its values: each assertion reads the key the product reads (and its placeholders' values), never a copied sentence; a B site (the text only in the module's own source) first gets its key in the module (a words row, UX-DESIGN's wording where it is shown to a member); a C site (in neither) is test input or a dead assertion: kept as input data, or removed with its reason; and every test the job touches for its other entries is converted with it (the words check refuses English in a new or changed test) · `tests-sweep/CENSUS.md`, `tests-sweep/CENSUS-RX.md` (the module's rows) · Test: the words check's baseline loses the module's files, and the module's suite is green.
**Literal sites** (CENSUS) are A / B files (A: already a `words.json` value; B: inline only). **Regex sites** (CENSUS-RX) are A / B / C sites (files). Counts are before TESTS-SWEEP's certain conversions, which remove 31 A literals and 34 A regexes. "only this · <model>": the job's model (BOB #324, K3518): `haiku-5-5` where the work is test-only, `sonnet-5-5` where a B site needs the module to give a key first (a source change). The module had no other T53 entry, so K5565 gives it a job in R1 (62 such modules before this file; four of them have carried entries the count missed, marked here without the note).
| layer | module | literal A / B files | regex A / B / C sites (files) | |
|---|---|---|---|---|
| 6 | agent-worker | 0 / 0 | 9 / 43 / 57 (17) |  |

## plan-T53-ai.md

**Status** · READY (L56) · Moved whole from `plan-T53-draft.md` at L47 to keep it under its cap (BOB #324); entries unchanged, in the plan's form. Each module's START carries its rows here verbatim (K5564, L37 R1). Detail: AI-DESIGN's drafts in `build/plan/lane-ai-design/` as each entry names; `FOLD-AI.md` for the layer-6 order and the retired ops.
**agent-worker**
- T53 · K5485 (AI2 A) · the beta offers every built part plus the intake interview, the case's account and charge-or-rule answers; investigate, extract and explore per AI behind their bars · K5485
- T53 · N1205 (K5457) · first: the split: `/signin`, its relay and REMOTE dispatch (R66, R67, R81-R85, R109, R111) to agent-model's adapter; `ai_account`; no credential in the Worker · `lane-ai-design/draft-agent-run-path.md` (agent-worker) `first: agent-model's interface`
- T53 · K5457 · each path takes its entry by need, refuses by name, labels every result, fails fast with three choices, turn-level progress, the sealed key by `aicredential` at the call · `lane-ai-design/draft-agent-run-path.md` R120-R127 (AI-DESIGN READY and final) (AI1 answered, K5475)

## build/rulings.md

- K5576 · 2026-10-27 · layer 6 order (BOB's; P4, P17; BOB #325's K5571 report (1)) · agent-runner's T53 lines R44-R60 call ai-gate (later in the order: ai-gate uses agent-worker, which uses agent-runner), an upward use. Resolved inside R1's layer 6, no further round (K5567): (1) agent-worker's job first removes its one use of agent-runner, the test import in `agent-worker/test/t47.test.mjs` (`runnerRefusal`, a fixture of the Claude sign-in runner T53 retires, K5457), re-homing or retiring what it tests, and its `uses` drops agent-runner; it merges first in layer 6's AI group; (2) on that merge BOB moves agent-runner after ai-gate in `modules.json` and `MODULE_ORDER` (order-build regenerated, checks run) and adds agent-runner's `uses` ai-gate; (3) agent-runner's R44-R60 are `after ai-gate` and merge after (2) · P4, P10, P17; K5457, K5567, K5571
