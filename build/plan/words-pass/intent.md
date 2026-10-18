# intent: the words check after the conversion (K3949)

Layer 7. 8 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/intent/index.mjs:327` "stages?}, satisfied: {share}}, each name a bare key or id; a filter..."
- inline `bio-plane/src/intent/index.mjs:328` "kinds?, phases?, period?}, with at least one bound, each an exact d..." — text holds a literal {name}, filled by its caller
- testcopy `bio-plane/test/m/intent/grammar.test.mjs:219` [part] "The measure names a declared flow the record does not hold. Declare..." — part test copy
- testcopy `bio-plane/test/m/intent/grammar.test.mjs:220` [part] "or name one that exists. Nothing was written." — part test copy
- testcopy `bio-plane/test/m/intent/grammar.test.mjs:222` [part] "This act is recorded with a reason in your own words, and none was ..." — part test copy
- testcopy `bio-plane/test/m/intent/grammar.test.mjs:223` [part] "why, so the next reader is not left guessing. Nothing was written." — part test copy
- testcopy `bio-plane/test/m/intent/pursuits.test.mjs:12` [part] "Ask an active administrator: they declare, revise or retire an aspi..." — part test copy
- testcopy `bio-plane/test/m/intent/pursuits.test.mjs:13` [part] "own name, and the act carries their name and date."
