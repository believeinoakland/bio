/* control-plane R128 (fix round 8, G113, G116, G118, G120; review G4; K4817; amends R121): THE DOOR CARRIES THE TIMINGS A MODULE STATES. The object states its
   own time in `server-timing: object;dur=<ms>` (R121); a module that wants the door to carry a measure of its own (`fleet;dur`, `rows-queue;dur`,
   `queue-count;desc=hit`) states it in the same header. The door's phase clock accepts the entries a module states, token-checked, into the answer's
   `Server-Timing`, at most `METRIC_MAX` of them, and adds `body;dur` (the time to read the object's answer body) and `bytes` for each op's object answers.
   The object here is the harness's, answering as the plane's object does; what the module states is what its answer's header says. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { M, world, call, defaultHooks } from "./harness.mjs";

const parse = (header) => (header || "").split(",").map((m) => m.trim()).filter(Boolean).map((m) => {
  const [name, ...params] = m.split(";");
  return { name, params: Object.fromEntries(params.map((p) => { const i = p.indexOf("="); return [p.slice(0, i), p.slice(i + 1)]; })) };
});
const byName = (header) => Object.fromEntries(parse(header).map((e) => [e.name, e.params]));
/* an object answer for `route` stating `entries` (a header value) and a body of `size` bytes of padding */
const stating = (entries, size = 0) => (c) => (c.route === "statedroute"
  ? new Response(JSON.stringify({ ok: true, result: { ok: true, pad: "x".repeat(size) } }), { headers: { "server-timing": entries, "content-type": "application/json" } }) : null);
const reachOne = () => ({ ...defaultHooks(), async gatedOp(ctx) {
  if (ctx.op !== "projectlist") return undefined;
  const res = await ctx.stub.fetch("http://x/statedroute", { method: "POST", body: "{}" });
  return M.json(await res.json(), 200);
} });
const run = async (entries, size, token) => {
  const w = world({ answer: stating(entries, size) });
  /* an op the table declares, answered by the hook above through the object */
  const r = await call(w.env, { op: "projectlist", token: w.S[token ?? "ann"], hooks: { ...defaultHooks(), async gatedOp(ctx) {
    if (ctx.op !== "projectlist") return undefined;
    const res = await ctx.stub.fetch("http://x/statedroute", { method: "POST", body: "{}" });
    return M.json(await res.json(), 200);
  } } });
  assert.equal(r.status, 200, r.text);
  return r;
};
void reachOne;

test("R128 (review G4): an entry a module states in its answer reaches the door's `Server-Timing` with its fields, beside the door's own `do-` and `in-` metrics", async () => {
  const r = await run("object;dur=12, fleet;dur=7, facts;dur=3.5, queue-count;desc=hit, rows-queue;dur=2;desc=\"cache hit\"");
  const m = byName(r.headers.get("server-timing"));
  assert.equal(m.fleet.dur, "7", JSON.stringify(m));
  assert.equal(m.facts.dur, "3.5");
  assert.equal(m["queue-count"].desc, "hit");
  assert.equal(m["rows-queue"].dur, "2");
  assert.equal(m["rows-queue"].desc, "\"cache hit\"");
  assert.equal(m["in-statedroute"].dur, "12", "the object's own time is told as before (R121)");
  assert.ok(m["do-statedroute"], "and the call, as before");
  assert.ok(Object.keys(m)[0] === "projectlist", "the op is the first metric");
});

test("R128 (review G4): a malformed entry is dropped whole, a name that is the door's is never taken, and nothing a module states can put free text in the header", async () => {
  const bad = ["bad name;dur=1", "x;dur=abc", "y;dur=-3", "z;desc=\"a<script>alert(1)</script>\"", "do-evil;dur=1", "in-evil;dur=1", "body;dur=999999", "bytes;dur=999999",
    "projectlist;dur=1", "t".repeat(60) + ";dur=1", "u;dur=1e9999", "v;desc=\"" + "a".repeat(80) + "\"", ";dur=5", "w;dur="];
  const r = await run("object;dur=2, ok-one;dur=4, " + bad.join(", ") + ", ok-two;desc=fine");
  const header = r.headers.get("server-timing");
  const m = byName(header);
  assert.equal(m["ok-one"]?.dur, "4", header);
  assert.equal(m["ok-two"]?.desc, "fine", header);
  for (const text of ["bad name", "alert", "<", "evil", "999999", "1e9999", "aaaaaaaaaa"]) assert.equal(header.includes(text), false, `${text} is not in ${header}`);
  assert.notEqual(m.body?.dur, "999999", "the door's body metric is the door's");
  assert.equal(parse(header).filter((e) => e.name === "projectlist").length, 1, "the op's metric is the door's");
  for (const e of parse(header)) assert.match(e.name, /^[a-z0-9_-]{1,48}$/i, `a token: ${e.name}`);
});

