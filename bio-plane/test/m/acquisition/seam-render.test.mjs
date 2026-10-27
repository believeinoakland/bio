/* acquisition: the SEAM tests of the visitor render (written by capture-sources #16, K4448; owned here) (fix round 4 of T51; K4429, K4431, K4448). The seam owner is the last-merged job on the path
 * press -> stored result, so these run the whole path with the REAL merged parts: acquisition's `acquire` (its own `world` and `run` fixture),
 * this module's real browser driver (`renderWithBinding` over the fake Browser Rendering binding of fake-binding.mjs, which speaks CDP) and its
 * real `keepRenderBodies`, record-core over a real SQLite database, and an evidence store that charges what the live one costs (0.27 s a call,
 * lane-performance P7). Nothing of acquisition is a double and no answer shape is written by hand: the inputs are the member's own acts through
 * the real op (`acquire` with `render`, then `acquire` with `continue`).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { world, run, network, HTML, page } from "./fixture.mjs";
import { acquire } from "../../../src/acquisition/index.mjs";
import { fakeBinding, HOST } from "../capture-sources/fake-binding.mjs";
import { renderWithBinding } from "../../../src/browserrender.mjs";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const sha = (s) => createHash("sha256").update(s).digest("hex");
const TRIP_MS = 270;
/* The evidence store as the live one behaves: every call is a round trip. */
function slowStore(w, ms = TRIP_MS) {
  for (const m of ["head", "get", "put", "delete"]) {
    const f = w.b[m].bind(w.b);
    w.b[m] = async (...a) => { await sleep(ms); return f(...a); };
  }
  return w;
}
const SHELL = HTML("<div id=app></div>");
const renderedText = (w, r) => new TextDecoder().decode(w.bytesOf(r.body.document.capture.sha256));

/* A page of `n` sub-resources, each with a body of its own. */
const pageOf = (n, over = {}) => ({
  requests: Array.from({ length: n }, (_, i) => ({ url: `https://${HOST}/s${i}.js`, type: "Script", status: 200, end: "finished", bodyText: `body ${i} `.padEnd(2000, "x") })),
  ...over });
const asked = (path) => `https://${HOST}${path}`;
const member = { cls: "member", member: true, sessMember: "m1", storeName: "bio" };

test("R8 R68 (C13a, P7): `acquire` with the visitor render of a page of 33 bodies, through the real merged acquisition and the real driver, against a store that charges 0.27 s a call: the render stage is under 6 s and the whole answer is within 15 s", async () => {
  const binding = fakeBinding({ "/zion": pageOf(33) });
  const w = slowStore(world({ env: { BROWSER: binding } }));
  const t0 = Date.now();
  const r = await run(w, { [asked("/zion")]: () => page(SHELL) }, { locator: asked("/zion"), render: true });
  const took = Date.now() - t0;
  assert.equal(r.status, 200);
  assert.equal(r.body.document.capture.method, "rendered", "the visitor copy is the primary document");
  assert.match(renderedText(w, r), /<main>Rendered \/zion<\/main>/, "and its bytes are the browser's document");
  const stages = r.body.timings.stages;
  console.log(`SEAM C13a: render stage ${stages.render} ms, whole answer ${took} ms`);
  assert.ok(stages.render < 6000, `the render stage took ${stages.render} ms (kept one at a time it is 33 x 2 trips x ${TRIP_MS} ms = ${33 * 2 * TRIP_MS} ms more)`);
  assert.ok(took < 15000, `the whole answer took ${took} ms`);
  /* every body was kept, under its own digest, in the place of its request */
  const subs = w.core && r.body.document.render ? r.body.document.render.subresources : null;
  assert.equal(subs.length, 33);
  subs.forEach((s, i) => {
    assert.equal(s.address, `https://${HOST}/s${i}.js`);
    assert.equal(s.sha256, sha(`body ${i} `.padEnd(2000, "x")), `sub-resource ${i}`);
    assert.ok(w.held(s.sha256), `sub-resource ${i} is held`);
  });
  assert.equal(binding.stats.browserCloses + binding.stats.socketCloses > 0, true);
});

test("R8 R68 (C13a, P7) control: a page of three bodies is rendered and kept as before, each held once", async () => {
  const w = slowStore(world({ env: { BROWSER: fakeBinding({ "/zion": pageOf(3) }) } }));
  const r = await run(w, { [asked("/zion")]: () => page(SHELL) }, { locator: asked("/zion"), render: true });
  assert.equal(r.body.document.capture.method, "rendered");
  assert.equal(r.body.document.render.subresources.length, 3);
  for (const s of r.body.document.render.subresources) assert.equal(w.b.calls.filter((c) => c[0] === "put" && c[1].endsWith(s.sha256)).length, 1);
});

/* ---------- C13b (fix round 4): "Finish it" when the object that began the render no longer holds it. ---------- */

/* The member's act: capture a page with the visitor render asked for, the answer coming before the render ends (the live bound
   is `renderWaitMs`), so the page as served is filed and the render is pending in a capture session. */
