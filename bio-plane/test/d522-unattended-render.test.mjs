/* NEGATIVE CONTROL: RUN 2026-09-24 by WORKER D-522 against base origin/main 8bdf20e6 plus this suite; each arm ALONE,
   every restore verified by sha256 AND by `cmp` against a per-arm pristine copy. Declared before arming: arms (1) and (2)
   MUST fail the success arms BY NAME and leave the plain-request arm green; arm (3) MUST fail only the over-strictness arm.
   Baseline 20 pass, 0 fail before and after; ALL THREE ARMS BEHAVED AS DECLARED. Figures are MEASURED.
   (1) THE CARRY. In src/index.mjs replace `if (arm.render) body.render = true;` with `if (false) body.render = true;`
       -> 11 pass, 9 FAIL: the accepts-when arm fails BY NAME (the drain's capture IS the shell), the row carries the
       shell's digest, the log names it, and the second render is no longer deferred because the first spent nothing.
       FINDING ABOUT THE ARM, NOT THE SUBJECT: B's first draft compared the log to the drain's own `sha`, so both named
       the shell and B PASSED under this arm; B now compares to a digest computed from the fixture, and fails.
   (2) THE DOOR. In src/store.mjs replace `const render = renderRaw === true ? 1 : 0;` with `const render = 0;`
       -> 9 pass, 11 FAIL: the flag is dropped at the row, so the ask itself reads `render: false` and every arm
       downstream of it fails by name — the column and the carry are both load-bearing.
   (3) OVER-STRICTNESS, the direction a one-sided suite misses: make the drain ask for a render on EVERY row, so a
       plain request is rendered too. In src/index.mjs replace `if (arm.render) body.render = true;` with
       `if (true) body.render = true;`
       -> 19 pass, 1 FAIL: exactly the plain-request arm (D). The renderer is still not reached for it, because the
       upgraded ask is DEFERRED by the spent allowance — a render nobody asked for would have spent a member's day.
 * =========================================================================
 * D-522 — AN UNATTENDED RENDER THAT SUCCEEDS, DRIVEN THROUGH THE DRAIN.
 *
 * WHAT THIS SUITE MOVES. D-491 built the unattended ASK (`capture_requests.render`, carried on the ROW into
 * op=acquire) and drove only its DEFERRAL: `capturerequests.test.mjs` block 7c's fixture sets today's allowance to
 * ZERO, so a render it asks for never runs. `rendered-capture.test.mjs` drives renders that succeed, but every one is a
 * MEMBER's, through the op. So an unattended render that SUCCEEDS was driven by NO suite — the measured failure this
 * suite moves (QUEUE.md D-522's accepts-when). BOB #32's item 3 (CLIENT-RENDERED.md, "RULED 2026-09-23 by BOB #32"):
 * *"An unattended sweep MAY render, within the instance's daily render allowance and through the host governor."*
 *
 * WHAT IS ASSERTED, in order:
 *   A. A capture request for a client-rendered source that asks `render: true` is drained by the DAEMON — not a
 *      member, not the op's own caller — and COMPLETES as a rendered capture: the row's `capture_sha` is the digest
 *      of the RENDERED document, the bytes held under it are the renderer's page and NOT the served shell, and the
 *      shell is held beside it under its own digest (BOB #32 item 2: one capture, both artifacts, rendered PRIMARY).
 *   B. The run's log carries the look as PRESENT with the RENDERED digest as its result — the record never names
 *      the frame of the page as what was found.
 *   C. WITHIN THE ALLOWANCE: the allowance is sized to exactly one render's reservation, so the first unattended
 *      render is admitted and the second is DEFERRED by name (C-83.4) with the renderer never reached for it.
 *   D. OVER-STRICTNESS: a PLAIN request for a source of the same shape captures the served document exactly as
 *      before, and the renderer is not called for it. The plane never upgrades a request the caller did not make.
 *
 * WHAT THIS SUITE CANNOT SEE, stated because it is load-bearing:
 *   - A LIVE render. The renderer is a function bound at `RENDERER` (render.mjs `rendererFor`'s first branch); no
 *     deployed instance has rendered anything (construct 2.rendered). Nothing here is evidence about Cloudflare's
 *     Browser Rendering service.
 *   - WHO SETS THE FLAG unattended. The only writer of a `capture_requests` row is the door (`op=capturerequest`),
 *     which an investigative RUN calls; CAP-3's two consumers (`archive-monitor`, `monitor-cadence`) fire op=acquire
 *     (via archive.org) and op=monitor and write no capture request at all. So "the CAP-3 sweep sets `render`" names
 *     no site in the code: D-522 was NARROWED to the success path, and op=monitor's handling of a rendered or
 *     client-rendered baseline is routed separately (the worker's report).
 *   - The alarm's own dispatch. The drain is called directly, as `capturerequests.test.mjs` does; the alarm that
 *     calls it is REC-1's and is driven in its own suites.
 * ========================================================================= */
