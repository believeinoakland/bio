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
import { isPublicHttpsLocator, isMachineIdentity, EARNED_CAPTURE_CEILING } from "../record-grammar/index.mjs";
import { governedFetch as hostGovernedFetch } from "../host-governor/index.mjs";
import { civicsmithUserAgent, ARCHIVE_CHECKS, firstHopWho } from "./checks.mjs";
import { isOwnHost } from "../capture-sources/own-hosts.mjs";
import { word, localize } from "../setup-words/index.mjs";
import { combine } from "../../../jurisdictions/index.mjs";
import { ledgerOf, partsWriter } from "./unpack.mjs";
import { normalizeAddress } from "../subresources.mjs";
import { profileOf, profileView } from "./index.mjs";
import { challengeOf, personRefusal } from "./challenge.mjs";

/* R36: each keyed service this copy can speak to: its host(s), and how its key rides a request. The names are credentials'
   `KEYED_SERVICES` (its R29, R84); a service that this table and credentials do not both know is not reached. CourtListener's
   form is its own documentation's (v4 REST: `Authorization: Token <key>`). (T53-547; K5666) `ca-officers`, the state's officers
   lookup (registers R46), is the second; its host is the one the active profile's officers register states (its system's hosts,
   reached through the `company` query template, `jurisdictions` R130), never a host this file names, and its key rides the
   header the state's API gateway reads. */
const SERVICES = Object.freeze({
  courtlistener: Object.freeze({ host: "www.courtlistener.com", hostsOf: () => ["www.courtlistener.com"],
                                 systemOf: (view) => (view && Array.isArray(view.systems) ? view.systems : []).find((x) => x && Array.isArray(x.hosts) && x.hosts.includes("www.courtlistener.com") && x.rate_limits) || null,
                                 headers: (key) => ({ authorization: `Token ${key}` }) }),
  "ca-officers": Object.freeze({ host: null, hostsOf: (view) => officersHosts(view), systemOf: (view) => officersSystem(view),
                                 headers: (key) => ({ "ocp-apim-subscription-key": key }) }),
});
export const KEYED_SERVICE_HOSTS = Object.freeze(Object.fromEntries(Object.entries(SERVICES).filter(([, v]) => v.host).map(([k, v]) => [k, v.host])));

/* R130: the purposes a keyed request may name (`KEYED_PURPOSES`), the services each speaks to, and who may make it. `daemon: "followed"` is the one
   machine use (K5513): the daily check of a court case a member follows. `answer_max` is the most of the answer read (the bound after M-R5 is
   BOB's; today's figure is the one R36 has always read). */
export const KEYED_PURPOSES = Object.freeze({
  "citation-lookup": Object.freeze({ services: Object.freeze(["courtlistener"]), daemon: false, answer_max: 8 * 1024 * 1024 }),
  "docket-entries": Object.freeze({ services: Object.freeze(["courtlistener"]), daemon: "followed", answer_max: 8 * 1024 * 1024 }),
  "officers-lookup": Object.freeze({ services: Object.freeze(["ca-officers"]), daemon: false, answer_max: 8 * 1024 * 1024 }),
});

/* R131: the share of a day's stated limit the daily checks may use, so a member's act is never starved. */
export const POLL_SHARE_DEFAULT = 0.8;
const WINDOWS = Object.freeze([["per_minute", 60_000], ["per_hour", 3_600_000], ["per_day", 86_400_000]]);

/* the instance clock (R124): a handed instant, else the store's `BIO_NOW_MS`, else the wall clock */
const nowMsOf = (store, at = null) => {
  const handed = at ?? (store && store.env ? store.env.BIO_NOW_MS : undefined);
  return handed !== undefined && handed !== null && handed !== "" && Number.isFinite(Number(handed)) ? Number(handed) : Date.now();
};

