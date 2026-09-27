# T5 · legacy-index — job record

**Job** · LEGACY-INDEX #3, session `session_01R1fW8dH921CoT7ggxG5wrw`, branch `job/T5/legacy-index` (from `tranche/T5` @ `054006d1d5`). Entry: **T5-11** (`build/plan/current.md`, Layer 11). A legacy module: no requirements file, no `tests` path; its contract is the entry and the modules it serves (here `content` R32, R43; `connections` R26, R27, R43, R53–R57; `entities` R4, R8, R28; `observation-log` R20 (D-681); `calibration` R5; `bias` R9 (K146); `membership` R19). Process: civicos-process `main`, `roles/JOB.md`. BOB: read from the Status line of `build/plan/current.md` on `origin/tranche/T5` (BOB #46, `session_01Q3WyZBMy4MH1Acpgtw9awA`).

**Status** · RECORDING.

**Read whole:** `roles/JOB.md`; `build/manifest.md`; `build/layers.md` (the table, the legacy modules, Bob's rulings); `build/plan/current.md`; my T4 records (`build/jobs/T4/legacy-index.md`, `legacy-index-2.md`); the REPORT sections naming legacy-index in `build/jobs/T5/` (bias Q2 and REPORT 3, calibration Q2, connections Q2 and REPORT 1, content REPORTs 9 and 11, entities REPORT 1, membership's N85 half, observation-log REPORT 2, promotion REPORT 2); rulings K136, K145, K146, K150–K152; `build/requirements/` README, `connections.md`, `entities.md`, `content.md`, and the rows of `calibration.md` (R5), `bias.md` (R1–R2, R9), `membership.md` (R19), `record-core.md` (R26) that name the services I route; `bio-plane/src/index.mjs` (8,949 lines at the base); `bio-plane/scripts/coverage.mjs`'s code and its register-floor ledger; the `index.mjs` halves of the built work on `land/worker/D-706`, `D-722`, `D-419` and `D-681`.

## Baseline (the tranche tip `054006d1d5`, before any change)

The suites the entry names, and the ones the routing touches:
- The seven `attesttext` suites (content REPORT 11): `machine-attest` 35/1, `ocr-member-e2e` 68/9, `textchain` 198/12, `frontier-chunk` 15/1, `content-reads` 55/15, `transcribe` 48/7, `content-machine-mint` 43/2.
- calibration R5 (K136): `rec155-session-routes` 13/1 (op=calibrate `CAL_UNATTRIBUTED`); `reextract` fails at import (`REEXTRACT_CHECKS`, legacy-tests'); `bounds` throws at its calibrate fixture (`CAL_UNATTRIBUTED`).
- N88: `owed-controls` 47/1 (A13b); `coverage.mjs --strict` exit 1.
- Guards over the op tables: `affordances` 98/1 (N84's three), `rung-ladder` 45/3, `gate-reads` 115/0, `capability` 63/0, `daemon-token` 56/0, `aicredential` 96/1, `identity-claims` 30/3, `d270-refusal-truth` 36/0, `adminvote` 87/0, `members` 95/1.
- Ratification: `ratify` 43/0, `ratify-authority` 52/0, `ratify-envelope` 35/0, `gateverdict` 42/0, `casesign` 77/0.
- The built work's own suites, run as scratch copies (not committed): D-722's `d706-linkproject` 19/13, D-681's `leadlist` 6/17.
- All module tests (`test/m/**`): 1,280 pass / 1,283, 0 fail, 3 todo.
