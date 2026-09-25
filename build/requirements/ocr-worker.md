# ocr-worker — requirements

**Status** · DRAFT by BOB #37, 2026-09-25 (T6). Layer 1. Code today: `ocr-worker/src/index.mjs`,
`ocr-worker/src/contract.mjs`, `ocr-worker/src/transcribe.mjs`, `ocr-worker/src/tessengine.mjs`,
`ocr-worker/src/pngsamples.mjs`, `ocr-worker/src/tesslib.mjs` (generated vendor glue, not read
beyond its header), `ocr-worker/wrangler.jsonc`. Every requirement below is met by the code as it
stands; the old plan carries no row against this module (`docs/development/transition/old-plan/index.csv`)
and `build/plan/next.md` names none either.

## Public

### Purpose

A standalone Cloudflare Worker, reached only through the plane's `OCR_WORKER` service binding. Given
a capture's sha, a store namespace and a set of page numbers, it reads the captured bytes from R2
itself, renders one page to pixels, runs a wasm OCR engine over the frame, and answers with
line-grain text, each line carrying the pixel rectangle a reader can check it against and the
engine's own confidence — or a named refusal, leaving the document honestly unread. It holds no
record, writes nothing, and reports the running build's own version.

### Provides

**POST /transcribe** (also answered at the bare path `POST /`) — body `{capture_sha, store, pages}` →
`{ok, ...}`.

- **R1** `capture_sha` must be exactly 64 hex characters (case-insensitive; normalised to lower
  case before use). Anything else is refused `BAD_SHA` (400), checked before the store or the pages.
- **R2** `store` must be present and a string, or the request is refused `BAD_STORE` (400) — the
  condition is exactly "no namespace was named", whether the field is absent or of another type.
- **R3** A named `store` that is not exactly `"bio"` or `"scratch"` (case-sensitive) is refused
  `NAMESPACE_UNKNOWN` (400), naming what was asked (`asked`, truncated to 80 characters) and the two
  names that exist (`namespaces`). This is refused before the R2 bucket is addressed at all, even
  when bytes sit under that exact key — the fence is the NAME, not whether the bucket holds
  something there. The
  two names this module accepts are fixed in its own source; a caller depending on them matching the
  record's namespace set relies on that set not changing without this module changing too.
- **R4** `pages` must be a non-empty array, or the request is refused `BAD_PAGES` (400). An array
  that is non-empty but names no non-negative integer (after de-duplication) is refused the same way,
  from inside the chunk rule (R6).
- **R5** With no `CAPTURES` R2 binding configured, every call is refused `R2_NOT_CONFIGURED` (503),
  checked before the body is even read. Otherwise the bytes are read at key
  `${store}/captures/${sha}`; none found there is refused `NOT_FOUND` (404), naming `capture_sha` and
  `store`. `NOT_FOUND` and `NAMESPACE_UNKNOWN` are never each other: a namespace that does not exist
  is refused by name before any read, and only a namespace that exists can answer `NOT_FOUND`.
- **R6** Exactly ONE page is transcribed per call: the lowest distinct non-negative integer named in
  `pages`. The rest of the distinct integers named, sorted ascending, are returned in the top-level
  `deferred` array and are not attempted — this member never loops over several pages in one
  invocation. `notes` explains why whenever `deferred` is non-empty, citing the measured memory
  bound and that transcribing a whole document in one call is unmeasured.
- **R7** The one page taken is refused, in this order — the first condition that applies is the one
  reported, and a page failing an earlier condition is never evaluated against a later one:
  1. `ENGINE_ABSENT` (200, `ok:false`) — the wasm core or the language model did not load as the
     measured pair (checked before any bytes are touched).
  2. `PAGE_NOT_RENDERABLE` (200) — the page renderer (`pdf-worker`) refused it; this member forwards
     that refusal's own reason rather than reinterpreting it.
  3. `PIXELS_UNREADABLE` (200) — the renderer answered in a container this member cannot read at all
     (anything other than `image/png`).
  4. `FRAME_OVER_MEASURED_BOUND` (200) — the page's RGBA frame (`width * height * 4` bytes) exceeds
     `MAX_FRAME_BYTES` (61,300,000, the largest frame CPDF-15 measured completing on the deployed
     runtime); the refusal names `width`, `height`, `frame_bytes` and `bound_bytes`. Checked only
     once the container has passed step 3, so a page too large is refused by its true reason even
     when its container would also have been unreadable.
  5. `PIXELS_UNREADABLE` again (200) — the PNG this member did receive is a shape its own reader
     refuses (interlaced, an unsupported colour-type/bit-depth pair, a scanline filter it does not
     implement, or truncated data). Same reason code as step 3, reached only once the frame has
     passed the size check.
  6. `ENGINE_FAILED` (200) — the engine threw or refused on this frame; the refusal carries the
     engine's own error name and message.
  7. `NOTHING_TRANSCRIBED` (200) — the engine boxed no region carrying both non-blank text and a
     finite rectangle. This is answered exactly the same way for a blank page and for a page of pure
     noise: an engine that answers nothing on either is reporting a finding, not failing, and the
     refusal names how many boxes it found and how many were blank or unanchored.
  Every one of these is a document-level finding and is answered `200` with `ok:false`, never an
  HTTP error status — only a malformed request (R1–R4), an unconfigured binding (R5) or a capture
  genuinely absent (R5) uses a non-200 status.
