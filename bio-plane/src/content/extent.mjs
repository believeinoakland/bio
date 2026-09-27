/* content — THE EXTENT GRAMMAR (requirements: `build/requirements/content.md` R1–R10, R14, R33). Pure; nothing here
 * throws, reads the record or keeps state.
 *
 * WHERE THE GRAMMAR'S CORE LIVES, AND WHY IT IS STILL IMPORTED (T5-3, CONTENT #1's job record, "Decisions"). The
 * catalogue (`legacy-checks`, first in the order) still runs the leg grammar of C-2.8 and C-25.10
 * (`checkLegExtentGrammar`, inquiry's and basis-versions') and the connection-pair checks (C-49, connections') over
 * `checkContentExtent`, `legExtent`, `canonicalExtent` and `describeExtent`. An earlier module cannot import this
 * one, so those functions cannot leave the catalogue until their catalogue callers do; until then this module takes
 * them from there and is their ONE public face (R1–R8), and everything the grammar has gained since is written here,
 * over them, never beside them:
 *
 *   - the ninth kind, `envelope` (R33, REC-204), with its own canonical form, human form and shape check;
 *   - a rect's coordinate space (R10, D-670): `user` is the one space addressed, and any other is refused C-45.13
 *     (`CONTENT_EXTENT_NOT_USER_SPACE`) before any number in it is read;
 *   - a `pdf-page` rect bounded by its page's MediaBox (R9, D-374), refused C-45.1 naming the box, and admitted
 *     UNDETERMINED (`{level: "page_box"}`) where the record holds no box for the page.
 *
 * The content address (`contentIdFor`, R3) is taken over THIS module's canonical form, which is byte-identical to the
 * catalogue's for every kind the catalogue knows, so no id minted before this module moves. */

import {
  CONTENT_EXTENT_KINDS as CATALOGUE_KINDS, CONTENT_EXTENT_CHECKS, CONTENT_EXTENT_KIND_NO_PRODUCER,
  CONTENT_ID_RE, CONTENT_EXTENT_A1_RE, CONTENT_EXTENT_DOCUMENT_ONLY,
  canonicalExtent as catalogueCanonical, describeExtent as catalogueDescribe,
  checkContentExtent as catalogueCheck, contentCitedAs as catalogueCitedAs, legExtent, legHasAuthoredExtent,
  extentRelation as catalogueRelation,
  imagePartUndetermined, canonicalJson, sha256HexSync,
} from "../../checks/bio-checks.mjs";
import { chainKindFor, checkChain, STEP_KINDS, CHAIN_KIND_MIXED } from "../textchain.mjs";

export { CONTENT_EXTENT_CHECKS, CONTENT_EXTENT_KIND_NO_PRODUCER, CONTENT_ID_RE, CONTENT_EXTENT_A1_RE,
         CONTENT_EXTENT_DOCUMENT_ONLY, imagePartUndetermined, legExtent, legHasAuthoredExtent, CHAIN_KIND_MIXED };

/* ======================================================================= *
 * THE KINDS (R1). The catalogue's eight and `envelope` (R33, K102).
 * ======================================================================= */

/** REC-204 — AN ITEM OF THE EVIDENTIARY ENVELOPE (DEC-5, OFFICE-FORMATS.md "THE ENVELOPE AS CONTENT"): a tracked
 *  change, a comment, a core property or a slide's speaker notes, addressed by the PART of the container its bytes sit
 *  in, the element it is anchored at, and the item's own kind. The human form says ENVELOPE on purpose and is never
 *  the body's: a reviewer's comment and an editor's name are the document's own bytes, and still not what the
 *  document SAYS. `cited_as` keeps them apart on every row. */
export const CONTENT_EXTENT_KINDS = Object.freeze({
  ...CATALOGUE_KINDS,
  envelope: { landed: true, human: "an item of the document's envelope (a tracked change, comment, core property or speaker notes), not its body" },
});

/** REC-204 — the item kinds an `envelope` extent names, and the member's word for each: the design's four exactly. */
export const ENVELOPE_ITEM_KINDS = Object.freeze({
  "tracked-change": "a tracked change",
  comment:          "a comment",
  "core-property":  "a core property",
  "speaker-note":   "a slide's speaker notes",
});

/** `cited_as` on an envelope item: neither the body's `text` nor an image's `bytes`, and never presented as either. */
export const CONTENT_CITED_AS_ENVELOPE = "envelope";

