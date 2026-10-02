# run-rules — requirements

**Status** · DRAFT by a worker for BOB #75, 2026-09-30, on `tranche/T18` before layer 6 starts, for BOB's review; split from `ai-runs` by K617 and K649 (1) (a module whose code, or whose job, would pass about 4,000 lines is split before its next job, along seams BOB names, with no change to any requirement's meaning). R1–R8 are `ai-runs` R1–R8 and R9 is `ai-runs` R44, moved with their meaning unchanged (only their cross-references re-pointed; the old id is named on each; `ai-runs` retires each as moved). R10 is the share of `ai-runs` R45 that states the figure and its one check (`checkRunState`), and R11 the share of `ai-runs` R35 that holds the rows, both held with the code that moves here; `ai-runs` R45 and R35 keep the open's, the tick's and the acts' shares. R12 states for this module what `ai-runs` R39 states for its own. Layer 6, directly before `ai-runs`. No `from`: this module takes no catalogue row (its table, `ai-runs/checks.mjs`, left the catalogue at `ai-runs`' extraction; C-22's observation-log rows are read from `observation-log`, which holds C-22 since its T18 job). Its code is `bio-plane/src/airun.mjs`, `ai-runs/checks.mjs`, `ai-runs/deployment.mjs` and `ai-runs/skill-version.mjs`, taken by copy (K624 (1)): this module's job copies them (the copy's `AI_RUN_CHECKS` import re-pointed from the catalogue to `observation-log`'s C-22) and merges early for `ai-runs`, `run-productions`, `capture-requests`, `skills` and `agent-worker`; `ai-runs`' own job, after it, deletes the four files, leaving `airun.mjs` a re-export of this module for importers not yet re-pointed, deleted by `ai-runs`' next job. **Planning skill folded (K660)** by a worker for BOB #75, 2026-09-30, from `build/plan/draft-planning-skill.md` §2 as Bob ruled it: R13 (the `proposals` bound, amending R1 and R3), R14 (`plan` in the deployment order, deployed as soon as `agent-worker` runs model turns, amending R9) and R15 (the new codes' rows, amending R11) added. R13–R15 (new, K660) are met, each named by a passing test (RUN-RULES #5, T24).

**Size (P6).** About 1,590 lines copied (`airun.mjs` 898, `ai-runs/checks.mjs` 502, `deployment.mjs` 124, `skill-version.mjs` 66). Well under the mark; `ai-runs` keeps about 2,650.

## Public

### Purpose

The AI run's rules without a store: the bounds, endings and statuses a run can have, the checks a bound, a consumption, a principal, a context and a skill version must pass, the size a run's resumable state may reach, the one deployment order of the run's modes, and the rows of every refusal a run's acts carry. Pure: no storage, no clock, no viewer. `ai-runs`, which holds the run itself, and every module that produces under a run read them here.

### Provides

