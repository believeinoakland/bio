# explore: the words check after the conversion (K3949)

Layer 5. 9 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/explore/answer.mjs:25` [copy] "a read names the member reading; an absent viewer is neither an adm..."
- inline `bio-plane/src/explore/answer.mjs:48` "{} is not a date-time {value, precision, zone} or an instant: {}"
- inline `bio-plane/src/explore/rederive.mjs:129` "a scope is {inquiry}: the inquiry the leg naming the chain belongs to"
- inline `bio-plane/src/explore/rederive.mjs:138` "step {} is neither a derived connection's parameters {kind, from, t..."
- inline `bio-plane/src/explore/rederive.mjs:35` "a scope is {inquiry}: the inquiry the leg naming the derived connec..."
- inline `bio-plane/src/explore/walk.mjs:49` "a scope is {inquiry}: the working inquiry whose hunch steps may be ..."
- testcopy `bio-plane/test/m/explore/graph-chain.test.mjs:106` "declared, not evidenced" — ambiguous: 4 rows share this en (screen.person.g.declared, screen.explore.g.declared, screen.explore.declared)
- testcopy `bio-plane/test/m/explore/walk.test.mjs:260` "declared, not evidenced"
- testcopy `bio-plane/test/m/explore/walk.test.mjs:346` "declared, not evidenced"
