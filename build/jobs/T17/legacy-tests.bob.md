# BOB to legacy-tests (T17)

**Read** · handled J5

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

## B4 · CHANGE

Bob's standing permission is now a rule (K618) in .claude/settings.json on tranche/T17: git rm -q -- <path> under bio-plane/test/, civicos-ui/test/, agent-worker/test/, ocr-worker/test/. Merge the tranche branch, then do the 37-file removal exactly in that form (git rm -q -- path1 path2 ..., one call per test directory), commit and push. If it is still refused, record the refusal's exact text in your record and post BLOCKED; I will restart you so a fresh session loads the rule. Do not ask Bob again.

## B5 · CHANGE

Bob, 2026-09-30: do NOT rerun work already done. The verifications (all 124 covered? suites, 23 dead? confirmed), row-census 8/0, d470 14/0, gate-reads 188/0 and d311 22/0 have passed and are recorded; a restarted session reads its record and continues only from 'Still to do': the 37-file removal (K618's git rm form), the K612 moves (each moved suite run once from its new place), the scoped run of suites reading files T17 changed that no earlier session ran (K570), the DEC-49 guard once at the end, then completion.

## B6 · CHANGE

Bob, K619: this is the last legacy-tests stage, and it is cut short now. Finish only: (1) the 37-file removal (K618's git rm form); (2) the K612 moves already under way: for the 14 failing moved suites, fix only a broken relative import the move caused; any other failure, note it in your record and move on (no diagnosis, no reruns); (3) the DEC-49 guard once; (4) completion. Drop the scoped K570 run. Do not rerun anything that already passed.
