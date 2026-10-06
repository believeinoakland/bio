/* The jurisdiction profiles: every local fact the product uses, held as data, each with the
 * measurement it rests on (`build/requirements/jurisdictions.md`; `build/layers.md`, "No jurisdiction
 * in the product"). This file names no place: only the data files under ./profiles/ do.
 *
 * PURE (R17): no store, no network, no clock. What `get` and `combine` return is the caller's own
 * copy (R18). No service treats a profile by its identity (R20): `id`, `name` and `covers` are read
 * only to be reported back.
 *
 * Services: list() · get(id) · validate(profile) · combine(list). */
import FIRST from "./profiles/oakland-alameda.mjs";
import TEST from "./profiles/test-port-ellery.mjs";
import { BASIS_GRADES } from "../bio-plane/src/record-grammar/index.mjs";

/* ------------------------------------------------------------------------------------------------ */
/* The profile's shape (R1–R7, R23–R26, R31–R33, R39–R44; `locale` and `systems[].links`, N77 and N96). */

export const SECTIONS = Object.freeze(["id", "name", "covers", "test", "spaces", "systems", "mixed_hosts",
  "crosswalks", "vocabulary", "practice", "search_terms", "records_laws", "standard_sources",
  "counterparties", "action_kinds", "deadlines", "legal_organisations", "holidays", "locale", "time_zone",
  /* T33 (R46–R54) */
  "weekend", "computation", "fiscal_year", "law_ranks", "instrument_key", "proceeding_kinds", "proceeding_flows",
  "identifier_schemes", "classification_schemes", "lawful_demands", "recurrences"]);
/* R3: `account`, `object`, `vendor`, `proceeding` (K1452) and `person` (one form per person scheme) are T33's. */
export const SPACES = Object.freeze(["enactment", "project", "fund", "parcel", "account", "object", "vendor", "proceeding", "person"]);
export const VOCABULARY = Object.freeze(["furniture", "bodies", "member_titles", "enactment_markers", "codes",
  "file_numbers", "report_titles", "report_sections", "recommendation_openers", "template_blanks",
  /* T33 (R6): LAW's amending clauses, Legistar's markers and body-variant map, the roster words */
  "amending", "meeting_markers", "body_variants", "roster_words", "roster_headers", "staff_titles",
  /* (K1513) the budget and financial-report readers' words */
  "financial_report_titles", "budget_book_titles", "financial_headings", "fiscal_year_forms", "budget_headers"]);
/* R31: the one vocabulary of a law's level, for records laws, standard sources and an action's governing
   laws. An office's level (R24) is not a law's level and keeps its own. */
export const LAW_LEVELS = Object.freeze(["federal", "state", "county", "city"]);
export const COUNTERPARTY_LEVELS = Object.freeze(["state", "county", "city", "district"]);
export const SOURCE_KINDS = Object.freeze(["statute", "regulation", "ordinance", "court", "policy", "commitment"]);
export const VENUE_HOW = Object.freeze(["portal", "mail", "email", "in_person", "court"]);
export const COUNTS = Object.freeze(["calendar", "business"]);
/* R26: the event a period runs from; `entered`, `served` and `hearing` are COURTS'. `received` is the counterparty's
   receipt of the group's request, counted from the group's own `sent` entry (§7 item 1). */
export const STARTS = Object.freeze(["received", "filed", "act", "known", "entered", "served", "hearing"]);
export const UNITS = Object.freeze(["days", "hours", "business_hours", "months", "years"]);
export const DIRECTIONS = Object.freeze(["forward", "backward"]);
/* R46: how a day period is computed (CCP §12, Gov. Code §6800). */
export const COMPUTATION_RULES = Object.freeze(["exclude_first_include_last"]);
/* R48: the receipt conventions a sourced local rule may state (K1504 (3)). */
export const RECEIPT_RULES = Object.freeze(["next_business_day"]);
/* R6 (T33): a code's served copy (K1446), its subsection markers, an amending clause's relation, a meeting marker. */
export const CODE_COPIES = Object.freeze(["official", "codifier", "undetermined"]);
export const SECTION_MARKERS = Object.freeze(["letter", "numeral", "paren_letter", "paren_numeral", "roman"]);
export const AMENDING_RELATIONS = Object.freeze(["amends", "adds", "repeals", "renumbers", "recodifies"]);
export const MEETING_MARKERS = Object.freeze(["cancelled", "special", "concurrent"]);
/* R6 (K1513, K1517): what a roster word names, the role a roster header plays, the column a budget header heads. */
export const ROSTER_KINDS = Object.freeze(["roster", "chart"]);
export const ROSTER_ROLES = Object.freeze(["name", "title", "unit", "start", "end", "as_of", "employee_id", "contact"]);
export const BUDGET_COLUMNS = Object.freeze(["fund", "org", "department", "department_code", "program", "project", "account",
  "amount", "period", "phase"]);
/* R49: a fiscal year's name, and the placeholders its label template may use. */
export const FISCAL_NAMED_BY = Object.freeze(["start", "end"]);
const FISCAL_PLACEHOLDERS = ["{start}", "{end}", "{start2}", "{end2}"];
/* R51, R52, R53 */
export const FORUM_KINDS = Object.freeze(["court", "commission", "grand_jury", "auditor", "other"]);
export const CLASSIFICATION_KINDS = Object.freeze(["fund", "organisation", "account", "object", "program", "project", "function"]);
export const DEMAND_COVERS = Object.freeze(["home_address", "phone", "other"]);
/* R54: `civil-time`'s RFC 5545 subset (its R20). */
export const RRULE_PARTS = Object.freeze(["FREQ", "INTERVAL", "BYDAY", "BYMONTHDAY", "BYSETPOS", "UNTIL"]);
const RRULE_FREQS = ["WEEKLY", "MONTHLY", "YEARLY"];
export const TIERS = Object.freeze([1, 2, 3]);
export const CONTACT_HOW = Object.freeze(["web", "email", "phone", "mail"]);
/* R39: a venue's evidence standard is named in at most this many characters; the grades it admits are
   letters of record-grammar's BASIS_GRADES (its R16; K624 (6)). */
const EVIDENCE_STANDARD_MAX = 200;
/* R40: a profile template's attribution, every field required; its use is filing-templates' (K921). */
export const TEMPLATE_FIELDS = Object.freeze(["id", "version", "use", "text", "notes", "authored_by", "contributors",
  "reviews", "approved_by", "approved_at", "basis"]);
export const TEMPLATE_USES = Object.freeze(["file", "brief"]);
export const REVIEW_KINDS = Object.freeze(["member", "professional"]);
export const REVIEW_OUTCOMES = Object.freeze(["no_concerns", "concerns", "changes_requested"]);
const REVIEW_REQUIRED = ["reviewer", "kind", "scope", "outcome", "at"];
/* R42: an office's weekly hours; a day not listed is closed. */
export const WEEKDAYS = Object.freeze(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]);
/* R44: what a calendar fact (a holiday entry, hours, the time zone) rests on: a measurement or a ruling. */
export const FACT_STATUSES = Object.freeze(["researched", "ruled"]);

