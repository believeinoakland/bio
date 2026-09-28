# review (T8)

**Status** · session_01B11NRC4vX3HGNywo9Ky3Cz · depth 2 · RUNNING until 2026-09-28T09:03:12Z (old-battery comparison after case-authoring) · handled B8

## J1 · QUESTION

Five points where review's Uses name services its providers (publication, case-authoring) have not yet built. Both jobs run beside me in layer 8. Below is my best reading of each. I am going ahead on the parts that do not depend on them: the checks, the tables, the draft, grant and revoke acts, the predicates R8–R9, comment, list, R17, and store's dispatch and delegates.

1. **Names I will build against.** `publicationOf(host)` from `../publication/index.mjs` and `caseAuthoringOf(host)` from `../case-authoring/index.mjs`, reached lazily, with `deps.publication` and `deps.caseAuthoring` for tests. I will call:
   - case-authoring R18: `publishCase(args)`.
   - case-authoring R20: `statementAcknowledgements(project, caseId, edition, statement, exceptAuthor, writer, draftId)`, which returns the legacy shape `{statementSha, rows, truncated, byWriter, withheldWriterUndetermined}`.
   - publication R23: `registerReviewProvider({draftForMember, draftIdentity, caseIdentitySentence, statedEdition, liveGrant, grantAdmitsCaseEdition, deadAnswer})`.

   Please confirm each name, or give the right one. R15 also needs the `withheld_stated` sentence. Today that is `#withheldWriterStated`, and it sits in the acknowledgement code that goes to case-authoring. My reading: case-authoring exports it, or returns it with the list. I will not keep a second copy of it here.
   R13, R15, R16 and the R23 fill wait for your early merge of publication and case-authoring (§4). Until then their tests are `test.todo` naming this.

2. **R3 and R5 read a case's owning project and its highest published edition.** Today these are `cases.project_id` and `MAX(published_cases.edition)`. publication's Provides has no service for either: R9's `publishedEditions` is keyed by finding. My reading: publication states read contracts on `cases(case_id, project_id)` and `published_cases(case_id, edition)`, and I read them in my own SQL, named in my header, as reevaluation does with its read contracts.

3. **R16: the attribution level in force for (case, edition, observation).** Today this is `#attributionInForce`. publication R17 offers `attributionStatedFor(observation)`, which takes no case or edition. My reading: publication exposes the in-force read with those three arguments, named `attributionInForce(caseId, edition, observation)`, and I call it.

