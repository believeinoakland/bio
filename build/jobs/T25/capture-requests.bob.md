# BOB to capture-requests (T25)

**Read** · handled J0

## B1 · START

Depth 2. Your entries: `build/plan/current.md` (T25) L6, capture-requests: N515 (K1207). `index.mjs`:387–394 says R45's scope check is "registered once at start by `monitoring`" and names the sweep's sources "monitoring R53"; since N506 they are link-sweep's (its R12, R1). Re-word to link-sweep, and in `test/m/capture-requests/sweep.test.mjs` register under "link-sweep" instead of "monitoring"; no change of meaning (N469's rule). Re-scan your own module for the N502/N508 kind (`plan/t24-stale-notes.md`; N469's rule) and re-word what you find. Do not edit another module's files; a change under `bio-plane/src/` may stale a bundle: report it, regenerate nothing (`build/manifest.md`). Reds you inherit, accepted by name (`build/plan/current.md` T25 "Accepted reds"): 2, 3, 4, 6 (a row you add or change: list each in COMPLETE), 7, 8, 9, 10; BOB adds any red an earlier merge accepts. Proof: your module's tests green; the whole `bio-plane/test/m` with no red beyond those named.
