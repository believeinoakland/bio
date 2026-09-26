# test-support — requirements

**Status** · Written by BOB #38, 2026-09-26: a helper module, so its requirements are BOB's (K20). Layer 1. Code today: `bio-plane/test/sandbox.mjs`, `bio-plane/test/stdio.mjs`. The module's own tests do not exist yet (`bio-plane/test/m/test-support/`): R1–R9 are not yet met as tested requirements (T2 entry).

## Public

### Purpose

Gives any test process a temporary-file sandbox it owns and removes, and standard output that cannot lose a test's final tally when the process exits. A test takes both by importing the sandbox module.

### Provides

**Importing the sandbox (a side effect).**
- **R1** On import, one directory is created under the host's temporary directory, named with the process id, and the process's temporary directory (`$TMPDIR`, and so `os.tmpdir()`) points inside it for the rest of the process.
- **R2** When the process exits by any path that runs exit handlers (a normal end, `process.exit()`, an uncaught error), the directory and everything in it are removed synchronously before the process ends.
- **R3** Importing it more than once in one process creates one directory and removes it once, and never throws.

**`SANDBOX` → string.** 
- **R4** The absolute path of the directory R1 created.

**`sweepSandbox()` → void.**
- **R5** Removes the directory at once; a later exit does not fail because it is gone. Never throws.

**`synchronousStdio()` → `{streams, already}`.**
- **R6** Makes the process's standard output and standard error write synchronously where the stream allows it, so everything written before `process.exit()` reaches the reader, including through a pipe. `streams` names the streams it changed.
- **R7** A second call changes nothing and returns `already: true` with the same `streams`. A stream that cannot be changed (a file, which is already synchronous, or an absent stream) is left as it is and is no error. Never throws.
- **R8** Importing the sandbox module also applies R6.

## Private

### Uses

None.

### Invariants

- **R9** Nothing outside the sandbox directory is created or removed by this module.

### Satisfies

- `build/layers.md`, "Helper modules": the shared test sandbox the workers' tests and the old battery use.

### Suggestions

- A test of R2 spawns a child process that imports the module, writes a file, and exits through `process.exit()`, then checks the directory is gone; a test of R6 floods a pipe from a child and checks the final line arrives.
