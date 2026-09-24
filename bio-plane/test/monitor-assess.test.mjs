/* NEGATIVE CONTROL: (run 2026-09-23, D-65) ARM BYPASS: bypass `assess` (return no assessment ahead of the call in `monitorAssess`) -> 11 fail, among them "removed-meeting: the gone meeting reads delisted as an event"; the observation, cadence and no-bytes arms still PASS as declared; 16 pass, 11 fail. ARM LIAR: grade every change an event (`settledQuiet = false && ...`) -> exactly "moved-window: NO re-evaluation is raised" fails; 26 pass, 1 fail. Each restored from a per-arm copy, verified by sha256 (eafcf7e279d91745...) and cmp, 740571 bytes; restored 27 pass, 0 fail. */
/* D-65 — op=monitor asks `assess` (BIO_Content_Framework §6, "One public function")
 * through the capture's handler and content type, answers with its trail and graded
 * events, writes each look to the observation log (OBSERVATION-LOG-DESIGN.md §4.1), and
 * says which cadence governs the document: REC-26's authored `monitoring.frequency`, or,
 * for a document stating none, its content type's contract (§6: the contract *"sets the
 * expected check frequency"*).
 *
 * ACCEPTS-WHEN (the row): a calendar that lost a meeting inside its window reads
 * `delisted` as an `event` (the row writes "removed"; the shared catalogue's word for a
 * public record removed from a public list is `delisted`, and §6 says event types come
 * from that catalogue, never a string invented per site); a moved window reads `routine`;
 * an unchanged tick writes a dated `PRESENT unchanged` observation.
 *
 * HOW A LIAR PASSES IT: grade every change an `event`. The moved-window arm must read
 * `routine` and raise no re-evaluation.
 *
 * The baseline is a REAL acquire document over the same fixture the outbound service
 * serves, its bytes in R2 under the capture key acquire wrote — never a hand-built one.
 *
 * NEGATIVE CONTROL (the row's): bypass `assess`, and the removed-meeting arm fails by name.
 */
import "./stdio.mjs";
import "./sandbox.mjs";
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));

/* A Legistar-shaped calendar (meeting-calendar.mjs's measured shape): the per-render
   __VIEWSTATE makes the aspnet stack CERTAIN, the named range "This Month" makes the
   window RELATIVE, and each meeting is keyed by its MeetingDetail.aspx?ID=. */
const row = (id, body, date) =>
  `<tr><td><a href="MeetingDetail.aspx?ID=${id}&GUID=x">${body}</a></td><td>${date}</td>`
  + `<td><a href="View.ashx?M=A&ID=${id}0">Agenda</a></td></tr>`;
const calendar = (vs, rows) => [
  '<!DOCTYPE html><html><head><title>Calendar</title></head><body>',
  '<div id="ctl00_divHeader">nav</div>',
  '<form id="aspnetForm" method="post">',
  `<input type="hidden" name="__VIEWSTATE" id="__VIEWSTATE" value="${vs}" />`,
  `<input type="hidden" name="__EVENTVALIDATION" id="__EVENTVALIDATION" value="ev-${vs}" />`,
  '<main id="mainContent" role="main">',
  '<input id="ctl00_lstYears_Input" name="ctl00$lstYears" value="This Month" />',
  '<table><tr><th>Name</th><th>Date</th><th>Agenda</th></tr>',
  ...rows,
  '</table></main></form></body></html>',
].join("");
const M = {
  a: row(101, "City Council", "9/2/2026"),  b: row(102, "Rules Committee", "9/9/2026"),
  c: row(103, "Finance Committee", "9/16/2026"), d: row(104, "City Council", "9/23/2026"),
  e: row(105, "Rules Committee", "9/30/2026"), f: row(106, "Finance Committee", "10/7/2026"),
};
const BASE    = calendar("S1_" + "x".repeat(300), [M.a, M.b, M.c, M.d]);
/* A meeting dated INSIDE the window (9/2–9/23) is gone. */
const REMOVED = calendar("S2_" + "y".repeat(500), [M.a, M.b, M.d]);
/* The window moved a fortnight: 9/2 and 9/9 scrolled out, 9/30 and 10/7 arrived. */
const MOVED   = calendar("S3_" + "z".repeat(200), [M.c, M.d, M.e, M.f]);

