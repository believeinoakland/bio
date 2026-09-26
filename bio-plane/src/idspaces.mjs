/* id-spaces — whether one identifier, appearing in two captured documents, is a shared identifier that
 * counts as a connection (`build/requirements/id-spaces.md`; `docs/architecture/BIO_Content_Framework_v0_10.md`
 * §8.3 "WHAT MAKES A SHARED IDENTIFIER COUNT", with BOB #34's amendment to rule 3, 2026-09-25).
 *
 * PURE: no store, no network, no clock (R23). It names no place (R24): every local fact (the spaces' forms,
 * the enactment kinds and their coverage floors, the publishing systems, the mixed hosts, the crosswalks)
 * comes from `view`, the combined view of the active jurisdiction profiles that `jurisdictions.combine`
 * gives. `view.conflicts` (or a whole `combine` result, `{ok, view, conflicts}`) carries the facts combine
 * withheld because the profiles disagree; a fact withheld is a fact this module does not have.
 *
 * THE RULE, as this file enforces it:
 *   1. A match COUNTS when the REFERENT agrees in two INDEPENDENT systems. Two publications of one source
 *      are ONE system: a republication is judged as the system it republishes. A fund code counts only
 *      when the fund NAME agrees too; a bare code never counts.
 *   2. A space may run in several FORMS AT ONCE, told apart by SHAPE, never by date. A value matches
 *      across forms only through a crosswalk the view supplies; otherwise the two stay UNJOINED.
 *   3. Below an enactment kind's coverage floor a number is OUTSIDE THE RECORD'S REACH, never absent. A
 *      parcel is RETIRED only where the assessor's own lineage records it; otherwise UNDETERMINED.
 *
 * WHAT IT CANNOT DO, stated: it cannot READ a referent. Agreement is either a determinate check (the fund
 * NAME, compared normalised) or a reading the caller supplies, returned labelled as theirs. */

/* The four spaces, their generic labels (used only when the view gives none) and what their referent is. */
const SPACES = Object.freeze({
  enactment: { label: "enactment number (an ordinance or resolution number)", referent: "reading" },
  project: { label: "project number", referent: "reading" },
  fund: { label: "fund code", referent: "name" },
  parcel: { label: "parcel number", referent: "reading" },
});
const SPACE_NAMES = Object.keys(SPACES);
const has = (o, k) => o != null && Object.prototype.hasOwnProperty.call(o, k);
const isObj = (o) => o != null && typeof o === "object";

/* ---------------------------------------------------------------- the view, read defensively (never throws) */

function viewOf(v) {
  if (!isObj(v)) return { view: {}, conflicts: [] };
  if (has(v, "view") && isObj(v.view) && has(v, "ok")) {
    const conflicts = Array.isArray(v.conflicts) ? v.conflicts : Array.isArray(v.view.conflicts) ? v.view.conflicts : [];
    return { view: v.view, conflicts };
  }
  return { view: v, conflicts: Array.isArray(v.conflicts) ? v.conflicts : [] };
}
const arr = (x) => (Array.isArray(x) ? x : []);
function spaceOf(view, space) {
  if (!SPACE_NAMES.includes(space)) return null;
  const s = isObj(view.spaces) && has(view.spaces, space) && isObj(view.spaces[space]) ? view.spaces[space] : {};
  return s;
}
const formsOf = (view, space) => arr((spaceOf(view, space) || {}).forms).filter(isObj);
const kindsOf = (view) => arr((spaceOf(view, "enactment") || {}).kinds).filter(isObj);

/* A pattern `{re, flags}` compiled, or null when it does not compile. `mode`: "whole" (the value's whole
   shape), "start" (a prefix to remove) or "find" (anywhere, as over an address's path). */
