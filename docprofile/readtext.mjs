/* FW-15: the ONE entry point that takes TEXT FROM ANYWHERE and reads it.
 *
 * THE GAP THIS CLOSES (LAYERS.md GAP 3, the L2→L3 wire). The bytes layer runs
 * the content and intent layers inline for HTML only: op=acquire reads the
 * primary back as text only when the content type looks textual, so a PDF gets
 * STRUCTURE through op=pdfstructure and could never get a READING — the entire
 * intent layer ran on HTML pages. But nothing about identify()/doctypeFor()/
 * parse() is HTML's: they run over TEXT, and text now arrives from several
 * producers — the acquire path's own read-back, a PDF's Tier-1 (or the
 * pdf-worker's Tier-2) extraction, an office container's paragraph walk, and
 * one day OCR (CPDF-10). This module is the single seam they all feed.
 *
 * WHAT IT TAKES. Either a bare string, or I2's `text` field exactly as a
 * producer emits it (INTERFACES.md I2, stable):
 *
 *   text.document        all pages' text, newline-joined   (PDF, xlsx, docx)
 *   text.pages[]         per-page {page, text, undetermined[]}      (PDF)
 *   text.paragraphs[]    the pageless degenerate form {para, ref, text}
 *                        office containers emit (I2 1.1.0)          (docx)
 *   text.undetermined[]  Markers naming what could NOT be decoded
 *   text.counts          { chars, undetermined }
 *
 * `document` is preferred; `pages[]` and `paragraphs[]` are accepted as
 * sources of text when a producer emits only the itemised form.
 *
 * THE HONESTY RULES, and they are the point (BUILD-ORDER FW-15):
 *
 *   - a tier that could not decode SAYS SO: the producer's own undetermined
 *     markers ride through, and the refusal names their reasons;
 *   - text-undetermined produces a FAILED reading recorded as such
 *     (determined:false, so the caller writes found:false) — never a
 *     fabricated one. The line is the plane's own measured escalation
 *     predicate: more undetermined than decoded is essentially nothing
 *     (the encrypted / whole-document-no-ToUnicode cases);
 *   - a PARTIAL decode does not SILENTLY produce a partial reading: below
 *     that line the read proceeds and the shortfall is STATED (`partial`,
 *     the counts, and the reasons are all on the result for the caller to
 *     record on the reading's basis).
 *
 * FW-17 / IC-86 — WHERE A REFERENCE WAS READ, and the same honesty rule one
 * level down. The flatten below collapses `pages[]`/`paragraphs[]` into one
 * string, which is the only place the producer's position information exists
 * and the only place it was being thrown away. It is now KEPT, as a segment map
 * (see `flattenText`), and handed to the reader as ONE TOTAL FUNCTION on its
 * ctx:
 *
 *   ctx.locate(offsetIntoTheFlatText) -> an IC-1 source | null
 *
 * A reader may emit ONLY a source `locate` gave it, never one it composed: the
 * reader knows where in the TEXT it read something and only the producer knows
 * what part of the CONTAINER that text was. `null` is a legal and meaningful
 * answer — a reading without position still writes and the absence is STATED
 * (`position_why` says whose absence it is) — and it must NEVER be read as
 * "the whole document was meant", which is the D-129 split this field exists on
 * the honest side of.
 *
 * It returns what the recognisers said — never a persisted shape. The caller
 * (op=acquire's reading assembly) owns the reading object, exactly as it does
 * for HTML text.
 *
 * ONE CAVEAT, stated so a caller does not trip on it: the STACK axis's question
 * ("which host stack served this") is really about the SERVED BYTES, which the
 * fetch path already profiled (FW-3). Run over extracted text, its handlers can
 * only speak weakly — plain text with no anchors trips the client-rendered
 * handler's structural test at `possible` confidence, for instance. So `stack`
 * here is ADVISORY context for the doctype pass, never a substitute for the
 * capture's own profile, and a caller must not read `stack.handler.shell` off
 * this result as a verdict about the document.
 */
import { identify } from "../site-profiles/index.mjs";
import { doctypeFor } from "./doctypes/registry.mjs";
import { localize } from "../bio-plane/src/setup-words/index.mjs";

