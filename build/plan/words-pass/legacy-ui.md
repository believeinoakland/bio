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
