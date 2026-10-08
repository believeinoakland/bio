# wizard-scripts (T37)

**Status** · session_01QwNq9qtQJ2HZxpaw54BfmN · depth 2 · COMPLETE · handled B2

## Completion (WIZARD-SCRIPTS #6, T37-25)

**Reading (mechanics §17; START's (3)).** The reading set is over 300 KB (own requirements 41 KB, code 178 KB, tests 155 KB, before the used parts). I read these whole myself: `build/requirements/wizard-scripts.md`; layer 11's row of `build/layers.md`; `index.mjs`, `writing-help.mjs`, `build-data.mjs`, `data.mjs`; `writing-help.test.mjs`, `registry.test.mjs`, `library.test.mjs`, `fixture.mjs`; `credentials`' Purpose and R35, and `aiKeptAway`/`aiKeepAwayState` in its code; DEC-172, DEC-178, DEC-180, DEC-182 (each whole); K231, K1869, K1883, K2130, K2158, K2159, K2171, K2175 and K2237; the plan's T37-25 entry, rule 4, rule 6 and "For BOB" 1. One worker read the rest whole: `checks.mjs`, `schema.mjs`, `front-doors.mjs`, the other eight test files, and the four other used modules' Purpose and the entries this module's Uses names (174 KB whole, 26 KB in part). It wrote a summary of about 1,500 words, each statement citing file and line. It found nothing that changes this job: every test registers `OPS`, which holds every test act, so R13's filter removes nothing there; no row here mints `ASSISTANT_OFF`; only the fixture needed `credentials`. What it found against other requirements is listed below.

**Bob's approval (R22).** `build/rulings.md` records none for version 2 at this START or while I ran (latest K2237: "Bob's version 2 not approved at its START"). So every Civicsmith script keeps version 1. All 17 come from `library.json` at `d129238bf3`: 13 are identical at `e08cd35ecb`, and the four that differ there ("Set up and claim", "Publication ceremony", "Check a claim", "Follow a proceeding") are kept at `d129238bf3`. No version is `updated`.

**Entries applied.**
- R13 (N776): the registry was re-taken from `registry.json` at `e08cd35ecb`. The command was `node bio-plane/src/wizard-scripts/build-data.mjs <registry.json @ e08cd35ecb> e08cd35ecb <library.json @ d129238bf3> d129238bf3`: it wrote `screen-registry.mjs` (47 screens) and wrote `civicsmith-library.mjs` unchanged. The vendored `test/.../source/registry.json` is now the `e08cd35ecb` file. When an op table is registered, `screenActs` now drops every act whose op the table lacks, owed or not, so `registeredScreens()`, `wizardRegistry`, `wizardsAt` and `op=wizardcheck` answer one registry. Without an op table, nothing changes.
- R24 item 1 and R27 (N765, rule 4): `writingHelpAt` reads `credentials.aiKeptAway()` at each call, never `assistant.on`. It answers `AI_KEPT_AWAY` first, then `AI_NO_ACCOUNT`. If the setting cannot be read, or credentials cannot be reached or throws, it fails closed. `writingHelp` answers a keep-away with credentials' own refusal (row C-29.31, `keep_away`), so the code is never minted here (K231). The factory reaches `credentialsOf(host)` on first need when no `credentials` is given.
- R22: version 1 kept, as above. R14 now names "Set up and claim" (step 11, `assistantset`, `WIZARD_ACT_UNKNOWN`). R11 withholds it, and also the optional "Follow a proceeding" (step 2, `registerproceeding`, re-pointed by DEC-182 (1)), until a version 2 is carried.
- N669, its share: R11 (K1883) already withholds "Translate the interface" while its translation ops are undeclared and offers it once they are. This is tested with an op table that holds them and one that does not (`library.test.mjs`, R11 K1883).

**Open, named:** red 7 (plane `release.test.mjs`:12 and :18, R19) stays red until a START carries "Set up and claim"'s version 2 with Bob's approval. "Set up and claim" is also not offered (R11) until then, and neither is "Follow a proceeding".

**Deferred:** none in this module.

**Found in other places (for BOB):**
1. Generated artifact made stale: `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`; it bundles `screen-registry.mjs` and `index.mjs`). It is regenerated at L11's close.
2. My own requirements text (BOB's): R5 cites `proposalLabel`'s subject `wizard` as record-grammar R42, but it is R45 (R42 is `template`). Uses names `declarePurge`, where the code uses `declareTable` with explicit classes (record-core's form). Uses names filing-templates R25 only, but `{template: "@name"}` also relies on its R26 (K2021).
3. membership R84's list of acts answering `NOT_AN_ADMIN` does not include wizard-scripts R8, which answers through it.
4. Readings to confirm, existing behaviour, untouched: R15's `wizardUse` serves a Civicsmith script's tallies to administrators (R15 names project owners and the version's author). A member proposer's name is read live when they become a contributor (R18: names held by value).

**Tests and checks** (on `job/T37/wizard-scripts`):
- `node --test bio-plane/test/m/wizard-scripts/*.test.mjs`: pass 69, fail 0. New tests: R13 (T37) one registry; R22 (T37) version 1 kept; R24 (T37) keep-away; R27 (T37) credentials' refusal passed through. Updated: R13 source commit and acts; R22 and R14's named failure; R23's offered list; R24 and R27 on `AI_KEPT_AWAY`.
- Users' tests (`test/m/` plane, affordances, store-door, control-plane, op-declarations, queue-producers, instance-setup, answers, setup-page; 147 files): pass 960, fail 43. The results are identical, file for file, to the same run on `origin/tranche/T37`, so nothing is new. The failures are inherited reds: red 7 (`release.test` 2), census 17 (affordances `plane.test` 27, setup-page `worker-page` 5, plane `worker.test` 1), item 14 (`t36-backing` 1), item 17's affordances `t36.test` 1, item 11 (op-declarations `t34` 3), item 24 (plane `t36.test` 1), and plane `disclosures` 1 and `docket` 1, both red on the tranche too. Rule 4's interim red: none. store-door's tests and control-plane's and instance-setup's `draft.test` all pass (0 fail).
- `node checks/format.mjs`: 0 failures. `architecture.mjs bio wizard-scripts`: 0 failures. `coverage.mjs bio wizard-scripts`: 27 of 27 live ids named, 0 failures. `ownership.mjs bio wizard-scripts tranche/T37`: 9 files changed, 0 failures.

Size (session_01QwNq9qtQJ2HZxpaw54BfmN): test runs 9, module lines 2318

## J1 · COMPLETE

T37-25 complete on job/T37/wizard-scripts (record: Completion). R13: registry re-taken from e08cd35ecb (build-data.mjs <registry @e08cd35ecb> e08cd35ecb <library @d129238bf3> d129238bf3); with an op table, an act the table lacks is not registered, so registeredScreens, wizardsAt and wizardcheck answer one registry. R24/R27: AI_KEPT_AWAY from credentials.aiKeptAway() at the call, failing closed, credentials' own refusal passed through (K231); assistant.on not read; module now reaches credentials. R22: no ruling records Bob's approval of version 2, so all 17 scripts stay version 1 from d129238bf3. Red 7 stays open (plane release.test.mjs:12, :18, R19: 'Set up and claim' step 11 assistantset), and R11 now withholds 'Set up and claim' and the optional 'Follow a proceeding' (registerproceeding) until a version 2 is carried. Tests: module 69/0; users' tests 960/43, the same file for file as origin/tranche/T37 (all inherited reds, no rule-4 interim red). Checks: format, architecture, coverage 27/27, ownership 9 files: 0 failures. Stale artifact: plane bundle. Requirements notes for you in the record (R5's R42 should be R45, Uses: declareTable, filing-templates R26; membership R84's list).

## B2 · CHANGE processed (K2241: version 2 of the four scripts adopted)

`tranche/T37` merged (R22 re-worded; K2240, K2241). **Applied:**
- R22: version 2 of "Set up and claim", "Publication ceremony", "Check a claim" and "Follow a proceeding" is now carried from `library.json` at `e08cd35ecb`, `approved` `{by: "BOB", at: "2026-10-08", ruling: "K2241"}`, authored by `civicsmith`. Each version 1 is kept whole (as at `d129238bf3`, approved by Bob 2026-10-06) and is now `updated`, naming version 2, still readable, not offered. The other 13 scripts keep version 1 from `d129238bf3`, and the tests check they are identical at `e08cd35ecb`. Each entry names its source commit (`source`; `earlier[].source`).
- Command: `node bio-plane/src/wizard-scripts/build-data.mjs <registry.json @ e08cd35ecb> e08cd35ecb <library.json @ d129238bf3> d129238bf3 <library.json @ e08cd35ecb> e08cd35ecb`. It printed: "wrote 47 screens and 17 scripts (registry e08cd35ecb, library d129238bf3, adopted from e08cd35ecb: Set up and claim v2, Publication ceremony v2, Check a claim v2, Follow a proceeding v2)". `data.mjs` gains `LIBRARY_ADOPTED` (the four names, K2241) and `adoptedLibrary`. `build-data.mjs` takes the newer library as an optional fifth and sixth argument. The module exports `CIVICSMITH_LIBRARY_ADOPTED_SOURCE`.
- The module now holds every version of a library script (`versions`; `wizardRead`, `wizards`, `wizardUse`, R26's base versions, `copy` and `from` read each version's state). The `e08cd35ecb` file is vendored for the tests as `source/library-e08cd35ecb.json`.

**Red 7 does not clear at my merge; it moves.** "Set up and claim" version 2 passes, so `assistantset` is gone from the release suite. But plane `release.test.mjs` (R19, the same two tests, :12 and :18) now fails on "Publication ceremony" version 2, step 5: `obscuremark`, an owed act (`owed:obscuremark DEC-180`) that op-declarations does not declare yet. T37-31 declares it (N757), so red 7 should clear at op-declarations' merge. Until then R11 withholds the ceremony from members, as it does any library script that fails R12 (K1883).

**Found (for BOB):** `node checks/format.mjs bio` reports 1 failure after the tranche merge: `build/modules.json`: instance-setup's paths entry `bio-plane/src/setup-words.mjs` names no file. That is not this module's.

**Tests and checks after B2:**
- Module: pass 69, fail 0. Re-pinned: R22's three library tests and the K2241 test; R14 now names "Publication ceremony" at version 2's step 11 when `publishat` is undeclared; R23 offers all 14 optional scripts.
- Users' tests (as before, plus skills): pass 1054, fail 45, identical file for file to `origin/tranche/T37` at its tip.
- `format`: 1 failure (above, not mine). `architecture`, `coverage` (27/27) and `ownership` (12 files): 0 failures each.

Size (session_01QwNq9qtQJ2HZxpaw54BfmN): test runs 13, module lines 2379
