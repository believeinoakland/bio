/* The header block of a policy (R26): what the document claims about itself — its series and
 * number, title, effective date, what it supersedes, its references, its coordinator, when its
 * review is due and its revision cycle — each read by the labels the active profiles give for
 * it (`vocabulary.policy_headers`, jurisdictions R69), never by labels held here, and its series
 * by the view's `standard_sources` entries with `series` (jurisdictions R63).
 *
 * MEASURED FIRST (R35) on 50 captured policies of one city and its police department
 * (`test/fixtures/policies.json`), against a member's reading of each header written before this
 * reader existed (`test/fixtures/policies-answers.json`). What is place-free and stays here: the
 * outline numbering (I., A., 1.), page furniture ("Page 1 of 28", a bare page number, a table of
 * contents), calendar date shapes, and that a label is followed by its value.
 *
 * HOW A HEADER IS FOUND. The header is anchored where a line opens with a series' label and the
 * series' number follows it (a series whose number is printed under its own label, as an
 * administrative instruction prints "NUMBER 71", is anchored by its label alone). A label a
 * printed layout scatters across lines ("DEPARTMENTAL / GENERAL / ORDER") is matched word by word
 * at the opening of successive lines. The block runs from the start of the anchor's page (a
 * boxed layout prints some labels above the series name) to the first line of page furniture,
 * outline heading or body text after the anchor; a revision memorandum in front of an order is
 * on an earlier page, so its own TO/DATE/SUBJECT are never the order's.
 *
 * WHAT IS NEVER DONE (R26). A date that is not a whole calendar date (a placeholder such as
 * "XX XX 21") is kept as written with `date: null` and why, never completed. A field not read is
 * absent and named in `missing`. Whether this copy is in force is not this reader's question. */
import { readerView, vocabulary, vocabRegex } from "../docprofile/doctypes/index.mjs";

export const HEADER_FIELDS = Object.freeze(["type", "number", "title", "effective", "supersedes", "reference",
                                            "coordinator", "review_due", "revision_cycle"]);
const DATE_FIELDS = new Set(["effective", "review_due"]);
const ONE_LINE = new Set(["number", "revision_cycle"]);

/* ------------------------------------------------------------------ the view's series */

/** The source of a regular expression's named group `number`, so the number can be found
 *  after the series' label as well as inside a citation. */
function groupSource(src, name) {
  const at = src.indexOf(`(?<${name}>`);
  if (at < 0) return null;
  let depth = 0;
  for (let i = at; i < src.length; i++) {
    const c = src[i];
    if (c === "\\") { i++; continue; }
    if (c === "[") { const j = src.indexOf("]", i + 1); if (j < 0) return null; i = j; continue; }
    if (c === "(") depth++;
    else if (c === ")" && --depth === 0) return src.slice(at + name.length + 4, i);
  }
  return null;
}
const escapeRe = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const compile = (src, flags) => { try { return new RegExp(src, flags); } catch { return null; } };

/** The policy series the view names (jurisdictions R63): each with its label as printed at the
 *  head of a document (words at the opening of one line or of successive lines), its number's
 *  form, and its citation pattern. */
export function policySeries(ctx) {
  const out = [];
  const sources = readerView(ctx).standard_sources;
  for (const s of Array.isArray(sources) ? sources : []) {
    if (!s || !s.series || typeof s.series !== "object" || typeof s.series.label !== "string" || !s.series.label.trim()) continue;
    if (typeof s.key !== "string" || typeof s.series.key !== "string") continue;
    const cite = s.cite && typeof s.cite.re === "string" ? s.cite : null;
    const flags = String((cite && cite.flags) || "").replace(/[^iu]/g, "");
    const numSrc = cite ? groupSource(cite.re, "number") : null;
    const words = s.series.label.trim().split(/\s+/).map(escapeRe);
    /* One line, or the label's words each opening a line, with what a column layout prints
       beside them on the same line in between. */
    const label = compile(`^[ \\t]*(?:${words.join("[ \\t]+")}|${words.join("(?:[ \\t]+[^\\n]*)?\\n[ \\t]*")})(?![A-Za-z])`, "gim");
    const number = numSrc ? compile(`^[ \\t:.,#–—-]*(?:No\\.?|Number)?[ \\t:#]*\\n?[ \\t]*(${numSrc})(?![A-Za-z0-9])`, "i" + flags.replace("i", "")) : null;
    if (!label) continue;
    out.push({ key: `${s.key}.${s.series.key}`, series: s.series.key, issuer: s.key, label, labelText: s.series.label,
               number, cite: cite ? compile(cite.re, flags + "g") : null, normal: Array.isArray(s.normal) ? s.normal : null });
  }
  return out;
}

