/* content — the unit the record points at (requirements: `build/requirements/content.md`). A reference to a part of
 * a captured document, up to and including the whole: the extent grammar (`./extent.mjs`), the content address, the
 * content row minted over it and what it may claim on the transcription axis, a member's typed transcription of a
 * part and a second member's attestation of it, and, for one cited passage, whether a newer capture exists and
 * whether the passage is carried into it (`./notice.mjs`), without moving anything. It never moves a reference: the
 * record points where a member pointed (R34).
 *
 * Extracted from the legacy modules (T5-3; K73, K102): `store.mjs` (the content writer REC-82, the reads REC-83,
 * transcription REC-87, the machine mint SK-7, the version notice's per-passage half D-394 / REC-221, and, by K73 (1),
 * the capture's text attestations CPDF-10 and the citation context `contentContextFor` with its readers),
 * `schema.mjs` (the four tables, now `./schema.mjs`) and `bio-checks.mjs` (the extent relation, the mint's
 * undetermined statement; the grammar's core stays there while the catalogue's own leg checks call it, see
 * `./extent.mjs`). The legacy code's comments moved with it, shortened where they only restated the code.
 *
 * REACHED as `contentOf(host, deps)` (K61): one instance per host (the Durable Object's `ctx`), created on the first
 * call with `deps`, returned to every later caller. At creation it declares its tables to record-core's purge (R39).
 * `deps`:
 *   record, membership, provenance   the modules it uses, through their factories on the same host unless a test
 *                                    passes its own.
 *   extraction   `{readingOf, unitsOf, onReading?}` (extraction R30, R36, R24). Until extraction is merged into the
 *                tranche, the default is this module's bridge over the legacy store's reading tables (CONTENT #1's
 *                job record, Q3); it is replaced by `extractionOf(host)` on extraction's CHANGE.
 *   now          the module's clock, an ISO instant (default: the wall clock); a mint or act with no `at` reads it. */

import { isMachineIdentity, normalizeType, OBJECT_TYPES, CONTENT_MINTED_BY_PLANE, CONTENT_MINT_STATES,
         contentMintState, TRANSCRIBE_CHECKS, VERSION_NOTICE_CHECKS, sha256HexSync }
  from "../../checks/bio-checks.mjs";
import { checkChain, checkAttestation, derivationCap, gradeCeiling, extentCovers, describeChain }
  from "../textchain.mjs";
import { getFormat } from "../formats.mjs";
import { cropImage } from "../../../pdf-worker/src/imagecrop.mjs";
import { recordOf } from "../record-core/index.mjs";
import { membershipOf, viewerPredicate } from "../membership/index.mjs";
import { provenanceOf } from "../provenance/index.mjs";
import { CONTENT_SCHEMA, CONTENT_TABLES, migrateContent } from "./schema.mjs";
import {
  CONTENT_EXTENT_CHECKS, CONTENT_EXTENT_KINDS, checkContentExtent, canonicalExtent, describeExtent, contentIdFor,
  contentCitedAs, citationExtent, citationContentId, legContentId, mintUndetermined, pdfPageBoxUndetermined, unitTargetOf,
  unitChainKind,
} from "./extent.mjs";
import { VERSION_NOTICE_ADDRESSES_MAX, VERSION_NOTICE_STATES, VERSION_NOTICE_GRADES, extentBoundUnheld, gradeAcross,
         affectsOf } from "./notice.mjs";

export * from "./extent.mjs";
export { CONTENT_SCHEMA, CONTENT_TABLES } from "./schema.mjs";
export { VERSION_NOTICE_ADDRESSES_MAX, VERSION_NOTICE_STATES, VERSION_NOTICE_GRADES, VERSION_NOTICE_SIMILAR }
  from "./notice.mjs";
export { CONTENT_MINTED_BY_PLANE, CONTENT_MINT_STATES, contentMintState };

/** The one bound on a typing (R23, C-52.7): the per-unit cap one passage of the text index is stored to
 *  (`CAPTURE_TEXT_UNIT_CAP`, M-20's 131,072 B). Refused over it, never truncated. */
export const TRANSCRIPTION_MAX_BYTES = 128 * 1024;
/** The attestation reads' page bound (CPDF-10): enough to work with on a screen, far short of a dump. */
export const TEXT_SOURCE_LIMIT_DEFAULT = 200;
export const TEXT_SOURCE_LIMIT_MAX = 5000;
/** R17: `op=content` is FIXED-KEY; these are the only parameters it understands. R18 (D-675): the plane's own
 *  `store` parameter names which Durable Object the call reached and nothing inside it, so it is accepted. */
export const CONTENT_READ_PARAMS = new Set(["id", "viewer", "store"]);
/** R20: how many content rows one `standings` read resolves. */
export const CONTENT_EARNED_MAX = 200;

const isObj = (v) => !!v && typeof v === "object" && !Array.isArray(v);
const safeJson = (s) => { try { return s == null ? null : JSON.parse(s); } catch { return null; } };
const ROW_COLS = `content_id, capture_sha, bundle_id, extent_kind, extent, ref, chain, derivation_cap, page_count,
                  minted_by, at, stale, cited_as`;

/** R16 — THE MINT LABEL, derived in ONE place and put on every surface that shows a content row (SK-7, Bob's 5.7).
 *  Present on EVERY row, not only machine-minted ones: a key that appears only when the answer is "machine" makes
 *  absence carry the meaning. `machine_work` is the plane's own answer and `says` the published sentence. */
export function mintLabel(mintedBy) {
  const state = contentMintState(mintedBy);
  return { by: mintedBy ?? null, state, machine_work: state === "machine_marked", says: CONTENT_MINT_STATES[state] };
}

/** THE TARGET a content row presents to `text-chain` (R21): `{}` for `document` (a page attestation does not cover
 *  a whole-document row, by `extentCovers`' own rule), the page and rect of a `pdf-page` or an image on a PDF page,
 *  and null for a kind whose coverage this module cannot evaluate, which is never answered with the whole
 *  document's ceiling. */
function contentTarget(kind, extent) {
  if (kind === "document") return {};
  if (kind === "pdf-page" || (kind === "image" && Number.isInteger(extent && extent.page)))
    return { page: Number.isInteger(extent && extent.page) ? extent.page : null,
             rect: Array.isArray(extent && extent.rect) ? extent.rect : null };
  return null;
}

/** THE ATTESTATION EXTENT OF A TRANSCRIPTION: exactly the portion the member typed, in `checkAttestation`'s grammar,
 *  so `extentCovers` answers the question it always answers. Null for a portion no attestation could scope (R23's
 *  C-52.5, refused before a typing of one can exist). */
function transcriptionAttestExtent(kind, extent) {
  const e = isObj(extent) ? extent : {};
  if (kind === "document") return { kind: "document" };
  if ((kind === "pdf-page" || kind === "image") && Number.isInteger(e.page) && e.page >= 0)
    return Array.isArray(e.rect) && e.rect.length === 4
      ? { kind: "region", source: { kind: "pdf-page", ref: `p${e.page}`, page: e.page, rect: e.rect } }
      : { kind: "page", page: e.page };
  return null;
}

/** The wire form of a stored text attestation row, in ONE place. */
function attestationShape(a) {
  return a.extent_kind === "document" ? { kind: "document" }
       : a.extent_kind === "page" ? { kind: "page", page: a.extent_page }
       : { kind: "region", source: { kind: "pdf-page", ref: `p${a.extent_page}`, page: a.extent_page,
                                     rect: safeJson(a.extent_rect) } };
}

/** R21/R25: what a transcription's attestations may raise — every attestation by somebody OTHER than the typist,
 *  scoped to the typed portion. Excluded here as well as refused at the act, so a row that somehow held one still
 *  could not rise on one member's word. */
function transcriptionCovering(tx, kind, extent) {
  const scope = transcriptionAttestExtent(kind, extent);
  if (!tx || !scope) return [];
  return tx.attestations.filter((a) => a.attestor !== tx.transcriber)
    .map((a) => ({ member: a.attestor, at: a.at, extent: scope }));
}

const staleSays = (extent) =>
  `this passage was cited as it stood under an earlier transcription of the document. The document has since been `
  + `re-read and the text may have changed, so what the citation points at is ${describeExtent(extent)} of the capture `
  + `as it was transcribed then — the record keeps it rather than moving it, because moving an authored citation is `
  + `a member's act and not the record's`;

/* ======================================================================= *
 * THE BRIDGE TO THE LEGACY READING TABLES (until extraction's CHANGE; Q3).
 * It reads exactly what extraction R30 and R36 will provide, in their shapes, and nothing else.
 * ======================================================================= */
