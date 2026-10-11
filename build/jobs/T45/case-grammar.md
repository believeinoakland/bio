# case-grammar (T45)

**Status** · session_01Bmh48AD6RPe3NjAGrNfTdv · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

Four readings I am building on; each is a detail, so I carry on with them unless you say otherwise.

1. **R14, where the outcomes sit beside the account.** R14 puts the account (R23) "after the claims" and R29's outcomes "after the claims (item 1) and before the findings (item 2)". Reading: claims, the account, the outcomes, the findings (the account is about the claims; the outcomes are what happened since). Heading in the edition: "Outcomes since the last edition", added only when the document carries an `outcomes:` block, numbered as rendered, so every earlier edition renders byte for byte.
2. **R29's body section.** "The body prints the outcomes under one heading": I add `outcomesSectionLines(rows)` beside `outcomesLines`, for `case-authoring` to write, with `OUTCOMES_HEAD` = `## Outcomes since the last edition` and kind words `OUTCOME_KIND_WORDS` {success: "Success", cure: "Cure", harm_addressed: "Harm addressed"} (keys `case.outcome.*`, the UX stream's until given). Each line: kind, date, text, cites. `cites` uses `case-account` R5's cite shape `{kind, ref, ord}` (R23's).
3. **R27's "undecodable".** Today an account whose `text_b64` is not base64 decodes silently to garbage or "" (Node's decoder skips bad characters). Reading: a value that is not strict base64, or whose bytes are not UTF-8, reads null, so nothing is filled (R6). Every document `captureBlockLines` wrote reads as before.
4. **R28's fail-closed edge.** "An answer whose `entries` is not a list holds no row of that capture": reading it for every row of that capture, the `basis: null` (withheld) rows included. The one caller (`case-carriage` R5) always answers a list or null, so nothing it does changes.

## J2 · COMPLETE

**T45-16 applied on `job/T45/case-grammar`** (52ba795709). Files: `bio-plane/src/case-grammar/{blocks,account,complete,index}.mjs`, `outcomes.mjs` (new); `bio-plane/test/m/case-grammar/{blocks,outcomes}.test.mjs` (new), `account.test.mjs`. Nothing outside my paths.

**Read whole by me (P20; K2730):** `build/requirements/case-grammar.md`; all 16 files of `src/case-grammar/` and every test file of `test/m/case-grammar/` (the two golden JSON fixtures excepted, K2053); T45-16, the plan's rules at the opening (rule 4) and the reconciliation R1–R21; `draft-T45-l8.md` §0, §3, §5, §7; K2767, K2780, K2781, K2787, K2789; `BIO_Action_v0_2.md` whole; layer 8's contract; the Uses' public parts as my code reaches them (`record-grammar` `parseFrontmatter`, `canonicalJson`; `strength` `gradingMethodText`); `case-authoring` R65, R71 and `case-account` R5, R6 for the outcome and cite shapes.

**Entries applied (BOB's readings K2829 on J1):**
- **R27** `caseDocumentBlocks`, as built, now tested clause by clause. One flaw fixed (P8): an account whose `text_b64` or `signature_b64` is not strict base64, or whose bytes are not UTF-8, read as whatever Node's lenient decoder made of it; it now reads null (J1 (3)). Every block `captureBlockLines` writes reads as before.
- **R28** `sourceRowsStanding`, tested clause by clause. The edge fails closed: an answer that is not an object, or whose `entries` is not a list (truthy or not), holds no row of that capture, the withheld rows included (J1 (4)), and nothing it is handed (a hostile row or entry) makes it throw. The one caller, `case-carriage` R5, always answers a list or null, so it is unchanged (its 70 tests pass).
- **R29** `outcomes.mjs`: `OUTCOME_FIELDS`, `OUTCOME_KINDS`, `outcomesLines` (no line at all for none, so a document with no outcome keeps its bytes), `outcomesOf` (`[]` without the block or before `/6`), `outcomesSectionLines` (`OUTCOMES_HEAD` "## Outcomes since the last edition", `OUTCOME_KIND_WORDS`), `outcomeWords`, `outcomeCitesWords`. Cites are R23's `{kind, ref, ord}`, canonical JSON in one quoted value. The row has no field for a cause.
- **R14** "Outcomes since the last edition" after the claims and the account, before the findings, only when the block is carried, numbered as rendered. The pre-T37 `/7` goldens, the `/6` golden and the T41 headings still render byte for byte.
- **R23** `ACCOUNT_KINDS` gains `outcome`. The body's account section and the edition's account print no outcome row.

**Mine, done:** `blocks.mjs`' comments cited publication's old ids (R10, R20, R28), which collided with this module's own R27 and R28; they now cite this module's ids and name publication's where meant. `account.mjs` exports `citesOf` for `outcomes.mjs` (not re-exported by `index.mjs`).

**Deferred:** nothing.

**Found in other modules / owed (REPORT):**
- `case-checker`'s generated `program.mjs` is stale: it bundles case-grammar. Its R13 test "the committed program.mjs is that build" is red (rule 4 (5)), as is the plane bundle. Regenerated at the layer's close; I did not touch either.
- `case-authoring` (T45-21) writes R29's block and body section with `outcomesLines` and `outcomesSectionLines`, and R23's `outcome` rows; `case-account` (T45-20) builds them with `kind: "outcome"`.
- The UX stream: `case.outcomes.head` and `case.outcome.{success,cure,harm_addressed}`; until given, "Outcomes since the last edition", "Success", "Cure", "Harm addressed".
- `case-grammar.md`'s Size line: 2,779 lines now (`case-grammar/`).

**Tests and checks:**
- case-grammar: 146 pass, 0 fail (`node --test bio-plane/test/m/case-grammar/`; 125 at the start, 21 new).
- Every module that uses case-grammar: case-carriage 70/70, case-tensions 23/23, publication 134/134, docket 59/59, public-read 158/158, case-catalogue 16/16, ratification 233/233, case-import 96/96, case-disclosures 95/95, case-account 21/21, case-authoring 185/185, review 46/46. case-checker 76 pass, 1 fail: the stale `program.mjs` above, 77/77 before my change.
- Checks: format, 0 failures; architecture, 0 failures; coverage, 29 of 29 live ids named by a test, 0 failures; ownership against `tranche/T45`, 9 files, 0 failures.

Size (session_01Bmh48AD6RPe3NjAGrNfTdv): test runs 9, module lines 2779
