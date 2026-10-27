/* register-readers R5–R8: a row's search terms, the closed filter over them, whether a filter may be watched unattended,
 * and a filter offered from what a project already names. One rule for the filter and the store: `matches` reads a row
 * only through `indexTerms`. Pure; never throws. */
import { isCalendarDate } from "../civil-time/index.mjs";
import { recognise } from "../idspaces.mjs";
import { sha256HexSync } from "../record-grammar/index.mjs";
import { columnsOf } from "./rows.mjs";

const isObj = (x) => x !== null && typeof x === "object" && !Array.isArray(x);
const isText = (x) => typeof x === "string";

/* ------------------------------------------------------------------ R5 tokens */

/** The tokens of a name: case-folded, diacritics stripped, punctuation removed, split on spaces and commas; a single
 *  letter (an initial) is not a token; suffixes and honorifics stay tokens. Sorted, without repeats. */
export function nameTokens(text) {
  if (!isText(text)) return [];
  const folded = text.normalize("NFKD").replace(/\p{M}+/gu, "").toLowerCase();
  const words = folded.split(/[\s,]+/u).map((w) => w.replace(/[^\p{L}\p{N}]+/gu, "")).filter((w) => w.length > 1);
  return [...new Set(words)].sort();
}

const fold = (text) => nameTokens(text).join(" ");

/* ------------------------------------------------------------------ R5 amounts */

const AMOUNT = /^(\()?\s*(-)?\s*(\p{Sc}?)\s*(-)?\s*(\d{1,3}(?:,\d{3})+|\d+)?(?:\.(\d+))?\s*(\))?$/u;

/** An amount read from text as one exact decimal `{units, scale}` (`units` an integer, the value `units / 10^scale`),
 *  or null. Parentheses or a leading minus make it negative; thousands commas are read only in threes. */
export function readAmount(text) {
  if (typeof text === "number") return Number.isFinite(text) ? readAmount(String(text)) : null;
  if (!isText(text)) return null;
  const m = AMOUNT.exec(text.trim());
  if (!m) return null;
  const [, open, minus1, , minus2, whole, frac, close] = m;
  if (!whole && !frac) return null;
  if (Boolean(open) !== Boolean(close)) return null;
  if ((open ? 1 : 0) + (minus1 ? 1 : 0) + (minus2 ? 1 : 0) > 1) return null;
  const digits = (whole ?? "0").replace(/,/g, "") + (frac ?? "");
  const units = BigInt(digits) * (open || minus1 || minus2 ? -1n : 1n);
  if (units > BigInt(Number.MAX_SAFE_INTEGER) || units < -BigInt(Number.MAX_SAFE_INTEGER)) return null;
  return { units: Number(units), scale: frac ? frac.length : 0 };
}

/* -1, 0 or 1 for two exact decimals. */
export function compareAmounts(a, b) {
  const s = Math.max(a.scale, b.scale);
  const x = BigInt(a.units) * 10n ** BigInt(s - a.scale), y = BigInt(b.units) * 10n ** BigInt(s - b.scale);
  return x < y ? -1 : x > y ? 1 : 0;
}

/* ------------------------------------------------------------------ R5 dates */

/* A column's `date_format`: `YYYY`, `MM` (two digits), `M` (one or two), `DD`, `D`, literal characters, and a final `*`
   for a remainder that is not read (a time after the date). The default is `YYYY-MM-DD`. */
