# signatures (T19)

**Status** · session_01AsjoETVNZH59mnbGoNnFwS · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

Where the release signer moves. `modules.json` gives signatures `tools/sign-sshsig.mjs` only; the new home is not yet in my `paths`, so the ownership check would refuse it.

My best reading, which I am building now: move it to `bio-plane/scripts/sign-sshsig.mjs` (beside `embed-signpage.mjs`, a script directory no bundle reaches, per the requirements' suggestion), and leave `tools/sign-sshsig.mjs` as a one-line re-export of the new file, so `tools/release-assemble.mjs` keeps working until BUNDLER re-points its import; legacy-index deletes the shim with the rest of `tools/` in layer 11. That needs you to add `bio-plane/scripts/sign-sshsig.mjs` to signatures' `paths` on `tranche/T19` (and, if you wish, re-word R33's heading and the Status line naming `tools/sign-sshsig.mjs`). Tell me if you want a different path or no shim.

## Completion

**Entries applied** · Layer 1, signatures (BOB-5; K749), with B2's answer (K754): the release signer moved from `tools/sign-sshsig.mjs` to **`bio-plane/scripts/sign-sshsig.mjs`** (beside `embed-signpage.mjs`, outside `src/`, so no bundle reaches it); `tools/sign-sshsig.mjs` deleted, no shim. Its header re-pointed to the new home and the page's path (`src/sign-release.html`), and states R36. R33–R36 are each named by tests at the interface in the new `bio-plane/test/m/signatures/release-signer.test.mjs`: output checked by `verifySshsig`, by stock `ssh-keygen -Y verify`, and byte for byte against `ssh-keygen -Y sign` with the same key; key derivation against RFC 8032's vector and the signer page's own derivation; R36 by scanning every output and error for the seed and by running the signer in a child process that records any console or stdio write and any file written. The old suite is untouched (K619).

**Improvement made** · `seedFromEnvelope` (R34, "accepts exactly"): it accepted any text after the label, because Node's base64 decoder silently skips characters it does not know, so `…seed!` or a seed with a space or `-` inside gave the same key. It now accepts only canonical padded base64 and refuses anything else with R34's message. Envelopes the signer page mints are unaffected (tested).

**Deferred** · `sshsig.mjs`'s two notes (its header's list of where signing happens, and the fleet comment naming `tools/release-assemble.mjs` as the producer, the requirements' suggestion): not changed, because `sshsig.mjs` is an input of the plane's and the installer's generated bundles, and a comment-only edit would make both stale for no change in behaviour. The note is still accurate today (the assembler is still at that path). Best done by whichever job next changes `sshsig.mjs` for a reason, or by BOB at a layer close when the bundles are regenerated anyway.

**Found in other modules (REPORT)** ·
- *bundler:* `tools/release-assemble.mjs`:116 imports `./sign-sshsig.mjs`, which no longer exists once this branch merges; its new path is `../bio-plane/scripts/sign-sshsig.mjs` (same exports: `signSshsig`, `seedFromEnvelope`, `signerPublicLine`, `keyFromSeed`, `publicFromKey`). Its comment at :352 ("See tools/sign-sshsig.mjs") names the old path too. bundler's own tests do not import the assembler, so they stay green (19 pass) either way.
- *build (BOB's):* `build/layers.md` lines 7–11 on `tranche/T19` hold unresolved merge-conflict markers (`<<<<<<< HEAD` / `=======` / `>>>>>>> fold-bob5`) around layer 1's row; the HEAD side (with `site-profiles`) looks like the one to keep. The format check does not catch it.
- No generated artifact made stale: no bundle input changed (`sshsig.mjs`, `tsa.mjs`, `signpage.mjs` untouched).

**Tests and checks** ·
- `node --test bio-plane/test/m/signatures/`: `tests 55, pass 55, fail 0, skipped 0` (ssh-keygen and openssl present, nothing skipped).
- `node --test bio-plane/test/m/bundler/` (the module that uses the signer): `tests 19, pass 19, fail 0`.
- Layer tests: none named in `build/manifest.md`.
- `format`: 83 modules, 78 requirements files; 0 failures. `architecture`: 8 product files, 7 relative imports; 0 failures. `coverage`: 36 of 36 live requirement ids named by a test; 0 failures. `ownership` against `tranche/T19`: 4 files changed; 0 failures.

Size (session_01AsjoETVNZH59mnbGoNnFwS): test runs 7, module lines 1156
