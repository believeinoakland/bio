# provenance: the words check after the conversion (K3949)

Layer 3. 9 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- testcopy `bio-plane/test/m/provenance/register-checks.test.mjs:186` [part] "handed in at the doorbell"
- testcopy `bio-plane/test/m/provenance/register-checks.test.mjs:197` "and brought into the record by"
- testcopy `bio-plane/test/m/provenance/register-checks.test.mjs:254` [part] "handed in at the doorbell"
- testcopy `bio-plane/test/m/provenance/seam.test.mjs:25` [part] "A receipt names the captured document's fingerprint," — part test copy
- testcopy `bio-plane/test/m/provenance/seam.test.mjs:26` [part] "the address it was fetched from and when, and one of those was miss..." — part test copy
- testcopy `bio-plane/test/m/provenance/seam.test.mjs:27` [part] "Your team's Civicsmith holds no key to sign its receipts" — part test copy
- testcopy `bio-plane/test/m/provenance/seam.test.mjs:28` [part] "with, so this receipt was not signed, and nothing claims that it wa..."
- testcopy `bio-plane/test/m/provenance/upload.test.mjs:204` "for resolution through the task list" — partial test copy (template not matched to a row)
- testcopy `bio-plane/test/m/provenance/upload.test.mjs:52` "is proven by the receipt your team's Civicsmith itself made at" — regex
