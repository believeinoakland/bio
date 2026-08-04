/* The PPTX registry entry (I7, QUEUE COFF-5) — the presentation format on the
 * FORMAT axis, built on ooxml.mjs's container primitives, shaped exactly as
 * docx.mjs (COFF-4, the accepted first-lander) shaped the office entries.
 *
 * WHAT IT EMITS (I2 1.1.0, links + the shared IC-2 evidentiary envelope):
 *
 *   structure(parts) ->
 *     { ok:true, container:"pptx", slides:<int>,
 *       links:[ LinkRecord... ],           // the SAME partitions HTML/PDF/DOCX
 *       counts:{anchor,intra,deferred,refused,undetermined},   // use, wrapped
 *       evidentiary:{ ... },               // IC-2 CONFIRMED — no variant
 *       notes:[...] }                      // remarks (NOT speaker notes)
 *
 *   - ppt/slides/_rels/slideN.xml.rels `TargetMode="External"` ->
 *     deferred/refused, wrapped by importing subresources.mjs's ONE
 *     `linkWrapper` — the parity property formats-docx.test.mjs pins for DOCX
 *     is pinned here for PPTX the same way.
 *   - an `<a:hlinkClick>` whose relationship targets ANOTHER SLIDE (internal,
 *     type …/slide) -> `anchor`, the way a DOCX bookmark link and a PDF GoTo
 *     are; a jump naming a slide the deck does not contain is a STATED
 *     undetermined, never an invented target.
 *   - ppt/embeddings/* -> `intra`, content-addressed by sha256 exactly as
 *     PDF and DOCX embedded files are.
 *   - An unreadable .rels part or embedding is CARRIED as an undetermined
 *     LinkRecord naming the part and why.
 *
 *   ELEMENT REFERENCES are `{kind:"slide-shape", ref:"slide <1-based>",
 *   slide:<1-based>[, shape:<0-based>]}` per IC-1 as RESOLVED. `slide` is
 *   1-based and equals the number in `ref` (the IC-1 example's own reading:
 *   ref "slide 7", slide 7). SLIDE NUMBERS COME FROM THE DECK ORDER THE BYTES
 *   DECLARE — ppt/presentation.xml's `<p:sldIdLst>` resolved through the
 *   presentation's .rels — never from slideN.xml filenames, which record
 *   creation order and survive reordering. When that declaration cannot be
 *   read, slides are honestly UNNUMBERED (slide:null in text units, source
 *   null on references) with the unreadable part stated — never numbered off
 *   the filename convention. `shape` is the 0-based index into the slide's
 *   shape-element sequence (<p:sp>/<p:pic>/<p:graphicFrame>/<p:cxnSp>/
 *   <p:grpSp> opens, in document order, nested included — one sequence per
 *   slide, so a shape index means the same thing to every reference into that
 *   slide) and appears only when the reference genuinely targets a shape;
 *   when only the slide is honest (a rel carried without body usage — the
 *   .rels part name itself ties it to the slide), the reference stops there.
 *
 *   text(parts) -> { ok:true, container:"pptx", document,
 *     slides:[ {slide, ref:"slide <n>", part, text} ],       // the per-unit
 *     speakerNotes:[ {slide, ref:"slide <n> (notes)", part, text} ], // lists
 *     undetermined:[ Marker... ], counts:{chars, notesChars, undetermined} }
 *   — `<a:t>` runs per slide, `<a:p>` paragraphs newline-joined. A PPTX has
 *   no pages, so the per-unit list is `slides`, the IC-2 pageless degenerate
 *   form CONFIRMED with the unit named for what it IS.
 *
 *   THE EVIDENTIARY CORE (DEC-5): notesSlide SPEAKER NOTES — routinely more
 *   candid than the slide — are emitted PER SLIDE and DISTINGUISHABLE from
 *   slide text EVERYWHERE shown, cited or indexed, never merged:
 *     - a distinct envelope kind: { kind:"speaker-notes", slide, part, text,
 *       source:<slide-shape ref | null> }
 *     - a distinct text unit list: `speakerNotes`, whose refs read
 *       "slide N (notes)" — never appended to `slides[].text` and NEVER in
 *       `document`, which is the deck as presented; counts split chars /
 *       notesChars so an indexer cannot conflate them by accident.
 *     { kind:"core-properties", creator, lastModifiedBy, revision, ... }
 *   under the ONE accepted envelope (IC-2, CONFIRMED from this code):
 *     { container, kinds:[...], items:[...], undetermined:[{part,why}...],
 *       counts:{<kind>:n} }
 *   docProps metadata rides the envelope exactly as docx.mjs carries it.
 *   Absent attributes are null, never invented; an unreadable notesSlide is a
 *   STATED `{part, why}` in the envelope's own `undetermined`.
 *
 * DETECTION — the ladder both prior entries follow (COFF-1's note):
 *   - bytes: ZIP magic + a READABLE central directory + BOTH
 *     `[Content_Types].xml` and `ppt/presentation.xml` present -> "likely".
 *     Not "certain": the OPC content-type declaration is deflated and out of
 *     reach of the sync detect; `parts()` runs the full async `discriminate()`
 *     and tells the truth.
 *   - a bare `PK\x03\x04` sniff (the acquire-time 1 KiB seam: no EOCD, no
 *     central directory) answers NULL — a renamed plain ZIP is not a .pptx.
 *   - content type alone: the exact .pptx MIME type -> "likely".
 *
 * SIZE GUARD: full text extraction is refused as a STATED text-undetermined
 * when the DECLARED UNCOMPRESSED bytes of the text parts we would inflate
 * (ppt/slides/*.xml + ppt/notesSlides/*.xml, summed from the central
 * directory — the COFF-6 metric) exceed ooxml.mjs's bound. Container walk,
 * rels, presentation.xml (structural, tiny) and core-properties still run;
 * nothing is silently truncated.
 *
 * This module ASSERTS nothing about meaning (FRAMEWORK's, through I2) and
 * WRITES nothing. Never invent structure: everything unreadable is stated.
 */

