# attestation: the words check after the conversion (K3949)

Layer 3. 4 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- testcopy `bio-plane/test/m/attestation/wording.test.mjs:27` [part] "as one file, and your team's Civicsmith has no record of fetching i..."
- testcopy `bio-plane/test/m/attestation/wording.test.mjs:32` [part] "A timestamp is only requested for bytes your team's Civicsmith can ..."
- testcopy `bio-plane/test/m/attestation/wording.test.mjs:37` [part] "If your team's Civicsmith fetches it from its address, it can then ..."
- testcopy `bio-plane/test/m/attestation/wording.test.mjs:62` [part] "your team's Civicsmith obtains and stores it, and does not claim to..."

## Plain findings (K3957)

3 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('attestation.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/attestation/index.mjs:126` "record that exists, and your team's Civicsmith holds no receipt of having acquired it"
- plain `bio-plane/src/attestation/index.mjs:325` "at its instant, and so every byte cut out of it"
- plain `bio-plane/src/attestation/index.mjs:338` "attestation for it; a capture registered only by its parts is named by their digests, n..."