**The vocabulary and pure rules: RUN_BOUNDS, RUN_ENDINGS, RUN_STATUS, RUN_NEVER_STARTED, runStatusFor, STANDARD_BASIS, RUN_CONTEXTS, checkBound, checkConsume, PLANE_COUNTED_BOUNDS, PLANE_DECIDED_BOUNDS, finishedBound, projectGate, PROJECT_GATE_GROUNDS, runConsultsProjects, checkRunContextKind, runPrincipalOf, runPrincipalGate, checkSkillVersion, parseSkillVersion, translationOf, AI_RUN_CHECKS** Pure; never throw.
- **R1** (was `ai-runs` R1) The bounds and endings are exactly those above; `runStatusFor` answers `never-started` for `mode-not-deployed`, `stopped` for a bound, `finished` otherwise.
- **R2** (was `ai-runs` R2) `checkBound`: a name that is neither a bound nor an ending is `AI_RUN_BOUND_UNNAMED` (C-22.5).
- **R3** (was `ai-runs` R3) `checkConsume` (list form at open, map form at tick): a non-list or non-map shape, or an unknown bound, is `AI_RUN_BOUND_UNKNOWN` (C-22.15); any figure for `lease`, or a non-zero figure a caller sends for `mints` or `surfaces`, is `AI_RUN_BOUND_PLANE_COUNTED` (C-22.14); a declared allowance absent or zero is `AI_RUN_BOUND_NO_ALLOWANCE` (C-22.16); a figure that is not a non-negative safe integer is `AI_RUN_CONSUME_INVALID` (C-22.13).
- **R4** (was `ai-runs` R4) `finishedBound`: an offered bound wins; else the first exhausted bound (allowed above 0, consumed at or past it) in R1's order; else `lease` when expired; else `completed`.
- **R5** (was `ai-runs` R5) `runPrincipalGate` compares caller and principal with a member credential's `/<tokenId>` removed; equal and non-empty passes, anything else is `AI_RUN_NOT_PRINCIPAL` (C-22.12) naming the act.
- **R6** (was `ai-runs` R6) `projectGate`: no actor passes unapplied (`NO_MEMBER_BEHIND_CALLER`); an inquiry context passes unapplied (`INQUIRY`); a project context passes when the actor has joined one of its projects (`PARTICIPANT`), else `AI_RUN_NOT_PROJECT_MEMBER` (C-22.8).
- **R7** (was `ai-runs` R7) `checkRunContextKind`: a context type outside `RUN_CONTEXTS`, or a context whose held kind (an unseen one is absent) differs, is `AI_RUN_NO_SUCH_CONTEXT` (C-22.11).
- **R8** (was `ai-runs` R8) `checkSkillVersion`: a blank version, or one not `<pack>@<edition>`, is `AI_RUN_SKILL_VERSION_UNNAMED` (C-22.7); any well-formed version is accepted, current pack or not. Held here and re-exported by `skills` (K82 (4)).

