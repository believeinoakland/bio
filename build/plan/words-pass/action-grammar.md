# action-grammar: the words check after the conversion (K3949)

Layer 9. 19 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- handlist `bio-plane/test/m/action-grammar/t45.test.mjs:575` [?] codes: HOLD_PLACE_REFUSED, MACHINE_CANNOT_SEND, HOLD_NOT_IN_PLACE, ... (9 of 11 not the module's own) — handlist
- handlist `bio-plane/test/m/action-grammar/t47.test.mjs:129` [?] codes: MACHINE_CANNOT_CORRESPOND, BAD_DATE, CAPTURE_AND_TESTIMONY, ... (6 of 6 not the module's own) — handlist
- inline `bio-plane/src/action-grammar/checks.mjs:1085` "claims is not a list of 1 to {} {claim, bearing, note?} entries (R24)"
- inline `bio-plane/src/action-grammar/checks.mjs:207` "seeks is not a list of 1 to {} {progression, entity, stage} entries..."
- inline `bio-plane/src/action-grammar/checks.mjs:413` "This action's kind, as written, named the records law it was made u..."
- inline `bio-plane/src/action-grammar/checks.mjs:414` "record names no law from it, and nothing else is inferred from the ..."
- testcopy `bio-plane/test/m/action-grammar/fixture.mjs:20` [part] "Your team's Civicsmith derives only the days" — part test copy
- testcopy `bio-plane/test/m/action-grammar/fixture.mjs:22` [part] "An action is one of the kinds your team's Civicsmith offers:" — part test copy
- testcopy `bio-plane/test/m/action-grammar/grammar.test.mjs:454` [part] "Each entry is dated as recorded and names the entry it follows. You..." — part test copy
- testcopy `bio-plane/test/m/action-grammar/grammar.test.mjs:455` [part] "between entries and whether a STATED due date passed with nothing f..." — part test copy
- testcopy `bio-plane/test/m/action-grammar/grammar.test.mjs:462` [part] "An action is one of the kinds your team's Civicsmith offers: a reco..." — part test copy
- testcopy `bio-plane/test/m/action-grammar/grammar.test.mjs:463` [part] "\"other\", and the kinds the team's jurisdiction profile lists. This ..." — part test copy
- testcopy `bio-plane/test/m/action-grammar/grammar.test.mjs:464` [part] "Choose one of the listed kinds, or \"other\"." — part test copy
- testcopy `bio-plane/test/m/action-grammar/seeks.test.mjs:180` [part] "A records request may name the stages it asks the records for: one ..." — part test copy
- testcopy `bio-plane/test/m/action-grammar/seeks.test.mjs:181` [part] "progression, an entity and a stage in at most 200 characters each, ..." — part test copy
- testcopy `bio-plane/test/m/action-grammar/seeks.test.mjs:182` [part] "records request names them. This write named them otherwise, so not..." — part test copy
- testcopy `bio-plane/test/m/action-grammar/seeks.test.mjs:216` [part] "Which stages a records request asks the records for is a statement ..." — part test copy
- testcopy `bio-plane/test/m/action-grammar/seeks.test.mjs:217` [part] "The credential that asked here is an automated one, or no member is..." — part test copy
- testcopy `bio-plane/test/m/action-grammar/seeks.test.mjs:218` [part] "consider, but it cannot state or change what the request seeks. Not..." — part test copy
