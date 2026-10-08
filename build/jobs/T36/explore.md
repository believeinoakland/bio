# explore (T36)

**Status** · session_013jCD29K2Ak5HWZGMPQjE64 · depth 2 · WORKING · handled B2

## Reading set (mechanics §17, N739)

Measured at the start with `build/plan/reading-sets.py`: 153 KB (own requirements 14 KB, used public parts 98 KB as an over-estimate, code 42 KB), tests about 52 KB: under 300 KB, so **read whole myself**: my requirements; layer 5's row of `build/layers.md`; my entry T36-42, the plan's "Rules at the opening", K2092, K1566, K1726, K2063; every file of `bio-plane/src/explore/` and `bio-plane/test/m/explore/` (fixture included); of each used module the Purpose and the services my Uses names (`connection-grammar`'s public part whole, with R19 and `bounds.mjs`; `civil-time` R22–R23 `validAt`; `observation-log` R1's vocabulary; `money` R9, R16; `duties` R18; `events` R28, R30, R35 and its T36-14 note, with `events/owner.mjs`, the owner the proving test reads, and its test fixture). No workers.

## Entries applied (T36-42)

- **R5.** `reader.mjs`: an owner's answer for a node is read page by page to its end; each kind's items are kept to that kind's own bound, `connection-grammar.hubBoundOf(kind)` (4,000 for `event_voted`, 1,000 else), never cut at one page's fan-out. Items an owner pages beyond a kind's bound are not walked and `fanout_truncated` names the node, the kind and the bound. Paging stops once past the sum of the asked kinds' bounds (nothing beyond is walked); the time budget bounds a paging that never ends. The old 100-page guard (`PAGE_LIMIT`, an export nothing else read) is gone: a 4,000-vote set at a 10-item page would have been cut by it.
- **R20.** A hub entry is `{node, owner, kind, bound, set_size, why, words}`. A hub answer to a call naming several of an owner's kinds is asked again for each kind alone (same `at`, `viewer`, `scope`); a kind answered in items is walked, a kind answered as a hub alone is named; a kind refused alone is named in `owner_refusals` and the others still walked. Every call goes through the reader, so it counts toward `owner_calls` and the budget, and the presets' and overlaps' period walks (`sharedSet` too, whose hub now names its kind and bound; `at_least` now means the owner held more than the kind's bound) judge hubs the same way. `unread` entries met twice on re-asks are listed once.
- Tests: `walk.test.mjs` R5 (each bound; the 3,400-vote set paged whole across four pages; a vote set cut at 4,000; a hub named with kind, bound, set size) and two R20 tests (the mixed call of votes over their bound beside meetings under theirs, re-asked per kind and for no kind not asked; at 4,000 no hub; the re-asks counted and stopping on the budget; hidden votes neither making a hub nor showing; overlaps at a date and over a period beside a hub of another kind). `fixtures/owners.mjs` judges a hub per kind as connection-grammar R6 now says. `mx1a.test.mjs` gains R20's arms over fixture owners (4,000 votes walked whole within the budget; 4,001 a hub for votes alone with the member's other kind walked). `mx1a-events.test.mjs`: the same arms through `events`' real registered owner, waiting on T36-14 (see J1).

## The proving test (R20; K1726's measure)

`mx1a-events.test.mjs`, after B2 (events merged with the J1 fix; tranche/T36 merged at `28fab5ac9c`): Bob's seven-hop chain with the member, votes, award and contract held by the real `events` and `entities` over node:sqlite and read through the default registry's `events` owner. **4,000 votes: `elapsed_ms` 8,089, 8,107, 8,507** of `budget_ms` 10,000 (three runs; visited 4,007, owner calls 12,021, no truncation, the member not a hub, no fan-out cut for votes, the seven-hop path found), beside K1726's 266–283 ms (chain, fixture owners at 600 votes). **4,001 votes:** 766–832 ms; the member named in `hubs` with kind `event_voted`, bound 4,000, set size 4,001, and its decision (`event_decider`, another events kind) walked to the six-hop path. Over fixture owners (`mx1a.test.mjs`): 4,000 votes 4,262–4,758 ms; 600 votes 354–519 ms; dense walk 321–494 ms (nodes exhaustion).

