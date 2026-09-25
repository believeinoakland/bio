/* NEGATIVE CONTROL: `node test/nc-d635.mjs [arm]` from `bio-plane/`. Each arm edits ONE real source ALONE, declares before it runs what MUST fail and what MUST NOT, and is restored from a uniquely-named pristine copy verified by sha256 AND byte comparison. (a) `baseline`: nothing armed, green. (b) `onepart`: THE ROW'S DECLARED CONTROL. The appended page is listed in the engine's part ONLY (the layer part filters it out, as it did before D-635), so BOTH PARTS fails by name, and so do the page-grain readers that follow from it (PAGE CAP, PROVENANCE, TIERS). KEEP and APPEND hold, because the text is still merged. (c) `refuse`: the merge refuses a selected page that holds a glyph again (the pre-D-635 rule), so KEEP/APPEND fail and FILL holds. (d) `nopart`: `mergedChain` stops naming each part when parts overlap, so SAME PAGES (two parts with one page list) resolves the folio's null into the engine's C and fails by name, while the three-page document's arms hold. (e) `spelling`: OVER-STRICTNESS. The layer part is computed from the BASE text's pages instead of the merged text's, a correct spelling this suite did not use, and everything MUST pass. RESULTS: measurements/M-180.md. */
/* D-635 — A PAGE ROUTED TO OCR WHOSE FOLIO DECODED KEEPS THE FOLIO, GAINS THE TRANSCRIPTION, AND IS LISTED IN BOTH
 * DERIVATION PARTS.
 *
 * BOB #35 RULED at 2026-09-25 06:25Z: APPEND. D-252's guarantee that layer text is never lost outranks the parts'
 * partition. D-627 routes a page an image fills while its only text is a folio (`image_content_unread`). On 8 of
 * M-178's 17 measured pages that folio DECODED, and `mergeTier3Text` refused to fill a page holding a glyph, so the
 * routed page came back unread. Now the page keeps its layer text, the transcription is appended after it, and the
 * page is listed in the layer part and in the engine's part.
 *
 * EVERY READER THAT ASSUMED THE PARTS PARTITION PAGES is driven here by name (the row's scope; CLAUDE.md §5):
 *   BOTH PARTS  `tier3Extend`'s layer part (index.mjs) — the appended page is in it and in the engine's part.
 *   PAGE CAP    `derivationCap(chain, {page})` (textchain.mjs) — two parts on one page answer by the partition
 *               rule: the folio's unmeasured layer makes the page UNDETERMINED, through `op=textattest`.
 *   SAME PAGES  `derivationCap` keyed parts by their page list; two parts with ONE page list merged into a
 *               sequence and read C. `mergedChain` now names each part (`extent.part`) when parts overlap.
 *   PROVENANCE  `readingProvenance` / `compareProvenance` (readingprov.mjs) — the page names BOTH producers.
 *   TIERS       `tiersEvidenced` (textchain.mjs) and `contentObservationsFor` (airun.mjs) — proven, not changed:
 *               they union pages per tier, so tier 1 and tier 3 each cover the page, and the latest row is PRESENT.
 *   PAGE SET    `#pageSetForCapture` (store.mjs) reads the max page named — proven by reading, unchanged.
 *   PARTITION   a document whose parts do not overlap records its chain byte for byte as before (no `part`).
 *
 * WHAT IS REAL AND WHAT IS A STUB. The PDF bytes are built here (the builder is `d627-image-content.test.mjs`'s),
 * tier 1 is the real `pdfstructure.mjs` in the real plane, and `op=acquire`, `op=promote` and `op=textattest` are
 * the real ops. The two fleet members are stubs, as in D-627's suite: tier 2 declines and the OCR member answers
 * for exactly the pages it is asked about.
 */
