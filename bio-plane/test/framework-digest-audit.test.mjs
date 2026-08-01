/* NEGATIVE CONTROL: drop the normalised-digest write in op=acquire (set profile.digests.evidentiary = null / gate digestCertain to false) -> the viewstate pair's evidentiary digests are absent, C-18.3's normalised arm finds nothing, and "op=audit folds the viewstate pair" flips true->false (21->15 pass). RUN 2026-07-31, restored. */
/* The normalisation digests op=acquire computes, and the duplicate they let
 * op=audit finally see (CONSTRUCTS Step 2 / FW-4).
 *
 * FW-3 recorded WHICH regions a handler treats as machinery/furniture (the
 * declared normalisation policy). Step 2 turns that policy into evidence: the
 * plane computes the framework's THREE digests (DOCUMENT-PROFILES.md, "Three
 * digests, not one") and stores the two that are not the raw identity —
 *
 *   identity     sha256 of the raw bytes = the capture sha (I1 §1). REUSED, never
 *                recomputed under a second name.
 *   rendition    mechanical regions normalised — "would this look the same?"
 *   evidentiary  presentational AND mechanical normalised — "has the substance
 *                changed?" This is the one the duplicate sweep compares.
 *
 * The load-bearing proof is the duplicate the RAW sweep cannot see. Two captures
 * of the same Legistar page fetched moments apart differ by a whole __VIEWSTATE
 * (measured: 31.4% of the bytes) and by furniture outside <main>, so their raw
 * shas differ and C-18.3's raw arm folds nothing. Their EVIDENTIARY digests are
 * equal, because viewstate is mechanical and everything outside <main> is
 * presentational, so the normalised arm folds them into one corroboration —
 * which is the ring-once rule doing its job on bytes that lied about being two
 * documents. Two genuinely different documents keep different evidentiary digests
 * and are NOT folded; two documents the handler could not normalise (a PDF) carry
 * NO evidentiary digest and two absents are never treated as equal.
 *
 * NEGATIVE CONTROL: drop the normalised-digest write in op=acquire (set
 * profile.digests.evidentiary = null, or gate digestCertain to false) -> the
 * viewstate pair's evidentiary digests are absent, C-18.3's normalised arm finds
 * nothing, and "op=audit folds the viewstate pair" flips true->false while the
 * raw arm still sees nothing (the shas differ). RUN 2026-07-31: forcing
 * digestCertain=false in index.mjs dropped the C-18.3 finding on the viewstate
 * bundle (audit tally lost C-18.3) and the fold assertion failed; restored. An
 * equality the write did not earn is exactly what the raw sweep already could not
 * produce, so a suite that still passed without the write would be testing nothing.
 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash, webcrypto } from "node:crypto";
import { checkBundle } from "../checks/bio-checks.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const HEX64 = /^[0-9a-f]{64}$/;

/* A measured-shape ASP.NET WebForms calendar. `vs` is the per-render __VIEWSTATE
   (mechanical), `furniture` is everything OUTSIDE <main> (presentational), `body`
   is the substance INSIDE <main role="main"> (evidentiary). The __VIEWSTATE field
   makes the aspnet stack CERTAIN, which is what licenses trusting the digest. */
const cal = (vs, furniture, body) => [
  '<!DOCTYPE html><html><head><title>City Council Calendar</title></head><body>',
  `<div id="ctl00_divHeader">${furniture}</div>`,
  '<form id="aspnetForm" method="post">',
  `<input type="hidden" name="__VIEWSTATE" id="__VIEWSTATE" value="${vs}" />`,
  `<input type="hidden" name="__EVENTVALIDATION" id="__EVENTVALIDATION" value="ev-${vs}" />`,
  '<main id="mainContent" role="main">',
  '<select id="lstYears_Input" name="lstYears"><option>This Month</option></select>',
  '<table><tr><th>Name</th><th>Date</th><th>Agenda</th></tr>',
  body,
  '</table></main></form></body></html>',
].join("");

const ROW = (name, date) =>
  `<tr><td><a href="MeetingDetail.aspx?ID=2101&GUID=ABC">${name}</a></td>`
  + `<td>${date}</td><td><a href="View.ashx?M=A&ID=1">Agenda</a></td></tr>`;

