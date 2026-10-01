# intent (T21)

**Status** · session_01Ld95mtgmHB7ZNFnrh5y7Nt · depth 2 · COMPLETE · handled B0

## J1 · REPORT

Found while applying B1. I edited none of these files.

1. **Generated artifact made stale:** `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` (owner `not_product`). The bundle carries `src/intent/grammar.mjs` and `src/intent/index.mjs`, and this job changed both (the ids, a comment). Regenerate them at layer close. No other generated artifact takes intent's files.
2. **Whole `test/m`:** nothing new is red. I ran my branch and `origin/tranche/T21` side by side. Every failure on my branch also fails on the baseline: 41 failures, filings' R6/R7/R16/R22/R25 and the R43/R22 decoration test among them. Those belong to other modules and are not caused by intent. The baseline also fails the accepted R29 red (K939), and this job fixes it.

## J2 · COMPLETE

Job done on `job/T21/intent` (pushed, commit 8d83003d3e).

**Entries applied** (`build/plan/current.md` T21 L7; B1):
- **N456's share (K935):**
  - `bio-plane/src/intent/grammar.mjs`: `PROJECT_GRAMMAR` now claims `["C-2.9"]` only.
  - The header's "The slot keeps the id `C-9.1` until record-grammar's slot drops it" now says what is true: the slot holds `C-2.9` alone (record-grammar R28; K904, K930), and this grammar claims it so.
- **R29's tests** (`test/m/intent/grammar.test.mjs`):
  - The registration test checks that the slot is `["C-2.9"]` and that `PROJECT_GRAMMAR` is `intent`, `["C-2.9"]`. It is registered once through record-core's seam (R67), as the only claimant of the slot, and no registration holds `C-9.1`. `checkBundle` accepts the registrations whole (record-grammar R39).
  - New: `checkBundle` runs the arm at the slot's place. A probe in the C-2.8 slot fires before it, and a probe grammar that claims no slot fires after it, whatever order the grammar list is in.
  - The C-9.1 test now checks that neither the slot nor any grammar holds C-9.1. Before, it checked that the grammar kept it.
  - The header comment was re-worded to match.
- **N469 re-scan of my paths:** nothing in them names a file T20 deleted as live, and none mentions "the battery". Three stale notes named retired legacy modules as live, and I re-worded them:
  - `src/intent/index.mjs`:1419, "Legacy-index routes them", now says the plane's route map spreads them.
  - `test/m/intent/fixture.mjs`:70, "legacy-store builds intentOf…", now names the plane's constructor and the scheduler.
  - `fixture.mjs`:87: the test's producing-group fact is now registered as `instance-setup`, not `legacy-store`, which is retired.
  - Provenance notes ("extracted from `legacy-checks`", "the catalogue's finding shape") stay.

**Promotion's stamp:** no row changed, but the ids of my registration changed. This is **awaiting stamp (behaviour, no row)** for T22 (P8).

**Deferred:** none.

**Found in other modules:** see J1. The plane bundle is stale, and nothing new is red in `test/m`.

**Tests and checks run:**
- `node --test bio-plane/test/m/intent/`: tests 60, pass 60, fail 0.
- Whole `bio-plane/test/m` on my branch: tests 4691, pass 4630, fail 41, todo 20.
- The same run on `origin/tranche/T21`: fail 45. My failures are a strict subset of the baseline's. The baseline's four extra failures:
  - R29's accepted red (fixed here);
  - "R2 a tree a test left read-only is removed…";
  - two extraction files that did not load in the scratch worktree.
- Layer tests: none named in the manifest.
- `node checks/format.mjs`: 86 modules, 84 requirements files; 0 failures.
- `node checks/architecture.mjs … intent`: 13 product files, 49 relative imports; 0 failures.
- `node checks/coverage.mjs … intent`: 30 of 30 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … intent tranche/T21`: 5 files changed by intent; 0 failures.

Size (session_01Ld95mtgmHB7ZNFnrh5y7Nt): test runs 4, module lines 1927
