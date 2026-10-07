/* The archive lookup over Memento (RFC 7089), so any compliant archive can serve it
 * (build/requirements/capture-sources.md R37). The Wayback CDX (`../cdx.mjs`) is one
 * source; this is the interface: an archive is a descriptor naming its TimeGate and
 * TimeMap, its answers are read here, and a memento the caller fetched becomes a row
 * `selectCapture` reads unchanged, so the same rules choose it (R29–R31, R52) and a hop
 * of R34's shape records it.
 *
 * PURE ON PURPOSE, as `cdx.mjs` is: nothing here fetches, hashes or reads a clock. The
 * caller fetches the TimeGate, the TimeMap and the memento, hashes the bytes it
 * received, and hands the answers in.
 *
 * Every fact a hop states comes from what the archive answered (its `Memento-Datetime`
 * and its `Link` header's `original`, `timegate` and `timemap`) and from the bytes the
 * caller received, never from the request (R35, D-112): the document address is the
 * archive's `rel="original"`, not the address the caller asked about.
 */

import { EMPTY_BODY_DIGEST, cdxTimestampToIso } from "../cdx.mjs";

/** The Wayback Machine as one Memento archive. `raw` answers the memento's raw bytes
 *  form, without overlay or link rewriting: the `id_` flag R32 uses for the CDX path. */
export const WAYBACK_MEMENTO = Object.freeze({
  name: "Internet Archive Wayback Machine",
  via: "archive.org",
  timegate: "https://web.archive.org/web/",
  timemap: "https://web.archive.org/web/timemap/link/",
  raw: (uri) => String(uri).replace(/^(https:\/\/web\.archive\.org\/web\/\d{14})(?:[a-z]{2}_)?\//, "$1id_/"),
});

const isHttpsUrl = (s) => { try { return new URL(String(s)).protocol === "https:"; } catch { return false; } };
const isHttpUrl = (s) => { try { return /^https?:$/.test(new URL(String(s)).protocol); } catch { return false; } };

/** The archive's TimeGate and TimeMap for `address` (RFC 7089 §4, §5): each prefix
 *  followed by the address, the URI-R. */
export function mementoEndpoints(archive, address) {
  if (!archive || typeof archive !== "object" || !isHttpsUrl(archive.timegate) || !isHttpsUrl(archive.timemap)) return null;
  if (typeof address !== "string" || !isHttpUrl(address)) return null;
  return { timegate: `${archive.timegate}${address}`, timemap: `${archive.timemap}${address}` };
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const RFC1123 = /^(Sun|Mon|Tue|Wed|Thu|Fri|Sat), (\d{2}) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4}) (\d{2}):(\d{2}):(\d{2}) GMT$/;
const p2 = (n) => String(n).padStart(2, "0");

/** An RFC 1123 date (RFC 7089 §2.1.1: `Accept-Datetime`, `Memento-Datetime` and a
 *  TimeMap's `datetime`) as `{timestamp, archived_at}`, or null when it is not one: a
 *  day that does not exist, or a weekday that is not that day's, is not read. */
export function readHttpDate(s) {
  const m = RFC1123.exec(typeof s === "string" ? s.trim() : "");
  if (!m) return null;
  const [, wd, dd, mon, yyyy, hh, mi, ss] = m;
  const ms = Date.UTC(Number(yyyy), MONTHS.indexOf(mon), Number(dd), Number(hh), Number(mi), Number(ss));
  const d = new Date(ms);
  if (d.getUTCDate() !== Number(dd) || d.getUTCHours() !== Number(hh) || d.getUTCMinutes() !== Number(mi)
      || d.getUTCSeconds() !== Number(ss) || DAYS[d.getUTCDay()] !== wd) return null;
  const timestamp = `${yyyy}${p2(MONTHS.indexOf(mon) + 1)}${dd}${hh}${mi}${ss}`;
  return { timestamp, archived_at: cdxTimestampToIso(timestamp) };
}

/** The `Accept-Datetime` value for an instant: an ISO 8601 string, a 14-digit
 *  timestamp, or milliseconds since the epoch. Null when it is none of these. */