/** The header labels the view gives, by field (jurisdictions R69). */
export function headerLabels(ctx) {
  const out = [];
  for (const e of vocabulary(ctx, "policy_headers")) {
    if (!HEADER_FIELDS.includes(e.field)) continue;
    const re = vocabRegex(e.pattern, (src) => `(?<![A-Za-z0-9(])(?:${src})(?![A-Za-z0-9])[ \\t]*:?`, "g");
    if (re) out.push({ field: e.field, re });
  }
  return out;
}

/* ------------------------------------------------------------------------ the lines */

function linesOf(raw) {
  const out = [];
  let at = 0;
  for (const text of raw.split("\n")) { out.push({ start: at, end: at + text.length, text }); at += text.length + 1; }
  return out;
}
/* Page furniture, the same in any document: a page counter, a bare page number or roman
   numeral, a table of contents' marker. */
const FURNITURE = /^\s*(?:Page\s+\d+\s+of\s+\d+|\d{1,3}|[ivxlc]{1,6}|.*\bTOC\b.*|TABLE OF CONTENTS|Table of Contents)\s*$/i;
/* An outline heading opening a line: I., IV., A., 1., a., 1) — place-free. */
const OUTLINE = /^\s*(?:[IVXL]{1,6}|[A-Z]|\d{1,2}|[a-z])[.)][ \t]+\S/;
/* Body text: a line of prose, eight words or more and mostly lower case, as no header value is
   printed (a header prints labels, names, numbers and dates). */
const isBody = (t) => {
  const words = t.trim().split(/\s+/);
  const letters = t.replace(/[^A-Za-z]/g, "");
  return words.length >= 8 && letters.length >= 30 && t.replace(/[^a-z]/g, "").length / letters.length >= 0.7;
};

/* A line set in capitals, as a title is. */
const caps = (t) => { const letters = t.replace(/[^A-Za-z]/g, ""); return letters.length >= 4 && t.replace(/[^A-Z]/g, "").length / letters.length >= 0.85; };

/* ------------------------------------------------------------------------- the dates */

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const MON = "(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|June?|July?|Aug(?:ust)?|Sept?(?:ember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)";
const DATE = new RegExp(`(?<![A-Za-z0-9])(?:(?<d1>\\d{1,2})[ \\t]+(?<m1>${MON})\\.?[ \\t]+(?<y1>\\d{4}|\\d{2})|(?<m2>${MON})\\.?[ \\t]+(?<d2>\\d{1,2}),?[ \\t]+(?<y2>\\d{4})|(?<m3>\\d{1,2})/(?<d3>\\d{1,2})/(?<y3>\\d{4}|\\d{2}))(?![A-Za-z0-9])`, "gi");
const PLACEHOLDER = /(?<![A-Za-z0-9])(?:XX|\d{1,2})[ \t]+(?:XX|MMM|[A-Z]{3})[ \t]+\d{2,4}(?![A-Za-z0-9])/;

/** A whole calendar date read off `text`, or null. A two-digit year is read 00–49 as the
 *  2000s and 50–99 as the 1900s, which the 50 measured headers bear out (1981 to 2024). */
