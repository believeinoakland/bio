# extraction (T35)

**Status** · session_012j4Xu6XxwHWUGxui4G3m5P · depth 2 · WORKING · handled B2

## J1 · QUESTION

N636 needs a modules.json edge: extraction's uses gains doctypes (L1, earlier). The fix registers doctypes' readers once in the suite fixture (`registerDoctypes(registerDoctype)` in `bio-plane/test/m/extraction/fixture.mjs`, as reading-pipeline's suites do since K1781); with it all six reds clear (121/121). The architecture check then fails one line only: fixture.mjs imports doctypes/index.mjs, which extraction does not declare in uses. My best reading: BOB adds the edge (as K1781 did for reading-pipeline); I carry on with the sweep rows and will merge tranche/T35 when it lands.

## Completion (EXTRACTION #14, 2026-10-07)

**Entries applied.** T35-25 (req: none).
- N636: `bio-plane/test/m/extraction/fixture.mjs` registers doctypes' readers once (`registerDoctypes(registerDoctype)`, as the plane's `wiring.mjs` and reading-pipeline's suites do), so the six suites red since K1737 (afterread ×1, convert-chain ×2, pdfstructure ×1, read ×2) are green; accepted red 6 is cleared. The `uses` edge to doctypes is BOB's (J1, B2, K1958).
- N664, DEC-149, all seven rows, worded as the sweep proposes: `checks.mjs`:29 (C-51.1) "a re-read in a form your group's Civicsmith does not recognise"; :57 (C-51.4) "Your group's Civicsmith has no OCR engine installed"; `filemembership.mjs`:119 "this pairing is an inference from position, to be confirmed"; `index.mjs`:935 "your group's Civicsmith did not compose this reading: a caller carried it in"; :937 "your group's Civicsmith read the capture's bytes and composed this reading"; :1212 "your group's Civicsmith has no evidence store set up, so the stored bytes cannot be read again"; :1443 "what your group's Civicsmith can read; this one is re-read now". The six X rows (bindings named, SQL and code comments) stay. C-51.1 and C-51.4 await stamp (accepted red 2).

**Tests.** New `dec149.test.mjs` (R32 R47 C-51.1; R32 R47 C-51.4, plus every C-51 translation free of the retired words; R52; R27 R21; R34), each read at the interface where a member reads it; and an R66 arm in `n26.test.mjs` for the migration's no-store reason. Negative control: against the old source all six arms fail.

**Deferred.** Nothing.

**Found in other modules / generated artifacts.** The plane bundle `bio-plane/dist/bio-plane.bundled.mjs` embeds the old strings and is now stale (§14), for BOB at L4's close; `release/bio-plane.bundled.mjs` and `newgroup/src/release.mjs` carry them as released content. `connections/index.mjs`:1198 carries the same "the plane's inference from position" sentence; it is connections' own sweep row (L5). No other module's test pins these strings (the row-census fixture is historical).

**Tests and checks run.**
- `node --test bio-plane/test/m/extraction/*.test.mjs`: tests 127, pass 127, fail 0 (121 before the new arms; 115 pass, 6 fail at the start).
- `format`: 129 modules, 128 requirements files; 0 failures.
- `architecture extraction`: 27 product files, 101 relative imports; 0 failures (after K1958).
- `coverage extraction`: 45 of 45 live requirement ids named by a test; 0 failures.
- `ownership extraction tranche/T35`: 7 files changed; 0 failures.

Size (session_012j4Xu6XxwHWUGxui4G3m5P): test runs 7, module lines 4
