# workbooks (T51)

**Status** · session_01BnkTWoC5GF8VJe3V4sMRF5 · depth 2 · WORKING · handled B2

## J1 · REPORT

Found in another module, for BOB (not fixed here: P9).

- `bio-plane/src/case-grammar/words.mjs:61` (plain) and `:94` (copy): "not recomputed here: a workbook this group's Civicsmith did not recompute..." / "...this team's Civicsmith did not reco...". The sentence is case-grammar's own member-read text. It copies the workbooks module's "not recomputed here" disclosure wording, so it belongs in case-grammar's job, which should read it by key. The workbooks module's own key for the same meaning is `workbooks.recomputed` (index.mjs:35-37).

Decision for the words pass (T51-264), so BOB can check it:

- The one `plain` finding, `bio-plane/src/workbooks/index.mjs:517`, was the second half of the grade-facts `rule` text returned by `readWorkbook` (R12). `readWorkbook` answers that to members, so I treated it as a sentence people read. It is now `localize("workbooks.index.k1447_grade_rule", <the full sentence, one literal>)`. The wording is unchanged. `rows.mjs` is stale for this id, which is expected until BOB regenerates it at L1's close.
- No test copies the rule's text. The R12 test asserts behaviour, not the sentence.

## J2 · COMPLETE

T51-264 (words pass, workbooks) is applied; nothing deferred.

Applied: the one `plain` finding, `bio-plane/src/workbooks/index.mjs:517`, the grade-facts rule text (R12), is now `localize("workbooks.index.k1447_grade_rule", ...)`. Wording unchanged. Import changed to `{ word, localize }`. Reasoning and the other-module findings are in the REPORT posted just before this entry.

Merged `tranche/T51` into the branch (`b6473c33ff`, no rebase); the merge brought no change to this module's paths, and the tests and checks were re-run after it.

Tests and checks:
- `node --test "test/m/workbooks/**/*.test.mjs"`: `tests 26`, `pass 26`, `fail 0`.
- `checks/format.mjs`: `175 modules, 174 requirements files; 0 failures`.
- `checks/architecture.mjs workbooks`: `15 product files, 55 relative imports (0 naming no tracked file, not judged); 0 failures`.
- `checks/coverage.mjs workbooks`: `1 modules, 18 of 18 live requirement ids named by a test; 0 failures`.
- `checks/ownership.mjs ... tranche/T51 job/T51/workbooks`: `2 files changed by workbooks ...; 0 failures` (the module file and this record).
- `checks/run.mjs /home/user/bio`: the product-wide run is not clean (words `3775 failures`, coverage `30 failures`, all in other modules). No finding names `workbooks`; the two `case-grammar` lines are reported above.
- `setup-words/build.mjs --check`: the expected stale-rows note for `rows.mjs` (it lacks `workbooks.index.k1447_grade_rule`, which BOB regenerates at L1's close), and no refusal naming this module.

Size (session_01TeE3fNR4NDUXScqV2cLzgW): test runs 2, module lines 1589
