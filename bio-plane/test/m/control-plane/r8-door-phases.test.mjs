/* control-plane R129 (fix round 8, G106; K4428, K4817; R-LOG, R-CLOCK, R-NOLOAD; amends R121): EACH ACQUIRE AND UPLOAD IS LOGGED WHOLE, AND A FIRST CAPTURE IS TIMED WITH NO TICK RUNNING.
   Cause unknown (the walker's first web capture was answered after 42.8 s and nothing reproduces it): the door names what it can see. `acquire`'s answer's
   `timings.door` carries `cold: {isolate_ms, object_ms}` (the ages of this Worker isolate and of the object at the request), and the door writes, for every
   `acquire` and `captureupload`, a `request_start` line BEFORE it asks the object (Workers Logs lost the tail of a long firing's lines, so the line that says a request
   began must already be out) and a `request_done` line AFTER: `{event, op, total_ms, stages, door, queued_ms, isolate_ms, object_ms}`, `queued_ms` the object route's
   `do-` less its `in-`. A line is counts and instants; it holds no credential, member, address or name. The object states its age in a module-stated
   `server-timing: object-age;dur=<ms>` (R128); until it does, `object_ms` is null. The second half runs the first web capture of a host never seen, on a fresh
   object with no tick, through the real plane, timed by the test's own clock outside the object (R-CLOCK). */
import "../../sandbox.mjs";
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Miniflare } from "miniflare";
import { M, world, call, defaultHooks } from "./harness.mjs";

const SHA = "d".repeat(64);
const later = (ms) => new Promise((r) => setTimeout(r, ms));
const EVENTS = ["request_start", "request_done", "marker"];

/* the structured lines `console.log` receives while `run` goes, in order; anything else printed is left to the real console */
async function logged(run) {
  const real = console.log, lines = [];
  console.log = (...a) => {
    let o = null;
    try { o = a.length === 1 && typeof a[0] === "string" ? JSON.parse(a[0]) : null; } catch { o = null; }
    if (o && EVENTS.includes(o.event)) lines.push(o); else real(...a);
  };
  try { await run(); } finally { console.log = real; }
  return lines;
}
const stating = (age, ms = 40) => new Response(JSON.stringify({ ok: true, result: { ok: true, document: { capture: { sha256: SHA } } } }),
  { headers: { "server-timing": `object;dur=${ms}${age === null ? "" : `, object-age;dur=${age}`}`, "content-type": "application/json" } });
const marked = (inner) => (c) => { if (c.route === "acquire" || c.route === "captureupload") console.log(JSON.stringify({ event: "marker", route: c.route })); return inner ? inner(c) : null; };
const hooksFor = (bound) => ({ ...defaultHooks(), ...(bound ? { acquireBoundMs: bound } : {}), async gatedOp(ctx) {
  if (ctx.op !== "acquire") return undefined;
  await ctx.stub.fetch("http://x/acquire", { method: "POST", body: "{}" });
  await later(10);
  // fixtures-own: synthetic a gated op's body, only the door's phase timing is under test, not what the answer says
  return M.json({ ok: true, result: { ok: true, done: true } });
} });

