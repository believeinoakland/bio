# docprofile — requirements

**Status** · DRAFT by BOB #37, 2026-09-25 (T6). Layer 1. Code: `docprofile/` (pipeline, registry, readtext, doctypes; index, recogniser, events and handlers moved to site-profiles in T19, K746). R6 and R30 built in T2 (N3): every local fact comes from the jurisdiction view; the no-view fallback (K39) is permanent behaviour (Bob, K880; N21 struck). Every id met and tested in T2 (2026-09-26; `build/plan/archive/T2.md`). SPLIT on `tranche/T19`, 2026-10-01, by a worker for BOB #80 (K617, K653 BOB-2): the host-stack axis, the shared registry and ladder, the digests, fidelity, the profile record and the event catalogue moved to `site-profiles` (R1–R3, R7–R10, R26–R28 retired here, moved without change of meaning); `docprofile/registry.mjs` stays this module's facade and re-exports `site-profiles`' names, so its importers need no re-point; references to the moved services name `site-profiles`, no meaning changed. SPLIT again for T33, by a requirements worker for BOB #114 on `tranche/T32`, 2026-10-05, from plan entry T33-12 (K617; K1505 (1), plan Rules (4)): the seven content types move by copy to `doctypes` (T33-13), which numbers afresh and marks each moved id "was". R6, wholly the types', is retired as moved to `doctypes` R3. The others `doctypes` copies apply here to this module's own code too, so they stay, each naming the types' share's new home: R29 and R30 amended (the declaration per type and the per-type tests moved to `doctypes` R4 and R20), R31 amended (the calendar's exception moved to `doctypes` R8; this module's own code has none), and R14, R15, R20, R32 and R34 name `doctypes` R5, R6, R7 and R22 as the types' share, wording only. R33 and R35 hold here unchanged (`doctypes` R23 and R24 are copies). R36 (this module holds no content type; the registration is wired by `plane`) added. Not yet met (T33-12), merged after `doctypes` (the copy before the deletion); importers read through this module's re-export until re-pointed (Rules (9) item 4).

## Public

### Purpose

Recognises which content type a captured document is (`doctypeFor`), over the host-stack
identification `site-profiles` gives (`identify`), and, given two captures of the same address, says
what changed between them in LAYERS that stop as soon as one can decide (`assess`), never by
comparing raw bytes. It gives extraction the one entry point that runs the same recognisers over text from any
container (`readText`). Its `registry.mjs` re-exports `site-profiles`' services, so a caller reaches
both through this module. The stack recognisers detect technology and need no jurisdiction
(`site-profiles`). Every registered CONTENT TYPE, by contrast, recognises a document by the vocabulary
one jurisdiction's clerks, staff and systems actually write — a masthead's wording, a code's own
abbreviation, a report template's section names — and takes that vocabulary from the active
jurisdiction profiles rather than holding it in code.

### Provides

**`identify(ctx)`** is `site-profiles`' (re-exported).
- **R1** *(retired: moved to `site-profiles` R1, K617)*
- **R2** *(retired: moved to `site-profiles` R2, K617)*
- **R3** *(retired: moved to `site-profiles` R3, K617)*

**`doctypeFor(ctx) → {type, confidence, signals, considered, also}`** `ctx` carries `site-profiles`' `identify` context
(`headers`, `locator`, `content_type`, `text`) and additionally `handler` (from `identify`), `kind`, and `view`: the combined view of the active jurisdiction
profiles that `jurisdictions.combine` gives.
- **R4** Always returns a type: the first registered content type to match at CERTAIN confidence,
  else the highest-confidence match, else the `generic` fallback at confidence NONE. Confidence is
  `site-profiles`' one ladder (its R3, R4).
- **R5** `also` names every OTHER non-fallback registered type whose own `detect` also matches
  this same `ctx`, so a document satisfying more than one class (measured: about one in twelve)
  states all of them rather than letting the first match stand for the whole document. A type
  whose `detect` throws during this pass is reported as an error entry in `also`, never dropped
  and never propagated.
- **R6** *(retired: moved to `doctypes` R3, K617, K1505 (1), T33-12)*
- Errors: never throws, provided no registered type's own `detect` throws outside the `also` pass
  (R5 states what happens there).

**`digests(bytes, handler, ctx)`** is `site-profiles`' (re-exported).
- **R7** *(retired: moved to `site-profiles` R6, K617)*
- **R8** *(retired: moved to `site-profiles` R7, K617)*
- **R9** *(retired: moved to `site-profiles` R8, K617)*
- **R10** *(retired: moved to `site-profiles` R9, K617)*

