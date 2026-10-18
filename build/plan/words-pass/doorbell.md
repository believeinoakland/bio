# doorbell: the words check after the conversion (K3949)

Layer 3. 10 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- handlist `bio-plane/test/m/doorbell/rows.test.mjs:44` [?] codes: EVIDENCE_NOT_HELD, NOT_THE_CAPTURING_ACTOR, ACCOUNT_NO_TEXT, ... (6 of 6 not the module's own)
- testcopy `bio-plane/test/m/doorbell/doorbell.test.mjs:223` [part] "The team can see how often its doorbell turns people away."
- testcopy `bio-plane/test/m/doorbell/doorbell.test.mjs:231` [part] "Your material was not received."
- testcopy `bio-plane/test/m/doorbell/rows.test.mjs:13` [part] "The team can see how often its doorbell turns people away."
- testcopy `bio-plane/test/m/doorbell/rows.test.mjs:17` [part] "A knocker secret this short could be guessed, letting someone else ..."
- testcopy `bio-plane/test/m/doorbell/rows.test.mjs:24` [part] "Your material was not received. This team's inbox is not taking any..." — part test copy
- testcopy `bio-plane/test/m/doorbell/rows.test.mjs:25` [part] "This team's inbox did not read what you sent, because the request i..."
- testcopy `bio-plane/test/m/doorbell/rows.test.mjs:27` [part] "This team's inbox has nothing to keep, because what you sent decode..."
- testcopy `bio-plane/test/m/doorbell/t35.test.mjs:52` [part] "The size this inbox will read is published beside this message." — part test copy
- testcopy `bio-plane/test/m/doorbell/t35.test.mjs:62` [part] "larger than this inbox stores. That is a fact about how this team h..." — part test copy

## Plain findings (K3957)

13 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('doorbell.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/doorbell/door.mjs:53` "this team's inbox stores knocks inline; large material needs its evidence storage confi..."
- plain `bio-plane/src/doorbell/index.mjs:262` "no knock carrying a secret has been received by your team's Civicsmith, so no secret is..."
- plain `bio-plane/src/doorbell/index.mjs:358` "the doorbell's tally is read by a signed-in member; nothing was read"
- plain `bio-plane/src/doorbell/index.mjs:418` "the content did not decode"
- plain `bio-plane/src/doorbell/index.mjs:434` "the material could not be stored, so nothing was received and no inbox row was written"
- plain `bio-plane/src/doorbell/index.mjs:577` "a knock is brought in by a member, whose stamp names them; none was given, so nothing w..."
- plain `bio-plane/src/doorbell/index.mjs:611` "this team's Civicsmith has no evidence storage configured, so the knock's bytes cannot ..."
- plain `bio-plane/src/doorbell/index.mjs:629` "the knock's bytes are no longer held as received (gone, or no longer hashing to the kno..."
- plain `bio-plane/src/doorbell/index.mjs:635` "the knock's bytes could not be held under their own digest, so nothing was written"
- plain `bio-plane/src/doorbell/index.mjs:656` "the acquisition receipt could not be written, so the knock stays as it was and nothing ..."
- plain `bio-plane/src/doorbell/index.mjs:721` "the knock's receipt: its digest, taken as the bytes arrived, and its instant"
- plain `bio-plane/src/doorbell/index.mjs:725` "doorbell knock, received, hashed at receipt"
- plain `bio-plane/src/doorbell/index.mjs:742` "knocksOf names the pseudonym whose knocks it lists"

## Test copies of code sentences (K3962)

5 test strings that copy the `en` of a product `localize` call (the check's testcopy arm, tag `code`, civicos-process ea6cd83). Each test compares with `localize(id, en)` or `word(id)` instead, or asserts the key (K3810). A copy of another module's sentence is fixed in this module's own test.

- testcopy `bio-plane/test/m/doorbell/knock-origin.test.mjs:27` "\"a member's own capture\""
- testcopy `bio-plane/test/m/doorbell/rows.test.mjs:19` "\"Changing a knock's status records why, in your own words, and no re...\""
- testcopy `bio-plane/test/m/doorbell/rows.test.mjs:23` "\"Your material was not received. This team's inbox is not taking any...\""
- testcopy `bio-plane/test/m/doorbell/rows.test.mjs:26` "\"This team's inbox read your material and cannot keep it, because it...\""
- testcopy `bio-plane/test/m/doorbell/t35.test.mjs:97` "\"these bytes were received at the doorbell of your team's Civicsmith...\""
