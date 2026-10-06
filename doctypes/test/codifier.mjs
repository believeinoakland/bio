/* The codifier captures (fixtures/codifier.json) as the text a reader is given, and the
 * independent answers R17 checks a reading against.
 *
 * TEXT. Each served document is HTML. A text producer gives it as paragraphs: the document's
 * own title first, then one paragraph per HTML paragraph (or table row), tags removed,
 * entities decoded and white space collapsed; I2's `{document, paragraphs}` shape, so a
 * reading can place what it reads (`doc-para`).
 *
 * THE ANSWERS come from the codifier's own markup, never from the reader: a code section's
 * document is one section, its title the heading; a charter article's sections are its
 * paragraphs opening with a bold `Section <n>.`; a subsection is a marker paragraph whose class
 * is `incr<k>` (or `incr_ml<k>`), nested by its indentation `k`. */
import fs from "node:fs";

export const CODIFIER = JSON.parse(fs.readFileSync(new URL("./fixtures/codifier.json", import.meta.url), "utf8"));

const decode = (s) => s.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  .replace(/&quot;/g, "\"").replace(/&#39;|&apos;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
const clean = (h) => decode(h.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();

/** One served document's paragraphs, each with the HTML class it was served under. */
export function paragraphsOf(doc) {
  const out = [{ text: clean(doc.Title), cls: "title" }];
  const parts = String(doc.Content || "").split(/(?=<p\b|<tr\b)|<\/p>|<\/tr>/i);
  for (const part of parts) {
    const tag = /^<(?:p|tr)\b([^>]*)>/i.exec(part);
    const cls = tag ? /\bclass="([^"]*)"/.exec(tag[1]) : null;
    const text = clean(part);
    if (text) out.push({ text, cls: cls ? cls[1] : "" });
  }
  return out;
}

/** The text a reader is given for one served document: I2's paragraph shape. */
export function textOf(doc) {
  const ps = paragraphsOf(doc);
  return { document: ps.map((p) => p.text).join("\n"),
           paragraphs: ps.map((p, i) => ({ para: i, text: p.text })) };
}

/** The answers from the markup: the top-level sections (number, title, the paragraph each
 *  opens at) and the subsection markers (each its path within its section), per document. */
export function answersOf(doc) {
  const ps = paragraphsOf(doc);
  const sections = [];
  const article = /^ARTICLE /.test(doc.Title);
  if (!article) {
    const m = /^(\S+) - (.+?)\.?$/.exec(clean(doc.Title));
    sections.push({ number: m[1], heading: m[2], para: 0 });
  } else {
    const bold = [...String(doc.Content).matchAll(/<span class="bold">\s*Section (\d+)\.\s*([^<]*?)\.?\s*<\/span>/g)];
    let from = 0;
    for (const b of bold) {
      const i = ps.findIndex((p, k) => k > from && p.text.startsWith(`Section ${b[1]}.`));
      sections.push({ number: b[1], heading: clean(b[2]).replace(/\.$/, ""), para: i });
      from = i;
    }
  }
  /* A subsection's path, as its indentation nests it: a marker is a child of the nearest
     marker above it indented less, within its own section. */
  const starts = sections.map((x) => x.para);
  const markers = [];
  let stack = [];
  ps.forEach((p, i) => {
    if (starts.includes(i)) stack = [];
    const m = /\bincr(?:_ml)?(\d+)\b/.exec(p.cls);
    if (!m) return;
    const indent = Number(m[1]);
    while (stack.length && stack[stack.length - 1].indent >= indent) stack.pop();
    const value = p.text.replace(/^\(?([A-Za-z0-9]+)[.)]$/, "$1");
    stack.push({ indent, value });
    markers.push({ path: stack.map((x) => x.value), para: i, printed: p.text });
  });
  return { sections, markers, paragraphs: ps };
}

/** Every served document, with where it came from. */
export function servedDocuments() {
  const out = [];
  for (const c of CODIFIER.captures) for (const d of c.docs) out.push({ capture: c, doc: d });
  return out;
}
