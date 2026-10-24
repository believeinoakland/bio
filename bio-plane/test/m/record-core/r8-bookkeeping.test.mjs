/* record-core, fix round 8 (G115; K4807 (3), K4811 (1), K4817): R91, the write counter counts record writes and not
   bookkeeping. The counter (R89) is the key of `queue`'s count cache; every foreground request writes a bookkeeping row (a
   session's `last_active`, the door window, a ledger row), so a counter that counts them moves on every request and the
   cache never holds. These tests are at this module's own interface: its own storage, tables named on the bookkeeping list
   (`BOOKKEEPING_TABLES`, the list R91 exports) made by plain SQL as the modules that own them make them, and the module's real
   write path. Counted, never timed (R-CLOCK). The proof with the real credentials, admission and scheduler writes is the
   control-plane seam file's. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import * as core from "../../../src/record-core/index.mjs";
import { storage } from "./storage.mjs";

const { recordOf } = core;
const fresh = (opts) => { const s = storage(); const rc = recordOf({ storage: s }, opts); rc.migrate(); return { s, rc }; };
const sha = (t) => createHash("sha256").update(t).digest("hex");
const file = (path, text) => ({ path, text, bytes: Buffer.byteLength(text), sha256: sha(text) });
const put = (rc, id, snapKey) =>
  rc.commit({ bundleId: id, type: "information", title: `t ${id}`, snapKey, author: "a", base: null, files: [file("bundle.md", `x ${id} ${snapKey}`)] });

/* The list's tables, made as their owners make them: a keyed table the owner writes with plain SQL. */
const listed = () => [...(core.BOOKKEEPING_TABLES || ["sessions", "admission_door_window"])];   /* stand-ins until the list is exported (the red run) */
const make = (s, name) => s.sql.exec(`CREATE TABLE IF NOT EXISTS ${name} (k TEXT PRIMARY KEY, v TEXT)`);
const makeAll = (s) => { for (const t of listed()) make(s, t); };
/* A table no list names, written the same way. */
const record = (s) => s.sql.exec(`CREATE TABLE IF NOT EXISTS other_rows (k TEXT PRIMARY KEY, v TEXT)`);

test("R91: the bookkeeping list is exported, frozen, and names the session, door-window and ledger tables", () => {
  assert.ok(Array.isArray(core.BOOKKEEPING_TABLES) && core.BOOKKEEPING_TABLES.length > 0, "a list is exported");
  assert.ok(Object.isFrozen(core.BOOKKEEPING_TABLES), "frozen");
  assert.ok(core.BOOKKEEPING_TABLES.every((t) => typeof t === "string" && /^[a-z_][a-z0-9_]*$/.test(t)), "plain table names");
  assert.equal(new Set(core.BOOKKEEPING_TABLES).size, core.BOOKKEEPING_TABLES.length, "each once");
  for (const t of ["sessions", "admission_door_window", "admission_session_window", "keeps_pending", "keeps_last"])
    assert.ok(core.BOOKKEEPING_TABLES.includes(t), `${t} is bookkeeping`);
});

test("R91: a row inserted, updated, upserted, replaced or deleted in any table of the list leaves writeCount() as it was", () => {
  const { s, rc } = fresh();
  makeAll(s);
  assert.ok(listed().length > 0, "the list is not empty");
  const n0 = rc.writeCount();
  for (const t of listed()) {
    s.sql.exec(`INSERT INTO ${t} VALUES ('a','1')`);
    assert.equal(rc.writeCount(), n0, `${t}: insert`);
    s.sql.exec(`UPDATE ${t} SET v='2' WHERE k='a'`);
    assert.equal(rc.writeCount(), n0, `${t}: update`);
    s.sql.exec(`INSERT INTO ${t} VALUES ('a','3') ON CONFLICT(k) DO UPDATE SET v='9'`);
    assert.equal(rc.writeCount(), n0, `${t}: upsert`);
    s.sql.exec(`INSERT OR REPLACE INTO ${t} VALUES ('a','4')`);
    assert.equal(rc.writeCount(), n0, `${t}: replace`);
    s.sql.exec(`INSERT INTO ${t} VALUES ('b','1'),('c','1'),('d','1')`);
    s.sql.exec(`UPDATE ${t} SET v='5'`);
    assert.equal(rc.writeCount(), n0, `${t}: many rows at once`);
    s.sql.exec(`DELETE FROM ${t}`);
    assert.equal(rc.writeCount(), n0, `${t}: delete`);
  }
});

test("R91: a record write moves writeCount() by its own rows, and bookkeeping rows beside it add nothing", () => {
  const { s: s1, rc: a } = fresh();
  const { s: s2, rc: b } = fresh();
  makeAll(s2);
  const a0 = a.writeCount(), b0 = b.writeCount();
  put(a, "INFO-2026-0001", "k1");
  /* the same record write, with bookkeeping rows written before, inside and after it */
  s2.sql.exec(`INSERT INTO ${listed()[0]} VALUES ('x','1')`);
  b.transact(() => { s2.sql.exec(`INSERT INTO ${listed()[1]} VALUES ('y','1')`); put(b, "INFO-2026-0001", "k1"); s2.sql.exec(`UPDATE ${listed()[0]} SET v='2'`); });
  s2.sql.exec(`DELETE FROM ${listed()[0]}`);
  const moved = a.writeCount() - a0;
  assert.ok(moved >= 3, `a commit writes at least its bundle, file and manifest rows (moved ${moved})`);
  assert.equal(b.writeCount() - b0, moved, "the record write moved the counter by the same, whatever bookkeeping ran beside it");
  void s1;
});