const COMPILED = new WeakMap();
function compile(p, mode) {
  if (!isObj(p) || typeof p.re !== "string") return null;
  let byMode = COMPILED.get(p);
  if (!byMode) COMPILED.set(p, (byMode = {}));
  if (has(byMode, mode)) return byMode[mode];
  const flags = typeof p.flags === "string" ? p.flags.replace(/[^iu]/g, "") : "";
  let re = null;
  try {
    re = new RegExp(mode === "whole" ? `^(?:${p.re})$` : mode === "start" ? `^(?:${p.re})` : p.re, flags);
  } catch { re = null; }
  byMode[mode] = re;
  return re;
}

/* ---------------------------------------------------------------- spaces (R1, R2) */

/** The four spaces, each with the forms the view supplies. Never throws. */
export function spaces(v) {
  const { view } = viewOf(v);
  return SPACE_NAMES.map((space) => {
    const s = spaceOf(view, space);
    const label = typeof s.label === "string" && s.label ? s.label : SPACES[space].label;
    return { space, label, referent: SPACES[space].referent, forms: formsOf(view, space).map((f) => ({ ...f })) };
  });
}

/* ---------------------------------------------------------------- recognise (R3, R4, R5) */

function cleaned(form, value) {
  let v = value.trim();
  const c = isObj(form.clean) ? form.clean : {};
  for (const p of arr(c.strip)) {
    const re = compile(p, "start");
    if (re) v = v.replace(re, "").trim();
  }
  if (c.spaces === "remove") v = v.replace(/\s+/g, "");
  else v = v.replace(/\s+/g, " ");
  if (c.upper === true) v = v.toUpperCase();
  return v;
}

/* The normal form: the listed parts, each a literal or a capture group with its padding or case removed.
   Only formatting is removed; no transform here can change a digit (R4). */
function normalOf(form, m) {
  const parts = Array.isArray(form.normal) && form.normal.length ? form.normal : [{ group: 0 }];
  let out = "";
  for (const part of parts) {
    if (typeof part === "string") { out += part; continue; }
    if (!isObj(part)) return null;
    const g = part.group;
    let s = typeof g === "number" ? m[g] : typeof g === "string" && m.groups ? m.groups[g] : undefined;
    if (s === undefined) s = typeof part.default === "string" ? part.default : "";
    if (part.unpad === true) s = s.replace(/^0+(?=.)/, "");
    if (part.upper === true) s = s.toUpperCase();
    out += s;
  }
  return out;
}

function matchForm(form, value) {
  const re = compile(form.pattern, "whole");
  if (!re) return null;
  const m = re.exec(cleaned(form, value));
  if (!m) return null;
  const normal = normalOf(form, m);
  return normal ? normal : null;
}

/* An enactment's kind, from the words naming it before the number, and the value with those words removed. */
function kindPrefix(view, value) {
  for (const k of kindsOf(view)) {
    if (typeof k.kind !== "string") continue;
    const re = compile(k.prefix, "start");
    if (!re) continue;
    const m = re.exec(value);
    if (m && m[0].length) return { kind: k.kind, rest: value.slice(m[0].length).trim() };
  }
  return { kind: null, rest: value };
}

/** One value recognised in one space, or null (R3). Never throws. */
export function recognise(v, space, value) {
  const { view } = viewOf(v);
  if (!SPACE_NAMES.includes(space)) return null;
  if (typeof value !== "string" && typeof value !== "number") return null;
  const raw = String(value).trim();
  if (!raw) return null;
  let rest = raw, kind = null;
  if (space === "enactment") ({ kind, rest } = kindPrefix(view, raw));
  if (!rest) return null;
  for (const f of formsOf(view, space)) {
    if (typeof f.form !== "string") continue;
    const normal = matchForm(f, rest);
    if (normal == null) continue;
    const out = { space, value: raw, form: f.form, normal };
    if (space === "enactment") {
      out.kind = kind;
      out.reach = reach(v, normal, kind);
    }
    return out;
  }
  return null;
}

/* ---------------------------------------------------------------- reach (R6–R9) */

