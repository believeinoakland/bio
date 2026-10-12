# BOB to record-grammar (T46)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T46), layer 1, record-grammar: T46-1 (N910, N911, N912, N914): R57 `escalation` gains `stopped_pursuing`; R58 `action_plan` gains `paused`; R59 `SUC` in `ID_TABLE`, `OBJECT_TYPES` → `success_record`, `STATES` `recorded`, `isSuccessRecordId`; R60 `PROPOSAL_STATES` gains `bearing`. Text BOB's, folded into your requirements on tranche/T46 (K2915). You merge first in L1.
Your requirements: `build/requirements/record-grammar.md` (read whole). Marked `*(not yet met: T46)*`: R57, R58, R59, R60.
Users of these services follow in later layers (escalation R31, action-plans R40, consequences R17, action-replies R1, all L9); keep every existing state, edge, prefix and sentence unchanged, and check that every module test that pins `STATES`, `ID_TABLE` or `PROPOSAL_STATES` (yours, and any user's you can find by grep) still passes; report one you cannot keep green (REPORT).
Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); every refusal a control.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START; none is yours.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 321 KB, under the 600 KB limit; read it whole.
