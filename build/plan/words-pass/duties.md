# duties: the words check after the conversion (K3949)

Layer 5. 15 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/duties/index.mjs:1112` [copy] "the precision held does not say"
- inline `bio-plane/src/duties/index.mjs:1204` [copy] "its stated review date"
- inline `bio-plane/src/duties/index.mjs:1646` [copy] "a read names the member reading; an absent viewer is neither an adm..."
- inline `bio-plane/src/duties/index.mjs:1714` [copy] "undetermined at the date asked"
- inline `bio-plane/src/duties/index.mjs:308` "this organisation's sector is {}, and no {} line, and no source it ..."
- inline `bio-plane/src/duties/index.mjs:309` "an entity of kind {} owes no obligation." — string concatenation (operand is a conditional or logical expression)
- inline `bio-plane/src/duties/index.mjs:326` "they are the team's own deadlines on its actions, never a body's ob..."
- inline `bio-plane/src/duties/vocab.mjs:35` [copy] "is owed to" — leaf: loads nothing
- inline `bio-plane/src/duties/vocab.mjs:36` [copy] "holds the power" — leaf: loads nothing
- testcopy `bio-plane/test/m/duties/acts.test.mjs:119` [part] "computed from the profile rule"
- testcopy `bio-plane/test/m/duties/acts.test.mjs:96` [part] "computed from the profile rule"
- testcopy `bio-plane/test/m/duties/t46-words.test.mjs:31` [part] "the report requires. This is neither. Nothing was written." — part test copy
- testcopy `bio-plane/test/m/duties/t46-words.test.mjs:33` [part] "of that document. Nothing was written." — part test copy
- testcopy `bio-plane/test/m/duties/t46-words.test.mjs:34` [part] "This promise rests on a commitment that is still only proposed as a..." — part test copy
- testcopy `bio-plane/test/m/duties/t46-words.test.mjs:40` [part] "as written and never completed. Nothing was written." — part test copy

## Plain findings (K3957)

15 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('duties.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/duties/index.mjs:543` "proposing an obligation with no stamp"
- plain `bio-plane/src/duties/index.mjs:585` "proposing a review with no stamp"
- plain `bio-plane/src/duties/index.mjs:640` "the record holds no such capture you can see"
- plain `bio-plane/src/duties/index.mjs:645` "the extent names no part of that capture"
- plain `bio-plane/src/duties/index.mjs:650` "the extent names no part of that capture"
- plain `bio-plane/src/duties/index.mjs:664` "proposing an obligation from a response with no stamp"
- plain `bio-plane/src/duties/index.mjs:970` "as is one of obligor, obligee, enforcer"
- plain `bio-plane/src/duties/index.mjs:1030` "the events service is not available"
- plain `bio-plane/src/duties/index.mjs:1044` "the expansion stopped at its bound (24 months or 500 instances)"
- plain `bio-plane/src/duties/index.mjs:1051` "no module has registered this trigger source"
- plain `bio-plane/src/duties/index.mjs:1231` "matching an event to an obligation"
- plain `bio-plane/src/duties/index.mjs:1390` "the events service cannot answer the uses of a power"
- plain `bio-plane/src/duties/index.mjs:1399` "the uses could not be read"
- plain `bio-plane/src/duties/index.mjs:1520` "linking a use to a power"
- plain `bio-plane/src/duties/index.mjs:1520` "unlinking a use from a power"
