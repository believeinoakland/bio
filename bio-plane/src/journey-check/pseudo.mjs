/* journey-check R27, R29 (K3930 (4), K4145, K4146): the pseudo-locale walk. Every screen of the registry, at 1280 and 390 px,
   is drawn with `setup-words`' pseudo rows (its R17: every Latin letter of every sentence accented, the sentence lengthened
   and bracketed, the `{name}` placeholders kept), and the text a person sees is read for a run of three or more plain
   ASCII words outside data: such a run is a sentence that escaped the word list, reported by screen and element.
   The pseudo rows are made here in memory from the list (`pseudo`, setup-words' own); the file `rows.pseudo.mjs` is
   never read or written.
   R29 (a): a keyed sentence is drawn pseudo wherever it arrives from, a document's word pairs (`pseudoBody`) or an answer
   a screen fetches afterwards (`pseudoJson`: a catalogue's labels, a refusal, a reading). R29 (b): data is excluded by the
   markup the real screens draw (`DATA`) and by what a pseudo sentence holds between its brackets: the values filled into
   it. R29 (c): `security`'s catalogue fold (`details[data-fold="add"]`), drawn closed, is read open. */
import { WORD_ROWS } from "../setup-words/index.mjs";

const { pseudo } = await import("../setup-words/build.mjs");

