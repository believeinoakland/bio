/* action-producers' test world, copied from queue-producers' (K624 (1)) and driving `actionItems` directly (R13):
   record-core and membership real, over node:sqlite behind a `sql` that answers as workerd's does (a CURSOR, iterable
   once, with `toArray()` and `one()`; K316), so the recipients (R1's rule: membership R65, R68, R74, R80, R86) are its
   own; every other provider in Uses a fake in the shape its requirements publish, which a test fills. The two tables
   the walk below reads (`inquiry_basis`, `refs`) are created here with the columns it needs.

   `homesOf` and `optionsOf` are queue's (its R7, R12), passed in by queue-producers R8; here they are the caller's side
   of that interface: a walk up basis legs and `cites` edges through the viewer's gate, in queue R7's shape, and options
   that record the subjects they were asked about. */
import { DatabaseSync } from "node:sqlite";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf, viewerPredicate } from "../../../src/membership/index.mjs";
import { actionProducersOf } from "../../../src/action-producers/index.mjs";
import { escalationsDue as escalationsDueFixture } from "../escalation/fixtures.mjs";
import { planRead as planReadFixture } from "../action-plans/fixtures.mjs";

export const NOW = Date.parse("2026-09-01T00:00:00Z");
export const iso = (ms) => new Date(ms).toISOString().replace(/\.\d{3}Z$/, "Z");
const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);

function cursor(rows) {
  let used = false;
  const it = {
    [Symbol.iterator]() { if (used) throw new Error("a cursor is iterable once"); used = true; return rows[Symbol.iterator](); },
    toArray() { return [...it]; },
    one() { const a = [...it]; if (a.length !== 1) throw new Error("one(): not exactly one row"); return a[0]; },
  };
  return it;
}

