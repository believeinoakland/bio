# format-registry — requirements

**Status** · DRAFT by BOB #37, 2026-09-25 (T6). Layer 1. Code today: `bio-plane/src/formats.mjs`. No
row of the old plan and no entry of `build/plan/next.md` targets this module; it holds no local fact
(no place name, no jurisdiction-specific vocabulary) so "No jurisdiction in the product" (`layers.md`)
needs no change here. All requirements below are met by the code as it stands today.

## Public

### Purpose

The one place a document format is known. It holds a registry of format entries — one per format,
keyed by name — and answers, from bytes and/or a declared content type, which format a document is
(magic bytes always outrank a declared type), and which entry to dispatch to for that format's
container walk, structure and text extraction. It reads no record, writes nothing, and makes no
network call itself; a registered entry's own functions may do work when a caller invokes them, on
that entry's own account.

### Provides

**registerFormat(entry) → entry**
- **R1** `entry.format` must be a non-empty string; otherwise throws `Error("a format entry must name its format")`. This also fires when `entry` itself is null, undefined, or not an object.
- **R2** `entry.detect` must be a function; otherwise throws `Error('format "<format>": detect(bytes, contentType) is required')`.
- **R3** Each of `entry.parts`, `entry.structure`, `entry.text` is optional: absent, `null` or `undefined` is accepted; present and not a function throws `Error('format "<format>": <slot> must be a function or null')`.
- **R4** A second registration under a format already held throws `Error('format "<format>" is already registered; unregister it first')`; the existing entry is left in place.
- **R5** Otherwise the entry is stored under `entry.format` and returned unchanged (not cloned, no default filled in for an absent slot), and is reachable from `getFormat`/`detectFormat` from that point on.

**unregisterFormat(format) → entry | null**
- **R6** Removes the entry stored under `format` and returns it; returns `null`, and changes nothing, when no entry is stored under `format`. Never throws.

**getFormat(format) → entry | null**
- **R7** Returns the entry stored under `format`, exactly as `registerFormat` received it, or `null` when none is stored. Never throws.

**listFormats() → string[]**
- **R8** Returns every currently-registered format key, in the order the entries were registered (a format re-registered after being unregistered moves to the end of this order). Never throws.

**detectFormat(bytes, contentType) → { format, confidence, signals, ... }**
- **R9** `bytes` counts as provided only when it is a `Uint8Array` with `length > 0`; anything else (absent, `null`, empty, or not a `Uint8Array`) counts as not provided. `contentType` counts as provided only when it is a non-empty string; anything else counts as not provided.
- **R10** Pass 1 (bytes only): when bytes are provided, calls `entry.detect(bytes, null)` on every registered entry in registration order, and returns the first result that is truthy and carries a `.format` — verbatim, with whatever other keys that entry attached.
- **R11** Pass 2 (content type only): runs only when pass 1 produced no hit (bytes not provided, or every entry answered nothing on bytes) and `contentType` is provided. Calls `entry.detect(null, contentType)` on every registered entry in registration order, and returns the first result that is truthy and carries a `.format`, verbatim.
- **R12** When neither pass produces a hit, returns `{ format: "undetermined", confidence: "none", signals: [bytesReason, contentTypeReason] }`, where `bytesReason` is `"no registered magic-byte signature matched"` when bytes were provided else `"no bytes were available to sniff"`, and `contentTypeReason` is `` `content type "<contentType>" matched no registered format` `` when a content type was provided else `"no content type was declared"`.
- **R13** A format is never guessed: the only two answers are a registered entry's own verbatim `detect()` result, or the stated `undetermined` of R12. `detectFormat` itself does not catch an error a registered entry's `detect` throws; it propagates to the caller.

**readingDialect(emitted) → { delimiter, encoding, confidence, signals, undetermined } | null**
- **R14** Returns `null` when `emitted` is not a non-array object (covers `null`, `undefined`, a primitive, or an array).
- **R15** Otherwise returns a projection built only from named keys of `emitted`, never `emitted` itself: `delimiter` is `emitted.delimiter` when it is a non-empty string, else `null`; `encoding` is `emitted.encoding` under the same rule. `confidence` is `{ delimiter, encoding }`, each `emitted.delimiterConfidence` / `emitted.encodingConfidence` when a non-empty string, else `null`. `signals` is `{ delimiter, encoding }`, each `emitted.delimiterSignals` / `emitted.encodingSignals` filtered to its string elements when an array, else `[]`. `undetermined` is `emitted.undetermined` filtered to its string elements when an array, else `[]`.
- **R16** Never throws. A key `readingDialect` does not name (anything else `emitted` carries) is dropped, so a later key an entry adds is not projected by accident.

