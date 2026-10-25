/* retrieval-browse — "Find in this" (R1–R3, moved from retrieval R73–R75 by T51-29, K3841; T35-37, N698, DEC-164
 * (1)–(4), (7), K1468, K1865, DEC-99, DEC-98): a find over one scope, by kind, that records nothing. `find.mjs` resolves
 * the scope under the viewer's sight (a capture, a selection, an enumerated set, a project's holdings) and hands this
 * file the captures, in capture-sha order; this file
 * reads each capture's readings and text (`extraction`'s and `content`'s read contracts) and answers each kind by a
 * deterministic matcher, never a model. T50 (N1123, N1177, N1183, N1191, N1193): each match also names its document and its
 * content row (R5, R6), keeps a passage's line breaks (R7), says where in a sheet it lies, with its `row` (R8, N1238),
 * and `people` also finds a held alias in a passage's words (R9).
 *
 * WHAT IT NEVER DOES: write (no selection, no observation, no fact, no reading: a member's own searching writes
 * nothing, observation-log R24); fold a capture it could not read into "Nothing here" (DEC-98: `nothing` is said only
 * when every capture of the scope was read for that kind and none matched; a capture that could not be read is in
 * `not_read` with why); match one language's words against another's text (R3); count a table's rows into a figure
 * (a date or amount column is ONE result naming the table, K1468; its values are counted through a calculation).
 *
 * THE MATCH SHAPE is `{kind, words, capture_sha, extent, origin: "search"}` plus the kind's own fields: the one shape
 * every recording module reads (`events` R1, `money` R2, `people` R9, `standards` R47, `citation`'s `cite`), so a
 * found passage can be taken as a citation. `extent` is in `content`'s extent grammar, as the reading or the text unit
 * holds it; an item whose reading cannot say where it was read carries `extent: null` with `extent_why`, never the
 * whole document in its place (a reader's silence is not a member's citation of the whole). */
import { isCalendarDate } from "../civil-time/index.mjs";
import { parseFigure } from "../calc-grammar/index.mjs";
import { extentRelation, canonicalExtent } from "../content/index.mjs";
import { normAlias } from "../extraction/index.mjs";
import { say } from "./words.mjs";
import { localize } from "../setup-words/index.mjs";

/* R2: the kinds, closed (DEC-164 (2)). */
export const FIND_KINDS = Object.freeze(["people", "money", "dates", "requirements", "events", "term"]);
/* R1's bounds (K1881): captures read per call, ids per enumerated scope, items per kind (default and most), the
   characters of a match's words and of a term. */
export const FIND_CAPTURES_PER_CALL = 200;
export const FIND_IDS_MAX = 200;
export const FIND_ITEMS_DEFAULT = 50;
export const FIND_ITEMS_MAX = 500;
export const FIND_WORDS_MAX = 500;
export const FIND_TERM_MAX = 200;
/* R2's `events`: the content types whose readings carry a meeting's items (`doctypes`' minutes and agenda readers,
   through the readings `extraction` holds). */
export const FIND_EVENT_TYPES = Object.freeze(["meeting_minutes", "meeting_agenda"]);
/* R2's `people`: the kinds of registered entity a name is found for (entities' closed kinds). */
export const FIND_PEOPLE_KINDS = Object.freeze(["person", "office"]);
/* R9: the held aliases read per page, and the most pages one find reads (past it, `truncated`). */
const ALIAS_PAGE = 5000;
const ALIAS_PAGES_MAX = 4;
/* The one origin every match carries ("Found by search", DEC-164 (4)). */
export const FIND_ORIGIN = "search";
/* R1 (N715; DEC-164 (4)): the recording modules whose `recordedBy` reads a find calls, in the modules' total order,
   ahead of every read R4 registers; the bound each read is called with; what stands in `recorded_not_read` while no
   later module is registered. */
export const RECORDED_BY_MODULES = Object.freeze(["events", "standards", "money", "people"]);
export const RECORDED_BY_LIMIT = 500;
export const RECORDED_NONE_REGISTERED = say("retrieval.recorded_none_registered");
/* R1 (T50; N1191 (d)): the relations under which a recorded item is the match's: the same extent, or one inside it.
   A fact recorded around the match (the whole document, a whole sheet, the page holding it) marks none of the passages
   inside it, so `wider` is not one. */
const RECORDED_RELATIONS = Object.freeze(["same", "narrower"]);

/* R3 (DEC-99): the matchers' words, held per language in this one place and nowhere else in this module's code: a
   frozen map from a BCP 47 primary language subtag to its vocabularies. A language is added by adding its set, with
   no other change. No set names a place (R17). English is held in T35. */
const deepFreeze = (o) => { for (const v of Object.values(o)) if (v && typeof v === "object") deepFreeze(v); return Object.freeze(o); };
export const FIND_MATCHERS = deepFreeze({
  en: {
    money: {
      /* Each sign and code with the code the figure parser reads it as; a word names a currency without saying which
         (a "dollar" is not one currency), so a word is matched and never turned into a code. */
      signs: ["$", "€", "£", "¥"],
      codes: ["USD", "EUR", "GBP", "CAD", "AUD", "NZD", "JPY", "CHF", "MXN"],
      words: ["dollars", "dollar", "cents", "cent", "euros", "euro", "pounds sterling", "pounds", "pound"],
      multipliers: ["thousand", "million", "billion", "trillion", "bn", "mn", "k", "m"],
    },
    dates: {
      months: [["january", "jan"], ["february", "feb"], ["march", "mar"], ["april", "apr"], ["may"], ["june", "jun"],
               ["july", "jul"], ["august", "aug"], ["september", "sept", "sep"], ["october", "oct"],
               ["november", "nov"], ["december", "dec"]],
      ordinals: ["st", "nd", "rd", "th"],
      /* A period counted from something: its lead words, the units (each as it is said and the unit it states), the
         qualifier of a day count, and the numbers written as words. */
      period_lead: ["within", "no later than", "not later than", "not more than", "no more than"],
      period_units: { day: "days", days: "days", week: "weeks", weeks: "weeks", month: "months", months: "months",
                      year: "years", years: "years", hour: "hours", hours: "hours" },
      period_qualifiers: ["calendar", "business", "working", "court"],
      numbers: { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
                 eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17,
                 eighteen: 18, nineteen: 19, twenty: 20, "twenty-one": 21, "twenty-four": 24, thirty: 30,
                 "forty-five": 45, forty: 40, sixty: 60, ninety: 90, "one hundred twenty": 120, "one hundred eighty": 180 },
    },
    /* The requirement words, longest first so "shall not" is read before "shall". A sentence carrying one is found;
       it is never labeled a force (standards R35; K1722). */
    requirements: ["is required to", "are required to", "shall not", "must not", "may not", "shall", "must"],
  },
});

/* ---- the matchers, pure: the same text and set always give the same matches (R3) ---- */

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const alt = (list) => [...list].sort((a, b) => b.length - a.length).map(esc).join("|");
const NUMBER = String.raw`\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?`;
const compiled = new WeakMap();

