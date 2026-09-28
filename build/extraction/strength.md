# strength — extraction map

**Status** · Checked against `tranche/T7` @ `e15806be` by a worker for BOB #50 (P18) (`store.mjs` 33,756 lines, `schema.mjs` 1,948, `checks/bio-checks.mjs` 14,629); every line number below is re-measured there (the measured sizes are left as first measured). Corrections: all lines re-measured; `search` no longer calls `strengthOf` (it left with `retrieval`; the cache is read only as `query.mjs`'s `capture:` and `connection:` fields, 91 and 98); `#legEarnedCapture` is already `retrieval`'s (retrieval/index.mjs 551), fed by legacy-store's `registerLegGrades` (store 757–760); the cache's index loop sits after `retrievalOf().migrate()` in `#migrate` (1209–1215); the requirement's uses of `membership.bundleGate` and `bundleRedactor` and of `inquiry.subjectEntityOf` name no provided service (review file). Measured 2026-09-26 on `tranche/T3` @ `35ea098` (promotion merged; `store.mjs` 49,817 lines, `schema.mjs` 3,964, `checks/bio-checks.mjs` 15,682) by a drafting worker for BOB #42 (P18). Ranges as in `build/extraction/inquiry.md`. The contract is `build/requirements/strength.md` (R1–R25); K23, K31, K61, K75 (2)–(3) apply. The module exports `strengthOf(ctx)` (K61), reaching `inquiry`, `basis-versions`, `membership` and `promotion` through theirs. `from` should read `["legacy-store", "legacy-checks"]`. Nothing moves from `index.mjs`.

## 1. What moves to `strength`

| what | where today | lines | notes |
| --- | --- | --- | --- |
| DEC-72 bar header, `#barAxisWords`, `#projectBar`, `strengthBarSet`, `strengthBarOf` | store | 11140–11358 | R14–R16 |
| the REC-12 header, `STRENGTH_AXES`, `DOCUMENT_AXES`, `#weakestOf`, `#namedMember`, `#groundResult`, `#axisResult` | | 21117–21480 | R1–R4 |
| `#captureBoundsFor`, `#strengthWalk`, `strengthOf`, `inquiryStrength`, `#MEMBER_ID_FIELDS`, `#ID_IN_PROSE`, `#redactAxis`, `#writeStrengthProjection` | | 21555–22012 | R1–R6, R13; the `UPDATE` also writes `inquiry_basis_count` and `inquiry_subject_entity`, which are `inquiry`'s (its R12): the job splits it |
| `#independenceOf` | | 25726–25794 | R12; it reads `register` and calls `#capturedAddresses` (a `provenance` read, content map §1) |
| `VERSION_STRENGTH_STATES_MAX`, `#PAIR_COMPOSED_KEYS`, `#refusePairComposed`, `#versionLegsAsMembers`, `versionStrength`, `partitionIndependence` | | 25994–26719 | R7–R12 |
| inside `#promoteProjections`: the cache write | | 15657–15671 | R13, registered as this module's projection (promotion R39) |
| dispatch `strength`, `inquirystrength`, `versionstrength`, `partitionindependence`, `strengthbar`, `strengthbarof` | | 32941–32956, 33151–33168, 33648–33657 | K3 |
| migrations: `bundles.inquiry_capture_strength`, `_state`, `inquiry_connection_strength`, `_state` | | 898–912 (with its comment) | to a table of this module's keyed by `bundle_id` (R23, K75 (3)); the index loop (1209–1215) indexes them for `query.mjs`'s fields |
| `SUBJECT_POSITIONS`, `STRENGTH_STATES` | bio-checks | 2662–2669 | `STRENGTH_STATES` here; `SUBJECT_POSITIONS` is `publication`'s (the completeness block) |
| `VERSION_STRENGTH_CHECKS` (C-30), `VERSION_STRENGTH_DEFAULT_STATES`, `VERSION_STRENGTH_INERT_SOURCES`, `PARTITION_INDEPENDENCE_CHECKS` (C-71) | bio-checks | 7984–8203 | R7–R11, R24 |
| row C-32.9 (`MACHINE_CANNOT_DECLARE`) | bio-checks | 8503–8510, in 8371–8634 | R15; `MACHINE_FENCE_CHECKS` split by the first job to move |

**Schema (K4).** `group_strength_bar` (schema.mjs 432–450): keyed by group, not in the purge list today, and exempt as an instance setting (R23).

**Measured size:** store.mjs 1,904 (760 code), bio-checks.mjs 252 (127), schema.mjs 19 (7): about 2,175 lines, about 890 of code.

## 2. What stays in `legacy-store` or goes elsewhere, and why

| what | where today | goes to | why |
| --- | --- | --- | --- |
| `#subjectEntityOf`, `earnedBasisRegistry`, `earnedRegistryForDoc`, `#capturedAt`, `#legVersions`, `earnedBasis`; dispatch `earnedbasis` | store 16772–17153, 21481–21554, 24811–25018, 32957–32968 | `inquiry` | the earliest module that needs what a leg earns (§5.1) |
| `#frontmatterOf`, `#basisFrontmatter` | 21101–21116 | `reevaluation` | only `reevaluations` and `#reevalMoved` call them |
| `QUEUE_ANCESTOR_DEPTH` | 17244 | `queue` | this module keeps its own depth bound, equal (Suggestions) |
| `#legEarnedCapture` | retrieval/index.mjs 551 (moved) | `retrieval` (extracted) | K75 (2): it reaches the grades through `registerLegGrades`, which legacy-store fills today (store 757–760) and `strength` or `inquiry` fills after |
| the pair frozen into a case, `#projectBar`'s callers `publishCase` and `reviewCopy` | 6376, 8987 | `publication` | they call R14 and R1–R5 and freeze the answer |
| `op=suggest`'s walk and independence check | 27733, 27808 | `run-productions` (K82 (2)) | it calls R1–R4 over proposed legs and R12 |

## 3. Callers to rewire

- `strengthOf`: `publishCase` (6383, 6902), `groundInquiry` (11003, 11066; through `inquiry`'s registration, its R28), `reevaluations` (20924). (`search` no longer calls it: it left with `retrieval`.)
- `#strengthWalk`: `suggestVersion` (27733). `#independenceOf`: `suggestVersion` (27808). `#projectBar`: `publishCase` (6376), `reviewCopy` (8987).
- The cache columns: the compiler's `capture:` and `connection:` fields (`query.mjs` 91, 98), through `retrieval`'s projection.
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
