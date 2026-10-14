# op-declarations — extraction map (the split into `op-capabilities`)

**Status** · Measured 2026-10-14 on `tranche/T49` @ the commit of this checkout (`bio-plane/src/op-declarations/`: `index.mjs` 3,731 lines, `t45.mjs` 111, `t46.mjs` 39, `t47.mjs` 62, `t48.mjs` 83; 4,026 in all) by a worker for BOB #177 (P18). It maps T49-16 (build `op-capabilities` by copy) and T49-17 (op-declarations deletes its copy and composes). The cut is `build/plan/draft-T49-additions.md` § "op-declarations' split", settled in K3327. No code was changed to make this map.

## 1. What `op-capabilities` takes

`NEEDS` today is one literal, `const NEEDS = Object.freeze(aliasRows({ ... }))`, `index.mjs` 2,435–3,331, inside `build()`. `needsRows()` does not exist yet; T49-16 makes it. Of the literal's 323 hand-written rows, 313 sit before `...FAMILY_NEEDS` and 10 after it.

| what | lines (`index.mjs`) | notes |
| --- | --- | --- |
| the header comment "capabilities at the op layer. Membership Architecture v2 section 5" (the rule that a table is structural, not a hand list, and names the R3 test) | 2,413–2,434 | moves; one sentence names `test/m/op-declarations/tables.test.mjs` and stays true (that test stays) |
| `const NEEDS = Object.freeze(aliasRows({` | 2,435 | becomes the body of `needsRows()`'s build, without `aliasRows` (see §2) |
| the 313 rows before the family spread, each with its comment (mostly `contribute`; `publish` 7; `create_projects` once, at 2,863; the rest `null`) | 2,436–3,301 | move whole, comments verbatim |
| the comment on the family spread (T33, "each family op's row, from its kind") | 3,302–3,305 | **stays** in op-declarations, above the composition: it explains `FAMILY_NEEDS` |
| `...FAMILY_NEEDS,` | 3,306 | **stays**: it is op-declarations' (§3) |
| the 10 rows after the spread, with their comments: `standardinforce` (3,308), `exportpage`, `moneydetectorsrun`, `credit`, `recover`, `passwordreset`, `scanbatch`, `renderbatch`, `deeperbatch`, `securityforward` | 3,307–3,330 | move whole |
| `}));` | 3,331 | closes the moved literal |

Moved: 2,413–3,301 (889 lines) and 3,307–3,330 (24 lines) = **913 lines**, 323 rows: `"contribute"` 185, `null` 130, `"publish"` 7, `"create_projects"` 1 (`projectfork`). The plan's "2,413–3,331 (919)" is these 913 plus the retained spread comment and line (3,302–3,306) and the closing line.

`needsRows()` returns the frozen map of those 323 rows only: no family row and no alias. It is built on the first call and the same object is returned after (§5, R3).

## 2. What the moved block references

Checked by stripping comments and listing every non-literal token in 2,435–3,331.

| reference | where | verdict |
| --- | --- | --- |
| `Object.freeze` | 2,435 | built-in; used by `op-capabilities` itself |
| `aliasRows(...)` | 2,435 | **stays** in op-declarations (it reads `ALIAS_PAIRS`, from `OP_ALIASES`, R21). No hand row is an alias name; six alias targets are hand rows (`signerregister`, `signerrevoke`, `versionadopt`, `versionkeep`, `strengthbar`, `filingsent`). So aliases must be made over the composed table, in op-declarations, as they are today. `needsRows()` returns the table without them |
| `...FAMILY_NEEDS` | 3,306 | **stays**; not part of the moved rows |
| any other identifier | | none. Every value is a string literal or `null` |
| names in comments (`SESSION_OPS`, `OPS`, `VERSION_ACTIONS`, REC-/MK-/D- ids, `affordances` NON_ACTS) | many | prose only; they move with the comments unchanged and import nothing |

**Nothing blocks "imports NOTHING".** No helper or constant moves, is duplicated, or has to stay-and-be-imported. The two that look like dependencies (`aliasRows`, `FAMILY_NEEDS`) belong to the composition, which is op-declarations'.

