# run-productions (T7)

**Status** · session_01Phb9xWYe7qD4YrUzf54unC · depth 2 · COMPLETE · handled B6

## Record (RUN-PRODUCTIONS #1, session_01Phb9xWYe7qD4YrUzf54unC)

**Entries applied** (plan layer 6: T6-7):
- **Extract per map and requirements** (K3, K31, K82, K83, K102, N54, DEC-49). The code moved to `bio-plane/src/run-productions/`:
  - `index.mjs`: `suggest` (was `suggestVersion`), `suggestionAsWritten` and `suggestionFrontmatter` (were `#suggestionPersisted` and `#suggestionFrontmatter`), `extractPropose`, `extractProposals`, `posFields`, `candidates` (R14), `counts`, the factory `runProductionsOf`, and the ops `runProductionsOps` for `suggest`, `extractpropose` and `extractproposals`.
  - `schema.mjs`: `suggest_refusals` and `proposed_readings`, with their comments, and the purge declaration (R17).
  - `checks.mjs`: the C-27 rows (all but C-27.15) and the C-104 rows, read from the catalogue by key (K182 (2)). `SUGGEST_KINDS` and `SUGGEST_LEVELS` are re-exported.
  - `interim.mjs`: the ai-runs and basis-versions arms handed over by the store (K120).
- The legacy store now:
  - creates the module in its constructor;
  - migrates its tables;
  - filters its purge declarations;
  - spreads its ops;
  - reads `candidates` in `#narrowCandidateList`;
  - reads `counts` in `#counts`.
- Removed from the legacy store: 1,615 lines of `store.mjs` and `schema.mjs`, with 24 added.
- Since B4 (K188), `strength` and `citation` are reached through `strengthOf` and `citationOf`. The origin limit is strength's `ORIGIN_LIMIT`, re-exported as `SUGGEST_ORIGIN_MAX`.
- **D-595 (R9)**:
  - Each suggested leg carries `extent_capture`. That is the capture the leg names when `content.captureFor(target, named)` holds it, and otherwise `content.captureFor(target)`.
  - A question leg carries none.
  - A named capture the record does not hold is C-27.8.
  - basis-versions adds the `leg_capture` composition line (K182 (1)).
- **R13 (DEC-49, K163)**:
  - Every refusal of R10 and R12 carries its C-104 row, except `NO_TARGET` and `NO_SUCH_BUNDLE`.
  - The regions `is-extract-run`, `is-extract-door`, `is-extract-document`, `is-extract-whole-batch` and `is-extract-scope` are marked.
  - `extractProposals` mints `EXTRACT_NO_SCOPE` in place of `NO_SCOPE`.
  - LEGACY-CHECKS #2 REPORT 2 and K163 are applied.
- **R14 (K31)**:
  - `candidates({captureSha, max})` answers `{rows, truncated}`, as basis-versions R40 states.
  - It registers with `onCandidates` when basis-versions offers it. Until then the legacy store's narrow reads it.
- **Strength's R26–R27 (N60), the user's side**: C-27.9 reads `candidatePair`, and C-27.11 and C-27.16 read `candidateIndependence`.
- **K182**:
  - `appendVersion` is called as R28 states.
  - The held compositions (C-27.10) are read under basis-versions R38.
  - The cited rows (R12) are read under inquiry R40 and basis-versions R38, in this module's own SQL.
  - The machine-minted rows are read under content R45.

**Flaws fixed in this module:**
1. The C-27.16 path of the independence trace threw a ReferenceError. `OMAX` was undefined in `suggestVersion`, so the path did not refuse; it now refuses, with the limit taken from strength's answer.
2. `extractProposals` applied its `LIMIT` before the viewer filter:
   - a document the viewer may not see took rows from the list;
   - `truncated` read `>= n`, not a read of one more row;
   - the ratio's 64 documents were cut before the viewer filter.
   
   Now the viewer's gate is inside both statements, and `truncated` is measured by reading one more row (R12).
3. R2's memo key omitted `affirmed_parts` and `affirmed`. Two submissions differing only in those shared one stored refusal. Both now ride the key, as the other member-only fields do.
4. A `level` sent with a kind other than `level-empty` was not written (unchanged). It is now also left out of the candidate that C-27.10 compares.

