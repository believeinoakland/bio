/* sources over the modules it uses, each the real one: record-core, membership and capture (its doorbell, `pullKnock`,
   `pulledKnocksOf`, `knockerDigestOf` and `knockAttempt`: capture R65, R66, R71, R72), on a real SQLite database
   (node:sqlite) standing in for a Durable Object's storage at the plane's shape (`sql.exec` answers a cursor, as
   workerd's does). Capture's own providers, which `sources` never reaches, are stand-ins that behave as their Provides
   state: provenance's `recordReceipt` (a receipt recorded) and an evidence bucket behind record-core's
   `evidenceStore`. `sources` itself reads the real provenance (`homeOf`, `captureGrade`: R16, R17) over register rows
   and receipts written as a promotion and an acquisition leave them (provenance R1, R13, R48; record-core's `bundles`
   and `files`). Every test drives `sources` at its interface. */
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { Capture } from "../../../src/capture/index.mjs";
import { provenanceOf } from "../../../src/provenance/index.mjs";
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

/* An evidence bucket (the R2 binding's shape), behind record-core's `evidenceStore`. */
function bucket() {
  const held = new Map();
  const obj = (k) => { const b = held.get(k); return { key: k, size: b.length, body: b,
    arrayBuffer: async () => b.buffer.slice(b.byteOffset, b.byteOffset + b.length) }; };
  return {
    held,
    async head(k) { return held.has(k) ? { key: k, size: held.get(k).length } : null; },
    async get(k) { return held.has(k) ? obj(k) : null; },
    async put(k, bytes) { held.set(k, new Uint8Array(bytes)); return { key: k }; },
    async delete(k) { held.delete(k); },
  };
}

export const V = (id) => `member:${id}`;
export const MACHINE = "class:ai";
export const T0 = Date.parse("2026-09-30T10:00:00.000Z");
export const SECRET = "correct horse battery staple one";      // 32 characters
export const OTHER_SECRET = "a different knocker secret, long enough";

/** `gradeAs`: what provenance's `captureGrade` answers to `sources` for every capture, standing in for a route the
 *  record cannot hold here (R17 over every letter); by default the real provenance answers. */
export function world({ gradeAs = null } = {}) {
  const st = storage();
  const host = { storage: st };
  const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) st.db.exec(t);
  const clock = { now: T0 };
  const record = recordOf(host, { evidence: bucket(), evidencePrefix: "bio/captures/" });
  record.migrate();
  const membership = membershipOf(host, { record });
  membership.migrate();
  const receipts = [];
  const provenance = { recordReceipt(r) { receipts.push(r); return { recorded: true, observation: receipts.length }; } };
  const cap = new Capture(st, { record, env: { INSTANCE_NAME: "test", VERSION: "0.0.0" }, governor: null, provenance });
  cap.migrate();
  /* capture's one keyed read, counted, so a test can show R1 asks it once (the instance's own method, wrapped) */
  const spy = { reads: 0, attempts: [] };
  const pulledKnocksOf = cap.pulledKnocksOf.bind(cap), knockAttempt = cap.knockAttempt.bind(cap);
  cap.pulledKnocksOf = (x) => { spy.reads++; return pulledKnocksOf(x); };
  cap.knockAttempt = (a) => { spy.attempts.push(a); return knockAttempt(a); };
  const prov = provenanceOf(host, { record, membership, now: () => new Date(clock.now).toISOString() });
  prov.migrate();
  const s = sourcesOf(host, { record, membership, capture: cap, now: () => clock.now,
                              provenance: gradeAs ? { homeOf: (x) => prov.homeOf(x), captureGrade: () => gradeAs } : prov });
  let n = 0, b = 0;
  const w = {
    st, host, record, membership, cap, spy, receipts, s, clock, prov,
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
    /** A knock at capture's doorbell (its R31, R32, R66): the inbox row, as `pulledKnocksOf` will answer it. */
    async knock({ content = `material ${++n}`, secret = null, at = null, sourceAddress = null } = {}) {
      const k = await cap.knock({ content, note: "a note", contact: "someone@example.org", knockerSecret: secret,
                                  sourceAddress: sourceAddress ?? `198.51.100.${++n % 250}`, now: at ?? (clock.now + n) });
      if (!k.ok) throw new Error(`fixture knock refused: ${JSON.stringify(k)}`);
      const r = st.rows(`SELECT knock_id, sha256, bytes, received, pseudonym, knocker_digest FROM inbox WHERE knock_id = ?`, k.knockId)[0];
      return { ...r };
    },
    /** capture R65: a member brings the knock in. */
    async pull(k, by = "bob") {
      const r = await cap.pullKnock({ knockId: k.knock_id, by });
      if (!r.ok) throw new Error(`fixture pull refused: ${JSON.stringify(r)}`);
      return r;
    },
    /** A knock pulled into the record, and its source read by `viewer` (R1): `{row, sourceId, answer, pulled}`. */
    async pulled({ secret = null, content, viewer = V("bob") } = {}) {
      const row = await w.knock({ secret, content });
      const pulled = await w.pull(row);
      const answer = s.sourceOf({ captureSha: row.sha256, viewer });
      return { row, sourceId: answer.sourceId, answer, pulled };
    },
    /** A capture a member made (`acquisition` R16's document: `capture.actor` the member's stamp, or `actor_class`
     *  `daemon` with no actor), held in an information bundle whose register row is its home (provenance R1, R48) and
     *  whose `data/provenance.json` carries the document; `via` writes the plane's receipt (`direct`, `archive.org`,
     *  `doorbell`; provenance R13) or none; `authored` makes the row a member's own observation (provenance R27).
     *  Answers `{sha, bundleId}`. */
    captured({ actor = "bob", actorClass = "member", text = `a result page ${++b}`, via = "direct", authored = false } = {}) {
      const bundleId = `INFO-2026-${String(1000 + b).padStart(4, "0")}`;
      const path = `snapshots/result-${b}.html`;
      const digest = sha(text);
      const at = new Date(clock.now).toISOString();
      const doc = { file: path, locator: `https://people-search.example/r/${b}`, retrieved: "2026-09-30T09:00:00Z",
                    capture: { method: "acquire", grade: "B", actor_class: actorClass, ...(actor ? { actor } : {}),
                               sha256: digest, encoding: "utf8", bytes: Buffer.byteLength(text) },
                    origin: { kind: "named_request" } };
      const json = JSON.stringify({ documents: [doc] });
      st.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, current_state, created, last_updated, bundle_sha)
                   VALUES (?, 'information', 'test-group', 'collected', ?, ?, ?)`, bundleId, at, at, sha(bundleId));
      for (const [p, t] of [[path, text], ["data/provenance.json", json]])
        st.sql.exec(`INSERT INTO files (bundle_id, path, content, bytes, sha256) VALUES (?, ?, ?, ?, ?)`,
                    bundleId, p, t, Buffer.byteLength(t), sha(t));
      st.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path, encoding, bytes, registered, authored, author, observed_at)
                   VALUES (?, ?, ?, 'utf8', ?, ?, ?, ?, ?)`, digest, bundleId, path, Buffer.byteLength(text), at,
                  authored ? 1 : 0, authored ? actor : null, authored ? at : null);
      if (via) prov.recordReceipt({ address: doc.locator, addressNorm: doc.locator, captureSha: digest,
                                    retrieved: "2026-09-30T09:00:00Z", via });
      return { sha: digest, bundleId };
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
