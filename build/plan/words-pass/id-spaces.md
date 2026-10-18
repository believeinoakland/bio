# id-spaces: the words check after the conversion (K3949)

Layer 1. 5 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/idspaces.mjs:253` "{} is inside the reach for some kinds and outside it for others (fl..."
- inline `bio-plane/src/idspaces.mjs:289` "in none of the {} published vintage(s) searched"
- inline `bio-plane/src/idspaces.mjs:290` [copy] "no published vintage of the assessor's roll or lineage is held, so ..."
- testcopy `bio-plane/test/m/id-spaces/fixtures.mjs:174` [part] "Administrative Instruction" — part test copy
- testcopy `bio-plane/test/m/id-spaces/series.test.mjs:50` [part] "Administrative Instruction" — part test copy

## Plain findings (K3957)

3 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('id-spaces.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/idspaces.mjs:420` "the same value names different things, on the caller's reading: not a match"
- plain `bio-plane/src/idspaces.mjs:535` "no reporter data is held (court-citations' data is not readable here, and none was passed)"
- plain `bio-plane/src/idspaces.mjs:673` "recognised: finding none says nothing about whether the text cites a policy or a standard"
