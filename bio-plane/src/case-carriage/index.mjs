/* case-carriage — what a case edition carries at its commit (requirements: `build/requirements/case-carriage.md`;
 * DEC-112 (3), (4); BIO_Publication_v0_1.md §5C). `publication`'s commit calls it inside its own transaction: it holds,
 * by SHA-256, the materials the signed document includes, so `public-read` carries them in the case file from the
 * published projection alone (R1–R3), and it re-reads what the document rests on that may have changed since it was
 * prepared: what may be published of each source it states (R5; N364) and another group's work it accepted (R4; N522).
 * The refusals those re-reads lead to, and every write to the published projection's other tables, are `publication`'s:
 * this module owns only the two tables of held materials (`./schema.mjs`, exempt from purge, R6) and names no place (R7).
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
 *
 * READ CONTRACTS it joins in its own SQL: provenance's `register` (its R48: `capture_sha`, `bundle_id`, `path`, `bytes`),
 * record-core's `bundles` (its R37) and sources' `source_knocks` (its R15). */

import { recordOf } from "../record-core/index.mjs";
import { membershipOf } from "../membership/index.mjs";
import { promotionOf } from "../promotion/index.mjs";
import { createSha256 } from "../record-grammar/index.mjs";
import { sourcesOf } from "../sources/index.mjs";
import { extractionOf } from "../extraction/index.mjs";
import { acceptedWorkOf } from "../accepted-work/index.mjs";
import { materialsOf, extractedTextOf, acceptedWorkOf as acceptedWorkBlocksOf, caseDocumentBlocks,
         sourceRowsStanding } from "../case-grammar/index.mjs";
import { CASE_CARRIAGE_EXEMPT, migrateCaseCarriage } from "./schema.mjs";

export { CASE_CARRIAGE_SCHEMA, CASE_CARRIAGE_EXEMPT } from "./schema.mjs";

/** R1: the most items one `unheld` answer names. */
export const UNHELD_MAX = 1000;
/** R4: the most open flags one `undisclosed` answer names. */
export const UNDISCLOSED_MAX = 200;

const safeJson = (s) => { try { return s == null ? null : JSON.parse(s); } catch { return null; } };
const HEX64 = /^[0-9a-f]{64}$/;
const str = (v) => (typeof v === "string" && v.trim() ? v.trim() : "");
const te = new TextEncoder();
const shaOf = (text) => createSha256().update(te.encode(String(text))).hex();

export class CaseCarriage {
  #deps;

  constructor({ storage, record, membership = null, promotion = null, host = null, extraction = null, sources = null,
                acceptedWork = null, now = null } = {}) {
    this.sql = storage.sql;
    this.record = record;
    this.membership = membership;
    this.promotion = promotion;
    this.#deps = { host, extraction, sources, acceptedWork };
    this.now = typeof now === "function" ? now : () => new Date().toISOString();
    this.purgeDeclaration = null;   // R6: record-core's answer to this module's purge declaration, set at creation
  }

