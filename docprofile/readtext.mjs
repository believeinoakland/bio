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

/** Flatten a producer's text field to the one string the recognisers read.
 *  Exported for the suite; callers use readText(). */
export function flattenText(supplied) {
  if (typeof supplied === "string")
    return { text: supplied, source: "string", chars: supplied.trim().length, undetermined: 0, reasons: [] };
  if (!supplied || typeof supplied !== "object")
    return { text: "", source: null, chars: 0, undetermined: 0, reasons: [] };
  let text = "", source = null;
  if (typeof supplied.document === "string" && supplied.document.length) {
    text = supplied.document; source = "document";
  } else if (Array.isArray(supplied.pages) && supplied.pages.length) {
    text = supplied.pages.map((p) => (p && typeof p.text === "string" ? p.text : ""))
      .filter((t) => t.length).join("\n");
    source = "pages";
  } else if (Array.isArray(supplied.paragraphs) && supplied.paragraphs.length) {
    text = supplied.paragraphs.map((p) => (p && typeof p.text === "string" ? p.text : ""))
      .filter((t) => t.length).join("\n");
    source = "paragraphs";
  }
  /* The producer's own count when it stated one; otherwise summed from the
     markers (a Marker carries `count` per region; a marker without one is one
     region). Never invented: no markers and no count is zero. */
  const c = supplied.counts;
  const markers = Array.isArray(supplied.undetermined) ? supplied.undetermined : [];
  const undetermined = c && typeof c.undetermined === "number"
    ? c.undetermined
    : markers.reduce((n, m) => n + (m && typeof m.count === "number" ? m.count : 1), 0);
  const reasons = [...new Set(markers.map((m) => m && m.reason).filter(Boolean))];
  return { text, source, chars: text.trim().length, undetermined, reasons };
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
 *     stack, doctype, parsed, parse_error }
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
  if (typeof doctype.type.parse === "function") {
    try {
      parsed = doctype.type.parse({ ...dctx, handler: stack.handler, at: ctx.at || null }) || {};
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
    stack, doctype, parsed, parse_error,
    why: partial
      ? `read over a PARTIAL decode, stated: ${flat.undetermined} undetermined region(s)/code point(s)${named} beside ${flat.chars} decoded characters`
      : `read over a full decode (${flat.chars} characters)`,
  };
}
