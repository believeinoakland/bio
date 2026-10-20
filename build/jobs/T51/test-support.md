# test-support (T51)

**Status** · session_0161FtoUuJFb1r4CZvpGeae3 · depth 2 · COMPLETE · handled B4

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

## J4 · COMPLETE

FR-01 · test-support: applied (commit 1c23c02de0 on job/T51/test-support).

**Entries applied.** K4168: R15 `declaredOpHolds({op, declaration, call, refusedNaming})` and R16 `declaredOpsOf(root)`, new file `bio-plane/test/declared-ops.mjs` (111 lines; no side effect on import). Requirement lines R15, R16 written first in `build/requirements/test-support.md` (status line updated; marked met now). Optional keys beyond the contract: `values`, `outside`, `same`; the contract names and shapes are unchanged. A `Response` answer is read as `{status, ...body}` before `refusedNaming` sees it. Check (c) probes `outside` (default one generated name `undeclared_field_<op>`): the op passes if its answer equals check (a)'s or it refuses naming the field.

**NEEDS BOB before merge (the J3 QUESTION, unanswered).** `bio-plane/test/declared-ops.mjs` is in no module's `paths`: add it to test-support's `paths` in `build/modules.json` (and regenerate member-roster's `order.mjs` if that applies, manifest §14). Until then `architecture.mjs` reports it "owned by no module", and `ownership.mjs` lists it and `build/requirements/test-support.md` (the START told me to write the lines) as outside my paths: 2 failures, both of this kind.

**Deferred.** None. **Found in other modules.** Coverage failures remain in agent-harness (R17), agent-runner (R36 R37 R38 R40), installer-steps (R26 R31), journey-check (R19); none is test-support's.

**Tests and checks.**
- `node --test bio-plane/test/m/test-support/`: 61 tests, 61 pass, 0 fail, 0 skipped (18 new in `declared-ops.test.mjs`).
- `checks/coverage.mjs test-support`: 16 of 16 live ids named by a test; 0 failures.
- `checks/architecture.mjs test-support`: 7 product files; 0 failures.
- `checks/run.mjs /home/user/bio`: format 0; words 0 findings; channels 0; architecture 1 (the path above); coverage 4 modules, none mine.
- `checks/ownership.mjs`: 2 failures, the path above and the requirements file.

Size (session_0191CQmcSf7uN8VoqE7fDryB): test runs 5, module lines 111

## J5 · COMPLETE

CHANGE B4 applied (commit 7f5f85e069 on job/T51/test-support, tranche/T51 merged in first).

`declaredOpsOf` now takes a file only when it has a real export: a line-anchored `^export const DECLARED_OPS\b`, so a comment or string that only mentions the phrase (including its own source) is not imported. A file with that line that exports no object still rejects naming the file. The R16 test with two fake modules gained a file that only mentions the phrase in a comment and a string and throws if imported; it is not imported. The helper's breach messages are now direct arguments of `new Error(...)` (the words check read them as plain sentences once the path was owned).

Tests and checks: `node --test bio-plane/test/m/test-support/`: 61 pass, 0 fail, 0 skipped (R16 on this repository green). `checks/words.mjs test-support`: 0 failures. `checks/coverage.mjs test-support`: 16 of 16. `checks/architecture.mjs test-support`: 0 failures. `checks/run.mjs`: format 0, channels 0, architecture 0, words 0; coverage failures only in other modules (agent-harness, agent-runner, citation, installer-steps, journey-check, link-sweep, monitoring). `checks/ownership.mjs`: only `build/requirements/test-support.md` listed, the requirement lines the START told me to write and B4 accepted.

Size (session_0191CQmcSf7uN8VoqE7fDryB): test runs 9, module lines 112

## J6 · COMPLETE

CHANGE B5 applied (K4240). Commit 1cf205fc9c on job/T51/test-support, pushed; tranche/T51 merged in first (BOB's tranche had moved past my branch: queue R-tests, the handoff, the B5 entry's predecessors; no test-support file changed by BOB except my job record).

**Entries applied.** B5 (the only entry): R17 `registerDeclared(root, ...registrations)` in `bio-plane/test/declared-ops.mjs`.

**Change.** `registerDeclared` calls each registration once per process with every owner's declaration as `[owner, DECLARED_OPS]` pairs, in `modules.json` order, duplicates included. A registration already called (identity, kept in a WeakSet) is skipped, so a second call is a no-op for it; a new one in the same call is called. A registration's own refusal propagates and rejects the call. A call with no registrations reads nothing.

**Deviation from the wording, for BOB to note.** The entry says "from `declaredOpsOf(root)`". `declaredOpsOf` answers `{ops, owners, duplicates}` and keeps only the first owner of a duplicate op, so it cannot give every owner's full declaration. I split its file walk into an internal `pairsOf(root)` that yields the pairs; `declaredOpsOf` now builds its three parts from it and answers exactly as before (R16 unchanged, its tests unchanged and green). `registerDeclared` reads through the same `pairsOf`, so both answers read the same files by the same rule.

**Rulings for build/rulings.md (I did not edit it: outside my paths; BOB to record once).**
1. `registerDeclared` passes `pairsOf(root)`'s pairs, the same ones `declaredOpsOf` is built from; the pairs carry a duplicate op's second owner (the plane refuses it, DECLARED_OP_DUPLICATE).
2. A registration is marked called before it runs, so a refusing registration is not silently re-run by a later call; a refusal stops the rest of that call's registrations, which stay uncalled and unmarked.
3. "Once per process" is per registration function identity, not per root.

**Requirement line for BOB (R17; not written to build/requirements/test-support.md by me):**
**R17** `registerDeclared(root, ...registrations)` calls each registration function once per process with every owner's declaration as `[owner, DECLARED_OPS]` pairs (R16's collector, duplicates included, `modules.json` order); a registration already called is skipped by a later call, and a registration's refusal propagates, naming what it refused. Test tooling: only tests call it.

