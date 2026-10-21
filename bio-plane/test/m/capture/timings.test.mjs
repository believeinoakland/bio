/* capture R73 (T51; K4226; acquisition R95): the `acquire` arm hands the handler's `timings` to acquisition's act as
   `opts.timings`, so a caller that stops waiting reads the stages that ran (control-plane R105). Only when one is given:
   nothing else the arm passes changes. At the module's interface through the ops map, with `acquire` recorded. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { captureOps } from "../../../src/capture/index.mjs";

/* a stand-in for the store's acquire: records the opts it is called with and answers a fixed body */
const recording = () => {
  const seen = [];
  const c = { env: {}, acquire: (body, opts) => { seen.push({ body, opts }); return { status: 200, body: { ok: true } }; } };
  return { c, seen };
};
const url = new URL("http://x/acquire?cls=member&member=1&sessMember=member%3Aann&store=bio");

test("R73 (T51; K4226): the acquire arm passes a given timings object to acquire as opts.timings, the same object", async () => {
  const { c, seen } = recording();
  const timings = { started: 1, stages: {} };
  await captureOps(c, url, { locator: "https://s.example/p" }, c.env, { timings }).acquire();
  assert.equal(seen.length, 1);
  assert.equal(seen[0].opts.timings, timings, "the caller's object reaches acquire unchanged");
  assert.deepEqual(seen[0].body, { locator: "https://s.example/p" });
});

test("R73 (T51; K4226): with no timings handed in, acquire receives no timings key, and the other opts are as before (control)", async () => {
  const { c, seen } = recording();
  await captureOps(c, url, { locator: "https://s.example/p" }, c.env).acquire();
  await captureOps(c, url, { locator: "https://s.example/p" }, c.env, {}).acquire();
  for (const { opts } of seen) {
    assert.equal(Object.hasOwn(opts, "timings"), false, "no timings key is passed when none is given");
    assert.deepEqual(opts, { cls: "member", member: true, sessMember: "member:ann", storeName: "bio" });
  }
});
