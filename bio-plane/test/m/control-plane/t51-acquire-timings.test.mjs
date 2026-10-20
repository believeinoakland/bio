/* control-plane R115 (T51; K4222; acquisition R95): the door hands `acquire` the object its stages are kept in, through the plane's hook,
   and a call the door stops waiting for (R105's bound) answers the times read from that object at that moment, through acquisition's
   `stageTimes`. The hook plays acquisition's part: it fills the object the way `acquire` keeps it (its stages, the stage running). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { M, world, call, defaultHooks } from "./harness.mjs";

test("R115 (T51; K4222): a timed-out `acquire` answers the stage times of the object the door handed its handler, read through stageTimes: the stages it ran and the one running", async () => {
  const w = world();
  const handed = [];
  const hooks = { ...defaultHooks(), acquireBoundMs: 40,
    async gatedOp(ctx) {
      if (ctx.op !== "acquire") return undefined;
      handed.push(ctx.timings);
      Object.assign(ctx.timings, { start: 0, end: null, stages: { fetch: 12.7 }, running: { name: "read", since: 0 } });
      await new Promise((r) => setTimeout(r, 400));
      return M.json({ ok: true, result: { ok: true } });
    } };
  const late = await call(w.env, { op: "acquire", token: w.S.ann, method: "POST", hooks, body: { locator: "https://example.org/big" } });
  assert.equal(late.status, 504, late.text);
  assert.equal(late.json.code, "ACQUIRE_TIMED_OUT");
  assert.equal(handed.length, 1, "the handler was handed one timings object");
  assert.equal(late.json.timings.stages.fetch, 12, "the stage that ran is floored whole milliseconds");
  assert.equal(late.json.timings.running, "read", "the stage running when the door stopped waiting is named");
  assert.equal(typeof late.json.timings.total_ms, "number");
});

test("R115 control: a call answered in time carries no door timings, and an op other than `acquire` is handed none", async () => {
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
  await call(w.env, { op: "whoami", token: w.S.ann, hooks });
  const acquired = seen.find(([op]) => op === "acquire");
  assert.ok(acquired && acquired[1] && typeof acquired[1] === "object", "`acquire` is handed its timings object");
  const other = seen.find(([op]) => op === "whoami");
  assert.equal(other ? other[1] : null, null, "an op other than `acquire` is handed no timings object");
});
