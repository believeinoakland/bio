# agent-model (T50)

**Status** · session_0123prY1gzJUGUmHHxUyixGp · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied.** T50-67 · R23: `judgeTools(levels, conditions?)` makes `condition` of `judge_plan` and `judge_compose` an enum of the list handed in (a free string when none or an empty list); `judge_dedup`, `judge_adjust` and `read_facts` carry none; the module lists no condition and imports nothing from the plane. R24: `judge_compose` alone offers `disagreements` (at most 10 `{record, levels: [level, level]}`, `levels` the enum of the levels handed in, described as naming a record only where two levels' reports contradict each other); `judge_plan` and `planJudgeTools` carry none. Tests `R23` and `R24` added to `agent-model/test/agent-model.test.mjs`, each with its control.

**Deferred.** Nothing. Note on plan rule 6: the two tool descriptions are model-facing text in the module's existing English, like every other tool description here; no sentence a person reads was added.

**Found in another module.**
- `agent-worker`: its generated bundle `agent-worker/dist/agent-worker.bundled.mjs` (and `.bundle.json`) is now stale, because it inlines `agent-model/src/model.mjs`. `agent-worker/test/requirements.test.mjs` R45 ("the static check finds nothing", "a fresh build is byte-identical") fails until BOB regenerates it (`agent-worker/`: `npm run build`); with my change stashed it passes (304/0).
- `agent-harness` must pass `CONDITION_KINDS` as `judgeTools`' second argument (its R19 / R11 reading); the call site is not mine.

**Tests and checks.**
- `node --test agent-model/test/`: 33 pass, 0 fail.
- `node --test agent-harness/test/ agent-worker/test/`: 72 pass, 1 fail (agent-worker `requirements.test.mjs` R45, the stale bundle above).
- format: 171 modules, 170 requirements files; 0 failures. architecture (agent-model): 5 product files, 6 relative imports; 0 failures. coverage (agent-model): 24 of 24 live requirement ids named by a test; 0 failures. ownership (agent-model vs tranche/T50): 1 file changed by agent-model (plus its test); 0 failures.

Size (session_0123prY1gzJUGUmHHxUyixGp): test runs 6, module lines 1038

## J1 · COMPLETE

T50-67 applied: R23 (judgeTools names the record's conditions) and R24 (judge_compose offers disagreements), tests R23/R24 with controls. Module tests 33/0; format, architecture, coverage (24/24), ownership all 0 failures. REPORT: agent-worker's generated bundle is stale (it inlines agent-model/src/model.mjs); its requirements.test.mjs R45 fails until BOB regenerates it (agent-worker/: npm run build). agent-harness must pass CONDITION_KINDS as judgeTools' second argument. Details in my record.
