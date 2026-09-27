/* capture's test fixture: a Durable Object storage stand-in over node:sqlite (`sql.exec`, `transactionSync` nesting
   as savepoints), record-core's tables, the two tables of provenance's stated read contract that capture joins
   (`register`, `captured_locators`: provenance R48, only the contract's columns), an evidence bucket, and stand-ins
   for the providers capture reaches (host-governor, provenance), each behaving as its Provides state. */
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { recordOf } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { Capture } from "../../../src/capture/index.mjs";

export const sha = (b) => createHash("sha256").update(typeof b === "string" ? Buffer.from(b) : Buffer.from(b)).digest("hex");

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
  db.exec(`CREATE TABLE register (capture_sha TEXT PRIMARY KEY, bundle_id TEXT NOT NULL, path TEXT)`);
  db.exec(`CREATE TABLE captured_locators (address_norm TEXT NOT NULL, address TEXT NOT NULL, capture_sha TEXT NOT NULL,
             via TEXT NOT NULL DEFAULT 'direct', first_retrieved TEXT NOT NULL, last_retrieved TEXT NOT NULL,
             observations INTEGER NOT NULL DEFAULT 1, retrieval_locator TEXT, PRIMARY KEY (address_norm, capture_sha, via))`);
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

/* host-governor's R1–R14 as capture reaches them (`governorOf(ctx)`'s methods), each call recorded; `refuse` names
   hosts to refuse and `held` hosts cooling off. */
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

/* provenance's R5, R13, R25, R31–R33 as capture reaches them. */
export function provenance(s, { registered = [], attestAnswer = null } = {}) {
  const receipts = [], attests = [];
  return {
    receipts, attests,
    recordReceipt(r) {
      receipts.push(r);
      s.sql.exec(`INSERT INTO captured_locators (address_norm, address, capture_sha, via, first_retrieved, last_retrieved, retrieval_locator)
                  VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT DO UPDATE SET observations = observations + 1, last_retrieved = excluded.last_retrieved`,
                 r.addressNorm, r.address, r.captureSha, r.via || "direct", r.retrieved, r.retrieved, r.retrievalLocator);
      return { recorded: true };
    },
    signed: [],
    async signReceipt(r) { this.signed.push(r); return { ok: true, signed: true }; },
    registerHolds({ sha }) { return { ok: true, sha, asked: true, registered: registered.includes(sha), acquired: false }; },
    async attest(args, io) { attests.push(args); return attestAnswer ?? { ok: true, attempts: [
      { service: "tsa.test", attempted: "2026-09-27T00:00:00Z", ok: true },
      ...(args.archive ? [{ service: "archive.test (anonymous)", attempted: "2026-09-27T00:00:00Z", ok: false, note: "http 500" }] : [])] }; },
  };
}

/* A fresh capture over a fresh store. `opts` goes to the Capture (env, governor, provenance). */
export function fresh({ env = {}, evidence = null, gov = null, prov = undefined } = {}) {
  const s = storage();
  const ctx = { storage: s };
  const core = recordOf(ctx, { evidence, evidencePrefix: "bio/captures/" });
  core.migrate();
  membershipOf(ctx).migrate();
  const c = new Capture(s, { record: core, env: { ...env, ...(evidence ? { CAPTURES: evidence } : {}) }, governor: gov ?? governor(),
                             provenance: prov === undefined ? provenance(s) : prov });
  c.migrate();
  return { s, c, core, rows: (q, ...a) => s.sql.exec(q, ...a) };
}

/* A receipt row (provenance's) and a register row, for the joins capture reads on the contract. */
export function receipt(s, { address, capture, via = "direct", first, last = first, observations = 1 }) {
  s.sql.exec(`INSERT INTO captured_locators (address_norm, address, capture_sha, via, first_retrieved, last_retrieved, observations)
              VALUES (?, ?, ?, ?, ?, ?, ?)`, address, address, capture, via, first, last, observations);
}
export function register(s, captureSha, bundleId, { type = "information", project = null } = {}) {
  s.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path) VALUES (?, ?, 'x')`, captureSha, bundleId);
  s.sql.exec(`INSERT OR IGNORE INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version, project)
              VALUES (?, ?, 'g', 't', 'collected', '2026-01-01', '2026-01-01', 'x', 1, ?)`, bundleId, type, project);
}

/* A scripted network: `routes` maps a URL (or a function of it) to a Response or a thrower; every fetch is recorded. */
export function network(routes) {
  const seen = [];
  const orig = globalThis.fetch;
  globalThis.fetch = async (u, init = {}) => {
    const url = String(u && u.url ? u.url : u);
    seen.push({ url, init });
    const r = typeof routes === "function" ? routes(url, init) : routes[url];
    if (r instanceof Error) throw r;
    if (!r) return new Response("not found", { status: 404 });
    return typeof r === "function" ? r(url, init) : r.clone();
  };
  return { seen, restore() { globalThis.fetch = orig; } };
}

export const H = (hex) => hex.padEnd(64, "0").slice(0, 64);
