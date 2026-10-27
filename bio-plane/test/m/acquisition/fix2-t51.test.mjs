/* acquisition, T51 fix round 2 (the walk's C5, C12, C13, C25): at the module's interface, `acquire(store, body, opts)`
   over a scripted network, an evidence bucket and the store handed in (fixture.mjs). Each test names the requirement ids
   it proves; each has its control. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, run, sha } from "./fixture.mjs";
import { MULTIPART_KEEP_MAX } from "../../../src/acquisition/index.mjs";

const MIB = 1024 * 1024;
const bin = (n, fill = 7) => new Uint8Array(n).fill(fill);
const octet = (b) => () => new Response(b, { headers: { "content-type": "application/octet-stream" } });

test("R10 R11 (C5): a capture over 16 MiB (three parts) is kept and served under the whole document's fingerprint; a second capture of the same bytes answers existed", async () => {
  const w = world();
  const big = bin(16 * MIB + 5);
  const route = { "https://a.example/big.pdf": octet(big) };
  const first = await run(w, route, { locator: "https://a.example/big.pdf" });
  assert.equal(first.status, 200);
  assert.equal(first.body.parts, 3);
  assert.equal(first.body.document.capture.sha256, sha(big));
  /* the bytes read back whole under the document's own fingerprint, by the evidence store every reader reaches them by */
  const back = await w.core.evidenceStore().get(sha(big));
  assert.ok(back, "an object is held under the whole document's fingerprint");
  assert.equal(sha(new Uint8Array(await back.arrayBuffer())), sha(big));
  assert.ok(w.b.calls.filter((c) => c[0] === "put" && c[1].endsWith(sha(big))).every((c) => c[2] && c[2].sha256), "stored with its checksum");
  /* the parts are still named and held (R10) */
  for (const p of first.body.document.parts) assert.ok(w.held(p.sha256));
  /* the receipt names the whole's digest */
  assert.deepEqual(w.prov.receipts.map((r) => r.captureSha), [sha(big)]);
  /* a second capture of the same bytes: registered, it answers existed (R11), and writes nothing new for the whole */
  const reg = world({ provOpts: { registered: [sha(big)] } });
  await run(reg, route, { locator: "https://a.example/big.pdf" });
  const puts = reg.b.calls.filter((c) => c[0] === "put").length;
  const again = await run(reg, route, { locator: "https://a.example/big.pdf" });
  assert.deepEqual([again.body.existed, again.body.existed_undetermined], [true, undefined]);
  assert.equal(reg.b.calls.filter((c) => c[0] === "put").length, puts, "the second capture rewrites nothing");
  /* not registered: still undetermined, never false (R11) */
  const second = await run(w, route, { locator: "https://a.example/big.pdf" });
  assert.equal(second.body.existed, null);
  assert.ok(second.body.existed_undetermined);
});

test("R10 (C5) control: a single-part capture is unchanged (one object, no second copy), and a multipart over the keep bound is held in parts as before", async () => {
  const w = world();
  const one = bin(2 * MIB);
  const r1 = await run(w, { "https://a.example/one": octet(one) }, { locator: "https://a.example/one" });
  assert.equal(r1.status, 200);
  assert.equal(w.b.calls.filter((c) => c[0] === "put").length, 1, "one part, one object");
  assert.equal(r1.body.document.parts, undefined);
  const w2 = world();
  const over = bin(MULTIPART_KEEP_MAX + 1);
  const r2 = await run(w2, { "https://a.example/over": octet(over) }, { locator: "https://a.example/over" });
  assert.equal(r2.status, 200);
  assert.equal(w2.held(sha(over)), false, "past the bound the whole is not assembled: it is held in its parts");
  for (const p of r2.body.document.parts) assert.ok(w2.held(p.sha256));
});

/* ---------- C12 (the attestation is requested after the document is kept; its tests are fix3-t51.test.mjs's, R20) ---------- */
import { RENDER_WAIT_MS } from "../../../src/acquisition/index.mjs";
import { RENDER_DEFAULTS } from "../../../src/render.mjs";
import { text, page, HTML } from "./fixture.mjs";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const until = async (f, ms = 15000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { const v = f(); if (v) return v; await sleep(10); } return f(); };

/* a route table where the document answers at once and every other URL (the timestamp authorities, the co-archive) answers
   after `ms` with `answer` */
