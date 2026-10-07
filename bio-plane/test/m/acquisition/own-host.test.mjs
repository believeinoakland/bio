/* acquisition R42 (F16; K1881): no fetch this module makes goes to one of the group's own hosts. `acquire`, `keyedFetch`
   and the render arm take `ownHosts` (capture-sources R65's list: host names, and `.suffix` entries standing for every
   host under them) from their caller, beside the store handed in, and refuse before any request. At the module's
   interface, over a scripted network (fixture.mjs). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, run, text, page, HTML, rendererEnv } from "./fixture.mjs";
import { ARCHIVE_CHECKS, keyedFetch, citationLookup } from "../../../src/acquisition/index.mjs";

const OWN = ["civic.example.org", ".acct.workers.dev"];
const ROW = [ARCHIVE_CHECKS.OWN_HOST_REFUSED.check, ARCHIVE_CHECKS.OWN_HOST_REFUSED.translation];

test("R42: acquire refuses a locator on one of the group's own hosts before any request, OWN_HOST_REFUSED with its row naming the host; nothing is fetched or filed", async () => {
  for (const loc of ["https://civic.example.org/x", "https://CIVIC.example.org./x", "https://plane.acct.workers.dev/a", "https://civic.example.org:8443/x"]) {
    const w = world();
    const r = await run(w, { [loc]: text("x") }, { locator: loc }, { ownHosts: OWN });
    assert.deepEqual([r.status, r.body.ok, r.body.reason, r.body.code, r.body.check, r.body.translation], [403, false, "OWN_HOST_REFUSED", "OWN_HOST_REFUSED", ...ROW], loc);
    assert.equal(r.body.host, new URL(loc).hostname);
    assert.deepEqual([r.net.seen.length, w.prov.receipts.length, w.b.calls.filter((c) => c[0] === "put").length], [0, 0, 0], loc);
  }
  /* the render arm too, before its admission */
  const env = rendererEnv({ ok: true, html: HTML(), elapsed_ms: 5 });
  const w = world({ env });
  const r = await run(w, {}, { locator: "https://civic.example.org/page", render: true }, { ownHosts: OWN });
  assert.equal(r.body.reason, "OWN_HOST_REFUSED");
  assert.deepEqual([env.calls.length, w.store.state.admits.length], [0, 0]);
  /* negative controls: another host is fetched; a parent of a suffix entry and a look-alike are not own hosts */
  for (const loc of ["https://other.example/x", "https://acct.workers.dev/x", "https://civic.example.org.evil.example/x"]) {
    const ok = await run(world(), { [loc]: text("x") }, { locator: loc }, { ownHosts: OWN });
    assert.equal(ok.status, 200, loc);
  }
});

test("R42: the list comes from the caller (opts) or the store handed in; with none given, nothing is refused on this ground", async () => {
  const loc = "https://civic.example.org/x";
  const w = world();
  w.store.ownHosts = OWN;
  const viaStore = await run(w, { [loc]: text("x") }, { locator: loc });
  assert.equal(viaStore.body.reason, "OWN_HOST_REFUSED");
  const none = await run(world(), { [loc]: text("x") }, { locator: loc });
  assert.equal(none.status, 200, "no ownHosts, no refusal on this ground");
  const empty = await run(world(), { [loc]: text("x") }, { locator: loc }, { ownHosts: [] });
  assert.equal(empty.status, 200);
});

test("R42: a redirect to one of the group's own hosts is not followed: the acquire answers the same refusal and nothing at the target is fetched; a redirect elsewhere is followed by hand and filed", async () => {
  const w = world();
  const r = await run(w, { "https://pub.example/a": () => new Response("", { status: 302, headers: { location: "https://x.acct.workers.dev/secret" } }) },
    { locator: "https://pub.example/a" }, { ownHosts: OWN });
  assert.deepEqual([r.status, r.body.reason, r.body.host, r.body.redirected_from, r.body.status], [403, "OWN_HOST_REFUSED", "x.acct.workers.dev", "https://pub.example/a", 302]);
  assert.deepEqual(r.net.seen.map((x) => x.url), ["https://pub.example/a"], "the own host is never asked");
  assert.equal(r.net.seen[0].init.redirect, "manual");
  assert.equal(w.prov.receipts.length, 0);
  /* negative control: a redirect to a public host is followed, hop by hop, and the capture is filed at where it resolved */
  const ok = await run(world(), { "https://pub.example/a": () => new Response("", { status: 301, headers: { location: "https://pub.example/b" } }),
                                  "https://pub.example/b": text("moved here") }, { locator: "https://pub.example/a" }, { ownHosts: OWN });
  assert.equal(ok.status, 200);
  assert.deepEqual(ok.net.seen.map((x) => x.url), ["https://pub.example/a", "https://pub.example/b"]);
  assert.deepEqual([ok.body.document.capture.transport.resolved, ok.body.document.capture.transport.redirected], ["https://pub.example/b", true]);
});

