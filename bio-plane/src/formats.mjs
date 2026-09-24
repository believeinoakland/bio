/* The FORMAT registry (I7, COFF-1) — the third axis, and the D-70 test.
 *
 * `BIO_Content_Framework_v0_10.md` §4 claims a new axis of variation costs a
 * registry entry rather than a rewrite, and D-70 records that the claim was
 * never exercised: no third axis had been added. FORMAT is that axis. This
 * module is the ONE place a format is known — one entry per format, and once
 * this landed the registry became the only dispatch: no format-specific
 * if-branch outside it at either dispatch site (acquire-time detection in
 * index.mjs's subresource branch, read-time structure in op=pdfstructure).
 * Adding a format is `registerFormat(entry)` here and NOTHING anywhere else;
 * `formats.test.mjs` proves it with a test-only stub that becomes reachable
 * through detect→structure with zero edits outside this file.
 *
 * THE ENTRY SHAPE (I7, confirmed from this file as built):
 *
 *   format      string — the registry key ("html", "pdf", ...).
 *   detect(bytes, contentType) -> { format, confidence, signals } | null
 *               REQUIRED. Called by detectFormat() in TWO passes — bytes only,
 *               then content type only — so magic-bytes-first is enforced by
 *               the REGISTRY, structurally, not left to each entry's manners.
 *               A byte-signature match answers `certain`; a content-type-only
 *               match answers `likely` at best. null = "not mine".
 *   parts(container) -> named parts | null
 *               The container walk. null for formats that are their own
 *               container (PDF: structure() takes the assembled bytes) —
 *               COFF-2's OOXML reader is the first real implementor.
 *   structure(parts) -> the I2 shape (links + element references) | null
 *               null for formats whose structure is produced elsewhere (HTML:
 *               at acquire time, by the subresource walk in subresources.mjs,
 *               which needs the live-fetch context this read-time seam does
 *               not have).
 *   text(parts) -> the I2 text shape | null
 *               null when text rides structure()'s own output object (PDF:
 *               CPDF-4's Tier 1 text extends the same I2 object — the
 *               do-not-fork rule in pdfstructure.mjs).
 *
 * Doctrine carried from the axes already built (I7):
 *   - MAGIC BYTES FIRST, content type second. A source's declared Content-Type
 *     is frequently wrong and may be absent (I1).
 *   - `undetermined` is first-class: nothing matched -> a STATED undetermined
 *     with the reasons in `signals`, never a guessed format.
 *   - An entry asserts nothing about MEANING (FRAMEWORK's, through I2) and
 *     WRITES nothing (the fleet rule, one layer down).
 */

import { extractPdfStructure } from "./pdfstructure.mjs";
import { docxEntry } from "./docx.mjs";
import { xlsxEntry } from "./formats-xlsx.mjs";
import { pptxEntry } from "./pptx.mjs";
import { odtEntry, odsEntry, odpEntry } from "./odf.mjs";
import { csvEntry } from "./csv.mjs";

/* Registration order is dispatch order within a pass: the first entry whose
   detect() answers wins that pass. Kept insertion-ordered by Map. */
const REGISTRY = new Map();

export function registerFormat(entry) {
  if (!entry || typeof entry.format !== "string" || !entry.format)
    throw new Error("a format entry must name its format");
  if (typeof entry.detect !== "function")
    throw new Error(`format "${entry.format}": detect(bytes, contentType) is required`);
  for (const slot of ["parts", "structure", "text"]) {
    if (entry[slot] != null && typeof entry[slot] !== "function")
      throw new Error(`format "${entry.format}": ${slot} must be a function or null`);
  }
  if (REGISTRY.has(entry.format))
    throw new Error(`format "${entry.format}" is already registered; unregister it first`);
  REGISTRY.set(entry.format, entry);
  return entry;
}

/* Exists for this registry's OWN suite (the stub teardown and the automated
   half of the negative control). It touches only in-memory dispatch; the
   record holds no registry state to corrupt. Returns the removed entry so a
   test can restore exactly what it took out. */