const slowAttest = (doc, ms, answer = () => new Response("down", { status: 503 })) => (u) =>
  (u === doc ? text("slow attestation") : async () => { await sleep(ms); return answer(); });

/* ---------- C13: the render is a continuation of the filed capture ---------- */
const PAGE = "https://r.example/page";
const SHELL_HTML = HTML("<div id=app></div>");
const RENDERED = HTML("<p>rendered</p>");
const renderAnswer = { ok: true, html: RENDERED, elapsed_ms: 1234, engine: "Chrome", engine_version: "1", viewport: { width: 1280, height: 800 },
  dpr: 1, locale: "en-US", timezone: "UTC", navigated_to: PAGE, status: 200, requests: [], scripts: [], wait: { asked: RENDER_DEFAULTS.wait, fired: "networkidle" } };
const slowRenderer = (ms) => { const calls = []; return { calls, RENDERER: { fetch: async (u, init) => { calls.push(JSON.parse(init.body)); await sleep(ms); return new Response(JSON.stringify(renderAnswer)); } } }; };

test("R5 R6 R12 (C13): a render slower than the wait does not hold the capture: the shell is filed inside the bound with the render pending, and the pair is completed when the render returns", async () => {
  assert.ok(RENDER_WAIT_MS > 0);
  const env = slowRenderer(500);
  const w = world({ env });
  const t0 = Date.now();
  const first = await run(w, { [PAGE]: () => page(SHELL_HTML) }, { locator: PAGE, render: true }, { renderWaitMs: 40 });
  assert.ok(Date.now() - t0 < 400, "answered inside the bound, not after the render");
  assert.equal(first.status, 200);
  const d = first.body.document;
  assert.equal(d.capture.sha256, sha(SHELL_HTML), "the document filed first is the served page");
  assert.equal(d.pair, undefined); assert.equal(d.render, undefined);
  assert.equal(typeof d.render_pending.session, "string", "with the render pending, and the session that finishes it");
  assert.equal(first.body.render.state, "pending");
  assert.deepEqual(w.prov.receipts.map((x) => x.captureSha), [sha(SHELL_HTML)]);
  /* it is an open capture of the member's: "Finish it" */
  assert.equal(w.store.state.sessions.get(d.render_pending.session).state.opened_by, "m1");
  /* still rendering: finishing it says so and keeps the session */
  const early = await run(w, {}, { continue: d.render_pending.session }, { renderWaitMs: 10 });
  assert.deepEqual([early.status, early.body.ok, early.body.render.state, early.body.document], [200, true, "pending", undefined]);
  assert.ok(w.store.state.sessions.has(d.render_pending.session), "the session is kept");
  /* the render returns: the pair is completed, the render fetched once, the shell fetched again by no one */
  await sleep(550);
  const done = await run(w, { [PAGE]: () => page(SHELL_HTML) }, { continue: d.render_pending.session }, { renderWaitMs: 2000 });
  assert.equal(done.status, 200);
  const p = done.body.document;
  assert.equal(p.capture.method, "rendered");
  assert.equal(p.capture.sha256, sha(RENDERED));
  assert.deepEqual(p.pair, { primary: "rendered", rendered: { file: p.file, sha256: sha(RENDERED) }, shell: { file: `${p.file}.shell.html`, sha256: sha(SHELL_HTML) } });
  assert.equal(env.calls.length, 1, "the page was rendered once");
  assert.equal(w.store.state.sessions.has(d.render_pending.session), false, "finished: the session is dropped");
  assert.equal(w.store.state.spends.length, 1, "the render's cost was reported once, when it returned");
  assert.ok(w.held(sha(RENDERED)) && w.held(sha(SHELL_HTML)));
  /* finishing a finished capture finds no session and renders nothing more */
  const again = await run(w, {}, { continue: d.render_pending.session });
  assert.equal(env.calls.length, 1);
  assert.equal(again.body.document, undefined);
});

