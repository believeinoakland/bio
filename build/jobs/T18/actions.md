# actions (T18)

**Status** · session_01GDJca1oCWXbx9GUtgd2bh9 · depth 2 · WAITING ON BOB (CHANGE) · handled B3

## Progress

**N-A4 applied** (on the readings BOB adopted, B2, K700), commit "actions (T18 N-A4)" on `job/T18/actions`:
- R7 `completed`: `RESOLUTIONS` moved from the catalogue into `src/actions/checks.mjs` with `completed`; the catalogue's copy and its comment deleted (`bio-checks.mjs`, 27 lines removed, none added); C-33.3's and C-101.4's translations name it. *Meets R7's mark.*
- R8 the premise override: `premise_override: {reason}` stands in for the determination on the write that first sets `breach: true`, by a member (`MACHINE_CANNOT_OVERRIDE`); edited, removed or added later, `PREMISE_OVERRIDE_REWRITTEN`; malformed, `PREMISE_OVERRIDE_REFUSED`; stamped who and when once in `action_overrides`; read as `{reason, by, at, says}`. *Meets R8's mark.*
- R9 the addressee's arms (office, press, organisation, group, audience, undetermined), each finding naming its arm; `counterpartyName` "role, organisation" for the named non-office arms, none for an audience; `ADDRESSEE_NOT_AN_OFFICE` for a breach action. *Meets R9's "arms beyond an office"; the person arm of `entity_id` stays deferred (needs the entities registry, not in this module's uses).*
- R45 `contact` (`MACHINE_CANNOT_SET_CONTACT`, `CONTACT_NOT_A_MEMBER` through membership R68); R46 `plan`/`option` (`PLAN_LINK_REWRITTEN`, `PLAN_LINK_REFUSED`); R47 `actionCreate` and the ops `actioncreate`, `action`, `actions`; R48 pressure (`actionCorrespond`'s `pressure`, `actionPressure`, `op=actionpressure`, `action_pressure`, the read's `pressure`, `actionsFor({pressure: true})`); R49 met by the absence of any grade check, tested. *Meets R45–R49's marks.*
- Converts: `risk-tier` (R40's full table; R37/R7 the tier arm for 9 and `unknown`; R25/R12 a stated undetermined tier; the D-505 union arms) and `d526-refusal-order` (R2 with no envelope type), in `test/m/actions/t18.test.mjs`.

**Rows `awaiting stamp` (T19's promotion job):** C-33.3, C-101.3, C-101.4 (translations changed); C-117.7 `ADDRESSEE_NOT_AN_OFFICE`, C-117.8 `MACHINE_CANNOT_OVERRIDE`, C-117.9 `PREMISE_OVERRIDE_REWRITTEN`, C-117.10 `MACHINE_CANNOT_SET_CONTACT`, C-117.11 `CONTACT_NOT_A_MEMBER`, C-117.12 `PLAN_LINK_REWRITTEN`, C-117.13 `PLAN_LINK_REFUSED`, C-117.14 `MACHINE_CANNOT_MARK_PRESSURE`, C-117.15 `PRESSURE_REFUSED`, C-117.16 `PRESSURE_NOT_RECEIVED`, C-117.17 `PRESSURE_MARKED`, C-117.18 `PRESSURE_NO_ENTRY`, C-117.19 `PREMISE_OVERRIDE_REFUSED` (new).

**Not yet done:** the split's deletion (J1 item 1), waiting for BOB's CHANGE saying action-clocks has merged.

**Tests and checks so far:** `node --test test/m/actions/` 61 pass, 0 fail. Users' tests (`affordances`, `escalation`, `filings`, `instance-setup`, `monitoring`, `control-plane`): 386, 375 pass, 5 fail, the same 5 failing on `tranche/T18` without this change (filings R11, R15 ×2, R21: the publication split's re-points accepted red by K651; control-plane R36: N419). Checks: format 0 failures; architecture 0 failures; coverage 46 of 46 live ids named; ownership 0 failures (legacy-checks 0 added, 27 removed).

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

## J2 · REPORT

N-A4 is applied and pushed on job/T18/actions (readings as adopted, B2): R7 completed, R8 premise override, R9 addressee arms and ADDRESSEE_NOT_AN_OFFICE, R45 contact, R46 plan link, R47 actionCreate with op=actioncreate/action/actions, R48 pressure with op=actionpressure, R49; converts risk-tier and d526-refusal-order. Marks met: R7, R8, R9 (but the entity_id person arm, still deferred), R45-R49. Tests 61/61; users' tests 375/386, the 5 failing also fail on tranche/T18 without this change (filings R11, R15 x2, R21 per K651; control-plane R36, N419). Checks: format, architecture, coverage (46/46), ownership all clean. Rows awaiting stamp are listed in my record. The services filings and later jobs need are done; only the split's deletion remains, waiting for your CHANGE that action-clocks has merged. If you would rather merge me now for filings and take the deletion as a CHANGE afterwards, say so.
