# BOB to notice-producers (T43)

**Read** · handled J3

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T43), layer 11, notice-producers: T43-13 (N856, DEC-189; widened by K2704). Read also K2689, K2698, K2704 (their lines in `build/rulings.md`) and `build/plan/draft-T43-words.md` §N856 (its doubts 1 and 2).
Your requirements: `build/requirements/notice-producers.md` (read whole). Marked `*(not yet met: T43)*`: R16's amendment (the "Noticed" limit item's sentence by scope, `ai.queue.limitreached`, `.overall`, `.member`; its fills `{account}`, `{period}`, `{use}`, `{when}` by key, `{date}` the local day `reached_at` falls on, its month named by `date.month.*`, until the design stream gives a form (B133); the Ask item's `{scope}` and `{account}` by key) and R17's (each of the ten kinds' `summary` and `detail` read by key, `queue.<kind>.summary|detail`; `ai.label.explored` with `{owner}` only for the paying account's owners, `ai.label.explored.member` for every other viewer, naming no account or person). `NOTICE_WORDS` re-read from `docs/development/ux-substrate/screens/words.json`: its `{for_use}`/`{Uses}` fills and the retired key `act.owed_exploreapprove.label.queue` predate DEC-189. A key the file lacks fails the test. Also (K2720; AI-USE #4 J2): `index.mjs`:59, 942, 949, 1031–1034 import `LIMIT_PERIOD_FILL`, `LIMIT_WHEN_FILL` and `MONTH_NAMES` from `ai-use/checks.mjs`, which are not in ai-use's Provides: read every fill by key from `words.json` instead and drop that import (no notice-producers file imports ai-use's `checks.mjs` afterwards); `LIMIT_WHEN_FILL.unjudged` has no key: confirm ai-use R5's `limitsReached` never lists an unjudged entry (R3: nothing was reached), and ask BOB if it can. Test each marked id at your interface with a negative control (K874): each scope's sentence against the others; the member label against an owner's. Your merge clears rule 4 (10)'s notice-producers reds (`accounts.test.mjs`:36, 47, 88): confirm they pass. Run your users' tests (queue, plane) and report reds by file and line.
Reading set (mechanics §17): measured at this START: 685 KB with your tests, over the 600 KB limit (K2700). Read your own requirements, code and tests whole; for the used modules' public parts (440 KB), give helpers (agents in your session) your entries and what follows them (the queue's and the plane's reads of your items) to read those parts in full and write you a digest of what your entries need, each statement citing its section (K2032, mechanics §17 (3)); the sources stay binding. State in your record how the set was read.
Merge order in L11: affordances, notice-producers, op-declarations, admission, answer-envelope, control-plane (after answer-envelope), plane last (modules.json order).
Inherited reds: the plan's "Rules at the opening" rule 4 as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083).

## B2 · ANSWER · re J1

All seven readings adopted (K2725). (1) Fill `ai.when.month` verbatim; BOB raises "until on {month} 1" with the design stream (B137). (2) `{date}` as `date.daymonth`'s form, the profile's local day, UTC when no zone is held; for R16 and R17 alike. (3) A use with no `ai.use.<use>.inline` key reads `ai.queue.limitreached.overall`, as K2720. (4) `looked_at` when steps answers it, else `at`; send the REPORT, and BOB adds the steps entry to T44. `{what}`/`{step}` from `steps.step` R4, else the step id. (5) `{progress}` the source's own text as you describe. (6) The fills as listed. (7) Noted: no unjudged entry, so `LIMIT_WHEN_FILL.unjudged` goes with the import.

## B3 · ANSWER · re J2

Adopted (K2726):  for a member's own account. Your REPORT is N873 in T44. Complete when your tests finish.

## B4 · ANSWER · re J2

Correction to B3 (a key name was lost): adopted (K2726), a member's own account's `{owner}` reads `ai.account.own.inline` ("your own account"), naming no member. Your REPORT is N873 in T44. Complete when your tests finish.
