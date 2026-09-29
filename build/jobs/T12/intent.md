# intent (T12)

**Status** · session_01Aqw26aHPhWB2gFJysEPTSZ · depth 2 · WORKING · handled B1

## Completion

**Applied** (on `tranche/T12` at 30263aa2eb, layer 6 closed):
- **N285 (entities R36; intent R2, R9's entity check, R22).** `setCondition`'s `NO_SUCH_ENTITY` (R2) and `declareAspiration`'s (an aspiration naming an unregistered entity) now answer `entities.noSuchEntity(id)` byte for byte. Intent's `refuseNoSuchEntity`, its region `is-named-entity` and its row `INTENT_CHECKS.NO_SUCH_ENTITY` (C-111.5) are gone; the number is not reused. `checks.mjs` and the foot of `index.mjs` say why, as they already did for C-111.2.
- **N305 (the Bounds paragraph, K367).** Exported `CONTEXT_MAX`, `PROJECTS_MAX` and `REQUESTS_MAX` (1,000 each).
  - R28 `servesOf` measures against the first 1,000 held group or project aspirations in id order, with member and retired ones not counted, and against the first 1,000 conditioned projects in id order. It answers `context_truncated`, which is also false on the path where the context read fails.
  - `proposals` with no project named reads the first 1,000 projects the viewer may see, in id order, and answers `projects_limit` and `projects_truncated`. This is my J1.1 reading. `triage` with no project named reads the same bounded set.
  - `pursuitOf` reads at most 1,000 distinct named capture requests, in the order the triage acts and their bases name them, and answers `requests_limit` and `requests_truncated`.
  - One project walker, `#projectsInOrder`, replaces the unbounded `#conditioned`. `#heldAspirations` takes a scope filter and a bound. The unbounded `#aspirations` is gone.
- **Tests.** New in `bounds.test.mjs`, each run at the bound and at one past it:
  - R28's aspiration context, with member and retired aspirations not counted.
  - R28's conditioned-project context, with unconditioned projects not counted.
  - `proposals`' project read: a project the viewer may not see is not counted; the 1,000th project in id order is read and the 1,001st's gap is not.
  - R14's request read: the first 1,000 read in basis order, a repeat read once, and no more than 1,000 `requestById` calls.
  - In `objective.test.mjs`, a new test "R22 R2 R9 NO_SUCH_ENTITY is entities' one row" covers both sites answering `noSuchEntity(id)` and C-111.5 retired. R2's order test now expects the `noSuchEntity` answer.

**Strike** (my work meets these marks):
- intent's Bounds paragraph: `*(not yet met: N305; each read is unbounded)*`.
- entities R36: `*(not yet met: N285; intent mints its own through refuseNoSuchEntity, C-111.5)*`.

**Deferred** (flaws in my own module that need wording before I can bound them; sent to BOB in J2):
1. `pursuitOf`'s goal walk reads every goal document to find those under the aspiration. `GOALS_MAX` bounds the answer but not the walk.
2. R17/R27's `#ageable` reads every inquiry document and its manifest on each `ageDue`, `ageWake` and `ageSurfaced` call.
3. R28's walk for conditioned projects (J1.2).
4. `#heldAspirations` passes over retired aspirations without counting them.
Each is an internal read like N305's.

**Found in other modules or docs** (reported in J2):
1. **Stale, not rebuilt (§14):** `bio-plane/dist/bio-plane.bundled.mjs`. fleetbundles names `src/intent/checks.mjs` and `src/intent/index.mjs`. No worker bundle takes intent.
2. **DEC-49 guard** (`civicos-ui/check-refusal-codes.mjs`), this commit against its parent. Failures go from 26 to 25: `INTENT_CHECKS.NO_SUCH_ENTITY` leaves arm G, whose multi-site count goes from 65 to 64. Floors move down, all still above their floors as before: rows 786→785, regions 458→457, regionLines 5477→5472, governedSites 497→496, codesChecked 890→888, refusalsJudged 860→859, outcomeReturns 263→262. The guard's `multiSiteCodes` comment names intent's `refuseNoSuchEntity` as NO_SUCH_ENTITY's second site, and that site is now gone (legacy-tests re-anchors it).
3. **civicos-ui and affordances' lists:** no hit on `refuseNoSuchEntity` or C-111.5. `app.html` 17026 and 17028 probe entities' own `NO_SUCH_ENTITY`, unchanged.
4. **R22's wording:** "every refusal this file names gets a catalogue row in this module, except NO_SUCH_PROJECT". `NO_SUCH_ENTITY` is now a second exception (entities R36, N285). The Uses line says so; R22 does not yet.

**Tests and checks.**
- `node --test bio-plane/test/m/intent/`: tests 46, pass 46, fail 0.
- Modules using intent: `monitoring`, `scheduler` and `affordances` 180 tests, 171 pass, 0 fail, 9 todo (the same on the parent); `queue` 10 pass.
- Legacy suites naming intent:
  - `bounds`, `gate-reads`, `hygiene` and `rung-ladder` pass.
  - `derivation-bounds` and `meaning-bounds` fail on the parent. Their output here matches the parent's apart from corpus counts; meaning-bounds now also lists `requests_limit` and `requests_truncated` for `op=pursuit`.
- `node checks/format.mjs`: 69 modules, 64 requirements files; 0 failures.
- `node checks/architecture.mjs … intent`: 11 product files, 39 relative imports; 0 failures.
- `node checks/coverage.mjs … intent`: 28 of 28 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … intent tranche/T12`: 5 files; legacy-checks 0/0, legacy-store 0/0; 0 failures.

Size (session_01Aqw26aHPhWB2gFJysEPTSZ): test runs 24, module lines 1837

## J1 · QUESTION

Two readings of the Bounds paragraph's N305 sentence (K367). I am building on both readings now and will not stop for the answer.

1. `proposals` with no project "reads at most the first 1,000 projects in id order". My reading: the first 1,000 projects **the viewer may see**, in id order, so `projects_truncated` never tells a viewer that projects hidden from them exist (R23; DEC-36's "no count"). The cost is that each hidden project is skipped with one `inSight` check, which is not counted. The other reading is every project whatever the viewer sees. That bounds the walk strictly, but a viewer who sees 3 projects could then read `projects_truncated: true`.
2. R28 reads "the first 1,000 conditioned projects". As worded, finding them walks project documents until the 1,001st conditioned one turns up. When few projects state a condition, that walk is still bounded only by the number of projects held. I am building it as worded. If you want the walk itself bounded, the wording would be "of the first 1,000 projects in id order, those with a condition", like (1).

## J2 · REPORT

Found, from my record's Completion section:
(1) Stale, not rebuilt: bio-plane/dist/bio-plane.bundled.mjs, which takes src/intent/checks.mjs and index.mjs.
(2) DEC-49 guard: failures go from 26 to 25, because NO_SUCH_ENTITY leaves arm G (65 -> 64). Floors move down: rows 786->785, regions 458->457, regionLines 5477->5472, governedSites 497->496, codesChecked 890->888, refusalsJudged 860->859, outcomeReturns 263->262. The multiSiteCodes comment still names intent's refuseNoSuchEntity as a site; legacy-tests re-anchors it.
(3) civicos-ui and affordances: no hit on the retired helper or C-111.5.
(4) R22 names NO_SUCH_PROJECT as its only row exception. NO_SUCH_ENTITY (entities R36) is now a second one; the Uses line says so, R22 does not.
(5) Four unbounded internal reads left in my module, each needing wording like N305's: pursuitOf's walk over every goal document; #ageable's walk over every inquiry and its manifest (R17, R27); R28's conditioned-project walk (J1.2); #heldAspirations passing over retired aspirations without counting them.
Legacy suites derivation-bounds and meaning-bounds match their parent's output; bounds, gate-reads, hygiene and rung-ladder pass.

## J3 · COMPLETE

N285: setCondition's and declareAspiration's NO_SUCH_ENTITY now answer entities.noSuchEntity(id) byte for byte. refuseNoSuchEntity and row C-111.5 are retired.
N305: servesOf measures against the first 1,000 held aspirations in force and the first 1,000 conditioned projects, answering context_truncated. proposals with no project reads the first 1,000 projects the viewer may see, answering projects_limit and projects_truncated (my J1.1 reading). pursuitOf reads at most 1,000 named requests, answering requests_limit and requests_truncated. Each has an interface test at the bound and one past it.
Please strike the Bounds paragraph's 'not yet met: N305' and entities R36's 'not yet met: N285'.
Results: intent tests 46 of 46 pass. Users' tests: 171 pass and 9 todo, the same as the parent; queue 10 pass. format, architecture, coverage (28 of 28 ids) and ownership: 0 failures.
The full account is in build/jobs/T12/intent.md, Completion.
