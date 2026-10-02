# basis-versions (T24)

**Status** · session_01NkLoN8Ah4BKszfLxPWghva · depth 2 · COMPLETE · handled B0

## Completion

**Entries applied** (B1 START; `build/plan/current.md` T24 L6, basis-versions: N502; wording only, no meaning changed, no requirement changed):
- N502: `bio-plane/src/basis-versions/checks.mjs`:12 said the C-25 and C-27.15 rows naming `./grammar.mjs` were "awaiting promotion's stamp"; 1.50.0 took them (`gate.mjs` stamp history, PROMOTION #21, T20 layer 2: "CHANGED, `where` only … C-25.1–.10, .12–.15, .19 and C-27.15 (basis-versions' grammar)"). Re-worded "stamped at 1.50.0, T20 layer 2".
- Re-scan of the module for the same kind (N469's rule: a retired thing named as live). Three comments named the retired check catalogue (`legacy-checks`) as live; each re-worded to the live owner:
  - `index.mjs`:40: content's extent grammar holds D-670's rule "which the catalogue's copy does not" → "which the retired check catalogue's copy (legacy-checks) did not".
  - `index.mjs`:976: "the machine is the catalogue's" → "record-grammar's (`STATES`, once the catalogue's)", which is what the code imports.
  - `text.mjs`:3: "a front-matter PARSER (the catalogue's)" → "(record-grammar's `parseFrontmatter`, once the catalogue's)".
  - Not stale (left): `index.mjs`:1673–1675 (op map spread by `plane`'s `src/plane/store.mjs`, the live plane store); `index.mjs`:8–12, `grammar.mjs`:4–8, :25, :576, `schema.mjs`:2, `text.mjs`:2, `checks.mjs`:5–13, :138, :303, :570, :637 (past-tense history of the move or of retired tools); every other "stamp" is the control plane's identity stamp or DEC-65's machine stamp, not a catalogue stamp. The outward `detail` strings that say "the catalog" (`index.mjs`:936, :983, :1522) are behaviour, asserted by a test (`conclude.test.mjs`:40), and are left alone in a wording-only job. No test carries a stale note.
- No catalogue row added or changed: all four edits are comments. Red 5 (rows awaiting T25's stamp): none from this job.

**Deferred:** none.

**Read:** `build/requirements/basis-versions.md` (whole), the module's source files where the scan hit (`checks.mjs` whole; the headers and hit sites of `index.mjs`, `grammar.mjs`, `text.mjs`, `schema.mjs`), its plan entry (N502), `plan/t24-stale-notes.md`, and `gate.mjs`'s 1.49.0–1.51.0 stamp notes. The Uses' public parts and the rest of the code were not read whole: a comment-only job that changes no call and no behaviour.

**Found in another module or artifact (REPORT J1):**
- The comment-only edits under `bio-plane/src/basis-versions/` stale the plane's bundle `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`): `bio-plane/test/system/fleetbundles.test.mjs` reports bio-plane STALE BUNDLE against `src/basis-versions/checks.mjs`, `index.mjs` and `text.mjs`. Nothing regenerated.

**Tests and checks** (on `job/T24/basis-versions` after merging `tranche/T24` @ b0a80df5ff):
- `node --test bio-plane/test/m/basis-versions/`: tests 118, pass 118, fail 0 (before and after the merge).
- `node --test bio-plane/test/m/` (whole, before the merge): tests 5236, pass 5225, fail 0, skipped 0, todo 11. No red beyond the accepted ones (none appeared).
- `checks/format.mjs`: 88 modules, 87 requirements files; 2 failures, both link-sweep's absent `paths` and `tests` directories (accepted red 4).
- `checks/architecture.mjs bio basis-versions`: 23 product files, 79 relative imports; 0 failures.
- `checks/coverage.mjs bio basis-versions`: 44 of 44 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs bio basis-versions tranche/T24`: 4 files changed (three sources and this record); 0 failures.

Size (session_01NkLoN8Ah4BKszfLxPWghva): test runs 4, module lines 3509

## J1 · REPORT

One thing outside my module (wording job, no requirement change): my comment-only edits to bio-plane/src/basis-versions/checks.mjs, index.mjs and text.mjs stale the plane's bundle bio-plane/dist/bio-plane.bundled.mjs (not_product; fleetbundles.test.mjs reports it). Nothing regenerated.

## J2 · COMPLETE

basis-versions T24 done: N502 applied (checks.mjs:12 now 'stamped at 1.50.0, T20 layer 2', PROMOTION #21's C-25/C-27.15 where change) and the module re-scanned: three comments naming the retired check catalogue as live re-worded to record-grammar / past tense (index.mjs:40, :976; text.mjs:3); index.mjs:1673 names the live plane store, left. Wording only; no row added or changed, so no red 5 rows. Proof: test/m/basis-versions 118/118; whole test/m 5236 tests, 5225 pass, 0 fail, 11 todo, no red; format 2 failures = accepted red 4 (link-sweep dirs); architecture, coverage (44/44), ownership 0 failures. Record: build/jobs/T24/basis-versions.md on job/T24/basis-versions (tranche/T24 merged at b0a80df5ff). Report in my previous entry.
