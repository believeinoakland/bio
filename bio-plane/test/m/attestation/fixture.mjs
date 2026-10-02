/* attestation over the modules it uses, each the real one (record-core, membership, credentials, promotion,
   provenance), on a real SQLite database (node:sqlite) standing in for a Durable Object's storage at its shape:
   `sql.exec`, answering a cursor as workerd does, and `transactionSync`, which rolls back what `fn` wrote when it throws
   and nests as savepoints. The world is provenance's test world (`test/m/provenance/fixture.mjs`), cut to what these
   tests need, with this module built over it. Every test drives attestation at its interface. */
import { DatabaseSync } from "node:sqlite";
import { createHash, generateKeyPairSync } from "node:crypto";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { credentialsOf } from "../../../src/credentials/index.mjs";
import { promotionOf } from "../../../src/promotion/index.mjs";
import { provenanceOf } from "../../../src/provenance/index.mjs";
import { attestationOf } from "../../../src/attestation/index.mjs";

export const sha = (s) => createHash("sha256").update(typeof s === "string" ? Buffer.from(s, "utf8") : s).digest("hex");

/** A fresh Ed25519 private key, PKCS#8, base64: what an operator binds as the instance's secret. */
export const pkcs8 = () => generateKeyPairSync("ed25519").privateKey.export({ type: "pkcs8", format: "der" }).toString("base64");

const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);

/* A cursor as workerd's `sql.exec` answers one (K316): an iterator over the rows, read once. */
function cursor(rows) {
  let i = 0;
  const c = {
    columnNames: rows.length ? Object.keys(rows[0]) : [],
    rowsRead: rows.length,
    rowsWritten: 0,
    next() { return i < rows.length ? { done: false, value: rows[i++] } : { done: true, value: undefined }; },
    [Symbol.iterator]() { return c; },
    toArray() { const out = rows.slice(i); i = rows.length; return out; },
    one() {
      const rest = c.toArray();
      if (rest.length !== 1) throw new Error(`Expected exactly one result from SQL query, but got ${rest.length}`);
      return rest[0];
    },
  };
  return c;
}

