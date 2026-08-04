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
 *     Content-Type or a filename extension NEVER decides (I7);
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
 * ODF is DESIGNED FOR, not built: the flavour table is a PARAMETER
 * (`discriminate(bytes, contentType, flavours)`), so an ODF part-map is one
 * more table entry, not a rewrite. This module ASSERTS nothing about meaning
 * (that stays FRAMEWORK's, through I2) and WRITES nothing.
 *
 * Registry entries (COFF-3/4/5) build their I7 `detect`/`parts`/`structure`/
 * `text` on top of these primitives; this module is below the registry and
 * imports nothing from it.
 */

const UTF8 = new TextDecoder("utf-8", { fatal: false });
const LATIN1 = new TextDecoder("latin1");

/* ------------------------------------------------------------------ *
 * The size guard
 * ------------------------------------------------------------------ */

/* PROVISIONAL — picked, not measured. COFF-6 measures the real bound on real
 * Oakland documents (size distribution vs the workerd envelope) and replaces
 * this number; the name says so, so no reader mistakes it for a measurement
 * (CLAUDE.md: a number that was not measured is labelled as what it is).
 * Until then: a container over this bound gets full central-directory and
 * metadata treatment but full text extraction is refused as a STATED
 * `text-undetermined`, never silently truncated. */
export const PROVISIONAL_OOXML_SIZE_BOUND_BYTES = 32 * 1024 * 1024;

/** The size-guard plumbing every format entry calls before full extraction.
 *  Returns `{ ok:true }` under the bound; over it, a stated undetermined
 *  marker carrying WHY, the sizes, and the fact that the bound is provisional
 *  — shaped so a format entry can carry it into its I2 text output verbatim. */
export function sizeGuard(byteLength, bound = PROVISIONAL_OOXML_SIZE_BOUND_BYTES) {
  if (!(byteLength > bound)) return { ok: true };
  return {
    ok: false,
    text: "undetermined",
    why: "over_size_bound",
    size: byteLength,
    bound,
    boundName: "PROVISIONAL_OOXML_SIZE_BOUND_BYTES",
    provisional: true, // COFF-6 measures the real bound
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

export function crc32(u8) {
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
  return bytes.length >= 4 && u32(bytes, 0) === SIG_LOCAL;
}

/* OPC part names in [Content_Types].xml overrides start with "/", ZIP entry
 * names do not. One normal form so the two always meet. */
export function normalizePartName(name) {
  return String(name || "").replace(/^\/+/, "");
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
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
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

async function inflateRaw(u8) {
  try {
    const ds = new DecompressionStream("deflate-raw");
    const out = new Response(new Blob([u8]).stream().pipeThrough(ds));
    return new Uint8Array(await out.arrayBuffer());
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
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const want = normalizePartName(name);
  const entry = container.byName.get(want)
    ?? container.entries.find((e) => normalizePartName(e.name) === want);
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
    out = await inflateRaw(raw);
    if (out === null) return { ok: false, why: "inflate_failed", name: want };
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
 * Flavour discrimination — docx / xlsx / pptx vs an arbitrary ZIP
 * ------------------------------------------------------------------ */

/* The flavour table IS the part-map parameter: each row names the main part's
 * declared content type and where the main part conventionally lives. ODF
 * (odt/ods/odp — same container, `mimetype` + `META-INF/manifest.xml` instead
 * of `[Content_Types].xml`) is DESIGNED FOR by this parameterisation and by
 * `discriminate` taking the table as an argument; the ODF rows are NOT built
 * here (COFF queue, later). */
export const OOXML_FLAVOURS = [
  {
    flavour: "docx",
    mainContentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml",
    conventionalMainPart: "word/document.xml",
  },
  {
    flavour: "xlsx",
    mainContentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml",
    conventionalMainPart: "xl/workbook.xml",
  },
  {
    flavour: "pptx",
    mainContentType: "application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml",
    conventionalMainPart: "ppt/presentation.xml",
  },
];

/** Which OOXML flavour, if any, this container is — MAGIC BYTES PLUS PARTS,
 *  never the caller-declared content type and never a filename extension
 *  (neither is even an input to the determination; `contentType` is carried
 *  into `signals` purely as corroborating-or-contradicted context, I7).
 *
 *  Returns:
 *    { ok:true,  format:"docx"|"xlsx"|"pptx", mainPart, confidence:"high", signals }
 *    { ok:true,  format:"zip",  signals }            — a real ZIP, NOT OOXML
 *    { ok:true,  format:"undetermined", why, signals } — a ZIP whose flavour
 *        cannot be honestly discriminated (unreadable/absent-but-declared
 *        parts, an OPC package of an unrecognised type). STATED, never guessed.
 *    { ok:false, why, signals }                      — not a readable ZIP at
 *        all (no magic, truncated central directory, zip64, …).
 *
 *  The discrimination requires BOTH halves: the [Content_Types].xml
 *  declaration of a flavour's main content type AND that declared part
 *  actually present in the central directory. A declaration whose part is
 *  missing is `undetermined: declared_main_part_absent` — bytes contradicting
 *  a claim are surfaced, not smoothed over. */
export async function discriminate(bytes, contentType = null, flavours = OOXML_FLAVOURS) {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const signals = [];
  if (contentType) signals.push(`declared-content-type:${contentType} (not used for the determination)`);

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

  const ctEntry = container.byName.get(CONTENT_TYPES_PART);
  if (!ctEntry) {
    /* No [Content_Types].xml → not an OPC package at all: an arbitrary ZIP a
     * body might publish. This is a POSITIVE determination, not an
     * undetermined — and it stands whatever the declared content type or the
     * filename claimed. */
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

  for (const f of flavours) {
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
  return container.entries
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
