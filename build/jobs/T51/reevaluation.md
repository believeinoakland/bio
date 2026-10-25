# reevaluation (T51)

**Status** · session_014QYiuArevRHEaH98AGpvCi · depth 2 · WORKING · handled B8

## J1 · COMPLETE

T51-224 (words) done. Commit 601a2b9d78 on job/T51/reevaluation.

**Entries applied**
- The 7 findings in `build/plan/words-pass/reevaluation.md`, the 19 `plain` findings and the 1 test copy of a code sentence in that file, all fixed by the words rule.
- The words check on the module as it stood at my START reported 32 failures (the conversion's left findings, plus the `copy` and `stitched` arms the check now counts). All are fixed: 28 sentences in `bio-plane/src/reevaluation/index.mjs` moved to keyed `localize` calls (`reevaluation.index.*`), the inline pieces of the leg-rests-on-group detail (key not listed, taken back) moved to their own keys, and the three test files now compare with `word`, `localize` or the translation key, never the text. The new ids are `reevaluation.index.<slug>`, fixed once.
- No string was judged unread by a member, so nothing is listed as unkeyed.

**Deferred:** none.

**Found in other modules (for BOB, not changed here):**
- `bio-plane/src/op-declarations/index.mjs:2511` and `bio-plane/src/queue-producers/index.mjs:1473` are flagged by the words check (`inline`). Each carries a sentence that cites reevaluation's text; they belong to their own modules.
- `checks/run.mjs` reports 25 coverage failures and 2,281 words failures across other modules; none is in reevaluation.

**Tests and checks**
- `node --test bio-plane/test/m/reevaluation/`: 145 tests, 145 pass.
- `node checks/words.mjs /home/user/bio reevaluation`: 0 failures (was 32).
- `node checks/format.mjs /home/user/bio`: 0 failures.
- `node checks/architecture.mjs /home/user/bio reevaluation`: 0 failures.
- `node checks/coverage.mjs /home/user/bio reevaluation`: 38 of 38 live requirement ids named by a test, 0 failures.
- `node checks/ownership.mjs /home/user/bio reevaluation tranche/T51 job/T51/reevaluation`: 0 failures.
- `node bio-plane/src/setup-words/build.mjs --check`: only the expected stale-rows note, naming the new `reevaluation.index.*` rows. No refusal names reevaluation.
- `node checks/run.mjs /home/user/bio`: its format and architecture arms report 0 failures; nothing in reevaluation is among its words or coverage findings.

Size (session_01LKowRiQWBdmqmB6pqf1KTq): test runs 2, module lines 3383 (index.mjs 3004, checks.mjs 171, schema.mjs 208).

## J2 · QUESTION

G36 (C69's "newer version" item): the seam is GREEN through the real Store; no change to reevaluation is needed. One placement I need from you.

**Result.** I drove the walker's chain through the real Durable Object (every module real): `acquire` a page, file it as the promotion files it, read it (`readHeld`), mark the passage (`op=contentmint`), rest an inquiry on it, wait one second, `acquire` the page again and file/read it, restart the object over a spent alarm (48 h old, older than every consumer's wake), fire the alarm as the platform does, read `op=queue`. On the merged tree: the restart sets the alarm afresh, `noticeSweep` raises one notice `(holder, content_id, capture_sha, newer_capture)` and `op=queue` holds `FINDING::newer-capture-affects-reference::<notice id>`; the sweep rests afterwards. Both orders of "newer capture read before / after the sweep" give the item. Control: the same recapture with no question on a passage raises nothing and the sweep is not pending. **Red on the deployed code `5ff8b5e01b`** (worktree): the two chain tests fail at "the restart set the alarm afresh" (the alarm stays the spent one, so nothing ever fires); the control passes. So the cause is the dead alarm (scheduler, merged), and `sweep.test.mjs`'s stand-in host is why the tests missed it; the gap is this seam test. No change to the module's code.

**What I need (the smallest thing).** The test cannot live in `bio-plane/test/m/reevaluation/`: it needs the plane's `Store` (plane is later in the order) and `capture`/`extraction` (not in my uses); `checks/architecture.mjs` refuses it (4 failures), and I may not write plane's tests. I committed it at **5767968f14** (`bio-plane/test/m/reevaluation/seam.test.mjs`, 3 tests, 153/153 of my suite green beside it) and took it off my head in the next commit so my branch passes its checks. As with extraction's round-6 seams (plane #51 took them over), please have the plane job (or you) take that file into `bio-plane/test/m/plane/` (rename e.g. `round6-reevaluation.test.mjs`; its imports are `../plane/fixture.mjs` -> `./fixture.mjs`, `./fixture.mjs` (reevaluation's `inquiryMd`, `infoMd`) -> import from `../reevaluation/fixture.mjs`, or inline the two md builders), with `git show 5767968f14:bio-plane/test/m/reevaluation/seam.test.mjs`. Its titles name R14 and R25. Say if you would rather I keep it here with `capture` and `extraction` added to reevaluation's uses and the plane import replaced; I do not see how, since plane's Store is the only real object.

