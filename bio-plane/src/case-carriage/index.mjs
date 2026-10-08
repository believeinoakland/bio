/* case-carriage — what a case edition carries at its commit (requirements: `build/requirements/case-carriage.md`;
 * DEC-112 (3), (4); BIO_Publication_v0_1.md §5C). `publication`'s commit calls it inside its own transaction: it holds,
 * by SHA-256, the materials the signed document includes, so `public-read` carries them in the case file from the
 * published projection alone (R1–R3), and it re-reads what the document rests on that may have changed since it was
 * prepared: what may be published of each source it states (R5; N364) and another group's work it accepted (R4; N522).
 * A document cut out of a captured archive is carried with its archive, its `container` record and the archive's tokens,
 * so an outsider re-derives it with stock tools (R8; N688, K1844).
 * (T37; N757, DEC-180) It holds the marks members make on a photo of who and what to obscure (R9, R10, R12) and derives
 * from the marks that stand, through `image-cover`, a copy carrying nothing of the original but its pixels, each marked
 * area covered (R11). (T38; N779, K2248) A published case carries every photo only as this copy (R1): never the original,
 * whole or inside an archive (R8). (T38; N788, DEC-183 (2)) A mark is withdrawn by a reasoned act recorded beside it,
 * never erased (R14). Inside the group every photo stays as taken. `marksLapsed` (R13) is publication's commit check.
 * The refusals those re-reads lead to, and every write to the published projection's other tables, are `publication`'s:
 * this module owns the two tables of held materials (`./schema.mjs`, exempt from purge, R6), the marks and the copies'
 * withdrawals and derivations (R12), and names no place (R7). Its own refusals (R9, R10, R14) are rows of C-141
 * (`./checks.mjs`).
 *
 * Split from `publication` by copy (K617, K624 (1), N532, K1332; seam map `build/extraction/publication-split-2.md`):
 * R57's holding (`#holdMaterials`, `#registered`, `#fileRow`, `#tokenFiles`, `heldMaterialsOf`,
 * `publishedMaterialText`), R59's re-read and R51's, with their comments, and the two tables. `publication`'s job
 * deletes its copy and creates this module. One change of shape at the seam: `holdMaterials` answers the `files` the
 * caller registers by hash, since every write to `published_shas` is `publication`'s.
 *
 * REACHED as `caseCarriageOf(host, deps)` (K61): one instance per host (the Durable Object's `ctx`), created on the first
 * call with `deps`, returned to every later caller. At creation it creates its two tables and declares them to
 * record-core's purge as exempt (R6).
 * `deps` (each reached through its factory on the same host unless given; a test passes its own):
 *   record, membership, promotion   layer 2: `readFile` (R13), `declarePurge` (R21); membership and promotion only to
 *                                   construct the three below.
 *   extraction     `unitsOf` (its R36), for R1's extracted text.
 *   sources        `publishableAt` (its R8), for R5.
 *   acceptedWork   `acceptedFinding`, `openFlagsOn` (its R2), for R4.
 *   now            the clock for the instants it writes when the caller gives none, an ISO string (default: the wall
 *                  clock).
 *   bucket, store  (T37; R11) the evidence bucket (the Worker's `CAPTURES` R2 binding) and the store's namespace (a
 *                  string or a function answering one; default "bio"): the obscured copy is held at
 *                  `<store>/obscured/<sha>` (`obscuredKey`), beside file-safety's `<store>/derived/`, outside
 *                  `captures/`. The original is read through record-core's `evidenceStore` (its R38). Unbound, no copy
 *                  is made (R11 then answers `copy: null`, so a case cannot carry the photo).
 *   cover          `image-cover`'s `coverAreas` (a test may pass its own).
 *
 * READ CONTRACTS it joins in its own SQL: provenance's `register` (its R48: `capture_sha`, `bundle_id`, `path`, `bytes`),
 * record-core's `bundles` (its R37), sources' `source_knocks` (its R15) and (T38; R8, K2291 (2); asked of BOB in J1)
 * acquisition's `archive_entries` (R38's record of an archive's listing: `archive_sha`, `idx`, `name`, `kind`, `state`,
 * `sha256`), to tell whether an archive holds an image. */

import { membershipOf } from "../membership/index.mjs";
import { promotionOf } from "../promotion/index.mjs";
import { recordOf, stampInstant } from "../record-core/index.mjs";
import { createSha256, canonicalJson, isMachineIdentity } from "../record-grammar/index.mjs";
import { coverAreas, COVER_MAX_BYTES } from "../image-cover/index.mjs";
import { sourcesOf } from "../sources/index.mjs";
import { extractionOf } from "../extraction/index.mjs";
import { acceptedWorkOf } from "../accepted-work/index.mjs";
import { materialsOf, extractedTextOf, acceptedWorkOf as acceptedWorkBlocksOf, caseDocumentBlocks,
         sourceRowsStanding } from "../case-grammar/index.mjs";
import { CASE_CARRIAGE_EXEMPT, CASE_CARRIAGE_MARK_TABLES, migrateCaseCarriage } from "./schema.mjs";
import { CASE_CARRIAGE_CHECKS, OBSCURED_LABEL } from "./checks.mjs";

export { CASE_CARRIAGE_SCHEMA, CASE_CARRIAGE_EXEMPT, CASE_CARRIAGE_MARK_TABLES } from "./schema.mjs";
export { CASE_CARRIAGE_CHECKS, OBSCURED_LABEL } from "./checks.mjs";

/** R1: the most items one `unheld` answer names. */
export const UNHELD_MAX = 1000;
/** R4: the most open flags one `undisclosed` answer names. */
export const UNDISCLOSED_MAX = 200;
/** R9: the most areas one mark holds. */
export const MARK_AREAS_MAX = 100;
/** R9: the kinds of area a member marks (DEC-180 (3), (5)). */
export const MARK_KINDS = Object.freeze(["person", "plate", "staff"]);
/** R9: the longest reason a `staff` area gives. */
export const STAFF_REASON_MAX = 2000;
/** R14: the longest reason a withdrawal gives. */
export const WITHDRAW_REASON_MAX = 2000;
/** R13: the most rows one `marksLapsed` answer names. */
export const MARKS_LAPSED_MAX = 200;
/** R11: where a photo's obscured copy is held, under its own digest, outside `captures/`. */
export const obscuredKey = (store, sha) => `${store}/obscured/${sha}`;

