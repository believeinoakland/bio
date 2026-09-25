/* NEGATIVE CONTROL: re-run with `node test/nc-d490.mjs` (one arm: `node test/nc-d490.mjs <arm>`); pristine copies go to `BIO_NC_SCRATCH` or a run-unique temp directory, never into the worktree (BOB #32). Run 2026-09-24 on base origin/main 58293bf31 plus this item, EIGHT rows — six arms each armed ALONE, a baseline first and last — every patch matched EXACTLY ONCE (armed: true), every restore verified by sha256 AND cmp with the byte count printed and floored at 1000 (6 of 6 MATCH/IDENTICAL). BASELINE 44 pass 0 fail; BASELINE-LAST 44/0. (1) `nodriver` — THE ROW'S CONTROL — `rendererFor`'s BROWSER branch put back to `{kind:"browser-binding-without-driver", render:null}`, so a bound browser is again a binding with nothing behind it: DECLARED red on A1 A2 A3 A3b A4 A5 A6 A7 A8 A8b A8c A8d A8e A8f A8g and nothing else; ACTUAL 29/15, exactly those, AS DECLARED — A9/A10 (the UNBOUND arm, which is the row's named control as an arm rather than a patch) and B-H (the driver reached directly through the harness worker) stay green, which is what tells a missing DRIVER from a missing binding. (2) `emptyrequests` — a ledger nobody could record read as `[]`: DECLARED C1; ACTUAL 43/1 C1, AS DECLARED. (3) `emptyscripts` — a script set nobody could record read as `[]` (BOB #31's exact case): DECLARED C3; ACTUAL 43/1 C3, AS DECLARED. (4) `blockedasfailed` — a rule that stopped a request reported as the request failing: DECLARED B1; ACTUAL 43/1 B1, AS DECLARED. (5) `noclose` — the session left open: DECLARED F2 F3; ACTUAL 42/2 F2 F3, AS DECLARED. (6) `lowercasetypes` — OVER-STRICTNESS — CDP resource types arriving lowercase, a correct spelling this driver did not anticipate: DECLARED nothing fails; ACTUAL 44/0, AS DECLARED. THAT ARM EARNED ITS PLACE: its FIRST run, before the fix, failed A8c, because the driver compared `p.type === "Document"` against the capitalised literal and the main document's status read `null` on a correct render. The comparison now goes through `resourceType`. RE-RUN 2026-09-24 after this suite's foot gained the comma `battery.mjs`'s tally needs (and `nc-d490.mjs`'s own matcher with it): the same eight rows, the same six verdicts, baseline and baseline-last 44/0 — recorded because a control whose READER changed is a control that has to be re-run, not one whose old transcript still stands. */
/* D-490 — THE IN-PLANE RENDERER OVER THE BROWSER RENDERING BINDING, driven THROUGH
 * THE OP and, for the driver's own rules, through a harness worker that imports it.
 *
 * Design: `docs/development/CLIENT-RENDERED.md` (a development design, cited here
 * and never read by this suite) §"There is no collision: rendering is available on
 * the free tier" and §"What must be recorded on a rendered capture", with BOB #31
 * (every executed script recorded, or the set is `undetermined`) and BOB #32 (the
 * method is `rendered`; ONE capture holds BOTH artifacts with the RENDERED document
 * primary).
 *
 * ACCEPTS-WHEN (QUEUE.md D-490): with a (mocked) binding a render produces D-64's
 * pair. NEGATIVE CONTROL: unbind and the arm answers RENDER_NO_RENDERER by name
 * (block A, "A9"/"A10").
 *
 * THE BINDING IS A FAKE, AND WHAT THE FAKE IS COPIED FROM IS THE LOAD-BEARING PART.
 * It is not this file's invention of a plausible protocol. It implements the two
 * endpoints and the transport read out of `@cloudflare/puppeteer@1.4.0`'s OWN
 * SOURCE on 2026-09-24 (`cloudflare/PuppeteerWorkers.js` `acquire`, and
 * `cloudflare/WorkersWebSocketTransport.js` `create`): `POST /v1/devtools/browser`
 * answering `{sessionId}`, then `GET /v1/devtools/browser/<id>` with
 * `Upgrade: websocket` answering 101 with a socket, then raw CDP JSON. It runs as a
 * SECOND MINIFLARE WORKER rather than a host-side function, because a host-side
 * service binding has no `WebSocketPair` and answers 500 (measured while writing
 * this suite).
 *
 * WHAT THIS SUITE CANNOT SEE, AND IT IS MORE THAN USUAL:
 *   - CLOUDFLARE'S SERVICE. Every CDP answer below is this file's. The suite proves
 *     the DRIVER — that it opens a session, asks for the environment, observes the
 *     network and the scripts, waits by a stated condition, serialises the document,
 *     and closes the session on every path — and NOTHING about whether Browser
 *     Rendering speaks this protocol, honours these overrides, or reports truthfully.
 *     That the endpoints are right is the VENDOR'S CLAIM, taken from their client.
 *   - LIVE BEHAVIOUR AT ALL. No deployed instance has a `browser` binding:
 *     `wrangler.jsonc` carries no `browser` line and DIST's deploy derivation refuses
 *     the class (UNKNOWN_BINDING_CLASS). That is DIST-11, which this row is ordered
 *     behind. THE LIVE HALF OF D-490 IS NOT VERIFIED and this file is not evidence
 *     about it.
 *   - A REAL PAGE. The fake serialises a document this file wrote; nothing here
 *     exercises a browser's own HTML serialisation, quirks-mode doctype handling, or
 *     what a real client-rendered application does to `document.documentElement`.
 *   - WHETHER `Debugger.scriptParsed` IS THE RIGHT INSTRUMENT for "executed". The
 *     driver states its bias (it over-reports a parsed-but-never-invoked script,
 *     which makes a capture MORE undetermined); this suite asserts the driver
 *     carries what the browser said, not that the browser is right.
 *   - THE ALLOWANCE, THE AUTHORITY RULE, THE PAIR'S PROMOTION: D-64's ground,
 *     driven in `rendered-capture.test.mjs`. Block A asserts the pair ARRIVES from a
 *     browser binding; what the record then makes of it is asserted there.
 */
