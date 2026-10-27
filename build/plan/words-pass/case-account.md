# case-account: the words check after the conversion (K3949)

Layer 8. 11 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/case-account/document.mjs:17` [copy] "(an unrecorded date)"
- inline `bio-plane/src/case-account/index.mjs:123` "the account is a list of sentences, each {text, cites, bias_stateme..." — text holds braces (ICU syntax in t)
- inline `bio-plane/src/case-account/index.mjs:134` "cites is a list of at most {} {kind, ref, ord}, kind"
- inline `bio-plane/src/case-account/index.mjs:135` "one of {}, ord the leg's for a leg and absent otherwise." — text holds braces (ICU syntax in t)
- inline `bio-plane/src/case-account/index.mjs:155` "is a list of {kind, ref, ord} cites."
- inline `bio-plane/src/case-account/index.mjs:160` "is a list of {kind, ref, ord} cites."
- inline `bio-plane/src/case-account/index.mjs:486` "is {included: [comment ids]}, at most {}."
- testcopy `bio-plane/test/m/case-account/t45-judgment.test.mjs:126` [part] "This sentence cites something from a counsel matter, which is never..." — part test copy
- testcopy `bio-plane/test/m/case-account/t45-judgment.test.mjs:127` [part] "Cite something else, or leave it out. Nothing was written." — part test copy
- testcopy `bio-plane/test/m/case-account/t46.test.mjs:91` [part] "Your own text is checked only in your own project: a hidden project..." — part test copy
- testcopy `bio-plane/test/m/case-account/t46.test.mjs:92` [part] "member. Nothing was written." — part test copy

## Plain findings (K3957)

3 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('case-account.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/case-account/index.mjs:521` "the review comments' reader is a function of {case, edition, viewer, draft}"
- plain `bio-plane/src/case-account/index.mjs:524` "a reader of the case's review comments is already registered, once, at start"
- plain `bio-plane/src/case-account/index.mjs:733` "from nothing; until then it is a draft and never the case's account"

## Test copies of code sentences (K3962)

1 test strings that copy the `en` of a product `localize` call (the check's testcopy arm, tag `code`, civicos-process ea6cd83). Each test compares with `localize(id, en)` or `word(id)` instead, or asserts the key (K3810). A copy of another module's sentence is fixed in this module's own test.

- testcopy `bio-plane/test/m/case-account/t50-words.test.mjs:13` "\"docs/development/ux-substrate/screens/words.json\""
