/* D-490 — THE IN-PLANE RENDERER: a CDP driver over the Browser Rendering binding,
 * so `render: true` stops answering 501 on an instance that has one.
 *
 * Design: `docs/development/CLIENT-RENDERED.md` §"There is no collision: rendering
 * is available on the free tier" (an instance on EITHER plan can render, so the
 * driver is unconditional and only the allowance differs) and §"What must be
 * recorded on a rendered capture" (every field below exists because that section
 * names it). D-64 built the RECORD half and the seam; this is the RENDERER half.
 *
 * WHAT THIS MODULE IS. `render.mjs` is the pure half: given a renderer's answer it
 * derives everything the record says. This module PRODUCES that answer from a real
 * browser, and it is the only place in `src/` that knows what CDP is. It returns
 * the `RENDER_ANSWER` shape `render.mjs` documents and nothing else; every rule
 * about what a rendered capture RECORDS stays there, where a suite can drive it
 * without a browser.
 *
 * ---- WHY THERE IS NO `@cloudflare/puppeteer` HERE, MEASURED 2026-09-24 --------
 *
 * D-490's row named `@cloudflare/puppeteer` as the driver, and the plane CANNOT
 * carry it. MEASURED, not reasoned: with `import puppeteer from "@cloudflare/puppeteer"`
 * added to `src/render.mjs`, `node test/rendered-capture.test.mjs` died at its first
 * `new Miniflare(...)` with
 *
 *   MiniflareCoreError [ERR_MODULE_RULE]: Unable to resolve "src/render.mjs"
 *   dependency "@cloudflare/puppeteer": no matching module rules.
 *   If you're trying to import an npm package, you'll need to bundle your Worker first.
 *
 * The battery runs `src/index.mjs` RAW under miniflare (`modules: true,
 * modulesRoot: "/"`, `scriptPath` on the source), so workerd resolves the module
 * graph from disk and a BARE specifier matches no rule. That is not specific to a
 * static import: a dynamic `import("@cloudflare/puppeteer")` fails the same way,
 * because miniflare walks dynamic specifiers in the same pass (measured on a
 * throwaway worker, same `ERR_MODULE_RULE`). So the choice was not "puppeteer or
 * a hand-rolled client"; it was "a renderer, or a battery" — every miniflare suite
 * in the plane fails at construction, not at the render.
 *
 * The dependency is also not free where it does work: `@cloudflare/puppeteer@1.4.0`
 * is 80 packages and 32 MB installed, and bundles to 670,061 B for the plane's
 * recipe — but ONLY with `conditions: ["workerd","worker","browser"]` and
 * `mainFields: ["browser","module","main"]`, neither of which the shared fleet
 * RECIPE (`scripts/fleet-bundle.mjs`) has or may vary per member. With the recipe as
 * it stands esbuild cannot resolve it at all (19 errors: `debug`, `ws`, `zlib`,
 * `stream`, `tty`, `util`). So adopting it is a change to the FLEET's build recipe
 * and to every member's committed artifact, which is not this row's ground.
 *
 * WHAT WE GIVE UP BY NOT USING IT, STATED: puppeteer's page API (selectors,
 * `waitForFunction`, screenshots, PDF export) and its maintenance of the CDP
 * surface. What a capture needs is narrower than that and is written out below.
 * THE HONEST NAME FOR THE ALTERNATIVE, if the estate wants puppeteer: rendering
 * moves to a FOURTH FLEET MEMBER bound at `env.RENDERER`, which the seam in
 * `render.mjs` already admits and which is how `pdf-worker` (unpdf) and
 * `ocr-worker` (wasm tesseract) already carry dependencies the plane cannot. That
 * is DIST's and FLEET's ground, not CAPTURE's, and it is named in this item's
 * report rather than assumed.
 *
 * ---- WHAT THE BINDING IS, READ FROM THE VENDOR'S OWN ARTIFACT ----------------
 *
 * NOT from documentation: from `@cloudflare/puppeteer@1.4.0`'s own source, read
 * 2026-09-24 (`cloudflare/PuppeteerWorkers.js`, `cloudflare/WorkersWebSocketTransport.js`).
 * A Browser Rendering binding is a plain Fetcher on a host the binding ignores, and
 * the whole protocol is two calls:
 *
 *   POST https://fake.host/v1/devtools/browser        -> 200 {"sessionId": "..."}
 *   GET  https://fake.host/v1/devtools/browser/<id>   with `Upgrade: websocket`
 *                                                     -> 101, `response.webSocket`
 *
 * and then raw CDP JSON over that socket. It is THEIR claim that these are the
 * endpoints — it is their client — and it is UNVERIFIED AGAINST THE LIVE SERVICE
 * here, because no instance has the binding until DIST-11 deploys it. `test/
 * browser-render.test.mjs` drives this driver against a fake that speaks exactly
 * this protocol, which proves the DRIVER and proves nothing about the service.
 */

