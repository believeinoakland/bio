# The interface registry

One section per interface. An interface that is not here does not exist, and
nothing may be built against it (`PARALLELISM.md`). Each carries an ID, an owner,
a version, its consumers, and the shape itself.

The shape is **stable by default**. To change one, use the protocol in
`INTERFACE-CHANGES.md` (which does not exist until the first change is proposed,
deliberately — writing it before it is needed gets it wrong). Do not change a
shape another area builds against just because you can reach the file.

**Every shape below is written from the code as it stands on 2026-07-31, not as
anyone would like it to be.** Where the implementation is uglier than the ideal —
where a field lives in frontmatter rather than a column, where a name is
undetermined, where a limitation is recorded instead of a value — the ugliness
is written down, because a content area consuming a shape that is true saves a
session and one consuming a shape that is aspirational loses one. If you change
the code, change the interface here in the same turn, or you have made this file
a lie.

---

## I1 — bytes → content

- **ID:** I1
- **Owner:** `CAPTURE`
- **Version:** 1.3.0 (1.0.0 first written 2026-07-31, from plane 0.55.0; 1.1.0 2026-07-31, FW-3 — ADDITIVE: `op=acquire` writes a new sibling field `document.profile` (§4) recording docprofile's stack/content-type identification; 1.2.0 2026-07-31, FW-4 — ADDITIVE, non-breaking: `document.profile.digests` (§4c) records the COMPUTED normalisation digests (rendition, evidentiary; identity is the existing `capture_sha`, not restated); no existing field's name, shape or value domain changed, and C-18.1 tolerates the extra key — conformance.test.mjs stays green with real acquire documents carrying it; 1.3.0 2026-08-03, COFF-1 — ADDITIVE, non-breaking, the FW-3/FW-4 precedent: `document.profile.format` (§4c) records what the FORMAT registry's `detect()` found (I7, `bio-plane/src/formats.mjs`) — `{format, confidence, signals}`, magic bytes first, content type second, `undetermined` first-class when nothing matched. No existing field reshaped; a consumer that ignores it keeps working — the whole battery's acquire-driving suites stayed green unedited)
- **Consumers:** `CONTENT-HTML`, `CONTENT-PDF`, `FRAMEWORK` (the document page reads `document.profile`)
- **Status:** STABLE

### What it is

What a captured document offers something that wants to read the bytes and
reason about them without knowing how they were fetched. This is the largest
parallelism the project has: it is what lets `CONTENT-HTML` and `CONTENT-PDF`
proceed independently of each other and of `CAPTURE`.

CAPTURE produces bytes and provenance. A content area **consumes bytes and
produces structure**. It must not reach into the fetch layer, the governor, the
subresource walker, or the archive fallback; everything it is entitled to is in
this interface. Symmetrically, CAPTURE may reshape anything behind this interface
freely and may not reshape the interface without the protocol.

### The honest shape: metadata lives in two places

There is no single object a consumer reads. The as-built interface is **split**,
and a consumer must know the split or it will look for content type in the wrong
place:

- **The register** is the relational index of captures — one row per registered
  capture, queryable, carrying the *identity and size* of the bytes and nothing
  interpretive.
- **The bundle's `bundle.md` frontmatter** carries the *interpretive* capture
  metadata — content type, transport record, provenance chain, authority, grade.
  It is the acquire document (below) as `op=promote` persisted it. It is not a
  set of columns; a consumer reads and parses the frontmatter.
- **The bytes themselves** are content-addressed in R2 and served by one op.

This split is a fact about the interface, not an accident to route around. The
register is what a whole-store pass can join against cheaply; the frontmatter is
where the WARC-style record of the fetch lives, because it is per-document and
never queried in bulk.

### 1. The register entry — identity of the bytes

Table `register` (`schema.mjs`), one row per registered capture, written at
`op=promote` (`store.mjs`, `INSERT ... INTO register`). It is the trust root:
`capture_sha` is the only thing that proves bytes.

| Field | Type | Meaning |
| --- | --- | --- |
| `capture_sha` | TEXT, PK, 64 lowercase hex | SHA-256 of the reassembled whole. THE identity of the bytes across the whole system. |
| `bundle_id` | TEXT | The bundle this capture was intake for. |
| `path` | TEXT | The file path within the bundle, e.g. `snapshots/<name>`. |
| `encoding` | TEXT | `"binary"` for a capture. |
| `bytes` | INTEGER | Byte length of the whole. |
| `registered` | TEXT | ISO8601 instant the register row was written. |

Read paths that exist today: `op=registeraudit` (admin/probe) walks every row;
`op=export` includes `register` rows per bundle. There is **no** column here for
content type, transport, provenance, or authority — those are in the frontmatter
(§4). A consumer that needs only "what bytes does bundle X hold, and how big" can
stay entirely in the register.

### 2. The R2 key shape — where the bytes are

