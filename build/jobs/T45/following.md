# following (T45)

**Status** · session_01GFBw9f24M2axfCAsVCYFd3 · depth 2 · WORKING · handled B1

## J1 · COMPLETE

**T45-36 applied on `job/T45/following`** (commit after `f0cbcffb30`, tranche/T45 merged in at 861d703883). Files: `bio-plane/src/following/{index,checks,schema}.mjs`, `bio-plane/test/m/following/{fixture,checks.test}.mjs`, `watches.test.mjs` (new). Nothing outside my paths.

**Read whole by me (P20; K2730):** `build/requirements/following.md`; every file of `src/following/` (6) and `test/m/following/` (8); T45-36, the plan's Rules at the opening (rule 4) and the reconciliation (R7, R13, R18, R20); K2780, K2781, K2787; `BIO_Action_v0_2.md` §4 rules 1–21 (1, 17, 18 in particular); `draft-T45-upper.md` "following" and its Doubts. **Used modules (over the 600 KB limit):** three helper agents in this session were given my entries and their readers (`plan-work` R7/R9, `notice-producers` R5, `action-producers` R10). They read in full `action-plans` and `plan-work` (Public parts and code), `duties` and `answers` (Public parts and code), and `membership` (R43, R44, R54, R64, R65, R68, R80, R86), `monitoring` (R14–R16, R32, R52, R65, R71, R72) and `civil-time` R1/R6/R7, and wrote digests citing each section (mechanics §17 (3)).

