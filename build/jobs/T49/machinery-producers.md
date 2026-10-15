# machinery-producers (T49)

**Status** · session_01FAXJtTiUJyo4Ms9JrUrYF1 · depth 2 · WORKING · handled B0

## J1 · REPORT

REPORT (findings beyond R13's own work; nothing here changes another module)

1. Inherited red, not from this job: screens-daily test/m/screens-daily/contract.test.mjs:49 ("R1–R13 (interface-shell R21, R38): each screen's acts are exactly its registered acts") fails on tranche/T49 as merged, with my changes stashed. Diff: the `projects` screen's acts are projectjoin, promote, and the registered themeread is missing. Owner: screens-daily (or the screen registry). Reproduced: `node --test test/m/screens-daily/contract.test.mjs`, 9 pass, 1 fail, before and after my change.

2. Left in my own module, deferred with why: the second capture-completed-unattended producer (capture requests, index.mjs ~:613, #conditionsCaptureRequested) builds its summary and detail in English. Its detail names raw ids through the attribution statement (capture-requests index.mjs:146 and :155: "at the request of member:<id>", the run id, and the paying credential). N1138 and R13 name the bundle producer only, and that producer is done. Fixing this one needs words under a key that the word list does not hold (a missing key is a REPORT, never inline English, K3366). Proposal for Bob or the design stream: keys queue.capture-completed-unattended.request.summary and .request.detail, with {title} and {member} filled as the bundle producer's are, and the run and credential left out of the member sentence. Deferred.

3. Decisions made in this job, lower-level, for Bob to record once in build/rulings.md (not in this job's write set):
   a. {member} with no held handle (a credential that is no member, or a member with no handle): the word queue.capture-completed-unattended.who ("your group's Civicsmith"), never the id. The starter is the founder (author "admin") by founderHandle(), a member by memberFacts(author).handle.
   b. {title} with no title: screen.held.untitled ("Untitled capture"), never the bundle id, which the old text fell back to.
   c. The detail's grade-note sentence is still appended (R3); it is English by capture's own words, not a copy.

Test coverage: R13 is named by one new test in test/m/machinery-producers/conditions.test.mjs; it asserts by key (word, hasWord) and checks that no id appears in summary or detail.
