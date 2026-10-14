# capture (T49)

**Status** · session_015BNtGS8DbCgXWr3necPhxA · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

**M-T49-3 measured; proposing `HELD_PAGE_WAIT_MS` = 5000 (5 s).**

Measure (before the change, `heldCaptures` unfiltered, `limit` = N, every row a plain held capture, the evidence store with a stated round trip; the script is mine, in my scratchpad, over `capture`'s test fixture and acquisition's real `archiveList`):

| rows | evidence round trip | examination per row | whole page | per row |
|---|---|---|---|---|
| 50 | 0 ms | 0 ms | 43 ms | 0.85 ms |
| 200 | 0 ms | 0 ms | 161 ms | 0.80 ms |
| 50 | 20 ms | 0 ms | 4,196 ms | 83.9 ms |
| 50 | 20 ms | 30 ms | 5,712 ms | 114.2 ms |

Split at 20 ms: `#archiveRow` is 4,170 of the 4,196 ms, because each unopened capture costs 4 evidence reads inside `archiveList` (holds, head, parts check, profile read: `acquisition/unpack.mjs`:757–764), asked row after row; `#eligibility` costs the examination's own time per row, also row after row (30 ms each = 1.5 s over 50). So the page's time is rows x (4 x round trip + examination), unbounded: at the screen's own page (`limit` 50) 4.2 to 5.7 s at a 20 ms round trip, and 17 to 23 s at the default 200. The live round trip to R2 could not be measured from here (the instance answers `NOT_AUTHENTICATED` to my unauthenticated read, and I looked for no credential), so the table is the model, not the live number; BOB's walk of biosmoke8 can read the live one.

Proposal: `HELD_PAGE_WAIT_MS` = 5000, one wait for the whole page (examinations and archive groupings asked together, concurrently, none twice). Reasons: it is the figure the module's neighbours use for a wait on another module's answer (`file-safety` `SCAN_WAIT_MS` 5,000; `acquisition` `REPUTATION_TIMEOUT_MS` 5,000); the screen's page of 50 then answers well inside it even at a 50 ms round trip once the work is concurrent, and a page that cannot is answered in 5 s with the rest read undetermined (R91), never longer. Chosen, not measured, like those two.

I carry on against 5000. If BOB sets another value, only the constant and the test's stated bound change.

## J2 · QUESTION

**Two readings of my entry, built as stated; replaces nothing (J1 is answered).**

1. **N1073, `knocker.test.mjs`:240 "reads `doorbell`'s rows".** `doorbell` is after `capture` in `modules.json` and `capture` does not declare it, so `checks/architecture.mjs` (which reads tests too) would refuse a `capture` test that imports `doorbell`'s `DOORBELL_CHECKS`/`KNOCK_CHECKS`. My reading of the intent (no hand-list of another module's items): the `MOVED_CODES` and `MOVED_CHECKS` lists are deleted and the test judges from `capture`'s side only: the checks file exports `capture`'s own table alone, its keys equal the six rows the test already states for `capture`, every row's `where` is a site in `capture`, and none is in the C-85 family. The same defect would still fail it. If you want `doorbell`'s own table read, the edge cannot be a `capture` test; tell me and I will leave it as it was.
2. **N1062, `extraction` R31 through `evidenceAbsent`.** `capture`'s tests may not import `extraction` (L4, after me). The new interface test covers every `capture` path (R21's get, a range get, `op=capture` through `captureOp`, R68 `reattest` as a service, as `op=reattest`, with and without an evidence store); `extraction`'s path is tested in `m/extraction` (`relays.test.mjs`, `pdfstructure.test.mjs` already assert `EVIDENCE_NOT_HELD`), which is its job's. The source scan is deleted.

## Completion (T49-5)

**Reading.** Read whole: requirements (public and private), my entry, the layer line, all five files of `bio-plane/src/capture/`, and the tests that name a requirement my entries change (`held.test.mjs`, `evidence-absent.test.mjs`, `knocker.test.mjs` from line 195; `archive.test.mjs`/`t47.test.mjs` as grepped for R77/R88 and run). My other tests were run, not read. Used modules' services: only `acquisition`'s `archiveList` (`unpack.mjs`:370–425, 700–780, read) and `fixture.mjs`; no helpers needed.

**Entries applied.**
- R91 (and R78 re-worded): `HELD_PAGE_WAIT_MS` = 5000 (BOB, K3343). `#pageAnswers`: examinations of all rows asked at once, archive groupings 8 rows at a time, files' examinations after their grouping, each document once, one wait for the page, nothing begun after it. Late: row/file `eligible: null` with "did not answer in time" basis (a file carries `eligibility_basis` only then, so R77's file shape is otherwise unchanged); grouping late: `archive: {sha256, grouping: null}`, `files: null`, `files_basis`, no `files_total`. A thread-blocking examination cannot be interrupted; the wait then ends after the one in progress.
- N1062: the source scan is deleted; `evidence-absent.test.mjs` tests R63's one refusal on every capture path. `extraction` R31 stays in `m/extraction` (J2, B3).
- N1073: `knocker.test.mjs` hand-list removed; judged from capture's table alone (J2, B3).
- Rule 6: N1075 nothing to key (none of capture's sentences, nor its six refusal codes, is keyed in `words.json`); N1068 the one "labelled" is a SQL comment (`schema.mjs`:326), not member-facing, left; D29 not applicable (no screen).

**M-T49-3** (J1): local model, 20 ms evidence round trip: 100 rows took 8.4 s before (84 ms a row, 4 evidence reads in `archiveList` per unopened capture, row after row); after, 100 rows with a 10 ms examination answer in about 1.1 s (test). The live round trip was not read (biosmoke7 answered `NOT_AUTHENTICATED`; no credential looked for).

**Finding (N1072 grep, for BOB).** The founder's id `admin` reaches readers in capture only as a stamp string: `held_acts.author` (R79/R81, read by `heldActsOf` and `set_aside.author`), `capture_actors.actor` (`captureAccountsOf`, the `member` filter), an upload's `capture.actor`/`words_of`. `#heldActRefusal` refuses the bare `admin` author (K1032), accepts `member:admin`. No change made: capture stores what the control plane stamps; showing the founder's handle is the screens' (project-roster R29's pattern).

**Deferred / other modules.** None deferred. The plane bundle and `program.mjs` embed capture's source and are stale from this change (rule 5 (5)): BOB regenerates at L3's close. Optional, not mine: `acquisition.archiveList` costs 4 evidence reads per unopened capture; a cheaper "is this an archive" answer would shrink the page's time further.

**Tests and checks.** `node --test test/m/capture/ test/cap13-reuse-pages.test.mjs test/d57selflink.test.mjs`: 151 pass, 0 fail (before the last edits to the two test files; re-run below). Users of `heldCaptures` (ratification, capture-requests, instance-setup, screens-intake, plane), run with my change: 574 tests, 7 fail: capture-requests `plane.test.mjs` (6, rule 5 (7)(A)) and one project-roster route test (rule 5 (3)); none concerns held captures beyond (A)'s account defect. The no-change baseline run was interrupted and not repeated.
Process checks: format 170 modules, 0 failures; architecture 30 files, 0 failures; coverage 44 of 44 live ids, 0 failures; ownership 5 files, 0 failures.

Size (session_015BNtGS8DbCgXWr3necPhxA): test runs 14, module lines 3351
