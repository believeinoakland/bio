# intent (T11)

**Status** · session_01WZrsBqtbtRoDpA36xiDFhT · depth 2 · WORKING · handled B1

## Completion

**Entries applied**
- **N208 (its site):** every `NO_SUCH_PROJECT` intent answers (R2, R3, R8's `linkObjective`, R9's project aspirations, R10, R12, R16, R18, and `triage`'s adopt with no project named) is now membership's `noSuchProject` (its R78, C-70.5), byte for byte. Intent's own C-111.2 row and `refuseNoSuchProject` are retired; the number is not reused.
- **N209:** R12 `aspirationsFor` reads at most the first 1,000 held aspirations the viewer sees, in id order, and answers `limit` and `truncated`. R13 `contacts` pairs those same first 1,000 and lists at most 1,000 pairs, in first-id then second-id order, answering `limit` and `truncated` when either is cut (`ASPIRATIONS_MAX`, `CONTACTS_MAX`, K338).
- **N236 / N277 (its share):** interface tests at each bound, at the bound exactly and one past it: `MEASURE_MAX` (R4: 1,000 matched decides; the 1,001st makes `satisfied` null with its reason, and `progress` and `gaps` say `truncated`), `DEPARTURES_MAX` (R10/R12), `SET_ASIDE_MAX` (R16: 200, newest first). These are in `test/m/intent/bounds.test.mjs`.
- **N291:** R14 `pursuitOf` reads each named request with `capture-requests.requestById` (its R43) under the viewer's sight, so outcomes are exact. It no longer reads the bounded list, and its "cut at its bound" answer is gone.
- **K316 / K313:** the module's tests now run on a workerd-shaped fixture: a cursor-returning `sql.exec` that refuses LIKE/GLOB patterns over 50 bytes. All suites were green on it before any other change; the module spreads every cursor and uses no LIKE/GLOB.

**Marks for BOB to strike** (`build/requirements/intent.md`)
- Uses `membership`: `(not yet met: N208)`.
- Uses `capture-requests`: `(not yet met: N291; pursuitOf reads the bounded list)`. `captureRequests` is still read by R28's request serving (a request's address), so that Uses line keeps it for R28, not for R14.
- R22: `(not yet met: N208; C-111.2 stands)`.

**Deferred:** none of my entries.

**Found (for BOB)**
- *R28 and internal reads, unbounded:* `servesOf`'s context walks every aspiration and every conditioned project, and `#conditioned` (for `proposals` with no project) walks every project. Both are unbounded reads like N209's. R28 says "every held aspiration in force", so a bound needs wording first. Also `pursuitOf`'s named requests are one read by key each, with no bound on how many a basis names.
- *legacy-tests:* `test/bounds.test.mjs` 2133–2145 pins `MEASURE_MAX`, `DEPARTURES_MAX` and `SET_ASIDE_MAX` as "driven by no test". Each now has an interface test (N236), so that PIN is legacy-tests' to re-anchor. `bounds`, `derivation-bounds` and `gate-reads` fail as whole files on this checkout both before and after this change (the same 3 files red), so they are not measured here.
- *Generated artifact:* `bio-plane/dist/bio-plane.bundled.mjs` still carries intent's C-111.2 row and the old reads. It is stale, for regeneration at the layer close; not rebuilt here.
- *NO_SUCH_ENTITY* (C-111.5) stays intent's until N285 (T12): `entities`' `noSuchEntity` (its R36) is named in Uses but is not this tranche's share.

**Tests and checks**
- `node --test test/m/intent/`: tests 41, pass 41, fail 0, todo 0. It is red before the source change, as it should be: the R22 NO_SUCH_PROJECT test, the R14 test and `bounds.test.mjs` failed on the old source.
- `format`: 69 modules, 64 requirements files; 0 failures. `architecture intent`: 10 product files, 36 relative imports; 0 failures. `coverage intent`: 28 of 28 live requirement ids named by a test; 0 failures. `ownership intent tranche/T11`: 7 files changed by intent; legacy-checks 0 added, 0 removed; legacy-store 0 added, 0 removed; 0 failures.

Size (session_01WZrsBqtbtRoDpA36xiDFhT): test runs 9, module lines 1840
