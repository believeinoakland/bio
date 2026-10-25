/* acquisition, T51 fix round 6 (G27 the deferred render's reply is not kept in memory; G32 a held file is not downloaded again), at the
   module's interface, `acquire(store, body, opts)`, over a scripted network, a gated renderer, an evidence bucket and the store handed in
   (fixture.mjs). R5 and R12: the render begun by an `acquire` that did not wait for it is kept in the record the moment it returns, the
   reply dropped, and "Finish it" files the very pair a render waited for would have. R22: a held capture's digest handed in as `opts.heldSha`
   makes the fetch conditional for any caller, and a source that says nothing changed is not read. Each test has its control. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { world, run, sha, network, HTML, page } from "./fixture.mjs";
import { acquire } from "../../../src/acquisition/index.mjs";

const SHELL = HTML("<div id=app></div>");
const RENDERED = HTML("<p>rendered by a browser</p>");
const PG = "https://r.example/page";
const member = { cls: "member", member: true, sessMember: "m1", storeName: "bio" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* the renderer's reply, with a script, a stylesheet and an image the page loaded, their bodies in the two forms the renderer sends */
const CSS = "body{color:#123}";
const PNG = Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10, 1, 2, 3, 4]);
const reply = (url) => ({ ok: true, html: RENDERED, elapsed_ms: 12, engine: "Chrome", engine_version: "1", viewport: { width: 1280, height: 800 },
  dpr: 1, locale: "en-US", timezone: "UTC", navigated_to: url, status: 200,
  requests: [
    { url: "https://r.example/app.css", type: "stylesheet", outcome: "completed", body_text: CSS },
    { url: "https://r.example/logo.png", type: "image", outcome: "completed", body_base64: Buffer.from(PNG).toString("base64") },
    { url: "https://r.example/gone.js", type: "script", outcome: "failed" },
  ],
  scripts: [], wait: { asked: { until: "networkidle", timeout_ms: 15000 }, fired: "networkidle" } });

/* a renderer that answers when its gate is opened, and counts its calls; `ledger` stands for the plane's owed-work ledger */
function gated({ open = false } = {}) {
  let release; const gate = open ? Promise.resolve() : new Promise((r) => (release = r));
  const calls = [];
  const w = world({ env: { RENDERER: { fetch: async (u, init) => { const q = JSON.parse(init.body); calls.push(q); await gate;
    return new Response(JSON.stringify(reply(q.url))); } } } });
  // fixtures-contract: plane owed-ledger
  w.store.owedLater = async () => ({ ok: true });
  return { w, calls, release: release || (() => {}) };
}
const begin = (g, waitMs) => run(g.w, { [PG]: () => page(SHELL) }, { locator: PG, render: true }, { renderWaitMs: waitMs });
const settleSpend = async (g) => { for (let i = 0; i < 300 && !g.w.store.state.spends.length; i++) await sleep(10); await sleep(100); };
const finish = async (g, sid) => {
  const net = network({ [PG]: () => page(SHELL) });
  try { return await acquire(g.w.store, { continue: sid }, member); } finally { net.restore(); }
};
const facts = (d) => ({ sha: d.capture.sha256, bytes: d.capture.bytes, method: d.capture.method, pair: d.pair, shell: d.shell && d.shell.sha256,
  requests: d.render.requests, subresources: d.render.subresources, data: d.render.data });

test("R109 R5 R12 (G27): a render that returns after the request has ended is kept in the record at once, the reply dropped: its page and each body are held before anyone finishes it, and \"Finish it\" files the pair a waited render files, from one render, one charge", async () => {
  /* the control: the same render waited for */
  const waited = gated({ open: true });
  const w1 = await begin(waited, 5000);
  assert.equal(w1.status, 200);
  assert.equal(w1.body.document.capture.method, "rendered", "waited for, the page is the render");
  /* the walker's case: the wait is over before the render returns */
  const g = gated();
  const first = await begin(g, 20);
  assert.equal(first.status, 200);
  assert.equal(first.body.render.state, "pending");
  const sid = first.body.render.session;
  assert.equal(g.w.held(sha(RENDERED)), false, "while it runs nothing of it is held");
  g.release();
  await settleSpend(g);
  /* the reply has come back and nobody has asked for it: it is in the record, not in the object's memory */
  assert.equal(g.w.held(sha(RENDERED)), true, "the rendered page is held as soon as the render returns");
  assert.equal(g.w.held(sha(CSS)), true, "the text body it loaded is held");
  assert.equal(g.w.held(sha(PNG)), true, "the binary body it loaded is held");
  const done = await finish(g, sid);
  assert.equal(done.status, 200);
  assert.equal(done.body.document.capture.method, "rendered");
  assert.deepEqual(facts(done.body.document), facts(w1.body.document), "the pair is the one a waited render files");
  assert.equal(g.calls.length, 1, "one render was made");
  assert.equal(g.w.store.state.spends.length, 1, "and one was charged");
  assert.equal(g.w.store.state.sessions.has(sid) && !g.w.store.state.sessions.get(sid).state.render_done, false, "the session no longer owes the render");
  assert.equal(done.body.existed, false, "the rendered page was not held before this render filed it");
  /* the same press again changes nothing */
  const again = await finish(g, sid);
  assert.equal(again.status, 200);
  assert.equal(g.calls.length, 1);
});

