# case-tensions: the words check after the conversion (K3949)

Layer 8. 3 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- testcopy `bio-plane/test/m/case-tensions/attribution.test.mjs:68` [part] "Choosing how a published case shows who said your observation" — part test copy
- testcopy `bio-plane/test/m/case-tensions/attribution.test.mjs:69` [part] "records why, in your own words, and no reason was given, or it is l..." — part test copy
- testcopy `bio-plane/test/m/case-tensions/fixture.mjs:103` [part] "this case document is signed"

## Plain findings (K3957)

3 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('case-tensions.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/case-tensions/index.mjs:565` "this call carries nobody; the plane stamps who chose from the credential"
- plain `bio-plane/src/case-tensions/index.mjs:581` "the reason is blank. Say in your own words why you choose this level"
- plain `bio-plane/src/case-tensions/index.mjs:637` "level, or set a handle first"