/* The host the binding ignores; puppeteer's own constant, kept identical so the
   two clients are visibly speaking to the same endpoints. */
const FAKE_HOST = "https://fake.host";

/* Sent because puppeteer sends one. UNVERIFIED: nothing in the vendor's artifact
   says the service VALIDATES it, and we cannot ask a service no instance is bound
   to. If the live binding refuses an unknown client, the render fails as
   RENDER_FAILED naming the upgrade's status, which is a visible failure rather
   than a silent one. */
const CLIENT_HEADER = "bio-plane";

/* How long a quiet network must stay quiet before `networkidle` is called. A
   CHOICE, not a measurement: puppeteer's own `networkidle0` uses 500 ms and this
   matches it so the two agree about what the word means. */
const IDLE_QUIET_MS = 500;
/* D-520: the least of the render's bound kept for serialising the document after the wait. */
const SERIALISE_MS = 1000;

/* Responses whose bodies this driver does NOT hash. It hashes none: see
   `requests[].sha256` below. */

/** Open a CDP socket on a fresh browser session. Throws with a sentence naming
 *  which of the two calls failed and what it answered — never a bare `undefined`. */
async function openSession(binding) {
  const acq = await binding.fetch(`${FAKE_HOST}/v1/devtools/browser`, { method: "POST" });
  if (acq.status !== 200) {
    const text = await acq.text().catch(() => "");
    throw new Error(`the Browser Rendering binding refused a session: HTTP ${acq.status} ${text.slice(0, 200)}`);
  }
  let sessionId = null;
  try { sessionId = (await acq.json()).sessionId; } catch { sessionId = null; }
  if (typeof sessionId !== "string" || !sessionId)
    throw new Error("the Browser Rendering binding acquired a session with no sessionId");
  const up = await binding.fetch(`${FAKE_HOST}/v1/devtools/browser/${sessionId}`, {
    headers: { Upgrade: "websocket", "cf-brapi-client": CLIENT_HEADER } });
  if (!up.webSocket)
    throw new Error(`the Browser Rendering binding did not upgrade session ${sessionId} to a websocket (HTTP ${up.status})`);
  up.webSocket.accept();
  return { sessionId, ws: up.webSocket };
}

/* D-520: the session opening, inside the navigation bound. `binding.fetch` takes no
   timeout of its own, so the two calls race a timer; a binding that never answers fails
   the render by name instead of holding the isolate past what was reserved for it. */
async function boundedOpen(binding, ms) {
  let timer = null;
  const expire = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`the Browser Rendering binding gave no session within the ${ms} ms navigation bound`)), ms);
  });
  try { return await Promise.race([openSession(binding), expire]); }
  finally { clearTimeout(timer); }
}

/** The CDP connection: one socket, ids, per-session events.
 *
 *  DELIBERATELY SMALL. It does the four things a capture needs — send a command
 *  and get its reply, subscribe to an event, notice the socket closing, and give
 *  up after a bound — and nothing else. Every wait in it is BOUNDED; a socket that
 *  goes quiet fails the render by name instead of holding the isolate. */
