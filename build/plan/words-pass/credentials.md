# credentials: the words check after the conversion (K3949)

Layer 2. 10 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- handlist `bio-plane/test/m/credentials/grant.test.mjs:86` [?] ops: rule, career, dutyoccurrences, ... (8 of 8 not the module's own) — handlist
- handlist `bio-plane/test/m/credentials/rows-ops.test.mjs:94` [?] ops: aicredentialmint, aicredentialrevoke, aicredentials, ... (8 of 28 not the module's own) — handlist
- inline `bio-plane/src/credentials/checks.mjs:20` [copy] "Sign-in is paused for a while after too many tries from here. This ..."
- inline `bio-plane/src/credentials/index.mjs:1937` "{}, and {}<tool id> for each security tool. Nothing was"
- testcopy `bio-plane/test/m/credentials/seam.test.mjs:182` [part] "registered once, at start" — part test copy
- testcopy `bio-plane/test/m/credentials/t35-misc.test.mjs:186` [part] "until then your team's Civicsmith would refuse anything signed with it" — part test copy
- testcopy `bio-plane/test/m/credentials/t35-misc.test.mjs:188` [part] "so your team's Civicsmith would refuse anything signed with their key" — part test copy
- testcopy `bio-plane/test/m/credentials/t35-misc.test.mjs:192` [part] "Only a named person signed in to your team's Civicsmith can create ..." — part test copy
- testcopy `bio-plane/test/m/credentials/t35-misc.test.mjs:195` [part] "That name already belongs to an agent credential in your team's Civ..." — part test copy
- testcopy `bio-plane/test/m/credentials/t35-misc.test.mjs:198` [part] "There is no agent credential by that name in your team's Civicsmith..." — part test copy

## Plain findings (K3957)

4 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('credentials.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/credentials/index.mjs:1258` "minted by your team's Civicsmith for one segment of your run"
- plain `bio-plane/src/credentials/index.mjs:1291` "a run in a project"
- plain `bio-plane/src/credentials/index.mjs:1966` "setting the team's key for an outside service"
- plain `bio-plane/src/credentials/index.mjs:1993` "switching the team's key for an outside service"