**Entries applied**
- **R22** `ends` on `followBody`/`followRegister`/`followPersonQuery`/`followPortal` (a day after today's local day, instance zone; else `WATCH_END_REFUSED` before any write). `followEnd` (op `followend`): its author only; `ends: null` removes it; a policy watch refuses. Settings are appended to a new table `follow_ends` (who, when; latest governs). After its end day a follow ends by itself, once (`ended_by` null, `ended_reason: "ends"`, `ended_at` = the start of the next local day), is never due, and R19 is told. The end instant is also a wake candidate.
- **R14** every follow answers `ends` or `ends: null` + `ends_state: "none_set"`. An ended follow is listed with `ended_at`, `ended_by`, `ended_reason` (`author`, `ends`, `answer`, or R20's `superseded` / `withdrawn`). New column `follows.ended_reason`, added by migration for existing tables.
- **R23** `watchLink` (op `watchlink`), table `watch_links`, append-only. The refusals in order: `MACHINE_CANNOT_LINK_WATCH`; action-plans' `noSuchPlan` (relayed); `refusePlanClosed` (relayed); `NO_SUCH_WATCH`; plan-work's `MATTER_NOT_OF_PLAN` (relayed, from `matterPromiseDuties`); `WATCH_ENDED`. A second link answers `existed: true`. A link to a standing question is seen only by its author in every read.
- **R24** `watchQuestions` (op `watchquestions`): due at the closing instant (`planRead.closed.at`) or on `promises_met`. It covers every matter of the link (all the plan's when it names none), each needing `all_met` and not `partial` from `plan-work.matterPromiseDuties` read with no sight. It never reads an ended watch. `relied_on` comes from other open plans' links, `monitoring.addressWatchers` naming another project, and a policy watch always; `offered` follows it. Recipients follow R24's chain. Paged by (due instant, link) with a `due#link` cursor; it writes nothing.
- **R25** `watchAnswer` (op `watchanswer`), table `watch_answers`, run in one `record.transact`. Each kind's end is set in its owner's terms: a follow's `ends`, or its end now (`answer`); `monitoring.addressWatchEnd`; a duty's day held on the link; `answers.standingQuestionEndSet` / `standingQuestionEnd`. An owner's refusal is answered as given and nothing is recorded. `dutyWatchEnd(duty)` is provided for `notice-producers` R5.
- **R26** `watchesOfPlan`, registered at start through `plan-work.registerWatchReader("following", …)` (the answer is kept in `following.registered`). It never throws. `viewer: null` (the closing summary) sees no standing question. A test over the real `plan-work` and `action-plans` (plan-work's fixture) shows "where it stands" listing the watch, the closed plan's question due at `planClose`'s `at`, and the real door refusing a second registration.
- New rows C-137.21–26: `WATCH_END_REFUSED`, `WATCH_ENDED`, `MACHINE_CANNOT_LINK_WATCH`, `NO_SUCH_WATCH`, `WATCH_NOT_ASKED`, `WATCH_RELIED_ON`. `MATTER_NOT_OF_PLAN`, `NO_SUCH_PLAN` and `PLAN_CLOSED` are not minted here (DEC-49).

**My readings, decided as details and done (BOB may CHANGE any):**
1. `follows({viewer})` lists live follows as before. Ended follows are listed only with `ended: true` (op `follows&ended=1`). This keeps R20's "a superseded policy's watch is no longer listed" behaviour, which its tests pin.
2. **plan-work R13 answers no "instant the last duty read met".** R24's `promises_met` instant is the latest `at` of the matching act (`duties` R12 evidence `{kind: event, at}`, measured evidence at its latest bound), read through `duties.occurrencesOf` with `class:daemon`. If none is readable, it is the instant of the read.
3. An address watch is identified by its normalised form (the module's `portalKey`: host lower-cased, query sorted). It is seen and ended through `monitoring.monitoring({viewer})` rows (R32's `until`, `state: "ended"`).
4. `followEnd`'s refusals: `MACHINE_CANNOT_FOLLOW`, `NO_SUCH_FOLLOW` (absent or unseen), `WATCH_END_REFUSED` (a policy watch; a bad day), `NOT_THE_AUTHOR`, `WATCH_ENDED`.
5. A standing question is read with `answers.standingQuestionsOf` (which writes nothing), never with `standingQuestionRead` (which records a passed end).

**Found in other modules (also a REPORT):** see J2.

**Tests and checks run**
- `node --test bio-plane/test/m/following/` → 73 pass, 0 fail (was 50).
- Users of `following`: scheduler 129/0, notice-producers 97/0. affordances 218/8, op-declarations 132/1, answer-envelope 25/6, control-plane 219/4 and plane 188/8 fail **the identical named tests** on the base without my change (rule 4's inherited reds).
- Process checks: format 0 failures; architecture 0 failures; coverage 26 of 26 live ids; ownership 7 files, 0 failures.

Size (session_01GFBw9f24M2axfCAsVCYFd3): test runs 16, module lines 1838

## J2 · REPORT

Found while building T45-36 (none blocks this job):

1. **monitoring (T45-35, running): R71/R72 were not on `job/T45/monitoring` when I built.** I built against their requirements. The calls are `addressWatchEnd({address, until, by, viewer})` (`until` = today for "stop"), `addressWatchers(address)` → project ids, and R32's `monitoring({viewer, now})` items carrying `address`, `until` and `state: "ended"`. Once monitoring merges, I merge tranche/T45 and re-run my tests against the real module, if you send a CHANGE.
2. **plan-work R13 (improvement):** `matterPromiseDuties` answers no instant at which the last duty read met. R24 needs one, so I derive it from `duties.occurrencesOf` evidence (my record, reading 2). A field such as `met_at` in R13 would give one source.
3. **The new ops `followend`, `watchlink`, `watchanswer`, `watchquestions`** need their declaration, grade, affordance and route: T45-45, T45-38, T45-39, T45-47. Also needed:
   - the C-137.21–26 rows' stamp, for promotion's row census;
   - the answer-envelope catalogue, under rule 4 (14);
   - the plane's start composition: `followingOf(host)` now reaches `actionPlansOf`, `planWorkOf`, `dutiesOf` and `answersOf` lazily, and registers its watch reader with plan-work when it is created (T45-47).
4. **For `action-producers` R10 and `notice-producers` R5:** the reads are `watchQuestions({after, limit, viewer})` (entries with `recipients`) and `dutyWatchEnd(duty)`.
