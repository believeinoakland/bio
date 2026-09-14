/* The OOXML container reader (QUEUE COFF-2), tested against zips BUILT HERE —
 * local headers, central directory, EOCD assembled byte-by-byte with an
 * INDEPENDENT crc32 — so the fixtures are hermetic and a PASS means the walk
 * read what is actually in the archive rather than what a convenient
 * real-world file happened to contain.
 *
 * The accepts-when cases, all present:
 *   - fixture ROUND-TRIPS for all three flavours (docx/xlsx/pptx): the main
 *     part read back byte-identical through DecompressionStream("deflate-raw")
 *   - a PLAIN ZIP is NOT identified as OOXML
 *   - a RENAMED plain zip (a .docx content type declared by the caller) is
 *     caught by magic-bytes-plus-parts, not by extension or content type
 *   - a TRUNCATED central directory yields a stated undetermined, never a
 *     silent partial
 * Plus the doctrine cases: stored members, CRC mismatch, unsupported method,
 * absent parts, the uniform _rels walker (TargetMode="External" → outbound,
 * unreadable rels STATED), docProps/core.xml extraction with absence honest,
 * the size guard's stated text-undetermined, and the flavour table as a
 * PARAMETER (a custom part-map discriminates without touching the module).
 *
 * COFF-9 (2026-09-14) adds the OpenDocument accepts-when cases, and the
 * section that used to be titled "ODF is DESIGNED FOR" is CORRECTED rather
 * than exempted — its two assertions are still true and stand unmoved, but
 * the claim in its heading is not:
 *   - odt / ods / odp discriminate on their fixtures, with content.xml
 *     ROUND-TRIPPING byte-identical, `confidence:"high"` and mainPart named
 *   - the mimetype VALUE is the discriminator, not the file list
 *   - a mimetype that is not first, or compressed, is REFUSED and stated
 *   - the three OOXML outcomes are untouched, asserted by comparing the FULL
 *     result objects rather than a field
 */
/* THE MARKER GRAMMAR BELOW IS LOAD-BEARING, and it cost this item a red gate to
 * learn. `scripts/control-register.mjs` finds a declaration by the phrase
 * followed IMMEDIATELY (whitespace aside) by one of `:` `—` `–` `-`. COFF-9
 * first wrote the qualifier BEFORE the colon — the phrase then ran into a `(`,
 * `markerPositions` matched nothing, and the register read this suite as
 * declaring NO control at all: `coverage.mjs --strict` exited 1 and
 * `owed-controls.test.mjs` went red, with nothing anywhere naming punctuation
 * as the cause. Put the qualifier AFTER the separator. Same class as the D-233
 * receipt the register's own header carries, and a second instance of it. */
/* NEGATIVE CONTROL: (COFF-2, kept verbatim) in discriminate(), right after the readContainer ok-check, insert `return { ok:true, format: flavours[0].flavour, mainPart:null, confidence:"high", signals }` (skipping the [Content_Types].xml + main-part discrimination) -> the plain-ZIP assertion fails (zip expected, docx got), with the renamed-ZIP, declared-main-part-absent, OPC-unrecognized and xlsx/pptx discrimination assertions. RUN 2026-08-03: 13 of 97 failed; the container-walk, round-trip, rels, core-props and size-guard assertions still passed; restored -> 97 pass 0 fail. */
/* NEGATIVE CONTROL: (COFF-9, 2026-09-14) three arms, each armed ALONE in `bio-plane/src/ooxml.mjs` with the file `cp`ed aside and `cp`ed back (never `git checkout --`), each restore verified by sha256 AND `cmp`:
   (1) WRONG MIMETYPE VALUE — no source arm needed, it is DRIVEN in this suite: the ODF-SHAPED-BUT-WRONG fixture carries META-INF/manifest.xml and content.xml with mimetype `application/vnd.oasis.opendocument.graphics` (a real ODF media type this table does not carry) and must be `undetermined` / `odf_mimetype_unrecognized`, never a flavour; the EPUB fixture beside it pins the same rule for `application/epub+zip`. RUN 2026-09-14: passes on the built module.
   (2) MIMETYPE NOT FIRST / COMPRESSED — also DRIVEN here rather than armed, because the PINNED decision is a behaviour and not an absence: the not-first fixture must be `undetermined` / `odf_mimetype_not_first` and the compressed one `undetermined` / `odf_mimetype_not_stored`. The ARM that proves these assertions can fail is (3) below. RUN 2026-09-14: passes on the built module.
   (3) THE ARM'S OWN ARM — NEUTER THE ODF TABLE: `node` over `src/ooxml.mjs` replacing the three `ODF_FLAVOURS` rows with `[]` (488 source bytes -> 29; the patch script ASSERTS its anchor occurs exactly once, because an arm that did not arm is a finding). MUST FAIL: every assertion in the five OpenDocument sections that expects a flavour or an `odf_*` reason — the ODF-shaped containers all fall through to `format:"zip"`. MUST NOT FAIL: every OOXML, container-walk, rels, core-props and size-guard assertion, the plain-ZIP determination, and the whole OVER-STRICTNESS section. RUN 2026-09-14: 37 of 167 failed, ALL 37 inside the five OpenDocument sections (5 + 12 + 5 + 7 + 8) and none outside them; restored by `cp` back, verified sha256 4c24d1456faec126f9103a320466540ad2c4e6d6e687e7ff98e53a9aa94d0296 AND `cmp` AND 41,121 bytes -> 167 pass 0 fail.
   WHAT ARM (3) FOUND ABOUT THE SUITE, recorded rather than smoothed: a bare `ODF_FLAVOURS.every(...)` stayed GREEN over the emptied table, because `[].every()` is true. It now asserts the row COUNT beside the predicate, and the arm was RE-RUN after that correction — which is why this line reads 37 and not the 36 the first arming measured. Two further greens under the arm are correct and not vacuous — `content.xml ROUND-TRIPS` exercises `readPart`, which the table does not touch, and `determined, not undetermined` is true of the `format:"zip"` fall-through, which is why it is paired with a `format` assertion that does fail.
   OVER-STRICTNESS, measured outside the suite because it compares against a tree this session never touched: `discriminate()`'s FULL result objects for 15 pre-existing cases (the three OOXML fixtures, plain zip, renamed zip, declared-main-part-absent, vsdx, the caller-supplied table, the stored-member package, truncated CD, non-zip bytes, empty zip) captured from a pristine `git worktree add` of origin/main and from this tree: byte-identical, sha256 fdeb3b977f8adeec5db3eb92240ac1ca5cdcf6762aa0448212339a9905aac50d both sides. */