/* the active profiles' combined view, read at the call (R30: no place is named here) */
function viewOf(store) {
  const core = store && store.core;
  const ids = core && typeof core.getSetting === "function" ? core.getSetting("jurisdiction_profiles") : null;
  if (!Array.isArray(ids)) return undefined;
  const c = combine(ids);
  return c.ok ? c.view : undefined;
}
const systemOf = (view, origin) => (view && Array.isArray(view.systems) ? view.systems : []).find((x) => x && x.origin === origin) || null;
/* the officers lookup's system: the one the `company` query template's register names (`jurisdictions` R130, `registers` R46) */
function officersSystem(view) {
  const t = view && Array.isArray(view.query_templates) ? view.query_templates.find((x) => x && x.scheme === "company") : null;
  const reg = t && Array.isArray(view.registers) ? view.registers.find((r) => r && r.key === t.register) : null;
  return reg ? systemOf(view, reg.system) : null;
}
const officersHosts = (view) => { const sys = officersSystem(view); return sys && Array.isArray(sys.hosts) ? sys.hosts : []; };
/* a service's stated call limits: those of the profile's system that holds its host (R132), else none */
const limitsOf = (view, svc) => { const sys = svc.systemOf(view); return sys && sys.rate_limits && typeof sys.rate_limits === "object" ? sys.rate_limits : null; };

/* R36: the most of a keyed service's answer this path reads. Chosen, not measured: a citation lookup over 64,000
   characters answers well under it. */
const KEYED_ANSWER_MAX = 8 * 1024 * 1024;

const refuse = (reason, detail, extra = {}) => ({ ok: false, reason, ...extra, detail });
const hostOf = (u) => { try { return new URL(u).hostname.toLowerCase(); } catch { return null; } };

/* R137: the bytes a keyed answer was read from, kept beside the answer object (never in it) for `keyedCapture`, which files exactly the bytes the service served */
const RAW = new WeakMap();

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
  return { text: new TextDecoder("utf-8", { fatal: false }).decode(all), bytes: all };
}

/** R36, R130, R131: `keyedFetch(store, {service, request, purpose, viewer, standing})` fetches `request` (`{url, method, form}`: a public
 *  https locator on the service's own host, `GET` or `POST`, `form` a flat object of strings sent as
 *  `application/x-www-form-urlencoded`) under the group's own key for `service`, read now from
 *  `store.credentials.keyedServiceFor({service})`. Off, or with no key held, or with no credentials handed in, it
 *  answers credentials' refusal (`KEYED_SERVICE_OFF`) and fetches nothing. `purpose` is one of `KEYED_PURPOSES` for that
 *  service. A machine viewer (a daemon, a token) is refused `NOT_PERMITTED` with one exception (K5513, K5527 (6)): the daily
 *  check of a court case a member follows (`purpose: "docket-entries"`, `service: "courtlistener"`), which names its
 *  `standing: {follow}` and is made only while the store's `followStanding({follow, service})` answers that at least one
 *  member still follows the case, once a day for each case and within `POLL_SHARE_DEFAULT` of the day's stated limit
 *  (a service with no stated daily limit is not polled). Every call is counted in the durable ledger (R131) and one that
 *  would pass a stated limit is `RATE_HELD` with `retry_in_ms`, sending nothing. The request goes through the host governor
 *  under R9's agent naming `purpose`; a redirect is answered, never followed. Answers `{ok: true, service, status, text,
 *  content_type, retry_after}` for a 2xx, else `{ok: false, reason: "SOURCE_REFUSED", status, text}`; the key is in
 *  none of them. */