import "./stdio.mjs";                 /* D-282 */
import "./sandbox.mjs";               /* D-186 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { RENDER_CAPTURE_CHECKS, EARNED_CAPTURE_CEILING } from "../checks/bio-checks.mjs";
import { RENDERED_METHOD, renderReserveMs } from "../src/render.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const SRC = (f) => join(DIR, "..", "src", f);
const sha = (b) => createHash("sha256").update(b).digest("hex");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

/* THE SOURCE: a client-rendered portal. Its served document is the frame and nothing else — the shape 0.42.0 found
   at oaklandca.opengov.com (CLIENT-RENDERED.md's opening). Each path is its own document, so each request is its own
   row (the door is idempotent on (run, address, render)). */
const HOST = "portal.example.gov";
const RENDER_PAGE = `https://${HOST}/agendas/council-2026-09`;
const RENDER_PAGE_2 = `https://${HOST}/agendas/council-2026-10`;
const PLAIN_PAGE = `https://${HOST}/agendas/plain-2026-09`;
const SHELL = `<!doctype html><html><head><title>Portal</title><script src="/app.js"></script></head>`
            + `<body><div id="root"></div></body></html>`;
const SHELL_SHA = sha(Buffer.from(SHELL, "utf-8"));
const renderedHtml = (p) => `<!doctype html><html><head><title>Portal</title></head><body><main>`
  + `<h1>Council agenda</h1><p>Rendered unattended for ${p}.</p></main></body></html>`;

let RENDER_CALLS = 0;
const RENDERED_FOR = [];
const renderer = async (request) => {
  RENDER_CALLS++;
  const q = await request.json();
  const p = new URL(q.url).pathname;
  RENDERED_FOR.push(p);
  return Response.json({
    ok: true, html: renderedHtml(p), engine: "chromium", engine_version: "fixture-d522",
    viewport: q.viewport, dpr: q.dpr, locale: q.locale, timezone: q.timezone,
    wait: { condition: q.wait, fired: "networkidle" }, elapsed_ms: 1000,
    navigated_to: q.url, status: 200,
    requests: [
      { url: q.url, type: "document", outcome: "completed", status: 200 },
      { url: `https://${HOST}/app.js`, type: "script", outcome: "completed", status: 200 },
    ],
    scripts: [{ url: `https://${HOST}/app.js` }],
  });
};
const SEEN = [];
const outbound = (request) => {
  SEEN.push(request.url);
  return new Response(SHELL, { headers: { "content-type": "text/html; charset=utf-8" } });
};

/* EXACTLY ONE RENDER'S RESERVATION. Admission is `spent + reserved + this <= allowance` (D-492), so the first render
   is admitted at 0 + 0 + R <= R; it reports 1000 ms and releases its reservation, so the second reads
   1000 + 0 + R > R and is DEFERRED. That is what makes arm C's "within the allowance" an arithmetic fact rather than
   an unexercised limit. */
const RESERVE = renderReserveMs();

let MF;
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC("index.mjs"),
  script: readFileSync(SRC("index.mjs"), "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-d522", MEMBER_TOKEN: "mem-d522", PROBE_TOKEN: "prb-d522",
              DAEMON_TOKEN: "dmn-d522", VERSION: "0.60.0", INSTANCE_NAME: "biosmoke-d522",
              GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0",
              /* Pinned out of the test window so only the hand-driven drain runs (capturerequests' trick). */
              CAPTURE_REQUEST_TICK_MS: "3600000", MONITOR_TICK_MS: "3600000",
              RENDER_DAILY_ALLOWANCE_MS: String(RESERVE) },
  serviceBindings: { SELF: async (request) => MF.dispatchFetch(request), RENDERER: renderer },
  outboundService: outbound,
});
MF = mf;

const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());

