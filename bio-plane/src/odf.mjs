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
 *           part, hidden, text}], speakerNotes:[{slide, ref, part, hidden,
 *           text}], undetermined, counts:{chars, notesChars, undetermined}}.
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
 *   NOT CARRIED BY content.xml — SAID, on every entry, in
 *   `evidentiary.undetermined`:
 *     core-properties (creator, title, created/modified, revision) live in
 *           `meta.xml`, which is a DIFFERENT part of the package. The OOXML
 *           entries emit a `core-properties` item from `docProps/core.xml`;
 *           these entries emit NONE, and its absence from `items[]` is NOT
 *           evidence the document carries no author. The named marker
 *           `{part:"meta.xml", why:"outside_content_xml_not_read"}` is what
 *           keeps that distinction visible.
 *     embedded objects (`Object 1/`, `Pictures/`) are separate package
 *           members listed in `META-INF/manifest.xml`. The OOXML entries
 *           content-address each container's own `embeddings/` directory
 *           into the `intra` partition;
 *           these entries read one part and so emit NO `intra` link, with
 *           `{part:"META-INF/manifest.xml", why:"outside_content_xml_not_read"}`
 *           saying so. An empty `intra` count here means NOT LOOKED, not NONE
 *           PRESENT.
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
  discriminate, sizeGuard, declaredTextBytes,
  CONTAINER_FLAVOURS, ODF_MIMETYPE_PART, ODF_MANIFEST_PART, ODF_MIMETYPE_MAX_BYTES,
} from "./ooxml.mjs";
import { linkWrapper } from "./subresources.mjs";
import { docParaRef } from "./docx.mjs";
import { sheetCellRef } from "./formats-xlsx.mjs";
import { slideShapeRef } from "./pptx.mjs";

const UTF8 = new TextDecoder("utf-8", { fatal: false });

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

/** `meta.xml` and `META-INF/manifest.xml` are NAMED so the two DEC-5 absences
 *  above can be stated with the part that would have carried them. Neither is
 *  read. */
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
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return { amp: "&", lt: "<", gt: ">", quot: "'" === e ? "'" : '"', apos: "'" }[e] ?? m;
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
function elementsNested(xml, localName) {
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
      }
      continue;
    }
    if (selfClosed) {
      if (depth === 0) out.push({ attrs: attrsOf(m[2]), inner: "" });
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

function detectOdf(row, bytes, contentType) {
  if (bytes) {
    if (!hasZipMagic(bytes)) return null;
    const container = readContainer(bytes);
    if (!container.ok) return null;                       // the 1 KiB acquire seam: no EOCD, no claim
    /* The FIRST-member requirement, checked the way COFF-9 checks it: the
     * mimetype must head the central directory. A package that fails it is
     * not this entry's — `discriminate()` will state WHY when parts() runs;
     * answering null here keeps detect from claiming what the container
     * cannot support. */
    const first = container.entries[0];
    if (!first || normalizePartName(first.name) !== ODF_MIMETYPE_PART) return null;
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
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);

  /* The full discrimination (magic + first-and-stored mimetype + the declared
   * main part present), through COFF-9's own branch. A container that is not
   * honestly this flavour yields a STATED refusal, never a walk of something
   * else's parts. */
  const d = await discriminate(b);
  if (!d.ok) return { ok: false, container: row.flavour, why: d.why, signals: d.signals };
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
      flavourDeclared: d.flavourDeclared ?? null,
      signals: d.signals,
    };
  }

  const container = readContainer(b);
  if (!container.ok) return { ok: false, container: row.flavour, why: container.why, signals: d.signals };

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

  /* THE TWO NAMED ABSENCES (DEC-5). These are pushed on EVERY read, including
   * a completely successful one, because their whole purpose is to stop a
   * consumer reading an absent `core-properties` item as "this document has
   * no author" or a zero `intra` count as "this document embeds nothing".
   * `CLAUDE.md`: absence at one level is not evidence of absence at the next,
   * and saying which is true is a first-class obligation. */
  undetermined.push({
    part: META_PART,
    why: "outside_content_xml_not_read",
    detail: "OpenDocument carries the core properties (creator, title, created/modified, revision) in meta.xml; this entry reads content.xml only, so NO core-properties item is emitted and its absence is not evidence the document carries none",
  });
  undetermined.push({
    part: ODF_MANIFEST_PART,
    why: "outside_content_xml_not_read",
    detail: "OpenDocument lists embedded objects and images as separate package members in META-INF/manifest.xml; this entry reads content.xml only, so NO intra link is content-addressed and a zero intra count means NOT LOOKED, never NONE PRESENT",
  });

  return { ok: true, format: row.flavour, row, bytes: b, container, contentXml, declared, guard, undetermined };
}

