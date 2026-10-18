# plan-work: the words check after the conversion (K3949)

Layer 9. 3 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/plan-work/index.mjs:357` "a rhythm is {rrule, dtstart: YYYY-MM-DD, zone?} in the recurrence s..."
- inline `bio-plane/src/plan-work/index.mjs:564` "a comment is on {option}, {action} or {draft} of this plan, one you..." — text holds a literal {name}, filled by its caller
- inline `bio-plane/src/plan-work/index.mjs:565` "see. Nothing was written."
