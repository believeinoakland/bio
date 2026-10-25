# sources (T51)

**Status** · session_01KVdCT4xo4Q6wdYgc64U2V2 · depth 2 · WORKING · handled B5

## Entries applied

- **T51-186 (B1 · words, K3949; K3962)**: the three findings and two test copies from the first words pass, applied in an earlier session (record J2).
- **B2 · the words round RW (K4015)**: the two findings `checks/words.mjs` lists for `sources` after the `+`-chain check (civicos-process `main` @ e8ac153, which carries the check), both in `bio-plane/src/sources/checks.mjs`. The `BAD_DISCLOSURE` and `NO_SERVICE` translations were literals joined by `+`; each is now one `localize` call with its own id: `sources.checks.a_disclosure_names_what_was_revealed` and `sources.checks.a_result_names_the_service`. The sentence text is unchanged. No requirement text, requirement id or service changed.

## Deferred

None.

## Found in another module, or in a requirement

- The R3 wording (J1 REPORT) is unchanged and still BOB's to decide.
- `checks/run.mjs` shows one `testcopy` finding outside this module: `bio-plane/test/m/screens-investigate/fixtures.mjs:175`, "the sources date them no closer", a fixture sentence of `screens-investigate`. Not mine; reported to BOB in a REPORT.

## Tests and checks run

- `node --test bio-plane/test/m/sources/*.test.mjs`: 38 tests, 38 pass, 0 fail.
- `node checks/words.mjs /home/user/bio sources`: 0 failures (before: 2 `inline`; after: 0).
- `node checks/format.mjs /home/user/bio` (via `checks/run.mjs`): 176 modules, 175 requirements files, 0 failures.
- `node checks/architecture.mjs` (via `checks/run.mjs`): 0 failures.
- `node checks/coverage.mjs` (via `checks/run.mjs`): no finding names `sources`; the run's failures are in other modules.
- `node bio-plane/src/setup-words/build.mjs --check`: the stale-rows note names `sources.checks.a_disclosure_names_what_was_revealed` (new ids, not yet in `rows.mjs`; BOB regenerates it at the layer close). No refusal names `sources`.
- `node checks/ownership.mjs /home/user/bio sources tranche/T51 job/T51/sources`: 1 file changed by `sources`; 0 failures.

Size (session_01WG9setBbZFc6ABChv97kKy): test runs 2, module lines 1077


## J1 · REPORT