**DEPLOYMENT_SEQUENCE, GATE_ADDRESS, DEPLOYED_MODES, DEFAULT_MODE** (N156, K182 (3))
- **R9** (was `ai-runs` R44) (K182 (3), N156) `DEPLOYMENT_SEQUENCE`, the one deployment order: `order` `["check", "investigate", "extract"]`, `first_deployed_mode` its first member, `enforced_by` `["C-109.1"]` (`ai-runs` R40's refusal), and `GATE_ADDRESS` naming `agent-worker`'s gate. `skills` and `agent-worker` re-export it and hold no copy.
- **R13** (K660 (2); amends R1 and R3) `RUN_BOUNDS` gains `proposals`, after `surfaces`: the number of proposals a planning run may make, consumed by `action-plans` (its R31) through `ai-runs.consumeBound`. It is counted by the plane, as `mints` and `surfaces` are: a non-zero figure a caller sends for it is `AI_RUN_BOUND_PLANE_COUNTED` (R3). Its allowance is the one the run declares at the open; no figure of five or any other caps it here: five is the size of a page of the member's tray (`action-plans` R34), not a bound.
- **R14** (K660 (5); amends R9) `DEPLOYMENT_SEQUENCE.order` becomes `["check", "investigate", "extract", "plan"]`. `plan` is deployed as soon as `agent-worker` runs model turns (its R40 and R48 met), whether or not `investigate` or `extract` is deployed, with no separate act of Bob's: the reviewed change that meets those Rs sets `plan` deployed here (`DEPLOYED_MODES`) and in `agent-worker`'s `MODES` together (its R42, R53). Until then an open in mode `plan` is refused by `ai-runs` R40 (C-109.1).

**AI_RUN_STATE_MAX_BYTES, checkRunState(state)** (N293, REC-169)
- **R10** (was `ai-runs` R45's share) `AI_RUN_STATE_MAX_BYTES` is 262,144: the most a run's `state` may hold, measured as the UTF-8 length of its JSON. `checkRunState(state)` answers null for an absent or null `state` and for one within the figure, else `AI_RUN_STATE_TOO_LARGE` (C-22.18, a row in this module's own table, R11), naming `bytes` and `limit`: the one site that mints the code, which `ai-runs`' open and tick relay (its R45). Pure; never throws.

## Private

### Uses

- `observation-log`: `AI_RUN_CHECKS`' observation-log rows (C-22.1–C-22.4, .6, .9, .10, .17), read into `AI_RUN_CHECKS` beside this module's own (R11); the observation log's vocabulary, which `airun.mjs` re-exports for its readers until they re-point.

### Invariants

- **R11** (was `ai-runs` R35's share) Each refusal R2–R8 and R10 mint carries its row, and the rows of `ai-runs`' acts are held here with them, each with its code, number, translation and reasons unchanged, in this module's own table (`checks.mjs`): C-22.5, C-22.7, C-22.8, C-22.11–C-22.16, C-22.18 (minted here), and C-33.29–C-33.31, C-33.45–C-33.47, C-36.1–C-36.3, C-66.1–C-66.4 (minted by `ai-runs`, which reads them here by key and states each as its own invariant, its R35). C-22.7's row is held beside its one minting site, `checkSkillVersion` (R8), its `where` naming this module's `skill-version.mjs checkSkillVersion`; `skills` names it by key through this module and holds no copy (its R25; K333, N289). `AI_RUN_CHECKS` answers observation-log's C-22 rows and this table's as one map, and `translationOf(code)` a received code's translation from it, or null. Each row whose `where` changed was stamped by 1.49.0.
- **R12** (as `ai-runs` R39 states for its own) No place is named in this module's behaviour or outward text.
- **R15** (K660; amends R11) The rows of `ai-runs` R46–R47's codes (`AI_RUN_PLAN_REQUIRED`, `AI_RUN_PLAN_UNEXPECTED`, `AI_RUN_PLAN_NEEDS_PROJECT`, `AI_RUN_PLAN_NEEDS_MEMBER`, `AI_RUN_PLAN_NO_SEARCH`, `AI_RUN_MODE_UNCHECKED`) join this module's table, each with its number and translation, minted by `ai-runs` and read by it here by key (as R11's `ai-runs` rows are). `action-plans`' planning codes (its R30, R31, R34) are rows of its own table, as its R22's is, since this module holds no later module's rows.

### Satisfies

- `docs/development/INVESTIGATIVE-SESSION.md` §11 (the run is an object), §14b items 4, 6 and 7 (every "may not" a refusal, bounded, partial results).
- `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` §3 rules 1–5 (the principals), §7.3 (the `mints` bound).
- Bob's DEC-63 (the project gate's grounds).
- `BIO_Action_v0_1.md` §4 rule 1 (the planning run: R13–R15; K660).
- `build/layers.md`, layer 6's contract.

### Suggestions

- **The seam (K649 (1)).** The four files import nothing from `ai-runs/index.mjs`, only the catalogue, `observation-log/vocabulary.mjs` and each other. Their later importers re-point in their own T18 jobs: `ai-runs/index.mjs` and `store.mjs` (ai-runs' job, §12.2), `run-productions`, `capture-requests`, `skillpack.mjs` and `skilldoctrine.mjs` (skills), `agent-worker/src/index.mjs` and `harness.mjs`; `control-plane`'s `CHECK_FAMILIES` reads this module's table.
- **Tests.** The tests under `test/m/ai-runs/` that name R1–R8, R44 and R45's figure move here renamed to this module's ids; each refusal gets a negative control. The converts that prove the moved Rs are taken from `ai-runs`' list (`current.md`) by this module's job.
- **Tests for K660.** R13: `proposals` in `RUN_BOUNDS` after `surfaces`, a caller's non-zero figure refused as plane-counted (control: an unknown bound still refused `AI_RUN_BOUND_UNKNOWN`). R14: `plan` last in the order and not deployed today (control: `check` still deployed). R15: each new code has its row and translation.

## Open for Bob

None: the split is BOB's (K617, K649).
