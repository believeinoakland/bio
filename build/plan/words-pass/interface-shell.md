# interface-shell: the words check after the conversion (K3949)

Layer 11. 4 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- handlist `bio-plane/test/m/interface-shell/t50.test.mjs:510` [?] ops: interfacewords, infolevel, assistantstate, ... (7 of 9 not the module's own) — handlist
- handlist `bio-plane/test/m/interface-shell/words-keys.test.mjs:14` keys: level.pause.name, level.prompt.name, rail.people.line, ... (43 of 189 not the module's own) — handlist
- inline `bio-plane/src/interface-shell/browser.mjs:1511` [stitched] "-----BEGIN SSH SIGNATURE----- {} -----END SSH SIGNATURE-----" — drawn module: its L11 job
- testcopy `bio-plane/test/m/interface-shell/kit.test.mjs:394` "At a set time" — drawn module: its L11 job
