/* The line-level reading the roster and org-chart types share: what a name looks like, which contact
 * points a line carries (to leave them unread, R4), which of the view's staff titles it prints, and how
 * a roster line divides into a name and a title — or does not (R2).
 *
 * WHAT STAYS IN CODE, AND WHY IT IS PLACE-FREE (R8; layers.md, "No jurisdiction in the product"). The
 * shape of a personal name in Latin script (capitalised words, initials, particles, generational
 * suffixes); the shape of an e-mail address, a North American phone number and a street address; the
 * English words that name a KIND of organisational unit (office, division, section) and the function
 * words a sentence opens with. None names a place or an office of one jurisdiction. Everything local —
 * the words a roster or chart names itself with, its header words, the titles printed beside a name —
 * comes from the view (`roster_words`, `roster_headers`, `staff_titles`; jurisdictions R6).
 *
 * WHAT A NAME SPAN CANNOT SEE, stated because it bounds every reading built on it: a name in a script
 * without case, a single-word name, and a name printed in capitals are not name-shaped here; a phrase of
 * two to four capitalised words that is not a person's name ("Grey Gardner" is a name; "Harbor Point" is
 * not, and both look alike) is. So nothing in this module asserts that a span IS a person: a span is
 * "name-shaped", and every reading built on one says so (R10). */
import { vocabPatterns, vocabulary, vocabRegex, IN_PROSE, flatten } from "../docprofile/registry.mjs";

/* A word that, opening or ending a span, makes it a phrase rather than a name: function words, the
   kinds of unit an organisation is divided into, the words of a schedule and of a blank form, and the
   words a chart prints in an empty box. Place-free English; a closed list of KINDS, never of places. */
const NOT_NAME_WORDS = new Set(`a an and are as at be by but for from has have he her his i if in is it its
  of on or our she that the their these they this those to was we were will with your you all any each
  every no not yes please dear total page pages date name names updated update regular meeting meetings
  agenda minutes notes note item items vacant reserved pending tbd tba none open position positions
  office offices division divisions section sections unit units bureau bureaus department departments
  dept agency agencies program programs programme services service center centre centers team teams
  branch board boards committee committees commission commissions council councils organization
  organisation organizations administration management operations group groups area areas district
  districts foundation inc llc company co corporation association union local hospital school schools
  college university library police fire works public city county state staff members member roster
  chart directory contacts contact phone email fax address street avenue suite floor plaza level
  january february march april may june july august september october november december monday tuesday
  wednesday thursday friday saturday sunday chair chairs`.split(/\s+/).filter(Boolean));

/* The words that make a short line name a UNIT of an organisation, as its last word ("Records
   Division") or its first ("Office of the Inspector General"). Place-free: kinds of unit. */
export const UNIT_WORDS = new Set(`office division section unit bureau department dept agency program programme
  services center centre team branch board committee commission council councils administration
  operations group area district task force`.split(/\s+/).filter(Boolean));

const L = "\\p{Lu}";
const l = "\\p{Ll}";
/* One word of a name: a capitalised word (hyphens and apostrophes inside it, internal capitals as in
   "McDonald" or "LeGrannde"), or an initial. A particle (de, van, da) may sit between words. */
const WORD = `(?:${L}${l}+(?:${L}${l}+)*(?:[-'’]${L}?${l}+)*|${L}\\.)`;
const PARTICLE = "(?:de|del|della|di|da|dos|du|la|le|van|von|der|den|ter|bin|ibn|al)";
const NICK = `(?:["“][${"\\p{L}"}]+["”])`;
const SUFFIX = "(?:,?\\s+(?:Jr\\.?|Sr\\.?|II|III|IV))";
/* Two to four name words, optionally one quoted nickname and one generational suffix. */
const NAME_SRC = `${WORD}(?:\\s+(?:${PARTICLE}\\s+)?(?:${NICK}\\s+)?${WORD}){1,3}${SUFFIX}?`;
const NAME_AT = new RegExp(`^(?:${NAME_SRC})`, "u");
const NAME_WHOLE = new RegExp(`^(?:${NAME_SRC})$`, "u");
const NAME_ALL = new RegExp(`(?<![\\p{L}\\p{N}])${NAME_SRC}(?![\\p{L}\\p{N}])`, "gu");

