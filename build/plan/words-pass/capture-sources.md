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
