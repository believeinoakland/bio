# affordances — extraction map

**Status** · Measured 2026-09-26 on `tranche/T3` @ `f324df9b` (`store.mjs` 49,817 lines, `index.mjs` 13,438, `affordances.mjs` 2,311, `checks/bio-checks.mjs` 15,682) by a drafting worker for BOB #43 (P18). The contract is `build/requirements/affordances.md` (R1–R25); K3, K31, K61, K78 (3), K85 and N6, N13, N45, N49, N52 apply. The module exports `affordancesOf(ctx)` (K61) for the facts, and its catalogue, `deriveActs`, `decorate` and `unaccounted` at module level. `from` should read `["legacy-store", "legacy-index"]`: nothing moves from `bio-checks.mjs`.

## 1. What moves to `affordances`

| what | where today | lines | notes |
| --- | --- | --- | --- |
| the whole catalogue, the ladder, `VOCABULARIES`, the prompts, `deriveActs` | `affordances.mjs` (owned) | 1–2311 | stays; R1–R10. Lines 98–154 (`DISPOSITIONS`, `REOPENABLE_FROM`), 181–209 (`ENTITY_KINDS`, `RELATION_KINDS`, `STAGE_REQUIREDNESS`) and `PER_ITEM_MAX` (2278) become re-exports (R6) |
| `affordanceFacts` with its header | store | 2916–3223 | R13–R16 |
| `#joinedCitingProjectOf`, `#concludedForJoinedProjectOf`, `#editionWarrantedForJoinedProjectOf` with their headers | store | 33088–33176 | R14–R15, R23; `affordanceFacts` is their only caller |
| dispatch `affordancefacts` | store | 49446–49454 | in-process after extraction |
| `decorateAct` with its header | index | 2810–2849 | R11, as `decorate(act, gate)` |
| the `op=affordances` handler's composition | index | 7090–7199 | R17; the stamps (7145–7171), the store-silence answer and the status mapping stay in `control-plane` |

**Schema.** None: the module reads and writes no table of its own.

**Measured size:** `affordances.mjs` 2,225 after R6 (about 460 code), `store.mjs` 406 (116), `index.mjs` 150 (56): about 2,780 lines, about 630 of code.

## 2. What stays in `legacy-store` or goes elsewhere, and why

