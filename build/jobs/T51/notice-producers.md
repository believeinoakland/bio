# notice-producers (T51)

**Status** · session_01YTEEz6mMUuYSeNrA5gXVxw · depth 2 · WORKING · handled B4

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

## J5 · COMPLETE

COMPLETE again (re B4): merged tranche/T51 at capture's merge; fetch.test.mjs seam over the real capture (recordFetchDone, told once, other member none) green; queue/noticed.test.mjs:288 green. 148 pass, 0 fail; format, architecture, coverage 6632/6632, words, ownership all 0 failures. No red, nothing deferred. Owed rows: notice.fetch.done, notice.fetch.done.door. Size line in my record.

## J6 · QUESTION

QUESTION (re B5 START, G55). calculations has not published the read of a finished or stopped ingest, and I cannot read it without a name (the entry says only "as that module's contract asks for notice facts"). My best reading, which I build to now:
`calculationsOf(host).ingestNotices({ after, limit, viewer })` -> `{ ok: true, ingests: [{ ingest, binding, project, state: "done"|"stopped", by, rows_total, written_count, not_written_count, at, cursor }], limit, truncated, next }`, oldest first by (`at`, `ingest`), `limit` default 200 (1..1000), `after` the `cursor` of an earlier row, `by` as `member:<id>`; only ingests the viewer sees (visibility as the act), never `ingesting`; never throws.
Notice: two kinds, FINDING `ingest-done` and FINDING `ingest-stopped`, keyed `FINDING::ingest-done::<ingest>` / `FINDING::ingest-stopped::<ingest>`, to `by` alone while active, told once by the key; window 90 days, bound 1000, pages of 200 (as R27); subject the ingest, home set the project. Words (localize ids, as BOB's START names): `notice-producers.ingest.done`, `notice-producers.ingest.stopped`, filling the counts. `uses` needs `calculations` (your edge: modules.json lacks it on tranche/T51 today; checks/architecture.mjs fails on my import until it is added). Please tell CALCULATIONS #9 to publish exactly this read, or tell me the name and shape it publishes. Until it merges my seam test with the real calculations stays red by name and my failing-first tests use a stand-in `calculations` of this shape.

## Fix round 6 · G55 (session_01CVXguWMv2q1pfSMTRFJZDM, NOTICE-PRODUCERS #16, depth 2): the ingest notices

**Entry applied (to the shape in J6, awaiting BOB's answer).** `bio-plane/src/notice-producers/index.mjs`: producer `#ingestNotices` (R28, proposed), kinds `ingest-done` and `ingest-stopped` (FINDING), keys `FINDING::ingest-done::<ingest>` / `FINDING::ingest-stopped::<ingest>`, to the record's `by` alone while active; reads `calculationsOf(host).ingestNotices({after, limit, viewer})` (stand-in shape in J6), pages of 200 to at most 1,000 (`INGEST_NOTICE_PAGE`, `INGEST_NOTICE_MAX`), 90 days (`INGEST_NOTICE_DAYS`); an ingest still `ingesting`, another member's, a machine's or nobody's raises none; `facts.ingest`; a read that throws or refuses is named `calculations` in `facts.failed`. Words (localize ids BOB named): `notice-producers.ingest.done`, `notice-producers.ingest.stopped`, filling `{written}`, `{rows}`, `{not_written}`; the row owed to the design is the same pair, T52.

**Tests** (`g55-ingest.test.mjs`, new; `fixture.mjs` NONE gains a `calculations` stand-in; `read.test.mjs` R1 facts gain `ingest`). Seen red on the base (file fails at import: no producer), green after: one notice per done and per stopped ingest for its member and the same keys on a second cycle; the words by id and the counts; running / other member / machine / nobody none; revoked none; older than 90 days none; paging by `next`; throw / refuse named. **Seam test with the real calculations** (`R27`-style, last test of the file) is red by name: `calculations has not published ingestNotices`, until CALCULATIONS #9 merges and BOB CHANGEs me.

**Results.** Module: 143 tests, 142 pass, 1 red by name (the seam). format 0; coverage 27 of 27; words 0 failures; ownership 0 failures. **architecture: 1 failure, named: `imports calculations/index.mjs ... does not declare in uses`; BOB's edge (modules.json `notice-producers.uses` gains `calculations`), asked in J6.** Not run yet: the impact users (queue), after calculations merges.

**Platform check.** Not applicable: a read of two small lists, no new object work (R-FOUR's platform clause: no size, CPU or `waitUntil` involved).
Waiting on BOB: the answer to J6 and the `modules.json` edge.

## G55 · after B6 (read to the provider's shape)
Merged `tranche/T51` (the `calculations` edge is in; architecture 0). The earlier stand-in shape in J6 is replaced by BOB's published one: `ingestNotices({after = 0, limit, viewer}) → {ok, items: [{ingest, binding, state, rows_total, written_count, not_written_count, finished_at, stopped?: {reason, says}}], next}`. `#ingestNotices` (`index.mjs`) reads from `after` 0 every cycle (no cursor kept; order is by start, not finish), pages by `next` to 1,000, 90 days of `finished_at`; the subject is the ingest and its binding (no project, no `by`: the viewer is its member); a stop's `says` follows the sentence in the detail. Words `notice-producers.ingest.done` / `.stopped` (localize); row owed to the design: the same pair (T52).
Tests: `g55-ingest.test.mjs` (7), red on the base (no producer), green after, except the seam over the real calculations, red by name (`calculations has not published ingestNotices`) until CALCULATIONS #9 merges. Added a test that two cycles both read from 0.
Results: module 143 tests, 142 pass, 1 red by name (the seam). format 0, architecture 0, coverage 27/27, words 0, ownership 0 failures. Impact users: queue `noticed.test.mjs:288` is red for the same cause (`facts.failed` gains `calculations` while the real calculations lacks `ingestNotices`); it clears at calculations' merge (as `capture` did). Other impact users: store-door 6/6; control-plane and plane are not read by this producer.
Proposed requirement line (BOB writes): R28 (G55, K4562): FINDINGs `ingest-done` / `ingest-stopped`, one per ingest `calculations.ingestNotices` answers the viewer, keyed `FINDING::ingest-<state>::<ingest>`, told to the viewer alone while active; each cycle reads from the start, pages by `next` to 1,000, window 90 days of `finished_at`; `facts.ingest`; a failing read named `calculations` in `facts.failed`; Uses gain `calculations`.
Census ops owned: none changed.
Size (session_01CVXguWMv2q1pfSMTRFJZDM): test runs 8, module lines 1561

## J7 · COMPLETE

COMPLETE (G55, R28 proposed): ingest-done and ingest-stopped notices built to calculations' published ingestNotices shape (B6). Module 143 tests, 142 pass; the one red is the seam over the real calculations, red by name until CALCULATIONS #9 merges, and queue/noticed.test.mjs:288 for the same cause (facts.failed gains calculations). format, architecture, coverage 27/27, words, ownership: 0 failures. Rows owed to the design: notice-producers.ingest.done, notice-producers.ingest.stopped (localize). CHANGE me at calculations' merge and I re-run both. Details in my record.
Size (session_01CVXguWMv2q1pfSMTRFJZDM): test runs 8, module lines 1561

## Fix round 9 · NOTICE-PRODUCERS #17 (session_01EzbeHquecfUvWe3Ss9yqdi) · G135f · R29

Merged `tranche/T51`. R29 applied: `#readingsEnded` in `bio-plane/src/notice-producers/index.mjs` (new kind `reading-ended`; consts `READING_ENDED_*`, `READING_JOB_KIND`; `facts.reading_ended`; failures named `readings`; wired in `noticeItems`). Coded against `deps.readingsEnded({after, limit})` as plane merged it (`plane/pending.mjs` `readingsEnded`: `{ok, rows:[{sha, kind, state, why, written, skipped, owed, failed, ended_at, member}], next}`); I read the real contract, so the local implementation in the test is that shape.

**Choices (all inside R29's text).** Only rows of kind `reading` are told; states `finished`, `final` (ended in part, with its `why`), `refused`; `{read}` = `written`, `{total}` = written+skipped+owed+failed (the counted sentence only when total > 0); the document is `provenance.homeOf(sha)` (title as the viewer sees it, else the path's last part, else the sha); a row for another member, a machine or nobody makes none; the 90-day window reads `ended_at`; every cycle reads from the start.

**Failing-first.** `reading-ended.test.mjs` (R29, 8 tests): with the source stashed, red: `SyntaxError: ... does not provide an export named 'READING_ENDED_DAYS'` (0 pass, 1 fail file); with R29, green 8/8. `read.test.mjs` R1's facts line gained `reading_ended` (red 150/151 before, green after).

**Words owed (stand-ins by `localize`, rows for `later-ux.md`):** `notice-producers.reading.finished` ("{document} has been read."), `.finished.counted` ("{document} has been read: {read} of {total}."), `.partial` / `.partial.counted` ("{document} was read in part[: {read} of {total}]. {why}"), `.refused` ("{document} was not taken in: {why}"); the door reuses `notice-producers.index.open_the_document` (design row `notice.fetch.done.door` family). `{why}` is plane's `final_why` as given (a code such as PASSWORD_REQUIRED, or the refusal's limit text): the design should supply the member's words for it.

**Found in another module.** `queue`'s catalogue (`bio-plane/src/queuestate.mjs`, near the `fetch-done` / `ingest-done` entries, G61) does not name `reading-ended`: `test/m/queue/catalogue.test.mjs:242` (R1 G61) is red by name, and without the entry the opener's whole Queue is refused `NO_SUCH_KIND` (the text above those entries). Queue's job adds `"reading-ended"` there, class FINDING, "— LIVE: notice-producers R29".

**Tests.** `node --import ./test/platform-sqlite.mjs --test --test-force-exit test/m/notice-producers/`: 151 tests, 151 pass, 0 fail. Impact users (`impact.mjs origin/tranche/T51 HEAD`: queue, store-door, control-plane, plane): queue + store-door 286 tests, 285 pass, 1 fail (the catalogue line above). control-plane's seam section 11 is job 43's. Checks: format 0 failures; architecture 0; coverage 29 of 29 ids named, 0; words inline 0, 0 failures; ownership 0 failures (4 files).

Generated artifacts made stale: none.

Size (session_01EzbeHquecfUvWe3Ss9yqdi): test runs 9, module lines 1699

## J8 · COMPLETE

COMPLETE (NOTICE-PRODUCERS #17, fix round 9, G135f, R29). Details in my record's 'Fix round 9' section. R29 applied (#readingsEnded, kind reading-ended, facts.reading_ended, failures named 'readings'), coded against plane's merged readingsEnded shape. Failing-first reading-ended.test.mjs red (missing export) then 8/8 green; module 151/151; format/architecture/coverage/words/ownership 0 failures. NEEDS FROM YOU (smallest thing): queue's catalogue (queuestate.mjs, beside fetch-done/ingest-done) must name 'reading-ended' (FINDING, LIVE: notice-producers R29) or queue's catalogue.test.mjs:242 (R1 G61) stays red and the opener's whole Queue is refused NO_SUCH_KIND; queue's job adds it, I cannot. Words owed (localize stand-ins notice-producers.reading.finished/.finished.counted/.partial/.partial.counted/.refused) are in the record. Size (session_01EzbeHquecfUvWe3Ss9yqdi): test runs 9, module lines 1699
