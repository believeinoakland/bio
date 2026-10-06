/* R6: the one path of a profile fact, and its parts. Pure; neither function throws.
 *
 *   <profile>/time_zone
 *   <profile>/holidays/<year>                     a holiday entry for every office
 *   <profile>/holidays/<year>/<offices>           one for the offices named: each `role=<role>` or `venue=<kind>`,
 *                                                 sorted and unique, joined by `,`
 *   <profile>/holidays/<year>/list=<name>[/<offices>]   an entry of a named closure list (jurisdictions R47), for every
 *                                                 office or for the offices named; never the office calendar's path
 *   <profile>/hours/role=<role>,body=<body>       a counterparty's hours (jurisdictions R24, R42)
 *   <profile>/hours/venue=<kind>                  the hours of a kind's venue (jurisdictions R25, R42)
 *
 * Every name is percent-encoded, so no name can forge a separator. A path carries its profile's id: facts and their
 * horizons are per jurisdiction profile, never per template (K921 Q7). `parseFactPath` accepts only the spelling
 * `factPath` gives, so the same fact always has one path. */

export const LOCAL_FACT_KINDS = Object.freeze(["holidays", "hours", "time_zone"]);

const PROFILE_RE = /^[a-z0-9][a-z0-9-]*$/;
const YEAR_RE = /^\d{4}$/;
const LIST_RE = /^[a-z][a-z0-9_]*$/;   // a closure list's name (jurisdictions R47)
const PATH_MAX = 1000;
const enc = (s) => encodeURIComponent(s);
const name = (s) => typeof s === "string" && s.trim() !== "" && s === s.trim();
const isObj = (v) => !!v && typeof v === "object" && !Array.isArray(v);

/* One office of a holiday entry's `offices` (jurisdictions R43): a counterparty's role, or `{venue: <kind>}`. */
function officeToken(o) {
  if (name(o)) return `role=${enc(o)}`;
  if (isObj(o) && Object.keys(o).length === 1 && name(o.venue)) return `venue=${enc(o.venue)}`;
  return null;
}

/** The key of an `offices` list as a path spells it: "" for an entry for every office (absent), else null when it is
 *  not a non-empty list of offices. */
export function officesToken(offices) {
  if (offices === undefined || offices === null) return "";
  if (!Array.isArray(offices) || !offices.length) return null;
  const t = offices.map(officeToken);
  if (t.some((x) => x === null)) return null;
  return [...new Set(t)].sort().join(",");
}

/** The segment naming a holiday entry's closure list (R6, jurisdictions R47): "" for the office calendar (absent), else
 *  `list=<name>`, or null when it is not a list's name. */
export function listToken(list) {
  if (list === undefined || list === null) return "";
  return typeof list === "string" && LIST_RE.test(list) ? `list=${list}` : null;
}

/** R6: the path of one fact, or null when the parts name none. */
export function factPath(parts) {
  try {
    if (!isObj(parts) || typeof parts.profile !== "string" || !PROFILE_RE.test(parts.profile)) return null;
    const { profile, fact } = parts;
    let p = null;
    if (fact === "time_zone") p = `${profile}/time_zone`;
    else if (fact === "holidays") {
      const y = typeof parts.year === "number" ? String(parts.year) : parts.year;
      if (typeof y !== "string" || !YEAR_RE.test(y)) return null;
      const l = listToken(parts.list);
      const o = officesToken(parts.offices);
      if (o === null || l === null) return null;
      p = `${profile}/holidays/${y}${l ? `/${l}` : ""}${o ? `/${o}` : ""}`;
    } else if (fact === "hours") {
      const of = parts.office;
      if (!isObj(of)) return null;
      const keys = Object.keys(of).sort().join(",");
      if (keys === "body,role" && name(of.role) && name(of.body)) p = `${profile}/hours/role=${enc(of.role)},body=${enc(of.body)}`;
      else if (keys === "venue" && name(of.venue)) p = `${profile}/hours/venue=${enc(of.venue)}`;
      else return null;
    } else return null;
    return p.length <= PATH_MAX ? p : null;
  } catch { return null; }
}

const dec = (s) => { try { return decodeURIComponent(s); } catch { return null; } };

/** R6: the parts of a path, or null when `factPath` would not give it. Offices come back as the profile writes them:
 *  a role as its string, a venue as `{venue}`; a closure list as its name. */
export function parseFactPath(path) {
  try {
    if (typeof path !== "string" || !path || path.length > PATH_MAX) return null;
    const seg = path.split("/");
    const [profile, fact] = seg;
    let parts = null;
    if (fact === "time_zone" && seg.length === 2) parts = { profile, fact };
    else if (fact === "holidays" && seg.length >= 3 && seg.length <= 5) {
      parts = { profile, fact, year: Number(seg[2]) };
      let rest = seg.slice(3);
      if (rest.length && rest[0].startsWith("list=")) { parts.list = rest[0].slice(5); rest = rest.slice(1); }
      if (rest.length > 1) return null;
      if (rest.length === 1) {
        const offices = [];
        for (const t of rest[0].split(",")) {
          const m = /^(role|venue)=(.+)$/.exec(t);
          const v = m && dec(m[2]);
          if (v === null || !m) return null;
          offices.push(m[1] === "role" ? v : { venue: v });
        }
        parts.offices = offices;
      }
    } else if (fact === "hours" && seg.length === 3) {
      let m = /^role=([^,]+),body=([^,]+)$/.exec(seg[2]);
      if (m) {
        const role = dec(m[1]), body = dec(m[2]);
        if (role === null || body === null) return null;
        parts = { profile, fact, office: { role, body } };
      } else {
        m = /^venue=([^,]+)$/.exec(seg[2]);
        const v = m && dec(m[1]);
        if (v === null || !m) return null;
        parts = { profile, fact, office: { venue: v } };
      }
    } else return null;
    return factPath(parts) === path ? parts : null;
  } catch { return null; }
}
