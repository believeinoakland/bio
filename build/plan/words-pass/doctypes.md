# doctypes: the words check after the conversion (K3949)

Layer 1. 6 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `doctypes/staff-directory.mjs:144` "{} distinct contact address(es) at one organisation's domain ({})," — leaf: loads nothing
- inline `doctypes/staff-directory.mjs:145` "{}% of the {} in the document" — leaf: loads nothing
- inline `doctypes/staff-directory.mjs:153` "it names itself in its title line (\"{}\")" — leaf: loads nothing
- inline `doctypes/staff-directory.mjs:219` "{} change(s) to the directory's entries" — leaf: loads nothing
- testcopy `doctypes/test/policies.mjs:20` [part] "Administrative Instruction" — part test copy
- testcopy `doctypes/test/regulation-sections.test.mjs:269` [part] "the address it was fetched from" — part test copy