/* A run of three or more plain ASCII words: letters, joined by spaces, commas, hyphens or apostrophes. */
const RUN = /[A-Za-z]{2,}(?:[  ,'’-]+[A-Za-z]+){2,}/g;

/* The letters pseudo puts in place of Latin ones (and its padding), found by asking `pseudo` itself. */
const PSEUDO_LETTERS = new Set([...pseudo("abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")].filter((c) => !/[\x00-\x7f]/.test(c)));
const isPseudoGroup = (s) => [...s].some((c) => PSEUDO_LETTERS.has(c));

/* `text` with every pseudo sentence taken out: an outermost `[…]` group holding a pseudo letter, the values filled into
   the sentence (plain ASCII, whatever their words) with it. Each removed character is a space. */
export function withoutPseudo(text) {
  const t = String(text);
  const keep = [...t];
  let depth = 0, start = -1;
  for (let i = 0; i < t.length; i += 1) {
    if (t[i] === "[") { if (depth === 0) start = i; depth += 1; }
    else if (t[i] === "]" && depth > 0) {
      depth -= 1;
      if (depth === 0 && isPseudoGroup(t.slice(start, i + 1))) for (let k = start; k <= i; k += 1) keep[k] = " ";
    }
  }
  return keep.join("");
}

/* Escaped sentences in `text`: `[{text}]`, the pseudo sentences (and what is filled into them) and the data `entered`
   (strings the walk typed) taken out first. */
export function escapedIn(text, { entered = [] } = {}) {
  let t = withoutPseudo(String(text).replace(/\s+/g, " "));
  for (const e of entered.filter((x) => typeof x === "string" && x.length >= 3)) t = t.split(e).join(" ");
  return [...t.matchAll(RUN)].map((m) => ({ text: m[0].slice(0, 80) }));
}

/* Data the screens draw from records, profiles and catalogues, not sentences (K4086, R29 (b)), by the markup the real screens
   draw: a reference to a record (`a.cs-ref`); the rows of the directory `elsewhere` draws from the profile
   (`cs.row`'s `div.cs-row`: the name, what it does, how to reach it); the places a profile names (`places`' list and the
   chooser's labels, each profile's name and `covers`, and the records' own text, `.rec`); and the scanner catalogue's
   vendor and product names (`setup`'s tool legends, `security`'s rows) and the handling each states (`security`'s `dl`). */
export const DATA = Object.freeze([
  "a.cs-ref",
  '[data-screen="elsewhere"] .cs-row',
  '[data-screen="places"] [data-list="profiles"] li', '[data-screen="places"] label[for^="pl-p-"]', '[data-screen="places"] .rec',
  "#cs-main .mk-rowname", '[data-screen="setup"] fieldset.mk-checks > legend', "#cs-main dl[data-handling]",
]);

/* The page's drawn text nodes holding an escaped sentence: `[{element, text}]`, `element` as a person finds it (the tag, id
   and first class). Script, style, form values, `DATA` and the `entered` data are not read; `security`'s catalogue fold, drawn closed,
   is opened first (R29 (c)); a pseudo sentence and what is filled into it are not escaped. */
export async function escapedOnPage(page, { entered = [] } = {}) {
  const blocks = await page.evaluate(([data]) => {
    for (const d of document.querySelectorAll('[data-screen="security"] details[data-fold="add"]')) d.open = true;
    const skip = new Set(["SCRIPT", "STYLE", "TEMPLATE", "NOSCRIPT", "TEXTAREA", "CODE", "PRE"]);
    const BLOCK = "p, li, dd, dt, td, th, label, legend, summary, h1, h2, h3, h4, button, div, section, span.meta, span.help, span.why";
    const blocks = new Map();
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      const p = n.parentElement;
      if (!p || skip.has(p.tagName)) continue;
      const r = p.getBoundingClientRect();
      const hidden = r.width <= 0 || r.height <= 0 || getComputedStyle(p).visibility === "hidden";
      const at = p.id ? `#${p.id}` : p.classList.length ? `.${p.classList[0]}` : "";
      const isData = data.some((d) => p.closest(d));
      const b = p.closest(BLOCK) || p;
      if (!blocks.has(b)) blocks.set(b, []);
      blocks.get(b).push({ element: `${p.tagName.toLowerCase()}${at}`, text: hidden || isData ? "" : n.nodeValue.replace(/\s+/g, " ") });
    }
    return [...blocks.values()];
  }, [DATA]);
  const out = [];
  const typed = entered.filter((x) => typeof x === "string" && x.length >= 3);
  for (const parts of blocks) {
    /* the block's text whole, so a sentence with a value inside another element is one pseudo sentence */
    const whole = parts.map((x) => x.text).join("");
    const kept = withoutPseudo(whole);
    let at = 0;
    for (const x of parts) {
      let t = kept.slice(at, at + x.text.length);
      at += x.text.length;
      for (const e of typed) t = t.split(e).join(" ");
      for (const m of t.matchAll(RUN)) out.push({ element: x.element, text: m[0].slice(0, 80) });
    }
  }
  return out;
}

/* ---- the sentences of the list, made pseudo wherever they arrive from ---- */

const SIMPLE = /\{[A-Za-z0-9_]+\}/g;
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
let known = null;

/* The list's English: each plain sentence (two words or more) by itself, each with placeholders as a pattern (its literal
   text at least eight characters, so a row that is all fill matches nothing), the longest pattern first. */
function sentences() {
  if (known) return known;
  const exact = new Map(), patterns = [];
  for (const row of WORD_ROWS) {
    const en = row[1];
    if (typeof en !== "string" || /\{[^}]*,/.test(en)) continue;
    const names = [...en.matchAll(/\{([A-Za-z0-9_]+)\}/g)].map((m) => m[1]);
    if (!names.length) { if (/\S\s+\S/.test(en)) exact.set(en, pseudo(en)); continue; }
    const literal = en.split(SIMPLE);
    if (literal.join("").trim().length < 8) continue;
    patterns.push({ re: new RegExp("^" + literal.map(esc).join("(.+?)") + "$", "s"), names, made: pseudo(en), size: literal.join("").length,
      parts: literal.filter(Boolean), first: literal[0], last: literal[literal.length - 1] });
  }
  patterns.sort((a, b) => b.size - a.size);
  return (known = { exact, patterns });
}

/* The list's sentence patterns, longest first: each `{re, names, made, size, parts, first, last}`. */
export const sentencePatterns = () => sentences().patterns;

/* What each string was made into (R30): the shell reads the whole list on every page, so a string recurs, and the answer of
   a string is the same each time. */
const made = new Map();

/* A string of an answer made pseudo when it is a sentence of the list, filled or not; any other string is as it was. A
   pattern is tried only by a string that starts with its first literal part, ends with its last and holds every other
   (R30: the expression cannot match otherwise, so the result is the one of trying every pattern). No length bounds a
   sentence: the list's longest are over 900 characters, and the cost is bounded by the pattern tries, not the length. */
export function pseudoString(s) {
  if (typeof s !== "string" || s.length < 5 || s.startsWith("[")) return s;
  const { exact, patterns } = sentences();
  if (exact.has(s)) return exact.get(s);
  if (!/\S\s+\S/.test(s)) return s;
  if (made.has(s)) return made.get(s);
  let answer = s;
  for (const p of patterns) {
    if (!s.startsWith(p.first) || !s.endsWith(p.last) || !p.parts.every((x) => s.includes(x))) continue;
    const m = p.re.exec(s);
    if (m) { answer = p.made.replace(SIMPLE, (ph) => m[1 + p.names.indexOf(ph.slice(1, -1))] ?? ph); break; }
  }
  made.set(s, answer);
  return answer;
}

/* A JSON value with each of its strings that is a keyed sentence made pseudo (R29 (a)): the answer of an op a screen fetches. */
export function pseudoValue(v) {
  if (typeof v === "string") return pseudoString(v);
  if (Array.isArray(v)) return v.map(pseudoValue);
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, pseudoValue(x)]));
  return v;
}

