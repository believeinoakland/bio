# case-authoring (T51)

**Status** · session_01G31x27GuFV84fTJFmbxZNa · depth 2 · WORKING · handled B1

## Completion record (T51, B1 START)

**Entries applied.** R61's tests (`bio-plane/test/m/case-authoring/standards.test.mjs`, the two R61 tests named at :96 and :140 and the one at :140's neighbour) expected the refusals as `case-checker` R21 names them, without `says`. `case-checker` R26 now gives each departure `says: {key, vars}` (`refusal.<code>`, the departure's own fields). Test-only change: a helper `saidOf` asserts each `says` (key, and vars equal to the departure's fields), removes it, and compares the identifiers as before. The module's source relays `standardsUse.refusals` verbatim (`index.mjs` 1189), so `says` reaches the record and the pre-flight unchanged; no source change was needed for the reds.

**Deferred, and why.** None of the job's own code was changed.

**Found, not changed (for BOB).** `standardsUseWords` (`bio-plane/src/case-authoring/index.mjs` 197–207) draws R61's sentence as inline English keyed by code, beside `says`. R26 intends the ceremony to draw each gate from `word(says.key, says.vars)`. This module is layer 8 and `setup-words` is layer 11, so the words cannot be read here (P4); the test cannot import `setup-words` either (architecture check, undeclared use). The clean path is for the layer-11 screen that draws the pre-flight to read `says`. The sentence's naming of the finding and standard then needs word rows with placeholders, which are the UX stream's to write. Decision for BOB: keep the inline sentence until the screen lands (my recommendation), or ring the UX stream now.

**Found in other modules (not mine, reported).** `checks/run.mjs` shows 23 coverage failures in other modules (for example `installer`, `interface-shell`, `screens-inquiry`, `queue`); none is case-authoring. Architecture across all 3,575 product files: 0 failures.

**Tests and checks.**
- `node --test` over all 30 files of `bio-plane/test/m/case-authoring/`: 190 of 190 pass (after the R61 edit).
- `standards.test.mjs`: 7 of 7 pass; the two previously red R61 tests now pass.
- `node checks/format.mjs /home/user/bio`: 174 modules, 0 failures.
- `node checks/architecture.mjs /home/user/bio case-authoring`: 0 failures.
- `node checks/coverage.mjs /home/user/bio case-authoring`: 48 of 48 live ids named by a test; 0 failures.
- `node checks/ownership.mjs` (run before COMPLETE on the final commit): see the COMPLETE body.
- `node checks/run.mjs /home/user/bio`: format 0, architecture 0, channels 0; coverage 23 failures, all in modules other than case-authoring.

**Size (session_01G31x27GuFV84fTJFmbxZNa): test runs 7, module lines 3008** (`bio-plane/src/case-authoring/*.mjs`, all lines; this job changed no source).
