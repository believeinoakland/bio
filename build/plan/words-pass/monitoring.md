# monitoring: the words check after the conversion (K3949)

Layer 10. 14 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/monitoring/index.mjs:1145` "— fetched {}, the OpenDocument export composed"
- inline `bio-plane/src/monitoring/index.mjs:1200` [copy] "no reason given"
- inline `bio-plane/src/monitoring/index.mjs:2554` "The document served at {}, gathered by the daemon for the named req..."
- inline `bio-plane/src/monitoring/index.mjs:3094` [copy] "an objective and a published finding"
- inline `bio-plane/src/monitoring/index.mjs:3095` [copy] "a published finding"
- inline `bio-plane/src/monitoring/index.mjs:920` [copy] "no content type"
- testcopy `bio-plane/test/m/monitoring/voice.test.mjs:14` [part] "The check of that Google Drive document did not run: the export add..." — part test copy
- testcopy `bio-plane/test/m/monitoring/voice.test.mjs:15` [part] "rather than a document, which is what Drive does when a file stops ..." — part test copy
- testcopy `bio-plane/test/m/monitoring/voice.test.mjs:16` [part] "Nothing was compared and nothing about the record changed — what is..." — part test copy
- testcopy `bio-plane/test/m/monitoring/voice.test.mjs:17` [part] "not see the document today." — part test copy
- testcopy `bio-plane/test/m/monitoring/voice.test.mjs:18` [part] "The check of that Google Drive document did not run: the export add..." — part test copy
- testcopy `bio-plane/test/m/monitoring/voice.test.mjs:19` [part] "document and sent a web page instead. Your team's Civicsmith reads ..."
- testcopy `bio-plane/test/m/monitoring/voice.test.mjs:21` [part] "change on every visit that nobody made."
- testcopy `bio-plane/test/m/monitoring/watch.test.mjs:45` [part] "the objective states no condition"
