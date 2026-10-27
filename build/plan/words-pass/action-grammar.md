# action-grammar: the words check after the conversion (K3949)

Layer 9. 19 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- handlist `bio-plane/test/m/action-grammar/t45.test.mjs:575` [?] codes: HOLD_PLACE_REFUSED, MACHINE_CANNOT_SEND, HOLD_NOT_IN_PLACE, ... (9 of 11 not the module's own) — handlist
- handlist `bio-plane/test/m/action-grammar/t47.test.mjs:129` [?] codes: MACHINE_CANNOT_CORRESPOND, BAD_DATE, CAPTURE_AND_TESTIMONY, ... (6 of 6 not the module's own) — handlist
- inline `bio-plane/src/action-grammar/checks.mjs:1085` "claims is not a list of 1 to {} {claim, bearing, note?} entries (R24)"
- inline `bio-plane/src/action-grammar/checks.mjs:207` "seeks is not a list of 1 to {} {progression, entity, stage} entries..."
- inline `bio-plane/src/action-grammar/checks.mjs:413` "This action's kind, as written, named the records law it was made u..."
- inline `bio-plane/src/action-grammar/checks.mjs:414` "record names no law from it, and nothing else is inferred from the ..."
- testcopy `bio-plane/test/m/action-grammar/fixture.mjs:20` [part] "Your team's Civicsmith derives only the days" — part test copy
- testcopy `bio-plane/test/m/action-grammar/fixture.mjs:22` [part] "An action is one of the kinds your team's Civicsmith offers:" — part test copy
- testcopy `bio-plane/test/m/action-grammar/grammar.test.mjs:454` [part] "Each entry is dated as recorded and names the entry it follows. You..." — part test copy
- testcopy `bio-plane/test/m/action-grammar/grammar.test.mjs:455` [part] "between entries and whether a STATED due date passed with nothing f..." — part test copy
- testcopy `bio-plane/test/m/action-grammar/grammar.test.mjs:462` [part] "An action is one of the kinds your team's Civicsmith offers: a reco..." — part test copy
- testcopy `bio-plane/test/m/action-grammar/grammar.test.mjs:463` [part] "\"other\", and the kinds the team's jurisdiction profile lists. This ..." — part test copy
- testcopy `bio-plane/test/m/action-grammar/grammar.test.mjs:464` [part] "Choose one of the listed kinds, or \"other\"." — part test copy
- testcopy `bio-plane/test/m/action-grammar/seeks.test.mjs:180` [part] "A records request may name the stages it asks the records for: one ..." — part test copy
- testcopy `bio-plane/test/m/action-grammar/seeks.test.mjs:181` [part] "progression, an entity and a stage in at most 200 characters each, ..." — part test copy
- testcopy `bio-plane/test/m/action-grammar/seeks.test.mjs:182` [part] "records request names them. This write named them otherwise, so not..." — part test copy
- testcopy `bio-plane/test/m/action-grammar/seeks.test.mjs:216` [part] "Which stages a records request asks the records for is a statement ..." — part test copy
- testcopy `bio-plane/test/m/action-grammar/seeks.test.mjs:217` [part] "The credential that asked here is an automated one, or no member is..." — part test copy
- testcopy `bio-plane/test/m/action-grammar/seeks.test.mjs:218` [part] "consider, but it cannot state or change what the request seeks. Not..." — part test copy

## Plain findings (K3957)

1 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('action-grammar.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/action-grammar/checks.mjs:1187` "state who owes the date: the team, the body, or undetermined"

## Test copies of code sentences (K3962)

13 test strings that copy the `en` of a product `localize` call (the check's testcopy arm, tag `code`, civicos-process ea6cd83). Each test compares with `localize(id, en)` or `word(id)` instead, or asserts the key (K3810). A copy of another module's sentence is fixed in this module's own test.

- testcopy `bio-plane/test/m/action-grammar/fixture.mjs:16` "\"' is not a canonical record id\""
- testcopy `bio-plane/test/m/action-grammar/fixture.mjs:21` "\"' is not a kind your team's Civicsmith offers\""
- testcopy `bio-plane/test/m/action-grammar/fixture.mjs:49` "\"CORRESPONDENCE_DIRECTIONS\""
- testcopy `bio-plane/test/m/action-grammar/grammar.test.mjs:212` "\"Saying whether a litigation hold is in place is a member's judgemen...\""
- testcopy `bio-plane/test/m/action-grammar/grammar.test.mjs:411` "\"' is not a subject registry key (ENT-YYYY-NNNN)\""
- testcopy `bio-plane/test/m/action-grammar/grammar.test.mjs:456` "\"judgement about the body.\""
- testcopy `bio-plane/test/m/action-grammar/seeks.test.mjs:102` "\"' action: only a records_request names the stages it asks the recor...\""
- testcopy `bio-plane/test/m/action-grammar/t45-rows.mjs:23` "\"The ground stated for acting without a determination was incomplete...\""
- testcopy `bio-plane/test/m/action-grammar/t45-rows.mjs:68` "\"The office's own wording of its status is quoted beside the outcome...\""
- testcopy `bio-plane/test/m/action-grammar/t45-rows.mjs:138` "\"Whether a reply is owed is stated as yes or no, or left out, which ...\""
- testcopy `bio-plane/test/m/action-grammar/t45-rows.mjs:148` "\"A records law in the jurisdiction profile lists a stage the record ...\""
- testcopy `bio-plane/test/m/action-grammar/t45.test.mjs:37` "\"disputed_without_evidence\""
- testcopy `bio-plane/test/m/action-grammar/t45.test.mjs:151` "\"' is not a canonical record id\""
