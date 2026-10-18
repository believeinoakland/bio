# translations: the words check after the conversion (K3949)

Layer 11. 2 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- handlist `bio-plane/test/m/translations/module.test.mjs:66` [?] ops: interfacewords, translationadopt, translationconfirm, ... (8 of 9 not the module's own) — handlist
- inline `bio-plane/src/translations/index.mjs:142` "the member's language source is registered as a function, read({vie..."

## Plain findings (K3957)

7 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('translations.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/translations/index.mjs:145` "the member's language source is already registered; the first stands, and nothing was r..."
- plain `bio-plane/src/translations/index.mjs:223` "language, and one is named as"
- plain `bio-plane/src/translations/index.mjs:274` "asking a member to translate the screens"
- plain `bio-plane/src/translations/index.mjs:505` "the assistant did not draft it"
- plain `bio-plane/src/translations/index.mjs:512` "the draft's placeholders in braces differ from the English's, so it is not stored"
- plain `bio-plane/src/translations/index.mjs:610` "undoing a translation of the screens"
- plain `bio-plane/src/translations/index.mjs:756` "the request names no member and"
