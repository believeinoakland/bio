/* NEGATIVE CONTROL: (run 2026-09-23, D-60) ARM RAW: force op=monitor to compare raw (prefix the baseline-digest guard with `true ||`) -> 12 fail, first "compared evidentiary" then "viewstate-only: status reads unchanged" (got modified) and every viewstate/furniture arm; the real-change `modified` and the no-determined-baseline arm still PASS as declared; 23 pass, 12 fail. ARM LIAR: treat every evidentiary digest as equal (`if (false)` at the digest inequality) -> "real change: status reads modified" and its 3 companions fail, 31 pass, 4 fail. Each restored from a per-arm copy, verified by sha256 (bd7233c5...) and cmp; restored 35 pass, 0 fail. */
/* D-60 — op=monitor compares the EVIDENTIARY digest when it can, and says which
 * comparison it made (DOCUMENT-PROFILES.md, "Three digests, not one": evidentiary
 * "answers 'has the substance changed?', which is what monitoring asks").
 *
 * Before D-60 a monitor tick compared the RAW sha only. On an ASP.NET WebForms
 * page — Oakland's legislative record — the raw bytes differ on every fetch because
 * __VIEWSTATE is rebuilt per render (measured: 31.4% of a Legistar calendar), so
 * every tick read `modified` and raised re-evaluation on a page whose substance had
 * not moved: monitoring was noise on exactly the class of page BIO watches most.
 *
 * The rule under test: the evidentiary digest is compared when the baseline's
 * register row recorded one as `determined` AND the fetched bytes normalise under
 * the SAME handler with certainty, through `substanceDigests`, the one function
 * op=acquire recorded the baseline with. Otherwise the tick compares raw and the
 * answer says so.
 *
 * The baselines are REAL acquire documents (op=acquire over the same fixture the
 * outbound service serves), promoted into data/provenance.json exactly as a caller
 * does — never a hand-built digests block, which would be an equality that cost
 * nothing to produce.
 *
 * HOW A LIAR PASSES IT, and the arm that stops it: a monitor that normalised
 * EVERYTHING would read the viewstate arm `unchanged` too. The real-change arm
 * (a text change inside <main>) must read `modified` under the evidentiary
 * comparison, and the furniture arm must stay `unchanged` (over-strictness: a
 * correct monitor must not call a furniture move a substance change).
 *
 * NEGATIVE CONTROL (the row's): make op=monitor compare RAW again — and the
 * viewstate arm fails by name.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash, webcrypto } from "node:crypto";
import { checkBundle } from "../checks/bio-checks.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));

/* A measured-shape ASP.NET WebForms page (framework-digest-audit.test.mjs's
   shape): `vs` is the per-render __VIEWSTATE (mechanical), `furniture` sits
   OUTSIDE <main> (presentational), `body` is the substance inside <main>. The
   __VIEWSTATE field is what makes the aspnet stack CERTAIN. */
const page = (vs, furniture, body) => [
  '<!DOCTYPE html><html><head><title>Legislation Detail</title></head><body>',
  `<div id="ctl00_divHeader">${furniture}</div>`,
  '<form id="aspnetForm" method="post">',
  `<input type="hidden" name="__VIEWSTATE" id="__VIEWSTATE" value="${vs}" />`,
  `<input type="hidden" name="__EVENTVALIDATION" id="__EVENTVALIDATION" value="ev-${vs}" />`,
  '<main id="mainContent" role="main">',
  `<h1>File 26-0412</h1><p>${body}</p>`,
  '</main></form></body></html>',
].join("");
const BODY = "Status: Adopted. Title: A resolution on the city budget.";
const BASE     = page("STATE_ONE_" + "x".repeat(400), "nav", BODY);
const VS_ONLY  = page("STATE_TWO_" + "y".repeat(900), "nav", BODY);                 /* differs ONLY in viewstate */
const FURN     = page("STATE_THREE_" + "z".repeat(50), "nav, and a new footer rail", BODY);
const REAL     = page("STATE_FOUR_" + "w".repeat(300), "nav", BODY.replace("Adopted", "Withdrawn"));
const NO_VS    = BASE.replace(/<input type="hidden" name="__VIEWSTATE"[^>]*\/>/, "")
                     .replace(/<input type="hidden" name="__EVENTVALIDATION"[^>]*\/>/, "");
/* A page no handler identifies with certainty: the conservative handler, whose
   capture records NO determined digest. */
