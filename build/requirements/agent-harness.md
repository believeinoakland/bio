# agent-harness — requirements

**Status** · In force: reviewed (K1505; banner cleared K1599). Split from `agent-worker` by copy (K617, K1439; T33-54), meaning unchanged: R1–R7 name their `agent-worker` ids, R8 new. Last changed T34 (T34-37: R9); every requirement met (K1808).

| old (`agent-worker`) | new | |
|---|---|---|
| R13 | R1 | `CONTROL_FLOW`, `nextStep` |
| R14 | R2 | `gate-mode` |
| R15 | R3 | `stopBecause`, the pass limit |
| R16 | R4 | judgements, `JUDGEMENT_OVERREACH` |
| R20 | R5 | the report contract |
| R50 | R6 | `PLAN_FLOW` |
| R41 | R7 | invariant: one sub-session per level |
| — | R8 | new: pure |

**Size (P6).** `agent-worker/src/harness.mjs` 1,253 lines and `subsession.mjs` 588 (entries C, facts checked): about 1,850. Well under 4,000.

## Public

### Purpose

The deterministic control-flow tables an AI run walks, and the contracts of what a sub-session is sent and may return, as pure functions: the table decides every step, the pass count and the stop; a judgement may fill only the fields it is allowed; a report is held to an exact shape. It calls nothing, reads no clock and holds no state, so the Worker shell (`agent-worker`) and any test drive it alike.

### Provides

Terms. A **run state** is the plain object the shell passes in and receives back. A **judgement** is the model's answer inside one judged row. A **refusal** is `{ok:false, reason, code, detail}` with `reason` equal to `code`.

The control-flow table (`CONTROL_FLOW`, `nextStep`, pure):
- **R1** (was `agent-worker` R13) Rows `gate-mode`, `resume`, `plan`, `fanout`, `collect`, `compose`, `dedup`, `submit`, `adjust`, `next-pass`, `close`; each declares the steps it may go to, and `nextStep` never returns a step outside them. There is no edge from `compose` to `submit` and none from `submit` back to itself on a refusal. An unknown step closes with `completed` and says so.
- **R2** (was `agent-worker` R14) `gate-mode` is first. A mode that is not deployed closes the run with bound `mode-not-deployed` at its first step, after only the run and log reads (`agent-worker` R9, R11) and before any fan-out, request or suggestion; its log entry and close are still written; its `why` distinguishes a mode the table holds and has not deployed from a word it does not hold, and names the deployed modes. `check` is deployed; `investigate` and `extract` are not.
- **R3** (was `agent-worker` R15) Above every row after the gate, `stopBecause` asks `fetches`, `subsessions`, `wallclock` in that order and closes on the first whose consumed ≥ its positive allowance; an absent or non-positive allowance never stops a run. Then pass count ≥ the pass limit closes `completed`. The pass limit is the run's `max_passes` when positive, else 3; a pass counts when it is done (`next-pass`).
- **R4** (was `agent-worker` R16) Judgements are taken in order, one per judged row (`plan`, `collect`, `compose`, `dedup`, `adjust`); a row with none carries the state on. A judgement naming `pass`, `maxPasses`, `step`, `budget`, `mode`, `bound`, `run`, `store` or `target`: 400 `JUDGEMENT_OVERREACH` with `step` and `fields`. Only `targets`, `reports`, `candidates`, `queue`, `adjusted`, `submission`, `level`, `observed`, `governed`, `condition` are applied.

The report contract (`checkReport`, pure):
- **R5** (was `agent-worker` R20) A report has only the keys `level, state, observed_at, summary, citations, governed, condition`; `level` and `state` are required; `level` is one of the four; `state` one of `NEVER_LOOKED`, `LOOKED_ABSENT`, `LOOKED_INDETERMINATE`, `PRESENT`, `partial`; every state but `NEVER_LOOKED` needs `observed_at`; `PRESENT` and `partial` need a citation; at most 20 citations, each exactly `{address}`, non-empty, at most 200 characters; `summary` a string of at most 500; the whole at most `REPORT_MAX_BYTES`. Each breach is refused by its own code (`REPORT_UNKNOWN_FIELD`, `REPORT_INCOMPLETE`, `REPORT_LEVEL_UNKNOWN`, `REPORT_STATE_UNKNOWN`, `REPORT_UNLOCATED`, `REPORT_NO_CITATION`, `REPORT_OVER_BOUND`, …).

