# doctypes — requirements

**Status** · DRAFT by a requirements worker for BOB #114, 2026-10-05, on `tranche/T32`, before T33 opens (§5.9), for BOB's review. Split from `docprofile` by copy (K617; scope §2), layer 1 directly after `docprofile`, which it uses. Plan entry T33-13 (the copy, with A LAW 1a and 2: section paths and headings, definitions and exceptions); `docprofile`'s deletion job is T33-12. R1 and R2 are new ids for what `docprofile` R4 and its registry already relied on inside one module and now crosses the seam (the seven types and their order). R3–R8 and R20–R24 are `docprofile` R6, R29, R14, R15, R20, R34, R31, R30, R32, R33 and R35 as they apply to the seven types, moved without change of meaning (each marked "was"); they keep holding in `docprofile` for its own code. R9–R19 are new in T33. Every id is not yet met. Code today: `docprofile/doctypes/` (`generic`, `meeting-agenda`, `meeting-calendar`, `meeting-minutes`, `regulation`, `staff-directory`, `staff-report`); `docprofile` keeps `pipeline.mjs`, `readtext.mjs`, the shared helpers of `doctypes/index.mjs` and the registry seam.

**Size (P6).** About 2,000 source lines copied (entries A §(c)), plus about 300 for the regulation sections and their tests.

## Public

### Purpose

The seven content types: what kind of document a capture is (a meeting calendar, minutes, an agenda, a staff report, an ordinance or resolution, a staff directory, or none recognised), what is in it, and whether a change between two readings of it is meaningful. Each type recognises a document by the vocabulary the active jurisdiction profiles supply, never by vocabulary held in code. The `regulation` type also reads an instrument's or a code's sections, headings, definitions and exceptions.

### Provides

