/* Fixtures for the office-readers suite: a ZIP writer built on node:zlib
 * (deflate and CRC-32 independent of the module under test), and builders
 * for minimal DOCX, PPTX and XLSX packages. Every central-directory field a
 * reader trusts can be overridden per member (`cd: {usize, crc}`), so a
 * fixture can declare sizes it does not carry, or carry a corrupt member. */
import { deflateRawSync, crc32 as zcrc32 } from "node:zlib";

export const enc = (s) => (typeof s === "string" ? new TextEncoder().encode(s) : s);

function u16(v) { const b = new Uint8Array(2); new DataView(b.buffer).setUint16(0, v, true); return b; }
function u32(v) { const b = new Uint8Array(4); new DataView(b.buffer).setUint32(0, v >>> 0, true); return b; }
function cat(parts) {
  const n = parts.reduce((a, p) => a + p.length, 0);
  const out = new Uint8Array(n);
  let at = 0;
  for (const p of parts) { out.set(p, at); at += p.length; }
  return out;
}

/** members: [{ name, data, method = 8, cd: {usize, crc} }] -> ZIP bytes. */
export function zip(members) {
  const out = [];
  let offset = 0;
  const central = [];
  for (const m of members) {
    const data = enc(m.data ?? "");
    const method = m.method ?? 8;
    const comp = method === 8 ? new Uint8Array(deflateRawSync(data)) : data;
    const name = enc(m.name);
    const crc = zcrc32(data) >>> 0;
    const local = cat([u32(0x04034b50), u16(20), u16(0x0800), u16(method), u16(0), u16(0),
      u32(crc), u32(comp.length), u32(data.length), u16(name.length), u16(0), name, comp]);
    out.push(local);
    const cd = { crc, usize: data.length, ...(m.cd ?? {}) };
    central.push(cat([u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(method), u16(0), u16(0),
      u32(cd.crc), u32(comp.length), u32(cd.usize), u16(name.length), u16(0), u16(0), u16(0), u16(0),
      u32(0), u32(offset), name]));
    offset += local.length;
  }
  const cd = cat(central);
  const eocd = cat([u32(0x06054b50), u16(0), u16(0), u16(members.length), u16(members.length),
    u32(cd.length), u32(offset), u16(0)]);
  return cat([...out, cd, eocd]);
}

const REL_NS = "http://schemas.openxmlformats.org/package/2006/relationships";
const R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
export const RT = {
  office: `${R}/officeDocument`, hyperlink: `${R}/hyperlink`, sheet: `${R}/worksheet`,
  table: `${R}/table`, slide: `${R}/slide`, notes: `${R}/notesSlide`, image: `${R}/image`,
  oleObject: `${R}/oleObject`, drawing: `${R}/drawing`, package: `${R}/package`,
};

/** A .rels part: [{id, type, target, external}] */
export function rels(list) {
  return `<?xml version="1.0"?><Relationships xmlns="${REL_NS}">`
    + list.map((r) => `<Relationship Id="${r.id}" Type="${r.type ?? RT.hyperlink}" Target="${r.target}"${r.external ? ' TargetMode="External"' : ""}/>`).join("")
    + `</Relationships>`;
}

export const MAIN_TYPE = {
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml",
};
export const MAIN_PART = { docx: "word/document.xml", xlsx: "xl/workbook.xml", pptx: "ppt/presentation.xml" };

function contentTypes(flavour) {
  return `<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">`
    + `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>`
    + `<Default Extension="xml" ContentType="application/xml"/>`
    + `<Override PartName="/${MAIN_PART[flavour]}" ContentType="${MAIN_TYPE[flavour]}"/></Types>`;
}

/** The OPC skeleton of a flavour: content types and the package rels. */
export function skeleton(flavour) {
  return [
    { name: "[Content_Types].xml", data: contentTypes(flavour) },
    { name: "_rels/.rels", data: rels([{ id: "rId1", type: RT.office, target: MAIN_PART[flavour] }]) },
  ];
}

export const core = (o = {}) =>
  `<?xml version="1.0"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/">`
  + (o.creator != null ? `<dc:creator>${o.creator}</dc:creator>` : "")
  + (o.lastModifiedBy != null ? `<cp:lastModifiedBy>${o.lastModifiedBy}</cp:lastModifiedBy>` : "")
  + (o.revision != null ? `<cp:revision>${o.revision}</cp:revision>` : "")
  + (o.created != null ? `<dcterms:created>${o.created}</dcterms:created>` : "")
  + (o.modified != null ? `<dcterms:modified>${o.modified}</dcterms:modified>` : "")
  + (o.title != null ? `<dc:title>${o.title}</dc:title>` : "")
  + `</cp:coreProperties>`;

