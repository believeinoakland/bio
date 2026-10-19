# steps: the words check after the conversion (K3949)

Layer 6. 6 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/steps/checks.mjs:48` [copy] "Only a member does this, in their own words and by their own choice..."
- inline `bio-plane/src/steps/index.mjs:1116` "a cost is {kind: {}, amount: an exact decimal string, currency: a t..."
- inline `bio-plane/src/steps/index.mjs:559` "a step names its place: {questions}, {project} or {group: true}"
- inline `bio-plane/src/steps/index.mjs:562` "a step's place is exactly one of {questions}, {project} or {group: ..."
- inline `bio-plane/src/steps/index.mjs:585` "a date is {date: YYYY-MM-DD, basis: {}, source?}"
- inline `bio-plane/src/steps/index.mjs:995` "a wait is on one of {step}, {arrival: {kind, id}} or {date}"

## Plain findings (K3957)

4 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('steps.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/steps/index.mjs:564` "a team step's place is {group: true}"
- plain `bio-plane/src/steps/index.mjs:703` "a step on questions records an outcome per question: {<question>: outcome}"
- plain `bio-plane/src/steps/index.mjs:737` "the system records neither an outcome nor a learned line (D33)"
- plain `bio-plane/src/steps/index.mjs:846` "a team step is the team's, and its place is fixed at creation"

## Test copies of code sentences (K3962)

1 test strings that copy the `en` of a product `localize` call (the check's testcopy arm, tag `code`, civicos-process ea6cd83). Each test compares with `localize(id, en)` or `word(id)` instead, or asserts the key (K3810). A copy of another module's sentence is fixed in this module's own test.

- testcopy `bio-plane/test/m/steps/follow.test.mjs:64` "\"no outcome moves by itself\""
