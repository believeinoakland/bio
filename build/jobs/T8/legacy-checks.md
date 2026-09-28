# legacy-checks (T8)

**Status** · session_013E7FEb6pLnkTkmnNFrnupE · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

Three readings, each with my best reading. I carry on with all three as stated; none blocks the rest of the job.

1. **N159 leaves two other findings on intent's documents.** I probed `checkBundle` over `aspirationDoc` and `goalDoc` (intent/doc.mjs) as they are written today. Once C-2.5 admits the types, each document still draws:
   - **C-1.2:** `ASP-2026-0001` and `GOAL-2026-0001` carry no slug, and `BUNDLE_ID_RE` requires one.
   - **C-2.2:** five core fields are missing (`produced_by`, `group`, `annotations_open`, `reeval_pending`, `visuals`).
   So the audit and the ratification gate still report these documents, under those two ids instead of C-2.5.
   **Best reading:** I apply N159 as written (`OBJECT_TYPES`, the known schemas, `STATES`). I also add `ASP` and `GOAL` to `BUNDLE_ID_RE` and `ANN_ID_RE`, as `BIAS` was added. The slug and the five core fields are intent's to write, as K171 prescribes "allocId plus a slug" for the layer-9 types; I will REPORT that for intent's layer-7 job.
   The alternative is for the catalogue to admit slugless `ASP-`/`GOAL-` ids and exempt these two types from C-2.2. That changes the id grammar and the core contract, so it is yours to rule, not mine.
2. **N128: `LISTENER_MALFORMED` has the same shape as `LISTENER_DECLARED`.** Both are minted for one condition at about 12 sites in 12 modules: promotion `#listen`, extraction, bias, content, retrieval, connections, inquiry, entities, calibration, basis-versions, provenance, and capture for `_DECLARED`. `#listen` mints both codes, so a whole-function `where` would also conscript `LISTENER_DECLARED`. `build/rulings.md` holds no structural ruling on either code.
   **Best reading:** `LISTENER_MALFORMED` waits for the same ruling as `LISTENER_DECLARED`. I add the other three now as C-102.6–C-102.8, each with a whole-function `where`:
   - `FACT_MALFORMED` (`registerFact`);
   - `STEP_MODULE_UNNAMED` (`registerStep`);
   - `STEP_DECLARED` (`registerStep`). It is also minted by `registerFact` for the same condition, a second registration of a name already held, and its sentence is true at both sites, per T6's two-site precedent.
3. **N155 cannot land from this side yet.** `src/run-productions/checks.mjs` reads `SUGGEST_CHECKS`, `SUGGEST_LEVELS` and `SUGGEST_KINDS` from the catalogue (`pick(CATALOGUE_SUGGEST, …)`). `store.mjs` (126) imports `SUGGEST_CHECKS` from it too, as do run-productions' and basis-versions' module suites. Removing the rows would break run-productions at load, and I cannot write run-productions' file.
   **Best reading:** N155 is deferred until run-productions holds the rows itself; its share is not in T8. Then legacy-checks deletes them. I record it as deferred with this reason.

## J2 · QUESTION

**Replaces J1** (only point 2 changed).

Three readings, each with my best reading. I carry on with all three as stated; none blocks the rest of the job.

1. **N159 leaves two other findings on intent's documents.** I probed `checkBundle` over `aspirationDoc` and `goalDoc` (intent/doc.mjs) as they are written today. Once C-2.5 admits the types, each document still draws:
   - **C-1.2:** `ASP-2026-0001` and `GOAL-2026-0001` carry no slug, and `BUNDLE_ID_RE` requires one.
   - **C-2.2:** five core fields are missing (`produced_by`, `group`, `annotations_open`, `reeval_pending`, `visuals`).
   So the audit and the ratification gate still report these documents, under those two ids instead of C-2.5.
   **Best reading:** I apply N159 as written (`OBJECT_TYPES`, the known schemas, `STATES`). I also add `ASP` and `GOAL` to `BUNDLE_ID_RE` and `ANN_ID_RE`, as `BIAS` was added. The slug and the five core fields are intent's to write, as K171 prescribes "allocId plus a slug" for the layer-9 types; I will REPORT that for intent's layer-7 job.
   The alternative is for the catalogue to admit slugless `ASP-`/`GOAL-` ids and exempt these two types from C-2.2. That changes the id grammar and the core contract, so it is yours to rule, not mine.
