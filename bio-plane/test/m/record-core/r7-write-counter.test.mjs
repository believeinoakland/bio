/* record-core, fix round 7 (G80; K4736): the record's write counter (R89) and its read (R90). The counter is the cache
   key `queue` needs, so a test here asserts what makes a cache safe: it rises on every committed change to the record, by
   any path (this module's own services, and a declared table another module writes with plain SQL, as `queue`'s mutes
   are), and never on a read. Counted, never timed (R-CLOCK). Over `storage.mjs`, the Durable Object stand-in. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { recordOf } from "../../../src/record-core/index.mjs";
import { storage, bucket } from "./storage.mjs";

const fresh = (opts) => { const s = storage(); const rc = recordOf({ storage: s }, opts); rc.migrate(); return { s, rc }; };
const rows = (s, q, ...a) => [...s.sql.exec(q, ...a)];
const sha = (t) => createHash("sha256").update(t).digest("hex");
const file = (path, text) => ({ path, text, bytes: Buffer.byteLength(text), sha256: sha(text) });
const put = (rc, id, snapKey, text = `x ${id} ${snapKey}`) =>
  rc.commit({ bundleId: id, type: "information", title: `t ${id}`, snapKey, author: "a", base: null, files: [file("bundle.md", text)] });

/* The counter after `act`, and whether it rose. */
function rises(rc, act) {
  const before = rc.writeCount();
  act();
  const after = rc.writeCount();
  return { before, after, rose: after > before };
}

/* A module's table, declared to record-core and written by plain SQL as the modules do. */
function otherModule(s, rc, { declareFirst = true } = {}) {
  const decl = () => rc.declareTable("other", [{ name: "other_rows", purge: "clear", expunge: "none", export: "never",
    sight: "group", derive: "stored", version_chain: false }]);
  const make = () => s.sql.exec(`CREATE TABLE IF NOT EXISTS other_rows (k TEXT PRIMARY KEY, v TEXT)`);
  if (declareFirst) { decl(); make(); } else { make(); decl(); }
}

test("R89: a record never written starts at 0, and the counter is a whole number", () => {
  const { rc } = fresh();
  assert.equal(rc.writeCount(), 0);
  assert.ok(Number.isSafeInteger(rc.writeCount()));
});

test("R89: every write path of the module raises the counter: commit, allocId (both forms), mint, record, lease, setting, expunge, derived marks, purge", () => {
  const { s, rc } = fresh();
  const every = [];
  const step = (name, act) => { const r = rises(rc, act); every.push([name, r.rose]); };
  step("commit, a bundle", () => put(rc, "INFO-2026-0001", "k1"));
  step("commit, a second promotion of it", () => put(rc, "INFO-2026-0001", "k2"));
  step("allocId sequential", () => rc.allocId("INFO", "2026"));
  step("allocId opaque", () => rc.allocId("EVT", "2026"));
  step("mintOpaqueId", () => rc.mintOpaqueId("PROJ", "2026", "-slug"));
  step("recordOpaqueId", () => rc.transact(() => rc.recordOpaqueId("OPQ-2026-chosen")));
  step("acquireLease", () => rc.acquireLease("INFO-2026-0001", "member:a", 60000));
  step("releaseLease", () => rc.releaseLease("INFO-2026-0001", "member:a"));
  step("setSetting", () => rc.setSetting("x", { a: 1 }, "member:a"));
  step("seedMintLedger", () => { put(rc, "CASE-2026-0007", "k1"); rc.seedMintLedger([["CASE", "bundles", "bundle_id"]]); });
  rc.declareTable("rc-test", [{ name: "exp_rows", purge: "clear", expunge: "tombstone", export: "never", sight: "group",
    derive: "stored", version_chain: false }]);
  s.sql.exec(`CREATE TABLE exp_rows (k TEXT PRIMARY KEY)`);
  s.sql.exec(`INSERT INTO exp_rows VALUES ('a')`);
  step("expunge", () => rc.expunge({ module: "rc-test", table: "exp_rows", key: { k: "a" }, ground: "unlawful", by: "member:a" }));
  rc.declareTable("rc-test", [{ name: "der_rows", purge: "clear", expunge: "none", export: "never", sight: "group",
    derive: "derived-rebuildable", key: ["k"], version_chain: false, rebuild: () => [{ k: "a", v: "1" }] }]);
  s.sql.exec(`CREATE TABLE der_rows (k TEXT PRIMARY KEY, v TEXT)`);
  step("markStale", () => rc.markStale("rc-test", "der_rows", "a"));
  step("rebuildDerived", () => rc.rebuildDerived("rc-test", "der_rows"));
  step("purge, one bundle", () => rc.transact(() => rc.purge({ bundleId: "INFO-2026-0001" })));
  step("purge, the whole store", () => rc.transact(() => rc.purge({})));
  assert.deepEqual(every.filter(([, rose]) => !rose), [], "every write path raised the counter");
});

