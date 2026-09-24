/* NEGATIVE CONTROL: RUN 2026-09-24 through `node test/nc-d536.mjs` from `bio-plane/` — 7 arms, 0 not as declared, each DECLARED BEFORE ARMING and armed ALONE, restored by sha256 AND byte comparison (RESULTS in its header): (a) baseline, nothing armed -> green 60/0. (b) nodigest, the row's own: drop the text digest in `readingProvenance` -> the ATTRIBUTION arm fails BY NAME, and the undetermined arm stays green. (c) nochain, a page's tier no longer read off the chain -> the chain arm fails. (d) overwrite, the pre-D-536 reading no longer kept first -> the kept-first arm fails. (e) inferred, a legacy reading given provenance from its text_tier -> both UNDETERMINED arms fail. (f) nodedupe, the over-strictness direction: the same reading kept twice -> the not-kept-twice arm fails. (g) nopurge, reading_history off the purge list -> the purge arm fails.
 *
 * d536-reading-provenance.test.mjs — D-536. A READING CARRIES ITS OWN PROVENANCE; A RE-READ IS COMPARED
 * WITH THE ONE BEFORE IT AND A DISAGREEMENT IS ATTRIBUTED; BOTH READINGS ARE KEPT.
 *
 * The authority is `docs/architecture/BIO_Content_Framework_v0_10.md` Part II §16, "Reading provenance",
 * which folds BOB #33's ruling of 2026-09-24 21:25Z. The measured failure is M-143's: two walks of one
 * sample classified several documents differently because tiers 2 and 3 did not return the same text
 * twice, and nothing in the record could say which tier's text had moved.
 *
 * Driven THROUGH THE OPS (`op=acquire`, `op=promote`, `op=pdfstructure&ocr=1`, `op=reading`), never at
 * the store, except ONE DO-only test-support call (`readinghistoryclear`, on `readingtermsclear`'s
 * precedent) that makes a capture look like one read before D-536 — the only way to drive the path that
 * KEEPS a pre-D-536 reading rather than overwriting it.
 *
 *   0. THE PURE RULE — per-page tier from the chain first, the tier-2 stamp second; an empty page is not
 *      digested; the attribution's four states; page ranges as a reader counts them.
 *   1. A READING CARRIES ITS PROVENANCE — tier, member, the pages transcribed, and a SHA-256 of the exact
 *      text classified, checked against a digest THIS SUITE takes of the text the acquire document itself
 *      carries (not against a copy of the plane's arithmetic).
 *   2. KEPT, NOT REPLACED — a promote keeps the reading; an ordinary revision re-submitting the same
 *      provenance document keeps nothing twice (the over-strictness direction).
 *   3. A RE-READ ACROSS TIERS — tier 1 read nothing, the OCR member re-read the page: ATTRIBUTED to the
 *      tier and member on both sides; both readings kept.
 *   4. A RE-READ ON ONE TIER THAT DISAGREES — the ruling's own example shape: "tier 3 on ocr-worker
 *      returned different text for page 1".
 *   5. A READING FROM BEFORE D-536 — provenance UNDETERMINED, stated, never inferred; and it is KEPT, not
 *      overwritten, when a new reading of its capture arrives.
 *   6. `op=pdfstructure` serves the provenance of the text it answers with.
 *
 * WHAT IT CANNOT SEE: the OCR engine is a stub answering CPDF-12's declared contract (reextract.test.mjs's
 * own, for its reason); a real tier 2 is not bound, so tier 2's attribution is driven by the pure arms in
 * section 0 and not by a member; and a provenance a CALLER hands `op=promote` inside
 * `data/provenance.json` is persisted as carried — the same trust boundary as the reading and its chain,
 * stated in §16, not closed here.
 */
