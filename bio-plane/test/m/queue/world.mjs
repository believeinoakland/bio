/* The queue's test world: record-core, membership and credentials real, over node:sqlite behind a `sql` that answers as workerd's
   does (a CURSOR, iterable once, with `toArray()` and `one()`, never an array; K316); every other provider a fake in
   the shape its requirements publish, which a test fills. The tables other modules own and this module reads by their
   read contracts (record-core R37, provenance R48, inquiry R40, connections R58, progressions R34) are made by their
   owners' `migrate()` where this module uses the owner, else created here with exactly the contracted columns
   (`schema.mjs` holds no fragment since T19, so nothing is read from it). */
import { DatabaseSync } from "node:sqlite";
import { recordOf } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { credentialsOf } from "../../../src/credentials/index.mjs";
import { queueOf } from "../../../src/queue/index.mjs";
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

/** `bare`: the instance is reached before any table exists (a store's first boot); `w.boot()` then creates them. */
export function world(fakes = {}, { bare = false } = {}) {
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
  const host = { storage };
  const record = recordOf(host, { evidence: null, evidencePrefix: "bio/captures/" });
  const membership = membershipOf(host, { record });
  /* `credentials` real (K789): the signing keys, the claim and the credentials are its tables since membership's split,
     so a feed that asks for self-registered keys (queue-producers R14) reads them there. */
  const credentials = credentialsOf(host, { record, membership });
  const boot = () => {
    db.exec(`CREATE TABLE IF NOT EXISTS register (capture_sha TEXT PRIMARY KEY, bundle_id TEXT, path TEXT, registered TEXT,
               authored INTEGER, bytes INTEGER, author TEXT);
             CREATE TABLE IF NOT EXISTS captured_locators (address_norm TEXT, address TEXT, retrieval_locator TEXT, capture_sha TEXT,
               first_retrieved TEXT, last_retrieved TEXT, via TEXT);
             CREATE TABLE IF NOT EXISTS inquiry_basis (bundle_id TEXT, ord INTEGER, role TEXT, target_id TEXT, content_id TEXT, note TEXT);
             CREATE TABLE IF NOT EXISTS refs (bundle_id TEXT, target_id TEXT, kind TEXT);
             CREATE TABLE IF NOT EXISTS inquiry_basis_version_legs (bundle_id TEXT, name TEXT, ord INTEGER, target_id TEXT, target_type TEXT,
               role TEXT, grade TEXT, grade_axis TEXT, grade_source TEXT, ground TEXT, content_id TEXT);
             CREATE TABLE IF NOT EXISTS progression_instances (progression_key TEXT, entity_id TEXT, stage_key TEXT, capture_sha TEXT, bundle_id TEXT)`);
    record.migrate();
    membership.migrate();
    credentials.migrate();
  };
  if (!bare) boot();
  const F = defaultFakes();
  for (const [k, v] of Object.entries(fakes)) F[k] = { ...F[k], ...v };
  /* `tasks` real (its R6 is what the feed reads), over the capture and provenance fakes; its table made at boot. */
  const tasks = tasksOf(host, { record, membership, start: false, now: () => w.now, capture: F.capture, provenance: F.provenance });
  if (!bare) tasks.migrate();
  const q = queueOf(host, { record, membership, start: false, now: () => w.now, tasks, ...F });
  /* R36: queue makes its own tables (`migrate`), never through the legacy store's SCHEMA (K735). */
  if (!bare) q.migrate();
  const w = {
    db, sql, host, record, membership, credentials, q, tasks, fakes: F, statements, now: NOW, boot: () => { boot(); tasks.migrate(); q.migrate(); },
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
    leg(inquiry, target, ord = 0) { db.prepare(`INSERT INTO inquiry_basis (bundle_id, ord, role, target_id) VALUES (?,?,?,?)`).run(inquiry, ord, "supports", target); },
    task(id, refersTo, { kind = "authority-undetermined", assignee = "unassigned", role = "group-admin", status = "open",
                         created = iso(NOW - 3600000), resolvedAt = null, history = null } = {}) {
      db.prepare(`INSERT INTO tasks (id, kind, refers_to, subject_text, assignee, assignee_role, status, created, resolved_at, history)
                  VALUES (?,?,?,?,?,?,?,?,?,?)`).run(id, kind, refersTo, `about ${refersTo}`, assignee, role, status, created,
        resolvedAt, JSON.stringify(history || [{ at: created, event: "created", actor: "alarm" }]));
    },
    feed(member = null, viewer = member ? `member:${member}` : "class:admin", limit = null) {
      return q.queueFeed({ member, viewer, limit });
    },
  };
  return w;
}

