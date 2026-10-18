# calculations: the words check after the conversion (K3949)

Layer 5. 8 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/calculations/application.mjs:390` [copy] "the body measured"
- inline `bio-plane/src/calculations/index.mjs:1542` [copy] "more than one entity"
- inline `bio-plane/src/calculations/index.mjs:342` "; its capture alone reads {}"
- inline `bio-plane/src/calculations/index.mjs:926` "the change is {standard} or {date: YYYY-MM-DD}. Nothing was written."
- inline `bio-plane/src/calculations/patterns.mjs:192` [copy] "a proceeding they arose in"
- inline `bio-plane/src/calculations/patterns.mjs:192` [copy] "an obligor office"
- testcopy `bio-plane/test/m/calculations/application.test.mjs:188` [part] "each reason listed with its count"
- testcopy `bio-plane/test/m/calculations/registrations.test.mjs:64` [part] "registered once, at start" — part test copy

## Plain findings (K3957)

5 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('calculations.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/calculations/application.mjs:56` "the share of each outcome in each group, with the group's size"
- plain `bio-plane/src/calculations/application.mjs:70` "per period, the measured value beside the threshold, with whether a target that binds t..."
- plain `bio-plane/src/calculations/index.mjs:1554` "an id space normalises a value but names no entity; declare the column's entity scheme ..."
- plain `bio-plane/src/calculations/index.mjs:1968` "an organisation and a date are needed"
- plain `bio-plane/src/calculations/tables.mjs:123` "a Table Schema is {fields: [{name, type}]} with one field per column"
