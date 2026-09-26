/* A membership module over a real SQLite database (node:sqlite), with a stub record-core that provides the
   services membership uses (bundleInfo, declarePurge) over a `bundles` table holding the R37 read contract
   (bundle_id, object_type) and a title, passed to `membershipOf` as a test's own record-core (K61). Every test drives the module at its interface. */
import { DatabaseSync } from "node:sqlite";
import { membershipOf, membershipOps } from "../../../src/membership/index.mjs";

const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);

export function sqlOver(db) {
  return {
    exec(q, ...args) {
      const st = db.prepare(q);
      return st.columns().length ? st.all(...args.map(bind)).map((r) => ({ ...r })) : (st.run(...args.map(bind)), []);
    },
  };
}

export function world() {
  const db = new DatabaseSync(":memory:");
  db.exec(`CREATE TABLE bundles (bundle_id TEXT PRIMARY KEY, object_type TEXT NOT NULL, title TEXT)`);
  const declared = [];
  const core = {
    bundleInfo(id) {
      const r = db.prepare(`SELECT bundle_id, object_type, title FROM bundles WHERE bundle_id=?`).get(bind(id));
      return r ? { id: r.bundle_id, type: r.object_type, title: r.title, project: null } : null;
    },
    declarePurge(module, tables, opts) { declared.push({ module, tables, opts }); },
  };
  const sql = sqlOver(db);
  const ctx = { storage: { sql } };                  // a Durable Object's storage, as membershipOf reads it
  const m = membershipOf(ctx, { record: core });
  if (membershipOf(ctx) !== m) throw new Error("membershipOf answers one instance per storage");
  m.migrate();
  const w = {
    db, sql, core, m, declared,
    bundle(id, type = "information", title = `title of ${id}`) {
      db.prepare(`INSERT INTO bundles (bundle_id, object_type, title) VALUES (?,?,?)`).run(id, type, title);
      return id;
    },
    project(id, title = `Project ${id}`) { w.bundle(id, "project", title); m.reindexProjectSight(id); return id; },
    row(q, ...a) { return sql.exec(q, ...a)[0] ?? null; },
    rows(q, ...a) { return sql.exec(q, ...a); },
    /* The founder claims the instance. */
    async claim() { return m.claim({ password: "founder-passphrase-1", tokenFp: "fp-1" }); },
    /* Invite and enrol a member all the way to active; returns the enrol answer. */
    async enrol(id, role = "member", by = "admin", caps = null) {
      const a = await m.memberAdd({ memberId: id, cover: `cover of ${id}`, role, capabilities: caps, by });
      if (!a.ok) {
        if (a.reason !== "CONSENSUS_REQUIRED") return a;
        return a;
      }
      return m.enroll({ invite: a.invite, handle: id, password: `${id}-passphrase-x` });
    },
    /* The founder plus a second administrator, so ordinary members may be added. */
    async group(...members) {
      await w.claim();
      await w.enrol("second", "admin");
      for (const id of members) await w.enrol(id);
      return w;
    },
    ops(query = "", body = null) {
      const url = new URL(`http://x/?${query}`);
      return membershipOps(m, url, body, { VERSION: "test-build" });
    },
  };
  return w;
}

export const V = (id) => `member:${id}`;