**`assess(before, after, ctx) → the layered result`** `before`/`after` are byte arrays of two
captures of one address. `ctx` carries `locator`, `headers`, `sha256`, and optionally `now`,
`before_at`, `after_at`.
- **R11** Runs the layers L1 (stack) through L6 (connections) in order and stops as soon as one
  layer decides. The result carries `stopped_at` (the last layer reached) and `trail` (one entry
  per layer reached, each naming what it said), so how far the reasoning got is always visible.
- **R12** `verdict` is one of: `unwatchable` (the handler is a shell; stops at L1), `identical`
  (byte-identical), `unchanged` (only mechanical bytes differ), `restyled` (only presentational
  bytes differ), `undetermined` (the bytes differ, the stack was not identified at CERTAIN
  confidence, and the handler is not the always-trusted `conservative` one), `changed` (the
  substance differs and, once read, the content type judges the difference meaningful), or
  `routine` (the substance differs but the content type judges nothing meaningful).
- **R13** `meaningful` is `true` only for `changed`; `false` for `identical`, `unchanged`,
  `restyled` and `routine`; `null` for `unwatchable`, `undetermined`, and a content type that
  could not parse the document — never guessed in either direction.
- **R14** `events[]` is drawn from the one significance-graded catalogue (`site-profiles` R13) (`event`,
  `notice`, `routine`; a type naming an event kind the catalogue does not hold is a defect in
  that type, caught by the catalogue itself). `meaningful` is always
  `worstSignificance(events) === "event"`; it is never a second fact carried beside the events. (The content types' own share: `doctypes` R5.)
- **R15** `connections[]` entries are either `referential`
  (`{connection:"referential", from, to, relation, why}`) or `temporal`
  (`{connection:"temporal", from, to, relation, at, expected_by, why}`) — the two are never
  collapsed into one shape. (The content types' own share: `doctypes` R6.)
- **R16** `confirmation` states what was verified UNCHANGED whenever anything was, even alongside
  `changed`/`routine` events on the same result, and is `null` only when nothing was confirmed. A
  read that FOUND NOTHING on either side is reported as a failed reader (`meaningful: null`, a
  stated `why`), never as an emptied or unchanged document.
- **R17** The result also carries `profile` (`site-profiles`' `profileRecord`'s own serialisation of the L1 stack
  identification) and, once L4 is reached, `content_type` (the winning content type's key).
- Errors: never throws; a content type's own `parse`/`assess` throwing is caught and reported as
  `meaningful: null` with a stated reason.

**`readText(supplied, ctx) → {determined, ...}`** `supplied` is a bare string or interface I2's
text shape (`document`, `pages[]`, `paragraphs[]`, `undetermined[]`, `counts`). `ctx` carries
whatever the caller knows (locator, headers, content type, `at`) plus, for the doctype pass,
`view`.
- **R18** `determined:false` when no honest reading may be produced: no text was supplied, or the
  decoded text is mostly undetermined (more undetermined characters than decoded ones — the
  plane's own measured essentially-nothing line). `why` and `partial` state which.
- **R19** `determined:true` otherwise, carrying `partial` (true when any part is undetermined but
  not so much that R18 refused), `text_from` (which shape supplied the text), the recognised
  `stack` and `doctype` (as `site-profiles`' `identify` and `doctypeFor` gave them), the content type's own `parsed`
  result or a `parse_error` naming why it has none, and `position_parts`/`position_why` stating
  whether the supplied text carried enough structure to place a reference at all.
- **R20** The content type's reader is handed a total `locate(offset)` function built from the
  supplied text's own segment map (R23); it may place a reference only where `locate` says,
  never at a position it composed itself. (The content types' own share: `doctypes` R7.)
- **R37** (K1520) `readText` hands the content type's reader the supplied text's structure as `ctx.supplied` beside `text` and `locate`: its pages (a page with no text layer included), `undetermined` markers, `images`, an `ocr` transcription where the caller supplied one, and a sheet's typed `cells` (`office-readers` R30), unchanged. *(not yet met: T33-12)*
- Errors: never throws; a content type's `parse` throwing is caught and reported as `parse_error`.

**`flattenText(supplied) → {text, source, chars, undetermined, reasons, segments, position_why}`**
- **R21** A bare string flattens to itself, with an empty segment map and a stated `position_why`
  (a string carries no container structure).
- **R22** Interface I2's `document` field is preferred when present; a segment map is built from
  `pages`/`paragraphs` beside it ONLY when their own non-empty-item, newline-joined text is
  byte-for-byte equal to `document` — otherwise no map, and `position_why` states that the
  producer's `document` is not its itemised parts joined.
- **R23** With no `document`, `pages`/`paragraphs` alone flatten to their own non-empty items,
  newline-joined, with one segment per surviving item (a `pdf-page` or `doc-para` source, per
  I2's own itemisation).
- **R24** `undetermined` is the producer's own stated count (`counts.undetermined`) when given,
  else summed from its markers; never invented from the text alone.
- Errors: never throws.

**`makeLocator(segments) → locate`**
- **R25** `locate(offset)` is TOTAL: a non-number, a negative number, or an offset inside no
  segment all answer `null`; otherwise the containing segment's own `source`.
- Errors: never throws.

**`fidelity`**, **`profileRecord`**, **`CONFIDENCE`** are `site-profiles`' (re-exported).
- **R26** *(retired: moved to `site-profiles` R11, K617)*
- **R27** *(retired: moved to `site-profiles` R12, K617)*
- **R28** *(retired: moved to `site-profiles` R4, K617)*

**`CONTRACT`** — how a monitored document of a given content type should be watched, declared per
type: `SUBSTANCE` (watch the evidentiary digest; any change is an event, furniture moving a
notice), `MEMBERSHIP` (watch which entries are present and whether each still says what it said),
`UNMONITORABLE` (a shell; nothing is watched, and the absence is stated rather than silently
reported "unchanged") (**R29**). This module holds and exports `CONTRACT` and its three values; each
content type's own declaration of its contract is `doctypes` R4 (T33-12).

## Private

### Uses

- `site-profiles`: `identify` (its R1–R3) for the stack a document was served by; `compare` (R10)
  for `assess`' byte layers L2–L3; `profileRecord` (R12) for `assess`' `profile`; `CONFIDENCE` and
  `makeRegistry` (R4, R5) for the content-type axis; the event catalogue (R13, R14) for every
  content type's events and `assess`' `meaningful`; `unescapeHtml` (R15) for the calendar's keys.
  `registry.mjs` re-exports its names (`digests`, `fidelity` and the rest) for this module's callers.
- `jurisdictions`: the combined view (`combine`). Instrument numbers (an ordinance's or resolution's
  number, in its caption or cited by another document) are recognised with the view's IDENTIFIER
  section, the same forms `id-spaces` uses for `enactment`, so the fact is stated once. For every
  registered content type, the view's recogniser-vocabulary section. By KIND of fact this module needs from it, per
  content-type key:
  - **self-naming/masthead phrases** — the words and qualifiers a clerk's masthead uses to name a
    document as (for example) minutes or an agenda, plus the furniture-recurrence floor that
    tells a masthead (repeats once per page) from a passing reference (once or twice) to the same
    kind of document;
  - **furniture lines** — fixed running header/footer strings (the publishing body's own name, its
    clerk's-office name, a "printed on" stamp) skipped when scanning back for a heading or a
    body's name, so they are never mistaken for either;
  - **operative-voice and caption vocabulary** — the phrases a body uses to ENACT an instrument
    (ordain/resolve, in the operative voice), the words that introduce its own caption (which
    kind of body: a council, a board, a commission), and any series suffix the jurisdiction's own
    captions carry (Oakland's is "C.M.S.");
  - **code-citation vocabulary** — how the jurisdiction names and abbreviates its own code, and
    the words ("Section", "Chapter") it cites a part of that code by;
  - **report-template section headings** — the named sections a staff or agenda report's house
    template uses (recommendation, background, fiscal impact, and the rest), and the phrase(s) a
    report self-names with on its title page;
  - **reference-line shapes** — the format of a source-assigned tracking number an item is filed
    under (for example a Legistar file number's two-digit-year–dash–four-digit-serial shape),
    used as an entity key. This is a DIFFERENT fact from an `id-spaces` identifier space's forms
    (see Suggestions) and is not assumed to be one without a ruling saying so;
  - **directory self-naming words** — the words ("directory", "staff", "roster", "contacts")
    that self-name a staff directory; the recognition floors themselves (the minimum count of
    distinct contact addresses and the share at one organisation's domain) are measured structural
    floors and stay in code, as R6 states (K574);
  - **measured local practice thresholds** — for example, how long a habitually late document of
    a given kind may go before its lateness is worth RAISING a question (never asserting one),
    each fact carrying its own measurement, per `layers.md`'s rule that a profile names the
    measurement each fact rests on;
  - **publishing-system address shapes** — the URL/path patterns this jurisdiction's own systems
    use for an index (a calendar, a list of legislation) and for one record's own page, so a
    content type's own address matching, and a stack handler's index/record distinction, can
    speak about the systems this jurisdiction actually uses rather than assuming Legistar's.

  The exact shape of the recogniser-vocabulary section (how it is keyed, and how a profile
  supplies zero, one or several forms of each kind above) is `jurisdictions`' to define; this
  module needs the kinds of fact above, keyed by content-type key, and needs no fact about a
  place's identity beyond that. The four built-in stack handlers use nothing from this section
  (see Purpose).

### Invariants

- **R30** No place is named in this module's own code (the pipeline, `readText`, the shared helpers
  and the registry seam). That every local fact a content type tests for comes from the active
  profiles, tested with a profile that is not the first for every type, moved with the types to
  `doctypes` R3 and R20 (T33-12). The four stack handlers (`site-profiles`', its R16) hold no such
  facts and need none, because they recognise technology, never place.
- **R31** Deterministic over its inputs: the same `bytes`/`text` and the same `ctx` values always
  give the same answer, with no exception in this module's own code: the calendar's forward-looking
  connection, which reads the wall clock when `ctx.now` is absent, moved with the types to `doctypes`
  R8 (T33-12). Nothing in this module reads a store or the network.
- **R32** The failure asymmetry governs every default: an unrecognised document is never assumed
  decorated (`site-profiles`' `conservative` treats almost nothing as machinery and nothing as furniture, so any
  byte difference is reported), and a recogniser applied without CERTAIN confidence never asserts
  "unchanged" — only `conservative`'s own narrowing is trusted without certainty. (The content types' own share: `doctypes` R22.)
- **R33** A reading, or a diff of two readings, that found NOTHING is a failed reader stated as
  such, never an emptied or unchanged document; a mass removal is never reported from a failed
  read.
- **R34** An entity's position (`source`) is only ever what `ctx.locate` returned for the offset
  the reader actually read it at — never composed, never guessed — and is absent, not invented,
  when the supplied text carried no structure to place it in. A reference read more than once is one entity, `source` its first sighting's, carrying `occurrences`: every place it was read, in reading order, the first included, each what `ctx.locate` returned for that read (null where it could not say); a reference read once carries no `occurrences` (D-454; K754). (A content type's own reading: `doctypes` R7.)
- **R35** Every "no" (no match, no confidence, no position, no digest, no meaningful change) says
  which kind of no and why; absence is never reported as sameness and never as non-existence.
- **R36** (T33-12; K617; A §(c)) This module holds no content type in its own code: the seven types
  are `doctypes`' (its R1), registered into this module's registry at composition through `doctypes`'
  `registerDoctypes`, which `plane` wires; `doctypes/registry.mjs`'s static imports of the types are
  gone. Its pipeline, `readText`, the shared helpers `doctypes` imports (`readerView`, `vocabulary`,
  `CONTRACT`, `entity`, `referential`, `temporal` and the rest its Uses lists) and the registry seam
  stay, with their meaning unchanged; a name it re-exports for an importer not yet re-pointed reads
  through to `doctypes` until that importer moves (plan T33, Rules (9) item 4).

### Satisfies

- `docs/architecture/BIO_Content_Framework_v0_10.md` §4, "One extension shape: the RECOGNISER"
  (the recogniser/registry shape both axes share), and §16, "How content is extracted today"
  (Identify, Read).
- `docs/development/DOCUMENT-PROFILES.md`, whole — the design of record this module implements.
- `build/layers.md`, "No jurisdiction in the product".

### Suggestions

- **The `id-spaces` overlap.** `regulation`'s and `staff_report`'s instrument-number vocabulary
  (an ordinance or resolution's own caption and the numbers other documents cite) is the same
  kind of fact as `id-spaces`' `enactment` identifier space (`requirements/id-spaces.md` R1–R5).
  `docprofile`'s declared `uses` (`build/modules.json`) is `jurisdictions` alone, so this file
  does not require sourcing that vocabulary through `id-spaces`, and the two may go on stating it
  independently. Whether `docprofile` should instead recognise and normalise an instrument number
  through `id-spaces` — one fact, read once — is an architecture question for BOB, not settled
  here.
- **`compare()` and the stack registry.** `pipeline.mjs`'s `assess` is built on `site-profiles`'
  `compare()` (its R10). The four built-in handlers are registered by `site-profiles` itself (its
  Suggestions); this module's `registry.mjs` stops registering them once it does, and only
  re-exports.
- **The `legacy-ui` edge.** `civicos-ui/app.html`'s bundled copy of this package calls `fidelity()`
  directly (`tools/bundle-docprofile.mjs`'s flattened build), which is real use of `site-profiles` R11 (was R26) from outside
  `bio-plane/src` — but `build/modules.json`'s `legacy-ui` entry declares `uses: ["legacy-checks"]`
  only, not `docprofile`. Worth BOB's attention as a missing `uses` edge; not settled here.
- **The T33 split (T33-12).** `doctypes` merges first, then this module's job deletes its copies. R4's
  "always returns a type" assumes `generic` (now `doctypes`') is registered; a test of this module
  registers `doctypes`' types, or a stub fallback, before asking. How `doctypeFor` answers with no type
  registered at all is the job's START to name (BOB's).
- For the module job: the recogniser-vocabulary section most naturally keys each kind of fact by
  the content type's own `key` (`meeting_minutes`, `meeting_agenda`, `regulation`, `staff_report`,
  `staff_directory`, `meeting_calendar`), since that is how `doctypes/registry.mjs` already
  dispatches; not binding, only a starting shape.