/* R9, R10: a photo is told by the type recorded with its capture, else its register path's extension (synchronous). */
const IMAGE_EXT = /\.(jpe?g|jfif|png|gif|webp|heic|heif|avif|tiff?|bmp)$/i;
/* R8 (K2291 (2)): an entry of an archive's listing that is itself an archive never opened. */
const ARCHIVE_EXT = /\.zip$/i;
/* R1, R8 (T38; N779): why a photo, or an archive holding an image, is not carried. */
export const PHOTO_ONLY_AS_COPY = "a photo travels only as its copy";
export const ARCHIVE_HOLDS_IMAGE = "the archive holds an image, and an image leaves only as its copy";
/* R11: image-cover's refusals that leave a mark recorded with no copy (every one but the areas' own). */
const COVER_REFUSED = new Set(["NOT_A_COVERABLE_FORMAT", "UNSUPPORTED_JPEG_PROCESS", "PNG_INTERLACED", "PHOTO_TOO_LARGE",
                               "TRUNCATED_IMAGE_DATA", "IMAGE_DATA_CORRUPT"]);
/* R9: image-cover names an area by its place among every area covered; the answer names it in this mark, when it is. */
const areaOf = (detail, before) => {
  const m = /\barea (\d+)\b/.exec(String(detail ?? ""));
  return m && Number(m[1]) >= before ? { area: Number(m[1]) - before } : {};
};
/* DEC-49: a refusal from this module's own row. */
const refusal = (code, detail, extra = {}) => ({ ...extra, ok: false, reason: code, code,
  check: CASE_CARRIAGE_CHECKS[code].check, translation: CASE_CARRIAGE_CHECKS[code].translation, detail });

const safeJson = (s) => { try { return s == null ? null : JSON.parse(s); } catch { return null; } };
const HEX64 = /^[0-9a-f]{64}$/;
const str = (v) => (typeof v === "string" && v.trim() ? v.trim() : "");
const te = new TextEncoder();
const digestOf = (v) => String(v ?? "").trim().replace(/^sha256:/i, "").toLowerCase();
const shaOf = (text) => createSha256().update(te.encode(String(text))).hex();
/* R1, R13 (case-grammar R12): the `obscured` a row states, `{copy}` with the copy's digest read lower-case, or null. */
const obscuredOf = (m) => {
  const ob = m && m.obscured && typeof m.obscured === "object" ? m.obscured : null;
  return ob ? { copy: str(ob.copy).toLowerCase() } : null;
};

export class CaseCarriage {
  #deps;

  #chains = new Map();   // R11: one derivation at a time per capture

  constructor({ storage, record, membership = null, promotion = null, host = null, extraction = null, sources = null,
                acceptedWork = null, now = null, bucket = null, store = null, cover = null } = {}) {
    this.storage = storage;
    this.sql = storage.sql;
    this.bucket = bucket && typeof bucket.put === "function" ? bucket : null;
    this.store = store;
    this.cover = typeof cover === "function" ? cover : coverAreas;
    this.record = record;
    this.membership = membership;
    this.promotion = promotion;
    this.#deps = { host, extraction, sources, acceptedWork };
    this.now = typeof now === "function" ? now : () => new Date().toISOString();
    this.purgeDeclaration = null;   // R6: record-core's answer to this module's purge declaration, set at creation
    this.marksDeclaration = null;   // R12: record-core's answer to the marks' declaration, set at creation
  }

