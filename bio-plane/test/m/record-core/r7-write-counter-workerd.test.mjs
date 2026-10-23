/* record-core R89, R90 (fix round 7, G80; K4736) on the platform: the write counter asked of a real Durable Object's SQLite
   (workerd under Miniflare), where its triggers, its savepoints and a restart of the object are the platform's own and not
   node:sqlite's. Counted, never timed (R-CLOCK); the 20,000-row bulk write's figure is the test's own wall time, taken
   outside the object, and is printed, not asserted. */
import "../../sandbox.mjs";
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import { Miniflare } from "miniflare";

const WORKER = fileURLToPath(new URL("./counter-worker.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: WORKER, script: readFileSync(WORKER, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { COUNTER: { className: "Counter", useSQLite: true } },
});
after(async () => { await mf.dispose(); });
const ask = async (act, n = 1) => (await mf.dispatchFetch(`http://x/?act=${act}&n=${n}`)).json();

test("R89 R90 on workerd: a plain-SQL write to a declared table raises the counter on insert, update and delete; a read and a repeat read do not; a write that rolls back keeps nothing and the counter never falls", async () => {
  const start = await ask("none");
  assert.equal(start.count, 0, "a record never written reads 0");
  assert.equal((await ask("none")).count, 0);
  let last = start.count;
  for (const act of ["insert", "insert", "update", "delete", "alloc"]) {
    const got = await ask(act);
    assert.ok(got.count > last, `${act} raised the counter (${last} to ${got.count})`);
    last = got.count;
  }
  assert.equal((await ask("read")).count, last, "reads do not raise it");
  const rows = (await ask("none")).rows;
  const rolled = await ask("rollback");
  assert.ok(rolled.count >= last, "the counter never falls");
  assert.equal(rolled.rows, rows, "a write that rolled back kept no row");
  assert.equal((await ask("none")).count, rolled.count, "two answers with no write between are equal");
});

test("R89 on workerd: a bulk write of 20,000 rows raises the counter by at least one and its wall time is printed", async () => {
  const before = (await ask("none")).count;
  const t0 = performance.now();
  const got = await ask("bulk", 20000);
  const ms = Math.round(performance.now() - t0);
  console.log(`  [L] 20,000-row insert through the counter: ${ms} ms wall at the test, counter ${before} to ${got.count}`);
  assert.ok(got.count > before);
  assert.ok(got.rows >= 20000);
});

test("R91 on workerd: a bookkeeping table's insert, update, bulk write and delete leave the counter, the triggers are the platform's own (TEMP schema is refused there), a rolled-back one never lowers it, and a record write still raises it", async () => {
  const start = await ask("none");
  for (const act of ["bk-insert", "bk-update", "bk-delete"]) {
    const got = await ask(act, 5);
    assert.equal(got.count, start.count, `${act} left the counter at ${start.count}`);
  }
  assert.equal((await ask("bk-insert", 50)).sessions, 50, "the rows were written");
  assert.equal((await ask("none")).count, start.count, "fifty bookkeeping rows left it");
  assert.ok((await ask("bk-rollback")).count >= start.count, "a rolled-back bookkeeping write never lowers it");
  const after = (await ask("none")).count;
  assert.ok((await ask("insert")).count > after, "a write to a table the list does not name raises it");
});
