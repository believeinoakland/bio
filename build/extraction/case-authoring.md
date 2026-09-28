<!-- The case-authoring survey, split three ways from the publication map for BOB #43 on 2026-09-26 on tranche/T3 (K94); superseded where it disagrees with build/requirements/case-authoring.md. -->
# case-authoring — extraction map

**Status** · Measured 2026-09-26 on `tranche/T3` @ `f324df9b` (`bio-plane/` unchanged at `03e2481`) by a drafting worker for BOB #43 (P18), split from the publication map's [A] rows (K94). **Re-cited** on `tranche/T7` @ `fd7e691a17` by a worker for BOB #53 (K214), as `build/extraction/publication.md` states: `store.mjs`, `airun.mjs`, `bio-checks.mjs`, `schema.mjs` and module-file lines are current there; `index.mjs` cites were re-cited at T8's opening, on `tranche/T8` @ 12e2067a5f (K226). Ranges and "code" as `build/extraction/publication.md` states them; the extraction job confirms each. The contract is `build/requirements/case-authoring.md` (R1–R30); K3, K6, K57, K61, K82 (5) and K94 apply. The module exports `caseAuthoringOf(ctx)` (K61); `legacy-store` delegates to it. **`from`: `["legacy-store", "legacy-checks"]`**; nothing moves from `index.mjs`. It uses `publication` and `ratification`.

## 1. What moves

### store.mjs

| what | lines | code | requirement |
| --- | --- | --- | --- |
| `publishCase` | 4294–5564 | 506 | R1–R15, R18; its `case_documents` insert (inside it) becomes `publication.storeCaseDocument` |
| `CASE_CITATION_WORDS`, `#caseCitations`, `#caseDocumentText`, `#caseConclusionRowLines`, `#searchedForCase` | 5592–6336 (`#caseDocumentText` 5642–6126, `#caseConclusionRowLines` 6135, `#searchedForCase` 6195–6336, its `searchedSection` call 6335) | 467 | R14, R16, R17; with them the two evidence probes `#missingContentCause` (16759–16762) and `#missingMeaningCause` (16827–16839), whose only callers are in `#searchedForCase` (6309, 6329) |
| `STATEMENT_ACK_MAX`, `#statementSha`, `acknowledgeStatement`, `#ackFrontmatterLines`, `ACK_PROSE_HEAD`, `#ackUnboundLines`, `#ackBodyLines`, `#ackLinkLines`, `#ackBodyHeadLines`, `#withheldWriterStated`, `#reauthorAcknowledgements`, `#statementAcknowledgements`, `#statementWriter` | 7396–8121 (`acknowledgeStatement` 7401, `#reauthorAcknowledgements` 7844–7880, `#statementAcknowledgements` 7934–8023, `#statementWriter` 8058–8121) | 394 | R19–R21 (K82 (5)); the re-author update (inside `#reauthorAcknowledgements`) becomes `publication.reauthorSection` |
| `COMPLETENESS_MAX`, `MEMBER_ROLES` | 8499, 8513 | 2 | R3, R5 |
| `SEARCHED_SUBJECT_MAX` (with its comment) | 16768 | 1 | R17 (retrieval map: stays for this module) |
| dispatch `publishcase` (18598), `statementack` (18695) | 42 | 42 | K3 |

Store: 2,818 lines (1,370 code) plus the dispatch.

### airun.mjs (`ai-runs`' file)

| what | lines | code | requirement |
| --- | --- | --- | --- |
| `searchedSection`, `SEARCHED_LEVEL_OUTCOMES`, the `SEARCHED_SUBJECT_SOURCES` re-export | 146–366 (header 146, re-export 194–205, `SEARCHED_LEVEL_OUTCOMES` 209–223, `searchedSection` 245–366); the store imports them at 320 and calls `searchedSection` at 6335 (N138) | 101 | R17 (K82 (5); ai-runs map §2) |

### bio-checks.mjs

| what | lines | code | requirement |
| --- | --- | --- | --- |
| `CASE_DERIVATION_CHECKS` C-44.1, C-44.3–C-44.5 | 7800–7856, less C-44.2 | 33 | R7, R9, R29; C-44.2 (7822) is `publication`'s |
| `STATEMENT_ACK_CHECKS` (C-82.2–C-82.7) | 12367–12431 | 44 | R19, R29 |
| `MACHINE_FENCE_CHECKS` row C-32.6 | 7967 | 8 | R1, R29 |

Checks: 218 lines (85 code).

### schema.mjs (K4)

| table | lines | purge (R28) |
| --- | --- | --- |
| `statement_acknowledgements` | 1031 | whole, as today |

**Measured size:** about 3,340 lines, about 1,610 of code.

## 2. What stays in a legacy module or goes elsewhere, and why

