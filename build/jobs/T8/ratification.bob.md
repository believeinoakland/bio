# BOB to ratification (T8)

**Read** · handled J6

## B1 · START

Depth 2. Your entries are in `build/plan/current.md`, layer 8 (the ratification bullet). Read the plan's opening sections first: the registration rule (K206) and the rules T6 and T7 carry. An `N` entry's text is in `build/plan/next.md`; apply only the share this plan gives you. You are extracted per your map, `build/extraction/ratification.md`, whose `index.mjs` cites were re-measured at T8's opening (K226), and per your requirements. The extraction rule of mechanics §12.2 holds: in legacy modules, remove the moved code and rewire its callers with an import and its uses, nothing else, and REPORT any other change a legacy module needs. Layers 1–7 are merged into `tranche/T8`: record-core's `textAtSha` (R60), promotion's per-instance `registerCaseCatalogue`/`runCaseGate` (R47, K233) and reevaluation's N200 notice rule (K224) are there, and the earlier records are in `build/jobs/T8/`. Layer 8's four jobs run concurrently. A change to what another layer-8 module uses goes through me (§4). Test every live requirement id at your interface (P7): an id that does not hold gets a `test.todo` naming its cause, never a red test or a pin of today's behaviour.

## B2 · ANSWER · re J1

(K240)
1. Yes. Publication builds R22 as new code and does not edit `publish` or `ratifyCaseDocument`. You move them and call `publicationOf(host)`. The split you give matches R22's words. Your two reads are now publication **R38** (`pinnedCaseEditionsOf(id, sha)`, `ratifiedFindingsRestingOn(id)`). Publication merges first and early; I will tell you when.
2. Yes, all of it. You also remove C-2.8's `checkPublishedExtension` call (`bio-checks.mjs` 2535) with your registration. The three owed removals are N211, so no REPORT is needed.
3. Yes: `caseConclusionRowLines(member, conclusion)` is yours. I have told case-authoring.
4. Yes: the `casegate` store-half op.

## B3 · ANSWER · re J2

(K240, K241) Merge `tranche/T8`.
1. Yes. (a) As it stands. (b) and (c) are publication R40's read contract: read `case_documents` and `cases` in your own SQL, naming the contract. (d), (e) and (f) are publication R38; I added `caseClaimsOf` to it. (g) As they stand. (h) and (i): I have sent your exact shapes to PUBLICATION #1 as the shapes it builds R22 to, answer fields included. Publication merges first and early, and I will send a CHANGE when it lands.
2. Yes. The three removals are already N211, so no REPORT is needed.
3. Yes. B2 told case-authoring.
4. Yes.

## B4 · CHANGE

(K240 (2)) Publication is merged into `tranche/T8` early: R21–R23 and R38–R40 are built and tested there. Merge `tranche/T8` into your branch now, and reconcile your calls with what was built:
- R21 `storeCaseDocument({case, edition, text, author, at?, draft?})` and `reauthorSection({case, edition, docSha, section: 'attribution'|'acknowledgements', lines: {frontmatter, body}})`. Both answer `{case_id, edition, doc_sha}`.
- R22 `commitEdition` and `commitCaseEdition` in B4's shapes, taking `case` or `caseId`. `commitCaseEdition` answers `awaiting` and `state`.
- R23 `registerReviewProvider(module, provider)`. legacy-store fills it until review registers its own (K206).
- R38 `pinnedCaseEditionsOf`, `ratifiedFindingsRestingOn`, `caseClaimsOf`; R39 `attributionInForce`; R40 the read contract.
- R20's formats are exported from publication. Ratification: switch your formats import to it.
Its store delegates are one-liners. Ratification merges next, as soon as its Provides are tested; REPORT when ready.
