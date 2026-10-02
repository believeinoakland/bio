# reading-pipeline (T25)

**Status** · session_012Yr3gwtfrXrBoUUrtJgU8a · depth 2 · WORKING · handled B2

## Completion (T25 L4)

**Entries applied** (B1 START; B2 CHANGE, K1233)
- N513, the new module. `bio-plane/src/reading-pipeline/index.mjs` is `extraction/pipeline.mjs` copied whole (extraction's job deletes its copy), its header rewritten and every requirement id it cites re-pointed to this module's (R1–R24), the ids that stay in extraction named as `extraction R<n>` (R1, R18, R22, R35, R46). `readingprov.mjs` moved whole to `reading-pipeline/readingprov.mjs` (its one import re-pathed). The one entry K1233 names: `index.mjs` exports `read`, `tier2Escalate`, `tier3Extend`, `tier3SeedFrom`, `needsTier3`, `textUnitsFor`, `layerChainFor`, `readingFromWire`, `decodeView`, `textCountsOf`, `pageBoxesFrom`, `bytesOf`, `CAPTURE_TEXT_UNIT_CAP`, and re-exports `readingProvenance`, `compareProvenance`, `describePages`, `PROVENANCE_SCHEME` from `readingprov.mjs`; the other constants the moved tests read (`OCR_INVOCATIONS_PER_REQUEST`, the wire bounds, `LAYER_FIDELITY_SOURCE`, `NAMED_ENGINE_SOURCE`) stay exported as before. No behaviour changed: a real PDF and an office capture read byte for byte as extraction's `read` read them (pinned, below).
- `bio-plane/src/readingprov.mjs` keeps one re-export line, naming why and until when, so extraction's `index.mjs`:24 resolves until extraction's job re-points it (J1, open). With it the whole `test/m` is the baseline's failures exactly; without it ~490 more tests fail because the plane cannot load. Deleted by this module on a CHANGE after extraction's merge; the path is dropped from `modules.json` then.
- The tests moved to `bio-plane/test/m/reading-pipeline/`, renamed to this module's ids, calling `read(document, {evidence, env, storeName, view, planeVersion, liveCalibration})` directly through a fixture of their own (`fixture.mjs`: the bucket handed in as record-core's `evidenceStore()` hands it, the view combined as extraction R18 does, the calibration callback); assertions unchanged: `read.test.mjs` (less extraction's R1 acquire-wire arm, and its R18 view-source and R22 index-write arms, which became R24/R22's handed-in view and R15's unit), `convert-ocr`, `staffdirectory` (with its two PDF fixtures, copied), `convert-tiers` (less the `op=pdfstructure` arms, extraction R31; the wholesale branch's op arm is now the same facts through `tier2Escalate`), `rules.test.mjs`'s R25/R26 cases (now R18, R19), and the cases of `convert-chain` and `convert-extent` that read (the write/read-back cases, extraction R19, R20, R27, R29, R30, stay there). New, `pieces.test.mjs`: R23 (each exported piece at its part, no state, no fetch), R20 (no grade, caps never above the member's measured one) and R2/R15's over-strictness arms (the legistar packet PDF and a stored .docx, the whole answer pinned to digests measured over both the old and new `read`, equal).
- The six legacy-path tests: none imports the moved files (they boot the plane); the three that named `src/extraction/pipeline.mjs` in a comment name `src/reading-pipeline/index.mjs`. Green with the re-export.
- Re-scan for the N502/N508 kind: none in the module or its tests (the past-tense history notes and `RE-PINNED … extraction R5` lines are history, left).

**Uses, measured** (every relative import from my paths and tests): text-chain, format-registry, docprofile, capture-sources (source); jurisdictions, test-support, pdf-reader, pdf-worker, ocr-worker (tests). Exactly `modules.json`'s nine; no `record-grammar`, no `calibration`.

**Rows added or changed:** none. **Deferred:** none.

**Found in other modules**
- `bio-plane/dist/bio-plane.bundled.mjs` (owner `not_product`) is stale from this change: `test/system/fleetbundles.test.mjs` fails its bio-plane arms (fresh build not byte-identical; manifest hash), and passes on the tranche baseline. Not regenerated (manifest §14); REPORT with COMPLETE.

**Negative controls** (declared, each a mutation of `index.mjs`, run, restored by copy): the OCR step's cap raised to "A" fails R20, R5 and three R6 tests; the view ignored fails R24 R22; the unit cap doubled fails R23; tier 2's body gains a field fails R23 R3 R16, R3 R10 and the N391 staff directory (R16).

**Tests and checks** (on `job/T25/reading-pipeline` @ 86884c4965)
- `node --test test/m/reading-pipeline/`: tests 74, pass 74, fail 0.
- `test/d606-perpage-ocr.test.mjs`, `test/tier2-wire.test.mjs`, `test/system/pdf-worker-binding.test.mjs`: pass 3, fail 0.
- `node --test "test/m/**/*.test.mjs"`: tests 5388, pass 5292, fail 85 (baseline on `tranche/T25` @ ffbacddc52: 5314, 5218, 85); the same 85 in the same files (case-authoring, network-notices, filings, retrieval, promotion write-path, scheduler consumers, control-plane families and catalogue-end, affordances sources: reds 7, 8, 9). None in this module.
- `format`: 91 modules, 0 failures. `architecture`: 21 product files, 47 imports, 0 failures. `coverage`: 24 of 24 live ids named, 0 failures. `ownership` against `tranche/T25`: 18 files, 0 failures.

Size (session_012Yr3gwtfrXrBoUUrtJgU8a): test runs 22, module lines 1331

## J1 · QUESTION

`readingprov.mjs`'s move, and the window until extraction's merge. B1 says move `bio-plane/src/readingprov.mjs` into `reading-pipeline/` and tell you in COMPLETE so you drop the path. Moved bare, `extraction/index.mjs`:24 (and the `pipeline.mjs` copy extraction deletes) no longer resolve, so the plane does not load: measured on this branch, the whole `bio-plane/test/m` goes from the tranche baseline's 85 failures (all red 7's: case-authoring, network-notices, filings, retrieval, …) to 493 failing tests, nearly every file that composes the plane, plus my three plane-booting legacy tests (`d606-perpage-ocr`, `tier2-wire`, `system/pdf-worker-binding`), all green on the baseline.

**My best reading, which I am carrying on with:** the file moves whole to `reading-pipeline/readingprov.mjs`, and `bio-plane/src/readingprov.mjs` (my path) keeps one re-export line naming why and until when. With it the whole `test/m` is exactly the baseline's 85 failures, same files and counts, plus my 74 new tests passing; red 10 then never opens. Once extraction's L4 job has re-pointed its import to `reading-pipeline/index.mjs` and merged, a CHANGE to me deletes the re-export, and you drop the path from `modules.json` then. If you would rather have the bare move (red 10 as written), say so and I delete the line before you merge.
