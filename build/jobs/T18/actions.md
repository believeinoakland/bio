# actions (T18)

**Status** · session_01GDJca1oCWXbx9GUtgd2bh9 · depth 2 · WORKING · handled B2

## J1 · QUESTION

My readings, which I am building now; say if any is otherwise.

1. The split's deletion vs K625. The actions bullet says delete `pendingClocks` and its bounds and `PENDING_CLOCKS_BAD_BEFORE`'s row; the paragraph under "The actions split" and the deferral table ("actions' deletion of pendingClocks | d") say keep `pendingClocks` until monitoring re-points (layer 10). Reading: I KEEP `pendingClocks`, `PENDING_CLOCKS_MAX`/`_ACTIONS_MAX`, `PENDING_CLOCKS_BAD_BEFORE`'s row and the R31 tests (R31 is retired; the tests stay as the copy's guard until the next job deletes it), and DELETE `clockPropose`, `computeDeadline`, the `clock` subject of `proposalLabelFor`, the `action_clock_proposals` table and its name in `ACTIONS_TABLES`, and the R32/R35 test arms. The deletion waits for your CHANGE saying action-clocks merged; the N-A4 work goes ahead now.

2. R7 `completed`: `RESOLUTIONS` moves here from the catalogue (its only product importer is this module; `affordances` reads it from here), gaining `completed`; the catalogue's copy and its comment are deleted (§12.2, net removal). C-33.3's and C-101.4's translations name `completed`.

3. R8's override stamp: the document carries `premise_override: {reason}` (what action-plans R18 composes); who and when are stamped by this module at the write, in a table of its own (`action_overrides`, purged with the action), from the promotion's author and time, the first time the block lands, and shown in the read as `{reason, by, at}`. Stating it on a revision that does not first set `breach: true`, or changing/removing a held one, is `PREMISE_OVERRIDE_REWRITTEN`; a machine or unstamped author stating or changing one is `MACHINE_CANNOT_OVERRIDE` (asked first).

4. R9's `ADDRESSEE_NOT_AN_OFFICE`: a breach action whose counterparty is stated and is not an office (a non-office named arm, an audience, or undetermined) is refused; a breach action with no counterparty block lands, as R7 lets any draft (the audit reports it).

5. R45 `contact`: a member id, bare or as the `member:<id>` stamp, resolved through membership's `memberFacts` (its R68).

6. R46: `plan` must be a `PLN-` bundle id and `option` a short token; a malformed one is refused `PLAN_LINK_REFUSED` (a new row; the requirement names no code for it). Set on a revision (not held before), changed or removed: `PLAN_LINK_REWRITTEN`.

7. R48: a pressure mark, whether stated with `actionCorrespond` or later by `actionPressure`, is a row in this module's own table (`action_pressure`), never in the document's bytes (the catalogue's correspondence grammar is not touched). `actionPressure` also refuses a malformed mark (`PRESSURE_REFUSED`: kind outside the four, note empty, over 500 or unwritable) and an ord that names no entry (`PRESSURE_NO_ENTRY`); both new rows.

New rows take C-117.7 onward; each is named `awaiting stamp`.
