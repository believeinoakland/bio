/* acquisition R111 (T51 fix round 8, G105; K4817; amends R105): A DELIVERY REFUSED FOR GOOD ENDS IN WORDS. `owedFetch` (and the two render-delivery
   paths of `owedRun`) turned every refused delivery into `{done: false, reason: "DELIVERY_REFUSED"}`, so the bytes a member pressed an address for,
   already held by a document she cannot see (`CAPTURE_HELD_BY_ANOTHER_BUNDLE`), were delivered again and again with the ledger's back-off, the reason
   dropped and nothing said. A refusal with a code no later try changes ends the entry final with that code, which the session states in
   `fetch_pending.failed`; a transient refusal still goes again. The three sites are `owedFetch`, `owedRun`'s `render_done` delivery and its
   `render_pending` delivery. Failing first: `{done: false, reason: "DELIVERY_REFUSED"}` at each.
   The parked session is the member's own press (the real `acquire`), the document is the one the real alarm run made. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, run, network, HTML, page } from "./fixture.mjs";
import { acquire, owedFetch, owedRun, openCaptures, DELIVERY_FINAL } from "../../../src/acquisition/index.mjs";

const MIB = 1024 * 1024;
const BIG = "https://www.oaklandca.gov/files/BIG.pdf";
const bytes = (() => { const b = new Uint8Array(9 * MIB); for (let i = 0; i < b.length; i += 4096) b.fill((i / 4096) % 251, i, Math.min(b.length, i + 4096)); return b; })();
const source = () => new Response(bytes, { headers: { "content-type": "application/pdf", "content-length": String(bytes.length) } });
const HELD = "CAPTURE_HELD_BY_ANOTHER_BUNDLE";

async function parked() {
  const w = world();
  // fixtures-contract: plane owed-ledger
  w.store.owedLater = async () => ({ ok: true });
  const first = await run(w, { [BIG]: source }, { locator: BIG, project: "PROJ-1" }, { settle: false });
  assert.equal(first.status, 200);
  return { w, session: first.body.fetch_pending.session };
}
const alarm = async (w, session, refusal) => {
  const net = network({ [BIG]: source });
  let delivered = 0;
  try {
    // fixtures-contract: control-plane deliver-owed
    const out = await owedFetch(w.store, { kind: "fetch", session }, { storeName: "bio", deliver: async () => { delivered++; return refusal; } });
    return { out, delivered, fetched: net.seen.length };
  } finally { net.restore(); }
};

test("R111 (G105) site 1, owedFetch: a delivery refused CAPTURE_HELD_BY_ANOTHER_BUNDLE ends the entry final with that code, which the session states in `fetch_pending.failed`, and the listing carries", async () => {
  const { w, session } = await parked();
  const a = await alarm(w, session, { ok: false, reason: HELD });
  assert.deepEqual([a.out.ok, a.out.done, a.out.final, a.out.reason], [true, true, true, HELD]);
  assert.equal(a.fetched, 1, "the bytes were fetched once");
  const ld = w.store.loadCaptureSession({ session });
  assert.equal(ld.found, true, "the session stays, stating the end, for the member to read");
  assert.equal(ld.state.fetch_pending.failed, HELD);
  assert.equal(ld.state.opened_by, "m1");
  const listed = openCaptures(w.store, { by: "member:m1" }).captures;
  assert.equal(listed.length, 1);
  assert.equal(listed[0].fetch_pending.failed, HELD, "the screen's watch reads the code from the listing");
  assert.equal(listed[0].fetch_pending.delivering, undefined, "a session that ended is not still delivering");
  /* the entry is final: a run that comes anyway ends again at once, fetches nothing and delivers nothing */
  const again = await alarm(w, session, { ok: true });
  assert.deepEqual([again.out.done, again.out.final, again.out.reason], [true, true, HELD]);
  assert.equal(again.delivered, 0);
  assert.equal(again.fetched, 0);
});

test("R111 (G105) site 1, owedFetch: `code` carries the refusal as well as `reason`; every code of the exported set ends final, and `DELIVERY_FAILED`, an unnamed refusal and a throw-away `{ok: false}` go again (with the reason they gave)", async () => {
  assert.ok(Array.isArray(DELIVERY_FINAL) && DELIVERY_FINAL.includes(HELD), "the set is exported and names the held-elsewhere refusal");
  assert.ok(!DELIVERY_FINAL.includes("DELIVERY_FAILED") && !DELIVERY_FINAL.includes("DELIVERY_REFUSED"));
  for (const code of DELIVERY_FINAL) {
    const { w, session } = await parked();
    const a = await alarm(w, session, { ok: false, code });
    assert.deepEqual([a.out.done, a.out.final, a.out.reason], [true, true, code], code);
    assert.equal(w.store.loadCaptureSession({ session }).state.fetch_pending.failed, code);
  }
  for (const [refusal, why] of [[{ ok: false, reason: "DELIVERY_FAILED" }, "DELIVERY_FAILED"], [{ ok: false }, "DELIVERY_REFUSED"], [null, "DELIVERY_REFUSED"],
                                [{ ok: false, reason: "NO_SUCH_SESSION" }, "NO_SUCH_SESSION"]]) {
    const { w, session } = await parked();
    const a = await alarm(w, session, refusal);
    assert.deepEqual([a.out.ok, a.out.done, a.out.final === true, a.out.reason], [true, false, false, why], JSON.stringify(refusal));
    const ld = w.store.loadCaptureSession({ session });
    assert.equal(ld.found, true);
    assert.equal(ld.state.fetch_pending.failed, undefined, "a transient refusal states no end");
    /* tried again: delivered without fetching the body a second time */
    const b = await alarm(w, session, { ok: true });
    assert.deepEqual([b.out.ok, b.out.done], [true, true]);
    assert.equal(b.fetched, 0, "the made document is delivered; the body is not fetched twice");
    assert.equal(w.store.state.sessions.has(session), false);
  }
});

