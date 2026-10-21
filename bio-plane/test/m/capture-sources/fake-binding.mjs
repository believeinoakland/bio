/* capture-sources' tests: the fake Browser Rendering binding (the two endpoints of `@cloudflare/puppeteer@1.4.0`'s own client,
 * then CDP JSON over a socket), shared by the driver's tests (browserrender.test.mjs) and the seam tests (seam-render.test.mjs),
 * which drive the real `acquire` over the real driver. It proves the driver, and nothing about Cloudflare's service. */
export const HOST = "portal.example.gov";
export const SCALE = 20;
export const scaled = () => { const t0 = Date.now(); return () => t0 + (Date.now() - t0) * SCALE; };
export const later = (fakeMs, fn) => setTimeout(fn, Math.max(0, fakeMs / SCALE));

/* The fake browser. `pages` maps a pathname to what the page does; `mode` bends the
   browser's own behaviour. `stats` counts sessions and closes; `on` lets a test act at
   a named CDP call (to jump a clock). */
export function fakeBinding(pages, mode = {}, on = {}) {
  const stats = { bodyActive: 0, maxBodyActive: 0, bodyOrder: [], acquires: 0, upgrades: 0, closeTargets: 0, browserCloses: 0, socketCloses: 0, lateCloses: 0, calls: [], asked: {},
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
            if (r.bodyHang) return;
            const answer = () => (r.bodyB64 !== undefined ? ok({ body: r.bodyB64, base64Encoded: true }) : ok({ body: r.bodyText, base64Encoded: false }));
            if (!r.bodyMs) return answer();
            /* A body that takes `bodyMs` of the test's clock to give; the calls open at once are counted. */
            stats.maxBodyActive = Math.max(stats.maxBodyActive, ++stats.bodyActive);
            timers.push(later(r.bodyMs, () => { stats.bodyActive--; answer(); }));
            return;
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
