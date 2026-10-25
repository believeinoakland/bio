/* acquisition R104 (T51 fix round 5, E8): THE VISITOR COPY IS OWED UNTIL ITS DOCUMENT IS FILED. A member's "Finish it" (`acquire` with `continue`)
   that completes a pending render answers the rendered document, and that answer is the only thing that carries it to the record: when the
   caller never files it (the door's bound passed, the tab was closed), the copy was lost, because the call dropped the session. With the plane's
   ledger handed in (`owedLater`), the session now stays, owing the finished document, until `owedRun` has seen it filed or has delivered it.
   Failing first. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { world, run, network, HTML, page } from "./fixture.mjs";
import { acquire, owedRun, openCaptures, OWED_SESSION_TTL_MS } from "../../../src/acquisition/index.mjs";

const sha = (s) => createHash("sha256").update(s).digest("hex");
const SHELL = HTML("<div id=app></div>");
const RENDERED_PAGE = HTML("<p>rendered</p>");
const R_ANSWER = (url) => ({ ok: true, html: RENDERED_PAGE, elapsed_ms: 12, engine: "Chrome", engine_version: "1", viewport: { width: 1280, height: 800 },
  dpr: 1, locale: "en-US", timezone: "UTC", navigated_to: url, status: 200, requests: [], scripts: [], wait: { asked: { until: "networkidle", timeout_ms: 15000 }, fired: "networkidle" } });
const member = { cls: "member", member: true, sessMember: "m1", storeName: "bio" };
const PG = "https://r.example/pending";

/* a renderer that answers once its gate is opened, and the plane's ledger as a log */
function pending() {
  let open; const gate = new Promise((r) => (open = r));
  const registered = [];
  const w = world({ provOpts: { registered }, env: { RENDERER: { fetch: async (u, init) => { await gate; return new Response(JSON.stringify(R_ANSWER(JSON.parse(init.body).url))); } } } });
  const entries = new Map();
  // fixtures-contract: plane owed-ledger
  w.store.owedLater = async (e) => { entries.set(e.session, e); return { ok: true }; };
  return { w, entries, open, registered };
}
const begin = async (p) => {
  const first = await run(p.w, { [PG]: () => page(SHELL) }, { locator: PG, render: true }, { renderWaitMs: 20 });
  return first.body.document.render_pending.session;
};
const finish = async (p, sid) => {
  const net = network({ [PG]: () => page(SHELL) });
  try { return await acquire(p.w.store, { continue: sid }, member); } finally { net.restore(); }
};

test("R104 (E8): \"Finish it\" that completes the render leaves the session owing the visitor copy; the call whose answer is never filed is not the end of it: the alarm's run delivers the very document, and the session goes only then", async () => {
  const p = pending();
  const sid = await begin(p);
  p.open();
  await new Promise((r) => setTimeout(r, 50));
  const done = await finish(p, sid);
  assert.equal(done.status, 200);
  assert.equal(done.body.document.capture.method, "rendered", "the continue answers the visitor copy");
  assert.equal(done.body.document.capture.sha256, sha(RENDERED_PAGE));
  /* the answer is never filed (the door's bound passed, the tab closed): the session is still there, owing it, and no longer "Unfinished" */
  assert.ok(p.w.store.state.sessions.has(sid), "the session stays until the copy is filed");
  const kept = p.w.store.state.sessions.get(sid);
  assert.equal(kept.ttlMs ?? OWED_SESSION_TTL_MS, OWED_SESSION_TTL_MS);
  assert.equal(openCaptures(p.w.store, { by: "m1" }).captures.length, 0, "nothing is left for the member to finish");
  /* the alarm: the copy is not filed anywhere, so it is delivered, once, and the session is dropped once it is */
  const delivered = [];
  // fixtures-contract: control-plane deliver-owed
  const deliver = async (d) => { delivered.push(d); return { ok: true }; };
  const refused = await owedRun(p.w.store, p.entries.get(sid), { deliver: async () => ({ ok: false }) });
  assert.deepEqual([refused.ok, refused.done, refused.reason], [true, false, "DELIVERY_REFUSED"]);
  assert.ok(p.w.store.state.sessions.has(sid), "a refused delivery keeps the copy owed");
  const out = await owedRun(p.w.store, p.entries.get(sid), { deliver });
  assert.deepEqual([out.ok, out.done], [true, true]);
  assert.equal(delivered.length, 1);
  assert.equal(delivered[0].session, sid);
  assert.equal(delivered[0].answer.document.capture.sha256, sha(RENDERED_PAGE));
  assert.deepEqual(delivered[0].answer.document, done.body.document, "the document delivered is the one the continue answered");
  assert.equal(p.w.store.state.sessions.has(sid), false);
});

