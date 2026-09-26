# T2 · test-support — job record

**Session** · `session_01ASkdafQGFCeqoncTyWGLPC` (TEST-SUPPORT #1).

**Status** · COMPLETE, 2026-09-26. Job for module `test-support`, tranche T2, branch `job/T2/test-support`, built on `origin/tranche/T2` @ 79e6ccd829 (merged at start; it changed only plan files). No open question; one reading taken, below.

## Entries applied

- **T2-2** · Requirement-named tests for every live id. `bio-plane/test/m/test-support/test-support.test.mjs` (22 tests) names R1–R9, each in a test title. Every test runs a child node process that imports the module with `$TMPDIR` pointed at a fresh host directory, and checks the host directory, the child's report and its streams from outside: the interface is the process's side effects, so nothing reads the module's source.
  - R1: one directory directly under the host temp directory, the pid in its name, `$TMPDIR` and `os.tmpdir()` inside it at import and later in the process, a nested `$TMPDIR` nests.
  - R2: removed, contents and all, for each of nine endings (normal end, `process.exit()` with and without codes, `exitCode`, uncaught error now and in a later tick, unhandled rejection, exit from a timer); gone the moment the parent sees the child exit; 40 endings racing an unawaited `fs.promises.rm` of two miniflare-shaped trees.
  - R3: static, dynamic, through another module, after `stdio.mjs`, and by a non-normalized URL: one directory, removed, nothing on stderr.
  - R4: absolute, a directory, the one R1 created (also in the test process itself).
  - R5: gone at once, host empty, repeat calls never throw and return nothing, and every ending above still exits with its own status; no throw when the directory was already removed or replaced by a file.
  - R6/R8: 2–4 MB floods on stdout and stderr through a slowly-read pipe, chunk sizes 1 KiB, 4 KiB and 65,580 B (the measured darwin threshold), every byte and the final tally arrive; the import alone applied it to both streams.
  - R7: repeated calls return `already: true` and the same streams, a caller mutating a result changes nothing; stdout or stderr to a file, both to a file, and both ignored are no error, and `streams` names only the pipes changed.
  - R9: for every ending and for a sweep, a host holding neighbours (another live pid's sandbox, a dead pid's, a `-swept` lookalike, a miniflare directory, plain files) and its parent are byte-for-byte unchanged afterwards; during the process only the sandbox was added; nothing in the working directory.

## Reading taken (for BOB; no change made)

- **R9 and the sweep's rename.** At exit the sweep renames the sandbox to `<SANDBOX>-swept` beside it, then removes it (the 2026-09-23 race fix). For that instant a name exists outside `SANDBOX`'s path. My reading: it is the same directory moved, not something else created, so R9 holds, and the tests check R9 as "nothing outside is left created or removed, and nothing else is added while the process runs". If BOB reads R9 more strictly, the fix is to nest `$TMPDIR` one level inside the created directory and rename within it; that changes where `battery.mjs` (legacy-tests) finds leaked `miniflare-*` directories, so it is not done unasked.

## Flaws and improvements (step 4)

- No flaw found against R1–R9; the module's code is unchanged.
- **Deferred: read-only subdirectories.** Run as a non-root user, a subdirectory a test left without write permission makes `rmSync` fail with EACCES, and the sandbox leaks against R2. The fix (make the tree writable, then retry) is small, but this container runs as root, where the failure cannot occur and a test cannot show the fix; switching the child's uid was refused here. For a job or CI that runs as non-root (GitHub's runner does).
- **Noted, not in the requirements:** after `sweepSandbox()` the process's `$TMPDIR` still names the removed directory, so a later `mkdtemp(tmpdir())` in that process fails. No requirement says what a swept process may still do; left as is.

## Limits of the tests (stated, not deferred)

- **R6/R8 on Linux.** Node's writes to a pipe are already synchronous on Linux, so the flood tests cannot fail here whatever the module does; they discriminate on darwin, where the defect was measured. What does discriminate on Linux is `streams`: it is `[]` unless the module applied the change.
- **R2's race.** With the sweep's rename removed (a copy of the module in the scratchpad), 180 racing endings in three tree shapes leaked 0 on this machine, so the race test did not reproduce the 2026-09-23 leak here; it stays as the regression check the runner that did leak would fail.

## Found in other modules

None.

## Tests and checks run

- `node --test bio-plane/test/m/test-support/` — `tests 22, pass 22, fail 0` (3 runs; the first failed one arithmetic slip in a test's expected byte count).
- Layer tests: none named in `build/manifest.md`. No provided service changed, so no users' tests to run.
- `node checks/format.mjs` — `format: 61 modules, 19 requirements files; 0 failures`
- `node checks/architecture.mjs … test-support` — `architecture: 2 product files, 1 relative imports (0 naming no tracked file, not judged); 0 failures`
- `node checks/coverage.mjs … test-support` — COVERAGE_LINE
- `node checks/ownership.mjs … test-support tranche/T2` — OWNERSHIP_LINE
