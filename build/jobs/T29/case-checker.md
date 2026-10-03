# case-checker (T29)

**Status** · session_01WJvRKHshhLTwUVBauzgSmg · depth 2 · COMPLETE · handled B1

## Completion

**Entry applied** · L8, case-checker (N530; K1336; B1). R3's member attestation is verified over `signatures.captureAccountStatement(sha, text)` (its R41) in `NS_RATIFY`: `check.mjs` imports it from `../sshsig.mjs` and its own spelling (old lines 53–57) is deleted; `accountStatement` stays exported only as that very function (`export const accountStatement = captureAccountStatement`), so signatures' R41 pin test still finds it. The test fixture now signs accounts over the same import (it had its own spelling, `accountMessage`; B1 named `accountStatement`, but the fixture never imported it). `spec.mjs`'s `bio-capture-account <capture sha>` literal (R14, prose) is unchanged. R13's program rebuilt with `node bio-plane/src/case-checker/build-program.mjs` and `program.mjs` committed (351,595 bytes, sha256 `f2bd6c488829287ec06d9b93f47e07ada74366cdb7b82db8327102b8ba5c3ea7`, 43 inputs; smaller than before because the modules merged in L1–L7 changed its inputs); R16's identity test (program vs `checkCaseFile`, byte-identical) passes.

**Tests added** · `check.test.mjs` "R3 (N530)": `accountStatement` is `signatures.captureAccountStatement` itself; an account signed over that statement is `checked` and every finding recreates; signed over three near spellings (a trailing space after the digest, a trailing newline, the digest on its own line) or over a ratify statement, or over the right bytes in `NS_RELEASE`, the attestation `fails` and the findings whose chain reaches the material (A, B) do not recreate while C does. Fixture gained `memoAccountMessage` and `memoAccountNamespace` options.

**Deferred** · none.

**Found in other modules** · none.

**Tests and checks run**
- `node --test bio-plane/test/m/case-checker/` (from `bio-plane/`): tests 27, pass 27, fail 0.
- Users of the touched export: `node --test test/m/signatures/signatures.test.mjs test/m/case-import/`: tests 111, pass 111, fail 0 (R41's byte-identity pin over `case-checker`'s `accountStatement` included).
- `checks/format.mjs .`: 97 modules, 96 requirements files; 0 failures.
- `checks/architecture.mjs . case-checker`: 11 product files, 45 relative imports; 0 failures.
- `checks/coverage.mjs . case-checker`: 19 of 19 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs . case-checker tranche/T29`: 5 files changed; 0 failures.

Size (session_01WJvRKHshhLTwUVBauzgSmg): test runs 3, module lines 1740

## J1 · COMPLETE

L8 entry applied (N530): R3's member attestation verified over signatures.captureAccountStatement in NS_RATIFY; check.mjs's own spelling deleted, accountStatement kept as the very imported function; program.mjs rebuilt and committed (sha256 f2bd6c48…). case-checker tests 27/27; signatures + case-import 111/111; format, architecture, coverage (19/19), ownership: 0 failures. Nothing deferred, nothing found in other modules. Record: build/jobs/T29/case-checker.md on job/T29/case-checker.
