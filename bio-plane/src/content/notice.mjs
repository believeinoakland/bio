/* content — THE CROSS-VERSION NOTICE'S PURE RULES (requirements: `build/requirements/content.md` R29–R31, R41).
 * Moved from the legacy store's D-394 / REC-221 region (BIO_Content_Framework_v0_10.md §18.1). The reads that feed
 * them (the version chains, the captures' contexts and text units) are `./index.mjs`'s; everything here is pure.
 *
 * THREE QUESTIONS, KEPT APART because collapsing them is what kept the notice unbuilt (§18.1's decomposition):
 *   1. IS THERE A NEWER CAPTURE?  Answered with certainty only where every version chain was read (R29).
 *   2. IS A PASSAGE AT THE SAME EXTENT IN IT?  The extent test, admitted as a SUFFICIENT signal for a CANDIDATE and
 *      never as evidence of identity (R30). A bound the record does not hold is NOT a match.
 *   3. DOES THE CHANGE TOUCH THE PASSAGE?  Graded from the captures' TEXT, never from the extent's existence (R31):
 *      A byte-identical at the extent, B identical elsewhere, C similar (word-multiset Dice at or above 0.7),
 *      NOT_FOUND only where the newer text is held whole, else UNDETERMINED with its reason. A and B say UNAFFECTED
 *      only on POSITIVE evidence; "not in the part we read" is never "not in the document".
 * Nothing moves by itself: only a member's act moves a citation (§14.4, Bob 2026-09-14). */

import { canonicalExtent, describeExtent } from "./extent.mjs";

/** R29: at most this many addresses one capture is asked about; past it the rest are not asked, and the answer says so. */
export const VERSION_NOTICE_ADDRESSES_MAX = 20;

/** The four states, with the sentence a member reads (PL-17: the vocabulary travels with the answer). */
export const VERSION_NOTICE_STATES = Object.freeze({
  no_newer_capture: "nothing: the version chain was read and holds nothing after this capture",
  newer_capture_matched: "a newer version of this document exists, and a passage at the same extent "
    + "is in it. That is a candidate, never the same passage: whether your citation should move is "
    + "yours to decide, and only your act can move it",
  newer_capture_undetermined: "a newer version of this document exists; whether your passage survives "
    + "into it is UNDETERMINED. Nothing has moved — look at the newer version and decide",
  chain_unread: "whether a newer version of this document exists is UNDETERMINED: the record could not "
    + "read its version chain, so this is not a statement that there is none",
});

/** The five grades, what each means for the referenced part, and the sentence a member reads. */
export const VERSION_NOTICE_GRADES = Object.freeze({
  A: { affects: "unaffected", says: "the passage's text is byte-identical at the same extent of the newer version" },
  B: { affects: "unaffected", says: "the passage's text is byte-identical in the newer version, at a different position" },
  C: { affects: "affected", says: "text SIMILAR to the passage is in the newer version, and it is not identical: the passage changed" },
  NOT_FOUND: { affects: "affected",
    says: "the newer version's text is held whole, and neither the passage nor text similar to it is in it" },
  UNDETERMINED: { affects: "undetermined",
    says: "whether the change touches your passage is UNDETERMINED; the reason says what the record lacks" },
});

/** Word-multiset Dice at or above which differing text is C rather than NOT_FOUND. It only separates two AFFECTED
 *  grades, so it cannot move whether anyone is notified; 0.7 is provisional. */
export const VERSION_NOTICE_SIMILAR = 0.7;

/** Does the record HOLD the bound this extent is tested against, in this capture's context? Null when it does, or the
 *  sentence naming what is not held. A checker pass is evidence only where this says the figure was held. */
