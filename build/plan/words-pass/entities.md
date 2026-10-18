# entities: the words check after the conversion (K3949)

Layer 5. 17 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- handlist `bio-plane/test/m/entities/ops.test.mjs:9` [?] ops: readingname, entitycreate, entityalias, ... (12 of 21 not the module's own) — handlist
- inline `bio-plane/src/entities/index.mjs:1068` "system one that issues or lists the scheme ({}), the row its own (K..."
- inline `bio-plane/src/entities/index.mjs:1169` "a proceeding is registered with its facet {forum, kind, number}, an..."
- inline `bio-plane/src/entities/index.mjs:1209` "a proceeding is registered with its facet {forum, kind, number}, an..."
- inline `bio-plane/src/entities/index.mjs:1385` "; its validity then is undetermined ({})"
- inline `bio-plane/src/entities/index.mjs:1777` "so a count taken from this list is a floor and never a total."
- inline `bio-plane/src/entities/index.mjs:1824` "this document's reading {} '{}', which is this subject's name '{}'"
- inline `bio-plane/src/entities/index.mjs:1825` "this document's reading {} '{}', which carries every word of this s..."
- inline `bio-plane/src/entities/index.mjs:1829` "; that name reaches {} of the {} references this reader can see at ..."
- inline `bio-plane/src/entities/index.mjs:1916` ". THIS IS THE FIRST {} AND NOT ALL OF THEM, so a count taken from i..."
- inline `bio-plane/src/entities/index.mjs:253` "the scheme names ({})"
- inline `bio-plane/src/entities/index.mjs:717` [copy] "a read names the member reading; an absent viewer is neither an adm..."
- testcopy `bio-plane/test/m/entities/registry.test.mjs:84` [part] "A subject is registered with a note in your own words saying who or..." — part test copy
- testcopy `bio-plane/test/m/entities/registry.test.mjs:85` [part] "in the registry, and this one has none. Nothing was written." — part test copy
- testcopy `bio-plane/test/m/entities/t33.test.mjs:355` "Registered from the captured document" — regex
- testcopy `bio-plane/test/m/entities/t48.test.mjs:11` [part] "This is asked of a proceeding, such as a case before a court or a b..." — part test copy
- testcopy `bio-plane/test/m/entities/t48.test.mjs:12` [part] "registered as another kind. Name the proceeding itself. Nothing was..." — part test copy
