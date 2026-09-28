<!-- The ratification survey, split three ways from the publication map for BOB #43 on 2026-09-26 on tranche/T3 (K94); superseded where it disagrees with build/requirements/ratification.md. -->
# ratification — extraction map

**Status** · Measured 2026-09-26 on `tranche/T3` @ `f324df9b` (`bio-plane/` unchanged at `03e2481`) by a drafting worker for BOB #43 (P18), split from the publication map's [R] rows (K94). **Re-cited** on `tranche/T7` @ `fd7e691a17` by a worker for BOB #53 (K214), as `build/extraction/publication.md` states: `store.mjs`, `bio-checks.mjs` and module-file lines are current there; `index.mjs` cites were re-cited at T8's opening, on `tranche/T8` @ 12e2067a5f (K226). Ranges and "code" as `build/extraction/publication.md` states them; the extraction job confirms each. The contract is `build/requirements/ratification.md` (R1–R15); K3, K6, K31, K57, K61, K83 (3), K93 (3) and K94 apply. The module exports `ratificationOf(ctx)` (K61) and a Worker-side file for the two ceremonies. **`from`: `["legacy-store", "legacy-checks", "legacy-index"]`.** It uses `publication`; `case-authoring` uses it. It owns no table.

## 1. What moves

### store.mjs

| what | lines | code | requirement |
| --- | --- | --- | --- |
| `CASE_BEARING_STATES`, `#caseConclusionFor`, `#CONCLUSION_ENTRY_FIELDS`, `#editionsRecordingConclusion`, `#conclusionRowParsed`, `#sameRecordedConclusion`, `#recordedConclusionSummary` | 2882–3051 | 100 | R1 (K83 (3)) |
| `ratifyCaseDocument` | 8197–8497 | 179 | R3; its inserts (inside it) become calls to `publication.commitCaseEdition` |
| `gateFacts`, `publish` | 14652–14705, 14734–15232 | 175 | R4, R5, R7; `publish`'s inserts (inside it) become `publication.commitEdition` (the parent map's 274 is corrected) |
| dispatch `gatefacts` (18664), `caseratify` (18703), `publish` (18707) | about 6 | 6 | K3 |

Store: 1,118 lines (455 code) plus the dispatch.

### index.mjs (the Worker half; K3)

| what | lines | code | requirement |
| --- | --- | --- | --- |
| `testimonyFenceRow`, `ratifyScopeRow` | 3827–3844 | 12 | R2, R4 (C-53.10–.12, C-58); `machineFenceRow` (3845–) stays with the dispatcher's other fences |
| `attributionRow` | 3862–3868 | 6 | R2, R4 (C-92.10–.12); not in the parent map |
| `op=caseratify` block | 6592–6811 | 120 | R2 |
| `op=ratify` block | 6813–7533 | 311 | R4–R6 |

Index: 966 lines (449 code).

### bio-checks.mjs