**The built-in `html` entry**, registered under `"html"`:
- **R17** `detect(bytes, contentType)`: when `bytes` is truthy, decodes its first 1024 bytes as latin1, lower-cases them, and returns `{ format: "html", confidence: "certain", signals: [...] }` when the decoded head contains `"<!doctype html"` or `"<html"`; otherwise returns `null`. `contentType` is not consulted while `bytes` is truthy.
- **R18** When `bytes` is falsy: returns `{ format: "html", confidence: "likely", signals: [...] }` when `contentType` is exactly `"text/html"` or `"application/xhtml+xml"` (case-sensitive, exact match only); otherwise `null`.
- **R19** `parts`, `structure` and `text` are all `null`: HTML's structure is produced at acquire time by the subresource walk, outside this module's reach — this entry answers detection only.

**The built-in `pdf` entry**, registered under `"pdf"`:
- **R20** `detect(bytes, contentType)`: when `bytes` is truthy, decodes its first 1024 bytes as latin1 (no case change) and returns `{ format: "pdf", confidence: "certain", signals: [...] }` when it includes the literal `"%PDF-"`; otherwise `null`. `contentType` is not consulted while `bytes` is truthy.
- **R21** When `bytes` is falsy: returns `{ format: "pdf", confidence: "likely", signals: [...] }` when `contentType` is exactly `"application/pdf"`; otherwise `null`.
- **R22** `parts` and `text` are `null` (a PDF is its own container, and its Tier-1 text rides `structure()`'s own output object). `structure(bytes)` delegates to `pdf-reader`'s `extractPdfStructure(bytes)` and returns its result unchanged.

**The built-in roster**
- **R23** At module load, before any other caller registers or unregisters anything, the registry holds exactly nine entries, added in this order: `html`, `pdf` (both defined in this module — R17-R22), `docx`, `xlsx`, `pptx` (from `office-readers`), `odt`, `ods`, `odp` (from `odf-reader`), `csv` (from `office-readers`). `listFormats()` returns them in that order until a later `registerFormat`/`unregisterFormat` call changes it.

## Private

### Uses

- `office-readers`: `docxEntry` (`docx.mjs`), `xlsxEntry` (`formats-xlsx.mjs`), `pptxEntry` (`pptx.mjs`), `csvEntry` (`csv.mjs`) — four ready-made format-entry objects (`format`, `detect`, and each's own `parts`/`structure`/`text`, `csvEntry` also `dialect`), registered here unmodified. Their own detection, container-walk, structure and text behaviour is that module's requirement, not this one's.
- `odf-reader`: `odtEntry`, `odsEntry`, `odpEntry` (`odf.mjs`) — three more ready-made entry objects, registered here unmodified, same division of responsibility.
- `pdf-reader`: `extractPdfStructure(bytes)` (`pdfstructure.mjs`) — the function the built-in `pdf` entry's `structure` slot delegates to (R22); its own behaviour is `pdf-reader`'s requirement.

### Invariants

- **R24** One entry per format key: `REGISTRY` never holds two entries for the same key at once (R4); it is a plain in-memory `Map`, so registration order is preserved and is what `listFormats()` (R8) and each `detectFormat` pass (R10, R11) iterate in.
- **R25** The only state this module holds is that `Map`. `registerFormat` and `unregisterFormat` are its only mutators; nothing here reads a store, calls the network, or reads the clock, so `detectFormat`'s answer for one registry state and one pair of inputs never changes between calls. (An entry's own `parts`/`structure`/`text`/`dialect` may do work when a caller invokes it directly — that is on the entry's own module, not this one.)
- **R26** Bytes always outrank a declared content type, structurally: `detectFormat` never starts pass 2 (contentType) before every entry has had its chance in pass 1 (bytes), regardless of how any individual entry is written (R10, R11).
- **R27** An unmatched input is always a stated `undetermined` carrying why in `signals` (R12); `getFormat` and `unregisterFormat` answer `null` for an unknown key rather than throwing (R6, R7). Nothing in this module reports absence as a guess.

### Satisfies

- `BIO_Content_Framework_v0_10.md` §4, "One extension shape: the RECOGNISER" and "The axes we know about" — the FORMAT axis, and the claim that a new axis of variation costs a registry entry, not a rewrite.
- `docs/development/OFFICE-FORMATS.md`, "the format axis as ruled" — this module is what that document calls I7, the registry entry shape, and the place the nine built-in entries are registered.

### Suggestions

- The module's own header comment frames two dispatch-site doctrines that bind CALLERS, not this module's interface: no format-specific branching outside this registry at either the acquire-time detection site or the read-time structure site, and an entry asserts nothing about meaning and writes nothing. Both are properties of how `index.mjs`/`capture`/`extraction` use `detectFormat`/`getFormat`, and of how `office-readers`/`odf-reader`/`pdf-reader` write their entries — testable in those modules, not by calling this one in isolation.
- `formats.test.mjs`'s existing pattern (register a test-only stub entry through `registerFormat`, drive it through `detectFormat`→`getFormat(...).structure`, then `unregisterFormat` it) is the cheapest way to test R1-R13 and R23 without needing a real office/ODF/PDF fixture.
