/* The answer contract and its checks (R3–R6, R22; ladders §9.4 L1, §10 "Closed-book answers"). `checkAnswer` is the
 * one door an answer passes before a member sees it: a malformed answer is refused whole (R3, R6); otherwise each
 * sentence failing a check is withheld, never rewritten (R4), every rule item must be one of R7's answers in the read
 * log (R22), and where the log holds nothing every sentence but an absence is withheld (R5). Pure over its arguments:
 * it writes nothing (the counts are R13's, recorded by its caller) and never throws.
 *
 * Shapes (J1 (7)): a sentence's `support` names `h<i>`, `r<i>` or `l<i>`, 1-based positions in `holdings`, `rules` and
 * `looks`; `summary` is null or `{text, rests_on: ["s<i>"]}`; a rule item is `{rule_id, service, value, label, quote?,
 * reading?, limits?}`, `rule_id` the id the read log gave that R7 answer. */

import { canonicalJson } from "../record-grammar/index.mjs";
import { parseFigure } from "../calc-grammar/index.mjs";
import { OBSERVATION_LEVELS, OBSERVATION_STATES } from "../observation-log/index.mjs";
import { ANSWERS_CHECKS, refusal } from "./checks.mjs";
import { ReadLog, textOf } from "./readlog.mjs";

/** R3: the answer's fields, in order. */
export const ANSWER_FIELDS = Object.freeze(["question_as_read", "clarifying", "summary", "sentences", "holdings", "rules",
  "looks", "bound", "truncated", "out_of_view", "lens", "not_established", "query", "next_acts", "label"]);
/** R3: a sentence's kinds. */
export const SENTENCE_KINDS = Object.freeze(["quote", "list", "figure", "absence", "rule", "explain"]);
/** R6: a rule item's labels. */
export const RULE_LABELS = Object.freeze(["legal_information", "procedural_fact", "computed_fact"]);
/** R3: the label every answer carries. */
export const ANSWER_LABEL = "machine work";
/** R4: the levels and the five absence terms are observation-log's. */
export const LEVELS = Object.freeze(Object.keys(OBSERVATION_LEVELS));
export const ABSENCE_TERMS = Object.freeze(Object.keys(OBSERVATION_STATES));

const RULE_ITEM_KEYS = ["rule_id", "service", "value", "label", "quote", "reading", "limits"];
const SEP = "\u0000";
const plain = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const filled = (v) => typeof v === "string" && v.trim() !== "";

/* ---- R3, R6: the shape ---- */

function malformed(field, detail) { return refusal("ANSWER_MALFORMED", detail, { field }); }

function onlyKeys(o, keys, field) {
  for (const k of Object.keys(o)) if (!keys.includes(k)) return malformed(`${field}.${k}`, `${field} carries a field the contract has no place for: ${k}`);
  return null;
}

