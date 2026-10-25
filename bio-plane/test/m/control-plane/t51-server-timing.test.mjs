/* control-plane R121 (fix round 4, C5a, P9; K4429, K4428; amends R105, R115): THE DOOR TIMES EACH OP AND EACH PHASE OF AN ACQUIRE.
   Every answer carries `Server-Timing` (the op, and the time of each call to the object); an `acquire` refused or timed out carries
   `timings.door` = `{acquire, reading, promote}`, clocked in the door's own isolate, with `timings.stages` as the object states them
   (`{}` when it states none). The hooks below play the plane's part: they reach the object as the plane's door does, through the
   `env` (`env.STORE.get(...)`) or the `stub` they are handed, and the routes `acquire` and `extractread` are the two phases. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { M, world, call, defaultHooks, opCalls } from "./harness.mjs";

const SHA = "d".repeat(64);
const later = (ms) => new Promise((r) => setTimeout(r, ms));
/* the object answers no stage record, as after a restart (R121's test: "with the object's stage record forced empty") */
const noStages = (c) => (c.route === "acquiretimings" ? new Response(JSON.stringify({ ok: true, result: { ok: true, stageTimes: null } })) : null);
const filed = () => new Response(JSON.stringify({ ok: true, result: { ok: true, document: { capture: { sha256: SHA } } } }));

/* a plane's part of `acquire`: the capture is filed at once, the reading never ends within the bound */
const readingStuck = (reach) => ({ ...defaultHooks(), acquireBoundMs: 150,
  async gatedOp(ctx) {
    if (ctx.op !== "acquire") return undefined;
    const store = reach === "env" ? ctx.env.STORE.get(ctx.env.STORE.idFromName("bio")) : ctx.stub;
    await store.fetch("http://x/acquire", { method: "POST", body: "{}" });
    await later(40);
    await store.fetch("http://x/extractread", { method: "POST", body: "{}" });
    return M.json({ ok: true, result: { ok: true } });
  } });

const parse = (header) => Object.fromEntries((header || "").split(",").map((m) => m.trim()).filter(Boolean).map((m) => {
  const [name, ...params] = m.split(";");
  return [name, Object.fromEntries(params.map((p) => p.split("=")))];
}));

test("R121 (the phase clock): an `acquire` stopped in the reading states `timings.door.reading` as running and `acquire` as ended, `promote` as not reached, though the object states no stage (through the plane's env and through the stub)", async () => {
  for (const reach of ["env", "stub"]) {
    const w = world({ answer: (c) => (c.route === "extractread" ? later(1000).then(filed) : c.route === "acquire" ? filed() : noStages(c)) });
    const late = await call(w.env, { op: "acquire", token: w.S.ann, method: "POST", hooks: readingStuck(reach), body: { locator: "https://example.org/big.pdf" } });
    assert.equal(late.status, 504, `${reach}: ${late.text}`);
    assert.equal(late.json.code, "ACQUIRE_TIMED_OUT");
    const door = late.json.timings.door;
    assert.ok(door, `${reach}: the door states its phases`);
    assert.deepEqual(Object.keys(door).sort(), ["acquire", "cold", "promote", "reading"], "R129 adds the ages");
    assert.equal(typeof door.acquire.started_ms, "number");
    assert.equal(typeof door.acquire.elapsed_ms, "number");
    assert.equal(door.acquire.running, undefined, `${reach}: the capture's phase ended`);
    assert.equal(door.reading.running, true, `${reach}: the reading was still running when the door stopped waiting`);
    assert.ok(door.reading.started_ms >= door.acquire.started_ms + door.acquire.elapsed_ms, `${reach}: the reading began after the capture`);
    assert.ok(door.reading.elapsed_ms >= 50, `${reach}: the running phase states what it had spent, ${door.reading.elapsed_ms}`);
    assert.equal(door.promote, null, `${reach}: not reached`);
    assert.deepEqual(late.json.timings.stages, {}, `${reach}: the object stated none and the door says so`);
  }
});

