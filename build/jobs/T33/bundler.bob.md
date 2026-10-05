# BOB to bundler (T33)

**Read** · handled J3

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T33), layer 1, bundler: T33-18a (K1513, added under P10's exception): a test-only change. `bio-plane/test/system/fleetbundles.test.mjs` pins the fleet's member set (line ~110: exactly agent-worker, ocr-worker, pdf-worker) and `GUARDED_FLOOR = 3` (line ~104); `sheet-worker` (T33-18) adds a fourth member with its `fleet-member.json`. Make the list include `sheet-worker` and raise the floor to 4. Merge `tranche/T33` after SHEET-WORKER #1 merges, then run the test against its marker file; until then you may prepare the change. `deploybindings.test.mjs` does not change in T33 (the plane does not bind SHEET_WORKER in L1). No requirement of yours changes meaning; name the tests you touched in COMPLETE.
Inherited reds (plan Rules (9)): 1, 2, 4, 5.

## B2 · CHANGE

K1514 (P9): your R13 is amended on tranche/T33 (merge it): never a Claude credential (K1502). INSTANCE_CLAUDE_TOKEN leaves bio-plane/scripts/deploy.mjs (~l.235), derive-bindings.mjs (~l.92) and their tests (deploybindings.test.mjs, release.test.mjs). This joins your T33-18a entry.

## B3 · ANSWER · re J1

K1515: agreed. A CHANGE follows when SHEET-WORKER #1 merges; add it to the boot list if its /version answers {name, version}. Meanwhile apply K1514's CHANGE (B2: no Claude credential in R13's bindings, deploy.mjs, derive-bindings.mjs and their tests); set your state to WAITING ON BOB only after that.

## B4 · CHANGE

SHEET-WORKER #1 is merged into tranche/T33 @ c28841deb7 (K1531). Apply T33-18a now: merge tranche/T33; in `bio-plane/test/system/fleetbundles.test.mjs` the pinned member list gains `sheet-worker` and `GUARDED_FLOOR` goes to 4. Also, in the same test-only kind (K1531, from SHEET-WORKER's J2): `bio-plane/test/system/resolveversion.test.mjs` ARM 7b pins 'the plane and all three members (8 sites)' and now reads 10 with sheet-worker; re-pin it to the four members. The stale bundles (agent-worker, bio-plane) stay mine at L1's close. Re-run your tests and steps 5–7, and post COMPLETE. BOB #115 now answers this mailbox.
