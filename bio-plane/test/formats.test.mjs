/* NEGATIVE CONTROL: delete the PDF entry from the registry (append `unregisterFormat("pdf")` at the end of src/formats.mjs) -> op=pdfstructure answers 501 {reason:"FORMAT_UNREGISTERED", format:"pdf", error naming formats.mjs} — the format named as unregistered, never a guess at another extractor. RUN 2026-08-03: this suite fails 3 detection assertions then dies at getFormat("pdf").structure; pdfstructure-op.test.mjs fails ("200 on a found PDF" got 501, ok:false) and dies reading structure off the 501 body; battery 65/68 (formats, pdfstructure-op, pdf-worker-binding FAILED). Restored; 35 pass, battery 68/68. */
/* The FORMAT registry (I7, COFF-1) — the third axis, and the D-70 evidence.
 *
 * Two halves:
 *
 *   1. The registry as a MODULE (direct import): magic bytes outrank a lying
 *      content type structurally (the two-pass rule lives in the REGISTRY, not
 *      in each entry's manners); undetermined is stated, never guessed; the pdf
 *      entry's structure() is byte-identical to extractPdfStructure (it IS it);
 *      and the D-70 assertion — a TEST-ONLY stub format registers and becomes
 *      reachable through the SAME detect→structure pipeline with ZERO edits
 *      outside the registry. That assertion is what makes framework §4's
 *      "a new axis costs a registry entry" a demonstrated property instead of
 *      a claim (D-70).
 *
 *   2. The registry THROUGH THE OPS (miniflare): op=acquire stamps
 *      document.profile.format ADDITIVELY (I1 §4c, 1.3.0) — magic-byte certain
 *      for both an HTML page (sniffed from the FW-3 text read-back) and a PDF
 *      (sniffed from a 1 KiB range read; profiled_from_text stays false) — and
 *      op=pdfstructure, now routed through the registry's pdf entry, returns
 *      byte-identical output to a direct extractPdfStructure call.
 *
 * The in-suite automated control unregisters the pdf entry at MODULE level and
 * proves detect falls to a stated undetermined and getFormat answers null; the
 * source-edit control (header line) breaks the op the way a real regression
 * would and is RUN and recorded, per VERIFICATION.md.
 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { registerFormat, unregisterFormat, getFormat, listFormats, detectFormat }
  from "../src/formats.mjs";
import { extractPdfStructure } from "../src/pdfstructure.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const hex = (b) => createHash("sha256").update(b).digest("hex");

/* A minimal, brute-force-parseable PDF carrying ONE /URI link annotation —
   the same assembler idea as pdfstructure-op.test.mjs, kept local so this
   suite owns its fixture. */
function pdf(objs) {
  const chunks = [Buffer.from("%PDF-1.7\n", "latin1")];
  for (const o of objs) chunks.push(Buffer.from(`${o.num} 0 obj\n${o.body}\nendobj\n`, "latin1"));
  chunks.push(Buffer.from("%%EOF\n", "latin1"));
  return new Uint8Array(Buffer.concat(chunks));
}
const LINK_URL = "https://example.gov/agenda.pdf";
const pdfBytes = pdf([
  { num: 1, body: "<< /Type /Catalog /Pages 2 0 R >>" },
  { num: 2, body: "<< /Type /Pages /Kids [3 0 R] /Count 1 >>" },
  { num: 3, body: "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Annots [4 0 R] >>" },
  { num: 4, body: `<< /Type /Annot /Subtype /Link /Rect [100 100 200 120] /A << /S /URI /URI (${LINK_URL}) >> >>` },
]);
const htmlBytes = new TextEncoder().encode("<!DOCTYPE html><html><body><p>minutes</p></body></html>");

console.log("\n--- detection: magic bytes FIRST, content type second (the registry enforces it) ---");
t("a PDF served with a LYING text/html content type is still a PDF",
  detectFormat(pdfBytes, "text/html").format, "pdf");
t("and the match is magic-byte certain",
  detectFormat(pdfBytes, "text/html").confidence, "certain");
t("an HTML page is recognised from its bytes alone",
  detectFormat(htmlBytes, null).format, "html");
t("magic-byte HTML is certain", detectFormat(htmlBytes, null).confidence, "certain");
t("content type alone recognises html (the former HTML_CT pair, exact match)",
  detectFormat(null, "text/html").format, "html");
t("including application/xhtml+xml", detectFormat(null, "application/xhtml+xml").format, "html");
t("a content-type-only match is at most likely, never certain",
  detectFormat(null, "text/html").confidence, "likely");
t("content type alone recognises pdf", detectFormat(null, "application/pdf").format, "pdf");

console.log("\n--- undetermined is FIRST-CLASS: stated with its reasons, never guessed ---");
const unk = detectFormat(new TextEncoder().encode("PK\x03\x04 a plain zip, no office parts"), "application/octet-stream");
t("unrecognised bytes + unrecognised type -> undetermined", unk.format, "undetermined");
t("with confidence none", unk.confidence, "none");
t("and the signals STATE why (no signature matched)",
  unk.signals.some((s) => /no registered magic-byte signature/.test(s)), true);
t("no bytes and no content type is also a stated undetermined",
  detectFormat(null, null), { format: "undetermined", confidence: "none",
    signals: ["no bytes were available to sniff", "no content type was declared"] });

console.log("\n--- the pdf entry IS pdfstructure.mjs: byte-identical structure ---");
const viaRegistry = await getFormat("pdf").structure(pdfBytes);
const direct = await extractPdfStructure(pdfBytes);
t("registry-dispatched structure equals a direct extractPdfStructure call, byte for byte",
  viaRegistry, direct);
