/* acquisition, T51 fix round 3 (the re-walk's C5, C12, C13, C25): at the module's interface, `acquire(store, body, opts)`
   over a scripted network, an evidence bucket and the store handed in (fixture.mjs). Each test names the requirement ids it
   proves; each has its control. The governor is fixture.mjs's stand-in, which answers host-governor R29's `peek` as that
   requirement states it (writes nothing) and counts the grants it books. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, run, sha, text, page, HTML, network } from "./fixture.mjs";
import { RENDER_DEFAULTS } from "../../../src/render.mjs";
import { HostGovernor } from "../../../src/host-governor/index.mjs";
import { ACQUISITION_CHECKS } from "../../../src/acquisition/checks.mjs";
import { evidencePartsRefusal } from "../record-core/fixtures.mjs";

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
  /* R101: the format is judged from range reads of the head and the tail (a part is never read whole) */
  /* R115 (K4926) amends this for a body with no length declared: nothing is held beside the whole, so the parts are read back, one at a time, each once, never the whole */
  assert.deepEqual(w.b.calls.filter((c) => c[0] === "get" && !(c[2] && c[2].range)).map((c) => c[1]).sort(), r.body.document.parts.map((p) => `bio/captures/${p.sha256}`).sort(), "each stored part is read back once, and no whole");
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

test("R96 R10 (C5, K4370): the CAPTURE_NOT_KEPT refusal carries its catalogue row's code, check and translation; control: an existing refusal's row is unchanged", async () => {
  const w = world();
  const put = w.b.put.bind(w.b);
  const big = varied(9 * MIB, 5);
  w.b.put = async (k, bytes, opts) => { if (k === wholeKey(w, big)) throw new Error("bucket refused"); return put(k, bytes, opts); };
  const r = await run(w, { "https://a.example/row": octet(big) }, { locator: "https://a.example/row" });
  const row = ACQUISITION_CHECKS.CAPTURE_NOT_KEPT;
  assert.equal(r.status, 502);
  assert.deepEqual([r.body.reason, r.body.code, r.body.check, r.body.translation], ["CAPTURE_NOT_KEPT", "CAPTURE_NOT_KEPT", row.check, row.translation]);
  assert.match(row.check, /^C-\d+\.\d+$/);
  assert.ok(row.translation.length > 20, "the row's translation is a sentence, not a code");
  /* control: an existing refusal's row is unchanged by the new row */
  assert.equal(ACQUISITION_CHECKS.CAPTURE_NOT_DRAINING.check, "C-28.13");
  assert.ok(ACQUISITION_CHECKS.CAPTURE_NOT_DRAINING.translation.length > 20);
});

/* The past-memory arm (R96; record-core R87, K4363): met against a scripted double of `evidenceStore().putFromParts`, live at
   record-core's merge. The double reads no bytes; it records its calls and answers as R87 states. */
const withPutFromParts = (w, answer) => {
  const calls = [];
  const real = w.core.evidenceStore();
  w.core.evidenceStore = () => ({ ...real, putFromParts: async (digest, partDigests) => { calls.push({ at: Date.now(), digest, partDigests }); return answer(digest, partDigests); } });
  return calls;
};

test("R96 (C5 e): a capture too large for memory keeps its parts, and the store is asked to make the whole from them with `putFromParts`, once, each part named once in order, none read back, awaited within the bound", async () => {
  const w = world();
  const calls = withPutFromParts(w, async () => { await sleep(400); return { ok: true, size: 0 }; });
  const big = varied(32 * MIB + 1, 5);
  const t0 = Date.now();
  const r = await run(w, { "https://a.example/huge.pdf": octet(big) }, { locator: "https://a.example/huge.pdf" }, { settle: false });
  const answeredAt = Date.now();
  assert.equal(r.status, 200);
  assert.equal(r.body.parts, 5);
  assert.equal(r.body.document.capture.sha256, sha(big));
  assert.equal(calls.length, 1, "asked once");
  assert.equal(calls[0].digest, sha(big));
  assert.deepEqual(calls[0].partDigests, r.body.document.parts.map((p) => p.sha256), "each part named once, in order");
  assert.ok(answeredAt - calls[0].at >= 380 && r.body.timings.stages.keep >= 380, "R96 (C5c): the answer awaited it, as stage keep");
  assert.equal(r.body.keep_pending, undefined, "kept within the bound: no keep_pending");
  await r.settled();
  assert.deepEqual(w.b.calls.filter((c) => c[0] === "get" && !(c[2] && c[2].range)), [], "no part is read back by this module (R101: only range reads of the head and tail)");
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
  /* the refusal record-core's real `putFromParts` gives when the store will not take the whole (C-102.39) */
  const { refused: storeRefused } = await evidencePartsRefusal();
  for (const answer of [async () => storeRefused, async () => { throw new Error("store down"); }]) {
    const f = world();
    const c = withPutFromParts(f, answer);
    const fr = await run(f, { "https://a.example/huge": octet(big) }, { locator: "https://a.example/huge" });
    assert.equal(fr.status, 200, "the capture is kept either way");
    assert.equal(c.length, 1);
    assert.deepEqual(f.prov.receipts.map((x) => x.captureSha), [sha(big)]);
  }
});