const ID_RE = /^[a-z0-9][a-z0-9-]*$/;
const KIND_RE = /^[a-z][a-z0-9_]*$/;
const HEX64 = /^[0-9a-f]{64}$/i;
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TEMPLATE_ID_RE = /^TPL-[a-z0-9][a-z0-9-]*$/;
const HHMM_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;
const MMDD_RE = /^(\d{2})-(\d{2})$/;
/* An instant: a date, a time, and an offset or Z (R48's outages). */
const INSTANT_RE = /^(\d{4}-\d{2}-\d{2})T([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d+)?)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/;
/* A local date-time with no zone (R54's dtstart, read in the profile's time_zone). */
const LOCAL_DT_RE = /^(\d{4}-\d{2}-\d{2})T([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/;
/* R41: an IANA name, `Area/Location` (possibly deeper) or `UTC`. */
const TZ_RE = /^(?:UTC|[A-Z][A-Za-z_-]*(?:\/[A-Za-z0-9_+-]+)+)$/;
/* R2: a basis names a measurement (`M-157`, or a dated entry `2026-07-30`) or a ruling (`D-149`,
   `DEC-13`, `K4`); several are joined by ", " or "; ", each optionally followed by one word that
   says which part of it (`M-119 LEG`, `M-157 (4)`). `UNMEASURED` stands alone (K44). */
const BASIS_REF = /^(?:M-\d+|\d{4}-\d{2}-\d{2}|D-\d+|DEC-\d+|K\d+)(?: [^\s,;]+)?$/;
/* R44 and R40: the measurement and ruling forms of a basis part. */
const MEASUREMENT_REF = /^(?:M-\d+|\d{4}-\d{2}-\d{2})(?: [^\s,;]+)?$/;
const RULING_REF = /^(?:D-\d+|DEC-\d+|K\d+)(?: [^\s,;]+)?$/;
const K_REF = /^K\d+(?: [^\s,;]+)?$/;
const basisParts = (b) => b.split(/[,;]\s*/).map((x) => x.trim());

const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const isStr = (v) => typeof v === "string" && v.trim().length > 0;
const isPosInt = (v) => Number.isInteger(v) && v > 0;
const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
/** A four-digit year. */
const isYear = (v) => Number.isInteger(v) && v >= 1000 && v <= 9999;
/** A real calendar date written `YYYY-MM-DD` (R33). */
function isDate(v) {
  const m = typeof v === "string" && DATE_RE.exec(v);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const leap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][mo - 1];
  return days !== undefined && d >= 1 && d <= days;
}
/** An IANA time-zone name the runtime's zone database knows (R41). `Intl` reads no clock, store or network. */
function isTimeZone(v) {
  if (typeof v !== "string" || !TZ_RE.test(v)) return false;
  try { new Intl.DateTimeFormat("en", { timeZone: v }); return true; } catch { return false; }
}
/** The epoch milliseconds of an instant written with its offset, or null (R48). Reads no clock. */
function instant(v) {
  const m = typeof v === "string" && INSTANT_RE.exec(v);
  if (!m || !isDate(m[1])) return null;
  const t = Date.parse(v);
  return Number.isNaN(t) ? null : t;
}
/** A local date-time with no zone, on a real date (R54). */
const isLocalDateTime = (v) => { const m = typeof v === "string" && LOCAL_DT_RE.exec(v); return !!m && isDate(m[1]); };
/** A month and day `MM-DD` that some year has (R49). */
const isMonthDay = (v) => { const m = typeof v === "string" && MMDD_RE.exec(v); return !!m && isDate(`2000-${m[1]}-${m[2]}`); };
/** Minutes since midnight of an `HH:MM`, or null (R42). */
function minutes(v) {
  const m = typeof v === "string" && HHMM_RE.exec(v);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}
/** One well-formed BCP 47 language tag (N77). `Intl` reads no clock, store or network. */
function isLocale(v) {
  if (!isStr(v) || /\s|,/.test(v)) return false;
  try { return Intl.getCanonicalLocales(v).length === 1; } catch { return false; }
}

/** Whether `b` is a basis a profile may carry. `TEST` only in a test profile (R2). */
export function basisValid(b, test = false) {
  if (typeof b !== "string") return false;
  if (b === "UNMEASURED") return true;
  if (b === "TEST") return test === true;
  const parts = b.split(/[,;]\s*/);
  return parts.length > 0 && parts.every((p) => BASIS_REF.test(p.trim()));
}

/** A pattern `{re, flags?}` compiled, or null when it is not one (R2). */
function compile(p) {
  if (!isObj(p) || typeof p.re !== "string") return null;
  for (const k of Object.keys(p)) if (k !== "re" && k !== "flags") return null;
  const flags = own(p, "flags") ? p.flags : "";
  if (typeof flags !== "string" || !/^[iu]*$/.test(flags) || new Set(flags).size !== flags.length) return null;
  try { return new RegExp(p.re, flags); } catch { return null; }
}
/** How many capture groups a compiled pattern has. */
const groupCount = (re) => new RegExp(`${re.source}|`, re.flags).exec("").length - 1;

/* ------------------------------------------------------------------------------------------------ */
/* Reading a value in a form (R3): used by validate to judge a crosswalk's pairs. The same meaning   */
/* `id-spaces` gives it: clean, then the pattern, then the normal form from the parts.              */

function applyForm(form, raw, prefixes = []) {
  const re = compile(form.pattern);
  if (!re) return null;
  let v = String(raw == null ? "" : raw).trim();
  const c = isObj(form.clean) ? form.clean : {};
  for (const p of prefixes) { const r = compile(p); if (r) v = v.replace(new RegExp(`^(?:${r.source})`, r.flags), ""); }
  for (const p of Array.isArray(c.strip) ? c.strip : []) {
    const r = compile(p);
    if (r) v = v.replace(new RegExp(`^(?:${r.source})`, r.flags), "");
  }
  if (c.spaces === "remove") v = v.replace(/\s+/g, "");
  else v = v.replace(/\s+/g, " ").trim();
  if (c.upper === true) v = v.toUpperCase();
  if (!v) return null;
  const m = re.exec(v);
  if (!m) return null;
  let out = "";
  for (const part of form.normal) {
    if (typeof part === "string") { out += part; continue; }
    let g = m[part.group];
    if (g == null) g = own(part, "default") ? part.default : "";
    if (part.unpad) g = g.replace(/^0+(?=.)/, "");
    if (part.upper) g = g.toUpperCase();
    out += g;
  }
  return out;
}

/* ------------------------------------------------------------------------------------------------ */
/* validate (R10, R11, R28, R35).                                                                   */

/** Judge a profile against R1–R7, R23–R26, R31–R33 and R37–R44. `{ok, errors}`, every error found. Never throws. */
export function validate(profile) {
  const errors = [];
  try { validateInto(profile, errors); }
  catch (e) { errors.push({ path: "", code: "NOT_A_PROFILE", detail: `unreadable: ${String(e && e.message || e)}` }); }
  return { ok: errors.length === 0, errors };
}

function validateInto(p, errors) {
  const err = (path, code, detail) => errors.push({ path, code, detail });
  if (!isObj(p)) { err("", "NOT_A_PROFILE", "a profile is a plain object"); return; }
  const test = p.test === true;

  for (const k of Object.keys(p)) if (!SECTIONS.includes(k)) err(k, "UNKNOWN_SECTION", `'${k}' is not a section of a profile`);
  if (typeof p.id !== "string" || !ID_RE.test(p.id)) err("id", "ID_INVALID", "id matches ^[a-z0-9][a-z0-9-]*$");
  if (!isStr(p.name)) err("name", "NAME_MISSING", "a profile has a name");
  if (!Array.isArray(p.covers) || !p.covers.length || !p.covers.every(isStr))
    err("covers", "COVERS_MISSING", "covers is a non-empty list of names");
  if (own(p, "test") && typeof p.test !== "boolean") err("test", "VALUE_INVALID", "test is true or false");

  /* Returns whether the basis is present and of R2's form. */
  const basis = (path, o) => {
    if (!own(o, "basis") || o.basis === undefined || o.basis === null || o.basis === "") {
      err(`${path}.basis`, "BASIS_MISSING", "every fact names its basis"); return false;
    }
    if (!basisValid(o.basis, test)) {
      err(`${path}.basis`, "BASIS_INVALID", o.basis === "TEST"
        ? "TEST is a basis only in a test profile" : `'${String(o.basis)}' names no measurement or ruling`);
      return false;
    }
    return true;
  };
  /* R44: a calendar fact's status and the basis it rests on agree: `researched` on a measurement, `ruled` on a
     ruling; `UNMEASURED` is no basis for one (a fact without a source is not written). In a test profile, `TEST`
     stands for either. */
  const statusBasis = (path, o) => {
    const ok = basis(path, o);
    if (!FACT_STATUSES.includes(o.status)) {
      err(`${path}.status`, "BASIS_INVALID", `status is ${FACT_STATUSES.join(" or ")}, naming what the fact rests on`);
      return;
    }
    if (!ok || (test && o.basis === "TEST")) return;
    if (o.basis === "UNMEASURED")
      err(`${path}.basis`, "BASIS_INVALID", "a calendar fact without a source is not written: UNMEASURED is no basis for it");
    else if (!basisParts(o.basis).every((x) => (o.status === "researched" ? MEASUREMENT_REF : RULING_REF).test(x)))
      err(`${path}.basis`, "BASIS_INVALID", o.status === "researched"
        ? "a researched fact rests on a measurement (M-<n> or a dated entry)" : "a ruled fact rests on a ruling (D-<n>, DEC-<n> or K<n>)");
  };
  /* R42: an office's or venue's weekly hours. */
  const hours = (path, h) => {
    if (!isObj(h)) { err(path, "HOURS_INVALID", "hours is {weekly: [{day, open, close}], status, basis}"); return; }
    fields(path, h, ["weekly", "status", "basis"]);
    if (!Array.isArray(h.weekly)) err(`${path}.weekly`, "HOURS_INVALID", "weekly is a list of {day, open, close}");
    else {
      const spans = new Map();
      h.weekly.forEach((s, i) => {
        const at = `${path}.weekly[${i}]`;
        if (!isObj(s)) { err(at, "HOURS_INVALID", "a span is {day, open, close}"); return; }
        fields(at, s, ["day", "open", "close"]);
        const day = WEEKDAYS.includes(s.day) ? s.day : null;
        if (!day) err(`${at}.day`, "HOURS_INVALID", `day is one of ${WEEKDAYS.join(", ")}`);
        const [o, c] = [minutes(s.open), minutes(s.close)];
        if (o === null) err(`${at}.open`, "HOURS_INVALID", "open is HH:MM, 24-hour");
        if (c === null) err(`${at}.close`, "HOURS_INVALID", "close is HH:MM, 24-hour");
        if (o === null || c === null) return;
        if (o >= c) { err(at, "HOURS_INVALID", "open is before close"); return; }
        if (!day) return;
        const prior = spans.get(day) || [];
        const clash = prior.find((p) => o < p.c && p.o < c);
        if (clash) err(at, "HOURS_INVALID", `${day} ${s.open}–${s.close} overlaps ${clash.at}`);
        spans.set(day, [...prior, { o, c, at }]);
      });
    }
    statusBasis(path, h);
  };
  /* R48: a venue's channel facts. A malformed one is CHANNEL_INVALID; its status and basis are R44's. */
  const channel = (path, v) => {
    if (own(v, "cutoff")) {
      const c = v.cutoff, ca = `${path}.cutoff`;
      if (!isObj(c)) err(ca, "CHANNEL_INVALID", "cutoff is {time, citation, status, basis}");
      else {
        fields(ca, c, ["time", "citation", "status", "basis"]);
        if (minutes(c.time) === null) err(`${ca}.time`, "CHANNEL_INVALID", "time is HH:MM, 24-hour");
        if (!isStr(c.citation)) err(`${ca}.citation`, "CHANNEL_INVALID", "a cutoff cites its source");
        statusBasis(ca, c);
      }
    }
    if (own(v, "outages")) {
      if (!Array.isArray(v.outages)) err(`${path}.outages`, "CHANNEL_INVALID", "outages is a list of {from, to, status, basis}");
      else v.outages.forEach((o, j) => {
        const oa = `${path}.outages[${j}]`;
        if (!isObj(o)) { err(oa, "CHANNEL_INVALID", "an outage is {from, to, status, basis}"); return; }
        fields(oa, o, ["from", "to", "status", "basis"]);
        const [f, t] = [instant(o.from), instant(o.to)];
        if (f === null) err(`${oa}.from`, "CHANNEL_INVALID", "from is an instant with its offset (YYYY-MM-DDTHH:MM[:SS]Z or ±HH:MM)");
        if (t === null) err(`${oa}.to`, "CHANNEL_INVALID", "to is an instant with its offset");
        if (f !== null && t !== null && !(f < t)) err(oa, "CHANNEL_INVALID", "an outage ends after it starts");
        statusBasis(oa, o);
      });
    }
    if (own(v, "receipt")) {
      const r = v.receipt, ra = `${path}.receipt`;
      if (!isObj(r)) err(ra, "CHANNEL_INVALID", "receipt is {rule, citation, status, basis}");
      else {
        fields(ra, r, ["rule", "citation", "status", "basis"]);
        if (!RECEIPT_RULES.includes(r.rule)) err(`${ra}.rule`, "CHANNEL_INVALID", `rule is one of ${RECEIPT_RULES.join(", ")}`);
        if (!isStr(r.citation)) err(`${ra}.citation`, "CHANNEL_INVALID", "a receipt rule cites the local rule that states it");
        statusBasis(ra, r);
      }
    }
  };
  const pattern = (path, v) => { if (!compile(v)) err(path, "PATTERN_INVALID", "a pattern is {re, flags?}: a regular expression that compiles, flags from i and u"); };
  const fields = (path, o, allowed) => {
    for (const k of Object.keys(o)) if (!allowed.includes(k)) err(`${path}.${k}`, "UNKNOWN_SECTION", `'${k}' is not a field here`);
  };
  const str = (path, v, what) => { if (!isStr(v)) err(path, "VALUE_INVALID", `${what} is a non-empty string`); };
  const list = (path, v) => { if (!Array.isArray(v)) { err(path, "VALUE_INVALID", "a list"); return []; } return v; };
  const entry = (path, e) => { if (!isObj(e)) { err(path, "VALUE_INVALID", "an entry is an object"); return false; } return true; };

  /* systems first: floors and file numbers name their origins. */
  const origins = new Set();
  const noPathHosts = new Map();
  if (own(p, "systems")) list("systems", p.systems).forEach((s, i) => {
    const at = `systems[${i}]`;
    if (!entry(at, s)) return;
    fields(at, s, ["origin", "name", "hosts", "path", "links", "republishes", "provenance_stated", "basis"]);
    str(`${at}.origin`, s.origin, "origin");
    if (isStr(s.origin)) origins.add(s.origin);
    str(`${at}.name`, s.name, "name");
    if (!Array.isArray(s.hosts) || !s.hosts.length || !s.hosts.every((h) => isStr(h) && h === h.toLowerCase()))
      err(`${at}.hosts`, "VALUE_INVALID", "hosts is a non-empty list of lower-case host names");
    if (own(s, "path")) pattern(`${at}.path`, s.path);
    else if (Array.isArray(s.hosts)) for (const h of s.hosts) if (typeof h === "string") noPathHosts.set(h, at);
    /* N96: the shapes of the system's item and file links, over an address's path and query. They are
       part of the system entry, whose basis names their measurement. */
    if (own(s, "links")) {
      if (!isObj(s.links) || !own(s.links, "item") || !own(s.links, "file"))
        err(`${at}.links`, "VALUE_INVALID", "links is {item, file}, two patterns");
      else {
        fields(`${at}.links`, s.links, ["item", "file"]);
        pattern(`${at}.links.item`, s.links.item); pattern(`${at}.links.file`, s.links.file);
      }
    }
    if (own(s, "republishes") && typeof s.republishes !== "boolean") err(`${at}.republishes`, "VALUE_INVALID", "true or false");
    if (own(s, "provenance_stated") && typeof s.provenance_stated !== "boolean") err(`${at}.provenance_stated`, "VALUE_INVALID", "true or false");
    basis(at, s);
  });
  if (own(p, "mixed_hosts")) list("mixed_hosts", p.mixed_hosts).forEach((m, i) => {
    const at = `mixed_hosts[${i}]`;
    if (!entry(at, m)) return;
    fields(at, m, ["host", "why", "basis"]);
    if (!isStr(m.host) || m.host !== m.host.toLowerCase()) err(`${at}.host`, "VALUE_INVALID", "a lower-case host name");
    str(`${at}.why`, m.why, "why");
    if (typeof m.host === "string" && noPathHosts.has(m.host))
      err(`${at}.host`, "HOST_CONFLICT", `${m.host} is mixed and also in ${noPathHosts.get(m.host)}, which has no path`);
    basis(at, m);
  });

  /* spaces */
  const spaceForms = {};
  if (own(p, "spaces")) {
    if (!isObj(p.spaces)) err("spaces", "VALUE_INVALID", "spaces is an object keyed by space");
    else for (const [name, s] of Object.entries(p.spaces)) {
      const at = `spaces.${name}`;
      if (!SPACES.includes(name)) { err(at, "UNKNOWN_SPACE", `'${name}' is not one of ${SPACES.join(", ")}`); continue; }
      if (!entry(at, s)) continue;
      fields(at, s, name === "enactment" ? ["label", "forms", "kinds"] : ["label", "forms"]);
      str(`${at}.label`, s.label, "label");
      const names = new Set();
      spaceForms[name] = new Map();
      list(`${at}.forms`, s.forms).forEach((f, i) => {
        const fa = `${at}.forms[${i}]`;
        if (!entry(fa, f)) return;
        fields(fa, f, ["form", "pattern", "normal", "clean", "basis"]);
        str(`${fa}.form`, f.form, "form");
        if (isStr(f.form)) {
          if (names.has(f.form)) err(`${fa}.form`, "DUPLICATE_FORM", `'${f.form}' is named twice in ${name}`);
          names.add(f.form);
        }
        const re = compile(f.pattern);
        if (!re) pattern(`${fa}.pattern`, f.pattern);
        const groups = re ? groupCount(re) : Infinity;
        let normalOk = Array.isArray(f.normal) && f.normal.length > 0;
        if (!normalOk) err(`${fa}.normal`, "NORMAL_INVALID", "normal is a non-empty list of parts");
        else f.normal.forEach((part, j) => {
          if (typeof part === "string") return;
          const pa = `${fa}.normal[${j}]`;
          if (!isObj(part) || !Number.isInteger(part.group) || part.group < 1 || part.group > groups
              || Object.keys(part).some((k) => !["group", "unpad", "upper", "default"].includes(k))
              || (own(part, "unpad") && typeof part.unpad !== "boolean")
              || (own(part, "upper") && typeof part.upper !== "boolean")
              || (own(part, "default") && typeof part.default !== "string")) {
            normalOk = false;
            err(pa, "NORMAL_INVALID", "a part is a literal string or {group, unpad?, upper?, default?} naming a group the pattern has");
          }
        });
        if (own(f, "clean")) {
          const c = f.clean;
          const bad = !isObj(c) || Object.keys(c).some((k) => !["strip", "spaces", "upper"].includes(k))
            || (own(c, "strip") && (!Array.isArray(c.strip) || !c.strip.every((x) => compile(x))))
            || (own(c, "spaces") && !["remove", "collapse"].includes(c.spaces))
            || (own(c, "upper") && c.upper !== true);
          if (bad) { normalOk = false; err(`${fa}.clean`, "NORMAL_INVALID", "clean is {strip?: [pattern], spaces?: remove|collapse, upper?: true}"); }
        }
        basis(fa, f);
        if (isStr(f.form) && re && normalOk) spaceForms[name].set(f.form, f);
      });
      if (name === "enactment" && own(s, "kinds")) list(`${at}.kinds`, s.kinds).forEach((k, i) => {
        const ka = `${at}.kinds[${i}]`;
        if (!entry(ka, k)) return;
        fields(ka, k, ["kind", "prefix", "floor", "basis"]);
        str(`${ka}.kind`, k.kind, "kind");
        pattern(`${ka}.prefix`, k.prefix);
        if (own(k, "floor")) {
          const fl = k.floor;
          if (!isObj(fl)) err(`${ka}.floor`, "VALUE_INVALID", "a floor is {first, system, basis}");
          else {
            fields(`${ka}.floor`, fl, ["first", "system", "basis"]);
            if (!isPosInt(fl.first)) err(`${ka}.floor.first`, "VALUE_INVALID", "the first number is a positive integer");
            if (!isStr(fl.system) || !origins.has(fl.system)) err(`${ka}.floor.system`, "SYSTEM_UNKNOWN", `no system of this profile has origin '${String(fl.system)}'`);
            basis(`${ka}.floor`, fl);
          }
        }
        basis(ka, k);
      });
    }
  }

  if (own(p, "crosswalks")) list("crosswalks", p.crosswalks).forEach((x, i) => {
    const at = `crosswalks[${i}]`;
    if (!entry(at, x)) return;
    fields(at, x, ["space", "forms", "pairs", "source", "basis"]);
    if (!SPACES.includes(x.space)) err(`${at}.space`, "UNKNOWN_SPACE", `'${String(x.space)}' is not a space`);
    if (!own(x, "source") || x.source === "" || x.source == null) err(`${at}.source`, "CROSSWALK_UNSOURCED", "a crosswalk names the content hash of its capture");
    else if (typeof x.source !== "string" || !HEX64.test(x.source)) err(`${at}.source`, "VALUE_INVALID", "source is 64 hexadecimal characters");
    const known = spaceForms[x.space] || new Map();
    const forms = Array.isArray(x.forms) && x.forms.length === 2 ? x.forms : null;
    if (!forms) err(`${at}.forms`, "VALUE_INVALID", "forms is [a, b]");
    else forms.forEach((f, j) => { if (!known.has(f)) err(`${at}.forms[${j}]`, "CROSSWALK_FORM_UNKNOWN", `the space has no form '${String(f)}'`); });
    list(`${at}.pairs`, x.pairs).forEach((pair, j) => {
      if (!Array.isArray(pair) || pair.length !== 2 || !pair.every((v) => typeof v === "string")) {
        err(`${at}.pairs[${j}]`, "VALUE_INVALID", "a pair is [value in form a, value in form b]"); return;
      }
      if (!forms) return;
      pair.forEach((v, n) => {
        const f = known.get(forms[n]);
        if (f && applyForm(f, v) == null) err(`${at}.pairs[${j}][${n}]`, "CROSSWALK_VALUE_INVALID", `'${v}' is not a value in form '${forms[n]}'`);
      });
    });
    basis(at, x);
  });

  if (own(p, "vocabulary")) {
    if (!isObj(p.vocabulary)) err("vocabulary", "VALUE_INVALID", "vocabulary is an object keyed by vocabulary key");
    else for (const [key, entries] of Object.entries(p.vocabulary)) {
      const at = `vocabulary.${key}`;
      if (!VOCABULARY.includes(key)) { err(at, "UNKNOWN_VOCABULARY", `'${key}' is not one of ${VOCABULARY.join(", ")}`); continue; }
      list(at, entries).forEach((e, i) => {
        const ea = `${at}[${i}]`;
        if (!entry(ea, e)) return;
        if (key === "codes") {
          fields(ea, e, ["key", "label", "pattern", "copy", "sections", "basis"]);
          str(`${ea}.key`, e.key, "key"); str(`${ea}.label`, e.label, "label");
          /* T33 (K1446): which copy is served, and the shape of a section number and its subsection markers. */
          if (own(e, "copy") && !CODE_COPIES.includes(e.copy)) err(`${ea}.copy`, "COPY_UNKNOWN", `copy is one of ${CODE_COPIES.join(", ")}`);
          if (own(e, "sections")) {
            const sc = e.sections;
            if (!isObj(sc)) err(`${ea}.sections`, "VALUE_INVALID", "sections is {number, separators, markers}");
            else {
              fields(`${ea}.sections`, sc, ["number", "separators", "markers"]);
              pattern(`${ea}.sections.number`, sc.number);
              /* empty: a number of one part (a charter's `Section 200.`, K1521) */
              if (typeof sc.separators !== "string" || /\s/.test(sc.separators))
                err(`${ea}.sections.separators`, "VALUE_INVALID", "separators are the characters between a section number's parts, possibly none");
              /* the order of subsection levels; a kind may recur at a deeper level (`A.`, `1.`, `a.`: letter, numeral, letter; K1521) */
              if (!Array.isArray(sc.markers) || !sc.markers.every((m) => SECTION_MARKERS.includes(m)))
                err(`${ea}.sections.markers`, "VALUE_INVALID", `markers is the order of subsection markers, from ${SECTION_MARKERS.join(", ")}`);
            }
          }
        } else if (key === "amending") {
          fields(ea, e, ["pattern", "relation", "basis"]);
          if (!AMENDING_RELATIONS.includes(e.relation)) err(`${ea}.relation`, "VALUE_INVALID", `relation is one of ${AMENDING_RELATIONS.join(", ")}`);
        } else if (key === "meeting_markers") {
          fields(ea, e, ["marker", "pattern", "basis"]);
          if (!MEETING_MARKERS.includes(e.marker)) err(`${ea}.marker`, "VALUE_INVALID", `marker is one of ${MEETING_MARKERS.join(", ")}`);
        } else if (key === "body_variants") {
          fields(ea, e, ["pattern", "organisation", "basis"]);
          if (typeof e.organisation !== "string" || !KIND_RE.test(e.organisation))
            err(`${ea}.organisation`, "VALUE_INVALID", "organisation is a key matching ^[a-z][a-z0-9_]*$");
        } else if (key === "roster_words") {
          fields(ea, e, ["pattern", "kind", "basis"]);
          if (own(e, "kind") && !ROSTER_KINDS.includes(e.kind)) err(`${ea}.kind`, "VALUE_INVALID", `kind is ${ROSTER_KINDS.join(" or ")} (absent: both)`);
        } else if (key === "roster_headers") {
          fields(ea, e, ["role", "pattern", "basis"]);
          if (!ROSTER_ROLES.includes(e.role)) err(`${ea}.role`, "VALUE_INVALID", `role is one of ${ROSTER_ROLES.join(", ")}`);
        } else if (key === "budget_headers") {
          fields(ea, e, ["column", "pattern", "basis"]);
          if (!BUDGET_COLUMNS.includes(e.column)) err(`${ea}.column`, "VALUE_INVALID", `column is one of ${BUDGET_COLUMNS.join(", ")}`);
        } else if (key === "file_numbers") {
          fields(ea, e, ["pattern", "system", "basis"]);
          if (!isStr(e.system) || !origins.has(e.system)) err(`${ea}.system`, "SYSTEM_UNKNOWN", `no system of this profile has origin '${String(e.system)}'`);
        } else fields(ea, e, ["pattern", "basis"]);
        pattern(`${ea}.pattern`, e.pattern);
        basis(ea, e);
      });
    }
  }

  if (own(p, "practice")) {
    if (!isObj(p.practice)) err("practice", "VALUE_INVALID", "practice is an object");
    else {
      fields("practice", p.practice, ["minutes_due_days"]);
      if (own(p.practice, "minutes_due_days")) {
        const m = p.practice.minutes_due_days;
        if (!isObj(m)) err("practice.minutes_due_days", "VALUE_INVALID", "{value, basis}");
        else {
          fields("practice.minutes_due_days", m, ["value", "count", "closures", "basis"]);
          /* K1533: the closure list a business count skips; with none, the due is undetermined */
          if (own(m, "closures") && !(own(p, "holidays") && Array.isArray(p.holidays) && p.holidays.some((h) => isObj(h) && h.list === m.closures)))
            err("practice.minutes_due_days.closures", "VALUE_INVALID", `no holidays entry of this profile is in a list named '${String(m.closures)}'`);
          if (!isPosInt(m.value)) err("practice.minutes_due_days.value", "VALUE_INVALID", "a positive integer");
          if (own(m, "count") && !COUNTS.includes(m.count)) err("practice.minutes_due_days.count", "COUNT_UNKNOWN", "count is calendar or business");
          basis("practice.minutes_due_days", m);
        }
      }
    }
  }
  if (own(p, "search_terms")) list("search_terms", p.search_terms).forEach((t, i) => {
    const at = `search_terms[${i}]`;
    if (!entry(at, t)) return;
    fields(at, t, ["term", "basis"]);
    str(`${at}.term`, t.term, "term");
    basis(at, t);
  });
  const lawNames = new Set();
  if (own(p, "records_laws")) list("records_laws", p.records_laws).forEach((l, i) => {
    const at = `records_laws[${i}]`;
    if (!entry(at, l)) return;
    fields(at, l, ["level", "name", "citation", "basis"]);
    if (!LAW_LEVELS.includes(l.level)) err(`${at}.level`, "LEVEL_UNKNOWN", `level is one of ${LAW_LEVELS.join(", ")}`);
    str(`${at}.name`, l.name, "name"); str(`${at}.citation`, l.citation, "citation");
    if (isStr(l.name)) lawNames.add(l.name);
    basis(at, l);
  });

  if (own(p, "locale")) {
    const l = p.locale;
    if (!isObj(l)) err("locale", "VALUE_INVALID", "locale is {value, basis}");
    else {
      fields("locale", l, ["value", "basis"]);
      if (!isLocale(l.value)) err("locale.value", "VALUE_INVALID", "the value is one well-formed BCP 47 language tag");
      basis("locale", l);
    }
  }
  if (own(p, "time_zone")) {
    const z = p.time_zone;
    if (!isObj(z)) err("time_zone", "VALUE_INVALID", "time_zone is {value, status, basis}");
    else {
      fields("time_zone", z, ["value", "status", "basis"]);
      if (!isTimeZone(z.value)) err("time_zone.value", "VALUE_INVALID", "the value is an IANA time-zone name (Area/Location, or UTC)");
      statusBasis("time_zone", z);
    }
  }

  /* R46: how a day period is computed; R47: the named closure lists. Read first: rules name them. */
  const computationKeys = new Set();
  if (own(p, "computation")) list("computation", p.computation).forEach((c, i) => {
    const at = `computation[${i}]`;
    if (!entry(at, c)) return;
    fields(at, c, ["key", "rule", "citation", "status", "basis"]);
    if (typeof c.key !== "string" || !KIND_RE.test(c.key)) err(`${at}.key`, "VALUE_INVALID", "key matches ^[a-z][a-z0-9_]*$");
    else if (computationKeys.has(c.key)) err(`${at}.key`, "VALUE_INVALID", `'${c.key}' is given twice`);
    else computationKeys.add(c.key);
    if (!COMPUTATION_RULES.includes(c.rule)) err(`${at}.rule`, "VALUE_INVALID", `rule is one of ${COMPUTATION_RULES.join(", ")}`);
    str(`${at}.citation`, c.citation, "citation");
    statusBasis(at, c);
  });
  const closureLists = new Set(own(p, "holidays") && Array.isArray(p.holidays)
    ? p.holidays.filter((h) => isObj(h) && typeof h.list === "string" && KIND_RE.test(h.list)).map((h) => h.list) : []);
  if (own(p, "weekend")) {
    const w = p.weekend;
    if (!isObj(w)) err("weekend", "WEEKEND_INVALID", "weekend is {days, citation, status, basis}");
    else {
      fields("weekend", w, ["days", "citation", "status", "basis"]);
      if (!Array.isArray(w.days) || !w.days.length || !w.days.every((d) => WEEKDAYS.includes(d)) || new Set(w.days).size !== w.days.length)
        err("weekend.days", "WEEKEND_INVALID", `days is a non-empty list of ${WEEKDAYS.join(", ")}, each once`);
      else if (w.days.length === WEEKDAYS.length) err("weekend.days", "WEEKEND_INVALID", "a weekend leaves some day open");
      str("weekend.citation", w.citation, "citation");
      statusBasis("weekend", w);
    }
  }

  /* The action sections (R23–R26, R28, R31–R33, R35, R39–R44). */
  const codeKeys = new Set(own(p, "vocabulary") && isObj(p.vocabulary) && Array.isArray(p.vocabulary.codes)
    ? p.vocabulary.codes.filter(isObj).map((c) => c.key) : []);
  if (own(p, "standard_sources")) list("standard_sources", p.standard_sources).forEach((s, i) => {
    const at = `standard_sources[${i}]`;
    if (!entry(at, s)) return;
    fields(at, s, ["source", "kind", "issuer", "level", "cite", "code", "key", "basis"]);
    if (own(s, "key") && (typeof s.key !== "string" || !ID_RE.test(s.key))) err(`${at}.key`, "VALUE_INVALID", "key is an issuer's segment, matching ^[a-z0-9][a-z0-9-]*$");
    str(`${at}.source`, s.source, "source"); str(`${at}.issuer`, s.issuer, "issuer");
    if (isStr(s.source)) lawNames.add(s.source);
    if (!SOURCE_KINDS.includes(s.kind)) err(`${at}.kind`, "SOURCE_KIND_UNKNOWN", `kind is one of ${SOURCE_KINDS.join(", ")}`);
    if (!LAW_LEVELS.includes(s.level)) err(`${at}.level`, "LEVEL_UNKNOWN", `every standard source has a level, one of ${LAW_LEVELS.join(", ")}`);
    pattern(`${at}.cite`, s.cite);
    if (own(s, "code") && !codeKeys.has(s.code)) err(`${at}.code`, "CODE_UNKNOWN", `no vocabulary.codes entry has key '${String(s.code)}'`);
    basis(at, s);
  });
  const roles = new Set();
  const bodies = new Set();
  if (own(p, "counterparties")) list("counterparties", p.counterparties).forEach((c, i) => {
    const at = `counterparties[${i}]`;
    if (!entry(at, c)) return;
    fields(at, c, ["role", "body", "level", "elected", "oversight", "hours", "basis"]);
    str(`${at}.role`, c.role, "role"); str(`${at}.body`, c.body, "body");
    if (isStr(c.role)) roles.add(c.role);
    if (isStr(c.body)) bodies.add(c.body);
    if (own(c, "hours")) hours(`${at}.hours`, c.hours);
    if (!COUNTERPARTY_LEVELS.includes(c.level)) err(`${at}.level`, "LEVEL_UNKNOWN", `level is one of ${COUNTERPARTY_LEVELS.join(", ")}`);
    if (typeof c.elected !== "boolean") err(`${at}.elected`, "VALUE_INVALID", "elected is true or false");
    if (own(c, "oversight") && typeof c.oversight !== "boolean") err(`${at}.oversight`, "VALUE_INVALID", "oversight is true or false");
    basis(at, c);
  });
  const kinds = new Set();
  const tier3 = new Set();
  const venueKinds = new Set();
  const templateIds = new Set();
  if (own(p, "action_kinds")) list("action_kinds", p.action_kinds).forEach((k, i) => {
    const at = `action_kinds[${i}]`;
    if (!entry(at, k)) return;
    fields(at, k, ["kind", "label", "tier", "laws", "venue", "template", "advisory", "evidence", "basis"]);
    if (typeof k.kind !== "string" || !KIND_RE.test(k.kind)) err(`${at}.kind`, "KIND_INVALID", "kind matches ^[a-z][a-z0-9_]*$");
    else if (kinds.has(k.kind)) err(`${at}.kind`, "DUPLICATE_KIND", `'${k.kind}' is given twice`);
    else { kinds.add(k.kind); if (k.tier === 3) tier3.add(k.kind); }
    str(`${at}.label`, k.label, "label");
    if (own(k, "tier") && !TIERS.includes(k.tier)) err(`${at}.tier`, "TIER_INVALID", "tier is 1, 2 or 3");
    if (own(k, "laws")) list(`${at}.laws`, k.laws).forEach((l, j) => {
      if (!lawNames.has(l)) err(`${at}.laws[${j}]`, "LAW_UNKNOWN", `no records_laws or standard_sources entry is named '${String(l)}'`);
    });
    if (own(k, "venue")) {
      const v = k.venue;
      if (!isObj(v)) err(`${at}.venue`, "VALUE_INVALID", "a venue is {name, how, basis}");
      else {
        fields(`${at}.venue`, v, ["name", "how", "hours", "cutoff", "outages", "receipt", "basis"]);
        str(`${at}.venue.name`, v.name, "name");
        if (!VENUE_HOW.includes(v.how)) err(`${at}.venue.how`, "VALUE_INVALID", `how is one of ${VENUE_HOW.join(", ")}`);
        if (own(v, "hours")) hours(`${at}.venue.hours`, v.hours);
        channel(`${at}.venue`, v);
        basis(`${at}.venue`, v);
        if (typeof k.kind === "string") venueKinds.add(k.kind);
      }
    }
    /* R40: a template carries its whole attribution; R28: a `file` template never on a Tier 3 kind (a `brief`
       may serve any tier, K921). Its blanks are filing-templates' to judge (its R15). */
    if (own(k, "template")) {
      const t = k.template;
      const ta = `${at}.template`;
      if (!isObj(t)) err(ta, "TEMPLATE_UNATTRIBUTED", `a template is {${TEMPLATE_FIELDS.join(", ")}}, never bare text`);
      else {
        fields(ta, t, TEMPLATE_FIELDS);
        for (const f of TEMPLATE_FIELDS)
          if (!own(t, f) || t[f] === undefined || t[f] === null) err(`${ta}.${f}`, "TEMPLATE_UNATTRIBUTED", `the template's ${f} is missing`);
        const bad = (f, why) => { if (own(t, f) && t[f] !== undefined && t[f] !== null) err(`${ta}.${f}`, "VALUE_INVALID", why); };
        if (!(typeof t.id === "string" && TEMPLATE_ID_RE.test(t.id))) bad("id", "id matches ^TPL-[a-z0-9][a-z0-9-]*$");
        else if (templateIds.has(t.id)) err(`${ta}.id`, "VALUE_INVALID", `'${t.id}' is given twice in the profile`);
        else templateIds.add(t.id);
        if (!isPosInt(t.version)) bad("version", "version is a positive integer");
        if (!TEMPLATE_USES.includes(t.use)) bad("use", `use is ${TEMPLATE_USES.join(" or ")}`);
        if (!isStr(t.text)) bad("text", "the text is non-empty");
        if (typeof t.notes !== "string") bad("notes", "notes are text, possibly empty");
        if (!isStr(t.authored_by)) bad("authored_by", "authored_by is a non-empty name");
        if (!isStr(t.approved_by)) bad("approved_by", "approved_by is a non-empty name");
        else if (isStr(t.authored_by) && t.approved_by.trim() === t.authored_by.trim())
          err(`${ta}.approved_by`, "VALUE_INVALID", "the approver is not the template's author");
        if (!Array.isArray(t.contributors) || !t.contributors.every(isStr)) bad("contributors", "contributors is a list of names");
        if (!isDate(t.approved_at)) bad("approved_at", "approved_at is a real YYYY-MM-DD");
        if (!Array.isArray(t.reviews)) bad("reviews", "reviews is a list of {reviewer, kind, organisation?, credential?, scope, outcome, at}");
        else t.reviews.forEach((r, j) => {
          const ra = `${ta}.reviews[${j}]`;
          if (!isObj(r)) { err(ra, "VALUE_INVALID", "a review is {reviewer, kind, organisation?, credential?, scope, outcome, at}"); return; }
          fields(ra, r, [...REVIEW_REQUIRED, "organisation", "credential"]);
          for (const f of REVIEW_REQUIRED)
            if (!own(r, f) || r[f] === undefined || r[f] === null) err(`${ra}.${f}`, "TEMPLATE_UNATTRIBUTED", `the review's ${f} is missing`);
          const rbad = (f, ok, why) => { if (own(r, f) && r[f] !== undefined && r[f] !== null && !ok) err(`${ra}.${f}`, "VALUE_INVALID", why); };
          rbad("reviewer", isStr(r.reviewer), "the reviewer is a non-empty name");
          rbad("kind", REVIEW_KINDS.includes(r.kind), `kind is ${REVIEW_KINDS.join(" or ")}`);
          rbad("scope", isStr(r.scope), "the scope is non-empty text");
          rbad("outcome", REVIEW_OUTCOMES.includes(r.outcome), `outcome is one of ${REVIEW_OUTCOMES.join(", ")}`);
          rbad("at", isDate(r.at), "at is a real YYYY-MM-DD");
          rbad("organisation", isStr(r.organisation), "the organisation is a non-empty name");
          rbad("credential", isStr(r.credential), "the credential is non-empty text");
        });
        if (own(t, "basis") && t.basis !== undefined && t.basis !== null) {
          if (!(test && t.basis === "TEST") && !(typeof t.basis === "string" && t.basis !== "" && basisParts(t.basis).every((x) => K_REF.test(x))))
            err(`${ta}.basis`, "BASIS_INVALID", t.basis === "TEST" ? "TEST is a basis only in a test profile"
              : "a template rests on the ruling that approved it (K<n>)");
        }
        if (t.use === "file" && k.tier === 3) err(ta, "TEMPLATE_TIER3", "a Tier 3 kind has no use: file template; a brief may serve it");
      }
    }
    if (own(k, "advisory")) {
      if (!isStr(k.advisory)) err(`${at}.advisory`, "VALUE_INVALID", "an advisory note is text");
      if (k.tier !== 2) err(`${at}.advisory`, "ADVISORY_NOT_TIER2", "an advisory note is given only on a Tier 2 kind");
    }
    /* R39: the venue's evidence standard, and the grades it admits and those the opposition may contest. */
    if (own(k, "evidence")) {
      const ev = k.evidence;
      const ea = `${at}.evidence`;
      if (!isObj(ev)) err(ea, "VALUE_INVALID", "evidence is {standard, accepts, contestable?, basis}");
      else {
        fields(ea, ev, ["standard", "accepts", "contestable", "basis"]);
        if (!own(ev, "standard") || ev.standard === undefined || ev.standard === null || ev.standard === "")
          err(`${ea}.standard`, "EVIDENCE_NO_STANDARD", "evidence names the venue's standard in words");
        else if (!isStr(ev.standard) || ev.standard.length > EVIDENCE_STANDARD_MAX)
          err(`${ea}.standard`, "VALUE_INVALID", `the standard is text of at most ${EVIDENCE_STANDARD_MAX} characters`);
        const grades = (path, v) => v.forEach((g, j) => {
          const ga = `${path}[${j}]`;
          if (!isObj(g)) { err(ga, "VALUE_INVALID", "an admitted grade is {grade, coattested?}"); return; }
          fields(ga, g, ["grade", "coattested"]);
          if (!BASIS_GRADES.includes(g.grade)) err(`${ga}.grade`, "GRADE_UNKNOWN", `grade is one of ${BASIS_GRADES.join(", ")}`);
          if (own(g, "coattested") && typeof g.coattested !== "boolean") err(`${ga}.coattested`, "VALUE_INVALID", "coattested is true or false");
        });
        if (!own(ev, "accepts") || (Array.isArray(ev.accepts) && !ev.accepts.length))
          err(`${ea}.accepts`, "EVIDENCE_NO_STANDARD", "accepts lists at least one grade the venue admits");
        else if (!Array.isArray(ev.accepts)) err(`${ea}.accepts`, "VALUE_INVALID", "accepts is a list of {grade, coattested?}");
        else grades(`${ea}.accepts`, ev.accepts);
        if (own(ev, "contestable")) grades(`${ea}.contestable`, list(`${ea}.contestable`, ev.contestable));
        basis(ea, ev);
      }
    }
    basis(at, k);
  });
  /* R26 (T33): a period as data only; civil-time counts it. An entry written `days: n` with no `units` reads as
     `units: "days", amount: n` (R26 before T33). Every entry carries `status` and a sourced basis (R44, K1445). */
  if (own(p, "deadlines")) list("deadlines", p.deadlines).forEach((d, i) => {
    const at = `deadlines[${i}]`;
    if (!entry(at, d)) return;
    fields(at, d, ["rule", "applies_to", "units", "amount", "days", "count", "direction", "starts", "roll", "closures",
      "computation", "extension", "tolling", "observed", "applies_on", "due_at", "citation", "status", "basis"]);
    str(`${at}.rule`, d.rule, "rule");
    if (d.applies_to !== "claim" && !kinds.has(d.applies_to))
      err(`${at}.applies_to`, "DEADLINE_KIND_UNKNOWN", `'${String(d.applies_to)}' is neither claim nor a kind of this profile`);
    const legacy = own(d, "days") && !own(d, "units") && !own(d, "amount");
    if (legacy) { if (!isPosInt(d.days)) err(`${at}.days`, "VALUE_INVALID", "days is a positive integer"); }
    else {
      if (own(d, "days")) err(`${at}.days`, "VALUE_INVALID", "days is the pre-T33 form of units and amount; give one form, not both");
      if (!UNITS.includes(d.units)) err(`${at}.units`, "UNIT_UNKNOWN", `units is one of ${UNITS.join(", ")}`);
      if (!isPosInt(d.amount)) err(`${at}.amount`, "VALUE_INVALID", "amount is a positive integer");
    }
    const units = legacy ? "days" : d.units;
    if (own(d, "count")) {
      if (!COUNTS.includes(d.count)) err(`${at}.count`, "COUNT_UNKNOWN", "count is calendar or business");
      else if (units !== "days") err(`${at}.count`, "UNIT_UNKNOWN", "count is given with units: days only");
    }
    if (own(d, "direction") && !DIRECTIONS.includes(d.direction)) err(`${at}.direction`, "DIRECTION_UNKNOWN", `direction is ${DIRECTIONS.join(" or ")}`);
    if (!STARTS.includes(d.starts)) err(`${at}.starts`, "ANCHOR_UNKNOWN", `starts is one of ${STARTS.join(", ")}`);
    if (own(d, "roll") && typeof d.roll !== "boolean") err(`${at}.roll`, "VALUE_INVALID", "roll is true or false");
    if (own(d, "closures") && !closureLists.has(d.closures))
      err(`${at}.closures`, "CLOSURES_UNKNOWN", `no holidays entry of this profile is in a list named '${String(d.closures)}'`);
    if (own(d, "computation") && !computationKeys.has(d.computation))
      err(`${at}.computation`, "COMPUTATION_UNKNOWN", `no computation entry of this profile has key '${String(d.computation)}'`);
    if (own(d, "extension")) {
      const x = d.extension;
      if (!isObj(x)) err(`${at}.extension`, "VALUE_INVALID", "an extension is {days, count, when, citation?}");
      else {
        fields(`${at}.extension`, x, ["days", "count", "when", "citation"]);
        if (!isPosInt(x.days)) err(`${at}.extension.days`, "VALUE_INVALID", "days is a positive integer");
        if (!COUNTS.includes(x.count)) err(`${at}.extension.count`, "COUNT_UNKNOWN", "count is calendar or business");
        str(`${at}.extension.when`, x.when, "when");
        if (own(x, "citation")) str(`${at}.extension.citation`, x.citation, "citation");
      }
    }
    if (own(d, "tolling")) list(`${at}.tolling`, d.tolling).forEach((t, j) => {
      const ta = `${at}.tolling[${j}]`;
      if (!entry(ta, t)) return;
      fields(ta, t, ["when", "citation"]);
      str(`${ta}.when`, t.when, "when"); str(`${ta}.citation`, t.citation, "citation");
    });
    /* R47: a body's observed practice, held beside the rule and never as it (K1504 (1)). */
    if (own(d, "observed")) {
      const o = d.observed;
      if (!isObj(o)) err(`${at}.observed`, "VALUE_INVALID", "observed is {closures, status, basis}");
      else {
        fields(`${at}.observed`, o, ["closures", "status", "basis"]);
        if (!closureLists.has(o.closures))
          err(`${at}.observed.closures`, "CLOSURES_UNKNOWN", `no holidays entry of this profile is in a list named '${String(o.closures)}'`);
        statusBasis(`${at}.observed`, o);
      }
    }
    /* K1514: the anchor's weekdays a rule applies to, and the time of day it is due at */
    if (own(d, "applies_on") && (!Array.isArray(d.applies_on) || !d.applies_on.length
        || !d.applies_on.every((x) => WEEKDAYS.includes(x)) || new Set(d.applies_on).size !== d.applies_on.length))
      err(`${at}.applies_on`, "VALUE_INVALID", `applies_on is a non-empty list of ${WEEKDAYS.join(", ")}, each once`);
    if (own(d, "due_at") && d.due_at !== "close_of_business" && minutes(d.due_at) === null)
      err(`${at}.due_at`, "VALUE_INVALID", "due_at is close_of_business or HH:MM");
    str(`${at}.citation`, d.citation, "citation");
    statusBasis(at, d);
  });

  if (own(p, "legal_organisations")) list("legal_organisations", p.legal_organisations).forEach((o, i) => {
    const at = `legal_organisations[${i}]`;
    if (!entry(at, o)) return;
    fields(at, o, ["name", "evaluates", "contacts", "basis"]);
    str(`${at}.name`, o.name, "name");
    if (!Array.isArray(o.evaluates) || !o.evaluates.length) err(`${at}.evaluates`, "VALUE_INVALID", "evaluates is a non-empty list of Tier 3 kinds");
    else o.evaluates.forEach((k, j) => {
      if (!tier3.has(k)) err(`${at}.evaluates[${j}]`, "ORG_KIND_UNKNOWN", `'${String(k)}' is not a Tier 3 kind of this profile`);
    });
    if (!Array.isArray(o.contacts) || !o.contacts.length) err(`${at}.contacts`, "CONTACT_INVALID", "contacts is a non-empty list of {how, value}");
    else o.contacts.forEach((c, j) => {
      const ca = `${at}.contacts[${j}]`;
      if (!isObj(c)) { err(ca, "CONTACT_INVALID", "a contact is {how, value}"); return; }
      fields(ca, c, ["how", "value"]);
      if (!CONTACT_HOW.includes(c.how)) err(`${ca}.how`, "CONTACT_INVALID", `how is one of ${CONTACT_HOW.join(", ")}`);
      if (!isStr(c.value)) err(`${ca}.value`, "CONTACT_INVALID", "the value is a non-empty string");
    });
    basis(at, o);
  });

  /* R33, R43: a year once for all offices and once for each distinct `offices` list. */
  if (own(p, "holidays")) {
    const years = new Set();
    list("holidays", p.holidays).forEach((h, i) => {
      const at = `holidays[${i}]`;
      if (!entry(at, h)) return;
      fields(at, h, ["year", "list", "citation", "offices", "days", "status", "basis"]);
      /* R47: the closure list the entry belongs to, with the provision that makes it. */
      let key = "";
      if (own(h, "list")) {
        if (typeof h.list !== "string" || !KIND_RE.test(h.list)) err(`${at}.list`, "HOLIDAY_INVALID", "list is a name matching ^[a-z][a-z0-9_]*$");
        str(`${at}.citation`, h.citation, "citation");
      } else if (own(h, "citation")) str(`${at}.citation`, h.citation, "citation");
      if (own(h, "offices")) {
        if (!Array.isArray(h.offices) || !h.offices.length) {
          err(`${at}.offices`, "HOLIDAY_INVALID", "offices is a non-empty list of roles or {venue: <kind>}");
          key = `\u0002${i}`; /* no list to key by: judged on its own */
        }
        else {
          const seenOffices = new Set();
          h.offices.forEach((o, j) => {
            const oa = `${at}.offices[${j}]`;
            const k = officeKey(o);
            if (typeof o === "string") { if (!roles.has(o)) err(oa, "HOLIDAY_INVALID", `no counterparty of this profile has role '${o}'`); }
            else if (isObj(o) && Object.keys(o).length === 1 && typeof o.venue === "string") {
              if (!venueKinds.has(o.venue)) err(oa, "HOLIDAY_INVALID", `no kind of this profile with a venue is '${o.venue}'`);
            } else { err(oa, "HOLIDAY_INVALID", "an office is a counterparty role or {venue: <kind>}"); return; }
            if (seenOffices.has(k)) err(oa, "HOLIDAY_INVALID", "an office is named twice in one entry");
            seenOffices.add(k);
          });
          key = officesKey(h.offices);
        }
      }
      key = `${listKey(h)}\u0003${key}`;
      if (!isYear(h.year)) err(`${at}.year`, "HOLIDAY_INVALID", "year is a four-digit year");
      else if (years.has(`${h.year}\u0000${key}`)) err(`${at}.year`, "HOLIDAY_INVALID",
        `${h.year} is listed twice for ${own(h, "list") ? `the list ${String(h.list)} and ` : ""}${own(h, "offices") ? "the same offices" : "all offices"}`);
      else years.add(`${h.year}\u0000${key}`);
      const dates = new Set();
      list(`${at}.days`, h.days).forEach((d, j) => {
        const da = `${at}.days[${j}]`;
        if (!entry(da, d)) return;
        fields(da, d, ["date", "name"]);
        if (!isDate(d.date)) err(`${da}.date`, "HOLIDAY_INVALID", "a date is a real YYYY-MM-DD");
        else if (isYear(h.year) && Number(d.date.slice(0, 4)) !== h.year) err(`${da}.date`, "HOLIDAY_INVALID", `${d.date} is outside ${h.year}`);
        else if (dates.has(d.date)) err(`${da}.date`, "HOLIDAY_INVALID", `${d.date} is given twice`);
        else dates.add(d.date);
        str(`${da}.name`, d.name, "name");
      });
      statusBasis(at, h);
    });
  }

  /* R49: a fiscal year per body that keeps one. */
  if (own(p, "fiscal_year")) {
    const seen = new Set();
    list("fiscal_year", p.fiscal_year).forEach((f, i) => {
      const at = `fiscal_year[${i}]`;
      if (!entry(at, f)) return;
      fields(at, f, ["body", "start", "named_by", "label", "status", "basis"]);
      if (f.body !== "*" && !bodies.has(f.body)) err(`${at}.body`, "FISCAL_YEAR_INVALID", `body is a counterparty body of this profile, or * for every body`);
      else if (seen.has(f.body)) err(`${at}.body`, "FISCAL_YEAR_INVALID", `${f.body} keeps one fiscal year`);
      else seen.add(f.body);
      if (!isMonthDay(f.start)) err(`${at}.start`, "FISCAL_YEAR_INVALID", "start is the first day, MM-DD");
      if (!FISCAL_NAMED_BY.includes(f.named_by)) err(`${at}.named_by`, "FISCAL_YEAR_INVALID", `named_by is ${FISCAL_NAMED_BY.join(" or ")}`);
      if (!isStr(f.label) || !FISCAL_PLACEHOLDERS.some((x) => f.label.includes(x))
          || (f.label.match(/\{[^}]*\}/g) || []).some((x) => !FISCAL_PLACEHOLDERS.includes(x)))
        err(`${at}.label`, "FISCAL_YEAR_INVALID", `label is a template using ${FISCAL_PLACEHOLDERS.join(", ")}`);
      statusBasis(at, f);
    });
  }

  /* R50: the rank of a source kind at a law level, and the instrument key's first segment. */
  if (own(p, "law_ranks")) {
    const seen = new Set();
    list("law_ranks", p.law_ranks).forEach((r, i) => {
      const at = `law_ranks[${i}]`;
      if (!entry(at, r)) return;
      fields(at, r, ["kind", "level", "rank", "basis"]);
      if (!SOURCE_KINDS.includes(r.kind)) err(`${at}.kind`, "RANK_INVALID", `kind is one of ${SOURCE_KINDS.join(", ")}`);
      if (!LAW_LEVELS.includes(r.level)) err(`${at}.level`, "RANK_INVALID", `level is one of ${LAW_LEVELS.join(", ")}`);
      if (!isPosInt(r.rank)) err(`${at}.rank`, "RANK_INVALID", "rank is a positive integer, 1 the highest");
      const k = `${r.kind}\u0000${r.level}`;
      if (seen.has(k)) err(at, "RANK_INVALID", `${r.kind} at ${r.level} is ranked twice`);
      seen.add(k);
      basis(at, r);
    });
  }
  if (own(p, "instrument_key")) {
    const k = p.instrument_key;
    if (!isObj(k)) err("instrument_key", "VALUE_INVALID", "instrument_key is {jurisdiction, basis}");
    else {
      fields("instrument_key", k, ["jurisdiction", "basis"]);
      if (typeof k.jurisdiction !== "string" || !ID_RE.test(k.jurisdiction))
        err("instrument_key.jurisdiction", "VALUE_INVALID", "jurisdiction is a segment matching ^[a-z0-9][a-z0-9-]*$");
      basis("instrument_key", k);
    }
  }

  /* R51: the kinds of proceeding the forums hold, and each kind's ordered stages. */
  const proceedingKinds = new Set();
  if (own(p, "proceeding_kinds")) list("proceeding_kinds", p.proceeding_kinds).forEach((k, i) => {
    const at = `proceeding_kinds[${i}]`;
    if (!entry(at, k)) return;
    fields(at, k, ["kind", "label", "forum_kind", "basis"]);
    if (typeof k.kind !== "string" || !KIND_RE.test(k.kind)) err(`${at}.kind`, "KIND_INVALID", "kind matches ^[a-z][a-z0-9_]*$");
    else if (proceedingKinds.has(k.kind)) err(`${at}.kind`, "DUPLICATE_KIND", `'${k.kind}' is given twice`);
    else proceedingKinds.add(k.kind);
    str(`${at}.label`, k.label, "label");
    if (!FORUM_KINDS.includes(k.forum_kind)) err(`${at}.forum_kind`, "VALUE_INVALID", `forum_kind is one of ${FORUM_KINDS.join(", ")}`);
    basis(at, k);
  });
  if (own(p, "proceeding_flows")) {
    const flowed = new Set();
    list("proceeding_flows", p.proceeding_flows).forEach((f, i) => {
      const at = `proceeding_flows[${i}]`;
      if (!entry(at, f)) return;
      fields(at, f, ["kind", "stages", "citation", "basis"]);
      if (!proceedingKinds.has(f.kind)) err(`${at}.kind`, "FLOW_INVALID", `'${String(f.kind)}' is no kind of proceeding_kinds`);
      else if (flowed.has(f.kind)) err(`${at}.kind`, "FLOW_INVALID", `${f.kind} has one flow`);
      else flowed.add(f.kind);
      if (!Array.isArray(f.stages) || !f.stages.length) err(`${at}.stages`, "FLOW_INVALID", "stages is a non-empty ordered list of {stage, label, reached_by}");
      else {
        const stages = new Set();
        f.stages.forEach((st, j) => {
          const sa = `${at}.stages[${j}]`;
          if (!isObj(st)) { err(sa, "FLOW_INVALID", "a stage is {stage, label, reached_by}"); return; }
          fields(sa, st, ["stage", "label", "reached_by"]);
          if (typeof st.stage !== "string" || !KIND_RE.test(st.stage)) err(`${sa}.stage`, "FLOW_INVALID", "stage matches ^[a-z][a-z0-9_]*$");
          else if (stages.has(st.stage)) err(`${sa}.stage`, "FLOW_INVALID", `the stage ${st.stage} is given twice`);
          else stages.add(st.stage);
          if (!isStr(st.label)) err(`${sa}.label`, "FLOW_INVALID", "a stage has a label");
          if (!Array.isArray(st.reached_by) || !st.reached_by.length || !st.reached_by.every((e) => typeof e === "string" && KIND_RE.test(e)))
            err(`${sa}.reached_by`, "FLOW_INVALID", "reached_by is a non-empty list of event kinds");
        });
      }
      str(`${at}.citation`, f.citation, "citation");
      basis(at, f);
    });
  }

  /* R52: the schemes a registry identifier is in, and the codes a budget or ledger classifies by. */
  if (own(p, "identifier_schemes")) {
    const seen = new Set();
    list("identifier_schemes", p.identifier_schemes).forEach((x, i) => {
      const at = `identifier_schemes[${i}]`;
      if (!entry(at, x)) return;
      fields(at, x, ["scheme", "label", "entity_kinds", "space", "form", "systems", "basis"]);
      if (!isStr(x.scheme)) err(`${at}.scheme`, "SCHEME_INVALID", "scheme is a non-empty name");
      else if (seen.has(x.scheme)) err(`${at}.scheme`, "SCHEME_INVALID", `${x.scheme} is given twice`);
      else seen.add(x.scheme);
      str(`${at}.label`, x.label, "label");
      if (!Array.isArray(x.entity_kinds) || !x.entity_kinds.length || !x.entity_kinds.every((k) => typeof k === "string" && KIND_RE.test(k)))
        err(`${at}.entity_kinds`, "SCHEME_INVALID", "entity_kinds is a non-empty list of entity kinds");
      if (!spaceForms[x.space]) err(`${at}.space`, "SCHEME_INVALID", `this profile has no space '${String(x.space)}'`);
      else if (own(x, "form") && !spaceForms[x.space].has(x.form)) err(`${at}.form`, "SCHEME_INVALID", `the space ${x.space} has no form '${String(x.form)}'`);
      if (own(x, "systems")) {
        if (!Array.isArray(x.systems)) err(`${at}.systems`, "SCHEME_INVALID", "systems is a list of origins");
        else x.systems.forEach((o, j) => { if (!origins.has(o)) err(`${at}.systems[${j}]`, "SCHEME_INVALID", `no system of this profile has origin '${String(o)}'`); });
      }
      basis(at, x);
    });
  }
  if (own(p, "classification_schemes")) {
    const seen = new Set();
    list("classification_schemes", p.classification_schemes).forEach((x, i) => {
      const at = `classification_schemes[${i}]`;
      if (!entry(at, x)) return;
      fields(at, x, ["scheme", "label", "kind", "codes", "forms", "basis"]);
      if (own(x, "forms")) {
        if (!Array.isArray(x.forms) || !x.forms.length) err(`${at}.forms`, "SCHEME_INVALID", "forms is a non-empty list of patterns");
        else x.forms.forEach((f, j) => { if (!compile(f)) err(`${at}.forms[${j}]`, "SCHEME_INVALID", "a form is a pattern {re, flags?}"); });
      }
      if (!isStr(x.scheme)) err(`${at}.scheme`, "SCHEME_INVALID", "scheme is a non-empty name");
      else if (seen.has(x.scheme)) err(`${at}.scheme`, "SCHEME_INVALID", `${x.scheme} is given twice`);
      else seen.add(x.scheme);
      str(`${at}.label`, x.label, "label");
      if (!CLASSIFICATION_KINDS.includes(x.kind)) err(`${at}.kind`, "SCHEME_INVALID", `kind is one of ${CLASSIFICATION_KINDS.join(", ")}`);
      if (own(x, "codes")) {
        if (!Array.isArray(x.codes)) err(`${at}.codes`, "SCHEME_INVALID", "codes is a list of {code, label}");
        else {
          const cs = new Set();
          x.codes.forEach((c, j) => {
            const ca = `${at}.codes[${j}]`;
            if (!isObj(c) || !isStr(c.code) || !isStr(c.label) || Object.keys(c).some((k) => k !== "code" && k !== "label"))
              { err(ca, "SCHEME_INVALID", "a code is {code, label}"); return; }
            if (cs.has(c.code)) err(`${ca}.code`, "SCHEME_INVALID", `${c.code} is given twice`);
            cs.add(c.code);
          });
        }
      }
      basis(at, x);
    });
  }

  /* R53: the lawful demands to remove a personal fact (K1493). */
  if (own(p, "lawful_demands")) {
    const seen = new Set();
    list("lawful_demands", p.lawful_demands).forEach((d, i) => {
      const at = `lawful_demands[${i}]`;
      if (!entry(at, d)) return;
      fields(at, d, ["kind", "label", "covers", "within", "citation", "status", "basis"]);
      if (typeof d.kind !== "string" || !KIND_RE.test(d.kind)) err(`${at}.kind`, "DEMAND_INVALID", "kind matches ^[a-z][a-z0-9_]*$");
      else if (seen.has(d.kind)) err(`${at}.kind`, "DEMAND_INVALID", `'${d.kind}' is given twice`);
      else seen.add(d.kind);
      str(`${at}.label`, d.label, "label");
      if (!Array.isArray(d.covers) || !d.covers.length || !d.covers.every((c) => DEMAND_COVERS.includes(c)) || new Set(d.covers).size !== d.covers.length)
        err(`${at}.covers`, "DEMAND_INVALID", `covers is a non-empty list from ${DEMAND_COVERS.join(", ")}`);
      const w = d.within;
      if (!isObj(w) || Object.keys(w).some((k) => k !== "amount" && k !== "units") || !isPosInt(w.amount) || !UNITS.includes(w.units))
        err(`${at}.within`, "DEMAND_INVALID", `within is {amount, units}, units one of ${UNITS.join(", ")}`);
      str(`${at}.citation`, d.citation, "citation");
      statusBasis(at, d);
    });
  }

  /* R54: a body's stated meeting schedule, in civil-time's RFC 5545 subset (its R20). */
  if (own(p, "recurrences")) list("recurrences", p.recurrences).forEach((r, i) => {
    const at = `recurrences[${i}]`;
    if (!entry(at, r)) return;
    fields(at, r, ["body", "rrule", "dtstart", "citation", "status", "basis"]);
    str(`${at}.body`, r.body, "body");
    const why = rruleFault(r.rrule);
    if (why) err(`${at}.rrule`, "RECURRENCE_INVALID", why);
    if (!isLocalDateTime(r.dtstart)) err(`${at}.dtstart`, "RECURRENCE_INVALID", "dtstart is a local date-time YYYY-MM-DDTHH:MM[:SS], read in the profile's time_zone");
    str(`${at}.citation`, r.citation, "citation");
    statusBasis(at, r);
  });
}

