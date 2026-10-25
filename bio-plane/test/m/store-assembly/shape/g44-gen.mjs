/* store-assembly's copy of plane's shape helper. G44's generated files (fix round 6; diagnosis-R6-g44.md): short-row workbooks whose declared sheet text is `declaredMiB` MiB, three cells a row
 * (`<c><v>n</v></c>`, an inline string, `<c s="1"><v>n.5</v></c>`; 142 B a row, so 10 MiB declared is about 73,800 rows and 221,000 cells in a 1.4 MB file), a
 * many-sheet variant, and an ODS of the same rows. They are small files (the deflate of repeated rows), made whole in the child. */
import { zipChunks64 } from "../../../make-zip.mjs";   /* test-support's ZIP writer (G123d): the harness keeps no writer of its own */
/** this file's entries (`{name, text, chunks, stored}`) as test-support's (`{name, data, chunks, method}`) */
const zipChunks = (entries) => zipChunks64(entries.map(({ name, text, chunks, stored }) => ({ name, ...(text !== undefined ? { data: text } : { chunks }), ...(stored ? { method: 0 } : {}) })));

export const ROW_BYTES = 142;
const NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
const rowXml = (i) => `<row r="${i}"><c r="A${i}"><v>${i}</v></c><c r="B${i}" t="inlineStr"><is><t>s${i % 1000}</t></is></c><c r="C${i}" s="1"><v>${i % 977}.5</v></c></row>`;
function* sheetChunks(rows) {
  yield Buffer.from(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<worksheet xmlns="${NS}"><sheetData>`);
  let buf = [], n = 0;
  for (let i = 1; i <= rows; i++) { const r = rowXml(i); buf.push(r); n += r.length; if (n > 262144) { yield Buffer.from(buf.join("")); buf = []; n = 0; } }
  if (buf.length) yield Buffer.from(buf.join(""));
  yield Buffer.from("</sheetData></worksheet>");
}
/** the plan for a file: `rows` a sheet, `sheets` sheets, declared bytes and cells */
export function g44Plan(declaredMiB, { rowsPerSheet = null, sheets = 1 } = {}) {
  const rows = rowsPerSheet ?? Math.max(1, Math.round((declaredMiB * 1048576) / (ROW_BYTES * sheets)));
  return { rows, sheets, cells: rows * sheets * 3, declaredBytes: rows * sheets * ROW_BYTES };
}
const WB_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml";
export function xlsxFile({ rows, sheets }) {
  const names = Array.from({ length: sheets }, (_, k) => `Sheet${k + 1}`);
  const entries = [
    { name: "[Content_Types].xml", text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="${WB_TYPE}.sheet.main+xml"/>${names.map((_, k) => `<Override PartName="/xl/worksheets/sheet${k + 1}.xml" ContentType="${WB_TYPE}.worksheet+xml"/>`).join("")}</Types>` },
    { name: "_rels/.rels", text: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>' },
    { name: "xl/workbook.xml", text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<workbook xmlns="${NS}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${names.map((n, k) => `<sheet name="${n}" sheetId="${k + 1}" r:id="rId${k + 1}"/>`).join("")}</sheets></workbook>` },
    { name: "xl/_rels/workbook.xml.rels", text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${names.map((_, k) => `<Relationship Id="rId${k + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${k + 1}.xml"/>`).join("")}</Relationships>` },
    ...names.map((_, k) => ({ name: `xl/worksheets/sheet${k + 1}.xml`, chunks: sheetChunks(rows) })),
  ];
  return zipChunks(entries);
}
/** an ODS of one table: `rows` rows of a float, a string and a float */
export function odsFile({ rows }) {
  const content = function* () {
    yield Buffer.from('<?xml version="1.0" encoding="UTF-8"?>\n<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" office:version="1.2"><office:body><office:spreadsheet><table:table table:name="Sheet1">');
    let buf = [], n = 0;
    for (let i = 1; i <= rows; i++) {
      const r = `<table:table-row><table:table-cell office:value-type="float" office:value="${i}"><text:p>${i}</text:p></table:table-cell><table:table-cell office:value-type="string"><text:p>s${i % 1000}</text:p></table:table-cell><table:table-cell office:value-type="float" office:value="${i % 977}.5"><text:p>${i % 977}.5</text:p></table:table-cell></table:table-row>`;
      buf.push(r); n += r.length; if (n > 262144) { yield Buffer.from(buf.join("")); buf = []; n = 0; }
    }
    if (buf.length) yield Buffer.from(buf.join(""));
    yield Buffer.from("</table:table></office:spreadsheet></office:body></office:document-content>");
  };
  return zipChunks([
    { name: "mimetype", text: "application/vnd.oasis.opendocument.spreadsheet", stored: true },
    { name: "META-INF/manifest.xml", text: '<?xml version="1.0" encoding="UTF-8"?>\n<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2"><manifest:file-entry manifest:full-path="/" manifest:media-type="application/vnd.oasis.opendocument.spreadsheet"/><manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/></manifest:manifest>' },
    { name: "content.xml", chunks: content() },
  ]);
}
export async function bytesOfStream(it) { const parts = []; for await (const c of it) parts.push(c); return Buffer.concat(parts); }
