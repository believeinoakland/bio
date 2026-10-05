# court-citations (T33)

**Status** · session_01RW5iwkQepeVVJUAjHfuPiQ · depth 2 · WORKING · handled B2

## J1 · QUESTION

Readings I am building on (carrying on meanwhile; none blocks the next step):
1. R4 "reads only the two packages' JSON files": courts-db's own loader also expands `${var}` from its `data/places/*.txt` (31 place lists) and `${m-n}` ordinal ranges; and R3's licence text is in each wheel's `licenses/LICENSE`. Reading: the build also reads those package files (a faithful expansion needs them); all are hashed into `SOURCES.files`.
2. Source files: the pinned files are vendored, in wheel layout, under `court-citations/vendor/{reporters-db-3.2.66,courts-db-0.10.27}/` (~2.9 MB), so R4–R6 run offline in tests; the build checks each file's SHA-256 against its pin and refuses another version. Generated file: `court-citations/court-data.mjs`; its manifest row (§14) is yours to add: owner court-citations, regenerate from the repo root with `node court-citations/build.mjs`, inputs the vendored files.
3. `courtsNamed(text)`: a court is named when one of its patterns matches the whole text (courts-db's default, `allow_partial_matches=False`), case-insensitively (courts-db compiles with re.I), after folding white-space runs and trimming (its `strip_punc`). `patterns` are courts.json's `regex` lists only (5,574, as R3 counts); the name is not a pattern.
4. Reporter patterns ship as `editions[].patterns` (each edition's `regexes`, or the package's default `$full_cite` where it gives none, with `$edition` as the edition and its variants), and each entry's `examples` with it: fields beyond R1's list, which the recogniser may use.
5. R5: the packages give examples per court or reporter entry, not per pattern. An example that no translated pattern of its entry matches withholds all of that entry's patterns, each listed in `untranslated` naming the example.