try {

const ns = await mf.getDurableObjectNamespace("STORE");
const doStub = ns.get(ns.idFromName("bio"));
const captures = await mf.getR2Bucket("CAPTURES");
const held = async (s) => {
  const o = await captures.get(`bio/captures/${s}`);
  return o ? Buffer.from(await o.arrayBuffer()).toString("utf-8") : null;
};

/* ---------------------------------------------------------------- fixture: a member, a question, a run */
const add = await POST("op=memberadd&token=adm-d522",
  { memberId: "ruth", cover: "cover for ruth", role: "admin", capabilities: ["contribute", "publish"] });
const en = await POST("op=enroll", { invite: add.invite, handle: "ruth", password: "ruth-passphrase-1" });
if (!en.ok) throw new Error(`enroll: ${JSON.stringify(en)}`);
const lg = await POST("op=login", { role: "member:ruth", password: "ruth-passphrase-1" });
if (!lg.token) throw new Error(`login: ${JSON.stringify(lg)}`);
const RUTH = lg.token;

const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
const INQ = "INQ-2026-5220-council-agendas";
const inquiryMd = ["---",
  `id: ${INQ}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "What did the council put on its agenda?"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next agenda",
  "    description: The next agenda may restate the item.",
  "---", "",
  "## Question", "", "What did the council put on its agenda?", "",
  "## What It Rests On", "", "## Conclusion", "", "## What Would Falsify This", "",
  "## Session Log", "", `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "", "## Review Notes", ""].join("\n");
{
  const p = await POST(`op=promote&token=${RUTH}`, {
    bundleId: INQ, base: null, snapKey: `${INQ}-000001`,
    files: [{ path: "bundle.md", text: inquiryMd, bytes: inquiryMd.length, sha256: sha(inquiryMd) }],
    register: [],
    meta: { object_type: "inquiry", group: "believe-in-oakland", title: `Bundle ${INQ}`,
            current_state: "open", created: NOW, last_updated: LATER } });
  if (!p.ok) throw new Error(`promote: ${JSON.stringify(p).slice(0, 600)}`);
}
const RUN = "RUN-2026-0924-d522";
{
  const r = await POST(`op=airunopen&token=${RUTH}`, {
    run: RUN, contextType: "inquiry", contextId: INQ,
    label: "D-522 fixture — the run every request names", mode: "check",
    principalClaude: "project", principalClaudeRef: "believe-in-oakland/claude",
    skillVersion: "investigative-session@1", biasManifest: null,
    bounds: [{ bound: "fetches", allowed: 50, unit: "requests" }], leaseMs: 900000 });
  if (r?.started !== true) throw new Error(`airunopen: ${JSON.stringify(r)}`);
}
const request = async (body) => POST(`op=capturerequest&token=${RUTH}`,
  { target: INQ, run: RUN, purpose: "investigate", ...body });
const drain = async () => await doStub.captureRequestDrain({ actor: "suite" });
const rowOf = async (id) => (await GET(`op=capturerequests&token=${RUTH}&run=${RUN}`)).requests.find((r) => r.request === id);

console.log("\n--- 0. the fixture is what it claims ---");
t("the allowance is ONE reservation, and a reservation is positive — a zero here would defer the success arm and "
+ "prove nothing about it", [RESERVE > 1000, RESERVE], [true, renderReserveMs()]);
t("the shell carries no content — it is the frame of the page, so a capture holding it would be the defect",
  /Council agenda/.test(SHELL), false);

/* ====================================================================== A */
console.log("\n--- A. an UNATTENDED request for a client-rendered source COMPLETES as a rendered capture ---");
const ID_RENDER = "CR-D522-1-RENDER";
let renderedSha = null;
/* THE EXPECTED DIGEST IS COMPUTED HERE FROM THE FIXTURE, never read back from the drain: B's first draft compared the
   log against the drain's own `sha`, so with the carry dropped (arm 1) both named the SHELL and B passed — an
   equality that cost nothing. Found by the negative control. */
const WANT_RENDERED = sha(Buffer.from(renderedHtml(new URL(RENDER_PAGE).pathname), "utf-8"));
{
  const rq = await request({ address: RENDER_PAGE, render: true, request: ID_RENDER });
  t("the run's request for the page as a visitor saw it is QUEUED with the flag on the row",
    [rq.ok, rq.requested, rq.render, rq.request], [true, true, true, ID_RENDER]);

  const seen0 = SEEN.length, calls0 = RENDER_CALLS;
  const d = await drain();
  const cap = (d.captured || []).find((c) => c.request === ID_RENDER);
  t("the DAEMON's drain captured it — not held, not refused",
    [!!cap, (d.held || []).some((h) => h.request === ID_RENDER), (d.refused || []).some((r) => r.request === ID_RENDER)],
    [true, false, false]);
  t("the source was asked ONCE for its served document and the renderer was asked ONCE for the page",
    [SEEN.length - seen0, RENDER_CALLS - calls0], [1, 1]);
  renderedSha = cap ? cap.sha : null;
  const want = WANT_RENDERED;
  t("THE ACCEPTS-WHEN: the capture the drain recorded is the RENDERED document, never the served shell "
  + "(BOB #32 item 3: *it never records the shell as though it were the content*)",
    [renderedSha === want, renderedSha === SHELL_SHA], [true, false]);
  t("and its grade is the ordinary direct-capture grade (BOB #32 item 2: rendering is not a lesser capture)",
    cap && cap.grade, EARNED_CAPTURE_CEILING);

  const row = await rowOf(ID_RENDER);
  t("the ROW reads captured, asked for the render, and carries the RENDERED digest",
    row && [row.state, row.render, row.code, row.capture_sha === want], ["captured", true, null, true]);
  t("the bytes held under that digest are the renderer's page, and they carry what the shell does not",
    [/Rendered unattended for \/agendas\/council-2026-09/.test((await held(renderedSha)) || "")], [true]);
  t("THE PAIR: the served shell is held BESIDE it under its own digest — the one part anyone can re-verify "
  + "against the source (BOB #32 item 2)", await held(SHELL_SHA), SHELL);
}

/* ====================================================================== B */
console.log("\n--- B. the run's log names the RENDERED document as what was found ---");
{
  const log = await GET(`op=airunlog&token=${RUTH}&run=${RUN}`);
  const line = (log.entries || []).filter((e) => e.subject === RENDER_PAGE).pop();
  t("the look is PRESENT, ungoverned, and its result is the rendered digest — not the shell's",
    line && [line.state, line.governed, line.result_ref ?? line.resultRef ?? null],
    ["PRESENT", false, WANT_RENDERED]);
}

/* ====================================================================== C */
console.log("\n--- C. WITHIN THE ALLOWANCE: the next unattended render the day cannot pay for is DEFERRED ---");
{
  const ID2 = "CR-D522-2-RENDER";
  const rq = await request({ address: RENDER_PAGE_2, render: true, request: ID2 });
  t("a second render request is queued", [rq.ok, rq.render], [true, true]);
  const seen0 = SEEN.length, calls0 = RENDER_CALLS;
  const d = await drain();
  const h = (d.held || []).find((x) => x.request === ID2);
  t("it is HELD as RENDER_DEFERRED under the C-number the family minted — the first render spent the allowance",
    h && [h.code, h.check], ["RENDER_DEFERRED", RENDER_CAPTURE_CHECKS.RENDER_DEFERRED.check]);
  t("and nothing left the instance for it: no fetch, no render", [SEEN.length - seen0, RENDER_CALLS - calls0], [0, 0]);
  const row = await rowOf(ID2);
  t("its row holds no capture — the shell is not filed in the render's place",
    row && [row.state, row.code, row.capture_sha], ["requested", "RENDER_DEFERRED", null]);
}

/* ====================================================================== D */
console.log("\n--- D. OVER-STRICTNESS: a PLAIN request captures the served document, and nothing renders it ---");
{
  const ID3 = "CR-D522-3-PLAIN";
  const rq = await request({ address: PLAIN_PAGE, request: ID3 });
  t("a request that does not ask for a render is queued without the flag", [rq.ok, rq.render], [true, false]);
  const calls0 = RENDER_CALLS;
  const d = await drain();
  const cap = (d.captured || []).find((c) => c.request === ID3);
  t("it captures the document as the site serves it — the plane never upgrades an ask nobody made",
    [!!cap, cap && cap.sha === SHELL_SHA], [true, true]);
  t("and the renderer was not reached for it", RENDER_CALLS - calls0, 0);
}

t("THE RENDERER WAS REACHED EXACTLY ONCE IN THE WHOLE SUITE, and for the page that asked",
  RENDERED_FOR, ["/agendas/council-2026-09"]);
t("and the method a rendered capture is filed under is the one render.mjs names (imported, not typed)",
  typeof RENDERED_METHOD === "string" && RENDERED_METHOD.length > 0, true);

} catch (e) {
  console.log(`  FAIL  suite threw: ${e && e.stack || e}`);
  fail++;
} finally {
  await mf.dispose();
}

console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