**Deferred, and why:**
- The C-27 and C-104 rows stay in the catalogue, read by key, until skills imports them from here (K182 (2)). Their `where`s still name `src/store.mjs` (REPORT 1).
- `interim.mjs` holds the ai-runs arm (`runFor`, `boundOf`, `consumeBound`) and the basis-versions arm (`appendVersion`, `basisVersions`, `basisVersionsOf`, `asWritten`), built from what the legacy store hands over. Each provider's CHANGE deletes its arm; `asWritten` gives way to basis-versions' `versionAsWritten`.
- `SUGGEST_LEVELS` stays in the catalogue for the same reason as the rows.

**Found in other modules (REPORT J2):**
1. **legacy-checks** needs an entry that re-points the `where`s of C-27.1–C-27.14, C-27.16–C-27.19 and C-104.1–C-104.12:
   - from `src/store.mjs suggestVersion > …` to `src/run-productions/index.mjs suggest > is-suggest-shape`, `is-suggest-checks` and `is-suggest-write` (the same split by region as today);
   - from `src/store.mjs extractPropose > …` and `extractProposals > …` to `src/run-productions/index.mjs extractPropose > …` and `extractProposals > is-extract-scope`.
   
   Until then the DEC-49 guard fails 3 more lines than its base (103 → 106 on `tranche/T7` @ 2d6f6b5483). These are: one "markers no row claims" line; 8 "arm C could not find function" lines; minus the 5 "region not found" lines and the spread-ceiling line that this change clears.
2. **skills**: `skilldoctrine.mjs` imports `SUGGEST_LEVELS` and `SUGGEST_CHECKS` from the catalogue. Once it imports them from `run-productions`, the rows can leave the catalogue.
3. **basis-versions**:
   - The version is passed as R28 states. The version row carries no `author` and `at`; they are top-level. The interim writes them after `run`.
   - The legs carry `extent_kind: "document"` and `extent_capture`.
   - `onCandidates` is registered when offered.
   - Its `versionAsWritten` and `leg_capture` line are awaited (K182 (1)).
   - The legacy store's `#narrowCandidateList` extract arm is to leave for its R25 and R40.
4. **ai-runs**: `runFor`, `boundOf` and `consumeBound` are awaited in its Provides shape; the interim reads `ai_runs` and `ai_run_bounds` through the store's `#aiRunInSight` until then.
5. **legacy-tests**: old-battery arms that read the moved source, or name the moved code.
   - Measured here and on the base:
     - `suggest` 95/6 (base 101/0): the six source-reading arms (WALK GUARD, markers, REC-75 corpus, D-235 (6), THE SOLE OUTPUT). Every behaviour arm passes.
     - `extractrun` 61/1: `NO_SCOPE` → `EXTRACT_NO_SCOPE`, K163's intended change.
     - `dec65-single-part` 35/2 and `dec65-strength-reach` −1.
     - `run-conditions` W3b, `affordances` §0, `inquirystrength` "op=suggest's candidate pair", `rec114`, `rec119`, `project-sight` 11g++ and `derivation-bounds` +1.
     - `bounds`: two arms cleared and one new.
   - The source-patching controls anchor on the moved text: `suggest.control`, `rec165-production-principal.control`, `dec65-*`, `nc-sk8`, `rec75-sweep`, `identity-claims` (map §4).
   - Unchanged: `narrow`, `purge`, `gate-reads`, `d168`, `airun` and 50 other suites.
6. **queue** (N112): `#counts` reads this module's `counts(hid)` (done here); `op=stats`' other names stay queue's.
7. **connections**: `test/m/connections/factory.test.mjs` "R24, R18, K155" is red on the base too. `captureOf` refuses a second `env` (capture R58).
8. **Generated artifacts**: `bio-plane/dist/bio-plane.bundled.mjs` is stale, since the plane's source moved.

