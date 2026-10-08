/* acquisition R44 (N714, N710; K1929 (2), K1939 (DEC-168 S12, S13), K1946 T2): before it fetches a document, `acquire`
   asks file-scanner's `POST /provider/reputation` (its R25) about the document's public address, through the
   `FILE_SCANNER` binding its caller hands in with the tool spec (file-scanner R21), as it hands in `ownHosts` (R42). The
   answer never refuses, delays or changes the fetch, nor its grade; it is recorded on the receipt and stated in the
   answer, and no answer is recorded as such. At the module's interface, over a scripted network (fixture.mjs) and a
   scanner binding that answers as R25 states and records each request. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, run, text, page, HTML, rendererEnv, wayback, eligible, WB } from "./fixture.mjs";
import { REPUTATION_TIMEOUT_MS } from "../../../src/acquisition/index.mjs";
import { EARNED_CAPTURE_CEILING } from "../../../src/record-grammar/index.mjs";
import { ARCHIVE_CAPTURE_GRADE } from "../../../src/provenance/index.mjs";

const SECOND = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/;
/* a url_reputation spec as the plane sends it (file-scanner R21), its credential a sentinel that must travel nowhere else */
const TOOL = Object.freeze({ provider_id: "cloudflare-intel", tool_id: "cf-intel-1", config: { account_id: "acct" },
                             credentials: { api_token: "SENTINEL-TOKEN" }, handling_confirmed: false });

/* A scanner binding: `answer` is R25's body (or a function of the request, or an Error to throw); `order` is shared with
   the network so a test reads what came first. */
function scanner(answer, order = []) {
  const calls = [];
  return { calls, order, fetch: async (u, init) => {
    const req = { url: String(u), method: init && init.method, body: JSON.parse(init.body) };
    calls.push(req); order.push(["scanner", req.body.address]);
    const a = typeof answer === "function" ? answer(req) : answer;
    if (a instanceof Error) throw a;
    if (a instanceof Response) return a;
    return new Response(JSON.stringify(a), { status: a && a.ok === false ? 400 : 200, headers: { "content-type": "application/json" } });
  } };
}
const LISTED = { ok: true, listed: true, categories: ["phishing", "malware"], risk: "high", source: "cloudflare-intel", lookup_privacy: "cloudflare_account" };
const CLEAN = { ok: true, listed: false, categories: [], risk: null, source: "cloudflare-intel", lookup_privacy: "cloudflare_account" };
/* every network fetch, in order, beside the scanner's */
const logged = (order, routes) => (u, init) => {
  order.push(["fetch", u]);
  const r = typeof routes === "function" ? routes(u, init) : routes[u];
  if (!r) return new Response("not found", { status: 404 });
  return typeof r === "function" ? r(u, init) : r.clone();
};

test("R44: on every arm that fetches a document (direct, Drive, archive, render, capture-request) the scanner is asked once, before the first fetch, about the document's public address, sent that address and the tool spec only; a continuation asks nothing", async () => {
  const link = "https://docs.google.com/document/d/1AbCdEfGhIjKlMnOp/edit";
  const exp = "https://docs.google.com/document/d/1AbCdEfGhIjKlMnOp/export?format=odt";
  const env = rendererEnv({ ok: true, html: HTML("<p>rendered</p>"), elapsed_ms: 5, status: 200, final_url: "https://r.example/p" });
  const arms = [
    ["direct", () => world(), { "https://a.example/x": text("x") }, { locator: "https://a.example/x" }, {}, "https://a.example/x"],
    ["Drive", () => world(), { [exp]: new Response(new Uint8Array([0x50, 0x4b, 3, 4])) }, { locator: link }, {}, link],
    ["archive", async () => { const w = world(); await eligible(w); return w; }, wayback([{ ts: "20240101000000" }]),
     { via: "archive.org", address: "https://gone.example/doc" }, { cls: "admin", member: false }, "https://gone.example/doc"],
    ["render", () => world({ env }), { "https://r.example/p": page(HTML()) }, { locator: "https://r.example/p", render: true }, {}, "https://r.example/p"],
    ["capture-request", () => world(), { "https://c.example/q": text("q") }, {}, { cls: "daemon", member: false, captureRequest: { locator: "https://c.example/q" } }, "https://c.example/q"],
  ];
  for (const [arm, mk, routes, body, o, address] of arms) {
    const w = await mk();
    const order = [];
    const sc = scanner(CLEAN, order);
    const r = await run(w, logged(order, routes), body, { ...o, reputation: TOOL, fileScanner: sc });
    assert.equal(r.status, 200, `${arm}: ${JSON.stringify(r.body).slice(0, 200)}`);
    assert.equal(sc.calls.length, 1, `${arm}: asked once`);
    assert.deepEqual(sc.calls[0], { url: "https://file-scanner/provider/reputation", method: "POST", body: { address, tool: { ...TOOL, config: { ...TOOL.config }, credentials: { ...TOOL.credentials } } } }, arm);
    assert.deepEqual(Object.keys(sc.calls[0].body).sort(), ["address", "tool"], `${arm}: the address and the spec only`);
    assert.equal(order[0][0], "scanner", `${arm}: asked before any fetch`);
    assert.ok(order.some((x) => x[0] === "fetch"), `${arm}: and the fetch went on`);
  }
  /* a continuation fetches no document and asks nothing */
  const w = world();
  const html = HTML('<img src="https://p.example/a.png">');
  const first = await run(w, { "https://p.example/page": page(html) }, { locator: "https://p.example/page", subresources: true });
  w.store.state.sessions.set("cs_x", { session: "cs_x", locator: "https://p.example/page", primarySha: first.body.document.capture.sha256,
                                       primaryFile: "snapshots/page", base: "https://p.example/page", state: null, ticks: 1 });
  const sc = scanner(CLEAN);
  const cont = await run(w, {}, { continue: "cs_x" }, { reputation: TOOL, fileScanner: sc });
  assert.deepEqual([cont.status, sc.calls.length, "reputation" in cont.body], [200, 0, false]);
});