/* FW-17 / IC-86 — THE SEGMENT MAP: where in the CONTAINER each stretch of the
   flat string came from.

   The flatten below is what destroys the only position information a producer
   emits. `text.pages[]` carries a page index per page and `text.paragraphs[]`
   carries the producer's own `¶N` ref, and both are joined into one string
   before any reader sees them — so a reader can say WHICH LINE it read a
   reference on and nothing can say which PAGE that line was. IC-86 is exactly
   that gap, and the map below is the whole of the fix: each entry is one
   container part's half-open span in the flat text plus its IC-1 `source`.

   ONE ARM PER SEGMENT, AND NO SIXTH SPELLING. `pages[]` maps to IC-1's
   `pdf-page` and `paragraphs[]` to `doc-para`, which are the two arms a text
   shape itemises today. `sheet-cell` and `slide-shape` have no per-cell or
   per-shape text in the I2 text shape, so a reading over an xlsx or a pptx
   honestly produces NO segments and every entity answers null. That is a stated
   gap (IC-86 names it) and not an oversight.

   `rect` IS NULL AND THAT IS THE HONEST ANSWER. I2's own Status section says
   Tier-1 text is a flat per-page string with no geometry, and asserting layout
   the extractor cannot support is the invented-structure this project forbids.
   The PAGE is in the bytes the producer emitted. The RECTANGLE is not. */

/** IC-1's `pdf-page` arm for a 0-based page index. `ref` is the 1-based human
 *  form IC-1 requires ("p.7" for page index 6). */
function pdfPageSource(page) {
  return { kind: "pdf-page", ref: `p.${page + 1}`, page, rect: null };
}

/** IC-1's `doc-para` arm. The human form is the PRODUCER'S OWN `ref` whenever it
 *  gave one — IC-1's rule is that the human form is produced by the container
 *  that knows it, so re-deriving it here would be the drift that rule prevents.
 *  Only when the producer emitted none is the documented form composed. */
function docParaSource(para, ref) {
  return { kind: "doc-para", ref: typeof ref === "string" && ref ? ref : `¶${para + 1}`,
           para, run: null };
}

/** Join an itemised text array the way I2 documents the flatten — non-empty
 *  texts, newline-joined — while recording each surviving item's span. The
 *  filter is what makes this worth doing rather than computing offsets by
 *  arithmetic: an empty page contributes NO separator, so an index computed
 *  from the page number rather than from the join would be silently wrong for
 *  every document with a blank page in it. */
function joinItemised(items, textOf, sourceOf) {
  const segments = [];
  let text = "";
  for (let i = 0; i < items.length; i++) {
    const t = textOf(items[i]);
    if (!t || !t.length) continue;
    if (text.length) text += "\n";
    const start = text.length;
    text += t;
    const source = sourceOf(items[i], i);
    if (source) segments.push({ start, end: text.length, source });
  }
  return { text, segments };
}

/** The segment map of an itemised array over a `document` string it is compared with,
 *  or null when the array's own join (joinItemised's) is not that string byte for byte.
 *  The comparison walks the document in place and builds no joined copy (R38): the
 *  answer is the one `joinItemised(...).text === document` gives, at no whole-text cost. */
function segmentsOver(document, items, textOf, sourceOf) {
  const segments = [];
  let pos = 0;
  for (let i = 0; i < items.length; i++) {
    const t = textOf(items[i]);
    if (!t || !t.length) continue;
    if (pos) {
      if (document.charCodeAt(pos) !== 10) return null;
      pos++;
    }
    if (!document.startsWith(t, pos)) return null;
    const start = pos;
    pos += t.length;
    const source = sourceOf(items[i], i);
    if (source) segments.push({ start, end: pos, source });
  }
  return pos === document.length ? segments : null;
}

/** Flatten a producer's text field to the one string the recognisers read.
 *  Exported for the suite; callers use readText().
 *
 *  FW-17 adds `segments` (the map above) and `position_why` (why the map is
 *  empty, when it is). Both are ADDITIVE: every existing field is unchanged and
 *  a caller reading only `{text, source, chars, undetermined, reasons}` sees
 *  exactly what it saw before. */
