<!-- The citation survey, split from the inquiry map for BOB #42 on 2026-09-26 on tranche/T3 (N55, K83 (2)); superseded where it disagrees with build/requirements/citation.md. -->
# citation — extraction map

**Status** · Checked against `tranche/T7` @ `e15806be` by a worker for BOB #50 (P18) (`store.mjs` 33,756 lines, `checks/bio-checks.mjs` 14,629, `index.mjs` 9,069); every line number below is re-measured there (the measured sizes are left as first measured). Corrections: all lines re-measured; `stampInstant` is now `record-core`'s export (its R47, `record-core/index.mjs` 36), no longer `legacy-store`'s; `#captureForContent` is already `content`'s `captureFor` (content/index.mjs 187), which `cite` calls today; `#retiredNotCitable` has two more callers inside this module's own code (`#edgeTransition` 2517, `cite` 11763); the `retrieval` use `answerChanged` is exported (retrieval/index.mjs 86) but not named in retrieval's Provides (review file). Measured 2026-09-26 on `tranche/T3` @ `1c205209` (`store.mjs` 49,817 lines and `checks/bio-checks.mjs` 15,682, both unchanged since `35ea098`, where inquiry's map was measured) by a drafting worker for BOB #42 (P18), split from `build/extraction/inquiry.md` (N55, K83 (2)). A method's range runs from the line after the previous method's close to its own close, so the comment above it goes with it; the extraction job confirms each. Code lines are the lines left after removing blank and comment-only lines. The contract is `build/requirements/citation.md` (R1–R11); K3, K6, K57, K61 and K64 apply. The module exports `citationOf(ctx)` (K61); `legacy-store` delegates to it. **`from`: `["legacy-store", "legacy-checks"]`**: `legacy-store` for the store code, `legacy-checks` for its rows (K64's pattern). Nothing moves from `index.mjs`, and no table moves: a citation is written into the citing document and projected by `connections` (`refs`) and `inquiry` (`inquiry_basis`).

## 1. What moves to `citation`

All in `store.mjs` unless named.

| what | where today | lines | notes |
| --- | --- | --- | --- |
| `CITE_EDGE_BYTES`, `CITE_PIN_BYTES`, `CITE_LOG_SAMPLE` with their comments | store | 1789–1804 | R1, R3, R4; not in inquiry's measure. `SELECTION_ID_CHUNK` above them (1787) is already a re-export of `retrieval`'s |
| the severing header, `EDGE_REASON_MAX`, `EDGE_NOTE_MAX` | | 2374–2398, 2404 | R4; `EDGE_REASON_MAX` is also `inquiry`'s (`dispose`, a ground's statement) and others', each a copy (K57). Between them, `RELEASE_ACK_MAX` (2399–2403) stays with `inquiry` and every other reader as a copy, and `CORRESPOND_LEASE_MS` (2405–2411) is `actions'` |
| `#edgeTransition`, `sever`, `reinstate` | | 2412–2636 | R4 |
| `#retiredNotCitable` | | 3296–3329 | R5; inquiry's map counted it under `#restsOnLive`'s row. `#retirementCitedBy` above it is `connections`' fact (K76) |
| `#spliceEdgeStatus`, `cite` | | 11403–12270 | R1–R3; `#setSection`, `#removeBlock`, `#setOrAddBlock` above them (11359–11402) stay `inquiry`'s (`divide`, `groundInquiry`) |
| `#spliceReferences`, `#legExtentLines`, `#spliceBasis` | | 13723–13872 | R2; `#spliceReferences` is also called by other writers (store 5657, `#respondsToInto`), each keeping its copy (K57); the other two only `cite` calls |
| dispatch `cite`, `sever`, `reinstate` | | 33433–33486 | K3 |
| rows C-33.15–C-33.19 (`BAD_NOTE` … `SEVERED_EDGE`), C-33.39 (`RETIRED_NOT_CITABLE`) | bio-checks | 8907–8955, in `ACT_SHAPE_CHECKS` (8691–9257) | R11; the family is one object, split by the first job to move, numbers unchanged |
| rows C-45.7–C-45.10 (`UNKNOWN_EXTENT_FIELD` … `BAD_EXTENT_VALUE`) with their header comment | bio-checks | 11335–11391, in `CONTENT_EXTENT_CHECKS` (11251–11412) | R11; the rest of C-45 is `content`'s |

Each row's `where` (`src/store.mjs cite > is-cite-note`, `is-cite-role`, `is-cite-severed`, `is-cite-extent`, `is-cite-retired`) names a DEC-49 region inside `cite`; the job re-points them to this module's file.