/** The element kinds an envelope item may be anchored at; a core property is anchored at nothing (`at: null`). */
export const ENVELOPE_ANCHOR_KINDS = Object.freeze(["doc-para", "slide-shape"]);

/** D-670 — the one coordinate space the grammar addresses: PDF default user space (IC-203). An unstated space reads
 *  as user space (every rect written before D-670 was one); anything else is returned as the string it is, so it can
 *  be refused BY NAME. */
export const EXTENT_USER_SPACE = "user";
export function extentSpace(extent) {
  const v = extent && typeof extent === "object" ? extent.space : undefined;
  return v === undefined || v === null ? EXTENT_USER_SPACE : String(v);
}

/** C-45.13 (D-670): a rect stated in a space other than user space. The row is this module's until the catalogue
 *  carries it (reported to legacy-checks); its shape is the catalogue's, so a surface reads it like any other. */
export const CONTENT_EXTENT_OWN_CHECKS = Object.freeze({
  CONTENT_EXTENT_NOT_USER_SPACE: {
    check: "C-45.13",
    where: "src/content/extent.mjs checkContentExtent > is-content-extent-space",
    translation: "This citation gives a region of a page in a different measure from the one this record addresses "
      + "pages in. A region here is measured in points from the corner of the page as the file lays it out; this one "
      + "is measured in something else — usually the pixels of an image made from the page, as a text-recognition "
      + "engine reports them. The same four numbers name a different place in each, so recording it as given would "
      + "point at a region nobody chose, and it is not converted either, because the conversion depends on how the "
      + "image was made and turned. Cite the region in points on the page, or cite the page.",
  },
});

const isObj = (v) => !!v && typeof v === "object" && !Array.isArray(v);
const isRect = (r) => Array.isArray(r) && r.length === 4 && r.every((n) => typeof n === "number" && Number.isFinite(n));
const normRect = (r) => [Math.min(r[0], r[2]), Math.min(r[1], r[3]), Math.max(r[0], r[2]), Math.max(r[1], r[3])];

/** A refusal in the catalogue's shape, from the catalogue's C-45 row or this module's own. */
function refusal(code, detail) {
  const row = CONTENT_EXTENT_CHECKS[code] || CONTENT_EXTENT_OWN_CHECKS[code];
  return { ok: false, code, check: row.check, translation: row.translation, detail };
}

/* ======================================================================= *
 * cited_as (R4), THE CANONICAL AND HUMAN FORMS (R2).
 * ======================================================================= */

/** R4: `bytes` for an image (cited as itself), `envelope` for an envelope item, `text` otherwise; a stated value is
 *  returned as stated, for the checker to refuse by name when it is not one of the three. */
export function contentCitedAs(extent) {
  const e = isObj(extent) ? extent : {};
  const v = e.cited_as;
  if ((v === undefined || v === null || v === "") && e.kind === "envelope") return CONTENT_CITED_AS_ENVELOPE;
  return catalogueCitedAs(e);
}

/** R2: one form per extent. The catalogue's form for its eight kinds, byte for byte (so no content id moves); for an
 *  envelope item, `cited_as` IS in the address (an envelope item and a body passage never share one), `at` is the
 *  anchoring element's own canonical form, `name` the core property's name, `n` the item's ordinal among items of its
 *  kind sharing that part, anchor and name. A rect's `space` is not in the address: only user space is admitted
 *  (R10), so an unstated space and `space: "user"` are one address. */
export function canonicalExtent(extent) {
  const e = isObj(extent) ? extent : {};
  if (e.kind === "envelope") {
    const at = isObj(e.at) && ENVELOPE_ANCHOR_KINDS.includes(e.at.kind) ? JSON.parse(catalogueCanonical(e.at)) : null;
    return canonicalJson({ kind: "envelope", cited_as: contentCitedAs(e),
      item: typeof e.item === "string" ? e.item.trim() : null,
      part: typeof e.part === "string" && e.part.trim() ? e.part.trim() : null,
      at,
      name: typeof e.name === "string" && e.name.trim() ? e.name.trim() : null,
      n: Number.isInteger(e.n) ? e.n : null });
  }
  return catalogueCanonical(e);
}

/** R2: the human form (IC-1's required `ref`), a caller's non-empty `ref` kept. An envelope item's form LEADS with the
 *  word `envelope`, so a surface showing nothing but this sentence still cannot present a comment as the body. */
