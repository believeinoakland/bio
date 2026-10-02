# extraction (T25)

**Status** · session_018Jaiitbn2X3Px2hE9n3hc8 · depth 2 · COMPLETE · handled B4


## Work (complete)

Built against `tranche/T25` before reading-pipeline's merge, as B1 said, its imports re-pointed to `bio-plane/src/reading-pipeline/index.mjs` (J1; B2, K1233) and tested meanwhile with an uncommitted local stand-in for that entry, deleted before any commit. After B4 (K1236) `tranche/T25` was merged in cleanly (reading-pipeline added its copies of the moved tests, so nothing conflicted) and every run below is against reading-pipeline's own code.

Applied (B1; N513's removal side):
1. `bio-plane/src/extraction/pipeline.mjs` deleted; `index.mjs`:24, :30 re-pointed to `../reading-pipeline/index.mjs` (the sixteen names); `CAPTURE_TEXT_UNIT_CAP` still re-exported from `index.mjs` (K1218), so observation-log and connections do not change.
2. Tests: deleted `convert-ocr.test.mjs`, `staffdirectory.test.mjs` and its two fixtures (`fixtures/nss-staff-directory-2022-06-14.pdf`, `fixtures/ncpc-zoom-meeting-dates.pdf`, used by nothing else); `read.test.mjs` cut to its R1, R18 and `acquireReadingOp` arms, plus one R1/R22/R36 arm kept from the old R16/R22 case (a csv read, written and indexed: the R22 side of it is this module's); `convert-tiers.test.mjs` cut to its `op=pdfstructure` (R31) arms, each case's reading half and the tier-3 cases moved; `rules.test.mjs` 18–54 (R25, R26) cut; `convert-chain.test.mjs` keeps its R19/R27/R29 and R18 cases (the chain-composition cases moved); `convert-extent.test.mjs` keeps its R19/R20/R27/R30 and R30 cases (the R13 extent cases moved). `n26`, `n439`, `store`, `testimony`, `convert-tiers` re-pointed to the entry; `pdfstructure.test.mjs`'s R35 budget is now the stated bound (reading-pipeline R4: 24) rather than an import of an internal constant.
3. Re-scan (N502/N508 kind, N469's rule), re-worded: every comment and test title naming a retired id (R3, R4, R6, R8, R9, R12, R13, R16, R25, R26, R60) now names reading-pipeline's id (`index.mjs` header, :133, :138, :250, :253, :544, :702, :971, :1126, :1131, :1300, :1339–1340, :1359; `ops.mjs`:94; `schema.mjs`:323, :344; `pdfstructure.test.mjs` four titles; `store.test.mjs`:199); `filemembership.mjs`:1's "R52, proposed" (R52 is live); `index.mjs`'s `#counts` note names the store as retired. The N508 lines named in `t24-stale-notes.md` (`index.mjs`:1474, `ops.mjs`:10, :32, :82) already read as retired; left.

4. `uses` (B3, K1234; BOB writes `modules.json` at the merge): measured over src and tests, extraction imports calibration, capture, capture-sources (tests), docprofile, format-registry, jurisdictions, membership, office-readers, pdf-worker (tests), provenance, reading-pipeline, record-core, record-grammar, text-chain. Drop acquisition, test-support, pdf-reader; keep ocr-worker and promotion (requirement-named, handed in, not imported).

Deferred: nothing.

Found in other modules (J2): attestation's `invariants.test.mjs` R9 is flaky (its place probe's `\bca\b` matches inside a random base64 signature); BOB accepted it as red 11, N517 for attestation in T26 (K1234). Generated artifact staled: `bio-plane/dist/bio-plane.bundled.mjs` (not_product), by deleting `extraction/pipeline.mjs` and changing `extraction/index.mjs`; regenerated nothing. Seen, not mine: `bio-plane/src/readingprov.mjs` is still in the tree beside `reading-pipeline/readingprov.mjs` (reading-pipeline's paths list both; extraction imports neither).

Tests and checks, on the merged branch (`tranche/T25` @ B4's merge):
- `node --test bio-plane/test/m/extraction/`: tests 112, pass 112, fail 0 (171 before; 59 moved to reading-pipeline).
- `node --test bio-plane/test/m/`: tests 5,329, pass 5,233, fail 85; the 85 are, test for test, the reds `tranche/T25` holds without this job (accepted reds 1, 7, 8, 9 by name; compared by name against a run on `tranche/T25`); none in extraction, reading-pipeline or extraction's users.
- `checks/format.mjs`: 91 modules, 90 requirements files; 0 failures.
- `checks/architecture.mjs extraction`: 25 product files, 93 relative imports; 0 failures.
- `checks/coverage.mjs extraction`: 44 of 44 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs extraction tranche/T25`: 20 files changed; 0 failures.

Size (session_018Jaiitbn2X3Px2hE9n3hc8): test runs 21, module lines 2,679

## J1 · QUESTION

Re-point target (B1 (1), (2)). reading-pipeline has not merged and its branch holds no code yet, so the file names its moved code will export from are not fixed. My best reading, which I am building on: everything `extraction` imports (`read`, `tier2Escalate`, `tier3Extend`, `tier3SeedFrom`, `needsTier3`, `textUnitsFor`, `layerChainFor`, `readingFromWire`, `decodeView`, `textCountsOf`, `pageBoxesFrom`, `bytesOf`, `CAPTURE_TEXT_UNIT_CAP`, `readingProvenance`, `compareProvenance`, `PROVENANCE_SCHEME`) is exported from one entry, `bio-plane/src/reading-pipeline/index.mjs`, and the tests that stay import the same entry. If reading-pipeline names other files (say `reading-pipeline/pipeline.mjs` and `reading-pipeline/readingprov.mjs`, or keeps `src/readingprov.mjs` where modules.json still lists it), tell me which and I re-point when I merge tranche/T25 after its merge. No answer needed before that merge; I carry on with the test cuts and the stale-note re-scan meanwhile.

## J2 · REPORT

Built and green against tranche/T25 with a local, uncommitted stand-in for reading-pipeline/index.mjs (pushed: cb105d4f04; record has the detail). Extraction 112 pass, 0 fail; format 1 failure (accepted red 4), architecture 0, coverage 44 of 44, ownership 0. Waiting on your word that reading-pipeline has merged to merge tranche/T25 and finish.
(1) Another module, attestation: `test/m/attestation/invariants.test.mjs` R9 ("no place is named") is flaky. Its place probe `/oakland|alameda|california|\bca\b|berkeley/i` runs over JSON holding fresh base64 signatures, and `\bca\b` matches whenever a signature holds `+ca/`, `/ca+` and the like. It failed once in my whole-m run (the signature in the assertion) and passed 6 of 6 re-runs, and on tranche/T25 it passed. Against attestation R9 the code is fine; the test is not: strip signatures and keys before probing, or probe only the sentences.
(2) Whole bio-plane/test/m on my branch: 5,255 tests, 86 fail. 85 are exactly the reds tranche/T25 itself has in the same 16 files (network-notices, case-authoring, filings, retrieval, control-plane, affordances, promotion write-path, scheduler consumers: reds 7, 8, 9, 1 by name), compared test by test; the 86th is (1). None in extraction or its users (content, connections, observation-log, entities, progressions, retrieval projection aside from red 7).
(3) Generated artifact: deleting extraction/pipeline.mjs and changing extraction/index.mjs stales `bio-plane/dist/bio-plane.bundled.mjs` (not_product, the plane bundle); regenerated nothing.
(4) uses, measured over my src and tests now: calibration, capture, capture-sources (test only: convert-chain drive hop), docprofile, format-registry, jurisdictions, membership, office-readers, pdf-worker (test only: convert-tiers binds the real member for op=pdfstructure), provenance, reading-pipeline, record-core, record-grammar, text-chain. Imported by nothing: acquisition, test-support, pdf-reader (drop); ocr-worker (binding presence only, R32 C-51.4) and promotion (registerStep handed in, R20) are not imports but the requirement names them; keep or drop is yours. Module lines over paths: 2,679.

## J3 · COMPLETE

B1 and B4 applied; tranche/T25 merged at B4 (clean, no conflicts), stand-in gone, every run against reading-pipeline's own code. extraction/pipeline.mjs deleted; index.mjs and the staying tests import bio-plane/src/reading-pipeline/index.mjs; CAPTURE_TEXT_UNIT_CAP re-exported. Moved tests cut (convert-ocr, staffdirectory and its two fixtures whole; read, convert-tiers, rules 18-54, convert-chain, convert-extent case by case); retired ids in comments and titles re-worded to reading-pipeline's. extraction tests 112/112; whole bio-plane/test/m 5,329 tests, 85 fail, test for test the reds tranche/T25 holds without this job (1, 7, 8, 9), none in extraction, reading-pipeline or its users. format 0, architecture 0, coverage 44/44, ownership 0. uses per B3: drop acquisition, test-support, pdf-reader. Rows added or changed: none. Stale artifact: bio-plane/dist/bio-plane.bundled.mjs (not_product), regenerated nothing. Seen, not mine: bio-plane/src/readingprov.mjs still sits beside reading-pipeline/readingprov.mjs (both in reading-pipeline's paths). Module lines 2,679. Record on job/T25/extraction.
