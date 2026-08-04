/* Readings are PERSISTED and indexed by entity reference (CONSTRUCTS Step 3 / FW-5).
 *
 * FW-3 made op=acquire the first plane consumer of docprofile and recorded the
 * profile; FW-4 stored the normalisation digests. This step reads the document:
 * op=acquire runs the resolved doctype's parse() over the captured text to produce
 * a reading — entities[] plus document facts (BIO_Content_Framework_v0_10.md:480) —
 * carries it on the acquire document, and op=promote persists it into the new
 * `readings` table, indexing every entity by the RAW reference it carries (kind:key,
 * e.g. meeting:2101 — an id in a URL is a key, framework §7). The references are NOT
 * resolved to canonical entities: that is Step 4 / D-83, deliberately not built here.
 *
 * The load-bearing proof is the reverse index: two different captures of two
 * different calendars that both list meeting 2101 are both returned by a lookup on
 * meeting:2101, without any identity model — which is the reverse index Step 4
 * consumes. And "a reading that finds nothing is a failed reader, never an emptied
 * document" (framework:489): a generic page read as text but recognised by no
 * doctype, and a PDF not read as text at all, both persist an HONEST empty reading
 * (found:false, no entities), never fabricated ones.
 *
 * NEGATIVE CONTROL: drop the persist in store.mjs — comment out the
 * `this.#writeReadings(bundleId, files)` call in promote() (or the reading_refs
 * INSERT inside #writeReadings) -> a promoted capture known to contain meeting:2101
 * has no reading and no references to look up. RUN 2026-07-31: commenting out the
 * #writeReadings call made op=reading return found:false for CAL_ONE's promoted
 * capture (assertion "op=reading retrieves the reading by capture sha (found)"
 * flipped true->false) and the reading came back null, so the reference lookup
 * op=readingref&ref=meeting:2101 returned count 0 for a document known to carry it.
 * Restored. A reference lookup that returns rows the promote did not write is
 * impossible, so a suite that still passed without the persist would test nothing.
 */
/* NEGATIVE CONTROL: comment out `this.#writeReadings(bundleId, files)` in store.mjs promote() -> a promoted capture known to carry meeting:2101 has op=reading return found:false and reading null, and op=readingref&ref=meeting:2101 return count 0. RUN 2026-07-31: persist dropped -> "op=reading retrieves the reading by capture sha (found)" flipped true->false and the reference lookup returned 0 for a document known to carry it; restored -> 30 pass. */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));

/* A measured-shape ASP.NET WebForms meeting calendar (the one real content type
   docprofile has a reader for). `vs` is the per-render __VIEWSTATE; the rows are
   the substance. MeetingDetail.aspx?ID= links + the date-range control + the
   Agenda column make meeting_calendar detect CERTAIN. */
const cal = (vs, rows) => [
  '<!DOCTYPE html><html><head><title>Council Calendar</title></head><body>',
  '<form id="aspnetForm" method="post">',
  `<input type="hidden" name="__VIEWSTATE" id="__VIEWSTATE" value="${vs}" />`,
  '<main id="mainContent" role="main">',
  '<select id="lstYears_Input" name="lstYears" value="This Month"><option>This Month</option></select>',
  '<table><tr><th>Name</th><th>Date</th><th>Agenda</th></tr>',
  rows,
  '</table></main></form></body></html>',
].join("");
const ROW = (id, name, date, agenda) =>
  `<tr><td><a href="MeetingDetail.aspx?ID=${id}&GUID=X">${name}</a></td>`
  + `<td>${date}</td><td>${agenda ? `<a href="View.ashx?M=A&ID=${agenda}">Agenda</a>` : ""}</td></tr>`;

/* CAL_ONE lists meetings 2101 and 2102; CAL_TWO lists 2101 (the SAME reference,
   a different capture) and 2103. Different viewstate + rows -> different shas. */
const CAL_ONE = cal("STATE_ONE_" + "x".repeat(200),
  ROW("2101", "City Council", "7/15/2026", "5001") + ROW("2102", "Rules Committee", "7/22/2026", ""));
