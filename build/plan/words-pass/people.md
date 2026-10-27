# people: the words check after the conversion (K3949)

Layer 5. 6 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/people/index.mjs:1757` [copy] "a read names the member reading; an absent viewer is neither an adm..." — ambiguous: 2 rows share this en (duties.why.read_names_member, hypotheses.why.read_names_member)
- inline `bio-plane/src/people/index.mjs:473` [copy] "claimed not the same person" — ambiguous: 2 rows share this en (label.identityclaimkinds.not_same_as, screen.person.claim.kind.not_same_as)
- inline `bio-plane/src/people/index.mjs:473` [copy] "claimed the same person" — ambiguous: 2 rows share this en (label.identityclaimkinds.not_same_as, screen.person.claim.kind.not_same_as)
- inline `bio-plane/src/people/index.mjs:53` [copy] "claimed not the same person" — ambiguous: 2 rows share this en (label.identityclaimkinds.not_same_as, screen.person.claim.kind.not_same_as)
- inline `bio-plane/src/people/index.mjs:54` [copy] "unsure whether the same person" — ambiguous: 2 rows share this en (label.identityclaimkinds.unsure, screen.person.claim.kind.unsure)
- testcopy `bio-plane/test/m/people/directory.test.mjs:91` [part] "a name they are also known by" — part test copy

## Plain findings (K3957)

3 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('people.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/people/checks.mjs:70` "the condition's join is \"same\" (one counterparty) or {lines: [kinds]} (a line between t..."
- plain `bio-plane/src/people/index.mjs:505` "the evidence names the cited line held by each record (lines: {a, b})"
- plain `bio-plane/src/people/index.mjs:1790` "people's neighbours needs the host it reads (args.host) when this isolate holds no sing..."