Best reading: plane takes the file over. Meanwhile there is nothing else in my entry; I wait.

## J3 · COMPLETE

G36 complete. No change to reevaluation's code or tests on my branch; the seam test (committed at 5767968f14) is now plane's `round6-reevaluation.test.mjs` (BOB, B3).

1. **Cause:** the dead alarm (scheduler, merged): a spent alarm was never re-set by a restart, so the notice-sweep consumer never ran. The chain itself (capture, file, read, mark passage, question, recapture, sweep, Queue) is correct: through the real Store the sweep raises one notice and `op=queue` holds `FINDING::newer-capture-affects-reference::<notice>`, whether the newer capture is read before or after the sweep.
2. **Missed because** `reevaluation/sweep.test.mjs` uses a stand-in host and no test started from a spent alarm; gap closed by the seam test.
3. **Failing-first:** the two chain tests, red on `5ff8b5e01b` (alarm stays the spent one, "the restart set the alarm afresh" fails), green on the merged tree; control (recapture with no cited passage: no notice, no item, sweep not pending) green on both.
4. **Platform check:** P, C69 at the re-walk.

Requirement change: none. Suite: `node --test --test-force-exit bio-plane/test/m/reevaluation/` 153/153 with the seam file present (150 without). Checks on my head: format, architecture, coverage (40/40), words, ownership: 0 failures; `checks/run.mjs` 0 failures once the file is off my branch.

Size (session_01CnPVmtafMcWuWKG1dLeF7L): test runs 12, module lines 3373 (index.mjs 2994, checks.mjs 171, schema.mjs 208; unchanged)

## J4 · COMPLETE

G66 (fix round 7, C69) complete. Commit c7e455dcdc on job/T51/reevaluation. The cause is found, so it is no longer "unknown".

**1. Root cause (reading confirmed by a test red first).** The sweep goes pending again only on a receipt (`receiptSeen`, `reevaluation/index.mjs` `#sweepPending`, R25). A receipt is written when the capture ARRIVES (acquire / capture: `recordReceipt`). A capture joins a page's version chain only when a document holding it is FILED (provenance R17: a receipt AND a `register` row), and filing is not a receipt. The walk's order (acquire 2.0 s, press to finished 5.5 s, sweep 1 s after the receipt) puts a sweep between the two: it read the chain without the new copy (`no_newer_capture`), completed its pass, and filing the page afterwards counted nothing, so the pass was never repeated. G36's seam test files the page before the alarm runs, which is why it passed.
   What the plan's best reading (iii) got otherwise: a newer copy that is filed but unread does NOT wait. `content`'s notice grades it UNDETERMINED at once (`gradeAcross`: no text held), and `raiseNotices` raises on `affected` or `undetermined`; `chain_unread` means the version chain could not be read (no address, `versionChain` refused), never "reading owed". So no polling of reading and no age cap are built; a test pins that (below). The cases (i) the citation's `content_id` and (ii) an unchanged paragraph raising none are not the walker's: his copy changed.

**2. Why the tests missed it.** `sweep.test.mjs` files a document before the receipt in every test; G36's seam files before the alarm. No test ordered receipt, sweep, filing.

