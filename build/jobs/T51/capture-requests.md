# capture-requests (T51)

**Status** · session_01Qs8rZ8r9tU9hSh4VTyESSo · depth 2 · WORKING · handled B1

## Completion (T51-59 · red #27, N1243)

**Entry applied.** T51-59: `bio-plane/test/m/capture-requests/plane.test.mjs`, the R48 (T50) test, its ghost arm.

**Diagnosis (no source fault).** The test's ghost arm sent `acquire` with `for: "INQ-2026-9999-none"`, a question no inquiry answers to. Control-plane R105 (T50, `build/requirements/control-plane.md`) refuses such a `for` at the door as acquisition's `BAD_FOR` (C-139.21) before any fetch, so `holdAcquired` failed on its first assertion. The reader itself (`capturedFor`, R48) answers that case as the spec states, and the unit test `t50.test.mjs` (R48, "a question not held") asserts it.

**Change.** The ghost arm now asserts what the plane does: `acquire` answers `ok: false, code: BAD_FOR, check: C-139.21`, and no fetch is made for the ghost address. The test's title is amended to say so. Nothing else in the test changed; the control arm (no `for`, no request) is unchanged.

**Decision for Bob to file in `build/rulings.md` (lower-level, recorded here per JOB rule 1).** The plane cannot reach the reader's withheld branch through `acquire`, because R105 requires the question visible at acquire time. Reaching it at plane level would need a question a viewer loses sight of after acquisition, which means a hidden-project fixture (project creation, owner claim, visibility) that this test does not build. I chose the R105 assertion over that fixture. The withheld branch stays covered at unit level.

**Deferred.** None.

**Found in another module.** None from my reading of this module's code and tests.

**Reading.** Read whole: the module's requirements (public and private parts), this job's entry, `build/layers.md`, `bio-plane/src/capture-requests/index.mjs` (1,943 lines, in six reads), `checks.mjs`, `schema.mjs`, the R48 section of `plane.test.mjs`, and `t50.test.mjs`. For the services the entry touches, I read R105's text and acquisition R47's summary from the T50 job record, but not capture R83/R94 whole. I ran the module's other test files without reading them.

**Tests and checks.**
- `plane.test.mjs`: 7 of 7 pass (before the change, the R48 T50 test failed with `BAD_FOR`).
- All `test/m/capture-requests/*.test.mjs`: 127 of 127 pass.
- `checks/format.mjs /home/user/bio`: 0 failures.
- `checks/architecture.mjs /home/user/bio capture-requests`: 0 failures.
- `checks/coverage.mjs /home/user/bio capture-requests`: 56 of 56 live ids named, 0 failures.
- `checks/ownership.mjs /home/user/bio capture-requests tranche/T51 job/T51/capture-requests`: 0 failures (1 file changed).
- `checks/run.mjs /home/user/bio`: no capture-requests line. Its 24 failures are coverage gaps in other modules (for example agent-steps, interface-shell, screens-inquiry), not this one.

**Stale text noted, not changed.** The requirements' Size note says "about 1,050 lines"; the module's own code is 2,653 lines (`index.mjs` 1,943, `checks.mjs` 454, `schema.mjs` 256). The requirements file is not this job's to edit, so I report it to Bob.

**Size (session_01Qs8rZ8r9tU9hSh4VTyESSo): test runs 3, module lines 2653.**