const PLAIN_A = "<!DOCTYPE html><html><body><main><p>Plain report, version one.</p></main></body></html>";
const PLAIN_B = "<!DOCTYPE html><html><body><main><p>Plain report, version one.</p></main><!-- r2 --></body></html>";

const serve = { "/LegislationDetail.aspx": BASE, "/plain.html": PLAIN_A };
const html = (s, aspnet) => new Response(s, { headers: aspnet
  ? { "content-type": "text/html; charset=utf-8", "x-powered-by": "ASP.NET", server: "Microsoft-IIS/10.0" }
  : { "content-type": "text/html; charset=utf-8" } });
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-ms", MEMBER_TOKEN: "mem-ms", PROBE_TOKEN: "prb-ms", VERSION: "test",
              GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService(request) {
    const u = new URL(request.url);
    if (u.pathname in serve) return html(serve[u.pathname], u.pathname.endsWith(".aspx"));
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
const P = async (op, b) => (await mf.dispatchFetch(`http://x/api/?op=${op}&token=mem-ms&store=scratch`,
  { method: "POST", body: JSON.stringify(b) })).json();
const G = async (q) => (await mf.dispatchFetch(`http://x/api/?token=mem-ms&store=scratch&${q}`)).json();
const shaHex = async (v) => createHash("sha256")
  .update(typeof v === "string" ? Buffer.from(v, "utf8") : Buffer.from(v)).digest("hex");
const sha512Hex = async (b) => new Uint8Array(await webcrypto.subtle.digest("SHA-512", b));

const NOW = "2026-09-23T00:00:00Z";
const bundleMd = (id, locator) => [
  "---", `id: ${id}`, "object_type: information", "schema: information@2",
  `title: "Monitored ${id}"`, "current_state: collected", "prior_state: null",
  `created: ${NOW}`, `last_updated: ${NOW}`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
  "  source: null", "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", `  locator: ${locator}`, "  authority: City Clerk", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: true", "  frequency: daily", "  last_checked: null", "---", "",
  "## Summary", "", "A monitored source.", "", "## Provenance Notes", "",
  "## Session Log", "", "### Session 1", "", "Captured.", "", "## Review Notes", "",
].join("\n");

/* Acquire the source as it stands, and promote a monitored bundle whose register
   row IS that acquire document — the baseline a real caller would hold. */
let seq = 0;
const monitoredFrom = async (path) => {
  const locator = "https://oakland.legistar.com" + path;
  const nbytes = Buffer.byteLength(serve[path], "utf8");
  const acq = await P("acquire", { locator, authority: "City Clerk" });
  const doc = acq.document;
  const cap = doc.capture.sha256;
  const id = `INFO-2026-${String(9600 + ++seq)}-monitor-substance`;
  const md = bundleMd(id, locator);
  const prov = JSON.stringify({ documents: [doc] });
  const r = await P("promote", {
    bundleId: id, base: null, snapKey: `20260923T000000Z_d60${String(seq).padStart(5, "0")}`, author: "suite",
    meta: { object_type: "information", group: "believe-in-oakland", title: `Monitored ${id}`,
            current_state: "collected", created: NOW, last_updated: NOW },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
            { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) },
            { path: doc.file, blobSha: cap, sha256: cap, bytes: nbytes }],
    register: [{ sha256: cap, path: doc.file, encoding: "binary", bytes: nbytes }],
  });
  return { id, doc, promoted: r.ok !== false && (r.result ? r.result.ok !== false : true) };
};
const live = async (id) => (await G(`op=image&id=${encodeURIComponent(id)}`)).result["bundle.md"];

console.log("\n--- the baseline: a certain-stack capture carries a determined evidentiary digest ---");
const L = await monitoredFrom("/LegislationDetail.aspx");
t("the monitored bundle promoted", L.promoted, true);
t("its baseline recorded a DETERMINED digest (the fixture is non-vacuous)", L.doc && L.doc.profile.digests.determined, true);
t("under the aspnet_webforms handler", L.doc && L.doc.profile.handler, "aspnet_webforms");

console.log("\n--- over-strictness: the same bytes read unchanged, compared evidentiary ---");
const same = await P("monitor", { bundleId: L.id });
t("identical bytes read unchanged", same.status, "unchanged");
t("compared evidentiary", same.compared, "evidentiary");
t("and raise no flag", same.reeval_raised, false);

