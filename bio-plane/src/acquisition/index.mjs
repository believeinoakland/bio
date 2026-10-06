/* acquisition — THE ACQUISITION ACT (R1–R37; `build/requirements/acquisition.md`), split from `capture` (K617, K649 (1))
 * by copy of `capture/acquire.mjs` (K624 (1)), whose Rs it implements with their meaning unchanged: capture R1–R7, R9–R14,
 * R16–R20, R33–R36, R41, R42 and R60–R62 are this module's R1–R23 and R25–R28. It is reached in process (K72 (11)):
 * `capture`'s `acquire` and `archiveLookup` hand their own store in as `cap`, and the capture-request drain calls it
 * through its trusted arm (K58). It fetches, hashes and stores the bytes as they arrive, records the fetch as a receipt,
 * profiles what it is, captures a page's supporting files, requests co-attestation, and ANSWERS the provenance document a
 * caller promotes. It writes no bundle (R25) and it does not READ the document (R8): the reading is `extraction`'s.
 *
 * What `capture` keeps about sources and sites (reachability, site assets, links, sessions, the platform's ceiling, the
 * render allowance, the event queue, the validators) is reached ONLY through the store handed in; this module is earlier
 * in the order than `capture` and imports none of it.
 *
 * Every refusal is an answer `{status, body}`, never a throw. The comments carried from the legacy handler keep the
 * reasoning beside the code it explains. */
import { isPublicHttpsLocator, createSha256, EARNED_CAPTURE_CEILING, UNREACHABLE_CAPTURE_GRADE, ISO_TS_RE } from "../record-grammar/index.mjs";
import { civicsmithUserAgent, firstHopWho, CAPTURE_REQUEST_ARM_CHECKS, DRIVE_CAPTURE_CHECKS, RENDER_CAPTURE_CHECKS, INSTALLATION_CHECKS,
         SWEEP_SCOPE_CHECKS } from "./checks.mjs";
import { captureSubresources, normalizeAddress, normalizeCitation } from "../subresources.mjs";
import { detectFormat } from "../formats.mjs";
import { odfEvidentiaryDigest, ODF_FORMATS } from "../odf.mjs";
import { identify, doctypeFor, profileRecord, digests, CONFIDENCE } from "../../../docprofile/registry.mjs";
import { combine } from "../../../jurisdictions/index.mjs";
import { readDriveAddress, driveHop, callerSuppliedHopFacts } from "../drive.mjs";
import { selectCapture } from "../cdx.mjs";
import { WAYBACK_MEMENTO, mementoEndpoints, acceptDatetime, parseTimeMap, timeMapCandidates, readMementoAnswer, mementoRow,
         mementoHop } from "../capture-sources/memento.mjs";
import { RENDER_DEFAULTS, RENDERED_METHOD, completenessReading, keepRenderBodies, renderAllowanceMs, renderConcurrencyCap,
         renderReserveMs, renderBlock, renderedAuthority, rendererFor, renderLocaleFor } from "../render.mjs";
import { governedFetch as hostGovernedFetch, retryAfterMs } from "../host-governor/index.mjs";
import { ARCHIVE_CAPTURE_GRADE } from "../provenance/index.mjs";
import { attest } from "../attestation/index.mjs";

/* R24, R29, R33: the one user agent, the one first hop's `who`, and this module's rows, for every module that sends,
   writes or judges them. The pre-rename aliases are gone (R34, N539). */
export { CIVICSMITH_CONTACT_URL, civicsmithUserAgent, firstHopWho, CAPTURE_REQUEST_ARM_CHECKS,
         DRIVE_CAPTURE_CHECKS, RENDER_CAPTURE_CHECKS, INSTALLATION_CHECKS, SWEEP_SCOPE_CHECKS, ACQUISITION_CHECKS } from "./checks.mjs";
/* R36, R37 (T33-21, K1449): the keyed-service fetch path and its first client. */
export { keyedFetch, citationLookup, KEYED_SERVICE_HOSTS, CITATION_LOOKUP_URL, CITATION_TEXT_MAX, CITATION_LOOKUP_LABEL } from "./keyed.mjs";