test("R89: a declared table another module writes with plain SQL raises the counter on insert, update and delete, whether it was declared before or after its table was made", () => {
  for (const declareFirst of [true, false]) {
    const { s, rc } = fresh();
    otherModule(s, rc, { declareFirst });
    assert.ok(rises(rc, () => s.sql.exec(`INSERT INTO other_rows VALUES ('a','1')`)).rose, "insert");
    assert.ok(rises(rc, () => s.sql.exec(`UPDATE other_rows SET v='2' WHERE k='a'`)).rose, "update");
    assert.ok(rises(rc, () => s.sql.exec(`INSERT INTO other_rows VALUES ('b','1') ON CONFLICT(k) DO UPDATE SET v='9'`)).rose, "insert");
    assert.ok(rises(rc, () => s.sql.exec(`INSERT INTO other_rows VALUES ('b','3') ON CONFLICT(k) DO UPDATE SET v='9'`)).rose, "upsert");
    assert.ok(rises(rc, () => s.sql.exec(`DELETE FROM other_rows WHERE k='a'`)).rose, "delete");
  }
});

test("R89: a table made and written after it was declared, with no reading of the counter between, is still seen", () => {
  const { s, rc } = fresh();
  const base = rc.writeCount();
  rc.declareTable("late", [{ name: "late_rows", purge: "clear", expunge: "none", export: "never", sight: "group",
    derive: "stored", version_chain: false }]);
  s.sql.exec(`CREATE TABLE late_rows (k TEXT)`);
  s.sql.exec(`INSERT INTO late_rows VALUES ('x')`);
  assert.ok(rc.writeCount() > base, "a row written into a table not yet watched is not lost");
  const seen = rc.writeCount();
  s.sql.exec(`INSERT INTO late_rows VALUES ('y')`);
  assert.ok(rc.writeCount() > seen, "and the next write is counted");
});

test("R89: a change that rolls back is no committed change, a refusal changes nothing, and the counter never falls", () => {
  const { s, rc } = fresh();
  otherModule(s, rc);
  put(rc, "INFO-2026-0001", "k1");
  let last = rc.writeCount();
  const seen = () => { const n = rc.writeCount(); assert.ok(n >= last, "never falls"); last = n; return n; };
  const n0 = seen();
  assert.throws(() => rc.transact(() => { s.sql.exec(`INSERT INTO other_rows VALUES ('r','1')`); throw new Error("boom"); }), /boom/);
  assert.equal(seen(), n0, "a thrown transaction wrote nothing");
  rc.transact(() => { s.sql.exec(`INSERT INTO other_rows VALUES ('r','1')`); return { ok: false, reason: "NO" }; });
  assert.equal(seen(), n0, "a refused transaction wrote nothing");
  assert.equal(rc.setSetting("", 1, "member:a").ok, false);
  assert.equal(rc.setSetting("x", undefined, "member:a").ok, false);
  assert.equal(rc.allocIdOp("PROJ", "2026").ok, false);
  assert.equal(seen(), n0, "a refused act wrote nothing");
  rc.transact(() => rc.purge({}));
  assert.ok(seen() > n0, "a purge removed rows and the counter rose");
  rc.transact(() => rc.purge({}));
  seen();
});

test("R89: a read never raises the counter: every read service answers and the counter stays where it was", () => {
  const ev = bucket();
  const { s, rc } = fresh({ evidence: ev });
  otherModule(s, rc);
  put(rc, "INFO-2026-0001", "k1");
  put(rc, "INFO-2026-0001", "k2");
  rc.setSetting("x", 1, "member:a");
  s.sql.exec(`INSERT INTO other_rows VALUES ('a','1')`);
  const n = rc.writeCount();
  rc.readFile("INFO-2026-0001", "bundle.md"); rc.readImage("INFO-2026-0001"); rc.textAtSha("INFO-2026-0001", sha("x"));
  rc.bundleInfo("INFO-2026-0001"); rc.head("INFO-2026-0001"); rc.manifestEntry("INFO-2026-0001", "k1"); rc.livePaths("INFO-2026-0001");
  rc.listBundles({}); rc.listByType({ type: "information" }); rc.manifestByAuthor({ authorPrefix: "a" });
  rc.getSetting("x"); rc.getSetting("x", { strict: true }); rc.tombstones({});
  rc.digestCensus({}); rc.snapKeyCensus({}); rc.counts(null); rc.ownCounts(null); rc.stats({ capacity: true }); rc.proofCounts();
  rc.declaredTables(); rc.grammars(); rc.isFirstBoot(); rc.evidenceStore();
  rows(s, `SELECT * FROM other_rows`);
  assert.equal(rc.writeCount(), n, "no read wrote");
});

