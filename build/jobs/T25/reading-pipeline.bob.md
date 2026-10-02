# BOB to reading-pipeline (T25)

**Read** · handled J3

## B1 · START

Depth 2. Your entries: `build/plan/current.md` (T25) L4, reading-pipeline: N513, **a new module** (K1193, K1218, K1221). Requirements `build/requirements/reading-pipeline.md` R1–R22 and R24 (extraction R2–R17, R60, R25, R26; R20–R22 copies of R44, R45, R50; R24 `read`'s signature). `modules.json`: paths `bio-plane/src/reading-pipeline/` and `bio-plane/src/readingprov.mjs` (yours from the opening), tests `bio-plane/test/m/reading-pipeline/` and the six legacy-path tests and fixtures extraction held. **Merge first in L4**, then extraction. (1) Create your module from `bio-plane/src/extraction/pipeline.mjs` (copy; extraction's job deletes it there) and move `bio-plane/src/readingprov.mjs` into `bio-plane/src/reading-pipeline/` (yours; tell BOB in COMPLETE so it drops that path from `modules.json`). Export what extraction calls (`build/plan/draft-T25-splits.md` E-1 lists them: `read`, `tier2Escalate`, …, `CAPTURE_TEXT_UNIT_CAP`, `readingProvenance`, `compareProvenance`, `PROVENANCE_SCHEME`). (2) Move `test/m/extraction/read.test.mjs` (its R1, R18 and `acquireReadingOp` arms stay in extraction), `convert-ocr.test.mjs`, `staffdirectory.test.mjs`, `convert-tiers.test.mjs` (its R31/R34 arms stay), `rules.test.mjs` 18–54, and your share of the mixed `convert-chain` and `convert-extent`, into `test/m/reading-pipeline/`, renamed to your ids, calling `read(document, {evidence, env, view, liveCalibration})` directly with a small fixture of your own; assertions unchanged. Copy the cases into your paths: extraction's job deletes its own copies. The six legacy-path tests re-point their imports to your module. Measure your `uses` (`record-grammar` and `calibration` only if your fixture needs them) and list it in COMPLETE. Re-scan your own module for the N502/N508 kind (`plan/t24-stale-notes.md`; N469's rule) and re-word what you find. Do not edit another module's files; a change under `bio-plane/src/` may stale a bundle: report it, regenerate nothing (`build/manifest.md`). Reds you inherit, accepted by name (`build/plan/current.md` T25 "Accepted reds"): 2, 3, 4, 6 (a row you add or change: list each in COMPLETE), 7, 8, 9, 10; BOB adds any red an earlier merge accepts. Proof: requirement-named tests for every id at your interface, with negative controls; your module's tests green; the whole `bio-plane/test/m` with no red beyond those named.

## B2 · CHANGE

K1233: export everything extraction and the legacy-path tests import (read, tier2Escalate, tier3Extend, tier3SeedFrom, needsTier3, textUnitsFor, layerChainFor, readingFromWire, decodeView, textCountsOf, pageBoxesFrom, bytesOf, CAPTURE_TEXT_UNIT_CAP, readingProvenance, compareProvenance, PROVENANCE_SCHEME) from ONE entry, bio-plane/src/reading-pipeline/index.mjs; inner files are yours. Move src/readingprov.mjs inside your directory (I drop its modules.json path at your merge). Extraction is building against that entry.

## B3 · ANSWER · re J1

Accepted (K1235): keep the one re-export line in src/readingprov.mjs (why and until when); I send a CHANGE after extraction merges to delete it. Also read B2 (K1233): one entry, src/reading-pipeline/index.mjs, exporting all sixteen names extraction imports.

## B4 · CHANGE

Extraction has merged into tranche/T25 (K1237) and imports only reading-pipeline/index.mjs. Merge tranche/T25, delete bio-plane/src/readingprov.mjs (its re-export line, K1235), check nothing else imports that path, run your tests and the whole test/m, and post COMPLETE; I drop the path from modules.json at the merge.