/* R96 (fix round 4, C5c): a keep that will not end within the bound is registered with the store handed in and the answer says so */
test("R96 (C5c): a keep that outlasts what is left of the bound is handed to keepLater and the answer says keep_pending; control: one that ends in time registers nothing", async () => {
  const big = varied(32 * MIB + 1, 8);
  const w = world();
  const calls = withPutFromParts(w, async () => { await sleep(1500); return { ok: true }; });
  const registered = [];
  // fixtures-contract: plane keep-later
  w.store.keepLater = async (k) => { registered.push(k); return { ok: true }; };
  const t0 = Date.now();
  const r = await run(w, { "https://a.example/slow": octet(big) }, { locator: "https://a.example/slow" }, { boundMs: 5600 });
  assert.equal(r.status, 200);
  assert.equal(r.body.keep_pending, true);
  assert.ok(Date.now() - t0 < 1500 + 3000, "answered without waiting out the keep");
  assert.equal(registered.length, 1);
  assert.equal(registered[0].sha, sha(big));
  assert.equal(registered[0].parts.length, 5);
  assert.ok(registered[0].parts.every((d) => /^[0-9a-f]{64}$/.test(d)), "parts are digests");
  assert.equal(calls.length, 1);
  const f = world();
  withPutFromParts(f, async () => ({ ok: true }));
  const fr2 = [];
  // fixtures-contract: plane keep-later
  f.store.keepLater = async (k) => { fr2.push(k); return { ok: true }; };
  const ok = await run(f, { "https://a.example/fast": octet(big) }, { locator: "https://a.example/fast" });
  assert.equal(ok.body.keep_pending, undefined);
  assert.deepEqual(fr2, []);
});

/* R96 (C5c) with the real record-core putFromParts over a bucket with R2's multipart upload: the whole is held and readable once the answer is given */
test("R96 (C5c): with record-core's real putFromParts, a 40 MB capture in parts answers with the whole held under its digest and no part read back by this module", async () => {
  const w = world();
  const uploads = new Map();
  w.b.createMultipartUpload = async (key) => { const id = uploads.size; const parts = []; uploads.set(id, parts);
    return { uploadPart: async (n, bytes) => { parts[n - 1] = new Uint8Array(bytes); return { partNumber: n }; },
             complete: async () => { const all = Buffer.concat(parts); w.b.held.set(key, new Uint8Array(all)); }, abort: async () => {} }; };
  const big = varied(40 * MIB, 3);
  const r = await run(w, { "https://a.example/forty.pdf": octet(big) }, { locator: "https://a.example/forty.pdf" });
  assert.equal(r.status, 200);
  assert.equal(r.body.keep_pending, undefined);
  assert.equal(sha(w.bytesOf(sha(big))), sha(big), "the whole is held under its digest");
  assert.equal(r.body.parts, 5);
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
  /* a PDF answers its /Info /Title at capture (R98, fix round 4, C25; replaces K4363's "none at capture") */
  const pdf = new TextEncoder().encode("%PDF-1.4\n1 0 obj << /Title (A PDF title) >> endobj\ntrailer << /Info 1 0 R >>\n%%EOF");
  const pd = (await run(w, { "https://t.example/n.pdf": () => new Response(pdf, { headers: { "content-type": "application/pdf" } }) }, { locator: "https://t.example/n.pdf" })).body;
  assert.equal(pd.document.title, "A PDF title");
  assert.equal(pd.reading, undefined);
  /* K4370: a PDF with no Title entry answers null at capture too, the same as one with a Title entry */
  const bare = new TextEncoder().encode("%PDF-1.4\n1 0 obj << /Author (Clerk) >> endobj\ntrailer << /Info 1 0 R >>\n%%EOF");
  const pb = (await run(w, { "https://t.example/bare.pdf": () => new Response(bare, { headers: { "content-type": "application/pdf" } }) }, { locator: "https://t.example/bare.pdf" })).body;
  assert.equal(pb.document.title, null, "a PDF with no Title entry answers null at capture");
  const rw = world({ env: { RENDERER: { fetch: async () => new Response(JSON.stringify({ ...renderAnswer, html: "<!doctype html><html><head><title>As rendered</title></head><body><p>x</p></body></html>" })) } } });
  const rr = await run(rw, { [PAGE]: () => page(HTML("<div id=app></div>")) }, { locator: PAGE, render: true });
  assert.equal(rr.body.document.capture.method, "rendered");
  assert.equal(rr.body.document.title, "As rendered");
});

