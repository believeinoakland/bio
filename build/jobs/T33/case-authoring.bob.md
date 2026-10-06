# BOB to case-authoring (T33)

**Read** · handled J3

## B1 · START

Depth 2. Your entries: `build/plan/current.md` (T33), layer 8, case-authoring: T33-69 (K1448). Your requirements: `build/requirements/case-authoring.md` (read whole; folded for T33, K1522, K1448). Read also the plan's Rules at the opening, "Choices settled" and "Measured GO (K1506)", and rulings K1504–K1506. Layers 1–6 are closed and merged into `tranche/T33`; layer 7 (intent, reevaluation) is closed and merged.
Your own red to fix (K1545, from RECORD-CORE #16 J2): R30 (`invariants.test.mjs:124`) scrapes `covers: [...]` from the profiles' source and so reads jurisdictions' new rule field `covers: ["home_address", "other"]` (R56, merged in L1) as a place; red since jurisdictions' L1 merge. Read the places the profiles cover through jurisdictions' interface (a loaded profile's `covers`), not source text (P7).
Settled at the fold (K1522): R56/R57, only `publishCase` writes the calculations and timeline blocks and asks the new disclosure judgments.
Conventions (K1563 (1), `build/rulings.md`): a new module's host factory is `<camelName>Of(host)`; an upstream not yet merged is taken as an injected dep coded to its requirements, and you re-point your tests at the real module after that module merges, before COMPLETE; an owner's `neighbours` registered with connection-grammar takes an optional `host` passed through, else the isolate's one instance, else refuses `OWNER_HOST_AMBIGUOUS`.
Merge order in L8: case-grammar first (C:A-12, the timeline shape), corpus-export, case-tensions before publication (the copy before the deletion), docket after publication, then public-read, case-checker, case-import, case-disclosures, case-authoring. All L8 jobs run at once (P10): a downstream job codes against its upstream's approved requirements and merges after it.
Inherited reds (plan Rules (9)): 1 (coverage of T33 ids not yours, until their merges), 2 (membership's order test, until T33-19a), 3 (case-checker R13's program SHA, until case-checker's job, T33-66), 4 (importers of a copy-split's source, until re-pointed), 5 (the UI's DEC-88 tests, Bob's). Named reds still open, all outside your module: case-disclosures R21 `seam.test.mjs:93` (K1545, until T33-68); case-grammar `complete.test.mjs` R14 ×3 (K1608, until T33-60); case-checker `check.test.mjs:231` R5 (K1608, until T33-66); action-clocks `calendar.test.mjs` R10 ×3 (K1519, until T33-74); filings `packet.test.mjs` R9, R30 (K1519, until T33-75); affordances "R2 R3 R7 R12: N364's ops" (K1550, until T33-85); affordances `catalogue.test.mjs` "R3 R7 R12 … 62 ops" (K1571, until T33-85 and T33-88); control-plane's R26 test of sources' ops (K1550), its "R43, R22 … every published fence" hash pin (K1572, K1575) and `families.test.mjs:48` "CHECK_FAMILIES is total" (K1581, K1585), all until T33-89; instance-setup `keys.test.mjs` R44 ×4 (K1544, until T33-87); `test/system/row-census.test.mjs`, the rows awaiting promotion's stamp (N553): record-core's 9, C-112.21–C-112.32, C-91.1 and C-133.1–C-133.36 less .13 and .28 (K1542, K1545, K1571, K1572, K1585).
Finding (K1570, K1594): an undisclosed differing or unbound workbook is read through `workbooks.readWorkbook` (K1448); your T33-69 pre-flight refuses on it as on a calculation, and publication reads the same answer.
Finding before your start (K1619, from INQUIRY #14 J3 (2)): your fixtures reach `connections` and `entities` through inquiry's instance (`inquiry.connections`); inquiry keeps those getters for now. When the job touches those fixtures, build them on the host directly.
Named reds added at layers 6 and 7 (K1599–K1630), all outside your module: fleetbundles "agent-worker's 13 inputs" (K1598, N575) and agent-runner's three (no `bundle` block; K1604, N578), resolveversion ARM 7b (K1604); control-plane R43 pin (K1606, until T33-89); conformance R21 comparisonFacts (K1610, its L9 job); capture-requests `plane.test.mjs` ×4, scheduler R12 and agent-worker `harness.test.mjs` REC100 ×5 (AI_NO_ACCOUNT until N585 routes `op=accountreferenceset`; K1614, K1621); row-census gains C-2.8 ×3, C-28.20–.22, C-134.1–.12, C-135.1–.12. Intent's `invariants.test.mjs:200` red is cleared (K1629).

## B2 · CHANGE

K1632: workbooks R16's wording now names your pre-flight (T33-69, C:A-15) as the rule that refuses an undisclosed, differing or unbound load-bearing calculation. publication R22 now commits the calculation inputs at publish. Merge tranche/T33 and build to that.

## B3 · ANSWER · re J1

K1633: (1) accepted: an async gather (calculationsAtPublication) runs before the act. The two op arms go async and pass the facts in. publishCase stays synchronous, and run without the facts it answers CALCULATIONS_UNREAD for a chain that reaches a calculation. Never treat unread as agreeing. (2) id C-136.1 confirmed, CALCULATION_NOT_DISCLOSED. Your translation stands, as a draft the design stream may reword. It is stamped at T34. (3) accepted. (4) Hold upstreams that are not yet merged as injected deps (K1563 (1)), and re-point before COMPLETE. State final uses in COMPLETE (calculations, workbooks, events, case-tensions, inquiry-grammar); I set modules.json at the merge. Also see B2 (CHANGE): workbooks R16 now names your pre-flight, and publication commits the calculation inputs.

## B4 · ANSWER · re J2

K1634: J2 accepted whole. The recompute in the gather writes only calculations' own status (its R8); a workbook is never recomputed; the state rules are as you list them. Uses at the merge also gain jurisdictions. J1's (2) and (3) answers stand (B3).

## B5 · CHANGE

K1636: case-grammar (T33-60) is merged into tranche/T33. Merge the tranche and re-point your injected case-grammar at the real module (calculationsOf, timelineOf, the `calculation` kind's paths, caseFilePath) before COMPLETE (K1563 (1)).

## B6 · CHANGE

K1638: case-disclosures (T33-68) is merged into tranche/T33; merge the tranche. Re-point your injected case-disclosures (peopleNamed, peopleJudged, tieAttestationJudged, peopleLines, memberTieLines) at the real module. Your own red to fix: invariants.test.mjs and preflight.test.mjs (R29) pin the C-120 set as .1–.8 and .10–.13. Widen both to C-120.14–.16, which your R34 pre-flight and R55 now ask.

## B7 · ANSWER

K1639, on your J3: (1) known and fail-closed (K1601). inquiry admits a CALC- leg only once calculations has a synchronous acceptance read (N576, next tranche). Your tests stay as they are. (2) N596 (next tranche). Keep null sha for non-table inputs. (3) case-grammar is re-opened to accept `not_recomputed` (R18 amended); re-point when it merges again. (4) case-disclosures is merged (K1638), and its interface as merged stands. Code to it: `parts` is a flat list [{place, where, people?, event?, fact?}], with place one of statement, claim, lens, docket, timeline, money. peopleNamed answers {named, unresolved, entities, money_parties}, and money_parties is what you pass to tieAttestationJudged. See its record, build/jobs/T33/case-disclosures.md (J3), on tranche/T33.

## B8 · CHANGE

K1642: case-grammar is merged again with R18's `recompute: not_recomputed` for a workbook row. Merge tranche/T33.
