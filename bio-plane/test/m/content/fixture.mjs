/* content over the modules it uses, each the real one (record-core, membership, promotion, provenance), on a real
   SQLite database (node:sqlite) standing in for a Durable Object's storage. The readings `content` reads through
   extraction (its R30 `readingOf`, R36 `unitsOf`) are a provider the test controls, as `contentOf`'s `deps.extraction`
   takes it. Every test drives `content` at its interface. */
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { deflateSync } from "node:zlib";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { promotionOf } from "../../../src/promotion/index.mjs";
import { provenanceOf } from "../../../src/provenance/index.mjs";
import { contentOf } from "../../../src/content/index.mjs";

export const sha = (s) => createHash("sha256").update(typeof s === "string" ? Buffer.from(s, "utf8") : s).digest("hex");
const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);

export function storage() {
  const db = new DatabaseSync(":memory:");
  let n = 0;
  const sql = {
    exec(q, ...args) {
      const st = db.prepare(q);
      return st.columns().length ? st.all(...args.map(bind)).map((r) => ({ ...r })) : (st.run(...args.map(bind)), []);
    },
  };
  return {
    db, sql,
    transactionSync(fn) {
      const sp = `sp${n++}`;
      db.exec(`SAVEPOINT ${sp}`);
      try { const r = fn(); db.exec(`RELEASE ${sp}`); return r; }
      catch (e) { db.exec(`ROLLBACK TO ${sp}`); db.exec(`RELEASE ${sp}`); throw e; }
    },
  };
}

/** An evidence bucket stand-in keyed by the object key record-core composes. */
export function bucket(objects = {}) {
  const held = new Map(Object.entries(objects));
  return {
    held,
    async head(k) { return held.has(k) ? { size: held.get(k).length } : null; },
    async get(k) {
      if (!held.has(k)) return null;
      const b = Buffer.from(held.get(k));
      return { arrayBuffer: async () => b.buffer.slice(b.byteOffset, b.byteOffset + b.length) };
    },
    async put(k, bytes) { held.set(k, Buffer.from(bytes)); return { key: k }; },
  };
}

/** The readings extraction would provide: `readings[sha] = {chain, pageCount, containerExtent, textContainer,
 *  captureFormat, pageBoxes}`, `units[sha] = {units, state}`; `onReading` records listeners. */
export function readings() {
  const r = { readings: {}, units: {}, listeners: [] };
  r.provider = {
    readingOf: (s) => (r.readings[s] ? { reading: { page_boxes: r.readings[s].pageBoxes ?? null }, chain: null,
      pageCount: null, textContainer: null, captureFormat: null, ...r.readings[s] } : null),
    unitsOf: (s) => r.units[s] || { units: [], state: null },
    onReading: (module, fn) => { r.listeners.push({ module, fn }); return { ok: true }; },
  };
  return r;
}

export const V = (id) => `member:${id}`;

