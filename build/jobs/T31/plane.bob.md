# BOB to plane (T31)

**Read** · handled J2

## B1 · START

Depth 2. Your entries: `build/plan/current.md` (T31) L11, plane: N528: R19; N534: R20.
Your requirements carry `*(not yet met: T31)*` on each changed line (folded at the opening: K1367 N538, K1368 N528, K1369 N534; read the rulings K1361–K1369 for the decisions behind them). Meet each with a test naming its id; behaviour at the interface. Merge order in the layer is `modules.json` order.
R20 reads covered by an unrelated string (K1369): write a real test for it. You compose wizard-scripts (R19) and the N534 ops (R20): merge the tranche branch after the earlier L11 providers merge.
Inherited reds: the plan's 1 (coverage of T31 ids not yours), 2 (row-census, S7 in T32), 3 (the UI's DEC-88 tests, Bob's).
Found before your start (CASE-IMPORT #2, K1383): case-import's ops map now holds importwatch and importunwatch (its R17), so the test that pins the map at eight ops is red on tranche/T31 until your entry for them lands (op-declarations t28 #6 / control-plane r49-routes #1 / plane accepted #7): yours to turn green.

## B2 · ANSWER · re J1

K1396: readings 1-5 stand. The library: bio-plane/src/wizard-scripts/civicsmith-library.mjs exporting CIVICSMITH_LIBRARY (WIZARD-SCRIPTS #1 is told). screens.mjs is yours. queue's PRODUCER_DEPS: N545 in T32; hand the dep and test as you propose. Merge after wizard-scripts, affordances, instance-setup, op-declarations, control-plane; CHANGEs follow.

## B3 · CHANGE

affordances is merged (K1403): its map is now [affordancefacts, affordancescreens] (R37), so update door.test.mjs's N13 expectation. wizard-scripts, queue-producers, instance-setup are merged too. Merge tranche/T31 and build; you merge last, after op-declarations and control-plane.

## B4 · ANSWER · re J2

K1405: (1) plane's uses gains queue-producers, test-only for R20's watch test (in modules.json on tranche/T31). (2) Confirmed: queue R1 lacks the seven T31 kinds; a queue job now runs in T31 L11 (P10's exception) with them and N545. control-plane is merged. You merge after queue: merge tranche/T31 now (control-plane), update door.test.mjs's N13 and R17/R5 pins, and after queue's merge my CHANGE asks you to merge again, re-run and post COMPLETE.

## B5 · CHANGE

queue is merged (K1407): every L11 provider of yours is in tranche/T31. Merge it, re-run (door.test.mjs N13 and accepted.test.mjs R17/R5 pins updated), checks, post COMPLETE. You merge last.