test("R111 (G105) control: a delivery that is accepted drops the session and ends the entry done, as before", async () => {
  const { w, session } = await parked();
  const a = await alarm(w, session, { ok: true });
  assert.deepEqual([a.out.ok, a.out.done, a.out.final], [true, true, undefined]);
  assert.equal(w.store.state.sessions.has(session), false);
});

/* the two render-delivery paths: a visitor copy owed to the record, finished by a member's "Finish it" (render_done) and one the alarm finishes (render_pending) */
const SHELL = HTML("<div id=app></div>");
const RENDERED = HTML("<p>rendered</p>");
const PG = "https://r.example/pending";
const R_ANSWER = (url) => ({ ok: true, html: RENDERED, elapsed_ms: 12, engine: "Chrome", engine_version: "1", viewport: { width: 1280, height: 800 },
  dpr: 1, locale: "en-US", timezone: "UTC", navigated_to: url, status: 200, requests: [], scripts: [], wait: { asked: { until: "networkidle", timeout_ms: 15000 }, fired: "networkidle" } });
function pending() {
  let open; const gate = new Promise((r) => (open = r));
  const w = world({ env: { RENDERER: { fetch: async (u, init) => { await gate; return new Response(JSON.stringify(R_ANSWER(JSON.parse(init.body).url))); } } } });
  const entries = new Map();
  // fixtures-contract: plane owed-ledger
  w.store.owedLater = async (e) => { entries.set(e.session, e); return { ok: true }; };
  return { w, entries, open };
}
const begin = async (p) => {
  const first = await run(p.w, { [PG]: () => page(SHELL) }, { locator: PG, render: true }, { renderWaitMs: 20 });
  return first.body.document.render_pending.session;
};

test("R111 (G105) site 2, owedRun's render_done delivery: held-elsewhere ends final with the code and the session goes; a transient refusal keeps the copy owed", async () => {
  const p = pending();
  const sid = await begin(p);
  p.open();
  await new Promise((r) => setTimeout(r, 50));
  const net = network({ [PG]: () => page(SHELL) });
  try { const done = await acquire(p.w.store, { continue: sid }, { cls: "member", member: true, sessMember: "m1", storeName: "bio" }); assert.equal(done.body.document.capture.method, "rendered"); }
  finally { net.restore(); }
  // fixtures-contract: control-plane deliver-owed
  const transient = await owedRun(p.w.store, p.entries.get(sid), { deliver: async () => ({ ok: false, reason: "DELIVERY_FAILED" }) });
  assert.deepEqual([transient.ok, transient.done, transient.reason], [true, false, "DELIVERY_FAILED"]);
  assert.ok(p.w.store.state.sessions.has(sid), "a transient refusal keeps the copy owed");
  // fixtures-contract: control-plane deliver-owed
  const final = await owedRun(p.w.store, p.entries.get(sid), { deliver: async () => ({ ok: false, reason: HELD }) });
  assert.deepEqual([final.ok, final.done, final.final, final.reason], [true, true, true, HELD]);
  assert.equal(p.w.store.state.sessions.has(sid), false, "the copy that can never be filed is no longer owed");
});

test("R111 (G105) site 3, owedRun's render_pending delivery: held-elsewhere ends final with the code and the session goes; a transient refusal keeps it", async () => {
  const p = pending();
  const sid = await begin(p);
  p.open();
  await new Promise((r) => setTimeout(r, 50));
  const net = network({ [PG]: () => page(SHELL) });
  try {
    // fixtures-contract: control-plane deliver-owed
    const transient = await owedRun(p.w.store, p.entries.get(sid), { deliver: async () => ({ ok: false, reason: "DELIVERY_FAILED" }) });
    assert.deepEqual([transient.ok, transient.done, transient.reason], [true, false, "DELIVERY_FAILED"]);
    assert.ok(p.w.store.state.sessions.has(sid), "a transient refusal keeps the render owed");
  } finally { net.restore(); }
  const net2 = network({ [PG]: () => page(SHELL) });
  try {
    // fixtures-contract: control-plane deliver-owed
    const final = await owedRun(p.w.store, p.entries.get(sid), { deliver: async () => ({ ok: false, reason: HELD }) });
    assert.deepEqual([final.ok, final.done, final.final, final.reason], [true, true, true, HELD]);
    assert.equal(p.w.store.state.sessions.has(sid), false);
  } finally { net2.restore(); }
});
