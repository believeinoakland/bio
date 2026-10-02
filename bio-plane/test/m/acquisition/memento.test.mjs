/* acquisition R32 (N492, K1032): the archive arm (R3) and `archiveLookup` find a memento through capture-sources R37's
   Memento services, over a scripted Memento archive at the Wayback Machine's addresses (fixture `wayback`). Each
   refusal is answered by name and nothing is filed: no document, no receipt, no object stored. Each arm has its
   negative control: the same world with a usable memento files exactly one capture. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, run, lookup, sha, wayback, WB, eligible, http1123 } from "./fixture.mjs";
import { EMPTY_BODY_DIGEST } from "../../../src/cdx.mjs";

const ADDR = "https://gone.example/doc";
const ARCH = { via: "archive.org", address: ADDR };
const ADMIN = { cls: "admin", member: false, sessMember: null };
const TG = `${WB}${ADDR}`, TM = `${WB}timemap/link/${ADDR}`;

/* Nothing filed: no document, no receipt, no signature, no object put in the evidence store. */
const nothingFiled = (w, r, what) => {
  assert.equal(r.body.document, undefined, `${what}: no document`);
  assert.deepEqual([w.prov.receipts.length, w.prov.signed.length, w.b.calls.filter((c) => c[0] === "put").length], [0, 0, 0], `${what}: nothing filed or stored`);
};
const fresh = async () => { const w = world(); await eligible(w); return w; };

test("R32: the TimeGate's memento, its raw bytes fetched, is chosen by selectCapture over mementoRow and filed with mementoHop under rel=original", async () => {
  const w = await fresh();
  const raw = `${WB}20250301101500id_/${ADDR}`;
  const r = await run(w, wayback([{ ts: "20250301101500", body: "the memento", ct: "text/plain" }]), ARCH, ADMIN);
  assert.equal(r.status, 200);
  assert.deepEqual(r.net.seen.map((x) => x.url), [TG, raw], "the TimeGate, then the memento's raw form (WAYBACK_MEMENTO.raw); no TimeMap needed");
  const d = r.body.document;
  assert.deepEqual([d.locator, d.capture.sha256, d.capture.bytes], [raw, sha("the memento"), 11]);
  const hop = d.provenance_chain[1];
  assert.deepEqual([hop.who, hop.via, hop.bound, hop.document_address], ["Internet Archive Wayback Machine", "archive.org", false, ADDR]);
  assert.equal(hop.asserts, `these bytes were served for ${ADDR} at 2025-03-01T10:15:00Z, with HTTP status 200`);
  for (const part of [`Memento-Datetime: ${http1123("20250301101500")}`, `memento ${raw}`, `rel="original" ${ADDR}`, `rel="timemap" ${TM}`,
                      "mimetype text/plain", `SHA-256 ${sha("the memento")}, computed by this instance over the bytes it received`])
    assert.ok(hop.evidence.includes(part), part);
  assert.deepEqual([w.prov.receipts.length, w.prov.receipts[0].address, w.prov.receipts[0].retrievalLocator], [1, ADDR, raw]);
  /* the document address is the memento's rel=original, not the address asked about */
  const w2 = await fresh();
  const moved = await run(w2, wayback([{ ts: "20250301101500", original: "https://gone.example/doc?v=1", link: `<https://gone.example/doc?v=1>; rel="original"` }]), ARCH, ADMIN);
  assert.equal(moved.body.document.provenance_chain[1].document_address, "https://gone.example/doc?v=1");
  assert.equal(w2.prov.receipts[0].address, "https://gone.example/doc?v=1");
});

test("R32: with no usable memento at the TimeGate, the TimeMap is read and its candidates fetched newest first, each refused one named", async () => {
  const w = await fresh();
  const routes = wayback([{ ts: "20240101000000", body: "old" }, { ts: "20240601000000", status: 302, body: "" }, { ts: "20250101000000", status: 500, body: "err" }],
                         { over: { [TG]: new Response("none", { status: 404 }) } });
  const r = await run(w, routes, ARCH, ADMIN);
  assert.equal(r.status, 200);
  assert.deepEqual(r.net.seen.map((x) => x.url), [TG, TM, `${WB}20250101000000id_/${ADDR}`, `${WB}20240601000000id_/${ADDR}`, `${WB}20240101000000id_/${ADDR}`]);
  assert.equal(r.body.document.capture.sha256, sha("old"));
  /* archiveLookup reports the same choice and every memento not used, with selectCapture's and readMementoAnswer's words */
  const look = await lookup(await fresh(), routes, { address: ADDR });
  assert.equal(look.body.chosen.timestamp, "20240101000000");
  const words = look.body.rejected.map((x) => x.refused);
  assert.ok(words.includes("statuscode 500, not 200") && words.includes("statuscode 302, not 200"), JSON.stringify(words));
  assert.ok(look.body.rejected.some((x) => x.uri === TG && /holds no memento/.test(x.refused)), "the TimeGate's 404 is named");
});