/* One set's regular expressions, built once per set from its words alone. */
function patterns(set) {
  let p = compiled.get(set);
  if (p) return p;
  const m = set.money, d = set.dates;
  const mult = `(?:\\s?(?:${alt(m.multipliers)})(?![\\p{L}\\p{N}]))?`;
  const before = `(?:${alt(m.signs)})\\s?|(?:${alt(m.codes)})\\s`;
  const after = `\\s?(?:${alt(m.signs)})|\\s(?:${alt(m.codes)})(?![\\p{L}])|\\s(?:${alt(m.words)})(?![\\p{L}])`;
  const money = new RegExp(`(?<![\\p{L}\\p{N}])(?:(?:${before})(?:${NUMBER})${mult}|(?:${NUMBER})${mult}(?:${after}))`, "giu");
  const months = d.months.flatMap((names, i) => names.map((n) => [n, i + 1]));
  const monthWord = `(${alt(months.map(([n]) => n))})\\.?`;
  const ord = `(?:${alt(d.ordinals)})?`;
  const date = new RegExp([
    `(?<![\\p{L}\\p{N}])${monthWord}\\s+(\\d{1,2})${ord},?\\s+(\\d{4})(?![\\p{N}])`,          /* March 5, 2026 */
    `(?<![\\p{L}\\p{N}])(\\d{1,2})${ord}\\s+${monthWord},?\\s+(\\d{4})(?![\\p{N}])`,          /* 5 March 2026 */
    `(?<![\\p{L}\\p{N}])(\\d{4})-(\\d{2})-(\\d{2})(?![\\p{N}])`,                              /* 2026-03-05 */
    `(?<![\\p{L}\\p{N}/])(\\d{1,2})/(\\d{1,2})/(\\d{4})(?![\\p{N}/])`,                         /* 5/3/2026: order not said */
    `(?<![\\p{L}\\p{N}])${monthWord}\\s+(\\d{4})(?![\\p{N}])`,                                 /* March 2026: no day */
  ].map((s) => `(?:${s})`).join("|"), "giu");
  const numWords = alt(Object.keys(d.numbers));
  const period = new RegExp(`(?<![\\p{L}])(?:${alt(d.period_lead)})\\s+(?:(${numWords})\\s+\\((\\d{1,4})\\)|(${numWords})|(\\d{1,4}))`
    + `\\s+(?:(${alt(d.period_qualifiers)})\\s+)?(${alt(Object.keys(d.period_units))})(?![\\p{L}])`, "giu");
  const requirement = new RegExp(`(?<![\\p{L}])(${alt(set.requirements)})(?![\\p{L}])`, "iu");
  /* A column header naming a currency: a sign anywhere, or a code or word standing alone. */
  const currencyMark = new RegExp(`(?:${alt(m.signs)})|(?<![\\p{L}])(?:${alt([...m.codes, ...m.words])})(?![\\p{L}])`, "iu");
  p = { money, date, period, requirement, monthOf: new Map(months), currencyMark,
        currencyWords: new RegExp(`\\s(?:${alt(m.words)})$`, "iu") };
  compiled.set(set, p);
  return p;
}

/* The sentence of `text` holding [start, end): bounded by a sentence end or a line break on either side. */
function sentenceAround(text, start, end) {
  let a = start, b = end;
  while (a > 0 && !/[.!?;\n]/.test(text[a - 1])) a--;
  while (b < text.length && !/[.!?;\n]/.test(text[b])) b++;
  if (b < text.length && /[.!?;]/.test(text[b])) b++;
  return text.slice(a, b).trim();
}

/** R1, R7: a match's words as written, at most `FIND_WORDS_MAX` characters, cut at a word with `…`. A run of
 *  whitespace holding a line break is one line break, any other run one space, so a title line and the sentence under
 *  it are two lines and never one run. */
export function cutWords(s) {
  const t = String(s ?? "").replace(/\s+/gu, (run) => (/[\n\r\u2028\u2029\u0085]/u.test(run) ? "\n" : " ")).trim();
  if (t.length <= FIND_WORDS_MAX) return t;
  const head = t.slice(0, FIND_WORDS_MAX - 1);
  const at = Math.max(head.lastIndexOf(" "), head.lastIndexOf("\n"));
  return `${(at > 0 ? head.slice(0, at) : head).trimEnd()}…`;
}

/** R2 `money`: amounts in `text` by the set's currency signs, codes, words and multipliers, each with `as_read` (the
 *  words as written) and `figure` as calc-grammar's figure parser reads it, or `figure: null` with why. A currency
 *  word is read with the amount and left out of what the parser is handed, since a word names no one currency. */
export function matchMoney(text, set) {
  const p = patterns(set), out = [];
  for (const m of String(text ?? "").matchAll(p.money)) {
    const as_read = m[0];
    const figure = parseFigure(as_read.replace(p.currencyWords, ""));
    out.push({ index: m.index, end: m.index + as_read.length, as_read,
               ...(figure && typeof figure.refused === "string"
                 ? { figure: null, figure_why: figure.why } : { figure }) });
  }
  return out;
}

/** R2 `dates`: calendar dates in the set's forms, each with `date` (`YYYY-MM-DD`) when it names a whole calendar day
 *  (`civil-time.isCalendarDate`), else `date: null` with why; and deadlines, a period counted from something, each with
 *  `period: {amount, units}` only where the words state both plainly, never counted into a due date. */
export function matchDates(text, set) {
  const p = patterns(set), t = String(text ?? ""), out = [];
  const two = (n) => String(n).padStart(2, "0");
  for (const m of t.matchAll(p.date)) {
    const g = m.slice(1);
    let date = null, why = null;
    if (g[0] !== undefined) date = `${g[2]}-${two(p.monthOf.get(g[0].toLowerCase()))}-${two(g[1])}`;
    else if (g[3] !== undefined) date = `${g[5]}-${two(p.monthOf.get(g[4].toLowerCase()))}-${two(g[3])}`;
    else if (g[6] !== undefined) date = `${g[6]}-${g[7]}-${g[8]}`;
    else if (g[9] !== undefined) why = say("retrieval.why.words_write_day");
    else why = say("retrieval.why.words_name_month");
    if (date && !isCalendarDate(date)) { why = say("retrieval.why.names_day_calendar", { date }); date = null; }
    out.push({ index: m.index, end: m.index + m[0].length, as_read: m[0], date, ...(why ? { date_why: why } : {}) });
  }
  for (const m of t.matchAll(p.period)) {
    const [, word, digits, word2, plain, qualifier, unit] = m;
    const amount = digits ? Number(digits) : plain ? Number(plain)
      : set.dates.numbers[String(word || word2).toLowerCase()];
    const units = `${qualifier ? `${qualifier.toLowerCase()} ` : ""}${set.dates.period_units[unit.toLowerCase()]}`;
    out.push({ index: m.index, end: m.index + m[0].length, as_read: m[0], date: null, deadline: true,
               period: Number.isInteger(amount) ? { amount, units } : null });
  }
  return out.sort((a, b) => a.index - b.index || a.end - b.end);
}

