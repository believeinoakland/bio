# answers: the words check after the conversion (K3949)

Layer 6. 3 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- handlist `bio-plane/test/m/answers/scope.test.mjs:23` [?] ops: linesof, structureat, dutiesof, ... (13 of 27 not the module's own) — handlist
- testcopy `bio-plane/test/m/answers/words.test.mjs:27` "No rule service of that name is held in"
- testcopy `bio-plane/test/m/answers/words.test.mjs:30` "The record's rule services are switched off in"

## Plain findings (K3957)

5 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('answers.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/answers/check.mjs:59` "the summary names the sentences it rests on, as s<i>"
- plain `bio-plane/src/answers/index.mjs:235` "the rule services are switched off in your team's Civicsmith"
- plain `bio-plane/src/answers/rules.mjs:61` "no jurisdiction profile is active in your team's Civicsmith"
- plain `bio-plane/src/answers/rules.mjs:84` "no jurisdiction profile is active in your team's Civicsmith"
- plain `bio-plane/src/answers/sentences.mjs:92` "a sentence's support names holdings, rule items or looks as h<i>, r<i>, l<i>"