2. **N128, revised on the guard's evidence: `STEP_DECLARED` gets no row either.** Promotion's own requirements mint it at several registrations for one condition: R40 for a step or a fact registered twice, and R47 (added in T8) for the case-document catalogue. That is three sites once R47 lands, and one `where` claims one site. When I tried the J1 reading, `check-refusal-codes` failed on it twice:
   - arm G: `STEP_DECLARED` is minted at 2 sites;
   - arm C: `registerFact` refuses with `STEP_DECLARED` and no row claims that site.

   `LISTENER_MALFORMED` has the same shape as `LISTENER_DECLARED`: one condition minted by about 12 modules' registrations, and R47 adds one more. `build/rulings.md` holds no structural ruling on any of the three.
   **Best reading, now applied:**
   - Rows for the two single-site codes only: `FACT_MALFORMED` C-102.6 (`src/promotion/index.mjs registerFact > is-fact-named`) and `STEP_MODULE_UNNAMED` C-102.7 (`registerStep > is-step-named`).
   - Both `where`s are regions, because each function also refuses `STEP_DECLARED`; promotion marks them (a REPORT for its layer-2 job).
   - `STEP_DECLARED`, `LISTENER_DECLARED` and `LISTENER_MALFORMED` wait on your structural ruling: one shared code, or one code per site. That is a change to promotion R40/R47's wording.
3. **N155 cannot land from this side yet.** `src/run-productions/checks.mjs` reads `SUGGEST_CHECKS`, `SUGGEST_LEVELS` and `SUGGEST_KINDS` from the catalogue (`pick(CATALOGUE_SUGGEST, …)`). `store.mjs` (126) imports `SUGGEST_CHECKS` from it too, as do run-productions' and basis-versions' module suites. Removing the rows would break run-productions at load, and I cannot write run-productions' file.
   **Best reading:** N155 is deferred until run-productions holds the rows itself; its share is not in T8. Then legacy-checks deletes them. I record it as deferred with this reason.

## J3 · COMPLETE

**Every entry is applied except N155 (deferred, K229 (3)) and three N128 rows (deferred, K231).** Everything is in `bio-plane/checks/bio-checks.mjs` (commit 4eced5be37; `tranche/T8` merged at 02c44a5794).

## Entries applied

- **N129** (K171 (1), (2)):
  - `STD-`, `CONF-`, `CONS-` and `ESC-` are in `BUNDLE_ID_RE`, `ANN_ID_RE`, `OBJECT_TYPES`, `STATES` and the known schemas (`standard@1`, `determination@1`, `consequence@1`, `escalation@1`), as `BIAS` was.
  - standard, determination and consequence each have the one state `recorded` and no edges. escalation has `open`, `suspended` and `ended`, with open→suspended, suspended→open, open→ended and suspended→ended.
  - `proposalLabel(proposedBy, subject)` reads `lawProposalState` and one closed table, `PROPOSAL_STATES`. Its `governing_laws` entry is `LAW_PROPOSAL_STATES` itself (the same object), and it also holds `standard`, `comparison`, `filing_draft` and `theory`, each worded from its requirement (standards R9, conformance R12, filings R5, R14). A subject outside the table throws a `RangeError`.
  - `lawProposalLabel(p)` is now `proposalLabel(p, "governing_laws")`, with the same keys and the same sentences.
  - I checked `checkBundle` over a well-formed document of each new type in each legal state: no errors. A wrong state draws C-4.1 and a wrong prefix draws C-2.5, as they should.