/** R2 `requirements`: each sentence of `text` carrying one of the set's requirement words, the sentence its words,
 *  with the word found; never a force. */
export function matchRequirements(text, set) {
  const p = patterns(set), t = String(text ?? ""), out = [];
  for (const s of sentencesOf(t)) {
    const m = p.requirement.exec(s.text);
    if (!m) continue;
    const lead = s.text.length - s.text.trimStart().length;
    out.push({ index: s.index + lead, end: s.index + s.text.trimEnd().length, sentence: s.text.trim(),
               requirement_word: m[1].toLowerCase() });
  }
  return out;
}

/** R2: a stop (`.` `!` `?` `;`) ends a sentence only before whitespace and a capital (a closing quote or bracket may
 *  come between) or at the end of the text, and a `.` after a known abbreviation does not; a line break always ends
 *  one. So never inside a number (`8.22.050`, `$4.2`) or a citation. Each piece keeps its stop, as `[{index, text}]`. */
const ABBREVIATION = /(?:^|[^\p{L}])(?:Mr|Mrs|Ms|Dr|Prof|Hon|Rev|Gov|Jr|Sr|St|Ave|Sec|Secs|No|Nos|Art|Ch|Cl|Subd|Para|Cal|Civ|Pen|Proc|Evid|Bus|Lab|Pub|Ord|Res|Stat|Stats|Ann|Supp|Cir|App|Dept|Rep|Reg|Fed|Op|Inc|Corp|Co|Ltd|vs|v)\.$/u;
const STOPS = ".!?;";
const AFTER_STOP = /^["'”’)\]]*(?:\s*$|\s+["'“‘(\[]*\p{Lu})/u;
function sentencesOf(t) {
  const out = [];
  let start = 0;
  const cut = (to) => { if (to > start) out.push({ index: start, text: t.slice(start, to) }); };
  for (let i = 0; i < t.length; i++) {
    if (t[i] === "\n") { cut(i); start = i + 1; continue; }
    if (!STOPS.includes(t[i])) continue;
    let j = i;
    while (j + 1 < t.length && STOPS.includes(t[j + 1])) j++;
    if (!AFTER_STOP.test(t.slice(j + 1))) { i = j; continue; }
    if (t[j] === "." && j === i && ABBREVIATION.test(t.slice(start, j + 1))) continue;
    cut(j + 1); start = j + 1; i = j;
  }
  cut(t.length);
  return out;
}

/* ---- the find over the captures one call reads ---- */

const safeJson = (s) => { try { return s == null ? null : JSON.parse(s); } catch { return null; } };
const A1 = /^\$?([A-Z]{1,3})\$?(\d{1,7})$/i;
const PLAIN_NUMBER = new RegExp(`^(?:${NUMBER})$`);
const colNum = (c) => [...c.toUpperCase()].reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0);

export class Finder {
  /** `r` is the module's context (`index.mjs`): its reads (`rowsOf`, `oneOf`), the host reads it was handed (`sight`,
   *  `planOf`, `runQuery`, `localeOf`, R14) and the services it reaches (`entitiesFor`, `recordedReads`). */
  constructor(r) { this.r = r; }

