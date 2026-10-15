# notice-producers (T49)

**Status** · session_01LbT9NV5rBvWk3icXtqbEnT · depth 2 · COMPLETE · handled B0

## J1 · REPORT

Other modules, found while running the L11 tests that read notice-producers. None is in notice-producers; none is changed here. All four reds also fail on the baseline (tranche/T49 before this job's commit, checked with my changes stashed), so they are not this job's.

1. `screens-daily/contract.test.mjs` (interface-shell R21, R38): the screen's acts are missing `themeread` on the `projects` screen (actual: projectjoin, promote; expected also themeread). Owner: screens-daily / interface-shell.
2. `screens-wizards/library.test.mjs` (R1, the refusal drawn beside its act): the page shows the English sentence "This script is from the Civicsmith library…", where the test expects the key `WIZARD_NOT_THE_GROUPS` translated. Owner: screens-wizards (the wording key is not reaching the page).
3. `screens-wizards/library.test.mjs` (R8, the four states of each read): the page does not show `WIZARDS_STATE_REFUSED` translated. Same owner and cause as 2.
4. `journey-check` local arm (journey 28, setup): the claim is not shown on /app/setup, so the walk stops at step 7 of 7. Owner: journey-check / instance-setup. Bob's re-walk (K3398) will meet it.

Environment note: the local journey-check arm needed `npm ci` in `bio-plane/src/journey-check` (playwright-core was missing). Done in this session; nothing committed (node_modules is ignored).

## J2 · COMPLETE

**T49-36 notice-producers: complete.** Branch `job/T49/notice-producers` at 52d3b29f5e (the code commit), pushed.

**Entries applied**
- **R23** (N1133, K3393, K3398; amends R17, R20, R22; K3366): every member-facing sentence is read by key through `setup-words` (`word`, `hasWord`). `NOTICE_WORDS`, the hand-copied table, is gone from `words.mjs`. `wordsOf` and `hasWords` now delegate to setup-words and throw for a key the list lacks. The stale copies ("Possibly overdue", "Overdue") are retired; the words now read "Its date may have passed" and "Past its date", as words.json has them. The `setup-words` edge was already in `modules.json`, so no edit there.
- The five reds: `words` (2), `duties` (2), `investigation` clear. Tests now assert keys (`hasWord`, `word`), not sentence text (K3366). The duties tests that matched "Possibly overdue" now check `detail_key`/`summary_key` and the reason fill.

**Decisions I made (lower-level, for BOB to see)**
1. A fill given as `null` or `undefined` is filled with nothing, not left as a brace and not thrown. This stops one absent fact from dropping a whole provider's items. Missing keys still throw. Affects `wordsOf` only.
2. The duties and words tests now assert keys; their negative controls are kept.

**Deferred:** none. Everything in R23 is done.

**Found in other modules** (in a REPORT to BOB, not changed here): four reds in screens-daily, screens-wizards and journey-check, each also red on the baseline. Details are in the REPORT.

**How the read set was read (mechanics §17):** requirements (public and private) whole; `build/manifest.md` whole; my plan entry (T49-36) and the L11 row of `build/layers.md` (the row only, not the rest of that file); `words.mjs`, `index.mjs` and `setup-words/index.mjs` whole; `words.json` read by a comparison script (2.6 MB, not whole); the tests that name the changed sentences whole (`words.test.mjs`, `duties.test.mjs`); the other tests run, not read; `queue/noticed.test.mjs` and `plane/t33.test.mjs` run as dependents.

**Tests**
- `node --test test/m/notice-producers/*.test.mjs`: **118 pass, 0 fail.**
- With the dependents (`queue/noticed`, `plane/t33`): **146 pass, 0 fail.**
- L11 screens, setup-words and journey-check (`screens-*`, `journey-check`, `setup-words`, `queue/noticed`, `plane/t33`): 874 tests, 870 pass, 4 fail. All four fail on baseline too (REPORT).

**Checks** (run from the process repo, product `/home/user/bio`)
- `checks/format.mjs`: `170 modules, 169 requirements files; 0 failures`
- `checks/architecture.mjs notice-producers`: `15 product files, 84 relative imports (0 naming no tracked file, not judged); 0 failures`
- `checks/coverage.mjs notice-producers`: `1 modules, 23 of 23 live requirement ids named by a test; 0 failures`
- `checks/ownership.mjs notice-producers tranche/T49`: `4 files changed by notice-producers between tranche/T49 and HEAD; 0 failures`

Size (session_01LbT9NV5rBvWk3icXtqbEnT): test runs 9, module lines 1435.
