/* volatile.mjs — telling a mechanical artifact apart from a change.
 *
 * WHY THIS EXISTS. A member's question is "did this document change?". The
 * machine's answer, until now, was the hash of the bytes, and that answer is
 * wrong often enough to be useless: measured on oakland.legistar.com, two
 * fetches three seconds apart differed by 114,177 bytes, 31% of the document,
 * every differing byte inside two ASP.NET hidden fields, with the other 68.6%
 * byte-identical. Nothing had changed. A system that reports that as a change
 * has handed its own plumbing to somebody who was asking about a sewer fund.
 *
 * So the difference is CLASSIFIED here rather than surfaced. Each family below
 * is a known mechanism that varies on every render: server page state, security
 * tokens, session identifiers, cache-busting fingerprints, ad and analytics
 * slots. When every difference between two captures falls inside these families,
 * the document did not change, and nothing needs to be said to anybody.
 *
 * THREE RULES THIS FILE OBEYS.
 *
 * Raw bytes are never rewritten. Normalisation happens on a COPY to compute a
 * comparison digest. The record keeps exactly what the source served, so a
 * misclassification here can never destroy evidence and is always reversible.
 *
 * What was normalised is RECORDED, with the family, the count and the byte
 * volume. A difference that is not a change is still an observation, and a page
 * whose page-state suddenly stopped moving would be worth knowing about.
 *
 * Nothing here is ever treated as evidence. Nobody's case turns on a viewstate
 * blob, and these regions are excluded from comparison rather than from the
 * record.
 *
 * A family is only added on MEASUREMENT. The list is not a guess about what web
 * pages contain; every entry below is either observed in a real capture or is a
 * documented per-response mechanism of a stack that municipal publishing runs
 * on. Anything uncertain is left out, because a family added carelessly hides a
 * real change, which is the one failure mode that matters here.
 */

