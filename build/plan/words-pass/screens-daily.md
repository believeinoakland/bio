# screens-daily: the words check after the conversion (K3949)

Layer 11. 19 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- handlist `bio-plane/test/m/screens-daily/elsewhere.test.mjs:75` [?] ops: whoami, interfacewords, infolevel, ... (7 of 10 not the module's own) — handlist
- testcopy `bio-plane/test/m/screens-daily/answers-stream.test.mjs:83` "Find and count" — drawn module: its L11 job
- testcopy `bio-plane/test/m/screens-daily/browse.test.mjs:125` "Why look again" — drawn module: its L11 job
- testcopy `bio-plane/test/m/screens-daily/browse.test.mjs:126` "Why look again" — drawn module: its L11 job
- testcopy `bio-plane/test/m/screens-daily/browse.test.mjs:126` "Why look again" — drawn module: its L11 job
- testcopy `bio-plane/test/m/screens-daily/browse.test.mjs:75` "the marks could not be read" — drawn module: its L11 job
- testcopy `bio-plane/test/m/screens-daily/browse.test.mjs:76` "the marks could not be read" — drawn module: its L11 job
- testcopy `bio-plane/test/m/screens-daily/contract.test.mjs:102` "Check a claim" — drawn module: its L11 job
- testcopy `bio-plane/test/m/screens-daily/contract.test.mjs:109` "Check a claim" — drawn module: its L11 job
- testcopy `bio-plane/test/m/screens-daily/contract.test.mjs:109` "Vouch for photos" — drawn module: its L11 job
- testcopy `bio-plane/test/m/screens-daily/contract.test.mjs:96` "Vouch for photos" — drawn module: its L11 job
- testcopy `bio-plane/test/m/screens-daily/find-in.test.mjs:19` "not read yet" — drawn module: its L11 job
- testcopy `bio-plane/test/m/screens-daily/finder.test.mjs:14` [part] "Administrative Instruction 4.12" — part test copy
- testcopy `bio-plane/test/m/screens-daily/finder.test.mjs:60` [part] "Administrative Instruction 4.12" — part test copy
- testcopy `bio-plane/test/m/screens-daily/home.test.mjs:106` [part] "an area with nothing to show is left out" — part test copy
- testcopy `bio-plane/test/m/screens-daily/home.test.mjs:304` "Get a record" — drawn module: its L11 job
- testcopy `bio-plane/test/m/screens-daily/home.test.mjs:305` "Check a claim" — drawn module: its L11 job
- testcopy `bio-plane/test/m/screens-daily/join.test.mjs:16` "Check a claim" — drawn module: its L11 job
- testcopy `bio-plane/test/m/screens-daily/queue.test.mjs:17` [part] "Two documents give different dates" — part test copy