**Tests and checks.**
- `node --test bio-plane/test/m/test-support/`: 65 pass, 0 fail, 0 skipped (4 new R17 tests in `declared-ops.test.mjs`: each called once with every owner's pairs incl. the duplicate; a second call a no-op for the old one and a new one called; a refusal propagates naming `bar`; no registrations reads nothing).
- Before the change, `declared-ops.test.mjs`: 18 pass.
- `checks/format.mjs /home/user/bio`: 175 modules, 175 requirements files; 0 failures.
- `checks/architecture.mjs /home/user/bio test-support`: 8 product files; 0 failures.
- `checks/coverage.mjs /home/user/bio test-support`: 16 of 16 live ids named by a test; 0 failures. (R17 is not yet a live id in the requirements file; its test names it.)
- `checks/words.mjs /home/user/bio test-support`: 0 failures.
- `checks/ownership.mjs /home/user/bio test-support tranche/T51 job/T51/test-support`: 1 file changed by test-support; 0 failures. Its two files are `bio-plane/test/declared-ops.mjs` and its test.
- `checks/run.mjs /home/user/bio`: format 0, architecture 0, channels 0; words 33 failures and coverage 4 failures, none in test-support (below).
- `node_modules` installed for every tracked lockfile directory first (K4113).

**Deferred.** None.

**Found in other modules (not changed; for BOB to route).**
- coverage (checks/coverage.mjs): agent-harness R17 named by no test; agent-runner R37, R38, R40 named by no test; installer-steps R26, R31 named by no test (both stated "by design" in K4234, not met); journey-check R19 named by no test.
- words (checks/run.mjs): 33 failures in other modules, 26 testcopy and 6 missingkey (op-grades' tests t35–t49 among them), and 1 inline. None in test-support.

Size (session_0161FtoUuJFb1r4CZvpGeae3): test runs 4, module lines 136
