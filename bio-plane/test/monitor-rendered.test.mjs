/* NEGATIVE CONTROL: (run 2026-09-25, D-567) three arms, each armed ALONE, every patch matched EXACTLY ONCE, each file restored from a uniquely-named per-arm pristine copy in the session scratchpad and verified by sha256 AND cmp (index.mjs 841346 bytes, 332b472d...; store.mjs 3329077 bytes); BASELINE 28 pass 0 fail, and 28/0 after the last restore. (1) THE ROW'S: point the tick at `capture.sha256` (`baseline = match?.capture?.sha256 || null` in the render branch): the unchanged-shell arm fails BY NAME at U1, with U2 U4 U5 U6 U7 U10, C1 (it pins the baseline) and N1 N2 (a row without a shell now compares the rendered digest); 18 pass 10 fail. (2) `norender`: the rendered-row detection forced false (the tick before D-567): DECLARED U1-U7 U10, C2-C5, N1-N3, and no O arm; ACTUAL 12/16, those plus C1, which asserts the baseline field and was not in the declaration (a finding about the declaration, recorded). (3) `noscope`: the observation log's `frame`/`content undetermined` wording dropped in store.mjs `monitorObservationFor`: DECLARED U7 and C5 ALONE; ACTUAL 26/2 U7 C5, AS DECLARED. OVER-STRICTNESS is held in the suite, not an arm: O1/O2 (an ordinary capture still compares its own digest) pass under every arm. */
/* D-567 — A MONITORING TICK ON A RENDERED CAPTURE WATCHES THE FRAME, AND STATES THE CONTENT UNDETERMINED.
 *
 * Design: `CLIENT-RENDERED.md` "RULED 2026-09-25 by BOB #34: a monitoring tick on a rendered capture"
 * (option (b)), beside BOB #32's 2026-09-23 ruling that makes the RENDERED document the pair's PRIMARY.
 *
 * THE DEFECT. op=monitor re-fetches the SERVED document and cannot render. On a render:true capture the
 * register row's `capture.sha256` names the RENDERED primary, so comparing a fresh shell against it read
 * `modified` on every tick for a change nobody made — D-472's cry-wolf class (found by D-522's worker by
 * reading the code; this suite is the first to DRIVE it).
 *
 * THE RULE UNDER TEST. The tick compares the served shell with the pair's own `shell.sha256`, never with
 * `capture.sha256`: a match reads "frame unchanged" and moves no `source_status` (a shell match is not the
 * document being stable), a difference reads `modified` about the frame only, and EVERY tick states the
 * content undetermined in the ruling's words.
 *
 * THE BASELINE IS A REAL render:true ACQUIRE (the renderer injected through the `RENDERER` seam, as
 * `rendered-capture.test.mjs` does — Miniflare has no browser), promoted into data/provenance.json exactly
 * as a caller does. A hand-built pair would agree with the tick for free.
 *
 * ACCEPTS-WHEN (QUEUE.md D-567): an unchanged shell ticks "frame unchanged; content undetermined" (U), a
 * changed one `modified` (frame) (C). NEGATIVE CONTROL: point the tick at `capture.sha256` and U fails by name.
 * OVER-STRICTNESS: an ordinary (not rendered) capture still compares its own `capture.sha256` (O).
 * Written in its own file because D-571 edits monitor-cadence.test.mjs concurrently.
 */
import { statedJSON } from "./stated.mjs";
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { RENDER_TICK_UNDETERMINED } from "../src/render.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const sha = (v) => createHash("sha256").update(Buffer.from(v, "utf-8")).digest("hex");

const HOST = "portal.example.gov";
const SHELL_A = `<!doctype html><html><head><title>Portal</title><script src="/app.js"></script></head>`
              + `<body><div id="root"></div></body></html>`;
const SHELL_B = SHELL_A.replace("/app.js", "/app.v2.js");
/* ONE RENDERED DOCUMENT PER PAGE: identical bytes would be one capture, which the record lets only ONE bundle
   register (C-53.13), so each page renders its own. */
const rendered = (path) => `<!doctype html><html><head><title>Portal</title></head><body><main>`
               + `<h1>Council agenda</h1><p>Item 1: the budget, rendered for ${path}.</p></main></body></html>`;
const PLAIN = "<!doctype html><html><body><main><p>A static report.</p></main></body></html>";

