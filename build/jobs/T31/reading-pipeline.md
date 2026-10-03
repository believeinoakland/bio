# reading-pipeline (T31)

**Status** · session_01DyVawcUA9UTeHgLqooX3Aa · depth 2 · WORKING · handled B1

## Completion

**Entries applied** (plan T31 L4, reading-pipeline): N538, the probe user-agent constant. `bio-plane/test/tier-pagewise.probe.mjs:196` now sends `Civicsmith/0.58.0 (+https://github.com/believeinoakland/bio; instance biosmoke7; acquire)` on its live `--census` arm (DEC-124; K1365, K1367; `plan/draft-T31-n538.md` L4 (b)). The string keeps acquisition R24's shape (`civicsmithUserAgent`: product/version, the contact URL, instance, purpose) and its recorded version. No requirement of this module changed (none carries a T31 mark); the probe is no `node --test` suite and no requirement names it, so no test was added; every requirement stays met.

**Deferred.** None.

**Found in other modules** (REPORT J1): acquisition R24 says every module that sends the agent reads it from `civicsmithUserAgent`; this probe sends it on `--census` from a hand-written copy, because `acquisition` is not in reading-pipeline's `uses` (`modules.json`, BOB's). An improvement for BOB to weigh, not a flaw against this module's requirements: add `acquisition` to `uses` and have the probe compose `civicsmithUserAgent(<version>, "biosmoke7", "acquire")`, so a later rename touches one site. Nothing in `reading-pipeline` feeds a generated artifact (manifest §14), so nothing is made stale.

**Reading.** Read whole: `build/requirements/reading-pipeline.md`, the layer-4 contract (`build/layers.md`), `src/reading-pipeline/index.mjs` and `readingprov.mjs`, the probe, the plan's T31 entries and roster, rulings K1361–K1370, and the draft's reading-pipeline lines. Not read whole: the module's other test files (run, not read) and the public parts of the nine modules in `uses`: the change is one string in a network probe, it calls no service of theirs, and reading them would add nothing the entry touches.

**Tests and checks run** (on `job/T31/reading-pipeline` with `tranche/T31` @ bc62e94fba merged):
- `node --test test/m/reading-pipeline/*.test.mjs`: tests 74, pass 74, fail 0.
- `node --test test/m/reading-pipeline/ test/d606-perpage-ocr.test.mjs test/tier2-wire.test.mjs test/system/pdf-worker-binding.test.mjs`: tests 77, pass 77, fail 0, skipped 0 (tier2-wire: 46 pass, 0 fail).
- `node test/tier-pagewise.probe.mjs` (the hermetic default arm): runs, BASELINE 0 pages awarded. The `--census` arm (network) was not run.
- Layer tests: none (`build/manifest.md`). No provided service changed.
- `checks/format.mjs`: 98 modules, 97 requirements files; 0 failures.
- `checks/architecture.mjs … reading-pipeline`: 20 product files, 46 relative imports; 0 failures.
- `checks/coverage.mjs … reading-pipeline`: 24 of 24 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs … reading-pipeline tranche/T31`: 1 file changed by reading-pipeline; 0 failures.

Size (session_01DyVawcUA9UTeHgLqooX3Aa): test runs 3, module lines 1327

## J1 · REPORT

acquisition (improvement, not a flaw): acquisition R24 says every module that sends the agent reads it from civicsmithUserAgent; tier-pagewise.probe.mjs sends it on --census from a hand-written copy, since acquisition is not in reading-pipeline's uses (modules.json, BOB's). If BOB adds acquisition to uses, the probe can compose civicsmithUserAgent(version, 'biosmoke7', 'acquire') so a later rename touches one site. Details in my record.
