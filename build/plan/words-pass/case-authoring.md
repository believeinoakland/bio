# case-authoring: the words check after the conversion (K3949)

Layer 8. 57 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/case-authoring/document.mjs:316` "from the record. It is stated rather than filled in."
- inline `bio-plane/src/case-authoring/document.mjs:367` ", {} referent(s) this case rests on that could not be"
- inline `bio-plane/src/case-authoring/document.mjs:437` [stitched] "This case is {}'s production. NO STANDARD OF EVIDENCE WAS DECLARED ..."
- inline `bio-plane/src/case-authoring/document.mjs:484` "Disclosed by the team: {}"
- inline `bio-plane/src/case-authoring/index.mjs:1200` "finding is the unit of truth."
- inline `bio-plane/src/case-authoring/index.mjs:1203` "servable as a container when the last of them lands."
- inline `bio-plane/src/case-authoring/index.mjs:1256` "edition {} of {} must say what changed in it since the edition befo..."
- inline `bio-plane/src/case-authoring/index.mjs:1257` "(whatChanged: {text}): a reader of a later edition is owed the diff..."
- inline `bio-plane/src/case-authoring/index.mjs:1269` "no draft of {}'s statement of what changed answers to {}"
- inline `bio-plane/src/case-authoring/index.mjs:1271` "your own words (whatChanged: {text}) and publish again. Nothing was..."
- inline `bio-plane/src/case-authoring/index.mjs:1288` "declared, and an absent publisher is not a publisher of none."
- inline `bio-plane/src/case-authoring/index.mjs:1341` "This question is {}, and a case cannot be asserted over one the team"
- inline `bio-plane/src/case-authoring/index.mjs:1344` "open does not survive the question leaving the states a case can re..."
- inline `bio-plane/src/case-authoring/index.mjs:1346` "{} concluded this question and WITHDREW that conclusion, so it stan..."
- inline `bio-plane/src/case-authoring/index.mjs:1350` "{}'s latest entry about this question names an act your team's Civi..." — text holds a literal {name}, filled by its caller
- inline `bio-plane/src/case-authoring/index.mjs:1351` "what it stands on is UNDETERMINED rather than concluded, and it is ..."
- inline `bio-plane/src/case-authoring/index.mjs:1352` "{} has not concluded this question. A conclusion belongs to the pro..."
- inline `bio-plane/src/case-authoring/index.mjs:1358` "{} other project(s) this viewer can see HAVE"
- inline `bio-plane/src/case-authoring/index.mjs:1360` "information, never this project's stance (§7.1 item 8)."
- inline `bio-plane/src/case-authoring/index.mjs:1395` "{} (the publishing project)"
- inline `bio-plane/src/case-authoring/index.mjs:1411` "roster, and a partition that can silently reorder is not one anybod..."
- inline `bio-plane/src/case-authoring/index.mjs:1667` [stitched] "Signing publishes this case edition, and each finding in it at the ..."
- inline `bio-plane/src/case-authoring/index.mjs:411` "{} is a list of {calc, words?}: each names a calculation (or a work..."
- inline `bio-plane/src/case-authoring/index.mjs:412` "words, when given, are at most {} characters with no quote, backsla..."
- inline `bio-plane/src/case-authoring/index.mjs:592` "and is the degenerate case (DEC-44); what is not legal is publishin..."
- inline `bio-plane/src/case-authoring/searched.mjs:125` ". {} subject(s) could not be reported as never-looked-at because at..."
- inline `bio-plane/src/case-authoring/searched.mjs:132` ". {} referent(s) this case rests on could not be resolved to a"
- testcopy `bio-plane/test/m/case-authoring/converts.test.mjs:125` "NO MANIFEST WAS IN FORCE for"
- testcopy `bio-plane/test/m/case-authoring/dec149.test.mjs:105` [part] "when it was published, computed then and frozen here"
- testcopy `bio-plane/test/m/case-authoring/dec149.test.mjs:109` [part] "no bias set stood adopted for the team or this project"
- testcopy `bio-plane/test/m/case-authoring/dec149.test.mjs:112` [part] "Each calculation below was recomputed when the case was published, ..."
- testcopy `bio-plane/test/m/case-authoring/dec149.test.mjs:119` [part] "was recomputed when the case was published"
- testcopy `bio-plane/test/m/case-authoring/dec149.test.mjs:34` "gives a different result when"
- testcopy `bio-plane/test/m/case-authoring/dec149.test.mjs:82` [part] "it was written before drafts recorded their authors" — part test copy
- testcopy `bio-plane/test/m/case-authoring/dec149.test.mjs:83` [part] "before drafts recorded their authors"
- testcopy `bio-plane/test/m/case-authoring/dec149.test.mjs:88` [part] "records no author — it was written before drafts recorded their aut..."
- testcopy `bio-plane/test/m/case-authoring/document.test.mjs:129` [part] "AN ADOPTION PINNED A PROPOSED REVISION"
- testcopy `bio-plane/test/m/case-authoring/document.test.mjs:136` [part] "THE MANIFEST IS UNDETERMINED"
- testcopy `bio-plane/test/m/case-authoring/document.test.mjs:88` "Position on putting this case to its subject:"
- testcopy `bio-plane/test/m/case-authoring/invariants.test.mjs:112` [part] "An edition of this case is signed and waiting to" — part test copy
- testcopy `bio-plane/test/m/case-authoring/invariants.test.mjs:113` [part] "be published at the time set. Prepare the next edition after it is ..." — part test copy
- testcopy `bio-plane/test/m/case-authoring/invariants.test.mjs:135` [part] "This case uses a standard as a published case may not:" — part test copy
- testcopy `bio-plane/test/m/case-authoring/invariants.test.mjs:136` [part] "it would carry the whole text of a standard that is not free to rea..." — part test copy
- testcopy `bio-plane/test/m/case-authoring/invariants.test.mjs:137` [part] "on, or call a finding that rests only on benchmarks \"violated\" or \"..." — part test copy
- testcopy `bio-plane/test/m/case-authoring/invariants.test.mjs:138` [part] "the case and prepare it again. Nothing was prepared." — part test copy
- testcopy `bio-plane/test/m/case-authoring/preflight.test.mjs:108` "The publication copy of a document a member supplied is still being..." — text holds a literal {name}, filled by its caller
- testcopy `bio-plane/test/m/case-authoring/preflight.test.mjs:109` "A document a member supplied can't be cleaned of the details that c..."
- testcopy `bio-plane/test/m/case-authoring/preflight.test.mjs:211` "document is enough to publish on;" — part test copy
- testcopy `bio-plane/test/m/case-authoring/preflight.test.mjs:212` [part] "one that is not is published only as self-attested"
- testcopy `bio-plane/test/m/case-authoring/preflight.test.mjs:293` [part] "Without co-attestation an outsider can verify the copy has not chan..." — part test copy
- testcopy `bio-plane/test/m/case-authoring/preflight.test.mjs:294` [part] "and can follow the reasoning, but cannot independently verify that ..."
- testcopy `bio-plane/test/m/case-authoring/preflight.test.mjs:348` [part] "This case's findings rest on no document the record holds a capture of"
- testcopy `bio-plane/test/m/case-authoring/rests.test.mjs:160` [part] "The published case republishes in full every document it includes, ..." — part test copy
- testcopy `bio-plane/test/m/case-authoring/rests.test.mjs:161` [part] "they may be republished, copyright included, is the team's."
- testcopy `bio-plane/test/m/case-authoring/standards.test.mjs:119` "rests only on benchmarks of" — regex
- testcopy `bio-plane/test/m/case-authoring/whatchanged.test.mjs:219` [part] "undetermined: an adoption pins a revision whose bytes this record c..." — part test copy
- testcopy `bio-plane/test/m/case-authoring/whatchanged.test.mjs:225` [part] "undetermined: an adoption pins a revision whose bytes this record c..." — part test copy

## Plain findings (K3957)

13 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('case-authoring.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/case-authoring/document.mjs:98` "accepted when this case was signed; that revision was not in force at signing"
- plain `bio-plane/src/case-authoring/document.mjs:311` "relationship's conclusion, which is not this project's (§7.1 item 5)"
- plain `bio-plane/src/case-authoring/document.mjs:368` "resolved to a subject at all"
- plain `bio-plane/src/case-authoring/index.mjs:1323` "this inquiry has no readable bundle.md, so its state cannot be moved"
- plain `bio-plane/src/case-authoring/index.mjs:1653` "ratification's pre-flight gave no answer"
- plain `bio-plane/src/case-authoring/searched.mjs:27` "what was looked for and what came of it"
- plain `bio-plane/src/case-authoring/searched.mjs:29` "some could not be identified at all -- the coverage is stated and is not complete"
- plain `bio-plane/src/case-authoring/searched.mjs:32` "licenses a positive statement about the absence"
- plain `bio-plane/src/case-authoring/searched.mjs:35` "this record, and that is stated rather than resolved in either direction"
- plain `bio-plane/src/case-authoring/searched.mjs:38` "not askable here rather than that it was answered"
- plain `bio-plane/src/case-authoring/searched.mjs:59` "rather than about the case"
- plain `bio-plane/src/case-authoring/searched.mjs:129` "carried this level. They are reported as undetermined"
- plain `bio-plane/src/case-authoring/searched.mjs:133` "subject at this level at all, so nothing is claimed about them either way"
