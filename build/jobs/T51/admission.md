# admission (T51)

**Status** · session_014YKSz5P9aQ8AFfPFSti6pv · depth 2 · COMPLETE · handled B2

## Completion (T51-108)

**Entries applied.** T51-108 · admission, the words pass: the one finding `checks/words.mjs` lists for the module (`handlist`, `bio-plane/test/m/admission/t50.test.mjs:34`, the hand-list of five administrator ops) is fixed. The test now asserts the count of acts `administratorsOwn()` reads from op-declarations (five today), not a list of op names. The stale comment at `bio-plane/src/admission/checks.mjs:139`, which named the deleted `civicos-ui/app.html`, now says "the legacy interface". Text: none; no requirement changed.

**Deferred.** None.

**Found in another module.** The full words run (`checks/words.mjs /home/user/bio`, all modules) lists 1096 failures in other modules, none naming admission (K3986). Not reported further here; they belong to their own modules' jobs.

**Checks and tests.**
- `node --test bio-plane/test/m/admission/*.test.mjs`: 58 pass, 0 fail, 0 skipped (the directory form of `node --test` printed no summary; the glob form was used).
- `checks/words.mjs /home/user/bio admission`: 0 failures, handlist 0.
- `checks/format.mjs /home/user/bio`: 0 failures.
- `checks/architecture.mjs /home/user/bio admission`: 0 failures.
- `checks/coverage.mjs /home/user/bio admission`: 31 of 31 live requirement ids named by a test, 0 failures.
- `checks/ownership.mjs /home/user/bio admission tranche/T51 job/T51/admission`: 0 failures (1 file changed by admission between tranche/T51 and the job branch, before the record commit).
- `bio-plane/src/setup-words/build.mjs --check`: rows.mjs and words-unreviewed.json match.
- `node checks/run.mjs` was not run as a whole: this step was not needed for the words-only change, and the individual checks above cover its parts.

**Size (session_01TfUBwfzbh3tVDcKbv3gYqo): test runs 2, module lines 1567.**

## Completion (B2 CHANGE, K4245: export for the founder's session)

**Entries applied.** `admit` (`bio-plane/src/admission/index.mjs`) now refuses `export` `ROOT_OF_TRUST_REQUIRED` (C-38.4) only to a session whose kind is not `admin`; the founder's session (kind `admin`) goes on to `sessionOpGate`, which admits it because `export` is in `SESSION_OPS.admin`. The ADMIN_TOKEN bearer is admitted by R9 as before. An enrolled administrator's session (kind `member`) and every other member session are still refused, before R9 and R11. The refusal's `detail` and the gate's doc comment now state the two forms of the root of trust.

