# filings: the words check after the conversion (K3949)

Layer 9. 11 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- handlist `bio-plane/test/m/filings/t46.test.mjs:97` keys: pointer.record.unsupported, pointer.record.contradicted, voice.group, ... (6 of 21 not the module's own) — handlist
- testcopy `bio-plane/test/m/filings/outward.test.mjs:52` [part] "the project declares no bar" — part test copy
- testcopy `bio-plane/test/m/filings/packet.test.mjs:242` [part] "(or withholds, the active profiles disagreeing), so it is not counted" — part test copy
- testcopy `bio-plane/test/m/filings/prepare.test.mjs:213` [part] "no promotion module is reachable" — part test copy
- testcopy `bio-plane/test/m/filings/t45.test.mjs:217` [part] "pointed out, never refused" — part test copy
- testcopy `bio-plane/test/m/filings/t47.test.mjs:135` [part] "the blanks the text names" — part test copy
- testcopy `bio-plane/test/m/filings/t48.test.mjs:122` [part] "each filled blank names its source" — part test copy
- testcopy `bio-plane/test/m/filings/templates.test.mjs:76` [part] "each filled blank names its source" — part test copy
- testcopy `bio-plane/test/m/filings/words.test.mjs:119` "a time for review and response" — computed member key
- testcopy `bio-plane/test/m/filings/words.test.mjs:124` "correcting the act" — computed member key
- testcopy `bio-plane/test/m/filings/words.test.mjs:125` "remedying the harm" — computed member key

## Plain findings (K3957)

5 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('filings.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/filings/index.mjs:690` "no module answers the team's templates here, so none is readable"
- plain `bio-plane/src/filings/index.mjs:1275` "rewrite each sentence that asks for the benefit of the team or its members; there is no..."
- plain `bio-plane/src/filings/index.mjs:1327` "prepared as yourself: your own notes are never approved, stamped or recorded as the tea..."
- plain `bio-plane/src/filings/index.mjs:2363` "this template is wording the team files in its own name: a briefing takes a brief template"
- plain `bio-plane/src/filings/index.mjs:2773` "no module answers the team's templates here, so no template can be drafted"

## Test copies of code sentences (K3962)

1 test strings that copy the `en` of a product `localize` call (the check's testcopy arm, tag `code`, civicos-process ea6cd83). Each test compares with `localize(id, en)` or `word(id)` instead, or asserts the key (K3810). A copy of another module's sentence is fixed in this module's own test.

- testcopy `bio-plane/test/m/filings/packet.test.mjs:106` "\"recorded with the version\""
