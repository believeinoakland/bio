# journey-check: the words check after the conversion (K3949)

Layer 11. 4 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/journey-check/walker.mjs:133` "{} answered ok: false ({}, HTTP {})" — string concatenation (operand is a conditional or logical expression)
- inline `bio-plane/src/journey-check/walker.mjs:134` "{} answered {} at {} ({}, HTTP {})"
- testcopy `bio-plane/test/m/journey-check/journey.test.mjs:105` [part] "civicsmith.org: what Civicsmith is" — part test copy
- testcopy `bio-plane/test/m/journey-check/journey.test.mjs:268` [part] "civicsmith.org: what Civicsmith is" — part test copy

## Plain findings (K3957)

8 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('journey-check.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/journey-check/journeys.mjs:197` "setup: claim; she is the team's first administrator"
- plain `bio-plane/src/journey-check/journeys.mjs:212` "setup: her ten recovery codes, shown once"
- plain `bio-plane/src/journey-check/journeys.mjs:328` "capture: her first testimony, labelled as hers"
- plain `bio-plane/src/journey-check/run.mjs:203` "the live arm needs the test instance's address (--live <address>)"
- plain `bio-plane/src/journey-check/run.mjs:273` "no screen draws the administrator an act it does not draw the member: the administrator..."
- plain `bio-plane/src/journey-check/runner.mjs:94` "no token was handed down"
- plain `bio-plane/src/journey-check/runner.mjs:99` "the token is not one this sign-in minted"
- plain `bio-plane/src/journey-check/runner.mjs:100` "the local arm's runner has no fake model bound"

## Test copies of code sentences (K3962)

2 test strings that copy the `en` of a product `localize` call (the check's testcopy arm, tag `code`, civicos-process ea6cd83). Each test compares with `localize(id, en)` or `word(id)` instead, or asserts the key (K3810). A copy of another module's sentence is fixed in this module's own test.

- testcopy `bio-plane/test/m/journey-check/live.test.mjs:55` "\"pairs, LIVE beside DESIGN\""
- testcopy `bio-plane/test/m/journey-check/runner.test.mjs:120` "\"Search with the meaningrows tool, then call report once.\""
