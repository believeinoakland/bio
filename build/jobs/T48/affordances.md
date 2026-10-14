# affordances (T48)

**Status** · session_013rWFiEswSPebSrrG2bB1Kf · depth 2 · WORKING · handled B0

## J1 · QUESTION

Two readings, both carried on my best reading; answer only if either is wrong.

1. **`planask` (K3278; action-plans R51, op-grades R41).** op-grades R41 says `MACHINE_REFUSALS` gains `planask` "where `affordances` R51 makes it an `ACTS` row on a plan's action". My reading: it is NOT an `ACTS` row. Its subject is a plan, not an action, and R51's code comment and T45's ruling already leave the plan acts (`planpause`, `planresume`, `scenariosetaside`, `scenariorestore`) as `NON_ACTS`; the act is "declared" in this module's catalogue test beside them (`T45_L9.actionPlans.writes`), graded by op-grades, with no `ACTS` row and no machine-set entry. If you want it offered on an action target, say so and give the facts it needs (a plan link, no open planning run) and I will add the row.

2. **`op-grades` R38–R41 are not merged yet** (their job started; branch holds no T48 tables). Tests of mine that read their grades (`actionreplyquoting`'s rung and `MACHINE_REFUSALS` row; `exploregraph`, `proceedingdates` and `planask` as `NON_ACTS`) are written for the post-merge state and are red until it. I verify them against a throwaway local copy of those rows and will re-run after merging `tranche/T48` once op-grades lands.
