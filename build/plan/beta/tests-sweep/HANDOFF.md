# TESTS-SWEEP (S) — handoff

## 0. State now and next steps

**Lane** TESTS-SWEEP #1 (`session_018BhcechYohm1LHA7fup1fn`), branch `lane/tests-sweep` (at `bae2b6df`, tranche/T53's head at start), folder `build/plan/beta/tests-sweep/`. Started 2026-10-27 by BOB #320 (K5417, K5418 option A).

**Done:** takeover reading (CLAUDE.md, LANES §1-§2, MAP, `tests-rethink-T52.html`, K5258, K5313, K5339, K5343, K5418). `civicos-process` cloned. Baseline measured on the branch: words check 0 failures (`dev 322, unkeyed 1970`); fixtures check 89 failures (answer 4, stub 73, contract 12; accepted 366), in 28 test files, all under `bio-plane/test`.

**Next:**
1. Census of tests that assert English (the rethink counted at least 265 of 3,069 files; the words check's `testcopy` arm finds none because it only matches substrings of `words.json`). Write the finder as a tool under this folder; list by module.
2. Sort the 89 fixtures findings: mechanical (test-only) vs needing a module's judgment (listed for T53 jobs, P7).
3. Run each K5339/K5343 red once (`proc tests`), sort stale / real.
4. Extend the words check to refuse English in tests (the check lives in `civicos-process/checks/words.mjs`, outside this repo: needs BOB's word, listed in DECISIONS/questions below).
5. Full run of every touched module before the merge; verdict and module list to BOB.

**Open for BOB (no Bob decision yet):** (a) the words check is in `civicos-process`, not the bio repo; who changes it and how (PROCESS owner or this lane via a civicos-process branch)? (b) the fixtures check is DRAFT (K4993 (2)), not run by `checks/run.mjs`; do the 89 findings bind?

## Entries

### S1 · 2026-10-27 · takeover and baseline
Read; baseline counts above. Finding: most of the 89 fixtures findings are stubs of `registerJob`/`owedLater`/`keepLater` whose providers (store-assembly, control-plane) are marked "later"; clearing them is not mechanical, so they are likely a list for T53 jobs.