/* The body of an answer as text: made pseudo when it is JSON, else as it was. */
export function pseudoJson(body) {
  try { return JSON.stringify(pseudoValue(JSON.parse(String(body)))); } catch { return String(body); }
}

/* The page's words with every sentence made pseudo: `["key","en"` pairs of `interfacePage`'s data, each `en` of a key the list
   holds replaced by `pseudo(en)`. Answers the transformed body. */
let rows = null;
export async function pseudoBody(body) {
  rows ||= new Set(WORD_ROWS.map((r) => r[0]));
  return String(body).replace(/\["([A-Za-z0-9_.:-]+)","((?:[^"\\]|\\.)*)"/g, (m, key, en) => {
    if (!rows.has(key)) return m;
    let plain;
    try { plain = JSON.parse(`"${en}"`); } catch { return m; }
    return `["${key}",${JSON.stringify(pseudo(plain))}`;
  });
}

/* Routes a browser context's documents, scripts and fetches of `host` through `fetchCopy` and answers them with pseudo words (R29 (a)):
   the word pairs of a document or of the shell's own script (the page's words stand in that script since interface-shell's fix
   round 3, R1: the page carries no words itself), and the JSON a screen fetches; all else falls back to the routes before it. */
export async function pseudoRoute(context, { host, fetchCopy }) {
  await context.route("**/*", async (r) => {
    const req = r.request();
    const u = new URL(req.url());
    const type = req.resourceType();
    if (u.host !== host) return r.fallback();
    const doc = type === "document" && req.method() === "GET";
    const script = type === "script" && req.method() === "GET";
    if (!doc && !script && type !== "fetch" && type !== "xhr") return r.fallback();
    const init = { method: req.method(), headers: req.headers() };
    const sent = req.postDataBuffer();
    if (sent && !["GET", "HEAD"].includes(req.method())) init.body = sent;
    const res = await fetchCopy(new Request(req.url(), init));
    const ct = res.headers.get("content-type") || "";
    const headers = {};
    res.headers.forEach((v, k) => { if (k !== "set-cookie" && k !== "content-encoding" && k !== "content-length") headers[k] = v; });
    const cookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
    if (cookies.length) headers["set-cookie"] = cookies.join("\n");
    let body = Buffer.from(await res.arrayBuffer());
    if ((doc && /html/.test(ct)) || (script && /javascript|ecmascript/.test(ct))) body = Buffer.from(await pseudoBody(body.toString("utf8")));
    else if (/json/.test(ct)) body = Buffer.from(pseudoJson(body.toString("utf8")));
    await r.fulfill({ status: res.status, headers, body });
  });
}
