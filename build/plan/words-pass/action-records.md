# action-records: the words check after the conversion (K3949)

Layer 9. 3 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- handlist `bio-plane/test/m/action-records/instance.test.mjs:144` [?] ops: actionlawspropose, actionseekspropose, actionriskpropose, ... (6 of 8 not the module's own) — handlist
- inline `bio-plane/src/action-records/index.mjs:442` "is {} law(s) stated by a member"
- inline `bio-plane/src/action-records/index.mjs:497` "it names {} stage(s) a"

## Plain findings (K3957)

5 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('action-records.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/action-records/index.mjs:498` "no member has stated what it seeks"
- plain `bio-plane/src/action-records/index.mjs:825` "action's risk tier, and nothing becomes it until a member states it themselves"
- plain `bio-plane/src/action-records/index.mjs:827` "risk-tier act sets that, and the record holds who made the proposal"
- plain `bio-plane/src/action-records/index.mjs:833` "becomes it until a member states it themselves"
- plain `bio-plane/src/action-records/index.mjs:835` "the action's seeks: only a member's own write states that, and the record holds who mad..."

## Test copies of code sentences (K3962)

1 test strings that copy the `en` of a product `localize` call (the check's testcopy arm, tag `code`, civicos-process ea6cd83). Each test compares with `localize(id, en)` or `word(id)` instead, or asserts the key (K3810). A copy of another module's sentence is fixed in this module's own test.

- testcopy `bio-plane/test/m/action-records/t50.test.mjs:140` "\"no action answers to that id here. An action you may not see is ans...\""
