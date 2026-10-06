/* acquisition — THE KEYED-SERVICE FETCH PATH (R36, R37; T33-21, K1449). Keyless public sources are the default; a keyed
 * outside service is built into every copy, OFF by default, and switched on by a group with its OWN key (credentials
 * R29). No vendor key is ever required (D201): with the service off, each act answers credentials' own refusal and the
 * caller goes on without it. A paid account is not a keyed service, and no daemon uses one (K1449).
 *
 * The key is read at the moment of the call through the credentials instance the caller hands in (`store.credentials`,
 * its `keyedServiceFor`), as the store's other services are reached; it rides one request to the service's own host,
 * redirects are never followed with it, and no answer, error or log of this file carries it (as R23 keeps a member's
 * credential out of every answer).
 *
 * Every refusal is an answer `{ok: false, reason, ...}`, never a throw. */
import { isPublicHttpsLocator, isMachineIdentity } from "../record-grammar/index.mjs";
import { governedFetch as hostGovernedFetch } from "../host-governor/index.mjs";
import { civicsmithUserAgent } from "./checks.mjs";

/* R36: each keyed service this copy can speak to: its one host, and how its key rides a request. The names are
   credentials' `KEYED_SERVICES` (its R29); a service that this table and credentials do not both know is not
   reached. CourtListener's form is its own documentation's (v4 REST: `Authorization: Token <key>`). */
const SERVICES = Object.freeze({
  courtlistener: Object.freeze({ host: "www.courtlistener.com", authorization: (key) => `Token ${key}` }),
});
export const KEYED_SERVICE_HOSTS = Object.freeze(Object.fromEntries(Object.entries(SERVICES).map(([k, v]) => [k, v.host])));

/* R36: the most of a keyed service's answer this path reads. Chosen, not measured: a citation lookup over 64,000
   characters answers well under it. */
const KEYED_ANSWER_MAX = 8 * 1024 * 1024;

const refuse = (reason, detail, extra = {}) => ({ ok: false, reason, ...extra, detail });
const hostOf = (u) => { try { return new URL(u).hostname.toLowerCase(); } catch { return null; } };

/* The service's answer, read as text within the bound; `{oversize}` past it, `{failed}` when the stream breaks. */
async function readBounded(res, max = KEYED_ANSWER_MAX) {
  const reader = res && res.body && res.body.getReader ? res.body.getReader() : null;
  if (!reader) return { text: "" };
  const chunks = [];
  let bytes = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.length;
      if (bytes > max) { try { await reader.cancel(); } catch { /* the service may already be gone */ } return { oversize: true }; }
      chunks.push(value);
    }
  } catch { return { failed: true }; }
  const all = new Uint8Array(bytes);
  let at = 0;
  for (const c of chunks) { all.set(c, at); at += c.length; }
  return { text: new TextDecoder("utf-8", { fatal: false }).decode(all) };
}

/** R36: `keyedFetch(store, {service, request, purpose, viewer})` fetches `request` (`{url, method, form}`: a public
 *  https locator on the service's own host, `GET` or `POST`, `form` a flat object of strings sent as
 *  `application/x-www-form-urlencoded`) under the group's own key for `service`, read now from
 *  `store.credentials.keyedServiceFor({service})`. Off, or with no key held, or with no credentials handed in, it
 *  answers credentials' refusal (`KEYED_SERVICE_OFF`) and fetches nothing. A machine viewer (a daemon, a token) is
 *  refused `NOT_PERMITTED`: no daemon uses a keyed service (K1449). The request goes through the host governor under
 *  R9's agent naming `purpose`; a redirect is answered, never followed. Answers `{ok: true, service, status, text,
 *  content_type, retry_after}` for a 2xx, else `{ok: false, reason: "SOURCE_REFUSED", status, text}`; the key is in
 *  none of them. */
