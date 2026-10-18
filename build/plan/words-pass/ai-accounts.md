# ai-accounts: the words check after the conversion (K3949)

Layer 2. 3 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/ai-accounts/index.mjs:1169` "; this one has {}"
- testcopy `bio-plane/test/m/ai-accounts/t35-misc.test.mjs:140` [part] "Your team's Civicsmith cannot keep a key sealed right now, because ..." — part test copy
- testcopy `bio-plane/test/m/ai-accounts/t35-misc.test.mjs:141` [part] "Ask whoever hosts your team's Civicsmith to set it." — part test copy

## Plain findings (K3957)

3 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('ai-accounts.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/ai-accounts/index.mjs:313` "switching the team key's assistant settings"
- plain `bio-plane/src/ai-accounts/index.mjs:585` "reading the team key's assistant settings"
- plain `bio-plane/src/ai-accounts/index.mjs:1178` "keeping the team's material away from every assistant"

## Test copies of code sentences (K3962)

4 test strings that copy the `en` of a product `localize` call (the check's testcopy arm, tag `code`, civicos-process ea6cd83). Each test compares with `localize(id, en)` or `word(id)` instead, or asserts the key (K3810). A copy of another module's sentence is fixed in this module's own test.

- testcopy `bio-plane/test/m/ai-accounts/seams.test.mjs:524` "\"whether the team keeps its material away from every assistant could...\""
- testcopy `bio-plane/test/m/ai-accounts/t35-misc.test.mjs:142` "\"your team's Civicsmith has no seal secret set, so a key cannot be k...\""
- testcopy `bio-plane/test/m/ai-accounts/t35-misc.test.mjs:153` "\"the reference does not open under the seal secret of your team's Ci...\""
- testcopy `bio-plane/test/m/ai-accounts/t35-misc.test.mjs:156` "\"the team's key does not open under the seal secret of your team's C...\""