test("R44: a listed address is recorded on the receipt as {tool, listed, categories, checked_at} and stated in the answer the same; it never refuses, changes or grades the capture (negative control: the same capture with no tool files the same bytes at the same grade)", async () => {
  for (const [answer, listed, categories] of [[LISTED, true, ["phishing", "malware"]], [CLEAN, false, []]]) {
    const w = world();
    const r = await run(w, { "https://a.example/x": text("payload") }, { locator: "https://a.example/x" }, { reputation: TOOL, fileScanner: scanner(answer) });
    const want = { tool: "cf-intel-1", listed, categories };
    assert.equal(r.status, 200);
    assert.deepEqual({ ...r.body.reputation, checked_at: undefined }, { ...want, checked_at: undefined });
    assert.match(r.body.reputation.checked_at, SECOND, "this instance's clock, to the second");
    assert.deepEqual(Object.keys(r.body.reputation).sort(), ["categories", "checked_at", "listed", "tool"], "no `unanswered` when answered");
    assert.equal(w.prov.receipts.length, 1);
    assert.deepEqual(w.prov.receipts[0].reputation, r.body.reputation, "the receipt records what the answer states");
    const plain = await run(world(), { "https://a.example/x": text("payload") }, { locator: "https://a.example/x" });
    assert.deepEqual([r.body.document.capture.sha256, r.body.document.capture.grade, r.body.document.provenance_chain.length],
                     [plain.body.document.capture.sha256, EARNED_CAPTURE_CEILING, plain.body.document.provenance_chain.length]);
    assert.equal(plain.body.document.capture.grade, EARNED_CAPTURE_CEILING);
    assert.equal("reputation" in r.body.document, false, "the document itself is unchanged");
  }
  /* the archive arm's grade stays the archive's, listed or not */
  const w = world();
  await eligible(w);
  const a = await run(w, wayback([{ ts: "20240101000000" }]), { via: "archive.org", address: "https://gone.example/doc" },
                      { cls: "admin", member: false, reputation: TOOL, fileScanner: scanner(LISTED) });
  assert.deepEqual([a.status, a.body.document.capture.grade, a.body.reputation.listed, w.prov.receipts[0].reputation.listed], [200, ARCHIVE_CAPTURE_GRADE, true, true]);
});

test("R44: no answer is recorded so, never as listed: false: NO_TOOL (tool null) when none was handed in, the scanner's refusal code, or SCANNER_UNREACHABLE (no binding, a thrown call, an answer that is not R25's, or none within the bound); the capture files each time", async () => {
  const none = (tool, unanswered) => ({ tool, listed: null, categories: [], unanswered });
  const cases = [
    ["no tool", {}, none(null, "NO_TOOL"), 0],
    ["a null tool", { reputation: null, fileScanner: scanner(LISTED) }, none(null, "NO_TOOL"), 0],
    ["a refusal", { reputation: TOOL, fileScanner: scanner({ ok: false, code: "REPUTATION_LIST_STALE" }) }, none("cf-intel-1", "REPUTATION_LIST_STALE"), 1],
    ["a malformed spec", { reputation: { provider_id: "cloudflare-intel" }, fileScanner: scanner({ ok: false, code: "TOOL_SPEC_MALFORMED" }) }, none(null, "TOOL_SPEC_MALFORMED"), 1],
    ["no binding", { reputation: TOOL }, none("cf-intel-1", "SCANNER_UNREACHABLE"), 0],
    ["a thrown call", { reputation: TOOL, fileScanner: scanner(new Error("no such service")) }, none("cf-intel-1", "SCANNER_UNREACHABLE"), 1],
    ["not JSON", { reputation: TOOL, fileScanner: scanner(new Response("<html>", { status: 500 })) }, none("cf-intel-1", "SCANNER_UNREACHABLE"), 1],
    ["not R25's shape", { reputation: TOOL, fileScanner: scanner({ hello: 1 }) }, none("cf-intel-1", "SCANNER_UNREACHABLE"), 1],
  ];
  for (const [what, o, want, calls] of cases) {
    const w = world();
    const sc = o.fileScanner;
    const r = await run(w, { "https://a.example/x": text("x") }, { locator: "https://a.example/x" }, o);
    assert.equal(r.status, 200, what);
    assert.deepEqual({ ...r.body.reputation, checked_at: undefined }, { ...want, checked_at: undefined }, what);
    assert.match(r.body.reputation.checked_at, SECOND, what);
    assert.notEqual(r.body.reputation.listed, false, `${what}: never listed: false`);
    assert.deepEqual(w.prov.receipts[0].reputation, r.body.reputation, what);
    if (sc) assert.equal(sc.calls.length, calls, what);
  }
  /* a scanner that does not answer within the bound: the fetch goes on after it, no later */
  const hang = { fetch: () => new Promise(() => {}) };
  const t0 = Date.now();
  const r = await run(world(), { "https://a.example/x": text("x") }, { locator: "https://a.example/x" }, { reputation: TOOL, fileScanner: hang });
  const took = Date.now() - t0;
  assert.equal(r.body.reputation.unanswered, "SCANNER_UNREACHABLE");
  assert.ok(took >= REPUTATION_TIMEOUT_MS - 50 && took < REPUTATION_TIMEOUT_MS + 3000, `bounded: ${took} ms`);
});