/* ------------------------------------------------------------------ DOCX */

const W = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';
export const wdoc = (body) => `<?xml version="1.0"?><w:document ${W}><w:body>${body}</w:body></w:document>`;
export const wp = (...runs) => `<w:p>${runs.join("")}</w:p>`;
export const wr = (t) => `<w:r><w:t xml:space="preserve">${t}</w:t></w:r>`;

/** A DOCX: { body, rels:[...], comments, core, extra:[members], cd:{usize...} for the main part } */
export function docx(o = {}) {
  return zip([
    ...skeleton("docx"),
    { name: "word/document.xml", data: o.document ?? wdoc(o.body ?? wp(wr("Hello"))), cd: o.mainCd },
    ...(o.rels ? [{ name: "word/_rels/document.xml.rels", data: o.rels }] : []),
    ...(o.comments != null ? [{ name: "word/comments.xml", data: o.comments, cd: o.commentsCd }] : []),
    ...(o.core != null ? [{ name: "docProps/core.xml", data: o.core }] : []),
    ...(o.extra ?? []),
  ]);
}

/* ------------------------------------------------------------------ PPTX */

const P = 'xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';
/** One text shape per entry of `texts`; `hlink` puts an r:id click on the first run of that shape. */
export const slideXml = (texts, { show = null, hlinks = {} } = {}) =>
  `<?xml version="1.0"?><p:sld ${P}${show != null ? ` show="${show}"` : ""}><p:cSld><p:spTree>`
  + texts.map((t, i) => `<p:sp><p:txBody><a:p><a:r>${hlinks[i] ? `<a:rPr><a:hlinkClick r:id="${hlinks[i]}"/></a:rPr>` : ""}<a:t>${t}</a:t></a:r></a:p></p:txBody></p:sp>`).join("")
  + `</p:spTree></p:cSld></p:sld>`;
export const notesXml = (t) => `<?xml version="1.0"?><p:notes ${P}><p:cSld><p:spTree><p:sp><p:txBody><a:p><a:r><a:t>${t}</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld></p:notes>`;

/** A PPTX. slides: [{ file, texts, show, hlinks, rels:[...], notes, sldIdShow }] listed in DECK order;
 *  their part names are `ppt/slides/<file>`, so a deck can be ordered unlike its filenames. */
export function pptx(o = {}) {
  const slides = o.slides ?? [{ file: "slide1.xml", texts: ["Title"] }];
  const presRels = rels(slides.map((s, i) => ({ id: `rId${i + 10}`, type: RT.slide, target: `slides/${s.file}` })));
  const pres = o.presentation ?? (`<?xml version="1.0"?><p:presentation ${P}><p:sldIdLst>`
    + slides.map((s, i) => `<p:sldId id="${256 + i}" r:id="rId${i + 10}"${s.sldIdShow != null ? ` show="${s.sldIdShow}"` : ""}/>`).join("")
    + `</p:sldIdLst></p:presentation>`);
  const members = [...skeleton("pptx"), { name: "ppt/presentation.xml", data: pres, cd: o.mainCd }];
  if (o.presRels !== false) members.push({ name: "ppt/_rels/presentation.xml.rels", data: o.presRels ?? presRels });
  for (const s of slides) {
    members.push({ name: `ppt/slides/${s.file}`, data: s.xml ?? slideXml(s.texts ?? [], s), cd: s.cd });
    const r = [...(s.rels ?? [])];
    if (s.notes != null) {
      const nf = s.notesFile ?? `notes_${s.file}`;
      r.push({ id: "rIdN", type: RT.notes, target: `../notesSlides/${nf}` });
      members.push({ name: `ppt/notesSlides/${nf}`, data: notesXml(s.notes) });
    }
    if (r.length) members.push({ name: `ppt/slides/_rels/${s.file}.rels`, data: rels(r) });
  }
  if (o.core != null) members.push({ name: "docProps/core.xml", data: o.core });
  return zip([...members, ...(o.extra ?? [])]);
}

/* ------------------------------------------------------------------ XLSX */