export const VOLATILE_FAMILIES = [
  {
    key: "aspnet_page_state",
    /* What a member would be told, if anyone ever needed to tell them. */
    label: "page state the server rebuilds on every visit",
    /* MEASURED on oakland.legistar.com/Calendar.aspx, 2026-07-30: __VIEWSTATE
       115,096 bytes and __EVENTVALIDATION 876 bytes accounted for 100% of the
       difference between two fetches three seconds apart. */
    patterns: [
      /(<input[^>]*\bname="(?:__VIEWSTATE|__VIEWSTATEGENERATOR|__VIEWSTATEENCRYPTED|__EVENTVALIDATION|__PREVIOUSPAGE|__SCROLLPOSITIONX|__SCROLLPOSITIONY)"[^>]*\bvalue=")([^"]*)(")/gi,
    ],
  },
  {
    key: "security_token",
    label: "a one-time security token",
    /* Anti-forgery tokens are per-response BY DESIGN: a token that repeated
       would not be doing its job. ASP.NET MVC, Rails, Django, Laravel. */
    patterns: [
      /(<input[^>]*\bname="(?:__RequestVerificationToken|authenticity_token|csrfmiddlewaretoken|_token|_csrf)"[^>]*\bvalue=")([^"]*)(")/gi,
      /(<meta[^>]*\bname="(?:csrf-token|csrf-param|_csrf)"[^>]*\bcontent=")([^"]*)(")/gi,
      /(\bnonce=")([^"]*)(")/gi,
    ],
  },
  {
    key: "session_id",
    label: "a visit identifier",
    /* A session id names THIS visit and says nothing about the document. */
    patterns: [
      /(;jsessionid=)([A-Za-z0-9._-]+)()/gi,
      /(\b(?:ASP\.NET_SessionId|PHPSESSID|JSESSIONID|SESSID|sid)=)([A-Za-z0-9._%-]+)()/gi,
    ],
  },
  {
    key: "cache_buster",
    label: "a version stamp on a design file",
    /* A query string whose only job is to defeat caching. The FILE is captured
       and hashed on its own; the stamp is addressing, not content. Deliberately
       narrow: only ?v=, ?ver=, ?_= and ?t= with a numeric or hex value, because
       a query parameter is content often enough that a broad rule here would
       hide real change. */
    patterns: [
      /([?&](?:v|ver|_|t|rev|cb)=)([0-9a-f]{4,}|[0-9]{6,})(?=["'&\s>])()/gi,
    ],
  },
  {
    key: "ad_and_analytics",
    label: "an advertising or analytics slot",
    /* Ad slots and beacons are regenerated per impression and belong to a third
       party. Per the standing ruling, third-party script output is that third
       party's, not the publisher's, so it is never this document's content. */
    patterns: [
      /(\bdata-google-query-id=")([^"]*)(")/gi,
      /(\bid="(?:div-gpt-ad|google_ads_iframe)[^"]*?)([0-9]{6,})([^"]*")/gi,
      /(["'&](?:correlator|cachebuster|ord|gclid|_ga|_gid|utm_[a-z]+)=)([^"'&\s]+)()/gi,
      /(<!-- google_ad_section[^>]*?)([0-9]{6,})(-->)/gi,
    ],
  },
];

const PLACEHOLDER = "\u0000VOLATILE\u0000";

/** Replace every known-volatile region with a fixed placeholder, on a COPY, and
 *  report what was replaced. Text in, text out; callers hand this the decoded
 *  document and keep the original bytes untouched. */
export function normaliseVolatile(text) {
  let out = String(text);
  const found = [];
  for (const fam of VOLATILE_FAMILIES) {
    let count = 0, bytes = 0;
    for (const re of fam.patterns) {
      out = out.replace(re, (whole, pre, mid, post) => {
        /* A pattern that matched nothing worth replacing is not an observation.
           Guarding on length keeps an empty value="" from counting. */
        if (!mid || !mid.length) return whole;
        count++; bytes += mid.length;
        return (pre || "") + PLACEHOLDER + (post || "");
      });
    }
    if (count) found.push({ family: fam.key, label: fam.label, count, bytes });
  }
  return { text: out, found, normalised_bytes: found.reduce((n, f) => n + f.bytes, 0) };
}

/** Is this something normalisation applies to at all? Only markup. A PDF's bytes
 *  are its content and a stray match inside a compressed stream would be
 *  meaningless, so anything not obviously text/html is compared raw. */
export function isNormalisable(contentType, name) {
  const ct = String(contentType || "").toLowerCase();
  if (ct.includes("html") || ct.includes("xml") || ct.includes("xhtml")) return true;
  if (ct) return false;
  return /\.(html?|xhtml|aspx?|php|jsp)$/i.test(String(name || ""));
}

/** The comparison digest: the hash of the document with its volatile regions
 *  flattened. Identity stays the raw hash; this is only ever for comparing.
 *  `sha256` is injected so this file runs in a browser, a Worker, or a test. */
export async function stableDigest(bytes, { contentType, name, sha256 }) {
  if (!isNormalisable(contentType, name))
    return { digest: await sha256(bytes), normalised: false, found: [] };
  const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  const n = normaliseVolatile(text);
  return { digest: await sha256(new TextEncoder().encode(n.text)),
           normalised: true, found: n.found, normalised_bytes: n.normalised_bytes };
}

/** The question a member is actually asking, answered without asking them
 *  anything: are these two captures the same document?
 *
 *  Returns `same` true when the raw bytes differ but every difference sits
 *  inside a known mechanism. `artifacts` names those mechanisms in plain words,
 *  for the record rather than for the screen. `changed` true means the document
 *  itself differs and somebody may care. */
export async function compareCaptures(a, b, { contentType, name, sha256 }) {
  const ra = await sha256(a.bytes !== undefined ? a.bytes : a);
  const rb = await sha256(b.bytes !== undefined ? b.bytes : b);
  if (ra === rb)
    return { same: true, identical: true, changed: false, artifacts: [],
             why: "the source served exactly the same bytes" };
  const da = await stableDigest(a.bytes !== undefined ? a.bytes : a, { contentType, name, sha256 });
  const db = await stableDigest(b.bytes !== undefined ? b.bytes : b, { contentType, name, sha256 });
  const artifacts = [...new Set([...da.found, ...db.found].map((f) => f.label))];
  if (da.digest === db.digest)
    return { same: true, identical: false, changed: false, artifacts,
             families: da.found, normalised_bytes: da.normalised_bytes,
             why: "the bytes differ only where this site rebuilds them on every visit" };
  return { same: false, identical: false, changed: true, artifacts,
           families: da.found,
           why: "the document itself differs, beyond anything the site rebuilds automatically" };
}