export function cdpConnection(ws) {
  let nextId = 1, closed = null;
  const pending = new Map();
  const listeners = [];
  ws.addEventListener("message", (ev) => {
    let m = null;
    try { m = JSON.parse(typeof ev.data === "string" ? ev.data : new TextDecoder().decode(ev.data)); }
    catch { return; }
    if (m && typeof m.id === "number" && pending.has(m.id)) {
      const { resolve, reject } = pending.get(m.id);
      pending.delete(m.id);
      m.error ? reject(new Error(`CDP ${m.error.message || "error"}`)) : resolve(m.result || {});
      return;
    }
    if (m && typeof m.method === "string") for (const fn of listeners) { try { fn(m); } catch { /* a listener must not kill the pump */ } }
  });
  ws.addEventListener("close", () => {
    closed = new Error("the CDP socket closed");
    for (const { reject } of pending.values()) reject(closed);
    pending.clear();
  });

  return {
    /** Send a command. `sessionId` is the FLAT session (a page); omitted for browser-level. */
    send(method, params = {}, sessionId = undefined, timeoutMs = 30000) {
      if (closed) return Promise.reject(closed);
      const id = nextId++;
      const msg = { id, method, params, ...(sessionId ? { sessionId } : {}) };
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          if (pending.delete(id)) reject(new Error(`CDP ${method} did not answer within ${timeoutMs} ms`));
        }, timeoutMs);
        pending.set(id, { resolve: (r) => { clearTimeout(timer); resolve(r); },
                         reject: (e) => { clearTimeout(timer); reject(e); } });
        try { ws.send(JSON.stringify(msg)); }
        catch (e) { pending.delete(id); clearTimeout(timer); reject(e); }
      });
    },
    on(fn) { listeners.push(fn); },
    close() { try { ws.close(); } catch { /* closing a closed socket is not a failure */ } },
  };
}

/* CDP resource types arrive capitalised (`Document`, `XHR`, `Stylesheet`).
   `render.mjs` lowercases before it asks NON_DATA_TYPES, and `render.data` records
   the string AS GIVEN, so this driver lowercases ONCE here and the record carries
   one spelling. A type CDP does not send is recorded as `other`, never guessed. */
const resourceType = (t) => (typeof t === "string" && t ? t.toLowerCase() : "other");

/** Run one render and answer in `render.mjs`'s `RENDER_ANSWER` shape.
 *
 *  EVERY FIELD IS EITHER OBSERVED OR `null`. Nothing here fills a gap with a
 *  default that would read as measured: a renderer that could not record the
 *  requests answers `requests: null`, which `renderBlock` turns into a named
 *  `render.undetermined` entry rather than an empty list. */