import { linkWrapper } from "./subresources.mjs";
import {
  hasZipMagic, readContainer, readPart, normalizePartName,
  discriminate, walkRels, relsPartFor, sizeGuard,
  CORE_PROPERTIES_PART, readCoreProperties,
} from "./ooxml.mjs";

const UTF8 = new TextDecoder("utf-8", { fatal: false });

export const PPTX_CONTENT_TYPE =
  "application/vnd.openxmlformats-officedocument.presentationml.presentation";
const CONTENT_TYPES_PART = "[Content_Types].xml";
const MAIN_PART = "ppt/presentation.xml";
const EMBEDDINGS_DIR = "ppt/embeddings/";
const SLIDE_PART_RE = /^ppt\/slides\/[^/]+\.xml$/;
const NOTES_PART_RE = /^ppt\/notesSlides\/[^/]+\.xml$/;

/* ------------------------------------------------------------------ *
 * The IC-1 element reference
 * ------------------------------------------------------------------ */

/** `{kind:"slide-shape", ref:"slide <1-based>", slide:<1-based>[, shape:<0-based>]}`.
 *  `slide` is 1-based and equals the number the human-readable `ref` shows
 *  (IC-1's own example: ref "slide 7", slide 7). `shape` is included only
 *  when the reference genuinely targets a shape. */
export function slideShapeRef(slide, shape = null) {
  const ref = { kind: "slide-shape", ref: `slide ${slide}`, slide };
  if (shape != null) ref.shape = shape;
  return ref;
}

/* ------------------------------------------------------------------ *
 * Minimal XML plumbing (local: ooxml.mjs's helpers are private, and the
 * slide walk needs shape-sequence tracking its flat matchers avoid —
 * the same duplication docx.mjs recorded for the same reason)
 * ------------------------------------------------------------------ */

function decodeEntities(s) {
  return s.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (m, e) => {
    if (e[0] === "#") {
      const code = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" }[e] ?? m;
  });
}

/* Attributes by LOCAL name (prefix-agnostic, entity-decoded). */
function attrsOf(raw) {
  const attrs = {};
  for (const a of (raw || "").matchAll(/([\w.-]+(?::[\w.-]+)?)\s*=\s*("([^"]*)"|'([^']*)')/g)) {
    const local = a[1].includes(":") ? a[1].split(":").pop() : a[1];
    attrs[local] = decodeEntities(a[3] ?? a[4] ?? "");
  }
  return attrs;
}

