/* G44 fixtures for file-safety's safe view of large spreadsheets: workbooks, CSVs and ODS packages sized by declared text,
   built in memory with `make-zip.mjs` (the row of office-readers' g41 `longSheet`: a number, an inline string, a styled number).
   Not a test. */
import { makeZip } from "../../make-zip.mjs";

export const MIB = 1024 * 1024;
export const enc = (s) => new TextEncoder().encode(s);

const MAIN = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
const XCT = `<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/></Types>`;

/** The xml of one sheet: rows of three cells until the sheet's text is `declared` bytes. */
export function genSheetXml(declared) {
  const head = `<worksheet xmlns="${MAIN}"><sheetData>`, tail = `</sheetData></worksheet>`;
  const parts = [head];
  let len = head.length + tail.length, r = 0;
  while (len < declared) {
    r++;
    const row = `<row r="${r}"><c r="A${r}"><v>${r}</v></c><c r="B${r}" t="inlineStr"><is><t>w${String(r % 10007).padStart(5, "0")}</t></is></c><c r="C${r}" s="1"><v>${r}.5</v></c></row>`;
    parts.push(row);
    len += row.length;
  }
  parts.push(tail);
  return { xml: parts.join(""), rows: r };
}

/** A few small rows. */
export const smallSheetXml = (rows = 3, tag = "") => `<worksheet xmlns="${MAIN}"><sheetData>`
  + Array.from({ length: rows }, (_, i) => `<row r="${i + 1}"><c r="A${i + 1}"><v>${i + 1}${tag}</v></c></row>`).join("") + `</sheetData></worksheet>`;

/** A workbook of the sheets `[{name, xml, entry?}]`; `entry` overrides the sheet part's zip entry (central directory lies, corruption). */
export function xlsxOf(sheets, extra = []) {
  const wb = `<workbook xmlns="${MAIN}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>`
    + sheets.map((s, i) => `<sheet name="${s.name}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join("") + `</sheets></workbook>`;
  const rels = `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">`
    + sheets.map((s, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join("") + `</Relationships>`;
  return makeZip([{ name: "[Content_Types].xml", data: XCT }, { name: "xl/workbook.xml", data: wb }, { name: "xl/_rels/workbook.xml.rels", data: rels },
    ...sheets.map((s, i) => ({ name: `xl/worksheets/sheet${i + 1}.xml`, data: s.xml, ...(s.entry ?? {}) })), ...extra]);
}

/** A CSV of about `size` bytes: `n,"a quoted label",n.5` records. */
export function csvOf(size) {
  const out = [];
  let len = 0, r = 0;
  while (len < size) { r++; const line = `${r},"label ${r % 10007} of the row",${r}.5\n`; out.push(line); len += line.length; }
  return { bytes: enc(out.join("")), rows: r };
}

const NS = ['xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"', 'xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"',
  'xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"'].join(" ");
/** An ODS of one table of about `declared` bytes of content.xml: rows of three cells; `lie` overrides the central directory's size of content.xml. */
export function odsOf(declared, lie = {}) {
  const cell = (v) => `<table:table-cell office:value-type="float" office:value="${v}"><text:p>${v}</text:p></table:table-cell>`;
  const rows = [];
  let len = 0, r = 0;
  while (len < declared) { r++; const row = `<table:table-row>${cell(r)}${cell(`${r}.5`)}${cell(r * 3)}</table:table-row>`; rows.push(row); len += row.length; }
  const content = `<?xml version="1.0" encoding="UTF-8"?><office:document-content ${NS} office:version="1.3"><office:body><office:spreadsheet><table:table table:name="S">${rows.join("")}</table:table></office:spreadsheet></office:body></office:document-content>`;
  const type = "application/vnd.oasis.opendocument.spreadsheet";
  const manifest = `<?xml version="1.0"?><manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.3"><manifest:file-entry manifest:full-path="/" manifest:media-type="${type}"/></manifest:manifest>`;
  return { bytes: makeZip([{ name: "mimetype", data: type, method: 0 }, { name: "META-INF/manifest.xml", data: manifest },
    { name: "content.xml", data: content, ...lie }]), rows: r };
}