export function describeExtent(extent) {
  const e = isObj(extent) ? extent : {};
  if (typeof e.ref === "string" && e.ref.trim()) return e.ref.trim();
  if (e.kind === "envelope") {
    const what = ENVELOPE_ITEM_KINDS[typeof e.item === "string" ? e.item.trim() : ""] || "an item";
    const name = typeof e.name === "string" && e.name.trim() ? ` '${e.name.trim()}'` : "";
    const at = isObj(e.at) && ENVELOPE_ANCHOR_KINDS.includes(e.at.kind)
      ? ` at ${catalogueDescribe({ ...e.at, ref: undefined })}` : "";
    return `envelope: ${what}${name}${at}`;
  }
  return catalogueDescribe(e);
}

/** R3: THE CONTENT ADDRESS, `hash(capture_sha, canonical extent, chain)`: SHA-256 over `{v: 1, capture_sha, canonical
 *  extent, canonical chain or null}`. A null chain hashes as `null`, never as an empty array. */
export function contentIdFor(captureSha, extent, chain) {
  return sha256HexSync(canonicalJson({
    v: 1,
    capture_sha: String(captureSha ?? ""),
    extent: canonicalExtent(extent),
    chain: chain == null ? null : canonicalJson(chain),
  }));
}

/* ======================================================================= *
 * CITATIONS (R5).
 * ======================================================================= */

/** R5: the extent a citation `{target, extent?, extent_kind…?, content_id?}` means. A structured `extent` object is
 *  taken as given; the flattened leg fields (`extent_kind`, `extent_page`, …) are read by the catalogue's one reader,
 *  plus D-670's `extent_space`, which that reader does not yet carry. A citation naming no part is `document` (there is
 *  no `unstated` extent, Bob's 5.3). */
export function citationExtent(citation) {
  const c = isObj(citation) ? citation : {};
  if (isObj(c.extent)) return { ...c.extent };
  const out = legExtent(c);
  if ((out.kind === "pdf-page" || out.kind === "image")
      && c.extent_space !== undefined && c.extent_space !== null && c.extent_space !== "")
    out.space = c.extent_space;
  return out;
}

/** R5: the 64-hex content id a citation names, else null. */
export function citationContentId(citation) {
  const v = isObj(citation) ? citation.content_id : undefined;
  if (typeof v !== "string") return null;
  const t = v.trim();
  return CONTENT_ID_RE.test(t) ? t : null;
}

/** The content id a leg NAMES, or null where it names none: trimmed, and otherwise as written (the catalogue's C-2.8
 *  refuses a malformed one; C-45.5 answers one this record does not hold). Moved from the catalogue (REC-84). */
export function legContentId(leg) {
  const v = isObj(leg) ? leg.content_id : undefined;
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t;
}

/** Did the citation author an extent at all (the leg grammar's question), including a structured `extent`. */
export function citationHasAuthoredExtent(citation) {
  const c = isObj(citation) ? citation : {};
  return isObj(c.extent) || legHasAuthoredExtent(c)
    || (c.extent_space !== undefined && c.extent_space !== null && c.extent_space !== "");
}

/* ======================================================================= *
 * THE RELATION BETWEEN TWO EXTENTS (R6; REC-86 / IC-123).
 *
 * `extentRelation(outer, inner)` answers how two extents of ONE capture stand to each other: `same`, `narrower`
 * (inner lies strictly inside outer), `wider`, `disjoint`, or `unreadable` (either side names something that cannot
 * be evaluated, or a coarse field is missing). THE DEFAULT IS NOT-NARROWER, for `extentCovers`' reason. The
 * catalogue's relation answers the eight kinds it knows (the legacy store's narrow act still reads it there); this
 * face adds what the grammar has gained: a rect outside user space is a place that cannot be evaluated (D-670), and
 * an envelope item is `same` only as itself, `narrower` than the whole document, and `disjoint` from everything else.
 * ======================================================================= */
export function extentRelation(outer, inner) {
  const a = isObj(outer) ? outer : null;
  const b = isObj(inner) ? inner : null;
  if (!a || !b) return "unreadable";
  if (extentSpace(a) !== EXTENT_USER_SPACE || extentSpace(b) !== EXTENT_USER_SPACE) return "unreadable";
  if (a.kind === "envelope" || b.kind === "envelope") {
    const known = (k) => Object.prototype.hasOwnProperty.call(CONTENT_EXTENT_KINDS, k);
    if (!known(a.kind) || !known(b.kind)) return "unreadable";
    if (canonicalExtent(a) === canonicalExtent(b)) return "same";
    if (a.kind === "document") return "narrower";
    if (b.kind === "document") return "wider";
    return "disjoint";
  }
  return catalogueRelation(a, b);
}

