/* acquisition, T51 fix round 3 (the re-walk's C5, C12, C13, C25): at the module's interface, `acquire(store, body, opts)`
   over a scripted network, an evidence bucket and the store handed in (fixture.mjs). Each test names the requirement ids it
   proves; each has its control. The governor is fixture.mjs's stand-in, which answers host-governor R29's `peek` as that
   requirement states it (writes nothing) and counts the grants it books. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, run, sha, text, page, HTML } from "./fixture.mjs";
import { RENDER_DEFAULTS } from "../../../src/render.mjs";
import { HostGovernor } from "../../../src/host-governor/index.mjs";

const MIB = 1024 * 1024;
const BOUND_MS = 25000;
const bin = (n, fill = 7) => new Uint8Array(n).fill(fill);
/* bytes whose every 8 MiB part differs, so no part is the same object as another */
const varied = (n, seed = 1) => { const b = new Uint8Array(n); for (let i = 0; i < n; i++) b[i] = (Math.floor(i / (8 * MIB)) * 37 + seed + (i % 251)) & 255; return b; };
const octet = (b) => () => new Response(b, { headers: { "content-type": "application/octet-stream" } });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const until = async (f, ms = 15000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { const v = f(); if (v) return v; await sleep(10); } return f(); };
const wholeKey = (w, big) => `bio/captures/${sha(big)}`;
const slowPuts = (w, ms, only = () => true) => {
  const put = w.b.put.bind(w.b);
  w.b.put = async (k, bytes, opts) => { if (only(k, bytes)) await sleep(ms); return put(k, bytes, opts); };
};

/* ---------- C5: a capture of several parts is kept whole, once, with no read-back ---------- */

test("R96 R10 R11 R95 (C5): a 16 MiB capture in three parts, against a store whose put takes 1.5 s, is answered inside the door's bound with the whole stored once under its digest and each part under its own, no part read back; `keep` is timed apart from `read`", async () => {
  const w = world();
  slowPuts(w, 1500);
  const big = varied(16 * MIB + 5);
  const t0 = Date.now();
  const r = await run(w, { "https://a.example/big.pdf": octet(big) }, { locator: "https://a.example/big.pdf" });
  const took = Date.now() - t0;
  assert.equal(r.status, 200);
  assert.equal(r.body.parts, 3);
  assert.ok(took < BOUND_MS / 2, `answered inside the door's bound (${took} ms)`);
  assert.equal(r.body.document.capture.sha256, sha(big));
  /* one whole object under the whole digest, stored with its checksum; each part under its own digest */
  const puts = w.b.calls.filter((c) => c[0] === "put");
  assert.equal(puts.filter((c) => c[1] === wholeKey(w, big)).length, 1, "the whole is put once");
  assert.ok(puts.find((c) => c[1] === wholeKey(w, big))[2].sha256 === sha(big), "with its checksum");
  assert.equal(puts.length, 4, "three parts and the whole, nothing else");
  for (const p of r.body.document.parts) assert.ok(w.held(p.sha256));
  assert.equal(sha(w.bytesOf(sha(big))), sha(big));
  /* no part is read back from the object store */
  assert.deepEqual(w.b.calls.filter((c) => c[0] === "get"), [], "no get: no part is read back");
  /* the stages: the parts' writes are `read`, keeping the whole is `keep` */
  const st = r.body.timings.stages;
  assert.ok(st.keep >= 1400 && st.keep < 3500, `keep is the whole's put (${st.keep} ms)`);
  assert.ok(st.read >= 4400 && st.read < 5600, `read is the three parts' puts and not the keep (${st.read} ms)`);
  assert.ok(Object.values(st).reduce((a, b) => a + b, 0) <= r.body.timings.total_ms);
});

