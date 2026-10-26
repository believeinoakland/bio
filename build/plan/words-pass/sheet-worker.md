# sheet-worker: the words check after the conversion (K3949)

Layer 1.

## Plain findings (K3957)

9 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('sheet-worker.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `sheet-worker/src/contract.mjs:73` "store must be named: this member reads a capture from one namespace and guesses none"
- plain `sheet-worker/src/contract.mjs:77` "no capture with that sha in that store"
- plain `sheet-worker/src/contract.mjs:80` "the engine did not load as the pinned build, so no workbook is recomputed"
- plain `sheet-worker/src/contract.mjs:82` "the workbook is larger than this member recomputes; nothing of it was recomputed"
- plain `sheet-worker/src/contract.mjs:83` "the workbook refers to other workbooks, whose values are not here"
- plain `sheet-worker/src/contract.mjs:84` "the engine refused or failed on this workbook"
- plain `sheet-worker/src/contract.mjs:85` "loading the workbook took longer than the time budget, so evaluation was not started"
- plain `sheet-worker/src/member.mjs:61` "the engine refused the workbook while loading it"
- plain `sheet-worker/src/member.mjs:74` "the engine failed while evaluating the workbook"