  /* The modules reached lazily: each is created on the same host on first use, unless a test passed its own. */
  get acceptedWork() { return this.#deps.acceptedWork ||= acceptedWorkOf(this.#deps.host, { record: this.record, promotion: this.promotion }); }
  get extraction() { return this.#deps.extraction ||= extractionOf(this.#deps.host, { record: this.record, membership: this.membership }); }
  get sources() { return this.#deps.sources ||= sourcesOf(this.#deps.host, { record: this.record, membership: this.membership }); }

  migrate() { migrateCaseCarriage(this.sql, this.storage); }

  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  #one(q, ...a) { for (const r of this.sql.exec(q, ...a)) return r; return null; }
  #when(at) {
    if (typeof at === "string" && at.trim()) return at.trim();
    const w = this.now();
    return typeof w === "string" && w ? w : new Date().toISOString();
  }

  /* A live file's inline text as `{content}` (record-core R13), or null when it is not held inline. */
  #fileText(bundleId, path) {
    const f = this.#fileRow(bundleId, path);
    return f && typeof f.text === "string" ? { content: f.text } : null;
  }

  /** R1 (DEC-112 (3)(4); K1315, K1316): hold, by SHA-256, each `included: true` material of the signed document's
   *  `materials:` block, inside the caller's transaction (it opens none of its own): an observation's whole text and a
   *  document's captured bytes where the register holds them as inline text (verified against the stated digest), a
   *  document's extracted text (`extractedTextOf` over extraction's units, only when the index is whole and no unit was
   *  cut, verified against `text_sha`), and the timestamp tokens its home's provenance names, as text where inline.
   *  Bytes held only in the evidence store are answered `held: "evidence"`, for ratification R39 to copy. (T37; N757) A
   *  row listed `included: false` whose `obscured` names a copy carries that copy alone, `held: "derived"`, kind
   *  `obscured`, nothing of the original. (T38; N779) A row listed `included: true` whose capture is a photo, or is an
   *  archive holding an image, is not held but answered unheld, so no original photo's bytes leave. Each SHA-256 is held
   *  once per call and named in `files` once for each ref that carries it (R8; N768). Answers `{materials, unheld, files}`, `files` for the caller to register by hash; a material
   *  it cannot hold is answered, never refused. Never throws. */
  holdMaterials(fm, { caseId = null, edition = null, at = null } = {}) {
    const materials = [], unheld = [], files = [], texts = [];
    let when;
    try { when = this.#when(at); } catch { when = new Date().toISOString(); }
    let rows = null;
    try { const m = materialsOf(fm); rows = m && Array.isArray(m.materials) ? m.materials : null; } catch { rows = null; }
    rows = Array.isArray(rows) ? rows.filter((m) => m && typeof m === "object") : [];
    const seen = new Set(), named = new Set();
    const hold = (ref, kind, sha, text, bytes, derived = false) => {
      const inline = typeof text === "string";
      const size = inline ? te.encode(text).length : Number.isInteger(bytes) ? bytes : null;
      if (!named.has(`${sha}\u0000${ref}`)) {
        named.add(`${sha}\u0000${ref}`);
        files.push({ sha256: sha, ref, path: `materials/${sha}`, kind, bytes: size });
      }
      if (seen.has(sha)) return;
      seen.add(sha);
      if (inline) texts.push([sha, kind, text, size]);
      materials.push({ sha, held: derived ? "derived" : inline ? "inline" : "evidence" });
    };
    const images = new Map();   // R8: archive → whether it holds an image, judged once per call
    for (const m of rows) {
      const ref = str(m.ref), sha = str(m.sha).toLowerCase(), kind = m.kind;
      if (!(m.included === true || m.included === "true")) {
        const ob = obscuredOf(m);
        if (ob) this.#holdCopy(ref, sha, ob, hold, unheld);
        continue;
      }
      const miss = (what, why) => unheld.push({ ref: ref || null, kind: what,
        sha256: what === "extracted_text" ? str(m.text_sha).toLowerCase() || null : sha || null, why });
      if (!HEX64.test(sha)) { miss(kind === "observation" ? "observation" : "document", "the row names no SHA-256"); continue; }
      /* (T38; N779, K2291 (2)) a photo, or an archive holding an image, is never carried whole */
      if (kind !== "observation" && this.#isPhoto(sha)) { miss("document", PHOTO_ONLY_AS_COPY); continue; }
      if (kind !== "observation" && this.#isArchive(sha) && this.#holdsImage(sha, images)) { miss("document", ARCHIVE_HOLDS_IMAGE); continue; }
      const home = this.#registered(sha);
      const inline = home ? this.#fileText(home.bundle_id, home.path) : null;
      const inlineOk = !!inline && shaOf(inline.content) === sha;
      if (kind === "observation") {
        if (inlineOk) hold(ref, "observation", sha, inline.content);
        else miss("observation", "your group's Civicsmith holds no text of that observation at its digest");
        continue;
      }
      if (inlineOk) hold(ref, "document", sha, inline.content);
      else if (home && !inline) hold(ref, "document", sha, null, Number(home.bytes));
      else { miss("document", "your group's Civicsmith holds no bytes of that document at its digest"); continue; }
      /* its extracted text */
      const textSha = str(m.text_sha).toLowerCase();
      let text = null;
      try {
        const u = this.extraction.unitsOf(sha);
        if (u && u.state === "whole" && Array.isArray(u.units) && u.units.length && !u.units.some((x) => !x || x.truncated))
          text = extractedTextOf(u.units);
      } catch { text = null; }
      if (typeof text === "string" && HEX64.test(textSha) && shaOf(text) === textSha) hold(ref, "extracted_text", textSha, text);
      else miss("extracted_text", "your group's Civicsmith holds no whole extracted text of that document at its stated digest");
      /* its timestamp tokens, as the capture's home provenance names them (K1315, K1322) */
      this.#holdTokens(ref, home, sha, hold, unheld);
      /* R8 (N688; K1844): a member of a captured archive, carried with its archive, outward to the outermost */
      this.#holdArchives(ref, home, sha, hold, unheld, images);
    }
    /* The writes, after every read: each text once, and the edition's list once (a second call writes nothing new). */
    try {
      for (const [sha, kind, text, size] of texts)
        this.sql.exec(`INSERT INTO published_material_texts (sha256,kind,text,bytes,published) VALUES (?,?,?,?,?)
                       ON CONFLICT(sha256) DO NOTHING`, sha, kind, text, size, when);
      const id = str(caseId), ed = Number(edition);
      if (id && Number.isInteger(ed) && ed >= 1 && materials.length
          && !this.#one(`SELECT 1 AS x FROM published_case_materials WHERE case_id=? AND edition=? LIMIT 1`, id, ed))
        materials.forEach((m, i) => this.sql.exec(
          `INSERT INTO published_case_materials (case_id,edition,ord,sha256,held) VALUES (?,?,?,?,?)
           ON CONFLICT(case_id,edition,ord) DO NOTHING`, id, ed, i, m.sha, m.held));
    } catch {
      /* Nothing written can be answered as held: every item is named unheld instead, never refused. */
      return { materials: [], files: [], unheld: [...files.map((f) => ({ ref: f.ref || null, kind: f.kind, sha256: f.sha256,
        why: "your group's Civicsmith could not record it" })), ...unheld].slice(0, UNHELD_MAX) };
    }
    return { materials, unheld: unheld.slice(0, UNHELD_MAX), files };
  }

  /* R1: each timestamp token the home's provenance names for capture `sha`: inline as text, blob-backed as evidence
     under its blob digest, else named unheld under `sha`. */
  #holdTokens(ref, home, sha, hold, unheld) {
    for (const t of this.#tokenFiles(home, sha)) {
      const f = this.#fileRow(home.bundle_id, t);
      if (f && typeof f.text === "string") hold(ref, "attestation", shaOf(f.text), f.text);
      else if (f && typeof f.blobSha === "string" && HEX64.test(f.blobSha)) hold(ref, "attestation", f.blobSha, null, f.bytes);
      else unheld.push({ ref: ref || null, kind: "attestation", sha256: sha, why: `the timestamp token ${t} is not held` });
    }
  }

  /** R8 (N688; K1844, K1852 (1); Intake §3b): a document is a member when the entry its home's `data/provenance.json`
   *  states for it has `capture.method` `unpacked` and a `container` block. Its `container` record (canonical JSON,
   *  kind `container`), its archive (as a document's captured bytes, kind `archive`) and the archive's tokens are held,
   *  and the same for the archive when it is itself a member, up to the outermost. A block that does not name this
   *  document, an archive not held, or a token not held is named unheld and never refused; the first two stop the walk,
   *  since nothing further out can be checked against them. An archive already walked in this call ends it (a cycle).
   *  (T37; N757; T38: N779, K2291 (2)) An archive that holds any image would carry the original: it is named unheld for
   *  this material and ends the walk (`images` keeps each archive's verdict for the call). */
  #holdArchives(ref, home, sha, hold, unheld, images = new Map()) {
    const walked = new Set([sha]);
    let cur = sha, at = home;
    for (;;) {
      const entry = this.#entriesFor(at, cur).find((d) => d.capture && d.capture.method === "unpacked"
        && d.container && typeof d.container === "object" && !Array.isArray(d.container));
      if (!entry) return;
      const c = entry.container;
      const archive = str(c.archive_sha256).toLowerCase();
      if (digestOf(c.member_sha256) !== cur || !HEX64.test(archive)) {
        unheld.push({ ref: ref || null, kind: "container", sha256: cur, why: "the container record does not name this document" });
        return;
      }
      const record = canonicalJson(c);
      hold(ref, "container", shaOf(record), record);
      if (walked.has(archive)) return;
      walked.add(archive);
      const aHome = this.#registered(archive);
      const inline = aHome ? this.#fileText(aHome.bundle_id, aHome.path) : null;
      const inlineOk = !!inline && shaOf(inline.content) === archive;
      if (!inlineOk && !(aHome && !inline)) {
        unheld.push({ ref: ref || null, kind: "archive", sha256: archive, why: "the archive is not held" });
        return;
      }
      if (this.#holdsImage(archive, images)) {
        unheld.push({ ref: ref || null, kind: "archive", sha256: archive, why: ARCHIVE_HOLDS_IMAGE });
        return;
      }
      if (inlineOk) hold(ref, "archive", archive, inline.content);
      else hold(ref, "archive", archive, null, Number(aHome.bytes));
      this.#holdTokens(ref, aHome, archive, hold, unheld);
      cur = archive;
      at = aHome;
    }
  }

  /* R1: the register row homing a capture on a bundle that exists, or null (provenance's read contract, R48). */
  #registered(sha) {
    try {
      return this.#one(`SELECT r.bundle_id, r.path, r.bytes FROM register r JOIN bundles b ON b.bundle_id=r.bundle_id
                         WHERE r.capture_sha=? LIMIT 1`, sha);
    } catch { return null; }
  }

  /* R1: a live file's record-core read (R13): inline text, or its blob reference. */
  #fileRow(bundleId, path) { try { return this.record.readFile(bundleId, path); } catch { return null; } }

  /* R1 (K1315, K1322): the timestamp token files the home's `data/provenance.json` names for one capture. */
  #tokenFiles(home, sha) {
    const out = new Set();
    for (const d of this.#entriesFor(home, sha)) {
      if (d.timestamp && typeof d.timestamp.token_file === "string" && d.timestamp.token_file) out.add(d.timestamp.token_file);
      for (const t of Array.isArray(d.attestations) ? d.attestations : [])
        if (t && t.kind === "rfc3161" && typeof t.file === "string" && t.file) out.add(t.file);
    }
    return [...out];
  }

  /* R1, R8: the entries the home's `data/provenance.json` states for capture `sha` (its `capture.sha256`). */
  #entriesFor(home, sha) {
    const f = home ? this.#fileText(home.bundle_id, "data/provenance.json") : null;
    const reg = f ? safeJson(f.content) : null;
    return (reg && Array.isArray(reg.documents) ? reg.documents : [])
      .filter((d) => d && typeof d === "object" && d.capture && digestOf(d.capture.sha256) === sha);
  }

  /** R2 (K1317): what a committed case edition held, `[{sha, held}]` in the order held, `held` `inline` or `evidence`,
   *  as R1 wrote it, so a retried ratification copies what is left (ratification R39); `[]` for an edition that held
   *  nothing or was never committed. Writes nothing; never throws. */
  heldMaterialsOf(caseId, edition) {
    try {
      return this.#rows(`SELECT sha256, held FROM published_case_materials WHERE case_id=? AND edition=? ORDER BY ord`,
                        str(caseId), Number(edition)).map((r) => ({ sha: r.sha256, held: r.held }));
    } catch { return []; }
  }

  /** R3 (K1316): a held material's text by its SHA-256 (read case-insensitively), for `public-read`'s case file:
   *  `{found, sha256, kind, text}`, or `{found: false}`. Answered only for a text a commit held, so working material is
   *  unreachable here. Writes nothing. */
  publishedMaterialText(sha) {
    try {
      const r = this.#one(`SELECT sha256, kind, text FROM published_material_texts WHERE sha256=?`,
                          String(sha ?? "").trim().toLowerCase());
      return r ? { found: true, sha256: r.sha256, kind: r.kind, text: r.text } : { found: false };
    } catch { return { found: false }; }
  }

  /** R4 (DEC-96 items 1, 4; N522; K1316 (3), (4)): the rows of a document's `accepted_work:` block whose acceptance is
   *  no longer in force, and the open flags on their editions its `accepted_work_flags:` block does not disclose, or
   *  null when every row stands. Read through `accepted-work` (its R2) once per distinct `(ref, edition)`, as the signer
   *  (`member:<signer>`). A read that answers absent, unreadable, null, or (for flags) not complete counts as not in
   *  force, and so does one that throws. Writes nothing. */
  acceptedWorkLapsed(fm, signer) {
    let blocks = null;
    try { blocks = acceptedWorkBlocksOf(fm); } catch { blocks = null; }
    const rows = blocks && Array.isArray(blocks.rows) ? blocks.rows : [];
    if (!rows.length) return null;
    const disclosed = new Set((Array.isArray(blocks.flags) ? blocks.flags : [])
      .filter((f) => f && typeof f === "object").map((f) => `${f.ref}\u0000${Number(f.edition)}\u0000${f.flag}`));
    const viewer = str(signer) ? `member:${str(signer).replace(/^member:/, "")}` : null;
    const ask = (fn, args) => { try { return this.acceptedWork[fn](args); } catch { return null; } };
    const withdrawn = [], undisclosed = [];
    const asked = new Set();
    for (const r of rows) {
      if (!r || typeof r !== "object") continue;
      const ref = str(r.ref), edition = Number(r.edition);
      const key = `${ref}\u0000${edition}`;
      if (asked.has(key)) continue;
      asked.add(key);
      const named = { ref: ref || null, edition: Number.isInteger(edition) ? edition : null };
      const f = ask("acceptedFinding", { ref, edition, viewer });
      const inForce = !!f && typeof f === "object" && !f.absent && !f.unreadable && !!f.acceptance
        && typeof f.acceptance === "object" && (f.edition === undefined || Number(f.edition) === edition);
      if (!inForce) { withdrawn.push(named); continue; }
      const o = ask("openFlagsOn", { ref, edition, viewer });
      if (!o || typeof o !== "object" || o.absent || o.unreadable || o.complete !== true || !Array.isArray(o.flags)) {
        withdrawn.push(named);
        continue;
      }
      for (const fl of o.flags)
        if (fl && !disclosed.has(`${ref}\u0000${edition}\u0000${fl.flag}`))
          undisclosed.push({ ...named, flag: fl.flag ?? null, issue: typeof fl.issue === "string" ? fl.issue : null });
    }
    return withdrawn.length || undisclosed.length ? { withdrawn, undisclosed: undisclosed.slice(0, UNDISCLOSED_MAX) } : null;
  }

  /** R5 (DEC-78 item 5(d); N364): the `sources:` rows of one case document that no longer hold at `at`
   *  (`sourceRowsStanding`). The sources behind a capture are the pulled knocks `sources` minted for it (its
   *  `source_knocks` read contract, R15), first received first, each asked what the public may be told at `at`; a
   *  capture with no knock, or a source that cannot be read, answers nothing, so its rows lapse (fail closed). A document
   *  stating no `sources:` row has nothing to re-read. Writes nothing. */
  sourcesLapsed(text, at) {
    let rows = null;
    try { rows = caseDocumentBlocks(text).sources; } catch { rows = null; }
    if (!Array.isArray(rows) || !rows.length) return [];
    return sourceRowsStanding(rows, (capture) => {
      let knocks = [];
      try {
        knocks = this.#rows(`SELECT source_id, received FROM source_knocks WHERE capture_sha=?
                             ORDER BY received, knock_id`, capture);
      } catch { knocks = []; }
      if (!knocks.length) return null;
      const entries = [];
      for (const s of [...new Set(knocks.map((k) => k.source_id))]) {
        let r = null;
        try { r = this.sources.publishableAt({ source: s, audience: "public", at }); } catch { r = null; }
        if (!r || r.ok !== true || !Array.isArray(r.entries)) return null;
        entries.push(...r.entries);
      }
      return { entries, received: knocks[0].received };
    });
  }

  /* R1 (T37; N757; DEC-180 (4)): a photo carried as its copy holds the copy alone, `derived`, kind `obscured`, when
     R11 holds it under that digest for that original; else it is named unheld. */
  #holdCopy(ref, sha, ob, hold, unheld) {
    let r = null;
    try {
      if (HEX64.test(ob.copy) && HEX64.test(sha))
        r = this.#one(`SELECT bytes FROM photo_copies WHERE capture=? AND sha256=? LIMIT 1`, sha, ob.copy);
    } catch { r = null; }
    if (r) hold(ref, "obscured", ob.copy, null, Number.isInteger(r.bytes) ? r.bytes : null, true);
    else unheld.push({ ref: ref || null, kind: "obscured", sha256: ob.copy || null, why: "the obscured copy is not held" });
  }

  /* R1, R8, R13 (T38; N779): whether a capture is a photo (R9's term), judged over every home the record holds it on,
     fail closed: an image when any home's provenance records an image type for it, else when none records a type and
     any home's register path has an image's extension. */
  #isPhoto(sha) {
    const homes = this.#homes(sha);
    const types = homes.flatMap((h) => this.#entriesFor(h, sha)).map((d) => str(d.capture.content_type).toLowerCase()).filter(Boolean);
    if (types.some((t) => t.startsWith("image/"))) return true;
    return !types.length && homes.some((h) => IMAGE_EXT.test(String(h.path || "")));
  }

  /* R1, R8: every register row homing a capture on a bundle that exists (provenance R48, record-core R37). */
  #homes(sha) {
    try {
      return this.#rows(`SELECT r.bundle_id, r.path, r.bytes FROM register r JOIN bundles b ON b.bundle_id=r.bundle_id
                         WHERE r.capture_sha=? ORDER BY r.bundle_id`, sha);
    } catch { return []; }
  }

  /* R1, R8: whether acquisition recorded a listing for this capture (it was opened as an archive). */
  #isArchive(sha) {
    try { return !!this.#one(`SELECT 1 AS x FROM archive_entries WHERE archive_sha=? AND idx=-1 LIMIT 1`, sha); }
    catch { return false; }
  }

  /** R8 (T38; N779, K2291 (2); BOB's reading asked in J1): whether an archive holds an image, judged from acquisition's
   *  record of its listing (R38), fail closed. It does when its listing is not recorded or cannot be read; when an
   *  entry that is a file has no name, a name with an image's extension, or a filed capture that is a photo; or when
   *  an entry is itself an archive that holds one (recursively), or is named as an archive and was never opened.
   *  Folders and links hold no bytes of their own. `memo` keeps each archive's verdict for one call. */
  #holdsImage(archive, memo = new Map(), path = new Set()) {
    if (memo.has(archive)) return memo.get(archive);
    if (path.has(archive)) return false;   // a cycle in the records: judged where it began
    path.add(archive);
    let verdict = true;
    try {
      const rows = this.#rows(`SELECT idx, name, kind, state, sha256 FROM archive_entries WHERE archive_sha=? ORDER BY idx`, archive);
      if (rows.some((r) => r.idx === -1)) {
        verdict = rows.filter((r) => r.idx >= 0 && r.kind !== "dir" && r.kind !== "symlink").some((r) => {
          const name = typeof r.name === "string" ? r.name : "";
          if (!name || IMAGE_EXT.test(name)) return true;
          const s = HEX64.test(str(r.sha256).toLowerCase()) ? str(r.sha256).toLowerCase() : null;
          if (s && this.#isPhoto(s)) return true;
          if (s && this.#isArchive(s)) return this.#holdsImage(s, memo, path);
          return ARCHIVE_EXT.test(name);
        });
      }
    } catch { verdict = true; }
    path.delete(archive);
    memo.set(archive, verdict);
    return verdict;
  }

  /* ---- the marks on a photo and its copy (R9–R13; T37, N757, DEC-180 (2)–(5), K2108, K2206) ---- */

  /* R9, R10: the photo `sha` as `viewer` may see it: `{ok: true, sha, photo}` or NO_SUCH_PHOTO. Held means a register
     row homes it on a bundle that exists; seen means membership's sight admits `viewer` to one such bundle. A photo is
     told by the `capture.content_type` its home's provenance records, else its register path's extension. */
  #photo(captureSha, viewer) {
    const sha = digestOf(captureSha);
    const none = () => refusal("NO_SUCH_PHOTO", "no photo you can see is held under that digest", { capture: HEX64.test(sha) ? sha : null });
    if (!HEX64.test(sha) || typeof viewer !== "string" || !viewer.trim()) return none();
    let homes = [];
    try {
      homes = this.#rows(`SELECT r.bundle_id, r.path FROM register r JOIN bundles b ON b.bundle_id=r.bundle_id
                          WHERE r.capture_sha=? ORDER BY r.bundle_id`, sha);
    } catch { homes = []; }
    let seen = null;
    for (const h of homes) {
      let ok = false;
      try { ok = !!this.membership && this.membership.inSight(h.bundle_id, viewer.trim()) === true; } catch { ok = false; }
      if (ok) { seen = h; break; }
    }
    if (!seen) return none();
    const types = this.#entriesFor(seen, sha).map((d) => str(d.capture.content_type).toLowerCase()).filter(Boolean);
    const photo = types.length ? types[0].startsWith("image/") : IMAGE_EXT.test(String(seen.path || ""));
    return { ok: true, sha, photo };
  }

  /* R10: the marks a photo holds, oldest first, each with its withdrawal or null, and its latest derivation. Throws when
     they cannot be read (each caller fails closed). */
  #marksOf(sha) {
    const out = this.#rows(`SELECT mark, areas, by, at FROM photo_marks WHERE capture=? ORDER BY mark`, sha);
    const gone = new Map(this.#rows(`SELECT mark, reason, by, at FROM photo_mark_withdrawals WHERE capture=?`, sha)
      .map((w) => [w.mark, { by: w.by, at: w.at, reason: w.reason }]));
    const marks = out.map((r) => ({ mark: r.mark, areas: JSON.parse(r.areas), by: r.by, at: r.at, withdrawn: gone.get(r.mark) ?? null }));
    const last = this.#one(`SELECT * FROM photo_copies WHERE capture=? ORDER BY seq DESC LIMIT 1`, sha);
    return { marks, last };
  }

  /* R10, R11 (T38; DEC-183 (2)): a photo's state over the marks that stand, and its copy and refusal from the latest
     derivation, which follows the latest act while any mark stands; with none standing, no copy. */
  static #view(marks, last) {
    const standing = marks.filter((m) => !m.withdrawn);
    const marked = standing.some((m) => Array.isArray(m.areas) && m.areas.length);
    const state = marked ? "marked" : standing.length ? "nothing_to_obscure" : "unchecked";
    const derived = standing.length && last ? last : null;
    const copy = derived && derived.sha256
      ? { sha256: derived.sha256, covered: derived.covered, width: derived.width, height: derived.height } : null;
    const refused = derived && derived.refused_code ? { code: derived.refused_code, detail: derived.refused_detail ?? null } : null;
    return { state, copy, refused };
  }

  /** R10 (`op=photomarks`): a photo's marks and its copy, to a member who may see it: `{ok: true, capture, photo: true,
   *  state, marks, copy, refused}`, each mark `{mark, areas, by, at, withdrawn}` (`withdrawn` `{by, at, reason}` or
   *  null; T38); `{ok: true, capture, photo: false}` for a capture that is not an image; NO_SUCH_PHOTO for one not held
   *  or not seen. Synchronous; reads only this module's and the record's tables; writes nothing; never throws. */
  photoMarks({ captureSha, viewer } = {}) {
    try {
      const p = this.#photo(captureSha, viewer);
      if (!p.ok) return p;
      if (!p.photo) return { ok: true, capture: p.sha, photo: false };
      const { marks, last } = this.#marksOf(p.sha);
      return { ok: true, capture: p.sha, photo: true, ...CaseCarriage.#view(marks, last), marks };
    } catch {
      return refusal("NO_SUCH_PHOTO", "no photo you can see is held under that digest", { capture: null });
    }
  }

  /** R9 (`op=obscuremark`): records one mark on a photo, then derives its copy from the marks that stand (R11), and
   *  answers as R10 does after the act, with `mark`. Refusals, in order, each writing nothing: MACHINE_CANNOT_MARK_PHOTO
   *  (N790), NO_SUCH_PHOTO, NOT_A_PHOTO, MARK_MALFORMED (naming the area), STAFF_MARK_NO_REASON, image-cover's
   *  AREA_OUTSIDE (its detail relayed). No act changes or erases a mark (R12). Answers a Promise (image-cover's cover is
   *  asynchronous); never rejects. */
  async obscureMark({ captureSha, areas, by } = {}) {
    try {
      if (typeof by !== "string" || !by.trim() || isMachineIdentity(by))
        return refusal("MACHINE_CANNOT_MARK_PHOTO", "a mark is made by a member; an assistant's proposal of areas is not a mark");
      const p = this.#photo(captureSha, by);
      if (!p.ok) return p;
      if (!p.photo) return refusal("NOT_A_PHOTO", "that capture is not an image", { capture: p.sha });
      const bad = (area, detail) => refusal("MARK_MALFORMED", detail, { capture: p.sha, area });
      if (!Array.isArray(areas)) return bad(null, "areas is not a list");
      if (areas.length > MARK_AREAS_MAX) return bad(null, `a mark holds at most ${MARK_AREAS_MAX} areas`);
      const clean = [];
      for (const [i, a] of areas.entries()) {
        if (!a || typeof a !== "object" || Array.isArray(a)) return bad(i, `area ${i} is not an object {rect, kind, reason?}`);
        const r = a.rect;
        if (!Array.isArray(r) || r.length !== 4 || !r.every((v) => Number.isSafeInteger(v)) || !(r[0] < r[2] && r[1] < r[3]))
          return bad(i, `area ${i}'s rect is not four integers [x0, y0, x1, y1] with x0 < x1 and y0 < y1`);
        if (!MARK_KINDS.includes(a.kind)) return bad(i, `area ${i}'s kind is not one of ${MARK_KINDS.join(", ")}`);
        clean.push({ rect: [...r], kind: a.kind, ...(a.reason !== undefined ? { reason: a.reason } : {}) });
      }
      for (const [i, a] of clean.entries())
        if (a.kind === "staff" && !(typeof a.reason === "string" && a.reason.trim() && a.reason.length <= STAFF_REASON_MAX))
          return refusal("STAFF_MARK_NO_REASON", `area ${i} obscures a staff member with no reason of 1 to ${STAFF_REASON_MAX} characters`,
                         { capture: p.sha, area: i });
      for (const a of clean) if (a.kind !== "staff") delete a.reason;
      return await this.#serially(p.sha, () => this.#mark(p.sha, clean, by.trim()));
    } catch {
      return refusal("NO_SUCH_PHOTO", "no photo you can see is held under that digest", { capture: null });
    }
  }