test("R42 R19: a supporting file on one of the group's own hosts is that file's outcome, OWN_HOST_REFUSED, never fetched; the capture goes on", async () => {
  const w = world();
  /* a stylesheet is fetched across hosts (a cross-host image is left out as third-party before any fetch is asked) */
  const html = HTML('<link rel="stylesheet" href="https://civic.example.org/s.css"><img src="https://pub.example/pic.png">');
  const r = await run(w, { "https://pub.example/page": page(html), "https://pub.example/pic.png": new Response(new Uint8Array([1, 2, 3]), { headers: { "content-type": "image/png" } }),
                           "https://civic.example.org/s.css": new Response("own") },
    { locator: "https://pub.example/page", subresources: true }, { ownHosts: OWN });
  assert.equal(r.status, 200);
  assert.ok(!r.net.seen.some((x) => x.url.includes("civic.example.org")), "the own host is never asked");
  const own = r.body.subresources.find((s) => s.url === "https://civic.example.org/s.css");
  assert.deepEqual([own.ok, own.fetch_reason], [false, "OWN_HOST_REFUSED"]);
  assert.equal(r.body.subresources.find((s) => s.url === "https://pub.example/pic.png").ok, true, "the others are captured");
  /* a supporting file redirecting to an own host is refused the same way, the redirect followed by hand */
  const w2 = world();
  const html2 = HTML('<img src="https://pub.example/hop.png">');
  const r2 = await run(w2, { "https://pub.example/page": page(html2), "https://pub.example/hop.png": () => new Response("", { status: 302, headers: { location: "https://a.acct.workers.dev/x.png" } }) },
    { locator: "https://pub.example/page", subresources: true }, { ownHosts: OWN });
  assert.equal(r2.body.subresources[0].fetch_reason, "OWN_HOST_REFUSED");
  assert.ok(!r2.net.seen.some((x) => x.url.includes("workers.dev")));
});

test("R42: a render is handed the group's own hosts as `own_hosts` (capture-sources R64), and none when none were given", async () => {
  const env = rendererEnv({ ok: true, html: HTML("<p>rendered</p>"), elapsed_ms: 5, status: 200, final_url: "https://pub.example/p" });
  const r = await run(world({ env }), { "https://pub.example/p": page(HTML()) }, { locator: "https://pub.example/p", render: true }, { ownHosts: OWN });
  assert.deepEqual(env.calls[0].own_hosts, OWN);
  const env2 = rendererEnv({ ok: true, html: HTML("<p>rendered</p>"), elapsed_ms: 5, status: 200, final_url: "https://pub.example/p" });
  await run(world({ env: env2 }), { "https://pub.example/p": page(HTML()) }, { locator: "https://pub.example/p", render: true });
  assert.equal("own_hosts" in env2.calls[0], false);
  assert.ok(r.status === 200 || r.status === 502, "the render arm ran");
});

test("R42 R36: keyedFetch refuses a request to one of the group's own hosts before the key is read or anything is sent; citationLookup passes the list on", async () => {
  let asked = 0;
  const store = { credentials: { keyedServiceFor: async () => { asked++; return { ok: true, key: "SENTINEL-KEY" }; } } };
  const r = await keyedFetch(store, { service: "courtlistener", request: { url: "https://www.courtlistener.com/api/x" }, viewer: "member:m1",
                                      ownHosts: ["www.courtlistener.com"] });
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation, r.host], [false, "OWN_HOST_REFUSED", "OWN_HOST_REFUSED", ...ROW, "www.courtlistener.com"]);
  assert.equal(asked, 0, "no key read, nothing sent");
  const c = await citationLookup({ ...store, ownHosts: [".courtlistener.com"] }, { text: "410 U.S. 113", viewer: "member:m1" });
  assert.equal(c.reason, "OWN_HOST_REFUSED", "through the store's list");
  assert.ok(!JSON.stringify([r, c]).includes("SENTINEL-KEY"));
  /* negative control: with no own host named, the request proceeds to the key */
  const orig = globalThis.fetch;
  globalThis.fetch = async () => new Response("[]", { headers: { "content-type": "application/json" } });
  try {
    const ok = await keyedFetch(store, { service: "courtlistener", request: { url: "https://www.courtlistener.com/api/x" }, viewer: "member:m1", ownHosts: OWN });
    assert.equal(ok.ok, true);
  } finally { globalThis.fetch = orig; }
});
