# ai-runs (T45)

**Status** · session_01ULZuG3kMRdNRSj9XiCchYK · depth 2 · WAITING ON BOB (J2) · handled B3

## J1 · QUESTION

R77's two new refusal codes need catalogue rows, and those rows live in `run-rules`' table (`bio-plane/src/run-rules/checks.mjs`, `AI_RUN_PLAN_CHECKS`, C-109; R46: "Its rows are held in run-rules' table (its R15)"; R35). `ai-runs` reads them by key and may not write that file. K2787's fold gave run-rules only R27 (the draft kinds), so its job (T45-10, running now, merging before me) has no entry for them.

1. **Rows.** `AI_RUN_REEXAM_NEEDS_RESPONSE` and `AI_RUN_REEXAM_OPEN` need rows in C-109 (next free numbers: C-109.13 and C-109.14; .8, .9, .12 are retired, .10, .11 taken). My best reading: BOB forwards a CHANGE to run-rules' job to add them to `AI_RUN_PLAN_CHECKS` (where `src/ai-runs/index.mjs open > is-airun-open-plan`), with translations BOB drafts (the UX stream's words owed, draft §10). Until they land I read them by key like the other plan rows; my tests for them will be red until run-rules merges and I merge `tranche/T45`.
2. **`AI_RUN_ORIGIN_UNKNOWN`.** That code already exists (C-22.25, run-rules R23 `originAllowed`, `RUN_ORIGINS` = [member, explore]); `originAllowed` refuses `reexamination`. My best reading: no run-rules change; in mode `plan`, `ai-runs` judges the origin itself (absent/`member` or `reexamination` admitted; any other, `explore` included, refused `AI_RUN_ORIGIN_UNKNOWN` with C-22.25's row, read by key); outside mode `plan`, `originAllowed` stands unchanged, so `reexamination` there is `AI_RUN_ORIGIN_UNKNOWN` too. Alternative: run-rules' `RUN_ORIGINS` gains `reexamination` (a run-rules R23 change); not needed.
3. **Order** (R77 "after R46's"): R46's refusals (incl. `AI_RUN_PLAN_NO_SEARCH`), then origin, then needs-response, then already-open, then R47's registered check (which receives `origin` and `response`). I read "R46's" as including R47's check being last ("applies last"), so R77's sit between `AI_RUN_PLAN_NO_SEARCH` and the registered check.

I carry on with the code on these readings.

## J2 · QUESTION

Replaces J1 (its point 2 changes: K231, "one code, one site", forbids `ai-runs` minting `AI_RUN_ORIGIN_UNKNOWN` itself).

R77 needs two things in `run-rules` (T45-10, running now, merging before me), which `ai-runs` may not write:

1. **R23, `originAllowed`, told the run's mode.** Proposed text: `originAllowed({origin, mode, investigateDeployable})`; in mode `plan` it admits `member` and `reexamination` only (any other origin, `explore` included, `AI_RUN_ORIGIN_UNKNOWN`, C-22.25, unchanged); outside mode `plan`, unchanged (`reexamination` is `AI_RUN_ORIGIN_UNKNOWN` there, since it is not in the list). Whether `RUN_ORIGINS` gains `reexamination` is run-rules' wording; its R23 test names the list.
2. **R15, two rows in `AI_RUN_PLAN_CHECKS`** (C-109; .8, .9, .12 retired, .10, .11 held): `AI_RUN_REEXAM_NEEDS_RESPONSE` C-109.13 and `AI_RUN_REEXAM_OPEN` C-109.14, each `where: 'src/ai-runs/index.mjs open > is-airun-open-reexam, reached from op=airunopen'`, translations BOB's (the UX stream's words owed, draft §10).

**Done on my branch on that reading:** `open` relays `originAllowed({origin, mode, investigateDeployable})` right after R46's region, then mints the two new codes in a new region `is-airun-open-reexam` (the second checked again just before the insert, no await between, one site); stores `response` (new additive column); `read` and `runFor` answer `response` on a re-examination run only; R47's check receives `origin` and `response`. The account and keep-away need no new code (credentials.accountFor with the project, then ai-use.useCheck) and now have a test arm. `rows.test.mjs` `MINTED` gains the two codes at .13 and .14.

**Proof:** with the two run-rules changes simulated locally (then reverted, not committed), my suite is 87/87. Without them, 7 tests are red (the five R77 tests, R35's rows, R39's sweep over them), so I cannot complete until run-rules' change is on `tranche/T45`. Please forward this to RUN-RULES as a CHANGE (or tell me another reading), and send me a CHANGE to merge when it lands.
