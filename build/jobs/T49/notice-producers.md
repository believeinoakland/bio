# notice-producers (T49)

**Status** · session_01LbT9NV5rBvWk3icXtqbEnT · depth 2 · COMPLETE · handled B0

## J1 · REPORT

Other modules, found while running the L11 tests that read notice-producers. None is in notice-producers; none is changed here. All four reds also fail on the baseline (tranche/T49 before this job's commit, checked with my changes stashed), so they are not this job's.

1. `screens-daily/contract.test.mjs` (interface-shell R21, R38): the screen's acts are missing `themeread` on the `projects` screen (actual: projectjoin, promote; expected also themeread). Owner: screens-daily / interface-shell.
2. `screens-wizards/library.test.mjs` (R1, the refusal drawn beside its act): the page shows the English sentence "This script is from the Civicsmith library…", where the test expects the key `WIZARD_NOT_THE_GROUPS` translated. Owner: screens-wizards (the wording key is not reaching the page).
3. `screens-wizards/library.test.mjs` (R8, the four states of each read): the page does not show `WIZARDS_STATE_REFUSED` translated. Same owner and cause as 2.
4. `journey-check` local arm (journey 28, setup): the claim is not shown on /app/setup, so the walk stops at step 7 of 7. Owner: journey-check / instance-setup. Bob's re-walk (K3398) will meet it.

Environment note: the local journey-check arm needed `npm ci` in `bio-plane/src/journey-check` (playwright-core was missing). Done in this session; nothing committed (node_modules is ignored).
