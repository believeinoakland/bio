# promotion (T21)

**Status** · session_019DDbAi6qXv77SjQcNNsRD3 · depth 2 · COMPLETE · handled B3

## Completion

**Entries applied** (B1, `build/plan/current.md` T21 layer 2; B2, B3):
- **(1) N456, R56 (form (b), K904; replay not exempt, K942).** `PROMOTION_CHECKS.PROJECT_STAGE_COMPUTED` (C-86.15, BOB's row text) after C-86.14; `#promote`'s region `is-project-stage-computed` refuses a project's creation whose recorded state (the document's word, else the envelope's) is not `forming` or `closed`, naming the state and `legal`, before anything is written or minted. A revision's move is R15's over record-grammar's table; a stored `investigating`/`matured` left where it stands (stated or carried) is accepted. The owner fence's reactivation is now `closed` -> anything (the table's one move is `forming`; R15 refuses the rest).
- **(2) The fence.** `STATE_MOVE_FENCED_SINCE` gains `project: "2026-10-01"`: C-4.2 reads the retired moves recorded at or before it as earlier rules (info), after it as errors.
- **(3) N458.** The 15 lines: `gate.mjs` (PLANE_HELD_IN_PARTS), `history.mjs` (two repairs), `index.mjs` (grammar-threw finding, ABSENT, EXISTS, CAS_STALE details), `names.mjs` (C-77.2's label and repair), `release.mjs` (C-18.8's six). Re-scan: the rest are comments, `bundle.md`, region names, codes and the release message's `bundle` field (wire). No test pinned the old words.
- **(4) The stamp.** `CATALOG_VERSION` 1.51.0 with its note; `ROW_CENSUS` 984 rows, b7c43a32…, read on this branch after merging tranche/T21 @ 3e16dc612d. Against 1.50.0's fixture: arrived C-117.20–.22, C-86.15; changed (`where`) C-68.1; held once again C-63.1, C-63.2, C-96.8, C-96.15–.17 (membership's copies gone). Composition named: STATES.project, C-6.3, slot ids, intent's C-2.9/C-9.1 (K907), C-13.2/C-16.1 messages, R56 and the fence, the promote step's move to control-plane (K920). `GATE_VERSION`'s literal kept. `row-census.test.mjs` (not edited, K941): 8 pass, 0 fail; it lists the four 1.50.0 declarations as "stamped since, retire" and has no 1.51.0 snapshot: legacy-tests' re-pin (L11).
- **(5) N469.** `gate.mjs` "what keeps it true" (d470 as live) re-worded to `ROW_CENSUS` and `test/system/row-census.test.mjs`; the 1.29.0 note's "three places move" made past tense; the R50 pin's note names the suite. The other d470/ratify mentions are stamp provenance and stay.
- **K939.** `promote.test.mjs` R19 re-keyed: legal moves `forming -> closed`, `closed -> forming`; negative arms for `forming -> investigating` and `closed -> investigating`. `registry.test.mjs`:58 green after membership's merge.

**`not yet met: T21` marks met:** R56.

**Deferred:** none.

**Other modules (REPORT J2):** `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` stale (src/gate.mjs, src/promotion/*). filings' tests: 35 fail on tranche/T21 with or without this change (`test/m/filings/`: approve-send, outward, packet, premise, prepare, reads, refusals, sight), not mine. legacy-tests: the row-census suite's 1.50.0 declarations to retire and a 1.51.0 fixture to add.

**Tests and checks:**
- `node --test bio-plane/test/m/promotion/*.test.mjs`: tests 101, pass 101, fail 0
- negative control: with the fence and the R56 region removed, 3 fail (R20 row set, R32 project fence, R56); restored
- users of promotion (33 modules, 332 files): tests 2628, pass 2573, fail 36: filings 35 and intent `grammar.test.mjs`:47 (K939), the same set on tranche/T21 without this change
- `bio-plane/test/system/row-census.test.mjs`: 8 pass, 0 fail
- `node checks/format.mjs`: 86 modules, 84 requirements files; 0 failures
- `node checks/architecture.mjs … promotion`: 22 product files, 80 relative imports; 0 failures
- `node checks/coverage.mjs … promotion`: 56 of 56 live requirement ids named by a test; 0 failures
- `node checks/ownership.mjs … promotion tranche/T21`: 10 files changed; 0 failures

Size (session_019DDbAi6qXv77SjQcNNsRD3): test runs 14, module lines 3141


## J1 · QUESTION

R56 and replay. R56 names no exemption for a replay (promote with replay:true, the control plane's verified Drive-era migration). My best reading, which I am building: a replayed creation of a project stating investigating or matured is refused PROJECT_STAGE_COMPUTED like any other, as R15 says a replay is not exempt from the state fence, and a migrated project lands at forming or closed with its stage computed (project-stage R2). The alternative is R9's: replay exempt from the refusal. Consequence for tests only: my R15 test seeds a stored legacy project state through the record double instead of a replayed creation. Answer only if you want the alternative.

## J2 · REPORT

Progress and reports (40dbcd3546 on job/T21/promotion). Done: (1) R56, C-86.15 PROJECT_STAGE_COMPUTED, replay not exempt (K942); a closed project's reactivation is now closed -> forming under the owner fence. (2) STATE_MOVE_FENCED_SINCE.project = 2026-10-01; R32 test proves the three retired moves read as earlier rules up to it and as errors after. (3) N458: the 15 lines, no test pinned them. (5) N469: gate.mjs:84 (the d470 'what keeps it true' note) and :130 (now past tense) re-worded to ROW_CENSUS and test/system/row-census.test.mjs; :577's R50 note names that suite; the rest are provenance. Tests: promotion 100/101, the one red registry.test.mjs:58 (membership's MODULE_ORDER, accepted). Users of promotion (33 modules, 332 files): 2628 tests, 36 fail, all in filings (35) and intent grammar.test.mjs:47 (K939); the same 36 fail on tranche/T21 without my change (compared file by file), so none is mine. Generated artifact staled: bio-plane/dist/bio-plane.bundled.mjs and .bundle.json (not_product), src/gate.mjs and src/promotion/* changed; not regenerated. Waiting for record-core's and membership's merges into tranche/T21 to stamp (item 4): send a CHANGE when both are in. Census of the tree now: 990 rows (C-117.20-.22 and C-86.15 arrived, C-68.1 where changed since 1.50.0).

## J3 · COMPLETE

Done; merge last in L2. Stamp: CATALOG_VERSION 1.51.0, ROW_CENSUS 984 rows b7c43a32… on this branch after tranche/T21 @ 3e16dc612d (arrived C-117.20-.22, C-86.15; C-68.1 where; membership's C-63.1, C-63.2, C-96.8, C-96.15-.17 copies gone; composition named in the note). row-census.test.mjs 8/0 (not edited; its 1.50.0 declarations and a 1.51.0 fixture are legacy-tests' L11). R56 met (not yet met: T21 mark), C-86.15, fence project 2026-10-01, N458's 15 lines, N469 in gate.mjs, K939's R19 re-key. promotion 101/101 (registry green). Users: 36 fail, the same set on the tranche without me (filings 35, intent K939). format, architecture, coverage 56/56, ownership 0. Plane bundle stale (J2). Details in the record's Completion.