export function storage() {
  const db = new DatabaseSync(":memory:");
  let n = 0;
  const sql = {
    exec(q, ...args) {
      const st = db.prepare(q);
      return cursor(st.columns().length ? st.all(...args.map(bind)).map((r) => ({ ...r })) : (st.run(...args.map(bind)), []));
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

/** An evidence store stand-in keyed by digest: `head` answers `{size, checksums?}`, `put` keeps the bytes. */
export function evidence(objects = {}) {
  const held = new Map(Object.entries(objects).map(([k, v]) => [k, typeof v === "string" ? Buffer.from(v, "utf8") : v]));
  const calls = [];
  return {
    held, calls,
    async head(k) {
      calls.push(["head", k]);
      if (!held.has(k)) return null;
      const b = held.get(k);
      return { size: b.length, checksums: { sha256: createHash("sha256").update(b).digest() } };
    },
    async get(k) {
      calls.push(["get", k]);
      if (!held.has(k)) return null;
      const b = held.get(k);
      return { arrayBuffer: async () => b.buffer.slice(b.byteOffset, b.byteOffset + b.length) };
    },
    async put(k, bytes) { calls.push(["put", k]); held.set(k, Buffer.from(bytes)); return { key: k }; },
  };
}

/** A record with provenance and attestation built over it, in the composition root's order, and a clock the test
 *  controls. `signingKey` and `instanceName` are attestation's (R4). */
export function world({ group = "test-group", now = "2026-09-27T03:00:00.000Z", signingKey = null,
                        instanceName = "test-instance" } = {}) {
  const st = storage();
  const host = { storage: st };
  const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) st.db.exec(t);
  const clock = { now };
  const record = recordOf(host);
  record.migrate();
  const membership = membershipOf(host, { record });
  membership.migrate();
  const credentials = credentialsOf(host, { record, membership });
  credentials.migrate();
  const promotion = promotionOf(host, { record, membership, now: () => clock.now });
  const facts = { group };
  promotion.registerFact("producingGroup", "instance-setup", () => facts.group);
  promotion.registerFact("citedBy", "connections", () => []);
  promotion.registerFact("caseMember", "publication", () => false);
  const prov = provenanceOf(host, { record, membership, promotion, now: () => clock.now, instanceName });
  prov.migrate();
  const att = attestationOf(host, { record, provenance: prov, now: () => clock.now, signingKey, instanceName });
  return {
    st, host, record, membership, promotion, prov, att, clock, facts,
    rows: (q, ...a) => [...st.sql.exec(q, ...a)],
    count: (t) => [...st.sql.exec(`SELECT COUNT(*) AS n FROM ${t}`)][0].n,
    /** Every row of every table, for "nothing was written". */
    snapshot() {
      const out = {};
      for (const { name } of st.sql.exec(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`))
        out[name] = JSON.stringify([...st.sql.exec(`SELECT * FROM ${name}`)]);
      return out;
    },
    /** The operator replaces the key: a new attestation over the same storage and record, with the new secret. */
    rekey(key, at = null) {
      return attestationOf({ storage: st }, { record, provenance: prov, signingKey: key, instanceName,
                                              now: at ? () => at : () => clock.now });
    },
    /** Promote an information bundle with a register document for each capture. */
    promoteInfo(id, { captures = [], docs = null } = {}) {
      const files = [{ path: "bundle.md", text: infoMd(id) }];
      for (const c of captures) files.push({ path: c.path, text: c.text });
      files.push({ path: "data/provenance.json",
                   text: JSON.stringify({ documents: docs ?? captures.map((c) => provDoc(c)) }, null, 2) });
      return promotion.promote({
        bundleId: id, base: null, snapKey: `k${Math.random().toString(16).slice(2)}`, author: "member:alice",
        files, meta: { object_type: "information" },
        register: captures.map((c) => ({ sha256: sha(c.text), path: c.path, encoding: "utf8", bytes: Buffer.byteLength(c.text) })),
      });
    },
    /** A capture, held as a file of an information bundle. */
    cap: (name, text = `bytes of ${name}`) => ({ path: `snapshots/${name}.txt`, text, sha: sha(text) }),
  };
}

export function infoMd(id) {
  return ["---", `id: ${id}`, "object_type: information", "schema: information@1", `title: "Document ${id}"`,
          "current_state: collected", "prior_state: null", `created: "2026-09-27T00:00:00Z"`,
          `last_updated: "2026-09-27T00:00:00Z"`, "references: []", "state_history: []", "criticality: supporting",
          "---", "", "## Summary", "", "A document.", ""].join("\n");
}

/** A C-18.1-conformant register document for one capture. */
export function provDoc(c, extra = {}) {
  return {
    file: c.path, locator: `https://example.org/${c.path}`, retrieved: "2026-09-27T00:00:00Z",
    authority: "the publisher", authority_state: "determined", authority_basis: "named on the document",
    capture: { method: "acquire", grade: "B", actor_class: "session", sha256: sha(c.text), encoding: "utf8",
               bytes: Buffer.byteLength(c.text) },
    origin: { kind: "named_request" },
    ...extra,
  };
}

/* A TimeStampResp, granted, whose token carries the digest's raw bytes (what `parseTimestampResponse` binds on). */
export function granted(digestHex) {
  const der = (tag, body) => {
    const n = body.length;
    const len = n < 128 ? [n] : n < 256 ? [0x81, n] : [0x82, n >> 8, n & 255];
    return Buffer.concat([Buffer.from([tag, ...len]), body]);
  };
  const status = der(0x30, der(0x02, Buffer.from([0])));
  const token = der(0x30, Buffer.concat([der(0x06, Buffer.from([0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x07, 0x02])),
                                          der(0x04, Buffer.from(digestHex, "hex"))]));
  return der(0x30, Buffer.concat([status, token]));
}

/** The network as a stand-in: `answers(url)` says what each endpoint answers (an Error is thrown). */
export const net = (answers) => {
  const calls = [];
  const fetch = async (url, init) => {
    calls.push({ url, init });
    const a = answers(url);
    if (a instanceof Error) throw a;
    return a;
  };
  return { calls, fetch };
};
export const resp = (status, body = Buffer.alloc(0), headers = {}) => ({
  ok: status >= 200 && status < 300, status, url: headers.url ?? "", headers: { get: (k) => headers[k.toLowerCase()] ?? null },
  arrayBuffer: async () => body.buffer.slice(body.byteOffset, body.byteOffset + body.length) });
