/* The credentials module over a real SQLite database (node:sqlite), with the real membership module beside it (the
   services credentials reads: memberFacts, sessionRights, activeAdmins, isAdministrator, notAnAdmin, onRevoked,
   registerClaimed) and a stub record-core that provides what the two use (bundleInfo, declarePurge). Members are made
   through membership's own acts and given their passwords through this module's `setPassword` (R3), so the world holds
   whichever module writes the password at enrolment. Every test drives the module at its interface. */
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { membershipOf } from "../../../src/membership/index.mjs";
import { credentialsOf, credentialsOps } from "../../../src/credentials/index.mjs";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { coreOver } from "../record-core/fixtures.mjs";
import { catalogueFor, PLANS, ENTRIES, HOSTS } from "../ai-accounts/catalogue.mjs";
import { SECRET } from "../ai-accounts/fixture.mjs";
export { PLANS, ENTRIES, HOSTS, SECRET };

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
/* R40: a session is held as its token's SHA-256, computed here independently of the module. */
export const sha = (text) => createHash("sha256").update(String(text)).digest("hex");
export const FOUNDER_PASSWORD = "founder-passphrase-1";
/* (T49; R74) the handle the founder chooses at the claim in a test world */
export const FOUNDER_HANDLE = "founder";
/* (T47; R70) the sign-in token a member's Claude Code `setup-token` would print, one per member, a sentinel. */
export const SIGNIN_TOKEN = (id) => `sk-ant-oat01-sentinel-${id}-0123456789`;

/* record-core over the test's own database, as record-core publishes it (`coreOver`, its fixtures.mjs): its real
   `declarePurge`, `declareTable` and `bundleInfo`. `declared` reads the declarations back from record-core, keyed by
   table, as `{module, exempt, classes}`. */
function coreWithDeclared(db) {
  const core = coreOver(db);
  Object.defineProperty(core, "declared", { get: () => new Map(core.rc.declaredTables().map((d) => [d.name,
    { module: d.module, exempt: d.purge === "exempt", classes: d }])) });
  return core;
}

/* The seal secret the composition root hands in (R23, R29); a test world binds one unless told not to. */
export const SEAL = "test-seal-secret-0123456789";