export function extentBoundUnheld(extent, ctx, pdfPageBoxUndetermined) {
  const c = ctx && ctx.container && typeof ctx.container === "object" ? ctx.container : {};
  const has = (v) => Array.isArray(v) && v.length > 0;
  switch (extent.kind) {
    case "pdf-page":
      if (!Number.isInteger(ctx.pageCount)) return "the record holds no page set for the newer capture";
      /* D-374: a rect is bounded by its page's box too, so a pass is evidence about the rect only where that box was held. */
      return pdfPageBoxUndetermined(extent, ctx)
        ? "the record holds no box for that page of the newer capture, so its rect was not bounded" : null;
    case "doc-para":
      return Number.isInteger(c.paragraphs) ? null : "the record holds no paragraph count for the newer capture";
    case "sheet-cell": case "sheet-range":
      return has(c.sheets) ? null : "the record holds no sheet list for the newer capture";
    case "slide-shape":
      return has(c.slides) ? null : "the record holds no slide list for the newer capture";
    case "doc-table":
      return Array.isArray(c.tables) ? null : "the record holds no table list for the newer capture";
    case "image":
      return Number.isInteger(extent.page)
        ? (Number.isInteger(ctx.pageCount) ? null : "the record holds no page set for the newer capture")
        : (Array.isArray(c.images) ? null : "the record holds no image list for the newer capture");
    default:
      return `this read cannot bound an extent of kind '${String(extent.kind).slice(0, 40)}'`;
  }
}

function bagOf(text) {
  const bag = new Map();
  for (const w of String(text).toLowerCase().match(/[\p{L}\p{N}]+/gu) || []) bag.set(w, (bag.get(w) || 0) + 1);
  let n = 0;
  for (const v of bag.values()) n += v;
  return { bag, n };
}

function dice(a, b) {
  if (!a.n || !b.n) return 0;
  let shared = 0;
  const [small, big] = a.bag.size <= b.bag.size ? [a.bag, b.bag] : [b.bag, a.bag];
  for (const [w, c] of small) shared += Math.min(c, big.get(w) || 0);
  return (2 * shared) / (a.n + b.n);
}

/** THE GRADE for one cited passage (`row`: its `cited_as`, `ref`) against one newer capture, from the two captures'
 *  held units `{units: [{extent (canonical JSON), ref, text, truncated}], state}` where `state` is the text index's
 *  own (`whole`, `partial`, `none`, or null for never indexed; extraction R36). Returns
 *  `{grade, affects, reason, why, found_at, similarity}`. Pure. */