const S = 'xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';
/** rows: [{ r, hidden, cells:[{ r:"A1", t, v, f, is }] }], cols: [{min,max,hidden}], hyperlinks: [{ref, id, location}] */
export function sheetXml({ rows = [], cols = [], hyperlinks = [] } = {}) {
  return `<?xml version="1.0"?><worksheet ${S}>`
    + (cols.length ? `<cols>${cols.map((c) => `<col min="${c.min}" max="${c.max}"${c.hidden ? ' hidden="1"' : ""}/>`).join("")}</cols>` : "")
    + `<sheetData>` + rows.map((row) => `<row r="${row.r}"${row.hidden ? ' hidden="1"' : ""}>`
      + row.cells.map((c) => `<c r="${c.r}"${c.t ? ` t="${c.t}"` : ""}>${c.f != null ? `<f>${c.f}</f>` : ""}${c.v != null ? `<v>${c.v}</v>` : ""}${c.is != null ? `<is><t>${c.is}</t></is>` : ""}</c>`).join("")
      + `</row>`).join("") + `</sheetData>`
    + (hyperlinks.length ? `<hyperlinks>${hyperlinks.map((h) => `<hyperlink ref="${h.ref}"${h.id ? ` r:id="${h.id}"` : ""}${h.location ? ` location="${h.location}"` : ""}/>`).join("")}</hyperlinks>` : "")
    + `</worksheet>`;
}

/** An XLSX. sheets: [{ name, state, data (sheetXml opts) | xml, rels:[...], cd }] in workbook order,
 *  stored as xl/worksheets/sheet<i+1>.xml. definedNames: [{name, ref, localSheetId, hidden}]. */
export function xlsx(o = {}) {
  const sheets = o.sheets ?? [{ name: "Sheet1", data: { rows: [{ r: 1, cells: [{ r: "A1", t: "inlineStr", is: "x" }] }] } }];
  const wb = o.workbook ?? (`<?xml version="1.0"?><workbook ${S}><sheets>`
    + sheets.map((s, i) => `<sheet${s.name != null ? ` name="${s.name}"` : ""} sheetId="${i + 1}"${s.state ? ` state="${s.state}"` : ""} r:id="rId${i + 1}"/>`).join("")
    + `</sheets>`
    + ((o.definedNames ?? []).length ? `<definedNames>${o.definedNames.map((d) => `<definedName name="${d.name}"${d.localSheetId != null ? ` localSheetId="${d.localSheetId}"` : ""}${d.hidden ? ' hidden="1"' : ""}>${d.ref}</definedName>`).join("")}</definedNames>` : "")
    + `</workbook>`);
  const members = [...skeleton("xlsx"), { name: "xl/workbook.xml", data: wb, cd: o.workbookCd }];
  if (o.wbRels !== false) {
    members.push({ name: "xl/_rels/workbook.xml.rels", data: o.wbRels ?? rels(sheets.map((s, i) => ({ id: `rId${i + 1}`, type: RT.sheet, target: `worksheets/sheet${i + 1}.xml` }))) });
  }
  sheets.forEach((s, i) => {
    members.push({ name: `xl/worksheets/sheet${i + 1}.xml`, data: s.xml ?? sheetXml(s.data), cd: s.cd });
    if (s.rels) members.push({ name: `xl/worksheets/_rels/sheet${i + 1}.xml.rels`, data: typeof s.rels === "string" ? s.rels : rels(s.rels) });
  });
  if (o.sharedStrings != null) members.push({ name: "xl/sharedStrings.xml", data: o.sharedStrings, cd: o.sharedStringsCd });
  if (o.core != null) members.push({ name: "docProps/core.xml", data: o.core });
  return zip([...members, ...(o.extra ?? [])]);
}

export const sst = (strings) => `<?xml version="1.0"?><sst ${S}>${strings.map((t) => `<si><t>${t}</t></si>`).join("")}</sst>`;
export const tablePart = (name, ref) => `<?xml version="1.0"?><table ${S} id="1" name="${name}" displayName="${name}" ref="${ref}"/>`;

/** A member whose CRC is declared wrong, so readPart refuses it (crc_mismatch). */
export const CORRUPT = { crc: 0x12345678 };
/** A declared uncompressed size over the 20 MiB bound (the bytes themselves are small). */
export const OVER = { usize: 20 * 1024 * 1024 + 1 };