export function world({ sealSecret = SEAL, now = null, catalogue = undefined } = {}) {
  const db = new DatabaseSync(":memory:");
  const core = coreWithDeclared(db);
  const sql = sqlOver(db);
  const ctx = { storage: { sql } };
  const m = membershipOf(ctx, { record: core });
  m.migrate();
  /* ai-catalogue as ITS published fixture gives it (K4990): the accounts of `ai-accounts` are of the catalogue's plans */
  const cat = catalogue === undefined ? catalogueFor(ctx, { record: core }) : catalogue;
  const ready = cat?.seeded ?? Promise.resolve();
  const c = credentialsOf(ctx, { record: core, membership: m, sealSecret, now, catalogue: cat });
  if (credentialsOf(ctx) !== c) throw new Error("credentialsOf answers one instance per storage");
  c.migrate();
  const a = c.accounts;
  const w = {
    db, sql, core, m, c, a, ctx, catalogue: cat, ready,
    row(q, ...a) { return sql.exec(q, ...a)[0] ?? null; },
    rows(q, ...a) { return sql.exec(q, ...a); },
    /* The founder claims the instance (R1). */
    async claim() { await ready; return c.claim({ password: FOUNDER_PASSWORD, handle: FOUNDER_HANDLE, tokenFp: "fp-1" }); },
    /* Invite (membership) and enrol to active, then set the member's password here (R3). */
    async enrol(id, role = "member", by = "admin", caps = null) {
      const a = await m.memberAdd({ memberId: id, cover: `cover of ${id}`, role, capabilities: caps, by });
      if (!a.ok) return a;
      const e = await m.enroll({ invite: a.invite, handle: id, password: PASSWORD(id) });
      if (e.ok) await c.setPassword({ role: `member:${id}`, password: PASSWORD(id) });
      return e;
    },
    /* A member's own account of the catalogue's API plan for members, its key sealed, by her own act (ai-accounts' world). */
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
    /* `set` (an account set) switched on by its owner, and the recipient notice of its host read by `member` (R51). */
    async on(set, member = null) {
      const r = await set;
      if (r.ok !== true) throw new Error(`account not set: ${r.reason}`);
      const by = r.owner === "group" ? "admin" : r.owner.startsWith("project:") ? member : r.owner.slice(7);
      if (a.accountSwitch({ account_id: r.account_id, on: true, by }).ok !== true) throw new Error("account not switched on");
      if (member) a.recipientNoticeSeen({ member, provider: PLANS.provider, host: HOSTS.main, by: member });
      return r;
    },
    /* The id of the first account `owner` holds (`ai_accounts`), null when none. */
    idOf(owner) { return sql.exec(`SELECT account_id FROM ai_accounts WHERE owner=? ORDER BY seq`, owner)[0]?.account_id ?? null; },
    /* Every account `owner` holds, removed by `by` (`ai-accounts` R1, R5): the members' ways of ending what served them. */
    removeAccounts(owner, by) {
      const ids = sql.exec(`SELECT account_id FROM ai_accounts WHERE owner=?`, owner).map((r) => r.account_id);
      return ids.map((account_id) => a.accountRemove({ account_id, by }));
    },
    /* A member served by an account of their own: the member API plan, sealed, switched on, the recipient's notice read. */
    async served(member) { return w.on(w.own(member), member); },
    /* (T53) `id` signs in through their personal subscription: an account of means `issued`, its token held, switched on. */
    async signin(id) {
      const r = await a.accountSet({ owner: `member:${id}`, provider: PLANS.provider, plan: PLANS.subscription, means: "issued",
        secret: SIGNIN_TOKEN(id), by: id });
      if (r.ok !== true) return r;
      a.accountSwitch({ account_id: r.account_id, on: true, by: id });
      a.recipientNoticeSeen({ member: id, provider: PLANS.provider, host: HOSTS.main, by: id });
      return r;
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
  const cat = catalogueFor(ctx, { record: rc });
  const c = credentialsOf(ctx, { sealSecret: SEAL, catalogue: cat });
  c.migrate();
  const acc = c.accounts;
  return { db, sql, ctx, rc, m, c, ready: cat.seeded,
    row(q, ...a) { return sql.exec(q, ...a)[0] ?? null; },
    /* a member served by an account of their own: the member API plan, sealed, on, the recipient's notice read */
    async served(member) {
      await cat.seeded;
      const r = await acc.accountSet({ owner: `member:${member}`, provider: PLANS.provider, plan: PLANS.memberApi, means: "sealed",
        secret: SECRET(member), by: member });
      if (r.ok !== true) return r;
      acc.accountSwitch({ account_id: r.account_id, on: true, by: member });
      acc.recipientNoticeSeen({ member, provider: PLANS.provider, host: HOSTS.main, by: member });
      return r;
    } };
}

/* An administrator added and enrolled the way the roster allows at the time of the call and after member-roster's R84 to
   R91 (T53; K5563): proposed by `second` and endorsed by every active administrator in turn until an invitation is
   issued (the founder's endorsement alone issues it now; two administrators' endorsements did before). */
export async function addAdmin(w, id) {
  await w.m.memberAdd({ memberId: id, cover: `cover of ${id}`, role: "admin", by: "second" });
  let invite = null;
  for (const by of w.m.activeAdmins()) {
    if (by === "second") continue;
    const e = await w.m.adminEndorse({ memberId: id, by });
    if (e.invite) { invite = e.invite; break; }
  }
  if (!invite) throw new Error(`${id} was not issued an invitation`);
  const enrolled = await w.m.enroll({ invite, handle: id, password: PASSWORD(id) });
  if (enrolled.ok !== true) throw new Error(`${id} did not enrol`);
  return id;
}