const words = (s) => String(s).replace(/["“”]/g, "").split(/\s+/).filter(Boolean);
const phraseWord = (w) => NOT_NAME_WORDS.has(w.replace(/["“”.,]+/g, "").toLowerCase());
/* A name ends where a phrase word begins: a matched run is cut at its first phrase word, and what is
   left is a name only while it keeps two name words ("Langston Buddenhagen District 1" reads the name
   "Langston Buddenhagen"). A span is never shortened from its front: that would choose a name inside a
   phrase, the guess R2 forbids. */
function cut(run) {
  const toks = run.split(/(\s+)/);
  let out = "", n = 0;
  for (let i = 0; i < toks.length; i += 2) {
    const w = toks[i];
    if (phraseWord(w)) break;
    out += (i ? toks[i - 1] : "") + w;
    if (!/^["“]/.test(w) && !/^(?:Jr\.?|Sr\.?|II|III|IV),?$/.test(w) && !/^\p{Ll}/u.test(w)) n++;
  }
  out = out.replace(/,\s*$/, "").trim();
  return n >= 2 && !/^\p{Ll}/u.test(out) && !/\s\p{Ll}+$/u.test(out) ? out : null;
}

/** The name-shaped spans in a string, in order, each `{text, index}`. */
export function nameSpans(s) {
  const out = [];
  for (const m of String(s).matchAll(NAME_ALL)) {
    if (phraseWord(m[0].split(/\s+/)[0])) continue;
    const t = cut(m[0]);
    if (t) out.push({ text: t, index: m.index });
  }
  return out;
}

/** Is the whole string (trimmed, a trailing comma or full stop aside) exactly one name-shaped span? */
export function isName(s) {
  const t = String(s).trim().replace(/[,;]+$/, "").trim();
  if (!t) return false;
  return NAME_WHOLE.test(t) && cut(t) === t;
}

/** The leading name-shaped span of a string, or null. */
export function leadingName(s) {
  const t = String(s).trim();
  const m = NAME_AT.exec(t);
  return m && !phraseWord(m[0].split(/\s+/)[0]) ? cut(m[0]) : null;
}

/* ---- contact points (R4): found so they can be LEFT UNREAD, never kept ---- */
export const EMAIL = /\b[A-Za-z0-9][A-Za-z0-9._%+-]*@(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,}\b/g;
export const PHONE = /(?:\(\d{3}\)\s?|\b\d{3}[-.\s])?\b\d{3}[-.]\d{4}\b(?:\s*(?:x|ext\.?)\s*\d{1,6})?/gi;
const EXTENSION = /\b(?:x|ext\.?)\s*\d{3,6}\b/gi;
/* A street address: a number, capitalised words, and a street word, with an optional unit. */
export const STREET = /\b\d{1,6}\s+(?:[NSEW]\.?\s+)?(?:[A-Z0-9][\w'.-]*\s+){0,4}(?:Street|St|Avenue|Ave|Boulevard|Blvd|Road|Rd|Way|Drive|Dr|Lane|Ln|Court|Ct|Place|Pl|Plaza|Parkway|Pkwy|Square|Sq|Terrace|Highway|Hwy)\b\.?(?:,?\s*(?:Suite|Ste\.?|Floor|Fl\.?|Room|Rm\.?|Unit|#)\s*[\w-]+)?/g;

/** A line with every contact point removed: `text` with the line's words closed up, `parts` the runs
 *  of text between the removed points (a removed point is a boundary no name runs across), and how many
 *  were removed. */
export function withoutContacts(line) {
  let n = 0;
  const MARK = "\u0000";
  const cut = (re) => (s) => s.replace(re, () => { n++; return MARK; });
  const marked = [cut(EMAIL), cut(STREET), cut(PHONE), cut(EXTENSION)].reduce((s, f) => f(s), String(line));
  const tidy = (s) => s.replace(/\s+/g, " ").replace(/\s+([,;:])/g, "$1").replace(/^[\s,;:|-]+|[\s,;|-]+$/g, "").trim();
  return { text: tidy(marked.split(MARK).join(" ")), parts: marked.split(MARK).map(tidy).filter(Boolean), removed: n };
}

/* ---- the view's staff titles ---- */

/** The staff-title recognisers of the view, each bounded by non-letters and global. */
export function titlePatterns(ctx) {
  return vocabPatterns(ctx, "staff_titles", IN_PROSE, "g");
}

/** Every staff-title span in a string, merged in reading order, overlaps dropped (the earlier, then the
 *  longer, kept), each `{text, index}`. */
export function titleSpans(patterns, s) {
  const hits = [];
  for (const re of patterns) {
    re.lastIndex = 0;
    for (const m of String(s).matchAll(re)) if (m[0].trim()) hits.push({ text: m[0], index: m.index });
  }
  hits.sort((a, b) => a.index - b.index || b.text.length - a.text.length);
  const out = [];
  let end = -1;
  for (const h of hits) { if (h.index < end) continue; out.push(h); end = h.index + h.text.length; }
  return out;
}

/** A string with the given spans removed, collapsed. */
export function removeSpans(s, spans) {
  let out = "", at = 0;
  for (const h of spans) { out += s.slice(at, h.index) + " "; at = h.index + h.text.length; }
  return (out + s.slice(at)).replace(/\s+/g, " ").trim();
}

/* ---- the view's roster words ---- */

/** The self-naming recognisers of the view (`roster_words`), bounded and case as the profile wrote, each
 *  with the kind of document it names: `roster`, `chart`, or both when the entry names no kind. */
export function rosterWordPatterns(ctx) {
  const out = [];
  for (const e of vocabulary(ctx, "roster_words")) {
    const re = vocabRegex(e.pattern, IN_PROSE);
    if (!re) continue;
    const kinds = e.kind === "roster" || e.kind === "chart" ? [e.kind] : ["roster", "chart"];
    out.push({ re, kinds });
  }
  return out;
}

/* A self-naming line is a TITLE, not a mention: short. Eight words is longer than every measured
   self-naming line ("CITYCOUNCIL COMMITTEE MEMBER ROSTER AND ASSIGNED STAFF" is seven when one line) and
   shorter than the sentence that mentions a roster in prose. */
export const TITLE_WORDS = 8;

/** The non-empty lines of a text, each `{text, offset}` (offset of its first character in the text). */
export function linesOf(text) {
  const raw = String(text || "");
  const out = [];
  let at = 0;
  for (const part of raw.split("\n")) {
    const t = part.replace(/\r$/, "");
    const lead = t.length - t.trimStart().length;
    if (t.trim()) out.push({ text: t.trim().replace(/\s+/g, " "), offset: at + lead });
    at += part.length + 1;
  }
  return out;
}

/** The lines that name the document as a roster or chart: short lines a `roster_words` pattern matches. */
export function selfNamingLines(lines, patterns) {
  const out = [];
  if (!patterns.length) return out;
  for (const x of lines) {
    if (words(x.text).length > TITLE_WORDS) continue;
    const kinds = new Set();
    for (const p of patterns) { p.re.lastIndex = 0; if (p.re.test(x.text)) for (const k of p.kinds) kinds.add(k); }
    if (kinds.size) out.push({ ...x, kinds: [...kinds] });
  }
  return out;
}

/** What a document's self-naming lines name it: `{as, only_other}` for the kind asked. `as` holds the
 *  lines that name it this kind; `only_other` is true when it names itself, and only as the other kind. */
export function namedAs(selfLines, kind) {
  const as = selfLines.filter((x) => x.kinds.includes(kind));
  return { as, only_other: selfLines.length > 0 && !as.length };
}

/* ---- dates: a document's own stated date, and the dated-rows rule ---- */

const MONTH = "(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|June?|July?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)";
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
/* A date in the forms a schedule prints (staff_directory's own test, applied here: a month named with a
   day, or a three-part numeric date). */
export const DATE_IN_ROWS = new RegExp(`\\b${MONTH}\\.?\\s+\\d{1,2}\\b|\\b\\d{1,2}\\/\\d{1,2}\\/\\d{2,4}\\b`, "gi");
const FULL_DATE = new RegExp(`\\b(${MONTH})\\.?\\s+(\\d{1,2}),?\\s+(\\d{4})\\b|\\b(\\d{1,2})[/.-](\\d{1,2})[/.-](\\d{2,4})\\b|\\b(${MONTH})\\.?,?\\s+(\\d{4})\\b`, "i");

/** How many dates the document's rows carry (over flattened text, as staff_directory counts them). */
export function datesIn(text) {
  return (flatten(text).match(DATE_IN_ROWS) || []).length;
}

const pad = (n) => String(n).padStart(2, "0");
/** The first date one of these lines states, as `{text, date, precision, offset}` (`date` is `YYYY-MM-DD`
 *  or, for a month and a year alone, `YYYY-MM`), or null. A two-digit year is not expanded: it is read as
 *  stated and given no `date`. */
export function statedDate(lines) {
  for (const x of lines) {
    const m = FULL_DATE.exec(x.text);
    if (!m) continue;
    const text = m[0];
    const offset = x.offset + m.index;
    if (m[1]) {
      const mo = MONTHS.indexOf(m[1].slice(0, 3).toLowerCase()) + 1;
      return { text, date: `${m[3]}-${pad(mo)}-${pad(m[2])}`, precision: "day", offset };
    }
    if (m[4]) {
      const y = m[6].length === 4 ? m[6] : null;
      return { text, date: y ? `${y}-${pad(m[4])}-${pad(m[5])}` : null, precision: y ? "day" : null, offset,
               ...(y ? {} : { why: "the line states a two-digit year, which is not expanded" }) };
    }
    const mo = MONTHS.indexOf(m[7].slice(0, 3).toLowerCase()) + 1;
    return { text, date: `${m[8]}-${pad(mo)}`, precision: "month", offset };
  }
  return null;
}

/** Is a short line a unit's label: its last word, or its first before "of", a kind of unit? */
export function isUnitLine(s) {
  const w = words(s).map((x) => x.replace(/[^\p{L}]/gu, "").toLowerCase()).filter(Boolean);
  if (!w.length || w.length > TITLE_WORDS) return false;
  if (UNIT_WORDS.has(w[w.length - 1])) return true;
  return w.length >= 3 && UNIT_WORDS.has(w[0]) && w[1] === "of";
}

export const wordCount = (s) => words(s).length;
