# case-catalogue: the words check after the conversion (K3949)

Layer 8. 1 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/case-catalogue/checks.mjs:807` "a {} case document's case_citations has {} row(s) that do not state..."

## Plain findings (K3957)

18 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('case-catalogue.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/case-catalogue/checks.mjs:197` "a case member requires a completeness block: a case that says nothing about what it doe..."
- plain `bio-plane/src/case-catalogue/checks.mjs:216` "author completeness.statement and the exclusion list"
- plain `bio-plane/src/case-catalogue/checks.mjs:220` "a case member requires a non-empty completeness.statement"
- plain `bio-plane/src/case-catalogue/checks.mjs:223` "a case member requires completeness.author: the completeness assertion is a named membe..."
- plain `bio-plane/src/case-catalogue/checks.mjs:232` "declare the team's position on putting this case to its subject"
- plain `bio-plane/src/case-catalogue/checks.mjs:236` "justify the position — including a deliberate decision not to give notice"
- plain `bio-plane/src/case-catalogue/checks.mjs:318` "name the excluded record by id"
- plain `bio-plane/src/case-catalogue/checks.mjs:318` "or describe what was excluded in prose"
- plain `bio-plane/src/case-catalogue/checks.mjs:363` "undetermined is what we do not know, not a grade"
- plain `bio-plane/src/case-catalogue/checks.mjs:452` "other way round is 100% searched by construction and says nothing about the case"
- plain `bio-plane/src/case-catalogue/checks.mjs:606` "designate the finding the case actually rests on, or do not publish this as a case yet"
- plain `bio-plane/src/case-catalogue/checks.mjs:616` "a case document requires a completeness block: a case that says nothing about what it d..."
- plain `bio-plane/src/case-catalogue/checks.mjs:617` "author completeness.statement and the exclusion list"
- plain `bio-plane/src/case-catalogue/checks.mjs:620` "a case document requires a non-empty completeness.statement"
- plain `bio-plane/src/case-catalogue/checks.mjs:622` "a case document requires completeness.author: the completeness assertion is a named mem..."
- plain `bio-plane/src/case-catalogue/checks.mjs:830` "publish the searched section computed from the observation log over this case's own sub..."
- plain `bio-plane/src/case-catalogue/checks.mjs:834` "compute the section over the case's own subjects — its members' basis legs and the cont..."
- plain `bio-plane/src/case-catalogue/checks.mjs:877` "publish with the bar stated absent (declared: false), or declare a grade on at least on..."

## Test copies of code sentences (K3962)

4 test strings that copy the `en` of a product `localize` call (the check's testcopy arm, tag `code`, civicos-process ea6cd83). Each test compares with `localize(id, en)` or `word(id)` instead, or asserts the key (K3810). A copy of another module's sentence is fixed in this module's own test.

- testcopy `bio-plane/test/m/case-catalogue/checks.test.mjs:114` "\"A new edition of a case says what changed in it, and why, before it...\""
- testcopy `bio-plane/test/m/case-catalogue/checks.test.mjs:115` "\"statement, then sign. Nothing was signed.\""
- testcopy `bio-plane/test/m/case-catalogue/checks.test.mjs:302` "\"case document requires completeness.statement_by\""
- testcopy `bio-plane/test/m/case-catalogue/checks.test.mjs:307` "\"a case document declares format '\""
