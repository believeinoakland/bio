# case-grammar (T45)

**Status** · session_01Bmh48AD6RPe3NjAGrNfTdv · depth 2 · WORKING · handled B1

## J1 · QUESTION

Four readings I am building on; each is a detail, so I carry on with them unless you say otherwise.

1. **R14, where the outcomes sit beside the account.** R14 puts the account (R23) "after the claims" and R29's outcomes "after the claims (item 1) and before the findings (item 2)". Reading: claims, the account, the outcomes, the findings (the account is about the claims; the outcomes are what happened since). Heading in the edition: "Outcomes since the last edition", added only when the document carries an `outcomes:` block, numbered as rendered, so every earlier edition renders byte for byte.
2. **R29's body section.** "The body prints the outcomes under one heading": I add `outcomesSectionLines(rows)` beside `outcomesLines`, for `case-authoring` to write, with `OUTCOMES_HEAD` = `## Outcomes since the last edition` and kind words `OUTCOME_KIND_WORDS` {success: "Success", cure: "Cure", harm_addressed: "Harm addressed"} (keys `case.outcome.*`, the UX stream's until given). Each line: kind, date, text, cites. `cites` uses `case-account` R5's cite shape `{kind, ref, ord}` (R23's).
3. **R27's "undecodable".** Today an account whose `text_b64` is not base64 decodes silently to garbage or "" (Node's decoder skips bad characters). Reading: a value that is not strict base64, or whose bytes are not UTF-8, reads null, so nothing is filled (R6). Every document `captureBlockLines` wrote reads as before.
4. **R28's fail-closed edge.** "An answer whose `entries` is not a list holds no row of that capture": reading it for every row of that capture, the `basis: null` (withheld) rows included. The one caller (`case-carriage` R5) always answers a list or null, so nothing it does changes.