export function readDate(text) {
  DATE.lastIndex = 0;
  const m = DATE.exec(String(text || ""));
  if (!m) return null;
  const g = m.groups;
  const y = g.y1 || g.y2 || g.y3;
  const month = g.m1 || g.m2 ? MONTHS.indexOf((g.m1 || g.m2).slice(0, 3).toLowerCase()) + 1 : Number(g.m3);
  const day = Number(g.d1 || g.d2 || g.d3);
  const year = y.length === 4 ? Number(y) : Number(y) + (Number(y) < 50 ? 2000 : 1900);
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (!(month >= 1 && month <= 12) || probe.getUTCDate() !== day || probe.getUTCMonth() !== month - 1) return null;
  return { date: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`, index: m.index, text: m[0] };
}

/* ------------------------------------------------------------------------ the header */

const tidy = (s) => String(s || "").replace(/[ \t]*\n[ \t]*/g, " ").replace(/\s+/g, " ").replace(/^[\s:–—-]+|[\s:;,]+$/g, "");

/** A span of the raw text as a field: `{text, start, end, source}`, the text as written
 *  (lines joined by a space), its extent trimmed of space and the label's colon. */
function field(raw, start, end, locate) {
  while (start < end && /[\s:]/.test(raw[start])) start++;
  while (end > start && /[\s:;,]/.test(raw[end - 1])) end--;
  if (end <= start) return null;
  return { text: tidy(raw.slice(start, end)), start, end, source: locate(start) || null };
}

/** Where the header is anchored: the first line opening with a series' label, with its number
 *  where the series prints it beside the label. */
function anchor(raw, series, labels) {
  let best = null;
  for (const s of series) {
    s.label.lastIndex = 0;
    for (const m of raw.matchAll(s.label)) {
      /* A label opening a line of prose ("Administrative Instruction is to provide …") is the
         body naming its own kind, not the header. */
      const lineEnd = raw.indexOf("\n", m.index + m[0].length);
      if (isBody(raw.slice(m.index, lineEnd < 0 ? raw.length : lineEnd))) continue;
      const after = raw.slice(m.index + m[0].length, m.index + m[0].length + 80);
      const n = s.number ? s.number.exec(after) : null;
      const hit = { series: s, start: m.index + (m[0].length - m[0].trimStart().length), end: m.index + m[0].length,
                    number: n ? { start: m.index + m[0].length + n.index + n[0].indexOf(n[1]), text: n[1] } : null };
      if (hit.number) hit.number.end = hit.number.start + hit.number.text.length;
      /* A header prints its labels around its series' name: one within the next few lines,
         else this is a citation set on a line of its own. */
      const from = hit.number ? hit.number.end : hit.end;
      let stop = from;
      for (let k = 0; k < 6 && stop >= 0; k++) stop = raw.indexOf("\n", stop + 1);
      const near = raw.slice(m.index, stop < 0 ? raw.length : stop);
      if (!labels.some((l) => { l.re.lastIndex = 0; return l.re.test(near); })) continue;
      if (!best || hit.start < best.start || (hit.start === best.start && hit.number && !best.number)) best = hit;
      break;
    }
  }
  return best;
}

/** The page holding `offset`: where it starts, from the reading's pages (I2), else 0. */
function pageStart(pages, raw, offset) {
  if (!Array.isArray(pages) || !pages.length) return 0;
  let at = 0, start = 0;
  for (const p of pages) {
    const t = String((p && p.text) || "");
    if (!t.length) continue;
    const i = raw.indexOf(t.slice(0, Math.min(40, t.length)), at);
    if (i < 0) break;
    if (i > offset) break;
    start = i; at = i + 1;
  }
  return start;
}

/** The header block of a policy (R26), or `{header: null, why}`. */
export function readHeader(ctx, raw, locate = () => null) {
  raw = String(raw || "");
  const series = policySeries(ctx);
  const labels = headerLabels(ctx);
  if (!series.length && !labels.length)
    return { header: null, why: "the active jurisdiction profiles give no policy series and no policy header labels, so no header is read" };
  const a = anchor(raw, series, labels);
  const lines = linesOf(raw);
  const from = a ? pageStart(ctx.pages, raw, a.start) : 0;
  /* The block's end: the first line after the anchor (or, with none, after the first label)
     that is page furniture, an outline heading or body text. */
  const firstLabel = (() => {
    let best = null;
    for (const l of labels) { l.re.lastIndex = from; const m = l.re.exec(raw); if (m && (!best || m.index < best)) best = m.index; }
    return best;
  })();
  const after = a ? (a.number ? a.number.end : a.end) : firstLabel;
  if (after === null || after === undefined)
    return { header: null, why: "no line of this text opens with a policy series the active profiles name, and no header label they give is printed in it" };
  let end = raw.length, endLine = lines.length;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (l.start <= after) continue;
    if (FURNITURE.test(l.text) || OUTLINE.test(l.text) || (isBody(l.text) && !labels.some((x) => { x.re.lastIndex = 0; const m = x.re.exec(l.text); return m && m.index <= l.text.length - l.text.trimStart().length; }))) {
      end = l.start; endLine = i; break;
    }
  }

  /* Every label printed in the block, longest first where two begin together, never two
     overlapping; the anchor and its number are boundaries too. */
  const hits = [];
  for (const l of labels) {
    l.re.lastIndex = 0;
    for (const m of raw.slice(from, end).matchAll(l.re)) hits.push({ field: l.field, start: from + m.index, end: from + m.index + m[0].length });
  }
  hits.sort((x, y) => x.start - y.start || (y.end - y.start) - (x.end - x.start));
  const taken = [];
  for (const h of hits) if (!taken.some((t) => h.start < t.end && t.start < h.end)) taken.push(h);
  const bounds = [...taken.map((t) => t.start)];
  if (a) { bounds.push(a.start); if (a.number) bounds.push(a.number.start); }
  bounds.sort((x, y) => x - y);
  const nextBound = (at) => { for (const b of bounds) if (b >= at) return b; return end; };

  const header = {};
  const why = {};
  const usedDates = new Set();
  /* The raw extent of each label's value: from the label to the next label or boundary. */
  const spans = taken.map((t) => ({ ...t, vEnd: Math.min(nextBound(t.end), end) }));
  for (const s of spans) {
    if (header[s.field]) continue;
    let vEnd = s.vEnd;
    if (ONE_LINE.has(s.field)) { const nl = raw.indexOf("\n", raw.slice(s.end, vEnd).trim() ? s.end + (raw.slice(s.end).length - raw.slice(s.end).trimStart().length) : s.end); if (nl >= 0 && nl < vEnd) vEnd = nl; }
    if (DATE_FIELDS.has(s.field)) {
      const value = raw.slice(s.end, vEnd);
      let d = readDate(value), base = s.end;
      /* A boxed layout prints a date label's value below other labels: the first date of the
         block after the label that no other date label holds. */
      if (!d && !value.trim().replace(/[:\s]/g, "")) {
        /* nothing beside the label: look on, past labels that are not dates */
      }
      if (!d) {
        for (const o of spans) {
          if (o.start < s.end || DATE_FIELDS.has(o.field) && o !== s) { if (o.start >= s.end && DATE_FIELDS.has(o.field)) break; continue; }
          const dd = readDate(raw.slice(o.end, o.vEnd));
          if (dd) { d = dd; base = o.end; break; }
        }
        if (!d && a) { const dd = readDate(raw.slice(s.end, end)); if (dd && !spans.some((o) => o !== s && DATE_FIELDS.has(o.field) && o.start > s.end && o.start < s.end + dd.index)) { d = dd; base = s.end; } }
      }
      if (d) {
        const start = base + d.index;
        if (usedDates.has(start)) continue;
        usedDates.add(start);
        header[s.field] = { text: d.text, date: d.date, start, end: start + d.text.length, source: locate(start) || null };
        continue;
      }
      const f = field(raw, s.end, vEnd, locate);
      if (f && PLACEHOLDER.test(f.text)) { header[s.field] = { ...f, date: null, why: "this date is not a whole calendar date as printed (a placeholder), so it is kept as written and not completed" }; continue; }
      why[s.field] = f ? "its label is printed with no calendar date beside it" : "its label is printed with nothing beside it";
      continue;
    }
    const f = field(raw, s.end, vEnd, locate);
    if (f) header[s.field] = f; else why[s.field] = "its label is printed with nothing beside it";
  }

  /* The series and number: the anchor's, or a number label's value in the series' form. */
  if (a) {
    header.type = { text: tidy(raw.slice(a.start, a.end)), key: a.series.key, series: a.series.series, start: a.start, end: a.end,
                    source: locate(a.start) || null };
    if (a.number) header.number = { text: a.number.text, start: a.number.start, end: a.number.end, source: locate(a.number.start) || null };
  }
  if (header.number && a) {
    const n = a.series.number;
    if (!header.number.normal && n) header.number.normal = header.number.text.replace(/\s+/g, "");
  }

  /* The title: printed beside the number ("K-03: USE OF FORCE"), else the order's own name
     printed in capitals under the block, else the title label's value. */
  if (a && a.number) {
    const lineEnd = raw.indexOf("\n", a.number.end);
    const rest = raw.slice(a.number.end, lineEnd < 0 ? raw.length : lineEnd);
    const m = /^[ \t]*:[ \t]*(\S.*)$/.exec(rest);
    if (m) {
      let start = a.number.end + rest.indexOf(m[1]), stop = lineEnd < 0 ? raw.length : lineEnd;
      /* Its continuation lines, up to the first label. */
      for (const l of lines) {
        if (l.start <= stop) continue;
        if (l.start >= end || taken.some((t) => t.start >= l.start && t.start <= l.start + (l.text.length - l.text.trimStart().length))) break;
        stop = l.end;
      }
      const f = field(raw, start, stop, locate);
      if (f) header.title = { ...f, inline: true };
    }
  }
  if (!(a && a.number && header.title && header.title.inline)) {
    let i = endLine;
    while (i < lines.length && (FURNITURE.test(lines[i].text) || !lines[i].text.trim())) i++;
    if (i < lines.length && !OUTLINE.test(lines[i].text) && caps(lines[i].text)) {
      let j = i;
      while (j + 1 < lines.length && caps(lines[j + 1].text) && !OUTLINE.test(lines[j + 1].text) && !FURNITURE.test(lines[j + 1].text)) j++;
      const f = field(raw, lines[i].start, lines[j].end, locate);
      if (f) header.title = f;
    }
  }
  /* A title label's value ending in the order's own name in capitals (an old layout prints its
     index terms under the label, then the title): the title is that name. */
  if (header.title && !header.title.inline) {
    const inTitle = lines.filter((l) => l.start >= header.title.start && l.end <= header.title.end && l.text.trim());
    let k = inTitle.length;
    while (k > 0 && caps(inTitle[k - 1].text)) k--;
    if (k > 0 && k < inTitle.length) {
      const f = field(raw, inTitle[k].start, inTitle[inTitle.length - 1].end, locate);
      if (f) header.title = f;
    }
  }
  /* A footnote's mark printed against a title's last word ("the Use of Force1"). */
  if (header.title && /[a-z]\d{1,2}$/.test(header.title.text)) {
    const cut = header.title.text.match(/\d{1,2}$/)[0].length;
    header.title = { ...header.title, text: header.title.text.slice(0, -cut), end: header.title.end - cut };
  }
  /* A title label's value with the dates a boxed layout prints beside it taken out. */
  if (header.title && header.title.text) {
    const d = readDate(header.title.text);
    if (d && d.index > 0 && d.index + d.text.length >= header.title.text.length - 1) header.title.text = tidy(header.title.text.slice(0, d.index));
  }

  const missing = HEADER_FIELDS.filter((f) => !header[f]);
  for (const f of missing) if (!why[f]) why[f] = f === "type"
    ? "no line of this text opens with a policy series the active jurisdiction profiles name"
    : "no label the active jurisdiction profiles give for this field is printed in the header block";
  return { header: { ...header, missing, missing_why: why, start: from, end }, why: null };
}
