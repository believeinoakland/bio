# signatures (T36)

**Status** · session_01L8Hyorky2d1Lrs1dqmDrCn · depth 2 · WORKING · handled B2

## Completion

**Read whole** (mechanics §17): the START's reading set, 139 KB: `build/requirements/signatures.md`; `record-grammar`'s public part; layer 1's contract (`build/layers.md`); every file of the module's paths and tests (`signpage.mjs` as the render R30 checks byte for byte); plan entry T36-1 and rule 6; K1936, K2072; Distribution §10. Also `roles/JOB.md` in the process repository.

**Entries applied.** T36-1 (N712, its share; K1936 Q4 step 1), with BOB's rulings on my readings (B2, K2077):
- **R43.** Generate offers a passphrase, typed twice (a mismatch makes no key and says so; both fields emptied once read). With one, both private keys are the `wrapKey` form (`BIOKEY1.`) in every box, in "Copy everything" and in `bio-signing-keys.txt`; the page's load reads them back with it and refuses any other or none (unchanged `parseKeyString`, which now also refuses a malformed iteration count rather than deriving with it). With none, the raw form as before, with the development note. Public lines unchanged. With a passphrase, a button offers the release key's raw form once, for the secret store that signs releases: shown on request in its own box, hidden on request, never offered again for that Generate, withdrawn by Forget, and never written to the file or the whole copy. Not offered for the ratification or recovery key.
- **R44.** A "Make a recovery key" section, apart from Generate, with its own optional passphrase under R43's rule: a release key labelled `bio-release-recovery` in its envelope and its public line's comment, called "Recovery key" in each box, in its file `bio-recovery-key.txt`, on load ("Recovery key loaded.") and in the release pane's status line; made but not armed; loaded, it fills the release slot and signs `bio-release` (R31). `seedFromEnvelope` (R34) already accepts its raw envelope; signing unchanged.
- `src/signpage.mjs` re-rendered by `scripts/embed-signpage.mjs` (R30; the id pattern line unchanged). No requirement text changed.

**Tests.** New file `bio-plane/test/m/signatures/signer-keys.test.mjs`, 9 tests at the page's interface (its script on a stub DOM, driven through its buttons and fields, with clipboard and downloads captured): R43 ×5 (no passphrase as before; every private key given out protected and no seed form anywhere; load with the right, a wrong or no passphrase, and altered fields refused; the raw showing once, only on request, is the release key (`seedFromEnvelope`, `signSshsig`, `verifySshsig`), never in the file or copy, withdrawn by Forget; a mismatched passphrase makes nothing); R44 ×3 (named in every box and the file, not armed, distinct from the release key; loaded it signs a release verified under its public line, `bio-release` only, and its raw envelope is the release signer's; stock `ssh-keygen -Y verify` accepts it); R32/R43/R44 ×1 (the new text names no BIO, bundle, instance or plane; Forget clears it). The existing 77 unchanged.

**Deferred.** Nothing.

**Found in another module (REPORT J2).** Generated artifact staled by this change (§14): `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` (`not_product`) embed `src/signpage.mjs`; `fleetbundles.test.mjs` adds 4 FAIL on `bio-plane` (STALE BUNDLE, byte identity, manifest sha, comment arm) until BOB regenerates (`node bio-plane/scripts/bundles.mjs`, K1540's order). Before the change it had only inherited red 6 (agent-worker's input list). `release/bio-plane.bundled.mjs` and `newgroup/src/release.mjs` carry the old page as release copies, refreshed by the next release. `newgroup-bundle-fresh` stays green (it bundles `sshsig.mjs`, unchanged).

**Tests and checks run.**
- `node --test bio-plane/test/m/signatures/`: tests 86, pass 86, fail 0, skipped 0 (ssh-keygen and openssl present).
- Users of `SIGN_HTML`: answer-envelope `page-policy`, control-plane `doors`, setup-page `worker-page`: tests 22, pass 22, fail 0.
- `bio-plane/test/system/fleetbundles.test.mjs`: inherited red 6, plus bio-plane's 4 stale-bundle FAILs above (reported); `newgroup-bundle-fresh`: pass 1, fail 0.
- `node checks/format.mjs`: 135 modules, 134 requirements files; 0 failures.
- `node checks/architecture.mjs … signatures`: 9 product files, 13 relative imports; 0 failures.
- `node checks/coverage.mjs … signatures`: 44 of 44 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … signatures tranche/T36`: 4 files changed; 0 failures.

Size (session_01L8Hyorky2d1Lrs1dqmDrCn): test runs 9, module lines 1483 (the module's paths, tests excluded)

## J1 · QUESTION

Best readings for R43/R44 (details I take as yours to rule; I am building on them now and will bring the work in line with any answer):
1. The recovery key's envelope label and public-line comment are `bio-release-recovery` (`BIOKEY-RAW1.bio-release-recovery.…` / `BIOKEY1.bio-release-recovery.…`; `ssh-ed25519 … bio-release-recovery`), so its private and public text name it wherever they appear. Loading it arms the page's release slot (it signs `bio-release`, R31) and the page calls it "Recovery key". `seedFromEnvelope` (R34) already accepts any label, so nothing else changes.
2. The recovery key is made in its own section ("Make a recovery key"), apart from Generate, with its own passphrase field under R43's rule (optional, protected form when given). Making it does not arm it; its file is `bio-recovery-key.txt`, never mixed into `bio-signing-keys.txt`.
3. R43's one raw showing is offered for the release key only, not for the ratification key or the recovery key (Distribution §10: the recovery key is never in an environment).
4. A passphrase at Generate must be typed twice; a mismatch generates nothing.

## J2 · REPORT

Generated artifact staled (§14): bio-plane/dist/bio-plane.bundled.mjs and .bundle.json (not_product) embed src/signpage.mjs, re-rendered by T36-1. fleetbundles.test.mjs: 4 FAIL on bio-plane (STALE BUNDLE, byte identity, manifest sha, comment arm) until BOB regenerates (node bio-plane/scripts/bundles.mjs, K1540's order); before the change only inherited red 6. release/bio-plane.bundled.mjs and newgroup/src/release.mjs carry the old page as release copies, refreshed by the next release; newgroup-bundle-fresh stays green.
