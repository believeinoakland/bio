# scheduler (T39)

**Status** · session_01D563oouGGZLMyLRRFhNngN · depth 2 · COMPLETE · handled B2

## J1 · REPORT

A flaw in `case-carriage` (R15), found while building R25; not fixed here (not my module).

With no evidence store or bucket bound, `copyBatch` answers `DOCUMENT_COPY_NO_STORE` before it stamps any try (`bio-plane/src/case-carriage/index.mjs:956-960`), so the queued rows keep `tried` null and `copyWake(now)` keeps answering `now` (`:1029-1045`). R25 asks `copyWake` afresh at every firing, so on such an instance with a member document queued the alarm is re-set to the firing instant after every firing: it spins until a store is bound. The plane binds `CAPTURES` today, so production is not affected; any deployment or test plane without it is.

Proposed fix (case-carriage's job, a requirement line in its R15): while no evidence store or bucket is bound, `copyWake` answers null (as `file-safety` R39 answers no scan wake with no scanner bound); the next `onCopyWork` notice or the instance's start re-reads it. Alternative, mine if you prefer it: the scheduler holds a `document-copy` wake at or before a tick that answered a refusal until the next `onCopyWork` call or start (as R22's scheduled-publish hold), which needs a sentence in R25. I built R25 to the letter meanwhile; no answer is needed for me to finish.

## J2 · COMPLETE

T39-15 (N806, K2333) applied, commit `01b8751a2a` on `job/T39/scheduler`.

**Reading set.** I measured the set mechanics §3 asks for at about 260 KB, under 300 KB, and read it whole myself: requirements (24 KB), layer 10's row, case-carriage's Purpose and R15–R17, the module's code (49 KB) and all of its tests (171 KB), K2333, K2343 and K2365. No workers were used.

**Applied.**
- **R25 / R5 / R2:** `document-copy` is last in `SCHEDULER_ORDER`, after `file-reputation`, and answers under key `doccopy`. `tick` is `copyBatch({})`, awaited. `due` and `wake` are both `copyWake(now)`, asked afresh at every firing, arm and start; anything that is not an instant in ms reads as none. A refusal (`DOCUMENT_COPY_NO_STORE`) is the tick's answer, and a throw is `{error}` (R3). No instant, interval or storage value is kept (R7, R18).
- **R9 / R17:** `listenTo` registers once with `caseCarriage.onCopyWork("scheduler", …)`. Each call runs `arm` at once, except inside a firing, where the firing's own reconcile stands (the same pattern as `onFileWork`). A refused registration is a start-up fault in `faults()` (R23).
- **schedulerOf:** the default owner is `caseCarriageOf(ctx)`, the host's one instance, which publication's factory builds earlier in the plane with the bucket. The notice is registered at construction. No plane change was needed.
- **Tests:** new `copies.test.mjs`, 13 tests: 9 against a stand-in and 3 against the real case-carriage, with `doc-clean` running for real (the copy is made, the failed-read retry follows case-carriage's own instant and is re-derived at start, and NO_STORE is passed through). I also brought `fixture.mjs` (a case-carriage stand-in and a `copies` switch), `registry.test.mjs` and `files.test.mjs` into line with the new last place in R5.

**Deferred:** none. J1's flaw is case-carriage's (B2/K2380: N816 in T40). R25 is built to the letter, with no hold.

**Found in other modules:**
- J1 (answered).
- `bio-plane/test/conclude-project.test.mjs` (in queue's `tests`) fails with `CREDENTIAL_IN_ADDRESS` (C-38.10). Its `memberadd` sends `token=` in the address. It fails identically on `tranche/T39` without my change, it is not on the plan's rule-3 list, and it is fixture-only: it needs `send` to lift the token into `Authorization`, as `scheduler/plane.test.mjs` does.

**Tests and checks run:**
- scheduler `test/m/scheduler/`: tests 122, pass 122, fail 0. This includes the Miniflare `plane.test.mjs`.
- users: tasks 102/0; queue 128/0, plus `conclude-project` 0/1 (pre-existing, above); instance-setup 130/0; plane 150/1, the accepted red `docket.test.mjs`:54 (K2377); `migrate-released` 1/0.
- `format: 139 modules, 138 requirements files; 0 failures`
- `architecture: 12 product files, 60 relative imports (0 naming no tracked file, not judged); 0 failures`
- `coverage: 1 modules, 25 of 25 live requirement ids named by a test; 0 failures`
- `ownership: 6 files changed by scheduler between tranche/T39 and HEAD; 0 failures`

**Generated artifacts:** none written. The plane bundle is staled by this source change (rule 3 (7): regenerated at the layer's close).

Size (session_01D563oouGGZLMyLRRFhNngN): test runs 12, module lines 741
