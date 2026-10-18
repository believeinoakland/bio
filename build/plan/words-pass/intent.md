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

## Plain findings (K3957)

3 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('intent.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/intent/index.mjs:62` "declaring, revising or retiring an aspiration the whole team holds"
- plain `bio-plane/src/intent/index.mjs:529` "stage's grade unknown), so whether it reaches the required grade is not known"
- plain `bio-plane/src/intent/index.mjs:605` "not known; it is never taken as zero"

## Test copies of code sentences (K3962)

1 test strings that copy the `en` of a product `localize` call (the check's testcopy arm, tag `code`, civicos-process ea6cd83). Each test compares with `localize(id, en)` or `word(id)` instead, or asserts the key (K3810). A copy of another module's sentence is fixed in this module's own test.

- testcopy `bio-plane/test/m/intent/pursuits.test.mjs:24` "\"is an administrator's act\""
