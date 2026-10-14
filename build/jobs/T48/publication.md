# publication (T48)

**Status** · session_01NxiFW3LZJq3a1RXLudd7zH · depth 2 · COMPLETE · handled B0

## J1 · COMPLETE

T48-39 applied: R23's seven doors and R40's reader list (case-inputs, case-check) are wording only, as built; the code already gave the seven doors (`REVIEW_DOORS`, `statedEdition` among them) and the stated tables and columns, so no behaviour changed.

**Entries applied**
- T48-39 R23: new tests in `bio-plane/test/m/publication/t48.test.mjs` name R23 and check the seven doors in full: each door in turn left out (or not a function) is `PROVIDER_MALFORMED` with nothing registered, the complete provider then registers and gives those seven doors and no other; `statedEdition(identity, newCase)` and `caseIdentitySentence(caseId, edition, newCase)` (and the other five) are called with exactly the caller's arguments; a second registration is `PROVIDER_DECLARED` naming the first.
- T48-39 R40: two new tests name R40 and run the SQL `case-inputs` writes against `cases` and `case_documents` (owner of a case, the unsigned preparation a named draft links to, the signed editions' text and `ratified_at`; a replacement moves `doc_sha` and `text`, never the draft link; a signed document never changes).
- K3261 (DEC-221): "labelled" re-spelled "labeled" in two comments of `index.mjs`; none is member-facing, no answer or catalogue row held the word.
- N1022: closed by BOB (K3189); the module's own code is 3,635 lines (`index.mjs` 2,746, `schema.mjs` 614, `checks.mjs` 111, `door.mjs` 109, `deliverer.mjs` 55), unchanged by this job.

**Read** (reading set was over the 600 KB limit; no helpers used): `build/requirements/publication.md` whole; every source file of the module whole (`index.mjs`, `schema.mjs`, `checks.mjs`, `door.mjs`, `worker.mjs`, `deliverer.mjs`); of the tests, `fixture.mjs` in part and `casedoc.test.mjs`, `t45.test.mjs`, `t47.test.mjs` for R23 and R40 whole in those parts, the other tests not read (the job changes no behaviour; the whole module's tests were run). The Uses' public parts read only where R23 and R40 name them (`case-inputs`' SQL on `cases` and `case_documents`; `review`'s registration call). No flaw found in this module's code.

**Deferred**: R30 stays *(not yet met: D-246)*, not this entry's. Nothing else.

**Found in another module**: none.

**Run**
- `node --test bio-plane/test/m/publication/` from the repository root's `bio-plane/`: 151 tests, 150 pass, 0 fail, 1 todo (the existing R30 todo).
- `node checks/format.mjs /home/user/bio`: 168 modules, 167 requirements files; 0 failures.
- `node checks/architecture.mjs /home/user/bio publication`: 31 product files, 116 relative imports; 0 failures.
- `node checks/coverage.mjs /home/user/bio publication`: 48 of 48 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs /home/user/bio publication tranche/T48`: 3 files changed by publication between tranche/T48 and HEAD; 0 failures.
- `node checks/run.mjs /home/user/bio`: architecture 0 failures; coverage reds are other modules' ids (33 failures, none publication's); format 0 failures.

Size (session_01NxiFW3LZJq3a1RXLudd7zH): test runs 2, module lines 3635
