/* NEGATIVE CONTROL: re-run with `node test/nc-d64.mjs` (one arm: `node test/nc-d64.mjs <arm>`). Run 2026-09-24 on base origin/main 15b2a4c0 plus this item, SIX rows — four arms each armed ALONE, a baseline first and last — each file copied to a UNIQUELY-NAMED per-arm pristine copy OUTSIDE this worktree (moved there 2026-09-24 by D-492 under BOB #32's ruling; it was inside), every patch matched EXACTLY ONCE (armed: true), every restore verified by sha256 AND cmp with the byte count printed and floored at 1000 (4 of 4 MATCH/IDENTICAL). RE-MEASURED 2026-09-24 on origin/main 58293bf31 plus D-492 — the rule that a suite's control is re-armed after the suite changes, and it came back arm-for-arm identical in its NAMES with every tally +8, which is D-492's eight new assertions and nothing else. BASELINE 69 pass 0 fail; BASELINE-LAST 69/0. (1) `determined` — THE ROW'S CONTROL — force `determined` on a page drawing data from a second origin (renderedAuthority stops naming foreign data origins): DECLARED red on B1 by name, B2-B4 and E1, nothing else; ACTUAL 64/5 failing exactly B1 B2 B3 B4 E1, AS DECLARED (was 56/5 before D-492). (2) `emptyscripts` — a script set nobody recorded read as `[]` (none ran): DECLARED D1 D2 D4; ACTUAL 66/3 D1 D2 D4, AS DECLARED (D3, the stated gap, is written by another line and stays green). (3) `shellprimary` — the shell kept as the PRIMARY (the swap to the rendered sha removed): DECLARED A2 A3 A4; ACTUAL 66/3 A2 A3 A4, AS DECLARED — A7/A8 stay green because both artifacts are still stored; only the primary moved, which is exactly what those three read. (4) `overstrict` — OVER-STRICTNESS — the host's own data read as foreign: DECLARED A16 alone (a correct page refused determination); ACTUAL 68/1 A16, AS DECLARED. */
/* NEGATIVE CONTROL (D-492, the RESERVATION): re-run with `node test/nc-d492.mjs` (one arm: `node test/nc-d492.mjs <arm>`). Run 2026-09-24 on base origin/main 58293bf31 plus this item — RE-RUN after the concurrency wait moved from a hand-rolled `Date.now()` deadline to `until`+`budgetAssert` (M0-107), which `budget-sweep.test.mjs` graded UNCHECKED by name and which added the budget's own assertion (68 -> 69); the first run read every arm identically at one tally lower — SIX rows — four arms each armed ALONE, a baseline first and last — each file copied to a UNIQUELY-NAMED per-arm pristine copy OUTSIDE the worktree (BOB #32), every patch matched EXACTLY ONCE (armed: true), every restore verified by sha256 AND cmp with the byte count printed and floored at 1000 (4 of 4 MATCH/IDENTICAL). BASELINE 69 pass 0 fail; BASELINE-LAST 69/0. (1) `noreserve` — THE ROW'S CONTROL — drop the reservation and admit on what has been SPENT, the rule D-492 replaced: DECLARED red on J1 by name, with J2 J3 J4 J5 H2 H3 H4, nothing else — and the wait's `stop` (all K renderers inside means every request was ADMITTED, so no deferral can still be coming) is what keeps this arm pointed at J1 rather than reporting the budget NOT MEASURED; ACTUAL 61/8 failing exactly H2 H3 H4 J1 J2 J3 J4 J5, AS DECLARED — the four concurrent admits all succeed against one `spent_ms`. (2) `norelease` — the reservation is never given back: DECLARED H1 H3 J6; ACTUAL 66/3 H1 H3 J6, AS DECLARED. (3) `releaseunreported` — an unreported render hands its reservation back, D-492's rule inverted: DECLARED J5 ALONE; ACTUAL 68/1 J5, AS DECLARED. (4) `overstrict` — OVER-STRICTNESS — a CORRECT reservation spelled as a JSON string rather than a number must be admitted exactly as before: DECLARED nothing fails; ACTUAL 69/0, the baseline's own tally, AS DECLARED. */
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
 *   - An UNATTENDED caller that asks for a render: capture_requests carries no
 *     render request, so the drain never asks. The deferral is driven here through
 *     the op, by a member; the sweep's own path to it is not built.
 *   - Promotion of the pair into a bundle and the catalogue's C-18.1 over it.
 */
import "./stdio.mjs";                 /* D-282 */
import "./sandbox.mjs";               /* D-186 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { RENDER_CAPTURE_CHECKS } from "../checks/bio-checks.mjs";
import { RENDERED_METHOD, NON_DATA_TYPES, renderReserveMs } from "../src/render.mjs";
import { until, budgetAssert } from "./budget.mjs";   /* M0-107: a wall-clock deadline is spelled ONCE */

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const sha = (b) => createHash("sha256").update(b).digest("hex");

const HOST = "portal.example.gov";
const SHELL = `<!doctype html><html><head><title>Portal</title><script src="/app.js"></script></head>`
            + `<body><div id="root"></div></body></html>`;
const SHELL_SHA = sha(Buffer.from(SHELL, "utf-8"));
const PDF = Buffer.from("%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n", "latin1");

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
  "/same-site": {
    requests: [...same("/same-site"),
      { url: "https://tiles.example.gov/0/0/0.png", type: "image", outcome: "completed", status: 200 }],
    scripts: [{ url: `https://${HOST}/app.js` }] },
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
    wait: { condition: q.wait, fired: "networkidle" }, elapsed_ms: 1000,
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
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
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
t("the fixture has six pages, five that render", [Object.keys(PAGES).length, Object.values(PAGES).filter(Boolean).length], [6, 5]);

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
  t("A13 a data digest is carried as the renderer's claim, labelled",
    d.render && [d.render.data[1].sha256, d.render.data[1].reported_by], ["a".repeat(64), "renderer"]);
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
  t("G6 the BROWSER binding alone is reported, never mistaken for a renderer",
    [refusal(b), b.renderer, /in-plane driver over it is not built/.test(b.detail || "")],
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

await mf.dispose();
console.log(`\nrendered-capture: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