export function world(fakes = {}) {
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
  for (const t of `${RECORD_SCHEMA}`.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n").split(";")) if (t.trim()) db.exec(t);
  db.exec(`CREATE TABLE IF NOT EXISTS inquiry_basis (bundle_id TEXT, ord INTEGER, role TEXT, target_id TEXT, content_id TEXT, note TEXT);
           CREATE TABLE IF NOT EXISTS refs (bundle_id TEXT, target_id TEXT, kind TEXT)`);
  record.migrate();
  membership.migrate();
  const F = defaultFakes();
  for (const [k, v] of Object.entries(fakes)) F[k] = { ...F[k], ...v };
  const p = actionProducersOf(host, { record, membership, ...F });

  /* The caller's R7 walk: every inquiry and project upward by basis legs and cites, through the viewer's gate. */
  const homesOf = (viewer) => (subjects) => {
    const gate = viewerPredicate(viewer);
    const seen = new Set(subjects), found = [];
    let frontier = [...subjects], depth = 0;
    while (frontier.length && depth < 6) {
      depth += 1;
      const next = [];
      for (const n of frontier)
        for (const r of db.prepare(`SELECT bundle_id FROM inquiry_basis WHERE target_id=? UNION SELECT bundle_id FROM refs WHERE target_id=? AND kind='cites'`).all(n, n)) {
          if (seen.has(r.bundle_id)) continue;
          seen.add(r.bundle_id); next.push(r.bundle_id);
          const b = db.prepare(`SELECT b.bundle_id, b.object_type FROM bundles b WHERE b.bundle_id=? AND (${gate.sql})`).get(r.bundle_id, ...gate.args.map(bind));
          if (b && ["inquiry", "project"].includes(b.object_type)) found.push({ id: b.bundle_id, type: b.object_type, depth });
        }
      frontier = next;
    }
    found.sort((a, b) => (a.id < b.id ? -1 : 1));
    return { state: "determined", ungrouped: found.length === 0, reasons: [], depth_bound: 6, ancestors: found, of: [...subjects] };
  };
  const asked = { homes: [], options: [] };
  const w = {
    db, sql, host, record, membership, p, fakes: F, statements, now: NOW, asked,
    run: (s, ...a) => db.prepare(s).run(...a.map(bind)),
    bundle(id, type = "information", { title = id, state = null } = {}) {
      const st = state || ({ inquiry: "open", project: "active", information: "collected" }[type] || "collected");
      db.prepare(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha)
                  VALUES (?,?,?,?,?,?,?,?)`).run(id, type, "g", title, st, iso(NOW), iso(NOW), "sha");
      return id;
    },
    member(id, { role = "member", status = "active" } = {}) {
      db.prepare(`INSERT INTO members (member_id, cover, role, status, created, updated, pairing_published) VALUES (?,?,?,?,?,?,0)`)
        .run(id, id, role, status, iso(NOW), iso(NOW));
      return id;
    },
    join(project, member, { owner = false, state = "joined" } = {}) {
      db.prepare(`INSERT INTO project_participants (project_id, member_id, state, owner, created, updated) VALUES (?,?,?,?,?,?)`)
        .run(project, member, state, owner ? 1 : 0, iso(NOW), iso(NOW));
    },
    /** A project its owners set discoverable (membership R45's record, re-derived into R85's index), so an administrator
     *  outside it still sees it whole (membership R43; K2409). A project with no such act is hidden (D54). */
    discoverable(project) {
      db.prepare(`INSERT INTO project_visibility (project_id, setting, set_by, reason, at) VALUES (?,?,?,?,?)`)
        .run(project, "discoverable", "owner", null, iso(NOW));
      membership.reindexProjectSight(project);
    },
    cite(from, to, kind = "cites") { db.prepare(`INSERT INTO refs (bundle_id, target_id, kind) VALUES (?,?,?)`).run(from, to, kind); },
    leg(inquiry, target, ord = 0) { db.prepare(`INSERT INTO inquiry_basis (bundle_id, ord, role, target_id) VALUES (?,?,?,?)`).run(inquiry, ord, "supports", target); },
    /** R13's read, as queue-producers R8 makes it: homesOf and optionsOf closed over the viewer, as queue passed them. */
    read(member = null, viewer = member ? `member:${member}` : "class:admin", { now = NOW, homes = true, options = true } = {}) {
      const walk = homesOf(viewer);
      return p.actionItems({ member, viewer, now,
        homesOf: homes ? (s) => { asked.homes.push([...s]); return walk(s); } : undefined,
        optionsOf: options ? (s) => { asked.options.push([...s]); return s.length ? [{ id: "opt", on: [...s] }] : []; } : undefined });
    },
  };
  return w;
}

/* escalation's and action-plans' published fixtures (K4990): their real answers, made by their real code the first time a test
   asks, shaped by them and never by this file. A test routes an answer to this world's members and projects by naming the
   fields it changes (`project`, `opened_by`, `id`); every other field is the provider's own. */
let escalationReal = null, planReal = null;
const escalationFixture = () => (escalationReal ||= escalationsDueFixture());
const planFixture = () => (planReal ||= planReadFixture());
/** escalation R16's answer when no escalation is due. */
export const noEscalations = () => escalationFixture().none;
/** escalation R16's answer with one item per argument: the real item, the fields given set over it. */
export const escalationsAnswer = (...items) => ({ ...escalationFixture().due, items: items.map((x) => ({ ...escalationFixture().due.items[0], ...x })) });
/** action-plans R6's answer for a plan the viewer sees: the real read, the id and project of this world's plan set over it. */
export const planAnswer = (id, project) => ({ ...planFixture().read, id, project });
/** action-plans R1's answer for a plan that is unknown or not seen. */
export const noSuchPlan = () => planFixture().unknownAnswer;

/** Every provider the producers reach, answering nothing until a test says otherwise. */
export function defaultFakes() {
  const none = () => ({ ok: true, items: [], limit: 500, truncated: false, cursor: null });
  return {
    actionClocks: { overdueClocks: none, remindersDue: none, pendingClocks: () => ({ ok: true, before: "9999-12-31", items: [], limit: 500, truncated: false, cursor: null }),
                    remindersFor: ({ action }) => ({ ok: true, action, reminders: [], truncated: false }),
                    calendarFactsRead: () => ({ ok: true, as_of: "2026-09-01", paths: [], actions_limit: 500, truncated: false }) },
    escalation: { escalationsDue: () => noEscalations() },
    actionPlans: { checkpointsDue: () => ({ ok: true, items: [], limit: 500, truncated: false }),
                   plansToLookAgain: () => ({ ok: true, items: [], limit: 500, truncated: false }),
                   planRead: () => noSuchPlan() },
    planWork: { takeUpsFor: () => ({ ok: true, items: [], truncated: false, cursor: null, limit: 500 }),
                planReviewsDue: () => ({ ok: true, items: [], limit: 500, truncated: false }) },
    /* actions R12's place: the active profiles' combined view, of which this module reads the `time_zone` (R18, R20) */
    actions: { place: () => ({ time_zone: { value: "UTC", status: "ruled", basis: "TEST" } }) },
    actionHolds: { holdsDue: none, holdsReleased: none },
    filingTemplates: { reviewsRequested: none },
    localFacts: { factsDue: () => ({ ok: true, due: [], unknown: [], absent: [] }) },
    following: { watchQuestions: () => ({ ok: true, questions: [], cursor: null }) },
    /* filings R53 (T47; R25): the approved drafts and communications not yet recorded sent */
    filings: { approvedUnsent: () => ({ ok: true, items: [], truncated: false }) },
  };
}

/** The items of a read by id. */
export const byId = (r) => Object.fromEntries((r.items || []).map((i) => [i.id, i]));
export const page = (items, extra = {}) => ({ ok: true, items, limit: 500, truncated: false, cursor: null, ...extra });
export const ofKind = (r, kind) => r.items.filter((i) => i.kind === kind);
export const DAY = 86400000;
export const day = (ms) => iso(ms).slice(0, 10);