export async function keyedFetch(store, { service = null, request = null, purpose = "keyed-service", viewer = undefined, ownHosts = null, standing = null, at = null } = {}) {
  const svc = typeof service === "string" && Object.prototype.hasOwnProperty.call(SERVICES, service) ? SERVICES[service] : null;
  if (!svc)
    return refuse("UNKNOWN_KEYED_SERVICE", localize("acquisition.keyed.the_keyed_services_your_teams", "the keyed services your team's Civicsmith speaks to are {keys}; nothing was fetched", { keys: String(Object.keys(SERVICES).join(", ")) }),
                  { service: typeof service === "string" ? service.slice(0, 40) : null });
  const purposeRow = typeof purpose === "string" && Object.prototype.hasOwnProperty.call(KEYED_PURPOSES, purpose) ? KEYED_PURPOSES[purpose] : null;
  if (!purposeRow || !purposeRow.services.includes(service))
    return refuse("UNKNOWN_KEYED_PURPOSE", localize("acquisition.keyed.that_purpose_is_not_one", "{purpose} is not a purpose {service} is read for; nothing was fetched", { purpose: String(typeof purpose === "string" ? purpose.slice(0, 40) : ""), service: String(service) }),
                  { service });
  const view = viewOf(store);
  const machine = viewer !== undefined && viewer !== null && isMachineIdentity(viewer);
  /* K1449, K5513: an act with no viewer named is the in-plane caller's own; a machine's is refused unless it is the daily check of a followed case */
  let daemonSubject = null;
  if (machine) {
    const follow = standing && typeof standing === "object" && typeof standing.follow === "string" && standing.follow.trim() ? standing.follow.trim().slice(0, 200) : null;
    let held = false;
    if (purposeRow.daemon === "followed" && follow && store && typeof store.followStanding === "function") {
      try { held = !!(await store.followStanding({ follow, service })); } catch { held = false; }
    }
    if (!held)
      return refuse("NOT_PERMITTED", localize("acquisition.keyed.a_keyed_outside_service", "a keyed outside service is used for a member's or an operator's act, never by a machine credential or the daemon; nothing was fetched"), { service });
    daemonSubject = follow;
  }
  const r = request && typeof request === "object" ? request : {};
  const method = r.method === undefined ? "GET" : r.method;
  const hosts = svc.hostsOf(view);
  /* R28's fence and the key's: a public locator, on the service's own host and no other. */
  if (typeof r.url !== "string" || !isPublicHttpsLocator(r.url) || !hosts.includes(hostOf(r.url)) || (method !== "GET" && method !== "POST")
      || (r.form != null && (typeof r.form !== "object" || Object.values(r.form).some((v) => typeof v !== "string"))))
    return refuse("BAD_KEYED_REQUEST", localize("acquisition.keyed.a_keyed_request_is_a", "a keyed request is a GET or POST of a public https address on {host}, its form a flat set of strings; nothing was fetched", { host: String(hosts.length ? hosts.join(", ") : "the service's own host") }), { service });
  /* DEC-49 REGION is-own-host
     R42 (F16): never to one of the group's own hosts (capture-sources R65), the caller's list or the store's. */
  const own = Array.isArray(ownHosts) ? ownHosts : store && Array.isArray(store.ownHosts) ? store.ownHosts : null;
  if (own && isOwnHost(hostOf(r.url), own)) {
    const row = ARCHIVE_CHECKS.OWN_HOST_REFUSED;
    return refuse("OWN_HOST_REFUSED", localize("acquisition.keyed.hostof_is_one_of_your", "{hostOf} is one of your team's own hosts; nothing was fetched", { hostOf: String(hostOf(r.url)) }),
                  { code: "OWN_HOST_REFUSED", check: row.check, translation: row.translation, service, host: hostOf(r.url) });
  }
  /* END DEC-49 REGION is-own-host */
  /* The key, read at the moment of the call (credentials R29); any refusal is credentials' own, passed on whole. */
  const creds = store && store.credentials && typeof store.credentials.keyedServiceFor === "function" ? store.credentials : null;
  let k = null;
  try { k = creds ? await creds.keyedServiceFor({ service }) : null; } catch { k = null; }
  if (!k || k.ok !== true || typeof k.key !== "string" || !k.key) {
    if (k && k.ok === false) return { ...k, service };
    return refuse("KEYED_SERVICE_OFF", localize("acquisition.keyed.the_team_s_key_for", "the team's key for this service is off or not held; the caller goes on without it"),
                  { code: "KEYED_SERVICE_OFF", service });
  }
  const key = k.key;
  /* R131: the stated limits, counted across purposes in the durable ledger; a call that would pass one is held and nothing is sent */
  const ledger = ledgerOf(store);
  const nowMs = nowMsOf(store, at);
  const limits = limitsOf(view, svc);
  if (machine) {
    /* R130, R131: once a day for each followed case (the UTC day of the instance clock), and only within the poll share of a day's stated limit */
    const dayStart = Math.floor(nowMs / 86_400_000) * 86_400_000;
    if (!ledger || !limits || !Number.isInteger(limits.per_day))
      return refuse("NOT_PERMITTED", localize("acquisition.keyed.the_service_states_no_daily_limit", "the service states no daily call limit this copy can keep, so its dockets are not checked in the background; nothing was fetched"), { service });
    if (ledger.keyedSubjectSince(daemonSubject, purpose, dayStart))
      return refuse("ALREADY_CHECKED_TODAY", localize("acquisition.keyed.this_case_was_already_checked", "this case was already checked today; nothing was fetched"), { service, retry_in_ms: dayStart + 86_400_000 - nowMs });
    if (ledger.keyedSince(service, nowMs - 86_400_000, { actor: "daemon" }).length >= Math.floor(limits.per_day * POLL_SHARE_DEFAULT))
      return refuse("RATE_HELD", localize("acquisition.keyed.the_daily_checks_have_used", "the daily checks have used their share of what the service allows a day, so a member's own lookup still goes; nothing was fetched"), { service, retry_in_ms: 0, poll: true });
  }
  if (ledger && limits) {
    for (const [name, span] of WINDOWS) {
      const cap = limits[name];
      if (!Number.isInteger(cap)) continue;
      const seen = ledger.keyedSince(service, nowMs - span);
      if (seen.length >= cap)
        return refuse("RATE_HELD", localize("acquisition.keyed.the_service_allows_no_more", "the service allows no more calls for now; nothing was sent"), { service, window: name.replace("per_", ""), retry_in_ms: Math.max(0, seen[seen.length - cap] + span - nowMs) });
    }
  }
  const env = (store && store.env) || {};
  const g = store && store.governor;
  let out;
  try {
    out = await hostGovernedFetch(r.url, {
      userAgent: civicsmithUserAgent(env.VERSION || "0.0.0", env.INSTANCE_NAME || "unnamed", purpose),
      governor: g ? { admit: (q) => g.governorAdmit(q), report: (q) => g.governorReport(q) } : null,
      /* the key rides THIS request only, to the service's own host, and a redirect is the answer */
      fetch: (u, init) => fetch(u, { ...init, method, redirect: "manual",
        headers: { ...(init.headers || {}), ...svc.headers(key), accept: "application/json",
                   ...(r.form ? { "content-type": "application/x-www-form-urlencoded" } : {}) },
        ...(r.form ? { body: new URLSearchParams(r.form).toString() } : {}) }) });
  } catch {
    /* a call that was sent and failed still spent the service's allowance (R131) */
    if (ledger) ledger.keyedNote({ service, purpose, actor: machine ? "daemon" : "member", subject: daemonSubject, atMs: nowMs });
    /* as R23: a thrown fetch's message can carry what rode the request, so none is carried */
    return refuse("FETCH_FAILED", localize("acquisition.keyed.the_request_to_the_service", "the request to the service did not complete; its error is not carried because the team's key rode it"), { service });
  }
  if (out.refusedByGovernor)
    return refuse("HOST_COOLING_OFF", localize("acquisition.keyed.the_per_host_governor_is", "the per-host governor is holding requests to {host} ({reason})", { host: String(hostOf(r.url)), reason: String(out.reason) }),
                  { service, retry_in_ms: out.retry_in_ms || 0 });
  /* counted once the governor let it go (R131) */
  if (ledger) ledger.keyedNote({ service, purpose, actor: machine ? "daemon" : "member", subject: daemonSubject, atMs: nowMs });
  const res = out.res;
  const body = await readBounded(res, purposeRow.answer_max);
  if (body.failed) return refuse("FETCH_FAILED", localize("acquisition.keyed.the_service_s_answer_broke", "the service's answer broke off while it was read"), { service });
  /* R140: a service that answers with a check asking for a person is not worked around; the address is named so the caller can hand it to a member */
  { const chal = challengeOf({ status: res.status, headers: res.headers, text: body.text ? body.text.slice(0, 40960) : "", total: body.text ? body.text.length : 0 });
    if (chal) return { ...personRefusal(store, { address: r.url, status: res.status, chal }), service }; }
  if (body.oversize) return refuse("TOO_LARGE", localize("acquisition.keyed.the_services_answer_is_over", "the service's answer is over {KEYED_ANSWER_MAX} bytes; it was not read", { KEYED_ANSWER_MAX: String(purposeRow.answer_max) }), { service });
  const contentType = ((res.headers && res.headers.get("content-type")) || "").split(";")[0].trim().toLowerCase() || null;
  const retryAfter = (res.headers && res.headers.get("retry-after")) || null;
  if (!(res.status >= 200 && res.status < 300))
    return { ok: false, reason: "SOURCE_REFUSED", service, status: res.status, content_type: contentType, retry_after: retryAfter,
             text: body.text.slice(0, 2000), detail: localize("acquisition.keyed.the_service_answered_status", "the service answered {status}", { status: String(res.status) }) };
  const answer = { ok: true, service, status: res.status, content_type: contentType, retry_after: retryAfter, text: body.text };
  if (body.bytes) RAW.set(answer, body.bytes);
  return answer;
}

