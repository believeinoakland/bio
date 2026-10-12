/* plane R42 (T46; K2926, K2950; hypotheses R23 at the plane's shape, moved from hypotheses' tests): the plane's own Worker
   and `Store`, booted on workerd by `t46.test.mjs` under Miniflare. `Seeded` is the plane's `Store` itself, constructed
   over a storage into which an earlier release's notes were laid first (the notes numbered from one AUTOINCREMENT
   sequence shared across members, with turns, as T34–T35 kept them), so the whole composition (every boot migration,
   R3, hypotheses' renumbering among them) runs over it as it runs over a group's copy. A seed is laid only into a store
   holding no notes table, so a second boot finds what the first left. `GET /r42` answers the notes tables as stored;
   every other request is the plane's own door (`Store.fetch`). `TempBoot` is the negative control: the same `Store`
   with one more boot migration, which makes a `TEMP` table. */
import { Store } from "../../../src/plane/store.mjs";
export { default } from "../../../src/plane/index.mjs";

const NOTES = `CREATE TABLE member_notes (note_id INTEGER PRIMARY KEY AUTOINCREMENT, member TEXT NOT NULL, text TEXT NOT NULL,
  at TEXT NOT NULL, revised TEXT)`;
const TURNS = `CREATE TABLE member_note_turns (seq INTEGER PRIMARY KEY AUTOINCREMENT, note_id INTEGER NOT NULL, member TEXT NOT NULL,
  turned_into TEXT NOT NULL, made_id TEXT NOT NULL, at TEXT NOT NULL)`;
/* ann 1, outsider 2, ann 3, outsider 4 (deleted), outsider 5, ann 6 (deleted), ann 7; five turns, two on note 3 */
const SEED_NOTES = [
  ["ann", "ann first", "2026-10-01T00:00:00.000Z", null],
  ["outsider", "outsider first", "2026-10-02T00:00:00.000Z", "2026-10-06T00:00:00.000Z"],
  ["ann", "ann second", "2026-10-03T00:00:00.000Z", null],
  ["outsider", "outsider gone", "2026-10-03T12:00:00.000Z", null],
  ["outsider", "outsider second", "2026-10-04T00:00:00.000Z", null],
  ["ann", "ann gone", "2026-10-04T12:00:00.000Z", null],
  ["ann", "ann third", "2026-10-05T00:00:00.000Z", "2026-10-07T00:00:00.000Z"],
];
const SEED_TURNS = [
  [3, "ann", "question", "INQ-2026-0002-q"],
  [2, "outsider", "observation", "INFO-2026-0001-doc"],
  [7, "ann", "observation", "INFO-2026-0002-doc"],
  [3, "ann", "hunch", "HYP-2026-0001"],
  [5, "outsider", "question", "INQ-2026-0003-q"],
];

function seed(sql) {
  if ([...sql.exec(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'member_notes'`)].length) return;
  sql.exec(NOTES);
  sql.exec(`CREATE INDEX member_notes_of ON member_notes (member, note_id)`);
  sql.exec(TURNS);
  sql.exec(`CREATE INDEX member_note_turns_of ON member_note_turns (note_id, seq)`);
  for (const [member, text, at, revised] of SEED_NOTES)
    sql.exec(`INSERT INTO member_notes (member, text, at, revised) VALUES (?, ?, ?, ?)`, member, text, at, revised);
  sql.exec(`DELETE FROM member_notes WHERE note_id IN (4, 6)`);
  for (const [note, member, into, id] of SEED_TURNS)
    sql.exec(`INSERT INTO member_note_turns (note_id, member, turned_into, made_id, at) VALUES (?, ?, ?, ?, ?)`,
             note, member, into, id, "2026-10-08T00:00:00.000Z");
}

const rows = (sql, q, ...a) => [...sql.exec(q, ...a)].map((r) => ({ ...r }));
const json = (v) => new Response(JSON.stringify(v), { headers: { "content-type": "application/json" } });

export class Seeded extends Store {
  constructor(ctx, env) {
    seed(ctx.storage.sql);   /* before the plane's constructor: the store an earlier release left */
    super(ctx, env);
  }
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname !== "/r42") return super.fetch(req);
    const sql = this.ctx.storage.sql;
    let temp;
    try { sql.exec(`CREATE TEMP TABLE r42_probe (a INTEGER)`); temp = "allowed"; } catch (e) { temp = String(e && e.message ? e.message : e); }
    return json({
      notes: rows(sql, `SELECT member, note_id, text FROM member_notes ORDER BY member, note_id`),
      turns: rows(sql, `SELECT note_id, member, turned_into, made_id FROM member_note_turns ORDER BY seq`),
      keyed: rows(sql, `PRAGMA table_info(member_notes)`).filter((c) => Number(c.pk) > 0).map((c) => c.name),
      temp,
    });
  }
}

/* The negative control: one more boot migration, run as R3's pass runs, that makes a TEMP table. */
export class TempBoot extends Store {
  constructor(ctx, env) {
    super(ctx, env);
    ctx.blockConcurrencyWhile(async () => { ctx.storage.sql.exec(`CREATE TEMP TABLE r42_map (a INTEGER)`); });
  }
}
