/* capture-sources: the in-plane renderer (`browserrender.mjs`), tested at the module's
 * interface (build/requirements/capture-sources.md R19–R26). Each test names the
 * requirement id it checks in its title.
 *
 * THE BINDING IS A FAKE, in plain Node: the two endpoints and the transport of
 * `@cloudflare/puppeteer@1.4.0`'s own client (`POST /v1/devtools/browser` answering
 * `{sessionId}`, then an upgrade on `/v1/devtools/browser/<id>` answering a socket), then
 * CDP JSON over that socket. It proves the driver, and nothing about Cloudflare's service.
 * `Runtime.evaluate`'s expression is run against a fake `document`, so the doctype rule
 * is the driver's own code at work, not the fake's.
 *
 * TIME IS THE TEST'S. The driver takes `now`; the clocks below run faster than the wall
 * (SCALE) or jump at a named moment, so a 15 s wait costs under a second and a bound can
 * be spent on purpose. The driver's own polling and CDP timeouts still use real timers. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { renderWithBinding, browserBindingRenderer, RENDER_BLOCKED_REASONS, BODY_CONCURRENCY } from "../../../src/browserrender.mjs";
import { HOST, scaled, later, fakeBinding } from "./fake-binding.mjs";
import { SUBRESOURCE_CAP, SUBRESOURCE_MAX } from "../../../src/subresources.mjs";
import { renderBlock } from "../../../src/render.mjs";
import { word } from "../../../src/setup-words/index.mjs";

/* A clock at scale that jumps forward by `by` ms when `jump()` is called. */
const jumping = () => { const base = scaled(); let extra = 0; const now = () => base() + extra; now.jump = (by) => { extra += by; }; return now; };
/* A clock that moves 1 ms at every read and jumps when told: the time the driver spends is a count of its reads, whatever the machine does. */
const stepping = () => { let t = 1_000_000, extra = 0; const now = () => (t += 1) + extra; now.jump = (by) => { extra += by; }; return now; };

const PAGES = {
  "/same": {
    requests: [
      { url: `https://${HOST}/same`, type: "Document", status: 200, end: "finished", bodyText: "<html>shell</html>" },
      { url: `https://${HOST}/app.js`, type: "Script", status: 200, end: "finished", bodyB64: Buffer.from("x()").toString("base64") },
      { url: `https://${HOST}/sub`, type: "Document", status: 404, end: "finished", frameId: "F2", bodyText: "frame" },
      { url: `https://${HOST}/api.json`, type: "XHR", status: 200, end: "finished", evicted: true },
    ],
    scripts: [{ url: `https://${HOST}/app.js` }, { url: "" }],
  },
  "/mixed": {
    requests: [
      { url: `https://${HOST}/mixed`, type: "Document", status: 200, end: "finished" },
      { url: "https://ads.example/p.gif", type: "Image", end: "blocked", blockedReason: "inspector" },
      { url: `https://${HOST}/missing.json`, type: "XHR", end: "failed" },
      { url: `https://${HOST}/untyped`, end: "finished" },
      { url: `https://${HOST}/r1`, type: "Document", status: 301, end: "redirect", to: `https://${HOST}/r2`, toStatus: 200 },
    ],
    scripts: [],
  },
  "/noload": { requests: [], noLoad: true },
  "/navfail": { navError: "net::ERR_NAME_NOT_RESOLVED" },
  "/navhang": { navHang: true },
  "/noserialise": { noHtml: true },
  "/quirks": { requests: [], doctype: null },
  /* D-570's case: an event stream opened at start and never closed, beside ordinary loads. */
  "/stream": { requests: [
      { url: `https://${HOST}/stream`, type: "Document", status: 200, end: "finished" },
      { url: "https://events.vendor.example/stream", type: "EventSource", end: "pending" },
      { url: `https://${HOST}/data.json`, type: "XHR", status: 200, end: "finished", startAfterMs: 500, lifeMs: 800 },
    ], loadAfterMs: 1000 },
  /* A page that keeps making short requests: it never quiets, by either rule. */
  "/churn": { requests: [{ url: "https://events.vendor.example/stream", type: "EventSource", end: "pending" }], churn: { everyMs: 300, lifeMs: 450 } },
};

const render = (url, over = {}, opts = {}) => renderWithBinding(opts.binding || fakeBinding(PAGES), {
  url: `https://${HOST}${url}`, navigation_timeout_ms: 10000, wait: { until: "networkidle", timeout_ms: 15000 },
  viewport: { width: 1280, height: 800 }, dpr: 1, locale: "fr-CA", timezone: "UTC", ...over }, { now: opts.now || scaled() });

