# strength — extraction map

**Status** · Measured 2026-09-26 on `tranche/T3` @ `35ea098` (promotion merged; `store.mjs` 49,817 lines, `schema.mjs` 3,964, `checks/bio-checks.mjs` 15,682) by a drafting worker for BOB #42 (P18). Ranges as in `build/extraction/inquiry.md`. The contract is `build/requirements/strength.md` (R1–R25); K23, K31, K61, K75 (2)–(3) apply. The module exports `strengthOf(ctx)` (K61), reaching `inquiry`, `basis-versions`, `membership` and `promotion` through theirs. `from` should read `["legacy-store", "legacy-checks"]`. Nothing moves from `index.mjs`.

## 1. What moves to `strength`

| what | where today | lines | notes |
| --- | --- | --- | --- |
| DEC-72 bar header, `#barAxisWords`, `#projectBar`, `strengthBarSet`, `strengthBarOf` | store | 13170–13388 | R14–R16 |
| the REC-12 header, `STRENGTH_AXES`, `DOCUMENT_AXES`, `#weakestOf`, `#namedMember`, `#groundResult`, `#axisResult` | | 31558–31921 | R1–R4 |
| `#captureBoundsFor`, `#strengthWalk`, `strengthOf`, `inquiryStrength`, `#MEMBER_ID_FIELDS`, `#ID_IN_PROSE`, `#redactAxis`, `#writeStrengthProjection` | | 31996–32453 | R1–R6, R13; the `UPDATE` also writes `inquiry_basis_count` and `inquiry_subject_entity`, which are `inquiry`'s (its R12): the job splits it |
| `#independenceOf` | | 37464–37532 | R12; it reads `register` and calls `#capturedAddresses` (a `provenance` read, content map §1) |
| `VERSION_STRENGTH_STATES_MAX`, `#PAIR_COMPOSED_KEYS`, `#refusePairComposed`, `#versionLegsAsMembers`, `versionStrength`, `partitionIndependence` | | 37732–38457 | R7–R12 |
| inside `#promoteProjections`: the cache write | | 18646–18660 | R13, registered as this module's projection (promotion R39) |
| dispatch `strength`, `inquirystrength`, `versionstrength`, `partitionindependence`, `strengthbar`, `strengthbarof` | | 48603–48618, 48975–49001, 49705–49714 | K3 |
| migrations: `bundles.inquiry_capture_strength`, `_state`, `inquiry_connection_strength`, `_state` | | 1068–1071 (with comment) | to a table of this module's keyed by `bundle_id` (R23, K75 (3)); the index loop (1513–1559) indexes them for `retrieval` |
| `SUBJECT_POSITIONS`, `STRENGTH_STATES` | bio-checks | 2932–2945 | `STRENGTH_STATES` here; `SUBJECT_POSITIONS` is `publication`'s (the completeness block) |
| `VERSION_STRENGTH_CHECKS` (C-30), `VERSION_STRENGTH_DEFAULT_STATES`, `VERSION_STRENGTH_INERT_SOURCES`, `PARTITION_INDEPENDENCE_CHECKS` (C-71) | bio-checks | 8780–9017 | R7–R11, R24 |
| row C-32.9 (`MACHINE_CANNOT_DECLARE`) | bio-checks | in 9191–9421 | R15; `MACHINE_FENCE_CHECKS` split by the first job to move |

**Schema (K4).** `group_strength_bar` (schema.mjs 1495–1513): keyed by group, not in the purge list today, and exempt as an instance setting (R23).

**Measured size:** store.mjs 1,904 (760 code), bio-checks.mjs 252 (127), schema.mjs 19 (7): about 2,175 lines, about 890 of code.

## 2. What stays in `legacy-store` or goes elsewhere, and why

| what | where today | goes to | why |
| --- | --- | --- | --- |
| `#subjectEntityOf`, `earnedBasisRegistry`, `earnedRegistryForDoc`, `#capturedAt`, `#legVersions`, `earnedBasis`; dispatch `earnedbasis` | store 26364–26744, 31922–31995, 35552–35759, 48619–48626 | `inquiry` | the earliest module that needs what a leg earns (§5.1) |
| `#frontmatterOf`, `#basisFrontmatter` | 31542–31557 | `reevaluation` | only `reevaluations` and `#reevalMoved` call them |
| `QUEUE_ANCESTOR_DEPTH` | 27568 | `queue` | this module keeps its own depth bound, equal (Suggestions) |
| `#legEarnedCapture` | 2424–2495 | `retrieval` | K75 (2): it reaches `inquiry.earned` by registration |
| the pair frozen into a case, `#projectBar`'s callers `publishCase` and `reviewCopy` | 8406, 11017 | `publication` | they call R14 and R1–R5 and freeze the answer |
| `op=suggest`'s walk and independence check | 39471, 39546 | `ai-runs` | it calls R1–R4 over proposed legs and R12 |

