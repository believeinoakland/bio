# notice-producers (T51)

**Status** · session_01SbR9Bp7b1UDZG4sWc5dbrm · depth 2 · COMPLETE · handled B4

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

## J2 · QUESTION

QUESTION (re B2 START, G2). The capture job (merge 3) has not yet defined the read of its `fetch_done` record, and I cannot read it without a name. My best reading, which I am building to: `captureOf(host).fetchesDone({ after, limit, viewer })` -> `{ ok: true, done: [{ session, document, opener, project, at }], cursor, truncated }`, oldest first, paged like `file-safety.scanFindings` (cursor null at the end, `truncated` while more), answering `opener` as `member:<id>` or a bare id, and each record carrying the document's bundle id. Notice: one FINDING per record, keyed `FINDING::fetch-done::<session>`, to the opener alone (and only while the opener is active); subject the document, home set from the project; told once by the key (queue mints it once; the record stays, so later cycles make the same item and no second). Window: the last 90 days, bound 1000, as R14. Sentence: new localize ids `notice-producers.index.fetch_done_summary`/`..._detail` standing in; the row owed to the design is `notice.fetch.done` (title, N MB, door). Please tell capture's job to publish exactly this read (or tell me the name it publishes); until it merges, my seam test with the real capture stays red by name and my failing-first tests use a stand-in `capture` dependency with that shape. If you would rather key it differently or read without a window, say so.

## J3 · QUESTION

QUESTION (J3, adds to J2; J2's reading stands). The producer and its tests are written and pushed (R27 proposed: fetch-done, keyed FINDING::fetch-done::<session>, 135 module tests pass except the seam test, red by name until capture merges). Two things only you can settle: (1) `build/modules.json` notice-producers `uses` lacks `capture` (your edge, plan section 3), so `checks/architecture.mjs` fails with 'imports capture/index.mjs ... does not declare in uses'; the file is not mine to edit. Please add the edge on tranche/T51. (2) the name/shape of capture's read (J2). Record shape note: your START's row owed has 'N MB' but the record {session, document, opener, project, at} carries no size, so the stand-in sentence names the title only; if you want the size, capture's record needs a `bytes` field. I wait for your ANSWER and capture's merge; then I merge tranche/T51, run the real seam test and finish.

## Fix round 6 (session_01SbR9Bp7b1UDZG4sWc5dbrm, NOTICE-PRODUCERS #15, depth 2): G2 provider

**Entry applied.** `bio-plane/src/notice-producers/index.mjs`: new producer `#fetchDone` (R27, proposed), kind `fetch-done` (FINDING), key `FINDING::fetch-done::<session>`, to the record's `opener` alone while active; reads `captureOf(host).fetchesDone({after, limit})` as published (B3: `{ok, fetches[{session, document, opener, project, at, cursor}], limit, truncated, next}`), pages of 200 to at most 1,000, records older than 90 days not told (`FETCH_DONE_DAYS`, `FETCH_DONE_MAX`, `FETCH_DONE_PAGE`); `facts.fetch_done`; a read that throws or refuses is named `capture` in `facts.failed`. Subject the document, home set the project, door option "Open the document". `modules.json` edge `capture` added by BOB (architecture: 0 failures).

**Tests** (`fetch.test.mjs`, new; `fixture.mjs` NONE gains a `capture` stand-in; `read.test.mjs` R1 facts gains `fetch_done`): one notice for the opener, the same key on a second cycle (no second item); a record for another member, a machine or nobody makes none; revoked member none; a session listed twice is one; older than the window none; throw/refuse named in `facts.failed`; paging shape (no viewer). Each failing-first case had no producer before (the notice did not exist). **Seam test with the real capture stays red by name** (`R27: seam over the real capture's fetch_done record`) until capture merges; BOB CHANGEs me then.

**Words.** DEC-418's rows `notice.fetch.done` and `.door` are not yet in `words.json`; stand-ins are `localize` ids `notice-producers.index.fetch_done_summary`, `..._detail`, `..._open_the_document` (fill `{document}`, no size). Rows owed: `notice.fetch.done`, `notice.fetch.done.door`; replace by key when they land.

**Results.** Module: 136 tests, 135 pass, 1 red by name (the seam). Checks: format 0, architecture 0, coverage 6619/6619, words 0 failures, ownership 0 failures; `build.mjs --check`: stale-rows note only. Impact users: queue 209/210 pass; the one red is `queue/noticed.test.mjs:288` ("the real notice-producers' items reach the feed"): its `facts.failed` is `['capture']` because the real capture does not publish `fetchesDone` yet; it is the same cause as my seam test and clears at capture's merge (it passes on tranche/T51 without my change). Not run: control-plane, plane, store-door suites (they do not read this producer's items beyond queue's feed).

Size (session_01SbR9Bp7b1UDZG4sWc5dbrm): test runs 9, module lines 1497 (index.mjs 1451, words.mjs 46)

## J4 · COMPLETE

COMPLETE (G2 provider, R27 proposed): fetch-done notice built to capture's published fetchesDone read, tests and checks in my record. Two reds are capture's absence, both by name until it merges: my seam test fetch.test.mjs 'R27: seam over the real capture...', and queue/noticed.test.mjs:288 (facts.failed gains 'capture' because the real capture has no fetchesDone yet; passes on tranche/T51 without my change). CHANGE me at capture's merge and I re-run both. Rows owed to the design: notice.fetch.done, notice.fetch.done.door (stand-ins by localize). Requirement line proposed: R27 (G2, K4562): one FINDING fetch-done per capture fetchesDone record, keyed by session, to the opener alone while active, 90-day window, 1,000 bound, facts.fetch_done, a failing capture named in facts.failed; uses gains capture.

Ring failed: BOB session_01T8rYkDXW3CsEsgBMqu8Zce is archived (create_trigger refused). My pushed COMPLETE (J4) is the message; BOB's backstop reads it (mechanics §13).

## After CHANGE B4 (capture merged at b3b6b6cf16)
Merged `tranche/T51`. The seam test now runs over the real capture (`recordFetchDone` once, a repeat refused; the opener is told once, a second read answers the same key, another member none): green. `queue/noticed.test.mjs:288`: green. Module + that queue file: 148 pass, 0 fail. Checks: format 0, architecture 0, coverage 6632/6632, words 0, ownership 0 failures. No red remains; no deferred item. Rows owed to the design: `notice.fetch.done`, `notice.fetch.done.door` (stand-ins by localize).
Size (session_01SbR9Bp7b1UDZG4sWc5dbrm): test runs 14, module lines 1497 (index.mjs 1451, words.mjs 46)
