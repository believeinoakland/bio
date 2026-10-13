# action-records (T47)

**Status** · session_01TTCcoGoypXZ4pYLxQf7rdP · depth 2 · WORKING · handled B2

## Completion

**Read, whole:** `build/requirements/action-records.md`; `build/extraction/actions-split.md` (all of it, §2, §4, §6 among it); layer 9's contract, its action-grammar section and the T47 opening's table in `build/layers.md` (with the layers table and the jurisdiction rule); the plan's head, rules at the opening, my entry T47-37, the L9 entries naming action-records, the new modules' places and BOB's acts in `build/plan/current.md`; the public parts (Purpose and Provides) of every module in my Uses: record-grammar, record-core, membership, provenance, action-grammar, progressions, standards, civil-time, test-support; the source I copied from, `actions/index.mjs` at every region the map's §2 names and the helpers it copies (header and imports 1–330, the class head, constructor, `#reach`, `migrate`, `#rows`, `#one`, `#nowMs`, `#heldFm`, `#visibleAction` 336–530, 895–990, 2170–2232, 2340–2470, 3200–3721) and `actions/schema.mjs` whole; `actions`' tests I ported (`fixture.mjs` whole, the R18/R19 and R28 arms of `acts.test.mjs`, the R73 arms of `t41.test.mjs`, the R80, R87, R88, R33, R36 and row-census arms of `t45.test.mjs`, the R99 arm of `t46.test.mjs`); every file of my own code and tests as written (P20).

**Entries applied:** T47-37 (N961; K2982): `action-records` built by copy (split map §2, line numbers re-taken on `tranche/T47`), R1–R15.
- `src/action-records/index.mjs` (706 lines with comments): the six acts, the reads `lawProposalsFor`, `riskProposalsFor`, `seeksProposalsFor`, `receiptsOf`, `scopeOf`, `confidential`, `promisesOf`, the judgments `lawEntries`, `badRiskTier`, `standardSeen`, `seeksRefusal` (each made public, body unchanged), the map's constants, `ACTION_RECORDS_WORDS` / `SCOPE_PUBLISHED_STAYS` (R14), `withRow` over action-grammar's families, `actionRecordsOf`, `actionRecordsOwns`, `actionRecordsOps`. `src/action-records/schema.mjs` (134 lines): the six tables' DDL and comments copied, `ACTION_RECORDS_TABLES`, `migrateActionRecords` (the `standard` column added where absent). 840 lines in all (the map said about 720; the copied comments are kept whole).
- No refusal code, text or bound changed; the DEC-49 regions `is-laws-entry`, `is-bad-risk-tier`, `is-risk-propose-basis`, `is-receipt-on-sent`, `is-scope`, `is-promise` moved with their code, each inside the function action-grammar R28 will name.
- Copied (K57): `#visibleAction`, `#heldFm`, `#rows`, `#one`, `#nowMs`, `findingsOf`, `withRow`, `PROPOSAL_SAYS`/`proposalLabelFor`, and `actions`' `NOTE_MAX` (500) as a private constant (R4's account, R5's reason).
- Two fixes in my own copy (P8):
  - `actionLawsPropose` replaced a proposer's rows (a DELETE, then one INSERT per law) with no transaction, so a failure part-way through could leave the old proposal half replaced. It now runs as one `record.transact`, as `actionSeeksPropose` already did.
  - `lawEntries`, now public, answers its refusals with their rows (C-73.2–.5) directly, so `actions.actionLaws` and any later caller get the row without needing their own `withRow`. Through the acts the answer is unchanged.