  /* The modules reached lazily: each is created on the same host on first use, unless a test passed its own. */
  get acceptedWork() { return this.#deps.acceptedWork ||= acceptedWorkOf(this.#deps.host, { record: this.record, promotion: this.promotion }); }
  get extraction() { return this.#deps.extraction ||= extractionOf(this.#deps.host, { record: this.record, membership: this.membership }); }
  get sources() { return this.#deps.sources ||= sourcesOf(this.#deps.host, { record: this.record, membership: this.membership }); }

  migrate() { migrateCaseCarriage(this.sql); }

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
   *  Bytes held only in the evidence store are answered `held: "evidence"`, for ratification R39 to copy. Answers
   *  `{materials, unheld, files}`, `files` for the caller to register by hash; a material it cannot hold is answered,
   *  never refused. Never throws. */
  holdMaterials(fm, { caseId = null, edition = null, at = null } = {}) {
    const materials = [], unheld = [], files = [], texts = [];
    let when;
    try { when = this.#when(at); } catch { when = new Date().toISOString(); }
    let rows = null;
    try { const m = materialsOf(fm); rows = m && Array.isArray(m.materials) ? m.materials : null; } catch { rows = null; }
    const seen = new Set();
    const hold = (ref, kind, sha, text, bytes) => {
      if (seen.has(sha)) return;
      seen.add(sha);
      const inline = typeof text === "string";
      const size = inline ? te.encode(text).length : Number.isInteger(bytes) ? bytes : null;
      if (inline) texts.push([sha, kind, text, size]);
      files.push({ sha256: sha, ref, path: `materials/${sha}`, kind, bytes: size });
      materials.push({ sha, held: inline ? "inline" : "evidence" });
    };
    for (const m of Array.isArray(rows) ? rows : []) {
      if (!m || typeof m !== "object" || !(m.included === true || m.included === "true")) continue;
      const ref = str(m.ref), sha = str(m.sha).toLowerCase(), kind = m.kind;
      const miss = (what, why) => unheld.push({ ref: ref || null, kind: what,
        sha256: what === "extracted_text" ? str(m.text_sha).toLowerCase() || null : sha || null, why });
      if (!HEX64.test(sha)) { miss(kind === "observation" ? "observation" : "document", "the row names no SHA-256"); continue; }
      const home = this.#registered(sha);
      const inline = home ? this.#fileText(home.bundle_id, home.path) : null;
      const inlineOk = !!inline && shaOf(inline.content) === sha;
      if (kind === "observation") {
        if (inlineOk) hold(ref, "observation", sha, inline.content);
        else miss("observation", "this copy holds no text of that observation at its digest");
        continue;
      }
      if (inlineOk) hold(ref, "document", sha, inline.content);
      else if (home && !inline) hold(ref, "document", sha, null, Number(home.bytes));
      else { miss("document", "this copy holds no bytes of that document at its digest"); continue; }
      /* its extracted text */
      const textSha = str(m.text_sha).toLowerCase();
      let text = null;
      try {
        const u = this.extraction.unitsOf(sha);
        if (u && u.state === "whole" && Array.isArray(u.units) && u.units.length && !u.units.some((x) => !x || x.truncated))
          text = extractedTextOf(u.units);
      } catch { text = null; }
      if (typeof text === "string" && HEX64.test(textSha) && shaOf(text) === textSha) hold(ref, "extracted_text", textSha, text);
      else miss("extracted_text", "this copy holds no whole extracted text of that document at its stated digest");
      /* its timestamp tokens, as the capture's home provenance names them (K1315, K1322) */
      for (const t of this.#tokenFiles(home, sha)) {
        const f = this.#fileRow(home.bundle_id, t);
        if (f && typeof f.text === "string") hold(ref, "attestation", shaOf(f.text), f.text);
        else if (f && typeof f.blobSha === "string" && HEX64.test(f.blobSha)) hold(ref, "attestation", f.blobSha, null, f.bytes);
        else miss("attestation", `the timestamp token ${t} is not held`);
      }
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
        why: "this copy could not record it" })), ...unheld].slice(0, UNHELD_MAX) };
    }
    return { materials, unheld: unheld.slice(0, UNHELD_MAX), files };
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
    const f = home ? this.#fileText(home.bundle_id, "data/provenance.json") : null;
    const reg = f ? safeJson(f.content) : null;
    const out = new Set();
    for (const d of reg && Array.isArray(reg.documents) ? reg.documents : []) {
      if (!d || !d.capture || String(d.capture.sha256 || "").replace(/^sha256:/, "").toLowerCase() !== sha) continue;
      if (d.timestamp && typeof d.timestamp.token_file === "string" && d.timestamp.token_file) out.add(d.timestamp.token_file);
      for (const t of Array.isArray(d.attestations) ? d.attestations : [])
        if (t && t.kind === "rfc3161" && typeof t.file === "string" && t.file) out.add(t.file);
    }
    return [...out];
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
}

const instances = new WeakMap();

/** The one instance for a host (K61). The first call creates it with `deps` (a test passes its own), creates its two
 *  tables, and declares them to record-core's purge as exempt (R6); the declaration's answer is kept as
 *  `purgeDeclaration`. */
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
    c.purgeDeclaration = record.declarePurge("case-carriage", [], { exempt: [...CASE_CARRIAGE_EXEMPT] });
  }
  return c;
}
