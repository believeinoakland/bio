/* REC-203 — IDENTIFIER SPACES: the recognisers and the counting rule of
 * `docs/architecture/BIO_Content_Framework_v0_10.md` §8.3 "WHAT MAKES A SHARED IDENTIFIER COUNT"
 * (BOB #32, 2026-09-23, amended on M-132 2026-09-24; rule 3's APN clause amended by BOB #34
 * 2026-09-25 01:50Z on M-157 — cite until folded).
 *
 * PURE: no store, no network, no clock. `op=idmatch` (store.mjs) is the one caller, and it
 * hands in each end's SYSTEM derived from the record's own locators — never from the caller,
 * because a provenance hop a caller can hand us is one a caller can invent (CLAUDE.md §5).
 *
 * THE RULE, as this file enforces it:
 *   1. A match COUNTS when the REFERENT agrees in two INDEPENDENT systems. Two publications
 *      of one source are ONE system: a republication is judged as the system it republishes.
 *      A fund code counts only when the fund NAME agrees too; a bare code never counts.
 *   2. A space may run in several FORMS AT ONCE, told apart by SHAPE, never by date. A value
 *      matches across forms only through a captured crosswalk. NONE IS CAPTURED (M-157: 0
 *      crosswalk lines), and this build reads none, so two forms stay UNJOINED and say so.
 *   3. The C.M.S. number carries Legistar's COVERAGE FLOOR: below it a citation reads OUTSIDE
 *      THE RECORD'S REACH, never NOT FOUND. An APN is RETIRED only where the assessor's own
 *      lineage records it (roll year and children); otherwise UNDETERMINED between
 *      retired-before-the-lineage and never-a-parcel, naming the vintages searched. Absence is
 *      never "no such parcel".
 *
 * WHAT IT CANNOT DO, stated: it cannot READ a referent. Every referent agreement M-119, M-132
 * and M-157 counted was read BY HAND, and M-157 records that a term-overlap check "is an
 * overlap, not a referent reading". So agreement is either a determinate check (the fund
 * NAME, compared normalised) or a reading someone supplies, returned labelled as theirs. */

/* The C.M.S. coverage floor: the first enactment number Legistar holds, per kind (M-132). */
export const CMS_FLOOR = Object.freeze({ ordinance: 12274, resolution: 75950 });

const CMS_SHAPE = /^(?:C\.?\s?M\.?\s?S\.?\s*)?(\d{4,5})(?:\s*C\.?\s?M\.?\s?S\b\.?)?$/i;
const CMS_KIND = /^(ordinance|resolution)\s+(?:no\.?\s*|number\s+)?(.+)$/i;

/* Alameda's APN: book (digits with an optional letter, or a bare letter), page, parcel (with an
   optional letter), optional sub. M-157's key: every NUMERIC part read as an integer, which removes
   zero-padding (Legistar pads every part, the roll does not) and never folds a digit. */
const APN_SHAPE = /^0*(\d{1,3}[A-Z]?|[A-Z])-0*(\d{1,4})-0*(\d{1,3}[A-Z]?)(?:-0*(\d{1,2}))?$/;

/* The spaces and their forms. A form is a SHAPE; `normal` is the string two values are compared on. */
export const ID_SPACES = Object.freeze({
  cms: {
    label: "resolution or ordinance number (C.M.S.)",
    forms: [{ form: "cms", test: (v) => CMS_SHAPE.exec(v.replace(/^(ordinance|resolution)\s+(no\.?\s*|number\s+)?/i, "")),
              normal: (m) => m[1] }],
    referent: "reading",
  },
  project: {
    label: "project or capital improvement number",
    /* §8.3 rule 2: the forms run CONCURRENTLY (C###### 2000–2026, 100xxxx 2015–2026, M-132), so they are
       told apart by shape alone. C and P prefixes are kept as separate forms: nothing measured says they
       share an allocator. A suffixed new-form value (`1003439A`) is a different string (M-157). */
    forms: [
      { form: "C#####", test: (v) => /^(C\d{5,6})$/.exec(v), normal: (m) => m[1] },
      { form: "P#####", test: (v) => /^(P\d{5,6})$/.exec(v), normal: (m) => m[1] },
      { form: "100xxxx", test: (v) => /^(100\d{4})$/.exec(v), normal: (m) => m[1] },
      { form: "100xxxx+suffix", test: (v) => /^(100\d{4}[A-Z])$/.exec(v), normal: (m) => m[1] },
    ],
    referent: "reading",
  },
  fund: {
    label: "fund code",
    forms: [{ form: "####", test: (v) => /^(\d{4})$/.exec(v), normal: (m) => m[1] }],
    referent: "name",
  },
  apn: {
    label: "assessor's parcel number (APN)",
    forms: [{ form: "alameda-apn", test: (v) => APN_SHAPE.exec(v),
              normal: (m) => `${m[1].replace(/^0+(?=.)/, "")}-${Number(m[2])}-${m[3].replace(/^0+(?=.)/, "")}-${Number(m[4] || 0)}` }],
    referent: "reading",
  },
});