test("R96 R10 (C5): a second press of the same capture while the first is under way leaves one whole object", async () => {
  const w = world();
  slowPuts(w, 150);
  const big = varied(9 * MIB, 9);
  const route = { "https://a.example/twice.pdf": octet(big) };
  const [a, b] = await Promise.all([run(w, route, { locator: "https://a.example/twice.pdf" }), run(w, route, { locator: "https://a.example/twice.pdf" })]);
  assert.deepEqual([a.status, b.status], [200, 200]);
  assert.equal(a.body.document.capture.sha256, sha(big));
  assert.equal(b.body.document.capture.sha256, sha(big));
  assert.equal(w.b.calls.filter((c) => c[0] === "put" && c[1] === wholeKey(w, big)).length, 1, "the whole was put once, the second press found it under way");
  assert.equal([...w.b.held.keys()].filter((k) => k === wholeKey(w, big)).length, 1);
  assert.equal(sha(w.bytesOf(sha(big))), sha(big));
  /* a third press once it is kept finds it held and writes nothing */
  const before = w.b.calls.filter((c) => c[0] === "put").length;
  await run(w, route, { locator: "https://a.example/twice.pdf" });
  assert.equal(w.b.calls.filter((c) => c[0] === "put").length, before, "a later press rewrites nothing");
});

test("R96 R95 (C5) controls: a single-part capture is kept as before with no `keep` stage and no extra object; a store that will not take the whole refuses it in words and files nothing", async () => {
  const w = world();
  const one = bin(2 * MIB);
  const r1 = await run(w, { "https://a.example/one": octet(one) }, { locator: "https://a.example/one" });
  assert.equal(r1.status, 200);
  assert.equal(w.b.calls.filter((c) => c[0] === "put").length, 1, "one part, one object");
  assert.equal("keep" in r1.body.timings.stages, false, "a single part states no keep stage");
  const w2 = world();
  const put = w2.b.put.bind(w2.b);
  const big = varied(9 * MIB, 3);
  w2.b.put = async (k, bytes, opts) => { if (k === wholeKey(w2, big)) throw new Error("bucket refused"); return put(k, bytes, opts); };
  const r2 = await run(w2, { "https://a.example/big": octet(big) }, { locator: "https://a.example/big" });
  assert.deepEqual([r2.status, r2.body.reason, r2.body.document, w2.prov.receipts.length], [502, "CAPTURE_NOT_KEPT", undefined, 0]);
  assert.ok(r2.body.detail.length > 20, "in words, not a code alone");
  assert.equal(w2.held(sha(big)), false);
});

/* The past-memory arm (R96; record-core R87, K4363): met against a scripted double of `evidenceStore().putFromParts`, live at
   record-core's merge. The double reads no bytes; it records its calls and answers as R87 states. */
const withPutFromParts = (w, answer) => {
  const calls = [];
  const real = w.core.evidenceStore();
  w.core.evidenceStore = () => ({ ...real, putFromParts: async (digest, partDigests) => { calls.push({ at: Date.now(), digest, partDigests }); return answer(digest, partDigests); } });
  return calls;
};

test("R96 (C5 e): a capture too large for memory keeps its parts, and after the answer the store is asked to make the whole from them with `putFromParts`, once, each part named once in order, none read back, outside the answer's time", async () => {
  const w = world();
  const calls = withPutFromParts(w, async () => { await sleep(400); return { ok: true, size: 0 }; });
  const waited = [];
  const big = varied(32 * MIB + 1, 5);
  const t0 = Date.now();
  const r = await run(w, { "https://a.example/huge.pdf": octet(big) }, { locator: "https://a.example/huge.pdf" }, { waitUntil: (p) => waited.push(p), settle: false });
  const answeredAt = Date.now();
  assert.equal(r.status, 200);
  assert.equal(r.body.parts, 5);
  assert.equal(r.body.document.capture.sha256, sha(big));
  assert.equal(calls.length, 1, "asked once");
  assert.equal(calls[0].digest, sha(big));
  assert.deepEqual(calls[0].partDigests, r.body.document.parts.map((p) => p.sha256), "each part named once, in order");
  assert.ok(answeredAt - calls[0].at < 400 && !("keep" in r.body.timings.stages), "the answer did not wait for it: no keep stage");
  assert.equal(waited.length, 1, "handed to the caller's waitUntil, so it outlives the answer");
  await waited[0];
  await r.settled();
  assert.deepEqual(w.b.calls.filter((c) => c[0] === "get"), [], "no part is read back by this module");
  assert.equal(w.b.calls.filter((c) => c[0] === "put" && c[1] === wholeKey(w, big)).length, 0, "the whole is not put by this module: the store makes it");
  assert.ok(Date.now() - t0 >= 400);
});

