/* admission R21, fix round 10 cause 27b: the door window's counts are kept in memory and written to the store at most
   every WINDOW_FLUSH_MS (an injected constant), so fifty counts change at most two rows. The limit is judged from the
   counts in memory; a restart loses at most the last interval of counts. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { storeWorld } from "./harness.mjs";

const W = await import("../../../src/admission/window.mjs");
const T0 = Date.UTC(2026, 9, 7, 12, 0, 0);
const changes = (w) => Number(w.db.prepare("SELECT total_changes() AS n").get().n);
const DIGEST = "a".repeat(64);

test("R21 (27b): fifty counted requests change at most two rows — by source and by session — and the flush is the write", async () => {
  assert.equal(W.WINDOW_FLUSH_MS, 5000);
  for (const ask of [(i) => ({ address: "203.0.113.9", now: T0 + i }), (i) => ({ address: "203.0.113.9", session: DIGEST, now: T0 + i })]) {
    const w = storeWorld({ env: { KNOCK_FINGERPRINT_KEY: "k" } });
    const before = changes(w);
    for (let i = 0; i < 50; i++) assert.equal((await w.a.doorWindow(ask(i))).refused, false);
    w.a.flush();
    assert.ok(changes(w) - before <= 2, `rows changed: ${changes(w) - before}`);
    const table = ask(0).session ? W.SESSION_WINDOW_TABLE : W.DOOR_WINDOW_TABLE;
    assert.equal(w.sql.exec(`SELECT count FROM ${table}`)[0].count, 50);
  }
});

test("R21 (27b): the counts reach the store by themselves after the interval, and not before; a restart keeps what was written", async () => {
  const w = storeWorld({ env: { KNOCK_FINGERPRINT_KEY: "k" }, flushMs: 30 });
  for (let i = 0; i < 5; i++) await w.a.doorWindow({ address: "203.0.113.9", now: T0 });
  assert.deepEqual(w.sql.exec(`SELECT * FROM ${W.DOOR_WINDOW_TABLE}`), [], "nothing written within the interval");
  await new Promise((r) => setTimeout(r, 120));
  assert.deepEqual(w.sql.exec(`SELECT count FROM ${W.DOOR_WINDOW_TABLE}`).map((r) => r.count), [5]);
  /* an object restarting reads what was written and goes on from it */
  const fresh = storeWorld({ env: { KNOCK_FINGERPRINT_KEY: "k" } });
  fresh.sql.exec(`INSERT INTO ${W.DOOR_WINDOW_TABLE} (source, bucket, count) VALUES (?, ?, ?)`,
    await fresh.doorbell.sourceFingerprint("203.0.113.9"), Math.floor(T0 / 600000), 299);
  assert.equal((await fresh.a.doorWindow({ address: "203.0.113.9", now: T0 })).refused, false);
  assert.equal((await fresh.a.doorWindow({ address: "203.0.113.9", now: T0 })).refused, true);
});

test("R21 (27b, controls): the 301st request in ten minutes is still refused, judged from memory before any write; two sources are counted apart; a refused request is not counted", async () => {
  const w = storeWorld({ env: { KNOCK_FINGERPRINT_KEY: "k" } });
  for (let i = 0; i < 300; i++) assert.equal((await w.a.doorWindow({ address: "203.0.113.9", now: T0 + i })).refused, false, `request ${i + 1}`);
  assert.deepEqual(w.sql.exec(`SELECT * FROM ${W.DOOR_WINDOW_TABLE}`), [], "no write yet");
  const r = await w.a.doorWindow({ address: "203.0.113.9", now: T0 + 1000 });
  assert.equal(r.refused, true);
  assert.equal(r.stated, "at most 300 requests from one source in any 10 minutes");
  assert.equal((await w.a.doorWindow({ address: "198.51.100.4", now: T0 + 1000 })).refused, false);
  assert.equal(w.rows().find((x) => x.count === 300).count, 300);
});