test("R109 R5 R12 (G27) control: a render that fails, or answers with no page, is a small answer that is not kept, and \"Finish it\" says so in words and closes the session, as before", async () => {
  let release; const gate = new Promise((r) => (release = r));
  const w = world({ env: { RENDERER: { fetch: async () => { await gate; return new Response(JSON.stringify({ ok: false, error: "navigation timed out" })); } } } });
  // fixtures-contract: plane owed-ledger
  w.store.owedLater = async () => ({ ok: true });
  const first = await run(w, { [PG]: () => page(SHELL) }, { locator: PG, render: true }, { renderWaitMs: 20 });
  const sid = first.body.render.session;
  release();
  for (let i = 0; i < 300 && !w.store.state.spends.length; i++) await sleep(10);
  await sleep(100);
  const net = network({ [PG]: () => page(SHELL) });
  let done;
  try { done = await acquire(w.store, { continue: sid }, member); } finally { net.restore(); }
  assert.equal(done.status, 502);
  assert.equal(done.body.reason, "RENDER_FAILED");
  assert.equal(w.store.state.sessions.has(sid), false);
});

test("R109 R5 R12 (G27): when the record will not take the render's pieces, the reply is not lost: it stays as it was and \"Finish it\" files the pair once the record can", async () => {
  const waited = gated({ open: true });
  const w1 = await begin(waited, 5000);
  const g = gated();
  const first = await begin(g, 20);
  const sid = first.body.render.session;
  g.w.b.failPut = true;
  g.release();
  await settleSpend(g);
  g.w.b.failPut = false;
  const done = await finish(g, sid);
  assert.equal(done.status, 200);
  assert.deepEqual(facts(done.body.document), facts(w1.body.document));
  assert.equal(g.calls.length, 1, "it was not rendered a second time");
});

test("R109 R5 R99 (G27): a kept render whose page the record no longer holds is treated as a render the object lost: \"Finish it\" renders again, once, and files the pair", async () => {
  const g = gated();
  const first = await begin(g, 20);
  const sid = first.body.render.session;
  g.release();
  await settleSpend(g);
  assert.equal(g.w.held(sha(RENDERED)), true);
  g.w.b.held.delete(`bio/captures/${sha(RENDERED)}`);
  const done = await finish(g, sid);
  assert.equal(done.status, 200);
  assert.equal(done.body.document.capture.method, "rendered");
  assert.equal(done.body.document.capture.sha256, sha(RENDERED));
  assert.equal(g.calls.length, 2, "rendered again, because the first could not be read back");
});

test("R109 R5 (G27): the renderer's reply is not resident after the request that did not wait for it has ended: a 42 MiB reply, six bodies, leaves the object's heap where it was (a child with --expose-gc, the heap measured after collection)", () => {
  const child = fileURLToPath(new URL("./g27-memory-child.mjs", import.meta.url));
  const r = spawnSync(process.execPath, ["--expose-gc", child], { encoding: "utf8", timeout: 120000 });
  assert.equal(r.status, 0, r.stderr);
  const out = JSON.parse(r.stdout.trim().split("\n").pop());
  assert.equal(out.finished, true, "the pair was filed from the kept render");
  assert.ok(out.bodiesHeld >= 6, `the bodies are in the record (${out.bodiesHeld})`);
  assert.ok(out.heldMiB < 12, `the reply is not held in memory: heap ${out.heldMiB.toFixed(1)} MiB above where it began`);
});

/* ---------------------------------------------------------------------------------------------------------------------------- *
 * G32 · R22: a held file is not downloaded again (A-14: the second press of a 15.9 MB file pulled it all again)
 * ---------------------------------------------------------------------------------------------------------------------------- */
