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

import { canonicalExtent, describeExtent, containerBoundUndetermined } from "./extent.mjs";
import { rangeCorners, a1ToRowCol } from "../textchain.mjs";
import { word, localize } from "../setup-words/index.mjs";

/** R29: at most this many addresses one capture is asked about; past it the rest are not asked, and the answer says so. */
export const VERSION_NOTICE_ADDRESSES_MAX = 20;

/** The four states, with the sentence a member reads (PL-17: the vocabulary travels with the answer). */
export const VERSION_NOTICE_STATES = Object.freeze({
  no_newer_capture: word("content.no_newer_capture"),
  newer_capture_matched: localize("content.notice.newer_capture_matched", "a newer version of this document exists, and a passage at the same extent is in it. That is a candidate, never the same passage: whether your citation should move is yours to decide, and only your act can move it"),
  newer_capture_undetermined: localize("content.notice.newer_capture_undetermined", "a newer version of this document exists; whether your passage survives into it is UNDETERMINED. Nothing has moved — look at the newer version and decide"),
  chain_unread: localize("content.notice.chain_unread", "whether a newer version of this document exists is UNDETERMINED: the record could not read its version chain, so this is not a statement that there is none"),
});

/** The five grades, what each means for the referenced part, and the sentence a member reads. */
export const VERSION_NOTICE_GRADES = Object.freeze({
  A: { affects: "unaffected", says: word("content.says.passage_text_byte") },
  B: { affects: "unaffected", says: word("content.says.passage_text_byte_identical") },
  C: { affects: "affected", says: word("content.says.text_similar_passage") },
  NOT_FOUND: { affects: "affected",
    says: word("content.says.newer_version_text") },
  UNDETERMINED: { affects: "undetermined",
    says: word("content.says.change_touches_passage") },
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
      if (!Number.isInteger(ctx.pageCount)) return word("content.text.record_holds_page");
      /* D-374: a rect is bounded by its page's box too, so a pass is evidence about the rect only where that box was held. */
      return pdfPageBoxUndetermined(extent, ctx)
        ? word("content.text.record_holds_box") : null;
    case "doc-para":
      return Number.isInteger(c.paragraphs) ? null : word("content.text.record_holds_paragraph");
    /* A list bounds a sheet, slide or table; a cell or shape inside it is bounded only by its grid or shape count
       (`containerBoundUndetermined`, R8's levels), so a pass with that figure unheld is no evidence (R30). */
    case "sheet-cell": case "sheet-range":
      return !has(c.sheets) ? word("content.text.record_holds_sheet")
        : innerUnheld(extent, ctx, "sheet_grid", word("content.inner_unheld.record_holds_row"));
    case "slide-shape":
      return !has(c.slides) ? word("content.text.record_holds_slide")
        : innerUnheld(extent, ctx, "shape_count", word("content.inner_unheld.record_holds_shape"));
    case "doc-table":
      return !Array.isArray(c.tables) ? word("content.text.record_holds_table")
        : innerUnheld(extent, ctx, "table_grid", word("content.inner_unheld.record_holds_row_column"));
    case "image":
      return Number.isInteger(extent.page)
        ? (Number.isInteger(ctx.pageCount) ? null : word("content.text.record_holds_page"))
        : (Array.isArray(c.images) ? null : word("content.text.record_holds_image"));
    default:
      return word("content.text.read_bound_extent", { kind: String(String(extent.kind).slice(0, 40)) });
  }
}

