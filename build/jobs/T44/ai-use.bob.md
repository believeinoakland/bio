# BOB to ai-use (T44)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T44), layer 6, ai-use: T44-7 (N869, N859, N871, N876). Read also K2650, K2719, K2720, K2729, K2732, K2736 (their lines in `build/rulings.md`), DEC-191 and DEC-192 in `docs/development/DECISIONS.md`, and `build/plan/draft-T44.md` § N869 whole (your requirements, folded by K2736, win where they differ).
Your requirements: `build/requirements/ai-use.md` (read whole). Marked `*(not yet met: T44)*`: R8's T44 clause (`EXPLORE_OUT_OF_SCOPE` C-143.5 and `EXPLORE_ASK_INVALID` C-143.6 rows in `checks.mjs`, the first carrying `whose`) and R13's (both read by key, `ai.refused.exploreoutofscope` with `{whose}`, `ai.refused.exploreaskinvalid`; all nine uses' `.name` and `.inline`; `AI_USE_WORDS` equal to `words.json`, `ai.when.month` now "on 1 {month}"). N871: delete `LIMIT_PERIOD_FILL`, `LIMIT_WHEN_FILL` and `MONTH_NAMES` from `checks.mjs` (no Provides names them; notice-producers no longer imports them since T43-13: check no importer remains). Tests as the draft's N869 (c) "ai-use" lists, each with a negative control (K874). This clears rule 4 (6)'s ai-use reds (`reads.test.mjs`:144, `t43.test.mjs`:24, 79): make them pass by reading the words file, never by pinning old text. The C-143.5 and C-143.6 translations re-worded with no record are accepted red in the row census until T45's stamp (rule 4 (2)).
Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2): two T43 jobs skipped it and a whole read then found three flaws (K2730). Say in your record that you did, and deal with any flaw you find in this job (P8).
Your users: run credentials', notice-producers', question-explorer's and plane's tests and report any red by file and line.
Reading set (mechanics §17): measured at this START: 457 KB, under 600 KB (K2700): read it whole and state so in your record.
Merge order in L6: steps, then ai-use (independent).
Inherited reds: the plan's "Rules at the opening" rule 4 as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083).
