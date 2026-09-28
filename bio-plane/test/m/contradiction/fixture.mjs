/* contradiction's test fixture: a Durable Object storage stand-in over node:sqlite (`sql.exec`, `transactionSync`
   nesting as savepoints) with the real modules contradiction uses — record-core (`bundles`, purge), membership (the
   sight rule), extraction (`readings` and `readingOf`), content (`content`) and entities (`resolutions`) — and the
   inquiry and basis-version tables laid down with the columns their read contracts name (CONTRADICTION #1 QUESTION
   J1), which the pairing joins. A run gate stands in for ai-runs' (R21). Every test drives `contradiction` at its
   interface. */
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { Extraction } from "../../../src/extraction/index.mjs";
import { migrateContent } from "../../../src/content/schema.mjs";
import { ENTITIES_SCHEMA } from "../../../src/entities/schema.mjs";
import { Contradiction } from "../../../src/contradiction/index.mjs";

export const sha = (s) => createHash("sha256").update(String(s)).digest("hex");
const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);
const run = (sql, text) => {
  const bare = text.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) sql.exec(t);
};

export const MACHINE = "class:admin";
export const MEMBER = "member:m1";
export const OUTSIDER = "member:outsider";

/* The inquiry's and the basis versions' tables, with the columns the pairing reads (their owners' read contracts). */
const INQUIRY_TABLES = `
CREATE TABLE IF NOT EXISTS inquiry_basis (bundle_id TEXT NOT NULL, ord INTEGER NOT NULL, target_id TEXT NOT NULL,
  target_type TEXT NOT NULL, role TEXT NOT NULL, note TEXT, content_id TEXT, PRIMARY KEY (bundle_id, ord));
CREATE TABLE IF NOT EXISTS inquiry_basis_versions (bundle_id TEXT NOT NULL, name TEXT NOT NULL, state TEXT NOT NULL,
  hidden INTEGER NOT NULL DEFAULT 0, claim TEXT, PRIMARY KEY (bundle_id, name));
CREATE TABLE IF NOT EXISTS inquiry_basis_version_legs (bundle_id TEXT NOT NULL, name TEXT NOT NULL, ord INTEGER NOT NULL,
  target_id TEXT NOT NULL, target_type TEXT NOT NULL, content_id TEXT, PRIMARY KEY (bundle_id, name, ord));
`;

