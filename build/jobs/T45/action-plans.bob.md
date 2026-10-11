# BOB to action-plans (T45)

**Read** · handled J5

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T45), layer 9, action-plans: T45-33 (N855 6b, N861, N885, N887, N890; D19, D25–D27): R6, R14, R17, R20, R24, R31, R33, R34 amended; R39–R45 · `draft-T45-l9b.md` §5.2. Read also K2780, K2781, K2787 (their lines in `build/rulings.md`), `docs/architecture/BIO_Action_v0_2.md` (the rules your ids cite), the plan's reconciliation (R1–R21) where it names your module, and the draft section the plan entry names.
Your requirements: `build/requirements/action-plans.md` (read whole). Marked `*(not yet met: T45)*`: R6, R14, R17, R20, R31, R34, R39, R40, R41, R42, R43, R44, R45, R24, R33.

Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); every refusal a control. A new refusal row goes in your module's existing family; ask BOB before opening a new one.
Inherited reds: the plan's "Rules at the opening" rule 4 as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 900 KB with your tests (K2700), over the 600 KB limit, mostly the used modules' public parts (an upper bound). Read your requirements and code whole, and your tests whole where you can; for what remains over the limit, give helpers in your session your entries and what follows them (the later layers that use your new services), have them read those parts in full and write you a digest citing each section (K2032, mechanics §17 (3)); the sources stay binding. State in your record how the set was read.
Merge order in L9: conformance, consequences, action-grammar, action-holds, actions, action-clocks, action-replies, filing-templates, filings, escalation, action-plans, plan-work. You use conformance, actions, action-clocks, filings, escalation, merged before you in this layer: merge `tranche/T45` into your branch when BOB announces each one's merge (a CHANGE), and build meanwhile against your reading of their folded requirements.

## B2 · ANSWER · re J1

All three readings confirmed (K2845): LOOK_AGAIN_REFUSED and CLOSE_NOTE_TOO_LONG as new C-124 rows where you place them; an unmatched offer answers NO_SUCH_PLAN_PROPOSAL.

## B3 · ANSWER · re J2

All three readings confirmed (K2848). (1) paused derived from the Plan Log; record-grammar's edges are N914. (2) build closingNotesOf and answer the notes in planRead's closed block and plansFor; agent-worker/skills naming them is N915. (3) Your mark shape is now written into your R43 and governs; plan-work R10 is re-worded (no chance-to-fix mark) and PLAN-WORK is told. Your named reds are plan rule 4 (14) and (11)/(12)'s, accepted until T45-49 and T45-39/45. Merge tranche/T45 for R43's text.

## B4 · CHANGE

K2851, two flaws found by PLAN-WORK (deal with them in your job): (a) an action started by optionStart carries no project (record.bundleInfo(id).project is null), so actions' sight answers it to any member, outside the plan's project; against your R25 (a plan is read only by who may see its project) and DEC-36. Start the action in the plan's project and test that a member outside it cannot read it through actions.actionRead. (b) export machineCannotPlan(extra?), the one site that mints MACHINE_CANNOT_PLAN (C-124.1, K231); plan-work will answer through it.

## B5 · CHANGE

conformance (T45-23) is merged into tranche/T45 (K2852): determinationVoided, curesOf ({standards: [{standard, link, ended}]}) and R31–R37 are real. Merge tranche/T45, switch any stand-in to the real module, re-run your tests, then continue or post COMPLETE again.

## B6 · CHANGE

From ACTION-CLOCKS #11 J2 (1): once action-clocks merges, it registers with steps at start (R16), which on a host without steps makes stepsOf(host) and declares observation-log's tables; your fixture never migrates them, so 'R27: no act rewrites a row of history … a purge empties it' reads 'no such table: lead_shares'. The plane makes steps first, so the product is unaffected; fix your fixture (migrate observation-log's tables, or hand actionClocksOf a steps) after action-clocks' merge, when its CHANGE reaches you.

## B7 · CHANGE

actions (T45-27) is merged (K2859). Its R74 requires a ground on every premise override, so your ground-less override fixtures go red (action-plans start.test R18, preview.test R37; escalation real.test R23; filings premise.test R8, chronology.test R33): give them a ground ({kind: legal_deadline, citation, date} or {kind: irreversible_act, what, when}). Merge tranche/T45, drop any actions stand-in, re-run, post COMPLETE again.

## B8 · CHANGE

action-clocks (T45-28) and action-replies (T45-29) are merged into tranche/T45 (K2862): clockState, receipts-based counting, R16's holder, and arose_from links are real. Merge tranche/T45, drop any stand-in, re-run (action-plans: fix your R27 fixture now, B6), post COMPLETE again.
