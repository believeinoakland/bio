# run-rules: the words check after the conversion (K3949)

Layer 6. 11 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/run-rules/rules.mjs:575` "({}): it is a map from a bound's name to the figure" — text holds braces (ICU syntax in t)
- inline `bio-plane/src/run-rules/rules.mjs:576` "spent on it, e.g. { fetches: 1 }, and an array's keys are positions..."
- inline `bio-plane/src/run-rules/skill-version.mjs:51` "'{}' names no pack. A skill version is <pack>@<edition>, and a bare..." — HTML string
- testcopy `bio-plane/test/m/run-rules/t46.test.mjs:124` [part] "This part of the assistant has not yet passed Civicsmith's tests, s..." — part test copy
- testcopy `bio-plane/test/m/run-rules/t46.test.mjs:125` [part] "in your team's Civicsmith. Everything else works without it." — part test copy
- testcopy `bio-plane/test/m/run-rules/table.test.mjs:224` [part] "Nothing was run, because your team's Civicsmith could not find an a..." — part test copy
- testcopy `bio-plane/test/m/run-rules/table.test.mjs:225` [part] "That is a fact about our setup and not an answer about your questio..." — part test copy
- testcopy `bio-plane/test/m/run-rules/table.test.mjs:226` [part] "should be read as having looked and found nothing." — part test copy
- testcopy `bio-plane/test/m/run-rules/table.test.mjs:227` [part] "Nothing was run, because the kind of work this run asked for is not..." — part test copy
- testcopy `bio-plane/test/m/run-rules/table.test.mjs:228` [part] "team's Civicsmith yet. Kinds of work are switched on one at a time,..." — part test copy
- testcopy `bio-plane/test/m/run-rules/table.test.mjs:229` [part] "checked in real use. Ask for a kind that is switched on, or leave t..." — part test copy

## Plain findings (K3957)

11 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('run-rules.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/run-rules/checks.mjs:259` "src/ai-runs/index.mjs groupTestSet, reached from the team's test investigations"
- plain `bio-plane/src/run-rules/checks.mjs:321` "src/run-rules/rules.mjs levelEmptyHolds, called from agent-harness before it composes a..."
- plain `bio-plane/src/run-rules/deployment.mjs:71` "threat model the doctrine names"
- plain `bio-plane/src/run-rules/deployment.mjs:213` "nothing of the record: only the passage of the team's own writing the door hands in, to..."
- plain `bio-plane/src/run-rules/deployment.mjs:230` "and draft's flag alone never deploys them"
- plain `bio-plane/src/run-rules/deployment.mjs:296` "no run: it writes no run row and keeps nothing itself"
- plain `bio-plane/src/run-rules/deployment.mjs:300` "modes' state and whatever ask's or draft's flag"
- plain `bio-plane/src/run-rules/rules.mjs:201` "questions an assistant opened inside this run (§11 item 5, rule 2) — the run's bound on..."
- plain `bio-plane/src/run-rules/rules.mjs:264` "no member stopped it and no budget ran out"
- plain `bio-plane/src/run-rules/rules.mjs:267` "is not deployed yet, so no member stopped this run and no budget ran out"
- plain `bio-plane/src/run-rules/rules.mjs:413` "no bar was recorded when this run was formed, and none is filled in afterwards"