const hex = (b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
const stampSecond = (when = Date.now()) => new Date(when).toISOString().replace(/\.\d+Z$/, "Z");

/* Full 64-hex SHA-256 of a string or a byte view: what docprofile's `digests()` calls to name each normalised
   variant, over the SAME raw bytes for `identity`, which must equal the capture sha. */
export async function sha256Hex(v) {
  return hex(await crypto.subtle.digest("SHA-256", typeof v === "string" ? new TextEncoder().encode(v) : v));
}

/* The row readers of the refusal families capture's arms answer with (C-48 the Drive arm, C-83 the render arm). The
   code is a STRING LITERAL at each site so the DEC-49 guard can compare it; a code with no sentence throws. N228:
   `driveRow` is no longer exported: monitoring answers its tick's C-48.8 and C-48.9 from `DRIVE_CAPTURE_CHECKS`
   itself, so no module reads capture's. */
const driveRow = (code) => {
  const row = DRIVE_CAPTURE_CHECKS[code];
  if (!row || typeof row.translation !== "string" || !row.translation)
    throw new Error(`driveRow: ${code} has no DRIVE_CAPTURE_CHECKS row with a canned translation (DEC-49).`);
  return { code, check: row.check, translation: row.translation };
};
const renderRow = (code) => {
  const row = RENDER_CAPTURE_CHECKS[code];
  if (!row || typeof row.translation !== "string" || !row.translation)
    throw new Error(`renderRow: ${code} has no RENDER_CAPTURE_CHECKS row with a canned translation (DEC-49).`);
  return { code, check: row.check, translation: row.translation };
};

/* N80 (K225 (4)): the answer's `note`, which this module composes itself (moved from `affordances.mjs`, REC-48 /
   DEC-39). It is the RECEIPT a caller who has just received bytes reads beside the capture's own `grade`, saying
   in one line what the capture is worth; it is NOT the attest fence (`ATTEST_FENCE`, read by a member DECIDING
   whether to co-attest), and neither replaces the other. Both letters are COMPOSED from the enforced ceiling and
   the letter one rank above it in the same grade array, never typed, so a change of doctrine moves the sentence
   with it. It REFUSES TO COMPOSE a sentence it cannot make true: with no letter above the ceiling it throws at
   load, which stops the plane, rather than shipping "Grade null needs a chain-of-custody web archive". */
export const acquireGradeNote = (ceiling, unreachable) => {
  if (!ceiling || !unreachable)
    throw new Error("op=acquire's note states what this surface earns AND the grade above it; "
                  + "with no grade above the ceiling the sentence cannot be composed truthfully");
  return `Grade ${ceiling}: bytes as fetched, hashed at receipt. Grade ${unreachable} needs a `
       + "chain-of-custody web archive, which this surface cannot produce. Co-attestation raises "
       + `${ceiling} toward evidentiary weight.`;
};
export const ACQUIRE_GRADE_NOTE = acquireGradeNote(EARNED_CAPTURE_CEILING, UNREACHABLE_CAPTURE_GRADE);

/** R9, R24. The plane's identity to a source, in one place because it was in three and they had drifted. BIO does
 *  not disguise its requests; a bare token matches no browser and no known-good crawler pattern, and a great many WAF
 *  rulesets refuse exactly that shape. The STRING is composed by this module's `civicsmithUserAgent` (R24) so the drain's
 *  conduct check reads the bytes that will be sent. A DELEGATED member-browser agent is returned verbatim: it reaches
 *  here only from the capture-request arm, read from a row the conduct check already judged (PL-4, BOB-3). */
export function userAgent(env, purpose = "acquire", delegated = null) {
  if (typeof delegated === "string" && delegated.trim() !== "") return delegated.trim();
  return civicsmithUserAgent((env && env.VERSION) || "0.0.0", (env && env.INSTANCE_NAME) || "unnamed", purpose);
}

/* Whether a primary is read back as TEXT for the recognisers and FW-4's digests: single-part, bounded, and a textual
   declared type. One rule, read by acquire when it records a capture and by op=monitor when it compares one (D-60). */
export const PROFILE_TEXT_MAX = 8 * 1024 * 1024;
/* D-351: the bound on reading an OpenDocument capture back whole for its container digest. Chosen, not measured. */
export const ODF_DIGEST_MAX = 8 * 1024 * 1024;
export function profilesAsText(ct, total, multipart) {
  return !multipart && total <= PROFILE_TEXT_MAX
    && /^(?:text\/|application\/(?:xhtml\+xml|xml|json)|application\/[a-z0-9.+-]*\+xml)/i.test(ct || "");
}

/** R17's `digests`: THE ONE FUNCTION that decides whether a document's normalised digests can be trusted to assert
 *  sameness, and computes them when they can (FW-4; op=monitor asks the same question, D-60). `determined` only
 *  under a CERTAIN textual handler whose read-back bytes hash to `sha`; D-351's container arm for an OpenDocument
 *  package whose content.xml can speak for the substance. Null digests otherwise, never invented. */
export async function substanceDigests(profileBytes, stackId, profCtx, sha, multipart, containerBytes = null) {
  const digestCertain = !!profileBytes && stackId.handler.textual === true && stackId.confidence === CONFIDENCE.CERTAIN;
  if (!digestCertain && !profileBytes && containerBytes && !multipart) {
    let od;
    try { od = await odfEvidentiaryDigest(containerBytes, sha256Hex); }
    catch (e) { od = { determined: false, flavour: "unread",
      basis: `the container digest could not be taken (${String(e && e.message || e).slice(0, 90)}), so none is claimed` }; }
    if (od.determined) {
      if (await sha256Hex(containerBytes) !== sha)
        return { determined: false, rendition: null, evidentiary: null,
          basis: "the container bytes read back from the store did not hash to the capture identity, so no container digest could be trusted" };
      return { determined: true, rendition: null, evidentiary: od.evidentiary, over: od.over, container: od.flavour,
               boundary_missed: false, basis: od.basis };
    }
    if (od.flavour) return { determined: false, rendition: null, evidentiary: null, container: od.flavour, basis: od.basis };
  }
  if (!digestCertain)
    return { determined: false, rendition: null, evidentiary: null,
      basis: profileBytes
        ? `the ${stackId.handler.key} stack was not identified with certainty (${stackId.confidence}); its normalisation is not trusted to assert sameness, so the substance digest is undetermined`
        : `the document was not read as text (${multipart ? "multipart" : "non-textual or too large"}); no normalisation was applied, so the substance digest is undetermined` };
  const dg = await digests(profileBytes, stackId.handler, { ...profCtx, sha256: sha256Hex });
  if (dg.identity !== sha)
    return { determined: false, rendition: null, evidentiary: null,
      basis: "the primary bytes read back from the store did not hash to the capture identity, so no normalised digest could be trusted" };
  return { determined: true, rendition: dg.rendition, evidentiary: dg.evidentiary, boundary_missed: !!dg.boundary_missed,
           basis: `normalised under ${stackId.handler.key} v${stackId.handler.version} (certain); identity is the capture sha` };
}

/** R17: the combined view of the instance's active jurisdiction profiles (record-core's `jurisdiction_profiles`,
 *  jurisdictions.combine). An instance that has never set the setting passes no view, which is docprofile's own
 *  legacy fallback (its R6, K39), so an instance keeps recognising what it recognised; a setting that does not
 *  combine passes no view either, and says so in `basis`. */
export function profileView(core) {
  const ids = core && typeof core.getSetting === "function" ? core.getSetting("jurisdiction_profiles") : null;
  if (!Array.isArray(ids)) return { view: undefined, ids: null, basis: "no active jurisdiction profiles are set" };
  const c = combine(ids);
  return c.ok ? { view: c.view, ids, basis: `the combined view of ${ids.length ? ids.join(", ") : "no profile"}` }
              : { view: undefined, ids, basis: `the active profiles did not combine (${(c.errors || []).map((e) => e.code).join(", ")})` };
}

/* The locale a render asks for (R7): capture-sources' `renderLocaleFor` over R17's view (K119), the default only as
   its own fallback. */
const renderLocale = (view) => renderLocaleFor(view);

/* R9, R28: every outbound fetch through the host governor (host-governor R15–R17), under the agent this module
   composes. The governor is reached in process (K72 (2)). `headers` are R22's conditional request headers;
   `credential` is R23's (capture-sources R56's entry), sent by `scopedFetch` to its own host only. */
export async function governedFetch(cap, target, purpose, delegated = null, { headers = null, credential = null, manual = false } = {}) {
  const g = cap.governor;
  const doFetch = headers || credential ? scopedFetch(target, { headers, credential, env: cap.env, purpose, follow: !manual }) : (u, i) => fetch(u, i);
  /* `manual`: the redirect is the answer, not followed (R32 reads a TimeGate's redirect and a memento's own status; R31
     judges each hop of a sweep against its scope). */
  return hostGovernedFetch(target, { userAgent: userAgent(cap.env, purpose, delegated),
    fetch: manual ? (u, i) => doFetch(u, { ...i, redirect: "manual" }) : doFetch,
    governor: g ? { admit: (q) => g.governorAdmit(q), report: (q) => g.governorReport(q) } : null });
}

/* R23: the kinds of credential a member may supply (capture-sources R55), and how each rides a request. */
const CREDENTIAL_KINDS = Object.freeze(["login", "user-agent", "other"]);
const REDIRECT_MAX = 20;
const base64Of = (text) => btoa(String.fromCharCode(...new TextEncoder().encode(text)));
/* A supplied agent is a DELEGATED one, so it is sent through R9's one function, which returns it verbatim. */
function withCredential(headers, credential, env, purpose) {
  if (credential.kind === "user-agent") return { ...headers, "user-agent": userAgent(env, purpose, credential.secret) };
  if (credential.kind === "login") return { ...headers, authorization: `Basic ${base64Of(credential.secret)}` };
  return { ...headers, authorization: credential.secret };
}

/* R22, R23: the fetch the governor calls, adding R22's conditional headers and, on the address's OWN host only,
   R23's credential. With a credential, redirects are followed BY HAND so that a hop to another host is fetched
   without it (capture-sources R56's caller obligation): the runtime's own following would carry the header on. A
   redirect this call follows by hand is held to R28's fence: a hop to an address that is not a public locator (or one
   that does not parse) is not followed, and the redirect itself is the answer, so the source is refused by name. */
function scopedFetch(target, { headers, credential, env, purpose, follow = true }) {
  let home = null;
  try { home = new URL(target).hostname.toLowerCase(); } catch { home = null; }
  return async (u, init = {}) => {
    const plain = { ...(init.headers || {}), ...(headers || {}) };
    if (!credential) return fetch(u, { ...init, headers: plain });
    let url = String(u);
    for (let hop = 0; ; hop++) {
      let host = null;
      try { host = new URL(url).hostname.toLowerCase(); } catch { host = null; }
      const res = await fetch(url, { ...init, redirect: "manual", headers: host && host === home ? withCredential(plain, credential, env, purpose) : plain });
      const loc = res.status >= 300 && res.status < 400 && res.status !== 304 ? res.headers.get("location") : null;
      if (!loc || hop >= REDIRECT_MAX || !follow) return res;
      let next = null;
      try { next = new URL(loc, url).href; } catch { next = null; }
      if (!next || !isPublicHttpsLocator(next)) return res;
      try { await res.body?.cancel?.(); } catch { /* the hop's body is not read */ }
      url = next;
    }
  };
}

/* R10: the most this surface will take from one source, in parts or not. */
const CAPTURE_MAX = 256 * 1024 * 1024;

/** R31: whether `address` is in a sweep's scope, as link-sweep R1 defines it: its normalised form equals a prefix, or
 *  continues one at a `/`. */
function inSweepScope(address, scope) {
  if (typeof address !== "string" || !Array.isArray(scope)) return false;
  const a = normalizeAddress(address);
  return scope.some((p) => {
    if (typeof p !== "string" || !p) return false;
    const n = normalizeAddress(p);
    return a === n || (a.startsWith(n) && (n.endsWith("/") || a[n.length] === "/"));
  });
}

/** R3's fence, in ONE place so the lookup and the capture cannot disagree about when the fallback may fire. */
async function archiveEligibility(cap, address) {
  const reach = cap.sourceReachability({ addressNorm: normalizeAddress(address) });
  if (!reach.fallback_eligible)
    return { ok: false, status: 409, payload: { ok: false, reason: "NOT_ELIGIBLE",
      detail: "archive.org is a backup source and this document has not been unreachable long enough to justify one",
      reachability: reach } };
  /* THEIR figure, ours to obey conservatively (ARCHIVE-FALLBACK.md): set on first contact, a third-party number,
     never presented as measured (K72 (12)). */
  try { await cap.governor?.governorConfig({ host: "web.archive.org", appetite_per_min: 24 }); }
  catch { /* the default appetite already governs */ }
  return { ok: true, reach };
}

/* R32 (N492, K1032): the archive is a Memento descriptor (capture-sources R37), so any compliant archive can serve the
   lookup; the Internet Archive is the one this instance asks. */
const ARCHIVE = WAYBACK_MEMENTO;
/* How many of a TimeMap's mementos are fetched, newest first, before the lookup gives up, and how many redirects one
   memento fetch follows (a raw memento at an inexact instant redirects to the exact one). Each fetch is one request
   at the archive's 24 a minute. Chosen, not measured. */
const MEMENTO_TRIES = 4;
const MEMENTO_HOPS = 5;

/** R35: the instant a caller asks the archive about. Absent, the lookup asks for now, as before (`{ok, at: null}`); an
 *  instant (record-grammar's `ISO_TS_RE`, to the second, a real moment) is `{ok, at, ms, timestamp}`; anything else is
 *  `MEMENTO_BAD_ASKED_DATE`, refused before anything is fetched. */
function askedInstant(at) {
  if (at === undefined || at === null) return { ok: true, at: null, ms: null };
  const ms = typeof at === "string" && ISO_TS_RE.test(at) ? Date.parse(at) : NaN;
  if (!Number.isFinite(ms) || new Date(ms).toISOString().replace(/\.\d+Z$/, "Z") !== at)
    return { ok: false, status: 400, payload: { ok: false, reason: "MEMENTO_BAD_ASKED_DATE", at: typeof at === "string" ? at.slice(0, 40) : null,
      detail: "`at` names the moment asked about as an instant to the second, YYYY-MM-DDTHH:MM:SSZ; nothing was fetched" } };
  return { ok: true, at, ms, timestamp: at.replace(/[-:TZ]/g, "") };
}

/** R35: what a lookup for a past instant states beside the memento it chose, so a memento from another moment is never
 *  presented as the page at `at`: the instant asked for, the memento's own datetime, and how far apart they are. */
function askedReading(asked, chosen) {
  if (!asked || !asked.at) return null;
  const apart = Math.round(Math.abs(Date.parse(chosen.archived_at) - asked.ms) / 1000);
  return { asked_at: asked.at, memento_datetime: chosen.archived_at, apart_seconds: apart,
           asked_note: apart === 0 ? `the memento is of ${chosen.archived_at}, the instant asked about`
             : `the memento is of ${chosen.archived_at}, ${apart} seconds ${Date.parse(chosen.archived_at) < asked.ms ? "before" : "after"} `
               + `the instant asked about (${asked.at}); it is not the page at ${asked.at}` };
}

/* A body not read is released, never awaited: a cancellation the source does not acknowledge must not hold the act. */
const cancelBody = (res) => { try { res?.body?.cancel?.()?.catch?.(() => {}); } catch { /* the source may already be gone */ } };
const hostOf = (u) => { try { return new URL(u).host; } catch { return String(u); } };

/* The bytes of a response hashed as they arrive and kept nowhere (the lookup decides, it does not file):
   `{sha, bytes}`, `{oversize}` past `max`, or `{failed}` when the stream breaks (an answer, never a throw). */
async function hashBody(res, max = CAPTURE_MAX) {
  const h = createSha256();
  let bytes = 0;
  const reader = res && res.body && res.body.getReader ? res.body.getReader() : null;
  try {
    if (reader) for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.length;
      if (bytes > max) { try { await reader.cancel(); } catch { /* gone */ } return { oversize: true, bytes }; }
      h.update(value);
    }
  } catch (e) { return { failed: String(e && e.message || e), bytes }; }
  return { sha: h.hex(), bytes };
}
/* A memento whose body broke off while it was read: the archive could not be read, not a memento of anything. */
const archiveBroke = (detail) => ({ ok: false, status: 502, payload: { ok: false, reason: "ARCHIVE_UNREACHABLE",
  detail: `the memento's body broke off while it was read (${detail})` } });

/* SHA-256 of no bytes: the digest an empty memento's row is made over (`mementoRow` reads its `bytes: 0` as the
   empty-body digest, R29's own refusal). */
const EMPTY_SHA256 = createSha256().hex();

/** R32: whether the first bytes of a memento's body have arrived, read WITHOUT consuming them, so the capture streams,
 *  hashes and stores the very bytes the choice is made over. `{empty: true}` when the body ends with no byte (it is
 *  released); otherwise `{res}`, a response that yields the bytes read ahead and then the rest; `{failed}` when the
 *  stream breaks. A body that is not a stream is handed on as it came, for the capture to name. */
async function peekBody(res) {
  const reader = res && res.body && res.body.getReader ? res.body.getReader() : null;
  if (!reader) return { res };
  const ahead = [];
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) return { empty: true };
      if (value && value.length) { ahead.push(value); return { res: replayed(res, ahead, reader) }; }
    }
  } catch (e) { return { failed: String(e && e.message || e) }; }
}
function replayed(res, ahead, reader) {
  const read = async () => (ahead.length ? { done: false, value: ahead.shift() } : reader.read());
  const cancel = async (why) => { ahead.length = 0; try { await reader.cancel(why); } catch { /* the source may already be gone */ } };
  return { status: res.status, ok: res.ok, url: res.url, headers: res.headers, body: { getReader: () => ({ read, cancel }), cancel } };
}

/** R3, R32, R35: find a memento of `address` the way RFC 7089 offers one, every request through the host governor. The
 *  TimeGate is asked first, with `Accept-Datetime` at the instant asked about, `asked.ms` (R35), else now (the fallback
 *  fires because the document cannot be reached NOW, so the newest memento is the answer to the question asked); when
 *  it gives no usable memento, the TimeMap is read and its candidates are fetched nearest the instant asked about
 *  first, else newest first. Each memento is fetched in its raw form (the descriptor's `raw`, else
 *  as given), redirects being answers, never followed silently. A memento that is not a 200 is hashed and kept as a
 *  row `selectCapture` refuses by its own words. A 200 is handed to the caller's `take({res, answer, locator})`,
 *  which reads as much of its body as the choice needs: `{row}` when `selectCapture` refuses the memento over the
 *  bytes received (an empty body, N510), and the lookup goes on to the next candidate as for any refused row; `{fail}`
 *  to end the lookup with that answer; anything else is the memento taken, answered with its answer and the rows
 *  refused before it, so the caller hashes (and, capturing, stores) the very bytes the choice is made over
 *  (`chooseMemento`). Every refusal is an answer `{ok: false, status, payload}`. */
