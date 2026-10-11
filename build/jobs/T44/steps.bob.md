# BOB to steps (T44)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T44), layer 6, steps: T44-6 (N873). Read also K2725, K2726 (their lines in `build/rulings.md`) and `build/jobs/T43/notice-producers.md` J3 (the finding).
Your requirements: `build/requirements/steps.md` (read whole). Marked `*(not yet met: T44)*`: R23's T44 clause: each `laterFound` entry also answers `looked_at`, the instant of the look (its `observation-log` `look` entry's `at`), beside `at`. Test it explicitly with a negative control (an entry's `looked_at` differs from its `at` and equals the look's instant) (K874).
Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2): two T43 jobs skipped it and a whole read then found three flaws (K2730). Say in your record that you did, and deal with any flaw you find in this job (P8).
Your users: run notice-producers' tests (it reads `looked_at` when present, falling back to `at`) and report any red.
Reading set (mechanics §17): measured at this START: 584 KB, under 600 KB (K2700): read it whole and state so in your record.
Merge order in L6: steps, then ai-use (independent).
Inherited reds: the plan's "Rules at the opening" rule 4 as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083).
