# membership: the words check after the conversion (K3949)

Layer 2. 1 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- testcopy `bio-plane/test/m/membership/t49-founder-handle.test.mjs:27` "{handle} is free in {group}" — text holds a literal {name}, filled by its caller

## Plain findings (K3957)

22 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('membership.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/membership/index.mjs:640` "recording who holds hosting access (4.8)"
- plain `bio-plane/src/membership/index.mjs:1603` "adding an owner to a project whose owners are all inactive (7.13)"
- plain `bio-plane/src/membership/index.mjs:1609` "credential rather than a stranded one"
- plain `bio-plane/src/membership/index.mjs:1671` "capabilities, visibility and access as a confirmed one"
- plain `bio-plane/src/membership/index.mjs:1678` "confirming or withdrawing a member's declared expertise"
- plain `bio-plane/src/membership/index.mjs:1946` "every existing administrator must endorse an addition beyond the second"
- plain `bio-plane/src/membership/index.mjs:1966` "voting to remove an administrator"
- plain `bio-plane/src/membership/index.mjs:1989` "the target is counted in the denominator but does not vote"
- plain `bio-plane/src/membership/index.mjs:1991` "removals are recorded with a reason"
- plain `bio-plane/src/membership/index.mjs:2037` "lowercase letters, digits and dashes, 2 to 41 characters"
- plain `bio-plane/src/membership/index.mjs:2052` "a cover is the label you use to tell participants apart; it need not be, and often shou..."
- plain `bio-plane/src/membership/index.mjs:2214` "lowercase letters, digits and dashes, 2 to 41 characters"
- plain `bio-plane/src/membership/index.mjs:2696` "creating the team's website key"
- plain `bio-plane/src/membership/index.mjs:2712` "changing the team's website key"
- plain `bio-plane/src/membership/index.mjs:2725` "switching off the team's website key"
- plain `bio-plane/src/membership/index.mjs:2794` "switching on the team's join link"
- plain `bio-plane/src/membership/index.mjs:2810` "changing the team's join link"
- plain `bio-plane/src/membership/index.mjs:2823` "replacing the team's join link"
- plain `bio-plane/src/membership/index.mjs:2834` "switching off the team's join link"
- plain `bio-plane/src/membership/index.mjs:2876` "reading the team's website key and join link"
- plain `bio-plane/src/membership/index.mjs:2930` "choosing whether members are told what a court can reach"
- plain `bio-plane/src/membership/order-build.mjs:59` "the generated list is absent"

## Test copies of code sentences (K3962)

9 test strings that copy the `en` of a product `localize` call (the check's testcopy arm, tag `code`, civicos-process ea6cd83). Each test compares with `localize(id, en)` or `word(id)` instead, or asserts the key (K3810). A copy of another module's sentence is fixed in this module's own test.

- testcopy `bio-plane/test/m/membership/t14-rows-remedy-order.test.mjs:54` "\"is an administrator's act\""
- testcopy `bio-plane/test/m/membership/t19-enrol-boot.test.mjs:52` "\"the invitation is still live\""
- testcopy `bio-plane/test/m/membership/t34-joining.test.mjs:411` "\"is an administrator's act\""
- testcopy `bio-plane/test/m/membership/t35-words.test.mjs:59` "\"is an administrator's act (Membership Architecture v2 §4.9), and yo...\""
- testcopy `bio-plane/test/m/membership/t35-words.test.mjs:60` "\"Civicsmith takes who is asking from the signed-in session rather th...\""
- testcopy `bio-plane/test/m/membership/t35-words.test.mjs:61` "\"the active administrators. Nothing was changed.\""
- testcopy `bio-plane/test/m/membership/t47-r142.test.mjs:69` "\"a member joins a project they were invited to. Being uninvited is n...\""
- testcopy `bio-plane/test/m/membership/t47-r142.test.mjs:72` "\"only an owner of this project removes a participant from it. This R...\""
- testcopy `bio-plane/test/m/membership/t47-r142.test.mjs:73` "\"administrator removed and an owner could not.\""
