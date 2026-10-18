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