test("R96 (C5 e) controls: a capture within memory is put whole by this module and never asks putFromParts; a store with no putFromParts keeps the parts as today; a refusal or a throw from it never fails the capture", async () => {
  const w = world();
  const calls = withPutFromParts(w, async () => ({ ok: true }));
  const mid = varied(9 * MIB, 4);
  const r = await run(w, { "https://a.example/mid": octet(mid) }, { locator: "https://a.example/mid" });
  assert.equal(r.status, 200);
  assert.equal(calls.length, 0);
  assert.ok(w.held(sha(mid)), "within memory: put whole by this module");
  const big = varied(32 * MIB + 1, 6);
  const none = world();
  const n = await run(none, { "https://a.example/huge": octet(big) }, { locator: "https://a.example/huge" });
  assert.equal(n.status, 200);
  assert.equal(none.held(sha(big)), false, "no way to make the whole: held in its parts, as before");
  for (const p of n.body.document.parts) assert.ok(none.held(p.sha256));
  for (const answer of [async () => ({ ok: false, reason: "OBJECT_TOO_LARGE" }), async () => { throw new Error("store down"); }]) {
    const f = world();
    const c = withPutFromParts(f, answer);
    const waited = [];
    const fr = await run(f, { "https://a.example/huge": octet(big) }, { locator: "https://a.example/huge" }, { waitUntil: (p) => waited.push(p) });
    assert.equal(fr.status, 200, "the capture is kept either way");
    await Promise.all(waited);
    assert.equal(c.length, 1);
    assert.deepEqual(f.prov.receipts.map((x) => x.captureSha), [sha(big)]);
  }
});

/* ---------- C12: no fixed wait for the trusted timestamp ---------- */

const slowAttest = (doc, ms, answer = () => new Response("down", { status: 503 })) => (u) =>
  (u === doc ? text("slow attestation") : async () => { await sleep(ms); return answer(); });

test("R20 R95 (C12): a capture is answered without waiting for the timestamp: an attestation that takes 2 s leaves the answer at once with the attempt pending, the `attest` stage covers starting it, and the attempt is recorded when it ends", async () => {
  const w = world();
  const t0 = Date.now();
  const r = await run(w, slowAttest("https://a.example/x", 2000), { locator: "https://a.example/x", coArchive: false }, { settle: false });
  const answeredAt = Date.now();
  assert.ok(answeredAt - t0 < 1000, `answered at once (${answeredAt - t0} ms), not after the attestation`);
  assert.equal(r.status, 200);
  assert.equal(r.body.document.capture.sha256, sha("slow attestation"));
  assert.deepEqual(w.prov.receipts.map((x) => x.captureSha), [sha("slow attestation")]);
  assert.ok(r.body.document.attestation_attempts.length >= 1);
  assert.ok(r.body.document.attestation_attempts.every((a) => a.pending === true && a.attempted === true && a.ok === false && typeof a.note === "string"));
  assert.ok(r.body.timings.stages.attest < 250, `the attest stage starts the attempts and waits no set time (${r.body.timings.stages.attest} ms)`);
  assert.equal(w.store.state.late.length, 0, "nothing recorded yet");
  const late = await until(() => w.store.state.late[0], 20000);
  assert.ok(late, "the attempt is recorded when it ends");
  assert.equal(late.captureSha, sha("slow attestation"));
  assert.ok(late.recordedAt - answeredAt >= 1500, "recorded after the answer: the answer did not wait for it");
  assert.ok(late.attempts.some((a) => a.attempted === true && a.ok === false && /503/.test(a.note)), "the authority's own answer, from the scripted network");
  await r.settled();
});

