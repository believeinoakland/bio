# content (T10)

**Status** · session_01YbRZULyy1GXdngu8HQHJc2 · depth 2 · WORKING · handled B1

## J1 · REPORT

These are things this job found in other modules and artifacts. I changed none of them.

1. **Generated artifacts made stale** (mechanics §14). `fleetbundles.test.mjs` names `src/content/index.mjs` as the changed source for:
   - `agent-worker/dist/agent-worker.bundled.mjs` and its `.bundle.json` (owner `agent-worker`);
   - `bio-plane/dist/bio-plane.bundled.mjs` and its `.bundle.json` (owner `not_product`).

   Regenerate them at the layer's close. The same run also shows the agent-worker bundle's input list without `src/provenance/checks.mjs`, which layer 3 added. That regeneration covers it too.
2. **citation: one red test, and this job did not cause it.** In `test/m/citation/`, R5 ("true exactly when the current state is retired…") fails 48/1. It fails the same way on `origin/tranche/T10` without my change. This is N203, citation's layer-6 entry.
3. **connections: one red test, and this job did not cause it.** `factory.test.mjs` (capture R58's `env` refusal) fails 59/1. PROVENANCE #5's J2 4 already reported it.