  /** R1–R3 over `captures` (`[{capture_sha, bundle_id}]`, every one in the viewer's sight, in capture-sha order, at
   *  most `FIND_CAPTURES_PER_CALL`): one `{kind, items, count, truncated, nothing, not_read}` per kind asked. `whole` is
   *  true when these captures are the whole scope, so a kind with no match and nothing unread may say "Nothing here". */
  find({ captures, kinds, term, limit, viewer, whole }) {
    /* R20: a `term` find takes its hits from the index and reads the stored text of the units holding a hit alone; every other
       kind reads the text it matches over. */
    const withText = kinds.some((k) => k !== "term");
    const data = new Map(captures.map((c) => [c.capture_sha, this.#load(c, withText)]));
    const language = this.r.localeOf();
    return kinds.map((kind) => {
      const acc = { items: [], not_read: [], truncated: false };
      const add = (item) => {
        if (acc.items.length > limit) return;
        acc.items.push(placed(item, data.get(item.capture_sha)));
      };
      const skip = (c, why) => acc.not_read.push({ capture_sha: c.capture_sha, why });
      if (kind === "people") this.#people(captures, data, add, skip, viewer, acc, limit);
      else if (kind === "term") this.#term(captures, data, add, skip, term, viewer, acc);
      else for (const c of captures) {
        const d = data.get(c.capture_sha);
        if (kind === "events") { this.#events(c, d, add, skip); continue; }
        if (!d.reading && !d.units.length && !d.cells) { skip(c, localize("retrieval-browse.findin.not_extracted", "not extracted: no reading of this capture is held")); continue; }
        if (!d.units.length && !d.cells) { skip(c, localize("retrieval-browse.findin.no_text", "no text: this capture's reading holds no text to search")); continue; }
        const lang = d.language || language;
        const set = lang && Object.hasOwn(FIND_MATCHERS, lang) ? FIND_MATCHERS[lang] : null;
        if (!set) {
          skip(c, lang ? localize("retrieval-browse.findin.no_matcher_for_lang_yet", "no matcher for {lang} yet", { lang: String(lang) })
            : localize("retrieval-browse.findin.no_matcher_unstated", "no matcher for this capture's language yet: neither its reading nor the active profiles state a language"));
          continue;
        }
        if (kind === "requirements") {
          /* Its words are read from the text units alone: a reading holding only typed cells is not read for it. */
          if (!d.units.length) skip(c, localize("retrieval-browse.findin.no_text_typed_cells", "no text: this capture's reading holds typed cells but no text unit to read sentences from"));
          else this.#requirements(c, d, set, add);
        }
        else this.#figures(kind, c, d, set, add);
      }
      const truncated = acc.truncated || acc.items.length > limit;
      const items = acc.items.slice(0, limit);
      /* DEC-98: "Nothing here" only when every capture of the scope was read for this kind and none matched. */
      const nothing = whole && items.length === 0 && acc.not_read.length === 0 && !truncated;
      return { kind, items, count: items.length, truncated, nothing, ...(nothing ? { says: say("state.empty") } : {}),
               not_read: acc.not_read };
    });
  }

  /** R1, R4 (N715; K1941, K2063): who recorded each match. Every read (`r.recordedReads()`: the four recording
   *  modules' `recordedBy`, then each registered one) is called once per capture of `captures`, under `viewer`, with
   *  `limit` RECORDED_BY_LIMIT; each item whose extent stands to the match's (a table item's `table.extent`) as `same`
   *  or `narrower` (`content.extentRelation`; T50: never `wider`, R1) is in the match's `recorded`, `relation` that answer. A read
   *  that throws, rejects, refuses or answers another shape is in `not_read` with why and changes nothing else; a
   *  promise is never awaited (a find is synchronous), and its rejection is caught. Answers `{read, not_read}`. */
  recorded(kinds, captures, viewer) {
    const reads = this.r.recordedReads();
    const got = new Map(captures.map((c) => [c.capture_sha, []]));
    const read = [], not_read = [];
    for (const rd of reads) {
      if (!rd.read) { not_read.push({ module: rd.module, why: rd.why, captures: captures.length }); continue; }
      let failed = null, n = 0;
      for (const c of captures) {
        const a = callRead(rd.read, c.capture_sha, viewer);
        if (a.why) { n++; failed = failed || a.why; continue; }
        got.get(c.capture_sha).push({ module: rd.module, items: a.items, truncated: a.truncated });
      }
      if (failed) not_read.push({ module: rd.module, why: failed, captures: n });
      else if (captures.length) read.push(rd.module);
    }
    if (!reads.some((rd) => rd.registered)) not_read.push({ module: null, why: RECORDED_NONE_REGISTERED });
    for (const k of kinds)
      for (const m of k.items) {
        const answers = got.get(m.capture_sha) || [];
        const at = m.table ? m.table.extent : m.extent;
        m.recorded = [];
        for (const a of answers)
          for (const it of a.items) {
            const relation = relationOf(at, it.extent);
            if (!RECORDED_RELATIONS.includes(relation)) continue;
            m.recorded.push({ module: a.module, record: it.record ?? null, kind: it.kind ?? null, field: it.field ?? null,
                              extent: it.extent ?? null, relation, by: it.by ?? null, at: it.at ?? null,
                              withdrawn: it.withdrawn === true });
          }
        if (answers.some((a) => a.truncated)) m.recorded_truncated = true;
      }
    return { read, not_read };
  }

  /** R5, R6 (T50; N1123, N1177): every match carries `title`, the title of the bundle R1 attributes its capture to (null
   *  when that bundle states none), and, with an extent (a table item's `table.extent`), `content_id`, the id of the row
   *  `content` holds for exactly that capture and extent, or null with `content_held: false`. A find mints nothing, so a
   *  passage nobody has marked citable answers null. A row held in a bundle the viewer may not see is no row to them. */
  annotate(kinds, captures, viewer) {
    const bundleOf = new Map(captures.map((c) => [c.capture_sha, c.bundle_id]));
    const sees = this.r.sight(viewer);
    const titles = new Map(), held = new Map();
    const titleOf = (id) => {
      if (!titles.has(id)) {
        const row = id ? this.r.oneOf(`SELECT title FROM bundles WHERE bundle_id = ?`, id) : null;
        titles.set(id, row && typeof row.title === "string" && row.title.trim() ? row.title : null);
      }
      return titles.get(id);
    };
    const contentOf = (sha, extent) => {
      let canon = null;
      try { canon = canonicalExtent(extent); } catch { canon = null; }
      if (canon === null) return null;
      const key = `${sha}\u0000${canon}`;
      if (!held.has(key)) {
        const row = this.r.rowsOf(`SELECT content_id, bundle_id FROM content WHERE capture_sha = ? AND extent = ?
                                    ORDER BY stale, at, content_id`, sha, canon).find((r) => sees(r.bundle_id));
        held.set(key, row ? row.content_id : null);
      }
      return held.get(key);
    };
    for (const k of kinds)
      for (const m of k.items) {
        m.title = titleOf(bundleOf.get(m.capture_sha) ?? null);
        const at = m.table ? m.table.extent : m.extent;
        if (at) { m.content_id = contentOf(m.capture_sha, at); m.content_held = m.content_id !== null; }
      }
  }

  /* One capture's reading (content type, language, typed cells, items) and its text units in reading order. */
  #load(c, withText) {
    const row = this.r.oneOf(`SELECT content_type, reading FROM readings WHERE capture_sha = ?`, c.capture_sha);
    const reading = row ? safeJson(row.reading) : null;
    const units = this.r.rowsOf(`SELECT seq, extent_kind, extent, ref${withText ? ", text" : ""} FROM capture_text WHERE capture_sha = ?
                                  ORDER BY seq, extent_kind, extent`, c.capture_sha)
      .map((u) => ({ ...u, extentObj: safeJson(u.extent) }));
    const lang = reading && typeof reading.language === "string" && reading.language
      ? reading.language.split("-")[0].toLowerCase() : null;
    const cells = reading && reading.cells && typeof reading.cells === "object" && !Array.isArray(reading.cells)
      ? reading.cells : null;
    /* G41 (K4636): the sheets whose typed cells the reading does not list, because they are interpreted from the held file
       for a range when a member opens or cites it; the reading names them in `cells_held`. Their text is in `units` whole. */
    const cellsHeld = new Set(reading && Array.isArray(reading.cells_held) ? reading.cells_held.filter((n) => typeof n === "string") : []);
    return { reading: row ? { content_type: row.content_type, value: reading } : null, units, language: lang, cells,
             cellsHeld, grids: new Map() };
  }

  /* `money` and `dates`: over the text units, and over a workbook's typed cells where the reading holds them. A
     table's date or amount column is ONE result naming the table (K1468), never one per row. */
  #figures(kind, c, d, set, add) {
    const match = kind === "money" ? matchMoney : matchDates;
    const item = (m, text, extent) => ({ kind, words: cutWords(sentenceAround(text, m.index, m.end)),
      capture_sha: c.capture_sha, extent, origin: FIND_ORIGIN, as_read: m.as_read,
      ...(kind === "money" ? { figure: m.figure, ...(m.figure ? {} : { figure_why: m.figure_why }) }
        : { date: m.date, ...(m.date_why ? { date_why: m.date_why } : {}),
            ...(m.deadline ? { deadline: true, period: m.period } : {}) }) });
    const { sheets, tables } = heldCells(d.cells);
    /* N724 (K1972): a document table whose cells the reading holds: its date or amount columns are read from the
       cells, and the paragraphs of those columns' cells are not matched again (one result, never one per cell). */
    const docTables = tables.map((t) => ({ ...t, ...this.#columns(kind, t.cells, set) }));
    const skipped = paragraphsOf(docTables, d.units);
    for (const u of d.units) {
      const e = u.extentObj;
      /* A sheet whose typed cells the reading holds is read by its cells below, not by its rendered text. */
      if (e && e.kind === "sheet-range" && sheets.has(e.sheet)) continue;
      if (e && e.kind === "doc-table" && docTables.some((t) => t.table === e.table)) continue;
      if (skipped.has(u)) continue;
      const found = match(u.text, set);
      if (!found.length) continue;
      if (u.extent_kind === "doc-table") {
        /* A table in a document: its reading holds the table's text but not its cells, so which column holds the
           dates or amounts is not read. It is one result naming the table, as a column is. */
        add({ kind, table: { capture_sha: c.capture_sha, extent: e, column: null, rows: null,
                             column_why: say("retrieval.column_why") },
              words: cutWords(String(u.text).split("\n")[0]), capture_sha: c.capture_sha, extent: e, origin: FIND_ORIGIN });
        continue;
      }
      for (const m of found) add(item(m, u.text, e));
    }
    for (const t of docTables)
      for (const col of t.columns) {
        const extent = { kind: "doc-table", table: t.table };
        add({ kind, table: { capture_sha: c.capture_sha, extent, column: col.col, rows: col.rows },
              words: col.words, capture_sha: c.capture_sha, extent, origin: FIND_ORIGIN });
      }
    for (const sheet of [...sheets].sort()) this.#sheet(kind, c, sheet, d.cells[sheet], set, match, add, item);
  }

  /* One sheet's typed cells: each date or amount column (`#columns`) is one table result; every other cell is matched
     on its own words. */
  #sheet(kind, c, sheet, cells, set, match, add, item) {
    const { held, columns, done } = this.#columns(kind, cells, set);
    for (const col of columns) {
      const extent = { kind: "sheet-range", sheet, range: `${col.col}${col.first}:${col.col}${col.last}` };
      add({ kind, table: { capture_sha: c.capture_sha, extent, column: col.col, rows: col.rows },
            words: col.words, capture_sha: c.capture_sha, extent, origin: FIND_ORIGIN });
    }
    for (const x of held) {
      if (done.has(x) || x.cell.value == null) continue;
      const text = String(x.cell.value);
      for (const m of match(text, set)) add(item(m, text, { kind: "sheet-cell", sheet, cell: `${x.at.col}${x.at.row}` }));
    }
  }

  /* A grid's typed cells (a sheet's, or a document table's, each cell's `source.cell` in A1): the first row read is its
     header; a column every one of whose other cells is a date (or an amount: a number, or a value written as a plain
     number, under a header naming a currency, or a value the money matcher reads whole) is one result. Answers the
     cells placed (`held`), the columns (`{col, words, rows, first, last}`) and the cells they take (`done`). */
  #columns(kind, cells, set) {
    const at = (cell) => { const m = cell && cell.source && typeof cell.source.cell === "string" ? A1.exec(cell.source.cell) : null;
                           return m ? { col: m[1].toUpperCase(), row: Number(m[2]) } : null; };
    const held = cells.map((cell) => ({ cell, at: at(cell) })).filter((x) => x.at);
    const columns = [], done = new Set();
    if (!held.length) return { held, columns, done };
    const top = Math.min(...held.map((x) => x.at.row));
    const cols = new Map();
    for (const x of held) {
      if (!cols.has(x.at.col)) cols.set(x.at.col, { header: null, body: [] });
      if (x.at.row === top) cols.get(x.at.col).header = x.cell; else cols.get(x.at.col).body.push(x);
    }
    const whole = (s, m) => m.length === 1 && m[0].index === 0 && m[0].end === String(s).trim().length;
    const isDate = (x) => x.cell.type === "date"
      || (x.cell.type === "text" && whole(x.cell.value, matchDates(String(x.cell.value ?? "").trim(), set).filter((m) => m.date)));
    const headerMoney = (h) => !!h && patterns(set).currencyMark.test(String(h.value ?? ""));
    const isAmount = (x, h) => (x.cell.type === "number" && headerMoney(h))
      || (x.cell.type === "text" && headerMoney(h) && PLAIN_NUMBER.test(String(x.cell.value ?? "").trim()))
      || (x.cell.type === "text" && whole(x.cell.value, matchMoney(String(x.cell.value ?? "").trim(), set)));
    for (const col of [...cols.keys()].sort((a, b) => colNum(a) - colNum(b))) {
      const { header, body } = cols.get(col);
      const filled = body.filter((x) => x.cell.value != null && String(x.cell.value).trim() !== "");
      if (!filled.length) continue;
      const fits = kind === "dates" ? filled.every(isDate) : filled.every((x) => isAmount(x, header));
      if (!fits) continue;
      const rows = filled.map((x) => x.at.row);
      columns.push({ col, rows: filled.length, first: Math.min(...rows), last: Math.max(...rows),
                     words: cutWords(header && header.value != null && String(header.value).trim() ? header.value : `column ${col}`) });
      for (const x of body) done.add(x);
    }
    return { held, columns, done };
  }

  #requirements(c, d, set, add) {
    for (const u of d.units)
      for (const m of matchRequirements(u.text, set))
        add({ kind: "requirements", words: cutWords(m.sentence), capture_sha: c.capture_sha, extent: u.extentObj,
              origin: FIND_ORIGIN, requirement_word: m.requirement_word });
  }

  /* `events`: the items, motions and votes the minutes and agenda readers read, as `extraction` holds the reading. */
  #events(c, d, add, skip) {
    if (!d.reading) { skip(c, localize("retrieval-browse.findin.not_extracted", "not extracted: no reading of this capture is held")); return; }
    if (!FIND_EVENT_TYPES.includes(d.reading.content_type)) { skip(c, localize("retrieval-browse.findin.not_minutes_or_agenda", "not minutes or an agenda")); return; }
    const list = d.reading.value && Array.isArray(d.reading.value.entities) ? d.reading.value.entities : [];
    for (const e of list) {
      if (!e || typeof e !== "object") continue;
      const { extent, extent_why } = extentOfSource(e.source);
      add({ kind: "events", words: cutWords(e.label ?? e.key ?? e.ref ?? ""), capture_sha: c.capture_sha, extent,
            ...(extent_why ? { extent_why } : {}), origin: FIND_ORIGIN,
            item: { key: e.key ?? null, kind: e.kind ?? null, label: e.label ?? null, ref: e.ref ?? null,
                    facts: e.facts && typeof e.facts === "object" ? e.facts : {} },
            content_type: d.reading.content_type });
    }
  }

  /* `people`: each reference of the captures' readings that corresponds to a held name of a registered person or
     office, as `entities.namingDocuments` corresponds them (its R17); nothing is resolved (entities R9). */
  #people(captures, data, add, skip, viewer, acc, limit) {
    const read = [];
    for (const c of captures) {
      if (data.get(c.capture_sha).reading) read.push(c.capture_sha);
      else skip(c, localize("retrieval-browse.findin.not_extracted", "not extracted: no reading of this capture is held"));
    }
    if (!read.length) return;
    /* DEC-98: a page whose names could not be read is in `not_read`, never "Nothing here". */
    const unread = (why) => { for (const c of captures) if (read.includes(c.capture_sha)) skip(c, why); };
    const entities = this.r.entitiesFor();
    if (!entities) { unread(say("retrieval.unread.read_followed_people")); return; }
    /* entities R52 (K1972): R17's candidates for every followed person and office over this page's captures, in one
       bounded read; its page is this kind's own, so its `truncated` is this kind's. */
    const ans = entities.namingIn({ captureShas: read, kinds: [...FIND_PEOPLE_KINDS], limit, viewer });
    if (!ans || ans.ok !== true) {
      unread(say("retrieval.unread.read_followed_people_offices", { ans: ans && ans.reason ? ` (${String(ans.reason).slice(0, 80)})` : "" }));
      return;
    }
    if (ans.truncated) acc.truncated = true;
    const byId = new Map((ans.entities || []).map((e) => [e.entity_id, { entity_id: e.entity_id, kind: e.entity_kind, label: e.entity_label }]));
    const found = (ans.candidates || []).filter((cand) => byId.has(cand.entity_id))
      .map((cand) => ({ ent: byId.get(cand.entity_id), cand }));
    found.sort((a, b) => a.cand.capture_sha.localeCompare(b.cand.capture_sha) || String(a.cand.ref).localeCompare(String(b.cand.ref))
      || a.ent.entity_id.localeCompare(b.ent.entity_id));
    const refs = [];
    for (const { ent, cand } of found) {
      const pos = this.r.oneOf(`SELECT pos_kind, pos, pos_ref FROM reading_refs WHERE capture_sha = ? AND ref = ?
                                 ORDER BY seq LIMIT 1`, cand.capture_sha, cand.ref);
      const { extent, extent_why } = pos && pos.pos_kind
        ? { extent: { kind: pos.pos_kind, ...(safeJson(pos.pos) || {}) }, extent_why: null }
        : extentOfSource(null);
      refs.push({ entity_id: ent.entity_id, capture_sha: cand.capture_sha, extent });
      add({ kind: "people", words: cutWords(cand.label ?? cand.key ?? cand.ref), capture_sha: cand.capture_sha, extent,
            ...(extent_why ? { extent_why } : {}), origin: FIND_ORIGIN,
            entity: { entity_id: ent.entity_id, kind: ent.kind, label: ent.label },
            correspondence: cand.correspondence, matched_alias: cand.matched_alias, ref: cand.ref });
    }
    this.#aliasPeople(captures, read, data, entities, add, skip, acc, viewer, refs);
  }

