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

test("R89 R90 on workerd: a plain-SQL write to a declared table raises the counter on insert, update and delete; a read, a rolled-back write and a repeat read do not", async () => {
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
  const rolled = await ask("rollback");
  assert.equal(rolled.count, last, "a write that rolled back is not counted");
  assert.equal((await ask("none")).count, last, "two answers with no write between are equal");
});

test("R89 on workerd: a bulk write of 20,000 rows raises the counter by at least one and its wall time is printed", async () => {
  const before = (await ask("none")).count;
  const t0 = performance.now();
  const got = await ask("bulk", 20000);
  const ms = Math.round(performance.now() - t0);
  console.log(`  [L] 20,000-row insert through the triggers: ${ms} ms wall at the test, counter ${before} to ${got.count}`);
  assert.ok(got.count > before);
  assert.ok(got.rows >= 20000);
});
