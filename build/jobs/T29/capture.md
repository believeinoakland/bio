# capture (T29)

**Status** · session_0181RUrJ7zf5WDcW4trWkR3Y · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

COMPLETE on job/T29/capture (tranche/T29 @ f2086a954d merged in); code commit 8370194f56.

Entries applied: L3 capture, R69 wording (N530, K1336).
- `bio-plane/src/capture/index.mjs`: capture's own `CAPTURE_ACCOUNT_TOKEN` and `captureAccountStatement` (former lines 62–68) deleted; both names re-exported from `signatures` (`../sshsig.mjs`, its R41), and `recordCaptureAccount` verifies over the imported `captureAccountStatement` in `NS_RATIFY`. No spelling of capture's own remains; `affordances`' `sources.test.mjs` and capture's tests import the same names unchanged. The bytes are identical: no existing test changed.
- New test (`knocker.test.mjs`, "R69 (N530)"): capture's exported `captureAccountStatement` and `CAPTURE_ACCOUNT_TOKEN` are signatures' own (same function, same value); an account verifies over exactly signatures' bytes, and a near spelling is refused `SIG_BAD_SIGNATURE`.
- Re-scan (the opening's N502/N508 rule): source notes that named retired capture ids as live now name acquisition's. Wording only: R3 → acquisition R3, R16 → acquisition R16, R19 → acquisition R19, R33 → acquisition R25, R42 → acquisition R8, R61 → R73 (acquisition R22), in `index.mjs`, `ops.mjs` and `schema.mjs`. The in-process `captureAccountsOf` pre-flight is re-worded to `case-disclosures` R3's (N529), in `index.mjs` and one test comment.

Deferred: none.

Found in other modules:
- not_product's plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`) is stale from capture's source change (manifest §14). I did not regenerate it; it is for the layer close.
- `case-checker` still spells `bio-capture-account <sha>\n<text>` itself (R3, R14). N530's L8 entry already covers it.

Tests and checks:
- `node --test test/m/capture/`: 117 tests, 117 pass, 0 fail.
- `test/cap13-reuse-pages.test.mjs`: 22 pass, 0 fail. `test/d57selflink.test.mjs`: 24 pass, 0 fail.
- Users of the names: `test/m/affordances/sources.test.mjs` and `test/m/signatures/signatures.test.mjs`: 66 tests, 66 pass, 0 fail (signatures' R41 byte-identity test reads capture's re-export).
- format: 97 modules, 96 requirements files; 0 failures. architecture: 23 product files, 97 relative imports; 0 failures. coverage: 55 of 55 live requirement ids named by a test; 0 failures. ownership (tranche/T29): 5 files changed by capture; 0 failures.

Size (session_0181RUrJ7zf5WDcW4trWkR3Y): test runs 7, module lines 3455
