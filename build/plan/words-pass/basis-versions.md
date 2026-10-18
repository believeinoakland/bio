# basis-versions: the words check after the conversion (K3949)

Layer 6. 28 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- handlist `bio-plane/test/m/basis-versions/acts.test.mjs:166` [?] ops: basisversions, narrow, narrowcandidates, ... (8 of 13 not the module's own) — handlist
- inline `bio-plane/src/basis-versions/conclude.mjs:174` "(INVESTIGATIVE-SESSION.md §7.1). Drawn with no project there is no ..."
- inline `bio-plane/src/basis-versions/conclude.mjs:299` "Falsifier: NO FALSIFIER STATED — recorded by {} at {}"
- inline `bio-plane/src/basis-versions/conclude.mjs:454` "Changes: this project now stands on reading '{}' of {}, written by {}."
- inline `bio-plane/src/basis-versions/conclude.mjs:454` "Commentary ({}, not evidence): {}"
- inline `bio-plane/src/basis-versions/conclude.mjs:454` "Falsifier: NO FALSIFIER STATED — recorded by {} at {}"
- inline `bio-plane/src/basis-versions/grammar.mjs:408` "version '{}' has {} leg{} with no ground while {} ground{} named: a..."
- inline `bio-plane/src/basis-versions/index.mjs:1015` "and there is no default project."
- inline `bio-plane/src/basis-versions/index.mjs:1107` "'{}' rests on {} separately sufficient parts and this"
- inline `bio-plane/src/basis-versions/index.mjs:1109` "carry the finding on its own. {}{} Pass"
- inline `bio-plane/src/basis-versions/index.mjs:1113` "default, because that is exactly how a finding gets strengthened by..."
- inline `bio-plane/src/basis-versions/index.mjs:1270` "It holds no readings at all: the live basis is not a reading, and"
- inline `bio-plane/src/basis-versions/index.mjs:1271` "a citation on it is made more specific by a reading taken from it."
- inline `bio-plane/src/basis-versions/index.mjs:1422` "of a proposed passage."
- inline `bio-plane/src/basis-versions/index.mjs:1448` "in a DIFFERENT copy of it ({}…)"
- inline `bio-plane/src/basis-versions/index.mjs:1449` "in a different document ({})"
- inline `bio-plane/src/basis-versions/index.mjs:1481` "— it is the reading being narrowed, and reusing its name would chan..."
- inline `bio-plane/src/basis-versions/index.mjs:1487` "why that part is the one on point."
- inline `bio-plane/src/basis-versions/index.mjs:1527` "Chosen from a machine proposal ({})."
- inline `bio-plane/src/basis-versions/index.mjs:1527` "Named by the member."
- inline `bio-plane/src/basis-versions/index.mjs:1527` "The old grade was not carried: a part earns only from what is in it."
- inline `bio-plane/src/basis-versions/index.mjs:481` "question's basis, and there is no default question."
- inline `bio-plane/src/basis-versions/index.mjs:696` [copy] "the inquiry carries no such reading"
- inline `bio-plane/src/basis-versions/index.mjs:697` [copy] "that reading does not state the claim recorded"
- inline `bio-plane/src/basis-versions/index.mjs:897` "there must not be one."
- inline `bio-plane/src/basis-versions/index.mjs:905` "wrong one is worse than being asked which was meant."
- testcopy `bio-plane/test/m/basis-versions/grammar.test.mjs:14` [part] "a reading of the evidence" — part test copy
- testcopy `bio-plane/test/m/basis-versions/imported-legs.test.mjs:21` [part] "not accepted at that edition" — part test copy