**Tests re-pinned.** `admission.test.mjs` R8 (:39-45, the "no recorded decision" arm) now uses `purge` with its decision removed from an arranged copy of the tables; (:48) loops and the order test (`both`, `onlyAdmin`) exclude `export`, now in the founder's set; the `export` arm (:63-70) asserts: the founder's session and the ADMIN_TOKEN bearer reach `export` (caller class `admin`, the former via a session); controls refused `ROOT_OF_TRUST_REQUIRED` with no store call: an enrolled administrator's session, a member's session, a session holding no capability; the retired member key `MEMBER_TOKEN_RETIRED`; probe and daemon bindings `CLASS_FORBIDDEN`. :209 (export's refusal before R9 and R11 for a capability-less member session) is unchanged and still holds. `invariants.test.mjs` :26 uses `purge` the same way. R8 is the requirement id the tests name.

**Requirement lines for BOB (R8, amended).** Replace its last sentence "A session asking for `export` is refused `ROOT_OF_TRUST_REQUIRED` (C-38.4)" with: "`export` is admitted to the root-of-trust bearer (R9) and to the founder's session (kind `admin`), the session the claim made from that token (Membership v2 §4.6); a session of any other kind, an enrolled administrator's included, is refused `ROOT_OF_TRUST_REQUIRED` (C-38.4), before R9 and R11." The Satisfies line for §4.6 and the header comment of the `admit` order read the same way. Words: the row `refusal.ROOT_OF_TRUST_REQUIRED` (design stream's `words.json`) may still say that the founder's own session is refused too; the wording of that sentence is not this module's.

**Deferred.** None. **Found in another module.** `control-plane`'s R28 test pins `export` as refused to the founder's session (BOB said its job re-pins it after this merge); `bio-plane/src/setup-words/rows.mjs` is stale (an expected note).

**Tests and checks.** `node --test bio-plane/test/m/admission/*.test.mjs`: 58 pass, 0 fail. Process repository: `format` 0 failures; `architecture admission` 0; `coverage admission` 31 of 31, 0; `ownership admission tranche/T51 job/T51/admission` 4 files, 0; `words admission` 0 failures; `setup-words build --check` the expected stale-rows note only. Tests of modules that use admission's `admit` (control-plane) were not run here: BOB's CHANGE leaves them to CONTROL-PLANE's job.

**Size (session_015HDWbHmEnfNhPztiBbgnVw): test runs 3, module lines 1567.**

## J1 · COMPLETE

T51-108 (words pass) is done and pushed (f71da31fdc). The one words finding, the handlist in t50.test.mjs:34, is fixed by asserting the count of administrator acts read from op-declarations; the stale civicos-ui comment at checks.mjs:139 is reworded. Admission: 58 of 58 tests pass; words, format, architecture, coverage (31 of 31), ownership, setup-words --check all clean. Full words run lists no admission line (K3986). Record: build/jobs/T51/admission.md.

## J2 · COMPLETE

B2 (K4245) applied and pushed. export is admitted to the ADMIN_TOKEN bearer (R9) and the founder's session (kind admin); every other session, an enrolled administrator's included, is refused ROOT_OF_TRUST_REQUIRED before R9/R11. Tests re-pinned (admission.test.mjs R8, order test; invariants.test.mjs) with controls for the founder's session, administrator session, member session, capability-less session, retired member key, probe and daemon bindings. 58/58 pass; format, architecture, coverage (31/31), ownership, words clean. R8 amended line, and a note that words row refusal.ROOT_OF_TRUST_REQUIRED may still say the founder is refused, are in my record (build/jobs/T51/admission.md). CONTROL-PLANE re-pins its R28 test after merge.

## J3 · BLOCKED

BLOCKED, cause: tests (the provider is not merged; not a fault of this job).

**Done:** `bioStore` (`bio-plane/src/admission/index.mjs:310`) now obtains the room by `storeStub(env, "bio")` (runtime-limits R28), with the import from `../store-place.mjs` (`dc0fdb53a1`, comment `9ed8e0dc0b`). No other change; no requirement id is new. The reading is whole: my code (all 1140 lines), `admission.md`, the fix-round-7 plan §0, §3, §8, and the added plan's Adopted revisions and G83 sections. The new test `bio-plane/test/m/admission/g83-location.test.mjs` (five tests: the hint on `sourceOf`, the hint on `securityTally`, the `bio~g2` name, the control with neither binding, and the allow-list refusals) is written first.

**Checks run now:** format 0 failures; architecture 0 failures (the `store-place.mjs` import is not judged while it is untracked); coverage 31 of 31 live requirement ids named; ownership 0 failures.

**Tests, red by name:** the admission folder fails at import, 19 files, `ERR_MODULE_NOT_FOUND: Cannot find module 'bio-plane/src/store-place.mjs' imported from bio-plane/src/admission/index.mjs`. `store-place.mjs` is runtime-limits' third file (R27, R28); it is not on `origin/tranche/T51` yet (runtime-limits is merge position 7, `build/plan/starts-T51-F7/runtime-limits.txt`). Until it merges, no admission test can run.

**Needs:** BOB merges `tranche/T51` into this branch after runtime-limits merges and posts the CHANGE, or tells me to merge the tranche branch now. Then I run the folder and `g83-location.test.mjs`, and COMPLETE. I will not COMPLETE red on it.

**Deferred:** none. **Found in another module:** none.

## J4 · COMPLETE

COMPLETE, commit 6ed48b0707 (branch job/T51/admission, merged with tranche/T51 after CHANGE K4757).

**Entries applied:** G83. `bioStore` (bio-plane/src/admission/index.mjs:310) obtains the room by `storeStub(env, "bio")` (runtime-limits R28). Its four store paths (lookup, storeSource, doorWindowGate, securityTally) all go through it. No requirement id is new. Test `bio-plane/test/m/admission/g83-location.test.mjs` (five tests, failing first, red at import until the helper merged, now green).

**Deferred:** none.

**Found in another module (pre-existing on the clean tranche, not caused by this change):**
- control-plane: `R123, R125 (G7)` in `t51-round6-seam.test.mjs` fails deterministically (2 of 2 reruns, and on a clean origin/tranche/T51 worktree).
- plane: 11 failures (R24 words, R77 L gate x2, R86 G48 (c1), and the L-entry scripts g54, g55, g57, l75, l77, l79, r42). The same 11 fail on the clean tranche (compared by name).
- plane's test run rewrites `bio-plane/test/m/plane/fixtures/g48-plane-answers.json`. I restored it; not committed. Worth a look by the plane owner.

**Tests and checks:**
- admission folder: 64 of 64 pass (includes the 5 G83 tests).
- control-plane folder: 451 of 452 (the R123/R125 failure above).
- plane folder: 401 of 412 (the 11 above).
- format 0 failures; architecture 0 failures; coverage 31 of 31 live ids named; ownership 0 failures; words 0 failures.
- impact set: admission 19/19, control-plane 69/85 and plane 54/66 as named users; both run as above.

Size (session_01Ubr53UtKq7fm4Lcgq9Dr6r): test runs 9, module lines 1141

## J5 · COMPLETE

COMPLETE, fix round 8, cause G119 (R32, one session read per request), session ADMISSION #17.

**G119, the four fields.**
1. Cause: three places read the same session for one request: `admit` (`admission/index.mjs`, the gated path), `readerOf` and `liveSessionDigest` (the window's), each calling `sessionPresented` and so the store's `session` route. Fix: `sessionRead`, a memo keyed (weakly) on the door's one `presentedCredential` answer for the request, holding the first read's promise (a silence too) and reused only for the same token, `background` mark, `env` and `doAnswer`; a credential with no door object is read each time. No door change. `doorwindow` is kept (K1881). New data: none; old records: none.
2. Why missed: no test counted the store's session reads of a request; op tests called each gate on its own.
3. Failing-first `bio-plane/test/m/admission/r8-session-reads.test.mjs` (9 tests, R32 named in each), seen RED before the change: `AssertionError: the session is read once for the request (red before G119: two)` (window + reader, and reader + admit), `AssertionError: red before G119: three` (all three), `request 1: one read for that request`; GREEN after (admission folder 73 of 73). Controls: second request reads again; background and foreground are separate reads (a background read stays no activity); unknown session and a store silence are one read answered the same to each gate; no door object reads each time; another token is its own read; a locked session is read once and still counted by source.
4. Platform check **L** (the count) is the test above; the door confirmation `control-plane/r8-hops.test.mjs` is control-plane's and is not on the tranche yet. **P** is BOB's.

**Applied entries:** G119 only. **Deferred:** none. **Found in another module:** none. **Stale generated artifacts:** none made. **Requirement wording:** R32's "(not yet met: T51)" mark is met; no wording change proposed.

**Tests and checks:** admission 73 of 73. Impact set (origin/tranche/T51..HEAD): admission 20/20, control-plane 70/87, plane 59/73, pdf-worker 1/12 as named users. control-plane folder 477 of 478: `R122 (the page's bootstrap is read once per load)` failed once under a concurrent plane run (54 s) and passes alone (clean tranche: pass; this branch: pass). plane folder 430 of 434: `R24` words and the two `R77 L` child-capped PDF tests fail as on the clean tranche (named in J4); `R84 G41` failed under load, passes alone on this branch and on the clean tranche. format 0 failures; architecture 0 failures; coverage 32 of 32 live ids named; words 0 failures; ownership 0 failures.

Size (session_017HGmsDoJ43QYVkTR8QtABy): test runs 8, module lines 1590

## Completion (B6, fix round 10, cause R27b)

**R27b** (admission R21, "Fix round 10, cause 27b").
1. Root cause: `admission/window.mjs` `#counted` ran a `DELETE` of passed buckets and an `INSERT ... ON CONFLICT DO UPDATE` in a transaction on every public op (old `:79-96`): 50 counts changed 50 rows.
2. Missed: no test counted rows changed by counts; tests read the table after each count.
3. Now: the counts are kept in memory per table and key (a key's stored rows are read once, at its first count after the object starts); the limit is judged from memory; `flush()` upserts the changed counts (absolute values) and drops passed buckets in one transaction, run by a timer `WINDOW_FLUSH_MS` (5000, exported, injected through `admissionOf(ctx, {flushMs})`) after the first unwritten count. A failed write keeps the counts and warns without data. Failing-first: new `r10-doorwindow-writes.test.mjs` (3 tests: 50 counts by source and by session change at most 2 rows; the timer writes after the interval and not before, a restart reads what was written; controls: the 301st refused from memory, two sources apart, a refused request not counted). Run against the old `window.mjs` it is red (3 of 3 fail; the first on the missing flush, so the 50-row figure itself is the old code's by reading, not printed); green now.
4. Platform: P is BOB's (R-QUIET: `do-doorwindow` p50/max on the re-walk). Timers are unref'd; the interval is an injected constant (R-CLOCK).
Existing tests: `harness.mjs` `rows()` and `t49.test.mjs` `sessionRows` flush before reading the table (the counts are now written later, by requirement); `storeWorld` takes `flushMs`. No assertion weakened.

**Applied:** R27b. **Deferred:** none. **Found in another module:** none. **Stale generated artifacts:** `bio-plane/dist/bio-plane.bundled.mjs` (contains window.mjs); BOB regenerates. **Requirement wording:** none proposed.

**Tests and checks:** admission folder 76 of 76; plane/control-plane tests naming doorwindow (t41, t35-door, t38-door, r8-hops) 23 of 23; impact set: admission 20/21, plane 68/89 users named, those touching the window run. format 0 failures; architecture 0; coverage 32 of 32; words 0; ownership 0.

Size (session_014YKSz5P9aQ8AFfPFSti6pv): test runs 6, module lines 1593

## J6 · COMPLETE

COMPLETE · ADMISSION #18 · R27b: the door window counts in memory, written at most every 5 s (WINDOW_FLUSH_MS, injected). Failing-first r10-doorwindow-writes.test.mjs red on old code, green now; admission 76/76, plane/control-plane window users 23/23; format, architecture, coverage (32/32), words, ownership 0 failures. Stale: dist/bio-plane.bundled.mjs. Details in my record's last section.