async function mementoLookup(cap, address, { indexPurpose = "archive-lookup", fetchPurpose = "archive-lookup", asked = null, take } = {}) {
  const ends = mementoEndpoints(ARCHIVE, address);
  if (!ends) return { ok: false, status: 400, payload: { ok: false, reason: "BAD_ADDRESS", detail: "the archive has no endpoint for this address" } };
  const considered = [], rows = [], tried = new Set();
  const call = async (url, purpose, headers = null) => {
    let g;
    try { g = await governedFetch(cap, url, purpose, null, { headers, manual: true }); }
    catch (e) { return { fail: { ok: false, status: 502, payload: { ok: false, reason: "ARCHIVE_UNREACHABLE", detail: String(e && e.message || e) } } }; }
    if (g.refusedByGovernor)
      return { fail: { ok: false, status: 429, payload: { ok: false, reason: "HOST_COOLING_OFF",
        detail: `the governor is holding requests to ${hostOf(url)} (${g.reason})`, retry_in_ms: g.retry_in_ms || 0 } } };
    return { res: g.res };
  };
  const archiveRefused = (res, what) => ({ ok: false, status: 502, payload: { ok: false, reason: "ARCHIVE_REFUSED", status: res.status,
    detail: res.status === 429 ? "the archive is rate-limiting us; the governor will hold this host"
                               : `the archive's ${what} answered ${res.status}`, considered } });
  /* One memento, raw, its redirects followed by hand within the archive's public addresses. */
  const tryMemento = async (uri) => {
    let url = typeof ARCHIVE.raw === "function" ? ARCHIVE.raw(uri) : uri;
    if (tried.has(url)) return { next: true };
    tried.add(url);
    for (let hop = 0; ; hop++) {
      if (!isPublicHttpsLocator(url)) { considered.push({ uri: url, refused: "not a public https address", reason: "BAD_LOCATOR" }); return { next: true }; }
      const c = await call(url, fetchPurpose);
      if (c.fail) return c;
      const res = c.res;
      const ans = readMementoAnswer({ url, status: res.status, headers: res.headers });
      /* The archive itself refusing (no Memento-Datetime), as against a memento OF a refusal, which is a row. */
      if (!ans.ok && (res.status === 429 || res.status >= 500)) { cancelBody(res); return { fail: archiveRefused(res, "memento") }; }
      if (ans.ok && ans.kind === "redirect" && hop < MEMENTO_HOPS) { cancelBody(res); url = ans.location; continue; }
      if (!ans.ok || ans.kind !== "memento") {
        cancelBody(res);
        considered.push({ uri: url, reason: ans.ok ? "MEMENTO_NOT_NEGOTIATED" : ans.reason,
                          refused: ans.ok ? `the archive was still redirecting after ${MEMENTO_HOPS} hops` : ans.detail });
        return { next: true };
      }
      if (ans.status === 200) {
        const t = await take({ res, answer: ans, locator: url });
        if (t.fail) return { fail: t.fail };
        if (!t.row) return { ...t, ok: true, answer: ans, locator: url, rows, considered };
        /* N510: refused over the bytes received; an older candidate may still stand in for the document. */
        rows.push(t.row);
        return { next: true };
      }
      /* A memento of a redirect or an error: a true fact about that fetch, not a copy of the document (capture-sources
         R29), refused by selectCapture's own words over a row of the bytes received. */
      const h = await hashBody(res);
      if (h.failed) return { fail: archiveBroke(h.failed) };
      rows.push(mementoRow(ans, h.oversize ? { sha256: null } : { sha256: h.sha, bytes: h.bytes }) || { timestamp: ans.timestamp });
      return { next: true };
    }
  };
  /* The TimeGate. */
  const tg = await call(ends.timegate, indexPurpose, { "accept-datetime": acceptDatetime(asked && asked.at ? asked.ms : Date.now()) });
  if (tg.fail) return tg.fail;
  if (tg.res.status === 429 || tg.res.status >= 500) { cancelBody(tg.res); return archiveRefused(tg.res, "TimeGate"); }
  const ga = readMementoAnswer({ url: ends.timegate, status: tg.res.status, headers: tg.res.headers });
  cancelBody(tg.res);
  if (ga.ok) {
    const m = await tryMemento(ga.kind === "redirect" ? ga.location : ga.memento_uri);
    if (!m.next) return m.fail || m;
  } else if (tg.res.status === 404) considered.push({ uri: ends.timegate, refused: "the TimeGate holds no memento of this address (404)" });
  else considered.push({ uri: ends.timegate, reason: ga.reason, refused: ga.detail });
  /* The TimeMap. */
  const tm = await call(ends.timemap, indexPurpose);
  if (tm.fail) return tm.fail;
  /* A 404, or an empty TimeMap, is the archive saying it holds no memento of the address: nothing to try. */
  if (!tm.res.ok && tm.res.status !== 404) { cancelBody(tm.res); return archiveRefused(tm.res, "TimeMap"); }
  const mapText = tm.res.status === 404 ? (cancelBody(tm.res), "") : await tm.res.text();
  const map = mapText.trim() ? parseTimeMap(mapText) : { ok: true, mementos: [], refused: [] };
  if (!map.ok) return { ok: false, status: 502, payload: { ok: false, reason: map.reason, detail: map.detail, considered, address } };
  const cands = timeMapCandidates(map);
  considered.push(...cands.considered);
  /* R35: nearest the instant asked about first, the earlier of two equally near first; each still chosen by
     selectCapture over the bytes received. With no instant, the TimeMap's own order, newest first. */
  const near = (m) => Math.abs(Date.parse(m.archived_at) - asked.ms);
  const ordered = !cands.ok ? [] : asked && asked.at
    ? [...cands.candidates].sort((a, b) => near(a) - near(b) || (a.timestamp < b.timestamp ? -1 : a.timestamp > b.timestamp ? 1 : 0))
    : cands.candidates;
  for (const cand of ordered.slice(0, MEMENTO_TRIES)) {
    const m = await tryMemento(cand.uri);
    if (!m.next) return m.fail || m;
  }
  return nothingUsable(selectCapture(rows), considered, address);
}

/* No memento may stand in for the document. The first Memento refusal met is answered by name when no memento was
   even read as one; otherwise selectCapture's own refusal, with every memento it considered and why. */
function nothingUsable(sel, considered, address) {
  const named = sel.considered.length ? null : considered.find((c) => c.reason);
  return { ok: false, status: named ? 502 : 404, payload: { ok: false, reason: named ? named.reason : sel.reason,
    detail: named ? named.refused : sel.detail, considered: [...sel.considered, ...considered], address } };
}

/** R32: the choice over the bytes received. The memento's row is `mementoRow` over this call's digest of them, the
 *  choice `selectCapture`'s (R29–R31 as written, an empty body refused by its own reason), the hop `mementoHop`'s,
 *  every fact from what the archive answered and the bytes received, never from a caller (D-112). */
function chooseMemento(m, sha, bytes, address, asked = null) {
  const sel = selectCapture([mementoRow(m.answer, { sha256: sha, bytes }), ...m.rows]);
  if (!sel.ok) return nothingUsable(sel, m.considered, address);
  /* R35: the hop states the instant asked about beside the memento's own datetime */
  const reading = askedReading(asked, sel.chosen);
  return { ok: true, chosen: sel.chosen, rejected: [...sel.rejected, ...m.considered], usable_count: sel.usable_count, reading,
           hop: { ...mementoHop(sel.chosen, m.locator, { archive: ARCHIVE, answer: m.answer }), ...(reading || {}) } };
}

/** R3, R32, R35: `archiveLookup({address, at})` decides and reports what the archive arm would do, without capturing:
 *  the chosen memento's bytes are fetched and hashed, and kept nowhere. With `at`, the memento is sought for that
 *  instant and the answer states it beside the memento's own datetime. */
export async function archiveLookup(cap, { address, at } = {}) {
  if (typeof address !== "string" || !isPublicHttpsLocator(address))
    return { status: 400, body: { ok: false, reason: "BAD_ADDRESS", detail: "the document address must be https on a public host" } };
  const asked = askedInstant(at);
  if (!asked.ok) return { status: asked.status, body: asked.payload };
  const el = await archiveEligibility(cap, address);
  if (!el.ok) return { status: el.status, body: el.payload };
  /* Each 200 memento is hashed whole; one selectCapture refuses over its bytes (N510: an empty one) is passed over. */
  const m = await mementoLookup(cap, address, { asked, take: async ({ res, answer, locator }) => {
    const h = await hashBody(res);
    if (h.failed) return { fail: archiveBroke(h.failed) };
    if (h.oversize)
      return { fail: { ok: false, status: 413, payload: { ok: false, reason: "TOO_LARGE", bytes: h.bytes, maxBytes: CAPTURE_MAX,
        retrieval_locator: locator, detail: "the memento exceeds what this surface will capture even in parts" } } };
    const row = mementoRow(answer, { sha256: h.sha, bytes: h.bytes });
    return selectCapture([row]).ok ? { sha: h.sha, bytes: h.bytes } : { row };
  } });
  if (!m.ok) return { status: m.status, body: m.payload };
  const c = chooseMemento(m, m.sha, m.bytes, address, asked);
  if (!c.ok) return { status: c.status, body: c.payload };
  return { status: 200, body: {
    ok: true, address, eligible_because: el.reach.basis, chosen: c.chosen, ...(c.reading || {}),
    /* Every memento considered and why it was not used: "nothing suitable" alone is unauditable. */
    rejected: c.rejected, usable_count: c.usable_count, retrieval_locator: m.locator, provenance_hop: c.hop,
    capture_with: { op: "acquire", via: "archive.org", address, ...(asked.at ? { at: asked.at } : {}) },
    note: "this op decides and reports; op=acquire with via=archive.org decides AGAIN and captures, "
        + "because the hop that reaches the record must be built by the same call that fetched the memento" } };
}

/* R28: an outbound request that is not a plain GET of a document (the timestamp authorities' POSTs, the co-archive)
   still asks the host governor for admission and reports its outcome, under this instance's agent. */
export function governedCall(cap, purpose) {
  const g = cap.governor;
  return async (u, init = {}) => {
    let host = null;
    try { host = new URL(String(u)).host; } catch { host = null; }
    if (host && g) {
      let a = null;
      try { a = await g.governorAdmit({ host }); } catch { a = null; }
      if (a && a.admitted === false) throw new Error(`the per-host governor is holding requests to ${host} (${a.reason || "governed"})`);
      if (a && a.wait_ms > 0) await new Promise((r) => setTimeout(r, a.wait_ms));
    }
    const res = await fetch(u, { ...init, headers: { ...(init.headers || {}), "user-agent": userAgent(cap.env, purpose) } });
    if (host && g) { try { await g.governorReport({ host, status: res.status, retry_after_ms: retryAfterMs(res.headers.get("retry-after")) }); } catch { /* not a failed call */ } }
    return res;
  };
}

/** R20 (K60, K72 (10)): co-attestation at every capture, through `attestation`'s `attest` (its R1–R3): a trusted
 *  timestamp over the capture digest and, wherever the source permits, a co-archive of the locator at capture time.
 *  Every attempt and its outcome is recorded; a failure is an attempt, never a failed capture. The archive arm's
 *  locator is itself an archive replay, so no co-archive is asked of it. `holds` asks `provenance`'s register (its R5)
 *  through the store handed in. */
async function coAttest(cap, { sha, locator, via, ev }) {
  const p = cap.provenance;
  /* The register's shape (C-18.1): each attempt `{service, attempted, ok}`, `attempted` whether the service was
     asked, `ok` whether it answered; attestation's instant and words are kept beside them. */
  const recorded = (a) => ({ ...a, service: String(a.service || a.kind || "attest"), attempted: true, ok: a.ok === true,
                             ...(typeof a.attempted === "string" ? { at: a.attempted } : {}) });
  const notAsked = (why) => [{ service: "attest", attempted: false, ok: false, at: stampSecond(), note: why }];
  try {
    const out = await attest({ sha256: sha, archive: via !== "archive.org", locator },
      { head: (s) => ev.head(s), put: (s, b) => ev.put(s, b), fetch: governedCall(cap, "attest"),
        holds: async (s) => (p && typeof p.registerHolds === "function" ? p.registerHolds({ sha: s }) : null) });
    const attempts = Array.isArray(out && out.attempts) ? out.attempts.filter((a) => a && typeof a === "object") : [];
    return attempts.length ? attempts.map(recorded)
      : notAsked(String((out && (out.reason || out.note || out.detail)) || "no attempt was reported"));
  } catch (e) {
    return notAsked(String(e && e.message || e).slice(0, 200));
  }
}