test("R20 (C12) controls: a fast attestation is still recorded in the document as before; a failing attest still files the document and records the failure", async () => {
  const fast = world();
  const f = await run(fast, (u) => (u === "https://a.example/x" ? text("fast") : new Error("tsa down")), { locator: "https://a.example/x" });
  assert.equal(f.status, 200);
  assert.ok(f.body.document.attestation_attempts.length >= 1);
  assert.ok(f.body.document.attestation_attempts.every((a) => a.pending === undefined && a.ok === false && /tsa down/.test(a.note)));
  await sleep(60);
  assert.equal(fast.store.state.late.length, 0);
  const w = world();
  const r = await run(w, slowAttest("https://a.example/x", 10, () => { throw new Error("tsa down"); }), { locator: "https://a.example/x", coArchive: false });
  assert.equal(r.status, 200);
  assert.equal(r.body.document.capture.sha256, sha("slow attestation"), "the document is filed");
  const late = await until(() => w.store.state.late[0]);
  assert.ok(late && late.attempts.some((a) => a.ok === false && /tsa down/.test(a.note)), "the failure is recorded as an attempt");
});

/* ---------- C13: one governor booking per host visit ---------- */

const PAGE = "https://r.example/page";
const SHELL_HTML = HTML("<div id=app></div>");
const RENDERED = HTML("<p>rendered</p>");
const renderAnswer = { ok: true, html: RENDERED, elapsed_ms: 12, engine: "Chrome", engine_version: "1", viewport: { width: 1280, height: 800 },
  dpr: 1, locale: "en-US", timezone: "UTC", navigated_to: PAGE, status: 200, requests: [], scripts: [], wait: { asked: RENDER_DEFAULTS.wait, fired: "networkidle" } };
const renderer = () => ({ RENDERER: { fetch: async () => new Response(JSON.stringify(renderAnswer)) } });

test("R97 R9 R5 (C13): a render-arm acquire of one page books one grant for its host: the admission is asked as a peek, which writes nothing, and the fetch books once", async () => {
  const w = world({ env: renderer() });
  const before = w.gov.granted["r.example"] || 0;
  const r = await run(w, { [PAGE]: () => page(SHELL_HTML) }, { locator: PAGE, render: true });
  assert.equal(r.status, 200);
  assert.equal(r.body.document.capture.method, "rendered");
  assert.equal((w.gov.granted["r.example"] || 0) - before, 1, "one grant for one visit");
  const asks = w.gov.calls.filter((c) => c[1] === "r.example" && (c[0] === "admit" || c[0] === "peek"));
  assert.deepEqual(asks.map((c) => c[0]), ["peek", "admit"], "the render's admission is a peek; the fetch's is the one booking");
});

test("R97 R9 R5 (C13): through host-governor's real governor, a render-arm acquire of one page leaves `granted` one higher and the peek writes nothing", async () => {
  const w = world({ env: renderer() });
  const g = new HostGovernor({ sql: w.s.sql, core: w.core }); g.migrate();
  w.store.governor = g;
  const first = await run(w, { [PAGE]: () => page(SHELL_HTML) }, { locator: PAGE, render: true });
  assert.equal(first.body.document.capture.method, "rendered");
  const row = g.governorState({ host: "r.example" }).hosts[0];
  assert.equal(row.granted, 1, "one grant for one visit");
  const before = JSON.stringify(g.governorState({ host: "q.example" }));
  g.governorAdmit({ host: "q.example", peek: true });
  assert.equal(JSON.stringify(g.governorState({ host: "q.example" })), before, "a peek creates no state");
});

test("R97 R5 R9 (C13) controls: a host in cool-off is refused on the render arm as before and nothing is booked; a plain fetch books one grant as before", async () => {
  const cool = world({ env: renderer(), gov: { refuse: ["r.example"] } });
  const c = await run(cool, { [PAGE]: () => page(SHELL_HTML) }, { locator: PAGE, render: true });
  assert.deepEqual([c.status, c.body.reason], [429, "RENDER_HOST_COOLING_OFF"]);
  assert.equal(c.body.host, "r.example");
  assert.equal(cool.gov.granted["r.example"] || 0, 0, "no grant booked for a refused visit");
  assert.equal(c.net.seen.length, 0, "nothing fetched");
  const plain = world();
  const p = await run(plain, { [PAGE]: () => page(SHELL_HTML) }, { locator: PAGE });
  assert.equal(p.status, 200);
  assert.equal(plain.gov.granted["r.example"], 1, "a plain fetch books one grant");
});