**DOCTYPES and registerDoctypes(register)**
- **R1** `DOCTYPES` lists the seven types in their registration order, which is load-bearing (`docprofile` R4's first CERTAIN match wins): `meeting_calendar`, `meeting_minutes`, `meeting_agenda`, `staff_report`, `regulation`, `staff_directory`, `generic`. `generic` alone carries `fallback: true`. *(not yet met: T33-13)*
- **R2** `registerDoctypes(register)` calls `register` once per type, in R1's order; it is how the plane wires the types into `docprofile`'s registry (A §(c)). Called twice on one registry, it registers nothing the second time. *(not yet met: T33-13)*

**Each type: `{key, label, version, contract, fallback?, detect(ctx), parse(ctx), assess(before, after, ctx)}`.** `ctx` is `docprofile`'s (`doctypeFor`'s and `readText`'s), carrying `text`, `view`, `locate`, `at`, `now` where the caller gives them.
- **R3** (was `docprofile` R6) Every type's own `detect`, `parse` and `assess` takes every LOCAL fact it tests for (furniture, bodies, member titles, enactment kinds, forms and markers, codes, file numbers, report titles and sections, recommendation openers, template blanks, practice deadlines) from `ctx.view`, under the keys `jurisdictions` defines, and holds none in its own code. Place-free language, a publishing system's own page and link shapes, and measured structural floors stay in code. When `ctx.view` is absent, the view is `jurisdictions.combine` of every non-test profile (K39, K880), through `docprofile`'s reader view. *(not yet met: T33-13)*
- **R4** (was `docprofile` R29) Each type declares its `contract`, one of `docprofile`'s `CONTRACT` values: `SUBSTANCE` or `MEMBERSHIP`; `generic` is `SUBSTANCE`. *(not yet met: T33-13)*
- **R5** (was `docprofile` R14, the types' share) Every event a type's `assess` emits is drawn from `site-profiles`' catalogue through `event()`; `meaningful` is always `isMeaningful(events)`, never a second fact beside them. *(not yet met: T33-13)*
- **R6** (was `docprofile` R15, the types' share) Every connection a type emits is either `referential` (`{connection, from, to, relation, why}`) or `temporal` (`{connection, from, to, relation, at, expected_by, why}`); the two are never collapsed. *(not yet met: T33-13)*
- **R7** (was `docprofile` R20 and R34, the reader's share) A type places a reference only where `ctx.locate` says, for the offset it actually read it at; with no locator, or a `null` answer, the entity carries no `source`, never a composed one. A reference read more than once is one entity, `source` its first sighting's, with `occurrences` every place it was read, in reading order, each what `ctx.locate` returned (D-454; K754). *(not yet met: T33-13)*
- **R8** (was `docprofile` R31's exception) `meeting_calendar`'s forward-looking connection ("minutes not yet published") reads `ctx.now` when given and the wall clock only when it is not. *(not yet met: T33-13)*
- Errors: a type's `detect`, `parse` or `assess` may throw only on a defect in itself; `docprofile` catches and states it (its R5, R13, R17, R19).

**`regulation`: sections, definitions and exceptions** (A LAW 1a, 2; ladders §6.4)
- **R9** `parse` gives `form`: `instrument` for an ordinance or resolution (as today), or `code` for a codifier's section of a jurisdiction's code (a code page carries no enacting formula; `measures-T33/time-law.md` §5 measured 0 of 50 detected today). `detect` matches a code section at CERTAIN only when its heading matches a section-number form of a code the view names (`vocabulary.codes`) followed by a title. *(not yet met: T33-13)*
- **R10** `parse` gives `sections`: one entry per section read, in document order, each `{path, number, heading, start, end, source}`. `path` lists the section's number parts from the code's or instrument's top level down (for example title, chapter, section, then subsection markers); `start` and `end` are offsets of its extent in the text read; `source` is R7's. These are the `portion` extents `standards` keys on. *(not yet met: T33-13)*
- **R11** Section numbers, their part separators and the order of subsection markers (letters, numerals, parenthesised letters) are read from the view's code vocabulary, never from code; an instrument's own "SECTION n." headings are place-free and stay in code. Where the text read cannot be divided (no heading matched), `sections` is empty with `sections_why`, never one section standing for the whole. *(not yet met: T33-13)*
- **R12** A captured codifier document that holds exactly one section (the codifier's per-section form, time-law §4) gives that one section with its boundaries exact; one that holds an article's sections (a charter article) gives each section the article's text divides into. *(not yet met: T33-13)*
- **R13** `parse` gives `definitions`: each passage defining a term in the definitional voice ("'X' means …", "'X' includes …", "as used in this chapter, 'X' …"), as `{term, start, end, source, section}`, `section` the path of the section holding it. A term defined twice gives two entries. *(not yet met: T33-13)*
- **R14** `parse` gives `exceptions`: each passage that excepts ("except as provided in …", "notwithstanding …", "does not apply to …", "shall not apply"), as `{start, end, source, section, cites}`, `cites` the section numbers the passage names, read by R11's forms, or `[]`. *(not yet met: T33-13)*
- **R15** Definitions and exceptions are readings, never law relations: nothing here records `defines` or `excepts`; a member does, in `standards` (K1446; ladders §2 LAW). *(not yet met: T33-13)*
- **R16** A section whose heading, text, definitions or exceptions differ between two readings gives `instrument_changed` from `assess`, naming the section path; a section present in one reading only gives it too, naming which. A reading with no sections read on either side reports nothing about sections and says why (R23). *(not yet met: T33-13)*
- **R17** Tested on captured codifier sections (about 50 sections of one code and about 10 charter sections, captured as the plane captures them, with their provenance, under the module's test tree; time-law §5), on the two measured instruments, and on the test profile's code: every section boundary of a per-section document is exact, and each fixture's definitions and exceptions are as a member read them. *(not yet met: T33-13)*
- **R18** The new readings change no verdict the type gave before: the existing fixtures of every type give the same `type`, `confidence`, entities and events they give in `docprofile` today, apart from the added `form`, `sections`, `definitions` and `exceptions`. *(not yet met: T33-13)*
- **R19** `sections`, `definitions` and `exceptions` each carry a stated count of what was read and, where a passage looked definitional or exceptive but could not be placed in a section, list it with `section: null` and why, never dropping it. *(not yet met: T33-13)*

## Private

### Uses

- `docprofile`: the registry seam (`register`), the shared helpers of `doctypes/index.mjs` (`readerView`, `vocabulary`, `vocabPatterns`, `vocabRegex`, `enactmentPatterns`, `enactmentNumber`, `codePatterns`, `practiceValue`, `flatten`, `selfNaming`, `alsoSatisfies`, `entity`, `readAgain`, `referential`, `temporal`, `diffEntities`, `CONTRACT`, `CONFIDENCE`) and `ctx.locate` as `readText` builds it (its R20, R25).
- `site-profiles`: the event catalogue (`event`, `worstSignificance`, `isMeaningful`, `bySeverity`; its R13, R14), `CONFIDENCE` (R4), `unescapeHtml` (R15) for the calendar's keys.
- `jurisdictions`: the combined view (`combine`): its identifier section (enactment forms, as `id-spaces` reads them), and the recogniser-vocabulary section, by kind of fact per type key, exactly as `docprofile`'s Uses lists them today (masthead phrases and the furniture floor, furniture lines, operative-voice and caption vocabulary, code-citation vocabulary, report-template headings, reference-line shapes, directory self-naming words, measured practice thresholds, publishing-system address shapes), plus, for R9–R11, a code's section-number forms and subsection-marker order (T33-2).

### Invariants

- **R20** (was `docprofile` R30) No place is named in this module's code. Every local fact a type tests for (R3) comes from the active profiles; the tests include at least one profile that is not the first profile, for every type. *(not yet met: T33-13)*
- **R21** (was `docprofile` R31) Deterministic over its inputs, apart from R8; nothing in this module reads a store or the network. *(not yet met: T33-13)*
- **R22** (was `docprofile` R32, the types' share) An unrecognised document is never assumed decorated, and a type applied without CERTAIN confidence never asserts "unchanged". *(not yet met: T33-13)*
- **R23** (was `docprofile` R33) A reading, or a diff of two readings, that found nothing is a failed reader stated as such, never an emptied or unchanged document; a mass removal is never reported from a failed read. *(not yet met: T33-13)*
- **R24** (was `docprofile` R35) Every "no" (no match, no confidence, no position, no section, no meaningful change) says which kind of no and why. *(not yet met: T33-13)*

### Satisfies

- `docs/architecture/BIO_Content_Framework_v0_10.md` §4 ("One extension shape: the RECOGNISER") and §16 ("How content is extracted today"); `docs/development/DOCUMENT-PROFILES.md`, whole.
- `docs/architecture/BIO_Capability_Ladders_v0_1.md` §2 LAW (work, version and portion) and §6.4 L2 and L3 (section paths and headings; definitions and exceptions).
- `build/layers.md`, "No jurisdiction in the product"; rulings K617, K1446.

### Suggestions

- **For `docprofile`'s deletion job** (T33-12): keep `CONTRACT` and the helpers exported, so this module's copies import them; `docprofile/registry.mjs`'s `meetingCalendarType` re-export points here until its importers are re-pointed (Rules (9) item 4).
- **For `standards`**: the instrument key and `portion` key are composed there from profile data and R10's `path`; this module names no key.
- Capturing the code through the codifier's JSON API gives one section per document (time-law §4–§5); a text-only segmenter matters for captured PDFs and the charter's article-level documents.
- The definitional and exceptive phrases of R13–R14 are English legal voice, place-free, so they stay in code as the operative voice does today.
