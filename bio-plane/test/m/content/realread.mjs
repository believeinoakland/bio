/* content's tests over REAL readings (B3, K1557): a real workbook's bytes read by the real format entry through the real
   `reading-pipeline.read` (its R28 carries the entry's `cells` and `metadata` on the reading), the reading then handed
   to content as extraction's `readingOf` answers it (extraction persists the reading unchanged, its R19, R30). Only the
   persisting table is stood in. The workbook is assembled here: a STORED (uncompressed) zip with the parts an .xlsx
   needs, so every byte the reader reads is stated in this file. */
import { crc32 } from "node:zlib";
import { createHash } from "node:crypto";
import { read } from "../../../src/reading-pipeline/index.mjs";
import { combine } from "../../../../jurisdictions/index.mjs";

const PREFIX = "bio/captures/";
const enc = (s) => (typeof s === "string" ? new TextEncoder().encode(s) : s);

/** A stored zip of `[{name, data}]` (no compression; local headers, central directory, end record). */
export function zip(members) {
  const locals = [], centrals = [];
  let offset = 0;
  for (const m of members) {
    const name = enc(m.name), data = enc(m.data), crc = crc32(data) >>> 0;
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(0, 6); lh.writeUInt16LE(0, 8);
    lh.writeUInt32LE(0, 10); lh.writeUInt32LE(crc, 14); lh.writeUInt32LE(data.length, 18); lh.writeUInt32LE(data.length, 22);
    lh.writeUInt16LE(name.length, 26); lh.writeUInt16LE(0, 28);
    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6); ch.writeUInt16LE(0, 8);
    ch.writeUInt16LE(0, 10); ch.writeUInt32LE(0, 12); ch.writeUInt32LE(crc, 16); ch.writeUInt32LE(data.length, 20);
    ch.writeUInt32LE(data.length, 24); ch.writeUInt16LE(name.length, 28); ch.writeUInt32LE(offset, 42);
    locals.push(lh, Buffer.from(name), Buffer.from(data));
    centrals.push(ch, Buffer.from(name));
    offset += 30 + name.length + data.length;
  }
  const cd = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(members.length, 8); end.writeUInt16LE(members.length, 10);
  end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(offset, 16);
  return new Uint8Array(Buffer.concat([...locals, cd, end]));
}

const S = 'xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';
const R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
const rels = (list) => `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">`
  + list.map(([id, type, target]) => `<Relationship Id="${id}" Type="${R}/${type}" Target="${target}"/>`).join("") + `</Relationships>`;

/** An .xlsx: `sheets` `[{name, rows: [[{r, t?, v?, f?}]]}]`, a shared-string table, and core properties. */
export function xlsx({ sheets, shared = [], core = null }) {
  const cell = (c) => `<c r="${c.r}"${c.t ? ` t="${c.t}"` : ""}>${c.f != null ? `<f>${c.f}</f>` : ""}${c.v != null ? `<v>${c.v}</v>` : ""}</c>`;
  const members = [
    { name: "[Content_Types].xml", data: `<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">`
      + `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>`
      + `<Default Extension="xml" ContentType="application/xml"/>`
      + `<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/></Types>` },
    { name: "_rels/.rels", data: rels([["rId1", "officeDocument", "xl/workbook.xml"]]) },
    { name: "xl/workbook.xml", data: `<?xml version="1.0"?><workbook ${S}><sheets>`
      + sheets.map((s, i) => `<sheet name="${s.name}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join("") + `</sheets></workbook>` },
    { name: "xl/_rels/workbook.xml.rels", data: rels(sheets.map((s, i) => [`rId${i + 1}`, "worksheet", `worksheets/sheet${i + 1}.xml`])) },
    ...sheets.map((s, i) => ({ name: `xl/worksheets/sheet${i + 1}.xml`, data: `<?xml version="1.0"?><worksheet ${S}><sheetData>`
      + s.rows.map((row, j) => `<row r="${j + 1}">${row.map(cell).join("")}</row>`).join("") + `</sheetData></worksheet>` })),
    ...(shared.length ? [{ name: "xl/sharedStrings.xml",
      data: `<?xml version="1.0"?><sst ${S}>${shared.map((t) => `<si><t>${t}</t></si>`).join("")}</sst>` }] : []),
    ...(core ? [{ name: "docProps/core.xml", data: `<?xml version="1.0"?><cp:coreProperties `
      + `xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" `
      + `xmlns:dcterms="http://purl.org/dc/terms/"><dc:creator>${core.creator}</dc:creator>`
      + `<cp:lastModifiedBy>${core.lastModifiedBy}</cp:lastModifiedBy><dcterms:created>${core.created}</dcterms:created>`
      + `<dcterms:modified>${core.modified}</dcterms:modified></cp:coreProperties>` }] : []),
  ];
  return zip(members);
}

/** Reads `bytes` through the real pipeline as a capture of `format`, answering `read`'s `{reading, text_units, …}`. */
export async function readReal(bytes, { format, ct, fromText = false }) {
  const u8 = enc(bytes);
  const digest = createHash("sha256").update(u8).digest("hex");
  const held = new Map([[`${PREFIX}${digest}`, Buffer.from(u8)]]);
  const get = (k) => (held.has(k) ? { arrayBuffer: async () => { const b = held.get(k); return b.buffer.slice(b.byteOffset, b.byteOffset + b.length); } } : null);
  const evidence = { head: async (d) => (held.has(`${PREFIX}${d}`) ? { size: u8.length } : null), get: async (d) => get(`${PREFIX}${d}`),
                     put: async () => null };
  const document = {
    file: "snapshots/x", locator: "https://a.example/x", retrieved: "2026-09-27T00:00:00Z",
    profile: { profiled_from_text: fromText, format: { format, confidence: "certain", signals: [] }, jurisdiction_view: null },
    provenance_chain: [{ who: "instance t", asserts: "served", via: "direct", bound: false }],
    capture: { sha256: digest, bytes: u8.length, content_type: ct, transport: { http_headers: [["content-type", ct]] } },
  };
  const out = await read(document, { evidence, env: {}, storeName: "bio", view: combine([]).view, planeVersion: null,
                                     liveCalibration: null });
  return { ...out, digest };
}

/** What extraction's `readingOf` answers for a persisted reading (its R30), as content's stand-in takes it. */
export const readingFacts = (reading, format) => ({
  reading, chain: reading.text_source ?? null, pageCount: reading.page_count ?? null,
  containerExtent: reading.container_extent, textContainer: reading.text_container ?? null, captureFormat: format,
  pageBoxes: reading.page_boxes ?? null,
});
