# case-authoring → case-inputs — split map (N908)

**Status** · Draft by a helper for BOB #162, 2026-10-12; N908; reviewed by BOB #162; ruled K2982.

**Why.** `plan/next.md` N908: case-authoring is 4,072 lines with comments after T45-21. That is past K617's ~4,000 mark as measured with comments (M-T45-6). Its split is planned for T47 by copy, then delete (K624, K531).

**Read whole:** `requirements/case-authoring.md`, its `modules.json` entry (index 113) and every user's entry, every file in its `paths`, and `extraction/agent-worker-split.md` (the format).
**Read in part:** the users' call sites, found by grep over `bio-plane/src` and `bio-plane/test` (bundles excluded). Tests were mapped by their headers and imports.
**Line numbers:** `tranche/T46` today.

## 0. The answer

**Size today (own code, K2513; with comments):** `index.mjs` 2,977, `document.mjs` 672, `checks.mjs` 241, `searched.mjs` 149, `schema.mjs` 93 = **4,132**. About 3,220 without comment-only and blank lines. T46-27 (R73) added the last ~60 lines.

**The cut is everything case-authoring holds that is not `op=publish` or its ceremony.** Each piece is an act or a registration *outside* `op=publish` that records something about a case, which `op=publish` later reads into the document. The new module is **`case-inputs`**. It takes four requirement groups:
- **R19–R21**, the statement's acknowledgements and who wrote the statement (`op=statementack`, `statementAcknowledgements`, `#statementWriter`), with R59's acknowledgement half and R62;
- **R39**, the drafts of what changed (`op=whatchangedpropose`, `op=whatchangeddrafts`);
- **R70**, the open-requests source that `action-replies` fills;
- **R71**, outcomes carried into the next edition (the service `consequences` calls), with **R73**, the words of R71's rows and of the sign step's open-request lines.

`case-inputs` takes **all four of case-authoring's tables**. case-authoring then holds no table, as `case-disclosures` holds none.

| | lines (with comments) |
|---|---|
| case-authoring after | about **3,020** (`index.mjs` ~2,180, `document.mjs` ~565, `checks.mjs` ~125, `searched.mjs` 149; `schema.mjs` deleted) |
| case-inputs | about **1,265** (`index.mjs` ~910, `document.mjs` ~120, `checks.mjs` ~140, `schema.mjs` 93) |

The calls run one way: case-authoring calls `case-inputs` and never the reverse. `case-inputs` calls nothing of case-authoring's, and its SQL reads only `publication`'s R40 tables and review's `case_drafts` (R21's read contract, as today).

A narrower cut is possible: acknowledgements and the drafts of what changed only, about 870 lines, leaving case-authoring at about 3,330 (doubt 1).

## 1. The new module

| | `case-inputs` |
|---|---|
| layer | 8 |
| place in `modules.json` | directly after `case-account` (index 112) and before `case-authoring`, which moves to 114. The order becomes `case-disclosures`, `case-account`, **`case-inputs`**, `case-authoring`, `review`, `case-check`. It must come after `case-account` because `carryOutcome` asks `case-account.accountShaped` for an outcome's cites. It must come before case-authoring because `publishCase` and `publishPreflight` call it. |
| paths / tests | `bio-plane/src/case-inputs/` / `bio-plane/test/m/case-inputs/` |
| from | none (not legacy; K624) |
| uses | `record-grammar` (`parseFrontmatter`, `isMachineIdentity`, `proposalLabel`, `createSha256`), `record-core` (`recordOf`, `stampInstant`, `mintExhausted`, `mintOpaqueId`, `transact`, `declarePurge`), `membership` (`isJoinedParticipant`, `sight`, `viewerPredicate`), `publication` (`reviewProvider`, `hasCaseStanding`, `reauthorSection`; R40's `cases`, `case_documents`), `publish-schedule` (`waitingEditionOf`), `case-grammar` (`SECTIONS`, `fmSafe`, `OUTCOME_KINDS`, `outcomesOf`), `case-account` (`accountShaped`). Tests: `test-support` plus the same real modules. |
| entry point | `caseInputsOf(host, deps)` (K61), created by case-authoring's factory so its tables exist and are declared at every boot (case-account R12's form); `caseInputsOps(c, url, body)`. |
| exports | `acknowledgeStatement`, `statementAcknowledgements`, `statementWriter` (was `#statementWriter`), `proposeWhatChanged`, `whatChangedDrafts`, `whatChangedDraftOf` (new, R7), `registerOpenRequests`, `openRequestsSource`, `openRequestsOn`, `openRequestLine`, `openRequestSentence`, `OPEN_REQUEST_KEYS`, `OPEN_REQUESTS_UNREAD_SENTENCE`, `carryOutcome`, `withdrawCarriedOutcome`, `carriedOutcomesOf`, `pendingOutcomes` (was `#pendingOutcomes`), `statementSha`, `ackFrontmatterLines`, `ackBodyLines`, `withheldWriterStated`, `ACK_PROSE_HEAD`, `STATEMENT_ACK_CHECKS`, `CARRIED_OUTCOME_CHECKS`, `CASE_INPUTS_WORDS`, `fillWords`, `WHAT_CHANGED_MAX`, `STATEMENT_ACK_MAX`, `STATEMENT_ACK_REASON_MAX`, `DRAFTS_READ_MAX`, `CARRIED_OUTCOME_PREFIX`, `CARRY_REASON_MAX`, `CASE_INPUTS_TABLES`. |

