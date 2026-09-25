/* NEGATIVE CONTROL: re-run with `node test/nc-d64.mjs` (one arm: `node test/nc-d64.mjs <arm>`). RE-RUN IN FULL 2026-09-24 for D-499 on base origin/main 58293bf3 plus this item, EIGHT rows — six arms each armed ALONE, a baseline first and last — each file copied to a UNIQUELY-NAMED per-arm pristine copy OUTSIDE this worktree (corrected by D-499, BOB #32's scratch ruling), every patch matched EXACTLY ONCE (armed: true), every restore verified by sha256 AND cmp with the byte count printed and floored at 1000 (6 of 6 MATCH/IDENTICAL, 19715 and 802628 bytes). BASELINE 76 pass 0 fail; BASELINE-LAST 76/0. (1) `determined` — D-64's control — force `determined` on a page drawing data from a second origin: DECLARED B1 by name, B2-B4, E1; ACTUAL 71/5 B1 B2 B3 B4 E1, AS DECLARED. (2) `emptyscripts` — a script set nobody recorded read as `[]`: DECLARED D1 D2 D4; ACTUAL 73/3, AS DECLARED. (3) `shellprimary` — the shell kept as the PRIMARY: DECLARED A2 A3 A4; ACTUAL 73/3, AS DECLARED. (4) `overstrict` — OVER-STRICTNESS — the host's own data read as foreign: DECLARED A16 and, since D-499, J7; ACTUAL 74/2 A16 J7, AS DECLARED — the arm's set WIDENED by one because D-499 asserts the same property a second time (J7, on the timeout page), not because the arm breaks anything new; it read A16 alone before this item and that is a change in the SUITE, recorded rather than smoothed. (5) `waitcondition` — D-499'S CONTROL, the row's own words: record every wait as `condition`: DECLARED J2 J3 J4 J4b J6 (the timeout page), J10 J11 (an unrecognised word), J12 (no wait reported), and NOT J0 J1 J5 J7 J8 J9 J13 or A-I; ACTUAL 68/8 failing exactly J2 J3 J4 J4b J6 J10 J11 J12, AS DECLARED — the capture is still filed, still graded and still determined under the arm, which is the point: the arm removes the RECORD of which wait fired and nothing else. (6) `waitcase` — D-499'S OVER-STRICTNESS ARM — drop the normalisation so `  NetworkIdle  ` no longer reads as the asked condition: DECLARED J13 ALONE; ACTUAL 75/1 J13, AS DECLARED. */
/* NEGATIVE CONTROL (D-492, the RESERVATION): re-run with `node test/nc-d492.mjs` (one arm: `node test/nc-d492.mjs <arm>`). Run 2026-09-24 on base origin/main 58293bf31 plus this item — RE-RUN after the concurrency wait moved from a hand-rolled `Date.now()` deadline to `until`+`budgetAssert` (M0-107), which `budget-sweep.test.mjs` graded UNCHECKED by name and which added the budget's own assertion (68 -> 69); the first run read every arm identically at one tally lower — SIX rows — four arms each armed ALONE, a baseline first and last — each file copied to a UNIQUELY-NAMED per-arm pristine copy OUTSIDE the worktree (BOB #32), every patch matched EXACTLY ONCE (armed: true), every restore verified by sha256 AND cmp with the byte count printed and floored at 1000 (4 of 4 MATCH/IDENTICAL). BASELINE 69 pass 0 fail; BASELINE-LAST 69/0. (1) `noreserve` — THE ROW'S CONTROL — drop the reservation and admit on what has been SPENT, the rule D-492 replaced: DECLARED red on J1 by name, with J2 J3 J4 J5 H2 H3 H4, nothing else — and the wait's `stop` (all K renderers inside means every request was ADMITTED, so no deferral can still be coming) is what keeps this arm pointed at J1 rather than reporting the budget NOT MEASURED; ACTUAL 61/8 failing exactly H2 H3 H4 J1 J2 J3 J4 J5, AS DECLARED — the four concurrent admits all succeed against one `spent_ms`. (2) `norelease` — the reservation is never given back: DECLARED H1 H3 J6; ACTUAL 66/3 H1 H3 J6, AS DECLARED. (3) `releaseunreported` — an unreported render hands its reservation back, D-492's rule inverted: DECLARED J5 ALONE; ACTUAL 68/1 J5, AS DECLARED. (4) `overstrict` — OVER-STRICTNESS — a CORRECT reservation spelled as a JSON string rather than a number must be admitted exactly as before: DECLARED nothing fails; ACTUAL 69/0, the baseline's own tally, AS DECLARED. */
/* NEGATIVE CONTROL (D-529, the SUBRESOURCE DIGEST): re-run with `node test/nc-d64.mjs <arm>` for `nodigest`, `rendererclaim`, `textstrict`. Run 2026-09-25 on base origin/main 8bdf20e6 plus this item, each arm ALONE with a baseline first and last, every patch matched EXACTLY ONCE (armed: true), every restore verified by sha256 AND cmp (sha256 de1f6240b2ae MATCH, cmp IDENTICAL, 31010 bytes, 3 of 3). BASELINE 95 pass 0 fail; BASELINE-LAST 95/0. (1) `nodigest` — THE ROW'S CONTROL, its own words: drop the digest from each recorded subresource: DECLARED K0 K2 K3 (THE VERIFY ARM, by name) K4 K5 K6 K7 K8 K9 K10 and NOT A13 or A-J; ACTUAL 85/10 failing exactly K0 K2 K3 K4 K5 K6 K7 K8 K9 K10, AS DECLARED. (2) `rendererclaim` — the rule D-529 replaced, a renderer-REPORTED digest recorded as the digest: DECLARED A13 K0 K3 K4 K6 K7 K8, NOT K2 K5 K9 K10; ACTUAL 88/7 failing exactly A13 K0 K3 K4 K6 K7 K8, AS DECLARED — K3 catches it because the store holds no bytes under a claimed digest. (3) `textstrict` — OVER-STRICTNESS — a correct `body_text` (the form CDP gives a text body) treated as missing: DECLARED K0 K3 K4 K5 K6 K8; ACTUAL 89/6 exactly those, AS DECLARED. */
/* D-64 — THE RENDER ARM OF op=acquire, driven THROUGH THE OP.
 *
 * Design: `CLIENT-RENDERED.md` (a development design, cited here and never read by this suite) §"What must be recorded on a
 * rendered capture" (and its DESIGNED 2026-09-21 item 3, the authority rule),
 * BOB #31 (third-party scripts run and every one is recorded, or the set is
 * `undetermined`) and BOB #32 (method `rendered`; ONE capture holds BOTH artifacts,
 * the RENDERED document PRIMARY and the shell beside it under its own digest; an
 * unattended render within the daily allowance, DEFERRED when it is spent, never
 * the shell as the content).
 *
 * ACCEPTS-WHEN (QUEUE.md D-64): a rendered capture of a shell holds both artifacts
 * and names every script origin executed, or says undetermined. NEGATIVE CONTROL:
 * force `determined` on a page drawing data from a second origin, and that arm
 * fails by name (block B, "B1").
 *
 * THE RENDERER IS INJECTED, AND THAT IS STATED BECAUSE IT IS LOAD-BEARING. Miniflare
 * has no browser. The plane's renderer seam (`src/render.mjs` `rendererFor`) reads a
 * service binding `RENDERER`; this suite binds a FUNCTION there that answers in the
 * documented shape, per page, with requests and executed scripts this file wrote.
 *
 * WHAT THIS SUITE CANNOT SEE:
 *   - A REAL BROWSER. Every request list and script list below is this file's. The
 *     suite proves what the PLANE RECORDS from a renderer's answer — the pair, the
 *     render.* fields, the origins by axis, the authority rule, the refusals, the
 *     allowance — and NOTHING about whether Cloudflare Browser Rendering reports
 *     those facts, or reports them truthfully. The in-plane driver over a BROWSER
 *     binding is NOT BUILT, and the binding is NOT in wrangler.jsonc (DIST's deploy
 *     derivation refuses its class); block G proves the plane says so by name when an
 *     instance binds it anyway.
 *   - LIVE BEHAVIOUR. Undetermined until DIST deploys the plane with the binding.
 *   - The D-98 task the rendered arm enqueues when its authority is undetermined:
 *     the enqueue condition changed, and no read in this suite drives the task
 *     consumer, so that change is asserted by nothing here.
 *   - CORRECTED 2026-09-24 BY D-491 / IC-276, NOT EXEMPTED. This read: *"An
 *     UNATTENDED caller that asks for a render: capture_requests carries no render
 *     request, so the drain never asks."* That was true when it was written and is
 *     now false in its premise: `capture_requests.render` exists, the door reads
 *     `render: true`, and the drain asks op=acquire for the render through the ROW
 *     (never through its two-field body). The sweep's path to the DEFERRAL is
 *     driven in `capturerequests.test.mjs` block 7c, whose fixture binds a renderer
 *     and a zero allowance. WHAT IS STILL NOT DRIVEN ANYWHERE, and what this bullet
 *     now means: an unattended render that SUCCEEDS. No instance has a renderer
 *     (2.rendered), and this suite's success arms are a member's, through the op.
 *     CORRECTED 2026-09-24 BY D-522, NOT EXEMPTED: the unattended SUCCESS is now
 *     driven, through the drain with a stub renderer and an allowance of one
 *     reservation, in `d522-unattended-render.test.mjs`. What stays true of the
 *     sentence above is its second half: no deployed instance has rendered anything.
 *   - Promotion of the pair into a bundle and the catalogue's C-18.1 over it.
 */
