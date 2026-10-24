/* The visible text of an HTML page as reading-pipeline made it before R51 (fix round 9): the oracle the linear pass is judged against on
   pages it can read (the captured fixtures and generated pages), byte for byte. MOVE: kept only as the test's reference. Cells were
   paragraphs then (`td` and `th` are block tags here); the comparison replaces the cell separator R51 adds. */
import { glyphCount } from "../../../src/textchain.mjs";

const HTML_ENTITIES = { amp: "&", lt: "<", gt: ">", quot: "\"", apos: "'", nbsp: " ", copy: "©", reg: "®",
  trade: "™", mdash: "—", ndash: "–", hellip: "…", lsquo: "‘", rsquo: "’", ldquo: "“",
  rdquo: "”", bull: "•", middot: "·", sect: "§", para: "¶", deg: "°", times: "×",
  laquo: "«", raquo: "»", eacute: "é", egrave: "è", aacute: "á", iacute: "í",
  oacute: "ó", uacute: "ú", ntilde: "ñ", uuml: "ü", ouml: "ö", auml: "ä", ccedil: "ç" };
const decodeReferences = (s) => s.replace(/&(?:#(\d{1,7})|#[xX]([0-9a-fA-F]{1,6})|([A-Za-z][A-Za-z0-9]{1,8}));/g,
  (whole, dec, hex, name) => {
    if (name) return Object.prototype.hasOwnProperty.call(HTML_ENTITIES, name) ? HTML_ENTITIES[name] : whole;
    const cp = dec !== undefined ? Number(dec) : parseInt(hex, 16);
    if (!(cp > 0 && cp <= 0x10ffff) || (cp >= 0xd800 && cp <= 0xdfff)) return whole;
    const ch = String.fromCodePoint(cp);
    return /^\s$/.test(ch) ? " " : ch;   /* a referenced space or newline is a space, never a paragraph break */
  });
const BLOCK_TAG = "address|article|aside|blockquote|body|caption|dd|details|div|dl|dt|fieldset|figcaption|figure|footer|form"
  + "|h[1-6]|header|hr|html|li|main|nav|ol|p|pre|section|table|tbody|td|tfoot|th|thead|tr|ul";

/* R32 (T51; K4194; fix round 2, K4303; fix round 3, K4356): a captured page's reading is its evidentiary region, never
   its furniture. An element `nav`, or any element whose `role` is `navigation`, goes with its contents, counted by its
   own name so a nested one of the same name does not end it early; an element with no end tag is not guessed at (its
   tag goes, its words stay). When the page has a `main` element (else an `article` element), only its contents give
   passages (subresources R8's body regions); with neither, an element `header`, `footer` or `aside`, and any element
   whose `role` is `banner`, `contentinfo`, `complementary` or `search`, goes the same way: inside a main or an article
   they are kept. Fix round 3: the rest of the furniture goes wherever it sits, inside the region as well (`moreFurniture`):
   a dialog, a government-site banner or cookie or consent notice, a share bar (each by its role, class or id), a block
   of only controls or only links, and a notice that only says to skip ahead or that the reader is leaving the site. A
   skip link (an `a` whose `href` begins `#` and whose text begins "Skip to") goes. An unresolved template token goes. A
   page with none of this keeps all its text. */
const TAG_ATTRS = "(?:\"[^\"]*\"|'[^']*'|[^'\">])*";
const VOID_TAG = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
const attrOf = (attrs, name) => {
  const m = new RegExp(`(?:^|\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i").exec(attrs);
  return m ? (m[1] ?? m[2] ?? m[3]) : null;
};
const roleOf = (attrs) => (attrOf(attrs, "role") ?? "").trim().split(/\s+/)[0].toLowerCase();
const isNavigation = (name, attrs) => name.toLowerCase() === "nav" || roleOf(attrs) === "navigation";
const FURNITURE_NAME = new Set(["header", "footer", "aside"]);
const FURNITURE_ROLE = new Set(["banner", "contentinfo", "complementary", "search"]);
const isFurniture = (name, attrs) => FURNITURE_NAME.has(name.toLowerCase()) || FURNITURE_ROLE.has(roleOf(attrs));
const openTag = () => new RegExp(`<([A-Za-z][A-Za-z0-9:-]*)(${TAG_ATTRS})>`, "g");
/* The end of the element a start tag opened, counted by its own name: where its contents end and where it does. Null
   when it is never closed. `after` is the index just past the start tag. */
function endOfElement(markup, name, after) {
  const same = new RegExp(`<(/?)${name}(?=[\\s>/])(${TAG_ATTRS})>`, "gi");
  same.lastIndex = after;
  for (let depth = 1, t = same.exec(markup); t; t = same.exec(markup)) {
    if (t[1]) depth--;
    else if (!t[2].endsWith("/")) depth++;
    if (depth === 0) return { inner: t.index, end: same.lastIndex };
  }
  return null;
}
function dropElements(markup, isDropped) {
  const open = openTag();
  let out = "", from = 0;
  for (let m = open.exec(markup); m; m = open.exec(markup)) {
    if (!isDropped(m[1], m[2], markup, open.lastIndex)) continue;
    const name = m[1].toLowerCase(), after = m.index + m[0].length;
    let end = after;   /* a void or self-closing tag, or one never closed, is only itself */
    if (!VOID_TAG.has(name) && !m[2].endsWith("/")) end = endOfElement(markup, name, after)?.end ?? after;
    out += markup.slice(from, m.index) + " ";
    from = open.lastIndex = end;
  }
  return out + markup.slice(from);
}
/* The contents of every outermost closed element `name` in the page, in its order, a block break between them; null
   when the page has none. */
function contentsOf(markup, name) {
  const open = openTag(), parts = [];
  for (let m = open.exec(markup); m; m = open.exec(markup)) {
    if (m[1].toLowerCase() !== name || m[2].endsWith("/")) continue;
    const e = endOfElement(markup, name, open.lastIndex);
    if (!e) continue;
    parts.push(markup.slice(open.lastIndex, e.inner));
    open.lastIndex = e.end;
  }
  return parts.length ? parts.join("<hr>") : null;
}
/* Fix round 3: the furniture that goes wherever it sits. By name and attribute (`html`, `head`, `body`, `main` and
   `article` are never dropped by their class: a page's own class names are no judgement of the page). */
const NEVER_BY_ATTRIBUTE = new Set(["html", "head", "body", "main", "article"]);
const wordsOfToken = (t) => t.toLowerCase().split(/[-_]+/).filter(Boolean);
const classTokens = (attrs) => (attrOf(attrs, "class") ?? "").split(/\s+/).filter(Boolean).concat(attrOf(attrs, "id") ?? []);
const isDialogToken = (t) => /^(?:modal|modal-dialog|dialog)$/i.test(t);
const isBannerToken = (t) => /(?:usa|gov|government|govt|official)[-_]?banner/i.test(t)
  || wordsOfToken(t).some((w) => w === "cookie" || w === "cookies" || w === "consent" || w === "gdpr" || w === "ccpa");
const isShareToken = (t) => wordsOfToken(t).some((w) => w === "share" || w === "shares" || w === "sharing" || w === "sharer")
  || /^(?:addthis|sharethis|a2a)/i.test(t)
  || /^social(?:[-_](?:share|sharing|links|media|icons|buttons|bar|nav|follow|networks|menu))?$/i.test(t);
const DIALOG_ROLE = new Set(["dialog", "alertdialog"]);
const isFurnitureByAttribute = (name, attrs) => {
  const n = name.toLowerCase();
  if (NEVER_BY_ATTRIBUTE.has(n)) return false;
  if (n === "dialog" || DIALOG_ROLE.has(roleOf(attrs)) || (attrOf(attrs, "aria-modal") ?? "").trim().toLowerCase() === "true") return true;
  return classTokens(attrs).some((t) => isDialogToken(t) || isBannerToken(t) || isShareToken(t));
};
/* A block of only controls or only links, or a short notice that only says to skip ahead or that the reader is leaving
   the site, is told by walking the element's own contents from its start tag, stopping at once when it cannot be one. */
const BLOCK_CANDIDATE = new Set(["div", "section", "ul", "ol", "li", "p", "form", "fieldset", "menu", "dl", "dd", "dt",
  "span", "figure"]);
/* A heading, a caption or a quotation is a notice's candidate only: a heading that is a link is the page's own words. */
const NOTICE_CANDIDATE = new Set([...BLOCK_CANDIDATE, "h1", "h2", "h3", "h4", "h5", "h6", "figcaption", "blockquote"]);
const CONTROL_TAG = new Set(["button", "select", "textarea", "option", "optgroup", "label", "datalist", "output"]);
/* A link that wraps a heading or a paragraph is a card, the page's own words under a link, not a menu entry. */
const CARD_PART = new Set(["p", "h1", "h2", "h3", "h4", "h5", "h6", "div", "ul", "ol", "li", "section", "article", "figure", "blockquote", "table"]);
const NOTICE_TEXT_MAX = 400;
const NOTICE_TEXT = [/^skip (?:to|ahead|navigation|the|past)\b/i, /^jump to\b/i, /^exiting\s+[\w.-]+\.[a-z]{2,}\b/i,
  /^you (?:are|'re) (?:now )?(?:leaving|exiting)\b/i, /^you (?:are|'re) about to (?:leave|exit)\b/i, /^leaving (?:this|the|our)\b.*\b(?:site|website)\b/i];
const tagWalk = () => new RegExp(`<(/?)([A-Za-z][A-Za-z0-9:-]*)(?=[\\s>/])(${TAG_ATTRS})>`, "g");
function probeBlock(markup, name, after) {
  const walk = tagWalk(), own = name.toLowerCase();
  walk.lastIndex = after;
  let depth = 1, at = after, inLink = 0, inControl = 0, inCard = 0, loose = false, seen = false, said = "";
  for (let t = walk.exec(markup); t; t = walk.exec(markup)) {
    const seg = decodeReferences(markup.slice(at, t.index).replace(/\s+/g, " "));
    at = walk.lastIndex;
    if (glyphCount(seg) > 0) {
      said += seg;
      if ((!inLink && !inControl) || inCard) loose = true;
      if (loose && said.length > NOTICE_TEXT_MAX) return null;
    }
    const tag = t[2].toLowerCase(), closing = t[1] === "/", selfClosed = t[3].endsWith("/");
    if (tag === own) {
      if (closing) depth--; else if (!selfClosed) depth++;
      if (depth === 0) return { loose, seen, text: said.replace(/\s+/g, " ").trim(), long: said.length > NOTICE_TEXT_MAX };
    }
    if (inLink && CARD_PART.has(tag)) inCard = Math.max(0, inCard + (closing ? -1 : selfClosed ? 0 : 1));
    if (tag === "a") { inLink = Math.max(0, inLink + (closing ? -1 : selfClosed ? 0 : 1)); if (!closing) seen = true; }
    else if (tag === "input") { if (!closing) seen = true; }
    else if (CONTROL_TAG.has(tag)) { inControl = Math.max(0, inControl + (closing ? -1 : selfClosed ? 0 : 1)); if (!closing && tag !== "label") seen = true; }
  }
  return null;   /* never closed: not guessed at */
}
const isFurnitureBlock = (name, attrs, markup, after) => {
  const n = name.toLowerCase();
  if (!NOTICE_CANDIDATE.has(n) || attrs.endsWith("/")) return false;
  const p = probeBlock(markup, name, after);
  if (!p) return false;
  if (!p.loose && p.seen && BLOCK_CANDIDATE.has(n)) return true;
  return !p.long && p.text !== "" && NOTICE_TEXT.some((re) => re.test(p.text));
};
const moreFurniture = (name, attrs, markup, after) => isFurnitureByAttribute(name, attrs) || isFurnitureBlock(name, attrs, markup, after);
/* Fix round 4 (C19; K4429; RC-R11): furniture by name. A block that is no landmark but names itself furniture by a word
   of its `class` or `id` (split at `-`, `_` and camel-case humps) and holds no sentence of body prose goes, when the
   page has a region: a `main` element, else an `article`, else an element whose `role` is `main`. A sentence is a run of
   three or more words ending in a full stop, `!` or `?`, outside a heading, a label, a link and a control. */
const NAME_WORDS = new Set(["footer", "contact", "search", "breadcrumb", "breadcrumbs", "share", "social", "sidebar", "related", "explore", "promo", "promos", "gallery", "carousel"]);
const nameWords = (t) => t.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase().split(/[\s_-]+/).filter(Boolean);
const isNamedFurniture = (attrs) => classTokens(attrs).some((t) => nameWords(t).some((w) => NAME_WORDS.has(w)));
const NON_PROSE = /<(a|h[1-6]|label|button|select|option|textarea|script|style)\b(?:"[^"]*"|'[^']*'|[^'">])*>[\s\S]*?<\/\1\s*>/gi;
const SENTENCE = /(?:[\p{L}\p{N}'’-]+\s+){2,}[\p{L}\p{N}'’-]+[.!?](?=\s|$)/u;
const holdsProse = (inner) => SENTENCE.test(decodeReferences(inner.replace(NON_PROSE, " ").replace(/<\/?[A-Za-z][^\s>/]*(?:"[^"]*"|'[^']*'|[^'">])*>/g, " ")).replace(/\s+/g, " "));
const hasRegion = (markup) => contentsOf(markup, "main") !== null || contentsOf(markup, "article") !== null
  || new RegExp(`<[A-Za-z][A-Za-z0-9:-]*(?:"[^"]*"|'[^']*'|[^'">])*?\\srole\\s*=\\s*["']?main\\b`, "i").test(markup);
const namedFurniture = (markup) => {
  if (!hasRegion(markup)) return () => false;
  return (name, attrs, whole, after) => {
    const n = name.toLowerCase();
    if (NEVER_BY_ATTRIBUTE.has(n) || roleOf(attrs) === "main" || VOID_TAG.has(n) || attrs.endsWith("/") || !isNamedFurniture(attrs)) return false;
    const e = endOfElement(whole, n, after);
    return e !== null && !holdsProse(whole.slice(after, e.inner));
  };
};
const SKIP_LINK = new RegExp(`<a\\b(${TAG_ATTRS})>([\\s\\S]*?)</a\\s*>`, "gi");
const dropSkipLinks = (markup) => markup.replace(SKIP_LINK, (whole, attrs, inner) => {
  const href = attrOf(attrs, "href");
  const said = decodeReferences(inner.replace(/<\/?[A-Za-z][^\s>/]*(?:"[^"]*"|'[^']*'|[^'">])*>/g, "")).replace(/\s+/g, " ").trim();
  return href !== null && href.trim().startsWith("#") && /^skip to/i.test(said) ? " " : whole;
});
const TEMPLATE_TOKEN = /\{[0-9]+\}|\{[A-Za-z_][A-Za-z0-9_]*\}|##LOC\[[^\]]*\]##/g;