**3. Failing-first, red then green** (`bio-plane/test/m/reevaluation/r7-sweep-unread.test.mjs`, 5 tests, real record-core, promotion, provenance, content, inquiry, basis-versions):
- red before the change (4 of 5): "a version joined the chain since the last complete pass began": `noticeSweepDue` null, expected now; the earlier steps (receipt counted, the early tick examined 1 and raised 0, pass complete) passed. The fifth, the old-row test, was red on the missing column.
- green after (5 of 5). The one test that was green first, "a newer copy filed but not yet read raises its notice at once as undetermined", is the plan's unread case, pinned as designed.
- the walker's case through the door (acquire, file, cite by the screen's op, capture again by the press's op, alarm, `op=queue`) is the control-plane job's seam file (`t51-round7-seam.test.mjs`, R-SEAM); I wrote none there.

**4. What changed.**
- `reevaluation/index.mjs` `#filingMark`, `#sweepPending`, `noticeSweep`, `#sweepRow`, `#sweepWrite`: the sweep also becomes pending when the highest `register` row (provenance R48's read contract, already joined here) is not the one the last complete pass began at. A pass keeps the mark it began at, so a filing during a pass, or in the same second, still counts (integer compare, as the receipt count). A filing that adds no version costs one more pass and raises nothing, then the sweep rests (control test).
- `reevaluation/schema.mjs`: `pass_mark`, `complete_mark` on `reevaluation_sweep` (new table, and `ALTER TABLE` for an existing one).
- Logging (K4428): `noticeSweep` writes `{event: "notice_sweep", examined, unread, raised}` per tick (`raised` is the count), through `deps.log` (default console, never throws).
- **Old records:** a sweep row written before the mark holds NULL, read as one pass owed: the first sweep after the deploy reconsiders every leg once (test), then rests. Notices already raised are untouched and never raised again.

**5. Platform check.** P after the redeploy: read `owedwork` for the `notice-sweep` consumer and the logged `notice_sweep` lines (examined, unread, raised) and the question's basis legs on biosmoke8. L is the seam test (control-plane's).

**Requirement lines proposed (BOB writes `build/requirements/`).**
- R25: after "when a receipt has been written (`provenance.onReceipt`) since the last complete pass began", add "or a document has been filed (a `register` row written or purged) since it began, since a capture joins a page's version chain at the filing and not at its receipt (provenance R17)". Add: "a pass written before this mark existed is one pass owed."
- R18: R25's pass position also holds "the highest `register` row each pass began at".
- A line (R25 or Suggestions): "each tick writes one log line with the batch's `examined`, `chain_unread` and raised count; a log changes nothing."

**Not changed, for BOB.** An open notice raised UNDETERMINED because the newer copy was unread keeps that grade after the copy is read (R14: one notice per newer capture, graded as read when raised). It is the "read as undetermined: the record lacks what it needs to tell" item of A.md:39; regrading an open notice is a change of R14, so it is yours to decide, not built. The "Untitled capture" wording is the screens' (UX), not this module's. Census ops: none. Rows owed to UX-DESIGN: none (no sentence added).

**Found in other modules:** none.

