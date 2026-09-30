/* content: the extent arms, their container bounds and the rows minted over them, converted from the legacy suites
   `content-extent-arms`, `content-extent`, `capture-container-extent` and `fw19-extent-arms` (content's share only;
   the leg grammar's C-2.8 relay and the carry-forward are inquiry's, the acquire wire extraction's and capture's).
   Everything is driven at content's interface: `contentOf` through the fixture's `world()`, with extraction's facts
   supplied by `w.read`, and the pure grammar exports. The registered office entries (`formats.mjs`) are asked only
   for the human form each producer builds, to measure R2's parity against. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { deflateRawSync, crc32 } from "node:zlib";
import { world, V, LAYER, provDoc, infoMd } from "./fixture.mjs";
import {
  CONTENT_EXTENT_CHECKS, CONTENT_EXTENT_OWN_CHECKS, CONTENT_EXTENT_A1_RE, canonicalExtent, describeExtent,
  contentIdFor, citationExtent, checkContentExtent,
} from "../../../src/content/index.mjs";
import { sha256HexSync, canonicalJson } from "../../../checks/bio-checks.mjs";
import { getFormat } from "../../../src/formats.mjs";

const BOOK = "INFO-2026-8500-workbook", TEXT = "INFO-2026-8500-document", DECK = "INFO-2026-8500-deck";
const hex64 = /^[0-9a-f]{64}$/;
const code = (r) => (r && r.ok === false ? r.code : "OK");

/** A world holding one captured document per id, each read with `facts` (a chain and no page set by default: the
 *  shape an office capture has). */
function office(docs) {
  const w = world();
  const caps = {};
  for (const [id, facts] of Object.entries(docs)) {
    const c = w.cap(id);
    w.doc(id, [c]);
    w.read(c.sha, { chain: LAYER, pageCount: null, ...facts });
    caps[id] = c.sha;
  }
  const mint = (id, extent, mintedBy = V("bo")) => w.content.mint({ bundleId: id, captureSha: caps[id], extent, mintedBy });
  return { w, caps, mint };
}