  /** R14 (`op=obscuremarkwithdraw`; T38, N788, DEC-183 (2)): withdraws one mark on a photo, by its maker or any member
   *  who may see the photo, records the withdrawal beside the mark (R12), re-derives the copy from the marks that stand
   *  (R11) and answers as R10 does after the act, with `mark` and `withdrawal`. Refusals, in order, each writing
   *  nothing: MACHINE_CANNOT_WITHDRAW_MARK, NO_SUCH_PHOTO, NO_SUCH_MARK, MARK_ALREADY_WITHDRAWN (naming when and by
   *  whom), WITHDRAW_NO_REASON. Answers a Promise; never rejects. */
  async obscureMarkWithdraw({ captureSha, mark, reason, by } = {}) {
    try {
      if (typeof by !== "string" || !by.trim() || isMachineIdentity(by))
        return refusal("MACHINE_CANNOT_WITHDRAW_MARK", "a mark is withdrawn by a member, never by an assistant or the daemon");
      const p = this.#photo(captureSha, by);
      if (!p.ok) return p;
      const id = typeof mark === "string" && /^\d+$/.test(mark.trim()) ? Number(mark.trim()) : mark;
      return await this.#serially(p.sha, () => this.#withdraw(p.sha, id, reason, by.trim()));
    } catch {
      return refusal("NO_SUCH_PHOTO", "no photo you can see is held under that digest", { capture: null });
    }
  }