/** R29, C-68.1 (D-278, K794, K850): THE CAPABILITY COMPLAINT, minted at this one region for every raiser: `acquire` on a
 *  copy installed with no evidence storage bound, and control-plane's door (`storageAbsent`), which hands it to the arms
 *  it routes `capture`, `pdfstructure`, `acquire` and `attest` to. Answers `{status: 503, body}`; `op` and `error` are
 *  the caller's, passed in byte-identical from each site. Each caller's body is the one it has always answered: the
 *  door's carries `code` (`{ok, reason, code, check, translation, error, op}`), and `acquire`'s, asked with
 *  `{code: false}`, does not (`{ok, reason, check, translation, op, error}`). The row is read from `INSTALLATION_CHECKS`,
 *  never copied. Pure; never throws. */
export function evidenceStorageAbsent(op, error, { code = true } = {}) {
  const row = INSTALLATION_CHECKS.EVIDENCE_STORAGE_NOT_CONFIGURED;
  /* DEC-49 REGION is-storage-absent */
  return { status: 503, body: code
    ? { ok: false, reason: "EVIDENCE_STORAGE_NOT_CONFIGURED", code: "EVIDENCE_STORAGE_NOT_CONFIGURED", check: row.check,
        translation: row.translation, error, op }
    : { ok: false, reason: "EVIDENCE_STORAGE_NOT_CONFIGURED", check: row.check, translation: row.translation, op, error } };
  /* END DEC-49 REGION is-storage-absent */
}

/** R1–R23. The one act that fetches and files. `opts`: `cls` (the control plane's caller class), `member` (whether the
 *  caller is a member session), `sessMember` (that member), `storeName`, and — only from the in-process drain, never
 *  from a request — `captureRequest` (the draining row's address, purpose, agent and render flag, K58). Answers
 *  `{status, body}`. */
