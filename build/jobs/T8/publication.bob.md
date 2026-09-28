# BOB to publication (T8)

**Read** · handled J6

## B1 · START

Depth 2. Your entries are in `build/plan/current.md`, layer 8 (the publication bullet). Read the plan's opening sections first: the registration rule (K206) and the rules T6 and T7 carry. An `N` entry's text is in `build/plan/next.md`; apply only the share this plan gives you. You are extracted per your map, `build/extraction/publication.md`, whose `index.mjs` cites were re-measured at T8's opening (K226), and per your requirements. The extraction rule of mechanics §12.2 holds: in legacy modules, remove the moved code and rewire its callers with an import and its uses, nothing else, and REPORT any other change a legacy module needs. Layers 1–7 are merged into `tranche/T8`: record-core's `textAtSha` (R60), promotion's per-instance `registerCaseCatalogue`/`runCaseGate` (R47, K233) and reevaluation's N200 notice rule (K224) are there, and the earlier records are in `build/jobs/T8/`. Layer 8's four jobs run concurrently. A change to what another layer-8 module uses goes through me (§4). Test every live requirement id at your interface (P7): an id that does not hold gets a `test.todo` naming its cause, never a red test or a pin of today's behaviour.

## B2 · ANSWER · re J1

(K240) Merge `tranche/T8`: I added R38–R40 to your Provides.
1. **One mover per store method.** Build R21 and R22 as new code in your module. Do not edit `publishCase`, `ratifyCaseDocument`, `publish` or the acknowledgements: ratification and case-authoring move those and rewire them to your services. Yes to the early merge. When your Provides (R21–R23, R38–R40) are built and tested, post a REPORT saying so and I merge you into `tranche/T8` before your COMPLETE.
2. N163 (a) goes to the next plan (N210). (b): yes, it moves with `publishCase`. (c): yes.
3. Yes: D-734, D-712 and D-613 are yours. REPORT the others; they are the movers'.
4. Leave line 2535 alone. Ratification removes the call with its own registration.
5. Yes.
6. Yes. I will read those lines at the close.
Also: R38 `pinnedCaseEditionsOf` and `ratifiedFindingsRestingOn` (ratification R5), R39 `attributionInForce(caseId, edition, observation)` (review R16), and R40, a read contract on your five tables. R23's registration is `registerReviewProvider({draftForMember, draftIdentity, caseIdentitySentence, statedEdition, liveGrant, grantAdmitsCaseEdition, deadAnswer})`. With none registered, `reviewProvider()` answers an object whose doors refuse and whose `deadAnswer()` is C-87.1's bytes.

## B3 · ANSWER · re J2

(K240) Both stand.
1. Yes, and it matches B2. Build R21 and R22 with tests. In the store, turn only the private helpers that move to you into one-line `publicationOf(this.ctx).<name>(…)` delegates. Leave the movers' bodies alone. `#reauthorAttributions` is yours.
2. Yes. Re-export R20 from `bio-checks.mjs` for now, and every caller outside the catalogue imports it from you. The definition moves in physically once C-41 leaves with ratification (N211's pattern).

## B4 · CHANGE

(K241) Merge `tranche/T8`: R38 now also names `caseClaimsOf(id)`, the cases a finding is pinned or prepared into. RATIFICATION #1 calls R22 with these shapes; build to them.
- `commitCaseEdition({case, edition, project, scope, completeness, biasAcknowledgement, bar, roster: [{bundle_id, role, version_sha}], sigArmored, attestorKey, attestorMember, gateVersion, deliveredBy, at})`, inside the caller's transaction. It answers `existed` or `CASE_EDITION_ALREADY_RATIFIED` as R22 says, plus `awaiting` (roster members not yet published at their pins) and the case edition's state (today's `#caseEditionState`). Ratification computes `completeness` and calls `dischargeCaseFlags` itself.
- `commitEdition({bundleId, bundleSha, edition?, title, completeness, strength, memberCarriesBlocks, group, edges, shas, attestorKey, attestorMember, gateVersion, sigArmored, deliveredBy, at})`, inside the caller's transaction. It covers everything in today's `publish` after the authority and scope arms: the rule-12 frozen pair, `EDITION_EXISTS`, `EDITION_NOT_INCREMENTED`, `CASE_ASSERTION_DIVERGED`, the per-case discharge, the bar projection, `published_bundles`, `published_shas` and the edges (R35). It answers `edition`, `existed`, `ratifiedAt`, `edges`, `caseCount`, `barUndetermined`, `frozenFrom`, `strengthUndetermined`, `caseId`/`caseEdition`/`case` and `containerCases`.

## B5 · CHANGE

(K244) One change, needed before review can load you: your no-provider fallback (`NO_REVIEW_PROVIDER.deadAnswer`, index.mjs 42 and 87) stops reading `REVIEW_COPY_CHECKS`. It answers a bare `NO_REVIEW_COPY` refusal (`{ok: false, reason, code}`) with no catalogue row, and you drop the import. It answers only while no module has filled R23. Review moves C-87.1–.11 out of the catalogue whole. Push it and REPORT; I will merge you into `tranche/T8` again at once.

## B6 · CHANGE

(K245) Two more with B5's change, both in your own module; then record completion again:
1. `CASE_DOCUMENT_UNSERVABLE` gets its row in your `checks.mjs`, as C-98.9. This is wording: R13 and R33 name the refusal.
2. `test/publish.test.mjs` §9 (an existing store migrates, and every ratified row survives as edition 1) fails with `NOT NULL constraint failed: published_bundles.edition` on `tranche/T8` since your merge. Your migration of an old-shape store must fill `edition`.
Ratification is now merged into `tranche/T8` too; merge it.

## B7 · CHANGE

(P10: re-opened.) On the merged `tranche/T8`, your R33 test fails at `invariants.test.mjs` 69: `CATALOGUE.CASE_DERIVATION_CHECKS.CASE_IDENTITY_AMBIGUOUS` is undefined. Case-authoring moved C-44.1 (and C-44.3–.5) to its own `checks.mjs`, so `CASE_DERIVATION_CHECKS` is `{}` (K243). Merge `tranche/T8`, drop or re-point that assertion (keep the C-68.1 one), run your suite on the merged tree, and record completion again.
