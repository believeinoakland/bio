# conformance: the words check after the conversion (K3949)

Layer 9. 7 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- testcopy `bio-plane/test/m/conformance/dec149.test.mjs:21` [part] "Name which side of the question states what the standard requires, ..." — part test copy
- testcopy `bio-plane/test/m/conformance/dec149.test.mjs:22` [part] "team's Civicsmith never chooses it. Nothing was written." — part test copy
- testcopy `bio-plane/test/m/conformance/dec149.test.mjs:25` [part] "Civicsmith never chooses it. Nothing was written." — part test copy
- testcopy `bio-plane/test/m/conformance/determine.test.mjs:549` [part] "The reason for superseding a determination is not text of at most 5..." — part test copy
- testcopy `bio-plane/test/m/conformance/determine.test.mjs:550` [part] "briefly. Nothing was written."
- testcopy `bio-plane/test/m/conformance/t46-words.test.mjs:46` [part] "office's. Nothing was written." — part test copy
- testcopy `bio-plane/test/m/conformance/t46-words.test.mjs:55` [part] "of these. Nothing was written." — part test copy

## Test copies of code sentences (K3962)

10 test strings that copy the `en` of a product `localize` call (the check's testcopy arm, tag `code`, civicos-process ea6cd83). Each test compares with `localize(id, en)` or `word(id)` instead, or asserts the key (K3810). A copy of another module's sentence is fixed in this module's own test.

- testcopy `bio-plane/test/m/conformance/dec149.test.mjs:24` "\"name which side of the question states what the standard requires, ...\""
- testcopy `bio-plane/test/m/conformance/t46-words.test.mjs:52` "\"A determination rests on findings of\""
- testcopy `bio-plane/test/m/conformance/t46-words.test.mjs:53` "\"three kinds: published by this project in a ratified case edition; ...\""
- testcopy `bio-plane/test/m/conformance/t46-words.test.mjs:54` "\"this project; or another team's finding this team has accepted at t...\""
- testcopy `bio-plane/test/m/conformance/t46-words.test.mjs:56` "\"That determination reads\""
- testcopy `bio-plane/test/m/conformance/t46-words.test.mjs:57` "\"undetermined: a finding it rests on no longer stands (its check was...\""
- testcopy `bio-plane/test/m/conformance/t46-words.test.mjs:58` "\"the edition accepted). A member re-evaluates it by superseding it w...\""
- testcopy `bio-plane/test/m/conformance/t46-words.test.mjs:59` "\"stand. Nothing was written.\""
- testcopy `bio-plane/test/m/conformance/t46-words.test.mjs:60` "\"A cure is already recorded for that breach against\""
- testcopy `bio-plane/test/m/conformance/t46-words.test.mjs:61` "\"that standard. End that link first, saying why. Nothing was written.\""