export function flattenText(supplied) {
  if (typeof supplied === "string")
    return { text: supplied, source: "string", chars: supplied.trim().length, undetermined: 0, reasons: [],
             segments: [],
             position_why: localize("docprofile.readtext.the_text_arrived_as_a", "the text arrived as a bare string, which carries no container structure, so where in the document a reference was read cannot be said") };
  if (!supplied || typeof supplied !== "object")
    return { text: "", source: null, chars: 0, undetermined: 0, reasons: [], segments: [],
             position_why: "no text was supplied" };
  let text = "", source = null, segments = [], position_why = null;
  if (typeof supplied.document === "string" && supplied.document.length) {
    text = supplied.document; source = "document";
    /* THE DOCUMENT STRING IS PREFERRED AND IT CARRIES NO POSITIONS, so the map
       has to be EARNED rather than assumed. A producer emits `document` as
       "all pages' non-empty text, newline-joined" (I2) — which is exactly the
       join above — so when the itemised form is ALSO present the two can be
       compared BYTE FOR BYTE, and only an exact match licenses laying the
       itemised map over the document string.

       THIS EQUALITY IS NOT A FREE ONE. Two independently produced strings
       agreeing character for character over tens of thousands of characters is
       evidence that the document string IS the pages concatenated; the arms
       below cost real bytes to satisfy and a producer that composes `document`
       any other way FAILS the comparison and gets no positions at all. The
       failure direction is the safe one: no map, and the absence stated. */
    const pages = Array.isArray(supplied.pages) ? supplied.pages : null;
    const paras = Array.isArray(supplied.paragraphs) ? supplied.paragraphs : null;
    if (pages && pages.length) {
      const found = segmentsOver(text, pages, (p) => (p && typeof p.text === "string" ? p.text : ""),
                                 (p) => (p && Number.isInteger(p.page) ? pdfPageSource(p.page) : null));
      if (found) segments = found;
      else position_why = localize("docprofile.readtext.this_producers_document_text_is_not_its_pages", "this producer's document text is not its pages joined, so the page a reference was read on cannot be established from it and is not guessed");
    } else if (paras && paras.length) {
      const found = segmentsOver(text, paras, (p) => (p && typeof p.text === "string" ? p.text : ""),
                                 (p, i) => docParaSource(Number.isInteger(p && p.para) ? p.para : i,
                                                         p && p.ref));
      if (found) segments = found;
      else position_why = localize("docprofile.readtext.this_producers_document_text_is_not_its_paragraphs", "this producer's document text is not its paragraphs joined, so the paragraph a reference was read in cannot be established from it and is not guessed");
    } else {
      position_why = localize("docprofile.readtext.this_producer_emitted_document_text", "this producer emitted document text with no itemised pages or paragraphs beside it, so where in the document a reference was read cannot be said");
    }
  } else if (Array.isArray(supplied.pages) && supplied.pages.length) {
    const j = joinItemised(supplied.pages, (p) => (p && typeof p.text === "string" ? p.text : ""),
                           (p) => (p && Number.isInteger(p.page) ? pdfPageSource(p.page) : null));
    text = j.text; segments = j.segments; source = "pages";
  } else if (Array.isArray(supplied.paragraphs) && supplied.paragraphs.length) {
    const j = joinItemised(supplied.paragraphs, (p) => (p && typeof p.text === "string" ? p.text : ""),
                           (p, i) => docParaSource(Number.isInteger(p && p.para) ? p.para : i, p && p.ref));
    text = j.text; segments = j.segments; source = "paragraphs";
  }
  /* A container that itemised but named no part per item (a pages[] with no
     `page` integer) produced text and no map, and the reason is different from
     the reasons above: the producer HAD the structure and did not name it. */
  if (!segments.length && !position_why && source)
    position_why = localize("docprofile.readtext.this_producers_source_carry_no", "this producer's {source} carry no part index, so where in the document a reference was read cannot be said", { source: String(source) });
  /* The producer's own count when it stated one; otherwise summed from the
     markers (a Marker carries `count` per region; a marker without one is one
     region). Never invented: no markers and no count is zero. */
  const c = supplied.counts;
  const markers = Array.isArray(supplied.undetermined) ? supplied.undetermined : [];
  const undetermined = c && typeof c.undetermined === "number"
    ? c.undetermined
    : markers.reduce((n, m) => n + (m && typeof m.count === "number" ? m.count : 1), 0);
  const reasons = [...new Set(markers.map((m) => m && m.reason).filter(Boolean))];
  return { text, source, chars: text.trim().length, undetermined, reasons,
           segments, position_why: segments.length ? null : position_why };
}

