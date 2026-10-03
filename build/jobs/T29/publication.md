# publication (T29)

**Status** · session_017bm3BWK3xDxBgctGcV2Rnp · depth 2 · WORKING · handled B2

## J1 · REPORT

Read whole: requirements (publication, case-carriage public part), the seam read publication-split-2.md, L8's contract, publication's code (deliverer.mjs, publication/index.mjs, schema.mjs, checks.mjs, door.mjs) and the tests the split touches (fixture, invariants, t28, sources). Baseline on job/T29/publication @ 29e77d41c2: node --test test/m/publication/ → 109 tests, 108 pass, 0 fail, 1 todo (R30). Nothing ambiguous; no question. The change is ready to make as §1 states (caseCarriage getter forwarding sources/acceptedWork/extraction; gates call sourcesLapsed/acceptedWorkLapsed; commit calls holdMaterials and registers its files in published_shas; two one-line delegates; void p.caseCarriage at boot; DDL and the two exempt names removed; invariants R31 assertion edited). Waiting on your CHANGE after case-carriage's merge.

## J2 · COMPLETE

**Entries applied.** `build/plan/current.md` (T29) L8, publication (N532; K1332, K1337), per B2 and `build/extraction/publication-split-2.md` §1, on job/T29/publication with tranche/T29 (case-carriage merged, K1347) merged in; commit ccdbc480d7.
- `publication/index.mjs`: deleted `#holdMaterials`, `#registered`, `#fileRow`, `#tokenFiles`, `#acceptedWorkLapsed`, `#sourcesLapsed` and the getters `sources`, `extraction`; dropped the imports of `sources`, `extraction`, `accepted-work` and of case-grammar's `sourceRowsStanding`, `acceptedWorkOf`, `extractedTextOf` (`materialsOf` stays for R60). New getter `caseCarriage` = `caseCarriageOf(host, {storage, record, membership, promotion, now, ...given})`, forwarding a given `sources`, `acceptedWork`, `extraction`. `commitCaseEdition`: R51 calls `caseCarriage.sourcesLapsed(doc.text, when)`, R59 `caseCarriage.acceptedWorkLapsed(docFm, attestorMember)`, R57 `caseCarriage.holdMaterials(docFm, {caseId: id, edition: ed, at: when})`, then inserts each answered `files` row into `published_shas` (`bundle_id` = `ref`, `published` = `when`); it no longer writes `published_case_materials`. Refusals and rows (C-122.1, .3, .4), R58 and every `published_shas` write stay here. One-line delegates: `heldMaterialsOf` and `publishedMaterialText` (R57), and `get acceptedWork()` (see below). `publicationOf` creates it after this module's declaration (`void p.caseCarriage`).
- `publication/schema.mjs`: the two DDL blocks removed; `published_material_texts` and `published_case_materials` dropped from `PUBLICATION_EXEMPT` in the same change; header says they are case-carriage's.
- `test/m/publication/invariants.test.mjs` (R31): the exempt list loses the two names; the same test asserts case-carriage is created at this module's creation (one per host), both purge declarations answer `{ok: true}`, `CASE_CARRIAGE_EXEMPT` names the two tables and `publicationOwns` answers false for each. t28's and sources' arms for R51, R57, R59 pass unchanged.

**Final uses, for BOB to record in `modules.json`:** remove `extraction`; add `case-carriage`. Keep `sources` and `accepted-work`: no product code of this module calls them any more, but the test fixture builds the real modules (sources' disclosures and consent for R51/R52, accepted-work's registration for R59), as `connections` is kept for the fixture. Checked with that `uses` written locally (uncommitted): architecture 0 failures.

**Deferred.** None.

**Found in other modules.**
- `plane`: `test/m/plane/accepted.test.mjs` R16 reads `publicationOf(ctx).acceptedWork` (one instance per host). I kept a one-line `acceptedWork` getter delegating to case-carriage's instance so plane stays green unchanged (the plane's `publicationOf(ctx, {acceptedWork})` is forwarded, so it is the same instance). Plane's job may re-point that assertion to `caseCarriageOf(ctx).acceptedWork`; the delegate can then go.
- Generated artifact: my wiring stales `bio-plane/dist/bio-plane.bundled.mjs` (fleetbundles' bio-plane arm). It already fails on tranche/T29 before my change (case-carriage's and earlier L8 merges); BOB regenerates at the layer close.
- `control-plane`: `test/m/control-plane` "R22, R43 (N520, N522, N526; K1310)" fails identically on tranche/T29 without my change (docket's C-129 family, N533 in flight). Not this job's.

**Tests and checks** (on ccdbc480d7):
- `node --test test/m/publication/ test/m/case-carriage/`: tests 130, pass 129, fail 0, todo 1 (R30).
- Users and module-scanning suites (`case-authoring, conformance, docket, network-notices, plane, public-read, ratification, review, filings, queue-producers, project-stage, case-checker, case-import, control-plane, membership, promotion`, with publication and case-carriage): tests 1441, pass 1439, fail 1 (the control-plane test above, red at base), todo 1.
- `node --test bio-plane/test/system/fleetbundles.test.mjs`: fail 1 (the bio-plane bundle, stale at base too).
- No layer tests named in `build/manifest.md`.
- `node checks/format.mjs`: 97 modules, 96 requirements files; 0 failures.
- `node checks/architecture.mjs . publication`: 2 failures with `modules.json` as committed (case-carriage not yet in publication's uses, the two imports above); 0 failures with the final uses above.
- `node checks/coverage.mjs . publication`: 43 of 43 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs . publication tranche/T29`: 4 files; 0 failures.

**Size.** Publication 3,828 lines (from 3,996): `index.mjs` 2,853, `schema.mjs` 684, `checks.mjs` 144, `door.mjs` 92, `deliverer.mjs` 55.

Size (session_017bm3BWK3xDxBgctGcV2Rnp): test runs 12, module lines 3828
