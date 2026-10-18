/* A policy: one item of a numbered series a body or organisation issues (an administrative instruction, a general or
 * special order, a training bulletin, a board policy, a company's policy) (R25–R34; T35-12; POLICIES L2, PO13).
 *
 * MEASURED FIRST (R35). The reader was built only after its header reading was measured on 50 captured policies of
 * one city and its police department (`test/fixtures/policies.json`, read as the plane reads them) against a member's
 * reading of each header written before any reader existed: 46 of 50 headers read wholly right (92%; the record of
 * the measurement is the job record `build/jobs/T35/doctypes.md`). The four it misses are layouts no label reading
 * reaches without guessing: a series name misspelt in the document itself, a date printed with no label, a header
 * whose text layer lost a word of the series name, and a scanned two-column header the OCR interleaves.
 *
 * WHAT IS LOCAL AND WHAT IS NOT (R3, R20). Which series exist, how each is labelled and numbered, and the labels a
 * header prints are the active profiles' (`standard_sources` with `series`, jurisdictions R63; `policy_headers`,
 * R69). The outline numbering (I., A., 1., a., 1)), page furniture, calendar date shapes and the English words
 * that state applicability, a table of responsible parties and a period of time are place-free and stay here.
 *
 * READINGS, NEVER FORCE (R32). Nothing here says whether a provision is required, recommended, allowed or
 * discretionary, or who holds a discretion: a member confirms a force in `standards`, on the document's own words.
 * Nothing is recorded as a standard, a duty or a law relation (R15). A timeframe is a reading, never a deadline. */
import { CONFIDENCE, CONTRACT, alsoSatisfies } from "../docprofile/doctypes/index.mjs";
import { event, worstSignificance, isMeaningful, bySeverity } from "../site-profiles/index.mjs";
import { readDefinitions, sha256Hex } from "./sections.mjs";
import { readHeader, policySeries, headerLabels, HEADER_FIELDS } from "./policy-header.mjs";

/* ------------------------------------------------------------------------ lines */

function linesOf(raw) {
  const out = [];
  let at = 0;
  for (const text of raw.split("\n")) { out.push({ start: at, end: at + text.length, text }); at += text.length + 1; }
  return out;
}
const indentOf = (l) => l.text.length - l.text.trimStart().length;
/* Page furniture, which no section is: a page counter, a bare page number. */
const FURNITURE = /^\s*(?:Page\s+\d+\s+of\s+\d+|\d{1,3})\s*$/i;
/* A line set in capitals. */
const caps = (t) => { const letters = t.replace(/[^A-Za-z]/g, ""); return letters.length >= 4 && t.replace(/[^A-Z]/g, "").length / letters.length >= 0.85; };
/* A line opening with an outline marker. */
const OUTLINE_LINE = /^\s*(?:[IVX]{1,5}|[A-Z]|\d{1,2}|[a-z])[.)]\s+\S/;
/* A table of contents' line: dot leaders, or a heading ending in its page number. */
const TOC_LINE = /\.{4,}|^[^a-z]*[A-Z][^a-z]*\s\d{1,3}\s*$/;

/* ------------------------------------------------------------- the outline sections */

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI",
               "XVII", "XVIII", "XIX", "XX"];
const nextLetter = (v) => (/^[A-Ya-y]$/.test(v) ? String.fromCharCode(v.charCodeAt(0) + 1) : null);
/** The outline marker kinds, in the order an outline nests them (I., A., 1., a., 1)), each with how a line opens
 *  with it, its first value and the value after a given one. */
const KINDS = [
  { kind: "roman", re: /^([IVX]{1,5})\.[ \t]+(\S.*)?$/, first: "I", next: (v) => { const i = ROMAN.indexOf(v); return i >= 0 && i + 1 < ROMAN.length ? ROMAN[i + 1] : null; } },
  { kind: "upper", re: /^([A-Z])\.[ \t]+(\S.*)?$/, first: "A", next: nextLetter },
  /* "A - 1." numbers an item under its lettered part (a newer layout of the same outline). */
  { kind: "dashed", re: /^([A-Z])[ \t]*[-–][ \t]*(\d{1,2})\.[ \t]+(\S.*)?$/, first: null, next: null },
  { kind: "numeral", re: /^(\d{1,2})\.[ \t]+(\S.*)?$/, first: "1", next: (v) => String(Number(v) + 1) },
  { kind: "lower", re: /^([a-z])\.[ \t]+(\S.*)?$/, first: "a", next: nextLetter },
  { kind: "paren", re: /^\(?(\d{1,2})\)[ \t]+(\S.*)?$/, first: "1", next: (v) => String(Number(v) + 1) },
];