  /* R9 (N1193): a held alias of a registered person or office is also found in the words of the scope's text units. Each
     standing alias (`entities.aliasesOf`, its R55) is folded as `entities` folds a name (R17) and matched as a whole
     phrase, its terms in order and adjacent between non-letters, against each unit's folded text: one item per (unit,
     entity), however many aliases or occurrences match, its `matched_alias` the first in entity then alias order. A name
     two entities hold lists each and nothing is resolved (entities R9). A reference already found for the same entity
     in the same unit stands as it is (the stronger correspondence); a capture with no text unit is in `not_read`. */
  #aliasPeople(captures, read, data, entities, add, skip, acc, viewer, refs) {
    const unreadAll = (why) => { for (const c of captures) if (read.includes(c.capture_sha)) skip(c, why); };
    if (typeof entities.aliasesOf !== "function") {
      unreadAll(say("retrieval.unread.read_followed_people"));
      return;
    }
    const held = [];
    let after = null;
    for (let page = 0; page < ALIAS_PAGES_MAX; page++) {
      let ans = null;
      try { ans = entities.aliasesOf({ kinds: [...FIND_PEOPLE_KINDS], limit: ALIAS_PAGE, after, viewer }); } catch { ans = null; }
      const list = ans && ans.ok === true && Array.isArray(ans.aliases) ? ans.aliases : null;
      if (!list) {
        unreadAll(say("retrieval.unread.read_followed_people_offices", { ans: ans && ans.reason ? ` (${String(ans.reason).slice(0, 80)})` : "" }));
        return;
      }
      held.push(...list);
      if (!(ans && ans.truncated === true)) { after = null; break; }
      after = ans.next ?? null;
      if (after === null || page === ALIAS_PAGES_MAX - 1) { acc.truncated = true; break; }
    }
    const phrases = [];
    for (const a of held) {
      const phrase = foldTokens(normAlias(a && a.alias));
      if (a && typeof a.entity_id === "string" && phrase.length) phrases.push({ ...a, phrase });
    }
    for (const c of captures) {
      if (!read.includes(c.capture_sha)) continue;
      const d = data.get(c.capture_sha);
      if (!d.units.length) { skip(c, localize("retrieval-browse.findin.no_text_unit_for_name", "no text: this capture's reading holds no text unit to find a held name in")); continue; }
      if (!phrases.length) continue;
      for (const u of d.units) {
        const tokens = foldTokens(u.text);
        if (!tokens.length) continue;
        const at = new Map();
        tokens.forEach((t, i) => { if (!at.has(t)) at.set(t, []); at.get(t).push(i); });
        const seen = new Map();
        for (const p of phrases) {
          if (seen.has(p.entity_id) || !phraseIn(tokens, at, p.phrase)) continue;
          seen.set(p.entity_id, p);
        }
        for (const [id, p] of [...seen].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))) {
          const stands = refs.some((r) => r.entity_id === id && r.capture_sha === c.capture_sha && r.extent && u.extentObj
            && ["same", "narrower"].includes(relationOf(u.extentObj, r.extent)));
          if (stands) continue;
          const { extent, extent_why } = u.extentObj ? { extent: u.extentObj, extent_why: null } : extentOfSource(null);
          add({ kind: "people", words: cutWords(u.text), capture_sha: c.capture_sha, extent, ...(extent_why ? { extent_why } : {}),
                origin: FIND_ORIGIN, entity: { entity_id: id, kind: p.kind ?? null, label: p.label ?? null },
                correspondence: "name_in_passage", matched_alias: String(p.alias) });
        }
      }
    }
  }

  /* R8: the rows of one sheet holding `phrase` in a cell's value, in row order: each the first matching cell's words, the
     row's `sheet-range`, its cells and the addresses of its formulas the file never calculated. Empty where the reading
     holds no typed cells for the sheet, or no one cell holds the phrase. */
  #sheetRows(d, sheet, phrase) {
    const grid = gridOf(d, sheet);
    if (!grid || !phrase.length) return [];
    const out = [];
    for (const row of [...grid.keys()].sort((a, b) => a - b)) {
      const hit = grid.get(row).find(({ cell }) => cell.value != null && !uncalculated(cell) && hasPhrase(tokensOf(cell.value), phrase));
      if (!hit) continue;
      const r = rowOf(d, sheet, row);
      out.push({ words: String(hit.cell.value), range: r.range, cells: r.cells, cells_truncated: r.cells_truncated,
                 not_calculated: r.not_calculated });
    }
    return out;
  }

  /* R20: one unit's stored text, read when a hit needs it (a `term` find loads no other); the text a load already holds is kept. */
  #textOf(sha, u) {
    if (typeof u.text === "string") return u.text;
    const row = this.r.oneOf(`SELECT text FROM capture_text WHERE capture_sha = ? AND extent_kind = ? AND extent = ?`,
      sha, u.extent_kind, u.extent);
    u.text = row && typeof row.text === "string" ? row.text : "";
    return u.text;
  }

  /* R17a: the part kind one unit was stored with (extraction R107), null for a unit stored before the kind. */
  #partOf(sha, u) {
    if (u.part === undefined) {
      const held = this.r.rowsOf(`PRAGMA table_info(capture_text)`).some((x) => x.name === "kind");
      const row = held ? this.r.oneOf(`SELECT kind FROM capture_text WHERE capture_sha = ? AND extent_kind = ? AND extent = ?`,
        sha, u.extent_kind, u.extent) : null;
      u.part = row && typeof row.kind === "string" && row.kind ? row.kind : null;
    }
    return u.part;
  }

  /* `term`: the term as written, matched as `search` matches words in a passage (query-language's `passage:` arm,
     through the compiler and the gated executor, R18), each passage one item. */
  #term(captures, data, add, skip, term, viewer, acc) {
    const shas = new Set();
    for (const c of captures) {
      const d = data.get(c.capture_sha);
      if (!d.reading && !d.units.length) skip(c, localize("retrieval-browse.findin.not_extracted", "not extracted: no reading of this capture is held"));
      else if (!d.units.length) skip(c, localize("retrieval-browse.findin.no_text", "no text: this capture's reading holds no text to search"));
      else shas.add(c.capture_sha);
    }
    const bundles = [...new Set(captures.filter((c) => shas.has(c.capture_sha)).map((c) => c.bundle_id))].sort();
    const phrase = tokensOf(term);
    const query = `passage:"${String(term).replace(/"/g, " ").trim()}"`;
    const rows = [];
    const tally = { applied: 0 };
    for (let i = 0; i < bundles.length; i += 64) {
      const plan = this.r.planOf({ q: query, viewer, ids: bundles.slice(i, i + 64), rows: "passage",
                                   rowLimit: 1000, rowOffset: 0 });
      const got = this.r.runQuery(plan.statements.meaning(), tally);
      if (got.length >= 1000) acc.truncated = true;
      for (const r of got) if (shas.has(r.capture_sha)) rows.push(r);
    }
    rows.sort((a, b) => a.capture_sha.localeCompare(b.capture_sha) || a.seq - b.seq);
    const seen = new Set();
    for (const r of rows) {
      const k = `${r.capture_sha}\u0000${r.seq}\u0000${r.extent}`;
      if (seen.has(k)) continue;
      seen.add(k);
      const d = data.get(r.capture_sha);
      const u = d.units.find((x) => x.seq === r.seq && x.extent === r.extent);
      const extent = safeJson(r.extent);
      /* R17a (retrieval R95): the part the hit lies in, from its unit, null where the unit was stored without a kind. */
      const part = u ? this.#partOf(r.capture_sha, u) : null;
      /* R8: a passage of a sheet is found cell by cell, and a match names the row it lies in. */
      const rows = extent && SHEET_EXTENTS.includes(extent.kind) && typeof extent.sheet === "string"
        ? this.#sheetRows(d, extent.sheet, phrase) : [];
      if (rows.length) {
        for (const x of rows)
          add({ kind: "term", words: cutWords(x.words), capture_sha: r.capture_sha, extent: x.range, origin: FIND_ORIGIN,
                part, term: String(term), sheet: extent.sheet, cells: x.cells, cells_truncated: x.cells_truncated,
                not_calculated: x.not_calculated });
        continue;
      }
      /* G41: a held sheet's unit is a block of many rows; its words are the row (line) holding the term, not the block's head. */
      const text = u ? this.#textOf(r.capture_sha, u) : null;
      const line = text !== null && extent && SHEET_EXTENTS.includes(extent.kind) && d.cellsHeld.has(extent.sheet)
        ? text.split("\n").find((l) => hasPhrase(tokensOf(l), phrase)) : null;
      add({ kind: "term", words: cutWords(line ?? (text !== null ? text : r.snippet ?? "")), capture_sha: r.capture_sha,
            extent, origin: FIND_ORIGIN, part, term: String(term) });
    }
  }
}


