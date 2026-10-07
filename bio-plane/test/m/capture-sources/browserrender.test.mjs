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
import { renderBlock } from "../../../src/render.mjs";

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
  const stats = { acquires: 0, upgrades: 0, closeTargets: 0, browserCloses: 0, socketCloses: 0, lateCloses: 0, calls: [], asked: {},
                  sent: [], held: {}, resumed: [] };
  const socket = () => {
    const ls = { message: [], close: [] };
    let closed = false, page = null, key = null;
    const timers = [];
    const deliver = (obj) => setImmediate(() => { if (!closed) for (const f of ls.message) f({ data: JSON.stringify(obj) }); });
    const ev = (method, params, sessionId = "S1") => deliver({ method, params, sessionId });
    /* R64: the browser's hold. `fetchOn` and `socketsBlocked` are per session; a request on a session with
       interception on is PAUSED until the driver answers it, and only one let go reaches `stats.sent`. */
    const fetchOn = new Set(), socketsBlocked = new Set(), pauses = new Map();
    let pauseN = 0;
    const hold = (sid, url, type, networkId, frameId = "F1") => new Promise((resolve) => {
      if (!fetchOn.has(sid)) { stats.sent.push(url); return resolve(true); }
      const id = "I" + pauseN++;
      pauses.set(id, (go) => { if (go) stats.sent.push(url); resolve(go); });
      ev("Fetch.requestPaused", { requestId: id, request: { url }, resourceType: type || "Other", networkId, frameId }, sid);
    });
    const runRequests = (rs, sid, prefix) => rs.forEach((r, i) => timers.push(later(r.startAfterMs || 0, async () => {
      const id = prefix + i;
      ev("Network.requestWillBeSent", { requestId: id, request: { url: r.url }, type: r.type, frameId: r.frameId || "F1" }, sid);
      const blocked = () => ev("Network.loadingFailed", { requestId: id, errorText: "net::ERR_BLOCKED_BY_CLIENT" }, sid);
      if (!(await hold(sid, r.url, r.type, id, r.frameId))) return blocked();
      if (r.end === "redirect") {
        ev("Network.requestWillBeSent", { requestId: id, request: { url: r.to }, type: r.type, frameId: "F1", redirectResponse: { status: r.status } }, sid);
        if (!(await hold(sid, r.to, r.type, id))) return blocked();
        ev("Network.responseReceived", { requestId: id, type: r.type, frameId: "F1", response: { status: r.toStatus } }, sid);
        ev("Network.loadingFinished", { requestId: id }, sid);
        return;
      }
      const end = () => {
        if (typeof r.status === "number") ev("Network.responseReceived", { requestId: id, type: r.type, frameId: r.frameId || "F1", response: { status: r.status } }, sid);
        if (r.end === "finished") ev("Network.loadingFinished", { requestId: id }, sid);
        if (r.end === "failed") ev("Network.loadingFailed", { requestId: id, errorText: "net::ERR_FAILED" }, sid);
        if (r.end === "blocked") ev("Network.loadingFailed", { requestId: id, blockedReason: r.blockedReason }, sid);
      };
      if (r.lifeMs) timers.push(later(r.lifeMs, end)); else end();
    })));
    const openSockets = (urls, sid, prefix) => urls.forEach((url, i) => {
      ev("Network.webSocketCreated", { requestId: prefix + i, url }, sid);
      if (!socketsBlocked.has(sid)) stats.sent.push(url);
    });
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
        const sid = m.sessionId || null;
        const refuse = (mode.refuse || []).includes(m.method) || ((mode.refuseOn || {})[sid] || []).includes(m.method);
        switch (m.method) {
          case "Fetch.enable":
            stats.held[sid] = { ...(stats.held[sid] || {}), fetch: m.params.patterns };
            if (refuse) return err("Fetch.enable unavailable");
            fetchOn.add(sid); return ok({});
          case "Network.setBlockedURLs":
            stats.held[sid] = { ...(stats.held[sid] || {}), blockedURLs: m.params.urls };
            if (refuse) return err("setBlockedURLs unavailable");
            if ((m.params.urls || []).includes("ws://*") && (m.params.urls || []).includes("wss://*")) socketsBlocked.add(sid);
            return ok({});
          case "Target.setAutoAttach":
            stats.held[sid] = { ...(stats.held[sid] || {}), autoAttach: m.params };
            return refuse ? err("setAutoAttach unavailable") : ok({});
          case "Fetch.continueRequest": case "Fetch.failRequest": {
            const go = pauses.get(m.params.requestId);
            if (!go) return err("Invalid InterceptionId.");
            pauses.delete(m.params.requestId);
            if (m.method === "Fetch.failRequest") stats.asked.failReason = m.params.errorReason;
            go(m.method === "Fetch.continueRequest");
            return ok({});
          }
          case "Runtime.runIfWaitingForDebugger": {
            stats.resumed.push(sid);
            const child = page && page.child;
            if (child && sid === "S2") { runRequests(child.requests || [], "S2", "K"); openSockets(child.sockets || [], "S2", "KW"); }
            return ok({});
          }
          case "Browser.getVersion": return refuse ? err("no version") : ok({ product: mode.product ?? "HeadlessChrome/124.0.6367.207" });
          case "Target.getTargets": return ok({ targetInfos: mode.notargets ? [] : [{ targetId: "T1", type: "page" }] });
          case "Target.createTarget": stats.asked.createTarget = true; return ok({ targetId: "T-made" });
          case "Target.attachToTarget": return ok({ sessionId: "S1" });
          case "Emulation.setDeviceMetricsOverride": case "Emulation.setLocaleOverride": case "Emulation.setTimezoneOverride":
            stats.asked[m.method] = m.params; return refuse ? err("override refused") : ok({});
          case "Network.enable": case "Page.enable": case "Debugger.enable": return refuse ? err(`${m.method} unavailable`) : ok({});
          case "Page.navigate": return (async () => {
            key = new URL(m.params.url).pathname; page = pages[key] || { requests: [], scripts: [] };
            if (page.navHang) return;
            /* The navigation is a request too: held, and refused as the browser refuses one (R64). Its redirect
               hop, when the page has one, is held again. */
            if (!(await hold("S1", m.params.url, "Document", "NAV"))) return ok({ frameId: "F1", errorText: "net::ERR_BLOCKED_BY_CLIENT" });
            if (page.navRedirect && !(await hold("S1", page.navRedirect, "Document", "NAV"))) return ok({ frameId: "F1", errorText: "net::ERR_BLOCKED_BY_CLIENT" });
            if (page.navError) return ok({ frameId: "F1", errorText: page.navError });
            ok({ frameId: "F1", loaderId: "L1" });
            runRequests(page.requests || [], "S1", "R");
            openSockets(page.sockets || [], "S1", "W");
            /* A frame the page starts, auto-attached and waiting for the driver to resume it. */
            if (page.child) ev("Target.attachedToTarget", { sessionId: "S2", targetInfo: { targetId: "T2", type: "iframe" }, waitingForDebugger: true });
            /* A page that keeps starting short requests: never quiet. */
            if (page.churn) {
              let n = 0;
              const tick = () => { const id = "C" + n++; ev("Network.requestWillBeSent", { requestId: id, request: { url: `https://${HOST}/poll?${n}` }, type: "XHR", frameId: "F1" });
                timers.push(later(page.churn.lifeMs, () => ev("Network.loadingFinished", { requestId: id }))); timers.push(later(page.churn.everyMs, tick)); };
              timers.push(later(page.churn.startAfterMs || 0, tick));
            }
            for (const s of page.scripts || []) ev("Debugger.scriptParsed", { url: s.url, scriptId: "s" });
            if (!page.noLoad) timers.push(later(page.loadAfterMs || 0, () => ev("Page.loadEventFired", { timestamp: 1 })));
          })();
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
    assert.ok(a.error.includes(`could not navigate to ${url}: ${url} was refused before it was sent (${reason}:`), a.error);
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
