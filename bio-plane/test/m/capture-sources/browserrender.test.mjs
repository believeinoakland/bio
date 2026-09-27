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
import { renderWithBinding, browserBindingRenderer } from "../../../src/browserrender.mjs";
import { SUBRESOURCE_CAP, SUBRESOURCE_MAX } from "../../../src/subresources.mjs";

const HOST = "portal.example.gov";
const SCALE = 20;
const scaled = () => { const t0 = Date.now(); return () => t0 + (Date.now() - t0) * SCALE; };
/* A clock at scale that jumps forward by `by` ms when `jump()` is called. */
const jumping = () => { const base = scaled(); let extra = 0; const now = () => base() + extra; now.jump = (by) => { extra += by; }; return now; };
const later = (fakeMs, fn) => setTimeout(fn, Math.max(0, fakeMs / SCALE));

/* The fake browser. `pages` maps a pathname to what the page does; `mode` bends the
   browser's own behaviour. `stats` counts sessions and closes; `on` lets a test act at
   a named CDP call (to jump a clock). */
function fakeBinding(pages, mode = {}, on = {}) {
  const stats = { acquires: 0, upgrades: 0, closeTargets: 0, browserCloses: 0, socketCloses: 0, lateCloses: 0, calls: [], asked: {} };
  const socket = () => {
    const ls = { message: [], close: [] };
    let closed = false, page = null, key = null;
    const timers = [];
    const deliver = (obj) => setImmediate(() => { if (!closed) for (const f of ls.message) f({ data: JSON.stringify(obj) }); });
    const ev = (method, params) => deliver({ method, params, sessionId: "S1" });
    const ws = {
      accept() {},
      addEventListener(t, f) { ls[t].push(f); },
      close() { if (closed) return; closed = true; stats.socketCloses++; timers.forEach(clearTimeout); for (const f of ls.close) f({}); },
      send(raw) {
        const m = JSON.parse(raw);
        stats.calls.push(m.method);
        if (on[m.method]) on[m.method](m);
        const ok = (result) => deliver({ id: m.id, result });
        const err = (message) => deliver({ id: m.id, error: { message } });
        const refuse = (mode.refuse || []).includes(m.method);
        switch (m.method) {
          case "Browser.getVersion": return refuse ? err("no version") : ok({ product: mode.product ?? "HeadlessChrome/124.0.6367.207" });
          case "Target.getTargets": return ok({ targetInfos: mode.notargets ? [] : [{ targetId: "T1", type: "page" }] });
          case "Target.createTarget": stats.asked.createTarget = true; return ok({ targetId: "T-made" });
          case "Target.attachToTarget": return ok({ sessionId: "S1" });
          case "Emulation.setDeviceMetricsOverride": case "Emulation.setLocaleOverride": case "Emulation.setTimezoneOverride":
            stats.asked[m.method] = m.params; return refuse ? err("override refused") : ok({});
          case "Network.enable": case "Page.enable": case "Debugger.enable": return refuse ? err(`${m.method} unavailable`) : ok({});
          case "Page.navigate": {
            key = new URL(m.params.url).pathname; page = pages[key] || { requests: [], scripts: [] };
            if (page.navHang) return;
            if (page.navError) return ok({ frameId: "F1", errorText: page.navError });
            ok({ frameId: "F1", loaderId: "L1" });
            const rs = page.requests || [];
            rs.forEach((r, i) => timers.push(later(r.startAfterMs || 0, () => {
              const id = "R" + i;
              ev("Network.requestWillBeSent", { requestId: id, request: { url: r.url }, type: r.type, frameId: r.frameId || "F1" });
              if (r.end === "redirect") {
                ev("Network.requestWillBeSent", { requestId: id, request: { url: r.to }, type: r.type, frameId: "F1", redirectResponse: { status: r.status } });
                ev("Network.responseReceived", { requestId: id, type: r.type, frameId: "F1", response: { status: r.toStatus } });
                ev("Network.loadingFinished", { requestId: id });
                return;
              }
              const end = () => {
                if (typeof r.status === "number") ev("Network.responseReceived", { requestId: id, type: r.type, frameId: r.frameId || "F1", response: { status: r.status } });
                if (r.end === "finished") ev("Network.loadingFinished", { requestId: id });
                if (r.end === "failed") ev("Network.loadingFailed", { requestId: id, errorText: "net::ERR_FAILED" });
                if (r.end === "blocked") ev("Network.loadingFailed", { requestId: id, blockedReason: r.blockedReason });
              };
              if (r.lifeMs) timers.push(later(r.lifeMs, end)); else end();
            })));
            /* A page that keeps starting short requests: never quiet. */
            if (page.churn) {
              let n = 0;
              const tick = () => { const id = "C" + n++; ev("Network.requestWillBeSent", { requestId: id, request: { url: `https://${HOST}/poll?${n}` }, type: "XHR", frameId: "F1" });
                timers.push(later(page.churn.lifeMs, () => ev("Network.loadingFinished", { requestId: id }))); timers.push(later(page.churn.everyMs, tick)); };
              timers.push(later(page.churn.startAfterMs || 0, tick));
            }
            for (const s of page.scripts || []) ev("Debugger.scriptParsed", { url: s.url, scriptId: "s" });
            if (!page.noLoad) timers.push(later(page.loadAfterMs || 0, () => ev("Page.loadEventFired", { timestamp: 1 })));
            return;
          }
          case "Network.getResponseBody": {
            if (page && page.bodyHang) return;
            const r = page && (page.requests || [])[Number(String(m.params.requestId).slice(1))];
            if (!r || r.evicted || (r.bodyText === undefined && r.bodyB64 === undefined)) return err("No resource with given identifier found");
            return r.bodyB64 !== undefined ? ok({ body: r.bodyB64, base64Encoded: true }) : ok({ body: r.bodyText, base64Encoded: false });
          }
          case "Runtime.evaluate": {
            if (page && page.noHtml) return ok({ result: { value: undefined } });
            const document = { doctype: page && page.doctype === null ? null : { name: (page && page.doctype) || "html" },
                               documentElement: { outerHTML: `<html><body><main>Rendered ${key}</main></body></html>` } };
            const location = { href: `https://${HOST}${(page && page.landed) || key}` };
            // eslint-disable-next-line no-new-func
            return ok({ result: { value: new Function("document", "location", `return ${m.params.expression}`)(document, location) } });
          }
          case "Target.closeTarget": stats.closeTargets++; return ok({});
          case "Browser.close": stats.browserCloses++; return ok({});
          default: return err("unknown method " + m.method);
        }
      },
    };
    return ws;
  };
  return {
    stats,
    async fetch(url, init = {}) {
      const u = new URL(url);
      if (mode.throws) throw new Error("binding exploded");
      if ((init.headers || {}).Upgrade === "websocket") {
        if (mode.noupgrade) return { status: 200 };
        stats.upgrades++;
        stats.upgradePath = u.pathname;
        const ws = socket();
        if (mode.slowUpgradeMs) { await new Promise((r) => setTimeout(r, mode.slowUpgradeMs)); const c = ws.close; ws.close = () => { stats.lateCloses++; c(); }; }
        return { status: 101, webSocket: ws };
      }
      if (init.method === "POST" && u.pathname === "/v1/devtools/browser") {
        stats.acquires++;
        if (mode.noacquire) return { status: 503, text: async () => "no capacity", json: async () => ({}) };
        return { status: 200, json: async () => (mode.nosessionid ? { ok: true } : { sessionId: "sess-" + stats.acquires }), text: async () => "" };
      }
      return { status: 404, text: async () => "unexpected" };
    },
  };
}

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
    "requests", "scripts", "status", "timezone", "viewport", "wait"]);
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

