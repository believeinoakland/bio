# inquiry-grammar: the words check after the conversion (K3949)

Layer 6. 11 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- handlist `bio-plane/test/m/inquiry-grammar/grammar.test.mjs:223` [?] codes: NOT_INQUIRIES, SELF_BASIS, BASIS_CYCLE, ... (5 of 12 not the module's own) — handlist
- inline `bio-plane/src/inquiry-grammar/grammar.mjs:147` "add a references[] entry {rel: supersedes, target: {}} with its reason"
- inline `bio-plane/src/inquiry-grammar/grammar.mjs:1782` "{} is not a list: it lists each bias statement applied here, one {s..." — text holds braces (ICU syntax in t)
- inline `bio-plane/src/inquiry-grammar/grammar.mjs:1783` "make {} a list of {statement, effect} items, or drop it — where no ..." — text holds braces (ICU syntax in t)
- inline `bio-plane/src/inquiry-grammar/grammar.mjs:1790` "{} is not an object: an application names the statement applied and..." — text holds braces (ICU syntax in t)
- inline `bio-plane/src/inquiry-grammar/grammar.mjs:1791` "state {} as {statement, effect}, with from and to when the effect i..." — text holds braces (ICU syntax in t)
- inline `bio-plane/src/inquiry-grammar/grammar.mjs:463` "(including {} that cut{} AGAINST this inquiry)"
- inline `bio-plane/src/inquiry-grammar/grammar.mjs:756` "Testimony is a member's account of a connection"
- inline `bio-plane/src/inquiry-grammar/grammar.mjs:941` "{} basis leg{} carr{} no ground while {} do: a basis is grouped WHO..."
- testcopy `bio-plane/test/m/inquiry-grammar/grammar.test.mjs:233` [part] "A leg on another team's finding names that finding and one edition,..." — part test copy
- testcopy `bio-plane/test/m/inquiry-grammar/grammar.test.mjs:234` [part] "its grades are that edition's. Correct the leg. Nothing was written." — part test copy
