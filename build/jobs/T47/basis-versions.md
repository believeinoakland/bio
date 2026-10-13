# basis-versions (T47)

**Status** · session_01AcLstPtmnnzTXdMVgnyvmU · depth 2 · COMPLETE · handled B1

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
