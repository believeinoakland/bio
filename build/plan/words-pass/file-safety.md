# file-safety: the words check after the conversion (K3949)

Layer 3. 1 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/file-safety/index.mjs:742` "warned must be exactly {own_device: true, no_macros: true}. Nothing..."

## Plain findings (K3957)

1 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('file-safety.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/file-safety/index.mjs:1075` "reading the team's security tools"

## Test copies of code sentences (K3962)

9 test strings that copy the `en` of a product `localize` call (the check's testcopy arm, tag `code`, civicos-process ea6cd83). Each test compares with `localize(id, en)` or `word(id)` instead, or asserts the key (K3810). A copy of another module's sentence is fixed in this module's own test.

- testcopy `bio-plane/test/m/file-safety/deeper.test.mjs:96` "\"PRIVATE_MODE_NOT_HONOURED\""
- testcopy `bio-plane/test/m/file-safety/deeper.test.mjs:104` "\"PRIVATE_MODE_NOT_HONOURED\""
- testcopy `bio-plane/test/m/file-safety/tools.test.mjs:231` "\"PRIVATE_MODE_NOT_HONOURED\""
- testcopy `bio-plane/test/m/file-safety/tools.test.mjs:237` "\"PRIVATE_MODE_NOT_HONOURED\""
- testcopy `bio-plane/test/m/file-safety/tools.test.mjs:243` "\"PRIVATE_MODE_NOT_HONOURED\""
- testcopy `bio-plane/test/m/file-safety/tools.test.mjs:273` "\"the organization's own MetaDefender Core server\""
- testcopy `bio-plane/test/m/file-safety/tools.test.mjs:274` "\"Microsoft (the organization's own Azure storage account)\""
- testcopy `bio-plane/test/m/file-safety/tools.test.mjs:432` "\"the organization's own MetaDefender Core server\""
- testcopy `bio-plane/test/m/file-safety/tools.test.mjs:433` "\"Microsoft (the organization's own Azure storage account)\""