/* ---------- C25 (fix round 4): a PDF is named by its own Title entry (pdf-reader R40's pdfTitle) ---------- */
const pdfWith = (info) => new TextEncoder().encode(`%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] >>\nendobj\n4 0 obj\n<< ${info} >>\nendobj\ntrailer\n<< /Root 1 0 R /Info 4 0 R /Size 5 >>\n%%EOF\n`);
const pdfRes = (b) => () => new Response(b, { headers: { "content-type": "application/pdf" } });

test("R98 (fix round 4, C25): a PDF with a Title entry answers it as `document.title`, one with none answers null; control: an HTML page's title is read as before", async () => {
  const w = world();
  const titled = await run(w, { "https://www.irs.example/f1040es.pdf": pdfRes(pdfWith("/Title (2026 Form 1040-ES) /Producer (x)")) }, { locator: "https://www.irs.example/f1040es.pdf" });
  assert.equal(titled.status, 200);
  assert.equal(titled.body.document.title, "2026 Form 1040-ES");
  const bare = await run(world(), { "https://www.irs.example/none.pdf": pdfRes(pdfWith("/Producer (x)")) }, { locator: "https://www.irs.example/none.pdf" });
  assert.equal(bare.body.document.title, null);
  assert.equal("reading" in bare.body, false, "R8: still no reading");
  const html = await run(world(), { "https://a.example/n": () => page("<title>Notice 2026-118</title>") }, { locator: "https://a.example/n" });
  assert.equal(html.body.document.title, "Notice 2026-118");
});

/* ---------- N-slow-refuse (fix round 4): a refused host is answered at once, through the whole path, with the real governor ---------- */
test("R9 R95 (N-slow-refuse; host-governor R30): through the real governedFetch, a host answering 403 and one answering 429 with Retry-After: 60 are each refused in words within 3 s with timings, nothing kept, and a second acquire of the cooling host is refused at once with retry_in_ms and no fetch; control: an unrefused fetch is unchanged", async () => {
  const w = world();
  const g = new HostGovernor({ sql: w.s.sql, core: w.core }); g.migrate();
  w.store.governor = g;
  const routes = {
    "https://no.example/a": () => new Response("no", { status: 403 }),
    "https://slow.example/a": () => new Response("slow down", { status: 429, headers: { "retry-after": "60" } }),
    "https://ok.example/a": () => page(HTML("<p>fine</p>")),
  };
  for (const [url, wantStatus] of [["https://no.example/a", 403], ["https://slow.example/a", 429]]) {
    const t0 = Date.now();
    const r = await run(w, routes, { locator: url });
    assert.ok(Date.now() - t0 < 3000, `${url} answered within 3 s (${Date.now() - t0} ms)`);
    assert.equal(r.body.ok, false);
    assert.equal(r.body.reason, "SOURCE_REFUSED");
    assert.equal(r.body.status, wantStatus);
    assert.ok(Number.isInteger(r.body.retry_in_ms) && r.body.retry_in_ms > 0, "retry_in_ms is stated");
    assert.ok(r.body.timings && r.body.timings.stages.fetch >= 0);
    assert.equal(w.held(sha("no")), false, "nothing kept");
  }
  const again = await run(w, routes, { locator: "https://slow.example/a" });
  assert.equal(again.body.reason, "HOST_COOLING_OFF");
  assert.ok(again.body.retry_in_ms > 0);
  assert.equal(again.net.seen.length, 0, "the cooling host is not fetched again");
  const fine = await run(w, routes, { locator: "https://ok.example/a" });
  assert.equal(fine.status, 200);
});

/* ---------- C13b (fix round 4): a continuation with no live render starts the render afresh. The renderer here is a scripted double
   (no real render runs in this module's tests; capture-sources runs the same case with the real one). ---------- */
const neverRenderer = () => { const calls = []; return { calls, RENDERER: { fetch: async (u, init) => { calls.push(JSON.parse(init.body)); return new Promise(() => {}); } } }; };
const answeringRenderer = () => { const calls = []; return { calls, RENDERER: { fetch: async (u, init) => { const q = JSON.parse(init.body); calls.push(q); return new Response(JSON.stringify(R_ANSWER(q.url))); } } }; };
const SHELL = HTML("<div id=app></div>");
const RENDERED_PAGE = HTML("<p>rendered</p>");
const R_ANSWER = (url) => ({ ok: true, html: RENDERED_PAGE, elapsed_ms: 12, engine: "Chrome", engine_version: "1", viewport: { width: 1280, height: 800 },
  dpr: 1, locale: "en-US", timezone: "UTC", navigated_to: url, status: 200, requests: [], scripts: [], wait: { asked: RENDER_DEFAULTS.wait, fired: "networkidle" } });