/* Why an RRULE is outside civil-time's subset (its R20), or null. `EXDATE` is a property of its own, not a part. */
const BYDAY_RE = /^(?:[+-]?(?:[1-9]|[1-4]\d|5[0-3]))?(?:MO|TU|WE|TH|FR|SA|SU)$/;
function rruleFault(v) {
  if (typeof v !== "string" || !v.trim()) return "rrule is a non-empty RFC 5545 rule";
  const parts = new Map();
  for (const kv of v.replace(/^RRULE:/, "").split(";")) {
    const m = /^([A-Z]+)=(.+)$/.exec(kv);
    if (!m) return `'${kv}' is not NAME=value`;
    if (!RRULE_PARTS.includes(m[1])) return `${m[1]} is outside civil-time's subset (${RRULE_PARTS.join(", ")})`;
    if (parts.has(m[1])) return `${m[1]} is given twice`;
    parts.set(m[1], m[2]);
  }
  if (!RRULE_FREQS.includes(parts.get("FREQ"))) return `FREQ is one of ${RRULE_FREQS.join(", ")}`;
  const ints = (x, lo, hi) => x.split(",").every((n) => /^[+-]?\d+$/.test(n) && Math.abs(Number(n)) >= lo && Math.abs(Number(n)) <= hi);
  if (parts.has("INTERVAL") && !/^[1-9]\d*$/.test(parts.get("INTERVAL"))) return "INTERVAL is a positive integer";
  if (parts.has("BYDAY") && !parts.get("BYDAY").split(",").every((d) => BYDAY_RE.test(d))) return "BYDAY lists days, each with an optional ordinal";
  if (parts.has("BYMONTHDAY") && !ints(parts.get("BYMONTHDAY"), 1, 31)) return "BYMONTHDAY lists days of the month";
  if (parts.has("BYSETPOS") && !ints(parts.get("BYSETPOS"), 1, 366)) return "BYSETPOS lists positions";
  if (parts.has("UNTIL") && !/^\d{8}(?:T\d{6}Z?)?$/.test(parts.get("UNTIL"))) return "UNTIL is a date or date-time";
  return null;
}