/* A and B: the SAME calendar (identical <main>), different viewstate AND different
   furniture — the real "fetched twice" case. */
const PAGE_A = cal("STATE_ONE_" + "x".repeat(400), "nav one", ROW("City Council", "7/15/2026"));
const PAGE_B = cal("STATE_TWO_" + "y".repeat(900), "nav two, a longer footer rail", ROW("City Council", "7/15/2026"));
/* C: a genuinely different calendar (the substance inside <main> differs). */
const PAGE_C = cal("STATE_ONE_" + "x".repeat(400), "nav one", ROW("Rules Committee", "7/22/2026"));

const PDF1 = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37, 0x0a, 0x31]); // %PDF-1.7\n1
const PDF2 = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37, 0x0a, 0x32]); // %PDF-1.7\n2

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-fd", MEMBER_TOKEN: "mem-fd", PROBE_TOKEN: "prb-fd", VERSION: "test",
              GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService(request) {
    const u = new URL(request.url);
    const html = (s) => new Response(s, { headers: {
      "content-type": "text/html; charset=utf-8", "x-powered-by": "ASP.NET", server: "Microsoft-IIS/10.0" } });
    if (u.pathname === "/a.aspx") return html(PAGE_A);
    if (u.pathname === "/b.aspx") return html(PAGE_B);
    if (u.pathname === "/c.aspx") return html(PAGE_C);
    if (u.pathname === "/one.pdf") return new Response(PDF1, { headers: { "content-type": "application/pdf" } });
    if (u.pathname === "/two.pdf") return new Response(PDF2, { headers: { "content-type": "application/pdf" } });
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
  "http://x/api/?op=acquire&token=mem-fd",
  { method: "POST", body: JSON.stringify({ locator: "https://oakland.legistar.com" + path, authority: "City Clerk" }) })).json();
const get = async (qs) => (await mf.dispatchFetch("http://x/api/?token=mem-fd&" + qs)).json();

/* Promote a bundle whose data/provenance.json carries these register documents
   (the acquire documents themselves, not a fabricated shape), then read the
   bundle's findings the way op=audit produces them: checkBundle over the stored
   image. auditPass() calls this very function inside the Durable Object, so a
   per-bundle checkBundle is the same instrument, unbounded (op=audit's offender
   list is capped at five errors per bundle, which the store-wide tally assertion
   at the end covers instead). audit.test.mjs cross-checks op=audit the same way. */
