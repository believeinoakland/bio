# ooxml — requirements

**Status** · DRAFT by BOB #37, 2026-09-25 (T6). Layer 1. Code today: `bio-plane/src/ooxml.mjs`. No row of the old plan and no entry of `build/plan/next.md` names this module (both checked, 2026-09-25); every requirement below is already met by the code as read. It names no place and holds no local fact, so no jurisdiction line applies.

## Public

### Purpose

One dependency-free CONTAINER reader shared by every OOXML and OpenDocument format (`.docx`, `.xlsx`, `.pptx`, `.odt`, `.ods`, `.odp`): the ZIP central-directory walk, verified member inflate, `[Content_Types].xml` / ODF `mimetype` flavour discrimination, the `_rels/*.rels` walk, `docProps/core.xml` metadata, a measured size guard, and container image enumeration. It holds no record, reads nothing beyond the bytes it is given, writes nothing, and asserts nothing about meaning.

### Provides

**Container walk**

- `hasZipMagic(bytes) → boolean` — **R1** True iff `bytes.length >= 4` and the first four bytes are the ZIP local-file signature `PK\x03\x04` (little-endian `0x04034b50`). The first of the two discrimination halves (I7): checked before anything about declared content type. Never throws.

- `normalizePartName(name) → string` — **R2** Strips every leading `/` from `name`. `null`/`undefined` normalize to `""`. Never throws.

- `readContainer(bytes) → {ok:true, entries, byName, count} | {ok:false, why}` — **R3** Walks the ZIP end-of-central-directory record and the central directory it points to, which is the sole authority on the archive's contents (never a local header alone). Refuses, by name, rather than reading a partial or inconsistent archive as whole:
  - `too_short_for_zip` — under 22 bytes.
  - `eocd_not_found` — no EOCD signature in the fixed 22-byte window plus up to a 65,535-byte comment tail.
  - `zip64_unsupported` — the EOCD's entry count, central-directory size or offset carries a ZIP64 sentinel (`0xffff` / `0xffffffff`).
  - `multi_disk_unsupported` — the EOCD's disk-entry count differs from its total-entry count.
  - `central_directory_truncated` — the declared central directory runs past the EOCD, a record's signature is missing or short, or a record's name/extra/comment runs past the directory's declared end.
  On success, `entries` is every central-directory record in file order as `{name, method, crc32, compressedSize, uncompressedSize, localHeaderOffset}` (`name` decoded UTF-8 when general-purpose bit 11 is set, else Latin-1); `byName` maps each `name` to its FIRST entry; `count` is `entries.length`. Never throws.

- `crc32(bytes) → integer` — **R4** The ZIP-polynomial (`0xEDB88320`) CRC-32 of `bytes`, as an unsigned 32-bit integer. Pure and deterministic. Never throws.

- `readPart(bytes, container, name) → Promise<{ok:true, bytes} | {ok:false, why, name}>` — **R5** Reads one member, looked up in `container.byName` (falling back to a linear scan by normalized name), decompresses it, and returns it only once its length AND its CRC-32 are verified against the central directory — a partial or corrupt inflate is never returned as whole. Named refusals: `part_absent` (no matching entry), `local_header_invalid` (offset out of range, or the bytes there are not `PK\x03\x04`), `member_truncated` (the declared compressed size runs past the buffer), `unsupported_compression_method` (neither stored (0) nor deflate (8); carries `method`), `inflate_failed` (deflate decompression did not complete), `size_mismatch` (carries `expected`/`got`), `crc_mismatch`. Every refusal carries the normalized `name`. Async; never throws.

**The size guard (COFF-6, measured on a real Oakland corpus, `MEASUREMENTS.md` 2026-08-03)**

- `MEASURED_OOXML_TEXT_BOUND_BYTES` — **R6** The constant `20 * 1024 * 1024` (20,971,520): `sizeGuard`'s default bound, on DECLARED UNCOMPRESSED text-part bytes, never on container size (container size is a bad proxy in both directions).

- `declaredTextBytes(container, isTextPart) → {total, parts}` — **R7** Sums the DECLARED (central-directory) uncompressed size of every entry whose normalized name satisfies the caller's `isTextPart(name)` predicate, BEFORE any inflation. `total` is the sum; `parts` lists each matched `{name, declared}`. Never throws; no match gives `{total:0, parts:[]}`.

- `sizeGuard(declaredBytes, bound = MEASURED_OOXML_TEXT_BOUND_BYTES) → {ok:true} | {ok:false, text:"undetermined", why:"over_size_bound", size, bound, boundName:"MEASURED_OOXML_TEXT_BOUND_BYTES", metric:"declared_uncompressed_text_part_bytes"}` — **R8** `ok:true` iff `declaredBytes <= bound`. `boundName` is always the literal string `"MEASURED_OOXML_TEXT_BOUND_BYTES"`, even when the caller passes a different `bound`. Never throws.

**Flavour discrimination — magic bytes, then the container's own parts; never a declared content type or a filename extension (I7)**

