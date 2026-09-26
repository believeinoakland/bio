/* The OOXML container reader (QUEUE COFF-2) — one container problem, three
 * part-maps.
 *
 * `.docx`, `.xlsx` and `.pptx` are OOXML: a ZIP archive of XML parts. This
 * module is the CONTAINER tier that all three formats (and ODF, which is the
 * same shape with different part names) share:
 *
 *   - the ZIP central-directory walk (never trusts local headers alone);
 *   - member inflate via DecompressionStream("deflate-raw") — MEASURED to
 *     round-trip in workerd (MEASUREMENTS.md 2026-08-03 backfill), so the
 *     whole module carries ZERO dependency, the same finding class that made
 *     PDF phase 1 dependency-free;
 *   - part lookup by name;
 *   - [Content_Types].xml parsing and FLAVOUR DISCRIMINATION — what separates
 *     a `.docx` from an arbitrary ZIP a public body might also publish.
 *     Magic bytes FIRST, then the container's own parts; a declared
 *     Content-Type or a filename extension NEVER decides (I7). TWO part-maps
 *     now live under that one rule: OPC's `[Content_Types].xml` (docx/xlsx/
 *     pptx) and OpenDocument's first-and-stored `mimetype` (odt/ods/odp);
 *   - the uniform `_rels/*.rels` walker (`TargetMode="External"` → outbound),
 *     shared by all three formats;
 *   - `docProps/core.xml` metadata extraction (creator, lastModifiedBy,
 *     revision count, created/modified instants) — evidentiary per DEC-5:
 *     provenance-adjacent facts the publisher's own software recorded;
 *   - size-guard plumbing: over the bound → a STATED text-undetermined with
 *     the reason, NEVER silent truncation.
 *
 * Doctrine, enforced structurally throughout: NEVER INVENT STRUCTURE. Every
 * function returns `{ ok:false, why:"<named reason>" }` for anything it cannot
 * read — a truncated central directory, an unsupported compression method, a
 * CRC mismatch, an unparseable XML part — and never throws on malformed input,
 * never silently returns a partial presented as whole.
 *
 * ODF IS NOW BUILT AT THIS TIER (COFF-9, 2026-09-14), and the sentence that
 * stood here for six weeks — "ODF is DESIGNED FOR, not built" — is CORRECTED
 * rather than deleted, because the claim it made was the design bet and the
 * bet paid: the flavour table really was a PARAMETER
 * (`discriminate(bytes, contentType, flavours)`), so the ODF part-map arrived
 * as `ODF_FLAVOURS` beside `OOXML_FLAVOURS` and a branch where the function
 * had ALREADY decided there is no `[Content_Types].xml` — not a rewrite.
 *
 * COFF-9 built the FLAVOUR only, and this paragraph used to end "there is
 * still no ODF registry entry, no `registerFormat` call and no I2 emission
 * (COFF-10's)". COFF-10 LANDED ON 2026-09-14 and that sentence is corrected
 * rather than deleted, the way COFF-9 corrected the one before it: the three
 * entries are in `odf.mjs`, registered by three `registerFormat` calls in
 * `formats.mjs`, each projecting ONE `content.xml` into the I2 shape and DEC-5
 * envelope of its OOXML sibling. I7 is CONFIRMED by them, not changed — no new
 * IC-1 union member was needed. NOTHING IN THIS FILE MOVED FOR THAT: the
 * entries dispatch on `partMap:"odf"` and read every media type and main-part
 * name out of `ODF_FLAVOURS` rather than spelling them again, which is the
 * whole point of the table being a parameter. This module ASSERTS nothing
 * about meaning (that stays FRAMEWORK's, through I2) and WRITES nothing.
 *
 * Registry entries (COFF-3/4/5) build their I7 `detect`/`parts`/`structure`/
 * `text` on top of these primitives; this module is below the registry and
 * imports nothing from it.
 */

const UTF8 = new TextDecoder("utf-8", { fatal: false });
const LATIN1 = new TextDecoder("latin1");

/* Every service takes bytes as a Uint8Array, an ArrayBuffer, any typed-array
 * view or an array of byte values. Anything else reads as no bytes at all, so
 * a caller's wrong argument is a named refusal downstream, never a throw. */
function toBytes(x) {
  if (x instanceof Uint8Array) return x;
  if (ArrayBuffer.isView(x)) return new Uint8Array(x.buffer, x.byteOffset, x.byteLength);
  try { return new Uint8Array(x ?? 0); } catch { return new Uint8Array(0); }
}

/* A container as `readContainer` returns it, or an empty one when the caller
 * passes something else: an unusable container holds no member. */
function entriesOf(container) {
  return Array.isArray(container?.entries) ? container.entries : [];
}
function findEntry(container, want) {
  const byName = container?.byName;
  return (byName instanceof Map ? byName.get(want) : undefined)
    ?? entriesOf(container).find((e) => normalizePartName(e?.name) === want);
}

/* ------------------------------------------------------------------ *
 * The size guard
 * ------------------------------------------------------------------ */

/* MEASURED — COFF-6 (MEASUREMENTS.md, 2026-08-03, the real Oakland office
 * corpus) replaced the provisional 32 MiB CONTAINER bound, and the METRIC
 * changed with the number: container size is a bad proxy in BOTH directions
 * (an 84.8 MB all-images deck carries 630 KB of text XML; a 9.1 MB workbook
 * inflates to 63.6 MB of sheet XML). What extraction actually costs is the
 * TEXT-BEARING PARTS' uncompressed size, and the ZIP central directory
 * DECLARES it before any inflation — so the guard reads the declared
 * uncompressed sizes of the text parts, summed by `declaredTextBytes` below,
 * costs one directory walk, and cannot be gamed by a compression bomb (a
 * LYING declared size surfaces later as readPart's `size_mismatch`, which
 * aborts into the same stated refusal, never a silent partial).
 *
 * 20 MiB passes 86 of the 88 measured Oakland documents with 28 % headroom
 * over the worst docx; the two excluded police stop-data workbooks are the
 * NAMED test cases for STREAMING-TO-64-MiB, which is DEFERRED (COFF-6's
 * landed line) and deliberately not built here.
 *
 * A document over this bound gets full central-directory and metadata
 * treatment but full text extraction is refused as a STATED
 * `text-undetermined`, never silently truncated. */