function systemName(view, origin) {
  const s = arr(view.systems).find((x) => isObj(x) && x.origin === origin);
  return s && typeof s.name === "string" ? s.name : origin;
}

/* The conflicts combine reported over a kind's floor. `at` names the fact; it is matched on the kind and
   the word "floor", so a report of the floor of that kind is found however the path is spelled. */
function floorConflicts(conflicts, kind) {
  return conflicts.filter((c) => {
    if (!isObj(c)) return false;
    const at = typeof c.at === "string" ? c.at : JSON.stringify(c.at ?? "");
    return /floor/i.test(at) && new RegExp(`(^|[^a-z0-9_])${kind.replace(/[^a-z0-9_]/gi, "\\$&")}([^a-z0-9_]|$)`, "i").test(at);
  });
}
function conflictSays(cs) {
  return cs.map((c) => arr(c.values).map((x) => isObj(x)
    ? `${x.profile ?? "a profile"} gives ${JSON.stringify(isObj(x.value) && has(x.value, "first") ? x.value.first : x.value)}`
    : String(x)).join(", ")).join("; ");
}

/* The floor of one kind: `{floor, system}`, or `{why}` naming which of R9's two causes applies. */
function floorOf(view, conflicts, kind) {
  const entries = kindsOf(view).filter((k) => k.kind === kind);
  const floors = entries.map((k) => k.floor).filter((f) => isObj(f) && Number.isFinite(f.first));
  const distinct = [...new Set(floors.map((f) => f.first))];
  if (distinct.length === 1) {
    const f = floors[0];
    return { floor: f.first, system: f.system, basis: f.basis };
  }
  const cs = floorConflicts(conflicts, kind);
  if (distinct.length > 1 || cs.length)
    return { conflict: true, why: `the active profiles give conflicting coverage floors for ${kind} (${
      cs.length ? conflictSays(cs) : distinct.join(", ")}), and a conflict is never decided here` };
  if (!entries.length) return { why: `the active profiles name no enactment kind "${kind}", so no coverage floor is measured for it` };
  return { why: `no coverage floor is measured for ${kind} in the active profiles` };
}

const outsideSays = (view, kind, f) => `a ${kind} below ${systemName(view, f.system)}'s first (${f.floor}): OUTSIDE THE `
  + `RECORD'S REACH — the record's source holds no ${kind} that old, which says nothing of whether this one exists`;

/** Whether an enactment number is inside the record's reach (R6–R9). Never throws. */
export function reach(v, number, kind = null) {
  const { view, conflicts } = viewOf(v);
  const n = typeof number === "number" ? number
    : typeof number === "string" && /^\s*\d+\s*$/.test(number) ? Number(number) : NaN;
  if (!Number.isFinite(n))
    return { reach: "UNDETERMINED", says: `${JSON.stringify(String(number))} is not a number, so it cannot be compared with a coverage floor` };
  if (typeof kind === "string" && kind) {
    const f = floorOf(view, conflicts, kind);
    if (f.floor == null) return { reach: "UNDETERMINED", says: `${f.why}: whether ${n} is inside the record's reach is undetermined` };
    return n >= f.floor
      ? { reach: "INSIDE", floor: f.floor, says: `a ${kind} at or above ${systemName(view, f.system)}'s first (${f.floor}): the record can look it up` }
      : { reach: "OUTSIDE_REACH", floor: f.floor, says: outsideSays(view, kind, f) };
  }
  const kinds = [...new Set(kindsOf(view).map((k) => k.kind).filter((k) => typeof k === "string" && k))];
  if (!kinds.length)
    return { reach: "UNDETERMINED", says: "the active profiles name no enactment kind, so no coverage floor is measured" };
  const each = kinds.map((k) => ({ kind: k, ...floorOf(view, conflicts, k) }));
  const known = each.filter((e) => e.floor != null);
  const named = known.map((e) => `${e.kind} ${e.floor}`).join(", ");
  if (known.length && known.every((e) => n < e.floor) && known.length === each.length)
    return { reach: "OUTSIDE_REACH", says: `below every kind's coverage floor (${named}): OUTSIDE THE RECORD'S REACH — the `
      + `record's source holds nothing that old, which says nothing of whether this one exists` };
  if (known.length === each.length && known.every((e) => n >= e.floor))
    return { reach: "INSIDE", says: `at or above every kind's coverage floor (${named}): the record can look it up` };
  const unknown = each.filter((e) => e.floor == null).map((e) => e.why);
  return { reach: "UNDETERMINED", says: `no kind stated, and ${[
    known.length ? `${n} is inside the reach for some kinds and outside it for others (floors: ${named})` : null,
    ...unknown].filter(Boolean).join("; ")}: whether it is inside the record's reach is undetermined` };
}

