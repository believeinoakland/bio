# sheet-worker (T51)

**Status** · session_01QtpnxHgL1z6PkC9WuixPrM · depth 2 · WORKING · handled B1

## J1 · REPORT

The words change stales another module's generated artifact. My change to `sheet-worker/src/contract.mjs` (its refusal sentences now read through `localize`) is an input of bio-plane's bundle, so `bio-plane/dist/bio-plane.bundled.mjs` no longer matches its source. The fleet gate (`bio-plane/test/system/fleetbundles.test.mjs`) reports `STALE BUNDLE — the source ../sheet-worker/src/contract.mjs has changed`. I did not rebuild it: mechanics §14 says never write another module's artifact. Request: BOB rebuilds bio-plane's bundles (`node bio-plane/scripts/bundles.mjs`) at this layer's close or by a ruling.

The same gate also lists stale bundles that name sources I did not touch (`court-doctypes/common.mjs`, `doctypes/*`, `jurisdictions/index.mjs`, `roster-reader/org-chart.mjs`, `src/civil-time/*`, `src/connection-grammar/*`, `src/idspaces.mjs`, `src/record-grammar/bundle.mjs`, `src/subresources.mjs`, `src/calc-grammar/recipe.mjs`). Those predate this job. The sheet-worker bundle arms all pass.
