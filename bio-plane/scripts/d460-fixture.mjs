/* D-460 — THE TWO-PAGE SCANNED FIXTURE, MADE FROM RENDERED TEXT RATHER THAN FROM A LIBRARY'S PDF WRITER.
 *
 * The row's negative control: "a two-page scanned fixture whose second page alone carries the agenda heading reads
 * generic before the fix". Each page is ONE raw 8-bit grey image (FlateDecode) and nothing else — no font, no text
 * operator — so tier 1 marks BOTH pages `no_text_layer`, `needsTier3` selects the document, and the only way a reader
 * learns what a page says is the OCR member (`pagepixels.mjs`'s `raw-samples-grey8` route).
 *
 * TWO FILES, ONE GENERATOR, SO THEY CAN DIFFER IN NOTHING BUT THE ORDER:
 *   agenda-p2.pdf  page 0 a cover notice with no agenda signal; page 1 the agenda (masthead, roll call, an item with a
 *                  line-anchored Legistar file number and Subject:/Recommendation:), exactly the three signal families
 *                  `meeting-agenda.mjs`'s LIKELY path counts, and nothing on page 0 does.
 *   agenda-p1.pdf  the same two page images, swapped. The CONTROL on the engine: if this one reads `meeting_agenda`,
 *                  the OCR member can read the agenda page, and agenda-p2 reading generic is about WHICH PAGE was read.
 *
 * Rendered with `sharp` (librsvg; reached through miniflare's own dependency, not declared by the plane) in the
 * DejaVu Sans installed in the cloud image. The PDFs are COMMITTED; this script is how they were made, not a step any
 * suite runs. usage (from bio-plane/): node scripts/d460-fixture.mjs
 */
import { createRequire } from "node:module";
import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const sharp = require("sharp");
const OUT = fileURLToPath(new URL("../test/fixtures/d460/", import.meta.url));
const W = 1700, H = 2200;   // 8.5 x 11 in at 200 dpi — a 14,960,000 B RGBA frame, inside CPDF-15's measured bound

const COVER = ["CITY OF OAKLAND", "", "PUBLIC NOTICE", "",
  "This packet is published for the information", "of residents and interested parties.",
  "Copies are available at the office named below", "during regular business hours.", "",
  "One Frank H. Ogawa Plaza, Oakland, California"];
const AGENDA = ["Meeting Agenda", "", "Rules and Legislation Committee", "", "Roll Call", "",
  "1.1", "", "26-0910", "", "Subject: Grand Performance Mural", "",
  "Recommendation: Adopt a resolution approving the mural"];

async function pageSamples(lines) {
  const tspans = lines.map((l, i) => `<text x="150" y="${260 + i * 110}" font-family="DejaVu Sans" font-size="56" fill="#000">${l}</text>`).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="100%" height="100%" fill="#fff"/>${tspans}</svg>`;
  const { data, info } = await sharp(Buffer.from(svg)).greyscale().raw().toBuffer({ resolveWithObject: true });
  if (info.width !== W || info.height !== H || info.channels !== 1) throw new Error(`unexpected raster ${JSON.stringify(info)}`);
  return data;
}

function pdf(pageSamplesList) {
  const objs = [];
  const n = pageSamplesList.length;
  const kids = pageSamplesList.map((_, i) => `${3 + i * 3} 0 R`).join(" ");
  objs.push({ num: 1, body: "<< /Type /Catalog /Pages 2 0 R >>" });
  objs.push({ num: 2, body: `<< /Type /Pages /Kids [${kids}] /Count ${n} >>` });
  pageSamplesList.forEach((s, i) => {
    const p = 3 + i * 3, c = p + 1, im = p + 2;
    const content = Buffer.from("q 612 0 0 792 0 0 cm /Im0 Do Q", "latin1");
    const data = deflateSync(s);
    objs.push({ num: p, body: `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /XObject << /Im0 ${im} 0 R >> >> /Contents ${c} 0 R >>` });
    objs.push({ num: c, head: `<< /Length ${content.length} >>`, stream: content });
    objs.push({ num: im, head: `<< /Type /XObject /Subtype /Image /Width ${W} /Height ${H} /ColorSpace /DeviceGray /BitsPerComponent 8 /Filter /FlateDecode /Length ${data.length} >>`, stream: data });
  });
  const chunks = [Buffer.from("%PDF-1.7\n", "latin1")];
  const offsets = [];
  let at = chunks[0].length;
  const push = (b) => { chunks.push(b); at += b.length; };
  for (const o of objs.sort((a, b) => a.num - b.num)) {
    offsets[o.num] = at;
    push(Buffer.from(`${o.num} 0 obj\n`, "latin1"));
    if (o.stream) { push(Buffer.from(o.head + "\nstream\n", "latin1")); push(Buffer.from(o.stream)); push(Buffer.from("\nendstream\n", "latin1")); }
    else push(Buffer.from(o.body + "\n", "latin1"));
    push(Buffer.from("endobj\n", "latin1"));
  }
  const xref = at, size = objs.length + 1;
  let x = `xref\n0 ${size}\n0000000000 65535 f \n`;
  for (let i = 1; i < size; i++) x += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  push(Buffer.from(x + `trailer\n<< /Size ${size} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`, "latin1"));
  return Buffer.concat(chunks);
}

const cover = await pageSamples(COVER), agenda = await pageSamples(AGENDA);
for (const [name, pages] of [["agenda-p2.pdf", [cover, agenda]], ["agenda-p1.pdf", [agenda, cover]]]) {
  const b = pdf(pages);
  writeFileSync(OUT + name, b);
  console.log(name, b.length, createHash("sha256").update(b).digest("hex"));
}
