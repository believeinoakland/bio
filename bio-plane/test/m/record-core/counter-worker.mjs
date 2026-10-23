/* A Durable Object that holds record-core and one table of another module, for r7-write-counter-workerd.test.mjs: the
   record's write counter (R89, R90) asked of real workerd SQLite, whose triggers and savepoints are the platform's own. */
import { recordOf } from "../../../src/record-core/index.mjs";

export class Counter {
  constructor(ctx) {
    this.ctx = ctx;
    this.rc = recordOf(ctx);
    ctx.blockConcurrencyWhile(async () => {
      this.rc.migrate();
      this.rc.declareTable("other", [{ name: "other_rows", purge: "clear", expunge: "none", export: "never", sight: "group",
        derive: "stored", version_chain: false }]);
      ctx.storage.sql.exec(`CREATE TABLE IF NOT EXISTS other_rows (k INTEGER PRIMARY KEY, v TEXT)`);
    });
  }
  async fetch(request) {
    const url = new URL(request.url), sql = this.ctx.storage.sql, rc = this.rc;
    const act = url.searchParams.get("act");
    const n = Number(url.searchParams.get("n") || 1);
    if (act === "insert") for (let i = 0; i < n; i++) sql.exec(`INSERT INTO other_rows (v) VALUES ('x')`);
    if (act === "bulk") rc.transact(() => { for (let i = 0; i < n; i++) sql.exec(`INSERT INTO other_rows (v) VALUES ('x')`); });
    if (act === "update") sql.exec(`UPDATE other_rows SET v='y' WHERE k=(SELECT MIN(k) FROM other_rows)`);
    if (act === "delete") sql.exec(`DELETE FROM other_rows WHERE k=(SELECT MIN(k) FROM other_rows)`);
    if (act === "rollback") { try { rc.transact(() => { sql.exec(`INSERT INTO other_rows (v) VALUES ('r')`); throw new Error("no"); }); } catch { /* rolled back */ } }
    if (act === "alloc") rc.allocId("INFO", "2026");
    if (act === "read") { rc.readImage("none"); rc.listBundles({}); rc.getSetting("x"); rc.stats({}); rc.counts(null); }
    return Response.json({ count: rc.writeCount(), rows: [...sql.exec(`SELECT COUNT(*) AS c FROM other_rows`)][0].c });
  }
}
export default { fetch: (req, env) => env.COUNTER.get(env.COUNTER.idFromName("one")).fetch(req) };