/** R3, R6: null for an answer of the contract's shape, else `ANSWER_MALFORMED` naming the field. */
export function shapeRefusal(a) {
  if (!plain(a)) return malformed("answer", "an answer is an object");
  for (const k of Object.keys(a)) if (!ANSWER_FIELDS.includes(k)) return malformed(k, `the answer carries a field the contract has no place for: ${k}`);
  for (const k of ANSWER_FIELDS) if (!(k in a)) return malformed(k, `the answer has no ${k}`);
  if (!filled(a.question_as_read)) return malformed("question_as_read", "the question as read is a non-empty string");
  if (a.clarifying !== null && !(filled(a.clarifying) && (a.clarifying.match(/\?/g) || []).length <= 1))
    return malformed("clarifying", "clarifying is null or exactly one question");
  if (!Array.isArray(a.sentences)) return malformed("sentences", "sentences is a list");
  if (!Array.isArray(a.holdings)) return malformed("holdings", "holdings is a list");
  if (!Array.isArray(a.rules)) return malformed("rules", "rules is a list");
  if (!Array.isArray(a.looks)) return malformed("looks", "looks is a list");
  const n = { h: a.holdings.length, r: a.rules.length, l: a.looks.length, s: a.sentences.length };
  const inRange = (id, kinds) => { const m = /^([hrls])([1-9]\d*)$/.exec(typeof id === "string" ? id : "");
    return !!m && kinds.includes(m[1]) && Number(m[2]) <= n[m[1]]; };
  if (a.clarifying !== null && (a.summary !== null || a.sentences.length))
    return malformed("clarifying", "an answer asking a clarifying question has no summary and no sentences");
  if (a.summary !== null) {
    if (!plain(a.summary)) return malformed("summary", "the summary is null or {text, rests_on}");
    const k = onlyKeys(a.summary, ["text", "rests_on"], "summary"); if (k) return k;
    if (!filled(a.summary.text)) return malformed("summary.text", "the summary is one line of text");
    if (/\n/.test(a.summary.text)) return malformed("summary.text", "the summary is one line");
    if (!Array.isArray(a.summary.rests_on) || !a.summary.rests_on.length || !a.summary.rests_on.every((id) => inRange(id, ["s"])))
      return malformed("summary.rests_on", "the summary names the sentences it rests on, as s<i>");
  }
  for (const [i, s] of a.sentences.entries()) {
    const f = `sentences[${i}]`;
    if (!plain(s)) return malformed(f, "a sentence is {text, kind, support}");
    const k = onlyKeys(s, ["text", "kind", "support"], f); if (k) return k;
    if (!filled(s.text)) return malformed(`${f}.text`, "a sentence's text is a non-empty string");
    if (!SENTENCE_KINDS.includes(s.kind)) return malformed(`${f}.kind`, `a sentence's kind is one of ${SENTENCE_KINDS.join(", ")}`);
    if (!Array.isArray(s.support) || !s.support.every((id) => inRange(id, ["h", "r", "l"])))
      return malformed(`${f}.support`, "a sentence's support names holdings, rule items or looks as h<i>, r<i>, l<i>");
  }
  for (const [i, h] of a.holdings.entries()) {
    const f = `holdings[${i}]`;
    if (!plain(h)) return malformed(f, "a holding is {address, quote}");
    const k = onlyKeys(h, ["address", "quote"], f); if (k) return k;
    if (!filled(h.address)) return malformed(`${f}.address`, "a holding names its address");
    if (typeof h.quote !== "string" || h.quote === "") return malformed(`${f}.quote`, "a holding carries its quote");
  }
  for (const [i, r] of a.rules.entries()) {
    const f = `rules[${i}]`;
    if (!plain(r)) return malformed(f, "a rule item is {rule_id, service, value, label, ...}");
    const k = onlyKeys(r, RULE_ITEM_KEYS, f); if (k) return k;
    if (!filled(r.rule_id)) return malformed(`${f}.rule_id`, "a rule item names the rule service's answer it is");
    if (!filled(r.service)) return malformed(`${f}.service`, "a rule item names its service");
    if (!("value" in r)) return malformed(`${f}.value`, "a rule item carries its value");
    if (!RULE_LABELS.includes(r.label)) return malformed(`${f}.label`, `a rule item's label is one of ${RULE_LABELS.join(", ")}`);
    if (r.label === "legal_information" && !filled(r.quote))
      return malformed(`${f}.quote`, "a reading of held law carries its quote beside it");
  }
  for (const [i, l] of a.looks.entries()) {
    const f = `looks[${i}]`;
    if (!plain(l)) return malformed(f, "a look is {level, state}");
    const k = onlyKeys(l, ["level", "state"], f); if (k) return k;
  }
  if (a.bound !== null && !plain(a.bound)) return malformed("bound", "bound is null or the bounds applied");
  if (typeof a.truncated !== "boolean") return malformed("truncated", "truncated is true or false");
  if (typeof a.out_of_view !== "boolean") return malformed("out_of_view", "out_of_view is true or false");
  if (!(a.lens === null || typeof a.lens === "string" || plain(a.lens))) return malformed("lens", "lens is null, a name or the lens");
  if (!Array.isArray(a.not_established)) return malformed("not_established", "not_established is a list");
  if (!(a.query === null || typeof a.query === "string")) return malformed("query", "query is null or the query run");
  if (!Array.isArray(a.next_acts) || !a.next_acts.every(filled)) return malformed("next_acts", "next_acts lists acts by their catalogue ids");
  if (a.label !== ANSWER_LABEL) return malformed("label", `an answer is labelled "${ANSWER_LABEL}"`);
  return null;
}

/* ---- R4: figures ---- */

const DATE = /\b\d{4}-\d{2}-\d{2}(?:T[\d:.]+Z?)?\b/g;
const ADDRESS = /\b[A-Z]{2,6}-\d{4}-[A-Za-z0-9-]+|\b[0-9a-f]{64}\b|\b(?:rule|occurrence):[^\s,;]+/g;
const QUOTED = /"[^"]*"|“[^”]*”|«[^»]*»/g;
const FIGURE = /(?:about |approximately |nearly |over |~)?(?:[$€£]\s?|\b(?:USD|EUR|GBP|CAD) ?)?\(?-?\d[\d,]*(?:\.\d+)?\)?(?: ?(?:%|percent\b|thousand\b|million\b|billion\b|trillion\b))?/g;