/** Whether `b` comes after `a` in a kind's sequence. */
function order(k, a, b) {
  for (let v = k.next(a), i = 0; v !== null && i < 40; v = k.next(v), i++) if (v === b) return true;
  return false;
}

/** The sections of a policy's text after its header (R27): outline headings in document order, each `{path, number,
 *  heading, start, end, source}`; a marker is read only where it continues its level's sequence (B after A) or opens
 *  a new level at its first value, so a line of prose that happens to open with "3." is not a section. */
export function readOutline(raw, from, skip, locate) {
  const lines = linesOf(raw);
  const out = [];
  const open = [];            // [{kind, value, entry}]
  const close = (depth, at) => { while (open.length > depth) open.pop().entry.end = at; };
  for (const [li, l] of lines.entries()) {
    if (l.start < from || FURNITURE.test(l.text) || skip.some((s) => l.start >= s.start && l.start < s.end)) continue;
    const t = l.text.trim();
    if (TOC_LINE.test(t)) continue;
    /* A contents entry wrapped onto a second line, which carries its page number. */
    const nextLine = lines[li + 1];
    if (nextLine && TOC_LINE.test(nextLine.text.trim()) && caps(t)) continue;
    const hits = [];
    for (const [rank, k] of KINDS.entries()) { const m = k.re.exec(t); if (m) hits.push({ rank, k, m }); }
    let placed = null;
    /* "A - 1." under the open lettered part it names. */
    for (const { rank, k, m } of hits) {
      if (k.kind !== "dashed") continue;
      const d = open.findIndex((o) => o.kind === "upper" && o.value === m[1]);
      if (d >= 0) placed = { depth: d + 1, kind: k.kind, rank, value: m[2], rest: m[3] };
    }
    /* A sibling continuing an open level's sequence, deepest first, of any kind the line could be ("I." after "H."
       is a letter). */
    for (let d = open.length - 1; d >= 0 && !placed; d--)
      for (const { rank, k, m } of hits)
        if (!placed && k.kind !== "dashed" && open[d].kind === k.kind && k.next(open[d].value) === m[1])
          placed = { depth: d, kind: k.kind, rank, value: m[1], rest: m[2] };
    /* Else a new level at its first value, nested under the open levels an outline ranks above it (a numbered list
       before "I." does not hold "I."). A heading set in capitals may open a level, or follow its open sibling, at
       another value: a part printed alone ("III. PERFORMANCE REVIEW" in an order that replaces only Part III). */
    for (const { rank, k, m } of hits) {
      if (placed || k.kind === "dashed") break;
      let d = open.findIndex((o) => o.rank >= rank);
      if (d < 0) d = open.length;
      const heading = m[2] ? m[2].trim() : "";
      const capsHeading = heading.length >= 4 && heading.replace(/[^A-Z]/g, "").length / Math.max(1, heading.replace(/[^A-Za-z]/g, "").length) >= 0.85;
      const sameOpen = open[d] && open[d].kind === k.kind ? open[d] : null;
      if (m[1] === k.first && (!sameOpen || capsHeading)) placed = { depth: d, kind: k.kind, rank, value: m[1], rest: m[2] };
      else if (capsHeading && (!sameOpen || order(k, sameOpen.value, m[1]))) placed = { depth: d, kind: k.kind, rank, value: m[1], rest: m[2] };
    }
    if (!placed) continue;
    const at = l.start + indentOf(l);
    close(placed.depth, at);
    const parent = placed.depth ? open[placed.depth - 1].entry : null;
    const path = parent ? [...parent.path, placed.value] : [placed.value];
    const entry = { path, number: path.join("."), heading: placed.rest ? placed.rest.trim().slice(0, 300) : null,
                    start: at, end: raw.length, source: locate(at) || null };
    out.push(entry);
    open.push({ kind: placed.kind, rank: placed.rank, value: placed.value, entry });
  }
  close(0, raw.length);
  return out;
}

