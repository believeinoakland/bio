# BOB to action-grammar (T45)

**Read** · handled J3

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T45), layer 9, action-grammar: T45-25 (N858, N861, N879, N880, N882–N884, N892 (b)): Purpose; R2, R5, R7, R8, R9, R11 amended; R15–R25 · `draft-T45-grammar.md` §1. Read also K2780, K2781, K2787 (their lines in `build/rulings.md`), `docs/architecture/BIO_Action_v0_2.md` (the rules your ids cite), the plan's reconciliation (R1–R21) where it names your module, and the draft section the plan entry names.
Your requirements: `build/requirements/action-grammar.md` (read whole). Marked `*(not yet met: T45)*`: R2, R5, R7, R8, R15, R16, R17, R18, R19, R20, R21, R22, R23, R24, R25, R9, R11.
Your merge clears plan rule 4 (7)'s `grammar.test.mjs` "R1, R11: actionKinds(view)" red (the test profile grew, `jurisdictions` R84): make it green here.

Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); every refusal a control. A new refusal row goes in your module's existing family; ask BOB before opening a new one.
Inherited reds: the plan's "Rules at the opening" rule 4 as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 346 KB with your tests, under the 600 KB limit: read it all whole.
Merge order in L9: conformance, consequences, action-grammar, action-holds, actions, action-clocks, action-replies, filing-templates, filings, escalation, action-plans, plan-work.

## B2 · CHANGE

R9 re-worded (K2845): action-holds' codes are its own family C-149 and action-replies' C-150; none of them is a C-117 row, so do not mint C-117 rows for HOLD_PLACE_REFUSED, MACHINE_CANNOT_SEND, HOLD_NOT_IN_PLACE or the six action-replies codes. The moved hold rows (the hold share of C-117.14–.25) stay while actions mints them; I will send a CHANGE retiring them at actions' merge. Merge tranche/T45 before continuing.

## B3 · CHANGE

K2849 (merge tranche/T45 first; R8, R15, R22 re-worded): (a) the record's bytes hold flat keys, the parser reading no nested map: on an entry office_words, office_status (token), found_elsewhere (kind token), found_elsewhere_note; premise_override's reason, ground_kind, ground_citation, ground_date | ground_what, ground_when (actions presents {ground, reason} and hands it to overrideGroundFindings); the press holder as text holder: "<name>". entryFieldFindings reads the flat keys. (b) Rows for the codes actions mints, all where src/actions/index.mjs: DETERMINATION_NOT_NONCOMPLIANT '#breachRefusal > is-breach-not-noncompliant'; OVERRIDE_NO_GROUND, OVERRIDE_GROUND_REFUSED '#overrideAndAddressee > is-override-ground'; MACHINE_CANNOT_SET_PARTNERS / _PRESS_TERMS / _REPLY_OWED '#t45Fields > is-machine-set-partners' / '-press-terms' / '-reply-owed'; PARTNERS_REFUSED (entity arm) '#t45Fields > is-partners-entity'; FOLLOWS_ACTION_REWRITTEN '#t45Fields > is-follows-action-rewritten'; RECEIPT_NOT_ON_SENT 'actionReceipt > is-receipt-on-sent'; NO_REPLY_OWED 'actionCorrespond > is-no-reply-owed'; STAGE_NOT_IN_LAW 'actionCorrespond > is-stage-in-law'; MACHINE_CANNOT_SET_SCOPE, SCOPE_NO_REASON, SCOPE_UNCHANGED 'actionScope > is-scope'; MACHINE_CANNOT_RECORD_PROMISE, PROMISE_REFUSED 'actionPromise > is-promise'. (c) a new row MACHINE_CANNOT_SET_COPIED ('#t45Fields > is-machine-set-copied'). (d) re-word C-117.19's translation: PREMISE_OVERRIDE_REFUSED is the reason's refusal; the ground's are R15's codes. (e) the basis grammar accepts a rests_on target SUC-<year>-<4 digits> (consequences' success record, K2845), until record-grammar registers the prefix (N911).

## B4 · CHANGE

actions (T45-27) is merged (K2859); its copy of the hold code is deleted. As planned (K2845): (1) retire the moved hold rows (C-117.17, .18, .20, .21, .23–.25, numbers never reused; action-holds' C-149 holds them now); (2) R22 now refuses a quotation mark, backslash or line break in office_words (OFFICE_STATUS_WITHOUT_OUTCOME) and found_elsewhere_note (FOUND_ELSEWHERE_REFUSED): the bytes cannot hold them; (3) REPLY_OWED_REFUSED for a missing reply_owed_reason has a second minting site in actions: export a finding for it so actions answers through you (one code, one site, K231), and tell me if actions must change. Merge tranche/T45, re-run, post COMPLETE.
