# BOB to legacy-tests (T17)

**Read** · handled J2

## B1 · START

Depth 2. Your entry is `build/plan/current.md`'s last section (legacy-tests; K420, K427, K457, K570, K572, K573): read it whole; it is your plan, in its order (the conversion first, then the scoped run, then the re-pins). Particular to this job:
- **Deleting.** Delete `covered` and `dead` suites (with helpers no remaining suite uses) from `build/plan/legacy-inventory.tsv`; for each `?`, run the module tests it names first and confirm they prove what it checks, else REPORT it as `convert`. Never delete a suite whose conversion entry (N390–N399) has not merged: check each against the tranche branch's job records (`build/jobs/T17/*.md` Completion sections name what each conversion carried and what it could not). A conversion that says it could not carry an assertion: keep that suite and REPORT it.
- **Moving.** The 49 `system` suites to `bio-plane/test/system/`; the legacy-ui `convert` suites (and their helpers) to `civicos-ui/test/release/`. Fix each moved file's relative imports; run each moved suite once from its new place.
- **Re-pins from T17's layers** (besides those in the entry): the 1.47.0 stamp (K579: the `row-census` fixture, `d470`'s row); the DEC-49 guard's family list gains `MEMBERSHIP_CHECKS`, and `aicredential`'s `NEVER_THE_STORES` exemption retires (K577); `test/gate-reads.test.mjs`'s UNGATED entry for `captureaccounts` moves to the gated reads (capture R69, K580; control-plane stamps `viewer` in layer 11); provenance's doorbell arm (K581) and case-authoring's re-pointed regions (N383) in the guard's floors; `test/d311-roster-affordances.test.mjs`:376, :381 get a `sourceconsent` drive now that N379 routes `sourcesOps`.
- **The DEC-49 guard's `inheritedVerdicts`** read 6 against a ceiling of 4 on CASE-AUTHORING #6's branch (`control-plane/index.mjs`:1680, `strength/index.mjs`:786, `run-productions/index.mjs`:513, `basis-versions/index.mjs`:675, :801, :828). Re-read on the merged tree; for each site that exceeds the ceiling, REPORT it with its owner (a module's verdict to fix), and re-pin the ceiling only for a site whose inheritance a requirement states.
- **tasks' renamed code (K606):** `test/task-fence.test.mjs`:151, :157, :198 assert `NOT_YOURS`; tasks now refuses `TASK_NOT_YOURS` (C-76.1): re-point, or retire the suite if `test/m/tasks/` covers it.
- **Scope (K570).** Before running anything, list from `git diff main...tranche/T17 --name-only` the old suites that read a changed file; run only those, in parallel chunks under ten minutes, the record pushed after each; the DEC-49 guard once at the end. Never the whole battery.
- Whatever T17's layers broke that is not yours, REPORT with its owner; do not re-anchor a suite on a module's internals (P7).

## B2 · ANSWER · re J2

Your reading, all four points (K612): bio-plane system suites to bio-plane/test/system/ with the helpers only they use; shared helpers stay and are imported from ../; the app.html and civicos-ui-subject suites to civicos-ui/test/release/ (K5); refusal-codes.test.mjs beside the other DEC-49 guard suites in bio-plane/test/system/, the guard staying where it is; probes and benchmarks move as classed, each run once from its new place at small size. Keep every moved path inside legacy-tests' paths (add any new directory to your record so I add it to modules.json at the close). The deletion push waits on Bob's approval in your session; I have asked him.

## B3 · ANSWER · re J3

Ruled (K616): C-120.1 and C-120.2's re-pointed wheres are awaiting stamp for T18; declare them in row-census' AWAITING_STAMP (with C-76.1's code, K606) and re-run it. The four you keep for REPORT stand as listed. Note: your context is past half the window; per JOB.md, finish your current step, note the next in your record, and post BLOCKED (context) when you reach it, and I will restart you.