4. **What case-authoring needs from me that my Provides does not state:**
   - `#statementWriter` reads `case_drafts` directly (draft_id, project_id, case_id, params, statement_by, created_at) and bounds that read with `REVIEW_LIST_MAX`.
   - `acknowledgeStatement` uses `#statedEdition`, `#caseIdentitySentence` and `#draftLinkOf`.

   My reading:
   - I export `REVIEW_LIST_MAX`, and pure `statedEdition(ident, newCase)` and `caseIdentitySentence(caseId, edition, newCase)`.
   - `case_drafts` becomes a read contract in my Provides, or a service `draftsOfProject(projectId, {limit})`. Stating either is a change to my requirements, so it is yours to make.
   - `#draftLinkOf` (reading `case_documents.draft_id`, publication's table) stays with the acknowledgements, which move to case-authoring. No review code calls it, although my map §1 lists it here.

5. **Interim wiring in store.** The store's remaining callers are `publishCase`'s draft binding, `caseDocumentFacts`' grant door and `acknowledgeStatement`. I keep the private names they call (`#draftForMember`, `#draftIdentity`, `#liveReviewGrant`, `#grantAdmitsCaseEdition`, `#noReviewCopy`, `#caseIdentitySentence`, `#statedEdition`, `REVIEW_LIST_MAX`) as one-line delegates to `reviewOf(ctx)` (§12.2). That way I never edit the bodies publication and case-authoring are moving, and the merges do not conflict. If publication's job makes legacy-store fill its R23 provider from those names, the fill keeps working; once publication merges, I remove it and register my own (K206).

## J2 · REPORT

Progress, and what I am waiting on (no question).

- **Done on `job/T8/review` (pushed).**
  - `src/review/` (`index.mjs`, `checks.mjs`, `schema.mjs`).
  - store rewired: one-line delegates, the six ops through `reviewOps`, `reviewOf(ctx)` at construction.
  - C-87.1–.11 and C-32.16 moved out of the catalogue; the three tables moved out of `schema.mjs`.
  - Ownership: legacy-store 12 lines added, 912 removed; legacy-checks 0 added, 133 removed.
  - Module tests 26 pass, 0 fail, 1 todo (R26's `DRAFTS_READ_MAX` equality). Three negative controls fail as they should.
  - format, architecture and coverage are clean (25/25 at the time; R26 now covered).
- **B2 and B3 applied.** R15 reads case-authoring's `withheld_stated` from the list. R26 is tested.
- **Waiting on:** your CHANGE merging publication (`publicationOf`, `registerReviewProvider`, R39 `attributionInForce`) and case-authoring (`caseAuthoringOf`, `publishCase`, the list). Until then the plane's `op=reviewcopy` has no case-authoring to run its dry run against, so the old battery's review suites are red on this branch. Compared with base `tranche/T8`: reviewcopy 98/0 → 55/43, rec213 20/0 → 6/14, d573 12/0 → 4/8, d150 64/0 → 53/11, and others. I will re-measure and REPORT per suite once the providers are merged; I will not rewire interim adapters into the store.

## J3 · QUESTION

B4 is merged into `job/T8/review` and pushed. review now fills publication R23 itself (`registerReviewProvider("review", …)` in `reviewOf`), and legacy-store's fill is removed (K206). **One conflict stops publication from loading on my branch.**

publication (`src/publication/index.mjs` 42, 87) imports `REVIEW_COPY_CHECKS` from `bio-checks.mjs`. It uses C-87.1's `check` and `translation` in its no-provider fallback (`NO_REVIEW_PROVIDER.deadAnswer`). My R23 moves C-87.1–.11 (and C-32.16) out of the catalogue into `src/review/checks.mjs`. publication is earlier than review in the order, so it cannot import them from there.

I verified my side: with that one row temporarily restored in the catalogue, my suite gives 26 pass, 1 fail. The one failure is R23's "moved, not copied" assertion, as expected. The restore is not committed.

**Recommendation.** Publication's fallback stops reading C-87.1. It answers only while no module has registered the provider, which never holds once review is at start. My reading: publication makes it its own refusal, e.g. `REVIEW_PROVIDER_ABSENT`, or a bare `NO_REVIEW_COPY` with no row. That is a one-line change in publication's code, so it is publication's to make (I do not change another module).

The alternative is to keep a copy of C-87.1 in the catalogue. That breaks R23 (K6: each check moves, never copied), so I do not recommend it.

Until this is decided my branch's tests cannot load publication, so I am blocked (cause: needs BOB's ruling). Everything else is done; case-authoring's merge is still ahead.

## Completion

**Entries applied.**
- Extract per map and requirements (K102). `bio-plane/src/review/` (`index.mjs`, `checks.mjs`, `schema.mjs`) holds the review copy: the three acts behind one machine fence (R1–R7), the grant and sight predicates (R8, R9), the copy with its two doors and one dead answer (R10–R17), the comment (R18), the draft list (R19) and the six ops (`reviewOps`, K3). Behaviour moved unchanged, with one exception: `MACHINE_CANNOT_REVIEW` now carries its `code`, `check` and `translation` (R1: every refusal carries them).
- Moved from the legacy modules:
  - C-87.1–.11 and C-32.16 left `bio-checks.mjs` (R23). They sit in `REVIEW_COPY_CHECKS` with their ids and translations unchanged; only their `where`s changed.
  - `case_drafts`, `review_grants` and `review_comments` left `schema.mjs`. The module migrates them, including `statement_by`'s added column (formerly legacy-store's migration).
  - The three tables are declared to purge as whole-store tables (R24).
  - The store's `DRAFT`/`RVG` mint-ledger rows now live in the module, which seeds the ledger at start and again before its first mint (D-432).