function clean(space, raw) {
  let v = String(raw == null ? "" : raw).trim().replace(/\s+/g, " ");
  if (space === "project") v = v.replace(/^#\s*/, "").replace(/\s+/g, "").toUpperCase();
  if (space === "apn") v = v.replace(/^APN\s*/i, "").replace(/\s+/g, "").toUpperCase();
  return v;
}

/** Recognise one value in one space. Returns null when no form of the space has its shape. */
export function recognise(space, raw) {
  const S = ID_SPACES[space];
  if (!S) return null;
  const v = clean(space, raw);
  if (!v) return null;
  for (const f of S.forms) {
    const m = f.test(v);
    if (m) {
      const out = { space, value: String(raw).trim(), form: f.form, normal: f.normal(m) };
      if (space === "cms") {
        const k = CMS_KIND.exec(v);
        out.kind = k ? k[1].toLowerCase() : null;
        out.reach = cmsReach(Number(out.normal), out.kind);
      }
      return out;
    }
  }
  return null;
}

/** Whether a C.M.S. number is inside the record's reach (Legistar's floor, M-132). Below the floor it
 *  reads OUTSIDE_REACH — never NOT FOUND. With no stated kind, a number between the two floors could be
 *  an ordinance inside the reach or a resolution below it, and reads UNDETERMINED, saying so. */
export function cmsReach(n, kind = null) {
  const { ordinance, resolution } = CMS_FLOOR;
  if (kind === "ordinance" || kind === "resolution") {
    const floor = CMS_FLOOR[kind];
    return n >= floor
      ? { reach: "INSIDE", says: `a ${kind} at or above Legistar's first (${floor}): the record can look it up` }
      : { reach: "OUTSIDE_REACH", says: `a ${kind} below Legistar's first (${floor}): OUTSIDE THE RECORD'S REACH, `
          + `never "not found" — the record holds no ${kind}s that old` };
  }
  if (n < ordinance)
    return { reach: "OUTSIDE_REACH", says: `below both of Legistar's floors (ordinances ${ordinance}, resolutions `
      + `${resolution}): OUTSIDE THE RECORD'S REACH, never "not found"` };
  if (n >= resolution)
    return { reach: "INSIDE", says: `at or above both of Legistar's floors: the record can look it up` };
  return { reach: "UNDETERMINED", says: `between Legistar's ordinance floor (${ordinance}) and its resolution floor `
    + `(${resolution}) with no kind stated: an ordinance here is inside the reach, a resolution is outside it` };
}

/** An APN's standing under §8.3 rule 3 as BOB #34 amended it (2026-09-25 01:50Z, on M-157).
 *  `evidence`, all optional: `current` (a Set of keys in the assessor's CURRENT layer), `lineage` (a Map of
 *  key → [{ roll_year, children }], the assessor's OWN retirement records), `vintages` (the names of every
 *  published vintage searched). RETIRED only where the lineage records it; never NO SUCH PARCEL. */
export function apnStanding(key, evidence = {}) {
  const vintages = Array.isArray(evidence.vintages) ? evidence.vintages.slice() : [];
  if (evidence.current && evidence.current.has(key))
    return { standing: "CURRENT", vintages_searched: vintages, says: "in the assessor's current parcel layer" };
  const rec = evidence.lineage && evidence.lineage.get(key);
  if (rec && rec.length) {
    const first = rec.slice().sort((a, b) => a.roll_year - b.roll_year)[0];
    const children = [...new Set(rec.flatMap((r) => r.children || []))].sort();
    return { standing: "RETIRED", roll_year: first.roll_year, children, vintages_searched: vintages,
             says: `retired in roll year ${first.roll_year}, as the assessor's own lineage records` };
  }
  return {
    standing: "UNDETERMINED", between: ["retired before the earliest published lineage", "never a parcel"],
    vintages_searched: vintages,
    says: vintages.length
      ? `in none of the ${vintages.length} published vintage(s) searched; undetermined between retired before the `
        + `lineage and never a parcel — never "no such parcel"`
      : `no published vintage of the assessor's roll or lineage is held here, so none was searched; undetermined `
        + `between retired before the lineage and never a parcel — never "no such parcel"`,
  };
}

/* THE SYSTEMS, per institution, as measured (M-119's host-stack table, M-132, M-157). A publication is
   judged as the system it PUBLISHES: `origin` is that system, and a republication names what it republishes.
   A host serving many offices' publications names NO system, because which office a document there came
   from is not derivable from its address — and reading it as a second system is the direction that
   manufactures a match. */
export const ID_SYSTEMS = Object.freeze([
  /* webapi.legistar.com serves EVERY client city, so only its Oakland path is Oakland's record. */
  { hosts: ["webapi.legistar.com"], path: /^\/v1\/oakland(\/|$)/i,
    origin: "oakland.legistar", name: "Legistar, the City of Oakland's legislative record", basis: "M-119 LEG" },
  { hosts: ["oakland.legistar.com", "oakland.legistar1.com"], path: null,
    origin: "oakland.legistar", name: "Legistar, the City of Oakland's legislative record", basis: "M-119 LEG" },
  { hosts: ["data.oaklandca.gov"], path: /vmzx-e5fe/i,
    origin: "oakland.budget", name: "the City of Oakland's budget system (its Open Data line items)", basis: "M-119 ODP" },
  { hosts: ["data.oaklandca.gov"], path: /c3xp-qcgn/i, republishes: true, stated: false,
    origin: "alameda.assessor", name: "the Alameda County Assessor's parcel layer, REPUBLISHED by Oakland's portal "
      + "(the portal does not state its provenance; its schema, keys and 2012-13 vintage are the county's)",
    basis: "M-132, M-157" },
  { hosts: ["services5.arcgis.com", "data.acgov.org"], path: /(ROBnTHSNjoZ2Wm1P\/.*(Parcel|Assessor_Office))/i,
    origin: "alameda.assessor", name: "the Alameda County Assessor's own publications (Open Data Hub)",
    basis: "M-157 (4)" },
  { hosts: ["aca-prod.accela.com"], path: /\/OAKLAND\//i,
    origin: "oakland.permits", name: "the City of Oakland's permit system (Accela)", basis: "M-157 (1)" },
  { hosts: ["www.oaklandauditor.com"], path: null,
    origin: "oakland.auditor", name: "the Office of the City Auditor", basis: "M-119 AUD" },
]);

/* Hosts that serve MANY systems' publications, named so the answer says why it names no system. */
const MIXED_HOSTS = Object.freeze({
  "www.oaklandca.gov": "the City's general website, serving many offices' publications",
  "cao-94612.s3.us-west-2.amazonaws.com": "the storage behind the City's general website, serving many offices' publications",
});

/** The system ONE address belongs to, or `{ origin: null, why }`. */
export function systemOfAddress(address) {
  let u;
  try { u = new URL(String(address)); } catch { return { origin: null, why: "not a parseable address" }; }
  const host = u.hostname.toLowerCase();
  const path = u.pathname + u.search;
  for (const s of ID_SYSTEMS) {
    if (!s.hosts.includes(host)) continue;
    if (s.path && !s.path.test(path)) continue;
    return { origin: s.origin, name: s.name, republication: !!s.republishes, provenance_stated: s.stated !== false,
             basis: s.basis, host };
  }
  if (MIXED_HOSTS[host]) return { origin: null, host, why: `${MIXED_HOSTS[host]}; which system a document there `
    + `came from is not derivable from its address` };
  return { origin: null, host, why: "no system is measured for this address" };
}

/** The system a CAPTURE belongs to, from every address the record located it at. All of them must name the
 *  same system; otherwise the capture's system is UNDETERMINED and the answer says why. */
export function systemOfAddresses(addresses) {
  const list = [...new Set((addresses || []).map(String))];
  if (!list.length) return { origin: null, addresses: [], why: "the record holds no address this capture was retrieved from" };
  const each = list.map((a) => ({ address: a, ...systemOfAddress(a) }));
  const origins = [...new Set(each.map((e) => e.origin))];
  if (origins.length === 1 && origins[0]) return { ...each[0], addresses: list };
  if (origins.length === 1) return { origin: null, addresses: list, why: each[0].why };
  return { origin: null, addresses: list, why: "the record located these bytes at addresses of different or unknown "
    + "systems, so which one published them is undetermined", each };
}

function normName(n) {
  return String(n == null ? "" : n).toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\bfund\b/g, " ")
    .replace(/\s+/g, " ").trim();
}