test("R22: every request the page made, typed and by outcome; scripts by URL; null when a domain will not enable", async () => {
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
  const noNet = await render("/same", {}, { binding: fakeBinding(PAGES, { refuse: ["Network.enable"] }) });
  assert.deepEqual([noNet.ok, noNet.requests, noNet.scripts.length], [true, null, 1]);
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
  assert.equal(m.requests.find((r) => r.status === 301).body_unavailable, "a redirect hop, whose body the browser does not keep");
  assert.ok(!("body_unavailable" in m.requests.find((r) => r.outcome === "failed")));

  /* Past the count ceiling, over the size ceiling. */
  const many = { requests: Array.from({ length: SUBRESOURCE_CAP + 1 }, (_, i) => ({ url: `https://${HOST}/m${i}`, type: "Image", status: 200, end: "finished", bodyText: "x" })) };
  const big = { requests: [{ url: `https://${HOST}/big`, type: "XHR", status: 200, end: "finished", bodyText: "y".repeat(SUBRESOURCE_MAX + 1) }] };
  const cap = await render("/many", {}, { binding: fakeBinding({ "/many": many }) });
  assert.equal(cap.requests.filter((r) => r.body_text === "x").length, SUBRESOURCE_CAP);
  assert.equal(cap.requests.at(-1).body_unavailable, `past the ${SUBRESOURCE_CAP}-body ceiling`);
  const over = await render("/big", {}, { binding: fakeBinding({ "/big": big }) });
  assert.match(over.requests[0].body_unavailable, new RegExp(`over the ${SUBRESOURCE_MAX}-byte ceiling`));

  /* The time bounds: the collection's own 10,000 ms, and the render's reserved bound. */
  const two = { requests: [0, 1, 2].map((i) => ({ url: `https://${HOST}/t${i}`, type: "XHR", status: 200, end: "finished", bodyText: "z" })) };
  const now = jumping();
  const own = await render("/two", {}, { binding: fakeBinding({ "/two": two }, {}, { "Network.getResponseBody": () => now.jump(11000) }), now });
  assert.equal(own.requests.at(-1).body_unavailable, "the 10000 ms body-collection bound was spent");
  const now2 = jumping();
  const reserved = await render("/two", { navigation_timeout_ms: 1000, wait: { until: "networkidle", timeout_ms: 1000 } },
    { binding: fakeBinding({ "/two": two }, {}, { "Network.getResponseBody": () => now2.jump(30000) }), now: now2 });
  assert.equal(reserved.requests.at(-1).body_unavailable, "the render's reserved bound (navigation + wait) was spent before this body was collected");

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
