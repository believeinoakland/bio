# test-support (T51)

**Status** · session_0191CQmcSf7uN8VoqE7fDryB · depth 2 · COMPLETE · handled B3

## J1 · COMPLETE

T51-3 · test-support: applied. Red #10 (R2, `test-support.test.mjs` "a tree a test left read-only is removed") is green.

**Entries applied.** T51-3 (the only entry). Commit b33a4083fc on job/T51/test-support.

**Diagnosis.** On this host the test passes as uid 0 under a 0700 TMPDIR, as the one-line TMPDIR=/root 0700 probe also shows, and as uid 65534 for the non-root case itself. The red's environment is therefore a root that cannot make a child that is not root: the case runs `setpriv`, chowns the host directory to 65534, and drops to 65534, and any of those failing made the test fail rather than prove nothing. `sandbox.mjs` is not at fault (the EACCES retry and the sweep both behave under the injected refusal).

**Change.** A probe, `DROP`, runs once: as root it checks that `setpriv` runs, that the directory owner can be changed, and that the drop to 65534 gives uid 65534. The R2 non-root test skips by name with that reason when the probe fails, and otherwise runs the same assertions as before. Verified: with `setpriv` removed from PATH the case is reported as skipped with "setpriv cannot be run (ENOENT)"; as root with the probe passing, all 25 tests pass.

**Deferred.** None.

**Found in another module (not mine; not changed).** `checks/run.mjs` on bio reports coverage failures in three modules: agent-harness (R17 named by no test), agent-runner (R36, R37, R38, R40 named by no test), journey-check (R19 named by no test). Described against those modules' requirements; the owners need them, not test-support.

**Found in my own module, noted, not fixed (environment).** Run as uid 65534 with NODE_EXTRA_CA_CERTS inherited from the proxy (/root/.ccr/ca-bundle.crt, unreadable to 65534), R3 fails ("nothing thrown or warned": node prints the extra-certs warning on the child's stderr) and R6 fails by exactly that warning's 125 bytes on the pipe count. Both pass as root, which is the base run's uid. A fix would strip NODE_EXTRA_CA_CERTS from the children's env in the test; I did not make it, since the red is R2's alone and the change touches every child spawn. Say if you want it in this job.

**Tests and checks.**
- `node --test test/m/test-support/test-support.test.mjs` as root, before and after: 25 pass, 0 fail (after: 25 pass, 0 skipped; with setpriv removed: 24 pass, 1 skipped).
- `node --test test/m/test-support/make-zip.test.mjs`: 17 pass, 0 fail.
- `node checks/format.mjs /home/user/bio`: 174 modules, 170 requirements files; 0 failures.
- `node checks/architecture.mjs /home/user/bio test-support`: 6 product files, 4 relative imports; 0 failures.
- `node checks/coverage.mjs /home/user/bio test-support`: 14 of 14 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs /home/user/bio test-support tranche/T51 job/T51/test-support`: 1 file changed by test-support; 0 failures.
- `node checks/run.mjs /home/user/bio`: format 0, architecture 0 (3533 product files), channels 0; coverage has the three failures above, none in test-support.

Size (session_01KsgH5RfwYGuB5JXagtzuu5): test runs 6, module lines 721

## J2 · COMPLETE

CR-2 · test-support: applied. Commit b7ee6bb68f on job/T51/test-support (test files only; no module code changed).

**Entries applied.** CR-2 (the only entry).

**Change.** The child runs that R3 and R6 start are handed the environment without NODE_EXTRA_CA_CERTS (`childEnv()`, used by `child()` and by R6's flood spawn). A new test, named R3 and R6, sets the variable to an unreadable path, checks the child runs silent and does not see the variable, and runs an unstripped control child that does warn, so the silence is the strip's doing. make-zip.test.mjs's R13 had the same defect in its two spawns (the non-root failure below), and is stripped the same way, so the suite is green as non-root.

**Deferred.** None. Not changed, because no assertion reads their stderr: the R2 non-root child (`childNotRoot`), the R2 exit-listener spawn, and R7's and R8's spawns.

**Found in another module (not changed).** `checks/run.mjs` on bio, run from the process repository, reports coverage failures in 33 places and words failures (2,821: 1,841 inline, 798 testcopy, 182 handlist) in other modules; none is in test-support. Named here for BOB to route.

**Tests and checks.**
- `node --test test/m/test-support/test-support.test.mjs`, as root: 26 pass, 0 fail. As uid 65534 before the change: 23 pass, 2 fail (R3 "nothing thrown or warned"; R6 byte count off by the warning's 125 bytes). As uid 65534 after: 26 pass, 0 fail.
- `node --test test/m/test-support/make-zip.test.mjs`, as root: 17 pass, 0 fail. As uid 65534 before: 16 pass, 1 fail (R13, stderr warning). After: 17 pass, 0 fail.
- `node checks/format.mjs /home/user/bio`: 174 modules, 173 requirements files; 0 failures.
- `node checks/architecture.mjs /home/user/bio test-support`: 6 product files, 6 relative imports; 0 failures.
- `node checks/coverage.mjs /home/user/bio test-support`: 14 of 14 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs /home/user/bio test-support tranche/T51 job/T51/test-support`: 2 files changed by test-support; 0 failures.
- `node checks/run.mjs /home/user/bio`: format 0, architecture 0, channels 0; coverage and words findings all in other modules (above); none in test-support.

Size (session_01EFMiVNACxY3XDRbufBuqk3): test runs 10, module lines 723

## J3 · QUESTION

R15/R16 need a new source file. modules.json lists test-support's paths as four files (sandbox.mjs, stdio.mjs, make-pdf.mjs, make-zip.mjs); none fits (sandbox.mjs is an import-for-side-effect module, R8). My best reading: I create bio-plane/test/declared-ops.mjs exporting declaredOpHolds and declaredOpsOf, and BOB adds that path to test-support's paths in build/modules.json (and regenerates member-roster order.mjs per manifest, if it applies). I carry on on this reading; the ownership check will name the file until the path is added. Extra optional keys I add to declaredOpHolds beyond the contract: values (sample value per field), outside (field names probed for check c; default one generated unknown name), same (answer equality for 'dropped'). Contract names and the four required keys are unchanged.