/* ---------------------------------------------------------------- parcelStanding (R10–R12) */

function inCurrent(current, key) {
  if (current instanceof Set) return current.has(key);
  if (Array.isArray(current)) return current.includes(key);
  return false;
}
function lineageOf(lineage, key) {
  let rec;
  if (lineage instanceof Map) rec = lineage.get(key);
  else if (isObj(lineage) && typeof key === "string" && has(lineage, key)) rec = lineage[key];
  if (isObj(rec) && !Array.isArray(rec)) rec = [rec];
  return arr(rec).filter((r) => isObj(r) && Number.isFinite(r.roll_year));
}

/** A parcel key's standing from the assessor's own evidence (R10–R12). Never throws. */
export function parcelStanding(key, evidence) {
  const ev = isObj(evidence) ? evidence : {};
  const vintages = arr(ev.vintages).map(String);
  if (inCurrent(ev.current, key))
    return { standing: "CURRENT", vintages_searched: vintages, says: "in the assessor's current parcel layer" };
  const rec = lineageOf(ev.lineage, key);
  if (rec.length) {
    const roll_year = Math.min(...rec.map((r) => r.roll_year));
    const children = [...new Set(rec.flatMap((r) => arr(r.children).map(String)))].sort();
    return { standing: "RETIRED", roll_year, children, vintages_searched: vintages,
             says: `retired in roll year ${roll_year}, as the assessor's own lineage records` };
  }
  return {
    standing: "UNDETERMINED", between: ["retired before the earliest published lineage", "never a parcel"],
    vintages_searched: vintages,
    says: (vintages.length
      ? `in none of the ${vintages.length} published vintage(s) searched`
      : "no published vintage of the assessor's roll or lineage is held, so none was searched")
      + "; undetermined between retired before the earliest published lineage and never a parcel — absence from "
      + "what was searched decides neither",
  };
}

/* ---------------------------------------------------------------- systemOf (R13–R15) */

function systemOfOne(view, address) {
  let u;
  try { u = new URL(String(address)); } catch { return { origin: null, unknown: true, why: "not a parseable address" }; }
  const host = u.hostname.toLowerCase();
  const path = u.pathname + u.search;
  for (const s of arr(view.systems)) {
    if (!isObj(s) || typeof s.origin !== "string" || !s.origin) continue;
    if (!arr(s.hosts).some((h) => typeof h === "string" && h.toLowerCase() === host)) continue;
    if (s.path != null) {
      const re = compile(s.path, "find");
      if (!re || !re.test(path)) continue;
    }
    return { origin: s.origin, name: typeof s.name === "string" ? s.name : s.origin, republication: s.republishes === true,
             provenance_stated: s.provenance_stated !== false, basis: s.basis ?? null };
  }
  const mixed = arr(view.mixed_hosts).find((m) => isObj(m) && typeof m.host === "string" && m.host.toLowerCase() === host);
  if (mixed) return { origin: null, unknown: true, why: `${host} serves many offices' publications${
    typeof mixed.why === "string" && mixed.why ? ` (${mixed.why})` : ""}; which system a document there came from is not derivable from its address` };
  return { origin: null, unknown: true, why: `no system in the active profiles matches ${host}` };
}