import { statedJSON } from "./stated.mjs";
import "./stdio.mjs";                 /* D-282 */
import "./sandbox.mjs";               /* D-186 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { derivationCap, tiersEvidenced, mergedChain, layerChain, describeChain } from "../src/textchain.mjs";
import { contentObservationsFor } from "../src/airun.mjs";
import { compareProvenance } from "../src/readingprov.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};
const sha256 = (v) => createHash("sha256").update(v).digest("hex");

/* ===================================================================== *
 * THE PDF BUILDER — `d627-image-content.test.mjs`'s, copied for that file's stated reason: importing a
 * `.test.mjs` would re-run it here.
 * ===================================================================== */
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
const IDENTITY_CMAP = Buffer.from(`/CIDInit /ProcSet findresource begin 12 dict begin begincmap
/CMapName /Adobe-Identity-UCS def
1 begincodespacerange
<20> <7e>
endcodespacerange
1 beginbfrange
<20> <7e> <0020>
endbfrange
endcmap CMapName currentdict /CMap defineresource pop end end`, "latin1");
const IMAGE_BYTES = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
const content = ({ text = "", imgs = [] }) => Buffer.from(
  (text ? `BT /F1 10 Tf 72 40 Td (${text}) Tj ET ` : "")
  + imgs.map(([x, y, w, h]) => `q ${w} 0 0 ${h} ${x} ${y} cm /Im0 Do Q`).join(" "), "latin1");
