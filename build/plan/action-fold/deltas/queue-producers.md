# queue-producers — the fold's changes

**Status** · Written by a worker for BOB #74, 2026-09-30, from `build/plan/action-design/deltas.md` §4, against `build/requirements/queue-producers.md` on `tranche/T17` (highest id R14). The design names these producers under `queue`; since the queue split (N363, K507, K531) every producer is this module's and `queue` only catalogues kinds and doors, so they land here (placement, BOB's). Ids final: **R15**, **R16**, **R17**. The fourth reminder the design names (a litigation hold, on a `pressure` mark of kind `legal`) is **not** folded: no act of the product is its door (`queue` R12, K607 name each OBLIGATION's door), DEC-61's hold has no operation, and an item nobody can dispose of breaks R12's contract; it waits for the hold's act (see `t18-entries.md`, "Not in T18"). The Status line gains: "Action layer folded 2026-09-30 (K608): R8 widened; R15–R17 added, not yet met."

Recipients follow Bob's notification rulings as the design words them (DEC-10, DEC-69, DEC-70): an item informs once at the occurrence, is dispositionable and ages; it goes to the member who authored the thing it concerns, else the project's owners (`membership` R65), else the administrators (`membership` R86); muting is personal; no reminder is detached from an act.

## Replacement

**R8** — in the current line, the opening

> - **R8** Answers every item R1–R7, R9 and R14 derive for this member and viewer,

becomes

> - **R8** Answers every item R1–R7, R9, R14 and R15–R17 derive for this member and viewer,

## Additions (under "The producers")

- **R15** (monitoring R34; K608) FINDINGs `action-clock-overdue`: one per clock entry `actions.overdueClocks` answers the viewer (its R50), keyed `FINDING::action-clock-overdue::<action>::<position>`, to the member who created the action, else its project's owners, else the administrators; its subject the action, its `basis` the entry's date, basis and text (R10), its `age` from the day after the entry's date. It leaves when the entry is `met` or `waived` or the action is `resolved` or `abandoned`. It is raised once per entry; nothing here re-notifies it (P-87). A counterparty's missed deadline is a fact about the world, so it is a FINDING, not a CONDITION (NOTIFICATIONS.md, "the three classes"). *(not yet met: new)*
- **R16** (`action-plans` R17; K608) OBLIGATIONs `plan-checkpoint-due`: one per checkpoint `action-plans.checkpointsDue` answers, keyed `OBLIGATION::plan-checkpoint-due::<plan>::<scenario>::<phase>`, to the member who set the scenario's current version, else the plan's project's owners, else the administrators; its subject the plan, its `age` from the checkpoint's day. It leaves when a member judges the checkpoint or closes the plan. It is never a FINDING or a CONDITION (`action-plans` R23). *(not yet met: new)*
- **R17** (monitoring R35, escalation R16; K608) OBLIGATIONs `escalation-stage-proposed`: one per (escalation, proposed edge) `escalation.escalationsDue` answers the viewer (its R16), keyed `OBLIGATION::escalation-stage-proposed::<escalation>::<to>`, to the member who opened the escalation, else its project's owners, else the administrators; its subject the escalation, its `age` from the trigger's instant (escalation R2, a fact of the record). It leaves when a member advances or declines the edge, or the escalation is suspended or ended. *(not yet met: new)*

## Uses (add)

> - `actions`: `overdueClocks` (its R50; R15).
> - `escalation`: `escalationsDue` (its R16; R17).
> - `action-plans`: `checkpointsDue` (its R17; R16).

Three new `uses` edges (`modules-and-layers.md`), all earlier in the order (layer 9 before layer 11).

## Satisfies (add)

> - `BIO_Action_v0_1.md` §4 rule 5 (members are told without being nagged; two kinds of time never mix).
