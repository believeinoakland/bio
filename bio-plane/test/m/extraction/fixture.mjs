/* extraction's test fixture: a Durable Object storage stand-in over node:sqlite (`sql.exec` answering a cursor,
   `transactionSync` nesting as savepoints), record-core's and membership's tables, an evidence bucket, scripted fleet members
   (PDF_WORKER, OCR_WORKER), a calibration provider behaving as calibration's Provides state (R10–R12), a promotion
   registry recording the step this module registers, an `afterRead` stand-in when a test hands one (R69), and helpers that build capture documents in the shape
   capture's acquire answer carries. */
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { deflateRawSync, crc32 } from "node:zlib";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { Extraction } from "../../../src/extraction/index.mjs";
import { calibrationOf, CALIBRATION_SCHEMA } from "../../../src/calibration/index.mjs";
import { registerFormat, unregisterFormat, getFormat } from "../../../src/formats.mjs";

export const sha = (b) => createHash("sha256").update(typeof b === "string" ? Buffer.from(b) : Buffer.from(b)).digest("hex");

/* The plane's shape (K316): `sql.exec` answers workerd's cursor, an iterator read once with `toArray()` and `one()`,
   never an array, so code that indexes the answer fails here as it fails on the plane. K313: workerd refuses a
   LIKE or GLOB pattern over 50 bytes, and so does this, for a literal pattern or a bound one. */
export const PATTERN_BYTES_MAX = 50;
function cursor(rows) {
  let i = 0;
  return {
    next() { return i < rows.length ? { value: rows[i++], done: false } : { value: undefined, done: true }; },
    [Symbol.iterator]() { return this; },
    toArray() { const rest = rows.slice(i); i = rows.length; return rest; },
    one() {
      const rest = this.toArray();
      if (rest.length !== 1) throw new Error(`Expected exactly one result from SQL query, but got ${rest.length === 0 ? "no" : "multiple"} results.`);
      return rest[0];
    },
    get rowsRead() { return rows.length; },
  };
}
function checkPatterns(q, args) {
  const bytes = (v) => Buffer.byteLength(String(v));
  for (const m of q.matchAll(/\b(?:LIKE|GLOB)\s+'((?:[^']|'')*)'/gi))
    if (bytes(m[1]) > PATTERN_BYTES_MAX) throw new Error("LIKE or GLOB pattern too complex: SQLITE_ERROR");
  const parts = q.split("?");
  for (let k = 0; k < parts.length - 1; k++)
    if (/\b(?:LIKE|GLOB)\s*$/i.test(parts[k]) && typeof args[k] === "string" && bytes(args[k]) > PATTERN_BYTES_MAX)
      throw new Error("LIKE or GLOB pattern too complex: SQLITE_ERROR");
}

export function storage() {
  const db = new DatabaseSync(":memory:");
  const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) db.exec(t);
  let n = 0;
  return {
    db,
    sql: { exec(q, ...args) {
      const a = args.map((v) => (v === undefined ? null : v));
      checkPatterns(q, a);
      return cursor(db.prepare(q).all(...a));
    } },
    transactionSync(fn) {
      const sp = `sp${n++}`;
      db.exec(`SAVEPOINT ${sp}`);
      try { const r = fn(); db.exec(`RELEASE ${sp}`); return r; }
      catch (e) { db.exec(`ROLLBACK TO ${sp}`); db.exec(`RELEASE ${sp}`); throw e; }
    },
  };
}

/* An evidence bucket stand-in (the R2 binding's shape), recording every call. */
export function bucket() {
  const held = new Map(), calls = [];
  const obj = (k) => { const b = held.get(k); return { key: k, size: b.length,
    arrayBuffer: async () => b.buffer.slice(b.byteOffset, b.byteOffset + b.length) }; };
  return {
    calls, held,
    async head(k) { calls.push(["head", k]); return held.has(k) ? { key: k, size: held.get(k).length } : null; },
    async get(k) { calls.push(["get", k]); return held.has(k) ? obj(k) : null; },
    async put(k, bytes) { calls.push(["put", k]); held.set(k, new Uint8Array(bytes)); return { key: k }; },
  };
}