| what | where today | goes to | why |
| --- | --- | --- | --- |
| `DISPOSITIONS`, `STAGE_REQUIREDNESS` | `affordances.mjs` 98–107, 204–209 | `progressions` | K78 (3), N49: the layer-5 module writes them, this one re-exports |
| `ENTITY_KINDS`, `RELATION_KINDS` | 187–202 | `entities` | its R7; re-exported (N13) |
| `REOPENABLE_FROM` | 109–154 | `promotion` (`promotion/index.mjs` 36 already defines it) | N52: this module imports promotion's and deletes its own; `store.mjs` 31504 still reads this file's copy and moves with its owner |
| `PER_ITEM_MAX` | 2278 | `record-core`, with `#perItem` and C-75 (`queue`'s map §5.2) | the set helper is used by `entities` (layer 5) and `queue`; the number the helper enforces is defined where the helper is |
| `#citesInto` | store 4861 | `connections` (its R22) | read here through its service |
| `#retiredNotCitable` | 5298 | `citation` (R5) | |
| `#restsOnLive` | 5223 | `inquiry` | |
| `#caseRelationOf`, `#editionsRecordingConclusion` | 4919, 6541 | `publication` | read as facts |
| `#positionalMember`, `#ownsAnyProject`, `#isProjectOwner`, `#isJoinedParticipant`, `#participation`, `ownerMath`, `#owners`, `#rescueRefusal` | already delegations to `membershipOf(ctx)` (21681, 33479, …) | `membership` | read through its services; two are not in its requirements (§5.3) |
| `#conclusionOf`, `#conclusionRecordOf` (called by the joined predicates) | 6260, 6309 | `basis-versions` | |
| the stamps for `op=affordances` (`affViewer`, `affIdentity`, `affAuthor`, `affBy`), `storeSilent`, the 404/400 mapping, `NEEDS`, `SESSION_OPS` | index 7145–7178, the tables | `control-plane` | routing, authentication and the envelope (K3); the tables reach this module as `gate` |

## 3. Callers to rewire

- `deriveActs`, `affordanceFacts`: `store.mjs` `#queueOptions` (27818–27820, `queue`). `decorateAct`: `index.mjs` 7242 (`op=queue`, `queue`).
- `DISPOSITIONS`: `store.mjs` 4592–4593 (`dispose`), 30560–30561 (`proposeDispose`); `REOPENABLE_FROM`: 31504; `ENTITY_KINDS`/`RELATION_KINDS`: 24403–24406; `STAGE_REQUIREDNESS`: 26046, 26093; `PER_ITEM_ACTS`, `PER_ITEM_MAX`: 46881, 46918 (`#perItem`). Each reads its owner's object after the move (R6).
- `ACTS`, `RUNGS`, `RUNG_ABSENT`, `VOCABULARIES`, `CAPTURE_ACTS`, `PER_ITEM_ACTS`, `PER_ITEM_MAX`, `ACQUIRE_GRADE_NOTE`: `index.mjs` 110–111 (the latter for `op=acquire`'s note, `capture`'s handler). `skills` reads the published answer (its R-terms).
- The ADDED lines expected in `legacy-store`: the import of `affordancesOf` and a one-line delegation for `affordancefacts` while the dispatch stays there; in `legacy-index`: the import of `decorate` and the handler's call into this module.

## 4. Old-battery tests that anchor on the moved source

Source-reading suites and controls (`legacy-tests` entries, K53): `affordances.test.mjs` (parses `NEEDS` out of `index.mjs`; replaced by R12), `rung-ladder.test.mjs` (reads `OPS` through `readDispatch()`; replaced by R12), `d311-roster-affordances.test.mjs` (pins the four stamp expressions to `index.mjs` text), `d310.control.mjs`, `d311.control.mjs`, `d444-reinstate-project-arm.control.mjs`, `founder-sight.control.mjs`, `project-sight.control.mjs`, `project-authority.control.mjs`, `nc-rec72.mjs`, `nc-d162.mjs`, `sufficiency-state.control.mjs`, `register-grammar.control.mjs`, `rec-183-reinstate-retired.control.mjs`, `rec-186-leave-join.control.mjs`, `case-*-conclusion.control.mjs`, `conclude-project-arm.control.mjs`. Suites that follow the module: `affordances`, `rung-ladder`, `d311-roster-affordances`, `machine-attest`, `sufficiency-state`, `content-machine-mint`, `skillpack` (reads the published answer).

## 5. Undetermined, conflicts, and code others could claim

1. **Direction of the composition.** `decorateAct` needs `NEEDS` and `SESSION_OPS`, which are `control-plane`'s and later in the order. Resolved by passing them in (`gate`); the alternative, the tables moving here, would put authentication data in a publication module.
2. **Uses.** Declared: `membership`, `inquiry`, `citation`, `review`, `publication`, `legacy-store`, `legacy-checks`. The code calls `record-core`, `promotion`, `connections`, `basis-versions`, `progressions`, `entities`, `actions` and `content` too, and nothing of `review`. Proposed: add those eight, drop `review` and `legacy-store`.
3. **Membership gap.** `rescueRefusal` and `positionalMember` are exported by `membership/index.mjs` and asked here, and neither is in `membership`'s Provides (R41 states the act, R43 the viewer predicate); a job testing this module at membership's interface has no requirement to stand on.
4. **Record-core gap.** `affordanceFacts` reads `bundles.current_state` and `criticality`; `record-core` R37 states only `bundle_id` and `object_type` as a read contract.
5. **N45** is `membership` R35 (REC-224) seen from here: the act must follow R35 when it lands, and its test drives both.
6. **Other claimants.** `queue`: the option composer; `skills`: the published answer as input; `capture`: `ACQUIRE_GRADE_NOTE` (published here, composed from `inquiry`'s ceiling; it could move to `capture`, which is earlier, and be re-exported).
