# machinery-producers (T49)

**Status** · session_01FAXJtTiUJyo4Ms9JrUrYF1 · depth 2 · COMPLETE · handled B0

## J1 · REPORT

REPORT (findings beyond R13's own work; nothing here changes another module)

1. Inherited red, not from this job: screens-daily test/m/screens-daily/contract.test.mjs:49 ("R1–R13 (interface-shell R21, R38): each screen's acts are exactly its registered acts") fails on tranche/T49 as merged, with my changes stashed. Diff: the `projects` screen's acts are projectjoin, promote, and the registered themeread is missing. Owner: screens-daily (or the screen registry). Reproduced: `node --test test/m/screens-daily/contract.test.mjs`, 9 pass, 1 fail, before and after my change.

2. Left in my own module, deferred with why: the second capture-completed-unattended producer (capture requests, index.mjs ~:613, #conditionsCaptureRequested) builds its summary and detail in English. Its detail names raw ids through the attribution statement (capture-requests index.mjs:146 and :155: "at the request of member:<id>", the run id, and the paying credential). N1138 and R13 name the bundle producer only, and that producer is done. Fixing this one needs words under a key that the word list does not hold (a missing key is a REPORT, never inline English, K3366). Proposal for Bob or the design stream: keys queue.capture-completed-unattended.request.summary and .request.detail, with {title} and {member} filled as the bundle producer's are, and the run and credential left out of the member sentence. Deferred.

3. Decisions made in this job, lower-level, for Bob to record once in build/rulings.md (not in this job's write set):
   a. {member} with no held handle (a credential that is no member, or a member with no handle): the word queue.capture-completed-unattended.who ("your group's Civicsmith"), never the id. The starter is the founder (author "admin") by founderHandle(), a member by memberFacts(author).handle.
   b. {title} with no title: screen.held.untitled ("Untitled capture"), never the bundle id, which the old text fell back to.
   c. The detail's grade-note sentence is still appended (R3); it is English by capture's own words, not a copy.

Test coverage: R13 is named by one new test in test/m/machinery-producers/conditions.test.mjs; it asserts by key (word, hasWord) and checks that no id appears in summary or detail.

## J2 · COMPLETE

COMPLETE. Commit 2d08332635 on job/T49/machinery-producers (merged tranche/T49 first, per B1).

Entries applied: R13. capture-completed-unattended's bundle producer (index.mjs ~:529) reads summary and detail by key through setup-words' word: queue.capture-completed-unattended.summary and .detail. {member} is the starter's held handle (founderHandle for admin, memberFacts otherwise), or the .who word when none is held. {title} is the document's title, or the untitled word. The manifest basis keeps the raw author ids for the trace, as before. Grade-note sentence (R3) unchanged.

Deferred (see the REPORT just before this entry): the capture-request producer's English and raw ids (its own words, no key yet). Not done here, because a missing key is a REPORT, never inline English.

Found elsewhere (REPORT): screens-daily contract.test.mjs:49 is red on tranche/T49 as merged, without my change. Not mine; for its owner.

Tests and checks:
- node --test test/m/machinery-producers/: 30 pass, 0 fail (the R13 test is new).
- node --test test/m/screens-daily/: 108 tests, 107 pass, 1 fail (the inherited contract.test.mjs:49 red above; reproduced on the base without my change).
- node checks/format.mjs /home/user/bio: format: 170 modules, 169 requirements files; 0 failures
- node checks/architecture.mjs /home/user/bio machinery-producers: architecture: 7 product files, 31 relative imports (0 naming no tracked file, not judged); 0 failures
- node checks/coverage.mjs /home/user/bio machinery-producers: coverage: 1 modules, 13 of 13 live requirement ids named by a test; 0 failures
- node checks/ownership.mjs /home/user/bio machinery-producers tranche/T49: ownership: 3 files changed by machinery-producers between tranche/T49 and HEAD; 0 failures

Decisions recorded in the REPORT (3a, 3b, 3c) for Bob to enter once in build/rulings.md.

Size (session_01FAXJtTiUJyo4Ms9JrUrYF1): test runs 5, module lines 1211
