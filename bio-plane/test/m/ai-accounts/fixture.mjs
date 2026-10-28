/* The ai-accounts module over a real SQLite database (node:sqlite), with the real membership module beside it (the
   services ai-accounts reads: memberFacts, isAdministrator, notAnAdmin, onRevoked, onProjectLeft, listenerRefusal, sight,
   existenceAct, projectAuthority, isProjectOwner, isJoinedParticipant, notTheOwner, noSuchProject), the real record-core as
   its `coreOver` fixture gives it (bundleInfo, declarePurge, declareTable) and the real ai-catalogue as ITS published fixture
   gives it (K4990, K4993): a test never builds another module's answer. It never builds credentials, which is later in the
   order (split map §6): the founder's claim, which credentials states to membership (its R17, membership R94), is a test
   fact registered here, and enrolment's password setter (membership R95) a test setter that stores nothing. Members are made
   through membership's own acts. Every test drives the module at its interface. */
import { DatabaseSync } from "node:sqlite";
import { membershipOf } from "../../../src/membership/index.mjs";
import { aiAccountsOf, aiAccountsOps } from "../../../src/ai-accounts/index.mjs";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { coreOver } from "../record-core/fixtures.mjs";
import { catalogueFor, PLANS } from "./catalogue.mjs";

const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);

export function sqlOver(db) {
  return {
    exec(q, ...args) {
      const st = db.prepare(q);
      return st.columns().length ? st.all(...args.map(bind)).map((r) => ({ ...r })) : (st.run(...args.map(bind)), []);
    },
  };
}

/* The sentinel secrets a test seals: one per owner and means, so a scan finds each where it must not be. */
export const SECRET = (who, means = "sealed") => `sk-sentinel-${means}-${who}-0123456789abcdef`;

/* The real record-core over the test's database (record-core's published `coreOver`): `declarePurge`, `declareTable`
   and `bundleInfo` answer as record-core answers them. `declared` reads its declarations as a map of table name to
   `{module, classes}`, fresh at each read, for the tests that look at what ai-accounts declared. */
function coreOf(db) {
  const core = coreOver(db);
  Object.defineProperty(core, "declared", {
    get: () => new Map(core.rc.declaredTables().map((d) => [d.name, { module: d.module, exempt: d.purge === "exempt", classes: { ...d } }])),
  });
  return core;
}

/* The seal secret the composition root hands in through credentials (R24, R32); a test world binds one unless told not to. */
export const SEAL = "test-seal-secret-0123456789";

/* The test's own facts for membership's two credentials seams: whether the instance is claimed (membership R94) and the
   enrolment's password setter (R95), which stores nothing. */
function seams(m, fact) {
  m.registerClaimed("test-claim", () => fact.claimed === true);
  m.registerPasswordSetter(() => ({ ok: true }), "test-password");
}

export function world({ sealSecret = SEAL, now = null, catalogue = undefined } = {}) {
  const db = new DatabaseSync(":memory:");
  const core = coreOf(db);
  const sql = sqlOver(db);
  const ctx = { storage: { sql } };
  const m = membershipOf(ctx, { record: core });
  m.migrate();
  const fact = { claimed: false };
  seams(m, fact);
  const cat = catalogue === undefined ? catalogueFor(ctx, { record: core }) : catalogue;
  const ready = cat?.seeded ?? Promise.resolve();
  const a = aiAccountsOf(ctx, { record: core, membership: m, sealSecret, now, catalogue: cat });
  if (aiAccountsOf(ctx) !== a) throw new Error("aiAccountsOf answers one instance per storage");
  a.migrate();
  const w = {
    db, sql, core, m, a, c: a, ctx, fact, catalogue: cat, ready,
    row(q, ...args) { return sql.exec(q, ...args)[0] ?? null; },
    rows(q, ...args) { return sql.exec(q, ...args); },
    /* The founder claims the instance: the test's fact (membership R94). */
    // fixtures-own: harness - sets the test's own fact that the registered claimed seam reads (credentials, later in the order, is never built here)
    async claim() { fact.claimed = true; return { ok: true }; },
    /* Invite (membership) and enrol to active. */
    async enrol(id, role = "member", by = "admin", caps = null) {
      const x = await m.memberAdd({ memberId: id, cover: `cover of ${id}`, role, capabilities: caps, by });
      if (!x.ok) return x;
      return m.enroll({ invite: x.invite, handle: id, password: `${id}-passphrase-x` });
    },
    /* The founder plus a second administrator, so ordinary members may be added; then each member, enrolled. */
    async group(...members) {
      await ready;
      await w.claim();
      await w.enrol("second", "admin");
      for (const id of members) await w.enrol(id);
      return w;
    },
    /* (T40) A project bundle created by `owner` through membership's own act (its R71), with its visibility. */
    project(id, owner, visibility = "hidden") {
      core.addBundle(id, "project", `Project ${id}`);
      m.projectCreated({ projectId: id, ownerId: owner, visibility, by: owner });
      return id;
    },
    /* (T40) `owner` invites `handle` into the project and the member joins (membership R32, R33). */
    join(id, owner, member) {
      const i = m.projectInvite({ projectId: id, handle: member, by: owner, viewer: `member:${owner}` });
      if (!i.ok) return i;
      return m.projectJoin({ projectId: id, by: member, viewer: `member:${member}` });
    },
    /* A member's own account of the catalogue's API plan for members, its key sealed, by her own act. */
    own(member, { plan = PLANS.memberApi, secret = SECRET(member), entries = undefined, means = "sealed", ...more } = {}) {
      return a.accountSet({ owner: `member:${member}`, provider: PLANS.provider, plan, means, secret, entries, by: member, ...more });
    },
    /* The team's account of the catalogue's team API plan, its key sealed, by an administrator. */
    team({ plan = PLANS.teamApi, secret = SECRET("team"), by = "admin", entries = undefined, means = "sealed", ...more } = {}) {
      return a.accountSet({ owner: "group", provider: PLANS.provider, plan, means, secret, entries, by, ...more });
    },
    /* A project's account of the catalogue's team API plan, its key sealed, by one of its owners. */
    projectAccount(project, owner, { plan = PLANS.teamApi, secret = SECRET(project), entries = undefined, means = "sealed", ...more } = {}) {
      return a.accountSet({ owner: `project:${project}`, provider: PLANS.provider, plan, means, secret, entries, by: owner, ...more });
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

/* The modules over the REAL record-core (its schema, `recordOf` and purge), for what only they together show (R28, R29).
   Membership boots first, as the store boots it. */
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
  const cat = catalogueFor(ctx, { record: rc });
  const a = aiAccountsOf(ctx, { sealSecret: SEAL, catalogue: cat });
  a.migrate();
  return { db, sql, ctx, rc, m, a, fact, catalogue: cat, ready: cat.seeded, row(q, ...args) { return sql.exec(q, ...args)[0] ?? null; } };
}