/* ---- R8: where a match found in a sheet lies ---- */

/* The most cells of one row a match lists (R8). */
export const FIND_ROW_CELLS_MAX = 50;
const SHEET_EXTENTS = Object.freeze(["sheet-cell", "sheet-range"]);
/* Why a sheet match names no cells: the reading holds none for the sheet (over its reader's size guard), or the words it
   found run across more than one cell. A member reads it beside `cells: null`, as every `why` of this file is (localize,
   at its one use in `placed`). */

/* A sheet's typed cells by row: `row → [{col, n, at, cell}]` in column order, or null where the reading holds none (a sheet
   it names in `cells_held` has no list: `money` and `dates` read its rendered text, a term hit names its range). */
function gridOf(d, sheet) {
  if (d.grids.has(sheet)) return d.grids.get(sheet);
  const list = !d.cellsHeld.has(sheet) && d.cells && Array.isArray(d.cells[sheet]) ? d.cells[sheet] : null;
  let grid = null;
  if (list) {
    grid = new Map();
    for (const cell of list) {
      const m = cell && cell.source && typeof cell.source.cell === "string" ? A1.exec(cell.source.cell) : null;
      if (!m) continue;
      const row = Number(m[2]), col = m[1].toUpperCase();
      if (!grid.has(row)) grid.set(row, []);
      grid.get(row).push({ col, n: colNum(col), at: `${col}${row}`, cell });
    }
    for (const r of grid.values()) r.sort((a, b) => a.n - b.n);
  }
  d.grids.set(sheet, grid);
  return grid;
}

