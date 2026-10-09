/* ai-use over a real SQLite database (node:sqlite), with the real record-core, membership and credentials beside it (the
   services ai-use reads: declareTable, transact, bundleInfo; isAdministrator, isProjectOwner, projectOwners,
   activeAdmins, notAnAdmin, notTheOwner; accountUses, aiKeptAway, projectsKeptAway, USE_KINDS), a `connections` stub
   answering `citesInto` from a table of cites the test writes, and the group's zone handed in. Members, projects and
   accounts are made through those modules' own acts, so each test drives ai-use at its interface. */
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { credentialsOf } from "../../../src/credentials/index.mjs";
import { aiUseOf } from "../../../src/ai-use/index.mjs";

const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);
export function sqlOver(db) {
  return {
    exec(q, ...args) {
      const st = db.prepare(q);
      return st.columns().length ? st.all(...args.map(bind)).map((r) => ({ ...r })) : (st.run(...args.map(bind)), []);
    },
  };
}

export const SEAL = "test-seal-secret-0123456789";
export const WORDS = Object.fromEntries(JSON.parse(readFileSync(new URL(
  "../../../../docs/development/ux-substrate/screens/words.json", import.meta.url), "utf8")).words.map((w) => [w.key, w.en]));

/** One call's figures, as agent-model answers them: `tokens` split as input, `cost` the estimate (null: not stated). */
export const usage = (input = 0, output = 0, cost = null, extra = {}) => ({ input_tokens: input, output_tokens: output,
  cache_read_input_tokens: 0, cache_creation_input_tokens: 0, total_cost_usd: null, estimated_cost_usd: cost, ...extra });

/** A world. `zone` the group's; `before` runs on the bare database before ai-use is first made (a pre-T40 store). */
export async function world({ zone = "UTC", before = null } = {}) {
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
  db.exec(`CREATE TABLE test_cites (citer TEXT NOT NULL, target TEXT NOT NULL)`);
  const connections = { citesInto: (id) => ({ confirmed: sql.exec(`SELECT citer FROM test_cites WHERE target=? ORDER BY citer`, id)
    .map((r) => r.citer), severed: [] }) };
  if (before) before(db, sql);
  let z = zone;
  const u = aiUseOf(ctx, { record: rc, membership: m, credentials: c, connections, zone: () => z });
  const w = {
    db, sql, ctx, rc, m, c, u,
    setZone(next) { z = next; },
    row(q, ...a) { return sql.exec(q, ...a)[0] ?? null; },
    rows(q, ...a) { return sql.exec(q, ...a); },
    async enrol(id, role = "member", by = "admin") {
      const a = await m.memberAdd({ memberId: id, cover: `cover of ${id}`, role, by });
      if (!a.ok) return a;
      return m.enroll({ invite: a.invite, handle: id, password: `${id}-passphrase-x` });
    },
    /* The founder claims; a second administrator; then each member, enrolled. */
    async group(...members) {
      await c.claim({ password: "founder-passphrase-1", tokenFp: "fp-1" });
      await w.enrol("second", "admin");
      for (const id of members) await w.enrol(id);
      return w;
    },
    bundle(id, type, title = id) {
      db.prepare(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha)
                  VALUES (?, ?, 'g', ?, 'open', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z', 'sha')`).run(id, type, title);
      return id;
    },
    project(id, owner, visibility = "hidden") {
      w.bundle(id, "project", `Project ${id}`);
      m.projectCreated({ projectId: id, ownerId: owner, visibility, by: owner });
      return id;
    },
    join(id, owner, member) {
      const i = m.projectInvite({ projectId: id, handle: member, by: owner, viewer: `member:${owner}` });
      if (!i.ok) return i;
      return m.projectJoin({ projectId: id, by: member, viewer: `member:${member}` });
    },
    cite(citer, target) { db.prepare(`INSERT INTO test_cites (citer, target) VALUES (?, ?)`).run(citer, target); },
    /* Every table's rows, to show an act wrote nothing. */
    snapshot() {
      return JSON.stringify(w.rows(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`)
        .map(({ name }) => [name, w.rows(`SELECT * FROM "${name}"`)]));
    },
    /* Count `n` calls' worth for `owner` and `member` under `use`. */
    count(owner, member, use, { input = 100, output = 0, cost = null, calls = 1, at = "2026-10-09T12:00:00Z", mode = use, act = null } = {}) {
      return u.countUsage({ owner, member, use, mode, model: "m", usage: usage(input, output, cost), calls, at, act });
    },
  };
  return w;
}

/** The standard world: ann and bob members, P owned by ann with bob joined; second an administrator. ann holds her own
 *  API key; the group key is held and on; P holds an API key. */
export async function standard(opts) {
  const w = await (await world(opts)).group("ann", "bob", "cy");
  w.project("P", "ann");
  w.join("P", "ann", "bob");
  await w.c.accountReferenceSet({ member: "ann", kind: "apikey", secret: "sk-ann", by: "ann" });
  await w.c.groupKeySet({ key: "sk-group", by: "admin" });
  await w.c.projectKeySet({ project: "P", key: "sk-project", by: "ann" });
  return w;
}
