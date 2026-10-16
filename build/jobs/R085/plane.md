# plane (R085)

**Status** · session_012UeeSfNFsJWJBvbPHcGVSs · depth 2 · COMPLETE · handled B1

## Completion (R085-34 · R57)

- **Applied.** R57: `wizardRegistration` (`bio-plane/src/plane/wizards.mjs`) passes `adminActs: [...ADMIN_ACTS]` and `adminScreens: [...ADMIN_SCREENS]` from `interface-shell`'s exports; the `uses` edge to `interface-shell` is already in `build/modules.json` (BOB's), and interface-shell is earlier in the order. The live registration now withholds the three group-setup scripts from a viewer without `administer`.
- **Tests.** `bio-plane/test/m/plane/wizards.test.mjs`: the R19 registration test's exact-parts assertion now carries the two lists (the registration it names gained them); new test `R57 …` builds the live store, seeds an active member (`ann`) and an active administrator (`ada`) by row, and checks that `startFrom` omits "Say who your group is", "Invite a member" and "Update your group's Civicsmith" for `ann` and offers them to `ada`; negative control: `ann` keeps "Connect your Claude account" and "Your ties" and sees fewer scripts than `ada`.
- **Test runs (plane module).** `node --test test/m/plane/`: 251 tests, 250 pass, 1 fail: `R2, R10 (store-door's step … directly before the first layer-11 module)` in `store.test.mjs:105`. **Not caused by this change**: the same test fails identically with my two files stashed (`node --test test/m/plane/store.test.mjs`: 10 pass, 1 fail). Its expectation names `setup-words` as the first layer-11 module, but `wizard-scripts` is first in layer 11 in `build/modules.json` (its R19 says so). Left unedited, not my change to make in this job; BOB to decide (see REPORT).
- **Other suites.** `node --test test/m/wizard-scripts/`: 97 pass, 0 fail (the user of the change). `node --test test/m/screens-daily/ test/m/screens-wizards/`: the same three tests fail that wizard-scripts' record lists (`R1–R13 (interface-shell R21, R38)`, `R1 every refusal is drawn beside its act…`, `R8 the path Settings › Wizards…`); this change does not alter them; not edited.
- **`bio-plane/test/system/migrate-released.test.mjs`**: not verified. It boots the released planes under miniflare and reads released bundles from git; in this container it did not finish in 580 s (`Promise resolution is still pending but the event loop has already resolved`). Not run on the base for comparison (a second 10-minute run would be needed). Treat as open.
- **Checks** (run from `civicos-process`, product `/home/user/bio`, module `plane`):
  - `checks/format.mjs`: `format: 170 modules, 169 requirements files; 0 failures`
  - `checks/architecture.mjs`: `architecture: 58 product files, 629 relative imports (2 naming no tracked file, not judged); 0 failures`
  - `checks/coverage.mjs`: `coverage: 1 modules, 57 of 57 live requirement ids named by a test; 0 failures`
  - `checks/ownership.mjs … tranche/R085`: `0 failures` (rerun after the commit below)
- **Deferred.** None in this module.
- **Found in other modules.** `plane`'s store-door order test (above) is a plane-owned test that is red on the base; the wizard-scripts record's three screens failures are unchanged. The `wizard-scripts` record already REPORTed the wiring; it is now done here.

Size (session_012UeeSfNFsJWJBvbPHcGVSs): test runs 13, module lines 2285

## J1 · COMPLETE

COMPLETE, R085-34 (plane R57), pushed at 3b7618a561 on job/R085/plane.

- Applied: `wizardRegistration` passes interface-shell's `ADMIN_ACTS` and `ADMIN_SCREENS`. Live startFrom withholds the three setup scripts from a non-administrator (R57 test names R57; R19 registration test updated).
- Tests: plane `test/m/plane/` 250 of 251 pass. The one failure (`R2, R10`, store.test.mjs:105, store-door's order before the first layer-11 module) fails identically on the base: it expects setup-words first in layer 11, but wizard-scripts is first. Not edited; your decision.
- wizard-scripts `test/m/wizard-scripts/`: 97 pass. The three screens-daily/screens-wizards failures are unchanged, not edited.
- migrate-released system test: NOT verified. It did not finish in 580 s in this container (promise still pending under miniflare). Open.
- Checks: format 0 failures; architecture 0 failures; coverage 57 of 57; ownership 0 failures.
- Detail and size line in build/jobs/R085/plane.md.