/* An office a holiday entry names, as a key: a counterparty role or a kind's venue (R43). */
function officeKey(o) {
  if (typeof o === "string") return `role:${o}`;
  if (isObj(o) && typeof o.venue === "string") return `venue:${o.venue}`;
  return `?:${JSON.stringify(o)}`;
}
/* The closure list a holiday entry belongs to ("" for the office calendar, R47). */
const listKey = (h) => (isObj(h) && typeof h.list === "string" ? h.list : "");
/* The key of an `offices` list: its offices, in no order ("" for every office). */
const officesKey = (offices) => (Array.isArray(offices) ? [...new Set(offices.map(officeKey))].sort().join("\u0001") : "");

/* ------------------------------------------------------------------------------------------------ */
/* The held profiles (R8, R9, R19).                                                                  */

const deepFreeze = (o) => { if (o && typeof o === "object") { Object.values(o).forEach(deepFreeze); Object.freeze(o); } return o; };
const clone = (o) => (o === undefined ? undefined : JSON.parse(JSON.stringify(o)));
const HELD = new Map([FIRST, TEST].map((p) => [p.id, deepFreeze(clone(p))]));

/** Every profile held, sorted by id: `[{id, name, covers, test}]`. Never throws. */
export function list() {
  return [...HELD.values()].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    .map((p) => ({ id: p.id, name: p.name, covers: p.covers.slice(), test: p.test === true }));
}

