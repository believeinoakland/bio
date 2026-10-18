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

18 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('query-language.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/query.mjs:97` "a capture letter is bounded by the fidelity of the text the leg rests on"
- plain `bio-plane/src/query.mjs:127` "the clock's next date is projected when the action is written, and an entry met, waived"
- plain `bio-plane/src/query.mjs:132` "the flag was computed on the local day of that write, so an action whose date has passed"
- plain `bio-plane/src/query.mjs:465` "the inquiry whose basis carries such a leg"
- plain `bio-plane/src/query.mjs:499` "rests on cannot support B"
- plain `bio-plane/src/query.mjs:568` "the authored letter stands unchanged"
- plain `bio-plane/src/query.mjs:573` "an inquiry resting on four legs answers with four rows"
- plain `bio-plane/src/query.mjs:584` "the record carrying a capture whose reference resolved so"
- plain `bio-plane/src/query.mjs:587` "the record carrying a capture that concerns the subject"
- plain `bio-plane/src/query.mjs:629` "the document holding such a content row"
- plain `bio-plane/src/query.mjs:816` "cited or citable, and it says which"
- plain `bio-plane/src/query.mjs:866` "the document holding an indexed unit whose text matches"
- plain `bio-plane/src/query.mjs:920` "not a content row until a member cites it or the assistant proposes it"
- plain `bio-plane/src/query.mjs:2008` "projection: not a table and a key; the projection is read from bundles"
- plain `bio-plane/src/query.mjs:2022` "fields: not a map of fields to relations; every field is read as before"
- plain `bio-plane/src/query.mjs:2985` "it carries ids: a selection, not a search, and a selection is not re-run"
- plain `bio-plane/src/query.mjs:2999` "no term of it compiles"
- plain `bio-plane/src/query.mjs:3003` "its sort cannot be read, so what would be saved is not what would run"