export async function acquire(cap, body0, { cls = null, member = false, sessMember = null, storeName = "bio", captureRequest = null } = {}) {
  const body = body0 && typeof body0 === "object" ? { ...body0 } : {};
  const answer = (status, b) => ({ status, body: b });
  const op = "acquire";
  const ev = cap.core && typeof cap.core.evidenceStore === "function" ? cap.core.evidenceStore() : null;
  /* C-68.1 (K794, K850): raised through this module's one raiser, its body as it has always been (no `code`). */
  if (!ev) return evidenceStorageAbsent(op, "this instance has no evidence storage configured", { code: false });
  /* R1, K58: THE CAPTURE-REQUEST ARM IS IN PROCESS ONLY. From outside, `via: "capture-request"` is refused
     C-28.13 whatever the caller: the AI does not capture, it REQUESTS, and the daemon captures. */
  if (!captureRequest && body.via === "capture-request") {
    /* DEC-49 REGION is-capture-request-arm */
    const row = CAPTURE_REQUEST_ARM_CHECKS.CAPTURE_NOT_DRAINING;
    return answer(403, { ok: false, reason: "CAPTURE_NOT_DRAINING", code: "CAPTURE_NOT_DRAINING",
      check: row.check, translation: row.translation, cls, request: body.request ?? null, op,
      detail: "this instance fetches a requested document only from inside its own drain, and a request cannot "
            + "reach that arm from outside. The AI does not capture: it REQUESTS, and the daemon captures with "
            + "provenance preserved (DEC-47's structural gate, DEC-60). Write a request and let the drain make it." });
    /* END DEC-49 REGION is-capture-request-arm */
  }
  /* R1, REC-33: the daemon class reaches acquire through the archive fallback and the capture-request drain. Direct
     acquisition is a member's or an operator's act. */
  if (cls === "daemon" && body.via !== "archive.org" && !captureRequest)
    return answer(403, { ok: false, reason: "NOT_PERMITTED", op, cls,
      detail: "the daemon class reaches op=acquire through the archive fallback "
            + "(via: \"archive.org\") and through the capture-request drain (via: \"capture-request\"). "
            + "Direct acquisition is a member's or an operator's act, and the "
            + "unattended credential is scoped to the verbs the unattended paths need." });
  /* R3, R32, D-112: the archive arm names the DOCUMENT and lets the plane find the memento, inside the same call that
     files the bytes, so the eligibility fence cannot be walked around and the hop is built from what the archive
     answered this call. A monitoring path: admin, probe and daemon only. */
  let archiveHopRecorded = null, archiveAddress = null, archiveAsked = null, archiveAt = null;
  if (body.via === "archive.org") {
    if (cls !== "admin" && cls !== "probe" && cls !== "daemon")
      return answer(403, { ok: false, reason: "NOT_PERMITTED", op, via: "archive.org",
        detail: "the archive fallback is a monitoring path: it runs under an operator or daemon credential, "
              + "never a member's. Capture the document directly, or ask an administrator to run the fallback." });
    const addr = body.address;
    if (typeof addr !== "string" || !isPublicHttpsLocator(addr))
      return answer(400, { ok: false, reason: "BAD_ADDRESS",
        detail: "an archive-sourced capture names the document address, not a replay locator" });
    /* R35: the instant asked about, refused before anything is fetched when it is not one */
    archiveAt = askedInstant(body.at);
    if (!archiveAt.ok) return answer(archiveAt.status, archiveAt.payload);
    const el = await archiveEligibility(cap, addr);
    if (!el.ok) return answer(el.status, el.payload);
    archiveAsked = addr;
    /* R2: the retrieval locator is the memento this call finds, never a caller's. */
    delete body.locator;
  }
  /* K58: EVERYTHING THAT DECIDES WHAT LEAVES THIS INSTANCE COMES FROM THE ROW the drain's conduct check judged: the
     address, the purpose, the agent, and whether to render. */
  let crPurpose = null, crAgent = null, crOrigin = null, crHeldSha = null, crCredential = null, sweepScope = null;
  if (captureRequest) {
    body.locator = captureRequest.locator;
    crPurpose = captureRequest.purpose || null;
    crAgent = captureRequest.agent || null;
    if (captureRequest.render === true) body.render = true; else delete body.render;
    /* R21 (capture-requests R38): the sweep the drain's row names, never a body's `matchedSweep`. */
    const o = captureRequest.origin;
    if (o && typeof o === "object" && o.matched_sweep != null && o.matched_sweep !== "")
      crOrigin = { kind: "sweep", matched_sweep: o.matched_sweep, deeming_actor: o.deeming_actor ?? null };
    /* R31 (K1126): a SWEEP origin is one the in-process caller declares `kind: "sweep"` (link-sweep R5's shape), and
       it carries its scope on this arm, never a body; the drain's R38 origin (no `kind`) is not one. Refused before
       anything is fetched. */
    if (crOrigin && o.kind === "sweep") {
      const sc = captureRequest.scope;
      /* DEC-49 REGION is-sweep-scope */
      if (!Array.isArray(sc) || !sc.length || !sc.every((p) => typeof p === "string" && p !== "")) {
        const row = SWEEP_SCOPE_CHECKS.SWEEP_SCOPE_MISSING;
        return answer(400, { ok: false, reason: "SWEEP_SCOPE_MISSING", code: "SWEEP_SCOPE_MISSING", check: row.check,
          translation: row.translation, op, matched_sweep: crOrigin.matched_sweep,
          detail: "a sweep-origin acquire names the in-scope prefixes it may reach (link-sweep R1's `sources`); "
                + "this one named none, so nothing was fetched" });
      }
      /* END DEC-49 REGION is-sweep-scope */
      sweepScope = sc;
    }
    /* R22 (capture-requests R39): the capture the record holds of this address; anything but 64 hex is ignored. */
    if (typeof captureRequest.heldSha === "string" && /^[0-9a-f]{64}$/.test(captureRequest.heldSha)) crHeldSha = captureRequest.heldSha;
    /* R23 (capture-requests R41): the one credential admitted for this request's scope (capture-sources R56). */
    const cr = captureRequest.credential;
    if (cr && typeof cr === "object" && CREDENTIAL_KINDS.includes(cr.kind) && typeof cr.secret === "string" && cr.secret !== "")
      crCredential = cr;
  }
  /* R4, CAP-8 — THE GOOGLE DRIVE HOST STACK (Bob, 2026-09-14: keep the link, export an OpenDocument version). The
     recognition, the composition and the fetch all happen inside the ONE call that files the bytes. */
  let driveCapture = null, driveHopRecorded = null;
  /* DEC-49 REGION is-drive-capture */
  {
    /* D-112 FIRST, before the address is even looked at: a caller inventing an export format for a document on any
       host is performing the same act. */
    const supplied = callerSuppliedHopFacts(body);
    if (supplied.length)
      return answer(400, { ok: false, reason: "DRIVE_HOP_FACT_SUPPLIED", ...driveRow("DRIVE_HOP_FACT_SUPPLIED"), op, supplied,
        detail: `this request carried ${supplied.map((k) => `\`${k}\``).join(", ")}. The export `
              + `address, the export format and the producer are DERIVED by this instance from the `
              + `file id and the kind in the address, at the moment it performs the fetch, and are `
              + `never read from a request. A provenance hop a caller can hand us is a provenance `
              + `hop a caller can invent (D-112), and the whole value of a disclosed chain is that `
              + `the disclosure is ours. Send the Drive link alone.` });
    const drive = readDriveAddress(body.locator);
    if (drive) {
      /* NAMED, NEVER SILENTLY SKIPPED: a silent fall-through would file the application shell as the document. */
      if (drive.shape === "folder")
        return answer(422, { ok: false, reason: "DRIVE_FOLDER_NOT_A_DOCUMENT", ...driveRow("DRIVE_FOLDER_NOT_A_DOCUMENT"), op,
          drive: { host: drive.host, shape: drive.shape, harvestable: false }, locator: drive.address, detail: drive.why });
      if (drive.shape === "file")
        return answer(422, { ok: false, reason: "DRIVE_KIND_UNDETERMINED", ...driveRow("DRIVE_KIND_UNDETERMINED"), op,
          drive: { host: drive.host, shape: drive.shape, harvestable: false, ...(drive.fileId ? { file_id: drive.fileId } : {}) },
          locator: drive.address, detail: drive.why });
      if (drive.shape === "unknown")
        return answer(422, { ok: false, reason: "DRIVE_SHAPE_UNRECOGNISED", ...driveRow("DRIVE_SHAPE_UNRECOGNISED"), op,
          drive: { host: drive.host, shape: drive.shape, harvestable: false }, locator: drive.address, detail: drive.why });
      /* `published` is recognised IN ORDER TO BE LEFT ALONE: publish-to-web already serves an honest document. */
      if (drive.harvestable) { driveCapture = drive; body.locator = drive.exportAddress; }
    }
  }
  /* END DEC-49 REGION is-drive-capture */

  /* R12: A CONTINUATION RESUMES THE SESSION'S OWN PRIMARY and never fetches it again. A session that cannot be read
     is named and the capture proceeds as an ordinary one. */
  let session = null, sessionSkip = null;
  if (body.continue && !body.render) {
    const ld = cap.loadCaptureSession({ session: String(body.continue) });
    if (ld && ld.found) session = ld;
    else sessionSkip = { reason: "NO_SUCH_SESSION", detail: ld && ld.note };
  }

  let locator = session ? session.locator : body.locator;
  if (!(archiveAsked && !session) && (typeof locator !== "string" || !isPublicHttpsLocator(locator)))
    return answer(400, { ok: false, reason: "BAD_LOCATOR",
      detail: "a locator must be https on a public host: no bare IP address, no localhost, no credentials in the address" });
  if (session) return continueCapture(cap, { body, session, cls, storeName, ev });

  /* R15, D-97: authority is THREE-VALUED and undetermined is a task, not a blocker. */
  const authorityAsserted = typeof body.authority === "string" && body.authority.trim() ? body.authority.trim() : null;
  const retrieved = stampSecond();
  const pv = profileView(cap.core);

  /* R5, D-64 — THE RENDER ARM, ADMISSION. Every way a render cannot happen is decided HERE, before the shell is
     fetched, so the shell can never be filed as the content by falling through. `render: false` is the plain
     capture, as an absent key is. */
  const renderAsked = Object.prototype.hasOwnProperty.call(body, "render") && body.render !== false;
  let renderer = null, renderReserved = 0, renderSlot = null;
  /* DEC-49 REGION is-render-admit */
  if (renderAsked) {
    if (body.render !== true)
      return answer(400, { ok: false, reason: "RENDER_FLAG_MALFORMED", ...renderRow("RENDER_FLAG_MALFORMED"),
        op, detail: `render=${JSON.stringify(body.render).slice(0, 40)} is not a value this op reads. `
                  + `Send render: true for the page as a visitor saw it, or false (or nothing) for the served bytes.` });
    const conflict = body.via === "archive.org" ? "via: archive.org (an archived replay)"
                   : driveCapture ? "a Google Drive export (a document, not a page)"
                   : body.continue ? "continue: <session> (a capture already filed)" : null;
    if (conflict)
      return answer(400, { ok: false, reason: "RENDER_ARM_CONFLICT", ...renderRow("RENDER_ARM_CONFLICT"),
        op, conflict, detail: `render: true cannot be combined with ${conflict}.` });
    renderer = rendererFor(cap.env);
    if (typeof renderer.render !== "function")
      return answer(501, { ok: false, reason: "RENDER_NO_RENDERER", ...renderRow("RENDER_NO_RENDERER"),
        op, renderer: renderer.kind,
        detail: renderer.kind === "browser-binding-without-driver"
          ? "BROWSER is bound to something this plane cannot speak to: it is not a Fetcher, so there is no "
            + "endpoint to open a devtools session on. Nothing was fetched."
          : "no renderer is bound to this instance (no RENDERER service binding and no BROWSER binding). "
            + "Nothing was fetched." });
    /* THROUGH THE HOST GOVERNOR: the render is a second load of the page. */
    let rHost = null;
    try { rHost = new URL(locator).host; } catch { rHost = null; }
    if (rHost && cap.governor) {
      let g = null;
      try { g = await cap.governor.governorAdmit({ host: rHost }); } catch { g = null; }
      if (g && g.admitted === false)
        return answer(429, { ok: false, reason: "RENDER_HOST_COOLING_OFF", ...renderRow("RENDER_HOST_COOLING_OFF"),
          op, host: rHost, retry_in_ms: g.retry_in_ms || 0,
          detail: `the per-host governor is holding requests to ${rHost} (${g.reason || "governed"}).` });
    }
    /* D-492: the admission RESERVES this render's maximum cost, read ONCE so the release names the same figure. */
    renderReserved = renderReserveMs(RENDER_DEFAULTS);
    let adm = null;
    try { adm = cap.renderAdmit({ allowanceMs: renderAllowanceMs(cap.env), reserveMs: renderReserved,
                                  cap: renderConcurrencyCap(cap.env), at: retrieved }); } catch { adm = null; }
    /* D-520: OVER THE CONCURRENCY CAP THE RENDER WAITS; nothing was reserved or counted. */
    if (adm && adm.state === "waiting")
      return answer(429, { ok: false, reason: "RENDER_AT_CAPACITY", ...renderRow("RENDER_AT_CAPACITY"),
        op, render: { state: "waiting", content: "undetermined", running: adm.running, cap: adm.cap },
        detail: `${adm.running} renders are running on this instance, which runs at most ${adm.cap} at once; `
              + `this render is waiting and nothing was fetched.` });
    if (adm && adm.state === "admitted") renderSlot = adm.slot || null;
    if (!adm || adm.state !== "admitted")
      return answer(429, { ok: false, reason: "RENDER_DEFERRED", ...renderRow("RENDER_DEFERRED"),
        op, render: { state: "deferred", content: "undetermined", allowance: adm || null },
        detail: adm ? `today's render allowance (${adm.allowance_ms} ms, day ${adm.day}) is committed `
                    + `(${adm.spent_ms} ms spent, ${adm.reserved_ms} ms reserved by renders in flight), and this `
                    + `render reserves ${adm.reserve_ms} ms; it is recorded as deferred (${adm.deferred} today).`
                    : "the render allowance could not be read, so the render is deferred rather than run unmetered." });
  }
  /* END DEC-49 REGION is-render-admit */

  /* R3, R32: the memento, found through the archive's TimeGate or TimeMap; its raw bytes are answered unread, so the
     bytes this call files are the bytes the choice is made over (`chooseMemento`, below). */
  let archiveMemento = null;
  if (archiveAsked) {
    /* N510: the body's first bytes are read ahead, unconsumed; a memento with none is refused by selectCapture's own
       words over its row and the lookup goes on to the next candidate, so nothing of it reaches the store. */
    const m = await mementoLookup(cap, archiveAsked, { fetchPurpose: "acquire", asked: archiveAt, take: async ({ res, answer }) => {
      const p = await peekBody(res);
      if (p.failed) return { fail: archiveBroke(p.failed) };
      /* its row's digest is the empty-body digest, which selectCapture refuses by R29's own reason */
      return p.empty ? { row: mementoRow(answer, { sha256: EMPTY_SHA256, bytes: 0 }) } : { res: p.res };
    } });
    if (!m.ok) return answer(m.status, m.payload);
    archiveMemento = m; locator = m.locator; archiveAddress = m.answer.original;
  }

  /* capture R8, D-104 / D-96: every way this fetch can end is recorded against the DOCUMENT address (the CDX original, the
     Drive link, else the locator), and a governed refusal is never a failure of the source. */
  const via = body.via === "archive.org" ? "archive.org" : "direct";
  const documentAddress = via === "archive.org" && archiveAddress ? archiveAddress : (driveCapture ? driveCapture.address : locator);
  const addressIsDerived = (via === "archive.org" && !!archiveAddress) || !!driveCapture;
  const addrNorm = normalizeAddress(documentAddress);
  const noteOutcome = async (outcome, status) => {
    try { await cap.recordSourceOutcome({ addressNorm: addrNorm, outcome, status: status ?? null, at: retrieved }); }
    catch { /* an unrecorded outcome must not turn a fetch into an error */ }
  };
  /* R22: conditional against the validators the held capture's own fetch was served with at this address. A render
     fetches its shell unconditionally: the capture it files is the rendered document, not the shell. */
  const validators = crHeldSha && !renderAsked ? cap.validatorsOf({ addressNorm: addrNorm, captureSha: crHeldSha }) : null;
  const conditional = validators ? { ...(validators.etag ? { "if-none-match": validators.etag } : {}),
                                     ...(validators.lastModified ? { "if-modified-since": validators.lastModified } : {}) } : null;
  let res = archiveMemento ? archiveMemento.res : null, resolvedUrl = null;
  if (!res) try {
    /* R31: a sweep's redirects are followed BY HAND, one governed fetch per hop, each target judged against the scope
       before anything is fetched at it; the credential (R23) still goes to its own host only. */
    let url = locator;
    const home = hostOf(locator);
    for (let hop = 0; ; hop++) {
      const g = await governedFetch(cap, url, crPurpose || "acquire", crAgent, { headers: conditional,
        credential: sweepScope && hostOf(url) !== home ? null : crCredential, manual: !!sweepScope });
      if (g.refusedByGovernor) {
        await noteOutcome("governed", null);
        return answer(429, { ok: false, reason: "HOST_COOLING_OFF",
          detail: `the per-host governor is holding requests to this host (${g.reason}); retry in about ${Math.ceil((g.retry_in_ms || 0) / 1000)}s`,
          retry_in_ms: g.retry_in_ms || 0, locator });
      }
      res = g.res;
      if (!sweepScope) break;
      const loc = res.status >= 300 && res.status < 400 && res.status !== 304 ? res.headers.get("location") : null;
      if (!loc || hop >= REDIRECT_MAX) break;
      let next = null;
      try { next = new URL(loc, url).href; } catch { next = null; }
      /* DEC-49 REGION is-sweep-redirect */
      if (!next || !inSweepScope(next, sweepScope)) {
        cancelBody(res);
        const row = SWEEP_SCOPE_CHECKS.SWEEP_REDIRECT_OUT_OF_SCOPE;
        return answer(422, { ok: false, reason: "SWEEP_REDIRECT_OUT_OF_SCOPE", code: "SWEEP_REDIRECT_OUT_OF_SCOPE", check: row.check,
          translation: row.translation, op, target: next || loc, locator, redirected_from: url, status: res.status,
          matched_sweep: crOrigin.matched_sweep,
          detail: `${url} redirected (${res.status}) to ${next || loc}, which is outside the sweep's scope; the redirect `
                + "was not followed, nothing at its target was fetched, and nothing was filed" });
      }
      /* END DEC-49 REGION is-sweep-redirect */
      /* In scope but not a public locator: R28's fence; the redirect itself is the answer (SOURCE_REFUSED). */
      if (!isPublicHttpsLocator(next)) break;
      cancelBody(res);
      url = next;
      resolvedUrl = next;
    }
  } catch (e) {
    await noteOutcome("fetch_failed", null);
    /* R23: a thrown fetch's message can carry what rode the request, so none is carried when a credential did. */
    return answer(502, { ok: false, reason: "FETCH_FAILED", locator,
      detail: crCredential ? "the fetch did not complete; its error is not carried because a supplied credential rode it"
                           : String(e && e.message || e) });
  }
  /* The address the bytes came from: the last hop this call followed, else the runtime's post-redirect URL. */
  resolvedUrl = resolvedUrl || res.url || null;
  /* R22: the source says the held capture is still what it serves. It ASSERTS the bytes and does not serve them, so
     nothing is filed and no receipt is written; the attempt is a success of the source (capture R8). */
  if (conditional && res.status === 304) {
    await noteOutcome("success", 304);
    try { await res.body?.cancel?.(); } catch { /* nothing to read */ }
    return answer(200, { ok: true, existed: true, unchanged: true, capture: { sha256: crHeldSha },
      basis: `the source answered 304 Not Modified to a request conditional on the validators its fetch of the held `
           + `capture ${crHeldSha.slice(0, 12)} was served with (${Object.keys(conditional).join(", ")}), so no new capture `
           + "was made and no receipt written: the source asserted these bytes, it did not serve them",
      store: storeName, tokenClass: cls, note: ACQUIRE_GRADE_NOTE });
  }
  /* DEC-49 REGION is-drive-export — there is NO FALLBACK: a 403, a 404 or an HTML answer ends the capture with the
     failure named; nothing reaches back for the application page. */
  const driveFacts = driveCapture ? { host: driveCapture.host, shape: driveCapture.shape, kind: driveCapture.kind,
                                      file_id: driveCapture.fileId, export_format: driveCapture.format } : null;
  if (driveCapture && !res.ok) {
    await noteOutcome("source_refused", res.status);
    return answer(502, { ok: false, reason: "DRIVE_EXPORT_UNREACHABLE", ...driveRow("DRIVE_EXPORT_UNREACHABLE"), op,
      status: res.status, locator: driveCapture.address, export_address: driveCapture.exportAddress, drive: driveFacts,
      detail: `Google answered ${res.status} at the OpenDocument export address `
            + `${driveCapture.exportAddress}, which this instance composed from the ${driveCapture.kind} `
            + `id in ${driveCapture.address}. Nothing was captured, and the application page at the `
            + `document's own address was NOT captured in its place — a fallback to the shell would `
            + `record a success holding no document. A 404 usually means the id is wrong; a 403 `
            + `usually means the file is not shared with anyone who has the link.` });
  }
  if (driveCapture) {
    const ect = (res.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
    if (ect === "text/html" || ect === "application/xhtml+xml") {
      await noteOutcome("source_refused", res.status);
      try { await res.body?.cancel?.(); } catch { /* the source may already be gone */ }
      return answer(502, { ok: false, reason: "DRIVE_EXPORT_IS_THE_SHELL", ...driveRow("DRIVE_EXPORT_IS_THE_SHELL"), op,
        status: res.status, locator: driveCapture.address, export_address: driveCapture.exportAddress,
        declared_content_type: ect, refused_on: "the declared content type", drive: driveFacts,
        detail: `the OpenDocument export address answered with \`${ect}\`, which is the Google Drive `
              + `APPLICATION — a client-rendered shell whose bytes carry no document (framework Part I `
              + `§6's UNWATCHABLE case, D-64/D-55). It is refused by name and it is not parsed: the `
              + `shell is never filed as the document. Google serves it here when the file is not `
              + `shared with anyone who has the link.` });
    }
  }
  /* END DEC-49 REGION is-drive-export */
  if (!res.ok) {
    await noteOutcome("source_refused", res.status);
    return answer(502, { ok: false, reason: "SOURCE_REFUSED", status: res.status, locator });
  }
  /* R32: on the archive arm the success is the memento's, recorded once it is chosen (below), never for one refused. */
  if (!archiveMemento) await noteOutcome("success", res.status);

  /* R10. Streamed in parts of 8 MiB, so peak residency is one part. The incremental hasher is RECORD-GRAMMAR'S, the
     one C-18.6 verifies parts with, so a disagreement between two implementations cannot look like tampering. */
  const PART = 8 * 1024 * 1024;
  const MAX = CAPTURE_MAX;
  const whole = createSha256();
  const parts = [];
  /* D-469: whether the store held each part BEFORE this call wrote it (asked after the put, it finds this call's
     own write). */
  const partHeldBefore = [];
  let total = 0, held = [], heldBytes = 0, oversize = false;
  /* R10: a part is exactly 8 MiB (the last one the remainder), whatever sizes the stream's chunks arrive in. */
  const part = async (buf) => {
    const psha = hex(await crypto.subtle.digest("SHA-256", buf));
    const heldBefore = !!(await ev.head(psha));
    if (!heldBefore) await ev.put(psha, buf);
    parts.push({ sha256: psha, bytes: buf.length });
    partHeldBefore.push(heldBefore);
  };
  const flush = async (all = true) => {
    while (heldBytes >= PART || (all && heldBytes > 0)) {
      const n = Math.min(PART, heldBytes);
      const buf = new Uint8Array(n);
      let at = 0;
      while (at < n) {
        const c = held[0], take = Math.min(c.length, n - at);
        buf.set(c.subarray(0, take), at); at += take;
        if (take === c.length) held.shift(); else held[0] = c.subarray(take);
      }
      heldBytes -= n;
      await part(buf);
    }
  };
  /* CAP-8: the first KiB of a DRIVE export, kept so the shell can be recognised from the BYTES. */
  const driveHead = driveCapture ? new Uint8Array(1024) : null;
  let driveHeadBytes = 0;
  const reader = res.body && res.body.getReader ? res.body.getReader() : null;
  if (!reader) return answer(502, { ok: false, reason: "NO_BODY", locator });
  for (;;) {
    /* R10: a body that breaks off mid-stream is a fetch that did not complete, answered by name, never a throw; the
       parts already stored are content-addressed and named by no document, as TOO_LARGE's are. */
    let chunk;
    try { chunk = await reader.read(); }
    catch (e) {
      if (archiveMemento) return answer(502, archiveBroke(String(e && e.message || e)).payload);
      await noteOutcome("fetch_failed", null);
      return answer(502, { ok: false, reason: "FETCH_FAILED", locator,
        detail: crCredential ? "the body broke off while it was read; its error is not carried because a supplied credential rode it"
                             : `the body broke off while it was read (${String(e && e.message || e)})` });
    }
    const { done, value } = chunk;
    if (done) break;
    total += value.length;
    if (total > MAX) { oversize = true; break; }
    whole.update(value);
    if (driveHead && driveHeadBytes < driveHead.length) {
      const take = Math.min(value.length, driveHead.length - driveHeadBytes);
      driveHead.set(value.subarray(0, take), driveHeadBytes);
      driveHeadBytes += take;
    }
    held.push(value); heldBytes += value.length;
    if (heldBytes >= PART) await flush(false);
  }
  /* DEC-49 REGION is-drive-bytes — C-48.7: Google said it was a document and it was a web page. Detection is
     bytes-first and certain; a non-HTML export of another flavour is FILED with the disagreement on the hop. */
  if (driveCapture && driveHeadBytes > 0) {
    const sniff = detectFormat(driveHead.subarray(0, driveHeadBytes), null);
    const declared = (res.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
    if (sniff.format === "html") {
      try { await reader.cancel(); } catch { /* the source may already be gone */ }
      await noteOutcome("source_refused", res.status);
      return answer(502, { ok: false, reason: "DRIVE_EXPORT_BYTES_ARE_THE_SHELL", ...driveRow("DRIVE_EXPORT_BYTES_ARE_THE_SHELL"), op,
        status: res.status, locator: driveCapture.address, export_address: driveCapture.exportAddress,
        declared_content_type: declared || null, refused_on: "the bytes", detected: sniff, drive: driveFacts,
        detail: `the OpenDocument export address served bytes that are HTML — ${sniff.signals.join("; ")} `
              + `— while declaring \`${declared || "(no content type)"}\`. That is the Google Drive `
              + `APPLICATION, not the document, and the declared type did not say so. Detection here is `
              + `bytes-first and certain, which is the whole reason this arm exists beside the one that `
              + `reads the header. Nothing was filed, and the shell is never filed as the document.` });
    }
  }
  /* END DEC-49 REGION is-drive-bytes */
  if (oversize) {
    try { await reader.cancel(); } catch { /* the source may already be gone */ }
    return answer(413, { ok: false, reason: "TOO_LARGE", bytes: total, maxBytes: MAX,
                         detail: "the document exceeds what this surface will capture even in parts" });
  }
  await flush();
  let sha = whole.hex();
  /* R32: the memento is chosen over the bytes just received (an empty one was passed over before any byte was stored, N510). */
  if (archiveMemento) {
    const c = chooseMemento(archiveMemento, sha, total, archiveAsked, archiveAt);
    if (!c.ok) return answer(c.status, c.payload);
    archiveHopRecorded = c.hop;
    await noteOutcome("success", res.status);
  }
  if (total === 0) return answer(502, { ok: false, reason: "EMPTY", locator });

  /* R11. One part: whether that object was held before this call wrote it. Several: the whole is never stored under
     its own hash, so the REGISTER is asked (provenance R5) and a miss is stated, never scored false (D-476). */
  let existed = false, existedUndetermined = null;
  const multipart = parts.length > 1;
  if (!multipart) {
    if (parts[0].sha256 !== sha)
      return answer(500, { ok: false, reason: "HASH_DISAGREEMENT", detail: "the incremental hash and the block hash of the same bytes differ" });
    existed = partHeldBefore[0];
  } else {
    let reg = null;
    try { reg = cap.provenance && typeof cap.provenance.registerHolds === "function" ? await cap.provenance.registerHolds({ sha }) : null; }
    catch { reg = null; }
    const heldParts = partHeldBefore.filter(Boolean).length;
    if (reg && reg.registered === true) existed = true;
    else {
      existed = null;
      existedUndetermined = reg
        ? `this document was captured in ${parts.length} parts, so the store holds no object under its `
          + `whole hash for the question a single-part capture asks, and the record's register - which `
          + `does answer by the whole hash - holds no row for these bytes under a record that still `
          + `exists. That is NOT a finding that the bytes are new: a capture acquired earlier and never `
          + `promoted leaves its parts in the store and no register row, and part boundaries follow the `
          + `stream's chunking, so this fetch's parts need not be the parts an earlier one made. `
          + `Observed, and not the answer: ${heldParts} of this fetch's ${parts.length} parts were `
          + `already held before it wrote them.`
        : `this document was captured in ${parts.length} parts, so the store holds no object under its `
          + `whole hash for the question a single-part capture asks, and the record's register could not `
          + `be consulted. Nothing here is a statement about the record, and in particular it is not a `
          + `claim that these bytes are new. Observed, and not the answer: ${heldParts} of this fetch's `
          + `${parts.length} parts were already held before it wrote them.`;
    }
  }

  let ct = (res.headers.get("content-type") || "").split(";")[0].trim();
  /* R14. Every header the source sent, in order, duplicates kept: a header nobody thought to name is exactly the
     one a later question needs. `resolvedUrl` is the post-redirect URL; the runtime does not expose the hop chain or the
     peer address, and the record says so rather than leaving a field a reader would misread. */
  const responseHeaders = [];
  for (const [k, v] of res.headers) responseHeaders.push([k, v]);
  const transport = { requested: locator, resolved: resolvedUrl || locator, redirected: !!(resolvedUrl && resolvedUrl !== locator),
    status: res.status, http_headers: responseHeaders, peer_address: null,
    peer_address_unavailable: "the Workers runtime does not expose the peer address of an outbound fetch" };
  const name = (body.file || locator.split("/").pop() || "capture").replace(/[^A-Za-z0-9._-]/g, "-").slice(0, 100) || "capture";

  /* R6, D-64 — THE RENDER ARM, THE PAIR. From here on `sha`, `total` and `ct` name the RENDERED document, the
     bundle's primary; the shell survives as `shell` and `render.of`. */
  let renderRecorded = null, shellRecorded = null, renderedAuth = null;
  if (renderAsked) {
    const pageUrl = resolvedUrl || locator;
    let answerR = null, rbytes = null, rb = null;
    /* DEC-49 REGION is-render-result */
    if (multipart || detectFormat(null, ct || null).format !== "html") {
      /* D-492: NO RENDERER WAS ASKED, so the reservation is released WITHOUT CHARGE. */
      try { cap.renderSpend({ ms: 0, releaseMs: renderReserved, slot: renderSlot, at: retrieved }); }
      catch { /* an unreleased reservation under-uses the allowance; it never fails the refusal */ }
      return answer(422, { ok: false, reason: "RENDER_NOT_A_PAGE", ...renderRow("RENDER_NOT_A_PAGE"),
        op, content_type: ct || null, bytes: total, multipart,
        detail: `the served bytes are ${multipart ? "too large to be a single page" : `\`${ct || "(no content type)"}\``}, `
              + `not an HTML page; nothing was filed.` });
    }
    /* R7: the locale R17's view names, the default only as capture-sources' own fallback. */
    try { answerR = await renderer.render({ url: pageUrl, ...RENDER_DEFAULTS, locale: renderLocale(pv.view) }); }
    catch (e) { answerR = { ok: false, error: String(e && e.message || e) }; }
    try { cap.renderSpend({ ms: answerR && answerR.elapsed_ms, releaseMs: renderReserved, slot: renderSlot, at: retrieved }); }
    catch { /* an unrecorded spend under-counts the allowance; it never fails the render */ }
    const asked = { ...RENDER_DEFAULTS, locale: renderLocale(pv.view) };
    rb = renderBlock(answerR, { pageUrl, shellSha: sha, asked, at: retrieved });
    if (rb.ok) rbytes = new TextEncoder().encode(answerR.html);
    if (!rb.ok || rbytes.length > MAX)
      return answer(502, { ok: false, reason: "RENDER_FAILED", ...renderRow("RENDER_FAILED"), op, shell_sha256: sha, filed: false,
        detail: rb.ok ? `the rendered document is ${rbytes.length} bytes, over this surface's ${MAX}.` : rb.problem });
    /* END DEC-49 REGION is-render-result */
    /* D-529: every subresource the render LOADED is hashed BY THE PLANE over bytes it KEEPS. */
    const renderDigests = await keepRenderBodies(answerR, { sha256: sha256Hex,
      put: async (s, b) => { if (!(await ev.head(s))) await ev.put(s, b); } });
    rb = renderBlock(answerR, { pageUrl, shellSha: sha, asked, at: retrieved, digests: renderDigests });
    const rsha = await sha256Hex(rbytes);
    const renderedExisted = !!(await ev.head(rsha));
    if (!renderedExisted) await ev.put(rsha, rbytes);
    shellRecorded = { file: `snapshots/${name}.shell.html`, sha256: sha, bytes: total,
                      method: "bio-plane acquire, https fetch, hashed at receipt", ...(ct ? { content_type: ct } : {}), transport };
    renderRecorded = rb.render;
    renderedAuth = renderedAuthority({ asserted: authorityAsserted, render: renderRecorded, at: retrieved });
    /* The render's own navigation, reported to the governor like any load. */
    if (typeof renderRecorded.status === "number" && cap.governor) {
      try { await cap.governor.governorReport({ host: new URL(pageUrl).host, status: renderRecorded.status, retry_after_ms: null }); }
      catch { /* an unrecorded outcome is not a failed render */ }
    }
    sha = rsha; total = rbytes.length; ct = "text/html"; existed = renderedExisted;
  }

  /* R13, D-58: the acquisition receipt, UNCONDITIONALLY, for every filed capture: under the DOCUMENT address (the
     CDX original, the Drive link as given, or for a direct fetch the address it resolved to), `via`, and the
     retrieval locator. A failed receipt write does not fail the capture. */
  try {
    await cap.provenance?.recordReceipt?.({ address: addressIsDerived ? documentAddress : (resolvedUrl || locator),
      addressNorm: addressIsDerived ? addrNorm : normalizeAddress(resolvedUrl || locator), captureSha: sha, retrieved,
      via, retrievalLocator: locator });
  } catch { /* an unfiled receipt is not a failed capture */ }
  /* R16, capture R69: the member this capture's document names as its actor is recorded as one who captured these bytes. */
  const actor = member && typeof sessMember === "string" && sessMember ? sessMember : null;
  if (actor) {
    try { cap.recordCaptureActor({ captureSha: sha, actor, at: retrieved }); }
    catch { /* an unrecorded actor costs that member their account (capture R69), never this capture */ }
  }
  /* R22: what the source said about these bytes, kept for a later conditional fetch of the same document. */
  if (via === "direct" && !renderRecorded) {
    try { cap.recordValidators({ addressNorm: addrNorm, captureSha: sha, etag: res.headers.get("etag"),
                                 lastModified: res.headers.get("last-modified"), at: retrieved }); }
    catch { /* an unrecorded validator costs a later request its condition, never this capture */ }
  }
  /* attestation R4 (K59): an archive-sourced capture's receipt is signed with the instance's own key, by the
     attestation instance the composition hands in (`cap.attestation`). A signing that cannot be made (no key bound,
     or no instance) is stated on the answer, never a failed capture. */
  let receiptSignature = null;
  if (via === "archive.org") {
    try { receiptSignature = await cap.attestation?.signReceipt?.({ captureSha: sha, retrievalLocator: locator, retrieved }) ?? null; }
    catch (e) { receiptSignature = { ok: false, reason: "RECEIPT_NOT_SIGNED", detail: String(e && e.message || e).slice(0, 200) }; }
  }

  /* R15, D-98: an undetermined capture enqueues ONE event; that is the entire extent of what the capture path may do
     about it. The subject is the DOCUMENT for a Drive export, else the locator. */
  if (renderedAuth ? renderedAuth.authority_state === "undetermined" : !authorityAsserted) {
    try { await cap.taskEnqueue({ kind: "authority-undetermined", captureSha: sha,
                                  subject: driveCapture ? documentAddress : locator, locator, at: retrieved }); }
    catch { /* an unqueued task is not a failed capture; C-18.9 still refuses it at or past verified */ }
  }

  /* R19: supporting files, on request. */
  let subs = null, subsSkipped = sessionSkip, sessionId = null;
  if (body.subresources === true && !subsSkipped) {
    const w = await walkSubresources(cap, { ev, sha, total, multipart, ct, name, locator, base: resolvedUrl || locator,
                                             retrieved, resume: null, sessionId: null });
    subs = w.subs; subsSkipped = w.skipped; sessionId = w.sessionId;
  }

  /* R17, CONSTRUCTS Step 1 (FW-3): THE PROFILE, docprofile read and never copied, over the bytes the record holds. */
  const profHeaders = {};
  for (const [hk, hv] of res.headers) profHeaders[hk.toLowerCase()] = hv;
  const profile = await profileOf({ ev, sha, ct, total, multipart, headers: profHeaders, locator: documentAddress, view: pv,
                                    retrieved });
  /* R4, CAP-8: Google's hop, built from what this call established. Its confirmation is the FORMAT registry's own
     detection over the stored export's BYTES, whole (an OpenDocument package is recognised by its central directory,
     which lies past the first KiB `profile.format` reads for any export of real size): a detection that fell back to
     Google's declared type is Google's label, never a confirmation, so the hop then says the bytes were not sniffed. */
  if (driveCapture) {
    let detected = null;
    if (!multipart && total > 0 && total <= ODF_DIGEST_MAX) {
      try {
        const o = await ev.get(sha);
        if (o) { const d = detectFormat(new Uint8Array(await o.arrayBuffer()), null); if (d && d.format !== "undetermined") detected = d; }
      } catch { detected = null; }
    }
    driveHopRecorded = driveHop(driveCapture, { retrieved, resolved: resolvedUrl, detected });
  }

  /* R20: co-attestation at every capture (K60). */
  const attestations = await coAttest(cap, { sha, locator: documentAddress, via, ev });

  const document = {
    file: `snapshots/${name}`, locator, retrieved,
    profile,
    /* R15, D-97: authority mirrors verdict / basis / at: the STATE always, the basis dated in both cases. */
    ...(renderedAuth ? renderedAuth : {
      ...(authorityAsserted ? { authority: authorityAsserted } : {}),
      authority_state: authorityAsserted ? "determined" : "undetermined",
      authority_basis: authorityAsserted
        ? `asserted by the capturing ${member ? "member" : "caller"} at intake, ${retrieved}`
        : `no assertion was supplied and no mechanical determination is implemented; recorded ${retrieved} for resolution through the task list`,
    }),
    /* R16: ordered hops from us back to the origin; a direct fetch is ONE hop, which grades it above an archive-
       sourced capture (grade tracks directness, never technique). A render whose wait timed out is NEVER presented
       as the whole page (D-499), the qualification derived by `completenessReading`, never retyped. `who` names
       Civicsmith (DEC-124), spelled by R33's `firstHopWho`; a document filed before T31 keeps the `who` it was written with: this act rewrites none. */
    provenance_chain: [{
      who: firstHopWho((cap.env || {}).INSTANCE_NAME, (cap.env || {}).VERSION),
      asserts: renderRecorded
        ? `these bytes are the document a ${renderRecorded.engine || "renderer (engine not reported)"} render produced from ${locator} at ${retrieved}; the shell it was rendered from was served for ${locator} and is held beside it (render.of)${completenessReading(renderRecorded) ? `; ${completenessReading(renderRecorded)}, so they are not asserted to be the whole page` : ""}`
        : `these bytes were served for ${locator} at ${retrieved}`,
      evidence: renderRecorded
        ? "first-party https fetch of the shell, hashed at receipt; the rendered document hashed at receipt from the renderer; render.* records the environment"
        : "first-party https fetch, hashed at receipt, transport record on this document",
      bound: false, via,
    }, ...(archiveHopRecorded ? [archiveHopRecorded] : []), ...(driveHopRecorded ? [driveHopRecorded] : [])],
    capture: {
      method: renderRecorded ? RENDERED_METHOD : multipart
        ? `bio-plane acquire, https fetch, streamed in ${parts.length} parts, hashed at receipt`
        : "bio-plane acquire, https fetch, hashed at receipt",
      /* R18 (D-698): provenance's rule, each letter read from its one definition, never typed here. */
      grade: via === "archive.org" ? ARCHIVE_CAPTURE_GRADE : EARNED_CAPTURE_CEILING,
      ...(via === "archive.org" ? { authority: "Internet Archive" } : {}),
      actor_class: member ? "member" : (cls === "probe" ? "session" : "daemon"),
      /* R16 (N364): which member captured it, the member stamp of a member session, else null (capture R69 reads it). */
      actor,
      sha256: sha, encoding: "binary", bytes: total,
      ...(ct ? { content_type: ct } : {}),
      ...(renderRecorded ? {} : { transport }),
      /* R23: that a supplied credential rode the fetch, whose and at which scope, never its secret. */
      ...(crCredential ? { credentialed: { credential: crCredential.credential ?? null, kind: crCredential.kind,
                                           supplied_by: crCredential.supplied_by ?? null, scope: crCredential.scope ?? null,
                                           project: crCredential.project ?? null },
                           reproducible_by_public: false } : {}),
    },
    ...(renderRecorded ? {
      pair: { primary: "rendered", rendered: { file: `snapshots/${name}`, sha256: sha },
              shell: { file: shellRecorded.file, sha256: shellRecorded.sha256 } },
      render: renderRecorded, shell: shellRecorded,
    } : {}),
    ...(multipart ? { parts: parts.map((p, i) => ({ file: `snapshots/${name}.part${String(i).padStart(3, "0")}`, sha256: p.sha256, bytes: p.bytes })) } : {}),
    /* Derived artifacts are named on the SAME register document, never as documents of their own (C-18.3). */
    ...(subs ? { renditions: subs.renditions } : {}),
    /* R21: on the capture-request arm the origin is the drain's row's, never the body's. */
    /* R31 (K1126): only link-sweep and capture-requests' sweep arm set a sweep origin; a body's `matchedSweep` is ignored. */
    origin: captureRequest ? (crOrigin || { kind: "named_request" }) : { kind: "named_request" },
    attestation_attempts: attestations,
  };
  return answer(200, {
    ok: true, existed,
    ...(existedUndetermined ? { existed_undetermined: existedUndetermined } : {}),
    /* R22: the bytes are the capture the record already holds. */
    ...(crHeldSha && sha === crHeldSha ? { held: true } : {}),
    document,
    ...(multipart ? { parts: parts.length } : {}),
    ...snapshotOf(subs, sessionId, name, shellRecorded),
    ...(subsSkipped ? { subresources_skipped: subsSkipped } : {}),
    ...(receiptSignature ? { receipt_signature: receiptSignature } : {}),
    store: storeName, tokenClass: cls, note: ACQUIRE_GRADE_NOTE,
  });
}

/** R17: the profile of a capture the store holds under `sha`: docprofile's `identify` over the headers, the document
 *  address, the content type and (single-part, textual, within bound) the stored bytes read back; `doctypeFor` under
 *  `view` (`profileView`); `profileRecord`; the normalisation rules and boundary; `format` from the bytes (the first
 *  KiB read back when not already read), else the declared type with the absence stated; and `digests`. Every
 *  unreadable byte is stated, never a failed capture. The acquisition act and the knock's pull (capture R65) call it. */
export async function profileOf({ ev, sha, ct = null, total = 0, multipart = false, headers = {}, locator = null, view, retrieved }) {
  const pv = view || { view: undefined, ids: null };
  let profileText = "", profileBytes = null;
  if (profilesAsText(ct, total, multipart)) {
    try {
      const pobj = await ev.get(sha);
      if (pobj) { profileBytes = new Uint8Array(await pobj.arrayBuffer()); profileText = new TextDecoder("utf-8", { fatal: false }).decode(profileBytes); }
    } catch { /* an unreadable primary is not a failed capture */ }
  }
  /* COFF-1, R17 (K659): magic bytes first, from the stored bytes read back WHOLE up to ODF_DIGEST_MAX when not already
     read, so an office package (whose central directory lies at its end) is judged from its bytes, and the same bytes
     serve its container digest below; the declared type only for a multipart, oversized or unreadable primary, with
     the absence stated. */
  let formatBytes = profileBytes, readWhole = null;
  if (!formatBytes && !multipart && total > 0 && total <= ODF_DIGEST_MAX) {
    try { const fobj = await ev.get(sha); if (fobj) formatBytes = readWhole = new Uint8Array(await fobj.arrayBuffer()); }
    catch { /* detection falls back to the declared content type */ }
  }
  const profCtx = { headers, locator, content_type: ct || null, text: profileText };
  const stackId = identify(profCtx);
  const docType = doctypeFor({ ...profCtx, handler: stackId.handler, kind: stackId.kind, ...(pv.view ? { view: pv.view } : {}) });
  const profile = {
    ...profileRecord(stackId, { now: retrieved }),
    content_type: docType.type.key, content_type_label: docType.type.label, content_type_version: docType.type.version,
    content_type_confidence: docType.confidence, content_type_signals: docType.signals, contract: docType.type.contract || null,
    normalised: (typeof stackId.handler.rules === "function" ? stackId.handler.rules(profCtx) : []).map((r) => ({ region: r.region, label: r.label })),
    boundary: !!(typeof stackId.handler.boundary === "function" && stackId.handler.boundary(profCtx)),
    source_content_type: ct || null,
    profiled_from_text: !!profileText,
    /* R17 (N3, N10): which jurisdiction view the content type was judged under. */
    jurisdiction_view: pv.ids,
    format: detectFormat(formatBytes, ct || null),
  };
  let containerBytes = null;
  const odfFmt = profile.format && ODF_FORMATS.includes(profile.format.format);
  if (!profileBytes && !multipart && odfFmt && total > 0 && total <= ODF_DIGEST_MAX) containerBytes = readWhole;
  profile.digests = await substanceDigests(profileBytes, stackId, profCtx, sha, multipart, containerBytes);
  return profile;
}

/* The answer's `subresources`, `snapshot` and `files` (R19). */
function snapshotOf(subs, sessionId, name, shellRecorded) {
  if (!subs) return shellRecorded ? { files: { [shellRecorded.file]: shellRecorded.sha256 } } : {};
  return {
    subresources: subs.subresources,
    snapshot: {
      manifest_file: "data/snapshot-manifest.json", manifest_sha256: subs.manifestSha,
      render_file: `snapshots/${name}.render.html`, render_sha256: subs.companionSha,
      discovered: subs.discovered, attempted: subs.attempted, truncated: subs.truncated,
      fetched: subs.manifest.counts.fetched, failed: subs.manifest.counts.failed, refused: subs.manifest.counts.refused,
      scripts_held_unreferenced: subs.manifest.counts.scripts_held_unreferenced,
      complete: subs.manifest.complete, outstanding: subs.manifest.outstanding, platform: subs.manifest.platform,
      reuse: subs.manifest.reuse, part_fetch_spread: subs.manifest.part_fetch_spread, compute: subs.manifest.compute,
      ...(subs.resumeState ? { continuation: {
        session: sessionId, outstanding: subs.manifest.outstanding, ticks: subs.session ? subs.session.ticks : 1,
        how: "call op=acquire again with {continue: \"<session>\"} to pick up the outstanding parts; "
           + "the primary is already complete and is never re-fetched" } } : {}),
      ...(subs.siteRecord ? { site: subs.siteRecord } : {}),
      ...(subs.limitRecord ? { limit_recorded: subs.limitRecord } : {}),
    },
    files: { [`snapshots/${name}.render.html`]: subs.companionSha, "data/snapshot-manifest.json": subs.manifestSha,
             ...(shellRecorded ? { [shellRecorded.file]: shellRecorded.sha256 } : {}) },
  };
}

/** R19: the walk of a page's supporting files, over the primary READ BACK from the store (the parser sees the bytes
 *  the record holds, never a copy in flight beside them). Every bookkeeping write after it is stated or ignored,
 *  never a failed capture. */
async function walkSubresources(cap, { ev, sha, total, multipart, ct, name, locator, base, retrieved, resume, sessionId }) {
  const SUB_PARSE_MAX = 8 * 1024 * 1024;
  if (multipart || total > SUB_PARSE_MAX)
    return { subs: null, skipped: { reason: "TOO_LARGE_TO_PARSE", detail:
      "subresource capture reads the primary back into memory to parse it, so it is bounded to "
      + `${SUB_PARSE_MAX} bytes; this document is ${total}` } };
  if (detectFormat(null, ct || null).format !== "html")
    return { subs: null, skipped: { reason: "NOT_HTML", content_type: ct || null, detail:
      "only an HTML page has subresources; the capture is unaffected and complete" } };
  let obj = null;
  try { obj = await ev.get(sha); } catch { obj = null; }
  if (!obj) return { subs: null, skipped: { reason: "PRIMARY_UNREADABLE", detail: "the primary capture did not read back" } };
  const primaryBytes = new Uint8Array(await obj.arrayBuffer());
  /* capture R23: the platform's ceiling as last OBSERVED, discarded every so often (probeDue) to run to refusal again. */
  let limit = null;
  try { limit = cap.captureLimit("subrequests"); } catch { limit = null; }
  const useCeiling = limit && limit.observed && !limit.probeDue ? limit.observed : null;
  /* What this host has served before: a furniture asset seen SERVED within the freshness window on at least two
     distinct PAGES is reused at zero fetch cost, and every reuse is recorded as one. */
  let baseHost = null;
  try { baseHost = new URL(base).hostname.toLowerCase(); } catch { baseHost = null; }
  let siteKnown = {};
  if (baseHost) { try { siteKnown = cap.siteAssets({ host: baseHost }).assets || {}; } catch { siteKnown = {}; } }
  const env = cap.env || {};
  const subs = await captureSubresources({
    platformCeiling: useCeiling, resume,
    siteLookup: baseHost ? async (norm) => siteKnown[norm] || null : null,
    readBack: async (sh) => { const o = await ev.get(sh); return o ? new TextDecoder("utf-8", { fatal: false }).decode(new Uint8Array(await o.arrayBuffer())) : null; },
    html: new TextDecoder("utf-8", { fatal: false }).decode(primaryBytes),
    base, primarySha: sha, primaryFile: `snapshots/${name}`,
    isPublic: isPublicHttpsLocator, sha256: sha256Hex,
    put: async (s, b) => { if (await ev.head(s)) return { existed: true }; await ev.put(s, b); return { existed: false }; },
    fetchOne: async (u) => {
      /* D-95, the subresource case: a PERSON'S browser bursts a page's assets, so they ride the primary's admission,
         take a small jittered stagger, and REPORT every outcome; a host cooling off stops the rest. */
      let subHost = null;
      try { subHost = new URL(u).host; } catch { /* refused below by the fetch itself */ }
      if (subHost && cap.governor) {
        try { if (await cap.governor.isHeld(subHost, Date.now())) return { ok: false, status: 0, reason: "HOST_COOLING_OFF" }; }
        catch { /* an unreadable governor never blocks */ }
      }
      const stagger = cap.subresourceStaggerMs();
      if (stagger) await new Promise((s) => setTimeout(s, stagger));
      const r = await fetch(u, { redirect: "follow", headers: { "user-agent": userAgent(env, "acquire") } });
      if (subHost && cap.governor) {
        try { await cap.governor.governorReport({ host: subHost, status: r.status, retry_after_ms: retryAfterMs(r.headers.get("retry-after")) }); }
        catch { /* an unrecorded outcome is not a failed fetch */ }
      }
      if (!r.ok) return { ok: false, status: r.status, reason: "SOURCE_REFUSED" };
      return { ok: true, status: r.status, bytes: new Uint8Array(await r.arrayBuffer()), contentType: r.headers.get("content-type") || "" };
    },
  });
  /* Report what the run learned, INCLUDING learning nothing. */
  try { subs.limitRecord = cap.recordCaptureLimit({ runtime: "subrequests", observed: subs.manifest.platform.observed_ceiling }); }
  catch { /* not a capture failure */ }
  /* Park what is left, or clear the session when nothing is: a finished capture leaves no row saying otherwise. */
  let sid = sessionId;
  if (subs.resumeState) {
    sid = sid || `cs_${sha.slice(0, 16)}_${Date.now().toString(36)}`;
    try { subs.session = cap.saveCaptureSession({ session: sid, locator, primarySha: sha, primaryFile: `snapshots/${name}`, base, state: subs.resumeState }); }
    catch { /* the caller starts over; the capture did not fail */ }
  } else if (sid) {
    try { cap.dropCaptureSession({ session: sid }); } catch { /* harmless */ }
  }
  /* capture R55 (K98, K99): the compute measurement is handed to the listeners (instance-setup's); this module writes no
     runtime observation itself, and `snapshot.compute` is unchanged. */
  try {
    await cap.emit("compute", { metric: "capture_work_bytes", value: subs.manifest.compute.work_bytes,
      detail: `${subs.manifest.compute.work_calls} compute calls over ${subs.manifest.compute.work_bytes} bytes; `
            + `${subs.manifest.counts.fetched} fetched, ${subs.manifest.discovered} discovered` });
  } catch { /* an unfiled measurement is not a failed capture */ }
  /* The links, anchors included (an in-page anchor is an element reference into this document). */
  try {
    if (subs.links && subs.links.length)
      cap.recordLinks({ sourceCapture: sha, capturedAt: retrieved,
        links: subs.links.filter((l) => l.address).map((l) => ({
          ref: l.ref, address: l.address, address_norm: normalizeAddress(l.address),
          citation_norm: l.citation || normalizeCitation(l.address), fragment: l.fragment || null,
          type: l.type, origin: l.origin, chrome: l.chrome === true, chrome_basis: l.chrome_basis || null })) });
  } catch { /* an unfiled link is not a failed capture */ }
  /* The change case matters most: different bytes at a known address put every earlier reuse into question. */
  if (baseHost && subs.siteObservations && subs.siteObservations.length) {
    try { subs.siteRecord = cap.recordSiteAssets({ host: baseHost, primarySha: sha, observations: subs.siteObservations }); }
    catch { /* likewise */ }
  }
  return { subs, skipped: null, sessionId: sid };
}

/** R12: a continuation resumes the session's outstanding supporting files against the session's OWN primary, read
 *  back from the store by its digest; the primary is not fetched again, and nothing new is filed about it, so the
 *  answer carries no document: the first tick answered it. */
async function continueCapture(cap, { body, session, cls, storeName, ev }) {
  const name = String(session.primaryFile || "snapshots/capture").replace(/^snapshots\//, "");
  let obj = null;
  try { obj = await ev.head(session.primarySha); } catch { obj = null; }
  const size = obj && Number.isFinite(Number(obj.size)) ? Number(obj.size) : 0;
  const w = await walkSubresources(cap, { ev, sha: session.primarySha, total: size, multipart: false, ct: "text/html",
    name, locator: session.locator, base: session.base, retrieved: stampSecond(), resume: session.state, sessionId: session.session });
  return { status: 200, body: {
    ok: true, existed: true,
    continued: { session: session.session, primary: { sha256: session.primarySha, file: session.primaryFile, locator: session.locator },
                 note: "a continuation files no new document: the primary was captured by the session's first tick and is never re-fetched" },
    ...snapshotOf(w.subs, w.sessionId, name, null),
    ...(w.skipped ? { subresources_skipped: w.skipped } : {}),
    store: storeName, tokenClass: cls, note: ACQUIRE_GRADE_NOTE } };
}