const TOKEN_RE = /<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<\?[\s\S]*?\?>|<\/?([\w.-]+(?::[\w.-]+)?)((?:[^>"']|"[^"]*"|'[^']*')*?)(\/?)>/g;
const localOf = (name) => (name.includes(":") ? name.split(":").pop() : name);

/* The DrawingML shape elements whose opens advance the 0-based shape index —
 * <p:spTree> children and their nested kin, one sequence per slide. */
const SHAPE_TAGS = new Set(["sp", "pic", "graphicFrame", "cxnSp", "grpSp"]);

/* ------------------------------------------------------------------ *
 * The slide walk — ONE pass over a slide (or notesSlide) part collecting
 * everything structure(), text() and the envelope need, in document order
 * ------------------------------------------------------------------ */

/** Walk a PresentationML slide or notesSlide part. Returns
 *  { paragraphs:[string...], text, shapes:<int>,
 *    hlinks:[{rid,shape}], ridUsage:Map(rid -> shape|null) }.
 *
 *  Text: `<a:t>` runs concatenated per `<a:p>` paragraph; `<a:br>` is a
 *  newline within its paragraph; `text` is the non-empty paragraphs
 *  newline-joined. An `<a:fld>`'s cached literal is included — it IS in the
 *  bytes. Shape index: every SHAPE_TAGS open, 0-based, in document order
 *  (nested group members included) — one sequence per slide, so a shape
 *  index means the same thing to every reference into that slide. */
export function walkSlide(xml) {
  const paragraphs = [];
  const hlinks = [];
  const ridUsage = new Map();
  let shape = -1;
  let cur = null;       // current <a:p> text, when inside one
  let inText = false;   // inside an <a:t>

  const noteRid = (attrs) => {
    for (const key of ["id", "embed", "link"]) {
      const v = attrs[key];
      if (typeof v === "string" && /^rId/.test(v) && !ridUsage.has(v))
        ridUsage.set(v, shape >= 0 ? shape : null);
    }
  };

  TOKEN_RE.lastIndex = 0;
  let m, prev = 0;
  while ((m = TOKEN_RE.exec(xml)) !== null) {
    if (inText && cur != null && m.index > prev) cur += decodeEntities(xml.slice(prev, m.index));
    prev = TOKEN_RE.lastIndex;
    if (m[1] === undefined) continue; // comment / CDATA / PI
    const name = localOf(m[1]);
    const selfClosed = m[3] === "/";
    const closing = m[0][1] === "/";

    if (closing) {
      if (name === "t") inText = false;
      else if (name === "p") { if (cur != null) { paragraphs.push(cur); cur = null; } }
      continue;
    }

    if (SHAPE_TAGS.has(name)) shape++;
    const attrs = m[2] && m[2].includes("=") ? attrsOf(m[2]) : {};
    switch (name) {
      case "p":
        if (!selfClosed) cur = "";
        break;
      case "t":
        if (!selfClosed) inText = true;
        break;
      case "br":
        if (cur != null) cur += "\n";
        break;
      case "hlinkClick":
        noteRid(attrs);
        if (attrs.id && /^rId/.test(attrs.id))
          hlinks.push({ rid: attrs.id, shape: shape >= 0 ? shape : null });
        break;
      default:
        noteRid(attrs);
    }
  }
  const text = paragraphs.filter((t) => t.length).join("\n");
  return { paragraphs, text, shapes: shape + 1, hlinks, ridUsage };
}

/* ------------------------------------------------------------------ *
 * Link classification — the same partition rule pdfstructure and docx
 * apply (http/https and bare relatives -> deferred; other schemes refused)
 * ------------------------------------------------------------------ */

function classifyUri(uri) {
  const m = /^([a-zA-Z][a-zA-Z0-9+.\-]*):/.exec(uri || "");
  const scheme = m ? m[1].toLowerCase() : null;
  if (scheme === "http" || scheme === "https") return "deferred";
  if (!scheme && uri) return "deferred";
  return "refused";
}

function deferredOrRefusedRecord(uri, source) {
  const partition = classifyUri(uri);
  return {
    partition,
    wrapper: partition === "deferred" ? linkWrapper.deferred(uri) : linkWrapper.refused(uri),
    target: { url: uri },
    source,
  };
}

function undeterminedRecord(source, why, extra = {}) {
  return { partition: "undetermined", wrapper: null, target: { why, ...extra }, source };
}

const HEX = "0123456789abcdef";
async function sha256Hex(u8) {
  const d = await crypto.subtle.digest("SHA-256", u8);
  const b = new Uint8Array(d);
  let out = "";
  for (let i = 0; i < b.length; i++) out += HEX[b[i] >> 4] + HEX[b[i] & 15];
  return out;
}

/* Resolve a rels Target against the source part's directory ("slide3.xml"
 * relative to "ppt/slides/" -> "ppt/slides/slide3.xml"; a leading "/" is
 * package-root). */
function resolveRelTarget(relsPart, target) {
  const t = String(target || "");
  if (t.startsWith("/")) return normalizePartName(t);
  const baseDir = relsPart.replace(/_rels\/[^/]*\.rels$/, "");
  const segs = (baseDir + t).split("/");
  const out = [];
  for (const s of segs) {
    if (s === "" || s === ".") continue;
    if (s === "..") out.pop();
    else out.push(s);
  }
  return out.join("/");
}

/* ------------------------------------------------------------------ *
 * parts() — the container walk (I7 slot 2)
 * ------------------------------------------------------------------ */

/** Read everything structure()/text() will need, honestly:
 *  { ok:true, format:"pptx", bytes, container, mainPart,
 *    presentationXml|null,
 *    order|null,                       // slide part names in DECLARED deck
 *                                      // order (sldIdLst), null when the
 *                                      // declaration cannot be read
 *    slideParts, notesParts,           // central-directory inventories
 *    slideXml, notesXml,               // Map(part -> xml) for readable parts
 *    notesOf,                          // Map(slide part -> its notesSlide part)
 *    rels, core|null,
 *    guard|null,                       // the sizeGuard marker when over bound
 *    undetermined:[{part,why}...] }    // parts that exist but cannot be read
 *  or { ok:false, why, signals } when the bytes are not a readable PPTX. */
async function pptxParts(bytes) {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const d = await discriminate(b);
  if (!d.ok) return { ok: false, why: d.why, signals: d.signals };
  if (d.format !== "pptx") {
    return {
      ok: false,
      why: d.format === "undetermined" ? d.why : `not_pptx:${d.format}`,
      signals: d.signals,
    };
  }
  const container = readContainer(b);
  if (!container.ok) return { ok: false, why: container.why, signals: d.signals };

  const undetermined = [];
  const mainPart = normalizePartName(d.mainPart || MAIN_PART);

  /* The inventories, central-directory order. */
  const slideParts = [];
  const notesParts = [];
  for (const e of container.entries) {
    const n = normalizePartName(e.name);
    if (SLIDE_PART_RE.test(n)) slideParts.push(n);
    else if (NOTES_PART_RE.test(n)) notesParts.push(n);
  }

  /* The COFF-6 metric: DECLARED UNCOMPRESSED bytes of the text parts we would
   * inflate (slides + speaker notes), summed from the central directory
   * BEFORE any inflation. */
  let declaredTextBytes = 0;
  for (const n of [...slideParts, ...notesParts]) {
    const e = container.byName.get(n);
    if (e) declaredTextBytes += e.uncompressedSize;
  }
  const guardR = sizeGuard(declaredTextBytes);
  const guard = guardR.ok ? null : guardR;

  const rels = await walkRels(b, container);

  /* ppt/presentation.xml is STRUCTURAL (the deck-order declaration), tiny,
   * and read regardless of the text guard — as docx reads rels over-bound. */
  let presentationXml = null;
  const main = await readPart(b, container, mainPart);
  if (main.ok) presentationXml = UTF8.decode(main.bytes);
  else undetermined.push({ part: mainPart, why: main.why });

  /* Deck order: <p:sldIdLst>'s sldId sequence, each resolved through the
   * presentation part's .rels. The r:id is the PREFIXED :id attribute —
   * sldId also carries its own unprefixed id="", which is not a rel. */
  let order = null;
  if (presentationXml != null) {
    const presRelsPart = relsPartFor(mainPart);
    const presRels = rels.byPart.find((p) => p.part === presRelsPart);
    if (!presRels) {
      const stated = rels.undetermined.find((u) => u.part === presRelsPart);
      undetermined.push({ part: presRelsPart, why: stated?.why ?? "part_absent" });
    } else {
      const byId = new Map(presRels.relationships.map((r) => [r.id, r]));
      order = [];
      const sldIdRe = /<(?:[\w.-]+:)?sldId\b((?:[^>"']|"[^"]*"|'[^']*')*?)\/?>/g;
      for (const m of presentationXml.matchAll(sldIdRe)) {
        const rid = m[1].match(/[\w.-]+:id\s*=\s*(?:"([^"]*)"|'([^']*)')/);
        const id = rid ? (rid[1] ?? rid[2]) : null;
        const rel = id != null ? byId.get(id) : null;
        if (!rel || rel.external || !rel.target) {
          order.push(null); // the slot counts; the slide it named is unresolvable
          undetermined.push({ part: mainPart, why: `sldid_rel_unresolved:${id ?? "no_rid"}` });
          continue;
        }
        order.push(resolveRelTarget(presRelsPart, rel.target));
      }
    }
  }

  /* Slide and notes XML, guard permitting. */
  const slideXml = new Map();
  const notesXml = new Map();
  if (!guard) {
    for (const n of slideParts) {
      const r = await readPart(b, container, n);
      if (r.ok) slideXml.set(n, UTF8.decode(r.bytes));
      else undetermined.push({ part: n, why: r.why });
    }
    for (const n of notesParts) {
      const r = await readPart(b, container, n);
      if (r.ok) notesXml.set(n, UTF8.decode(r.bytes));
      else undetermined.push({ part: n, why: r.why });
    }
  }

  /* slide -> its notesSlide, through each slide's own .rels (the declaration
   * in the bytes, never the filename convention). */
  const notesOf = new Map();
  for (const bp of rels.byPart) {
    const m = bp.part.match(/^(ppt\/slides\/)_rels\/([^/]+\.xml)\.rels$/);
    if (!m) continue;
    const slidePart = m[1] + m[2];
    for (const r of bp.relationships) {
      if (!r.external && r.type && r.type.endsWith("/notesSlide") && r.target) {
        notesOf.set(slidePart, resolveRelTarget(bp.part, r.target));
        break;
      }
    }
  }

  let core = null;
  if (container.byName.has(CORE_PROPERTIES_PART)) {
    const c = await readCoreProperties(b, container);
    if (c.ok) core = c;
    else undetermined.push({ part: CORE_PROPERTIES_PART, why: c.why });
  }

  return {
    ok: true, format: "pptx", bytes: b, container, mainPart, presentationXml,
    order, slideParts, notesParts, slideXml, notesXml, notesOf, rels, core,
    guard, undetermined,
  };
}

/* The deck view: [{part, slide|null}] — declared order numbered 1-based,
 * then any slide part the declaration does not reach (order unreadable, or
 * an orphan part) honestly UNNUMBERED, in central-directory order. */
function deckOf(parts) {
  const seq = [];
  const seen = new Set();
  if (parts.order) {
    parts.order.forEach((part, i) => {
      if (part == null) return; // the unresolvable slot is already stated
      seq.push({ part, slide: i + 1 });
      seen.add(part);
    });
  }
  for (const p of parts.slideParts) if (!seen.has(p)) seq.push({ part: p, slide: null });
  return seq;
}

/* The guard marker's part field: the guard sums a FAMILY of parts, so the
 * family is named rather than one member (docx names its single main part). */
const GUARDED_PARTS = "ppt/slides/* + ppt/notesSlides/*";

/* ------------------------------------------------------------------ *
 * structure() — I2 links + the evidentiary envelope (I7 slot 3)
 * ------------------------------------------------------------------ */

async function pptxStructure(parts) {
  if (!parts || !parts.ok) {
    return { ok: false, container: "pptx", reason: parts?.why ?? "PARTS_ABSENT" };
  }
  const notes = [];
  const links = [];
  const deck = deckOf(parts);
  const slideNoOf = new Map();
  for (const d of deck) if (d.slide != null) slideNoOf.set(d.part, d.slide);
  if (!parts.order) {
    notes.push("deck order undeclared-or-unreadable (ppt/presentation.xml sldIdLst): slides are UNNUMBERED — slide:null, sources null — stated, never numbered off filenames");
  }
  if (parts.guard) {
    notes.push("slide/notes parts not read: over the size bound (stated in evidentiary.undetermined and by text())");
  }

  const walks = new Map();
  for (const { part } of deck) {
    const xml = parts.slideXml.get(part);
    if (xml != null) walks.set(part, walkSlide(xml));
  }
  const relsPartToSlide = new Map();
  for (const { part } of deck) relsPartToSlide.set(relsPartFor(part), part);

  /* A slide-shape source for a rel carried by a slide's .rels part: the .rels
   * NAME ties it to the slide (that is in the bytes), the body walk sharpens
   * it to a shape; an unnumbered slide yields null, never an invented number. */
  const slideLevelSource = (slidePart) => {
    const n = slideNoOf.get(slidePart);
    return n != null ? slideShapeRef(n) : null;
  };

  /* Outbound rels -> deferred/refused, through the ONE linkWrapper. One
   * record per body USAGE when used; a rel no usage was found for is still
   * carried once, at slide granularity when its .rels part is a slide's. */
  for (const rel of parts.rels.outbound) {
    const slidePart = relsPartToSlide.get(rel.part);
    if (slidePart) {
      const slideNo = slideNoOf.get(slidePart) ?? null;
      const w = walks.get(slidePart);
      const usages = w ? w.hlinks.filter((h) => h.rid === rel.id) : [];
      if (usages.length) {
        for (const u of usages) {
          links.push(deferredOrRefusedRecord(rel.target,
            slideNo != null ? slideShapeRef(slideNo, u.shape) : null));
        }
        continue;
      }
      links.push(deferredOrRefusedRecord(rel.target, slideLevelSource(slidePart)));
      continue;
    }
    links.push(deferredOrRefusedRecord(rel.target, null));
  }
  /* An unreadable .rels part means links may be MISSING: stated, not dropped. */
  for (const u of parts.rels.undetermined) {
    links.push(undeterminedRecord(null, "rels_unreadable", { part: u.part, detail: u.why }));
  }

  /* Slide-jump hlinks -> anchor: an internal rel of type …/slide, USED by an
   * <a:hlinkClick> in the body. Structural slide rels (sldIdLst's own, a
   * slide's notesSlide rel) are not links and are not emitted. A jump to a
   * slide the declared order does not contain is a STATED undetermined. */
  for (const bp of parts.rels.byPart) {
    const slidePart = relsPartToSlide.get(bp.part);
    if (!slidePart) continue;
    const w = walks.get(slidePart);
    if (!w) continue;
    const slideNo = slideNoOf.get(slidePart) ?? null;
    for (const r of bp.relationships) {
      if (r.external || !r.type || !r.type.endsWith("/slide") || !r.target) continue;
      const usages = w.hlinks.filter((h) => h.rid === r.id);
      if (!usages.length) continue;
      const resolved = resolveRelTarget(bp.part, r.target);
      const targetNo = slideNoOf.get(resolved) ?? null;
      for (const u of usages) {
        const source = slideNo != null ? slideShapeRef(slideNo, u.shape) : null;
        if (targetNo != null) {
          const fragment = `#slide=${targetNo}`;
          links.push({
            partition: "anchor",
            wrapper: linkWrapper.anchor(fragment),
            target: { slide: targetNo, fragment, part: resolved },
            source,
          });
        } else {
          links.push(undeterminedRecord(source, "slide_unresolved", { part: resolved }));
        }
      }
    }
  }

  /* ppt/embeddings/* -> intra, content-addressed. Located back to a slide
   * (and shape, when the body walk finds the rel used) through the rels id. */
  const embeddingRefs = new Map(); // resolved part -> { slidePart|null, rid }
  for (const bp of parts.rels.byPart) {
    const slidePart = relsPartToSlide.get(bp.part) ?? null;
    for (const r of bp.relationships) {
      if (r.external || !r.target) continue;
      const resolved = resolveRelTarget(bp.part, r.target);
      if (resolved.startsWith(EMBEDDINGS_DIR) && !embeddingRefs.has(resolved))
        embeddingRefs.set(resolved, { slidePart, rid: r.id });
    }
  }
  for (const entry of parts.container.entries) {
    const name = normalizePartName(entry.name);
    if (!name.startsWith(EMBEDDINGS_DIR) || name === EMBEDDINGS_DIR) continue;
    const refd = embeddingRefs.get(name) ?? null;
    let source = null;
    if (refd && refd.slidePart) {
      const slideNo = slideNoOf.get(refd.slidePart) ?? null;
      if (slideNo != null) {
        const w = walks.get(refd.slidePart);
        const shape = w && w.ridUsage.has(refd.rid) ? w.ridUsage.get(refd.rid) : null;
        source = slideShapeRef(slideNo, shape);
      }
    }
    const read = await readPart(parts.bytes, parts.container, name);
    if (!read.ok) {
      links.push(undeterminedRecord(source, "embedded_part_unreadable", { part: name, detail: read.why }));
      continue;
    }
    const sha = await sha256Hex(read.bytes);
    links.push({
      partition: "intra",
      wrapper: linkWrapper.intra(sha),
      target: { sha256: sha, name: name.slice(name.lastIndexOf("/") + 1), bytes: read.bytes.length },
      source,
    });
  }

  const counts = { anchor: 0, intra: 0, deferred: 0, refused: 0, undetermined: 0 };
  for (const l of links) counts[l.partition]++;

  /* ---- the evidentiary envelope (DEC-5; IC-2 CONFIRMED, no variant) ---- */
  const items = [];
  const evUndetermined = [...parts.undetermined];
  if (parts.guard) evUndetermined.push({ part: GUARDED_PARTS, why: "over_size_bound", guard: parts.guard });

  /* SPEAKER NOTES — the evidentiary core: per slide, a DISTINCT kind, never
   * merged into slide text anywhere. */
  const mappedNotes = new Set();
  for (const { part, slide } of deck) {
    const notesPart = parts.notesOf.get(part) ?? null;
    if (!notesPart) continue;
    mappedNotes.add(notesPart);
    const xml = parts.notesXml.get(notesPart);
    if (xml == null) {
      /* Unreadable notes parts are already stated by parts(); a DECLARED
       * notes part the container does not even hold is stated here. */
      if (!parts.guard && !parts.container.byName.has(notesPart))
        evUndetermined.push({ part: notesPart, why: "part_absent" });
      continue;
    }
    items.push({
      kind: "speaker-notes",
      slide,
      part: notesPart,
      text: walkSlide(xml).text,
      source: slide != null ? slideShapeRef(slide) : null,
    });
  }
  /* A notesSlide no slide claims (an orphan) still carries its evidence —
   * honestly unattributed to a slide number. */
  for (const np of parts.notesParts) {
    if (mappedNotes.has(np) || !parts.notesXml.has(np)) continue;
    items.push({ kind: "speaker-notes", slide: null, part: np, text: walkSlide(parts.notesXml.get(np)).text, source: null });
  }

  if (parts.core) {
    items.push({
      kind: "core-properties",
      creator: parts.core.creator, lastModifiedBy: parts.core.lastModifiedBy,
      revision: parts.core.revision, revisionNumber: parts.core.revisionNumber,
      created: parts.core.created, modified: parts.core.modified, title: parts.core.title,
      source: null,
    });
  }
  const evCounts = {};
  for (const it of items) evCounts[it.kind] = (evCounts[it.kind] ?? 0) + 1;
  const evidentiary = {
    container: "pptx",
    kinds: [...new Set(items.map((it) => it.kind))],
    items,
    undetermined: evUndetermined,
    counts: evCounts,
  };

  return {
    ok: true,
    container: "pptx",
    slides: deck.length,
    links,
    counts,
    evidentiary,
    notes,
  };
}

/* ------------------------------------------------------------------ *
 * text() — <a:t> runs per slide; SPEAKER NOTES a DISTINCT unit list,
 * never merged (I7 slot 4)
 * ------------------------------------------------------------------ */

async function pptxText(parts) {
  if (!parts || !parts.ok) {
    return { ok: false, container: "pptx", reason: parts?.why ?? "PARTS_ABSENT" };
  }
  if (parts.guard) {
    /* Over the bound: the sizeGuard marker carried VERBATIM, never a silent
     * truncation. */
    return {
      ok: true, container: "pptx", document: null, slides: [], speakerNotes: [],
      undetermined: [parts.guard],
      counts: { chars: 0, notesChars: 0, undetermined: 1 },
    };
  }
  const deck = deckOf(parts);
  const slides = [];
  const speakerNotes = [];
  const undetermined = [];
  for (const { part, slide } of deck) {
    const xml = parts.slideXml.get(part);
    if (xml == null) {
      const stated = parts.undetermined.find((u) => u.part === part);
      undetermined.push({ reason: "slide_unreadable", part, why: stated?.why ?? "unreadable" });
    } else {
      slides.push({ slide, ref: slide != null ? `slide ${slide}` : null, part, text: walkSlide(xml).text });
    }
    const notesPart = parts.notesOf.get(part) ?? null;
    if (!notesPart) continue;
    const nxml = parts.notesXml.get(notesPart);
    if (nxml == null) {
      const stated = parts.undetermined.find((u) => u.part === notesPart);
      undetermined.push({ reason: "notes_unreadable", part: notesPart, why: stated?.why ?? "unreadable" });
    } else {
      /* THE DISTINCTION (DEC-5): a speaker-notes unit is its OWN unit with
       * its own ref form — never appended to the slide's text, never in
       * `document`. */
      speakerNotes.push({ slide, ref: slide != null ? `slide ${slide} (notes)` : null, part: notesPart, text: walkSlide(nxml).text });
    }
  }
  /* Orphan notesSlides: their text is still evidence, honestly unnumbered. */
  const mapped = new Set([...parts.notesOf.values()]);
  for (const np of parts.notesParts) {
    if (mapped.has(np) || !parts.notesXml.has(np)) continue;
    speakerNotes.push({ slide: null, ref: null, part: np, text: walkSlide(parts.notesXml.get(np)).text });
  }

  /* `document` is the deck AS PRESENTED: slide text only. Speaker notes are
   * counted apart so no reader can conflate the two streams by accident. */
  const document = slides.map((s) => s.text).filter((t) => t.length).join("\n");
  const notesChars = speakerNotes.reduce((n, s) => n + s.text.length, 0);
  return {
    ok: true, container: "pptx", document, slides, speakerNotes,
    undetermined,
    counts: { chars: document.length, notesChars, undetermined: undetermined.length },
  };
}

/* ------------------------------------------------------------------ *
 * The I7 entry
 * ------------------------------------------------------------------ */

export const pptxEntry = {
  format: "pptx",
  detect(bytes, contentType) {
    if (bytes) {
      if (!hasZipMagic(bytes)) return null;
      /* Sync, so the central directory NAMES are the strongest honest signal.
       * At the 1 KiB acquire seam there is no EOCD, readContainer refuses,
       * and this entry answers null — ZIP magic alone NEVER claims a pptx. */
      const container = readContainer(bytes);
      if (!container.ok) return null;
      if (container.byName.has(CONTENT_TYPES_PART) && container.byName.has(MAIN_PART)) {
        return {
          format: "pptx", confidence: "likely",
          signals: [
            "magic: PK\\x03\\x04 with a readable central directory",
            `part: ${CONTENT_TYPES_PART} present`,
            `part: ${MAIN_PART} present`,
            "likely, not certain: the OPC content-type declaration is deflated — parts() discriminates",
          ],
        };
      }
      return null;
    }
    if (contentType === PPTX_CONTENT_TYPE) {
      return { format: "pptx", confidence: "likely", signals: [`content type "${contentType}"`] };
    }
    return null;
  },
  parts: (bytes) => pptxParts(bytes),
  structure: async (partsOrBytes) => {
    /* Accept either parts() output or raw bytes, so detect→structure works
     * uniformly at the registry seam while a caller that already paid for
     * parts() does not pay twice (the docx.mjs pattern). */
    const parts = partsOrBytes instanceof Uint8Array || partsOrBytes instanceof ArrayBuffer
      ? await pptxParts(partsOrBytes)
      : partsOrBytes;
    return pptxStructure(parts);
  },
  text: async (partsOrBytes) => {
    const parts = partsOrBytes instanceof Uint8Array || partsOrBytes instanceof ArrayBuffer
      ? await pptxParts(partsOrBytes)
      : partsOrBytes;
    return pptxText(parts);
  },
};
