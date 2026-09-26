<!-- The case-authoring survey, split three ways from the publication map for BOB #43 on 2026-09-26 on tranche/T3 (K94); superseded where it disagrees with build/requirements/case-authoring.md. -->
# case-authoring — extraction map

**Status** · Measured 2026-09-26 on `tranche/T3` @ `f324df9b` (`bio-plane/` unchanged at `03e2481`) by a drafting worker for BOB #43 (P18), split from the publication map's [A] rows (K94). Ranges and "code" as `build/extraction/publication.md` states them; the extraction job confirms each. The contract is `build/requirements/case-authoring.md` (R1–R30); K3, K6, K57, K61, K82 (5) and K94 apply. The module exports `caseAuthoringOf(ctx)` (K61); `legacy-store` delegates to it. **`from`: `["legacy-store", "legacy-checks"]`**; nothing moves from `index.mjs`. It uses `publication` and `ratification`.

## 1. What moves

### store.mjs

| what | lines | code | requirement |
| --- | --- | --- | --- |
| `publishCase` | 7975–9273 | 506 | R1–R15, R18; its `case_documents` insert (9131–9138) becomes `publication.storeCaseDocument` |
| `CASE_CITATION_WORDS`, `#caseCitations`, `#caseDocumentText`, `#caseConclusionRowLines`, `#searchedForCase` | 9274–10035 | 467 | R14, R16, R17 |
| `STATEMENT_ACK_MAX`, `#statementSha`, `acknowledgeStatement`, `#ackFrontmatterLines`, `ACK_PROSE_HEAD`, `#ackUnboundLines`, `#ackBodyLines`, `#ackLinkLines`, `#ackBodyHeadLines`, `#withheldWriterStated`, `#reauthorAcknowledgements`, `#statementAcknowledgements`, `#statementWriter` | 11079–11815 | 394 | R19–R21 (K82 (5)); the re-author update (11558) becomes `publication.reauthorSection` |
| `COMPLETENESS_MAX`, `MEMBER_ROLES` | 12183–12197 | 2 | R3, R5 |
| `SEARCHED_SUBJECT_MAX` (with its comment) | 42195–42199 | 1 | R17 (retrieval map: stays for this module) |
| dispatch `publishcase` (49645–49681), `statementack` (49781–49785) | 42 | 42 | K3 |

Store: 2,818 lines (1,370 code) plus the dispatch.

### airun.mjs (`ai-runs`' file)

| what | lines | code | requirement |
| --- | --- | --- | --- |
| `searchedSection`, `SEARCHED_LEVEL_OUTCOMES`, the `SEARCHED_SUBJECT_SOURCES` re-export | 1405–1638 | 101 | R17 (K82 (5); ai-runs map §2) |

### bio-checks.mjs

| what | lines | code | requirement |
| --- | --- | --- | --- |
| `CASE_DERIVATION_CHECKS` C-44.1, C-44.3–C-44.5 | 9081–9101, 9110–9190 | 33 | R7, R9, R29; C-44.2 (9102–9109) is `publication`'s |
| `STATEMENT_ACK_CHECKS` (C-82.2–C-82.7) | 14237–14344 | 44 | R19, R29 |
| `MACHINE_FENCE_CHECKS` row C-32.6 | 9247–9254 | 8 | R1, R29 |

Checks: 218 lines (85 code).

### schema.mjs (K4)

| table | lines | purge (R28) |
| --- | --- | --- |
| `statement_acknowledgements` | 3576–3598 | whole, as today |

**Measured size:** about 3,340 lines, about 1,610 of code.

## 2. What stays in a legacy module or goes elsewhere, and why