/** The deepest section holding `offset`, or null. */
function holder(sections, offset) {
  let best = null;
  for (const s of sections) if (offset >= s.start && offset < s.end && (!best || s.path.length > best.path.length)) best = s;
  return best;
}
const UNPLACED = (sections) => (sections.length
  ? "no section read from this policy holds this passage (it stands before the first outline heading)"
  : "this policy's text was not divided into sections, so no section can be named for this passage");
function placed(sections, item) {
  const s = holder(sections, item.start);
  return s ? { ...item, section: s.path } : { ...item, section: null, why: UNPLACED(sections) };
}

/* --------------------------------------------------------- definitions (R28) */

const DEFINITIONS_HEADING = /^definitions?\b/i;
/** The definitions of a policy: the definitional voice (R13's), and each entry of a section headed as definitions,
 *  its term the entry's heading up to the dash or colon that opens its meaning. A term given twice gives two. */
export function readPolicyDefinitions(raw, sections, locate) {
  const out = readDefinitions(raw, sections, locate).map((d) => ({ term: d.term, start: d.start, end: d.end, source: d.source,
                                                                   section: d.section, ...(d.why ? { why: d.why } : {}) }));
  for (const s of sections) {
    if (!s.heading || !DEFINITIONS_HEADING.test(s.heading)) continue;
    for (const c of sections) {
      if (c.path.length !== s.path.length + 1 || c.path.slice(0, -1).join("/") !== s.path.join("/") || !c.heading) continue;
      const term = c.heading.split(/\s+[-–—]\s+|:\s|\s*[-–—]\s*(?=[A-Z])/)[0].replace(/[.:]+$/, "").trim();
      if (!term || term.length > 100) continue;
      if (out.some((d) => d.start >= c.start && d.start < c.end && d.term.toLowerCase() === term.toLowerCase())) continue;
      out.push({ term, start: c.start, end: c.end, source: c.source, section: c.path });
    }
  }
  return out.sort((a, b) => a.start - b.start);
}

/* --------------------------------------------------------- applicability (R29) */

const APPLIES_HEADING = /^(?:applicability|scope|eligibility)\b/i;
const APPLIES = /\b(?:this\s+(?:order|policy|instruction|directive|special\s+order|general\s+order|procedure|bulletin|regulation|administrative\s+instruction)\s+(?:shall\s+)?appl(?:y|ies)\s+to|appl(?:y|ies)\s+to\s+all|(?:is|are)\s+applicable\s+to|shall\s+apply\s+to)\b/gi;

function sentenceAround(raw, at, endAt) {
  let start = at;
  while (start > 0 && !/[.;:]\s/.test(raw.slice(start - 2, start)) && raw[start - 1] !== "\n" ) start--;
  /* Back over a line break inside a sentence: the previous line did not end it, and is not a heading. */
  const prevLine = (at) => raw.slice(raw.lastIndexOf("\n", at - 2) + 1, at - 1);
  while (start > 0 && raw[start - 1] === "\n" && !/[.;:]\s*$/.test(prevLine(start))
         && !OUTLINE_LINE.test(prevLine(start)) && !caps(prevLine(start))) {
    start = raw.lastIndexOf("\n", start - 2) + 1;
    const stop = raw.slice(start, at).search(/[.;:]\s(?=\S)/);
    if (stop >= 0) { start += stop + 2; break; }
  }
  while (start < at && /\s/.test(raw[start])) start++;
  const m = /[.;](?=\s|$)/.exec(raw.slice(endAt));
  const end = m ? endAt + m.index + 1 : raw.length;
  return { start, end };
}

/** Each passage stating to whom or what the policy applies (R29): a section headed so, and each sentence in the
 *  applying voice; an extent, never resolved to an office, unit or person. */
