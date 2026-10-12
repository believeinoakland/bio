# ai-runs (T45)

**Status** · session_01ULZuG3kMRdNRSj9XiCchYK · depth 2 · COMPLETE · handled B4

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

## J3 · COMPLETE

**T45-11 applied on `job/T45/ai-runs`**, with `tranche/T45` merged after B4 (run-rules R28, K2825). Files: `bio-plane/src/ai-runs/index.mjs`, `bio-plane/src/ai-runs/schema.mjs`, `bio-plane/test/m/ai-runs/reexam.test.mjs` (new), `plan.test.mjs` (R47's argument gains `origin`, `response`), `rows.test.mjs` (`MINTED` gains C-109.13, .14). Nothing outside my paths.

**How the set was read (mechanics §17 (3), START B1):** I read whole: `build/requirements/ai-runs.md`; all of `src/ai-runs/` (`index.mjs` 3,299 lines, `schema.mjs`); `draft-T45-lower.md` §8 (and §1–§13 headings, §10–§11); K2780, K2781, K2787 (and K231, K2820, K2822 as they arose); the plan's T45 entries and Rules at the opening; run-rules' `originAllowed` and C-109 table. A helper in this session read in full all 16 files of `test/m/ai-runs/`, the public parts of run-rules, credentials, ai-use, membership, steps, promotion and record-core, `BIO_Action_v0_2.md` §4 (rule 16) and Capability Ladders §2, and wrote me a digest citing each source; the sources stay binding.

**Entries applied:**
- **R77.** `open` takes `response`.
  - The origin is relayed from `run-rules.originAllowed({origin, mode, investigateDeployable})`, right after R46's region. One site mints `AI_RUN_ORIGIN_UNKNOWN` (K231).
  - Then a new region `is-airun-open-reexam` mints `AI_RUN_REEXAM_NEEDS_RESPONSE` (no response, or a blank or non-string one) and `AI_RUN_REEXAM_OPEN` (a running plan-mode re-examination with the same plan and response).
  - The second refusal is built once and asked twice: in order, and again with no await before the insert, so two concurrent recording acts cannot both open a run.
  - `response` is a new additive column (`AI_RUNS_ADDED_COLUMNS`, migrated), stored trimmed and verbatim on a re-examination only. A response sent with any other run is not stored or answered.
  - `open`'s answer, `read`'s `session` and `runFor` carry `response` on a re-examination run only.
  - R47's check receives `origin` (`member` or `reexamination`) and `response` (null otherwise), still last.
  - The account and keep-away needed no new code: `credentials.accountFor` with the run's project (project account first, then the member's, then the group's), keep-away asked first, then `ai-use.useCheck`.
- **R46's exception clause.** A re-examination is refused `AI_RUN_PLAN_NEEDS_MEMBER` with no member actor. A machine stamp is refused earlier, at the project gate. The recording member is recorded as `principal_claude_ref`.
- **Tests** (`reexam.test.mjs`, each refusal with a control and nothing written; R77 is in every title):
  - the order after R46's;
  - outside plan mode;
  - stored and answered by `read` and `runFor`, with sight;
  - R47's arguments and a passed-on refusal;
  - the member-only start;
  - who pays: the member's account, then the project's own account once on, then `PROJECT_AI_KEPT_AWAY` relayed, then a lifted control.

**Own code:** read whole; no flaw needing a change found beyond R77. `open`'s `refusal` helper now reads a missing row as `check: null` rather than throwing.

**Deferred:** none.

**Other modules (REPORT-worthy, no action asked now):**
- `ai-runs.md` Status/Size lines still describe pre-split files (`store.mjs`, `airun.mjs`, …, "about 3,810 lines"); the module is now `index.mjs` + `schema.mjs`, 3,493 lines. That is BOB's text.
- The agent-worker bundle is stale after run-rules' R28 (its `requirements.test.mjs` R45 static/fresh checks fail). That is accepted red rule 4 (5), regenerated at layer close; ai-runs is not among its inputs.

**Tests and checks:**
- ai-runs `test/m/ai-runs/`: 87 pass, 0 fail. run-rules: 49 pass, 0 fail.
- Users of ai-runs:
  - run-productions 58/0, capture-requests 108/0, question-explorer 28/0, intent 82/0, case-account 21/0.
  - skills 103/2: the accepted red rule 4 (10), R28/R30 until T45-13.
  - agent-worker 13/1: the bundle red above.
- Checks, all 0 failures:
  - format (153 modules);
  - architecture (19 files, 71 imports);
  - coverage (47 of 47 ids);
  - ownership (6 files vs tranche/T45).

Size (session_01ULZuG3kMRdNRSj9XiCchYK): test runs 12, module lines 3493
