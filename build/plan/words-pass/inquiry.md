# inquiry: the words check after the conversion (K3949)

Layer 6. 13 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/inquiry/index.mjs:180` "and whether it is in {} could not be read, so the application is re..."
- inline `bio-plane/src/inquiry/index.mjs:181` "which is not in {}" — string concatenation (operand is a conditional or logical expression)
- inline `bio-plane/src/inquiry/index.mjs:2121` ", and {} of them CUT AGAINST this inquiry"
- inline `bio-plane/src/inquiry/index.mjs:2540` "again; that is a restructuring like any other and takes a reason."
- inline `bio-plane/src/inquiry/index.mjs:2749` "First grouping: no earlier structure to revise."
- inline `bio-plane/src/inquiry/index.mjs:2750` "Strength before: not stated (no module answers it here)."
- inline `bio-plane/src/inquiry/index.mjs:638` "this child does not name {}, which {} was also divided"
- inline `bio-plane/src/inquiry/index.mjs:640` "the other half EXISTS (R4)."
- inline `bio-plane/src/inquiry/index.mjs:642` "it also names {}, which {} was not divided into."
- testcopy `bio-plane/test/m/inquiry/person-warning.test.mjs:46` [part] "a person in a public role" — part test copy
- testcopy `bio-plane/test/m/inquiry/surfaced.test.mjs:17` [part] "This revision changes who surfaced the question, a member or an ass..." — part test copy
- testcopy `bio-plane/test/m/inquiry/surfaced.test.mjs:18` [part] "once, when the question is opened, and a later edit cannot rewrite ..." — part test copy
- testcopy `bio-plane/test/m/inquiry/surfaced.test.mjs:19` [part] "value the current version carries and save the revision again." — part test copy
