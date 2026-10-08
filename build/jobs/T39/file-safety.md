# file-safety (T39)

**Status** · session_01TJ4PTCM3iSyJeRYmdDY3L3 · depth 2 · COMPLETE · handled B2

## Completion

**Entry applied** · T39-6 (N806; K2333): R6's source condition reads `provenance.fetchedByThisCopy` (its R62), and `threatOf`'s `source` is R62's answer as given. `FETCHED_VIAS`, `UNPACKED` and the old `#sourceOf` walk are deleted from `bio-plane/src/file-safety/index.mjs`. A private guard, `#fetched`, answers `{fetched: false, routes: [], archive: null}` when the call throws or answers no boolean `fetched` (fail closed, as R62 itself does). No meaning changes: every existing R6 source arm (direct, web archive, capture request, knock, an archive's member, a knocked archive's member) passes unchanged against the merged R62.

**Reading set** (mechanics §17 step (3), K2304; over 300 KB) · I read these whole myself:
- `build/requirements/file-safety.md`;
- layer 3's row of `build/layers.md`;
- provenance R62, and its Uses line for `ARCHIVE_DEPTH_MAX`;
- my plan entry T39-6, and K2333 and K2343;
- the code and tests the entry changes: `bio-plane/src/file-safety/index.mjs` lines 1–700 (the grade and everything it calls), `test/m/file-safety/grade.test.mjs` and `fixture.mjs`.

A worker read whole the rest: `checks.mjs`, `formats.mjs`, `kinds.mjs`, `schema.mjs`, `index.mjs` 700–end, and the eight other test files. Its summary is about 7 KB and cites file and line. It covers every reader of the grade and `source`, every test touching a source arm, `THREAT_REASONS.source_not_fetched` (`checks.mjs`:163) and every provenance call. Its findings: only `.fetched` is read; everything else reads `threat` alone; and no test outside `grade.test.mjs` asserts on `source`. Nothing it left out mattered.

**Tests** · A new R6 (N806, K2333) test in `grade.test.mjs` checks every source arm: direct, `archive.org`, `capture-request`, a knock, a capture with no receipt, an archive's member, a nested archive's member, and a knocked archive's member. For each it checks that `source` deep-equals `w.prov.fetchedByThisCopy` and has the literal `{fetched, routes, archive}` shape, and that `source_not_fetched` is present exactly when the file was not fetched. It also checks that three unreadable answers (a throw, `null`, `{ok: false}`) grade the file not fetched.

**Deferred** · none.

**Found in other modules** · My change stales the plane bundle: `bio-plane/dist/bio-plane.bundled.mjs` still holds the old `FETCHED_VIAS` and `#sourceOf`. It is regenerated at the layer's close (rule 3). Nothing else.

**Tests and checks** (on `job/T39/file-safety` with `tranche/T39` merged, provenance R62 included)
- `node --test bio-plane/test/m/file-safety/`: tests 53, pass 53, fail 0.
- `node --test bio-plane/test/m/provenance/` (the service I now call): 120/0.
- Negative controls, each armed alone and restored (verified with `cmp`), all in `grade.test.mjs`:
  - ignoring R62's `fetched` fails 3 of 5;
  - rebuilding the answer without its `archive` fails 2;
  - failing open on a throw fails 1.
  - Restored: 5/0.
- Before the merge, against a scratch stand-in of R62 (never committed): 53/0.
- Layer tests: none named in the manifest.
- `checks/format.mjs`: 139 modules, 137 requirements files; 0 failures.
- `checks/architecture.mjs bio file-safety`: 15 product files, 61 relative imports; 0 failures.
- `checks/coverage.mjs bio file-safety`: 41 of 41 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs bio file-safety tranche/T39`: 3 files changed; 0 failures.

P6: `index.mjs` 1,678 → 1,668 lines; the module's source is 2,248 lines.

Size (session_01TJ4PTCM3iSyJeRYmdDY3L3): test runs 12, module lines 2248

## J1 · REPORT

T39-6 built against R62's text and pushed (77f2345af5): R6's source reads provenance.fetchedByThisCopy, source = its answer as given; FETCHED_VIAS, UNPACKED and #sourceOf deleted; fail closed when the answer is unreadable. New R6 test: source deep-equals R62 for every arm (direct, archive.org, capture-request, knock, no receipt, archive member, nested member, knocked archive's member) and the literal {fetched, routes, archive} shape. Against a scratch stand-in of R62 (never committed): file-safety 53/0; format, architecture, coverage 41/41, ownership 0 failures. On the tranche today 8 of 53 fail, only because R62 is absent. For PROVENANCE: byte for byte today's needs R62 to answer exactly {fetched, routes, archive} in that key order, bare lowercase digests, no wrapper. Waiting for your word that provenance has merged.

## J2 · COMPLETE

T39-6 done on the merged tranche: R6's source condition reads provenance R62 fetchedByThisCopy, source = its answer as given; FETCHED_VIAS, UNPACKED and #sourceOf deleted; fail closed on an unreadable answer. file-safety 53/0, provenance 120/0; negative controls (ignore fetched, drop archive, fail open) each caught; format, architecture, coverage 41/41 and ownership 0 failures. index.mjs 1,678 -> 1,668 lines. Stales the plane bundle (old FETCHED_VIAS in dist), regenerated at the layer close. R6's T39 mark may be struck. Details in my record.