import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import {
  MEASURED_OOXML_TEXT_BOUND_BYTES, declaredTextBytes, sizeGuard, crc32 as modCrc32,
  hasZipMagic, normalizePartName, readContainer, readPart,
  CONTENT_TYPES_PART, parseContentTypes, partContentType,
  OOXML_FLAVOURS, ODF_FLAVOURS, CONTAINER_FLAVOURS, discriminate,
  ODF_MIMETYPE_PART, ODF_MANIFEST_PART, ODF_MIMETYPE_MAX_BYTES,
  relsPartFor, listRelsParts, parseRels, walkRels,
  CORE_PROPERTIES_PART, parseCoreProperties, readCoreProperties,
} from "../src/ooxml.mjs";
import { deflateRawSync } from "node:zlib";

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

/* ---- an INDEPENDENT crc32 (bitwise, no table) so the fixture builder does
 * not inherit a defect from the module under test ---- */
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
  }
  return (c ^ 0xffffffff) >>> 0;
}

/* ---- the zip assembler: files -> a complete archive with local headers,
 * central directory and EOCD. Options per file: store (method 0), badCrc
 * (lie about the CRC in BOTH headers), method (force an arbitrary method
 * number with the data carried as-is). ---- */
function u16le(n) { return Buffer.from([n & 0xff, (n >> 8) & 0xff]); }
function u32le(n) { return Buffer.from([n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff]); }

function zip(files) {
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const f of files) {
    const nameB = Buffer.from(f.name, "utf-8");
    const data = Buffer.isBuffer(f.data) ? f.data : Buffer.from(f.data, "utf-8");
    const method = f.method ?? (f.store ? 0 : 8);
    const comp = method === 8 ? deflateRawSync(data) : data;
    const crc = f.badCrc ? (crc32(data) ^ 0xdeadbeef) >>> 0 : crc32(data);
    const local = Buffer.concat([
      u32le(0x04034b50), u16le(20), u16le(0x0800), u16le(method),
      u16le(0), u16le(0x21), // time, date
      u32le(crc), u32le(comp.length), u32le(data.length),
      u16le(nameB.length), u16le(0), nameB, comp,
    ]);
    const central = Buffer.concat([
      u32le(0x02014b50), u16le(20), u16le(20), u16le(0x0800), u16le(method),
      u16le(0), u16le(0x21),
      u32le(crc), u32le(comp.length), u32le(data.length),
      u16le(nameB.length), u16le(0), u16le(0), u16le(0), u16le(0),
      u32le(0), u32le(offset), nameB,
    ]);
    locals.push(local);
    centrals.push(central);
    offset += local.length;
  }
  const cd = Buffer.concat(centrals);
  const eocd = Buffer.concat([
    u32le(0x06054b50), u16le(0), u16le(0),
    u16le(files.length), u16le(files.length),
    u32le(cd.length), u32le(offset), u16le(0),
  ]);
  return new Uint8Array(Buffer.concat([...locals, cd, eocd]));
}

/* ---- minimal-but-valid OOXML fixture sources, kept as named constants so
 * round-trip assertions compare against the exact bytes written ---- */
const MAIN_CT = {
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml",
};
const MAIN_PART = { docx: "word/document.xml", xlsx: "xl/workbook.xml", pptx: "ppt/presentation.xml" };
const MAIN_XML = {
  docx: `<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Agenda item 7: the budget amendment</w:t></w:r></w:p></w:body></w:document>`,
  xlsx: `<?xml version="1.0"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheets><sheet name="Budget" sheetId="1" r:id="rId1" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/></sheets></workbook>`,
  pptx: `<?xml version="1.0"?><p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:sldIdLst/></p:presentation>`,
};
const contentTypesXml = (flavour) => `<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/${MAIN_PART[flavour]}" ContentType="${MAIN_CT[flavour]}"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>`;
const ROOT_RELS = `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`;
/* The main part's rels: one EXTERNAL hyperlink (with an &amp; the walker must
 * decode) and one internal image relationship that must NOT appear outbound. */
const DOC_RELS = `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId5" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="https://example.gov/agenda?id=7&amp;year=2026" TargetMode="External"/><Relationship Id="rId6" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image1.png"/></Relationships>`;
const CORE_XML = `<?xml version="1.0"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>FY27 Midcycle Amendment</dc:title><dc:creator>M. Analyst</dc:creator><cp:lastModifiedBy>Budget Office &amp; CAO</cp:lastModifiedBy><cp:revision>14</cp:revision><dcterms:created xsi:type="dcterms:W3CDTF">2026-06-01T09:00:00Z</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">2026-06-15T17:30:00Z</dcterms:modified></cp:coreProperties>`;

const relsFor = (flavour) => {
  const p = MAIN_PART[flavour];
  return { name: relsPartFor(p), data: DOC_RELS };
};
const ooxmlFixture = (flavour, extra = []) => zip([
  { name: "[Content_Types].xml", data: contentTypesXml(flavour) },
  { name: "_rels/.rels", data: ROOT_RELS },
  { name: MAIN_PART[flavour], data: MAIN_XML[flavour] },
  relsFor(flavour),
  { name: "docProps/core.xml", data: CORE_XML },
  ...extra,
]);

