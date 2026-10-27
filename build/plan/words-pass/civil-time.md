# civil-time: the words check after the conversion (K3949)

Layer 1. 5 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/civil-time/calendar.mjs:111` [copy] "no source stated"
- inline `bio-plane/src/civil-time/calendar.mjs:79` "cannot be read in your team's Civicsmith{}"
- inline `bio-plane/src/civil-time/recurrence.mjs:238` "the fiscal year held for {} is not of the form {start: MM-DD, named..."
- inline `bio-plane/src/civil-time/values.mjs:80` "{} has an {} end"
- testcopy `bio-plane/test/m/civil-time/rules.test.mjs:265` "counted on a correction that governs in your team's Civicsmith, now"