/* ======================================================================= *
 * D-374 — A `pdf-page` RECT, BOUNDED BY THE PAGE'S MEDIABOX (R9).
 *
 * The persisted `page_boxes` (the reading's, `{boxes: [{media_box, w, h, rotate}], of_page: [<index> | null, …]}`)
 * are read by ONE reader, exhaustive or null on the whole object: one malformed box makes every page undetermined,
 * because a partial list would bound the pages it kept and silently not the rest. THE MEDIABOX, NOT THE CROPBOX: a
 * rect is in default user space, where the MediaBox is the page; content outside the CropBox is still in the file.
 * /ROTATE DOES NOT MOVE THE BOUND (user space is unrotated) and is named in the refusal. Containment to 0.001 pt, the
 * step the crop matches within, so a rect the record reported flush with the edge is never refused for rounding; a
 * rect that merely overlaps the page is refused too (clipping it would record a region nobody chose).
 * ======================================================================= */
export function pageBoxesOf(v) {
  if (!isObj(v) || !Array.isArray(v.boxes) || !Array.isArray(v.of_page)) return null;
  const fin = (n) => typeof n === "number" && Number.isFinite(n);
  const boxes = [];
  for (const b of v.boxes) {
    const m = b && Array.isArray(b.media_box) && b.media_box.length === 4 && b.media_box.every(fin) ? b.media_box : null;
    if (!m || !(m[2] > m[0] && m[3] > m[1])) return null;
    boxes.push({ media_box: m.slice(), w: m[2] - m[0], h: m[3] - m[1],
                 rotate: [0, 90, 180, 270].includes(b.rotate) ? b.rotate : null });
  }
  const of_page = [];
  for (const i of v.of_page) {
    if (i === null) { of_page.push(null); continue; }
    if (!(Number.isInteger(i) && i >= 0 && i < boxes.length)) return null;
    of_page.push(i);
  }
  return { boxes, of_page };
}

function rectOffPage(e, pageBoxes) {
  if (!isRect(e.rect)) return null;
  const held = pageBoxesOf(pageBoxes);
  const i = held && Number.isInteger(e.page) && e.page < held.of_page.length ? held.of_page[e.page] : null;
  if (i === null || i === undefined) return null;
  const b = held.boxes[i], m = b.media_box, TOL = 0.001 + 1e-9;
  const r = normRect(e.rect);
  if (r[0] >= m[0] - TOL && r[1] >= m[1] - TOL && r[2] <= m[2] + TOL && r[3] <= m[3] + TOL) return null;
  return `page ${e.page} of this capture is ${b.w} x ${b.h} pt, its MediaBox [${m.join(", ")}] in default user `
    + `space, and the extent's rect [${r.join(", ")}] reaches outside it`
    + (b.rotate ? `. The page is shown rotated ${b.rotate} degrees; a rect is measured on the unrotated page, from its `
      + `MediaBox corners, not from the turned view` : "");
}

/** R8 / R9: a `pdf-page` rect admitted without its page's box, stated as `{level: "page_box", why}` naming which
 *  absence; null when the rect was checked against a box, when there is no rect, or for a document-only pass. */
export function pdfPageBoxUndetermined(extent, ctx = {}) {
  const e = isObj(extent) ? extent : null;
  if (!e || e.kind !== "pdf-page" || !Number.isInteger(e.page) || !isRect(e.rect)) return null;
  if (!ctx || ctx.known === false) return null;
  const held = pageBoxesOf(ctx.pageBoxes);
  if (!held)
    return { level: "page_box",
             why: `this record holds no page boxes for this capture — it was acquired before the reading carried them, `
               + `or no PDF structure read answered one — so whether the rect lies on page ${e.page} is UNDETERMINED, `
               + `admitted and stated rather than guessed` };
  const i = e.page < held.of_page.length ? held.of_page[e.page] : null;
  if (i === null || i === undefined)
    return { level: "page_box",
             why: `the file states no readable MediaBox for page ${e.page}, so whether the rect lies on the page is `
               + `UNDETERMINED, admitted and stated rather than guessed` };
  return null;
}

