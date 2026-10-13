# review (T47)

**Status** · session_016AUno3QNTCjsViWYp6mtmK · depth 2 · WORKING · handled B2

## Completion (REVIEW #13)

**Entry applied** · T47-33 (N908; split map §5), after B3's CHANGE with `tranche/T47` merged (case-inputs merged, K3112; review → case-inputs in `modules.json`, K3109):
- **R15, R28** The acknowledgement list is read from `case-inputs`' one instance for the host (`caseInputsOf`, its R16), `statementAcknowledgements` (its R2), through a new `caseInputs` dep (default `caseInputsOf(host)`); `caseAuthoring` is kept for `publishCase` alone (R13). The answer, the writer's withholding, the `act` link and `act_requires` are unchanged.
- **R26** `invariants.test.mjs` imports `DRAFTS_READ_MAX` and the namespace from `case-inputs` (case-authoring's namespace kept beside it, as C-32.6's home for the R23 "moved, never copied" arm); the comments name `case-inputs` R3 as the reader of `case_drafts` under `REVIEW_LIST_MAX`.
- case-inputs' merged exports checked against its requirements (B3): `caseInputsOf`, `statementAcknowledgements(project, caseId, edition, statement, exceptAuthor, writer, draftId, link)` answering `statementSha`, `rows` (with `reason`), `truncated`, `byWriter`, `withheldWriterUndetermined`, `withheld_stated`, and `DRAFTS_READ_MAX` (500): as stated, no difference.

**Tests** · the fixture's list is now a `caseInputs` provider; its `caseAuthoring` keeps a recorded `statementAcknowledgements` as a negative control (asserted never called). New: "R15, R28 (T47; N908)", over the real `case-inputs` on a host handing it none: the instance is the host's, rows stored in its table at the draft's identity are listed (another draft's and another sentence's are not), the writer's row withheld and counted with case-inputs' own `withheld_stated`, on both doors. Control: pointed back at case-authoring, both R15 tests fail (checked, then restored).

**Read** · listed in J1 (the whole reading set, my code and tests whole). No flaw found in my module; nothing deferred. Nothing found in another module.

**Tests and checks** (on `job/T47/review`, `tranche/T47` merged)
- `node --test bio-plane/test/m/review/`: tests 47, pass 47, fail 0 (46 before; one added).
- No provided service changed, so no user's tests are owed (P11).
- `checks/format.mjs`: 168 modules, 0 failures; `architecture.mjs … review`: 9 files, 50 imports, 0 failures; `coverage.mjs … review`: 33 of 33 live ids named, 0 failures; `ownership.mjs … review tranche/T47`: 5 files, 0 failures.
- `checks/run.mjs`: format 0, architecture 0 failures (3097 files), channels 0; coverage 42 failures, none review's (screens and other modules, inherited).

Size (session_016AUno3QNTCjsViWYp6mtmK): test runs 5, module lines 1317

## J1 · REPORT

Read whole: `build/requirements/review.md`; the public parts of every module in its Uses (record-core, membership, basis-versions, strength, publication, case-tensions, case-authoring, case-account, ratification, record-grammar, case-grammar) and of `case-inputs`; layer 8's contract and T47's opening rows in `build/layers.md`; `build/extraction/case-authoring-split-2.md` §5–§8; my code (`index.mjs`, `checks.mjs`, `schema.mjs`) and tests (all six files) whole. Baseline on this branch: `node --test bio-plane/test/m/review/` 46 pass, 0 fail.

Reading of the entry: the plan's "R18, R20" are case-authoring's old ids for the list (now `case-inputs` R2/R3); the ids I meet are this module's R15, R26 and R28, as `requirements/review.md` marks them. I build nothing until your CHANGE (case-inputs merged).

Two things I need from you with that CHANGE (neither is mine to write):
1. `build/modules.json`: review's `uses` gains `case-inputs` (plan "Edges added"; my Uses section). Without it `architecture.mjs` will refuse my import of `../case-inputs/index.mjs`.
2. That `case-inputs` exports, as its requirements say, `caseInputsOf(host, deps)`, `statementAcknowledgements(project, caseId, edition, statement, exceptAuthor?, writer?, draftId?)` on the instance with today's answer shape (`statementSha`, `rows`, `truncated`, `byWriter`, `withheldWriterUndetermined`, `withheld_stated`), and `DRAFTS_READ_MAX`. I will reach it through a `caseInputs` dep (default `caseInputsOf(host)`), keep `caseAuthoring` for `publishCase` only, and re-point `invariants.test.mjs` (`DRAFTS_READ_MAX` and the namespace) and the fixture's controlled provider.

No flaw found in my module that this job must fix; header comments naming case-authoring as the list's owner will be corrected with the re-point.
