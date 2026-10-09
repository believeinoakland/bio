/* run-productions: reading inside a held document, the pure half (requirements R21, R23, R24; T41-24, N820; D2, D4,
 * D22). Where a proposal's place sits among a capture's text units, how a reading is cut into pages, and how a proposed
 * connection's link is established. No store, no clock: `index.mjs` reads the units (extraction R36) and the
 * references the registered readers found (extraction R58) and hands them here.
 *
 * THE TEXT A QUOTE IS CHECKED AGAINST IS THE UNIT CONTAINING ITS PLACE (K2463, EXTRACTION #18 J2): a capture's units are
 * coarser than a proposal's position (a page, a paragraph, a slide, a sheet's used range, against a rect, a run, a
 * shape or a cell), so the unit that holds the place is the text at that place the record keeps. A unit is held to its
 * per-unit cap (`truncated`), so a quote past the cap is simply not found there and reads unverified. */

import { readingSource } from "../textchain.mjs";

/** R21: what a proposed connection may connect a passage to (Investigation §5, D2). */
export const CONNECTION_TARGET_KINDS = Object.freeze(["body", "person", "document", "question"]);

/** R21: how a link is established, and the letter each earns (AI Roles §3 rule 3, Part II §14.4): the source's own
 *  link A, a shared identifier B, a name or a date C. There is no row for D: the machine never mints one. */
export const CONNECTION_HOW = Object.freeze({ source_link: "A", shared_identifier: "B", name: "C", date: "C" });

/** R24: "a few pages at a time". */
export const READ_PAGES_AT_A_TIME = 5;
/** R24: a document read by paragraphs has no pages of its own, so this many paragraphs are read, and counted against
 *  the `pages` bound, as one page. */
export const DOC_PARAS_PER_PAGE = 40;
/** R24: the modes whose runs read inside documents (run-rules R26). */
export const READING_RUN_MODES = Object.freeze(["extract", "investigate"]);

/** R23: a bearing note's bounds. */
export const BEARING_SENTENCES_MAX = 40;
export const BEARING_SENTENCE_MAX_CHARS = 1000;
/** R22: a member's own words at acceptance. */
export const ACCEPT_WORDS_MAX = 2000;

const COLUMN = /^\$?([A-Za-z]{1,3})\$?(\d{1,7})$/;
function cellAt(s) {
  const m = COLUMN.exec(String(s ?? "").trim());
  if (!m) return null;
  let col = 0;
  for (const ch of m[1].toUpperCase()) col = col * 26 + (ch.charCodeAt(0) - 64);
  return { col, row: Number(m[2]) };
}

/** Whether an A1 `cell` lies inside an A1 `range` ("B2:D9", or one cell). */
export function cellInRange(cell, range) {
  const [a, b = a] = String(range ?? "").split(":");
  const p = cellAt(cell), x = cellAt(a), y = cellAt(b);
  if (!p || !x || !y) return false;
  return p.col >= Math.min(x.col, y.col) && p.col <= Math.max(x.col, y.col)
    && p.row >= Math.min(x.row, y.row) && p.row <= Math.max(x.row, y.row);
}

/** The unit (extraction R36's `{extent, ref, text, truncated, seq}`) containing a reading position, or null: the same
 *  page, paragraph or slide, or, for a cell, the sheet range that holds it. */
export function unitContaining(units, source) {
  const pos = readingSource(source);
  if (!pos) return null;
  for (const u of Array.isArray(units) ? units : []) {
    const x = u && u.extent;
    if (!x || typeof u.text !== "string") continue;
    if (pos.kind === "pdf-page" && x.kind === "pdf-page" && x.page === pos.page) return u;
    if (pos.kind === "doc-para" && x.kind === "doc-para" && x.para === pos.para) return u;
    if (pos.kind === "slide-shape" && x.kind === "slide-shape" && x.slide === pos.slide) return u;
    if (pos.kind === "sheet-cell" && x.kind === "sheet-range" && x.sheet === pos.sheet && cellInRange(pos.cell, x.range))
      return u;
  }
  return null;
}

/** R24: a capture's units cut into the pages a reading proceeds by, in reading order: a pdf page, a slide, a sheet, or
 *  `DOC_PARAS_PER_PAGE` paragraphs. Each page is `{page, ref, text, truncated}`, `page` its index in this list (what
 *  `from` counts), `text` its units' text joined by a line feed. */
export function pagesOf(units) {
  const groups = new Map();
  for (const u of Array.isArray(units) ? units : []) {
    const x = u && u.extent;
    if (!x || typeof u.text !== "string") continue;
    const key = x.kind === "pdf-page" ? `p${x.page}`
      : x.kind === "slide-shape" ? `s${x.slide}`
      : x.kind === "sheet-range" ? `r${x.sheet}`
      : x.kind === "doc-para" ? `d${Math.floor(x.para / DOC_PARAS_PER_PAGE)}`
      : null;
    if (key === null) continue;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(u);
  }
  return [...groups.values()].map((us, page) => ({
    page,
    ref: us.length === 1 ? us[0].ref : `${us[0].ref}–${us.at(-1).ref}`,
    text: us.map((u) => u.text).join("\n"),
    truncated: us.some((u) => u.truncated),
  }));
}

/** R21: how a proposed connection's link is established, from what it names: `{letter, grounds}`, or null when it
 *  names no way the record recognises. `readerRefs` is the set of references the registered readers found in the
 *  capture (extraction R58's `reading_refs`); an identifier, name or date must stand in the connection's own quote. */
export function connectionLink(c, readerRefs) {
  const how = typeof c?.how === "string" ? c.how : "";
  if (!Object.prototype.hasOwnProperty.call(CONNECTION_HOW, how)) return null;
  const quote = typeof c.quote === "string" ? c.quote : "";
  const named = (v) => (typeof v === "string" && v.trim() !== "" ? v : null);
  if (how === "source_link") {
    const ref = named(c.ref);
    return ref && readerRefs.has(ref) ? { letter: CONNECTION_HOW[how], grounds: ref } : null;
  }
  const field = how === "shared_identifier" ? "key" : how;
  const v = named(c[field]);
  return v && quote.includes(v) ? { letter: CONNECTION_HOW[how], grounds: v } : null;
}
