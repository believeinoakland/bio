# skills (T19)

**Status** · session_01CzVxoTSdmzkFH6wddsCLyf · depth 2 · COMPLETE · handled B4

## Completion (SKILLS #7)

**Entries applied** (`build/plan/current.md` L6 skills, amended, K766; `draft-T19.md` L6; B1, B3, B4):
- **Rule 1, re-points.** No skills file, product or test, imports `bio-checks.mjs`.
  - `src/skilldoctrine.mjs`:
    - `BASIS_ROLES` and `EARNED_GRADE_SOURCES` come from record-grammar.
    - `VERSION_GROUND_UNASSERTED` (C-25.6, `BASIS_VERSION_CHECKS`) and `MACHINE_CANNOT_CONCLUDE` (C-32.2, `CONCLUDE_ACT_CHECKS`) come from basis-versions.
    - `MACHINE_CANNOT_GROUND` (C-32.8) comes from inquiry-grammar's `INQUIRY_GRAMMAR_ROWS`.
    - `cannot_publish` is the literal `"C-32.6"`, with a comment saying why (K787 (6), K811).
    - The header comments that said "read off catalogue rows" now say "their owners' rows". The C-2.8 note now states what the suite actually pins.
  - `src/skillpack.mjs`: `sha256HexSync` comes from record-grammar.
- **Tests** (`test/m/skills/`):
  - The fixture's `catalogue` is replaced by `owners`, the fence families of the earlier owners: strength `STRENGTH_BAR_CHECKS` (C-32.9), basis-versions `CONCLUDE_ACT_CHECKS` (C-32.2), and inquiry-grammar `INQUIRY_GRAMMAR_ROWS` (C-32.8), the last named in the fixture as `INQUIRY_GRAMMAR_CHECKS`. `published().fences` is `machineFences(owners)`.
  - R1 and R27's child scripts use the fixture's `published` instead of importing the catalogue.
  - R3 checks each fence's `says` against its owner's row.
  - R7's whole-catalogue walk is now a walk of the owners' families (K787 (3)).
  - R15 reads the owners' keyed rows. It asserts that exactly C-2.8 and C-32.6 are typed: they are the only C-number literals in the source, neither is in any earlier owner's keyed row, and each is cited.
  - R23's corpus reads record-grammar.
  - R24's inputs use `owners`.
  - `version.test.mjs`' arm walking the catalogue for a copy of C-22.7 is dropped (K787 (3)). Its minting-site arm stays.
- **N430** (K766): `src/skillpack.mjs` is kept. Its reader is `control-plane/index.mjs`:20 (`machineFences`, `renderPack`).
- **No requirement of mine was marked for T19.** BOB re-worded R15 (K811). It is met and tested ("R15 …", `doctrine.test.mjs`).

**Deferred:** nothing.

**Found in other modules (REPORT):**
- **The plane bundle** (`bio-plane/dist/bio-plane.bundled.mjs`, `not_product`) is stale. `skillpack.mjs` and `skilldoctrine.mjs` are its inputs through control-plane, and their imports changed. BOB regenerates it at the layer close (§14).
- `skilldoctrine.mjs` no longer reads the catalogue's `MACHINE_FENCE_CHECKS` or `BASIS_VERSION_CHECKS`. That removes one importer of each for the job that deletes them under rule 1.

**Tests and checks** (on `job/T19/skills` after merging `tranche/T19` @ K817):
- `node --test --experimental-test-module-mocks bio-plane/test/m/skills/`: tests 39, pass 39, fail 0.
- `node checks/format.mjs`: 87 modules, 82 requirements files; 0 failures.
- `node checks/architecture.mjs … skills`: 7 product files, 43 relative imports; 0 failures.
- `node checks/coverage.mjs … skills`: 29 of 29 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … skills tranche/T19`: 7 files changed by skills; legacy-checks 0 added, 0 removed; 0 failures.
- No layer tests are named in `build/manifest.md`. I changed no service I provide: the exports and the rendered pack are unchanged.

Size (session_01CzVxoTSdmzkFH6wddsCLyf): test runs 5, module lines 1703

## J1 · QUESTION

R15 vs K787 (6). R15 says every clause's `enforced_by` C-number is "read from the catalogue by key, never typed, except C-2.8, which has no keyed row". K787 (6) has skills name C-32.6 (`MACHINE_CANNOT_PUBLISH`, held by case-authoring, later in the order) as the literal `"C-32.6"`, so it becomes a second typed number.

My best reading, which I am building on: R15's exception list is C-2.8 and C-32.6 (C-32.6 typed because its holder is later in the order, P4; case-authoring's L8 tests assert its row's id equals skills' `cannot_publish`). My R15 test will assert exactly those two numbers are typed and every other one is read from an owner's keyed row (strength, run-productions, run-rules, basis-versions, inquiry-grammar). Please amend R15's wording to name C-32.6 (yours, requirements), or tell me otherwise.

Also, for the record: per K787 (3) I dropped `version.test.mjs`' arm walking the catalogue for a copy of C-22.7, and `pack.test.mjs` R7's whole-catalogue walk (now a walk of the owners' families). I am waiting for inquiry-grammar and basis-versions to merge early before re-pointing `MACHINE_FENCE_CHECKS`/`BASIS_VERSION_CHECKS` (the record-grammar re-points are done).
