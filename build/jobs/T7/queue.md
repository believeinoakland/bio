# queue (T7)

**Status** · session_01XoUuJXLYkVnbwhHrHRxBqE · depth 2 · WORKING · handled B4

## J1 · QUESTION

Five points; I carry on meanwhile on the best reading of each. Already doing now, needing no answer: N114 (`QUEUE_CONDITION_KINDS` re-exported from observation-log's `CONDITION_KINDS`, meeting R5) and N112's unused `enteredAfterFirstRow` import (a pure removal from legacy-store).

**Q1 · Coverage for a job that does not extract.** The coverage check wants all 40 live ids named under `bio-plane/test/m/queue/` by tests that check full compliance. Almost all of the behaviour (R6–R40) is still in `store.mjs`, which node cannot import. It can only be driven through Miniflare, and that would mean writing the whole feed's test suite in this job. **Best reading:** I name by test only the ids whose code is in my paths after this job: R1–R5 (`queuestate.mjs`), plus the share of R9, R12 and R16 that N107 moves into `src/queue/`. I record the coverage failure for the rest as expected until queue extracts, not as a reason to withhold COMPLETE. The alternative is Miniflare-driven tests for all 40, about a day's work.

**Q2 · N107's wording needs catalogue and R9 text.** `cardinality_exceeded` appears only in `proposalsFeed`'s `instances[]` (progressions R31). R1 does not catalogue the kind, so the mint (R11) would refuse it `NO_SUCH_KIND`. **Proposed fold:**
- R1 gains the FINDING kind `cardinality_exceeded`: "a stage declared to hold at most one document holds more; a finding, which decides nothing about which belongs".
- R9 adds: per (progression, stage) with an open `cardinality_exceeded` finding, the finding joins that stage's proposal item when there is one. The item keeps its kind, `basis.kinds` gains the kind, and the detail names the count. Otherwise it is an item of kind `cardinality_exceeded` in its own wording ("holds more documents than it is declared to hold"). It is keyed `FINDING::<progression>::<stage>` like the proposal, so one decision (one `proposal_dispositions` key) governs one item (R32). Its `prior_disposition` comes from `dispositions[]`, and its grade is the weakest instance's (`connections.weakerGrade`).
- **Built as:** the proposals producer moves from `store.mjs` into `bio-plane/src/queue/` as a function the store calls (§12.2 rewire, a net removal), and gets tested there.

**Q3 · N112's two reads have no provider service.** `#counts` reads `bundles_fts`, `selections` and `selection_items` (retrieval) and `bias_statements` and `bias_adoptions` (bias). `#obligationsBiasDebt` reads `bias_debts`. Neither retrieval's nor bias's Provides has a service that answers these. The ownership check lets an added legacy line import only from queue's own paths, so queue cannot rewire the store to either module until they provide one. **Proposed:**
- retrieval `counts(hid)` → `{indexed, selections, selectionItems}` and bias `counts(hid)` → `{biasStatements, biasAdoptions}`, as run-productions' `counts(hid)` already does.
- bias `uncleared({gate, limit})` → the uncleared debts with their recipients, newest first.
- These go to `next.md` for retrieval and bias. Queue rewires once they exist.
- **Best reading:** leave both reads as they are in this job.

**Q4 · REEVALUATION #1 J2.2 needs requirements and a uses edge.** R14's notices need a new kind, a producer from `reevaluationOf(ctx).notices(...)`, and an ADOPT/KEEP door calling `adoptVersion` and `keepVersion`. That is a new kind in R1, a new producer in R9, and new disposition text in R12. Queue's `uses` has no `reevaluation`, so the architecture check would refuse the import. **Proposed:**
- A FINDING kind `newer-capture-affects-reference`, member-mutable like every FINDING.
- One item per open notice the member holds, homed under the holder's ancestors.
- Its disposition is `available: true` with `scope: notice`, `acts: [versionadopt, versionkeep]` and `requires: [notice]`.
- `reevaluation` joins queue's uses.
- **Best reading:** I build nothing of it until you fold it.

**Q5 · INTENT #1 J4.6 needs requirements and a uses edge.** `objective-gap` is catalogued (R1), but R9 names no producer for it, and `intent` is not in queue's uses. `gaps({project, viewer})` is per project, so the feed needs a bound on the projects it asks. **Proposed:**
- R9 gains: `objective-gap`, one per gap of each project the viewer sees in which the member participates (every visible project when there is no member), at most 50 projects, homed under that project.
- The kind's disposition is the project-scoped one (R12).
- `intent` joins queue's uses.
- **Best reading:** as for Q4, nothing until you fold it.

## Completion (QUEUE #1)

**Entries applied** (B1–B4; K209):
- **N107.** `bio-plane/src/queue/proposals.mjs` (new): `proposalFindingItems(feed, {subjectsOf, homesOf, optionsOf, subjectsMax})`, the FINDING producer over `progressions.proposalsFeed`, moved out of legacy-store's `queueFeed` (§12.2: the store now calls it; the gate SQL, `#queueAncestors` and `#queueOptions` are passed in as the caller's). It aggregates progressions R31's `cardinality_exceeded` findings from `instances[]` one per (progression, stage), as R9 now states (K209). Where the stage has a proposal item, the finding joins it: the kind stays, `basis.kinds` gains `cardinality_exceeded`, `basis.cardinality_exceeded` holds `{n, cardinality, document_count, grade}`, and the detail names the count. Otherwise it is its own item of kind `cardinality_exceeded`, worded "holds more documents than it is declared to hold". Either way it is keyed `FINDING::<progression>::<stage>`, with its `prior_disposition` taken from `dispositions[]` and the weakest instance's grade (`connections.weakerGrade`). R1: `cardinality_exceeded` is catalogued as a FINDING in `queuestate.mjs`.
- **N112 (queue's share).** Removed legacy-store's unused `enteredAfterFirstRow` import and its orphaned comment. `#counts` and `#obligationsBiasDebt` stay as they are (Q3): their provider services are N171, and queue rewires to them afterwards.
- **N114.** `QUEUE_CONDITION_KINDS` is now observation-log's `CONDITION_KINDS`, imported and re-exported under R5's one name; queue's copy is deleted, which meets R5. The object is the same one, not a copy. It is re-exported only under that name, because a second name was harvested by the DEC-49 guard's arm E as a 23rd vocabulary.
- **Forwarded items.** REEVALUATION #1 J2.2 and INTENT #1 J4.6 are not built (B4: N172, queue's extraction). RUN-PRODUCTIONS #1 J2.6 and AI-RUNS #2 J6.5 are left for that job (B3).

**Improvement made in moving.** A stage declared without a label was worded `'null'` in the item's summary and detail. It is now named by its key.

**Deferred**, per B4:
- Coverage for R6–R8, R10, R11, R13–R15, R17–R31 (bar R26's classing), R34–R40: that feed is still in legacy-store and is owed by queue's extraction job (N173). The ids named here are R1–R5, and N107's share of R9, R12, R16, R32 and R33. R32 and R33 are checked only for this producer's items.
- N112's two reads: N171.
- Q4 and Q5: N172.

**Found in other modules:** REPORT J3.

**Tests and checks** (on `job/T7/queue`, the tranche merged at `1c78e949e6`):
- `node --test bio-plane/test/m/queue/`: tests 10, pass 10, fail 0.
- `node --test bio-plane/test/m/`: tests 1754, pass 1750, fail 1, todo 3. The one fail is connections' R24/K155 arm (N131), red on the base.
- Legacy suites, base (`tranche/T7`) against head:
  - The same 15 suites (`queue`, `proposedispose`, `d552-instance-disposition`, `queue-state`, `queue-conditions`, `current`, `d125-findingmute`, `d266scope`, `exportnotice`, `leadslug`, `d86-bias-debt`, `severedhomes`, `observation-log`, `observation-content`, `airun`) give identical PASS/FAIL counts on both. Most queue suites die on intent's `NO_OBJECTIVE` (K207; legacy-tests').
  - With that fixture given an objective in scratch copies only (`surfacing-run.mjs`, `queue.test.mjs`): `queue` 36/0 and `d125-findingmute` 42/0 on both base and head.
- `civicos-ui/check-refusal-codes.mjs`: base 145 failures, head 146. The one new failure is arm E's `vocabularyTerms` ratchet at 113 → 114, the catalogued `cardinality_exceeded` term (REPORT J3.2).
- `node checks/format.mjs`: 69 modules, 64 requirements files; 0 failures.
- `node checks/architecture.mjs … queue`: 4 product files, 9 relative imports; 0 failures.
- `node checks/coverage.mjs … queue`: 10 of 40 live ids named; 1 failure, the deferred ids above (B4).
- `node checks/ownership.mjs … queue tranche/T7`: legacy-store 9 lines added, 61 removed; legacy-checks and legacy-index 0; 0 failures.
- The 9 ADDED lines, for BOB's review: the import of `proposalFindingItems` (store.mjs 233), and the call at 12130–12137, which passes the gate SQL (moved, unchanged), `#queueAncestors`, `#queueOptions` and `QUEUE_OPTION_SUBJECTS_MAX`, then `items.push(...proposalItems)`.

Size (session_01XoUuJXLYkVnbwhHrHRxBqE): test runs 60, module lines 459