const FILE = "https://files.example/big.pdf";
const BIG = new Uint8Array(3 * 1024 * 1024).fill(9);
const ETAG = "\"v1\"";
/* an upstream that serves the file with an ETag, answers 304 to a matching If-None-Match, and counts the bytes pulled from it */
function upstream({ etag = ETAG } = {}) {
  const log = { pulled: 0, requests: [] };
  const route = (u, init) => {
    const h = init && init.headers ? init.headers : {};
    log.requests.push({ url: u, headers: { ...h } });
    if (etag && h["if-none-match"] === etag) return new Response(null, { status: 304, headers: { etag } });
    let at = 0;
    const body = new ReadableStream({ pull(c) { if (at >= BIG.length) { c.close(); return; } const n = Math.min(65536, BIG.length - at); c.enqueue(BIG.subarray(at, at + n)); at += n; log.pulled += n; } });
    return new Response(body, { headers: { "content-type": "application/pdf", ...(etag ? { etag } : {}) } });
  };
  return { log, routes: { [FILE]: route } };
}

test("R22 (G32): a second `acquire` of a held file that is handed the held digest as `opts.heldSha` sends the validators it recorded and, the source saying nothing changed, pulls no body and files nothing; the first pulled it whole", async () => {
  const w = world();
  const up = upstream();
  const first = await run(w, up.routes, { locator: FILE }, {});
  assert.equal(first.status, 200, JSON.stringify(first.body).slice(0, 200));
  assert.equal(up.log.pulled, BIG.length, "the first press reads the file");
  const held = first.body.document.capture.sha256;
  const before = up.log.pulled;
  const second = await run(w, up.routes, { locator: FILE }, { heldSha: held });
  assert.equal(second.status, 200);
  assert.equal(up.log.pulled - before, 0, "the second press pulls no body");
  assert.equal(second.body.unchanged, true);
  assert.equal(second.body.existed, true);
  assert.equal(second.body.document, undefined, "nothing is filed");
  assert.deepEqual(second.body.capture, { sha256: held });
  assert.equal(up.log.requests.at(-1).headers["if-none-match"], ETAG);
  assert.equal(w.store.state.outcomes.at(-1).outcome, "success");
});

test("R22 (G32) controls: with no digest handed in, or one that is not 64 hex, the fetch is unconditional and the member gets a new copy; a digest with no recorded validators fetches unconditionally", async () => {
  const w = world();
  const up = upstream();
  const first = await run(w, up.routes, { locator: FILE });
  const held = first.body.document.capture.sha256;
  for (const [what, opts] of [["none", {}], ["short", { heldSha: "abc" }], ["not a string", { heldSha: 7 }]]) {
    const before = up.log.pulled;
    const again = await run(w, up.routes, { locator: FILE }, opts);
    assert.equal(again.status, 200, what);
    assert.equal(up.log.pulled - before, BIG.length, `${what}: the file is read again`);
    assert.equal(again.body.unchanged, undefined, what);
    assert.equal(again.body.existed, true, `${what}: the same bytes were held`);
    assert.equal(up.log.requests.at(-1).headers["if-none-match"], undefined, `${what}: no condition was sent`);
  }
  const other = await run(w, up.routes, { locator: FILE }, { heldSha: "f".repeat(64) });
  assert.equal(other.status, 200);
  assert.equal(other.body.unchanged, undefined, "validators are recorded for a capture, so a digest of another capture sends none");
  assert.equal(up.log.requests.at(-1).headers["if-none-match"], undefined);
  assert.ok(held);
});

test("R22 (G32): the condition holds for a file fetched under a credential, which rides only its own host (the drain's arm); a source whose validators changed serves the new copy in full", async () => {
  const w = world();
  const up = upstream();
  const first = await run(w, up.routes, { locator: FILE });
  const held = first.body.document.capture.sha256;
  const cred = { kind: "other", secret: "Bearer s3cr3t", credential: "c1", supplied_by: "m1", scope: "files.example", project: null };
  const before = up.log.pulled;
  const second = await run(w, up.routes, { locator: FILE }, { captureRequest: { locator: FILE, heldSha: held, credential: cred }, cls: "daemon", member: false, sessMember: null });
  assert.equal(second.body.unchanged, true);
  assert.equal(up.log.pulled - before, 0);
  const sent = up.log.requests.at(-1).headers;
  assert.equal(sent["if-none-match"], ETAG);
  assert.equal(sent.authorization, "Bearer s3cr3t");
  /* the source's copy changed: its tag no longer matches, so the whole new file is read and filed */
  const net = network({ [FILE]: () => new Response(new Uint8Array(1024).fill(3), { headers: { "content-type": "application/pdf", etag: "\"v2\"" } }) });
  try {
    const third = await acquire(w.store, { locator: FILE }, { ...member, heldSha: held });
    assert.equal(third.status, 200);
    assert.ok(third.body.document, "the changed file is filed");
    assert.notEqual(third.body.document.capture.sha256, held);
  } finally { net.restore(); }
});
