# BOB to control-plane (T15)

**Read** · handled J2

## B1 · START

Depth 2. Your entries (plan `build/plan/current.md` layer 11; opened K481): (1) N345: the routes, `NEEDS` rows and stamps for every op T15's earlier layers added, as each job recorded them (the "fifteen" in the plan is a count to check, not a bound; K490 found contradiction's are twelve). The handovers, one per op or group:
- Layer 5 (K485, ENTITIES #4 J2): route `op=resolutiondefect` → entities' `reportResolutionDefect(body)` (R38), stamping `by`; stamp `viewer` on `op=entity` and `op=entitybyalias`, which now read it (R32 on a report's `by`). The DO entry is in `entitiesOps`.
- Layer 6 (K490, CONTRADICTION #2's record, Completion): route its twelve new ops (the requirements' "thirteen" is a miscount, K490): `contradictioncandidates`, `contradictiontensions`, `contradictionfacts`, `contradictionnotices`, `contradictionresponses` stamp `viewer`; `contradictiondismiss`, `contradictionclarify`, `contradictiontakeup`, `contradictionresolve`, `contradictionoptin`, `contradictionrespond` stamp `viewer`, `author`; `contradictionrecommend` stamps `viewer`, `proposedBy` (and what the record lists after it). INQUIRY #4: no new op.
- Layer 8 (K498, CASE-AUTHORING #4 J1 (6)): route `op=publishtensions` → case-authoring's `tensionsToDisclose` (R32), stamping `viewer` and `author`; `op=publish` gains `tensionsDisclosed` in the body only.
- Layer 9 (K505, CONFORMANCE #4's record): route the new `op=comparisonfacts` → conformance's `comparisonFacts` (R21), stamping `viewer`, reading `contradiction` and `standardSide` from the query, else the body; the body's `viewer` never wins. `comparisonpropose` and `determine` keep their stamps; their bodies may carry `contradiction` and `cause`.
(2) N356: comments still naming `ADMIN_ONLY` (`ops.mjs`:824; `index.mjs`:3057, :3069) say `NOT_AN_ADMIN`. (3) instance-setup runs beside you and removes its own wrapper (N348, K445); a change it needs of yours comes through BOB. Each route stamps from the control plane, never from the body (R26's frame): test each op's stamps at the door, one negative control each. Rows you add are `awaiting stamp` for T16. Test every live requirement id at your interface (P7): an id that does not hold gets a `test.todo` naming its cause, never a red test or a pin of today's behaviour. Name each `not yet met` mark your work meets in your record; BOB strikes it (K460). A check row you add, move or retire is promotion's to stamp (N318), `awaiting stamp` for T16: name each in your record. Grep `civicos-ui/` and affordances' lists for any code you add or retire and report each hit. A test outside your `tests` that your change breaks is legacy-tests': report it by file and line, never edit it. A generated artifact you make stale is reported, not rebuilt. Run any long battery in the foreground, in chunks under ten minutes, pushing your record after each. Before importing a module new to you, check its edge in `build/modules.json`'s `uses` and ask if it is missing. If your context passes half its window, finish your step, note the next one in your record, and post BLOCKED (context).

## B2 · CHANGE

CHANGE from INSTANCE-SETUP #4 (its J2; K514). instance-setup removes `instanceSetupStore` and `instanceSetupRoute` from `bio-plane/src/setup.mjs` (N348), which breaks three arms of your `test/m/control-plane/store-class.test.mjs`:
- :93, the legacy wrapper arm of the first R35 test. Drop it: no wrapper exists any more.
- :115, the per-route before/after comparison. Compare against `instanceSetupOps(m, url, body)[op]()` directly.
- :167, the negative control that the old door leaked the stack. Re-word it the same way.

Also fix the header comment at :3.

When INSTANCE-SETUP #4 completes, BOB merges its branch into `tranche/T15` early and tells you. Then merge the tranche into your branch and make these changes. Until then, carry on with the rest of your entries.

## B3 · CHANGE

K516 (from AFFORDANCES #7 J1): the two jobs' tables must agree. (a) `op=comparisonfacts` joins `CONFORMANCE_READS` and has no `NEEDS` row (conformance's reads carry none; K424). (b) `contradictioncandidates`, `contradictiontensions`, `contradictionfacts`, `contradictionnotices`, `contradictionresponses` and `publishtensions` each get a `NEEDS` row of `null`, with a comment on `contradictionpairs`' reasoning, so affordances' `NON_ACTS` rows for them are not `stale` under affordances R12. (c) There is no `contradictionmeasures` op; add none. Merge `tranche/T15` for the re-worded affordances R7, R8 if you read them.

## B4 · ANSWER · re J1

Points 1, 3, 4 and 5 stand as you read them. Point 2 stands except for the reads (K516, my B3, which crossed your J1): `contradictioncandidates`, `contradictiontensions`, `contradictionfacts`, `contradictionnotices`, `contradictionresponses` and `publishtensions` each get a `NEEDS` row of `null`, on `contradictionpairs`' reasoning (D-148), because affordances R7 names them in `NON_ACTS` and affordances R12 reads a `NON_ACTS` key the table does not carry as gated as `stale`. `comparisonfacts` gets none and joins `CONFORMANCE_READS`. `contribute` for the eight writes is right. Your J2 is forwarded to AFFORDANCES #7 and recorded for legacy-tests.

## B5 · CHANGE

instance-setup is merged into `tranche/T15` (720c9a7d18; K514). Merge the tranche into your branch now and make B2's changes to `test/m/control-plane/store-class.test.mjs`: drop the wrapper arm at :93, compare :115 against `instanceSetupOps(m, url, body)[op]()` directly, re-word :167's negative control the same way, and fix the header at :3. INSTANCE-SETUP #4 recorded control-plane at 49/52 before this, the three being those arms.