function doc(pages) {
  const objs = [
    { num: 1, body: "<< /Type /Catalog /Pages 2 0 R >>" },
    { num: 2, body: `<< /Type /Pages /Kids [${pages.map((_, i) => `${10 + 2 * i} 0 R`).join(" ")}] /Count ${pages.length} >>` },
    { num: 3, body: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /ToUnicode 4 0 R >>" },
    { num: 4, head: `<< /Length ${IDENTITY_CMAP.length} >>`, stream: IDENTITY_CMAP },
    { num: 6, head: `<< /Type /XObject /Subtype /Image /Width 850 /Height 1100 /Filter /DCTDecode /Length ${IMAGE_BYTES.length} >>`, stream: IMAGE_BYTES },
  ];
  pages.forEach((p, i) => {
    const c = content(p);
    const fonts = p.noFont ? "" : "/Font << /F1 3 0 R >> ";
    const xo = p.imgs && p.imgs.length ? "/XObject << /Im0 6 0 R >>" : "";
    objs.push({ num: 10 + 2 * i, body: `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << ${fonts}${xo} >> /Contents ${11 + 2 * i} 0 R >>` });
    objs.push({ num: 11 + 2 * i, head: `<< /Length ${c.length} >>`, stream: c });
  });
  return pdf(objs);
}
const FULL = [0, 0, 612, 792];
const TEXT_LINE = "Summary of General Purpose Fund revenues by category";

/* MIXED: page 0 a text page, page 1 an image with a decoded folio "19" (the D-635 page), page 2 a fontless scan.
   FOLIO: one page, an image with a decoded folio, so the layer part and the engine's part name ONE page list.
   PARTITION: a text page and a scan, the D-252 shape, whose parts do not overlap. */
const DOCS = {
  mixed: doc([{ text: TEXT_LINE }, { text: "19", imgs: [FULL] }, { noFont: true, imgs: [FULL] }]),
  folio: doc([{ text: "21", imgs: [FULL] }]),
  partition: doc([{ text: TEXT_LINE }, { noFont: true, imgs: [FULL] }]),
};
const SHA = Object.fromEntries(Object.entries(DOCS).map(([k, b]) => [k, sha256(b)]));
console.log(`D-635 corpus: ${Object.entries(DOCS).map(([k, b]) => `${k} ${b.length} B`).join(", ")}`);
t("the corpus is three documents, none empty (W34)", Object.values(DOCS).map((b) => b.length > 200), [true, true, true]);

const OCR_ASKED = [];
const OCR_LINES = ["Property Tax 245,112,000", "Sales Tax 71,904,000"];
const ocrAnswer = (pages) => ({
  ok: true, engine: "tesseract", version: "5.3.4-fast", cap: "C",
  measured_by: "MEASUREMENTS 2026-08-03 (CPDF-9)", confidence_floor: 0.6,
  pages: (Array.isArray(pages) ? pages : []).map((page) => ({
    page,
    regions: OCR_LINES.map((text, i) => ({
      text: `${text} p${page}`, confidence: { value: 0.97, basis: "engine" },
      source: { kind: "pdf-page", ref: `p${page}`, page, rect: [72, 700 - i * 12, 540, 712 - i * 12] },
    })),
  })),
});
const MEM = "mem-d635";
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  serviceBindings: {
    async PDF_WORKER() { return new Response("declined", { status: 500 }); },
    async OCR_WORKER(request) {
      if (new URL(request.url).pathname !== "/transcribe") return new Response("no", { status: 404 });
      const body = await request.json().catch(() => null);
      OCR_ASKED.push(body);
      return Response.json(ocrAnswer(body && body.pages));
    },
  },
  bindings: { ADMIN_TOKEN: "adm-d635", MEMBER_TOKEN: MEM, PROBE_TOKEN: "prb-d635",
              VERSION: "test", GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService(request) {
    const name = new URL(request.url).pathname.replace(/^\//, "").replace(/\.pdf$/, "");
    return Object.prototype.hasOwnProperty.call(DOCS, name)
      ? new Response(DOCS[name], { headers: { "content-type": "application/pdf" } })
      : new Response("unscripted", { status: 500 });
  },
});
const api = async (q, init) => (await (await mf.dispatchFetch(`http://x/api/?${q}&store=scratch`, init)).json());
const acquire = async (name) => (await api(`op=acquire&token=${MEM}`,
  { method: "POST", body: JSON.stringify({ locator: `https://www.oaklandca.gov/${name}.pdf`,
                                           authority: "Finance Department" }) })).document;
let bseq = 0;
const NOW = "2026-09-25T00:00:00Z";
const bundleMd = (id) => [
  "---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Append ${id}"`, "current_state: collected", "prior_state: null",
  `created: ${NOW}`, `last_updated: ${NOW}`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
  "  source: null", "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", "  locator: in hand", "  authority: synthetic", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none", "---", "",
  "## Summary", "", "Append bundle.", "", "## Provenance Notes", "",
  "## Session Log", "", "## Review Notes", "",
].join("\n");
const promoteDoc = async (d) => {
  const id = `INFO-2026-${String(++bseq).padStart(4, "0")}-append`;
  const md = bundleMd(id);
  const prov = JSON.stringify({ documents: [d] });
  const r = await api(`op=promote&token=${MEM}`, { method: "POST", body: JSON.stringify({
    bundleId: id, base: null, snapKey: "20260925T010000Z_d635d635", author: "d635",
    meta: { object_type: "information", group: "believe-in-oakland", title: `Append ${id}`,
            current_state: "collected", created: NOW, last_updated: NOW },
    files: [
      { path: "bundle.md", text: md, bytes: md.length, sha256: sha256(md) },
      { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha256(prov) },
    ],
    register: [],
  }) });
  return r.ok !== false;
};
const ceilingOf = async (sha, page) => {
  const r = (await api(`op=textattest&token=${MEM}&sha256=${sha}&page=${page}&rect=${encodeURIComponent("[72,600,540,720]")}`)).result;
  return r && r.ceiling ? r.ceiling.ceiling : "(no answer)";
};
const pagesOf = (s) => (Array.isArray(s) ? s : []).map((x) => [x.step, x.extent ? x.extent.pages : null]);

try {
  /* ===================================================================== *
   * 1. THE MIXED DOCUMENT through op=acquire.
   * ===================================================================== */
  console.log("\n--- 1. KEEP, APPEND, FILL: the three-page mixed document ---");
  const m = await acquire("mixed");
  const asked = (k) => (OCR_ASKED.find((b) => b && b.capture_sha === SHA[k]) || {}).pages ?? null;
  t("ROUTE: the decoded-folio page and the scan are asked about; the text page is not", asked("mixed"), [1, 2]);
  const reading = m && m.reading ? m.reading : {};
  const chain = Array.isArray(reading.text_source) ? reading.text_source : [];
  const prov = reading.provenance || {};
  const pp = (n) => (Array.isArray(prov.pages) ? prov.pages.find((x) => x.page === n) : null) || {};
  t("the reading is recorded at tier 3", reading.text_tier, 3);
  /* The text itself, by digest: each page's text_sha256 is the SHA-256 of the exact page text. */
  const want1 = `19\n${OCR_LINES[0]} p1\n${OCR_LINES[1]} p1`;
  t("KEEP: the text page's own text is untouched", pp(0).text_sha256, sha256(TEXT_LINE));
  t("KEEP + APPEND: page 1 holds its folio FIRST, then the transcription (the page text, by SHA-256)",
    pp(1).text_sha256, sha256(want1));
  t("FILL: the scan holds the transcription alone", pp(2).text_sha256, sha256(`${OCR_LINES[0]} p2\n${OCR_LINES[1]} p2`));
  t("APPEND: the reading's entities come from all three pages' text (the folio did not block the transcription)",
    reading.read_from_text, true);
  t("the basis says a page kept its folio and gained the transcription, credited to both",
    /kept it: the transcription was appended after it, so that page is credited to both the text layer and the OCR member/
      .test(reading.basis ?? ""), true);
  /* The reading carries `tier3_candidate: true` only while a selected page is unread; absent means none is. */
  t("no page still wants OCR: the document is not a tier-3 candidate any more", reading.tier3_candidate ?? false, false);

  /* ===================================================================== *
   * 2. BOTH PARTS — the row's accepts-when, by name.
   * ===================================================================== */
  console.log("\n--- 2. BOTH PARTS ---");
  t("BOTH PARTS: the chain is the layer part over pages 0 and 1, then the engine's part over pages 1 and 2",
    pagesOf(chain), [["layer", [0, 1]], ["pixels", [1, 2]], ["ocr", [1, 2]]]);
  t("BOTH PARTS: page 1 is covered by the layer part AND by the engine's part",
    [chain.some((s) => s.step === "layer" && s.extent && s.extent.pages.includes(1)),
     chain.some((s) => s.step === "ocr" && s.extent && s.extent.pages.includes(1))], [true, true]);
  t("BOTH PARTS: the parts overlap, so each names its part, and the two are distinct",
    chain.map((s) => s.extent && s.extent.part), [0, 1, 1]);
  /* `describeChain` reads each step's own pages and needed no change: proven here, not assumed. */
  t("BOTH PARTS: the chain's sentence names page 1 under the layer AND under the engine",
    /\(pages 0-1\) -> .*\(pages 1-2\) -> .*\(pages 1-2\)/.test(describeChain(chain)), true);

  /* ===================================================================== *
   * 3. PAGE CAP, through op=textattest on the promoted capture.
   * ===================================================================== */
  console.log("\n--- 3. PAGE CAP: what a leg citing each page may support ---");
  t("the mixed capture promoted", await promoteDoc(m), true);
  t("PAGE CAP: the text page is undetermined (its layer is unmeasured)", await ceilingOf(SHA.mixed, 0), null);
  t("PAGE CAP: the folio page is UNDETERMINED — part of its text is the unmeasured layer — never the engine's C",
    await ceilingOf(SHA.mixed, 1), null);
  t("PAGE CAP: the scan the engine alone read takes the engine's C", await ceilingOf(SHA.mixed, 2), "C");
  t("PAGE CAP: the document is undetermined", derivationCap(chain), null);

  /* ===================================================================== *
   * 4. PROVENANCE and TIERS.
   * ===================================================================== */
  console.log("\n--- 4. PROVENANCE and TIERS ---");
  t("PROVENANCE: page 1 names both producers, the plane's tier 1 and the OCR member's tier 3",
    pp(1).producers, [{ tier: 1, member: "plane" }, { tier: 3, member: "ocr-worker" }]);
  t("PROVENANCE: a page with one producer reads exactly as before (no `producers` key)",
    [pp(0).tier, pp(0).member, "producers" in pp(0), pp(2).tier, pp(2).member, "producers" in pp(2)],
    [1, "plane", false, 3, "ocr-worker", false]);
  const credited = Object.fromEntries((prov.producers || []).map((p) => [`${p.tier}:${p.member}`, p.pages]));
  t("PROVENANCE: page 1 is credited as transcribed to BOTH producers",
    [credited["1:plane"], credited["3:ocr-worker"]], [[0, 1], [1, 2]]);
  /* A re-read in which only the transcription moved is attributed to both producers of that page, not to one. */
  const moved = { ...prov, text_sha256: "x".repeat(64),
                  pages: prov.pages.map((p) => (p.page === 1 ? { ...p, text_sha256: "y".repeat(64) } : p)) };
  t("PROVENANCE: a changed page with two producers is attributed to both",
    compareProvenance(prov, moved).says,
    "tier 1 on plane and tier 3 on ocr-worker returned different text for page 2");
  const ev = tiersEvidenced(chain);
  t("TIERS: tier 1 covers pages 0 and 1, tier 3 covers pages 1 and 2 (each tier over its own pages)",
    ev.tiers.map((x) => [x.tier, x.covers]), [[1, [0, 1]], [3, [1, 2]]]);
  const obs = contentObservationsFor({ ...reading, page_count: 3 }, SHA.mixed, tiersEvidenced);
  t("TIERS: after tier 1 the capture is partial, after tier 3 it is PRESENT (the union counts page 1 once)",
    obs.rows.map((r) => [r.tier, r.state]), [[1, "partial"], [3, "PRESENT"]]);

  /* ===================================================================== *
   * 5. SAME PAGES: two parts with one page list.
   * ===================================================================== */
  console.log("\n--- 5. SAME PAGES: a one-page folio document ---");
  const f = await acquire("folio");
  const fc = f && f.reading && Array.isArray(f.reading.text_source) ? f.reading.text_source : [];
  t("SAME PAGES: both parts name page 0 and nothing else", pagesOf(fc), [["layer", [0]], ["pixels", [0]], ["ocr", [0]]]);
  t("SAME PAGES: and they are told apart by their part", fc.map((s) => s.extent && s.extent.part), [0, 1, 1]);
  t("SAME PAGES: the document is UNDETERMINED, not the engine's C (the folio is unmeasured layer text)",
    derivationCap(fc), null);
  t("SAME PAGES: and so is its one page", derivationCap(fc, { page: 0 }), null);
  t("the folio capture promoted", await promoteDoc(f), true);
  t("SAME PAGES: through op=textattest the page is undetermined", await ceilingOf(SHA.folio, 0), null);

  /* ===================================================================== *
   * 6. PARTITION: nothing moved for a document whose parts do not overlap.
   * ===================================================================== */
  console.log("\n--- 6. PARTITION: the D-252 shape records what it always did ---");
  const p = await acquire("partition");
  const pc = p && p.reading && Array.isArray(p.reading.text_source) ? p.reading.text_source : [];
  t("PARTITION: the chain is scoped exactly as before, and names no part",
    pc.map((s) => [s.step, s.extent]), [["layer", { kind: "pages", pages: [0] }],
                                         ["pixels", { kind: "pages", pages: [1] }],
                                         ["ocr", { kind: "pages", pages: [1] }]]);
  t("PARTITION: the text page is undetermined and the scan takes C, as D-252 pinned",
    [derivationCap(pc, { page: 0 }), derivationCap(pc, { page: 1 })], [null, "C"]);

  /* ===================================================================== *
   * 7. THE RULES THEMSELVES, over composed chains.
   * ===================================================================== */
  console.log("\n--- 7. the rules, composed ---");
  const LC = layerChain({ tier: 1, container: "pdf", cap: null, measured_by: "unmeasured" });
  const OC = [{ step: "pixels", cap: "C", measured_by: "m" },
              { step: "ocr", engine: "tesseract", version: "5", cap: "C", measured_by: "m" }];
  const MD = [{ step: "ocr", engine: "a", version: "1", cap: "D", measured_by: "m" }];
  t("two MEASURED parts on one page give the weaker, computed",
    derivationCap(mergedChain([{ chain: MD, pages: [0] }, { chain: OC, pages: [0] }]), { page: 0 }), "D");
  t("an overlap stamps every part; a partition stamps none",
    [mergedChain([{ chain: LC, pages: [0] }, { chain: OC, pages: [0, 1] }]).map((s) => s.extent.part),
     mergedChain([{ chain: LC, pages: [0] }, { chain: OC, pages: [1] }]).map((s) => s.extent.part)],
    [[0, 1, 1], [undefined, undefined, undefined]]);
  t("a `part` that is not a readable index makes the extent unreadable, and the cap undetermined",
    derivationCap([{ step: "ocr", engine: "e", version: "1", cap: "C", measured_by: "m",
                     extent: { kind: "pages", pages: [0], part: "one" } }]), null);
} finally {
  await mf.dispose();
}

console.log(`\nd635-append: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
