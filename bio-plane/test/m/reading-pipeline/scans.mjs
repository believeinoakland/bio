/* reading-pipeline's scan fixture (fix round 9): a PDF of `n` image-only pages and an OCR member honouring its one-page contract
   (the lowest page taken, the rest in `deferred`), shared by the round-9 tests. */
import { deflateSync } from "node:zlib";
import { member } from "./fixture.mjs";

function pdf(objs) {
  const chunks = [Buffer.from("%PDF-1.7\n", "latin1")];
  for (const o of objs) {
    chunks.push(Buffer.from(`${o.num} 0 obj\n`, "latin1"));
    if (o.stream) chunks.push(Buffer.from(o.head + "\nstream\n", "latin1"), o.stream, Buffer.from("\nendstream\n", "latin1"));
    else chunks.push(Buffer.from(o.body + "\n", "latin1"));
    chunks.push(Buffer.from("endobj\n", "latin1"));
  }
  chunks.push(Buffer.from("%%EOF\n", "latin1"));
  return new Uint8Array(Buffer.concat(chunks));
}
/* a scan of `n` image-only pages */
export function scanPdf(n) {
  const objs = [{ num: 1, body: "<< /Type /Catalog /Pages 2 0 R >>" },
    { num: 2, body: `<< /Type /Pages /Kids [${Array.from({ length: n }, (_, i) => `${3 + i * 3} 0 R`).join(" ")}] /Count ${n} >>` }];
  const img = deflateSync(Buffer.alloc(256, 0x80));
  const content = Buffer.from("q 612 0 0 792 0 0 cm /Im0 Do Q", "latin1");
  for (let i = 0; i < n; i++) {
    const p = 3 + i * 3;
    objs.push({ num: p, body: `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /XObject << /Im0 ${p + 2} 0 R >> >> /Contents ${p + 1} 0 R >>` });
    objs.push({ num: p + 1, head: `<< /Length ${content.length} >>`, stream: content });
    objs.push({ num: p + 2, head: `<< /Type /XObject /Subtype /Image /Width 16 /Height 16 /ColorSpace /DeviceGray /BitsPerComponent 8 /Filter /FlateDecode /Length ${img.length} >>`, stream: img });
  }
  return pdf(objs);
}
const ENV0 = { ok: true, engine: "tesseract-wasm", version: "0.11.0", cap: "C", measured_by: "CPDF-15", confidence_floor: null };
const region = (p) => ({ text: "SCANNED PAGE " + p, confidence: { value: 0.97, basis: "engine" },
                         source: { kind: "pdf-page", ref: "p" + p, page: p, rect: [72, 700, 540, 712] } });
export const chunked = () => member((body) => {
  const clean = [...new Set(body.pages)].sort((a, b) => a - b);
  return { ...ENV0, pages: [{ page: clean[0], regions: [region(clean[0])] }], deferred: clean.slice(1), notes: [] };
});
