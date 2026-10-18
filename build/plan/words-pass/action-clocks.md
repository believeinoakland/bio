# action-clocks: the words check after the conversion (K3949)

Layer 9. 6 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/action-clocks/count.mjs:178` [copy] "never confirmed here"
- inline `bio-plane/src/action-clocks/count.mjs:178` [copy] "no source stated"
- inline `bio-plane/src/action-clocks/count.mjs:179` "corrected locally by {}, {}"
- inline `bio-plane/src/action-clocks/count.mjs:286` [copy] "a malformed rule"
- inline `bio-plane/src/action-clocks/index.mjs:1443` [copy] "a later event"
- inline `bio-plane/src/action-clocks/index.mjs:1445` [copy] "the other side"

## Plain findings (K3957)

2 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('action-clocks.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/action-clocks/index.mjs:1382` "revises the action to state it"
- plain `bio-plane/src/action-clocks/index.mjs:1384` "and not a clock entry: a member states one by revising the action"
