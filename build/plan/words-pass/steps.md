# steps: the words check after the conversion (K3949)

Layer 6. 6 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/steps/checks.mjs:48` [copy] "Only a member does this, in their own words and by their own choice..."
- inline `bio-plane/src/steps/index.mjs:1116` "a cost is {kind: {}, amount: an exact decimal string, currency: a t..."
- inline `bio-plane/src/steps/index.mjs:559` "a step names its place: {questions}, {project} or {group: true}"
- inline `bio-plane/src/steps/index.mjs:562` "a step's place is exactly one of {questions}, {project} or {group: ..."
- inline `bio-plane/src/steps/index.mjs:585` "a date is {date: YYYY-MM-DD, basis: {}, source?}"
- inline `bio-plane/src/steps/index.mjs:995` "a wait is on one of {step}, {arrival: {kind, id}} or {date}"
