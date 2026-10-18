# machinery-producers: the words check after the conversion (K3949)

Layer 11. 3 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/machinery-producers/index.mjs:566` "authors the document again."
- testcopy `bio-plane/test/m/machinery-producers/invariants.test.mjs:210` [part] "no time zone is held for it by your team's Civicsmith, so the local..." — part test copy
- testcopy `bio-plane/test/m/machinery-producers/invariants.test.mjs:211` [part] "counted from is undetermined; it is never counted on the UTC day" — part test copy

## Plain findings (K3957)

8 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('machinery-producers.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/machinery-producers/index.mjs:360` "started it, so how long this has been true is not derivable"
- plain `bio-plane/src/machinery-producers/index.mjs:431` "the session row carries a created stamp this producer cannot read as an instant"
- plain `bio-plane/src/machinery-producers/index.mjs:570` "the manifest entry carries a created stamp this producer cannot read as an instant"
- plain `bio-plane/src/machinery-producers/index.mjs:656` "the request row carries a completion stamp this producer cannot read as an instant"
- plain `bio-plane/src/machinery-producers/index.mjs:737` "the failing run carries no first-failure instant this producer can read"
- plain `bio-plane/src/machinery-producers/index.mjs:776` "an unscheduled address has no instant it fell due"
- plain `bio-plane/src/machinery-producers/index.mjs:855` "the request row carries a request stamp this producer cannot read as an instant"
- plain `bio-plane/src/machinery-producers/index.mjs:974` "the sweep's status carries no instant this producer can read"
