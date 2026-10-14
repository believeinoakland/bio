# op-declarations (T48)

**Status** · session_01DWy5ddM6dBqjWP2KDfq8Fv · depth 2 · WORKING · handled B2

## J1 · QUESTION

**Edge needed: `op-declarations` uses `action-records`.** `actions` R103 (merged, L9) no longer spreads `actionRecordsOps`; the plane spreads it directly, and six ops this module declares (`actionlawspropose`, `actionseekspropose`, `actionriskpropose`, `actionreceipt`, `actionscope`, `actionpromise`; R43, R49) are now served by `action-records`' map, not `actions`'. Five of my tests (t33, t41, t45) drive those stamps through the owner's map, as the module's tests always have, so they import `bio-plane/src/action-records/index.mjs`. `checks/architecture.mjs` fails those three files until `action-records` is in this module's `uses` in `build/modules.json` (the Private Uses lines name such edges as BOB's to record, P17). Please add it on `tranche/T48`; I merge it when it lands. My best reading: add the edge; the alternative, dropping those stamp drives, would lose R6's totality check for six ops.

Also for the record (no answer needed): (1) `instance-setup` and `plane` have not merged, so R66's and R64's `updatenotice`, `updatestart`, `updatelater`, `updateskip` and `readtranslate` are named for those jobs in the totality tests (they pass whichever merges first); (2) `affordances` has not merged either, so the three update acts are named under `ACT_HELP_ABSENT`'s last ground until `ACT_HELP` holds their `owed_update*` texts; my R34 tests accept either state, and I will drop the names if the merge lands before I complete.