import "./stdio.mjs";                 /* D-282 */
import "./sandbox.mjs";               /* D-186 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { readingProvenance, compareProvenance, describePages, PROVENANCE_SCHEME, TIER_MEMBERS }
  from "../src/readingprov.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));

let pass = 0, fail = 0, footReached = false;
process.on("exit", () => {
  if (!footReached) console.log(`\nd536: ${pass} passed, ${fail + 1} failed — SUITE ENDED BEFORE ITS OWN FOOT`);
});
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");

/* ---- fixtures (reextract.test.mjs's assembler and shapes) ------------------ */
function pdf(objs) {
  const chunks = [Buffer.from("%PDF-1.7\n", "latin1")];
  for (const o of objs) {
    chunks.push(Buffer.from(`${o.num} 0 obj\n`, "latin1"));
    if (o.stream) {
      chunks.push(Buffer.from(o.head + "\nstream\n", "latin1"));
      chunks.push(o.stream);
      chunks.push(Buffer.from("\nendstream\n", "latin1"));
    } else chunks.push(Buffer.from(o.body + "\n", "latin1"));
    chunks.push(Buffer.from("endobj\n", "latin1"));
  }
  chunks.push(Buffer.from("%%EOF\n", "latin1"));
  return new Uint8Array(Buffer.concat(chunks));
}
function textPdf(lines) {
  const content = "BT /F1 10 Tf " + lines.map((l, i) => (i ? "0 -12 Td " : "") + `(${l}) Tj `).join("") + "ET";
  const cbuf = Buffer.from(content, "latin1");
  const cmap = `/CIDInit /ProcSet findresource begin 12 dict begin begincmap
/CMapName /Adobe-Identity-UCS def
1 begincodespacerange
<20> <7e>
endcodespacerange
1 beginbfrange
<20> <7e> <0020>
endbfrange
endcmap CMapName currentdict /CMap defineresource pop end end`;
  const mbuf = Buffer.from(cmap, "latin1");
  return pdf([
    { num: 1, body: "<< /Type /Catalog /Pages 2 0 R >>" },
    { num: 2, body: "<< /Type /Pages /Kids [3 0 R] /Count 1 >>" },
    { num: 3, body: "<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>" },
    { num: 4, head: `<< /Length ${cbuf.length} >>`, stream: cbuf },
    { num: 5, body: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /ToUnicode 6 0 R >>" },
    { num: 6, head: `<< /Length ${mbuf.length} >>`, stream: mbuf },
  ]);
}
function scanPdf(width) {
  const img = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
  const content = Buffer.from("q 612 0 0 792 0 0 cm /Im0 Do Q", "latin1");
  return pdf([
    { num: 1, body: "<< /Type /Catalog /Pages 2 0 R >>" },
    { num: 2, body: "<< /Type /Pages /Kids [3 0 R] /Count 1 >>" },
    { num: 3, body: "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /XObject << /Im0 100 0 R >> >> /Contents 4 0 R >>" },
    { num: 4, head: `<< /Length ${content.length} >>`, stream: content },
    { num: 100, head: `<< /Type /XObject /Subtype /Image /Width ${width} /Height 3300 /Filter /DCTDecode /Length ${img.length} >>`, stream: img },
  ]);
}
const agendaLines = (n1, n2, n3) => [
  "Thursday, July 16, 2026", "City of Oakland", "Office of the City Clerk",
  "*Rules & Legislation Committee", " Agenda - SUPPLEMENTAL", "Roll Call /  Call To Order",
  "Subject: ", "Grand Performance Mural", "From: ", "Councilmember Wang",
  "Recommendation: Adopt A Resolution On Consent", "3.1", n1,
  "Subject: ", "Coliseum Payment Allocation", "From: ", "Finance Department",
  "Recommendation: Receive An Informational Report", "3.2", n2,
  "Determination Of Schedule Of Outstanding Committee Items", "2", n3,
  "Open Forum", "Adjournment",
];
const LAYER = textPdf(agendaLines("26-5361", "26-5362", "26-5363"));
const SCAN_A = scanPdf(3601);          /* section 3: tier 1 reads nothing, OCR re-reads it */
const SCAN_B = scanPdf(3602);          /* section 4: OCR reads it twice, differently */
const LEGACY = textPdf(agendaLines("26-5371", "26-5372", "26-5373"));   /* section 5 */

const region = (text, page, i) => ({ text, confidence: { value: 0.97, basis: "engine" },
  source: { kind: "pdf-page", ref: `p${page}`, page, rect: [72, 700 - i * 12, 540, 712 - i * 12] } });
/* `measured_by` is a free string; see reextract.test.mjs on why it names no `.md` path (M0-165). */
const ocrAnswer = (lines, page = 0) => ({
  ok: true, engine: "tesseract", version: "5.3.4-fast", cap: "C",
  measured_by: "MEASUREMENTS 2026-08-03 (CPDF-9)", confidence_floor: 0.6,
  pages: [{ page, regions: lines.map((l, i) => region(l, page, i)) }],
});
let SCRIPT = "http-500";
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  serviceBindings: {
    async OCR_WORKER(request) {
      if (new URL(request.url).pathname !== "/transcribe") return new Response("no", { status: 404 });
      if (SCRIPT === "http-500") return new Response("boom", { status: 500 });
      return Response.json(SCRIPT);
    } },
  bindings: { ADMIN_TOKEN: "adm-d536", MEMBER_TOKEN: "mem-d536", PROBE_TOKEN: "prb-d536",
              VERSION: "test-d536", GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService(request) {
    const u = new URL(request.url);
    const bin = (b) => new Response(b, { headers: { "content-type": "application/pdf" } });
    if (u.pathname === "/layer.pdf") return bin(LAYER);
    if (u.pathname === "/scan-a.pdf") return bin(SCAN_A);
    if (u.pathname === "/scan-b.pdf") return bin(SCAN_B);
    if (u.pathname === "/legacy.pdf") return bin(LEGACY);
    return new Response("unscripted", { status: 500 });
  },
});
const raw = async (q, init) => {
  const res = await mf.dispatchFetch(`http://x/api/?${q}`, init);
  const text = await res.text();
  let body = null; try { body = JSON.parse(text); } catch { body = null; }
  return { status: res.status, text, body };
};
const api = async (q, init) => (await raw(q, init)).body;
const post = (q, body) => api(q, { method: "POST", body: JSON.stringify(body) });
const acquire = async (path) => (await post("op=acquire&token=mem-d536",
  { locator: "https://oakland.legistar.com" + path, authority: "City Clerk" })).document;