import { statedJSON } from "./stated.mjs";
import "./stdio.mjs";                 /* D-282 */
import "./sandbox.mjs";               /* D-186 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { RENDER_CAPTURE_CHECKS } from "../checks/bio-checks.mjs";
import { RENDERED_METHOD, NON_DATA_TYPES, RENDER_INCOMPLETE_READING, renderReserveMs } from "../src/render.mjs";
import { until, budgetAssert } from "./budget.mjs";   /* M0-107: a wall-clock deadline is spelled ONCE */

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const sha = (b) => createHash("sha256").update(b).digest("hex");

const HOST = "portal.example.gov";
const SHELL = `<!doctype html><html><head><title>Portal</title><script src="/app.js"></script></head>`
            + `<body><div id="root"></div></body></html>`;
const SHELL_SHA = sha(Buffer.from(SHELL, "utf-8"));
const PDF = Buffer.from("%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n", "latin1");

/* D-529's bytes: a script, a vendor script, a stylesheet with a non-ASCII character (so
   `body_text` is re-encoded, not copied), and an image that is not valid UTF-8 at all. */
const D529 = {
  js: "window.app = { agenda: true };\n",
  vendorJs: "(function(){ /* analytics */ })();\n",
  css: "main { font-family: \"Noto Sans\"; } /* café */\n",
  png: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0xff, 0xfe, 0x00, 0x80]),
};

/* ONE RENDERED DOCUMENT PER PAGE — distinct bytes, so every sha is its own. */
const rendered = (p) => `<!doctype html><html><head><title>Portal</title></head><body><main>`
  + `<h1>Council agenda</h1><p>Rendered for ${p}.</p><a href="https://${HOST}/item/1">Item 1</a></main></body></html>`;