const PLAIN_ZIP = zip([
  { name: "readme.txt", data: "Meeting minutes, plain text." },
  { name: "data/expenses.csv", data: "dept,amount\npolice,100\n" },
]);

/* ---- minimal-but-valid OPENDOCUMENT fixtures (COFF-9), BUILT HERE by the
 * same assembler, from OpenDocument 1.2 part 3 §3.3's package rules: the
 * FIRST member is `mimetype`, STORED (method 0), carrying EXACTLY the media
 * type and nothing else; `META-INF/manifest.xml` lists the parts;
 * `content.xml` is the main part.
 *
 * WHAT THE BRIEF SAID AND WHAT WAS MEASURED, because they differ and the
 * difference is the reason these fixtures can be trusted. The COFF-9 brief
 * said no office suite exists on this machine and that the fixtures would
 * therefore be spec-derived and unverified against any producer. THAT IS
 * FALSE: LibreOffice 26.8.0.3 is installed (`/opt/homebrew/bin/soffice`), so
 * on 2026-09-14 a real .odt, .ods and .odp were produced with it and their
 * packages MEASURED through this module's own central-directory walk
 * (MEASUREMENTS.md, 2026-09-14). Every structural property these fixtures
 * assert was confirmed on all three real packages: `mimetype` is the first
 * central-directory entry, method 0, local-header offset 0, extra-field
 * length 0, and its bytes are the media type with NO trailing whitespace
 * (39 / 46 / 47 bytes). The fixtures stay hand-built so the suite is
 * HERMETIC — it must pass on a machine with no office suite, which is every
 * machine the plane runs on.
 *
 * WHAT THE FIXTURES STILL CANNOT SEE, stated rather than implied: one
 * producer, one version, one platform. Google Drive's ODF export — the
 * source Bob's 2026-09-14 ruling actually points this at — was NOT reachable
 * from this session and is NOT measured here. ---- */
const ODF_MIME = {
  odt: "application/vnd.oasis.opendocument.text",
  ods: "application/vnd.oasis.opendocument.spreadsheet",
  odp: "application/vnd.oasis.opendocument.presentation",
};
const odfManifestXml = (mime) => `<?xml version="1.0" encoding="UTF-8"?><manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2"><manifest:file-entry manifest:full-path="/" manifest:version="1.2" manifest:media-type="${mime}"/><manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/><manifest:file-entry manifest:full-path="meta.xml" manifest:media-type="text/xml"/></manifest:manifest>`;
const ODF_CONTENT = {
  odt: `<?xml version="1.0"?><office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"><office:body><office:text><text:p>Agenda item 7: the budget amendment</text:p></office:text></office:body></office:document-content>`,
  ods: `<?xml version="1.0"?><office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"><office:body><office:spreadsheet><table:table table:name="Budget"/></office:spreadsheet></office:body></office:document-content>`,
  odp: `<?xml version="1.0"?><office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0"><office:body><office:presentation><draw:page draw:name="page1"/></office:presentation></office:body></office:document-content>`,
};
const ODF_META = `<?xml version="1.0"?><office:document-meta xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:meta="urn:oasis:names:tc:opendocument:xmlns:meta:1.0" xmlns:dc="http://purl.org/dc/elements/1.1/"><office:meta><dc:creator>M. Analyst</dc:creator><meta:editing-cycles>14</meta:editing-cycles></office:meta></office:document-meta>`;

/* Options, one per thing the discriminator must refuse or accept:
 *   mimetypeValue   — override the declared media type (the WRONG-VALUE arm)
 *   compressed      — deflate the mimetype member instead of storing it
 *   last            — put the mimetype member LAST instead of first
 *   omitManifest    — drop META-INF/manifest.xml
 *   omitContent     — drop content.xml
 *   badMimetypeCrc  — lie about the mimetype member's CRC in both headers
 *   extra           — further members appended */
const odfFixture = (flavour, o = {}) => {
  const mime = {
    name: "mimetype",
    data: o.mimetypeValue ?? ODF_MIME[flavour],
    store: !o.compressed,
    badCrc: !!o.badMimetypeCrc,
  };
  const rest = [
    ...(o.omitManifest ? [] : [{ name: "META-INF/manifest.xml", data: odfManifestXml(o.mimetypeValue ?? ODF_MIME[flavour]) }]),
    ...(o.omitContent ? [] : [{ name: "content.xml", data: ODF_CONTENT[flavour] }]),
    { name: "meta.xml", data: ODF_META },
    { name: "styles.xml", data: `<?xml version="1.0"?><office:document-styles xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"/>` },
    ...(o.extra ?? []),
  ];
  return zip(o.last ? [...rest, mime] : [mime, ...rest]);
};

/* ================================================================== */
console.log("\n--- the three flavours discriminate and their parts ROUND-TRIP byte-identical ---");
for (const flavour of ["docx", "xlsx", "pptx"]) {
  const bytes = ooxmlFixture(flavour);
  const d = await discriminate(bytes);
  t(`${flavour}: discriminated as ${flavour}`, d.format, flavour);
  t(`${flavour}: with high confidence`, d.confidence, "high");
  t(`${flavour}: naming the main part`, d.mainPart, MAIN_PART[flavour]);
  const c = readContainer(bytes);
  t(`${flavour}: the container walks (5 entries)`, c.count, 5);
  const main = await readPart(bytes, c, MAIN_PART[flavour]);
  t(`${flavour}: the deflated main part ROUND-TRIPS byte-identical`,
    Buffer.from(main.bytes).toString("utf-8"), MAIN_XML[flavour]);
  const ct = await readPart(bytes, c, CONTENT_TYPES_PART);
  t(`${flavour}: [Content_Types].xml round-trips too`,
    Buffer.from(ct.bytes).toString("utf-8"), contentTypesXml(flavour));
}

