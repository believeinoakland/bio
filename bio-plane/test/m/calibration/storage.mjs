/* A Durable Object storage stand-in for calibration's tests: `sql.exec(query, ...bindings)` answering the rows,
   and `transactionSync(fn)`, which rolls back everything `fn` wrote when it throws and nests as savepoints, over
   node:sqlite (SQLite, the engine a Durable Object runs). It holds record-core's tables, this module's three, and
   one table standing in for every other module's (`readings`), so a test can show what was never written. */
import { DatabaseSync } from "node:sqlite";
import { RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { CALIBRATION_SCHEMA } from "../../../src/calibration/index.mjs";

const run = (db, text) => {
  const bare = text.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) db.exec(t);
};

export function storage() {
  const db = new DatabaseSync(":memory:");
  let n = 0;
  const s = {
    db,
    broken: false,
    sql: {
      exec(q, ...args) {
        if (s.broken) throw new Error("storage unavailable");
        return db.prepare(q).all(...args.map((a) => (a === undefined ? null : a)));
      },
    },
    transactionSync(fn) {
      const sp = `sp${n++}`;
      db.exec(`SAVEPOINT ${sp}`);
      try { const r = fn(); db.exec(`RELEASE ${sp}`); return r; }
      catch (e) { db.exec(`ROLLBACK TO ${sp}`); db.exec(`RELEASE ${sp}`); throw e; }
    },
  };
  run(db, RECORD_SCHEMA);
  run(db, CALIBRATION_SCHEMA);
  db.exec(`CREATE TABLE readings (bundle_id TEXT, capture_sha TEXT, grade TEXT, chain TEXT)`);
  db.exec(`INSERT INTO readings VALUES ('INFO-2026-0001', 'abc', 'B', '[{"calibration":"CAL-1"}]')`);
  return s;
}

/* Every row of every table, for "nothing changed" comparisons. */
export const dump = (s, only = null) => Object.fromEntries(
  s.db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`).all()
    .map((r) => r.name).filter((t) => (only ? only.includes(t) : true))
    .map((t) => [t, JSON.stringify(s.db.prepare(`SELECT * FROM ${t} ORDER BY rowid`).all())]));