const LOC = "/Calendar.aspx";
const serve = { [LOC]: BASE };
let status404 = false;
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-ma", MEMBER_TOKEN: "mem-ma", PROBE_TOKEN: "prb-ma", VERSION: "test",
              GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService(request) {
    const u = new URL(request.url);
    if (status404 && u.pathname === LOC) return new Response("gone", { status: 404 });
    if (u.pathname in serve) return new Response(serve[u.pathname], { headers: {
      "content-type": "text/html; charset=utf-8", "x-powered-by": "ASP.NET", server: "Microsoft-IIS/10.0" } });
    return new Response("unscripted", { status: 500 });
  },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const P = async (op, b) => (await mf.dispatchFetch(`http://x/api/?op=${op}&token=mem-ma&store=scratch`,
  { method: "POST", body: JSON.stringify(b) })).json();
const G = async (q) => (await mf.dispatchFetch(`http://x/api/?token=mem-ma&store=scratch&${q}`)).json();

const NOW = "2026-09-23T00:00:00Z";
const bundleMd = (id, locator, freqLine) => [
  "---", `id: ${id}`, "object_type: information", "schema: information@2",
  `title: "Monitored ${id}"`, "current_state: collected", "prior_state: null",
  `created: ${NOW}`, `last_updated: ${NOW}`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
  "  source: null", "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", `  locator: ${locator}`, "  authority: City Clerk", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: true", ...(freqLine ? [freqLine] : []), "  last_checked: null", "---", "",
  "## Summary", "", "A monitored calendar.", "", "## Provenance Notes", "",
  "## Session Log", "", "### Session 1", "", "Captured.", "", "## Review Notes", "",
].join("\n");

let seq = 0;
const monitored = async (freqLine) => {
  const locator = "https://oakland.legistar.com" + LOC;
  const nbytes = Buffer.byteLength(serve[LOC], "utf8");
  const acq = await P("acquire", { locator, authority: "City Clerk" });
  const doc = acq.document;
  const cap = doc.capture.sha256;
  const id = `INFO-2026-${String(9700 + ++seq)}-monitor-assess`;
  const md = bundleMd(id, locator, freqLine);
  const prov = JSON.stringify({ documents: [doc] });
  const r = await P("promote", {
    bundleId: id, base: null, snapKey: `20260923T000000Z_d65${String(seq).padStart(5, "0")}`, author: "suite",
    meta: { object_type: "information", group: "believe-in-oakland", title: `Monitored ${id}`,
            current_state: "collected", created: NOW, last_updated: NOW },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
            { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) },
            { path: doc.file, blobSha: cap, sha256: cap, bytes: nbytes }],
    register: [{ sha256: cap, path: doc.file, encoding: "binary", bytes: nbytes }],
  });
  return { id, cap, locator, promoted: r.ok !== false && (r.result ? r.result.ok !== false : true) };
};
const frontierRow = async (locator) => {
  const f = await G("op=frontier&level=document");
  return ((f.result || {}).looked || []).find((r) => r.subject === locator) || null;
};

console.log("\n--- the baseline: a certain-stack calendar, acquired and promoted ---");
const B = await monitored("  frequency: daily");
t("the monitored bundle promoted", B.promoted, true);

console.log("\n--- an UNCHANGED tick: assess confirms, and the look is logged PRESENT unchanged ---");
const same = await P("monitor", { bundleId: B.id });
t("identical bytes read unchanged", same.status, "unchanged");
t("assess ran against the baseline's own bytes", typeof same.assessment_basis === "string"
  && same.assessment_basis.startsWith("assessed against the baseline's own bytes"), true);
t("assess's verdict is identical, stopped at L2", [same.assessment?.verdict, same.assessment?.stopped_at],
  ["identical", "L2_bytes"]);
t("the answer carries the trail (L1 stack then L2 bytes)", (same.assessment?.trail || []).map((x) => x.layer),
  ["L1_stack", "L2_bytes"]);
t("the confirmation is kept: identical_bytes", same.assessment?.confirmation?.kind, "identical_bytes");
t("the look was written", [same.observation?.written, same.observation?.state, same.observation?.detail],
  [true, "PRESENT", "unchanged"]);
t("…and is DATED", typeof same.observation?.at === "string" && /^\d{4}-\d\d-\d\dT/.test(same.observation.at), true);
const fr = await frontierRow(B.locator);
t("the log holds it: PRESENT, pointing at the baseline capture, under the sweep",
  fr && [fr.state, fr.result_kind, fr.result_ref, fr.authority_kind, fr.authority, fr.detail],
  ["PRESENT", "capture", B.cap, "sweep", B.id, "unchanged"]);