import "./stdio.mjs";                 /* D-282 */
import "./sandbox.mjs";               /* D-186 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { RENDER_CAPTURE_CHECKS } from "../checks/bio-checks.mjs";
import { RENDERED_METHOD } from "../src/render.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
/* NEVER CREATED ON DISK. miniflare resolves a worker's relative imports against
   `scriptPath`'s directory and reads the ENTRY from `script`, so this names where
   the harness sits without putting a scratch file in the worktree (BOB #32). */
const HARNESS_AT = fileURLToPath(new URL("../test/__d490-harness.mjs", import.meta.url));
const sha = (b) => createHash("sha256").update(b).digest("hex");

const HOST = "portal.example.gov";
const SHELL = `<!doctype html><html><head><title>Portal</title><script src="/app.js"></script></head>`
            + `<body><div id="root"></div></body></html>`;
const SHELL_SHA = sha(Buffer.from(SHELL, "utf-8"));
const RENDERED = (p) => `<!DOCTYPE html>\n<html><head><title>Portal</title></head><body><main>`
  + `<h1>Council agenda</h1><p>Rendered for ${p}.</p></main></body></html>`;

/* ------------------------------------------------------------------ the fake */
/* One worker, three MODEs. `ok` keys its CDP behaviour off the navigate URL's
   pathname, so a suite arm picks a page rather than a new miniflare instance. */