/* Each Memento refusal, answered by name on both arms, nothing filed. */
const REFUSALS = [
  ["MEMENTO_LINK_MALFORMED", 502, wayback([], { over: { [TM]: new Response("<https://x; rel=memento", { status: 200 }) } })],
  ["MEMENTO_NO_ORIGINAL", 502, wayback([], { over: { [TM]: new Response(`<${WB}20250101000000/${ADDR}>; rel="memento"; datetime="${http1123("20250101000000")}"`) } })],
  ["MEMENTO_NO_ORIGINAL", 502, wayback([{ ts: "20250101000000", link: null }])],
  ["MEMENTO_NOT_NEGOTIATED", 502, wayback([], { over: { [TG]: new Response("", { status: 302 }) } })],
  ["MEMENTO_NO_DATETIME", 502, wayback([], { over: { [TG]: new Response("<p>a page</p>", { status: 200, headers: { "content-type": "text/html" } }) } })],
  ["MEMENTO_BAD_DATETIME", 502, wayback([{ ts: "20250101000000", datetime: "yesterday" }])],
  ["NO_USABLE_CAPTURE", 404, wayback([{ ts: "20250101000000", body: "" }])],
  ["NO_USABLE_CAPTURE", 404, wayback([{ ts: "20250101000000", status: 301, body: "moved" }])],
  ["NO_USABLE_CAPTURE", 404, wayback([])],
];

test("R32: each Memento refusal (MEMENTO_LINK_MALFORMED, MEMENTO_NO_ORIGINAL, MEMENTO_NOT_NEGOTIATED, MEMENTO_NO_DATETIME, MEMENTO_BAD_DATETIME, NO_USABLE_CAPTURE) is answered by name on the archive arm and nothing is filed", async () => {
  for (const [reason, status, routes] of REFUSALS) {
    const w = await fresh();
    const r = await run(w, routes, ARCH, ADMIN);
    assert.deepEqual([r.status, r.body.ok, r.body.reason], [status, false, reason], reason);
    assert.ok(Array.isArray(r.body.considered), `${reason}: what was considered is named`);
    nothingFiled(w, r, reason);
  }
  /* an empty memento is refused by selectCapture's own reason, the empty-body digest */
  const w = await fresh();
  const e = await run(w, wayback([{ ts: "20250101000000", body: "" }]), ARCH, ADMIN);
  assert.ok(e.body.considered.some((c) => /empty-body digest/.test(c.refused)), JSON.stringify(e.body.considered));
  assert.equal(EMPTY_BODY_DIGEST.length, 32);
  /* negative control: the same world with a usable memento files one capture */
  const ok = await run(w, wayback([{ ts: "20250101000000", body: "x" }]), ARCH, ADMIN);
  assert.deepEqual([ok.status, w.prov.receipts.length], [200, 1]);
});

test("R32: archiveLookup answers each Memento refusal by name, and a usable memento by its choice, filing nothing either way", async () => {
  for (const [reason, status, routes] of REFUSALS) {
    const w = await fresh();
    const r = await lookup(w, routes, { address: ADDR });
    assert.deepEqual([r.status, r.body.ok, r.body.reason], [status, false, reason], reason);
    nothingFiled(w, r, reason);
  }
  const w = await fresh();
  const ok = await lookup(w, wayback([{ ts: "20250101000000", body: "x" }]), { address: ADDR });
  assert.deepEqual([ok.status, ok.body.ok, ok.body.chosen.digest, ok.body.provenance_hop.document_address], [200, true, sha("x"), ADDR]);
  nothingFiled(w, ok, "a lookup");
});

