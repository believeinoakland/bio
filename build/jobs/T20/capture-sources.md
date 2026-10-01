# capture-sources (T20)

**Status** · session_01E7bTM3MKu3LsrvRVRuAXcf · depth 2 · WORKING · handled B1

## Completion

**Entry applied** (B1; plan T20 layer 3, K853). `bio-plane/test/m/capture-sources/credentials.test.mjs`: the test that ran legacy-tests' `civicos-ui/check-refusal-codes.mjs` ("R55, R57, R63: the DEC-49 guard resolves every C-105 region…", accepted red by name since T19's close) is replaced by one at the module's interface, with no guard script and no file outside this module's paths: "R55, R57, R63: the family's one home is CAPTURE_CREDENTIAL_CHECKS, and every refusal answered is its own row, no C-105 number held twice".
- Arm A (the home): the exports of `src/capture-sources/credentials.mjs` carrying the reserved `_CHECKS` suffix, as control-plane's `families.mjs` composition finds a family, are exactly `["CAPTURE_CREDENTIAL_CHECKS"]`, a frozen object of rows; every code is `CAPTURE_CREDENTIAL_*`; every `check` is a `C-105.n` and none is held twice.
- Arm C (the governed sites): every refusal path of R55, R57 and R63 is driven at the interface (each supply refusal, `NO_KEY`, `SUPPLY_FAILED` through a failing insert, `NO_SUCH`, `NOT_PERMITTED` for member, project and group rows, `WITHDRAW_FAILED` through a failing read, the already-withdrawn case, R56's three no-credential answers, R58's listings). Each refusal's `reason` is a row of the family and carries that row's own `code`, `check` and `translation`; every `CAPTURE_CREDENTIAL_*` name in any answer, R56's reason sentence included, is a row; and the set of codes answered equals the family's keys, so no row lacks a site. A mutation (every refusal answering C-105.1) turns four tests red, this one among them.
- The tests at :82–:147 and :527–:555 are unchanged (only the comment above the latter re-worded, dropping its mention of the guard); the `spawnSync` import and the now-unused `REPO` constant are dropped. No product code changed; R55, R57, R63 unchanged.

**The red met:** "R55, R57, R63: the DEC-49 guard resolves every C-105 region and names none of this module's rows as a failure" (`credentials.test.mjs`:557) no longer exists; `credentials.test.mjs` is green whole (20 of 20).

**Deferred:** none. **Found in other modules:** none. **Generated artifacts:** none moved (tests only).

**Tests and checks**
- `node --test test/m/capture-sources/credentials.test.mjs`: tests 20, pass 20, fail 0.
- `node --test test/m/capture-sources/`: tests 75, pass 74, fail 0, todo 1 (R37, not yet met, unscheduled, K48).
- Layer tests: none named in `build/manifest.md`.
- `format`: 84 modules, 82 requirements files; 0 failures. `architecture`: 10 product files, 19 relative imports; 0 failures. `coverage`: 63 of 63 live requirement ids named by a test; 0 failures. `ownership` (tranche/T20): 1 file changed; 0 failures.

Size (session_01E7bTM3MKu3LsrvRVRuAXcf): test runs 6, module lines 4078
