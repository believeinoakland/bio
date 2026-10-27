/* acquisition R117 (fix round 9, G126g): A PENDING RENDER SURVIVES A RESTART. A render this call did not wait for is a row of the job table, whose session
   carries what the run answered when it returned; the object restarted between the render's start and its delivery (a fresh module instance: an empty
   render table) still finds it, finishes it from the record and delivers the document once, with no second render. The plane's table is a stand-in
   (`owedLater` recording what it is handed, as fix4b-owed.test.mjs). Each test has its control. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, run, network, sha, page, HTML } from "./fixture.mjs";
import { acquire } from "../../../src/acquisition/index.mjs";
import { RENDER_DEFAULTS } from "../../../src/render.mjs";

const SHELL = HTML("<div id=app></div>");
const RENDERED_PAGE = HTML("<p>rendered by a visitor's browser</p>");
const R_ANSWER = (url) => ({ ok: true, html: RENDERED_PAGE, elapsed_ms: 12, engine: "Chrome", engine_version: "1", viewport: { width: 1280, height: 800 },
  dpr: 1, locale: "en-US", timezone: "UTC", navigated_to: url, status: 200, requests: [], scripts: [], wait: { asked: RENDER_DEFAULTS.wait, fired: "networkidle" } });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* a renderer that answers once its gate is opened, counting its calls */
const gated = () => {
  let open; const gate = new Promise((r) => (open = r)); const calls = [];
  return { calls, open, RENDERER: { fetch: async (u, init) => { const q = JSON.parse(init.body); calls.push(q); await gate; return new Response(JSON.stringify(R_ANSWER(q.url))); } } };
};
// fixtures-contract: plane owed-ledger
const ledger = () => { const entries = new Map(), log = []; return { entries, log, owedLater: async (e) => { log.push(e); entries.set(e.session ?? e.sha, e); return { ok: true }; } }; };

test("R117, R99, R100: the object restarts after the render returned and before its delivery: the row finds the kept page in the record, delivers the document once and renders nothing again", async () => {
  const PG = "https://r.example/r117-after";
  const g = gated();
  const w = world({ env: g.RENDERER ? { RENDERER: g.RENDERER } : {} });
  // fixtures-contract: plane owed-ledger
  const L = ledger(); w.store.owedLater = L.owedLater;
  const first = await run(w, { [PG]: () => page(SHELL) }, { locator: PG, render: true }, { renderWaitMs: 20 });
  const sid = first.body.document.render_pending.session;
  assert.deepEqual(L.log, [{ kind: "subresources", sha: first.body.document.capture.sha256, session: sid }], "the pending render is one row");
  assert.equal(g.calls.length, 1);
  g.open();                                    // the renderer returns after the request ended
  await sleep(60);
  const saved = w.store.state.sessions.get(sid);
  assert.ok(saved && saved.state.render_pending.answer && saved.state.render_pending.answer.kept === true, "what the run answered is written beside the row");
  /* the object restarts: the run and the table are gone, the session and the row are not; a renderer that would be asked again fails the test */
  const fresh = await import("../../../src/acquisition/index.mjs?restart=r117a");
  w.store.env.RENDERER = { fetch: async () => { throw new Error("rendered again"); } };
  const net = network({ [PG]: () => page(SHELL) });
  const delivered = [];
  let out;
  // fixtures-contract: control-plane deliver-owed
  try { out = await fresh.owedRun(w.store, L.entries.get(sid), { deliver: async (d) => { delivered.push(d); return { ok: true }; } }); }
  finally { net.restore(); }
  assert.deepEqual([out.ok, out.done], [true, true]);
  assert.equal(delivered.length, 1, "delivered once");
  assert.equal(delivered[0].answer.document.capture.method, "rendered");
  assert.equal(delivered[0].answer.document.capture.sha256, sha(RENDERED_PAGE));
  assert.equal(g.calls.length, 1, "one render in all");
  assert.equal(w.store.state.sessions.has(sid), false, "dropped once delivered");
});

test("R117 control: the object restarts before the render returned: the row still stands and the render is begun afresh (R99), delivered once", async () => {
  const PG = "https://r.example/r117-before";
  const g = gated();
  const w = world({ env: { RENDERER: g.RENDERER } });
  // fixtures-contract: plane owed-ledger
  const L = ledger(); w.store.owedLater = L.owedLater;
  const first = await run(w, { [PG]: () => page(SHELL) }, { locator: PG, render: true }, { renderWaitMs: 20 });
  const sid = first.body.document.render_pending.session;
  assert.equal(w.store.state.sessions.get(sid).state.render_pending.answer, undefined, "the render has not returned: nothing is written");
  const fresh = await import("../../../src/acquisition/index.mjs?restart=r117b");
  const again = gated(); again.open();
  w.store.env.RENDERER = again.RENDERER;
  const net = network({ [PG]: () => page(SHELL) });
  const delivered = [];
  // fixtures-contract: control-plane deliver-owed
  try { await fresh.owedRun(w.store, L.entries.get(sid), { deliver: async (d) => { delivered.push(d); return { ok: true }; } }); }
  finally { net.restore(); }
  assert.equal(delivered.length, 1);
  assert.equal(delivered[0].answer.document.capture.sha256, sha(RENDERED_PAGE));
  assert.equal(again.calls.length, 1, "rendered afresh, once");
});

test("R117 control: a render that ends within the bound leaves no row and no session", async () => {
  const PG = "https://r.example/r117-quick";
  const g = gated(); g.open();
  const w = world({ env: { RENDERER: g.RENDERER } });
  // fixtures-contract: plane owed-ledger
  const L = ledger(); w.store.owedLater = L.owedLater;
  const r = await run(w, { [PG]: () => page(SHELL) }, { locator: PG, render: true }, { renderWaitMs: 2000 });
  assert.equal(r.body.ok, true);
  assert.equal(r.body.document.render_pending, undefined);
  assert.deepEqual(L.log, [], "no row");
  assert.equal(w.store.state.sessions.size, 0, "no session");
});

test("R117: a failed render's answer is written beside the row too, and the restarted object ends the entry final on it without rendering again", async () => {
  const PG = "https://r.example/r117-failed";
  let open; const gate = new Promise((r) => (open = r)); let calls = 0;
  const w = world({ env: { RENDERER: { fetch: async () => { calls++; await gate; return new Response(JSON.stringify({ ok: false, error: "the page crashed", failure_class: "permanent" })); } } } });
  // fixtures-contract: plane owed-ledger
  const L = ledger(); w.store.owedLater = L.owedLater;
  const first = await run(w, { [PG]: () => page(SHELL) }, { locator: PG, render: true }, { renderWaitMs: 20 });
  const sid = first.body.document.render_pending.session;
  open(); await sleep(60);
  assert.equal(w.store.state.sessions.get(sid).state.render_pending.answer.ok, false);
  const fresh = await import("../../../src/acquisition/index.mjs?restart=r117c");
  const net = network({ [PG]: () => page(SHELL) });
  let out;
  // fixtures-contract: control-plane deliver-owed
  try { out = await fresh.owedRun(w.store, L.entries.get(sid), { deliver: async () => ({ ok: true }) }); }
  finally { net.restore(); }
  assert.deepEqual([out.ok, out.done, out.final, out.reason], [true, true, true, "RENDER_FAILED"]);
  assert.equal(calls, 1, "not rendered again");
  assert.equal(w.store.state.sessions.has(sid), false);
});
