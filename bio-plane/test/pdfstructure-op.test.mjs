/* NEGATIVE CONTROL: (run 2026-07-31) make the op read the wrong R2 key (append "x" to captureKey(storeName, sha)) so a present capture is never found -> 4 assertions fail (the structure read-back / same-object / JSON checks) and the suite then throws reading structure off the NOT_FOUND body; restored, 29 pass. */
/* op=pdfstructure THROUGH THE OP (CAP-1, the CONTENT-PDF → CAPTURE delegation).
 *
 * Negative-control detail: make the op read the wrong R2 key (append "x" to captureKey(storeName, sha)) so a present capture is never found -> 4 assertions fail (the structure read-back / same-object / JSON checks) and the suite then throws reading structure off the NOT_FOUND body; restored, 29 pass.
 *
 * The extractor itself is proven byte-for-byte in pdfstructure.test.mjs. This
 * suite proves the WIRING a caller actually reaches: that bytes stored through
 * op=capture's PUT path can be read back through op=pdfstructure, that the R2
 * object is the SAME one (same store prefix, same sha), that the structure comes
 * back as JSON with the CORS header, and that absence and non-PDF input are
 * declared rather than faked. `op=invitelook` shipped a ReferenceError while
 * 1276 store-level assertions passed; a store-level extractor test is not
 * evidence a caller can reach the feature, so this drives the op.
 *
 * NEGATIVE CONTROLS, both automated below and re-run by hand (recorded in the
 * report):
 *   - a sha whose bytes are NOT a PDF  -> ok:false NOT_A_PDF, status 422.
 *   - a sha with nothing stored        -> ok:false NOT_FOUND, status 404,
 *     byte-identically to op=capture's own 404.
 *   - breaking the handler (returning the raw bytes instead of the structure)
 *     makes the deferred-link assertions FAIL — recorded in the report.
 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { linkWrapper } from "../src/subresources.mjs";
const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { VERSION: "test", ADMIN_TOKEN: "adm-pdfop-test", MEMBER_TOKEN: "mem-pdfop-test", PROBE_TOKEN: "prb-pdfop-test" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const hex = (b) => createHash("sha256").update(b).digest("hex");
const fetchRaw = (p, init) => mf.dispatchFetch("http://x" + p, init);
const j = async (p, init) => (await fetchRaw(p, init)).json();

/* A minimal, brute-force-parseable PDF (no xref) carrying ONE /URI link
   annotation on page 0 -> the extractor's `deferred` partition. Same assembler
   idea as pdfstructure.test.mjs, kept local so this suite owns its fixture. */
function pdf(objs) {
  const chunks = [Buffer.from("%PDF-1.7\n", "latin1")];
  for (const o of objs) {
    chunks.push(Buffer.from(`${o.num} 0 obj\n${o.body}\nendobj\n`, "latin1"));
  }
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
const pdfSha = hex(pdfBytes);

console.log("\n--- gates mirror op=capture GET (read-only, admin/member/probe, no capability) ---");
t("unauthenticated refused", (await j(`/api/pdfstructure?sha256=${pdfSha}`)).error, "unauthenticated");
t("missing sha refused", (await j(`/api/pdfstructure?token=mem-pdfop-test`)).error, "pdfstructure requires sha256=<64 lowercase hex>");
t("malformed sha refused", (await j(`/api/pdfstructure?token=mem-pdfop-test&sha256=zz`)).error, "pdfstructure requires sha256=<64 lowercase hex>");
{
  const status = (await fetchRaw(`/api/pdfstructure?sha256=${pdfSha}`)).status;
  t("unauthenticated is 401", status, 401);
}

console.log("\n--- store a PDF through op=capture, read its structure through op=pdfstructure ---");
const put = await j(`/api/capture?token=mem-pdfop-test&sha256=${pdfSha}`, { method: "PUT", body: pdfBytes });
t("the fixture landed via op=capture", put.ok, true);

const res = await fetchRaw(`/api/pdfstructure?token=mem-pdfop-test&sha256=${pdfSha}`);
t("200 on a found PDF", res.status, 200);
t("served as JSON", res.headers.get("content-type"), "application/json");
t("carries the same CORS header op=capture sets", res.headers.get("access-control-allow-origin"), "*");
const out = await res.json();
t("ok structure", out.ok, true);
t("container is pdf", out.container, "pdf");
t("one page", out.pages, 1);
t("exactly one link found", out.links.length, 1);

const link = out.links[0];
t("the link is deferred (an http(s) address the record may hold)", link.partition, "deferred");
t("the target url is carried verbatim, never invented", link.target.url, LINK_URL);
t("the element reference names the source page 0-based", link.source.page, 0);
t("and the annotation rectangle", link.source.rect, [100, 100, 200, 120]);
t("the wrapper is byte-identical to subresources.mjs linkWrapper.deferred",
  link.wrapper, linkWrapper.deferred(LINK_URL));
t("counts agree", out.counts, { anchor: 0, intra: 0, deferred: 1, refused: 0, undetermined: 0 });

console.log("\n--- probe reads its own scratch-stored PDF back (the store prefix is the same fence) ---");
const pp = await j(`/api/capture?token=prb-pdfop-test&sha256=${pdfSha}`, { method: "PUT", body: pdfBytes });
t("probe put lands in scratch", pp.store, "scratch");
const probeOut = await j(`/api/pdfstructure?token=prb-pdfop-test&sha256=${pdfSha}`);
t("probe reads structure from its own namespace", probeOut.links[0].target.url, LINK_URL);
t("member's bio store does NOT see the probe's scratch capture",
  (await fetchRaw(`/api/pdfstructure?token=prb-pdfop-test&sha256=${pdfSha}&store=bio`)).status, 403);

console.log("\n--- NEGATIVE CONTROL 1: a stored object that is not a PDF ---");
const notPdf = new TextEncoder().encode("this is plainly not a PDF, no %PDF- header anywhere");
const notPdfSha = hex(notPdf);
await j(`/api/capture?token=mem-pdfop-test&sha256=${notPdfSha}`, { method: "PUT", body: notPdf });
const badRes = await fetchRaw(`/api/pdfstructure?token=mem-pdfop-test&sha256=${notPdfSha}`);
t("non-PDF bytes answer 422, not 200", badRes.status, 422);
const bad = await badRes.json();
t("ok:false", bad.ok, false);
t("reason is NOT_A_PDF, stated not faked", bad.reason, "NOT_A_PDF");
t("container still named", bad.container, "pdf");

console.log("\n--- NEGATIVE CONTROL 2: absence is declared exactly as op=capture declares it ---");
const missingSha = "f".repeat(64);
const missRes = await fetchRaw(`/api/pdfstructure?token=mem-pdfop-test&sha256=${missingSha}`);
t("unknown sha is 404", missRes.status, 404);
const miss = await missRes.json();
t("reason NOT_FOUND", miss.reason, "NOT_FOUND");
t("echoes the sha", miss.sha256, missingSha);
/* Byte-for-byte the same 404 body op=capture returns for the same sha, proving
   this op mirrors op=capture's absence contract rather than inventing its own. */
const capMiss = await j(`/api/capture?token=mem-pdfop-test&sha256=${missingSha}`);
t("identical to op=capture's own 404 body", miss, capMiss);

await mf.dispose();
console.log(`\npdfstructure-op: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