**Precedence check (the only behavioural risk).** In today's literal a later key wins: family rows override the 313 early hand rows, and the 10 late hand rows override family rows. Measured on the live module: `FAMILY_NEEDS` has 498 keys (kinds with `needs: undefined`, such as `credit`, `recover` and `passwordreset`, give none), the hand rows 323, **the two sets share no key**. So `{...needsRows(), ...FAMILY_NEEDS}` equals today's table, with 821 keys, plus 27 alias rows = 848 keys. T49-17's test asserts the empty overlap as a negative control (a family row added for a hand-row op would otherwise silently win). Only the key order differs (all hand rows now precede the family rows); no test in `test/m/op-declarations/` pins insertion order (`deepEqual` and `Object.hasOwn` are order-free; `purity.test.mjs` and `t28`/`t36` stringify one load against the same code).

## 3. How op-declarations composes afterwards

- `index.mjs` gains `import { needsRows } from "../op-capabilities/index.mjs";` (beside line 14's imports). `op-declarations` → `op-capabilities` is already in `modules.json` `uses`; `op-capabilities` is in the `MODULE_ORDER` (T49-1, R145) with empty `paths`/`tests` (BOB gives it `bio-plane/src/op-capabilities/` and `bio-plane/test/m/op-capabilities/` at T49-16's merge).
- In `build()`, in place of 2,413–3,331:
  1. a short comment (about 6 lines): `NEEDS` is composed here from `op-capabilities.needsRows()` and the families' kinds, aliases applied (R3); the census test (every session-reachable mutating op has a row, nothing named that no session reaches) is this module's, over the composed table;
  2. the retained family comment (3,302–3,305);
  3. `const NEEDS = Object.freeze(aliasRows({ ...needsRows(), ...FAMILY_NEEDS }));`
- `FAMILY_NEEDS` (line 598), `ACT_GATE` (about 3,340; `needs(id)` reads `NEEDS`), `OP_ALIASES`, the export list (3,595 `NEEDS`; 3,726 `export const NEEDS = lazy(...)`) are untouched. `NEEDS` stays an export of this module, frozen, a plain binding, built on first read (R69). `admission`, `control-plane`, `interface-shell`, `plane` and every test import `NEEDS` from op-declarations as today: **no caller re-points**.
- R69's test counts tables of 100 or more entries frozen at import (`t48.test.mjs`:440): importing `op-capabilities` must freeze none, so its 323-row object is built inside `needsRows()` on first call and cached (a second call must not freeze again: the test's "afterAll equals afterFirst").
- The header comment of `index.mjs` (lines 1–13) says the module holds "the capability table"; reword to "composes" (comment only).

## 4. Requirements and tests

**op-declarations ids that describe the moved content.**

