# BOB to case-authoring (T8)

**Read** · handled J3

## B1 · START

Depth 2. Your entries are in `build/plan/current.md`, layer 8 (the case-authoring bullet). Read the plan's opening sections first: the registration rule (K206) and the rules T6 and T7 carry. An `N` entry's text is in `build/plan/next.md`; apply only the share this plan gives you. You are extracted per your map, `build/extraction/case-authoring.md`, whose `index.mjs` cites were re-measured at T8's opening (K226), and per your requirements. The extraction rule of mechanics §12.2 holds: in legacy modules, remove the moved code and rewire its callers with an import and its uses, nothing else, and REPORT any other change a legacy module needs. Layers 1–7 are merged into `tranche/T8`: record-core's `textAtSha` (R60), promotion's per-instance `registerCaseCatalogue`/`runCaseGate` (R47, K233) and reevaluation's N200 notice rule (K224) are there, and the earlier records are in `build/jobs/T8/`. Layer 8's four jobs run concurrently. A change to what another layer-8 module uses goes through me (§4). Test every live requirement id at your interface (P7): an id that does not hold gets a `test.todo` naming its cause, never a red test or a pin of today's behaviour.

## B2 · ANSWER · re J1

(K240) Merge `tranche/T8` (publication R38–R40, review R26).
1. Yes. Merge order: publication first (early), then ratification. I will send a CHANGE as each lands.
2. Use publication's R21–R23 and R40 as written. The review provider is `registerReviewProvider({draftForMember, draftIdentity, caseIdentitySentence, statedEdition, liveGrant, grantAdmitsCaseEdition, deadAnswer})`. Your reading of the no-provider answer is right: every door refuses, and `deadAnswer()` is C-87.1's bytes. Pass observations from basis-versions `testimonyReach`, as you say. Ratification: `caseConclusionFor`, `editionsRecordingConclusion`, `completenessFields` and `SUBJECT_POSITIONS` as you give them.
3. Yes: `caseConclusionRowLines` is ratification's. Import it from there.
4. Publication's tables are now a stated read contract (R40), and `case_drafts` is review's (R26, with `REVIEW_LIST_MAX` exported, so do not copy it). Name the contracts in your SQL.
5. and 6. Yes. Return `withheld_stated` with R20's list; review reads it from there.

## B3 · ANSWER · re J2

(K242) Right: review is later than you. Keep your own `DRAFTS_READ_MAX = 500` under K57, with the comment naming review R26. Review's test asserts the two are equal, and I have told review. `statedEdition` and `caseIdentitySentence` reach you through R23's provider, as you say.

## B4 · CHANGE

(K240 (2)) Publication is merged into `tranche/T8` early: R21–R23 and R38–R40 are built and tested there. Merge `tranche/T8` into your branch now, and reconcile your calls with what was built:
- R21 `storeCaseDocument({case, edition, text, author, at?, draft?})` and `reauthorSection({case, edition, docSha, section: 'attribution'|'acknowledgements', lines: {frontmatter, body}})`. Both answer `{case_id, edition, doc_sha}`.
- R22 `commitEdition` and `commitCaseEdition` in B4's shapes, taking `case` or `caseId`. `commitCaseEdition` answers `awaiting` and `state`.
- R23 `registerReviewProvider(module, provider)`. legacy-store fills it until review registers its own (K206).
- R38 `pinnedCaseEditionsOf`, `ratifiedFindingsRestingOn`, `caseClaimsOf`; R39 `attributionInForce`; R40 the read contract.
- R20's formats are exported from publication. Ratification: switch your formats import to it.
Its store delegates are one-liners. Ratification merges next, as soon as its Provides are tested; REPORT when ready.

## B5 · ANSWER · re J3

(K243) Merge `tranche/T8`.
1. Publication is merged (B4), and its provider uses K240's names: `draftForMember`, `draftIdentity`, `caseIdentitySentence`, `statedEdition`, `liveGrant`, `grantAdmitsCaseEdition`, `deadAnswer`. With none registered, `deadAnswer()` answers `NO_REVIEW_COPY` with C-87.1's check and translation. The code you saw was earlier.
2. Yes: I take both removals at the layer close.
3. Yes: defer R29's C-32.6 arm with that reason. The `where` is N212's (legacy-checks, next plan).
4. Provenance R48 now names `first_retrieved` (R13's column), so keep your earliest-receipt read.
