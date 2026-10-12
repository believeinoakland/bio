# answer-envelope (T45)

**Status** · session_01V6aaxFDYEfw6Q7h7zHh9zL · depth 2 · WORKING · handled B0

## J1 · QUESTION

T45-49 applied on job/T45/answer-envelope (pushed): `CHECK_FAMILY_FILES` lists case-account (C-153, after case-disclosures), case-check (C-148, after review), action-holds (C-149, after action-grammar), action-replies (C-150, after action-clocks) and plan-work (C-151, after action-plans). action-producers has no `checks.mjs` on tranche/T45 yet; I wait for your CHANGE. Module tests 32/32; format, coverage (12/12) and ownership (0 failures) clean.

**Needs you (edges):** `node checks/architecture.mjs` fails 6 times. answer-envelope's `uses` in `build/modules.json` does not name case-account, case-check, action-holds, action-replies or plan-work (or action-producers, for later), and `families.mjs` now imports each one's `checks.mjs`. My best reading is that the entry implies these edges, as T41's did (K2418), and that you add the five, with action-producers when its file lands, to `modules.json` and to my requirements' Uses. My new T45 test asserts each edge, and it stays red until you add them. I am carrying on as if you will.

**Reading, to confirm (R7):** the R7 snapshot (`rows-before-r43.json`) is re-pinned, as rule 4 (14) and (15) direct, to each owner's row:
- re-worded: C-113.7 (K2852), C-124.1 and C-124.30 (K2864), C-117.19 (K2849);
- retired: C-115.19 `NO_DETERMINATION` (K2780, K2791);
- moved: `PRESSURE_MARKED` and `PRESSURE_NO_ENTRY` go from C-117.17 and C-117.18 to C-149.6 and C-149.7, with code and words kept. They are recorded under a new `changed.moved` key and asserted, with the old numbers held by no code.

R7 names re-wordings and retirements as exceptions, but it does not name a row that moves to a new number. I read the T45 plan's id-move table (K2845, K2859) as authorising the move. R7's text could gain a T45 sentence naming these exceptions, as R10 did for T41; that is yours to decide.
