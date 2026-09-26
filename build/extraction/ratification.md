<!-- The ratification survey, split three ways from the publication map for BOB #43 on 2026-09-26 on tranche/T3 (K94); superseded where it disagrees with build/requirements/ratification.md. -->
# ratification — extraction map

**Status** · Measured 2026-09-26 on `tranche/T3` @ `f324df9b` (`bio-plane/` unchanged at `03e2481`) by a drafting worker for BOB #43 (P18), split from the publication map's [R] rows (K94). Ranges and "code" as `build/extraction/publication.md` states them; the extraction job confirms each. The contract is `build/requirements/ratification.md` (R1–R15); K3, K6, K31, K57, K61, K83 (3), K93 (3) and K94 apply. The module exports `ratificationOf(ctx)` (K61) and a Worker-side file for the two ceremonies. **`from`: `["legacy-store", "legacy-checks", "legacy-index"]`.** It uses `publication`; `case-authoring` uses it. It owns no table.

## 1. What moves

### store.mjs

| what | lines | code | requirement |
| --- | --- | --- | --- |
| `CASE_BEARING_STATES`, `#caseConclusionFor`, `#CONCLUSION_ENTRY_FIELDS`, `#editionsRecordingConclusion`, `#conclusionRowParsed`, `#sameRecordedConclusion`, `#recordedConclusionSummary` | 6360–6588 | 100 | R1 (K83 (3)) |
| `ratifyCaseDocument` | 11880–12181 | 179 | R3; its inserts (12055–12140) become calls to `publication.commitCaseEdition` |
| `gateFacts`, `publish` | 33833–34419 | 175 | R4, R5, R7; `publish`'s inserts (34315–34340) become `publication.commitEdition` (the parent map's 274 is corrected) |
| dispatch `gatefacts` (49751–49753), `caseratify` (49790), `publish` (49794) | about 6 | 6 | K3 |

Store: 1,118 lines (455 code) plus the dispatch.

### index.mjs (the Worker half; K3)

| what | lines | code | requirement |
| --- | --- | --- | --- |
| `testimonyFenceRow`, `ratifyScopeRow` | 4131–4148 | 12 | R2, R4 (C-53.10–.12, C-58); `machineFenceRow` (4149–) stays with the dispatcher's other fences |
| `attributionRow` | 4166–4172 | 6 | R2, R4 (C-92.10–.12); not in the parent map |
| `op=caseratify` block | 10918–11138 | 120 | R2 |
| `op=ratify` block | 11140–11858 | 311 | R4–R6 |

Index: 965 lines (449 code).

### bio-checks.mjs

