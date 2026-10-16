# wizard-scripts (R085)

**Status** · session_01Hmwn13nBZEaJhdPFdzbyVK · depth 2 · WORKING · handled B1

## Completion (R085-33 · R40)

- **Applied.** R40: `wizardRegister` and `normaliseRegistration` take `adminActs` and `adminScreens` (default none); `startFrom` withholds a Civicsmith-library script from a viewer whose `membership.sessionRights(viewer).administer` (R92) is not true when its first step's act is in `adminActs`, or, with no act, its screen is in `adminScreens`. Doors follow, since they name only offered scripts. No act is hand-listed in the module.
- **Wiring owed (another module, REPORTed).** `plane`'s `wizardRegistration` (`bio-plane/src/plane/wizards.mjs`) must pass `adminActs: [...ADMIN_ACTS]` and `adminScreens: [...ADMIN_SCREENS]` from `interface-shell`'s exports (`ADMIN_ACTS` has `groupdescriptionset`, `memberadd`; `ADMIN_SCREENS` has `updates`); until it does, the live registration withholds nothing. `op-declarations`' `NEEDS` holds null for these acts, so it cannot supply the administer capability; `interface-shell` is the registry that names them.
- **Deferred.** None.
- **Found in other modules.** screens-daily/screens-wizards: three tests fail identically before and after my change (not edited): `R1–R13 (interface-shell R21, R38): each screen's acts are exactly its registered acts, every op in OPS`, `R1 every refusal is drawn beside its act, a check's refusal naming its step; the form keeps what was typed`, `R8 the path Settings › Wizards, the four states of each read, and the list read again after an act`. Result: 145 pass, 3 fail.
- **Tests.** `node --test test/m/wizard-scripts/`: 100 pass (97 before + 3 new in `r40.test.mjs`), 0 fail.
- **Checks.** format 0 failures; architecture 0 failures; coverage 40 of 40 ids named; ownership 0 failures.

Size (session_01Hmwn13nBZEaJhdPFdzbyVK): test runs 6, module lines 27