/** §8.3's counting rule over ONE pair. `a` and `b`: `{ rec, system, name }` — `rec` from `recognise`,
 *  `system` from `systemOfAddresses` (derived from the record, never the caller), `name` for a fund.
 *  `reading`: a referent reading SUPPLIED by the caller ('agrees' | 'disagrees' | null), returned labelled as
 *  theirs. The checks run in an order that is itself the rule: the value, the form, the INDEPENDENCE of the
 *  systems, and only then the referent — so no reading can count two publications of one source. */
export function judgePair(space, a, b, reading = null) {
  const verdict = (v, counts, says, extra = {}) => ({ verdict: v, counts, says, ...extra });
  if (a.rec.form !== b.rec.form)
    return verdict("FORMS_UNJOINED", false, `the values are in different forms of the ${ID_SPACES[space].label} `
      + `(${a.rec.form}, ${b.rec.form}); two forms join only through a CAPTURED CROSSWALK, and none is captured `
      + `(M-157: 0 crosswalk lines), so the two stay unjoined — not a mismatch, an unmade join`);
  if (a.rec.normal !== b.rec.normal) {
    const near = a.rec.normal.replace(/^0+/, "") === b.rec.normal.replace(/^0+/, "");
    return verdict("VALUES_DIFFER", false, near
      ? `the values differ only by a leading zero (${a.rec.normal}, ${b.rec.normal}): a NEAR-MISS, never counted — `
        + `a digit is never folded`
      : `different values (${a.rec.normal}, ${b.rec.normal})`, { near_miss: near });
  }
  if (!a.system.origin || !b.system.origin)
    return verdict("SYSTEM_UNDETERMINED", false, `which system published ${!a.system.origin ? "the first" : "the second"} `
      + `end is undetermined (${(!a.system.origin ? a.system : b.system).why}); a match counts only between two `
      + `systems known to be independent`);
  if (a.system.origin === b.system.origin)
    return verdict("SAME_SYSTEM", false, `both ends are publications of ONE system (${a.system.origin}); two `
      + `publications of one source are one system, however many documents carry the number`);
  if (space === "fund") {
    const na = normName(a.name), nb = normName(b.name);
    if (!na || !nb)
      return verdict("FUND_NAME_ABSENT", false, `a fund code counts only when the fund NAME agrees too, and `
        + `${!na ? "the first" : "the second"} end names no fund — a bare four-digit code collides with years`);
    if (na === nb)
      return verdict("SHARED", true, `one value, two independent systems (${a.system.origin}, ${b.system.origin}), `
        + `and the fund names agree`, { referent: { by: "the names, compared normalised", agrees: true } });
  }
  if (reading !== "agrees" && reading !== "disagrees")
    return verdict("REFERENT_UNREAD", false, space === "fund"
      ? `the fund names differ as written (${a.name} / ${b.name}); whether they name one fund is a READING nobody `
        + `has supplied, so the match is not counted`
      : `one value in two independent systems, but the REFERENT has not been read: a match counts only when what `
        + `the number names agrees in both, and that is read, never inferred from the string`);
  if (reading === "disagrees")
    return verdict("REFERENT_DISAGREES", false, `the same string names different things: not a match`,
      { referent: { by: "the caller's reading", agrees: false } });
  return verdict("SHARED", true, `one value, two independent systems (${a.system.origin}, ${b.system.origin}), and `
    + `the referent agrees ON THE CALLER'S READING — a reading this plane did not make and cannot check`,
    { referent: { by: "the caller's reading", agrees: true } });
}
