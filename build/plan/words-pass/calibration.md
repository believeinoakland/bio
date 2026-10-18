# calibration: the words check after the conversion (K3949)

Layer 4. 6 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/calibration/index.mjs:385` "Nothing has ever probed it, so a probe is due immediately"
- inline `bio-plane/src/calibration/index.mjs:386` "The next probe is due at its own cadence"
- testcopy `bio-plane/test/m/calibration/words.test.mjs:44` [part] ". No module derives obligations from calibrations in your team's Ci..." — part test copy
- testcopy `bio-plane/test/m/calibration/words.test.mjs:62` [part] "no engine is registered for calibration in your team's Civicsmith, ..." — part test copy
- testcopy `bio-plane/test/m/calibration/words.test.mjs:63` [part] "and this consumer holds no alarm at all" — part test copy
- testcopy `bio-plane/test/m/calibration/words.test.mjs:88` [part] "its own, so the probe is OWED and not RUN — and the record says owe..." — part test copy

## Plain findings (K3957)

7 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('calibration.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/calibration.mjs:287` "an uncomparable pair would name transcriptions for a reason nobody could check"
- plain `bio-plane/src/calibration.mjs:316` "from a measurement that does not exist"
- plain `bio-plane/src/calibration.mjs:336` "documentation is a claim, not a measurement"
- plain `bio-plane/src/calibration.mjs:352` "their own product and the record keeps it as that"
- plain `bio-plane/src/calibration/index.mjs:266` "none are named here (null, not none found)"
- plain `bio-plane/src/calibration/index.mjs:299` "and this consumer holds no alarm at all"
- plain `bio-plane/src/calibration/index.mjs:342` "for it to accelerate — the announcement is kept as a fact and does nothing else"

## Test copies of code sentences (K3962)

2 test strings that copy the `en` of a product `localize` call (the check's testcopy arm, tag `code`, civicos-process ea6cd83). Each test compares with `localize(id, en)` or `word(id)` instead, or asserts the key (K3810). A copy of another module's sentence is fixed in this module's own test.

- testcopy `bio-plane/test/m/calibration/words.test.mjs:33` "\"this engine now measures BETTER. Nothing is raised and nothing move...\""
- testcopy `bio-plane/test/m/calibration/words.test.mjs:34` "\"so an automatic upgrade here would be your team's Civicsmith making...\""