test("R129 (G106): an `acquire` writes `request_start` before the object is asked and `request_done` after, each with its fields, and the line holds no credential, member or address", async () => {
  const w = world({ answer: marked((c) => (c.route === "acquire" ? stating(300000) : null)) });
  const lines = await logged(async () => {
    const r = await call(w.env, { op: "acquire", token: w.S.ann, method: "POST", hooks: hooksFor(), body: { locator: "https://example.org/secret-path?k=zzz" } });
    assert.equal(r.status, 200, r.text);
  });
  assert.deepEqual(lines.map((l) => l.event), ["request_start", "marker", "request_done"], "the start line is out before the object is reached");
  const [start, , done] = lines;
  assert.equal(start.op, "acquire");
  assert.ok(Number.isFinite(start.isolate_ms) && start.isolate_ms >= 0, `isolate_ms: ${start.isolate_ms}`);
  assert.equal(start.object_ms, null, "nothing has yet stated the object's age at the start");
  assert.equal(done.op, "acquire");
  for (const k of ["total_ms", "queued_ms", "isolate_ms"]) assert.ok(Number.isFinite(done[k]) && done[k] >= 0, `${k}: ${done[k]}`);
  assert.equal(done.object_ms, 300000, "the age the object stated");
  assert.equal(typeof done.stages, "object");
  assert.deepEqual(Object.keys(done.door).sort(), ["acquire", "cold", "promote", "reading"]);
  assert.deepEqual(Object.keys(done.door.cold).sort(), ["isolate_ms", "object_ms"]);
  assert.ok(done.door.acquire && done.door.acquire.elapsed_ms >= 0, "the phase the object was asked in");
  for (const l of lines) {
    const text = JSON.stringify(l);
    assert.equal(text.includes(w.S.ann), false, "no credential");
    assert.equal(/example\.org|secret-path|zzz|ann/.test(text), false, `no address or name: ${text}`);
  }
});

test("R129 (G106): `captureupload` writes the same two lines, the start before the object is asked", async () => {
  const w = world({ answer: marked() });
  const lines = await logged(async () => {
    const r = await call(w.env, { op: "captureupload", token: w.S.ann, method: "POST", params: { statement: "s", name: "n" }, body: "bytes" });
    assert.equal(r.status, 200, r.text);
  });
  assert.deepEqual(lines.map((l) => l.event), ["request_start", "marker", "request_done"]);
  assert.equal(lines[2].op, "captureupload");
  assert.equal(lines[2].object_ms, null, "the object stated no age");
  assert.ok(Number.isFinite(lines[2].queued_ms) || lines[2].queued_ms === null);
});

test("R129 (G106): a stopped `acquire` carries `timings.door.cold` with both ages (the object's null when it states none); an answer in time carries no timings", async () => {
  const stuck = { ...defaultHooks(), acquireBoundMs: 120, async gatedOp(ctx) {
    if (ctx.op !== "acquire") return undefined;
    await ctx.stub.fetch("http://x/acquire", { method: "POST", body: "{}" });
    await later(1000);
    return M.json({ ok: true, result: { ok: true } });
  } };
  for (const [age, expected] of [[7000, 7000], [null, null]]) {
    const w = world({ answer: (c) => (c.route === "acquire" ? stating(age) : c.route === "acquiretimings" ? new Response(JSON.stringify({ ok: true, result: { ok: true, stageTimes: null } })) : null) });
    const late = await call(w.env, { op: "acquire", token: w.S.ann, method: "POST", hooks: stuck, body: { locator: "https://example.org/x" } });
    assert.equal(late.status, 504, late.text);
    const cold = late.json.timings.door.cold;
    assert.ok(cold, "cold is there");
    assert.ok(Number.isFinite(cold.isolate_ms) && cold.isolate_ms >= 0, `the isolate's age: ${cold.isolate_ms}`);
    assert.equal(cold.object_ms, expected);
  }
  const w = world({ answer: (c) => (c.route === "acquire" ? stating(1) : null) });
  const quick = await call(w.env, { op: "acquire", token: w.S.ann, method: "POST", hooks: hooksFor(2000), body: { locator: "https://example.org/small" } });
  assert.equal(quick.status, 200, quick.text);
  assert.equal(quick.json.timings, undefined, "an answer in time carries no timings (R121)");
});

test("R129 control (G106): no other op writes a request line, and a refused `acquire` (no session) writes none for the object it never reached", async () => {
  const w = world();
  const lines = await logged(async () => {
    await call(w.env, { op: "projectlist", token: w.S.ann });
    await call(w.env, { op: "whoami", token: w.S.ann });
    await call(w.env, { path: "/version" });
  });
  assert.equal(lines.length, 0, JSON.stringify(lines));
  const refused = await logged(async () => { await call(w.env, { op: "acquire", method: "POST", body: { locator: "https://example.org/x" } }); });
  assert.equal(refused.filter((l) => l.event === "request_start").length, 0, "the object was not asked, so no request began");
});

