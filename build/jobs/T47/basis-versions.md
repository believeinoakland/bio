# basis-versions (T47)

**Status** · session_01AcLstPtmnnzTXdMVgnyvmU · depth 2 · COMPLETE · handled B2

## Completion

**Entry applied.** T47-18 (N974): R50, `projectQuestionsFor({project, after, limit, viewer})` and its `op=projectquestions` arm in `basisVersionsOps` (`bio-plane/src/basis-versions/index.mjs`). It answers `{ok: true, project, items: [], cursor: null}` alike for an unseen, absent or non-project id, an empty id and an unstamped viewer (membership R80 `inSight`, R33). Otherwise it answers R41's page less each inquiry the viewer may not see (left out unannounced and uncounted), each item with `title` from record-core R34 `bundleInfo`, and R41's cursor. It writes nothing and never throws. R41 is unchanged and stays viewer-free.

**Tests.** New `test/m/basis-versions/project-questions-for.test.mjs` (5 tests, each naming R50): the filtered page and title; R41's cursor, a short page, a wholly unseen page with a cursor and paging to the end without a skip; the alike empty answers with controls; the op's stamp and query reading; writes nothing and never throws. `acts.test.mjs`'s op-map key list now includes `projectquestions`, the op R50 adds. No assertion was weakened.

**Reading set (mechanics §17).** I read these whole: `build/requirements/basis-versions.md`, `src/basis-versions/index.mjs` (the file changed), the fixture, `reads.test.mjs`'s R41 tests, `acts.test.mjs`'s ops test, and two sight tests. For the used services I read membership R80 and record-core R34 (and their code). I read none of the following, and the change touches none of them: `grammar.mjs`, `checks.mjs`, `text.mjs`, `schema.mjs`, or the module's other tests. So P20's whole read of the module's own code was not done in this job. I used no helper digests. I found no flaw in what I read.

**Deferred.** None.

**Found in other modules.** None. R50's declaration, grade, route and help belong to `op-declarations`, `op-grades` (T47-48), `control-plane` and `affordances`, as the requirement's T47 note says. No test there names `projectquestions` yet.

**Tests and checks run.**
- `node --test bio-plane/test/m/basis-versions/`: tests 150, pass 150, fail 0.
- `plane`, `op-declarations`, `op-grades`, `control-plane` and `affordances` tests: tests 945, pass 930, fail 15. These are the same 15 failing tests (the same names) as on the base without this change, and none of them mentions `projectquestions`. They are inherited reds.
- `checks/format.mjs`: 0 failures.
- `checks/architecture.mjs … basis-versions`: 0 failures.
- `checks/coverage.mjs … basis-versions`: 47 of 47 live ids named, 0 failures.
- `checks/ownership.mjs … basis-versions tranche/T47`: 0 failures.
- `checks/run.mjs`: architecture 0 failures; coverage reports 43 failures across the product, none of them this module's.

Size (session_01AcLstPtmnnzTXdMVgnyvmU): test runs 7, module lines 3786

## J1 · COMPLETE

T47-18 applied: R50 projectQuestionsFor / op=projectquestions, with 5 new R50 tests. basis-versions suite: 150 pass, 0 fail. format, architecture, coverage (47/47) and ownership checks: 0 failures. Neighbouring op suites show the same 15 inherited reds as on the base. Record notes that P20's whole read of grammar/checks/text/schema was not done (untouched by this job). Details in my record.

## B2 · CHANGE: P20's whole read, completed

**How the set was read (mechanics §17).** I read every source file of the module whole: `index.mjs` (in the first pass), `grammar.mjs`, `checks.mjs`, `text.mjs` and `schema.mjs`. I had also read `fixture.mjs`, `project-discoverable.test.mjs` and my own `project-questions-for.test.mjs` whole. Two helpers in this session, each given the entry and the requirements, read the other 20 test files in full (helper A: versionstate, versions, conclude, grammar, conclude-project, reads, acts, 1,808 lines; helper B: the other 13, 1,849 lines). Each wrote me a digest citing file and line. The sources stay binding.

**Flaw fixed (P8).** In `projectQuestions` (R41), a `basisFor` that threw partway through a page was caught around the whole loop. The answer was then a page cut short with `cursor: null`, which a caller, R50 included, reads as the last page. Now a read that throws reads as one that answered no leg, which is how a not-ok answer was already read. The page and its cursor stay whole. A test in `reads.test.mjs` R41 shows it. `project-stage` (R41's user) tests: 23 pass, 0 fail, as before.

**Tests strengthened where they checked less than their titles say (no assertion weakened):**
- `grammar.test.mjs` R35 now covers C-25.35 (`BAD_BIAS_APPLIED`, in `CONCLUDE_ACT_CHECKS`) and C-27.15. Its title said C-25.1–C-25.34. R35 and R36's catalogue sweeps now include `CONCLUDE_ACT_CHECKS` and `VERSION_KIND_CHECKS`.
- `versions.test.mjs`: new R6 test for a stored composition that has no `leg_capture` line, run through promotions. It covers the first re-projection storing the pin, the legacy form still frozen against other changes, and a stored pin frozen.
- `machine-passage.test.mjs`: new R49 test. A blank author is asked (fail closed), a replay is not asked, a member's raw promote accepting a machine version is asked as `versionAccept`, and there is a control.
- `narrow.test.mjs`: R25's content-level absence (read, nothing inside), and R26's boilerplate descriptions as `NARROW_NO_DESCRIPTION`.
- `conclude.test.mjs` R16: the 500-character bounds on commentary and conclusion, and a backslash in a falsifier.
- `acts.test.mjs` R31: an unused variable removed. Project A's bytes are now checked unmoved after B's act.
- `promote.test.mjs`: two lines of dead code removed.
- `checks.mjs`: two stale comments corrected (a "precedent above" that is not in this file, and a paragraph on the retired coverage script).

**Left as they stand, with why:**
- R16's `NO_DOCUMENT` arm is still untested. It needs a held bundle with no `bundle.md`, which no promotion through the module's uses can produce. This is a defensive branch.
- Some refusal tests check by reason only, and some headers cite retired file names as provenance. This is harmless.
- `grammar.mjs` reports a malformed version name under `VERSION_NAME_NOT_UNIQUE`. C-25.2 (R1) covers both conditions, so the code is kept.
- R41's `limit` 0 reads as the default (500), per the existing test and connections R42's reading, where "clamped to 1–500" could also be read as 1. It is met as tested. A wording ruling is BOB's if wanted.

**For BOB (requirements, not code).** R49's accept arm keys on the version row's own `author` field. R28's documented `appendVersion` call lists no `author` in `version`, so a caller following R28 literally would write a machine version that R49's accept arm never asks about. Today's caller, `run-productions` (its `index.mjs:534`), passes `version.author`, so nothing is broken. R28's signature could name `author` in `version`. That is a requirement change, so I left the code as is.

**Tests and checks run.**
- `node --test bio-plane/test/m/basis-versions/`: tests 152, pass 152, fail 0.
- `project-stage` tests: 23 pass, 0 fail.
- `format`, `architecture` and `ownership` checks: 0 failures.
- `coverage`: 47 of 47 live ids named, 0 failures.

Size (session_01AcLstPtmnnzTXdMVgnyvmU): test runs 14, module lines 3789
