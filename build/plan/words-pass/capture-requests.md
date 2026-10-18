# capture-requests: the words check after the conversion (K3949)

Layer 6. 18 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/capture-requests/index.mjs:1077` "The document served at {}, captured by the daemon at an investigati..."
- inline `bio-plane/src/capture-requests/index.mjs:1077` [stitched] "{} Its bytes are `{}`, exactly as served; nothing here summarises t..."
- inline `bio-plane/src/capture-requests/index.mjs:1080` "The document served at {}, captured by the daemon at the request of {}"
- inline `bio-plane/src/capture-requests/index.mjs:263` "(DEC-47), and a request naming no session names no authorisation."
- inline `bio-plane/src/capture-requests/index.mjs:673` "The render was never performed and nothing was filed for it, so wha..."
- inline `bio-plane/src/capture-requests/index.mjs:673` [copy] "(no code: never attempted)"
- inline `bio-plane/src/capture-requests/index.mjs:675` "Nothing was fetched or filed for it after that, so what the address..."
- inline `bio-plane/src/capture-requests/index.mjs:676` "— the reason last given: {}"
- inline `bio-plane/src/capture-requests/index.mjs:948` "'{}' is not a sweep's name (\"<bundle>#<id>\"), so no sweep admits this"
- testcopy `bio-plane/test/m/capture-requests/fixture.mjs:102` [part] "no assertion was supplied" — part test copy
- testcopy `bio-plane/test/m/capture-requests/t34.test.mjs:13` [part] "registered once, at start" — part test copy
- testcopy `bio-plane/test/m/capture-requests/t34.test.mjs:132` [part] "Every fetch your team's Civicsmith makes on its own" — part test copy
- testcopy `bio-plane/test/m/capture-requests/t34.test.mjs:133` [part] "The fetch is performed by your team's Civicsmith itself" — part test copy
- testcopy `bio-plane/test/m/capture-requests/t34.test.mjs:134` [part] "Your team's Civicsmith will not fetch without saying who is asking" — part test copy
- testcopy `bio-plane/test/m/capture-requests/t34.test.mjs:135` [part] "Every request your team's Civicsmith makes says what it is for" — part test copy
- testcopy `bio-plane/test/m/capture-requests/t34.test.mjs:137` [part] "Your team's Civicsmith tried to fetch the document" — part test copy
- testcopy `bio-plane/test/m/capture-requests/t34.test.mjs:138` [part] "Your team's Civicsmith does not fetch it unattended or sign in to it" — part test copy
- testcopy `bio-plane/test/m/capture-requests/t50.test.mjs:11` [part] "registered once, at start" — part test copy

## Plain findings (K3957)

3 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('capture-requests.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/capture-requests/index.mjs:647` "no daemon credential is bound: your team's Civicsmith drains nothing and holds no alarm..."
- plain `bio-plane/src/capture-requests/index.mjs:1111` "the promotion did not complete and your team's Civicsmith did not record why"
- plain `bio-plane/src/capture-requests/index.mjs:1708` "is not a sweep your team's Civicsmith holds"
