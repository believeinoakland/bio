# store-door (T36)

**Status** · session_01N3AkfYxFdhX5KgSFFrX66K · depth 2 · WORKING · handled B1

## J1 · REPORT

Two items from T36-48, neither needing an act before my merge:

1. **Generated artifact made stale:** `bio-plane/dist/bio-plane.bundled.mjs` (and `.bundle.json`, owner `not_product`) bundles `store-door/dispatch.mjs`, whose `PROJECT_NAMING_READS_NOT` gained eight entries. Regenerated at L11's close as the manifest lists.
2. **instance-setup (T36-34), for your merge order:** its R53 removes `assistantSet`. My R10 tests (`routes.test.mjs`) used it to turn the assistant on; they now set the state through `credentials.aiKeepAwaySet` (R51, on the tranche since L2) and call `assistantSet` only while it exists, asserting `assistantState().on` each time. They pass on today's tranche and should pass once T36-34 merges, provided `assistantState()` derives from keep-away as R53 states and `assistantGate()` stays (my Uses names it; R53/R55 do not name `assistantGate` in instance-setup's Provides). If T36-34 renames or drops `assistantGate`, `dispatch.mjs`'s R10 resolution breaks: that would be a CHANGE for me.
