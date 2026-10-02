/* reading-pipeline's test fixture: an evidence bucket (the R2 binding's shape) handed to `read` as record-core's
   `evidenceStore()` hands it (the digest under the evidence prefix), scripted fleet members (PDF_WORKER, OCR_WORKER),
   a live-calibration callback behaving as calibration's R10 states it, the jurisdiction view a caller composes
   (`extraction` R18: `jurisdictions.combine` of the instance's profiles, the empty view when it names none), format
   entries swapped in for a test, and helpers that build capture documents in the shape capture's acquire answer
   carries. `fresh().read(document, {env, storeName})` calls this module's `read` directly with all of them (R24). */
import { createHash } from "node:crypto";
import { read } from "../../../src/reading-pipeline/index.mjs";
import { registerFormat, unregisterFormat, getFormat } from "../../../src/formats.mjs";
import { combine } from "../../../../jurisdictions/index.mjs";

export const sha = (b) => createHash("sha256").update(typeof b === "string" ? Buffer.from(b) : Buffer.from(b)).digest("hex");
export const EVIDENCE_PREFIX = "bio/captures/";

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
/* The store `read` is handed: record-core's `evidenceStore()` over the bucket, keyed by digest under the prefix. */
export const evidenceStore = (b) => (b ? { head: (d) => b.head(`${EVIDENCE_PREFIX}${d}`), get: (d) => b.get(`${EVIDENCE_PREFIX}${d}`),
                                          put: (d, bytes) => b.put(`${EVIDENCE_PREFIX}${d}`, bytes) } : null);

/* calibration's R10 (`liveCalibration`) over an in-memory list, every question recorded. */
export function calibration({ live = [], throws = false } = {}) {
  return {
    live, asked: [],
    liveCalibration({ engine, version }) {
      this.asked.push({ engine, version });
      if (throws) throw new Error("calibration store unreadable");
      return live.find((c) => c.engine === engine && c.version === version) || null;
    },
  };
}

/* A caller's world: the evidence, the bindings, the calibration and the profiles the view is combined from. */
export function fresh({ evidence = bucket(), env = {}, cal = calibration(), profiles = null } = {}) {
  const w = { evidence, env, cal, profiles };
  w.view = () => {
    const c = Array.isArray(w.profiles) ? combine(w.profiles) : null;
    return c && c.ok ? c.view : combine([]).view;
  };
  w.read = (document, { storeName = "bio", env: e = null } = {}) => {
    const en = e || w.env || {};
    return read(document, { evidence: evidenceStore(w.evidence), env: en, storeName, view: w.view(),
                            planeVersion: en.VERSION || null,
                            liveCalibration: w.cal ? (q) => w.cal.liveCalibration(q) : null });
  };
  return w;
}

/* Holds bytes in the bucket under the digest key record-core fixes, and answers the digest. */
export async function hold(b, bytes) {
  const u8 = typeof bytes === "string" ? new TextEncoder().encode(bytes) : bytes;
  const d = sha(u8);
  await b.put(`${EVIDENCE_PREFIX}${d}`, u8);
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
