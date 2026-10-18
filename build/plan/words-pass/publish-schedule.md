# publish-schedule: the words check after the conversion (K3949)

Layer 8. 2 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- testcopy `bio-plane/test/m/publish-schedule/t35.test.mjs:71` [part] "This edition was not published at its set time, because the checks ..." — part test copy
- testcopy `bio-plane/test/m/publish-schedule/t35.test.mjs:72` [part] "Nothing was published. Sign it again to publish it." — part test copy

## Plain findings (K3957)

7 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('publish-schedule.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/publish-schedule/index.mjs:82` "the scheduled publisher gives the door publishScheduled"
- plain `bio-plane/src/publish-schedule/schedule.mjs:92` "that time is not after now; publishing now is the ceremony's own commit"
- plain `bio-plane/src/publish-schedule/schedule.mjs:146` "a waiting edition names its case, a positive edition, the document's sha and the signature"
- plain `bio-plane/src/publish-schedule/schedule.mjs:244` "a publishing time is moved or cancelled by a member who owns the case's project, never ..."
- plain `bio-plane/src/publish-schedule/schedule.mjs:245` "no edition of that case waits to be published"
- plain `bio-plane/src/publish-schedule/schedule.mjs:254` "that edition's time has come, so it is being published or stopped"
- plain `bio-plane/src/publish-schedule/schedule.mjs:257` "only an owner of the case's project moves or cancels its time"
