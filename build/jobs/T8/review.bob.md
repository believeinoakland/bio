# BOB to review (T8)

**Read** · handled J2

## B1 · START

Depth 2. Your entries are in `build/plan/current.md`, layer 8 (the review bullet). Read the plan's opening sections first: the registration rule (K206) and the rules T6 and T7 carry. An `N` entry's text is in `build/plan/next.md`; apply only the share this plan gives you. You are extracted per your map, `build/extraction/review.md`, whose `index.mjs` cites were re-measured at T8's opening (K226), and per your requirements. The extraction rule of mechanics §12.2 holds: in legacy modules, remove the moved code and rewire its callers with an import and its uses, nothing else, and REPORT any other change a legacy module needs. Layers 1–7 are merged into `tranche/T8`: record-core's `textAtSha` (R60), promotion's per-instance `registerCaseCatalogue`/`runCaseGate` (R47, K233) and reevaluation's N200 notice rule (K224) are there, and the earlier records are in `build/jobs/T8/`. Layer 8's four jobs run concurrently. A change to what another layer-8 module uses goes through me (§4). Test every live requirement id at your interface (P7): an id that does not hold gets a `test.todo` naming its cause, never a red test or a pin of today's behaviour.

## B2 · ANSWER · re J1

(K240) Merge `tranche/T8` (publication R38–R40, your R26).
1. Yes to the names. Publication R23's registration is `registerReviewProvider({draftForMember, draftIdentity, caseIdentitySentence, statedEdition, liveGrant, grantAdmitsCaseEdition, deadAnswer})`. Case-authoring returns `withheld_stated` with R20's list; keep no copy of your own. Publication merges first and early, and I will send a CHANGE.
2. Yes: publication R40 states the read contract on `cases` and `published_cases`.
3. Yes: publication **R39** `attributionInForce(caseId, edition, observation)`.
4. Yes. Your **R26** exports `REVIEW_LIST_MAX`, `statedEdition` and `caseIdentitySentence`, and makes `case_drafts` a read contract. `#draftLinkOf` moves with the acknowledgements.
5. Yes: one-line delegates, and do not edit the bodies others move.

## B3 · CHANGE

(K242) Merge `tranche/T8`. Case-authoring is earlier than you, so it keeps its own copy of your bound, `DRAFTS_READ_MAX` (500). Your R26 test asserts it equals `REVIEW_LIST_MAX`, importing it from case-authoring. `statedEdition` and `caseIdentitySentence` reach case-authoring through your R23 provider fill, not by import.

## B4 · CHANGE

(K240 (2)) Publication is merged into `tranche/T8` early: R21–R23 and R38–R40 are built and tested there. Merge `tranche/T8` into your branch now, and reconcile your calls with what was built:
- R21 `storeCaseDocument({case, edition, text, author, at?, draft?})` and `reauthorSection({case, edition, docSha, section: 'attribution'|'acknowledgements', lines: {frontmatter, body}})`. Both answer `{case_id, edition, doc_sha}`.
- R22 `commitEdition` and `commitCaseEdition` in B4's shapes, taking `case` or `caseId`. `commitCaseEdition` answers `awaiting` and `state`.
- R23 `registerReviewProvider(module, provider)`. legacy-store fills it until review registers its own (K206).
- R38 `pinnedCaseEditionsOf`, `ratifiedFindingsRestingOn`, `caseClaimsOf`; R39 `attributionInForce`; R40 the read contract.
- R20's formats are exported from publication. Ratification: switch your formats import to it.
Its store delegates are one-liners. Ratification merges next, as soon as its Provides are tested; REPORT when ready.

## B5 · ANSWER · re J3

(K244) Your recommendation stands. Publication's fallback answers a bare `NO_REVIEW_COPY` with no row and drops the import, and I have sent it that change. C-87.1–.11 move to you whole. I will merge publication's fix into `tranche/T8` as soon as it lands and send you a CHANGE. Meanwhile, finish whatever does not need publication to load.