export function storage() {
  const db = new DatabaseSync(":memory:");
  run({ exec: (q) => db.exec(q) }, RECORD_SCHEMA);
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

const promotionStub = () => ({ registerStep() { return { ok: true }; }, registerFact() { return { ok: true }; },
                               onCommitted() { return { ok: true }; } });

/* A fresh record with the modules above and contradiction over it. `gate: false` registers no run gate. */
export function world({ gate = true, now = null } = {}) {
  const st = storage();
  const host = { storage: st };
  const record = recordOf(host);
  record.migrate();
  st.sql.exec(`ALTER TABLE bundles ADD COLUMN inquiry_subject_entity TEXT`);
  const membership = membershipOf(host, { record });
  membership.migrate();
  const x = new Extraction(st, { record, membership, promotion: promotionStub() });
  x.migrate();
  migrateContent(st.sql);
  run(st.sql, ENTITIES_SCHEMA);
  run(st.sql, INQUIRY_TABLES);
  st.sql.exec(`INSERT INTO members (member_id, cover, role, status, created, updated) VALUES ('m1', 'c', 'member', 'active', '2026-01-01', '2026-01-01')`);
  st.sql.exec(`INSERT INTO members (member_id, cover, role, status, created, updated) VALUES ('outsider', 'o', 'member', 'active', '2026-01-01', '2026-01-01')`);
  const c = new Contradiction(st, { record, extraction: x, now: now || (() => "2026-09-28T00:00:00Z") });
  c.migrate();
  /* The runs the stand-in gate answers for: {status, principal, hidden}. */
  const runs = new Map();
  const gateCalls = [];
  if (gate) c.registerRunGate("test", ({ run: id, viewer, caller, act }) => {
    gateCalls.push({ run: id, viewer, caller, act });
    const r = runs.get(id);
    if (!r || r.hidden) return null;
    return { status: r.status,
             notPrincipal: caller === r.principal ? null
               : { code: "AI_RUN_NOT_PRINCIPAL", check: "C-22.12", translation: "not the run's principal", detail: act } };
  });
  const w = {
    st, host, record, membership, x, c, runs, gateCalls,
    rows: (q, ...a) => st.sql.exec(q, ...a), one: (q, ...a) => st.sql.exec(q, ...a)[0] || null,
    bundle(id, { type = "information", subject = null } = {}) {
      st.sql.exec(`INSERT OR IGNORE INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version, inquiry_subject_entity)
                   VALUES (?, ?, 'g', ?, 'collected', '2026-01-01', '2026-01-01', 'x', 1, ?)`, id, type, `title of ${id}`, subject);
      return id;
    },
    /* An inquiry bundle; `project: true` makes it a project-typed bundle, the one kind membership withholds (R43). */
    inquiry(id, { subject = null, project = false } = {}) {
      w.bundle(id, { type: project ? "project" : "inquiry", subject });
      if (project) st.sql.exec(`INSERT OR IGNORE INTO project_participants (project_id, member_id, state, owner, created, updated)
                                VALUES (?, 'm1', 'joined', 1, '2026-01-01', '2026-01-01')`, id);
      return id;
    },
    /* A content row over `capture` filed in `bundleId` (content R45's columns). */
    content(contentId, capture, bundleId, { ref = `ref of ${contentId}`, kind = "pdf-page", stale = 0 } = {}) {
      w.bundle(bundleId);
      st.sql.exec(`INSERT INTO content (content_id, capture_sha, bundle_id, extent_kind, extent, ref, minted_by, at, stale)
                   VALUES (?, ?, ?, ?, '{}', ?, 'plane', '2026-01-01', ?)`, contentId, capture, bundleId, kind, ref, stale);
      return contentId;
    },
    leg(inquiry, ord, role, { content = null, target = "INFO-2026-0001", note = null } = {}) {
      st.sql.exec(`INSERT INTO inquiry_basis (bundle_id, ord, target_id, target_type, role, note, content_id)
                   VALUES (?, ?, ?, 'information', ?, ?, ?)`, inquiry, ord, target, role, note, content);
    },
    version(inquiry, name, { state = "accepted", hidden = 0, claim = "a claim" } = {}) {
      st.sql.exec(`INSERT INTO inquiry_basis_versions (bundle_id, name, state, hidden, claim) VALUES (?, ?, ?, ?, ?)`,
                  inquiry, name, state, hidden, claim);
    },
    versionLeg(inquiry, name, ord, { content = null, target = "INFO-2026-0001", type = "information" } = {}) {
      st.sql.exec(`INSERT INTO inquiry_basis_version_legs (bundle_id, name, ord, target_id, target_type, content_id)
                   VALUES (?, ?, ?, ?, ?, ?)`, inquiry, name, ord, target, type, content);
    },
    /* A reading of `capture` (extraction's table): `contentType` its doctype, `date` its top-level date. */
    reading(capture, bundleId, { contentType = null, date = null } = {}) {
      w.bundle(bundleId);
      const reading = { content_type: contentType, found: true, ...(date == null ? {} : { date }) };
      st.sql.exec(`INSERT OR REPLACE INTO readings (capture_sha, bundle_id, content_type, reading) VALUES (?, ?, ?, ?)`,
                  capture, bundleId, contentType, JSON.stringify(reading));
    },
    resolution(capture, bundleId, entity, { established = 1, ref = "ref:1" } = {}) {
      st.sql.exec(`INSERT INTO resolutions (capture_sha, bundle_id, ref, entity_id, grade, method, established)
                   VALUES (?, ?, ?, ?, ?, 'test', ?)`, capture, bundleId, ref, entity, established ? "A" : "C", established);
    },
  };
  return w;
}

/* A K4 world: entity E1, two cited passages of two captures resolving (established) to it, read as `a` and `b`. */
export function k4World(a = {}, b = {}, opts = {}) {
  const w = world(opts);
  w.inquiry("INQ-2026-0001");
  w.content("ca", "capA", "INFO-2026-0001");
  w.content("cb", "capB", "INFO-2026-0002");
  w.leg("INQ-2026-0001", 0, "supports", { content: "ca" });
  w.leg("INQ-2026-0001", 1, "supports", { content: "cb" });
  w.resolution("capA", "INFO-2026-0001", "E1");
  w.resolution("capB", "INFO-2026-0002", "E1");
  if (a !== null) w.reading("capA", "INFO-2026-0001", a);
  if (b !== null) w.reading("capB", "INFO-2026-0002", b);
  return w;
}