const FORMAT_TOKEN = /YYYY|MM|M|DD|D|\*$|[^YMD*]/g;
const dateRules = new Map();
function dateRule(format) {
  const f = isText(format) && format ? format : "YYYY-MM-DD";
  if (dateRules.has(f)) return dateRules.get(f);
  let re = "^", order = [], ok = true, consumed = 0;
  for (const m of f.matchAll(FORMAT_TOKEN)) {
    const t = m[0];
    consumed += t.length;
    if (t === "YYYY") { re += "(\\d{4})"; order.push("y"); }
    else if (t === "MM") { re += "(\\d{2})"; order.push("m"); }
    else if (t === "M") { re += "(\\d{1,2})"; order.push("m"); }
    else if (t === "DD") { re += "(\\d{2})"; order.push("d"); }
    else if (t === "D") { re += "(\\d{1,2})"; order.push("d"); }
    else if (t === "*") { re += "(?:.*)"; }
    else re += t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  if (consumed !== f.length || order.sort().join("") !== "dmy") ok = false;
  const rule = ok ? { re: new RegExp(`${re}${f.endsWith("*") ? "" : "$"}`, "s"), order: [...f.matchAll(/YYYY|MM|M|DD|D/g)].map((x) => x[0][0].toLowerCase()) } : null;
  dateRules.set(f, rule);
  return rule;
}

/** A civil date `YYYY-MM-DD` read from text by a `date_format`, or null. */
export function readDate(text, format) {
  if (!isText(text)) return null;
  const rule = dateRule(format);
  if (!rule) return null;
  const m = rule.re.exec(text.trim());
  if (!m) return null;
  const v = {};
  rule.order.forEach((k, i) => { v[k] = m[i + 1]; });
  const day = `${v.y}-${v.m.padStart(2, "0")}-${v.d.padStart(2, "0")}`;
  return isCalendarDate(day) ? day : null;
}

/* ------------------------------------------------------------------ R5 indexTerms */

const ZIP5 = /^(\d{5})(?:-?\d{4})?$/;
const cellText = (v) => (isText(v) ? v : null);

/** R5. The search terms of a row's kept cells. A withheld cell (R4) gives no term. */
export function indexTerms(kept, definition) {
  const t = { name_tokens: [], org_tokens: [], amount: null, date: null, filer_id: null, form: null,
    licence_no: null, docket_no: null, company_no: null, place: { city: null, state: null, zip5: null }, undetermined: [] };
  try {
    if (!isObj(kept)) return t;
    const names = new Set(), orgs = new Set();
    const firsts = new Set();
    for (const c of columnsOf(definition)) {
      if (!Object.hasOwn(kept, c.name)) continue;
      const v = cellText(kept[c.name]);
      if (v === null) continue;
      const blank = v.trim() === "";
      const first = !firsts.has(c.role);
      if (c.role === "name") nameTokens(v).forEach((x) => names.add(x));
      else if (c.role === "organization") nameTokens(v).forEach((x) => orgs.add(x));
      else if (blank) continue;
      else if (c.role === "amount") {
        const a = readAmount(v);
        if (!a) t.undetermined.push(c.name);
        else if (first) t.amount = { ...a, currency: isText(c.currency) ? c.currency : isText(definition.currency) ? definition.currency : null };
      } else if (c.role === "date") {
        const d = readDate(v, c.date_format);
        if (!d) t.undetermined.push(c.name);
        else if (first) t.date = d;
      } else if (["filer_id", "form", "licence_no", "docket_no", "company_no"].includes(c.role)) {
        if (first) t[c.role] = v.trim();
      } else if (c.role === "city" || c.role === "state") {
        if (first) t.place[c.role] = fold(v) || null;
      } else if (c.role === "zip5") {
        const z = ZIP5.exec(v.trim());
        if (!z) t.undetermined.push(c.name);
        else if (first) t.place.zip5 = z[1];
      } else continue;
      firsts.add(c.role);
    }
    t.name_tokens = [...names].sort();
    t.org_tokens = [...orgs].sort();
  } catch { /* the terms read so far */ }
  return t;
}

/* ------------------------------------------------------------------ R6 the filter */

export const CRITERIA = Object.freeze(["names", "organizations", "amount", "date", "filer_ids", "forms", "places", "licence_numbers", "docket_numbers"]);
const LIST_ROLE = { names: "name", organizations: "organization", filer_ids: "filer_id", forms: "form", licence_numbers: "licence_no", docket_numbers: "docket_no" };
const ID_SPACE = { filer_ids: "person", licence_numbers: "person", docket_numbers: "proceeding" };
const PLACE_FIELDS = ["city", "state", "zip5"];
export const NAMES_MAX = 1000, IDS_MAX = 500;
/* A wildcard or regular-expression character: a name or a number never holds one (K1484). */
const PATTERN = /[*?%[\]^$|\\{}]|\.\*|\.\+/;

const refuse = (code, field) => ({ ok: false, code, field });
const present = (f, k) => Object.hasOwn(f, k) && f[k] !== undefined;
const decimalOf = (v) => (typeof v === "number" ? (Number.isFinite(v) ? readAmount(String(v)) : null) : isText(v) && /^\s*-?\d+(\.\d+)?\s*$/.test(v) ? readAmount(v) : null);

/** R6. `validateFilter(filter, definition, view)`: `{ok: true, filter}` or `{ok: false, code, field}`. `view` is the
 *  jurisdiction view an id is recognised in (`id-spaces.recognise`); with no view an id is not checked against a form. */
export function validateFilter(filter, definition, view) {
  try {
    if (!isObj(filter)) return refuse("FILTER_VALUE_INVALID", "filter");
    const roles = new Set(columnsOf(definition).map((c) => c.role));
    for (const k of Object.keys(filter)) if (!CRITERIA.includes(k)) return refuse("FILTER_CRITERION_UNKNOWN", k);
    for (const k of ["names", "organizations"]) if (Array.isArray(filter[k]) && filter[k].length > NAMES_MAX) return refuse("FILTER_TOO_LARGE", k);
    const ids = ["filer_ids", "licence_numbers", "docket_numbers"];
    for (const k of ids) if (Array.isArray(filter[k]) && filter[k].length > IDS_MAX) return refuse("FILTER_TOO_LARGE", k);
    if (ids.reduce((n, k) => n + (Array.isArray(filter[k]) ? filter[k].length : 0), 0) > IDS_MAX) return refuse("FILTER_TOO_LARGE", ids.find((k) => Array.isArray(filter[k])));
    const out = {};
    for (const k of CRITERIA) {
      if (!present(filter, k)) continue;
      const v = filter[k];
      if (Object.hasOwn(LIST_ROLE, k)) {
        if (!roles.has(LIST_ROLE[k])) return refuse("FILTER_ROLE_ABSENT", k);
        if (!Array.isArray(v) || !v.length || !v.every(isText)) return refuse("FILTER_VALUE_INVALID", k);
        if (v.some((x) => PATTERN.test(x))) return refuse("FILTER_PATTERN_REFUSED", k);
        const items = v.map((x) => x.trim());
        if (k === "names" || k === "organizations") {
          if (items.some((x) => x.length < 2 || !nameTokens(x).length)) return refuse("FILTER_VALUE_INVALID", k);
        } else if (items.some((x) => !x)) return refuse("FILTER_VALUE_INVALID", k);
        if (Object.hasOwn(ID_SPACE, k) && view != null && items.some((x) => recognise(view, ID_SPACE[k], x) === null)) return refuse("FILTER_VALUE_INVALID", k);
        out[k] = items;
      } else if (k === "amount") {
        if (!roles.has("amount")) return refuse("FILTER_ROLE_ABSENT", k);
        if (!isObj(v) || !Object.keys(v).length || Object.keys(v).some((x) => x !== "min" && x !== "max")) return refuse("FILTER_VALUE_INVALID", k);
        if (Object.values(v).some((x) => isText(x) && PATTERN.test(x))) return refuse("FILTER_PATTERN_REFUSED", k);
        const min = present(v, "min") ? decimalOf(v.min) : undefined, max = present(v, "max") ? decimalOf(v.max) : undefined;
        if (min === null || max === null) return refuse("FILTER_VALUE_INVALID", k);
        if (min && max && compareAmounts(min, max) > 0) return refuse("FILTER_VALUE_INVALID", k);
        out.amount = {};
        if (min) out.amount.min = String(v.min).trim();
        if (max) out.amount.max = String(v.max).trim();
      } else if (k === "date") {
        if (!roles.has("date")) return refuse("FILTER_ROLE_ABSENT", k);
        if (!isObj(v) || !Object.keys(v).length || Object.keys(v).some((x) => x !== "from" && x !== "to")) return refuse("FILTER_VALUE_INVALID", k);
        if (Object.values(v).some((x) => isText(x) && PATTERN.test(x))) return refuse("FILTER_PATTERN_REFUSED", k);
        if (Object.values(v).some((x) => !isText(x) || !isCalendarDate(x))) return refuse("FILTER_VALUE_INVALID", k);
        if (v.from && v.to && v.from > v.to) return refuse("FILTER_VALUE_INVALID", k);
        out.date = { ...v };
      } else if (k === "places") {
        if (!Array.isArray(v) || !v.length || !v.every(isObj)) return refuse("FILTER_VALUE_INVALID", k);
        const places = [];
        for (const p of v) {
          const keys = Object.keys(p);
          if (!keys.length || keys.some((x) => !PLACE_FIELDS.includes(x))) return refuse("FILTER_VALUE_INVALID", k);
          for (const x of keys) if (!roles.has(x)) return refuse("FILTER_ROLE_ABSENT", k);
          if (keys.some((x) => !isText(p[x]))) return refuse("FILTER_VALUE_INVALID", k);
          if (keys.some((x) => PATTERN.test(p[x]))) return refuse("FILTER_PATTERN_REFUSED", k);
          if (keys.includes("zip5") && !/^\d{5}$/.test(p.zip5.trim())) return refuse("FILTER_VALUE_INVALID", k);
          if (keys.some((x) => x !== "zip5" && !fold(p[x]))) return refuse("FILTER_VALUE_INVALID", k);
          const q = {};
          for (const x of keys) q[x] = p[x].trim();
          places.push(q);
        }
        out.places = places;
      }
    }
    return { ok: true, filter: out };
  } catch {
    return refuse("FILTER_VALUE_INVALID", "filter");
  }
}

/* Whether a row's terms meet a filter, and whether a criterion could not be judged on an undetermined value. */
export function judge(terms, filter, definition) {
  if (!isObj(filter)) return { match: false, undetermined: false };
  const undet = new Set(terms.undetermined);
  const roleUndetermined = (role) => columnsOf(definition).some((c) => c.role === role && undet.has(c.name));
  let undetermined = false;
  const holds = (k) => {
    const v = filter[k];
    switch (k) {
      case "names": case "organizations": {
        const have = new Set(k === "names" ? terms.name_tokens : terms.org_tokens);
        return v.some((x) => { const want = nameTokens(x); return want.length > 0 && want.every((w) => have.has(w)); });
      }
      case "filer_ids": return terms.filer_id !== null && v.some((x) => x.trim() === terms.filer_id);
      case "forms": return terms.form !== null && v.some((x) => x.trim() === terms.form);
      case "licence_numbers": return terms.licence_no !== null && v.some((x) => x.trim() === terms.licence_no);
      case "docket_numbers": return terms.docket_no !== null && v.some((x) => x.trim() === terms.docket_no);
      case "amount": {
        if (!terms.amount) { if (roleUndetermined("amount")) undetermined = true; return false; }
        const min = v.min !== undefined ? decimalOf(v.min) : null, max = v.max !== undefined ? decimalOf(v.max) : null;
        return (!min || compareAmounts(terms.amount, min) >= 0) && (!max || compareAmounts(terms.amount, max) <= 0);
      }
      case "date": {
        if (!terms.date) { if (roleUndetermined("date")) undetermined = true; return false; }
        return (!v.from || terms.date >= v.from) && (!v.to || terms.date <= v.to);
      }
      case "places":
        return v.some((p) => Object.keys(p).every((x) => (x === "zip5" ? terms.place.zip5 === p.zip5.trim() : terms.place[x] !== null && terms.place[x] === fold(p[x]))));
      default: return false;
    }
  };
  let match = true;
  for (const k of CRITERIA) {
    if (!present(filter, k)) continue;
    if (!holds(k)) match = false;
  }
  return { match, undetermined: !match && undetermined };
}

/** R6. `matches(row, filter, definition)`: true when every present criterion holds. `row` is a row's kept cells, or an
 *  object holding them as `kept` or `cells`. Never throws. */
export function matches(row, filter, definition) {
  try {
    const kept = isObj(row) && isObj(row.kept) ? row.kept : isObj(row) && isObj(row.cells) ? row.cells : row;
    if (!isObj(kept) || !isObj(filter)) return false;
    return judge(indexTerms(kept, definition), filter, definition).match;
  } catch {
    return false;
  }
}

/* The canonical form of a value: object keys sorted, lists sorted and without repeats, names token-normalised. */
function canonical(v, key) {
  if (Array.isArray(v)) {
    const items = v.map((x) => (key === "names" || key === "organizations") && isText(x) ? fold(x) : canonical(x, null));
    const seen = new Map();
    for (const x of items) seen.set(JSON.stringify(x), x);
    return [...seen.keys()].sort().map((k) => seen.get(k));
  }
  if (isObj(v)) {
    const o = {};
    for (const k of Object.keys(v).sort()) if (v[k] !== undefined) o[k] = canonical(v[k], k);
    return o;
  }
  return isText(v) ? v.trim() : v;
}

/** R6. The SHA-256 (hex) of a filter's canonical JSON; null for a value that is not an object. Never throws. */
export function filterFingerprint(filter) {
  try {
    if (!isObj(filter)) return null;
    return sha256HexSync(JSON.stringify(canonical(filter, null)));
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ R7 */

const nonEmpty = (v) => (Array.isArray(v) ? v.length > 0 : isObj(v) ? Object.keys(v).length > 0 : v !== undefined && v !== null);

/** R7. True exactly when the filter holds no names and no organizations and at least one other criterion. */
export function autoWatchable(filter) {
  try {
    if (!isObj(filter)) return false;
    if (nonEmpty(filter.names) || nonEmpty(filter.organizations)) return false;
    return CRITERIA.some((k) => k !== "names" && k !== "organizations" && nonEmpty(filter[k]));
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ R8 */

/* The criterion an identifier scheme's values fill (the scheme names are `jurisdictions` R130's). */
const SCHEME_CRITERION = { filer: "filer_ids", committee: "filer_ids", licence: "licence_numbers", docket: "docket_numbers" };

/** R8. A filter offered from a project's facts: `{filter, basis, left_out}`. Only subjects, identifiers and a period are
 *  read; nothing else a fact holds is copied. Never throws. */
export function prefillFrom(facts, definition) {
  const filter = {}, basis = [], left_out = [];
  try {
    if (!isObj(facts)) return { filter, basis, left_out };
    const roles = new Set(columnsOf(definition).map((c) => c.role));
    const schemes = isObj(definition) && Array.isArray(definition.schemes) ? definition.schemes : [];
    const add = (k, value, fact) => {
      (filter[k] ??= []);
      if (!filter[k].includes(value)) filter[k].push(value);
      basis.push({ criterion: k, value, fact });
    };
    for (const s of Array.isArray(facts.subjects) ? facts.subjects : []) {
      if (!isObj(s) || !isText(s.label) || nameTokens(s.label).length === 0) continue;
      const k = s.kind === "person" ? "names" : s.kind === "organization" ? "organizations" : null;
      if (!k) continue;
      const fact = { subject: { kind: s.kind, label: s.label } };
      if (roles.has(k === "names" ? "name" : "organization")) add(k, s.label.trim(), fact);
      else left_out.push({ criterion: k, fact, why: "role_absent" });
    }
    for (const id of Array.isArray(facts.identifiers) ? facts.identifiers : []) {
      if (!isObj(id) || !isText(id.scheme) || !(isText(id.value) || typeof id.value === "number")) continue;
      const k = Object.hasOwn(SCHEME_CRITERION, id.scheme) ? SCHEME_CRITERION[id.scheme] : null;
      if (!k) continue;
      const value = String(id.value).trim();
      const fact = { identifier: { scheme: id.scheme, value } };
      if (!schemes.includes(id.scheme)) left_out.push({ criterion: k, fact, why: "scheme_not_issued" });
      else if (!roles.has(LIST_ROLE[k])) left_out.push({ criterion: k, fact, why: "role_absent" });
      else add(k, value, fact);
    }
    const p = facts.period;
    if (isObj(p) && (isCalendarDate(p.from) || isCalendarDate(p.to))) {
      const date = {};
      if (isCalendarDate(p.from)) date.from = p.from;
      if (isCalendarDate(p.to)) date.to = p.to;
      const fact = { period: { ...date } };
      if (date.from && date.to && date.from > date.to) { /* not a period */ }
      else if (roles.has("date")) { filter.date = date; basis.push({ criterion: "date", value: { ...date }, fact }); }
      else left_out.push({ criterion: "date", fact, why: "role_absent" });
    }
  } catch { /* what was offered so far */ }
  return { filter, basis, left_out };
}