/** The system a capture belongs to, from every address the record located it at (R13–R15). Never throws. */
export function systemOf(v, addresses) {
  const { view } = viewOf(v);
  const given = typeof addresses === "string" ? [addresses] : arr(addresses);
  const list = [...new Set(given.filter((a) => a != null).map(String))];
  if (!list.length) return { origin: null, addresses: [], why: "no addresses: the record holds no address this capture was retrieved from" };
  const each = list.map((address) => ({ address, ...systemOfOne(view, address) }));
  const origins = [...new Set(each.map((e) => e.origin))];
  if (origins.length === 1 && origins[0]) {
    const { origin, name, republication, provenance_stated, basis } = each[0];
    return { origin, name, republication, provenance_stated, basis, addresses: list };
  }
  const why = list.length === 1 ? each[0].why
    : each.every((e) => !e.origin) ? `unknown systems: none of these ${list.length} addresses names a system (${[...new Set(each.map((e) => e.why))].join("; ")})`
    : each.some((e) => !e.origin) ? "unknown systems: some of these addresses name no system, so which one published the bytes is undetermined"
    : `different systems (${origins.join(", ")}): the record located these bytes at addresses of more than one system, so which one published them is undetermined`;
  return { origin: null, addresses: list, why, each: each.map(({ unknown, ...e }) => e) };
}

/* ---------------------------------------------------------------- judgePair (R16–R22) */

function normName(n) {
  return String(n == null ? "" : n).toLowerCase().replace(/[^\p{L}\p{N} ]+/gu, " ").replace(/\bfund\b/gu, " ")
    .replace(/\s+/g, " ").trim();
}
const unpadAll = (s) => String(s).replace(/(^|\D)0+(?=\d)/g, "$1");

/* A crosswalk the view supplies between the two forms: whether it joins these two values. */
function throughCrosswalk(view, space, ra, rb) {
  const walks = arr(view.crosswalks).filter((c) => isObj(c) && c.space === space && Array.isArray(c.forms)
    && ((c.forms[0] === ra.form && c.forms[1] === rb.form) || (c.forms[0] === rb.form && c.forms[1] === ra.form)));
  if (!walks.length) return null;
  const formByName = new Map(formsOf(view, space).map((f) => [f.form, f]));
  const norm = (form, value) => {
    const f = formByName.get(form);
    return f && (typeof value === "string" || typeof value === "number") ? matchForm(f, String(value)) : null;
  };
  const partners = new Set();
  for (const c of walks) {
    const aFirst = c.forms[0] === ra.form;
    for (const p of arr(c.pairs)) {
      if (!Array.isArray(p) || p.length < 2) continue;
      const [x, y] = aFirst ? [norm(c.forms[0], p[0]), norm(c.forms[1], p[1])] : [norm(c.forms[1], p[1]), norm(c.forms[0], p[0])];
      if (x != null && x === ra.normal && y != null) partners.add(y);
    }
  }
  return { sources: walks.map((c) => c.source), partners: [...partners] };
}

/** §8.3's counting rule over one pair (R16–R22). Throws TypeError only when an end is unrecognised or not in
 *  `space`; the caller must recognise both values first. */
