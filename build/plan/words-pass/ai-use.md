# ai-use: the words check after the conversion (K3949)

Layer 6. 31 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/ai-use/checks.mjs:28` [copy] "Standing questions"
- inline `bio-plane/src/ai-use/checks.mjs:49` [copy] "on {month} 1"
- inline `bio-plane/src/ai-use/checks.mjs:62` "The assistant stopped here: {whose} {period} limit for {use} is rea..." — text holds a literal {name}, filled by its caller
- inline `bio-plane/src/ai-use/checks.mjs:63` "Everything else works as usual." — text holds a literal {name}, filled by its caller
- inline `bio-plane/src/ai-use/checks.mjs:64` "The assistant stopped here: {whose} {period} limit is reached. It w..." — text holds a literal {name}, filled by its caller
- inline `bio-plane/src/ai-use/checks.mjs:65` "Everything else works as usual." — text holds a literal {name}, filled by its caller
- inline `bio-plane/src/ai-use/checks.mjs:66` "The assistant stopped here: you have used the {period} amount each ..." — text holds a literal {name}, filled by its caller
- inline `bio-plane/src/ai-use/checks.mjs:67` "{whose} account. It works again {when}. Everything else works as us..." — text holds a literal {name}, filled by its caller
- inline `bio-plane/src/ai-use/checks.mjs:68` "The assistant stopped here: your team's Civicsmith couldn't check t..." — text holds a literal {name}, filled by its caller
- inline `bio-plane/src/ai-use/checks.mjs:69` "now, and it spends nothing it can't count. Try again in a moment. E..." — text holds a literal {name}, filled by its caller
- inline `bio-plane/src/ai-use/checks.mjs:70` "That limit can't be set: {field}. A limit is a positive amount in d..."
- inline `bio-plane/src/ai-use/checks.mjs:71` "for a day or a month."
- inline `bio-plane/src/ai-use/checks.mjs:81` [copy] "Exploring is off on {whose} account. Its owners can switch it on." — text holds a literal {name}, filled by its caller
- inline `bio-plane/src/ai-use/checks.mjs:82` "The assistant can't explore this question on {whose} account: it li..." — text holds a literal {name}, filled by its caller
- inline `bio-plane/src/ai-use/checks.mjs:83` "the account's owners chose to explore."
- inline `bio-plane/src/ai-use/checks.mjs:85` "The assistant found something worth exploring in {scope} today: {wh..." — text holds a literal {name}, filled by its caller
- inline `bio-plane/src/ai-use/checks.mjs:86` "{account}? If nobody says yes today, it doesn't." — text holds a literal {name}, filled by its caller
- inline `bio-plane/src/ai-use/index.mjs:329` "the use names no paying account: 'group', 'project:<id>' or 'member..."
- inline `bio-plane/src/ai-use/index.mjs:564` "a limit's owner is 'group', 'project:<id>' or 'member:<id>'."
- inline `bio-plane/src/ai-use/index.mjs:647` "use is read for 'group', 'project:<id>' or 'member:<id>'."
- inline `bio-plane/src/ai-use/index.mjs:806` "exploring is approved for 'group', 'project:<id>' or 'member:<id>'."
- inline `bio-plane/src/ai-use/index.mjs:848` "an estimate is for 'group', 'project:<id>' or 'member:<id>'."
- inline `bio-plane/src/ai-use/index.mjs:885` "limits are read for 'group', 'project:<id>' or 'member:<id>'."
- inline `bio-plane/src/ai-use/index.mjs:930` "use over time is read for 'group', 'project:<id>' or 'member:<id>'."
- testcopy `bio-plane/test/m/ai-use/limits.test.mjs:136` [part] "Everything else works as usual." — part test copy
- testcopy `bio-plane/test/m/ai-use/reads.test.mjs:160` [part] "Everything else works as usual."
- testcopy `bio-plane/test/m/ai-use/reads.test.mjs:220` [part] "That limit can't be set:"
- testcopy `bio-plane/test/m/ai-use/t43.test.mjs:26` "Exploring is off on {whose} account. Its owners can switch it on." — text holds a literal {name}, filled by its caller
- testcopy `bio-plane/test/m/ai-use/t44.test.mjs:32` "on {month} 1" — part test copy
- testcopy `bio-plane/test/m/ai-use/t44.test.mjs:33` [part] "The assistant can't explore this question on {whose} account: it" — part test copy
- testcopy `bio-plane/test/m/ai-use/t44.test.mjs:34` [part] "lies outside what the account's owners chose to explore."

## Test copies of code sentences (K3962)

1 test strings that copy the `en` of a product `localize` call (the check's testcopy arm, tag `code`, civicos-process ea6cd83). Each test compares with `localize(id, en)` or `word(id)` instead, or asserts the key (K3810). A copy of another module's sentence is fixed in this module's own test.

- testcopy `bio-plane/test/m/ai-use/explore.test.mjs:132` "\"a participant who is not an owner\""
