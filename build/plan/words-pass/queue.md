# queue: the words check after the conversion (K3949)

Layer 11. 2 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- handlist `bio-plane/test/m/queue/t50.test.mjs:130` keys: queue.muted.title, queue.muted.help, queue.muted.kind, ... (6 of 6 not the module's own) — handlist
- inline `bio-plane/src/queue/index.mjs:1145` "no code has ever used."

## Plain findings (K3957)

11 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('queue.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/queue/index.mjs:1048` "the task row carries a created stamp this producer cannot read as an instant"
- plain `bio-plane/src/queue/index.mjs:1608` "a personal preference is keyed (member, case); name the case it is about"
- plain `bio-plane/src/queue/index.mjs:1707` "two different preferences and this plane will not guess which one you meant"
- plain `bio-plane/src/queue/index.mjs:1731` "a kind is a slug and may not contain a comma; the stored set is comma-separated"
- plain `bio-plane/src/queue/index.mjs:1849` "the day could not be read in this copy's time zone; send an instant instead"
- plain `bio-plane/src/queue/index.mjs:2053` "member's own words — a disposition with no reason ages a finding with no account of why"
- plain `bio-plane/src/queuestate.mjs:106` "every owner of a project is inactive; rescue is available (D-47)"
- plain `bio-plane/src/queuestate.mjs:216` "a duplicate document was detected (D-60)"
- plain `bio-plane/src/queuestate.mjs:220` "a connection's grade is improvable (D-72)"
- plain `bio-plane/src/queuestate.mjs:222` "a bias statement's measure has decayed (D-87, D-90 — reports, never blocks)"
- plain `bio-plane/src/queuestate.mjs:228` "a register entry's bytes are unbacked (D-9, D-45)"
