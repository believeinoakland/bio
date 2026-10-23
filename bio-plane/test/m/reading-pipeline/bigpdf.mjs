/* extraction's test helper: a synthetic text PDF of a stated size (a classic one-xref-table layout), many pages of
   Flate-compressed text and incompressible image padding to reach `targetBytes`: the shape of the BAC packet's cost (many pages,
   tens of MB) without a file from outside. Deterministic text; the padding is random bytes. */
import { deflateSync } from "node:zlib";
import { randomBytes } from "node:crypto";
export function synthPdf({ pages, linesPerPage, targetBytes }) {
  const objs = [];
  const add = (body) => { objs.push(Buffer.isBuffer(body) ? body : Buffer.from(body, "latin1")); return objs.length; };
  const stream = (dict, data) => Buffer.concat([Buffer.from(`<< ${dict} /Length ${data.length} >>\nstream\n`, "latin1"), data, Buffer.from("\nendstream", "latin1")]);
  const words = ["budget", "department", "program", "appropriation", "fund", "services", "capital", "transfer", "revenue", "estimate", "fiscal", "report", "outlay", "authority"];
  let seed = 12345; const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  const cmap = Buffer.from("/CIDInit /ProcSet findresource begin 12 dict begin begincmap /CMapName /Adobe-Identity-UCS def /CMapType 2 def 1 begincodespacerange <00> <FF> endcodespacerange 1 beginbfrange <00> <FF> <0000> endbfrange endcmap CMapName currentdict /CMap defineresource pop end end", "latin1");
  const cmapId = add(stream("", cmap));
  const fontId = add(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /ToUnicode ${cmapId} 0 R >>`);
  const pageIds = [];
  const pagesTreeId = objs.length + pages * 2 + 1;
  for (let p = 0; p < pages; p++) {
    let t = "BT /F1 9 Tf 40 760 Td 11 TL\n";
    for (let l = 0; l < linesPerPage; l++) { let line = ""; for (let w = 0; w < 9; w++) line += words[Math.floor(rnd() * words.length)] + " " + Math.floor(rnd() * 99999) + " "; t += `(${line.trim()}) Tj T*\n`; }
    t += "ET";
    const cid = add(stream("/Filter /FlateDecode", deflateSync(Buffer.from(t, "latin1"))));
    pageIds.push(add(`<< /Type /Page /Parent ${pagesTreeId} 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${cid} 0 R >>`));
  }
  const treeId = add(`<< /Type /Pages /Count ${pages} /Kids [${pageIds.map((i) => `${i} 0 R`).join(" ")}] >>`);
  if (treeId !== pagesTreeId) throw new Error("tree id");
  const catId = add(`<< /Type /Catalog /Pages ${treeId} 0 R >>`);
  // padding: images to reach target size (stored, incompressible)
  let size = objs.reduce((n, b) => n + b.length + 20, 0);
  while (size < targetBytes) { const n = Math.min(1_000_000, targetBytes - size); add(stream("/Type /XObject /Subtype /Image /Width 1000 /Height 1000 /ColorSpace /DeviceGray /BitsPerComponent 8", randomBytes(n))); size += n + 120; }
  const parts = [Buffer.from("%PDF-1.7\n%\xe2\xe3\xcf\xd3\n", "latin1")]; const offs = []; let off = parts[0].length;
  objs.forEach((b, i) => { offs.push(off); const o = Buffer.concat([Buffer.from(`${i + 1} 0 obj\n`, "latin1"), b, Buffer.from("\nendobj\n", "latin1")]); parts.push(o); off += o.length; });
  const xref = off; let x = `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`; for (const o of offs) x += String(o).padStart(10, "0") + " 00000 n \n";
  x += `trailer\n<< /Size ${objs.length + 1} /Root ${catId} 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  parts.push(Buffer.from(x, "latin1"));
  return new Uint8Array(Buffer.concat(parts));
}