export function world({ now = "2026-09-27T03:00:00.000Z", evidence = null } = {}) {
  const st = storage();
  const host = { storage: st };
  const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) st.db.exec(t);
  const clock = { now };
  const record = recordOf(host, { evidence, evidencePrefix: "bio/captures/" });
  record.migrate();
  const membership = membershipOf(host, { record });
  membership.migrate();
  const promotion = promotionOf(host, { record, membership, now: () => clock.now });
  promotion.registerFact("producingGroup", "legacy-store", () => "test-group");
  promotion.registerFact("citedBy", "legacy-store", () => []);
  promotion.registerFact("caseMember", "legacy-store", () => false);
  const prov = provenanceOf(host, { record, membership, promotion, now: () => clock.now });
  prov.migrate();
  const ex = readings();
  const content = contentOf(host, { record, membership, provenance: prov, extraction: ex.provider, now: () => clock.now });
  content.migrate();
  const w = {
    st, host, record, membership, promotion, prov, content, clock, ex,
    row: (q, ...a) => st.sql.exec(q, ...a)[0] ?? null,
    rows: (q, ...a) => st.sql.exec(q, ...a),
    count: (t) => st.sql.exec(`SELECT COUNT(*) AS n FROM ${t}`)[0].n,
    snapshot() {
      const out = {};
      for (const { name } of st.sql.exec(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`))
        out[name] = JSON.stringify(st.sql.exec(`SELECT * FROM ${name}`));
      return out;
    },
    cap: (name, text = `bytes of ${name}`) => ({ path: `snapshots/${name}.txt`, text, sha: sha(text) }),
    /** An information bundle holding `captures`, registered in that order (provenance's first-held order). */
    doc(id, captures = [], { locator = null } = {}) {
      const files = [{ path: "bundle.md", text: infoMd(id) }];
      for (const c of captures) files.push({ path: c.path, text: c.text });
      files.push({ path: "data/provenance.json",
        text: JSON.stringify({ documents: captures.map((c) => provDoc(c, locator ? { locator } : {})) }, null, 2) });
      const r = promotion.promote({ bundleId: id, base: null, snapKey: `k${Math.random().toString(16).slice(2)}`,
        author: "member:alice", files, meta: { object_type: "information" },
        register: captures.map((c) => ({ sha256: c.sha, path: c.path, encoding: "utf8", bytes: Buffer.byteLength(c.text) })) });
      if (!r.ok) throw new Error(`fixture promote refused: ${JSON.stringify(r).slice(0, 400)}`);
      return r;
    },
    /** An inquiry bundle (a target that is not a document). */
    inquiry(id) {
      const r = promotion.promote({ bundleId: id, base: null, snapKey: `k${Math.random().toString(16).slice(2)}`,
        author: "member:alice", files: [{ path: "bundle.md", text: inqMd(id) }], meta: { object_type: "inquiry" } });
      if (!r.ok) throw new Error(`fixture inquiry refused: ${JSON.stringify(r).slice(0, 400)}`);
      return r;
    },
    /** A capture read: its reading facts, and optionally its text units and their index state. */
    read(capSha, facts = {}, units = null, state = "whole") {
      w.ex.readings[capSha] = { chain: LAYER, ...facts };
      if (units) w.ex.units[capSha] = { units: units.map((u, i) => ({ extent: u.extent, ref: u.ref ?? `u${i}`, text: u.text,
                                                                        truncated: !!u.truncated })), state };
    },
  };
  return w;
}

/** A text layer's chain, unscoped. */
export const LAYER = [{ step: "layer", tier: 1, container: "pdf", cap: null, measured_by: null, calibration: null }];
/** A mixed chain: a text layer over pages 0–1, OCR over page 2. */
export const MIXED = [
  { step: "layer", tier: 1, container: "pdf", cap: null, extent: { kind: "pages", pages: [0, 1] } },
  { step: "pixels", tier: 3, cap: "C", extent: { kind: "pages", pages: [2] } },
  { step: "ocr", engine: "tess", version: "5", tier: 3, cap: "C", measured_by: "cal-1", extent: { kind: "pages", pages: [2] } },
];

export function infoMd(id) {
  return ["---", `id: ${id}`, "object_type: information", "schema: information@1", `title: "Document ${id}"`,
          "current_state: collected", "prior_state: null", `created: "2026-09-27T00:00:00Z"`,
          `last_updated: "2026-09-27T00:00:00Z"`, "references: []", "state_history: []", "criticality: supporting",
          "---", "", "## Summary", "", "A document.", ""].join("\n");
}

export function inqMd(id) {
  return ["---", `id: ${id}`, "object_type: inquiry", "schema: inquiry@1", `title: "Question ${id}"`,
          "current_state: open", "prior_state: null", `created: "2026-09-27T00:00:00Z"`,
          `last_updated: "2026-09-27T00:00:00Z"`, "references: []", "state_history: []", "---", "",
          "## Question", "", "What happened?", ""].join("\n");
}

export function provDoc(c, extra = {}) {
  return {
    file: c.path, locator: `https://example.org/${c.path}`, retrieved: "2026-09-27T00:00:00Z",
    authority: "the publisher", authority_state: "determined", authority_basis: "named on the document",
    capture: { method: "acquire", grade: "B", actor_class: "session", sha256: c.sha, encoding: "utf8",
               bytes: Buffer.byteLength(c.text) },
    origin: { kind: "named_request" },
    ...extra,
  };
}

/** A one-page PDF (MediaBox [0 0 3 2]) painting one 3x2 8-bit grey image at [0, 0, 3, 2], assembled here with a
 *  correct cross-reference table. */
export function onePagePdf() {
  const px = Uint8Array.from({ length: 6 }, (_, i) => (i * 37 + 11) & 0xff);
  const data = deflateSync(Buffer.from(px));
  const content = Buffer.from("q 3 0 0 2 0 0 cm /Im Do Q", "latin1");
  const objs = [
    Buffer.from("<< /Type /Catalog /Pages 2 0 R >>", "latin1"),
    Buffer.from("<< /Type /Pages /Kids [3 0 R] /Count 1 >>", "latin1"),
    Buffer.from("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 3 2] /Resources << /XObject << /Im 5 0 R >> >> /Contents 4 0 R >>", "latin1"),
    Buffer.concat([Buffer.from(`<< /Length ${content.length} >>\nstream\n`, "latin1"), content, Buffer.from("\nendstream", "latin1")]),
    Buffer.concat([Buffer.from(`<< /Type /XObject /Subtype /Image /Width 3 /Height 2 /ColorSpace /DeviceGray /BitsPerComponent 8 /Filter /FlateDecode /Length ${data.length} >>\nstream\n`, "latin1"),
                   data, Buffer.from("\nendstream", "latin1")]),
  ];
  const parts = [Buffer.from("%PDF-1.4\n", "latin1")];
  const offsets = [];
  let pos = parts[0].length;
  objs.forEach((o, i) => {
    offsets.push(pos);
    const b = Buffer.concat([Buffer.from(`${i + 1} 0 obj\n`, "latin1"), o, Buffer.from("\nendobj\n", "latin1")]);
    parts.push(b); pos += b.length;
  });
  const xref = [`xref\n0 ${objs.length + 1}\n`, "0000000000 65535 f \n",
    ...offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`),
    `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${pos}\n%%EOF\n`].join("");
  parts.push(Buffer.from(xref, "latin1"));
  return new Uint8Array(Buffer.concat(parts));
}
