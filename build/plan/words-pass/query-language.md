# query-language: the words check after the conversion (K3949)

Layer 5. 7 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- testcopy `bio-plane/test/m/query-language/converts.test.mjs:207` [part] "content:chain=does-not-apply" — part test copy
- testcopy `bio-plane/test/m/query-language/converts.test.mjs:208` [part] "content:chain=undetermined" — part test copy
- testcopy `bio-plane/test/m/query-language/grammar.test.mjs:204` [part] "content:cap=does-not-apply" — part test copy
- testcopy `bio-plane/test/m/query-language/grammar.test.mjs:205` [part] "content:chain=undetermined" — part test copy
- testcopy `bio-plane/test/m/query-language/grammar.test.mjs:206` [part] "content:chain=does-not-apply" — part test copy
- testcopy `bio-plane/test/m/query-language/grammar.test.mjs:271` [part] "read as its terms joined by AND" — part test copy
- testcopy `bio-plane/test/m/query-language/statements.test.mjs:140` "are not weighed separately" — partial test copy (template not matched to a row)

## Plain findings (K3957)

3 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('query-language.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/query.mjs:97` "a capture letter is bounded by the fidelity of the text the leg rests on"
- plain `bio-plane/src/query.mjs:127` "the clock's next date is projected when the action is written, and an entry met, waived"
- plain `bio-plane/src/query.mjs:132` "the flag was computed on the local day of that write, so an action whose date has passed"

## Test copies of code sentences (K3962)

3 test strings that copy the `en` of a product `localize` call (the check's testcopy arm, tag `code`, civicos-process ea6cd83). Each test compares with `localize(id, en)` or `word(id)` instead, or asserts the key (K3810). A copy of another module's sentence is fixed in this module's own test.

- testcopy `bio-plane/test/m/query-language/t33.test.mjs:214` "\"is not available here; read as nothing\""
- testcopy `bio-plane/test/m/query-language/t33.test.mjs:226` "\"can hold many values per record; not a sort\""
- testcopy `bio-plane/test/m/query-language/t33.test.mjs:230` "\"can hold many values per record; not a facet\""