/* R8: a formula the file carries no cached value for: no figure or date is read from it. */
const uncalculated = (cell) => cell.formula != null && cell.formula !== "" && (cell.cached === null || cell.cached === undefined);

/* R8: one row's cells as a match lists them, `[{cell, value, type}]` in column order (a formula with no cached value
   with `value: null`, its `formula` and `cached: null`), at most FIND_ROW_CELLS_MAX with `cells_truncated`, and the
   addresses of the row's uncalculated formulas. Null where the grid holds no such row. */
function rowOf(d, sheet, row) {
  const grid = gridOf(d, sheet), held = grid ? grid.get(row) : null;
  if (!held) return null;
  const cells = held.slice(0, FIND_ROW_CELLS_MAX).map(({ at, cell }) => (uncalculated(cell)
    ? { cell: at, value: null, type: cell.type ?? null, formula: cell.formula, cached: null }
    : { cell: at, value: cell.value ?? cell.cached ?? null, type: cell.type ?? null }));
  return { cells, cells_truncated: held.length > FIND_ROW_CELLS_MAX,
           not_calculated: held.filter(({ cell }) => uncalculated(cell)).map((x) => x.at),
           range: { kind: "sheet-range", sheet, range: `A${row}:${held[held.length - 1].col}${row}` } };
}