const BROWSER_FAKE = `
const PAGES = ${JSON.stringify({
  "/same": {
    requests: [
      { url: `https://${HOST}/same`, type: "Document", status: 200, end: "finished" },
      { url: `https://${HOST}/app.js`, type: "Script", status: 200, end: "finished" },
      { url: `https://${HOST}/app.css`, type: "Stylesheet", status: 200, end: "finished" },
      { url: `https://${HOST}/api/agenda.json`, type: "XHR", status: 200, end: "finished" },
    ],
    scripts: [{ url: `https://${HOST}/app.js` }],
  },
  "/mixed": {
    requests: [
      { url: `https://${HOST}/mixed`, type: "Document", status: 200, end: "finished" },
      { url: `https://${HOST}/app.js`, type: "Script", status: 200, end: "finished" },
      { url: "https://cdn.analytics.example/a.js", type: "Script", status: 200, end: "finished" },
      { url: "https://ads.example/pixel.gif", type: "Image", end: "blocked", blockedReason: "inspector" },
      { url: `https://${HOST}/missing.json`, type: "XHR", end: "failed" },
      { url: `https://${HOST}/slow.json`, type: "XHR", end: "pending" },
    ],
    scripts: [{ url: `https://${HOST}/app.js` }, { url: "https://cdn.analytics.example/a.js" },
              { url: "" }],
  },
  "/redirected": {
    requests: [
      { url: `https://${HOST}/redirected`, type: "Document", status: 301, end: "redirect",
        to: `https://${HOST}/landed`, toStatus: 200 },
    ],
    scripts: [],
  },
  /* THE REFUSING PAGES CARRY NO `refuse` KEY: the plane enables a domain BEFORE it
     navigates, so at `Network.enable` the fake does not yet know which page this is.
     The refusal is a MODE on the fake instead (block C spins its own instance), which
     is the fix for an arm that first read [] where it declared null — a fixture that
     could never have armed, exactly the class WORKER.md names. */
  "/nonetwork": { requests: [{ url: `https://${HOST}/nonetwork`, type: "Document", status: 200, end: "finished" }],
                  scripts: [{ url: `https://${HOST}/app.js` }] },
  "/noscripts": { requests: [{ url: `https://${HOST}/noscripts`, type: "Document", status: 200, end: "finished" }],
                  scripts: [{ url: `https://${HOST}/app.js` }] },
  "/navfail": { requests: [], scripts: [], navError: "net::ERR_NAME_NOT_RESOLVED" },
  "/noload": { requests: [], scripts: [], noLoad: true },
  /* D-520: a navigation the browser never answers — the site that never commits. */
  "/navhang": { requests: [], scripts: [], navHang: true },
  "/noserialise": { requests: [], scripts: [], noHtml: true },
})};
const RENDERED = (p) => ${JSON.stringify("<!DOCTYPE html>\n<html><head><title>Portal</title></head><body><main><h1>Council agenda</h1><p>Rendered for ")} + p + ${JSON.stringify(".</p></main></body></html>")};
let acquires = 0, closes = 0, upgrades = 0;
export default {
  async fetch(request, env) {
    const u = new URL(request.url);
    if (u.pathname === "/__stats") return Response.json({ acquires, upgrades, closes });
    if (env.MODE === "noacquire") return new Response("no capacity", { status: 503 });
    if (request.headers.get("Upgrade") === "websocket") {
      if (env.MODE === "noupgrade") return new Response("not a socket", { status: 200 });
      upgrades++;
      const [client, server] = Object.values(new WebSocketPair());
      server.accept();
      let page = null, pageKey = null;
      const ev = (method, params) => server.send(JSON.stringify({ method, params, sessionId: "S1" }));
      server.addEventListener("message", (e) => {
        let m; try { m = JSON.parse(e.data); } catch { return; }
        const ok = (result) => server.send(JSON.stringify({ id: m.id, result }));
        const err = (message) => server.send(JSON.stringify({ id: m.id, error: { message } }));
        switch (m.method) {
          case "Browser.getVersion": return ok({ product: "HeadlessChrome/124.0.6367.207", protocolVersion: "1.3" });
          case "Target.getTargets":  return env.MODE === "notargets" ? ok({ targetInfos: [] })
                                          : ok({ targetInfos: [{ targetId: "T1", type: "page" }] });
          case "Target.createTarget": return ok({ targetId: "T-made" });
          case "Target.attachToTarget": return ok({ sessionId: "S1" });
          case "Emulation.setDeviceMetricsOverride":
          case "Emulation.setLocaleOverride":
          case "Emulation.setTimezoneOverride": return ok({});
          case "Network.enable": return env.MODE === "nonetwork" ? err("Network domain unavailable") : ok({});
          case "Page.enable": return ok({});
          case "Debugger.enable": return env.MODE === "nodebugger" ? err("Debugger domain unavailable") : ok({});
          case "Page.navigate": {
            pageKey = new URL(m.params.url).pathname;
            page = PAGES[pageKey] || null;
            if (!page) return ok({ frameId: "F1" });
            if (page.navError) return ok({ frameId: "F1", errorText: page.navError });
            if (page.navHang) return;   /* D-520: no answer, ever */
            ok({ frameId: "F1", loaderId: "L1" });
            if (env.MODE !== "nonetwork") for (let i = 0; i < page.requests.length; i++) {
              const r = page.requests[i], id = "R" + i;
              ev("Network.requestWillBeSent", { requestId: id, request: { url: r.url }, type: r.type, frameId: "F1" });
              if (r.end === "redirect") {
                ev("Network.requestWillBeSent", { requestId: id, request: { url: r.to }, type: r.type, frameId: "F1",
                                                  redirectResponse: { status: r.status } });
                ev("Network.responseReceived", { requestId: id, type: r.type, frameId: "F1", response: { status: r.toStatus } });
                ev("Network.loadingFinished", { requestId: id });
                continue;
              }
              if (typeof r.status === "number")
                ev("Network.responseReceived", { requestId: id, type: r.type, frameId: "F1", response: { status: r.status } });
              if (r.end === "finished") ev("Network.loadingFinished", { requestId: id });
              if (r.end === "failed") ev("Network.loadingFailed", { requestId: id, errorText: "net::ERR_FAILED" });
              if (r.end === "blocked") ev("Network.loadingFailed", { requestId: id, blockedReason: r.blockedReason });
            }
            if (env.MODE !== "nodebugger") for (const s of page.scripts)
              ev("Debugger.scriptParsed", { url: s.url, scriptId: "s" });
            if (!page.noLoad) ev("Page.loadEventFired", { timestamp: 1 });
            return;
          }
          case "Runtime.evaluate":
            if (page && page.noHtml) return ok({ result: { value: undefined } });
            return ok({ result: { value: JSON.stringify({ html: RENDERED(pageKey || "/"), url: "https://${HOST}" + (pageKey || "/") }) } });
          case "Target.closeTarget": closes++; return ok({});
          case "Browser.close": return ok({});
          default: return err("unknown method " + m.method);
        }
      });
      return new Response(null, { status: 101, webSocket: client });
    }
    if (u.pathname === "/v1/devtools/browser" && request.method === "POST") {
      acquires++;
      if (env.MODE === "nosessionid") return Response.json({ ok: true });
      return Response.json({ sessionId: "sess-" + acquires });
    }
    return new Response("unexpected " + u.pathname, { status: 404 });
  },
};
`;

/* The harness worker: the driver, reachable with a wait this suite chooses, so a
   timeout arm costs a second rather than the op path's fifteen. */
const HARNESS = `
import { renderWithBinding, cdpConnection } from "../src/browserrender.mjs";
export default { async fetch(request, env) {
  /* The fake's own counters are read THROUGH the binding: miniflare dispatches at the
     entry worker, so there is no other door to a named worker in the same instance. */
  if (new URL(request.url).pathname === "/__stats") return env.BROWSER.fetch("https://fake.host/__stats");
  const req = await request.json();
  const answer = await renderWithBinding(env.BROWSER, req);
  return Response.json({ answer, hasCdp: typeof cdpConnection === "function" });
} };
`;

const pageHits = {};
const outbound = (request) => {
  const u = new URL(request.url);
  pageHits[u.pathname] = (pageHits[u.pathname] || 0) + 1;
  return new Response(SHELL, { headers: { "content-type": "text/html; charset=utf-8" } });
};

const browserWorker = (mode = "ok") => ({
  name: "browserfake", modules: true, script: BROWSER_FAKE,
  compatibilityDate: "2026-07-01", bindings: { MODE: mode },
});
const planeWith = (mode = "ok", extra = {}, bindBrowser = true) => new Miniflare({ workers: [
  { name: "plane", modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: "Store", useSQLite: true } },
    r2Buckets: ["CAPTURES", "PUBLISHED"],
    bindings: { ADMIN_TOKEN: "adm-br", MEMBER_TOKEN: "mem-br", PROBE_TOKEN: "prb-br",
                VERSION: "test", INSTANCE_NAME: "brtest",
                GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0", ...extra },
    ...(bindBrowser ? { serviceBindings: { BROWSER: "browserfake" } } : {}),
    outboundService: outbound },
  browserWorker(mode),
] });
const harnessWith = (mode = "ok") => new Miniflare({ workers: [
  { name: "harness", modules: true, modulesRoot: "/", scriptPath: HARNESS_AT, script: HARNESS,
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    serviceBindings: { BROWSER: "browserfake" } },
  browserWorker(mode),
] });

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const row = (code) => ({ code, check: RENDER_CAPTURE_CHECKS[code].check, translation: RENDER_CAPTURE_CHECKS[code].translation });
const refusal = (r) => ({ code: r.code, check: r.check, translation: r.translation });
const acq = (mf) => async (body, token = "mem-br") =>
  (await mf.dispatchFetch(`http://x/api/?op=acquire&store=scratch&token=${token}`,
    { method: "POST", body: JSON.stringify(body) })).json();