- **R3**, its `NEEDS` sentence: "`NEEDS` maps an op to the one capability a session needs for it, or `null`; an op with no entry needs none". This is the only id that states the rows. It is split by id (K2375's form): `op-capabilities` R1 takes the rows, and R3 is re-worded (draft in §7). Its `SESSION_OPS` and `UNATTENDED_BY_DECISION` sentences are unchanged.
- **R5** (frozen data) and **R69** (built on first read) apply to `NEEDS` as one of the tables; they stay op-declarations' for the composed `NEEDS`. `op-capabilities` R2 and R3 are their forms for `needsRows()`.
- **R1** (`ACT_GATE.needs(id)` answers `NEEDS[id]`) stays: it reads the composed table.
- The per-tranche clauses that say "with `NEEDS` `contribute`" or "a `NEEDS` row of `null`" about a particular op (R8–R10, R12–R18, R25, R27, R30, R32, R33, R42, R47, R49, R51, R55–R57, R67 and on) stay. They are answered by the composed table; a script listing the backticked ops of each clause against the 323 hand-row names finds hand-row ops in R8, R9, R10, R12, R13, R14, R15, R16, R17, R18, R21, R22, R25, R27, R30, R32, R42, R45, R47, R49, R51, R55, R56, R57, R67. None is re-worded or retired.

**Tests that name R3 (op-declarations, `bio-plane/test/m/op-declarations/`): all stay.** They read the composed `NEEDS` through `index.mjs`.
`tables.test.mjs` (lines 62, 94, 113, 173, 185, 266, 358, 412), `t23.test.mjs`:90, `t24.test.mjs`:32, `t27.test.mjs`:78 and 134, `t28.test.mjs`:68, `t31.test.mjs`:72, `t33.test.mjs`:202 and 500, `t34.test.mjs`:320 and 432, `t35.test.mjs`:111, `t36.test.mjs`:173, `t45.test.mjs`:172, `t46.test.mjs`:371, `t47.test.mjs`:69. The R3 census test is `tables.test.mjs`:62; it needs `OPS` and `SESSION_OPS`, which `op-capabilities` cannot import, so it **must** stay with op-declarations. Other files in that directory that read `NEEDS` (counts of mentions): `gate`, `purity` (R5 and R7 over `NEEDS`; `view()` and R7's environment trap cover the new import), `t37`, `t38`, `t41`, `t42`, `t47`, `t48` (R69 at 438–500).
The 84 test files outside `test/m/op-declarations/` that import op-declarations (admission, control-plane, affordances, op-grades and others) are unchanged.

**New for `op-capabilities`** (`bio-plane/test/m/op-capabilities/`, T49-16): `rows.test.mjs` (R1: the 323 names and values equal a golden copy of the pre-split rows; every value is `contribute`, `publish`, `create_projects` or `null`; no alias, no family op; the count by value; a control that a missing op is `undefined`, not `null`), `frozen.test.mjs` (R2: frozen, no import in the source text, no environment, clock, network or randomness touched, no place named, two loads byte-identical), `lazy.test.mjs` (R3: the `t48.test.mjs`:440 method in a child process: a fresh import freezes no large table, the first call builds one, later calls return the same object and freeze nothing).

## 5. Expected sizes

| file | now | after T49-16 | after T49-17 |
| --- | --- | --- | --- |
| `op-capabilities/index.mjs` | 0 | about 945 (913 moved + about 30 of header, cache and wrapper) | the same |
| `op-declarations/index.mjs` | 3,731 | 3,731 | about 2,825 (3,731 − 919 + about 12 of comment and composition + 1 import) |
| op-declarations with `t45`–`t48.mjs` (295) | 4,026 | 4,026 | about 3,120; about 3,160 with R71 and R72 |

The plan's "about 3,110" and "about 3,150" hold; both modules stay under the ~4,000 P6 mark.

## 6. Order and cautions

- T49-16 adds `op-capabilities` and does not touch op-declarations (the rows exist twice until T49-17). T49-17 deletes and composes.
- T49-16's copy is verbatim, comments included (no change of meaning). The only edit is the wrapper: `let rows; export function needsRows() { return rows ??= build(); }` and `function build() { return Object.freeze({ ... }); }`.
- T49-17's equality check: before deleting, assert `{...needsRows(), ...FAMILY_NEEDS}` after `aliasRows` deep-equals the old `NEEDS` (848 keys), then delete.
- T49's new ops are family ops (N1072, N1091), so no new row is owed to `op-capabilities`; if START finds a non-family op, its row goes to `op-capabilities` by CHANGE.

## 7. Drafts for BOB

### `build/requirements/op-capabilities.md` (text to write)

```markdown
# op-capabilities — requirements

**Status** · Draft, T49 (K3298, K3327; `build/extraction/op-declarations-split.md`): split from `op-declarations` for size (P6) by copy; R1 is the `NEEDS` half of `op-declarations` R3, R2 and R3 are the forms of its R5 and R69. No requirement changes meaning. Every requirement is not yet met (T49).

**Size (P6).** About 913 lines copy from `op-declarations/index.mjs`, most of them its standing rationale comments; about 945 with the wrapper. Well under 4,000.

## Public

### Purpose

The capability each hand-written op needs: for every op a member's session reaches that the families of `op-declarations` do not declare, the one capability a session needs for it, or a stated `null` with its reason. It holds data only. It decides no caller's right and judges no request; `op-declarations` composes it into `NEEDS` and `admission` reads that.

### Provides

Terms. A **capability** is one of the working rights of a member's session: `contribute`, `publish` or `create_projects` (Membership Architecture v2 section 5; no fifth token is minted, CAPABILITIES.md section 4). A **row** is an op's name and either one capability or `null`: no capability, stated, with the reason in a comment beside it.

**needsRows() → frozen `{op: capability | null}`**
- **R1** Answers one row for each of the 323 hand-written ops: `contribute` for 185, `publish` for 7 (`ratify`, `caseratify`, `publishat`, `publish`, `reviewgrant`, `reviewrevoke`, `strengthbar`), `create_projects` for `projectfork`, and a present `null` for the other 130. A `null` is a statement that the op needs no capability (a read, a public op, or an act bounded by who the session is), and is not the same as no row: an op with no row needs none, and the answer has no key for it. It holds no row of a family op (those come from their kinds in `op-declarations`) and none of an alias (`op-declarations` R21 makes those). Each row is as `op-declarations` held it before T49, with the comment that gives its reason. *(not yet met: T49)*
- **R2** The answer is frozen data. Importing the module reads nothing and touches no store, network, clock, randomness or environment, and the module imports nothing. No place is named in a row or a comment. The answer is the same on every load of the module. *(not yet met: T49)*
- **R3** The table is built on the first call to `needsRows()`, not when the module is evaluated: evaluating it freezes no table of a hundred entries or more, the first call builds the table once, and every later call answers the same object and builds nothing. *(not yet met: T49)*
- Errors: never throws. It takes no argument.

## Private

### Uses

- None. This module imports nothing; every identifier in the moved range is a string literal, `null`, or a name in a comment. Its `modules.json` `uses` is empty.

### Invariants

- A row's capability is one of `contribute`, `publish`, `create_projects`, or `null`.
- No row appears twice, and no key is an alias or a family op.

### Satisfies

- `docs/architecture/BIO_Membership_Architecture_v2.md` §5 (capabilities enforced at the op layer; a capability gates a session and nothing else).
- CAPABILITIES.md §4 (no fifth capability token).
- Bob's rulings K3 and K23; `layers.md` ruling 2 (declarations stay with the door); K617, K624; K3298 (this split).

### Suggestions

- **Paths.** `bio-plane/src/op-capabilities/index.mjs`, exporting `needsRows`; tests in `bio-plane/test/m/op-capabilities/`.
- **Copy, then compose.** The rows and their comments are copied unchanged from `op-declarations/index.mjs` 2,413–3,301 and 3,307–3,330 (the map names them); `op-declarations` deletes its copy at T49-17.
- **The census is the caller's.** That every session-reachable mutating op has a row, and that no row names an op no session reaches, is `op-declarations` R3's test over the composed table; this module cannot read `OPS` or `SESSION_OPS`.
- **Tests.** R1 against a golden copy of the rows, with a control that an absent op is `undefined`; R2 as `op-declarations` R5 and R7 are tested; R3 in a child process, as `op-declarations` R69 is.

## Open for Bob

None: the split is BOB's (K3298).
```

### `op-declarations` R3, re-worded (text for BOB; meaning unchanged)

```markdown
- **R3** `SESSION_OPS` is `{member, admin}`, two sets of op names: the ops a member's own session reaches and the ops the founder's session reaches. `NEEDS` maps an op to the one capability a session needs for it, or `null`; an op with no entry needs none. (T49; K3298) `NEEDS` is composed here: the hand-written rows are `op-capabilities.needsRows()` (its R1), the families' rows come from each op's kind (R19), and the aliases (R21) are applied over the whole; no op is in both parts. It is exported frozen, as before, and every census over it (every mutating op a session reaches has a row; no row names an op no session reaches) reads the composed table. `UNATTENDED_BY_DECISION` maps an op no session reaches to the citation of the recorded decision that it is addressed to a credential, not a person, and holds no op without one. *(not yet met: T49)*
```

Also at T49-17: **Uses** gains `op-capabilities` (already in `modules.json`), and R5 and R69 stay as they are.
