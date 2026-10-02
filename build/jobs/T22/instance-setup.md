# instance-setup (T22)

**Status** · session_01SN91cXiJGhNkycNvNWigjp · depth 2 · COMPLETE · handled B1

## J1 · REPORT

Generated artifacts my change stales (mechanics §14; regenerated nothing), on `job/T22/instance-setup` @ 799f94ed90:
1. The plane's bundle `bio-plane/dist/bio-plane.bundled.mjs` (from `bio-plane/src/setup.mjs` and `setup-fleet.mjs`): `bio-plane/test/system/fleetbundles.test.mjs` FAIL "bio-plane: no staleness …"; agent-worker, ocr-worker and pdf-worker pass.
2. The installer's bundle `newgroup/dist/newgroup.bundled.mjs` (through `setup-fleet.mjs`, which `newgroup/src/index.mjs`:33 imports): `bio-plane/test/system/newgroup-bundle-fresh.test.mjs` 3 passed, 1 failed, (C) the committed bundle no longer byte-identical to a fresh build.

For installer (R34, after my merge): the block's words are held once in `bio-plane/src/setup-fleet.mjs` as `HOSTING_CONTROL` (`{heading, sentences}`, frozen) and `hostingControlBlock(cls = "notice")` (the block as HTML, every word escaped, `<div class="<cls>" id="hosting-control">`); the leaf still imports nothing. The installer can import either beside `GROUP_SLUG_RE` and `FLEET_BINDINGS` (`newgroup/src/index.mjs`:33), passing its own page's class.