/** R131: `keyedServiceUsage(store, {service, at})` answers the calls counted and the limits stated for a service, never a key:
 *  `{service, limits: {per_minute, per_hour, per_day}|null, used: {minute, hour, day}, poll: {share, per_day}|null}`. Reads the ledger, writes nothing, never throws. */
export function keyedServiceUsage(store, { service = null, at = null } = {}) {
  try {
    const svc = typeof service === "string" && Object.prototype.hasOwnProperty.call(SERVICES, service) ? SERVICES[service] : null;
    if (!svc) return { ok: false, reason: "UNKNOWN_KEYED_SERVICE", service: typeof service === "string" ? service.slice(0, 40) : null };
    const ledger = ledgerOf(store), nowMs = nowMsOf(store, at), limits = limitsOf(viewOf(store), svc);
    const used = Object.fromEntries(WINDOWS.map(([name, span]) => [name.replace("per_", ""), ledger ? ledger.keyedSince(service, nowMs - span).length : 0]));
    const perDay = limits && Number.isInteger(limits.per_day) ? limits.per_day : null;
    return { ok: true, service, limits: limits ? Object.fromEntries(WINDOWS.map(([name]) => [name, Number.isInteger(limits[name]) ? limits[name] : null])) : null, used,
             poll: perDay === null ? null : { share: POLL_SHARE_DEFAULT, per_day: Math.floor(perDay * POLL_SHARE_DEFAULT) } };
  } catch { return { ok: false, reason: "UNREADABLE", service: typeof service === "string" ? service.slice(0, 40) : null }; }
}

