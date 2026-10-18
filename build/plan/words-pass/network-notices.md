# network-notices: the words check after the conversion (K3949)

Layer 8. 6 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- testcopy `bio-plane/test/m/network-notices/words.test.mjs:32` [part] "Your team has no name recorded yet, and a notice is never anonymous..." — part test copy
- testcopy `bio-plane/test/m/network-notices/words.test.mjs:33` [part] "first. Nothing was published."
- testcopy `bio-plane/test/m/network-notices/words.test.mjs:42` [part] "Your team's Civicsmith holds no signing key of its own, so it canno..." — part test copy
- testcopy `bio-plane/test/m/network-notices/words.test.mjs:43` [part] "notice is always published with. The operator binds one. Nothing wa..."
- testcopy `bio-plane/test/m/network-notices/words.test.mjs:64` [part] "Your team's Civicsmith holds no prepared notice from you with this ..." — part test copy
- testcopy `bio-plane/test/m/network-notices/words.test.mjs:65` [part] "prepared more than an hour ago. Prepare it again and sign what it s..."

## Plain findings (K3957)

1 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('network-notices.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/network-notices/index.mjs:257` "no team slug is recorded, and there are no anonymous notices"
