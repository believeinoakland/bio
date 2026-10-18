# provenance: the words check after the conversion (K3949)

Layer 3. 9 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- testcopy `bio-plane/test/m/provenance/register-checks.test.mjs:186` [part] "handed in at the doorbell"
- testcopy `bio-plane/test/m/provenance/register-checks.test.mjs:197` "and brought into the record by"
- testcopy `bio-plane/test/m/provenance/register-checks.test.mjs:254` [part] "handed in at the doorbell"
- testcopy `bio-plane/test/m/provenance/seam.test.mjs:25` [part] "A receipt names the captured document's fingerprint," — part test copy
- testcopy `bio-plane/test/m/provenance/seam.test.mjs:26` [part] "the address it was fetched from and when, and one of those was miss..." — part test copy
- testcopy `bio-plane/test/m/provenance/seam.test.mjs:27` [part] "Your team's Civicsmith holds no key to sign its receipts" — part test copy
- testcopy `bio-plane/test/m/provenance/seam.test.mjs:28` [part] "with, so this receipt was not signed, and nothing claims that it wa..."
- testcopy `bio-plane/test/m/provenance/upload.test.mjs:204` "for resolution through the task list" — partial test copy (template not matched to a row)
- testcopy `bio-plane/test/m/provenance/upload.test.mjs:52` "is proven by the receipt your team's Civicsmith itself made at" — regex

## Plain findings (K3957)

1 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('provenance.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/provenance/index.mjs:1650` "words were not read in from anywhere, so it earns no letter here"

## Test copies of code sentences (K3962)

2 test strings that copy the `en` of a product `localize` call (the check's testcopy arm, tag `code`, civicos-process ea6cd83). Each test compares with `localize(id, en)` or `word(id)` instead, or asserts the key (K3810). A copy of another module's sentence is fixed in this module's own test.

- testcopy `bio-plane/test/m/provenance/register-checks.test.mjs:196` "\"these bytes were received at the doorbell of your team's Civicsmith...\""
- testcopy `bio-plane/test/m/provenance/upload.test.mjs:207` "\"; they were received, not fetched from any address\""
