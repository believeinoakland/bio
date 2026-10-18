# duties: the words check after the conversion (K3949)

Layer 5. 15 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/duties/index.mjs:1112` [copy] "the precision held does not say"
- inline `bio-plane/src/duties/index.mjs:1204` [copy] "its stated review date"
- inline `bio-plane/src/duties/index.mjs:1646` [copy] "a read names the member reading; an absent viewer is neither an adm..."
- inline `bio-plane/src/duties/index.mjs:1714` [copy] "undetermined at the date asked"
- inline `bio-plane/src/duties/index.mjs:308` "this organisation's sector is {}, and no {} line, and no source it ..."
- inline `bio-plane/src/duties/index.mjs:309` "an entity of kind {} owes no obligation." — string concatenation (operand is a conditional or logical expression)
- inline `bio-plane/src/duties/index.mjs:326` "they are the team's own deadlines on its actions, never a body's ob..."
- inline `bio-plane/src/duties/vocab.mjs:35` [copy] "is owed to" — leaf: loads nothing
- inline `bio-plane/src/duties/vocab.mjs:36` [copy] "holds the power" — leaf: loads nothing
- testcopy `bio-plane/test/m/duties/acts.test.mjs:119` [part] "computed from the profile rule"
- testcopy `bio-plane/test/m/duties/acts.test.mjs:96` [part] "computed from the profile rule"
- testcopy `bio-plane/test/m/duties/t46-words.test.mjs:31` [part] "the report requires. This is neither. Nothing was written." — part test copy
- testcopy `bio-plane/test/m/duties/t46-words.test.mjs:33` [part] "of that document. Nothing was written." — part test copy
- testcopy `bio-plane/test/m/duties/t46-words.test.mjs:34` [part] "This promise rests on a commitment that is still only proposed as a..." — part test copy
- testcopy `bio-plane/test/m/duties/t46-words.test.mjs:40` [part] "as written and never completed. Nothing was written." — part test copy