test("R89: an audit sweep is a read: the counter does not move", async () => {
  const { rc } = fresh();
  put(rc, "INFO-2026-0001", "k1");
  const n = rc.writeCount();
  await rc.auditPass({ limit: 10 });
  assert.equal(rc.writeCount(), n);
});

test("R89: the counter is kept in the record: a second instance over the same storage, as after a restart, reads what the first left and goes on from it", () => {
  const { s, rc } = fresh();
  put(rc, "INFO-2026-0001", "k1");
  rc.allocId("INFO", "2026");
  const left = rc.writeCount();
  assert.ok(left >= 2);
  const again = recordOf({ storage: { sql: s.sql, transactionSync: s.transactionSync } });
  assert.notEqual(again, rc, "a new instance");
  again.migrate();
  assert.equal(again.writeCount(), left, "migrating again changes nothing and loses nothing");
  put(again, "INFO-2026-0002", "k1");
  assert.ok(again.writeCount() > left, "it goes on from where it was");
});

test("R90: writeCount() answers the counter as a whole number; two answers with no write between are equal; it writes nothing and asks nothing of the bucket", () => {
  const ev = bucket();
  const { s, rc } = fresh({ evidence: ev });
  put(rc, "INFO-2026-0001", "k1");
  const dump = () => rows(s, `SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`)
    .map((t) => [t.name, JSON.stringify(rows(s, `SELECT * FROM ${t.name} ORDER BY rowid`))]);
  const before = dump();
  const a = rc.writeCount(), b = rc.writeCount(), c = rc.writeCount();
  assert.ok(Number.isSafeInteger(a) && a >= 1);
  assert.deepEqual([a, b, c], [a, a, a]);
  assert.deepEqual(dump(), before, "no table changed");
  assert.deepEqual(ev.calls, [], "nothing asked of the evidence store");
  put(rc, "INFO-2026-0002", "k1");
  assert.ok(rc.writeCount() > a);
});

test("R89, R90: the counter is not itself purged or counted among the record's tables a purge clears", () => {
  const { s, rc } = fresh();
  put(rc, "INFO-2026-0001", "k1");
  const n = rc.writeCount();
  const report = rc.transact(() => rc.purge({}));
  assert.equal(report.ok, true);
  assert.ok(!("record_counter" in report.removed), "the counter is exempt from purge, as the id counter is");
  assert.ok(rc.writeCount() > n);
  assert.equal(rows(s, `SELECT COUNT(*) AS c FROM record_counter`)[0].c, 1);
});

test("R89: a table its owner rebuilt by drop and rename keeps counting, and a store from before the counter takes writes until migrate makes it", () => {
  const { s, rc } = fresh();
  otherModule(s, rc);
  s.sql.exec(`INSERT INTO other_rows VALUES ('a','1')`);
  s.sql.exec(`CREATE TABLE other_rows_new (k TEXT PRIMARY KEY, v TEXT)`);
  s.sql.exec(`INSERT INTO other_rows_new SELECT k, v FROM other_rows`);
  s.sql.exec(`DROP TABLE other_rows`);
  s.sql.exec(`ALTER TABLE other_rows_new RENAME TO other_rows`);
  rc.writeCount();
  assert.ok(rises(rc, () => s.sql.exec(`INSERT INTO other_rows VALUES ('b','1')`)).rose, "the rebuilt table is armed again");

  const old = storage();
  const had = recordOf({ storage: old });
  had.migrate();
  for (const t of rows(old, `SELECT name FROM sqlite_master WHERE type='trigger'`)) old.sql.exec(`DROP TRIGGER "${t.name}"`);
  old.sql.exec(`DROP TABLE record_counter`);
  const upgraded = recordOf({ storage: { sql: old.sql, transactionSync: old.transactionSync } });
  upgraded.declareTable("other", [{ name: "other_rows", purge: "clear", expunge: "none", export: "never", sight: "group",
    derive: "stored", version_chain: false }]);
  old.sql.exec(`CREATE TABLE other_rows (k TEXT)`);
  assert.doesNotThrow(() => { old.sql.exec(`INSERT INTO other_rows VALUES ('x')`); put(upgraded, "INFO-2026-0001", "k1"); }, "no write fails before migrate");
  upgraded.migrate();
  const n = upgraded.writeCount();
  assert.ok(rises(upgraded, () => old.sql.exec(`INSERT INTO other_rows VALUES ('y')`)).rose && upgraded.writeCount() > n);
});
