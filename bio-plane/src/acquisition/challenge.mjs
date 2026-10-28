/* acquisition — R140: A CHALLENGE OR CAPTCHA IN PLACE OF THE DOCUMENT IS RECOGNISED AT THE FETCH (T53-99; K5574, K3656).
 *
 * A bot-protection service sometimes answers a fetch with a page that asks a person to prove they are one, in place of the document.
 * That page is never filed as the document, and bot protection is never worked around (K3656): this file only RECOGNISES the answer,
 * from what the fetch itself received (the status, the headers and the first bytes of the body). Nothing here sends a request, keeps a
 * cookie or solves anything. Pure; never throws.
 *
 * What counts as the challenge is stated, and narrow, so an ordinary page is never refused for the script a protection service adds to it
 * (a page behind Cloudflare carries `/cdn-cgi/challenge-platform/` scripts and a form may embed a CAPTCHA widget): a header the service
 * sets to say it challenged, or a page whose own text is the challenge. */

/* the most of a body read to recognise a challenge page: such a page is small, and the rest of a document is not read for this */
export const CHALLENGE_HEAD_BYTES = 40960;

import { localize } from "../setup-words/index.mjs";
import { ledgerOf } from "./unpack.mjs";
import { ARCHIVE_CHECKS } from "./checks.mjs";

/* A header the service sets to say it answered with a challenge instead of the page (Cloudflare). */
const HEADER_SIGNS = Object.freeze([
  Object.freeze({ kind: "cloudflare", header: "cf-mitigated", value: /^challenge\b/i, signal: localize("acquisition.challenge.header_cf_mitigated", "the header cf-mitigated: challenge") }),
]);

/* Text a challenge page is made of. `page`: the signature alone settles it; `widget`: a CAPTCHA widget, which settles it only when the
   answer is not a success, or the page is nothing else (see below). */
