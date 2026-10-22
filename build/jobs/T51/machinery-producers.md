# machinery-producers (T51)

**Status** · session_01VppNH1AogWHLFTYzaoCTBZ · depth 2 · WORKING · handled B0

## J1 · COMPLETE

T51-244 · machinery-producers · words pass (K3949, K3957, K3962): done.

Applied (T51-244):
- The 11 sentences the check flagged in `bio-plane/src/machinery-producers/index.mjs` (8 plain, 3 inline) now read through `localize` with a fixed id `machinery-producers.index.<slug>`: the age and basis details of the cool-off, session, manifest, request, archive-fallback, recheck and sweep producers, and the machine-writer and archive-eligibility basis details. The wording is unchanged; the joined multi-line literals are now one literal each.
- The 5 test copies (`conditions.test.mjs` 51 and 77; `invariants.test.mjs` 197, 207, 209, 210) no longer hold a sentence. They assert a fragment under the copy length, a filled value (`HOST`, the partial capture's `tick`), `age.state` with a string detail, or equality with `word("machinery-producers.zone_undetermined")`. The line numbers in the words-pass file had drifted; I worked from the check's current list. Finding 210's continuation (words-pass 211) is covered by the same edit.
- No `words.json` row was needed; `rows.mjs` and `words-unreviewed.json` were not touched.

Deferred: none.

Found in other modules (not changed here; for BOB):
- architecture (`checks/run.mjs`): `answer-envelope/page-policy.test.mjs` imports `bio-plane/src/signpage.mjs` of control-plane, which is not earlier in the order.
- coverage (`checks/run.mjs`): 25 modules name no test for some live ids (e.g. installer-steps 36 of 36, interface-shell 14 of 100, screens-inquiry 14 of 79).
- words (tree-wide): 1081 failures; the L11 run has 1052, none naming machinery-producers. Their inline, testcopy and handlist findings are other modules'.
- setup-words `build.mjs --check`: `rows.mjs` is stale (expected; it lacks the new `machinery-producers.index.*` ids). BOB regenerates it at the layer close. No refusal names this module.

Tests and checks run:
- `node --test test/m/machinery-producers/` (bio-plane): tests 35, pass 35, fail 0 (baseline and after each change).
- `node checks/format.mjs /home/user/bio`: 176 modules, 175 requirements files; 0 failures.
- `node checks/architecture.mjs /home/user/bio machinery-producers`: 7 product files, 34 relative imports; 0 failures.
- `node checks/coverage.mjs /home/user/bio machinery-producers`: 1 modules, 15 of 15 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs /home/user/bio machinery-producers tranche/T51 job/T51/machinery-producers`: 4 files changed by machinery-producers; 0 failures.
- `node checks/words.mjs /home/user/bio machinery-producers`: 0 failures (was 16).
- `node checks/words.mjs /home/user/bio <every L11 module>`: no finding names machinery-producers.
- `node checks/run.mjs /home/user/bio`: format 0 failures; channels 0 failures; architecture, coverage and words failures only in other modules (above).

Size (session_01AQjNeHrfYEMFNuKKN2Sh1H): test runs 3, module lines 1188