## 3. Callers to rewire

- `strengthOf`: `search` (2291, `retrieval`), `publishCase` (8413, 8932), `groundInquiry` (13033, 13096; through `inquiry`'s registration, its R28), `reevaluations` (31365).
- `#strengthWalk`: `suggestVersion` (39471). `#independenceOf`: `suggestVersion` (39546). `#projectBar`: `publishCase` (8406), `reviewCopy` (11017).
- The cache columns: `search` (2288) and the compiler's `capture:` and `connection:` fields (`query.mjs`), through `retrieval`'s registration.
- `this.basisFor`, `this.earnedBasisRegistry`, `Store.#capturedAt`, `this.#subjectEntityOf` → `inquiry`; `this.#currentVersionOf` → `basis-versions`; `this.#bundleGate`, `this.#bundleRedactor`, `viewerPredicate` → `membership`; `this.#producingGroup`, `this.#groupUndetermined` → the fact `producingGroup` (K69).

## 4. Old-battery tests that anchor on the moved source

Negative controls and pins that read or patch moved text (a `legacy-tests` entry, K53): `strengthpair.control.mjs` (the old anchor-drift row D-660 was dropped as old-battery bookkeeping), `dec65-strength-reach.control.mjs`, `analystvocab.control.mjs`, `nc-rec105.mjs`, `nc-rec118.mjs`, `nc-rec119.mjs` (the walk, the capture bound), `nc-rec161.mjs`, `nc-rec192.mjs`, `independence.control.mjs` (`#independenceOf`, pinned to one walk), `caseproduction.control.mjs` and `d280-strengthbar.control.mjs` (`#projectBar`), `strength.test.mjs` (holds this file to D-160's retired word), `machinefences-dec49.test.mjs` (C-32.9, the C-30 region). Suites that follow the module: `strength`, `strengthpair`, `inquirystrength`, `dec65-single-part`, `dec65-strength-reach`, `independence`, `partitionindependence`, `d280-strengthbar`, `versiongrade`.

## 5. Undetermined, conflicts, and code others could claim

1. **The earned registry goes to `inquiry`** (its map §5.2), against the placement in this draft's brief and the progressions map (`build/extraction/progressions.md` §2). Kept here, `strength` would need `entities`, `extraction`, `text-chain`, `content` and `connections`, and `inquiry` a registration this module fills before any earned leg could be written. BOB settles which.
2. **Uses.** Declared: `legacy-checks`, `record-core`, `provenance`, `content`, `connections`, `bias`, `inquiry`, `basis-versions`. The moved code calls `membership` (the gates and redactor) and `promotion` (the cache projection, `producingGroup`), and none of `content`, `connections` or `bias` once the registry is `inquiry`'s. Proposed: add `membership` and `promotion`; drop `content`, `connections` and `bias` (keep `content` and `connections`, and add `entities`, `extraction`, `text-chain`, if §5.1 goes the other way).
3. **Two strengths of one reading (Open for Bob 1).** `#strengthWalk` counts a hunch at its stated grade (DEC-15; the comment above `#weakestOf`); `#versionLegsAsMembers` makes it inert (`VERSION_STRENGTH_INERT_SOURCES`, §12). The job builds whichever Bob rules, with an arm showing both reads agree.
4. **The group default bar (Open for Bob 2)** is writable by any signed-in member; only C-32.9 (a machine) is refused.
5. **The depth bound** is `queue`'s `QUEUE_ANCESTOR_DEPTH` (6) today, read by `#axisResult`'s `depth_bound`; a copy here avoids a use of a layer-11 module.
6. **Other claimants.** `inquiry`: the earned registry and the grouping act's pair (a registration). `basis-versions`: the version pair could sit beside the versions, but it composes by this module's arithmetic and is placed here. `ai-runs`: the suggestion's checks. `publication`: the frozen pair and bar. `retrieval`: the cache as fields.
