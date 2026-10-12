# interface-assets (T46)

**Status** · session_01DGngQktvGFPxRhvzigguEP · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied.** T46-53 · interface-assets (new; N897 (1); DEC-138; N559): R1–R4, built fresh.
- `bio-plane/src/interface-assets/index.mjs` (generated, 28 lines, about 1.1 MB): `ASSETS_COMMIT = "3f40899950"` and the frozen `ASSET_FILES`: `civicsmith.css` (civicsmith.css then faces.css with the 15 `url("fonts/<f>")` rewritten to `url("/app/assets/fonts/<f>")`, `text/css`), `icons.svg` (`image/svg+xml`), the 15 `fonts/*.woff2` (`font/woff2`, `encoding: "base64"`), the three `fonts/OFL-*.txt` (`text/plain`); 20 names, no other.
- `bio-plane/src/interface-assets/generate.mjs`: the generator, beside the module and imported by nothing (so not bundled), reading the files from git at the commit (`node bio-plane/src/interface-assets/generate.mjs`). A later `ASSETS_COMMIT` is carried only by a later requirement (R1): change `COMMIT` there and rerun.
- `bio-plane/test/m/interface-assets/assets.test.mjs`: R1–R4, each with a negative control. R1 states the expected map from git independently of the generator and compares every entry byte for byte; R2 scans every entry (faces decoded) for `url()`, `@import`, `href`, `xlink:href` and `src`; R3 attempts every write; R4 loads the module in a fresh process with a resolve hook and fs, clock, timer, fetch and randomness traps, and finds nothing touched and only the two exports.

**Files to add to `modules.json` (K1043):** paths `bio-plane/src/interface-assets/` (both files above); tests `bio-plane/test/m/interface-assets/`.

**Deferred:** none.

**Found elsewhere:** none. No generated artifact is stale: nothing imports the module yet (`control-plane` R75 will, which will take the plane bundle up by about 1.1 MB, as the requirements' size note expects). `main` has moved past `3f40899950` (to `8e5f57fad0`); the module stays at `3f40899950` per R1.

**Tests and checks** (with `modules.json` given this module's paths locally, not committed):
- `node --test bio-plane/test/m/interface-assets/`: tests 8, pass 8, fail 0.
- `format`: 159 modules, 158 requirements files; 0 failures. `architecture … interface-assets`: 3 product files, 3 relative imports (1 naming no tracked file, not judged: the R4 control's fixture text); 0 failures. `coverage … interface-assets`: 4 of 4 live requirement ids named by a test; 0 failures. `ownership … interface-assets tranche/T46`: 0 failures.
- `checks/run.mjs` over the product: architecture 2970 product files, 0 failures; format 0; channels 0; coverage 15 failures, all other L11 modules' ids not yet built (interface-shell, the four screens, control-plane, installer, instance-setup, notice-producers, op-grades, setup-page, setup-words, wizard-scripts), none of this module's.

Size (session_01DGngQktvGFPxRhvzigguEP): test runs 4, module lines 286

## J1 · COMPLETE

T46-53 applied: R1–R4 met and tested (8 pass, 0 fail; format, architecture, coverage, ownership 0 failures for this module). Add to modules.json: paths ["bio-plane/src/interface-assets/"] (index.mjs, generated; generate.mjs, its generator, not imported), tests ["bio-plane/test/m/interface-assets/"] (assets.test.mjs). No stale artifact; nothing deferred; nothing found in another module. Details in my record.