t("and it carries the deferred link the fixture holds", viaRegistry.links[0].target.url, LINK_URL);

console.log("\n--- D-70: a NEW format costs ONE registry entry and NOTHING else ---");
/* The stub is TEST-ONLY: registered here, through the same registerFormat()
   the html and pdf entries use, and torn down below. No edit to index.mjs, no
   edit to any dispatch site — if this passes, framework §4's cost claim is a
   demonstrated property for the FORMAT axis. */
const STUB_MAGIC = "#STUB-FORMAT-1\n";
registerFormat({
  format: "stub",
  detect: (bytes, contentType) => {
    if (bytes && new TextDecoder("latin1").decode(bytes.subarray(0, 32)).startsWith(STUB_MAGIC))
      return { format: "stub", confidence: "certain", signals: ["magic: #STUB-FORMAT-1"] };
    if (contentType === "application/x-stub")
      return { format: "stub", confidence: "likely", signals: ['content type "application/x-stub"'] };
    return null;
  },
  parts: null,
  structure: (bytes) => ({ ok: true, container: "stub", bytes: bytes.length, links: [], counts: {} }),
  text: null,
});
const stubBytes = new TextEncoder().encode(STUB_MAGIC + "payload");
t("the stub registered", listFormats().includes("stub"), true);
const stubDet = detectFormat(stubBytes, null);
t("detect routes stub bytes to it, by magic", stubDet.format, "stub");
const stubStructure = await getFormat(stubDet.format).structure(stubBytes);
t("and detect→structure reaches the stub's extractor with ZERO edits outside the registry",
  stubStructure, { ok: true, container: "stub", bytes: stubBytes.length, links: [], counts: {} });
t("the stub never shadows the real formats", detectFormat(pdfBytes, null).format, "pdf");
unregisterFormat("stub");
t("torn down: the stub is gone", getFormat("stub"), null);
t("and its bytes fall back to a stated undetermined", detectFormat(stubBytes, null).format, "undetermined");

console.log("\n--- automated control at module level: an unregistered format is a stated absence ---");
const savedPdf = unregisterFormat("pdf");
t("with pdf unregistered, detect answers a stated undetermined, never another guess",
  detectFormat(pdfBytes, null).format, "undetermined");
t("and getFormat answers null (what op=pdfstructure turns into FORMAT_UNREGISTERED)",
  getFormat("pdf"), null);
registerFormat(savedPdf);
t("restored: pdf detects again", detectFormat(pdfBytes, null).format, "pdf");

/* ------------------------------------------------------------------ *
 * Half 2: THROUGH THE OPS. A module-level pass is not evidence a caller
 * can reach the feature (op=invitelook, D-43).
 * ------------------------------------------------------------------ */

const CAL_HTML = "<!DOCTYPE html><html><head><title>Minutes</title></head><body><main><p>City Council minutes, 7/15/2026.</p></main></body></html>";
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-fmt", MEMBER_TOKEN: "mem-fmt", PROBE_TOKEN: "prb-fmt", VERSION: "test",
              GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService(request) {
    const u = new URL(request.url);
    if (u.pathname === "/minutes.html")
      return new Response(CAL_HTML, { headers: { "content-type": "text/html; charset=utf-8" } });
    if (u.pathname === "/report.pdf")
      return new Response(pdfBytes, { headers: { "content-type": "application/pdf" } });
    return new Response("unscripted", { status: 500 });
  },
});
const j = async (p, init) => (await mf.dispatchFetch("http://x" + p, init)).json();
const acquire = (body) => j("/api/?op=acquire&token=mem-fmt",
  { method: "POST", body: JSON.stringify(body) });

console.log("\n--- op=acquire stamps profile.format ADDITIVELY (I1 §4c, 1.3.0) ---");
const page = await acquire({ locator: "https://example.gov/minutes.html", authority: "City Clerk" });
t("acquisition succeeds", page.ok, true);
t("the profile carries the FORMAT axis", page.document.profile.format.format, "html");
t("magic-byte certain (FW-3's text read-back was sniffed, not just the header)",
  page.document.profile.format.confidence, "certain");
t("with the magic signal stated",
  page.document.profile.format.signals.some((s) => /^magic:/.test(s)), true);
t("no existing profile field was reshaped (the FW-3 keys survive beside it)",
  [page.document.profile.profiled_from_text, page.document.profile.source_content_type],
  [true, "text/html"]);

const rep = await acquire({ locator: "https://example.gov/report.pdf", authority: "City Auditor" });
t("a PDF acquisition succeeds", rep.ok, true);
t("its profile.format is pdf", rep.document.profile.format.format, "pdf");
t("by MAGIC BYTES (the 1 KiB range read), not merely the declared type",
  rep.document.profile.format.confidence, "certain");
t("while profiled_from_text honestly stays false (the format sniff is not a text read)",
  rep.document.profile.profiled_from_text, false);

console.log("\n--- op=pdfstructure routed through the registry: byte-identical output ---");
const sha = hex(pdfBytes);
const put = await j(`/api/capture?token=mem-fmt&sha256=${sha}`, { method: "PUT", body: pdfBytes });
t("the fixture landed via op=capture", put.ok, true);
const viaOp = await j(`/api/pdfstructure?token=mem-fmt&sha256=${sha}`);
t("the op's output is the registry entry's output plus the tier stamp, byte for byte",
  viaOp, { ...direct, tier: 1 });
t("the deferred link survives the registry hop", viaOp.links[0].target.url, LINK_URL);

await mf.dispose();
console.log(`\nformats: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