- **Bucket:** `CAPTURES` (the private working corpus; `PUBLISHED` is the
  publisher's, not part of this interface).
- **Key:** `` `${storeName}/captures/${capture_sha}` `` — content-addressed by the
  same 64-hex `capture_sha` that keys the register. `storeName` is the namespace
  (`scratch`, the live store, …).
- **Write discipline:** `head` before `put`; identical bytes are never rewritten.
  Puts pass an R2 `sha256` so the store verifies on the way in.
- **Multipart:** a document streamed in parts stores **each part** under its own
  part-sha at the same key prefix (`` `${storeName}/captures/${part_sha}` ``), and
  the register/frontmatter address the reassembled whole under `capture_sha`. A
  single-part capture under the inline bound is stored whole under `capture_sha`,
  so the common case is one object. Parts are listed in frontmatter `parts[]`.

A consumer does not construct this key to fetch bytes — it uses the op in §3. The
key shape is documented because it is part of the contract's ground truth and
because an archive/audit consumer may need to reason about residency.

### 3. Reading the bytes — `op=capture`

`GET /?op=capture&sha256=<64 lowercase hex>&token=<token>`

- **200** with body = the exact captured bytes.
  - `content-type: application/octet-stream` — **always**. The op does NOT serve
    the document's own content type; see §4 for how a consumer learns the real
    type. This is deliberate: the bytes are served as opaque octets and the record
    is the authority on what they are.
  - `x-capture-sha256: <sha>` echoes the identity.
  - `access-control-allow-origin: *`.
  - `&dl=<name>` adds `content-disposition: attachment`.
- **Range requests are supported** → **206** with the requested range. This is how
  a PDF consumer reads a structure table or a byte range without pulling a 40 MB
  document into a Worker.
- **404** `{ok:false, reason:"NOT_FOUND"}` if no such object.
- **400** if `sha256` is not 64 lowercase hex.
- **503** if the instance has no R2 configured.

Writing bytes (`PUT`/`POST` to the same op) is CAPTURE's and the intake path's, not
a content area's; it verifies the body hash equals `sha256` and refuses on
mismatch. Listed for completeness, not as consumer surface.

### 4. The interpretive metadata — the acquire document, in `bundle.md` frontmatter

`op=acquire` (POST) returns the provenance document under `document`, and
`op=promote` persists it as the bundle's `bundle.md` frontmatter. A content area
reads it from there. The shape a consumer depends on:

**`document.capture`:**

| Field | Value today | Notes |
| --- | --- | --- |
| `sha256` | 64-hex | equals the register `capture_sha`; the join key between §1 and §4. |
| `encoding` | `"binary"` | |
| `bytes` | integer | whole-document length. |
| `content_type` | e.g. `"text/html"`, `"application/pdf"` | **the source's `Content-Type`, first value only** (split on `;`, trimmed). **Omitted entirely when the source sent no content type** — a consumer must treat absence as "unknown", never as a default. This is the ONLY place the primary document's type is recorded; it is not a register column and not an R2 header. |
| `method` | string | e.g. `"bio-plane acquire, https fetch, hashed at receipt"`. |
| `grade` | `"B"` direct, `"C"` archive | tracks DIRECTNESS, never technique; identical bytes fetched via the archive still grade `C`. |
| `actor_class` | `"member"` \| `"session"` \| `"daemon"` | who captured. |
| `authority` | string, **only for archive captures** | set to `"Internet Archive"` — who *served* the bytes, not who issued the document. Absent on a direct fetch. |
| `transport` | object | §4a. |

**`document.capture.transport`** — the WARC-style record of the fetch, kept
because headers cannot be recovered later:

| Field | Value | Notes |
| --- | --- | --- |
| `requested` | the locator asked for | |
| `resolved` | `res.url` after redirects | |
| `redirected` | boolean | `resolved !== requested`. |
| `status` | HTTP status integer | |
| `http_headers` | array of `[name, value]` | **every** response header, in order, duplicates preserved, **no allowlist**. |
| `peer_address` | `null` | **always null**: the Workers runtime does not expose the peer address of an outbound fetch. |
| `peer_address_unavailable` | string | states *why* the address is null, so a reader does not misread an unobtainable field as an absent redirect. |

**`document` top level** — sibling fields a content area will read:

| Field | Value | Notes |
| --- | --- | --- |
| `locator` | the retrieval locator (what was fetched). | For an archive capture this is the replay URL; the DOCUMENT address is in the provenance chain / `captured_locators`. |
| `retrieved` | ISO8601 (second precision, `Z`). | |
| `authority_state` | `"determined"` \| `"undetermined"` | `undetermined` is first-class and is BARRED from publication (C-18.9), never refused at intake. A consumer must carry it, never invent a value to fill it. |
| `authority_basis` | string, dated, in BOTH states | "the member asserted it" and "nothing could establish it" are both recorded facts. |
| `authority` | string, only when asserted | the issuing party, when a caller named one. |
| `provenance_chain` | array of hops, §4b | |
| `via` | `"direct"` \| `"archive.org"` | closed set, not a free string. |
| `parts` | array of `{file, sha256, bytes}` | present only for a multipart capture. |
| `renditions` | array | derived companions (e.g. a rendered HTML snapshot). A rendition has **no locator, authority, or grade of its own** — it is a rendering of this document, named on the same register document, and says so. A consumer must not treat a rendition as an independent acquisition. |
| `origin` | `{kind: "named_request" | "sweep", ...}` | how the capture was initiated. |
| `profile` | object, §4c | **added 1.1.0 (FW-3).** What kind of document the record thinks it holds: the host-stack handler and the content type, each with a confidence, its signals, and its recogniser VERSION, plus the handler's declared normalisation. A consumer treats it as advisory metadata, never as authority; `undetermined` is honest (an unreadable-here document profiles as the conservative handler / generic type, `profiled_from_text: false`), never a guessed stack. |

**`document.provenance_chain`** — ordered hops from us back to the origin. Hop 0
is always present:

```
{ who:      "instance <INSTANCE_NAME> (CivicOS/<VERSION>)",
  asserts:  "these bytes were served for <locator> at <retrieved>",
  evidence: "first-party https fetch, hashed at receipt, transport record on this document",
  bound:    false,
  via:      "direct" | "archive.org" }
```

An archive capture appends a second, weaker hop carrying the CDX evidence with
`bound: false` and the reason it is unsigned. What transitive trust inherits is
the FACT OF PUBLICATION, never the credibility of the content (RULED,
`AUTHORITY-AND-TRUST.md`). `bound` is `false` on hop 0 too: a self-recorded hash
proves integrity since capture and nothing about origin.

### 4c. The profile — what kind of document the record thinks it holds (1.1.0)

Added by FW-3 (CONSTRUCTS Step 1), the FIRST plane consumer of `docprofile/`.
`op=acquire` calls docprofile's `identify()` (host stack) and `doctypeFor()`
(content type) — the existing recognisers, not a second copy — and records the
result as `document.profile`. It is advisory metadata about the document's KIND,
recorded so a later session can revise a downstream judgment when its recogniser
turns out wrong; a consumer never treats it as authority over the bytes.

The recognisers read the document as TEXT, so the primary is read back from R2,
bounded (single-part, ≤ 8 MB, a textual `content-type`). A non-textual or
multipart document is left unread and profiles as the conservative handler and
the generic type — `undetermined`, stated, never a guessed stack.

| Field | Value | Notes |
| --- | --- | --- |
| `handler` / `handler_label` / `handler_version` | host-stack recogniser key, words, and VERSION | the version is the "author" of the stack judgment, so a wrong recogniser can be found and re-run. |
| `confidence` | `certain` \| `likely` \| `possible` \| `none` | the stack axis's confidence. |
| `signals` | array of strings | why the stack recogniser matched. |
| `document_kind` | e.g. `index` \| `record` \| `page` \| `unknown` | the handler's read of the ADDRESS. |
| `considered` | array | every stack recogniser that matched, for audit. |
| `content_type` / `content_type_label` / `content_type_version` | content-type recogniser key, words, and VERSION | the second axis, keyed distinctly; its version is the second author. |
| `content_type_confidence` | one of the ladder above | the second confidence. |
| `content_type_signals` | array of strings | why the content-type recogniser matched. |
| `contract` | `substance` \| `membership` \| `unmonitorable` \| null | the monitoring contract the content type declares. |
| `normalised` | array of `{region, label}` | what the identified handler treats as machinery/furniture — the normalisation policy the profile's judgment rests on, DECLARED. `digests` below is that policy COMPUTED (FW-4). |
| `digests` | object, §4c below | **added 1.2.0 (FW-4).** The COMPUTED normalisation digests: `{determined, rendition, evidentiary, boundary_missed?, basis}`. `identity` is NOT here — it is the raw-bytes `capture_sha` (§1), reused, never restated. When the bytes could not be normalised with certainty, `determined:false` and both digests are `null` (undetermined is stated, never fabricated). |
| `boundary` | boolean | whether the handler normalises around a document boundary (e.g. `<main>`). |
| `source_content_type` | string \| null | the server's own `Content-Type`, distinct from the recognised content TYPE. |
| `profiled_from_text` | boolean | whether the bytes were read as text (false = profiled from headers + address only). |
| `format` | object, below | **added 1.3.0 (COFF-1).** The FORMAT axis (I7): what the registry's `detect()` found — `{format, confidence, signals}` verbatim. Magic bytes FIRST (FW-3's text read-back is sniffed when it exists; otherwise the first KiB is range-read from R2), declared content type second; a multipart or unreadable primary falls to the content type with the absence stated in `signals`. `{format:"undetermined", confidence:"none", signals:[why]}` when nothing matched — stated, never guessed. Advisory like the rest of the profile; `profiled_from_text` is NOT set by the format sniff (a 1 KiB header read is not a text read). |
| `at` / `note` | ISO8601 instant · string \| null | the profiling instant (equals `retrieved`) and any recogniser note. |

**`document.profile.digests`** — the COMPUTED normalisation digests (1.2.0, FW-4,
CONSTRUCTS Step 2). docprofile defines THREE digests (`DOCUMENT-PROFILES.md`,
"Three digests, not one"): `identity` (sha256 of the raw bytes — this is the
existing `capture_sha` in §1 and §4, reused and NEVER recomputed under a second
name), `rendition` (mechanical regions normalised — "would this look the same?"),
and `evidentiary` (presentational AND mechanical normalised — "has the substance
changed?"). Only the latter two are stored here.

| Field | Value | Notes |
| --- | --- | --- |
| `determined` | boolean | whether the digests can be trusted to assert two documents are the same substance. TRUE only when the bytes were read as text AND the stack was identified with CERTAINTY — a signal only that stack emits. |
| `rendition` | 64-hex \| null | mechanical-normalised digest; `null` when undetermined. |
| `evidentiary` | 64-hex \| null | presentational+mechanical-normalised digest; `null` when undetermined. This is the one `op=audit`'s duplicate sweep (C-18.3) compares. |
| `boundary_missed` | boolean | present when determined: the handler's boundary did not match, so nothing outside it was normalised (a boundary that missed is never read as a document with no content). |
| `basis` | string | why the digests are determined, or why they are undetermined. |

The trust rule runs OPPOSITE to change-detection's. `compare()` extends the
narrow-without-certainty licence to the conservative handler because that handler's
job is to over-report CHANGE, which is the safe direction there. Deduplication's
safe direction is the reverse: folding two DISTINCT review items into one
corroboration HIDES a document, so a normalised digest is stored only when EARNED
(certain stack, read as text). An undetermined capture — a PDF, a multipart giant,
or a merely-likely stack — records `evidentiary: null`, and the sweep never treats
two nulls as equal (an equality that costs nothing to produce is not evidence).

**Consumer note:** `op=audit`'s duplicate sweep (C-18.3, `bio-checks.mjs`) now
compares the determined `evidentiary` digest in addition to the raw `capture_sha`,
so it folds a duplicate whose `__VIEWSTATE`/furniture differs — which raw byte
comparison cannot see. The Add-surface already-held check in `civicos-ui` (today it
fetches both captures and compares in the browser) is a further DOWNSTREAM consumer
of this stored digest; wiring it is recorded as a DELEGATION, not built by FW-4.

### 5. Address → capture — the reverse lookup

A consumer relating an address (a link target, a document URL) to bytes the
record holds uses `captured_locators` (`schema.mjs`, written by
`recordcapturedlocator`, read in `resolveLinks`):

- Keyed on **`(address_norm, capture_sha, via)`**. `address_norm` is the DOCUMENT
  address through the plane's normaliser (no fragment; the server never sees one).
- Carries the **interval** `first_retrieved … last_retrieved` and an
  `observations` count — identical bytes seen on both sides of another document's
  retrieval settle contemporaneity without trusting any date from the source.
- **`via` is part of the key**: an `archive.org` observation of the same bytes is
  a *different fact* from a `direct` one, not a repeat of it. Identity/bracket
  reasoning reads `via='direct'` observations only; do not merge streams.
- `retrieval_locator` holds what was actually fetched when it differs from the
  document address (archive replay URL); for a direct capture they are equal.

### What I1 does NOT include

- The publisher's byte-serving of the `PUBLISHED` bucket (publication is a
  separate act behind the ratification fence).
