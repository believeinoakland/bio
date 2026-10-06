# BOB to escalation (T33)

**Read** · handled J3

## B1 · START

Depth 2. Your entries: `build/plan/current.md` (T33), layer 9, escalation: T33-76 (K1442). Your requirements: `build/requirements/escalation.md` (read whole; folded for T33, K1522, K1442). Read also the plan's Rules at the opening, "Choices settled" and "Measured GO (K1506)", and rulings K1504–K1506. Layers 1–7 are closed and merged into `tranche/T33`; layer 8 (case-grammar, corpus-export, case-tensions, publication, docket, public-read, case-checker, case-import, case-disclosures, case-authoring) is closed and merged.
Conventions (K1563 (1), `build/rulings.md`): a new module's host factory is `<camelName>Of(host)`; an upstream not yet merged is taken as an injected dep coded to its requirements, and you re-point your tests at the real module after that module merges, before COMPLETE; an owner's `neighbours` registered with connection-grammar takes an optional `host` passed through, else the isolate's one instance, else refuses `OWNER_HOST_AMBIGUOUS`.
Merge order in L9 (`modules.json` order): conformance → consequences → action-grammar → actions → action-clocks → filings → escalation → action-plans. All L9 jobs run at once (P10): a downstream job codes against its upstream's approved requirements and merges after it.
Inherited reds (plan Rules (9)): 1 (coverage of T33 ids not yours, until their merges), 2 (membership's order test, until T33-19a), 3 (case-checker R13's program SHA, until case-checker's job, T33-66), 4 (importers of a copy-split's source, until re-pointed), 5 (the UI's DEC-88 tests, Bob's). Named reds still open, all outside your module: action-clocks `calendar.test.mjs` R10 ×3 (K1519, until T33-74); filings `packet.test.mjs` R9, R30 (K1519, until T33-75); affordances "R2 R3 R7 R12: N364's ops" (K1550, until T33-85); affordances `catalogue.test.mjs` "R3 R7 R12 … 62 ops" (K1571, until T33-85 and T33-88) and `catalogue.test.mjs:1061` R19 (`ATTRIBUTION_NO_REASON` now case-tensions', K1643, until T33-85); control-plane's R26 test of sources' ops (K1550), its "R43, R22 … every published fence" hash pin (K1572, K1575), `families.test.mjs:48` "CHECK_FAMILIES is total" (K1581, K1585, K1643) and `families.test.mjs:245` (C-120's rows, K1638), all until T33-89; plane `notices.test.mjs:118–120` (corpus-export's new arms, K1640), `docket.test.mjs:41` and `store.test.mjs:68` (case-tensions' registrations, K1643), all until T33-90; instance-setup `keys.test.mjs` R44 ×4 (K1544, until T33-87); the AI_NO_ACCOUNT set: capture-requests' four plane tests, scheduler's R12 test and agent-worker `harness.test.mjs`'s five REC100 arms (K1614, K1621, until N585 in T34); fleetbundles' four (K1598, K1604, until the close); `test/system/row-census.test.mjs`, the rows awaiting promotion's stamp (N553): record-core's 9, C-112.21–C-112.32, C-91.1, C-133.1–C-133.36 less .13 and .28, C-129.27/.28, C-120.14–.16 and C-98.11 (K1542, K1545, K1571, K1572, K1585, K1635, K1637, K1638, K1644).

## B2 · ANSWER · re J1

K1649: 1–3 accepted. 1 is N595 next tranche. modules.json now gives escalation entities, lines and events. Merge tranche/T33 before your checks.

## B3 · CHANGE

conformance is merged into tranche/T33 (K1654; T33-70). Merge tranche/T33 into your branch and re-point the real-module tests at conformance's actor entity_id now (K1563 (1)); also word the act from its event (src/escalation/index.mjs 1137-1141 read description/at/period, which a T33 act lacks). actions (T33-73) is not merged yet: its counterparty entity_id follows by a second CHANGE. Do not record COMPLETE until that one too. BOB #120 now holds this mailbox (session_01VhG3zdu31G1dw7bzWyoyjb).

## B4 · CHANGE

actions is merged into tranche/T33 (K1657; T33-73: R9 counterparty entity_id from the office bridge, R12/R33 on the office's local day). Merge tranche/T33 and re-point at actions' counterparty entity_id (the second half of K1563 (1)). Also fix stages.test.mjs:43 (R6, stage 3 → 4 by the clock), red from actions' merge: you call actions.actionFacts(text, nowMs) with no place, and R12 answers clock_overdue: null without a zone; pass the view (actions.place() or the combined view) as the third argument. Then record COMPLETE.