test("R19: a session is opened over the binding's two calls and the answer is R11's shape, observed or null", async () => {
  const b = fakeBinding(PAGES);
  const a = await render("/same", {}, { binding: b });
  assert.equal(a.ok, true);
  assert.deepEqual(Object.keys(a).sort(), ["dpr", "elapsed_ms", "engine", "engine_version", "html", "locale", "navigated_to", "ok",
    "phases_ms", "requests", "scripts", "status", "timezone", "viewport", "wait"]);
  assert.deepEqual([b.stats.acquires, b.stats.upgrades, b.stats.upgradePath], [1, 1, "/v1/devtools/browser/sess-1"]);
  assert.equal(typeof a.elapsed_ms, "number");
  const via = await browserBindingRenderer(fakeBinding(PAGES)).render({ url: `https://${HOST}/same`, wait: { timeout_ms: 1000 } });
  assert.equal(via.ok, true);
  assert.equal(browserBindingRenderer({}).kind, "browser-binding");
  /* Every failure is an answer naming what failed; nothing rejects. */
  const fail = async (mode, re) => { const x = await render("/same", {}, { binding: fakeBinding(PAGES, mode) }); assert.equal(x.ok, false); assert.match(x.error, re); };
  await fail({ noacquire: true }, /refused a session: HTTP 503 no capacity/);
  await fail({ nosessionid: true }, /acquired a session with no sessionId/);
  await fail({ noupgrade: true }, /did not upgrade session sess-1 to a websocket \(HTTP 200\)/);
  await fail({ throws: true }, /binding exploded/);
  const none = await renderWithBinding(null, { url: "https://x.example/" });
  assert.equal(none.ok, false);
  assert.equal(typeof none.error, "string");
});