test("R5 R6 (C13) controls: a fast render files the pair at once; a render whose process was lost is rendered when the member finishes it; a failed render files nothing more", async () => {
  const fast = world({ env: slowRenderer(5) });
  const r = await run(fast, { [PAGE]: () => page(SHELL_HTML) }, { locator: PAGE, render: true }, { renderWaitMs: 2000 });
  assert.equal(r.body.document.capture.method, "rendered");
  assert.equal(r.body.document.render_pending, undefined);
  assert.equal(fast.store.state.sessions.size, 0);
  /* the object was restarted: the session is there, the render in flight is not */
  const lost = world({ env: slowRenderer(500) });
  const f = await run(lost, { [PAGE]: () => page(SHELL_HTML) }, { locator: PAGE, render: true }, { renderWaitMs: 20 });
  const sid = f.body.document.render_pending.session;
  const restarted = world({ env: slowRenderer(5) });
  restarted.store.state.sessions.set(sid, lost.store.state.sessions.get(sid));
  const done = await run(restarted, { [PAGE]: () => page(SHELL_HTML) }, { continue: sid }, { renderWaitMs: 2000 });
  assert.equal(done.status, 200);
  assert.equal(done.body.document.capture.sha256, sha(RENDERED));
  /* a render that fails: finishing it is RENDER_FAILED, the shell filed first stands */
  const bad = world({ env: { RENDERER: { fetch: async () => { await sleep(100); return new Response(JSON.stringify({ ok: false, error: "crashed" })); } } } });
  const b = await run(bad, { [PAGE]: () => page(SHELL_HTML) }, { locator: PAGE, render: true }, { renderWaitMs: 10 });
  assert.equal(b.status, 200);
  await sleep(160);
  const fin = await run(bad, { [PAGE]: () => page(SHELL_HTML) }, { continue: b.body.document.render_pending.session });
  assert.deepEqual([fin.status, fin.body.reason, fin.body.filed], [502, "RENDER_FAILED", false]);
  assert.deepEqual(bad.prov.receipts.map((x) => x.captureSha), [sha(SHELL_HTML)], "only the shell has a receipt");
});

/* ---------- C25: the document's own file name, for naming it when it has no title ---------- */
const bytes = (n = "a document") => new Response(n, { headers: { "content-type": "application/octet-stream" } });
const withHeaders = (h) => () => new Response("a document", { headers: { "content-type": "application/pdf", ...h } });

test("R16 (C25): the capture records the file name the source gives the document (Content-Disposition, else the address's own last segment when it names a file), never invented; the document's other facts are unchanged", async () => {
  const w = world();
  const name = async (url, headers = {}) => (await run(w, { [url]: withHeaders(headers) }, { locator: url })).body.document.capture.file_name;
  assert.equal(await name("https://a.example/download?id=3", { "content-disposition": 'attachment; filename="INFO-2026-0042.pdf"' }), "INFO-2026-0042.pdf");
  assert.equal(await name("https://a.example/d?id=4", { "content-disposition": "attachment; filename=plain.pdf" }), "plain.pdf");
  assert.equal(await name("https://a.example/d?id=5", { "content-disposition": "attachment; filename=\"fallback.pdf\"; filename*=UTF-8''Fran%C3%A7ais%20minutes.pdf" }), "Français minutes.pdf", "the extended form wins");
  assert.equal(await name("https://a.example/files/Budget%20FY27.pdf?v=2"), "Budget FY27.pdf", "the address's own last segment, decoded, query dropped");
  /* never a path, and never a name the source did not give */
  assert.equal(await name("https://a.example/x", { "content-disposition": 'attachment; filename="../../etc/passwd"' }), "passwd");
  assert.equal(await name("https://a.example/agendas/council", {}), undefined, "a segment that names no file is no file name");
  assert.equal(await name("https://a.example/", {}), undefined);
  assert.equal(await name("https://a.example/d?id=6", { "content-disposition": "inline" }), undefined, "a disposition with no name");
  assert.equal(await name("https://a.example/d?id=7", { "content-disposition": `attachment; filename="${"n".repeat(500)}.pdf"` }), undefined, "a name past 200 characters is not kept");
  /* the document is otherwise what it was: with and without a name it has the same keys under `capture` but this one */
  const a = (await run(w, { "https://a.example/a.pdf": withHeaders({}) }, { locator: "https://a.example/a.pdf" })).body.document.capture;
  const b = (await run(w, { "https://a.example/b": withHeaders({}) }, { locator: "https://a.example/b" })).body.document.capture;
  assert.deepEqual(Object.keys(a).filter((k) => !(k in b)), ["file_name"]);
});