function legacyReadings(sql) {
  const one = (q, ...a) => { const r = [...sql.exec(q, ...a)]; return r.length ? r[0] : null; };
  const has = (t) => !!one(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`, t);
  const INDEX_STATE = { PRESENT: "whole", partial: "partial" };
  return {
    readingOf(captureSha) {
      if (!has("readings")) return null;
      const row = one(`SELECT reading, capture_format FROM readings WHERE capture_sha=?`, captureSha);
      if (!row) return null;
      const reading = safeJson(row.reading) || {};
      const pc = reading.page_count;
      return { reading, chain: Array.isArray(reading.text_source) ? reading.text_source : null,
               pageCount: Number.isInteger(pc) && pc > 0 ? pc : null,
               containerExtent: Object.prototype.hasOwnProperty.call(reading, "container_extent")
                 ? reading.container_extent : undefined,
               textContainer: typeof reading.text_container === "string" ? reading.text_container : null,
               captureFormat: typeof row.capture_format === "string" ? row.capture_format : null };
    },
    /* The captures the bundle's readings carry, in the order the legacy store resolved them by. */
    capturesReadFor(bundleId) {
      if (!has("readings")) return [];
      return [...sql.exec(`SELECT capture_sha FROM readings WHERE bundle_id=? ORDER BY at IS NULL, at, capture_sha`, bundleId)]
        .map((r) => r.capture_sha);
    },
    unitsOf(captureSha) {
      const units = has("capture_text")
        ? [...sql.exec(`SELECT extent, ref, text, truncated FROM capture_text WHERE capture_sha=? ORDER BY seq LIMIT 4096`,
                       captureSha)] : [];
      const obs = has("observation_log") ? one(
        `SELECT state FROM observation_log WHERE level='content' AND subject_kind='capture' AND subject=?
           AND authority_kind='derive' ORDER BY seq DESC LIMIT 1`, captureSha) : null;
      const state = obs ? (INDEX_STATE[obs.state] || "none") : null;
      return { units: units.map((u) => ({ ...u, truncated: !!u.truncated })), state };
    },
  };
}

export class Content {
  constructor({ storage, record, membership, provenance, extraction = null, now = null }) {
    this.storage = storage;
    this.sql = storage.sql;
    this.record = record;
    this.membership = membership;
    this.provenance = provenance;
    this.extraction = extraction || legacyReadings(storage.sql);
    this.now = typeof now === "function" ? now : () => new Date().toISOString();
    this.staleListeners = [];
  }

  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  #one(q, ...a) { const r = this.#rows(q, ...a); return r.length ? r[0] : null; }

  /** The module's tables (R39), with the migrations an earlier store's shape needs. */
  migrate() { migrateContent(this.sql); }

  /** R37: may `viewer` see bundle `bundleId`? membership's one predicate (its R43) over record-core's `bundles` read
   *  contract (its R37). An absent or unrecognised viewer sees nothing (the predicate's deny arm). */
  sees(bundleId, viewer) {
    const gate = viewerPredicate(viewer);
    if (gate.scope === "DENY") return false;
    return !!this.#one(`SELECT 1 AS x FROM bundles b WHERE b.bundle_id=? AND (${gate.sql})`, bundleId, ...gate.args);
  }

  #redactor(viewer) {
    const gate = viewerPredicate(viewer);
    if (gate.scope === "member") return (id) => id ?? null;
    if (gate.scope === "DENY") return (id) => (id ? null : id ?? null);
    const memo = new Map();
    return (id) => {
      if (!id) return id ?? null;
      if (!memo.has(id)) memo.set(id, this.sees(id, viewer));
      return memo.get(id) ? id : null;
    };
  }

  #typeOf(bundleId) {
    const b = this.record.bundleInfo(bundleId);
    return b ? normalizeType(b.type) : null;
  }

  /* ===================================================================== *
   * THE CAPTURE A CITATION ADDRESSES (R11; D-580, K49).
   * ===================================================================== */

  /** R11: a non-empty `authored` capture held for the bundle wins, and one NOT held answers null — never replaced by a
   *  resolved one, which would mint a row against bytes the member did not name. Otherwise the bundle's FIRST-HELD
   *  capture by `provenance.capturesOf` (this instance's own clock, never a document's stated date), never the newest:
   *  the answer must be stable under later captures, or a resolver would re-point an authored citation at bytes the
   *  member never read (Bob, 2026-09-14, 5.8). A document intaken with a provenance document and no register row has
   *  its captures only on its readings; those are asked only when provenance holds none, in the readings' own order
   *  (never compared with the register's clock, D-580). No capture held answers null, stated by the caller. */
  captureFor(bundleId, authored = null) {
    if (typeof bundleId !== "string" || !bundleId) return null;
    const held = this.provenance.capturesOf(bundleId).map((c) => c.capture_sha);
    const read = () => (typeof this.extraction.capturesReadFor === "function" ? this.extraction.capturesReadFor(bundleId) : []);
    if (typeof authored === "string" && authored.trim()) {
      const a = authored.trim();
      return held.includes(a) || read().includes(a) ? a : null;
    }
    if (held.length) return held[0];
    const r = read();
    return r.length ? r[0] : null;
  }

  /* ===================================================================== *
   * THE CAPTURE'S CONTEXT (K73 (1); R7, R12, R30): everything the checker needs about a capture, from ONE read of the
   * persisted reading (extraction R30), so the write path and every later caller ask the same question the same way.
   * ===================================================================== */

  contentContextFor(captureSha) {
    const r = this.extraction.readingOf(captureSha);
    const held = !!r;
    const reading = r ? { text_source: r.chain ?? null, page_count: r.pageCount ?? null,
                          ...(r.containerExtent !== undefined ? { container_extent: r.containerExtent } : {}),
                          text_container: r.textContainer ?? null,
                          page_boxes: r.pageBoxes ?? (isObj(r.reading) ? r.reading.page_boxes ?? null : null) } : null;
    const container = this.#containerExtentFor(captureSha, reading);
    Object.assign(container, containerKindOf(reading, r ? r.captureFormat ?? null : null, held));
    return { chain: chainOfReading(reading), pageCount: this.#pageSetFor(captureSha, reading),
             pageBoxes: reading ? reading.page_boxes ?? null : null, container };
  }

  /** THE CAPTURE'S PAGE SET (CAP-9 / D-345): the reading's own page count wins outright where it exists. Where there
   *  is none it answers from what the record actually holds: the pages the chain's scoped steps name, unioned with the
   *  pages any attestation covers (aggregated in SQL, never walked: attestations per capture are unbounded), as the
   *  highest page seen plus one. None is NULL: undetermined and stated, never a refusal (a fence tighter than its rule
   *  would push a member toward citing the whole document, which claims MORE). */
  #pageSetFor(captureSha, reading) {
    const stored = reading && typeof reading === "object" ? reading.page_count : undefined;
    if (Number.isInteger(stored) && stored > 0) return stored;
    let max = -1;
    const chain = chainOfReading(reading);
    for (const step of Array.isArray(chain) ? chain : []) {
      const e = step && typeof step === "object" ? step.extent : null;
      if (!e || e.kind !== "pages" || !Array.isArray(e.pages)) continue;
      for (const p of e.pages) if (Number.isInteger(p) && p > max) max = p;
    }
    const m = this.#one(`SELECT max(extent_page) AS hi FROM text_attestations WHERE capture_sha=? AND extent_page IS NOT NULL`,
                        captureSha);
    if (m && Number.isInteger(m.hi) && m.hi > max) max = m.hi;
    return max < 0 ? null : max + 1;
  }

  /** REC-85 / CAP-12 / FW-19 / D-420 — THE CONTAINER'S OWN EXTENT, as the reading holds it: the sheets, the paragraph
   *  count, the slide list, the table and image lists. The stored figure or nothing: nothing in the record names a
   *  sheet, paragraph or shape except a member's own citation, and deriving a container from what was cited would let
   *  the first citation define the workbook. EVERY ABSENCE IS STATED WITH THE EMPTY LEVEL NAMED, and a level the
   *  container has no notion of is not reported as a gap. An empty `tables` or `images` list is a MEASURED ZERO. */
  #containerExtentFor(captureSha, reading) {
    const held = reading && typeof reading === "object" && reading.container_extent
      && typeof reading.container_extent === "object" ? reading.container_extent : null;
    const sheets = held && Array.isArray(held.sheets) && held.sheets.length ? held.sheets : null;
    const paragraphs = held && Number.isInteger(held.paragraphs) && held.paragraphs > 0 ? held.paragraphs : null;
    const slides = held && Array.isArray(held.slides) && held.slides.length ? held.slides : null;
    const tables = held && Array.isArray(held.tables) ? held.tables : null;
    const images = held && Array.isArray(held.images) ? held.images : null;
    const notion = held && Array.isArray(held.levels) ? held.levels : [];
    const missing = [];
    if (notion.includes("sheets") && !sheets) missing.push("the workbook's sheet list");
    if (notion.includes("paragraphs") && paragraphs === null) missing.push("the paragraph count");
    if (notion.includes("slides") && !slides) missing.push("the deck's slide list");
    if (notion.includes("tables") && !tables) missing.push("the document's table list");
    if (notion.includes("images") && !images) missing.push("the container's image list");
    if (held && notion.includes("paragraphs") && !notion.includes("tables"))
      missing.push("the document's table list (this capture was acquired before the wire carried it — FW-19)");
    if (held && notion.length && !notion.includes("images"))
      missing.push("the container's image list (this capture was acquired before the wire carried it — FW-19)");
    if (sheets && !sheets.some((s) => Number.isInteger(s && s.rows) || Number.isInteger(s && s.cols)))
      missing.push("every sheet's row and column extent (this capture was acquired before the "
                 + "wire read that figure, or its format fixes no grid — OpenDocument sets no "
                 + "maximum table size, so a .ods workbook states a NULL bound rather than "
                 + "borrowing one — D-359), so an unknown SHEET is bounded and a cell within a "
                 + "known sheet is not");
    if (slides && !slides.some((s) => Number.isInteger(s && s.shapes)))
      missing.push("every slide's shape count (this capture was acquired before the wire read "
                 + "that figure, no slide's part in it could be read, or the deck was over the text "
                 + "size bound and only its length was read — D-359, COFF-13), so a slide "
                 + "past the deck is bounded and a shape within a known slide is not");
    if (!held) missing.push("the container's own extent — no sheet list, paragraph count or "
                          + "slide list was persisted for this capture, and, if it is a PDF, no "
                          + "list of the images its pages paint (a PDF acquired before D-420 "
                          + "carries none)");
    const containerName = held && typeof held.container === "string" ? held.container : null;
    const pdfImages = containerName === "pdf" && images ? images : null;
    const short = `${String(captureSha).slice(0, 12)}…`;
    const pageImagesWhy = pdfImages ? null
      : containerName === "pdf"
        ? `this record holds no list of the images the pages of capture ${short} paint — the structure op's walk did `
          + `not finish (${held && typeof held.images_why === "string" ? held.images_why.slice(0, 120) : "no reason recorded"}) — `
          + `so whether an image is painted at this address is UNDETERMINED and stated, not refused`
        : held
          ? `capture ${short} is itemised as a ${containerName || "container"} and not as a PDF, so this record holds `
            + `no list of images painted on its pages and whether an image is painted at this address is UNDETERMINED `
            + `and stated, not refused`
          : `this record holds no list of the images the pages of capture ${short} paint — a PDF acquired before D-420 `
            + `persisted none, and nothing was persisted at all for a capture no format entry itemised — so whether an `
            + `image is painted at this address is UNDETERMINED and stated, not refused. Re-acquiring the document `
            + `records the list`;
    return {
      sheets, paragraphs, slides, tables, images,
      container_name: containerName, page_images_why: pageImagesWhy,
      held: !!(sheets || paragraphs !== null || slides || tables || images),
      empty_level: missing.length ? missing.join("; ") : null,
      why: missing.length
        ? `this record does not hold ${missing.join("; ")} for the capture ${short}, so whether an address falls inside `
          + `it is UNDETERMINED and is stated rather than guessed. It is not a refusal: refusing a citation for a bound `
          + `nobody measured would push a member toward citing the whole document, which claims more and not less`
        : `the record holds this capture's container extent as the format entry itemised it at acquire (CAP-12), so `
          + `an address outside it is refused by name and one inside it mints`,
    };
  }

  /* ===================================================================== *
   * THE CAPTURE'S TEXT ATTESTATIONS (CPDF-10; K73 (1)). A member's testimony that a document's text matches the image
   * of the page over a stated extent. Every refusal is `text-chain.checkAttestation`'s (C-35.10, C-35.11). The chain is
   * SNAPSHOTTED: an attestation is testimony about text AS IT STOOD, so a later re-read makes it `stale`, never
   * deleted — a member's testimony is not ours to remove.
   * ===================================================================== */

  attestText(pkg = {}) {
    const sha = typeof pkg.captureSha === "string" ? pkg.captureSha : "";
    const att = { member: pkg.member, at: pkg.at || this.now(), extent: pkg.extent };
    const bad = checkAttestation(att);
    if (bad) return bad;
    const r = sha ? this.extraction.readingOf(sha) : null;
    const bundleId = r ? this.#readingBundle(sha) : null;
    if (!r)
      return { ok: false, reason: "NO_READING",
               detail: `nothing in this store has been read at that capture hash, so there is no text to attest to. `
                     + `Attesting is about what a document SAYS, and this record does not yet hold what this one says` };
    if (pkg.viewer !== undefined && bundleId && !this.sees(bundleId, pkg.viewer))
      return { ok: false, reason: "NO_READING",
               detail: `nothing in this store has been read at that capture hash, so there is no text to attest to. `
                     + `Attesting is about what a document SAYS, and this record does not yet hold what this one says` };
    const chain = r.chain ?? null;
    const e = att.extent;
    return this.record.transact(() => {
      this.sql.exec(
        `INSERT OR REPLACE INTO text_attestations
           (capture_sha,bundle_id,attestor,at,extent_kind,extent_page,extent_rect,note,chain)
         VALUES (?,?,?,?,?,?,?,?,?)`,
        sha, bundleId, att.member, att.at, e.kind,
        e.kind === "page" ? e.page : (e.kind === "region" ? e.source.page : null),
        e.kind === "region" ? JSON.stringify(e.source.rect) : null,
        typeof pkg.note === "string" ? pkg.note : null,
        chain == null ? null : JSON.stringify(chain));
      return { ok: true, capture_sha: sha, attestor: att.member, at: att.at, extent: e,
               chain_at_attestation: chain,
               why: `${att.member} checked this text against the image over ${e.kind === "document"
                       ? "the whole document" : e.kind === "page" ? `page ${e.page}` : `a region of page ${e.source.page}`}. `
                  + `A leg citing outside that extent does not inherit it` };
    });
  }

  /** The bundle a capture is filed in: its register home (provenance R48's read contract), else the reading's. */
  #readingBundle(captureSha) {
    const reg = this.#one(`SELECT bundle_id FROM register WHERE capture_sha=?`, captureSha);
    if (reg) return reg.bundle_id;
    const has = this.#one(`SELECT name FROM sqlite_master WHERE type='table' AND name='readings'`);
    const rd = has ? this.#one(`SELECT bundle_id FROM readings WHERE capture_sha=?`, captureSha) : null;
    return rd ? rd.bundle_id : null;
  }

  /** Every attestation over a capture, bounded (a diligent group can produce hundreds over one scanned book), plus
   *  what they mean for a target region (`gradeCeiling`). A null chain on either side is not staleness. */
  attestationsFor(captureSha, target = null, viewer = null, limit = null) {
    if (typeof captureSha !== "string" || !captureSha)
      return { ok: false, reason: "NO_SHA", detail: "attestations are read by a capture sha256" };
    const r = this.extraction.readingOf(captureSha);
    const chain = r ? r.chain ?? null : null;
    const live = chain == null ? null : JSON.stringify(chain);
    const keep = this.#redactor(viewer);
    const cap = Math.max(1, Math.min(Math.floor(Number(limit) || TEXT_SOURCE_LIMIT_DEFAULT), TEXT_SOURCE_LIMIT_MAX));
    const page = this.#rows(
      `SELECT capture_sha, bundle_id, attestor, at, extent_kind, extent_page, extent_rect, note, chain
         FROM text_attestations WHERE capture_sha=? ORDER BY at, attestor LIMIT ?`, captureSha, cap + 1);
    const attestations = page.slice(0, cap).map((a) => ({
      bundle_id: keep(a.bundle_id), attestor: a.attestor, at: a.at, extent: attestationShape(a), note: a.note,
      stale: (a.chain != null && live != null && a.chain !== live),
      chain_at_attestation: safeJson(a.chain),
    }));
    const ceiling = gradeCeiling(chain, target,
      attestations.filter((a) => !a.stale).map((a) => ({ member: a.attestor, at: a.at, extent: a.extent })));
    return { ok: true, capture_sha: captureSha, count: attestations.length, limit: cap, truncated: page.length > cap,
             chain, chain_says: describeChain(chain), attestations, ceiling };
  }

  /* ===================================================================== *
   * MINT OR FIND (R12–R14; REC-82 / IC-83 / DEC-23 / D-164). Every write is `INSERT OR IGNORE`: an edge depends on
   * the row, so a re-promotion finds exactly what it found last time, and two members citing one passage land on ONE
   * row, whose `minted_by` and `at` record who FIRST cited it and when.
   * ===================================================================== */

  mint({ bundleId, captureSha, extent, mintedBy = CONTENT_MINTED_BY_PLANE, at = null, context = null, ctx = null }) {
    const c = context || ctx || this.contentContextFor(captureSha);
    const bad = checkContentExtent(extent, c);
    if (bad) return bad;
    /* FW-19 / IC-125: a `bytes` row has no chain and no cap, both written NULL with `cited_as` saying why; the chain
       is also left out of its address, so a re-read never moves it and never stales it. */
    const citedAs = contentCitedAs(extent);
    const chain = citedAs === "bytes" ? null : c.chain;
    const id = contentIdFor(captureSha, extent, chain);
    const before = this.#one(`SELECT content_id FROM content WHERE content_id=?`, id);
    if (!before) {
      const target = unitTargetOf(extent);
      this.sql.exec(
        `INSERT OR IGNORE INTO content
           (content_id,capture_sha,bundle_id,extent_kind,extent,ref,chain,derivation_cap,
            page_count,minted_by,at,stale,cited_as,chain_kind)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,0,?,?)`,
        id, captureSha, bundleId, extent.kind, canonicalExtent(extent), describeExtent(extent),
        chain == null ? null : JSON.stringify(chain),
        /* THE CAP IS ASKED ABOUT THE EXTENT, not about the document (D-252); NULL is undetermined and STATED. */
        citedAs === "bytes" ? null : derivationCap(chain, target),
        c.pageCount ?? null, mintedBy, at || this.now(), citedAs,
        /* R14 (D-686, D-710): how THIS unit was read, asked of the same target as the cap. */
        citedAs === "bytes" ? null : unitChainKind(chain, target));
    }
    const undetermined = mintUndetermined(extent, c);
    return { ok: true, content_id: id, minted: !before, ...(undetermined ? { undetermined } : {}) };
  }

  /** The legacy store's name for `mint`, kept for its callers. */
  mintContent(args) { return this.mint(args); }

  /** R15 — SK-7 (Bob's 5.7): MARKING A PASSAGE AS CITABLE, as an act a credential performs. It writes no edge and
   *  grants nothing about the text (attesting stays C-35.10's). `mintedBy` is the control plane's stamp and an absent
   *  one is refused rather than defaulted. The viewer gate runs BEFORE the object type, so the two refusals cannot be
   *  told apart by a caller guessing ids. The answer comes back through `contentRow`, labelled by the one helper. */
  contentMint({ bundleId, extent, mintedBy, viewer = null, at = null }) {
    if (typeof mintedBy !== "string" || !mintedBy.trim())
      return { ok: false, reason: "NO_MINTER",
               detail: `a content row records WHO marked the passage as citable, and this call carries nobody. The plane `
                     + `stamps that from the credential that asked, so an empty one means the act arrived by a route that `
                     + `does not attribute it — which is refused rather than filled in` };
    if (typeof bundleId !== "string" || !bundleId.trim())
      return { ok: false, reason: "NO_TARGET", detail: `marking a passage citable names the document the passage is in` };
    const kind = this.#typeOf(bundleId);
    if (!kind || !this.sees(bundleId, viewer))
      return { ok: false, reason: "NO_SUCH_BUNDLE", target: bundleId,
               detail: `no document is addressed by ${bundleId} in this record` };
    if (kind !== "information")
      return { ok: false, reason: "NOT_A_DOCUMENT", target: bundleId, target_type: kind ?? null,
               detail: `${bundleId} is not a document, so it has no part to point at. The content axis ranges over `
                     + `documents (DEC-21): an inquiry rests on things, it is not a thing with pages. This is stated `
                     + `rather than met with a document-extent row invented for it (IC-83 AMENDMENT 2)` };
    const sha = this.captureFor(bundleId);
    if (!sha)
      return { ok: false, reason: "NO_BYTES_HELD", target: bundleId,
               detail: `this record holds no capture of ${bundleId}, so there are no bytes for a content row to address. `
                     + `A content id is hash(capture, extent, chain) and there is no capture to hash. Absence here is a `
                     + `fact about what was captured and never evidence about what the document says` };
    const out = this.record.transact(() => this.mint({ bundleId, captureSha: sha,
      extent: isObj(extent) ? extent : { kind: "document" }, mintedBy: mintedBy.trim(), at }));
    if (!out.ok) return out;
    return { ok: true, minted: out.minted, capture_sha: sha, ...this.contentRow(out.content_id),
             ...(out.undetermined ? { undetermined: out.undetermined } : {}) };
  }

  /* ===================================================================== *
   * CITATIONS (R27, R28), for the modules whose edges cite.
   * ===================================================================== */

  /** THE WHOLE SET OF CITATIONS, RESOLVED ONCE: for each, the capture it is about and that capture's context,
   *  memoised per target and per capture so a basis citing one document for four legs pays for one resolution. */
  citationPlan(citations) {
    const list = Array.isArray(citations) ? citations : [];
    const plan = new Map(), byTarget = new Map(), byCapture = new Map();
    for (let i = 0; i < list.length; i++) {
      const cit = list[i];
      if (!cit || typeof cit.target !== "string") continue;
      const isInfo = normalizeType(OBJECT_TYPES[cit.target.split("-")[0]]) === "information";
      const authored = typeof cit.extent_capture === "string" ? cit.extent_capture : null;
      const key = `${cit.target}\u0000${authored || ""}`;
      if (!byTarget.has(key)) byTarget.set(key, isInfo ? this.captureFor(cit.target, authored) : null);
      const sha = byTarget.get(key);
      if (sha != null && !byCapture.has(sha)) byCapture.set(sha, this.contentContextFor(sha));
      plan.set(i, { target: cit.target, isInfo, authored, captureSha: sha,
                    ctx: sha == null ? { chain: null, pageCount: null, container: null } : byCapture.get(sha),
                    extent: citationExtent(cit) });
    }
    return plan;
  }

  /** C-45.5 / C-45.6: the row a citation names outright, resolved or refused by name. The capture is deliberately not
   *  compared: a member may name a row minted against an earlier capture of the same document (5.8). */
  #rowFor(contentId, targetId, label) {
    /* DEC-49 REGION is-content-row */
    const id = typeof contentId === "string" ? contentId.trim() : "";
    const row = this.#one(`SELECT content_id, bundle_id, extent_kind, ref, stale FROM content WHERE content_id=?`, id);
    if (!row)
      return { ok: false, check: CONTENT_EXTENT_CHECKS.CONTENT_ROW_UNKNOWN.check,
               code: "CONTENT_ROW_UNKNOWN",
               translation: CONTENT_EXTENT_CHECKS.CONTENT_ROW_UNKNOWN.translation,
               detail: `${label} names content_id '${id.slice(0, 16)}…', and this record holds no such part. The id is `
                     + `an address taken over the document, the passage and the transcription chain, so nothing can be `
                     + `found for one nothing minted` };
    if (row.bundle_id !== targetId)
      return { ok: false, check: CONTENT_EXTENT_CHECKS.CONTENT_ROW_NOT_THIS_TARGET.check,
               code: "CONTENT_ROW_NOT_THIS_TARGET",
               translation: CONTENT_EXTENT_CHECKS.CONTENT_ROW_NOT_THIS_TARGET.translation,
               detail: `${label} rests on '${targetId}' and names a part of '${row.bundle_id}' (${row.ref}): the leg and `
                     + `the part it points at are about two different documents` };
    /* END DEC-49 REGION is-content-row */
    return { ok: true, content_id: row.content_id };
  }

  /** R27: every refusal a set of citations earns, one context per capture per call, never thrown. In the checker's
   *  order: a named row first (a citation naming one has no extent to judge); then the target class; then the
   *  capture; then the extent. `label(i)` names a citation in the finding. */
  citationRefusals(citations, label = (i) => `citation[${i}]`, plan = null) {
    const list = Array.isArray(citations) ? citations : [];
    const p0 = plan || this.citationPlan(list);
    const lab = typeof label === "function" ? label : (i) => `${label}[${i}]`;
    const errs = [];
    for (let i = 0; i < list.length; i++) {
      const cit = list[i];
      if (!cit || typeof cit.target !== "string") continue;
      const p = p0.get(i);
      if (!p) continue;
      const named = legContentId(cit);
      if (!p.isInfo) {
        const e0 = p.extent;
        if (e0.kind !== "document" || named)
          errs.push({ check: CONTENT_EXTENT_CHECKS.CONTENT_EXTENT_UNREADABLE.check, code: "CONTENT_EXTENT_UNREADABLE",
            translation: CONTENT_EXTENT_CHECKS.CONTENT_EXTENT_UNREADABLE.translation,
            detail: `${lab(i)} names ${named ? `content_id '${named.slice(0, 16)}…'` : `extent '${String(e0.kind).slice(0, 40)}'`} on `
                  + `'${cit.target}', which is an inquiry rather than a document. An inquiry has no bytes and no pages, `
                  + `so there is no part of it to point at (DEC-21)` });
        continue;
      }
      if (named) {
        const got = this.#rowFor(named, cit.target, lab(i));
        if (!got.ok) errs.push({ check: got.check, code: got.code, translation: got.translation, detail: got.detail });
        continue;
      }
      const sha = p.captureSha, ext = p.extent;
      if (!sha) {
        if (ext.kind !== "document")
          errs.push({ check: CONTENT_EXTENT_CHECKS.CONTENT_EXTENT_NO_CHAIN.check, code: "CONTENT_EXTENT_NO_CHAIN",
            translation: CONTENT_EXTENT_CHECKS.CONTENT_EXTENT_NO_CHAIN.translation,
            detail: `${lab(i)} cites ${describeExtent(ext)} of '${cit.target}', and this record holds no capture of that `
                  + `document at all`
                  + (typeof cit.extent_capture === "string" && cit.extent_capture.trim()
                      ? ` under the capture the leg names (${cit.extent_capture.trim().slice(0, 16)}…)` : ``) });
        continue;
      }
      const bad = checkContentExtent(ext, p.ctx);
      if (bad) errs.push({ check: bad.check, code: bad.code, translation: bad.translation, detail: `${lab(i)}: ${bad.detail}` });
    }
    return errs;
  }

  /** The legacy store's order of the same pass (`#contentLegRefusals(legs, plan, label)`), kept for its callers. */
  legRefusals(legs, plan, label) { return this.citationRefusals(legs, label, plan); }

  /** R28: the row a citation resolves to. A named content id is used as it is; otherwise the plane mints R5's extent
   *  over R11's capture. The two legitimate nulls come back as themselves, never collapsed (IC-83 AMENDMENT 2): a
   *  non-document target (`INQUIRY_TARGET`) and no capture held (`NO_BYTES_HELD`), each with its reason. */
  resolveCitation(citation) {
    const cit = isObj(citation) ? citation : {};
    const target = typeof cit.target === "string" ? cit.target : "";
    const named = citationContentId(cit);
    if (named) return { content_id: named, minted: false };
    const isInfo = normalizeType(OBJECT_TYPES[target.split("-")[0]]) === "information";
    if (!isInfo)
      return { content_id: null, null_case: "INQUIRY_TARGET",
               why: `${target || "this target"} is an inquiry rather than a document. An inquiry has no capture and `
                  + `therefore no part to point at — the content axis ranges over documents (DEC-21), and this is `
                  + `undetermined and stated rather than a document-extent row invented for it` };
    const sha = this.captureFor(target, typeof cit.extent_capture === "string" ? cit.extent_capture : null);
    if (!sha)
      return { content_id: null, null_case: "NO_BYTES_HELD",
               why: `this record holds no capture of ${target}, so there are no bytes for a content row to address. `
                  + `Absence here is a fact about what was captured and never evidence about what the document says` };
    const out = this.mint({ bundleId: target, captureSha: sha, extent: citationExtent(cit),
                            mintedBy: CONTENT_MINTED_BY_PLANE, at: cit.at || null });
    if (!out.ok) return { content_id: null, null_case: "REFUSED", why: out.detail || out.code, refusal: out };
    return { content_id: out.content_id, minted: out.minted, ...(out.undetermined ? { undetermined: out.undetermined } : {}) };
  }

  /* ===================================================================== *
   * THE ROW AND ITS STANDING (R16, R17–R21).
   * ===================================================================== */

  /** R16: the row behind an id, with its mint label and the one sentence a reader needs about its standing, or null.
   *  What makes "a stale row still resolves, saying so" a behaviour rather than a claim. */
  contentRow(contentId) {
    const r = this.#one(`SELECT ${ROW_COLS} FROM content WHERE content_id=?`, contentId);
    if (!r) return null;
    const ext = { kind: r.extent_kind, ...(safeJson(r.extent) || {}) };
    return { ...r, extent: safeJson(r.extent), chain: safeJson(r.chain), stale: !!r.stale, resolves: true,
             mint: mintLabel(r.minted_by),
             says: r.stale ? staleSays(ext) : `${describeExtent(ext)}, as this record holds it` };
  }

  /** Fill in each projected referent's standing, in ONE query over the ids, mutating the rows in place (the legacy
   *  store's promote projection: a leg that carried its referent finds a row a machine may have minted, and the label
   *  says so). */
  projectStandings(rows) {
    const ids = [...new Set(rows.map((r) => r.content_id))];
    const by = new Map();
    for (const r of this.#rows(`SELECT content_id, extent_kind, extent, minted_by, stale FROM content
                                  WHERE content_id IN (SELECT value FROM json_each(?))`, JSON.stringify(ids)))
      by.set(r.content_id, r);
    for (const r of rows) {
      const row = by.get(r.content_id);
      if (!row) { r.stale = false; r.says = null; r.mint = null; continue; }
      r.extent_kind = row.extent_kind;
      r.stale = !!row.stale;
      r.minted_by = row.minted_by;
      r.mint = mintLabel(row.minted_by);
      const ext = { kind: row.extent_kind, ...(safeJson(row.extent) || {}) };
      r.says = row.stale ? staleSays(ext) : `${describeExtent(ext)}, as this record holds it`;
    }
  }

  /** The capture's text attestations over a set of captures, in ONE bounded read; truncation stated. */
  #attestationsOver(captures) {
    const ids = [...new Set((Array.isArray(captures) ? captures : []).filter((c) => typeof c === "string" && c))];
    const by = new Map();
    if (!ids.length) return { by, truncated: false };
    const cap = Math.min(TEXT_SOURCE_LIMIT_DEFAULT * ids.length, TEXT_SOURCE_LIMIT_MAX);
    const page = this.#rows(
      `SELECT capture_sha, attestor, at, extent_kind, extent_page, extent_rect, chain
         FROM text_attestations WHERE capture_sha IN (SELECT value FROM json_each(?))
        ORDER BY capture_sha, at, attestor LIMIT ?`, JSON.stringify(ids), cap + 1);
    for (const a of page.slice(0, cap)) {
      if (!by.has(a.capture_sha)) by.set(a.capture_sha, []);
      by.get(a.capture_sha).push(a);
    }
    return { by, truncated: page.length > cap };
  }

  /** The transcriptions among a set of rows, with their own attestations, in two bounded reads. */
  #transcriptionsOver(contentIds) {
    const ids = [...new Set((Array.isArray(contentIds) ? contentIds : []).filter((c) => typeof c === "string" && c))];
    const by = new Map();
    if (!ids.length) return { by, truncated: false };
    const rows = this.#rows(
      `SELECT content_id, transcriber, at, text_sha256 FROM transcriptions
        WHERE content_id IN (SELECT value FROM json_each(?)) LIMIT ?`, JSON.stringify(ids), ids.length);
    if (!rows.length) return { by, truncated: false };
    for (const r of rows) by.set(r.content_id, { ...r, attestations: [] });
    const cap = Math.min(TEXT_SOURCE_LIMIT_DEFAULT * rows.length, TEXT_SOURCE_LIMIT_MAX);
    const page = this.#rows(
      `SELECT content_id, attestor, at, note FROM transcription_attestations
        WHERE content_id IN (SELECT value FROM json_each(?)) ORDER BY content_id, at, attestor LIMIT ?`,
      JSON.stringify(rows.map((r) => r.content_id)), cap + 1);
    for (const a of page.slice(0, cap)) by.get(a.content_id).attestations.push(a);
    return { by, truncated: page.length > cap };
  }

  /** ONE ROW'S STANDING: its ceiling on the transcription axis (R21) and the sentence that says which. The capture's
   *  attestations are judged against the ROW's own chain (an attestation made against a transcription the citation
   *  never saw did not check the text it points at); a TYPING is raised only by attestations of that typing, by
   *  members other than the typist (REC-87). `connectionByBundle`, when a caller hands it, adds the legacy registry's
   *  connection axis (see `standings`). */
  #standing(r, atts, txs = null, connectionByBundle = null) {
    const extent = { kind: r.extent_kind, ...(safeJson(r.extent) || {}) };
    const chain = safeJson(r.chain);
    const target = contentTarget(r.extent_kind, extent);
    const tx = txs && txs.by ? txs.by.get(r.content_id) : null;
    const covering = tx ? transcriptionCovering(tx, r.extent_kind, extent)
      : (atts.by.get(r.capture_sha) || [])
        .filter((a) => !(a.chain != null && r.chain != null && a.chain !== r.chain))
        .map((a) => ({ member: a.attestor, at: a.at, extent: attestationShape(a) }));
    const transcription = r.cited_as === "bytes"
      ? { ceiling: null, determinant: null, by: [], applies: false,
          why: `this row cites ${describeExtent(extent)} AS ITSELF — the image's bytes, not text read off it — so no `
             + `transcription stands between the citation and what it points at. Its fidelity is the capture's own, `
             + `established on the provenance chain; a transcription ceiling does not apply, which is a different fact `
             + `from one that is undetermined` }
      : target == null
      ? { ceiling: null, determinant: null, by: [],
          why: `this plane cannot yet evaluate what a ${r.extent_kind} extent covers, so what a leg citing it may claim on `
             + `the transcription axis is undetermined — stated, and never resolved into the whole document's ceiling` }
      : gradeCeiling(chain, target, covering);
    const out = {
      content_id: r.content_id, bundle_id: r.bundle_id, capture_sha: r.capture_sha,
      extent_kind: r.extent_kind, extent, ref: r.ref, chain,
      derivation_cap: r.derivation_cap, page_count: r.page_count,
      minted_by: r.minted_by, at: r.at, stale: !!r.stale,
      cited_as: r.cited_as ?? "text",
      mint: mintLabel(r.minted_by),
      transcription,
      /* The capture axis is the DOCUMENT's (DEC-4): one value, keyed by bundle, never a per-portion copy (R19, R35). */
      capture: { grain: "document", from: `earned.capture[${r.bundle_id}]`,
        why: `the capture axis is answered once, for the DOCUMENT, and never per portion: there is no per-portion `
           + `capture grade in this record and inventing one would be a third scale (DEC-4). What that one answer `
           + `states is the weakest link of how the BYTES arrived and what any machine transcription of this `
           + `document's text is measured at — so a portion of an OCR'd document is bounded exactly as the document `
           + `is, under earned.capture` },
      ...(atts.truncated || (tx && txs.truncated) ? { attestations_truncated: true } : {}),
      says: r.stale ? staleSays(extent) : `${describeExtent(extent)}, as this record holds it`,
    };
    if (connectionByBundle) out.connection = legacyConnectionAxis(r, extent, connectionByBundle);
    return out;
  }

  /** R20: what each row earns, for at most 200 ids, in a fixed number of set-based reads (the rows, the attestations
   *  over their captures, the typings among them), each without a connection axis. A caller that still owns the
   *  connection axis (the legacy store's earned registry, until `connections` takes it) hands its per-bundle map as
   *  `connectionByBundle` and gets that axis back beside each standing. */
  standings(contentIds, connectionByBundle = null) {
    const ids = [...new Set((Array.isArray(contentIds) ? contentIds : [])
      .filter((c) => typeof c === "string" && c))].slice(0, CONTENT_EARNED_MAX);
    const out = {};
    if (!ids.length) return out;
    const rows = this.#rows(`SELECT ${ROW_COLS} FROM content WHERE content_id IN (SELECT value FROM json_each(?)) LIMIT ?`,
                            JSON.stringify(ids), ids.length);
    if (!rows.length) return out;
    const atts = this.#attestationsOver(rows.map((r) => r.capture_sha));
    const txs = this.#transcriptionsOver(rows.map((r) => r.content_id));
    for (const r of rows) out[r.content_id] = this.#standing(r, atts, txs, connectionByBundle);
    return out;
  }

  /** R17–R19: THE FIXED-KEY `content` READ. One key, one row, nothing else accepted: every other parameter is
   *  refused BY NAME (declared as the accepted set, never a denylist of predicate spellings). Absent and invisible are
   *  ONE answer: the id is a hash, so an answer that told them apart would confirm a passage exists in a project the
   *  caller was never invited to. */
  contentRead({ id, viewer = null, extras = [] } = {}) {
    const unknown = [...new Set((Array.isArray(extras) ? extras : []).filter((k) => !CONTENT_READ_PARAMS.has(k)))].sort();
    if (unknown.length)
      return { ok: false, reason: "FIXED_KEY_ONLY", rejected: unknown,
               detail: `the content read is FIXED-KEY: it resolves ONE row by content_id and takes no predicate and no `
                     + `paging (D-222 puts the content-grain query arm in stage C, behind D-225's caps). This call carried `
                     + `${unknown.join(", ")}, which it refuses rather than ignores — a parameter silently dropped is a `
                     + `filter the caller believes was applied` };
    if (typeof id !== "string" || !id) return { ok: false, reason: "NO_ID", detail: "content requires ?id=<content_id>" };
    const r = this.#one(`SELECT ${ROW_COLS} FROM content WHERE content_id=?`, id);
    if (!r || !this.sees(r.bundle_id, viewer))
      return { ok: false, reason: "NO_SUCH_CONTENT", target: id,
               detail: `no content row is addressed by this id in this record. A content id is hash(capture, canonical `
                     + `extent, chain) — it is minted when a leg first cites the passage, so an id nothing has cited does `
                     + `not exist yet` };
    const txs = this.#transcriptionsOver([r.content_id]);
    const tx = txs.by.get(r.content_id) || null;
    const atts = tx ? { by: new Map(), truncated: false } : this.#attestationsOver([r.capture_sha]);
    const standing = this.#standing(r, atts, txs);
    const target = contentTarget(r.extent_kind, standing.extent);
    const txScope = tx ? transcriptionAttestExtent(r.extent_kind, standing.extent) : null;
    const all = tx
      ? tx.attestations.map((a) => ({ attestor: a.attestor, at: a.at, extent: txScope, stale: false }))
      : (atts.by.get(r.capture_sha) || []).map((a) => ({
          attestor: a.attestor, at: a.at, extent: attestationShape(a),
          stale: (a.chain != null && r.chain != null && a.chain !== r.chain) }));
    const covering = target == null ? []
      : all.filter((a) => !a.stale && extentCovers(a.extent, target) && !(tx && a.attestor === tx.transcriber));
    const { capture, ...row } = standing;
    return {
      ok: true, ...row,
      /* THE CONNECTION AXIS IS NAMED AS ABSENT RATHER THAN OMITTED: it is a fact about an inquiry's subject, and this
         read names no inquiry. */
      connection: { determined: false, grain: r.extent_kind === "document" ? "document" : "portion",
        grade: null, undetermined_because: "NO_SUBJECT_IN_THIS_READ",
        empty_level: "the question — a connection grade is earned against an inquiry's subject entity, and this read "
                   + "resolves a ROW rather than a LEG",
        why: `ask op=earnedbasis with the inquiry whose leg cites this row: a connection is what the record earns `
           + `between THIS document and THAT question's subject, and it has no value independent of a question` },
      capture,
      attestations: { covering, all, count: all.length,
        ...(atts.truncated || txs.truncated ? { truncated: true } : {}),
        why: tx
          ? `this row is a member's TYPING (op=transcription reads its text). Only an attestation OF THAT TYPING, by a `
            + `member other than ${tx.transcriber} who typed it, raises its ceiling. Attestations of the capture's `
            + `machine text are about different text and are not listed`
          : `an attestation raises this row's ceiling only if its extent COVERS this row's extent (textchain's `
            + `extentCovers) AND it was made against the transcription this row was minted under. A page attestation `
            + `does not cover a whole-document row, and an attestation over another page does not cover this one` },
    };
  }

  /* ===================================================================== *
   * STALE (R22, R41).
   * ===================================================================== */

  /** R41: a module that tells members what they cite (inquiry, K31's pattern) registers once; on each row a replaced
   *  reading marks stale whose passage the new text affects or cannot be told, `fn` is called with the notice. */
  onStale(module, fn) {
    if (typeof module !== "string" || !module || typeof fn !== "function")
      return { ok: false, reason: "LISTENER_MALFORMED" };
    if (this.staleListeners.some((l) => l.module === module)) return { ok: false, reason: "LISTENER_DECLARED", module };
    this.staleListeners.push({ module, fn });
    return { ok: true };
  }

  /** R22: RE-EXTRACTION MOVED THE CHAIN — mark, never delete. Every row over the capture whose recorded chain differs
   *  from the new non-null chain becomes `stale`, one way (un-staling would be the record deciding an old citation is
   *  current again); nothing is deleted or moved; a null chain marks nothing (an unrecorded chain is not one that
   *  moved). A member's TYPING is never staled: its chain is `typed(member)` over the BYTES, which cannot change under
   *  a row that names them. ONE statement, not a loop (rows per capture are unbounded by design).
   *  R41: each row marked is graded old text against new (`unitsBefore`, the capture's units as they stood, when the
   *  caller holds them; without them the grade is UNDETERMINED and says so), and every registered listener is told of
   *  each row whose grade is affected or undetermined. Returns the count. */
  markStale(captureSha, chain, { unitsBefore = null } = {}) {
    const live = Array.isArray(chain) ? JSON.stringify(chain) : null;
    if (live == null) return 0;
    const where = `capture_sha=? AND chain IS NOT NULL AND chain<>? AND stale=0
                   AND content_id NOT IN (SELECT content_id FROM transcriptions WHERE capture_sha=?)`;
    const hit = this.staleListeners.length
      ? this.#rows(`SELECT content_id, capture_sha, bundle_id, extent_kind, extent, ref, cited_as FROM content WHERE ${where}`,
                   captureSha, live, captureSha) : null;
    const n = hit ? hit.length : this.#one(`SELECT count(*) AS c FROM content WHERE ${where}`, captureSha, live, captureSha).c;
    if (n) this.sql.exec(`UPDATE content SET stale=1 WHERE ${where}`, captureSha, live, captureSha);
    if (hit && hit.length) {
      const before = unitsBefore && Array.isArray(unitsBefore.units) ? unitsBefore
        : { units: [], state: null };
      const after = this.extraction.unitsOf(captureSha) || { units: [], state: null };
      for (const row of hit) {
        const extent = safeJson(row.extent) ? { kind: row.extent_kind, ...safeJson(row.extent) } : null;
        const g = before.units.length ? gradeAcross(row, extent, before, after)
          : { grade: "UNDETERMINED", affects: "undetermined", reason: "cited_text_not_held",
              why: "the text this row was cited under is no longer held beside the new reading, so whether the re-read "
                 + "changed the passage cannot be told" };
        if (g.affects === "unaffected") continue;
        const notice = { content_id: row.content_id, bundle_id: row.bundle_id, capture_sha: row.capture_sha,
                         ref: row.ref, grade: g.grade, affects: g.affects, reason: g.reason, why: g.why,
                         found_at: g.found_at ?? null, similarity: g.similarity ?? null, stale: true,
                         says: "the document was re-read and the text under your citation may have changed. Nothing "
                             + "moved: keep the citation as it stands, or adopt the passage under the new reading" };
        for (const l of this.staleListeners) l.fn(notice);
      }
    }
    return n;
  }

  /* ===================================================================== *
   * TRANSCRIBE (R23–R26; REC-87 / IC-127 / IC-128, Bob's 5.2). A member selects a portion of a document and types what
   * it says: AUTHORED text, its cap UNDETERMINED and STATED, raised only by a SECOND member's attestation. The portion
   * is a content row minted through `mint` under the chain `[typed(member)]`; the text lives in `transcriptions`.
   * ===================================================================== */

  #transcribeRefusal(code, detail, extra) {
    const row = TRANSCRIBE_CHECKS[code];
    return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail, ...(extra || {}) };
  }

  transcribe({ bundleId = null, extent = null, text = null, transcriber = null, viewer = null, at = null } = {}) {
    const refusal = (code, detail, extra) => this.#transcribeRefusal(code, detail, extra);
    const who = typeof transcriber === "string" ? transcriber.trim() : "";
    const target = typeof bundleId === "string" ? bundleId.trim() : "";
    /* DEC-49 REGION is-transcribe-act */
    if (!who || isMachineIdentity(who))
      return refusal("TRANSCRIBE_NOT_A_MEMBER",
        who ? `'${who.slice(0, 60)}' is a machine credential. Typing what a page says is a person's act in their own `
              + `name; a machine's reading of a page is OCR, a different step kind`
            : `this call carries nobody. The plane stamps the transcriber from the credential that asked, so an empty `
              + `one means the act arrived by a route that does not attribute it`);
    const kind = target ? this.#typeOf(target) : null;
    const seen = kind ? this.sees(target, viewer) : false;
    if (!kind || !seen || kind !== "information")
      return refusal("TRANSCRIBE_NO_DOCUMENT",
        !target ? `pass bundleId=<INFO-…>: the document whose page you transcribed`
        : kind && seen ? `${target} is not a document, so it has no page to transcribe (DEC-21)`
          : `no document is addressed by ${target.slice(0, 60)} in this record`,
        { target: target || null });
    const sha = this.captureFor(target);
    if (!sha)
      return refusal("TRANSCRIBE_NO_BYTES",
        `this record holds no capture of ${target}, so there is no copy to have typed from. Absence here is a fact `
        + `about what was captured, never about what the document says`, { target });
    const bare = extent == null || (isObj(extent) && Object.keys(extent).length === 0);
    if (bare)
      return refusal("TRANSCRIBE_NO_PORTION",
        `no portion was selected. A transcription is of a PART the member read — a page or a region of one, or the `
        + `whole document NAMED as such — and a typing with no stated part would be read as covering all of it`,
        { target });
    /* END DEC-49 REGION is-transcribe-act */
    const typed = typeof text === "string" ? text : "";
    const bytes = new TextEncoder().encode(typed).length;
    const digest = sha256HexSync(typed);
    const chain = [{ step: "typed", member: who, text_sha256: digest }];
    /* THE EXTENT GRAMMAR IS ASKED UNDER THE TYPING'S OWN CHAIN, NOT THE CAPTURE'S: a scanned title no engine could
       read is a capture with no chain, and the member's typing IS the transcription over the portion. */
    const ctx = { ...this.contentContextFor(sha), chain };
    const bad = checkContentExtent(isObj(extent) ? extent : null, ctx);
    if (bad) return bad;
    const ekind = extent.kind;
    /* DEC-49 REGION is-transcribe-portion */
    if (contentCitedAs(extent) === "bytes" || transcriptionAttestExtent(ekind, extent) == null)
      return refusal("TRANSCRIBE_PORTION_UNREADABLE",
        `${describeExtent(extent)} is a part this plane cannot check a typing against — a second member's attestation `
        + `needs a document, a page or a region of a page to scope to, and a transcription nobody could ever attest `
        + `would stand undetermined for good`, { target, extent_kind: ekind ?? null });
    if (!typed.trim())
      return refusal("TRANSCRIBE_NO_TEXT",
        `the typed text is empty. Nothing is prefilled: the text is what the member read off ${describeExtent(extent)}, `
        + `typed by them`, { target });
    if (bytes > TRANSCRIPTION_MAX_BYTES)
      return refusal("TRANSCRIBE_TEXT_TOO_LONG",
        `${bytes} B typed, over the ${TRANSCRIPTION_MAX_BYTES} B one passage is stored to (CAPTURE_TEXT_UNIT_CAP). `
        + `Refused rather than cut: a typing silently truncated would be text the member did not type, standing in `
        + `their name`, { target, bytes, limit: TRANSCRIPTION_MAX_BYTES });
    /* END DEC-49 REGION is-transcribe-portion */
    const chainBad = checkChain(chain);
    if (chainBad) return chainBad;
    const when = typeof at === "string" && at.trim() ? at.trim() : this.now();
    const out = this.record.transact(() => {
      const m = this.mint({ bundleId: target, captureSha: sha, extent, mintedBy: who, at: when, context: ctx });
      if (!m.ok) return m;
      this.sql.exec(
        `INSERT OR IGNORE INTO transcriptions (content_id,capture_sha,bundle_id,transcriber,text,text_sha256,at)
         VALUES (?,?,?,?,?,?,?)`, m.content_id, sha, target, who, typed, digest, when);
      return m;
    });
    if (!out.ok) return out;
    const standing = this.#transcriptionStanding(out.content_id);
    return {
      ok: true, minted: out.minted, content_id: out.content_id, bundle_id: target, capture_sha: sha,
      extent_kind: ekind, extent: standing ? standing.extent : extent, ref: describeExtent(extent),
      transcriber: who, text_sha256: digest, bytes, chain, chain_says: describeChain(chain),
      derivation_cap: standing ? standing.derivation_cap : null,
      transcription: standing ? standing.transcription : null,
      says: `${who} typed ${describeExtent(extent)}. What a member types is authored text: its fidelity is UNDETERMINED, `
          + `stated, until a DIFFERENT member checks it against the page and attests it (op=transcriptionattest). The `
          + `typist's own attestation is refused`
          + (out.minted ? `` : `. This exact typing by ${who} was already recorded, and is found rather than written again`),
    };
  }

  #transcriptionStanding(contentId) {
    const r = this.#one(`SELECT ${ROW_COLS} FROM content WHERE content_id=?`, contentId);
    if (!r) return null;
    return this.#standing(r, { by: new Map(), truncated: false }, this.#transcriptionsOver([contentId]));
  }

  /** The transcription a content id names, or C-52.8. Absent, invisible and not-a-typing are ONE answer. */
  #transcriptionOf(contentId, viewer) {
    const id = typeof contentId === "string" ? contentId.trim() : "";
    /* DEC-49 REGION is-transcription-source */
    const t = id ? this.#one(`SELECT content_id, capture_sha, bundle_id, transcriber, text, text_sha256, at
                                FROM transcriptions WHERE content_id=?`, id) : null;
    if (!t || !this.sees(t.bundle_id, viewer))
      return this.#transcribeRefusal("TRANSCRIPTION_NOT_FOUND",
        id ? `no transcription readable here is addressed by content_id '${id.slice(0, 16)}…'`
           : `pass contentId=<the content id op=transcribe returned>`, { content_id: id || null });
    /* END DEC-49 REGION is-transcription-source */
    return { ok: true, t };
  }

  /** R25: A SECOND MEMBER ATTESTS A TYPING. `checkAttestation` (C-35.10, C-35.11) unchanged, the scope DERIVED from the
   *  typed portion and never taken from the caller; the typist is refused BY NAME (C-52.9). One attestation per (row,
   *  attestor), a repeat replacing it; the typing itself is unchanged. */
  transcriptionAttest({ contentId = null, attestor = null, viewer = null, at = null, note = null } = {}) {
    const src = this.#transcriptionOf(contentId, viewer);
    if (!src.ok) return src;
    const { t } = src;
    const row = this.#one(`SELECT extent_kind, extent FROM content WHERE content_id=?`, t.content_id);
    const scope = row ? transcriptionAttestExtent(row.extent_kind, safeJson(row.extent)) : null;
    const att = { member: attestor, at: typeof at === "string" && at.trim() ? at.trim() : this.now(), extent: scope };
    const bad = checkAttestation(att);
    if (bad) return bad;
    const who = String(attestor).trim();
    /* DEC-49 REGION is-transcription-attest */
    if (who === t.transcriber)
      return this.#transcribeRefusal("TRANSCRIPTION_SELF_ATTEST",
        `${who} typed this transcription (${t.at}). An attestation is a SECOND member checking it against the page; the `
        + `typist's own is not evidence and would raise the ceiling on one member's word`,
        { content_id: t.content_id, transcriber: t.transcriber });
    /* END DEC-49 REGION is-transcription-attest */
    const before = this.#transcriptionStanding(t.content_id);
    this.sql.exec(`INSERT OR REPLACE INTO transcription_attestations (content_id,bundle_id,attestor,at,note) VALUES (?,?,?,?,?)`,
      t.content_id, t.bundle_id, who, att.at, typeof note === "string" && note.trim() ? note : null);
    const after = this.#transcriptionStanding(t.content_id);
    return {
      ok: true, content_id: t.content_id, transcriber: t.transcriber, attestor: who, at: att.at, extent: scope,
      ceiling_before: before ? before.transcription : null,
      transcription: after ? after.transcription : null,
      says: `${who} checked ${t.transcriber}'s typing against the page and says it matches. A leg citing this `
          + `transcription may now claim what an attestation supports; the typing itself is unchanged, and the chain `
          + `still records that a member typed it`,
    };
  }

  /** R26: one typing, its text, who typed it, who has attested it (the typist's own `counts: false`), and what a leg
   *  citing it may claim. */
  transcriptionRead({ id = null, viewer = null } = {}) {
    const src = this.#transcriptionOf(id, viewer);
    if (!src.ok) return src;
    const { t } = src;
    const standing = this.#transcriptionStanding(t.content_id);
    const txs = this.#transcriptionsOver([t.content_id]);
    const tx = txs.by.get(t.content_id);
    return {
      ok: true, content_id: t.content_id, bundle_id: t.bundle_id, capture_sha: t.capture_sha,
      extent_kind: standing ? standing.extent_kind : null, extent: standing ? standing.extent : null,
      ref: standing ? standing.ref : null,
      transcriber: t.transcriber, at: t.at, text: t.text, text_sha256: t.text_sha256,
      chain: standing ? standing.chain : null,
      chain_says: describeChain(standing ? standing.chain : null),
      derivation_cap: standing ? standing.derivation_cap : null,
      transcription: standing ? standing.transcription : null,
      attestations: (tx ? tx.attestations : []).map((a) => ({ attestor: a.attestor, at: a.at, note: a.note,
                                                              counts: a.attestor !== t.transcriber })),
      ...(txs.truncated ? { attestations_truncated: true } : {}),
      says: `${t.transcriber} typed ${standing ? standing.ref : "this portion"}. Authored text: its fidelity is `
          + `undetermined until a different member attests it against the page`,
    };
  }

  /* ===================================================================== *
   * THE NOTICE FOR ONE CITED PASSAGE (R29–R31; D-394 / REC-221). Writes nothing: §18.1's strongest guarantee that a
   * proposal is never mistaken for a re-pointing is to make it impossible to persist one.
   * ===================================================================== */

  /** R30: the extent test asked of the NEWER capture. `holds` only on a positive test; an existing row at that extent
   *  of the newer capture is FOUND and named, never minted. */
  #extentTestAcross(extent, newerSha) {
    const existing = (e) => this.#one(`SELECT content_id FROM content WHERE capture_sha=? AND extent=? ORDER BY content_id LIMIT 1`,
                                      newerSha, canonicalExtent(e))?.content_id ?? null;
    if (!isObj(extent) || typeof extent.kind !== "string")
      return { holds: false, reason: "extent_unreadable", existing_content_id: null,
               why: "the cited passage's extent could not be read back from its row, so nothing was tested" };
    if (extent.kind === "document")
      return { holds: true, reason: "whole_document", existing_content_id: existing(extent),
               why: "the citation is to the whole document, and a whole document is at the same extent in every version of it" };
    const ctx = this.contentContextFor(newerSha);
    const bad = checkContentExtent(extent, ctx);
    const said = bad ? String(bad.detail || bad.code).slice(0, 240) : "";
    if (bad && bad.code === "CONTENT_EXTENT_OUT_OF_RANGE")
      return { holds: false, reason: "outside_newer_capture", existing_content_id: null,
               why: `the newer capture does not hold this extent (${said}); the passage may have moved, been renumbered `
                  + `or been removed` };
    if (bad && bad.code === "CONTENT_EXTENT_NO_CHAIN")
      return { holds: false, reason: "newer_capture_unread", existing_content_id: null,
               why: "nobody has read the newer capture yet, so the record holds no text of it at any extent to test "
                  + "against — that is a fact about this record, not about the document" };
    if (bad)
      return { holds: false, reason: "not_testable", existing_content_id: null,
               why: `the extent test could not be asked of the newer capture (${bad.code}: ${said})` };
    const unheld = extentBoundUnheld(extent, ctx, pdfPageBoxUndetermined);
    if (unheld)
      return { holds: false, reason: "bound_not_held", existing_content_id: null,
               why: `${unheld}, so whether this extent exists in it cannot be tested` };
    return { holds: true, reason: "extent_in_newer_capture", existing_content_id: existing(extent),
             why: `${describeExtent(extent)} exists in the newer capture as the record holds it` };
  }

  #unitsOf(captureSha, memo) {
    if (!memo.has(captureSha)) memo.set(captureSha, this.extraction.unitsOf(captureSha) || { units: [], state: null });
    return memo.get(captureSha);
  }

  /** The notice for ONE stored row (`extent` as JSON text). The legacy store's question arm (reevaluation's) calls it
   *  per passage with one `memo`, because one newer capture is usually asked about by every leg citing it. */
  noticeForRow(row, viewer, memo = new Map()) {
    const extent = safeJson(row.extent);
    const cap = VERSION_NOTICE_ADDRESSES_MAX;
    /* The addresses the capture was retrieved from: provenance's `captured_locators` (its R48 read contract). */
    const addrRows = this.#rows(
      `SELECT DISTINCT address_norm FROM captured_locators WHERE capture_sha=? ORDER BY address_norm LIMIT ?`,
      row.capture_sha, cap + 1);
    const addresses = addrRows.slice(0, cap).map((r) => r.address_norm);
    const chains = [];
    const newerBySha = new Map();
    for (const addr of addresses) {
      const at = this.provenance.versionChain({ addressNorm: addr, at: row.capture_sha, limit: 1, viewer });
      if (!at.ok) {
        chains.push({ address_norm: addr, read: false, reason: at.reason,
                      why: "this capture is not a version the chain at this address holds for you" });
        continue;
      }
      const after = at.total - 1 - at.at_index;
      let newest = null;
      if (after > 0) {
        const last = this.provenance.versionChain({ addressNorm: addr, limit: 1, offset: at.total - 1, viewer });
        newest = last.ok && last.versions[0] ? last.versions[0] : null;
      }
      chains.push({ address_norm: addr, read: true, versions: at.total, position: at.at_index, newer_count: after,
                    newest: newest && { capture_sha: newest.capture_sha, bundle_id: newest.bundle_id,
                                        first_retrieved: newest.first_retrieved } });
      if (newest && !newerBySha.has(newest.capture_sha)) newerBySha.set(newest.capture_sha, newest);
    }
    const read = chains.filter((c) => c.read);
    const allRead = addresses.length > 0 && read.length === addresses.length && addrRows.length <= cap;
    const newer = newerBySha.size > 0 ? true : allRead ? false : null;
    const fullExtent = extent ? { kind: row.extent_kind, ...extent } : null;
    const candidates = [...newerBySha.values()].map((v) => {
      const test = this.#extentTestAcross(fullExtent, v.capture_sha);
      const g = gradeAcross(row, fullExtent, this.#unitsOf(row.capture_sha, memo), this.#unitsOf(v.capture_sha, memo));
      return { capture_sha: v.capture_sha, bundle_id: v.bundle_id, first_retrieved: v.first_retrieved,
               extent: test.holds ? fullExtent : null, matched: test.holds, reason: test.reason, why: test.why,
               existing_content_id: test.existing_content_id,
               grade: g.grade, affects: g.affects, grade_reason: g.reason, grade_why: g.why,
               found_at: g.found_at, similarity: g.similarity,
               candidate_only: true, identity: "not_established",
               says: test.holds
                 ? "a CANDIDATE: a passage at the same extent of the newer capture. It is not established to be the same "
                   + "passage; extent-match is a sufficient signal for a candidate and never evidence of identity"
                 : "UNDETERMINED: " + test.why };
    });
    const state = newer === true
      ? (candidates.length && candidates.every((c) => c.matched) ? "newer_capture_matched" : "newer_capture_undetermined")
      : newer === false ? "no_newer_capture" : "chain_unread";
    const unread = !addresses.length
      ? "the record holds no address this capture was retrieved from, so its version chain cannot be read"
      : addrRows.length > cap
        ? `this capture was seen at more than ${cap} addresses and only ${cap} were asked`
        : "at least one address's version chain does not hold this capture for you";
    return {
      content_id: row.content_id, capture_sha: row.capture_sha, bundle_id: row.bundle_id,
      extent_kind: row.extent_kind, ref: row.ref,
      state, newer, chain_read: newer === false ? true : read.length > 0, affects: affectsOf(state, candidates),
      chains, addresses_asked: addresses.length, addresses_truncated: addrRows.length > cap,
      candidates,
      says: state === "no_newer_capture" ? null : VERSION_NOTICE_STATES[state],
      why: state === "no_newer_capture"
        ? "every version chain this capture sits on was read and holds nothing after it"
        : state === "chain_unread" ? unread : null,
    };
  }

  /** R29–R31: one cited passage against the newer captures of its document, for a viewer. An absent or invisible
   *  passage is C-80.3. The chains are the ones this viewer sees, and the answer says so. */
  passageNotice({ contentId = null, viewer = null } = {}) {
    const cid = String(contentId ?? "").trim();
    const r = cid ? this.#one(`SELECT content_id, capture_sha, bundle_id, extent_kind, extent, ref, cited_as
                                 FROM content WHERE content_id=?`, cid) : null;
    /* DEC-49 REGION is-passage-notice */
    if (!r || !this.sees(r.bundle_id, viewer)) {
      const row = VERSION_NOTICE_CHECKS.VERSION_NOTICE_NO_CONTENT;
      return { ok: false, reason: "VERSION_NOTICE_NO_CONTENT", code: "VERSION_NOTICE_NO_CONTENT", check: row.check,
               translation: row.translation, detail: `no cited passage by the id '${cid.slice(0, 80)}' is readable here.`,
               content: cid };
    }
    /* END DEC-49 REGION is-passage-notice */
    return { ok: true, ...this.noticeForRow(r, viewer), states: VERSION_NOTICE_STATES, grades: VERSION_NOTICE_GRADES,
             wrote: false, proposal_only: true,
             visible_to: "the version chains here are the ones visible to you; a version filed in a project you were not "
               + "invited to is not in them" };
  }

  /* ===================================================================== *
   * THE CROP (R32; D-419, K70).
   * ===================================================================== */

  /** R32: the crop of an image cited by page and rectangle, cut through `pdf-pixels` from the capture's own bytes in
   *  the evidence store, and served as a DERIVED RENDITION that says so (EXTRACTION-BREADTH §3.4: "the viewer shows the
   *  crop; the crop is not the evidence"). Writes nothing. A crop from bytes whose digest is not the row's capture is
   *  refused rather than shown. */
  async cropOf({ contentId = null, viewer = null } = {}) {
    const id = typeof contentId === "string" ? contentId.trim() : "";
    const r = id ? this.#one(`SELECT content_id, capture_sha, bundle_id, extent_kind, extent FROM content WHERE content_id=?`, id)
      : null;
    if (!r || !this.sees(r.bundle_id, viewer))
      return { ok: false, reason: "NO_SUCH_CONTENT", target: id || null,
               detail: "no content row is addressed by this id in this record" };
    const e = safeJson(r.extent) || {};
    if (r.extent_kind !== "image" || e.part != null || !Number.isInteger(e.page))
      return { ok: false, reason: "CROP_NOT_A_PAGE_IMAGE", content_id: r.content_id, extent_kind: r.extent_kind,
               detail: r.extent_kind !== "image"
                 ? `this row cites a ${r.extent_kind} extent, and only an image on a PDF page has a crop`
                 : "this row cites an image that is a member of a container ({part}), whose bytes are the image itself "
                   + "rather than a rectangle of a page; there is nothing to cut out of it" };
    const store = this.record.evidenceStore();
    if (!store)
      return { ok: false, reason: "CROP_NO_EVIDENCE_STORE", content_id: r.content_id,
               detail: "this instance has no evidence store bound, so the capture's bytes cannot be read and no crop was "
                     + "made. That is a fact about this instance, not about the image" };
    const obj = await store.get(r.capture_sha);
    if (!obj)
      return { ok: false, reason: "CROP_CAPTURE_NOT_HELD", content_id: r.content_id, capture_sha: r.capture_sha,
               detail: "the evidence store holds no object under this row's capture, so no crop was made" };
    const bytes = new Uint8Array(await obj.arrayBuffer());
    const out = await cropImage(bytes, { kind: "image", page: e.page, rect: Array.isArray(e.rect) ? e.rect : null });
    if (!out || out.ok !== true)
      return { ok: false, reason: "CROP_NOT_DERIVABLE", content_id: r.content_id, derived: true,
               pdf_pixels_reason: out && typeof out.reason === "string" ? out.reason : null,
               pdf_pixels_why: out && typeof out.why === "string" ? out.why : null,
               detail: "the image this row's extent names could not be cut out of its document; pdf-pixels' own reason "
                     + "is beside this one" };
    if (out.capture_sha256 !== r.capture_sha)
      return { ok: false, reason: "CROP_CAPTURE_MISMATCH", content_id: r.content_id, capture_sha: r.capture_sha,
               cropped_from: out.capture_sha256 ?? null,
               detail: "the crop was taken from bytes whose sha256 is not the capture this row names, so it is not handed back" };
    return { ...out, ok: true, derived: true, content_id: r.content_id, capture_sha: r.capture_sha,
             says: "a derived rendition for display: the evidence is the capture's bytes plus the extent, and this crop "
                 + "is not itself evidence" };
  }
}

/* ======================================================================= *
 * PURE HELPERS.
 * ======================================================================= */

function chainOfReading(reading) {
  const chain = reading && typeof reading === "object" ? reading.text_source ?? null : null;
  return Array.isArray(chain) ? chain : null;
}

/** D-440 — IS THIS CAPTURE AN OFFICE CONTAINER, whose own bytes can hold an embedded media part? THREE-VALUED: `true`
 *  (the format registry's entry for the capture's format walks parts), `false` (a registered format with no parts
 *  walk), `null` (the record does not hold which format, STATED in `kind_why`). A property of the registry, never a
 *  list of slugs. The format comes from the capture's provenance profile, else the reading's own `text_container`. */
function containerKindOf(reading, captureFormat, held) {
  const fromReading = reading && typeof reading === "object" && typeof reading.text_container === "string"
    && reading.text_container.trim() ? reading.text_container.trim() : null;
  const format = captureFormat || fromReading;
  const source = captureFormat ? "the capture's provenance profile" : "the capture's reading";
  if (format && format !== "undetermined") {
    const entry = getFormat(format);
    if (entry) {
      const office = typeof entry.parts === "function";
      return { format, office,
               kind_why: `${source} records this capture's format as ${format}, which `
                 + (office ? "is an office container: its own bytes hold its embedded media parts"
                           : "is not an office container: its own bytes hold no embedded media part") };
    }
    return { format, office: null,
             kind_why: `${source} records this capture's format as '${format.slice(0, 40)}', which this build's format `
               + `registry does not know, so whether it is a container is UNDETERMINED` };
  }
  const ext = reading && typeof reading === "object" && reading.container_extent
    && typeof reading.container_extent === "object" ? reading.container_extent : null;
  if (ext && Array.isArray(ext.levels) && ext.levels.length)
    return { format: null, office: true,
             kind_why: "the capture's reading carries a container extent an office entry itemised, so it is an office "
               + "container, though no format key was recorded" };
  return { format: null, office: null,
           kind_why: !held
             ? "this record holds no reading for this capture, so which format it is is UNDETERMINED"
             : format === "undetermined"
               ? "the format registry could not determine this capture's format at acquire, so whether it is a container "
                 + "is UNDETERMINED"
               : "this record does not hold this capture's format (it was promoted before the format was projected, and "
                 + "its reading names no container), so whether it is a container is UNDETERMINED" };
}

