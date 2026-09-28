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
