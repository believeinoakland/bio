# test-support (T51)

**Status** · session_01EFMiVNACxY3XDRbufBuqk3 · depth 2 · COMPLETE · handled B2

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