export function gradeAcross(row, extent, older, newer) {
  const G = VERSION_NOTICE_GRADES;
  const out = (grade, reason, why, found_at = null, similarity = null) =>
    ({ grade, affects: G[grade].affects, reason, why, found_at, similarity });
  const U = (reason, why) => out("UNDETERMINED", reason, why);
  const said = (s) => s || "never recorded";
  const safeJson = (s) => { try { return s == null ? null : JSON.parse(s); } catch { return null; } };
  if (!extent || typeof extent !== "object" || typeof extent.kind !== "string")
    return U("extent_unreadable", "the cited passage's extent could not be read back from its row");
  if (row.cited_as === "bytes")
    return U("cited_as_bytes", "the passage is an image cited as its bytes, and the record holds no per-part "
      + "digest of the newer capture to compare it with");
  const whole = extent.kind === "document";
  let cited;
  if (whole) {
    if (older.state !== "whole" || !older.units.length || older.units.some((u) => u.truncated))
      return U("cited_text_partial", "the citation is to the whole document, and the record does not hold the "
        + `cited version's text whole (its index reads ${said(older.state)}), so there is no whole text to compare`);
    cited = { extent: canonicalExtent(extent), text: older.units.map((u) => u.text).join("\n") };
  } else {
    const at = canonicalExtent(extent);
    const u = older.units.find((x) => x.extent === at);
    if (!u)
      return U("cited_text_not_held", `the record holds no text at exactly ${describeExtent(extent)} of the cited `
        + "version (only whole indexed units — a PDF page, a paragraph, a slide — carry text), so there is "
        + "nothing to compare");
    if (u.truncated)
      return U("cited_text_truncated", "the cited passage's text is held only to the per-unit cap, so an "
        + "identity with the newer version cannot be established");
    cited = { extent: at, text: u.text };
  }
  const found = (x) => ({ extent: safeJson(x.extent), ref: x.ref });
  if (whole) {
    const complete = newer.state === "whole" && newer.units.length && !newer.units.some((u) => u.truncated);
    if (!complete)
      return U(newer.units.length ? "newer_text_partial" : "newer_text_not_held",
        `the record does not hold the newer version's text whole (its index reads ${said(newer.state)})`);
    const same = newer.units.length === older.units.length
      && newer.units.every((u, i) => u.extent === older.units[i].extent && u.text === older.units[i].text);
    if (same) return out("A", "identical_at_extent", "every unit of the newer version's text is byte-identical "
      + "at the same position", { extent, ref: row.ref });
    const text = newer.units.map((u) => u.text).join("\n");
    if (text === cited.text) return out("B", "identical_elsewhere", "the newer version's text is byte-identical, "
      + "divided into different units", { extent, ref: row.ref });
    const sim = dice(bagOf(cited.text), bagOf(text));
    const r = Math.round(sim * 1000) / 1000;
    return sim >= VERSION_NOTICE_SIMILAR
      ? out("C", "similar_text", `the document's text changed; word similarity ${r}`, { extent, ref: row.ref }, r)
      : out("NOT_FOUND", "text_not_found", `the document's text changed past the similarity floor `
          + `(${VERSION_NOTICE_SIMILAR}); word similarity ${r}`, null, r);
  }
  const here = newer.units.find((x) => x.extent === cited.extent);
  if (here && !here.truncated && here.text === cited.text)
    return out("A", "identical_at_extent", `the text at ${describeExtent(extent)} is byte-identical in the newer version`,
      found(here));
  const moved = newer.units.find((x) => !x.truncated && x.text === cited.text);
  if (moved)
    return out("B", "identical_elsewhere", `the passage's text is byte-identical at ${moved.ref} of the newer version`,
      found(moved));
  /* C: the best-scoring unit, the same extent winning a tie so an edited passage that stayed put is named where it stayed. */
  const bag = bagOf(cited.text);
  let best = null, bestSim = -1;
  for (const x of here ? [here, ...newer.units.filter((y) => y !== here)] : newer.units) {
    const s = dice(bag, bagOf(x.text));
    if (s > bestSim) { best = x; bestSim = s; }
  }
  const r = best ? Math.round(bestSim * 1000) / 1000 : null;
  if (best && bestSim >= VERSION_NOTICE_SIMILAR)
    return out("C", "similar_text", `text similar to the passage (word similarity ${r}) is at ${best.ref} of the `
      + "newer version, and it is not identical", found(best), r);
  if (!newer.units.length)
    return U("newer_text_not_held", "the record holds no text of the newer version (its index reads "
      + `${said(newer.state)}), so where the passage went cannot be looked for`);
  if (newer.state !== "whole")
    return U("newer_text_partial", `the newer version's text is held only in part (its index reads ${said(newer.state)}), `
      + "so the passage may be in the part not held");
  if (newer.units.some((x) => x.truncated))
    return U("newer_text_truncated", "a unit of the newer version is held only to the per-unit cap, so the passage "
      + "may be in the part not held");
  return out("NOT_FOUND", "text_not_found", `the newer version's text is held whole (${newer.units.length} unit(s)) `
    + `and neither the passage nor text similar to it is in it (best word similarity ${r ?? 0})`, null, r);
}

/** R31's roll-up over the candidates: AFFECTED if any is, else UNDETERMINED if any cannot be told, else UNAFFECTED;
 *  `null` with no newer capture; UNDETERMINED when the chains could not be read (never silence). */
export function affectsOf(state, candidates) {
  if (state === "no_newer_capture") return null;
  if (state === "chain_unread") return "undetermined";
  if (candidates.some((c) => c.affects === "affected")) return "affected";
  if (candidates.some((c) => c.affects === "undetermined")) return "undetermined";
  return "unaffected";
}
