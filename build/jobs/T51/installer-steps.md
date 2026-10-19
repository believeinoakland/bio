# installer-steps (T51)

**Status** · session_014EVFpcuKfLr1hY4LJt8xfV · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

The installer-steps row in build/modules.json on tranche/T51 (tip fe5d5656fb) is empty: paths [], tests [], uses []. Extraction map §1 says BOB sets it at the fold: paths ["newgroup/src/steps/"], tests ["newgroup/test/steps/"], uses ["signatures","instance-setup"], and installer's uses gains installer-steps. Without it the ownership, architecture and coverage checks cannot run for me, and I may not edit modules.json (K1043). Best reading: I proceed on the map's values and write only newgroup/src/steps/ and newgroup/test/steps/; please set the row on tranche/T51 and tell me by ANSWER.

## J2 · COMPLETE

Stage 1 (the byte copy, T51-127) is complete. Pushed on job/T51/installer-steps (tip c084eb08e8, tranche/T51 merged in at fe5d5656fb+).

**Entries applied.** `newgroup/src/steps/` (17 files, 1,734 lines with blanks; 1,646 non-blank) built by copy, by script, from `index.mjs` 78-83, 90, 242-244, 287-296, 298-342, 344-422 (except 395-400 as two lines kept), 424-537, 553-561, 563-639, 651-1523 (less the page lines 1521-1523), 2075-2105, plus `account.mjs` 1-230 and 263-271, all of `cfx.mjs` and `signers.mjs`, `images.mjs` 1-30. Checked by script: every non-blank line of `steps/` is either a line of the original or one of my own header, import or export lines, or one of the edits below. The edits: `cf` of `cfx.mjs` renamed `cfCall`, `cf` bound to `CF_API`; the three reads of `CFG` (`CF_API` in `cf` and `scriptHash`, `RELEASE_LATEST` in `loadFleet`) now constants of `api.mjs`, which also declares `RELEASE_TAGGED`; R18 in `loadFleet` and `installFleet` (below). Layout is the map's. The barrel `steps/index.mjs` exports 131 names, no collisions. No file of `installer` was touched; its 169 tests of `newgroup/test` (97 before mine, all green: `node --test test/`, 174 tests, 0 fail) run unchanged, the real-size suite included.

**R18** `loadFleet` keeps for each member `m`, `box`, `limits`, `own`, `classes`, `workerPart` and `bytes()`, and no bundle and no part bytes; `bytes()` fetches the bundle and the non-description parts again from the same base and checks the same hashes; `installFleet` calls it once per member right before that member's first upload (after a container member's conditions pass), and a failure of the second read leaves that member out, named with the one new sentence `its files could not be read again for the upload (<cause>)` (old English; among the stage-2 keys, family `installer.fleet.why.*`). Other members and the run are unaffected.

**Tests** (`newgroup/test/steps/`, 77 tests, all pass): `world.mjs` (the stateful fake account, by copy from the fixture's `run()` rules; the release builder and a real Ed25519 signer), `account.test.mjs` (R1 to R6), `plane.test.mjs` (R7 to R15, R21's limits reader), `fleet.test.mjs` (R16 to R25, R18's six arms), `verify.test.mjs` (R27 to R30, R32, R33), `invariants.test.mjs` (R34 to R36). No test holds a sentence's text; lines are checked by their identifiers (member names, versions, hash prefixes, REACH_NOT_BOUND, the cron) or by the exported constant.

**Checks** (process repository, with the row filled locally, never committed): format 176 modules, 0 failures; architecture "23 product files, 72 relative imports; 0 failures"; ownership "24 files changed by installer-steps between tranche/T51 and HEAD; 0 failures"; coverage "35 of 36 live ids named by a test": R31 only (and R26, see below). With the committed row (paths empty, B2) ownership and coverage name my new files and read nothing, as B2 said.

**Not covered, by design.** R26 and R31 are unmet and unbuilt (K3718 (2); the map §10 says T51-127 builds nothing for them). No test names R31. I removed the only mention of R26 (a header range) so coverage does not read as covered; so R26 shows uncovered as well once BOB sets `tests` (the check above counted it because of the header; now the same run reads 34 of 36). Both stay `not yet met`.

**R34's source test.** The requirement says "the source holds no CIVICSMITH_TEST_INSTANCE"; the job rule is that tests never read source text. I test the behaviour (no upload of the plane or any member carries any of the four names) and leave the source scan to BOB's check if wanted.

**R35's import rule.** Shown by the architecture check ("imports nothing outside it but the two modules": 72 relative imports, 0 failures); the test shows the behavioural half (no exported value changes through install, update and verification; two interleaved `loadFleet` calls see only their own requests; a frozen release fails only the memo).

**Words (K3944, your note 1).** Per the entry and R36 the stage is "old English"; `node checks/words.mjs` with the row filled lists 74 findings in `newgroup/src/steps/` (all inline sentences of the copied code). They are the stage-2 keys; I did not convert any, to keep the copy byte for byte (K624). `setup-words/build.mjs --check`: "rows.mjs and words-unreviewed.json match words.json and the source". The run of `checks/run.mjs` lists 1,171 words findings tranche-wide, none in a module of mine.

**Measured (map §6, §10).** `steps/` 1,734 lines with comments (map: about 1,820). The inherited `realsize` suite passes here: all 4 arms, the `install:` arm's resident growth 0 MB (the map's red in its sandbox does not occur here); peak live memory today 125 MB of 128 (baseline 70) in the install and update with the real fleet, 114 with the repository release and no fleet. R18's gain (about 11 MB) shows only once `installer` delegates (T51-128 lowers the bound to 112), since the bundle does not import `steps/` yet; the bundle stays fresh (nothing imports the new files), stale only after T51-128. Request count per run: R18 adds 9 requests (6 bundles and 3 non-description parts: ocr-worker's wasm; with the container and scanner release the descriptions stay one read each, as the fleet test counts).

**Found in another module.** None. For BOB: `newgroup-bundle-fresh.test.mjs` GATE header and `package.json` `test` script (`node --test test/steps/`) are T51-128's, as the map says.

**Deferred.** The keys stage (R36, R20's and R30's T51 paragraphs); R26, R31 (unbuilt); the 74 words findings.

Size (session_014EVFpcuKfLr1hY4LJt8xfV): test runs 16, module lines 1734