export function unregisterFormat(format) {
  const entry = REGISTRY.get(format) || null;
  REGISTRY.delete(format);
  return entry;
}

export function getFormat(format) {
  return REGISTRY.get(format) || null;
}

export function listFormats() {
  return [...REGISTRY.keys()];
}

/* The registry-level recogniser. TWO passes, and the order is the doctrine:
 *
 *   pass 1 — bytes only.        Every entry is asked detect(bytes, null).
 *   pass 2 — content type only. Every entry is asked detect(null, contentType).
 *
 * So a byte signature ALWAYS outranks a declared content type, whatever any
 * individual entry does — a renamed plain ZIP is not a .docx, and a PDF served
 * as text/html is a PDF. Nothing matched -> a stated `undetermined` carrying
 * WHY in signals, never a guess.
 *
 * Either argument may be absent (null): the acquire-time subresource guard
 * consults with the content type only, because at that seam the primary has
 * deliberately not been read back yet; the profile stamp consults with both.
 */
export function detectFormat(bytes, contentType) {
  const b = bytes instanceof Uint8Array && bytes.length ? bytes : null;
  const ct = typeof contentType === "string" && contentType ? contentType : null;
  if (b) {
    for (const entry of REGISTRY.values()) {
      const r = entry.detect(b, null);
      if (r && r.format) return r;
    }
  }
  if (ct) {
    for (const entry of REGISTRY.values()) {
      const r = entry.detect(null, ct);
      if (r && r.format) return r;
    }
  }
  return {
    format: "undetermined",
    confidence: "none",
    signals: [
      b ? "no registered magic-byte signature matched" : "no bytes were available to sniff",
      ct ? `content type "${ct}" matched no registered format` : "no content type was declared",
    ],
  };
}

/* ------------------------------------------------------------------ *
 * The entries. HTML and PDF — the two formats the plane already spoke,
 * moved onto the registry by COFF-1 with NO new capability.
 * ------------------------------------------------------------------ */

const LATIN1 = new TextDecoder("latin1");

/* The exact pair the acquire-time guard compared against before COFF-1 moved
   it here (index.mjs's former HTML_CT constant). Compared EXACTLY, not
   case-folded, so the guard's behaviour is byte-identically what it was. */
const HTML_CONTENT_TYPES = ["text/html", "application/xhtml+xml"];

registerFormat({
  format: "html",
  detect(bytes, contentType) {
    if (bytes) {
      /* The WHATWG-ish sniff, conservative: a doctype or an <html> tag inside
         the first KiB. Case-insensitive because doctype case is free in HTML. */
      const head = LATIN1.decode(bytes.subarray(0, 1024)).toLowerCase();
      if (head.includes("<!doctype html") || head.includes("<html"))
        return { format: "html", confidence: "certain",
                 signals: ["magic: doctype/root tag in the first 1024 bytes"] };
      return null;
    }
    if (contentType && HTML_CONTENT_TYPES.includes(contentType))
      return { format: "html", confidence: "likely",
               signals: [`content type "${contentType}"`] };
    return null;
  },
  /* HTML structure is produced at ACQUIRE time by the subresource walk
     (subresources.mjs), which needs the live-fetch context a read-time entry
     does not have. The registry consult at that site is detection only; the
     subresource branch stays HTML-only in behaviour (COFF-1's pin). */
  parts: null,
  structure: null,
  text: null,
});

registerFormat({
  format: "pdf",
  detect(bytes, contentType) {
    if (bytes) {
      /* %PDF- within the first 1024 bytes — the same window extractPdfStructure
         itself accepts, so detect and structure cannot disagree about what a
         PDF is. */
      if (LATIN1.decode(bytes.subarray(0, 1024)).includes("%PDF-"))
        return { format: "pdf", confidence: "certain",
                 signals: ["magic: %PDF- header in the first 1024 bytes"] };
      return null;
    }
    if (contentType === "application/pdf")
      return { format: "pdf", confidence: "likely",
               signals: ['content type "application/pdf"'] };
    return null;
  },
  /* A PDF is its own container: structure() takes the assembled bytes, so a
     separate parts() walk would be a slot with nothing to do. */
  parts: null,
  /* pdfstructure.mjs IS the PDF entry (COFF-1). Byte-identical output: this is
     the same function op=pdfstructure always called, now reached through the
     registry instead of a direct import in index.mjs. */
  structure: (bytes) => extractPdfStructure(bytes),
  /* Tier 1 text rides structure()'s own I2 output object (`text` on the same
     object — pdfstructure.mjs's do-not-fork rule), so a second entry point
     would be a fork of exactly the kind that rule exists to prevent. */
  text: null,
});