/** THE LEGACY CONNECTION AXIS on a standing, for the earned registry that still composes it (`standings`'
 *  `connectionByBundle`), until `connections` takes a portion's connection grade (R20, the Suggestions). A `document`
 *  row earns exactly what the document earns; a portion is undetermined and stated, never borrowed from the document
 *  (Bob, 2026-09-14, 5.1). */
function legacyConnectionAxis(r, extent, connectionByBundle) {
  const doc = connectionByBundle && connectionByBundle[r.bundle_id] ? connectionByBundle[r.bundle_id] : null;
  if (r.extent_kind === "document")
    return doc ? { determined: true, grain: "document", ...doc }
      : { determined: false, grain: "document", grade: null, undetermined_because: "NO_RESOLUTION",
          empty_level: "connection — no captured resolution of this document to the subject",
          why: `no capture of this document resolves to this inquiry's subject at A, B or C, so this row earns nothing on `
             + `the connection axis. The honest leg is testimony (grade D, with an author and a date) or no grade at `
             + `all. Absence here is a fact about what the recogniser matched, never evidence about what the document says` };
  return { determined: false, grain: "portion", grade: null, undetermined_because: "READING_POSITION_ABSENT",
           empty_level: "position within the reading — `reading_refs` records THAT a reference was read in this "
                      + "document and not WHERE it was read (I2, FW-17)",
           why: `this leg cites ${describeExtent(extent)} and refers only to that portion (Bob, 2026-09-14). Whether any `
              + `resolution of this document to the subject was established inside it is undetermined and stated, never `
              + `borrowed from the whole document. The document-grain answer is under earned.connection for `
              + `${r.bundle_id}, and it is the DOCUMENT's, not this portion's` };
}

const instances = new WeakMap();

/** The one content instance for `host` (the Durable Object's `ctx`, with its `storage`); `deps` are read on the first
 *  call only. At creation it declares its tables to purge (R39; record-core R21). */
export function contentOf(host, deps) {
  let c = instances.get(host);
  if (!c) {
    const d = deps || {};
    const record = d.record || recordOf(host);
    const membership = d.membership || membershipOf(host, { record });
    const provenance = d.provenance || provenanceOf(host);
    c = new Content({ ...d, storage: d.storage || host.storage, record, membership, provenance });
    instances.set(host, c);
    record.declarePurge("content", CONTENT_TABLES);
    if (c.extraction && typeof c.extraction.onReading === "function")
      c.extraction.onReading("content", (e) => c.markStale(e.captureSha, e.chainAfter));
  }
  return c;
}
