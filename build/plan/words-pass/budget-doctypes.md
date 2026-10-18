# budget-doctypes: the words check after the conversion (K3949)

Layer 1. 1 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- testcopy `budget-doctypes/test/budget-doctypes.test.mjs:90` [part] "Annual Comprehensive Financial Report" — part test copy

## Plain findings (K3957)

20 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('budget-doctypes.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `budget-doctypes/assess.mjs:30` "(row with no label read)"
- plain `budget-doctypes/assess.mjs:38` "no table was read in either reading, so nothing can be compared"
- plain `budget-doctypes/assess.mjs:67` "every table and figure read is as it was"
- plain `budget-doctypes/assess.mjs:75` "no budget line was read in either reading, so nothing can be compared"
- plain `budget-doctypes/assess.mjs:106` "every line read is as it was"
- plain `budget-doctypes/index.mjs:85` "no table was read: no run of rows with two or more figures was found in the text read"
- plain `budget-doctypes/index.mjs:120` "its header row names a fund or org column and an amount column"
- plain `budget-doctypes/index.mjs:121` "no header row names a fund or org column and an amount column by the view's header words"
- plain `budget-doctypes/lines.mjs:87` "no sheet was supplied with this text, so no budget line could be read"
- plain `budget-doctypes/lines.mjs:95` "tab-joined text drops an empty cell, so no value could be placed in its column"
- plain `budget-doctypes/lines.mjs:121` "the row holds no fund and no org code"
- plain `budget-doctypes/lines.mjs:121` "the row holds no fund code"
- plain `budget-doctypes/lines.mjs:121` "the row holds no org code"
- plain `budget-doctypes/tables.mjs:85` "printed above a table; not a row of it, and the share is not a negative figure"
- plain `budget-doctypes/tables.mjs:219` "no label was read beside these figures in the text read"
- plain `budget-doctypes/tables.mjs:238` "no row holds two or more figures"
- plain `budget-doctypes/tables.mjs:242` "the table's headers are not in the text read"
- plain `budget-doctypes/tables.mjs:256` "no heading the view names, and no table caption, was read above or below the table"
- plain `budget-doctypes/tables.mjs:258` "no fiscal-year form the view holds was read above, below or in the header of the table"
- plain `budget-doctypes/tables.mjs:376` "layer only, and no table is read from this page"
