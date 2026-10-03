# signatures (T29)

**Status** · session_01LrwnC23wRd3ati4bwBSKnq · depth 2 · WORKING · handled B0

## J1 · REPORT

**Generated artifact staled (mechanics §14).** My change to `bio-plane/src/sshsig.mjs` stales the plane bundle `bio-plane/dist/bio-plane.bundled.mjs` (owner `not_product`): `bio-plane/test/system/fleetbundles.test.mjs` fails only its `bio-plane` member arm ("no staleness, no recipe drift"), and passes on the tranche base without my change. Not stale, measured: the case-checker standalone program (`node --test bio-plane/test/m/case-checker/`: 26 pass, 0 fail; its R13 build is byte-identical to the committed `program.mjs`, since the program does not take the new export), and the installer bundle (`newgroup-bundle-fresh.test.mjs`: 1 pass, 0 fail). So at L1's close: regenerate the plane bundle; `program.mjs` needs regenerating only once case-checker's L8 job imports `captureAccountStatement`.

**For the capture (L3) and case-checker (L8) jobs.** My R41 pin test runs in a child process and compares my export, byte for byte over eight accounts (multi-line, CRLF, non-ASCII, NUL, empty, text that reads like another statement) plus non-string arguments, against `capture`'s exported `captureAccountStatement` and `CAPTURE_ACCOUNT_TOKEN` and `case-checker/check.mjs`'s exported `accountStatement`, wherever each module still exports that name. A re-export keeps passing. If a job drops the name altogether, that arm skips (the spelling is gone, which is the point), and R41's exact-bytes test still holds the bytes.

## J2 · COMPLETE

**Entries applied.** `build/plan/current.md` (T29) L1, signatures: R41 (N530; K1317 (3), K1336), per B1.
- `bio-plane/src/sshsig.mjs`: `CAPTURE_ACCOUNT_TOKEN` (`"bio-capture-account"`) and `captureAccountStatement(captureSha, text)`, which returns exactly `` `bio-capture-account ${String(captureSha)}\n${String(text)}` `` as UTF-8 bytes. No field is refused, since an account is prose. Signed in `NS_RATIFY`. It is the same expression as capture's spelling (`capture/index.mjs`:62–68) and case-checker's (`check.mjs`:57).
- Tests (`bio-plane/test/m/signatures/signatures.test.mjs`): R41 exact bytes, the text unchanged after the first newline, `String(…)` on each argument, deterministic, the constant cannot be rebound; R41 byte-identical to capture's and case-checker's spellings (a child process, so my tests import neither; a mutation of my export, trimming the text, turns this test red along with the exact-bytes and ssh-keygen tests); R41 distinct token: never the bytes or leading token of R5, R6, R38, R40 or the fleet statement, verifies in `NS_RATIFY` only, and no cross-verification with a ratification or case ratification; R41 a stock ssh-keygen `bio-ratify` signature verifies only over its own bytes. R28 gains two capture accounts among its messages (a single-bit change to any of them is refused). R26's child process and R27's strings include the new statement.

**Deferred.** None.

**Found in other modules.** See J1 (REPORT): the plane bundle is stale (regenerate at L1's close); the case-checker `program.mjs` and the installer bundle are not.

**Tests and checks** (on `job/T29/signatures` @ tranche/T29 K1336):
- `node --test bio-plane/test/m/signatures/`: tests 72, pass 72, fail 0, skipped 0.
- `node --test bio-plane/test/m/case-checker/`: pass 26, fail 0. `newgroup-bundle-fresh.test.mjs`: pass 1, fail 0. `fleetbundles.test.mjs`: fail 1 (the plane bundle, stale, J1).
- `node checks/format.mjs`: 97 modules, 94 requirements files; 0 failures.
- `node checks/architecture.mjs … signatures`: 8 product files, 7 relative imports; 0 failures.
- `node checks/coverage.mjs … signatures`: 41 of 41 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … signatures tranche/T29`: 3 files; 0 failures.

Size (session_01LrwnC23wRd3ati4bwBSKnq): test runs 6, module lines 1329