**Tests and checks:**
- Module: `node --test bio-plane/test/m/run-productions/`: `tests 33, pass 33, fail 0`. These use strength and citation as extracted (one suite) and stand-ins written to ai-runs', basis-versions' and connections' Provides.
- Every module suite (before B4's merge): 1348 pass, 1 fail (connections, red on the base, REPORT 7).
- Layer tests: none named in `build/manifest.md`.
- Old battery: REPORT 5.
- Checks (civicos-process @ 4ae7694):
  - `format: 69 modules, 64 requirements files; 0 failures`
  - `architecture: 8 product files, 36 relative imports (0 naming no tracked file, not judged); 0 failures`
  - `coverage: 1 modules, 19 of 19 live requirement ids named by a test; 0 failures`
  - `ownership: 11 files changed by run-productions between tranche/T7 and HEAD; legacy-store: 24 line(s) added, 1615 removed; legacy-checks: 0 line(s) added, 0 removed; 0 failures`

Size (session_01Phb9xWYe7qD4YrUzf54unC): test runs 205, module lines 1173

## CHANGE B6 (K195): basis-versions merged; off its interim

- **Merged `tranche/T7`** @ fd703fbf0a. There were no conflicts.
- **The module builds against basis-versions directly:**
  - `basisVersionsOf(host)` is the provider;
  - `versionAsWritten` normalises the write and C-27.5/C-27.10's comparison, and my `suggestionAsWritten` is deleted;
  - `versionsIn` composes the candidate;
  - `appendVersion` writes the version, which carries `author` and `at` after `run`, as the document held them before;
  - `basisVersions` reads R5's answer back.
- **Its candidate source** is registered with `onCandidates` (R40) at creation.
- **Removed from the legacy store:**
  - the `legacy-store` `onCandidates` line, with its comment;
  - the seven basis-versions readers from the `runProductionsInterim` hand-over;
  - the whole basis-versions arm of `interim.mjs`, of which only ai-runs' `runFor`, `boundOf` and `consumeBound` remain.
- **B6 point 3.** My map gives me `#suggestionPersisted` and `#suggestionFrontmatter`:
  - the first moved at extraction and is now basis-versions' `versionAsWritten` (K182);
  - the second is `suggestionFrontmatter` in `index.mjs`.
  
  `#appendFmRows` is basis-versions' (map §2). The store's `static #appendFmRows` is still read by its other writers; none of them is mine to move.
- **Tests:**
  - module: `run-productions` 33/0 and `basis-versions` 42/0.
  - old battery: `suggest` 94/7. The 7th source arm, "ONE WRITE SITE STILL", reads the write that is now basis-versions'. Every behaviour arm passes.
  - `narrow` 52/0, `extractrun` 61/1 (`EXTRACT_NO_SCOPE`), `purge` 14/0.
- **Checks:**
  - `format: 69 modules, 64 requirements files; 0 failures`
  - `architecture: 8 product files, 36 relative imports (0 naming no tracked file, not judged); 0 failures`
  - `coverage: 1 modules, 19 of 19 live requirement ids named by a test; 0 failures`
  - `ownership: 6 files changed by run-productions between tranche/T7 and HEAD; legacy-store: 2 line(s) added, 13 removed; legacy-checks: 0 line(s) added, 0 removed; 0 failures`

Size (session_01Phb9xWYe7qD4YrUzf54unC, after B6): test runs 265, module lines 1086

## CHANGE B5 (K192): merged `tranche/T7` @ 1da7eeddb4

- **The conflicts** in `store.mjs` and `schema.mjs` were resolved keeping each module's removals:
  - inquiry's legacy backfill, now `ensureLegContent`;
  - capture-requests' door, drain, dispatch and table;
  - this module's suggest and extract regions and tables;
  - both modules' purge filters and migrations.
- **Re-run on the tranche**, where the plane boots, against a worktree of `origin/tranche/T7`:

  | suite | base | mine | why mine differs |
  | --- | --- | --- | --- |
  | `suggest` | 101/0 | 95/6 | the source-reading arms, REPORT J2 5 |
  | `extractrun` | 62/0 | 61/1 | `EXTRACT_NO_SCOPE` |
  | `dec65-strength-reach` | 17/10 | 16/11 | +1 source arm |
  | `capturerequests` | 102–103/36–37 | same | flaky on the base too (3 runs each) |
  | `d168-retired-cite` | 3/2 | 3/2 | — |
  | `inquirystrength` | 54/14 | 54/14 | — |
  | `project-sight` | 230/2 | 230/2 | — |
  | `run-conditions` | 58/1 | 58/1 | — |
  | the DEC-49 guard | 109 | 111 | stale `where`s, REPORT J2 1 |

  Unchanged at mine: `narrow` 52/0, `purge` 14/0, `gate-reads` 115/0, `airun` 132/2, `rec165` 34/1, `dec65-single-part` 35/2.
- **Module tests:** 33 pass, 0 fail.
- **Checks:**
  - `format: 69 modules, 64 requirements files; 0 failures`
  - `architecture: 8 product files, 36 relative imports (0 naming no tracked file, not judged); 0 failures`
  - `coverage: 1 modules, 19 of 19 live requirement ids named by a test; 0 failures`
  - `ownership: 11 files changed by run-productions between tranche/T7 and HEAD; legacy-store: 24 line(s) added, 1614 removed; legacy-checks: 0 line(s) added, 0 removed; 0 failures`
- **Next:** the basis-versions CHANGE moves the module off `interim.mjs`'s basis-versions arm.

Size (session_01Phb9xWYe7qD4YrUzf54unC, after B5): test runs 245, module lines 1173

## J1 · QUESTION

Q1. Seven points where the approved text leaves the build open. Each has my best reading; I am building on them now and will conform to whatever you rule.

1. **The C-27 and C-104 rows (R13, R16).** `skilldoctrine.mjs` (skills) imports `SUGGEST_LEVELS` and `SUGGEST_CHECKS` from the catalogue, and `store.mjs` imports `skillpack.mjs`, which imports `skilldoctrine.mjs`. Removing the rows from `bio-checks.mjs` in this job would therefore stop the whole plane loading until skills re-points its import. Reading: observation-log's precedent. `run-productions/checks.mjs` names the C-27 keys (all but C-27.15) and the C-104 keys, and exports `SUGGEST_CHECKS`, `EXTRACT_PROPOSE_CHECKS` and `SUGGEST_LEVELS`, read from the catalogue rather than copied. The regions R13 and LEGACY-CHECKS #2 REPORT 2 name are marked in my code, and the code mints `EXTRACT_NO_SCOPE`. The rows leave the catalogue once skills imports from run-productions, which needs a CHANGE to SKILLS. The rows' `where`s still say `src/store.mjs …`; only a legacy-checks entry can re-point them, and I will REPORT them. Alternative: I move the rows now and you merge skills with its import re-pointed in the same layer close.

2. **Providers not yet merged (ai-runs, basis-versions, strength, citation, inquiry).** Reading: K120/K146. `runProductionsOf(ctx, deps)` takes each provider injected under its Provides names (`aiRuns.runFor/boundOf/consumeBound`, `basisVersions.appendVersion/basisVersions`, `strength.candidatePair/candidateIndependence`, `citation.retiredNotCitable`). Until each merges, `run-productions/interim.mjs` builds that shape from readers the legacy store hands over: `#aiRunInSight` and its row, the bound upsert, `#strengthWalk`, `#independenceOf`, `#retiredNotCitable`, `promote` and the frontmatter helpers. Each provider's CHANGE deletes its interim arm. `connections.citesInto` and `content` are used directly, since both are extracted.

3. **`appendVersion` (basis-versions R28) does not state what R3, R4 and C-27.5 need.** The request:
   - (a) it takes `{target, base, version: {name, kind, description, claim, relationship, derived_from, run, author, at, level?, observed_at?}, grounds, legs, log}`, where `log` is the Session Log sentence, R4's entry naming the run;
   - (b) it answers promote's answer, refusals unchanged;
   - (c) basis-versions provides the pure normaliser the write applies, `versionAsWritten(submission)` (today `#suggestionPersisted` and `#fmSafe`), so C-27.5 and C-27.10 compare "as the document would store it" without a second copy.
   
   Until then the interim composes as the store does today.

4. **R5 read-back and C-27.10's held compositions.** Reading: through `basisVersions({id: target, limit: 1000, viewer})` (its R8–R9). A `truncated` answer is C-27.16. R5's `composition_grades` comes from that read; it is not in basis-versions' Provides today, so please fold it into R9 or tell me to drop it.

5. **R12's "cited" (a member's leg or version leg names the row).** No provider states it. Reading: `inquiry` and `basis-versions` each gain a set-based `citingContentIds(contentIds) → Set`. Until then the ratio's cited count reads `inquiry_basis.content_id` and `inquiry_basis_version_legs.content_id` inside the interim, as today. The machine-minted rows come from `content`'s R45 read contract.