export const MEASURED_OOXML_TEXT_BOUND_BYTES = 20 * 1024 * 1024; // 20,971,520

/** Sum the DECLARED UNCOMPRESSED sizes of the container's text-bearing parts
 *  (which parts are text-bearing is the format entry's knowledge, passed as a
 *  predicate over normalized part names) straight from the central directory —
 *  BEFORE any inflation, per the COFF-6 metric. Returns `{ total, parts }` so
 *  an over-bound refusal can name what it measured. */
export function declaredTextBytes(container, isTextPart) {
  let total = 0;
  const parts = [];
  if (typeof isTextPart !== "function") return { total, parts };
  for (const e of entriesOf(container)) {
    const name = normalizePartName(e.name);
    if (!isTextPart(name)) continue;
    total += e.uncompressedSize;
    parts.push({ name, declared: e.uncompressedSize });
  }
  return { total, parts };
}

/** The size-guard plumbing every format entry calls before full extraction.
 *  `declaredBytes` is the SUMMED DECLARED UNCOMPRESSED size of the document's
 *  text-bearing parts (from `declaredTextBytes`) — NOT the container size,
 *  which COFF-6 measured to be a bad proxy in both directions. Returns
 *  `{ ok:true }` under the bound; over it, a stated undetermined marker
 *  carrying WHY, the sizes, the metric and the bound's name — shaped so a
 *  format entry can carry it into its I2 text output verbatim. */
export function sizeGuard(declaredBytes, bound = MEASURED_OOXML_TEXT_BOUND_BYTES) {
  /* `<=`, not `!(>)`: a size that is not a number is never shown to be under
   * the bound, so it is refused rather than waved through. */
  let under = false;
  try { under = declaredBytes <= bound; } catch { /* not comparable: not under */ }
  if (under) return { ok: true };
  return {
    ok: false,
    text: "undetermined",
    why: "over_size_bound",
    size: declaredBytes,
    bound,
    boundName: "MEASURED_OOXML_TEXT_BOUND_BYTES",
    metric: "declared_uncompressed_text_part_bytes", // summed from the central directory, before inflation
  };
}

/* ------------------------------------------------------------------ *
 * CRC-32 (ZIP polynomial) — for verifying a member actually round-trips
 * ------------------------------------------------------------------ */

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

