/* entities' test fixture: a Durable Object storage stand-in over node:sqlite (`sql.exec`, `transactionSync` nesting as
   savepoints) with the real modules entities uses — record-core, membership, extraction (whose writer lays down the
   readings, references and name terms R9–R19 read) and provenance (the register, the captured locators and the
   declared origin R22–R23 read) — and a promotion registry standing in for promotion's R39, which provenance and
   extraction join. Every test drives `entities` at its interface. */
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { Extraction } from "../../../src/extraction/index.mjs";
import { provenanceOf } from "../../../src/provenance/index.mjs";
import { Entities } from "../../../src/entities/index.mjs";

export const sha = (s) => createHash("sha256").update(String(s)).digest("hex");
const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);

export function storage() {
  const db = new DatabaseSync(":memory:");
  const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) db.exec(t);
  let n = 0;
  return {
    db,
    sql: { exec(q, ...args) {
      const st = db.prepare(q);
      return st.columns().length ? st.all(...args.map(bind)).map((r) => ({ ...r })) : (st.run(...args.map(bind)), []);
    } },
    transactionSync(fn) {
      const sp = `sp${n++}`;
      db.exec(`SAVEPOINT ${sp}`);
      try { const r = fn(); db.exec(`RELEASE ${sp}`); return r; }
      catch (e) { db.exec(`ROLLBACK TO ${sp}`); db.exec(`RELEASE ${sp}`); throw e; }
    },
  };
}

function promotionStub() {
  const steps = [], facts = [];
  return { steps, registerStep(module, s) { steps.push({ module, ...s }); return { ok: true }; },
           registerFact(name, module, fn) { facts.push({ name, module, fn }); return { ok: true }; },
           onCommitted() { return { ok: true }; } };
}

/* A fresh record with the modules above and entities over it. `profiles` sets the instance's active jurisdiction
   profiles (record-core R26); `now` fixes entities' clock. */
export function world({ profiles = null, now = null } = {}) {
  const st = storage();
  const host = { storage: st };
  const record = recordOf(host);
  record.migrate();
  const membership = membershipOf(host, { record });
  membership.migrate();
  const promotion = promotionStub();
  const x = new Extraction(st, { record, membership, promotion });
  x.migrate();
  const prov = provenanceOf(host, { record, membership, promotion, now: () => "2026-09-27T00:00:00Z" });
  prov.migrate();
  if (profiles) record.setSetting("jurisdiction_profiles", profiles, "test");
  let clock = 0;
  const e = new Entities(st, { record, membership, provenance: prov,
                               now: now || (() => new Date(Date.UTC(2026, 8, 27, 0, 0, clock++)).toISOString()) });
  e.migrate();
  const w = {
    st, host, record, membership, x, prov, e,
    rows: (q, ...a) => st.sql.exec(q, ...a), one: (q, ...a) => st.sql.exec(q, ...a)[0] || null,
    /* A bundle row (record-core's `bundles`, its R37 read contract); a project bundle when `project` is true. */
    bundle(id, { type = "information" } = {}) {
      st.sql.exec(`INSERT OR IGNORE INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version)
                   VALUES (?, ?, 'g', 't', 'collected', '2026-01-01', '2026-01-01', 'x', 1)`, id, type);
      return id;
    },
    /* A reading of `captureSha` filed in `bundleId`, carrying `refs` ({kind, key, label, ref?}), through
       extraction's writer (its R19): the reading tables R9–R19 read. */
    read(bundleId, captureSha, refs, { contentType = "text/html" } = {}) {
      w.bundle(bundleId);
      return x.writeReading({ bundleId, captureSha, composed: true,
        reading: { content_type: contentType, reader_version: 1, found: true, at: "2026-09-27T00:00:00Z",
                   entities: refs.map((r) => ({ ...r })) } });
    },
    /* A register home (provenance's table, its R48 read contract) and the addresses the record located it at
       (provenance R13's receipts). */
    held(bundleId, captureSha, addresses = []) {
      w.bundle(bundleId);
      st.sql.exec(`INSERT OR REPLACE INTO register (capture_sha, bundle_id, path, encoding, bytes, registered)
                   VALUES (?, ?, 'snapshots/x', 'utf8', 1, '2026-09-27T00:00:00Z')`, captureSha, bundleId);
      for (const a of addresses) {
        const u = new URL(a);
        prov.recordReceipt({ address: a, addressNorm: u.href.toLowerCase(), captureSha, retrieved: "2026-09-27T00:00:00Z" });
      }
      return captureSha;
    },
    /* A project (a bundle of type `project`, what membership R43 withholds) with one participant. */
    project(id, participant = null) {
      w.bundle(id, { type: "project" });
      st.sql.exec(`INSERT OR IGNORE INTO members (member_id, cover, role, status) VALUES ('outsider', 'o', 'member', 'active')`);
      if (participant) {
        st.sql.exec(`INSERT OR IGNORE INTO members (member_id, cover, role, status) VALUES (?, 'c', 'member', 'active')`, participant);
        st.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, owner, created, updated)
                     VALUES (?, ?, 'joined', 1, '2026-01-01', '2026-01-01')`, id, participant);
      }
      return id;
    },
  };
  return w;
}

export const MACHINE = "class:admin";