**Tests and checks**
- `node --import ./test/platform-sqlite.mjs --test --test-force-exit test/m/reevaluation/`: 155 tests, 155 pass.
- Users: `test/m/scheduler/` and `test/m/queue-producers/`: 313 of 313; `plane/round6-reevaluation`, `plane/docket`, `plane/accepted`, `control-plane/t51-round6-seam`: 24 of 24. `impact.mjs origin/tranche/T51 HEAD` names 57 modules and 1,048 test files (the module's `DECLARED_OPS` is imported widely); I ran the suites that name the sweep, not all 1,048.
- `checks/format.mjs`: 0 failures. `architecture.mjs reevaluation`: 0. `coverage.mjs reevaluation`: 40 of 40, 0. `ownership.mjs reevaluation tranche/T51 job/T51/reevaluation`: 0. `words.mjs reevaluation`: 0 failures (unkeyed 77, as before).
- `checks/run.mjs`: format 0, architecture 0, coverage 1 failure and words 11 failures, none in reevaluation (case-checker spec text and installer-steps keys, as at the start).

Size (session_01JoHaCf6NLCN4qcShZVgtCh): test runs 8, module lines 3410 (index.mjs 3019, checks.mjs 171, schema.mjs 220)

## J5 · QUESTION

QUESTION (G89, R41): what re-runs the sweep when a notice's copy is read?

Built and green: `raiseNotices` re-grades an OPEN notice (leg and case) when it reads its copy again, in the same tick (`#regrade`, index.mjs); a settled notice keeps its grade; no second notice; the answer gains `regraded`. Tests: r14-regrade-after-read (module, 7 of 7, red before the fix) and r14-regrade-door (Miniflare, green).

The gap: a reading finishing is neither a receipt nor a filing, so R25 does not make the sweep pending after it. A notice raised UNDETERMINED (copy filed, unread) is therefore only re-graded when some other receipt or filing happens to run the sweep. In the walker's order that may be never.

My best reading, built and then reverted: R25 also pending while an open undetermined leg notice now reads otherwise (`#regradeOwed`: ask content.noticeForRow, as the sweep does, for the open undetermined notices only; pending only when the copy's candidate now grades differently; it rests once re-graded; a copy never read is not polled). It passes my tests but FAILS `plane/round6-reevaluation.test.mjs:103` ("the newer capture read after the sweep ... the sweep rests"), a plane test that pins the old R25, which I may not change. Patch kept in my scratchpad.

Ask: (a) keep R25 as is (R41 re-grades whenever the sweep next runs for any reason), or (b) amend R25 with that trigger and have plane's line 103 run one tick before "rests". I carry on on (a) meanwhile. Recommendation: (b).

## G89 · R41 (REEVALUATION #26)

**Cause (index.mjs, `raiseNotices`).** The existing-id skip wrote an open notice's grade once and never updated it; `notices()` serves the stored column, so a notice raised UNDETERMINED (copy filed, unread) kept that grade after the copy was read, while `versionNotice` answered affected. **Why missed:** no test read the copy after the raise.

**What changed.** `raiseNotices`: per leg (and per case part) the open notices by newer capture are read once; a candidate that matches one is re-graded by `#regrade` (UPDATE grade, affects, only while `state='open'`), else raised as before. A settled notice is not in the open set, so it keeps its grade; the id check still blocks a second notice. The answer gains `regraded` (`notice, newer_capture, grade_before, affects_before, grade, affects`); `unread` and the log line are unchanged. Not told to listeners again (R8, one telling per raise). `#sweepPending` gains `#regradeOwed()` (BOB's answer B6, option b): pending while an open undetermined leg notice's candidate now grades otherwise; rests once re-graded; a copy never read is not polled.
**Old records:** none to repair; the first sweep after the deploy re-grades any open undetermined notice whose copy is now read.

**Tests.** `test/m/reevaluation/r14-regrade-after-read.test.mjs` (7): red on the old code 7 of 7 (4 on the stale grade, 3 controls on the missing `regraded`/`pending`), green now. `r14-regrade-door.test.mjs` (Miniflare, cite, capture again, alarm, `reevaluationnotices` against `versionnotice`): green; not red before the fix, since `acquire` reads the copy in the request and the notice is raised graded: the undetermined window is not reachable there (module test covers it). `test/m/reevaluation/`: 163 of 163. Users (34 files naming the service, incl. scheduler, queue-producers, control-plane seam): 344 of 345.

**Another module's test turned red (BOB fixes at merge, test-only):** `test/m/plane/round6-reevaluation.test.mjs:103`, the "(the newer capture read after the sweep)" case. It reads the copy at line 98, after the notice was raised undetermined, then asserts `noticeSweepDue(...)` is null. With R41 the sweep is owed once (the reading re-grades the notice). Change: insert `r.noticeSweep(Date.now());` immediately before line 103; then it rests. Verified on a temp copy: 3 of 3 pass. No other test of another module is red.

**Checks.** `checks/run.mjs`: format 0, architecture 0, coverage 0 (6723 of 6723); words 13 failures, none in reevaluation (case-checker spec, installer-steps keys, screens-intake key; unchanged). `ownership.mjs`: 0. Words/setup-words generated artifacts: none touched.
**Requirement lines proposed:** none beyond B6's sentence for R25/R41. **Census ops:** none new. **Rows owed to UX-DESIGN:** none. **Found in other modules:** none beyond the plane line above.

Size (session_01XcvJkCvweiQ8KgQqV3UTdh): test runs 14, module lines 3452

## J6 · COMPLETE

COMPLETE (G89, R41): see the record's G89 section. Re-grade in raiseNotices, sweep pending via #regradeOwed (B6 b). 163/163 module, users 344/345: plane/round6-reevaluation.test.mjs:103 needs 'r.noticeSweep(Date.now());' before it (verified 3/3). Checks 0 (words 13, none mine).

## Fix round 10, Wave A batch 5 (REEVALUATION #27, session_01Ed3McYsoc4pJynhHKAnecp)

- **Published** `noticesRead` in `bio-plane/test/m/reevaluation/fixtures.mjs` (new): the real `raiseNotices` then `notices` over a question whose cited passage has a newer capture; test `fixtures.test.mjs` (R14) calls it and checks the real answer.
- **caseparts.test.mjs:30 (FIX-L publication/case-cited-parts):** code changed to `NO_SUCH_CASE_EDITION`; marker `// fixtures-contract: publication case-cited-parts` added. Left: the line reads `contract-no-run` until publication's job carries `fixtures-run` (waiting, not mine).
- **standards/standardsEmptyReads (fixture.mjs:100):** done; `quietUpstreams().standards` now answers from the provider's `standardsEmptyReads()`.
- **retrieval/selectionResolve (fixture.mjs:160): NOT done.** Re-pointing to retrieval's `noSelection` fixture makes `checks/architecture.mjs` fail (`fixture.mjs imports bio-plane/test/m/retrieval/fixtures.mjs of retrieval, which reevaluation does not declare in uses`). `build/modules.json` is BOB's. The line is the original hand-built refusal. Posted QUESTION J-next.
- No `fixtures-own` or `fixtures-generic` marker added; one `fixtures-contract` marker (caseparts.test.mjs:30).
- Tests: reevaluation module tests 164 pass, 0 fail. Checks: format 0 failures; architecture 0 failures (with line 160 as original); coverage 41 of 41 ids, 0; ownership 0; words 0; fixtures --list: 2 left (caseparts:31 waiting on publication; fixture.mjs:160 awaiting BOB). impact.mjs: 0 affected modules.
- Size (session_01Ed3McYsoc4pJynhHKAnecp): test runs 6, module lines 0 changed in src; test lines ~60

## J7 · QUESTION

QUESTION: one line of the batch is not doable under the rules as they stand. fixture.mjs:160 (retrieval/selectionResolve) should take retrieval's noSelection fixture, but reevaluation's uses (build/modules.json) does not include retrieval, so checks/architecture.mjs fails on the import ('which reevaluation does not declare in uses'). reevaluation reaches retrieval only as the stand-in inquiry is built with. My best reading: add retrieval to reevaluation's uses (your file), then I re-point the line in one more step. Alternative: accept the line as a stand-in (fixtures-own) with your ruling. Everything else is done and pushed (noticesRead published, standardsEmptyReads re-pointed, caseparts code fixed and contract marker added; caseparts:31 awaits publication's fixtures-run). Details in my record.

### After B8 (K5088)
- Merged `tranche/T51`; `fixture.mjs:160` now takes retrieval's published `noSelection` (`.answer`). Done: `fixtures --list` for reevaluation left with `caseparts.test.mjs:31` only (contract-no-run, waits for publication's `fixtures-run`).
- No `fixtures-own` or `fixtures-generic` marker added; one `fixtures-contract` (caseparts.test.mjs:30, publication case-cited-parts).
- Tests: module 164/164. Checks: format, architecture, coverage (41/41), ownership, words: 0 failures.
- Size (session_01Ed3McYsoc4pJynhHKAnecp): test runs 8, module lines 0 changed in src

## J8 · COMPLETE

COMPLETE (fix round 10, Wave A batch 5): noticesRead published with its test; standardsEmptyReads and noSelection fixtures taken (fixture.mjs:100, :160); caseparts code now NO_SUCH_CASE_EDITION with fixtures-contract publication case-cited-parts (caseparts:31 stays listed until publication's fixtures-run). No fixtures-own or fixtures-generic markers added. Module 164/164; format, architecture, coverage 41/41, ownership, words 0 failures. See record.