test("R20: each phase holds its bound (nav default 30000, min 1000; wait default 15000, min 1000) and fails by name", async () => {
  /* The navigation bound, read from what the driver reports when the clock jumps past it
     right after the session opens. */
  const navBound = async (asked) => {
    const now = jumping();
    const b = fakeBinding(PAGES, {}, { "Browser.getVersion": () => now.jump(40000) });
    const a = await render("/same", asked === undefined ? { navigation_timeout_ms: undefined } : { navigation_timeout_ms: asked }, { binding: b, now });
    assert.equal(a.ok, false);
    return a.error;
  };
  assert.match(await navBound(undefined), /the render's navigation \(30000 ms\) bound was spent before it finished/);
  assert.match(await navBound(10000), /navigation \(10000 ms\) bound/);
  assert.match(await navBound(10), /navigation \(1000 ms\) bound/);
  /* A navigation that never commits fails inside the navigation bound, not the wait's. */
  const t0 = Date.now();
  const h = await render("/navhang", { navigation_timeout_ms: 1000, wait: { until: "networkidle", timeout_ms: 60000 } }, { now: () => Date.now() });
  assert.equal(h.ok, false);
  assert.match(h.error, /CDP Page\.navigate did not answer within \d+ ms/);
  assert.ok(Date.now() - t0 < 5000);
  /* The wait: its bound, from the commit, defaulted and floored. */
  for (const [asked, want] of [[undefined, 15000], [4000, 4000], [10, 1000]]) {
    const a = await render("/noload", { wait: { until: "networkidle", timeout_ms: asked } });
    assert.equal(a.wait.fired, "timeout");
    assert.ok(a.elapsed_ms >= want && a.elapsed_ms < want + 4000, `${asked}: ${a.elapsed_ms}`);
  }
  /* The whole render, bodies included, inside navMs + timeoutMs. */
  const w = await render("/noload", { navigation_timeout_ms: 1000, wait: { until: "networkidle", timeout_ms: 1000 } });
  assert.ok(w.elapsed_ms <= 2000 + 500, String(w.elapsed_ms));
});

test("R21: the environment is answered as asked only where the browser accepted it; the engine names itself", async () => {
  const b = fakeBinding(PAGES);
  const a = await render("/same", { viewport: { width: 1024, height: 700 }, dpr: 2, locale: "fr-CA", timezone: "America/Toronto" }, { binding: b });
  assert.deepEqual([a.viewport, a.dpr, a.locale, a.timezone], [{ width: 1024, height: 700 }, 2, "fr-CA", "America/Toronto"]);
  assert.deepEqual(b.stats.asked["Emulation.setLocaleOverride"], { locale: "fr-CA" });
  assert.deepEqual(b.stats.asked["Emulation.setTimezoneOverride"], { timezoneId: "America/Toronto" });
  assert.deepEqual([a.engine, a.engine_version], ["HeadlessChrome", "124.0.6367.207"]);
  const refused = await render("/same", {}, { binding: fakeBinding(PAGES, { refuse: ["Emulation.setDeviceMetricsOverride", "Emulation.setLocaleOverride", "Emulation.setTimezoneOverride"] }) });
  assert.equal(refused.ok, true);
  assert.deepEqual([refused.viewport, refused.dpr, refused.locale, refused.timezone], [null, null, null, null]);
  const unasked = await render("/same", { locale: undefined, timezone: "" });
  assert.deepEqual([unasked.locale, unasked.timezone], [null, null]);
  const whole = await render("/same", {}, { binding: fakeBinding(PAGES, { product: "SomeEngine" }) });
  assert.deepEqual([whole.engine, whole.engine_version], ["SomeEngine", null]);
  const multi = await render("/same", {}, { binding: fakeBinding(PAGES, { product: "Chrome/Headless/141.0" }) });
  assert.deepEqual([multi.engine, multi.engine_version], ["Chrome/Headless", "141.0"]);
  const silent = await render("/same", {}, { binding: fakeBinding(PAGES, { refuse: ["Browser.getVersion"] }) });
  assert.deepEqual([silent.engine, silent.engine_version], [null, null]);
});

test("R22: every request the page made, typed and by outcome; scripts by URL; null when the debugger domain will not enable (R64: the network domain's refusal fails the render)", async () => {
  const a = await render("/mixed");
  const by = Object.fromEntries(a.requests.map((r) => [r.url, r]));
  assert.deepEqual(by["https://ads.example/p.gif"], { url: "https://ads.example/p.gif", type: "image", outcome: "blocked", blocked_by: "inspector" });
  assert.deepEqual(by[`https://${HOST}/missing.json`], { url: `https://${HOST}/missing.json`, type: "xhr", outcome: "failed" });
  assert.equal(by[`https://${HOST}/untyped`].type, "other");
  assert.deepEqual([by[`https://${HOST}/r1`].outcome, by[`https://${HOST}/r1`].status], ["completed", 301]);
  assert.deepEqual([by[`https://${HOST}/r2`].outcome, by[`https://${HOST}/r2`].status], ["completed", 200]);
  assert.equal(a.requests.length, 6);
  const s = await render("/same");
  assert.deepEqual(s.scripts, [{ url: `https://${HOST}/app.js` }]);
  const stream = await render("/stream", { wait: { until: "load", timeout_ms: 15000 } });
  assert.equal(stream.requests.find((r) => r.url.startsWith("https://events.")).outcome, "pending");
  /* R64: the network domain is part of the hold (the socket refusal applies only on an enabled domain), so a render
     whose network domain will not enable fails by name, before any navigation, instead of answering `requests: null`. */
  const nb = fakeBinding(PAGES, { refuse: ["Network.enable"] });
  const noNet = await render("/same", {}, { binding: nb });
  assert.equal(noNet.ok, false);
  assert.match(noNet.error, /would not hold this render's requests \(its network domain would not enable: CDP Network\.enable unavailable\), so nothing was rendered/);
  assert.ok(!nb.stats.calls.includes("Page.navigate"));
  const noDbg = await render("/same", {}, { binding: fakeBinding(PAGES, { refuse: ["Debugger.enable"] }) });
  assert.deepEqual([noDbg.ok, noDbg.scripts, noDbg.requests.length], [true, null, 4]);
});

test("R23: the wait ends on load when asked, on networkidle after load and 500 ms quiet, else on the deadline as an answer", async () => {
  const load = await render("/same", { wait: { until: "load", timeout_ms: 15000 } });
  assert.deepEqual(load.wait, { condition: { until: "load", timeout_ms: 15000 }, fired: "load", ...(load.wait.long_lived ? { long_lived: load.wait.long_lived } : {}) });
  const idle = await render("/same");
  assert.equal(idle.wait.fired, "networkidle");
  assert.ok(idle.elapsed_ms < 5000, String(idle.elapsed_ms));
  const late = await render("/stream", { wait: { until: "networkidle", timeout_ms: 15000 } });
  assert.notEqual(late.wait.fired, "networkidle"); /* a request is always open: never idle */
  const none = await render("/noload");
  assert.deepEqual([none.ok, none.wait.fired], [true, "timeout"]);
});

test("R24: the document and its address from one evaluation, the doctype the document's own, the main frame's status", async () => {
  const a = await render("/same");
  assert.equal(a.html, "<!DOCTYPE html>\n<html><body><main>Rendered /same</main></body></html>");
  assert.equal(a.navigated_to, `https://${HOST}/same`);
  assert.equal(a.status, 200); /* not the subframe document's 404 */
  const q = await render("/quirks");
  assert.equal(q.html, "<html><body><main>Rendered /quirks</main></body></html>");
  const nav = await render("/navfail");
  assert.equal(nav.ok, false);
  assert.match(nav.error, new RegExp(`could not navigate to https://${HOST}/navfail: net::ERR_NAME_NOT_RESOLVED`));
  const doc = await render("/noserialise");
  assert.equal(doc.ok, false);
  assert.match(doc.error, /no serialised document/);
});

test("R25: each completed load's body is collected or its absence stated, nothing hashed, the session closed on every path", async () => {
  const a = await render("/same");
  const by = Object.fromEntries(a.requests.map((r) => [r.url, r]));
  assert.equal(by[`https://${HOST}/app.js`].body_base64, Buffer.from("x()").toString("base64"));
  assert.equal(by[`https://${HOST}/same`].body_text, "<html>shell</html>");
  assert.match(by[`https://${HOST}/api.json`].body_unavailable, /the browser would not give the body: CDP No resource with given identifier found/);
  assert.ok(a.requests.every((r) => !("sha256" in r)));
  const m = await render("/mixed");
  assert.equal(m.requests.find((r) => r.status === 301).body_unavailable, word("browserrender.body_unavailable.redirect_hop_whose"));
  assert.ok(!("body_unavailable" in m.requests.find((r) => r.outcome === "failed")));

  /* Past the count ceiling, over the size ceiling. */
  const many = { requests: Array.from({ length: SUBRESOURCE_CAP + 1 }, (_, i) => ({ url: `https://${HOST}/m${i}`, type: "Image", status: 200, end: "finished", bodyText: "x" })) };
  const big = { requests: [{ url: `https://${HOST}/big`, type: "XHR", status: 200, end: "finished", bodyText: "y".repeat(SUBRESOURCE_MAX + 1) }] };
  const cap = await render("/many", {}, { binding: fakeBinding({ "/many": many }) });
  assert.equal(cap.requests.filter((r) => r.body_text === "x").length, SUBRESOURCE_CAP);
  assert.equal(cap.requests.at(-1).body_unavailable, `past the ${SUBRESOURCE_CAP}-body ceiling`);
  const over = await render("/big", {}, { binding: fakeBinding({ "/big": big }) });
  assert.match(over.requests[0].body_unavailable, new RegExp(`over the ${SUBRESOURCE_MAX}-byte ceiling`));

  /* The time bounds: the collection's own 10,000 ms, and the render's reserved bound. A body still outstanding when
     the phase ends is stated, with the sentence, and the bodies that finished are kept (R68). */
  const stuck = { requests: [0, 1, 2].map((i) => ({ url: `https://${HOST}/t${i}`, type: "XHR", status: 200, end: "finished", bodyText: "z", ...(i === 2 ? { bodyHang: true } : {}) })) };
  const own = await render("/stuck", {}, { binding: fakeBinding({ "/stuck": stuck }) });
  assert.deepEqual(own.requests.map((r) => r.body_text), ["z", "z", undefined]);
  assert.equal(own.requests.at(-1).body_unavailable, "the 10000 ms body-collection bound was spent");
  const reserved = await render("/stuck", { navigation_timeout_ms: 1000, wait: { until: "networkidle", timeout_ms: 1000 } }, { binding: fakeBinding({ "/stuck": stuck }) });
  assert.deepEqual(reserved.requests.map((r) => r.body_text), ["z", "z", undefined]);
  assert.equal(reserved.requests.at(-1).body_unavailable, word("browserrender.text.render_reserved_bound"));

  /* Closed on the succeeding path and on the failing ones. */
  for (const page of ["/same", "/navfail", "/noserialise"]) {
    const b = fakeBinding(PAGES);
    await render(page, {}, { binding: b });
    assert.deepEqual([b.stats.closeTargets, b.stats.browserCloses, b.stats.socketCloses], [1, 1, 1], page);
  }
  const made = fakeBinding(PAGES, { notargets: true });
  const t = await render("/same", {}, { binding: made });
  assert.deepEqual([t.ok, made.stats.asked.createTarget, made.stats.closeTargets], [true, true, 1]);
  /* A session the binding hands out after the open bound expired is closed when it arrives. */
  const slow = fakeBinding(PAGES, { slowUpgradeMs: 1500 });
  const s = await renderWithBinding(slow, { url: `https://${HOST}/same`, navigation_timeout_ms: 1000 }, { now: () => Date.now() });
  assert.equal(s.ok, false);
  assert.match(s.error, /gave no session within the 1000 ms navigation bound/);
  await new Promise((r) => setTimeout(r, 1000));
  assert.equal(slow.stats.lateCloses, 1);
});

test("R26: after load, a quiet window that excludes requests older than the measured N ends the wait, naming them", async () => {
  const a = await render("/stream");
  assert.equal(a.ok, true);
  const ll = a.wait.long_lived;
  assert.ok(ll && typeof ll.older_than_s === "number" && ll.older_than_s > 0, "the answer carries N");
  assert.equal(a.wait.fired, "quiet_excluding_long_lived");
  assert.deepEqual([ll.count, ll.urls], [1, ["https://events.vendor.example/stream"]]);
  /* It waited for the young request, and for the stream to age past N, and no longer. */
  assert.equal(a.requests.find((r) => r.url.endsWith("/data.json")).outcome, "completed");
  assert.ok(a.elapsed_ms >= ll.older_than_s * 1000 && a.elapsed_ms < ll.older_than_s * 1000 + 3000, String(a.elapsed_ms));
  /* A page that never quiets still ends on its timeout, the stream still named. */
  const c = await render("/churn");
  assert.equal(c.wait.fired, "timeout");
  assert.equal(c.wait.long_lived.count, 1);
  /* With nothing open, R23's networkidle ends it, and nothing is named. */
  const idle = await render("/same");
  assert.equal(idle.wait.fired, "networkidle");
  assert.deepEqual([idle.wait.long_lived.count, idle.wait.long_lived.urls], [0, []]);
  /* `until: load` is not overridden by the quiet window. */
  assert.equal((await render("/stream", { wait: { until: "load", timeout_ms: 15000 } })).wait.fired, "load");
});

/* R64 (F19): a page whose scripts ask a literal IP, `localhost`, an `http:` address and the group's own hosts, beside
   addresses that may go; a frame it starts; two sockets. */
const OWN = ["plane.grp.example", ".acct.workers.dev"];
const HOSTILE = {
  "/hostile": {
    requests: [
      { url: `https://${HOST}/hostile`, type: "Document", status: 200, end: "finished" },
      { url: "https://cdn.example.com/ok.js", type: "Script", status: 200, end: "finished", bodyText: "ok()" },
      { url: "https://192.168.0.1/admin", type: "XHR", status: 200, end: "finished" },
      { url: "https://169.254.169.254/latest/meta-data", type: "Fetch", status: 200, end: "finished" },
      { url: "https://localhost/x", type: "XHR", status: 200, end: "finished" },
      { url: "http://data.example.gov/feed", type: "XHR", status: 200, end: "finished" },
      { url: "https://PLANE.grp.example./op?x=1", type: "Fetch", status: 200, end: "finished" },
      { url: "https://agent.acct.workers.dev/run", type: "XHR", status: 200, end: "finished" },
      { url: "https://cdn.example.com/hop", type: "XHR", status: 302, end: "redirect", to: "https://plane.grp.example/in", toStatus: 200 },
      { url: "data:text/plain,hello", type: "Image", status: 200, end: "finished" },
    ],
    sockets: ["wss://events.example.com/s", "ws://chat.example.com/s"],
    child: { requests: [
      { url: "https://10.0.0.1/frame", type: "Document", status: 200, end: "finished" },
      { url: "https://frames.example.com/f", type: "Document", status: 200, end: "finished" },
    ] },
  },
  "/hop": { requests: [], navRedirect: "https://plane.grp.example/in" },
};

test("R64: every request is held in the browser and let go only to a public locator off the group's own hosts", async () => {
  const b = fakeBinding(HOSTILE);
  const a = await render("/hostile", { own_hosts: OWN }, { binding: b });
  assert.equal(a.ok, true);
  /* The hold is on, for every URL, on the page and on the frame it started, before the navigation. */
  assert.deepEqual(b.stats.held.S1.fetch, [{ urlPattern: "*", requestStage: "Request" }]);
  assert.deepEqual(b.stats.held.S1.blockedURLs, ["ws://*", "wss://*"]);
  assert.deepEqual(b.stats.held.S1.autoAttach, { autoAttach: true, waitForDebuggerOnStart: true, flatten: true });
  assert.ok(b.stats.calls.indexOf("Fetch.enable") < b.stats.calls.indexOf("Page.navigate"));
  assert.ok(b.stats.calls.indexOf("Network.setBlockedURLs") < b.stats.calls.indexOf("Page.navigate"));
  assert.deepEqual(b.stats.held.S2.fetch, [{ urlPattern: "*", requestStage: "Request" }]);
  assert.deepEqual(b.stats.held.S2.blockedURLs, ["ws://*", "wss://*"]);
  assert.deepEqual(b.stats.resumed, ["S2"]);
  assert.equal(b.stats.asked.failReason, "BlockedByClient");
  /* Only these were ever sent: the page, the public addresses, the hop's first leg, the frame's public load, and the
     `data:` address, which reaches no host. */
  assert.deepEqual([...b.stats.sent].sort(), [`https://${HOST}/hostile`, `https://${HOST}/hostile`, "https://cdn.example.com/hop",
    "https://cdn.example.com/ok.js", "https://frames.example.com/f", "data:text/plain,hello"].sort());
  /* Each refused one is listed, blocked by its reason, and never answered. */
  const by = Object.fromEntries(a.requests.map((r) => [r.url, r]));
  for (const [url, reason] of [["https://192.168.0.1/admin", "NOT_A_PUBLIC_LOCATOR"], ["https://169.254.169.254/latest/meta-data", "NOT_A_PUBLIC_LOCATOR"],
    ["https://localhost/x", "NOT_A_PUBLIC_LOCATOR"], ["http://data.example.gov/feed", "NOT_A_PUBLIC_LOCATOR"],
    ["https://PLANE.grp.example./op?x=1", "OWN_HOST"], ["https://agent.acct.workers.dev/run", "OWN_HOST"],
    ["https://plane.grp.example/in", "OWN_HOST"], ["https://10.0.0.1/frame", "NOT_A_PUBLIC_LOCATOR"],
    ["wss://events.example.com/s", "NOT_A_PUBLIC_LOCATOR"], ["ws://chat.example.com/s", "NOT_A_PUBLIC_LOCATOR"]]) {
    assert.ok(by[url], url);
    assert.deepEqual([by[url].outcome, by[url].blocked_by], ["blocked", reason], url);
    assert.ok(!("status" in by[url]), url);
  }
  assert.deepEqual([by["https://cdn.example.com/ok.js"].outcome, by["https://frames.example.com/f"].outcome], ["completed", "completed"]);
  assert.equal(by["https://cdn.example.com/hop"].outcome, "completed"); /* the hop let go; its target refused */
  /* R12 counts them. */
  const block = renderBlock(a, { pageUrl: `https://${HOST}/hostile`, shellSha: "0".repeat(64), asked: {}, at: "2026-10-07T00:00:00Z" });
  assert.equal(block.ok, true);
  assert.equal(block.render.requests.blocked, 10);
  assert.deepEqual(block.render.requests.blocked_by, { NOT_A_PUBLIC_LOCATOR: 7, OWN_HOST: 3 });

  /* With no own hosts handed in, the own-host arm refuses nothing (F16 low, K1940); the other arm is unchanged. */
  const open = fakeBinding(HOSTILE);
  const o = await render("/hostile", {}, { binding: open });
  const oby = Object.fromEntries(o.requests.map((r) => [r.url, r]));
  assert.equal(oby["https://agent.acct.workers.dev/run"].outcome, "completed");
  assert.deepEqual([oby["https://192.168.0.1/admin"].outcome, oby["https://192.168.0.1/admin"].blocked_by], ["blocked", "NOT_A_PUBLIC_LOCATOR"]);
});

test("R64: a refused navigation fails naming the address; a render whose hold cannot be enabled fails before any navigation", async () => {
  /* The address asked, refused before a browser is spent on it. */
  for (const [url, reason] of [["https://plane.grp.example/doc", "OWN_HOST"], ["http://portal.example.gov/doc", "NOT_A_PUBLIC_LOCATOR"],
    ["https://127.0.0.1/doc", "NOT_A_PUBLIC_LOCATOR"]]) {
    const b = fakeBinding(HOSTILE);
    const a = await renderWithBinding(b, { url, own_hosts: OWN, wait: { timeout_ms: 1000 } }, { now: scaled() });
    assert.equal(a.ok, false);
    assert.ok(a.error.includes(`could not navigate to ${url}: ${word("browserrender.text.refused_sent", { url, reason, render_blocked_reasons: RENDER_BLOCKED_REASONS[reason] })}`), a.error);
    assert.equal(b.stats.acquires, 0);
    assert.deepEqual(b.stats.sent, []);
  }
  /* A redirect hop of the navigation, refused in the browser, named. */
  const h = fakeBinding(HOSTILE);
  const hop = await render("/hop", { own_hosts: OWN }, { binding: h });
  assert.equal(hop.ok, false);
  assert.match(hop.error, new RegExp(`could not navigate to https://${HOST}/hop: net::ERR_BLOCKED_BY_CLIENT; https://plane\\.grp\\.example/in was refused before it was sent \\(OWN_HOST:`));
  assert.deepEqual(h.stats.sent, [`https://${HOST}/hop`]);
  assert.deepEqual([h.stats.closeTargets, h.stats.browserCloses, h.stats.socketCloses], [1, 1, 1]);
  /* Interception, the socket rule or the frames' hold will not take: failed by name, nothing navigated or sent. */
  for (const method of ["Fetch.enable", "Network.setBlockedURLs", "Target.setAutoAttach"]) {
    const b = fakeBinding(HOSTILE, { refuse: [method] });
    const a = await render("/hostile", { own_hosts: OWN }, { binding: b });
    assert.equal(a.ok, false, method);
    assert.match(a.error, /^the browser would not hold this render's requests \(request interception could not be enabled: .*\), so nothing was rendered$/, method);
    assert.ok(!b.stats.calls.includes("Page.navigate"), method);
    assert.deepEqual(b.stats.sent, [], method);
    assert.deepEqual([b.stats.closeTargets, b.stats.browserCloses, b.stats.socketCloses], [1, 1, 1], method);
  }
  /* A frame whose own hold will not take is never resumed, so it sends nothing; the page's render stands. */
  const c = fakeBinding(HOSTILE, { refuseOn: { S2: ["Fetch.enable"] } });
  const ca = await render("/hostile", { own_hosts: OWN }, { binding: c });
  assert.equal(ca.ok, true);
  assert.deepEqual(c.stats.resumed, []);
  assert.ok(!c.stats.sent.includes("https://frames.example.com/f"));
});

/* R68 (fix round 3, C13, P5): the page of twenty sub-resources that each take a second to give their body. */
const SLOW = (n, over = {}) => ({ requests: [
  { url: `https://${HOST}/slow`, type: "Document", status: 200, end: "finished", bodyText: "<html>shell</html>" },
  ...Array.from({ length: n }, (_, i) => ({ url: `https://${HOST}/s${i}.js`, type: "Script", status: 200, end: "finished", bodyText: `s${i}`, bodyMs: 1000 })),
], loadAfterMs: 2000, ...over });

test("R68: the bodies of twenty slow sub-resources are collected several at a time and from the start of the load, inside the bound", async () => {
  const b = fakeBinding({ "/slow": SLOW(20) });
  const a = await render("/slow", { navigation_timeout_ms: 10000, wait: { until: "networkidle", timeout_ms: 15000 } }, { binding: b });
  assert.equal(a.ok, true);
  /* Every body was kept; none is missing, none filled. */
  assert.equal(a.requests.filter((r) => typeof r.body_text === "string").length, 21);
  assert.ok(a.requests.every((r) => !("body_unavailable" in r)));
  /* Several at a time, never past the handful the module names. */
  assert.ok(b.stats.maxBodyActive >= 2 && b.stats.maxBodyActive <= BODY_CONCURRENCY, String(b.stats.maxBodyActive));
  /* From the start of the load: the first body was asked for before the document was taken. */
  assert.ok(b.stats.calls.indexOf("Network.getResponseBody") < b.stats.calls.indexOf("Runtime.evaluate"));
  /* The body phase took less than the sum of the bodies' times (20 s of the test's clock), the render ends inside
     navMs + timeoutMs, and the four phases are stated as whole milliseconds. */
  const p = a.phases_ms;
  assert.deepEqual(Object.keys(p), ["session", "load", "quiet", "bodies"]);
  assert.ok(Object.values(p).every((v) => Number.isInteger(v) && v >= 0), JSON.stringify(p));
  assert.ok(p.bodies < 20000 / 2, JSON.stringify(p));
  assert.ok(a.elapsed_ms < 25000, String(a.elapsed_ms));
  assert.ok(p.load >= 2000 - 100, JSON.stringify(p)); /* the load event was fired 2 s after the navigation */
  assert.ok(p.session + p.load + p.quiet + p.bodies <= a.elapsed_ms + 50, JSON.stringify(p));
});

test("R68: a body still outstanding at the cap is body_unavailable with its sentence, the bodies that finished are kept, and a phase not reached is null", async () => {
  /* Three bodies that never come, among ones that do: the phase ends at the bound and says so, once. */
  const page = SLOW(4);
  page.requests[2].bodyHang = true; page.requests[3].bodyHang = true;
  const a = await render("/slow2", { navigation_timeout_ms: 1000, wait: { until: "load", timeout_ms: 3000 } }, { binding: fakeBinding({ "/slow2": page }) });
  assert.equal(a.ok, true);
  const by = Object.fromEntries(a.requests.map((r) => [r.url, r]));
  assert.equal(by[`https://${HOST}/s0.js`].body_text, "s0");
  for (const u of ["s1", "s2"]) {
    assert.equal(by[`https://${HOST}/${u}.js`].body_text, undefined);
    assert.equal(by[`https://${HOST}/${u}.js`].body_unavailable, word("browserrender.text.render_reserved_bound"));
  }
  assert.ok(a.elapsed_ms <= 1000 + 3000 + 500, String(a.elapsed_ms));
  /* A load event that never fired: the load phase ran to the end of the wait, and the quiet wait was not reached. */
  const none = await render("/noload", { wait: { until: "networkidle", timeout_ms: 1000 } });
  assert.equal(none.phases_ms.quiet, null);
  assert.ok(none.phases_ms.load >= 900, JSON.stringify(none.phases_ms));
});

/* The red of one run in three (SUITE #2): the test's clock runs 20 times the wall, so two reads either side of a phase that did no
   work differed by 20 ms whenever a real millisecond fell between them. A clock that moves 20 ms on every read makes that the
   certain case: a phase that did no work is stated 0 whatever the clock does; a phase that waited is stated as it was. */
test("R68: the body phase is stated 0 when nothing was waited for, on a clock that moves at every read, and as waited when a body was", async () => {
  const everyRead = () => { let t = 1_000_000; return () => (t += 20); };
  const idle = await render("/quirks", {}, { now: everyRead() });
  assert.equal(idle.ok, true);
  assert.equal(idle.phases_ms.bodies, 0);
  const waited = await render("/slow", { wait: { until: "load", timeout_ms: 3000 } }, { binding: fakeBinding({ "/slow": SLOW(2, { loadAfterMs: 0 }) }) });
  assert.equal(waited.ok, true);
  assert.ok(waited.phases_ms.bodies > 0, JSON.stringify(waited.phases_ms));
});

test("R68 control: a page with no sub-resources states the four phases, a zero body phase, and every other field as before", async () => {
  const a = await render("/quirks");
  assert.equal(a.ok, true);
  assert.deepEqual(Object.keys(a.phases_ms), ["session", "load", "quiet", "bodies"]);
  assert.equal(a.phases_ms.bodies, 0);
  assert.ok(Number.isInteger(a.phases_ms.quiet));
  assert.deepEqual(a.requests, []);
  assert.equal(a.html, "<html><body><main>Rendered /quirks</main></body></html>");
  assert.equal(a.wait.fired, "networkidle");
  assert.ok(a.elapsed_ms < 5000);
  /* The ceilings are held in the order the loads completed whatever the concurrency. */
  const many = { requests: Array.from({ length: SUBRESOURCE_CAP + 10 }, (_, i) => ({ url: `https://${HOST}/m${i}`, type: "Image", status: 200, end: "finished", bodyText: "x", bodyMs: i < 50 ? 100 : 0 })) };
  const cap = await render("/many", {}, { binding: fakeBinding({ "/many": many }) });
  assert.equal(cap.requests.filter((r) => r.body_text === "x").length, SUBRESOURCE_CAP);
  assert.equal(cap.requests.filter((r) => typeof r.body_unavailable === "string").length, 10);
});

test("R68 R8 (C13a, P7): a page of 33 bodies rendered by the real driver and kept by keepRenderBodies against a store charging 0.27 s a trip: the bodies are collected and kept in under 6 s, each digest in its request's place", async () => {
  const { keepRenderBodies } = await import("../../../src/render.mjs");
  const { createHash } = await import("node:crypto");
  const page = { requests: Array.from({ length: 33 }, (_, i) => ({ url: `https://${HOST}/s${i}.js`, type: "Script", status: 200, end: "finished", bodyText: `body ${i} `.padEnd(2000, "x") })) };
  const held = new Map();
  const trip = () => new Promise((r) => setTimeout(r, 270));
  const t0 = Date.now();
  const a = await render("/zion", {}, { binding: fakeBinding({ "/zion": page }) });
  const out = await keepRenderBodies(a, {
    sha256: async (b) => createHash("sha256").update(b).digest("hex"),
    put: async (d, b) => { await trip(); if (held.has(d)) return; await trip(); held.set(d, b); } });
  const took = Date.now() - t0;
  assert.ok(took < 6000, `${took} ms`);
  a.requests.forEach((r, i) => {
    assert.equal(out[i].sha256, createHash("sha256").update(r.body_text).digest("hex"), `request ${i}`);
    assert.ok(held.has(out[i].sha256));
  });
});

/* R69 (fix round 9, G137c, X23): a failed render states what it took and whether it may be asked again. */
test("R69: every failed answer carries elapsed_ms (the close included), failure_class and detail; a session refused, rate-limited or not opened in time is transient, the rest permanent", async () => {
  const failed = async (url, binding, over = {}, opts = {}) => {
    const a = await render(url, over, { binding, ...opts });
    assert.equal(a.ok, false);
    assert.equal(Number.isInteger(a.elapsed_ms) && a.elapsed_ms >= 0, true, JSON.stringify(a));
    assert.equal(typeof a.detail, "string");
    assert.ok(a.detail.length <= 200 && a.detail === a.error.slice(0, 200));
    return a;
  };
  /* transient: the binding refused a session, three a second, the open bound spent, an upgrade refused for load */
  for (const mode of [{ noacquire: true }, { noacquire: true, acquireStatus: 429 }])
    assert.equal((await failed("/same", fakeBinding(PAGES, mode))).failure_class, "transient", JSON.stringify(mode));
  const slow = await failed("/same", fakeBinding(PAGES, { slowUpgradeMs: 1500 }), { navigation_timeout_ms: 1000 }, { now: () => Date.now() });
  assert.equal(slow.failure_class, "transient");
  assert.match(slow.detail, /gave no session within the 1000 ms navigation bound/);
  /* permanent: a session with no id, no websocket, a throwing binding, a page crash, an unreachable host, no document, the hold refused */
  for (const [url, mode] of [["/same", { nosessionid: true }], ["/same", { noupgrade: true }], ["/same", { throws: true }],
    ["/navfail", {}], ["/noserialise", {}], ["/same", { refuse: ["Network.enable"] }], ["/hostile", { refuse: ["Fetch.enable"] }]])
    assert.equal((await failed(url, fakeBinding({ ...PAGES, ...HOSTILE }, mode), { own_hosts: OWN })).failure_class, "permanent", url + JSON.stringify(mode));
  /* an address the hold refuses is refused before a browser is spent: nothing to charge (a clock that does not move: no time passed) */
  const refused = await renderWithBinding(fakeBinding(PAGES), { url: "https://plane.grp.example/doc", own_hosts: OWN }, { now: () => 1_000_000 });
  assert.deepEqual([refused.ok, refused.failure_class, refused.elapsed_ms], [false, "permanent", 0]);
  /* the binding is nothing at all */
  const none = await renderWithBinding(null, { url: "https://x.example/" });
  assert.deepEqual([none.ok, none.failure_class, typeof none.elapsed_ms], [false, "permanent", "number"]);
  /* the real time: whole milliseconds from the session's opening to its close, the close included (the close takes 1,500 ms of the test's clock) */
  const now = stepping();
  const closing = fakeBinding(PAGES, {}, { "Target.closeTarget": () => now.jump(1500) });
  const nav = await render("/navfail", {}, { binding: closing, now });
  assert.equal(nav.ok, false);
  assert.ok(nav.elapsed_ms >= 1500 && nav.elapsed_ms < 1500 + 4000, String(nav.elapsed_ms));
  assert.equal(closing.stats.closeTargets, 1);
  /* control: a render that succeeds is answered as R19 states, with none of the failure's fields */
  const ok = await render("/same");
  assert.equal(ok.ok, true);
  assert.ok(!("failure_class" in ok) && !("detail" in ok) && !("error" in ok));
});

test("R69: a dialog the page opens is dismissed, so the render goes on to its document and not to its bound", async () => {
  const b = fakeBinding({ "/dialog": { requests: [], dialog: true } });
  const a = await render("/dialog", {}, { binding: b });
  assert.equal(a.ok, true);
  assert.deepEqual(b.stats.asked.dialog, { accept: false });
});

test("R26 (G142, X33): a render of a page that holds one long-lived request open waits the quiet window, 4 s of the test's own clock counted as settle polls, and answers quiet_excluding_long_lived; a page with none ends on networkidle", async () => {
  /* The test's clock: it moves 20 ms each time the driver reads it, so the time the driver spends is a count of its reads (its settle
     polls and the checks inside them), and a 4 s window is about 200 reads whatever the machine does. */
  const counting = () => { let t = 1_000_000, reads = 0; const now = () => { reads++; return (t += 20); }; now.reads = () => reads; return now; };
  const stream = counting();
  const a = await render("/stream", {}, { now: stream });
  assert.equal(a.ok, true);
  assert.equal(a.wait.fired, "quiet_excluding_long_lived");
  assert.equal(a.wait.long_lived.older_than_s, 4);
  assert.deepEqual([a.wait.long_lived.count, a.wait.long_lived.urls], [1, ["https://events.vendor.example/stream"]]);
  /* it did not end before the stream was 4 s old, and it waited the 500 ms of quiet after that */
  assert.ok(a.elapsed_ms >= 4000 + 500 - 100, `${a.elapsed_ms} ms of the test's clock`);
  assert.ok(stream.reads() >= (4000 + 500 - 100) / 20, `${stream.reads()} reads`);
  /* control: nothing open ends on networkidle (R23) long before the window */
  const quiet = counting();
  const idle = await render("/same", {}, { now: quiet });
  assert.equal(idle.wait.fired, "networkidle");
  assert.ok(idle.elapsed_ms < 4000, String(idle.elapsed_ms));
  assert.ok(quiet.reads() < stream.reads() / 4, `${quiet.reads()} reads against ${stream.reads()}`);
});
