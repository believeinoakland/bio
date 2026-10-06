# BOB to filings (T33)

**Read** · handled J2

## B1 · START

Depth 2. Your entries: `build/plan/current.md` (T33), layer 9, filings: T33-75 (K1494). Your requirements: `build/requirements/filings.md` (read whole; folded for T33, K1522, K1494). Read also the plan's Rules at the opening, "Choices settled" and "Measured GO (K1506)", and rulings K1504–K1506. Layers 1–7 are closed and merged into `tranche/T33`; layer 8 (case-grammar, corpus-export, case-tensions, publication, docket, public-read, case-checker, case-import, case-disclosures, case-authoring) is closed and merged.
Your own red to fix (K1519): `packet.test.mjs` R9, R30 read every `holidays` entry without `offices` as the office calendar; skip jurisdictions R47's closure lists (`list` set), which only a rule's `closures` names. Red from jurisdictions' merge until this job. `factStatus`'s days are now local days (K1581).
Conventions (K1563 (1), `build/rulings.md`): a new module's host factory is `<camelName>Of(host)`; an upstream not yet merged is taken as an injected dep coded to its requirements, and you re-point your tests at the real module after that module merges, before COMPLETE; an owner's `neighbours` registered with connection-grammar takes an optional `host` passed through, else the isolate's one instance, else refuses `OWNER_HOST_AMBIGUOUS`.
Merge order in L9 (`modules.json` order): conformance → consequences → action-grammar → actions → action-clocks → filings → escalation → action-plans. All L9 jobs run at once (P10): a downstream job codes against its upstream's approved requirements and merges after it.
Inherited reds (plan Rules (9)): 1 (coverage of T33 ids not yours, until their merges), 2 (membership's order test, until T33-19a), 3 (case-checker R13's program SHA, until case-checker's job, T33-66), 4 (importers of a copy-split's source, until re-pointed), 5 (the UI's DEC-88 tests, Bob's). Named reds still open, all outside your module: action-clocks `calendar.test.mjs` R10 ×3 (K1519, until T33-74); filings `packet.test.mjs` R9, R30 (K1519, until T33-75); affordances "R2 R3 R7 R12: N364's ops" (K1550, until T33-85); affordances `catalogue.test.mjs` "R3 R7 R12 … 62 ops" (K1571, until T33-85 and T33-88) and `catalogue.test.mjs:1061` R19 (`ATTRIBUTION_NO_REASON` now case-tensions', K1643, until T33-85); control-plane's R26 test of sources' ops (K1550), its "R43, R22 … every published fence" hash pin (K1572, K1575), `families.test.mjs:48` "CHECK_FAMILIES is total" (K1581, K1585, K1643) and `families.test.mjs:245` (C-120's rows, K1638), all until T33-89; plane `notices.test.mjs:118–120` (corpus-export's new arms, K1640), `docket.test.mjs:41` and `store.test.mjs:68` (case-tensions' registrations, K1643), all until T33-90; instance-setup `keys.test.mjs` R44 ×4 (K1544, until T33-87); the AI_NO_ACCOUNT set: capture-requests' four plane tests, scheduler's R12 test and agent-worker `harness.test.mjs`'s five REC100 arms (K1614, K1621, until N585 in T34); fleetbundles' four (K1598, K1604, until the close); `test/system/row-census.test.mjs`, the rows awaiting promotion's stamp (N553): record-core's 9, C-112.21–C-112.32, C-91.1, C-133.1–C-133.36 less .13 and .28, C-129.27/.28, C-120.14–.16 and C-98.11 (K1542, K1545, K1571, K1572, K1585, K1635, K1637, K1638, K1644).

## B2 · CHANGE

K1650, from ACTION-CLOCKS #7 J1 (9): action-clocks keeps computeDeadline's signature and its {date, start, why, calendar} answer, adding due, candidates, extension, observed, trace. For your tests: a starts: "filed" stand-in still reads the sent entry; a business count now needs the view's weekend (a bare {holidays} view is undetermined). action-clocks merges before you; code to this. action-grammar (T33-72) is merged into tranche/T33.

## B3 · ANSWER · re J1

K1653: modules.json gives filings events; merge tranche/T33. (3) is N602. A CHANGE follows when conformance and when action-clocks merge.

## B4 · CHANGE

conformance is merged into tranche/T33 (K1654; T33-70: R25 act = {event, actor: {role, body, entity_id?}, evidence}, R26 ACT- ids through events.eventForAct, R3 at the event's when). Merge tranche/T33 into your branch and re-point T33-75 at it: your determination fixture now refuses ACT_NO_EVENT (filings 0/60 on the tranche), and src/filings/index.mjs 402-404, 994, 1022-1025, 1056 read act.description/at/period, which a T33 act lacks (date: act.event.when; subject: the event). action-clocks' merge will follow by its own CHANGE. BOB #120 now holds this mailbox (session_01VhG3zdu31G1dw7bzWyoyjb).

## B5 · CHANGE

action-clocks is merged into tranche/T33 (K1658; T33-74: computeDeadline, now in count.mjs, keeps its signature and {date, start, why, calendar} answer, delegating to civil-time.evaluateRule; K1519's closure lists; R30's wait is over). consequences (K1655) and actions (K1657) are merged too. Merge tranche/T33 into your branch, finish T33-75 on conformance R25's act (B4) and action-clocks' deadlines, and record COMPLETE. You merge next; escalation and action-plans wait on you.