/** R8 (CPDF-22): one shape for "admitted, bound not held": `{level, why}`, or null. An image `{part}` (container kind
 *  or image list not held), an image `{page}` (painted-image list not held), a `pdf-page` rect (page box not held).
 *  Exclusive address forms, so at most one answers. Moved from the catalogue with its page-image arm. */
export function mintUndetermined(extent, ctx = {}) {
  return imagePartUndetermined(extent, ctx) || imagePageUndetermined(extent, ctx) || pdfPageBoxUndetermined(extent, ctx);
}

/** CPDF-22 — D-420's page form: an image `{page}` admitted because the record holds no list of the images this
 *  capture's pages paint, stated with the context's own sentence (`page_images_why`). */
export function imagePageUndetermined(extent, ctx = {}) {
  const e = isObj(extent) ? extent : null;
  if (!e || e.kind !== "image" || !Number.isInteger(e.page)) return null;
  const c = ctx && isObj(ctx.container) ? ctx.container : null;
  if (!c || typeof c.page_images_why !== "string" || !c.page_images_why) return null;
  return { level: "page_images", why: c.page_images_why };
}

/* ======================================================================= *
 * THE CHECK (R1, R7–R10, R33).
 * ======================================================================= */

/** Refuses an extent this record cannot address, with the figure in `detail`, or answers null. `ctx` is a capture's
 *  context `{chain, pageCount, container, pageBoxes?}` (`contentContextFor`), or `CONTENT_EXTENT_DOCUMENT_ONLY`, whose
 *  record arms are skipped. Order: the catalogue's kind arms (`dom`, an unknown kind); then this module's space arm
 *  (C-45.13) before any number is read; then the envelope item's shape and its anchor; then every catalogue arm; then
 *  the MediaBox bound (C-45.1). A bound the context does not hold is never a refusal (R8). */
export function checkContentExtent(extent, ctx = {}) {
  const e = isObj(extent) ? extent : null;
  if (!e || e.kind === CONTENT_EXTENT_KIND_NO_PRODUCER || !Object.prototype.hasOwnProperty.call(CONTENT_EXTENT_KINDS, e.kind))
    return catalogueCheck(extent, ctx);
  /* DEC-49 REGION is-content-extent-space */
  if ((e.kind === "pdf-page" || e.kind === "image") && extentSpace(e) !== EXTENT_USER_SPACE)
    return refusal("CONTENT_EXTENT_NOT_USER_SPACE",
      `this ${e.kind} extent states its rect in space '${extentSpace(e).slice(0, 40)}'; the grammar addresses PDF `
      + `default user space only (points, the page as the file lays it out), so the rect is not converted and not `
      + `read as points. A text-recognition anchor is in the pixels of the frame it read`);
  /* END DEC-49 REGION is-content-extent-space */
  const citedAs = contentCitedAs(e);
  if ((citedAs === CONTENT_CITED_AS_ENVELOPE) !== (e.kind === "envelope"))
    return refusal("CONTENT_EXTENT_UNREADABLE",
      e.kind === "envelope"
        ? `an envelope item is cited as the envelope and never as '${String(citedAs).slice(0, 40)}': a tracked `
          + `change, comment, core property or speaker note is not the document's body`
        : `only an envelope item is cited as the envelope. A ${e.kind} extent addresses the document's body, and `
          + `reading it as an annotation would change what the citation claims`);
  if (e.kind === "envelope") return checkEnvelope(e, ctx);
  const bad = catalogueCheck(e, ctx);
  if (bad) return bad;
  if (e.kind === "pdf-page" && ctx && ctx.known !== false) {
    const off = rectOffPage(e, ctx.pageBoxes);
    if (off) return refusal("CONTENT_EXTENT_OUT_OF_RANGE", off);
  }
  return null;
}

/* REC-204 — THE ENVELOPE ITEM'S SHAPE. Its container half is skipped and that is stated: the record persists no list
   of a capture's envelope items to bound one against (they arrive as index units), so a well-formed item is admitted
   and its existence rests on the index that found it. The ANCHOR is checked as the address it is, by this same
   function, so a paragraph past the document's count is refused here exactly as a doc-para citation of it would be.
   The chain arm is the body's: an envelope item is text the capture's reading read, so a capture nobody read holds
   none to address (C-45.2). */