/* The page's visible text: comments, `head`, `script`, `style` and `template` contents are dropped (an unclosed one
   drops to the end), then navigation, then the page's main or article contents or else its landmark furniture, then the rest of the furniture wherever it sits, as above, every tag is removed (a block tag ends its paragraph, `br` its line),
   and character references are decoded, so a decoded `&lt;` is text, never a tag. Template tokens go last, so one
   written as references goes too. */
/* G14: `<head>` may be left unclosed (HTML ends it implicitly at the first thing that cannot be in a head): a closed head is
   dropped whole; an unclosed one is dropped up to the first element that is no head content, or the first text, and what
   follows is the body's. `script`, `style` and `template` left unclosed are raw text to the end of the document (the parsing
   rules' script data state), so they drop to the end as before. */
const HEAD_CONTENT = new Set(["title", "meta", "link", "base", "style", "script", "noscript", "template"]);
function dropHead(html) {
  const open = /<head\b(?:"[^"]*"|'[^']*'|[^'">])*>/i.exec(html);
  if (!open) return html;
  const closed = /<\/head\s*>/i.exec(html.slice(open.index));
  const tag = new RegExp(`<(/?)([A-Za-z][A-Za-z0-9:-]*)(?:"[^"]*"|'[^']*'|[^'">])*>`, "y");
  let at = open.index + open[0].length;
  for (;;) {
    const ws = /^\s*/.exec(html.slice(at, at + 1024))[0].length;
    at += ws;
    if (at >= html.length) break;
    if (html.startsWith("<!--", at)) { const e = html.indexOf("-->", at + 4); at = e < 0 ? html.length : e + 3; continue; }
    if (html[at] !== "<") break;   /* text: the body has begun */
    tag.lastIndex = at;
    const m = tag.exec(html);
    if (!m) break;
    const name = m[2].toLowerCase();
    if (m[1] && name === "head") { at = tag.lastIndex; break; }
    if (m[1] || !HEAD_CONTENT.has(name)) break;
    at = tag.lastIndex;
    if (["title", "style", "script", "noscript", "template"].includes(name) && !m[0].endsWith("/>")) {
      const end = new RegExp(`</${name}\\s*>`, "i").exec(html.slice(at));
      at = end ? at + end.index + end[0].length : html.length;
    }
  }
  return html.slice(0, open.index) + " " + html.slice(at);
}
export function visibleTextOfHtmlOld(html0) {
  const html = dropHead(html0);
  const live = dropElements(html
    .replace(/<!--[\s\S]*?(?:-->|$)/g, " ")
    .replace(/<(script|style|template|head)\b(?:"[^"]*"|'[^']*'|[^'">])*>[\s\S]*?(?:<\/\1\s*>|$)/gi, " ")
    .replace(/<!\[CDATA\[[\s\S]*?(?:\]\]>|$)/g, " ")
    .replace(/<![^>]*>|<\?[^>]*>/g, " "), isNavigation);
  const named = namedFurniture(live);
  const region = dropElements(contentsOf(live, "main") ?? contentsOf(live, "article") ?? dropElements(live, isFurniture),
                              (name, attrs, whole, after) => moreFurniture(name, attrs, whole, after) || named(name, attrs, whole, after));
  const dropped = dropSkipLinks(region)
    .replace(/\s+/g, " ");   /* the source's own line breaks and blank lines are no paragraph break in a page */
  const bare = dropped
    .replace(new RegExp(`</?(?:${BLOCK_TAG})\\b(?:"[^"]*"|'[^']*'|[^'">])*>`, "gi"), "\n\n")
    .replace(/<br\b(?:"[^"]*"|'[^']*'|[^'">])*>/gi, "\n")
    .replace(/<\/?[A-Za-z][^\s>/]*(?:"[^"]*"|'[^']*'|[^'">])*>/g, "");
  return decodeReferences(bare).replace(TEMPLATE_TOKEN, " ");
}