test("R32 R9: every Memento request goes through the host governor; a cooling archive answers HOST_COOLING_OFF with nothing fetched or filed", async () => {
  const w = await fresh();
  const r = await run(w, wayback([{ ts: "20250101000000" }], { over: { [TG]: new Response("none", { status: 404 }) } }), ARCH, ADMIN);
  const admits = w.gov.calls.filter((c) => c[0] === "admit").map((c) => c[1]);
  const reports = w.gov.calls.filter((c) => c[0] === "report").map((c) => [c[1], c[2]]);
  assert.equal(r.status, 200);
  assert.deepEqual(admits, ["web.archive.org", "web.archive.org", "web.archive.org"], "TimeGate, TimeMap and memento each admitted");
  assert.deepEqual(reports, [["web.archive.org", 404], ["web.archive.org", 200], ["web.archive.org", 200]], "each outcome reported");
  assert.ok(r.net.seen.every((x) => /^CivicOS\//.test(x.init.headers["user-agent"])), "under this instance's agent");
  const cool = world({ gov: { refuse: ["web.archive.org"] } }); await eligible(cool);
  const c = await run(cool, wayback([{ ts: "20250101000000" }]), ARCH, ADMIN);
  assert.deepEqual([c.status, c.body.reason, c.net.seen.length], [429, "HOST_COOLING_OFF", 0]);
  nothingFiled(cool, c, "cooling");
  /* a rate-limited archive is not hammered: the TimeGate's 429 ends the lookup */
  const rl = await fresh();
  const l = await run(rl, wayback([{ ts: "20250101000000" }], { over: { [TG]: new Response("slow", { status: 429 }) } }), ARCH, ADMIN);
  assert.deepEqual([l.status, l.body.reason, l.body.status, l.net.seen.length], [502, "ARCHIVE_REFUSED", 429, 1]);
  nothingFiled(rl, l, "rate-limited");
});

/* N510: a body as a stream of `chunks`, ending, or breaking off with `err` once they are sent; `memento` answers a fresh
   one (made by `body()`) at each fetch, as a 200 memento of ADDR. */
const streamOf = (chunks, err = null) => { let i = 0; return new ReadableStream({ pull(c) {
  if (i < chunks.length) c.enqueue(new TextEncoder().encode(chunks[i++])); else if (err) c.error(err); else c.close(); } }); };
const memento = (ts, body) => () => new Response(body(), { status: 200, headers: { "content-type": "text/plain", "memento-datetime": http1123(ts),
  link: `<${ADDR}>; rel="original", <${TM}>; rel="timemap"` } });
const RAW = (ts) => `${WB}${ts}id_/${ADDR}`;

test("R32 (N510): an empty 200 memento is passed over for the next candidate, on the archive arm and in archiveLookup, with selectCapture's words; every memento empty is NO_USABLE_CAPTURE with nothing filed", async () => {
  const routes = wayback([{ ts: "20250301000000", body: "" }, { ts: "20240101000000", body: "the older memento" }]);
  const w = await fresh();
  const r = await run(w, routes, ARCH, ADMIN);
  assert.equal(r.status, 200, JSON.stringify(r.body).slice(0, 300));
  assert.deepEqual(r.net.seen.map((x) => x.url), [TG, RAW("20250301000000"), TM, RAW("20240101000000")],
                   "the TimeGate's empty memento, then the TimeMap, the empty one not fetched twice, then the older one");
  const d = r.body.document;
  assert.deepEqual([d.locator, d.capture.sha256, d.capture.bytes], [RAW("20240101000000"), sha("the older memento"), 17]);
  assert.equal(d.provenance_chain[1].asserts, `these bytes were served for ${ADDR} at 2024-01-01T00:00:00Z, with HTTP status 200`);
  assert.deepEqual(w.prov.receipts.map((x) => [x.captureSha, x.retrievalLocator]), [[sha("the older memento"), RAW("20240101000000")]]);
  const puts = w.b.calls.filter((c) => c[0] === "put").map((c) => c[1]);
  assert.deepEqual(puts, [`bio/captures/${sha("the older memento")}`], "only the chosen memento's bytes are stored; the empty one left nothing");
  assert.deepEqual(w.store.state.outcomes.slice(3).map((o) => o.outcome), ["success"], "one success, for the memento chosen");
  /* archiveLookup decides the same, and names the empty memento with selectCapture's own reason */
  const look = await lookup(await fresh(), routes, { address: ADDR });
  assert.deepEqual([look.status, look.body.chosen.timestamp, look.body.chosen.digest], [200, "20240101000000", sha("the older memento")]);
  const empty = look.body.rejected.find((x) => x.timestamp === "20250301000000");
  assert.ok(empty && /empty-body digest/.test(empty.refused), JSON.stringify(look.body.rejected));
  /* negative control: every memento empty, so none may stand in; each is tried once and named, nothing filed */
  for (const arm of ["acquire", "archiveLookup"]) {
    const nw = await fresh();
    const allEmpty = wayback([{ ts: "20250301000000", body: "" }, { ts: "20240101000000", body: "" }]);
    const n = arm === "acquire" ? await run(nw, allEmpty, ARCH, ADMIN) : await lookup(nw, allEmpty, { address: ADDR });
    assert.deepEqual([n.status, n.body.ok, n.body.reason], [404, false, "NO_USABLE_CAPTURE"], arm);
    assert.deepEqual(n.net.seen.map((x) => x.url), [TG, RAW("20250301000000"), TM, RAW("20240101000000")], arm);
    assert.deepEqual(n.body.considered.filter((c) => /empty-body digest/.test(c.refused)).map((c) => c.timestamp).sort(),
                     ["20240101000000", "20250301000000"], `${arm}: both named with selectCapture's reason`);
    nothingFiled(nw, n, arm);
    assert.equal(nw.store.state.outcomes.length, 3, `${arm}: no success recorded for the document`);
  }
  /* over-strictness: a memento whose first chunk is empty and whose bytes follow is not empty; it is filed whole */
  const late = await fresh();
  const lr = await run(late, wayback([{ ts: "20250301000000" }], { over: { [RAW("20250301000000")]: memento("20250301000000", () => streamOf(["", "late ", "bytes"])) } }), ARCH, ADMIN);
  assert.deepEqual([lr.status, lr.body.document.capture.sha256, lr.body.document.capture.bytes], [200, sha("late bytes"), 10]);
  assert.ok(late.held(sha("late bytes")), "the bytes read ahead are stored with the rest");
});

test("R10 R32: a body that breaks off while it is read is answered by name, never thrown: FETCH_FAILED on a direct fetch, ARCHIVE_UNREACHABLE on the archive arm and in archiveLookup; nothing filed", async () => {
  /* a direct fetch: the first bytes arrive, then the stream breaks */
  const w = world();
  const loc = "https://a.example/broken";
  const d = await run(w, { [loc]: () => new Response(streamOf(["part of it"], new Error("connection reset"))) }, { locator: loc });
  assert.deepEqual([d.status, d.body.ok, d.body.reason, d.body.locator], [502, false, "FETCH_FAILED", loc]);
  assert.match(d.body.detail, /connection reset/);
  nothingFiled(w, d, "direct");
  assert.equal(w.store.state.outcomes.at(-1).outcome, "fetch_failed", "capture R8: the fetch did not complete");
  /* with a credential riding it, the error's words are not carried */
  const SECRET = "alice:s3cret";
  const c = await run(world(), { [loc]: () => new Response(streamOf(["x"], new Error(`reset for ${SECRET}`))) }, {}, { cls: "daemon", member: false, sessMember: null,
    captureRequest: { locator: loc, purpose: "p", agent: null, render: false, credential: { credential: "C-1", kind: "login", secret: SECRET } } });
  assert.equal(c.body.reason, "FETCH_FAILED"); assert.ok(!JSON.stringify(c.body).includes(SECRET));
  /* the archive arm and the lookup: a memento breaking off after its first bytes, and before any */
  for (const chunks of [["some "], []]) {
    const routes = wayback([{ ts: "20250301000000" }], { over: { [RAW("20250301000000")]: memento("20250301000000", () => streamOf(chunks, new Error("archive reset"))) } });
    for (const arm of ["acquire", "archiveLookup"]) {
      const aw = await fresh();
      const a = arm === "acquire" ? await run(aw, routes, ARCH, ADMIN) : await lookup(aw, routes, { address: ADDR });
      assert.deepEqual([a.status, a.body.ok, a.body.reason], [502, false, "ARCHIVE_UNREACHABLE"], `${arm} ${chunks.length}`);
      assert.match(a.body.detail, /archive reset/);
      nothingFiled(aw, a, arm);
    }
  }
  /* negative control: the same bodies, unbroken, are filed */
  const ok = await run(world(), { [loc]: () => new Response(streamOf(["part of it"])) }, { locator: loc });
  assert.deepEqual([ok.status, ok.body.document.capture.sha256], [200, sha("part of it")]);
  const aok = await run(await fresh(), wayback([{ ts: "20250301000000" }], { over: { [RAW("20250301000000")]: memento("20250301000000", () => streamOf(["some ", "bytes"])) } }), ARCH, ADMIN);
  assert.deepEqual([aok.status, aok.body.document.capture.sha256], [200, sha("some bytes")]);
});