test("R121 (every refusal of an acquire): a 502 the handler answers (`STORE_DID_NOT_ANSWER`) carries `timings.door` and the stages the object states, and the stages the object does not state are `{}`", async () => {
  const silent = { ...defaultHooks(), async gatedOp(ctx) {
    if (ctx.op !== "acquire") return undefined;
    await ctx.stub.fetch("http://x/acquire", { method: "POST", body: "{}" });
    return M.storeSilent("acquire");
  } };
  const stated = { total_ms: 1200, stages: { fetch: 900, read: 300 }, running: null };
  const w = world({ answer: (c) => (c.route === "acquiretimings" ? new Response(JSON.stringify({ ok: true, result: { ok: true, stageTimes: stated } })) : null) });
  const r = await call(w.env, { op: "acquire", token: w.S.ann, method: "POST", hooks: silent, body: { locator: "https://example.org/x" } });
  assert.equal(r.status, 502, r.text);
  assert.equal(r.json.code, "STORE_DID_NOT_ANSWER");
  assert.deepEqual(r.json.timings.stages, stated.stages, "the object's stages, as R95 states them");
  assert.ok(r.json.timings.door.acquire, "the door's own phase, beside them");
  assert.equal(r.json.timings.door.reading, null);
  const n = world({ answer: noStages });
  const none = await call(n.env, { op: "acquire", token: n.S.ann, method: "POST", hooks: silent, body: { locator: "https://example.org/x" } });
  assert.deepEqual(none.json.timings.stages, {}, "`{}` only when the object answered none");
  assert.ok(none.json.timings.door.acquire, "and the door's phases are still there");
  /* a refusal the handler gives at 200 inside the envelope or at 4xx is not a failure of the capture: it carries no door timings */
  const refusal = { ...defaultHooks(), async gatedOp(ctx) { return ctx.op === "acquire" ? M.json({ ok: false, reason: "BAD_FOR", code: "BAD_FOR" }, 400) : undefined; } };
  const bad = await call(w.env, { op: "acquire", token: w.S.ann, method: "POST", hooks: refusal, body: { locator: "https://example.org/x" } });
  assert.equal(bad.status, 400);
  assert.equal(bad.json.timings, undefined);
});

test("R121 control: an answer in time carries no `timings.door`, a phase that ran fully is not `running`, and the answer's body is the handler's, untouched", async () => {
  const w = world({ answer: (c) => (c.route === "acquire" || c.route === "extractread" ? filed() : null) });
  const hooks = { ...defaultHooks(), acquireBoundMs: 2000, async gatedOp(ctx) {
    if (ctx.op !== "acquire") return undefined;
    await ctx.stub.fetch("http://x/acquire", { method: "POST", body: "{}" });
    await ctx.stub.fetch("http://x/extractread", { method: "POST", body: "{}" });
    // fixtures-own: synthetic a finished acquire the handler gives in time; the test is that the door leaves it untouched
    return M.json({ ok: true, result: { ok: true, done: true } });
  } };
  const quick = await call(w.env, { op: "acquire", token: w.S.ann, method: "POST", hooks, body: { locator: "https://example.org/small" } });
  assert.equal(quick.status, 200, quick.text);
  assert.equal(quick.json.timings, undefined, "an answer in time is the handler's, untouched");
  assert.deepEqual(quick.json.result, { ok: true, done: true });
  assert.match(quick.headers.get("server-timing"), /^acquire;dur=\d+/, "its time is in the header");
});

test("R121 (Server-Timing): every answer of the door carries the op as its metric and the time of each call it made to the object; a read op's body is not changed, and no header names a credential, a member or an address", async () => {
  const w = world();
  const r = await call(w.env, { op: "whoami", token: w.S.ann });
  assert.equal(r.status, 200, r.text);
  const timing = r.headers.get("server-timing");
  assert.ok(timing, "the header is there");
  const metrics = parse(timing);
  assert.ok(metrics.whoami, `the op is the first metric: ${timing}`);
  assert.match(metrics.whoami.dur, /^\d+(\.\d+)?$/);
  const routes = opCalls(w.env).concat(w.env.calls.filter((c) => c.route === "session"));
  assert.ok(routes.length > 0, "the op made calls to the object");
  assert.ok(Object.keys(metrics).some((k) => k.startsWith("do-")), `each call to the object is a metric: ${timing}`);
  for (const k of Object.keys(metrics)) assert.match(k, /^[a-z0-9_-]+$/i, `a token, not free text: ${k}`);
  assert.equal(timing.includes(w.S.ann), false, "no credential");
  assert.equal(/ann|example|plane/i.test(timing.replace(/[a-z]*(?:do-)[a-z]*/gi, "")), false, "no name or address of a member's");
  /* the body is the read's own: the header is the only addition */
  const again = await call(w.env, { op: "whoami", token: w.S.ann });
  assert.deepEqual(again.json, r.json);
});

test("R121 (Server-Timing, every kind of answer): a refusal, an unknown op, a public op and a page each carry the header, the metric naming the op (or `unknown`, `page`), never what the caller wrote", async () => {
  const w = world();
  const refused = await call(w.env, { op: "whoami" });
  assert.ok([401, 403].includes(refused.status), String(refused.status));
  assert.ok(parse(refused.headers.get("server-timing")).whoami, "a refused op is timed under its name");
  const unknown = await call(w.env, { op: "no-such-op-<script>alert(1)", token: w.S.ann });
  assert.equal(unknown.json.reason, "UNKNOWN_OP");
  assert.deepEqual(Object.keys(parse(unknown.headers.get("server-timing"))), ["unknown"], "what the caller wrote is not echoed");
  const pub = await call(w.env, { op: "publicthing", hooks: defaultHooks() });
  assert.ok(pub.headers.get("server-timing"), "an answer of any kind is timed");
  const page = await call(w.env, { path: "/app" });
  assert.equal(page.status, 200, page.text.slice(0, 200));
  assert.ok(parse(page.headers.get("server-timing")).page, "the page is timed as `page`");
  const version = await call(w.env, { path: "/version" });
  assert.ok(version.headers.get("server-timing"), "even /version");
});