export async function renderWithBinding(binding, req, { now = () => Date.now() } = {}) {
  const asked = req || {};
  const timeoutMs = Math.max(1000, Number(asked.wait?.timeout_ms) || 15000);
  /* D-520 — THE NAVIGATION BOUND IS HONOURED HERE, and until D-520 it was not read at all.
     `render.mjs` asks `navigation_timeout_ms` and `renderReserveMs` reserves it against the
     allowance and the concurrency slot, but this driver bounded Page.navigate by the WAIT
     timeout and every setup command by `send`'s 30,000 ms default, so the reservation was a
     bound the renderer was asked for and did not hold. Now the render has TWO phases, each
     with its own deadline: getting to the page (session, target, emulation, domains and
     Page.navigate to commit) inside `navMs`, and the wait plus the serialisation inside
     `timeoutMs` from the moment the navigation committed, so the whole render ends inside
     `navMs + timeoutMs` — the figure reserved. A renderer asked for no navigation bound
     keeps 30,000 ms, the figure this driver held before (`render.mjs` always asks one).
     WHAT THIS CANNOT BOUND: the session close in `finally`, which runs after `elapsed_ms`
     is taken and has its own 5,000 ms bounds, and the platform's own time to hand out a
     browser, which happens inside `navMs` only as far as the binding's fetch answers. */
  const navMs = Math.max(1000, Number(asked.navigation_timeout_ms) || 30000);
  const until = typeof asked.wait?.until === "string" ? asked.wait.until : "networkidle";
  let sess = null, conn = null, targetId = null;
  const started = now();
  const navDeadline = started + navMs;
  /* What is left of a phase, for one command. A phase already spent fails the render BY
     NAME rather than sending a command with a zero or negative bound. */
  const left = (deadline, phase) => {
    const ms = deadline - now();
    if (ms <= 0) throw new Error(`the render's ${phase} bound was spent before it finished`);
    return ms;
  };
  const navLeft = () => left(navDeadline, `navigation (${navMs} ms)`);
  try {
    sess = await boundedOpen(binding, navMs);
    conn = cdpConnection(sess.ws);

    /* The engine names ITSELF. `Browser.getVersion`'s `product` is the string the
       browser reports (`HeadlessChrome/124.0.6367.207`); it is split rather than
       assumed, and a product that does not split is recorded whole with a null
       version rather than halved into a guess. */
    let engine = null, engineVersion = null;
    try {
      const v = await conn.send("Browser.getVersion", {}, undefined, navLeft());
      const product = typeof v.product === "string" ? v.product : null;
      if (product) {
        const slash = product.lastIndexOf("/");
        if (slash > 0) { engine = product.slice(0, slash); engineVersion = product.slice(slash + 1); }
        else engine = product;
      }
    } catch { /* an unnamed engine is `null` and `renderBlock` says so */ }

    /* The page target. An acquired session already has one; creating a second
       would render in a tab nobody navigated. Only if there is none do we make one. */
    let pageTarget = null;
    try {
      const { targetInfos } = await conn.send("Target.getTargets", {}, undefined, navLeft());
      pageTarget = (Array.isArray(targetInfos) ? targetInfos : []).find((t) => t && t.type === "page") || null;
    } catch { pageTarget = null; }
    if (!pageTarget) {
      const made = await conn.send("Target.createTarget", { url: "about:blank" }, undefined, navLeft());
      targetId = made.targetId;
    } else targetId = pageTarget.targetId;
    if (!targetId) throw new Error("the browser gave this render no page target");
    const { sessionId } = await conn.send("Target.attachToTarget", { targetId, flatten: true }, undefined, navLeft());
    if (!sessionId) throw new Error(`the browser did not attach a session to target ${targetId}`);

    /* THE ENVIRONMENT WE ASK FOR. Each is recorded as ASKED by `renderBlock`
       whether or not it was honoured, and each failure here is swallowed on
       purpose: an emulation override the browser refuses makes the render's
       environment differ from what was asked, which the record already shows by
       carrying both — it does not make the render worthless. */
    const vp = asked.viewport || {};
    const envOk = { viewport: false, dpr: false, locale: false, timezone: false };
    try {
      await conn.send("Emulation.setDeviceMetricsOverride", {
        width: Math.round(Number(vp.width) || 1280), height: Math.round(Number(vp.height) || 800),
        deviceScaleFactor: Number(asked.dpr) || 1, mobile: false }, sessionId, navLeft());
      envOk.viewport = true; envOk.dpr = true;
    } catch { /* recorded as not honoured, below */ }
    if (typeof asked.locale === "string" && asked.locale)
      try { await conn.send("Emulation.setLocaleOverride", { locale: asked.locale }, sessionId, navLeft()); envOk.locale = true; } catch { /* as above */ }
    if (typeof asked.timezone === "string" && asked.timezone)
      try { await conn.send("Emulation.setTimezoneOverride", { timezoneId: asked.timezone }, sessionId, navLeft()); envOk.timezone = true; } catch { /* as above */ }

    /* THE TWO OBSERVATION DOMAINS, AND WHAT IT MEANS WHEN ONE WILL NOT ENABLE.
       `Network` gives the request ledger; `Debugger` gives the scripts the engine
       actually parsed. If either refuses, its half of the answer is `null` — the
       word `renderBlock` turns into "undetermined", which is the truthful record
       and is NOT the same as an empty list (BOB #31 rules exactly that). */
    let requests = new Map(), scripts = [];
    let sawNetwork = false, sawDebugger = false;
    try { await conn.send("Network.enable", {}, sessionId, navLeft()); sawNetwork = true; } catch { /* requests -> null */ }
    try { await conn.send("Page.enable", {}, sessionId, navLeft()); } catch { /* the load event is one of two wait conditions; the other still works */ }
    try { await conn.send("Debugger.enable", {}, sessionId, navLeft()); sawDebugger = true; } catch { /* scripts -> null */ }

    let inflight = 0, lastQuietAt = null, loadFired = false, mainFrameId = null, mainStatus = null;
    conn.on((m) => {
      const p = m.params || {};
      switch (m.method) {
        case "Network.requestWillBeSent":
          if (!p.requestId) break;
          /* A REDIRECT REUSES THE requestId. Recording it as a fresh entry would
             double-count the hop; recording nothing would lose the redirect's own
             outcome. The redirected hop is CLOSED as completed and the new URL
             takes the id, which is what the page actually did. */
          if (p.redirectResponse && requests.has(p.requestId)) {
            const prev = requests.get(p.requestId);
            requests.set(`${p.requestId}#${requests.size}`, { ...prev, outcome: "completed",
              status: Number(p.redirectResponse.status) || prev.status });
          } else inflight++;
          requests.set(p.requestId, { url: String(p.request?.url || ""), type: resourceType(p.type),
                                      outcome: "pending", status: null, blocked_by: null });
          break;
        case "Network.responseReceived": {
          const r = requests.get(p.requestId);
          if (r) { r.status = Number(p.response?.status) || r.status; if (p.type) r.type = resourceType(p.type); }
          /* THROUGH `resourceType`, NOT against the literal `"Document"`: CDP sends
             the type capitalised and a browser that sent it lowercase would be
             correct in a spelling this driver did not anticipate. Caught by this
             item's over-strictness arm before it was ever run against a browser —
             with the literal, the main document's status read `null` on a correct
             render, which is the record losing a fact for a spelling. */
          if (resourceType(p.type) === "document" && p.frameId && p.frameId === mainFrameId)
            mainStatus = Number(p.response?.status) || mainStatus;
          break;
        }
        case "Network.loadingFinished": {
          const r = requests.get(p.requestId);
          if (r && r.outcome === "pending") { r.outcome = "completed"; inflight--; lastQuietAt = inflight === 0 ? now() : null; }
          break;
        }
        case "Network.loadingFailed": {
          const r = requests.get(p.requestId);
          if (r && r.outcome === "pending") {
            /* BLOCKED AND FAILED ARE DIFFERENT FACTS and the record keeps them
               apart: `blockedReason` is the browser saying a RULE stopped this,
               and it is the rule's own name, never our word for it. */
            r.outcome = p.blockedReason ? "blocked" : "failed";
            if (p.blockedReason) r.blocked_by = String(p.blockedReason);
            inflight--; lastQuietAt = inflight === 0 ? now() : null;
          }
          break;
        }
        case "Page.loadEventFired": loadFired = true; break;
        case "Debugger.scriptParsed":
          /* An INLINE script has no url. It is the page's own bytes, already in
             the shell we hold, and naming it would invent an origin; the set
             records script RESOURCES, which is what `renderBlock` keys by origin. */
          if (typeof p.url === "string" && p.url) scripts.push({ url: p.url });
          break;
      }
    });

    /* NAVIGATE. A navigation the browser refuses outright (`errorText`) is a
       failed render and says which address and why — it is never a render of
       `about:blank` reported as the page. */
    const nav = await conn.send("Page.navigate", { url: String(asked.url || "") }, sessionId, navLeft());
    if (nav.errorText) throw new Error(`the browser could not navigate to ${asked.url}: ${nav.errorText}`);
    mainFrameId = nav.frameId || null;

    /* THE WAIT, BOUNDED, AND IT SAYS WHICH CONDITION FIRED (WORKER.md: a wait ends
       when the WORLD says done). Three outcomes and the record carries the one
       that happened — `timeout` is a real answer here, not a failure: the page had
       15 s and never went quiet, and a capture of what it showed at that moment is
       the fact. */
    /* D-520: the wait's bound runs from the COMMIT, not from `started`: before D-520 the
       wait's 15 s had to pay for the session and the navigation too, so a slow navigation
       silently shortened the wait it was asked for. */
    /* And the whole render ends inside `navMs + timeoutMs`, the figure reserved: the wait
       gives up to SERIALISE_MS of its end to the serialisation below only when the
       navigation used so much of its own bound that the two would not otherwise fit. */
    const overall = started + navMs + timeoutMs;
    const deadline = Math.min(now() + timeoutMs, overall - SERIALISE_MS);
    let fired = null;
    while (now() < deadline) {
      if (until === "load" && loadFired) { fired = "load"; break; }
      if (loadFired && inflight <= 0 && lastQuietAt !== null && now() - lastQuietAt >= IDLE_QUIET_MS) { fired = "networkidle"; break; }
      if (loadFired && inflight <= 0 && lastQuietAt === null) lastQuietAt = now();
      await new Promise((r) => setTimeout(r, 25));
    }
    if (!fired) fired = "timeout";

    /* THE DOCUMENT. `outerHTML` drops the doctype, so the doctype is rebuilt from
       `document.doctype` rather than assumed to be `<!DOCTYPE html>`: a page served
       in quirks mode has none and a capture claiming one would be claiming more
       than it saw. `location.href` comes from the SAME evaluation, so the address
       and the bytes are one observation and cannot disagree. */
    const evaluated = await conn.send("Runtime.evaluate", {
      expression: `JSON.stringify({`
        + `html: (document.doctype ? "<!DOCTYPE " + document.doctype.name + ">\\n" : "") + document.documentElement.outerHTML,`
        + `url: location.href })`,
      returnByValue: true, awaitPromise: false }, sessionId, left(overall, `render (${navMs + timeoutMs} ms)`));
    let html = null, navigatedTo = null;
    try {
      const parsed = JSON.parse(evaluated.result?.value);
      html = typeof parsed.html === "string" ? parsed.html : null;
      navigatedTo = typeof parsed.url === "string" ? parsed.url : null;
    } catch { html = null; }
    if (typeof html !== "string" || !html)
      throw new Error("the browser returned no serialised document after the render");

    const elapsed = now() - started;
    return {
      ok: true, html,
      engine, engine_version: engineVersion,
      /* WHAT WAS ASKED, reported as USED only where the override was accepted.
         A refused override reports `null`, which `renderBlock` records as
         "not reported by the renderer" — the honest reading, since the browser
         then rendered at whatever IT had and we do not know what that was. */
      viewport: envOk.viewport ? { width: Math.round(Number(vp.width) || 1280), height: Math.round(Number(vp.height) || 800) } : null,
      dpr: envOk.dpr ? (Number(asked.dpr) || 1) : null,
      locale: envOk.locale ? asked.locale : null,
      timezone: envOk.timezone ? asked.timezone : null,
      wait: { condition: asked.wait || null, fired },
      elapsed_ms: elapsed,
      navigated_to: navigatedTo,
      status: mainStatus,
      /* `sha256` IS NEVER SET, AND THAT IS A STATEMENT: hashing a subresource body
         means `Network.getResponseBody` per request, which the browser refuses for
         many resources and which would put the renderer's copy of the bytes in the
         record beside the plane's. `renderBlock` already records a missing hash as
         `null` with `reported_by: "renderer"`, so the record says the renderer
         reported the request and did not report its bytes. */
      requests: sawNetwork ? [...requests.values()].map((r) => ({ url: r.url, type: r.type, outcome: r.outcome,
        ...(r.status !== null ? { status: r.status } : {}), ...(r.blocked_by ? { blocked_by: r.blocked_by } : {}) })) : null,
      /* WHAT `scripts` CAN AND CANNOT SEE, because the count feeds an authority
         verdict: `Debugger.scriptParsed` fires for every script the ENGINE parsed,
         which is every script resource that reached execution. It OVER-reports in
         one direction — a script parsed and never invoked is listed — and that
         direction makes a capture MORE undetermined, which is the bias
         `render.mjs` states for `NON_DATA_TYPES` and the one to prefer. It does
         NOT see a script whose parse the engine skipped, and it does not see
         inline script (no url), which is the shell's own bytes. */
      scripts: sawDebugger ? scripts : null,
    };
  } catch (e) {
    return { ok: false, error: String((e && e.message) || e) };
  } finally {
    /* THE SESSION IS CLOSED ON EVERY PATH, INCLUDING THE FAILING ONE. A browser
       session left open spends the instance's allowance for as long as the
       platform keeps it, and the allowance is the fence BOB #32 item 3 rests on. */
    if (conn) {
      if (targetId) { try { await conn.send("Target.closeTarget", { targetId }, undefined, 5000); } catch { /* the socket close below still ends it */ } }
      try { await conn.send("Browser.close", {}, undefined, 5000); } catch { /* as above */ }
      conn.close();
    }
  }
}

/** The renderer a Browser Rendering binding gives, in `rendererFor`'s shape. */
export function browserBindingRenderer(binding) {
  return { kind: "browser-binding", render: (req) => renderWithBinding(binding, req) };
}
