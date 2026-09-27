/* extraction's test fixture: a Durable Object storage stand-in over node:sqlite (`sql.exec`, `transactionSync`
   nesting as savepoints), record-core's and membership's tables, an evidence bucket, scripted fleet members
   (PDF_WORKER, OCR_WORKER), a calibration provider behaving as calibration's Provides state (R10–R12), a promotion
   registry recording the step this module registers, and helpers that build capture documents in the shape
   capture's acquire answer carries. */
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { Extraction } from "../../../src/extraction/index.mjs";
import { registerFormat, unregisterFormat, getFormat } from "../../../src/formats.mjs";

export const sha = (b) => createHash("sha256").update(typeof b === "string" ? Buffer.from(b) : Buffer.from(b)).digest("hex");

export function storage() {
  const db = new DatabaseSync(":memory:");
  const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) db.exec(t);
  let n = 0;
  return {
    db,
    sql: { exec(q, ...args) { return db.prepare(q).all(...args.map((a) => (a === undefined ? null : a))); } },
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

/* A fresh store with record-core, membership and this module. */
export function fresh({ evidence = bucket(), env = {}, cal = calibration(), prom = promotion() } = {}) {
  const s = storage();
  const ctx = { storage: s };
  const core = recordOf(ctx, { evidence, evidencePrefix: "bio/captures/" });
  core.migrate();
  const membership = membershipOf(ctx, { record: core });
  membership.migrate();
  const x = new Extraction(s, { record: core, membership, calibration: cal, promotion: prom, env });
  x.migrate();
  return { s, ctx, x, core, membership, evidence, cal, prom, env,
           rows: (q, ...a) => s.sql.exec(q, ...a), one: (q, ...a) => s.sql.exec(q, ...a)[0] || null };
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
