# TESTS-SWEEP (S) — handoff

## 0. State now and next steps

**Lane** TESTS-SWEEP #1 (`session_018BhcechYohm1LHA7fup1fn`), branch `lane/tests-sweep` (at `bae2b6df`, tranche/T53's head at start), folder `build/plan/beta/tests-sweep/`. Started 2026-10-27 by BOB #320 (K5417, K5418 option A).

**Done:** takeover reading (CLAUDE.md, LANES §1-§2, MAP, `tests-rethink-T52.html`, K5258, K5313, K5339, K5343, K5418). `civicos-process` cloned. Baseline measured on the branch: words check 0 failures (`dev 322, unkeyed 1970`); fixtures check 89 failures (answer 4, stub 73, contract 12; accepted 366), in 28 test files, all under `bio-plane/test`.

**Next:**
1. DONE S2: census (`CENSUS.md`). Next: classify the regex assertions (`rx-files.txt`, 653 files) the same way A/B/C; then convert class A and the regex tests whose English is a `words.json` value.
2. Sort the 89 fixtures findings: mechanical (test-only) vs needing a module's judgment (listed for T53 jobs, P7).
3. Run each K5339/K5343 red once (`proc tests`), sort stale / real.
4. Extend the words check to refuse English in tests (the check lives in `civicos-process/checks/words.mjs`, outside this repo: needs BOB's word, listed in DECISIONS/questions below).
5. Full run of every touched module before the merge; verdict and module list to BOB.

**BOB's answers (BOB #320, to be recorded by #321):** (a) I write the words check change myself on branch `lane/tests-sweep` in civicos-process (`checks/words.mjs` plus its test under `checks/`), never on main; BOB merges it only after my bio sweep is green. (b) The fixtures check binds (K4993): clear every mechanical finding (stand-in re-pointed to the provider's published fixture or declaration); list each that needs a judgment (registerJob/owedLater stub with a "later" provider) by module and test file for that module's T53 job; never guess.

## Entries

### S1 · 2026-10-27 · takeover and baseline
Read; baseline counts above. Finding: most of the 89 fixtures findings are stubs of `registerJob`/`owedLater`/`keepLater` whose providers (store-assembly, control-plane) are marked "later"; clearing them is not mechanical, so they are likely a list for T53 jobs.

### S2 · 2026-10-27 · census
`census.mjs`, `classify.mjs`, `CENSUS.md`, `census-AB.json`, `rx-files.txt`. Assertion-position literals: A 31 (13 files, mechanical), B 135 (86 files, product source holds only English, so the module must give a key first: T53 job), C 782 (test data). Regex assertions: 653 files, unclassified. Finding: the sweep is mechanical only for class A and for regexes of words.json values; every test whose English lives only in product code needs its module's key first (rethink: "that module's job adds it").
