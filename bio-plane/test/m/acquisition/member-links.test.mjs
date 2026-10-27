/* acquisition R123: every HTML capture files its page's own links with no fetching, whether or not supporting files are asked
   (T51; walk-T51-final 06 §9). The interface is `acquire(store, body, opts)` over a scripted network and the store handed in
   (fixture.mjs). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, run, page, HTML } from "./fixture.mjs";
import { normalizeAddress } from "../../../src/subresources.mjs";

const O = "https://hub.example";
const LOC = `${O}/hub.html`;
const HUB = HTML(`<h1>Hub</h1>
<link rel="stylesheet" href="/site.css">
<img src="/chart.png">
<a href="/leaf.html">the leaf</a>
<a href="https://other.example/a">off site one</a>
<a href="https://other.example/b">off site two</a>
<a href="https://third.example/c">off site three</a>
<a href="#top">top</a>`);

/* the scripted source records every request, so "no fetching" is checked against what the source was asked */
const source = (asked) => (u) => {
  const x = new URL(u);
  asked.push(x.href);
  if (x.href === LOC) return page(HUB);
  if (x.pathname === "/site.css") return new Response("body{}", { headers: { "content-type": "text/css" } });
  return new Response("nope", { status: 404 });
};

test("R123: a page captured with no subresources files its five links in their groups, none fetched, one of them a reference to the page itself", async () => {
  const w = world();
  const asked = [];
  const r = await run(w, source(asked), { locator: LOC, project: "p1" });
  assert.equal(r.status, 200);
  /* the receipt's own timestamp and archive requests are not the page's; of the page's hosts, only the page is asked for */
  assert.deepEqual(asked.filter((u) => /^https:\/\/(hub|other|third)\.example\//.test(u)), [LOC], "the page is the only thing its source was asked for");
  assert.equal("subresources" in r.body, false, "the answer is the plain capture's");
  const filed = w.store.state.links;
  assert.equal(filed.length, 1, "one filing for the capture");
  assert.deepEqual([filed[0].sourceCapture, filed[0].capturedAt], [r.body.document.capture.sha256, r.body.document.retrieved]);
  const L = filed[0].links;
  assert.equal(L.length, 5);
  assert.ok(L.every((l) => l.address && l.address_norm === normalizeAddress(l.address)), "each has an address and its resource key");
  assert.deepEqual(L.map((l) => l.type).sort(), ["anchor", "deferred", "deferred", "deferred", "deferred"]);
  const self = L.filter((l) => l.type === "anchor");
  assert.deepEqual(self.map((l) => [l.address_norm, l.fragment]), [[normalizeAddress(LOC), "top"]], "the in-page anchor is the page referring to itself");
  assert.ok(L.some((l) => l.address_norm === normalizeAddress(`${O}/leaf.html`) && l.type === "deferred"));
});

test("R123: the same page with subresources: true files the same links, and the walk still fetches its supporting files", async () => {
  const bare = world(), walked = world();
  const asked = [];
  await run(bare, source([]), { locator: LOC });
  const r = await run(walked, source(asked), { locator: LOC, subresources: true });
  assert.ok(asked.some((u) => u.endsWith("/site.css")), "the walk fetched the stylesheet");
  const key = (w) => w.store.state.links[0].links.map((l) => `${l.type} ${l.address_norm} ${l.fragment}`).sort();
  assert.equal(walked.store.state.links.length, 1, "filed once, not once by each path");
  assert.deepEqual(key(walked), key(bare));
  assert.ok(r.body.subresources.some((s) => s.ok), "the supporting files are held");
});

test("R123: a capture that is not a page files no links, and a failed link filing never fails the capture", async () => {
  const w = world();
  const t = await run(w, { [`${O}/n.txt`]: new Response("a <a href='/x'>x</a>", { headers: { "content-type": "text/plain" } }) }, { locator: `${O}/n.txt` });
  assert.equal(t.status, 200);
  assert.equal(w.store.state.links.length, 0);
  const bk = world(); bk.store.recordLinks = () => { throw new Error("down"); };
  assert.equal((await run(bk, source([]), { locator: LOC })).status, 200);
});
