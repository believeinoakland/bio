# capture (T31)

**Status** · session_01A4QQEgEAz3S4VbtQrGS5L3 · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied** (plan T31 L3, capture): N538, the `who` text. A pulled knock's provenance document (`#pulledDocument`, `src/capture/index.mjs` ~847) names its first hop `instance <name> (Civicsmith/<version>)` (`acquisition` R16 as folded by K1367, DEC-124; R65's document is `acquisition` R16's). A knock pulled before T31 keeps its `who` as written: a repeat pull answers the stored `pulled_document` unchanged, and nothing re-words it. No requirement of this module changed (none carries a T31 mark); every requirement stays met.

**Tests.** `test/m/capture/knocker.test.mjs`: the R65 pull test's `who` assertion now reads Civicsmith; a new test "R65 (acquisition R16, DEC-124)" checks the named and unnamed instance (`instance unnamed (Civicsmith/0.0.0)`), that a new pull's document carries the old name nowhere, and that a pre-T31 pull's stored document (who `CivicOS/…`) is answered again whole, as written. Negative control: the old string restored in the code fails both tests by name (21 pass, 2 fail); restored, 23 pass.

**Deferred.** None.

**Found in other modules** (REPORT J1):
- `acquisition`: its own first-hop `who` (`src/acquisition/index.mjs:1085`) is acquisition's T31 entry (R16), not yet pushed when this job ran. Capture's and acquisition's `who` each spell `instance … (Civicsmith/…)` on their own; acquisition R24 makes `civicsmithUserAgent` the one spelling of the user agent, but no requirement names one spelling of the hop's `who`. An improvement for BOB to weigh: acquisition could provide the hop's `who` (or the product name) once, for capture R65's pull to read, so a later rename touches one site. Not a flaw: both meet their requirements as written.
- No other module's test pins capture's pulled-knock `who` (the remaining `CivicOS/` strings in `host-governor`, `provenance` and `capture-requests` tests are fixed samples). Capture feeds no generated artifact (manifest §14), so nothing is made stale.

**Reading.** Read whole: `build/requirements/capture.md`, the layer-3 contract, every file under the module's `paths` and `tests`, the plan's T31 entries, rulings K1361–K1370 as they bear on N538, the draft `plan/draft-T31-n538.md`'s capture lines, and the public parts of `acquisition`, `provenance`, `attestation` and `signatures`. The public parts of the other twelve modules in `uses` were not read: the change is one string inside this module's own document, it calls no service of theirs, and reading them would have taken about a fifth of this session's window for nothing the entry touches.

**Tests and checks run** (on `job/T31/capture` with `tranche/T31` @ 4f0805894a merged):
- `node --test test/m/capture/`: tests 118, pass 118, fail 0, skipped 0.
- `node test/cap13-reuse-pages.test.mjs`: 22 pass, 0 fail. `node test/d57selflink.test.mjs`: 24 pass, 0 fail.
- Layer tests: none (`build/manifest.md`). No provided service changed.
- `checks/format.mjs`: 98 modules, 97 requirements files; 0 failures.
- `checks/architecture.mjs … capture`: 23 product files, 97 relative imports; 0 failures.
- `checks/coverage.mjs … capture`: 55 of 55 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs … capture tranche/T31`: 3 files changed by capture; 0 failures.

Size (session_01A4QQEgEAz3S4VbtQrGS5L3): test runs 5, module lines 3457

## J1 · REPORT

acquisition (improvement, not a flaw): capture's pulled-knock who and acquisition's first-hop who (src/acquisition/index.mjs:1085, acquisition's own T31 R16 entry) each spell 'instance … (Civicsmith/…)' themselves; acquisition R24 makes civicsmithUserAgent the one spelling of the user agent, but no requirement names one spelling of the hop's who. If BOB wants a later rename to touch one site, acquisition could provide the who (or the product name) once for capture R65 to read. Both meet their requirements as written. Details in my record.

## J2 · COMPLETE

N538 applied: a pulled knock's who reads 'instance <name> (Civicsmith/<version>)'; a pre-T31 pull answers its stored document as written. knocker.test.mjs: the R65 assertion updated and one new R65 test (negative control: 21/2 with the old string, 23/0 restored). test/m/capture 118/118; cap13 22/0; d57selflink 24/0; format, architecture, coverage (55/55), ownership: 0 failures each. Nothing deferred; one REPORT (J1). Public parts of 12 of 16 used modules not read (reason in the record). Size: test runs 5, module lines 3457.
