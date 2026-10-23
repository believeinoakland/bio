/* acquisition — a document's own title (R98; fix round 3, C25). A fact read from the fetched bytes so that every screen names
 * the document by the record's one rule, not a reading: `acquire` still answers no `reading` or `text_units` (R8). The
 * rule is `reading-pipeline` R34's: for an HTML page, the text of its first `<title>` element, else of its first heading
 * (`h1` to `h6`) in document order; markup removed, character references decoded, whitespace collapsed, trimmed, at most
 * 200 characters; one with no glyph is none. Nothing inside a comment, `script`, `style` or `template` is a title. That
 * module is later in the order than this one, so the rule is stated here beside its user and never imported. */

export const TITLE_MAX_CHARS = 200;

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
    return /^\s$/u.test(ch) ? " " : ch;
  });

/* A title with no glyph (only white space) is none. */
const hasGlyph = (s) => { for (const ch of s) if (!/\s/u.test(ch)) return true; return false; };

function cleanTitle(s) {
  if (typeof s !== "string") return null;
  const bare = decodeReferences(s.replace(/<\/?[A-Za-z][^\s>/]*(?:"[^"]*"|'[^']*'|[^'">])*>/g, "")).replace(/\s+/g, " ").trim();
  const t = [...bare].slice(0, TITLE_MAX_CHARS).join("").trimEnd();
  return hasGlyph(t) ? t : null;
}

/* The inner markup of the first element named `names` (a regex alternation) that has an end tag; a self-closing tag and a
   start tag with no end tag are no element. */
function firstElementInner(markup, names) {
  const open = new RegExp(`<(${names})(?=[\\s>/])((?:"[^"]*"|'[^']*'|[^'">])*)>`, "gi");
  for (let m = open.exec(markup); m; m = open.exec(markup)) {
    if (m[2].endsWith("/")) continue;
    const end = new RegExp(`</${m[1]}\\s*>`, "i").exec(markup.slice(open.lastIndex));
    if (end) return markup.slice(open.lastIndex, open.lastIndex + end.index);
  }
  return null;
}

/** R98 (fix round 4, C25): a title some other reader found (a PDF's Info or XMP title), cleaned as an HTML page's is: markup removed,
 *  whitespace collapsed, at most 200 characters; null for none. Pure; never throws. */
export function cleanedTitle(s) { try { return cleanTitle(s); } catch { return null; } }

/** R98: the title of an HTML page, or null when it states none. Pure; never throws. */
export function titleOfHtml(html) {
  try {
    if (typeof html !== "string" || !html) return null;
    const live = html
      .replace(/<!--[\s\S]*?(?:-->|$)/g, " ")
      .replace(/<(script|style|template)\b(?:"[^"]*"|'[^']*'|[^'">])*>[\s\S]*?(?:<\/\1\s*>|$)/gi, " ")
      .replace(/<!\[CDATA\[[\s\S]*?(?:\]\]>|$)/g, " ");
    for (const names of ["title", "h[1-6]"]) {
      const t = cleanTitle(firstElementInner(live, names));
      if (t !== null) return t;
    }
    return null;
  } catch { return null; }
}

/** R98: the title of HTML bytes, decoded as the declared `charset` of their content type when it names one the runtime knows,
 *  else as UTF-8. Pure; never throws. */
export function titleOfBytes(bytes, declaredContentType = null) {
  try {
    if (!(bytes instanceof Uint8Array)) return null;
    const label = /charset\s*=\s*"?([A-Za-z0-9._:-]+)/i.exec(typeof declaredContentType === "string" ? declaredContentType : "");
    let text;
    try { text = new TextDecoder(label ? label[1] : "utf-8", { fatal: false }).decode(bytes); }
    catch { text = new TextDecoder("utf-8", { fatal: false }).decode(bytes); }
    return titleOfHtml(text);
  } catch { return null; }
}