  /* R14: the checks that read the marks, and the act, inside the capture's chain, so two withdrawals of one mark
     cannot both be recorded. */
  async #withdraw(sha, id, reason, by) {
    const own = Number.isSafeInteger(id) && id > 0
      ? this.#one(`SELECT mark FROM photo_marks WHERE capture=? AND mark=?`, sha, id) : null;
    if (!own) return refusal("NO_SUCH_MARK", "no mark of that number is on that photo", { capture: sha, mark: Number.isSafeInteger(id) ? id : null });
    const prior = this.#one(`SELECT withdrawal, by, at FROM photo_mark_withdrawals WHERE mark=?`, id);
    if (prior) return refusal("MARK_ALREADY_WITHDRAWN", `mark ${id} was withdrawn at ${prior.at} by ${prior.by}`,
                              { capture: sha, mark: id, withdrawn: { by: prior.by, at: prior.at } });
    if (!(typeof reason === "string" && reason.trim() && reason.length <= WITHDRAW_REASON_MAX))
      return refusal("WITHDRAW_NO_REASON", `a withdrawal gives a reason of 1 to ${WITHDRAW_REASON_MAX} characters`, { capture: sha, mark: id });
    const { marks } = this.#marksOf(sha);
    const standing = marks.filter((m) => !m.withdrawn && m.mark !== id);
    const derivation = standing.length ? await this.#derive(sha, standing.flatMap((m) => m.areas).map((a) => a.rect), Infinity) : null;
    const at = this.#instant();
    let withdrawal = null;
    this.record.transact(() => {
      this.sql.exec(`INSERT INTO photo_mark_withdrawals (mark, capture, reason, by, at) VALUES (?,?,?,?,?)`, id, sha, reason, by, at);
      withdrawal = this.#one(`SELECT last_insert_rowid() AS id`).id;
      if (derivation) this.#writeDerivation(sha, standing.at(-1).mark, withdrawal, derivation.row, at);
    });
    const after = this.#marksOf(sha);
    return { ok: true, mark: id, withdrawal, capture: sha, photo: true, ...CaseCarriage.#view(after.marks, after.last), marks: after.marks };
  }

