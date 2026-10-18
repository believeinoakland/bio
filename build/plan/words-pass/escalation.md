# escalation: the words check after the conversion (K3949)

Layer 9. 10 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/escalation/index.mjs:1534` [copy] "what the record does not state (undetermined)"
- inline `bio-plane/src/escalation/index.mjs:1534` [copy] "what the record does not state (undetermined)"
- inline `bio-plane/src/escalation/index.mjs:1537` "The determination states: {}."
- inline `bio-plane/src/escalation/index.mjs:1554` "; its state is {}"
- inline `bio-plane/src/escalation/index.mjs:1560` [copy] "(its text undetermined)"
- inline `bio-plane/src/escalation/index.mjs:1567` [copy] "the day of reading"
- testcopy `bio-plane/test/m/escalation/draft.test.mjs:166` "has passed is undetermined"
- testcopy `bio-plane/test/m/escalation/structure.test.mjs:231` "A response evaluated in escalation"
- testcopy `bio-plane/test/m/escalation/voice.test.mjs:10` [part] "Part of the record this answer depends on cannot be read by your te..." — part test copy
- testcopy `bio-plane/test/m/escalation/voice.test.mjs:11` [part] "so nothing is answered in its place. Nothing was written." — part test copy

## Plain findings (K3957)

17 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('escalation.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/escalation/index.mjs:203` "of a state the record does not state (undetermined)"
- plain `bio-plane/src/escalation/index.mjs:398` "only by a live compliant determination of the same act for every standard pursued (esca..."
- plain `bio-plane/src/escalation/index.mjs:441` "no reply is owed, so stage 3 never triggers on it by time or by the lack of a reply"
- plain `bio-plane/src/escalation/index.mjs:447` "triggers by time on it; a member states a clock entry, with its basis, on the action"
- plain `bio-plane/src/escalation/index.mjs:453` "not triggered by time on it"
- plain `bio-plane/src/escalation/index.mjs:537` "same act or of a later act of the same office linked as its cure"
- plain `bio-plane/src/escalation/index.mjs:543` "linked cure, recorded after the escalation opened"
- plain `bio-plane/src/escalation/index.mjs:610` "actor's office on the attachment's day; the line governs over the profile"
- plain `bio-plane/src/escalation/index.mjs:613` "overseeing the actor's office, and the active profiles do not say whether it is an over..."
- plain `bio-plane/src/escalation/index.mjs:617` "day; the active profiles speak"
- plain `bio-plane/src/escalation/index.mjs:789` "running in the actions, and it is not ended"
- plain `bio-plane/src/escalation/index.mjs:1104` "and the active profiles do not say whether it is an oversight or audit body; the attach..."
- plain `bio-plane/src/escalation/index.mjs:1132` "writes nothing and chooses nothing"
- plain `bio-plane/src/escalation/index.mjs:1465` "supersedes it, and it stays readable"
- plain `bio-plane/src/escalation/index.mjs:1560` "on a date the record does not state (undetermined)"
- plain `bio-plane/src/escalation/index.mjs:1560` "the record does not state (undetermined)"
- plain `bio-plane/src/escalation/index.mjs:1662` "comment and the like): context, never attached and never a trigger"

## Test copies of code sentences (K3962)

2 test strings that copy the `en` of a product `localize` call (the check's testcopy arm, tag `code`, civicos-process ea6cd83). Each test compares with `localize(id, en)` or `word(id)` instead, or asserts the key (K3810). A copy of another module's sentence is fixed in this module's own test.

- testcopy `bio-plane/test/m/escalation/stopped.test.mjs:15` "\"The escalation's stage moves only while it is open. A suspended one...\""
- testcopy `bio-plane/test/m/escalation/stopped.test.mjs:16` "\"moves again. Nothing was written.\""
