/* The tasks module's test world: record-core and membership real, over node:sqlite behind a `sql` that answers as
   workerd's does (a CURSOR, iterable once, with `toArray()` and `one()`, never an array; K316); every other provider a
   fake in the shape its requirements publish, which a test fills. The tables other modules own and this module reads
   by their read contracts (record-core R37, connections R58) are their owners' schemas where an owner publishes one
   (record-core's, membership's, credentials'), else created here with exactly the contracted columns. */
import { DatabaseSync } from "node:sqlite";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { credentialsOf } from "../../../src/credentials/index.mjs";
import { tasksOf } from "../../../src/tasks/index.mjs";

export const NOW = Date.parse("2026-09-01T00:00:00Z");
export const iso = (ms) => new Date(ms).toISOString().replace(/\.\d{3}Z$/, "Z");
const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);

/** A workerd-shaped cursor over rows: iterable once, `toArray()`, `one()`. */
function cursor(rows) {
  let used = false;
  const it = {
    [Symbol.iterator]() { if (used) throw new Error("a cursor is iterable once"); used = true; return rows[Symbol.iterator](); },
    toArray() { return [...it]; },
    one() { const a = [...it]; if (a.length !== 1) throw new Error("one(): not exactly one row"); return a[0]; },
  };
  return it;
}

/** A host over one in-memory database: `{db, host, record, membership, credentials, boot}`; the founder's claim, which
 *  membership reads through credentials (its R94; credentials R17), is made through credentials (its R1). `bare`: no table exists until `boot()`. */
export function host({ bare = false } = {}) {
  const db = new DatabaseSync(":memory:");
  const statements = [];
  let sp = 0;
  const sql = { exec(q, ...a) {
    statements.push(q);
    for (const m of q.matchAll(/(?:LIKE|GLOB)\s+'([^']*)'/gi)) if (m[1].length > 50) throw new Error("LIKE/GLOB over 50 bytes (K313)");
    const st = db.prepare(q);
    if (st.columns().length) return cursor(st.all(...a.map(bind)).map((r) => ({ ...r })));
    st.run(...a.map(bind)); return cursor([]);
  } };
  const storage = { sql, transactionSync(fn) { const n = `sp${sp++}`; db.exec(`SAVEPOINT ${n}`);
    try { const r = fn(); db.exec(`RELEASE ${n}`); return r; } catch (e) { db.exec(`ROLLBACK TO ${n}`); db.exec(`RELEASE ${n}`); throw e; } } };
  const h = { storage };
  const record = recordOf(h, { evidence: null, evidencePrefix: "bio/captures/" });
  const membership = membershipOf(h, { record });
  const credentials = credentialsOf(h, { record, membership });
  const boot = () => {
    for (const t of RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n").split(";")) if (t.trim()) db.exec(t);
    db.exec(`CREATE TABLE IF NOT EXISTS refs (bundle_id TEXT, target_id TEXT, kind TEXT)`);
    record.migrate();
    membership.migrate();
    credentials.migrate();
  };
  if (!bare) boot();
  return { db, sql, host: h, record, membership, credentials, statements, boot };
}

/** `bare`: the instance is reached before any table exists (a store's first boot); `w.boot()` then creates them. */
export function world(fakes = {}, { bare = false, start = false } = {}) {
  const base = host({ bare });
  const { db, record, membership } = base;
  const F = defaultFakes();
  for (const [k, v] of Object.entries(fakes)) F[k] = { ...F[k], ...v };
  const t = tasksOf(base.host, { record, membership, start, now: () => w.now, ...F });
  if (!bare) t.migrate();
  const w = {
    ...base, t, fakes: F, now: NOW,
    boot() { base.boot(); t.migrate(); },
    run: (s, ...a) => db.prepare(s).run(...a.map(bind)),
    all: (s, ...a) => db.prepare(s).all(...a.map(bind)),
    bundle(id, type = "information", { title = id, state = null } = {}) {
      const st = state || ({ inquiry: "open", project: "active", information: "collected" }[type] || "collected");
      db.prepare(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha)
                  VALUES (?,?,?,?,?,?,?,?)`).run(id, type, "g", title, st, iso(NOW), iso(NOW), "sha");
      return id;
    },
    member(id, { role = "member", status = "active", created = iso(NOW) } = {}) {
      db.prepare(`INSERT INTO members (member_id, cover, role, status, created, updated, pairing_published) VALUES (?,?,?,?,?,?,0)`)
        .run(id, id, role, status, created, iso(NOW));
      return id;
    },
    join(project, member, { owner = false, state = "joined" } = {}) {
      db.prepare(`INSERT INTO project_participants (project_id, member_id, state, owner, created, updated) VALUES (?,?,?,?,?,?)`)
        .run(project, member, state, owner ? 1 : 0, iso(NOW), iso(NOW));
    },
    cite(from, to, kind = "cites") { db.prepare(`INSERT INTO refs (bundle_id, target_id, kind) VALUES (?,?,?)`).run(from, to, kind); },
    task(id, refersTo, { kind = "authority-undetermined", assignee = "unassigned", role = "group-admin", status = "open",
                         created = iso(NOW - 3600000), resolvedAt = null, history = null } = {}) {
      db.prepare(`INSERT INTO tasks (id, kind, refers_to, subject_text, assignee, assignee_role, status, created, resolved_at, history)
                  VALUES (?,?,?,?,?,?,?,?,?,?)`).run(id, kind, refersTo, `about ${refersTo}`, assignee, role, status, created,
        resolvedAt, JSON.stringify(history || [{ at: created, event: "created", actor: "alarm" }]));
    },
  };
  return w;
}

/** Every provider the inbox reaches, answering nothing until a test says otherwise. */
export function defaultFakes() {
  return {
    provenance: { homeOf: () => null },
    capture: { taskEvents: () => [], taskEventCount: () => 0, taskEventAttempt: () => true,
               taskEventRemove: () => true, on: () => ({ ok: true }) },
    connections: { edgeSevered: () => false },
    scheduler: { arm: async () => null, register: () => ({ ok: true }) },
  };
}

/** A capture queue the drain reads (capture R45), with the provenance homes it resolves (provenance R4). */
export function inbox(events = [], homes = {}) {
  const queue = [...events];
  const log = [];
  const w = world({
    capture: {
      taskEvents: ({ limit }) => queue.slice(0, limit).map((e) => ({ ...e })),
      taskEventCount: () => queue.length,
      taskEventAttempt: ({ kind, captureSha, at }) => { const e = queue.find((x) => x.kind === kind && x.captureSha === captureSha);
        if (e) { e.attempts += 1; e.lastTry = at; } log.push(["attempt", captureSha]); return !!e; },
      taskEventRemove: ({ kind, captureSha }) => { const i = queue.findIndex((x) => x.kind === kind && x.captureSha === captureSha);
        if (i >= 0) queue.splice(i, 1); log.push(["remove", captureSha]); return i >= 0; } },
    provenance: { homeOf: (sha) => (homes[sha] ? { bundleId: homes[sha] } : null) } });
  w.queue = queue; w.log = log;
  return w;
}
export const ev = (sha, subject = "subject", locator = "https://x.example/d") =>
  ({ kind: "authority-undetermined", captureSha: sha, subject, locator, enqueued: iso(NOW), attempts: 0, lastTry: null });
