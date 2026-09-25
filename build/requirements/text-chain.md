# text-chain — requirements

**Status** · DRAFT by BOB #37, 2026-09-25 (T6). Layer 1. Code today: `bio-plane/src/textchain.mjs`.
Not yet met: R77 (D-633, `mergeTier2Text` does not carry a base page's `image_content_*` markers onto
a page tier 2 wins), R81 (D-723, no service yet answers a page covered by two step kinds `mixed`), R72
(D-416, `readingPositionInExtent` has no `sheet-range` extent arm). No local fact: this module names
no place and holds no jurisdiction data, so `layers.md`'s rule needs no plan entry against it. Two
carried rows, D-635 and D-665, name `textchain.mjs` in their headline but their scope is
`mergeTier3Text` and OCR-routing measurement, both in `index.mjs` (outside this module's `paths`); they
are not requirements of this file — see the reply for the flag.

## Public

### Purpose

Holds the transcription provenance CHAIN: what a derivation step (a decode, an OCR pass, an AI
clean-up, a conversion, a member's typing) may claim, the rule that a chain can only weaken as it
grows, per-region confidence honesty, the image-region anchor a machine reading must carry, member
attestation and the extent it is scoped to, and the reading-position/extent geometry that bounds what
an extraction or a citation may claim. It holds no engine, no calibration, no store, no network and no
clock, and no function in it throws.

### Provides

Every check function below returns `null` on success or a refusal `{ok:false, code, check,
translation, detail}`, where `code` is one of the keys below, and `check`/`translation` are read from
`legacy-checks`' `TEXT_CHAIN_CHECKS` (family C-35). `detail` is specific to the failure. A chain is a
non-empty array of step objects; `STEP_KINDS` below is the only source of which step names exist.

**`STEP_KINDS`** — a plain object whose keys are every step kind `checkChain` and `appendStep` accept.
- **R1** Each entry has `role` (`"derivation"` or `"verification"`) and `label` (a human phrase). A
  `"derivation"` step produced or changed the text; a `"verification"` step (`attested`) checked text
  already there and never lowers or raises a derivation cap by itself.
- **R2** Each entry has `tier`: an integer (the kind IS that extraction tier), the string `"step"`
  (the step itself names its tier, on a `tier` field), or `null` (the kind is not a rung on the
  extraction ladder).
- **R3** `convert` and `typed` additionally declare `names` (the fields `checkChain` requires
  non-empty on that step), `unmeasured: "undetermined"` and `letter` (`"calibrated"` for `convert`,
  `"never"` for `typed`) — read by `checkChain`'s and `derivationCap`'s rules, never hand-matched by
  spelling.
- Errors: not applicable; a plain object, never mutated.

**`checkChain(chain) → refusal | null`**
- **R4** `null` for a well-formed chain: an array of at least one step object, each naming a key of
  `STEP_KINDS`.
- **R5** A string `chain` (the pre-chain single-label shape) refuses `TEXT_CHAIN_COLLAPSED` (C-35.1),
  checked before the generic shape complaint.
- **R6** A non-array or empty chain refuses `TEXT_CHAIN_EMPTY` (C-35.2).
- **R7** A step that is not a plain object refuses `TEXT_CHAIN_STEP_SHAPE` (C-35.3). A step whose
  `.step` is not a key of `STEP_KINDS` refuses `TEXT_CHAIN_STEP_UNKNOWN` (C-35.4).
- **R8** An `ocr` or `ai` step with no non-empty string `.engine` refuses `TEXT_CHAIN_STEP_UNNAMED`
  (C-35.5). A step of a kind that declares `names` (R3) missing any named field refuses the same code.
- **R9** A step whose `.calibration` is present and not a non-empty string refuses
  `TEXT_CHAIN_CAL_REF` (C-35.12). A `.calibration` absent is legal on every kind.
- **R10** A step of a kind whose `letter` is `"calibrated"` (R3) carrying `.cap` with no `.calibration`
  refuses `TEXT_CHAIN_LETTER_UNCALIBRATED` (C-35.13).
- **R11** A step of a kind whose `letter` is `"never"` (R3) carrying `.cap` refuses
  `TEXT_CHAIN_LETTER_ON_PERSON` (C-35.14).
- Errors: never throws.

**`appendStep(chain, step) → chain | refusal`** Returns a NEW array; never mutates `chain` or `step`.
- **R12** Refuses whatever `checkChain(chain)` or `checkChain([step])` refuses, checked in that order.
- **R13** For a `step` whose kind's `role` is `"derivation"`: when `step.cap` and the chain's current
  `derivationCap(chain)` are both known grade letters and `step.cap` is STRONGER (a lower
  `BASIS_GRADES` index) than the chain's, refuses `TEXT_CHAIN_STRENGTHENS` (C-35.6). Otherwise appends.
- **R14** For a `step` whose kind's `role` is `"verification"`, or when either cap is unknown, the step
  is appended unconditionally (rule 2 never blocks a verification, and an unmeasured comparison never
  refuses).
- Errors: never throws.

**`layerChain({tier, container, cap, measured_by, calibration}) → chain`**
- **R15** Returns a one-step chain `[{step:"layer", tier, container, cap, measured_by, calibration}]`
  from a document's own text-layer decode. Every argument defaults to `null` and is carried through
  unvalidated (validate the result with `checkChain` if a refusal is needed).
- Errors: never throws.

**`convertedChain(step, chain) → chain | refusal`** Puts a conversion step (`step.step === "convert"`)
AHEAD of every step in `chain` — `convert → layer`, never the reverse.
- **R16** Refuses whatever `checkChain([step])` or `checkChain(chain)` refuses.
- **R17** For every derivation step `s` already in `chain`, refuses `TEXT_CHAIN_STRENGTHENS` (C-35.6,
  via R13) when `s.cap` is stronger than `step.cap` — rule 2 applied to what the conversion precedes.
- **R18** On success, returns `[{...step}, ...chain.map(s => ({...s}))]`: a new array, neither input
  mutated.
- Errors: never throws.

**`mergedChain(parts) → chain | null | refusal`** `parts` is `[{chain, pages}]`, one entry per stretch
of a document with its own provenance, each `chain` already built by `appendStep`.
- **R19** Zero parts → `null` (no text surface answered; distinct from an empty chain).
- **R20** One part → that part's `chain`, unscoped and unchanged (a single-provenance document is not
  a mixed one), or the refusal `checkChain` gives it.
- **R21** More than one part → the parts' chains CONCATENATED, in order. Any part whose `checkChain`
  refuses stops the merge and returns that refusal.
- **R22** Within each part, every DERIVATION step is stamped `extent: {kind:"pages", pages}`, where
  `pages` is that part's `.pages` deduplicated, sorted, non-negative integers — `[]` when `.pages` is
  not an array or has none, which reads as an UNREADABLE extent to every reader below, never as "all
  the document". Every VERIFICATION step is copied through unscoped (an attestation carries its own
  extent).
