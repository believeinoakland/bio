# court-citations — requirements

**Status** · DRAFT by a requirements worker for BOB #114, 2026-10-05, on `tranche/T33` (open), for BOB's review. New module, layer 1, directly before `id-spaces`, which reads it (plan Rules (2); K1504, Choices 2 and 3). Plan entry T33-8 (A COURTS (d) 2a; K1449), entered on GO (K1506; `measures-T33/courts-workbooks.md` §2). Every id is new and not yet met (T33-8). Code today: none.

**Size (P6).** About 300–500 lines of code and tests, plus the generated data file (about 3.6 MB of source JSON, translated). The generated file is not counted against P6 (§14).

## Public

### Purpose

Free Law Project's reporters-db and courts-db as versioned data: every reporter with its spelling variants and the courts with their name patterns, translated from the packages' JSON and Python regular expressions into JavaScript at build time, with their licence and source named. It is the data the citation recogniser (`id-spaces` R27) reads. It recognises nothing in a document itself, resolves no citation, and holds no record.

### Provides

**REPORTERS, VARIANTS, COURTS, SOURCES** (frozen exports of the generated data file)
- **R1** `REPORTERS` lists every reporter of the pinned reporters-db, each `{key, name, cite_type, editions: [{key, start, end}], variations}`: `key` the standard abbreviation, `editions` each edition's abbreviation and date range as the package gives them (`null` where it gives none), `variations` the package's variant spellings mapped to the edition they stand for. `VARIANTS` maps every variant and every standard abbreviation to `{reporter, edition}`; a variant the package maps to more than one edition maps to each, never to one chosen. This is the shape `id-spaces.recogniseCitations` reads as `reporters` (its R27). *(not yet met: T33-8)*
- **R2** `COURTS` lists every court of the pinned courts-db, each `{id, name, citation_string, type, level, system, jurisdiction, dates, patterns, examples}` as the package gives them, `patterns` the court's name patterns translated by R4. *(not yet met: T33-8)*
- **R3** `SOURCES` names, for each package, `{package, version, licence: "BSD-2-Clause", url, files: [{name, sha256}], counts, copyright}`: the pinned version, the SHA-256 of each source file the build read, the counts the build found (reporters, editions, variations, courts, patterns; at the measured versions, reporters-db 3.2.66 and courts-db 0.10.27, 1,236 reporter keys and 2,369 variations, 2,809 courts and 5,574 name patterns), and the package's copyright and licence text, carried whole as the licence requires. *(not yet met: T33-8)*

**The build: `buildCourtCitations({reportersDir, courtsDir}) → {ok, file, untranslated}`, `verifyFresh() → {fresh, why}`**
- **R4** The build reads only the two packages' JSON files at their pinned versions and writes one JavaScript data module. Each Python regular expression is expanded and translated to an equivalent JavaScript one: courts-db's `${var}` templates from its `variables.json`, reporters-db's `regexes.json` templates, Python named groups `(?P<name>…)` as `(?<name>…)`, and every other Python-only construct the packages use. Each translated pattern compiles in JavaScript. *(not yet met: T33-8)*
- **R5** Every translated pattern is tested against the package's own `examples` for its court or reporter: each example the package says matches must match the translation, and the test names each one that does not. A pattern that cannot be translated, or whose translation fails an example, is listed in `untranslated` with its source key and why; it is never dropped silently and never shipped as a pattern. *(not yet met: T33-8)*
- **R6** `verifyFresh` rebuilds without writing and answers `fresh: true` only when the result equals the committed data file byte for byte; with the packages' files absent it answers `fresh: null` with why ("could not check"), never `true`. The data file is a generated artifact, listed with its command in `build/manifest.md` (PROCESS-MECHANICS §14). *(not yet met: T33-8)*

**reporterFor(spelling), courtsNamed(text)**
- **R7** `reporterFor` answers `VARIANTS`' entries for a spelling exactly as written, then after folding white space and the periods the package's variants differ by only, or `null`. `courtsNamed` answers the ids of every court one of whose patterns matches `text`, in `COURTS` order, or `[]`. Neither throws, for any input. *(not yet met: T33-8)*

## Private

### Uses

None. The build reads the two packages' files from a local directory; nothing at run time reads the network or a store.

### Invariants

- **R8** Pure data: no store, no network, no clock at run time; the same pinned versions always give the same data file. *(not yet met: T33-8)*
- **R9** Kept apart from `jurisdictions`: no profile holds or copies this data, and nothing here is selected by the active profile. The data covers every court the packages list; no behaviour of this module branches on a place, and its code names none (the data's own court names are a third party's dataset, carried as data). *(not yet met: T33-8)*
- **R10** Nothing here asserts that a citation is real, resolved or verified: a reporter recognised is a spelling recognised. Verification is `standards`' resolver (a held capture stating the citation), and an outside lookup is `acquisition`'s, off by default (K1449). *(not yet met: T33-8)*

### Satisfies

- `docs/architecture/BIO_Capability_Ladders_v0_1.md` §7.3 L1 (numbers and reporter citations recognised; citations verified or "not verified"), §7.4 L1 and L2 ("reporters-db and courts-db as profile data"; "Citations"), §7.5 L4 (free data; most citations read "not verified").
- Plan T33, "Measured GO (K1506)" and entry T33-8; rulings K1449, K1504 (Choices 2, 3), K1506.

### Suggestions

- **For `id-spaces`** (T33-9): R27 there names "1,167 reporters, 2,102 variants", the README's older figures; the pinned version gives more (R3). The recogniser should read the counts from `SOURCES`, not hold them.
- **Placement against the layers rule.** `build/layers.md` says only `jurisdictions`' profile data names a place, while the plan keeps this data out of `jurisdictions` (P6; K1504). R9 reads it as a third party's place-neutral dataset of every court. BOB may want one sentence in `layers.md` that says so.
- The packages' wheels are fetched once, outside the run, at the pinned versions, and their hashes are checked against R3's `files`. A version bump is a job: it changes `SOURCES` and the counts, and reruns R5.
- reporters-db also carries `laws.json` and `journals.json` (statute and journal citations). They are out of T33's entry and are not carried.
- Python constructs to expect: `(?P<name>…)`, `(?P=name)` back-references, inline flags such as `(?i)`, and possessive or atomic forms. JavaScript's `v` flag covers most of them. Whatever it does not cover goes to `untranslated`.
