# skills (T10)

**Status** · session_016cFZMMXBeCHF8P3yJzn3ua · depth 2 · WORKING · handled B2

## J1 · QUESTION

N156 / R25: where does C-22.7's row live? As worded it cannot move into skills.

The facts. ai-runs holds the predicate that mints C-22.7 (`src/ai-runs/skill-version.mjs` `checkSkillVersion`, ai-runs R8; K82 (4), K194), and it builds the refusal from the row it reads out of the catalogue's `AI_RUN_CHECKS`. N156 says the row moves from the catalogue to skills (my R25). ai-runs is earlier in the order than skills, so once the row is in skills' paths ai-runs cannot read it (P4), and removing it from the catalogue leaves `refusal()` reading `undefined` (ai-runs R8 broken, and the DEC-49 row's `where` pointing at a site that no longer mints it). The catalogue cannot re-export it from skills either: `bio-checks.mjs` imports nothing, and `skilldoctrine.mjs` imports the catalogue, so that would be an import cycle evaluated at load.

My best reading (proposal): C-22.7 is held with its one minting site, in ai-runs (`ai-runs/checks.mjs`, its `where` re-pointed to `src/ai-runs/skill-version.mjs checkSkillVersion, called from src/ai-runs/index.mjs open`), as observation-log's map placed each C-22 row with its predicate and as DEC-49's one code, one site reads. skills then names it by key through ai-runs (`SKILL_CHECKS` selected from `airun.mjs`' `AI_RUN_CHECKS`, never copied), and R25 is reworded: "C-22.7 is named here by key from ai-runs, which holds the row with its predicate (R12); code, number and translation unchanged." That is ai-runs' change (its R35 and R8 wording, and AI-RUNS #3's code), so it is yours to place.

Meanwhile, on this reading, I am doing the rest of N156 now: `skillpack.mjs` re-exports ai-runs' `checkSkillVersion` and `parseSkillVersion` and deletes its copy; `SKILL_CHECKS` is re-pointed to read the row from ai-runs' `AI_RUN_CHECKS` (the same object the catalogue holds today, so nothing moves under anyone); `skilldoctrine.mjs`' `DEPLOYMENT_SEQUENCE`, `GATE_ADDRESS`, `SEQUENCING_SOURCE` and `SEQUENCING_ALSO_NAMED_IN` re-export `ai-runs/deployment.mjs` (through ai-runs' index) and its copy goes. R25's test holds the row's code, number and translation unchanged and that `SKILL_CHECKS` is the row `checkSkillVersion` mints; the clause "held in skills' paths" is a `test.todo` naming this question until you answer. The catalogue row itself I leave untouched.

If instead you rule the row does move into skills' paths, it needs ai-runs to stop minting it (the predicate moving back to skills, reversing K82 (4)), and I would build that on your word.

## Completion (SKILLS #2)

**Entries applied.** N156, skills' share, on K333 (B2):
- `skillpack.mjs` re-exports ai-runs' `checkSkillVersion` and `parseSkillVersion` from `airun.mjs` (ai-runs R8) and deletes its own copies and its `refusal()` helper (R12, R13).
- `skilldoctrine.mjs` re-exports `DEPLOYMENT_SEQUENCE`, `GATE_ADDRESS`, `SEQUENCING_SOURCE` and `SEQUENCING_ALSO_NAMED_IN` from `ai-runs/deployment.mjs` (ai-runs R44) and deletes its copy; the rendered `deployment_sequence` layer carries ai-runs' object, `enforced_by` `["C-109.1"]` (R18, now met). The import is the leaf file, not ai-runs' index, which keeps the plane's store out of the pack's import chain (N157). J1 said "through ai-runs' index"; the leaf file is what was built.
- C-22.7: `SKILL_CHECKS` selects the row by key from `airun.mjs`' `AI_RUN_CHECKS`, no longer from the catalogue directly (R25 as reworded, K333). The catalogue and ai-runs are untouched (N289 moves the row next tranche).
- Tests: R18 re-anchored to ai-runs' object (identity) and C-109.1; R12/R13 hold that the predicates are ai-runs' own functions; R25 as reworded (the row is ai-runs' own object, code, number and translation unchanged, and the row `checkSkillVersion` mints).

**Deferred.** None of this module's. R10 stays not met: the plane publishes no surfaces or recipes (SK-5, N144).

**Found in other modules (reported in J2):**
1. legacy-checks: the catalogue row C-22.7's `where` still reads `src/skillpack.mjs checkSkillVersion, called from store.mjs aiRunOpen`. N156 deleted that site, so the DEC-49 guard (`civicos-ui/check-refusal-codes.mjs`) now fails once more: "arm C could not find function checkSkillVersion in src/skillpack.mjs" (79 → 80 failures; the other 79 were there before). The one mint is `src/ai-runs/skill-version.mjs checkSkillVersion, called from src/ai-runs/index.mjs open`. It is a one-line re-point, or it rides with N289.
2. legacy-tests: `bio-plane/test/skillsequencing.test.mjs` goes from 26/1 to 24/3. ARM C4 (`enforced_by` empty), F1 (the instruction-only count) and F2 (the old "does not reach the RECORD" residue) pin the retired copy. N156 says these pins move with it (AI-RUNS #2 J6.3). The baseline's one red is unchanged.
3. agent-worker (generated artifact, §14): `agent-worker/dist/agent-worker.bundled.mjs` is stale; `requirements.test.mjs` R45 fails on its two freshness arms (inputs `skillpack.mjs`, `skilldoctrine.mjs`). R48's behaviour passes. BOB regenerates.
4. agent-worker: `agent-worker/test/harness.test.mjs` crashes at 315 ("the plane's OBSERVATION_LEVELS block was actually found": false), the same before and after this change. It reads the plane's source for a block that has moved (observation-log). It is not caused by this job.

**Tests and checks run** (merged tree, `tranche/T10` @ 5f485b72c9):
- `node --test bio-plane/test/m/skills/`: tests 30, pass 30, fail 0, todo 0 (baseline at start 29/0).
- `node --test bio-plane/test/m/ai-runs/`: pass 41, fail 0 (unchanged).
- agent-worker: `agent-worker` 139/0, `wire-vocabulary` 83/0, `versions` 22/0 (all unchanged); `requirements.test.mjs` R45's two bundle-freshness arms red (item 3).
- legacy: `skillpack.test.mjs` 49/0 (unchanged); `skillsequencing.test.mjs` 24/3 (item 2).
- `node checks/format.mjs`: 0 failures. `architecture.mjs … skills`: 6 product files, 29 relative imports, 0 failures. `coverage.mjs … skills`: 26 of 26 live requirement ids named by a test, 0 failures. `ownership.mjs … skills tranche/T10`: 5 files changed, legacy-checks 0 added, 0 removed, 0 failures.

Size (session_016cFZMMXBeCHF8P3yJzn3ua): test runs 6, module lines 1496

## J2 · REPORT

Four items outside skills, found while applying N156 (details in my record's Completion section):
1. legacy-checks: the catalogue row for C-22.7 still has `where` 'src/skillpack.mjs checkSkillVersion, called from store.mjs aiRunOpen'. N156 deleted that site, so the DEC-49 guard now fails once more (79 → 80): "arm C could not find function checkSkillVersion in src/skillpack.mjs". The one mint is `src/ai-runs/skill-version.mjs checkSkillVersion, called from src/ai-runs/index.mjs open`. It is a one-line re-point, or it goes with N289.
2. legacy-tests: `skillsequencing.test.mjs` goes from 26/1 to 24/3. ARM C4, F1 and F2 pin the retired copy (`enforced_by` empty, the old residue). These are N156's "pins moving with it".
3. Generated artifact: `agent-worker/dist/agent-worker.bundled.mjs` is stale (inputs `skillpack.mjs`, `skilldoctrine.mjs`); agent-worker `requirements.test.mjs` R45's two freshness arms are red. R48's behaviour passes.
4. agent-worker: `test/harness.test.mjs` crashes at line 315 (the plane's `OBSERVATION_LEVELS` block not found in the source it scans), the same before and after this change.