export function readApplicability(raw, sections, from, locate) {
  const out = [];
  for (const s of sections)
    if (s.heading && APPLIES_HEADING.test(s.heading)) out.push(placed(sections, { start: s.start, end: s.end, source: s.source }));
  APPLIES.lastIndex = 0;
  for (const m of raw.matchAll(APPLIES)) {
    if (m.index < from) continue;
    const { start, end } = sentenceAround(raw, m.index, m.index + m[0].length);
    if (out.some((x) => start >= x.start && start < x.end)) continue;
    out.push(placed(sections, { start, end, source: locate(start) || null }));
  }
  return out.sort((a, b) => a.start - b.start);
}

/* ---------------------------------------------------- responsibilities (R30) */

const TABLE_HEAD = /^\s*Responsible\s+Part(?:y|ies)\s*(?:\/|\s)\s*Actions?\s*$/i;
const STEP = /^(.*?)(?:^|\s)(\d{1,2})\.[ \t]+(\S.*)$/;

/** The rows of each two-column responsible-party and action table (R30), `{party, action, step, start, end, source,
 *  section}` in row order. A party is the text before its first numbered action, on that action's line or on the lines
 *  above it after the last action ended; where an action does not end before the next party's numbering starts again,
 *  the columns cannot be told apart and the table is listed unread, never split by guess. */
export function readResponsibilities(raw, sections, from, locate) {
  const lines = linesOf(raw);
  const rows = [], unread = [], extents = [];
  const recurs = new Map();
  for (const l of lines) { const t = l.text.trim(); if (t) recurs.set(t, (recurs.get(t) || 0) + 1); }
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].start < from || !TABLE_HEAD.test(lines[i].text)) continue;
    const head = lines[i];
    const sec = holder(sections, head.start);
    /* The table runs to the end of the section holding it, or to the next outline heading of a roman level. */
    let stop = sec ? sec.end : raw.length;
    for (let j = i + 1; j < lines.length; j++) if (/^\s*[IVX]{1,5}\.\s+\S/.test(lines[j].text) && lines[j].start < stop) { stop = lines[j].start; break; }
    /* A running header or footer (a line printed three times or more that ends no sentence) is page furniture,
       never a party. */
    const body = lines.filter((l) => l.start > head.start && l.start < stop && l.text.trim() && !FURNITURE.test(l.text)
                                     && !((recurs.get(l.text.trim()) || 0) >= 3 && !/[.;:]\s*$/.test(l.text)));
    const table = [];
    let party = null, pending = [], cur = null, ok = true, why = null, expect = 1;
    const finish = () => { if (cur) { cur.end = cur.lastEnd; delete cur.lastEnd; table.push(cur); cur = null; } };
    for (const l of body) {
      let m = STEP.exec(l.text.trim());
      /* Only a first action is printed beside its party; any other number opens its line. */
      if (m && m[1].trim() && Number(m[2]) !== 1) m = null;
      /* Beside a first action, the party is what follows the last sentence the line ends: the text before it
         continues the previous action. */
      let carried = 0;
      if (m && m[1].trim()) {
        const cut = m[1].search(/[.;:]\s+(?=\S)(?!.*[.;:]\s+\S)/);
        if (cut >= 0) { carried = cut + 1; m = [m[0], m[1].slice(cut + 1), m[2], m[3]]; }
        if (m[1].trim().split(/\s+/).length > 8) m = null;
      }
      const n = m ? Number(m[2]) : null;
      /* A step a little past the one expected is still the table's next (a page's footer printed into a line can
         hide a step's number, whose text then stays with the step before). */
      if (m && ((n >= expect && n <= expect + 2 && n > 1 && cur) || (n === 1 && (m[1].trim() || pending.length || cur)))) {
        if (n === 1) {
          const inline = m[1].trim();
          /* The party's name: the short lines just above, after the last that ends a sentence; the lines before
             them continue the previous action. */
          let k = pending.length;
          if (!inline) while (k > 0 && !/[.;:]\s*$/.test(pending[k - 1].text) && pending[k - 1].text.trim().split(/\s+/).length <= 8) k--;
          if (cur && k > 0) cur.lastEnd = pending[k - 1].end;
          if (cur && carried) cur.lastEnd = l.start + indentOf(l) + carried;
          pending = inline ? [] : pending.slice(k);
          if (!inline && !pending.length) { ok = false; why = "a numbering that starts again at 1 has no party beside it or above it that can be told from the action before"; break; }
          if (cur && !inline && !/[.;:]\s*$/.test(raw.slice(cur.start, cur.lastEnd))) {
            ok = false; why = "an action does not end before the next party's numbering starts, so where it stops and the next party begins cannot be told"; break;
          }
          finish();
          const pStart = pending.length ? pending[0].start + indentOf(pending[0]) : l.start + indentOf(l);
          const pEnd = inline ? l.start + indentOf(l) + l.text.trim().indexOf(m[1]) + m[1].trimEnd().length : pending[pending.length - 1].end;
          party = { text: raw.slice(pStart, pEnd).replace(/\s+/g, " ").trim(), start: pStart };
          pending = [];
          expect = 1;
        } else {
          /* Lines between two numbered actions continue the first. */
          if (cur && pending.length) cur.lastEnd = pending[pending.length - 1].end;
          pending = [];
          finish();
        }
        const aStart = l.start + indentOf(l) + l.text.trim().indexOf(`${m[2]}.`, m[1].length ? m[1].length : 0);
        cur = { party: party.text, step: m[2], start: m[1].trim() && n === 1 ? party.start : aStart, aStart, lastEnd: l.end };
        expect = n + 1;
        continue;
      }
      if (cur && !/[.;:]\s*$/.test(raw.slice(cur.start, cur.lastEnd))) { cur.lastEnd = l.end; continue; }
      if (!cur && !party) { pending.push(l); continue; }
      /* After an action that ended: either its continuation's next sentence or the next party's name. */
      pending.push(l);
    }
    if (ok && cur && pending.length) { cur.lastEnd = pending[pending.length - 1].end; pending = []; }
    finish();
    const start = head.start + indentOf(head);
    extents.push({ start, end: stop });
    if (!ok || !table.length) {
      unread.push(placed(sections, { start, end: stop, source: locate(start) || null,
        why: why || "the table's header is printed but no numbered action under a party is read below it" }));
      continue;
    }
    for (const r of table) {
      const action = raw.slice(r.aStart, r.end).replace(/^\d{1,2}\.\s*/, "").replace(/\s+/g, " ").trim();
      rows.push(placed(sections, { party: r.party, action, step: r.step, start: r.start, end: r.end, source: locate(r.start) || null }));
    }
  }
  return { rows, unread, extents };
}

