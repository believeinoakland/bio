# link-sweep: the words check after the conversion (K3949)

Layer 10. 3 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/link-sweep/checks.mjs:123` "must be {per_run, backlog}: per_run an integer {}, backlog an integ..."
- inline `bio-plane/src/link-sweep/sweep.mjs:305` [copy] "the daemon is paused" — compared as a value (not shown)
- inline `bio-plane/src/link-sweep/sweep.mjs:528` [copy] "no reason given"

## Plain findings (K3957)

12 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('link-sweep.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/link-sweep/checks.mjs:65` "must be 1 to 40 lowercase letters, digits or hyphens, starting with a letter or digit"
- plain `bio-plane/src/link-sweep/sweep-match.mjs:51` "the expression ends with a backslash"
- plain `bio-plane/src/link-sweep/sweep-match.mjs:81` "a reversed or open range"
- plain `bio-plane/src/link-sweep/sweep-match.mjs:81` "a range in a class runs backwards or ends in a class"
- plain `bio-plane/src/link-sweep/sweep-match.mjs:113` "a quantifier with nothing to repeat"
- plain `bio-plane/src/link-sweep/sweep-match.mjs:129` "a count past the bound"
- plain `bio-plane/src/link-sweep/sweep-match.mjs:134` "an anchor or word boundary cannot be repeated"
- plain `bio-plane/src/link-sweep/sweep-match.mjs:156` "an expression past the bound"
- plain `bio-plane/src/link-sweep/sweep.mjs:281` "its bundle's daemon block says enabled: false"
- plain `bio-plane/src/link-sweep/sweep.mjs:420` "governed; the per-host governor held the seed's fetch"
- plain `bio-plane/src/link-sweep/sweep.mjs:460` "governed; the per-host governor held the fetch"
- plain `bio-plane/src/link-sweep/sweep.mjs:585` "the sweep's backlog is at or over its limit"
