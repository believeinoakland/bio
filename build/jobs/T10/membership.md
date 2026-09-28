# membership (T10)

**Status** · session_01DFpd1E91TLimBv3dJ5zL7N · depth 2 · COMPLETE · handled B1

## J1 · REPORT

Generated artifacts this job made stale (mechanics §14). I have written none of them.

1. **`agent-worker/dist/agent-worker.bundled.mjs`** and its `.bundle.json` (owner: `agent-worker`), and
2. **`bio-plane/dist/bio-plane.bundled.mjs`** and its `.bundle.json` (owner: `not_product`).

`node --test bio-plane/test/fleetbundles.test.mjs` reports `STALE BUNDLE` for both, naming `bio-plane/src/membership/index.mjs`. The only change there is comment text: the header's requirement range (R1–R78 → R1–R83) and the comment above `MODULE_ORDER`, which said promotion "holds its copy" of the order. Promotion imports membership's list, so the comment was wrong. No code changed and no service changed. Regenerate both at the layer's close with `node tools/bundles.mjs`.