| what | lines | code | requirement |
| --- | --- | --- | --- |
| `caseEditionClaimed`, `isCaseMemberBytes` | 233–256 | 9 | R9 (`legacy-checks` keeps a copy for C-3.1's heading rule at 1226) |
| `SUBJECT_POSITIONS` | 2617 | 1 | R9 (the parent map gave it to [A]; C-2.8 and C-41 read it) |
| `CASE_MEMBER_ROLES`, `biasAcknowledgementOf`, `completenessFields`, `checkPublishedExtension` (C-2.8 case arm) | 2631–2893 (`CASE_MEMBER_ROLES` 2631, `biasAcknowledgementOf` 2650, `completenessFields` 2655–2666, `checkPublishedExtension` 2668–2893) | 122 | R9 |
| `SEARCHED_SUBJECT_SOURCES`, `CASE_DOCUMENT_FAMILY` (C-41.1–C-41.15), `CASE_CITATION_VERSIONS`, `checkCaseDocument` (C-2.8, C-3.1, C-21.1 case arms) | 9837–10322 (`SEARCHED_SUBJECT_SOURCES` 9837–9842, `CASE_DOCUMENT_FAMILY` 9868–9888, `CASE_CITATION_VERSIONS` 9890, `checkCaseDocument` 9895–10322) | 285 | R8; the formats above them (9781–9809) are `publication`'s |
| `ATTRIBUTION_CHECKS` C-92.10–C-92.12 | 11353–11371 | 21 | R2, R4, R14 |
| `CASE_CONCLUSION_CHECKS` (C-65.1) | 11901–11910 | 10 | R3 |
| `RATIFY_SCOPE_CHECKS` (C-58.1–C-58.3) | 11972–12004 | 25 | R4, R5 |
| `MACHINE_FENCE_CHECKS` rows C-32.12–C-32.15 | 8022–about 8066 (inside `MACHINE_FENCE_CHECKS` 7910–8113) | 33 | R2, R4 |
| `TESTIMONY_CHECKS` rows C-53.10–C-53.12 | 11461–about 11486 (inside `TESTIMONY_CHECKS` 11373–11500, which `provenance` also reads: `provenance/index.mjs` 2103, 2211) | 24 | R2, R4 |

Checks: 1,136 lines (530 code).

**Measured size:** about 3,230 lines, about 1,440 of code.

## 2. What stays in a legacy module or goes elsewhere, and why

| what | where today | goes to | why |
| --- | --- | --- | --- |
| `#projectsDrawingOn` | `basis-versions` (R37); store delegate 11076 | `basis-versions` | moved; R1 reads it through basis-versions R37 (`queue`, layer 11, too) |
| `#conclusionOf`, `#conclusionRecordOf`, `#noProjectConclusionOf` | `basis-versions` (R22, R23); store delegates 2819–2821 | `basis-versions` | moved; R1 reads them through basis-versions R22 and R23 |
| `#memberTextAtSha` | store 6425–6432 | `record-core` (`textAtSha`, R60, K203) | called by R3 (K94); built in T8's layer 2 |
| `recordReuseVerdicts`, `reusedParts`, `captureLimit` | `capture/index.mjs` 1009, 992, 1084; store delegates 16559–16563 | `capture` (R26, R25, R23) | moved; `op=ratify` (R6) reads them through capture R23, R25, R26 |
| `partsHeld` | `provenance/index.mjs` 508, imported by index (151) | `provenance` (R7) | moved; R6 reads it through provenance R7 |
| `#caseAuthority`, `#inSight`, `#existenceAct` | store 14165, 14167, 14173 (delegates) | `membership` | already delegating |
| the published reads, `#publishEdges`, `#dischargeCaseFlags`, `assembleCaseContainer`, the formats | store, index, bio-checks | `publication` | called (its R5, R15, R20–R22) |
| `classify`, admission, the stamps, `machineFenceRow` | index | `control-plane` | K3; the handler receives the class |
| the C-3.1 heading rule's `isCaseMemberBytes` call | bio-checks 1226 | `legacy-checks` (its copy) | a layer-1 check cannot call layer 8 (K57) |

## 3. Callers to rewire

- `#caseConclusionFor`, `#editionsRecordingConclusion`: `publishCase` (4549, 4644; `case-authoring`), `ratifyCaseDocument` (8303, 8304), `#editionWarrantedForJoinedProjectOf` (14153, 14157; `affordances`).
- `checkCaseDocument`: `promotion`'s `runCaseGate` (`gate.mjs` 35, 336), through promotion R47 `registerCaseCatalogue` (K202), which R8 fills (Decided 1); the ratify handler through `completenessFields` (index 7132, 7137).
- `checkPublishedExtension`: legacy-checks' `checkInquiryExtension` (its call at bio-checks 2432, inside `checkInquiryExtension` 2300–2499, which `checkBundle` calls at 5356; kept in legacy-checks by K181 (1)), replaced by the registration (Decided 2). The call is inside this module's `from`, so the job removes it.
- `completenessFields`, `SUBJECT_POSITIONS`: `publishCase` (5177, 4409; `case-authoring`); `completenessFields` also `ratifyCaseDocument` (8389) and the ratify handler (index 7137). `SUBJECT_POSITIONS`: `affordances.mjs` (70, 551).
- `SEARCHED_SUBJECT_SOURCES`: `airun.mjs` (import 92, re-export 205, uses 248, 251), imported into the store at 320, moving to `case-authoring`.
- `isCaseMemberBytes`: the store's import (423) and the ratify handler (index 65, 7132).
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
5. **`promotion`'s R33** runs the registered catalogue: promotion R47 `registerCaseCatalogue` (K202) is the registration R8 fills; resolved.
6. **Registrations legacy-store fills in this module's name** (K206): none by name; R8's case catalogue is filled in promotion R47 by this module directly (legacy-checks' catalogue runs until it does), and R9's `checkPublishedExtension` arm is today a call inside legacy-checks' `checkInquiryExtension` (bio-checks 2432), removed by this job.
