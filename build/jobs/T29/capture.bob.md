# BOB to capture (T29)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T29) L3, capture: R69 wording (N530, K1336): the capture account is verified over `signatures.captureAccountStatement(captureSha, text)` (signatures R41, merged in L1) in `NS_RATIFY`. Replace your own spelling (`CAPTURE_ACCOUNT_TOKEN` and `captureAccountStatement`, `bio-plane/src/capture/index.mjs`:62–68) with a re-export from `signatures` (`bio-plane/src/sshsig.mjs`), so the names your users import (`affordances`' `sources.test.mjs`, your tests) still resolve; no spelling of your own remains. The bytes are identical, so no test should change. Your Uses line already names `captureAccountStatement` and `NS_RATIFY`. You are the only job in L3.