- **N159** (K198 (2), K229 (1)): `aspiration` (`ASP-`, `aspiration@1`, held → retired) and `goal` (`GOAL-`, `goal@1`, open → closed) are admitted the same way, `ASP`/`GOAL` in the id patterns included. C-2.5 no longer fires on intent's documents. C-1.2 and C-2.2 remain until intent's layer-7 job adds the slug and the five core fields (K229).
- **N128** (K231): `FACT_MALFORMED` is C-102.6 at `src/promotion/index.mjs registerFact > is-fact-named`, and `STEP_MODULE_UNNAMED` is C-102.7 at `registerStep > is-step-named`. C-102's header states the one-code-one-site rule and what waits on it.
- **N148:** C-45's prose header now says the numbering covers twelve conditions. This family holds eight of them (C-45.1–.6, .11, .12); C-45.7–.10 are citation's `CITE_EXTENT_CHECKS`. It lists C-45.11 and C-45.12.
- **N70:** nothing was left. `MACHINE_CANNOT_REOPEN` already resolves to `src/promotion/index.mjs #reopen > is-machine-reopen`, `rec-186-leave-join` is 8/0 and `machinefences-dec49` is 89/0.
- **N150, N154 and N192 (1), (2): 91 `where`s re-pointed.** Each now resolves to its file, its function and a region marked once inside that function, and the code is minted inside the named span. I checked this with a resolver over all 430 catalogue rows that carry a `where`: two remain unresolved, C-22.17 (observation-log's unmarked region, N118) and C-102.4 (minted through the `factUnavailable` helper, which is correct).
  - **inquiry:** C-32.7 and C-32.8 (`#divide`, `#ground`); C-33.13 (`#dispose`); C-33.22 and C-33.23 (`check > is-basis-acyclic`, the step inquiry registers); C-33.40 (`actNoBasis`, the site N186 keeps).
  - **basis-versions:** C-32.2; C-33.1, .2, .33–.37; C-25.11, .16 (its registered `check`); C-25.17, .18 (`basisVersions`); C-25.20–.34 (`#moveVersionState`); C-50.1–.11.
  - **capture-requests:** C-28.1–.4 and .14–.16 (`captureRequest`); C-28.6–.11 (`#conduct`); C-28.17 (`drain`).
  - **run-productions:** C-27 except .15 (`suggest`); C-104.1–.12 (`extractPropose`, `extractProposals`).
  - N192 (2): refusal-wire's D-494 "where names the wrong source" arm now passes (CONCLUDE, DIVIDE and GROUND).
- **Flaws in my own module, also fixed:**
  - C-24.1–.3 now point at `src/provenance/index.mjs versionChain`; they named legacy-store's one-line delegate.
  - C-25.17 and C-25.18 likewise now point at basis-versions' `basisVersions`.
  - C-64.1 now points at `src/inquiry/index.mjs #groupUndetermined`; it named legacy-store's copy, which has no caller.
  - The "WHAT A `where` MEANS" block and C-28.17's note are reworded to match.

## Deferred

- **N155** (K229 (3)): run-productions reads `SUGGEST_CHECKS`, `SUGGEST_LEVELS` and `SUGGEST_KINDS` from the catalogue, and so does `store.mjs`. The rows leave the catalogue once run-productions holds them itself.
- **N128's other three rows** (K231): `STEP_DECLARED` waits until promotion's layer-2 job converges it on one helper. `LISTENER_DECLARED` and `LISTENER_MALFORMED` wait for N202. All three rows belong to legacy-checks' next job.

## Found in other modules (REPORT)

K229 and K231 already route intent's slug and core fields, promotion's region markers and the `STEP_DECLARED` helper, so they are not repeated here.

1. **promotion** (layer-2 job): `test/m/promotion/promote.test.mjs` R15 fails with "an id prefix for escalation". Its prefix map needs `STD`, `CONF`, `CONS`, `ESC`, `ASP` and `GOAL`, or it should skip types it cannot create. The requirement itself holds: R15 reads the catalogue's table.
2. **intent** (layer-7 job): its R26 test expects `PURSUIT_STATE_MOVE_UNDECLARED` for a move, and now gets promotion's `STATE_MOVE_UNDECLARED`. Promotion R15 asks the catalogue's `STATES` before intent's step runs. R26 names no code, so its meaning holds; the test pins the code. A creation in a wrong state still reaches intent's own refusal.
3. **citation** (no T8 job): `test/m/citation/invariants.test.mjs` R5 pins the retiring types as `["bias","information"]`, and `aspiration` now retires too. Either R5 covers retired aspirations or the test pins a sample.
4. **basis-versions** (no T8 job): now that C-25.20–.34 govern `#moveVersionState`, the guard reports that the function refuses `FACT_UNAVAILABLE` (line 666, relaying promotion), which `VERSION_ACT_CHECKS` does not hold. Also, C-33.40's duplicate `is-act-no-basis` marker is an orphan until N186 deletes it.
5. **legacy-store:** its dead `#groupUndetermined` (store.mjs 13807, no caller) should go, as N186 does for `actNoBasis`.
6. **legacy-tests: the guard** (`civicos-ui/check-refusal-codes.mjs`, measured against `tranche/T8`): **119 failures before, 102 after.**
   - Cleared: every stale `where` of N150, N154 and N192, 25 of the orphan-marker lines (46 → 21), and the codesChecked and regionLines collapses.
   - New: `is-fact-named` and `is-step-named` are unmarked until promotion's job lands (K231).
   - Ratchets to re-pin from its print: rows 633→635, reach 668→670, governedSites 334→336, regions 256→281, codesChecked 565→671, refusalsJudged 552→666. The regionLines floor of 4705 is still breached (4344, up from 3510).
   - inheritedVerdicts goes 2→6 against a ceiling of 4. Those are spreads at re-governed sites: run-productions `suggest > is-suggest-write` and three in basis-versions `#moveVersionState`. That is basis-versions' and run-productions' to fix, or a re-pin.
   - outcomeReturns is 204 against a floor of 205 until the two promotion regions are marked.
   - untranslated 280→281.
7. **legacy-tests: the old battery.** All 241 suites that read the catalogue were run on this branch and on the base, in parallel, and every changed suite was re-run on its own:
   - **Improved:** `refusal-wire` 38/4 → 39/3 (the D-494 arm). `capturerequests` 134/2 → 135/1 (the conduct `where` pin).
   - **New reds, each a stale pin or a list of types:**
     - `conformance` (`FIRST_STATE` pins the old type set);
     - `d484-refusal-translation` (pins C-33.40's `where` to `src/store.mjs act…`);
     - `versionstate` (pins VERSION_ACT's `where` to `src/store.mjs #moveVersionState`);
     - `civicos-ui/test/bias-vocabulary` (6 arms: PREFIX, FIRST_STATE and HEADINGS in `app.html` for each new type);
     - `civicos-ui/test/add-surface` (the first state for `standard`).
     The UI's surface tables are legacy-ui's, which ruling 4 plans no work for, so these want legacy-tests' judgement.
   - **Red on both, unchanged:** 16 suites.
8. **Generated artifacts:** `fleetbundles` is 96/0 → 88/8. `bio-plane/dist/bio-plane.bundled.mjs`, `newgroup/dist/newgroup.bundled.mjs` and `agent-worker/dist/agent-worker.bundled.mjs` embed the catalogue and are stale. They are regenerated at the layer close (manifest §14).

## Tests and checks

- My module has no requirements and no `tests` path, and `build/manifest.md` names no layer tests.
- **Every module suite** (`node --test bio-plane/test/m/*/*.test.mjs`): base 1816 pass, 1 fail (connections `factory.test.mjs` R24, red on both). Branch 1813 pass, 4 fail: that same one, plus REPORTs 1–3.
- **The DEC-49 guard:** REPORT 6.
- **The old battery:** REPORT 7.
- Checks (civicos-process `main` @ 5c397bd):
  - `format: 69 modules, 64 requirements files; 0 failures`
  - `architecture: 1 product files, 0 relative imports (0 naming no tracked file, not judged); 0 failures`
  - `coverage: 0 modules, 0 of 0 live requirement ids named by a test; 0 failures`
  - `ownership: 2 files changed by legacy-checks between tranche/T8 and HEAD; 0 failures`

Size (session_013E7FEb6pLnkTkmnNFrnupE): test runs 578, module lines 13868
