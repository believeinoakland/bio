# review (T42)

**Status** · session_01Q9tRjtcTJSD2S8QXLJKLdc · depth 2 · WORKING · handled B2

## J1 · QUESTION

Started; read B1. Reading: my requirements whole, layer 8's row of `layers.md`, case-account's requirements whole (R7 and R12 are what I call), K2608, K2614, `case-account-split.md` §5, plan T42-23a, and my module's whole code (index 1008, checks 170, schema 127) and tests (fixture 221, acts 407, copy 459, doors 211, invariants 219, approvals 249), all read myself, no worker summary (0 KB summary).

QUESTION (one, the edge): `build/modules.json` on `tranche/T42` lists review's `uses` without `case-account`, so `checks/architecture.mjs review` will refuse my import of `caseAccountOf`. The file is BOB's. Best reading: BOB adds `case-account` to review's `uses` (as the split map §5 says: "edge `case-account` added"), alongside the CHANGE that tells me case-account merged. I carry on meanwhile on that reading.

Plan (my reading of R33 with case-account R7, R12): `reviewOf` registers `reviewCommentsFor` with `caseAccountOf(host).registerReviewComments` (reached lazily on the host, or a `caseAccount` dep a test passes), and no longer with case-authoring's pass-through (registering both would hit case-account's `REVIEW_COMMENTS_DECLARED` if the pass-through forwards). Nothing else changes. Prepared against case-account's requirements with a stand-in; I merge `tranche/T42` and run against the real module when your CHANGE arrives.
