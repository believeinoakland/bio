# ai-runs (T18)

**Status** · session_01LV5pqGyDdEdxkmNEcTKRqE · depth 2 · COMPLETE · handled B5

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

## J3 · COMPLETE

**Entries applied** (layer 6, ai-runs):

- **The split's deletion (rule (9), K676 (1)).** `airun.mjs`, `ai-runs/checks.mjs`, `ai-runs/deployment.mjs` and `ai-runs/skill-version.mjs` are now bare re-exports of `run-rules`; no code or row is held twice.
  - `ai-runs/index.mjs` reads everything from `run-rules` and no longer re-exports its names. Its acts' rows are read by key from run-rules' `AI_RUNS_CHECKS`.
  - My next job deletes the four re-exports.
- **N418 (K650).** Every write goes through record-core's `transact`: the open, the tick, the one exit, the hold and the wake, a failed dispatch's entry, `consumeBound` and the surfacing step. No `transactionSync` is left in the module.
- **R46, R47 (K660): both met.**
  - R46: `open` takes `plan`, stored verbatim in a new `ai_runs.plan` column (a migration adds it to an existing table). `read` and `runFor` answer it on a plan-mode run only.
  - R46's refusals, in order after R40: `AI_RUN_PLAN_REQUIRED`, `AI_RUN_PLAN_UNEXPECTED`, `AI_RUN_PLAN_NEEDS_PROJECT`, `AI_RUN_PLAN_NEEDS_MEMBER`, `AI_RUN_PLAN_NO_SEARCH`. Each is written as a literal in DEC-49 region `is-airun-open-plan`.
  - R47: `registerOpenCheck(module, mode, fn)`, refused through `listenerRefusal`. The check is applied last, before the write, and its refusal is passed on unchanged.
  - Fail closed: a planning run with no check registered, or a check that throws or answers neither null nor a refusal, is refused `AI_RUN_MODE_UNCHECKED` (region `is-airun-open-check`).
  - Please strike R46's and R47's `not yet met` marks (rule (5)).
- **R27 (K674).** A question with no surfacing row answers inquiry's `migratedSurfacing(bundleId)` when that is not null, else "not recorded". It is reached lazily through `inquiryOf`, and any throw reads as null. It is tested against a stub at my interface, so inquiry need not merge early.
- **Converts.** ai-runs' shares of `airuns`, `d260-resume`, `run-conditions`, `airun`, `observation-log`, `project-disclosure`, `extractrun`, `skillpack` and `rec173-migration-replay` are in `test/m/ai-runs/converts.test.mjs`.
  - `skillsequencing` has no ai-runs share left: R1 and R44 went to run-rules, and the mode-not-deployed closure is agent-worker's.
  - d260's "real agent-worker end to end" arm is outside this module's tests.
- **Tests moved out.** The tests of the moved Rs are deleted here, since run-rules holds them: `words.test.mjs` (R1–R8), R44 in `hidden-notices` and R45's figure in `state`. `rows.test.mjs` restates R35 (every code this module's acts mint, C-109.1–.7 included) and R39 for this module.

**Decisions (technical, mine):**
- `aiRunsOf(ctx, env, deps)` takes in-process `deps` only, never from the wire or `env`: `inquiry` (R27) and, for module tests alone, `deployedModes`. That is how R46–R47's arms past R40 are tested while `plan` is not deployed. Production passes neither.

**Not done, and why:**
- **`store.mjs`' `airun.mjs` imports are not re-pointed to run-rules, although B4 asked for it.** The ownership check refuses it: the lines add imports from a path that is not this module's, and the legacy net change was +4/−4. So I reverted rather than work around the check. `store.mjs` reads the same names through the `airun.mjs` re-export, so behaviour is identical. If you want the re-point, it is yours or legacy-store's (L10), or tell me the exception.

**Found in other modules:**
- **skills (this layer).** `test/m/skills/doctrine.test.mjs` R18 pins `DEPLOYMENT_SEQUENCE.order` without `plan`. `version.test.mjs` R25 pins C-22.7's `where` to `src/ai-runs/skill-version.mjs`. Both now read run-rules' values: `plan` appended by R14, and the `where` naming `src/run-rules/skill-version.mjs`. So both fail until skills re-points: 31 pass, 2 fail, against 33/0 before.
- **control-plane.** `test/m/control-plane/`: 79 pass, 1 fail (R36, capture's pull). The same failure is on the tranche branch without my change.
- **agent-worker.** `agent-worker/test/`: 5 files fail both with and without my change (same count).
- **Bundles (§14).** The plane and agent-worker bundles are stale; yours at the close (B4).
- **The DEC-49 guard (release only).** R47 relays another module's refusal by spread (`{ run, started: false, ...refusal }`), as R47's "unchanged" requires. The guard may read a spread relay as a code it cannot see.

**Tests and checks:**
- `node --test test/m/ai-runs/`: tests 55, pass 55, fail 0.
- `test/m/run-rules/`: 16/0.
- Users of ai-runs: run-productions 35/0, capture-requests 62/0, intent 51/0, scheduler 46/0, queue-producers 27/0, skills 31/2 (above), control-plane 79/1 (pre-existing).
- `format`: 0 failures. `architecture ai-runs`: 0 failures. `coverage ai-runs`: 38 of 38 live ids named, 0 failures. `ownership ai-runs tranche/T18`: 0 failures.

Size (session_01LV5pqGyDdEdxkmNEcTKRqE): test runs 24, module lines 2,715
