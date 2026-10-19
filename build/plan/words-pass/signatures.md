# signatures: the words check after the conversion (K3949)

Layer 1. 25 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- testcopy `bio-plane/test/m/signatures/signer-keys.test.mjs:113` "Both public keys: paste these into the session"
- testcopy `bio-plane/test/m/signatures/signer-keys.test.mjs:145` "Both public keys: paste these into the session"
- testcopy `bio-plane/test/m/signatures/signer-keys.test.mjs:179` "Both public keys: paste these into the session"
- testcopy `bio-plane/test/m/signatures/signer-keys.test.mjs:214` "Both public keys: paste these into the session"
- testcopy `bio-plane/test/m/signatures/signer-keys.test.mjs:223` "Release key: raw, for the signing secret only"
- testcopy `bio-plane/test/m/signatures/signer-keys.test.mjs:280` "Recovery key: public, paste this into the session" — computed member key
- testcopy `bio-plane/test/m/signatures/signer-keys.test.mjs:281` "Recovery key: private, keep this offline"
- testcopy `bio-plane/test/m/signatures/signer-keys.test.mjs:308` "Recovery key: public, paste this into the session" — computed member key
- testcopy `bio-plane/test/m/signatures/signer-keys.test.mjs:309` "Recovery key: private, keep this offline"
- testcopy `bio-plane/test/m/signatures/signer-keys.test.mjs:325` "Recovery key: private, keep this offline" — computed member key
- testcopy `bio-plane/test/m/signatures/signer-keys.test.mjs:326` "Recovery key: public, paste this into the session"
- testcopy `bio-plane/test/m/signatures/signer-keys.test.mjs:336` "Recovery key: public, paste this into the session"
- testcopy `bio-plane/test/m/signatures/signer-keys.test.mjs:338` "Recovery key: private, keep this offline"
- testcopy `bio-plane/test/m/signatures/signer-keys.test.mjs:361` "Recovery key: private, keep this offline"
- testcopy `bio-plane/test/m/signatures/signpage.test.mjs:519` [part] "Copy the record id and its current hash from its page in your team'..." — part test copy
- testcopy `bio-plane/test/m/signatures/signpage.test.mjs:520` [part] "Copy the notice id, its revision number and its hash from its page ..." — part test copy
- testcopy `bio-plane/test/m/signatures/signpage.test.mjs:521` [part] "Copy the case id, the entry number and the entry hash from its page..." — part test copy
- testcopy `bio-plane/test/m/signatures/signpage.test.mjs:537` "Signature: paste this into the ratify box in your team's Civicsmith" — no AST match for the finding
- testcopy `bio-plane/test/m/signatures/signpage.test.mjs:538` [part] "you submit it, your team's Civicsmith refuses this signature and yo..." — part test copy
- testcopy `bio-plane/test/m/signatures/signpage.test.mjs:539` "Paste the notice id, as your team's Civicsmith shows it." — no AST match for the finding
- testcopy `bio-plane/test/m/signatures/signpage.test.mjs:540` "Signature: paste this into the notice box in your team's Civicsmith" — no AST match for the finding
- testcopy `bio-plane/test/m/signatures/signpage.test.mjs:541` [part] "you post it, your team's Civicsmith refuses this signature and you ..." — part test copy
- testcopy `bio-plane/test/m/signatures/signpage.test.mjs:542` "Paste the case id, as your team's Civicsmith shows it." — no AST match for the finding
- testcopy `bio-plane/test/m/signatures/signpage.test.mjs:543` "Signature: paste this into the docket box in your team's Civicsmith" — no AST match for the finding
- testcopy `bio-plane/test/m/signatures/signpage.test.mjs:544` [part] "you post it, your team's Civicsmith refuses this signature and you ..." — part test copy
