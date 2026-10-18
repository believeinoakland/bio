# bias: the words check after the conversion (K3949)

Layer 5. 10 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- testcopy `bio-plane/test/m/bias/dec149.test.mjs:17` [part] "each entry is a project statement on a subject a team statement in ..." — part test copy
- testcopy `bio-plane/test/m/bias/dec149.test.mjs:18` [part] "which names no statement it overrides: it must carry a justificatio..." — part test copy
- testcopy `bio-plane/test/m/bias/dec149.test.mjs:19` [part] "listed so a reviewer reads the two together (safeguard 3). It refus..." — part test copy
- testcopy `bio-plane/test/m/bias/dec149.test.mjs:57` [part] "A project's owners set the lens over that project's work: adopt thi..." — part test copy
- testcopy `bio-plane/test/m/bias/dec149.test.mjs:58` [part] "a project you own, or ask an administrator to adopt it for the whol..." — part test copy
- testcopy `bio-plane/test/m/bias/dec149.test.mjs:63` [part] "ask an administrator to adopt it for the whole team." — part test copy
- testcopy `bio-plane/test/m/bias/dec149.test.mjs:69` [part] "That statement names its subject in prose rather than pointing at t..." — part test copy
- testcopy `bio-plane/test/m/bias/dec149.test.mjs:70` [part] "Registry entries are what let the record notice when a project stat..." — part test copy
- testcopy `bio-plane/test/m/bias/dec149.test.mjs:71` [part] "statement are about the same thing — in prose, nothing can tell, an..." — part test copy
- testcopy `bio-plane/test/m/bias/dec149.test.mjs:72` [part] "quiet is the one this construct exists to prevent." — part test copy
