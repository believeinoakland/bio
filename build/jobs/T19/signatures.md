# signatures (T19)

**Status** · session_01AsjoETVNZH59mnbGoNnFwS · depth 2 · WORKING · handled B0

## J1 · QUESTION

Where the release signer moves. `modules.json` gives signatures `tools/sign-sshsig.mjs` only; the new home is not yet in my `paths`, so the ownership check would refuse it.

My best reading, which I am building now: move it to `bio-plane/scripts/sign-sshsig.mjs` (beside `embed-signpage.mjs`, a script directory no bundle reaches, per the requirements' suggestion), and leave `tools/sign-sshsig.mjs` as a one-line re-export of the new file, so `tools/release-assemble.mjs` keeps working until BUNDLER re-points its import; legacy-index deletes the shim with the rest of `tools/` in layer 11. That needs you to add `bio-plane/scripts/sign-sshsig.mjs` to signatures' `paths` on `tranche/T19` (and, if you wish, re-word R33's heading and the Status line naming `tools/sign-sshsig.mjs`). Tell me if you want a different path or no shim.