export async function keyedFetch(store, { service = null, request = null, purpose = "keyed-service", viewer = undefined } = {}) {
  const svc = typeof service === "string" && Object.prototype.hasOwnProperty.call(SERVICES, service) ? SERVICES[service] : null;
  if (!svc)
    return refuse("UNKNOWN_KEYED_SERVICE", `the keyed services this copy speaks to are ${Object.keys(SERVICES).join(", ")}; nothing was fetched`,
                  { service: typeof service === "string" ? service.slice(0, 40) : null });
  /* K1449: never one a daemon uses. An act with no viewer named is the in-plane caller's own; a machine's is refused. */
  if (viewer !== undefined && viewer !== null && isMachineIdentity(viewer))
    return refuse("NOT_PERMITTED", "a keyed outside service is used for a member's or an operator's act, never by a "
      + "machine credential or the daemon; nothing was fetched", { service });
  const r = request && typeof request === "object" ? request : {};
  const method = r.method === undefined ? "GET" : r.method;
  /* R28's fence and the key's: a public locator, on the service's own host and no other. */
  if (typeof r.url !== "string" || !isPublicHttpsLocator(r.url) || hostOf(r.url) !== svc.host || (method !== "GET" && method !== "POST")
      || (r.form != null && (typeof r.form !== "object" || Object.values(r.form).some((v) => typeof v !== "string"))))
    return refuse("BAD_KEYED_REQUEST", `a keyed request is a GET or POST of a public https address on ${svc.host}, `
      + "its form a flat set of strings; nothing was fetched", { service });
  /* The key, read at the moment of the call (credentials R29); any refusal is credentials' own, passed on whole. */
  const creds = store && store.credentials && typeof store.credentials.keyedServiceFor === "function" ? store.credentials : null;
  let k = null;
  try { k = creds ? await creds.keyedServiceFor({ service }) : null; } catch { k = null; }
  if (!k || k.ok !== true || typeof k.key !== "string" || !k.key) {
    if (k && k.ok === false) return { ...k, service };
    return refuse("KEYED_SERVICE_OFF", "the group's key for this service is off or not held; the caller goes on without it",
                  { code: "KEYED_SERVICE_OFF", service });
  }
  const key = k.key;
  const env = (store && store.env) || {};
  const g = store && store.governor;
  let out;
  try {
    out = await hostGovernedFetch(r.url, {
      userAgent: civicsmithUserAgent(env.VERSION || "0.0.0", env.INSTANCE_NAME || "unnamed", purpose),
      governor: g ? { admit: (q) => g.governorAdmit(q), report: (q) => g.governorReport(q) } : null,
      /* the key rides THIS request only, to the service's own host, and a redirect is the answer */
      fetch: (u, init) => fetch(u, { ...init, method, redirect: "manual",
        headers: { ...(init.headers || {}), authorization: svc.authorization(key), accept: "application/json",
                   ...(r.form ? { "content-type": "application/x-www-form-urlencoded" } : {}) },
        ...(r.form ? { body: new URLSearchParams(r.form).toString() } : {}) }) });
  } catch {
    /* as R23: a thrown fetch's message can carry what rode the request, so none is carried */
    return refuse("FETCH_FAILED", "the request to the service did not complete; its error is not carried because the group's key rode it", { service });
  }
  if (out.refusedByGovernor)
    return refuse("HOST_COOLING_OFF", `the per-host governor is holding requests to ${svc.host} (${out.reason})`,
                  { service, retry_in_ms: out.retry_in_ms || 0 });
  const res = out.res;
  const body = await readBounded(res);
  if (body.failed) return refuse("FETCH_FAILED", "the service's answer broke off while it was read", { service });
  if (body.oversize) return refuse("TOO_LARGE", `the service's answer is over ${KEYED_ANSWER_MAX} bytes; it was not read`, { service });
  const contentType = ((res.headers && res.headers.get("content-type")) || "").split(";")[0].trim().toLowerCase() || null;
  const retryAfter = (res.headers && res.headers.get("retry-after")) || null;
  if (!(res.status >= 200 && res.status < 300))
    return { ok: false, reason: "SOURCE_REFUSED", service, status: res.status, content_type: contentType, retry_after: retryAfter,
             text: body.text.slice(0, 2000), detail: `the service answered ${res.status}` };
  return { ok: true, service, status: res.status, content_type: contentType, retry_after: retryAfter, text: body.text };
}

/* R37: CourtListener's Citation Lookup (v4), as its documentation states it: a POST of `text`, at most 64,000
   characters a request, looking up at most 250 citations a request and 60 a minute, a throttled request answered 429
   with `wait_until`. */
