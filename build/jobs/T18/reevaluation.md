# reevaluation (T18)

**Status** · session_016zab9sf3ptyXgQqgWMhoeh · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied** (`build/plan/current.md` layer 7, reevaluation):
- **N406's share** (K598): `raise` answers `raised` at once and hands R8's listener calls to record-core's `afterCommit` (its R66), writing `listeners_failed` onto the answer it returned. The same is done for R8's other two tellers, `raiseNotices` (R14) and `sourceMoved` (R28), through one private `#tellAfterCommit`, so no listener is told of anything a rolled-back transaction or savepoint undid. Tested: a committing outer transaction (nobody told inside it, even after the inner savepoint commits; told once just after the outermost commit; `listeners_failed` on the same answer), a caller that refuses, a caller that throws, a savepoint rolled back under a committing outer (only the outer's raise told), and a rolled-back sweep and source move (no row, nobody told) against a committed one.
- **Converts:** `reevaluation` (R1–R7 at the interface; the old suite read source files): block 9's over-strictness arm (a `Severed` spelling reads `confirmed` with the confirmed wording byte-for-byte; the severed leg's edition facts equal a confirmed leg's; a withdrawn leg is never said to rest on its target), blocks 2, 5 and 8 (no composed scalar strength; the obligation, a raise and the recovery read write no row in any table). Blocks 1–6's lifecycle and edition arms were already proven by `obligation.test.mjs` and `raise.test.mjs`; block 7's viewer stamp is control-plane's; the CITED refusals and `op=affordances` are inquiry's and affordances'. `versionnotice` (R10, R11): every shape of the read (question, passage, the three refusals, member, owner, uninvited, bounded) is quiet across every table; the refusal family is C-80.1–.3, each translated; a newer version filed in a project the viewer was not invited to is out of that viewer's chain and named nowhere in its answer, while the project's owner is told. The certainty, candidate and chain_unread arms are content's `passageNotice` (its R29–R31) and stay with content's converts. Old suites not deleted (K619).
- **Re-point:** `checks.test.mjs` and `notice.test.mjs` import `VERSION_NOTICE_CHECKS` from content (`src/content/index.mjs`), no longer the catalogue.
- **N242's share** (7 unclassified outcomes): already met. The DEC-49 guard (`civicos-ui/check-refusal-codes.mjs`, run on this branch) names one unclassified outcome in the plane, `src/record-core/index.mjs`:970 (`registerGrammar`), and none in `src/reevaluation/` (`#choiceSubject` answers `{ok: true, who, r}`).
- No catalogue, store or `src/index.mjs` code moved or changed, so no row is `awaiting stamp`. No `not yet met` mark is newly met by this job.

**Deferred:** none.

**Found in other modules:**
- **inquiry** (its R42, "answers raise's answer whole"): `#raise` copies `listeners_failed` out of reevaluation's answer at the moment `raise` returns. Under N406 a raise made inside a transaction writes `listeners_failed` only after the outermost commit, so the copy misses it. `staled` runs inside content's transaction (its own comment says so), so in the plane a re-read's reply will not name a failed listener; `dispose` and `divide` raise after their own `transact`, and miss it too if a caller wraps them in one. The fix is inquiry's: carry the answer object itself (as promotion's `reopen` and case-authoring do) rather than its fields. The module tests stay green only because they call `staled` outside a transaction.
- **record-core**: `registerGrammar`'s answer `{ id, heldBy: g.module }` (`src/record-core/index.mjs`:970) is the DEC-49 guard's one unclassified outcome (ceiling 0).
- Generated artifacts: none made stale (no bundle takes reevaluation's files as input).

**Tests and checks:**
- `node --test bio-plane/test/m/reevaluation/`: tests 73, pass 73, fail 0.
- Users' tests (`raise`'s behaviour changed): publication 110 (108 pass, 0 fail, 2 skipped), case-authoring 69/69, conformance 46 pass 1 fail, monitoring 71 (65 pass, 0 fail), scheduler 48 (46 pass, 0 fail), queue-producers 28 (27 pass, 0 fail), control-plane 79 pass 1 fail. The two fails are the layer-6 close's known reds (conformance R10, K680; control-plane R36, K658); conformance's fails identically on `tranche/T18` without this change.
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs … reevaluation`: 0 failures. `checks/coverage.mjs … reevaluation`: 28 of 28 live requirement ids named by a test, 0 failures. `checks/ownership.mjs … reevaluation tranche/T18`: 7 files changed, legacy-store and legacy-checks 0 lines, 0 failures.

Size (session_016zab9sf3ptyXgQqgWMhoeh): test runs 12, module lines 1997

## J1 · REPORT

inquiry (its R42): #raise copies listeners_failed out of reevaluation's answer when raise returns. Under N406 a raise inside a transaction writes listeners_failed only after the outermost commit, so the copy misses it: staled runs inside content's transaction, so a re-read's reply never names a failed listener in the plane (dispose and divide too, if a caller wraps them in a transaction). Fix is inquiry's: carry raise's answer object itself, as promotion's reopen and case-authoring do. Also record-core: registerGrammar's answer (src/record-core/index.mjs:970) is the DEC-49 guard's one unclassified outcome. Details in my record, Completion.

## J2 · COMPLETE

Done: N406's share (raise, raiseNotices and sourceMoved tell R8's listeners through record-core's afterCommit; listeners_failed written onto the returned answer; tested with rolled-back callers and a savepoint rolled back under a committing outer); converts reevaluation and versionnotice at the interface; VERSION_NOTICE_CHECKS re-pointed to content; N242's share already met (no reevaluation outcome unclassified in the guard). Module tests 73/73; users' tests green but for the layer-6 known reds (conformance R10 K680, control-plane R36 K658); format, architecture, coverage (28/28), ownership: 0 failures. Nothing awaiting stamp; no artifact stale. Record: build/jobs/T18/reevaluation.md on job/T18/reevaluation.
