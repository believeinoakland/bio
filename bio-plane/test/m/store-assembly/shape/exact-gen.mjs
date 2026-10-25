/* store-assembly's copy of plane's shape helper. Workbooks and sheets of an EXACT declared size, for the boundary cases of G124f (SHEET C03-C08, X05; fix round 9). The reading's bounds are on DECLARED UNCOMPRESSED text-part bytes (an XLSX's sheet parts and
 * shared strings, an ODS's content.xml: `declaredTextBytes`, read from the central directory before any inflation) and on the file's own bytes (the whole-read ceiling), so a case needs a file whose declared
 * figure is `bound - 2`, `bound` or `bound + 1` to the byte. The text part is written lazily (rows, then spaces between rows to the exact length, then the closing tags), so a 32 MiB part is never held; it
 * deflates to a few hundred KB. `padTo` makes the FILE exactly that long (a stored member of zeros, `bio-pad.bin`, as test-support's `zipChunks64Sized`). Test code; no product import. */
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync, existsSync, statSync, createWriteStream } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import { zipChunks64, zipChunks64Sized } from "../../../make-zip.mjs";

const NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
const XLSX_HEAD = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<worksheet xmlns="${NS}"><sheetData>`;
const XLSX_TAIL = "</sheetData></worksheet>";
/** a short row as it is in the generator g44 uses (a number, an inline string, a decimal): 3 cells */
const xlsxRow = (i, narrow) => narrow === "refs" ? `<row r="${i}"><c r="A${i}"><v>${i}</v></c></row>` : narrow ? `<row><c><v>${i}</v></c></row>` : `<row r="${i}"><c r="A${i}"><v>${i}</v></c><c r="B${i}" t="inlineStr"><is><t>s${i % 1000}</t></is></c><c r="C${i}" s="1"><v>${i % 977}.5</v></c></row>`;
const ODS_HEAD = '<?xml version="1.0" encoding="UTF-8"?>\n<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" office:version="1.2"><office:body><office:spreadsheet><table:table table:name="Sheet1">';
const ODS_TAIL = "</table:table></office:spreadsheet></office:body></office:document-content>";
const odsRow = (i) => `<table:table-row><table:table-cell office:value-type="float" office:value="${i}"><text:p>${i}</text:p></table:table-cell><table:table-cell office:value-type="string"><text:p>s${i % 1000}</text:p></table:table-cell><table:table-cell office:value-type="float" office:value="${i % 977}.5"><text:p>${i % 977}.5</text:p></table:table-cell></table:table-row>`;

/** the text part: head, rows of `rowOf(i)` while a whole row still fits, spaces to `bytes` exactly, tail. `rowsMax` caps the rows (the rest is spaces). ASCII only, so a character is a byte. Returns { chunks(), rows } */
function textPart({ head, tail, rowOf, bytes, rowsMax = Infinity }) {
  if (bytes === null) { bytes = head.length + tail.length; for (let i = 1; i <= rowsMax; i++) bytes += rowOf(i).length; }   /* the natural length of `rowsMax` rows */
  if (bytes < head.length + tail.length) throw new Error(`exact-gen: ${bytes} B holds no part (head and tail are ${head.length + tail.length})`);
  let used = head.length + tail.length, rows = 0;
  /* the rows that fit: a pass that holds nothing */
  for (let i = 1; i <= rowsMax; i++) { const n = rowOf(i).length; if (used + n > bytes) break; used += n; rows = i; }
  const spaces = bytes - used;
  function* chunks() {
    yield Buffer.from(head);
    let buf = [], n = 0;
    for (let i = 1; i <= rows; i++) { const r = rowOf(i); buf.push(r); n += r.length; if (n > 262144) { yield Buffer.from(buf.join("")); buf = []; n = 0; } }
    if (buf.length) yield Buffer.from(buf.join(""));
    for (let left = spaces; left > 0; left -= 1 << 20) yield Buffer.alloc(Math.min(left, 1 << 20), 0x20);
    yield Buffer.from(tail);
  }
  return { chunks, rows, bytes };
}

const xlsxEntries = (sheet) => [
  { name: "[Content_Types].xml", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>` },
  { name: "_rels/.rels", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>` },
  { name: "xl/workbook.xml", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<workbook xmlns="${NS}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Sheet1" sheetId="1" r:id="rId1"/></sheets></workbook>` },
  { name: "xl/_rels/workbook.xml.rels", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>` },
  { name: "xl/worksheets/sheet1.xml", chunks: sheet.chunks },
];
const odsEntries = (content) => [
  { name: "mimetype", data: "application/vnd.oasis.opendocument.spreadsheet", method: 0, zip64: false },
  { name: "META-INF/manifest.xml", data: '<?xml version="1.0" encoding="UTF-8"?>\n<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2"><manifest:file-entry manifest:full-path="/" manifest:media-type="application/vnd.oasis.opendocument.spreadsheet"/><manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/><manifest:file-entry manifest:full-path="bio-pad.bin" manifest:media-type="application/octet-stream"/></manifest:manifest>' },
  { name: "content.xml", chunks: content.chunks },
];

/** a recipe: { kind: "xlsx"|"ods", declared: n (the text part's exact declared bytes) or null (the natural length of `rows` rows), padTo?: n (the file's exact bytes), narrow?: true (xlsx: one column, no row or cell references) | "refs" (one column, with them), rows?: n (at most this many rows; the rest spaces) }.
 *  Returns { kind, declared, rows, ext, type, chunks() }; `chunks()` is the file, written lazily */
export function exact(recipe) {
  const { kind, declared, padTo = null, narrow = false, rows: rowsMax = Infinity } = recipe;
  if (kind === "xlsx") {
    const part = textPart({ head: XLSX_HEAD, tail: XLSX_TAIL, rowOf: (i) => xlsxRow(i, narrow), bytes: declared, rowsMax });
    const entries = xlsxEntries(part);
    return { kind, declared: part.bytes, rows: part.rows, ext: "xlsx", type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", chunks: () => (padTo ? zipChunks64Sized(entries, padTo) : zipChunks64(entries)) };
  }
  if (kind === "ods") {
    const part = textPart({ head: ODS_HEAD, tail: ODS_TAIL, rowOf: odsRow, bytes: declared, rowsMax });
    const entries = odsEntries(part);
    return { kind, declared: part.bytes, rows: part.rows, ext: "ods", type: "application/vnd.oasis.opendocument.spreadsheet", chunks: () => (padTo ? zipChunks64Sized(entries, padTo, { member: true }) : zipChunks64(entries)) };
  }
  throw new Error(`exact-gen: kind ${kind}`);
}

/** the file of a recipe, made once into the fixture cache by the recipe's key, streamed to disk: { path, bytes, name, type, rows, declared } */
export async function exactFile(recipe) {
  const g = exact(recipe);
  const dir = process.env.BIO_FIXTURE_CACHE || join(tmpdir(), "bio-test-fixtures"); mkdirSync(dir, { recursive: true });
  const path = join(dir, `exact-${g.kind}-${createHash("sha256").update(JSON.stringify(recipe)).digest("hex").slice(0, 20)}.${g.ext}`);
  if (!existsSync(path)) { const part = `${path}.part`; await pipeline(Readable.from(g.chunks()), createWriteStream(part)); (await import("node:fs")).renameSync(part, path); }
  return { path, bytes: statSync(path).size, name: `exact.${g.ext}`, type: g.type, rows: g.rows, declared: g.declared };
}
