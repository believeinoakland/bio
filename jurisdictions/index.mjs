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

/* ------------------------------------------------------------------------------------------------ */
/* The profile's shape (R1–R7, R23–R26).                                                            */

export const SECTIONS = Object.freeze(["id", "name", "covers", "test", "spaces", "systems", "mixed_hosts",
  "crosswalks", "vocabulary", "practice", "search_terms", "records_laws", "standard_sources",
  "counterparties", "action_kinds", "deadlines"]);
export const SPACES = Object.freeze(["enactment", "project", "fund", "parcel"]);
export const VOCABULARY = Object.freeze(["furniture", "bodies", "member_titles", "enactment_markers", "codes",
  "file_numbers", "report_titles", "report_sections", "recommendation_openers", "template_blanks"]);
export const RECORDS_LAW_LEVELS = Object.freeze(["state", "county", "city"]);
export const COUNTERPARTY_LEVELS = Object.freeze(["state", "county", "city", "district"]);
export const SOURCE_KINDS = Object.freeze(["statute", "regulation", "ordinance", "court", "policy", "commitment"]);
export const VENUE_HOW = Object.freeze(["portal", "mail", "email", "in_person", "court"]);
export const COUNTS = Object.freeze(["calendar", "business"]);
export const STARTS = Object.freeze(["received", "filed", "act", "known"]);
export const TIERS = Object.freeze([1, 2, 3]);

const ID_RE = /^[a-z0-9][a-z0-9-]*$/;
const KIND_RE = /^[a-z][a-z0-9_]*$/;
const HEX64 = /^[0-9a-f]{64}$/i;
/* R2: a basis names a measurement (`M-157`, or a dated entry `2026-07-30`) or a ruling (`D-149`,
   `DEC-13`, `K4`); several are joined by ", " or "; ", each optionally followed by one word that
   says which part of it (`M-119 LEG`, `M-157 (4)`). `UNMEASURED` stands alone (K44). */
const BASIS_REF = /^(?:M-\d+|\d{4}-\d{2}-\d{2}|D-\d+|DEC-\d+|K\d+)(?: [^\s,;]+)?$/;

const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const isStr = (v) => typeof v === "string" && v.trim().length > 0;
const isPosInt = (v) => Number.isInteger(v) && v > 0;
const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

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
/* validate (R10, R11, R28).                                                                        */