const reading = async (s) => (await api(`op=reading&token=mem-d536&sha256=${s}`))?.result ?? null;

const NOW = "2026-09-24T00:00:00Z";
const bundleMd = (id, summary = "Member bundle.") => [
  "---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Member ${id}"`, "current_state: collected", "prior_state: null",
  `created: ${NOW}`, `last_updated: ${NOW}`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
  "  source: null", "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", "  locator: in hand", "  authority: synthetic", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none", "---", "",
  "## Summary", "", summary, "", "## Provenance Notes", "",
  "## Session Log", "", "## Review Notes", "",
].join("\n");
let bseq = 0;
const promoteDoc = async (doc, { id = null, base = null, summary } = {}) => {
  const bid = id || `INFO-2026-${String(++bseq).padStart(4, "0")}-d536`;
  const md = bundleMd(bid, summary);
  const prov = JSON.stringify({ documents: [doc] });
  const r = await post("op=promote&token=mem-d536", {
    bundleId: bid, base,
    snapKey: base ? `20260924T020000Z_${String(base).slice(0, 8)}` : `20260924T01000${bseq}Z_d536${bseq}`, author: "d536",
    meta: { object_type: "information", group: "believe-in-oakland", title: `Member ${bid}`,
            current_state: "collected", created: NOW, last_updated: NOW },
    files: [
      { path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
      { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) },
    ],
    register: [{ path: doc.file, sha256: doc.capture.sha256, bytes: doc.capture.bytes ?? 1, encoding: "binary" }],
  });
  return { id: bid, ok: r?.result?.ok === true, sha: r?.result?.bundleSha ?? null, raw: r };
};
const session = async (memberId, role, capabilities) => {
  const add = (await post("op=memberadd&token=adm-d536",
    { memberId, cover: `cover for ${memberId}`, role, capabilities })).result;
  const en = (await post("op=enroll", { invite: add.invite, handle: memberId,
                                       password: `${memberId}-passphrase-1` })).result;
  if (!en?.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en).slice(0, 300)}`);
  const lg = (await post("op=login", { role: `member:${memberId}`,
                                      password: `${memberId}-passphrase-1` })).result;
  if (!lg?.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg).slice(0, 300)}`);
  return lg.token;
};
const ns = await mf.getDurableObjectNamespace("STORE");
const doStub = ns.get(ns.idFromName("bio"));
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const DO = async (p, body) => rP(await (await doStub.fetch("http://x/" + p,
  body ? { method: "POST", body: JSON.stringify(body) } : {})).json());

try {

console.log("\n--- 0 · the pure rule ---");
{
  /* A MIXED chain as `mergedChain` composes it: tier 1 on page 0, tier 2 on page 1, tier 3 on page 2. */
  const chain = [
    { step: "layer", tier: 1, container: "pdf", extent: { kind: "pages", pages: [0] } },
    { step: "layer", tier: 2, container: "pdf", extent: { kind: "pages", pages: [1] } },
    { step: "pixels", extent: { kind: "pages", pages: [2] } },
    { step: "ocr", engine: "tesseract", version: "5.3.4-fast", extent: { kind: "pages", pages: [2] } },
  ];
  const text = { document: "alpha\nbeta\ngamma", pages: [
    { page: 0, text: "alpha" }, { page: 1, text: "beta", tier: 1 /* a stamp the chain overrules */ },
    { page: 2, text: "gamma" }, { page: 3, text: "" } ] };
  const p = await readingProvenance({ text, chain, tier: 3, container: "pdf", planeVersion: "v9" });
  t("the scheme is named", p.scheme, PROVENANCE_SCHEME);
  t("the document digest is of the exact text classified (flattenText's `document`)", p.text_sha256, sha("alpha\nbeta\ngamma"));
  t("each page's tier is read off the CHAIN, which overrules the page's own stamp",
    p.pages.map((x) => [x.page, x.tier, x.member]), [[0, 1, "plane"], [1, 2, "pdf-worker"], [2, 3, "ocr-worker"], [3, 3, "ocr-worker"]]);
  t("each page's digest is of that page's text", p.pages.slice(0, 3).map((x) => x.text_sha256), [sha("alpha"), sha("beta"), sha("gamma")]);
  t("an EMPTY page is listed and NOT digested (two empty strings agree on nothing)", [p.pages[3].chars, p.pages[3].text_sha256], [0, null]);
  t("the pages TRANSCRIBED, per producer — the tier-3 engine named, tier 1 carries the plane's version",
    p.producers, [{ tier: 1, member: "plane", version: "v9", pages: [0] }, { tier: 2, member: "pdf-worker", pages: [1] },
                  { tier: 3, member: "ocr-worker", engine: "tesseract 5.3.4-fast", pages: [2] }]);
  const noChain = await readingProvenance({ text: { document: "a\nb", pages: [{ page: 0, text: "a", tier: 1 }, { page: 1, text: "b", tier: 2 }] }, tier: 2 });
  t("with NO chain, the tier-2 merge's page stamps answer", noChain.pages.map((x) => x.tier), [1, 2]);
  t("the member table is the wiring's", TIER_MEMBERS, { 1: "plane", 2: "pdf-worker", 3: "ocr-worker" });
  const none = await readingProvenance({ text: null, tier: null });
  t("no text classified: the key is PRESENT, the digest null, and the reason stated",
    [none.scheme, none.text_sha256, typeof none.why], [PROVENANCE_SCHEME, null, "string"]);
  const html = await readingProvenance({ text: "an HTML page's text", member: "plane" });
  t("text read at intake is on no tier, and names its producer", [html.pages, html.producers], [null, [{ tier: null, member: "plane", pages: null }]]);

  const a = { scheme: PROVENANCE_SCHEME, text_sha256: "x", pages: [
    { page: 2, tier: 2, member: "pdf-worker", text_sha256: "p2" }, { page: 3, tier: 2, member: "pdf-worker", text_sha256: "p3" },
    { page: 4, tier: 1, member: "plane", text_sha256: "p4" } ] };
  const b = { scheme: PROVENANCE_SCHEME, text_sha256: "y", pages: [
    { page: 2, tier: 2, member: "pdf-worker", text_sha256: "q2" }, { page: 3, tier: 2, member: "pdf-worker", text_sha256: "q3" },
    { page: 4, tier: 1, member: "plane", text_sha256: "p4" } ] };
  const c = compareProvenance(a, b);
  t("ATTRIBUTED — the ruling's own sentence shape, 1-based pages as a reader counts",
    [c.state, c.says], ["differs", "tier 2 on pdf-worker returned different text for pages 3-4"]);
  t("...and structured: which pages, which producer before and now", c.changed,
    [{ before: { tier: 2, member: "pdf-worker" }, now: { tier: 2, member: "pdf-worker" }, pages: [2, 3] }]);
  t("an unchanged page is not named", c.changed.some((g) => g.pages.includes(4)), false);
  t("same text: agrees", compareProvenance(a, { ...a }).state, "agrees");
  t("an earlier reading with NO provenance: UNDETERMINED, never inferred", compareProvenance(null, b).state, "undetermined");
  t("an object that is not this scheme is not provenance", compareProvenance({ text_sha256: "x", pages: [] }, b).state, "undetermined");
  t("neither read any text: nothing to compare", compareProvenance({ ...a, text_sha256: null }, { ...b, text_sha256: null }).state, "no_text");
  t("page ranges", [describePages([0]), describePages([2, 3]), describePages([0, 2, 3, 6])], ["page 1", "pages 3-4", "pages 1, 3-4, 7"]);
}

const RUTH = await session("ruth", "admin", ["contribute", "publish", "create_projects"]);

console.log("\n--- 1 · a reading carries its provenance ---");
const L = await acquire("/layer.pdf");
const LS = L?.capture?.sha256;
{
  const pv = L?.reading?.provenance;
  const units = Array.isArray(L?.text_units) ? L.text_units : [];
  t("the text-layer document was read at tier 1", [L?.reading?.text_tier, L?.reading?.read_from_text], [1, true]);
  t("its reading carries provenance, by scheme", pv?.scheme, PROVENANCE_SCHEME);
  t("one page, one unit — the fixture is non-empty", [units.length, (units[0]?.text || "").length > 100], [1, true]);
  /* THE DIGEST IS CHECKED AGAINST THE TEXT THE ACQUIRE DOCUMENT CARRIES, taken by this suite's own hash,
     so an equality here costs the plane real bytes — never against its own arithmetic. */
  t("the document digest is the SHA-256 of the text the reader was handed (the page's text, taken here)",
    pv?.text_sha256, sha(units[0]?.text || "-"));
  t("the page digest agrees", pv?.pages?.[0]?.text_sha256, sha(units[0]?.text || "-"));
  t("tier, member and the pages transcribed", [pv?.pages?.[0]?.tier, pv?.pages?.[0]?.member, pv?.producers],
    [1, "plane", [{ tier: 1, member: "plane", version: "test-d536", pages: [0] }]]);
}

console.log("\n--- 2 · kept, not replaced; and not kept twice ---");
const LF = await promoteDoc(L);
t("filed", LF.ok, true);
{
  const r = await reading(LS);
  const h = r?.reading_history;
  t("op=reading serves the kept readings: one, the first, compared with nothing",
    [h?.kept, h?.readings?.length, h?.readings?.[0]?.seq, h?.readings?.[0]?.compared], [1, 1, 1, null]);
  t("its provenance is the reading's", h?.readings?.[0]?.provenance?.text_sha256, L?.reading?.provenance?.text_sha256);
  t("the kept reading is the stored reading, by digest", h?.readings?.[0]?.reading_sha256, sha(JSON.stringify(r?.reading)));
  /* THE OVER-STRICTNESS DIRECTION: an ordinary revision re-submits the SAME provenance document. That is
     the same reading promoted twice, not a re-read, and counting it would make "how often was this read"
     count revisions. */
  const rev = await promoteDoc(L, { id: LF.id, base: LF.sha, summary: "Member bundle, revised." });
  t("a revision of the bundle is filed", rev.ok, true);
  t("and the same reading is NOT kept twice", (await reading(LS))?.reading_history?.kept, 1);
}

console.log("\n--- 3 · a re-read ACROSS TIERS, attributed on both sides, both kept ---");
SCRIPT = "http-500";
const A = await acquire("/scan-a.pdf");
const AS = A?.capture?.sha256;
{
  t("the scan was captured and left unread (the member failed)", [A?.reading?.read_from_text, A?.reading?.tier3_candidate], [false, true]);
  t("its provenance says tier 1 on the plane read page 1 to NOTHING — listed, not digested",
    [A?.reading?.provenance?.text_sha256, A?.reading?.provenance?.pages], [null, [{ page: 0, tier: 1, member: "plane", chars: 0, text_sha256: null }]]);
  t("filed", (await promoteDoc(A)).ok, true);
  SCRIPT = ocrAnswer(agendaLines("26-5381", "26-5382", "26-5383"));
  const re = await api(`op=pdfstructure&token=${RUTH}&sha256=${AS}&ocr=1`);
  t("the OCR member re-read it and the re-read was written", [re?.reextraction?.performed, re?.reextraction?.written], [true, true]);
  t("the re-read's answer carries its ATTRIBUTION against the reading it replaced",
    [re?.reextraction?.compared?.state, re?.reextraction?.compared?.says],
    ["differs", "page 1 was read by tier 1 on plane before and by tier 3 on ocr-worker now, and the text differs"]);
  const h = (await reading(AS))?.reading_history;
  t("BOTH readings are kept, newest first", [h?.kept, h?.readings?.map((x) => x.seq)], [2, [2, 1]]);
  t("the newer one names tier 3 on the ocr-worker and its engine",
    h?.readings?.[0]?.provenance?.producers, [{ tier: 3, member: "ocr-worker", engine: "tesseract 5.3.4-fast", pages: [0] }]);
  t("the older one is the acquire-time reading, unchanged", h?.readings?.[1]?.provenance?.text_sha256, null);
  t("the comparison is STORED with the newer one", h?.readings?.[0]?.compared?.changed,
    [{ before: { tier: 1, member: "plane" }, now: { tier: 3, member: "ocr-worker" }, pages: [0] }]);
}

console.log("\n--- 4 · a re-read on ONE tier that disagrees — the ruling's example shape ---");
{
  SCRIPT = ocrAnswer(agendaLines("26-5391", "26-5392", "26-5393"));
  const B1 = await acquire("/scan-b.pdf");
  const BS = B1?.capture?.sha256;
  t("read at tier 3 at capture", [B1?.reading?.text_tier, B1?.reading?.provenance?.pages?.[0]?.member], [3, "ocr-worker"]);
  const f1 = await promoteDoc(B1);
  t("filed", f1.ok, true);
  /* THE SAME BYTES, READ AGAIN, AND THE ENGINE RETURNS DIFFERENT TEXT — M-143's measured case. */
  SCRIPT = ocrAnswer(agendaLines("26-5391", "26-5392", "26-5394"));
  const B2 = await acquire("/scan-b.pdf");
  t("the same capture, re-acquired", B2?.capture?.sha256, BS);
  t("the second read's text differs from the first", B2?.reading?.provenance?.text_sha256 !== B1?.reading?.provenance?.text_sha256, true);
  const f2 = await promoteDoc(B2, { id: f1.id, base: f1.sha, summary: "Member bundle, re-acquired." });
  t("filed as a revision", f2.ok, true);
  const h = (await reading(BS))?.reading_history;
  t("both kept", h?.kept, 2);
  t("ATTRIBUTED: the tier, the member and the page — never a silent re-read",
    [h?.readings?.[0]?.compared?.state, h?.readings?.[0]?.compared?.says],
    ["differs", "tier 3 on ocr-worker returned different text for page 1"]);
  SCRIPT = ocrAnswer(agendaLines("26-5391", "26-5392", "26-5394"));
  const B3 = await acquire("/scan-b.pdf");
  /* A LATER RETRIEVAL: two acquires inside one second share a retrieval instant, so the instant is set
     apart here — otherwise the third reading is byte-identical to the second and is (correctly) not kept
     again, which section 2 already asserts. */
  B3.reading.at = "2026-09-25T00:00:00Z";
  const f3 = await promoteDoc(B3, { id: f1.id, base: f2.sha, summary: "Member bundle, re-acquired again." });
  const h3 = (await reading(BS))?.reading_history;
  t("a third read of the SAME text agrees, and is still kept (a new retrieval)",
    [f3.ok, h3?.kept, h3?.readings?.[0]?.compared?.state], [true, 3, "agrees"]);
}

console.log("\n--- 5 · a reading from BEFORE D-536: undetermined, stated, and KEPT ---");
{
  const G = await acquire("/legacy.pdf");
  const GS = G?.capture?.sha256;
  /* The acquire document as a caller built before D-536 carried it: no `provenance` key. */
  const legacy = JSON.parse(JSON.stringify(G));
  delete legacy.reading.provenance;
  legacy.reading.at = "2026-09-01T00:00:00Z";
  const gf = await promoteDoc(legacy);
  t("filed without provenance", gf.ok, true);
  /* ...and made to look like a capture read BEFORE the history existed: its `readings` row stands and
     no kept reading does (DO-only test support). */
  const cl = await DO("readinghistoryclear", { captureSha: GS });
  t("the history of that capture is cleared (test support)", cl?.cleared, GS);
  t("so the record holds its reading and no kept one", [(await reading(GS))?.found, (await reading(GS))?.reading_history?.kept], [true, 0]);
  const before = (await reading(GS))?.reading;
  const g2 = await promoteDoc(G, { id: gf.id, base: gf.sha, summary: "Member bundle, re-read." });
  t("a NEW reading of the capture arrives", g2.ok, true);
  const h = (await reading(GS))?.reading_history;
  t("the reading it replaced was KEPT FIRST — not overwritten", [h?.kept, h?.readings?.[1]?.seq, h?.readings?.[1]?.reading_sha256],
    [2, 1, sha(JSON.stringify(before))]);
  t("the pre-D-536 reading's provenance reads UNDETERMINED, with the reason", h?.readings?.[1]?.provenance?.state, "undetermined");
  t("its text digest is NOT inferred", h?.readings?.[1]?.text_sha256, null);
  t("the comparison says the difference cannot be attributed — never inferred from the tier",
    [h?.readings?.[0]?.compared?.state, /UNDETERMINED/.test(h?.readings?.[0]?.compared?.says || "")], ["undetermined", true]);
}

console.log("\n--- 6 · op=pdfstructure serves the provenance of the text it answers with ---");
{
  const st = (await raw(`op=pdfstructure&token=${RUTH}&sha256=${LS}`)).body;
  t("the plain read carries provenance", st?.provenance?.scheme, PROVENANCE_SCHEME);
  t("and it digests the same text the acquire's reading classified", st?.provenance?.text_sha256, L?.reading?.provenance?.text_sha256);
}

console.log("\n--- 7 · a purge clears the kept readings with the readings (D-113) ---");
{
  /* COUNTED ACROSS THE WHOLE TABLE, before and after, because `op=reading` answers `found: false` for a
     purged capture WITHOUT consulting the history — an empty answer there would cost nothing. The probe
     clears a capture that does not exist and reads the table's remaining count. */
  const NOSUCH = "0".repeat(64);
  const keptOfL = (await reading(LS))?.reading_history?.kept;
  const before = (await DO("readinghistoryclear", { captureSha: NOSUCH }))?.remaining;
  const pg = await api(`op=purge&token=adm-d536&confirm=bio&bundleId=${encodeURIComponent(LF.id)}`);
  const after = (await DO("readinghistoryclear", { captureSha: NOSUCH }))?.remaining;
  console.log(`  printout: kept readings in the store ${before} -> ${after}; the purged document held ${keptOfL}`);
  t("the purge answered", pg?.result?.ok ?? pg?.ok, true);
  t("the table was not empty before (a floor, so the next arm cannot pass over nothing)", before >= 5, true);
  t("and exactly the purged document's kept readings are gone", before - after, keptOfL);
}

} finally {
  await mf.dispose();
}
footReached = true;
console.log(`\nd536: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