- R15: `actionRecordsOf` throws on a refused declaration and keeps no instance (`case-account`'s factory keeps one; R15 asks for none).
- I decided the details myself (recorded here): `membership`, `progressions` and `standards` are reached lazily (`#reach`, as in actions); `actionLawsPropose` reads visibility through `#visibleAction` (the same query actions wrote out in full).

**Tests:** `bio-plane/test/m/action-records/`, 19 tests, over a new `fixture.mjs` that never builds `actions` (map §7 risk 1). It writes an action through `record.commit`, a capture as a `register` row (provenance's DDL), and a hidden action inside a project no member joined. `progressions` and `standards` are stand-ins in their R5 shapes.
- `acts` (R1, R2, R3, R12), `records` (R4, R5, R6, R14), `judgments` (R7–R10, each by name with negative controls, and each shown to write nothing), `instance` (R11, R13, R15: one instance per host, deps reached lazily, a running store's rows kept with `standard` added, a refused declaration thrown and no instance kept, the six op arms and their stamps).
- Every refusal has its control. R14's test follows B2 (the `where`'s file clause is action-grammar R28's census).

**Deferred:** none.

**For BOB at merge (K1043):** set `modules.json`'s row for action-records to `paths` `["bio-plane/src/action-records/"]` and `tests` `["bio-plane/test/m/action-records/"]`. `uses` needs no change: `provenance` is already in it, and the tests import only modules it names. With that row, the checks below pass.

**Found in other modules (for T47-38 actions, T47-36 action-grammar, the L11 jobs):**
- `actions` (T47-38):
  - Deletes the copies, creates this module in its factory and drops the six tables from `ACTIONS_TABLES` in the same commit (risk 1).
  - Re-points `#lawEntries`, `#badRiskTier`, `#standardSeen`, `#seeksRefusal` to `this.records.<name>` and the three proposal reads plus the four side-record reads to the plain names above. `lawEntries` now answers with its row, which `actions`' wrapper already added.
  - Its `t45` R36 test pins the receipts, scopes and promises in `ACTIONS_TABLES`; that test changes with the delete.
  - Its census test of `where`s (`t45`, "each code this module mints has its row") reads `src/actions/index.mjs`, so the moved regions leave its scope at T47-36.
- `action-grammar`: `actionReceipt` (R4) mints `MACHINE_CANNOT_CORRESPOND` (C-32.4), `BAD_DATE` (C-33.6), `CAPTURE_AND_TESTIMONY` (C-33.7), `NEITHER_CAPTURE_NOR_TESTIMONY` (C-33.8) and `UNREGISTERED_ARTIFACT` (C-33.9). Each of those rows' `where` names only `actions`' `actionCorrespond`. This was already so inside `actions` before the split (two raising sites, one `where`); after T47-38 the two sites are in two modules. Action-grammar R28 does not list these rows, so whether their `where`s should also name `action-records`' `actionReceipt` is yours to decide (DEC-49's one-site reading).
- No generated artifact is made stale: nothing in the plane imports `src/action-records/` until plane's L11 job spreads `actionRecordsOps`.

**Tests and checks run:**
- action-records: `node --test test/m/action-records/`: tests 19, pass 19, fail 0.
- No provided service of another module changed, and this module has no users yet, so no other module's tests are owed (P11). `build/manifest.md` names no layer tests.
- With the `modules.json` row above set locally (not committed):
  - `node checks/format.mjs /home/user/bio`: 168 modules, 167 requirements files; 0 failures.
  - `node checks/architecture.mjs /home/user/bio action-records`: 7 product files, 26 relative imports; 0 failures.
  - `node checks/coverage.mjs /home/user/bio action-records`: 15 of 15 live requirement ids named by a test; 0 failures.
  - `node checks/ownership.mjs /home/user/bio action-records tranche/T47`: 8 files changed; 0 failures.
  - `node checks/run.mjs /home/user/bio`: architecture 3112 product files, 0 failures; coverage 36 failures, none of them action-records' (other modules' ids not yet met, rule 5 (1)); channels 0 failures.

Size (session_01TTCcoGoypXZ4pYLxQf7rdP): test runs 8, module lines 840

## J1 · QUESTION

R14's second sentence says the moved rows' `where`s name `src/action-records/index.mjs`. Those `where`s are action-grammar's strings (its R28, T47-36), and action-grammar merges after me (L9 order), so at my merge every moved row still names `src/actions/index.mjs #lawEntries …` etc.

My best reading, which I am building on: R14's test here proves what this module holds: every moved row (C-73.2–.5, C-90.2, C-90.6, C-117.39, C-117.48–.52) is a row of action-grammar's families with its code; each refusal this module mints carries that row's check and translation; and each of those rows' region (`is-laws-entry`, `is-bad-risk-tier`, `is-risk-propose-basis`, `is-receipt-on-sent`, `is-scope`, `is-promise`) and its function (`lawEntries`, `badRiskTier`, `actionRiskPropose`, `actionReceipt`, `actionScope`, `actionPromise`) exist in `src/action-records/index.mjs`. The `where`'s file clause is held by action-grammar R28's census test after T47-36. So my test stays green at my merge and still holds once T47-36 re-points the strings (it reads the region and function names, whichever file the `where` names today).

If you want the file clause asserted here instead, it is red until T47-36 and needs naming as an inherited red.
