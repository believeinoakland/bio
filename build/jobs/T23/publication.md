# publication (T23)

**Status** · session_01EJtfbXAWN7gNHrgDKbH1Hf · depth 2 · WORKING · handled B1

## Completion

**Entries applied** (B1, with K1119 and K1122 governing):
- **N483.** Retired the delegates `exportManifest` and `exportLog`, the op arms `export` and `exportlog` (after corpus-export's L8 merge, `05da332a38`, merged into this branch), and the re-exports of `EXPORT_LOG_LIMIT_MAX` and `EXPORT_NOTE_MAX`. `EXPORT_LOG_LIMIT_DEFAULT` stays re-exported, because `queue-producers/index.mjs`:41 imports it (K1119; its removal is N501). Corpus-export is still created eagerly (`publicationOf`, the `corpusExport` getter), so `export_log` exists and is declared at every boot. In the tests, the delegate test is gone, along with the two retired imports and the `export`/`exportlog` calls in R34. R31's arms are kept and now write the export through `corpusExportOf(w.host)`. A new test, "N483 (K1119)", holds that no export op or delegate is left, that corpus-export is still created at boot, and that the one re-export is corpus-export's own binding.
- **N500.** R56's two tests (`test/m/publication/casedoc.test.mjs`). The rows are written only through this module's own acts (R21 store and re-author, R22 commit) and read with queue-producers R23's SQL verbatim. They check: unsigned editions are listed; a re-authoring moves `authored_at`; signing sets `sig_armored` once; later stores, re-authors and signatures leave all four columns as they were; each case's latest unsigned edition is listed; the act's own clock stamps `authored_at`. Every row's four columns are held against R1's own read. The negative control has four arms: an unsigned row's `sig_armored` made non-null, a signed row's cleared, `authored_at` not an instant, and a column renamed. Each fails by name.
- **K1138 re-scan (N469/N502 kind).** Two notes named suites deleted in T20 as if they were live. Re-worded: `index.mjs` (the D-390 note on `frontier-chunk.test.mjs`) and `schema.mjs` (the `derivation-bounds` class). No `awaiting stamp` note is in this module's source. The header and the `deps` comment were re-worded for N483.

**Deferred:** none.

**Found in other modules / BOB's text (REPORT J1):**
- `build/requirements/publication.md`: R56's mark can be struck. The Uses line for `corpus-export` (:108) still names the delegates and the ops (BOB's, at the merge). R17 and R33 still call C-92.13 "a new row, `awaiting stamp`", but PROMOTION #24 stamped it in T23 L2 (1.53.0). R31's purge clause is unchanged.
- Generated artifact: `bio-plane/dist/bio-plane.bundled.mjs` is stale from this change (accepted red 12); nothing was regenerated.

**Tests and checks** (on `job/T23/publication` after merging `tranche/T23` at `fc9de025bb`+):
- `node --test bio-plane/test/m/publication/ bio-plane/test/m/corpus-export/`: tests 111, pass 110, fail 0, todo 1 (R30, D-246).
- `node --test bio-plane/test/m/` (the whole tree, which includes every module named in B1's (1) and users list): tests 5062, pass 5045, fail 5, todo 12. The five reds:
  1. conformance `record.test.mjs`:144 (its R17 test, failing at :165, `w.publication.exportManifest is not a function`): red 6, until conformance's L9 merge.
  2. plane `worker.test.mjs`:39 (R6, the runtime door). `op=queue` answers 502 `STORE_DID_NOT_ANSWER` because queue-producers calls `publication.exportLog` (`queue-producers/index.mjs`:1493). With a delegate put back temporarily, this test passes (5/5), so the cause is that call. Red 6's plane share, until L11. Queue-producers still loads, since the import it reads at load (`EXPORT_LOG_LIMIT_DEFAULT`) is kept. `test/m/queue-producers/`, `test/m/queue/` (but for 4), `test/m/control-plane/` (but for 3), `test/m/affordances/` and `test/m/instance-setup/` add no red.
  3. control-plane `inbox-door.test.mjs`:81: red 9, inherited (red before this change).
  4–5. queue `catalogue.test.mjs`:34 (R1) and :116 (R5): red 13, inherited.
  Before this change, on `origin/tranche/T23` (publication's source checked out from it), conformance `record.test.mjs` and plane `worker.test.mjs` passed 12/12.
- `node checks/format.mjs`: 87 modules, 86 requirements files; 0 failures. `architecture.mjs … publication`: 23 product files, 79 relative imports; 0 failures. `coverage.mjs … publication`: 39 of 39 live requirement ids named by a test; 0 failures (R56's red 10 cleared). `ownership.mjs … publication tranche/T23`: 5 files changed; 0 failures.

Size (session_01EJtfbXAWN7gNHrgDKbH1Hf): test runs 9, module lines 3636