/* ---- the first web capture of a host never seen, on a fresh object, with no tick (review2 G5): the test's own clock ---- */

const SRC = fileURLToPath(new URL("../../../src/plane/index.mjs", import.meta.url));
const ADM = "adm-r8phase-0123456789abcdef", PASSWORD = "the founder's long password, round eight", ORIGIN = "https://group.example";
const PAGE = new TextEncoder().encode("<!doctype html><html><head><title>A scripted page</title></head><body><p>The clerk stamped the contract before the vote.</p></body></html>");
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } }, r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: "mem-r8phase-0123456789abcdef", PROBE_TOKEN: "prb-r8phase-0123456789abcdef", VERSION: "4.7.8",
              INSTANCE_NAME: "r8phase-town", GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService: () => new Response(PAGE, { headers: { "content-type": "text/html", "content-length": String(PAGE.length) } }),
});
after(() => mf.dispose());
const plane = (url, init = {}) => mf.dispatchFetch(new URL(url, ORIGIN).href, init);
const metrics = (res) => Object.fromEntries((res.headers.get("server-timing") || "").split(",").map((m) => m.trim()).filter(Boolean).map((m) => {
  const [name, ...ps] = m.split(";");
  return [name, Object.fromEntries(ps.map((p) => p.split("=")))];
}));

test("R129 (G106, review2 G5): the first web capture of a host never seen, on a fresh object with no tick, is answered within the 15 s bar by the test's own clock; the object's wait (`do-acquire` less `in-acquire`) is reported, not bounded", { timeout: 300000 }, async () => {
  await (await plane("/api/?op=claim", { method: "POST", body: JSON.stringify({ bootstrapToken: ADM, password: PASSWORD }) })).arrayBuffer();
  const signed = await (await plane("/api/?op=login", { method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ handle: "admin", password: PASSWORD, device: "own" }) })).json();
  assert.equal(signed.ok, true, JSON.stringify(signed).slice(0, 300));
  const auth = { authorization: `Bearer ${signed.result.token}`, "content-type": "application/json" };
  const t0 = Date.now();
  const res = await plane("/api/?op=acquire", { method: "POST", headers: auth, body: JSON.stringify({ locator: "https://first-seen-host.example/walk?rw=r8" }) });
  const wall = Date.now() - t0;
  const body = await res.json();
  assert.equal(res.status, 200, JSON.stringify(body).slice(0, 500));
  assert.ok(wall < 15000, `answered in ${wall} ms by the test's own clock (K4354's bar)`);
  const m = metrics(res);
  const queued = m["do-acquire"] && m["in-acquire"] ? Number(m["do-acquire"].dur) - Number(m["in-acquire"].dur) : null;
  console.log(`G106: first capture of a never-seen host: wall ${wall} ms; do-acquire ${m["do-acquire"]?.dur ?? "-"} less in-acquire ${m["in-acquire"]?.dur ?? "-"} = ${queued} ms (reported, not asserted)`);
  assert.ok(m.acquire && Number.isFinite(Number(m.acquire.dur)), "the door states its own time for the op");
  /* a second capture of another path of the same host on the now-warm object is answered too (the walker's later presses took 5-7 s) */
  const t1 = Date.now();
  const again = await plane("/api/?op=acquire", { method: "POST", headers: auth, body: JSON.stringify({ locator: "https://first-seen-host.example/walk?rw=r8b" }) });
  await again.arrayBuffer();
  assert.equal(again.status, 200);
  console.log(`G106: the next capture on the warm object: wall ${Date.now() - t1} ms`);
});