const PAGE_SIGNS = Object.freeze([
  Object.freeze({ kind: "cloudflare", re: /<title>\s*Just a moment\.\.\.\s*<\/title>/i, signal: localize("acquisition.challenge.page_just_a_moment", "a page titled Just a moment...") }),
  Object.freeze({ kind: "cloudflare", re: /window\._cf_chl_opt|cf-chl-(?:opt|bypass|widget)|id=["']challenge-(?:form|running|stage)["']|id=["']cf-challenge-running["']/i, signal: localize("acquisition.challenge.cloudflare_script", "Cloudflare's challenge page script") }),
  Object.freeze({ kind: "cloudflare", re: /cdn-cgi\/challenge-platform\/h\/[a-z]\/orchestrate\/(?:chl_page|managed|jsch)/i, signal: localize("acquisition.challenge.cloudflare_orchestration", "Cloudflare's challenge orchestration script") }),
  Object.freeze({ kind: "cloudflare", re: /cf-browser-verification|Checking (?:if the site connection is secure|your browser before accessing)/i, signal: localize("acquisition.challenge.cloudflare_browser_check", "Cloudflare's browser check") }),
  Object.freeze({ kind: "cloudflare", re: /<title>\s*Attention Required!\s*\|\s*Cloudflare\s*<\/title>[\s\S]*cf-captcha-container/i, signal: localize("acquisition.challenge.cloudflare_captcha_block", "Cloudflare's CAPTCHA block page") }),
  Object.freeze({ kind: "datadome", re: /(?:geo|ct)\.captcha-delivery\.com|<title>[^<]*DataDome[^<]*<\/title>/i, signal: localize("acquisition.challenge.datadome", "DataDome's CAPTCHA page") }),
  Object.freeze({ kind: "perimeterx", re: /id=["']px-captcha["']|Press\s*(?:&amp;|&)\s*Hold to confirm you are\s*a\s*human/i, signal: localize("acquisition.challenge.perimeterx", "PerimeterX's human check") }),
  Object.freeze({ kind: "incapsula", re: /Incapsula incident ID|_Incapsula_Resource/i, signal: localize("acquisition.challenge.incapsula", "Incapsula's block page") }),
]);
const WIDGET_SIGNS = Object.freeze([
  Object.freeze({ kind: "captcha", re: /class=["'][^"']*\b(?:g-recaptcha|h-captcha|cf-turnstile)\b|data-sitekey=/i, signal: localize("acquisition.challenge.captcha_widget", "a CAPTCHA widget") }),
]);
const HUMAN_RE = /verify (?:that )?you are (?:a )?human|are you a (?:human|robot)|confirm you are (?:a )?human|prove you(?:'re| are) (?:not a robot|human)|i'm not a robot/i;
/* a CAPTCHA widget on a page is a challenge only when that page is all there is: an error status, or a small page that asks for the person */
const WIDGET_PAGE_MAX = 30720;

/** R140: `challengeOf({status, headers, text, bytes})` answers `{kind, signals}` when the fetch's answer is a challenge or CAPTCHA in place of the
 *  document, else null. `headers` is a `Headers`, a Map or a plain object; `text` the first characters of the body (or `bytes` the first bytes). */
export function challengeOf({ status = 200, headers = null, text = null, bytes = null, total = null } = {}) {
  try {
    const get = (name) => (headers && typeof headers.get === "function" ? headers.get(name)
      : headers && typeof headers === "object" ? headers[name] ?? headers[name.toLowerCase()] : null) || "";
    const signals = [];
    let kind = null;
    for (const s of HEADER_SIGNS) if (s.value.test(String(get(s.header)))) { kind = kind ?? s.kind; signals.push(s.signal); }
    const body = typeof text === "string" ? text : bytes instanceof Uint8Array ? new TextDecoder("utf-8", { fatal: false }).decode(bytes.subarray(0, CHALLENGE_HEAD_BYTES)) : "";
    const type = String(get("content-type")).split(";")[0].trim().toLowerCase();
    const htmlish = !type || type === "text/html" || type === "application/xhtml+xml";
    if (htmlish && body) {
      for (const s of PAGE_SIGNS) if (s.re.test(body)) { kind = kind ?? s.kind; signals.push(s.signal); }
      const small = (Number.isFinite(total) ? total : body.length) <= WIDGET_PAGE_MAX;
      if (!signals.length) for (const s of WIDGET_SIGNS)
        if (s.re.test(body) && (status >= 400 || (small && HUMAN_RE.test(body)))) { kind = kind ?? s.kind; signals.push(s.signal); }
    }
    return kind ? { kind, signals } : null;
  } catch { return null; }
}

/** R140: the first `max` bytes of a body, read to recognise a challenge page; the rest is cancelled. */
export async function readPrefix(res, max = CHALLENGE_HEAD_BYTES) {
  const reader = res && res.body && res.body.getReader ? res.body.getReader() : null;
  if (!reader) return new Uint8Array(0);
  const got = [];
  let n = 0;
  try { while (n < max) { const { done, value } = await reader.read(); if (done) break; got.push(value); n += value.length; } }
  catch { /* a body that breaks off is read as far as it came */ }
  try { await reader.cancel(); } catch { /* the source may already be gone */ }
  const all = new Uint8Array(Math.min(n, max));
  let at = 0;
  for (const c of got) { const take = Math.min(c.length, all.length - at); all.set(c.subarray(0, take), at); at += take; if (at >= all.length) break; }
  return all;
}

const hostOf = (u) => { try { return new URL(u).hostname.toLowerCase(); } catch { return null; } };
const nowMsOf = (store) => { const h = store && store.env ? store.env.BIO_NOW_MS : undefined; return h !== undefined && h !== null && h !== "" && Number.isFinite(Number(h)) ? Number(h) : Date.now(); };

/** R140: the recognition of a response an act has received: the header alone, or, for an error answer that may be a bot-protection page, a bounded prefix of its body.
 *  Answers `{kind, signals}` or null. The body of a response that is not a challenge may have been consumed (a refusal needs only its status). */
export async function recogniseChallenge(res) {
  try {
    let chal = challengeOf({ status: res.status, headers: res.headers });
    if (!chal && !res.ok && [401, 403, 429, 503].includes(res.status)) {
      const prefix = await readPrefix(res, CHALLENGE_HEAD_BYTES);
      chal = challengeOf({ status: res.status, headers: res.headers, bytes: prefix, total: prefix.length });
    }
    return chal;
  } catch { return null; }
}

/** R140: the refusal of a fetch answered by a challenge or CAPTCHA: `{ok: false, reason: "SITE_ASKS_FOR_PERSON", code, check, translation, address, host, status,
 *  challenge, counted, detail}`. It adds one to the host's count (with the instant of the last) and writes nothing else; the address is named so the caller can
 *  hand it to a member. Never throws. */
export function personRefusal(store, { address = null, status = null, chal }) {
  const host = hostOf(address);
  let counted = null;
  try { const inst = ledgerOf(store); if (inst && host) { inst.challengeNote(host, nowMsOf(store)); const r = inst.personChecksFor(host); counted = { host, count: r.count }; } }
  catch { counted = null; }
  const row = ARCHIVE_CHECKS.SITE_ASKS_FOR_PERSON;
  return { ok: false, reason: "SITE_ASKS_FOR_PERSON", code: "SITE_ASKS_FOR_PERSON", check: row.check, translation: row.translation, address, host, status, challenge: chal, counted,
           detail: localize("acquisition.challenge.asks_for_person", "{host} answered with a check that asks for a person ({signals}) in place of the document. Your team's Civicsmith does not get past such a check, and nothing was saved.", { host: String(host ?? ""), signals: chal.signals.join("; ") }) };
}

/** R140: `personChecksFor(store, {host})` answers `{host, count, last_at}`: how many times the host answered with a challenge or CAPTCHA, and the instant of the last (null for none). Module-only;
 *  a read; never throws. */
export function personChecksFor(store, { host = null } = {}) {
  try {
    const h = typeof host === "string" ? host.trim().toLowerCase() : "";
    const inst = ledgerOf(store);
    return inst && h ? inst.personChecksFor(h) : { host: h || null, count: 0, last_at: null };
  } catch { return { host: typeof host === "string" ? host : null, count: 0, last_at: null }; }
}
