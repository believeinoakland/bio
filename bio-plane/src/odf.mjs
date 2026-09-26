/* The three OpenDocument registry entries (I7, QUEUE COFF-10) — `.odt`,
 * `.ods`, `.odp` — built on COFF-9's ODF flavour row in `ooxml.mjs` and
 * emitting the SAME I2 shape and DEC-5 evidentiary envelope the OOXML sibling
 * of the same kind produces.
 *
 * WHY THEY ARE HERE AT ALL. COFF-6 measured ZERO native ODF assets in 43,282
 * oaklandca.gov keys and ruled DO NOT BUILD. That measurement is UNREVISED
 * and still true of native ODF in the wild. What changed is the SOURCE: Bob
 * ruled on 2026-09-14 that a Google Drive link KEEPS THE LINK and the harvest
 * is the OpenDocument EXPORT, which makes ODF the HARVEST format rather than
 * a published one. CAP-8 builds the capture side; without these entries the
 * export would be a document HELD and never READ, which is exactly the
 * document-is-not-the-answer failure `CLAUDE.md` names.
 *
 * WHY ONE MODULE FOR THREE FORMATS, and it is not a shortcut. OOXML is three
 * containers with three part maps — `word/document.xml`, `xl/workbook.xml` +
 * n worksheets, `ppt/presentation.xml` + n slides + n notesSlides — so
 * `docx.mjs`, `formats-xlsx.mjs` and `pptx.mjs` are three container walks.
 * OpenDocument is ONE container walk: `mimetype` says which document kind it
 * is and `content.xml` carries the WHOLE document — body, sheets, slides,
 * speaker notes, tracked changes, annotations and the automatic styles that
 * declare hiddenness, all in one part. The three entries therefore share one
 * `odfParts()` and differ only in the PROJECTION they take of it. Splitting
 * that into three files would triplicate the container walk to keep the
 * filenames tidy.
 *
 * ------------------------------------------------------------------------
 * WHAT EACH ENTRY EMITS, and the sibling whose shape it lands in
 * ------------------------------------------------------------------------
 *
 *   .odt  → `docx.mjs`'s shape.  structure(): {ok, container:"odt",
 *           paragraphs:<int>, links, counts, evidentiary, notes};
 *           text(): {ok, container:"odt", document, paragraphs:[{para, ref,
 *           text}], undetermined, counts:{chars, undetermined}}.
 *           Element references are IC-1's `doc-para`, built by IMPORTING
 *           `docParaRef` from `docx.mjs` — not re-derived here.
 *
 *   .ods  → `formats-xlsx.mjs`'s shape.  structure(): {ok, container:"ods",
 *           sheets:[{sheet, name, sheetId, state, hidden}], links, counts,
 *           evidentiary, notes};
 *           text(): {ok, container:"ods", document, sheets:[{sheet, name,
 *           hidden, text, undetermined}], undetermined,
 *           counts:{chars, cells, formulas, undetermined}}.
 *           Element references are IC-1's `sheet-cell`, built by IMPORTING
 *           `sheetCellRef` from `formats-xlsx.mjs`.
 *
 *   .odp  → `pptx.mjs`'s shape.  structure(): {ok, container:"odp",
 *           slides:<int>, links, counts, evidentiary, notes};
 *           text(): {ok, container:"odp", document, slides:[{slide, ref,
 *           part, hidden, shapes, text}], speakerNotes:[{slide, ref, part,
 *           hidden, text}], deckLength:<int|null> (COFF-13; null when the
 *           body was not read), undetermined, counts:{chars, notesChars,
 *           undetermined}}.
 *           Element references are IC-1's `slide-shape`, built by IMPORTING
 *           `slideShapeRef` from `pptx.mjs`.
 *
 * NO NEW IC-1 UNION MEMBER WAS NEEDED and none is invented: an OpenDocument
 * text document has paragraphs, a spreadsheet has cells, a presentation has
 * slides and shapes, and those are precisely the three arms IC-1 resolved.
 * I7 is therefore CONFIRMED by three more entries in the existing shape, not
 * changed.
 *
 * Link partitions come from the ONE `linkWrapper` imported from
 * `subresources.mjs` — the same parity pin `pdfstructure.mjs`, `docx.mjs`,
 * `formats-xlsx.mjs` and `pptx.mjs` all make, so FRAMEWORK consumes an
 * OpenDocument export through the identical code path as an HTML page.
 *
 * ------------------------------------------------------------------------
 * THE DEC-5 EVIDENTIARY EXTRAS: WHAT `content.xml` CARRIES, AND WHAT IT
 * CANNOT — STATED PER ENTRY RATHER THAN LEFT TO BE INFERRED FROM SILENCE
 * ------------------------------------------------------------------------
 *
 * This is the part that matters most, because the failure mode here is not a
 * crash: it is a consumer reading an ABSENT envelope item as a fact about the
 * DOCUMENT. `CLAUDE.md`'s sparse-at-every-level rule says absence at one
 * level is never evidence of absence at the next, so every extra this entry
 * does not read is carried as a NAMED `undetermined` in the envelope rather
 * than simply not emitted.
 *
 * MEASURED against real LibreOffice 26.8.0.3 output on 2026-09-14
 * (MEASUREMENTS.md), not read off the spec:
 *
 *   CARRIED BY content.xml, and emitted:
 *     .odt  tracked changes — `<text:tracked-changes>` holds each region's
 *           `<office:change-info>` (author, date) and, for a deletion, the
 *           SUPERSEDED WORDING itself; the body carries `<text:change-start>`
 *           / `<text:change-end>` / `<text:change>` marks that locate it to a
 *           paragraph. Exactly the docx `tracked-change` item, same kind name.
 *     .odt  comments — ODF's `<office:annotation>`, inline in the paragraph
 *           it annotates, with `<dc:creator>` and `<dc:date>`. Emitted as the
 *           same `comment` kind docx emits.
 *     .ods  formulas BESIDE cached values — `table:formula` on the cell,
 *           carried VERBATIM including OpenFormula's `of:` prefix, beside the
 *           displayed value as two named fields on one item. Never collapsed,
 *           never substituted into the text stream.
 *     .ods  hidden sheets — a table whose style declares
 *           `table:display="false"`. The style is in content.xml's own
 *           `<office:automatic-styles>`, so this IS readable from the one
 *           part. VERIFIED on real output: LibreOffice writes the flag on the
 *           table's STYLE, never on the `<table:table>` element; both are
 *           read, because a producer may do either.
 *     .ods  hidden rows and columns — `table:visibility="collapse"|"filter"`.
 *     .odp  SPEAKER NOTES — `<presentation:notes>` nested inside the page.
 *           Emitted as pptx's `speaker-notes` kind, kept OUT of `document`
 *           and counted apart, so no indexer can conflate them with slide
 *           text.
 *     .odp  hidden slides — `presentation:visibility="hidden"`, on the page's
 *           drawing-page style in automatic styles (where LibreOffice writes
 *           it) or on the page element. Extracted in full and FLAGGED.
 *
 *   NOT CARRIED BY content.xml, and READ FROM THEIR OWN PARTS (D-346,
 *   2026-09-25 — until then each was stated in `evidentiary.undetermined` as
 *   `outside_content_xml_not_read`, and both markers are gone because both
 *   parts are now read):
 *     core-properties (creator, title, created/modified, revision) live in
 *           `meta.xml`. Emitted as the SAME `core-properties` item, with the
 *           SAME fields and no others, that the OOXML entries build from
 *           `docProps/core.xml` — mapped by MEANING, not by element name,
 *           because ODF's `dc:creator` is the last editor (`parseOdfMeta`).
 *           A package WITHOUT meta.xml (OpenDocument permits it) is stated as
 *           `{part:"meta.xml", why:"part_absent"}`, so a missing item is
 *           never read as "this document has no author".
 *     embedded members (`Object 1/…`, an OLE blob, `ObjectReplacements/`)
 *           are listed in `META-INF/manifest.xml`, walked, and content-
 *           addressed into `intra` by sha256 exactly as the OOXML entries
 *           address `embeddings/`. Images under `Pictures/` are `text()`'s
 *           IC-124 `images`, not `intra` (`manifestIntraLinks` states the
 *           rule and what it cannot see).
 *
 *   DOES NOT EXIST IN OPENDOCUMENT AT ALL, as distinct from not read:
 *     a sheet's numeric id (xlsx's `sheetId`) — ODF identifies a table by
 *           name only, so `sheetId` is null and that null is the format
 *           speaking, not this reader.
 *     "veryHidden" — ODF's table visibility is a boolean, so `state` is
 *           "visible" or "hidden" and never xlsx's third value.
 *     a run index on a `doc-para` reference — `<text:span>` is a formatting
 *           artifact exactly as `<w:r>` is, but it is NOT the same unit, and
 *           emitting a span index under the field docx fills with a run index
 *           would assert a correspondence nothing established. References
 *           from these entries carry `para` and stop there (IC-1 makes `run`
 *           optional for precisely this reason).
 *
 * THE DETECT LADDER is the siblings' ladder, with ONE difference forced by
 * the format and named where it is made (see `detectOdf`): the OOXML entries
 * answer "likely" from part NAMES because their discriminating declaration is
 * deflated out of a synchronous detect's reach. ODF's discriminating
 * declaration — the `mimetype` member — is required by OpenDocument 1.2 part
 * 3 §3.3 to be FIRST and STORED, so it is reachable synchronously, and the
 * entries answer from the VALUE. Reading part names alone would be worse than
 * imprecise here: all three flavours have identical part names, so a
 * names-only ladder would make the first-registered entry claim every
 * OpenDocument package.
 *
 * THE SIZE BOUND is COFF-6's measured metric enacted in `ooxml.mjs`: 20 MiB
 * of DECLARED UNCOMPRESSED text-part bytes, summed from the central directory
 * BEFORE inflation. For ODF the text part is `content.xml` alone. Over the
 * bound the container walk and discrimination still run and text extraction
 * is refused as a STATED text-undetermined carrying the guard's own marker
 * verbatim — the docx.mjs pattern, never a silent truncation.
 *
 * This module ASSERTS nothing about meaning (FRAMEWORK's, through I2) and
 * WRITES nothing. Never invent structure: everything unreadable is stated.
 */

import {
  hasZipMagic, readContainer, readPart, normalizePartName, crc32,
  discriminate, sizeGuard, declaredTextBytes, IMAGE_MIME_BY_EXT,
  CONTAINER_FLAVOURS, ODF_MIMETYPE_PART, ODF_MANIFEST_PART, ODF_MIMETYPE_MAX_BYTES,
  withContainerImages,
} from "./ooxml.mjs";
import { linkWrapper } from "./subresources.mjs";
import { docParaRef, docTableRef } from "./docx.mjs";
import { sheetCellRef, usedSheetRange } from "./formats-xlsx.mjs";
import { slideShapeRef } from "./pptx.mjs";

const UTF8 = new TextDecoder("utf-8", { fatal: false });

/** Bytes as a Uint8Array view, from a Uint8Array, an ArrayBuffer, any typed
 *  view or a plain byte array; anything else reads as NO bytes (null), so a
 *  caller's odd argument is answered as "not this format", never a throw. */
function asBytes(x) {
  if (x instanceof Uint8Array) return x;
  if (x instanceof ArrayBuffer) return new Uint8Array(x);
  if (ArrayBuffer.isView(x)) return new Uint8Array(x.buffer, x.byteOffset, x.byteLength);
  if (Array.isArray(x)) { try { return Uint8Array.from(x); } catch { return null; } }
  return null;
}

/* ------------------------------------------------------------------ *
 * The part-map, taken from COFF-9's TABLE and never from a literal
 * ------------------------------------------------------------------ */

/* DISPATCH IS ON `partMap:"odf"`, NOT ON FLAVOUR NAMES. Every media type and
 * every main part name below is READ OUT of COFF-9's rows rather than spelled
 * again here, so a fourth OpenDocument kind (`.odg`, `.odf`) becomes one row
 * in `ooxml.mjs` plus one projection here — and, more to the point, these
 * entries cannot drift from the discriminator they dispatch on, because there
 * is only one place the facts live. */
const ODF_ROWS = CONTAINER_FLAVOURS.filter((f) => f.partMap === "odf");

