# op-declarations (T48)

**Status** · session_01DWy5ddM6dBqjWP2KDfq8Fv · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

**Edge needed: `op-declarations` uses `action-records`.** `actions` R103 (merged, L9) no longer spreads `actionRecordsOps`; the plane spreads it directly, and six ops this module declares (`actionlawspropose`, `actionseekspropose`, `actionriskpropose`, `actionreceipt`, `actionscope`, `actionpromise`; R43, R49) are now served by `action-records`' map, not `actions`'. Five of my tests (t33, t41, t45) drive those stamps through the owner's map, as the module's tests always have, so they import `bio-plane/src/action-records/index.mjs`. `checks/architecture.mjs` fails those three files until `action-records` is in this module's `uses` in `build/modules.json` (the Private Uses lines name such edges as BOB's to record, P17). Please add it on `tranche/T48`; I merge it when it lands. My best reading: add the edge; the alternative, dropping those stamp drives, would lose R6's totality check for six ops.

Also for the record (no answer needed): (1) `instance-setup` and `plane` have not merged, so R66's and R64's `updatenotice`, `updatestart`, `updatelater`, `updateskip` and `readtranslate` are named for those jobs in the totality tests (they pass whichever merges first); (2) `affordances` has not merged either, so the three update acts are named under `ACT_HELP_ABSENT`'s last ground until `ACT_HELP` holds their `owed_update*` texts; my R34 tests accept either state, and I will drop the names if the merge lands before I complete.

## J2 · COMPLETE

**Completion (T48-63).**

**Read, whole:** `build/requirements/op-declarations.md`; `build/manifest.md`; the T48 plan's entries and rule 5; `build/layers.md` (layer 11 split); `bio-plane/src/op-declarations/` (`index.mjs`, `t45.mjs`–`t47.mjs`); `t45.test.mjs`, `t47.test.mjs` (the parts naming R49, R54, R56, R60) and the failing parts of the others; of the modules I use, only the owners' ops-map arms my ops touch, `court-citations/index.mjs` (R11's form) and `wizard-scripts`' `checkScript`.

**Entries applied:**
- **R64** `actionreplyquoting` (action-replies, member), `proceedingdates` (following, read), `readtranslate` (agent-worker family, ownread, as `textcheck`); `followregister`'s `proceeding` is a body field, no stamp (tested). New `t48.mjs`.
- **R65** registry and library re-taken at PR #34 (`4664e8efd4`): 88 function acts, `elsewhere` lists none, the three update acts and `owed:updatestart` read as served; the control through `checkScript` (passes with R66's specs, refused without). The 8 tests the wizard-scripts re-take reddened were already green here: they read the live files.
- **R66** `updatenotice` (ownread), `updatestart`, `updatelater`, `updateskip` (admin acts) in instance-setup's family.
- **R67** `aiuseovertime`, `exploregraph`, `standardproposals`, `filingread`, `pressurefor`, `planask`, `stepsource`, `stepsourcewithdraw` (new `connections` family, stamped `member`), `lookedsince`; `chain` and `until` are body fields.
- **R68** the 24 moved ops form the `ai-accounts` family; `aigrantmint` stays credentials'.
- **R69** every table and list built on first read (`build()` behind proxies, court-citations R11's form). Export snapshot before/after byte-identical; fresh-process test: no large table frozen at import, built once on first read.
- **R70** tested: `sourceof` unchanged, no `ai` class, on no scope or grant list.
- Baseline's 14 reds all cleared: tests now read `actionRecordsOps` beside `actionsOps` (actions R103) and `aiAccountsOps` for the moved ops.

**Best readings:** `readtranslate` sits under the last ground though a read, so that ground's sentence now names drafts and t36's invariant admits agent-worker reads; `lookedsince` mutates, so it sits under the no-control ground (sentence widened), not the read ground; `exploregraph`'s fields are the body's (its arm spreads the body); "alias table equals the file's function acts" read as every alias being a function act of the file.

**Deferred:** none. **Found in other modules:** (1) `affordances` not merged: `updatestart`, `updatelater`, `updateskip` are named under the last ground; drop the names when its `ACT_HELP` holds `owed_update*` (tests accept either state). (2) `instance-setup` and `plane` not merged: `update*` and `readtranslate` named for them in the totality test (tolerant). (3) `op-grades`/`affordances`: the 16 new ops need grades; plane's `affordances` unaccounted test (R2, R41) is newly red until then. (4) J1 said "five tests"; it is three files (t33, t41, t45). (5) credentials still serves the 24 as delegates (R72).

**Tests and checks:** `node --test bio-plane/test/m/op-declarations/`: 192 pass, 0 fail (23 new in `t48.test.mjs`). Users (admission, interface-shell, screens-*, control-plane, plane) compared with the pre-change head: identical counts, plus one baseline red cleared (control-plane R53) and the one new red in (3). `checks/run.mjs`: format 0; architecture 0 failures (after K3297); coverage 69 of 69; ownership 0.

Size (session_01DWy5ddM6dBqjWP2KDfq8Fv): test runs 24, module lines 4026
