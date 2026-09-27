# consequences — extraction map

**Status** · DRAFT by a drafting worker for BOB #48, 2026-09-27 (P18), measured at tranche/T6 @ c7dfd835ef; for BOB's review. (`store.mjs` 33,816 lines, `schema.mjs` 1,948, `checks/bio-checks.mjs` 14,317.) The contract is `build/requirements/consequences.md` (R1–R14); K4, K12, K23, K31, K61, K88 (3), K102 apply. The module exports `consequencesOf(ctx)` (K61; the factory's name collides with R7's service `consequencesOf`, so the job names one of them otherwise). A new module: no `from`, and none is needed (§1).

## 1. What moves to `consequences`

Nothing. Nothing in `store.mjs`, `schema.mjs`, `index.mjs` or `bio-checks.mjs` records what a government breach did or to whom; no figure parser, no amount or fund value is held. No catalogue row, table, op or migration belongs to it. **Schema (K4):** `consequence_parts`, `consequence_operands`, `consequence_addressed` are new, declared to purge (R13).

**Measured size:** 0 lines moved. Estimated 700–1,000 lines of new code, the figure parser included (Suggestions).

## 2. What stays, or belongs to another module, and why

| what | where today (T6) | owner | why |
| --- | --- | --- | --- |
| DEC-14's `consequenceState` (the group's own outcome or impact; `unproven` from sequence alone) | bio-checks 4654–4714; read at store 1399 in `#actionDerived` (1352–1405) | `actions` (R26 renames its read key) | a different meaning (K88 (3)); R5 copies only its discipline, never the code or the key |
| `action_quotes` DDL, `actionQuotes` (the only money in the record: a fee quote, D-148) | schema 949–961, store 5704–5788 | `actions` | not a breach consequence |
| `isMachineIdentity` | bio-checks 1667–1693 | `legacy-checks` | R3, R9 |
| `content`'s `sheet-range` and `doc-table` arms | `bio-plane/src/content/` | `content` | the natural operands of R2 (Suggestions); read, not moved |

## 3. What earlier modules must provide (uses)

| use | service | in its Provides? |
| --- | --- | --- |
| `record-core` | `allocId`, `transact`, `stampInstant`, `declarePurge` | yes |
| `membership` | `sight`, `projectAuthority`, `viewerPredicate` | yes |
| `promotion` | `promote` (a part as a record object, R14) | `promote` yes; a new type no (standards map §5.2) |
| `content` | `contentRow` and the passage text; `passageNotice` (R8) | yes |
| `inquiry` | `earned` (R2's operand grade); the causation inquiry's state and supersession (R5, R8: `supersededBy`, `stateHistory`) | yes; see §5.2 for `earned` |
| `strength` | `inquiryStrength` (R5) | yes (T6-4) |
| `conformance` | `determinationRead` (R1: the per-standard outcome, superseded or not, the project) | yes (conformance R9) |
| `legacy-checks` | `isMachineIdentity` | yes |

## 4. The ADDED lines expected in the legacy modules

- `legacy-checks`: the `CONS` prefix and a consequence-part state table (standards map §5.2); catalogue rows for new codes if DEC-49 applies.
- `legacy-store`, `legacy-index`/`control-plane`: dispatch, `OPS` entries and classes for `consequenceRecord`, `consequenceRevise`, `consequencesOf`, `addressedRecord`, `addressed` (K3). About 20 lines.

## 5. Undetermined, conflicts, and code others could claim

1. **A new record type** (`CONS-`): as standards map §5.2.
2. **R2's operand grade.** R2 reads each operand's capture grade through `inquiry.earned`, but `earned(subjectEntity, targetIds, contentIds?)` answers per target bundle and needs a subject entity; an operand is a content id with none. `provenance.captureGrade(captureSha)` (its Provides) answers the capture axis directly, but `provenance` is not in this module's uses. BOB decides which read R2 means; if `captureGrade`, uses gain `provenance`.
3. **No parts means "addressed"?** R9's overall `addressed` holds "only when every live part is addressed"; a determination with no parts recorded satisfies it vacuously, and `escalation` R14 would then end on consequences nobody assessed. R9 should state the empty case (proposed: `undetermined`, "no part recorded"). BOB decides; it binds escalation R14.
4. **Addressed on a superseded determination.** R1 refuses new parts on a superseded determination, and "Decided by BOB" keeps its parts readable, not carried forward; R9 does not say whether `addressedRecord` is accepted on those parts. An escalation whose compliance is restored by a superseding determination (escalation R14) reads `addressed` for its own, now superseded, determination, so it must be. BOB confirms.
5. **Machine-computed parts vs R1.** R2 lets a machine record a computed part, but R1 checks `NOT_A_PARTICIPANT` only for "a member author"; the job states which project authority, if any, a machine's computed part is checked against.
6. **Not yet met:** every R1–R14 (new module). Until a budget or financial-report reader exists (`extraction`/`docprofile`, `EXTRACTION-BREADTH-DESIGN.md` §2), most parts will be assessed or undetermined.
