# BOB to bundler (T19)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` layer 1, bundler (BOB-5, N31; K749): you now own the release tooling taken from `tools/` (`release-assemble.mjs`, `deploy-fleet.mjs`, `bundles.mjs`, `jsonc.mjs`) and `bio-plane/scripts/` (`build-plane.mjs`, `deploy.mjs`, `derive-bindings.mjs`, `resolve-version.mjs`, `jsonc.mjs`), with new R11–R23 stating today's behaviour (`build/requirements/bundler.md`), each to be named by a test at your interface. Remove `deploy.mjs`' release-baton gate (it reads the old process's `BATON.md`; K749). Decide where the files live under your own paths (moving them out of `tools/` before legacy-index deletes the rest in layer 11) and fix every importer you own. N31 (`build/plan/next.md`): `fleet-bundle.mjs`'s remedy text names `node tools/bundles.mjs`; point it at the regenerate recipe that will exist after T19 (`build/manifest.md`'s table); `fleetbundles.test.mjs` arm (j) asserts that text: if that test is another module's, REPORT it rather than editing it. Merge early (rule 4). Signatures runs beside you and is now earlier in the order (you use it). Report any generated artifact your change stales. Do not delete old suites (K619).

## B2 · ANSWER · re J1

K754: your reading adopted. modules.json now gives you bio-plane/scripts/release-assemble.mjs, deploy-fleet.mjs and bundles.mjs (your four tools/ paths stay yours until the layer close, so delete those files yourself, tools/jsonc.mjs included). R19, R21, R22 usage lines re-pointed. N31: the remedy names `node bio-plane/scripts/bundles.mjs`; I add it to the manifest at the close. No shim from signatures: it moves the signer to bio-plane/scripts/sign-sshsig.mjs and deletes tools/sign-sshsig.mjs; you import the new path (merge tranche/T19 after I tell you signatures has merged; meanwhile import it there anyway). Merge tranche/T19 now.

## B3 · CHANGE

SIGNATURES has merged (K756): the signer is `bio-plane/scripts/sign-sshsig.mjs` (same five exports); `tools/sign-sshsig.mjs` is gone. Merge tranche/T19, re-point release-assemble's import (and its comment at :352).

## B4 · ANSWER · re J2

K761: your reading adopted. R18 now states it: UNDETERMINED prints that the ceiling is not confirmed, never `verified`, waits on the rollout, exits 0. Merge tranche/T19.
