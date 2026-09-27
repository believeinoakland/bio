/* host-governor over a real SQLite database (node:sqlite, the engine a Durable Object runs), reached through
   `governorOf` on a Durable Object storage stand-in, with record-core's real instance on the same storage (K61).
   The clock and the jitter source are the test's own, so every figure is exact. No network. */
import { DatabaseSync } from "node:sqlite";
import { governorOf } from "../../../src/host-governor/index.mjs";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";

const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);

export function world({ env = null, t0 = 1_000_000_000, random = 0.5 } = {}) {
  const db = new DatabaseSync(":memory:");
  const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const st of bare.split(";")) if (st.trim()) db.exec(st);
  let n = 0;
  const sql = {
    exec(q, ...args) {
      const st = db.prepare(q);
      return st.columns().length ? st.all(...args.map(bind)).map((r) => ({ ...r })) : (st.run(...args.map(bind)), []);
    },
  };
  const storage = {
    sql,
    transactionSync(fn) {
      const sp = `sp${n++}`;
      db.exec(`SAVEPOINT ${sp}`);
      try { const r = fn(); db.exec(`RELEASE ${sp}`); return r; }
      catch (e) { db.exec(`ROLLBACK TO ${sp}`); db.exec(`RELEASE ${sp}`); throw e; }
    },
  };
  const ctx = { storage };
  const clock = { t: t0 };
  const draws = [];
  const w = {
    db, sql, ctx, clock, draws,
    rc: recordOf(ctx),
    /* the next jitter draws, consumed in order; `random` once they run out */
    g: governorOf(ctx, { env, now: () => clock.t,
                         random: () => (draws.length ? draws.shift() : random) }),
    at(t) { clock.t = t; return w; },
    step(ms) { clock.t += ms; return w; },
    row(host) { return sql.exec(`SELECT * FROM host_governor WHERE host = ?`, host)[0] ?? null; },
    count() { return sql.exec(`SELECT COUNT(*) AS n FROM host_governor`)[0].n; },
  };
  w.rc.migrate();
  w.g.migrate();
  return w;
}
