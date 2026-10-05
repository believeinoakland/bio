# court-citations (T33)

**Status** · session_01RW5iwkQepeVVJUAjHfuPiQ · depth 2 · COMPLETE · handled B2

## Completion

**Paths** (for `modules.json`, BOB's at merge): `paths` `["court-citations/"]`, `tests` `["court-citations/test/"]`, `uses` `[]`. Generated artifact (§14, K1514): `court-citations/court-data.mjs`, owned by court-citations, regenerated from the repository root with `node court-citations/build.mjs` (verify: `node court-citations/build.mjs --check`), inputs the vendored pinned files under `court-citations/vendor/` listed in `court-citations/pins.json`.

**Entries applied.** T33-8, R1–R10, on the readings K1514 settled (J1 1–5):
- `index.mjs`: `REPORTERS`, `COURTS`, `SOURCES` (deep-frozen, from the data file), `VARIANTS` (null-prototype, frozen, every variant and edition key to each `{reporter, edition}`), `reporterFor`, `courtsNamed`. Run time imports only the data file (R8).
- `build.mjs`: `buildCourtCitations({reportersDir, courtsDir, out?, write?, pins?})` and `verifyFresh({reportersDir?, courtsDir?, file?})`. It reproduces each package's own loader: reporters-db's `process_variables`/`recursive_substitute`/`substitute_editions`, and courts-db's `load_courts_db` (ordinal ranges, `${var}` from `variables.json` and the place lists, its backslash doubling, parent inheritance). It refuses any file whose SHA-256 is not its pin. `translate.mjs` translates Python `re` to JavaScript with the `u` flag: named groups, `(?P=name)`, global and scoped inline flags, `{,n}`, and Python's Unicode `\d \w \s \b`, `.` and `$` spelled out. Atomic, possessive and conditional groups, and unknown escapes, go to `untranslated`.
- `pins.json` and `vendor/`: the files the build reads, unchanged from the wheels (wheel URLs and hashes pinned), 2.9 MB in total. Data file 1.57 MB.
- Measured at the pins: 1,236 reporter keys (1,262 entries), 1,368 editions, 2,369 variations (3,592 distinct spellings in `VARIANTS`), 1,479 reporter patterns; 2,809 courts, 5,574 name patterns; **0 untranslated**.
- **One point beyond J1 (3), for your confirmation.** courts-db matches each court's *name* as one more pattern (`gather_regexes`), and 69 of its 1,925 examples match only by name (for example a court with no `regex` at all). So the name ships translated as `name_pattern`, apart from `patterns`, which stays at the regex lists only (5,574, as R3 counts). `courtsNamed` and R5's check use both. Without it, R5 would withhold 64 courts' patterns. If you would rather the name not match, it is a one-line change, and R5 then lists those 64 courts as untranslated.
- Equivalence checked during the job, outside the tests: every translated pattern (5,574 court regexes, 2,809 names and 1,479 reporter patterns, 9,862 in all) gives the same whole-match answer as Python 3.11 `re` on 4,067 strings (every example and name, plus Unicode digit, newline and white-space probes). The two answer sets are identical.

**Deferred.** None. P6: about 435 lines of code (translate 127, build 238, index 70) and 310 of tests, above the 300–500 estimate because the translator spells out Python's Unicode classes rather than approximating them.

**Found in other modules.**
- `id-spaces` (T33-9): R27's recogniser can read `REPORTERS[].editions[].patterns` (flags in `SOURCES[0].pattern_flags`, `u`) or build from `VARIANTS`. The counts are in `SOURCES[].counts` (the requirements' Suggestion), not held.
- `build/layers.md`: the requirements' Suggestion about placement stands (courts-db's court names are a third party's dataset, K1511). Nothing in this module's code names a place; the place lists are vendored data files, named only in `pins.json`.

**Tests and checks run** (on b45ea65673, after merging `tranche/T33`):
- `node --test court-citations/test/`: tests 15, pass 15, fail 0.
- `format`: 126 modules, 125 requirements files; 0 failures. `architecture court-citations`: 40 product files, 4 relative imports; 0 failures. `coverage court-citations`: 10 of 10 live requirement ids named by a test; 0 failures. `ownership court-citations tranche/T33`: 41 files changed; 0 failures. Architecture, coverage and ownership were run with this module's `paths` and `tests` set in a working-tree copy of `modules.json` (not committed). With today's empty row, coverage reads 0 of 10 and ownership flags all 40 files.
- `node court-citations/build.mjs --check`: fresh, byte-identical.

Size (session_01RW5iwkQepeVVJUAjHfuPiQ): test runs 9, module lines 745

## J1 · QUESTION

Readings I am building on (carrying on meanwhile; none blocks the next step):
1. R4 "reads only the two packages' JSON files": courts-db's own loader also expands `${var}` from its `data/places/*.txt` (31 place lists) and `${m-n}` ordinal ranges; and R3's licence text is in each wheel's `licenses/LICENSE`. Reading: the build also reads those package files (a faithful expansion needs them); all are hashed into `SOURCES.files`.
2. Source files: the pinned files are vendored, in wheel layout, under `court-citations/vendor/{reporters-db-3.2.66,courts-db-0.10.27}/` (~2.9 MB), so R4–R6 run offline in tests; the build checks each file's SHA-256 against its pin and refuses another version. Generated file: `court-citations/court-data.mjs`; its manifest row (§14) is yours to add: owner court-citations, regenerate from the repo root with `node court-citations/build.mjs`, inputs the vendored files.
3. `courtsNamed(text)`: a court is named when one of its patterns matches the whole text (courts-db's default, `allow_partial_matches=False`), case-insensitively (courts-db compiles with re.I), after folding white-space runs and trimming (its `strip_punc`). `patterns` are courts.json's `regex` lists only (5,574, as R3 counts); the name is not a pattern.
4. Reporter patterns ship as `editions[].patterns` (each edition's `regexes`, or the package's default `$full_cite` where it gives none, with `$edition` as the edition and its variants), and each entry's `examples` with it: fields beyond R1's list, which the recogniser may use.
5. R5: the packages give examples per court or reporter entry, not per pattern. An example that no translated pattern of its entry matches withholds all of that entry's patterns, each listed in `untranslated` naming the example.
