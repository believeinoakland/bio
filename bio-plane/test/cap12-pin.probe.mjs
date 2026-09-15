/* CAP-12 — the PRISTINE digest for the over-strictness pin. Run against a
   PRISTINE `origin/main` checkout's `src/index.mjs` (pass its path as argv[2]),
   so the figure the suite pins is measured on the code before this item rather
   than written by hand and agreed with for free. Not part of the battery. */
import "../test/sandbox.mjs";
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const SRC = process.argv[2];
const HTML = `<!doctype html><html><head><title>Council Calendar</title></head>`
  + `<body><h1>Meetings</h1><p>A web page has no sheets, no paragraph count and no slides.</p></body></html>`;
function pdfBytes() {
  const chunks = [Buffer.from("%PDF-1.7\n", "latin1")];
  for (const o of [
    { num: 1, body: "<< /Type /Catalog /Pages 2 0 R >>" },
    { num: 2, body: "<< /Type /Pages /Kids [3 0 R] /Count 1 >>" },
    { num: 3, body: "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>" },
  ]) chunks.push(Buffer.from(`${o.num} 0 obj\n${o.body}\nendobj\n`, "latin1"));
  chunks.push(Buffer.from("%%EOF\n", "latin1"));
  return new Uint8Array(Buffer.concat(chunks));
}
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-pin", MEMBER_TOKEN: "mem-pin", PROBE_TOKEN: "prb-pin",
              VERSION: "test", GOVERNOR_APPETITE_PER_MIN: "600000",
              GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService(request) {
    const u = new URL(request.url);
    if (u.pathname === "/calendar.html")
      return new Response(HTML, { headers: { "content-type": "text/html; charset=utf-8" } });
    if (u.pathname === "/one.pdf")
      return new Response(pdfBytes(), { headers: { "content-type": "application/pdf" } });
    return new Response("unscripted", { status: 500 });
  },
});
const acquire = async (path) => (await (await mf.dispatchFetch(
  "http://x/api/?op=acquire&token=mem-pin",
  { method: "POST", body: JSON.stringify({ locator: "https://www.oaklandca.gov" + path,
                                           authority: "City of Oakland" }) })).json());
const norm = (o) => JSON.stringify(o).replace(/\d{4}-\d{2}-\d{2}T[0-9:.]+Z/g, "<T>");
const dig = (o) => createHash("sha256").update(norm(o)).digest("hex");
const html = (await acquire("/calendar.html")).document;
const pdf = (await acquire("/one.pdf")).document;
const pdfReading = { ...pdf.reading };
delete pdfReading.container_extent;
console.log(JSON.stringify({
  src: SRC,
  html: dig(html.reading), htmlKeys: Object.keys(html.reading).sort(),
  pdf: dig(pdfReading), pdfKeys: Object.keys(pdf.reading).sort(),
}, null, 2));
await mf.dispose();