/** Build the TOTAL locator a reader is handed on its ctx (IC-86 (2)).
 *
 *  `locate(offset)` answers the IC-1 source of the container part that offset
 *  falls in, or null. It is TOTAL — an offset outside every segment, a
 *  non-number, an empty map — all answer null, because a reader must never be
 *  put in the position of handling an exception to find out it cannot say where.
 *
 *  A READER MAY ONLY EMIT WHAT THIS GIVES IT, and that is the structural form of
 *  never-invent: the reader knows where in the TEXT it read something and only
 *  the producer knows what part of the CONTAINER that text was. Exported for the
 *  suite. */
export function makeLocator(segments) {
  const segs = Array.isArray(segments) ? segments : [];
  return function locate(offset) {
    if (!segs.length || typeof offset !== "number" || !Number.isFinite(offset) || offset < 0) return null;
    /* Binary search: the spans are non-overlapping and in ascending order by
       construction (joinItemised appends). A linear scan would be correct and
       quadratic over a reader that locates every line of a 40,000-line packet. */
    let lo = 0, hi = segs.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (offset < segs[mid].start) hi = mid - 1;
      else if (offset >= segs[mid].end) lo = mid + 1;
      else return segs[mid].source;
    }
    return null;
  };
}

/* G48 (fix round 6; K4673, K4571) — A SHEET OVER A BOUND IS CLASSIFIED FROM A STATED VIEW.
   `doctypeFor` asks every registered type's `detect` about the text, and the types read what they are handed whole: over a
   17 MiB CSV's 15.6 M characters that was most of the first reading tick. A sheet's body is rows of one shape, so a type
   that recognises a table recognises it from the head and a spread of windows; a type that recognises a document by a
   phrase can still be missed by a sample, which is why the view is STATED on the answer (`classified_over`) and in `why`,
   never silent (K4571). Only a sheet container (`supplied.sheets`) is sampled; a PDF's text, a page, a paragraph shape and
   a bare string are classified whole, of any size, because their type may rest on any page. `identify` (the stack) and the
   type's `parse` keep the whole text: the stack answer never changes and a matched type reads the whole sheet.

   The numbers are protective bounds (BOB reports them, K1881), set by measure: the view is at most 1.5 MiB so that every
   `detect` is handed under the 2 MiB where the text is classified whole. */
export const CLASSIFY_WHOLE_MAX_CHARS = 2 * 1024 * 1024;
export const CLASSIFY_VIEW_MAX_CHARS = 1536 * 1024;
export const CLASSIFY_HEAD_CHARS = 256 * 1024;
export const CLASSIFY_LINE_SLACK_CHARS = 16 * 1024;
export const CLASSIFY_WINDOWS = 12;
export const CLASSIFY_WINDOW_CHARS = 96 * 1024;
export const CLASSIFY_SHEET_HEADS_MAX_CHARS = 64 * 1024;
export const CLASSIFY_SHEET_HEAD_CHARS = 16 * 1024;
const LIMITS = {
  view: CLASSIFY_VIEW_MAX_CHARS, head: CLASSIFY_HEAD_CHARS, slack: CLASSIFY_LINE_SLACK_CHARS, windows: CLASSIFY_WINDOWS,
  window: CLASSIFY_WINDOW_CHARS, sheetHeads: CLASSIFY_SHEET_HEADS_MAX_CHARS, sheetHead: CLASSIFY_SHEET_HEAD_CHARS,
};

