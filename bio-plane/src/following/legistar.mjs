/* following: which identifier a followed body is read by in Legistar, which client, and the addresses a tick reads
 * (R1, R2, R3, R18). Every name comes from the jurisdiction view (its `systems` and `identifier_schemes`), never from
 * code: the Web API's host shape is the publishing system's own address form (`legistar-reader` R1). Pure. */

export const LEGISTAR_API_HOST = "webapi.legistar.com";
const API = `https://${LEGISTAR_API_HOST}/v1`;
const SITE = /^([a-z0-9-]+)\.legistar\d*\.com$/i;

const list = (v) => (Array.isArray(v) ? v : []);
function compile(p) {
  if (!p || typeof p.re !== "string") return null;
  try { return new RegExp(p.re, typeof p.flags === "string" ? p.flags : ""); } catch { return null; }
}

/** R1, R18: the view's Legistar systems, each `{origin, client}`: an origin with a system on the Web API's host,
 *  whose client is the subdomain of the same origin's `<client>.legistar.com` site, admitted by the API system's own
 *  `path` (when it gives one) as `/v1/<client>/`. An origin whose client cannot be read so is left out. */
export function legistarSystems(view) {
  const systems = list(view && view.systems);
  const out = [];
  for (const api of systems) {
    if (!list(api.hosts).map((h) => String(h).toLowerCase()).includes(LEGISTAR_API_HOST)) continue;
    const path = compile(api.path);
    const clients = new Set();
    for (const s of systems) {
      if (s.origin !== api.origin) continue;
      for (const h of list(s.hosts)) { const m = SITE.exec(String(h)); if (m) clients.add(m[1].toLowerCase()); }
    }
    const ok = [...clients].filter((c) => !path || path.test(`/v1/${c}/`));
    if (ok.length === 1 && !out.some((o) => o.origin === api.origin)) out.push({ origin: api.origin, client: ok[0] });
  }
  return out;
}

/** R1: the schemes the view names for a Legistar body identifier: `body` among its `entity_kinds`, issued by an
 *  origin of `legistarSystems`. Each `{scheme, origin, client}`. */
export function bodySchemes(view) {
  const systems = legistarSystems(view);
  const out = [];
  for (const s of list(view && view.identifier_schemes)) {
    if (!list(s.entity_kinds).includes("body")) continue;
    for (const o of list(s.systems)) {
      const sys = systems.find((x) => x.origin === o);
      if (sys) out.push({ scheme: s.scheme, origin: sys.origin, client: sys.client });
    }
  }
  return out;
}

/** R1: the body's Legistar identifier among its held identifiers (`entities.identifiersOf`): the first live one in a
 *  scheme of `bodySchemes`, as `{scheme, id, client}`, or null. */
export function legistarBodyId(identifiers, view) {
  const schemes = bodySchemes(view);
  for (const i of list(identifiers)) {
    if (!i || i.withdrawn_at || i.withdrawn) continue;
    const s = schemes.find((x) => x.scheme === i.scheme);
    const id = i.normal ?? i.id ?? i.value;
    if (s && /^\d+$/.test(String(id))) return { scheme: s.scheme, id: Number(id), client: s.client };
  }
  return null;
}

const day = (d) => `datetime'${d}'`;
const enc = (s) => encodeURIComponent(s);

/* A period's bounds on a date field; an open period (no `until`) has no upper bound, so its address is stable. */
const within = (field, from, to) => `${field} ge ${day(from)}${to ? ` and ${field} le ${day(to)}` : ""}`;
/** R2: the events of a body for a period (`to` null when the follow names no end). */
export function eventsAddress(client, bodyId, from, to = null) {
  return `${API}/${enc(client)}/events?$filter=${enc(`EventBodyId eq ${bodyId} and ${within("EventDate", from, to)}`)}`;
}
/** R2: one meeting's items, and one item's votes. */
export const itemsAddress = (client, eventId) => `${API}/${enc(client)}/events/${eventId}/eventitems`;
export const votesAddress = (client, itemId) => `${API}/${enc(client)}/eventitems/${itemId}/votes`;
/** R2, R3: a body's matters for a period, and one matter's own address (R3's version is captured there). */
export function mattersAddress(client, bodyId, from, to = null) {
  return `${API}/${enc(client)}/matters?$filter=${enc(`MatterBodyId eq ${bodyId} and ${within("MatterIntroDate", from, to)}`)}`;
}
export const matterAddress = (client, matterId) => `${API}/${enc(client)}/matters/${matterId}`;

/** R3: the enactment record of a matter row as `legistar-reader` reads it (its R10), the three fields compared. */
export function enactmentOf(row) {
  const f = (row && row.facts) || {};
  return { enactment_number: f.enactment_number ?? null, enactment_date: f.enactment_date ?? null, status: f.status ?? null };
}