let bseq = 0;
const NOW = "2026-07-24T00:00:00Z";
const bundleMd = (id) => [
  "---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Digest ${id}"`, "current_state: collected", "prior_state: null",
  `created: ${NOW}`, `last_updated: ${NOW}`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
  "  source: null", "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", "  locator: in hand", "  authority: synthetic", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none", "---", "",
  "## Summary", "", "Digest bundle.", "", "## Provenance Notes", "",
  "## Session Log", "", "## Review Notes", "",
].join("\n");
const shaHex = async (v) => createHash("sha256")
  .update(typeof v === "string" ? Buffer.from(v, "utf8") : Buffer.from(v)).digest("hex");
const sha512Hex = async (b) => new Uint8Array(await webcrypto.subtle.digest("SHA-512", b));
const promoteWith = async (docs) => {
  const id = `INFO-2026-${String(++bseq).padStart(4, "0")}-digest`;
  const md = bundleMd(id);
  const prov = JSON.stringify({ documents: docs });
  const r = await (await mf.dispatchFetch("http://x/api/?op=promote&token=mem-fd", { method: "POST", body: JSON.stringify({
    bundleId: id, base: null, snapKey: "20260724T010000Z_aaaa1111", author: "fd",
    meta: { object_type: "information", group: "believe-in-oakland", title: `Digest ${id}`,
            current_state: "collected", created: NOW, last_updated: NOW },
    files: [
      { path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
      { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) },
    ],
    register: [],
  }) })).json();
  return { id, promoted: r.ok !== false };
};
const auditChecksFor = async (id) => {
  const img = (await get(`op=image&id=${encodeURIComponent(id)}`)).result;
  const files = new Map(), elided = new Set();
  for (const [p, v] of Object.entries(img)) { if (typeof v === "string") files.set(p, v); else elided.add(p); }
  const { findings } = await checkBundle({ folderName: id, files, elidedPaths: elided,
    sha256: shaHex, sha512: sha512Hex, resolveTarget: () => true });
  return findings.map((f) => f.check);
};
const auditBundleFor = async (docs) => {
  const { id, promoted } = await promoteWith(docs);
  return { id, promoted, checks: await auditChecksFor(id) };
};

console.log("\n--- op=acquire computes and stores the normalisation digests ---");
const A = (await acquire("/a.aspx")).document;
const B = (await acquire("/b.aspx")).document;
const C = (await acquire("/c.aspx")).document;
const dA = A.profile.digests, dB = B.profile.digests, dC = C.profile.digests;

t("a certain-stack capture carries a digests block", typeof dA, "object");
t("its normalisation is determined (the stack was identified with certainty)", dA.determined, true);
t("the rendition digest is a 64-hex sha", HEX64.test(dA.rendition || ""), true);
t("the evidentiary digest is a 64-hex sha", HEX64.test(dA.evidentiary || ""), true);
t("identity is NOT restated in the digests block (it is the capture sha)", "identity" in dA, false);
t("the evidentiary digest is not the raw capture sha (normalisation happened)", dA.evidentiary === A.capture.sha256, false);

console.log("\n--- the same document, different viewstate + furniture ---");
t("the two fetches are genuinely different bytes (raw shas differ)", A.capture.sha256 === B.capture.sha256, false);
t("so the RAW identity cannot see they are the same document", A.capture.sha256 === B.capture.sha256, false);
t("but the EVIDENTIARY digest folds them (viewstate + boilerplate normalised)", dA.evidentiary, dB.evidentiary);
t("the rendition digest still differs, because furniture moved (restyled, not identical)", dA.rendition === dB.rendition, false);

console.log("\n--- a genuinely different document keeps a different digest ---");
t("different substance inside <main> -> different evidentiary digest", dA.evidentiary === dC.evidentiary, false);

console.log("\n--- an unnormalisable document records its digest as UNDETERMINED, never faked ---");
const P1 = (await acquire("/one.pdf")).document;
const P2 = (await acquire("/two.pdf")).document;
t("a PDF's normalisation is honestly undetermined", P1.profile.digests.determined, false);
t("and its evidentiary digest is absent, not a fabricated value", P1.profile.digests.evidentiary, null);
t("the basis states WHY it is undetermined", typeof P1.profile.digests.basis, "string");

console.log("\n--- op=audit's duplicate sweep now catches the viewstate duplicate ---");
/* The register documents are the acquire documents themselves — what op=promote
   really persists into data/provenance.json — so their evidentiary digests are
   the ones the plane computed above, never fabricated. */
const viewstatePair = await auditBundleFor([A, B]);
t("the viewstate-pair bundle promoted", viewstatePair.promoted, true);
t("op=audit folds the viewstate pair as a C-18.3 corroboration", viewstatePair.checks.includes("C-18.3"), true);

const differentDocs = await auditBundleFor([A, C]);
t("two genuinely different documents are NOT folded", differentDocs.checks.includes("C-18.3"), false);

const twoUndetermined = await auditBundleFor([P1, P2]);
t("two undetermined (PDF) documents are NOT folded — absents are never equal", twoUndetermined.checks.includes("C-18.3"), false);

/* And the raw arm is untouched: two register documents with the SAME capture sha
   still fold, exactly as before FW-4. */
const sameRaw = await auditBundleFor([A, A]);
t("the raw arm still folds two identical-byte captures (C-18.3 unchanged)", sameRaw.checks.includes("C-18.3"), true);

console.log("\n--- and it reaches the check THROUGH op=audit, not only through checkBundle ---");
/* The per-bundle assertions above use checkBundle directly (op=audit's offender
   sample is capped at five errors, which the C-18.1 register-shape noise fills).
   This one drives the whole op end-to-end: after the viewstate pair is in the
   store, op=audit's store-wide tally must carry C-18.3. */
const storeAudit = (await get("op=audit&limit=1000")).result;
t("op=audit's tally carries C-18.3 across the store", (storeAudit.tally["C-18.3"] || 0) >= 1, true);
t("and the viewstate-pair bundle is named among the offenders", storeAudit.offenders.some((o) => o.bundleId === viewstatePair.id), true);

await mf.dispose();
console.log(`\nframework-digest-audit: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
