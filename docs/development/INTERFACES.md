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
- **Version:** 1.0.0 (first written 2026-07-31, from plane 0.55.0)
- **Consumers:** `CONTENT-HTML`, `CONTENT-PDF`
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
- **Version:** 0.1.0 — **PROVISIONAL**, producer-proposed 2026-07-31 from
  CONTENT-PDF's as-built output (plane 0.55.0), written from the code that emits
  it rather than as anyone would like it, exactly as I1 was.
- **Producers:** `CONTENT-PDF` (live), `CONTENT-HTML` (dormant)
- **Consumer:** `FRAMEWORK` (dormant)
- **Status:** PROVISIONAL. FRAMEWORK cannot yet answer, so `ARCH` registers the
  producer's shape (protocol step 3, answering for a dormant area in writing) so
  content work proceeds. It becomes STABLE when a FRAMEWORK session confirms or
  counters it via `INTERFACE-CHANGES.md` (which does not exist until then).

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
`no_current_font`, `font_not_in_resources`, `code_width_misaligned`, `text_extraction_error` }
and `font` is the BaseFont (or null). This mirrors the link side's `undetermined` doctrine
but as its own `text.undetermined` array (a reason+font shape, not a link partition).
**FW-1 confirms or counters this EXTENDED shape (structure + text), not the link-only I2.**

### Open before it can go STABLE

- A FRAMEWORK session confirms or counters the shape.
- `CONTENT-HTML` emits the same shape from HTML, proving the container-agnostic
  claim across both producers rather than asserting it from one.

---

## I3 — plane → UI (the op contracts)

- **ID:** I3
- **Owner:** `RECORD` (moved from `CAPTURE` 2026-07-31; `PARALLELISM.md` anticipated
  this the first time op-wiring became a recurring delegation, and it has now
  recurred once — the `op=pdfstructure` delegation from CONTENT-PDF)
- **Version:** 1.0.0 (first written 2026-07-31, from plane 0.55.0)
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
- **Version:** 1.0.0 (first written 2026-07-31, from plane 0.55.0)
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

### Open before it can go STABLE

- The worker exists and the shape is re-read from its code.
- **Service bindings on Workers Free are UNMEASURED** and must not be assumed.
  Workers Paid is an optimisation and never a requirement (RULED), so if the binding
  or a second script is unavailable or capped on Free, the tiering below is not an
  optimisation — it is what keeps a free instance able to read a PDF at all. Measure
  before building the Tier 2 path. See D-118.
