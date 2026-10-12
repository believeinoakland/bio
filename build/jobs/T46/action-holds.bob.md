# BOB to action-holds (T46)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T46), layer 9, action-holds: T46-33 · (N929) R5: `actionHoldRelease` where no hold stands refused `HOLD_NOT_IN_PLACE`; (N913) `HOLD_PLACE_REFUSED`, `MACHINE_CANNOT_SEND`, `HOLD_NOT_IN_PLACE` re-worded · text BOB's; words.json.
Your requirements: `build/requirements/action-holds.md` (read whole). Marked `*(not yet met: T46)*`: R14, R15 (folded K2959, rulings K2953).
`HOLD_NOT_IN_PLACE` and `HOLD_PLACE_REFUSED` keep their translations (R15, K2953); filings relays them unchanged.
Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); every refusal a control. N913 re-wordings read words by key from `refusal.<CODE>`, changing no code, number or `where`; the rows your requirements keep are not re-worded.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START, and those named in K2924–K2963; none is yours unless named here.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 588 KB with your tests (K2700), under the 600 KB limit; read it whole.
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950).
Merge order in L9: conformance, consequences, action-grammar, actions, action-holds, action-clocks, action-replies, filing-templates, filings, escalation, action-plans, plan-work; a job that uses an L9 job's new service merges `tranche/T46` when BOB announces that merge (a CHANGE); each that uses no unmerged L9 job merges as soon as it is complete.

## B2 · CHANGE

CHANGE (K2981), re-opening the job. Your J1 REPORT is confirmed and settled in this module: R14 is retired. It reversed R5's "an entry with no hold stated may be released", which carries DEC-113's "or never needed to" (Bob's design stream), and broke the litigation-hold to-do's "Record that no hold is needed" door. Merge `tranche/T46` to read the retired R14.
- Undo R14's behaviour: a release at a place where no hold was ever placed is accepted again, as R5 states (the statement that none was needed); a place whose latest statement is `released` is still refused `HOLD_ALREADY_RELEASED`.
- Keep `holdNotInPlace` as `HOLD_NOT_IN_PLACE`'s one minter for its other callers; keep your re-worded fixed `detail` only if it is true of every arm that still answers it.
- R15 stands as you built it.
- Tests: R14's tests go (a retired id is named by no test); R5's control that a release where no hold stands lands, with its restarts, comes back.
Then record completion again.

## B3 · CHANGE

CHANGE (K2984): action-grammar (T46-31), filing-templates (T46-36) and actions (T46-32: R98, a timed clock entry moved pending to overdue once its instant passes, `dueInstant` exported; R99) are merged into `tranche/T46`, as are conformance and consequences (K2980, K2983). Merge `tranche/T46` into your branch before you complete, re-run your tests on it, and name in your record any red it opens.