/* calibration's R10–R12 as its Provides state them, over an in-memory list; `onCalibration`'s listeners are kept
   and `fire(e)` runs them as calibration's R4 would. */
export function calibration({ live = [], worse = [], throws = false } = {}) {
  const listeners = [];
  return {
    live, worse, listeners, asked: [],
    liveCalibration({ engine, version }) {
      this.asked.push({ engine, version });
      if (throws) throw new Error("calibration store unreadable");
      return live.find((c) => c.engine === engine && c.version === version) || null;
    },
    worseSupersessions({ supersededId = null, limit = 200 } = {}) {
      const list = worse.filter((s) => (supersededId ? s.superseded.calibration_id === supersededId : true));
      return { supersessions: list.slice(0, limit), limit, truncated: list.length > limit };
    },
    onCalibration(module, fn) {
      if (listeners.some((l) => l.module === module)) return { ok: false, reason: "LISTENER_DECLARED" };
      listeners.push({ module, fn }); return { ok: true };
    },
    fire(e) { return listeners.map((l) => l.fn(e)); },
  };
}

/* promotion's R39 registry, recording what registers. */
export function promotion() {
  const steps = [];
  return { steps, registerStep(module, s) {
    if (steps.some((x) => x.module === module)) return { ok: false, reason: "STEP_DECLARED" };
    steps.push({ module, ...s }); return { ok: true }; } };
}

/* A fresh store with record-core, membership and this module (its figures registered, R67, as `extractionOf` does).
   `provenance` is handed to the module as `extractionOf` hands it (R65). */
