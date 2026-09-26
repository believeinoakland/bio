# progressions — extraction map

**Status** · Measured 2026-09-26 on `tranche/T3` @ `7d91579`, after membership's early merge by a drafting worker for BOB #42 (P18). Line ranges are `grep -n`-verified in `bio-plane/src/store.mjs` (51,006 lines), `schema.mjs` (3,964), `checks/bio-checks.mjs` (16,591) and `index.mjs` (13,438); the extraction job confirms them. A method's range runs from its signature to its closing brace; the comment block above it goes with it. The contract is `build/requirements/progressions.md` (R1–R32); K4, K6, K23, K31, K61 and K64 apply. The module exports `progressionsOf(ctx)`, its one instance per Durable Object `ctx`, reaching `record-core`, `membership`, `entities` and `connections` through their factories (K61); `legacy-store` delegates to it. `from` should read `["legacy-store", "legacy-checks"]`: three of its rows are in the catalogue. Nothing moves from `index.mjs` (§2).

## 1. What moves to `progressions`

All in `store.mjs` unless named otherwise.

| what | where today | lines | moves |
| --- | --- | --- | --- |
| `#REQUIREDNESS`, `defineProgression`, `#basisView`, `#writeProgressionVersion`, `#definitionVersionOf`, `#dispositionVersionView`, `#dispositionOnFinding`, `#dispositionsByStage`, `#withDispositions`, `#instanceAnswer`, `#progressionCurrent`, `readProgression`, the FW-9 header | store.mjs | 27036–27345 | yes (R1–R5, R10, R12, R20) |
| `#REQUIRED_FIRES`, `#assembleInstance`, `threadInstance`, `#redactInstance`, `readInstance`, `dischargeStage`, `readExceptions`, the REC-8 header, `#nowMs` (a copy, K57), `#intervalDeadlineMs`, `#captureDateMs`, `#instanceDeadlines`, `#overdueFindings`, `#overdueScan`, `proposalsFeed`, `captureProgressions` | | 27744–28490 | yes (R6–R19); `#overdueScan` becomes the public `overdueScan` |
| `proposeDispose` with its header | | 31417–31737 | its progression arm (R20–R22), about 170 lines; the project arm and class bridge, about 150 lines inside 31477–31628, go to `queue` (§5.1) |
| migration: `proposal_dispositions.definition_version` | | 1325–1330 | yes, with the table |
| dispatch: `progressiondefine`, `progression`, `thread`, `instance`, `discharge`, `exceptions`, `proposals`, `captureprogressions` | | 50034–50074 | yes (K3) |
| dispatch: `proposedispose` | | 50096–50109 | yes; it routes the `{project, finding}` shape to `queue`'s arm |
| `UNKNOWN_AFTER` (C-33.26) | bio-checks.mjs | 10699–10705 | yes (R28) |
| REC-211 header, `NO_DEFINITION_VERSION` (C-33.42), `DEFINITION_MOVED` (C-33.43) | bio-checks.mjs | 10943–11001 | yes (R28) |

**Schema (K4).** `progression_defs`, `progression_stages`, `progression_def_versions`, `progression_stage_versions`, `progression_instances`, `progression_exceptions` with their indexes (schema.mjs 1028–1187); `proposal_dispositions` with its index (1216–1266). `progression_instances` and `progression_exceptions` carry `bundle_id` and are in `legacy-store`'s `declarePurge` list (store.mjs 870); the other five are whole-store entries (891–892). The job removes them there when this module declares its own (R29, K23).

**Checks it needs and does not take:** `NO_BASIS` and `NO_CITATION` (C-33.41) through the shared `actNoBasis`/`actNoCitation` (store.mjs 630–657, used by six other acts), `PER_ITEM_CHECKS` through `#perItem`.

**Measured size:** store.mjs 1,439 (800 without comment-only and blank lines), schema.mjs 211 (82), bio-checks.mjs 66 (26): about 1,720 lines, 910 of code; about 1,560 once `queue` takes its 152-line arm.

## 2. What stays, or goes elsewhere, and why

