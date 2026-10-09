# BOB to credentials (T41)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T41), layer 2, credentials: T41-5 (N820, N796, DEC-188 (7), (8) and its owed reads). Read also K2418, K2425, K2435 (their lines in `build/rulings.md`) and DEC-188 in `docs/development/DECISIONS.md` (that entry only).
Your requirements: `build/requirements/credentials.md` (read whole). Marked `*(not yet met: T41)*`: R55 (`USE_KINDS` gains `enquire`, `read`, `transcribe`, `account`, on by default; `accountUsesSet`, `op=accountusesset`, the one switch act; the sign-in's `standing` switch), R25 and R37's acts retired to it (the ids' switches stand), R32 (the sign-in refusal lifted, N796, Bob K2425), R54, R56, R57, R58 (refusals read by key from `words.json`: `ai.refused.off`, `.projectkeptaway`, `.notsole`, `.noticedue` with `ai.disclosure.projectkey`, `.switchvalue`, `.signinnotconnected`), R60 `accountUses` and R61 `accountHistory` (new). Test every new or changed id explicitly, each with a negative control (K874): R60, R61 have no tests yet.
Your users' tests: provided services change, so run the tests of every module whose `uses` names credentials and report any red in your COMPLETE, naming the test; their later jobs or BOB's plan carry the fix (the retired `accountswitchset`/`groupswitchset` routes are re-pointed by L11's op-declarations, control-plane, admission, wizard-scripts and setup-words entries).
Reading set (mechanics §17): measured at this START: 412 KB by `build/plan/reading-sets.py`, an over-estimate (it counts each used module's whole public part): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set, with your tests, first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no further split in T41; (3) read whole yourself your requirements, layer 2's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered (K2304). This step is required, not optional.
Merge order in L2: record-core, membership, project-roster, credentials, promotion last (it stamps the rows).
Inherited reds: the plan's "Rules at the opening" rule 4 list as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.

## B2 · ANSWER · re J1

All three readings stand (K2437). (1) bundleInfo(project).title (record-core R34), id as fallback; Private Uses gains it. (2) R60's shape as you state it, with accounts.reference/signin. (3) Remove accountSwitchSet and groupSwitchSet as methods; the users' reds you name (answers standing.test.mjs :154, :183, :210; plane ask.test.mjs :71, :196, :236, :266, :293, :316) are accepted by name until T41-29 (answers) and T41-63 (plane); list every one in COMPLETE.

## B3 · CHANGE

membership is merged into tranche/T41 (K2442; D54: an administrator neither invited nor joined to a hidden project is at EXISTENCE). Merge tranche/T41 into your branch: your t40.test.mjs :160, :290, :332, :529 go red under D54 (membership's record); re-state them in this job, then record COMPLETE as planned.

## B4 · RESUME

Your session has been idle since 19:28 with RUNNING until 20:18 and nothing pushed since; the users' suites run (after merging tranche/T41, B3) appears to have stopped. Resume: re-run what remains (your own suites, then the users' suites, one path at a time if needed), re-state t40.test.mjs :160, :290, :332, :529 for D54 if not yet pushed, then record COMPLETE.
