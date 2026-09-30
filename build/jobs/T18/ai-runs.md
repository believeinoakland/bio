# ai-runs (T18)

**Status** · session_01LV5pqGyDdEdxkmNEcTKRqE · depth 2 · WORKING · handled B3

## J1 · REPORT

For run-rules' job (its R15 rows), so the rows and my sites agree at the merge. ai-runs mints R46–R47's six codes inside `open`, in two DEC-49 regions; I propose each row's `where`:

- `AI_RUN_PLAN_REQUIRED`, `AI_RUN_PLAN_UNEXPECTED`, `AI_RUN_PLAN_NEEDS_PROJECT`, `AI_RUN_PLAN_NEEDS_MEMBER`, `AI_RUN_PLAN_NO_SEARCH`: `src/ai-runs/index.mjs open > is-airun-open-plan, reached from op=airunopen`
- `AI_RUN_MODE_UNCHECKED`: `src/ai-runs/index.mjs open > is-airun-open-check, reached from op=airunopen`

I read them by key from run-rules' table (the same map its R11 rows of ai-runs' acts are in). If run-rules names its export something other than `AI_RUNS_CHECKS`, tell me in the CHANGE.

Done so far, before run-rules merges: N418 (every write through record-core's `transact`) and the ten converts' shares, pushed. Waiting on the CHANGE for the split's deletion and R46–R47's rows.

## J2 · QUESTION

Rule (9)'s deletion: three of the four files still have product importers outside my paths, and deleting them would break the plane's import (rule (6): no layer closes red).

- `ai-runs/checks.mjs`: imported by `control-plane/index.mjs:26` (`import * as M_AI_RUNS`, its CHECK_FAMILIES; layer 11).
- `ai-runs/deployment.mjs`: imported by `skilldoctrine.mjs:94` (skills, later in this layer).
- `ai-runs/skill-version.mjs`: imported through `airun.mjs` by `skillpack.mjs` (skills).
- Test importers also remain: `test/m/skills/doctrine.test.mjs` (skills) and the system tests `fleetbundles`, `machinefences-dec49` and `refusal-codes`. The old suites stay unrun (K653).

**My best reading, which I am building now:** `airun.mjs`, `ai-runs/checks.mjs`, `ai-runs/deployment.mjs` and `ai-runs/skill-version.mjs` each become a bare re-export of `run-rules`, with no code or rows of their own. The copies are gone, so no code is held twice. The re-exports are deleted by my next job, once skills (this layer) and control-plane (L11) have re-pointed.

If instead you want files deleted now, tell me which and who re-points their importers. `store.mjs`' `airun.mjs` imports I re-point to `run-rules` myself (§12.2).

The agent-worker bundle (§14) takes `airun.mjs`, `ai-runs/checks.mjs` and `deployment.mjs` as inputs, so it goes stale; that is yours at the close.