console.log("\n--- ARM VIEWSTATE: two fetches differing only in __VIEWSTATE ---");
serve["/LegislationDetail.aspx"] = VS_ONLY;
const vs = await P("monitor", { bundleId: L.id });
t("the raw bytes really differ (the arm is armed)", vs.seen !== null && vs.seen !== vs.baseline, true);
t("viewstate-only: status reads unchanged", vs.status, "unchanged");
t("viewstate-only: compared evidentiary", vs.compared, "evidentiary");
t("viewstate-only: no flag raised", vs.reeval_raised, false);
t("viewstate-only: the tick was recorded", typeof vs.revision, "string");
{
  const b = await live(L.id);
  t("viewstate-only: the record wrote no `modified`", /^source_status: modified$/m.test(b), false);
  t("viewstate-only: the re-evaluation flag stayed down", /^reeval_pending:\n\s+flag: false$/m.test(b), true);
  t("viewstate-only: the session log names the comparison", /Monitor tick: .*\(compared evidentiary\)/.test(b), true);
}

console.log("\n--- over-strictness: furniture outside <main> moved, substance did not ---");
serve["/LegislationDetail.aspx"] = FURN;
const fu = await P("monitor", { bundleId: L.id });
t("furniture-only: status reads unchanged", fu.status, "unchanged");
t("furniture-only: compared evidentiary", fu.compared, "evidentiary");
t("furniture-only: no flag raised", fu.reeval_raised, false);

console.log("\n--- ARM REAL CHANGE: the text inside <main> changed (how a liar is caught) ---");
serve["/LegislationDetail.aspx"] = REAL;
const rc = await P("monitor", { bundleId: L.id });
t("real change: status reads modified", rc.status, "modified");
t("real change: compared evidentiary", rc.compared, "evidentiary");
t("real change: the flag is raised", rc.reeval_raised, true);
{
  const b = await live(L.id);
  t("real change: the record says modified", /^source_status: modified$/m.test(b), true);
  t("real change: the re-evaluation flag is up", /^reeval_pending:\n\s+flag: true$/m.test(b), true);
}

console.log("\n--- the fetched bytes are no longer certain: compare raw, and say why ---");
serve["/LegislationDetail.aspx"] = NO_VS;
const nv = await P("monitor", { bundleId: L.id });
t("uncertain fetch: compared raw", nv.compared, "raw");
t("uncertain fetch: the basis names the handler mismatch or the undetermined digest",
  /baseline was normalised under|substance digest is undetermined/.test(nv.compared_basis || ""), true);
t("uncertain fetch: differing bytes read modified (the conservative direction)", nv.status, "modified");

console.log("\n--- ARM NO DETERMINED BASELINE: compare raw, and say so ---");
const Q = await monitoredFrom("/plain.html");
t("the plain bundle promoted", Q.promoted, true);
t("its baseline recorded NO determined digest", Q.doc && Q.doc.profile.digests.determined, false);
const q0 = await P("monitor", { bundleId: Q.id });
t("no determined baseline, same bytes: compared raw", q0.compared, "raw");
t("and reads unchanged", q0.status, "unchanged");
t("the answer says the baseline had no determined digest",
  /baseline recorded no determined evidentiary digest/.test(q0.compared_basis || ""), true);
serve["/plain.html"] = PLAIN_B;
const q1 = await P("monitor", { bundleId: Q.id });
t("no determined baseline, differing bytes: compared raw", q1.compared, "raw");
t("and reads modified", q1.status, "modified");
t("and raises the flag", q1.reeval_raised, true);

console.log("\n--- the plane's own ticks, judged by the catalogue ---");
for (const id of [L.id, Q.id]) {
  const img = (await G(`op=image&id=${encodeURIComponent(id)}`)).result;
  const files = new Map(), el = new Set();
  for (const [p, v] of Object.entries(img)) { if (typeof v === "string") files.set(p, v); else el.add(p); }
  const { findings } = await checkBundle({ folderName: id, files, elidedPaths: el,
    sha256: shaHex, sha512: sha512Hex, resolveTarget: () => true });
  const errs = findings.filter((f) => f.severity === "error");
  for (const x of errs) console.log(`         ${x.check}: ${x.message.slice(0, 130)}`);
  t(`${id}: the gate finds nothing in the plane's own ticks`, errs.length, 0);
}

await mf.dispose();
console.log(`\nmonitor-substance: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
