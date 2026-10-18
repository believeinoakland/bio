# ai-runs: the words check after the conversion (K3949)

Layer 6. 2 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/ai-runs/index.mjs:1624` "reached the model since the last tick, each {mode, model, usage, ca..."
- inline `bio-plane/src/ai-runs/index.mjs:3269` "the entry is not an object {mode, model, usage, calls}."

## Plain findings (K3957)

11 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('ai-runs.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/ai-runs/index.mjs:1062` "account and they are refused separately so each names its own remedy"
- plain `bio-plane/src/ai-runs/index.mjs:1175` "its result is the one to read"
- plain `bio-plane/src/ai-runs/index.mjs:1191` "step's place and work, and no step"
- plain `bio-plane/src/ai-runs/index.mjs:1194` "by its place and work, not both"
- plain `bio-plane/src/ai-runs/index.mjs:1307` "the run's own step cannot be made: steps is not reachable"
- plain `bio-plane/src/ai-runs/index.mjs:1587` "that. Nothing was appended and no budget was spent"
- plain `bio-plane/src/ai-runs/index.mjs:1668` "the run's work is done"
- plain `bio-plane/src/ai-runs/index.mjs:1668` "the run's work is not done"
- plain `bio-plane/src/ai-runs/index.mjs:1823` "that. The run is untouched and is still running"
- plain `bio-plane/src/ai-runs/index.mjs:2266` "no acceptance within the bound"
- plain `bio-plane/src/ai-runs/index.mjs:3272` "it could not be counted"