export function acceptDatetime(at) {
  let ms = NaN;
  if (typeof at === "number") ms = at;
  else if (typeof at === "string" && /^\d{14}$/.test(at)) ms = Date.parse(cdxTimestampToIso(at));
  else if (typeof at === "string" && /^\d{4}-\d{2}-\d{2}T/.test(at)) ms = Date.parse(at);
  if (!Number.isFinite(ms)) return null;
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return null;
  return `${DAYS[d.getUTCDay()]}, ${p2(d.getUTCDate())} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()} `
    + `${p2(d.getUTCHours())}:${p2(d.getUTCMinutes())}:${p2(d.getUTCSeconds())} GMT`;
}

/** Link-format (RFC 6690 §2, the syntax RFC 7089 §5 gives a TimeMap and the `Link`
 *  header shares): entries `<uri>` each followed by `;name=value` parameters, a value a
 *  token or a quoted string, entries separated by commas. One malformed entry refuses
 *  the whole text, naming it: a mis-split entry would shift every entry after it. */
export function parseLinkFormat(text) {
  if (typeof text !== "string") return { ok: false, reason: "MEMENTO_LINK_MALFORMED", entry: 0, detail: "the link-format text is not a string" };
  const links = [];
  let i = 0;
  const n = text.length;
  const ws = () => { while (i < n && /\s/.test(text[i])) i++; };
  const bad = (detail, entry = links.length) => ({ ok: false, reason: "MEMENTO_LINK_MALFORMED", entry, detail });
  ws();
  if (i === n) return { ok: true, links };
  for (;;) {
    ws();
    if (text[i] !== "<") return bad(`entry ${links.length} does not begin with "<" at character ${i}`);
    const close = text.indexOf(">", i + 1);
    if (close < 0) return bad(`entry ${links.length} has no closing ">"`);
    const link = { uri: text.slice(i + 1, close).trim(), rel: [] };
    if (!link.uri) return bad(`entry ${links.length} has an empty URI`);
    i = close + 1;
    ws();
    while (text[i] === ";") {
      i++; ws();
      const nm = /^[A-Za-z0-9!#$&+\-.^_`|~*]+/.exec(text.slice(i));
      if (!nm) return bad(`entry ${links.length} has a parameter with no name at character ${i}`);
      const name = nm[0].toLowerCase();
      i += nm[0].length; ws();
      let value = "";
      if (text[i] === "=") {
        i++; ws();
        if (text[i] === "\"") {
          let j = i + 1, v = "";
          while (j < n && text[j] !== "\"") { if (text[j] === "\\" && j + 1 < n) j++; v += text[j]; j++; }
          if (j >= n) return bad(`entry ${links.length} has an unterminated quoted value for ${name}`);
          value = v; i = j + 1;
        } else {
          const tv = /^[^\s;,"]+/.exec(text.slice(i));
          if (!tv) return bad(`entry ${links.length} has an empty value for ${name}`);
          value = tv[0]; i += tv[0].length;
        }
      }
      if (name === "rel") link.rel = value.split(/\s+/).filter(Boolean).map((r) => r.toLowerCase());
      else if (!(name in link)) link[name] = value;
      ws();
    }
    links.push(link);
    if (i >= n) return { ok: true, links };
    if (text[i] !== ",") return bad(`entry ${links.length - 1} is followed by "${text[i]}", not "," or ";", at character ${i}`, links.length - 1);
    i++; ws();
    if (i >= n) return { ok: true, links };
  }
}

/** The relations of one Link header or TimeMap, read once: `original` (URI-R), `timegate`
 *  (URI-G) and `timemap` (URI-T) the first of each, and every memento (URI-M). */
function relations(links) {
  const first = (r) => { const l = links.find((x) => x.rel.includes(r)); return l ? l.uri : null; };
  return { original: first("original"), timegate: first("timegate"), timemap: first("timemap"),
           mementos: links.filter((x) => x.rel.includes("memento")) };
}

/** A TimeMap (RFC 7089 §5): the original, its TimeGate and TimeMap, and every memento
 *  placed in time by its own `datetime`. A memento whose datetime is absent or not an
 *  RFC 1123 date is listed in `refused`, never placed. Mementos newest first. */
export function parseTimeMap(text) {
  const p = parseLinkFormat(text);
  if (!p.ok) return p;
  const r = relations(p.links);
  if (!r.original) return { ok: false, reason: "MEMENTO_NO_ORIGINAL", detail: "the TimeMap names no rel=\"original\" link, so it does not say which resource its mementos are of" };
  const mementos = [], refused = [];
  for (const l of r.mementos) {
    const t = readHttpDate(l.datetime);
    if (!t) { refused.push({ uri: l.uri, refused: l.datetime === undefined ? "no datetime" : `datetime ${JSON.stringify(l.datetime)} is not an RFC 1123 date` }); continue; }
    mementos.push({ uri: l.uri, datetime: l.datetime, timestamp: t.timestamp, archived_at: t.archived_at });
  }
  mementos.sort((a, b) => (a.timestamp < b.timestamp ? 1 : a.timestamp > b.timestamp ? -1 : 0));
  return { ok: true, original: r.original, timegate: r.timegate, timemap: r.timemap, mementos, refused };
}

/** The mementos to try, newest first, at or before `notAfter` (14 digits, as
 *  `selectCapture`'s bound). Each one later than the bound, and each the TimeMap could
 *  not place, is listed in `considered` with its reason. */
export function timeMapCandidates(timemap, { notAfter = null } = {}) {
  const considered = [];
  for (const x of (timemap && Array.isArray(timemap.refused)) ? timemap.refused : []) considered.push({ timestamp: null, uri: x.uri, refused: x.refused });
  const candidates = [];
  for (const m of (timemap && Array.isArray(timemap.mementos)) ? timemap.mementos : []) {
    if (notAfter && String(m.timestamp) > String(notAfter)) {
      considered.push({ timestamp: m.timestamp, uri: m.uri, refused: `later than the requested bound ${notAfter}` });
      continue;
    }
    candidates.push(m);
  }
  if (!candidates.length) {
    return { ok: false, reason: "NO_USABLE_CAPTURE", detail: "the TimeMap holds no memento at or before the bound", considered };
  }
  return { ok: true, candidates, considered };
}

/** A header by name, from a `Headers`, a plain object or a list of pairs. */
function header(headers, name) {
  if (!headers) return null;
  if (typeof headers.get === "function") { const v = headers.get(name); return v == null ? null : String(v); }
  const want = name.toLowerCase();
  const pairs = Array.isArray(headers) ? headers : Object.entries(headers);
  for (const [k, v] of pairs) if (String(k).toLowerCase() === want && v != null) return String(v);
  return null;
}

/** What a TimeGate or a memento answered (RFC 7089 §4, §2.1). A TimeGate's redirect
 *  (a 3xx with no `Memento-Datetime`) answers where it sends; a memento answers its
 *  datetime and the relations its `Link` header gives, `original` from that header
 *  alone. An answer with no `Memento-Datetime` that is not a redirect is not a memento. */
export function readMementoAnswer({ url, status, headers } = {}) {
  const st = Number(status);
  const md = header(headers, "memento-datetime");
  const linkText = header(headers, "link");
  const parsed = linkText == null ? { ok: true, links: [] } : parseLinkFormat(linkText);
  if (!parsed.ok) return { ...parsed, detail: `the Link header: ${parsed.detail}` };
  const r = relations(parsed.links);
  if (md == null) {
    if (st >= 300 && st < 400) {
      const location = header(headers, "location");
      if (!location) return { ok: false, reason: "MEMENTO_NOT_NEGOTIATED", detail: `the TimeGate answered ${st} with no Location` };
      let resolved;
      try { resolved = new URL(location, url).toString(); } catch { return { ok: false, reason: "MEMENTO_NOT_NEGOTIATED", detail: "the TimeGate's Location is not an address" }; }
      const vary = header(headers, "vary");
      return { ok: true, kind: "redirect", status: st, location: resolved,
               vary_accept_datetime: vary != null && /(^|,)\s*accept-datetime\s*(,|$)/i.test(vary),
               original: r.original, timegate: r.timegate, timemap: r.timemap };
    }
    return { ok: false, reason: "MEMENTO_NO_DATETIME", detail: `the answer (HTTP ${Number.isFinite(st) ? st : "status unstated"}) carries no Memento-Datetime, so it is not a memento` };
  }
  const t = readHttpDate(md);
  if (!t) return { ok: false, reason: "MEMENTO_BAD_DATETIME", detail: `Memento-Datetime ${JSON.stringify(md)} is not an RFC 1123 date` };
  if (!r.original) return { ok: false, reason: "MEMENTO_NO_ORIGINAL", detail: "the memento's Link header names no rel=\"original\", so it does not say which resource it is a memento of" };
  const ct = header(headers, "content-type");
  return { ok: true, kind: "memento", status: Number.isFinite(st) ? st : null, memento_uri: typeof url === "string" ? url : null,
           memento_datetime: md, timestamp: t.timestamp, archived_at: t.archived_at,
           mimetype: ct ? ct.split(";")[0].trim().toLowerCase() || null : null,
           original: r.original, timegate: r.timegate, timemap: r.timemap };
}

const HEX64 = /^[0-9a-f]{64}$/;

/** A memento the caller fetched, as a row `selectCapture` reads unchanged: the same
 *  status rule, the same bound, the same empty-body exclusion (R29–R31, R52). The digest
 *  is the plane's SHA-256 over the bytes it received; an empty body's is
 *  `EMPTY_BODY_DIGEST`, base32 SHA-1 of nothing whoever computes it, so R29 refuses it
 *  by its own reason. No record length: the archive stated none. */
export function mementoRow(answer, { sha256, bytes } = {}) {
  if (!answer || answer.ok !== true || answer.kind !== "memento") return null;
  const hex = typeof sha256 === "string" ? sha256.toLowerCase() : "";
  if (!HEX64.test(hex)) return null;
  return {
    urlkey: null,
    timestamp: answer.timestamp,
    original: answer.original,
    mimetype: answer.mimetype || undefined,
    statuscode: answer.status == null ? "unstated" : String(answer.status),
    digest: bytes === 0 ? EMPTY_BODY_DIGEST : hex,
  };
}

/** The archive's hop for a chosen memento: R34's shape for any archive, every fact from
 *  the memento's answer and the bytes received (R35). */
export function mementoHop(chosen, mementoUri, { archive = WAYBACK_MEMENTO, answer = null } = {}) {
  const name = archive && typeof archive.name === "string" && archive.name ? archive.name : "an unnamed Memento archive";
  const via = archive && typeof archive.via === "string" && archive.via ? archive.via : null;
  const a = answer && answer.ok === true && answer.kind === "memento" ? answer : null;
  return {
    who: name,
    asserts: `these bytes were served for ${chosen.original} at ${chosen.archived_at}, with HTTP status ${chosen.statuscode}`,
    evidence: [
      a ? `Memento-Datetime: ${a.memento_datetime}` : "no Memento-Datetime was recorded with this hop",
      `memento ${mementoUri}`,
      `rel="original" ${chosen.original}`,
      a && a.timegate ? `rel="timegate" ${a.timegate}` : null,
      a && a.timemap ? `rel="timemap" ${a.timemap}` : null,
      chosen.mimetype ? `mimetype ${chosen.mimetype}` : null,
      chosen.digest === EMPTY_BODY_DIGEST ? null : `SHA-256 ${chosen.digest}, computed by your group's Civicsmith over the bytes it received, not a digest the archive stated`,
    ].filter(Boolean).join("; "),
    bound: false,
    unsigned_reason: `no cryptographic attestation exists over a ${name} memento; this is a dated third-party claim we are trusting, not verifying`,
    via,
    document_address: chosen.original,
  };
}