  /* R11: one derivation at a time per capture, so each act's copy covers exactly the marks standing after it. */
  #serially(sha, fn) {
    const prev = this.#chains.get(sha) || Promise.resolve();
    const run = prev.then(fn, fn);
    const tail = run.then(() => {}, () => {});
    this.#chains.set(sha, tail);
    tail.then(() => { if (this.#chains.get(sha) === tail) this.#chains.delete(sha); });
    return run;
  }

  /* R9, R11: derive the copy over every area of the marks that stand with this mark's added (none: a copy with nothing
     covered), then record the mark and the derivation together. AREA_OUTSIDE records nothing; another refusal of
     image-cover's records the mark and names it; no bytes to read, or no bucket to hold the copy in, records the mark
     with no copy (fail closed). */
  async #mark(sha, areas, by) {
    const { marks } = this.#marksOf(sha);
    const before = marks.filter((m) => !m.withdrawn).flatMap((m) => (Array.isArray(m.areas) ? m.areas : [])).map((a) => a.rect);
    const d = await this.#derive(sha, [...before, ...areas.map((a) => a.rect)], before.length);
    if (d.refusal) return d.refusal;
    const at = this.#instant();
    let mark = null;
    this.record.transact(() => {
      this.sql.exec(`INSERT INTO photo_marks (capture, areas, by, at) VALUES (?,?,?,?)`, sha, JSON.stringify(areas), by, at);
      mark = this.#one(`SELECT last_insert_rowid() AS id`).id;
      this.#writeDerivation(sha, mark, null, d.row, at);
    });
    const after = this.#marksOf(sha);
    return { ok: true, mark, capture: sha, photo: true, ...CaseCarriage.#view(after.marks, after.last), marks: after.marks };
  }

  /* R11: the copy over `rects` (`[]` covers nothing): `{row}` to record, or `{refusal}` for image-cover's AREA_OUTSIDE,
     naming the area among the act's own (those after the first `before`). */
  async #derive(sha, rects, before) {
    const row = { sha256: null, bytes: null, covered: null, width: null, height: null, refused_code: null, refused_detail: null };
    const original = await this.#original(sha);
    if (original && original.tooLarge) {
      row.refused_code = "PHOTO_TOO_LARGE";
      row.refused_detail = `the photo is ${original.size} bytes, over the ${COVER_MAX_BYTES} a copy is made from`;
    } else if (original) {
      let c = null;
      try { c = await this.cover(original.bytes, { areas: rects }); } catch { c = null; }
      if (c && c.ok === false && c.code === "AREA_OUTSIDE" && rects.length > before)
        return { refusal: refusal("AREA_OUTSIDE", typeof c.detail === "string" ? c.detail : "an area lies wholly outside the picture",
                                  { capture: sha, ...areaOf(c.detail, before) }) };
      if (c && c.ok === false && COVER_REFUSED.has(c.code)) {
        row.refused_code = c.code;
        row.refused_detail = typeof c.detail === "string" ? c.detail : null;
      } else if (c && c.ok === true && c.bytes instanceof Uint8Array) {
        const copySha = createSha256().update(c.bytes).hex();
        if (await this.#holdCopyBytes(copySha, c.bytes, sha))
          Object.assign(row, { sha256: copySha, bytes: c.bytes.length, covered: c.covered, width: c.width, height: c.height });
      }
    }
    return { row };
  }

  /* R11: one derivation row, inside the act's transaction. */
  #writeDerivation(sha, through, withdrawal, d, at) {
    this.sql.exec(`INSERT INTO photo_copies (capture, through, withdrawal, sha256, bytes, covered, width, height, refused_code,
                   refused_detail, at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`, sha, through, withdrawal, d.sha256, d.bytes, d.covered,
                  d.width, d.height, d.refused_code, d.refused_detail, at);
  }

  /* R11: the original's bytes, from the evidence store by digest (record-core R38): `{bytes}`, `{tooLarge, size}` when
     the store states more than image-cover covers (nothing over the bound is fetched), or null when none can be read. */
  async #original(sha) {
    let ev = null;
    try { ev = this.record.evidenceStore(); } catch { ev = null; }
    if (!ev) return null;
    try {
      const h = await ev.head(sha);
      if (h && Number.isFinite(h.size) && h.size > COVER_MAX_BYTES) return { tooLarge: true, size: h.size };
      const o = await ev.get(sha);
      if (!o || typeof o.arrayBuffer !== "function") return null;
      const bytes = new Uint8Array(await o.arrayBuffer());
      if (bytes.length > COVER_MAX_BYTES) return { tooLarge: true, size: bytes.length };
      return createSha256().update(bytes).hex() === sha ? { bytes } : null;
    } catch { return null; }
  }