const held = (mf) => async (s) => {
  const r = await mf.dispatchFetch(`http://x/api/?op=capture&store=scratch&sha256=${s}&token=mem-br`);
  return r.status === 200 ? Buffer.from(await r.arrayBuffer()) : null;
};
const drive = (mf) => async (req) =>
  (await mf.dispatchFetch("http://x/", { method: "POST", body: JSON.stringify(req) })).json();

/* ====================================================================== A */
/* THE ROW'S ACCEPTS-WHEN. Only BROWSER is bound — no RENDERER service binding
   anywhere in this instance — and the capture that comes back is D-64's pair. */
console.log("\n--- A. a BROWSER binding alone renders, and the capture is D-64's pair ---");
const mf = planeWith("ok");
const acquire = acq(mf), capture = held(mf);
{
  const r = await acquire({ locator: `https://${HOST}/same`, render: true, authority: "City of Example" });
  const d = r.document || {};
  const RSHA = sha(Buffer.from(RENDERED("/same"), "utf-8"));
  t("A1 the render was not refused", [r.ok, r.reason || null], [true, null]);
  t("A2 the PRIMARY is the RENDERED document, under its own digest, and is NOT the shell",
    [d.capture?.sha256, d.capture?.sha256 !== SHELL_SHA], [RSHA, true]);
  t("A3 the primary's method is the one BOB #32 ruled", d.capture?.method, RENDERED_METHOD);
  t("A3b the pair names the primary and both digests", d.pair,
    { primary: "rendered", rendered: { file: "snapshots/same", sha256: RSHA },
      shell: { file: "snapshots/same.shell.html", sha256: SHELL_SHA } });
  t("A4 the SHELL is kept beside it, under ITS digest, with its own method",
    [d.shell?.sha256, d.shell?.method], [SHELL_SHA, "bio-plane acquire, https fetch, hashed at receipt"]);
  t("A5 the pair is joined by render.of", d.render?.of, SHELL_SHA);
  t("A6 BOTH artifacts are retrievable from the store",
    [(await capture(RSHA))?.toString("utf-8"), (await capture(SHELL_SHA))?.toString("utf-8")],
    [RENDERED("/same"), SHELL]);
  /* The engine names ITSELF: `HeadlessChrome/124.0.6367.207` split at the LAST
     slash, never halved into a guess. */
  t("A7 the engine and its version come from Browser.getVersion, split at the last slash",
    [d.render?.engine, d.render?.engine_version], ["HeadlessChrome", "124.0.6367.207"]);
  t("A8 the environment asked for is the environment reported",
    [d.render?.viewport, d.render?.dpr, d.render?.locale, d.render?.timezone],
    [{ width: 1280, height: 800 }, 1, "en-US", "UTC"]);
  t("A8b the wait says WHICH condition ended the render", d.render?.wait?.fired, "networkidle");
  t("A8c the navigation's own status and address are the browser's",
    [d.render?.status, d.render?.navigated_to], [200, `https://${HOST}/same`]);
  t("A8d the request ledger is counted by outcome",
    [d.render?.requests?.made, d.render?.requests?.completed, d.render?.requests?.failed, d.render?.requests?.blocked],
    [4, 4, 0, 0]);
  t("A8e code and layout are not data: only the document and the XHR are",
    (d.render?.data || []).map((x) => x.type).sort(), ["document", "xhr"]);
  t("A8f the script set is NAMED, not undetermined", d.render?.scripts_executed, [`https://${HOST}`]);
  t("A8g elapsed_ms is a number the driver measured, not a default",
    typeof d.render?.elapsed_ms === "number" && d.render.elapsed_ms >= 0, true);
}
/* THE NEGATIVE CONTROL THE ROW NAMES, as an ARM rather than a patch: the same
   plane with the binding taken away answers RENDER_NO_RENDERER by name. */
{
  const none = planeWith("ok", {}, false);
  const before = pageHits[`/same`] || 0;
  const n = await acq(none)({ locator: `https://${HOST}/same`, render: true });
  t("A9 UNBOUND: refused by name, naming `none`", [refusal(n), n.renderer], [row("RENDER_NO_RENDERER"), "none"]);
  t("A10 and NOTHING was fetched", (pageHits[`/same`] || 0) - before, 0);
  await none.dispose();
}

