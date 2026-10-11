# docket (T45)

**Status** · session_01WJkNJBh3kNMavvSr8hujuE · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

Readings I am building on (carrying on meanwhile; none blocks me):
1. R6 outcome `summary`: a public `outcome` entry carries the summary *as filed* (the member's words, R1). `docketPrepare`'s `summary` is not read for an `outcome` entry (it stays the manager's words for every other kind, as today).
2. A record entry of kind `outcome` filed before T45 (no `outcome`/`summary`) and still pending: `docketPrepare` refuses it `DOCKET_OUTCOME_UNREADABLE` (R4 re-runs R1's checks on what it would sign, and R6 says a public `outcome` entry carries both); the member re-files it. Published pre-T45 `outcome` entries are untouched and read `outcome: null` in R14's `fields` (and in R3).
3. R28's row: docket holds no copy. It finds `COUNSEL_MATTER_NOT_PUBLISHED`'s row in publication's exported `*_CHECKS` table by code (whatever the export's name), and answers `{ok:false, reason, code, check, translation}` from it. Until publication (T45-17) merges, my R28 tests are red by that alone. R28 also covers `docketFile`'s take-back form (`takesBack`), being `docketFile`; `docketDecline` is not named and is untouched. In `docketPrepare` it sits right after `DOCKET_NOT_THE_MANAGER`, before `DOCKET_NO_GROUP_SLUG`.
4. R27: `docketPressureMarks` and `docketPressureOf` are services only, no new op (an op would move the pinned ops maps in affordances/plane/op-declarations). Success answers carry `ok: true` beside R27's fields; a mark's id `mark` is its row number, `after` a mark id.
5. `DOCKET_OUTCOME_UNREADABLE` is row C-129.29 (region `is-docket-form`); `DOCKET_VOCABULARIES` is unchanged (the outcome kinds exported as `OUTCOME_KINDS` only), so affordances' pinned vocabularies don't move.

## Completion (T45-18)

**Read.** Read whole: `build/requirements/docket.md`; the module's code (`index.mjs`, `checks.mjs`, `schema.mjs`, `feed.mjs`) and every test file under `bio-plane/test/m/docket/` (P20); `draft-T45-l8.md` §2 (and §5–§7 where they name docket); the plan's T45-18 entry, rule 4 and reconciliation R3, R8, R14; K2780, K2781, K2787. Read by me in the parts the entries touch: `project-roster` R21–R24, `publication` R78, `events` R28, R30. The rest of the reading set (over the 600 KB limit, K2700) was read whole by a helper in this session: the Public parts of record-grammar, signatures, record-core, membership, credentials, promotion, provenance, attestation, acquisition, entities, inquiry, reevaluation, case-grammar and case-tensions, digested against my entries (mechanics §17 (3)). Its finding: no service docket uses changed shape at T45.

**Entries applied** (readings J1, confirmed B2, K2829):
- **R1** an `outcome` record entry states `outcome: {kind: cure|harm_addressed, on}` (`on` a real calendar date no later than the filing's UTC day) and a `summary` (one paragraph, 1–600). These checks come after R1's form checks. Refusals: `DOCKET_OUTCOME_UNREADABLE` (new row C-129.29) and `DOCKET_NO_SUMMARY`. Any other kind stating an outcome is refused. The statement is recorded in two new columns `outcome_json` and `summary`; a store created earlier gains them at start through an idempotent `ALTER TABLE`. `docketOf` answers both for an outcome, null for one filed before T45. `docketOps` passes `outcome` and `summary` through.
- **R6** a placed outcome carries `outcome` and `summary` as filed; prepare's `summary` is not read for an outcome. A published pre-T45 outcome keeps its bytes and reads `outcome: null` in `fields` (R14, R24). A pending pre-T45 outcome is refused at prepare `DOCKET_OUTCOME_UNREADABLE`.
- **R26** every item carries `public: true`, and `audience: "public"` answers the same items.
- **R27** `docketPressureMarks({kind, after, limit})` and `docketPressureOf({entry, viewer})` are services with no op (J1 4). A viewer naming no member sees nothing. An unreadable table answers `DOCKET_UNREADABLE`.
- **R28** `docketFile` (its take-back form too), `docketPrepare` and `docketPost` refuse `COUNSEL_MATTER_NOT_PUBLISHED` with publication's row C-122.8, found by its code in publication's exported table; docket holds no copy. The check sits after the participant or manager check and before the slug and every form check. A scope read that throws is refused (fail closed). Edge `docket` → `project-roster` used (`projectRosterOf`).

**Own flaws fixed (P8).** `DOCKET_NO_SUMMARY`'s words (C-129.19) spoke only of a reaction; they are re-worded to cover an outcome's summary, and the row reads changed until the stamp (rule 4 (2)). Nothing deferred.

**Other modules (REPORT).** `answer-envelope` has 4 reds (its CHECK_FAMILIES totality tests) on `tranche/T45` itself after publication's merge; they are the same with and without this job's change, so they are not docket's. My new row C-129.29 joins family C-129, which answer-envelope's list already reaches through docket's file. `filings` 1, `affordances` 2, `control-plane` 3 and `plane` 2 reds are identical before and after this job.

**Tests and checks** (after merging `tranche/T45` @ B3):
- docket `node --test bio-plane/test/m/docket/`: 75 pass, 0 fail (new `t45.test.mjs`, 16 tests).
- Users of docket (public-read 158/0, network-notices 73/0, case-import 96/0, queue-producers 84/0, events 64/0, filings 69/1, affordances 224/2, control-plane 220/3, plane 194/2, answer-envelope 27/4): each identical with and without this job.
- `bio-plane/test/system/migrate-released.test.mjs` (plane's, as a user): 1 pass, 0 fail.
- `format`: 0 failures. `architecture docket`: 0 failures. `coverage docket`: 28 of 28 live ids. `ownership docket tranche/T45`: 0 failures.

Size (session_01WJkNJBh3kNMavvSr8hujuE): test runs 9, module lines 1637

## J2 · REPORT

Not docket's: answer-envelope has 4 reds (its CHECK_FAMILIES totality tests: R2/R7 K585, R7/R2 T37, R10/R11 T41, R12 T43) on tranche/T45 itself after publication's merge (K2833). They are identical with and without docket's change (checked on a clean tranche/T45 worktree). The likely cause is that answer-envelope's list does not yet reach publication's new row C-122.8. docket's new row C-129.29 is in docket's own file, which that list already reads.

## J3 · COMPLETE

T45-18 done; merged tranche/T45 @ B3. R1, R6, R26, R27, R28 applied as J1's readings (K2829); new row C-129.29 DOCKET_OUTCOME_UNREADABLE, and C-129.19 re-worded (both await the stamp). docket 75/0; the users' results are unchanged by this job; migrate-released 1/0; format, architecture, coverage (28/28) and ownership: 0 failures. No file outside docket's paths. Record: build/jobs/T45/docket.md (Completion).
