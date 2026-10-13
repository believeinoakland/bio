# publication (T47)

**Status** · session_015AcW75HnAxLc3A1Ud8w5dy · depth 2 · COMPLETE · handled B1

## Record

**Read.** Read whole by me: `build/requirements/publication.md`; the module's code under its paths (`src/deliverer.mjs`, `src/publication/index.mjs`, `schema.mjs`, `checks.mjs`, `door.mjs`; `publication/worker.mjs` is `public-read`'s path and was not read); `roles/JOB.md`; my entry in `build/plan/current.md`. The reading set was over the 600 KB limit (BOB's START), so per mechanics §17 (3) a helper in this session read every file under `bio-plane/test/m/publication/` whole (25 files) and wrote me a digest citing each test by file and title; I read `t35.test.mjs`'s stand-ins myself where I copied their shape. The entry is text BOB's and wording only, so no used module's service changed and no used module's public part beyond R53/R23's own references was needed.

**Entries applied.** T47-27:
- (N952) R53's answer: the code already answers `{caseId, edition, group, project, bar, scope, document, bias_acknowledgement, completeness, timeline, opened, ratified_at, manifest_sha, criteria, complete, awaiting, findings, detail}`, `document` with `signed_at` and `published_at` (R70), `timeline` the signed document's block (R62/R63), null with `document` while the edition's document is unsigned, `criteria` R72's frozen rows and `criteria_detail` only when null (pre-T35). No code change; the clause's own tests added (`t47.test.mjs`: the exact key set, the dates, timeline equal to `editionTimeline`, frozen criteria; the pre-T35 arm with a `[]` control; the unratified arm with a signed control).
- (N908) R23: with no provider, `reviewProvider()` answers every grant door dead (no grant admits, no live grant, `NO_REVIEW_COPY`), which is what `case-inputs` R1 reads; tested in `t47.test.mjs` with a registered-provider control. The R23 comments in `index.mjs` now name `case-inputs` beside `case-authoring`.

**Reading of "until the edition is ratified" (R53's `timeline`).** Read as R53's `document` reads it: the edition's case document signed (`case_documents.ratified_at`), not the edition-level completion stamp; the existing `services.test.mjs` R53 test holds that reading (a signed, incomplete edition answers both lanes). No QUESTION raised: the requirement uses one sense for `document` and `timeline`.

**Own code read whole (P20, P8).** No flaw found that this job must fix. Nothing deferred.

**Found in other modules.** None.

**Tests and checks.**
- `node --test test/m/publication/` (bio-plane): tests 146, pass 145, fail 0, todo 1 (R30, not yet met: D-246, as before).
- `node --test test/m/publication/t47.test.mjs`: tests 4, pass 4, fail 0.
- No service I provide changed, so no user module's tests were required (P11); manifest names no layer tests.
- `node checks/format.mjs`: 168 modules, 167 requirements files; 0 failures.
- `node checks/architecture.mjs … publication`: 30 product files, 115 relative imports; 0 failures.
- `node checks/coverage.mjs … publication`: 48 of 48 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … publication tranche/T47`: 3 files changed; 0 failures.
- `node checks/run.mjs`: format 0, architecture 0 failures (3084 files), channels 0; coverage 44 failures, none publication's (inherited reds of other modules).

Size (session_015AcW75HnAxLc3A1Ud8w5dy): test runs 4, module lines 3635

## J1 · COMPLETE

T47-27 applied. R53's T47 field list and R23's case-inputs clause were already met by the code; each clause now has its own tests (t47.test.mjs, 4 tests with controls) and the R23 comments name case-inputs. Module tests 145 pass, 0 fail (R30 todo, D-246). format, architecture, coverage (48/48), ownership: 0 failures for publication. Record: build/jobs/T47/publication.md. Requirements' 'not yet met: T47' marks on R23 and R53 can be lifted (BOB's file).