| what | where today | goes to | why |
| --- | --- | --- | --- |
| `#strongestResolutionsFor` | store.mjs 27347–27361 | `entities` or `connections` | the collapse `op=concerns`, `op=connect` and `earnedBasisRegistry` share; progressions calls it |
| `earnedBasisRegistry`, `earnedRegistryForDoc`, `#subjectEntityOf` | 27362–27742 | `strength` | the earned basis grades, between this module's two ranges but not about progressions |
| `#GRADE_RANK`, `#isEstablished` | 25809–25815 | `entities` (K76) | the grade order; progressions reads it from `entities` |
| `#weakerGrade` | 26219 | `connections` | the weaker of two grades; progressions uses it |
| the `overdue-scan` alarm consumer | 3492–3494, with its comment above | `scheduler` | it registers `overdueScan` (R17) as its tick |
| `finding_dispositions` (schema.mjs 2811–2857), the project-scoped arm and the class bridge of `proposeDispose`, `CLASS_NOT_DISPOSED` (C-33.44, bio-checks.mjs 10400–10419) | | `queue` | they read `itemClassOf`/`classOfKind` from `queuestate.mjs` (layer 11) and judge a queue item, not a progression |
| `index.mjs`: the `PROGRESSION_ACTIONS` list (2061), the op table (1406–1449), the gates (2496–2516), the stamps (13180–13270) | index.mjs | `control-plane` | routing, authentication and stamps (K3) |

## 3. Callers to rewire

Each calls a moved method or reads a progression table today, and calls `progressionsOf(ctx)` after.

- `proposalsFeed`: `queueFeed` (30570).
- Direct SQL on the progression tables or `proposal_dispositions`: `#findingsExportPerformed` (30201, 30212, 30246), `queueFeed` (30572, 30585, 30933, 31100), `#queueCaseFor` (31297, 31328, 31388), `#counts` (31974–31998). Each takes a read this module adds (the decisions held, the instances a capture sits in, a count per table) or a stated read contract; the job proposes which, through BOB.
- `#overdueScan`: the scheduler consumer (3492–3494).
- `STAGE_REQUIREDNESS`, `DISPOSITIONS`: imported from `affordances.mjs` (layer 11); they move here and `affordances.mjs` re-exports them (§5.4).

## 4. Old-battery tests that anchor on the moved source

Source-reading suites and negative controls that re-anchor with the move (`legacy-tests` entries, K53): `proposedispose.test.mjs`, `d266scope.control.mjs`, `d266.control.mjs`, `current.test.mjs`, `current.control.mjs`, `d484-refusal-translation.test.mjs`, `derivation-bounds.test.mjs`, `meaning-bounds.test.mjs`, `gate-reads.test.mjs`, `peritem.test.mjs`, `queue-state.test.mjs`, `versions.test.mjs`, `identity-claims.control.mjs`, `project-authority.control.mjs`, `hygiene.test.mjs` (purge lists). Suites that drive the behaviour and follow the module as its tests: `progression-instance`, `progression-exception`, `progression-versions`, `overdue-successor`, `proposals-feed`, `capture-progressions`, `d552-instance-disposition`.

## 5. Undetermined, conflicts, and code others could claim

1. **The project-scoped disposition belongs to `queue`.** `proposeDispose` is one op with two subjects (D-266). The `{project, finding}` arm writes `finding_dispositions`, judges a queue item's class through `queuestate.mjs`, and checks project authority; none of it is about a progression, and `queuestate.mjs` is layer 11. Proposed: the arm, C-33.44, `finding_dispositions` and D-623 (its untranslated `NO_PROJECT_SCOPE`) go to `queue`, and `legacy-store` keeps them until `queue`'s extraction. BOB decides (P17).
2. **D-688 is not this module's.** Its code, `LIFECYCLE_TEXT_UNWRITABLE` (C-94.11), is in `actionCorrespond`'s records-request lifecycle (`LIFECYCLE_CHECKS`, bio-checks.mjs 14879–14960); "stage=Appeal" is a correspondence stage, not a progression stage. Proposed: re-target it to `actions`.
3. **Uses.** The code calls `membership` (the redactor), `entities` (with the grade order, K76) and `connections`, and reads `readings.at` (`extraction`) and `register.registered` (`provenance`, a read contract under K72 (6)). It calls neither `capture` nor `content`. Proposed: add `membership`, `extraction` and `provenance`; drop `capture` and `content` unless R32 comes to read content.
4. **Layer-11 vocabulary.** `STAGE_REQUIREDNESS` and `DISPOSITIONS` are imported from `affordances.mjs`; the move reverses the direction (defined here, published there), as REC-35 intended for one array.
5. **Shared helpers.** `#nowMs` (used across the store), `#perItem` and `actNoBasis`/`actNoCitation` stay shared; this module keeps its own copy of `#nowMs` and `#rows`/`#one` (K57) and calls the act helpers where they land.
6. **Branches.** D-623 is built on `land/worker/D-623` @ `1c701e33` and D-688 on `land/worker/D-688` @ `ca653547`; each is judged by the module §5.1 and §5.2 name.
7. **Other claimants.** `entities`: `#strongestResolutionsFor`'s resolutions, `#GRADE_RANK` and `#isEstablished` (K76). `connections`: `#weakerGrade`. `strength`: the earned basis registry between the two ranges. `scheduler`: the overdue consumer. `queue`: the project arm and `proposalsFeed`'s consumer.