**The margin is thin (~15–20%).** What remains is events' cost per node, not explore's: of the 12,021 calls, about 4,000 are events reads of single vote events (about 1.7 ms each in events' test world, which prepares every statement anew), and the member's four pages about 1.2 s (K2119). On a slower machine the arm could cross the budget; reported in COMPLETE for events' next job (a cheaper read of an event node), and `time_budget_ms` stays connection-grammar's.

## Deferred

None in explore.

## Found in other modules

- events (J1, routed and fixed in T36-14, K2119, K2122): the per-page rebuild of a node's whole set. Remaining: the per-node read cost above (efficiency, not a requirement breach; M-X1a passes).

## Tests and checks

- explore: `node --test bio-plane/test/m/explore/` 32 pass, 0 fail.
- Users of explore, on the merged tip: hypotheses 30/0; affordances 207/1 (inherited red 20, `catalogue.test.mjs`:583, failing identically on `tranche/T36`'s tip); op-declarations 90/3 (inherited reds 13 and 17); plane 130/0; `system/migrate-released` 1/0.
- `format`: 135 modules, 134 requirements files; 0 failures. `architecture`: 17 product files, 56 relative imports; 0 failures. `coverage`: 20 of 20 live requirement ids named by a test; 0 failures. `ownership`: 8 files changed between tranche/T36 and HEAD; 0 failures.
- Module size 795 lines of code (P6: far under 4,000).

Size (session_013jCD29K2Ak5HWZGMPQjE64): test runs 16, module lines 795

## J1 · REPORT

**To route to events (T36-14, running now): its `neighbours` (R35) is too slow for R20's proving test, at the interface.** Measured on `job/T36/explore` over events' own test world (`test/m/events/fixture.mjs`, node:sqlite), one member with 4,000 `vote` events as `voted`:
- one call `neighbours({node: member, kinds: ["event_voted"], at: 2025 EDTF, page: 0})` takes **4.6–4.7 s** (repeatable; `event_decider` on the same node 47 ms; a vote node 5 ms). About 1.15 ms per row: some 15 queries per participant row (top: the entities resolution window query 0.34 ms each, `event_attestations WHERE event_id=? AND serves='event'` and the `event_choices` join ~0.09 ms each, the viewer gate, `resolutions`, `event_when_cache`). `validAt` is 19 ms for all 4,000.
- `owner.mjs` builds every row of the node's whole set with its grades and evidence on **every page**, then slices it (lines 95–99). With T36-14's per-kind bound, a 4,000-vote member is four pages of 1,000, so about 4 × 4.7 s ≈ 19 s for that one node: M-X1a through events' real owner (R20's proving test, K1726's measure) cannot answer within `time_budget_ms` 10,000 as events stands. My arm (`test/m/explore/mx1a-events.test.mjs`) is written and waits on T36-14's merge.
- Suggested in events' own job (its choice): count the per-kind set first from the participant rows (cheap: role and visibility only), then build grades and evidence only for the page's slice; and compute the participant entity's end grade (`resolutionGrade(p.entity_id, x)`) once per call where the node is that entity. That brings the member's read to roughly one set's cost, not four.
- Also for events: a kind not asked still costs a full participant scan (`SELECT *` of the node's participants, filtered in JS), 47 ms at 4,000; explore's R20 re-asks a hub once per kind asked (up to events' ~23 kinds), so filtering `role` in SQL keeps those re-asks cheap. Not blocking.

explore's own state: R5 (each kind read whole within `hubBoundOf`) and R20 (a hub answer to a several-kind call re-asked kind by kind) are built and tested over fixture owners (4,000 votes: 4,262 ms of 10,000; 4,001: hub for votes alone, the member's other kinds walked). If events' read stays as it is, the real-owner arm will fail its budget and I will post BLOCKED (tests); nothing in explore can lower an owner's per-call cost.