/* ---- a minimal zip, for the registered office entries' own human forms (R2's parity) ---- */
const u16 = (n) => Buffer.from([n & 0xff, (n >> 8) & 0xff]);
const u32 = (n) => { const b = Buffer.alloc(4); b.writeUInt32LE(n >>> 0); return b; };
function zip(files) {
  const locals = [], centrals = [];
  let off = 0;
  for (const f of files) {
    const name = Buffer.from(f.name), data = Buffer.from(f.data), comp = deflateRawSync(data), crc = crc32(data);
    const local = Buffer.concat([u32(0x04034b50), u16(20), u16(0x0800), u16(8), u16(0), u16(0x21), u32(crc),
      u32(comp.length), u32(data.length), u16(name.length), u16(0), name, comp]);
    centrals.push(Buffer.concat([u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(8), u16(0), u16(0x21), u32(crc),
      u32(comp.length), u32(data.length), u16(name.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(off), name]));
    locals.push(local); off += local.length;
  }
  const cd = Buffer.concat(centrals);
  return new Uint8Array(Buffer.concat([...locals, cd, u32(0x06054b50), u16(0), u16(0), u16(files.length),
    u16(files.length), u32(cd.length), u32(off), u16(0)]));
}
const RELS = "http://schemas.openxmlformats.org/package/2006/relationships";
const OFFDOC = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
const typesXml = (overrides, extra = "") => `<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">`
  + `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>`
  + `<Default Extension="xml" ContentType="application/xml"/>${extra}`
  + overrides.map(([p, ct]) => `<Override PartName="${p}" ContentType="${ct}"/>`).join("") + `</Types>`;
const rootRels = (target) => `<?xml version="1.0"?><Relationships xmlns="${RELS}"><Relationship Id="rId1" Type="${OFFDOC}/officeDocument" Target="${target}"/></Relationships>`;
const emptyRels = `<?xml version="1.0"?><Relationships xmlns="${RELS}"/>`;

const PNG = Buffer.from("\x89PNG\r\n\x1a\nconverts-extent fixture: a map", "latin1");
const PNG_SHA = createHash("sha256").update(PNG).digest("hex");
const wp = (s) => `<w:p><w:r><w:t>${s}</w:t></w:r></w:p>`;
const wtc = (s) => `<w:tc>${wp(s)}</w:tc>`;
const DOCX = zip([
  { name: "[Content_Types].xml", data: typesXml([["/word/document.xml", "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"]],
      `<Default Extension="png" ContentType="image/png"/>`) },
  { name: "_rels/.rels", data: rootRels("word/document.xml") },
  { name: "word/document.xml", data: `<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>`
      + wp("AGENDA REPORT") + wp("FISCAL IMPACT")
      + `<w:tbl><w:tblGrid><w:gridCol/><w:gridCol/><w:gridCol/></w:tblGrid><w:tr>${wtc("Fund")}${wtc("FY26")}${wtc("FY27")}</w:tr><w:tr>${wtc("1010")}${wtc("2.2M")}${wtc("2.0M")}</w:tr></w:tbl>`
      + wp("Between.")
      + `<w:tbl><w:tblGrid><w:gridCol/><w:gridCol/></w:tblGrid>${[1, 2, 3, 4].map((r) => `<w:tr>${wtc(`r${r}a`)}${wtc(`r${r}b`)}</w:tr>`).join("")}</w:tbl>`
      + wp("End.") + `</w:body></w:document>` },
  { name: "word/_rels/document.xml.rels", data: emptyRels },
  { name: "word/media/image1.png", data: PNG },
]);
const sheetXml = (rows) => `<?xml version="1.0"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>`
  + rows.map((cells, i) => `<row r="${i + 1}">` + cells.map((v, j) => `<c r="${String.fromCharCode(65 + j)}${i + 1}" t="inlineStr"><is><t>${v}</t></is></c>`).join("") + `</row>`).join("")
  + `</sheetData></worksheet>`;
const SHEETS = [["Summary", [["Department", "FY26"], ["Police", "2.2M"], ["Fire", "2.0M"]]], ["Detail", [["Fund 1010"]]]];
const XLSX = zip([
  { name: "[Content_Types].xml", data: typesXml([["/xl/workbook.xml", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"]]) },
  { name: "_rels/.rels", data: rootRels("xl/workbook.xml") },
  { name: "xl/workbook.xml", data: `<?xml version="1.0"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="${OFFDOC}"><sheets>`
      + SHEETS.map(([n], i) => `<sheet name="${n}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join("") + `</sheets></workbook>` },
  { name: "xl/_rels/workbook.xml.rels", data: `<?xml version="1.0"?><Relationships xmlns="${RELS}">`
      + SHEETS.map((_, i) => `<Relationship Id="rId${i + 1}" Type="${OFFDOC}/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join("") + `</Relationships>` },
  ...SHEETS.map(([, rows], i) => ({ name: `xl/worksheets/sheet${i + 1}.xml`, data: sheetXml(rows) })),
]);
const PNS = 'xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"';
const SHAPES = [2, 3];
const PPTX = zip([
  { name: "[Content_Types].xml", data: typesXml([["/ppt/presentation.xml", "application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"],
      ...SHAPES.map((_, i) => [`/ppt/slides/slide${i + 1}.xml`, "application/vnd.openxmlformats-officedocument.presentationml.slide+xml"])]) },
  { name: "_rels/.rels", data: rootRels("ppt/presentation.xml") },
  { name: "ppt/presentation.xml", data: `<?xml version="1.0"?><p:presentation ${PNS} xmlns:r="${OFFDOC}"><p:sldIdLst>`
      + SHAPES.map((_, i) => `<p:sldId id="${256 + i}" r:id="rId${i + 2}"/>`).join("") + `</p:sldIdLst></p:presentation>` },
  { name: "ppt/_rels/presentation.xml.rels", data: `<?xml version="1.0"?><Relationships xmlns="${RELS}">`
      + SHAPES.map((_, i) => `<Relationship Id="rId${i + 2}" Type="${OFFDOC}/slide" Target="slides/slide${i + 1}.xml"/>`).join("") + `</Relationships>` },
  ...SHAPES.flatMap((n, i) => [
    { name: `ppt/slides/slide${i + 1}.xml`, data: `<?xml version="1.0"?><p:sld ${PNS}><p:cSld><p:spTree>`
        + Array.from({ length: n }, (_, k) => `<p:sp><p:txBody><a:p><a:r><a:t>s${i}${k}</a:t></a:r></a:p></p:txBody></p:sp>`).join("")
        + `</p:spTree></p:cSld></p:sld>` },
    { name: `ppt/slides/_rels/slide${i + 1}.xml.rels`, data: emptyRels }]),
]);
const produced = async (format, bytes) => {
  const e = getFormat(format);
  try { return await e.text(await e.parts(bytes)); } catch { return e.text(bytes); }
};

/* ===================================================================== */

test("R12, R2, R3 (content-extent-arms): sheet-cell, doc-para and slide-shape rows mint over an office capture with a chain and no page set, and read back with their fields, derived ref, chain and a null page_count", () => {
  const { w, caps, mint } = office({ [BOOK]: { captureFormat: "xlsx" }, [TEXT]: { captureFormat: "docx" }, [DECK]: { captureFormat: "pptx" } });
  const cell = mint(BOOK, { kind: "sheet-cell", sheet: "Sheet1", cell: "B14" });
  const para = mint(TEXT, { kind: "doc-para", para: 11 });
  const shape = mint(DECK, { kind: "slide-shape", slide: 7, shape: 3 });
  for (const m of [cell, para, shape]) { assert.equal(m.ok, true, JSON.stringify(m)); assert.equal(m.minted, true); assert.match(m.content_id, hex64); }
  assert.equal(w.count("content"), 3);
  assert.equal(w.row(`SELECT count(*) AS n FROM content WHERE stale=1`).n, 0);
  assert.equal(cell.content_id, contentIdFor(caps[BOOK], { kind: "sheet-cell", sheet: "Sheet1", cell: "B14" }, LAYER));
  const read = (id) => w.content.contentRead({ id, viewer: V("bo") });
  const rc = read(cell.content_id), rp = read(para.content_id), rs = read(shape.content_id);
  assert.deepEqual([rc.ok, rc.extent_kind, rc.extent.sheet, rc.extent.cell, rc.ref], [true, "sheet-cell", "Sheet1", "B14", "Sheet1!B14"]);
  assert.equal(rc.page_count, null, "a spreadsheet has no page set, and one is never invented");
  assert.deepEqual(rc.chain, LAYER, "the capture's chain as it stood at mint");
  assert.deepEqual([rp.ok, rp.extent_kind, rp.extent.para, rp.page_count, rp.ref], [true, "doc-para", 11, null, "¶12"]);
  assert.deepEqual([rs.ok, rs.extent_kind, rs.extent.slide, rs.extent.shape, rs.ref], [true, "slide-shape", 7, 3, "slide 7"]);
  assert.equal(w.content.contentRow(cell.content_id).says, "Sheet1!B14, as this record holds it");
});

test("R2, R12 (content-extent-arms, fw19-extent-arms): the derived human form IS each producer's own ref, and every address the registered office entries emit mints against the bounds built from their own figures", async () => {
  const d = await produced("docx", DOCX), x = await produced("xlsx", XLSX), p = await produced("pptx", PPTX);
  /* the fixtures armed: the producers emitted what they were built with */
  assert.ok(d.paragraphs.length >= 4);
  assert.deepEqual([d.tables.map((t) => [t.rows, t.cols]), d.images.map((i) => i.part)], [[[2, 3], [4, 2]], [PNG_SHA]]);
  assert.deepEqual(x.sheets.map((s) => s.range.ref), ["Summary!A1:B3", "Detail!A1:A1"]);
  assert.deepEqual(p.slides.map((s) => s.shapes), SHAPES);
  /* parity, unit by unit: the producer's address described by content is the producer's own ref */
  const units = [
    ...d.paragraphs.map((u) => [{ kind: "doc-para", para: u.para }, u.ref]),
    ...d.tables.map((u) => [{ kind: "doc-table", table: u.table }, u.ref]),
    ...d.images.map((u) => [{ kind: "image", part: u.part }, u.ref]),
    ...x.sheets.map((s) => [{ kind: "sheet-range", sheet: s.range.sheet, range: s.range.range }, s.range.ref]),
    ...p.slides.map((u) => [{ kind: "slide-shape", slide: u.slide }, u.ref]),
  ];
  assert.ok(units.length >= 10, `corpus: ${units.length} units`);
  for (const [e, ref] of units) assert.equal(describeExtent(e), ref, JSON.stringify(e));
  assert.equal(describeExtent({ kind: "sheet-cell", sheet: "Sheet1", cell: "B14" }), "Sheet1!B14");
  assert.equal(describeExtent({ kind: "doc-table", table: 1, cell: "B4" }), "table 2, B4");
  /* and each mints over the capture whose context carries the producer's own figures, the row's ref the producer's */
  const { w, mint } = office({
    [TEXT]: { captureFormat: "docx", containerExtent: { container: "docx", levels: ["paragraphs", "tables", "images"],
      paragraphs: d.paragraphs.length, tables: d.tables.map(({ rows, cols }) => ({ rows, cols })), images: d.images.map(({ part, mime }) => ({ part, mime })) } },
    [BOOK]: { captureFormat: "xlsx", containerExtent: { container: "xlsx", levels: ["sheets", "images"],
      sheets: x.sheets.map(({ name, rows, cols, usedRows, usedCols }) => ({ name, rows, cols, usedRows, usedCols })), images: x.images } },
    [DECK]: { captureFormat: "pptx", containerExtent: { container: "pptx", levels: ["slides", "images"],
      slides: p.slides.map(({ slide, shapes }) => ({ slide, shapes })), images: p.images } },
  });
  for (const [e, ref] of units) {
    const id = e.kind === "sheet-range" ? BOOK : e.kind === "slide-shape" ? DECK : TEXT;
    const m = mint(id, e);
    assert.equal(m.ok, true, `${JSON.stringify(e)}: ${JSON.stringify(m)}`);
    assert.equal(w.content.contentRow(m.content_id).ref, ref);
  }
});

test("R3, R13 (content-extent-arms): one address is one row per arm and two addresses two: $B$14, b14 and B14 are one cell; another cell, sheet, paragraph, run, shape or a whole slide is another row", () => {
  const { w, mint } = office({ [BOOK]: {}, [TEXT]: {}, [DECK]: {} });
  const cell = mint(BOOK, { kind: "sheet-cell", sheet: "Sheet1", cell: "B14" });
  for (const spelling of ["$B$14", "b14", "B14", "$b14"]) {
    const again = mint(BOOK, { kind: "sheet-cell", sheet: "Sheet1", cell: spelling }, V("cy"));
    assert.deepEqual([again.content_id, again.minted], [cell.content_id, false], spelling);
  }
  const other = (id, e, than) => { const m = mint(id, e); assert.equal(m.minted, true, JSON.stringify(e)); assert.notEqual(m.content_id, than, JSON.stringify(e)); return m; };
  other(BOOK, { kind: "sheet-cell", sheet: "Sheet1", cell: "C14" }, cell.content_id);
  other(BOOK, { kind: "sheet-cell", sheet: "Sheet2", cell: "B14" }, cell.content_id);
  const para = mint(TEXT, { kind: "doc-para", para: 11 });
  other(TEXT, { kind: "doc-para", para: 12 }, para.content_id);
  const run = other(TEXT, { kind: "doc-para", para: 11, run: 2 }, para.content_id);
  assert.deepEqual([w.content.contentRow(run.content_id).ref, w.content.contentRow(para.content_id).ref], ["¶12", "¶12"],
    "a run is in the address and not in the human form");
  const shape = mint(DECK, { kind: "slide-shape", slide: 7, shape: 3 });
  other(DECK, { kind: "slide-shape", slide: 7, shape: 4 }, shape.content_id);
  const whole = other(DECK, { kind: "slide-shape", slide: 7 }, shape.content_id);
  assert.notEqual(whole.content_id, mint(DECK, { kind: "slide-shape", slide: 7, shape: 0 }).content_id, "a whole slide is not shape 0");
  assert.equal(w.count("content"), 10);
});

test("R2, R5 (content-extent-arms): each arm's canonical form is over its own fixed fields, absent as null and never missing; citationExtent reads each arm's own flattened fields and no others", () => {
  assert.equal(canonicalExtent({ kind: "sheet-cell", sheet: "S", cell: "B1" }), '{"cell":"B1","kind":"sheet-cell","sheet":"S"}');
  assert.equal(canonicalExtent({ kind: "doc-para", para: 4 }), '{"kind":"doc-para","para":4,"run":null}');
  assert.equal(canonicalExtent({ kind: "slide-shape", slide: 2 }), '{"kind":"slide-shape","shape":null,"slide":2}');
  assert.deepEqual(citationExtent({ extent_kind: "doc-para", extent_para: 4, extent_cell: "B1" }), { kind: "doc-para", para: 4 });
  assert.deepEqual(citationExtent({ extent_kind: "sheet-cell", extent_sheet: "S", extent_cell: "B1", extent_para: 9 }),
    { kind: "sheet-cell", sheet: "S", cell: "B1" });
  assert.equal(canonicalExtent(citationExtent({ extent_kind: "document", extent_page: 4, extent_ref: "x" })), canonicalExtent({ kind: "document" }));
});

test("R1, R7 (content-extent-arms): an address that is not one is refused C-45.3 by name and mints nothing; a well-formed one is not refused for want of a container; a chainless capture refuses each arm C-45.2 naming the part", () => {
  const { w, caps, mint } = office({ [BOOK]: {}, [TEXT]: {}, [DECK]: {} });
  const shapeBad = [
    [BOOK, { kind: "sheet-cell", cell: "B14" }, /names which sheet/],
    [BOOK, { kind: "sheet-cell", sheet: "Sheet1", cell: "14B" }, /A1 notation/],
    [TEXT, { kind: "doc-para", para: "two" }, /0-based integer/],
    [TEXT, { kind: "doc-para" }, /names which paragraph/],
    [TEXT, { kind: "doc-para", para: 1, run: "x" }, /run is a 0-based integer or absent/],
    [DECK, { kind: "slide-shape", shape: 2 }, /names which slide/],
    [DECK, { kind: "slide-shape", slide: 1, shape: -1 }, /./],
  ];
  for (const [id, e, why] of shapeBad) {
    const r = mint(id, e);
    assert.deepEqual([r.ok, r.code, r.check], [false, "CONTENT_EXTENT_UNREADABLE", "C-45.3"], JSON.stringify(e));
    assert.match(r.detail, why);
    assert.equal(r.translation, CONTENT_EXTENT_CHECKS.CONTENT_EXTENT_UNREADABLE.translation);
  }
  assert.equal(w.count("content"), 0, "no refused address minted anything");
  /* the admitted neighbours: well-formed, and no container held to bound them */
  for (const [id, e] of [[BOOK, { kind: "sheet-cell", sheet: "S", cell: "B14" }], [TEXT, { kind: "doc-para", para: 3 }],
                         [DECK, { kind: "slide-shape", slide: 1, shape: 0 }]])
    assert.equal(mint(id, e).ok, true, JSON.stringify(e));
  /* a capture the record holds and never read: every arm is an address into text nobody produced */
  const UNREAD = "INFO-2026-8500-unread";
  const u = w.cap("unread"); w.doc(UNREAD, [u]); w.read(u.sha, { chain: null });
  const errs = w.content.citationRefusals([
    { target: UNREAD, extent_kind: "sheet-cell", extent_sheet: "Sheet1", extent_cell: "B14" },
    { target: UNREAD, extent_kind: "doc-para", extent_para: 0 },
    { target: UNREAD, extent_kind: "slide-shape", extent_slide: 1 },
    { target: UNREAD },
  ], (i) => `leg[${i}]`);
  assert.deepEqual(errs.map((e) => [e.check, e.code]), Array(3).fill(["C-45.2", "CONTENT_EXTENT_NO_CHAIN"]));
  assert.match(errs[0].detail, /^leg\[0\].*Sheet1!B14/);
  void caps;
});

test("R7 (content-extent-arms, capture-container-extent): the container refusals are C-45.1 with the figure in detail, and every bound is inclusive: the last sheet row and column, paragraph and shape admitted, one past refused", () => {
  const { w, mint } = office({
    [BOOK]: { captureFormat: "xlsx", containerExtent: { container: "xlsx", levels: ["sheets", "images"], images: [],
      sheets: [{ name: "Sheet1", rows: 20, cols: 5 }, { name: "Sheet2", rows: 3, cols: 3 }] } },
    [TEXT]: { captureFormat: "docx", containerExtent: { container: "docx", levels: ["paragraphs", "tables", "images"], paragraphs: 12, tables: [], images: [] } },
    [DECK]: { captureFormat: "pptx", containerExtent: { container: "pptx", levels: ["slides", "images"], images: [],
      slides: [{ slide: 1, shapes: 4 }, { slide: 2, shapes: 4 }, { slide: 3, shapes: 4 }] } },
  });
  const refused = (id, e, detail) => {
    const r = mint(id, e);
    assert.deepEqual([r.ok, r.code, r.check], [false, "CONTENT_EXTENT_OUT_OF_RANGE", "C-45.1"], JSON.stringify(e));
    assert.match(r.detail, detail, JSON.stringify(e));
  };
  const admitted = (id, e) => assert.equal(mint(id, e).ok, true, JSON.stringify(e));
  refused(BOOK, { kind: "sheet-cell", sheet: "Budget", cell: "B14" }, /holds 2 sheet\(s\) \(Sheet1, Sheet2\).*a sheet called 'Budget'/);
  refused(BOOK, { kind: "sheet-cell", sheet: "Sheet1", cell: "B21" }, /holds 20 row\(s\) \(1-20\).*names row 21/);
  refused(BOOK, { kind: "sheet-cell", sheet: "Sheet1", cell: "F1" }, /holds 5 column\(s\).*names column 6/);
  admitted(BOOK, { kind: "sheet-cell", sheet: "Sheet1", cell: "E20" });
  refused(BOOK, { kind: "sheet-cell", sheet: "Sheet2", cell: "D1" }, /sheet 'Sheet2' of this capture holds 3 column\(s\)/);
  admitted(BOOK, { kind: "sheet-cell", sheet: "Sheet2", cell: "C3" });
  refused(TEXT, { kind: "doc-para", para: 12 }, /holds 12 paragraph\(s\) \(0-11\).*names paragraph 12/);
  admitted(TEXT, { kind: "doc-para", para: 11 });
  refused(DECK, { kind: "slide-shape", slide: 2, shape: 4 }, /slide 2 of this capture holds 4 shape\(s\) \(0-3\).*names shape 4/);
  admitted(DECK, { kind: "slide-shape", slide: 2, shape: 3 });
  admitted(DECK, { kind: "slide-shape", slide: 2, shape: 0 });
  refused(DECK, { kind: "slide-shape", slide: 9999 }, /deck holds 3 slide\(s\)/);
  assert.equal(w.count("content"), 5, "every refusal wrote nothing; every admission one row");
});

test("R7, R8 (content-extent-arms, capture-container-extent): each level bounds only itself: a sheet list without dimensions bounds the sheet and not the cell, a paragraph count bounds nothing else, and with no container held an impossible address mints", () => {
  const { w, mint } = office({
    [BOOK]: { captureFormat: "xlsx", containerExtent: { container: "xlsx", levels: ["sheets", "images"], images: [], sheets: [{ name: "Sheet1" }] } },
    [TEXT]: { captureFormat: "docx", containerExtent: { container: "docx", levels: ["paragraphs"], paragraphs: 4 } },
    [DECK]: {},
  });
  assert.equal(code(mint(BOOK, { kind: "sheet-cell", sheet: "Nope", cell: "B14" })), "CONTENT_EXTENT_OUT_OF_RANGE");
  assert.equal(code(mint(BOOK, { kind: "sheet-cell", sheet: "Sheet1", cell: "ZZ999999" })), "OK", "no grid held: the cell is not bounded");
  assert.match(w.content.contentContextFor(w.content.captureFor(BOOK)).container.empty_level, /every sheet's row and column extent/);
  assert.equal(code(mint(TEXT, { kind: "doc-para", para: 99 })), "CONTENT_EXTENT_OUT_OF_RANGE");
  assert.equal(code(mint(TEXT, { kind: "slide-shape", slide: 99 })), "OK", "a paragraph count bounds no slide");
  assert.equal(code(mint(TEXT, { kind: "sheet-cell", sheet: "Any", cell: "A1" })), "OK", "nor any sheet");
  assert.equal(code(mint(BOOK, { kind: "doc-para", para: 0 })), "OK", "a workbook's missing paragraph count is not an empty level");
  /* no container held at all: the impossible-looking address mints, stated, never refused */
  const wild = mint(DECK, { kind: "sheet-cell", sheet: "NoSuchSheet", cell: "ZZ9999999" });
  const wildP = mint(DECK, { kind: "doc-para", para: 9999999 });
  assert.deepEqual([wild.ok, wild.minted, wildP.ok, wildP.minted], [true, true, true, true]);
  assert.deepEqual([w.content.contentRow(wild.content_id).page_count, w.content.contentRow(wildP.content_id).page_count], [null, null]);
  assert.match(w.content.contentContextFor(w.content.captureFor(DECK)).container.why, /UNDETERMINED/);
});

test("R7 (capture-container-extent): a cell is bounded by the format's grid and never the used range; an .ods sheet with no grid (a null bound) admits any cell of a known sheet and still refuses an unknown sheet", () => {
  const ODS = "INFO-2026-9200-odsbook";
  const { w, mint } = office({
    [BOOK]: { captureFormat: "xlsx", containerExtent: { container: "xlsx", levels: ["sheets", "images"], images: [],
      sheets: [{ name: "Summary", rows: 1048576, cols: 16384, usedRows: 3, usedCols: 2 }] } },
    [ODS]: { captureFormat: "ods", containerExtent: { container: "ods", levels: ["sheets", "images"], images: [],
      sheets: [{ name: "Appropriations", rows: null, cols: null, usedRows: 2, usedCols: 2 }] } },
  });
  const beyond = mint(BOOK, { kind: "sheet-cell", sheet: "Summary", cell: "A1048577" });
  assert.deepEqual([beyond.code, beyond.check], ["CONTENT_EXTENT_OUT_OF_RANGE", "C-45.1"]);
  assert.match(beyond.detail, /sheet 'Summary' of this capture holds 1048576 row\(s\) \(1-1048576\).*names row 1048577/);
  assert.equal(code(mint(BOOK, { kind: "sheet-cell", sheet: "Summary", cell: "A1048576" })), "OK", "the grid's last row");
  assert.equal(code(mint(BOOK, { kind: "sheet-cell", sheet: "Summary", cell: "ZZ999999" })), "OK", "inside the grid, past the used range: an empty cell exists");
  assert.equal(code(mint(BOOK, { kind: "sheet-cell", sheet: "Summary", cell: "XFD1" })), "OK");
  assert.match(mint(BOOK, { kind: "sheet-cell", sheet: "Summary", cell: "XFE1" }).detail, /holds 16384 column\(s\).*names column 16385/);
  const ods = mint(ODS, { kind: "sheet-cell", sheet: "Appropriations", cell: "A1048577" });
  assert.deepEqual([ods.ok, ods.minted], [true, true], "no grid is fixed by the format, so none is borrowed");
  const nosheet = mint(ODS, { kind: "sheet-cell", sheet: "NoSuchSheet", cell: "A1" });
  assert.deepEqual([nosheet.code, nosheet.check], ["CONTENT_EXTENT_OUT_OF_RANGE", "C-45.1"]);
  assert.match(nosheet.detail, /holds 1 sheet\(s\) \(Appropriations\).*names a sheet called 'NoSuchSheet'/);
  assert.equal(w.count("content"), 4);
});

test("R7 (capture-container-extent): a slide slot whose shape count was not read is skipped, never guessed; a read slide's shape bound is inclusive and names that slide's own count; the deck's length bounds the slides", () => {
  /* the first two slides could not be read (their counts are null); slides 3 and 4 hold two shapes each */
  const { w, mint } = office({ [DECK]: { captureFormat: "pptx", containerExtent: { container: "pptx", levels: ["slides", "images"], images: [],
    slides: [{ shapes: null }, { shapes: null }, { shapes: 2 }, { shapes: 2 }] } } });
  const unread = mint(DECK, { kind: "slide-shape", slide: 1, shape: 99 });
  assert.deepEqual([unread.ok, unread.minted], [true, true], "an unread slide's count is undetermined: skipped");
  assert.equal(code(mint(DECK, { kind: "slide-shape", slide: 3, shape: 1 })), "OK", "the last shape of a read slide");
  const past = mint(DECK, { kind: "slide-shape", slide: 3, shape: 2 });
  assert.equal(past.code, "CONTENT_EXTENT_OUT_OF_RANGE");
  assert.match(past.detail, /slide 3 of this capture holds 2 shape\(s\) \(0-1\) and the extent names shape 2/);
  const deck = mint(DECK, { kind: "slide-shape", slide: 5 });
  assert.equal(deck.code, "CONTENT_EXTENT_OUT_OF_RANGE");
  assert.match(deck.detail, /deck holds 4 slide\(s\)/, "the deck's length, not its last readable slide");
  assert.equal(w.count("content"), 2);
});

test("R7 (content-extent-arms): the A1 column is bijective base 26, swept at Z/AA, AZ/BA, ZZ/AAA and XFD; the grammar admits each in absolute and lower case and refuses what is not a cell", () => {
  const SWEEP = [["A", 1], ["B", 2], ["Z", 26], ["AA", 27], ["AB", 28], ["AZ", 52], ["BA", 53], ["ZZ", 702], ["AAA", 703], ["XFD", 16384]];
  const ctx = (cols) => ({ chain: LAYER, pageCount: null, container: { sheets: [{ name: "S", rows: 1048576, cols }] } });
  for (const [col, n] of SWEEP) {
    assert.equal(checkContentExtent({ kind: "sheet-cell", sheet: "S", cell: `${col}1` }, ctx(n)), null, `${col} is column ${n}`);
    if (n > 1) assert.match(checkContentExtent({ kind: "sheet-cell", sheet: "S", cell: `${col}1` }, ctx(n - 1)).detail,
      new RegExp(`holds ${n - 1} column\\(s\\) and the extent names column ${n}\\b`), `${col} is past column ${n - 1}`);
  }
  assert.equal(checkContentExtent({ kind: "sheet-cell", sheet: "S", cell: "XFD1048576" }, ctx(16384)), null, "XLSX's own last cell");
  for (const [col] of SWEEP)
    for (const c of [`${col}1`, `${col}1`.toLowerCase(), `$${col}$1`]) assert.ok(CONTENT_EXTENT_A1_RE.test(c), c);
  for (const c of ["", "B0", "14B", "BBBB1", "B", "1", "B1.5"]) assert.equal(CONTENT_EXTENT_A1_RE.test(c), false, JSON.stringify(c));
});

test("R7, R12 (fw19-extent-arms): sheet-range and doc-table mint in range, cited as text with their human forms, and refuse out of range C-45.1 with the figure; an unreadable range is C-45.3", () => {
  const { w, mint } = office({
    [BOOK]: { captureFormat: "xlsx", containerExtent: { container: "xlsx", levels: ["sheets", "images"], images: [],
      sheets: [{ name: "Summary", rows: 1048576, cols: 16384, usedRows: 3, usedCols: 2 }, { name: "Detail", rows: 1048576, cols: 16384, usedRows: 1, usedCols: 1 }] } },
    [TEXT]: { captureFormat: "docx", containerExtent: { container: "docx", levels: ["paragraphs", "tables", "images"], paragraphs: 7,
      tables: [{ rows: 2, cols: 3 }, { rows: 1, cols: 1 }, { rows: 4, cols: 2 }], images: [] } },
  });
  const range = mint(BOOK, { kind: "sheet-range", sheet: "Summary", range: "A1:B3" });
  const rr = w.content.contentRow(range.content_id);
  assert.deepEqual([rr.extent_kind, rr.ref, rr.extent, rr.cited_as], ["sheet-range", "Summary!A1:B3", { kind: "sheet-range", range: "A1:B3", sheet: "Summary" }, "text"]);
  assert.equal(mint(BOOK, { kind: "sheet-range", sheet: "Summary", range: "$b$3:a1" }).content_id, range.content_id, "one range, one row");
  const oob = (e, re) => { const r = mint(e.kind === "doc-table" ? TEXT : BOOK, e); assert.deepEqual([r.code, r.check], ["CONTENT_EXTENT_OUT_OF_RANGE", "C-45.1"], JSON.stringify(e)); assert.match(r.detail, re); };
  oob({ kind: "sheet-range", sheet: "NoSuchSheet", range: "A1:B3" }, /names a sheet called 'NoSuchSheet'/);
  oob({ kind: "sheet-range", sheet: "Summary", range: "A1:A1048577" }, /holds 1048576 row\(s\).*range reaches row 1048577/);
  assert.equal(code(mint(BOOK, { kind: "sheet-range", sheet: "Summary", range: "A1:A1048576" })), "OK");
  assert.equal(code(mint(BOOK, { kind: "sheet-range", sheet: "Summary", range: "C40:D90" })), "OK", "past the used range, inside the grid");
  const bad = mint(BOOK, { kind: "sheet-range", sheet: "Summary", range: "A1-B3" });
  assert.deepEqual([bad.code, bad.check], ["CONTENT_EXTENT_UNREADABLE", "C-45.3"]);
  const table = mint(TEXT, { kind: "doc-table", table: 2 });
  assert.deepEqual([table.ok, w.content.contentRow(table.content_id).ref, w.content.contentRow(table.content_id).cited_as], [true, "table 3", "text"]);
  oob({ kind: "doc-table", table: 3 }, /holds 3 table\(s\) \(0-2\) and the extent names table 3/);
  assert.equal(code(mint(TEXT, { kind: "doc-table", table: 2, cell: "B4" })), "OK", "the far corner of a 2x4 grid");
  oob({ kind: "doc-table", table: 2, cell: "C1" }, /table 2 of this capture holds 2 column\(s\) and the extent names column 3/);
  oob({ kind: "doc-table", table: 2, cell: "A5" }, /table 2 of this capture holds 4 row\(s\)/);
  assert.equal(w.count("content"), 5);
});

test("R4, R7, R12 (fw19-extent-arms): an image part the container holds mints as bytes with no chain and no cap; a part not held, or any part over a measured empty list, is C-45.1; as text on a chainless capture it is C-45.2; bytes on a paragraph is C-45.3", () => {
  const ABSENT = createHash("sha256").update("an image no container holds").digest("hex");
  const { w, caps, mint } = office({
    [TEXT]: { captureFormat: "docx", containerExtent: { container: "docx", levels: ["paragraphs", "tables", "images"], paragraphs: 3, tables: [],
      images: [{ part: PNG_SHA, mime: "image/png" }] } },
    [BOOK]: { captureFormat: "xlsx", containerExtent: { container: "xlsx", levels: ["sheets", "images"], sheets: [{ name: "S", rows: 9, cols: 9 }], images: [] } },
  });
  const img = mint(TEXT, { kind: "image", part: PNG_SHA });
  assert.deepEqual([img.ok, img.minted], [true, true], JSON.stringify(img));
  const row = w.content.contentRow(img.content_id);
  assert.deepEqual([row.extent_kind, row.cited_as, row.chain, row.derivation_cap, row.ref], ["image", "bytes", null, null, `image ${PNG_SHA.slice(0, 12)}`]);
  assert.equal(img.content_id, contentIdFor(caps[TEXT], { kind: "image", part: PNG_SHA }, null), "a bytes address ignores the chain");
  const read = w.content.contentRead({ id: img.content_id, viewer: V("bo") });
  assert.equal(read.transcription.applies, false, "the transcription axis does not apply, which is not undetermined");
  const absent = mint(TEXT, { kind: "image", part: ABSENT });
  assert.deepEqual([absent.code, absent.check], ["CONTENT_EXTENT_OUT_OF_RANGE", "C-45.1"]);
  assert.match(absent.detail, /holds 1 image\(s\) and none of them has the content hash/);
  const none = mint(BOOK, { kind: "image", part: PNG_SHA });
  assert.equal(none.code, "CONTENT_EXTENT_OUT_OF_RANGE");
  assert.match(none.detail, /holds 0 image\(s\)/, "an empty list is a measured zero, not a skip");
  const bytesPara = mint(TEXT, { kind: "doc-para", para: 0, cited_as: "bytes" });
  assert.deepEqual([bytesPara.code, bytesPara.check], ["CONTENT_EXTENT_UNREADABLE", "C-45.3"]);
  assert.match(bytesPara.detail, /only an image can be cited as its bytes/);
  /* a chainless office capture holding the image: as text refused NO_CHAIN, as bytes admitted */
  const BARE = "INFO-2026-9190-bare";
  const b = w.cap("bare"); w.doc(BARE, [b]);
  w.read(b.sha, { chain: null, captureFormat: "docx", containerExtent: { container: "docx", levels: ["images"], images: [{ part: PNG_SHA, mime: "image/png" }] } });
  const asText = w.content.mint({ bundleId: BARE, captureSha: b.sha, extent: { kind: "image", part: PNG_SHA, cited_as: "text" }, mintedBy: V("bo") });
  assert.deepEqual([asText.code, asText.check], ["CONTENT_EXTENT_NO_CHAIN", "C-45.2"]);
  assert.match(asText.detail, /nothing in this record has read text off an embedded image/);
  const asBytes = w.content.mint({ bundleId: BARE, captureSha: b.sha, extent: { kind: "image", part: PNG_SHA, cited_as: "bytes" }, mintedBy: V("bo") });
  assert.deepEqual([asBytes.ok, asBytes.minted], [true, true], "the image as itself needs no chain");
  assert.notEqual(contentIdFor("c", { kind: "image", page: 0, cited_as: "bytes" }, null), contentIdFor("c", { kind: "image", page: 0, cited_as: "text" }, null),
    "bytes and text over one image are two addresses");
  assert.equal(w.count("content"), 2);
});

test("R5, R28 (fw19-extent-arms): a citation's flattened leg fields (extent_range, extent_table, extent_cell, extent_part, extent_cited_as) are read as the extent, and resolveCitation mints exactly that row", () => {
  const { w, caps } = office({
    [TEXT]: { captureFormat: "docx", containerExtent: { container: "docx", levels: ["paragraphs", "tables", "images"], paragraphs: 3,
      tables: [{ rows: 2, cols: 3 }, { rows: 1, cols: 1 }], images: [{ part: PNG_SHA, mime: "image/png" }] } },
    [BOOK]: { captureFormat: "xlsx", containerExtent: { container: "xlsx", levels: ["sheets", "images"], images: [], sheets: [{ name: "Summary", rows: 99, cols: 9 }] } },
  });
  const cases = [
    [{ target: TEXT, extent_kind: "doc-table", extent_table: 1, extent_cell: "A1" }, { kind: "doc-table", table: 1, cell: "A1" }, LAYER],
    [{ target: TEXT, extent_kind: "image", extent_part: PNG_SHA.toUpperCase() }, { kind: "image", part: PNG_SHA.toUpperCase() }, null],
    [{ target: TEXT, extent_kind: "image", extent_part: PNG_SHA, extent_cited_as: "bytes" }, { kind: "image", part: PNG_SHA, cited_as: "bytes" }, null],
    [{ target: BOOK, extent_kind: "sheet-range", extent_sheet: "Summary", extent_range: "A1:B3" }, { kind: "sheet-range", sheet: "Summary", range: "A1:B3" }, LAYER],
  ];
  for (const [cit, want, chain] of cases) {
    assert.deepEqual(citationExtent(cit), want, JSON.stringify(cit));
    assert.deepEqual(w.content.citationRefusals([cit]), []);
    const r = w.content.resolveCitation(cit);
    assert.equal(r.content_id, contentIdFor(caps[cit.target], want, chain), JSON.stringify(cit));
  }
  assert.equal(w.content.resolveCitation(cases[2][0]).content_id, w.content.resolveCitation(cases[1][0]).content_id,
    "an image with no cited_as is cited as bytes, and a part's case is a spelling");
  const asText = { target: TEXT, extent_kind: "image", extent_part: PNG_SHA, extent_cited_as: "text" };
  assert.deepEqual(citationExtent(asText).cited_as, "text");
  assert.deepEqual(w.content.citationRefusals([asText]).map((e) => e.code), ["CONTENT_EXTENT_NO_CHAIN"]);
  const oob = w.content.citationRefusals([{ target: TEXT, extent_kind: "doc-table", extent_table: 1, extent_cell: "B1" }], (i) => `leg[${i}]`);
  assert.deepEqual(oob.map((e) => e.check), ["C-45.1"]);
  assert.match(oob[0].detail, /^leg\[0\]: table 1 of this capture holds 1 column\(s\)/);
  assert.equal(w.count("content"), 3);
});

test("R7, R12, R27 (content-extent): a page past the capture's page set, named by the chain's scoped steps, is C-45.1 stating the set, at mint and at a citation, and writes nothing", () => {
  const scoped = [{ step: "pixels", extent: { kind: "pages", pages: [0, 1, 2] } },
                  { step: "ocr", engine: "tesseract", version: "5.3.4", cap: "C", extent: { kind: "pages", pages: [0, 1, 2] } }];
  const DOC = "INFO-2026-8200-paged";
  const { w, mint } = office({ [DOC]: { chain: scoped } });
  const r = mint(DOC, { kind: "pdf-page", page: 9 });
  assert.deepEqual([r.code, r.check], ["CONTENT_EXTENT_OUT_OF_RANGE", "C-45.1"]);
  assert.match(r.detail, /3 page\(s\) \(0-2\).*page 9/);
  const c = w.content.citationRefusals([{ target: DOC, extent_kind: "pdf-page", extent_page: 9 }], (i) => `leg[${i}]`);
  assert.deepEqual(c.map((e) => e.check), ["C-45.1"]);
  assert.match(c[0].detail, /^leg\[0\]: .*3 page\(s\) \(0-2\).*page 9/);
  assert.equal(w.count("content"), 0);
  const last = mint(DOC, { kind: "pdf-page", page: 2 });
  assert.equal(last.ok, true, "the last page of the set");
  assert.equal(w.content.contentRow(last.content_id).page_count, 3);
  const region = mint(DOC, { kind: "pdf-page", page: 1, rect: [10, 20, 100, 200] });
  assert.equal(w.content.contentRow(region.content_id).says, "page 2, a region of it, as this record holds it");
  assert.equal(mint(DOC, { kind: "pdf-page", page: 1, rect: [100, 200, 10, 20], ref: "page 2, the table" }, V("cy")).content_id, region.content_id,
    "an inverted rect and another wording are the same passage");
});

test("R38 (content-extent): every C-45 row carries its check, where and a translation a member can read; dom at a citation is C-45.4 with its translation; no content code duplicates the attestation fence", () => {
  const rows = { ...CONTENT_EXTENT_CHECKS, ...CONTENT_EXTENT_OWN_CHECKS };
  assert.ok(Object.keys(rows).length >= 8);
  for (const [k, r] of Object.entries(rows)) {
    assert.match(r.check, /^C-45\.\d+$/, k);
    assert.equal(typeof r.where, "string", k);
    assert.ok(typeof r.translation === "string" && r.translation.length > 80, k);
  }
  assert.equal(Object.keys(rows).some((k) => /MACHINE|ATTEST/.test(k)), false);
  const w = world();
  const a = w.cap("a"); w.doc(TEXT, [a]); w.read(a.sha, { pageCount: 2 });
  const [dom, ...rest] = w.content.citationRefusals([{ target: TEXT, extent_kind: "dom" }, { target: TEXT, extent_kind: "paragraph-ish" }]);
  assert.deepEqual([dom.code, dom.check, dom.translation], ["CONTENT_EXTENT_NO_PRODUCER", "C-45.4", CONTENT_EXTENT_CHECKS.CONTENT_EXTENT_NO_PRODUCER.translation]);
  assert.deepEqual(rest.map((e) => [e.code, e.check]), [["CONTENT_EXTENT_UNREADABLE", "C-45.3"]], "an unknown kind is unreadable, not dom");
  assert.equal(Object.prototype.hasOwnProperty.call(rows, "unstated"), false);
});

test("R12, R27, R28 (content-extent): a whole-document citation of an unread capture is not refused and mints with no chain and no cap; a part of it is C-45.2; a document with no capture: the whole is not refused and resolves NO_BYTES_HELD, a part is C-45.2", () => {
  const BARE = "INFO-2026-8200-bare", NOCAP = "INFO-2026-8200-uncaptured";
  const w = world();
  const b = w.cap("bare"); w.doc(BARE, [b]); w.read(b.sha, { chain: null, pageCount: null });
  w.doc(NOCAP, []);
  assert.deepEqual(w.content.citationRefusals([{ target: BARE }, { target: NOCAP }]), []);
  const r = w.content.resolveCitation({ target: BARE });
  assert.deepEqual([r.minted, r.content_id], [true, contentIdFor(b.sha, { kind: "document" }, null)]);
  const row = w.content.contentRow(r.content_id);
  assert.deepEqual([row.extent_kind, row.chain, row.derivation_cap, row.says], ["document", null, null, "the whole document, as this record holds it"]);
  const part = w.content.citationRefusals([{ target: BARE, extent_kind: "pdf-page", extent_page: 0 }]);
  assert.deepEqual(part.map((e) => [e.code, e.check]), [["CONTENT_EXTENT_NO_CHAIN", "C-45.2"]]);
  const n = w.count("content");
  const none = w.content.resolveCitation({ target: NOCAP });
  assert.deepEqual([none.content_id, none.null_case], [null, "NO_BYTES_HELD"]);
  assert.equal(w.count("content"), n, "no capture: nothing minted");
  const nocapPart = w.content.citationRefusals([{ target: NOCAP, extent_kind: "pdf-page", extent_page: 0 }], (i) => `leg[${i}]`);
  assert.deepEqual(nocapPart.map((e) => [e.code, e.check]), [["CONTENT_EXTENT_NO_CHAIN", "C-45.2"]]);
  assert.match(nocapPart[0].detail, /holds no capture of that document at all/);
});

test("R22, R27, R28, R34 (content-extent): after a re-read the row a citation named still resolves as it is, stale and saying so, never re-minted; the same extent unnamed is a new address under the new chain; a narrower extent mints a new row and the old one stays", () => {
  const OLD = [{ step: "pixels", extent: { kind: "pages", pages: [0, 1, 2] } }, { step: "ocr", engine: "tesseract", version: "5", cap: "C", extent: { kind: "pages", pages: [0, 1, 2] } }];
  const NEW = [{ step: "pixels", extent: { kind: "pages", pages: [0, 1, 2] } }, { step: "ocr", engine: "tesseract", version: "5", cap: "B", extent: { kind: "pages", pages: [0, 1, 2] } }];
  const DOC = "INFO-2026-8200-paged";
  const { w, caps } = office({ [DOC]: { chain: OLD } });
  const whole = w.content.resolveCitation({ target: DOC });
  const page = w.content.resolveCitation({ target: DOC, extent_kind: "pdf-page", extent_page: 1, extent_rect: [10, 20, 100, 200] });
  assert.equal(w.count("content"), 2);
  /* the re-read: the chain moves, the bytes do not */
  w.read(caps[DOC], { chain: NEW });
  assert.equal(w.content.markStale(caps[DOC], NEW), 2);
  assert.equal(w.count("content"), 2, "nothing deleted");
  const named = { target: DOC, content_id: page.content_id };
  assert.deepEqual(w.content.citationRefusals([named]), []);
  assert.deepEqual(w.content.resolveCitation(named), { content_id: page.content_id, minted: false }, "the named row, never re-pointed");
  const row = w.content.contentRow(page.content_id);
  assert.deepEqual([row.resolves, row.stale], [true, true]);
  assert.match(row.says, /re-read and the text may have changed/);
  assert.deepEqual(row.chain, OLD, "the row keeps the chain it was minted under");
  /* the same extent, not named, is another address: the chain is in the id */
  const fresh = w.content.resolveCitation({ target: DOC, extent_kind: "pdf-page", extent_page: 1, extent_rect: [10, 20, 100, 200] });
  assert.equal(fresh.minted, true);
  assert.notEqual(fresh.content_id, page.content_id);
  assert.equal(fresh.content_id, contentIdFor(caps[DOC], { kind: "pdf-page", page: 1, rect: [10, 20, 100, 200] }, NEW));
  /* narrowing from the whole document to a page is a new row; the document row is not deleted or rewritten */
  const before = { ...w.row(`SELECT * FROM content WHERE content_id=?`, whole.content_id) };
  const narrow = w.content.resolveCitation({ target: DOC, extent_kind: "pdf-page", extent_page: 2, extent_ref: "page 3, the table" });
  assert.equal(narrow.minted, true);
  assert.notEqual(narrow.content_id, whole.content_id);
  assert.equal(w.content.contentRow(narrow.content_id).extent_kind, "pdf-page");
  assert.deepEqual({ ...w.row(`SELECT * FROM content WHERE content_id=?`, whole.content_id) }, before);
  assert.equal(w.count("content"), 4);
});

test("R3 (content-extent): the content address is SHA-256 over its canonical preimage at every block boundary, including non-ASCII, and the synchronous SHA-256 it uses agrees with node:crypto", () => {
  const nodeHex = (s) => createHash("sha256").update(Buffer.from(s, "utf8")).digest("hex");
  const e = { kind: "pdf-page", page: 3 };
  const residues = new Set();
  for (let n = 0; n <= 140; n++) {
    const capture = "c".repeat(n);
    const pre = canonicalJson({ v: 1, capture_sha: capture, extent: canonicalExtent(e), chain: canonicalJson(LAYER) });
    residues.add(Buffer.byteLength(pre) % 64);
    assert.equal(contentIdFor(capture, e, LAYER), nodeHex(pre), `capture of length ${n}`);
  }
  assert.equal(residues.size, 64, "every residue mod 64 was reached, 55 among them");
  const utf = "pagina 14, oberste Hälfte — ¶";
  assert.equal(contentIdFor(utf, e, null), nodeHex(canonicalJson({ v: 1, capture_sha: utf, extent: canonicalExtent(e), chain: null })));
  for (const n of [0, 1, 54, 55, 56, 63, 64, 65, 118, 119, 120, 127, 128, 129, 200])
    assert.equal(sha256HexSync("a".repeat(n)), nodeHex("a".repeat(n)), `length ${n}`);
  assert.equal(sha256HexSync(utf), nodeHex(utf));
  assert.equal(sha256HexSync(""), "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
  assert.equal(contentIdFor("cap", e, LAYER), contentIdFor("cap", { ...e }, LAYER.map((s) => ({ ...s }))), "a pure function of its inputs");
});

test("R3, R12, R28, R39 (content-extent): re-minting after the bundle's purge gives the same id; a document captured after its citation first resolved to nothing mints its document row at contentIdFor", () => {
  const DOC = "INFO-2026-8200-paged";
  const { w, caps } = office({ [DOC]: {} });
  const first = w.content.resolveCitation({ target: DOC });
  assert.equal(w.record.purge({ bundleId: DOC }).ok !== false, true);
  assert.equal(w.count("content"), 0);
  const c = w.cap(DOC); w.doc(DOC, [c]);
  const reborn = w.content.resolveCitation({ target: DOC });
  assert.deepEqual([reborn.content_id, reborn.minted], [first.content_id, true], "the id is a hash: no migration, the same address");
  assert.equal(reborn.content_id, contentIdFor(caps[DOC], { kind: "document" }, LAYER));
  /* the late capture */
  const LATE = "INFO-2026-8200-captured-later";
  w.doc(LATE, []);
  const early = w.content.resolveCitation({ target: LATE });
  assert.deepEqual([early.content_id, early.null_case], [null, "NO_BYTES_HELD"]);
  const late = w.cap("late");
  const r = w.promotion.promote({ bundleId: LATE, base: w.record.head(LATE).bundleSha, snapKey: "k-late", author: "member:alice",
    files: [{ path: "bundle.md", text: infoMd(LATE) }, { path: late.path, text: late.text },
            { path: "data/provenance.json", text: JSON.stringify({ documents: [provDoc(late)] }) }],
    meta: { object_type: "information" },
    register: [{ sha256: late.sha, path: late.path, encoding: "utf8", bytes: Buffer.byteLength(late.text) }] });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  const chain = [{ step: "layer", tier: 1, extent: { kind: "pages", pages: [0, 1] } }];
  w.read(late.sha, { chain });
  const now = w.content.resolveCitation({ target: LATE });
  assert.deepEqual([now.minted, now.content_id], [true, contentIdFor(late.sha, { kind: "document" }, chain)]);
  assert.equal(w.content.contentRow(now.content_id).extent_kind, "document");
});
