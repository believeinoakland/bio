/* acquisition's test fixture. The act is reached as `acquire(store, body, opts)` with the capture store its caller hands
   in (acquisition's Provides: capture's instance). This module is earlier in the order than `capture` and its tests import
   none of it, so the store handed in here is a stand-in that behaves as capture's Provides state each service acquisition
   reaches (R8 outcomes and reachability, R15 enqueue, R22 sessions, R23 ceiling, R24–R25 site assets, R27 links, R39–R40
   render allowance, R55 measurement, R61 validators, R69 actor), recording every call so a test reads what the act handed
   in. Beside it: record-core's real instance over a node:sqlite stand-in for Durable Object storage (settings and the
   evidence store), an evidence bucket, attestation's real instance over the same storage (R20's `attest`, R3's
   `signReceipt`, handed in as `cap.attestation`, K1224), and stand-ins for host-governor and provenance as their
   Provides state them. */
import { DatabaseSync } from "node:sqlite";
import { createHash, generateKeyPairSync } from "node:crypto";
import { RECORD_SCHEMA, recordOf } from "../../../src/record-core/index.mjs";
import { attestationOf } from "../../../src/attestation/index.mjs";
import { acquire, archiveLookup } from "../../../src/acquisition/index.mjs";
import { acceptDatetime } from "../../../src/capture-sources/memento.mjs";

export const sha = (b) => createHash("sha256").update(typeof b === "string" ? Buffer.from(b) : Buffer.from(b)).digest("hex");
export const H = (hex) => hex.padEnd(64, "0").slice(0, 64);
export const stamp = (ms = Date.now()) => new Date(ms).toISOString().replace(/\.\d+Z$/, "Z");

export function storage() {
  const db = new DatabaseSync(":memory:");
  let n = 0;
  const s = {
    db,
    sql: { exec(q, ...args) { return db.prepare(q).all(...args.map((a) => (a === undefined ? null : a))); } },
    transactionSync(fn) {
      const sp = `sp${n++}`;
      db.exec(`SAVEPOINT ${sp}`);
      try { const r = fn(); db.exec(`RELEASE ${sp}`); return r; }
      catch (e) { db.exec(`ROLLBACK TO ${sp}`); db.exec(`RELEASE ${sp}`); throw e; }
    },
  };
  const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) db.exec(t);
  return s;
}

/* An evidence bucket stand-in (the R2 binding's shape), recording every call. */
export function bucket() {
  const held = new Map(), calls = [];
  const obj = (k) => { const b = held.get(k); return { key: k, size: b.length, body: b,
    arrayBuffer: async () => b.buffer.slice(b.byteOffset, b.byteOffset + b.length) }; };
  return {
    calls, held, failPut: false,
    async head(k) { calls.push(["head", k]); return held.has(k) ? { key: k, size: held.get(k).length } : null; },
    async get(k) { calls.push(["get", k]); return held.has(k) ? obj(k) : null; },
    async put(k, bytes, opts) { calls.push(["put", k, opts]); if (this.failPut) throw new Error("bucket refused"); held.set(k, new Uint8Array(bytes)); return { key: k }; },
    async delete(k) { calls.push(["delete", k]); held.delete(k); },
  };
}

/* host-governor's R1–R14 as the store reaches them, each call recorded; `refuse` names hosts to refuse and `held`
   hosts cooling off. */
export function governor({ refuse = [], held = [] } = {}) {
  const calls = [];
  return {
    calls, configured: [],
    governorAdmit({ host }) { calls.push(["admit", host]); return refuse.includes(host)
      ? { admitted: false, reason: "cooling_off", retry_in_ms: 5000 } : { admitted: true, wait_ms: 0, appetite_per_min: 12 }; },
    governorReport(r) { calls.push(["report", r.host, r.status, r.retry_after_ms]); return { recorded: true }; },
    governorConfig(c) { this.configured.push(c); return { configured: true, ...c }; },
    isHeld(host) { calls.push(["isHeld", host]); return held.includes(host); },
  };
}

/* provenance's R5 and R13 as the store reaches them (`registerHolds` is also what attestation's `attest` asks, R1). */
export function provenance({ registered = [], acquired = [] } = {}) {
  const receipts = [], holds = [];
  return {
    receipts, holds,
    recordReceipt(r) { receipts.push(r); return { recorded: true }; },
    registerHolds({ sha: s }) { holds.push(s); return { ok: true, sha: s, asked: true, registered: registered.includes(s),
      acquired: acquired.includes(s) || receipts.some((r) => r.captureSha === s) }; },
  };
}