function checkEnvelope(e, ctx) {
  const item = typeof e.item === "string" ? e.item.trim() : "";
  if (!Object.prototype.hasOwnProperty.call(ENVELOPE_ITEM_KINDS, item))
    return refusal("CONTENT_EXTENT_UNREADABLE",
      `an envelope extent names which kind of item, one of ${Object.keys(ENVELOPE_ITEM_KINDS).join(", ")}. This one `
      + `names '${String(e.item).slice(0, 40)}'`);
  if (typeof e.part !== "string" || !e.part.trim())
    return refusal("CONTENT_EXTENT_UNREADABLE",
      `an envelope extent names the part of the container the item's bytes sit in (word/comments.xml, `
      + `docProps/core.xml). This one names '${String(e.part).slice(0, 40)}'`);
  if (!Number.isInteger(e.n) || e.n < 0)
    return refusal("CONTENT_EXTENT_UNREADABLE",
      `an envelope extent names which item, as a 0-based ordinal among items of its kind at the same part and `
      + `anchor. This one names '${String(e.n).slice(0, 40)}'`);
  if (item === "core-property" && !(typeof e.name === "string" && e.name.trim()))
    return refusal("CONTENT_EXTENT_UNREADABLE",
      "a core-property envelope item names which property (creator, lastModifiedBy, title), and this one names none");
  if (e.at !== undefined && e.at !== null) {
    if (!(isObj(e.at) && ENVELOPE_ANCHOR_KINDS.includes(e.at.kind)))
      return refusal("CONTENT_EXTENT_UNREADABLE",
        `an envelope item is anchored at a paragraph or a slide (${ENVELOPE_ANCHOR_KINDS.join(", ")}) or at nothing. `
        + `This one is anchored at '${String(isObj(e.at) ? e.at.kind : e.at).slice(0, 40)}'`);
    const anchor = catalogueCheck(e.at, ctx);
    if (anchor) return anchor;
  }
  if (ctx && ctx.known !== false && !(Array.isArray(ctx.chain) && ctx.chain.length))
    return refusal("CONTENT_EXTENT_NO_CHAIN",
      `this record holds no extraction chain for the capture this citation names, so there is no transcription over `
      + `${describeExtent(e)} for the citation to point at`);
  return null;
}

/* ======================================================================= *
 * WHAT A UNIT IS ASKED ABOUT, AND HOW IT WAS READ (R12, R14).
 * ======================================================================= */

/** The target a content unit presents to `text-chain`: its page (and rect) when it has one (a `pdf-page`, or an
 *  `image` on a PDF page), else null (the whole chain). ONE answer, read for the derivation cap and the chain kind, so
 *  a unit's cap and its kind are asked of the same page. */
export function unitTargetOf(extent) {
  return isObj(extent) && (extent.kind === "pdf-page" || (extent.kind === "image" && Number.isInteger(extent.page)))
    ? { page: extent.page, rect: extent.rect ?? null } : null;
}

/** R14 (D-686, D-710): HOW THIS UNIT WAS READ. A unit with a page reads `text-chain.chainKindFor` over that page (the
 *  last derivation step covering it, `mixed` where covering parts disagree). A unit with no page covers every page
 *  the chain names: their one kind, or `mixed` when they differ; a chain whose derivation steps are all unscoped
 *  answers its last derivation step. Null for no chain, a malformed chain, or a page no step covers; `mixed` is read
 *  as CONTAINING machine-read text by every reader that labels it (DEC-4). */
export function unitChainKind(chain, target) {
  if (chain == null || checkChain(chain)) return null;
  if (target && Number.isInteger(target.page)) return chainKindFor(chain, target.page);
  const derivations = chain.filter((s) => STEP_KINDS[s.step] && STEP_KINDS[s.step].role === "derivation");
  if (!derivations.length) return null;
  const pages = new Set();
  let unscoped = false;
  for (const s of derivations) {
    const ext = s.extent;
    if (ext === undefined || ext === null) { unscoped = true; continue; }
    if (!isObj(ext) || ext.kind !== "pages" || !Array.isArray(ext.pages) || !ext.pages.length) return null;
    for (const p of ext.pages) if (Number.isInteger(p) && p >= 0) pages.add(p);
  }
  if (!pages.size) return unscoped ? chainKindFor(chain, 0) : null;
  const kinds = new Set();
  for (const p of pages) {
    const k = chainKindFor(chain, p);
    if (k == null) return null;
    kinds.add(k);
  }
  return kinds.size === 1 ? [...kinds][0] : CHAIN_KIND_MIXED;
}
