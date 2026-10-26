/* acquisition R5, R96, R20 (T51 fix round 7, G79): THE PRODUCT'S OWN SHARE OF A SLOW CAPTURE. The walk's web captures missed the 15 s bar by the product (dena
   16.8 s, Wikipedia 15.2 s) because the render was waited a fixed 10 s after the fetch whatever the fetch had already used; an upload's keep read every part
   back and re-hashed it (`keepWhole` with no buffers) and a large keep was awaited to the door's bound. Provider side, tested here:
   (a) the render waits what is left of the 15 s bar less the room promotion needs, never more than `RENDER_WAIT_MS`;
   (b) `keepWhole` with no buffers and `compose: true` asks the store to make the whole from the parts it holds (`putFromParts`), reads no part back and puts no whole itself (without `compose` it reads them back, as before);
   (c) `keepPast` with `defer` hands the keep to the ledger at once (the alarm finishes it) and awaits it only when no ledger took it.
   Failing first: the render waited its fixed 10 s; `keepWhole` read every part back; `keepPast` always awaited. The consumers (capture's upload) are tested in their own module. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { world, run, HTML, page } from "./fixture.mjs";
import { keepWhole, keepPast, renderWaitFor, ACQUIRE_BAR_MS, PROMOTE_RESERVE_MS, RENDER_WAIT_MS } from "../../../src/acquisition/index.mjs";

const sha = (b) => createHash("sha256").update(b).digest("hex");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SHELL = HTML("<div id=app></div>");
const PG = "https://slow.example/page";
const R_ANSWER = (url) => ({ ok: true, html: HTML("<p>rendered</p>"), elapsed_ms: 12, engine: "Chrome", engine_version: "1", viewport: { width: 1280, height: 800 },
  dpr: 1, locale: "en-US", timezone: "UTC", navigated_to: url, status: 200, requests: [], scripts: [], wait: { asked: { until: "networkidle", timeout_ms: 15000 }, fired: "networkidle" } });

test("R5 (G79): the render waits what is left of the 15 s bar less the room promotion needs, and never more than RENDER_WAIT_MS", () => {
  assert.equal(ACQUIRE_BAR_MS, 15000);
  assert.ok(PROMOTE_RESERVE_MS >= 3400, "promotion took 3.4 s in the walk (acadia): the room left for it covers that");
  assert.equal(RENDER_WAIT_MS, 10000);
  assert.equal(renderWaitFor(0), RENDER_WAIT_MS, "a quick page waits the render as before");
  assert.equal(renderWaitFor(1000), RENDER_WAIT_MS);
  assert.equal(renderWaitFor(6000), ACQUIRE_BAR_MS - PROMOTE_RESERVE_MS - 6000, "a fetch of 6 s leaves what the bar leaves");
  assert.equal(renderWaitFor(ACQUIRE_BAR_MS), 0, "a fetch that used the bar waits for no render");
  assert.equal(renderWaitFor(ACQUIRE_BAR_MS * 3), 0, "never negative");
  assert.equal(renderWaitFor(Number.NaN), RENDER_WAIT_MS, "an unreadable clock waits the render as before");
  assert.equal(renderWaitFor(2000, { barMs: 1500, reserveMs: 350 }), 0, "a caller's own bar and room");
  assert.equal(renderWaitFor(600, { barMs: 1500, reserveMs: 350 }), 550);
});

test("R5 (G79): a fetch of 600 ms and a render that never ends: `acquire` answers inside the bar less the room, the page filed as served and the render pending", async () => {
  let open; const gate = new Promise((r) => (open = r));
  const w = world({ env: { RENDERER: { fetch: async () => { await gate; return new Response(JSON.stringify({ ok: false, error: "never in time" })); } } } });
  const BAR = 1500, ROOM = 350, FETCH = 600;
  const started = Date.now();
  const r = await run(w, { [PG]: async () => { await sleep(FETCH); return page(SHELL); } }, { locator: PG, render: true },
                      { acquireBarMs: BAR, promoteReserveMs: ROOM, settle: false });
  const wall = Date.now() - started;
  try {
    assert.equal(r.status, 200);
    assert.ok(r.body.document.render_pending, "the render is pending, the page filed as served");
    assert.equal(r.body.render.state, "pending");
    assert.ok(wall >= FETCH, `the fetch was waited (${wall} ms)`);
    assert.ok(wall <= BAR - ROOM + 200, `answered inside the bar less the room: ${wall} ms of ${BAR - ROOM} ms`);
    assert.ok(r.body.timings.stages.render <= BAR - ROOM - FETCH + 200, `the render was waited what was left: ${r.body.timings.stages.render} ms`);
  } finally { open(); await r.settled(); }
});

test("R5 (G79) control: a quick page whose render ends inside the wait files the pair, as before", async () => {
  const w = world({ env: { RENDERER: { fetch: async (u, init) => { await sleep(150); return new Response(JSON.stringify(R_ANSWER(JSON.parse(init.body).url))); } } } });
  const r = await run(w, { [PG]: () => page(SHELL) }, { locator: PG, render: true }, { acquireBarMs: 1500, promoteReserveMs: 350 });
  assert.equal(r.status, 200);
  assert.equal(r.body.document.capture.method.startsWith("rendered") || r.body.document.pair?.primary === "rendered", true, "the rendered document is the primary");
  assert.equal(r.body.document.render_pending, undefined);
});

/* ---- the keep ---- */

