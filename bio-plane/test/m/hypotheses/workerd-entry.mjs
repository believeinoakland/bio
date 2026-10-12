/* R23's world on workerd (`workerd.test.mjs`): the plane's own Durable Object, `Store` from `src/plane/store.mjs`,
   unchanged, over a store an earlier release left. Each class here is that Store with one seed laid into its storage
   BEFORE the plane's constructor runs, so the plane boots over it as it boots over a group's copy: the notes as T34–T35
   numbered them, from one AUTOINCREMENT sequence shared across members (`shared`), the same before T35's `revised`
   column (`t34`), or none (`fresh`). A seed is laid only into a store that holds no notes table, so a second boot over
   the same storage finds what the first left. Its one door, `POST /r23` with `{act, args}`, calls this module's act or
   read on the plane's own instance and answers it; `GET /r23` answers the notes tables as stored and what workerd
   answers a `TEMP` table (the authorizer R23 names), so the test reads at the module's interface and the store. */
import { Store as PlaneStore } from "../../../src/plane/store.mjs";
import { hypothesesOf } from "../../../src/hypotheses/index.mjs";

const NOTES_SHARED = `CREATE TABLE member_notes (note_id INTEGER PRIMARY KEY AUTOINCREMENT, member TEXT NOT NULL, text TEXT NOT NULL,
  at TEXT NOT NULL, revised TEXT)`;
const NOTES_T34 = `CREATE TABLE member_notes (note_id INTEGER PRIMARY KEY AUTOINCREMENT, member TEXT NOT NULL, text TEXT NOT NULL,
  at TEXT NOT NULL)`;
const TURNS = `CREATE TABLE member_note_turns (seq INTEGER PRIMARY KEY AUTOINCREMENT, note_id INTEGER NOT NULL, member TEXT NOT NULL,
  turned_into TEXT NOT NULL, made_id TEXT NOT NULL, at TEXT NOT NULL)`;

/* Interleaved as members keep them: ann 1, outsider 2, ann 3, outsider 4 (deleted), outsider 5, ann 6 (deleted), ann 7;
   five turns, two on one note. The numbers are the shared sequence's, so ann's are 1, 3, 7 and the outsider's 2, 5. */
export const SEED_NOTES = Object.freeze([
  ["ann", "ann first", "2026-10-01T00:00:00.000Z", null],
  ["outsider", "outsider first", "2026-10-02T00:00:00.000Z", "2026-10-06T00:00:00.000Z"],
  ["ann", "ann second", "2026-10-03T00:00:00.000Z", null],
  ["outsider", "outsider gone", "2026-10-03T12:00:00.000Z", null],
  ["outsider", "outsider second", "2026-10-04T00:00:00.000Z", null],
  ["ann", "ann gone", "2026-10-04T12:00:00.000Z", null],
  ["ann", "ann third", "2026-10-05T00:00:00.000Z", "2026-10-07T00:00:00.000Z"],
]);
export const SEED_TURNS = Object.freeze([
  [3, "ann", "question", "INQ-2026-0002-q"],
  [2, "outsider", "observation", "INFO-2026-0001-doc"],
  [7, "ann", "observation", "INFO-2026-0002-doc"],
  [3, "ann", "hunch", "HYP-2026-0001"],
  [5, "outsider", "question", "INQ-2026-0003-q"],
]);

function seed(sql, shape) {
  if (shape === "fresh") return;
  if ([...sql.exec(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'member_notes'`)].length) return;
  sql.exec(shape === "t34" ? NOTES_T34 : NOTES_SHARED);
  sql.exec(`CREATE INDEX member_notes_of ON member_notes (member, note_id)`);
  sql.exec(TURNS);
  sql.exec(`CREATE INDEX member_note_turns_of ON member_note_turns (note_id, seq)`);
  for (const [member, text, at, revised] of SEED_NOTES)
    if (shape === "t34") sql.exec(`INSERT INTO member_notes (member, text, at) VALUES (?, ?, ?)`, member, text, at);
    else sql.exec(`INSERT INTO member_notes (member, text, at, revised) VALUES (?, ?, ?, ?)`, member, text, at, revised);
  sql.exec(`DELETE FROM member_notes WHERE note_id IN (4, 6)`);
  for (const [note, member, into, id] of SEED_TURNS)
    sql.exec(`INSERT INTO member_note_turns (note_id, member, turned_into, made_id, at) VALUES (?, ?, ?, ?, ?)`,
             note, member, into, id, "2026-10-08T00:00:00.000Z");
}

const rows = (sql, q, ...a) => [...sql.exec(q, ...a)].map((r) => ({ ...r }));
const json = (v, status = 200) => new Response(JSON.stringify(v), { status, headers: { "content-type": "application/json" } });
const ACTS = new Set(["noteWrite", "noteRevise", "notesOf", "noteTurn", "noteDelete", "migrate"]);

function seeded(shape) {
  return class extends PlaneStore {
    constructor(ctx, env) {
      seed(ctx.storage.sql, shape);
      super(ctx, env);
    }
    async fetch(req) {
      const url = new URL(req.url);
      if (url.pathname !== "/r23") return super.fetch(req);
      const sql = this.ctx.storage.sql;
      if (req.method === "POST") {
        const { act, args } = await req.json();
        if (!ACTS.has(act)) return json({ error: `no act ${act}` }, 400);
        return json(hypothesesOf(this.ctx)[act](args));
      }
      let temp;
      try { sql.exec(`CREATE TEMP TABLE r23_probe (a INTEGER)`); temp = "allowed"; } catch (e) { temp = String(e && e.message ? e.message : e); }
      return json({
        notes: rows(sql, `SELECT * FROM member_notes ORDER BY member, note_id`),
        turns: rows(sql, `SELECT note_id, member, turned_into, made_id FROM member_note_turns ORDER BY seq`),
        numbers: rows(sql, `SELECT member, last FROM member_note_numbers ORDER BY member`),
        keyed: rows(sql, `PRAGMA table_info(member_notes)`).filter((c) => Number(c.pk) > 0).map((c) => c.name),
        columns: rows(sql, `PRAGMA table_info(member_notes)`).map((c) => c.name),
        sequence: rows(sql, `SELECT name FROM sqlite_sequence WHERE name LIKE 'member_notes%'`).map((r) => r.name),
        objects: rows(sql, `SELECT name FROM sqlite_master WHERE name LIKE 'member_note%' ORDER BY name`).map((r) => r.name),
        temp,
      });
    }
  };
}

export const StoreShared = seeded("shared");
export const StoreT34 = seeded("t34");
export const StoreFresh = seeded("fresh");
export default { fetch: () => new Response("r23") };
