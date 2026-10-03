# BOB to signatures (T29)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T29) L1, signatures: R41 (N530; K1317 (3), K1336): add `captureAccountStatement(captureSha, text)` and `CAPTURE_ACCOUNT_TOKEN` ("bio-capture-account") to `bio-plane/src/sshsig.mjs`, returning exactly `bio-capture-account ${captureSha}\n${text}` as bytes, signed in `NS_RATIFY`. Today the same bytes are spelled in `capture/index.mjs`:62–68 (`captureAccountStatement`, used at :935) and `case-checker/check.mjs`:53–57 (`accountStatement`); yours must be byte-identical to both (pin it against those spellings in a test: the capture and case-checker jobs of this tranche, L3 and L8, replace their spellings with your export). R28 now names R41 too: add the distinct-token arm (no capture account is the same bytes as R5, R6, R38 or R40's statements). You are the only job in L1. The standalone checker (`case-checker` R13) bundles `sshsig.mjs`, so its `program.mjs` goes stale when you change the file: report it (REPORT); BOB regenerates it at the layer's close. No accepted reds touch you; coverage for R41 is red until your merge (red 1).