/* ====================================================================== B */
console.log("\n--- B. the request ledger keeps blocked, failed, redirected and pending apart ---");
const h = harnessWith("ok");
const render = drive(h);
{
  const { answer } = await render({ url: `https://${HOST}/mixed`, wait: { until: "networkidle", timeout_ms: 2000 } });
  const byUrl = Object.fromEntries((answer.requests || []).map((r) => [r.url, r]));
  t("B1 a blocked request carries the BROWSER'S OWN reason, not our word for it",
    [byUrl["https://ads.example/pixel.gif"]?.outcome, byUrl["https://ads.example/pixel.gif"]?.blocked_by],
    ["blocked", "inspector"]);
  t("B2 a failed request is FAILED, and is not called blocked",
    [byUrl[`https://${HOST}/missing.json`]?.outcome, "blocked_by" in (byUrl[`https://${HOST}/missing.json`] || {})],
    ["failed", false]);
  /* A request still in flight when the wait ended is `pending`, which `renderBlock`
     counts as `outcome_unstated`. It is NOT rounded up to failed: we did not see it
     fail, we stopped looking. */
  t("B3 a request still in flight is PENDING, never rounded to failed",
    byUrl[`https://${HOST}/slow.json`]?.outcome, "pending");
  t("B4 resource types are lowercased once, here", (answer.requests || []).map((r) => r.type).sort(),
    ["document", "image", "script", "script", "xhr", "xhr"]);
  t("B5 an inline script (no url) is not given an origin it does not have",
    answer.scripts.map((s) => s.url), [`https://${HOST}/app.js`, "https://cdn.analytics.example/a.js"]);
}
{
  const { answer } = await render({ url: `https://${HOST}/redirected`, wait: { until: "networkidle", timeout_ms: 2000 } });
  /* A REDIRECT REUSES THE requestId. Both hops are in the ledger — the 301 closed
     as completed and the landing under the same id — so the page's own history is
     not collapsed into one row. */
  t("B6 a redirect keeps BOTH hops, with their own statuses",
    (answer.requests || []).map((r) => [r.url, r.outcome, r.status]).sort(),
    [[`https://${HOST}/landed`, "completed", 200], [`https://${HOST}/redirected`, "completed", 301]]);
}