/** The held profile with that id, as the caller's own copy, or null. Never throws. */
export function get(id) {
  if (typeof id !== "string" || !HELD.has(id)) return null;
  return clone(HELD.get(id));
}

/* ------------------------------------------------------------------------------------------------ */
/* combine (R12–R16, R29, R34, R41–R44).                                                            */

/* A stable key for "equal in everything but its basis and profile". Object keys are sorted so the
   order a profile writes its fields in never makes two equal entries differ. */
function canon(v) {
  if (Array.isArray(v)) return `[${v.map(canon).join(",")}]`;
  if (isObj(v)) return `{${Object.keys(v).sort().filter((k) => k !== "basis" && k !== "profile" && k !== "bases")
    .map((k) => `${JSON.stringify(k)}:${canon(v[k])}`).join(",")}}`;
  return JSON.stringify(v);
}
/* The whole value, basis included, with object keys sorted. */
function stable(v) {
  if (Array.isArray(v)) return `[${v.map(stable).join(",")}]`;
  if (isObj(v)) return `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${stable(v[k])}`).join(",")}}`;
  return JSON.stringify(v);
}
const tag = (e, profile) => ({ ...clone(e), profile, bases: [{ profile, basis: e.basis }] });
/** Union in order; an entry equal to an earlier one but for basis and profile is kept once (R14). */
function union(into, entries, profile) {
  for (const e of entries || []) {
    const k = canon(e);
    const at = into.find((x) => x.__k === k);
    if (at) { if (!at.bases.some((b) => b.profile === profile && b.basis === e.basis)) at.bases.push({ profile, basis: e.basis }); }
    else into.push(Object.assign(tag(e, profile), { __k: k }));
  }
}
const strip = (arr) => arr.map((e) => { const { __k, ...rest } = e; return rest; });
/* A one-value fact that carries its own basis (a venue, evidence, a template, hours, the time zone), kept as
   the first giver wrote it, tagged with every giver's basis (R13, R14). `given` is `[{profile, value, basis}]`. */
const keep = (given) => ({ ...clone(given[0].value), profile: given[0].profile,
  bases: given.map((g) => ({ profile: g.profile, basis: g.basis })) });
/** The one value a keyed fact holds, or a conflict (R15). `given` is `[{profile, value, basis}]`. */
function agree(given) {
  const ks = [...new Set(given.map((g) => canon(g.value)))];
  return ks.length <= 1;
}

/**
 * Combine the active profiles, in order. `list` holds ids of held profiles or profile objects.
 * `{ok: true, view, conflicts}` or `{ok: false, errors}`. Never throws.
 */
export function combine(listIn) {
  try { return combineInner(listIn); }
  catch (e) { return { ok: false, errors: [{ at: null, code: "INVALID_PROFILE", detail: `unreadable: ${String(e && e.message || e)}` }] }; }
}

function combineInner(listIn) {
  if (!Array.isArray(listIn)) return { ok: false, errors: [{ at: null, code: "NOT_A_LIST", detail: "combine takes a list of profile ids or profiles" }] };
  const errors = [];
  const profiles = [];
  const seen = new Map();
  listIn.forEach((item, i) => {
    let p;
    if (typeof item === "string") {
      p = get(item);
      if (!p) { errors.push({ at: i, code: "UNKNOWN_PROFILE", detail: `no profile '${item}' is held` }); return; }
    } else {
      const v = validate(item);
      if (!v.ok) { errors.push({ at: i, code: "INVALID_PROFILE", detail: "the profile fails validate", errors: v.errors }); return; }
      p = clone(item);
    }
    /* A profile given twice is combined once. Two different profiles under one id cannot be told
       apart in the view's `profile` tags, so that is refused rather than one of them chosen. */
    if (seen.has(p.id)) {
      if (stable(seen.get(p.id)) !== stable(p))
        errors.push({ at: i, code: "INVALID_PROFILE", detail: `a different profile with id '${p.id}' was given earlier`, errors: [] });
      return;
    }
    seen.set(p.id, p);
    profiles.push(p);
  });
  if (errors.length) return { ok: false, errors };
  return { ok: true, ...merge(profiles) };
}

function merge(profiles) {
  const conflicts = [];
  const conflict = (at, values, says) => conflicts.push({ at, values, says });
  const view = {
    id: profiles.map((p) => p.id).join("+"),
    name: profiles.map((p) => p.name).join("; "),
    covers: [...new Set(profiles.flatMap((p) => p.covers))],
    test: profiles.some((p) => p.test === true),
    profiles: profiles.map((p) => p.id),
  };
  const has = (sec) => profiles.some((p) => own(p, sec));

  /* spaces: labels joined, forms keyed by name (one definition per name), kinds unioned with one
     floor per kind. */
  if (has("spaces")) {
    view.spaces = {};
    for (const space of SPACES) {
      const givers = profiles.filter((p) => p.spaces && p.spaces[space]);
      if (!givers.length) continue;
      const s = { label: [...new Set(givers.map((p) => p.spaces[space].label))].join("; "), forms: [] };
      const byForm = new Map();
      for (const p of givers) for (const f of p.spaces[space].forms || []) {
        if (!byForm.has(f.form)) byForm.set(f.form, []);
        byForm.get(f.form).push({ profile: p.id, value: f });
      }
      for (const [form, given] of byForm) {
        const vals = given.map((g) => ({ profile: g.profile, value: (({ basis, ...rest }) => rest)(g.value), basis: g.value.basis }));
        if (!agree(vals)) {
          conflict(`spaces.${space}.forms[${form}]`, vals,
            `the active profiles define the ${space} form '${form}' differently, so it is withheld: a value in it is recognised by no profile until they agree`);
          continue;
        }
        const merged = [];
        for (const g of given) union(merged, [g.value], g.profile);
        s.forms.push(...strip(merged));
      }
      if (space === "enactment" && givers.some((p) => own(p.spaces[space], "kinds"))) {
        const kinds = [];
        for (const p of givers) union(kinds, (p.spaces[space].kinds || []).map((k) => (({ floor, ...rest }) => rest)(k)), p.id);
        const floors = new Map();
        for (const p of givers) for (const k of p.spaces[space].kinds || [])
          if (k.floor) { if (!floors.has(k.kind)) floors.set(k.kind, []); floors.get(k.kind).push({ profile: p.id, value: (({ basis, ...rest }) => rest)(k.floor), basis: k.floor.basis }); }
        for (const [kind, given] of floors) {
          if (!agree(given)) {
            conflict(`spaces.enactment.kinds[${kind}].floor`, given,
              `the active profiles give different coverage floors for ${kind}, so no floor is given: whether a number is inside the record's reach is undetermined`);
            continue;
          }
          const floor = { ...given[0].value, basis: given[0].basis, profile: given[0].profile, bases: given.map((g) => ({ profile: g.profile, basis: g.basis })) };
          for (const k of kinds) if (k.kind === kind) k.floor = clone(floor);
        }
        s.kinds = strip(kinds);
      }
      view.spaces[space] = s;
    }
  }

  /* systems and mixed hosts: a host and path name one origin, or none (R15). */
  if (has("systems") || has("mixed_hosts")) {
    const systems = [];
    for (const p of profiles) union(systems, p.systems || [], p.id);
    const mixed = [];
    for (const p of profiles) union(mixed, p.mixed_hosts || [], p.id);
    const pathKey = (s) => (s.path ? canon(s.path) : "");
    const byHostPath = new Map();
    for (const s of systems) for (const h of s.hosts) {
      const k = `${h}\u0000${pathKey(s)}`;
      if (!byHostPath.has(k)) byHostPath.set(k, []);
      byHostPath.get(k).push(s);
    }
    const withheld = new Set(); /* `${host}\0${pathKey}` */
    for (const [k, ss] of byHostPath) {
      const origins = [...new Set(ss.map((s) => s.origin))];
      if (origins.length < 2) continue;
      const [host] = k.split("\u0000");
      withheld.add(k);
      conflict(`systems[host=${host}${ss[0].path ? ` path=${ss[0].path.re}` : ""}]`,
        ss.flatMap((s) => s.bases.map((b) => ({ profile: b.profile, value: s.origin, basis: b.basis }))),
        `the active profiles say ${host} publishes different systems' material (${origins.join(", ")}), so an address there names no system`);
    }
    const mixedWithheld = new Set();
    for (const m of mixed) {
      const k = `${m.host}\u0000`;
      /* validate refuses this inside one profile (HOST_CONFLICT), so here it is always two profiles. */
      const others = (byHostPath.get(k) || []).filter((s) => !s.path);
      if (!others.length) continue;
      withheld.add(k);
      mixedWithheld.add(m.host);
      conflict(`mixed_hosts[${m.host}]`,
        [...m.bases.map((b) => ({ profile: b.profile, value: "mixed", basis: b.basis })),
         ...others.flatMap((s) => s.bases.map((b) => ({ profile: b.profile, value: s.origin, basis: b.basis })))],
        `one active profile says ${m.host} serves many offices' publications and another names a system for it, so an address there names no system`);
    }
    if (has("systems")) view.systems = strip(systems)
      .map((s) => ({ ...s, hosts: s.hosts.filter((h) => !withheld.has(`${h}\u0000${pathKey(s)}`)) }))
      .filter((s) => s.hosts.length);
    if (has("mixed_hosts")) view.mixed_hosts = strip(mixed).filter((m) => !mixedWithheld.has(m.host));
  }

  if (has("crosswalks")) { const x = []; for (const p of profiles) union(x, p.crosswalks, p.id); view.crosswalks = strip(x); }

  if (has("vocabulary")) {
    view.vocabulary = {};
    for (const key of VOCABULARY) {
      if (!profiles.some((p) => p.vocabulary && own(p.vocabulary, key))) continue;
      const v = [];
      for (const p of profiles) union(v, p.vocabulary && p.vocabulary[key], p.id);
      view.vocabulary[key] = strip(v);
    }
  }

  if (has("practice")) {
    view.practice = {};
    /* the value and its count (calendar when absent, R7) are one fact */
    const given = profiles.filter((p) => p.practice && p.practice.minutes_due_days)
      .map((p) => ({ profile: p.id, value: p.practice.minutes_due_days.value, count: p.practice.minutes_due_days.count || "calendar",
        closures: p.practice.minutes_due_days.closures, written: p.practice.minutes_due_days, basis: p.practice.minutes_due_days.basis }));
    if (given.length && agree(given.map((g) => ({ value: [g.value, g.count, g.closures ?? null] }))))
      view.practice.minutes_due_days = { value: given[0].value, ...(own(given[0].written, "count") ? { count: given[0].count } : {}),
        ...(own(given[0].written, "closures") ? { closures: given[0].closures } : {}),
        basis: given[0].basis, profile: given[0].profile, bases: given.map((g) => ({ profile: g.profile, basis: g.basis })) };
    else if (given.length)
      conflict("practice.minutes_due_days", given.map(({ written, ...g }) => g),
        "the active profiles give different periods after which absent minutes raise a question, so none is given");
  }

  /* locale: one value (N77), as practice's. */
  if (has("locale")) {
    const given = profiles.filter((p) => p.locale).map((p) => ({ profile: p.id, value: p.locale.value, basis: p.locale.basis }));
    if (agree(given))
      view.locale = { value: given[0].value, basis: given[0].basis, profile: given[0].profile,
        bases: given.map((g) => ({ profile: g.profile, basis: g.basis })) };
    else conflict("locale", given, "the active profiles name different locales, so none is given: a render asks for its fallback");
  }

  /* time_zone: one value (R41), its status part of it (R44). */
  if (has("time_zone")) {
    const given = profiles.filter((p) => p.time_zone).map((p) => ({ profile: p.id, value: p.time_zone, basis: p.time_zone.basis }));
    if (agree(given)) view.time_zone = keep(given);
    else conflict("time_zone", given, "the active profiles name different time zones, so none is given: a time of day there is undetermined");
  }

  for (const sec of ["search_terms", "records_laws", "standard_sources", "legal_organisations"])
    if (has(sec)) { const v = []; for (const p of profiles) union(v, p[sec], p.id); view[sec] = strip(v); }

  /* counterparties are unioned; an office's oversight marker and its hours are one value per role and body (R29,
     R42). */
  if (has("counterparties")) {
    const v = [];
    const marks = new Map();
    const hoursOf = new Map();
    const push = (m, k, g) => { if (!m.has(k)) m.set(k, []); m.get(k).push(g); };
    for (const p of profiles) for (const c of p.counterparties || []) {
      const { oversight, hours, ...rest } = c;
      union(v, [rest], p.id);
      const k = `${c.role}\u0000${c.body}`;
      if (own(c, "oversight")) push(marks, k, { profile: p.id, value: oversight, basis: c.basis });
      if (own(c, "hours")) push(hoursOf, k, { profile: p.id, value: hours, basis: hours.basis });
    }
    const each = (k, fn) => { const [role, body] = k.split("\u0000"); for (const c of v) if (c.role === role && c.body === body) fn(c); };
    for (const [k, given] of marks) {
      if (agree(given)) { each(k, (c) => { c.oversight = given[0].value; }); continue; }
      const [role, body] = k.split("\u0000");
      conflict(`counterparties[${role}/${body}].oversight`, given,
        `the active profiles disagree on whether ${role} (${body}) is an oversight or audit body, so it is undetermined`);
    }
    for (const [k, given] of hoursOf) {
      if (agree(given)) { each(k, (c) => { c.hours = keep(given); }); continue; }
      const [role, body] = k.split("\u0000");
      conflict(`counterparties[${role}/${body}].hours`, given,
        `the active profiles give different hours for ${role} (${body}), so its hours are undetermined`);
    }
    view.counterparties = strip(v);
  }

  /* action kinds, keyed by kind: tier, venue, template, advisory and evidence are one value each (R29). */
  if (has("action_kinds")) {
    const byKind = new Map();
    for (const p of profiles) for (const k of p.action_kinds || []) {
      if (!byKind.has(k.kind)) byKind.set(k.kind, []);
      byKind.get(k.kind).push({ profile: p.id, k });
    }
    view.action_kinds = [];
    for (const [kind, given] of byKind) {
      const e = { kind, label: [...new Set(given.map((g) => g.k.label))].join("; ") };
      const laws = [...new Set(given.flatMap((g) => g.k.laws || []))];
      if (given.some((g) => own(g.k, "laws"))) e.laws = laws;
      /* venue, template and evidence carry their own basis: the fact kept names every giver's (R13, R14). A
         venue's hours are one value of their own (R29, R42); a template is one value, its whole attribution
         included (R40). */
      const WHAT = { tier: "risk tiers", venue: "venues", template: "templates", advisory: "advisory notes", evidence: "evidence standards" };
      for (const f of ["tier", "venue", "template", "advisory", "evidence"]) {
        const carriesBasis = f === "venue" || f === "evidence" || f === "template";
        const vals = given.filter((g) => own(g.k, f)).map((g) => {
          let value = clone(g.k[f]);
          if (f === "venue" && isObj(value)) { const { hours, cutoff, receipt, outages, ...rest } = value; value = rest; }
          return { profile: g.profile, value, basis: carriesBasis ? g.k[f].basis : g.k.basis };
        });
        if (!vals.length) continue;
        if (agree(vals)) e[f] = !carriesBasis ? vals[0].value : keep(vals);
        else conflict(`action_kinds[${kind}].${f}`, vals, `the active profiles give different ${WHAT[f]} for ${kind}, so none is given`
          + (f === "evidence" ? ": the venue's standard is undetermined" : ""));
      }
      if (e.venue) {
        /* hours (R42), and the channel's cutoff and receipt rule (R48, R55), are one value each; outages are unioned. */
        const SAYS = { hours: "its hours are undetermined", cutoff: "its cutoff is undetermined",
          receipt: "receipt on a closed day stays the actual day only where no profile states otherwise; here it is undetermined" };
        for (const f of ["hours", "cutoff", "receipt"]) {
          const vs = given.filter((g) => isObj(g.k.venue) && own(g.k.venue, f))
            .map((g) => ({ profile: g.profile, value: g.k.venue[f], basis: g.k.venue[f].basis }));
          if (vs.length && agree(vs)) e.venue[f] = keep(vs);
          else if (vs.length) conflict(`action_kinds[${kind}].venue.${f}`, vs,
            `the active profiles give different ${f === "hours" ? "hours" : f === "cutoff" ? "cutoffs" : "receipt rules"} for ${kind}'s venue, so ${SAYS[f]}`);
        }
        if (given.some((g) => isObj(g.k.venue) && own(g.k.venue, "outages"))) {
          const o = [];
          for (const g of given) if (isObj(g.k.venue)) union(o, g.k.venue.outages, g.profile);
          e.venue.outages = strip(o);
        }
      }
      e.basis = given[0].k.basis;
      e.profile = given[0].profile;
      e.bases = given.map((g) => ({ profile: g.profile, basis: g.k.basis }));
      view.action_kinds.push(e);
    }
  }

  /* deadlines, keyed by rule and what they apply to: every field but the citation is one value each (R29, R55). An
     entry written `days: n` reads as `units: "days", amount: n` (R26); the view gives both forms for a day period. */
  if (has("deadlines")) {
    const byRule = new Map();
    for (const p of profiles) for (const d of p.deadlines || []) {
      const k = `${d.rule}\u0000${d.applies_to}`;
      if (!byRule.has(k)) byRule.set(k, []);
      byRule.get(k).push({ profile: p.id, d: normalDeadline(d) });
    }
    view.deadlines = [];
    for (const given of byRule.values()) {
      const { rule, applies_to } = given[0].d;
      const e = { rule, applies_to };
      for (const f of DEADLINE_ONE_VALUE) {
        const vals = given.filter((g) => own(g.d, f)).map((g) => ({ profile: g.profile, value: clone(g.d[f]), basis: g.d.basis }));
        if (!vals.length) continue;
        if (!agree(vals)) {
          conflict(`deadlines[${rule}/${applies_to}].${f}`, vals, `the active profiles disagree on the ${f} of ${rule} for ${applies_to}, so it is withheld: the deadline is undetermined`);
          continue;
        }
        e[f] = f === "observed" ? keep(vals.map((v) => ({ ...v, basis: v.value.basis }))) : vals[0].value;
      }
      if (e.units === "days" && own(e, "amount")) e.days = e.amount;
      e.citation = [...new Set(given.map((g) => g.d.citation))].join("; ");
      e.basis = given[0].d.basis;
      e.profile = given[0].profile;
      e.bases = given.map((g) => ({ profile: g.profile, basis: g.d.basis }));
      view.deadlines.push(e);
    }
  }

  /* holidays: a year's days, keyed by the year and its offices (R34, R43), are one value, their status part of
     it (R44); the order a profile lists the days or the offices in is no disagreement. */
  if (has("holidays")) {
    const byKey = new Map();
    const byDate = (a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0);
    for (const p of profiles) for (const h of p.holidays || []) {
      const k = `${h.year}\u0000${listKey(h)}\u0000${officesKey(h.offices)}`;
      if (!byKey.has(k)) byKey.set(k, []);
      byKey.get(k).push({ profile: p.id, h, value: h.days.slice().sort(byDate), status: h.status, citation: h.citation, basis: h.basis });
    }
    view.holidays = [];
    for (const given of byKey.values()) {
      const { year, offices, list: named } = given[0].h;
      if (!agree(given.map((g) => ({ value: { days: g.value, status: g.status, citation: g.citation } })))) {
        const whose = offices ? ` for ${offices.map((o) => (typeof o === "string" ? o : `${o.venue}'s venue`)).join(", ")}` : "";
        conflict(`holidays[${year}${named ? ` list=${named}` : ""}${offices ? ` offices=${officesKey(offices).replace(/\u0001/g, ",")}` : ""}]`,
          given.map((g) => ({ profile: g.profile, value: g.value, status: g.status, basis: g.basis })),
          `the active profiles list different closure days for ${year}${whose}, so the year is withheld there: a business-day count reaching into it is undetermined`);
        continue;
      }
      view.holidays.push({ year, ...(named ? { list: named, citation: given[0].citation } : given[0].citation ? { citation: given[0].citation } : {}),
        ...(offices ? { offices: clone(offices) } : {}), days: clone(given[0].value), status: given[0].status,
        basis: given[0].basis, profile: given[0].profile, bases: given.map((g) => ({ profile: g.profile, basis: g.basis })) });
    }
  }

  /* T33's sections (R55). One value: the weekend and the instrument key; one value per key: a computation, a
     fiscal year, a law rank, a proceeding flow and a lawful demand. Unioned: proceeding kinds, the schemes and the
     recurrences. Each one-value fact is kept whole as its first giver wrote it, tagged with every giver's basis. */
  for (const sec of ["weekend", "instrument_key"]) {
    if (!has(sec)) continue;
    const given = profiles.filter((p) => p[sec]).map((p) => ({ profile: p.id, value: p[sec], basis: p[sec].basis }));
    if (agree(given)) view[sec] = keep(given);
    else conflict(sec, given, sec === "weekend"
      ? "the active profiles name different weekends, so none is given: a business-day count or a roll is undetermined"
      : "the active profiles give different instrument-key segments, so no key is composed");
  }
  for (const [sec, keyOf, what] of ONE_PER_KEY) {
    if (!has(sec)) continue;
    const byKey = new Map();
    for (const p of profiles) for (const e of p[sec] || []) {
      const k = keyOf(e);
      if (!byKey.has(k)) byKey.set(k, []);
      byKey.get(k).push({ profile: p.id, value: e, basis: e.basis });
    }
    view[sec] = [];
    for (const [k, given] of byKey) {
      if (agree(given)) view[sec].push(keep(given));
      else conflict(`${sec}[${k.replace(/\u0000/g, "/")}]`, given, `the active profiles give different ${what} for ${k.replace(/\u0000/g, " at ")}, so it is withheld: it is undetermined`);
    }
  }
  for (const sec of ["proceeding_kinds", "identifier_schemes", "classification_schemes", "recurrences"])
    if (has(sec)) { const v = []; for (const p of profiles) union(v, p[sec], p.id); view[sec] = strip(v); }

  return { view, conflicts };
}

/* R29, R55: a deadline's fields that hold one value under its rule and what it applies to. */
const DEADLINE_ONE_VALUE = ["units", "amount", "count", "direction", "starts", "roll", "closures", "computation",
  "extension", "tolling", "observed", "applies_on", "due_at", "status"];
/** A deadline as R26 reads it: `days: n` with no units is `units: "days", amount: n`. */
function normalDeadline(d) {
  if (!own(d, "days") || own(d, "units")) return d;
  const { days, ...rest } = d;
  return { ...rest, units: "days", amount: days };
}
/* R55: the sections whose entries are one value per key, with the key and how a conflict names what differs. */
const ONE_PER_KEY = [
  ["computation", (e) => e.key, "computations"],
  ["fiscal_year", (e) => e.body, "fiscal years"],
  ["law_ranks", (e) => `${e.kind}\u0000${e.level}`, "ranks"],
  ["proceeding_flows", (e) => e.kind, "proceeding flows"],
  ["lawful_demands", (e) => e.kind, "lawful demands"],
];