const same = (path) => [
  { url: `https://${HOST}${path}`, type: "document", outcome: "completed", status: 200 },
  { url: `https://${HOST}/app.js`, type: "script", outcome: "completed", status: 200 },
  { url: `https://${HOST}/app.css`, type: "stylesheet", outcome: "completed", status: 200 },
  { url: `https://${HOST}/api/agenda.json`, type: "xhr", outcome: "completed", status: 200, sha256: "a".repeat(64) },
];
const PAGES = {
  "/same": { requests: same("/same"), scripts: [{ url: `https://${HOST}/app.js` }] },
  "/second-origin": {
    requests: [...same("/second-origin"),
      { url: "https://data.vendor.example/v1/agenda.json", type: "fetch", outcome: "completed", status: 200 }],
    scripts: [{ url: `https://${HOST}/app.js` }] },
  "/third-script": {
    requests: [...same("/third-script"),
      { url: "https://cdn.analytics.example/a.js", type: "script", outcome: "completed", status: 200 },
      { url: "https://ads.example/pixel.gif", type: "image", outcome: "blocked", blocked_by: "renderer policy" }],
    scripts: [{ url: `https://${HOST}/app.js` }, { url: "https://cdn.analytics.example/a.js" }] },
  "/scripts-unknown": { requests: same("/scripts-unknown"), scripts: null },
  /* D-499 — THE WAIT'S OWN CASES, one page each. `fired` is the word the RENDERER
     reports; `null` means it reported no wait at all. A page that names no `fired`
     gets "networkidle", which is the condition this plane asks for. */
  "/timeout": { requests: same("/timeout"), scripts: [{ url: `https://${HOST}/app.js` }], fired: "timeout" },
  "/odd-wait": { requests: same("/odd-wait"), scripts: [{ url: `https://${HOST}/app.js` }], fired: "domcontentloaded" },
  "/no-wait": { requests: same("/no-wait"), scripts: [{ url: `https://${HOST}/app.js` }], fired: null },
  "/odd-case": { requests: same("/odd-case"), scripts: [{ url: `https://${HOST}/app.js` }], fired: "  NetworkIdle  " },
  "/same-site": {
    requests: [...same("/same-site"),
      { url: "https://tiles.example.gov/0/0/0.png", type: "image", outcome: "completed", status: 200 }],
    scripts: [{ url: `https://${HOST}/app.js` }] },
  /* D-529 — THE DIGEST PAGE. Every load carries the bytes a browser would hand over, in
     each of the forms the seam admits, beside the ways bytes go missing. The BYTES are
     this file's, and so is every sha the verify arm compares against: the plane's digest
     must equal a hash this suite took of what it SERVED, not of what the plane kept. */
  "/digests": {
    requests: [
      { url: `https://${HOST}/digests`, type: "document", outcome: "completed", status: 200, body_text: SHELL },
      { url: `https://${HOST}/app.js`, type: "script", outcome: "completed", status: 200,
        body_base64: Buffer.from(D529.js).toString("base64") },
      { url: "https://cdn.analytics.example/a.js", type: "script", outcome: "completed", status: 200,
        body_base64: Buffer.from(D529.vendorJs).toString("base64") },
      { url: `https://${HOST}/app.css`, type: "stylesheet", outcome: "completed", status: 200, body_text: D529.css },
      { url: `https://${HOST}/logo.png`, type: "image", outcome: "completed", status: 200,
        body_base64: D529.png.toString("base64") },
      { url: `https://${HOST}/api/agenda.json`, type: "xhr", outcome: "completed", status: 200, sha256: "b".repeat(64) },
      { url: `https://${HOST}/api/evicted.json`, type: "fetch", outcome: "completed", status: 200,
        body_unavailable: "the browser would not give the body: CDP No resource with given identifier found" },
      { url: `https://${HOST}/api/garbled.json`, type: "fetch", outcome: "completed", status: 200, body_base64: "@@not base64@@" },
      { url: `https://${HOST}/missing.js`, type: "script", outcome: "failed", status: 404 },
    ],
    scripts: [{ url: `https://${HOST}/app.js` }, { url: "https://cdn.analytics.example/a.js" }] },
  "/fail": null,
};

let renderCalls = 0;
const pageHits = {};
const renderer = async (request) => {
  renderCalls++;
  const q = await request.json();
  const p = new URL(q.url).pathname;
  const page = PAGES[p];
  if (!page) return Response.json({ ok: false, error: `the renderer timed out on ${p}` });
  return Response.json({
    ok: true, html: rendered(p), engine: "chromium", engine_version: "fixture-1",
    viewport: q.viewport, dpr: q.dpr, locale: q.locale, timezone: q.timezone,
    /* D-499: the fixture's own `fired`, or the asked condition when it names none;
       `null` is a renderer that reported no wait object at all. */
    wait: page.fired === null ? { condition: q.wait }
        : { condition: q.wait, fired: "fired" in page ? page.fired : "networkidle" },
    elapsed_ms: 1000,
    navigated_to: q.url, status: 200, requests: page.requests, scripts: page.scripts,
  });
};
const outbound = (request) => {
  const u = new URL(request.url);
  pageHits[u.pathname] = (pageHits[u.pathname] || 0) + 1;
  if (u.pathname === "/doc.pdf") return new Response(PDF, { headers: { "content-type": "application/pdf" } });
  return new Response(SHELL, { headers: { "content-type": "text/html; charset=utf-8" } });
};
const plane = (extra = {}, serviceBindings = { RENDERER: renderer }) => new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-rnd", MEMBER_TOKEN: "mem-rnd", PROBE_TOKEN: "prb-rnd",
              VERSION: "test", INSTANCE_NAME: "rndtest",
              GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0", ...extra },
  serviceBindings, outboundService: outbound,
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};
const acq = (mf) => async (body, token = "mem-rnd") =>
  (await mf.dispatchFetch(`http://x/api/?op=acquire&store=scratch&token=${token}`,
    { method: "POST", body: JSON.stringify(body) })).json();
const held = (mf) => async (s) => {
  const r = await mf.dispatchFetch(`http://x/api/?op=capture&store=scratch&sha256=${s}&token=mem-rnd`);
  return r.status === 200 ? Buffer.from(await r.arrayBuffer()) : null;
};
const row = (code) => ({ code, check: RENDER_CAPTURE_CHECKS[code].check, translation: RENDER_CAPTURE_CHECKS[code].translation });
const refusal = (r) => ({ code: r.code, check: r.check, translation: r.translation });

const mf = plane();
const acquire = acq(mf), capture = held(mf);

/* ====================================================================== 0 */
console.log("\n--- 0. the family and the fixture are what they claim ---");
t("C-83 has seven rows, each with a C-number and a sentence",
  Object.values(RENDER_CAPTURE_CHECKS).map((r) => /^C-83\.\d+$/.test(r.check) && r.translation.length > 40),
  [true, true, true, true, true, true, true]);
/* THE C-NUMBERS AS LITERALS, so a renumber or a swapped row fails here by name rather
   than agreeing with itself through row() below. */
t("each code carries the C-number this item minted for it",
  Object.fromEntries(Object.entries(RENDER_CAPTURE_CHECKS).map(([k, r]) => [k, r.check])),
  { RENDER_FLAG_MALFORMED: "C-83.1", RENDER_ARM_CONFLICT: "C-83.2", RENDER_NO_RENDERER: "C-83.3",
    RENDER_DEFERRED: "C-83.4", RENDER_HOST_COOLING_OFF: "C-83.5", RENDER_NOT_A_PAGE: "C-83.6",
    RENDER_FAILED: "C-83.7" });
t("the method string is the one BOB #32 ruled", RENDERED_METHOD, "rendered");
t("code and layout are the only non-data axes (inverted list)", Object.values(NON_DATA_TYPES).sort(),
  ["code", "layout", "layout"]);