export function fresh({ evidence = bucket(), env = {}, cal = calibration(), prom = promotion(), provenance = null,
                        afterRead = null, host = null } = {}) {
  const s = storage();
  const ctx = { storage: s };
  const core = recordOf(ctx, { evidence, evidencePrefix: "bio/captures/" });
  core.migrate();
  const membership = membershipOf(ctx, { record: core });
  membership.migrate();
  /* `cal: "module"` is calibration itself (calibrationOf over this storage), its tables created. */
  if (cal === "module") {
    for (const t of CALIBRATION_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n").split(";")) if (t.trim()) s.db.exec(t);
    cal = calibrationOf(ctx, { record: core });
  }
  const x = new Extraction(s, { record: core, membership, calibration: cal, promotion: prom, env, afterRead, host,
                                provenance: typeof provenance === "function" ? provenance(ctx, core, membership) : provenance });
  x.registerFigures();
  x.migrate();
  return { s, ctx, x, core, membership, evidence, cal, prom, env,
           rows: (q, ...a) => s.sql.exec(q, ...a).toArray(), one: (q, ...a) => s.sql.exec(q, ...a).toArray()[0] || null };
}

/* A bundle row (record-core's `bundles`, its R37 read contract), optionally a project. */
export function bundle(s, bundleId, { type = "information", project = null } = {}) {
  s.sql.exec(`INSERT OR IGNORE INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version, project)
              VALUES (?, ?, 'g', 't', 'collected', '2026-01-01', '2026-01-01', 'x', 1, ?)`, bundleId, type, project);
}

/* Holds bytes in the bucket under the digest key record-core fixes, and answers the digest. */
export async function hold(b, bytes) {
  const u8 = typeof bytes === "string" ? new TextEncoder().encode(bytes) : bytes;
  const d = sha(u8);
  await b.put(`bio/captures/${d}`, u8);
  return d;
}

/* A capture document in the shape capture's acquire answer carries it. */
export function doc({ digest, bytes = 0, ct = "text/html", format = "html", fromText = false, locator = "https://a.example/x",
                      retrieved = "2026-09-27T00:00:00Z", parts = null, chain = null, headers = [["content-type", ct]] } = {}) {
  return {
    file: "snapshots/x", locator, retrieved,
    profile: { profiled_from_text: fromText, format: { format, confidence: "certain", signals: [] }, jurisdiction_view: null },
    provenance_chain: chain || [{ who: "instance t", asserts: "served", via: "direct", bound: false }],
    capture: { sha256: digest, bytes, content_type: ct, transport: { http_headers: headers } },
    ...(parts ? { parts } : {}),
  };
}

/* A scripted fleet member: `answer(body, n)` answers each call; every call is recorded. */
export function member(answer) {
  const calls = [];
  return { calls, async fetch(url, init) {
    const body = JSON.parse(init.body);
    calls.push({ url, body });
    const a = await answer(body, calls.length);
    if (a instanceof Error) throw a;
    return new Response(JSON.stringify(a.body ?? a), { status: a.status ?? 200, headers: { "content-type": "application/json" } });
  } };
}

/* Replaces a format entry for the length of `fn` (the registry is process-wide), restoring the original after. */
export async function withEntry(entry, fn) {
  const had = getFormat(entry.format);
  if (had) unregisterFormat(entry.format);
  registerFormat({ detect: () => null, parts: null, structure: null, text: null, ...entry });
  try { return await fn(); }
  finally { unregisterFormat(entry.format); if (had) registerFormat(had); }
}

/* I2 text with per-page grain: `pages` is `[{page, text, undetermined?}]`. */
export function i2(pages, extra = {}) {
  const undetermined = pages.flatMap((p) => p.undetermined || []);
  const document = pages.map((p) => p.text).filter((t) => t && t.length).join("\n");
  return { document, pages: pages.map((p) => ({ page: p.page, text: p.text, undetermined: p.undetermined || [] })),
           undetermined, counts: { chars: document.length, undetermined: undetermined.length }, ...extra };
}
export const noText = (page) => ({ page, reason: "no_text_layer", font: null, codes: null, count: 1 });
export const folio = (page) => ({ page, reason: "image_content_unread", font: null, codes: null, count: 0 });
export const unreadImage = (page, rect = [0, 0, 100, 100]) => ({ page, reason: "image_unread", font: null, codes: "", count: 0, rect, area_share: 0.5 });

/* An OCR member answer for `pages`, one region each. */
export function ocrAnswer(pages, { engine = "tess", version = "5.3", cap = "C", measured_by = "M-1", floor = null, text = (p) => `ocr text of page ${p}` } = {}) {
  return { ok: true, engine, version, cap, measured_by, confidence_floor: floor,
           pages: pages.map((p) => ({ page: p, regions: [{ text: text(p), source: { kind: "pdf-page", ref: `p${p}`, page: p, rect: [0, 0, 10, 10] },
                                                          confidence: "none" }] })) };
}

/* A .docx package (stored ZIP members deflated by node:zlib, independent of the reader under test) whose
   `word/document.xml` body is `body`; `wp`/`wr` build paragraphs and runs, `alt` an mc:AlternateContent whose branches
   are given as `[tag, inner]` pairs, Word's text box (`box`) a Choice and its Fallback copy of the same paragraphs. */
function zipOf(members) {
  const u16 = (v) => { const b = Buffer.alloc(2); b.writeUInt16LE(v); return b; };
  const u32 = (v) => { const b = Buffer.alloc(4); b.writeUInt32LE(v >>> 0); return b; };
  const out = [], central = [];
  let offset = 0;
  for (const [n, d] of members) {
    const data = Buffer.from(d), comp = deflateRawSync(data), name = Buffer.from(n), crc = crc32(data) >>> 0;
    const local = Buffer.concat([u32(0x04034b50), u16(20), u16(0x0800), u16(8), u16(0), u16(0), u32(crc), u32(comp.length),
                                 u32(data.length), u16(name.length), u16(0), name, comp]);
    central.push(Buffer.concat([u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(8), u16(0), u16(0), u32(crc),
                                u32(comp.length), u32(data.length), u16(name.length), u16(0), u16(0), u16(0), u16(0),
                                u32(0), u32(offset), name]));
    out.push(local); offset += local.length;
  }
  const cd = Buffer.concat(central);
  return new Uint8Array(Buffer.concat([...out, cd, u32(0x06054b50), u16(0), u16(0), u16(members.length),
                                       u16(members.length), u32(cd.length), u32(offset), u16(0)]));
}
const W_NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';
const MC_NS = 'xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"';
export const wp = (...runs) => `<w:p>${runs.join("")}</w:p>`;
export const wr = (t) => `<w:r><w:t xml:space="preserve">${t}</w:t></w:r>`;
export const wtbl = (t) => `<w:tbl><w:tblGrid><w:gridCol/></w:tblGrid><w:tr><w:tc>${wp(wr(t))}</w:tc></w:tr></w:tbl>`;
export const alt = (choice, fallback) =>
  `<mc:AlternateContent ${MC_NS}><mc:Choice Requires="wps">${choice}</mc:Choice><mc:Fallback>${fallback}</mc:Fallback></mc:AlternateContent>`;
export const box = (paras, fb = paras) =>
  `<w:r>${alt(`<w:drawing><w:txbxContent>${paras.join("")}</w:txbxContent></w:drawing>`, `<w:pict><w:txbxContent>${fb.join("")}</w:txbxContent></w:pict>`)}</w:r>`;
export function docx(body) {
  const ct = '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
    + '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
    + '<Default Extension="xml" ContentType="application/xml"/>'
    + '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>';
  const rels = '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
    + '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>';
  return zipOf([["[Content_Types].xml", ct], ["_rels/.rels", rels],
                ["word/document.xml", `<?xml version="1.0"?><w:document ${W_NS}><w:body>${body}</w:body></w:document>`]]);
}

/* A .pptx package built the same way (R68): `slides` is each slide's `p:spTree` body, in deck order, declared by
   `ppt/presentation.xml`'s `sldIdLst`; `psp` builds a text shape, `palt` an mc:AlternateContent of a Choice and its
   Fallback (PowerPoint's p14 graphic frame and the picture of it). */
const PML_NS = 'xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';
const RELS_NS = "http://schemas.openxmlformats.org/package/2006/relationships";
const REL = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
export const psp = (t) => `<p:sp><p:txBody><a:p><a:r><a:t>${t}</a:t></a:r></a:p></p:txBody></p:sp>`;
export const palt = (choice, fallback) =>
  `<mc:AlternateContent ${MC_NS}><mc:Choice Requires="p14">${choice}</mc:Choice><mc:Fallback>${fallback}</mc:Fallback></mc:AlternateContent>`;
export function pptx(slides) {
  const ct = '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
    + '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
    + '<Default Extension="xml" ContentType="application/xml"/>'
    + '<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>'
    + slides.map((_, i) => `<Override PartName="/ppt/slides/slide${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`).join("")
    + '</Types>';
  const rels = (list) => `<?xml version="1.0"?><Relationships xmlns="${RELS_NS}">`
    + list.map(([id, type, target]) => `<Relationship Id="${id}" Type="${REL}/${type}" Target="${target}"/>`).join("") + "</Relationships>";
  const pres = `<?xml version="1.0"?><p:presentation ${PML_NS}><p:sldIdLst>`
    + slides.map((_, i) => `<p:sldId id="${256 + i}" r:id="rId${i + 10}"/>`).join("") + "</p:sldIdLst></p:presentation>";
  return zipOf([["[Content_Types].xml", ct], ["_rels/.rels", rels([["rId1", "officeDocument", "ppt/presentation.xml"]])],
                ["ppt/presentation.xml", pres],
                ["ppt/_rels/presentation.xml.rels", rels(slides.map((_, i) => [`rId${i + 10}`, "slide", `slides/slide${i + 1}.xml`]))],
                ...slides.map((tree, i) => [`ppt/slides/slide${i + 1}.xml`,
                  `<?xml version="1.0"?><p:sld ${PML_NS}><p:cSld><p:spTree>${tree}</p:spTree></p:cSld></p:sld>`])]);
}
