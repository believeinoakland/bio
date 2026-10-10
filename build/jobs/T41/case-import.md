# case-import (T41)

**Status** · session_01KJ4zxTUbTA3VAHVeTVs72b · depth 2 · WORKING · handled B1

## J1 · QUESTION

Two readings, the first decides how R23 is built.

**Q1 (R23: a synchronous read over an asynchronous checker).** R23 puts the importer's-lens assessment into R4's read, `importedCase`. That read is synchronous, and must stay so: `case-disclosures` R13 (`acceptedWorkJudged`, `case-disclosures/index.mjs:631`) calls it synchronously inside its pre-flight. But `case-checker.checkCaseFile` (its R1, and R23's `lens` with it) answers a promise, because it verifies signatures with WebCrypto. A synchronous read cannot run it, and the importer's lens can change after the import (an adoption), so an assessment recorded at import goes stale. Options:
1. *(recommended)* `case-checker` R23 also offers a pure, **synchronous** re-weighing, e.g. `reweigh({parts, documents, answer, lens})`, taking the as-published answer already recorded (so no signature is verified again) and answering what R23 answers per finding (`pair`, `bar_met`, the statements that changed it, the limit sentence). case-import's R4 calls it on every read with the reader lens built from `bias.statementInForce` (synchronous, R49), so the lens is always the one in force and nothing goes stale. One body of lens code, still case-checker's. CASE-CHECKER #10 has only just started, so the cost is a sentence in its R23.
2. `importedCase` becomes async; `case-disclosures` R13 and its callers must await it (a service change for a later L8 module, and its pre-flight becomes async).
3. case-import records the assessment at import and completion under the lens then in force; the read answers it with that lens's `statements_sha` and whether it is still the lens in force; refreshing needs a new act and op (L11 surface).
Until you answer I build option 1 against an injected synchronous re-weigher (a dep, default case-checker's export once it exists), so only the call changes.

**Q2 (R22: `findings: "all"` when nothing can be accepted).** My reading: "all" takes every finding of the edition; it accepts those `recreated` and those `recreated_in_part` whose every missing entry `gaps` states, and answers `not_accepted: [{finding, ref, result, why, unstated?}]` for the rest (`did_not_recreate`, or in part with the gaps it leaves unstated named). When it would accept none, it writes nothing and refuses: `IMPORT_NO_SUCH_FINDING` for an edition with no findings; else `IMPORT_ACCEPT_GAPS_UNSTATED` when some finding recreated in part could be accepted by stating its gaps (naming them); else `IMPORT_ACCEPT_NOT_RECREATED` naming each finding. No new catalogue row. I carry on with this.
