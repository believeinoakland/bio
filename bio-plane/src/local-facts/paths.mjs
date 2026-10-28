/* R6: the one path of a profile fact, and its parts. Pure; neither function throws.
 *
 *   <profile>/time_zone
 *   <profile>/time_zone/role=<role>,body=<body>   a counterparty's own zone (jurisdictions R74), apart from the profile's
 *   <profile>/time_zone/venue=<kind>              a kind's venue's own zone (jurisdictions R74)
 *   <profile>/holidays/<year>                     a holiday entry for every office
 *   <profile>/holidays/<year>/<offices>           one for the offices named: each `role=<role>` or `venue=<kind>`,
 *                                                 sorted and unique, joined by `,`
 *   <profile>/holidays/<year>/list=<name>[/<offices>]   an entry of a named closure list (jurisdictions R47), for every
 *                                                 office or for the offices named; never the office calendar's path
 *   <profile>/hours/role=<role>,body=<body>       a counterparty's hours (jurisdictions R24, R42)
 *   <profile>/hours/venue=<kind>                  the hours of a kind's venue (jurisdictions R25, R42)
 *
 *   team/<government>/<fact...>                  (T53, R29) a fact of the team layer about one government: `<government>`
 *                                                 is `federal`, or `<level>:<place>` (level state, county or city), and
 *                                                 `<fact...>` the profile forms above (`holidays/...`, `hours/...`,
 *                                                 `time_zone/<office>`) or `fiscal_year` (R32)
 *
 * Every name is percent-encoded, so no name can forge a separator. A path carries its profile's id: facts and their
 * horizons are per jurisdiction profile, never per template (K921 Q7). `parseFactPath` accepts only the spelling
 * `factPath` gives, so the same fact always has one path. */

export const LOCAL_FACT_KINDS = Object.freeze(["holidays", "hours", "time_zone", "fiscal_year"]);
/** R29: the id of the one team layer, and the levels of the government a team fact is about (`jurisdictions` R115, R134). */
export const TEAM_LAYER = "team";
export const GOVERNMENT_LEVELS = Object.freeze(["federal", "state", "county", "city"]);

const PROFILE_RE = /^[a-z0-9][a-z0-9-]*$/;
const YEAR_RE = /^\d{4}$/;
const LIST_RE = /^[a-z][a-z0-9_]*$/;   // a closure list's name (jurisdictions R47)
const PATH_MAX = 1000;
/** R21: the path of the team's own time zone, a fact the team states whether or not a place profile is installed. */
export const TEAM_ZONE_PATH = "@team/time_zone";
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

/* The segment naming one office of an `hours` or office `time_zone` fact: a counterparty's `role` and `body`, or a
   venue's `kind`; null for anything else. */
function officeSegment(of) {
  if (!isObj(of)) return null;
  const keys = Object.keys(of).sort().join(",");
  if (keys === "body,role" && name(of.role) && name(of.body)) return `role=${enc(of.role)},body=${enc(of.body)}`;
  if (keys === "venue" && name(of.venue)) return `venue=${enc(of.venue)}`;
  return null;
}

/* The office a segment names, as `officeSegment` spells it, or null. */
function parseOfficeSegment(seg) {
  let m = /^role=([^,]+),body=([^,]+)$/.exec(seg);
  if (m) {
    const role = dec(m[1]), body = dec(m[2]);
    return role === null || body === null ? null : { role, body };
  }
  m = /^venue=([^,]+)$/.exec(seg);
  const v = m && dec(m[1]);
  return v === null || !m ? null : { venue: v };
}

/* R29: the segment naming the government a team fact is about, or null: `federal`, or `<level>:<place>` for a state, county
   or city, the place percent-encoded. */
export function governmentSegment(g) {
  if (!isObj(g) || !GOVERNMENT_LEVELS.includes(g.level)) return null;
  if (g.level === "federal") return Object.keys(g).join() === "level" ? "federal" : null;
  if (Object.keys(g).sort().join() !== "level,place" || !name(g.place) || g.place.length > 200 || /[\r\n]/.test(g.place)) return null;
  return `${g.level}:${enc(g.place)}`;
}