/* ====================================================================== C */
console.log("\n--- C. a domain that will not enable is UNDETERMINED, never an empty list ---");
{
  const hn = harnessWith("nonetwork");
  const a = (await drive(hn)({ url: `https://${HOST}/nonetwork`, wait: { until: "networkidle", timeout_ms: 2000 } })).answer;
  t("C1 Network refused: requests is null (undetermined), NOT []", a.requests, null);
  t("C2 and the render still succeeded, with its scripts", [a.ok, (a.scripts || []).length], [true, 1]);
  await hn.dispose();
  const hd = harnessWith("nodebugger");
  const b = (await drive(hd)({ url: `https://${HOST}/noscripts`, wait: { until: "networkidle", timeout_ms: 2000 } })).answer;
  t("C3 Debugger refused: scripts is null (BOB #31's `undetermined`), NOT []", b.scripts, null);
  t("C4 and the request ledger is unaffected", (b.requests || []).length, 1);
  await hd.dispose();
}

/* ====================================================================== D */
console.log("\n--- D. the wait is bounded and says which condition fired ---");
{
  const a = (await render({ url: `https://${HOST}/noload`, wait: { until: "networkidle", timeout_ms: 1200 } })).answer;
  t("D1 a page that never loads ends on TIMEOUT, and that is an answer, not a failure",
    [a.ok, a.wait.fired], [true, "timeout"]);
  t("D2 and the timeout is BOUNDED by what was asked", a.elapsed_ms >= 1200 && a.elapsed_ms < 9000, true);
  const b = (await render({ url: `https://${HOST}/same`, wait: { until: "load", timeout_ms: 2000 } })).answer;
  t("D3 `until: load` fires on the load event, not on quiet", b.wait.fired, "load");
  t("D4 the condition asked for is carried back beside what fired",
    b.wait.condition, { until: "load", timeout_ms: 2000 });
}

