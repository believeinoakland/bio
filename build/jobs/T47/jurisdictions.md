# jurisdictions (T47)

**Status** · session_01CVJELXMANXCrBSv3k5mkgv · depth 2 · WORKING · handled B0

## Record

**Entry applied** · T47-2 (N971): R88. `COUNTERPARTY_LEVELS` was already exported and read by `validate` (index.mjs:53, :820); added its R88 comment and `jurisdictions/test/t47.test.mjs`, three tests naming R88: the list, its order and that it is frozen (every mutation attempt throws, the list unchanged after), one value across imports; `validate` accepts a counterparty level exactly when it is in the list (every level on every counterparty of both held profiles; 18 values outside it, absent included, each `LEVEL_UNKNOWN` at `counterparties[0].level` and that fault only; over the union of both vocabularies, accepted iff listed); every held office's level is in it; not a law's level (district refused on a records law, federal on an office, each with its control). A mutation (the list unfrozen, `federal` added) fails all three; restored.

**Read** · whole, by me: `build/requirements/jurisdictions.md`, `jurisdictions/index.mjs`, `test/helpers.mjs`, `test/jurisdictions.test.mjs`; record-grammar's Purpose and R16 (its use); `build/layers.md` layer 1 row and "No jurisdiction in the product"; my plan entry and the opening's rules. The reading set measured 1031 KB (over 600): the profile data files (`profiles/`, 120 KB) are data, outside the set (K2053, K2083); `t33`, `t34`, `t35`, `t37`, `t45.test.mjs` (179 KB) were read in full by a helper in this session, which wrote me a digest citing each test by line (mechanics §17 (3)).

**Flaws found in my own tests, fixed here** (P8, from the digest): four refusals asserted a code with no path, so a fault elsewhere could pass them: t33 R3 T33 (a broken space pattern now `PATTERN_INVALID` at its path), t33 R52 K1513 (`SCHEME_INVALID` at `forms` / `forms[0]`), t45 R75 (`consequence` faults at their fields), t45 R79 (`applies_to` faults at their paths).

**Deferred** · the digest's other notes are not defects against a requirement and are left: hard-coded fixture indices in t33/t34/t35/t37 (they read the test profile's data, which R22 fixes); a few sampled bad values beside full controls (t35 L67, L74); t37 R73's translation check is vacuous while the first profile holds no `local_names` (it guards a future entry, as R73 wants).

**Other modules** · none found. `setup-page` R5 imports `COUNTERPARTY_LEVELS` (unchanged; no service changed, so no user's tests re-run).

**Tests** · `node --test jurisdictions/test/`: tests 131, pass 131, fail 0.

**Checks** (process repository) · format: 165 modules, 158 requirements files; 0 failures · architecture jurisdictions: 13 product files, 20 relative imports; 0 failures · coverage jurisdictions: 88 of 88 live requirement ids named by a test; 0 failures · ownership jurisdictions tranche/T47: 0 failures · `checks/run.mjs`: architecture 3058 product files, 0 failures; coverage reds only connection-grammar R21 and record-grammar R61, R62 (rule 5.1, not mine); channels 0 failures.

Size (session_01CVJELXMANXCrBSv3k5mkgv): test runs 5, module lines 2062
