# project-stage: the words check after the conversion (K3949)

Layer 8. 5 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/project-stage/index.mjs:48` [copy] "{with_legs} of the {read} held questions read have at least one leg..." — text holds a literal {name}, filled by its caller
- inline `bio-plane/src/project-stage/index.mjs:49` "reached because a later stage is reached; none of the {read} held q..."
- inline `bio-plane/src/project-stage/index.mjs:52` "the project holds {read} questions and none has a leg in its basis;..."
- inline `bio-plane/src/project-stage/index.mjs:54` "the project has concluded {concluded} of the {read} held questions ..."
- inline `bio-plane/src/project-stage/index.mjs:56` "the project has concluded none of the {read} held questions read an..."