/** Judge a profile against R1–R7 and R23–R26. `{ok, errors}`, every error found. Never throws. */
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

  const basis = (path, o) => {
    if (!own(o, "basis") || o.basis === undefined || o.basis === null || o.basis === "")
      err(`${path}.basis`, "BASIS_MISSING", "every fact names its basis");
    else if (!basisValid(o.basis, test))
      err(`${path}.basis`, "BASIS_INVALID", o.basis === "TEST"
        ? "TEST is a basis only in a test profile" : `'${String(o.basis)}' names no measurement or ruling`);
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
    fields(at, s, ["origin", "name", "hosts", "path", "republishes", "provenance_stated", "basis"]);
    str(`${at}.origin`, s.origin, "origin");
    if (isStr(s.origin)) origins.add(s.origin);
    str(`${at}.name`, s.name, "name");
    if (!Array.isArray(s.hosts) || !s.hosts.length || !s.hosts.every((h) => isStr(h) && h === h.toLowerCase()))
      err(`${at}.hosts`, "VALUE_INVALID", "hosts is a non-empty list of lower-case host names");
    if (own(s, "path")) pattern(`${at}.path`, s.path);
    else if (Array.isArray(s.hosts)) for (const h of s.hosts) if (typeof h === "string") noPathHosts.set(h, at);
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
          fields(ea, e, ["key", "label", "pattern", "basis"]);
          str(`${ea}.key`, e.key, "key"); str(`${ea}.label`, e.label, "label");
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
          fields("practice.minutes_due_days", m, ["value", "basis"]);
          if (!isPosInt(m.value)) err("practice.minutes_due_days.value", "VALUE_INVALID", "a positive integer");
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
    if (!RECORDS_LAW_LEVELS.includes(l.level)) err(`${at}.level`, "LEVEL_UNKNOWN", `level is one of ${RECORDS_LAW_LEVELS.join(", ")}`);
    str(`${at}.name`, l.name, "name"); str(`${at}.citation`, l.citation, "citation");
    if (isStr(l.name)) lawNames.add(l.name);
    basis(at, l);
  });

  /* The action sections (R23–R26, R28). */
  const codeKeys = new Set(own(p, "vocabulary") && isObj(p.vocabulary) && Array.isArray(p.vocabulary.codes)
    ? p.vocabulary.codes.filter(isObj).map((c) => c.key) : []);
  if (own(p, "standard_sources")) list("standard_sources", p.standard_sources).forEach((s, i) => {
    const at = `standard_sources[${i}]`;
    if (!entry(at, s)) return;
    fields(at, s, ["source", "kind", "issuer", "cite", "code", "basis"]);
    str(`${at}.source`, s.source, "source"); str(`${at}.issuer`, s.issuer, "issuer");
    if (isStr(s.source)) lawNames.add(s.source);
    if (!SOURCE_KINDS.includes(s.kind)) err(`${at}.kind`, "SOURCE_KIND_UNKNOWN", `kind is one of ${SOURCE_KINDS.join(", ")}`);
    pattern(`${at}.cite`, s.cite);
    if (own(s, "code") && !codeKeys.has(s.code)) err(`${at}.code`, "CODE_UNKNOWN", `no vocabulary.codes entry has key '${String(s.code)}'`);
    basis(at, s);
  });
  if (own(p, "counterparties")) list("counterparties", p.counterparties).forEach((c, i) => {
    const at = `counterparties[${i}]`;
    if (!entry(at, c)) return;
    fields(at, c, ["role", "body", "level", "elected", "basis"]);
    str(`${at}.role`, c.role, "role"); str(`${at}.body`, c.body, "body");
    if (!COUNTERPARTY_LEVELS.includes(c.level)) err(`${at}.level`, "LEVEL_UNKNOWN", `level is one of ${COUNTERPARTY_LEVELS.join(", ")}`);
    if (typeof c.elected !== "boolean") err(`${at}.elected`, "VALUE_INVALID", "elected is true or false");
    basis(at, c);
  });
  const kinds = new Set();
  if (own(p, "action_kinds")) list("action_kinds", p.action_kinds).forEach((k, i) => {
    const at = `action_kinds[${i}]`;
    if (!entry(at, k)) return;
    fields(at, k, ["kind", "label", "tier", "laws", "venue", "template", "basis"]);
    if (typeof k.kind !== "string" || !KIND_RE.test(k.kind)) err(`${at}.kind`, "KIND_INVALID", "kind matches ^[a-z][a-z0-9_]*$");
    else if (kinds.has(k.kind)) err(`${at}.kind`, "DUPLICATE_KIND", `'${k.kind}' is given twice`);
    else kinds.add(k.kind);
    str(`${at}.label`, k.label, "label");
    if (own(k, "tier") && !TIERS.includes(k.tier)) err(`${at}.tier`, "TIER_INVALID", "tier is 1, 2 or 3");
    if (own(k, "laws")) list(`${at}.laws`, k.laws).forEach((l, j) => {
      if (!lawNames.has(l)) err(`${at}.laws[${j}]`, "LAW_UNKNOWN", `no records_laws or standard_sources entry is named '${String(l)}'`);
    });
    if (own(k, "venue")) {
      const v = k.venue;
      if (!isObj(v)) err(`${at}.venue`, "VALUE_INVALID", "a venue is {name, how, basis}");
      else {
        fields(`${at}.venue`, v, ["name", "how", "basis"]);
        str(`${at}.venue.name`, v.name, "name");
        if (!VENUE_HOW.includes(v.how)) err(`${at}.venue.how`, "VALUE_INVALID", `how is one of ${VENUE_HOW.join(", ")}`);
        basis(`${at}.venue`, v);
      }
    }
    if (own(k, "template")) {
      if (!isStr(k.template)) err(`${at}.template`, "VALUE_INVALID", "a template is text");
      if (k.tier === 3) err(`${at}.template`, "TEMPLATE_TIER3", "a Tier 3 kind has no template");
    }
    basis(at, k);
  });
  if (own(p, "deadlines")) list("deadlines", p.deadlines).forEach((d, i) => {
    const at = `deadlines[${i}]`;
    if (!entry(at, d)) return;
    fields(at, d, ["rule", "applies_to", "days", "count", "starts", "extension", "citation", "basis"]);
    str(`${at}.rule`, d.rule, "rule");
    if (d.applies_to !== "claim" && !kinds.has(d.applies_to))
      err(`${at}.applies_to`, "DEADLINE_KIND_UNKNOWN", `'${String(d.applies_to)}' is neither claim nor a kind of this profile`);
    if (!isPosInt(d.days)) err(`${at}.days`, "VALUE_INVALID", "days is a positive integer");
    if (!COUNTS.includes(d.count)) err(`${at}.count`, "COUNT_UNKNOWN", "count is calendar or business");
    if (!STARTS.includes(d.starts)) err(`${at}.starts`, "VALUE_INVALID", `starts is one of ${STARTS.join(", ")}`);
    if (own(d, "extension")) {
      const x = d.extension;
      if (!isObj(x)) err(`${at}.extension`, "VALUE_INVALID", "an extension is {days, count, when}");
      else {
        fields(`${at}.extension`, x, ["days", "count", "when"]);
        if (!isPosInt(x.days)) err(`${at}.extension.days`, "VALUE_INVALID", "days is a positive integer");
        if (!COUNTS.includes(x.count)) err(`${at}.extension.count`, "COUNT_UNKNOWN", "count is calendar or business");
        str(`${at}.extension.when`, x.when, "when");
      }
    }
    str(`${at}.citation`, d.citation, "citation");
    basis(at, d);
  });
}

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
/* combine (R12–R16, R29).                                                                          */

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
    const given = profiles.filter((p) => p.practice && p.practice.minutes_due_days)
      .map((p) => ({ profile: p.id, value: p.practice.minutes_due_days.value, basis: p.practice.minutes_due_days.basis }));
    if (given.length && agree(given))
      view.practice.minutes_due_days = { value: given[0].value, basis: given[0].basis, profile: given[0].profile,
        bases: given.map((g) => ({ profile: g.profile, basis: g.basis })) };
    else if (given.length)
      conflict("practice.minutes_due_days", given,
        "the active profiles give different periods after which absent minutes raise a question, so none is given");
  }

  for (const sec of ["search_terms", "records_laws", "standard_sources", "counterparties"])
    if (has(sec)) { const v = []; for (const p of profiles) union(v, p[sec], p.id); view[sec] = strip(v); }

  /* action kinds, keyed by kind: tier, venue and template are one value each (R29). */
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
      for (const f of ["tier", "venue", "template"]) {
        const vals = given.filter((g) => own(g.k, f)).map((g) => ({ profile: g.profile, value: clone(g.k[f]), basis: g.k.basis }));
        if (!vals.length) continue;
        if (agree(vals)) e[f] = f !== "venue" ? vals[0].value
          : { ...vals[0].value, profile: vals[0].profile, bases: vals.map((v) => ({ profile: v.profile, basis: v.value.basis })) };
        else conflict(`action_kinds[${kind}].${f}`, vals, `the active profiles give different ${f === "tier" ? "risk tiers" : `${f}s`} for ${kind}, so none is given`);
      }
      e.basis = given[0].k.basis;
      e.profile = given[0].profile;
      e.bases = given.map((g) => ({ profile: g.profile, basis: g.k.basis }));
      view.action_kinds.push(e);
    }
  }

  /* deadlines, keyed by rule and what they apply to: days, count and starts are one value each (R29). */
  if (has("deadlines")) {
    const byRule = new Map();
    for (const p of profiles) for (const d of p.deadlines || []) {
      const k = `${d.rule}\u0000${d.applies_to}`;
      if (!byRule.has(k)) byRule.set(k, []);
      byRule.get(k).push({ profile: p.id, d });
    }
    view.deadlines = [];
    for (const given of byRule.values()) {
      const { rule, applies_to } = given[0].d;
      const e = { rule, applies_to };
      for (const f of ["days", "count", "starts", "extension"]) {
        const vals = given.filter((g) => own(g.d, f)).map((g) => ({ profile: g.profile, value: clone(g.d[f]), basis: g.d.basis }));
        if (!vals.length) continue;
        if (agree(vals)) e[f] = vals[0].value;
        else conflict(`deadlines[${rule}/${applies_to}].${f}`, vals, `the active profiles disagree on the ${f} of ${rule} for ${applies_to}, so it is withheld: the deadline is undetermined`);
      }
      e.citation = [...new Set(given.map((g) => g.d.citation))].join("; ");
      e.basis = given[0].d.basis;
      e.profile = given[0].profile;
      e.bases = given.map((g) => ({ profile: g.profile, basis: g.d.basis }));
      view.deadlines.push(e);
    }
  }

  return { view, conflicts };
}