  /* R11: the copy, held under its own digest at `<store>/obscured/<sha>`, labelled derived and naming its original;
     never registered, never a capture. True when held. */
  async #holdCopyBytes(copySha, bytes, original) {
    if (!this.bucket) return false;
    let ns = "bio";
    try { const s = typeof this.store === "function" ? this.store() : this.store; if (str(s)) ns = str(s); } catch { ns = "bio"; }
    try {
      await this.bucket.put(obscuredKey(ns, copySha), bytes, { sha256: copySha,
        customMetadata: { derived: "obscured", original, label: OBSCURED_LABEL } });
      return true;
    } catch { return false; }
  }

  /* R9: record-core's instant, from the module's clock. */
  #instant() {
    let ms = NaN;
    try { ms = Date.parse(this.now()); } catch { ms = NaN; }
    return stampInstant("millisecond", Number.isFinite(ms) ? ms : Date.now());
  }

  /** R13 (T37; N757; K2206; T38: N779, DEC-183 (2)): the `materials:` rows whose photo's marks no longer match what the
   *  row states: a row stating `obscured` whose copy is not the photo's current copy (so a withdrawal since preparation
   *  is a lapse), and a photo row carried whole (`included: true`), always; each `{ref, sha, why}`, at most 200; `[]`
   *  when none. Marks that cannot be read answer the row lapsed (fail closed). Synchronous; writes nothing; never
   *  throws. */
  marksLapsed(fm) {
    let rows = null;
    try { const m = materialsOf(fm); rows = m && Array.isArray(m.materials) ? m.materials : null; } catch { rows = null; }
    const out = [];
    for (const m of Array.isArray(rows) ? rows : []) {
      if (!m || typeof m !== "object" || m.kind === "observation") continue;
      const ob = obscuredOf(m), whole = m.included === true || m.included === "true";
      if (!ob && !whole) continue;
      const ref = str(m.ref) || null, sha = str(m.sha).toLowerCase();
      if (!ob) {
        if (HEX64.test(sha) && this.#isPhoto(sha)) out.push({ ref, sha, why: PHOTO_ONLY_AS_COPY });
        continue;
      }
      let view = null;
      try {
        const { marks, last } = this.#marksOf(sha);
        view = CaseCarriage.#view(marks, last);
      } catch { view = null; }
      if (!view) out.push({ ref, sha: sha || null, why: "the photo's marks could not be read" });
      else if (!(view.copy && view.copy.sha256 === ob.copy))
        out.push({ ref, sha, why: "the photo's obscured copy is no longer its current copy" });
    }
    return out.slice(0, MARKS_LAPSED_MAX);
  }
}

