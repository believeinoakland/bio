# plan-work (T47)

**Status** · session_0178ZGpF7DFhbLEP9pukeAin · depth 2 · WORKING · handled B0

## Completion (PLAN-WORK #3)

**Read.** My requirements whole (public and private); my code whole (`index.mjs`, `schema.mjs`, `checks.mjs`) and my tests whole (all nine files), read in full in this session itself, whose context window (1M tokens) holds the set, so no helper digest was needed (K2032, §17); the Purpose of each of the fifteen used modules; of their Provides, the services my entries touch: `record-grammar` R38, R61 (`proposalLabel`, the `status_report` table), `duties` R9, R13, R14, R31 (`transitionsOf`, `dutiesArisingIn`) and `civil-time` R1 (`localDay`); my plan entry (T47-44); `action-producers` R24's status line for R18's reader. No snapshot work is named by the entry.

**Entries applied (T47-44).**
- N956, R16: `ASSIST_LABEL` is now `record-grammar`'s `proposalLabel("class:ai", "status_report")` (its R61), the one site, in place of the interim label (K2978) and its own sentence. The label is no longer stored in the row: `statusReportSave` keeps `{draft: "assistant", as_of}` and the read (`fromOf`) attaches the one label, so a row kept under the interim label reads with R16's. A report written by the member alone (no `from`, or her own one line) carries no label.
- N966, R17: already met in code by T46's job (`nowMs` taken as `dutiesArisingIn`'s `asOf`, the module's clock when absent; `met_at` the first reading of the unbroken met/met_late run ending each occurrence's recorded transitions, the latest of those; `met_at: null` with `met_at_why` otherwise, absent when an instant or `all_met` false). New tests name R17 and check each clause and both controls.
- N968, R18: each `planReviewsDue` item also carries `recurrence` (`{rrule, dtstart, zone, by, at}`: the rhythm as the member set it, with who and when, from the rhythm's latest statement) and `since` (`{day, from}`: the local day, in the rhythm's zone through `civil-time.localDay`, of the plan's last review entry, `from: "review"`, else of the rhythm's setting, `from: "rhythm_set"`; `day` null only if civil-time cannot say). Other fields, order and "told once" unchanged.
- Own flaw fixed: `standingCure`'s comment sat above `reportItems`; moved to its function. `lawProposalState` is no longer imported.

**Deferred.** None.

**Found in other modules.** Generated artifact staled: the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`, `.bundle.json`), whose inputs include `src/plan-work/index.mjs` (regenerated at the layer close, §14). No flaw found in another module. `action-producers` (T47-50, R24) can now fill `queue.plan-review-due.detail`'s `{rhythm}` and `{date}` from R18's `recurrence` and `since.day`.

**Ran.** `node --test bio-plane/test/m/plan-work/`: tests 50, pass 50, fail 0. Users of my services (action-plans, following, action-producers, plane, run-rules, queue, skills action, actions t45, membership module-order, affordances, op-declarations, answer-envelope, op-grades, queue-producers): 75 failing tests, the identical set on the job branch before my change (compared by name); none new. Checks from the process repository: format 0 failures; architecture `plan-work` 0 failures; coverage `plan-work` 18 of 18 live ids named, 0 failures; ownership 5 files, 0 failures; `checks/run.mjs`: format 0, architecture 0 failures (3105 files), coverage 36 failures, none plan-work's, channels 0.

Size (session_0178ZGpF7DFhbLEP9pukeAin): test runs 4, module lines 1423