test("R44: the tool and the binding come from the caller (opts) or the store handed in (its `reputation`, `fileScanner`, or its env's FILE_SCANNER), never a body; the spec's credentials and the spec itself reach no answer, receipt or document", async () => {
  /* through the store */
  const w = world({ env: { FILE_SCANNER: scanner(LISTED) } });
  w.store.reputation = TOOL;
  const r = await run(w, { "https://a.example/x": text("x") }, { locator: "https://a.example/x" });
  assert.equal(r.body.reputation.listed, true);
  assert.equal(w.store.env.FILE_SCANNER.calls.length, 1, "the env's FILE_SCANNER binding");
  const w2 = world();
  const sc2 = scanner(CLEAN);
  w2.store.reputation = TOOL; w2.store.fileScanner = sc2;
  assert.equal((await run(w2, { "https://a.example/x": text("x") }, { locator: "https://a.example/x" })).body.reputation.listed, false);
  assert.equal(sc2.calls.length, 1, "the store's fileScanner");
  /* opts win over the store */
  const sc3 = scanner(LISTED);
  const o = await run(w2, { "https://a.example/y": text("y") }, { locator: "https://a.example/y" }, { reputation: null, fileScanner: sc3 });
  assert.deepEqual([o.body.reputation.unanswered, sc3.calls.length], ["NO_TOOL", 0], "the caller's null is the caller's choice");
  /* a body cannot supply either */
  const sc4 = scanner(LISTED);
  const b = await run(world(), { "https://a.example/x": text("x") }, { locator: "https://a.example/x", reputation: TOOL, fileScanner: sc4, FILE_SCANNER: sc4 });
  assert.deepEqual([b.body.reputation.unanswered, sc4.calls.length], ["NO_TOOL", 0]);
  /* nothing of the spec but its tool_id is recorded or answered */
  const w5 = world();
  const r5 = await run(w5, { "https://a.example/x": text("x") }, { locator: "https://a.example/x" }, { reputation: TOOL, fileScanner: scanner(LISTED) });
  for (const [what, v] of [["answer", r5.body], ["receipt", w5.prov.receipts], ["state", w5.store.state]])
    assert.ok(!JSON.stringify(v).includes("SENTINEL-TOKEN") && !JSON.stringify(v).includes("\"account_id\""), what);
});

test("R44: an acquire refused before any fetch asks nothing (a bad locator, one of the group's own hosts); with the scanner answering, every later refusal of the source is unchanged (negative control: SOURCE_REFUSED as without a tool)", async () => {
  for (const [body, o] of [[{ locator: "http://a.example/x" }, {}], [{ locator: "https://own.example/x" }, { ownHosts: ["own.example"] }]]) {
    const sc = scanner(LISTED);
    const r = await run(world(), { "https://own.example/x": text("x") }, body, { ...o, reputation: TOOL, fileScanner: sc });
    assert.equal(r.body.ok, false);
    assert.equal(sc.calls.length, 0, JSON.stringify(body));
  }
  const sc = scanner(LISTED);
  const r = await run(world(), { "https://a.example/x": new Response("no", { status: 403 }) }, { locator: "https://a.example/x" }, { reputation: TOOL, fileScanner: sc });
  const plain = await run(world(), { "https://a.example/x": new Response("no", { status: 403 }) }, { locator: "https://a.example/x" });
  assert.deepEqual(r.body, plain.body, "the source's refusal is the same answer");
  assert.equal(sc.calls.length, 1);
});
