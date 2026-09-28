# publication (T8)

**Status** · session_019xHaikQ3bX9KRMWSzbkdBb · depth 2 · COMPLETE · handled B4

## J1 · QUESTION

My readings where the plan, map and requirements leave something open. I am building on each now; say if one is wrong.

1. **R21/R22 and the concurrent layer-8 jobs (map §6.1).** I build `storeCaseDocument`, `reauthorSection`, `commitEdition` and `commitCaseEdition` in `publication`, and I rewire the store's writers of my tables to them: the `case_documents` insert in `publishCase`, the two re-author UPDATEs (`#reauthorAcknowledgements`, `#reauthorAttributions`), and the commit INSERTs/UPDATEs in `ratifyCaseDocument` and `publish` (§12.2: removal plus a call). RATIFICATION #1 and CASE-AUTHORING #1 move those same functions concurrently, so the hunks will conflict at merge. My proposal: merge `publication` first (you merge a provider early, §4), and each of those jobs moves the already-rewired function, so after the split no other module writes my tables (R24 in one place).
2. **N163.** (a) needs a read that my Provides does not state. I propose **R38** `caseCitedParts({case, edition?})` → `{case, edition, project, owners: [project ids], parts: [{finding, version_sha, capture?, ...}] | undetermined}`, read from the ratified document's signed `case_citations` (R1's `citations`) plus the owning project. reevaluation (not in T8) would call it later. Please write it into my Provides, or tell me to leave (a) to a later tranche. (b) The `raise({source:"edition"})` call sits inside `publishCase` (store 5300), which is case-authoring's, so I read "moves with it" as moving with `publishCase` to case-authoring. I do not touch it. (c) N152: I register `publishedRegistry` myself, below.
3. **The snapshot rows.** D-734 (a ratified case document's `doc_sha` is a published hash: `op=verify` answers it and `op=publishedbytes` serves it, re-hashed; `CASE_DOCUMENT_UNSERVABLE` otherwise) and D-712 (`op=publishedcase` serves `document`) meet R8, R10 and R13, so I am adopting both. D-613 (`DUPLICATE_PATH` at 409, not 413) is R13's, so I am applying it. D-618, D-626, D-680, D-683, D-703, D-708, D-720, D-721, D-725 and D-728 are all in `publishCase`, `#statementWriter`, `#caseIdentitySentence`, `op=statementack` or the drafts. That code is case-authoring's or review's, none of it is in my paths, and no requirement of mine names it, so I leave them to those jobs and REPORT them. D-742 needs the live record, so I do not do it here.
4. **N67 (C-2.8 stops calling `checkPublishedExtension`, `bio-checks.mjs` 2535).** If I remove the call before ratification's R9 registration lands, the check goes dark between merges. My proposal: I remove the call in the same merge that brings ratification's registration in, or RATIFICATION #1 removes it with the registration. Until you say, I leave line 2535 alone.
5. **R30 (D-246), R32, R35, R36, R37.** R35, R36 (`registerEvidenceBlock`) and R37: built. R32: no tranche is named for it (K102), so I leave it `test.todo`. R30: I will build `pixels_sha256` on published renderings if I find where renderings enter `published_shas`. Otherwise R30 gets a `test.todo`, and I tell you why.
6. **N127.** `auditPass`' unbounded `sighted` SELECT becomes a memoised one-row visibility probe per id, in the store. These are changed lines in legacy-store beyond an import and its uses, so the ownership check will list them for you.

## J2 · QUESTION

**This replaces J1 item 1.** Items 2–6 of J1 stand.

1. **R21/R22, revised.** The ratification and case-authoring maps already say it: `ratifyCaseDocument`'s and `publish`'s inserts "become calls to `publication.commitCaseEdition` / `commitEdition`" and `publishCase`'s insert "becomes `publication.storeCaseDocument`", when those jobs move the functions (their maps §1 and §6). So I build R21 and R22 in `publication`, with tests, and I **do not** carve the SQL out of `publishCase`, `#reauthorAcknowledgements`, `ratifyCaseDocument` or `publish` in the store. Those functions leave with their own jobs, and each job rewires its own writes to R21/R22. In the store I rewire only the calls those functions make to private methods that move to me (`#publishEdges`, `#dischargeCaseFlags`, `#caseEditionState`, `#caseDocMemberFrozen`, `#pinnedCaseEditionsOf`, `#soleCase`, `#ratifiedFindingsRestingOn`, `#frozenFromPinningDocuments`, `#casesOfSha`, `#projectCaseExclusions`, `#attributionStatements`, `#hasCaseStanding` …). Each becomes a one-line `publicationOf(this.ctx).<name>(…)`. That keeps the merge conflicts with RATIFICATION #1 and CASE-AUTHORING #1 to those call lines. `#reauthorAttributions` is mine, and it moves and calls `reauthorSection` itself.
2. **R20, the formats.** `checkCaseDocument` (C-41) in `bio-checks.mjs` still reads `CASE_DOCUMENT_FORMAT*` and the three predicates, and legacy-checks is first in the order, so it cannot import them from me. My reading: `publication` exports R20 (re-exported from `bio-checks.mjs` for now), and every caller outside the catalogue imports it from `publication`. The definition moves physically into `publication` once C-41 leaves the catalogue (with ratification). A second copy would break R20's "one reading". The map's §5 "re-exports in legacy-checks" is impossible for the same reason (the catalogue cannot import a later module).

## J3 · REPORT

**Provides ready for the early merge (B2 item 1).** R21, R22, R23 and R38–R40 are built and tested on `job/T8/publication`, which is pushed, so you can merge it into `tranche/T8`.

- **R21:** `storeCaseDocument({case, edition, text, author, at?, draft?})` and `reauthorSection({case, edition, docSha, section, lines: {frontmatter, body}})`. The sections are `attribution` and `acknowledgements`. Both answer `{case_id, edition, doc_sha}` read back.
- **R22:** `commitEdition` and `commitCaseEdition` in B4's shapes (`case` or `caseId`). `commitCaseEdition` answers `awaiting` and `state`. `commitEdition` carries all of `publish`'s commit half, plus R35 (`namesServed` when a name edge turned into a serve edge).
- **R23:** `registerReviewProvider(provider)` or `registerReviewProvider(module, provider)`, with the doors `{draftForMember, draftIdentity, caseIdentitySentence, statedEdition, liveGrant, grantAdmitsCaseEdition, deadAnswer}`. `legacy-store` registers them in its constructor. With none registered, every door refuses and `deadAnswer()` gives C-87.1's bytes.
- **R38:** `pinnedCaseEditionsOf`, `ratifiedFindingsRestingOn` and `caseClaimsOf`.
- **R39:** `attributionInForce`.
- **R40:** read contract, tested by the columns.

**Also on the branch:**
- The store reaches everything that moved through one-line private delegates (B3). The movers' bodies are untouched.
- The facts `caseMember`, `publishedRegistry` and `publishedCaseRegistry`, and the revision-flag projection, are registered by `publication`. legacy-store's two registrations are removed (K206, N152).
- `index.mjs` binds its helpers to `publication/worker.mjs` and delegates `op=publishedcase` and `op=publishedbytes`.
- For callers outside the catalogue, R20 is exported from `publication` (re-exported from `bio-checks.mjs`).

**Tests:**
- `test/m/publication/`: 41 pass, 0 fail.
- Old battery: casesign, casepin, rec170-manifest-pair and exportnotice pass under miniflare.
- Checks: format 0 failures; architecture 0 failures; ownership 1 failure, the N127 lines (store 8106–8108) you said you would read at the close.

I am still working: R13, R15, R16, R18, R19, R31, R33, R34 tests, R30 and R32 as `test.todo`, and the full REPORT on other modules. COMPLETE follows.

## J4 · REPORT

What this job found in other modules, or made stale there. Each item is described against that module's requirements; none of it is changed here.

1. **The movers' snapshot rows (B2 item 3).** Each of these is built on the snapshot branch in code that case-authoring or review moves:
   - D-618, D-680, D-703, D-725 and D-728: in `publishCase`, `#statementWriter` and the named-draft binding (case-authoring R12, R21).
   - D-683 and D-720: in `#statementAcknowledgements` (case-authoring R20).
   - D-626, D-708 and D-721: in `#caseIdentitySentence` and the draft and statementack sentences (review, or case-authoring R9 and R19).

   D-742 needs the live record (it re-keys pre-D-720 acknowledgements), so no job can do it at extraction.
2. **record-core (R37), provenance (R48), connections: read contracts my Uses name but their Provides do not state.** R18's export reads these columns in its own SQL, as the store did:
   - `files.bytes` and `files.blob_sha`, `bundles.bundle_sha`, `row_version`, `created` and `last_updated`, the whole `manifest` table, and `history.created`;
   - `register.bytes`, and `register.author` (R17 reads it too);
   - connections' `refs` (`target_id`, `kind`).

   Proposed: state them in those modules' contracts, or give those modules export reads.
3. **legacy-checks.** The catalogue still defines R20's formats and predicates, because C-41 reads them. `publication` re-exports them until C-41 leaves with ratification (B3). Its prose headers above `INSTALLATION_CHECKS` and `ATTRIBUTION_CHECKS` still describe C-68.5 and C-92.1–.9, which now live here. A comment can only be changed by an addition, so I left them.
4. **promotion (R34): `CATALOG_VERSION` is owed a bump.** C-44.2, C-68.5, C-92.1–.9 and all of C-98 left the catalogue, and T8's 1.38.0 re-opening (Contradictory 1) should count them. The control plane's `dec49Attach` finds families in the catalogue only, so every refusal of this module now carries its code, check and translation at its own site. The DEC-49 guard (`civicos-ui/check-refusal-codes.mjs`) harvests `_CHECKS` families from the catalogue file, so it no longer sees this module's four families (`CASE_RESOLUTION_CHECKS`, `PUBLISHED_STORE_CHECKS`, `PUBLISHED_READ_CHECKS`, `ATTRIBUTION_ACT_CHECKS`) until it reads `src/publication/checks.mjs` as well.
5. **One untranslated refusal.** D-734's `CASE_DOCUMENT_UNSERVABLE` (at `op=publishedbytes`, adopted as it was built) has no catalogue row. A row would be C-98.9, and that is a requirement change (R13, R33), so it is yours to decide.
6. **legacy-tests: old-battery reds this job adds, measured against `tranche/T8`.** Every one is a pin on moved source, a moved row or a moved import. None is a behaviour change. Figures are base → branch.
   - The imports fail on moved rows: `publishedcase` and `plane-envelope` import `PUBLISHED_READ_CHECKS` from the catalogue; `d470-catalog-census` and `d278-codeless-refusals` read the moved rows.
   - Source anchors on moved store, index or schema text:
     - `case-opened`: 13 FAIL.
     - `caseobject`: 4.
     - `caseflip`: 1.
     - `caselifecycle`: 2.
     - `multicase`: 12 (its census walks `store.mjs`).
     - `mk7-attribution`: 3.
     - `frontier-chunk`: 1.
     - `ratify-authority`: 1 (`static publishedGraphEdges` is now a module function).
     - `refusal-wire`: 2.
     - `reviewcopy-inband`: 2 (`inbandQuartet` is now called from `publication/worker.mjs`).
   - Walked ratchets, re-pinned from their print: `gate-reads` 1→5 FAIL (it now finds `excludedBy`, `publishededitions` and `publishedcase` in `src/publication/index.mjs`); `meaning-bounds` 3→7; `derivation-bounds` 7→14; `bounds` 5→7.
   - Unchanged: `casesign`, `casepin`, `rec170-manifest-pair`, `exportnotice`, `affordances`, `opaque-ids`, `provenance-marker`, `reviewcopy`, `deliverer`, `doorbell`, `check-firing` and `d50-project-names` pass as on base.
   - civicos-ui's `several-cases-choice` and `case-frozen-pair` read C-44.2 from the catalogue.
7. **Generated artifacts (§14) are stale:**
   - the plane bundle (`bio-plane/dist`, its source);
   - agent-worker's bundle (`bio-checks.mjs` is an input, K189);
   - `newgroup/src/release.mjs` and `release/bio-plane.bundled.mjs`, which embed the plane.
8. **`test/m/`: 1,901 tests, 2 fail. Both are red on `tranche/T8` too:**
   - `citation/invariants` R5 (the catalogue now admits `aspiration`, N159's layer 1);
   - `connections/factory` (N131).

## J5 · COMPLETE

**Completion.** `publication` is extracted and built on `job/T8/publication`, per its map, its requirements (R1–R40) and B2–B4. The module's files:
- `bio-plane/src/publication/index.mjs`: the services, the ops `publicationOps`, and the factory `publicationOf(host, deps)` (K61).
- `publication/worker.mjs`: the Worker half (`publishedRoutes`, `assembleCaseContainer`, the governed refusals).
- `publication/checks.mjs`: C-44.2, C-68.5, C-92.1–.9 and C-98, plus R20 re-exported.
- `publication/schema.mjs`: the eleven tables, their migrations and the D-734 boot pass.
- `container.mjs`, `inband.mjs` and `deliverer.mjs`, as they were.

**Entries applied:**
- **Extraction (K3, K31, K57, K94, K102).** Moved out of `store.mjs`:
  - the case relation and the revision flags;
  - the case-document reads;
  - MK-7 attribution;
  - the export and its log (N16);
  - the published reads and the pinning helpers;
  - the dispatch entries;
  - the published-bundles migrations.

  Moved out of `index.mjs`: the four helpers, `assembleCaseContainer` and the `op=publishedcase`/`op=publishedbytes` block. Moved out of `bio-checks.mjs`: four families. Moved out of `schema.mjs`: ten tables (with `export_log`, eleven). The movers' bodies are untouched. The store reaches the moved helpers through one-line private delegates (B3), and legacy-store fills R23's provider.
- **Registration rule (K206, N152):** `caseMember`, `publishedRegistry` and `publishedCaseRegistry`, and the revision-flag projection, are registered by `publication`. legacy-store's two facts and its `#promoteProjections` flag call are removed.
- **R21, R22 (K240, K241):** built as new code in B4's shapes. R35 is built. R36 (N69) is `registerEvidenceBlock`. R37 (K171 (4)) is built. R38–R40 are built. R23 has the doors K240 names.
- **Snapshot rows:** D-712 (`document` on `op=publishedcase`) and D-734 (a ratified case document's hash is published and served, re-hashed) adopted. D-613 (DUPLICATE_PATH and PART_MISSING at 409, too large at 413) applied.
- **N127:** `auditPass`' sight is asked per id (store 8106–8108, for your read at the close).
- **N163:** (a) is N210; (b) moves with `publishCase`; (c) is done.
- **N67:** line 2535 left for ratification (B2 item 4).
- **Flaw fixed in this module:** `caseFlags` handed SQLite a fractional LIMIT for a fractional `limit` (a datatype error). It is floored now.

**Deferred, and why:**
- **R30 (D-246):** `test.todo`. Nothing in the plane publishes a rendering yet, so there is nothing to carry `pixels_sha256`.
- **R32:** `test.todo`. The verifying import has no tranche (K102).

**Found in other modules:** REPORT J4, 8 items.

**Tests and checks:**
- `node --test bio-plane/test/m/publication/`: 54 tests, 52 pass, 0 fail, 2 todo (R30, R32). Every one of R1–R40 is named.
- `node --test bio-plane/test/m/`: 1,901 tests, 1,891 pass, 2 fail, 8 todo. Both fails are red on `tranche/T8` too (J4 item 8).
- Old battery under miniflare: the plane boots and the publish, ratify and case-sign flows pass (`casesign`, `casepin`, `rec170-manifest-pair`, `exportnotice`). The reds this job adds are pins (J4 item 6).
- `format`: 69 modules, 0 failures.
- `architecture publication`: 15 product files, 52 imports, 0 failures.
- `coverage publication`: 40 of 40 live ids named, 0 failures.
- `ownership publication tranche/T8`: 1 failure, the N127 lines. legacy-store: 36 lines added, 3,071 removed. legacy-checks: 0 added, 172 removed. legacy-index: 6 added, 632 removed.

Size (session_019xHaikQ3bX9KRMWSzbkdBb): test runs 24, module lines 5145
