/* docprofile — recognising what kind of document this is, and what follows.
 *
 * WHY THIS PACKAGE EXISTS. Two requirements drive it, both of them Bob's and both
 * about credibility rather than tidiness.
 *
 *   A rendition must be perceived as rendering MEANINGFULLY THE SAME as the
 *   document does on its host, because a member will present portions of it as
 *   evidence, and the system has to be able to say those portions are the same as
 *   the original and be believed.
 *
 *   The system must recognise when something meaningful in the EVIDENTIARY
 *   portions has changed since the last fetch, and equally, must recognise when it
 *   has NOT. Both directions matter. A checker that only ever says "changed"
 *   is as useless as one that only ever says "unchanged".
 *
 * Neither requirement can be met by looking at a document's bytes. Measured on
 * real municipal sources:
 *
 *   oakland.legistar.com (ASP.NET WebForms on IIS): two fetches three seconds
 *   apart differ by 115,980 bytes, 31.4% of the document, every differing byte
 *   inside __VIEWSTATE and __EVENTVALIDATION. Content identical.
 *
 *   oaklandside.org (WordPress behind nginx): two fetches BYTE-IDENTICAL. No
 *   per-render mechanism at all.
 *
 *   oaklandca.opengov.com (client-rendered app): the served HTML is a shell. It
 *   carries no anchors and no evidentiary content whatsoever. Its bytes are
 *   perfectly capturable and perfectly worthless as evidence.
 *
 * One comparison rule cannot serve those three. Before this package, each was
 * handled by another special case bolted onto the capture path, which is how a
 * codebase stops being reasoned about.
 *
 * THE MODEL. A document has three kinds of region, and everything else follows
 * from separating them:
 *
 *   EVIDENTIARY   the substance. What a member would quote, cite, or put in front
 *                 of a council. Change here is meaningful and must be reported.
 *   PRESENTATIONAL  furniture: navigation, headers, footers, related-links rails.
 *                 Real, captured, rendered, and NOT the document's claim about its
 *                 own subject. Change here is recorded and is not a change to the
 *                 evidence.
 *   MECHANICAL    per-render machinery: page state, security tokens, session ids,
 *                 cache stamps, ad and analytics slots. Varies on every fetch by
 *                 design. Never evidence, never a change, and never shown.
 *
 * THREE DIGESTS, not one. This is the core correction over the single "stable
 * digest" that preceded it, which conflated presentational with mechanical and so
 * could not answer the question a member actually asks.
 *
 *   identity     sha256 of the raw bytes. The capture's name. Never changes,
 *                never recomputed, and raw bytes are never rewritten.
 *   rendition    mechanical regions normalised. Answers "would this look the
 *                same?", which is the question the fidelity claim rests on.
 *   evidentiary  presentational AND mechanical regions normalised. Answers "has
 *                the substance changed?", which is the question monitoring asks.
 *
 * THE FAILURE ASYMMETRY, and it governs every default in this package. Reporting
 * a change that did not happen costs a member some attention. Failing to report a
 * change that DID happen puts a false claim in the record and is discovered, if
 * ever, by the party the claim is aimed at. So an unrecognised document gets the
 * conservative handler, where nothing is presumed presentational and almost
 * nothing mechanical, and the system over-reports rather than under-reports.
 * Handlers earn the right to narrow that, per stack, on measurement.
 */

import { makeRegistry, CONFIDENCE } from "./recogniser.mjs";

/* The confidence ladder is ONE ladder now, defined in recogniser.mjs and used by
   every axis (CONSTRUCTS Step 0 #1). It is re-exported here so the many existing
   importers of `CONFIDENCE` from this module keep working. */
export { CONFIDENCE };

/** Entity-decode enough to make an href comparable. Deliberately minimal: this is
 *  used to READ keys out of markup, never to rewrite anything the record holds. */
export function unescapeHtml(s) {
  return String(s).replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"')
                  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ");
}

export const REGION = { EVIDENTIARY: "evidentiary", PRESENTATIONAL: "presentational", MECHANICAL: "mechanical" };

const PLACEHOLDER = "\u0000BIO-NORMALISED\u0000";

/** Apply a handler's rule set to a copy of the text, reporting what it touched.
 *  Never mutates anything the record holds: normalisation is always on a copy,
 *  so a misclassification is recoverable and can never destroy evidence. */
