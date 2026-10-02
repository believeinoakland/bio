/* extraction: the persistence of a reading's container extent through the promotion projection and the writer (R19,
   R20) to `readingOf` and `readingFor` (R27, R30), over REAL office bytes read by the REAL registered entries (docx,
   xlsx, pptx, ods) through `Extraction#read`. The extent itself (reading-pipeline R12) is `reading-pipeline`'s since
   N513, and its cases moved there. Converts extraction's share of two legacy suites, rows
   of `build/jobs/T17/legacy-tests.md`: `test/fw19-extent-arms.test.mjs` ("acquire persists docx tables/images and
   xlsx levels on container_extent") and `test/capture-container-extent.test.mjs` ("extraction R13: docx paragraph
   count, levels per container and absent levels null, empty list null"). The old suites were deleted in T20 (K931). The
   containers are assembled here byte by byte with an independent crc32, as the old suites built them, so every
   figure below is the fixture's own ground truth. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { deflateRawSync } from "node:zlib";
import { fresh, bundle, hold, doc, sha } from "./fixture.mjs";

/* ---- independent crc32 and zip assembler (the old suites' own; nothing here imports the container reader) ---- */
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) { c ^= buf[i]; for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1; }
  return (c ^ 0xffffffff) >>> 0;
}
const u16 = (n) => Buffer.from([n & 0xff, (n >> 8) & 0xff]);
const u32 = (n) => Buffer.from([n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff]);
/* `store` writes a member uncompressed (ODF's mimetype); `declare` lies in the central directory only about the
   uncompressed size, so a small fixture reaches an entry's over-the-bound branch (capture-container-extent's device). */
function zip(files) {
  const locals = [], centrals = [];
  let offset = 0;
  for (const f of files) {
    const name = Buffer.from(f.name, "utf-8");
    const data = Buffer.isBuffer(f.data) ? f.data : Buffer.from(f.data, "utf-8");
    const comp = f.store ? data : deflateRawSync(data), method = f.store ? 0 : 8, crc = crc32(data);
    const declared = Number.isInteger(f.declare) ? f.declare : data.length;
    const local = Buffer.concat([u32(0x04034b50), u16(20), u16(0x0800), u16(method), u16(0), u16(0x21),
      u32(crc), u32(comp.length), u32(data.length), u16(name.length), u16(0), name, comp]);
    centrals.push(Buffer.concat([u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(method), u16(0), u16(0x21),
      u32(crc), u32(comp.length), u32(declared), u16(name.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset), name]));
    locals.push(local); offset += local.length;
  }
  const cd = Buffer.concat(centrals);
  return new Uint8Array(Buffer.concat([...locals, cd,
    u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length), u32(cd.length), u32(offset), u16(0)]));
}
const TYPES = (over) => `<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>${over}</Types>`;
const RELS = (inner = "") => `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${inner}</Relationships>`;
const REL = (id, type, target) => `<Relationship Id="${id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/${type}" Target="${target}"/>`;

/* ---- workbooks (xlsx) ---- */
const XLSX_CT = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const sheetXml = (rows) => `<?xml version="1.0"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>`
  + rows.map((cells, i) => `<row r="${i + 1}">` + cells.map((v, j) => `<c r="${String.fromCharCode(65 + j)}${i + 1}" t="inlineStr"><is><t>${v}</t></is></c>`).join("") + `</row>`).join("")
  + `</sheetData></worksheet>`;
