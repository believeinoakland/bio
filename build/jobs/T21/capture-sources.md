# capture-sources (T21)

**Status** · session_01QDj4FCYp9ZVbcHpGngkfgW · depth 2 · COMPLETE · handled B0

## Completion

**Entries applied** (B1, `build/plan/current.md` T21 layer 3, N469; comments only):
- `drive.mjs`:338 (listed): "`hygiene.test.mjs` asserts that at SOURCE" dropped as a claim; the note now says every hop is built in `drive.mjs`/`cdx.mjs` from the address and what the instance fetched (R51, R35, proved in `test/m/capture-sources/drive.test.mjs` and `cdx.test.mjs`), and that reading no provenance field off a body is the acquire path's own to keep.
- `browserrender.mjs`:28 (BOB's re-scan): "The battery runs `src/index.mjs` RAW under miniflare" re-worded to the plane's miniflare suites, which run the plane's entry `src/plane/index.mjs` raw the same way (e.g. `test/m/host-governor/ops.test.mjs`), so the conclusion (no bare-specifier dependency) still holds; "a renderer, or a battery" now "a renderer, or the miniflare suites". The `:21` measurement (`node test/rendered-capture.test.mjs` died) is provenance and stays.
- My own re-scan found more notes naming retired suites as live (deleted before or at T20), re-worded the same way:
  - `drive.mjs`:11 `test/drive.test.mjs` and `src/index.mjs` -> `test/m/capture-sources/drive.test.mjs` and the callers `acquisition`, `monitoring`; `:41` `index.mjs`'s `is-drive-capture` region -> `acquisition`'s (`src/acquisition/index.mjs`).
  - `drive.mjs`:59-64 "`test/drive.test.mjs` asserts these three strings EQUAL odf.mjs's": R38 is mine. A test importing `odf.mjs` fails the architecture check (odf-reader is not in my uses), so the note now states the proof that exists: both sides pin the same exact strings, `drive.test.mjs` R38 and `test/m/odf-reader/entries.test.mjs` R31, so a drift on either side fails by name. No `uses` edge asked for.
  - `drive.mjs`:362-369 "`test/d525-driveshells.test.mjs` asserts op=monitor's baseline equals the sweep's": the rule is R45, proved in `drive.test.mjs`; that monitoring's tick chooses the same row is now stated as monitoring's to prove, the retired suite named in the past tense.
  - `browserrender.mjs`:69 and `render.mjs`:581 `test/browser-render.test.mjs` (under miniflare) -> `test/m/capture-sources/browserrender.test.mjs`, in plain Node; `render.mjs`:557 "Tests inject it through miniflare's serviceBindings" -> `env.RENDERER` in `render.test.mjs` R18; `render.mjs`:13 `index.mjs`'s acquire arm -> `acquisition`'s.

**Deferred:** none.

**Other modules (REPORT J1):** the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`, `.bundle.json`, `not_product`) is stale: comments changed in `src/drive.mjs`, `src/render.mjs`, `src/browserrender.mjs`; not regenerated. monitoring: its tick finds the Drive baseline row with its own lookup (`src/monitoring/index.mjs`:578) beside `driveBaselineRow` (R45), which its `driveShells` sweep uses; no test now proves the two choose the same row (the retired `d525-driveshells.test.mjs` did), so monitoring could call `driveBaselineRow` or test the agreement.

**Tests and checks:**
- `node --test bio-plane/test/m/capture-sources/`: tests 75, pass 74, fail 0, todo 1 (R37, not yet met, K48)
- No layer tests (`build/manifest.md`); no provided service changed, so users' tests not owed.
- `node checks/format.mjs`: 86 modules, 84 requirements files; 0 failures
- `node checks/architecture.mjs … capture-sources`: 10 product files, 19 relative imports; 0 failures
- `node checks/coverage.mjs … capture-sources`: 63 of 63 live requirement ids named by a test; 0 failures
- `node checks/ownership.mjs … capture-sources tranche/T21`: 4 files changed; 0 failures

Size (session_01QDj4FCYp9ZVbcHpGngkfgW): test runs 4, module lines 2255

## J1 · REPORT

Generated artifact staled: bio-plane/dist/bio-plane.bundled.mjs and .bundle.json (not_product): comments changed in src/drive.mjs, src/render.mjs, src/browserrender.mjs; not regenerated. monitoring: its tick finds the Drive baseline row with its own lookup (src/monitoring/index.mjs:578) beside driveBaselineRow (my R45), which its driveShells sweep uses; no test now proves the two choose the same row (the retired d525-driveshells.test.mjs did). monitoring could call driveBaselineRow, or test the agreement.