/* The body of content.xml for a given office body kind, or null. Every walk
 * below starts here rather than at the document root, so that automatic
 * styles and font declarations can never be mistaken for content. */
function officeBody(contentXml, kind) {
  if (contentXml == null) return null;
  const body = elementsNested(contentXml, "body")[0];
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

/* The note every entry carries, so the `intra`-is-zero fact is visible in
 * `notes` as well as in the envelope — a reader scanning either surface must
 * meet it. */
const NO_INTRA_NOTE = "no intra link is emitted: embedded members live outside content.xml (stated in evidentiary.undetermined)";

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
      const ann = elementsNested(rest, "annotation")[0];
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

/** The inserted text of a change region, taken from the BODY between its
 *  `<text:change-start>` and `<text:change-end>` marks. The declaration block
 *  carries a deletion's wording but NOT an insertion's — the insertion is in
 *  the document as served, which is why it is also in the text stream. */
function insertedTextFor(bodyXml, id) {
  const served = stripElement(bodyXml, "tracked-changes");
  const startRe = new RegExp(`<(?:[\\w.-]+:)?change-start\\b[^>]*change-id="${id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^>]*/?>`);
  const endRe = new RegExp(`<(?:[\\w.-]+:)?change-end\\b[^>]*change-id="${id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^>]*/?>`);
  const s = served.match(startRe);
  const e = served.match(endRe);
  if (!s || !e || e.index < s.index) return null;   // null, never "" — absent is not empty
  return visibleText(served.slice(s.index + s[0].length, e.index));
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
  const notes = [NO_INTRA_NOTE];
  const links = [];
  const items = [];
  const body = officeBody(parts.contentXml, "text");
  if (!body) {
    notes.push(parts.guard
      ? "content.xml not read: over the size bound (stated in evidentiary.undetermined and by text())"
      : "content.xml unreadable or carries no <office:text>: element references unavailable (stated)");
  }

  let paragraphs = null;
  if (body) {
    const walk = walkTextBody(body);
    paragraphs = walk.paragraphs.length;

    for (const h of walk.hyperlinks) {
      links.push(linkRecord(h.href, h.para == null ? null : docParaRef(h.para)));
    }

    /* DEC-5: tracked changes, author/date/superseded-wording, located to the
     * paragraph the body's mark sits in. A region the body never marks is
     * still carried — with source null and the reason stated — because the
     * change is evidence whether or not we can place it. */
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
      else item.text = c.id != null ? insertedTextFor(body, c.id) : null;
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

function odtText(parts) {
  if (!parts || !parts.ok) {
    return { ok: false, container: "odt", reason: parts?.why ?? "PARTS_ABSENT", part: parts?.part ?? null };
  }
  if (parts.guard) {
    return {
      ok: true, container: "odt", document: null, paragraphs: [],
      undetermined: [parts.guard],           // the marker VERBATIM, never a truncation
      counts: { chars: 0, undetermined: 1 },
    };
  }
  const body = officeBody(parts.contentXml, "text");
  if (!body) {
    const stated = parts.undetermined.find((u) => u.part === CONTENT_PART && u.why !== "outside_content_xml_not_read");
    return {
      ok: true, container: "odt", document: null, paragraphs: [],
      undetermined: [{ reason: "main_part_unreadable", part: CONTENT_PART, why: stated?.why ?? "no_office_text_body" }],
      counts: { chars: 0, undetermined: 1 },
    };
  }
  const walk = walkTextBody(body);
  const paragraphs = walk.paragraphs.map((p) => ({ para: p.para, ref: `¶${p.para + 1}`, text: p.text }));
  const document = paragraphs.map((p) => p.text).filter((t) => t.length).join("\n");
  return {
    ok: true, container: "odt", document, paragraphs,
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
  const notes = [NO_INTRA_NOTE];
  const links = [];
  const items = [];
  const body = officeBody(parts.contentXml, "spreadsheet");
  if (!body) {
    notes.push(parts.guard
      ? "content.xml not read: over the size bound (stated in evidentiary.undetermined and by text())"
      : "content.xml unreadable or carries no <office:spreadsheet>: element references unavailable (stated)");
  }
  if (parts.guard) notes.push("text_parts_over_bound");

  const styles = parts.contentXml ? automaticStyles(parts.contentXml) : { tableDisplay: new Map(), pageVisible: new Map() };
  const sheets = body ? sheetsOf(body, styles) : [];

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
  if (!body) {
    const stated = parts.undetermined.find((u) => u.part === CONTENT_PART && u.why !== "outside_content_xml_not_read");
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
    outSheets.push({ sheet: sheet.index, name: sheet.name, hidden: sheet.hidden, text, undetermined: [] });
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
  while ((m = RE.exec(slideOnly)) !== null) {
    if (m[1] === undefined) continue;
    const name = localOf(m[1]);
    if (!ODP_SHAPE_TAGS.has(name)) continue;
    const closing = m[0][1] === "/";
    const selfClosed = m[3] === "/";
    if (closing) {
      const o = open.pop();
      if (o) shapes.push({ shape: o.index, inner: slideOnly.slice(o.start, m.index) });
      continue;
    }
    index++;
    if (selfClosed) { shapes.push({ shape: index, inner: "" }); continue; }
    open.push({ index, start: RE.lastIndex });
  }
  shapes.sort((a, b) => a.shape - b.shape);
  return {
    count: index + 1,
    shapes: shapes.map((s) => ({
      shape: s.shape,
      /* A group's text is the text of the shapes inside it, which are their
         own entries; taking the group's inner markup would double-count it in
         the slide's text, so a shape's OWN text is its `<draw:text-box>`
         paragraphs only. */
      text: elementsNested(s.inner, "text-box").map((tb) =>
        elementsNested(tb.inner, "p").map((p) => visibleText(p.inner)).join("\n")).join("\n"),
      hrefs: hrefsIn(s.inner),
    })),
  };
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
  const notes = [NO_INTRA_NOTE];
  const links = [];
  const items = [];
  const body = officeBody(parts.contentXml, "presentation");
  if (!body) {
    notes.push(parts.guard
      ? "content.xml not read: over the size bound (stated in evidentiary.undetermined and by text())"
      : "content.xml unreadable or carries no <office:presentation>: element references unavailable (stated)");
  }
  const styles = parts.contentXml ? automaticStyles(parts.contentXml) : { tableDisplay: new Map(), pageVisible: new Map() };
  const deck = body ? deckOf(body, styles) : null;

  if (deck) {
    for (const page of deck) {
      const walked = walkPage(page.xml);
      for (const s of walked.shapes) {
        for (const href of s.hrefs) links.push(linkRecord(href, slideShapeRef(page.slide, s.shape)));
      }
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
  if (parts.guard) {
    return {
      ok: true, container: "odp", document: null, slides: [], speakerNotes: [],
      undetermined: [parts.guard],
      counts: { chars: 0, notesChars: 0, undetermined: 1 },
    };
  }
  const body = officeBody(parts.contentXml, "presentation");
  if (!body) {
    const stated = parts.undetermined.find((u) => u.part === CONTENT_PART && u.why !== "outside_content_xml_not_read");
    return {
      ok: true, container: "odp", document: null, slides: [], speakerNotes: [],
      undetermined: [{ reason: "main_part_unreadable", part: CONTENT_PART, why: stated?.why ?? "no_office_presentation_body" }],
      counts: { chars: 0, notesChars: 0, undetermined: 1 },
    };
  }
  const styles = automaticStyles(parts.contentXml);
  const slides = [];
  const speakerNotes = [];
  for (const page of deckOf(body, styles)) {
    const walked = walkPage(page.xml);
    const text = walked.shapes.map((s) => s.text).filter((t) => t.length).join("\n");
    slides.push({ slide: page.slide, ref: `slide ${page.slide}`, part: CONTENT_PART, hidden: page.hidden, text });
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
    undetermined: [],
    counts: { chars: document.length, notesChars, undetermined: 0 },
  };
}

/* ================================================================== *
 * The three I7 entries (registered by formats.mjs — one registerFormat
 * call each there, and NOTHING anywhere else; that is the D-70 property
 * this axis exists to keep)
 * ================================================================== */

function entryFor(row, structureOf, textOf) {
  return {
    format: row.flavour,
    detect: (bytes, contentType) => detectOdf(row, bytes, contentType),
    parts: (bytes) => odfParts(row, bytes),
    /* Accept either parts() output or raw bytes, exactly as the three OOXML
       entries do, so detect→structure works uniformly at the registry seam
       while a caller that already paid for parts() does not pay twice. */
    structure: async (partsOrBytes) => structureOf(
      partsOrBytes instanceof Uint8Array || partsOrBytes instanceof ArrayBuffer
        ? await odfParts(row, partsOrBytes) : partsOrBytes),
    text: async (partsOrBytes) => textOf(
      partsOrBytes instanceof Uint8Array || partsOrBytes instanceof ArrayBuffer
        ? await odfParts(row, partsOrBytes) : partsOrBytes),
  };
}

export const odtEntry = entryFor(ODT_ROW, odtStructure, odtText);
export const odsEntry = entryFor(ODS_ROW, odsStructure, odsText);
export const odpEntry = entryFor(ODP_ROW, odpStructure, odpText);
