# action-plans: the words check after the conversion (K3949)

Layer 9. 15 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- handlist `bio-plane/test/m/action-plans/invariants.test.mjs:76` [?] ops: checkpointrecord, optionadd, optionadopt, ... (14 of 21 not the module's own) — handlist
- inline `bio-plane/src/action-plans/checks.mjs:50` "determination, standard} for one standard's outcome of a determinat..."
- inline `bio-plane/src/action-plans/checks.mjs:51` [copy] "Nothing was written."
- inline `bio-plane/src/action-plans/index.mjs:362` "matter {} is neither {kind: inquiry, inquiry} nor {kind: outcome, d..."
- inline `bio-plane/src/action-plans/index.mjs:453` "individual. Nothing was written."
- inline `bio-plane/src/action-plans/index.mjs:464` "regulated dates are a list of at most {} {date: YYYY-MM-DD, basis},..."
- inline `bio-plane/src/action-plans/index.mjs:465` "basis naming the statute, order or commitment that sets it. Nothing..."
- testcopy `bio-plane/test/m/action-plans/duty-starts.test.mjs:74` [part] "A phase has an id, a name, the chosen options it holds, when it sta..." — part test copy
- testcopy `bio-plane/test/m/action-plans/duty-starts.test.mjs:75` [part] "on one outcome of another phase's checkpoint, when another matter's..." — part test copy
- testcopy `bio-plane/test/m/action-plans/duty-starts.test.mjs:76` [part] "occurrence reaches a state: met, met late, overdue or undetermined)..." — part test copy
- testcopy `bio-plane/test/m/action-plans/invariants.test.mjs:132` [part] "An action plan reads matters, actions and runs held by other parts ..." — part test copy
- testcopy `bio-plane/test/m/action-plans/invariants.test.mjs:133` [part] "is not in your team's Civicsmith yet, so the plan is not answered i..." — part test copy
- testcopy `bio-plane/test/m/action-plans/runs.test.mjs:85` "Suggested by the assistant (machine work) in run" — partial test copy (template not matched to a row)
- testcopy `bio-plane/test/m/action-plans/runs.test.mjs:86` [part] "decision; it becomes an option only when a member adopts it." — part test copy
- testcopy `bio-plane/test/m/action-plans/words.test.mjs:191` [part] "Suggested by the assistant" — part test copy

## Plain findings (K3957)

2 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('action-plans.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/action-plans/index.mjs:1288` "the phase that leads here has not led here yet, so no occurrence is read"
- plain `bio-plane/src/action-plans/index.mjs:2139` "work) after a response was recorded; it decides nothing, and what the team chose change..."
