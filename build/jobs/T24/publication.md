# publication (T24)

**Status** · session_011EAWfk12CZpKfp2bDZSvBW · depth 2 · COMPLETE · handled B1

## J1 · REPORT

Three things outside my files, for BOB:
1. **Generated artifact staled** (manifest §14): my edits to `bio-plane/src/publication/index.mjs` (the re-export removed, a comment) and `schema.mjs` (a SQL comment, stripped before execution) are inputs of the plane's bundle, so `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` are stale until BOB regenerates them at the layer close. I regenerated nothing.
2. **`build/requirements/publication.md`, stale after N483/N501** (wording; BOB's file): the Purpose's "reached here through the ops `export` and `exportlog`" and the Uses line for `corpus-export` ("to which the ops `export` and `exportlog` delegate until the plane's op map spreads its ops") no longer hold: publication has no such ops, and the plane's op map spreads `corpusExportOps` (`plane/store.mjs`:292, N483, K1122). Suggest: "the ops `export` and `exportlog` are corpus-export's, spread by the plane (N483)" and Uses "`corpusExportOf`, created by this module's factory so `export_log` exists at every boot (its R4); nothing else".
3. **Same file, R23**: "Today `legacy-store` fills it; `review` does when extracted." `review` fills it now (`review/index.mjs`:747, `registerReviewProvider("review", …)`). Suggest "`review` fills it (its R…)". Also `corpus-export.md`'s Suggestions line 56 ("until the plane's op map spreads `corpusExportOps` (T23 L11), those ops route nowhere") is past now.

## J2 · COMPLETE

**Entries applied** (START B1; commit `17052daa65`)
- (1) **N501.** The re-export of corpus-export's `EXPORT_LOG_LIMIT_DEFAULT` (`index.mjs`:93–:95) is retired. Grep first, of `bio-plane/src`, `bio-plane/test`, `bio-plane/scripts`, `pdf-worker`, `ocr-worker`, `agent-worker`, `newgroup/src` and `civicos-ui`: no importer of a corpus-export constant through publication remained (queue-producers, its sweeps test, ai-runs' comment and corpus-export's tests all name corpus-export directly); the only reader was this module's own N483 test, which pinned the re-export. Nothing re-pointed outside my paths.
- **:45's note** re-worded: it said `export_log` is created "until the plane's op map spreads corpus-export's ops"; the op map spreads `corpusExportOps` now (N483), so it says so. The eager creation stays (R4's declaration at every boot; requirements' Uses).
- **Re-scan** of every source and test file of the module for the N502/N508 kind: no `awaiting stamp`, no legacy store op map or dispatcher named as live. One stale present tense re-worded: `schema.mjs`'s `cases` note ("op=export answers project_id NULL … today", a CASE-1-era statement; op=export is corpus-export's) put in the past. Left as past-tense history: `door.mjs`:2 and its test (the legacy-index map's §4.4 move), `index.mjs`:220 ("legacy-store did until its retirement").
- **Test:** `invariants.test.mjs`'s N483 test (now titled N483 N501) asserts every constant corpus-export exports is absent from publication's exports, with a control that corpus-export's own list holds `EXPORT_LOG_LIMIT_DEFAULT`. Negative control run: the re-export restored, the test fails by name ("EXPORT_LOG_LIMIT_DEFAULT is corpus-export's alone").
- **Rows:** none added or changed, so nothing is `awaiting stamp` from this job (red 5: none to list).

**Deferred:** none.

**Found in other modules / artifacts** (REPORT J1): the plane bundle is stale; `build/requirements/publication.md` Purpose, Uses (`corpus-export`) and R23 are stale wording; `corpus-export.md` Suggestions' "until … T23 L11" is past.

**Tests and checks**
- `node --test bio-plane/test/m/publication/`: tests 99, pass 98, fail 0, todo 1 (R30, not yet met: D-246).
- Whole `bio-plane/test/m`: tests 5236, pass 5225, fail 0, skipped 0, todo 11. No red at all, so none of the accepted reds showed.
- `format.mjs`: 88 modules, 87 requirements files; 2 failures, both accepted red 4 (link-sweep's `paths` and `tests` absent). `architecture.mjs … publication`: 23 product files, 78 relative imports; 0 failures. `coverage.mjs … publication`: 39 of 39 live ids named by a test; 0 failures. `ownership.mjs … publication tranche/T24`: 4 files changed; 0 failures.

Size (session_011EAWfk12CZpKfp2bDZSvBW): test runs 3, module lines 4354