- **R8** A successful answer (`ok:true`) carries, at minimum: `engine` ("tesseract-wasm"), `version`
  ("0.11.0"), `model` ("tessdata_fast/eng"), `cap` (the fixed letter `"C"`, never any other value —
  an OCR pass never earns a higher capture grade), `measured_by` (a string naming the one measurement
  `cap` and the confidence basis rest on, and its stated reach — never a default and never invented
  per request), `confidence_floor` (the instance's `OCR_CONFIDENCE_FLOOR`, read as a number in
  `0..1`, or `null` when it is absent, empty or out of range — `null` is a statement that no
  threshold has been measured, not an omission), `grain` (`"line"`), `deferred` (R6), `image`
  (`{width, height, frame_bytes, route, upright, rotate_deg, dpi, pixels_sha256}` of the rendered
  frame), `notes` (an array of strings, possibly empty), and `pages`: an array of exactly one
  `{page, regions}`.
- **R9** Each region in `regions` carries: `text` (a non-blank string), `source` (`{kind:"pdf-page",
  ref:"p<page>", page, rect:[left,top,right,bottom]` — four finite numbers, pixel coordinates of the
  frame that was OCR'd — `space:"image-px"`, and `image:{width,height,route,upright,rotate_deg,
  pixels_sha256}}`), and `confidence` — either `{value, basis:"engine"}` with `value` in `0..1` when
  the engine's own character-level decode rated the region, or the literal string `"none"` when it
  did not. No other basis is ever reported, and no value is substituted, rescaled or invented for a
  region the engine did not rate.
- **R10** A region the engine returned with no non-blank text, or with a rectangle that is not four
  finite numbers, is dropped from `regions` and counted rather than kept — never recorded as text
  with no anchor.

**GET /version** → `{ok:true, name:"ocr-worker", version, engine, engine_version, model,
engine_loaded, engine_unavailable?}`.

- **R11** `version` is read from the running build's own `env.VERSION` — never a value compiled into
  the source — so it names the code actually answering, not the code last deployed.
- **R12** `engine`, `engine_version` and `model` name the OCR engine this build carries
  ("tesseract-wasm", "0.11.0", "tessdata_fast/eng"), because this member's output is graded and
  which engine answered is part of which build answered.
- **R13** `engine_loaded` is asked, not assumed: it is `true` only when the wasm core arrived as a
  compiled `WebAssembly.Module` and the language model's byte length matches the measured pair; when
  it is `false`, `engine_unavailable` names why. A member deployed without its wasm part answers
  every other route normally and is caught here rather than on the first page asked of it.

**Any other method or path.**

- **R14** Refused `{ok:false, reason:"UNKNOWN"}` with HTTP 404.

## Private

### Uses

- `pdf-worker`: `renderPageToPixels(bytes, page, {decodeDct:true})` → `{ok:true, bytes, route,
  mediaType, width, height, upright, rotate_deg, pixels_sha256, page_geometry}` or a named refusal
  (a text layer, vector marks, several images on one page, an undecodable container, and others).
  This module always asks for `decodeDct:true` and forwards a refusal's `reason` verbatim as
  `PAGE_NOT_RENDERABLE`'s own reason; it does not reinterpret or renumber pdf-worker's refusal set.

### Invariants

- **R15** Writes nothing. No call to `.put`, `.delete`, `.createMultipartUpload` or
  `.resumeMultipartUpload` appears anywhere in this module's own sources, it holds no `STORE`
  (Durable Object) or `PUBLISHED` binding — so it structurally cannot write the record — and the
  bucket it reads from is byte-for-byte unchanged, object-for-object, after any sequence of calls.
- **R16** The namespace set this module will read from is exactly `["bio", "scratch"]`, case-
  sensitive, fixed in its own source; a name outside it is refused (R3) before the R2 bucket is ever
  addressed, even when bytes already sit under that exact key. This set names the same two namespaces the
  record it reads from actually holds — a caller extending the record's namespace set without this
  module's set moving too is a defect in this module's copy, not a defect in the request.
  (D-478, C-78.1's rule extended to every fleet member — see Suggestions.)
- **R17** The only confidence basis this module ever reports is the literal string `"engine"` or the
  literal string `"none"` — never a model's self-reported opinion of itself, and never a value
  rescaled or invented from one the engine did not produce.
- **R18** No production beyond what the engine's own decode produced: no spell-correction, no
  dictionary pass, no joining of hyphenated lines, no cleanup of any kind. Output text is exactly
  what the decoder decoded.
- **R19** The engine's identity (`ENGINE_NAME`, `ENGINE_VERSION`, `MODEL_NAME`) and the wasm/model
  byte sizes it was measured at (`WASM_BYTES`, `MODEL_BYTES`) are fixed constants, checked against
  what actually loaded before any page is processed (R13); a member serving different engine bytes
  than the ones its `cap` was measured on refuses rather than answering under that `cap`.
- **R20** No place is named in this module's behaviour, and no requirement above depends on which
  jurisdiction the document belongs to; the same inputs (bytes, page, namespace, engine settings)
  produce the same class of answer for any capture, in any instance. The one place-name in this
  module's source is a citation of the measurement `cap` and `measured_by` rest on (a specific
  ground-truthed page), never a fact its behaviour branches on.
- **R21** The wire answer is a pure function of the bytes read for the named capture, the page
  requested, and the two instance settings (`OCR_CONFIDENCE_FLOOR`, `OCR_PSM`); this module holds no
  state between calls, reads the record only through `CAPTURES.get`, and makes no other network or
  storage call.

### Satisfies

- `BIO_Content_Framework_v0_10.md` §16, "How content is extracted today" — the non-text path's tier
  3 and the OCR producer contract the plane's consumer (`ocrTextFromMember`,
  `bio-plane/src/index.mjs`) refuses on.
- `BIO_Distribution_v0_1.md` (whole) — the fleet-member rules this module is held to: it writes
  nothing, it versions and rolls out on its own, and `GET /version` reports the build actually
  running rather than a compiled-in constant.
- DEC-35 (`docs/development/DECISIONS.md`) — the in-account path is the default for Tier-3 OCR, and
  the plane and `pdf-worker` are ruled out as its home by bundle size, which is why this exists as
  its own fleet member.
- DEC-42 (`docs/development/DECISIONS.md`) — wasm tesseract named as the engine.
- `build/layers.md`, "No jurisdiction in the product" (R20).

### Suggestions

- The memory bound (`MAX_FRAME_BYTES = 61,300,000`) and the one-page-per-invocation rule are both
  measured facts (CPDF-15, `MEASUREMENTS.md` 2026-09-10, on the deployed runtime), not defaults; a
  runtime or engine change should re-measure rather than assume the same figure holds.
- The namespace set (R16) is carried as a copy of the record's own set because a fleet member cannot
  import the plane's source; a job that changes either set should change both in the same act
  (D-478 is where this was last found stale).
- `env.OCR_PSM`, when set, is passed to the engine as its page-segmentation mode. The response does
  not echo it back, so this is not independently testable at the interface beyond "the call is
  threaded through and does not crash the request".
- Discarding a region below `confidence_floor` is the CALLER's job (`applyConfidenceFloor` in
  `bio-plane/src/textchain.mjs`), never this module's: this module states the floor it was given and
  never applies it itself, so the discard rule exists in exactly one place.
- The caller (the plane) is the one that loops over a request's `deferred` pages, one invocation per
  page, within its own per-request budget (D-606); this module's contract is unaffected by how many
  times it is called in a row.
- `measured_by`'s exact string is worth pinning byte-for-byte in a test (as `ocr-worker.test.mjs`
  already does against `contract.mjs`'s own constant) rather than pattern-matched, so a rewritten
  measurement citation is caught as a change rather than passing a loose regex.