export const CITATION_LOOKUP_URL = "https://www.courtlistener.com/api/rest/v4/citation-lookup/";
export const CITATION_TEXT_MAX = 64000;
const SITE = "https://www.courtlistener.com";
/* Each citation's `status`, as the service defines it, in words. */
const LOOKUP = Object.freeze({ 200: "found", 300: "several_matches", 404: "not_found", 400: "unknown_reporter", 429: "not_looked_up" });
export const CITATION_LOOKUP_LABEL = "CourtListener's answer, not verified: a citation is verified only by a held capture "
  + "stating it (standards' citation resolver)";

const str = (v) => (typeof v === "string" && v.trim() ? v : null);
const int = (v) => (Number.isInteger(v) && v >= 0 ? v : null);
/* The service's own address for a match: its path on the service's site, kept only when it is a public locator there. */
function serviceAddress(u) {
  const s = str(u);
  if (!s) return null;
  let abs = null;
  try { abs = new URL(s, SITE).href; } catch { return null; }
  return isPublicHttpsLocator(abs) && hostOf(abs) === SERVICES.courtlistener.host ? abs : null;
}

/** R37: `citationLookup(store, {text, viewer})` sends `text` to CourtListener's Citation Lookup through R36 and answers,
 *  for each citation the service found, its offsets (`start`, `end`), what the service read (`citation`,
 *  `normalized`), how its lookup ended (`lookup`, with the service's own `status` and message) and the matches it
 *  named (`case_name`, `court`, `date`, `address`), each labelled as the service's answer, never as verified. With
 *  the service off it answers R36's refusal and the recogniser's own reading stands alone. It writes nothing. */
export async function citationLookup(store, { text = null, viewer = null } = {}) {
  if (typeof viewer !== "string" || !viewer.trim())
    return refuse("NOT_PERMITTED", "a citation lookup is a member's or an operator's act, and none was named; nothing was sent");
  if (typeof text !== "string" || !text.trim())
    return refuse("BAD_TEXT", "there is no text to look citations up in; nothing was sent");
  if (text.length > CITATION_TEXT_MAX)
    return refuse("TEXT_TOO_LONG", `the service reads at most ${CITATION_TEXT_MAX} characters a request and this text is `
      + `${text.length}; nothing was sent`, { max: CITATION_TEXT_MAX, length: text.length });
  const k = await keyedFetch(store, { service: "courtlistener", purpose: "citation-lookup", viewer,
                                      request: { url: CITATION_LOOKUP_URL, method: "POST", form: { text } } });
  if (!k.ok) {
    /* the service's throttle names when the next request may go */
    if (k.reason === "SOURCE_REFUSED" && k.status === 429) {
      let until = null;
      try { until = str(JSON.parse(k.text).wait_until); } catch { until = null; }
      return { ok: false, reason: "SERVICE_THROTTLED", service: k.service, status: 429, wait_until: until, retry_after: k.retry_after,
               detail: "CourtListener is holding citation lookups from this key for now; nothing was looked up" };
    }
    const { text: _omit, ...rest } = k;
    return { ...rest, note: "the citation recogniser's own reading stands alone" };
  }
  let rows;
  try { rows = JSON.parse(k.text); } catch { rows = null; }
  if (!Array.isArray(rows))
    return refuse("SERVICE_ANSWER_UNREADABLE", "the service's answer is not the list of citations its documentation describes", { service: "courtlistener" });
  const citations = rows.filter((x) => x && typeof x === "object").map((x) => ({
    citation: str(x.citation),
    normalized: Array.isArray(x.normalized_citations) ? x.normalized_citations.filter((n) => typeof n === "string") : [],
    start: int(x.start_index), end: int(x.end_index),
    lookup: LOOKUP[x.status] || "unstated",
    service_status: Number.isInteger(x.status) ? x.status : null,
    service_message: str(x.error_message),
    matches: (Array.isArray(x.clusters) ? x.clusters : []).filter((c) => c && typeof c === "object").map((c) => ({
      case_name: str(c.case_name) || str(c.case_name_full) || str(c.case_name_short),
      court: str(c.court_id) || str(c.court),
      date: str(c.date_filed),
      address: serviceAddress(c.absolute_url),
      basis: "service_answer",
    })),
    basis: "service_answer", verified: false,
  }));
  return { ok: true, service: "courtlistener", citations, verified: false, label: CITATION_LOOKUP_LABEL };
}
