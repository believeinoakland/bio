# legacy-ui: the words check after the conversion (K3949)

Layer 11. 15 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- handlist `civicos-ui/test/act-ballot.test.mjs:198` [?] codes: NOT_THE_OWNER, NOT_AN_OWNER, NO_REASON, ... (5 of 5 not the module's own)
- handlist `civicos-ui/test/act-dispose.test.mjs:232` [?] codes: NO_REASON, BAD_REASON, NOT_A_DISPOSITION, ... (7 of 8 not the module's own) — handlist
- handlist `civicos-ui/test/cite-act.test.mjs:659` [?] codes: NOT_A_PROJECT, NOT_INFORMATION, SEVERED_EDGE, ... (17 of 18 not the module's own) — handlist
- handlist `civicos-ui/test/members-roster.test.mjs:193` [?] ops: projectownerremove, memberadd, memberset, ... (9 of 9 not the module's own) — handlist
- handlist `civicos-ui/test/project-workspace.test.mjs:211` [?] ops: projectinvite, projectjoin, projectleave, ... (7 of 7 not the module's own)
- handlist `civicos-ui/test/project-workspace.test.mjs:396` [?] ops: projectinvite, projectremove, projectowneradd, ... (5 of 5 not the module's own)
- inline `civicos-ui/check-mock-envelope.mjs:350` "top-level keys {}) — the plane answers it through"
- inline `civicos-ui/check-mock-envelope.mjs:352` "one shape the plane never sends proves nothing about the read (D-173)."
- testcopy `civicos-ui/test/act-ballot.test.mjs:238` [part] "resignation with the other"
- testcopy `civicos-ui/test/inquiry-page.test.mjs:290` "What it rests on" — ambiguous: 2 rows share this en (screen.published.what.it.rests.on, screen.actionnew.rests)
- testcopy `civicos-ui/test/notifications.test.mjs:289` [part] "The lens this assistant's run was formed under has changed since it..." — part test copy
- testcopy `civicos-ui/test/notifications.test.mjs:290` [part] "the lens now in force is owed. This is disclosed and blocks nothing."
- testcopy `civicos-ui/test/notifications.test.mjs:294` [part] "no member could be named inside this run's read gate, so" — part test copy
- testcopy `civicos-ui/test/notifications.test.mjs:295` [part] "it is offered to every member who can read the run"
- testcopy `civicos-ui/test/project-workspace.test.mjs:342` [part] "resignation with the other"

## Plain findings (K3957)

4 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('legacy-ui.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `civicos-ui/check-mock-envelope.mjs:247` "app.html has no runtime script block — arm A could not run at all"
- plain `civicos-ui/check-mock-envelope.mjs:313` "test/envelope-probe.mjs is missing — arm B cannot run"
- plain `civicos-ui/check-mock-envelope.mjs:358` "arm B observed no op answers in any suite — the probe is not reaching the mocks"
- plain `civicos-ui/check-mock-envelope.mjs:476` "arm C could not read bio-plane/src/store.mjs — the census has no authority to compare a..."

## Test copies of code sentences (K3962)

16 test strings that copy the `en` of a product `localize` call (the check's testcopy arm, tag `code`, civicos-process ea6cd83). Each test compares with `localize(id, en)` or `word(id)` instead, or asserts the key (K3810). A copy of another module's sentence is fixed in this module's own test.

- testcopy `civicos-ui/test/act-dispose.test.mjs:96` "\"C-2.8 requires a non-empty disposition_reason for deferred and dism...\""
- testcopy `civicos-ui/test/act-dispose.test.mjs:99` "\"newline: the restricted frontmatter grammar has no escapes\""
- testcopy `civicos-ui/test/act-dispose.test.mjs:101` "\"these are not legal moves in the catalog's state table. A move to t...\""
- testcopy `civicos-ui/test/act-dispose.test.mjs:102` "\"something is already in usually means the view was taken before som...\""
- testcopy `civicos-ui/test/act-dispose.test.mjs:103` "\"disposition, so it is refused rather than treated as a no-op.\""
- testcopy `civicos-ui/test/analyst-vocabulary.test.mjs:318` "\"LOOKED FOR AND NOT THERE, which is the point of this item rather th...\""
- testcopy `civicos-ui/test/cite-act.test.mjs:527` "\"every member of the selection was already cited; nothing was written\""
- testcopy `civicos-ui/test/elicitation.test.mjs:470` "\"this question already carries an authored structure, so changing it...\""
- testcopy `civicos-ui/test/notifications.test.mjs:165` "\"the natural acts here are at STANCE grain — move to the reading the...\""
- testcopy `civicos-ui/test/notifications.test.mjs:166` "\"we are staying — and the first of those is op=versioncurrent on THI...\""
- testcopy `civicos-ui/test/notifications.test.mjs:167` "\"LOOKED FOR AND NOT THERE, which is the point of this item rather th...\""
- testcopy `civicos-ui/test/notifications.test.mjs:291` "\"bias debt is DISCLOSED and travels with the work; only an uncleared...\""
- testcopy `civicos-ui/test/notifications.test.mjs:292` "\"publication (DEC-20). Whether the lens moved is op=airun's own comp...\""
- testcopy `civicos-ui/test/notifications.test.mjs:293` "\"sweep and never recomputed.\""
- testcopy `civicos-ui/test/notifications.test.mjs:392` "\"new-version-arrived-from-another-team\""
- testcopy `civicos-ui/test/release-flow.test.mjs:198` "\"verified state has entry requirements\""
