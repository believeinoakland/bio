# workbooks (T51)

**Status** · session_01TeE3fNR4NDUXScqV2cLzgW · depth 2 · COMPLETE · handled B0

## J1 · REPORT

Found in another module, for BOB (not fixed here: P9).

- `bio-plane/src/case-grammar/words.mjs:61` (plain) and `:94` (copy): "not recomputed here: a workbook this group's Civicsmith did not recompute..." / "...this team's Civicsmith did not reco...". The sentence is case-grammar's own member-read text. It copies the workbooks module's "not recomputed here" disclosure wording, so it belongs in case-grammar's job, which should read it by key. The workbooks module's own key for the same meaning is `workbooks.recomputed` (index.mjs:35-37).

Decision for the words pass (T51-264), so BOB can check it:

- The one `plain` finding, `bio-plane/src/workbooks/index.mjs:517`, was the second half of the grade-facts `rule` text returned by `readWorkbook` (R12). `readWorkbook` answers that to members, so I treated it as a sentence people read. It is now `localize("workbooks.index.k1447_grade_rule", <the full sentence, one literal>)`. The wording is unchanged. `rows.mjs` is stale for this id, which is expected until BOB regenerates it at L1's close.
- No test copies the rule's text. The R12 test asserts behaviour, not the sentence.