/** A fresh Ed25519 private key, PKCS#8, base64: what an operator binds as the instance's secret (attestation R4). */
export const pkcs8 = () => generateKeyPairSync("ed25519").privateKey.export({ type: "pkcs8", format: "der" }).toString("base64");

/* The capture store handed in: each service as capture's Provides state it, in memory, every call recorded in `state`.
   `failures` is capture R8's consecutive-failure threshold for the fallback. */
export function captureStore({ core, env = {}, gov = null, prov = null, failures = 3 } = {}) {
  const state = { outcomes: [], reach: new Map(), sessions: new Map(), day: null, render: { spent_ms: 0, reserved_ms: 0, renders: 0, deferred: 0 },
                  slots: new Map(), admits: [], spends: [], validators: new Map(), actors: [], events: [], limits: new Map(),
                  assets: new Map(), siteRecords: [], links: [], emitted: [], sessionSaves: [], sessionDrops: [] };
  const today = (at) => (at || stamp()).slice(0, 10);
  const dayOf = (at) => { const d = today(at); if (state.day !== d) { state.day = d; state.render = { spent_ms: 0, reserved_ms: 0, renders: 0, deferred: 0 }; } return state.render; };
  return {
    core, env, governor: gov, provenance: prov, state, staggerMs: 0,
    /* capture R8 */
    async recordSourceOutcome({ addressNorm, outcome, status = null, at = null }) {
      state.outcomes.push({ addressNorm, outcome, status, at });
      const r = state.reach.get(addressNorm) || { consecutive_failures: 0, governed_refusals: 0, last_outcome: null, last_status: null };
      if (outcome === "governed") r.governed_refusals++;
      else if (outcome === "success") r.consecutive_failures = 0;
      else r.consecutive_failures++;
      if (outcome !== "governed") r.last_status = status;
      r.last_outcome = outcome;
      state.reach.set(addressNorm, r);
      return { ok: true };
    },
    sourceReachability({ addressNorm }) {
      const r = state.reach.get(addressNorm);
      if (!r) return { address_norm: addressNorm, known: false, consecutive_failures: 0, governed_refusals: 0, fallback_eligible: false,
                       basis: "no attempt on this address has ever been recorded" };
      const eligible = r.consecutive_failures >= failures;
      return { address_norm: addressNorm, known: true, ...r, fallback_eligible: eligible,
               basis: eligible ? `${r.consecutive_failures} consecutive failures produced by the source, threshold ${failures}` : "not eligible: the threshold is not met" };
    },
    /* capture R22 */
    saveCaptureSession(s) { state.sessionSaves.push(s); const cur = state.sessions.get(s.session);
      state.sessions.set(s.session, { ...s, ticks: cur ? cur.ticks + 1 : 1 }); return { session: s.session, saved: true, ticks: cur ? cur.ticks + 1 : 1 }; },
    loadCaptureSession({ session }) { const s = state.sessions.get(session);
      return s ? { session, found: true, locator: s.locator, primarySha: s.primarySha, primaryFile: s.primaryFile, base: s.base, ticks: s.ticks, state: s.state }
               : { session, found: false, note: "no such capture session: it either never existed, was already finished, or expired" }; },
    dropCaptureSession({ session }) { state.sessionDrops.push(session); state.sessions.delete(session); return { session, dropped: true }; },
    /* capture R39–R40: the concurrency cap first, then the day's account; a reservation held until spent. */
    renderAdmit({ allowanceMs, reserveMs = 0, cap = null, at = null }) {
      state.admits.push({ allowanceMs, reserveMs, cap, at });
      const d = dayOf(at);
      if (cap != null && state.slots.size >= cap) return { state: "waiting", cap, running: state.slots.size, reserve_ms: reserveMs };
      if (!(reserveMs > 0) || d.spent_ms + d.reserved_ms + reserveMs > allowanceMs) {
        d.deferred++;
        return { state: "deferred", day: today(at), spent_ms: d.spent_ms, reserved_ms: d.reserved_ms, reserve_ms: reserveMs, allowance_ms: allowanceMs, deferred: d.deferred };
      }
      d.reserved_ms += reserveMs; d.renders++;
      const slot = `slot-${state.admits.length}`;
      state.slots.set(slot, reserveMs);
      return { state: "admitted", slot, cap, reserve_ms: reserveMs, allowance_ms: allowanceMs };
    },
    renderSpend({ ms, releaseMs = 0, slot = null, at = null }) {
      state.spends.push({ ms, releaseMs, slot, at });
      if (slot) state.slots.delete(slot);
      const d = dayOf(at);
      if (!(typeof ms === "number" && ms >= 0)) return { released_ms: 0 };
      const released = Math.min(d.reserved_ms, releaseMs);
      d.spent_ms += Math.ceil(ms); d.reserved_ms -= released;
      return { released_ms: released };
    },
    /* capture R61 */
    recordValidators({ addressNorm, captureSha, etag = null, lastModified = null, at = null }) {
      state.validators.set(`${addressNorm} ${captureSha}`, { etag: etag || null, lastModified: lastModified || null, at }); return { recorded: true }; },
    validatorsOf({ addressNorm, captureSha }) {
      const v = state.validators.get(`${addressNorm} ${captureSha}`);
      return v && (v.etag || v.lastModified) ? { etag: v.etag, lastModified: v.lastModified } : null; },
    /* capture R69 */
    recordCaptureActor(a) { state.actors.push(a); return { recorded: true }; },
    /* capture R15: one event per (kind, capture). */
    async taskEnqueue(e) {
      if (!state.events.some((x) => x.kind === e.kind && x.captureSha === e.captureSha)) state.events.push(e);
      return { ok: true };
    },
    /* capture R23 */
    captureLimit(runtime = "subrequests") { const l = state.limits.get(runtime);
      return l ? { runtime, observed: l, probeDue: false } : { runtime, observed: null, probeDue: true }; },
    recordCaptureLimit({ runtime = "subrequests", observed = null }) {
      if (observed != null) state.limits.set(runtime, observed); return { runtime, observed, recorded: observed != null }; },
    /* capture R24–R25: what a host has served (a test seeds `state.assets`), and what a capture saw of it. */
    siteAssets({ host }) { return { host, assets: Object.fromEntries(state.assets.get(host) || []) }; },
    recordSiteAssets(r) { state.siteRecords.push(r); return { host: r.host, recorded: r.observations.length }; },
    /* capture R27 */
    recordLinks(r) { state.links.push(r); return { recorded: r.links.length }; },
    /* capture R19's stagger, an instance setting: zero here unless a test sets it. */
    subresourceStaggerMs() { return this.staggerMs; },
    /* capture R55 */
    emit(event, payload) { state.emitted.push([event, payload]); return []; },
  };
}

