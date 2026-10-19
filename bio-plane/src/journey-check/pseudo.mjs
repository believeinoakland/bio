/* journey-check R27 (K3930 (4)): the pseudo-locale walk. Every screen of the registry, at 1280 and 390 px, is drawn with
   `setup-words`' pseudo rows (its R17: every Latin letter of every sentence accented, the sentence lengthened and
   bracketed, the `{name}` placeholders kept), and the text a person sees is read for a run of three or more plain ASCII
   words outside the data the walk itself entered: such a run is a sentence that escaped the word list, reported by screen
   and element. The pseudo rows are made here in memory from the list (`pseudo`, setup-words' own); the file
   `rows.pseudo.mjs` is never read or written. */
import { WORD_ROWS } from "../setup-words/index.mjs";

/* A run of three or more plain ASCII words: letters, joined by spaces, commas, hyphens or apostrophes. */
const RUN = /[A-Za-z]{2,}(?:[  ,'’-]+[A-Za-z]+){2,}/g;

/* Escaped sentences in `text`: `[{text}]`, the data `entered` (strings the walk typed) taken out first. */
export function escapedIn(text, { entered = [] } = {}) {
  let t = String(text).replace(/\s+/g, " ");
  for (const e of entered.filter((x) => typeof x === "string" && x.length >= 3)) t = t.split(e).join(" ");
  return [...t.matchAll(RUN)].map((m) => ({ text: m[0].slice(0, 80) }));
}

/* Data the screens draw from records, profiles and catalogues, not sentences (B3, K4086): a reference to a record (`a.cs-ref`),
   the jurisdiction directory `elsewhere` draws from the profile, and the scanner catalogue's row names on `security`. */
export const DATA = Object.freeze(["a.cs-ref", '[data-screen="elsewhere"] #cs-main li', "#cs-main .mk-rowname"]);

/* The page's drawn text nodes holding an escaped sentence: `[{element, text}]`, `element` as a person finds it (the tag, id
   and first class, and the closest `data-screen` or `id`). Script, style, form values and the `entered` data are not read. */
export async function escapedOnPage(page, { entered = [] } = {}) {
  const found = await page.evaluate(([entered, src, data]) => {
    const RUN = new RegExp(src, "g");
    const skip = new Set(["SCRIPT", "STYLE", "TEMPLATE", "NOSCRIPT", "TEXTAREA", "CODE", "PRE"]);
    const out = [];
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      const p = n.parentElement;
      if (!p || skip.has(p.tagName) || data.some((d) => p.closest(d))) continue;
      const r = p.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0 || getComputedStyle(p).visibility === "hidden") continue;
      let t = n.nodeValue.replace(/\s+/g, " ");
      for (const e of entered) t = t.split(e).join(" ");
      for (const m of t.matchAll(RUN)) {
        const at = p.id ? `#${p.id}` : p.classList.length ? `.${p.classList[0]}` : "";
        out.push({ element: `${p.tagName.toLowerCase()}${at}`, text: m[0].slice(0, 80) });
      }
    }
    return out;
  }, [entered.filter((x) => typeof x === "string" && x.length >= 3), RUN.source, DATA]);
  return found;
}

/* The page's words with every sentence made pseudo: `["key","en"` pairs of `interfacePage`'s data, each `en` of a key the list
   holds replaced by `pseudo(en)`. Answers the transformed body. */
let rows = null;
export async function pseudoBody(body) {
  const { pseudo } = await import("../setup-words/build.mjs");
  rows ||= new Set(WORD_ROWS.map((r) => r[0]));
  return String(body).replace(/\["([A-Za-z0-9_.:-]+)","((?:[^"\\]|\\.)*)"/g, (m, key, en) => {
    if (!rows.has(key)) return m;
    let plain;
    try { plain = JSON.parse(`"${en}"`); } catch { return m; }
    return `["${key}",${JSON.stringify(pseudo(plain))}`;
  });
}

/* Routes a browser context's documents of `host` through `fetchCopy` and answers them with pseudo words; all else falls back
   to the routes before it. */
export async function pseudoRoute(context, { host, fetchCopy }) {
  await context.route("**/*", async (r) => {
    const req = r.request();
    const u = new URL(req.url());
    if (u.host !== host || req.resourceType() !== "document" || req.method() !== "GET") return r.fallback();
    const res = await fetchCopy(new Request(req.url(), { headers: req.headers() }));
    const type = res.headers.get("content-type") || "";
    if (!/html/.test(type)) return r.fallback();
    const body = await pseudoBody(await res.text());
    await r.fulfill({ status: res.status, headers: { "content-type": type }, body });
  });
}
