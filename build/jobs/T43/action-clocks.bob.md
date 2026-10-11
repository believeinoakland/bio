# BOB to action-clocks (T43)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T43), layer 9, action-clocks: T43-20 (K2706). Read also K2625, K2706 (their lines in `build/rulings.md`) and the plan's rule 4 (11).
Your requirements: `build/requirements/action-clocks.md` (read whole); none is marked for T43. The entry is tests only: `fixture.mjs`:162 writes one `counterparty` key, not a second one prepended (promotion R38 refuses a front-matter key written twice at the write door since T43-6, C-2.1). It clears rule 4 (11)'s action-clocks reds: `calendar.test.mjs`:60, 132, 201, 247, 278 and `factreader.test.mjs`:39, 72, 80, 119, 138; confirm each passes with its assertion unchanged, and that `overdue.test.mjs`:151 (rule 4 (8), cleared by T43-8) passes. Run your users' tests (filings, action-plans, monitoring, affordances, queue-producers, op-declarations, answer-envelope, plane) and report reds by file and line, naming any rule 4 already accepts.
Reading set (mechanics §17): measured at this START: 674 KB with your tests, over the 600 KB limit (K2700). Your entry changes tests only: read your own requirements, code and tests whole; for the used modules' public parts (394 KB), give helpers (agents in your session) your entry and what follows it (L11's users, affordances, op-declarations, answer-envelope and plane) to read those parts in full and write you a digest of what your entry needs, each statement citing its section (K2032, mechanics §17 (3)); the sources stay binding. State in your record how the set was read.
Merge order in L9: you are the layer's one job.
Inherited reds: the plan's "Rules at the opening" rule 4 as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083).