const isHigh = (c) => c >= 0xD800 && c <= 0xDBFF;
const isLow = (c) => c >= 0xDC00 && c <= 0xDFFF;
/* A cut at `at` (the boundary between at-1 and at) that does not split a surrogate pair: an END moves back, a START forward. */
const endCut = (t, at) => (at > 0 && at < t.length && isHigh(t.charCodeAt(at - 1)) && isLow(t.charCodeAt(at)) ? at - 1 : at);
const startCut = (t, at) => (at > 0 && at < t.length && isHigh(t.charCodeAt(at - 1)) && isLow(t.charCodeAt(at)) ? at + 1 : at);
/* The end (exclusive) of the whole lines of t[from, to): at the last newline in the range, else `to` itself (a line longer
   than the range is cut at its size). */
function lineEndBefore(t, from, to) {
  if (to >= t.length || t.charCodeAt(to) === 10) return to;
  const nl = t.lastIndexOf("\n", to - 1);
  return nl > from ? nl : endCut(t, to);
}

/** The view a sheet over the bound is classified from, and what it holds (offsets are into `text`): the sheets' first lines
 *  (`sheet_heads`, under one budget), the first `head` characters cut forward to a line end, then `windows` windows of whole
 *  lines spread evenly over the rest, the last ending at the text's end; the pieces joined by one newline and never over
 *  `view` characters. `sheets` is the supplied `sheets` array: its boundaries are used only when its non-empty texts joined
 *  by a newline are `text` (as `segmentsOver` checks), else `heads_used` is false. When the pieces would pass `view`, the
 *  sheet heads are dropped first (`heads_used` false), then the earliest windows, never the last, then the head is cut back. */
export function classificationView(text, sheets = null, limits = LIMITS) {
  const n = text.length;
  let headEnd = Math.min(n, limits.head);
  if (headEnd < n && text.charCodeAt(headEnd) !== 10) {
    const nl = text.indexOf("\n", headEnd);
    headEnd = nl >= 0 && nl - headEnd <= limits.slack ? nl : endCut(text, headEnd);
  }
  const windows = [];
  const S = limits.window, W = Math.max(1, limits.windows), rest = n - headEnd;
  let prev = headEnd;
  for (let i = 0; i < W && rest > 0; i++) {
    const last = i === W - 1;
    const floor = text.charCodeAt(prev) === 10 ? prev + 1 : prev;
    const ideal = W === 1 ? n - S : headEnd + Math.floor(((rest - S) * i) / (W - 1 || 1));
    let from = Math.max(last ? n - S : ideal, floor);
    if (from > floor && text.charCodeAt(from - 1) !== 10) {
      const nl = text.indexOf("\n", from);
      from = nl >= 0 && nl - from < S ? nl + 1 : startCut(text, from);
    }
    const to = last ? n : lineEndBefore(text, from, Math.min(n, from + S));
    if (to <= from) continue;
    windows.push({ from, to });
    prev = to;
  }
  const segs = Array.isArray(sheets) && sheets.length
    ? segmentsOver(text, sheets, (x) => (x && typeof x.text === "string" ? x.text : ""), (x, i) => ({ i })) : null;
  let headsUsed = segs !== null, heads = [];
  if (segs) {
    const covered = [{ from: 0, to: headEnd }, ...windows];
    let budget = limits.sheetHeads;
    for (const sg of segs) {
      if (budget <= 0) break;
      let a = sg.start, b = Math.min(sg.end, a + Math.min(limits.sheetHead, budget));
      if (b < sg.end) b = lineEndBefore(text, a, b);
      for (const c of covered) {
        if (a >= c.from && a <= c.to) a = c.to + (text.charCodeAt(c.to) === 10 ? 1 : 0);
        else if (c.from > a && c.from < b) b = text.charCodeAt(c.from - 1) === 10 ? c.from - 1 : c.from;
      }
      if (a >= b) continue;
      heads.push({ from: a, to: b });
      budget -= b - a;
    }
  }
  const size = () => heads.concat([{ from: 0, to: headEnd }], windows).reduce((m, x) => m + x.to - x.from + 1, -1);
  if (size() > limits.view && heads.length) { heads = []; headsUsed = false; }
  while (size() > limits.view && windows.length > 1) windows.shift();
  if (size() > limits.view) {
    const room = limits.view - (size() - headEnd);
    headEnd = Math.max(0, lineEndBefore(text, 0, Math.max(0, room)));
  }
  const view = [...heads.map((x) => text.slice(x.from, x.to)), text.slice(0, headEnd), ...windows.map((x) => text.slice(x.from, x.to))].join("\n");
  return { view, of: n, chars: view.length, head_chars: headEnd, windows, sheet_heads: heads, heads_used: headsUsed };
}

