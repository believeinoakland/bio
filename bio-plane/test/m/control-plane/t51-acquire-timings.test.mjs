/* control-plane R115 (T51; K4222; acquisition R95; K4234 (B13)): a call the door stops waiting for (R105's bound) answers the stage times the
   object keeps for the request's trace, read through the store-internal `acquiretimings` route. The hook plays the plane's part: it keeps the
   stages the way `acquire` keeps them, under the trace it is handed. The stand-in object answers the read from what the hook kept. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { M, world, call, defaultHooks } from "./harness.mjs";

test("R115 (T51; K4222; K4234): a timed-out `acquire` answers the stage times the object keeps for the request's trace, read by the store-internal `acquiretimings` with that trace: the stages it ran and the one running", async () => {
  const kept = new Map();
  const handed = [];
  const w = world({ answer: (c) => (c.route === "acquiretimings"
    ? new Response(JSON.stringify({ ok: true, result: { ok: true, stageTimes: kept.get(c.params.trace) ?? {} } })) : null) });
  const hooks = { ...defaultHooks(), acquireBoundMs: 40,
    async gatedOp(ctx) {
      if (ctx.op !== "acquire") return undefined;
      handed.push(ctx.trace);
      kept.set(ctx.trace, { stages: { fetch: 12 }, running: "read", total_ms: 40 });
      await new Promise((r) => setTimeout(r, 400));
      return M.json({ ok: true, result: { ok: true } });
    } };
  const late = await call(w.env, { op: "acquire", token: w.S.ann, method: "POST", hooks, body: { locator: "https://example.org/big" } });
  assert.equal(late.status, 504, late.text);
  assert.equal(late.json.code, "ACQUIRE_TIMED_OUT");
  assert.equal(handed.length, 1, "the handler was handed one trace");
  assert.equal(typeof handed[0], "string", "a session's `acquire` carries a trace");
  assert.ok(handed[0].length > 0, "the trace is not empty");
  const reads = w.env.calls.filter((c) => c.route === "acquiretimings");
  assert.equal(reads.length, 1, "the object is asked once, for the timed-out call's stages");
  assert.equal(reads[0].params.trace, handed[0], "the read names the trace the hook was handed");
  assert.deepEqual(late.json.timings, { stages: { fetch: 12 }, running: "read", total_ms: 40 }, "the times are the object's answer, not the door's");
});

test("R115 control (K4234): a call with no trace (the bootstrap credential's) answers its timeout with no stage times, and the object is asked nothing", async () => {
  const handed = [];
  const w = world({ answer: (c) => (c.route === "acquiretimings"
    ? new Response(JSON.stringify({ ok: true, result: { ok: true, stageTimes: { stages: { fetch: 1 } } } })) : null) });
  const hooks = { ...defaultHooks(), acquireBoundMs: 40,
    async gatedOp(ctx) {
      if (ctx.op !== "acquire") return undefined;
      handed.push(ctx.trace);
      await new Promise((r) => setTimeout(r, 400));
      return M.json({ ok: true, result: { ok: true } });
    } };
  const late = await call(w.env, { op: "acquire", token: w.env.ADMIN_TOKEN, method: "POST", hooks, body: { locator: "https://example.org/big" } });
  assert.equal(late.status, 504, late.text);
  assert.equal(late.json.code, "ACQUIRE_TIMED_OUT");
  assert.equal(handed[0], undefined, "no trace reaches the hook");
  assert.deepEqual(late.json.timings, {}, "no stage times are stated");
  assert.equal(w.env.calls.some((c) => c.route === "acquiretimings"), false, "the object is asked nothing");
});

test("R115 control: a call answered in time carries no door timings, asks the object nothing, and an op other than `acquire` is handed none", async () => {
  const w = world();
  const seen = [];
  const hooks = { ...defaultHooks(), acquireBoundMs: 400,
    async gatedOp(ctx) {
      seen.push([ctx.op, ctx.timings]);
      return ctx.op === "acquire" ? M.json({ ok: true, result: { ok: true, done: true } }) : undefined;
    } };
  const quick = await call(w.env, { op: "acquire", token: w.S.ann, method: "POST", hooks, body: { locator: "https://example.org/small" } });
  assert.equal(quick.status, 200);
  assert.equal(quick.json.timings, undefined, "an answer in time is the handler's, untouched");
  assert.equal(w.env.calls.some((c) => c.route === "acquiretimings"), false, "an answer in time asks the object nothing");
  await call(w.env, { op: "whoami", token: w.S.ann, hooks });
  const acquired = seen.find(([op]) => op === "acquire");
  assert.ok(acquired && acquired[1] && typeof acquired[1] === "object", "`acquire` is handed its timings object");
  const other = seen.find(([op]) => op === "whoami");
  assert.equal(other ? other[1] : null, null, "an op other than `acquire` is handed no timings object");
});
