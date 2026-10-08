# case-checker (T36)

**Status** · session_012BekBB8UfaZQaG1nz8xvro · depth 2 · WORKING · handled B3

## J1 · QUESTION

R22 details, my best reading (I proceed on it; answer only if you want otherwise):
1. The `criteria` file's content (case-grammar R13, public-read R33: "the rows … in canonical JSON") is a JSON **list** of R72 rows. Anything else is passed to R21 as is, which answers `MALFORMED` `criteria`.
2. `standards_use` is R21's own answer (`{ok, refusals?, unjudged?}`). Each judged row whose `access` is not `free` and that carries no `captures` adds an `unjudged` entry `{standard, portion, body, check: "COPYRIGHTED_TEXT_CARRIED"}`. R21's "not held" entries keep their shape. `COPYRIGHTED_PASSAGE_UNRELIED` is still judged over the row's `passages` and the case's passage rows. R21 itself is unchanged, so case-authoring's pre-flight sees the same answer as before.
3. A `criteria` file that the manifest lists but the case file doesn't carry, or carries with other bytes: `standards_use` is `{ok: null, detail}`. The detail names the file and its SHA-256 to fetch. R9 fills it like any missing file. It adds no entry to any finding (R22: it changes no result).
4. The `/2` spec uses case-grammar's `caseFilePath` spellings for `archive`, `container` and `criteria`. I'll check them against case-grammar's merge.

## Completion

**Reading set (mechanics §17).** Measured at about 245 KB, under 300 KB, and read whole by this session: the requirements; layer 8's row and its case-checker section in `build/layers.md`; the plan's T36-51 entry, rules at the opening and rule 5; K2129 with `plan/draft-T36-L8-L10-reqs.md` ("Choices made", "For BOB", "BOB's review"); the used services named in Uses that this entry touches (`case-grammar` R13 as amended, R22 and its Purpose; `publication` R72, R75; `public-read` R31–R33); every source file and test of the module except `program.mjs` (generated) and the `/6` ZIP fixture (data). No worker summary.

**Entries applied.** T36-51 (N717; K2129), on J1's readings as B2 (K2143) answered them:
- **R22.** `checkCaseFile` answers `standards_use`. It is R21 (`checkStandardsUse`) over the case document, the carried `criteria` file's rows, the document's `materials:` rows and its passages, each with its finding (the signed `passages:` block, else the carried files, as R4 reads them). It is null when the manifest lists no `criteria` file. A judged row whose `access` is not `free` and that carries no `captures` adds an `unjudged` entry `{standard, portion, body, check: "COPYRIGHTED_TEXT_CARRIED", detail}` (`CAPTURES_NOT_CARRIED_STATEMENT`, exported). A file listed but not carried, or carried with other bytes, answers `{ok: null, file, sha256, detail}`. A supplied document matching its SHA-256 fills it (R9). A file that isn't a list answers R21's `MALFORMED`. No finding's result changes. The criteria file does not hold back the complete edition's comparison (it is not rendered from). Per B2, every listed file the case file lacks and no document filled is named in `integrity.documents.wanted` (`{path, kind, sha256, detail}`, manifest order); the criteria file is among them.
- **R14, R15.** `bio-case-file/2`'s specification is held beside `/1` and derived from it. It adds the kinds `archive`, `container` and `criteria` at case-grammar's paths, the criteria row's fields, `subject_entity` on `case_roles:`, `case_conclusions:`, `case_scope` and the completeness statement, and rule 12 "Standards' use" with its codes and words. `/1`'s text is unchanged. `casefilespec` answers both. An unknown version's detail now names "the specifications of bio-case-file/1 and bio-case-file/2". The program's first line names both formats.
- **Improvement in this module.** R21 reads a member's subject through `case-grammar` R22's `memberSubjectOf` (one spelling, K2002). An explicit `subject_entity: null` on the `case_roles:` row now reads as null and does not fall through to `case_conclusions:`. R21's tests pass unchanged.

**Deferred.** None.

**Generated artifacts.** I regenerated `program.mjs` (my module's own artifact) with `node bio-plane/src/case-checker/build-program.mjs`, so the R13 tests pass on this branch: 618,440 bytes, sha256 `3516af48…c4dc`, 71 inputs. BOB regenerates it again at the close. The plane bundle (`dist/bio-plane.bundled.mjs`, `not_product`) is stale from this job's sources (`check.mjs`, `index.mjs`, `spec.mjs`, `program.mjs`, `standards.mjs`): `fleetbundles.test.mjs` names it STALE. That is for BOB to regenerate at the layer's close (J2 REPORT).

**Found in another module.** Only the stale plane bundle above. `answer-envelope` `families.test.mjs` fails on `file-safety`'s `FILE_SAFETY_CHECKS`: accepted red 11, not this job's.

**Tests and checks.**
- `node --test bio-plane/test/m/case-checker/`: pass 52, fail 0 (R22: 6 tests in `standards-offline.test.mjs`, plus the program run and R9's `wanted`; R14: 4 tests).
- Users (the answer gained `standards_use` and `integrity.documents.wanted`): `case-import` pass 88 fail 0; `case-authoring` pass 151 fail 0; `plane` pass 130 fail 0; `system/migrate-released` pass 1 fail 0; `signatures` pass 64 fail 0; `answer-envelope/families` 10 pass, 1 fail (accepted red 11).
- Layer tests: none named in `build/manifest.md`.
- `node checks/format.mjs`: 135 modules, 134 requirements files; 0 failures.
- `node checks/architecture.mjs … case-checker`: 15 product files, 64 relative imports; 0 failures.
- `node checks/coverage.mjs … case-checker`: 22 of 22 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … case-checker tranche/T36`: 10 files changed; 0 failures.

P6: 1,374 lines without the generated `program.mjs`, well under 4,000.

Size (session_012BekBB8UfaZQaG1nz8xvro): test runs 12, module lines 1374

## J2 · REPORT

Generated artifact staled (mechanics §14): the plane bundle dist/bio-plane.bundled.mjs (not_product) is stale from this job's sources (case-checker check.mjs, index.mjs, spec.mjs, standards.mjs, program.mjs); fleetbundles.test.mjs names each as STALE BUNDLE. For your regeneration at L8's close. program.mjs itself is regenerated on this branch (sha256 3516af48…c4dc) and you regenerate it again at the close, after case-authoring.
