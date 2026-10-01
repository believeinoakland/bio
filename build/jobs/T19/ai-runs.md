# ai-runs (T19)

**Status** · session_01PtMaesRvgrZDSjJDZU62p8 · depth 2 · COMPLETE · handled B1

## J1 · REPORT

Findings outside my paths. None blocks my job.

**1. BOB's files: `modules.json` and my requirements.**
- `modules.json`: ai-runs' `paths` still lists `bio-plane/src/airun.mjs`, which this job deleted.
- `modules.json`: `legacy-checks` can leave ai-runs' `uses`. No ai-runs file imports the catalogue now.
- `ai-runs.md` Uses: `legacy-checks`' line names `isMachineIdentity`, `normalizeType` and `OBJECT_TYPES`. These now come from `record-grammar`. `canonicalJson` is not read at all.
- `ai-runs.md` Uses: `aiCredentialLook (R18)` is now `credentials`' (its R15), not `membership`'s.
- `ai-runs.md` Status: still says "leaving `airun.mjs` a re-export". That re-export is now deleted.
- **Proposed wording for R38** (meaning as built and tested in `hidden-notices.test.mjs`, test "R38, R42"): "…and their figures `aiRuns`, `aiRunBounds`, `inquiryRunSurfacings` and `aiRunLog` are registered with record-core's counts (its R63). They are taken through the caller's sight: `aiRunBounds` and `aiRunLog` keep exactly the rows R42 keeps; `aiRuns` and `inquiryRunSurfacings` drop the rows naming a bundle in `hid`; a null `hid` counts whole."

**2. Stale comments in other modules** (wording only; they name a deleted file as live):
- `run-rules/rules.mjs`:104–108: "so every reader of `airun.mjs` keeps its names". No such reader remains.
- `observation-log/checks.mjs`:11: "`airun.mjs` (ai-runs) … still build their run refusals".
- `promotion`'s `gate.mjs`:294: the history note says C-22.7's `where` is "now `src/ai-runs/skill-version.mjs`". It is now `run-rules/skill-version.mjs`.
- `ratification/checks.mjs`:438: "`airun.mjs` re-exports it".
- `agent-worker/test/harness.control.mjs`:249 reads `bio-plane/src/airun.mjs` by path. This is a control driver, not in the suite. agent-worker's suite is unchanged by this job: 7 pass, 1 fail, before and after.

**3. Generated artifact (§14).** The plane bundle is stale: `store.mjs` and `ai-runs/` changed, and four inputs were deleted. Also, `test/system/fleetbundles.test.mjs`:201–203 pins `airun.mjs`, `ai-runs/checks.mjs`, `deployment.mjs` and `skill-version.mjs` as plane inputs. That file is legacy-tests' (K619), so the arm goes red at the close, the same as N441.

**4. The DEC-49 guard** (`civicos-ui/check-refusal-codes.mjs`, legacy-tests'/legacy-ui's; not run per tranche, K619):
- **N242 arm G confirmed:** no code is minted in both ai-runs and run-rules. Every multi-site code the guard lists sits wholly inside one of the two modules.
- **ai-runs' own share is fixed in this job.** The guard went from 166 failures to 157:
  - 8 arm G multi-site findings in `open` are gone (the code literal plus `ROW("X").check` and `.translation`, three sites each).
  - The arm C finding "no refusal judged in `is-airun-open-plan`" is gone. `planNo` was not a helper name the guard reads.
- **Still failing, run-rules' (`rules.mjs`):** `AI_RUN_BOUND_UNKNOWN` (4 sites), `AI_RUN_BOUND_PLANE_COUNTED` (2), `AI_RUN_NO_SUCH_CONTEXT` (2).
- **Still failing, the guard's own:** `AI_RUN_CONDITION_UNKNOWN` is a stale `MULTI_SITE_CLOSED` entry. Arm E's `VOCABULARY_MODULES` names `src/airun.mjs`, now deleted. Both are for the release.