t("…dated at the tick, and the frontier derives last_verified from it",
  fr && [fr.at, fr.last_verified], [same.observation?.at, same.observation?.at]);
t("an authored frequency governs, and the answer says so",
  [same.cadence?.frequency, same.cadence?.source], ["daily", "authored"]);
t("the fetched calendar reads as a meeting calendar, contract membership",
  [same.cadence?.content_type, same.cadence?.contract], ["meeting_calendar", "membership"]);

console.log("\n--- a meeting INSIDE the window is gone: delisted, graded event ---");
serve[LOC] = REMOVED;
const rm = await P("monitor", { bundleId: B.id });
t("removed-meeting: assess reached L5 on the calendar type", [rm.assessment?.verdict, rm.assessment?.content_type],
  ["changed", "meeting_calendar"]);
t("removed-meeting: the gone meeting reads delisted as an event",
  (rm.assessment?.events || []).map((e) => [e.type, e.significance, e.key]), [["delisted", "event", "103"]]);
t("removed-meeting: meaningful, and re-evaluation is raised", [rm.assessment?.meaningful, rm.reeval_raised], [true, true]);
t("removed-meeting: the look is logged as changed", [rm.observation?.state, (rm.observation?.detail || "").split(";")[0]],
  ["PRESENT", "changed"]);

console.log("\n--- the window MOVED: routine, and no re-evaluation (the liar's arm) ---");
serve[LOC] = MOVED;
const mv = await P("monitor", { bundleId: B.id });
t("moved-window: the substance differs (status modified)", mv.status, "modified");
t("moved-window: assess reads routine", mv.assessment?.verdict, "routine");
t("moved-window: only routine events (two meetings scheduled)",
  (mv.assessment?.events || []).map((e) => [e.type, e.significance]), [["scheduled", "routine"], ["scheduled", "routine"]]);
t("moved-window: the scrolled-out meetings are confirmed, not delisted",
  mv.assessment?.confirmation?.scrolled_out, 2);
t("moved-window: NO re-evaluation is raised", mv.reeval_raised, false);

console.log("\n--- a gone source: LOOKED_ABSENT ---");
status404 = true;
const gone = await P("monitor", { bundleId: B.id });
status404 = false;
t("404 reads removed and raises re-evaluation", [gone.status, gone.reeval_raised], ["removed", true]);
t("…and is logged LOOKED_ABSENT, with no assessment and the reason stated",
  [gone.observation?.state, gone.assessment, typeof gone.assessment_basis], ["LOOKED_ABSENT", null, "string"]);

console.log("\n--- a document stating NO frequency takes its type's contract ---");
/* CORRECTED 2026-09-24 by c18-batch7fix at the c17-batch7 union, not exempted: this served BASE again, byte for
   byte, so the second bundle registered the capture the first already holds — which D-179 (C-53.13, one capture,
   one home) now refuses by name, and every arm below read the refusal. The subject here is the CONTRACT cadence,
   not the bytes, so the calendar is served as a fresh fetch of the same page would be: the same four meetings under
   a new `__VIEWSTATE`, the part an ASP.NET page changes on every render. */
serve[LOC] = calendar("S4_" + "w".repeat(300), [M.a, M.b, M.c, M.d]);
const C = await monitored(null);
t("the contract bundle promoted", C.promoted, true);
const cc = await P("monitor", { bundleId: C.id });
t("its cadence comes from the contract, and the answer says which",
  [cc.cadence?.source, cc.cadence?.contract, cc.cadence?.frequency], ["contract", "membership", "daily"]);

console.log("\n--- no baseline bytes: STATED, never approximated ---");
const noBytes = await mf.getR2Bucket("CAPTURES");
await noBytes.delete(`scratch/captures/${C.cap}`);
serve[LOC] = REMOVED;
const nb = await P("monitor", { bundleId: C.id });
t("with the baseline's bytes absent, no assessment is made and the basis names why",
  [nb.assessment, nb.assessment_basis], [null, "the baseline's bytes are not held under its capture key"]);
t("…and D-60's flag stands (the conservative direction)", nb.reeval_raised, true);

console.log(`\n${pass} passed, ${fail} failed`);
await mf.dispose();
process.exit(fail ? 1 : 0);
