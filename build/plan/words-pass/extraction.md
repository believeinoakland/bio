# extraction: the words check after the conversion (K3949)

Layer 4. 2 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- testcopy `bio-plane/test/m/extraction/t44.test.mjs:145` [part] "This project keeps its material away from AI{for_uses}. {member} se..." — part test copy
- testcopy `bio-plane/test/m/extraction/t48.test.mjs:112` [part] "This project keeps its material away from AI." — part test copy

## Plain findings (K3957)

7 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('extraction.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/extraction/index.mjs:982` "text not having been transcribed -- nobody recorded how it was produced"
- plain `bio-plane/src/extraction/index.mjs:1280` "your team's Civicsmith has no evidence store set up, so the stored bytes cannot be read..."
- plain `bio-plane/src/extraction/index.mjs:1485` "what your team's Civicsmith can read; this one is re-read now"
- plain `bio-plane/src/extractrun.mjs:312` "letter, because a letter is a claim and there is no claim here"
- plain `bio-plane/src/extractrun.mjs:351` "undetermined ceiling of the capture its quote is read from"
- plain `bio-plane/src/extractrun.mjs:363` "because it looks like a binding and joins to nothing"
- plain `bio-plane/src/extractrun.mjs:430` "nothing to measure. This is an absence and not a clean result"