export function judgePair(v, space, a, b, reading = null) {
  const ra = isObj(a) ? a.rec : null, rb = isObj(b) ? b.rec : null;
  if (!isObj(ra) || !isObj(rb)) throw new TypeError("judgePair: a.rec and b.rec must both be recognised values (recognise() first)");
  if (!SPACE_NAMES.includes(space) || ra.space !== space || rb.space !== space)
    throw new TypeError(`judgePair: both values must be recognised in the space "${space}"`);
  const { view } = viewOf(v);
  const label = spaces(view).find((s) => s.space === space).label;
  const verdict = (vd, says, extra = {}) => ({ verdict: vd, counts: vd === "SHARED", says, ...extra });
  let via = "";

  /* 1. the form (R17) */
  if (ra.form !== rb.form) {
    const cw = throughCrosswalk(view, space, ra, rb);
    if (!cw)
      return verdict("FORMS_UNJOINED", `the values are in different forms of the ${label} (${ra.form}, ${rb.form}); two forms `
        + "join only through a crosswalk, and the active profiles supply none between these, so the two stay unjoined: "
        + "an unmade join, not a mismatch");
    if (!cw.partners.length)
      return verdict("FORMS_UNJOINED", `the values are in different forms of the ${label} (${ra.form}, ${rb.form}), and the `
        + `crosswalk between them (${cw.sources.join(", ")}) lists no partner for ${ra.normal}: an unmade join, not a mismatch`);
    if (!cw.partners.includes(rb.normal))
      return verdict("VALUES_DIFFER", `through the crosswalk (${cw.sources.join(", ")}), ${ra.normal} is ${cw.partners.join(" or ")} `
        + `in the form ${rb.form}, not ${rb.normal}`, { near_miss: false });
    via = ` (the forms joined through the crosswalk ${cw.sources.join(", ")})`;
  } else if (ra.normal !== rb.normal) {
    /* 2. the value (R18) */
    const near = unpadAll(ra.normal) === unpadAll(rb.normal);
    return verdict("VALUES_DIFFER", near
      ? `the values differ only by leading zeros (${ra.normal}, ${rb.normal}): a near miss, never counted — a digit is never folded`
      : `different values (${ra.normal}, ${rb.normal})`, { near_miss: near });
  }

  /* 3. the systems' independence (R19) */
  const sa = isObj(a.system) ? a.system : {}, sb = isObj(b.system) ? b.system : {};
  if (!sa.origin || !sb.origin) {
    const which = !sa.origin ? "first" : "second", s = !sa.origin ? sa : sb;
    return verdict("SYSTEM_UNDETERMINED", `which system published the ${which} end is undetermined${
      typeof s.why === "string" ? ` (${s.why})` : ""}; a match counts only between two systems known to be independent`);
  }
  if (sa.origin === sb.origin)
    return verdict("SAME_SYSTEM", `both ends are publications of one system (${sa.origin}); two publications of one source `
      + "are one system, however many documents carry the value");

  /* 4. the fund name (R20) */
  if (space === "fund") {
    const na = normName(a.name), nb = normName(b.name);
    if (!na || !nb)
      return verdict("FUND_NAME_ABSENT", `a fund code counts only when the fund name agrees too, and the ${
        !na ? "first" : "second"} end names no fund — a bare code is not counted`);
    if (na === nb)
      return verdict("SHARED", `one value${via}, two independent systems (${sa.origin}, ${sb.origin}), and the fund names agree`,
        { referent: { by: "the names, compared normalised", agrees: true } });
  }

  /* 5. the referent (R21) */
  if (reading !== "agrees" && reading !== "disagrees")
    return verdict("REFERENT_UNREAD", space === "fund"
      ? `the fund names differ as written (${a.name} / ${b.name}); whether they name one fund is a reading nobody has supplied, `
        + "so the match is not counted"
      : `one value${via} in two independent systems, but the referent has not been read: a match counts only when what the `
        + "value names agrees in both, and that is read, never inferred from the string");
  if (reading === "disagrees")
    return verdict("REFERENT_DISAGREES", "the same value names different things, on the caller's reading: not a match",
      { referent: { by: "the caller's reading", agrees: false } });
  return verdict("SHARED", `one value${via}, two independent systems (${sa.origin}, ${sb.origin}), and the referent agrees on `
    + "the caller's reading — a reading this module did not make and cannot check",
    { referent: { by: "the caller's reading, which this module did not make and cannot check", agrees: true } });
}
