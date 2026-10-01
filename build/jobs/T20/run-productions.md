# run-productions (T20)

**Status** · session_01HvRgF9mFJPqWdxmYKyyNUa · depth 2 · COMPLETE · handled B1

## J1 · REPORT

Found outside run-productions (none changed by me):

1. **Stale generated artifact** (mechanics §14): `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` (owner `not_product`, `build/manifest.md`) embed `src/run-productions/index.mjs`, which this job changed (added `RunProductions.COUNT_KEYS` and made `counts(hid)` answer per key). Regenerate at the layer close (`bio-plane/`: `npm run build`). No other listed artifact takes run-productions as an input.
2. **For plane's T20 job (L11):** register the export as `recordOf(ctx).registerCounts("run-productions", [...RunProductions.COUNT_KEYS], (hid) => runProductionsOf(ctx).counts(hid))` and drop `held.mjs`:76 (`prod`), :96 and :140. The key order then moves from the literal places to R63's registration order, which plane R10 allows.
