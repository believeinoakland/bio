# skills — extraction map

**Status** · Measured 2026-09-26 on `tranche/T3` @ `062e69f6` by a drafting worker for BOB #42 (P18). Line ranges are `grep -n`-verified in `bio-plane/checks/bio-checks.mjs` (15,682 lines) and `bio-plane/src/store.mjs`; the extraction job confirms them. The contract is `build/requirements/skills.md` (R1–R26); K6 and K17 apply. The module's code already sits at its paths (`skillpack.mjs`, `skilldoctrine.mjs`); only one catalogue row moves. `from` should read `["legacy-checks"]`. Nothing moves from `store.mjs`, `schema.mjs` or `index.mjs`.

## 1. What moves to `skills`

| what | where today | lines | moves |
| --- | --- | --- | --- |
| `AI_RUN_SKILL_VERSION_UNNAMED` (C-22.7), with its comment block | bio-checks.mjs, inside `AI_RUN_CHECKS` | 6307–6332 | yes (R25), split from `AI_RUN_CHECKS` by the first job to move (as `observation-log`'s C-22 rows), code, number and translation unchanged; its `where` stays `src/skillpack.mjs checkSkillVersion` |

**Measured size:** 26 lines (6 of code).

## 2. What stays, or goes elsewhere

| what | where today | goes to | why |
| --- | --- | --- | --- |
| `import { checkSkillVersion }` and its call in `aiRunOpen` | store.mjs 433, 43956 | `ai-runs` | the open is the run's; it calls R12 |
| `AI_RUN_CHECKS`' other rows (C-22.5, C-22.8, C-22.11–C-22.16) | bio-checks.mjs 6236– | `ai-runs` (and `observation-log` for C-22.1–C-22.4, C-22.6, C-22.9, C-22.10) | the run object's own refusals |
| `SUGGEST_LEVELS`, `SUGGEST_CHECKS`, `MACHINE_FENCE_CHECKS`, `EARNED_GRADE_SOURCES`, `VERSION_STRENGTH_INERT_SOURCES`, `BASIS_ROLES`, `VERSION_STRENGTH_CHECKS`, `BASIS_VERSION_CHECKS` | bio-checks.mjs | their own modules' extractions | imported here, never owned; `skilldoctrine.mjs` re-points each import when its family moves |
| `decorateAct`'s `machine` act mode | index.mjs | `control-plane` / `affordances` | the pack reads it from `op=affordances`' answer |

## 3. Callers to rewire

- `airun.mjs` re-exports `AI_RUN_CHECKS`, which `skillpack.mjs` reads for the `refusals` layer and `refusal()`; after the split, `skillpack.mjs` imports C-22.7's row from its own file and the rest of `AI_RUN_CHECKS` from `ai-runs`.
- `bio-plane/test/airun.test.mjs` ARM D1 counts the C-22 family ("SIXTEEN C-numbers") and filters rows by `where`; it follows the split.

## 4. Old-battery tests that anchor on the moved source

`skillpack.test.mjs` (the `refusals` layer and C-22.7), `airun.test.mjs` (D1), `airun-contextkind.test.mjs` and `aicredential.test.mjs` (they drive C-22.7 at the open), and `civicos-ui/check-refusal-codes.mjs` (it walks `bio-checks.mjs` for every translated code).

## 5. Undetermined

1. Whether C-22.7 belongs here or with `ai-runs`: its predicate is here (`checkSkillVersion`), its caller is `ai-runs`' open. Proposed here, where the predicate and its test are, as `observation-log`'s map places each C-22 row with its predicate.
