# public-read (T50)

**Status** · session_01AwdRj3H21ktEZnLTXx3okd · depth 2 · WAITING ON BOB (J1) · handled B1

## J1 · QUESTION

QUESTION (R37, the data of "Corrections and orders"): `publishedCase` is synchronous and its callers (ratification, filings, case-checker, tests) rely on that, but R37 says to read `docket`'s public answer, and `docket.docketPublic` is `async`, so I cannot read its entries inside `publishedCase`. `docket`'s synchronous reads do not cover R37: `lastEntryOf` answers only the newest date; `withdrawalOf({case, edition})` and `courtOrdersOf({case})` are synchronous and carry `date`, but no synchronous docket service answers the case's `edition`-kind entries (R6 kind `edition`) with their dates.

Best reading, which I recommend (docket is another module, so it is BOB's to change): `docket` provides one synchronous, viewer-free, capture-free service, e.g. `correctionsOf({case, after})`, answering `{entries: [{seq, kind, date}]}` of the case's public entries of kind `edition`, `withdrawal` or `court-order` whose `date` is after `after` (null when the case has no ratified edition, like `docketPublic`). I would then fill `corrections` from it inside `publishedCase`, count and newest by (date, seq), and answer `{count: null, last: null, undetermined: true}` when the service is absent, throws or answers null for a case the projection holds.

Alternative if docket must stay unchanged: I add `corrections` only to the `publishedcase` op's answer (awaiting `docketPublic({captures: "omit"})` in `publicReadOps`), and `publishedCase()` the method does not carry it. That deviates from R37's "`publishedCase` also answers".

I am building R36 and the words work (plan rule 6) meanwhile, and will leave R37 until you answer.

## Completion (PUBLIC-READ #23)

**Entry applied:** T50-71 (N933; DEC-310 (5), (6); K3635, K3698, K3725). R36 and R37 met; every other requirement still met.
- **R36.** `groupFields({project})` answers `matter_stake` (`project-roster.projectStake`, `{stake, set_by, set_at, source: "project"}`; null with no project or a none stake; `"undetermined"` when unread, never null); `publishedCase`'s `group_fields` is read for the edition's publishing project; `inbandQuartet` is unchanged (the group rides outside `hash`). New dep `roster` (default `projectRosterOf(host)`). Tests: `matter-stake.test.mjs` (4 tests naming R36); the R34 arms read the new key.
- **R37 (as K3725 words it).** `publishedCaseWithCorrections` is the `publishedcase` op's handler; the synchronous `publishedCase` method does not carry `corrections`. Count and newest by (date, seq) of the docket's `edition`, `withdrawal`, `court-order` entries dated after the answered edition's `published_at` day; `{count: null, last: null, undetermined: true}` when the docket cannot be read; a bundle in no case answers `corrections: null`, so both branches keep one key set. Tests: `corrections.test.mjs` (4 tests). Fixture: `w.read("publishedcase")` stays the synchronous method, `w.readOp` is the op.
- **Plan rule 6.** The 39 keys `words-reads.json` lists for `public-read` are read through `word(key)`: the 13 refusal rows, the court-order sentence, the credit page's two lines, the case-file reasons, and the group-fields, lens, criteria, calculation, timeline, bar, blocks and tensions sentences. Tests that compared English read the key (`dec149`, `checks`, `credit`, `public-reads`). "team", "labeled" and "Neighborhood" now come from the design's words.

**Readings I built on:** (1) "after the edition's `published_at`" compares by day (docket dates are `YYYY-MM-DD`), so an entry dated the day of publication does not count. (2) A case the docket answers null for, or an edition with no `published_at`, is undetermined.

**Found in other modules (REPORT):**
- `plane` `test/m/plane/worker.test.mjs` R40 expects `groupFields()` to have exactly the six R34 keys; it now has `matter_stake` too (red after this job; fix at plane's job).
- `docket` and `screens-publish`: the op is now asynchronous in `publicReadOps`; any caller of the store's `publishedcase` op that read it synchronously must await it (the Worker door already does).
- The installer copies `CIVICSMITH_DESCRIPTION` and `CIVICSMITH_WHO` with a test of equality; they now read "teams" and "Neighborhood" (design's keys).
- For the design lane (a sentence no key holds, left as English): `publishedCase`'s `bar_detail` when a bar is recorded ("the standard of evidence this case was held to …"), `case_detail`, `graph_detail`, the loose-bundle `detail`, the manifest's `production`, `altitudes` and `detail`, `tensions`/`blocks` "no signed case document…/not a case" lines. `words-reads.json` lists most as unkeyed (builders' text); the bar sentence is in neither list.

**Deferred:** none.

**Tests and checks:**
- `node --test bio-plane/test/m/public-read/`: 206 pass, 0 fail.
- Users: network-notices 73/73, ratification 245/245, publication 150/150, control-plane 292/292, plane 247/249 (R40 above and R5/R9/R45, a base red), filings 107/110 and case-checker 83/85 (the same reds on the tranche base).
- `format` 0 failures; `architecture public-read` 0 failures; `coverage public-read` 37 of 37 live ids named, 0 failures; `ownership public-read tranche/T50` 0 failures; `checks/run.mjs`: architecture 0 failures (coverage failures are other modules' not-yet-met ids).

Size (session_01AwdRj3H21ktEZnLTXx3okd): test runs 12, module lines 3685
