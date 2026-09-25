/* D-712 — THE SHAPE OF op=publishedcase's CASE ANSWER, AS THE LIVE WIRE SERVES IT, AND THE ONE PLACE IT IS WRITTEN.
 *
 * WHY THIS EXISTS: `publishedcase.test.mjs`'s mock carried a `document` key the live op never served, so the page
 * rendered "signed by vera" under the suite while every stranger read a signed, ratified case as "not been signed
 * yet". `check-mock-envelope.mjs` arm C reports a fixture NARROWER than the plane's SELECTs; nothing saw one WIDER.
 *
 * TWO READERS, ONE LIST, so neither can drift alone:
 *   - `draft-binding.test.mjs` asserts the LIVE answer (miniflare, a stranger, a case signed through op=caseratify)
 *     has exactly these keys — the plane moving a key turns it red;
 *   - `publishedcase.test.mjs` asserts its mock `caseEdition()` has exactly these keys — the fixture moving turns it red.
 * MEASURED 2026-09-25 by the D-712 worker from the live answer on all five of draft-binding's cases (identical).
 * A key the plane adds on purpose is added HERE, and both suites say whether the fixture and the wire followed. */
export const PUBLISHED_CASE_KEYS = Object.freeze([
  "awaiting", "bar", "bar_detail", "bias_acknowledgement", "caseId", "case_detail", "complete", "completeness",
  "document", "edition", "edition_index", "editions", "files", "findings", "graph_detail", "latest_edition",
  "manifest", "manifest_sha", "ok", "project", "ratified_at", "scope", "verification",
]);
/* `document` of a RATIFIED case edition (null before ratification, and on a ratified bundle that is no case). */
export const PUBLISHED_CASE_DOCUMENT_KEYS = Object.freeze([
  "attestor", "delivered_by", "doc_sha", "gate_version", "ratified_at", "sig_armored", "text",
]);
/* `asked` is conditional — present only when a hash or finding id was resolved to the case — so it is left out
   of the comparison on both sides, exactly as the plane's own key-set pin leaves it out. */
export const keysOf = (o) => Object.keys(o || {}).filter((k) => k !== "asked").sort();
