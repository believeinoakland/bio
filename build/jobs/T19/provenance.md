# provenance (T19)

**Status** · session_01DzWtbMt3dfXnf1njsK3anH · depth 2 · WORKING · handled B2

## Completion (PROVENANCE #9)

**Entries applied** (`build/plan/current.md` L3 provenance, kept; B1):
- **Rule 1:** `index.mjs` and `register-checks.mjs` import `parseFrontmatter`, `isMachineIdentity`, `isPublicHttpsLocator`, `createSha256`, `EARNED_CAPTURE_CEILING`, `BASIS_GRADES`, `TESTIMONY_GRADE` and `ACTOR_CLASSES` from record-grammar. These are the same bindings the catalogue re-exported (checked `===`), so behaviour is unchanged. The five module tests that read the catalogue now read record-grammar. No provenance file imports `bio-checks.mjs`.
- **K781:** R45's C-18.6 test runs record-grammar's `checkBundle` with `record.grammars()`. It asserts that promotion holds C-18.6/.7, and that with no grammar nothing hashes the bytes.
- **K789:** the fixture builds credentials after membership (`credentialsOf(host).migrate()`). The founder's claim goes through credentials. Both accepted reds are green.
- **R52:** `onTestimony(module, {check?, project?})` refuses through membership's `listenerRefusal`. `testimonySlot()` returns `{check(c), project(c)}`, ordered by `MODULE_ORDER`. Each registration gets the path's fields and `earlier`. The first refusing check refuses the promotion as it came. A projection that throws is not caught. Answers are joined as `testimony`, and a promotion without the testimony path answers null. Provenance's own step runs none of them. The store keeps its testimony lines until extraction, content and observation-log register (L4–L5, the requirement's Suggestion); then the store's step calls the slot's two functions in place of them.
- **R28:** `content_id` is the one the slot names, or null when none does (tested through a step standing in for the store's).
- **R53:** `provenanceOps(provenance, url, body, {observer})` in `ops.mjs` holds the nine arms, built from `store.mjs`' explicit arms. `observation_written` is true only when the observer's listener ran and answered `written: true`. The store keeps its arms until legacy-store spreads the map (K671).
- **R54:** the tally is registered with `registerAuditFinding("provenance", "route", …)`. The marks are read over the page's own id range, the marked list is bounded at 20, and `means` and `note` are as before. The tally moved out of `store.mjs`' `auditPass`, which now relays `[ROUTE_FINDING_KEY]: route` from record-core's answer (legacy-store +4/−62 lines). Its `OBSERVATION_STATES` import is gone.
- **R55:** `registerCounts("provenance", ["register", "routeMarks"], counts)`, keyed on `bundle_id` with `COALESCE`, synchronous, writing nothing.
- **R48 (widened):** the `provenance_route_marks` columns and the highest-seq standing mark are tested in a later module's SQL shape read through `routeFinding`. Met now: the contract is this module's; retrieval's use is its own (L5).

**Rs met, with their tests (for BOB to strike):**
- R28: `testimony-slot.test.mjs`, "R52: on the testimony path…" and "R52, R28: …content_id is null".
- R52: `testimony-slot.test.mjs`, all six tests.
- R53: `ops.test.mjs`, five "R53: …" tests.
- R54: `audit-figures.test.mjs`, four "R54: …" tests, plus the registration test.
- R55: `audit-figures.test.mjs`, "R55: …".
- R48: `audit-figures.test.mjs`, "R48: provenance_route_marks…".

**Deferred:** nothing.

**Found in other modules (REPORT):**
1. **legacy-store (L10):** with R55 registered, `#counts`' literal `register` and `routeMarks` keys are overridden by the identical registered figures (`...recordOf.counts(hid)`). Its own job deletes the two lines (R55). Also its job will:
   - replace the nine provenance arms and `recordCapturedLocator` with `...provenanceOps(provenanceOf(ctx), url, body, {observer: OBSERVATION_LOG_MODULE})`;
   - replace `#testimonyWithin` and the C-45 extent lines with `testimonySlot().check(c)` / `.project(c)` once L4–L5 register.
2. **The copied vocabulary:** provenance holds `OBSERVATION_MEANS`, a frozen word-for-word copy of observation-log's five-state `OBSERVATION_STATES`, because P4 forbids importing it. The test pins the five strings. If observation-log changes them, this copy must follow.
3. **Generated artifact staled:** `bio-plane/dist/bio-plane.bundled.mjs` (inputs `src/provenance/*`, `src/store.mjs`), for the layer close's regeneration.

**Tests and checks:**
- `node --test bio-plane/test/m/provenance/`: tests 113, pass 113, fail 0 (start: 95 with 3 accepted reds).
- The 26 test folders of the modules using provenance, plus legacy-store, run on this branch and on `tranche/T19`: no failure on the branch that is not on the tranche (143 vs 145 failing lines; the 2 extra are extraction files on the tranche run only).
- `format`: 0 failures. `architecture provenance`: 20 product files, 0 failures. `coverage provenance`: 55 of 55 live ids. `ownership provenance tranche/T19`: legacy-store 4 added, 62 removed, 0 failures.

Size (session_01DzWtbMt3dfXnf1njsK3anH): test runs 9, module lines 3932