/* A fresh world: record-core over a fresh store, an evidence bucket, the governor, provenance, attestation's real
   instance (its instance key `signingKey`, a fresh one unless a test binds none with `null`) and the capture store
   carrying it as `attestation`, as capture R73 hands it in. */
export function world({ env = {}, gov = {}, provOpts = {}, prov = undefined, failures = 3, evidence = true, signingKey = pkcs8() } = {}) {
  const s = storage();
  const host = { storage: s };
  const b = bucket();
  const core = recordOf(host, { evidence: evidence ? b : null, evidencePrefix: "bio/captures/" });
  core.migrate();
  const g = governor(gov);
  const p = prov === undefined ? provenance(provOpts) : prov;
  const att = attestationOf(host, { record: core, provenance: p, signingKey, instanceName: "inst" });
  const store = captureStore({ core, env: { INSTANCE_NAME: "inst", VERSION: "9.9.9", ...env }, gov: g, prov: p, failures });
  store.attestation = att;
  return { s, b, core, gov: g, prov: p, att, store, rows: (q, ...a) => s.sql.exec(q, ...a),
           signed: () => s.sql.exec("SELECT * FROM signed_receipts"),
           held: (digest) => b.held.has(`bio/captures/${digest}`), bytesOf: (digest) => b.held.get(`bio/captures/${digest}`) };
}

/* A scripted network: `routes` maps a URL (or a function of it) to a Response or a thrower; every fetch is recorded.
   Co-attestation's requests (R20: the timestamp authorities and the co-archive, sent under the agent naming the
   purpose `attest`, R9) are recorded in `attest`, apart from the act's own fetches in `seen`. */
