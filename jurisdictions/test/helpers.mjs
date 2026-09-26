/* Test helpers for jurisdictions: an independent reading of R3 (a value in a form), a system lookup as
 * id-spaces R13–R14 state it, a walk over every fact that carries a basis, and `legacy`: a fixed copy of
 * the local facts and recognisers in the code at `snapshot/pre-refactor-2026-09-25`, the oracle R21 and
 * R30 are judged against. The copy is frozen evidence, not product code. */

/* ---------------------------------------------------------------------------------------------- */
/* R3, read independently of the module.                                                           */

const rx = (p) => new RegExp(p.re, p.flags || "");
const atStart = (p) => new RegExp(`^(?:${p.re})`, p.flags || "");

export function applyForm(form, raw, prefixes = []) {
  let v = String(raw == null ? "" : raw).trim();
  for (const p of prefixes) v = v.replace(atStart(p), "");
  const c = form.clean || {};
  for (const p of c.strip || []) v = v.replace(atStart(p), "");
  v = c.spaces === "remove" ? v.replace(/\s+/g, "") : v.replace(/\s+/g, " ").trim();
  if (c.upper) v = v.toUpperCase();
  if (!v) return null;
  const m = rx(form.pattern).exec(v);
  if (!m) return null;
  return form.normal.map((part) => {
    if (typeof part === "string") return part;
    let g = m[part.group];
    if (g == null) g = part.default ?? "";
    if (part.unpad) g = g.replace(/^0+(?=.)/, "");
    if (part.upper) g = g.toUpperCase();
    return g;
  }).join("");
}

/** A value in a space of a view or profile: the first form that reads it; for enactment, the kind whose
 *  prefix it opens with. */
export function recogniseIn(view, space, raw) {
  const s = view.spaces && view.spaces[space];
  if (!s) return null;
  let kind = null;
  const cleaned = String(raw == null ? "" : raw).trim().replace(/\s+/g, " ");
  for (const k of s.kinds || []) if (atStart(k.prefix).test(cleaned) && cleaned.replace(atStart(k.prefix), "")) { kind = k.kind; break; }
  const prefixes = kind ? [s.kinds.find((k) => k.kind === kind).prefix] : [];
  for (const f of s.forms) {
    const normal = applyForm(f, cleaned, prefixes);
    if (normal != null) return { space, form: f.form, normal, kind };
  }
  return null;
}

/** The system an address names in a view or profile (id-spaces R13–R14). */
export function systemOf(view, address) {
  let u;
  try { u = new URL(String(address)); } catch { return { origin: null }; }
  const host = u.hostname.toLowerCase();
  const path = u.pathname + u.search;
  for (const s of view.systems || []) {
    if (!s.hosts.includes(host)) continue;
    if (s.path && !rx(s.path).test(path)) continue;
    return { origin: s.origin, republishes: s.republishes === true, provenance_stated: s.provenance_stated !== false };
  }
  if ((view.mixed_hosts || []).some((m) => m.host === host)) return { origin: null, mixed: true };
  return { origin: null };
}

/* ---------------------------------------------------------------------------------------------- */
/* Every fact that carries a basis, with the path validate names it by.                            */

export function walkFacts(p, fn) {
  const each = (arr, path) => (Array.isArray(arr) ? arr : []).forEach((e, i) => fn(e, `${path}[${i}]`));
  for (const [name, s] of Object.entries(p.spaces || {})) {
    (s.forms || []).forEach((f, i) => fn(f, `spaces.${name}.forms[${i}]`));
    (s.kinds || []).forEach((k, i) => {
      fn(k, `spaces.${name}.kinds[${i}]`);
      if (k.floor) fn(k.floor, `spaces.${name}.kinds[${i}].floor`);
    });
  }
  each(p.systems, "systems"); each(p.mixed_hosts, "mixed_hosts"); each(p.crosswalks, "crosswalks");
  for (const [key, entries] of Object.entries(p.vocabulary || {})) each(entries, `vocabulary.${key}`);
  if (p.practice && p.practice.minutes_due_days) fn(p.practice.minutes_due_days, "practice.minutes_due_days");
  for (const s of ["search_terms", "records_laws", "standard_sources", "counterparties", "deadlines"]) each(p[s], s);
  (p.action_kinds || []).forEach((k, i) => {
    fn(k, `action_kinds[${i}]`);
    if (k.venue) fn(k.venue, `action_kinds[${i}].venue`);
  });
}
/** The object at a walkFacts path. */
walkFacts.at = (p, path) => path.split(/\.|\[|\]\.?/).filter(Boolean)
  .reduce((o, k) => o[/^\d+$/.test(k) ? Number(k) : k], p);

