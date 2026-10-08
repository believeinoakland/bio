# wizard-scripts (T36)

**Status** · session_01DgEsmmCjq3gqEZbkp73JGo · depth 2 · RUNNING until 2026-10-08T06:05:49Z (worker reading the module for the T36-52 summary) · handled B0

## Completion (WIZARD-SCRIPTS #5)

**Entry applied.** T36-52 (N722, its share; DEC-171; K2130), R13's T36 sentence:
- `SCREEN_REGISTRY` was re-taken with `build-data.mjs`, never by hand, from `docs/development/ux-substrate/screens/registry.json` at `36da334628` (PR #13's merge). The file there is byte-identical to `main` @ `0ced0143a8` and to `tranche/T36`.
- `SCREEN_REGISTRY_SOURCE` names `36da334628`. There are 47 screens (42 before), and `connect` is "The assistant".
- The vendored test copy `test/m/wizard-scripts/source/registry.json` is the same file.
- `build-data.mjs` now takes each file's own commit: `<registry.json> <registry-commit> <library.json> <library-commit>`. It was run with the library at `d129238bf3`, and `civicsmith-library.mjs` came out byte-identical. `CIVICSMITH_LIBRARY` and `CIVICSMITH_LIBRARY_SOURCE` are unchanged (R22).

**Flaw fixed in my module.**
- PR #13's file has owed acts that a BOB ruling owes, written `owed:<op> Kn` (for example `securitymap K1875` and `securitytooladd K1929`). `OWED_ACT` (`data.mjs`) accepted only `DEC-n`, so these acts would have been dropped silently.
- It now accepts `DEC-n` or `Kn`, and they register once their op is declared, as R13 says. A test names this.
- I also corrected a stale comment in `writing-help.mjs` (`testify` is on the capture and calculation screens).

**Reading set.** BOB's measure was 345 KB, over the 300 KB limit, so I followed START's rule (3):
- I read whole: my requirements, layer 11's row of `build/layers.md`, and the code and tests the entry changes (`build-data.mjs`, `data.mjs`, both generated files, `library.test.mjs`, `registry.test.mjs`).
- I did not read the used services' public parts: the entry uses no service.
- A worker read the rest of the code and tests whole: 3,687 lines across `index.mjs`, `checks.mjs`, `schema.mjs`, `writing-help.mjs`, `front-doors.mjs`, `fixture.mjs` and ten test files. Its summary is about 2,000 words, and each statement cites file:line.
- What mattered in the summary:
  - Nothing reads a screen's `name`, `purpose` or `dec`.
  - No test outside `library.test.mjs` hard-codes the real registry.
  - A screen with no acts (`help`) registers harmlessly.
- What it left out did not matter to this entry.

**Found in other modules (REPORT J2).**
1. PR #13's registry still marks `assistantset` `declared` on `setup`, and "Set up and claim" (required) has step 11 on it.
   - Today `OPS` holds `assistantset`, so `requiredFailures` is `[]` and `test/m/plane/release.test.mjs` passes 5/5.
   - With `assistantset` removed from the op table (T36-35), R12 answers `WIZARD_ACT_UNKNOWN` at step 11 ("the screen 'setup' offers no act 'assistantset'"). So R14 names "Set up and claim", and the plane's release test goes red once op-declarations' T36-35 merges.
   - I edited no design file. The fix is the design file's and the library's, through Bob's approval of a new version (R22), or a BOB ruling.
2. `registeredScreens` and `wizardRegistry` list every `declared` act. `checkScript` refuses a declared act that the op table lacks (`index.mjs`:187, 273). So, after T36-35, `assistantset` shows in affordances' no-target answer and in R21's form while `wizardcheck` refuses it. This is my module's behaviour as R13 words it ("as `acts` the op of each act the file marks `declared`"), so I left it as worded: BOB's call.
3. Generated artifact: `bio-plane/dist/bio-plane.bundled.mjs` is stale (it carries `screen-registry.mjs`). That is BOB's to regenerate at layer close.

**Tests and checks.**
- `node --test bio-plane/test/m/wizard-scripts/`: pass 65, fail 0.
- Users' tests, with and without the change, have identical red sets, all inherited (rule 5):
  - affordances: 206 pass, 2 fail.
  - queue-producers: 80 pass, 0 fail.
  - instance-setup: 108 pass, 0 fail.
  - op-declarations: 90 pass, 3 fail.
  - answer-envelope: 24 pass, 2 fail.
  - store-door: 36 pass, 0 fail.
  - control-plane: 163 pass, 4 fail.
  - plane: 128 pass, 2 fail (release.test.mjs 5/5).
  - answers: 44 pass, 0 fail.
- Layer tests: none named in the manifest.
- `format`: 0 failures (135 modules). `architecture`: 0 failures. `coverage`: 27 of 27 ids named, 0 failures. `ownership` vs `tranche/T36`: 0 failures.

**Deferred:** nothing.

**P6:** 2,195 lines of code, plus 86 generated lines. Well under 4,000.

Size (session_01DgEsmmCjq3gqEZbkp73JGo): test runs 9, module lines 2195
