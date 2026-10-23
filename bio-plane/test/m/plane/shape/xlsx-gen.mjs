/* The shape harness's xlsx generator (G41; fix round 6): a one-sheet workbook of `rows` rows of 3 short cells (an inline string, a number, an inline string),
 * made as a STREAM of zip bytes (entries deflated as they go, sizes in data descriptors and the central directory), so the child never holds the file
 * or the sheet's XML whole. 200,000 rows declare about 31 MB of sheet text: over the 20 MiB whole-read guard, under the 32 MiB streamed ceiling (`ooxml.mjs:191`).
 * Row 1 carries FIRSTROWMARK, the middle row MIDROWMARK, the last LASTROWMARK in its first cell; `xlsxInfo(rows)` says the last row's cells the sheet must give. */
import { createDeflateRaw, deflateRawSync, crc32 } from "node:zlib";
import { Readable } from "node:stream";

export const XLSX_SHEET = "Sheet1";
const DOS_TIME = 0, DOS_DATE = (46 << 9) | (1 << 5) | 1;   /* 2026-01-01 */
const u16 = (n) => { const b = Buffer.alloc(2); b.writeUInt16LE(n); return b; };
const u32 = (n) => { const b = Buffer.alloc(4); b.writeUInt32LE(n >>> 0); return b; };
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

/** the three cells of 1-based row `i` of a `rows`-row sheet: [first (text), number, third (text)] */
export function xlsxCells(rows, i) {
  const first = i === 1 ? "FIRSTROWMARK" : i === Math.floor(rows / 2) ? "MIDROWMARK" : i === rows ? "LASTROWMARK" : `x${i % 97}`;
  return [first, i % 9973, `y${i % 7}`];
}
export const xlsxInfo = (rows) => ({ rows, lastRow: rows, lastCells: xlsxCells(rows, rows).map(String), midRow: Math.floor(rows / 2), sheet: XLSX_SHEET });

const rowXml = (rows, i) => {
  const [a, b, c] = xlsxCells(rows, i);
  return `<row r="${i}"><c r="A${i}" t="inlineStr"><is><t>${esc(a)}</t></is></c><c r="B${i}"><v>${b}</v></c><c r="C${i}" t="inlineStr"><is><t>${esc(c)}</t></is></c></row>`;
};
const SHEET_HEAD = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>';
const SHEET_TAIL = "</sheetData></worksheet>";
const small = {
  "[Content_Types].xml": '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>',
  "_rels/.rels": '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
  "xl/workbook.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${XLSX_SHEET}" sheetId="1" r:id="rId1"/></sheets></workbook>`,
  "xl/_rels/workbook.xml.rels": '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>',
};

/** the sheet's XML as chunks of about 256 KiB (never whole) */
function* sheetChunks(rows) {
  yield Buffer.from(SHEET_HEAD);
  let buf = [], n = 0;
  for (let i = 1; i <= rows; i++) { const r = rowXml(rows, i); buf.push(r); n += r.length; if (n > 262144) { yield Buffer.from(buf.join("")); buf = []; n = 0; } }
  if (buf.length) yield Buffer.from(buf.join(""));
  yield Buffer.from(SHEET_TAIL);
}

/** the declared byte length of the sheet's XML (counted by a pass, nothing kept) */
export function xlsxSheetBytes(rows) { let n = 0; for (const c of sheetChunks(rows)) n += c.length; return n; }

/** the workbook as zip bytes, a stream of Buffers. Entries use bit 3 (sizes and CRC after the data), as streaming writers do. */
export async function* xlsxChunks(rows) {
  const central = []; let offset = 0;
  const local = (name, flagged) => Buffer.concat([u32(0x04034b50), u16(20), u16(0x0808), u16(8), u16(DOS_TIME), u16(DOS_DATE), u32(0), u32(0), u32(0), u16(Buffer.byteLength(name)), u16(0), Buffer.from(name)]);
  const finish = (name, startAt, crc, csize, usize) => {
    central.push(Buffer.concat([u32(0x02014b50), u16(20), u16(20), u16(0x0808), u16(8), u16(DOS_TIME), u16(DOS_DATE), u32(crc), u32(csize), u32(usize), u16(Buffer.byteLength(name)), u16(0), u16(0), u16(0), u16(0), u32(0), u32(startAt), Buffer.from(name)]));
    return Buffer.concat([u32(0x08074b50), u32(crc), u32(csize), u32(usize)]);
  };
  for (const [name, text] of Object.entries(small)) {
    const raw = Buffer.from(text), z = deflateRawSync(raw), head = local(name), start = offset;
    const tail = finish(name, start, crc32(raw), z.length, raw.length);
    offset += head.length + z.length + tail.length;
    yield head; yield z; yield tail;
  }
  const name = "xl/worksheets/sheet1.xml", head = local(name), start = offset;
  yield head; offset += head.length;
  let crc = 0, usize = 0, csize = 0;
  const src = Readable.from((function* () { for (const c of sheetChunks(rows)) { crc = crc32(c, crc); usize += c.length; yield c; } })(), { objectMode: false });
  const deflate = src.pipe(createDeflateRaw());
  for await (const z of deflate) { csize += z.length; offset += z.length; yield z; }
  const tail = finish(name, start, crc, csize, usize); offset += tail.length; yield tail;
  const cdStart = offset; let cdSize = 0;
  for (const c of central) { cdSize += c.length; yield c; }
  yield Buffer.concat([u32(0x06054b50), u16(0), u16(0), u16(central.length), u16(central.length), u32(cdSize), u32(cdStart), u16(0)]);
}

/** the file's byte length (a counting pass; nothing is kept) */
export async function xlsxFileBytes(rows) { let n = 0; for await (const c of xlsxChunks(rows)) n += c.length; return n; }
