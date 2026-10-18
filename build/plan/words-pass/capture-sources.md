# capture-sources: the words check after the conversion (K3949)

Layer 3. 20 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/drive.mjs:245` ", though the link named {}"
- inline `bio-plane/src/render.mjs:151` [copy] "an unstated number of"
- inline `bio-plane/src/render.mjs:472` "rather than on the `{}` condition"
- inline `bio-plane/src/render.mjs:475` "the renderer reported the wait fired on `{}`, which is neither the"
- inline `bio-plane/src/render.mjs:476` "`{}` condition your team's Civicsmith asked for nor a timeout"
- inline `bio-plane/src/render.mjs:477` [copy] "the renderer did not report which wait ended the render"
- testcopy `bio-plane/test/m/capture-sources/browserrender.test.mjs:499` "was refused before it was sent ("
- testcopy `bio-plane/test/m/capture-sources/dec149.test.mjs:29` "A Drive address whose shape is unread is not a document"
- testcopy `bio-plane/test/m/capture-sources/dec149.test.mjs:45` "recorded fetching the export address, but"
- testcopy `bio-plane/test/m/capture-sources/dec149.test.mjs:48` "; the two disagree and neither is taken over the other"
- testcopy `bio-plane/test/m/capture-sources/dec149.test.mjs:50` ", not the export address — Google serves the application there, not..."
- testcopy `bio-plane/test/m/capture-sources/dec149.test.mjs:52` "recorded these bytes from BOTH the export and" — partial test copy (template not matched to a row)
- testcopy `bio-plane/test/m/capture-sources/dec149.test.mjs:53` "the register row names the export address and"
- testcopy `bio-plane/test/m/capture-sources/dec149.test.mjs:55` "for a row at the document address;" — partial test copy (template not matched to a row)
- testcopy `bio-plane/test/m/capture-sources/dec149.test.mjs:56` "holds no direct retrieval record for these bytes and"
- testcopy `bio-plane/test/m/capture-sources/dec149.test.mjs:79` "did not keep this render's subresource bytes"
- testcopy `bio-plane/test/m/capture-sources/render.test.mjs:188` "-byte per-subresource ceiling"
- testcopy `bio-plane/test/m/capture-sources/render.test.mjs:199` "-body per-capture ceiling"
- testcopy `bio-plane/test/m/capture-sources/render.test.mjs:204` "-byte subresource budget was spent"
- testcopy `bio-plane/test/m/capture-sources/render.test.mjs:359` [part] "no assertion was supplied"

## Plain findings (K3957)

20 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('capture-sources.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/browserrender.mjs:149` "it is not a public https address"
- plain `bio-plane/src/browserrender.mjs:150` "its host is one of your team's own (where your team's Civicsmith or its fleet is reached)"
- plain `bio-plane/src/capture-sources/credentials.mjs:226` "only an editor of the project may supply a credential for it"
- plain `bio-plane/src/capture-sources/credentials.mjs:232` "only its supplier or an owner of its project may withdraw a project credential"
- plain `bio-plane/src/capture-sources/credentials.mjs:285` "the supplier named is not an active member of your team"
- plain `bio-plane/src/capture-sources/credentials.mjs:295` "the host given is not a bare host name (a credential is for the one host the source tha..."
- plain `bio-plane/src/capture-sources/credentials.mjs:302` "the host given is one of your team's own (where your team's Civicsmith or its fleet is ..."
- plain `bio-plane/src/capture-sources/credentials.mjs:314` "the project named is not a project this record holds"
- plain `bio-plane/src/capture-sources/credentials.mjs:326` "no encryption key is set for your team's Civicsmith, so nothing is stored in the clear"
- plain `bio-plane/src/capture-sources/credentials.mjs:334` "the credential could not be encrypted and stored, so nothing was written"
- plain `bio-plane/src/capture-sources/credentials.mjs:416` "no credential by that id is visible to this member"
- plain `bio-plane/src/capture-sources/credentials.mjs:428` "the credential could not be read or withdrawn, so nothing was changed"
- plain `bio-plane/src/capture-sources/memento.mjs:81` "the link-format text is not a string"
- plain `bio-plane/src/capture-sources/memento.mjs:171` "the TimeMap holds no memento at or before the bound"
- plain `bio-plane/src/capture-sources/memento.mjs:202` "the TimeGate's Location is not an address"
- plain `bio-plane/src/capture-sources/memento.mjs:251` "no Memento-Datetime was recorded with this hop"
- plain `bio-plane/src/cdx.mjs:45` "the first row does not name timestamp and original"
- plain `bio-plane/src/cdx.mjs:83` "digest is the empty-body digest: the capture holds nothing"
- plain `bio-plane/src/cdx.mjs:109` "the index holds no 200 response with a non-empty body for this address"
- plain `bio-plane/src/render.mjs:426` "requests: the renderer did not record the page's requests, so render.requests and rende..."
