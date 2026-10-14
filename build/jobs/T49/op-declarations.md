# op-declarations (T49)

**Status** · session_011hPuqD9y49HjQBBqnz9ub8 · depth 2 · WAITING ON BOB (J1) · handled B3

## Work notes (OP-DECLARATIONS #24, 2026-10-14)

**How the reading set was read (mechanics §17, K3271).** Whole: `build/requirements/op-declarations.md`; the plan's rules and entry T49-17; `build/extraction/op-declarations-split.md` and the fold drafts' op-declarations sections; the module's `index.mjs` apart from the 323 hand-written `NEEDS` rows being moved (read as the row list's header, tail and the composition seam, not row by row: `op-capabilities` holds them verbatim, R1), `t45.mjs`, `t47.mjs`; the tests that name a requirement I changed (`tables`, `t33`, `t34`, `t36`, `t37`, `t38`, `t42`, `t45`–`t48` at the lines named in each failure). The other tests were run, not read. The used modules' services (membership's and project-roster's ops maps, affordances' `ACT_HELP`, credentials' `AI_GRANT_OPS`) were read at the arms my entries touch only.

**Measured first.** The module's own code: 4,026 lines at the opening (`index.mjs` 3,731, `t45`–`t48` 295). Composed `{...needsRows(), ...FAMILY_NEEDS}` with `aliasRows` applied deep-equals today's `NEEDS` before any delete: 323 hand rows + 500 family rows (498 + `founderhandleset` and `projectownervotes`) + 27 alias rows = 850 keys (848 + the two), no key in both parts, same keys, same values. `founderhandleset`'s kind (`founder`, a new kind; see below) gives a present `null` row.

**Entries applied so far.**
- R3: `NEEDS` = `Object.freeze(aliasRows(composeNeeds(needsRows(), FAMILY_NEEDS)))`. The 913 moved lines are deleted; `compose.mjs` (13 lines) refuses a family row for a hand-written op by name (the spread's silent override is gone). `index.mjs` 3,731 → 2,844; module 4,026 → 3,167 with `t49.mjs`, `compose.mjs`.
- R71: kind `founder` (classes `admin`, `machineClasses: []`, mutating, `null`, `founderOnly`) in `OP_KINDS`; `founderhandleset` in membership's family through `t49.mjs`' `T49_SHARES`; in `SESSION_OPS.admin` alone (`FAMILY_FOUNDER_OPS`, internal; `FAMILY_SESSION_OPS` still means "both sets"). Stamps `by`, `viewer`; `handle` is the body's (membership's map reads it). `claim` unchanged.
- R72: `projectownervotes` in project-roster's family, kind `ownread`, through `T49_SHARES`; named in `ACT_HELP_ABSENT.read`.
- `ACT_HELP_ABSENT`: `peopledirectory` removed (affordances' `ACT_HELP` has held its text since T47; the old test pinned it absent: a K3321 (B) red); `founderhandleset` named under `unexplained` until `ACT_HELP` holds it (R71).
- K3321 (B), the 10 reds cleared against PR #36's registry: `t34`:R21/R27 and `t37`, `t38`, `t46`, `t47`, `t48` re-pinned (119 function acts, 85 distinct, each an op or alias; owed acts: `founderhandleset` declared by R71, `passwordresetlink` and the three update acts declared, and five whose ops T49 leaves out named in each test as `LEFT_OUT`, with a control that any other owed act with no spec is seen); `t47`: `passwordreset` and `unlock` are `function` acts now; `peopledirectory` partition.
- Rule 5 (3): `t33` (kinds list gains `founder`, the spec row, the founder-only branch), `t45` (the T49 share beside the others), `tables.test.mjs`:75 re-pinned to `["founderhandleset", "governorconfig"]`.
- `t36` R34 partition: the covered ops are the member set's and `founderhandleset` (R71 holds R34 over it though it is not in the member set; my reading, see below).

**Readings (BOB may overrule).** (1) R71 says R34 holds over `founderhandleset`, but R34 is stated over `SESSION_OPS.member`. I read R71 as binding: the partition test covers the member set plus `founderhandleset`; `ACT_HELP_ABSENT` may name it until `ACT_HELP` holds it. (2) `projectownervotes` reads its project as the query's `projectId` (project-roster's own arm), where R72 says only "the project a query field".

**Words, labeled, admin grep, D29, N1073.** Words: this module holds no member-facing English (`words-reads.json` lists `reads: []` and seven provenance quotes for builders as unkeyed; they stay in source). N1068: the word "labelled" occurs only in code comments, none in a member-facing word. `admin` grep: the module holds the session kind `admin` (the founder's password session) and no reader receives the founder's id; no finding. D29: no `ok: true` in the module. N1073: the four registries wait on N1074.

**Waiting.** op-capabilities (T49-16) is COMPLETE on `job/T49/op-capabilities` and not yet on `tranche/T49`; this job built against a local, untracked copy of its `index.mjs` (excluded from git). Architecture shows 5 imports naming no tracked file until it merges. The `ACT_HELP_ABSENT` re-pin (rule 5 (8)) waits for affordances' merge (its job is WORKING).

## J1 · REPORT

op-declarations (T49-17) is built and green on my side, except the two steps that wait on merges that have not reached `tranche/T49`.

Done and pushed on `job/T49/op-declarations`: R3 (`NEEDS` composed from `op-capabilities.needsRows()` with `composeNeeds`, which refuses an overlap by name; measured equal to today's table before the delete: 323 + 500 + 27 = 850 keys); R71 (`founderhandleset`, a new `founder` kind, the founder's set alone); R72 (`projectownervotes`); K3321 (B)'s ten reds re-pinned against PR #36's registry (five owed acts T49 leaves out are named in each test); rule 5 (3)'s census and `tables.test.mjs`:75. 197 module tests pass; format, coverage (71 of 71) and ownership show 0 failures.

Waiting on you (nothing for Bob):
1. `op-capabilities` (T49-16) is COMPLETE on its job branch but not on `tranche/T49`. I built against an untracked local copy of its `index.mjs`. When you merge it, tell me (CHANGE or RESUME), and I merge the tranche, rerun the module's tests and `architecture`, and the import resolves.
2. `affordances` (T49-14) is still WORKING. Rule 5 (8): I re-pin `ACT_HELP_ABSENT` against its merged `ACT_HELP` (it will then hold `founderhandleset` and the 13 ops whose texts `mock-acts.js` now gives), and drop `founderhandleset` from the absent list. I cannot do this before it merges.

Two readings of mine (the record states both): R71 says R34 holds over `founderhandleset`, which is not a member-set op, so the partition test covers the member set plus that op; `projectownervotes` reads its project from the query as `projectId`, which is project-roster's own arm.

No sentence for a key: this module holds no member-facing English.