const begin = async (w, path, wait = 40) => {
  const r = await run(w, { [asked(path)]: () => page(SHELL) }, { locator: asked(path), render: true }, { renderWaitMs: wait });
  assert.equal(r.status, 200);
  assert.notEqual(r.body.document.capture.method, "rendered", "the page as served is the document filed first");
  const sid = r.body.document.render_pending && r.body.document.render_pending.session;
  assert.ok(sid, "the render is pending in a capture session the member finishes");
  return { sid, shell: r.body.document.capture.sha256 };
};
/* "Finish it": `acquire` with `continue`, on a module instance that is not the one which began the render when `fresh` names one. */
const finish = async (w, sid, path, { fresh = null, ...opts } = {}) => {
  const net = network({ [asked(path)]: () => page(SHELL) });
  try { return await (fresh || { acquire }).acquire(w.store, { continue: sid }, { ...member, ...opts }); }
  finally { net.restore(); }
};
const SLOW_LOAD = { loadAfterMs: 6000 };   // the page's load event comes 0.3 s of real time after the navigation

test("R99 R12 R5 R68 (C13b): a render deferred past the live bound, the object restarted (the render table is empty), then `acquire` with `continue`: the visitor copy is filed as the second document and the session is closed; control: a continuation whose render is still held by the object finishes it as before", async () => {
  /* the restart */
  const w = world({ env: { BROWSER: fakeBinding({ "/zion": pageOf(5, SLOW_LOAD) }) } });
  const { sid, shell } = await begin(w, "/zion");
  assert.ok(w.store.state.sessions.has(sid));
  const restarted = await import("../../../src/acquisition/index.mjs?restart=seam-c13b");   // a new module instance: the render table is gone
  const done = await finish(w, sid, "/zion", { fresh: restarted });
  assert.equal(done.status, 200);
  assert.notEqual(done.body.note && done.body.continued, true, "never 'already in the record, nothing new saved'");
  assert.equal(done.body.document.capture.method, "rendered", "the second document is the visitor copy");
  assert.notEqual(done.body.document.capture.sha256, shell);
  assert.match(new TextDecoder().decode(w.bytesOf(done.body.document.capture.sha256)), /<main>Rendered \/zion<\/main>/);
  assert.equal(done.body.document.render.subresources.length, 5);
  assert.equal(w.store.state.sessions.has(sid), false, "the session is closed");

  /* control: no restart, the render still held by the object that began it; the same act finishes it */
  const w2 = world({ env: { BROWSER: fakeBinding({ "/zion": pageOf(5, SLOW_LOAD) }) } });
  const c = await begin(w2, "/zion");
  await sleep(1500);
  const live = await finish(w2, c.sid, "/zion");
  assert.equal(live.status, 200);
  assert.equal(live.body.document.capture.method, "rendered");
  assert.equal(live.body.document.render.subresources.length, 5);
  assert.equal(w2.store.state.sessions.has(c.sid), false);
});

test("R99 R12 R5 R68 (C13b): the render begun afresh cannot be made (the browser refuses the navigation): \"Finish it\" is refused in words that say the page could not be rendered, and the session is closed", async () => {
  const w = world({ env: { BROWSER: fakeBinding({ "/zion": pageOf(2, SLOW_LOAD) }) } });
  const { sid } = await begin(w, "/zion");
  /* the browser can no longer render the page: its navigation is refused */
  w.store.env.BROWSER = fakeBinding({ "/zion": { navError: "net::ERR_NAME_NOT_RESOLVED" } });
  const restarted = await import("../../../src/acquisition/index.mjs?restart=seam-c13b2");
  const bad = await finish(w, sid, "/zion", { fresh: restarted });
  assert.deepEqual([bad.status, bad.body.reason], [502, "RENDER_FAILED"]);
  assert.match(bad.body.detail, /ERR_NAME_NOT_RESOLVED/, "the browser's own words");
  assert.equal(bad.body.continued, undefined);
  assert.equal(w.store.state.sessions.has(sid), false, "the session is closed");
});

/* The runtime cuts what a request began once it has answered: the render's promise then never settles (the walker's Zion). A renderer
   service that does that for the render begun with the member's first act, and renders with the REAL driver for any later one. */
const cutThenReal = (binding) => {
  const calls = [];
  return { calls, RENDERER: { fetch: async (u, init) => {
    const req = JSON.parse(init.body);
    calls.push(req.url);
    if (calls.length === 1) return new Promise(() => {});
    return new Response(JSON.stringify(await renderWithBinding(binding, req, {})));
  } } };
};

test("R99 R12 R5 R68 (C13b): the request that began the render ended and the render never came back (the table still holds it): `acquire` with `continue` after the live bound renders afresh with the real driver, files the visitor copy as the second document and closes the session; before the bound it is still pending", async () => {
  const renderer = cutThenReal(fakeBinding({ "/zion": pageOf(5) }));
  const w = world({ env: renderer });
  const { sid, shell } = await begin(w, "/zion", 20);
  const early = await finish(w, sid, "/zion", { renderWaitMs: 10, renderStaleMs: 60000 });
  assert.equal(early.body.render.state, "pending", "control: within the live bound it is pending");
  assert.ok(w.store.state.sessions.has(sid), "and the session is kept");
  await sleep(70);
  const done = await finish(w, sid, "/zion", { renderStaleMs: 50 });
  assert.equal(done.status, 200);
  assert.notEqual(done.body.note && done.body.continued, true, "never 'already in the record, nothing new saved'");
  assert.equal(done.body.document.capture.method, "rendered");
  assert.notEqual(done.body.document.capture.sha256, shell);
  assert.match(new TextDecoder().decode(w.bytesOf(done.body.document.capture.sha256)), /<main>Rendered \/zion<\/main>/);
  assert.equal(done.body.document.render.subresources.length, 5, "the real driver's bodies, kept");
  assert.equal(renderer.calls.length, 2, "the render was begun once more, not waited for again");
  assert.equal(w.store.state.sessions.has(sid), false, "the session is closed");
});
