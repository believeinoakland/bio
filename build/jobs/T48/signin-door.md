# signin-door (T48)

**Status** · session_01LjaUgcDfFDSvmRLinTonZ5 · depth 2 · WORKING · handled B0

## Completion

**Read (whole):** `build/requirements/signin-door.md`; plan entry T48-67; `build/layers.md` row for layer 11; `src/signin-door/index.mjs`, `ops.mjs`; `test/m/signin-door/door.test.mjs`, `ops.test.mjs` (every test names a requirement the entry touches). Requirements of `ai-accounts` read only at R2, R7, R18, R19, R23, R27 (the citations' targets).

**Entry applied (T48-67):** citations of `credentials` R35, R43, R64, R70 and R16's sign-in clause re-pointed to `ai-accounts` R7, R18, R23, R19, R27 in the code comments (`index.mjs`, `ops.mjs`) and the test titles (`door.test.mjs`, `ops.test.mjs`). Wording only; no behaviour changed. The calls still go through `credentials`' delegates (`credentials` R72), as the requirements' Uses says, so the comments say so.

**Deferred:** `build/modules.json` edge `signin-door → ai-accounts` (requirements: "once its code imports it"): the code does not import it yet, so none is added; the file is BOB's.

**Found in other modules:** none. The inherited coverage reds (22 modules, none signin-door) are the plan's rule 5.

**Ran:** `node --test bio-plane/test/m/signin-door/`: 15 pass, 0 fail. format 0 failures; architecture (signin-door) 4 product files, 0 failures; coverage (signin-door) 5 of 5 live ids named; ownership 1 module's files changed, 0 failures; `checks/run.mjs`: architecture 0 failures, format 0, channels 0, coverage 22 failures in other modules only.

Size (session_01LjaUgcDfFDSvmRLinTonZ5): test runs 1, module lines 275+61