function odfRow(flavour) {
  const row = ODF_ROWS.find((f) => f.flavour === flavour);
  /* Not defensive decoration: if COFF-9's table ever stopped carrying a row
   * these entries project, the honest outcome is a loud failure at module
   * load rather than three entries silently detecting nothing. */
  if (!row) throw new Error(`odf.mjs: no partMap:"odf" row for "${flavour}" in ooxml.mjs`);
  return row;
}

export const ODT_ROW = odfRow("odt");
export const ODS_ROW = odfRow("ods");
export const ODP_ROW = odfRow("odp");

/** The three OpenDocument media types, from the table — these are also the
 *  content types CAP-8's Drive handler must ask Google's export endpoint for
 *  (`export?format=odt|ods|odp`) and the types the entries answer on in the
 *  registry's content-type pass. */
export const ODT_CONTENT_TYPE = ODT_ROW.mimetype;
export const ODS_CONTENT_TYPE = ODS_ROW.mimetype;
export const ODP_CONTENT_TYPE = ODP_ROW.mimetype;

/** The one part every entry reads. Taken from the row, not spelled here. */
const CONTENT_PART = normalizePartName(ODT_ROW.conventionalMainPart);

/** `meta.xml` — read for the `core-properties` item (D-346); named so its
 *  absence or unreadability is stated with the part that would have carried it. */
const META_PART = "meta.xml";

/* ------------------------------------------------------------------ *
 * Minimal XML plumbing. Local for the same reason docx.mjs and pptx.mjs
 * keep their own: ooxml.mjs's matchers are flat by design, and every walk
 * below needs NESTING (a paragraph inside a table cell inside a sheet; a
 * notes frame inside a page; an annotation inside the paragraph whose text
 * must exclude it). Same dependency-free discipline: what these patterns
 * cannot read yields a stated undetermined, never a guessed structure.
 * ------------------------------------------------------------------ */

function decodeEntities(s) {
  return s.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (m, e) => {
    if (e[0] === "#") {
      const code = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      /* An out-of-range code point (`&#99999999;`) is left as written: it
         names no character, and fromCodePoint would throw on it. */
      return Number.isInteger(code) && code >= 0 && code <= 0x10ffff ? String.fromCodePoint(code) : m;
    }
    return { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" }[e] ?? m;
  });
}

function attrsOf(raw) {
  const attrs = {};
  for (const a of String(raw || "").matchAll(/([\w.-]+(?::[\w.-]+)?)\s*=\s*("([^"]*)"|'([^']*)')/g)) {
    const local = a[1].includes(":") ? a[1].split(":").pop() : a[1];
    attrs[local] = decodeEntities(a[3] ?? a[4] ?? "");
  }
  return attrs;
}

const localOf = (n) => (n.includes(":") ? n.split(":").pop() : n);

/* One token pass over the document: an open/close/self-closing tag, or a
 * comment / CDATA / processing instruction skipped whole. Group 1 is the tag
 * name (undefined for the skipped forms), group 2 the raw attributes, group 3
 * the self-closing slash.
 *
 * A FACTORY, NOT A SHARED CONSTANT, and this cost a measured hang before it
 * was one. `docx.mjs` and `pptx.mjs` each hold ONE module-level `/g` regex
 * and reset `lastIndex` at the top of their single walk, which is safe there
 * because neither walk calls anything that walks. Every walk in THIS module
 * nests — a paragraph's text is read while the body walk is mid-scan, a
 * page's notes while its shapes are — and a `/g` regex carries ONE
 * `lastIndex`, so the inner call's reset rewound the outer loop to the start
 * of the document and it never terminated. A fresh instance per call has no
 * shared cursor to corrupt. */