/* R8: a match found in a sheet says where, and in which row (N1238). A column result names its sheet beside its table, row
   null; a cell found in the typed cells lists its row's cells and names the row; a term hit already holds its row's cells
   and names the row its range lies in; a match of a unit's own text, where no cell can be named, says so, row null. */
function placed(item, d) {
  const e = item.table ? item.table.extent : item.extent;
  if (!e || !SHEET_EXTENTS.includes(e.kind) || typeof e.sheet !== "string") return item;
  if (item.cells !== undefined) return { ...item, row: rowNumberOf(e) };
  const out = { ...item, sheet: e.sheet };
  if (item.table) return { ...out, row: null };
  const m = e.kind === "sheet-cell" && typeof e.cell === "string" ? A1.exec(e.cell) : null;
  const row = m && d ? rowOf(d, e.sheet, Number(m[2])) : null;
  /* G41: a held sheet's match names its sheet and its unit's range (a row only for a one-row range) with no cells, and says
     why: its cells are made for a range when it is opened or cited. */
  if (!row && d && d.cellsHeld.has(e.sheet))
    return { ...out, cells: null, cells_why: localize("retrieval-browse.findin.cells_held_why", "this sheet's text is read whole and searchable; its cells are interpreted for a range when the sheet is opened or cited, so no row of cells is named here"), row: rowNumberOf(e) };
  return row ? { ...out, cells: row.cells, cells_truncated: row.cells_truncated, not_calculated: row.not_calculated, row: Number(m[2]) }
             : { ...out, cells: null, cells_why: localize("retrieval-browse.findin.no_cells_named", "the reading holds no typed cells for this sheet, or the words found run across cells, so no row of cells is named"), row: null };
}

/* R8: the row a `sheet-cell` address, or a row's `sheet-range` (`A<r>:<last column><r>`), lies in; null for a range of several rows. */
function rowNumberOf(e) {
  if (e.kind === "sheet-cell") { const m = typeof e.cell === "string" ? A1.exec(e.cell) : null; return m ? Number(m[2]) : null; }
  const m = typeof e.range === "string" ? /^\$?[A-Z]{1,3}\$?(\d{1,7}):\$?[A-Z]{1,3}\$?(\d{1,7})$/i.exec(e.range) : null;
  return m && m[1] === m[2] ? Number(m[1]) : null;
}

/* R9: `entities`' fold of a name (R17): lower-cased, split on anything that is no letter or digit, diacritics kept. */
const foldTokens = (s) => String(s ?? "").toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);
/* Whether `phrase` stands in order and adjacent in `tokens`, `at` the positions of each token. */
function phraseIn(tokens, at, phrase) {
  for (const i of at.get(phrase[0]) || []) {
    let k = 1;
    while (k < phrase.length && tokens[i + k] === phrase[k]) k++;
    if (k === phrase.length) return true;
  }
  return false;
}

/* The words of `s` as the text index folds them: lower-cased, diacritics dropped, split on anything that is no letter or
   digit. A phrase is found where its tokens stand in order and adjacent. */
const tokensOf = (s) => String(s ?? "").normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);
function hasPhrase(tokens, phrase) {
  if (!phrase.length || tokens.length < phrase.length) return false;
  for (let i = 0; i + phrase.length <= tokens.length; i++) {
    let k = 0;
    while (k < phrase.length && tokens[i + k] === phrase[k]) k++;
    if (k === phrase.length) return true;
  }
  return false;
}

/* A reading position (`text-chain.readingSource`: an extent with its `ref`) as an extent in content's grammar; a
   position the reading does not state is `null` with why, never the whole document. */
export function extentOfSource(source) {
  if (source && typeof source === "object" && typeof source.kind === "string" && source.kind) {
    const { ref, ...extent } = source;
    return { extent, extent_why: null };
  }
  return { extent: null, extent_why: say("retrieval.extent_why") };
}

/* R1 (N715): one recorder read for one capture: its items and `truncated`, or `{why}` when it threw, answered a
   promise (never awaited: a find is synchronous; a rejection is caught here), refused, or answered another shape than
   `events` R49's. */
function callRead(read, captureSha, viewer) {
  let a;
  try { a = read({ captureSha, limit: RECORDED_BY_LIMIT, viewer }); }
  catch (e) { return { why: say("retrieval.why.read_threw", { e: String((e && e.message) || e).slice(0, 200) }) }; }
  if (a && typeof a.then === "function") {
    Promise.resolve(a).catch(() => {});
    return { why: say("retrieval.why.read_answered_promise") };
  }
  if (a && typeof a === "object" && a.ok === false)
    return { why: say("retrieval.why.read_refused", { given: String(a.code ?? a.reason ?? say("monitoring.reason_given")).slice(0, 200) }) };
  if (!a || typeof a !== "object" || a.ok !== true || !Array.isArray(a.items)
      || !a.items.every((it) => it && typeof it === "object" && !Array.isArray(it)))
    return { why: localize("retrieval-browse.findin.read_another_shape", "the read answered another shape than events R49's") };
  return { items: a.items, truncated: a.truncated === true };
}

/* R1: how a recorded item's extent (content's canonical form, or an extent object) stands to a match's. */
function relationOf(match, extent) {
  const e = typeof extent === "string" ? safeJson(extent) : extent;
  try { return extentRelation(match, e); } catch { return "unreadable"; }
}

/* A reading's `cells` split by what holds them: a workbook's sheets (by name) and a document's tables (N724; by
   their `doc-table` ordinal, each table's cells all naming that table), in table order. */
function heldCells(cells) {
  const sheets = new Set(), tables = [];
  for (const [name, list] of Object.entries(cells || {})) {
    if (!Array.isArray(list)) continue;
    const src = list.map((c) => (c && c.source && typeof c.source === "object" ? c.source : null));
    const table = src.length && src[0] && src[0].kind === "doc-table" && Number.isInteger(src[0].table) ? src[0].table : null;
    if (table !== null && src.every((x) => x && x.kind === "doc-table" && x.table === table)) tables.push({ table, ref: name, cells: list });
    else sheets.add(name);
  }
  return { sheets, tables: tables.sort((a, b) => a.table - b.table) };
}

/* N758 (K2118, K2197): the paragraph units (`doc-para`) of the cells a document table's date or amount columns took,
   which are not matched again. Each cell names the ordinals of the paragraphs its text was read from (`paras`,
   office-readers R11, carried by reading-pipeline R28), so its paragraphs are found exactly, a vertically merged cell's
   included, never by matching its lines. An ordinal naming no unit (a whitespace-only paragraph, or one the wire bound
   dropped) is passed over; a cell naming no `paras` (a reading made before N758) names no paragraph. */
function paragraphsOf(docTables, units) {
  const taken = new Set();
  for (const t of docTables)
    for (const x of t.done)
      for (const p of Array.isArray(x.cell.paras) ? x.cell.paras : []) if (Number.isInteger(p)) taken.add(p);
  return new Set(units.filter((u) => u.extentObj && u.extentObj.kind === "doc-para" && taken.has(u.extentObj.para)));
}
