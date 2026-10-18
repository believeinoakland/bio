# public-read: the words check after the conversion (K3949)

Layer 8. 14 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/public-read/index.mjs:585` "moved since. None of the three is a gap in this answer; each is a s..."
- inline `bio-plane/src/public-read/index.mjs:595` "Where a case edition's `bar` is null NO STANDARD OF EVIDENCE IS REC..."
- inline `bio-plane/src/public-read/index.mjs:600` "FINDING's own, and since the artifact flip a member of a case's edi..."
- inline `bio-plane/src/public-read/index.mjs:602` "the pin exists to name." — comment inside the expression
- inline `bio-plane/src/publication/worker.mjs:341` "join parts[] as kind: rendering."
- inline `bio-plane/src/publication/worker.mjs:345` "several findings' strengths into one letter is a claim the evidence..."
- inline `bio-plane/src/publication/worker.mjs:359` "not a standard of zero — the case claims no cleared bar and says so."
- inline `bio-plane/src/publication/worker.mjs:371` "Each finding's `strength` and its own `edition` are stated in the C..."
- inline `bio-plane/src/publication/worker.mjs:374` "concluded it, and the pair is this case's reading of those bytes." — string concatenation (operand is a conditional or logical expression)
- inline `bio-plane/src/publication/worker.mjs:592` "one of {} (1 by default)"
- testcopy `bio-plane/test/m/public-read/archives.test.mjs:133` [part] "a file cut out of an archive"
- testcopy `bio-plane/test/m/public-read/obscured.test.mjs:246` [part] "a file cut out of an archive" — part test copy
- testcopy `bio-plane/test/m/public-read/tensions.test.mjs:104` [part] "This finding rests on a side in conflict with a record not shown he..." — part test copy
- testcopy `bio-plane/test/m/public-read/tensions.test.mjs:105` [part] "record and who holds it are not named."

## Plain findings (K3957)

2 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('public-read.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/public-read/index.mjs:276` "the team's identity source is registered with its door, identity(); nothing was registered"
- plain `bio-plane/src/public-read/index.mjs:279` "the team's identity source is already registered; the first stands, and nothing was reg..."

## Test copies of code sentences (K3962)

11 test strings that copy the `en` of a product `localize` call (the check's testcopy arm, tag `code`, civicos-process ea6cd83). Each test compares with `localize(id, en)` or `word(id)` instead, or asserts the key (K3810). A copy of another module's sentence is fixed in this module's own test.

- testcopy `bio-plane/test/m/public-read/convert-multifinding.test.mjs:238` "\"the manifest answers by its own sha256\""
- testcopy `bio-plane/test/m/public-read/dec149.test.mjs:75` "\", so there is nothing to serve under that name\""
- testcopy `bio-plane/test/m/public-read/dec149.test.mjs:83` "\"has no published object store configured, so its published bytes ar...\""
- testcopy `bio-plane/test/m/public-read/dec149.test.mjs:84` "\"cannot hand over the bytes.\""
- testcopy `bio-plane/test/m/public-read/dec149.test.mjs:87` "\"that hash is published, and\""
- testcopy `bio-plane/test/m/public-read/dec149.test.mjs:88` "\"handed over. The hash is genuine.\""
- testcopy `bio-plane/test/m/public-read/dec149.test.mjs:110` "\"tamper-EVIDENT, not tamper-proof: every part is named by sha256 in ...\""
- testcopy `bio-plane/test/m/public-read/dec149.test.mjs:111` "\"its own sha256, and EACH FINDING's signature covers that finding's ...\""
- testcopy `bio-plane/test/m/public-read/dec149.test.mjs:112` "\"a modified copy; everything here makes one detectable by anyone hol...\""
- testcopy `bio-plane/test/m/public-read/dec149.test.mjs:117` "\"cannot hand over the bytes of that edition, so its conclusion is no...\""
- testcopy `bio-plane/test/m/public-read/dec149.test.mjs:118` "\"It is NOT read from the working record instead: the frozen strength...\""