Mode `plan`'s table (K660; `BIO_Action_v0_1.md` §4):
- **R6** (was `agent-worker` R50; §4 rules 1, 3, 8; K660 (1), (3)) Mode `plan` walks its own control-flow table, `PLAN_FLOW`, pure and held beside `CONTROL_FLOW`: rows `gate-mode`, `resume`, `read`, `compose`, `dedup`, `submit`, `adjust`, `close`; one pass (R3's pass limit is 1 for this table); `stopBecause` asks `proposals` then `wallclock`. It has no `fanout`: it calls no `airunspawn`, `capturerequest` or `suggest`, makes no fetch and drafts no communication.

## Private

### Uses

- `runtime-limits`, as Rule 3's table names it. Neither `harness.mjs` nor `subsession.mjs` imports anything outside the two files today (checked on `tranche/T32`); see Suggestions.

### Invariants

- **R7** (was `agent-worker` R41) Sub-sessions run, one per level, each under its spawn contract (`agent-worker` R17) and returning only reports (R5).
- **R8** (new; Q0-1) Every export of this module is pure: it makes no network call, reads no binding, environment, clock or storage, and keeps no state between calls, so the same arguments always give the same answer. A test calls each exported function twice on equal inputs with the global `fetch` and `Date.now` replaced by throwing stubs and finds equal answers and no stub called.
- **R9** (N586; K1615) It exports none of `PLANE_OPS`, `NAMESPACES` and `MEANING_ARM`: the run's plane ops, the namespace list and the meaning arm are `agent-worker`'s (its R37, R4, R44, R19 and R22), declared once there, so no name is declared in both modules. A test imports each of this module's files and finds none of the three among their exports.

### Satisfies

- `docs/development/INVESTIGATIVE-SESSION.md` §14b.1 (reports, never documents), §14b.4 (scripted and judged), §14b.6 (bounded, the bound recorded), §14 (the search half never receives the lens).
- `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` §3 rules 4, 5 and 10.
- `docs/architecture/BIO_Action_v0_1.md` §4 rules 1, 3 and 8 (R6; K660).
- `docs/architecture/BIO_Capability_Ladders_v0_1.md` §9.4 (Q0: the `agent-worker` split, K1439); §10 "A module fits in one reading" (P6, K617).
- DEC-24, DEC-55; D-112, D-199.

### Suggestions

- **Files.** `agent-harness/src/harness.mjs` and `subsession.mjs`, copied byte for byte, with `agent-worker`'s `index.mjs` importing from here once re-pointed (T33-57). Tests: `harness.*`, `fanout.*`, `versions.*` and the R44 parts of `wire-vocabulary.*` move with the files, the R13–R16, R20, R41, R50 cases of `agent-worker.test.mjs` and `plan.test.mjs` with them.
- **Open for BOB (the seam's edge).** Three things live in `harness.mjs` but belong to requirements T33-54 does not list as moved: R39 (no judgement sets control; enforced by `applyJudgement`, R4 here), R44's copies (`LEVELS`, `REPORT_STATES`, `REPORTING_LEVEL`, `NAMESPACES`, `MODES`, held in these two files) and R52's judged fields (`applyPlanJudgement`, `PLAN_JUDGEABLE`, `planDedup`). The draft leaves them in `agent-worker`; moving R39 and R44's copy test here would keep each requirement beside its code. `PLANE_OPS` (R37) was also declared in `harness.mjs` and stays `agent-worker`'s requirement; with `NAMESPACES` and `MEANING_ARM` it now lives in `agent-worker`'s `ops.mjs`, and R9 removes the copies here (T34-37).
- **`runtime-limits` in `uses`.** Rule 3 names it; no import exists. Either drop the edge or name the export used (BOB's).
- Keep R8 a test of the module, not a lint: the stubbed globals make it checkable at the interface.