/* ---------------------------------------------------------- timeframes (R31) */

const WORDS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11,
                twelve: 12, fifteen: 15, twenty: 20, thirty: 30, forty: 40, "forty-five": 45, sixty: 60, ninety: 90 };
const AMOUNT = `(?:\\d{1,4}|${Object.keys(WORDS).join("|")})(?:[ \\t]*\\(\\d{1,4}\\))?`;
const UNIT = "(?:minutes?|hours?|(?:calendar|business|working)[ \\t]+days?|days?|weeks?|months?|years?)";
const TIMEFRAME = new RegExp(`\\b(?:(?:within|no[ \\t]+later[ \\t]+than|not[ \\t]+later[ \\t]+than|no[ \\t]+more[ \\t]+than|not[ \\t]+to[ \\t]+exceed|at[ \\t]+least|every|prior[ \\t]+to|in[ \\t]+excess[ \\t]+of)[ \\t]+)?(?:the[ \\t]+)?(?<amount>${AMOUNT})[ \\t-]*(?<unit>${UNIT})\\b|\\b(?<every>annually|semi-annually|biannually|quarterly|monthly|weekly|daily|biennially)\\b`, "gi");
const UNITS = (u) => {
  const s = u.toLowerCase().replace(/\s+/g, " ");
  if (/business|working/.test(s)) return "business_days";
  for (const k of ["minute", "hour", "day", "week", "month", "year"]) if (s.includes(k)) return `${k}s`;
  return null;
};

