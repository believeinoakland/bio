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
 * the size guard's stated text-undetermined, and ODF-designed-for (the
 * flavour table is a parameter — a custom part-map discriminates without
 * touching the module).
 */
/* NEGATIVE CONTROL: in discriminate(), right after the readContainer ok-check, insert `return { ok:true, format: flavours[0].flavour, mainPart:null, confidence:"high", signals }` (skipping the [Content_Types].xml + main-part discrimination) -> the plain-ZIP assertion fails (zip expected, docx got), with the renamed-ZIP, declared-main-part-absent, OPC-unrecognized and xlsx/pptx discrimination assertions. RUN 2026-08-03: 13 of 97 failed; the container-walk, round-trip, rels, core-props and size-guard assertions still passed; restored -> 97 pass 0 fail. */

import {
  MEASURED_OOXML_TEXT_BOUND_BYTES, declaredTextBytes, sizeGuard, crc32 as modCrc32,
  hasZipMagic, normalizePartName, readContainer, readPart,
  CONTENT_TYPES_PART, parseContentTypes, partContentType,
  OOXML_FLAVOURS, discriminate,
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

console.log("\n--- ODF is DESIGNED FOR: the flavour table is a PARAMETER, not a rewrite ---");
{
  /* A custom part-map row discriminates a format this module never heard of —
   * the exact extension point an ODF entry (or the vsdx above) would use. */
  const table = [{ flavour: "vsdx", mainContentType: "application/vnd.ms-visio.drawing.main+xml", conventionalMainPart: "visio/document.xml" }];
  const vsdx = zip([
    { name: "[Content_Types].xml", data: `<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Override PartName="/visio/document.xml" ContentType="application/vnd.ms-visio.drawing.main+xml"/></Types>` },
    { name: "visio/document.xml", data: "<VisioDocument/>" },
  ]);
  t("a caller-supplied part-map discriminates it", (await discriminate(vsdx, null, table)).format, "vsdx");
  t("the built-in table stays the three OOXML flavours",
    OOXML_FLAVOURS.map((f) => f.flavour), ["docx", "xlsx", "pptx"]);
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