/* ---------- C25: the answer carries the document's own title ---------- */

const titled = (html) => async (w, url = "https://t.example/notice.html") => (await run(w, { [url]: () => page(html) }, { locator: url })).body;

test("R98 R8 (C25): a page's `title` element is the document's title; with none, its first heading; with neither, null; cleaned as reading-pipeline R34 cleans a title; the answer carries no reading", async () => {
  const w = world();
  const a = await titled("<!doctype html><html><head><title>Notice 2026-118</title></head><body><h1>Other</h1></body></html>")(w);
  assert.equal(a.document.title, "Notice 2026-118");
  const b = await titled("<!doctype html><html><head></head><body><p>x</p><h1>Notice 2026-118</h1></body></html>")(w, "https://t.example/b.html");
  assert.equal(b.document.title, "Notice 2026-118");
  const c = await titled("<!doctype html><html><head></head><body><p>no heading here</p></body></html>")(w, "https://t.example/c.html");
  assert.equal(c.document.title, null, "a document that states none answers none, never one made up");
  /* the cleaning: markup removed, references decoded, whitespace collapsed, at most 200 characters; script and comment text is no title */
  const d = await titled("<!doctype html><html><head><script>var t = '<title>Wrong</title>'</script><!-- <title>No</title> --><title>\n  Budget &amp;   <b>Finance</b>\tCommittee\n</title></head><body></body></html>")(w, "https://t.example/d.html");
  assert.equal(d.document.title, "Budget & Finance Committee");
  const e = await titled(`<!doctype html><html><head><title>${"é".repeat(300)}</title></head><body></body></html>`)(w, "https://t.example/e.html");
  assert.equal([...e.document.title].length, 200);
  const f = await titled("<!doctype html><html><head><title>  </title></head><body><h2>Second heading</h2></body></html>")(w, "https://t.example/f.html");
  assert.equal(f.document.title, "Second heading", "an empty title is none and the heading is read in its place");
  for (const body of [a, b, c, d, e, f]) {
    assert.equal(body.reading, undefined, "no reading");
    assert.equal(body.text_units, undefined, "no text units");
    assert.equal(body.document.reading, undefined);
  }
});

test("R98 (C25) controls: a plain-text capture and a binary capture answer title null; a rendered page's title is the rendered document's", async () => {
  const w = world();
  const t = (await run(w, { "https://t.example/n.txt": () => text("# Not a title\nbody") }, { locator: "https://t.example/n.txt" })).body;
  assert.equal(t.document.title, null);
  const bn = (await run(w, { "https://t.example/n.bin": octet(bin(2048)) }, { locator: "https://t.example/n.bin" })).body;
  assert.equal(bn.document.title, null);
  /* a PDF answers none at capture (BOB's ruling K4363): the reading names its /Info /Title once read, and the screens fall back to the file name until then */
  const pdf = new TextEncoder().encode("%PDF-1.4\n1 0 obj << /Title (A PDF title) >> endobj\ntrailer << /Info 1 0 R >>\n%%EOF");
  const pd = (await run(w, { "https://t.example/n.pdf": () => new Response(pdf, { headers: { "content-type": "application/pdf" } }) }, { locator: "https://t.example/n.pdf" })).body;
  assert.equal(pd.document.title, null);
  assert.equal(pd.reading, undefined);
  const rw = world({ env: { RENDERER: { fetch: async () => new Response(JSON.stringify({ ...renderAnswer, html: "<!doctype html><html><head><title>As rendered</title></head><body><p>x</p></body></html>" })) } } });
  const rr = await run(rw, { [PAGE]: () => page(HTML("<div id=app></div>")) }, { locator: PAGE, render: true });
  assert.equal(rr.body.document.capture.method, "rendered");
  assert.equal(rr.body.document.title, "As rendered");
});
