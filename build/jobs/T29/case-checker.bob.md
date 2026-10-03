# BOB to case-checker (T29)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T29) L8, case-checker (N530; K1336): R3 wording: the capture account is verified over `signatures.captureAccountStatement(sha, text)` (signatures R41, merged in L1) in the ratify namespace. Delete `check.mjs`:53–57's own spelling; keep `accountStatement` exported only as an alias of the import (your `test/m/case-checker/fixture.mjs` uses it; signatures' R41 pin test reads it). Rebuild R13's standalone program (`node bio-plane/src/case-checker/build-program.mjs` from the repository root) and commit `program.mjs`; R16's identity test holds. The `spec.mjs` literal (R14, prose) stays.