/* The government a segment names, as `governmentSegment` spells it, or null. */
function parseGovernmentSegment(seg) {
  if (seg === "federal") return { level: "federal" };
  const m = /^(state|county|city):([^:/]+)$/.exec(seg);
  const place = m && dec(m[2]);
  return !m || place === null ? null : { level: m[1], place };
}

/** R6: the path of one fact, or null when the parts name none. */
export function factPath(parts) {
  try {
    if (isObj(parts) && parts.team === true)
      return parts.fact === "time_zone" && parts.profile === undefined && parts.office === undefined ? TEAM_ZONE_PATH : null;
    if (!isObj(parts) || typeof parts.profile !== "string" || !PROFILE_RE.test(parts.profile)) return null;
    const { fact } = parts;
    /* R29, R32: a fact of the team layer is about one government, in the path's second segment; the team layer has no fact of its own */
    let profile = parts.profile;
    if (profile === TEAM_LAYER) {
      const g = governmentSegment(parts.government);
      if (!g) return null;
      profile = `${TEAM_LAYER}/${g}`;
    } else if (parts.government !== undefined) return null;
    let p = null;
    if (fact === "fiscal_year") {
      if (profile === parts.profile) return null;
      p = `${profile}/fiscal_year`;
    } else if (fact === "time_zone") {
      if (parts.office === undefined || parts.office === null) {
        if (profile !== parts.profile) return null;   // the team's own zone is `TEAM_ZONE_PATH`, not a government's
        p = `${profile}/time_zone`;
      }
      else {
        const o = officeSegment(parts.office);
        if (!o) return null;
        p = `${profile}/time_zone/${o}`;
      }
    } else if (fact === "holidays") {
      const y = typeof parts.year === "number" ? String(parts.year) : parts.year;
      if (typeof y !== "string" || !YEAR_RE.test(y)) return null;
      const l = listToken(parts.list);
      const o = officesToken(parts.offices);
      if (o === null || l === null) return null;
      p = `${profile}/holidays/${y}${l ? `/${l}` : ""}${o ? `/${o}` : ""}`;
    } else if (fact === "hours") {
      const o = officeSegment(parts.office);
      if (!o) return null;
      p = `${profile}/hours/${o}`;
    } else return null;
    return p.length <= PATH_MAX ? p : null;
  } catch { return null; }
}

const dec = (s) => { try { return decodeURIComponent(s); } catch { return null; } };

/** R6, R21: the parts of a path, or null when `factPath` would not give it (the team's zone: `{team: true, fact}`). Offices come back as the profile writes them:
 *  a role as its string, a venue as `{venue}`; a closure list as its name. */
export function parseFactPath(path) {
  try {
    if (typeof path !== "string" || !path || path.length > PATH_MAX) return null;
    if (path === TEAM_ZONE_PATH) return { team: true, fact: "time_zone" };
    let seg = path.split("/");
    let government;
    /* R29, R32: `team/<government>/...` reads as the profile forms over the rest, the government kept beside */
    if (seg[0] === TEAM_LAYER) {
      government = seg.length > 2 ? parseGovernmentSegment(seg[1]) : null;
      if (!government) return null;
      seg = [TEAM_LAYER, ...seg.slice(2)];
    }
    const [profile, fact] = seg;
    let parts = null;
    if (fact === "fiscal_year" && seg.length === 2 && government) parts = { profile, fact };
    else if (fact === "time_zone" && seg.length === 2) parts = { profile, fact };
    else if (fact === "time_zone" && seg.length === 3) {
      const office = parseOfficeSegment(seg[2]);
      if (!office) return null;
      parts = { profile, fact, office };
    }
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
      const office = parseOfficeSegment(seg[2]);
      if (!office) return null;
      parts = { profile, fact, office };
    } else return null;
    if (government) parts = { ...parts, government };
    return factPath(parts) === path ? parts : null;
  } catch { return null; }
}