| what | where today | goes to | why |
| --- | --- | --- | --- |
| `SUBJECT_POSITIONS` | bio-checks 2617 | `ratification` | C-2.8's case arm and C-41 read it (the parent map had it here) |
| `completenessFields`, `biasAcknowledgementOf` | bio-checks 2650–2666 | `ratification` | C-21.1 builds its side with them (R10 calls) |
| `#caseConclusionFor`, `#editionsRecordingConclusion` | store 2882–3051 | `ratification` | called (R4, R8) |
| `#caseRelationOf`, `#attributionStatements`, `#projectCaseExclusions`, `#hasCaseStanding`, the formats | store, bio-checks | `publication` | called (R8, R14, R19) |
| `projectBar`, `barAxisWords`, `strengthOf`, `STRENGTH_AXES` | `strength/index.mjs` 683, 78, 247; `strength/arithmetic.mjs` 16; store delegates 13512–13513; `publishCase` calls `strengthModule(this.ctx).projectBar` at 4724, and `#caseDocumentText` `barAxisWords` (imported at 393) at 6103 | `strength` | moved; read through strength R14 (`projectBar`) and R1–R5 (`strengthOf`), `barAxisWords` and `STRENGTH_AXES` as strength's exports (R6, R14) |
| `biasManifest` | `bias/index.mjs` 330–513; store delegate 18177 (called at 5380) | `bias` | called (R14) |
| the missing-row rule, `MEANING_EVIDENCE_IS_ONE_SIDED` | `observation-log/index.mjs` 101 (`missingCause`), 452 (`firstRowAt`), 472 (`missingCauseAt`); `observation-log/vocabulary.mjs` 731 (re-exported by airun 114) | `observation-log` (R11, R9) | read, not moved (K80); the two evidence probes that feed it stay in the store until this job and move here (§1), their only caller being `#searchedForCase` |
| `#reevalRaisedBy` | gone: reevaluation is extracted (K205); `publishCase` calls `reevaluationOf(this.ctx).raise` at 5301 | `reevaluation` (R7) | called (R15) |
| `testimonyReach` | `basis-versions/index.mjs` 526; store delegate 9664 (called at 5443) | `basis-versions` (R39) | moved; read through basis-versions R39 (R14) |
| review's draft, grant and dead-answer helpers | store 6587–7362 | `review` | reached through `publication`'s provider (its R23) |
| `SELECTION_ID_CHUNK` | `retrieval/schema.mjs` 100 (re-exported by `retrieval/index.mjs` 33); the store's static 1548 re-exports it | `retrieval` | this module keeps its own equal constant (K57) |
| `refusal()`, `#fmSafe` | store 524–527, 8523–8525 | shared | copied (K57) |
| `DO_PATH`'s alias of `op=publish`, the stamps of `publish` and `statementack` | index | `control-plane` | K3 |

## 3. Callers to rewire

- `publishCase`: `#reviewGates` (6895, inside 6890–6911; review's dry run, R18).
- `#statementAcknowledgements`, `#withheldWriterStated`: `reviewCopy` (7245, 7259).
- `#statementSha`: `acknowledgeStatement` (7584) and `#statementAcknowledgements` (7936).
- `searchedSection`: `#searchedForCase` only (6335; the import at 320); `airun.mjs` keeps no copy after `ai-runs`' later job (N138).
- `#missingContentCause`, `#missingMeaningCause`: `#searchedForCase` only (6309, 6329, the capture kind); they move with it and call observation-log's `missingCause`/`missingCauseAt` (R11).
- `COMPLETENESS_MAX`, `MEMBER_ROLES`: only `publishCase`.

## 4. Old-battery tests

Suites that drive `op=publish` and `op=statementack` and follow this module: `publish`, `d442-publish-writes-nothing`, `d150-statement-acknowledgement`, `d507-statement-ack-translation`, `rec212-statement-writer`, `rec217-draft-binding`, `rec219-case-document-v4`, `casesearched`, `d84-case-manifest`, `caseproduction` (with `ratification`). Source-reading suites from the parent map's §4 that name this module's code re-anchor here (K53); the job confirms which: `bias`, `case-authority.control`, `casesign.control`, `d280-strengthbar`, `d470-catalog-census`, `d543-instant-precision`, `derivation-bounds`, `frontier-chunk` (and `.control`), `meaning-bounds`, `nc-d178`, `projection-noproject`, `reviewcopy`.

## 5. Lines added to the legacy modules

- `legacy-store`: the factory import and delegating `publishCase`, `acknowledgeStatement`, `statementAcknowledgements`, `withheldWriterStated`, `statementSha` for the review helpers until `review` moves (about 6 lines).
- `legacy-checks`: re-exports of C-44.1/.3–.5, C-82 and C-32.6 for callers not yet moved (about 3).
- `ai-runs`: none; a later job deletes `airun.mjs` 146–366 (nothing there calls it; N138, after this module).

## 6. Undetermined, conflicts, and code others could claim

1. **`airun.mjs` is `ai-runs`' file** (layer 6, extracted first). A job writes only its paths, so this module copies `searchedSection` in and `ai-runs` deletes its copy; until then the two are one text. If `ai-runs` is extracted after this module, its job simply leaves the range out.
2. **Writes through `publication`**: the document store and the acknowledgement list's re-author (R14, R20) call its R21; the text builders stay here.
3. **`review`**: the dry run (R18) and the one acknowledgement list (R20) are what it calls; where it sits is `publication`'s Open for Bob 1.
4. **Registrations legacy-store fills in this module's name** (K206): none. Reevaluation's raise, which legacy-store answered for it at T3, is now reevaluation's own (K205), and `publishCase` already calls it (5301).