**Helpers copied, not moved (K57):** `#setScalar` (13571), `#rand` (22113), the Session Log splice written inline in both acts, and `stampInstant` (now `record-core`'s export, its R47; store imports it at 227).

**Measured size:** store.mjs 1,378 (603 code), bio-checks.mjs 106 (78): about 1,480 lines, about 680 of code. Inquiry's map estimated about 1,300 (650 code) without the constants, `#retiredNotCitable` and the rows.

## 2. What stays in `inquiry` or goes elsewhere, and why

| what | where today | goes to | why |
| --- | --- | --- | --- |
| `earnedBasisRegistry` (`earned`) | store 16772–17153 | `inquiry` (K83 (3)) | the leg grammar, `cite`'s fill and basis-versions all need it; inquiry is the earliest |
| `checkLegExtentGrammar`, `BASIS_ROLES`, `checkInquiryBasis` | bio-checks 3002–3912 | `inquiry` | the one leg grammar, run by `cite` before the write and by promotion's check at it |
| `SELF_BASIS`, `BASIS_CYCLE`, `BASIS_REFUSED` at the write | store `#promoteChecks` | `inquiry` (its R11) | `cite` composes legs; the write judges them and `cite` answers the refusal unchanged |
| `#narrowSource` … `narrowCandidates`, `narrow` | store 12271–12503, 13275ff | `basis-versions` | narrowing an existing leg is its own authored act (Bob's 5.3) |
| `#citesInto`, `#refEdgeSevered`, `#retirementCitedBy`, the `refs` projection | store 2889–2895, 3281–3295 (delegations now); connections/index.mjs | `connections` (extracted) | the edges once written; `citation` reads none of them |
| `selectionResolve`, `answerChanged` | retrieval/index.mjs 815, 86 (extracted) | `retrieval` | the selection gate, R19–R20 there |
| `existenceAct`, `inSight`, `#noSuchProject`, `projectAuthority` | membership/index.mjs 914, 798, 704 (extracted; store keeps delegations) | `membership` | sight and project authority (R44, R55, R61 there) |
| `captureFor` | content/index.mjs 187 (extracted; `cite` already calls it, 12035, 12066) | `content` | the capture a citation of a document addresses |
| `index.mjs`: `cite`, `sever`, `reinstate` in `EDGE_ACTIONS`, `POSITIONAL_ACTS`, the op classes and the capability map (OPS 394, 506, 507; `EDGE_ACTIONS` 1517; `POSITIONAL_ACTS` 1820; `NEEDS` 2208–2210) | index.mjs | `control-plane` | routing, authentication and stamps (K3) |

## 3. Callers to rewire

Each calls moved code today, and calls `citationOf(ctx)` after.

- `#retiredNotCitable`: `affordanceFacts` (1549, `cites_out.severed_reinstatable`; `affordances`, layer 11), `suggestVersion` (27707, CHECK 1; `run-productions`, K82); inside this module, `#edgeTransition` (2517) and `cite` (11763). Both are later modules, so each gains a use of `citation` (`modules-entry.json`).
- `cite`, `sever`, `reinstate`: only their dispatch entries. `affordances.mjs` (720–761) names them in its act vocabulary and comments and calls none.

## 4. Old-battery tests that anchor on the moved source

Negative controls and pins that read or patch the text of moved code, so they move or re-anchor (a `legacy-tests` entry, K53): `nc-rec72.mjs` (`cite`'s and `#edgeTransition`'s member tests), `nc-rec97.mjs` (the `cite:` dispatch entry's extent bag and `cite`'s extent region; its grammar arms are `inquiry`'s), `rec-183-reinstate-retired.control.mjs` and `project-sight.control.mjs` (`#edgeTransition`), `machinefences-dec49.test.mjs` (`cite > is-cite-retired`), `identity-claims.test.mjs` (stamped authorship of `cite`). Suites that drive the behaviour through the plane and follow the module: `cite`, `citeinquiry`, `citeproject-inquiry`, `cite-extent`, `cite-scale`, `d168-retired-cite`, `edges`, `severedhomes` (with its control), and `selection`'s cite and sever arms.

## 5. Undetermined, conflicts, and code others could claim

1. **The retired-target predicate is placed here**, not in `inquiry` where inquiry's draft listed it: only `cite` and `reinstate` ask it among inquiry's code, and its two other callers (`affordances`, `run-productions`) are later than `citation`. It reads only `bundles.current_state`, record-core's read contract.
2. **Later uses.** `affordances` and `run-productions` gain `citation`. `run-productions` is not in `modules.json` yet (N54); its entry, when BOB adds it, lists `citation`.
3. **No Open-for-Bob item concerns citing.** inquiry's one question (a disposition of a shared question) stays there.
4. **`NOT_INFORMATION` on the case arm names a rule wider than its name** (information or a question, REC-72). Renaming it is a contract change the code records as Bob's; it is not proposed here.
