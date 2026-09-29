# conformance (T11)

**Status** · session_01NziJWiXTGxTMsUE4yfrfpB · depth 2 · WORKING · handled B1

## Completion

**Entries applied** (B1, on `tranche/T11` after layer 8's close):
- **N233** (R7): an absent supersession reason (absent, null, empty or blank) answers `NO_REASON`, a new row C-113.22 in this module's family (`#supersession > is-reason-given`); `BAD_REASON` (C-113.17) stays the malformed code: over 500 characters, or not text. Its translation reworded to say so, so the two no longer read alike. Tested both ways, with a reason at the bound accepted.
- **N274** (R1, N208's share): `NO_SUCH_PROJECT` answered through membership's `noSuchProject` (its R78), byte for byte (tested: `deepEqual` to `noSuchProject(id)`, check C-70.5); this module's row C-113.2 and its copied translation retired, the number not reused; the `is-project-seen` markers removed.
- **N297** (my share, N242): the guard's 6 conformance failures cleared: the identical `NO_SUCH_PROJECT` translation and its second mint site (by N274); regions `is-act-complete`, `is-comparison-complete` and `is-question-named` widened past the 4-line/120-character floor (each helper now a block stating the remedy); `OUTCOME_UNKNOWN`'s row `where` now names `determine`, where its region always was. Guard over the real tree: 64 → 58 failures, none of them this module's own share.
- **N296**: every live id (R1–R18) confirmed against the tests. Tests added where they sampled: R18 each cap at the bound and one over, for a determination and for a comparison (part and cap named); R8 and R12 no comparison answer carries a significance key or an outcome. The fixture now answers at the plane's shape (K316: a workerd cursor, `toArray`/`one`; K313: a LIKE/GLOB pattern over 50 bytes throws); the module and every module it builds ran green on it unchanged.

**Marks that hold** (BOB strikes them; `build/requirements/` is not this job's to write): every `not yet met: new module` mark, R1–R6, R8–R17 (N296's 18 with R7 and R18); R7's `not yet met: N233`; R18's `not yet met: K249`; Uses' membership line `not yet met: N274`. R1's text may now say "through membership's `noSuchProject`". R7's wording of the absent case: `NO_REASON` for absent, null or blank; `BAD_REASON` for over 500 or not text (my reading, applied).

**Check rows changed** (promotion R34's to stamp, `CATALOG_VERSION`): C-113.2 retired; C-113.22 `NO_REASON` added; C-113.12's `where` (`#readStandards` → `determine`); C-113.17's translation. The guard's arm A row count is unchanged net (one out, one in); legacy-tests' pins may need re-reading.

**Found in other modules** (reported):
- N217 (BOB's ruling): arm G still names five codes this module mints for its own condition beside another family's row: `ALREADY_SUPERSEDED` (consequences), `NOT_A_PARTICIPANT` and `NO_SUCH_DETERMINATION` (escalation), `NO_SUCH_PROPOSAL` (intent), `NO_SUCH_STANDARD` (standards). `NO_SUCH_STANDARD` is the same condition as standards' own (a standard not held); if standards offered a `noSuchStandard` helper (K231's pattern), conformance would call it.
- affordances: with N233 applied, `determine` can be graded `reasoned` (N233's purpose).
- consequences (guard, not mine): `BAD_REASON`'s translation 35 characters; `NO_REASON` and `BAD_REASON` called at `addressedRecord` with no row in CONSEQUENCES_CHECKS.

**Generated artifacts made stale**: `bio-plane/dist/bio-plane.bundled.mjs` (conformance's source changed; not rebuilt).

**Deferred**: none.

**Tests and checks run**
- `node --test bio-plane/test/m/conformance/`: 30 pass, 0 fail (baseline 29/0; one test added).
- Users of this module, unchanged: consequences 22/0, actions 30/0, escalation 28/0, filings 33/0.
- DEC-49 guard `civicos-ui/check-refusal-codes.mjs` (real tree): 58 FAIL lines (64 before), conformance's own share 0.
- `checks/format.mjs`: 69 modules, 64 requirements files; 0 failures. `checks/architecture.mjs … conformance`: 7 product files, 34 relative imports; 0 failures. `checks/coverage.mjs … conformance`: 18 of 18 live requirement ids named by a test; 0 failures. `checks/ownership.mjs … conformance tranche/T11`: 0 failures.

Size (session_01NziJWiXTGxTMsUE4yfrfpB): test runs 12, module lines 1227
