# provenance-routes: the words check after the conversion (K3949)

Layer 3. 2 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- testcopy `bio-plane/test/m/provenance-routes/marked.test.mjs:27` [part] "no assessment of this document's route has ever been recorded. This..." — part test copy
- testcopy `bio-plane/test/m/provenance-routes/marked.test.mjs:28` [part] "that the route cannot be shown; it is the absence of the question h..."

## Plain findings (K3957)

12 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('provenance-routes.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/provenance-routes/index.mjs:56` "nobody looked at this level for this subject"
- plain `bio-plane/src/provenance-routes/index.mjs:57` "we looked and it is positively not there"
- plain `bio-plane/src/provenance-routes/index.mjs:58` "we looked and could not tell"
- plain `bio-plane/src/provenance-routes/index.mjs:59` "we looked and it is there"
- plain `bio-plane/src/provenance-routes/index.mjs:382` "be shown. Nobody has looked"
- plain `bio-plane/src/provenance-routes/index.mjs:385` "route showable. This is the earned statement that no document carries a marker: somebod..."
- plain `bio-plane/src/provenance-routes/index.mjs:462` "that the evidence supported this route"
- plain `bio-plane/src/provenance-routes/index.mjs:479` "this record carries no readable data/provenance.json, so there is no capture record to ..."
- plain `bio-plane/src/provenance-routes/index.mjs:526` "every document already records a chain"
- plain `bio-plane/src/provenance-routes/index.mjs:745` "record adds when something changed rather than repeating itself"
- plain `bio-plane/src/provenance-routes/index.mjs:749` "recorded: every document in this register can show its route"
- plain `bio-plane/src/provenance-routes/index.mjs:970` "is complete over the corpus"

## Test copies of code sentences (K3962)

6 test strings that copy the `en` of a product `localize` call (the check's testcopy arm, tag `code`, civicos-process ea6cd83). Each test compares with `localize(id, en)` or `word(id)` instead, or asserts the key (K3810). A copy of another module's sentence is fixed in this module's own test.

- testcopy `bio-plane/test/m/provenance-routes/audit.test.mjs:78` "\"these are STATED DOUBTS, not conformance errors, and they are delib...\""
- testcopy `bio-plane/test/m/provenance-routes/audit.test.mjs:79` "\"`tally` or `withErrors`: each names a document whose route cannot b...\""
- testcopy `bio-plane/test/m/provenance-routes/audit.test.mjs:80` "\"the team put it (DEC-56/DEC-19). `NEVER_LOOKED` is a different fact...\""
- testcopy `bio-plane/test/m/provenance-routes/audit.test.mjs:81` "\"assessment has run, not that anything is wrong.\""
- testcopy `bio-plane/test/m/provenance-routes/chain.test.mjs:162` "\"these bytes were received for upload:\""
- testcopy `bio-plane/test/m/provenance-routes/rebuild.test.mjs:223` "\"these bytes were received for upload:\""
