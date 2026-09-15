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
import { identify } from "./index.mjs";
import { doctypeFor } from "./doctypes/registry.mjs";

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
             position_why: "the text arrived as a bare string, which carries no container structure, so "
                         + "where in the document a reference was read cannot be said" };
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
      const j = joinItemised(pages, (p) => (p && typeof p.text === "string" ? p.text : ""),
                             (p) => (p && Number.isInteger(p.page) ? pdfPageSource(p.page) : null));
      if (j.text === text) segments = j.segments;
      else position_why = "this producer's document text is not its pages joined, so the page a reference "
                        + "was read on cannot be established from it and is not guessed";
    } else if (paras && paras.length) {
      const j = joinItemised(paras, (p) => (p && typeof p.text === "string" ? p.text : ""),
                             (p, i) => docParaSource(Number.isInteger(p && p.para) ? p.para : i,
                                                     p && p.ref));
      if (j.text === text) segments = j.segments;
      else position_why = "this producer's document text is not its paragraphs joined, so the paragraph a "
                        + "reference was read in cannot be established from it and is not guessed";
    } else {
      position_why = "this producer emitted document text with no itemised pages or paragraphs beside it, "
                   + "so where in the document a reference was read cannot be said";
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
    position_why = `this producer's ${source} carry no part index, so where in the document a reference `
                 + "was read cannot be said";
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
        ? `the text of this document is undetermined (${flat.undetermined} undecodable region(s)${named}); a reading over text nobody decoded would be an invented one`
        : "no text was supplied, so no reading was attempted",
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
      why: `the tier that produced this text could not decode most of it (${flat.undetermined} undetermined against ${flat.chars} decoded${named}); a reading over the fragment would silently misrepresent the document`,
    };
  }
  const dctx = { ...ctx, text: flat.text };
  const stack = identify(dctx);
  const doctype = doctypeFor({ ...dctx, handler: stack.handler, kind: stack.kind });
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
      parsed = doctype.type.parse({ ...dctx, handler: stack.handler, at: ctx.at || null,
                                    locate, alsoSatisfies }) || {};
    } catch (e) {
      parse_error = String((e && e.message) || e);
    }
  } else {
    parse_error = `the ${doctype.type.key} content type declares no reader`;
  }
  const partial = flat.undetermined > 0;
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
    why: partial
      ? `read over a PARTIAL decode, stated: ${flat.undetermined} undetermined region(s)/code point(s)${named} beside ${flat.chars} decoded characters`
      : `read over a full decode (${flat.chars} characters)`,
  };
}
