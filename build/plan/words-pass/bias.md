# bias: the words check after the conversion (K3949)

Layer 5. 10 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- testcopy `bio-plane/test/m/bias/dec149.test.mjs:17` [part] "each entry is a project statement on a subject a team statement in ..." — part test copy
- testcopy `bio-plane/test/m/bias/dec149.test.mjs:18` [part] "which names no statement it overrides: it must carry a justificatio..." — part test copy
- testcopy `bio-plane/test/m/bias/dec149.test.mjs:19` [part] "listed so a reviewer reads the two together (safeguard 3). It refus..." — part test copy
- testcopy `bio-plane/test/m/bias/dec149.test.mjs:57` [part] "A project's owners set the lens over that project's work: adopt thi..." — part test copy
- testcopy `bio-plane/test/m/bias/dec149.test.mjs:58` [part] "a project you own, or ask an administrator to adopt it for the whol..." — part test copy
- testcopy `bio-plane/test/m/bias/dec149.test.mjs:63` [part] "ask an administrator to adopt it for the whole team." — part test copy
- testcopy `bio-plane/test/m/bias/dec149.test.mjs:69` [part] "That statement names its subject in prose rather than pointing at t..." — part test copy
- testcopy `bio-plane/test/m/bias/dec149.test.mjs:70` [part] "Registry entries are what let the record notice when a project stat..." — part test copy
- testcopy `bio-plane/test/m/bias/dec149.test.mjs:71` [part] "statement are about the same thing — in prose, nothing can tell, an..." — part test copy
- testcopy `bio-plane/test/m/bias/dec149.test.mjs:72` [part] "quiet is the one this construct exists to prevent." — part test copy

## Plain findings (K3957)

11 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('bias.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/bias/index.mjs:55` "adopting a bias set for the whole team"
- plain `bio-plane/src/bias/index.mjs:434` "puts no lens in force until the revision it names stands at 'adopted'"
- plain `bio-plane/src/bias/index.mjs:443` "so which statements are in force cannot be computed"
- plain `bio-plane/src/bias/index.mjs:471` "conformance error; the team statement stands"
- plain `bio-plane/src/bias/index.mjs:655` "issue verdicts — refused for the machine exactly as for a member"
- plain `bio-plane/src/bias/index.mjs:726` "statements, each with its subject and justification, from the beginning"
- plain `bio-plane/src/bias/index.mjs:971` "the settlement to an act nobody recorded"
- plain `bio-plane/src/bias/index.mjs:997` "may raise the obligation, surface it and prepare what it needs, and may not answer it"
- plain `bio-plane/src/bias/index.mjs:1032` "one this reader can open"
- plain `bio-plane/src/bias/index.mjs:1165` "force is undetermined and it discharges nothing"
- plain `bio-plane/src/bias/index.mjs:1167` "undetermined and it discharges nothing"
