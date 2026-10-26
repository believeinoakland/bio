/* acquisition R112 (T51 fix round 8, G107; K4817; amends R5): A RENDER'S KEEP FITS THE BAR. The render is waited min(10 s, bar less the promotion's
   reserve less the time used), which fixes when the WAIT for the renderer ends, not when the call ends: what followed the renderer's return was
   unbudgeted, and the stage named `render` also keeps every body the page loaded in the evidence store, eight at a time, a trip each for `head` and
   `put` (acadia's visitor view: 235 requests, 90 kept, a renderer back at 8.8 s, answered at 13.2 and 15.5 s). With `render: true` the keep is now inside
   the render's share of the call: bodies the keep cannot reach in what is left leave the render pending (R5), finished by "Finish it" or the alarm
   from the record, and what is kept and read is the same.
   The test's clock is its own, at a fifth of the walk's scale (bar 3 s, promotion's reserve 0.7 s, renderer back at ~1.8 s, 90 bodies, a store that
   charges 54 ms a call), handed in through the caller's own `acquireBarMs` and `promoteReserveMs`. Failing first: the answer landed at ~3.2 s. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { world, run, network, HTML, page } from "./fixture.mjs";
import { acquire, owedRun, ACQUIRE_BAR_MS, PROMOTE_RESERVE_MS } from "../../../src/acquisition/index.mjs";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const sha = (s) => createHash("sha256").update(s).digest("hex");
const SHELL = HTML("<div id=app></div>");
const RENDERED = HTML("<p>rendered by a browser</p>");
const PG = "https://r.example/page";
const BAR = 3000, RESERVE = 700, TRIP = 54, RENDER_MS = 1650, FOLLOWING = 300;
const bodyOf = (i) => `body{--n:${i}}`;
const reply = (url, n) => ({ ok: true, html: RENDERED, elapsed_ms: RENDER_MS, engine: "Chrome", engine_version: "1", viewport: { width: 1280, height: 800 },
  dpr: 1, locale: "en-US", timezone: "UTC", navigated_to: url, status: 200,
  requests: Array.from({ length: n }, (_, i) => ({ url: `https://r.example/a${i}.css`, type: "stylesheet", outcome: "completed", body_text: bodyOf(i) })),
  scripts: [], wait: { asked: { until: "networkidle", timeout_ms: 15000 }, fired: "networkidle" } });
/* a store whose `head` and `put` each cost a round trip, as the live copy's R2 does */
const slowStore = (w, ms) => {
  for (const k of ["head", "put"]) { const f = w.b[k].bind(w.b); w.b[k] = async (...a) => { await sleep(ms); return f(...a); }; }
};
function world90(n, trip) {
  const calls = [];
  const w = world({ env: { RENDERER: { fetch: async (u, init) => { const q = JSON.parse(init.body); calls.push(q); await sleep(RENDER_MS);
    return new Response(JSON.stringify(reply(q.url, n))); } } } });
  const entries = new Map();
  // fixtures-contract: plane owed-ledger
  w.store.owedLater = async (e) => { entries.set(e.session, e); return { ok: true }; };
  if (trip) slowStore(w, trip);
  return { w, calls, entries };
}
const press = (x) => run(x.w, { [PG]: () => page(SHELL) }, { locator: PG, render: true }, { acquireBarMs: BAR, promoteReserveMs: RESERVE, postKeepMs: FOLLOWING });
const LIMIT = BAR - RESERVE;

test("R112 (G107): a renderer back at ~1.8 s with 90 loaded bodies over a store that charges a trip a call is answered within the bar less the reserve, the render pending as R5 states", async () => {
  assert.equal(ACQUIRE_BAR_MS, 15000);
  assert.equal(PROMOTE_RESERVE_MS, 3500);
  const x = world90(90, TRIP);
  const r = await press(x);
  assert.equal(r.status, 200);
  assert.ok(r.body.timings.total_ms <= LIMIT, `answered in ${r.body.timings.total_ms} ms, within ${LIMIT}`);
  assert.equal(r.body.render.state, "pending", "the bodies the keep could not reach in the share leave the render pending");
  assert.equal(r.body.document.capture.method === "rendered", false, "the page is filed as served");
  assert.ok(r.body.document.render_pending && r.body.document.render_pending.session);
  /* nothing was lost: the keep goes on from the record, "Finish it" files the pair the waited render files, every body kept, none read or marked differently */
  const sid = r.body.render.session;
  for (let i = 0; i < 400 && !x.w.held(sha(RENDERED)); i++) await sleep(25);
  assert.equal(x.w.held(sha(RENDERED)), true, "the rendered page is held when the keep ends");
  for (let i = 0; i < 90; i++) assert.equal(x.w.held(sha(bodyOf(i))), true, `body ${i} is held`);
  const net = network({ [PG]: () => page(SHELL) });
  try {
    const done = await acquire(x.w.store, { continue: sid }, { cls: "member", member: true, sessMember: "m1", storeName: "bio" });
    assert.equal(done.status, 200);
    assert.equal(done.body.document.capture.method, "rendered");
    assert.equal(done.body.document.render.subresources.filter((s) => s.sha256 && s.sha256 !== "undetermined").length, 90);
    assert.equal(x.calls.length, 1, "one render was made");
  } finally { net.restore(); }
});

test("R112 (G107) control: a page with no loaded bodies over the same store is rendered in the request, as before", async () => {
  const x = world90(0, TRIP);
  const r = await press(x);
  assert.equal(r.status, 200);
  assert.equal(r.body.document.capture.method, "rendered");
  assert.equal(r.body.render, undefined);
  assert.ok(r.body.timings.total_ms <= LIMIT, `answered in ${r.body.timings.total_ms} ms`);
});

test("R112 (G107) control: 90 bodies over a store with no trip cost are kept in the request, the render filed, nothing pending", async () => {
  const x = world90(90, 0);
  const r = await press(x);
  assert.equal(r.status, 200);
  assert.equal(r.body.document.capture.method, "rendered");
  assert.equal(r.body.render, undefined);
  assert.equal(r.body.document.render.subresources.filter((s) => s.sha256 && s.sha256 !== "undetermined").length, 90);
});

test("R112 (G107) control: a caller that names its own wait (`renderWaitMs`), and the alarm's finishing of a pending render, are not cut by the bar: the keep is awaited and the pair filed", async () => {
  const x = world90(90, TRIP);
  const net = network({ [PG]: () => page(SHELL) });
  try {
    const own = await acquire(x.w.store, { locator: PG, render: true }, { cls: "member", member: true, sessMember: "m1", storeName: "bio", renderWaitMs: 20000, acquireBarMs: BAR, promoteReserveMs: RESERVE });
    assert.equal(own.status, 200);
    assert.equal(own.body.document.capture.method, "rendered");
    assert.equal(own.body.render, undefined);
  } finally { net.restore(); }
  /* the alarm's run of a pending render */
  const y = world90(90, TRIP);
  const r = await press(y);
  assert.equal(r.body.render.state, "pending");
  for (let i = 0; i < 400 && !y.w.held(sha(RENDERED)); i++) await sleep(25);
  const net2 = network({ [PG]: () => page(SHELL) });
  const delivered = [];
  try {
    // fixtures-contract: control-plane deliver-owed
    const out = await owedRun(y.w.store, y.entries.get(r.body.render.session), { deliver: async (d) => { delivered.push(d); return { ok: true }; } });
    assert.deepEqual([out.ok, out.done], [true, true]);
  } finally { net2.restore(); }
  assert.equal(delivered.length, 1);
  assert.equal(delivered[0].answer.document.capture.method, "rendered");
});