/* docx.mjs IS the DOCX entry (COFF-4): detect's confidence ladder, the parts
   walk over ooxml.mjs, I2 structure through the ONE linkWrapper with
   {kind:"doc-para"} references (IC-1), <w:t> text in body order, and the
   DEC-5 evidentiary envelope (tracked changes, comments, core properties). */
registerFormat(docxEntry);

/* The XLSX entry (COFF-3) — defined in formats-xlsx.mjs, registered here and
   NOWHERE else: adding the format costs this one call (the D-70 property). */
registerFormat(xlsxEntry);

/* pptx.mjs IS the PPTX entry (COFF-5): the same detect ladder, the parts walk
   over ooxml.mjs, I2 structure through the ONE linkWrapper with
   {kind:"slide-shape"} references (IC-1), <a:t> text per slide, and the DEC-5
   evidentiary envelope (SPEAKER NOTES distinct from slide text, core
   properties). */
registerFormat(pptxEntry);

/* THE THREE OPENDOCUMENT ENTRIES (COFF-10, 2026-09-14) — `odf.mjs`, reading
   COFF-9's `partMap:"odf"` discrimination and ONE `content.xml` part into the
   SAME I2 shape and DEC-5 envelope the OOXML sibling of each kind produces:
   `.odt` → docx.mjs's paragraphs and `doc-para` references, `.ods` →
   formats-xlsx.mjs's sheets and `sheet-cell` references, `.odp` → pptx.mjs's
   slides and `slide-shape` references. No new IC-1 union member; I7 is
   CONFIRMED by three more entries in the existing shape, not changed.
   Warranted by Bob's 2026-09-14 Drive ruling (a Drive link keeps the link and
   the harvest is the OpenDocument export), not by the census — COFF-6's ZERO
   native ODF assets in 43,282 keys stands unrevised.

   THESE THREE CALLS ARE THE ENTIRE COST OF THE FORMAT, which is the D-70
   property this registry exists to keep: `index.mjs` never learns the names
   "odt", "ods" or "odp", and `formats-odf.test.mjs` asserts that by grepping
   the source for them and finding none. Registration order matters only
   within a pass, and these three cannot collide with each other — each
   answers on its own `mimetype` value, compared exactly. */
registerFormat(odtEntry);
registerFormat(odsEntry);
registerFormat(odpEntry);

/* THE CSV ENTRY (FW-23, 2026-09-24) — `csv.mjs`, designed by BOB #32 and
   written from a MEASURED page: all 166 `.csv` keys of `s3://cao-94612`,
   fetched whole (M-144). It is the ninth entry and the first that is NOT a
   container: one sheet, `sheet-cell` / `sheet-range` references (no new IC-1
   union member), the delimiter and the encoding found by SIGNATURE and
   recorded on the reading, undetermined when the bytes do not tell.

   ITS DETECT ANSWERS ONLY IN PASS 2, ON PURPOSE AND FROM A MEASUREMENT: a CSV
   has no magic bytes, and the shape a byte signature would match is a shape
   PROSE WEARS — 5 of 8 planted non-CSV text shapes fired the candidate
   signature, a hard-wrapped paragraph among them. So `csvEntry.detect`
   returns null for ANY bytes and the format is claimed from the declared
   content type alone, which 166 of 166 corpus keys carried. Registration
   order is therefore immaterial for this entry in pass 1, and in pass 2 no
   registered entry claims `text/csv`. */
registerFormat(csvEntry);
