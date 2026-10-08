# explore (T36)

**Status** · session_013jCD29K2Ak5HWZGMPQjE64 · depth 2 · RUNNING until 2026-10-08T03:20:55Z (users' tests (hypotheses, affordances, op-declarations, plane)) · handled B1

## J1 · REPORT

**To route to events (T36-14, running now): its `neighbours` (R35) is too slow for R20's proving test, at the interface.** Measured on `job/T36/explore` over events' own test world (`test/m/events/fixture.mjs`, node:sqlite), one member with 4,000 `vote` events as `voted`:
- one call `neighbours({node: member, kinds: ["event_voted"], at: 2025 EDTF, page: 0})` takes **4.6–4.7 s** (repeatable; `event_decider` on the same node 47 ms; a vote node 5 ms). About 1.15 ms per row: some 15 queries per participant row (top: the entities resolution window query 0.34 ms each, `event_attestations WHERE event_id=? AND serves='event'` and the `event_choices` join ~0.09 ms each, the viewer gate, `resolutions`, `event_when_cache`). `validAt` is 19 ms for all 4,000.
- `owner.mjs` builds every row of the node's whole set with its grades and evidence on **every page**, then slices it (lines 95–99). With T36-14's per-kind bound, a 4,000-vote member is four pages of 1,000, so about 4 × 4.7 s ≈ 19 s for that one node: M-X1a through events' real owner (R20's proving test, K1726's measure) cannot answer within `time_budget_ms` 10,000 as events stands. My arm (`test/m/explore/mx1a-events.test.mjs`) is written and waits on T36-14's merge.
- Suggested in events' own job (its choice): count the per-kind set first from the participant rows (cheap: role and visibility only), then build grades and evidence only for the page's slice; and compute the participant entity's end grade (`resolutionGrade(p.entity_id, x)`) once per call where the node is that entity. That brings the member's read to roughly one set's cost, not four.
- Also for events: a kind not asked still costs a full participant scan (`SELECT *` of the node's participants, filtered in JS), 47 ms at 4,000; explore's R20 re-asks a hub once per kind asked (up to events' ~23 kinds), so filtering `role` in SQL keeps those re-asks cheap. Not blocking.

explore's own state: R5 (each kind read whole within `hubBoundOf`) and R20 (a hub answer to a several-kind call re-asked kind by kind) are built and tested over fixture owners (4,000 votes: 4,262 ms of 10,000; 4,001: hub for votes alone, the member's other kinds walked). If events' read stays as it is, the real-owner arm will fail its budget and I will post BLOCKED (tests); nothing in explore can lower an owner's per-call cost.
