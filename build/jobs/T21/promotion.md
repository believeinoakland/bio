# promotion (T21)

**Status** · session_019DDbAi6qXv77SjQcNNsRD3 · depth 2 · RUNNING until 2026-10-01T18:14:18Z (users' tests of promotion (33 modules)) · handled B2

## J1 · QUESTION

R56 and replay. R56 names no exemption for a replay (promote with replay:true, the control plane's verified Drive-era migration). My best reading, which I am building: a replayed creation of a project stating investigating or matured is refused PROJECT_STAGE_COMPUTED like any other, as R15 says a replay is not exempt from the state fence, and a migrated project lands at forming or closed with its stage computed (project-stage R2). The alternative is R9's: replay exempt from the refusal. Consequence for tests only: my R15 test seeds a stored legacy project state through the record double instead of a replayed creation. Answer only if you want the alternative.

## J2 · REPORT

Progress and reports (40dbcd3546 on job/T21/promotion). Done: (1) R56, C-86.15 PROJECT_STAGE_COMPUTED, replay not exempt (K942); a closed project's reactivation is now closed -> forming under the owner fence. (2) STATE_MOVE_FENCED_SINCE.project = 2026-10-01; R32 test proves the three retired moves read as earlier rules up to it and as errors after. (3) N458: the 15 lines, no test pinned them. (5) N469: gate.mjs:84 (the d470 'what keeps it true' note) and :130 (now past tense) re-worded to ROW_CENSUS and test/system/row-census.test.mjs; :577's R50 note names that suite; the rest are provenance. Tests: promotion 100/101, the one red registry.test.mjs:58 (membership's MODULE_ORDER, accepted). Users of promotion (33 modules, 332 files): 2628 tests, 36 fail, all in filings (35) and intent grammar.test.mjs:47 (K939); the same 36 fail on tranche/T21 without my change (compared file by file), so none is mine. Generated artifact staled: bio-plane/dist/bio-plane.bundled.mjs and .bundle.json (not_product), src/gate.mjs and src/promotion/* changed; not regenerated. Waiting for record-core's and membership's merges into tranche/T21 to stamp (item 4): send a CHANGE when both are in. Census of the tree now: 990 rows (C-117.20-.22 and C-86.15 arrived, C-68.1 where changed since 1.50.0).
