# docprofile — requirements

**Status** · DRAFT by BOB #37, 2026-09-25 (T6). Layer 1. Code today: `docprofile/index.mjs`,
`docprofile/pipeline.mjs`, `docprofile/recogniser.mjs`, `docprofile/registry.mjs`,
`docprofile/events.mjs`, `docprofile/readtext.mjs`, `docprofile/handlers/*.mjs`,
`docprofile/doctypes/*.mjs`. R25 and R30 are not yet met: every registered content type's
masthead/self-naming phrases, furniture lines, operative-voice and caption vocabulary,
code-citation vocabulary, report-template section headings, reference-line shapes, directory
floors and measured practice thresholds are fixed in `docprofile/doctypes/*.mjs` — mostly
naming Oakland and its Legistar instance by name or by measurement — rather than read from a
jurisdiction profile, because the `jurisdictions` module and its profiles do not exist yet
(plan entry N3). The four built-in host-stack handlers need no such move (see Purpose).

## Public

### Purpose

Recognises what a captured document IS — which host-technology stack served it (`identify`)
and which content type it is (`doctypeFor`) — and, given two captures of the same address, says
what changed between them in LAYERS that stop as soon as one can decide (`assess`), never by
comparing raw bytes. It also judges whether a rendition is faithful enough to show (`fidelity`)
and gives extraction the one entry point that runs the same recognisers over text from any
container (`readText`). The four stack recognisers (`aspnet_webforms`, `wordpress`,
`client_rendered`, `conservative`) detect TECHNOLOGY — viewstate fields, WordPress asset paths,
an empty mount point — and need no jurisdiction: the same signals mean the same thing in every
jurisdiction. Every registered CONTENT TYPE, by contrast, recognises a document by the vocabulary
one jurisdiction's clerks, staff and systems actually write — a masthead's wording, a code's own
abbreviation, a report template's section names — and takes that vocabulary from the active
jurisdiction profiles rather than holding it in code.

### Provides

**`identify(ctx) → {handler, confidence, signals, considered, kind?, why?}`** `ctx` carries
whatever the caller knows about one fetch: `headers`, `locator` (the address), `content_type`,
`text` (the bytes decoded, when read as text).
- **R1** Always returns a handler: the first registered stack recogniser to match at CERTAIN
  confidence, else the highest-confidence match among those that matched, else the always-present
  `conservative` handler at confidence NONE, with `why` stating that nothing was recognised.
- **R2** `kind` is the winning handler's own classification of the address (for example an index,
  a record, a shell) when the handler defines one; absent when it does not.
- **R3** Confidence is one of the ONE ladder's four values — CERTAIN, LIKELY, POSSIBLE, NONE —
  shared by every recogniser this module runs, on both axes.
- Errors: never throws, provided every registered handler's own `detect` does not.

**`doctypeFor(ctx) → {type, confidence, signals, considered, also}`** `ctx` additionally carries
`handler` (from `identify`), `kind`, and `view`: the combined view of the active jurisdiction
profiles that `jurisdictions.combine` gives.
- **R4** Always returns a type: the first registered content type to match at CERTAIN confidence,
  else the highest-confidence match, else the `generic` fallback at confidence NONE.
- **R5** `also` names every OTHER non-fallback registered type whose own `detect` also matches
  this same `ctx`, so a document satisfying more than one class (measured: about one in twelve)
  states all of them rather than letting the first match stand for the whole document. A type
  whose `detect` throws during this pass is reported as an error entry in `also`, never dropped
  and never propagated.
- **R6** *(not yet met: N3)* Every registered content type's own `detect`/`parse`/`assess` takes its recogniser
  vocabulary — masthead and self-naming phrases, furniture lines, operative-voice and caption
  forms, code-citation forms, report-template section headings, reference-line shapes, recognition
  floors and thresholds, and publishing-system address shapes — from `ctx.view`'s recogniser-
  vocabulary section, keyed by the type's own key, and holds none of it fixed in its own code.
- Errors: never throws, provided no registered type's own `detect` throws outside the `also` pass
  (R5 states what happens there).

**`digests(bytes, handler, ctx) → {identity, rendition, evidentiary, applied, boundary_missed, mechanical_bytes, presentational_bytes, textual}`**
`ctx.sha256` is a caller-supplied hash function.
- **R7** `identity` is always `sha256(bytes)`.
- **R8** When `handler.textual` is false, `rendition` and `evidentiary` both equal `identity` and
  `textual` is `false` on the result.
- **R9** When textual: `rendition` is the decoded text with the handler's MECHANICAL rules applied;
  `evidentiary` additionally has the handler's declared BOUNDARY applied (everything outside it
  normalised as presentational, region `"presentational"`) or, when the handler declares no
  boundary, its own PRESENTATIONAL rules. The three region labels a rule or a boundary reports
  under are exactly `"mechanical"`, `"presentational"` and `"evidentiary"`.
- **R10** A declared boundary that does not match the text normalises NOTHING beyond the
  mechanical pass, and `boundary_missed` is `true`; a boundary that missed is never read as a
  document with no content.
- Errors: throws only when `ctx.sha256` is not a function (a caller precondition); otherwise
  never throws.

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
- **R14** `events[]` is drawn from the module's one significance-graded catalogue (`event`,
  `notice`, `routine`; a type naming an event kind the catalogue does not hold is a defect in
  that type, caught by the catalogue itself). `meaningful` is always
  `worstSignificance(events) === "event"`; it is never a second fact carried beside the events.
