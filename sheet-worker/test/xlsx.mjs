import { deflateRawSync } from "node:zlib";

/* Builds small OOXML workbooks in the suite itself, so each synthetic fixture is readable where it is used. A helper,
 * not a suite (no `.test.`). Zip entries are STORED (no compression), with their CRC-32, which every reader accepts.
 */

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
const crc32 = (b) => { let c = 0xffffffff; for (const x of b) c = CRC_TABLE[(c ^ x) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };

/** A zip of `files` ({name: string | Uint8Array}): stored, or deflated with `{deflate: true}`. */
export function zip(files, { deflate = false } = {}) {
  const enc = new TextEncoder();
  const parts = [], central = [];
  let offset = 0;
  for (const [name, content] of Object.entries(files)) {
    const data = typeof content === "string" ? enc.encode(content) : content;
    const nameBytes = enc.encode(name);
    const crc = crc32(data);
    const body = deflate ? new Uint8Array(deflateRawSync(data)) : data;
    const method = deflate ? 8 : 0;
    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true); local.setUint16(4, 20, true); local.setUint16(8, method, true);
    local.setUint32(14, crc, true); local.setUint32(18, body.length, true); local.setUint32(22, data.length, true);
    local.setUint16(26, nameBytes.length, true);
    parts.push(new Uint8Array(local.buffer), nameBytes, body);
    const cen = new DataView(new ArrayBuffer(46));
    cen.setUint32(0, 0x02014b50, true); cen.setUint16(4, 20, true); cen.setUint16(6, 20, true); cen.setUint16(10, method, true);
    cen.setUint32(16, crc, true); cen.setUint32(20, body.length, true); cen.setUint32(24, data.length, true);
    cen.setUint16(28, nameBytes.length, true); cen.setUint32(42, offset, true);
    central.push(new Uint8Array(cen.buffer), nameBytes);
    offset += 30 + nameBytes.length + body.length;
  }
  const cdSize = central.reduce((n, p) => n + p.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true);
  end.setUint16(8, Object.keys(files).length, true); end.setUint16(10, Object.keys(files).length, true);
  end.setUint32(12, cdSize, true); end.setUint32(16, offset, true);
  const all = [...parts, ...central, new Uint8Array(end.buffer)];
  const out = new Uint8Array(all.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of all) { out.set(p, at); at += p.length; }
  return out;
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const MAIN = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
const RELNS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
const PKG = "http://schemas.openxmlformats.org/package/2006/relationships";

/** A cell: `{r: "A1", v?: number|string|boolean, f?: string, t?: "n"|"str"|"b"|"e"}`. A string `v` without `f` is an
 *  inline string. `f` is written without its leading "=". */
function cellXml(c) {
  const f = c.f != null ? `<f>${esc(c.f)}</f>` : "";
  if (c.f == null && typeof c.v === "string") return `<c r="${c.r}" t="inlineStr"><is><t>${esc(c.v)}</t></is></c>`;
  let t = c.t;
  if (!t) t = typeof c.v === "boolean" ? "b" : typeof c.v === "string" ? "str" : null;
  const v = c.v == null ? "" : `<v>${esc(typeof c.v === "boolean" ? (c.v ? 1 : 0) : c.v)}</v>`;
  return `<c r="${c.r}"${t ? ` t="${t}"` : ""}>${f}${v}</c>`;
}

const rowOf = (ref) => Number(ref.replace(/^[A-Z]+/, ""));

/**
 * A workbook: `{sheets: [{name, cells: [cell]}], definedNames?: [{name, ref}], calcPr?: string, extra?: {path: content},
 * overrides?: {"/path": contentType}, vba?: boolean, deflate?: boolean}`. `extra` parts replace generated ones.
 */
export function workbook({ sheets, definedNames = [], calcPr = "", extra = {}, overrides = {}, vba = false, deflate = false }) {
  const files = {};
  const mainType = vba ? "application/vnd.ms-excel.sheet.macroEnabled.main+xml"
    : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml";
  const ov = {
    "/xl/workbook.xml": mainType,
    "/xl/styles.xml": "application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml",
    ...Object.fromEntries(sheets.map((_, i) => [`/xl/worksheets/sheet${i + 1}.xml`,
      "application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"])),
    ...(vba ? { "/xl/vbaProject.bin": "application/vnd.ms-office.vbaProject" } : {}),
    ...overrides,
  };
  files["[Content_Types].xml"] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>`
    + `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">`
    + `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>`
    + `<Default Extension="xml" ContentType="application/xml"/>`
    + Object.entries(ov).map(([p, t]) => `<Override PartName="${p}" ContentType="${t}"/>`).join("") + `</Types>`;
  files["_rels/.rels"] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="${PKG}">`
    + `<Relationship Id="rId1" Type="${RELNS}/officeDocument" Target="xl/workbook.xml"/></Relationships>`;
  files["xl/workbook.xml"] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>`
    + `<workbook xmlns="${MAIN}" xmlns:r="${RELNS}"><sheets>`
    + sheets.map((s, i) => `<sheet name="${esc(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join("") + `</sheets>`
    + (definedNames.length ? `<definedNames>${definedNames.map((d) => `<definedName name="${esc(d.name)}">${esc(d.ref)}</definedName>`).join("")}</definedNames>` : "")
    + calcPr + `</workbook>`;
  files["xl/_rels/workbook.xml.rels"] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="${PKG}">`
    + sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="${RELNS}/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join("")
    + `<Relationship Id="rId${sheets.length + 1}" Type="${RELNS}/styles" Target="styles.xml"/>`
    + (vba ? `<Relationship Id="rId${sheets.length + 2}" Type="http://schemas.microsoft.com/office/2006/relationships/vbaProject" Target="vbaProject.bin"/>` : "")
    + `</Relationships>`;
  files["xl/styles.xml"] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="${MAIN}">`
    + `<fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts>`
    + `<fills count="1"><fill><patternFill patternType="none"/></fill></fills>`
    + `<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>`
    + `<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>`
    + `<cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs>`
    + `<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;
  sheets.forEach((s, i) => {
    const rows = new Map();
    for (const c of s.cells) { const r = rowOf(c.r); if (!rows.has(r)) rows.set(r, []); rows.get(r).push(c); }
    files[`xl/worksheets/sheet${i + 1}.xml`] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>`
      + `<worksheet xmlns="${MAIN}" xmlns:r="${RELNS}"><sheetData>`
      + [...rows.keys()].sort((a, b) => a - b).map((r) => `<row r="${r}">${rows.get(r).map(cellXml).join("")}</row>`).join("")
      + `</sheetData></worksheet>`;
  });
  if (vba) files["xl/vbaProject.bin"] = new Uint8Array([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1, 0, 0, 0, 0]);
  Object.assign(files, extra);
  return zip(files, { deflate });
}