console.log("\n--- THE ACCEPTANCE CASE: a plain ZIP is NOT identified as OOXML ---");
{
  const d = await discriminate(PLAIN_ZIP);
  t("a plain zip is format zip", d.format, "zip");
  t("determined, not undetermined (a positive finding)", d.ok, true);
  t("the signal names the absent [Content_Types].xml",
    d.signals.some((s) => s.includes("[Content_Types].xml absent")), true);
}

console.log("\n--- a RENAMED plain zip: magic-bytes-plus-parts beats extension and content type ---");
{
  /* The body serves the plain zip as agenda.docx with the docx content type.
   * Neither the name (never an input) nor the declared type flips it. */
  const d = await discriminate(PLAIN_ZIP, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
  t("still a plain zip, whatever the declared content type", d.format, "zip");
  t("the declared type is carried as a signal only",
    d.signals.some((s) => s.includes("declared-content-type") && s.includes("not used")), true);
}

console.log("\n--- a TRUNCATED central directory is a STATED undetermined, never a silent partial ---");
{
  const good = ooxmlFixture("docx");
  const container = readContainer(good);
  t("the intact fixture reads fine first", container.ok, true);
  /* Cut 20 bytes out of the middle of the central directory, keeping the
   * EOCD: exactly what an interrupted download of a large package looks like.
   * Locate the CD by its first PK\x01\x02 signature. */
  let cdStart = -1;
  for (let p = 0; p < good.length - 4; p++) {
    if (good[p] === 0x50 && good[p + 1] === 0x4b && good[p + 2] === 0x01 && good[p + 3] === 0x02) { cdStart = p; break; }
  }
  t("the central directory was located in the fixture", cdStart > 0, true);
  const truncated = new Uint8Array([...good.slice(0, cdStart + 10), ...good.slice(cdStart + 30)]);
  const r = readContainer(truncated);
  t("readContainer states the truncation", r.ok, false);
  t("naming central_directory_truncated", r.why, "central_directory_truncated");
  t("and hands back NO partial entry list", r.entries === undefined, true);
  const d = await discriminate(truncated);
  t("discriminate refuses to guess a flavour for it", d.ok, false);
  t("carrying the container's stated reason", d.why, "central_directory_truncated");
}

console.log("\n--- non-zip bytes and an empty zip ---");
{
  const d = await discriminate(new Uint8Array([1, 2, 3, 4, 5, 6]));
  t("arbitrary bytes are not_a_zip", d.why, "not_a_zip");
  t("hasZipMagic agrees", hasZipMagic(new Uint8Array([1, 2, 3, 4])), false);
  const empty = zip([]); // bare EOCD — no PK\x03\x04, no parts
  t("an empty zip has no member magic", hasZipMagic(empty), false);
  t("but its EOCD still walks: zero entries", readContainer(empty).count, 0);
  t("and it cannot be OOXML (no parts)", (await discriminate(empty)).why, "not_a_zip");
}

console.log("\n--- a STORED (method 0) member round-trips through the same readPart ---");
{
  const bytes = ooxmlFixture("docx", [{ name: "word/media/image1.png", data: Buffer.from([0x89, 0x50, 0x4e, 0x47, 1, 2, 3]), store: true }]);
  const c = readContainer(bytes);
  const img = await readPart(bytes, c, "word/media/image1.png");
  t("the stored member reads", img.ok, true);
  t("byte-identical", [...img.bytes], [0x89, 0x50, 0x4e, 0x47, 1, 2, 3]);
  t("and the package still discriminates docx", (await discriminate(bytes)).format, "docx");
}

console.log("\n--- unreadable members are NAMED, never guessed: crc, method, absence, truncation ---");
{
  const bad = zip([
    { name: "[Content_Types].xml", data: contentTypesXml("docx") },
    { name: "word/document.xml", data: MAIN_XML.docx, badCrc: true },
    { name: "odd.bin", data: Buffer.from("not really compressed"), method: 99 },
  ]);
  const c = readContainer(bad);
  t("the walk itself is fine (three entries)", c.count, 3);
  const doc = await readPart(bad, c, "word/document.xml");
  t("a CRC mismatch is stated", doc.why, "crc_mismatch");
  t("and yields NO bytes", doc.bytes === undefined, true);
  const odd = await readPart(bad, c, "odd.bin");
  t("an unknown compression method is stated", odd.why, "unsupported_compression_method");
  t("carrying the method number", odd.method, 99);
  const gone = await readPart(bad, c, "word/styles.xml");
  t("an absent part is part_absent", gone.why, "part_absent");
  /* A member whose data runs off the end of the file. */
  const whole = ooxmlFixture("docx");
  const cut = whole.slice(0, 40); // inside the first local member
  t("a cut-off archive has no EOCD and says so", readContainer(cut).why, "eocd_not_found");
}

console.log("\n--- [Content_Types].xml parsing: overrides, defaults, and honest failure ---");
{
  const parsed = parseContentTypes(contentTypesXml("xlsx"));
  t("overrides carry the main part", parsed.overrides.get("xl/workbook.xml"), MAIN_CT.xlsx);
  t("defaults carry the extension map", parsed.defaults.get("rels"), "application/vnd.openxmlformats-package.relationships+xml");
  t("partContentType: override wins", partContentType("/xl/workbook.xml", parsed), MAIN_CT.xlsx);
  t("partContentType: default by extension", partContentType("_rels/.rels", parsed), "application/vnd.openxmlformats-package.relationships+xml");
  t("partContentType: neither speaks -> null, not a guess", partContentType("word/media/image1.png", parsed), null);
  t("non-XML input is a stated failure", parseContentTypes("PK garbage").why, "content_types_unparseable");
  t("normalizePartName strips the OPC leading slash", normalizePartName("/word/document.xml"), "word/document.xml");
}

console.log("\n--- a declared main part that is ABSENT from the archive: bytes contradict the claim ---");
{
  const lying = zip([
    { name: "[Content_Types].xml", data: contentTypesXml("docx") },
    { name: "_rels/.rels", data: ROOT_RELS },
    /* no word/document.xml */
  ]);
  const d = await discriminate(lying);
  t("NOT identified as docx on the declaration alone", d.format, "undetermined");
  t("the why names the contradiction", d.why, "declared_main_part_absent");
  t("and records which flavour was declared", d.flavourDeclared, "docx");
}

console.log("\n--- an OPC package of an UNRECOGNISED type is undetermined, not rounded to zip or guessed ---");
{
  const vsdx = zip([
    { name: "[Content_Types].xml", data: `<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Override PartName="/visio/document.xml" ContentType="application/vnd.ms-visio.drawing.main+xml"/></Types>` },
    { name: "visio/document.xml", data: "<VisioDocument/>" },
  ]);
  const d = await discriminate(vsdx);
  t("format undetermined", d.format, "undetermined");
  t("why: opc_main_part_unrecognized", d.why, "opc_main_part_unrecognized");
}

console.log("\n--- the flavour table is a PARAMETER, not a rewrite (and COFF-9 collected on the bet) ---");
{
  /* CORRECTED 2026-09-14 (COFF-9). This section was titled "ODF is DESIGNED
   * FOR" and its comment called a caller-supplied part-map "the exact
   * extension point an ODF entry would use". The extension point claim was
   * RIGHT and was collected on — ODF is now built, in `ODF_FLAVOURS`, through
   * exactly this parameter — so the heading is corrected while BOTH
   * assertions below stand unmoved, because both are still true: a
   * caller-supplied table still discriminates a format the module never heard
   * of, and `OOXML_FLAVOURS` is still exactly the three OOXML rows (the ODF
   * rows went into their own table, not into this one). The table row here
   * deliberately carries NO `partMap` key — that is the back-compat case, and
   * a pre-COFF-9 caller's table must keep working. */
  const table = [{ flavour: "vsdx", mainContentType: "application/vnd.ms-visio.drawing.main+xml", conventionalMainPart: "visio/document.xml" }];
  const vsdx = zip([
    { name: "[Content_Types].xml", data: `<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Override PartName="/visio/document.xml" ContentType="application/vnd.ms-visio.drawing.main+xml"/></Types>` },
    { name: "visio/document.xml", data: "<VisioDocument/>" },
  ]);
  t("a caller-supplied part-map discriminates it", (await discriminate(vsdx, null, table)).format, "vsdx");
  t("the built-in table stays the three OOXML flavours",
    OOXML_FLAVOURS.map((f) => f.flavour), ["docx", "xlsx", "pptx"]);
}

/* ================================================================== */
console.log("\n--- OPENDOCUMENT (COFF-9): the ODF part-map row, on the SAME container ---");
{
  /* The tables, so COFF-10 builds its entries against a shape that is pinned
   * rather than read off a comment. */
  t("ODF_FLAVOURS is exactly odt/ods/odp", ODF_FLAVOURS.map((f) => f.flavour), ["odt", "ods", "odp"]);
  /* The row COUNT is asserted beside the `every` because `[].every()` is TRUE:
   * the neuter arm on 2026-09-14 left the bare `every` GREEN over an emptied
   * table, which is a finding about the assertion and not about the table.
   * Recorded rather than smoothed — the count is what makes it non-vacuous. */
  t("three ODF rows, every one declaring partMap odf",
    [ODF_FLAVOURS.length, ODF_FLAVOURS.every((f) => f.partMap === "odf")], [3, true]);
  t("every OOXML row now declares partMap opc", OOXML_FLAVOURS.every((f) => f.partMap === "opc"), true);
  t("the default table is the union, OPC first",
    CONTAINER_FLAVOURS.map((f) => f.flavour), ["docx", "xlsx", "pptx", "odt", "ods", "odp"]);
  t("an ODF row names its media type, not a content type",
    ODF_FLAVOURS.map((f) => f.mimetype),
    ["application/vnd.oasis.opendocument.text",
      "application/vnd.oasis.opendocument.spreadsheet",
      "application/vnd.oasis.opendocument.presentation"]);
  t("all three ODF rows name content.xml as the main part",
    [...new Set(ODF_FLAVOURS.map((f) => f.conventionalMainPart))], ["content.xml"]);
  t("the ODF part names are exported for COFF-10", [ODF_MIMETYPE_PART, ODF_MANIFEST_PART],
    ["mimetype", "META-INF/manifest.xml"]);
  /* The bound has real headroom over the MEASURED values (39/46/47 bytes). */
  t("the mimetype bound clears the longest real value with room",
    ODF_MIMETYPE_MAX_BYTES > Math.max(...Object.values(ODF_MIME).map((m) => m.length)), true);
}

console.log("\n--- each ODF flavour discriminates, and content.xml ROUND-TRIPS byte-identical ---");
for (const flavour of ["odt", "ods", "odp"]) {
  const bytes = odfFixture(flavour);
  const d = await discriminate(bytes);
  t(`${flavour}: discriminated as ${flavour}`, d.format, flavour);
  t(`${flavour}: determined, not undetermined`, d.ok, true);
  t(`${flavour}: with high confidence`, d.confidence, "high");
  t(`${flavour}: naming content.xml as the main part`, d.mainPart, "content.xml");
  const c = readContainer(bytes);
  const main = await readPart(bytes, c, "content.xml");
  t(`${flavour}: the deflated content.xml ROUND-TRIPS byte-identical`,
    Buffer.from(main.bytes).toString("utf-8"), ODF_CONTENT[flavour]);
  /* The mimetype member is STORED, and reading it back proves both that the
   * stored path works and that the value carries no trailing byte. */
  const mt = await readPart(bytes, c, "mimetype");
  t(`${flavour}: the stored mimetype member reads back EXACTLY the media type`,
    Buffer.from(mt.bytes).toString("utf-8"), ODF_MIME[flavour]);
  t(`${flavour}: the signal names it as first and stored`,
    d.signals.some((s) => s.includes(`odf:mimetype ${ODF_MIME[flavour]} (first member, stored)`)), true);
  t(`${flavour}: no [Content_Types].xml was needed or invented`,
    c.entries.some((e) => e.name === "[Content_Types].xml"), false);
}

console.log("\n--- THE MIMETYPE VALUE IS THE DISCRIMINATOR, NOT THE FILE LIST (negative control 1) ---");
{
  /* An ODF-SHAPED container: mimetype first and stored, META-INF/manifest.xml
   * and content.xml both present — everything but the value. It must NEVER
   * come back a flavour. */
  const wrong = odfFixture("odt", { mimetypeValue: "application/vnd.oasis.opendocument.graphics" });
  const d = await discriminate(wrong);
  t("an unrecognised OpenDocument media type is undetermined", d.format, "undetermined");
  t("naming odf_mimetype_unrecognized", d.why, "odf_mimetype_unrecognized");
  t("and it is NEVER rounded into a flavour", ["odt", "ods", "odp"].includes(d.format), false);
  t("the signal carries the value it actually read",
    d.signals.some((s) => s.includes("application/vnd.oasis.opendocument.graphics")), true);
  t("even though the ODF part list is entirely present",
    readContainer(wrong).entries.map((e) => e.name).filter((n) => n === "META-INF/manifest.xml" || n === "content.xml").sort(),
    ["META-INF/manifest.xml", "content.xml"]);

  /* An EPUB is the everyday other first-and-stored-mimetype container. It is
   * undetermined, NOT "zip": rounding it to zip would erase the evidence that
   * this container declares a media type at all. */
  const epub = zip([
    { name: "mimetype", data: "application/epub+zip", store: true },
    { name: "META-INF/container.xml", data: `<?xml version="1.0"?><container version="1.0"/>` },
    { name: "OEBPS/content.opf", data: "<package/>" },
  ]);
  const de = await discriminate(epub);
  t("an EPUB is undetermined, not zip and not an ODF flavour", [de.format, de.why],
    ["undetermined", "odf_mimetype_unrecognized"]);

  /* EXACT comparison, pinned: a trailing newline is a non-conforming producer
   * to be NAMED, never a difference to absorb. */
  const trailing = odfFixture("odt", { mimetypeValue: `${ODF_MIME.odt}\n` });
  const dt = await discriminate(trailing);
  t("a trailing newline on the media type is refused, not trimmed away",
    [dt.format, dt.why], ["undetermined", "odf_mimetype_unrecognized"]);
}

console.log("\n--- PINNED (negative control 2): mimetype not first, or compressed, is REFUSED and SAID ---");
{
  /* The decision and its reason live at `discriminateOdf` in ooxml.mjs.
   * In one line: OpenDocument 1.2 part 3 §3.3 requires first-and-stored, that
   * placement is the whole reason the signal is worth anything, all three
   * real producer packages measured on 2026-09-14 conform, and a stated
   * refusal is the cheaply reversible direction. */
  const notFirst = odfFixture("odt", { last: true });
  const dn = await discriminate(notFirst);
  t("mimetype present but LAST: undetermined", dn.format, "undetermined");
  t("naming odf_mimetype_not_first", dn.why, "odf_mimetype_not_first");
  t("never a flavour, and never silently ignored — the signal says so",
    dn.signals.some((s) => s.includes("NOT the first archive member")), true);

  const deflated = odfFixture("ods", { compressed: true });
  const dc = await discriminate(deflated);
  t("mimetype first but COMPRESSED: undetermined", dc.format, "undetermined");
  t("naming odf_mimetype_not_stored", dc.why, "odf_mimetype_not_stored");
  t("the signal names the method it found",
    dc.signals.some((s) => s.includes("method 8")), true);

  /* Both arms are about PLACEMENT ONLY, and that is MEASURED rather than
   * asserted: the member reads back the correct media type in both, so
   * neither refusal can be the wrong-value refusal wearing another name. */
  const nfMime = await readPart(notFirst, readContainer(notFirst), "mimetype");
  t("the LAST-placed member still carries the right media type",
    Buffer.from(nfMime.bytes).toString("utf-8"), ODF_MIME.odt);
  const dfMime = await readPart(deflated, readContainer(deflated), "mimetype");
  t("the COMPRESSED member still carries the right media type",
    Buffer.from(dfMime.bytes).toString("utf-8"), ODF_MIME.ods);
  t("so both refusals are about PLACEMENT, not value",
    [dn.why, dc.why], ["odf_mimetype_not_first", "odf_mimetype_not_stored"]);
}

console.log("\n--- the other ODF refusals: both halves required, unreadable stated, oversize bounded ---");
{
  const noManifest = await discriminate(odfFixture("odt", { omitManifest: true }));
  t("no META-INF/manifest.xml: undetermined", noManifest.format, "undetermined");
  t("naming odf_manifest_absent", noManifest.why, "odf_manifest_absent");
  t("recording which flavour the mimetype declared", noManifest.flavourDeclared, "odt");

  const noContent = await discriminate(odfFixture("odp", { omitContent: true }));
  t("no content.xml: the SAME reason the OPC side uses for the same defect",
    noContent.why, "declared_main_part_absent");
  t("and it records the declared flavour", noContent.flavourDeclared, "odp");

  const badCrc = await discriminate(odfFixture("ods", { badMimetypeCrc: true }));
  t("an unreadable mimetype is STATED, never guessed past",
    badCrc.why, "odf_mimetype_unreadable:crc_mismatch");

  /* A container declaring a huge `mimetype` must not be inflated and decoded
   * to settle a 47-byte question. */
  const huge = zip([
    { name: "mimetype", data: "x".repeat(ODF_MIMETYPE_MAX_BYTES + 1), store: true },
    { name: "META-INF/manifest.xml", data: odfManifestXml(ODF_MIME.odt) },
    { name: "content.xml", data: ODF_CONTENT.odt },
  ]);
  const dh = await discriminate(huge);
  t("an oversized mimetype member is refused by the bound", dh.why, "odf_mimetype_oversized");
  t("the signal names the bound's constant",
    dh.signals.some((s) => s.includes("ODF_MIMETYPE_MAX_BYTES")), true);
}

console.log("\n--- OVER-STRICTNESS: the OOXML side and the plain-ZIP determination are UNTOUCHED ---");
{
  /* The full result OBJECTS, not a field: an ODF branch that leaked a signal
   * into an OOXML container would pass a `d.format` check and fail here. The
   * pre-item-vs-post-item comparison against a pristine origin/main worktree
   * is recorded in this file's NEGATIVE CONTROL line; this is its in-suite
   * standing form — the same three fixtures answered identically by the
   * DEFAULT table and by `OOXML_FLAVOURS` alone. */
  for (const flavour of ["docx", "xlsx", "pptx"]) {
    const bytes = ooxmlFixture(flavour);
    const withOdf = await discriminate(bytes);
    const withoutOdf = await discriminate(bytes, null, OOXML_FLAVOURS);
    t(`${flavour}: the FULL result object is identical with and without the ODF rows`,
      withOdf, withoutOdf);
  }
  /* A ZIP with NEITHER part map stays a POSITIVE `zip`, and is never a
   * flavour. Both halves asserted — see discriminate()'s header for why the
   * determination was not weakened to `undetermined`. */
  const pz = await discriminate(PLAIN_ZIP);
  t("a plain zip is STILL format zip, with the ODF rows in the table", pz.format, "zip");
  t("and its signal is still the [Content_Types].xml one, with nothing ODF added",
    pz.signals, ["magic:zip (PK\\x03\\x04)", "container:zip entries=2", "part:[Content_Types].xml absent → plain ZIP"]);
  t("never an ODF flavour", ["odt", "ods", "odp"].includes(pz.format), false);

  /* The table really is the parameter, in BOTH directions. */
  t("an ODF-only table leaves a docx undetermined, not misread",
    (await discriminate(ooxmlFixture("docx"), null, ODF_FLAVOURS)).why, "opc_main_part_unrecognized");
  t("an OOXML-only table leaves an odt as a plain zip — the ODF branch never runs",
    (await discriminate(odfFixture("odt"), null, OOXML_FLAVOURS)).format, "zip");

  /* PRECEDENCE, pinned: a container carrying BOTH declarations is read as
   * OPC, which is what keeps every OOXML outcome byte-identical. The mimetype
   * goes FIRST and STORED here, i.e. in the one position that would satisfy
   * the ODF branch, so the assertion is about precedence and not about the
   * ODF branch quietly failing. */
  const both = zip([
    { name: "mimetype", data: ODF_MIME.odt, store: true },
    { name: "[Content_Types].xml", data: contentTypesXml("docx") },
    { name: "_rels/.rels", data: ROOT_RELS },
    { name: MAIN_PART.docx, data: MAIN_XML.docx },
    { name: "META-INF/manifest.xml", data: odfManifestXml(ODF_MIME.odt) },
    { name: "content.xml", data: ODF_CONTENT.odt },
  ]);
  const db = await discriminate(both);
  t("a container with BOTH declarations is read as OPC", db.format, "docx");
  t("and NO odf signal was pushed into an OPC container",
    db.signals.some((s) => s.startsWith("odf:")), false);
}

console.log("\n--- the uniform _rels walker: TargetMode=External -> outbound, internal stays home ---");
{
  const parsed = parseRels(DOC_RELS);
  t("two relationships read", parsed.relationships.length, 2);
  t("exactly ONE is outbound", parsed.outbound.length, 1);
  t("the external target, XML entities decoded", parsed.outbound[0].target, "https://example.gov/agenda?id=7&year=2026");
  t("its relationship type is carried", parsed.outbound[0].type, "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink");
  t("the internal image rel is NOT outbound", parsed.relationships.find((r) => r.id === "rId6").external, false);
  t("garbage is a stated rels_unparseable", parseRels("nope").why, "rels_unparseable");
  t("relsPartFor: package root", relsPartFor(), "_rels/.rels");
  t("relsPartFor: a nested part", relsPartFor("word/document.xml"), "word/_rels/document.xml.rels");
}

console.log("\n--- walkRels aggregates every .rels part; an unreadable one is STATED, not dropped ---");
{
  const bytes = ooxmlFixture("pptx");
  const c = readContainer(bytes);
  t("both .rels parts are discovered", listRelsParts(c), ["_rels/.rels", relsPartFor(MAIN_PART.pptx)]);
  const w = await walkRels(bytes, c);
  t("one outbound link across the whole package", w.outbound.length, 1);
  t("attributed to the part that carries it", w.outbound[0].part, relsPartFor(MAIN_PART.pptx));
  t("nothing undetermined on the clean fixture", w.undetermined, []);
  /* Now corrupt the main part's rels member and walk again. */
  const broken = zip([
    { name: "[Content_Types].xml", data: contentTypesXml("docx") },
    { name: "_rels/.rels", data: ROOT_RELS },
    { name: MAIN_PART.docx, data: MAIN_XML.docx },
    { name: relsPartFor(MAIN_PART.docx), data: DOC_RELS, badCrc: true },
  ]);
  const wb = await walkRels(broken, readContainer(broken));
  t("the unreadable rels part is STATED by name",
    wb.undetermined, [{ part: relsPartFor(MAIN_PART.docx), why: "crc_mismatch" }]);
  t("the readable root rels still contributed", wb.byPart.length, 1);
  t("and no outbound link was invented from the unreadable part", wb.outbound.length, 0);
}

console.log("\n--- docProps/core.xml: the evidentiary metadata (DEC-5), absence honest ---");
{
  const bytes = ooxmlFixture("xlsx");
  const core = await readCoreProperties(bytes, readContainer(bytes));
  t("creator", core.creator, "M. Analyst");
  t("lastModifiedBy, entities decoded", core.lastModifiedBy, "Budget Office & CAO");
  t("revision string carried verbatim", core.revision, "14");
  t("and its integer reading beside it", core.revisionNumber, 14);
  t("created instant", core.created, "2026-06-01T09:00:00Z");
  t("modified instant", core.modified, "2026-06-15T17:30:00Z");
  t("title", core.title, "FY27 Midcycle Amendment");
  /* Absence and partiality are recorded, never filled in. */
  const noCore = await readCoreProperties(PLAIN_ZIP, readContainer(PLAIN_ZIP));
  t("a package without core.xml states part_absent", noCore.why, "part_absent");
  const sparse = parseCoreProperties(`<cp:coreProperties xmlns:cp="x"><dc:creator xmlns:dc="y">Clerk</dc:creator></cp:coreProperties>`);
  t("a sparse core.xml: present fields read", sparse.creator, "Clerk");
  t("absent fields are null, never invented", [sparse.lastModifiedBy, sparse.revision, sparse.created, sparse.modified], [null, null, null, null]);
  t("a non-integer revision gets no invented number",
    parseCoreProperties(`<coreProperties><revision>two</revision></coreProperties>`).revisionNumber, null);
  t("garbage is a stated failure", parseCoreProperties("{}").why, "core_properties_unparseable");
}

console.log("\n--- the size guard: over the bound is a STATED text-undetermined, never silent truncation ---");
{
  /* CORRECTED for COFF-3's enactment of COFF-6 (MEASUREMENTS.md 2026-08-03).
   * The original assertions here pinned PROVISIONAL_OOXML_SIZE_BOUND_BYTES —
   * a picked 32 MiB CONTAINER bound flagged `provisional:true`. That was
   * wrong once measured, on the METRIC and not just the number: container
   * size is a bad proxy in both directions (the 84.8 MB all-images deck vs
   * the 9.1 MB workbook holding 63.6 MB of sheet XML), so the guard now
   * reads 20 MiB of DECLARED UNCOMPRESSED TEXT-PART bytes summed from the
   * central directory before inflation, and the marker names the measured
   * constant and the metric instead of a provisional flag. */
  t("the measured bound is 20 MiB of declared uncompressed text-part bytes",
    MEASURED_OOXML_TEXT_BOUND_BYTES, 20971520);
  t("under the bound passes", sizeGuard(1024), { ok: true });
  t("exactly at the bound passes (over means OVER)", sizeGuard(MEASURED_OOXML_TEXT_BOUND_BYTES).ok, true);
  const over = sizeGuard(MEASURED_OOXML_TEXT_BOUND_BYTES + 1);
  t("one byte over is refused", over.ok, false);
  t("as text-undetermined", over.text, "undetermined");
  t("with the reason named", over.why, "over_size_bound");
  t("carrying both sizes", [over.size, over.bound], [MEASURED_OOXML_TEXT_BOUND_BYTES + 1, MEASURED_OOXML_TEXT_BOUND_BYTES]);
  t("NAMING the measured constant", over.boundName, "MEASURED_OOXML_TEXT_BOUND_BYTES");
  t("and NAMING the metric — declared uncompressed text-part bytes, not container size",
    over.metric, "declared_uncompressed_text_part_bytes");
  const custom = sizeGuard(200, 100);
  t("the bound stays a parameter (a future re-measurement swaps the number, not the plumbing)",
    [custom.ok, custom.bound], [false, 100]);

  /* The metric's own plumbing: declared sizes summed from the CENTRAL
   * DIRECTORY (before inflation), over the caller's text-part predicate. */
  const wb = ooxmlFixture("xlsx", [
    { name: "xl/worksheets/sheet1.xml", data: "<worksheet><sheetData/></worksheet>" },
    { name: "xl/sharedStrings.xml", data: "<sst><si><t>hello</t></si></sst>" },
    { name: "xl/media/image1.png", data: Buffer.from([0x89, 0x50, 0x4e, 0x47]), store: true },
  ]);
  const c = readContainer(wb);
  const isText = (n) => /^xl\/(worksheets\/sheet\d+\.xml|sharedStrings\.xml)$/.test(n);
  const d = declaredTextBytes(c, isText);
  t("declaredTextBytes sums ONLY the text parts, from declared uncompressed sizes",
    d.total, "<worksheet><sheetData/></worksheet>".length + "<sst><si><t>hello</t></si></sst>".length);
  t("naming each part it measured", d.parts.map((p) => p.name).sort(),
    ["xl/sharedStrings.xml", "xl/worksheets/sheet1.xml"]);
  t("and the image contributed nothing (the COFF-6 finding: text cost, not container cost)",
    d.parts.some((p) => p.name.includes("media")), false);
}

console.log("\n--- the module's crc32 agrees with the independent one here ---");
{
  const sample = Buffer.from("The quick brown fox jumps over the lazy dog");
  t("two independent implementations, one answer", modCrc32(sample), crc32(sample));
  t("and the known-answer vector holds", modCrc32(Buffer.from("123456789")), 0xcbf43926);
}

console.log(`\nooxml: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
