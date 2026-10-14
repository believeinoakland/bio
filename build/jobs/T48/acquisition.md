# acquisition (T48)

**Status** · session_01SP5b3QVofcumu9NEJFCqpN · depth 2 · RUNNING until 2026-10-14T11:45:13Z (acquisition suite 51 runs, 3 concurrent) · handled B0

## Completion

**Read, whole (mechanics §17):**
- Read myself: `build/requirements/acquisition.md` (public and private parts); my code (`index.mjs`, `unpack.mjs`, `checks.mjs`, `keyed.mjs`); layer 3's row in `build/layers.md`; my entry T48-15 and the plan's rules at the opening.
- Read by a helper in this session, whole, with a digest citing each file and section: the measured set was 1035 KB, over the limit. The helper read every file under `bio-plane/test/m/acquisition/` (fixture and 19 test files) and the Purpose and Provides of the 16 modules in my Uses. The sources stay binding. Every flaw the digest named is dealt with below or listed as deferred.

**Cause (N998).** A capture's document carries several separate readings of the wall clock, to the second:
- `retrieved`, read once at `index.mjs`:704;
- each attestation attempt's own instant, which `attestation.attest` reads with its own clock at every attempt.

R2/R27's comparison of two captures blanked out only `retrieved`. Whenever an attempt's instant fell in a different second from the other capture's, the documents differed. That happens more often under CPU load, which is why the flake showed in the regression's module step and beside a concurrent suite.

The module is right: an attempt's instant is a true, later moment (R20). The flaw was in the test. I showed the cause by forcing it: with a clock that moves 300 ms per read, the old test fails every run, and the old R13 test (same pattern) fails too.

**Entry applied, T48-15:**
- R2/R27's two captures, and R13's, now run with the clock pinned to one instant: node:test `mock.timers` for `Date` only, so timers stay real; reset in `finally`. The comparison is now exact (`JSON.stringify` equality), with nothing blanked out. That is stricter than before, never looser. R2's check that `retrieved` is the instance's own clock is now an exact equality (it was "not the caller's"). Both tests pass under the forced clock.
- The same flaw, found in the reading and fixed:
  - R11's test compared two captures blanking only `retrieved`, the chain and `profile.at`. `authority_basis` (which carries `retrieved`) and the attempts' instants were left in. It is now pinned and the comparison is exact.
  - **A module flaw (R40), in `unpack.mjs`.** `unpack` read the clock twice: once for the instant it records, and once more for the UTC day it charges against the daily budget. A run crossing midnight UTC charged its cuts to a day other than the one their documents state. The day is now taken from the one recorded instant (`at.slice(0, 10)`), and `dayOf` is removed. The new test "R40 (N998)" in `budgets.test.mjs` uses a clock that steps an hour per read across midnight. It was red before the fix ("2026-03-05" charged against "2026-03-04" stated) and is green after.
  - Midnight-UTC races in tests that set up a day from the wall clock and then let the module read its own, now pinned:
    - `budgets.test.mjs` R40, the daily budget;
    - `archivelist.test.mjs` R41, the waiting entry;
    - `selflink-render.test.mjs` R5 R6 R21, the day's render allowance.
  - Assertions that could pass vacuously:
    - In `acquire.test.mjs`, R19's "dropped when complete" sat behind `if (complete)` and never ran, because one continuation does not finish the walk. The test now drives continuations until the walk is complete. It checks progress and that the session stays parked while anything is outstanding, then that the session is dropped.
    - In `unpack.test.mjs`, R40 R38's `if (r.body.unpack)` is now asserted.

**How I showed it gone:**
- The two tests alone: 200 runs, 0 failed.
- The whole module suite, 51 runs three at a time (each beside a concurrent suite): every run 159/159, 0 out-of-memory kills.
- After the last test changes, 21 more runs three at a time: every run 159/159.

An earlier attempt of mine, 60 suites at once on this 4-CPU, 16 GB container, made the kernel kill test processes for memory: whole files failed with no assertion. That was my stress harness, not the module. I stopped it, checked dmesg, and redid the stress at a load the machine holds.

**Deferred (each with why):**
- `checks.test.mjs`:214–231 reads source text: it counts the DEC-49 region marking `is-storage-absent`. It enforces R29's "minted at one region", a structural rule about where the row is raised that has no behavioural form. It stays, and is named here for BOB.
- Coverage that is a sample rather than full:
  - C-139.9 `MEMBER_MAX` is checked by its row only: no fixture builds an entry over ooxml's per-member limit within a test's memory.
  - R30's "no place" is checked by two place names.
  - R23's "secret nowhere" covers the answer, receipts, outcomes and events, not every store table.
  - R2's locator rule is checked by 7 cases. It is `record-grammar`'s `isPublicHttpsLocator`, tested in full there.

  Each id is met; widening these tests is outside N998's scope and is listed for a later entry.
- `reputation.test.mjs` bounds three real 5 s timers to under 8 s. That is the only load-sensitive timing left. It never failed across the 72 stress runs, and widening it would loosen what R44's bound proves.
- `own-host.test.mjs`:90 accepts 200 or 502 for "the render arm ran". The test's subject is `own_hosts` being handed over, which is asserted exactly.

**Found in another module:** none. `attestation.attest` takes a `now` that `coAttest` does not pass. That is correct as it is: each attempt's instant is its own (R20).

**Tests and checks run:**
- acquisition: `node --test bio-plane/test/m/acquisition/`: tests 159, pass 159, fail 0 (and the stress runs above).
- Users that reach `unpack` (P11; no provided service changed):
  - case-carriage 88/88; plane 233/233.
  - capture 141/142 and its `cap13-reuse-pages`, `d57selflink` 0/2: all `SIGN_IN_REFUSED` at the `{role}` sign-in. That is T48-16's entry, rule 5 (7, S).
  - control-plane 256/257: `envelope.test.mjs`:433, rule 5 (6).
- `node checks/format.mjs`: 168 modules, 167 requirements files; 0 failures.
- `node checks/architecture.mjs . acquisition`: 24 product files, 107 relative imports; 0 failures.
- `node checks/coverage.mjs . acquisition`: 45 of 45 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs . acquisition tranche/T48`: 0 failures.
- `node checks/run.mjs` over the product:
  - format 0, architecture 0 and channels 0 failures;
  - coverage 46 failures, all other modules' ids not yet met (rule 5 (1)), none of them acquisition's.

Size (session_01SP5b3QVofcumu9NEJFCqpN): test runs 312, module lines 2955
