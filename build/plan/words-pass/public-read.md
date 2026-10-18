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