/** The figures a text states outside its quotes (a date, a time, a record address and a section number are not
 *  figures; a bare four-digit year is read as a date). */
export function figuresIn(text, quotes = []) {
  let t = String(text);
  for (const q of quotes) if (q) t = t.split(q).join(" ");
  t = t.replace(QUOTED, " ").replace(DATE, " ").replace(ADDRESS, " ").replace(/\b\d{1,2}:\d{2}\b/g, " ");
  const out = [];
  for (const m of t.matchAll(FIGURE)) {
    const tok = m[0].trim();
    const before = t.slice(Math.max(0, m.index - 2), m.index);
    const after = t.slice(m.index + m[0].length, m.index + m[0].length + 1);
    if ((/[§#]\s?$/.test(before) || /[A-Za-z.]$/.test(before)) && !/[$€£(]/.test(tok[0])) continue;
    if (/[A-Za-z]/.test(after)) continue;
    if (/^\d{4}$/.test(tok) && Number(tok) >= 1800 && Number(tok) <= 2199) continue;
    const f = parseFigure(tok);
    if (f && typeof f.value === "string") out.push(f);
  }
  return out;
}

/* A decimal string in one spelling: no sign, no leading or trailing zeros. */
function norm(v) {
  let s = String(v).replace(/^[+-]/, "");
  if (!/^\d+(\.\d+)?$/.test(s)) return null;
  let [i, f = ""] = s.split(".");
  i = i.replace(/^0+(?=\d)/, ""); f = f.replace(/0+$/, "");
  return f ? `${i}.${f}` : i;
}
/* Shift a decimal by `k` places (×10^k). */
function shift(v, k) {
  const n = norm(v); if (n === null) return null;
  let [i, f = ""] = n.split(".");
  if (k > 0) { f = f.padEnd(k, "0"); i = i + f.slice(0, k); f = f.slice(k); }
  else { const m = -k; i = i.padStart(m + 1, "0"); f = i.slice(i.length - m) + f; i = i.slice(0, i.length - m); }
  return norm(`${i}${f ? `.${f}` : ""}`);
}

/** The figures a cited object states: its numbers and its numeric strings, deep. */
function sourceFigures(v, out = new Set()) {
  if (typeof v === "number" && Number.isFinite(v)) { const n = norm(String(Math.abs(v))); if (n !== null) out.add(n); }
  else if (typeof v === "string") {
    if (/^[+-]?\d[\d,]*(\.\d+)?$/.test(v.trim())) { const n = norm(v.trim().replace(/,/g, "")); if (n !== null) out.add(n); }
    else { const f = /\d/.test(v) && v.length <= 40 ? parseFigure(v) : null; if (f && typeof f.value === "string") out.add(norm(f.value)); }
  } else if (Array.isArray(v)) for (const x of v) sourceFigures(x, out);
  else if (plain(v)) for (const x of Object.values(v)) sourceFigures(x, out);
  return out;
}

function figureSourced(f, sources) {
  const v = norm(f.value);
  if (v === null) return false;
  if (sources.has(v)) return true;
  if (f.unit === "percent") { const r = shift(v, -2); if (r !== null && sources.has(r)) return true; }
  return false;
}

/* ---- R4, R5, R22: the checks ---- */

const isFigureAddress = (a) => /^(CALC|MNY)-\d{4}-/.test(a);
const valueEqual = (a, b) => { try { return canonicalJson(a ?? null) === canonicalJson(b ?? null); } catch { return false; } };

/** R22: whether a rule item is one of R7's answers in the log, unchanged. */
function rulePlane(item, log) {
  const held = log.rule(item.rule_id);
  if (!held || held.ok === false || held.not_held) return false;
  if (held.service !== item.service || held.label !== item.label || !valueEqual(held.value, item.value)) return false;
  if (item.quote !== undefined && (typeof item.quote !== "string" || item.quote.includes(SEP) || !textOf(held).includes(item.quote))) return false;
  if (held.quote_only === true && item.reading !== undefined) return false;
  return true;
}

function holdingRead(h, log) {
  if (h.quote.includes(SEP)) return false;
  return log.objectsAt(h.address).some((o) => textOf(o).includes(h.quote));
}

const lookFault = (l) => !l || !LEVELS.includes(l.level) || !ABSENCE_TERMS.includes(l.state);

/** R4: `checkAnswer(answer, {readLog, viewer})` → `{ok: true, answer, withheld}`, or `ANSWER_MALFORMED` with nothing
 *  shown. A log asked under another viewer is read as empty (fail closed). Never throws. */
export function checkAnswer(answer, { readLog = null, viewer = null } = {}) {
  try {
    const bad = shapeRefusal(answer);
    if (bad) return bad;
    const log = readLog instanceof ReadLog && (readLog.viewer === null || readLog.viewer === viewer) ? readLog : new ReadLog({ viewer });
    const withheld = [];
    const out = JSON.parse(JSON.stringify(answer));
    const say = (code) => ANSWERS_CHECKS[code].translation;
    /* the items themselves: a holding not read, a rule item not the plane's, a look with no level */
    const holdOk = answer.holdings.map((h) => holdingRead(h, log));
    const ruleOk = answer.rules.map((r) => rulePlane(r, log));
    const lookOk = answer.looks.map((l) => !lookFault(l));
    const at = (id) => { const m = /^([hrl])(\d+)$/.exec(id); return { kind: m[1], i: Number(m[2]) - 1 }; };
    const sentenceCode = (s) => {
      const sup = s.support.map(at);
      const hs = sup.filter((x) => x.kind === "h"), rs = sup.filter((x) => x.kind === "r"), ls = sup.filter((x) => x.kind === "l");
      if (s.kind === "absence") {
        if (!ls.length || ls.some((x) => !lookOk[x.i])) return "ANSWER_ABSENCE_WITHOUT_LEVEL";
      } else if (s.kind === "rule" && !rs.length) return "ANSWER_RULE_NOT_PLANE";   /* R22: a rule only through R7 */
      else if (log.empty || !sup.length) return "ANSWER_CITES_UNREAD";   /* R5: it rests on no read */
      if (hs.some((x) => !holdOk[x.i])) return "ANSWER_CITES_UNREAD";
      if (s.kind === "quote" && !hs.length) return "ANSWER_CITES_UNREAD";
      if (rs.some((x) => !ruleOk[x.i])) return "ANSWER_RULE_NOT_PLANE";
      if (s.kind === "rule" && !rs.length) return "ANSWER_RULE_NOT_PLANE";
      if (ls.some((x) => !lookOk[x.i])) return "ANSWER_ABSENCE_WITHOUT_LEVEL";
      const quotes = [...hs.map((x) => answer.holdings[x.i].quote), ...rs.map((x) => answer.rules[x.i].quote)];
      const figs = figuresIn(s.text, quotes);
      if (figs.length) {
        const sources = new Set();
        for (const x of hs) { const h = answer.holdings[x.i]; if (isFigureAddress(h.address)) for (const o of log.objectsAt(h.address)) sourceFigures(o, sources); }
        for (const x of rs) { const r = answer.rules[x.i]; if (r.label === "computed_fact") sourceFigures(log.rule(r.rule_id)?.value, sources); }
        if (figs.some((f) => !figureSourced(f, sources))) return "ANSWER_FIGURE_UNSOURCED";
      }
      return null;
    };
    const kept = new Set();
    out.sentences = answer.sentences.map((s, i) => {
      const code = sentenceCode(s);
      if (code) { withheld.push({ sentence: `s${i + 1}`, code, translation: say(code) }); return null; }
      kept.add(`s${i + 1}`);
      return out.sentences[i];
    });
    answer.holdings.forEach((_, i) => { if (!holdOk[i]) { out.holdings[i] = null; withheld.push({ holding: `h${i + 1}`, code: "ANSWER_CITES_UNREAD", translation: say("ANSWER_CITES_UNREAD") }); } });
    answer.rules.forEach((_, i) => { if (!ruleOk[i]) { out.rules[i] = null; withheld.push({ rule: `r${i + 1}`, code: "ANSWER_RULE_NOT_PLANE", translation: say("ANSWER_RULE_NOT_PLANE") }); } });
    answer.looks.forEach((_, i) => { if (!lookOk[i]) { out.looks[i] = null; withheld.push({ look: `l${i + 1}`, code: "ANSWER_ABSENCE_WITHOUT_LEVEL", translation: say("ANSWER_ABSENCE_WITHOUT_LEVEL") }); } });
    if (answer.summary && answer.summary.rests_on.some((id) => !kept.has(id))) {
      const first = withheld.find((w) => answer.summary.rests_on.includes(w.sentence));
      out.summary = null;
      withheld.push({ summary: true, code: first.code, translation: first.translation });
    }
    if (answer.clarifying === null && answer.sentences.length && !kept.size) {
      out.summary = null;
      out.not_established = [...out.not_established,
        { withheld: answer.sentences.length, codes: [...new Set(withheld.filter((w) => w.sentence).map((w) => w.code))] }];
    }
    return { ok: true, answer: out, withheld };
  } catch (e) {
    return malformed("answer", `the answer could not be read: ${String(e && e.message || e).slice(0, 120)}`);
  }
}
