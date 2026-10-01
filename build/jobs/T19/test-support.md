# test-support (T19)

**Status** · session_01RpWW8ZkFD9dYQi6UAZ9QQ4 · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied.** Plan layer 1, test-support (N22): R2's read-only case. `sweepSandbox()` now catches a removal refused with `EACCES`, gives the owner full access to every directory in the moved tree (parents first, so a mode-000 directory can then be listed; `lstat`, so a link is never followed and nothing outside changes mode, R9), and the next of its five passes retries. Files are left alone (unlinking needs only the directory writable). Old suites untouched (K619).

**Tests added** (`bio-plane/test/m/test-support/test-support.test.mjs`):
- R2, non-root: every ending, the child run as uid/gid 65534 through `setpriv` (or as this process's own user when not root), leaving read-only and mode-000 directories at several depths, a read-only file and the sandbox itself read-only; the child first shows a plain `rmSync` is refused `EACCES`, so the condition is real. A dropped child cannot traverse the test's 0700 sandbox, so it starts in its host directory with `$TMPDIR=/proc/self/cwd`.
- R2, interface: every ending, `fs.rmSync` replaced as the module sees it (`syncBuiltinESMExports`) by one refusing `EACCES` while any directory in the tree lacks owner access; asserts the sweep met at least one refusal and still removed the sandbox before exit.
- R9: the make-writable walk never follows a link out of the sandbox (linked outside directories keep mode 0500 and contents).
- Reproduced first: both R2 tests fail on the old `sandbox.mjs` ("nothing is left under the host temp directory"). Mutation: following links (`statSync`) fails the R9 test.

**Requirements file.** BOB's START asked me to strike R2's "not yet met: N22" mark; `build/requirements/test-support.md` is outside my paths (ownership check failed when I did), so I left it: **BOB to strike it**, R2 is met.

**Deferred.** None.

**Found in other modules.** None.

**Tests and checks run.**
- `node --test bio-plane/test/m/test-support/`: tests 25, pass 25, fail 0 (no layer tests named in the manifest).
- `format`: 83 modules, 78 requirements files; 0 failures · `architecture`: 4 product files, 2 relative imports; 0 failures · `coverage`: 9 of 9 live requirement ids named by a test; 0 failures · `ownership` vs `tranche/T19`: 3 files; 0 failures.

Size (session_01RpWW8ZkFD9dYQi6UAZ9QQ4): test runs 5, module lines 368

## J1 · COMPLETE

N22 applied: the sweep makes a read-only tree writable on EACCES (lstat walk, never follows links) and retries; R2 met. Tests 25/25; format, architecture, coverage (9/9), ownership: 0 failures. Please strike R2's 'not yet met: N22' mark in build/requirements/test-support.md (outside my paths). Details in my record's Completion section.
