# credentials (T51)

**Status** · session_01MVQ8cwXNydHkeU6mxmzKQs · depth 2 · WORKING · handled B0

## J1 · COMPLETE

Applied B1 (T51-14, BOB's note 1): the stale comment at `bio-plane/src/credentials/index.mjs` line 296, above `bootstrapState` (R2), restated for the code as it is. It named "the setup page", which no longer exists (K3177), and narrated the retired `roles` answer. It now names the setup screen (`screens-entry` R18) and says the answer names no roster. No code changed. Commit d5cbbac548 on `job/T51/credentials`.

Other stale mentions of the old interface in the module: none found (searched `src/credentials/` and `test/m/credentials/` for setup page / setup screen / setup-page). The `setup-token` in `test/m/credentials/fixture.mjs` is the Claude Code CLI command, not the old interface; left as is.

Deferred: nothing.

Found in other modules (not changed here): the whole-repo run of `checks/run.mjs /home/user/bio` reports coverage failures in agent-harness (R17 named by no test), agent-runner (R36, R37, R38, R40), capture (R96), journey-check (R19), project-roster (R35, R36) and promotion (R58). Not this module's ids; reported for BOB's reading.

Tests and checks:
- `node --test "test/m/credentials/*.test.mjs"` (bio-plane): tests 160, pass 160, fail 0.
- `node checks/run.mjs /home/user/bio`: format 0 failures; architecture 0 failures (3535 product files); coverage 170 modules, 5853 of 5863 ids named (the six failures above, none in credentials); channels 0 failures.
- `node checks/format.mjs /home/user/bio`: 0 failures.
- `node checks/architecture.mjs /home/user/bio credentials`: 28 product files, 0 failures.
- `node checks/coverage.mjs /home/user/bio credentials`: 55 of 55 live requirement ids named by a test, 0 failures.
- `node checks/ownership.mjs /home/user/bio credentials tranche/T51 job/T51/credentials`: 1 file changed, 0 failures.

Size (session_01A5kq8RgUB5bhTnBnJ5oEtC): test runs 1, module lines 2728
