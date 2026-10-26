# promotion: the words check after the conversion (K3949)

Layer 2.

## Plain findings (K3957)

4 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('promotion.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/gate.mjs:1416` "registered capture is absent from the working bucket"
- plain `bio-plane/src/gate.mjs:1419` "capture bytes differ from the register"
- plain `bio-plane/src/promotion/index.mjs:699` "a project needs a name, and it must be unique across your team's Civicsmith"
- plain `bio-plane/src/promotion/names.mjs:84` "give the project a title unique across your team's Civicsmith"

## Test copies of code sentences (K3962)

1 test strings that copy the `en` of a product `localize` call (the check's testcopy arm, tag `code`, civicos-process ea6cd83). Each test compares with `localize(id, en)` or `word(id)` instead, or asserts the key (K3810). A copy of another module's sentence is fixed in this module's own test.

- testcopy `bio-plane/test/m/promotion/converts.test.mjs:170` "\"data/snapshot-manifest.json\""