- Errors: never throws.

**`calibrationsOf(chain) → string[]`**
- **R23** The de-duplicated `.calibration` values (non-empty strings) carried by any step, derivation
  or verification, in first-seen order.
- **R24** A malformed chain (`checkChain` refuses it) answers `[]`.
- Errors: never throws.

**`derivationCap(chain, target?) → grade letter | null`** `target` is `{page}` or absent/omitted.
- **R25** A malformed chain answers `null`.
- **R26** With no `target`, and every derivation step unscoped (D-252 absent): the weakest measured
  `.cap` over the derivation steps, `null` when none carries one.
- **R27** With `target.page` given, only steps whose extent (R22's shape, or absent = "all") covers
  that page bound the answer; the weakest of their measured caps, `null` when none of them measures
  one.
- **R28** A MIXED document (derivation steps carry different page-list extents): with no `target`, the
  document's cap is the weakest cap over each distinct extent's steps, and a distinct extent with NO
  measured step makes the WHOLE answer `null` — a part's absent measurement is never silently resolved
  by another part's letter (this is what keeps an unmeasured text layer's `null` from being read as an
  OCR pass's letter).
- **R29** A step of a kind whose `unmeasured` is `"undetermined"` (R3: `convert`) that carries no
  `.cap` and covers the queried target (or the whole document with no `target`) makes the answer
  `null` — an unmeasured conversion is not "sequence-neutral" the way an ordinary unmeasured step is,
  because every step after it measured the CONVERTED bytes.
- **R30** ANY step anywhere in the chain whose extent this module cannot parse (R22's `[]`/unreadable
  case) makes the answer `null`, for every target and for the whole-document query alike — an extent
  nobody could evaluate is never assumed not to cover the page in hand.
- Errors: never throws.

**`isTranscribed(chain) → boolean`**
- **R31** `true` when `chain` is well-formed and at least one step's `role` is `"derivation"` (a
  document's own text layer counts: `pdfstructure.mjs` decodes it, so it is a transcription too).
  `false` for a malformed chain or one with only verification steps.
- Errors: never throws.

**`terminalStep(chain) → step name | null`**
- **R32** The `.step` of the chain's LAST entry; `null` for a malformed chain. Always document-level:
  it never distinguishes a page covered by two different step kinds from one covered by a single kind
  (see R81, not yet met, for that question).
- Errors: never throws.

**`tiersEvidenced(chain) → {tiers: [{tier, steps, covers}], unclassified: string[]}`**
- **R33** For every step whose kind declares a `tier` (R2) other than `null`, groups by that tier
  (the step's own `.tier` field when the kind's is `"step"`, `"unrecorded"` when that field is absent
  on such a step); each tier entry lists the step names that contributed and their UNION of coverage
  (R22's extent shape; "all" absorbs everything, "unreadable" absorbs a page list).
- **R34** A step whose kind is missing the `tier` property entirely (declared nothing) names itself,
  once, in `unclassified`, rather than being scored into any tier.
- **R35** A step whose kind declares `tier: null` (`ai`, `attested`, `typed`, `convert`) is skipped:
  neither a tier entry nor `unclassified`.
- **R36** Tier entries are returned in the ORDER the steps that created them first appeared in
  `chain`, never sorted by tier number.
- **R37** A malformed chain answers `{tiers: [], unclassified: []}`.
- Errors: never throws.

**`describeChain(chain) → string`**
- **R38** A malformed chain answers `"this text's provenance was not recorded"`.
- **R39** Otherwise, one sentence per step joined by `" -> "`: the kind's label, `(engine version)` or
  `(engine to format)` when the step names an engine (and, for `convert`, a format), `(member[, at])`
  for `attested` and `typed`, and, for a SCOPED derivation step (extent not "all"), the pages it covers
  or `(over an extent this record cannot read)` for an unreadable one.
- Errors: never throws.

**`checkConfidence(confidence) → refusal | null`**
- **R40** `null` for the literal string `"none"`.
- **R41** A non-object (and not `"none"`) refuses `TEXT_CONFIDENCE_SHAPE` (C-35.8, "an absent
  confidence is not the same claim as a stated absent one").
- **R42** An object whose `.basis` is not `"engine"` or `"none"` refuses `TEXT_CONFIDENCE_PSEUDO`
  (C-35.7) — the fence is on WHO produced the number, never on its value.
- **R43** `.basis === "engine"` with `.value` not a number in `[0,1]` refuses `TEXT_CONFIDENCE_SHAPE`
  (C-35.8).
- Errors: never throws.

**`applyConfidenceFloor(regions, floor) → {regions, floored, undetermined}`** `regions` defaults to
`[]` when not an array; each output region is a new object.
- **R44** A region whose `checkConfidence` refuses, or whose `.confidence` is `{value, basis:"engine"}`
  with `value < floor` (only when `floor` is a number), is replaced: `text: null`, `undetermined:
  true`, `why` (the refusal's detail, or the shortfall sentence), `confidence: "none"`, every OTHER
  field kept.
- **R45** A region whose confidence is the stated `"none"` is never floored (nothing to compare).
- **R46** `floored` and `undetermined` both count every region replaced under R44; a caller reads the
  shortfall from them rather than inferring a clean read.
- Errors: never throws.

**`checkAnchor(source) → refusal | null`** The image-region anchor a machine-produced reading carries:
`{kind:"pdf-page", ref?, page, rect}` (I2's IC-1 shape).
- **R47** `null` when `source` is an object with `.kind === "pdf-page"`, `.page` a non-negative
  integer, and `.rect` an array of exactly 4 finite numbers.
- **R48** Every other shape — not an object, a `.kind` other than `"pdf-page"`, a missing/invalid
  `.page`, a missing/malformed `.rect` — refuses `TEXT_ANCHOR_MISSING` (C-35.9).
- Errors: never throws.

**`checkAttestation(att) → refusal | null`** A member's claim to have checked text against the image.
- **R49** `.member` identified as a machine credential (`isMachineIdentity`, from `legacy-checks`)
  refuses `TEXT_ATTEST_MACHINE` (C-35.10), checked BEFORE anything about the extent. A non-string or
  empty `.member` refuses the same code.
- **R50** A missing/empty `.at` refuses `TEXT_ATTEST_EXTENT` (C-35.11).
- **R51** `.extent` must be an object whose `.kind` is `"region"`, `"page"` or `"document"`, else
  refuses `TEXT_ATTEST_EXTENT`. `"page"` requires a non-negative integer `.page`. `"region"` requires
  `checkAnchor(.extent.source)` to pass; its refusal is wrapped in `TEXT_ATTEST_EXTENT`'s detail.
- Errors: never throws.

**`extentCovers(extent, target) → boolean`** Does an attestation's extent cover
`target = {page, rect?}`?
- **R52** `extent.kind === "document"` → `true` always.
- **R53** `extent.kind === "page"` → `true` only when `extent.page === target.page`.
- **R54** `extent.kind === "region"` → `true` only when `extent.source.page === target.page` and
  `target.rect` (4 numbers) sits inside `extent.source.rect`, both rects normalised (min/max) before
  comparing so an inverted rect still contains what it should.
- **R55** Every other case — a malformed `extent` or `target`, an unrecognised `.kind`, a missing
  `target.page` for `page`/`region`, a missing `target.rect` for `region` — answers `false`. The
  default is always NO: an extent nobody could evaluate never reads as "covers everything".
- Errors: never throws.

**`gradeCeiling(chain, target, attestations = []) → {ceiling, determinant, by, why}`**
- **R56** Filters `attestations` to those `checkAttestation` accepts AND whose `.extent` `extentCovers`
  `target`. If any remain: `{ceiling: EARNED_CAPTURE_CEILING, determinant:"attestation", by:
  [<their .member>], why: "..."}` — verification supersedes the derivation cap for what a leg citing
  `target` may claim.
- **R57** Otherwise: `{ceiling: derivationCap(chain, target), determinant:"derivation", by: [], why:
  "..."}`, `why` naming the page when `derivationCap` is `null`, or describing the chain when it is a
  letter (via `describeChain`).
- Errors: never throws.

**`captureBound(chain, byteGrade = EARNED_CAPTURE_CEILING) → grade letter | null`** Transcription
fidelity BOUNDS the capture axis (DEC-4): never a third scale, never stronger than `byteGrade`.
- **R58** `!isTranscribed(chain)` (including a malformed or `null`/absent chain) → returns `byteGrade`
  unchanged.
- **R59** Transcribed with `derivationCap(chain) === null` → returns `null` (an unmeasured engine's
  output never rides the byte grade through).
- **R60** Transcribed with a measured cap → returns `weaker(byteGrade, cap)` (never stronger than
  either).
- Errors: never throws.

**`readingSource(source) → {kind, ref, ...} | null`** Normalises a reader's element reference to
IC-1's canonical, key-ordered shape. TOTAL: every malformed or unrecognised input answers `null`,
never a refusal — a reading still writes with the position simply absent.
- **R61** `null` unless `source` is a plain object with `.kind` one of `pdf-page`, `sheet-cell`,
  `slide-shape`, `doc-para`, and a non-empty string `.ref` (truncated to 200 characters). `dom`
  (IC-1's fifth arm) and any other kind answer `null` — there is no producer for it yet.
- **R62** `pdf-page` needs `.page` a non-negative integer; `.rect` (4 finite numbers) carries through
  when present and valid, else `null` (the page alone still answers).
- **R63** `doc-para` needs `.para` a non-negative integer; `.run`, when a non-negative integer,
  carries through, else `null`.
- **R64** `sheet-cell` needs non-empty string `.sheet` and `.cell` (each truncated to 200/64
  characters).
- **R65** `slide-shape` needs `.slide` and `.shape`, both non-negative integers.
- Errors: never throws; never refuses — malformed input is absence, not an error a caller must handle.

**`readingSourceJson(source) → string | null`** The canonical JSON of everything `readingSource`
returns except `kind` and `ref` (which are stored in their own columns).
- **R66** `null` when `readingSource(source)` is `null`; otherwise a `JSON.stringify` of the per-arm
  fields only, so two readings of the same place serialise identically.
- Errors: never throws.

**`readingOccurrenceKey(source) → string`** (D-454) Which occurrence, among several reads of one
reference, a `reading_refs` row is.
- **R67** `` `${kind}:${readingSourceJson(source)}` `` when `readingSource(source)` normalises;
  otherwise `""` — every unplaced read of one reference is ONE occurrence.
- Errors: never throws.

**`readingSourceFromColumns(posKind, pos, posRef) → {kind, ref, ...} | null`** The inverse of the
writer's three stored columns (`pos_kind`, `pos`, `pos_ref`).
- **R68** `null` unless `posKind` and `posRef` are non-empty strings, `pos` is a string that
  `JSON.parse`s to a plain object, and `readingSource({kind: posKind, ref: posRef, ...parsed})`
  normalises; otherwise the normalised result.
- Errors: never throws (a JSON parse failure answers `null`, not an exception).

**`readingPositionInExtent(position, extentKind, extent) → boolean`** Does a content row's extent
contain the place a reference was read? The default is NO.
- **R69** `false` unless `readingSource(position)` normalises and `extentKind` is a non-empty string.
- **R70** `extentKind === "document"` → `true` always (Bob's 5.3: a document extent's portion is the
  whole document).
- **R71** Otherwise `extentKind` must equal the position's own `kind` (a coarser reading position is
  never covered by a finer extent), and:
  - `pdf-page`: `extent.page === position.page`; when `extent.rect` is absent the whole page counts,
    when present the position needs its own `.rect` inside it (normalised), else `false`.
  - `doc-para`: `extent.para === position.para`; when `extent.run` is absent the whole paragraph
    counts, when present the position needs the same `.run`, else `false`.
  - `sheet-cell`: `extent.sheet === position.sheet` and `extent.cell === position.cell`, exact.
  - `slide-shape`: `extent.slide === position.slide`; when `extent.shape` is absent the whole slide
    counts, when present it must equal the position's `.shape`.
- **R72** *(not yet met: D-416)* A `sheet-cell` position is contained in a `sheet-range` extent when its
  `.sheet` is the range's sheet and its `.cell` falls within the range's bounds. Today R71's equal-kind rule
  answers `false`. Design: `EXTRACTION-BREADTH-DESIGN.md` §3.2. The units this reads are emitted by
  `office-readers` R9 (D-415, built but not merged).
- Errors: never throws.

**`glyphCount(s) → integer`** (D-501/D-514) The number of non-whitespace Unicode CODE POINTS in `s`.
- **R73** `0` for a non-string. Otherwise counts code points (a surrogate pair counts once) that do
  not match `\s` (Unicode-aware).
- Errors: never throws.

**`mergeTier2Text(base, t2) → {ok, text?, wholesale?, perPageTier, replaced, kept, why?}`** (D-283)
Merges tier 2's page-wise decode into tier 1's `base`, PAGE BY PAGE, and records which tier won each
page. `base`/`t2` are `{document, pages:[{page, text, undetermined:[{count}]}], counts:{chars}}`-shaped.
- **R74** When `base.pages` has no usable entries (no integer `.page`): if `base.document` is a
  string, refuses (`ok:false`) whenever it holds at least one glyph (`glyphCount`); if `base.document`
  is not a string, refuses whenever `base.counts.chars > 0`. The refusal's `why` names what was found
  and that a page-wise comparison could not be made.
- **R75** In that same no-usable-pages case, when nothing is held (R74's condition false), `t2` is
  adopted WHOLE: `{ok:true, text:t2, wholesale:true, perPageTier:null, replaced:<t2's page numbers>,
  kept:[]}`.
- **R76** Otherwise, for each of `base`'s usable pages, tier 2 wins that page — the merged `pages[]`
  entry becomes `{page, text:<t2's text>, undetermined:<t2's markers>, tier:2}` — only when BOTH: tier
  2's page has strictly FEWER undetermined characters (summed `.undetermined[].count`) than tier 1's
  AND strictly MORE glyphs (`glyphCount` of `.text`, R73) than tier 1's. Otherwise tier 1's page is
  kept, spread unchanged plus `tier:1`.
- **R77** *(not yet met: D-633)* When tier 2 wins a page (R76), every field on the base page whose name
  starts with `image_content_` is copied onto the merged page unchanged — they are facts about the
  page's images, not about which decode won. Today the tier-2-won page carries only `page`, `text`,
  `undetermined` and `tier`; any `image_content_*` field the base page carried is dropped.
- **R78** On the page-wise path (R76), the result also carries `{ok:true, wholesale:false, text:{
  ...base, document:<pages' texts joined by "\n">, pages, undetermined:<concatenated>, counts:{chars:
  document.length, undetermined: undetermined.length}}, replaced:<tier-2-won pages>, kept:<tier-1-kept
  pages>, perPageTier:{tier1:kept, tier2:replaced}}`.
- Errors: never throws.

**`tier2Note(m) → string | null`** A human sentence for `mergeTier2Text`'s result, for a document's
notes.
- **R79** `m.why` (or `null`) when `!m.ok`. `null` when `m.wholesale`. `null` when nothing replaced.
- **R80** Otherwise a sentence naming how many pages tier 2 recovered and how many kept tier 1, plus a
  second clause noting the chain records the tier per page, when both `replaced` and `kept` are
  non-empty.
- Errors: never throws.

**[NOT MET — D-723] A page's chain kind, reading `mixed` when it should.** No exported service answers
this today; `terminalStep` (R32) is document-level and a caller (`store.mjs`) reads a page's kind as
`terminalStep(chain) || "layer"`, which names only the LAST-APPENDED step's kind even when a page is
covered by derivation steps of two different kinds (D-635's shape: a text layer's folio with an OCR
transcription appended over the same page). BOB #35's 09:35Z rule (in D-723) is that such a page reads
`mixed`, and BOB #36 superseded D-686's page rule for this one case (11:05Z, 2026-09-25). This module
must add a service that:
- **R81** *(not yet met: D-723)* Given a chain and a page, answers `mixed` when that page is covered by derivation steps of
  more than one kind (the same extent test R22/R27 use — a step's extent, or unscoped meaning the
  whole document), and answers the one kind covering it otherwise — undetermined (`null`) when no
  derivation step covers the page or the covering extent is unreadable (R30's rule). `terminalStep`
  itself is unchanged: it stays document-level and never answers `mixed`.

### Errors summary

Every `TEXT_CHAIN_*`, `TEXT_CONFIDENCE_*`, `TEXT_ANCHOR_*` and `TEXT_ATTEST_*` code above is a key of
`TEXT_CHAIN_CHECKS` (`legacy-checks`, family C-35.1–C-35.14). No other module may mint a C-35 code; a
new refusal condition in this module mints the next one in the family and is added there.

## Private

### Uses

- `legacy-checks` (`bio-plane/checks/bio-checks.mjs`): `TEXT_CHAIN_CHECKS` (the C-35 family, `check`
  and `translation` text for every refusal above); `BASIS_GRADES` (the ordered grade-letter array
  `rank`/`weaker` compare on) and `EARNED_CAPTURE_CEILING` (the strongest letter `captureBound` may
  answer); `isMachineIdentity` (whether an attestation's `.member` names a machine credential).

### Invariants

- **R82** Pure: no store, no network, no clock. The same inputs always give the same answer.
- **R83** No function in this module throws. Every malformed input answers `null`, `false`, `[]`, or a
  refusal object — never an exception, and a bad extent or position is never read as "covers
  everything" or "the whole document" (R30, R55, R69).
- **R84** No place is named in this module (`layers.md`, "No jurisdiction in the product"). It takes
  no jurisdiction profile and needs none: every space, grade, engine and extent it reasons about is a
  shape a caller supplies, not a fact this module holds.
- **R85** Rule 2 (derivation only weakens) is enforced by `appendStep` and `convertedChain` alone, by
  computing `derivationCap` and comparing ranks — never by trusting a caller's claim.
- **R86** A "no" always says which kind of no (`legacy-checks`' translations): outside a floor,
  undetermined, unjoined, a different value, one system — never plain absence.

### Satisfies

- `docs/architecture/BIO_Content_Framework_v0_10.md` — Part I, the extraction substrate, and Part II
  §14.2–14.3's adopted transcription-provenance tables; §16, the tier markers and the mixed-document
  chain.
- `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` §3 onward — the record's shape rules this
  chain grammar and reading-position geometry are held to.
- `docs/development/EXTRACTION-BREADTH-DESIGN.md` §3.2 — the reading-position containment rule R72
  extends.
- Bob's rulings this file rests on: DEC-4 (transcription fidelity bounds the capture axis, no third
  scale), DEC-35 (the confidence contract — a number is only a number when a classic engine computed
  it), DEC-49 (the refusal families), DEC-75 (a `convert` step's letter is raised only by a calibration
  row), Bob's 5.1–5.3 and 5.8 (`BIO_Content_Framework_v0_10.md` §12, a citation names its portion; a
  letter raised now and lowered later is forbidden), Bob's 5.2 (a member may type a portion's text),
  BOB #35's 06:25Z and 09:35Z rulings and BOB #36's 11:05Z ruling (D-723's `mixed` page rule).

### Suggestions

- **For the caller composing a chain** (`extractrun.mjs`, `index.mjs`): build page-scoped chains with
  `mergedChain`/`convertedChain`/`appendStep` rather than hand-assembling arrays, so rule 2 and the
  extent grammar are enforced once, here, rather than re-derived per caller (REC-46's eleven-copies
  measurement is the cost of doing otherwise).
- **For R81's new service**: a plausible name is `chainKindFor(chain, page)`, read by `store.mjs` in
  place of its own `terminalStep(chain) || "layer"` line — not binding; the module is free to shape it
  differently as long as R81's outcome holds and `store.mjs`'s caller-side obligation (asking per page,
  not once per document) is met.
- D-635 and D-665 are carried rows against `mergeTier3Text` and OCR-routing measurement, both in
  `index.mjs` today (`extraction`/`legacy-index` territory once extracted), not in this module's
  `paths`. They are not requirements here; BOB #37 moved both rows (D-635, D-665) to `extraction` on 2026-09-25.
- The D-501/D-514 sweep found three OTHER readers outside this module comparing the same
  producer-reported character counts instead of glyphs (`needsTier2` and the tier-3 layer attribution
  in `index.mjs`); they are that module's requirements, not this one's, once it is written.