/* ====================================================================== E */
console.log("\n--- E. every way the binding can fail says WHICH call failed and what it answered ---");
{
  const ha = harnessWith("noacquire");
  const a = (await drive(ha)({ url: `https://${HOST}/same`, wait: { until: "networkidle", timeout_ms: 2000 } })).answer;
  t("E1 a binding that will not give a session: ok false, naming the status",
    [a.ok, /refused a session: HTTP 503/.test(a.error || "")], [false, true]);
  await ha.dispose();
  const hb = harnessWith("nosessionid");
  const b = (await drive(hb)({ url: `https://${HOST}/same`, wait: { until: "networkidle", timeout_ms: 2000 } })).answer;
  t("E2 a session with no sessionId is not a session", [b.ok, /no sessionId/.test(b.error || "")], [false, true]);
  await hb.dispose();
  const hc = harnessWith("noupgrade");
  const c = (await drive(hc)({ url: `https://${HOST}/same`, wait: { until: "networkidle", timeout_ms: 2000 } })).answer;
  t("E3 an upgrade that is not a socket names the session and the status",
    [c.ok, /did not upgrade session .* to a websocket \(HTTP 200\)/.test(c.error || "")], [false, true]);
  await hc.dispose();
  const d = (await render({ url: `https://${HOST}/navfail`, wait: { until: "networkidle", timeout_ms: 2000 } })).answer;
  t("E4 a navigation the browser refuses names the address and the browser's reason",
    [d.ok, /could not navigate to .*\/navfail: net::ERR_NAME_NOT_RESOLVED/.test(d.error || "")], [false, true]);
  const e = (await render({ url: `https://${HOST}/noserialise`, wait: { until: "networkidle", timeout_ms: 2000 } })).answer;
  t("E5 a browser that returns no document is a failed render, never an empty capture",
    [e.ok, /no serialised document/.test(e.error || "")], [false, true]);
}

{
  /* D-520 — THE NAVIGATION BOUND IS HONOURED. Before D-520 the driver never read
     `navigation_timeout_ms`: Page.navigate was bounded by the WAIT timeout, so a site that
     never commits held the render for the wait's 4,000 ms here, not the 1,000 ms of
     navigation it was asked for and reserved against. The wall clock is the discriminator,
     with the arms far enough apart (1,000 vs 4,000) that a loaded machine cannot blur them. */
  const t0 = Date.now();
  const g = (await render({ url: `https://${HOST}/navhang`, navigation_timeout_ms: 1000,
                            wait: { until: "networkidle", timeout_ms: 4000 } })).answer;
  const took = Date.now() - t0;
  t("E6 a navigation that never commits fails BY NAME inside the asked navigation bound, not the wait's",
    [g.ok, /CDP Page\.navigate did not answer within \d+ ms/.test(g.error || ""), took < 3000], [false, true, true]);
}

/* ====================================================================== F */
console.log("\n--- F. the session is opened once and closed on every path ---");
{
  const stats = async () => (await h.dispatchFetch("http://x/__stats")).json();
  const before = await stats();
  await render({ url: `https://${HOST}/same`, wait: { until: "networkidle", timeout_ms: 2000 } });
  const after = await stats();
  t("F1 one render acquires ONE session and upgrades ONCE",
    [after.acquires - before.acquires, after.upgrades - before.upgrades], [1, 1]);
  t("F2 and closes the target it opened", after.closes - before.closes, 1);
  const beforeFail = await stats();
  await render({ url: `https://${HOST}/navfail`, wait: { until: "networkidle", timeout_ms: 2000 } });
  const afterFail = await stats();
  /* THE FAILING PATH CLOSES TOO. A session left open spends the allowance BOB #32
     item 3 rests on, and the failing path is the one that would leak it. */
  t("F3 a FAILED render still closes its target", afterFail.closes - beforeFail.closes, 1);
  /* OVER-STRICTNESS, IN THE SUITE: a browser that hands out NO page target is not a
     broken browser, it is one that has not opened a tab. The driver must make one
     and render exactly as well — an instrument that refused here would be tighter
     than its rule. */
  const hn = harnessWith("notargets");
  const { answer, hasCdp } = await drive(hn)({ url: `https://${HOST}/same`, wait: { until: "networkidle", timeout_ms: 2000 } });
  t("F4 no page target: the driver opens one and the render is unaffected",
    [answer.ok, answer.status, answer.wait.fired], [true, 200, "networkidle"]);
  t("F5 the CDP connection is the module's own published seam", hasCdp, true);
  await hn.dispose();
}