- Structure or content interpretation — that is what a consumer PRODUCES (I2,
  owned by `FRAMEWORK`, not yet registered).
- The subresource/site-asset tables (`site_assets`, `site_asset_refs`), the links
  table, and link verdicts. These are CAPTURE's internal machinery; a rendition
  built from them is exposed through §4 (`renditions`) but the tables are not
  consumer surface. If a content area finds it needs one, that is an
  interface-change proposal, not a reach into the schema.

### For CAPTURE (the owner): what freezing this costs you

You may change fetch, governor, subresources, the archive fallback, the R2 write
discipline, and the parts threshold without touching I1. What you may NOT change
without the protocol: the register columns in §1, the `op=capture` response
contract in §3, the frontmatter field names and value domains in §4, and the
`captured_locators` key in §5. If a change to the capture path would alter any of
those — for instance, promoting `content_type` from frontmatter to a register
column, which is a real latent improvement — propose it in `INTERFACE-CHANGES.md`
and bump this version, because a content area is building against the split as it
is written here.

---

## I2 — content → framework (structure)

- **ID:** I2
- **Owner:** `FRAMEWORK` (currently dormant)
- **Version:** 1.1.0 (1.0.0 — **STABLE**, CONFIRMED by the consumer's owner FRAMEWORK
  (session framework-agent-2, FW-1) 2026-07-31. Supersedes the provisional 0.1.0
  producer-proposed 2026-07-31 from CONTENT-PDF's as-built output (plane 0.55.0),
  written from the code that emits it rather than as anyone would like it, exactly
  as I1 was — and the extended text+tier shape (CPDF-4/CPDF-6/I6) confirmed with it.
  1.1.0 2026-08-03, COFF-4's integration — ADDITIVE, two changes under one bump,
  both through the protocol: **(a) IC-1 as amended, CHANGED** — `source` is a
  tagged union `{kind:"pdf-page"|"sheet-cell"|"slide-shape"|"doc-para"|"dom", ref,
  …per-kind fields} | null`; the `pdf-page` arm carries 1.0.0's `{page, rect}`
  byte-identical plus the two required tag fields, so a consumer reading only
  `{page, rect}` keeps working and a consumer must discriminate on `kind` for any
  other arm. **(b) IC-2, CHANGED** — the structure object gains one additive
  top-level `evidentiary` envelope (the DEC-5 extras: tracked changes with
  author/date/superseded wording, comments, formulas beside values, hidden
  rows/columns/sheets, docProps metadata) — `{container, kinds[], items[] (required
  `kind` tag + IC-1 `source`), undetermined[{part, why}], counts}` — plus the
  pageless text degenerate form `text.paragraphs[]` (`{para, ref:"¶N", text}`)
  where a container has no pages in its bytes. A reader ignoring both sees 1.0.0.
  Producers of further container arms CONFIRM at IC-2, inventing no variants.)