test("R128 (review G4): at most METRIC_MAX entries leave, the door's own first; a module that states more has the rest dropped, never the op", async () => {
  const many = Array.from({ length: 200 }, (_, i) => `m${i};dur=${i}`).join(", ");
  const r = await run("object;dur=1, " + many);
  const entries = parse(r.headers.get("server-timing"));
  assert.ok(entries.length <= 64, `${entries.length} entries`);
  assert.ok(entries.length >= 30, `the raised bound holds a module's worth: ${entries.length}`);
  assert.equal(entries[0].name, "projectlist");
  assert.ok(entries.some((e) => e.name === "do-statedroute"), "the door's own metric survives a module's flood");
});

test("R128 (review G4): the door adds `body;dur` and `bytes` for the object's answers: the bytes are those of the bodies the door read, the time is a whole number of milliseconds", async () => {
  const small = byName((await run("object;dur=1", 0)).headers.get("server-timing"));
  const large = byName((await run("object;dur=1", 20000)).headers.get("server-timing"));
  for (const m of [small, large]) {
    assert.ok(m.body, "body;dur");
    assert.match(m.body.dur, /^\d+$/);
    assert.ok(m.bytes, "bytes");
    assert.match(m.bytes.dur, /^\d+$/);
  }
  assert.ok(Number(large.bytes.dur) - Number(small.bytes.dur) >= 20000, `the larger answer is counted: ${small.bytes.dur} -> ${large.bytes.dur}`);
  assert.ok(Number(small.bytes.dur) > 0, "even an answer of a few bytes is counted");
});

test("R128 control (review G4): an answer that states nothing carries only the door's own metrics and the two it adds; a refusal and a page carry the header as before", async () => {
  const w = world();
  const r = await call(w.env, { op: "projectlist", token: w.S.ann });
  const names = parse(r.headers.get("server-timing")).map((e) => e.name);
  for (const n of names) assert.ok(n === "projectlist" || n.startsWith("do-") || n.startsWith("in-") || n === "body" || n === "bytes" || n.startsWith("bytes-"), `only the door's own: ${n}`);
  const refused = await call(w.env, { op: "projectlist" });
  assert.ok(byName(refused.headers.get("server-timing")).projectlist);
  const page = await call(w.env, { path: "/app" });
  assert.ok(byName(page.headers.get("server-timing")).page);
  /* the body of an answer is unchanged by being counted */
  const again = await call(w.env, { op: "projectlist", token: w.S.ann });
  assert.deepEqual(again.json, r.json);
});

test("R128 (K4822): a module in the Worker states its measure by the door's one hook, `stateTiming(name, ms)`, handed to the plane's door context for a gated and for a public op; it reaches `Server-Timing`, and a refused name or duration is dropped", async () => {
  const w = world();
  const gated = await call(w.env, { op: "projectlist", token: w.S.ann, hooks: { ...defaultHooks(), async gatedOp(ctx) {
    assert.equal(typeof ctx.stateTiming, "function", "the gated door context carries the hook");
    ctx.stateTiming("gate", 12.4); ctx.stateTiming("commit", 7);
    ctx.stateTiming("bad name", 1); ctx.stateTiming("body", 5); ctx.stateTiming("do-x", 5); ctx.stateTiming("neg", -1); ctx.stateTiming("nan", Number.NaN); ctx.stateTiming(5, 5);
    return M.json({ ok: true, result: { ok: true } });
  } } });
  const m = byName(gated.headers.get("server-timing"));
  assert.equal(m.gate?.dur, "12");
  assert.equal(m.commit?.dur, "7");
  for (const n of ["bad name", "neg", "nan", "do-x"]) assert.equal(n in m, false, n);
  assert.notEqual(m.body?.dur, "5", "the door's own `body` is the door's");
  const pub = await call(w.env, { op: "bootstrap", hooks: { ...defaultHooks(), async publicOp(ctx) {
    assert.equal(typeof ctx.stateTiming, "function", "the public door context carries it too");
    ctx.stateTiming("fleet", 41);
    return M.json({ ok: true });
  } } });
  assert.equal(byName(pub.headers.get("server-timing")).fleet?.dur, "41");
  /* control: a context's hook called with nothing changes nothing, and an op that never calls it carries no module entry */
  const none = await call(w.env, { op: "projectlist", token: w.S.ann });
  assert.equal(Object.keys(byName(none.headers.get("server-timing"))).some((k) => ["gate", "commit", "fleet"].includes(k)), false);
});