/* R37: CourtListener's Citation Lookup (v4), as its documentation states it: a POST of `text`, at most 64,000
   characters a request, looking up at most 250 citations a request and 60 a minute, a throttled request answered 429
   with `wait_until`. */
export const CITATION_LOOKUP_URL = "https://www.courtlistener.com/api/rest/v4/citation-lookup/";
export const CITATION_TEXT_MAX = 64000;
const SITE = "https://www.courtlistener.com";
/* Each citation's `status`, as the service defines it, in words. */
const LOOKUP = Object.freeze({ 200: "found", 300: "several_matches", 404: "not_found", 400: "unknown_reporter", 429: "not_looked_up" });
export const CITATION_LOOKUP_LABEL = word("acquisition.citation_lookup_label");

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
 *  named (`case_name`, `court`, `date`, `address`), each labeled as the service's answer, never as verified. With
 *  the service off it answers R36's refusal and the recogniser's own reading stands alone. It writes nothing. */
export async function citationLookup(store, { text = null, viewer = null, ownHosts = null } = {}) {
  if (typeof viewer !== "string" || !viewer.trim())
    return refuse("NOT_PERMITTED", localize("acquisition.keyed.a_citation_lookup_is_a", "a citation lookup is a member's or an operator's act, and none was named; nothing was sent"));
  if (typeof text !== "string" || !text.trim())
    return refuse("BAD_TEXT", localize("acquisition.keyed.there_is_no_text", "there is no text to look citations up in; nothing was sent"));
  if (text.length > CITATION_TEXT_MAX)
    return refuse("TEXT_TOO_LONG", localize("acquisition.keyed.the_service_reads_at_most", "the service reads at most {CITATION_TEXT_MAX} characters a request and this text is {length}; nothing was sent", { CITATION_TEXT_MAX: String(CITATION_TEXT_MAX), length: String(text.length) }), { max: CITATION_TEXT_MAX, length: text.length });
  const k = await keyedFetch(store, { service: "courtlistener", purpose: "citation-lookup", viewer, ownHosts,
                                      request: { url: CITATION_LOOKUP_URL, method: "POST", form: { text } } });
  if (!k.ok) {
    /* the service's throttle names when the next request may go */
    if (k.reason === "SOURCE_REFUSED" && k.status === 429) {
      let until = null;
      try { until = str(JSON.parse(k.text).wait_until); } catch { until = null; }
      return { ok: false, reason: "SERVICE_THROTTLED", service: k.service, status: 429, wait_until: until, retry_after: k.retry_after,
               detail: localize("acquisition.keyed.courtlistener_is_holding_citation_lookups", "CourtListener is holding citation lookups from this key for now; nothing was looked up") };
    }
    const { text: _omit, ...rest } = k;
    return { ...rest, note: word("acquisition.note.citation_recognizer_reading") };
  }
  let rows;
  try { rows = JSON.parse(k.text); } catch { rows = null; }
  if (!Array.isArray(rows))
    return refuse("SERVICE_ANSWER_UNREADABLE", localize("acquisition.keyed.the_service_s_answer_is", "the service's answer is not the list of citations its documentation describes"), { service: "courtlistener" });
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

/* ---------------------------------------------------------------- R137: a keyed answer filed as a capture */

/**
 * R137: `keyedCapture(store, {service, request, purpose, viewer, standing, at}, opts)` files a keyed service's answer as ONE capture, graded by its receipt route like any fetched
 * capture: the daily check of a followed case (`purpose: "docket-entries"`, `standing: {follow}`, R36) and a member's refresh of it. The stored bytes are the bytes the service
 * served, hashed as written (R10); the receipt names the route `direct` (this copy fetched them, from the service's host, through the host governor and R9's agent), the address the
 * profile's template made and the instant retrieved; the key is in no address, receipt, document or capture. The document takes the follow as its authority and has one hop,
 * "the service served bytes with this fingerprint for <locator> at <retrieved>"; nothing is reduced, so it carries no `capture.reduced`, and R26's primary-evidence rule holds.
 * Bytes the record already holds are `existed` and nothing new is filed. Nothing is filed for an answer that is not a 200 with a body, or when the service is off (then nothing is sent).
 * A larger answer than the service's bound (`answer_max`) is `TOO_LARGE`, not cut: a keyed answer is a page, not a register file.
 */
export async function keyedCapture(store, args = {}, opts = {}) {
  try {
    const a = args && typeof args === "object" ? args : {};
    const k = await keyedFetch(store, { service: a.service, request: a.request, purpose: a.purpose, viewer: a.viewer, standing: a.standing, ownHosts: a.ownHosts ?? (opts && opts.ownHosts) ?? null, at: a.at ?? null });
    if (!k.ok) return k;
    const bytes = RAW.get(k);
    if (k.status !== 200 || !bytes) return refuse("NO_BODY", localize("acquisition.keyed.no_body", "the service answered with no document, so nothing was filed"), { service: k.service, status: k.status });
    if (bytes.length === 0) return refuse("EMPTY", localize("acquisition.keyed.empty_answer", "the service's answer was empty, so nothing was filed"), { service: k.service });
    const ev = store && store.core && typeof store.core.evidenceStore === "function" ? store.core.evidenceStore() : null;
    if (!ev) return refuse("EVIDENCE_STORAGE_NOT_CONFIGURED", localize("acquisition.keyed.no_storage", "your team's Civicsmith has no evidence storage configured, so nothing was filed"));
    const w = partsWriter(ev);
    await w.write(bytes);
    const stored = await w.finish();
    const p = store.provenance;
    let before = false;
    try { const h = p && typeof p.registerHolds === "function" ? p.registerHolds({ sha: stored.sha256 }) : null; before = !!(h && (h.registered === true || h.acquired === true)); } catch { before = false; }
    if (before) return { ok: true, existed: true, service: k.service, capture: { sha256: stored.sha256 } };
    const env = (store && store.env) || {};
    const locator = a.request.url;
    const retrieved = new Date(nowMsOf(store, a.at ?? null)).toISOString().replace(/\.\d+Z$/, "Z");
    try { await p?.recordReceipt?.({ address: locator, addressNorm: normalizeAddress(locator), captureSha: stored.sha256, retrieved, via: "direct", retrievalLocator: locator }); }
    catch { /* an unwritten receipt is not a failed capture */ }
    const follow = a.standing && typeof a.standing.follow === "string" && a.standing.follow.trim() ? a.standing.follow.trim().slice(0, 200) : null;
    const machine = a.viewer !== undefined && a.viewer !== null && isMachineIdentity(a.viewer);
    const multipart = stored.parts.length > 1;
    const ct = k.content_type && /^[a-z]+\/[a-z0-9.+-]+$/.test(k.content_type) ? k.content_type : null;
    const profile = await profileOf({ ev, sha: stored.sha256, ct, total: stored.bytes, multipart, headers: ct ? { "content-type": ct } : {}, locator, view: profileView(store.core), retrieved,
                                      origin: "fetch", declaredType: ct, parts: stored.parts });
    const name = `keyed-${stored.sha256.slice(0, 16)}`;
    const document = {
      file: `snapshots/${name}`, locator, retrieved, profile,
      ...(follow ? { authority: follow } : {}),
      authority_state: follow ? "determined" : "undetermined",
      authority_basis: localize("acquisition.keyed.authority_basis", "the follow {follow} asked for this check, {retrieved}", { follow: String(follow ?? ""), retrieved }),
      provenance_chain: [{
        who: firstHopWho(env.INSTANCE_NAME, env.VERSION),
        asserts: localize("acquisition.keyed.first_hop_asserts", "the service served bytes with this fingerprint for {locator} at {retrieved}", { locator: String(locator), retrieved }),
        evidence: localize("acquisition.keyed.first_hop_evidence", "first-party https fetch from the service's host through the host governor, hashed at receipt; the team's key rode the request and is not recorded"),
        bound: false, via: "direct",
      }],
      capture: {
        method: localize("acquisition.keyed.method", "bio-plane keyed fetch, https, hashed at receipt"),
        grade: EARNED_CAPTURE_CEILING,
        actor_class: machine ? "daemon" : "member", actor: machine ? null : (typeof a.viewer === "string" ? a.viewer : null),
        sha256: stored.sha256, encoding: "binary", bytes: stored.bytes, ...(ct ? { content_type: ct } : {}),
        keyed: { service: k.service, purpose: a.purpose },
      },
      ...(multipart ? { parts: stored.parts.map((x, i) => ({ file: `snapshots/${name}.part${String(i).padStart(3, "0")}`, sha256: x.sha256, bytes: x.bytes })) } : {}),
      origin: { kind: "named_request", ...(follow ? { follow } : {}) },
      attestation_attempts: [],
    };
    return { ok: true, existed: false, service: k.service, document };
  } catch (e) {
    if (e && e.storeFailure) return { ok: false, reason: "WAITING", detail: localize("acquisition.keyed.store_waiting", "the record could not take the answer just now; it is asked again on the next run") };
    return refuse("KEYED_CAPTURE_UNREADABLE", localize("acquisition.keyed.capture_unreadable", "the service's answer could not be filed ({why})", { why: String(e && e.message || e).slice(0, 120) }));
  }
}