const workbook = (sheets) => zip([
  { name: "[Content_Types].xml", data: TYPES(`<Override PartName="/xl/workbook.xml" ContentType="${XLSX_CT}.main+xml"/>`) },
  { name: "_rels/.rels", data: RELS(REL("rId1", "officeDocument", "xl/workbook.xml")) },
  { name: "xl/workbook.xml", data: `<?xml version="1.0"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>`
      + sheets.map(([n], i) => `<sheet name="${n}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join("") + `</sheets></workbook>` },
  { name: "xl/_rels/workbook.xml.rels", data: RELS(sheets.map((_, i) => REL(`rId${i + 1}`, "worksheet", `worksheets/sheet${i + 1}.xml`)).join("")) },
  ...sheets.map(([, rows], i) => ({ name: `xl/worksheets/sheet${i + 1}.xml`, data: sheetXml(rows) })),
]);
/* capture-container-extent's workbook: three named sheets of known used ranges */
const SHEETS = [["Summary", [["Department", "FY26 Adopted"], ["Police", "2200000"], ["Fire", "2000000"]]],
                ["Detail", [["Fund 1010", "General Purpose Fund"]]], ["Reconciliation", [["Reconciliation notes"]]]];
const XLSX = workbook(SHEETS);

/* ---- word-processing documents (docx) ---- */
const DOCX_CT = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const W = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"';
const wp = (s) => `<w:p><w:r><w:t>${s}</w:t></w:r></w:p>`;
const document = (body, media = []) => zip([
  { name: "[Content_Types].xml", data: TYPES(`<Default Extension="png" ContentType="image/png"/><Override PartName="/word/document.xml" ContentType="${DOCX_CT}.main+xml"/>`) },
  { name: "_rels/.rels", data: RELS(REL("rId1", "officeDocument", "word/document.xml")) },
  { name: "word/document.xml", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<w:document ${W}><w:body>${body}</w:body></w:document>` },
  { name: "word/_rels/document.xml.rels", data: RELS() },
  ...media,
]);
/* capture-container-extent's document: a known paragraph count and nothing else in the body */
const PARAS = ["CITY OF OAKLAND", "AGENDA REPORT", "TO: Jestin D. Johnson, City Administrator",
  "SUBJECT: FY 2026-27 Midcycle Budget Amendments", "FISCAL IMPACT",
  "The proposed appropriation is $1.9 million from the General Purpose Fund.", "RECOMMENDATION", "Adopt the accompanying resolution."];
const DOCX = document(PARAS.map(wp).join(""));
/* fw19-extent-arms' document: two top-level tables, one nested in the first (ordinal 0, 1 nested, 2), one image
   member and a non-image media member beside it */
const PNG = Buffer.from("\x89PNG\r\n\x1a\nFW-19 fixture: the budget map of Council District 3", "latin1");
const tc = (inner) => `<w:tc>${inner}</w:tc>`;
const NESTED = `<w:tbl><w:tblGrid><w:gridCol/></w:tblGrid><w:tr>${tc(wp("nested"))}</w:tr></w:tbl>`;
const TABLE0 = `<w:tbl><w:tblGrid><w:gridCol/><w:gridCol/><w:gridCol/></w:tblGrid>`
  + `<w:tr>${tc(NESTED + wp("Fund"))}${tc(wp("FY26"))}${tc(wp("FY27"))}</w:tr><w:tr>${tc(wp("1010"))}${tc(wp("2.2M"))}${tc(wp("2.0M"))}</w:tr></w:tbl>`;
const TABLE2 = `<w:tbl><w:tblGrid><w:gridCol/><w:gridCol/></w:tblGrid>`
  + [1, 2, 3, 4].map((r) => `<w:tr>${tc(wp(`r${r}a`))}${tc(wp(`r${r}b`))}</w:tr>`).join("") + `</w:tbl>`;
const DOCX_TABLES = [{ rows: 2, cols: 3 }, { rows: 1, cols: 1 }, { rows: 4, cols: 2 }];
const TABLED = document(wp("AGENDA REPORT") + TABLE0 + wp("Between the tables.") + TABLE2 + wp("End."),
  [{ name: "word/media/image1.png", data: PNG }, { name: "word/media/briefing.wav", data: "RIFF not an image" }]);

/* ---- decks (pptx) ---- */
const PPTX_CT = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
const NS = 'xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';
const slideXml = (title, n) => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<p:sld ${NS}><p:cSld><p:spTree>`
  + `<p:sp><p:txBody><a:p><a:r><a:t>${title}</a:t></a:r></a:p></p:txBody></p:sp>`
  + Array.from({ length: n - 1 }, (_, k) => `<p:sp><p:txBody><a:p><a:r><a:t>Line ${k + 1}.</a:t></a:r></a:p></p:txBody></p:sp>`).join("")
  + `</p:spTree></p:cSld></p:sld>`;
/* `shapes[i]` shapes on slide i+1; the part for slide `missing` is left out of the zip (declared everywhere else) */
const deck = (titles, shapes, { missing = 0, declare = {} } = {}) => zip([
  { name: "[Content_Types].xml", data: TYPES(`<Override PartName="/ppt/presentation.xml" ContentType="${PPTX_CT}.main+xml"/>`
      + titles.map((_, i) => `<Override PartName="/ppt/slides/slide${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`).join("")) },
  { name: "_rels/.rels", data: RELS(REL("rId1", "officeDocument", "ppt/presentation.xml")) },
  { name: "ppt/presentation.xml", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<p:presentation ${NS}><p:sldIdLst>`
      + titles.map((_, i) => `<p:sldId id="${256 + i}" r:id="rId${i + 2}"/>`).join("") + `</p:sldIdLst></p:presentation>` },
  { name: "ppt/_rels/presentation.xml.rels", data: RELS(titles.map((_, i) => REL(`rId${i + 2}`, "slide", `slides/slide${i + 1}.xml`)).join("")) },
  ...titles.flatMap((t, i) => (i + 1 === missing ? [] : [
    { name: `ppt/slides/slide${i + 1}.xml`, data: slideXml(t, shapes[i]), declare: declare[i + 1] },
    { name: `ppt/slides/_rels/slide${i + 1}.xml.rels`, data: RELS() }])),
]);
const PPTX = deck(["FY 2026-27 PROPOSED MIDCYCLE BUDGET", "GENERAL PURPOSE FUND OUTLOOK", "FISCAL IMPACT"], [2, 2, 2]);
const PPTX_GAPPED = deck(["MIDCYCLE OVERVIEW", "THE SLIDE THIS CAPTURE CANNOT READ", "GENERAL PURPOSE FUND RECONCILIATION"], [2, null, 4], { missing: 2 });

/* ---- OpenDocument (ods) ---- */
const ODF_NS = ['xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"', 'xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"',
  'xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"', 'xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0"'].join(" ");
const manifest = (ct) => `<?xml version="1.0" encoding="UTF-8"?><manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2"><manifest:file-entry manifest:full-path="/" manifest:version="1.2" manifest:media-type="${ct}"/><manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/></manifest:manifest>`;
const odf = (ct, body, extra = []) => zip([
  { name: "mimetype", data: ct, store: true },
  { name: "META-INF/manifest.xml", data: manifest(ct) },
  { name: "content.xml", data: `<?xml version="1.0" encoding="UTF-8"?><office:document-content ${ODF_NS} office:version="1.3"><office:automatic-styles/><office:body>${body}</office:body></office:document-content>` },
  { name: "styles.xml", data: `<?xml version="1.0"?><office:document-styles ${ODF_NS}/>` },
  ...extra,
]);
const ODS_CT = "application/vnd.oasis.opendocument.spreadsheet";
const odsCell = (v) => `<table:table-cell office:value-type="string"><text:p>${v}</text:p></table:table-cell>`;
/* capture-container-extent's .ods: one sheet, used range two rows of two cells */
const ODS = odf(ODS_CT, `<office:spreadsheet><table:table table:name="Appropriations"><table:table-row>${odsCell("Department")}${odsCell("FY26 Adopted")}</table:table-row>`
  + `<table:table-row>${odsCell("Police")}${odsCell("2200000")}</table:table-row></table:table></office:spreadsheet>`);

/* Holds the bytes and reads them through the registered entry for `format`, as capture's acquire answer names it. */
async function readAs(w, bytes, format, ct, extra = {}) {
  const d = await hold(w.evidence, bytes);
  const out = await w.x.read(doc({ digest: d, bytes: bytes.length, ct, format, headers: [["content-type", ct]], ...extra }));
  return { digest: d, ...out };
}

test("R19 R20 R27 R30 (capture-container-extent §2, fw19-extent-arms §1): a reading promoted through the projection is persisted with its container extent whole: readingOf and readingFor answer exactly the extent read, the capture format with it", async () => {
  const w = fresh();
  bundle(w.s, "B-1");
  const read = [];
  for (const [bytes, format, ct] of [[XLSX, "xlsx", XLSX_CT], [DOCX, "docx", DOCX_CT], [PPTX, "pptx", PPTX_CT],
                                     [TABLED, "docx", DOCX_CT], [PPTX_GAPPED, "pptx", PPTX_CT], [ODS, "ods", ODS_CT]]) {
    const r = await readAs(w, bytes, format, ct);
    read.push({ ...r, format });
  }
  const provenance = { documents: read.map((r) => ({ capture: { sha256: r.digest }, reading: r.reading,
    profile: { format: { format: r.format } }, text_units: r.text_units })) };
  w.prom.steps[0].project({ bundleId: "B-1", author: "member:m1", files: [{ path: "data/provenance.json", text: JSON.stringify(provenance) }] });
  for (const r of read) {
    const of = w.x.readingOf(r.digest);
    assert.deepEqual(of.containerExtent, r.reading.container_extent, r.format);
    assert.equal(of.captureFormat, r.format);
    assert.equal(of.pageCount, null);
    const f = w.x.readingFor(r.digest, "class:admin");
    assert.equal(f.found, true);
    assert.deepEqual(f.reading.container_extent, r.reading.container_extent);
  }
  /* the persisted figures are the fixtures' own */
  assert.deepEqual(w.x.readingOf(read[0].digest).containerExtent.sheets.map((s) => s.name), SHEETS.map(([n]) => n));
  assert.equal(w.x.readingOf(read[1].digest).containerExtent.paragraphs, PARAS.length);
  assert.equal(w.x.readingOf(read[2].digest).containerExtent.slides.length, 3);
  assert.deepEqual(w.x.readingOf(read[3].digest).containerExtent.tables, DOCX_TABLES);
  assert.deepEqual(w.x.readingOf(read[4].digest).containerExtent.slides, [{ shapes: 2 }, { shapes: null }, { shapes: 4 }]);
  assert.equal(w.x.readingOf(read[5].digest).containerExtent.sheets[0].rows, null);
});

test("R30 R45 (capture-container-extent §5): a capture whose reading never recorded a container extent reads it absent, never null or empty", async () => {
  const w = fresh();
  bundle(w.s, "B-1");
  const S = sha("a workbook captured before CAP-12");
  w.prom.steps[0].project({ bundleId: "B-1", author: "member:m1", files: [{ path: "data/provenance.json", text: JSON.stringify({ documents: [
    { capture: { sha256: S }, reading: { content_type: "meeting_calendar", reader_version: 1, found: false, at: "2026-09-14T00:00:00Z",
                                         entities: [], facts: {}, text_source: [{ step: "layer" }] } }] }) }] });
  const of = w.x.readingOf(S);
  assert.ok(of);
  assert.equal("containerExtent" in of, false);
});