/* ====================================================================== G */
console.log("\n--- G. a BROWSER bound to something that is not a Fetcher ---");
{
  /* THE SURVIVING MEANING of `browser-binding-without-driver`. Before D-490 it meant
     "the driver is not built", which was true of every instance; now the driver IS
     built, so the only thing left that the plane cannot speak to is a BROWSER bound
     to something that has no `fetch`. The refusal keeps its C-number and its code;
     its SENTENCE changed in `index.mjs`, because the old one said the driver was
     missing and it no longer is. */
  const bb = planeWith("ok", { BROWSER: "not-a-fetcher" }, false);
  const b = await acq(bb)({ locator: `https://${HOST}/same`, render: true });
  t("G1 refused by name, naming the kind", [refusal(b), b.renderer],
    [row("RENDER_NO_RENDERER"), "browser-binding-without-driver"]);
  t("G2 and the sentence says what is actually wrong: it is not a Fetcher",
    [/not a Fetcher/.test(b.detail || ""), /driver over it is not built/.test(b.detail || "")], [true, false]);
  await bb.dispose();
}

/* ====================================================================== H */
console.log("\n--- H. a RENDERER service binding still wins over a BROWSER binding ---");
{
  /* NOT A PREFERENCE TEST — a REGRESSION fence. An instance given a dedicated
     renderer meant it, and D-490 must not have turned a browser binding into an
     override that silently takes a fleet member's work. */
  const both = new Miniflare({ workers: [
    { name: "plane", modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
      compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
      durableObjects: { STORE: { className: "Store", useSQLite: true } },
      r2Buckets: ["CAPTURES", "PUBLISHED"],
      bindings: { ADMIN_TOKEN: "adm-br", MEMBER_TOKEN: "mem-br", PROBE_TOKEN: "prb-br",
                  VERSION: "test", INSTANCE_NAME: "brboth",
                  GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
      serviceBindings: { BROWSER: "browserfake", RENDERER: "renderfake" },
      outboundService: outbound },
    browserWorker("ok"),
    { name: "renderfake", modules: true, compatibilityDate: "2026-07-01", script: `
      export default { async fetch(request) { const q = await request.json();
        return Response.json({ ok: true, html: "<!DOCTYPE html>\\n<html><body>service renderer</body></html>",
          engine: "service-fixture", engine_version: "1", viewport: q.viewport, dpr: q.dpr,
          locale: q.locale, timezone: q.timezone, wait: { condition: q.wait, fired: "networkidle" },
          elapsed_ms: 5, navigated_to: q.url, status: 200, requests: [], scripts: [] }); } };` },
  ] });
  const r = await acq(both)({ locator: `https://${HOST}/same`, render: true, authority: "City of Example" });
  t("H1 the SERVICE renderer answered, not the browser binding", r.document?.render?.engine, "service-fixture");
  await both.dispose();
}

await mf.dispose();
await h.dispose();
/* `N pass, M fail` — THE COMMA IS LOAD-BEARING and this suite paid for learning it.
   `battery.mjs`'s tally reads four forms and no wider (M0-65 / D-413); a bare
   `44 pass 0 fail` matches none of them, so the first full battery on this item read
   `browser-render.test.mjs — assertions unknown` and EXCLUDED all 44 from the headline
   20013. The suite was green and the estate's own figure was quietly short of what it
   could support, which is the same defect as claiming too much wearing the other face. */
console.log(`\nbrowser-render: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