test("R99 R12 R5 (C13b): the render's run never settles (the request that began it ended): finishing the capture after the live bound starts the render afresh and files the visitor copy, closing the session; control: before the bound it still answers pending and keeps the session", async () => {
  const PG = "https://r.example/never";
  const w = world({ env: neverRenderer() });
  const first = await run(w, { [PG]: () => page(SHELL) }, { locator: PG, render: true }, { renderWaitMs: 20 });
  const sid = first.body.document.render_pending.session;
  const early = await run(w, {}, { continue: sid }, { renderWaitMs: 10, renderStaleMs: 60000 });
  assert.equal(early.body.render.state, "pending", "control: within the live bound it is pending");
  assert.ok(w.store.state.sessions.has(sid), "and the session is kept");
  /* the renderer now answers; the lost run is not waited for any longer */
  w.core.settings = w.core.settings;
  const env2 = answeringRenderer();
  w.store.env.RENDERER = env2.RENDERER;
  await sleep(70);
  const done = await run(w, { [PG]: () => page(SHELL) }, { continue: sid }, { renderStaleMs: 50 });
  assert.equal(done.status, 200);
  assert.equal(done.body.document.capture.method, "rendered", "the second document is the visitor copy");
  assert.equal(done.body.document.capture.sha256, sha(RENDERED_PAGE));
  assert.equal(env2.calls.length, 1, "rendered afresh, once");
  assert.equal(w.store.state.sessions.has(sid), false, "the session is closed");
  assert.notEqual(done.body.note && done.body.continued, true);
});

test("R99 R12 R5 (C13b): the object restarted (the render table is gone): finishing the capture renders afresh and files the visitor copy; a render that does not come back is refused in words and closes the session", async () => {
  const PG = "https://r.example/restarted";
  const w = world({ env: neverRenderer() });
  const first = await run(w, { [PG]: () => page(SHELL) }, { locator: PG, render: true }, { renderWaitMs: 20 });
  const sid = first.body.document.render_pending.session;
  const fresh = await import("../../../src/acquisition/index.mjs?restart=c13b");   // a new module instance: an empty render table
  w.store.env.RENDERER = answeringRenderer().RENDERER;
  const net = network({ [PG]: () => page(SHELL) });
  const done = await fresh.acquire(w.store, { continue: sid }, { cls: "member", member: true, sessMember: "m1", storeName: "bio" });
  net.restore();
  assert.equal(done.status, 200);
  assert.equal(done.body.document.capture.method, "rendered");
  assert.equal(w.store.state.sessions.has(sid), false);
  /* a render begun afresh that never comes back is final: refused in words, the session closed, never "already in the record" */
  const w2 = world({ env: neverRenderer() });
  const f2 = await run(w2, { [PG]: () => page(SHELL) }, { locator: PG, render: true }, { renderWaitMs: 20 });
  const sid2 = f2.body.document.render_pending.session;
  const fresh2 = await import("../../../src/acquisition/index.mjs?restart=c13b2");
  const net2 = network({ [PG]: () => page(SHELL) });
  const bad = await fresh2.acquire(w2.store, { continue: sid2 }, { cls: "member", member: true, sessMember: "m1", storeName: "bio", renderWaitMs: 30 });
  net2.restore();
  assert.deepEqual([bad.status, bad.body.reason], [502, "RENDER_FAILED"]);
  assert.equal(typeof bad.body.detail, "string");
  assert.equal(bad.body.continued, undefined);
  assert.equal(w2.store.state.sessions.has(sid2), false, "the session is closed");
});

test("R98 R15 (C25): an undetermined capture's queue event keeps `subject` the locator and carries the document's `title` when it has one; control: none when it has none", async () => {
  const w = world();
  await run(w, { "https://a.example/t": () => page("<title>Notice 2026-118</title>") }, { locator: "https://a.example/t" });
  const ev = w.store.state.events.find((e) => e.kind === "authority-undetermined");
  assert.equal(ev.subject, "https://a.example/t");
  assert.equal(ev.title, "Notice 2026-118");
  const n = world();
  await run(n, { "https://a.example/n": () => text("plain") }, { locator: "https://a.example/n" });
  assert.equal("title" in n.store.state.events.find((e) => e.kind === "authority-undetermined"), false);
});