export function applyRules(text, rules) {
  let out = String(text);
  const found = [];
  for (const rule of rules || []) {
    let count = 0, bytes = 0;
    for (const re of rule.patterns) {
      out = out.replace(re, (whole, pre, mid, post) => {
        if (!mid || !mid.length) return whole;
        count++; bytes += mid.length;
        return (pre || "") + PLACEHOLDER + (post || "");
      });
    }
    if (count) found.push({ rule: rule.key, region: rule.region, label: rule.label, count, bytes });
  }
  return { text: out, found, bytes: found.reduce((n, f) => n + f.bytes, 0) };
}

/** Normalise everything OUTSIDE the document's own boundary.
 *
 *  A second rule shape, and the measurements forced it. Legistar carries no
 *  <nav>, no <header> and no <footer> at all: its furniture is ASP.NET control
 *  divs with generated ids, and an earlier rule that guessed at those ids matched
 *  303 bytes on a 369KB page, which is to say it did nothing while appearing to
 *  work. What Legistar DOES carry is one <main role="main">, and that is the
 *  document. So a handler may declare a BOUNDARY instead of listing furniture,
 *  and everything outside it becomes presentational in one stroke.
 *
 *  This is also the more conservative shape. Listing furniture means anything not
 *  listed silently counts as substance; naming the boundary means anything outside
 *  it counts as furniture, and the boundary is a single structural fact that is
 *  either there or not, rather than a growing catalogue of theme-specific guesses.
 *
 *  If the boundary does not match, NOTHING is normalised and the handler falls
 *  back to treating the whole document as substance, because a boundary that
 *  missed must never be read as a document with no content. */
export function applyBoundary(text, boundary) {
  if (!boundary) return { text, found: [], bytes: 0 };
  const m = boundary.exec(String(text));
  if (!m || !m[1]) return { text, found: [], bytes: 0, missed: true };
  const inner = m[1];
  const outside = String(text).length - inner.length;
  return { text: PLACEHOLDER + inner + PLACEHOLDER,
           found: [{ rule: "outside_the_document", region: REGION.PRESENTATIONAL,
                     label: "everything around the document itself, such as navigation and footers",
                     count: 1, bytes: outside }],
           bytes: outside };
}

/** The three digests for one document, under one handler. */
export async function digests(bytes, handler, ctx) {
  const sha256 = ctx.sha256;
  const identity = await sha256(bytes);
  if (!handler.textual) return { identity, rendition: identity, evidentiary: identity, applied: [], textual: false };
  const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  const rules = handler.rules(ctx) || [];
  const mech = rules.filter((r) => r.region === REGION.MECHANICAL);
  const pres = rules.filter((r) => r.region === REGION.PRESENTATIONAL);
  const r1 = applyRules(text, mech);
  /* Mechanical first, always: a security token can sit inside the document's own
     boundary as easily as outside it, and normalising the boundary first would
     hide the token rather than classify it. */
  const b = applyBoundary(r1.text, handler.boundary ? handler.boundary(ctx) : null);
  const r2 = b.found.length ? b : applyRules(r1.text, pres);
  const enc = new TextEncoder();
  return {
    identity,
    rendition: await sha256(enc.encode(r1.text)),
    evidentiary: await sha256(enc.encode(r2.text)),
    applied: [...r1.found, ...r2.found],
    boundary_missed: !!b.missed,
    mechanical_bytes: r1.bytes, presentational_bytes: r2.bytes,
    textual: true,
  };
}

/** The layer-3 primitive: has this document changed, and in what sense? NOT a public
 *  entry point — `assess()` is the one entry point for the layered change question
 *  and it CALLS this to settle layers 2 and 3 (CONSTRUCTS Step 0 #2: monitor() was
 *  deleted, compare() demoted to the primitive it always was). It stays exported
 *  only for the pure duplicate-detection caller that wants the L3 answer without the
 *  content-type layers above it, and for the suite that pins its three verdicts.
 *
 *  The answer a member is owed is the `evidentiary` line; everything else is for the
 *  record.
 *
 *  `verdict` is one of:
 *    identical      the source served the same bytes
 *    unchanged      substance and appearance both the same; only machinery moved
 *    restyled       substance the same, appearance differs (furniture moved)
 *    changed        the substance itself differs
 *    undetermined   no handler could speak with enough confidence to say  */
