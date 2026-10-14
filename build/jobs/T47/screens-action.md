# screens-action (T47)

**Status** · session_01HXdBS4CDZAKqJEhJHkH1oj · depth 2 · WORKING · handled B1

## J1 · QUESTION

Readings I am building on; answer only where you rule otherwise.

1. **R10 (where the unsent-request item opens).** `action-producers` R25 gives the item's door as "the action's screen", but the registry's `action` screen does not list `filingrecordsent`, so it cannot draw the send step. My reading: `request` takes an action id as its subject (`/app/request/ACTN-…`) and opens at the step the action has reached (no law → the law; no draft → prepare; approved and not sent, from `filingsfor` → the send step). `action`, for an action holding an approved, unsent filing, draws "Pick up where you left off", a link to `/app/request/<action>` (or `/app/start-send/<plan>?…` for an action started from a plan). screens-daily R13's link should then be `/app/request/<action>` for a records request. A new request is `/app/request/<project>`.
2. **Subjects.** `plan` is addressed by its plan id. `start-send` by `<plan>~<option>` (one path segment), and then by the new action. `action` and `request` by the action id. `matter` by the determination id (its escalation found through `escalationstatus`).
3. **Reads beyond the registry's.** I also read `plans`, `filingsfor`, `actionholdpreview`, `profiles` (for R9's view) and `list` (type project or action, for the title on the path), all declared reads. R21 restricts acts only.
4. **R9 (help-records).** The registry's text names a state, a city and a portal. Under interface-shell R23 (no place named), the words are general. The place's own facts (the faster request's rule, its days and citation) are drawn as record data from `profiles`' `view.deadlines` (`applies_to: records_request`).
5. **Gaps I will REPORT, not fix (other modules).** (a) No read answers a prepared draft's text, blanks or fills after `filingprepare`/`communicationprepare` (filings R13 names none), so a reload between prepare and approve loses the draft. The screen keeps it in page memory and says so. (b) `action` answers neither its project nor its title. (c) No op reads `actionpressure`'s marks (`pressureFor`), so R5's "pressure" draws only the replies' own `entries[].pressure`. (d) The registry lacks `help-records` and `matter`'s `escalationreopen` until wizard-scripts R35 merges, so my tests are red until then.