test("R104 (E8) control: a copy the caller did file (the register holds its digest) is not delivered again: the alarm's run only closes the session", async () => {
  const p = pending();
  const sid = await begin(p);
  p.open();
  await new Promise((r) => setTimeout(r, 50));
  const done = await finish(p, sid);
  p.registered.push(done.body.document.capture.sha256);   // the screen promoted it
  let delivered = 0;
  // fixtures-contract: control-plane deliver-owed
  const out = await owedRun(p.w.store, p.entries.get(sid), { deliver: async () => { delivered++; return { ok: true }; } });
  assert.deepEqual([out.ok, out.done], [true, true]);
  assert.equal(delivered, 0, "filed already: nothing delivered");
  assert.equal(p.w.store.state.sessions.has(sid), false);
});

test("R104 (E8) control: with no ledger handed in nothing is owed, and the continue closes the session as before", async () => {
  const p = pending();
  p.w.store.owedLater = undefined;                      // the plane's ledger is not handed in
  const first = await run(p.w, { [PG]: () => page(SHELL) }, { locator: PG, render: true }, { renderWaitMs: 20 });
  const sid = first.body.document.render_pending.session;
  assert.ok(p.w.store.state.sessions.has(sid));
  p.open();
  await new Promise((r) => setTimeout(r, 50));
  const done = await finish(p, sid);
  assert.equal(done.body.document.capture.method, "rendered");
  assert.equal(p.w.store.state.sessions.has(sid), false);
});

test("R104 (E8): a second \"Finish it\" on a session whose visitor copy is already finished and owed touches nothing: it answers the copy is owed, the session stays, and the alarm still delivers it", async () => {
  const p = pending();
  const sid = await begin(p);
  p.open();
  await new Promise((r) => setTimeout(r, 50));
  const done = await finish(p, sid);
  assert.equal(done.body.document.capture.method, "rendered");
  const again = await finish(p, sid);
  assert.equal(again.status, 200);
  assert.equal(again.body.document, undefined, "no second document is answered");
  assert.deepEqual(again.body.render, { state: "owed", session: sid });
  assert.equal(again.body.continued.session, sid);
  assert.ok(p.w.store.state.sessions.has(sid), "the session is not dropped by the second press");
  const delivered = [];
  // fixtures-contract: control-plane deliver-owed
  const out = await owedRun(p.w.store, p.entries.get(sid), { deliver: async (d) => { delivered.push(d); return { ok: true }; } });
  assert.deepEqual([out.ok, out.done], [true, true]);
  assert.equal(delivered.length, 1);
});

test("R12 (fix round 5): a continuation naming a session that is gone answers NO_SUCH_SESSION, not BAD_LOCATOR; control: with an address of its own it is captured as an ordinary capture", async () => {
  const w = world();
  const gone = await run(w, {}, { continue: "cs_gone" });
  assert.equal(gone.status, 404);
  assert.equal(gone.body.reason, "NO_SUCH_SESSION");
  const own = await run(w, { [PG]: () => page(SHELL) }, { continue: "cs_gone", locator: PG });
  assert.equal(own.status, 200);
  assert.equal(own.body.ok, true);
});