/* a bucket that offers R2's multipart upload, so record-core's own `putFromParts` runs over it */
function multipart(b) {
  b.createMultipartUpload = async (k) => {
    const ps = []; b.calls.push(["createMultipartUpload", k]);
    return {
      uploadPart: async (n, bytes) => { ps[n - 1] = new Uint8Array(bytes); b.calls.push(["uploadPart", k, n]); return { partNumber: n, etag: `e${n}` }; },
      complete: async () => { const out = new Uint8Array(ps.reduce((a, x) => a + x.length, 0)); let at = 0; for (const x of ps) { out.set(x, at); at += x.length; } b.held.set(k, out); b.calls.push(["complete", k]); return { key: k }; },
      abort: async () => { b.calls.push(["abort", k]); },
    };
  };
  return b;
}
/* the evidence store as acquisition reaches it, every call counted */
function counted(inner, { parts = true } = {}) {
  const calls = { head: 0, get: 0, put: 0, putFromParts: 0 };
  const ev = {
    calls,
    head: (d, ...a) => { calls.head++; return inner.head(d, ...a); },
    get: (d, ...a) => { calls.get++; return inner.get(d, ...a); },
    put: (d, ...a) => { calls.put++; return inner.put(d, ...a); },
  };
  if (parts) ev.putFromParts = (...a) => { calls.putFromParts++; return inner.putFromParts(...a); };
  return ev;
}
async function threeParts(w) {
  const chunks = [0, 1, 2].map((i) => new Uint8Array(1000).map((_, j) => (i * 31 + j * 7) % 251));
  const ev = w.core.evidenceStore();
  const parts = [];
  for (const c of chunks) { await ev.put(sha(c), c); parts.push({ sha256: sha(c), bytes: c.length }); }
  const whole = new Uint8Array(3000); chunks.forEach((c, i) => whole.set(c, i * 1000));
  return { parts, whole, wholeSha: sha(whole), total: 3000 };
}

test("R96 (G79): `keepWhole` with no buffers and `compose` asks the store to make the whole from its parts: no part is read back, no whole is put by this module, and the whole is the document's own bytes", async () => {
  const w = world(); multipart(w.b);
  const m = await threeParts(w);
  const ev = counted(w.core.evidenceStore());
  const r = await keepWhole(ev, { sha: m.wholeSha, parts: m.parts, total: m.total, compose: true });
  assert.deepEqual([r.ok, r.kept], [true, true]);
  assert.equal(ev.calls.putFromParts, 1, "the store makes the whole");
  assert.equal(ev.calls.get, 0, "no part is read back by this module");
  assert.equal(ev.calls.put, 0, "no whole is put by this module");
  assert.deepEqual(w.bytesOf(m.wholeSha), m.whole, "the whole is held under the document's digest, byte for byte");
});

test("R96 (G79) control: without `compose` (or with a store that cannot) the parts are read back as before; with the buffers in hand the whole is put once, none read back", async () => {
  const w = world(); multipart(w.b);
  const m = await threeParts(w);
  const ev = counted(w.core.evidenceStore());
  const r = await keepWhole(ev, { sha: m.wholeSha, parts: m.parts, total: m.total });
  assert.deepEqual([r.ok, r.kept], [true, true]);
  assert.deepEqual([ev.calls.get, ev.calls.put, ev.calls.putFromParts], [3, 1, 0], "no `compose` asked: each part is read back, the whole put, the store asked nothing");
  assert.deepEqual(w.bytesOf(m.wholeSha), m.whole);
  const w1 = world();
  const m1 = await threeParts(w1);
  const ev1 = counted(w1.core.evidenceStore(), { parts: false });
  const r1 = await keepWhole(ev1, { sha: m1.wholeSha, parts: m1.parts, total: m1.total, compose: true });
  assert.deepEqual([r1.ok, r1.kept], [true, true]);
  assert.deepEqual([ev1.calls.get, ev1.calls.put], [3, 1], "a store with no way to compose is read back");
  const w2 = world(); multipart(w2.b);
  const m2 = await threeParts(w2);
  const ev2 = counted(w2.core.evidenceStore());
  const held = [0, 1, 2].map((i) => m2.whole.slice(i * 1000, (i + 1) * 1000));
  const r2 = await keepWhole(ev2, { sha: m2.wholeSha, parts: m2.parts, total: m2.total, bytes: held });
  assert.deepEqual([r2.ok, r2.kept], [true, true]);
  assert.deepEqual([ev2.calls.get, ev2.calls.put, ev2.calls.putFromParts], [0, 1, 0], "buffers in hand: one put of the whole, nothing read, nothing composed");
});

