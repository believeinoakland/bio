# notice-producers (T51)

**Status** · session_01SbR9Bp7b1UDZG4sWc5dbrm · depth 2 · WORKING · handled B1

## J1 · COMPLETE

Entry T51-132 (notice-producers) applied. Branch `job/T51/notice-producers` at a680ec0564 (merged `tranche/T51` at fe5d5656fb, never rebased).

**Applied**
- R25 (words): the security item's `detail` writes its instant as `time.at` (`date.daymonthyear` for the day, `time.clock` with `time.am`/`time.pm` for the clock, in the team's zone; "UTC" after the UTC reading when no zone is held). The clock comes from civil-time's `localClock` (R30, merged in L1), as the entry asks. `id`, `subject.episode`, `basis.episode` and `screen` keep the ISO instants. An instant that cannot be read is not written.
- R26 (no ISO day): R5, R6, R13, R14, R15 write days through `dayInSentence` only; the raw-`YYYY-MM-DD` fallback and the "an earlier date" literal are removed.
- The T51-132 reds (18 tests, DEC-333 month first): every date expectation in the suite is built from `words.json` (`date.daymonth`, `date.daymonthyear`, `date.month.*`, `ai.until.*`) through one helper in `fixture.mjs` (`dayOn`). Literal sentences and date fragments in tests are removed or replaced by keyed comparisons.
- Words findings: `index.mjs` now reads "sign-in or recovery" / "sign-ins or recoveries" by key (`notice-producers.sign_recovery`, `notice-producers.sign_ins_recoveries`); three inline `basis.detail` strings are `localize` calls; test copies of sentences removed (`duties` "What starts the clock…" and "possibly overdue…" become markers; `read` "The system found this…" becomes a marker).
- New tests naming R25 and R26 (security, duties, waits, policy, files).

**Results**
- `node --test bio-plane/test/m/notice-producers/*.test.mjs`: 130 pass, 0 fail, 0 skipped.
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs`: 0 failures (this module). `checks/coverage.mjs`: 26 of 26 live ids named by a test. `checks/ownership.mjs`: 0 failures (13 files, this module's paths and tests only).
- `checks/words.mjs notice-producers`: 0 findings. Over the whole product (`checks/run.mjs`), no finding names notice-producers.
- `setup-words/build.mjs --check`: stale-rows note only (expected); it names the four new localize ids (below).

**Deferred / for BOB (not this module's to change)**
1. **R12's sentence has no words.json key.** "The security level of your team's Civicsmith has been High since {from}, and in that time {got}." (`notice-producers.index.the_security_level_of_your`) and the no-instant variant (`…_no_time`) are localize-coded. R12 says the words are the design stream's. The test asserts the parts (the instant and the count, by key) rather than the copied sentence. Needs the design's words (BOB / design stream).
2. **New localize ids awaiting rows regeneration** (BOB regenerates at layer close): `notice-producers.index.the_security_level_of_your_no_time`, `notice-producers.index.a_dated_wait_is_inquirys`, `notice-producers.index.the_level_is_credentials`, `notice-producers.index.an_accounts_ask_is_ai_uses`.
3. **Product-wide failures outside this module** (seen in `checks/run.mjs`, not this module's to fix): `architecture` 1 failure, `answer-envelope/page-policy.test.mjs` imports `control-plane`'s `signpage.mjs` before it is earlier in the order (T51-109 / K3835 ordering); `coverage` 24 failures and `words` findings in other modules (wizard-scripts and others). None names notice-producers.
4. **Not run:** the installer suite (its process hangs, N1254) and the layer tests (none named in the manifest).

**Judgement calls**
- R25's clock: the entry asked for civil-time's clock; R25's text (written before civil-time offered one) names `Intl.DateTimeFormat`. I used `localClock`, which is the entry's reading and the shared owner of time (K3864). Tell me if the requirement text should say so.
- Test markers (`WHY-MARK`, `REASON-MARK`, `FIND-MARK`) stand where the test passes a record's text through and does not judge it.

Size (session_01LTmvAUsk4PGG8o3fTe2oZD): test runs 12, module lines 1494 (index.mjs 1448, words.mjs 46).