const CAL_TWO = cal("STATE_TWO_" + "y".repeat(300),
  ROW("2101", "City Council", "7/15/2026", "5001") + ROW("2103", "Budget Committee", "8/5/2026", "5009"));
/* Read as text, recognised by NO doctype (generic): a reading that finds nothing. */
const GENERIC = '<!DOCTYPE html><html><head><title>About</title></head><body>'
  + '<main><h1>About the City</h1><p>Oakland is a city in California.</p></main></body></html>';
/* Not read as text at all: %PDF-1.7\n1. */
const PDFB = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37, 0x0a, 0x31]);

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-fw5", MEMBER_TOKEN: "mem-fw5", PROBE_TOKEN: "prb-fw5", VERSION: "test",
              GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService(request) {
    const u = new URL(request.url);
    const html = (s) => new Response(s, { headers: {
      "content-type": "text/html; charset=utf-8", "x-powered-by": "ASP.NET", server: "Microsoft-IIS/10.0" } });
    if (u.pathname === "/one.aspx") return html(CAL_ONE);
    if (u.pathname === "/two.aspx") return html(CAL_TWO);
    if (u.pathname === "/about.html") return new Response(GENERIC, { headers: { "content-type": "text/html" } });
    if (u.pathname === "/doc.pdf") return new Response(PDFB, { headers: { "content-type": "application/pdf" } });
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
const acquire = async (path) => (await mf.dispatchFetch(
  "http://x/api/?op=acquire&token=mem-fw5",
  { method: "POST", body: JSON.stringify({ locator: "https://oakland.legistar.com" + path, authority: "City Clerk" }) })).json();
/* Both reads driven THROUGH the control plane (op=reading / op=readingref), so
   coverage credits them to the control-plane surface, not only to the store. The
   store-forwarded ops answer under `result`, exactly as op=audit does. */
const readingOf = async (sha256) => (await (await mf.dispatchFetch(
  `http://x/api/?op=reading&token=mem-fw5&sha256=${encodeURIComponent(sha256)}`)).json()).result;
const refLookup = async (ref) => (await (await mf.dispatchFetch(
  `http://x/api/?op=readingref&token=mem-fw5&ref=${encodeURIComponent(ref)}`)).json()).result;

let bseq = 0;
const NOW = "2026-07-24T00:00:00Z";
const bundleMd = (id) => [
  "---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Reading ${id}"`, "current_state: collected", "prior_state: null",
  `created: ${NOW}`, `last_updated: ${NOW}`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
  "  source: null", "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", "  locator: in hand", "  authority: synthetic", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none", "---", "",
  "## Summary", "", "Reading bundle.", "", "## Provenance Notes", "",
  "## Session Log", "", "## Review Notes", "",
].join("\n");
/* Promote a bundle whose data/provenance.json carries this acquire document — what
   op=promote really persists — so the reading #writeReadings sees is the one the
   plane produced at acquire, never a fabricated shape. register:[] is fine: the
   reading is derived from provenance.json, not from the register. */
const promoteDoc = async (doc) => {
  const id = `INFO-2026-${String(++bseq).padStart(4, "0")}-reading`;
  const md = bundleMd(id);
  const prov = JSON.stringify({ documents: [doc] });
  const r = await (await mf.dispatchFetch("http://x/api/?op=promote&token=mem-fw5", { method: "POST", body: JSON.stringify({
    bundleId: id, base: null, snapKey: "20260724T010000Z_aaaa1111", author: "fw5",
    meta: { object_type: "information", group: "believe-in-oakland", title: `Reading ${id}`,
            current_state: "collected", created: NOW, last_updated: NOW },
    files: [
      { path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
      { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) },
    ],
    register: [],
  }) })).json();
  return { id, promoted: r.ok !== false };
};

console.log("\n--- op=acquire reads the document and carries the reading ---");
const one = (await acquire("/one.aspx")).document;
const two = (await acquire("/two.aspx")).document;
const gen = (await acquire("/about.html")).document;
const pdf = (await acquire("/doc.pdf")).document;

t("a calendar capture carries a reading block", typeof one.reading, "object");
t("the reader is named on the reading", one.reading.content_type, "meeting_calendar");
t("the reader found entities (found:true)", one.reading.found, true);
t("CAL_ONE read two meetings", one.reading.entities.length, 2);
t("the entity reference is carried AS IT APPEARS (raw kind:key)",
  one.reading.entities.map((e) => e.ref).sort(), ["meeting:2101", "meeting:2102"]);
t("the reference is NOT canonicalised — key is the source-assigned id",
  one.reading.entities.find((e) => e.ref === "meeting:2101").key, "2101");
t("document facts are carried beside the entities (the calendar window)",
  typeof one.reading.facts.window, "object");

console.log("\n--- a reading that finds nothing is a failed reader, never an emptied document (framework:489) ---");
t("a generic page read as text but recognised by no doctype reads as generic",
  gen.reading.content_type, "generic");
t("it was read as text", gen.reading.read_from_text, true);
t("and it honestly found nothing (found:false), not fabricated entities",
  [gen.reading.found, gen.reading.entities.length], [false, 0]);
t("a PDF is not read as text at all", pdf.reading.read_from_text, false);
t("and its reading is honestly empty, never invented",
  [pdf.reading.found, pdf.reading.entities.length], [false, 0]);
t("the empty reading STATES why", typeof gen.reading.basis, "string");

console.log("\n--- ACCEPTS-WHEN: after acquire+promote the reading is retrievable ---");
const b1 = await promoteDoc(one);
const b2 = await promoteDoc(two);
const bg = await promoteDoc(gen);
const bp = await promoteDoc(pdf);
t("CAL_ONE promoted", b1.promoted, true);

const r1 = await readingOf(one.capture.sha256);
t("op=reading retrieves the reading by capture sha (found)", r1.found, true);
t("it names the bundle the capture was promoted into", r1.bundle_id, b1.id);
t("the retrieved reading carries the same entities[]", r1.reading.entities.length, 2);
t("and the reader-found flag survived the round trip", [r1.reader_found, r1.entity_count], [true, 2]);

const rg = await readingOf(gen.capture.sha256);
t("a failed/empty reading is retrievable and honestly marked", [rg.found, rg.reader_found, rg.entity_count], [true, false, 0]);

console.log("\n--- ACCEPTS-WHEN: a lookup BY ENTITY REFERENCE returns the documents that carry it ---");
const at2101 = await refLookup("meeting:2101");
t("meeting:2101 is carried by BOTH calendars (cross-document, unresolved)", at2101.count, 2);
t("and it returns both promoted bundles", at2101.documents.map((d) => d.bundle_id).sort(), [b1.id, b2.id].sort());
t("each hit names the capture sha whose reading carries the reference",
  at2101.documents.map((d) => d.capture_sha).sort(), [one.capture.sha256, two.capture.sha256].sort());

const at2102 = await refLookup("meeting:2102");
t("meeting:2102 is carried by CAL_ONE only", [at2102.count, at2102.documents[0] && at2102.documents[0].bundle_id], [1, b1.id]);
const at2103 = await refLookup("meeting:2103");
t("meeting:2103 is carried by CAL_TWO only", [at2103.count, at2103.documents[0] && at2103.documents[0].bundle_id], [1, b2.id]);

console.log("\n--- the reverse index does not invent hits ---");
const none = await refLookup("meeting:9999");
t("a reference no reading carries returns nothing", none.count, 0);
t("the empty/PDF readings contribute no references", (await refLookup(":")).count, 0);
t("the generic and PDF bundles are absent from every meeting lookup",
  at2101.documents.some((d) => d.bundle_id === bg.id || d.bundle_id === bp.id), false);

console.log("\n--- D-113: a whole-store purge clears the readings tables ---");
const purge = (await (await mf.dispatchFetch("http://x/api/?op=purge&token=adm-fw5&confirm=bio", { method: "POST" })).json()).result;
t("purge reported scope ALL", purge.scope, "ALL");
t("after purge, the reading is gone (readings row cleared)", (await readingOf(one.capture.sha256)).found, false);
t("after purge, the reverse index is empty (reading_refs cleared)", (await refLookup("meeting:2101")).count, 0);

await mf.dispose();
console.log(`\nreading: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