| what | lines | code | requirement |
| --- | --- | --- | --- |
| `caseEditionClaimed`, `isCaseMemberBytes` | 233–268 | 9 | R9 (`legacy-checks` keeps a copy for C-3.1's heading rule at 1295) |
| `SUBJECT_POSITIONS` | 2932 | 1 | R9 (the parent map gave it to [A]; C-2.8 and C-41 read it) |
| `CASE_MEMBER_ROLES`, `biasAcknowledgementOf`, `completenessFields`, `checkPublishedExtension` (C-2.8 case arm) | 2946–3275 | 122 | R9 |
| `SEARCHED_SUBJECT_SOURCES`, `CASE_DOCUMENT_FAMILY` (C-41.1–C-41.15), `CASE_CITATION_VERSIONS`, `checkCaseDocument` (C-2.8, C-3.1, C-21.1 case arms) | 11462–12078 | 285 | R8; the formats above them (11402–11460) are `publication`'s |
| `ATTRIBUTION_CHECKS` C-92.10–C-92.12 | 13067–13088 | 21 | R2, R4, R14 |
| `CASE_CONCLUSION_CHECKS` (C-65.1) | 13650–13670 | 10 | R3 |
| `RATIFY_SCOPE_CHECKS` (C-58.1–C-58.3) | 13749–13790 | 25 | R4, R5 |
| `MACHINE_FENCE_CHECKS` rows C-32.12–C-32.15 | 9310–9352 | 33 | R2, R4 |
| `TESTIMONY_CHECKS` rows C-53.10–C-53.12 | 13176–13199 | 24 | R2, R4 |

Checks: 1,136 lines (530 code).

**Measured size:** about 3,230 lines, about 1,440 of code.

## 2. What stays in a legacy module or goes elsewhere, and why

| what | where today | goes to | why |
| --- | --- | --- | --- |
| `#projectsDrawingOn` | store 28423–28523 | `basis-versions` | R1 needs it; `queue` (layer 11) too (K94) |
| `#conclusionOf`, `#conclusionRecordOf`, `#noProjectConclusionOf` | store 6260–6358 | `basis-versions` | called (R1) |
| `#memberTextAtSha` | store 10107–10116 | `record-core` (`textAtSha`) | called by R3 (K94) |
| `recordReuseVerdicts`, `reusedParts`, `captureLimit` | store 46216–46271 and nearby | `capture` | called by `op=ratify` (R6) |
| `partsHeld` | index 4560 | `provenance` | also called at index 7278 |
| `#caseAuthority`, `#inSight`, `#existenceAct` | store 33180–33188 | `membership` | already delegating |
| the published reads, `#publishEdges`, `#dischargeCaseFlags`, `assembleCaseContainer`, the formats | store, index, bio-checks | `publication` | called (its R5, R15, R20–R22) |
| `classify`, admission, the stamps, `machineFenceRow` | index | `control-plane` | K3; the handler receives the class |
| the C-3.1 heading rule's `isCaseMemberBytes` call | bio-checks 1295 | `legacy-checks` (its copy) | a layer-1 check cannot call layer 8 (K57) |

## 3. Callers to rewire

- `#caseConclusionFor`, `#editionsRecordingConclusion`: `publishCase` (8231, 8326; `case-authoring`), `#editionWarrantedForJoinedProjectOf` (33168, 33172; `affordances`).
- `checkCaseDocument`: `promotion`'s `runCaseGate` (gate.mjs), through the registration (Decided 1); `caseDocumentFacts`' comment only (store 10102).
- `checkPublishedExtension`: `checkInquiryExtension` (bio-checks 2747; `inquiry`), replaced by the registration (Decided 2).
- `completenessFields`, `SUBJECT_POSITIONS`: `publishCase` (8859, 8091; `case-authoring`); `completenessFields` also the ratify handler (index 11462). `SUBJECT_POSITIONS`: `affordances.mjs` (70, 553).
- `SEARCHED_SUBJECT_SOURCES`: `airun.mjs` (92, 1464, 1507), moving to `case-authoring`.
- `isCaseMemberBytes`: the ratify handler (index 11457).
- `gateFacts`, `caseRatify`, `publish`: only their dispatch entries and the Worker handlers.

## 4. Old-battery tests

Suites that drive the ceremonies and follow this module: `casesign`, `caseratify-conclusion`, `ratify-authority`, `ratify-envelope`, `case-authority`, `case-opened`, `multifinding`, `caseproduction` (with `case-authoring`). Source-reading suites from the parent map's §4 that name this module's code re-anchor here (K53); the job confirms which: `audit-inheritance`, `conclude`, `current-shared-question`, `d310.control`, `gate-reads`, `m025-arm-anchor-witness`, `rec-182-created-tie` (and `.control`), `rung-ladder`, `shadowed-refusals`, `signer-enrolment`, `testify`.

## 5. Lines added to the legacy modules

- `legacy-store`: the factory import and delegating `gateFacts`, `publish`, `ratifyCaseDocument` (3 lines) and the two conclusion readers for `affordanceFacts` until `affordances` moves (2). About 8 lines.
- `legacy-index`: the import of the Worker-side file and the two calls (about 4).
- `legacy-checks`: re-exports of C-41, `checkCaseDocument`, `checkPublishedExtension`, the helpers and rows for callers not yet moved (`gate.mjs`'s `runCaseGate` until the registration, `affordances`, the old battery): about 10; the copy of `isCaseMemberBytes`/`caseEditionClaimed` for C-3.1 stays.

## 6. Undetermined, conflicts, and code others could claim

1. **Writes through `publication`.** `ratifyCaseDocument` and `publish` insert into `publication`'s tables today; they call its R22 after the split. The ordering inside one transaction (commit, then flags discharged, then the container once) is kept by the caller.
2. **`SUBJECT_POSITIONS` and `SEARCHED_SUBJECT_SOURCES`** move here rather than to `case-authoring`: this module's checks read both, and it is earlier.
3. **`isCaseMemberBytes` has a layer-1 caller** (C-3.1's heading rule). The copy in `legacy-checks` is two predicates that must agree; the job adds a test that they answer alike over the case-member fixtures.
4. **C-92 splits**: C-92.1–.9 (the op) are `publication`'s, C-92.10–.12 (the gates) here.
5. **`promotion`'s R33** still names `checkCaseDocument` from `legacy-checks`; its wording changes to "the registered catalogue" (K94), and the registration it offers is not yet provided.