| what | where today | goes to | why |
| --- | --- | --- | --- |
| `SUBJECT_POSITIONS` | bio-checks 2932 | `ratification` | C-2.8's case arm and C-41 read it (the parent map had it here) |
| `completenessFields`, `biasAcknowledgementOf` | bio-checks 2965–2982 | `ratification` | C-21.1 builds its side with them (R10 calls) |
| `#caseConclusionFor`, `#editionsRecordingConclusion` | store 6360–6588 | `ratification` | called (R4, R8) |
| `#caseRelationOf`, `#attributionStatements`, `#projectCaseExclusions`, `#hasCaseStanding`, the formats | store, bio-checks | `publication` | called (R8, R14, R19) |
| `#projectBar`, `#barAxisWords`, `strengthOf`, `STRENGTH_AXES` | store 13220–13267, 32206, 31644 | `strength` | called (R6, R14) |
| `biasManifest` | store 48076–48320 | `bias` | called (R14) |
| `#missingMeaningCause`, `#missingContentCause`, `MEANING_EVIDENCE_IS_ONE_SIDED` | store 42742, 41690; airun 790 | `observation-log` | called by `#searchedForCase` and `searchedSection` (K80) |
| `#reevalRaisedBy` | store 4798 | `reevaluation` | called (R15) |
| `testimonyReach` | store 20645–20682 | `basis-versions` | called (R14) |
| review's draft, grant and dead-answer helpers | store 10348–10660 | `review` | reached through `publication`'s provider (its R23) |
| `SELECTION_ID_CHUNK` | store 3353 | `retrieval` | this module keeps its own equal constant (K57) |
| `refusal()`, `#fmSafe` | store 601–605, 13167 | shared | copied (K57) |
| `DO_PATH`'s alias of `op=publish`, the stamps of `publish` and `statementack` | index | `control-plane` | K3 |

## 3. Callers to rewire

- `publishCase`: `#reviewGates` (10579, review's dry run, R18).
- `#statementAcknowledgements`, `#withheldWriterStated`: `reviewCopy` (10929, 10943).
- `#statementSha`: the review copy's normalisation note (10530, comment) and `reviewCopy` (10932).
- `searchedSection`: `#searchedForCase` only; `airun.mjs` keeps no copy after `ai-runs`' next job.
- `COMPLETENESS_MAX`, `MEMBER_ROLES`: only `publishCase`.

## 4. Old-battery tests

Suites that drive `op=publish` and `op=statementack` and follow this module: `publish`, `d442-publish-writes-nothing`, `d150-statement-acknowledgement`, `d507-statement-ack-translation`, `rec212-statement-writer`, `rec217-draft-binding`, `rec219-case-document-v4`, `casesearched`, `d84-case-manifest`, `caseproduction` (with `ratification`). Source-reading suites from the parent map's §4 that name this module's code re-anchor here (K53); the job confirms which: `bias`, `case-authority.control`, `casesign.control`, `d280-strengthbar`, `d470-catalog-census`, `d543-instant-precision`, `derivation-bounds`, `frontier-chunk` (and `.control`), `meaning-bounds`, `nc-d178`, `projection-noproject`, `reviewcopy`.

## 5. Lines added to the legacy modules

- `legacy-store`: the factory import and delegating `publishCase`, `acknowledgeStatement`, `statementAcknowledgements`, `withheldWriterStated`, `statementSha` for the review helpers until `review` moves (about 6 lines).
- `legacy-checks`: re-exports of C-44.1/.3–.5, C-82 and C-32.6 for callers not yet moved (about 3).
- `ai-runs`: none; its next job deletes `airun.mjs` 1405–1638 (nothing there calls it).

## 6. Undetermined, conflicts, and code others could claim

1. **`airun.mjs` is `ai-runs`' file** (layer 6, extracted first). A job writes only its paths, so this module copies `searchedSection` in and `ai-runs` deletes its copy; until then the two are one text. If `ai-runs` is extracted after this module, its job simply leaves the range out.
2. **Writes through `publication`**: the document store and the acknowledgement list's re-author (R14, R20) call its R21; the text builders stay here.
3. **`review`**: the dry run (R18) and the one acknowledgement list (R20) are what it calls; where it sits is `publication`'s Open for Bob 1.