/** Each passage stating a period or a time limit (R31), `{text, amount?, units?, start, end, source, section}`;
 *  `amount` and `units` only where the text states them plainly. A reading, never a deadline. */
export function readTimeframes(raw, sections, from, locate) {
  const out = [];
  TIMEFRAME.lastIndex = 0;
  for (const m of raw.matchAll(TIMEFRAME)) {
    if (m.index < from) continue;
    const t = { text: m[0].replace(/\s+/g, " "), start: m.index, end: m.index + m[0].length, source: locate(m.index) || null };
    if (m.groups.amount) {
      const a = m.groups.amount.toLowerCase();
      const digits = /\((\d{1,4})\)/.exec(a) || /^(\d{1,4})/.exec(a);
      const amount = digits ? Number(digits[1]) : WORDS[a.trim()];
      if (Number.isFinite(amount)) t.amount = amount;
      const units = UNITS(m.groups.unit);
      if (units && t.amount !== undefined) t.units = units;
    }
    out.push(placed(sections, t));
  }
  return out;
}

/* ------------------------------------------------------------------ the type */

const READINGS = ["sections", "definitions", "applicability", "responsibilities", "timeframes"];
/** The policy readings of a text (R26–R31, R33). */
export function readPolicy(ctx, raw, locate = () => null) {
  const h = readHeader(ctx, raw, locate);
  const from = h.header ? h.header.end : 0;
  const resp = readResponsibilities(raw, [], from, locate);
  const sections = readOutline(raw, from, resp.extents, locate);
  const responsibilities = readResponsibilities(raw, sections, from, locate);
  const definitions = readPolicyDefinitions(raw, sections, locate).filter((d) => d.start >= from);
  const applicability = readApplicability(raw, sections, from, locate);
  const timeframes = readTimeframes(raw, sections, from, locate);
  const digests = {};
  for (const s of sections) digests[s.path.join("/")] = sha256Hex(raw.slice(s.start, s.end).replace(/\s+/g, " ").trim());
  const lists = { sections, definitions, applicability, responsibilities: responsibilities.rows, timeframes };
  const counts = {};
  for (const k of READINGS) {
    counts[k] = lists[k].length;
    if (k !== "sections") counts[`${k}_unplaced`] = lists[k].filter((x) => x.section === null).length;
  }
  counts.responsibilities_unread = responsibilities.unread.length;
  return {
    header: h.header, header_why: h.why,
    sections, sections_why: sections.length ? null
      : "no outline heading (I., A., 1.) opens a line of this policy after its header, so its text is not divided into sections",
    section_digests: digests,
    definitions, applicability, responsibilities: responsibilities.rows, responsibilities_unread: responsibilities.unread,
    timeframes, counts,
  };
}

