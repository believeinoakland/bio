# case-import (T51)

**Status** · session_01Bph2yYGTh5kCEUU4yTWpfn · depth 2 · WORKING · handled B0

## J1 · COMPLETE

T51-80 (red #34, N1223, DEC-327, U343, K3729): done, all tests green.

**Applied.** The module reads the three refusal sub-keys the declared list names, by key, where it answers those departures:
- `refusal.IMPORT_NOT_A_CASE_FILE.noparts` when no part is given (`importCaseFile`);
- `refusal.IMPORT_NOT_A_CASE_FILE.notbytes`, with `{n}` counting the part from 1, when a part is not bytes;
- `refusal.IMPORT_NOT_A_CASE_FILE.manifest` when a manifest names no team, case or edition.
`words.mjs` holds the three keys (53 keys in all, equal to the declared list). Commit ef47088dab on job/T51/case-import.

**Test.** `words.test.mjs` appended `caseimport.stake.unreadable` to the declared list, which now names it already; the duplicate is removed. Its placeholder set gains `n` for `notbytes`. A new assertion in its R1 test checks that the noparts and notbytes departures draw the list's words.

**Deferred.** Nothing in my module. The manifest-identity departure (`refusal.IMPORT_NOT_A_CASE_FILE.manifest`) is read by key but unreachable with the real manifest check: `case-grammar` R13 refuses every missing group, case or edition first. Kept as the defensive branch it already was; no control test added for it.

**Found in another module (for BOB).** `bio-plane/dist/bio-plane.bundled.mjs` (a generated artifact, owner `bio-plane`) carries case-import's source and words, so my change stales it. Not regenerated here (manifest §14). Also `agent-worker/dist/agent-worker.bundled.mjs`, if case-import is in its input set: not checked.

**Checks.**
- `node --test test/m/case-import/*.test.mjs` in bio-plane: 126 pass, 0 fail.
- `checks/format.mjs /home/user/bio`: 174 modules, 173 requirements files, 0 failures.
- `checks/architecture.mjs /home/user/bio case-import`: 0 failures.
- `checks/coverage.mjs /home/user/bio case-import`: 26 of 26 live ids named by a test.
- `checks/ownership.mjs /home/user/bio case-import tranche/T51 job/T51/case-import`: 4 files, 0 failures.
- `checks/run.mjs /home/user/bio`: format and architecture 0 failures. Its coverage step fails 23 other modules (for example affordances R67, interface-shell R90–R101), none case-import. Not mine; not investigated.

Size (session_01Bph2yYGTh5kCEUU4yTWpfn): test runs 4, module lines 2236.
