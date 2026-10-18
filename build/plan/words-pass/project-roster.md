# project-roster: the words check after the conversion (K3949)

Layer 2. 2 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- handlist `bio-plane/test/m/project-roster/ops.test.mjs:18` [?] ops: projectdirectory, projectowneradd, projectownerremove, ... (10 of 18 not the module's own) — handlist
- inline `bio-plane/src/project-roster/index.mjs:632` "rule {} is not one of {kind}, {tier} (1, 2 or 3) or"

## Plain findings (K3957)

8 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('project-roster.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/project-roster/index.mjs:280` "only an owner of this project may propose another owner of it"
- plain `bio-plane/src/project-roster/index.mjs:293` "an owner is a joined participant with the owner flag, so the member joins the project f..."
- plain `bio-plane/src/project-roster/index.mjs:312` "every existing owner must agree to an addition beyond the second"
- plain `bio-plane/src/project-roster/index.mjs:347` "authority changes are recorded with a reason"
- plain `bio-plane/src/project-roster/index.mjs:371` "only an owner of this project votes on its ownership"
- plain `bio-plane/src/project-roster/index.mjs:377` "ownership changes are recorded with a reason"
- plain `bio-plane/src/project-roster/index.mjs:396` "the target is counted in the denominator but does not vote"
- plain `bio-plane/src/project-roster/index.mjs:622` "only an owner of this project sets which of its acts need a second member's approval"
