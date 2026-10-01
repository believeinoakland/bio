# legacy-index (T19)

**Status** · session_012DcLevtEXs1PHgtUPjChis · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

Complete. Head: 196cc235a3 on job/T19/legacy-index (one commit on tranche/T19 @ f55f8da569; no merge needed).

**Entry applied (B1)**
- I checked what still runs `tools/` before deleting it. Nothing in `.github/` or any `package.json` names it. No product file and no module `tests` path imports, spawns or reads a `tools/` file. The references left are comments: `node tools/mintid.mjs C` in eleven modules' `checks.mjs`, `queuestate.mjs`:226/242 (queue), `textchain.mjs`:425, `control-plane/index.mjs`:562, `gate.mjs`:460, and `sshsig.mjs`:229. I left them as history (layers.md rule 6). `newgroup/src/release.mjs` names them only inside the embedded release source string. bundler's `release.test.mjs` asserts `tools/jsonc.mjs` is absent, and it still passes.
- Deleted `tools/` whole: 71 files, 25,178 lines at HEAD. That includes `.ui59/` and `m172-title-state-census.mjs`, the one file importing `bio-checks.mjs`. Also deleted `bio-plane/scripts/walkfloor.mjs` and `walkfigure.mjs` (1,264 lines; K787). Commit: 73 files, 26,442 deletions.
- `bio-plane/src/index.mjs` is untouched. It is plane's to delete (plane R8). The catalogue (`bio-checks.mjs`) still exists, so its :15 import needs no re-point yet. N437: every file of mine that named the old process is deleted. `index.mjs`' comments go when plane deletes it.

**Deferred.** Nothing.

**For BOB**
1. **Importers of the walk scripts (K749, K787).** Each one fails to load now. All are legacy-tests old suites or scripts, kept until the release (K619):
   - `test/system/hygiene.test.mjs`, `memoryshare.test.mjs`, `walkfigure.test.mjs`, `walkfloor.test.mjs`, `walkfigure.control.mjs`
   - `test/skillsequencing.test.mjs`, `moduleclosure.mjs`, `d301-census.control.mjs`, `walkfloor.control.mjs`
   - `scripts/budgetsweep.mjs`, `finallyexit.mjs`, `pensweep.mjs`
   - `civicos-ui/check-refusal-codes.mjs`, `check-semantics.mjs`

   `test/gatedeps.mjs` and `fleetbundles.control.mjs` join `tools/gates.mjs` by path. `system/moduleclosure.test.mjs`:195–199 asserts `tools/gates.mjs` and `gateresults.mjs` are in a real closure. `test/instrument-deps.mjs` and `tally-through-pipe.control.mjs` name the walk scripts. `agent-worker/test/harness.control.mjs`:589 names walkfloor in a comment only.
2. **`fleetbundles.test.mjs` was already red** (manifest Verify). Before and after my change it gives the same 93 PASS and the same 3 FAIL:
   - `agent-worker's 153 inputs are all recorded`.
   - Two `(j)` arms expecting `node tools/bundles.mjs` in the remedies. bundler moved that text to `bio-plane/scripts/bundles.mjs` in L1.

   This change neither causes nor alters them. It touches no bundle input: no `*.bundle.json` names `tools/` or the walk scripts. `newgroup-bundle-fresh.test.mjs`: 1 pass, 0 fail.
3. **Your files that still name `tools/`.**
   - `.gitignore`:150–303: the old pens' comments, and possibly patterns.
   - `build/layers.md` §"Paths that are not product", which lists `tools/`.
   - At the close, `legacy-index` leaves `modules.json` and plane's `from` (finish report (1)).

**Tests and checks**
- My module has no `tests`. The manifest names no layer tests. Before and after the deletion I ran:
  - `node --test bio-plane/test/system/fleetbundles.test.mjs`: 93 PASS, 3 FAIL, the same both times (item 2).
  - `newgroup-bundle-fresh.test.mjs` with `test/m/bundler/`: pass 45, fail 0, skipped 0.
- `format`: 87 modules, 82 requirements files; 0 failures · `architecture legacy-index`: 1 product files, 22 relative imports; 0 failures · `coverage legacy-index`: 0 of 0 live requirement ids; 0 failures · `ownership legacy-index tranche/T19`: 74 files changed; 0 failures.

Size (session_012DcLevtEXs1PHgtUPjChis): test runs 5, module lines 371
