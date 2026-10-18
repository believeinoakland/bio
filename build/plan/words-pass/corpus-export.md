# corpus-export: the words check after the conversion (K3949)

Layer 8. 1 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/corpus-export/tables.mjs:138` [copy] "stored tables its declaration did not state"

## Plain findings (K3957)

12 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('corpus-export.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/corpus-export/index.mjs:142` "no declared table has that name"
- plain `bio-plane/src/corpus-export/index.mjs:145` "derived-rebuildable: it travels as its rule"
- plain `bio-plane/src/corpus-export/index.mjs:145` "export never: its rows never travel"
- plain `bio-plane/src/corpus-export/index.mjs:148` "a page is named by its index, a whole number, and its after"
- plain `bio-plane/src/corpus-export/index.mjs:239` "an export's manifest: an object listing its records"
- plain `bio-plane/src/corpus-export/index.mjs:312` "a snapshot filed under this key"
- plain `bio-plane/src/corpus-export/index.mjs:319` "a promotion filed under this key"
- plain `bio-plane/src/corpus-export/index.mjs:349` "the declared tables, a list"
- plain `bio-plane/src/corpus-export/index.mjs:353` "the declared tables, a list"
- plain `bio-plane/src/corpus-export/index.mjs:366` "no row of a table declared export never"
- plain `bio-plane/src/corpus-export/index.mjs:389` "a canonical page of rows"
- plain `bio-plane/src/corpus-export/index.mjs:407` "every declared table carried or named"
