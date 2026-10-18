# store-door: the words check after the conversion (K3949)

Layer 11. 1 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- handlist `bio-plane/test/m/store-door/routes.test.mjs:42` [?] ops: knockerconsent, sourceconsent, sourceconsentwithdraw, ... (10 of 10 not the module's own) — handlist

## Plain findings (K3957)

3 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('store-door.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/store-door/dispatch.mjs:244` "purge refused: a litigation hold is in place"
- plain `bio-plane/src/store-door/dispatch.mjs:308` "the account that would serve this draft could not be read; nothing was used"
- plain `bio-plane/src/store-door/dispatch.mjs:333` "asking the assistant to draft the team's description"