const attestPurpose = (init) => /; attest\)$/.test(String((init && init.headers && init.headers["user-agent"]) || ""));
export function network(routes) {
  const seen = [], attest = [];
  const orig = globalThis.fetch;
  globalThis.fetch = async (u, init = {}) => {
    const url = String(u && u.url ? u.url : u);
    (attestPurpose(init) ? attest : seen).push({ url, init });
    const r = typeof routes === "function" ? routes(url, init) : routes[url];
    if (r instanceof Error) throw r;
    if (!r) return new Response("not found", { status: 404 });
    return typeof r === "function" ? r(url, init) : r.clone();
  };
  return { seen, attest, restore() { globalThis.fetch = orig; } };
}

/* One acquisition over a scripted network; a member session unless `o` says otherwise. */
export async function run(w, routes, body, o = {}) {
  const net = network(routes);
  try { const r = await acquire(w.store, body, { cls: "member", member: true, sessMember: "m1", storeName: "bio", ...o }); return { ...r, net }; }
  finally { net.restore(); }
}
export async function lookup(w, routes, args) {
  const net = network(routes);
  try { return { ...(await archiveLookup(w.store, args)), net }; }
  finally { net.restore(); }
}

export const HTML = (body = "<p>hello</p>") => `<!doctype html><html><head><title>t</title></head><body>${body}</body></html>`;
export const page = (body, headers = {}, status = 200) => new Response(body, { status, headers: { "content-type": "text/html; charset=utf-8", ...headers } });
export const text = (body, headers = {}) => new Response(body, { headers: { "content-type": "text/plain", ...headers } });

/* A scripted Memento archive (RFC 7089) at the Wayback Machine's addresses (capture-sources R37's WAYBACK_MEMENTO):
   `mementos` are `{ts, original?, status?, body?, ct?, datetime?, link?}`. The TimeGate redirects to the newest memento
   (404 with none), the TimeMap lists every one with its datetime, and each memento's raw form (`id_`) answers its
   status, body, `Memento-Datetime` and `Link rel=original`. `over` replaces any route by URL (or a URL prefix). */
export const WB = "https://web.archive.org/web/";
export const http1123 = (ts) => acceptDatetime(ts);
export function wayback(mementos, { address = "https://gone.example/doc", over = {} } = {}) {
  const ms = [...mementos].sort((a, b) => (a.ts < b.ts ? 1 : -1));
  const orig = (m) => m.original || address;
  return (u) => {
    for (const [k, v] of Object.entries(over)) if (u === k || (k.endsWith("*") && u.startsWith(k.slice(0, -1)))) return typeof v === "function" ? v(u) : v;
    if (u === `${WB}${address}`) return ms.length
      ? new Response("", { status: 302, headers: { location: `${WB}${ms[0].ts}/${orig(ms[0])}`, vary: "accept-datetime",
                                                   link: `<${address}>; rel="original", <${WB}timemap/link/${address}>; rel="timemap"` } })
      : new Response("none", { status: 404 });
    if (u === `${WB}timemap/link/${address}`)
      return new Response([`<${address}>; rel="original"`, `<${WB}${address}>; rel="timegate"`,
        ...ms.map((m) => `<${WB}${m.ts}/${orig(m)}>; rel="memento"; datetime="${m.datetime ?? http1123(m.ts)}"`)].join(",\n"),
        { headers: { "content-type": "application/link-format" } });
    for (const m of ms) if (u === `${WB}${m.ts}id_/${orig(m)}`)
      return new Response(m.body ?? "archived bytes", { status: m.status || 200, headers: {
        "content-type": m.ct || "text/plain", "memento-datetime": m.datetime ?? http1123(m.ts),
        ...(m.link === null ? {} : { link: m.link ?? `<${orig(m)}>; rel="original", <${WB}timemap/link/${orig(m)}>; rel="timemap"` }) } });
    return null;
  };
}
/* Three consecutive failures at an address: capture R8's threshold here, so the archive fallback is eligible. */
export async function eligible(w, addr = "https://gone.example/doc") {
  for (let i = 0; i < 3; i++) await w.store.recordSourceOutcome({ addressNorm: addr, outcome: "source_refused", status: 404 });
}

/* A renderer bound as a service (capture-sources R18), answering `answer` and recording each request. */
export function rendererEnv(answer) {
  const calls = [];
  return { calls, RENDERER: { fetch: async (u, init) => { calls.push(JSON.parse(init.body)); return new Response(JSON.stringify(typeof answer === "function" ? answer() : answer)); } } };
}
