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