const instances = new WeakMap();

/** The one instance for a host (K61). The first call creates it with `deps` (a test passes its own), creates its
 *  tables, and declares them to record-core in one call: the two of held materials exempt from purge (R6), the marks
 *  and their withdrawals and copies with their classes (R12); the answer is kept as `purgeDeclaration` and
 *  `marksDeclaration`. */
export function caseCarriageOf(host, deps) {
  let c = instances.get(host);
  if (!c) {
    const d = deps || {};
    const storage = d.storage || host.storage;
    const record = d.record || recordOf(host);
    const membership = d.membership || membershipOf(host, { record });
    const promotion = d.promotion || promotionOf(host, { record, membership });
    c = new CaseCarriage({ ...d, host, storage, record, membership, promotion });
    instances.set(host, c);
    c.migrate();
    /* One declaration, so the module holds one place in record-core's order: the two published tables with the classes
       `declarePurge`'s default form gave them (exempt, R6), and the marks, withdrawals and copies with theirs (R12). */
    const declared = record.declareTable("case-carriage", [...CASE_CARRIAGE_EXEMPT.map((name) => ({ name, purge: "exempt",
      expunge: "none", export: "admin-only", sight: "group", derive: "stored", version_chain: false })),
      ...CASE_CARRIAGE_MARK_TABLES.map((t) => ({ ...t }))]);
    c.purgeDeclaration = declared;
    c.marksDeclaration = declared;
  }
  return c;
}

/** R9, R10, R14: this module's route arms, keyed by op name, each a function of no arguments answering what its service
 *  answers (the `recordCoreOps` pattern). The control plane stamps `by` and `viewer` in `url`'s query, never the body;
 *  the capture is `capture` in the query or `captureSha` in the body, the areas the body's `areas`, and (R14) the mark
 *  and the reason the body's `mark` and `reason`. Which credential
 *  reaches each op is `op-declarations`' and `control-plane`'s; the routes come in layer 11. */
export function caseCarriageOps(cc, url, body) {
  const q = (k) => url.searchParams.get(k);
  const b = body && typeof body === "object" ? body : {};
  const sha = () => q("capture") ?? b.captureSha ?? null;
  return {
    obscuremark: () => cc.obscureMark({ captureSha: sha(), areas: b.areas, by: q("by") }),
    photomarks: () => cc.photoMarks({ captureSha: sha(), viewer: url.searchParams.has("viewer") ? q("viewer") : "" }),
    obscuremarkwithdraw: () => cc.obscureMarkWithdraw({ captureSha: sha(), mark: b.mark, reason: b.reason, by: q("by") }),
  };
}