6. **R14.** basis-versions R25 says the extract source is "registered by ai-runs"; that should read run-productions (map §5.2). Neither side names the registration. Reading: `basisVersions.registerNarrowSource("run-productions", (captureSha, limit) => rows)`. I export `narrowCandidates(captureSha, limit)` answering R14's rows, and register only when the provider offers the method. The store's `#narrowCandidateList` extract arm calls my `narrowCandidates` meanwhile.

7. **R9 (D-595).** A suggested leg carries `extent_capture`: the capture the leg names, if the run named one held for that document, and otherwise `content.captureFor(target)`. An inquiry leg carries none. A named capture not held for its document is C-27.8. The version legs' composition (basis-versions R5) gains a conditional `leg_capture` line so the freeze sees the pin, which is BOB #34's ruling ("through C-25.11's composition"). That is basis-versions' change, not mine. Until it lands the pin is written to the document and is outside the composition.

Also found: in `suggestVersion`, the independence-incomplete refusal uses `OMAX`, which is undefined there, so that path throws a ReferenceError instead of refusing C-27.16. It is fixed in my module (the limit comes from strength's answer).

## J2 · REPORT

Found in other modules. The full text is in my record's "Found in other modules" section; in short:
1. **legacy-checks**: an entry that re-points the `where`s of C-27 (all but .15) and C-104 to `src/run-productions/index.mjs` (`suggest > is-suggest-shape|checks|write`, `extractPropose > is-extract-*`, `extractProposals > is-extract-scope`). Until then the DEC-49 guard reads 106 against 103 on the base.
2. **skills**: import `SUGGEST_LEVELS` and `SUGGEST_CHECKS` from `run-productions`, so the rows can leave the catalogue (K182 (2)).
3. **basis-versions**: I call `appendVersion` as R28 states. `author` and `at` are top-level (the interim writes them after `run`). Legs carry `extent_kind` and `extent_capture`. I register `onCandidates` when it is offered. Awaiting `versionAsWritten` and `leg_capture`. The store's narrow extract arm is to leave for R25 and R40.
4. **ai-runs**: `runFor`, `boundOf` and `consumeBound` are awaited; the interim covers them until then.
5. **legacy-tests**: the old-battery arms that read the moved source. `suggest` has 6 (all its behaviour arms pass); `extractrun` has 1 (`EXTRACT_NO_SCOPE`, K163); there is one each in dec65-single-part (2), dec65-strength-reach, run-conditions, affordances, inquirystrength, rec114, rec119, project-sight and derivation-bounds; and the controls listed in map §4.
6. **queue** (N112): `#counts` now reads `runProductionsOf(ctx).counts(hid)`.
7. **connections**: `m/connections/factory.test.mjs` R24/K155 is red on the base too (capture R58's refusal of a second `env`).
8. **Generated artifact**: `bio-plane/dist/bio-plane.bundled.mjs` is stale.

## J3 · COMPLETE

Complete; handled through B4. Extracted to bio-plane/src/run-productions/ (legacy-store −1,615/+24). Every entry is applied: D-595 (R9), R13, R14, strength R26–R27 through strengthOf, and citation R5 through citationOf. Module tests: 33 pass, 0 fail. format, architecture, coverage and ownership all report 0 failures. Deferred: the rows stay in the catalogue until skills re-points, and the ai-runs and basis-versions interim stays until their CHANGEs. REPORT J2 has the rest. The record is on job/T7/run-productions @ HEAD.

## J4 · COMPLETE

B5 applied. I merged tranche/T7 @ 1da7eeddb4, resolving store.mjs and schema.mjs so that every module's removals stay removed, and re-ran the old suites on the tranche with the plane booting. Every difference from the base is a source-reading arm or EXTRACT_NO_SCOPE (numbers in my record, B5). capturerequests is flaky on the base too. The DEC-49 guard reads 111 against 109 on the base (the stale where's). Module tests: 33 pass, 0 fail. format, architecture, coverage and ownership all report 0 failures (legacy-store +24/−1614). I am ready for the basis-versions CHANGE.

## J5 · COMPLETE

B6 applied: basis-versions is now read directly and its interim arm is gone. The module uses basisVersionsOf(host), versionAsWritten, versionsIn, appendVersion and basisVersions, and registers onCandidates itself. The store's legacy-store onCandidates line and its seven basis-versions hand-overs are removed; interim.mjs keeps only ai-runs. Point 3: #suggestionPersisted became your versionAsWritten, #suggestionFrontmatter is mine (suggestionFrontmatter), and #appendFmRows is basis-versions', still read by the store's other writers. Module tests: run-productions 33/0, basis-versions 42/0. Old battery: suggest 94/7, all 7 source-reading arms; narrow 52/0, purge 14/0. format, architecture, coverage and ownership all report 0 failures (+2/−13).
