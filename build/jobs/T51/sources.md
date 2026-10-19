# sources (T51)

**Status** · session_01WG9setBbZFc6ABChv97kKy · depth 2 · WORKING · handled B1

## Entries applied

- **T51-186 · sources** (W, words, K3949; K3962): the 3 findings `build/plan/words-pass/sources.md` left, and its 2 test copies of code sentences, each fixed by the words rule.
  - `invariants.test.mjs` (the op list, was line 105): the hand-listed op names are now the module's own declaration, `SOURCES_OP_NAMES`, exported from `src/sources/index.mjs` beside `sourcesOps` (the keys the router answers). The test asserts the router's keys equal that declaration.
  - `keyed.test.mjs` (the op list, was line 145): the "no bulk path" check now takes the other ops from `SOURCES_OP_NAMES`, so the only op outside them is `sourcekeyed`.
  - `disclose.test.mjs` (line 119): the hand-written "not confirmed by the team" sentence is now `claimSentence(...)`, the module's own reading of `sources.named_confirmed_group`. The same literal at lines 113 and 126 (and 119's template twin) is now the same reading, so no copy of the sentence remains in the test.
  - `invariants.test.mjs` (lines 80 and 81; the two `C-121.6` and `C-121.7` translations): compared with `localize(id, en)` under the module's own ids `sources.checks.that_secret_was_not_recognised` and `sources.checks.only_a_member_acting_for`, not as bare copies.
- No requirement text changed. No requirement id added or removed. `sources` R1 to R20 are unchanged in meaning.

## Deferred

None.

## Found in another module, or in a requirement

- **R3's quoted claim sentence differs from the word table.** `build/requirements/sources.md` R3 reads "not confirmed by the group". The design's word row `sources.named_confirmed_group` (`docs/development/ux-substrate/screens/words.json`) reads "not confirmed by the team", and the code reads that row. The module follows the row, as the words rule requires. Requirement text is BOB's to fold; BOB decides whether R3 quotes "team" or "group", and the row is the design stream's to change. Reporting to BOB as a REPORT.

## Tests and checks run

- `node --test bio-plane/test/m/sources/`: 38 tests, 38 pass, 0 fail (after the change).
- `node checks/words.mjs /home/user/bio sources`: 0 failures for `sources` (before the change: 5 failures; 3 testcopy, 2 handlist).
- `node checks/format.mjs /home/user/bio`: 175 modules, 174 requirements files; 0 failures.
- `node checks/architecture.mjs /home/user/bio sources`: 13 product files, 39 relative imports; 0 failures.
- `node checks/coverage.mjs /home/user/bio sources`: 20 of 20 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs /home/user/bio sources tranche/T51 job/T51/sources`: 1 file changed by sources; 0 failures.
- `node bio-plane/src/setup-words/build.mjs --check`: rows.mjs and words-unreviewed.json match words.json and the source.
- `node checks/run.mjs /home/user/bio`: format 0 failures; architecture 0 failures; no finding names the `sources` module in the words output or the coverage output. The run's red is in other modules (words: 4,122 findings across the product, mostly other modules' open work; coverage: 30 failures, none in `sources`). Not mine to change.

Size (session_014Mxhs1WG5npAbZAfSdGnLi): test runs 1, module lines 1080

## J1 · REPORT

sources R3 quotes the claim sentence as "not confirmed by the group"; the word row sources.named_confirmed_group (words.json, the design stream's) reads "not confirmed by the team", and the module reads that row through claimSentence. Not changed: requirement text is yours to fold, and the row is the design stream's. Which wording stands is yours to decide. Details in build/jobs/T51/sources.md.

## J2 · COMPLETE

T51-186 sources done (K3949, K3962): the 3 words findings and the 2 test copies fixed, commit bd3a368490 on job/T51/sources. Tests: sources 38/38 pass. Checks: format, architecture, coverage, ownership and setup-words clean; the words check reads zero for sources. Record: build/jobs/T51/sources.md. No requirement changed; one REPORT (R3 wording).