export default {
  key: "policy",
  label: "a policy of a numbered series",
  version: 1,
  /* A policy says what it says: its substance is the unit (R25, R4). */
  contract: CONTRACT.SUBSTANCE,

  /** Is this a policy? CERTAIN only when its header names a series the view gives, with a number that series reads
   *  (R25); never otherwise. */
  detect(ctx) {
    const series = policySeries(ctx);
    if (!series.length || !headerLabels(ctx).length)
      return { match: false, confidence: CONFIDENCE.NONE,
               why: "the active jurisdiction profiles supply no policy series or no policy header labels, so no document is read as a policy" };
    const h = readHeader(ctx, String(ctx.text || ""));
    const hd = h.header;
    if (!hd || !hd.type)
      return { match: false, confidence: CONFIDENCE.NONE,
               why: "no line of this text opens with a policy series the active profiles name, beside the header labels they give" };
    if (!hd.number)
      return { match: false, confidence: CONFIDENCE.NONE,
               why: `the header names ${hd.type.text} but carries no number that series reads, so it is not read as one of its items` };
    return { match: true, confidence: CONFIDENCE.CERTAIN,
             signals: [`a header naming ${hd.type.text} ${hd.number.text}`,
                       `${HEADER_FIELDS.length - hd.missing.length} header field(s) read`] };
  },

  parse(ctx) {
    const raw = String(ctx.text || "");
    const locate = typeof ctx.locate === "function" ? ctx.locate : () => null;
    return { entities: [], ...readPolicy(ctx, raw, locate), also_satisfies: alsoSatisfies(ctx, "policy"), at: ctx.at || null };
  },

  /** What moved between two readings of a policy (R34): a header field, or a section's heading, text, definitions,
   *  applicability, responsibilities or timeframes, each an `instrument_changed` naming the field or the section's
   *  path; a section read on one side only names which. A reading neither side read is said, never claimed. */
  assess(a, b) {
    const events = [];
    const ha = a.header || null, hb = b.header || null;
    let headerWhy = null;
    if (ha && hb) {
      for (const f of HEADER_FIELDS) {
        const was = ha[f] ? (ha[f].date || ha[f].text) : null, now = hb[f] ? (hb[f].date || hb[f].text) : null;
        if (String(was || "") !== String(now || ""))
          events.push(event("instrument_changed", { key: `header.${f}`, was, now,
            why: `this policy's ${f.replace("_", " ")} as its header states it is not what it was at this address` }));
      }
    } else headerWhy = (ha || hb ? "only one of the readings" : "neither reading") + " gave a header, so nothing is said about the header";
    const sa = Array.isArray(a.sections) ? a.sections : [], sb = Array.isArray(b.sections) ? b.sections : [];
    let sectionsWhy = null;
    if (sa.length && sb.length) {
      const key = (s) => s.path.join("/");
      const ma = new Map(sa.map((s) => [key(s), s])), mb = new Map(sb.map((s) => [key(s), s]));
      /* What a reading holds in one section, so two readings can be compared section by section. */
      const inSec = (x, list, k, show) => (Array.isArray(x[list]) ? x[list] : []).filter((y) => y.section && y.section.join("/") === k).map(show).join("\u0000");
      const shows = { definitions: (d) => d.term, applicability: (p) => p.end - p.start,
                      responsibilities: (r) => `${r.party}\u0001${r.step}\u0001${r.action}`, timeframes: (t) => t.text };
      for (const [k, was] of ma) {
        const now = mb.get(k);
        if (!now) { events.push(event("instrument_changed", { key: "section", section: was.path, was: was.number, now: null,
          why: `section ${was.number} was read before and is not read now` })); continue; }
        const moved = [];
        if (String(was.heading || "") !== String(now.heading || "")) moved.push("heading");
        if (((a.section_digests || {})[k] || null) !== ((b.section_digests || {})[k] || null)) moved.push("text");
        for (const [list, show] of Object.entries(shows)) if (inSec(a, list, k, show) !== inSec(b, list, k, show)) moved.push(list);
        if (moved.length) events.push(event("instrument_changed", { key: "section", section: now.path, moved,
          was: was.heading || was.number, now: now.heading || now.number,
          why: `section ${now.number}'s ${moved.join(", ")} is not what it was at this address` }));
      }
      for (const [k, now] of mb) if (!ma.has(k)) events.push(event("instrument_changed", { key: "section", section: now.path,
        was: null, now: now.number, why: `section ${now.number} is read now and was not read before` }));
    } else sectionsWhy = (sa.length || sb.length ? "only one of the readings" : "neither reading") + " gave sections"
      + ", so nothing is said about sections: " + (b.sections_why || a.sections_why || "neither reading carries sections");
    if (headerWhy && sectionsWhy)
      return { meaningful: null, significance: null, events: [], confirmed: null, header_why: headerWhy, sections_why: sectionsWhy,
               why: "nothing could be read from this policy on one side or the other, so nothing is claimed about it either way" };
    bySeverity(events);
    return {
      meaningful: isMeaningful(events), significance: worstSignificance(events), events, confirmed: null,
      header_compared: !headerWhy, header_why: headerWhy, sections_compared: !sectionsWhy, sections_why: sectionsWhy,
      why: events.length ? `${events.length} change(s) between two readings of a policy at the same address`
        : "this policy reads as it read: the same header and the same sections",
    };
  },
};
