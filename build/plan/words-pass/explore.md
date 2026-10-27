# explore: the words check after the conversion (K3949)

Layer 5. 9 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/explore/answer.mjs:25` [copy] "a read names the member reading; an absent viewer is neither an adm..."
- inline `bio-plane/src/explore/answer.mjs:48` "{} is not a date-time {value, precision, zone} or an instant: {}"
- inline `bio-plane/src/explore/rederive.mjs:129` "a scope is {inquiry}: the inquiry the leg naming the chain belongs to"
- inline `bio-plane/src/explore/rederive.mjs:138` "step {} is neither a derived connection's parameters {kind, from, t..."
- inline `bio-plane/src/explore/rederive.mjs:35` "a scope is {inquiry}: the inquiry the leg naming the derived connec..."
- inline `bio-plane/src/explore/walk.mjs:49` "a scope is {inquiry}: the working inquiry whose hunch steps may be ..."
- testcopy `bio-plane/test/m/explore/graph-chain.test.mjs:106` "declared, not evidenced" — ambiguous: 4 rows share this en (screen.person.g.declared, screen.explore.g.declared, screen.explore.declared)
- testcopy `bio-plane/test/m/explore/walk.test.mjs:260` "declared, not evidenced"
- testcopy `bio-plane/test/m/explore/walk.test.mjs:346` "declared, not evidenced"

## Plain findings (K3957)

6 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('explore.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/explore/graph.mjs:58` "rings is 1 or 2: the graph shows the records one or two steps from the centre"
- plain `bio-plane/src/explore/presets.mjs:73` "no to is named: a path between two records names both"
- plain `bio-plane/src/explore/timeline.mjs:30` "a timeline is over a set of record ids the caller names"
- plain `bio-plane/src/explore/timeline.mjs:33` "your team's Civicsmith has no events record connected, so no timeline can be read"
- plain `bio-plane/src/explore/walk.mjs:29` "kinds is a list of the kinds owners registered"
- plain `bio-plane/src/explore/walk.mjs:47` "sortBy names a quantity a step states"