export function crc32(bytes) {
  const u8 = toBytes(bytes);
  let c = 0xffffffff;
  for (let i = 0; i < u8.length; i++) c = CRC_TABLE[(c ^ u8[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/* ------------------------------------------------------------------ *
 * The central-directory walk
 * ------------------------------------------------------------------ */

const u16 = (b, p) => b[p] | (b[p + 1] << 8);
const u32 = (b, p) => (b[p] | (b[p + 1] << 8) | (b[p + 2] << 16) | (b[p + 3] << 24)) >>> 0;

const SIG_LOCAL = 0x04034b50; // PK\x03\x04
const SIG_CENTRAL = 0x02014b50; // PK\x01\x02
const SIG_EOCD = 0x06054b50; // PK\x05\x06

/** True iff the bytes open with the ZIP local-file magic `PK\x03\x04` — the
 *  FIRST discriminator (I7: magic bytes first, content type second). An empty
 *  ZIP (bare EOCD) does not carry it and cannot be an OOXML package anyway,
 *  since OOXML requires parts. */
export function hasZipMagic(bytes) {
  const b = toBytes(bytes);
  return b.length >= 4 && u32(b, 0) === SIG_LOCAL;
}

/* OPC part names in [Content_Types].xml overrides start with "/", ZIP entry
 * names do not. One normal form so the two always meet. */
export function normalizePartName(name) {
  try { return String(name ?? "").replace(/^\/+/, ""); } catch { return ""; }
}

/** Walk the END OF CENTRAL DIRECTORY record and the central directory itself.
 *  The central directory is the authority on what the archive contains — a
 *  local header may lie (data-descriptor zeros), so sizes/CRC come from here.
 *
 *  Returns `{ ok:true, entries, byName, count }` where each entry is
 *  `{ name, method, crc32, compressedSize, uncompressedSize, localHeaderOffset }`,
 *  or `{ ok:false, why }` with a NAMED reason. A central directory that is cut
 *  short, inconsistent with the EOCD counts, or off the end of the buffer is
 *  `central_directory_truncated` — a stated undetermined, never the readable
 *  prefix silently presented as the whole archive. */
export function readContainer(bytes) {
  const b = toBytes(bytes);
  if (b.length < 22) return { ok: false, why: "too_short_for_zip" };

  /* EOCD: fixed 22 bytes + a comment of up to 0xFFFF; scan back for the
   * signature over exactly that window and no further. */
  const scanFloor = Math.max(0, b.length - 22 - 0xffff);
  let eocd = -1;
  for (let p = b.length - 22; p >= scanFloor; p--) {
    if (u32(b, p) === SIG_EOCD) { eocd = p; break; }
  }
  if (eocd < 0) return { ok: false, why: "eocd_not_found" };

  const diskEntries = u16(b, eocd + 8);
  const totalEntries = u16(b, eocd + 10);
  const cdSize = u32(b, eocd + 12);
  const cdOffset = u32(b, eocd + 16);

  /* ZIP64 sentinels: honestly out of scope rather than misread. A public
   * body's 4 GiB+ or 65k-part archive is stated, not guessed at. */
  if (totalEntries === 0xffff || cdSize === 0xffffffff || cdOffset === 0xffffffff) {
    return { ok: false, why: "zip64_unsupported" };
  }
  if (diskEntries !== totalEntries) return { ok: false, why: "multi_disk_unsupported" };
  if (cdOffset + cdSize > eocd) return { ok: false, why: "central_directory_truncated" };

  const entries = [];
  const byName = new Map();
  let p = cdOffset;
  const cdEnd = cdOffset + cdSize;
  for (let i = 0; i < totalEntries; i++) {
    if (p + 46 > cdEnd || u32(b, p) !== SIG_CENTRAL) {
      return { ok: false, why: "central_directory_truncated" };
    }
    const flags = u16(b, p + 8);
    const method = u16(b, p + 10);
    const crc = u32(b, p + 16);
    const compressedSize = u32(b, p + 20);
    const uncompressedSize = u32(b, p + 24);
    const nameLen = u16(b, p + 28);
    const extraLen = u16(b, p + 30);
    const commentLen = u16(b, p + 32);
    const localHeaderOffset = u32(b, p + 42);
    if (p + 46 + nameLen + extraLen + commentLen > cdEnd) {
      return { ok: false, why: "central_directory_truncated" };
    }
    const nameBytes = b.subarray(p + 46, p + 46 + nameLen);
    /* General-purpose bit 11 declares UTF-8 names; otherwise cp437, for which
     * latin1 is the honest dependency-free approximation (OOXML part names are
     * ASCII, where the two agree exactly). */
    const name = (flags & 0x0800) ? UTF8.decode(nameBytes) : LATIN1.decode(nameBytes);
    const entry = { name, method, crc32: crc, compressedSize, uncompressedSize, localHeaderOffset };
    entries.push(entry);
    if (!byName.has(name)) byName.set(name, entry);
    p += 46 + nameLen + extraLen + commentLen;
  }
  return { ok: true, entries, byName, count: entries.length };
}

/* ------------------------------------------------------------------ *
 * Member inflate — DecompressionStream("deflate-raw"), zero dependency
 * ------------------------------------------------------------------ */

/* Inflates at most `limit + 1` bytes. The central directory declares the
 * member's size, so output past it is already a `size_mismatch`: inflation
 * stops there rather than running a compression bomb to completion before
 * the length check refuses it. Returns `{ bytes }`, `{ over: n }` (stopped
 * after n bytes, n > limit) or null (the deflate stream did not complete). */
async function inflateRaw(u8, limit) {
  try {
    const reader = new Blob([u8]).stream()
      .pipeThrough(new DecompressionStream("deflate-raw")).getReader();
    const chunks = [];
    let total = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.length;
      if (total > limit) {
        reader.cancel().catch(() => {});
        return { over: total };
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(total);
    let at = 0;
    for (const c of chunks) { bytes.set(c, at); at += c.length; }
    return { bytes };
  } catch {
    return null;
  }
}

/** Read ONE member's bytes, verified. Sizes and CRC come from the central
 *  directory (the authority), the data offset from the local header it points
 *  at. Every failure is a NAMED reason:
 *    part_absent · local_header_invalid · member_truncated ·
 *    unsupported_compression_method · inflate_failed · size_mismatch ·
 *    crc_mismatch
 *  A success is `{ ok:true, bytes }` and the bytes are PROVEN to be the whole
 *  member (length AND CRC-32 against the central directory) — a partial
 *  inflate can never pass as whole. */
export async function readPart(bytes, container, name) {
  const b = toBytes(bytes);
  const want = normalizePartName(name);
  const entry = findEntry(container, want);
  if (!entry) return { ok: false, why: "part_absent", name: want };

  const lh = entry.localHeaderOffset;
  if (lh + 30 > b.length || u32(b, lh) !== SIG_LOCAL) {
    return { ok: false, why: "local_header_invalid", name: want };
  }
  const nameLen = u16(b, lh + 26);
  const extraLen = u16(b, lh + 28);
  const dataStart = lh + 30 + nameLen + extraLen;
  const dataEnd = dataStart + entry.compressedSize;
  if (dataEnd > b.length) return { ok: false, why: "member_truncated", name: want };

  const raw = b.subarray(dataStart, dataEnd);
  let out;
  if (entry.method === 0) {
    out = raw.slice();
  } else if (entry.method === 8) {
    const got = await inflateRaw(raw, entry.uncompressedSize);
    if (got === null) return { ok: false, why: "inflate_failed", name: want };
    if (got.over !== undefined) {
      return { ok: false, why: "size_mismatch", name: want, expected: entry.uncompressedSize, got: got.over };
    }
    out = got.bytes;
  } else {
    return { ok: false, why: "unsupported_compression_method", method: entry.method, name: want };
  }
  if (out.length !== entry.uncompressedSize) {
    return { ok: false, why: "size_mismatch", name: want, expected: entry.uncompressedSize, got: out.length };
  }
  if (crc32(out) !== entry.crc32) {
    return { ok: false, why: "crc_mismatch", name: want };
  }
  return { ok: true, bytes: out };
}

/* ------------------------------------------------------------------ *
 * Minimal XML attribute/element extraction — enough for OPC's three tiny
 * grammars ([Content_Types].xml, .rels, core.xml), dependency-free, and
 * honest about failure: a document these patterns cannot read yields a
 * stated `unparseable`, never a guessed structure.
 * ------------------------------------------------------------------ */

function decodeXmlEntities(s) {
  return s.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (m, e) => {
    if (e[0] === "#") {
      const code = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" }[e] ?? m;
  });
}

/* Every element whose LOCAL name matches (any namespace prefix), with its
 * attributes decoded. Attribute lookup is by local name too. */
function xmlElements(xml, localName) {
  const out = [];
  const re = new RegExp(`<(?:[\\w.-]+:)?${localName}\\b([^>]*?)/?>`, "g");
  for (const m of xml.matchAll(re)) {
    const attrs = {};
    for (const a of m[1].matchAll(/([\w.-]+(?::[\w.-]+)?)\s*=\s*("([^"]*)"|'([^']*)')/g)) {
      const local = a[1].includes(":") ? a[1].split(":").pop() : a[1];
      attrs[local] = decodeXmlEntities(a[3] ?? a[4] ?? "");
    }
    out.push(attrs);
  }
  return out;
}

/* The text content of the FIRST element with this local name, entity-decoded;
 * null when the element is absent or empty-by-self-closing. Absence is
 * absence, never invented into a value. */
function xmlElementText(xml, localName) {
  const re = new RegExp(
    `<((?:[\\w.-]+:)?${localName})\\b[^>]*?(/)?>(?:([\\s\\S]*?)</\\1>)?`,
  );
  const m = xml.match(re);
  if (!m || m[2]) return null; // absent, or self-closing (no content)
  return m[3] == null ? null : decodeXmlEntities(m[3]);
}

/* ------------------------------------------------------------------ *
 * [Content_Types].xml — the OPC content-type map
 * ------------------------------------------------------------------ */

export const CONTENT_TYPES_PART = "[Content_Types].xml";

/** Parse [Content_Types].xml text into
 *  `{ ok:true, defaults: Map(lowercased extension → content type),
 *              overrides: Map(normalized part name → content type) }`
 *  or `{ ok:false, why:"content_types_unparseable" }`. */
export function parseContentTypes(xml) {
  if (typeof xml !== "string" || !/<(?:[\w.-]+:)?Types\b/.test(xml)) {
    return { ok: false, why: "content_types_unparseable" };
  }
  const defaults = new Map();
  const overrides = new Map();
  for (const d of xmlElements(xml, "Default")) {
    if (d.Extension && d.ContentType) defaults.set(d.Extension.toLowerCase(), d.ContentType);
  }
  for (const o of xmlElements(xml, "Override")) {
    if (o.PartName && o.ContentType) overrides.set(normalizePartName(o.PartName), o.ContentType);
  }
  return { ok: true, defaults, overrides };
}

/** The content type of a part under a parsed map: Override first, Default by
 *  extension second, null when neither speaks (null, not a guess). */
export function partContentType(name, types) {
  const norm = normalizePartName(name);
  const o = types.overrides.get(norm);
  if (o) return o;
  const dot = norm.lastIndexOf(".");
  if (dot < 0) return null;
  return types.defaults.get(norm.slice(dot + 1).toLowerCase()) ?? null;
}

/* ------------------------------------------------------------------ *
 * Flavour discrimination — docx / xlsx / pptx / odt / ods / odp vs an
 * arbitrary ZIP
 * ------------------------------------------------------------------ */

/* THE TABLE IS THE PART-MAP PARAMETER, and as of COFF-9 it carries TWO kinds
 * of row. `partMap` says WHICH DECLARATION a row is read out of, because the
 * two families declare themselves in different places inside the identical
 * ZIP container:
 *
 *   partMap:"opc"  (docx/xlsx/pptx) — `[Content_Types].xml` declares the main
 *                  part's content type; the row names that type and where the
 *                  main part conventionally lives.
 *   partMap:"odf"  (odt/ods/odp)    — a first-and-stored `mimetype` member
 *                  carries the media type verbatim; the row names that media
 *                  type and the main part (`content.xml` for all three).
 *
 * A row with NO `partMap` is read as "opc". That is deliberate back-compat: a
 * caller-supplied table written against the pre-COFF-9 shape (one is in this
 * module's suite, discriminating a `.vsdx`) keeps working unchanged.
 *
 * `OOXML_FLAVOURS` remains EXACTLY the three OOXML rows — the ODF rows are a
 * separate table, and `CONTAINER_FLAVOURS` is the union `discriminate`
 * defaults to. Keeping them separate is what lets a caller ask a narrower
 * question (and lets the suite prove the pre-item OOXML outcomes are
 * reproducible byte-for-byte by passing `OOXML_FLAVOURS` explicitly). */
export const OOXML_FLAVOURS = [
  {
    partMap: "opc",
    flavour: "docx",
    mainContentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml",
    conventionalMainPart: "word/document.xml",
  },
  {
    partMap: "opc",
    flavour: "xlsx",
    mainContentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml",
    conventionalMainPart: "xl/workbook.xml",
  },
  {
    partMap: "opc",
    flavour: "pptx",
    mainContentType: "application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml",
    conventionalMainPart: "ppt/presentation.xml",
  },
];

/* ------------------------------------------------------------------ *
 * The OpenDocument part-map (COFF-9) — same container, other declaration
 * ------------------------------------------------------------------ */

/* WHY ODF IS BUILT HERE AT ALL, since COFF-6 measured ZERO native ODF assets
 * in a 43,282-key population and ruled DO NOT BUILD (MEASUREMENTS.md,
 * 2026-08-03). That measurement is UNREVISED and still true: native ODF is
 * absent from the wild we sampled. What changed is the SOURCE. Bob ruled on
 * 2026-09-14 that a Google Drive link KEEPS THE LINK and extracts from the
 * OpenDocument EXPORT, which makes ODF the HARVEST format rather than a
 * published one. The rows are warranted by the ruling, not by the census.
 *
 * ODF AS ACTUALLY BUILT (OpenDocument 1.2 part 3 §3.3, and MEASURED against a
 * real producer on 2026-09-14 — see MEASUREMENTS.md): the same ZIP container,
 * but
 *
 *   - the FIRST member of the archive is `mimetype`, STORED (method 0) with
 *     no extra field, whose bytes are EXACTLY the media type and nothing
 *     else. That placement is not decoration — it puts the media type at a
 *     fixed offset near the head of the file, which is the entire reason an
 *     ODF package is sniffable without a directory walk;
 *   - `META-INF/manifest.xml` lists the parts (ODF's answer to
 *     `[Content_Types].xml`);
 *   - `content.xml` is the main part, for all three flavours.
 *
 * THE MIMETYPE VALUE IS THE DISCRIMINATOR — NOT THE FILE LIST. A ZIP carrying
 * `META-INF/manifest.xml` and `content.xml` under any other media type is not
 * an odt/ods/odp and is said to be `undetermined`, never rounded into a
 * flavour because its part names look familiar. */
export const ODF_MIMETYPE_PART = "mimetype";
export const ODF_MANIFEST_PART = "META-INF/manifest.xml";

/* MEASURED 2026-09-14: the three conforming values are 39, 46 and 47 bytes
 * (LibreOffice 26.8.0.3 output, MEASUREMENTS.md). This bound — 2.7x the
 * longest — exists so a container declaring a 500 MB member named `mimetype`
 * cannot make us inflate and decode it to settle a 47-byte question. Over it
 * is a STATED undetermined naming the declared size, never a truncated value
 * silently compared. */
export const ODF_MIMETYPE_MAX_BYTES = 128;

export const ODF_FLAVOURS = [
  {
    partMap: "odf",
    flavour: "odt",
    mimetype: "application/vnd.oasis.opendocument.text",
    conventionalMainPart: "content.xml",
  },
  {
    partMap: "odf",
    flavour: "ods",
    mimetype: "application/vnd.oasis.opendocument.spreadsheet",
    conventionalMainPart: "content.xml",
  },
  {
    partMap: "odf",
    flavour: "odp",
    mimetype: "application/vnd.oasis.opendocument.presentation",
    conventionalMainPart: "content.xml",
  },
];

/** The table `discriminate()` uses when a caller names none: both part-maps,
 *  OPC first. Order matters only in that a container carrying BOTH
 *  `[Content_Types].xml` and a `mimetype` member is read as OPC — see the
 *  precedence note in `discriminate`. */
export const CONTAINER_FLAVOURS = [...OOXML_FLAVOURS, ...ODF_FLAVOURS];

/** Which office flavour, if any, this container is — MAGIC BYTES PLUS PARTS,
 *  never the caller-declared content type and never a filename extension
 *  (neither is even an input to the determination; `contentType` is carried
 *  into `signals` purely as corroborating-or-contradicted context, I7).
 *
 *  Returns:
 *    { ok:true,  format:"docx"|"xlsx"|"pptx"|"odt"|"ods"|"odp",
 *                mainPart, confidence:"high", signals }
 *    { ok:true,  format:"zip",  signals }            — a real ZIP, NOT office
 *    { ok:true,  format:"undetermined", why, signals } — a ZIP whose flavour
 *        cannot be honestly discriminated (unreadable/absent-but-declared
 *        parts, an OPC package of an unrecognised type, an ODF-shaped package
 *        whose mimetype we do not know or whose placement is non-conforming).
 *        STATED, never guessed.
 *    { ok:false, why, signals }                      — not a readable ZIP at
 *        all (no magic, truncated central directory, zip64, …).
 *
 *  The discrimination requires BOTH halves, and that rule is the same on both
 *  part-maps: the DECLARATION (OPC's `[Content_Types].xml` entry for a
 *  flavour's main content type, or ODF's `mimetype` member) AND the declared
 *  part actually present in the central directory. A declaration whose part is
 *  missing is `undetermined: declared_main_part_absent` — bytes contradicting
 *  a claim are surfaced, not smoothed over.
 *
 *  A ZIP carrying NEITHER part map is `format:"zip"` — a POSITIVE
 *  determination, unchanged by COFF-9. (The COFF-9 queue row asks for
 *  "undetermined on a ZIP with neither part map"; what it is buying is "never
 *  a flavour", and `zip` already delivers that while saying MORE than
 *  undetermined does. Turning a determined answer into an undetermined one
 *  would make the record claim LESS than the bytes support and would move a
 *  pinned COFF-2 outcome, so the existing determination stands and the suite
 *  asserts both halves: still `zip`, and never an ODF flavour.) */
export async function discriminate(bytes, contentType = null, flavours = CONTAINER_FLAVOURS) {
  const b = toBytes(bytes);
  const signals = [];
  if (contentType) {
    let declared;
    try { declared = String(contentType); } catch { declared = "(not a string)"; }
    signals.push(`declared-content-type:${declared} (not used for the determination)`);
  }

  if (!hasZipMagic(b)) {
    signals.push("magic:absent (no PK\\x03\\x04)");
    return { ok: false, why: "not_a_zip", signals };
  }
  signals.push("magic:zip (PK\\x03\\x04)");

  const container = readContainer(b);
  if (!container.ok) {
    /* A ZIP whose central directory cannot be read has NO honest flavour:
     * stated undetermined with the container's own reason, never the readable
     * prefix promoted to a verdict. */
    signals.push(`container:${container.why}`);
    return { ok: false, why: container.why, signals };
  }
  signals.push(`container:zip entries=${container.count}`);

  /* The table is partitioned by part-map, never merged: the OPC loop below
   * sees only OPC rows and the ODF branch only ODF rows, so neither family
   * can borrow the other's evidence. A row with no `partMap` is OPC (the
   * pre-COFF-9 shape). */
  const opcRows = [];
  const odfRows = [];
  for (const f of Array.isArray(flavours) ? flavours : []) {
    if (f && typeof f === "object") ((f.partMap ?? "opc") === "odf" ? odfRows : opcRows).push(f);
  }

  const ctEntry = container.byName.get(CONTENT_TYPES_PART);
  if (!ctEntry) {
    /* No [Content_Types].xml → not an OPC package. Before that becomes a
     * plain-ZIP verdict, the OTHER part-map gets its turn: ODF declares
     * itself with a `mimetype` member, not with a content-type map.
     *
     * PRECEDENCE, pinned: OPC is tried FIRST and this branch is only reached
     * once `[Content_Types].xml` is known absent, so a container carrying
     * BOTH declarations is read as OPC. No conforming package carries both,
     * and doing it this way is what keeps every pre-COFF-9 OOXML outcome
     * byte-identical — `discriminateOdf` cannot run on, or push a signal
     * into, any container that has a content-type map.
     *
     * It returns null — pushing NOTHING — for a container with no `mimetype`
     * member at all, so a ZIP with neither part map reaches the plain-ZIP
     * determination below with exactly the result object it always had. */
    const odf = odfRows.length ? await discriminateOdf(b, container, odfRows, signals) : null;
    if (odf) return odf;
    signals.push(`part:${CONTENT_TYPES_PART} absent → plain ZIP`);
    return { ok: true, format: "zip", signals };
  }

  const ctBytes = await readPart(b, container, CONTENT_TYPES_PART);
  if (!ctBytes.ok) {
    signals.push(`part:${CONTENT_TYPES_PART} unreadable (${ctBytes.why})`);
    return { ok: true, format: "undetermined", why: `content_types_unreadable:${ctBytes.why}`, signals };
  }
  const types = parseContentTypes(UTF8.decode(ctBytes.bytes));
  if (!types.ok) {
    signals.push(`part:${CONTENT_TYPES_PART} present but unparseable`);
    return { ok: true, format: "undetermined", why: "content_types_unparseable", signals };
  }
  signals.push(`part:${CONTENT_TYPES_PART} parsed (${types.defaults.size} defaults, ${types.overrides.size} overrides)`);

  for (const f of opcRows) {
    /* The declaration half: any part whose computed content type is this
     * flavour's main type. Overrides carry it in practice; defaults are
     * checked too so a default-typed package is not missed. */
    let declared = null;
    for (const [part, ct] of types.overrides) {
      if (ct === f.mainContentType) { declared = part; break; }
    }
    if (!declared) {
      const conv = normalizePartName(f.conventionalMainPart);
      if (partContentType(conv, types) === f.mainContentType) declared = conv;
    }
    if (!declared) continue;

    /* The parts half: the declared main part must actually exist. */
    const present = container.byName.has(declared)
      || container.entries.some((e) => normalizePartName(e.name) === declared);
    if (!present) {
      signals.push(`ct:${f.mainContentType} declared for ${declared}, but the part is ABSENT`);
      return { ok: true, format: "undetermined", why: "declared_main_part_absent", flavourDeclared: f.flavour, signals };
    }
    signals.push(`ct:${f.mainContentType}`, `part:${declared} present`);
    return { ok: true, format: f.flavour, mainPart: declared, confidence: "high", signals };
  }

  /* An OPC package (it has a readable [Content_Types].xml) that is none of
   * the known flavours — e.g. .vsdx, or a future format. Undetermined and
   * SAID so, never rounded to "zip" (which would erase the OPC evidence) and
   * never guessed into a flavour. */
  signals.push("opc:no known main content type");
  return { ok: true, format: "undetermined", why: "opc_main_part_unrecognized", signals };
}

/** The ODF half of `discriminate` (COFF-9). Called ONLY where `discriminate`
 *  has already established there is no `[Content_Types].xml`.
 *
 *  Returns a `discriminate`-shaped result, or NULL when the container carries
 *  no ODF evidence whatsoever (no `mimetype` member) — in which case it has
 *  pushed no signal and the caller makes its own plain-ZIP determination,
 *  identical to the pre-COFF-9 one.
 *
 *  ---------------------------------------------------------------- PINNED
 *  THE DECISION THE COFF-9 ROW ASKS FOR, made here with its reason: a
 *  `mimetype` member that is PRESENT BUT NOT FIRST, or PRESENT BUT
 *  COMPRESSED, is REFUSED into a stated `undetermined`. It is never accepted
 *  as a flavour, and it is never silently ignored either — the container came
 *  in carrying ODF's own signature part, and saying nothing about that would
 *  be the silent outcome the row forbids.
 *
 *  WHY REFUSE rather than accept:
 *
 *   1. The rule is the FORMAT'S, not ours. OpenDocument 1.2 part 3 §3.3 says
 *      the `mimetype` stream SHALL be first and SHALL be stored uncompressed.
 *      A fence that matches the spec is not a fence tighter than its rule.
 *   2. FIRST-AND-STORED IS WHAT MAKES THE SIGNAL WORTH ANYTHING. It is the
 *      reason the media type sits at a fixed offset near the head of the file
 *      and the reason the format is sniffable at all. Drop the placement
 *      requirement and the determination rests on nothing but a filename
 *      occurring somewhere inside an archive — a weaker basis than the OPC
 *      side is held to, which demands a declaration AND the part it names.
 *   3. MEASURED, so the refusal is known to cost nothing observed: every one
 *      of the three real producer packages measured on 2026-09-14 has
 *      `mimetype` first, stored, at local-header offset 0, with a zero-length
 *      extra field (MEASUREMENTS.md). Google Drive's export — the source
 *      Bob's ruling actually points this at — is a conforming producer.
 *   4. It is the CHEAPLY REVERSIBLE direction. A refusal is stated, named and
 *      visible in `signals`; widening it later takes one measurement of a
 *      real non-conforming producer and a comment saying which one. Accepting
 *      first and discovering later that we flavoured something that was not
 *      an ODF document is the direction that puts an overclaim in the record.
 *
 *  WHAT THIS CHECK CANNOT SEE, stated rather than implied: it does not read
 *  the local header's EXTRA FIELD, which §3.3 also requires to be empty. The
 *  value is verified by length and CRC-32 through `readPart` either way, so
 *  an extra field cannot corrupt the comparison — it would only mean a
 *  package that is non-conforming in a way we accept. Named here so the next
 *  reader knows it is a deliberate gap and not an oversight.
 *  ------------------------------------------------------------------------
 */
async function discriminateOdf(bytes, container, rows, signals) {
  const mimeEntry = container.byName.get(ODF_MIMETYPE_PART)
    ?? container.entries.find((e) => normalizePartName(e.name) === ODF_MIMETYPE_PART);
  if (!mimeEntry) return null; // no ODF evidence at all — not this branch's business

  /* FIRST means first in the archive, checked two ways because the ZIP format
   * does not require the central directory's order to match the members'
   * physical order: the mimetype must head the central directory AND no other
   * member may lie earlier in the file. */
  let earliest = Infinity;
  for (const e of container.entries) if (e.localHeaderOffset < earliest) earliest = e.localHeaderOffset;
  if (container.entries[0] !== mimeEntry || mimeEntry.localHeaderOffset !== earliest) {
    signals.push(`odf:${ODF_MIMETYPE_PART} present but NOT the first archive member`
      + ` (central-directory index ${container.entries.indexOf(mimeEntry)},`
      + ` local-header offset ${mimeEntry.localHeaderOffset}, earliest ${earliest})`);
    return { ok: true, format: "undetermined", why: "odf_mimetype_not_first", signals };
  }
  if (mimeEntry.method !== 0) {
    signals.push(`odf:${ODF_MIMETYPE_PART} is first but COMPRESSED (method ${mimeEntry.method}, ODF requires stored)`);
    return { ok: true, format: "undetermined", why: "odf_mimetype_not_stored", signals };
  }
  if (mimeEntry.uncompressedSize > ODF_MIMETYPE_MAX_BYTES) {
    signals.push(`odf:${ODF_MIMETYPE_PART} declares ${mimeEntry.uncompressedSize} bytes,`
      + ` over ODF_MIMETYPE_MAX_BYTES=${ODF_MIMETYPE_MAX_BYTES}`);
    return { ok: true, format: "undetermined", why: "odf_mimetype_oversized", signals };
  }

  const read = await readPart(bytes, container, ODF_MIMETYPE_PART);
  if (!read.ok) {
    signals.push(`odf:${ODF_MIMETYPE_PART} unreadable (${read.why})`);
    return { ok: true, format: "undetermined", why: `odf_mimetype_unreadable:${read.why}`, signals };
  }

  /* EXACT comparison, never trimmed. §3.3 says the stream's content IS the
   * media type and nothing else, and the value is the whole discriminator —
   * so a trailing newline is a non-conforming producer to be NAMED, not a
   * difference to be absorbed. `undetermined` carries the value it actually
   * read, which is what makes such a producer diagnosable in one look. */
  const declared = UTF8.decode(read.bytes);
  const row = rows.find((f) => f.mimetype === declared);
  if (!row) {
    /* The part names may look exactly like an ODF package's — this is the
     * negative control the row names — and it still is not one. Undetermined
     * rather than "zip", for the same reason .vsdx is: a first-and-stored
     * `mimetype` IS positive evidence of a media-type-declaring container
     * (an EPUB is the obvious other one), and rounding it to "zip" would
     * erase that evidence. */
    signals.push(`odf:${ODF_MIMETYPE_PART}=${JSON.stringify(declared)} is no known OpenDocument media type`);
    return { ok: true, format: "undetermined", why: "odf_mimetype_unrecognized", signals };
  }
  signals.push(`odf:${ODF_MIMETYPE_PART} ${declared} (first member, stored)`);

  /* The parts half — the same both-halves rule the OPC branch applies. */
  const manifestPresent = container.byName.has(ODF_MANIFEST_PART)
    || container.entries.some((e) => normalizePartName(e.name) === ODF_MANIFEST_PART);
  if (!manifestPresent) {
    signals.push(`odf:${ODF_MANIFEST_PART} ABSENT`);
    return { ok: true, format: "undetermined", why: "odf_manifest_absent", flavourDeclared: row.flavour, signals };
  }
  const main = normalizePartName(row.conventionalMainPart);
  const mainPresent = container.byName.has(main)
    || container.entries.some((e) => normalizePartName(e.name) === main);
  if (!mainPresent) {
    signals.push(`odf:mimetype declares ${row.flavour}, but ${main} is ABSENT`);
    return { ok: true, format: "undetermined", why: "declared_main_part_absent", flavourDeclared: row.flavour, signals };
  }

  signals.push(`part:${ODF_MANIFEST_PART} present`, `part:${main} present`);
  return { ok: true, format: row.flavour, mainPart: main, confidence: "high", signals };
}

/* ------------------------------------------------------------------ *
 * The uniform _rels walker — one relationship grammar for all three
 * formats (and ODF's part-map, when built, parameterises around it)
 * ------------------------------------------------------------------ */

/** The conventional .rels part for a part name (OPC): the package root's is
 *  `_rels/.rels`; a part `word/document.xml`'s is
 *  `word/_rels/document.xml.rels`. */
export function relsPartFor(partName = null) {
  if (partName == null || partName === "") return "_rels/.rels";
  const norm = normalizePartName(partName);
  const slash = norm.lastIndexOf("/");
  const dir = slash < 0 ? "" : norm.slice(0, slash + 1);
  const base = slash < 0 ? norm : norm.slice(slash + 1);
  return `${dir}_rels/${base}.rels`;
}

/** Every `_rels/*.rels` part in the container, in central-directory order. */
export function listRelsParts(container) {
  return entriesOf(container)
    .map((e) => normalizePartName(e.name))
    .filter((n) => /(^|\/)_rels\/[^/]*\.rels$/.test(n)); // [^/]* — the package root's is the bare `_rels/.rels`
}

/** Parse one .rels document. `TargetMode="External"` → OUTBOUND (the uniform
 *  property that makes office formats one registry entry rather than three
 *  parsers); anything else — absent TargetMode or "Internal" — targets a part
 *  inside the package. Returns
 *  `{ ok:true, relationships:[{id,type,target,targetMode,external}], outbound:[…external rels] }`
 *  or `{ ok:false, why:"rels_unparseable" }`. */
export function parseRels(xml) {
  if (typeof xml !== "string" || !/<(?:[\w.-]+:)?Relationships\b/.test(xml)) {
    return { ok: false, why: "rels_unparseable" };
  }
  const relationships = xmlElements(xml, "Relationship")
    .filter((a) => a.Target != null)
    .map((a) => ({
      id: a.Id ?? null,
      type: a.Type ?? null,
      target: a.Target,
      targetMode: a.TargetMode ?? null,
      external: a.TargetMode === "External",
    }));
  return { ok: true, relationships, outbound: relationships.filter((r) => r.external) };
}

/** Walk EVERY .rels part in the container and aggregate, keeping per-part
 *  attribution and keeping unreadable parts STATED in `undetermined` rather
 *  than dropped:
 *  `{ ok:true, byPart:[{part, relationships, outbound}], outbound:[{part, …rel}], undetermined:[{part, why}] }` */
export async function walkRels(bytes, container) {
  const byPart = [];
  const outbound = [];
  const undetermined = [];
  for (const part of listRelsParts(container)) {
    const read = await readPart(bytes, container, part);
    if (!read.ok) { undetermined.push({ part, why: read.why }); continue; }
    const parsed = parseRels(UTF8.decode(read.bytes));
    if (!parsed.ok) { undetermined.push({ part, why: parsed.why }); continue; }
    byPart.push({ part, relationships: parsed.relationships, outbound: parsed.outbound });
    for (const r of parsed.outbound) outbound.push({ part, ...r });
  }
  return { ok: true, byPart, outbound, undetermined };
}

/* ------------------------------------------------------------------ *
 * docProps/core.xml — the metadata the publisher's own software recorded
 * (DEC-5: who edited a document and when IS evidence)
 * ------------------------------------------------------------------ */

export const CORE_PROPERTIES_PART = "docProps/core.xml";

/** Parse core.xml text. Fields the queue names as evidentiary: creator,
 *  lastModifiedBy, revision (count), created/modified (instants). Each is the
 *  string the file carries or null when ABSENT — absence recorded, never
 *  filled in. `revision` additionally carries `revisionNumber` when (and only
 *  when) the string is a plain integer. */
export function parseCoreProperties(xml) {
  if (typeof xml !== "string" || !/<(?:[\w.-]+:)?coreProperties\b/.test(xml)) {
    return { ok: false, why: "core_properties_unparseable" };
  }
  const revision = xmlElementText(xml, "revision");
  const revisionNumber = revision != null && /^\d+$/.test(revision.trim())
    ? parseInt(revision.trim(), 10) : null;
  return {
    ok: true,
    creator: xmlElementText(xml, "creator"),
    lastModifiedBy: xmlElementText(xml, "lastModifiedBy"),
    revision,
    revisionNumber,
    created: xmlElementText(xml, "created"),
    modified: xmlElementText(xml, "modified"),
    title: xmlElementText(xml, "title"),
  };
}

/** Read and parse `docProps/core.xml` from a container. A package without one
 *  (it is optional in OPC) is `{ ok:false, why:"part_absent" }` — stated, and
 *  distinct from a package whose core.xml exists but cannot be read. */
export async function readCoreProperties(bytes, container) {
  const read = await readPart(bytes, container, CORE_PROPERTIES_PART);
  if (!read.ok) return { ok: false, why: read.why };
  return parseCoreProperties(UTF8.decode(read.bytes));
}

/* ------------------------------------------------------------------ *
 * FW-19 / IC-124 — THE `image` REFERENCE (EXTRACTION-BREADTH §3.2)
 * ------------------------------------------------------------------ *
 *
 * An image cited AS ITSELF is bytes, not text (§3.1): a map, a signature, a
 * chart cited for what it shows. Its address inside a container is the
 * CONTENT HASH of the media part, never the part NAME — a name is the
 * producer's filing choice and two saves of one document may renumber
 * `image1.png`, while the bytes are the image. So the reference is
 *
 *   { kind:"image", ref:"image <first 12 hex of part>", part:<sha256>, mime, name }
 *
 * `ref` is DERIVED FROM THE ADDRESS and not from the name, and that is IC-1's
 * parity rule rather than taste: `describeExtent` in the checker composes the
 * human form a member's citation gets when they author none, it can see only
 * the address, and REC-85's rule is that the two strings are the same string.
 * The name rides beside it for a person to recognise.
 *
 * ONE ENUMERATOR FOR ALL SIX ENTRIES, living here beside `readPart` because
 * it is a CONTAINER fact: which members are images is a question about the
 * package, and each entry supplies only its media directory (`word/media/`,
 * `xl/media/`, `ppt/media/`, OpenDocument's `Pictures/`).
 *
 * THE LIST IS EXHAUSTIVE OR IT IS NULL, and that is the property the
 * out-of-range refusal rests on. The checker refuses a part the container
 * does not hold; if one media member could not be read and this returned the
 * others, a citation of the unread one (a member can hash the file themselves)
 * would be refused as absent when it is present — the record refusing a true
 * citation. So a single unreadable member, or media over the size bound, makes
 * the whole list NULL with the reason stated, and NULL is SKIPPED by the
 * checker rather than read as "no images". An EMPTY list is a real zero: the
 * directory was looked in and held no image.
 *
 * WHAT IS NOT ENUMERATED, stated: a media member whose extension is not an
 * image type (audio, video, an OLE blob) — it is not an image, and the
 * embedded-object path (`intra`) already content-addresses embeddings. */

/** Extension -> MIME for the image types office containers carry. A member
 *  whose extension is not here is not enumerated as an image. */
export const IMAGE_MIME_BY_EXT = Object.freeze({
  png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", jpe: "image/jpeg",
  gif: "image/gif", bmp: "image/bmp", tif: "image/tiff", tiff: "image/tiff",
  svg: "image/svg+xml", webp: "image/webp", emf: "image/emf", wmf: "image/wmf",
  emz: "image/x-emz", wmz: "image/x-wmz",
});

const IMAGE_HEX = "0123456789abcdef";
async function imageSha256(u8) {
  const d = new Uint8Array(await crypto.subtle.digest("SHA-256", u8));
  let out = "";
  for (let i = 0; i < d.length; i++) out += IMAGE_HEX[d[i] >> 4] + IMAGE_HEX[d[i] & 15];
  return out;
}

/** The IC-1 `image` reference for a container media part. */
export function imageRef(part, mime = null, name = null) {
  return { kind: "image", ref: `image ${String(part).slice(0, 12)}`, part, mime, name };
}

/** Every image member under `dir`, content-addressed, in central-directory
 *  order. Returns `{ images: [imageRef...], why: null }` or
 *  `{ images: null, why }` — never a partial list. */
export async function containerImages(bytes, container, dir) {
  const want = normalizePartName(dir);
  const members = [];
  let declared = 0;
  for (const e of entriesOf(container)) {
    const name = normalizePartName(e.name);
    if (!name.startsWith(want) || name === want || name.endsWith("/")) continue;
    const dot = name.lastIndexOf(".");
    const mime = dot > name.lastIndexOf("/") ? IMAGE_MIME_BY_EXT[name.slice(dot + 1).toLowerCase()] ?? null : null;
    if (!mime) continue;
    members.push({ name, mime });
    declared += e.uncompressedSize;
  }
  /* The same bound and the same metric as the text parts (declared
     uncompressed bytes, from the central directory, before inflation):
     hashing inflates every member, and an unbounded inflate on a Worker is
     what COFF-6 measured the bound for. Over it the list is NULL and SAYS SO
     — never a prefix of it. */
  const g = sizeGuard(declared);
  if (!g.ok) return { images: null, why: `media_over_size_bound:${declared}>${g.bound}` };
  const images = [];
  for (const m of members) {
    const read = await readPart(bytes, container, m.name);
    if (!read.ok) return { images: null, why: `media_part_unreadable:${m.name}:${read.why}` };
    images.push(imageRef(await imageSha256(read.bytes), m.mime,
      m.name.slice(m.name.lastIndexOf("/") + 1)));
  }
  return { images, why: null };
}

/** An entry's SUCCESSFUL `text()` output with `images` added — the one way
 *  all six entries attach it, so the key's meaning cannot drift per entry.
 *  A failed text() (`ok:false`) is returned untouched: no container was read,
 *  so there is no media directory to have looked in. On a successful read
 *  `images` is the exhaustive list or NULL, and a NULL carries `imagesWhy`. */
export async function withContainerImages(outOrPromise, parts, dir) {
  const out = await outOrPromise;
  if (!out || !out.ok || !parts || !parts.ok || !parts.container) return out;
  const got = await containerImages(parts.bytes, parts.container, dir);
  return got.images ? { ...out, images: got.images }
                    : { ...out, images: null, imagesWhy: got.why };
}
