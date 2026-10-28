/* PROTO_CHAIN_BYTES gate in pending-work (throwaway): past the bound no read piece starts, the row stays owed and due after the rest;
   after the rest (same isolate) the count resets and reading advances. */
import "../../../src/store-assembly/register.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { store } from "./alarmed-store.mjs";
import { bucketStandIn } from "../case-carriage/fixture.mjs";
import { extractionOf, protoChain } from "../../../src/extraction/index.mjs";
import { captureOf } from "../../../src/capture/index.mjs";

const rows = (x) => [...x.ctx.storage.sql.exec(`SELECT * FROM keeps_pending WHERE state <> 'finished'`)];
const D = "a".repeat(64);
async function world(env) {
  const x = await store({ env: { CAPTURES: bucketStandIn(), ...env } });
  x.asked = 0;
  extractionOf(x.ctx).readHeld = async () => { x.asked++; return { ok: true, read: true, more: true, detail: { c: x.asked } }; };
  await captureOf(x.ctx).owedLater({ kind: "reading", sha: D });
  return x;
}

test("past the bound: no piece starts, the row is due after the rest; then the count resets and the read advances", async () => {
  protoChain.bytes = 0; protoChain.restUntil = null;
  const x = await world({ PROTO_CHAIN_BYTES: "1000", PROTO_CHAIN_REST_MS: "5000" });
  const t0 = Date.now() + 1000;
  await x.s.onAlarm(t0);
  assert.equal(x.asked, 1, "under the bound: a piece is read");
  protoChain.bytes = 5000;
  const before = x.asked;
  await x.s.onAlarm(Date.now() + 1000);
  assert.equal(x.asked, before, "over the bound: nothing is read");
  const [r] = rows(x);
  assert.equal(r.final_why, null); assert.equal(r.attempts, 0, "a rest is no attempt");
  assert.ok(r.due_at >= Date.now() + 3000, "due after the rest");
  assert.ok(protoChain.restUntil > Date.now());
  await x.s.onAlarm(Date.now() + 2000);
  assert.equal(x.asked, before, "still resting");
  protoChain.restUntil = Date.now() - 1;   /* the rest has passed */
  await x.s.onAlarm(Date.now() + 100000);
  assert.equal(x.asked, before + 1, "after the rest the reading advances");
  assert.equal(protoChain.bytes, 0); assert.equal(protoChain.restUntil, null);
});

test("unset: no gate, however large the count", async () => {
  protoChain.bytes = 1e12; protoChain.restUntil = null;
  const x = await world({});
  await x.s.onAlarm(Date.now() + 1000);
  assert.equal(x.asked, 1);
  protoChain.bytes = 0;
});

test("three owed reads: during the rest every read row waits it out and after it the reading goes on", async () => {
  protoChain.bytes = 0; protoChain.restUntil = null;
  const x = await store({ env: { CAPTURES: bucketStandIn(), PROTO_CHAIN_BYTES: "1000", PROTO_CHAIN_REST_MS: "5000" } });
  const shas = ["1", "2", "3"].map((c) => c.repeat(64));
  const asked = [];
  extractionOf(x.ctx).readHeld = async (a) => { asked.push(a.sha); return { ok: true, read: true, more: true, detail: { c: asked.length } }; };
  for (const s of shas) { await captureOf(x.ctx).owedLater({ kind: "reading", sha: s }); await new Promise((r) => setTimeout(r, 2)); }
  const at = Date.now() + 1000;
  await x.s.onAlarm(at);
  assert.equal(asked.length, 1);
  protoChain.bytes = 5000;
  await x.s.onAlarm(at + 10);
  assert.equal(asked.length, 1, "resting: nothing read");
  const dues = rows(x).map((r) => r.due_at);
  assert.ok(dues.every((d) => d >= Date.now() + 3000), `every row waits: ${dues.map((d) => d - Date.now())}`);
  assert.equal(new Set(dues).size, 3, "each at its own instant (equal dues would stall the scheduler's hold against a spin)");
  protoChain.restUntil = Date.now() - 1;
  await x.s.onAlarm(Date.now() + 6000);
  assert.equal(asked.length, 2, "after the rest the reading goes on");
  protoChain.bytes = 0; protoChain.restUntil = null;
});
