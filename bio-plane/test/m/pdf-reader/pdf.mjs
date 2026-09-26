/* pdf-reader tests: a hand-built PDF writer. Every fixture these tests read is
 * built here from text, never taken from any one jurisdiction's documents
 * (R29). The reader is xref-free (R8), so no xref table is written. */
import { deflateSync, deflateRawSync } from "node:zlib";

export const bytesOf = (s) => (s instanceof Uint8Array ? s : new Uint8Array(Buffer.from(s, "latin1")));
export const flate = (s) => new Uint8Array(deflateSync(bytesOf(s)));
export const flateRaw = (s) => new Uint8Array(deflateRawSync(bytesOf(s)));

/** One object: a string body, or `{ dict, data }` for a stream (`dict` the
 *  entries without `<< >>`; `/Length` is written unless `length` overrides it,
 *  `length: null` omits it). */
function objectBytes(num, body) {
  if (typeof body === "string") return [bytesOf(`${num} 0 obj\n${body}\nendobj\n`)];
  const data = bytesOf(body.data ?? "");
  const len = body.length === undefined ? ` /Length ${data.length}` : body.length === null ? "" : ` /Length ${body.length}`;
  return [
    bytesOf(`${num} 0 obj\n<< ${body.dict ?? ""}${len} >>\nstream\n`),
    data,
    bytesOf(body.noEnd ? "\n" : "\nendstream\nendobj\n"),
  ];
}

/** A whole file from `{ num: body }`, in key order unless `order` is given. */
export function build(objs, { header = "%PDF-1.7\n", trailer = "trailer\n<< /Root 1 0 R >>\n", order, tail = "" } = {}) {
  const parts = [bytesOf(header)];
  for (const n of order ?? Object.keys(objs).map(Number)) parts.push(...objectBytes(n, objs[n]));
  parts.push(bytesOf(trailer + tail + "%%EOF\n"));
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const p of parts) { out.set(p, off); off += p.length; }
  return out;
}

/* A simple font whose codes 0x20-0x7E map to themselves and are each 0.5 em
 * wide; F2 is the same font with no /Widths, so its advance is unknown. */
const TOUNI = "/CIDInit /ProcSet findresource begin 1 begincodespacerange <00> <FF> endcodespacerange "
  + "1 beginbfrange <20> <7E> <0020> endbfrange end";
export const FONT_OBJS = {
  10: `<< /Type /Font /Subtype /TrueType /BaseFont /Plain /FirstChar 32 /Widths [${Array(95).fill(500).join(" ")}] /ToUnicode 11 0 R >>`,
  11: { data: TOUNI },
  12: "<< /Type /Font /Subtype /TrueType /BaseFont /NoWidths /ToUnicode 11 0 R >>",
};
export const FONTS = "/Font << /F1 10 0 R /F2 12 0 R >>";

/** A document of pages. Each page is `{ content, resources, extra, contents }`:
 *  `content` a string (or `{dict,data}`) for its one content stream, `resources`
 *  the entries of its /Resources dict (default: the fonts), `extra` more page
 *  entries, `contents` a /Contents value that replaces the generated one, `box`
 *  the page-box entries (default a 600x800 /MediaBox).
 *  Page i is object 100+2i and its content 101+2i. */
export function doc(pages, { objs = {}, catalog = "", pagesExtra = "", ...opts } = {}) {
  const all = { 1: `<< /Type /Catalog /Pages 2 0 R ${catalog} >>`, ...FONT_OBJS };
  const kids = [];
  pages.forEach((p, i) => {
    const pn = 100 + 2 * i, cn = pn + 1;
    kids.push(`${pn} 0 R`);
    const res = p.resources ?? FONTS;
    const contents = p.contents ?? `${cn} 0 R`;
    all[pn] = `<< /Type /Page /Parent 2 0 R ${p.box ?? "/MediaBox [0 0 600 800]"} /Resources << ${res} >> /Contents ${contents} ${p.extra ?? ""} >>`;
    if (p.contents == null) all[cn] = typeof p.content === "object" ? p.content : { data: p.content ?? "" };
  });
  all[2] = `<< /Type /Pages /Kids [${kids.join(" ")}] /Count ${pages.length} ${pagesExtra} >>`;
  Object.assign(all, objs);
  return build(all, opts);
}

/** A PDF string literal's hex form, for text the tests do not want escaped. */
export const hex = (s) => "<" + Buffer.from(s, "latin1").toString("hex") + ">";