/** Every provider the feed and the acts reach, answering nothing until a test says otherwise. queue hands the
 *  producers' own (governor … contradiction) to `queue-producers`, whose real `feedItems` then reads them, unless a
 *  test gives `producers` itself. */
export function defaultFakes() {
  return {
    governor: { governorHolding: () => [] },
    provenance: { homeOf: () => null },
    capture: { liveCaptureSessions: () => [], taskEvents: () => [], taskEventCount: () => 0, taskEventAttempt: () => true,
               taskEventRemove: () => true, on: () => ({ ok: true }) },
    captureRequests: { completed: () => ({ requests: [] }), leads: () => ({ requests: [] }), rendersHeld: () => ({ requests: [] }) },
    connections: { edgeSevered: () => false },
    basisVersions: { projectsDrawingOn: () => Object.assign([], { bound: 32, truncated: false }), conclusionOf: () => null,
                     conclusionRecordOf: () => ({ stance: null }), basisVersions: () => ({ ok: true, versions: [], truncated: false }) },
    progressions: { proposalsFeed: () => ({ instances: [], proposals: [], dispositions: [] }),
                    disposeProposal: (a) => ({ ok: true, scope: "instance", progression_arm: a }) },
    aiRuns: { runFor: () => null },
    bias: { uncleared: () => ({ debts: [], limit: 200, truncated: false }),
            settled: ({ limit }) => ({ debts: [], limit, truncated: false }) },
    publication: { exportLog: () => ({ ok: true, exports: [], limit: 200, truncated: false }),
                   caseTensions: () => ({ ok: true, cases: [], limit: 200, cursor: null }) },
    reevaluation: { notices: () => ({ ok: true, notices: [], limit: 1000, truncated: false }),
                    correctedDependents: () => ({ ok: true, entries: [], limit: 200, truncated: false, cursor: null }) },
    intent: { gaps: () => ({ ok: true, gaps: [] }) },
    monitoring: { monitoring: () => ({ ok: true, items: [], truncated: false }),
                  flagged: () => ({ ok: true, items: [], limit: 200, truncated: false }),
                  archiveEligible: () => ({ ok: true, eligible: [], limit: 50, truncated: false, paused: { paused: false } }),
                  /* monitoring R63 (queue-producers R26): no sweep condition until a test says otherwise. */
                  sweepConditions: () => ({ ok: true, conditions: [] }) },
    contradiction: { candidatesFor: () => ({ ok: true, candidates: [], truncated: false, cursor: null }),
                     conflictNotices: () => ({ ok: true, notices: [], truncated: false, cursor: null }) },
    /* actions R54 (queue-producers R19): no legal pressure mark awaits a hold until a test says otherwise. */
    actions: { holdsDue: () => ({ ok: true, items: [], truncated: false, cursor: null }) },
    /* filing-templates R20, local-facts R4 (queue-producers R20, R21; K921): no review asked and no fact due until a test
       says otherwise. */
    filingTemplates: { reviewsRequested: ({ limit } = {}) => ({ ok: true, items: [], limit: limit ?? 500, truncated: false, cursor: null }) },
    localFacts: { factsDue: () => ({ ok: true, due: [], unknown: [], absent: [] }) },
    affordances: { affordanceFacts: () => ({ ok: false }) },
    scheduler: { arm: async () => null, register: () => ({ ok: true }) },
  };
}

/** The items of a feed by id. */
export const byId = (feed) => Object.fromEntries((feed.items || []).map((i) => [i.id, i]));