- `CONTENT_TYPES_PART` — **R9** The constant `"[Content_Types].xml"`, the OPC content-type part's name.

- `CONTAINER_FLAVOURS` — **R10** The default table `discriminate` uses when a caller names none: the three OPC rows (`{partMap:"opc", flavour, mainContentType, conventionalMainPart}` for `docx`/`xlsx`/`pptx`) followed by the three ODF rows (`{partMap:"odf", flavour, mimetype, conventionalMainPart:"content.xml"}` for `odt`/`ods`/`odp`). A row carrying no `partMap` is read as `"opc"`.

- `discriminate(bytes, contentType = null, flavours = CONTAINER_FLAVOURS) → Promise<result>` — **R11** Which office flavour, if any, `bytes` is. Requires BOTH a matching declaration and the part it names actually present in the container; `contentType`, if given, is recorded in `signals` but never used in the determination. Every outcome carries `signals` (an array of strings recording what was checked):
  - Not a ZIP: `{ok:false, why:"not_a_zip"}`.
  - A ZIP whose central directory `readContainer` cannot read: `{ok:false, why:<readContainer's why>}`.
  - A readable ZIP carrying neither an OPC content-type map nor ODF evidence: `{ok:true, format:"zip"}` — a positive determination, never reported as "undetermined".
  - Undetermined (`{ok:true, format:"undetermined", why, …}`), `why` one of: `content_types_unreadable:<readPart's why>` (the part exists but cannot be read); `content_types_unparseable` (no `<Types>` root); `opc_main_part_unrecognized` (a readable content-type map naming none of the table's flavours); `declared_main_part_absent` (a flavour's main content type is declared, but its named part is absent from the container — carries `flavourDeclared`); `odf_mimetype_not_first` (a `mimetype` member exists but is not the archive's first member, checked both by central-directory index and by local-header offset); `odf_mimetype_not_stored` (present, first, but compressed); `odf_mimetype_oversized` (its declared size exceeds `ODF_MIMETYPE_MAX_BYTES`); `odf_mimetype_unreadable:<readPart's why>`; `odf_mimetype_unrecognized` (its exact, untrimmed decoded value matches no ODF row's `mimetype`); `odf_manifest_absent` (the mimetype matched a row, but `META-INF/manifest.xml` is absent — carries `flavourDeclared`).
  - A flavour: `{ok:true, format:<flavour>, mainPart:<the declared or conventional part name>, confidence:"high"}`.
  - **R12** OPC is tried before ODF: a container carrying both `[Content_Types].xml` and a `mimetype` member is read as OPC, and the ODF branch never runs against it.
  - **R13** For OPC, the table is walked in the caller's order, and the first row whose main content type is declared — by an `Override` naming that type, else by a `Default` extension on the row's conventional main part — wins.
  - Never throws.

- `ODF_MIMETYPE_PART`, `ODF_MANIFEST_PART`, `ODF_MIMETYPE_MAX_BYTES` — **R14** The constants `discriminate`'s ODF branch is defined against: `"mimetype"`, `"META-INF/manifest.xml"`, and `128` (bytes; MEASURED 2026-09-14 — 2.7x the longest of the three conforming producer values).

**The `_rels/*.rels` walk**

- `relsPartFor(partName = null) → string` — **R15** The conventional relationships part for a part name: `"_rels/.rels"` for the package root (`null` or `""`); otherwise `<dir>_rels/<base>.rels`, split on the name's last `/`.

- `parseRels(xml) → {ok:true, relationships, outbound} | {ok:false, why:"rels_unparseable"}` — **R16** `ok:false` when `xml` is not a string or has no `<Relationships>` root (any namespace prefix). Else every `<Relationship>` element carrying a `Target` attribute becomes `{id, type, target, targetMode, external}` (`id`/`type`/`targetMode` are `null` when absent; `external` is `targetMode === "External"`). `outbound` is `relationships` filtered to `external`.

- `walkRels(bytes, container) → Promise<{ok:true, byPart, outbound, undetermined}>` — **R17** Reads and parses every `_rels/*.rels` part at any depth (the package root's own `_rels/.rels` included) in central-directory order. A part that cannot be read or parsed is recorded in `undetermined` as `{part, why}` and skipped — never dropped silently, and never failing the whole walk (the result is always `ok:true`). `byPart` lists every readable part as `{part, relationships, outbound}`; `outbound` aggregates every external relationship across all parts, each as `{part, ...rel}`.

**`docProps/core.xml` — evidentiary metadata (DEC-5, 2026-08-01: a public document's own revision history is evidence, never redacted)**

- `CORE_PROPERTIES_PART` — **R18** The constant `"docProps/core.xml"`.

- `readCoreProperties(bytes, container) → Promise<result>` — **R19** Reads and parses `docProps/core.xml`. `{ok:false, why:"part_absent"}` when the part is missing (it is optional in OPC) — distinct from a part present but unreadable, which carries `readPart`'s own `why`. On a parsed part: `{ok:true, creator, lastModifiedBy, revision, revisionNumber, created, modified, title}`, each of `creator`/`lastModifiedBy`/`revision`/`created`/`modified`/`title` the element's own text, entity-decoded, or `null` when the element is absent or self-closing — absence is never invented into a value. `revisionNumber` is the integer value of `revision` when `revision`, trimmed, is all digits, else `null`. `{ok:false, why:"core_properties_unparseable"}` when the part exists but carries no `<coreProperties>` root.

**Container images (FW-19 / IC-124, `EXTRACTION-BREADTH-DESIGN.md` §3.2–§3.4): an image cited as itself is bytes, content-addressed by the media part, never by its filename**

- `withContainerImages(outOrPromise, parts, dir) → Promise<result>` — **R20** Awaits `outOrPromise`. Returns it unchanged when it is falsy, `!ok`, or `parts` is falsy, `!ok`, or has no `container` — no container was read, so there is no media directory to enumerate. Otherwise enumerates every image member under `dir` (normalized) in `parts.container` — a member whose normalized name starts with `dir`, is not `dir` itself, does not end in `/`, and whose extension is one of `png jpg jpeg jpe gif bmp tif tiff svg webp emf wmf emz wmz` (mapped to its MIME type by the frozen table `IMAGE_MIME_BY_EXT`, exported for callers; any other extension is not enumerated) — sums their DECLARED uncompressed bytes (the same metric and bound as the text guard) and:
  - over the bound, or any matched member unreadable: returns the input spread with `images:null` and `imagesWhy` naming which — `"media_over_size_bound:<declared>><bound>"` or `"media_part_unreadable:<name>:<why>"` — the whole list is `null`, never a partial one.
  - else: the input spread with `images:[{kind:"image", ref, part, mime, name}, …]`, one entry per matched member in central-directory order. `part` is the SHA-256 (lowercase hex) of the member's verified bytes. **R21** `ref` is EXACTLY `` `image ${part.slice(0,12)}` `` — matched byte-for-byte by `describeExtent`'s `'image'` case in `bio-plane/checks/bio-checks.mjs` (REC-85 / IC-1's parity rule); the two must never drift. `mime` is from the extension table; `name` is the member's own filename (its last `/`-separated segment).
  - A directory that exists and holds no matching member is a real `images:[]`, never `null`.
  - Never throws.

## Private

### Uses

None. Layer 1, first module of the office-format stack; `modules.json` lists no earlier module.

### Invariants

- **R22** Pure: no store, no network access, no clock read. Every service's result is determined only by its arguments; identical inputs always give an identical result.
- **R23** Zero runtime dependency: inflate is `DecompressionStream("deflate-raw")` and hashing is `crypto.subtle.digest`, both host-platform primitives — MEASURED to round-trip in workerd (`MEASUREMENTS.md`, 2026-08-03).
- **R24** The central directory is the sole authority for a member's size, CRC and compression method; a local header's claims are read only to locate the member's bytes and are never trusted for its size or checksum.
- **R25** Never invents structure. A function that cannot honestly read what it is given returns a named `why` — never a guess, never a silently truncated or partial result presented as whole — and never throws on malformed or adversarial bytes.
- **R26** No jurisdiction: this module names no place, system or local vocabulary; every input is bytes plus a caller-supplied table (e.g. `flavours`), so its tests need no jurisdiction profile.

### Satisfies

- `docs/architecture/BIO_Content_Framework_v0_10.md` §16, "How content is extracted today" — the office-formats paragraph (one dependency-free shared container reader, the evidentiary envelope, DEC-5) and the OpenDocument / Google-Drive-export paragraph.
- `docs/development/OFFICE-FORMATS.md`, the format axis as ruled — the container tier: I7 (magic bytes first, the container's own parts, never a declared content type or a filename extension), the measured size bound (COFF-6), and the ODF flavour row (COFF-9).
- `docs/development/EXTRACTION-BREADTH-DESIGN.md` §3.2–§3.4, the `image` reference: a container's own bytes, content-addressed, never a filename.
- Bob's ruling DEC-5, 2026-08-01: a public document's revision history is evidence and is never redacted.

### Suggestions

- `CONTAINER_FLAVOURS` is the one flavour table; a caller needing only the ODF rows filters it (`partMap === "odf"`) rather than keeping a second copy of the row shapes.
- `discriminate`'s `flavours` parameter accepts a caller-supplied table whose rows carry no `partMap` (read as `"opc"`) for a pre-COFF-9 caller narrowing to one part-map (a `.vsdx` probe, for instance).
- `OOXML_FLAVOURS`, `ODF_FLAVOURS`, `parseContentTypes`, `partContentType`, `listRelsParts`, `parseCoreProperties`, `imageRef` and `containerImages` are exported today but no other module's source imports them (only this module's own suite, and one pre-migration test file — see the reply on this draft); they are not requirements here. If a later job finds a real caller, tell BOB, who adds it above.
