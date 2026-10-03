# publication (T29)

**Status** · session_017bm3BWK3xDxBgctGcV2Rnp · depth 2 · WORKING · handled B2

## J1 · REPORT

Read whole: requirements (publication, case-carriage public part), the seam read publication-split-2.md, L8's contract, publication's code (deliverer.mjs, publication/index.mjs, schema.mjs, checks.mjs, door.mjs) and the tests the split touches (fixture, invariants, t28, sources). Baseline on job/T29/publication @ 29e77d41c2: node --test test/m/publication/ → 109 tests, 108 pass, 0 fail, 1 todo (R30). Nothing ambiguous; no question. The change is ready to make as §1 states (caseCarriage getter forwarding sources/acceptedWork/extraction; gates call sourcesLapsed/acceptedWorkLapsed; commit calls holdMaterials and registers its files in published_shas; two one-line delegates; void p.caseCarriage at boot; DDL and the two exempt names removed; invariants R31 assertion edited). Waiting on your CHANGE after case-carriage's merge.
