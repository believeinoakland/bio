# ratification: the words check after the conversion (K3949)

Layer 8. 32 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/ratification/finding.mjs:287` [copy] "a network error"
- inline `bio-plane/src/ratification/index.mjs:1023` "The members committed with it were not copied either; re-sending ea..."
- inline `bio-plane/src/ratification/ops.mjs:282` ", so its container is assembled ({})."
- inline `bio-plane/src/ratification/refusals.mjs:149` ", and {} {} not approved case"
- inline `bio-plane/src/ratification/refusals.mjs:150` "{} edition {} as this document stands ({}); an"
- inline `bio-plane/src/ratification/refusals.mjs:152` "{}, given, {} not carried in the document's own"
- inline `bio-plane/src/ratification/refusals.mjs:153` "approvals, so the signed file would not prove {}: prepare the"
- inline `bio-plane/src/ratification/refusals.mjs:154` "document again to carry {} (its approval digest is unchanged)"
- testcopy `bio-plane/test/m/ratification/approvals.test.mjs:77` [part] "This case edition can't be signed yet: the team requires named memb..." — part test copy
- testcopy `bio-plane/test/m/ratification/approvals.test.mjs:78` [part] "some of them have not approved this version of it. They are named. ..." — part test copy
- testcopy `bio-plane/test/m/ratification/checks.test.mjs:100` [part] "This case edition uses a member's firsthand observation, or materia..." — part test copy
- testcopy `bio-plane/test/m/ratification/checks.test.mjs:101` [part] "member attests, and that member has not yet chosen how they are cre..." — part test copy
- testcopy `bio-plane/test/m/ratification/checks.test.mjs:102` [part] "it at any level would be choosing for them. Ask that member to choo..." — part test copy
- testcopy `bio-plane/test/m/ratification/checks.test.mjs:103` [part] "finding that rests on it."
- testcopy `bio-plane/test/m/ratification/checks.test.mjs:88` [part] "Some of these documents are contested: a contradiction touching eac..." — part test copy
- testcopy `bio-plane/test/m/ratification/checks.test.mjs:89` [part] "contested material is never released in a batch. They are named. No..."
- testcopy `bio-plane/test/m/ratification/checks.test.mjs:92` [part] "This edition rests on testimony, or on material from an unnamed sou..." — part test copy
- testcopy `bio-plane/test/m/ratification/checks.test.mjs:93` [part] "credited only to the team or the project, with no independent leg c..." — part test copy
- testcopy `bio-plane/test/m/ratification/checks.test.mjs:94` [part] "evidence counts as an anonymous tip and supports a finding only bes..." — part test copy
- testcopy `bio-plane/test/m/ratification/checks.test.mjs:95` [part] "Each such member, observation and document is named. Corroborate th..." — part test copy
- testcopy `bio-plane/test/m/ratification/checks.test.mjs:96` [part] "the author or the attesting member to choose cover or name, or drop..."
- testcopy `bio-plane/test/m/ratification/converted-c.test.mjs:88` "NO MANIFEST WAS IN FORCE for"
- testcopy `bio-plane/test/m/ratification/converted-c.test.mjs:91` "'s production. NO STANDARD OF EVIDENCE WAS DECLARED for it."
- testcopy `bio-plane/test/m/ratification/preflight.test.mjs:359` [part] "This case edition uses a member's firsthand observation, or materia..." — part test copy
- testcopy `bio-plane/test/m/ratification/preflight.test.mjs:360` [part] "attests, and that member has not yet chosen how they are credited, ..." — part test copy
- testcopy `bio-plane/test/m/ratification/preflight.test.mjs:361` [part] "level would be choosing for them. Ask that member to choose, or pre..." — part test copy
- testcopy `bio-plane/test/m/ratification/preflight.test.mjs:363` [part] "This edition rests on testimony, or on material from an unnamed sou..." — part test copy
- testcopy `bio-plane/test/m/ratification/preflight.test.mjs:364` [part] "only to the team or the project, with no independent leg corroborat..." — part test copy
- testcopy `bio-plane/test/m/ratification/preflight.test.mjs:365` [part] "an anonymous tip and supports a finding only beside an independent ..." — part test copy
- testcopy `bio-plane/test/m/ratification/preflight.test.mjs:366` [part] "observation and document is named. Corroborate the claim with an in..." — part test copy
- testcopy `bio-plane/test/m/ratification/preflight.test.mjs:367` [part] "attesting member to choose cover or name, or drop the finding that ..." — part test copy
- testcopy `bio-plane/test/m/ratification/scheduled-commit.test.mjs:149` [part] "its copy is no longer the one the case names" — part test copy

## Plain findings (K3957)

15 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('ratification.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/ratification/finding.mjs:66` "the record has changed since it was reviewed; read it again and re-sign"
- plain `bio-plane/src/ratification/finding.mjs:256` "and not a calibrated ceiling"
- plain `bio-plane/src/ratification/finding.mjs:273` "cannot be re-checked; ratified with the bytes captured on the day"
- plain `bio-plane/src/ratification/finding.mjs:298` "on the day, the divergence recorded as the dated fact it is"
- plain `bio-plane/src/ratification/index.mjs:543` "the case document has changed since it was reviewed; read it again and re-sign"
- plain `bio-plane/src/ratification/index.mjs:725` "a reader of the team's approvals is already registered; there is one, registered once a..."
- plain `bio-plane/src/ratification/index.mjs:780` "a reader of litigation holds is already registered; there is one, registered once at start"
- plain `bio-plane/src/ratification/index.mjs:911` "no active registered signing keys"
- plain `bio-plane/src/ratification/ops.mjs:140` "the case document has changed since it was reviewed; read it again and re-sign"
- plain `bio-plane/src/ratification/ops.mjs:156` "no active registered signing keys; an admin must register a member key before anything ..."
- plain `bio-plane/src/ratification/ops.mjs:470` "no active registered signing keys; an admin must register a member key before anything ..."
- plain `bio-plane/src/ratification/refusals.mjs:151` "approval of an earlier version does not carry over"
- plain `bio-plane/src/ratification/release.mjs:85` "this selection resolves to no members, so there is nothing to release"
- plain `bio-plane/src/ratification/retire.mjs:62` "this selection resolves to no members, so there is nothing to retire"
- plain `bio-plane/src/ratification/retire.mjs:103` "history the document does not carry (C-4.2)"

## Test copies of code sentences (K3962)

5 test strings that copy the `en` of a product `localize` call (the check's testcopy arm, tag `code`, civicos-process ea6cd83). Each test compares with `localize(id, en)` or `word(id)` instead, or asserts the key (K3810). A copy of another module's sentence is fixed in this module's own test.

- testcopy `bio-plane/test/m/ratification/case-commit.test.mjs:172` "\"completeness_acknowledgements:\""
- testcopy `bio-plane/test/m/ratification/converted-a.test.mjs:237` "\"completeness_acknowledgements\""
- testcopy `bio-plane/test/m/ratification/converted-a.test.mjs:240` "\"completeness_acknowledgements\""
- testcopy `bio-plane/test/m/ratification/converted-c.test.mjs:61` "\"completeness_acknowledgements:\""
- testcopy `bio-plane/test/m/ratification/converted-c.test.mjs:469` "\"does not resolve in the store\""