export async function compare(before, after, handler, ctx) {
  const a = await digests(before, handler, ctx);
  const b = await digests(after, handler, ctx);
  const base = { handler: handler.key, confidence: ctx.confidence || CONFIDENCE.NONE,
                 artifacts: [...new Set(a.applied.concat(b.applied).map((x) => x.label))],
                 applied: a.applied, digests: { before: a, after: b } };
  if (a.identity === b.identity)
    return { ...base, verdict: "identical", evidentiary_change: false,
             why: "the source served exactly the same document" };
  /* Without a confident handler, the narrowing rules are not trusted and the
     honest answer is that the bytes differ and nobody can yet say what that
     means. Silence here is safer than a wrong "unchanged". */
  if (base.confidence !== CONFIDENCE.CERTAIN && !handler.conservative)
    return { ...base, verdict: "undetermined", evidentiary_change: null,
             why: "the document differs and this kind of document is not recognised well enough to say whether the difference matters" };
  if (a.evidentiary !== b.evidentiary)
    return { ...base, verdict: "changed", evidentiary_change: true,
             why: "the substance of the document differs" };
  if (a.rendition !== b.rendition)
    return { ...base, verdict: "restyled", evidentiary_change: false,
             why: "the substance is the same; something around it changed, such as navigation or related links" };
  return { ...base, verdict: "unchanged", evidentiary_change: false,
           why: "the substance and the appearance are both the same; only machinery this site rebuilds on every visit differs" };
}

/** Can this capture be shown as a faithful rendition, and if not, what is the
 *  honest claim?
 *
 *  The predecessor to this was all-or-nothing: one missing part refused the whole
 *  render, on the reasoning that a page missing a piece is a different page. That
 *  is right for a stylesheet and wrong for a footer icon, and the requirement is
 *  that the rendition be perceived as MEANINGFULLY the same, which is a claim
 *  about the evidentiary portion and not about every byte of furniture.
 *
 *    faithful      everything render-critical is held
 *    degraded      only non-critical parts are missing; the evidence renders and
 *                  the shortfall is NAMED on screen rather than hidden
 *    insufficient  something render-critical is missing; the render is refused,
 *                  because showing it would misrepresent the source  */
export function fidelity(manifest, handler, ctx) {
  const parts = (manifest && manifest.subresources) || [];
  const missing = parts.filter((p) => !p.ok && !handler.ignorable(p));
  if (!missing.length) return { level: "faithful", missing: [], critical: [] };
  const critical = missing.filter((p) => handler.renderCritical(p, ctx));
  if (critical.length)
    return { level: "insufficient", missing, critical,
             why: "a file the page needs in order to look the way the source published it has not been collected" };
  return { level: "degraded", missing, critical: [],
           why: "everything the page needs to read correctly is held; some decoration is not" };
}

/* ---- the STACK axis: one registry of the shared shape ----
   The host-stack recognisers live on a `makeRegistry()` instance exactly like the
   content-type axis does, so there is no longer an `identify`-shaped loop written
   twice. registry.mjs registers the handlers into this instance at import; the
   handlers themselves are the recognisers. */
const stacks = makeRegistry();

/** Add a handler to the stack registry. Ordered most specific first; the conservative
   handler carries `fallback: true` and is only ever reached by falling through. */
export function register(handler) { return stacks.register(handler); }
export function handlers() { return stacks.all(); }

/** Identify the document's host stack. `ctx` carries whatever the caller knows: the
 *  response headers, the locator, the content type, and the decoded text.
 *
 *  A thin wrapper over the shared registry that adds the stack axis's own
 *  extra — the document `kind` its handler reads from the address. Always returns a
 *  handler: an unrecognised document gets the conservative one rather than an error. */
export function identify(ctx) {
  const r = stacks.recognise(ctx);
  const handler = r.member;
  if (!r.matched)
    return { handler, confidence: CONFIDENCE.NONE, signals: [], considered: r.considered,
             why: "no handler recognised this document, so it is treated conservatively: nothing is assumed to be decoration and any difference is reported" };
  return { handler, confidence: r.confidence, signals: r.signals, considered: r.considered,
           kind: handler.kind ? handler.kind(ctx) : "unknown" };
}

/** Everything the record should keep about how a document was profiled. Written
 *  onto the capture, because a later session must be able to see WHICH handler
 *  spoke and how sure it was: a verdict whose author is unnamed cannot be
 *  re-evaluated when the author turns out to have been wrong. */
export function profileRecord(id, ctx) {
  return {
    handler: id.handler.key, handler_label: id.handler.label,
    handler_version: id.handler.version,
    confidence: id.confidence, signals: id.signals,
    document_kind: id.kind || "unknown",
    considered: id.considered,
    at: (ctx && ctx.now) || new Date().toISOString().split(".")[0] + "Z",
    note: id.why || null,
  };
}
