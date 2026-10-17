# basis-versions (T50)

**Status** · session_01A9kABDFujBr9RPjNiuHGvd · depth 2 · COMPLETE · handled B1

## J1 · QUESTION

Four readings I carry on with; each is cheap to change if you read it otherwise.

1. R51 bound vs C-25.1. R51 allows a reading of 1 to 500 characters, and the version copies it into `description`, which the grammar (C-25.1) holds to at least 12 characters. A reading of 1 to 11 characters passes `BAD_READING` and then lands as `BASIS_VERSION_REFUSED` (`VERSION_NO_DESCRIPTION`), nothing written. My reading: leave R51 as drafted (the description rule is the version's). If you want it caught earlier, `BAD_READING` takes a 12-character floor (its key's words say "must say something", not a number).
2. R51 "`reading` with `version` or `commentary` without a project": I read it as (reading with version) is refused, and (reading with commentary, no project) is refused; commentary beside a project stays allowed, as it is beside a named reading.
3. A question with no grounds has one implicit part. The copied version needs a total partition (C-25.5), so its legs carry the part label `g1` with the explicit no-claim value (DEC-65). It is never drawn (one part asks nothing, R53). If a screen should show a part name for it, that is a words key no list holds yet.
4. The question's live legs are its `basis[]` rows whose `cites` edge it has not severed. A leg the version grammar does not take (C-25.10: only information or another question; e.g. a standard or a calculation) refuses the whole act as `BASIS_VERSION_REFUSED`, nothing written. So a question resting on such a leg cannot be concluded with an own reading until the grammar takes that leg kind.

## Completion (T50-12)

**Entries applied** (requirements `build/requirements/basis-versions.md`, K3637):
- **R51** `conclude` takes `reading` (and `affirmed`, `preview`): one version authored by the member, `accepted` by her, carrying her words as `claim` and `description`, the question's live legs and grounds copied as the document holds them, a minted name `reading-<n>` (unique in the question, `VERSION_NAME_RE`); with a project it is also the project's CURRENT and one `concluded` row in a second promotion (the project's two rows in one write), without one the question moves to `concluded` in the same promotion as the version. `BAD_READING` (words by key). `NO_CLAIM`'s words are `refusal.NO_CLAIM`; the row's English is gone. R48's bias applications, R49's machine-passage read (asked by R6's check over the copied legs, author the member), `NO_BASIS`, `NO_FALSIFIER` and the rest stand; all texts and checks are built before the first write, `preview` runs the module's own check over the text it would write.
- **R52** every act that writes the question's document (`versionAccept/Reject/Consider/Revert/Hide`, `narrow`, `appendVersion`, `conclude` without a project) answers `inquiry`'s `DIVIDED_CANNOT_RESTRUCTURE` (the helper `dividedCannotRestructure`, with inquiry's own text and children) on a divided question, before any other refusal that would hide it; project acts unchanged.
- **R53** `VERSION_AFFIRMATION_INCOMPLETE` carries `part` (the first part not named, in the reading's order) and its translation is `refusal.VERSION_AFFIRMATION_INCOMPLETE` filled with it; `basisVersions` answers `parts` (all of a version's parts in leg order, read in SQL so the leg bound hides none).
- **R54** `VERSION_NAME_MALFORMED` (C-25.36, words `refusal.VERSION_NAME_MALFORMED`) for a name outside the form; `VERSION_NAME_NOT_UNIQUE` only for a repeat.
- Refactors that carry the above: one `#affirmation` (the six acts and R51 share it), `#withVersion` (`appendVersion`'s row writer, now also writing an already-moved row), `#biasInForce`, `#concludedText`, `EXTENT_FIELDS` and `LEG_COPY_KEYS` at module level (`narrow` reads them), `NO_BASIS_DETAIL`.

**Tests added** (each names its id): `own-reading.test.mjs` (R51, with R49, R12, R14 arms and controls), `divided.test.mjs` (R52, with its control, previews and the equality with inquiry's own refusal), `affirmation-part.test.mjs` (R53), `name-form.test.mjs` (R54). Changed: `grammar.test.mjs` (R1/R54 name codes, R35 now C-25.1–C-25.36), `versions.test.mjs` (the wire map drives and pins C-25.36), `registration.test.mjs` (R43's golden is `inquiry-grammar`'s and keeps the old code for the one finding R54 recodes; read through a stated `amended()`).

**Deferred** (with why): none of my own. Open for BOB, J1: the 12-character floor under R51's 1 to 500, the commentary reading, the part label `g1`, legs the version grammar does not take (C-25.10).

**Found in other modules**
- `inquiry-grammar`: `test/m/inquiry-grammar/golden.json` and its corpus record the name finding as `VERSION_NAME_NOT_UNIQUE` / C-25.2 for a malformed name (INQ-2026-0131-versions-bad); with R54 the finding is `VERSION_NAME_MALFORMED` / C-25.36. Its own tests do not run this module's grammar, so they stay green; this module's R43 test reads the golden through `amended()`. A golden regenerated at some later point should carry the new code, and `amended()` then goes.
- Inherited reds, not mine, red before my change (same three on `tranche/T50`): `op-declarations` `t33.test.mjs` (R19, R6) and `t47.test.mjs` (R54, R60), `answer-envelope` `families.test.mjs` (R15, R7, R2).
- Size: the module is 4,028 lines of code with this job (3,782 at START), just past the ~4,000 mark. BOB's note 3: it still runs; the `conclude` family's split is T51's first entry (P6).
- Words: `refusal.NO_CLAIM`, `refusal.BAD_READING`, `refusal.VERSION_NAME_MALFORMED` and `refusal.VERSION_AFFIRMATION_INCOMPLETE` are read by key. Details (the diagnostic `detail` fields) remain this module's English as before, as the other refusals' are. `refusal.VERSION_NAME_NOT_UNIQUE` exists as a key; its row still carries its own sentence (not mine to change without a requirement).

**Tests and checks run** (at commit 862a4009d9):
- `node --test bio-plane/test/m/basis-versions/`: tests 174, pass 174, fail 0 (155 before; 19 added).
- The 57 other test files that mention this module or its codes: tests 812, pass 804, fail 3; the three are the inherited reds above, red on `tranche/T50` before my change (checked by stashing).
- `node checks/format.mjs`: `171 modules, 170 requirements files; 0 failures`.
- `node checks/architecture.mjs bio basis-versions`: `33 product files, 111 relative imports (0 naming no tracked file, not judged); 0 failures`.
- `node checks/coverage.mjs bio basis-versions`: `1 modules, 51 of 51 live requirement ids named by a test; 0 failures`.
- `node checks/ownership.mjs bio basis-versions tranche/T50`: `11 files changed by basis-versions between tranche/T50 and HEAD; 0 failures`.
- `node checks/run.mjs bio`: format 0 failures, architecture 0 failures (3,450 files), channels 0 failures; coverage 37 failures, none on this module (other modules' ids not yet named, their own jobs).

Size (session_01A9kABDFujBr9RPjNiuHGvd): test runs 19, module lines 4028
