/* The ai-accounts module over a real SQLite database (node:sqlite), with the real membership module beside it (the
   services ai-accounts reads: memberFacts, isAdministrator, notAnAdmin, onRevoked, listenerRefusal, sight,
   existenceAct, projectAuthority, isProjectOwner, isJoinedParticipant, joinedParticipants, notTheOwner, noSuchProject)
   and a stub record-core that provides what the two use (bundleInfo, declarePurge, declareTable). It never builds
   credentials, which is later in the order (split map §6): the founder's claim, which credentials states to membership
   (its R17, membership R94), is a test fact registered here, and enrolment's password setter (membership R95) a test
   setter that stores nothing. Members are made through membership's own acts. Every test drives the module at its
   interface. */
import { DatabaseSync } from "node:sqlite";
import { membershipOf } from "../../../src/membership/index.mjs";
import { aiAccountsOf, aiAccountsOps } from "../../../src/ai-accounts/index.mjs";
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

/* (T47; R19) the sign-in token a member's Claude Code `setup-token` would print, one per member, a sentinel. */
export const SIGNIN_TOKEN = (id) => `sk-ant-oat01-sentinel-${id}-0123456789`;

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
      const r = db.prepare(`SELECT bundle_id, object_type, title, project FROM bundles WHERE bundle_id=?`).get(bind(id));
      return r ? { id: r.bundle_id, type: r.object_type, title: r.title, project: r.project ?? null } : null;
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

/* The seal secret the composition root hands in through credentials (R24, R32); a test world binds one unless told
   not to. */
export const SEAL = "test-seal-secret-0123456789";

/* The test's own facts for membership's two credentials seams: whether the instance is claimed (membership R94) and
   the enrolment's password setter (R95), which stores nothing. */
function seams(m, fact) {
  m.registerClaimed("test-claim", () => fact.claimed === true);
  m.registerPasswordSetter(() => ({ ok: true }), "test-password");
}

export function world({ sealSecret = SEAL } = {}) {
  const db = new DatabaseSync(":memory:");
  db.exec(`CREATE TABLE bundles (bundle_id TEXT PRIMARY KEY, object_type TEXT NOT NULL, title TEXT, project TEXT)`);
  const core = stubCore(db);
  const sql = sqlOver(db);
  const ctx = { storage: { sql } };
  const m = membershipOf(ctx, { record: core });
  m.migrate();
  const fact = { claimed: false };
  seams(m, fact);
  const a = aiAccountsOf(ctx, { record: core, membership: m, sealSecret });
  if (aiAccountsOf(ctx) !== a) throw new Error("aiAccountsOf answers one instance per storage");
  a.migrate();
  const w = {
    db, sql, core, m, a, c: a, ctx, fact,
    row(q, ...args) { return sql.exec(q, ...args)[0] ?? null; },
    rows(q, ...args) { return sql.exec(q, ...args); },
    /* The founder claims the instance: the test's fact (membership R94). */
    async claim() { fact.claimed = true; return { ok: true }; },
    /* Invite (membership) and enrol to active. */
    async enrol(id, role = "member", by = "admin", caps = null) {
      const x = await m.memberAdd({ memberId: id, cover: `cover of ${id}`, role, capabilities: caps, by });
      if (!x.ok) return x;
      return m.enroll({ invite: x.invite, handle: id, password: `${id}-passphrase-x` });
    },
    /* (T47; R19) `id` signs in through their Claude subscription: the door holds the token the sign-in printed. */
    async signin(id, validFor = null) {
      return a.subscriptionTokenHold({ member: id, token: SIGNIN_TOKEN(id), validFor });
    },
    /* The founder plus a second administrator, so ordinary members may be added; then each member, enrolled. */
    async group(...members) {
      await w.claim();
      await w.enrol("second", "admin");
      for (const id of members) await w.enrol(id);
      return w;
    },
    /* (T40) A project bundle created by `owner` through membership's own act (its R71), with its visibility. */
    project(id, owner, visibility = "hidden") {
      db.prepare(`INSERT INTO bundles (bundle_id, object_type, title) VALUES (?, 'project', ?)`).run(id, `Project ${id}`);
      m.projectCreated({ projectId: id, ownerId: owner, visibility, by: owner });
      return id;
    },
    /* (T40) `owner` invites `handle` into the project and the member joins (membership R32, R33). */
    join(id, owner, member) {
      const i = m.projectInvite({ projectId: id, handle: member, by: owner, viewer: `member:${owner}` });
      if (!i.ok) return i;
      return m.projectJoin({ projectId: id, by: member, viewer: `member:${member}` });
    },
    /* Every table's rows, to show an act wrote nothing. */
    snapshot() {
      return JSON.stringify(w.rows(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`)
        .map(({ name }) => [name, w.rows(`SELECT * FROM "${name}"`)]));
    },
    ops(query = "", body = null) {
      return aiAccountsOps(a, new URL(`http://x/?${query}`), body, { VERSION: "test-build" });
    },
  };
  return w;
}

/* The two modules over the REAL record-core (its schema, `recordOf` and purge), for what only the three together show
   (R28, R29). Membership boots first, as the store boots it. */
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
  const fact = { claimed: false };
  seams(m, fact);
  const a = aiAccountsOf(ctx, { sealSecret: SEAL });
  a.migrate();
  return { db, sql, ctx, rc, m, a, fact, row(q, ...args) { return sql.exec(q, ...args)[0] ?? null; } };
}