- **R15** `connections[]` entries are either `referential`
  (`{connection:"referential", from, to, relation, why}`) or `temporal`
  (`{connection:"temporal", from, to, relation, at, expected_by, why}`) — the two are never
  collapsed into one shape.
- **R16** `confirmation` states what was verified UNCHANGED whenever anything was, even alongside
  `changed`/`routine` events on the same result, and is `null` only when nothing was confirmed. A
  read that FOUND NOTHING on either side is reported as a failed reader (`meaningful: null`, a
  stated `why`), never as an emptied or unchanged document.
- **R17** The result also carries `profile` (`profileRecord`'s own serialisation of the L1 stack
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
  `stack` and `doctype` (as `identify`/`doctypeFor` gave them), the content type's own `parsed`
  result or a `parse_error` naming why it has none, and `position_parts`/`position_why` stating
  whether the supplied text carried enough structure to place a reference at all.
- **R20** The content type's reader is handed a total `locate(offset)` function built from the
  supplied text's own segment map (R23); it may place a reference only where `locate` says,
  never at a position it composed itself.
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

**`fidelity(manifest, handler, ctx) → {level, missing, critical, why?}`** `manifest.subresources`
is a list of `{ok, reason?, kind?, url?}`.
- **R26** `level` is `faithful` when every part is present or ignorable by the handler;
  `degraded` when every missing part is non-critical (named in `missing`, none in `critical`);
  `insufficient` when any missing part is render-critical (named in `critical`), and the render
  is refused rather than shown misleadingly.
- Errors: never throws.

**`profileRecord(id, ctx) → record`** Serialises one `identify()` result for the capture's own
provenance.
- **R27** Returns `{handler, handler_label, handler_version, confidence, signals, document_kind,
  considered, at, note}` — the handler's own key/label/version, `identify`'s confidence and
  signals, `id.kind` (or `"unknown"`), `ctx.now` or the current instant, and `id.why` (or `null`)
  as `note`. A judgment's author and version are always named, so a later session can find and
  revise it.
- Errors: never throws.

**`CONFIDENCE`** — the one ladder shared by both axes: `CERTAIN`, `LIKELY`, `POSSIBLE`, `NONE`,
ranked in that order (**R28**).

**`CONTRACT`** — how a monitored document of a given content type should be watched, declared per
type: `SUBSTANCE` (watch the evidentiary digest; any change is an event, furniture moving a
notice), `MEMBERSHIP` (watch which entries are present and whether each still says what it said),
`UNMONITORABLE` (a shell; nothing is watched, and the absence is stated rather than silently
reported "unchanged") (**R29**).

## Private

### Uses

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
  - **directory recognition floors** — the minimum count of distinct contact addresses and the
    share of them that must sit at one organisation's domain for a document to be read as a staff
    directory, and the words ("directory", "staff", "roster", "contacts") that self-name one;
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

- **R30** *(not yet met: N3)* No place is named in this module's own code. Every masthead, furniture, caption,
  code-citation, template-section, reference-shape, directory-floor and practice-threshold fact a
  content type tests for comes from the active jurisdiction profiles; the tests include at least
  one profile that is not Oakland's, for every content type. The four stack handlers hold no such
  facts and need none, because they recognise technology, never place.
- **R31** Deterministic over its inputs: the same `bytes`/`text` and the same `ctx` values always
  give the same answer. The one exception is a content type's own forward-looking connections
  (the calendar's "minutes not yet published" fact), which read `ctx.now` when given and the wall
  clock only when it is not; nothing in this module reads a store or the network.
- **R32** The failure asymmetry governs every default: an unrecognised document is never assumed
  decorated (`conservative` treats almost nothing as machinery and nothing as furniture, so any
  byte difference is reported), and a recogniser applied without CERTAIN confidence never asserts
  "unchanged" — only `conservative`'s own narrowing is trusted without certainty.
- **R33** A reading, or a diff of two readings, that found NOTHING is a failed reader stated as
  such, never an emptied or unchanged document; a mass removal is never reported from a failed
  read.
- **R34** An entity's position (`source`) is only ever what `ctx.locate` returned for the offset
  the reader actually read it at — never composed, never guessed — and is absent, not invented,
  when the supplied text carried no structure to place it in.
- **R35** Every "no" (no match, no confidence, no position, no digest, no meaningful change) says
  which kind of no and why; absence is never reported as sameness and never as non-existence.

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
- **`compare()` and the stack registry's `register`/`handlers`.** `pipeline.mjs`'s `assess` is
  built on the L2/L3 primitive `compare()`, and the stack axis's own `register`/`handlers` are how
  the four built-in handlers reach the registry at load time. Neither is required above because no
  OTHER module calls either today (`DOCUMENT-PROFILES.md`'s own Known Gaps section states
  `compare()` has no caller in `bio-plane/src`); the job implementing this file may keep, narrow or
  drop them as it sees fit as long as R1–R29 keep holding.
- **The `legacy-ui` edge.** `civicos-ui/app.html`'s bundled copy of this package calls `fidelity()`
  directly (`tools/bundle-docprofile.mjs`'s flattened build), which is real use of R26 from outside
  `bio-plane/src` — but `build/modules.json`'s `legacy-ui` entry declares `uses: ["legacy-checks"]`
  only, not `docprofile`. Worth BOB's attention as a missing `uses` edge; not settled here.
- For the module job: the recogniser-vocabulary section most naturally keys each kind of fact by
  the content type's own `key` (`meeting_minutes`, `meeting_agenda`, `regulation`, `staff_report`,
  `staff_directory`, `meeting_calendar`), since that is how `doctypes/registry.mjs` already
  dispatches; not binding, only a starting shape.
