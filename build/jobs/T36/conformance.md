# conformance (T36)

**Status** · session_017pQAZVD5PcnqYJgECFytfm · depth 2 · WORKING · handled B1

## Completion

**Entries applied:** T36-43 (test only). New `bio-plane/test/m/conformance/t36.test.mjs`, 4 tests naming R27 and R3. The standard has no stated end (`to: null`) and is issued by the act's body, with an `inForceThroughRecord` through D = 2026-03-02 from an uploaded source (`checked: "stated"`). The tests check:
- **At D:** `noncompliant` is accepted with `binds: true` and the label "Standard · binds Parks Department". R3 reads it `in_force`, and the read answers the same.
- **At D + 1:** `noncompliant` is refused `STANDARD_NOT_BINDING` (C-113.32) with `binds: "undetermined"`. The detail carries standards' words ("the record does not state when it ceased to be in force") and nothing is written.
  - A later record through a later date settles it.
  - Within the record is the negative control.
- **After withdrawal:** `noncompliant` at D is refused the same way. A determination made before the withdrawal stands as recorded.
- **R3:** at D + 1, `compliant` and `unclear` are accepted. Force is stated `undetermined` beside the standard with its reason, and bindingness is `undetermined`.

No code change. Requirements: no wording (K2129).

**Note on the START's Suggestion "basis naming the record":** neither R27's held basis nor `bindsAt`'s `why` on the issuer path names the record. R27 asks only for "the adoption or the law that imposes it", and conformance keeps R3's state with `in_force_why: null` when the standard is in force. So the tests check what R27 states. That `standards.inForceAt`'s `why` names the record is checked as standards' answer only.

**Deferred:**
- `checks.mjs`:176 and :181 give C-113.34 and C-113.35 the `where` `#comparedActor`, but the function is `#comparedAct` (index.mjs:456). The name is pinned in `test/fixtures/row-census-1.63.0.jsonl`:224–225, which is not this module's, and correcting it changes two catalogue rows' `where`. Left for promotion's next stamp; reported (J2).

**Found in another module (reported, J2):**
- `standards` R43 says an adoption binds where it "puts it in force (R20, R40)". `#bindingOf`'s adoption branch (`standards/index.mjs`:1926–1930) instead answers `binds` from the adoption's start day with no in-force check.
  - Verified in a scratch run (not kept): a policy adopted by the Parks Department, its period ending 2021-12-31, reads `inForceAt` `not_in_force` but `bindsAt` `binds` on 2026-03-02.
  - For conformance: R3 still refuses `not_in_force`. But for an adopted standard with no stated end, after `through` or with no record, R3 reads `undetermined` while R27 reads `binds`. So `noncompliant` is accepted where R51 says "conformance R27 then refuses only where nothing is recorded".
  - The tests therefore use the issuer path, which rests on R20.

**Reading set (§17 (3); START measured 621 KB, over 300 KB):**
- **Read whole myself:**
  - `build/requirements/conformance.md`;
  - layer 9's row of `build/layers.md`;
  - the plan's opening rules and T36-43, K2129 with the draft's conformance section and BOB's review, and K2021;
  - the used services my entry names: `standards` R43, R50 and R51, the code of `bindsAt`, `#bindingOf`, `inForceThroughRecord`, `inForceThroughWithdraw`;
  - `test/m/conformance/fixture.mjs` and `t35.test.mjs`;
  - the new test.
- **Read by a worker:** the rest of `src/conformance/` (index, checks, schema) and the other seven test files, in full. Its summary (~6 KB) cites file:line for:
  - R3's and R27's reads and the dates read;
  - the held fields and what `determinationRead` answers;
  - the STANDARD_NOT_BINDING shape and the refusal order;
  - the factory;
  - the existing open-ended, `binds` and STANDARD_NOT_IN_FORCE tests;
  - the adoption flaw and the `where` mismatch.
- Nothing it left out mattered.
- P6: 2,083 lines of code, unchanged (tests only).

**Tests and checks:**
- conformance tests: `tests 80, pass 80, fail 0`.
- No layer tests are named (manifest). No service changed, so no users' tests.
- format: `135 modules, 134 requirements files; 0 failures`.
- architecture: `13 product files, 58 relative imports …; 0 failures`.
- coverage: `29 of 29 live requirement ids named by a test; 0 failures`.
- ownership: `1 files changed by conformance between tranche/T36 and HEAD; 0 failures`.

Size (session_017pQAZVD5PcnqYJgECFytfm): test runs 4, module lines 2,083

## J1 · REPORT

Found in other modules (record's Completion): (1) standards R43: #bindingOf's adoption branch (standards/index.mjs:1926-1930) answers binds from the adoption's start with no in-force check (R20), so a standard adopted by the body binds after its period ended (inForceAt not_in_force, bindsAt binds, verified) and, with no stated end, after a recorded through or with no record; conformance R27 then accepts noncompliant where R51 says it refuses. Standards' to fix (an N-entry for T37 suggested). (2) conformance's own checks.mjs:176, :181 give C-113.34/.35 the where #comparedActor (the function is #comparedAct); pinned in test/fixtures/row-census-1.63.0.jsonl:224-225 (not mine), so left for promotion's next stamp.