const tokens = () => /<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<\?[\s\S]*?\?>|<\/?([\w.-]+(?::[\w.-]+)?)((?:[^>"']|"[^"]*"|'[^']*')*?)(\/)?>/g;

/** Every element with this LOCAL name at any depth: `{ attrs, inner }`, where
 *  `inner` is the raw markup between the tags ("" for self-closing). Unlike
 *  ooxml.mjs's flat matcher this one is NESTING-AWARE: it counts opens and
 *  closes of the same local name, so `<draw:g>` inside `<draw:g>` does not
 *  end the outer one early. Only TOP-LEVEL occurrences are returned (a nested
 *  match is inside its parent's `inner`, where the caller can recurse). */
function elementsNested(xml, localName, limit = Infinity) {
  const out = [];
  const RE = tokens();
  let m, depth = 0, start = -1, openAttrs = null;
  while ((m = RE.exec(xml)) !== null) {
    if (m[1] === undefined) continue;
    if (localOf(m[1]) !== localName) continue;
    const closing = m[0][1] === "/";
    const selfClosed = m[3] === "/";
    if (closing) {
      depth--;
      if (depth === 0 && start >= 0) {
        out.push({ attrs: openAttrs, inner: xml.slice(start, m.index) });
        start = -1; openAttrs = null;
        if (out.length >= limit) break;
      }
      continue;
    }
    if (selfClosed) {
      if (depth === 0) {
        out.push({ attrs: attrsOf(m[2]), inner: "" });
        if (out.length >= limit) break;
      }
      continue;
    }
    if (depth === 0) { start = RE.lastIndex; openAttrs = attrsOf(m[2]); }
    depth++;
  }
  return out;
}

/** Strip every element with this local name, with its content, from a markup
 *  string — nesting-aware. Used to keep an annotation's own text out of the
 *  paragraph it annotates, and a page's speaker notes out of the slide's own
 *  text: in both cases the nested content is REAL and is emitted SEPARATELY,
 *  so merging it here would be the conflation DEC-5 forbids. */
function stripElement(xml, localName) {
  let out = "";
  let cut = 0;
  const RE = tokens();
  let m, depth = 0, start = -1;
  while ((m = RE.exec(xml)) !== null) {
    if (m[1] === undefined) continue;
    if (localOf(m[1]) !== localName) continue;
    const closing = m[0][1] === "/";
    const selfClosed = m[3] === "/";
    if (selfClosed) {
      if (depth === 0) { out += xml.slice(cut, m.index); cut = RE.lastIndex; }
      continue;
    }
    if (closing) {
      depth--;
      if (depth === 0 && start >= 0) { cut = RE.lastIndex; start = -1; }
      continue;
    }
    if (depth === 0) { out += xml.slice(cut, m.index); start = m.index; }
    depth++;
  }
  return out + xml.slice(cut);
}

/** The visible text of a run of ODF markup: character data, with `<text:s>`
 *  (a run of spaces), `<text:tab>` and `<text:line-break>` honoured, and
 *  every element's markup dropped. ODF encodes repeated spaces as
 *  `<text:s text:c="n"/>` rather than literal runs, so ignoring it would
 *  silently close up gaps in the extracted text. */
function visibleText(xml) {
  let out = "";
  let prev = 0;
  const RE = tokens();
  let m;
  while ((m = RE.exec(xml)) !== null) {
    if (m.index > prev) out += decodeEntities(xml.slice(prev, m.index));
    prev = RE.lastIndex;
    if (m[1] === undefined) continue;
    if (m[0][1] === "/") continue;
    const name = localOf(m[1]);
    if (name === "s") {
      const c = parseInt(attrsOf(m[2]).c ?? "1", 10);
      out += " ".repeat(Number.isFinite(c) && c > 0 ? c : 1);
    } else if (name === "tab") out += "\t";
    else if (name === "line-break") out += "\n";
  }
  if (xml.length > prev) out += decodeEntities(xml.slice(prev));
  return out;
}

/* ------------------------------------------------------------------ *
 * Automatic styles — the reason hiddenness is readable from ONE part
 * ------------------------------------------------------------------ */

/** `<office:automatic-styles>` maps a style NAME to the properties a document
 *  element references by `*:style-name`. Both hidden-sheet and hidden-slide
 *  live there in real producer output, which is what makes them derivable
 *  from content.xml alone. Returns
 *  `{ tableDisplay: Map(name → boolean), pageVisible: Map(name → boolean) }`;
 *  a style that declares neither appears in neither map, so "absent" is
 *  distinguishable from "declared true". */
function automaticStyles(xml) {
  const tableDisplay = new Map();
  const pageVisible = new Map();
  for (const block of elementsNested(xml, "automatic-styles")) {
    for (const st of elementsNested(block.inner, "style")) {
      const name = st.attrs["name"];
      if (!name) continue;
      if (st.attrs.family === "table") {
        for (const p of elementsNested(st.inner, "table-properties")) {
          if (p.attrs.display != null) tableDisplay.set(name, p.attrs.display !== "false");
        }
      } else if (st.attrs.family === "drawing-page") {
        for (const p of elementsNested(st.inner, "drawing-page-properties")) {
          if (p.attrs.visibility != null) pageVisible.set(name, p.attrs.visibility !== "hidden");
        }
      }
    }
  }
  return { tableDisplay, pageVisible };
}

/* ------------------------------------------------------------------ *
 * Link classification — the SAME partition rule pdfstructure, docx,
 * formats-xlsx and pptx apply
 * ------------------------------------------------------------------ */

function classifyUri(uri) {
  const m = /^([a-zA-Z][a-zA-Z0-9+.\-]*):/.exec(uri || "");
  const scheme = m ? m[1].toLowerCase() : null;
  if (scheme === "http" || scheme === "https") return "deferred";
  if (!scheme && uri) return "deferred";
  return "refused";
}

function linkRecord(uri, source) {
  /* An `xlink:href` that is a bare fragment is an INTERNAL reference — a
   * bookmark, a named range, a slide jump — final at capture, so it is an
   * `anchor` exactly as a docx bookmark link and a PDF GoTo are. */
  if (typeof uri === "string" && uri.startsWith("#")) {
    return { partition: "anchor", wrapper: linkWrapper.anchor(uri),
      target: { fragment: uri, name: uri.slice(1) }, source };
  }
  const partition = classifyUri(uri);
  return {
    partition,
    wrapper: partition === "deferred" ? linkWrapper.deferred(uri) : linkWrapper.refused(),
    target: { url: uri },
    source,
  };
}

/** Every `xlink:href`-bearing link element inside a run of markup, in document
 *  order: ODF's `<text:a>` (text documents, sheet cells, shape text) and
 *  `<draw:a>` (a whole shape made clickable). Returns the raw hrefs — the
 *  caller attaches the element reference it alone knows. */
function hrefsIn(xml) {
  const out = [];
  const RE = tokens();
  let m;
  while ((m = RE.exec(xml)) !== null) {
    if (m[1] === undefined || m[0][1] === "/") continue;
    if (localOf(m[1]) !== "a") continue;
    const href = attrsOf(m[2]).href;
    if (href != null) out.push(href);
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * The SYNCHRONOUS stored-member read — the one duplication in this
 * module, made deliberately and bounded to the case that forces it
 * ------------------------------------------------------------------ */

/* WHY THIS EXISTS. I7's `detect(bytes, contentType)` is SYNCHRONOUS: the
 * registry does not await it. `ooxml.mjs`'s `readPart` is async because it
 * may INFLATE. The `mimetype` member never needs inflating — OpenDocument 1.2
 * part 3 §3.3 requires it STORED, and COFF-9 pinned a refusal for any package
 * that disobeys — so the value the three entries must discriminate on is
 * reachable without awaiting anything.
 *
 * WHAT IT WILL NOT DO, so it cannot become a second ZIP reader: it reads
 * method 0 ONLY (a compressed member returns null, which is the same
 * conformance rule stated as an absence), it refuses anything over
 * `ODF_MIMETYPE_MAX_BYTES`, and it verifies length AND CRC-32 against the
 * central directory with `ooxml.mjs`'s OWN exported `crc32` — so a value that
 * passes here has passed exactly the checks `readPart` would have applied.
 * Every other part in this module goes through `readPart`. */
function readStoredMemberSync(bytes, container, name, maxBytes) {
  const want = normalizePartName(name);
  const entry = container.byName.get(want)
    ?? container.entries.find((e) => normalizePartName(e.name) === want);
  if (!entry) return null;
  if (entry.method !== 0) return null;                    // not stored: ODF's own rule, as an absence
  if (entry.uncompressedSize > maxBytes) return null;     // the COFF-9 bound
  const lh = entry.localHeaderOffset;
  if (lh + 30 > bytes.length) return null;
  const nameLen = bytes[lh + 26] | (bytes[lh + 27] << 8);
  const extraLen = bytes[lh + 28] | (bytes[lh + 29] << 8);
  const start = lh + 30 + nameLen + extraLen;
  const end = start + entry.compressedSize;
  if (end > bytes.length) return null;
  const out = bytes.subarray(start, end);
  if (out.length !== entry.uncompressedSize) return null;
  if (crc32(out) !== entry.crc32) return null;
  return UTF8.decode(out);
}

/* ------------------------------------------------------------------ *
 * detect() — shared by all three entries, parameterised by the ROW
 * ------------------------------------------------------------------ */

function detectOdf(row, raw, contentType) {
  try { return detectOdfUnguarded(row, raw, contentType); } catch { return null; }
}

function detectOdfUnguarded(row, raw, contentType) {
  if (raw) {
    const bytes = asBytes(raw);
    if (!bytes || !hasZipMagic(bytes)) return null;
    const container = readContainer(bytes);
    if (!container.ok) return null;                       // the 1 KiB acquire seam: no EOCD, no claim
    /* The FIRST-member requirement, checked the way COFF-9 checks it: the
     * mimetype must head the central directory AND no member may lie earlier
     * in the file (the ZIP format does not tie the two orders together). A
     * package that fails it is not this entry's — `discriminate()` will state
     * WHY when parts() runs; answering null here keeps detect from claiming
     * what the container cannot support. */
    const first = container.entries[0];
    if (!first || normalizePartName(first.name) !== ODF_MIMETYPE_PART) return null;
    if (container.entries.some((e) => e.localHeaderOffset < first.localHeaderOffset)) return null;
    const declared = readStoredMemberSync(bytes, container, ODF_MIMETYPE_PART, ODF_MIMETYPE_MAX_BYTES);
    if (declared !== row.mimetype) return null;           // EXACT, never trimmed — COFF-9's rule
    const main = normalizePartName(row.conventionalMainPart);
    const present = container.byName.has(main)
      || container.entries.some((e) => normalizePartName(e.name) === main);
    if (!present) return null;                            // both halves, or no claim
    /* CERTAIN, and this is the one place an office entry may say so. The OOXML
     * entries top out at "likely" because their discriminating declaration is
     * deflated beyond a synchronous detect's reach. Here the declaration was
     * READ — first member, stored, CRC-verified, compared exactly — and the
     * main part it names is present. Claiming only "likely" would understate
     * what the bytes say, which is the same defect as overclaiming pointed
     * the other way. */
    return {
      format: row.flavour, confidence: "certain",
      signals: [
        "magic: PK\\x03\\x04 with a readable central directory",
        `part: ${ODF_MIMETYPE_PART} is the FIRST member, STORED, CRC-verified`,
        `odf:${ODF_MIMETYPE_PART}=${row.mimetype} (exact match, not trimmed)`,
        `part: ${main} present`,
      ],
    };
  }
  if (contentType === row.mimetype) {
    return { format: row.flavour, confidence: "likely", signals: [`content type "${contentType}"`] };
  }
  return null;
}

/* ------------------------------------------------------------------ *
 * parts() — ONE container walk, shared; structure() and text() are
 * projections of what it assembled (the formats-xlsx.mjs pattern)
 * ------------------------------------------------------------------ */

async function odfParts(row, bytes) {
  try { return await odfPartsUnguarded(row, bytes); } catch (e) {
    /* R38's last line of defence: nothing below is expected to throw, and if
       something does the caller still gets a stated refusal, never an
       exception. */
    return { ok: false, container: row.flavour, why: `reader_failed:${e?.name ?? "Error"}`, part: null, flavourDeclared: null, signals: [] };
  }
}

async function odfPartsUnguarded(row, bytes) {
  const b = asBytes(bytes) ?? new Uint8Array(0);

  /* The full discrimination (magic + first-and-stored mimetype + the declared
   * main part present), through COFF-9's own branch. A container that is not
   * honestly this flavour yields a STATED refusal, never a walk of something
   * else's parts. */
  const d = await discriminate(b);
  if (!d.ok) return { ok: false, container: row.flavour, why: d.why, part: null, flavourDeclared: null, signals: d.signals };
  if (d.format !== row.flavour) {
    /* THE ABSENCE IS NAMED. `discriminate` reports a package whose mimetype
     * declares a flavour but whose main part is missing as
     * `declared_main_part_absent` with `flavourDeclared` set; this entry
     * carries the PART NAME with it, because "content.xml is absent" is the
     * fact a reader needs and "declared_main_part_absent" alone makes them
     * look it up. A package of the WRONG flavour is refused by name too:
     * `not_odt:ods`, never a silent empty structure. */
    const absent = d.why === "declared_main_part_absent";
    return {
      ok: false,
      container: row.flavour,
      why: d.format === "undetermined" ? d.why : `not_${row.flavour}:${d.format}`,
      part: absent ? CONTENT_PART : null,
      /* The flavour the package's own mimetype named: stated by
         `discriminate` on an undetermined read, and the flavour it found on a
         package of another OpenDocument kind (`not_odt:ods` declared ods). */
      flavourDeclared: d.flavourDeclared ?? (ODF_ROWS.some((r) => r.flavour === d.format) ? d.format : null),
      signals: d.signals,
    };
  }

  const container = readContainer(b);
  if (!container.ok) return { ok: false, container: row.flavour, why: container.why, part: null, flavourDeclared: null, signals: d.signals };

  const undetermined = [];

  /* COFF-6's metric, enacted in ooxml.mjs: the DECLARED UNCOMPRESSED size of
   * the text-bearing parts, from the central directory BEFORE inflation. For
   * OpenDocument there is exactly one: content.xml. */
  const declared = declaredTextBytes(container, (n) => n === CONTENT_PART);
  const guardR = sizeGuard(declared.total);
  const guard = guardR.ok ? null : guardR;

  let contentXml = null;
  if (!guard) {
    const read = await readPart(b, container, CONTENT_PART);
    if (read.ok) contentXml = UTF8.decode(read.bytes);
    else undetermined.push({ part: CONTENT_PART, why: read.why });
  }
  /* Over the bound nothing is inflated and nothing is pushed here: the guard
   * marker itself is the statement, carried by structure()'s envelope and by
   * text() verbatim (the docx.mjs pattern). */

  /* D-346 — THE TWO PARTS BESIDE content.xml THAT CARRY DEC-5 EVIDENCE.
   * Until D-346 neither was read, and each was STATED as not read (the
   * `outside_content_xml_not_read` markers) so a consumer could not mistake
   * silence for a fact. Both are now read, in the siblings' treatment: a
   * `core-properties` item from meta.xml (docx.mjs's fields, no others) and
   * sha256 `intra` links for the embedded members META-INF/manifest.xml lists
   * (docx.mjs's `word/embeddings/` treatment). What cannot be read is still
   * STATED, by the part and the reason — including a package with NO meta.xml,
   * which OpenDocument permits and which is therefore said, not left silent:
   * no core-properties item and no statement would read as "no author". */
  let core = null;
  if (hasMember(container, META_PART)) {
    const read = await readPart(b, container, META_PART);
    const c = read.ok ? parseOdfMeta(UTF8.decode(read.bytes)) : { ok: false, why: read.why };
    if (c.ok) core = c;
    else undetermined.push({ part: META_PART, why: c.why });
  } else {
    undetermined.push({
      part: META_PART,
      why: "part_absent",
      detail: "this package carries no meta.xml, so NO core-properties item is emitted; the absence of the part is not evidence the document has no author",
    });
  }

  const manifest = await manifestIntraLinks(b, container, contentXml, undetermined);

  return { ok: true, format: row.flavour, row, bytes: b, container, contentXml, declared, guard, core,
    embedded: manifest.links, manifestWhy: manifest.why, undetermined };
}

/* ------------------------------------------------------------------ *
 * D-346 — meta.xml into `core-properties`, the manifest into `intra`
 * ------------------------------------------------------------------ */

function hasMember(container, name) {
  return container.byName.has(name)
    || container.entries.some((e) => normalizePartName(e.name) === name);
}

const HEX = "0123456789abcdef";
async function sha256Hex(u8) {
  const d = new Uint8Array(await crypto.subtle.digest("SHA-256", u8));
  let out = "";
  for (let i = 0; i < d.length; i++) out += HEX[d[i] >> 4] + HEX[d[i] & 15];
  return out;
}

/** meta.xml's `<office:meta>` as the SAME fields `parseCoreProperties` reads
 *  from OOXML's docProps/core.xml — and NO others. meta.xml can carry more
 *  (keywords, description, user-defined fields, the generator, statistics);
 *  it is personal data in part, and this entry emits only what the OOXML
 *  path already emits, so no consumer meets a field from an .odt it would
 *  not meet from a .docx.
 *
 *  THE MAPPING, because the two vocabularies name the people differently
 *  (OpenDocument 1.2 part 1 §4.3): OOXML's `dc:creator` is the AUTHOR and
 *  `cp:lastModifiedBy` the last editor; ODF's `meta:initial-creator` is the
 *  author and ODF's `dc:creator` is the LAST EDITOR. So
 *    creator        ← meta:initial-creator
 *    lastModifiedBy ← dc:creator
 *    created        ← meta:creation-date
 *    modified       ← dc:date
 *    title          ← dc:title
 *    revision       ← meta:editing-cycles  (revisionNumber when an integer)
 *  Mapping by NAME (`dc:creator` → `creator`) would put the last editor in
 *  the author's field — a false attribution, which is the defect this record
 *  exists to avoid. Each field is the string the file carries or null when
 *  absent — never filled in from another. */
function parseOdfMeta(xml) {
  const doc = elementsNested(xml, "document-meta")[0];
  const meta = doc ? elementsNested(doc.inner, "meta")[0] : null;
  if (!meta) return { ok: false, why: "core_properties_unparseable" };
  const field = (local) => {
    const el = elementsNested(meta.inner, local)[0];
    return el ? visibleText(el.inner) : null;
  };
  const revision = field("editing-cycles");
  const revisionNumber = revision != null && /^\d+$/.test(revision.trim())
    ? parseInt(revision.trim(), 10) : null;
  return {
    ok: true,
    creator: field("initial-creator"),
    lastModifiedBy: field("creator"),
    revision,
    revisionNumber,
    created: field("creation-date"),
    modified: field("date"),
    title: field("title"),
  };
}

/** The `core-properties` item, field for field the one docx.mjs,
 *  formats-xlsx.mjs and pptx.mjs push (IC-2 as accepted). */
function corePropertiesItems(parts) {
  if (!parts.core) return [];
  const c = parts.core;
  return [{
    kind: "core-properties",
    creator: c.creator, lastModifiedBy: c.lastModifiedBy,
    revision: c.revision, revisionNumber: c.revisionNumber,
    created: c.created, modified: c.modified, title: c.title,
    source: null,
  }];
}

/* The package's OWN parts (OpenDocument 1.2 part 3 §3, plus LibreOffice's
 * `Configurations2/` UI state): the document itself and its machinery, not
 * something embedded in it. */
const PACKAGE_OWN = new Set(["mimetype", "content.xml", "styles.xml", "meta.xml", "settings.xml", "manifest.rdf"]);
const PACKAGE_OWN_DIRS = ["META-INF/", "Thumbnails/", "Configurations2/"];

/** META-INF/manifest.xml walked for the EMBEDDED members, each content-
 *  addressed into `intra` by the sha256 of its inflated bytes — exactly the
 *  link docx.mjs builds from `word/embeddings/`.
 *
 *  THE RULE IS AN INVERSION, not a list of what counts as embedded: every
 *  file entry the manifest names is `intra` EXCEPT
 *    - the package's own parts (PACKAGE_OWN / PACKAGE_OWN_DIRS);
 *    - an image under `Pictures/` — `text()` already content-addresses those
 *      as IC-124 `images`, the OOXML `word/media/` treatment, and a second
 *      address for the same bytes would count one image twice;
 *    - a font face content.xml names through `font-face-uri` (D-612's
 *      presentational judgment; OOXML's `word/fonts/` is not `intra` either).
 *  So an `Object N/` sub-document's members, an OLE blob, an
 *  `ObjectReplacements/` rendering, and a video or other non-image member are
 *  `intra`. A directory entry (`Object 1/`) is not a member; its files are
 *  listed, and linked, on their own.
 *
 *  WHAT IS STATED RATHER THAN LINKED: a manifest that cannot be read or
 *  parsed (the envelope names it — `intra` then means NOT LOOKED); a listed
 *  member the container does not hold, one encrypted (its stored bytes are
 *  ciphertext, and a hash of them would address nothing a reader holds), and
 *  one that will not inflate — each an `undetermined` link naming it.
 *
 *  WHAT IT CANNOT SEE: a container member the manifest does NOT list
 *  (OpenDocument requires the listing; a non-conforming producer can omit
 *  one); a font face named only from styles.xml, which is not read, and any
 *  font face when content.xml was not read (over the bound) — those are
 *  linked as `intra`, an over-inclusion, never an omission. `source` is null:
 *  locating a member to the `draw:object` that references it is not built. */
async function manifestIntraLinks(bytes, container, contentXml, undetermined) {
  const read = await readPart(bytes, container, ODF_MANIFEST_PART);
  if (!read.ok) {
    undetermined.push({ part: ODF_MANIFEST_PART, why: read.why });
    return { links: [], why: read.why };
  }
  const xml = UTF8.decode(read.bytes);
  const root = elementsNested(xml, "manifest", 1)[0];
  if (!root) {
    undetermined.push({ part: ODF_MANIFEST_PART, why: "manifest_unparseable" });
    return { links: [], why: "manifest_unparseable" };
  }

  const fonts = new Set();
  if (contentXml != null) {
    for (const f of elementsNested(contentXml, "font-face-uri")) {
      const href = f.attrs.href;
      if (typeof href === "string" && href) fonts.add(normalizePartName(href.replace(/^(?:\.\/)+/, "")));
    }
  }

  /* First the listing: which members are embedded, each once (a manifest
     naming a member twice does not make two embeddings). */
  const listed = [];
  const seen = new Set();
  for (const fe of elementsNested(root.inner, "file-entry")) {
    const path = fe.attrs["full-path"];
    if (typeof path !== "string" || !path || path.endsWith("/")) continue;
    const name = normalizePartName(path);
    if (seen.has(name)) continue;
    seen.add(name);
    if (PACKAGE_OWN.has(name) || PACKAGE_OWN_DIRS.some((d) => name.startsWith(d))) continue;
    if (name.startsWith("Pictures/")) {
      const dot = name.lastIndexOf(".");
      if (dot > name.lastIndexOf("/") && IMAGE_MIME_BY_EXT[name.slice(dot + 1).toLowerCase()]) continue;
    }
    if (fonts.has(name)) continue;
    listed.push({ name, encrypted: elementsNested(fe.inner, "encryption-data", 1).length > 0 });
  }

  const undeterminedLink = (why, name) => ({ partition: "undetermined", wrapper: null,
    target: { why, name }, source: null });

  /* THE SAME BOUND AND METRIC AS THE TEXT PART AND THE IMAGES (COFF-6):
     hashing inflates every embedded member, so their DECLARED uncompressed
     bytes are summed from the central directory first. Over the bound none is
     inflated and each is stated by name — never a partial set of links read
     as the whole. */
  let total = 0;
  for (const l of listed) {
    if (l.encrypted) continue;
    const e = container.byName.get(l.name) ?? container.entries.find((x) => normalizePartName(x.name) === l.name);
    if (e) total += e.uncompressedSize;
  }
  const g = sizeGuard(total);

  const links = [];
  for (const { name, encrypted } of listed) {
    if (encrypted) { links.push(undeterminedLink("embedding_encrypted", name)); continue; }
    if (!hasMember(container, name)) { links.push(undeterminedLink("manifest_member_absent", name)); continue; }
    if (!g.ok) { links.push(undeterminedLink(`embeddings_over_size_bound:${total}>${g.bound}`, name)); continue; }
    const got = await readPart(bytes, container, name);
    if (!got.ok) { links.push(undeterminedLink(`embedding_unreadable:${got.why}`, name)); continue; }
    const sha = await sha256Hex(got.bytes);
    links.push({ partition: "intra", wrapper: linkWrapper.intra(sha),
      target: { sha256: sha, name, bytes: got.bytes.length },
      source: null });
  }
  return { links, why: null };
}

/** Why `intra` holds nothing, when it holds nothing — so an empty partition
 *  is never read as "this package embeds nothing" when the manifest was not
 *  read, and says so plainly when the manifest was read and lists none. */
function intraNotes(parts) {
  if (parts.manifestWhy) {
    return [`no intra link: ${ODF_MANIFEST_PART} could not be read (${parts.manifestWhy}), so embedded members were not looked for (stated in evidentiary.undetermined)`];
  }
  if (!parts.embedded.length) return [`no intra link: ${ODF_MANIFEST_PART} lists no embedded member`];
  return [];
}

/* The body of content.xml for a given office body kind, or null. Every walk
 * below starts here rather than at the document root, so that automatic
 * styles and font declarations can never be mistaken for content. */
function officeBody(contentXml, kind) {
  if (contentXml == null) return null;
  /* An EMPTY body ("" — a document with no paragraphs, sheets or pages) is a
     body read, not a body missing: callers test for null, never falsiness. */
  const body = elementsNested(contentXml, "body", 1)[0];
  if (!body) return null;
  const inner = elementsNested(body.inner, kind)[0];
  return inner ? inner.inner : null;
}

/** The two absences above plus whatever parts() could not read, as the
 *  envelope's `undetermined` — and the size-guard marker when it fired. */
function envelopeUndetermined(parts) {
  const out = [...parts.undetermined];
  if (parts.guard) out.push({ part: CONTENT_PART, why: "over_size_bound", guard: parts.guard });
  return out;
}

function envelopeOf(container, items, undetermined) {
  const counts = {};
  for (const it of items) counts[it.kind] = (counts[it.kind] ?? 0) + 1;
  return {
    container,
    kinds: [...new Set(items.map((it) => it.kind))],
    items,
    undetermined,
    counts,
  };
}

function countPartitions(links) {
  const counts = { anchor: 0, intra: 0, deferred: 0, refused: 0, undetermined: 0 };
  for (const l of links) counts[l.partition]++;
  return counts;
}

/* ================================================================== *
 * .odt — the TEXT document, in docx.mjs's shape
 * ================================================================== */

/** One pass over `<office:text>`: the paragraph sequence (every `<text:p>`
 *  and `<text:h>` in body order, tables included — ODF's heading is a
 *  paragraph-level element and is what a person is shown), each paragraph's
 *  visible text, the hyperlinks located to their paragraph, the annotations
 *  located to theirs, and the tracked-change MARKS that locate a changed
 *  region to a paragraph.
 *
 *  What is DELIBERATELY excluded from the paragraph sequence, and why:
 *  `<text:tracked-changes>` at the head of the body holds the deleted
 *  regions' own paragraphs. Those paragraphs are NOT in the document as
 *  served — that is the entire point of a deletion — so counting them would
 *  shift every `¶N` past the first change and put superseded wording in the
 *  text stream, which is exactly the docx rule (`w:delText` is not in the
 *  text stream; it is the evidentiary superseded wording). An annotation's
 *  own paragraphs are excluded for the same reason at a smaller scale. */
function walkTextBody(bodyXml) {
  const paragraphs = [];
  const hyperlinks = [];
  const annotations = [];
  const marks = [];               // { id, para } — where a changed region sits
  const openChanges = new Map();  // id → { para, text } for a change-start span

  /* The tracked-changes declaration block is read separately below; strip it
   * so its deleted paragraphs never enter the body sequence. */
  const served = stripElement(bodyXml, "tracked-changes");

  const RE = tokens();
  let m, prev = 0;
  let para = -1;
  let inPara = false;
  let depthInPara = 0;
  let skipDepth = 0;              // inside an annotation: its text is its own
  let paraStart = -1;
  const openStack = [];

  while ((m = RE.exec(served)) !== null) {
    if (m[1] === undefined) { prev = RE.lastIndex; continue; }
    const name = localOf(m[1]);
    const closing = m[0][1] === "/";
    const selfClosed = m[3] === "/";

    if (skipDepth > 0) {
      if (!closing && !selfClosed) skipDepth++;
      else if (closing) skipDepth--;
      prev = RE.lastIndex;
      continue;
    }

    if (!closing && !selfClosed && name === "annotation") {
      /* The annotation's markup runs to its close; capture it whole and take
       * its text out of the host paragraph. */
      const rest = served.slice(m.index);
      /* Only the FIRST: scanning the rest of the body for every annotation
         made a comment-heavy document quadratic. */
      const ann = elementsNested(rest, "annotation", 1)[0];
      annotations.push({ attrs: attrsOf(m[2]), inner: ann ? ann.inner : "", para: para >= 0 ? para : null });
      skipDepth = 1;
      prev = RE.lastIndex;
      continue;
    }

    if (!closing && (name === "p" || name === "h")) {
      if (!selfClosed) {
        if (!inPara) { para++; inPara = true; depthInPara = 1; paraStart = RE.lastIndex; openStack.length = 0; }
        else depthInPara++;   /* a paragraph inside a paragraph is not ODF, but
                                 a producer's nesting must not desynchronise
                                 the counter */
      } else {
        if (!inPara) { para++; paragraphs.push({ para, text: "" }); }
      }
      prev = RE.lastIndex;
      continue;
    }
    if (closing && (name === "p" || name === "h") && inPara) {
      depthInPara--;
      if (depthInPara === 0) {
        const raw = served.slice(paraStart, m.index);
        paragraphs.push({ para, text: visibleText(stripElement(raw, "annotation")) });
        inPara = false;
        paraStart = -1;
      }
      prev = RE.lastIndex;
      continue;
    }

    const attrs = m[2] && m[2].includes("=") ? attrsOf(m[2]) : {};

    if (!closing && name === "a" && attrs.href != null) {
      hyperlinks.push({ href: attrs.href, para: para >= 0 ? para : null });
    } else if (name === "change-start" && attrs["change-id"] != null) {
      openChanges.set(attrs["change-id"], { para: para >= 0 ? para : null });
      marks.push({ id: attrs["change-id"], para: para >= 0 ? para : null });
    } else if (name === "change" && attrs["change-id"] != null) {
      /* A bare `<text:change/>` is the position a deletion was taken FROM. */
      marks.push({ id: attrs["change-id"], para: para >= 0 ? para : null });
    }
    prev = RE.lastIndex;
  }
  return { paragraphs, hyperlinks, annotations, marks, openChanges };
}

/** The inserted text of every change region, taken from the BODY between
 *  its `<text:change-start>` and `<text:change-end>` marks: `Map(id → text)`.
 *  The declaration block carries a deletion's wording but NOT an insertion's —
 *  the insertion is in the document as served, which is why it is also in the
 *  text stream. One token walk over the served body for every region (the
 *  marks are matched by local name and `change-id`, in either quote style); a
 *  region with no start, no end, or an end before its start is absent from
 *  the map, and its text is null — absent is not empty. An annotation inside
 *  the region is the annotation's text, not the insertion's. */
function insertedTexts(servedXml) {
  const out = new Map();
  const starts = new Map();
  const RE = tokens();
  let m;
  while ((m = RE.exec(servedXml)) !== null) {
    if (m[1] === undefined || m[0][1] === "/") continue;
    const name = localOf(m[1]);
    if (name !== "change-start" && name !== "change-end") continue;
    const id = attrsOf(m[2])["change-id"];
    if (id == null) continue;
    if (name === "change-start") { if (!starts.has(id)) starts.set(id, RE.lastIndex); }
    else if (starts.has(id) && !out.has(id)) {
      out.set(id, visibleText(stripElement(servedXml.slice(starts.get(id), m.index), "annotation")));
    }
  }
  return out;
}

/** `<text:tracked-changes>`: one entry per `<text:changed-region>`, each an
 *  insertion or a deletion with `<office:change-info>`'s author and date. */
function parseTrackedChanges(bodyXml) {
  const block = elementsNested(bodyXml, "tracked-changes")[0];
  if (!block) return [];
  const out = [];
  for (const region of elementsNested(block.inner, "changed-region")) {
    const id = region.attrs.id ?? null;
    for (const [kind, change] of [["insertion", "insertion"], ["deletion", "deletion"]]) {
      for (const el of elementsNested(region.inner, kind)) {
        const info = elementsNested(el.inner, "change-info")[0];
        const creator = info ? elementsNested(info.inner, "creator")[0] : null;
        const date = info ? elementsNested(info.inner, "date")[0] : null;
        out.push({
          id, change,
          author: creator ? visibleText(creator.inner) : null,   // null, never invented
          date: date ? visibleText(date.inner) : null,
          /* A deletion's own paragraphs ARE the superseded wording. An
             insertion's content is in the body, not here. */
          superseded: change === "deletion"
            ? elementsNested(stripElement(el.inner, "change-info"), "p").map((p) => visibleText(p.inner)).join("\n")
            : null,
        });
      }
    }
  }
  return out;
}

function odtStructure(parts) {
  if (!parts || !parts.ok) {
    return { ok: false, container: "odt", reason: parts?.why ?? "PARTS_ABSENT", part: parts?.part ?? null };
  }
  const notes = intraNotes(parts);
  const links = [];
  const items = [];
  const body = officeBody(parts.contentXml, "text");
  if (body == null) {
    notes.push(parts.guard
      ? "content.xml not read: over the size bound (stated in evidentiary.undetermined and by text())"
      : "content.xml unreadable or carries no <office:text>: element references unavailable (stated)");
  }

  let paragraphs = null;
  if (body != null) {
    const walk = walkTextBody(body);
    paragraphs = walk.paragraphs.length;

    for (const h of walk.hyperlinks) {
      links.push(linkRecord(h.href, h.para == null ? null : docParaRef(h.para)));
    }

    /* DEC-5: tracked changes, author/date/superseded-wording, located to the
     * paragraph the body's mark sits in. A region the body never marks is
     * still carried — with source null and the reason stated — because the
     * change is evidence whether or not we can place it. */
    const inserted = insertedTexts(stripElement(body, "tracked-changes"));
    const markFor = new Map();
    for (const mk of walk.marks) if (!markFor.has(mk.id)) markFor.set(mk.id, mk.para);
    for (const c of parseTrackedChanges(parts.contentXml)) {
      const at = c.id != null ? markFor.get(c.id) : undefined;
      const item = {
        kind: "tracked-change",
        change: c.change,
        author: c.author,
        date: c.date,
        source: at == null ? null : docParaRef(at),
      };
      if (c.change === "deletion") item.superseded = c.superseded;
      else item.text = c.id != null && inserted.has(c.id) ? inserted.get(c.id) : null;
      if (at === undefined) item.why = "change_region_unmarked_in_body";
      items.push(item);
    }

    /* DEC-5: comments. ODF's annotation is inline in the paragraph it
     * annotates, so the location is exact rather than joined through an id.
     * `initials` is emitted because the docx envelope carries it — ODF has
     * `<meta:creator-initials>` and LibreOffice does not write it, so it is
     * null when absent and that null is the file speaking. */
    for (const a of walk.annotations) {
      const creator = elementsNested(a.inner, "creator")[0];
      const date = elementsNested(a.inner, "date")[0];
      const initials = elementsNested(a.inner, "creator-initials")[0];
      items.push({
        kind: "comment",
        id: a.attrs.name ?? null,
        author: creator ? visibleText(creator.inner) : null,
        date: date ? visibleText(date.inner) : null,
        initials: initials ? visibleText(initials.inner) : null,
        text: elementsNested(stripElement(a.inner, "change-info"), "p").map((p) => visibleText(p.inner)).join("\n"),
        source: a.para == null ? null : docParaRef(a.para),
      });
    }
  }

  /* D-346: the manifest's embedded members, and meta.xml's core properties. */
  links.push(...parts.embedded);
  items.push(...corePropertiesItems(parts));

  return {
    ok: true,
    container: "odt",
    paragraphs,                              // null = honestly unknown, the docx.mjs convention
    links,
    counts: countPartitions(links),
    evidentiary: envelopeOf("odt", items, envelopeUndetermined(parts)),
    notes,
  };
}

/** FW-19 — THE TABLES OF AN `<office:text>` BODY, in document order, nested
 *  ones included and numbered as they OPEN — `docx.mjs`'s
 *  `walkDocumentTables` for OpenDocument, and the same ordinal `docTableRef`
 *  addresses. ODF compresses runs (`table:number-columns-repeated`,
 *  `table:number-rows-repeated`), so both figures are ACCUMULATED through the
 *  repeats exactly as `walkSheet` does; `cols` is the declared
 *  `<table:table-column>` grid. A figure the walk did not establish is NULL,
 *  never 0. */
function walkOdfTables(bodyXml) {
  const done = [];
  const stack = [];
  let next = 0;
  const RE = tokens();
  const rep = (v) => { const n = parseInt(v ?? "1", 10); return Number.isFinite(n) && n > 0 ? n : 1; };
  let m;
  while ((m = RE.exec(bodyXml)) !== null) {
    if (m[1] === undefined) continue;
    const name = localOf(m[1]);
    const closing = m[0][1] === "/";
    const selfClosed = m[3] === "/";
    const top = stack.length ? stack[stack.length - 1] : null;
    if (closing) {
      if (name === "table" && stack.length) {
        const t = stack.pop();
        done[t.table] = { table: t.table, rows: t.rows, cols: t.cols > 0 ? t.cols : null };
      }
      continue;
    }
    if (name === "table") {
      if (selfClosed) done[next] = { table: next++, rows: 0, cols: null };
      else stack.push({ table: next++, rows: 0, cols: 0 });
      continue;
    }
    if (!top) continue;
    const attrs = m[2] && m[2].includes("=") ? attrsOf(m[2]) : {};
    if (name === "table-column") top.cols += rep(attrs["number-columns-repeated"]);
    else if (name === "table-row") top.rows += rep(attrs["number-rows-repeated"]);
  }
  while (stack.length) {
    const t = stack.pop();
    done[t.table] = { table: t.table, rows: t.rows || null, cols: t.cols > 0 ? t.cols : null };
  }
  return done.filter(Boolean);
}

function odtText(parts) {
  if (!parts || !parts.ok) {
    return { ok: false, container: "odt", reason: parts?.why ?? "PARTS_ABSENT", part: parts?.part ?? null };
  }
  if (parts.guard) {
    return {
      ok: true, container: "odt", document: null, paragraphs: [], tables: null,
      undetermined: [parts.guard],           // the marker VERBATIM, never a truncation
      counts: { chars: 0, undetermined: 1 },
    };
  }
  const body = officeBody(parts.contentXml, "text");
  if (body == null) {
    const stated = parts.undetermined.find((u) => u.part === CONTENT_PART);
    return {
      ok: true, container: "odt", document: null, paragraphs: [], tables: null,
      undetermined: [{ reason: "main_part_unreadable", part: CONTENT_PART, why: stated?.why ?? "no_office_text_body" }],
      counts: { chars: 0, undetermined: 1 },
    };
  }
  const walk = walkTextBody(body);
  const paragraphs = walk.paragraphs.map((p) => ({ para: p.para, ref: `¶${p.para + 1}`, text: p.text }));
  const document = paragraphs.map((p) => p.text).filter((t) => t.length).join("\n");
  /* FW-19 / IC-124: the `doc-table` units, in docx.mjs's shape and through
     its builder. An EMPTY list is a real zero; the branches above that walked
     nothing say `tables: null`. The tracked-changes block is stripped first,
     for `walkTextBody`'s own reason: a deleted table is not in the document
     as served, and counting it would renumber every table after it. */
  const tables = walkOdfTables(stripElement(body, "tracked-changes"))
    .map((t) => ({ table: t.table, ref: docTableRef(t.table).ref, rows: t.rows, cols: t.cols }));
  return {
    ok: true, container: "odt", document, paragraphs, tables,
    undetermined: [],
    counts: { chars: document.length, undetermined: 0 },
  };
}

/* ================================================================== *
 * .ods — the SPREADSHEET, in formats-xlsx.mjs's shape
 * ================================================================== */

/** A1-style column name from a 0-based index. */
function columnName(i) {
  let n = i, out = "";
  do { out = String.fromCharCode(65 + (n % 26)) + out; n = Math.floor(n / 26) - 1; } while (n >= 0);
  return out;
}

/** One sheet's rows and cells. ODF compresses runs with
 *  `table:number-columns-repeated` / `table:number-rows-repeated`, so a cell's
 *  ADDRESS cannot be counted off the element index — it must be accumulated
 *  through the repeats, or every reference after the first run of blanks
 *  points at the wrong cell. Trailing repeats are the padding a producer adds
 *  to square the sheet off; a repeat run is expanded only as far as its last
 *  cell that carries anything, so a `repeated="1024"` blank tail costs one
 *  iteration rather than a thousand. */
function walkSheet(tableXml) {
  const rows = [];
  const hiddenRows = [];
  const hiddenCols = [];

  let colIndex = 0;
  for (const col of elementsNested(tableXml, "table-column")) {
    const rep = parseInt(col.attrs["number-columns-repeated"] ?? "1", 10);
    const n = Number.isFinite(rep) && rep > 0 ? rep : 1;
    const vis = col.attrs.visibility;
    if (vis === "collapse" || vis === "filter") {
      hiddenCols.push({ min: colIndex + 1, max: colIndex + n, visibility: vis });
    }
    colIndex += n;
  }

  let rowIndex = 0;
  for (const row of elementsNested(tableXml, "table-row")) {
    const rep = parseInt(row.attrs["number-rows-repeated"] ?? "1", 10);
    const nRows = Number.isFinite(rep) && rep > 0 ? rep : 1;
    const vis = row.attrs.visibility;

    const cells = [];
    let c = 0;
    for (const cell of elementsNested(row.inner, "table-cell")) {
      const crep = parseInt(cell.attrs["number-columns-repeated"] ?? "1", 10);
      const nCols = Number.isFinite(crep) && crep > 0 ? crep : 1;
      const carries = cell.attrs["value-type"] != null || cell.attrs.formula != null || cell.inner.trim() !== "";
      /* An empty repeated run holds no content and no reference worth
         emitting; skip it but still advance the address. */
      const emit = carries ? nCols : 0;
      for (let k = 0; k < emit; k++) {
        cells.push({
          col: c + k,
          cell: `${columnName(c + k)}${rowIndex + 1}`,
          valueType: cell.attrs["value-type"] ?? null,
          value: cell.attrs.value ?? cell.attrs["string-value"] ?? cell.attrs["date-value"]
            ?? cell.attrs["time-value"] ?? cell.attrs["boolean-value"] ?? null,
          formula: cell.attrs.formula ?? null,
          /* The DISPLAYED form: ODF writes what the sheet shows as the cell's
             `<text:p>` children, which is the analogue of xlsx's cached <v>. */
          display: elementsNested(cell.inner, "p").map((p) => visibleText(p.inner)).join("\n"),
          hrefs: hrefsIn(cell.inner),
        });
      }
      c += nCols;
    }

    /* A repeated ROW carries the same cells at each of its addresses. A
       repeated run of EMPTY rows is the sheet's padding: it is advanced over,
       not materialised. */
    const materialise = cells.length ? nRows : 0;
    for (let k = 0; k < materialise; k++) {
      const r = rowIndex + k;
      if (vis === "collapse" || vis === "filter") hiddenRows.push(r + 1);
      rows.push({
        r: r + 1,
        hidden: vis === "collapse" || vis === "filter" ? vis : false,
        cells: cells.map((cell) => ({ ...cell, cell: `${columnName(cell.col)}${r + 1}` })),
      });
    }
    if (!materialise && (vis === "collapse" || vis === "filter")) {
      for (let k = 0; k < nRows; k++) hiddenRows.push(rowIndex + k + 1);
    }
    rowIndex += nRows;
  }
  return { rows, hiddenRows, hiddenCols };
}

/** The sheets of an `<office:spreadsheet>` body, with their hidden state.
 *  ODF declares hiddenness on the table's STYLE (`table:display="false"` in
 *  `<style:table-properties>`) — MEASURED as where LibreOffice writes it —
 *  and a producer may also write `table:display` on the element itself; both
 *  are read, the element winning because it is the more specific statement. */
function sheetsOf(bodyXml, styles) {
  return elementsNested(bodyXml, "table").map((tbl, index) => {
    const styleName = tbl.attrs["style-name"] ?? null;
    const fromElement = tbl.attrs.display != null ? tbl.attrs.display !== "false" : null;
    const fromStyle = styleName != null && styles.tableDisplay.has(styleName)
      ? styles.tableDisplay.get(styleName) : null;
    const displayed = fromElement ?? fromStyle ?? true;   // absence means shown; nothing is guessed
    return {
      index,
      name: tbl.attrs.name ?? `table${index + 1}`,
      /* ODF identifies a table by NAME only — there is no numeric sheet id.
         null is the FORMAT speaking, not a gap in this reader. */
      sheetId: null,
      /* ODF's visibility is a boolean, so there is no xlsx "veryHidden". */
      state: displayed ? "visible" : "hidden",
      hidden: displayed ? false : "hidden",
      xml: tbl.inner,
    };
  });
}

function odsStructure(parts) {
  if (!parts || !parts.ok) {
    return { ok: false, container: "ods", reason: parts?.why ?? "PARTS_ABSENT", part: parts?.part ?? null };
  }
  const notes = intraNotes(parts);
  const links = [];
  const items = [];
  const body = officeBody(parts.contentXml, "spreadsheet");
  if (body == null) {
    notes.push(parts.guard
      ? "content.xml not read: over the size bound (stated in evidentiary.undetermined and by text())"
      : "content.xml unreadable or carries no <office:spreadsheet>: element references unavailable (stated)");
  }
  if (parts.guard) notes.push("text_parts_over_bound");

  const styles = parts.contentXml ? automaticStyles(parts.contentXml) : { tableDisplay: new Map(), pageVisible: new Map() };
  const sheets = body != null ? sheetsOf(body, styles) : [];

  for (const sheet of sheets) {
    const walked = walkSheet(sheet.xml);

    for (const row of walked.rows) {
      for (const cell of row.cells) {
        const ref = sheetCellRef(sheet.name, cell.cell);
        for (const href of cell.hrefs) links.push(linkRecord(href, ref));
        /* DEC-5: the formula BESIDE its cached value — two named fields on
           ONE item, never collapsed and never substituted for the value in
           the text stream. ODF's formula carries OpenFormula's namespace
           prefix (`of:=SUM([.B2:.B3])`); it is held VERBATIM, because
           rewriting it into another dialect would be this module inventing a
           derivation the file does not state. */
        if (cell.formula != null) {
          items.push({
            kind: "formula",
            source: ref,
            formula: cell.formula,
            value: cell.display !== "" ? cell.display : cell.value,   // the cached result; null when the file carries none
          });
        }
      }
    }
    if (walked.hiddenRows.length) {
      items.push({ kind: "hidden-rows", sheet: sheet.name,
        rows: walked.hiddenRows, count: walked.hiddenRows.length, source: null });
    }
    if (walked.hiddenCols.length) {
      items.push({ kind: "hidden-cols", sheet: sheet.name,
        cols: walked.hiddenCols, count: walked.hiddenCols.length, source: null });
    }
  }

  /* DEC-5: a hidden SHEET is a first-class finding — invisible in every
     rendered form of the workbook. */
  for (const sheet of sheets) {
    if (sheet.hidden) items.push({ kind: "hidden-sheet", sheet: sheet.name, state: sheet.state, source: null });
  }

  /* D-346: the manifest's embedded members, and meta.xml's core properties. */
  links.push(...parts.embedded);
  items.push(...corePropertiesItems(parts));

  return {
    ok: true,
    container: "ods",
    sheets: sheets.map((s) => ({ sheet: s.index, name: s.name, sheetId: s.sheetId, state: s.state, hidden: s.hidden })),
    links,
    counts: countPartitions(links),
    evidentiary: envelopeOf("ods", items, envelopeUndetermined(parts)),
    notes,
  };
}

function odsText(parts) {
  if (!parts || !parts.ok) {
    return { ok: false, container: "ods", reason: parts?.why ?? "PARTS_ABSENT", part: parts?.part ?? null };
  }
  if (parts.guard) {
    return {
      ok: true, container: "ods", document: null, sheets: [],
      undetermined: [parts.guard],
      counts: { chars: 0, cells: 0, formulas: 0, undetermined: 1 },
    };
  }
  const body = officeBody(parts.contentXml, "spreadsheet");
  if (body == null) {
    const stated = parts.undetermined.find((u) => u.part === CONTENT_PART);
    const marker = { sheet: null, cell: null, reason: stated?.why ?? "no_office_spreadsheet_body" };
    return {
      ok: true, container: "ods", document: null, sheets: [],
      undetermined: [marker],
      counts: { chars: 0, cells: 0, formulas: 0, undetermined: 1 },
    };
  }
  const styles = automaticStyles(parts.contentXml);
  const outSheets = [];
  let cellCount = 0, formulaCount = 0;
  for (const sheet of sheetsOf(body, styles)) {
    const walked = walkSheet(sheet.xml);
    const lines = [];
    for (const row of walked.rows) {
      const vals = [];
      for (const c of row.cells) {
        if (c.formula != null) formulaCount++;
        /* THE DISPLAYED VALUE, never the formula — the xlsx rule, so the
           derivation stays in the envelope and out of the text stream. */
        const v = c.display !== "" ? c.display : c.value;
        if (v == null || v === "") continue;
        cellCount++;
        vals.push(v);
      }
      if (vals.length) lines.push(vals.join("\t"));
    }
    const text = lines.join("\n");
    /* A HIDDEN sheet's text IS extracted — the record holds what the file
       holds — and the flag is what keeps a reader from mistaking it for
       presented content (the xlsx precedent). */
    /* COFF-11 / IC-100 / D-359 — the sheet's own extent, in the two figures
       `formats-xlsx.mjs` emits and with the SAME meaning, which is the whole
       point of them being two: `usedRows`/`usedCols` is how far this sheet's
       cells reach, and `rows`/`cols` is the BOUND the `sheet-cell` arm of
       C-45.1 compares an address against.

       AND THE BOUND IS NULL HERE, DELIBERATELY. OpenDocument fixes no maximum
       table size — a `<table:table>` has no schema-level row or column limit
       and the grid a member's application offers is that APPLICATION's, which
       the file does not record. So `.ods` has no capacity to state, and the
       alternatives are both worse: bounding by the USED range would refuse a
       true citation of a cell that exists and was empty at capture (the
       decision `formats-xlsx.mjs` records at length), and borrowing OOXML's
       grid would be this reader inventing a bound the format never fixed.
       NULL is undetermined-is-first-class at this construct — the store's
       `#containerExtentForCapture` NAMES an absent level rather than reading
       it as a zero — and it means an `.ods` cell inside a known sheet stays
       unbounded and STATED. The used range is emitted anyway: it is the fact
       this walk knows, and a bound is not the only thing worth knowing. */
    /* Accumulated with a LOOP rather than `Math.max(...rows)`: a spread over a
       large sheet's rows is an argument list the size of the sheet, and a real
       workbook is exactly where that would be found. Taken from the CELLS, as
       `walkSheetXml` does — `walkSheet` materialises a row only when it
       carries cells, so a padding run never counts as reach. */
    let usedRows = 0, usedCols = 0;
    for (const row of walked.rows) {
      if (!row.cells.length) continue;
      if (Number.isInteger(row.r) && row.r > usedRows) usedRows = row.r;
      for (const c of row.cells) {
        if (Number.isInteger(c.col) && c.col + 1 > usedCols) usedCols = c.col + 1;
      }
    }
    outSheets.push({ sheet: sheet.index, name: sheet.name, hidden: sheet.hidden,
      rows: null, cols: null, usedRows, usedCols,
      /* FW-19 / IC-124: the sheet as a `sheet-range` unit, or NULL. */
      range: usedSheetRange(sheet.name, usedRows, usedCols),
      text, undetermined: [] });
  }
  const document = outSheets.map((s) => s.text).filter((t) => t.length).join("\n");
  return {
    ok: true, container: "ods", document, sheets: outSheets,
    undetermined: [],
    counts: { chars: document.length, cells: cellCount, formulas: formulaCount, undetermined: 0 },
  };
}

/* ================================================================== *
 * .odp — the PRESENTATION, in pptx.mjs's shape
 * ================================================================== */

/* The shape-bearing draw:* elements, in the sense pptx.mjs's SHAPE_TAGS uses:
 * one sequence per slide in document order, nested included, so a shape index
 * means the same thing to every reference into that slide. */
const ODP_SHAPE_TAGS = new Set([
  "frame", "custom-shape", "rect", "ellipse", "circle", "line", "polyline",
  "polygon", "path", "connector", "measure", "caption", "g", "page-thumbnail",
  "control", "object", "image",
]);

/** One page's shapes: index, visible text, and the hrefs each carries. The
 *  `<presentation:notes>` subtree is EXCLUDED — the notes are walked
 *  separately and emitted as their own unit, never merged into slide text. */
function walkPage(pageXml) {
  const slideOnly = stripElement(pageXml, "notes");
  const shapes = [];
  const RE = tokens();
  let m;
  let index = -1;
  const open = [];
  /* EACH LINK IS LOCATED ONCE, to the shape that owns it. A `<text:a>` inside
     a paragraph belongs to the innermost shape open around it — never also to
     the groups enclosing that shape, which counted one link once per level.
     A `<draw:a>` outside any paragraph WRAPS a shape (OpenDocument's
     clickable shape) and belongs to the first shape it opens; one that wraps
     no shape belongs to the shape around it, or, at page level, to the page
     itself (`page`), never dropped. */
  const hrefsOf = new Map();                  // shape index → hrefs
  const pageHrefs = [];
  const pending = [];                         // draw:a hrefs waiting for their shape
  const aStack = [];                          // for each open <a>: its pending entry, or null
  let paraDepth = 0;
  const own = (href) => {
    const top = open.length ? open[open.length - 1].index : null;
    if (top == null) pageHrefs.push(href);
    else { if (!hrefsOf.has(top)) hrefsOf.set(top, []); hrefsOf.get(top).push(href); }
  };
  while ((m = RE.exec(slideOnly)) !== null) {
    if (m[1] === undefined) continue;
    const name = localOf(m[1]);
    const closing = m[0][1] === "/";
    const selfClosed = m[3] === "/";
    if (name === "p" || name === "h") {
      if (!selfClosed) paraDepth = Math.max(0, paraDepth + (closing ? -1 : 1));
      continue;
    }
    if (name === "a") {
      if (closing) {
        const entry = aStack.pop();
        if (entry && !entry.placed) {
          pending.splice(pending.indexOf(entry), 1);
          own(entry.href);
        }
        continue;
      }
      const href = attrsOf(m[2]).href;
      if (href == null) { if (!selfClosed) aStack.push(null); continue; }
      if (paraDepth > 0 || selfClosed) { own(href); if (!selfClosed) aStack.push(null); continue; }
      const entry = { href, placed: false };
      pending.push(entry);
      aStack.push(entry);
      continue;
    }
    if (!ODP_SHAPE_TAGS.has(name)) continue;
    if (closing) {
      const o = open.pop();
      if (o) shapes.push({ shape: o.index, inner: slideOnly.slice(o.start, m.index) });
      continue;
    }
    index++;
    if (pending.length) {
      hrefsOf.set(index, pending.map((e) => e.href));
      for (const e of pending) e.placed = true;
      pending.length = 0;
    }
    if (selfClosed) { shapes.push({ shape: index, inner: "" }); continue; }
    open.push({ index, start: RE.lastIndex });
  }
  /* An unclosed wrapper at the end of the page still states its link. */
  for (const e of pending) pageHrefs.push(e.href);
  /* A shape left open at the end of the page (malformed markup) still counts
     and still carries its text, to the end of the page. */
  while (open.length) {
    const o = open.pop();
    shapes.push({ shape: o.index, inner: slideOnly.slice(o.start) });
  }
  shapes.sort((a, b) => a.shape - b.shape);
  return {
    count: index + 1,
    pageHrefs,
    shapes: shapes.map((s) => ({
      shape: s.shape,
      /* A group's text is the text of the shapes inside it, which are their
         own entries; taking the group's inner markup would double-count it in
         the slide's text, so a shape's OWN text is the paragraphs outside
         every shape nested in it: a frame's `<draw:text-box>` or table, and
         the paragraphs a custom shape or rectangle holds DIRECTLY (which a
         text-box-only reading dropped). */
      text: ownShapeText(s.inner),
      hrefs: hrefsOf.get(s.shape) ?? [],
    })),
  };
}

/** The paragraphs (`<text:p>`/`<text:h>`) of a shape's inner markup that lie
 *  outside every shape nested in it, each as visible text, newline-joined. */
function ownShapeText(xml) {
  const paras = [];
  const RE = tokens();
  let m, shapeDepth = 0, paraDepth = 0, start = -1;
  while ((m = RE.exec(xml)) !== null) {
    if (m[1] === undefined) continue;
    const name = localOf(m[1]);
    const closing = m[0][1] === "/";
    const selfClosed = m[3] === "/";
    if (ODP_SHAPE_TAGS.has(name)) {
      if (closing) shapeDepth = Math.max(0, shapeDepth - 1);
      else if (!selfClosed) shapeDepth++;
      continue;
    }
    if (shapeDepth > 0 || (name !== "p" && name !== "h")) continue;
    if (selfClosed) { if (paraDepth === 0) paras.push(""); continue; }
    if (!closing) { if (paraDepth++ === 0) start = RE.lastIndex; continue; }
    if (paraDepth > 0 && --paraDepth === 0) paras.push(visibleText(xml.slice(start, m.index)));
  }
  return paras.join("\n");
}

function notesTextOf(pageXml) {
  const notes = elementsNested(pageXml, "notes")[0];
  if (!notes) return null;
  return elementsNested(notes.inner, "text-box")
    .map((tb) => elementsNested(tb.inner, "p").map((p) => visibleText(p.inner)).join("\n"))
    .filter((t) => t.length)
    .join("\n");
}

/** The deck, in the order the BYTES declare it. Unlike PPTX — where slide
 *  numbers must come from `<p:sldIdLst>` because `slideN.xml` records creation
 *  order — OpenDocument's `<draw:page>` elements ARE in presentation order
 *  inside the one content.xml, so the deck order needs no indirection and can
 *  never be unreadable while the body is readable. */
function deckOf(bodyXml, styles) {
  return elementsNested(bodyXml, "page").map((page, i) => {
    const styleName = page.attrs["style-name"] ?? null;
    const fromElement = page.attrs.visibility != null ? page.attrs.visibility !== "hidden" : null;
    const fromStyle = styleName != null && styles.pageVisible.has(styleName)
      ? styles.pageVisible.get(styleName) : null;
    const visible = fromElement ?? fromStyle ?? true;     // absence means shown
    return { slide: i + 1, name: page.attrs.name ?? null, hidden: !visible, xml: page.inner };
  });
}

function odpStructure(parts) {
  if (!parts || !parts.ok) {
    return { ok: false, container: "odp", reason: parts?.why ?? "PARTS_ABSENT", part: parts?.part ?? null };
  }
  const notes = intraNotes(parts);
  const links = [];
  const items = [];
  const body = officeBody(parts.contentXml, "presentation");
  if (body == null) {
    notes.push(parts.guard
      ? "content.xml not read: over the size bound (stated in evidentiary.undetermined and by text())"
      : "content.xml unreadable or carries no <office:presentation>: element references unavailable (stated)");
  }
  const styles = parts.contentXml ? automaticStyles(parts.contentXml) : { tableDisplay: new Map(), pageVisible: new Map() };
  const deck = body != null ? deckOf(body, styles) : null;

  if (deck) {
    for (const page of deck) {
      const walked = walkPage(page.xml);
      for (const s of walked.shapes) {
        for (const href of s.hrefs) links.push(linkRecord(href, slideShapeRef(page.slide, s.shape)));
      }
      for (const href of walked.pageHrefs) links.push(linkRecord(href, slideShapeRef(page.slide)));
      /* DEC-5: SPEAKER NOTES — routinely more candid than the slide, and
         removed from every presented form. Their own envelope kind, their own
         text unit, never merged. */
      const nt = notesTextOf(page.xml);
      if (nt != null && nt.length) {
        items.push({ kind: "speaker-notes", slide: page.slide, part: CONTENT_PART, text: nt,
          source: slideShapeRef(page.slide) });
      }
      /* DEC-5: a HIDDEN slide is invisible in every presented form. Extracted
         in full, and FLAGGED everywhere shown, cited or indexed. */
      if (page.hidden) {
        items.push({ kind: "hidden-slide", slide: page.slide, part: CONTENT_PART,
          source: slideShapeRef(page.slide) });
      }
    }
  }

  /* D-346: the manifest's embedded members, and meta.xml's core properties. */
  links.push(...parts.embedded);
  items.push(...corePropertiesItems(parts));

  return {
    ok: true,
    container: "odp",
    slides: deck ? deck.length : null,       // null = honestly unknown
    links,
    counts: countPartitions(links),
    evidentiary: envelopeOf("odp", items, envelopeUndetermined(parts)),
    notes,
  };
}

function odpText(parts) {
  if (!parts || !parts.ok) {
    return { ok: false, container: "odp", reason: parts?.why ?? "PARTS_ABSENT", part: parts?.part ?? null };
  }
  /* COFF-13: `deckLength` is NULL on both branches that did not read the body —
     the deck lives only in content.xml, so a format that has not read it
     cannot answer, and the null is a statement rather than a zero. */
  if (parts.guard) {
    return {
      ok: true, container: "odp", document: null, slides: [], speakerNotes: [],
      deckLength: null,
      undetermined: [parts.guard],
      counts: { chars: 0, notesChars: 0, undetermined: 1 },
    };
  }
  const body = officeBody(parts.contentXml, "presentation");
  if (body == null) {
    const stated = parts.undetermined.find((u) => u.part === CONTENT_PART);
    return {
      ok: true, container: "odp", document: null, slides: [], speakerNotes: [],
      deckLength: null,
      undetermined: [{ reason: "main_part_unreadable", part: CONTENT_PART, why: stated?.why ?? "no_office_presentation_body" }],
      counts: { chars: 0, notesChars: 0, undetermined: 1 },
    };
  }
  const styles = automaticStyles(parts.contentXml);
  const slides = [];
  const speakerNotes = [];
  const deck = deckOf(body, styles);
  for (const page of deck) {
    const walked = walkPage(page.xml);
    const text = walked.shapes.map((s) => s.text).filter((t) => t.length).join("\n");
    /* COFF-11 / IC-100 / D-359 — the slide's shape COUNT, which `walkPage` has
       always returned as `count` and this entry has always discarded. The
       pptx.mjs decision applies verbatim and for the same reason: a shape list
       is EXHAUSTIVE, so there is no used-range-versus-capacity question to
       answer here and the count is both figures at once. `count` is the number
       of shape OPENS in document order, nested included, which is the same
       sequence `slideShapeRef` numbers against — so the bound and the
       references it bounds are counted by one walk. */
    slides.push({ slide: page.slide, ref: `slide ${page.slide}`, part: CONTENT_PART,
      hidden: page.hidden, shapes: walked.count, text });
    const nt = notesTextOf(page.xml);
    if (nt != null && nt.length) {
      speakerNotes.push({ slide: page.slide, ref: `slide ${page.slide} (notes)`, part: CONTENT_PART,
        hidden: page.hidden, text: nt });
    }
  }
  /* `document` is the deck as PRESENTED — a hidden slide's text is in it (the
     flag is what distinguishes it), speaker notes NEVER are, and the two are
     counted apart so no indexer can conflate them by accident. */
  const document = slides.map((s) => s.text).filter((t) => t.length).join("\n");
  const notesChars = speakerNotes.reduce((n, s) => n + s.text.length, 0);
  return {
    ok: true, container: "odp", document, slides, speakerNotes,
    /* COFF-13 — THE DECK'S OWN LENGTH, on pptx.mjs's key. Every `<draw:page>`
       lives in the one content.xml, so once the body is read no slide can be
       unreadable on its own and the length EQUALS the slide list — emitted
       anyway, so the wire reads one key from every deck entry rather than
       inferring it from which entry answered. */
    deckLength: deck.length,
    undetermined: [],
    counts: { chars: document.length, notesChars, undetermined: 0 },
  };
}

/* ================================================================== *
 * The three I7 entries (registered by formats.mjs — one registerFormat
 * call each there, and NOTHING anywhere else; that is the D-70 property
 * this axis exists to keep)
 * ================================================================== */

/** Raw bytes in any form `asBytes` accepts are read through parts(); anything
 *  else is taken as parts()'s own output. */
const isRawBytes = (x) => x instanceof ArrayBuffer || ArrayBuffer.isView(x);

function entryFor(row, structureOf, textOf) {
  /* R38: a stated refusal, never an exception, whatever the argument. */
  const failed = (e) => ({ ok: false, container: row.flavour, reason: `reader_failed:${e?.name ?? "Error"}`, part: null });
  const partsOf = async (partsOrBytes) => (isRawBytes(partsOrBytes) ? odfParts(row, partsOrBytes) : partsOrBytes);
  return {
    format: row.flavour,
    detect: (bytes, contentType) => detectOdf(row, bytes, contentType),
    parts: (bytes) => odfParts(row, bytes),
    /* Accept either parts() output or raw bytes, exactly as the three OOXML
       entries do, so detect→structure works uniformly at the registry seam
       while a caller that already paid for parts() does not pay twice. */
    structure: async (partsOrBytes) => {
      try { return structureOf(await partsOf(partsOrBytes)); } catch (e) { return failed(e); }
    },
    /* FW-19 / IC-124: `images` under the package's `Pictures/` directory,
       exhaustive or NULL, through the one enumerator the OOXML entries use.
       Read off the central directory, so it does NOT depend on
       META-INF/manifest.xml; the manifest walk (D-346) leaves these images
       out of `intra` so one image is never addressed twice. */
    text: async (partsOrBytes) => {
      try {
        const parts = await partsOf(partsOrBytes);
        return await withContainerImages(textOf(parts), parts, "Pictures/");
      } catch (e) { return failed(e); }
    },
  };
}

export const odtEntry = entryFor(ODT_ROW, odtStructure, odtText);
export const odsEntry = entryFor(ODS_ROW, odsStructure, odsText);
export const odpEntry = entryFor(ODP_ROW, odpStructure, odpText);

/* ==================================================================
 * D-351 — THE EVIDENTIARY DIGEST OF AN OPENDOCUMENT PACKAGE, taken over
 * the CONTAINER'S substance member and never over the envelope
 * ================================================================== */

/* WHY THIS EXISTS. A Google Drive export is Google's conversion AT FETCH
 * TIME, and its ZIP envelope differs on every request (timestamps, member
 * order — MEASUREMENTS.md 2026-09-14 §4). So `capture_sha`, the trust root,
 * differs across three fetches of a document that did not change, and C-18.3's
 * corroboration fold and monitoring's "has the substance changed?" both lost
 * the document. `capture_sha` STAYS the envelope's: this digest is the §5
 * `evidentiary` digest beside it (BIO_Content_Framework_v0_10.md §5;
 * DOCUMENT-PROFILES.md "Three digests, not one"), never a replacement.
 *
 * WHAT IT IS, so anyone can recompute it from the artifact with two stock
 * tools: the sha256 of the `content.xml` member's INFLATED bytes, exactly
 * as `readPart` proves them whole (length and CRC-32 against the central
 * directory). For `.ods` no byte of content.xml is rewritten; for `.odt` the
 * list ids Google mints per export are relabelled (D-473, below). Outside content.xml the
 * package's other members are discounted, and each discount is a region
 * judgment §5 licenses: `meta.xml` (generation timestamps, the producer's
 * stamp — mechanical), `settings.xml` (view state — mechanical), the ZIP
 * envelope (per-request timestamps and order — mechanical, MEASURED to move),
 * `styles.xml`, `Thumbnails/` and the font faces content.xml names (page
 * styles, a preview and glyph shapes — presentational; D-612, below).
 *
 * WHY content.xml CAN SPEAK FOR THE SUBSTANCE, AND WHEN IT CANNOT. OpenDocument
 * puts the whole body — every cell, its formula beside its value, every
 * annotation and tracked change — in content.xml (this module's header). What
 * it does NOT hold is the bytes of a member it REFERENCES: an image under
 * `Pictures/`, an embedded object or chart under `Object N/`. A changed image
 * under an unchanged name would leave content.xml byte-identical, and a digest
 * that folded those two captures would hide a real change — the one failure
 * §"The failure asymmetry" says matters. So a package whose content.xml
 * references ANY member of the package is UNDETERMINED, naming the member;
 * the rule is the reference, not a list of directory names, so a producer
 * that puts an image somewhere else is caught the same way.
 *
 * WHY ONLY `.ods`, AND THE SPLIT IS THE ROW'S OWN ALTERNATIVE ("state it, or
 * split .odt out"). A normalisation is added only on MEASUREMENT (DOCUMENT-
 * PROFILES.md, "The failure asymmetry"):
 *   .ods  content.xml byte-identical across exports: 3 of 3 (MEASUREMENTS.md
 *         2026-09-14 §4) and 18 of 18 over 3 census targets (M-123). No
 *         normalisation is needed and none is applied.
 *   .odt  content.xml differs raw on exports carrying a list: M-123 found the
 *         class on 2 documents — a random `xml:id` on `<text:list>`. D-473
 *         RE-MEASURED it (M-167, a fresh population of public government Docs,
 *         two rounds apart in time): the only difference in every list-bearing
 *         pair is `text:list@xml:id`, and content.xml relabelled by
 *         `odtNormalisedContentXml` is byte-stable on every pair the digest can
 *         reach. The one other class M-167 saw (`draw:frame@draw:name`,
 *         `imageN` permuted per export) occurs only where content.xml references
 *         a `Pictures/` member, which the member rule below already refuses.
 *   .odp  content.xml raw byte-stable on every pair M-167 read, but every deck
 *         in that population references a package member, and the census holds
 *         no Slides target (M-123). UNDETERMINED until a census target is
 *         measured (M-167 names it).
 * Widening this is one entry in `ODF_EVIDENTIARY_MEASURED` plus the
 * measurement it cites, and any normalisation that measurement licensed
 * (`ODF_EVIDENTIARY_NORMALISE`, below). */
export const ODF_EVIDENTIARY_VERSION = 1;
/** The flavours this module's rows define, READ OFF the rows so the control
 *  plane can ask "is this an OpenDocument format?" without learning the names
 *  (formats-odf.test.mjs pins that index.mjs spells none of them — D-70). */
export const ODF_FORMATS = Object.freeze([ODT_ROW.flavour, ODS_ROW.flavour, ODP_ROW.flavour]);
export const ODF_EVIDENTIARY_MEASURED = Object.freeze({
  ods: "content.xml byte-identical across Google exports of an unchanged document: 3/3 (MEASUREMENTS.md 2026-09-14 §4) and 18/18 over 3 census targets (M-123)",
  odt: "content.xml with text:list xml:id relabelled is byte-identical across two Google exports taken apart in time on every pair M-167 read (8 public government Docs; the only list-bearing difference is text:list@xml:id), after M-123 found the class on 2 census documents",
});
const ODF_EVIDENTIARY_UNMEASURED = Object.freeze({
  odp: "no .odp export has been measured for content.xml stability on a census target: M-167 read 8 public government Slides decks (content.xml raw byte-identical on every readable pair, every deck referencing a package member) and M-123's census holds no Slides target, so no evidentiary digest is claimed for .odp",
});

/** Package members that content.xml REFERENCES by `href`, among the members
 *  the container actually holds. Every href-bearing attribute is read, in any
 *  namespace prefix (`attrsOf` keys by local name); a scheme-bearing URL or a
 *  bare fragment is not a package member. A directory reference (`./Object 1`)
 *  matches the members under it.
 *
 *  D-612 — ONE ELEMENT IS NOT COUNTED: `font-face-uri` (by local name, any
 *  prefix; Google writes `svg:font-face-uri`). Every real Google Doc export
 *  embeds its fonts as `Fonts/fontN.ttf` and names them from
 *  `office:font-face-decls` (M-167: 8 of 8 Docs, 8–9 fonts each), so counting
 *  them refused the digest on every real Doc. A font face is presentational —
 *  how a glyph is drawn, not what the document says — the same §5 judgment that
 *  discounts `styles.xml`. The exemption is the ELEMENT, not the `Fonts/`
 *  directory: an image or embedded object (`Pictures/`, `Object N/`) is
 *  referenced from `draw:image` / `draw:object` and still refuses, wherever the
 *  producer puts it. WHAT IT DOES NOT SEE: a font whose glyphs were redrawn
 *  under an unchanged name would render differently with content.xml
 *  unchanged; the rule discounts that as it discounts a restyled styles.xml. */
const PRESENTATIONAL_REF = new Set(["font-face-uri"]);
function referencedMembers(contentXml, container) {
  const names = container.entries.map((e) => normalizePartName(e.name));
  const hit = new Set();
  const RE = tokens();
  let m;
  while ((m = RE.exec(contentXml)) !== null) {
    if (m[1] === undefined || m[0][1] === "/") continue;
    if (PRESENTATIONAL_REF.has(localOf(m[1]))) continue;
    const href = attrsOf(m[2]).href;
    if (typeof href !== "string" || !href || href.startsWith("#")) continue;
    if (/^[a-zA-Z][a-zA-Z0-9+.\-]*:/.test(href)) continue;
    const want = normalizePartName(href.replace(/^(?:\.\/)+/, "").replace(/\/+$/, ""));
    if (!want) continue;
    for (const n of names)
      if (n === want || n.startsWith(want + "/")) hit.add(n);
  }
  return [...hit];
}

/* D-473 — THE `.odt` NORMALISATION: RELABEL THE LIST IDS GOOGLE MINTS PER EXPORT.
 * M-123 found, and D-473's measurement (M-167) re-measured over a fresh population,
 * that Google writes a fresh random `xml:id` on every `<text:list>` at every
 * export (`list888038964` → `list3685929024`). An `xml:id` is an identifier
 * and says nothing a reader sees; what it CAN carry is a relationship — a list
 * whose `text:continue-list` names another list's id continues that list's
 * numbering, which a reader does see. So the ids are not stripped: each
 * `xml:id` on a `text:list` start tag is RELABELLED `L1`, `L2`, … in document
 * order, and every `text:continue-list` naming a relabelled id is rewritten to
 * its label. Two exports that differ only by the random ids then carry one
 * digest, and a list that continues a DIFFERENT list still moves it.
 *
 * WHAT IT DOES NOT REACH, so the rule is not read as wider than it is: it
 * matches the literal qualified names `text:list`, `xml:id` and
 * `text:continue-list` as Google writes them. A producer binding the text
 * namespace to another prefix is not normalised, its digest moves on every
 * export and the capture reads CHANGED — the safe direction (a change claimed,
 * never a sameness). A `text:continue-list` naming an id no list carries is
 * left verbatim. content.xml that is not valid UTF-8 is refused (null), never
 * decoded lossily, because a replacement character would make two different
 * byte strings equal for free. */
const LIST_ID_RE = /(<text:list\b[^>]*?\sxml:id\s*=\s*)("([^"]*)"|'([^']*)')/g;
const CONTINUE_RE = /(\stext:continue-list\s*=\s*)("([^"]*)"|'([^']*)')/g;
const UTF8_STRICT = new TextDecoder("utf-8", { fatal: true });
/** content.xml's bytes with Google's per-export list ids relabelled, or null
 *  when the bytes are not valid UTF-8. Exported so the measurement instrument
 *  digests exactly what the product digests. */
export function odtNormalisedContentXml(bytes) {
  let xml;
  try { xml = UTF8_STRICT.decode(bytes); } catch { return null; }
  const label = new Map();
  let out = xml.replace(LIST_ID_RE, (m, head, q, dq, sq) => {
    const id = dq ?? sq;
    if (!label.has(id)) label.set(id, `L${label.size + 1}`);
    return `${head}"${label.get(id)}"`;
  });
  out = out.replace(CONTINUE_RE, (m, head, q, dq, sq) => {
    const id = dq ?? sq;
    return label.has(id) ? `${head}"${label.get(id)}"` : m;
  });
  return new TextEncoder().encode(out);
}
/** Per flavour, the normalisation applied to content.xml before it is digested.
 *  `.ods` needs none (content.xml measured byte-stable, M-123). */
const ODF_EVIDENTIARY_NORMALISE = Object.freeze({
  odt: { name: "odt-list-ids v1 (xml:id on text:list relabelled in document order, text:continue-list rewritten to match)",
         apply: odtNormalisedContentXml },
});

/** The evidentiary digest of an OpenDocument package, or a stated refusal.
 *  `sha256Hex` is the caller's hasher (the plane's, so identity and this digest
 *  are named by one function). Returns
 *    { determined:true, flavour, over:"content.xml", evidentiary, basis }
 *  or { determined:false, flavour|null, evidentiary:null, basis }. Never throws
 *  on bad bytes: every failure is a sentence. */
export async function odfEvidentiaryDigest(bytes, sha256Hex) {
  try { return await odfEvidentiaryDigestUnguarded(bytes, sha256Hex); } catch (e) {
    return { determined: false, flavour: null, evidentiary: null,
      basis: `the digest could not be taken (${e?.name ?? "Error"}: ${e?.message ?? "no message"}), so none is claimed` };
  }
}

async function odfEvidentiaryDigestUnguarded(bytes, sha256Hex) {
  const b = asBytes(bytes) ?? new Uint8Array(0);
  const no = (flavour, basis) => ({ determined: false, flavour, evidentiary: null, basis });
  /* CERTAIN detection only — the mimetype member read first, stored,
     CRC-verified, compared exactly, and the main part present. A content type
     or a 1 KiB head is "likely", and "likely" never asserts sameness. */
  let row = null;
  for (const r of [ODT_ROW, ODS_ROW, ODP_ROW]) {
    const d = detectOdf(r, b, null);
    if (d && d.confidence === "certain") { row = r; break; }
  }
  if (!row) return no(null, "the bytes are not an OpenDocument package detected with certainty, so no container digest was taken");
  const flavour = row.flavour;
  if (!ODF_EVIDENTIARY_MEASURED[flavour])
    return no(flavour, ODF_EVIDENTIARY_UNMEASURED[flavour]
      || `no .${flavour} export has been measured for content.xml stability, so no evidentiary digest is claimed`);
  const container = readContainer(b);
  if (!container.ok) return no(flavour, `the package's central directory could not be read (${container.why})`);
  const declared = declaredTextBytes(container, (n) => n === CONTENT_PART);
  const guard = sizeGuard(declared.total);
  if (!guard.ok) return no(flavour, `content.xml is over the declared-uncompressed text bound (${guard.why || "size_guard"}), so it was not inflated and no digest was taken`);
  const read = await readPart(b, container, CONTENT_PART);
  if (!read.ok) return no(flavour, `content.xml could not be read whole (${read.why})`);
  /* STRICT UTF-8 for every flavour, before anything is read out of it: a
     lossy decode could hide an href behind a replacement character, and a
     digest of bytes that are not the text they claim to be speaks for
     nothing (R37). */
  let xml;
  try { xml = UTF8_STRICT.decode(read.bytes); } catch {
    return no(flavour, "content.xml is not valid UTF-8, so it was not decoded lossily and no digest was taken");
  }
  const refs = referencedMembers(xml, container);
  if (refs.length)
    return no(flavour, `content.xml references ${refs.length} package member(s) whose bytes it does not hold (${refs.slice(0, 3).join(", ")}${refs.length > 3 ? ", …" : ""}); a digest of content.xml cannot speak for them, so none is claimed`);
  const norm = ODF_EVIDENTIARY_NORMALISE[flavour];
  const digested = norm ? norm.apply(read.bytes) : read.bytes;
  if (!digested) return no(flavour, "content.xml is not valid UTF-8, so the normalisation was not applied and no digest was taken");
  return {
    determined: true, flavour, over: CONTENT_PART,
    evidentiary: await sha256Hex(digested),
    basis: `the sha256 of the .${flavour} package's content.xml member (inflated, length and CRC-32 verified)${norm ? `, normalised by ${norm.name}` : ", no byte rewritten"}, odf-evidentiary v${ODF_EVIDENTIARY_VERSION}; the ZIP envelope, meta.xml, settings.xml, styles.xml, thumbnails and embedded font faces are discounted; measured: ${ODF_EVIDENTIARY_MEASURED[flavour]}`,
  };
}