- Used modules, each reached through its factory:
  - strength `projectBar` (R11).
  - basis-versions `testimonyReach` (R16; N67's share).
  - publication `attributionInForce` (its R39; R16) and its `cases` and `published_cases` read contract (its R40; R3, R5).
  - case-authoring `publishCase`, run inside `record.transact` and always rolled back (R13), and `statementAcknowledgements` with its `withheld_stated` (R15). These are N69's share.
- The registration rule (K206): review fills publication's review provider in `reviewOf`, and legacy-store's fill is removed.
- R26 (K240, K242): `REVIEW_LIST_MAX`, `statedEdition` and `caseIdentitySentence` are exported; `case_drafts` is a stated read contract; a test asserts `DRAFTS_READ_MAX` equals `REVIEW_LIST_MAX`.
- Legacy rewiring (§12.2), net a removal:
  - legacy-store: 3 lines added (the import, `reviewOf(ctx)` at construction, `...reviewOps(reviewOf(this.ctx), url, body)`), 920 removed.
  - legacy-checks: 0 added, 132 removed.
  - The interim one-line delegates were removed again once case-authoring took their callers.

**Deferred.** Nothing of this module. `MINT_EXHAUSTED` (the draft and grant mints, unreachable in practice) has no catalogue row; that is pre-existing, and allocating one is a catalogue decision (REPORT J4).

**Found in other modules / stale artifacts** (REPORT J4).

**Tests and checks.**
- `node --test bio-plane/test/m/review/`: tests 29, pass 29, fail 0, todo 0 (`acts` 9, `doors` 5, `copy` 8, `invariants` 7).
- Negative controls, each failing only the tests it should:
  - revocation check removed: R8, R10, R18 fail;
  - grant widened to editors: R2, R23 fail;
  - dry run not rolled back: R13, R20 fail;
  - start-time ledger seed removed: R4/R6's seed test fails.
  Each was restored green.
- Old battery, base `tranche/T8` @ 747c8048d7 against this branch, 25 suites:
  - Identical in 17, among them rec213-reviewcopy-writer 20/0, d573-lastchange-tie 12/0, rec212 46/0, project-discoverable 157/0, reviewcopy-inband 29/2, conclude-project 75/0, gate-reads 110/5, derivation-bounds 59/14, machine-fences 80/8, d470 11/2 and mint-ledger 23/3 (after the seed fix).
  - Better in one: bounds 199/7 → 201/5.
  - Differing only on source-text anchors: reviewcopy 98/0 → 95/3 (the `review_grants` DDL and `#seesProjectDrafts` read out of `schema.mjs`/`store.mjs`); d543 12/0 → 11/1 (its named-helper count over the store corpus); fence-e2e 53/2 → 50/5 (C-32.16's family harvest over the store and listed modules); opaque-ids 34/1 → 32/3 (the DRAFT/RVG mint sites looked for in the store corpus); d448-review-copy-translation (imports `REVIEW_COPY_CHECKS` from the catalogue, so it does not load).
- format: 69 modules, 64 requirements files; 0 failures. architecture: 8 product files, 30 relative imports; 0 failures. coverage: 26 of 26 live requirement ids named by a test; 0 failures. ownership: 12 files changed; legacy-store 3 added, 920 removed; legacy-checks 0 added, 132 removed; 0 failures.

Size (session_01B11NRC4vX3HGNywo9Ky3Cz): test runs 24, module lines 1003
