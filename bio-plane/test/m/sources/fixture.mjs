/* sources over the modules it uses: record-core and membership are the real ones, on a real SQLite database
   (node:sqlite) standing in for a Durable Object's storage at the plane's shape (`sql.exec` answers a cursor, as
   workerd's does). `capture` is a stand-in that behaves as its worded interface states (capture R31, R32, R65–R67),
   built beside capture's own job in this layer: the knocks pulled into a capture (`pulledKnocksOf`, R72, with
   `knocker_digest` and `pseudonym`, R66), `knockerDigestOf` (R66: an HMAC-SHA-256 of the secret under an instance key, and a readable
   derivation of it), and `knockAttempt` (R31's windows, counted as a knock). When capture merges, `world({capture:
   "real"})` runs the same tests against the real one. Every test drives `sources` at its interface. */
import { DatabaseSync } from "node:sqlite";
import { createHash, createHmac, randomBytes } from "node:crypto";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { sourcesOf } from "../../../src/sources/index.mjs";

export const sha = (s) => createHash("sha256").update(s, "utf8").digest("hex");
const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);

function cursor(rows) {
  let i = 0;
  const c = {
    next() { return i < rows.length ? { done: false, value: rows[i++] } : { done: true, value: undefined }; },
    [Symbol.iterator]() { return c; },
    toArray() { const out = rows.slice(i); i = rows.length; return out; },
    one() { const rest = c.toArray(); if (rest.length !== 1) throw new Error(`Expected exactly one result, got ${rest.length}`); return rest[0]; },
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
  const rows = (q, ...args) => [...sql.exec(q, ...args)];
  return {
    db, sql, rows,
    transactionSync(fn) {
      const sp = `sp${n++}`;
      db.exec(`SAVEPOINT ${sp}`);
      try { const r = fn(); db.exec(`RELEASE ${sp}`); return r; }
      catch (e) { db.exec(`ROLLBACK TO ${sp}`); db.exec(`RELEASE ${sp}`); throw e; }
    },
  };
}

export const V = (id) => `member:${id}`;
export const MACHINE = "class:ai";
export const T0 = Date.parse("2026-09-30T10:00:00.000Z");
export const SECRET = "correct horse battery staple one";      // 32 characters
export const OTHER_SECRET = "a different knocker secret, long enough";

/** capture's worded interface (R31, R65–R67, R71, R72), as a stand-in. `inbox` rows are capture R32's; `knock` files one
 *  and `pull` makes it `pulled` (R65: the capture's digest is the knock's own). */
export function stubCapture({ key = randomBytes(32), perIp = 12, global = 300, windowMs = 600000, clock } = {}) {
  const inbox = [], rate = new Map(), attempts = [];
  const digestOf = (secret) => createHmac("sha256", key).update(secret, "utf8").digest("hex");
  const pseudonymOf = (d) => `knocker-${d.slice(0, 4)}-${d.slice(4, 8)}`;
  let n = 0;
  const cap = {
    inbox, attempts, reads: 0,
    knock({ content = `material ${++n}`, secret = null, received = null } = {}) {
      const d = secret ? digestOf(secret) : null;
      const row = { knock_id: `KNOCK-2026-09-30-${String(++n).padStart(8, "0")}`, sha256: sha(content),
                    bytes: Buffer.byteLength(content), note: "", contact: "someone@example.org",
                    received: received ?? new Date(clock() + n).toISOString(), status: "new",
                    knocker_digest: d, pseudonym: d ? pseudonymOf(d) : null };
      inbox.push(row);
      return row;
    },
    pull(row, status = "pulled") { row.status = status; return row; },
    /* R72: every knock pulled into that capture, oldest received first, never `contact`. */
    pulledKnocksOf(captureSha) {
      cap.reads++;
      return inbox.filter((r) => r.status === "pulled" && r.sha256 === captureSha)
        .sort((a, b) => (a.received < b.received ? -1 : a.received > b.received ? 1 : a.knock_id < b.knock_id ? -1 : 1))
        .map((r) => ({ knock_id: r.knock_id, sha256: r.sha256, bytes: r.bytes, received: r.received, pseudonym: r.pseudonym,
                       knocker_digest: r.knocker_digest }));
    },
    async knockerDigestOf(secret) {
      const d = digestOf(String(secret));
      return { knocker_digest: d, pseudonym: pseudonymOf(d) };
    },
    /* R71: R31's two windows, counted as a knock when admitted; a refusal counts nothing. */
    async knockAttempt({ sourceAddress, now }) {
      const t = Number.isFinite(Number(now)) && now !== null ? Number(now) : clock();
      const win = Math.floor(t / windowMs), frac = (t - win * windowMs) / windowMs;
      const fp = createHash("sha256").update(String(sourceAddress || "unknown")).digest("hex").slice(0, 16);
      const est = (k) => (rate.get(`${k}:${win - 1}`) || 0) * (1 - frac) + (rate.get(`${k}:${win}`) || 0);
      attempts.push({ sourceAddress, now: t });
      if (est(`ip:${fp}`) >= perIp) return { ok: false, reason: "RATE_IP", code: "RATE_IP", check: "C-85.1", translation: "t" };
      if (est("all") >= global) return { ok: false, reason: "RATE_GLOBAL", code: "RATE_GLOBAL", check: "C-85.2", translation: "t" };
      for (const k of [`ip:${fp}:${win}`, `all:${win}`]) rate.set(k, (rate.get(k) || 0) + 1);
      return null;
    },
    rate,
  };
  return cap;
}

export function world({ capture = null } = {}) {
  const st = storage();
  const host = { storage: st };
  const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) st.db.exec(t);
  const clock = { now: T0 };
  const record = recordOf(host, { evidence: null, evidencePrefix: "bio/captures/" });
  record.migrate();
  const membership = membershipOf(host, { record });
  membership.migrate();
  const cap = capture ?? stubCapture({ clock: () => clock.now });
  const s = sourcesOf(host, { record, membership, capture: cap, now: () => clock.now });
  const w = {
    st, host, record, membership, cap, s, clock,
    rows: (q, ...a) => st.rows(q, ...a),
    count: (t) => st.rows(`SELECT COUNT(*) AS n FROM ${t}`)[0].n,
    tick(ms = 1000) { clock.now += ms; },
    snapshot() {
      const out = {};
      for (const { name } of st.rows(`SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'source%' ORDER BY name`))
        out[name] = st.rows(`SELECT * FROM ${name}`);
      out.minted_ids = st.rows(`SELECT * FROM minted_ids`);
      return out;
    },
    member(id, { role = "member", status = "active" } = {}) {
      st.sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, capabilities, created, updated)
                   VALUES (?, ?, ?, ?, ?, '["contribute"]', ?, 't')`, id, `Cover ${id}`, `h_${id}`, role, status, `t${id}`);
    },
    /** A knock pulled into the record, and its source read by `viewer` (R1): `{row, sourceId, answer}`. */
    pulled({ secret = null, content, viewer = V("bob") } = {}) {
      const row = cap.knock({ secret, content });
      cap.pull(row);
      const answer = s.sourceOf({ captureSha: row.sha256, viewer });
      return { row, sourceId: answer.sourceId, answer };
    },
    /** A name disclosed with its value to `sight`, by bob. */
    disclose(source, fields = {}) {
      w.tick();
      return s.recordDisclosure({ source, revealed: { kind: "name", value: "Pat Q. Example" }, how: "self", knownTo: "group",
                                  evidence: "told to bob in person", sight: ["bob"], by: "bob", ...fields });
    },
  };
  return w;
}

/** alice an administrator, bob and carol members, dave a revoked member. */
export function seeded(opts) {
  const w = world(opts);
  w.member("alice", { role: "admin" });
  w.member("bob");
  w.member("carol");
  w.member("dave", { status: "revoked" });
  return w;
}
