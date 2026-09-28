# review (T8)

**Status** · session_01B11NRC4vX3HGNywo9Ky3Cz · depth 2 · WAITING ON BOB (J2) · handled B4

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