**5. Old suites** (not run, K619/K635; K779's precedent) that import a deleted file:
- `test/`: `airun`, `airuns`, `d241-derivation-stated`, `extractrun`, `nc-pl18`, `nc-rec107`, `nc-rec93`, `nc-rec94`, `nc-rec95`, `observation-content`, `observation-meaning`, `passage-arm`, `project-disclosure.control`, `provenance-marker`, `rec172-bounds.control`, `run-conditions`, `skillpack`, `skillsequencing`.
- `test/system/`: `fleetbundles`, `machinefences-dec49`.
- `civicos-ui/test/`: `ai-session-context`, `ai-session-wire`, `passage-surface`, `subject-view`.

**6. `op=stats` key order.** The four ai-runs keys now come after the literal keys, in registration order. Other modules' R63 registrations did the same. No value changed: `test/m` shows nothing newly failing.

## J2 · COMPLETE

**Entries applied** (layer 6, ai-runs; B1 START):

- **The four re-exports are deleted:** `src/airun.mjs`, `ai-runs/checks.mjs`, `ai-runs/deployment.mjs`, `ai-runs/skill-version.mjs`.
  - No product importer remains: none in `src/`, none in `test/m/`, none in agent-worker's suite.
  - Old suites (K619) still import them: listed in J1 §5.
  - No row's `where` names a deleted file. The `index.mjs`:919 comment is re-worded to point at run-rules' rows header. Stale comments in other modules are in J1 §2.
- **N242's arm G:** confirmed with the DEC-49 guard. No code is minted in both ai-runs and run-rules (J1 §4).
  - Improvement in my own module: every refusal `open` mints now goes through one `refusal(code, more)` helper. Each code is written once, at its refusal, with answers byte-for-byte as before.
  - Result: the guard's 8 arm G findings and 1 arm C finding (`is-airun-open-plan` judged nothing) on ai-runs are gone, 166 → 157.
- **Legacy-store's share (rule 5):** `#hiddenRunTail` and the four ai-runs counts (`aiRuns`, `aiRunBounds`, `inquiryRunSurfacings`, `aiRunLog`) are removed from `store.mjs`.
  - ai-runs registers them with record-core's counts (R63) and takes them through `hid` with the same subtraction as before. `aiRunBounds` and `aiRunLog` keep exactly R42's rows; the test asserts equality with R42's tail for every viewer kind.
  - `observationsNonLead` now calls the already-imported `hiddenRuns` directly.
  - Ownership: legacy-store +1/−34. The one added line is that call.
  - Proposed R38 wording: J1 §1.
- **`aiCredentialLook` re-pointed to credentials** (`credentialsOf(ctx)`, its R15; K757). `uses` already lists credentials.
- **Rule 1 re-points:**
  - `index.mjs`:22 (`normalizeType`, `OBJECT_TYPES`, `isMachineIdentity`) and `hidden-notices.test.mjs` (`MACHINE_CLASS_PREFIX`) now read record-grammar.
  - `rows.test.mjs`' catalogue arm is dropped.
  - No ai-runs file imports `bio-checks.mjs`.
- **K789:** the test world constructs credentials (`credentialsOf(ctx, {record, membership}).migrate()`) and claims through it. Mints, revokes and looks up AI credentials through credentials. The 54 accepted reds are green.
- **Old suites:** none deleted (K619).

**Deferred:** none.

**Found in other modules:** J1 (REPORT).
- `modules.json` path and `uses`; requirement wordings.
- Stale comments in run-rules, observation-log, promotion, ratification, agent-worker's control driver.
- The plane bundle is stale, and `fleetbundles.test.mjs`:201–203 pins the deleted inputs.
- run-rules' three multi-site codes, and the guard's own stale entries.

**Tests and checks:**
- `node --test bio-plane/test/m/ai-runs/`: tests 56, pass 56, fail 0. Was 1 pass, 54 fail on tranche/T19. One new test: "R38, R42", the counts.
- Users and neighbours, each 0 fail: legacy-store 4/4, record-core 90/90, run-productions 36/36, capture-requests 63/63, contradiction 101/101, run-rules 16/16, credentials 33/33, membership 136/136.
- `node --test bio-plane/test/m/`: 4468 tests, 4288 pass, 160 fail, 20 todo. Against the same tree without my change (4467 / 4233 / 214), nothing newly fails and 54 are fixed (all ai-runs').
- agent-worker `test/`: 7 pass, 1 fail, identical before and after.
- No layer tests named in the manifest.
- `format`: 87 modules, 82 requirements files; 0 failures.
- `architecture ai-runs`: 15 product files, 57 relative imports; 0 failures.
- `coverage ai-runs`: 38 of 38 live requirement ids named by a test; 0 failures.
- `ownership ai-runs tranche/T19`: 13 files; legacy-store 1 added, 34 removed; legacy-checks 0/0; 0 failures.

Size (session_01PtMaesRvgrZDSjJDZU62p8): test runs 9, module lines 2714
