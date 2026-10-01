# signatures (T20)

**Status** · session_01ML4Fo3S55aQzLtgsN7sP6F · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied** · Layer 1, signatures (B1; N443's share, K762, with SIGNATURES #2's own T19 deferral). In `bio-plane/src/sshsig.mjs`, comments only, no behaviour change: (1) the fleet-statement note names the producer as `bio-plane/scripts/release-assemble.mjs` (was `tools/release-assemble.mjs`; K754; `tools/` is gone at T19's close, confirmed); (2) the header's list of where signing happens now includes the release signer, `scripts/sign-sshsig.mjs` on the operator's machine, which no bundle reaches (R33–R36).

**Improvement made** · `sshsig.mjs`'s `renderParts` note said parts render as `path:sha256:bytes`; the code and R10 render `path:type:sha256:bytes` (the type joined in IC-82). Comment corrected in the same edit.

**Deferred** · none.

**Found in other modules / generated artifacts (REPORT)** ·
- *Plane bundle stale* (`bio-plane/dist/bio-plane.bundled.mjs`, owner `not_product`): `fleetbundles.test.mjs` goes from the 3 accepted FAILs to 4; the one added is `bio-plane: no staleness, no recipe drift, no unresolvable import — THE D-298 ARM`. To regenerate at the L1 close, as B1 says.
- *Newgroup bundle* (`newgroup/dist/newgroup.bundled.mjs`, owner `installer`): `sshsig.mjs` is an input, but `newgroup-bundle-fresh.test.mjs` still passes (1 pass, 0 fail). The installer's bundle apparently drops comments, so a comment-only change leaves its bytes the same. Regenerate it at the close all the same, as the manifest says.
- *The 3 accepted fleetbundles FAILs* include `(j) … DO name \`node tools/bundles.mjs\``: that test still requires a remedy naming a script deleted with `tools/`. It's red without my change too. Owner: whichever module owns `fleetbundles.test.mjs`. Noted in case it is not already on the accepted list by name.

**Tests and checks** ·
- `node --test bio-plane/test/m/signatures/`: `tests 55, pass 55, fail 0, skipped 0` (ssh-keygen and openssl present).
- `node --test bio-plane/test/m/bundler/` (the module that uses the release signer and `fleetStatement`): `tests 44, pass 44, fail 0`.
- Layer tests: none named in `build/manifest.md`.
- `format`: 84 modules, 82 requirements files; 0 failures. `architecture`: 8 product files, 7 relative imports; 0 failures. `coverage`: 36 of 36 live requirement ids named by a test; 0 failures. `ownership` against `tranche/T20`: 1 file changed; 0 failures.

Size (session_01ML4Fo3S55aQzLtgsN7sP6F): test runs 6, module lines 1158

## J1 · REPORT

Generated artifacts after my comment-only change to bio-plane/src/sshsig.mjs: (1) plane bundle STALE: fleetbundles.test.mjs goes from the 3 accepted FAILs to 4, the added one is 'bio-plane: no staleness … THE D-298 ARM'; regenerate at the L1 close. (2) newgroup bundle: sshsig.mjs is an input, but newgroup-bundle-fresh.test.mjs still passes (its bundle drops comments, so the bytes did not change); regenerate it at the close anyway, per the manifest. (3) For the owner of fleetbundles.test.mjs: one of the 3 accepted FAILs, '(j) … DO name node tools/bundles.mjs', still requires a remedy naming a script deleted with tools/; it is red without my change. Details in my record.

## J2 · COMPLETE

Done. sshsig.mjs comments only: the fleet note names bio-plane/scripts/release-assemble.mjs as the producer; the header lists the release signer (scripts/sign-sshsig.mjs) among the places signing happens; plus the renderParts note corrected to path:type:sha256:bytes (R10). No behaviour change, nothing deferred. signatures 55/55, bundler 44/44; format, architecture, coverage (36/36) and ownership all 0 failures. Plane bundle stale (REPORT J1).
