# pdf-worker — requirements

## Public

### Purpose

The tier-2 member of the function-specific Worker fleet (I6): the dependency-laden PDF path
(`unpdf`/pdf.js) that cannot live in the plane's module graph
(MEASUREMENTS.md, 2026-07-31). It reads a captured PDF's bytes from its own R2 binding and returns the
record's own vocabulary — never a pdf.js object — for the plane to build on. It
writes nothing: no register row, no provenance, no capture, no task; a hop a caller can hand it is a hop
it never invents (D-112).

### Provides

**`POST /structure`** (service binding `PDF_WORKER`; path `/structure` or the empty path) — body
`{capture_sha, store}` → the I2 structure+text shape, or a named refusal.
- **R1** Before the body is read: when `env.CAPTURES.get` is not a function, answers 503
  `R2_NOT_CONFIGURED`.
- **R2** `capture_sha` is lower-cased, then must match 64 hex characters; a missing, non-string, wrong-
  length or non-hex value — including one from a body that failed to parse as JSON — answers 400
  `BAD_SHA`.
- **R3** `store` must be a string; anything else answers 400 `BAD_STORE` (checked before R4, so an
  absent `store` never reaches it).
- **R4** `store` must be exactly `"bio"` or `"scratch"`, case-sensitive; any other value, including a
  case variant, a well-formed but unlisted name, or `""`, answers 400 `NAMESPACE_UNKNOWN` carrying
  `asked` (the value, truncated to 80 chars) and `namespaces` (the two names, in order). This set is
  copied from, and tested equal to, the plane's own (D-478, D-456); it is not this member's to widen.
- **R5** Reads the capture from `CAPTURES` at the R2 key `${store}/captures/${sha}`, by `.get` only. A
  missing object answers 404 `NOT_FOUND` with `capture_sha` and `store`; nothing else is inferred about
  why.
- **R6** Runs `pdf-reader.extractPdfStructure` over the bytes. When it answers `ok:false` (not a PDF, or
  not bytes), that answer is returned verbatim at 422 and no tier-2 pass runs.
- **R7** Otherwise its `.text` is replaced by this member's own reading and `.tier` is set (1 or 2) by
  R8–R10; every other field `extractPdfStructure` produced is passed through unchanged, at 200.
- **R8** Over envelope: bytes larger than `MAX_PDF_BYTES` (env override, default 16,777,216) skip tier 2:
  `.text` becomes `{document:"", pages:[], undetermined:[{page:null, reason:"over_envelope", font:null,
  codes:"", count:0, bytes, limit}], counts:{chars:0, undetermined:1}}`, `.tier` is 1, and
  `"tier2_declined_over_envelope"` is appended to `.notes`.
- **R9** Tier 2, otherwise: `unpdf` extracts each page's text (pages kept separate). `.text.pages` is one
  `{page, text, undetermined}` per page; a page whose trimmed text is empty carries one
  `{page, reason:"no_text_layer", font:null, codes:"", count:0}` marker, in its own `undetermined` and in
  the document-level list. `.text.document` joins the non-empty pages' text with `"\n"`.
  `.text.counts` is `{chars: document.length, undetermined: undetermined.length}`. `.tier` is 2.
- **R10** Tier-2 failure: when the tier-2 pass throws, `.text` becomes `{document:"", pages:[],
  undetermined:[{page:null, reason:"tier2_extraction_error", font:null, codes:"", count:0}],
  counts:{chars:0, undetermined:1}}`, `.tier` is 1, and `"tier2_error:<message, first 80 chars>"` is
  appended to `.notes`; the R6 structure fields are kept, and nothing is invented.

**`GET /version`** → `{ok:true, name:"pdf-worker", version: env.VERSION || "0.0.0"}`, always 200, read
from the deployed Worker's own `VERSION` var — never a constant compiled into the bundle, so it answers
the build actually serving rather than the build that was meant to (D-108).
- **R11** As stated. Never throws.

**Any other request** (any path but `structure`/`""`/`version`, or the wrong method) — **R12** answers
404 `{ok:false, reason:"UNKNOWN", detail:"POST /structure or GET /version only"}`.

**`SURFACE`** (exported constant) **and `fleet-member.json`** — read by the fleet-coverage instrument
(`bio-plane/scripts/coverage.mjs`, in `legacy-index`).
- **R35** `SURFACE` names exactly `structure` (`POST`) and `version` (`GET`), each `mutating:false` — this
  member asserts nothing (fleet rule 2).
- **R36** `fleet-member.json` names `entry` (`src/index.mjs`), `surface` (`"SURFACE"`), `testDir`
  (`"test"`), and the bundle recipe: `entry`, `outfile: dist/pdf-worker.bundled.mjs`,
  `manifest: dist/pdf-worker.bundle.json`.

## Private

### Uses

- `pdf-reader`: `extractPdfStructure(bytes)` for the I2 structure baseline.

### Invariants

- **R37** Never writes. Holds no `STORE` (Durable Object) binding and no `PUBLISHED` binding; `CAPTURES`
  (R2) is the only data binding and is only ever `.get`, never `.put`, `.head` or `.delete`.
- **R38** No place is named in this module's code (`src/index.mjs`) or in any refusal text; it holds no jurisdiction data
  (grepped 2026-09-25: none outside one comment citing an Oakland measurement as evidence).
- **R41** Pure per call: the same bytes and options always answer the same way; no clock, no randomness,
  no state carried between requests.

### Satisfies

- `BIO_Content_Framework_v0_10.md` §16, "The non-text path, in three tiers": this member IS tier 2
  (`/structure`'s text).

### Suggestions

- `unpdf` (pdf.js) 1.8.0 is pinned; `Math.sumPrecise` is polyfilled only where the runtime lacks it
  (guards node, not workerd, where the native one runs — CPDF-5).
- `scripts/build.mjs` inlines `unpdf` and commits `dist/pdf-worker.bundled.mjs` plus its manifest; the
  guard that the two match source (FL-9) lives in `bio-plane/test/fleetbundles.test.mjs`, outside this
  module's own `test/`.

---

**Status** · DRAFT by BOB #37, 2026-09-25 (T6); every id met and tested in T2. SPLIT by BOB #44, 2026-09-27, applying K70: R13–R34, R39, R40 moved to `pdf-pixels` (their numbers are retired here, never reused) and the decoders to `image-codecs`; R38 reworded to this module's own code; R41 new (the purity half of R40). Layer 1.
