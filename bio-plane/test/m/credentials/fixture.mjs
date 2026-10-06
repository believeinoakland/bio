/* The credentials module over a real SQLite database (node:sqlite), with the real membership module beside it (the
   services credentials reads: memberFacts, sessionRights, activeAdmins, isAdministrator, notAnAdmin, onRevoked,
   registerClaimed) and a stub record-core that provides what the two use (bundleInfo, declarePurge). Members are made
   through membership's own acts and given their passwords through this module's `setPassword` (R3), so the world holds
   whichever module writes the password at enrolment. Every test drives the module at its interface. */
import { DatabaseSync } from "node:sqlite";
import { membershipOf } from "../../../src/membership/index.mjs";
import { credentialsOf, credentialsOps } from "../../../src/credentials/index.mjs";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";

const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);

export function sqlOver(db) {
  return {
    exec(q, ...args) {
      const st = db.prepare(q);
      return st.columns().length ? st.all(...args.map(bind)).map((r) => ({ ...r })) : (st.run(...args.map(bind)), []);
    },
  };
}

export const PASSWORD = (id) => `${id}-passphrase-x`;
export const FOUNDER_PASSWORD = "founder-passphrase-1";

/* A record-core stub whose `declarePurge` and `declareTable` answer as record-core's R21 does: a table declared twice,
   or by two modules, is refused naming its holder; an entry missing a class, or with a value outside R21's, is
   refused naming the table and the class; a refused declaration declares nothing. */
const TABLE_CLASSES = { purge: ["clear", "exempt"], expunge: ["tombstone", "none"], export: ["yes", "admin-only", "never"],
  sight: ["group", "bundle", "source", "owner"], derive: ["stored", "derived-rebuildable"], version_chain: [true, false] };
function stubCore(db) {
  const declared = new Map();
  return {
    declared,
    bundleInfo(id) {
      const r = db.prepare(`SELECT bundle_id, object_type, title FROM bundles WHERE bundle_id=?`).get(bind(id));
      return r ? { id: r.bundle_id, type: r.object_type, title: r.title, project: null } : null;
    },
    declarePurge(module, tables = [], { exempt = [] } = {}) {
      const names = [...tables.map((t) => (typeof t === "string" ? t : t.name)), ...exempt];
      for (const n of names)
        if (declared.has(n)) return { ok: false, reason: "TABLE_DECLARED", table: n, module, declaredBy: declared.get(n).module };
      for (const n of tables) declared.set(typeof n === "string" ? n : n.name, { module, exempt: false });
      for (const n of exempt) declared.set(n, { module, exempt: true });
      return { ok: true };
    },
    declareTable(module, entries = []) {
      for (const e of entries) {
        if (declared.has(e.name)) return { ok: false, reason: "TABLE_DECLARED", table: e.name, module, declaredBy: declared.get(e.name).module };
        for (const [cls, values] of Object.entries(TABLE_CLASSES)) {
          if (!(cls in e)) return { ok: false, reason: "TABLE_CLASS_MISSING", table: e.name, class: cls };
          if (!values.includes(e[cls])) return { ok: false, reason: "TABLE_CLASS_UNKNOWN", table: e.name, class: cls };
        }
      }
      for (const e of entries) declared.set(e.name, { module, exempt: e.purge === "exempt", classes: { ...e } });
      return { ok: true };
    },
  };
}

/* The seal secret the composition root hands in (R23, R29); a test world binds one unless told not to. */
export const SEAL = "test-seal-secret-0123456789";

export function world({ sealSecret = SEAL } = {}) {
  const db = new DatabaseSync(":memory:");
  db.exec(`CREATE TABLE bundles (bundle_id TEXT PRIMARY KEY, object_type TEXT NOT NULL, title TEXT)`);
  const core = stubCore(db);
  const sql = sqlOver(db);
  const ctx = { storage: { sql } };
  const m = membershipOf(ctx, { record: core });
  m.migrate();
  const c = credentialsOf(ctx, { record: core, membership: m, sealSecret });
  if (credentialsOf(ctx) !== c) throw new Error("credentialsOf answers one instance per storage");
  c.migrate();
  const w = {
    db, sql, core, m, c, ctx,
    row(q, ...a) { return sql.exec(q, ...a)[0] ?? null; },
    rows(q, ...a) { return sql.exec(q, ...a); },
    /* The founder claims the instance (R1). */
    async claim() { return c.claim({ password: FOUNDER_PASSWORD, tokenFp: "fp-1" }); },
    /* Invite (membership) and enrol to active, then set the member's password here (R3). */
    async enrol(id, role = "member", by = "admin", caps = null) {
      const a = await m.memberAdd({ memberId: id, cover: `cover of ${id}`, role, capabilities: caps, by });
      if (!a.ok) return a;
      const e = await m.enroll({ invite: a.invite, handle: id, password: PASSWORD(id) });
      if (e.ok) await c.setPassword({ role: `member:${id}`, password: PASSWORD(id) });
      return e;
    },
    /* The founder plus a second administrator, so ordinary members may be added; then each member, enrolled. */
    async group(...members) {
      await w.claim();
      await w.enrol("second", "admin");
      for (const id of members) await w.enrol(id);
      return w;
    },
    /* Every table's rows, to show an act wrote nothing. */
    snapshot() {
      return JSON.stringify(w.rows(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`)
        .map(({ name }) => [name, w.rows(`SELECT * FROM "${name}"`)]));
    },
    ops(query = "", body = null) {
      return credentialsOps(c, new URL(`http://x/?${query}`), body, { VERSION: "test-build" });
    },
  };
  return w;
}

/* The two modules over the REAL record-core (its schema, `recordOf` and purge), for what only the three together show
   (R18). Membership boots first, as the store boots it. */
export function realWorld() {
  const db = new DatabaseSync(":memory:");
  const sql = sqlOver(db);
  const storage = { sql, transactionSync(fn) {
    db.exec("SAVEPOINT t");
    try { const r = fn(); db.exec("RELEASE t"); return r; } catch (e) { db.exec("ROLLBACK TO t"); db.exec("RELEASE t"); throw e; }
  } };
  const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const st of bare.split(";")) { const t = st.trim(); if (t) db.exec(t); }
  const ctx = { storage };
  const rc = recordOf(ctx);
  if (typeof rc.migrate === "function") rc.migrate();
  const m = membershipOf(ctx);
  m.migrate();
  const c = credentialsOf(ctx, { sealSecret: SEAL });
  c.migrate();
  return { db, sql, ctx, rc, m, c, row(q, ...a) { return sql.exec(q, ...a)[0] ?? null; } };
}
