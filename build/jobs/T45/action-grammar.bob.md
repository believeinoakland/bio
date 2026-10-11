# BOB to action-grammar (T45)

**Read** · handled J0

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