sources R3 quotes the claim sentence as "not confirmed by the group"; the word row sources.named_confirmed_group (words.json, the design stream's) reads "not confirmed by the team", and the module reads that row through claimSentence. Not changed: requirement text is yours to fold, and the row is the design stream's. Which wording stands is yours to decide. Details in build/jobs/T51/sources.md.

## J2 · COMPLETE

T51-186 sources done (K3949, K3962): the 3 words findings and the 2 test copies fixed, commit bd3a368490 on job/T51/sources. Tests: sources 38/38 pass. Checks: format, architecture, coverage, ownership and setup-words clean; the words check reads zero for sources. Record: build/jobs/T51/sources.md. No requirement changed; one REPORT (R3 wording).

## J3 · REPORT

Words round RW (K4015) for sources: the two findings are fixed (commit 6b4b893d7e on job/T51/sources); the words check reads 0 for sources, the module's 38 tests pass, ownership is clean. The R3 wording question (J1) stands; the setup-words rows for the two new ids are stale, as expected until the layer close. One finding outside this module, not changed: checks/run.mjs lists testcopy bio-plane/test/m/screens-investigate/fixtures.mjs:175, "the sources date them no closer" (a screens-investigate fixture sentence). Details in build/jobs/T51/sources.md.

## J4 · COMPLETE

B2 (words round RW, K4015) done: sources' two findings fixed by localize (checks.mjs BAD_DISCLOSURE and NO_SERVICE), commit 6b4b893d7e. Checks: words 0 failures for sources; tests 38/38; format, architecture, coverage clean for sources; setup-words --check shows only the expected stale-rows note; ownership 0 failures. Record: build/jobs/T51/sources.md.

## J5 · COMPLETE

COMPLETE for FR-55 (sources, T51; K4206). Commit a97c03ed66 on job/T51/sources.

**Entries applied**
- B3 entry 1 (K4206): `knockerconsent` declared in `DECLARED_OPS` (bio-plane/src/sources/index.mjs). Row: `classes: null` (no account), `mutating: true`, `weight: "credential"` (the ground op-grades holds for it), `description` = localize("sources.declared.knockerconsent", the op's hand sentence). Both must agree with the hand rows (op-declarations R81, op-grades R50), and they do. `fields.accepts`: `knockerSecret`, `entry`, `audience`, `withdraw`, the fields the arm reads. The connecting address and the instant are control-plane stamps, so they are not accepts.
- `fields.requires` is empty, by design: R11 says every failure answers SECRET_NOT_RECOGNISED, naming no field, so a refusal names no required field. No refusal was changed, and no meaning was changed.
- Requirement: new R22 in build/requirements/sources.md, marked *(not yet met: T51)*, as B4 asks. The Status line now says T51 (K4206). I wrote the line myself in the module's requirements file, not in this record.
- Tests: build/requirements/sources.md R22 is named by two tests in bio-plane/test/m/sources/declared-ops.test.mjs. (1) declaredOpHolds holds the declaration. (2) A door-level test (sourcesOps → knockerconsent) shows that a consent with all accepted fields is ok, and that each omitted field (knockerSecret, entry, audience) answers the same SECRET_NOT_RECOGNISED as a wrong secret.
- Seen failing: with the row removed, test (1) fails ("declaration has no fields.accepts and fields.requires arrays"). Test (2) passes with or without the row. It is a control for the uniform refusal that already held, not a red test for the fix.
- test-support is already in `uses`, so BOB needs to add nothing.
- Deferred: none.

**Found in other modules (P9; none is in sources; all fail identically with my change stashed, so they predate it)**
- op-grades / op-declarations collector suites: R42 (MARKS frozen and total over the rungless acts: `expertisewithdraw` is the one op the actual and expected lists disagree on), R46 (rungless registered act has an entry), and R73 (R21, T50; the wizard-scripts declaration check, registryActGaps). 3 of 441 tests fail.
- words testcopy failures in bio-plane/test/m/op-grades/t36.test.mjs (lines 47, 49, 52, 55, 59), t47.test.mjs:36 and t48.test.mjs:34.
- coverage (`checks/run.mjs`): live ids named by no test in agent-harness (R17), agent-runner (R37, R38, R40), citation (R16–R18), installer-steps (R26, R31), journey-check (R19), link-sweep (R13–R15), monitoring (R75–R77).

**Checks and tests (run from the process repository, with node_modules installed for every tracked lockfile directory)**
- `node --test bio-plane/test/m/sources/declared-ops.test.mjs`: 6 pass, 0 fail.
- `node --test bio-plane/test/m/sources/`: 44 pass, 0 fail.
- `node checks/run.mjs /home/user/bio`: format 0 failures; architecture 0 failures; coverage: nothing for sources (the failures are the other modules listed above); words: 0 failures for sources (the 7 testcopy failures are in op-grades, above).
- `node checks/ownership.mjs /home/user/bio sources tranche/T51 job/T51/sources`: 0 failures.
- Collector suites (op-declarations, op-grades, test-support): 438 of 441 pass; the 3 failures above are the same with and without my change.

Size (session_01HJVgnne3GN9P39oYCyyD1Q): test runs 7, module lines 1095

## Fix round 10, Wave A batch 2 (B5; START build/plan/starts-T51-F10/sources.txt)

**Causes:** none placed to this module; its part is the provider side of two fixtures.

**Fixtures published** (commit b95abac1b9 on job/T51/sources), in `bio-plane/test/m/sources/fixtures.mjs`, each made by the real `sources` over the world `fixture.mjs` builds, at test time, never stored:
- `rungOf` (users now: consequences 1): `held` is the real `rungOf({source, viewer})` for a source a pulled knock holds (rung `same_knocker`, the secret proves the pseudonym; R9); `unheld` is the real `NO_SUCH_SOURCE` for an id no one holds.
- `sourceOfReads` (users now: case-disclosures 1): `none` (a sha no capture holds) and `fetched` (an acquisition capture with no knock) answer the real `NO_SUCH_SOURCE`; `withSource` is the real `sourceOf` answer for a pulled knock (its source, verbatim, and history; R1); `publishable` is the real `publishableAt({source, audience: "group"})` for that source, empty with no consent (R8).

Each fixture has a test of its own in `bio-plane/test/m/sources/fixtures.test.mjs` (R9; R1, R8), which checks the real answer at the interface.

**Lines of the sources module's own** (its checks): none. The fixtures check finds no candidate with `sources` as the user (`checks/fixtures.mjs /home/user/bio sources`: 0 failures). The check run from the relative root `.` reports 0 for every module (K5066); the absolute root was used.

**Markers added:** none (no `fixtures-own` or `fixtures-generic`).

**Deferred:** none. The users' re-points are in their own jobs (consequences, case-disclosures), as the START says.

**Found in another module:** none.

**Tests and checks run**
- `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit bio-plane/test/m/sources/fixtures.test.mjs`: first run 1 of 2 failed (my assumption that a knock with a secret sits at `unknown`; it is `same_knocker`, as R9 and R1 say); fixed in the test and the fixture comment; 2 of 2 pass.
- `… bio-plane/test/m/sources/*.test.mjs`: 46 pass, 0 fail.
- `node checks/format.mjs /home/user/bio`: 178 modules, 178 requirements files, 0 failures.
- `node checks/architecture.mjs /home/user/bio sources`: 0 failures.
- `node checks/coverage.mjs /home/user/bio sources`: 22 of 22 live requirement ids named by a test, 0 failures.
- `node checks/words.mjs /home/user/bio sources`: 0 failures.
- `node checks/fixtures.mjs /home/user/bio sources`: 0 failures.
- `node checks/ownership.mjs /home/user/bio sources tranche/T51 job/T51/sources`: 3 files changed by sources, 0 failures.
- `node build/plan/impact.mjs origin/tranche/T51 HEAD`: sources 1 of 11 test files, retrieval-browse 2 of 12 (the change does not touch retrieval-browse; its two named files run and pass, 20 of 20).

Size (session_01KVdCT4xo4Q6wdYgc64U2V2): test runs 3, module lines 67
