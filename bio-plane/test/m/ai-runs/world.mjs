/* ai-runs over the real modules it uses — record-core, membership, promotion, connections, bias, observation-log and
   retrieval — over node:sqlite (the engine a Durable Object runs). Each world is its own storage, so `aiRunsOf`
   answers a fresh instance. Tests drive the module at its interface. */
import { DatabaseSync } from "node:sqlite";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { promotionOf } from "../../../src/promotion/index.mjs";
import { biasOf, BIAS_SCHEMA } from "../../../src/bias/index.mjs";
import { observationLogOf } from "../../../src/observation-log/index.mjs";
import { connectionsOf } from "../../../src/connections/index.mjs";
import { aiRunsOf, AI_RUNS_SCHEMA } from "../../../src/ai-runs/index.mjs";

const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);
const run = (sql, text) => {
  const bare = text.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const st of bare.split(";")) if (st.trim()) sql.exec(st);
};
export const T0 = "2026-07-01T00:00:00Z";

export function world({ env = {} } = {}) {
  const db = new DatabaseSync(":memory:");
  const sql = { exec(q, ...args) {
    const st = db.prepare(q);
    return st.columns().length ? st.all(...args.map(bind)).map((r) => ({ ...r })) : (st.run(...args.map(bind)), []);
  } };
  let n = 0;
  const storage = { sql, transactionSync(fn) {
    const sp = `sp${n++}`;
    db.exec(`SAVEPOINT ${sp}`);
    try { const r = fn(); db.exec(`RELEASE ${sp}`); return r; }
    catch (e) { db.exec(`ROLLBACK TO ${sp}`); db.exec(`RELEASE ${sp}`); throw e; }
  } };
  run(sql, RECORD_SCHEMA);
  run(sql, BIAS_SCHEMA);
  const ctx = { storage };
  const record = recordOf(ctx); record.migrate();
  const membership = membershipOf(ctx, { record }); membership.migrate();
  const promotion = promotionOf(ctx, { record, membership });
  for (const f of ["producingGroup", "citedBy", "caseMember"]) promotion.registerFact(f, "legacy-store", () => (f === "citedBy" ? [] : f === "producingGroup" ? "test-group" : false));
  connectionsOf(ctx, { env }).migrate();
  observationLogOf(ctx, { extraction: null, provenance: null }).migrate();
  biasOf(ctx, { env });
  const runs = aiRunsOf(ctx, env);
  runs.migrate();
  return { db, sql, ctx, record, membership, promotion, runs,
           row: (q, ...a) => sql.exec(q, ...a)[0] ?? null, rows: (q, ...a) => sql.exec(q, ...a),
           /** A bundle of a type, written straight into record-core's `bundles` (a context for a run). */
           bundle(id, type = "inquiry") {
             sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha)
                       VALUES (?, ?, 'test-group', ?, 'open', ?, ?, ?)`, id, type, id, T0, T0, 'sha-' + id);
           } };
}
