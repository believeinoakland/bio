# actions: the words check after the conversion (K3949)

Layer 9. 8 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- handlist `bio-plane/test/m/actions/acts.test.mjs:51` [?] codes: MACHINE_CANNOT_CORRESPOND, BAD_DATE, CAPTURE_AND_TESTIMONY, ... (6 of 17 not the module's own)
- handlist `bio-plane/test/m/actions/acts.test.mjs:90` [?] codes: NO_LAWS, TOO_MANY_LAWS, BAD_LAW_LEVEL, ... (5 of 8 not the module's own)
- handlist `bio-plane/test/m/actions/t45.test.mjs:561` [?] codes: PRESSURE_MARKED, PRESSURE_NO_ENTRY, MACHINE_CANNOT_SET_HOLD, ... (9 of 10 not the module's own) — handlist
- handlist `bio-plane/test/m/actions/t48.test.mjs:42` [?] ops: actionmove, actionlaws, actionrisktier, ... (5 of 7 not the module's own) — handlist
- inline `bio-plane/src/actions/index.mjs:122` [copy] "No reply is owed: {reason}" — text holds a literal {name}, filled by its caller
- testcopy `bio-plane/test/m/actions/t11.test.mjs:133` [part] "no module answers an action's read here" — part test copy
- testcopy `bio-plane/test/m/actions/t11.test.mjs:134` [part] "no module answers an action's read here" — part test copy
- testcopy `bio-plane/test/m/actions/t50.test.mjs:104` [part] "this is not a hint either way." — part test copy

## Plain findings (K3957)

2 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('actions.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/actions/index.mjs:1960` "place, so it was written without one"
- plain `bio-plane/src/actions/index.mjs:2378` "is reachable only by its request"

## Test copies of code sentences (K3962)

5 test strings that copy the `en` of a product `localize` call (the check's testcopy arm, tag `code`, civicos-process ea6cd83). Each test compares with `localize(id, en)` or `word(id)` instead, or asserts the key (K3810). A copy of another module's sentence is fixed in this module's own test.

- testcopy `bio-plane/test/m/actions/t33.test.mjs:135` "\"carried forward unchanged\""
- testcopy `bio-plane/test/m/actions/t34.test.mjs:96` "\"contact names a member of your team by member id, and this one name...\""
- testcopy `bio-plane/test/m/actions/t34.test.mjs:101` "\"an action recorded for a breach rests on a conformance determinatio...\""
- testcopy `bio-plane/test/m/actions/t34.test.mjs:102` "\"read on your team's Civicsmith yet, so none could be found. Nothing...\""
- testcopy `bio-plane/test/m/actions/t50.test.mjs:103` "\"no action answers to that id here. An action you may not see is ans...\""
