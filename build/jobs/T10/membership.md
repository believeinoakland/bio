# membership (T10)

**Status** · session_01DFpd1E91TLimBv3dJ5zL7N · depth 2 · COMPLETE · handled B1

## J1 · REPORT

Generated artifacts this job made stale (mechanics §14). I have written none of them.

1. **`agent-worker/dist/agent-worker.bundled.mjs`** and its `.bundle.json` (owner: `agent-worker`), and
2. **`bio-plane/dist/bio-plane.bundled.mjs`** and its `.bundle.json` (owner: `not_product`).

`node --test bio-plane/test/fleetbundles.test.mjs` reports `STALE BUNDLE` for both, naming `bio-plane/src/membership/index.mjs`. The only change there is comment text: the header's requirement range (R1–R78 → R1–R83) and the comment above `MODULE_ORDER`, which said promotion "holds its copy" of the order. Promotion imports membership's list, so the comment was wrong. No code changed and no service changed. Regenerate both at the layer's close with `node tools/bundles.mjs`.

## J2 · COMPLETE

**Entry applied** (plan layer 2, the membership bullet):
- **N280 → R83.** New `bio-plane/test/m/membership/module-order.test.mjs`, with three tests named R83 that check everything R83 states, at the interface:
  - `MODULE_ORDER` equals `build/modules.json`'s ids in the file's order, which is the total order: the file's layers never decrease, each id appears once, and every entry is a string.
  - It is frozen: `Object.isFrozen`, and push, pop, reverse, sort, splice, index assignment, `length = 0` and delete each throw `TypeError` and leave it unchanged.
  - It is the order listeners are told in (with R79): a listener for every module id, registered in reverse with two unknown modules mixed in, is told on a revocation in exactly `MODULE_ORDER`, with the unknown modules last in the order they registered.
  R83 holds, so no code change was needed. I also corrected the stale comment above `MODULE_ORDER`, which said promotion "holds its copy"; promotion, provenance, calibration, content and extraction all import this one list. I updated the header's range to R1–R83.

**Deferred:** none. **Other modules:** J1 (two bundles made stale by comment text only).

**Tests:** `node --test bio-plane/test/m/membership/` gives tests 95, pass 94, fail 0, todo 1. The todo is R81's, carried over (legacy-checks holds no row for its two codes yet, N202/N206). `fleetbundles.test.mjs` fails only on the two stale bundles in J1. The manifest names no layer tests.

**Checks:**
- format: 69 modules, 64 requirements files; 0 failures
- architecture: 14 product files, 34 relative imports; 0 failures
- coverage: 83 of 83 live requirement ids named by a test; 0 failures
- ownership: 3 files changed by membership between tranche/T10 and HEAD; legacy-store 0 added, 0 removed; 0 failures

Size (session_01DFpd1E91TLimBv3dJ5zL7N): test runs 2, module lines 3594
