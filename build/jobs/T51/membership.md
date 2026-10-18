# membership (T51)

**Status** · session_017qPsKctYDpHHE9UBkwHN19 · depth 2 · COMPLETE · handled B0

## J1 · COMPLETE

**COMPLETE**, T51-11 · membership (commit `7fa9eb1d21` on `job/T51/membership`).

**Entries applied**
1. **N1243 / red #28**: `test/m/membership/t19-enrol-boot.test.mjs` R12 and R57 no longer copy the sentence. The reserved-id finding's `says` is read from `setup-words` by key (`membership.says.member_holds_reserved`, `membership.says.member_enrolled_under`) with `word()`, and `hasWord` confirms the key is held. The test now passes (8/8). The red came from the source sentence reading "has not been renamed" against the test's `/has NOT been renamed/`.
2. **Stale comments restated**:
   - `src/membership/index.mjs` header: requirements named as R4–R152 (was R4–R143).
   - `index.mjs` N793 note: `setup-page` marked retired at T48.
   - `index.mjs` R11 note: the setup act is `screens-entry` R6 and the group's settings `screens-settings` R18.
   - `test/members.test.mjs` line 5: the sign-in's `login()` names `credentials` now (`store.mjs` is gone).
   - `test/members.test.mjs` line 125: `civicos-ui` named as then, retired with T51-126.
   - `test/members.test.mjs` line ~494: "setup page" changed to "setup screen".
   - `test/members.test.mjs` line 444 (`civicos-ui never calls the op`) is a dated 2026-08-05 measurement and is left as recorded. Say if Bob wants it reworded anyway.

**R38 confirmation (K3824, DEC-330 A47)**: `projectOwnerArithmetic` (`op=projectownerarith`) answers the project's owner count as `live.owners`. Whether standing down is possible at that size is `live.possible`. `live.targetMayVote` answers the target's vote. All three are present in the `ownerMath` row (`src/membership/index.mjs` around 1786–1814). Nothing is missing, so no REPORT and no requirement change. For a project the viewer cannot see, the live row reads `ownerMath(0)`, as R38 states.

**Deferred**: none in this module.

**Found in other modules** (not changed; `node checks/run.mjs /home/user/bio` coverage, 6 failures, none in membership): `agent-harness` R17; `agent-runner` R36, R37, R38, R40; `capture` R96; `journey-check` R19; `project-roster` R35, R36; `promotion` R58 are each named by no test. Architecture passes everywhere (0 failures).

**Raw lines of source (M-T51-1)**: `bio-plane/src/membership/`, six files, **4,212** lines at this COMPLETE (4,211 at the draft's START measure, plus one line from the restated R4–R152 header). Per K3809 (1), the split is T52's.

**Checks**, from the process repository:
- `format.mjs /home/user/bio` (all): 0 failures.
- `architecture.mjs /home/user/bio membership`: 0 failures.
- `coverage.mjs /home/user/bio membership`: 112 of 112 live ids named; 0 failures.
- `ownership.mjs /home/user/bio membership tranche/T51 job/T51/membership`: 0 failures (4 files changed by membership, all in its paths or its record).
- `run.mjs /home/user/bio`: architecture 0 failures; coverage 6 failures, all in other modules (listed above); channels 0 failures.

**Tests**: `node --test test/m/membership/*.test.mjs test/members.test.mjs` from `bio-plane/`: 267 pass, 0 fail (`module-order` and `t9-notice-sight-bounds` pass). `t19-enrol-boot.test.mjs` alone: 8 pass.

Commit note: the Co-Authored-By line is omitted. The session prompt says no model identifier goes in commit messages.

Size (session_017qPsKctYDpHHE9UBkwHN19): test runs 3, module lines 4212
