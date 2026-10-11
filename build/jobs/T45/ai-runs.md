# ai-runs (T45)

**Status** · session_01ULZuG3kMRdNRSj9XiCchYK · depth 2 · WORKING · handled B0

## J1 · QUESTION

R77's two new refusal codes need catalogue rows, and those rows live in `run-rules`' table (`bio-plane/src/run-rules/checks.mjs`, `AI_RUN_PLAN_CHECKS`, C-109; R46: "Its rows are held in run-rules' table (its R15)"; R35). `ai-runs` reads them by key and may not write that file. K2787's fold gave run-rules only R27 (the draft kinds), so its job (T45-10, running now, merging before me) has no entry for them.

1. **Rows.** `AI_RUN_REEXAM_NEEDS_RESPONSE` and `AI_RUN_REEXAM_OPEN` need rows in C-109 (next free numbers: C-109.13 and C-109.14; .8, .9, .12 are retired, .10, .11 taken). My best reading: BOB forwards a CHANGE to run-rules' job to add them to `AI_RUN_PLAN_CHECKS` (where `src/ai-runs/index.mjs open > is-airun-open-plan`), with translations BOB drafts (the UX stream's words owed, draft §10). Until they land I read them by key like the other plan rows; my tests for them will be red until run-rules merges and I merge `tranche/T45`.
2. **`AI_RUN_ORIGIN_UNKNOWN`.** That code already exists (C-22.25, run-rules R23 `originAllowed`, `RUN_ORIGINS` = [member, explore]); `originAllowed` refuses `reexamination`. My best reading: no run-rules change; in mode `plan`, `ai-runs` judges the origin itself (absent/`member` or `reexamination` admitted; any other, `explore` included, refused `AI_RUN_ORIGIN_UNKNOWN` with C-22.25's row, read by key); outside mode `plan`, `originAllowed` stands unchanged, so `reexamination` there is `AI_RUN_ORIGIN_UNKNOWN` too. Alternative: run-rules' `RUN_ORIGINS` gains `reexamination` (a run-rules R23 change); not needed.
3. **Order** (R77 "after R46's"): R46's refusals (incl. `AI_RUN_PLAN_NO_SEARCH`), then origin, then needs-response, then already-open, then R47's registered check (which receives `origin` and `response`). I read "R46's" as including R47's check being last ("applies last"), so R77's sit between `AI_RUN_PLAN_NO_SEARCH` and the registered check.

I carry on with the code on these readings.