test("R91: a write to a table the list does not name moves writeCount() (control)", () => {
  const { s, rc } = fresh();
  makeAll(s); record(s);
  const n0 = rc.writeCount();
  s.sql.exec(`INSERT INTO other_rows VALUES ('a','1')`);
  assert.ok(rc.writeCount() > n0, "insert");
  const n1 = rc.writeCount();
  s.sql.exec(`UPDATE other_rows SET v='2'`);
  assert.ok(rc.writeCount() > n1, "update");
  const n2 = rc.writeCount();
  s.sql.exec(`DELETE FROM other_rows`);
  assert.ok(rc.writeCount() > n2, "delete");
  const n3 = rc.writeCount();
  rc.allocId("INFO", "2026"); rc.setSetting("x", 1, "member:a"); rc.acquireLease("INFO-2026-0001", "member:a", 1000);
  assert.ok(rc.writeCount() >= n3 + 3, "this module's own writes (seq, settings, leases) are record writes");
});

test("R91: a table of the list made after the counter was first read is watched from its next reading", () => {
  const { s, rc } = fresh();
  const n0 = rc.writeCount();
  assert.equal(rc.writeCount(), n0);
  makeAll(s);
  assert.equal(rc.writeCount(), n0, "making the tables moves nothing");
  for (const t of listed()) s.sql.exec(`INSERT INTO ${t} VALUES ('a','1')`);
  const n1 = rc.writeCount();
  assert.equal(n1, n0, "the reading that follows the tables' making watches them");
  for (const t of listed()) { s.sql.exec(`UPDATE ${t} SET v='2'`); s.sql.exec(`INSERT INTO ${t} VALUES ('b','1')`); }
  assert.equal(rc.writeCount(), n1, "later bookkeeping writes leave it");
  put(rc, "INFO-2026-0001", "k1");
  assert.ok(rc.writeCount() > n1, "and a record write still moves it");
});

test("R91: the counter never falls and two readings with no write between are equal, a rolled-back bookkeeping write included", () => {
  const { s, rc } = fresh();
  makeAll(s); record(s);
  let last = rc.writeCount();
  const seen = () => { const n = rc.writeCount(); assert.ok(n >= last, "never falls"); last = n; return n; };
  s.sql.exec(`INSERT INTO ${listed()[0]} VALUES ('a','1')`);
  const a = seen(), b = seen();
  assert.equal(a, b, "two readings are equal");
  assert.throws(() => rc.transact(() => { s.sql.exec(`INSERT INTO ${listed()[0]} VALUES ('r','1')`); throw new Error("boom"); }), /boom/);
  seen();
  assert.throws(() => rc.transact(() => { s.sql.exec(`INSERT INTO other_rows VALUES ('r','1')`); s.sql.exec(`UPDATE ${listed()[0]} SET v='3'`); throw new Error("boom"); }), /boom/);
  seen();
  put(rc, "INFO-2026-0001", "k1");
  assert.ok(seen() > a, "a record write still raises it");
});

test("R91: a store holding none of the listed tables reads and counts as before, and reading the counter writes no row and makes no table", () => {
  const { s, rc } = fresh();
  const tables = () => [...s.sql.exec(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`)].map((r) => r.name);
  const before = tables();
  assert.equal(rc.writeCount(), 0);
  assert.deepEqual(tables(), before, "no table made in the database");
  put(rc, "INFO-2026-0001", "k1");
  assert.ok(rc.writeCount() >= 3);
});

test("R91: a second instance over the same storage reads the same counter, bookkeeping still left out", () => {
  const { s, rc } = fresh();
  makeAll(s);
  put(rc, "INFO-2026-0001", "k1");
  s.sql.exec(`INSERT INTO ${listed()[0]} VALUES ('a','1')`);
  const left = rc.writeCount();
  const again = recordOf({ storage: { sql: s.sql, transactionSync: s.transactionSync } });
  assert.notEqual(again, rc, "a new instance");
  assert.equal(again.writeCount(), left);
  s.sql.exec(`UPDATE ${listed()[0]} SET v='2'`);
  assert.equal(again.writeCount(), left);
  assert.equal(rc.writeCount(), left);
});

test("R91: an object restarted over the same database starts from 0 again and still leaves bookkeeping out", () => {
  const dir = mkdtempSync(join(tmpdir(), "r91-"));
  try {
    const file = join(dir, "do.sqlite");
    const first = storage({ file });
    const a = recordOf({ storage: first }); a.migrate(); makeAll(first);
    for (let i = 0; i < 4; i++) first.sql.exec(`INSERT INTO ${listed()[0]} VALUES ('${i}','1')`);
    put(a, "INFO-2026-0001", "k1");
    assert.ok(a.writeCount() >= 3);
    first.db.close();
    /* a new connection: SQLite's total_changes() begins again at 0, the tally in the database does not */
    const second = storage({ schema: false, file });
    const b = recordOf({ storage: second }); b.migrate();
    assert.equal(b.writeCount(), 0, "nothing written since this object began");
    second.sql.exec(`UPDATE ${listed()[0]} SET v='2'`);
    second.sql.exec(`INSERT INTO ${listed()[0]} VALUES ('x','1')`);
    assert.equal(b.writeCount(), 0, "the triggers made before the restart still leave bookkeeping out");
    put(b, "INFO-2026-0002", "k1");
    assert.ok(b.writeCount() >= 3, "a record write raises it");
    second.db.close();
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("R91: an instance made over a storage that holds no SQL, as the grammar seam's in-memory users make one, is made and registers as before", () => {
  const rc = recordOf({});
  assert.deepEqual(rc.registerGrammar("a", { ids: ["C-1.1"], arm: () => {} }), { ok: true, module: "a", ids: ["C-1.1"] });
  const other = recordOf({ storage: { sql: "not a connection", transactionSync: (fn) => fn() } });
  assert.ok(other, "a storage whose sql is not an object is made too");
});