/* CORRECTED by D-499: this read [6, 5]. The old figure was not wrong when it was
   written, it is SUPERSEDED — D-499 added four pages (/timeout, /odd-wait, /no-wait,
   /odd-case) that drive the wait's own cases, and a count pinned to the old number
   would have failed for the one reason that is not a defect. `/fail` is still the
   only page that does not render. */
/* CORRECTED by D-529: this read [10, 9]. SUPERSEDED, not wrong — D-529 added `/digests`,
   the page whose loads carry their bytes, and a count pinned to the old number would
   fail for the one reason that is not a defect. `/fail` is still the only page that
   does not render. */
t("the fixture has eleven pages, ten that render", [Object.keys(PAGES).length, Object.values(PAGES).filter(Boolean).length], [11, 10]);

/* ====================================================================== A */
console.log("\n--- A. a rendered capture of a shell holds BOTH artifacts, the rendered one primary ---");
{
  const r = await acquire({ locator: `https://${HOST}/same`, render: true, authority: "City of Example" });
  const d = r.document || {};
  const RSHA = sha(Buffer.from(rendered("/same"), "utf-8"));
  t("A0 the capture succeeded", r.ok, true);
  t("A1 the method is `rendered`", d.capture && d.capture.method, "rendered");
  t("A2 the PRIMARY is the rendered document, by its own digest", d.capture && d.capture.sha256, RSHA);
  t("A3 the primary is NOT the shell", d.capture && d.capture.sha256 !== SHELL_SHA, true);
  t("A4 the pair names the primary and both digests", d.pair,
    { primary: "rendered", rendered: { file: "snapshots/same", sha256: RSHA },
      shell: { file: "snapshots/same.shell.html", sha256: SHELL_SHA } });
  t("A5 render.of is the shell's sha", d.render && d.render.of, SHELL_SHA);
  t("A6 the shell keeps its own method and its HTTP exchange",
    d.shell && [d.shell.method, d.shell.sha256, d.shell.transport && d.shell.transport.status],
    ["bio-plane acquire, https fetch, hashed at receipt", SHELL_SHA, 200]);
  t("A7 the store holds the rendered bytes under their sha", (await capture(RSHA))?.toString("utf-8"), rendered("/same"));
  t("A8 the store holds the shell's bytes under their sha", (await capture(SHELL_SHA))?.toString("utf-8"), SHELL);
  t("A9 the bundle's files name the shell beside the primary", r.files, { "snapshots/same.shell.html": SHELL_SHA });
  t("A10 render.* records the environment",
    d.render && [d.render.engine, d.render.engine_version, d.render.viewport, d.render.dpr, d.render.locale,
                 d.render.timezone, d.render.wait.fired, d.render.elapsed_ms],
    ["chromium", "fixture-1", { width: 1280, height: 800 }, 1, "en-US", "UTC", "networkidle", 1000]);
  t("A11 render.requests counts by outcome",
    d.render && d.render.requests, { made: 4, completed: 4, failed: 0, blocked: 0, blocked_by: {}, outcome_unstated: 0 });
  t("A12 render.data holds the DATA the render consumed (document, xhr), not code or layout",
    d.render && d.render.data.map((x) => [x.type, x.origin]), [["document", "same_host"], ["xhr", "same_host"]]);
  /* CORRECTED by D-529 (BOB #33, 2026-09-24 21:05Z), not exempted. This asserted that
     the renderer's reported `sha256` ("a"x64) was carried AS the entry's digest. That
     was the rule before the ruling and is now the defect the ruling names: a digest
     with no bytes behind it cannot be verified by anyone, so it is an equality that
     cost nothing to produce. The claim survives as `renderer_sha256`, labelled; the
     digest reads `undetermined` with its reason. The entry is still the renderer's. */
  t("A13 a digest the renderer REPORTED without bytes is its claim, and the digest is undetermined",
    d.render && [d.render.data[1].sha256, d.render.data[1].renderer_sha256, d.render.data[1].reported_by,
                 /did not deliver this response's bytes/.test(d.render.data[1].digest_reason || "")],
    ["undetermined", "a".repeat(64), "renderer", true]);
  t("A14 EVERY script origin executed is named", d.render && d.render.scripts_executed, [`https://${HOST}`]);
  t("A15 no third party executed, and it says so with an empty list", d.render && d.render.third_party_executed, []);
  t("A16 shell asserted + all data same_host + no foreign code = determined, as the shell's authority",
    [d.authority_state, d.authority], ["determined", "City of Example"]);
  t("A17 the grade is the ordinary direct-capture grade (Bob: the render takes the SAME grade)",
    d.capture && d.capture.grade, (await acquire({ locator: `https://${HOST}/plain` })).document.capture.grade);
  t("A18 the HTTP exchange is the shell's and is NOT on the rendered capture", d.capture && "transport" in d.capture, false);
  t("A19 the profile read the RENDERED document (its bytes are what the digest identity names)",
    d.profile && d.profile.profiled_from_text, true);
}

/* ====================================================================== B */
console.log("\n--- B. a page drawing DATA from a second origin is never `determined` as the host ---");
{
  const r = await acquire({ locator: `https://${HOST}/second-origin`, render: true, authority: "City of Example" });
  const d = r.document || {};
  t("B0 the capture succeeded", r.ok, true);
  t("B1 SECOND-ORIGIN DATA IS NEVER DETERMINED: authority_state is undetermined though the shell was asserted",
    d.authority_state, "undetermined");
  t("B2 and no authority is named for it", "authority" in d, false);
  t("B3 the basis names the other origin and the axis it touched",
    /https:\/\/data\.vendor\.example supplied data \(third_party\)/.test(d.authority_basis || ""), true);
  t("B4 the other origins are listed", d.authority_other_origins, ["https://data.vendor.example"]);
  t("B5 render.data carries the foreign response by origin",
    d.render && d.render.data.filter((x) => x.origin !== "same_host").map((x) => [x.address, x.origin]),
    [["https://data.vendor.example/v1/agenda.json", "third_party"]]);
}

/* ====================================================================== C */
console.log("\n--- C. a third party's SCRIPT that ran is named, and the capture is undetermined ---");
{
  const r = await acquire({ locator: `https://${HOST}/third-script`, render: true, authority: "City of Example" });
  const d = r.document || {};
  t("C1 every script origin executed is named", d.render && d.render.scripts_executed,
    ["https://cdn.analytics.example", `https://${HOST}`]);
  t("C2 the third party that ran is named", d.render && d.render.third_party_executed, ["https://cdn.analytics.example"]);
  t("C3 undetermined, and the basis says it ran code",
    [d.authority_state, /https:\/\/cdn\.analytics\.example ran code/.test(d.authority_basis || "")], ["undetermined", true]);
  t("C4 a blocked request is counted with its rule, and supplied no data",
    d.render && [d.render.requests.blocked, d.render.requests.blocked_by, d.render.data.some((x) => /ads\.example/.test(x.address))],
    [1, { "renderer policy": 1 }, false]);
  t("C5 a third-party SCRIPT is code, not data", d.render && d.render.data.some((x) => /analytics/.test(x.address)), false);
}

/* ====================================================================== D */
console.log("\n--- D. a script set that could not be recorded is `undetermined` (BOB #31), never empty ---");
{
  const r = await acquire({ locator: `https://${HOST}/scripts-unknown`, render: true, authority: "City of Example" });
  const d = r.document || {};
  t("D1 scripts_executed is `undetermined`", d.render && d.render.scripts_executed, "undetermined");
  t("D2 third_party_executed is `undetermined`, not []", d.render && d.render.third_party_executed, "undetermined");
  t("D3 the gap is stated", d.render && d.render.undetermined.some((u) => /^scripts:/.test(u)), true);
  t("D4 the capture is undetermined, saying why", [d.authority_state, /script set/.test(d.authority_basis || "")], ["undetermined", true]);
}

/* ====================================================================== E */
console.log("\n--- E. same_site is not the host (originOf approximates) ---");
{
  const d = (await acquire({ locator: `https://${HOST}/same-site`, render: true, authority: "City of Example" })).document || {};
  t("E1 a same_site data origin leaves the capture undetermined, and says it approximates",
    [d.authority_state, /tiles\.example\.gov supplied data \(same_site, which approximates/.test(d.authority_basis || "")],
    ["undetermined", true]);
}

/* ====================================================================== F */
console.log("\n--- F. an unasserted shell stays undetermined however clean the render ---");
{
  const d = (await acquire({ locator: `https://${HOST}/same`, render: true })).document || {};
  t("F1 undetermined with the shell's reason", [d.authority_state, /served shell's own authority is undetermined/.test(d.authority_basis || "")],
    ["undetermined", true]);
}

/* ====================================================================== G */
console.log("\n--- G. every way a render cannot happen is refused by name; the shell is never filed as content ---");
{
  const before = renderCalls;
  const m = await acquire({ locator: `https://${HOST}/same`, render: "yes" });
  t("G1 render: \"yes\" is refused by name, not read as absent", refusal(m), row("RENDER_FLAG_MALFORMED"));
  t("G1b and filed no document", "document" in m, false);
  const c = await acquire({ locator: `https://${HOST}/same`, render: true, continue: "cs_x" });
  t("G2 render + continue is a named conflict", [refusal(c), c.conflict], [row("RENDER_ARM_CONFLICT"), "continue: <session> (a capture already filed)"]);
  const hitsBefore = pageHits["/doc.pdf"] || 0;
  const p = await acquire({ locator: `https://${HOST}/doc.pdf`, render: true });
  t("G3 a PDF is not a page: refused by name", refusal(p), row("RENDER_NOT_A_PAGE"));
  t("G3b the renderer was never called for it", renderCalls, before);
  t("G3c the shell WAS fetched (the refusal needs its bytes), and nothing was filed", [(pageHits["/doc.pdf"] || 0) - hitsBefore, "document" in p], [1, false]);
  const f = await acquire({ locator: `https://${HOST}/fail`, render: true });
  t("G4 a renderer that produced nothing is refused by name, filed: false", [refusal(f), f.filed, f.shell_sha256],
    [row("RENDER_FAILED"), false, SHELL_SHA]);
  t("G4b and the renderer's reason is carried", /timed out on \/fail/.test(f.detail || ""), true);

  const none = plane({}, {});
  const hits0 = pageHits["/same"] || 0;
  const n = await acq(none)({ locator: `https://${HOST}/same`, render: true });
  t("G5 no renderer bound: refused by name, naming `none`", [refusal(n), n.renderer], [row("RENDER_NO_RENDERER"), "none"]);
  t("G5b and NOTHING was fetched", (pageHits["/same"] || 0) - hits0, 0);
  await none.dispose();
  const bb = plane({ BROWSER: "bound-but-no-driver" }, {});
  const b = await acq(bb)({ locator: `https://${HOST}/same`, render: true });
  /* CORRECTED BY D-490, NOT EXEMPTED. As written this arm asserted the refusal's
     sentence read "the in-plane driver over it is not built", which was true when
     D-64 shipped the seam without a driver. D-490 built the driver
     (`src/browserrender.mjs`), so that sentence became FALSE while this assertion
     went on passing — a test pinning a claim the code no longer supports. The kind
     and the code are unchanged and still correct: this fixture binds BROWSER to a
     STRING, which has no `fetch`, and a binding the plane cannot speak to is still
     never mistaken for a renderer. Only the sentence moved. D-490's own suite
     (`browser-render.test.mjs`, block A) is where a WORKING browser binding is
     driven. */
  t("G6 a BROWSER binding the plane cannot speak to is reported, never mistaken for a renderer",
    [refusal(b), b.renderer, /not a Fetcher/.test(b.detail || "")],
    [row("RENDER_NO_RENDERER"), "browser-binding-without-driver", true]);
  await bb.dispose();
}

/* ====================================================================== H */
console.log("\n--- H. the daily allowance: committed means DEFERRED, recorded, nothing fetched ---");
/* CORRECTED 2026-09-24 BY D-492, NEVER EXEMPTED, and the old figures say why the old
   assertion was wrong rather than merely stale. This block ran on an allowance of 1500 ms
   with renders reporting 1000 ms each, which was a coherent fixture ONLY under the
   admission rule D-492 removed: admit while `spent_ms < allowance`, deciding a render on
   the time ALREADY REPORTED and therefore admitting every render in flight against one
   figure. It could not distinguish the bound the docstring claimed from no bound at all,
   because nothing here ever had two renders in flight at once. The rule is now
   `spent + reserved + this render's RESERVATION <= allowance`, so an allowance smaller
   than one reservation admits NOTHING, and the fixture's 1500 ms would have made every
   arm below read DEFERRED for the wrong reason — a suite agreeing with the code by
   refusing everything. The allowance is therefore one reservation plus the two 1000 ms
   renders this block spends MINUS one, which keeps the block's SUBJECT (two fit, the
   third does not) and makes the third's deferral the allowance's doing and not the
   reservation's: at 46,000 the second render's 1,000 ms plus one reservation is exactly
   the allowance and fits, and the third's 2,000 ms plus one reservation is 1 ms over.
   Block J drives the reservation itself. */
const RESERVE = 45000;            /* the wait timeout (15,000) plus the navigation bound (30,000) */
{
  /* PINNED AS A LITERAL, not read from the module into both sides of the comparison: a
     figure the suite takes from the code agrees with the code for free (WORKER.md). If
     either bound moves, this fails by name and the arithmetic below is re-read. */
  t("H0 one render reserves the wait timeout plus the navigation bound", renderReserveMs(), RESERVE);
  const small = plane({ RENDER_DAILY_ALLOWANCE_MS: String(RESERVE + 1000) });
  const a = acq(small);
  const r1 = await a({ locator: `https://${HOST}/same`, render: true });
  const r2 = await a({ locator: `https://${HOST}/same`, render: true });
  const hits = pageHits["/same"] || 0;
  const r3 = await a({ locator: `https://${HOST}/same`, render: true });
  t("H1 two renders fit: each releases its reservation and charges the 1000 ms it reported",
    [r1.ok, r2.ok], [true, true]);
  t("H2 the third is DEFERRED by name", refusal(r3), row("RENDER_DEFERRED"));
  t("H3 the deferral says content undetermined, counts itself, and reads the allowance as spent with nothing reserved",
    r3.render && [r3.render.state, r3.render.content, r3.render.allowance.spent_ms,
                  r3.render.allowance.reserved_ms, r3.render.allowance.deferred],
    ["deferred", "undetermined", 2000, 0, 1]);
  t("H4 nothing was fetched for the deferred render, and no document filed", [(pageHits["/same"] || 0) - hits, "document" in r3], [0, false]);
  await small.dispose();
}

/* ====================================================================== J */
console.log("\n--- J. D-492: the allowance is RESERVED at admission, so renders in flight are counted ---");
/* ACCEPTS-WHEN (QUEUE.md D-492): K concurrent admits against room for exactly J
   reservations admit J and defer K-J, the admits interleaved BEFORE any spend.
   WHAT THIS BLOCK CANNOT SEE: whether a real browser honours the navigation and wait
   timeouts it is asked for. The reservation is the maximum the ASKED environment
   permits; a renderer that overruns its own bounds reports the longer time and the
   allowance is passed by exactly that excess (store.mjs renderAdmit, residue 1). This
   fixture's renderer honours them by construction, so this suite proves the ACCOUNTING
   and nothing about the renderer. */
{
  const K = 4, J = 2;
  let entered = 0, settled = 0, release = null;
  const gate = new Promise((r) => { release = r; });
  /* A RENDERER THAT DOES NOT RETURN until it is let go, which is the only way to put
     several renders IN FLIGHT AT ONCE through the op. Under the rule D-492 replaced,
     all four would be admitted here: each read the same `spent_ms` of 0. */
  const held = async (request) => {
    const q = await request.json();
    entered++;
    await gate;
    return Response.json({
      ok: true, html: rendered("/same"), engine: "chromium", engine_version: "fixture-1",
      viewport: q.viewport, dpr: q.dpr, locale: q.locale, timezone: q.timezone,
      wait: { condition: q.wait, fired: "networkidle" }, elapsed_ms: 1000,
      navigated_to: q.url, status: 200, requests: PAGES["/same"].requests, scripts: PAGES["/same"].scripts });
  };
  const conc = plane({ RENDER_DAILY_ALLOWANCE_MS: String(RESERVE * J) }, { RENDERER: held });
  const ca = acq(conc);
  const flight = Array.from({ length: K }, () =>
    ca({ locator: `https://${HOST}/same`, render: true }).then((v) => { settled++; return v; }));
  /* THE WAIT IS A BUDGET, SPELLED ONCE (M0-107, `test/budget.mjs`), never a hand-rolled
     `Date.now()` deadline — `budget-sweep.test.mjs` grades that UNCHECKED by name, and the
     reason is this block exactly: an expired deadline MEASURED NOTHING, and reading
     `atRelease` after one would report a machine under load as a broken reservation.
     The gate is released only once J renderers are inside AND the other K-J have already
     been ANSWERED, which is what makes the deferrals happen while the admitted renders are
     still running rather than after they reported. On expiry it is released ANYWAY — the
     flight must resolve or the suite hangs — and J1-J4 are SKIPPED and named, never graded
     over a wait that did not finish.

     `stop` IS WHAT KEEPS THE ROW'S CONTROL POINTED AT THE SUBJECT, and it is the reason
     this is `until` rather than a deadline: once ALL K renderers are inside, every request
     was ADMITTED and no deferral can still be coming, so the wait is OVER and NOT expired.
     That is `until`'s own rule — a subject that ended before the predicate is a FINDING
     about the subject, never a timeout — and without it the arm that drops the reservation
     would sit out the full budget and report NOT MEASURED where J1 should name the defect. */
  const WAIT_MS = 20000;
  const waited = await until(() => entered >= J && settled >= K - J, WAIT_MS,
    { stepMs: 25, stop: () => entered >= K });
  const atRelease = [entered, settled];
  release();
  const out = await Promise.all(flight);
  if (budgetAssert(t, "J the wait for J renderers in flight with the other K-J already answered",
      waited, WAIT_MS,
      "J1 J2 J3 J4 — how many of K were admitted, that each refusal is RENDER_DEFERRED by name, "
      + "that the admits interleaved BEFORE any spend, and what a deferral names as reserved")) {
    const ok = out.filter((r) => r.ok === true).length;
    const deferred = out.filter((r) => r.reason === "RENDER_DEFERRED");
    t("J1 K concurrent admits against room for exactly J reservations admit J and defer K-J",
      [K, ok, deferred.length], [4, J, K - J]);
    /* THE CORPUS IS FLOORED AND PRINTED IN THE ASSERTION ITSELF (WORKER.md: a headline
       totality assertion over an EMPTY corpus passes and proves nothing — measured three
       times in this repo). Under the arm that drops the reservation there are NO deferrals,
       and a bare `deferred.map(...)` on both sides would agree on the empty list. */
    t("J2 every deferral is RENDER_DEFERRED by name, with the deferred content undetermined",
      [deferred.length, ...deferred.map((r) => [refusal(r), r.render && r.render.state, r.render && r.render.content])],
      [K - J, ...deferred.map(() => [row("RENDER_DEFERRED"), "deferred", "undetermined"])]);
    t("J3 the admits INTERLEAVED BEFORE ANY SPEND: J renderers were still running when the other K-J were refused",
      atRelease, [J, K - J]);
    t("J4 a deferral names what is reserved by the renders in flight, not only what is spent",
      [deferred.length, ...deferred.map((r) => [r.render.allowance.spent_ms, r.render.allowance.reserved_ms, r.render.allowance.reserve_ms])],
      [K - J, ...deferred.map(() => [0, RESERVE * J, RESERVE])]);
  }
  await conc.dispose();
}
{
  /* AN UNREPORTED RENDER STAYS CHARGED (D-492's scope). The renderer answers `/fail` with
     no document and no elapsed time, so the plane has no figure for what it cost: the
     reservation is KEPT rather than handed back for time that may well have been spent. */
  const failing = plane({ RENDER_DAILY_ALLOWANCE_MS: String(RESERVE + 2000) });
  const fa = acq(failing);
  const f1 = await fa({ locator: `https://${HOST}/fail`, render: true });
  const f2 = await fa({ locator: `https://${HOST}/same`, render: true });
  t("J5 a render that reported no time is RENDER_FAILED and its reservation stays charged, so the next render is deferred",
    [refusal(f1), refusal(f2), f2.render && f2.render.allowance.reserved_ms],
    [row("RENDER_FAILED"), row("RENDER_DEFERRED"), RESERVE]);
  await failing.dispose();
}
{
  /* RELEASED WITHOUT CHARGE where no renderer was ever asked. Over-strictness arm for the
     reservation: a caller pointed at a PDF must not burn the day's allowance for a render
     that did not happen, so the next render is ADMITTED. */
  const notpage = plane({ RENDER_DAILY_ALLOWANCE_MS: String(RESERVE + 2000) });
  const na = acq(notpage);
  const n1 = await na({ locator: `https://${HOST}/doc.pdf`, render: true });
  const n2 = await na({ locator: `https://${HOST}/same`, render: true });
  t("J6 a shell that is not a page releases the reservation without charge, and the next render is admitted",
    [refusal(n1), n2.ok, n2.document && n2.document.capture.method], [row("RENDER_NOT_A_PAGE"), true, RENDERED_METHOD]);
  await notpage.dispose();
}

/* ====================================================================== I */
console.log("\n--- I. over-strictness: an ordinary capture is untouched ---");
{
  const d = (await acquire({ locator: `https://${HOST}/ordinary`, authority: "City of Example" })).document || {};
  t("I1 no render, shell or pair keys", ["render", "shell", "pair"].map((k) => k in d), [false, false, false]);
  t("I2 the ordinary method, the transport on the capture, the shell's own sha as primary",
    [d.capture && d.capture.method, d.capture && !!d.capture.transport, d.capture && d.capture.sha256],
    ["bio-plane acquire, https fetch, hashed at receipt", true, SHELL_SHA]);
  t("I3 asserted authority is determined as before", d.authority_state, "determined");
  const f = await acquire({ locator: `https://${HOST}/ordinary`, render: false });
  t("I4 render: false is the plain capture, not a malformed flag", [f.ok, f.document && f.document.capture.method, f.document && "render" in f.document],
    [true, "bio-plane acquire, https fetch, hashed at receipt", false]);
}

/* ====================================================================== J */
console.log("\n--- J. D-499: WHICH WAIT FIRED, and the completeness that follows (BOB #32) ---");
{
  /* THE SENTENCE AS A LITERAL, for the same reason the C-numbers are literals above:
     BOB #32 ruled the wording, and a suite that read it out of the module it is
     testing would agree with any reword for free. */
  t("J0 the reading is the sentence BOB #32 ruled", RENDER_INCOMPLETE_READING,
    "render may be incomplete (wait timed out)");

  const r = await acquire({ locator: `https://${HOST}/timeout`, render: true, authority: "City of Example" });
  const d = r.document || {};
  t("J1 A TIMED-OUT RENDER IS NEVER REFUSED: it files the pair, with the rendered method",
    [r.ok, d.capture && d.capture.method, !!d.pair], [true, "rendered", true]);
  t("J2 wait.fired keeps the RENDERER's word and fired_class is the plane's reading of it",
    d.render && [d.render.wait.fired, d.render.wait.fired_class], ["timeout", "timeout"]);
  t("J3 the rendered document's COMPLETENESS is undetermined", d.render && d.render.completeness, "undetermined");
  t("J4 THE ROW'S SENTENCE IS IN THE RECORD, by name",
    d.render && d.render.undetermined.some((u) => u.startsWith(`completeness: ${RENDER_INCOMPLETE_READING} `)), true);
  t("J4b and it says the timeout fired rather than the condition asked, with the figure asked",
    d.render && d.render.undetermined.some((u) => /wait ended on its timeout \(15000 ms asked\) rather than on the `networkidle` condition/.test(u)),
    true);
  t("J5 THE GRADE IS INTACT — the same grade a plain direct capture earns",
    d.capture && d.capture.grade, (await acquire({ locator: `https://${HOST}/plain` })).document.capture.grade);
  t("J6 and the provenance assertion does not present the bytes as the whole page",
    /render may be incomplete \(wait timed out\), so they are not asserted to be the whole page/
      .test((d.provenance_chain && d.provenance_chain[0].asserts) || ""), true);
  t("J7 COMPLETENESS IS NOT AUTHORITY: an all-same-host asserted page is still determined",
    [d.authority_state, d.authority], ["determined", "City of Example"]);

  const c = ((await acquire({ locator: `https://${HOST}/same`, render: true, authority: "City of Example" })).document) || {};
  t("J8 a render whose ASKED condition fired reads condition_met",
    c.render && [c.render.wait.fired, c.render.wait.fired_class, c.render.completeness],
    ["networkidle", "condition", "condition_met"]);
  t("J9 and NOTHING says it may be incomplete, in the record or in the provenance",
    [c.render.undetermined.some((u) => /completeness:/.test(u)),
     /incomplete/.test((c.provenance_chain && c.provenance_chain[0].asserts) || "")], [false, false]);

  const o = ((await acquire({ locator: `https://${HOST}/odd-wait`, render: true, authority: "City of Example" })).document) || {};
  t("J10 A WORD THE PLANE DOES NOT RECOGNISE IS NAMED, never scored as either",
    o.render && [o.render.wait.fired, o.render.wait.fired_class, o.render.completeness],
    ["domcontentloaded", "undetermined", "undetermined"]);
  t("J11 its reading names the word and is NOT the timeout sentence",
    o.render && [o.render.undetermined.some((u) => /wait fired on `domcontentloaded`, which is neither the `networkidle` condition/.test(u)),
                 o.render.undetermined.some((u) => u.includes(RENDER_INCOMPLETE_READING))], [true, false]);

  const n = ((await acquire({ locator: `https://${HOST}/no-wait`, render: true, authority: "City of Example" })).document) || {};
  t("J12 a renderer that reported no wait at all: the field is null, the class undetermined, BOTH gaps stated",
    n.render && [n.render.wait.fired, n.render.wait.fired_class, n.render.completeness,
                 n.render.undetermined.some((u) => u === "wait.fired: not reported by the renderer"),
                 n.render.undetermined.some((u) => /^completeness: the renderer did not report which wait ended the render/.test(u))],
    [null, "undetermined", "undetermined", true, true]);

  /* OVER-STRICTNESS: a renderer that spells the condition it was asked for in a case
     and with padding this suite did not anticipate is CORRECT WORK and must pass. */
  const k = ((await acquire({ locator: `https://${HOST}/odd-case`, render: true, authority: "City of Example" })).document) || {};
  t("J13 OVER-STRICTNESS: `  NetworkIdle  ` is the asked condition, and reads condition_met",
    k.render && [k.render.wait.fired, k.render.wait.fired_class, k.render.completeness],
    ["  NetworkIdle  ", "condition", "condition_met"]);
}

/* ====================================================================== K */
console.log("\n--- K. D-529: every subresource the render loaded carries a digest that VERIFIES, or reads undetermined with its reason ---");
{
  const r = await acquire({ locator: `https://${HOST}/digests`, render: true, authority: "City of Example" });
  const d = r.document || {};
  const subs = (d.render && d.render.subresources) || [];
  const hexed = subs.filter((x) => /^[0-9a-f]{64}$/.test(String(x.sha256)));
  t("K0 the capture was filed, and the corpus is what this block declares (8 loads, 5 with bytes)",
    [r.ok, subs.length, hexed.length], [true, 8, 5]);
  t("K1 a FAILED request loaded nothing and owes no digest", subs.some((x) => /missing\.js/.test(x.address)), false);
  t("K2 every loaded subresource carries a `sha256` field — hex or `undetermined`, never absent or null",
    subs.every((x) => typeof x.sha256 === "string" && (x.sha256 === "undetermined" || /^[0-9a-f]{64}$/.test(x.sha256))), true);

  /* THE VERIFY ARM (the row's accepts-when). Each digest is checked TWICE, and neither
     check can agree for free: the bytes come back THROUGH THE OP by that digest and are
     re-hashed here, and the digest must equal this suite's own hash of what it SERVED. */
  const want = {
    [`https://${HOST}/digests`]: sha(Buffer.from(SHELL, "utf-8")),
    [`https://${HOST}/app.js`]: sha(Buffer.from(D529.js)),
    "https://cdn.analytics.example/a.js": sha(Buffer.from(D529.vendorJs)),
    [`https://${HOST}/app.css`]: sha(Buffer.from(D529.css, "utf-8")),
    [`https://${HOST}/logo.png`]: sha(D529.png),
  };
  const verified = [];
  for (const x of hexed) {
    const b = await capture(x.sha256);
    verified.push([x.address, !!b && sha(b) === x.sha256, x.sha256 === want[x.address], !!b && b.length === x.bytes]);
  }
  t("K3 VERIFY: each digest re-hashes from the bytes the store returns for it, equals the served bytes' hash, and states their length",
    verified.sort(), Object.keys(want).map((a) => [a, true, true, true]).sort());
  t("K4 the digest is the PLANE'S, and says what it is of: exact bytes, or the browser's decoded text",
    Object.fromEntries(hexed.map((x) => [x.address.replace(/^https:\/\/[^/]+/, ""), [x.digest_by, x.body_as]])),
    { "/digests": ["plane", "decoded_text"], "/app.js": ["plane", "bytes"], "/a.js": ["plane", "bytes"],
      "/app.css": ["plane", "decoded_text"], "/logo.png": ["plane", "bytes"] });
  t("K5 the browser's copy of the page document verifies against the SHELL the plane fetched itself",
    (hexed.find((x) => x.type === "document") || {}).sha256, d.render && d.render.of);

  const why = Object.fromEntries(subs.filter((x) => x.sha256 === "undetermined")
    .map((x) => [x.address.replace(/^https:\/\/[^/]+/, ""), x.digest_reason || ""]));
  t("K6 each load whose bytes were not kept reads undetermined WITH its reason",
    [Object.keys(why).sort(), /did not deliver this response's bytes/.test(why["/api/agenda.json"]),
     /No resource with given identifier found/.test(why["/api/evicted.json"]), /not valid base64/.test(why["/api/garbled.json"])],
    [["/api/agenda.json", "/api/evicted.json", "/api/garbled.json"], true, true, true]);
  t("K7 a digest the renderer only REPORTED is kept as its claim and never as the digest",
    subs.filter((x) => x.renderer_sha256).map((x) => [x.sha256, x.renderer_sha256]), [["undetermined", "b".repeat(64)]]);
  t("K8 the gap is stated once in render.undetermined, counted",
    d.render && d.render.undetermined.filter((u) => /^subresources: 3 of the 8 subresources the render loaded carry no digest/.test(u)).length, 1);
  t("K9 render.data carries the SAME digests as the loads it is a subset of (one lookup, not a second copy)",
    d.render && d.render.data.every((e) => { const x = subs.find((s) => s.address === e.address); return x && x.sha256 === e.sha256; }), true);
  t("K10 a third-party SCRIPT that ran is recorded WITH ITS DIGEST (BOB #31 + BOB #33)",
    subs.filter((x) => x.type === "script" && /analytics/.test(x.address)).map((x) => x.sha256), [sha(Buffer.from(D529.vendorJs))]);
}

await mf.dispose();
console.log(`\nrendered-capture: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
