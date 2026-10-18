# escalation: the words check after the conversion (K3949)

Layer 9. 10 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/escalation/index.mjs:1534` [copy] "what the record does not state (undetermined)"
- inline `bio-plane/src/escalation/index.mjs:1534` [copy] "what the record does not state (undetermined)"
- inline `bio-plane/src/escalation/index.mjs:1537` "The determination states: {}."
- inline `bio-plane/src/escalation/index.mjs:1554` "; its state is {}"
- inline `bio-plane/src/escalation/index.mjs:1560` [copy] "(its text undetermined)"
- inline `bio-plane/src/escalation/index.mjs:1567` [copy] "the day of reading"
- testcopy `bio-plane/test/m/escalation/draft.test.mjs:166` "has passed is undetermined"
- testcopy `bio-plane/test/m/escalation/structure.test.mjs:231` "A response evaluated in escalation"
- testcopy `bio-plane/test/m/escalation/voice.test.mjs:10` [part] "Part of the record this answer depends on cannot be read by your te..." — part test copy
- testcopy `bio-plane/test/m/escalation/voice.test.mjs:11` [part] "so nothing is answered in its place. Nothing was written." — part test copy
