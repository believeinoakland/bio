# plan-work (T45)

**Status** · session_01KvuonAaLKfAEaHnozQTt17 · depth 2 · WORKING · handled B3

## J1 · QUESTION

Seven points the requirements leave open. I am building on the reading given for each and carry on; none stops the job.

1. **R10's run, its open arguments.** `ai-runs.open` needs `run`, `principalPlane`, `principalClaude`, `skillVersion` and `bounds`; nothing names them for a re-examination. Reading: `run` = `RXM-<day>-<12 hex of sha256(plan|response)>`; `principalPlane` and `principalClaude` = the recording member (`member:<id>`, also `actor` and `viewer`), so ai-runs R52 picks the project's account first, else hers; `skillVersion` a constant here, `"planning@1"` (`REEXAM_SKILL`); `bounds` `[{proposals: 20}, {wallclock: 600000}]` (fetches and subsessions 0, R46). Any refusal (mode not deployed, no account, `AI_RUN_REEXAM_OPEN`) is kept in the re-examination's record and never undoes the marks or the entry. "Where AI is enabled" = `open` does not refuse.
2. **R43's mark shape** (action-plans not yet merged). Reading: `planMark({plan, marks, cause})`, each mark `{kind, why, ...}` with `kind` one of `premise_changed` (`option`), `date_changed` (`option`, `date`), `phase_started` (`scenario`, `phase`), `next_route` (`guide`, `route`, `citation`, `after`), `chance_to_fix` (`subject`); `cause` `{response: "<action>#<ord>", action, ord, at}`. I adopt action-plans' names at its merge.
3. **R1's text.** `PLAN_NO_REASON` is action-plans' (C-124, its `refuseReason`, max 500). Reading: R1 answers through `refuseReason` and states `max: 1000` beside it; no second minting site.
4. **Texts R4, R5, R6, R8 name no code** (review entry 1–4,000, preparation item, comment 1–4,000, report 1–8,000). Reading: one C-151 row, `PLAN_WORK_TEXT_REFUSED`, with `field` and `max`; a preparation item's text 1–500 (action-plans R4's rule), a target date `YYYY-MM-DD` else the same row.
5. **R11's item.** Reading: `{kind: "clock", action, entry}`, `{kind: "checkpoint", plan, scenario, phase}`, `{kind: "escalation_stage", escalation, stage}`, `{kind: "hold", target, ord?}` or `{kind: "hold", project}`; visible when its owner's read answers it to the member (actions, action-plans, escalation `proposed`, action-holds `holdsOf`). A take-up records `{item, by, at, target?}`, appended; `takeUpsFor` lists them oldest first with `cursor`.
6. **`OPTION_KEY_REFUSED`** (R5, R11) is action-plans' (`refuseKeys`). Reading: answered through `refuseKeys`, with `keys: ["for"]` when `for` names another member; `for` naming the author herself lands.
7. **Who may act; a closed plan.** Reading: any member who sees the plan (`action-plans.planRead` answers her) acts; no joined fence, since R1 lists none. Every write here refuses `PLAN_CLOSED` (through `action-plans`' own answer) on a closed plan; a paused plan takes every act (action-plans R40). R4's rhythm zone: the `zone` given, else `actions.place()`'s; none is `REVIEW_RHYTHM_REFUSED`.
