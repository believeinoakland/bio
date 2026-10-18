# accepted-work: the words check after the conversion (K3949)

Layer 6. 2 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- testcopy `bio-plane/test/m/accepted-work/invariants.test.mjs:40` [part] "This finding rests on another team's finding that this team has not..." — part test copy
- testcopy `bio-plane/test/m/accepted-work/invariants.test.mjs:41` [part] "first, or take the leg out. Nothing was written."

## Plain findings (K3957)

4 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('accepted-work.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/accepted-work/index.mjs:32` "no module holding another team's work is registered here, so none can be read"
- plain `bio-plane/src/accepted-work/index.mjs:35` "the module holding another team's work keeps no publisher moves here, so none can be read"
- plain `bio-plane/src/accepted-work/index.mjs:36` "the module holding another team's work keeps no flag history here, so none can be read"
- plain `bio-plane/src/accepted-work/index.mjs:38` "the module holding another team's work could not answer"