const serve = { "/agenda": SHELL_A, "/agenda-noshell": SHELL_A.replace("Portal", "Portal (no shell row)"), "/plain.html": PLAIN };
const renderer = async (request) => {
  const q = await request.json();
  return Response.json({
    ok: true, html: rendered(new URL(q.url).pathname), engine: "chromium", engine_version: "fixture-1",
    viewport: q.viewport, dpr: q.dpr, locale: q.locale, timezone: q.timezone,
    wait: { condition: q.wait, fired: "networkidle" }, elapsed_ms: 1000,
    navigated_to: q.url, status: 200,
    requests: [{ url: q.url, type: "document", outcome: "completed", status: 200 },
               { url: `https://${HOST}/app.js`, type: "script", outcome: "completed", status: 200 }],
    scripts: [{ url: `https://${HOST}/app.js` }],
  });
};
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-mr", MEMBER_TOKEN: "mem-mr", PROBE_TOKEN: "prb-mr", VERSION: "test",
              INSTANCE_NAME: "mrtest", GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  serviceBindings: { RENDERER: renderer },
  outboundService(request) {
    const u = new URL(request.url);
    if (u.pathname in serve) return new Response(serve[u.pathname], { headers: { "content-type": "text/html; charset=utf-8" } });
    return new Response("unscripted", { status: 500 });
  },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};
const P = async (op, b) => (await mf.dispatchFetch(`http://x/api/?op=${op}&token=mem-mr&store=scratch`,
  { method: "POST", body: JSON.stringify(b) })).json();
const G = async (q) => (await mf.dispatchFetch(`http://x/api/?token=mem-mr&store=scratch&${q}`)).json();
const live = async (id) => (await G(`op=image&id=${encodeURIComponent(id)}`)).result["bundle.md"];

const NOW = "2026-09-25T00:00:00Z";
/* The seeded `source_status` is `modified` ON PURPOSE: a frame match must leave it exactly as it was, and a
   seed of `unchanged` would make "left alone" and "written unchanged" read the same. */
const bundleMd = (id, locator) => [
  "---", `id: ${id}`, "object_type: information", "schema: information@2",
  `title: "Monitored ${id}"`, "current_state: collected", "prior_state: null",
  `created: ${NOW}`, `last_updated: ${NOW}`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
  "  source: null", "visuals: []", "criticality: supporting", "source_status: modified",
  "source:", `  locator: ${locator}`, "  authority: City Clerk", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: true", "  frequency: daily", "  last_checked: null", "---", "",
  "## Summary", "", "A monitored source.", "", "## Provenance Notes", "",
  "## Session Log", "", "### Session 1", "", "Captured.", "", "## Review Notes", "",
].join("\n");

let seq = 0;
const monitoredFrom = async (path, { render, strip } = {}) => {
  const locator = `https://${HOST}${path}`;
  const acq = await P("acquire", { locator, authority: "City Clerk", ...(render ? { render: true } : {}) });
  const doc = acq.document;
  if (!doc) return { acq };
  const reg = strip ? strip(JSON.parse(JSON.stringify(doc))) : doc;
  const cap = doc.capture.sha256;
  const id = `INFO-2026-${String(9700 + ++seq)}-monitor-rendered`;
  const md = bundleMd(id, locator);
  const prov = JSON.stringify({ documents: [reg] });
  const blobs = [{ path: doc.file, sha256: cap, bytes: Buffer.byteLength(render ? rendered(path) : serve[path], "utf-8") },
    ...(doc.shell ? [{ path: doc.shell.file, sha256: doc.shell.sha256, bytes: doc.shell.bytes }] : [])];
  const r = await P("promote", {
    bundleId: id, base: null, snapKey: `20260925T000000Z_d567${String(seq).padStart(4, "0")}`, author: "suite",
    meta: { object_type: "information", group: "believe-in-oakland", title: `Monitored ${id}`,
            current_state: "collected", created: NOW, last_updated: NOW },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
            { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) },
            ...blobs.map((b) => ({ path: b.path, blobSha: b.sha256, sha256: b.sha256, bytes: b.bytes }))],
    register: blobs.map((b) => ({ sha256: b.sha256, path: b.path, encoding: "binary", bytes: b.bytes })),
  });
  return { id, doc, acq, promoted: r.ok !== false && (r.result ? r.result.ok !== false : true) };
};

/* ====================================================================== 0 */
console.log("\n--- 0. the baseline is a real render:true acquire, and the pair's two digests differ ---");
const R = await monitoredFrom("/agenda", { render: true });
t("R0 the rendered bundle promoted", R.promoted, true);
t("R1 the capture's method is `rendered`", R.doc && R.doc.capture.method, "rendered");
t("R2 the pair's shell digest is the served shell's", R.doc && R.doc.pair && R.doc.pair.shell.sha256, sha(SHELL_A));
t("R3 the primary is the RENDERED document, NOT the shell (the fixture is non-vacuous)",
  R.doc && [R.doc.capture.sha256 === sha(rendered("/agenda")), R.doc.capture.sha256 !== sha(SHELL_A)], [true, true]);
