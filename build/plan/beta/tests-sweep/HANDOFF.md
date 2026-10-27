# TESTS-SWEEP (S) — handoff

## 0. State now and next steps

**Lane** TESTS-SWEEP #1 (`session_018BhcechYohm1LHA7fup1fn`), branch `lane/tests-sweep` (at `bae2b6df`, tranche/T53's head at start), folder `build/plan/beta/tests-sweep/`. Started 2026-10-27 by BOB #320 (K5417, K5418 option A).

**Done:** takeover reading (CLAUDE.md, LANES §1-§2, MAP, `tests-rethink-T52.html`, K5258, K5313, K5339, K5343, K5418). `civicos-process` cloned. Baseline measured on the branch: words check 0 failures (`dev 322, unkeyed 1970`); fixtures check 89 failures (answer 4, stub 73, contract 12; accepted 366), in 28 test files, all under `bio-plane/test`.

**Next (S9: all done but the successor's call on a second sweep):**
1. DONE S2: census (`CENSUS.md`). Next: classify the regex assertions (`rx-files.txt`, 653 files) the same way A/B/C; then convert class A and the regex tests whose English is a `words.json` value.
2. DONE S4 (`FIXTURES.md`).
3. Run each K5339/K5343 red once (`proc tests`), sort stale / real.
4. Extend the words check to refuse English in tests (the check lives in `civicos-process/checks/words.mjs`, outside this repo: needs BOB's word, listed in DECISIONS/questions below).
5. Full run of every touched module before the merge; verdict and module list to BOB.

**BOB's answers (BOB #320, to be recorded by #321):** (a) I write the words check change myself on branch `lane/tests-sweep` in civicos-process (`checks/words.mjs` plus its test under `checks/`), never on main; BOB merges it only after my bio sweep is green. (b) The fixtures check binds (K4993): clear every mechanical finding (stand-in re-pointed to the provider's published fixture or declaration); list each that needs a judgment (registerJob/owedLater stub with a "later" provider) by module and test file for that module's T53 job; never guess.

## Entries

### S1 · 2026-10-27 · takeover and baseline
Read; baseline counts above. Finding: most of the 89 fixtures findings are stubs of `registerJob`/`owedLater`/`keepLater` whose providers (store-assembly, control-plane) are marked "later"; clearing them is not mechanical, so they are likely a list for T53 jobs.

### S2 · 2026-10-27 · census
`census.mjs`, `classify.mjs`, `CENSUS.md`, `census-AB.json`, `rx-files.txt`. Assertion-position literals: A 31 (13 files, mechanical), B 135 (86 files, product source holds only English, so the module must give a key first: T53 job), C 782 (test data). Regex assertions: 653 files, unclassified. Finding: the sweep is mechanical only for class A and for regexes of words.json values; every test whose English lives only in product code needs its module's key first (rethink: "that module's job adds it").

### S3 · 2026-10-27 · first conversion
`newgroup/test/wizard.test.mjs` (module installer): 8 class A literals now read by key (`word`, plus a local `lead` for the text before a placeholder): 208/208 before and after; words check 0. Method: a literal maps to exactly one `words.json` key, the key's placeholders are filled with the test's own values, and the page is checked for the word's text as before (escaped with `h` only where the page escapes). Not yet done in class A: 5 literals with several matching keys (ai-use, escalation draft:94, leg-earning held:127, screens-action fix10, case-grammar complete, wizard-scripts t50 names) need the key the code reads: look at the product call, never guess. `walk-T51-final/scripts` is not a module test; skip.
Touched modules so far: installer (`newgroup/test/wizard.test.mjs`). Full `proc tests` run owed before the merge.

### S4 · 2026-10-27 · fixtures findings sorted (FIXTURES.md)
89 became 3. 86 were `contract-no-run`: markers named provider `plane`, the contract run lives in `store-assembly` now; markers re-pointed (comments only, 26 files), plus a marker in test-support's `job-registrar-stub.mjs`. 3 orphan `fixtures-run` lines in store-assembly's `r10-fixtures-run.test.mjs` (control-plane x2, screens-intake x1) are listed for T53 jobs. `tranche/T53` merged into the lane branch first (606 commits). Touched modules (comments only): acquisition, capture, doorbell, file-safety, monitoring, test-support. Full `proc tests` run still owed with the conversions.

### S5 · 2026-10-27 · regex assertions classified (CENSUS-RX.md)
`classify-rx.mjs`: A 972 sites in 452 files, B 1,054 in 450, C 1,123 in 534. Only 34 A sites equal one key's whole value (tool-convertible); 655 are fragments of longer values, so the key and its placeholders must be read from the product call (not mechanical). Finding for BOB: a full conversion of A and B is about 900 files, most needing a per-site reading or the module's key first; the words check must therefore refuse *new* English in tests (a ratchet: the files now holding English are a recorded baseline that only shrinks) rather than all English, or it cannot merge before T53's jobs finish. Recommendation sent to BOB; waiting on his word on the shape of the check before I write it.

### S9 · 2026-10-27 · verdict of the full run, reds sorted (REDS.md)
`proc tests --base origin/tranche/T53` on the 23 modules touched by S3-S6 (acquisition, bias, calculations, capture, case-authoring, doorbell, entities, escalation, file-safety, id-spaces, installer, instance-setup, intent, investigation, journey-check, leg-earning, money-checks, monitoring, observation-log, provenance, reading-pipeline, run-rules, test-support): **no new red**; installer (4, R33) and journey-check (22) show the identical lists at the tranche tip. S8's fix (following, answer-envelope, interface-shell: `plane/register.mjs` moved to `store-assembly/register.mjs`): the three modules, no new red (following 128/128, answer-envelope 48/52 and interface-shell 384/385 inherited). Of BOB's 23 reds, none could be proved stale except answer-envelope's and following's import (K5343); the others have product or stamp causes, in REDS.md.
**READY for BOB's merge:** the bio branch (comment-only fixtures markers, 26 regex + 8 literal conversions, baseline `build/tests-english-baseline.json`, 3 import paths). The civicos-process branch `lane/tests-sweep` (e106145) merges after it. Left for T53 jobs: FIXTURES.md (3), CONVERSION-ENTRIES.md, REDS.md.
