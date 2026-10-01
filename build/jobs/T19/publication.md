# publication (T19)

**Status** · session_019BeVhgz521rbyLgunTbANL · depth 2 · COMPLETE · handled B4

## J1 · QUESTION

Two readings, both carried on now; neither decides what I build next.

1. **Order (rule 4).** public-read has only just started (its B1). Only the row deletion depends on it: `public-read/index.mjs`:26 and its tests import `rowOf` and the three moved tables from `publication/checks.mjs`, so C-44.2, C-68.5 and C-98 leave my table only after public-read's re-point merges. My reading: I do every other part of the entry now on my branch (none touches public-read's paths), then merge `tranche/T19` after public-read merges, delete the rows, re-run, and post COMPLETE. Ring me (a CHANGE, or any doorbell) when public-read is merged.

2. **`invariants.test.mjs`:82 (K794: "re-points to acquisition").** acquisition is not in publication's `uses`, and the architecture check judges test imports, so a re-point needs an edge publication → acquisition for an assertion about acquisition's own row (acquisition R29, already asserted by `test/m/acquisition/checks.test.mjs`:24, :33). My reading, under K787 (3): drop the line (it tests no publication requirement), with the whole-catalogue walk it sits in; R33's test asserts my table holds exactly C-92.1–.9 and C-122.1 and that none of C-44.2, C-68.5, C-98 answers `rowOf`. If you want the acquisition edge instead, say so and I will add the import.

## J2 · COMPLETE

Job complete on `job/T19/publication` (tranche merged at B4, after PUBLIC-READ #2).

**Entries applied**
- K706: the 17-line `registerEvidenceBlock` copy and its field deleted (filings calls public-read's).
- R33 (K768): C-44.2, C-68.5 and C-98.1–.9 deleted from `publication/checks.mjs` and from `index.mjs`' re-exports; `rowOf` reads C-92 and C-122 only. public-read moved them with `where` unchanged, so no row's census line moves (nothing awaits a stamp from this job). `INSTALLATION_CHECKS` named nowhere in my files.
- K757: `caseDocumentFacts`' signers read `credentials.attestingKeys()` (credentials R11), credentials reached lazily through `credentialsOf`.
- K783: `record.registerAuditContext("publication", …)` hands `publishedRegistryFor(id, its basis targets)` to the audit (record-core R69); `record.registerMintSeed("publication", [CASE published_cases, CASE published_case_members])` (R70). `cases` and `case_documents` left to ratification, as R70 words it.
- Rule 1: `index.mjs`:53 → record-grammar; `fixture.mjs`:18 and `convert-ratify-authority.test.mjs`:11 → record-grammar (B2); `invariants.test.mjs`' whole-catalogue import and its :82 C-68.1 arm dropped (K827 (2)). No publication file imports `bio-checks.mjs`. Comments at `index.mjs`:13 and :2645 re-worded (and the header's stale note on worker/container/inband paths).
- K789: the fixture builds credentials after membership (`credentialsOf(host, {record, membership}).migrate()`); `convert-casesign` mints and looks up AI credentials through credentials. The 19 accepted reds are green.

**Rs met, with tests** (for striking): R33 — `invariants.test.mjs` "R33 this module's table holds exactly C-92.1–.9 and C-122.1 …". Also exercised anew: R2 (signers from credentials), R7 (audit context), R40 (mint seeds) in the new `seams.test.mjs`; the deleted evidence-block copy under "K706 …". R39 was already met and tested (`attribution.test.mjs` "R39 attributionInForce …") while its mark still reads not yet met (K240): yours to strike if you agree.

**Deferred**: none. R30, R32 remain not yet met (todo tests, unchanged).

**Found in other modules**
- legacy-tests / legacy-ui: `civicos-ui/test/preauth-vocabulary.test.mjs`:953 (`publicationRowOf`, for C-98/C-44 codes) and `civicos-ui/test/several-cases-choice.test.mjs`:250 read `CASE_RESOLUTION_CHECKS` from `publication/checks.mjs`; they should read public-read's `checks.mjs` now (old suites, K619: report only).
- control-plane: `families.test.mjs`' totality arm red as accepted in B4 (same on the tranche without my change). `families.mjs`:44 still imports `publication/checks.mjs` (fine; it now yields two families).
- Using modules' suites unchanged by this job (same counts on the tranche head): project-stage 2, ratification 81, case-authoring 1, monitoring 1, affordances 4, queue-producers 32 failures (K789 fixtures of their own jobs); public-read 67/0, review 33/0, filings 45/0, conformance 48/0.
- No generated artifact staled by me beyond the plane bundle's ordinary regeneration at the layer close.

**Tests and checks**
- `node --test test/m/publication/`: tests 96, pass 94, fail 0, todo 2.
- format: 0 failures; architecture (publication): 24 files, 74 imports, 0 failures; coverage: 41 of 41 live ids named, 0 failures; ownership vs tranche/T19: 8 files, legacy-store/-checks/-index 0/0, 0 failures.

Size (session_019BeVhgz521rbyLgunTbANL): test runs 9, module lines 3686
