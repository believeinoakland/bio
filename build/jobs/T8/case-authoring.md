# case-authoring (T8)

**Status** · session_013mdoyx9b1ho4qUnQHZZifh · depth 2 · COMPLETE · handled B7

## J1 · QUESTION

Six points; I am building on the reading given in each, and only (1) decides when my tests can run.

1. **Providers in my own layer.** `publishCase` and `acknowledgeStatement` call publication, ratification and (through publication R23) review, all concurrent in layer 8 and none built yet. My reading of the plan ("a user builds against its provider's Provides, and BOB merges a provider early", §4): I build against their Provides through `publicationOf(ctx)` and `ratificationOf(ctx)`, and my interface tests go green only once you merge publication's and ratification's branches into `tranche/T8` and I merge it. Until then I extract, rewire and write the tests. Please tell me when they land, or if you want another order.

2. **The call shapes I will use** (please confirm them with PUBLICATION #1 and RATIFICATION #1, or give me theirs):
   - publication: `caseRelation(id)` answering today's `#caseRelationOf` shape (`{member, …}`), which I pass unchanged to ratification's `editionsRecordingConclusion`; `storeCaseDocument({case, edition, text, author, draft})` → `{case_id, edition, doc_sha}`, exclusions projected inside it (replacing the store's `#projectCaseExclusions` call); `reauthorSection({case, edition, docSha, section: "acknowledgements", lines: {frontmatter, body}})`, the two runs delimited as today (frontmatter from `  statement_sha:` up to `completeness_excluded:`, prose from `**Who else read this statement.**` up to the blank line before `## What Was Searched`); `attributionStatements(case, edition, project, observations)` answering the rows, plus the two renderings as exports `attributionFrontmatterLines(rows)` and `attributionBodyLines(rows)` (I pass the observations from basis-versions `testimonyReach` over the roster, since at `op=publish` no document names the roster yet); `hasCaseStanding(doc, viewer)` on the instance; `CASE_DOCUMENT_FORMAT` as an export.
   - publication `reviewProvider()`: null, or an object with `draftForMember(draftId, viewer)` (the `case_drafts` row with `params` and `statement_by`), `draftIdentity(row)` → `{caseId, edition}`, `caseIdentitySentence(caseId, edition, newCase)`, `statedEdition(ident, newCase)`, `liveGrant(secretSha)` → `{grant, draft}` or null, and `deadAnswer()` (C-87.1, byte-identical). R23 lists the draft door, its identity and sentence, the live grant and the dead answer; `statedEdition` is the one addition (R20's answer states the edition through it). With no provider, R9 is C-44.3 and every grant or draft door of R19 is dead; but then there is no provider to give the dead answer's bytes. My reading: publication's `reviewProvider()` answers, with none registered, an object whose doors all refuse and whose `deadAnswer()` is still C-87.1's answer, so R19's bytes are one answer either way (the case-document door, which needs no provider, stays open to a member with standing).
   - ratification: `caseConclusionFor(project, inquiry, viewer, state)` and `editionsRecordingConclusion(inquiry, relation, conclusion)` on `ratificationOf(ctx)`; `completenessFields`, `SUBJECT_POSITIONS` as exports.

3. **`#caseConclusionRowLines`.** The map (§1) moves it to me, but ratification's `#editionsRecordingConclusion` renders what a new edition would record with it (store 3027), and ratification is earlier in the order, so it cannot import it from me. My reading: it is ratification's, exported as `caseConclusionRowLines(member, conclusion)`, and I import it for R14's `case_conclusions` rows. This moves a function between two modules of my layer (your call; tell RATIFICATION #1).

4. **Publication's tables.** `publishCase` reads `cases` (`case_id`, `project_id`), `published_cases` (`case_id`, `edition`, `completeness`, `bias_acknowledgement`, `ratified_at`), `published_case_members` (`case_id`, `bundle_id`), `published_bundles` (`bundle_id`, `edition`, `bundle_sha`) and `case_documents` (`case_id`, `edition`, `doc_sha`, `text`, `draft_id`, `authored_by`, `authored_at`, `sig_armored`, `ratified_at`); the acknowledgements' `#statementWriter` reads review's `case_drafts` (`draft_id`, `case_id`, `project_id`, `params`, `statement_by`, `created_at`) under `REVIEW_LIST_MAX`. Publication states no read contract and no service for R7's derivation (all cases per member, a case's highest edition, its owning project, the prior ratified edition's completeness) or R13 (a member's published edition at a sha). My reading: I keep these reads as SQL in one place in my module (my Suggestions say "becomes the owner's service or a stated read contract", which binds nothing), and I REPORT the columns so you can state them as publication's (and review's) read contract, as record-core R37 does. `REVIEW_LIST_MAX` I copy (K57).

5. **R12 (`UNCLEARED_HUNCH`).** My reading: a member carries uncleared hunch debt when its live basis (`inquiry.basisFor`) holds any leg whose `grade_source` is `hunch` (Declared Bias, "HUNCH DEBT": cleared means the case holds without it, so a hunch leg still in the basis is the debt). Refused `UNCLEARED_HUNCH` naming every such leg (`target`, `ord`, `leg_target`), with no catalogue row (R29 names none), asked after R6's bar and before R7's case identity, so no id is minted and nothing is written.

6. **R21's named-draft half.** My reading: when `draft=` names a draft (R9 admitted it) whose statement, as the document prints it, is the published sentence, `statement_by` is that draft's stamp (null, stated undetermined, when it has none), and no other draft is consulted; when the named draft holds another sentence, the project's drafts at this identity are asked as today; else the publisher.

## J2 · QUESTION

Merged `tranche/T8` (K240, K241) and applying B2. One point in it I cannot follow as written: `review` is AFTER `case-authoring` in the order (`modules.json`: 48 publication, 49 ratification, 50 case-authoring, 51 review), so I cannot import `REVIEW_LIST_MAX` from review (P4; the architecture check refuses it), and `statedEdition` and `caseIdentitySentence` likewise reach me only through the review provider (which R23's registration now carries, so those two are fine).

My reading, on which I am building: I keep my own `DRAFTS_READ_MAX = 500`, equal to review's `REVIEW_LIST_MAX` (K57's copy rule, the way this module keeps its own `SELECTION_ID_CHUNK`), with a comment naming review R26 as the bound it mirrors, and my test pins the two equal from review's side is impossible for me, so I state it in my record for review's job to test. If you would rather it arrive on the provider (`registerReviewProvider({…, listMax})`), say so and I read it from there, falling back to 500 with no provider.

## J3 · REPORT

Interim, while I wait for publication and ratification to land (my module and 38 interface tests are built and pushed; the tests pass against both branches' current code in a scratch copy, never pushed). Four points for other modules, two of them for jobs still running:

1. **publication (in flight): the review provider's door names.** PUBLICATION #1's pushed code registers and answers the doors `draftFor`, `draftIdentity`, `grantAdmits`, `liveGrant`, `deadAnswer`, and its no-provider object's `deadAnswer()` is a plain `NO_REVIEW_COPY` with no row. K240 names `draftForMember`, `caseIdentitySentence`, `statedEdition`, `grantAdmitsCaseEdition` and a `deadAnswer()` that is C-87.1's bytes; I call those names. One of the two needs to move before the merge.
2. **legacy-checks, a merge conflict at the layer close:** publication removes C-44.2 from `CASE_DERIVATION_CHECKS` and I remove C-44.1, C-44.3–C-44.5 from it; merged, the family is empty and the two removals conflict in `bio-checks.mjs` (they touch adjacent lines). Resolution: take both removals (the family becomes `{}`, or goes with its header once store's `refusal()` helper, which reads it for C-44.2, has moved with `#resolveOneCase`).
3. **legacy-checks: C-32.6 cannot leave the catalogue.** `MACHINE_FENCE_CHECKS.MACHINE_CANNOT_PUBLISH` is read by key by `skills` (`skilldoctrine.mjs` 252), an earlier module that cannot import from me, so the row stays in the catalogue and my R1 answers with it (check, code, translation, which the refusal did not carry before). Its `where` still names `src/store.mjs publishCase > is-machine-publish`; the region is now `src/case-authoring/index.mjs publishCase > is-machine-publish`. That `where` is legacy-checks' to re-point (a legacy module I may only remove from). I defer R29's C-32.6 arm with this reason.
4. **provenance R48: a column the searched section reads.** `#searchedForCase` picks each capture's address as the one its EARLIEST receipt names (`MIN(first_retrieved)` over `captured_locators`, grouped by capture), and `first_retrieved` is not in R48's read contract (`address_norm`, `address`, `retrieval_locator`, `capture_sha`). I kept the read as it was (R17's "earliest fetch answers was this looked for"); R48 needs `first_retrieved` added, or I read `MIN(address_norm)` instead. Your call.

At completion I will add the old battery's re-anchoring list (legacy-tests) and the stale bundle.

## J4 · REPORT

B4 applied: `tranche/T8` (publication) merged into `job/T8/case-authoring` and pushed (f94565dfbf). Calls reconciled with what was built: `storeCaseDocument` and `reauthorSection` take `case` or `caseId` (I pass `caseId`), both answer `{case_id, edition, doc_sha}`, and the review provider's doors are K240's names (`REVIEW_DOORS`), which I already call; no change to my module was needed.

Merge resolutions: in `store.mjs` both imports, both purge filters and both op spreads kept; the two removed blocks (publication's case-document code, my `#searchedForCase` and `publishcase` op) both dropped. In `bio-checks.mjs` both removals taken, so `CASE_DERIVATION_CHECKS` is now `{}` (J3 point 2). One consequence for legacy-store: store's module-level `refusal(key)` helper (store.mjs 507) and its `CASE_DERIVATION_CHECKS` import now read an empty family, and nothing in store calls that helper any more (the `refusal(...)` calls left in store are local helpers of other methods). It is dead code for whoever closes the layer.

Status: my 38 interface tests pass against the merged publication plus ratification's pushed branch, in a scratch copy. format, architecture and coverage (30 of 30) report 0 failures, and ownership reports 0 failures (legacy-store +7/−3017, legacy-checks +0/−108). I am waiting on ratification's merge to run the tests in the repo and the old battery, and then complete.

## J5 · COMPLETE

`case-authoring` is built on `job/T8/case-authoring` (pushed, 4fbcf25c97 and the mail commits after it), with `tranche/T8` merged in (publication and ratification). Every live id, R1–R30, is named by an interface test that passes in the repo.

**Entries applied**
- **Extraction, per the map and the requirements.** `publishCase`, the statement acknowledgements, the case document's builder and the searched section moved into `bio-plane/src/case-authoring/`. Moved with them: `statement_acknowledgements` (its DDL and its whole-table purge declaration), rows C-44.1, C-44.3–C-44.5 and C-82.2–C-82.7 (`checks.mjs`, each `where` naming this module's region), and the dispatch entries `publishcase` and `statementack`. `searchedSection` and `SEARCHED_LEVEL_OUTCOMES` now live in `searched.mjs` (N138's share of `airun.mjs`).
- **Calls to the layer's providers.** Publication: `caseRelation`, `storeCaseDocument`, `reauthorSection`, `attributionStatements`, `hasCaseStanding`, the review provider under K240's door names, and `CASE_DOCUMENT_FORMAT`. Ratification: `caseConclusionFor`, `editionsRecordingConclusion`, `caseConclusionRowLines` and `completenessFields`. Reads of publication's tables use R40's contract. `DRAFTS_READ_MAX = 500` mirrors review R26 (K242).
- **R12 (new).** A member whose live basis holds a leg with `grade_source: hunch` is refused `UNCLEARED_HUNCH`, naming every such leg. The check runs after the bar and before the case identity is derived, so nothing is minted or written.
- **R21's named-draft half (new).** The named draft's stamp decides `statement_by` when its statement is the published sentence.
- **R7 third route.** Now reads the prepared case from `publication.caseRelation`.
- **R11 reachable.** A clock answering a string is used as is.
- **R1 refusal.** Now carries the check, code and translation of the catalogue's C-32.6 row.
- **B7.** Removed store's dead `refusal(key)` helper and its `CASE_DERIVATION_CHECKS` import. `CASE_DERIVATION_CHECKS` is `{}` in the catalogue, left for N212.

**Deferred**
- **R29's C-32.6 arm (B5, item 3).** The row stays in the catalogue because `skills` reads it by key. Its `where` still names `src/store.mjs publishCase > is-machine-publish` and is N212's to re-point. My R29 test pins that the fence answers with that row; it does not pin the region.

**Found in other modules**
1. **legacy-tests: re-anchoring the old battery.** I ran the battery on `tranche/T8` (without me) and on my branch, suite by suite. Every difference is one of three kinds. Behind each hunch refusal I reran with R12 switched off in a scratch copy: nothing else differed.
   - *Imports of rows that moved to this module.* `d150-statement-acknowledgement`, `d507-statement-ack-translation` (`STATEMENT_ACK_CHECKS`), `rec217-draft-binding` and `multicase` (`CASE_DERIVATION_CHECKS`), and `caseflip` (C-44.2, now publication's `CASE_RESOLUTION_CHECKS`) no longer load. With the imports re-pointed in a scratch copy, d150 and rec217 match the baseline exactly (64/0, 27/0) and caseflip does better (59/0 vs 58/1). d507 and multicase then differ only by source scans (next item).
   - *Source scans pinned to `src/store.mjs`.* The text they look for now lives in `src/case-authoring/`. Suites and extra failures:
     - bias: 3
     - casepin: 2
     - caselifecycle: 1 ("only a CONCLUDED finding may be a case member")
     - case-opened: 3 (the REC-58 anchors)
     - rung-ladder: 1 (the dispatch route)
     - refusal-wire: 2 (the fence harvest)
     - machinefences-dec49: 2 (C-32.6's and C-33.14's `where`)
     - machine-fences: 1 (the harvest's module list lacks case-authoring)
     - d507: 28 (`where` strings, and minting sites in `src/store.mjs`)
     - multicase: 4 (site 1 of 9, and the row/region/helper arms)
   - *Fixtures that publish over hunch debt, which R12 now refuses.* `caseobject` and `shadowed-refusals` (`ratifyCase` throws), and `machine-fences` (one arm). Each grades a connection leg `grade_source: hunch`. By DEC-20 that is hunch debt and blocks publication, so these fixtures need a grade the record earns, not an exemption.
   - Unchanged by me, red on `tranche/T8` too: `publish` (section 9's old-shape migration, `NOT NULL constraint failed: published_bundles.edition`), `caseproduction` 80/6, `derivation-bounds`, `meaning-bounds`, `bounds`, `gate-reads`, `d470-catalog-census`, `reviewcopy-inband`, `projection-noproject`, `hygiene` 1334/1.
2. **legacy-checks.** C-33.14's `where` (`src/store.mjs publishCase > is-publish-statement`), like C-32.6's, names a region that now lives in `src/case-authoring/index.mjs`. Both are N212's.
3. **The bundled worker.** `dist/bio-plane.bundled.mjs` is stale against the extraction until it is rebuilt.
4. **review.** My `DRAFTS_READ_MAX` equals review's `REVIEW_LIST_MAX` (R26) only by copy. Review's job should test the two equal from its side, because I cannot import from a later module.

**Tests and checks**
- `node --test test/m/case-authoring/`: tests 38, pass 38, fail 0, todo 0. Negative controls (each caught): hunch check off; named-draft half off; preparation route off; `withheld_stated` off; C-32.6 row off; `transact` off.
- `format`: 69 modules, 64 requirements files; 0 failures.
- `architecture`: 12 product files, 56 relative imports (0 naming no tracked file, not judged); 0 failures.
- `coverage`: 1 modules, 30 of 30 live requirement ids named by a test; 0 failures.
- `ownership` (against `origin/tranche/T8`): 16 files changed by case-authoring; legacy-store: 7 line(s) added, 3031 removed; legacy-checks: 0 line(s) added, 108 removed; 0 failures.

Size (session_013mdoyx9b1ho4qUnQHZZifh): test runs 72, module lines 2257