## 2. What moves (by copy, K624)

| moved | from (file:lines) | lines | to | case-authoring id |
|---|---|---|---|---|
| `OUTCOME_KINDS` re-export, `CARRIED_OUTCOME_PREFIX`, `CARRY_REASON_MAX`, `isDate` | `index.mjs` 236–247 | 12 | `case-inputs/index.mjs` | R71 |
| `OPEN_REQUESTS_DOORS`, `OPEN_REQUEST_KEYS`, `openRequestRow`, `replySaid`, `openRequestSentence`, `openRequestLine`, `OPEN_REQUESTS_UNREAD_SENTENCE` | 249–305 | 57 | same | R70, R73 |
| `#openRequests` field; `registerOpenRequests`, `openRequestsSource`, `openRequestsOn` | 309–310, 362–400 | 41 | same | R70 |
| `carryOutcome` … `#outcomeStates` (with `#ratifiedCase`, `#noSuchCase`) | 1457–1597 | 141 | same | R71 |
| `#caseInSight`, `proposeWhatChanged`, `whatChangedDrafts` | 1599–1663 | 65 | same | R39 |
| `#waits` (R59's read) | 2187–2192 | 6 | same | R59 |
| `acknowledgeStatement` | 2420–2656 | 237 | same | R19, R20, R59, R62 |
| `#draftLinkOf`, `#reauthorAcknowledgements`, `statementAcknowledgements` | 2658–2784 | 127 | same | R20 |
| `#statementWriter`, made public as `statementWriter` | 2786–2875 | 90 | same | R21 |
| `STATEMENT_ACK_MAX`, `WHAT_CHANGED_DRAFTS_MAX`, `WHAT_CHANGED_DRAFT_PREFIX`, `STATEMENT_ACK_REASON_MAX`, `DRAFTS_READ_MAX` | 134–143, 158–160 | 11 | same | R20, R21, R39 |
| `WHAT_CHANGED_MAX` | 137 | 1 | same (case-authoring imports it for R38: one spelling) | R38, R39 |
| ops `whatchangedpropose`, `whatchangeddrafts`, `statementack` | 2960–2975 | 16 | `caseInputsOps` | R39, R19, R62 |
| `statementSha`, `ackFrontmatterLines`, `ACK_PROSE_HEAD`, `ackUnboundLines`, `ackLinkLines`, `ackBodyHeadLines`, `ackBodyLines`, `withheldWriterStated` | `document.mjs` 39–43, 61–165 | 110 | `case-inputs/document.mjs` | R20 |
| `CASE_AUTHORING_WORDS` and `fillWords` (renamed `CASE_INPUTS_WORDS`; every key is R71's or R70's) | `checks.mjs` 15–49 | ~35 | `case-inputs/checks.mjs` | R73 |
| C-136.3–C-136.8 (as a new family object `CARRIED_OUTCOME_CHECKS`) | `checks.mjs` 92–133 | ~42 | same | R71, R73 |
| `STATEMENT_ACK_CHECKS` (C-82.2–C-82.8), whole | `checks.mjs` 186–241 | 56 | same | R19, R29 |
| the whole file: 4 tables, `CASE_AUTHORING_TABLES`, `migrateCaseAuthoring` | `schema.mjs` 1–93 | 93 | `case-inputs/schema.mjs`, renamed `CASE_INPUTS_*`, DDL unchanged (a running store keeps its rows) | R28, R71 |

**In the copy:**
- `COMPLETENESS_MAX` (R3) is used by `carryOutcome`. It is copied as `CARRIED_TEXT_MAX = 2000` (K57's copy rule), because case-authoring is later and cannot be imported.
- Each `where` becomes `src/case-inputs/index.mjs <fn> > <region>`. The DEC-49 REGION markers move with their code.
- New, about 8 lines: `whatChangedDraftOf(caseId, draftId)` → `{draft_id, text}` or null. R38's draft lookup (`index.mjs`:1448) is the only SQL case-authoring keeps on `what_changed_drafts`, and this read replaces it.
- No refusal text, code, number or translation changes.

## 3. What stays in case-authoring, and what it adds

- **Stays:** `publishCase` and `#publishCase` (R1–R18, R55–R58, R60, R61, R63, R65, R68, R69, R72); `calculationsAtPublication` and the calculations and timeline helpers (R56, R57); `#whatChangedJudged` (R38); `#approvalsHeld`, `#standardsUse`; `#authority`, `#judgeMembers`, `#counselMatters`, `#rolesOf`, `#barJudged`; `tensionsToDisclose` (R32); `publishPreflight`, `#ratifyPreflight`, `#preflightSteps`, `#openRequestsStep` (R34, R42, R53, R67, R68); `#caseCitations`, `#lensStatements`, `#searchedForCase` (R16, R17, R40); the ops `publishcase`, `publishtensions`, `publishpreflight`.
- **Stays in `document.mjs`:** `caseDocumentText` (imports the acknowledgement renderers from case-inputs), `CASE_CITATION_WORDS`, `CEREMONY_HIGHLIGHT_SENTENCE`, the calculation and timeline words.
- **Stays in `checks.mjs`:** `PUBLISH_ACT_CHECKS`, now C-32.6, C-33.14, C-136.1, C-136.2, and `CASE_DERIVATION_CHECKS` (C-44.1, C-44.3–C-44.6). `searched.mjs` stays whole.
- **The call sites that become `this.inputs.<x>`:**
  - `#publishCase`:1046 (`pendingOutcomes`), :1229 (`statementWriter`), :1234 (`statementAcknowledgements`);
  - `#whatChangedJudged`:1448 (`whatChangedDraftOf`);
  - `#openRequestsStep`:404–406 (`openRequestsOn`, `openRequestLine`, `OPEN_REQUESTS_UNREAD_SENTENCE`).
- **Added:** a getter `inputs` (`caseInputsOf(host)`), and `void c.inputs` in `caseAuthoringOf` next to `void c.account`.
- **Deleted:** the `declarePurge` call and `caseAuthoringOwns`, since the module holds no table.

## 4. Requirement ids

| case-authoring | case-inputs | what |
|---|---|---|
| R19 | **R1** | `acknowledgeStatement`'s doors and refusals C-82.2–C-82.8 |
| R20 | **R2** | keying, `existed`, re-authoring an unsigned document's list; `statementAcknowledgements`, the one list |
| R21 | **R3** | `statement_by`, `statementWriter` |
| R59 | **R4** | a waiting edition is signed for `acknowledgeStatement` |
| R62 | **R5** | `secretSha` from the body only |
| R39 | **R6** | `proposeWhatChanged`, `whatChangedDrafts` |
| new | **R7** | `whatChangedDraftOf`, the read R38 asks |
| R70 | **R8** | `registerOpenRequests`, `openRequestsOn` |
| R71 (its service, withdrawal, list and purge clauses) | **R9** | `carryOutcome`, `withdrawCarriedOutcome`, `carriedOutcomesOf`, `pendingOutcomes` |
| R73 | **R10** | the words: R71's rows and the sign step's lines (`openRequestLine`) |
| R28 | **R11** | the four tables declared whole to purge |
| R29 (C-82 and C-136.3–.8 share) | **R12** | the rows, ids, codes and translations unchanged |
| R25, R27 (R19's share), R30 | **R13–R15** | copies: stamps, the dead answer byte-identical, no place named |
| new | **R16** | created by case-authoring's factory; its ops spread by the plane (case-account R12's form) |

**Retired in case-authoring as "moved to `case-inputs` R<n>":** R19 → R1, R20 → R2, R21 → R3, R59 → R4, R62 → R5, R39 → R6, R70 → R8, R71 → R9, R73 → R10, R28 → R11.

**New in case-authoring:** **R74** takes the clauses of R71 that run inside `publishCase`:
- for an edition above the highest ratified one, every outcome `case-inputs` R9 answers pending is written into `case-grammar` R29's block;
- each outcome is judged as `case-account` R6's `kind: outcome`;
- R34's first step lists them.

**Re-worded in case-authoring** (meaning unchanged; BOB's wording):
- R14: the acknowledgement list is `case-inputs` R2's, and `statement_by` is its R3's;
- R29: drops C-82 and C-136.3–.8 and cites `case-inputs` R12;
- R34: open requests through `case-inputs` R8, their lines through its R10;
- R38: a named draft through `case-inputs` R7;
- R65: R71 becomes R74;
- R9 and R27 cite `case-inputs` for the grant door;
- Purpose, Uses, Status, the Size line, "Decided by BOB" 4, and the Old-ids list.

**Wording only elsewhere:**
- `review` (R18, R20 cite `statementAcknowledgements`);
- `consequences` R22 (`carryOutcome`);
- `action-replies` R3 (`registerOpenRequests`);
- `publication` R23, Suggestions ("acknowledgements in case-authoring");
- `skilldoctrine.mjs`:1142 `defined_by: "case-authoring R39"`;
- `op-grades`:561, `op-declarations` comments.

## 5. Users and what they re-point

| user (file:line) | uses today | re-points to | by |
|---|---|---|---|
| `review` `src/review/index.mjs`:273, :639 | `caseAuthoring.statementAcknowledgements` | `case-inputs` (its `uses` gains it; keeps case-authoring for `publishCase`, :549) | review's T47 job |
| `review` `test/m/review/invariants.test.mjs`:12–13 | `DRAFTS_READ_MAX`, the case-authoring namespace | `case-inputs` | same |
| `consequences` `src/consequences/index.mjs`:70, :327, :1367 | `caseAuthoringOf(host).carryOutcome` | `caseInputsOf(host).carryOutcome`; **`uses` drops case-authoring** for `case-inputs` | consequences' L9 job |
| `action-replies` `src/action-replies/index.mjs`:26, :434–439; `test/m/action-replies/fixture.mjs`:11 | `registerOpenRequests` | `caseInputsOf(host)`; `uses` gains `case-inputs`. `open.test.mjs` keeps case-authoring for the sign step it drives (a test edge, as today). | action-replies' L9 job |
| `plane` `src/plane/store.mjs`:56, :701 | `caseAuthoringOps` | also spreads `caseInputsOps(caseInputsOf(ctx), …)` directly before case-authoring's | plane's L11 job |
| `plane` `test/m/plane/maps.mjs`:47 | the op map | same | same |
| `answer-envelope` `src/answer-envelope/families.mjs`:124, :221; `test/m/answer-envelope/families.test.mjs`:219, :281 | case-authoring's `checks.mjs` | adds `src/case-inputs/checks.mjs` directly before case-authoring's; the order test pins it | answer-envelope's L11 job |
| `control-plane` `test/m/control-plane/statementack.test.mjs`:9, `digest-channel.test.mjs`:10, `r45-routes.test.mjs`:14 | `caseAuthoringOps`, `STATEMENT_ACK_CHECKS` | `caseInputsOps`, case-inputs' checks | control-plane's L11 job |
| `affordances` `test/m/affordances/catalogue.test.mjs`:231, :561, :796 | case-authoring's namespace, ops and checks | adds case-inputs' (`src/affordances.mjs`:99, `SELF_ATTESTED_SENTENCE`, is unchanged) | affordances' L11 job |
| `membership` `MODULE_ORDER` (`src/membership/index.mjs`:284), `module-order.test.mjs` | the ids | gains `case-inputs` after `case-account` (N415's precedent) | membership's job (L2) |
| `case-check`, `op-declarations` | `publishCase`, `publishPreflight`, op specs | none: the op names and their specs are unchanged | — |

## 6. Tests

**To `test/m/case-inputs/`** (a new `fixture.mjs`; it may not build case-authoring, which is later):
- `statement.test.mjs`, the R19–R21 arms. It stores an unsigned document through `publication.storeCaseDocument` rather than `publishCase`.
- `drafts.test.mjs`, the R39 arms.
- `outcomes.test.mjs`, the service, withdrawal and list arms.
- `openrequests.test.mjs`, R70's registration arms.
- `t46-words.test.mjs`, the row arms.
- `waiting.test.mjs`, the R59 arms.
- `invariants.test.mjs`, the purge and C-82/C-136 arms.

**Stay, re-tagged:** the end-to-end arms that need `publishCase` (N529's precedent):
- an acknowledgement listed in the document (R14), and the writer printed;
- an outcome written into an edition (R74);
- the sign step's lines (R34);
- R38's adopted-draft arm;
- R58.

## 7. Risks

1. **Purge declarations in the window.** `case-inputs` declares the four tables. While case-authoring still declares them, a host building both would have one declaration refused (`TABLE_DECLARED`; case-authoring throws on a refused one, K2675).
   - *Reading:* nothing composes both until case-authoring's job, which switches the declaration and creates case-inputs in the same commit. case-inputs' own tests build it alone.
   - This is why K2608 kept pass-throughs. K624's one-tranche copy-then-delete avoids them, provided no fixture of another module builds both in between.
2. **The C-136 family spans two files** (C-136.1–.2 in case-authoring, C-136.3–.8 in case-inputs). That is C-44's precedent (case-authoring and public-read). No id moves number. `CATALOG_VERSION` moves only if promotion's stamp counts `where`s: the rows' `where`s change.
3. **Ops change their owning map, not their names.** `statementack`, `whatchangedpropose`, `whatchangeddrafts`:
   - the control plane routes them by name and stamps `viewer`, `author` and the body `secretSha` (R62) as today;
   - their `op-declarations`, `op-grades` and affordances rows are unchanged.
4. **Generated artifact.** `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` (`not_product`) list `src/case-authoring/*.mjs` as inputs. They are stale from case-inputs' merge until the layer close regenerates them, and gain `src/case-inputs/*.mjs`. Release copies change only at the next release.
5. **Reds in the window** (K2438's form, accepted by name rather than bridged):
   - `consequences` (`carryOutcome`) and `action-replies` (`registerOpenRequests`) are red from case-authoring's delete until their L9 jobs merge;
   - so are `plane`, `control-plane`, `affordances` and `answer-envelope` tests until L11.
   - *Alternative:* one-line delegates in case-authoring until L9 and L11 (publication-split-2's form).
6. **`case_drafts`** (review's table, a later module) is read by `statementWriter` under review R26's read contract, as case-authoring reads it now. The edge stays a read contract, not a use.

## 8. T47 job sequence

1. **CASE-INPUTS (new, L8, first):** creates `src/case-inputs/` by copy (§2) and its tests (§6); `modules.json` row at 113, `requirements/case-inputs.md` (R1–R16, BOB's text). Merges early (K624).
2. **CASE-AUTHORING (L8, after 1 merges):** deletes the copies, re-points to `case-inputs` (§3), creates it in its factory, drops `schema.mjs` and its purge declaration, retires the ids (§4) and adds R74. Its `uses` gains `case-inputs`.
3. **REVIEW (L8):** re-points (§5).
4. **Membership (L2):** `MODULE_ORDER` gains `case-inputs`. This can run at T47's opening.
5. **L9:** consequences, action-replies. **L11:** answer-envelope, affordances, control-plane, plane re-point (§5). The bundle is regenerated at each layer close.

## 8a. Doubts for BOB

1. **Width.** The narrower cut (R19–R21, R59, R62, R39 only: about 870 lines; case-authoring about 3,330) is the more single-themed "the statement" seam, but leaves about 670 lines of headroom.
   - *Reading:* the wider cut. It leaves about 980 of headroom, takes every table, and R70 and R71 are already services case-authoring offers to layer 9, not part of `op=publish`.
2. **Name.** `case-inputs` (what other acts record that a case's next edition reads). *Alternatives:* `case-statement` for the narrow cut, `case-contributions`.
3. **Measure.** N908 counts comments (M-T45-6). Without them case-authoring is about 3,220, under the mark. *Reading:* K617's mark is with comments, as N908 says, so the split is owed.
