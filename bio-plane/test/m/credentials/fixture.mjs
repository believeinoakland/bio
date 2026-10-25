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

export function world({ sealSecret = SEAL, now = null } = {}) {
  const db = new DatabaseSync(":memory:");
  const core = coreWithDeclared(db);
  const sql = sqlOver(db);
  const ctx = { storage: { sql } };
  const m = membershipOf(ctx, { record: core });
  m.migrate();
  const c = credentialsOf(ctx, { record: core, membership: m, sealSecret, now });
  if (credentialsOf(ctx) !== c) throw new Error("credentialsOf answers one instance per storage");
  c.migrate();
  const w = {
    db, sql, core, m, c, ctx,
    row(q, ...a) { return sql.exec(q, ...a)[0] ?? null; },
    rows(q, ...a) { return sql.exec(q, ...a); },
    /* The founder claims the instance (R1). */
    async claim() { return c.claim({ password: FOUNDER_PASSWORD, handle: FOUNDER_HANDLE, tokenFp: "fp-1" }); },
    /* Invite (membership) and enrol to active, then set the member's password here (R3). */
    async enrol(id, role = "member", by = "admin", caps = null) {
      const a = await m.memberAdd({ memberId: id, cover: `cover of ${id}`, role, capabilities: caps, by });
      if (!a.ok) return a;
      const e = await m.enroll({ invite: a.invite, handle: id, password: PASSWORD(id) });
      if (e.ok) await c.setPassword({ role: `member:${id}`, password: PASSWORD(id) });
      return e;
    },
    /* (T47; R70) `id` signs in through their Claude subscription: the door holds the token the sign-in printed. */
    async signin(id, validFor = null) {
      return c.subscriptionTokenHold({ member: id, token: SIGNIN_TOKEN(id), validFor });
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
  const c = credentialsOf(ctx, { sealSecret: SEAL });
  c.migrate();
  return { db, sql, ctx, rc, m, c, row(q, ...a) { return sql.exec(q, ...a)[0] ?? null; } };
}