test("R96 (G79): a store that would not compose the whole (no multipart upload to offer) is read back as before, and the document is kept", async () => {
  const w = world();   // its bucket offers no multipart upload: `putFromParts` refuses
  const m = await threeParts(w);
  const ev = counted(w.core.evidenceStore());
  const r = await keepWhole(ev, { sha: m.wholeSha, parts: m.parts, total: m.total, compose: true });
  assert.deepEqual([r.ok, r.kept], [true, true]);
  assert.equal(ev.calls.putFromParts, 1, "composing was asked first");
  assert.equal(ev.calls.get, 3, "then each part was read back");
  assert.deepEqual(w.bytesOf(m.wholeSha), m.whole);
});

test("R96 (G79): a store that cannot compose the whole (a part not held) refuses in words and keeps nothing", async () => {
  const w = world(); multipart(w.b);
  const m = await threeParts(w);
  w.b.held.delete(`bio/captures/${m.parts[1].sha256}`);
  const ev = counted(w.core.evidenceStore());
  const r = await keepWhole(ev, { sha: m.wholeSha, parts: m.parts, total: m.total, compose: true });
  assert.equal(r.ok, false);
  assert.equal(typeof r.why, "string");
  assert.ok(r.why.length > 0);
  assert.equal(w.held(m.wholeSha), false, "nothing is kept");
});

test("R96, R100 (G79): `keepPast` with `defer` hands the keep to the ledger at once and does not start it; with no ledger to take it, the keep is awaited as before", async () => {
  const w = world(); multipart(w.b);
  const m = await threeParts(w);
  const ev = counted(w.core.evidenceStore());
  const handed = [];
  // fixtures-contract: plane keep-later
  const k = await keepPast(w.store, ev, { sha: m.wholeSha, parts: m.parts, defer: true, keepLater: async (e) => { handed.push(e); return { ok: true }; } });
  assert.deepEqual([k.started, k.kept, k.keep_pending], [true, false, true]);
  assert.deepEqual(handed, [{ sha: m.wholeSha, parts: m.parts.map((p) => p.sha256) }]);
  assert.equal(ev.calls.putFromParts, 0, "the answer does not wait for the keep, and does not start it: the ledger's alarm does");
  assert.equal(w.held(m.wholeSha), false);
  /* a ledger that refuses the entry: the keep is made here, awaited */
  const k2 = await keepPast(w.store, ev, { sha: m.wholeSha, parts: m.parts, defer: true, keepLater: async () => ({ ok: false }) });
  assert.deepEqual([k2.started, k2.kept, k2.keep_pending], [true, true, false]);
  assert.deepEqual(w.bytesOf(m.wholeSha), m.whole);
  /* no ledger at all */
  const w3 = world(); multipart(w3.b);
  const m3 = await threeParts(w3);
  const k3 = await keepPast(w3.store, counted(w3.core.evidenceStore()), { sha: m3.wholeSha, parts: m3.parts, defer: true });
  assert.deepEqual([k3.started, k3.kept], [true, true]);
  assert.deepEqual(w3.bytesOf(m3.wholeSha), m3.whole);
});

test("R96 (G79) control: `keepPast` without `defer` awaits within the bound as before, and hands the keep over only when it did not end in time", async () => {
  const w = world(); multipart(w.b);
  const m = await threeParts(w);
  const handed = [];
  // fixtures-contract: plane keep-later
  const k = await keepPast(w.store, counted(w.core.evidenceStore()), { sha: m.wholeSha, parts: m.parts, keepLater: async (e) => { handed.push(e); return { ok: true }; } });
  assert.deepEqual([k.started, k.kept, k.keep_pending], [true, true, false]);
  assert.deepEqual(handed, []);
});
