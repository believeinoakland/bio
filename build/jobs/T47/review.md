# review (T47)

**Status** · session_016AUno3QNTCjsViWYp6mtmK · depth 2 · WORKING · handled B1

## J1 · REPORT

Read whole: `build/requirements/review.md`; the public parts of every module in its Uses (record-core, membership, basis-versions, strength, publication, case-tensions, case-authoring, case-account, ratification, record-grammar, case-grammar) and of `case-inputs`; layer 8's contract and T47's opening rows in `build/layers.md`; `build/extraction/case-authoring-split-2.md` §5–§8; my code (`index.mjs`, `checks.mjs`, `schema.mjs`) and tests (all six files) whole. Baseline on this branch: `node --test bio-plane/test/m/review/` 46 pass, 0 fail.

Reading of the entry: the plan's "R18, R20" are case-authoring's old ids for the list (now `case-inputs` R2/R3); the ids I meet are this module's R15, R26 and R28, as `requirements/review.md` marks them. I build nothing until your CHANGE (case-inputs merged).

Two things I need from you with that CHANGE (neither is mine to write):
1. `build/modules.json`: review's `uses` gains `case-inputs` (plan "Edges added"; my Uses section). Without it `architecture.mjs` will refuse my import of `../case-inputs/index.mjs`.
2. That `case-inputs` exports, as its requirements say, `caseInputsOf(host, deps)`, `statementAcknowledgements(project, caseId, edition, statement, exceptAuthor?, writer?, draftId?)` on the instance with today's answer shape (`statementSha`, `rows`, `truncated`, `byWriter`, `withheldWriterUndetermined`, `withheld_stated`), and `DRAFTS_READ_MAX`. I will reach it through a `caseInputs` dep (default `caseInputsOf(host)`), keep `caseAuthoring` for `publishCase` only, and re-point `invariants.test.mjs` (`DRAFTS_READ_MAX` and the namespace) and the fixture's controlled provider.

No flaw found in my module that this job must fix; header comments naming case-authoring as the list's owner will be corrected with the re-point.