- **Producers:** `CONTENT-PDF` (live), `CONTENT-HTML` (dormant), `CONTENT-OFFICE` (live — the office-format entries)
- **Consumer:** `FRAMEWORK` (dormant)
- **Status:** STABLE. FRAMEWORK, the consumer, confirms the shape serves what it
  must do — identify a document's CONTENT and INTENT — WITHOUT a shape change. The
  reasoning, because an interface going stable is a real event and not a rubber
  stamp:
  - **Container-agnostic by construction, not by assertion.** The four content
    partitions and their wrappers are the SAME `LINK_TYPES`/`linkWrapper` HTML
    uses — `pdfstructure.mjs` IMPORTS them from `subresources.mjs` rather than
    re-deriving them, and `pdfstructure.test.mjs` pins every wrapper byte-identical
    to `linkWrapper.<partition>(...)`. So FRAMEWORK's content-type recognition and
    its referential/temporal `connections()` consume a PDF's links and an HTML
    page's links through ONE code path, with no per-container branch. That is
    exactly Bob's ruling that content is identified in PDFs as in HTML, delivered
    as a property of the type rather than a promise about it.
  - **`undetermined` is first-class on BOTH axes — the one thing FRAMEWORK cannot
    do without.** docprofile's every default is the failure asymmetry: never
    invent, over-report, and STATE the gap (`docprofile/index.mjs`). A link that
    cannot be resolved is CARRIED with a stated `why` and no wrapper; a text run a
    font cannot decode is a `Marker` NAMING the font/reason, never mojibake. That
    lets a doctype reader honestly refuse (`meaningful: null`, "could not be read
    this time") instead of parsing garbage into a false claim — the distinction the
    whole product rests on.
  - **It gives a doctype the two inputs it needs, keyed so they compose.**
    `text.document`/`text.pages[]` is what a recogniser regexes over to identify a
    kind of document and read its meaning (L1/L4/L5); `links[]` partitioned is the
    outbound graph L6 turns into referential/temporal connections — and `intra`
    targets are content-addressed by `sha256`, a STRONGER referential key than an
    HTML href. Text and links share the 0-based page index (`source.page` ↔
    `text.pages[].page`), so a link and the page it sits on are correlatable rather
    than two parallel lists.
  - **`tier` is present at the boundary FRAMEWORK actually consumes.** The op
    (`op=pdfstructure`) stamps `tier:1` in-plane and the pdf-worker returns
    `tier:2`, so a consumer always knows which extractor produced the text and can
    weight its confidence — even though the raw `extractPdfStructure()` function
    leaves it unset (the function is not the interface; the op is).
  - **Its restraint is a feature, not a gap.** Tier-1 text is a flat per-page
    string with no table/row geometry, so a Legistar-style `<tr>` parse does not
    transfer to PDF — but asserting layout the extractor cannot support would be
    exactly the invented-structure this project forbids. Positional/structured text
    is a FUTURE, doctype-driven ASK (FRAMEWORK raises it via the change protocol
    when a concrete PDF doctype needs it), not a reason to hold the contract
    provisional. The honest maximum a no-layout Tier-1 reader can give is what I2
    gives.

  No producer code was changed to confirm this: the shape FRAMEWORK confirmed is
  already the shape the battery pins (`pdfstructure.test.mjs` — partitions, wrapper
  byte-identity, `counts`, `text.document`/`pages[]`/`undetermined`/`counts`; the
  pdf-worker tests — the `text`+`tier` extension).

### What it is

What a content area emits after reading captured bytes (I1) and identifying a
document's STRUCTURE — its outbound links and their element references — WITHOUT
deciding what the content means (that stays FRAMEWORK's). Structure is
container-agnostic by construction: a PDF's links and an HTML page's links are
characterised into the SAME partitions, so FRAMEWORK consumes both identically.

### The shape, as CONTENT-PDF emits it today

`extractPdfStructure(bytes)` (`bio-plane/src/pdfstructure.mjs`) returns:

```
{ ok: true, container: "pdf", version: "1.7"|null, pages: <int>,
  links: [ LinkRecord, ... ],
  counts: { anchor, intra, deferred, refused, undetermined },
  notes: [ <string>, ... ] }               // lenient-parse notes
```
or `{ ok:false, container, reason: "NOT_A_PDF"|"NOT_BYTES" }` on bad input.

**LinkRecord:**
```
{ partition: "deferred"|"refused"|"anchor"|"intra"|"undetermined",
  wrapper:   <string>|null,   // byte-identical to subresources.mjs linkWrapper[partition](...)
  target:    { ... },         // by partition, below
  source:    { page:<int 0-based>, rect:[x0,y0,x1,y1]|null } | null }
```
- **deferred / refused:** `target = { url }`.
- **anchor:** `target = { page:<0-based>, fragment:"#page=<1-based>", dest:<name|null> }`.
- **intra:** `target = { sha256:<64-hex>, name:<filename|null>, bytes:<int> }`.
- **undetermined:** `target = { why:<reason>, ...hints }`.

### Invariants a consumer may rely on

- The four content partitions and their wrappers are IDENTICAL to I1's HTML side
  (`subresources.mjs` `LINK_TYPES` / `linkWrapper`). `undetermined` is the only
  addition and always carries `wrapper: null` and a stated `why` — an unresolved
  link is CARRIED, never dropped and never invented.
- Element reference = source page index (0-based) + annotation rect. Structure
  with no such reference (e.g. a document-level embedded file) sets `source: null`
  rather than inventing one.

### The text extension (CPDF-4, 2026-07-31 — PROVISIONAL, for FW-1 to confirm/counter)

Tier-1 in-plane text extraction (CPDF-4, commit 314f4b7) adds ONE top-level field,
`text`, to the `ok:true` object; every other field is unchanged:

- `text.document` — all pages' non-empty text, newline-joined.
- `text.pages[]` — one entry per page in order: `{ page:<0-based>, text, undetermined:[Marker,...] }`.
- `text.undetermined[]` — all per-region markers, flattened.
- `text.counts` — `{ chars, undetermined }`.

A `Marker` names the cause per region — never mojibake: `{ page, reason, font, codes, count }`,
where `reason` ∈ { `no_tounicode`, `cid_font_no_tounicode`, `unmapped_code`,
`no_current_font`, `font_not_in_resources`, `code_width_misaligned`, `text_extraction_error`,
`encrypted` } and `font` is the BaseFont (or null). `encrypted` (CPDF-6, 2026-07-31) is a
**document-level** marker (`page: null`): the Standard Security Handler is read from the
trailer without decrypting anything, so Tier 1 NAMES encryption instead of degrading to a
swarm of undecodable notes (the CPDF-5 gap). This mirrors the link side's `undetermined`
doctrine but as its own `text.undetermined` array (a reason+font shape, not a link partition).

The Tier-2 worker (I6) emits the SAME `text` shape with three additional `reason` values —
`over_envelope` (a document too large for pdf.js: text-undetermined, never truncated),
`no_text_layer` (a page pdf.js recovered nothing for — a scan/image, OCR territory), and
`tier2_extraction_error` — plus a top-level **`tier`** field (`1` in-plane, `2` via the
pdf-worker) so a consumer knows which extractor produced the text.
**FW-1 confirms or counters this EXTENDED shape (structure + text + tier), not the link-only I2.**
FW-1 CONFIRMED it 2026-07-31 (see Status above); the extended shape is the contract.

### Settled at STABLE, and the one residual

- **CONFIRMED:** a FRAMEWORK session (framework-agent-2, FW-1) judged the extended
  shape as the consumer's owner and confirmed it without a change. This is the
  event that made I2 stable.
- **Residual, producer-side, NOT a consumer reservation:** `CONTENT-HTML` (dormant)
  will emit the same shape from HTML, exercising the container-agnostic claim from a
  second producer. For the LINK partitions this is already guaranteed by
  construction — both producers wrap through the one `subresources.mjs`
  `linkWrapper`, so an HTML producer cannot drift the four partition wrappers
  without failing the same parity assertion. What CONTENT-HTML still has to show is
  that HTML's `text` maps onto the same `text.{document,pages[],undetermined,counts}`
  shape; if it cannot (HTML has no page pagination, so `pages[]` may need a
  documented degenerate form), that is a PROPOSED change against this now-stable
  contract via `INTERFACE-CHANGES.md`, raised by CONTENT-HTML when it activates —
  not a reason the PDF consumer contract stays open now.

---

## I3 — plane → UI (the op contracts)

- **ID:** I3
- **Owner:** `RECORD` (moved from `CAPTURE` 2026-07-31; `PARALLELISM.md` anticipated
  this the first time op-wiring became a recurring delegation, and it has now
  recurred once — the `op=pdfstructure` delegation from CONTENT-PDF)
- **Version:** 5.4.0 (1.0.0 first written 2026-07-31 from plane 0.55.0; 1.1.0 2026-07-31, REC-3 — additive, non-breaking: `op=promote` server-stamps `surfaced_by` for focus/problem creations from the caller's actor class; no op renamed, no class/shape/reason changed; 1.2.0 2026-07-31, REC-4 — additive, non-breaking on `op=taskforward` and `op=taskresolve`: (a) a NEW named refusal reason `NOT_YOURS` (the TASK-ACTOR FENCE, D-98 / construct T · TASK) — a caller who is neither the task's `assignee` nor an admin is refused, and the refusal NAMES who it is with (`assignee`, `assignee_role`, and a human `detail`); an honestly `unassigned` task stays claimable. No existing reason, class, or success shape changed. (b) both ops are now reachable by a member/admin SESSION, not only a machine credential — the assignee acts through their browser session (actor stamped server-side), which the Tasks screen already assumed; a widening of reach, additive, nothing previously admitted is now refused. See DEC-7. 1.3.0 2026-07-31, REC-6 — additive, non-breaking: one NEW read op `op=proposals`, the DISCOVERY feed for DERIVED findings (UI-5's delegation). A read-time walk of every progression instance for its undischarged missing-predecessor findings, returned BOTH raw-per-instance (`instances[]` — the shape `op=instance` returns, which UI-5's `loadProposals` already consumes, so its surface populates with NO UI change) AND D-79-aggregated (`proposals[]` — ONE proposal per `(progression_key, stage_key)` carrying its N instances, the WEAKEST §8.1 grade across them with any-undetermined→undetermined, `surfaced_by: machine`). Ungated like the other progression reads (admin/member/probe, `mutating:false`); REPORTS, never mutates. No op renamed, no class/shape/reason changed on any existing op. 1.4.0 2026-07-31, REC-7 — additive, non-breaking: one NEW write op `op=proposedispose` (mutating, `contribute`, admin/member/probe) records a member's DEFER or DISMISS of a derived proposal — keyed by the proposal's identity `(progression_key, stage_key)`, carrying a REQUIRED reason (refused `NO_REASON`, never prefilled; `NOT_A_DISPOSITION`/`BAD_REASON`/`BAD_STAGE`/`NO_DECIDER` the other named refusals) and the SERVER-STAMPED deciding member — and mints NO bundle (D-79: declining is not authoring). And `op=proposals` gains DISPOSITION-AWARENESS, ADDITIVELY: a disposed proposal is FILTERED from the OPEN `instances`/`proposals` (so a declined proposal ages out rather than reappearing as open — UI-5's `loadProposals` re-aggregates `instances[]`, so its surface ages it with NO UI change) and RETURNED alongside in a NEW `dispositions[]` array (`{key, progression_key, stage_key, state, reason, decided_by, at}`) with a `disposition_count`, so the decision stays on the record. The existing `instances[]`/`proposals[]` shapes and their fields are unchanged — a reader that ignores `dispositions[]` sees the same shape, only with aged proposals excluded. No op renamed, no class/reason changed on any existing op. 1.5.0 2026-07-31, REC-8 (CONSTRUCTS Step 7, AGEING) — additive, non-breaking on `op=proposals`: the feed now also carries OVERDUE-SUCCESSOR findings, DERIVED ON READ against an INJECTABLE clock (there is NO overdue table — an overdue flag goes stale against the clock). (a) `instances[].findings[]` may now contain a DISTINCT finding kind `overdue_successor` ALONGSIDE `missing_predecessor` for the same stage — so a consumer tells "never happened" (missing) from "not yet, but overdue" — carrying `{kind, stage_key, stage_label, required, after_stage, predecessor_stage, predecessor_at, within_interval, deadline, overdue_by_ms, grade, grade_determined}`; a stage is overdue only when its `within_interval` PARSES to a duration, its predecessor stage is placed AND carries a determinable date (the reading's `at`, FW-5, else the register's `registered`), and `predecessor_date + within_interval < now` — otherwise it is undetermined and never overdue (never a fabricated deadline). (b) each `proposals[]` group gains `overdue` (bool — any instance past its deadline), `overdue_count`, and `kinds` (the finding kinds it aggregates); each `proposals[].instances[]` entry gains `overdue` + `deadline`. The proposal is still ONE per `(progression_key, stage_key)` (overdue does NOT split a stage into two proposals — D-79 don't-drown — and the disposition key is unchanged, so a disposition ages both the missing and overdue signal for that stage). (c) `op=proposals` accepts an OPTIONAL `now=<ms>` as-of instant (else env `BIO_NOW_MS`, else the wall clock), the same time-injection seam `op=sourcereach` opened. A reader that ignores the new fields/kind sees the SAME shape. No op renamed, no class/reason changed on any existing op. 1.6.0 2026-08-01, REC-9 (CONSTRUCTS Step 8, PRESENTATION — document-page half, UI-9's delegation) — additive, non-breaking: one NEW read op `op=captureprogressions&sha256=<capture>` (read; classes admin/member/probe; `mutating:false`), the per-document → progression-instance lookup no existing op answered (op=instance needs BOTH `(progression_key, entity_id)`; op=proposals walks every instance but carries no `capture_sha`). It maps a CAPTURE back to the progression INSTANCES it is threaded into and returns `{ ok, capture_sha, count, instances:[ { progression_key, progression_label, entity_id, entity_label, stage_key, stage_label, findings:[…] } ] }`, where `stage_key`/`stage_label` are the CAPTURE's OWN stage in that instance and `findings[]` are the instance's `missing_predecessor` + `overdue_successor` findings — the SAME derivation op=proposals returns (`#assembleInstance` + REC-8's `#overdueFindings`, the ONE derivation point, keyed by capture instead of by `(progression, entity)`), each finding additionally carrying `established`/`needs_confirmation` PROJECTED from its already-derived grade (the `#resolutionView` boundary projection — not a new determination). It DERIVES ON READ (no table — an overdue/finding flag goes stale against the clock) and takes the same OPTIONAL `now=<ms>` as-of instant op=proposals takes (else env `BIO_NOW_MS`, else the wall clock) so overdue is deterministic in a suite. A capture threaded into NO progression returns an empty `instances[]` — honestly, never a fabricated membership; a missing `sha256` is the NAMED refusal `NO_SHA`. REPORTS, never mutates; ungated like the other progression reads. No op renamed, no class/shape/reason changed on any existing op. 2.0.0 2026-08-03, REC-10 via IC-3 — BREAKING, deliberately versioned as such: `op=dispose`'s refusal reason `NOT_PROBLEMS` is RENAMED `NOT_INQUIRIES` (the inquiry collapse, DATA-MODEL §2.7 change 13). Measured consumer impact nil (the UI reads `reason` for display and pins no literal — grepped at integration), and UI-10 carries the vocabulary catch-up; recorded as major because a renamed wire string is a break by definition and an additive label would teach this registry to lie. Everything else on the op (class, gate, success shape, other reasons) unchanged. 3.0.0 2026-08-03, REC-29 via IC-4 — BREAKING, deliberately versioned as such: op=memberlist's answer is viewer-dependent; a non-administrator's rows carry NO cover key (D-157, the anti-deanonymisation projection, server-stamped and fail-closed). Measured consumer impact nil; a UI-10-class item corrects any pinned read. 4.0.0 2026-08-03, REC-30 via IC-5 — BREAKING for the caller class that was the leak: fifteen read ops answer by the viewer's position (subject rows withheld countless; back-references redacted null; ms removed from every envelope). Byte-identical for machine credentials, admins and participants. 4.1.0 2026-08-03, REC-16 via IC-6 — ADDITIVE: op=inquirydivide (contribute; the R4 division act) and the affordances act shape gains `prompt` (the plane-published divide wording; a consumer ignoring it sees the prior shape). 5.0.0 2026-08-03, REC-28 via IC-7 — BREAKING for machine callers: taskforward/taskresolve refuse every token:* actor by name (MACHINE_CANNOT_FORWARD/RESOLVE) and probe leaves their classes; no session affected. 5.1.0 2026-08-04, REC-17 via IC-8 — ADDITIVE: op=reevaluations (gated read; the P-64 obligation as a query), the four acts' reevaluation.raised echo, and the CITED refusal on dispose/inquirydivide (new refusal, measured nil on landed consumers). 5.2.0 2026-08-04, REC-22 via IC-9 — ADDITIVE: op=publishedcase/op=publishedbytes (classes null, the published projection only, bytes by hash, the deterministic container zip) and capture bytes joining bio-case-container/1's manifest. 5.3.0 2026-08-04, REC-34 via IC-10 — ADDITIVE: op=inquirystrength (the gated derived-pair read; UNRATED and undetermined distinguishable; REC-30 postures + prose sweep). 5.4.0 2026-08-04, REC-18 via IC-11 — ADDITIVE on the op surface (op=earnedbasis; BASIS_REFUSED gains repairs; SUBJECT_REFUSED on promote), with the GRADE_SOURCES vocabulary widening carried through the catalog version and the UI's own drift guard (fired by design, migrated at integration).)
- **Consumers:** `UI`, `DIST` (the installer's served surfaces), every content area
  that needs its work reachable
- **Status:** STABLE

### What it is

The op surface itself: how a caller names an operation, how it is authorised, and what
shape an answer takes. It was never registered, and it is the interface with the most
consumers.

### The shape

- **Dispatch.** `op` is resolved as `searchParams.get("op") || path.slice(1)`, so
  `/api/?op=cite` and a bare `/cite` are the SAME dispatch. Both are the control
  plane; both are authorised identically. A suite that drives one has driven the other
  — and a suite that drives the Durable Object stub directly has driven NEITHER, which
  is the D-43 defect class and is what `scripts/coverage.mjs` now counts.
- **The op table.** `OPS` in `src/index.mjs` is the registry: each entry names
  `classes` (the token classes admitted, or `null` for deliberately unauthenticated)
  and `mutating`. An op absent from the table answers `unknown op`. A `classes: null`
  op gates itself and MUST be reachable through the control plane, because that is a
  real caller's only route.
- **Answers.** JSON, `{ok: …}` shaped, with a named `reason` on a refusal. A refusal
  is a structured answer and not an exception: an op that throws hands the caller a
  platform error where a BIO reason belongs (D-39).
- **Capability gating** applies to a SESSION and never to a machine credential: a
  token class has no member behind it and therefore holds no capabilities.
- **Namespace.** `store=` selects the namespace; the probe class is confined to
  `scratch`. Unauthenticated invitation ops honour `store=`; `claim` and `login` are
  pinned to `bio`, because an instance has one identity (D-44).

### What changing it costs

Adding an op is additive and needs no protocol. Renaming one, changing its `classes`,
changing a refusal `reason` a caller matches on, or changing the answer shape is a
change to this interface: `civicos-ui` and the served pages match on these strings.

---

## I4 — plane → installer (the release artifact)

- **ID:** I4
- **Owner:** `DIST`
- **Version:** 1.0.0 (first written 2026-07-31; half-formalised by D-106's version
  authority rule)
- **Consumers:** `newgroup/**`, and every sovereign instance it installs
- **Status:** STABLE

### The shape

- **`bio-plane/package.json` is the single declared version authority.** `resolveVersion`
  refuses on ANY disagreement in either direction, names both files and prints the
  exact edit, and runs BEFORE the esbuild so a mismatch costs a second and leaves no
  stale artifact. A wrangler config AHEAD of package.json is the same drift mirrored,
  not a newer release.
- **The artifact** is `dist/bio-plane.bundled.mjs`, one self-contained module with
  every import inlined — which is why `docprofile/` living outside `bio-plane/` costs
  the deployed artifact nothing, as long as it is present at BUILD time.
- **`release/RELEASE.json`** carries the signature. `selectRelease` prefers a newer
  repository release over the built-in copy, and falls back to the built-in only when
  the repository is unreachable or fails integrity or signature.
- **`bindings: []` is a structural guarantee**, not a convention: the installer holds
  no credential, and a deploy that broke that property would be a security regression
  a hand-paste could cause silently (D-107).
- **`INSTANCE_NAME` is bound from the worker slug**, on install and on update, with no
  second name and no override. A third party sees the name the operator typed.

### What changing it costs

The version authority rule and the empty binding set are load-bearing security and
correctness properties, not preferences. Changing either is an interface change.

---

## I5 — the store schema

- **ID:** I5
- **Owner:** `RECORD`
- **Version:** 1.8.0 (1.0.0 first written 2026-07-31, from plane 0.55.0; 1.1.0
  2026-07-31, FW-5 — ADDITIVE: two new DERIVED tables, `readings` and
  `reading_refs` (CONSTRUCTS Step 3), added BEFORE the `host_governor` block and to
  `op=purge`'s whole-store arm per the three rules below; 1.2.0 2026-07-31, FW-6 —
  ADDITIVE: three new tables `entities`, `entity_aliases`, `entity_relations` (the
  SUBJECT REGISTRY, CONSTRUCTS Step 4 slice A / D-83), added BEFORE `host_governor`
  and to `op=purge`'s whole-store arm; 1.3.0 2026-07-31, FW-7 — ADDITIVE: one new
  DERIVED table `resolutions` (the RECOGNISERS, CONSTRUCTS Step 4 slice B), added
  BEFORE `host_governor` and to `op=purge`'s `TABLES` (so it clears in BOTH the
  per-bundle and whole-store arms, like `readings`/`reading_refs`); 1.4.0 2026-07-31,
  FW-8 — ADDITIVE: three new tables `connections` (DERIVED — the two-node base case of
  a progression, CONSTRUCTS Step 5 slice A / D-67 storage + D-72 grade), `progression_defs`
  and `progression_stages` (FIRST-CLASS member-declared, the progression definition as
  data / D-73's rule half), all added BEFORE `host_governor` and cleared by `op=purge`
  (connections in BOTH arms via an explicit `a_bundle_id`/`b_bundle_id` delete since it
  has no single `bundle_id`; the two progression tables in the whole-store arm like the
  registry); 1.5.0 2026-07-31, FW-9 — ADDITIVE: one new DERIVED table
  `progression_instances` (CONSTRUCTS Step 5 slice B — a progression INSTANCE threaded
  through a definition's stages by an entity), added BEFORE `host_governor` and to
  `op=purge`'s `TABLES` (so it clears in BOTH arms like `resolutions`, since a placement
  carries `bundle_id`); 1.6.0 2026-07-31, FW-10 — ADDITIVE: one new DERIVED table
  `progression_exceptions` (CONSTRUCTS Step 5 slice C — an EXCEPTION DOCUMENT that discharges a
  lawful skip, framework §8.2), added BEFORE `host_governor` and to `op=purge`'s `TABLES` (so it
  clears in BOTH arms like `progression_instances`, since an exception document carries
  `bundle_id`); 1.7.0 2026-07-31, REC-5 — ADDITIVE: one new DERIVED table `connection_dirty`
  (D-122 — the connection-derive WATERMARK: a bounded work-queue of entities whose
  resolutions changed since their connections were last derived, so the scheduled
  connection-derive sweep on REC-1's DO alarm re-derives only what moved; stamped at
  op=resolve/op=resolvetestify on insert-or-raise, keyed by `entity_id`), added BEFORE
  `host_governor` and cleared by `op=purge`'s whole-store arm only (it has no `bundle_id`
  and is a transient queue, so a per-bundle purge leaves it — at worst one harmless
  idempotent re-derivation next tick); 1.8.0 2026-07-31, REC-7 — ADDITIVE: one new table
  `proposal_dispositions` (D-79 — the PROPOSAL-DISPOSITION store: a member's DEFER/DISMISS of a
  DERIVED proposal, keyed by the proposal's identity `(progression_key, stage_key)` — the same key
  REC-6's op=proposals aggregates by — holding state (deferred/dismissed), the REQUIRED reason, the
  server-stamped deciding member, and the time. It is how a declined proposal AGES rather than
  vanishing: op=proposals reads it, filters the aged proposal out of the OPEN feed, and returns it
  alongside. Member-authored decision state, NOT corpus-derived and carrying NO `bundle_id`
  (declining is not authoring — it mints no bundle), so added BEFORE `host_governor` and cleared by
  `op=purge`'s whole-store arm ONLY, like the registry and the progression definitions — a
  per-bundle purge leaves it. A re-disposition UPSERTS on the key, so one proposal re-decided keeps
  ONE row. No existing table's columns changed, so nothing built against I5 breaks. The shapes are
  in the ownership list and note below.)
- **Consumers:** every area that persists anything
- **Status:** STABLE

### The shape, and the three rules that are not style

1. **A derived table MUST be named in `op=purge`'s whole-store arm**, or a whole-store
   purge reports scope `ALL` and silently leaves rows (D-113). A purge that reports ALL
   and leaves rows is worse than one reporting a narrower scope, because the caller
   believes the store is empty. The list is maintained by hand today; the check that
   closes the CLASS is an M0 item.
2. **New tables go BEFORE the `host_governor` block.** `hygiene.test.mjs` asserts the
   schema literal ends on a `);`, so a table appended at the very end fails it.
3. **No backticks anywhere inside the schema template literal.** A BALANCED stray pair
   still parses, so `node --check` does not save you — this class has struck three
   times (D-24 twice, D-101). The guard counts ticks rather than parsing.

Table ownership as it stands: `bundles`, `files`, `history`, `manifest`, `refs`,
`register`, `leases`, `seq`, `credentials`, `sessions`, `bootstrap`, `members`,
`signers`, `published_*`, `inbox`, `bundles_fts` and the selection tables are
`RECORD`'s. `capture_limits`, `site_assets`, `site_asset_refs`, `capture_sessions`,
`links`, `link_verdicts`, `captured_locators`, `runtime_observations`, `cpu_probe`,
`task_queue`, `tasks`, `source_reachability`, `host_governor` are `CAPTURE`'s.
`readings` and `reading_refs` (FW-5, CONSTRUCTS Step 3) are `FRAMEWORK`'s: a
reading is what a doctype's `parse()` found in a captured document — its
entities[] plus document facts — persisted by `op=promote` (derived from
`data/provenance.json`, exactly as `refs` is derived from `bundle.md`, so it is a
projection and never a second source of truth). `readings` holds one row per
captured document keyed by `capture_sha` (the reading as JSON, plus `found`,
`entity_count`, `content_type`, `reader_version`); `reading_refs` indexes each
entity by the RAW reference it carries (`ref` = `kind:key`, e.g. `meeting:2101`,
NOT a canonical entity id — that is Step 4 / D-83). Read through `op=reading`
(by `capture_sha`) and `op=readingref` (the reverse index, by `ref`). Both are
DERIVED from the corpus and cleared by a whole-store purge.

`entities`, `entity_aliases`, `entity_relations` (FW-6, CONSTRUCTS Step 4 slice A /
D-83) are `FRAMEWORK`'s: the SUBJECT REGISTRY, which IS the framework's entity axis
and the bias doctrine's safeguard-4 subject registry — one construct built once. An
`entities` row is a subject (kind ∈ the closed union {source, institution, office,
movement, person, body, ordinance, parcel, contract, fund}, reconciled across the two
doctrines — DEC-6 leaves open whether a bias STATEMENT may take the non-safeguard-4
kinds as a subject) keyed by an allocated `entity_id` (the retrieval KEY). `entity_aliases`
holds first-class aliases per entity (the canonical label is seeded as one), keyed for
reverse lookup by a case-folded `alias_norm`. `entity_relations` holds DECLARED relations
(`proxy_for`/`member_of`/`overlaps`), each with a NOT-NULL `justification` and `citation`
"like a pattern statement" — and **deliberately NO grade column**: a declared relation is
CONSTITUTIVE, not evidentiary, so it sits outside the §8.1 A–D connection grade, and its
absence is the structural enforcement (grading it Grade D is the category error D-83
names). Unlike `readings`, these are FIRST-CLASS member-declared state, not a corpus
projection — but a whole-store purge (the scratch-reset tool) clears them like selections;
a per-bundle purge leaves them (no `bundle_id`). Write through `op=entitycreate` (with
inline aliases), `op=entityalias`, `op=relationdeclare` (all stamp `declared_by` from the
session, all need `contribute`); read through `op=entity` (by key), `op=entitybyalias`,
`op=relation` (by id).

`resolutions` (FW-7, CONSTRUCTS Step 4 slice B) is `FRAMEWORK`'s: the RECOGNISERS.
A resolution is the recogniser's match of one raw `reading_refs` reference (FW-5, a
source-assigned `kind:key`) to a registry `entities` row (FW-6), DECLARING THE METHOD —
which IS the framework's §8.1 connection **grade**. Keyed `(capture_sha, ref, entity_id)`
so a re-resolution that finds a stronger basis RAISES the grade+method IN PLACE
(`raised_from` records the prior grade), never a second row and never a downgrade — grade
is IMPROVABLE, not frozen. `grade` ∈ {A,B,C,D}: **A** the reference's composite key matched
a registered identifier exactly (the source's own identifier, both ends captured); **B**
the bare key matched a registered identifier in content; **C** a name/title matched an
entity ALIAS (correspondence — NEVER established, `needs_confirmation`); **D** member
TESTIMONY (`op=resolvetestify`, an author + a date, no captured basis). `established` is
DERIVED from grade at write (1 for A/B, 0 for C/D), so a C can never read back as
established. The recogniser (`op=resolve`) mints only A/B/C, matches a reference to an
entity's OWN aliases only, and NEVER traverses a declared relation (do not resolve THROUGH
a constitutive `proxy_for`/`member_of`/`overlaps` edge, D-83). Write through `op=resolve`
(the recogniser) and `op=resolvetestify` (grade-D testimony) — both stamp `resolved_by`
from the session and need `contribute`; read through `op=resolutions` (a document's
resolutions, by `capture_sha`) and **`op=concerns`** (the REVERSE INDEX — every document
that concerns an entity, joined on `entity_id`, by id). DERIVED from the corpus (carries
`bundle_id`), so cleared by BOTH a per-bundle and a whole-store purge (it is in
`op=purge`'s `TABLES`).

`connections`, `progression_defs`, `progression_stages` (FW-8, CONSTRUCTS Step 5 slice A)
are `FRAMEWORK`'s: CONNECTIONS AS DATA carrying a GRADE (D-67 storage + D-72 grade) and the
PROGRESSION DEFINITION as data (D-73's rule half). A `connections` row is the TWO-NODE base
case of a progression (framework §8.2 — "a connection row is a progression of two stages"):
two captured documents that resolve to the SAME `entities` row are connected, DERIVED from
`resolutions` — built under the `op=concerns` join, not a parallel path. Keyed
`(a_capture_sha, b_capture_sha, entity_id)` with the pair in canonical order (a < b) so
(X,Y) and (Y,X) are ONE row; a re-derivation after a resolution's grade is RAISED upserts
in place (a connection is improvable too). Its `grade` is the WEAKER of its two ends'
grades (`a_grade`, `b_grade`) by the §8.1 rank — framework §8.2's "a progression instance
inherits the weakest connection grade along its chain" in its two-node case — and
`established` derives from that weaker grade, so a connection resting on a C at either end
is NEVER established. `asserted_by` is THREE-VALUED (`system`/`source`/`member`) and is NOT
the grade (framework:554): `op=connect` writes only `system` (the framework inferred it);
`source` and `member` are reserved for slice B. DERIVED and carrying BOTH ends' bundle ids,
so a per-bundle purge (EITHER end matches) and a whole-store purge both clear it — it is
deleted EXPLICITLY in both arms (it has no single `bundle_id`, so it is NOT in `TABLES`).
`progression_defs`/`progression_stages` are the progression definition as EDITABLE DATA
(framework §8.2): a named ordered set of stages carrying `after_stage`, `cardinality`,
`within_interval` and `required` (∈ {always, usually, sometimes, never, unless_exception}).
Both example progressions are expressible as rows — meeting→agenda→minutes AND
need→award→signed-contract. They are FIRST-CLASS member-declared (a group's CLAIM about how
its institutions ought to behave, §8.1), so a whole-store purge clears them (scratch reset)
and a per-bundle purge leaves them (no `bundle_id`). Write through `op=connect` (derive
connections for an entity) and `op=progressiondefine` (author a definition, stamps
`declared_by` from the session; both need `contribute`); read through `op=connections` (by
entity id or capture sha) and `op=progression` (a definition by key). Progression
INSTANCES, weakest-grade inheritance along an N-stage chain (D-73 pair→chain, beyond the
two-node base case here), exception documents, junction checks and the missing-predecessor
task are SLICE B — not built by FW-8.

`progression_instances` (FW-9, CONSTRUCTS Step 5 slice B) is `FRAMEWORK`'s: a progression
INSTANCE — an actual N-stage chain of REAL captured documents threaded through a definition's
stages by a THREADING ENTITY (framework §8.2, "an instance of a progression is assembled by
following an entity"). Each row is ONE captured document placed at ONE stage of ONE instance;
the instance is all rows sharing `(progression_key, entity_id)`, keyed
`(progression_key, entity_id, stage_key, capture_sha)` so a stage may hold several documents
(cardinality `0..n`). A document is admitted only if it RESOLVES to the threading entity
(FW-7) — a real connection, not one a caller can invent — and each placement's `grade` is the
STRONGEST §8.1 resolution of THAT capture to the entity (the same collapse `op=concerns`/
`op=connect` make), never the caller's. The INSTANCE grade (the WEAKEST connection along the
chain — FW-8 graded the two-node base case, FW-9 generalises to N stages, D-73 pair→chain) and
the MISSING-PREDECESSOR findings are DERIVED ON READ from these rows plus the CURRENT
definition, NEVER stored as a grade that could go stale: a stage that is `required`
(always/usually, framework §8.2) with no threaded document surfaces as a finding carrying the
instance's grade (the framework's own example, an award with no solicitation, M4's acceptance).
Requiredness is respected — a missing `sometimes`/`never` stage is NOT a finding, and
`unless_exception` is DEFERRED with the exception-document machinery (DEC-9). Fewer than two
placed stages yield an UNDETERMINED grade — never invented (undetermined is first-class).
DERIVED from the corpus (carries `bundle_id`), so cleared by BOTH a per-bundle and a
whole-store purge (it is in `op=purge`'s `TABLES`). Write through `op=thread` (thread
documents into an instance — stamps `threaded_by` from the session, needs `contribute`); read
through `op=instance` (by `progression_key` + `entity_id`; ungated like the other reads).
Exception documents that discharge a lawful skip, junction checks as findings, and the
SCHEDULED task that walks this table for missing predecessors (it would ride the REC-1 DO-alarm
scheduler) are DEFERRED past FW-9.

`progression_exceptions` (FW-10, CONSTRUCTS Step 5 slice C) is `FRAMEWORK`'s: an EXCEPTION
DOCUMENT that discharges a LEGITIMATE SKIP (framework §8.2 — "a skipped stage with no exception
document is [a finding]. The table records which document discharges which skip"). A row is a
REAL captured document threaded onto ONE progression instance and NAMING the ONE stage it
discharges, carrying a `reason` and a `citation` (both NOT NULL — the justification an
institution publishes for a lawful skip, the same statement anatomy FW-8's declared relations
carry). Keyed `(progression_key, entity_id, stage_key, capture_sha)` so a stage may be
discharged by several documents and re-recording the same document at a stage UPSERTS. A
discharge must be EARNED, enforced at the write path (`op=discharge`) and NEVER on a caller's
bare assertion (an equality a caller can hand us is one a caller can invent): the document must
ACTUALLY resolve to the threading entity (FW-7 — refused `NOT_CONCERNED`, the same gate
`op=thread` uses) and NAME a real stage (refused `BAD_STAGE`), and carry a reason + citation
(refused `NO_REASON` / `NO_CITATION`). Whether the discharge APPLIES is DERIVED ON READ in
`#assembleInstance`: only a REQUIRED stage that is actually MISSING is discharged (rendered a
distinct "discharged" state carrying the reason/citation and the document — never a gap, never
silently absent, and never a stored `discharged` boolean that could go stale against the live
placements — derived findings inform, they do not decide). An exception naming a stage that is
present discharges nothing (there is no skip). This also GIVES DEC-9 ITS MECHANISM:
`unless_exception` graduates to DISCHARGEABLE — a required `unless_exception` stage now fires a
missing-predecessor finding ONLY when undischarged (DEC-9's own recommendation c; the policy of
whether it fires by default stays Bob's, DEC-9 left OPEN). DERIVED from the corpus (carries
`bundle_id`), so cleared by BOTH a per-bundle and a whole-store purge (it is in `op=purge`'s
`TABLES`). Write through `op=discharge` (stamps `declared_by` from the session, needs
`contribute`); read through `op=exceptions` (the raw discharge rows, by `progression_key` +
`entity_id`; ungated like the other reads) — the discharges that APPLY also surface on
`op=instance` as the "discharged" states. JUNCTION checks as findings and the SCHEDULED
walking-task (it would ride the REC-1 DO-alarm scheduler) remain DEFERRED past FW-10.

`connection_dirty` (REC-5, D-122) is `RECORD`'s: the CONNECTION-DERIVE WATERMARK — the
first consumer to actually RIDE the REC-1 DO-alarm scheduler for framework work, closing
the gap where `op=connect` was a manual mutation nothing called and the entity axis stayed
empty (UI-4). It is a bounded work-queue of the entities whose `resolutions` CHANGED since
their connections were last derived: stamped at `op=resolve` / `op=resolvetestify` ONLY when
a resolution is INSERTED or grade-RAISED (a kept idempotent re-resolve dirties nothing),
keyed by `entity_id` so many resolutions touching one entity collapse to ONE pending row —
the sweep is bounded by the count of DISTINCT changed entities, never by resolve volume. A
`connection-derive` consumer on the DO alarm derives connections (the EXISTING FW-8
`deriveConnections`, `asserted_by` `system` — a scheduled derivation is a machine act, not a
member's) for a bounded batch of dirty entities per tick and clears each once derived; while
more remain the consumer's wake stays non-null and re-arms, and when the set empties the wake
goes null and the alarm SELF-TERMINATES. Idempotent by the FW-8 connection key (re-deriving
UPSERTS, never duplicates), so a lost dirty row costs one skipped re-derivation and a spurious
one costs one no-op — which is why a transient set is safe here. DERIVED from the corpus (an
entity is dirty only because a document resolved to it) but with NO `bundle_id`, so it is
cleared by `op=purge`'s WHOLE-STORE arm only (a per-bundle purge leaves it — at worst one
harmless re-derivation next tick). No new op: it reuses `op=resolve`/`op=connect`/
`op=connections`, and the alarm is driven by the reserved `onAlarm`. DEFERRED past REC-5 and
flagged: auto-assembling progression INSTANCES + surfacing missing-predecessor findings on the
same tick (the FW-9/FW-10 walking-task, now that connections auto-derive).

### What changing it costs

A schema change reshapes DERIVED tables only, and BEFORE schema application. Nothing
reshapes a table holding first-party assertions: provenance documents are first-party
material and are never rewritten, so the record is legitimately non-uniform across
eras (D-99).

---

## I6 — plane → pdf-worker (the first fleet service binding)

- **ID:** I6
- **Owner:** `CONTENT-PDF` (the code); `DIST` releases it
- **Version:** 0.1.0 — **PROVISIONAL.** Registered 2026-07-31 from Bob's topology
  decision, BEFORE the worker exists, deliberately: I1 was written from code because
  the code was there first, and this one is written from the decision because
  building against an unregistered contract is what `PARALLELISM.md` forbids. It
  becomes 1.0.0 and STABLE when `pdf-worker` ships and the shape is re-read from the
  code, as I1 was.
- **Consumers:** the plane (`RECORD` owns the calling side, `op=pdfstructure`)
- **Status:** PROVISIONAL

### What it is

The first member of the function-specific Worker fleet (`PARALLELISM.md`, "Deployment
units are a separate axis"). The plane stays lean; `pdf-worker` holds `unpdf`
(pdf.js) and nothing else of consequence.

### The shape

**In:** a capture sha, and nothing more. `{ capture_sha: <64 lowercase hex>, store: <namespace> }`

The worker **reads the bytes from R2 itself** rather than being handed them, which is
the point: a document too large to hold in the plane is exactly the document this
exists for, so passing bytes across the binding would reintroduce the constraint the
split removes.

**Out:** the I2 structure shape, extended with text. Not a pdf.js object, not a
library type — the record's own vocabulary, per fleet rule 1. `undetermined` is
first-class in the output: a tier that cannot decode something SAYS SO, per
document and per region, and never returns silently truncated text.

### What it consumes from I1, and the one thing that changes

`pdf-worker` consumes I1 §2, the **R2 key shape** (`${storeName}/captures/${sha}`),
rather than I1 §3, the `op=capture` op. I1 already documents the key shape as part of
the contract's ground truth, so this is within I1 and not a change to it — but it
promotes the key shape from documentation to a load-bearing dependency with a second
consumer. Changing it now breaks a Worker, not just a reader.

### What it must NOT do

- **Write anything.** No register row, no provenance, no capture, no task. It returns
  derived structure and the plane decides what that means (fleet rule 2).
- **Hold a `PUBLISHED` binding.** `CAPTURES` read is the whole of its need.
- **Be called by anything but the plane.** It has no member-facing surface and no
  token classes of its own; the plane's op layer is the authorisation boundary.

### As built (CPDF-6, 2026-07-31) — `pdf-worker/**`, branch `content-pdf/pdf-worker`

The worker now EXISTS; the shape re-read from its code:

- **Transport.** `POST` to the binding (`env.PDF_WORKER.fetch("https://pdf-worker/structure", …)`),
  body `{ capture_sha, store }`. The worker reads `${store}/captures/${capture_sha}` from its
  own `CAPTURES` read binding (I1 §2) and returns the I2 object above with a top-level `tier`.
- **The plane escalates ONLY the measured residue.** `op=pdfstructure` runs Tier 1 in-plane,
  then calls the worker only when `text.counts.undetermined > text.counts.chars` (Tier 1 got
  essentially nothing — the encryption and whole-document no-/ToUnicode cases, CPDF-5's
  buckets), never for a budget book already read at ~88%. The binding is OPTIONAL at runtime:
  absent it (an instance that has not installed the fleet, D-115), the plane returns Tier 1,
  named, no crash.
- **unpdf 1.8.0 PINNED**, VERIFIED extracting on workerd (the member's real runtime, where
  pdf.js's `Math.sumPrecise` resolves natively; node lacks it — a guarded polyfill covers
  node). A Tier-2 **envelope** (`MAX_PDF_BYTES`, default 16 MB) declines an over-large document
  to text-`undetermined`, never truncated.
- **Writes nothing, holds only `CAPTURES` read**, no `PUBLISHED`, no `STORE` — asserted
  behaviourally (R2 byte-for-byte unchanged after a call) and by a source scan (no
  `.put`/`.delete`). Fleet rules 2/3 hold structurally.

### Open before it can go STABLE (→ 1.0.0)

- **A DIST deploy** of the member + the plane's service binding (a new Worker and a binding
  are a gated release; the installer must learn to install the FLEET, D-115/D-116). Until
  then the escalation path is dark on the live instance even though the code and the binding
  config are landed. This is DELEGATED to DIST.
- A FRAMEWORK session (FW-1) confirms or counters the extended `text`+`tier` shape.
- Free-tier viability was MEASURED (CPDF-7, D-118 CLOSED): a second Worker and a service
  binding both work on this Free account (~1 ms/call, one subrequest). The residual open
  number is pdf.js against the 10 ms Worker-CPU ceiling — CPDF-1's gated follow-on, on a
  deployed probe, out of scope here.

---

## I7 — the FORMAT registry entry (content dispatch)

- **ID:** I7
- **Owner:** `CONTENT-OFFICE` (new area, proposed in the 2026-08-03 BOB INBOX entry;
  CONDUCT confirms ownership at activation)
- **Version:** 1.0.0 — **CONFIRMED** 2026-08-03 by CONTENT-OFFICE (COFF-1) from the
  code as built (`bio-plane/src/formats.mjs`); the drift corrections from the 0.1.0
  paper shape are named under "Confirmed shape" below, resolved in favour of the code
  as the Status section always said they would be
- **Producers:** every format entry — HTML and PDF (moved on by COFF-1), the OOXML
  entries (COFF-3/4/5), ODF and later formats
- **Consumers:** the plane's two dispatch sites — acquire-time detection and the
  read-time structure/text op

### What it is

The uniform recogniser shape for the FORMAT axis, specified by
`BIO_Content_Framework_v0_10.md` §4 and never exercised — D-70 records that the
framework's a-new-axis-costs-a-registry-entry claim is an assertion, untested because
no third axis had ever been added. Office formats are that test. One registry entry
per format; since COFF-1 landed (2026-08-03), the registry IS the only dispatch — no
format-specific if-branch outside it, at either dispatch site.

### Confirmed shape (from `bio-plane/src/formats.mjs` as built, COFF-1)

    { format,                                                        // string, the registry key ("html", "pdf", ...)
      detect(bytes, contentType) -> {format, confidence, signals} | null,  // REQUIRED; null = "not mine"
      parts(container)           -> named parts             | null,  // container walk (ZIP central directory for OOXML/ODF)
      structure(parts)           -> I2 links + element refs | null,  // IC-1 kinds
      text(parts)                -> I2 text shape           | null } // what could NOT be decoded, stated

    registerFormat(entry) / getFormat(format) / listFormats() / detectFormat(bytes, contentType)

Drift from the 0.1.0 paper shape, corrected here from the code (the code wins):

- **`detect` is the only REQUIRED function; the other three slots are explicit
  `null` when a format has nothing for them**, and the null is a statement, not a
  gap: HTML's `structure` is null because HTML structure is produced at ACQUIRE
  time by the subresource walk (`subresources.mjs`), which needs live-fetch
  context no read-time entry has; PDF's `parts` is null because a PDF is its own
  container (`structure()` takes the assembled bytes); PDF's `text` is null
  because Tier 1 text rides `structure()`'s own I2 output object
  (`pdfstructure.mjs`'s do-not-fork rule, CPDF-4). COFF-2/3/4/5 are the first
  real `parts`/`text` implementors.
- **Magic-bytes-first is enforced by the REGISTRY, structurally, not by each
  entry's discipline**: `detectFormat` runs TWO passes — every entry asked
  `detect(bytes, null)` first, then every entry asked `detect(null, contentType)`
  — so a byte signature always outranks a declared content type whatever an
  individual entry does. A byte match answers `certain`; a content-type-only
  match answers `likely` at best. Registration order is dispatch order within a
  pass.
- **No match is a STATED undetermined**: `detectFormat` returns
  `{format:"undetermined", confidence:"none", signals:[why]}`, never null and
  never a guess.
- The registry is module-scoped in-memory dispatch (`unregisterFormat` exists for
  the registry's own suite — teardown and negative control — and touches no
  record state).

Rules carried from the axes already built, not new inventions:

- **Detection is by MAGIC BYTES first, content type second** — a source's declared
  `Content-Type` is frequently wrong, and I1 records that it may be absent entirely.
  For OOXML the discriminator is `PK\x03\x04` plus `[Content_Types].xml` and its
  declared document type, which is what separates a `.docx` from an arbitrary ZIP a
  body might also publish.
- **`undetermined` is first-class in every function's output.** A part that cannot be
  read, a bound exceeded, a flavour that cannot be discriminated — stated, never
  guessed, never silently dropped.
- **A format entry ASSERTS nothing about meaning** (that stays FRAMEWORK's, through
  I2) **and writes nothing** (the fleet rule, applied one layer down).

### Status

CONFIRMED 1.0.0, 2026-08-03, by CONTENT-OFFICE (COFF-1) from the code as built —
exactly the confirmation the PROVISIONAL registration (2026-08-03, session BOB, from
the framework §4 design) scheduled: the paper contract existed so COFF-1 and COFF-2
could build independently, and the code now wins on drift, with the corrections named
in "Confirmed shape" above. The D-70 test PASSED: a test-only stub format registers
through `registerFormat()` and is reachable through the same detect→structure
pipeline with ZERO edits outside `formats.mjs` (`formats.test.mjs`), so framework
§9's a-new-format-costs-a-registry-entry claim is a demonstrated property for the
FORMAT axis. Both dispatch sites consult only the registry: the acquire-time
subresource guard (content-type-only at that seam, because the primary is
deliberately unread there; behaviour pinned HTML-only) and `op=pdfstructure` (asks
for "pdf" BY NAME — the op names its format — and an absent entry is a 501
`FORMAT_UNREGISTERED` naming the format, never a guess at another extractor).
