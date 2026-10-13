# consequences (T47)

**Status** · session_01HtmhyB8kuFW9FP4zpwGv2t · depth 2 · WORKING · handled B0

## Completion

**Entries applied** (T47-35):
- (N958) R24's audit clause: the `test.todo` naming N958 is now a test (`t46.test.mjs`, "R24 (T47, N958) …"). A success record recorded before the promotion (held in the rows, then promoted) and one recorded after it, its successor, and a consequence part each audit clean through `record.auditPass`. Each also gives no finding when its stored image goes through `checkBundle` with the record's grammars. Control: the same `success_record` object with a slug after its `SUC-` id gives `C-1.2`. No source change was needed: record-grammar R62 (T47-1) already admits the object.
- (N908) R22: `outcomeCarry` calls `carryOutcome` on case-inputs' one instance for the host (`caseInputsOf`, its R16), not case-authoring's. The dependency `caseAuthoring` is now `caseInputs`, and the import of `case-authoring` is gone. Comments in `index.mjs`, `checks.mjs` and `schema.mjs` are re-pointed. The fixture's recording stand-in is renamed `caseInputs`. A new test in `carry.test.mjs`, "R22 (T47, N908) …", drives the real case-inputs instance on the host with no `caseInputs` given. It checks that NO_SUCH_CASE, CARRY_NOT_A_PARTICIPANT and BAD_CARRIED_OUTCOME (both arms) each equal case-inputs' own answer to the same call, whole, and write nothing. Its control carries each of the three kinds and finds them pending on `caseInputsOf(host)`. No cause, figure or sequence is passed.

**Reading set** (over the limit, mechanics §17): I read these whole myself: the requirements; all four source files (`index.mjs`, `checks.mjs`, `schema.mjs`, `measures.mjs`); the tests I changed (`fixture.mjs`, `carry.test.mjs`, `t46.test.mjs`); case-inputs' public part (Purpose, Provides R1–R17); record-grammar R62. A helper read the other eight test files whole (`addressed`, `assessed`, `computed`, `person`, `reads`, `record`, `success`, `void`) and gave me a digest that cites each test by title. It found no reference to case-authoring or `carryOutcome` in them, and no test that checks source text.

**Deferred / found in this module (not fixed, why):**
- `outcomeCarry` throws a TypeError when the module has no host and no `caseInputs` (a test-only construction). R22 names no refusal code for this, so I did not mint one.
- Nits from the digest, left alone because they are cosmetic and outside this job's entries: `reads.test.mjs` imports `sha` and never uses it; `record.test.mjs` has a stale duplicate comment ("MEASURE_INVALID's arms").

**For BOB, in other files:** `build/modules.json` still lists `case-authoring` in consequences' `uses`. R22 and the requirements' Uses (N908, K2982) drop it. The module no longer imports it, so the edge can go; the file is BOB's.

**Tests and checks:**
- `node --test bio-plane/test/m/consequences/`: tests 65, pass 65, fail 0, todo 0.
- `format`: 0 failures. `architecture` (consequences): 0 failures. `coverage` (consequences): 25 of 25 live ids named, 0 failures. `ownership` (tranche/T47): 7 files, 0 failures.
- `checks/run.mjs` over the product: format 0, architecture 0, channels 0. Coverage has 37 failures, all inherited from other modules (screens-*, signin-door, tasks, setup-words, wizard-scripts); none is consequences'.

Size (session_01HtmhyB8kuFW9FP4zpwGv2t): test runs 7, module lines 2178