/* ---------------------------------------------------------------------------------------------- */
/* The snapshot's code (`snapshot/pre-refactor-2026-09-25`), copied as the oracle.                 */

/* bio-plane/src/idspaces.mjs */
const CMS_FLOOR = Object.freeze({ ordinance: 12274, resolution: 75950 });
const CMS_SHAPE = /^(?:C\.?\s?M\.?\s?S\.?\s*)?(\d{4,5})(?:\s*C\.?\s?M\.?\s?S\b\.?)?$/i;
const CMS_KIND = /^(ordinance|resolution)\s+(?:no\.?\s*|number\s+)?(.+)$/i;
const APN_SHAPE = /^0*(\d{1,3}[A-Z]?|[A-Z])-0*(\d{1,4})-0*(\d{1,3}[A-Z]?)(?:-0*(\d{1,2}))?$/;
const ID_SPACES = {
  cms: { label: "resolution or ordinance number (C.M.S.)",
    forms: [{ form: "cms", test: (v) => CMS_SHAPE.exec(v.replace(/^(ordinance|resolution)\s+(no\.?\s*|number\s+)?/i, "")), normal: (m) => m[1] }] },
  project: { label: "project or capital improvement number",
    forms: [
      { form: "C#####", test: (v) => /^(C\d{5,6})$/.exec(v), normal: (m) => m[1] },
      { form: "P#####", test: (v) => /^(P\d{5,6})$/.exec(v), normal: (m) => m[1] },
      { form: "100xxxx", test: (v) => /^(100\d{4})$/.exec(v), normal: (m) => m[1] },
      { form: "100xxxx+suffix", test: (v) => /^(100\d{4}[A-Z])$/.exec(v), normal: (m) => m[1] },
    ] },
  fund: { label: "fund code", forms: [{ form: "####", test: (v) => /^(\d{4})$/.exec(v), normal: (m) => m[1] }] },
  apn: { label: "assessor's parcel number (APN)",
    forms: [{ form: "alameda-apn", test: (v) => APN_SHAPE.exec(v),
      normal: (m) => `${m[1].replace(/^0+(?=.)/, "")}-${Number(m[2])}-${m[3].replace(/^0+(?=.)/, "")}-${Number(m[4] || 0)}` }] },
};
function clean(space, raw) {
  let v = String(raw == null ? "" : raw).trim().replace(/\s+/g, " ");
  if (space === "project") v = v.replace(/^#\s*/, "").replace(/\s+/g, "").toUpperCase();
  if (space === "apn") v = v.replace(/^APN\s*/i, "").replace(/\s+/g, "").toUpperCase();
  return v;
}
function recognise(space, raw) {
  const S = ID_SPACES[space];
  const v = clean(space, raw);
  if (!v) return null;
  for (const f of S.forms) {
    const m = f.test(v);
    if (m) {
      const out = { space, form: f.form, normal: f.normal(m) };
      if (space === "cms") { const k = CMS_KIND.exec(v); out.kind = k ? k[1].toLowerCase() : null; }
      return out;
    }
  }
  return null;
}
const ID_SYSTEMS = [
  { hosts: ["webapi.legistar.com"], path: /^\/v1\/oakland(\/|$)/i, origin: "oakland.legistar" },
  { hosts: ["oakland.legistar.com", "oakland.legistar1.com"], path: null, origin: "oakland.legistar" },
  { hosts: ["data.oaklandca.gov"], path: /vmzx-e5fe/i, origin: "oakland.budget" },
  { hosts: ["data.oaklandca.gov"], path: /c3xp-qcgn/i, republishes: true, stated: false, origin: "alameda.assessor" },
  { hosts: ["services5.arcgis.com", "data.acgov.org"], path: /(ROBnTHSNjoZ2Wm1P\/.*(Parcel|Assessor_Office))/i, origin: "alameda.assessor" },
  { hosts: ["aca-prod.accela.com"], path: /\/OAKLAND\//i, origin: "oakland.permits" },
  { hosts: ["www.oaklandauditor.com"], path: null, origin: "oakland.auditor" },
];
const MIXED_HOSTS = { "www.oaklandca.gov": "", "cao-94612.s3.us-west-2.amazonaws.com": "" };
function systemOfAddress(address) {
  let u;
  try { u = new URL(String(address)); } catch { return { origin: null }; }
  const host = u.hostname.toLowerCase();
  const path = u.pathname + u.search;
  for (const s of ID_SYSTEMS) {
    if (!s.hosts.includes(host)) continue;
    if (s.path && !s.path.test(path)) continue;
    return { origin: s.origin, republication: !!s.republishes, provenance_stated: s.stated !== false };
  }
  if (Object.prototype.hasOwnProperty.call(MIXED_HOSTS, host)) return { origin: null, mixed: true };
  return { origin: null };
}

/* A deterministic corpus of values: the measured shapes, their formatting variants, and near misses. */
function corpus() {
  let seed = 20260926;
  const rand = (n) => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; };
  const out = new Set();
  const nums = ["1", "07", "123", "1234", "12274", "12273", "75950", "75949", "99999", "123456", "0012345", "00001"];
  const cmsPre = ["", "C.M.S. ", "CMS ", "C. M. S.", "c.m.s.", "ordinance ", "Ordinance No. ", "ORDINANCE NUMBER ",
    "resolution no.", "Resolution  No ", "resolution number ", "ordinance no. C.M.S. ", "motion no. "];
  const cmsSuf = ["", " C.M.S.", "C.M.S.", " CMS", " c.m.s", " C.M.S.X", " no"];
  for (const p of cmsPre) for (const n of nums) for (const s of cmsSuf) out.add(`${p}${n}${s}`);
  const projPre = ["", "#", "# ", "  #", "c", "C", "P", "p", "100", "Q"];
  const projBody = ["12345", "123456", "1234", "1234567", "0001", "3439", "3439A", "3439a", "1003439A", "C12345", "12 345"];
  for (const p of projPre) for (const b of projBody) out.add(`${p}${b}`);
  for (const f of ["1010", "2211", "7780", "123", "12345", " 1010 ", "10 10", "fund 1010", "2019"]) out.add(f);
  const apnParts = [["8", "008", "0", "000", "12A", "012a", "A", "Z", "1234", "AB"],
    ["649", "0649", "1", "0", "12345", "00001"], ["12", "012", "1A", "001b", "1234", "0"], [null, "0", "00", "3", "03", "123"]];
  for (let i = 0; i < 1500; i++) {
    const [b, pg, pc, sub] = apnParts.map((a) => a[rand(a.length)]);
    const pre = ["", "APN ", "apn", "APN  ", " "][rand(5)];
    const sep = ["-", "-", "-", " - ", "/"][rand(5)];
    out.add(`${pre}${b}${sep}${pg}${sep}${pc}${sub == null ? "" : `${sep}${sub}`}`);
  }
  for (let i = 0; i < 600; i++) {
    const chars = "0123456789-CPMS.# ACPZ";
    let s = ""; const len = 1 + rand(10);
    for (let j = 0; j < len; j++) s += chars[rand(chars.length)];
    out.add(s);
  }
  for (const s of ["", " ", null, undefined]) out.add(s);
  return [...out];
}

function addresses() {
  const hosts = [...new Set([...ID_SYSTEMS.flatMap((s) => s.hosts), ...Object.keys(MIXED_HOSTS), "example.com", "legistar.com"])];
  const paths = ["/", "/v1/oakland", "/v1/oakland/matters/1", "/v1/oaklandx/matters", "/v1/berkeley/matters", "/V1/OAKLAND/x",
    "/resource/vmzx-e5fe.json", "/resource/c3xp-qcgn.json", "/Resource/C3XP-QCGN", "/resource/abcd-1234.json",
    "/ROBnTHSNjoZ2Wm1P/arcgis/rest/services/Parcels/FeatureServer", "/robnthsnjoz2wm1p/x/Assessor_Office/y",
    "/ROBnTHSNjoZ2Wm1P/arcgis/rest/services/Roads", "/Welcome.aspx", "/CitizenAccess/OAKLAND/Cap", "/citizenaccess/oakland/", "/x?id=vmzx-e5fe"];
  const out = [];
  for (const h of hosts) for (const p of paths) out.push(`https://${h}${p}`);
  out.push("https://OAKLAND.LEGISTAR.COM/View.ashx", "not a url", "", "https://www.oaklandca.gov/documents/x.pdf");
  return out;
}

/* docprofile/doctypes/*: each local pattern, with lines it must and must not match. */
function vocabularySamples() {
  const oracle = {
    furniture: [/^City of Oakland$/i, /^Office of the City Clerk$/i, /^View Report$/i, /^View Legislation$/i,
      /^View (Attachment|Supplemental)\b/i, /^Attachments:$/i, /^Sponsors:$/i],
    bodies: [/(Committee|City Council|Commission|Board|Authority)\s*$/,
      /\b(?:CITY\s+COUNCIL|COUNCIL\s+OF\s+THE\s+CITY|BOARD\s+OF\s+[A-Z]+|COMMISSION|AUTHORITY|CITY\s+OF\s+[A-Z]+)\b/],
    member_titles: [/^Councilmember/i],
    enactment_markers: [/C\.?\s?M\.?\s?S\.?/i],
    codes: [/O\.?M\.?C\.?|Oakland\s+Municipal\s+Code/i],
    file_numbers: [/\d{2}-\d{4}/],
    report_titles: [/^(AGENDA|STAFF|INFORMATIONAL|CITY\s+ADMINISTRATOR'?S?)\s+REPORT\b/i],
    report_sections: [/^RECOMMENDATION\b/i, /^EXECUTIVE\s+SUMMARY\b/i, /^(BACKGROUND|LEGISLATIVE\s+HISTORY|BACKGROUND\s*\/\s*LEGISLATIVE\s+HISTORY)\b/i,
      /^ANALYSIS(\s+AND\s+POLICY\s+ALTERNATIVES)?\b/i, /^FISCAL\s+IMPACT\b/i, /^PUBLIC\s+OUTREACH\b/i, /^COORDINATION\b/i,
      /^SUSTAINABLE\s+OPPORTUNITIES\b/i, /^ACTION\s+REQUESTED\b/i, /^REASON\s+FOR\b/i],
    recommendation_openers: [/\bStaff\s+Recommends\s+That\b/i],
    template_blanks: [/^\s*INTRODUCED\s+BY\b[^\]]*\]\s*/i],
  };
  const lines = {
    furniture: ["City of Oakland", "city of oakland", "City of Oakland Council", "Office of the City Clerk", "View Report", "view report",
      "View Legislation", "View Attachment A", "View Supplemental Report", "View Attachments", "Attachments:", "Sponsors:", "Page 3",
      "Printed on 7/15/2026", "Agenda - SUPPLEMENTAL", "Office of the City Auditor"],
    bodies: ["*Rules & Legislation Committee", "Concurrent Meeting of the Oakland", "and the City Council", "OAKLAND CITY COUNCIL",
      "Public Works Committee", "Planning Commission", "the council met", "BOARD OF PORT COMMISSIONERS", "Port Authority",
      "CITY OF OAKLAND", "Board", "board", "Councilmember Wang"],
    member_titles: ["Councilmember Wang", "councilmember fife", "Council President", "Mayor Barbara"],
    enactment_markers: ["C.M.S.", "CMS", "C. M. S.", "c.m.s", "CBS", "C.M."],
    codes: ["O.M.C. Section 8.28", "OMC Chapter 2", "Oakland Municipal Code", "Berkeley Municipal Code", "the code"],
    file_numbers: ["26-0910", "26-091", "2026-07", "file 25-1234 and", "abc"],
    report_titles: ["AGENDA REPORT", "Staff Report", "INFORMATIONAL REPORT", "CITY ADMINISTRATOR'S REPORT", "City Administrators Report",
      "ANNUAL REPORT", "the agenda report"],
    report_sections: ["RECOMMENDATION", "RECOMMENDATIONS", "EXECUTIVE SUMMARY", "BACKGROUND / LEGISLATIVE HISTORY", "LEGISLATIVE HISTORY",
      "ANALYSIS AND POLICY ALTERNATIVES", "ANALYSIS", "FISCAL IMPACT", "PUBLIC OUTREACH / INTEREST", "COORDINATION", "SUSTAINABLE OPPORTUNITIES",
      "ACTION REQUESTED OF THE CITY COUNCIL", "REASON FOR SUPPLEMENTAL", "CONCLUSION", "the fiscal impact"],
    recommendation_openers: ["Staff Recommends That The City Council", "staff recommends that", "Staff recommend that", "The Mayor Recommends That"],
    template_blanks: ["INTRODUCED BY COUNCILMEMBER [IF APPLICABLE]", "  introduced by [NAME]", "INTRODUCED BY THE MAYOR", "AN ORDINANCE INTRODUCED BY [X]"],
  };
  return Object.fromEntries(Object.entries(lines).map(([k, ls]) => [k, ls.map((l) => [l, oracle[k].some((re) => re.test(l))])]));
}

/* bio-plane/checks/bio-checks.mjs, docprofile/doctypes/meeting-calendar.mjs, bio-plane/src/store.mjs */
const ACTION_KINDS = ["cpra_request", "grand_jury", "controller_referral", "public_comment", "media", "litigation_support", "request_for_comment", "other"];
const MINUTES_DUE_DAYS = 21;
const SEARCH_TERMS = ["oakland", "police"];

export const legacy = Object.freeze({ ID_SPACES, CMS_FLOOR, ID_SYSTEMS, MIXED_HOSTS, recognise, systemOfAddress,
  corpus, addresses, vocabularySamples, ACTION_KINDS, MINUTES_DUE_DAYS, SEARCH_TERMS });
