# case-authoring (T37)

**Status** · session_01SSuxFGyKjUgKQQSHYhEaFU · depth 2 · COMPLETE · handled B4

## J1 · QUESTION

R62 is done and tested (statement.test.mjs, "R62: …"): `op=statementack` reads `secretSha` from the body only; a query digest opens no door (the dead answer). R34's Photos step is coded to `case-disclosures`' public R29 (`photosOf(reached.materials, memberRoles, viewer)`) as a new step 4 "photos" `{photos, unchecked}` between "what you are leaving out" and "the edition this creates". The later steps are renumbered 5 and 6, matching the screens' ceremony order (`library.src.py`); nothing outside this module reads the steps by position. R6's photo refusals reach `first`/`blockers` through `materialsJudged` unchanged. R14's `obscured: {copy, label}` passes through `disclosureBlocks` rows into `case-grammar`'s `materialBlockLines` with no reshaping here. Pushed at 1c62b1d53a.

My 20 pre-flight tests are red on one cause only, `D.photosOf is not a function`, until T37-41 is on `tranche/T37`. The end-to-end photo tests (a marked photo carried by its copy in the document; unchecked counted and not a blocker; PHOTO_NOT_COVERABLE and PHOTO_MARKS_UNDETERMINED as first and among blockers) also need T37-34 (`case-carriage`: `obscureMark`, `photoMarks`) and T37-40 (`case-grammar` R12) there. When they merge, my fixture will compose `case-carriage` (and `image-cover`) for `case-disclosures` the way the plane does.

QUESTION: my best reading is that I wait for T37-34, T37-40 and T37-41 to merge, then merge `tranche/T37` and finish. Please send a RESUME (or a CHANGE) once T37-41 is merged. If you would rather I write the photo tests now against stand-ins for `case-disclosures`, say so.

## Completion (T37-21)

**Reading (mechanics §17, N739):** the START measured the set at 1,166 KB, with tests at 376 KB, which is over 300 KB, so I followed option (3). I read these whole myself:
- `build/requirements/case-authoring.md`
- layer 8's row of `build/layers.md`
- the plan's T37-21 entry and its rules 4 and 6
- K2129, K2171, K2175 and K2206 (their lines)
- DEC-180 whole
- `credentials` R53, and its `aicredentialmint` arm as the pattern
- `case-disclosures`' public R6, R7 and R29 as amended
- `caseAuthoringOps` (`index.mjs`:2364–2435)
- `acknowledgeStatement` (:1888–2000)
- `publishPreflight` with its `#preflightSteps` (:1462–1660)
- `publishCase`'s disclosures order (:640–660, :955–985)
- `statement.test.mjs` and `preflight.test.mjs`
- `case-disclosures`' `materialsJudged`, `photosOf`, `photoRead` and `marksDecide`, and `case-carriage`'s `photoMarks`, `obscureMark` and `caseCarriageOf`, read on the merged tranche

A worker read the rest of my code (index, document, checks, schema, searched) and the other 19 test files whole. It wrote a 15 KB summary, each statement citing file and line. The summary covered:
- every place that touches material rows and the `materials` input of the R61 standards check
- every read of `secretSha`/`bySecret`
- every test that indexes the steps
- the fixture's composition and helpers
- `statementack` tests through the ops map

What mattered from it:
- No other test indexes steps 4 and 5.
- The fixture composes no `case-carriage`, so I hand `case-disclosures` one through `deps`.
- The front-matter grammar forbids nested maps. `case-grammar` R12 writes `obscured` flat, and R14's test publishes with R61's check running over those rows.

Nothing it left out mattered.

**Entries applied (T37-21):**
- **R62 (N761):** `op=statementack` takes `secretSha` from the body only, a string or null; a query digest is never read. `bySecret`, `viewer`, the subject and `reason` are read from the query as before.
- **R34 (N757; DEC-180 (3)):**
  - `steps` gains step 4 "photos", `{photos, unchecked}` from `case-disclosures.photosOf` over the materials R6 answered, read as `op=publish` judges them. It is stated "not reached" when the members or their roles are refused first.
  - "The edition this creates" and "sign" are now steps 5 and 6, matching the screens' ceremony order. Nothing outside this module reads the steps by position.
  - An unchecked photo is never a blocker. `PHOTO_NOT_COVERABLE` and `PHOTO_MARKS_UNDETERMINED` come through `materialsJudged`: `first` when `op=publish` gives them, else among `blockers`.
- **R14:** a marked photo's `materials:` row is `included: false` with `obscured: {copy, label}`, as `case-disclosures` R7 and `case-grammar` R12 write it. It needed no code here: the rows pass through to `materialBlockLines` unreshaped.
- **Tests:**
  - R62's own clauses: `statement.test.mjs`, "R62: …".
  - R14's and R34's new clauses: `photos.test.mjs`, four tests over the real `case-disclosures`, with `case-carriage.photoMarks` as a stand-in at its R10 interface. The fixture now passes `caseCarriage` among the dependencies `case-disclosures` reads.
  - Updated for the step renumbering (`preflight.test.mjs`), for case-grammar's `obscured: null` on each row (`carries.test.mjs`), and for C-120.17–.18 in the re-exported family (`invariants.test.mjs`, `preflight.test.mjs`).

**Rule 4's interim red:** control-plane `statementack.test.mjs`:31 is **not** red at my merge, so I name no red test. Its stand-in drives my `caseAuthoringOps` but its `acknowledgeStatement` never reads `secretSha`, and its assertion on the inner request (`secretSha` in the query) is control-plane's own sending. It passes 3 of 3 on the merged tranche. Red 19 can be closed or dropped from the plan's list.

**Found in other modules:** none.

**Deferred:** none.

**Tests and checks (on the tranche at `4c0a20cf7b` merged):**
- `node --test test/m/case-authoring/`: tests 163, pass 163, fail 0.
- `node --test test/m/control-plane/statementack.test.mjs`: tests 3, pass 3, fail 0.
- `node --test test/m/review/` (it runs `publishCase` and reads R20's list): tests 38, pass 38, fail 0.
- Layer tests: none named in `build/manifest.md`.
- `node checks/format.mjs`: 136 modules, 135 requirements files; 0 failures.
- `node checks/architecture.mjs … case-authoring`: 27 product files, 147 relative imports; 0 failures.
- `node checks/coverage.mjs … case-authoring`: 46 of 46 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … case-authoring tranche/T37`: 5 files changed; 0 failures.

**P6:** 3,460 lines (3,446 at START).

Size (session_01SSuxFGyKjUgKQQSHYhEaFU): test runs 12, module lines 3460
