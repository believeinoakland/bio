/* op=pdfstructure ESCALATES to the pdf-worker over a SERVICE BINDING (I6, CPDF-6).
 *
 * This is the end-to-end wiring a caller actually reaches: the plane runs Tier 1
 * in-plane (pure JS, free), and when Tier 1 got essentially nothing — the residue
 * CPDF-5 measured (CID / no-/ToUnicode fonts, encrypted PDFs) — it calls the
 * SEPARATE pdf-worker Worker over a service binding, which holds unpdf/pdf.js and
 * returns the record's I2 shape with the recovered text. Both Workers run under
 * ONE miniflare here, the plane from its source and the pdf-worker from its
 * COMMITTED bundle (unpdf inlined, running on workerd — its real runtime), bound
 * as `PDF_WORKER`. A store-level extractor test is not evidence a caller can reach
 * this; op=invitelook shipped a ReferenceError while 1276 store assertions passed.
 *
 * RUN 2026-07-31: forced `needsTier2` to `return false` -> the tier-2 text
 * assertions failed (document ""/tier 1); restored -> green. (In the report.)
 *
 * It also proves the two properties that keep the split honest:
 *   - WITHOUT the binding the same CID doc degrades to Tier 1, named, never a
 *     crash — so an instance that has not installed the fleet (D-115) still reads
 *     PDFs, and so the recovered text demonstrably comes FROM the worker.
 *   - a doc Tier 1 fully decodes is NOT escalated (stays tier 1), so the free
 *     in-plane path stays the common case.
 */
/* NEGATIVE CONTROL: neuter the escalation predicate (needsTier2 -> always false, or drop the env.PDF_WORKER.fetch call) -> the "tier 2 recovered the text" assertion fails (the CID doc comes back tier 1, empty text). */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const PLANE = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const BUNDLE = fileURLToPath(new URL("../../pdf-worker/dist/pdf-worker.bundled.mjs", import.meta.url));
const hex = (b) => createHash("sha256").update(b).digest("hex");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

function buildPdf(bodies) {
  let pdf = "%PDF-1.7\n%\xe2\xe3\xcf\xd3\n";
  const offsets = [];
  bodies.forEach((body, i) => { offsets[i] = pdf.length; pdf += `${i + 1} 0 obj\n${body}\nendobj\n`; });
  const xrefStart = pdf.length;
  const n = bodies.length + 1;
  let xref = `xref\n0 ${n}\n0000000000 65535 f \n`;
  for (let i = 0; i < bodies.length; i++) xref += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  pdf += xref + `trailer\n<< /Size ${n} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
  return new Uint8Array(Buffer.from(pdf, "latin1"));
}

// no-/ToUnicode font: Tier 1 cannot decode (marks undetermined), pdf.js can.
const CID_STREAM = "BT /F1 24 Tf 72 700 Td (Hello Oakland 2026) Tj ET";
const CID = buildPdf([
  "<< /Type /Catalog /Pages 2 0 R >>",
  "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
  "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
  `<< /Length ${CID_STREAM.length} >>\nstream\n${CID_STREAM}\nendstream`,
  "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
]);
const CID_SHA = hex(CID);

// WITH /ToUnicode: Tier 1 decodes it fully, so the plane must NOT escalate.
const TU_STREAM = "BT /F1 24 Tf 72 700 Td (A) Tj ET";
const TU_CMAP = `/CIDInit /ProcSet findresource begin 12 dict begin begincmap
/CMapName /Adobe-Identity-UCS def
/CMapType 2 def
1 begincodespacerange <00> <ff> endcodespacerange
1 beginbfchar <41> <0041> endbfchar
endcmap CMapName currentdict /CMap defineresource pop end end`;
const TU = buildPdf([
  "<< /Type /Catalog /Pages 2 0 R >>",
  "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
  "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
  `<< /Length ${TU_STREAM.length} >>\nstream\n${TU_STREAM}\nendstream`,
  "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /ToUnicode 6 0 R >>",
  `<< /Length ${TU_CMAP.length} >>\nstream\n${TU_CMAP}\nendstream`,
]);
const TU_SHA = hex(TU);

const MEM = "mem-bind-test";
const planeWorker = (services) => ({
  name: "plane", modules: true, modulesRoot: "/", scriptPath: PLANE, script: readFileSync(PLANE, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { VERSION: "test", ADMIN_TOKEN: "adm-bind-test", MEMBER_TOKEN: MEM, PROBE_TOKEN: "prb-bind-test" },
  ...(services ? { serviceBindings: { PDF_WORKER: "pdf-worker" } } : {}),
});
const pdfWorker = {
  name: "pdf-worker", modules: true, modulesRoot: "/", scriptPath: BUNDLE, script: readFileSync(BUNDLE, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  r2Buckets: ["CAPTURES"], bindings: { VERSION: "test" },
};

const put = (mf, bytes, sha) => mf.dispatchFetch(`http://x/api/capture?token=${MEM}&sha256=${sha}`, { method: "PUT", body: bytes });
const structure = (mf, sha) => mf.dispatchFetch(`http://x/api/pdfstructure?token=${MEM}&sha256=${sha}`);

/* ---- WITH the binding: a CID/no-ToUnicode doc comes back with Tier-2 text ---- */
console.log("\n--- plane WITH the pdf-worker binding: Tier 1 could not decode, Tier 2 (through the binding) does ---");
{
  const mf = new Miniflare({ workers: [planeWorker(true), pdfWorker] });
  t("the CID fixture landed via op=capture", (await (await put(mf, CID, CID_SHA)).json()).ok, true);
  const res = await structure(mf, CID_SHA);
  t("200", res.status, 200);
  const out = await res.json();
  t("ok", out.ok, true);
  t("tier 2 answered (through the service binding)", out.tier, 2);
  t("the plane returns the text Tier 1 could not decode", out.text.document, "Hello Oakland 2026");
  t("served as JSON with the CORS header", res.headers.get("access-control-allow-origin"), "*");

  console.log("\n--- a doc Tier 1 fully decodes is NOT escalated (the free path stays common) ---");
  await put(mf, TU, TU_SHA);
  const tuOut = await (await structure(mf, TU_SHA)).json();
  t("Tier 1 decoded the /ToUnicode doc", tuOut.text.document, "A");
  t("no escalation: stays tier 1", tuOut.tier, 1);
  await mf.dispose();
}

/* ---- WITHOUT the binding: the same doc degrades to Tier 1, named, no crash ---- */
console.log("\n--- plane WITHOUT the binding: same CID doc degrades to Tier 1 (fleet not installed, D-115) ---");
{
  const mf = new Miniflare({ workers: [planeWorker(false)] });
  await put(mf, CID, CID_SHA);
  const out = await (await structure(mf, CID_SHA)).json();
  t("ok (no crash)", out.ok, true);
  t("tier 1 only", out.tier, 1);
  t("Tier 1 could not decode -> empty document, never guessed", out.text.document, "");
  t("and it NAMES the cause (the font), first-class undetermined", out.text.undetermined[0].reason, "no_tounicode");
  await mf.dispose();
}

console.log(`\npdf-worker-binding: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