function innerUnheld(extent, ctx, level, sentence) {
  const u = containerBoundUndetermined(extent, ctx);
  return u && u.level === level ? sentence : null;
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

const said = (s) => s || "never recorded";

/** THE TEXT THE RECORD HOLDS WHOLE AT EXACTLY `extent` of one capture (R31's cited passage, R46's `passageText`), from
 *  its held units `{units: [{extent (canonical JSON), ref, text, truncated}], state}` in `seq` order: for a `document`
 *  extent every unit joined by a line feed, only when the index reads `whole` and no unit is cut at the per-unit cap;
 *  otherwise the one unit whose canonical extent is `extent`'s, only when it is not cut. Returns `{text, extent}` (the
 *  canonical extent), or `{text: null, reason, why}` naming what is not held. ONE rule, so a passage graded across
 *  versions and a passage's text read by a later module are the same text. Pure. */
export function heldTextAt(extent, held) {
  /* R46's sheet arm: where the capture's reading holds typed cells for the extent's sheet, a cell's text is its stored
     value and a range's the values of the cells inside it, one per line (R52's reading); a cell not held is no text. */
  if ((extent.kind === "sheet-cell" || extent.kind === "sheet-range") && held.cells) {
    const got = typedCellsAt(extent, held.cells);
    if (got.cells) {
      if (extent.kind === "sheet-cell" && !got.cells.length)
        return { text: null, reason: "cell_not_held", why: word("content.why.reading_holds_value", { extent: String(describeExtent(extent)) }) };
      if (got.cells.some((c) => typeof c.value !== "string"))
        return { text: null, reason: "cell_value_undetermined", why: word("content.why.cell_inside_held", { extent: String(describeExtent(extent)) }) };
      return { text: got.cells.map((c) => c.value).join("\n"), extent: canonicalExtent(extent) };
    }
  }
  if (extent.kind === "document") {
    if (held.state !== "whole" || !held.units.length || held.units.some((u) => u.truncated))
      return { text: null, reason: "cited_text_partial", why: word("content.why.citation_whole_document_record", { state: String(said(held.state)) }) };
    return { text: held.units.map((u) => u.text).join("\n"), extent: canonicalExtent(extent) };
  }
  const at = canonicalExtent(extent);
  const u = held.units.find((x) => x.extent === at);
  if (!u)
    return { text: null, reason: "cited_text_not_held", why: word("content.why.record_holds_text", { extent: String(describeExtent(extent)) }) };
  if (u.truncated)
    return { text: null, reason: "cited_text_truncated", why: localize("content.notice.cited_passage_held_only", "the cited passage's text is held only to the per-unit cap, so the whole passage is not held") };
  return { text: u.text, extent: at };
}

/** The grid box a `sheet-cell` or `sheet-range` extent names, `{r0, c0, r1, c1}` 1-based with the corners ordered (the
 *  range spelled bottom-right first names the same cells), or null when the extent names no readable cell or range. Pure. */
export function extentBox(extent) {
  const e = extent && typeof extent === "object" ? extent : {};
  if (e.kind === "sheet-cell") { const p = a1ToRowCol(e.cell); return p && { r0: p.row, c0: p.col, r1: p.row, c1: p.col }; }
  return e.kind === "sheet-range" ? rangeCorners(e.range) : null;
}

/** R52's rule, pure: the typed cells (`office-readers` R30, `odf-reader` R46) a reading holds inside a `sheet-cell` or
 *  `sheet-range` extent, from `sheetCells` (`{<sheet name>: cells list | null}`), each `{source, value, type, declared,
 *  cached, formula}` copied field for field, in row then column order. Returns `{cells}` (a held sheet with no cell in
 *  the extent is a measured empty list), or `{cells: null, reason, why}`: another extent kind, or no typed cells held
 *  for that sheet, never an empty list for what was not read. Recalculates nothing. */
export function typedCellsAt(extent, sheetCells) {
  const e = extent && typeof extent === "object" ? extent : {};
  if (e.kind !== "sheet-cell" && e.kind !== "sheet-range")
    return { cells: null, reason: "not_a_sheet_extent",
             why: word("content.why.extent_names_cells", { kind: String(String(e.kind).slice(0, 40)) }) };
  const sheet = typeof e.sheet === "string" ? e.sheet.trim() : "";
  const list = sheetCells && typeof sheetCells === "object" && Object.prototype.hasOwnProperty.call(sheetCells, sheet)
    ? sheetCells[sheet] : null;
  if (!Array.isArray(list))
    return { cells: null, reason: "cells_not_held",
             why: word("content.why.capture_reading_holds", { sheet: String(sheet.slice(0, 40)) }) };
  const box = extentBox(e);
  if (!box) return { cells: null, reason: "extent_unreadable", why: word("content.why.extent_cell_range") };
  const inside = [];
  for (const c of list) {
    const at = c && c.source && typeof c.source.cell === "string" ? a1ToRowCol(c.source.cell) : null;
    if (!at || at.row < box.r0 || at.row > box.r1 || at.col < box.c0 || at.col > box.c1) continue;
    inside.push({ at, cell: { source: { ...c.source }, value: c.value ?? null, type: c.type ?? null,
                              declared: c.declared ?? null, cached: c.cached ?? null, formula: c.formula ?? null } });
  }
  inside.sort((a, b) => (a.at.row - b.at.row) || (a.at.col - b.at.col));
  return { cells: inside.map((x) => x.cell) };
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
  const safeJson = (s) => { try { return s == null ? null : JSON.parse(s); } catch { return null; } };
  if (!extent || typeof extent !== "object" || typeof extent.kind !== "string")
    return U("extent_unreadable", localize("content.notice.cited_extent_unreadable", "the cited passage's extent could not be read back from its row"));
  if (row.cited_as === "bytes")
    return U("cited_as_bytes", localize("content.notice.image_cited_as_bytes", "the passage is an image cited as its bytes, and the record holds no per-part digest of the newer capture to compare it with"));
  /* A sheet passage is compared in ONE form on both sides: its typed cells (R46's sheet arm) where both captures' readings
     hold them for its sheet, else the indexed units, so cell values never meet a unit's tab-joined rows. */
  if (extent.kind === "sheet-cell" || extent.kind === "sheet-range") {
    const both = typedCellsAt(extent, older.cells).cells && typedCellsAt(extent, newer.cells).cells;
    if (both) {
      const was = heldTextAt(extent, older), now = heldTextAt(extent, newer);
      if (was.text == null) return U(was.reason, localize("content.notice.why_so_there_is_nothing", "{why}, so there is nothing to compare", { why: String(was.why) }));
      if (now.reason === "cell_not_held")
        return out("NOT_FOUND", "text_not_found", word("content.out.newer_version_typed", { extent: String(describeExtent(extent)) }));
      if (now.text == null) return U(now.reason, localize("content.notice.in_the_newer_version_why", "in the newer version {why}", { why: String(now.why) }));
      if (now.text === was.text)
        return out("A", "identical_at_extent", word("content.out.cells_hold_byte", { extent: String(describeExtent(extent)) }), { extent, ref: row.ref });
      const sim = dice(bagOf(was.text), bagOf(now.text));
      const r = Math.round(sim * 1000) / 1000;
      return sim >= VERSION_NOTICE_SIMILAR
        ? out("C", "similar_text", word("content.out.cells_changed_word", { extent: String(describeExtent(extent)), r: String(r) }),
              { extent, ref: row.ref }, r)
        : out("NOT_FOUND", "text_not_found", word("content.out.cells_changed_past", { extent: String(describeExtent(extent)), version_notice_similar: String(VERSION_NOTICE_SIMILAR), r: String(r) }), null, r);
    }
    older = { ...older, cells: null };
    newer = { ...newer, cells: null };
  }
  const whole = extent.kind === "document";
  const cited = heldTextAt(extent, older);
  if (cited.text == null) return U(cited.reason, localize("content.notice.why_so_there_is_nothing_2", "{why}, so there is nothing to compare", { why: String(cited.why) }));
  const found = (x) => ({ extent: safeJson(x.extent), ref: x.ref });
  if (whole) {
    const complete = newer.state === "whole" && newer.units.length && !newer.units.some((u) => u.truncated);
    if (!complete)
      return U(newer.units.length ? "newer_text_partial" : "newer_text_not_held",
        localize("content.notice.the_record_does_not_hold", "the record does not hold the newer version's text whole (its index reads {said})", { said: String(said(newer.state)) }));
    const same = newer.units.length === older.units.length
      && newer.units.every((u, i) => u.extent === older.units[i].extent && u.text === older.units[i].text);
    if (same) return out("A", "identical_at_extent", localize("content.notice.every_unit_identical", "every unit of the newer version's text is byte-identical at the same position"), { extent, ref: row.ref });
    const text = newer.units.map((u) => u.text).join("\n");
    if (text === cited.text) return out("B", "identical_elsewhere", localize("content.notice.newer_text_divided", "the newer version's text is byte-identical, divided into different units"), { extent, ref: row.ref });
    const sim = dice(bagOf(cited.text), bagOf(text));
    const r = Math.round(sim * 1000) / 1000;
    return sim >= VERSION_NOTICE_SIMILAR
      ? out("C", "similar_text", word("content.out.document_text_changed", { r: String(r) }), { extent, ref: row.ref }, r)
      : out("NOT_FOUND", "text_not_found", word("content.out.document_text_changed_past", { version_notice_similar: String(VERSION_NOTICE_SIMILAR), r: String(r) }), null, r);
  }
  const here = newer.units.find((x) => x.extent === cited.extent);
  if (here && !here.truncated && here.text === cited.text)
    return out("A", "identical_at_extent", word("content.out.text_byte_identical", { extent: String(describeExtent(extent)) }),
      found(here));
  const moved = newer.units.find((x) => !x.truncated && x.text === cited.text);
  if (moved)
    return out("B", "identical_elsewhere", word("content.out.passage_text_byte", { ref: String(moved.ref) }),
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
    return out("C", "similar_text", word("content.out.text_similar_passage", { r: String(r), ref: String(best.ref) }), found(best), r);
  if (!newer.units.length)
    return U("newer_text_not_held", localize("content.notice.the_record_holds_no_text", "the record holds no text of the newer version (its index reads {said}), so where the passage went cannot be looked for", { said: String(said(newer.state)) }));
  if (newer.state !== "whole")
    return U("newer_text_partial", localize("content.notice.the_newer_versions_text_is", "the newer version's text is held only in part (its index reads {said}), so the passage may be in the part not held", { said: String(said(newer.state)) }));
  if (newer.units.some((x) => x.truncated))
    return U("newer_text_truncated", localize("content.notice.newer_unit_truncated", "a unit of the newer version is held only to the per-unit cap, so the passage may be in the part not held"));
  return out("NOT_FOUND", "text_not_found", word("content.out.newer_version_text_held", { units: String(newer.units.length), r: String(r ?? 0) }), null, r);
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
