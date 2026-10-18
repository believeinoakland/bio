# filing-templates: the words check after the conversion (K3949)

Layer 9. 11 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- handlist `bio-plane/test/m/filing-templates/invariants.test.mjs:202` [?] ops: templateapprove, templatecomment, templatecomments, ... (13 of 13 not the module's own)
- inline `bio-plane/src/filing-templates/checks.mjs:31` [copy] "This template isn't offered yet: it lacks {missing}." — text holds a literal {name}, filled by its caller
- inline `bio-plane/src/filing-templates/checks.mjs:95` "The words name a blank that no filing fills. Use only the blanks fi..."
- inline `bio-plane/src/filing-templates/index.mjs:126` "{{{}}} is not a blank filings fill{}"
- inline `bio-plane/src/filing-templates/index.mjs:996` [copy] "an undetermined tier"
- testcopy `bio-plane/test/m/filing-templates/invariants.test.mjs:138` [part] "Two templates you can see go by that name here, so neither was chosen." — part test copy
- testcopy `bio-plane/test/m/filing-templates/invariants.test.mjs:139` [part] "Pick the template by its id. Nothing was drafted."
- testcopy `bio-plane/test/m/filing-templates/invariants.test.mjs:233` [part] "A template is written for jurisdiction profiles your team's Civicsmith" — part test copy
- testcopy `bio-plane/test/m/filing-templates/invariants.test.mjs:234` [part] "holds, or for none in particular (general), and a profile named is ..." — part test copy
- testcopy `bio-plane/test/m/filing-templates/invariants.test.mjs:235` [part] "A review grant opens by a secret link your team's Civicsmith makes,..." — part test copy
- testcopy `bio-plane/test/m/filing-templates/invariants.test.mjs:236` [part] "was made for this request. Nothing was granted."
