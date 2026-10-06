/* workbooks' own XLSX writer (requirements: `build/requirements/workbooks.md`, R14; K1511: the writer is this module's).
 * It writes the smallest SpreadsheetML package every spreadsheet program opens: a content-types part, the package and
 * workbook relationships, a workbook, one worksheet per sheet and a one-style stylesheet. Text is written inline
 * (`t="inlineStr"`), so no shared-strings part is needed. Zip entries are STORED with their CRC-32, which every reader
 * accepts. It computes nothing: a formula cell carries the formula text and the cached value it is handed. */

const enc = new TextEncoder();

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(bytes) {
  let c = 0xffffffff;
  for (const x of bytes) c = CRC_TABLE[(c ^ x) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** A stored zip of `entries` ([[name, string | Uint8Array]]), in the order given. */
export function zipStored(entries) {
  const parts = [], central = [];
  let offset = 0;
  for (const [name, content] of entries) {
    const data = typeof content === "string" ? enc.encode(content) : content;
    const nameBytes = enc.encode(name);
    const crc = crc32(data);
    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true); local.setUint16(4, 20, true); local.setUint16(6, 0x0800, true);
    local.setUint32(14, crc, true); local.setUint32(18, data.length, true); local.setUint32(22, data.length, true);
    local.setUint16(26, nameBytes.length, true);
    parts.push(new Uint8Array(local.buffer), nameBytes, data);
    const cen = new DataView(new ArrayBuffer(46));
    cen.setUint32(0, 0x02014b50, true); cen.setUint16(4, 20, true); cen.setUint16(6, 20, true); cen.setUint16(8, 0x0800, true);
    cen.setUint32(16, crc, true); cen.setUint32(20, data.length, true); cen.setUint32(24, data.length, true);
    cen.setUint16(28, nameBytes.length, true); cen.setUint32(42, offset, true);
    central.push(new Uint8Array(cen.buffer), nameBytes);
    offset += 30 + nameBytes.length + data.length;
  }
  const cdSize = central.reduce((n, p) => n + p.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true); end.setUint16(8, entries.length, true); end.setUint16(10, entries.length, true);
  end.setUint32(12, cdSize, true); end.setUint32(16, offset, true);
  const all = [...parts, ...central, new Uint8Array(end.buffer)];
  const out = new Uint8Array(all.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of all) { out.set(p, at); at += p.length; }
  return out;
}

/** XML text escaping; characters XML 1.0 cannot hold are dropped. */
export function xmlText(s) {
  return String(s)
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f￾￿]/g, "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** 1 → A, 27 → AA (bijective base 26). */
export function colName(n) {
  let s = "";
  for (let x = n; x > 0; x = Math.floor((x - 1) / 26)) s = String.fromCharCode(65 + ((x - 1) % 26)) + s;
  return s;
}
export const a1 = (row, col) => `${colName(col)}${row}`;

/** A sheet name quoted for a formula reference when it needs it. */
export function sheetRef(name) {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(name) && !/^[A-Za-z]{1,3}[0-9]+$/.test(name) ? name : `'${name.replace(/'/g, "''")}'`;
}

/* One cell's XML. A cell is `{t: "n", v}` (a number written as the decimal string given), `{t: "s", v}` (text),
   `{t: "b", v}` (a boolean) or `{f, cached: {t, v}}` (a formula with its cached value). */
function cellXml(ref, c) {
  if (c == null) return "";
  if (c.f !== undefined) {
    const k = c.cached || { t: "s", v: "" };
    const t = k.t === "n" ? "" : k.t === "b" ? ` t="b"` : k.t === "e" ? ` t="e"` : ` t="str"`;
    const v = k.t === "b" ? (k.v ? "1" : "0") : xmlText(k.v);
    return `<c r="${ref}"${t}><f>${xmlText(c.f)}</f><v>${v}</v></c>`;
  }
  if (c.t === "n") return `<c r="${ref}"><v>${xmlText(c.v)}</v></c>`;
  if (c.t === "b") return `<c r="${ref}" t="b"><v>${c.v ? 1 : 0}</v></c>`;
  return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${xmlText(c.v)}</t></is></c>`;
}

function sheetXml(rows) {
  const body = rows.map((cells, i) => {
    const r = i + 1;
    const xs = (cells || []).map((c, j) => cellXml(a1(r, j + 1), c)).join("");
    return xs ? `<row r="${r}">${xs}</row>` : "";
  }).join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n`
    + `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${body}</sheetData></worksheet>`;
}

/** The package for `sheets` ([{name, rows: [[cell]]}]), as bytes. Sheet names are the caller's, already unique and at
 *  most 31 characters with none of `[]:*?/\`. */
export function writeXlsx(sheets) {
  const ns = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
  const rel = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
  const head = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n`;
  const entries = [
    ["[Content_Types].xml", head + `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">`
      + `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>`
      + `<Default Extension="xml" ContentType="application/xml"/>`
      + `<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>`
      + `<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>`
      + sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("")
      + `</Types>`],
    ["_rels/.rels", head + `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">`
      + `<Relationship Id="rId1" Type="${rel}/officeDocument" Target="xl/workbook.xml"/></Relationships>`],
    ["xl/workbook.xml", head + `<workbook xmlns="${ns}" xmlns:r="${rel}"><sheets>`
      + sheets.map((s, i) => `<sheet name="${xmlText(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join("")
      + `</sheets><calcPr calcId="191029" fullCalcOnLoad="1"/></workbook>`],
    ["xl/_rels/workbook.xml.rels", head + `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">`
      + sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="${rel}/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join("")
      + `<Relationship Id="rId${sheets.length + 1}" Type="${rel}/styles" Target="styles.xml"/></Relationships>`],
    ["xl/styles.xml", head + `<styleSheet xmlns="${ns}"><fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts>`
      + `<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>`
      + `<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>`
      + `<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>`
      + `<cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs>`
      + `<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`],
    ...sheets.map((s, i) => [`xl/worksheets/sheet${i + 1}.xml`, sheetXml(s.rows)]),
  ];
  return zipStored(entries);
}

export const XLSX_CONTENT_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