/** The sentence `readText` appends to `why` when it classified a sheet from a view; code-origin words (K3930). */
export function classifiedWhy(co) {
  return localize("docprofile.readtext.the_sheet_is_over_the_bound_so_its_type_was_judged_from_a_view",
    "the sheet is over {bound} characters, so its type was judged from {chars} of its {of} characters, the first {head} and {n} windows spread across it; the stack and the reading of it are from all of it",
    { bound: String(CLASSIFY_WHOLE_MAX_CHARS), chars: String(co.chars), of: String(co.of), head: String(co.head_chars), n: String(co.windows.length) });
}

/** Run identify()/doctypeFor()/parse() over text from anywhere.
 *
 *  `supplied` — a bare string or I2's text field (see above).
 *  `ctx`      — whatever the caller knows: locator, headers, content_type, at.
 *
 *  Returns:
 *   { determined:false, why, chars, undetermined, reasons, partial }
 *     when no reading may honestly be produced (no text, or text-undetermined);
 *   { determined:true, partial, why, chars, undetermined, reasons,
 *     position_parts, position_why, stack, doctype, parsed, parse_error }
 *     when the recognisers ran — `parsed` is the doctype reader's own return
 *     (entities[] + document facts) or null with `parse_error` stating why,
 *     `stack`/`doctype` are identify()'s and doctypeFor()'s full results so the
 *     caller can record WHO read the text and how sure it was. */
