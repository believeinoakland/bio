# connections: the words check after the conversion (K3949)

Layer 5. 14 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/connections/index.mjs:1039` [copy] "the target's bytes were seen unchanged on both sides of the source'..."
- inline `bio-plane/src/connections/index.mjs:1040` [copy] "which version of the target the source pointed at is undetermined"
- inline `bio-plane/src/connections/index.mjs:302` "(read at {} and {})" — string concatenation (operand is a conditional or logical expression)
- inline `bio-plane/src/connections/index.mjs:303` "(read at {} on one end only; the other reading does not say where)" — string concatenation (operand is a conditional or logical expression)
- inline `bio-plane/src/connections/index.mjs:694` "; {} cannot be placed"
- inline `bio-plane/src/connections/mentioned.mjs:51` [copy] "a read names the member reading; an absent viewer is neither an adm..."
- inline `bio-plane/src/connections/stepsources.mjs:135` [copy] "a read names the member reading; an absent viewer is neither an adm..."
- inline `bio-plane/src/connections/themes.mjs:257` [copy] "no longer a member of"
- inline `bio-plane/src/connections/themes.mjs:257` [copy] "no longer proposed for"
- testcopy `bio-plane/test/m/connections/converts-position.test.mjs:67` "the connection is through the reference" — regex
- testcopy `bio-plane/test/m/connections/dec149.test.mjs:13` [part] "an agenda item's membership in a file, derived from where the file ..." — part test copy
- testcopy `bio-plane/test/m/connections/dec149.test.mjs:14` [part] "neither end to the other, so this is an inference from position, to..." — part test copy
- testcopy `bio-plane/test/m/connections/dec149.test.mjs:15` "is printed under the agenda item" — partial test copy (template not matched to a row)
- testcopy `bio-plane/test/m/connections/owner.test.mjs:122` [part] "co-mention states no dates" — part test copy