t("R4 the ruling's sentence is the one this suite asserts", RENDER_TICK_UNDETERMINED,
  "content undetermined — not watched: this source renders its content in the browser");

/* ====================================================================== U */
console.log("\n--- U. an UNCHANGED shell: frame unchanged, content undetermined, no status claimed ---");
{
  const u = await P("monitor", { bundleId: R.id });
  t("U1 the tick compared the pair's SHELL digest, never the rendered one", [u.compared, u.baseline], ["shell", sha(SHELL_A)]);
  t("U2 frame unchanged", u.frame, "unchanged");
  t("U3 content undetermined, in the ruling's words", [u.content, u.undetermined], ["undetermined", [RENDER_TICK_UNDETERMINED]]);
  t("U4 the note reads \"frame unchanged; content undetermined\"", u.note, "frame unchanged; " + RENDER_TICK_UNDETERMINED);
  t("U5 NO `modified` for a change nobody made, and no `unchanged` claimed for the document", u.status, null);
  t("U6 no re-evaluation raised", u.reeval_raised, false);
  t("U7 the look is PRESENT on the shell capture, about the FRAME",
    u.observation && [u.observation.state, u.observation.detail], ["PRESENT", "frame unchanged; content undetermined"]);
  t("U8 the tick was recorded", typeof u.revision, "string");
  const b = await live(R.id);
  t("U9 source_status is left exactly as it was", /^source_status: modified$/m.test(b), true);
  t("U10 the Session Log carries the frame reading and the content undetermined",
    b.includes("Monitor tick: frame unchanged; " + RENDER_TICK_UNDETERMINED + " (compared shell)"), true);
}

/* ====================================================================== C */
console.log("\n--- C. a CHANGED shell: `modified` about the frame, content still undetermined ---");
{
  serve["/agenda"] = SHELL_B;
  const c = await P("monitor", { bundleId: R.id });
  t("C1 the served shell really differs (the arm is armed)", [c.seen, c.baseline], [sha(SHELL_B), sha(SHELL_A)]);
  t("C2 status `modified`, frame changed", [c.status, c.frame], ["modified", "changed"]);
  t("C3 the note says it is the FRAME that changed, and the content undetermined",
    c.note, "modified (frame): the source no longer serves the captured shell; " + RENDER_TICK_UNDETERMINED);
  t("C4 content undetermined", c.content, "undetermined");
  t("C5 the look names the frame and the served shell",
    c.observation && c.observation.detail, `frame changed; served sha256 ${sha(SHELL_B)}; content undetermined`);
  t("C6 re-evaluation raised (D-472's conservative direction)", c.reeval_raised, true);
  serve["/agenda"] = SHELL_A;
}

/* ====================================================================== N */
console.log("\n--- N. a rendered row naming NO shell digest: nothing compared, never the rendered digest ---");
{
  const N = await monitoredFrom("/agenda-noshell", { render: true, strip: (d) => { delete d.pair; delete d.shell; return d; } });
  t("N0 promoted, and the row is still `rendered` without a pair", N.promoted && N.doc.capture.method, "rendered");
  const n = await P("monitor", { bundleId: N.id });
  t("N1 no baseline and no comparison", [n.baseline, n.compared, n.status, n.frame], [null, null, null, null]);
  t("N2 the note says why, and the content undetermined",
    n.note, "the capture is rendered and its register row names no shell digest (pair.shell.sha256), so nothing was compared; "
          + RENDER_TICK_UNDETERMINED);
  t("N3 content undetermined", n.content, "undetermined");
}

/* ====================================================================== O */
console.log("\n--- O. OVER-STRICTNESS: an ordinary capture still compares its own capture digest ---");
{
  const O = await monitoredFrom("/plain.html");
  t("O0 the plain bundle promoted with no pair", [O.promoted, "pair" in O.doc], [true, false]);
  const o = await P("monitor", { bundleId: O.id });
  t("O1 compared raw against capture.sha256, reads unchanged", [o.compared, o.baseline, o.status], ["raw", sha(PLAIN), "unchanged"]);
  t("O2 no frame or content keys on an ordinary tick", ["frame", "content", "undetermined"].map((k) => k in o), [false, false, false]);
}

await mf.dispose();
console.log(`\nmonitor-rendered: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