export function readText(supplied, ctx = {}) {
  const flat = flattenText(supplied);
  const named = flat.reasons.length ? `: ${flat.reasons.join(", ")}` : "";
  if (!flat.chars) {
    return {
      determined: false, partial: false,
      chars: 0, undetermined: flat.undetermined, reasons: flat.reasons,
      why: flat.undetermined > 0
        ? localize("docprofile.readtext.the_text_of_this_document", "the text of this document is undetermined ({undetermined} undecodable region(s){named}); a reading over text nobody decoded would be an invented one", { undetermined: String(flat.undetermined), named: String(named) })
        : localize("docprofile.readtext.no_text_was_supplied_so_no", "no text was supplied, so no reading was attempted"),
    };
  }
  /* The plane's measured essentially-nothing line (needsTier2's predicate, the
     CPDF-5 buckets): more undetermined than decoded chars. Below it a document
     with a stated residue still reads (a budget book at ~88% is usable and the
     residue is stated); above it a reading would be built on a fragment and
     silently misrepresent the document. */
  if (flat.undetermined > flat.chars) {
    return {
      determined: false, partial: true,
      chars: flat.chars, undetermined: flat.undetermined, reasons: flat.reasons,
      why: localize("docprofile.readtext.the_tier_that_produced_this", "the tier that produced this text could not decode most of it ({undetermined} undetermined against {chars} decoded{named}); a reading over the fragment would silently misrepresent the document", { undetermined: String(flat.undetermined), chars: String(flat.chars), named: String(named) }),
    };
  }
  /* R38: `pages` is the supplied pages, the very array the caller gave (as `ctx.supplied`
     hands the reader), beside `text`, so a type can scan a very large text a page at a
     time; `[]` where the supplied text carries none (a bare string, a paragraph shape). */
  const pages = supplied && typeof supplied === "object" && Array.isArray(supplied.pages) ? supplied.pages : [];
  const dctx = { ...ctx, text: flat.text, pages };
  const stack = identify(dctx);
  /* G48: a sheet over the bound is classified from a stated view; the stack and `parse` below keep the whole text. */
  const sheets = supplied && typeof supplied === "object" && Array.isArray(supplied.sheets) ? supplied.sheets : null;
  const sampled = sheets && flat.text.length > CLASSIFY_WHOLE_MAX_CHARS ? classificationView(flat.text, sheets) : null;
  const doctype = doctypeFor({ ...dctx, text: sampled ? sampled.view : flat.text, handler: stack.handler, kind: stack.kind });
  let parsed = null, parse_error = null;
  /* FW-17 / IC-86 (2): the reader is GIVEN the locator, on the SAME ctx it
     already reads `text` off. It is on the doctype ctx only — `identify()` and
     `doctypeFor()` answer questions about the whole document and have no use
     for it, and putting it where it is not needed invites a consumer to depend
     on it where it will not be. `locate` is always a function, even when the
     map is empty, so a reader writes `ctx.locate(i)` with no guard and gets the
     honest null. */
  const locate = makeLocator(flat.segments);
  if (typeof doctype.type.parse === "function") {
    try {
      /* FW-18 / M0-32 — WHAT ELSE THIS DOCUMENT IS, handed to the reader on the same
         ctx it already reads `text` and `locate` off. The census measured that 52 of
         600 sampled documents satisfy more than one class, and `makeRegistry`'s
         `recognise` stops at the first CERTAIN detection so its own `considered` list
         cannot report a second one. `doctypeFor` has already asked every type
         independently (`doctypes/registry.mjs`, `also`); this passes that answer down
         so a reader can state it as a document FACT, which is the surface a member
         sees. It is a plain list, computed once, and no reader is obliged to use it. */
      const alsoSatisfies = () => (doctype.also || []).map((x) => x.key);
      /* R37 (K1520): the supplied text's own STRUCTURE, beside the flat `text` and
         `locate` — its pages (one with no text layer included), its undetermined
         markers, images, an `ocr` transcription where the caller supplied one, a
         sheet's typed `cells` — handed UNCHANGED, the very object the caller gave, so a
         reader that needs what the flatten drops reads it from the producer, never from
         a copy this module re-shaped. A bare string carries no structure (R21): null. */
      const structure = supplied && typeof supplied === "object" ? supplied : null;
      parsed = doctype.type.parse({ ...dctx, handler: stack.handler, at: ctx.at || null,
                                    locate, alsoSatisfies, supplied: structure }) || {};
    } catch (e) {
      parse_error = String((e && e.message) || e);
    }
  } else {
    parse_error = localize("docprofile.readtext.the_key_content_type_declares", "the {key} content type declares no reader", { key: String(doctype.type.key) });
  }
  const partial = flat.undetermined > 0;
  const classified_over = sampled && { chars: sampled.chars, of: sampled.of, head_chars: sampled.head_chars,
    windows: sampled.windows, sheet_heads: sampled.sheet_heads, heads_used: sampled.heads_used };
  const why = partial
    ? localize("docprofile.readtext.read_over_a_partial_decode", "read over a PARTIAL decode, stated: {undetermined} undetermined region(s)/code point(s){named} beside {chars} decoded characters", { undetermined: String(flat.undetermined), named: String(named), chars: String(flat.chars) })
    : localize("docprofile.readtext.read_over_a_full_decode", "read over a full decode ({chars} characters)", { chars: String(flat.chars) });
  return {
    determined: true, partial,
    chars: flat.chars, undetermined: flat.undetermined, reasons: flat.reasons,
    text_from: flat.source,
    /* FW-17: WHETHER POSITION WAS AVAILABLE AT ALL, so the caller can state the
       absence on the reading's basis rather than leaving a null column looking
       like a reader that did not bother. `position_parts` is the map's size —
       a floor on what a reader could have said — and `position_why` is the
       producer-side reason when there is none. */
    position_parts: flat.segments.length, position_why: flat.position_why || null,
    stack, doctype, parsed, parse_error,
    ...(classified_over ? { classified_over } : {}),
    why: classified_over ? `${why}; ${classifiedWhy(classified_over)}` : why,
  };
}
