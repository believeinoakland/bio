/* publication — the published record (requirements: `build/requirements/publication.md`; BIO_Publication_v0_1.md
 * §1–§4, §6A.2, §6A.3, §7; Membership v2 §8). Publication is the one irreversible act: what the group stands behind
 * leaves the instance, content-addressed and signed, so a stranger can verify without this instance that the group
 * said what it claims and rested it on what it says. This module holds every case document (unsigned and signed) and
 * the published projection, answers which cases a finding serves, serves the published record to anybody without a
 * credential, lets a member choose how their firsthand words are attributed, and exports the working corpus
 * verifiably. The two signing ceremonies (`ratification`) and preparing a case (`case-authoring`) write through it
 * (R21, R22), so one module keeps R24: nothing updates or deletes a published row, a signed document or a published
 * object.
 *
 * Extracted from the legacy modules (T8, layer 8; K3, K31, K57, K94, K102): `store.mjs` (the case relation and the
 * revision flags, the case document reads, the MK-7 attribution act, the verified export and its log, the published
 * reads and their pinning helpers, and the dispatch entries), `index.mjs` (the Worker half, `./worker.mjs`) and
 * `bio-checks.mjs` (C-44.2, C-68.5, C-92.1–.9 and C-98, now `./checks.mjs`). Its tables are `./schema.mjs`. The legacy
 * code's comments moved with it; where one names a store method that is not this module's (`publishCase`,
 * `ratifyCaseDocument`, `publish`, `#caseDocumentText`, `#reauthorAcknowledgements`) it names the act as it stands.
 * `../container.mjs`, `../inband.mjs` and `../deliverer.mjs` were this module's before the extraction (R14–R16).
 *
 * REACHED as `publicationOf(host, deps)` (K61): one instance per host (the Durable Object's `ctx`), created on the first
 * call with `deps`, returned to every later caller. At creation it creates its tables and declares them to
 * record-core's purge (R31), registers the facts `caseMember`, `publishedRegistry` and `publishedCaseRegistry` with
 * promotion (R4, R7; the registration rule, K206, N152) and its promotion projection, the revision flag (R5).
 * `deps` (each reached through its factory on the same host unless given; a test passes its own):
 *   record, membership, promotion   layer 2: `transact`, `head`, `readFile`, `textAtSha` (R60), `declarePurge`, the
 *                                   `bundles`, `files`, `history` and `manifest` tables (R18's export);
 *                                   `viewerPredicate`, `attestingKeys`, `memberFacts`; `registerStep`,
 *                                   `registerFact`, the fact `producingGroup`.
 *   inquiry        `exclusionsNaming` (R12).
 *   basisVersions  `testimonyReach` (R2, R17).
 *   now            the clock for the instants it writes, an ISO string (default: the wall clock).
 *
 * READ CONTRACTS it joins in its own SQL: record-core's `bundles`, `files`, `history` and `manifest` (R18, R21's
 * type column), provenance's `register` (R17's author, R18's register) and connections' `refs` (R18). */

import { recordOf, stampInstant, instantOrder } from "../record-core/index.mjs";
import { membershipOf, viewerPredicate } from "../membership/index.mjs";
import { promotionOf } from "../promotion/index.mjs";
import { observerRef } from "../provenance/index.mjs";
import { inquiryOf } from "../inquiry/index.mjs";
import { basisVersionsOf } from "../basis-versions/index.mjs";
import { parseFrontmatter, isMachineIdentity, createSha256, sectionText as caseSectionText,
         REVIEW_COPY_CHECKS } from "../../checks/bio-checks.mjs";
import { delivererOf } from "../deliverer.mjs";
import { rowOf, ATTRIBUTION_ACT_CHECKS, caseDocumentStatesMemberBlocks,
         caseDocumentRequiresV4Disclosures } from "./checks.mjs";
import { PUBLICATION_TABLES, PUBLICATION_EXEMPT, migratePublication, registerCaseDocumentSha,
         caseDocumentPath } from "./schema.mjs";

export { CASE_RESOLUTION_CHECKS, PUBLISHED_STORE_CHECKS, PUBLISHED_READ_CHECKS, ATTRIBUTION_ACT_CHECKS,
         CASE_DOCUMENT_FORMAT, CASE_DOCUMENT_FORMAT_V3, CASE_DOCUMENT_FORMAT_V2, CASE_DOCUMENT_FORMAT_LEGACY,
         CASE_DOCUMENT_FORMATS_ACCEPTED, caseDocumentStatesMemberBlocks, caseDocumentRequiresDisclosures,
         caseDocumentRequiresV4Disclosures } from "./checks.mjs";
export { PUBLICATION_SCHEMA, PUBLICATION_TABLES, PUBLICATION_EXEMPT, caseDocumentPath } from "./schema.mjs";

/* CASE-4 / DEC-72 / REC-60: the page size for `op=caseflags` (R6). A CHOSEN CONSTANT and never a finding — the flag
   table grows with every revision of every published member and has no natural ceiling, so the read publishes `limit`
   and `truncated` beside its answer rather than scanning whatever is there. 500 is deliberately generous: the common
   ask is one case or one finding, where the real answer is a handful of rows. */
export const CASE_FLAGS_LIMIT = 500;
/* REC-57: `op=exportlog` read the append-only export log at a literal `LIMIT 200` with no parameter and no published
   bound — on the one op whose whole sentence is a completeness claim to administrators (R19). */
export const EXPORT_LOG_LIMIT_DEFAULT = 200;
export const EXPORT_LOG_LIMIT_MAX = 1000;
/** R18: the longest note an export's log row keeps. */
export const EXPORT_NOTE_MAX = 280;
/** R37: the ratified editions one `publishedEditionsOf` read answers. */
export const EDITIONS_OF_MAX = 500;

/* CPDF-10: a column this module WROTE as JSON, read back; null rather than a throw on a malformed value. */
const safeJson = (s) => { try { return s == null ? null : JSON.parse(s); } catch { return null; } };
/* A value written into a case document's front matter on one line: line breaks folded, quotes and backslashes made
   apostrophes (the store's `#fmSafe`, one spelling for the attribution run). */
const fmSafe = (s) => String(s ?? "").replace(/[\r\n]+/g, " ").replace(/["\\]/g, "'").trim();
const str = (v) => (typeof v === "string" && v.trim() ? v.trim() : "");
const shaOf = (text) => createSha256().update(new TextEncoder().encode(String(text))).hex();

/* R23 (K240): the doors a review provider gives, and the answer each gives when no module has registered one: no draft
   reads, no grant admits, no identity or edition is stated, and the dead answer is C-87.1's bytes (the review copy's
   one "no such review copy" answer), so a door with no provider answers exactly as a revoked grant does. */
const REVIEW_DOORS = Object.freeze(["draftForMember", "draftIdentity", "caseIdentitySentence", "statedEdition",
                                    "liveGrant", "grantAdmitsCaseEdition", "deadAnswer"]);
const NO_REVIEW_PROVIDER = Object.freeze({
  registered: false, module: null,
  draftForMember: () => null, draftIdentity: () => null, caseIdentitySentence: () => null, statedEdition: () => null,
  liveGrant: () => null, grantAdmitsCaseEdition: () => false,
  deadAnswer: () => ({ ok: false, reason: "NO_REVIEW_COPY", code: "NO_REVIEW_COPY",
    check: REVIEW_COPY_CHECKS.NO_REVIEW_COPY.check, translation: REVIEW_COPY_CHECKS.NO_REVIEW_COPY.translation,
    detail: "no review copy answers to this request. A review copy is read through the grant that "
          + "was issued for it, or by a member with standing in the project that produced it; a "
          + "grant that was withdrawn, or whose draft has moved to another edition, answers exactly "
          + "as one that was never issued." }),
  detail: "no module has registered the review provider, so no grant admits and no draft is read through it",
});

/* R21: the sections of a case document a module other than the one that authored it may re-author, each a front
   matter run and a prose run. Each locator answers the run's half-open line range, or null when the document carries
   no such run (it was authored before the section existed); `reauthorSection` then leaves the document as it is. */
const SECTIONS = Object.freeze({
  /* MK-7: `observation_attributions:` to the next top-level key; `## Whose Words These Are` to the next `## `. */
  attribution: (lines) => {
    const f0 = lines.indexOf("observation_attributions:");
    let f1 = f0 + 1;
    while (f0 >= 0 && f1 < lines.length && lines[f1].startsWith("  ")) f1++;
    const b0 = lines.indexOf(ATTRIBUTION_PROSE_HEAD);
    let b1 = b0 + 1;
    while (b0 >= 0 && b1 < lines.length && !lines[b1].startsWith("## ")) b1++;
    return f0 < 0 || b0 < 0 || b1 >= lines.length ? null : { f0, f1, b0, b1 };
  },
  /* D-150 / REC-212: the statement's acknowledgement list — from `  statement_sha: ` to `completeness_excluded:`,
     and from `**Who else read this statement.**` to the blank line before `## What Was Searched`. */
  acknowledgements: (lines) => {
    const f0 = lines.findIndex((l) => l.startsWith("  statement_sha: "));
    const f1 = lines.indexOf("completeness_excluded:");
    const b0 = lines.findIndex((l) => l.startsWith("**Who else read this statement.**"));
    const b1 = lines.indexOf("## What Was Searched");
    return f0 < 0 || f1 < f0 || b0 < 0 || b1 < b0 + 1 ? null : { f0, f1, b0, b1: b1 - 1 };
  },
});
export const REAUTHORABLE_SECTIONS = Object.freeze(Object.keys(SECTIONS));

/* THE ONE "NO SUCH CASE DOCUMENT" ANSWER (REC-130). Both the genuinely-absent
   branch and the no-standing branch return THIS, so "does not exist" and "you
   may not see it" are the same bytes by construction rather than by care. */
function noCaseDocument(id, ed) {
  return { ok: false, reason: "NO_CASE_DOCUMENT", caseId: id, edition: ed,
           detail: `no case document has been authored for ${id} edition ${ed}. A case document `
                 + `is written by op=publish, which is the act that authors the assertions it `
                 + `carries — this plane does not compose one.` };
}

function signedCitations(text) {
  const fm = parseFrontmatter(String(text || "")).data || {};
  if (caseDocumentRequiresV4Disclosures(fm) && Array.isArray(fm.case_citations))
    return { state: "signed", rows: fm.case_citations };
  return { state: "undetermined", rows: null,
           stated: "version undetermined (signed before capture pins): this document was signed before a case's "
                 + "citation edges were pinned to the capture they were made against, and it carries neither" };
}

/** MK-7 — THE ATTRIBUTION LEVELS (MEMBER-KNOWLEDGE-DESIGN.md §4, §4.6), MOST PROTECTIVE FIRST.
 *  `group` is the floor every level shares (§4.3): every published case is the group's. `name`
 *  publishes the member's HANDLE — §4.6's reading of "to the member by name", which is a PROVISIONAL
 *  carried to Bob (the record holds no legal name and must not start to). The member id is never
 *  published at any level. */
export const ATTRIBUTION_LEVELS = Object.freeze(["group", "project", "cover", "name"]);

/* MK-7 — THE TWO RENDERINGS OF THE STATEMENTS, ONE SPELLING EACH: written by `#caseDocumentText` when
   op=publish authors a document reaching an observation, and spliced by `#reauthorAttributions` when the
   author's act lands on one authored and unsigned — `#ackFrontmatterLines`' arrangement. The frontmatter
   run starts at `observation_attributions:` and ends at the next top-level key; the prose starts at
   `ATTRIBUTION_PROSE_HEAD` and ends before the next `## ` heading. A document reaching NO observation
   carries neither, so every other case document's bytes are exactly what they were. */
export const ATTRIBUTION_PROSE_HEAD = "## Whose Words These Are";
export function attributionFrontmatterLines(rows) {
  return ["observation_attributions:",
    ...rows.flatMap((r) => [
      `  - observation: ${r.observation}`,
      `    level: ${r.level ?? "null"}`,
      `    shown: ${r.shown == null ? "null" : `"${fmSafe(r.shown)}"`}`,
      `    chosen_at_edition: ${r.chosen_at_edition ?? "null"}`])];
}
export function attributionBodyLines(rows) {
  const said = { group: "the group that publishes this case", project: "the project that produced it",
                 cover: "the cover the group knows its author by", name: "the name its author chose to appear under" };
  return [ATTRIBUTION_PROSE_HEAD, "",
    `This case rests, directly or through another finding, on ${rows.length} firsthand observation`
    + `${rows.length === 1 ? "" : "s"} recorded by a member of this group. What it shows of who SAID each one is `
    + "that member's own choice, made for this edition and never filled in for them (MEMBER-KNOWLEDGE-DESIGN.md "
    + "§4). An observation names no person in its own bytes; the words below are the whole of the attribution.",
    "",
    ...rows.map((r) => !r.level
      ? `- **${r.observation}** — NO LEVEL IS CHOSEN: ${r.why}. This edition cannot be signed until its author `
        + "chooses one, or the finding resting on it leaves the case."
      : `- **${r.observation}** — attributed to ${said[r.level]}${r.shown == null ? " (this record names no "
        + "producing group, so none is printed)" : `: ${r.shown}`} — level \`${r.level}\`, chosen at edition `
        + `${r.chosen_at_edition}.`),
    ""];
}

/* ===== D-431 — WHAT A FINDING "RESTS ON", NAMED ONCE, AND READ BY BOTH THE SERVING AND THE REFUSAL =====
   BIO_Publication_v0_1.md §3 rule 2, the second note (BOB #16, 2026-09-19): *"Rests on is the edge set the
   published graph already uses to decide it may serve an edge, named by the builder from the code and proved
   identical at both sites."* NAMED FROM THE CODE: the published graph is written by `publishEdges` from the
   edges `op=ratify` reads out of the RATIFIED BYTES, and it SERVES an edge only when the edge is of the
   `serve` class and its target is itself published. The `serve` class is every `references[]` entry (its
   `rel` as the kind, `cites` when none is authored); the two division disclosures are NAME-ONLY by kind and
   are never served. So a finding RESTS ON exactly the targets of its `serve`-class edges.
   This one static IS that edge set: the control plane builds the graph it hands `publishEdges` from it
   (`op=ratify`), and `ratifiedFindingsRestingOn` asks it of each pinned finding's bytes — one function,
   two readers, so the refusal and the serving cannot come to read different quantities.
   `ratify-authority.test.mjs` §8 pins the behaviour (what the refusal admits is what the graph serves) and
   the two call sites. Moved here VERBATIM from `op=ratify`'s inline array; a second spelling of this list
   anywhere is the defect it exists to prevent. */
export function publishedGraphEdges(fm) {
  const d = fm && typeof fm === "object" ? fm : {};
  const refs = Array.isArray(d.references) ? d.references : [];
  return [
    ...refs.filter((r) => r && typeof r.target === "string")
      .map((r) => ({ to: r.target, kind: typeof r.rel === "string" && r.rel ? r.rel : "cites",
                     disclosure: "serve" })),
    ...(typeof d.division_parent === "string" && d.division_parent !== "null"
      ? [{ to: d.division_parent, kind: "division_parent", disclosure: "name" }] : []),
    ...(Array.isArray(d.division_siblings) ? d.division_siblings : [])
      .filter((s) => typeof s === "string" && s)
      .map((s) => ({ to: s, kind: "division_sibling", disclosure: "name" })),
  ];
}

export class Publication {
  #deps;
  #review = null;        // R23: {module, ...doors}, filled once
  #evidenceBlock = null; // R36: {module, name, fn}, filled once

  constructor({ storage, record, membership, promotion, host = null, inquiry = null, basisVersions = null,
                now = null } = {}) {
    this.sql = storage.sql;
    this.record = record;
    this.membership = membership;
    this.promotion = promotion;
    this.#deps = { host, inquiry, basisVersions };
    this.now = typeof now === "function" ? now : () => new Date().toISOString();
  }

  /* The modules reached lazily: each is created on the same host on first use, unless a test passed its own. */
  get inquiry() { return this.#deps.inquiry ||= inquiryOf(this.#deps.host); }
  get basisVersions() { return this.#deps.basisVersions ||= basisVersionsOf(this.#deps.host); }

  migrate() { migratePublication(this.sql); }

  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  #one(q, ...a) { for (const r of this.sql.exec(q, ...a)) return r; return null; }
  #when() { const w = this.now(); return typeof w === "string" && w ? w : new Date().toISOString(); }

  /* A held bundle's current `bundle_sha`, from record-core (R41), or null. */
  #headRow(bundleId) { const s = this.#headSha(bundleId); return s ? { bundle_sha: s } : null; }

  /* A live file's inline text as `{content}` (record-core R13), or null when it is not held inline. */
  #fileText(bundleId, path) {
    let f = null;
    try { f = this.record.readFile(bundleId, path); } catch { f = null; }
    return f && typeof f.text === "string" ? { content: f.text } : null;
  }

  #headSha(bundleId) {
    let h = null;
    try { h = this.record.head(bundleId); } catch { h = null; }
    return h && typeof h.bundleSha === "string" ? h.bundleSha : null;
  }

  /* The instance's producing group, promotion's fact (legacy-store provides it until instance-setup does); null when
     no module provides it, which the attribution prose states rather than filling. */
  #producingGroup() {
    const f = this.promotion.fact("producingGroup");
    return f && f.ok ? f.value ?? null : null;
  }

  /* ---------------------------------------------------------------- R23: the review provider */

  /** R23 (K240): a later module fills, once at start, the review doors this module and `case-authoring` read:
   *  `draftForMember(id, viewer)` (a draft the member may read, or null), `draftIdentity(draft)` (its case identity),
   *  `caseIdentitySentence(caseId, edition, newCase)` and `statedEdition(identity, newCase)` (the sentence and edition a
   *  draft states), `liveGrant(secretSha)`, `grantAdmitsCaseEdition(secretSha, caseId, edition)` and `deadAnswer()`.
   *  Called as `registerReviewProvider(provider)` or `registerReviewProvider(module, provider)`. A second
   *  registration is refused `PROVIDER_DECLARED`; one missing a door `PROVIDER_MALFORMED`. Today `legacy-store`
   *  fills it; `review` does when extracted. */
  registerReviewProvider(moduleOrProvider, maybeProvider = undefined) {
    const provider = typeof moduleOrProvider === "string" ? maybeProvider : moduleOrProvider;
    const module = typeof moduleOrProvider === "string" ? str(moduleOrProvider)
                 : str(provider && provider.module) || "unnamed";
    if (!provider || typeof provider !== "object" || !REVIEW_DOORS.every((d) => typeof provider[d] === "function"))
      return { ok: false, reason: "PROVIDER_MALFORMED",
               detail: `the review provider gives the doors ${REVIEW_DOORS.join(", ")}` };
    if (this.#review)
      return { ok: false, reason: "PROVIDER_DECLARED", module: this.#review.module,
               detail: `the review provider is already registered by ${this.#review.module}` };
    this.#review = { module, ...Object.fromEntries(REVIEW_DOORS.map((d) => [d, provider[d]])) };
    return { ok: true, module };
  }

  /** R23: the registered review provider, or the answer that none is: no draft reads, no grant admits, no identity is
   *  stated, and the dead answer is C-87.1's. */
  reviewProvider() {
    return this.#review ? { registered: true, ...this.#review } : NO_REVIEW_PROVIDER;
  }

  /* R1, R2: whether a live review grant admits exactly this case edition. With no provider, none does. */
  #grantAdmitsCaseEdition(secretSha, caseId, edition) {
    if (!secretSha) return false;
    try { return !!this.reviewProvider().grantAdmitsCaseEdition(secretSha, caseId, edition); } catch { return false; }
  }

  /* ---------------------------------------------------------------- R36: the evidence-package block */

  /** R36: a later module fills, once at start, one evidence-package block: `fn({caseId, edition, findings})` answers
   *  the block `publishedCase` (R10) carries under `name` beside the case, computed at the read. `filings` fills the
   *  available-actions block (its R15). Nothing it answers enters the case's own bytes. A second registration is
   *  refused `PROVIDER_DECLARED`, a malformed one `PROVIDER_MALFORMED`. */
  registerEvidenceBlock(module, name, fn) {
    if (!str(module) || !/^[a-z][a-z0-9_]{0,63}$/.test(String(name ?? "")) || typeof fn !== "function")
      return { ok: false, reason: "PROVIDER_MALFORMED",
               detail: "an evidence-package block names its module, a lowercase block name and its function" };
    if (this.#evidenceBlock)
      return { ok: false, reason: "PROVIDER_DECLARED", module: this.#evidenceBlock.module,
               detail: `the evidence-package block is already registered by ${this.#evidenceBlock.module}` };
    this.#evidenceBlock = { module: str(module), name: String(name), fn };
    return { ok: true, module: this.#evidenceBlock.module, name: this.#evidenceBlock.name };
  }

  /* R36: the package's block for one answered case edition, computed at the read. A block that throws is stated as
     unavailable, never as absent; with none registered the package says it carries no such block. */
  #evidencePackage(caseId, edition, findings) {
    if (!this.#evidenceBlock)
      return { blocks: {}, detail: "no module provides an evidence-package block, so this package carries none; the "
                                 + "evidence package is the published case edition itself" };
    const { name, module, fn } = this.#evidenceBlock;
    let value;
    try { value = fn({ caseId, edition, findings: findings.map((f) => f.bundle_id) }); }
    catch (e) { value = { unavailable: true, detail: `${module} could not compute this block: ${String(e && e.message || e).slice(0, 200)}` }; }
    return { blocks: { [name]: value ?? null },
             detail: `each block is computed at this read by the module that provides it (${module}); it is not in the `
                   + "case's signed bytes, and nothing of it is a claim the case makes" };
  }

  /* ---------------------------------------------------------------- R21: the case document's writes */

  /** R21: store one case edition's UNSIGNED document, replacing an unsigned one of the same edition and never a signed
   *  one, and project its exclusions (R3). Inside the caller's transaction; never throws on a signed document; answers
   *  what the store holds after the call, read back, so a caller sees a write that did not happen. */
  storeCaseDocument({ case: caseArg = null, caseId = null, edition = null, text = null, author = null, at = null,
                      draft = null } = {}) {
    const id = str(caseArg ?? caseId), ed = Number(edition);
    if (!id || !Number.isInteger(ed) || ed < 1 || typeof text !== "string" || !text)
      return { ok: false, reason: "MALFORMED", detail: "a case document names its case, a positive edition and its text" };
    const docSha = shaOf(text);
    this.sql.exec(
      `INSERT INTO case_documents (case_id,edition,doc_sha,text,authored_at,authored_by,draft_id)
       VALUES (?,?,?,?,?,?,?)
       ON CONFLICT(case_id,edition) DO UPDATE SET doc_sha=excluded.doc_sha, text=excluded.text,
         authored_at=excluded.authored_at, authored_by=excluded.authored_by, draft_id=excluded.draft_id
       WHERE case_documents.sig_armored IS NULL`,
      id, ed, docSha, text, str(at) || this.#when(), author ?? null, draft ?? null);
    this.projectCaseExclusions(id, ed);
    const held = this.#one(`SELECT doc_sha, sig_armored FROM case_documents WHERE case_id=? AND edition=?`, id, ed);
    return { ok: true, case_id: id, edition: ed, doc_sha: held ? held.doc_sha : null,
             stored: !!held && held.doc_sha === docSha && !held.sig_armored };
  }

  /** R21: replace one named section's lines (`attribution`, `acknowledgements`: SECTIONS above) of an UNSIGNED case
   *  document still at `docSha`. `lines` is `{frontmatter, body}`, each an array of lines the section's owner built.
   *  Only those runs change; the document's hash moves, so a signature over the old bytes is refused as stale. A
   *  signed or moved document, or one carrying no such section, is left as it is and the answer says so. */
  reauthorSection({ case: caseArg = null, caseId = null, edition = null, docSha = null, section = null,
                    lines = null } = {}) {
    const id = str(caseArg ?? caseId), ed = Number(edition);
    const locate = typeof section === "string" && Object.prototype.hasOwnProperty.call(SECTIONS, section) ? SECTIONS[section] : null;
    const fmLines = lines && Array.isArray(lines.frontmatter) ? lines.frontmatter.map(String) : null;
    const bodyLines = lines && Array.isArray(lines.body) ? lines.body.map(String) : null;
    if (!id || !Number.isInteger(ed) || ed < 1 || !locate || !fmLines || !bodyLines)
      return { ok: false, reason: "MALFORMED",
               detail: `a re-author names a case edition, one of the sections ${REAUTHORABLE_SECTIONS.join(", ")}, `
                     + "and its front matter and body lines" };
    const doc = this.#one(`SELECT case_id, edition, doc_sha, text, sig_armored FROM case_documents
                            WHERE case_id=? AND edition=?`, id, ed);
    const held = { case_id: id, edition: ed, doc_sha: doc ? doc.doc_sha : null };
    if (!doc) return { ok: true, ...held, reauthored: false, why: "no case document is held for this edition" };
    if (doc.sig_armored) return { ok: true, ...held, reauthored: false, why: "this case document is signed, and a signed document never changes" };
    if (str(docSha) && doc.doc_sha !== str(docSha))
      return { ok: true, ...held, reauthored: false, why: "this case document has moved since it was read, so nothing was spliced" };
    const all = doc.text.split("\n");
    const at = locate(all);
    if (!at) return { ok: true, ...held, reauthored: false, why: `this case document carries no ${section} section to re-author` };
    const text = [...all.slice(0, at.f0), ...fmLines, ...all.slice(at.f1, at.b0), ...bodyLines, ...all.slice(at.b1)].join("\n");
    if (text === doc.text) return { ok: true, ...held, reauthored: false };
    const newSha = shaOf(text);
    this.sql.exec(`UPDATE case_documents SET doc_sha=?, text=? WHERE case_id=? AND edition=? AND doc_sha=?
                   AND sig_armored IS NULL`, newSha, text, id, ed, doc.doc_sha);
    this.projectCaseExclusions(id, ed);
    const now = this.#one(`SELECT doc_sha FROM case_documents WHERE case_id=? AND edition=?`, id, ed);
    return { ok: true, case_id: id, edition: ed, doc_sha: now ? now.doc_sha : null,
             reauthored: !!now && now.doc_sha === newSha,
             read: `op=casedocument&case=${id}&edition=${ed}` };
  }

  /* ---------------------------------------------------------------- R22, R35: the commits the ceremonies make */

  /** R22 (K241): commit one published edition of a bundle a member signed, inside the caller's transaction — the
   *  whole of what `op=ratify`'s committer did after its authority and scope arms (those are ratification's, R5):
   *  the rule-12 frozen pair read from the ratified case documents pinning these bytes, the edition's two refusals
   *  (`EDITION_EXISTS`, `EDITION_NOT_INCREMENTED`), `CASE_ASSERTION_DIVERGED` against every legacy case pinning it,
   *  the per-case discharge of revision flags (R5), the bar projection, the `published_bundles` row, every file's hash
   *  and the published graph (R35). Re-committing bytes already published at that edition is a retry and answers
   *  `existed: true`, writing nothing new. Who may publish is ratification's. */
  commitEdition({ bundleId = null, bundleSha = null, edition = null, title = null, completeness = null, strength = null,
                  memberCarriesBlocks = false, group = null, edges = [], shas = null, attestorKey = null,
                  attestorMember = null, gateVersion = null, sigArmored = null, deliveredBy = null, at = null } = {}) {
    if (!bundleId || !bundleSha || !attestorKey || !gateVersion || !sigArmored || !Array.isArray(shas))
      return { ok: false, reason: "MALFORMED" };
    const pinnedBy = this.pinnedCaseEditionsOf(bundleId, bundleSha);
    const top = this.#one(`SELECT MAX(edition) AS m FROM published_bundles WHERE bundle_id=?`, bundleId);
    const highest = top && top.m != null ? Number(top.m) : 0;
    /* Re-ratifying bytes that are ALREADY published is a retry, not a
       revision: it answers with the edition those bytes already carry rather
       than minting a second one for the same document. */
    const already = this.#one(
      `SELECT edition FROM published_bundles WHERE bundle_id=? AND bundle_sha=?`, bundleId, bundleSha);
    /* A CASE states its edition in the bytes the signature covers, so it
       arrives here and is checked. ANYTHING ELSE — an information bundle, a
       project — has no authored edition, and each ratification of new bytes
       is the next one: that is what closes D-144 for every bundle type
       rather than only for cases, since the defect was that a re-ratification
       DESTROYED the prior signature, attestor, time and gate version. */
    /* ===== D-442 / BIO_Publication_v0_1.md §3 rule 12 (b), (d): THE MEMBER'S EDITION AND ITS
       FROZEN PAIR FOLLOW THEIR BLOCK INTO THE CASE DOCUMENT. =====================================
       A finding published under rule 12 carries neither in its own bytes — op=publish wrote nothing
       on it — so they are read from the RATIFIED case documents that pin exactly these bytes
       (`pinnedBy`, the same relation the authority check above was decided on). Still committed
       FROM SIGNED BYTES, one signature over: #publishEdges' doctrine, as CASE-5b applied it to the
       bar. Several cases may pin one sha now, each with its own reading of it; where they agree the
       projection takes it, and where they do not it is left null and SAID (`strengthUndetermined`,
       the `barUndetermined` precedent below) — the per-case pair is always one read away, on
       op=publishedcase, from that case's own document. Legacy bytes keep the member's own blocks
       (rule 12 (e)): nothing here runs for them. */
    const docFrozen = !memberCarriesBlocks && pinnedBy.length
      ? this.frozenFromPinningDocuments(bundleId, bundleSha, pinnedBy) : null;
    const ed = Number.isInteger(edition) ? edition
             : already ? Number(already.edition)
             : docFrozen && Number.isInteger(docFrozen.edition) ? docFrozen.edition
             : highest + 1;
    const frozenStrength = memberCarriesBlocks ? strength : docFrozen ? docFrozen.strength : strength;
    const same = this.#one(`SELECT bundle_sha FROM published_bundles WHERE bundle_id=? AND edition=?`, bundleId, ed);
    const existed = !!(same && same.bundle_sha === bundleSha);
    if (same && !existed)
      return { ok: false, reason: "EDITION_EXISTS", bundleId, edition: ed, published: same.bundle_sha,
               detail: `edition ${ed} of ${bundleId} is already published at a different sha. An edition is a `
                     + `SEPARATE DOCUMENT and answers forever: republishing different bytes under the same `
                     + `number would leave a reader who cited edition ${ed} unable to say which one they read.` };
    /* CASE-5 corrects the WORDING and not the rule: this refusal always keyed
       `published_bundles`, which is one BUNDLE's chain, and said "this case".
       Before the flip a bundle's chain and its case's editions were the same
       numbers so the sentence read true; after it they are not, and a member
       told "this case is published through edition 3" while ITS OWN chain is
       at 3 inside a case at edition 5 would go looking at the wrong altitude. */
    if (!existed && highest && ed <= highest)
      return { ok: false, reason: "EDITION_NOT_INCREMENTED", bundleId, edition: ed, highest,
               detail: `${bundleId} is published through edition ${highest} on its OWN version chain; a `
                     + `revision must increment it (DEC-12). Editions do not overwrite each other — edition `
                     + `${highest} keeps its own signature, attestor, time and gate version, and a new one `
                     + `joins it. This is the FINDING's edition, not the edition of any case it is a member `
                     + `of: since CASE-5 the two are separate numbers.` };
    const now = str(at) || new Date().toISOString();
    /* REC-44: THE CASE ROW AND THE MEMBERSHIP, both written from the RATIFIED
       BYTES the control plane read out of the signed document and out of
       nothing else — #publishEdges' doctrine, for #publishEdges' reason: the
       working record moves under a published edition every time somebody
       promotes, and what the signature covers is what the published record
       must say.
       THE DIVERGENCE REFUSALS ARE THE POINT. Each member finding carries the
       case's scope, its completeness assertion and the whole roster in its
       OWN signed bytes, so the second member to ratify is checked against
       what the first one signed. Without this the case row would be whatever
       the last ratification happened to say, and two members could disagree
       about what case they are in with nothing noticing. */
    /* ===== CASE-5 / DEC-72: THE CASE'S EDITION IS THE CASE'S ==============
       `ed` above is THE MEMBER'S — it keys `published_bundles` and the two
       refusals that keep a finding's own chain honest. Every statement in the
       case block below keys `published_cases` / `published_case_members`
       instead, and those take the CASE's number, which arrives in the signed
       bytes as `case_edition`. Before the flip the two were ONE VARIABLE,
       which is the conflation `schema.mjs`'s `version_sha` comment names and
       the reason a finding could only ever belong to one case.

       IT COMES OUT OF THE SIGNED BYTES, like every other case fact here and
       for `#publishEdges`' reason: a case edition taken off the request would
       place a member into an edition nobody signed for, and the divergence
       refusals below would then be checking a number this plane chose against
       a roster the members did.

       FALLING BACK TO `ed` IS DEFENCE IN DEPTH AND NOT A POLICY DEFAULT, and
       the distinction is worth being exact about because a silent default is
       how a fact stops being authored. **The GATE for this field is C-2.8**,
       which requires `case_edition` on a published inquiry and names it when
       it is missing — the same door CASE-2 put `case_project` and `case_roles`
       behind, and for CASE-1's stated reason: a refusal belongs where it can
       say what is absent. What the fallback covers is the one case the gate
       cannot: bytes signed before this field existed, whose two numbers WERE
       equal, being replayed through the idempotent re-ratification path. For
       those bytes `ed` is the right answer and is the answer they already got.

       DECLARED OUTSIDE THE `if (caseId)` BLOCK BECAUSE `#caseEditionState` AT
       THE FOOT OF THIS METHOD NEEDS IT. That call is the ratify path's answer
       to "is this case edition complete", and reading it at the member's
       number was the same conflation one level up: a case at edition 2 whose
       new member is at its own edition 1 would have been asked about a case
       edition 1 that had already completed, and this act would have reported a
       DIFFERENT edition's state to the container assembler. */
    /* ===== CASE-5b / DEC-72: THE MEMBER NO LONGER COMMITS THE CASE ========

       EVERYTHING THIS BLOCK USED TO WRITE IS WRITTEN BY `ratifyCaseDocument`
       NOW, out of the one signed case document, BEFORE any member ratifies.
       `cases`, `published_cases` and the roster rows with their pins are all
       committed there. What is left here is the only thing that was ever
       genuinely this act's: confirming that THIS member, at THIS sha, is where
       the case said it would be.

       THE RELATION COMES OFF THE PIN AND NOT OFF THE BYTES. A finding's
       frontmatter no longer names a case at all, so "which case is this
       member of" is answered by the column CASE-3 built for it: is this
       finding's `bundle_sha` the `version_sha` some ratified roster froze?
       That is `#caseRelationOf`'s own question, which CASE-4 already asks from
       the member's side — one comparison over one column read two ways, and
       no second mechanism.

       FOUR DIVERGENCE REFUSALS WENT AWAY WITH THE FORMAT AND ONE STAYED, and
       the split is the whole argument. CASE_MEMBERSHIP_DIVERGED,
       CASE_ROLES_DIVERGED, CASE_PRODUCTION_DIVERGED and the case-side half of
       CASE_ASSERTION_DIVERGED existed to notice that N COPIES OF ONE FACT had
       stopped agreeing. There is one copy now and it cannot disagree with
       itself, so those are not fences that were lowered — they are fences
       around a hole that has been filled. CASE_ASSERTION_DIVERGED SURVIVES,
       under its own name, because it now compares two things that really are
       separate: what the CASE's signer asserted about the case's limits, and
       what THIS member's own signed bytes froze as theirs. Those are two
       members' signatures and they can genuinely differ.

       `CASE_ROSTER_EXCLUDES_SELF` IS GONE FOR THE SAME REASON AND IT IS WORTH
       NAMING: it refused a finding that claimed a case whose roster did not
       include it. A finding cannot claim a case any more. The shape it
       refused is unrepresentable rather than merely refused, which is the
       better outcome and the one this record reaches for everywhere else. */
    /* ===== D-309 / DEC-72 clause 6, 2026-09-10: SITE 2 OF CASE-6's NINE — THE
       CONTAINER'S `rel` LOOKUP, AND THE DECISION IS **ALL OF THEM**.

       WHAT IT USED TO DO: `ORDER BY m.case_id, m.edition DESC LIMIT 1` — the
       lowest-sorting case's highest edition. With the fence up that was one
       case and the sort was a formality. With the fence down it is a GUESS, and
       it is the worst-placed one of the nine, because THREE separate things
       keyed off it and each would have gone wrong differently:

         - `CASE_ASSERTION_DIVERGED` would have checked this member's signed
           completeness against ONE of the case documents it is a member of and
           let the others through unchecked. A divergence refusal that examines
           half its subject is a fence that has stopped biting.
         - `#dischargeCaseFlags` would have discharged ONE case's revision flags
           and left the other case's outstanding FOREVER with nothing to raise
           them again — set-but-never-clear inverted into never-set.
         - `published_bundles.required` would have frozen one case's bar onto a
           member two cases hold to two standards of evidence.

       SO IT IS A LOOP NOW, one iteration per CASE this member's bytes are
       pinned by, and each of the three is decided on its own below. The JOIN on
       `published_cases` is unchanged and still does its job: only case editions
       that exist are membership. `#soleCase` collapses several editions of ONE
       case to that case at its newest, so a single-case member takes exactly
       the path it took yesterday, with exactly one iteration. */
    const byCase = this.pinnedCaseEditionsOf(bundleId, bundleSha);
    const rel = this.soleCase(byCase);
    const caseId = rel ? rel.case_id : null;
    const cEd = rel ? Number(rel.edition) : ed;
    for (const one of byCase) {
      const oneEd = Number(one.edition);
      const cRow = this.#one(
        `SELECT completeness, bias_acknowledgement, bar FROM published_cases WHERE case_id=? AND edition=?`,
        one.case_id, oneEd);
      const cComp = completeness ? JSON.stringify(completeness) : null;
      /* ONE COMPARISON, AND IT IS BETWEEN TWO SIGNATURES RATHER THAN BETWEEN
         TWO COPIES. The case document's signer asserted what this case does
         not cover. This member's own bytes carry the completeness block
         `op=publish` wrote into them before their sha was taken. If a member
         re-promoted between the publishing act and their signature, editing
         that block, the two statements now differ — and a case edition asserts
         ONE completeness claim. Refused rather than reconciled, which is what
         the name has always meant. */
      /* D-309: CHECKED FOR EVERY CASE, not for one of them. Two case documents
         may each assert their own limits and this member's bytes must agree
         with BOTH — they are two signatures and either can genuinely differ. */
      /* D-442: ASKED ONLY OF A LEGACY (/1) CASE DOCUMENT. Under rule 12 a /2 document is the ONE
         place its completeness is stated and no member's bytes carry a copy to disagree with — so a
         legacy member (its own old block in its bytes) pinned by a NEW case would otherwise be
         refused for carrying another case's words, which is the very cross-case write rule 12
         removes, arriving as a refusal. */
      const legacyDoc = !this.caseDocMemberFrozen(one.case_id, oneEd);
      if (legacyDoc && cRow && cComp && (cRow.completeness ?? null) !== cComp)
        return { ok: false, reason: "CASE_ASSERTION_DIVERGED", bundleId, caseId: one.case_id, edition: oneEd,
                 detail: `this finding's signed bytes freeze a different completeness assertion for case `
                       + `${one.case_id} edition ${oneEd} than the CASE DOCUMENT a member signed for it. A case `
                       + `edition asserts ONE completeness claim, and since CASE-5b that claim is signed `
                       + `once, in the case's own document — so a member whose bytes say something else `
                       + `has not been re-published through op=publish since the case was authored.` };
      /* ==== CASE-4 / DEC-72: THE DISCHARGE. THE OWNING PROJECT HAS ACTED. ===
         *"New editions are each owning project's deliberate act."* A ratified
         edition of this case IS that act, and this is the moment it becomes
         real — the bytes are signed, the pin is written, the edition is on the
         record. So the outstanding flags on THIS CASE are stamped with what
         was done about them.

         STAMPED AND NOT DELETED, which is the literal content of
         set-but-never-clear: the row keeps saying a revision was flagged, and
         now also says which edition, published by whom, at what instant,
         answered it. A reader can still see that the case carried a stale pin
         between those two dates, which is a fact about the record that
         deleting the row would destroy.

         SCOPED TO `caseId`, WHICH IS THE WHOLE OF D-266 ARRIVING HERE. Another
         project publishing another case cannot reach these rows, and this
         project publishing THIS case cannot reach another case's — the
         statement's WHERE clause names one case_id and there is no statement
         anywhere that names more. So where several flagged cases are owned by
         several projects, one project acting leaves every other project's
         flags outstanding, structurally rather than by anyone remembering to.

         `attestorMember` is who is credited, not the project: the act is a
         ratification and a ratification is performed by a member. The project
         is already on the flag row, written when it was raised.

         D-309: DISCHARGED PER CASE, INSIDE THE LOOP, AND D-266's SCOPING IS
         STRENGTHENED RATHER THAN LOOSENED BY IT. The statement still names ONE
         case_id and there is still no statement in this plane that names more;
         what changed is that the loop names EVERY case this member's ratified
         bytes are actually in, instead of one of them. A member serving two
         cases discharges both cases' flags on the same act because the act
         genuinely answered both — and a case this member is NOT in is as
         unreachable from here as it ever was. */
      this.dischargeCaseFlags(one.case_id, oneEd, attestorMember ?? null, now);
    }
    /* ===== CASE-5b: `published_bundles.required` IS NOW A PROJECTION OF THE
       CASE'S BAR, AND IT IS STATED AS ONE RATHER THAN QUIETLY DERIVED. =======

       It used to be committed from THIS member's `required_strength` block,
       which is the shape CASE-5 already diagnosed: the bar is the CASE's
       property (DEC-72 clause 2), and one stamp per member is how one case
       edition came to have two standards of evidence when a project's bar moved
       between two ratifications. CASE-5 moved the authority to
       `published_cases.bar` and left this column reading the member's copy
       because that copy was where the signature was. The signature is over the
       case document now, so this column reads the authority instead.

       IT IS STILL COMMITTED FROM SIGNED BYTES — just not from THESE signed
       bytes. `published_cases.bar` was committed by `ratifyCaseDocument` out of
       the case document a member signed, so nothing here is taken from a
       request; #publishEdges' doctrine holds, one document over.

       WHY THE COLUMN IS KEPT AT ALL RATHER THAN DROPPED: five reader sites and
       the UI's per-finding bar render off it, and a column that silently went
       NULL would have every one of them print "bar: none declared" over a case
       that declared one — an absent bar is not a bar of zero, and this is the
       one place the record could have made that false by accident. Moving those
       readers onto the case's own field is a SURFACE change and belongs with
       CASE-6, which owns the published case page. Recorded in IC-71 as such. */
    /* ===== D-309: THE BAR PROJECTION UNDER CLAUSE 6, AND THIS IS THE ONE
       DECISION ON THIS SITE THAT IS NOT "ALL OF THEM".

       THE PROBLEM STATED HONESTLY: the bar is the CASE's (DEC-72 clause 2), and
       a member serving two cases is held by two cases to two standards of
       evidence. This is ONE column on `published_bundles`, keyed on the
       FINDING's (bundle_id, edition). A set does not fit in it.

       WHAT IS NOT DONE, AND WHY. Widening the schema is not this item's (the
       brief says so, and the surface half of clause 6 does not need it —
       CASE-6 moved the published page onto `published_cases.bar`, which is per
       case and already correct for any n). Picking one case's bar is the
       nine-silent-guesses defect arriving in a WRITE, which is worse than in a
       read because the guess is then frozen and signed-adjacent forever.
       Refusing the ratification is over-strict: two cases legitimately
       declaring different bars over one shared finding is exactly the shape
       clause 6 exists to permit, and a fence tighter than its rule is an
       undeclared interface change wearing the costume of caution.

       SO: PROJECTED WHEN THE CASES AGREE, NULL WHEN THEY DO NOT — and the
       disagreement is STATED in this act's answer (`barUndetermined`) rather
       than left to read as an absence. That distinction is the whole of it.
       CASE-5b's comment names the hazard precisely — *"a column that silently
       went NULL would have every one of them print 'bar: none declared' over a
       case that declared one — an absent bar is not a bar of zero"* — so the
       null is NOT silent here: the act names the cases and their differing
       bars, and `published_cases.bar` answers per case for anyone who asks.
       Undetermined is first-class and must be stated; inventing one of two real
       bars to fill a column would be exactly the attribution CLAUDE.md forbids.

       MEASURED, NOT ASSUMED, ABOUT HOW OFTEN THIS BITES: `published_bundles`
       carries `ON CONFLICT(bundle_id,edition) DO NOTHING`, so this column is
       written at a member's FIRST ratification at that edition and a later
       case adopting the same finding rewrites nothing. The disagreement is
       therefore reachable only when both cases pin the member before it first
       ratifies. Stated rather than claimed either way. */
    const bars = byCase.map((one) => {
      const b = this.#one(`SELECT bar FROM published_cases WHERE case_id=? AND edition=?`,
                          one.case_id, Number(one.edition));
      return { case_id: one.case_id, edition: Number(one.edition), bar: b && b.bar ? b.bar : null };
    });
    const distinctBars = [...new Set(bars.map((x) => x.bar))];
    const barUndetermined = distinctBars.length > 1;
    const required = !barUndetermined && distinctBars.length === 1 && distinctBars[0]
      ? JSON.parse(distinctBars[0])
      : null;
    this.sql.exec(
      `INSERT INTO published_bundles (bundle_id,edition,title,bundle_sha,ratified_at,attestor_key,attestor_member,delivered_by,gate_version,sig_armored,strength,required,parts)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
       ON CONFLICT(bundle_id,edition) DO NOTHING`,
      /* REC-128: who DELIVERED, as the control plane read it off the SESSION;
         never defaulted to the signer. A retry of bytes already published
         writes nothing (DO NOTHING), so the first delivery stands. */
      bundleId, ed, title ?? null, bundleSha, now, attestorKey, attestorMember ?? null, deliveredBy ?? null,
      gateVersion, sigArmored,
      frozenStrength ? JSON.stringify(frozenStrength) : null,
      required ? JSON.stringify(required) : null,
      JSON.stringify(shas.map((s) => ({ path: s.path, sha256: s.sha256, kind: s.kind, bytes: s.bytes ?? null }))));
    /* Append-only: a hash once published stays answerable forever, across
       any number of re-ratifications. */
    for (const s of shas)
      this.sql.exec(
        `INSERT INTO published_shas (sha256,bundle_id,path,kind,bytes,published) VALUES (?,?,?,?,?,?)
         ON CONFLICT(sha256,bundle_id,path) DO NOTHING`,
        s.sha256, bundleId, s.path, s.kind, s.bytes ?? null, now);
    const graph = this.publishEdges(bundleId, edges, now);
    /* R35: publishing this target turns every name edge a published finding holds to it into a serve edge. */
    const promoted = this.#promoteNamedEdges(bundleId);
    /* IS THE CASE EDITION COMPLETE? A case edition is servable as a container
       only when every member finding has been ratified — each on its own
       bytes, because the finding is the unit of truth. Until then the edition
       EXISTS and is stated as incomplete, which is honest: the findings that
       did ratify are published and answerable, and the container that would
       claim to carry all of them is not yet assemblable. */
    const caseState = caseId ? this.caseEditionState(caseId, cEd, group) : null;
    /* CASE-5: `edition` here is and always was THE MEMBER'S — this method
       commits one bundle. `caseEdition` is stated beside it rather than left
       to be inferred from `case.edition`, because the control plane's
       container assembler branches on the pair and an assembler reading one
       number for two altitudes is the defect this item exists to remove. */
    /* D-309 / IC-74: `caseId` and `caseEdition` keep their names and are the
       SOLE membership or ABSENT. A consumer still reading them therefore never
       receives a guess — it receives what it already receives for a loose
       bundle. The old field can only become MORE absent, never wrong. `case`
       (the container state) is served only for a sole membership, because it IS
       one case edition's state and there is no such thing as the state of two.

       `caseCount` IS A NUMBER AND NOT THE LIST, AND THAT IS A RATCHET DOING ITS
       JOB RATHER THAN A COMPROMISE. The first draft returned the memberships as
       a `cases` ARRAY here, and `meaning-bounds.test.mjs` went red: that put
       `op=publish` onto the BARE roster — a collection published off an
       unbounded row source — taking the ceiling 40 -> 41. The ceiling may only
       FALL, and moving it up to accommodate a new read is precisely what it
       exists to prevent, so the answer changed rather than the figure.

       THE OBVIOUS FIX IS THE WRONG ONE AND IS REJECTED EXPLICITLY: bounding the
       list with `limit`/`truncated`, the spelling the bounded roster uses,
       would mean a member could be told their finding serves TWO cases when it
       serves five. **A truncated membership list is a record claiming a finding
       serves fewer cases than it does** — the overclaim class, arriving through
       a pagination convention, in the one item whose whole subject is not
       answering a set-valued question with part of the set.

       SO THE SEPARATION IS: AN ACT ANSWERS ABOUT THE ACT, A READ ENUMERATES.
       `caseCount` tells a caller whether the scalar above is the whole truth —
       which is the one thing they cannot otherwise tell an absent `caseId`
       ("in no case") from a set-valued one ("in several") — and
       `op=publishededitions` / `op=publishedlist` serve the memberships
       themselves, as they already did before this item and with the `cases`
       array this item gave them. Nothing is lost; it is one read away, and it
       is where reads live. */
    return { ok: true, bundleId, bundleSha, edition: ed, existed, ratifiedAt: now, edges: graph,
             ...(promoted ? { namesServed: promoted } : {}),
             caseCount: byCase.length,
             /* A BOOLEAN AND NOT THE LIST, for `caseCount`'s reason exactly and
                measured the same way. The first draft returned `bars` — the
                per-case bars themselves — and `meaning-bounds.test.mjs` moved
                `op=publish` onto the OPAQUE roster: a collection off an
                unbounded row source, inside a conditional SPREAD, so the walk
                could not even bucket it as bare. **An op the classifier cannot
                see is worse than one it grades badly** — that is the state
                `op=airunlog` was in while a ratchet read green over it — so the
                array came off rather than the roster growing a blind spot.
                The FACT survives, which is the part that matters: a member is
                told their finding's bar is undetermined here rather than being
                handed one case's standard as though it were the answer, and
                `published_cases.bar` answers per case for whoever asks. */
             ...(barUndetermined ? { barUndetermined: true } : {}),
             /* D-442: WHERE THIS FINDING'S EDITION AND FROZEN PAIR WERE READ FROM — its own bytes
                (legacy) or the case document(s) pinning them (rule 12) — and whether those
                documents disagreed about the pair (a boolean, for `barUndetermined`'s reason). */
             frozenFrom: memberCarriesBlocks ? "member_bytes" : docFrozen ? "case_document" : "none",
             /* D-442 / rule 12: EVERY case edition pinning these bytes that this ratification
                COMPLETED and that has no container yet, where there is no sole case to carry it as
                `case` (IC-74 keeps `case` for a sole membership only). Before rule 12 a shared sha
                could not arise — each case pinned the bytes its own promotion minted — so a case
                over a finding several cases pin would otherwise never be assembled. An INTERNAL
                hop: the control plane builds each container and forwards none of these states. */
             ...(!caseId && byCase.length ? (() => {
               const pending = byCase.map((one) => this.caseEditionState(one.case_id, Number(one.edition), group))
                 .filter((st) => st && st.complete && !st.manifest_sha);
               return pending.length ? { containerCases: pending } : {};
             })() : {}),
             ...(docFrozen && docFrozen.strengthUndetermined ? { strengthUndetermined: true } : {}),
             ...(caseId ? { caseId, caseEdition: cEd, case: caseState } : {}) };

  }

  /* R35 (ratification R16): publishing a target turns every `name` edge to it FROM A PUBLISHED FINDING into a `serve`
     edge, in the same transaction — the one change R24 permits to a published row. A name edge was classified name
     only because its target was not yet published (a division's disclosures are name-only BY KIND and never turn);
     both ends are now covered by signatures, so serving it states nothing either signature does not. */
  #promoteNamedEdges(targetId) {
    const from = this.#rows(
      `SELECT e.from_bundle, e.kind FROM published_edges e
        WHERE e.to_bundle=? AND e.disclosure='name' AND e.kind NOT IN ('division_parent','division_sibling')
          AND EXISTS (SELECT 1 FROM published_bundles p WHERE p.bundle_id=e.from_bundle)
        ORDER BY e.from_bundle, e.kind`, targetId);
    for (const e of from)
      this.sql.exec(`UPDATE published_edges SET disclosure='serve' WHERE from_bundle=? AND to_bundle=? AND kind=?
                       AND disclosure='name'`, e.from_bundle, targetId, e.kind);
    return from.length;
  }

  /** R22 (K241): commit one case edition from its SIGNED document, inside the caller's transaction: the case's owning
   *  project (at its first edition), the edition's scope, completeness (as the caller computed it from the signed
   *  bytes), bias acknowledgement and bar, the roster with roles and pins, and the signature, signer and deliverer on
   *  its document, whose hash joins the published hashes (D-734). The same signature on an already signed document
   *  answers `existed: true` and writes nothing; any other signed document is `CASE_EDITION_ALREADY_RATIFIED`, and a
   *  case another project owns `CASE_PRODUCTION_DIVERGED`, nothing written. It answers `awaiting` (roster members not
   *  yet published at their pins) and `state`, the case edition's state (`caseEditionState`). Who may sign, the
   *  document's staleness and the flag discharge are ratification's. */
  commitCaseEdition({ case: caseArg = null, caseId = null, edition = null, project = null, scope = null,
                      completeness = null, biasAcknowledgement = null, bar = null, roster = [], sigArmored = null,
                      attestorKey = null, attestorMember = null, gateVersion = null, deliveredBy = null, at = null } = {}) {
    const id = str(caseArg ?? caseId), ed = Number(edition);
    if (!id || !Number.isInteger(ed) || ed < 1 || !str(sigArmored) || !str(attestorKey) || !str(gateVersion)
        || !Array.isArray(roster))
      return { ok: false, reason: "MALFORMED", detail: "a case edition names its case, a positive edition, the signature, "
                                                     + "the attesting key, the gate version and its roster" };
    const members = roster.filter((m) => m && typeof m.bundle_id === "string" && m.bundle_id);
    const doc = this.#one(`SELECT doc_sha, text, sig_armored FROM case_documents WHERE case_id=? AND edition=?`, id, ed);
    if (!doc) return noCaseDocument(id, ed);
    const outcome = (existed) => {
      const awaiting = members.filter((m) => !this.#one(
        `SELECT bundle_id FROM published_bundles WHERE bundle_id=? AND bundle_sha=?`, m.bundle_id, m.version_sha ?? ""))
        .map((m) => m.bundle_id);
      /* D-442: the group is read off the first member's pinned bytes, the field op=ratify passes. */
      const mt = members.length ? this.record.textAtSha(members[0].bundle_id, members[0].version_sha ?? null) : null;
      const grp = mt ? ((parseFrontmatter(mt).data || {}).group ?? null) : null;
      return { ok: true, existed, caseId: id, edition: ed, doc_sha: doc.doc_sha, awaiting,
               state: this.caseEditionState(id, ed, grp) };
    };
    if (doc.sig_armored)
      return doc.sig_armored === sigArmored ? outcome(true)
        : { ok: false, reason: "CASE_EDITION_ALREADY_RATIFIED", caseId: id, edition: ed,
            detail: `case ${id} edition ${ed} is already signed, and a signed edition answers forever; a correction is a `
                  + "new edition" };
    const owner = this.#one(`SELECT project_id FROM cases WHERE case_id=?`, id);
    if (owner && owner.project_id !== (project ?? null))
      return { ok: false, reason: "CASE_PRODUCTION_DIVERGED", caseId: id, edition: ed,
               declared: owner.project_id, signed: project ?? null,
               detail: `case ${id} is ${owner.project_id}'s production and this signed case document names `
                     + `${project}. A case does not change hands between editions (DEC-72).` };
    const when = str(at) || this.#when();
    if (!owner)
      this.sql.exec(`INSERT INTO cases (case_id,project_id,opened) VALUES (?,?,?) ON CONFLICT(case_id) DO NOTHING`,
                    id, project ?? null, when);
    this.sql.exec(
      `INSERT INTO published_cases (case_id,edition,scope,completeness,bias_acknowledgement,bar,opened)
       VALUES (?,?,?,?,?,?,?)
       ON CONFLICT(case_id,edition) DO UPDATE SET scope=excluded.scope,
         completeness=excluded.completeness, bias_acknowledgement=excluded.bias_acknowledgement, bar=excluded.bar`,
      id, ed, typeof scope === "string" ? scope : null, completeness ? JSON.stringify(completeness) : null,
      typeof biasAcknowledgement === "string" ? biasAcknowledgement : null,
      bar && typeof bar === "object" ? JSON.stringify(bar) : null, when);
    /* THE ROSTER AND THE PINS, IN ONE ACT: the publisher authored all N pins in one document and a member signed it,
       so the freeze is one statement somebody made. The ordinal is the roster's own order. */
    members.forEach((m, i) => {
      this.sql.exec(
        `INSERT INTO published_case_members (case_id,edition,ord,bundle_id,version_sha,role)
         VALUES (?,?,?,?,?,?)
         ON CONFLICT(case_id,edition,bundle_id) DO UPDATE SET ord=excluded.ord,
           version_sha=excluded.version_sha, role=excluded.role`,
        id, ed, i, m.bundle_id, m.version_sha ?? null, m.role ?? null);
    });
    /* REC-128: `deliveredBy` is the control plane's reading of the SESSION, written as handed — never defaulted to
       the signer. */
    this.sql.exec(
      `UPDATE case_documents SET sig_armored=?, attestor_key=?, attestor_member=?, gate_version=?, delivered_by=?,
         ratified_at=? WHERE case_id=? AND edition=? AND sig_armored IS NULL`,
      sigArmored, attestorKey, attestorMember ?? null, gateVersion, deliveredBy ?? null, when, id, ed);
    /* D-734 (BOB #36, D-731 (b); BIO_Publication_v0_1.md §4): THE SIGNED DOCUMENT'S OWN HASH IS PUBLISHED, in the same
       act and transaction that signs it, so op=verify answers for the one hash a member signed here. */
    registerCaseDocumentSha(this.sql, id, ed, doc.doc_sha, doc.text, when);
    return outcome(false);
  }

  /* D-734: THE BYTES op=publishedbytes SERVES FOR A `case_document` HASH, read from `case_documents.text` — the signed
     bytes themselves, which never reach the published bucket. Answered ONLY for a sha that BOTH a `case_document` row
     of `published_shas` names AND a RATIFIED case document carries, so an unsigned document's text is unreachable here.
     The control plane re-hashes before serving; this read does not vouch for the bytes. */
  publishedCaseDocumentText(sha) {
    const d = this.#one(
      `SELECT d.case_id, d.edition, d.text FROM case_documents d
         JOIN published_shas p ON p.sha256 = d.doc_sha AND p.bundle_id = d.case_id AND p.kind = 'case_document'
        WHERE d.doc_sha=? AND d.ratified_at IS NOT NULL ORDER BY d.case_id, d.edition LIMIT 1`, String(sha ?? ""));
    return d ? { found: true, case_id: d.case_id, edition: Number(d.edition), text: d.text, path: caseDocumentPath(d.edition) }
             : { found: false };
  }

  /* ---------------------------------------------------------------- R37: the editions a finding is published in */

  /** R37 (K171 (4)): every RATIFIED case edition whose members include `finding`, each with its case, edition, owning
   *  project (null for a case older than DEC-72), the member's pinned version and role, and its frozen pair per axis as
   *  that case's document states it (R7's frozen pair), never composed. `version` keeps the editions pinning that
   *  version, `project` the cases that project owns. An unsigned preparation is never an edition here. The read
   *  `conformance` R2 uses. */
  publishedEditionsOf({ finding = null, version = null, project = null } = {}) {
    const id = str(finding);
    if (!id) return { ok: false, reason: "NO_ID", detail: "publishedEditionsOf requires a finding" };
    const where = [`m.bundle_id=?`, `c.ratified_at IS NOT NULL`], args = [id];
    if (str(version)) { where.push(`m.version_sha=?`); args.push(str(version)); }
    if (str(project)) { where.push(`k.project_id=?`); args.push(str(project)); }
    const rows = this.#rows(
      `SELECT m.case_id, m.edition, m.version_sha, m.role, k.project_id FROM published_case_members m
         JOIN published_cases c ON c.case_id=m.case_id AND c.edition=m.edition
         LEFT JOIN cases k ON k.case_id=m.case_id
        WHERE ${where.join(" AND ")} ORDER BY m.case_id, m.edition LIMIT ?`, ...args, EDITIONS_OF_MAX + 1);
    const truncated = rows.length > EDITIONS_OF_MAX;
    if (truncated) rows.length = EDITIONS_OF_MAX;
    const items = rows.map((r) => {
      const frozen = this.caseDocMemberFrozen(r.case_id, Number(r.edition));
      const own = frozen ? frozen.get(id) || null : null;
      /* A legacy (/1) case froze the pair in the member's own signed bytes: read from that edition's published row. */
      const legacy = !frozen && r.version_sha
        ? this.#one(`SELECT strength FROM published_bundles WHERE bundle_id=? AND bundle_sha=? ORDER BY edition LIMIT 1`,
                    id, r.version_sha) : null;
      const rowsOfPair = own ? own.strength : legacy && legacy.strength ? safeJson(legacy.strength) : null;
      const strength = {};
      for (const a of Array.isArray(rowsOfPair) ? rowsOfPair : [])
        if (a && a.axis) strength[a.axis] = { state: a.state ?? null, grade: a.grade ?? null };
      return { case: r.case_id, edition: Number(r.edition), project: r.project_id ?? null,
               version_sha: r.version_sha ?? null, role: r.role ?? null,
               strength: Array.isArray(rowsOfPair) ? strength : null };
    });
    return { ok: true, finding: id, items, limit: EDITIONS_OF_MAX, truncated };
  }

  /* ---------------------------------------------------------------- moved from the store */
  /* ================== CASE-4 / DEC-72: THE CASE RELATION ====================
   *
   * THE ONE PREDICATE THAT REPLACES `current_state === "published"`, and there
   * is exactly one of it for the reason #citesInto above has exactly one of
   * itself: five guards and an affordance all used to ask the state word, and
   * five copies of a question is five chances to answer it differently.
   *
   * Bob's ruling (DEC-72) ends `published` as an inquiry lifecycle state:
   * *"A finding's lifecycle ends at `concluded`; publication is the case
   * relation."* So every act that refused because a document was published —
   * cannot divide, cannot restructure, cannot move a version, a basis leg that
   * is FROZEN rather than working, and reopen's own gate — now asks this.
   *
   * IT IS ANSWERED BY THE PIN, WHICH IS CASE-5's OWN MECHANISM READ THE OTHER
   * WAY AND NOT A SECOND ONE. CASE-5 unslaved a member's edition from its case's
   * and made `caseEditionState` resolve a member BY ITS PIN
   * (`published_bundles.bundle_sha = published_case_members.version_sha`). Asked
   * from the member's side, the same equality answers "is my CURRENT version the
   * one some case froze". It has to be the current version and not merely "has
   * this id ever been published": a finding that was published, reopened and
   * revised is NOT a case member any more — the case holds the old version
   * forever and the working document has moved on — and an id-only test would
   * refuse restructuring on a document the group is legitimately working again.
   *
   * TWO ARMS, BECAUSE PUBLICATION IS TWO ACTS.
   *
   *   PINNED — the ratified relation. The roster row names this document's
   *   current `bundle_sha`. This is the relation as the RECORD holds it, and it
   *   exists only after `op=ratify`, because the roster and the pin are both
   *   committed by the ratify committer out of the SIGNED BYTES and out of
   *   nothing else (publishEdges' doctrine).
   *
   *   PREPARED — the window between `op=publish` and `op=ratify`, where the case
   *   exists in the bytes and NOWHERE ELSE. It is read off the document's own
   *   frontmatter pair (`case_id`, `case_edition`) against `published_cases`,
   *   and it is a REFUSAL INPUT ONLY: nothing here commits a case fact, which is
   *   what keeps it clear of CASE-5b's wall. Without this arm the removal of the
   *   state word would OPEN that window — today `publishCase()` stamps
   *   `published` immediately, so a member cannot restructure a prepared
   *   document between the two acts, and a guard that stopped biting there would
   *   let a member publish under one composed strength and ratify under another.
   *   That is a loosened publication fence reached through a lifecycle change,
   *   which is precisely the class this record refuses to ship quietly.
   *
   * The prepared arm ENDS at `op=reopen`, which clears `case_edition` — the same
   * act that ended the `published` state before, doing the same job through the
   * relation instead of through the word.
   *
   * Returns the pinned rows themselves rather than a bare boolean, because the
   * revision flag below needs to know WHICH case editions froze WHICH hash, and
   * deriving that twice from two queries is how two answers start disagreeing. */
  caseRelation(bundleId) {
    const b = this.#headRow(bundleId);
    if (!b) return { member: false, pinned: [], prepared: null };
    const pinned = this.#rows(
      `SELECT case_id, edition, version_sha, role FROM published_case_members
        WHERE bundle_id=? AND version_sha=? ORDER BY case_id, edition`, bundleId, b.bundle_sha);
    let prepared = null;
    const claim = this.#caseClaimInBytes(bundleId);
    if (claim) {
      const row = this.#one(
        `SELECT ratified_at FROM published_cases WHERE case_id=? AND edition=?`,
        claim.case_id, claim.edition);
      if (!row || row.ratified_at === null || row.ratified_at === undefined) prepared = claim;
    }
    return { member: pinned.length > 0 || prepared !== null, pinned, prepared };
  }

  /* THE PREPARED CLAIM — CORRECTED BY CASE-5b, AND IT READS THE OTHER DOCUMENT
   * NOW RATHER THAN THIS ONE.
   *
   * WHAT IT USED TO DO AND WHY THAT WAS RIGHT: it read the member's own
   * frontmatter pair (`case_id`, `case_edition`), because op=publish stamped
   * both into every member and op=reopen cleared the second — so the pair said
   * "these bytes assert membership of a specific edition of a specific case",
   * which was true of exactly the documents that used to wear `published`.
   *
   * WHY IT IS WRONG NOW: a finding's bytes no longer name a case. Left as it
   * was, this method would return null for every document published after
   * CASE-5b — and since it is the PREPARED arm of `caseRelation`, the window
   * between op=publish and ratification would stop being guarded. That window is
   * exactly where a member could publish under one composed strength and ratify
   * under another, which the comment above names as a loosened publication fence
   * reached through a change to something else. Corrected, not dropped.
   *
   * WHERE THE CLAIM LIVES INSTEAD: the CASE DOCUMENT. op=publish authors one per
   * case edition, naming every member AT THE SHA it just promoted them to. So
   * "is this document prepared into an unratified case edition" is answered by
   * asking whether an unratified case document pins THIS document's CURRENT
   * bundle_sha — the same current-version discipline the pinned arm already
   * takes, for the same reason: a finding that was prepared, then revised, has
   * moved on, and the abandoned preparation must not go on refusing acts.
   *
   * IT IS A REFUSAL INPUT ONLY. Nothing here commits a case fact, which is what
   * kept the old version clear of CASE-5b's wall and what keeps this one clear
   * of it too. Returns null when no claim is made.
   *
   * REC-130's SWEEP, stated here because this is the other reader of an
   * UNSIGNED case document: it does NOT carry the standing rule, and need not.
   * It answers a FINDING-side question for acts on a finding the caller can
   * already reach, and every refusal it feeds (ALREADY_A_CASE_MEMBER,
   * PUBLISHED_CANNOT_DIVIDE / _RESTRUCTURE / _MOVE_VERSION, the reopen gate, the
   * affordance fact `case_member`) names the TARGET and never the case id, the
   * scope or anything the case document says. Checked at each site 2026-09-18.
   * If a refusal ever starts naming the case, it inherits the rule. */
  #caseClaimInBytes(bundleId) {
    const b = this.#headRow(bundleId);
    if (!b) return null;
    for (const d of this.#rows(
      `SELECT case_id, edition, text FROM case_documents WHERE ratified_at IS NULL ORDER BY case_id, edition`)) {
      const fm = parseFrontmatter(d.text).data || {};
      const rows = Array.isArray(fm.case_roles) ? fm.case_roles : [];
      if (rows.some((r) => r && r.target === bundleId && r.version_sha === b.bundle_sha))
        return { case_id: d.case_id, edition: Number(d.edition) };
    }
    return null;
  }

  /* ============= CASE-4 / DEC-72: THE REVISION FLAG, SET AT THE MINT ==========
   *
   * `CASE-AS-PRODUCTION.md`: *"A case is a frozen, signed edition, honest as of
   * its date. When a member finding is later revised (new version minted), the
   * containing cases are FLAGGED, never silently updated and never automatically
   * re-published — the cascade doctrine (set-but-never-clear, re-evaluation
   * offered) one level up. New editions are each owning project's deliberate
   * act."*
   *
   * WHERE IT IS CALLED FROM AND WHY THAT IS THE WHOLE DESIGN. It is called from
   * `promote()`, which is the ONE write in this plane that mints a version, with
   * the sha the new version is REPLACING. Every route that can revise a member —
   * reopening it, concluding it again, restructuring its basis, moving a
   * reading, publishing a second edition — arrives at `promote`, so one call
   * site catches all of them and no future act can revise a member past a flag
   * that was only wired into the acts somebody thought of.
   *
   * IT NEEDS NO SECOND MECHANISM TO NOTICE A REVISION, and this is CASE-5's
   * gift rather than this item's cleverness. CASE-5 made a member resolve BY ITS
   * PIN, so a revision is definitionally a version whose hash is not the one the
   * case froze. The condition is therefore one equality over a column that
   * already exists — `published_case_members.version_sha = <the sha being
   * replaced>` — and every case edition holding that pin is flagged. A second
   * mechanism (a marker in the bytes, a state, a derived "has moved" read) would
   * be a second authority for a fact the pin already holds.
   *
   * THE OBSERVATION IS DERIVED; THE FLAG IS WRITTEN DOWN. A derived-on-read flag
   * was the first design and it is wrong for exactly one reason: IT CLEARS
   * ITSELF. Let the head and the pin agree again by any route and the derived
   * answer vanishes with nobody having acted — D-79's ruling one altitude up (a
   * finding that disappears is indistinguishable from one that was never made,
   * so it AGES rather than vanishes). A flag that stops being raised is
   * indistinguishable from a project that dealt with it, which is the whole
   * thing the cascade doctrine exists to prevent. So the row is written once, at
   * the instant the revision mints, and nothing in this file deletes one.
   *
   * ONE ROW PER (case edition, member, revised version). A member that revises
   * three times against one frozen edition raises three rows: each revision is
   * its own fact and collapsing them would let the second and third disappear
   * into the first. `ON CONFLICT DO NOTHING` because the key is exactly the
   * event's own identity — re-minting the same sha against the same edition is
   * the same event, not a second one.
   *
   * THE FLAG IS NOT AN ASSERTION ABOUT THE CASE AND THAT IS DELIBERATE. CASE-5
   * named the wall: every case FACT this plane commits is committed from the
   * SIGNED BYTES, and there is no signature over a case for an unsigned one to
   * rest on. Nothing written here is a case's claim. Both halves of the row are
   * observations this plane made itself from two hashes it already holds — the
   * pin (committed from signed bytes at ratification) and the new head — so the
   * record is saying "these two hashes differ", which is a measurement and not
   * an attribution. The DISCHARGE has the same property for the same reason: it
   * is stamped by a ratified edition, which is signed. */
  flagCasesOnRevision(bundleId, replacedSha, when) {
    if (!bundleId || !replacedSha) return [];
    const frozen = this.#rows(
      `SELECT case_id, edition FROM published_case_members
        WHERE bundle_id=? AND version_sha=? ORDER BY case_id, edition`, bundleId, replacedSha);
    if (!frozen.length) return [];
    const head = this.#headRow(bundleId);
    const revised = head ? head.bundle_sha : null;
    /* A revision that did not actually move the hash is not a revision. The
       guard is cheap and it is the one shape that would write a flag saying
       nothing moved. */
    if (!revised || revised === replacedSha) return [];
    const raised = [];
    for (const fz of frozen) {
      /* THE OWNING PROJECT, read from the case IDENTITY (`cases` is keyed on
         case_id alone — CASE-1's sharpest call, so a case does not change hands
         between editions). NULL for a case published before DEC-72, which is the
         honest answer CASE-1's schema comment already established and not a gap:
         such a case genuinely has no owning project, and inventing one would be
         an attribution to get past a gate. */
      const owner = this.#one(`SELECT project_id FROM cases WHERE case_id=?`, fz.case_id);
      this.sql.exec(
        `INSERT INTO case_revision_flags
           (case_id, edition, bundle_id, pinned_sha, revised_sha, project_id, since)
         VALUES (?,?,?,?,?,?,?)
         ON CONFLICT(case_id, edition, bundle_id, revised_sha) DO NOTHING`,
        fz.case_id, fz.edition, bundleId, replacedSha, revised,
        owner ? owner.project_id : null, when);
      raised.push({ case_id: fz.case_id, edition: fz.edition, bundle_id: bundleId,
                    pinned_sha: replacedSha, revised_sha: revised,
                    project_id: owner ? owner.project_id : null, since: when });
    }
    return raised;
  }

  /* ============ CASE-4 / DEC-72: THE DISCHARGE, AND ITS SCOPE ===============
   *
   * *"New editions are each owning project's deliberate act."* So the act that
   * discharges a flag is a NEW RATIFIED EDITION OF THAT CASE, and it is
   * deliberately an act that already exists rather than a bare acknowledgement
   * op. Two reasons, and the second is the load-bearing one:
   *   (1) the design names it, in those words; and
   *   (2) a bare acknowledgement op would commit a CASE-LEVEL assertion — "this
   *       project has considered this revision" — from an UNSIGNED REQUEST,
   *       which is the attribution class CASE-5 hit, named and refused, and
   *       which CASE-5b exists to open properly. A ratified edition is signed,
   *       so the discharge rests on a signature exactly as the pin does.
   *
   * SCOPED TO case_id AND NOTHING WIDER, WHICH IS D-266's RULING ARRIVING HERE:
   * a disposition is scoped to the key's own subject. The WHERE clause names one
   * case, so a project acting on ITS case reaches no other project's rows — and
   * where several flagged cases are owned by several projects, one project
   * acting leaves every other project's flags outstanding. That is structural
   * rather than a rule somebody has to remember, because there is no statement
   * anywhere that could clear a flag carrying a different case_id.
   *
   * IT IS A DISCHARGE AND NOT A CLEAR, WHICH IS THE LITERAL READING OF
   * SET-BUT-NEVER-CLEAR. The row is not deleted and the flag is not unset: the
   * ACT is added to it. What the record then holds is that the flag was raised,
   * and that this edition, published by this member at this instant, is what the
   * owning project did about it. A row with acted_at NULL is outstanding; a row
   * with acted_at set is history, and history is not absence.
   *
   * ONLY OUTSTANDING ROWS ARE STAMPED (`acted_at IS NULL`), so a second edition
   * never re-describes what the first one discharged. */
  dischargeCaseFlags(caseId, edition, by, when) {
    if (!caseId) return 0;
    const outstanding = this.#rows(
      `SELECT case_id, edition, bundle_id, revised_sha FROM case_revision_flags
        WHERE case_id=? AND acted_at IS NULL`, caseId);
    if (!outstanding.length) return 0;
    this.sql.exec(
      `UPDATE case_revision_flags SET acted_at=?, acted_by=?, acted_edition=?
        WHERE case_id=? AND acted_at IS NULL`, when, by ?? null, edition ?? null, caseId);
    return outstanding.length;
  }

  /** CASE-4 / DEC-72: THE READ. `op=caseflags`.
   *
   * A flag nobody can read is a flag that does not exist, and the whole point of
   * set-but-never-clear is that the outstanding ones stay visible until an
   * owning project acts. Answers by case, by member finding, or over the whole
   * store, and it reports DISCHARGED rows too rather than filtering them out —
   * a project that acted is a fact about the record, and an answer that showed
   * only the outstanding ones would make the discharge look like a deletion,
   * which is the thing this design refuses.
   *
   * NOT GATED BY VIEWER, and that is a decision with a reason rather than an
   * omission: every fact in a row here is already public. The case editions and
   * their rosters are served to anybody by `op=publishedcase`, the pinned hash
   * is in the container manifest a stranger verifies against, and the revised
   * hash is a published version's own. Gating it would withhold from a member
   * what the published record already tells a stranger. */
  caseFlags({ caseId = null, target = null, outstandingOnly = false, limit = null } = {}) {
    const where = [], args = [];
    if (caseId) { where.push(`case_id=?`); args.push(String(caseId).trim()); }
    if (target) { where.push(`bundle_id=?`); args.push(String(target).trim()); }
    if (outstandingOnly) where.push(`acted_at IS NULL`);
    /* REC-60 / REC-66 / D-225: THE SCAN IS BOUNDED AND THE BOUND IS PUBLISHED,
       in the spelling the plane already uses — `limit` beside `truncated`. This
       table grows with every revision of every published member and has no
       natural ceiling, so an unbounded read here would be exactly the class
       `meaning-bounds.test.mjs` holds a ratchet over: a collection published off
       a row source nothing bounds. ONE MORE ROW IS ASKED FOR THAN MAY BE USED,
       which is `deriveConnections`' own discipline: it is the only way the
       answer can say that more existed without a second count, and a `truncated`
       derived from a full page would be a guess.
       THE CAP IS THE CALLER'S TO LOWER AND NOT TO RAISE, in `op=readingname`'s
       own shape — which `bounds.test.mjs` names as the model every capped op was
       brought into line with, and which is the reason this read takes a `limit`
       at all: a ceiling no caller can address is a bound nothing can drive, and
       an undriven bound is one that grows silently. An over-ask is answered AT
       THE CEILING and the ceiling is what is published, so a caller is never told
       they got more than they did. */
    const cap = Math.max(1, Math.min(Number(limit) || CASE_FLAGS_LIMIT, CASE_FLAGS_LIMIT));
    const rows = this.#rows(
      `SELECT case_id, edition, bundle_id, pinned_sha, revised_sha, project_id, since,
              acted_at, acted_by, acted_edition
         FROM case_revision_flags
        ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
        ORDER BY since, case_id, edition, bundle_id
        LIMIT ?`, ...args, cap + 1);
    const truncated = rows.length > cap;
    if (truncated) rows.length = cap;
    const flags = rows.map((r) => ({
      case_id: r.case_id, edition: r.edition, bundle_id: r.bundle_id,
      pinned_sha: r.pinned_sha, revised_sha: r.revised_sha,
      /* THE PROJECT THAT MUST ACT. NULL is STATED and never elided: a case
         published before DEC-72 has no owning project, and a reader must be
         able to tell "nobody owns this" from "somebody does and we lost it". */
      project_id: r.project_id ?? null,
      since: r.since,
      outstanding: r.acted_at === null || r.acted_at === undefined,
      acted: (r.acted_at === null || r.acted_at === undefined) ? null
        : { at: r.acted_at, by: r.acted_by ?? null, edition: r.acted_edition ?? null },
    }));
    return { ok: true, ...(caseId ? { caseId: String(caseId).trim() } : {}),
             ...(target ? { target: String(target).trim() } : {}),
             flags, count: flags.length,
             /* THE BOUND, BESIDE THE ANSWER. `count` is what was returned and
                `limit` is what could be; `truncated` says more exists, measured
                by the extra row asked for rather than by comparing a full page
                to a ceiling. A truncated answer's `outstanding` and
                `projects_owing` are therefore about THIS PAGE and say so. */
             limit: cap, truncated,
             outstanding: flags.filter((x) => x.outstanding).length,
             /* WHICH PROJECTS STILL OWE AN ACT, deduplicated, because "each
                owning project acts" is the design's condition and a reader
                should not have to compute it. A case whose project is unknown
                appears as null in this list rather than being dropped. */
             projects_owing: [...new Set(flags.filter((x) => x.outstanding)
               .map((x) => x.project_id))].sort((a, b) => String(a) < String(b) ? -1 : 1),
             /* SET-BUT-NEVER-CLEAR, SAID IN THE ANSWER. A surface rendering this
                must not offer a "dismiss" control, and a reader must not read a
                discharged row as a deleted one. */
             doctrine: "a revision flag is SET AND NEVER CLEARED: it is DISCHARGED by the owning "
                     + "project publishing a new edition of that case, which is recorded beside it "
                     + "rather than replacing it. A case with several owning projects is not "
                     + "discharged by one of them acting (DEC-72, D-266's scoping, D-79's ageing)." };
  }
  /* CASE-5b / DEC-72: THE FACTS THE CASE RATIFICATION NEEDS, out of the one
     place that holds the rows — `gateFacts`' own shape one altitude up, and for
     `gateFacts`' own reason: the gate and the write path must judge against the
     same published record, so they read it from one method rather than probing
     for it separately.

     `priorCase` IS C-21.1's FACT AT CASE ALTITUDE — what the previous RATIFIED
     edition of THIS case asserted about its own limits and its own bias. Passing
     it null does not soften C-21.1, it blinds it, which is the sentence `runGate`
     already carries about `publishedRegistry`.

     THE TEXT COMES BACK WHOLE. A ceremony whose subject is "a thing a member
     actually reviewed" cannot hand the member a summary of the thing. */
  caseDocumentFacts(caseId, edition, viewer, secretSha = null) {
    const id = String(caseId ?? "").trim();
    const ed = Number(edition);
    if (!id || !Number.isInteger(ed) || ed < 1) return { ok: false, reason: "MALFORMED" };
    const doc = this.#one(
      `SELECT case_id, edition, doc_sha, text, authored_at, authored_by,
              sig_armored, attestor_key, attestor_member, delivered_by, gate_version, ratified_at
         FROM case_documents WHERE case_id=? AND edition=?`, id, ed);
    if (!doc) return noCaseDocument(id, ed);
    /* REC-130 / IC-141, 2026-09-18 — AN UNSIGNED CASE DOCUMENT IS WORKING
       MATERIAL, AND IT ANSWERS ONLY TO STANDING IN ITS OWNING PROJECT. DECIDED by
       BOB #14 as an application of the publication fence (unratified working
       material never crosses to the public), no new doctrine. CASE-5b answered it
       to anybody, and case ids come off a sequence, so a stranger could walk
       CASE-2026-0001, -0002, … and read every group's scope, roster, exclusions
       and bias acknowledgement before any member had signed a word of it.

       ABSENT AND INVISIBLE ARE ONE ANSWER — `contentRead`'s rule and
       `#queueCaseFor`'s. A caller without standing gets the object the branch
       above returns, built by the SAME function from the SAME two values, so the
       two cannot drift apart: a refusal saying FORBIDDEN or NOT_PERMITTED would
       tell an enumerator that the case exists, which is the one thing the
       enumerator is looking for.

       A RATIFIED document is untouched: it is signed published bytes a stranger
       is entitled to check, and the stranger-verification path must not depend
       on this instance's goodwill.

       THIS SITE SERVES BOTH `op=casedocument` AND `op=caseratify`'s facts read,
       and the second is not incidental. `caseratify` answers a session member
       CASE_RATIFY_STALE with the document's `expected` sha, and
       TESTIMONY_CASE_UNPUBLISHABLE with finding ids, so a member of ANOTHER
       project could otherwise probe an unsigned case through the signing op. A
       member cannot sign what they may not read, so the one gate covers both. */
    /* REC-126 / IC-145 — AND A LIVE GRANT HOLDER FOR THIS CASE EDITION, which is the
       party §6A.2's precondition names beside project standing and REC-130 left for
       this item to build. The grant is asked through `#liveReviewGrant`, the one
       predicate the review copy itself reads, so a revoked grant, a grant whose
       draft has moved to another edition and a secret that never existed are all
       answered here exactly as a stranger is: the no-such-document object above. */
    if (!doc.ratified_at && !this.hasCaseStanding(doc, viewer)
        && !this.#grantAdmitsCaseEdition(secretSha, doc.case_id, doc.edition))
      return noCaseDocument(id, ed);
    return {
      ok: true, doc,
      signers: this.membership.attestingKeys(),   /* membership R70: the ONE predicate (D-158) */
      priorCase: this.#one(
        `SELECT edition, completeness, bias_acknowledgement FROM published_cases
          WHERE case_id=? AND edition<? AND ratified_at IS NOT NULL ORDER BY edition DESC LIMIT 1`, id, ed),
      /* MK-1 (A): whether any finding THIS DOCUMENT names rests on a member's
         authored observation (C-53.12). The roster is read from the document's
         own bytes — `case_findings`, the same field `ratifyCaseDocument` commits
         from — so the fence judges exactly what the signature would publish. */
      testimony: this.basisVersions.testimonyReach((() => {
        const cf = (parseFrontmatter(doc.text).data || {}).case_findings;
        return (Array.isArray(cf) ? cf : []).map((x) => String(x ?? "").trim());
      })()),
      /* MK-7 / §4.4: the attribution this document states for each observation it reaches, beside what the
         authors' acts say now and which reached observations still name their author (§4.1) — the facts
         op=caseratify's attribution gate judges, read off the same bytes the signature would publish. */
      attribution: this.attributionFacts(doc),
      /* D-442 / BIO_Publication_v0_1.md §3 rule 12 (d): each roster member's `basis` AT THE BYTES
         THIS DOCUMENT PINS, for the C-2.8 arms that followed the frozen pair into the case document
         (the testimony row, the per-ground rows). Read at the PIN and never at the working version:
         the frozen pair is this case's reading of those bytes. A member whose pinned bytes this store
         cannot produce is ABSENT from the map, which leaves those two arms unasked for it rather than
         asked of a basis nobody pinned — `checkCaseDocument` reads absence as absence. */
      memberBasis: this.#pinnedMemberBasis(doc.text),
    };
  }

  #pinnedMemberBasis(docText) {
    const dfm = parseFrontmatter(String(docText || "")).data || {};
    const out = {};
    for (const r of Array.isArray(dfm.case_roles) ? dfm.case_roles : []) {
      if (!r || typeof r !== "object" || typeof r.target !== "string") continue;
      const text = this.record.textAtSha(r.target, typeof r.version_sha === "string" ? r.version_sha : null);
      if (text === null) continue;
      const mfm = parseFrontmatter(text).data || {};
      out[r.target] = Array.isArray(mfm.basis) ? mfm.basis : [];
    }
    return out;
  }

  /* D-442 — `case_exclusions`, projected WHOLE for one case edition from its stored document, by the
     delete-then-insert discipline every projection here takes. A signed document cannot change, so a
     re-projection of one only rewrites the same rows. */
  projectCaseExclusions(caseId, edition) {
    const d = this.#one(`SELECT text FROM case_documents WHERE case_id=? AND edition=?`, caseId, Number(edition));
    this.sql.exec(`DELETE FROM case_exclusions WHERE case_id=? AND edition=?`, caseId, Number(edition));
    if (!d || typeof d.text !== "string") return;
    const dfm = parseFrontmatter(d.text).data || {};
    const comp = dfm.completeness && typeof dfm.completeness === "object" ? dfm.completeness : {};
    const rows = Array.isArray(dfm.completeness_excluded) ? dfm.completeness_excluded : [];
    const project = typeof dfm.case_project === "string" && dfm.case_project !== "null" ? dfm.case_project : null;
    const members = (Array.isArray(dfm.case_roles) ? dfm.case_roles : [])
      .filter((r) => r && typeof r === "object" && typeof r.target === "string");
    for (const m of members)
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row || typeof row !== "object") continue;
        this.sql.exec(
          `INSERT INTO case_exclusions (case_id,edition,bundle_id,ord,member_edition,project_id,target_id,description,reason,author,at)
           VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
          caseId, Number(edition), m.target, i, Number.isInteger(m.edition) ? m.edition : null, project,
          typeof row.target === "string" ? row.target : null,
          typeof row.description === "string" ? row.description : "",
          typeof row.reason === "string" ? row.reason : "",
          typeof comp.author === "string" ? comp.author : "",
          typeof comp.at === "string" ? comp.at : "");
      }
  }

  /* D-442 / BIO_Publication_v0_1.md §3 rule 12 — WHAT A CASE DOCUMENT STATES ABOUT ONE MEMBER, OR
     NULL FOR A LEGACY (/1) DOCUMENT, whose members carried these blocks in their own bytes (rule 12
     (e)). THE ONE READER of `case_roles[].edition`, `case_strength` and `case_strength_grounds`:
     the ratify committer and `caseEditionState` both ask here, so the per-case frozen facts are
     parsed one way. `strength` is the member-bytes block's row shape exactly (`axis`, `state`,
     `grade`, `weakest`, `load_bearing`, `population`, `detail`), so every consumer of the old
     `published_strength` reads it unchanged. */
  caseDocMemberFrozen(caseId, edition) {
    const d = this.#one(`SELECT text FROM case_documents WHERE case_id=? AND edition=?`, caseId, Number(edition));
    if (!d || typeof d.text !== "string") return null;
    const dfm = parseFrontmatter(d.text).data || {};
    if (!caseDocumentStatesMemberBlocks(dfm)) return null;
    const strip = ({ target, ...rest }) => rest;
    const rowsOf = (key, m) => (Array.isArray(dfm[key]) ? dfm[key] : [])
      .filter((r) => r && typeof r === "object" && String(r.target ?? "") === m).map(strip);
    const out = new Map();
    /* The case's `## What This Excludes`, which a member published under rule 12 no longer carries
       in its own bytes: served beside each member so the public read prints the CASE's words and
       says so (op=publishedcase's `excludes_from`). */
    const excludes = caseSectionText(parseFrontmatter(d.text).body || "", "## What This Excludes");
    for (const r of Array.isArray(dfm.case_roles) ? dfm.case_roles : []) {
      if (!r || typeof r !== "object" || typeof r.target !== "string") continue;
      out.set(r.target, { edition: Number.isInteger(r.edition) ? r.edition : null, excludes,
                          version_sha: typeof r.version_sha === "string" ? r.version_sha : null,
                          strength: rowsOf("case_strength", r.target),
                          grounds: rowsOf("case_strength_grounds", r.target) });
    }
    return out;
  }


  /* REC-130: STANDING IN THE OWNING PROJECT, ASKED THROUGH D-15's ONE
     COMPILATION POINT rather than restated. `viewerPredicate` already answers
     "may this viewer see this project" — an identified member sees it if they
     participate in it (invited, joined or leaving) or are an active
     administrator (Membership Architecture 7.3/7.9), an instance-level machine
     credential sees it unfiltered, and anything else is DENY. A second
     implementation of that rule here would be this repository's most-repeated
     defect class, so the predicate is run against the project's own bundle row.

     THE OWNING PROJECT is every project the record names for this case: the
     `cases` row, written at an earlier edition's ratification, and the document's
     own `case_project`, which is what this edition's signature would commit.
     Standing is required in EACH — they agree on every case the ceremony can
     produce, and where they did not, reading the document would need both.

     A DOCUMENT NAMING NO PROJECT answers only the unfiltered scope. The ceremony
     cannot author one (DEC-72 removed the project-less path before CASE-5b built
     case documents), so this arm is defence rather than policy, and it fails
     closed for every identified member rather than guessing an owner. */
  hasCaseStanding(doc, viewer) {
    const gate = viewerPredicate(viewer);
    if (gate.scope === "DENY") return false;
    if (gate.scope === "member") return true;
    const named = String((parseFrontmatter(doc.text).data || {}).case_project ?? "").trim();
    const row = this.#one(`SELECT project_id FROM cases WHERE case_id=?`, doc.case_id);
    const projects = [...new Set([named, row?.project_id ?? ""].filter(Boolean))];
    if (!projects.length) return false;
    return projects.every((p) => !!this.#one(
      `SELECT 1 AS seen FROM bundles b WHERE b.bundle_id=? AND b.object_type='project' AND ${gate.sql}`,
      p, ...gate.args));
  }

  /* Read-only, for the member who is about to sign — and, once RATIFIED, for
     anybody, because a ratified document is the signed bytes a stranger is
     entitled to check (the posture `op=publishedbytes` takes one altitude
     down). REC-130 CORRECTED the other half of this comment: it said "scoped to
     nothing" of the UNRATIFIED document too, which was a mechanism choice with
     no ruling behind it. The scoping now lives in `caseDocumentFacts`. */
  caseDocument(caseId, edition, viewer, secretSha = null) {
    const facts = this.caseDocumentFacts(caseId, edition, viewer, secretSha);
    if (!facts.ok) return facts;
    const d = facts.doc;
    return { ok: true, case_id: d.case_id, edition: d.edition, doc_sha: d.doc_sha, text: d.text,
             authored_at: d.authored_at, authored_by: d.authored_by,
             /* THE WINDOW, STATED. `ratified: false` is a real state of this
                record — a ceremony authored and not yet signed — and it is named
                rather than inferred from a null. */
             ratified: !!d.ratified_at, ratified_at: d.ratified_at ?? null,
             sig_armored: d.sig_armored ?? null, attestor_member: d.attestor_member ?? null,
             /* REC-128: who DELIVERED the signature, beside who MADE it. Null
                while the document is unsigned — there is no delivery yet, which
                is a different fact from a delivery nobody recorded. */
             delivered_by: d.ratified_at ? this.#deliveredBy(d) : null,
             gate_version: d.gate_version ?? null,
             /* REC-219 / D-579(a) (BOB #34, 2026-09-25 02:30Z): WHICH VERSION EACH CITATION RESTS ON, as the
                SIGNED BYTES say it. A /4 document signed its edges with their versions, and they are read
                straight out of the bytes above, never recomputed. An older document signed NO edge and no
                version, so the answer states that rather than reading the project's edges as they stand
                today — which would be the case claiming citations it never signed — and it is never
                re-signed (rule 1). */
             citations: signedCitations(d.text) };
  }

  /** MK-7 / §4.1's discriminator — WHICH OF THESE OBSERVATIONS STILL NAME THEIR AUTHOR IN THEIR OWN FILES.
   *  An observation written before MK-6 carries the member in `data/provenance.json` and the Session Log,
   *  and §4.1 keeps it FENCED: the level lives outside the bundle, so no level can hide a name the bundle
   *  itself prints. Asked STRUCTURALLY of the fields MK-6 moved — every provenance document's `author`, every
   *  chain hop's `who`, every `| Authored |` Session Log line — each must be `observerRef(<id>)`. A file
   *  that cannot be read or parsed is NOT in reference form: undetermined is fenced, never let through. */
  observationsNamingAuthor(ids) {
    const out = [];
    for (const id of [...new Set((Array.isArray(ids) ? ids : []).filter((x) => typeof x === "string" && x))].slice(0, 200)) {
      const ref = observerRef(id);
      const prov = this.#fileText(id, "data/provenance.json");
      const md = this.#fileText(id, "bundle.md");
      let form = false;
      try {
        const docs = JSON.parse(String(prov && prov.content || "")).documents;
        const authored = String(md && md.content || "").split("\n").filter((l) => /^### Session \S+ \| Authored \| /.test(l));
        form = Array.isArray(docs) && docs.length > 0 && authored.length > 0
          && docs.every((d) => d && d.author === ref
               && (Array.isArray(d.provenance_chain) ? d.provenance_chain : []).every((h) => h && h.who === ref))
          && authored.every((l) => l.endsWith(`| Authored | ${ref}`));
      } catch { form = false; }
      if (!form) out.push(id);
    }
    return out;
  }

  /** MK-7 / §4.3 — THE LEVEL IN FORCE FOR ONE OBSERVATION AT ONE CASE EDITION: the author's act at this
   *  edition, or else the latest earlier edition's (a later edition INHERITS the prior choice until the
   *  author changes it). Earlier editions of a case are ratified ones — an edition number is only spent
   *  by ratification — so an inherited level is one a published edition already carried. None is none:
   *  nothing is ever prefilled. */
  attributionInForce(caseId, edition, observation) {
    return this.#one(`SELECT level, edition, chosen_by, chosen_at FROM observation_attributions
                       WHERE case_id=? AND bundle_id=? AND edition<=? ORDER BY edition DESC LIMIT 1`,
                     caseId, observation, edition) || null;
  }

  /** MK-7 — EVERY OBSERVATION ONE CASE DOCUMENT REACHES, at any depth, in first-reached order (§4.3: one
   *  level per observation per edition however many findings reach it, a `via` observation included). */
  #observationsReachedBy(docText) {
    const cf = (parseFrontmatter(String(docText || "")).data || {}).case_findings;
    const reach = this.basisVersions.testimonyReach((Array.isArray(cf) ? cf : []).map((x) => String(x ?? "").trim()));
    return [...new Set([...reach.self, ...reach.via.map((v) => v.observation)])];
  }

  /** MK-7 / §4.3, §4.6 — THE EDITION'S ATTRIBUTION STATEMENTS, DERIVED FROM THE ACTS AND NEVER FROM THE
   *  OWNER'S INPUT. One row per reached observation: the level in force and what that level PUBLISHES —
   *  `group` the producing group (null when this store records none, stated in the prose), `project` the
   *  publishing project, `cover` the administrator's cover for the author, `name` the author's handle. The
   *  author's member id is never a value here. A level whose published value cannot be produced (a `name`
   *  whose author has since lost their handle) is UNCHOSEN with its reason: publishing it at any other value
   *  would be the default §4 forbids. */
  attributionStatements(caseId, edition, project, observations = undefined) {
    /* R17: with no observations named, those the edition's own document reaches. */
    const obsList = Array.isArray(observations) ? observations : (() => {
      const d = this.#one(`SELECT text FROM case_documents WHERE case_id=? AND edition=?`, caseId, Number(edition));
      return d ? this.#observationsReachedBy(d.text) : [];
    })();
    return obsList.map((obs) => {
      const act = this.attributionInForce(caseId, edition, obs);
      if (!act) return { observation: obs, level: null, shown: null, chosen_at_edition: null,
                         why: "its author has chosen no level for this edition or any earlier one" };
      const g = this.#one(`SELECT author FROM register WHERE bundle_id=? AND authored=1 LIMIT 1`, obs);
      const m = g ? this.membership.memberFacts(g.author) : null;
      /* WHAT EACH LEVEL PUBLISHES, and nothing else (a projection, not a refusal site, so it carries no DEC-49 marker). */
      const shown = act.level === "group" ? this.#producingGroup()
        : act.level === "project" ? project
        : act.level === "cover" ? (m && m.cover ? m.cover : null)
        : act.level === "name" ? (m && m.handle ? m.handle : null)
        : null;
      if (shown === null && act.level !== "group")
        return { observation: obs, level: null, shown: null, chosen_at_edition: null,
                 why: `its author chose '${act.level}' at edition ${act.edition}, and the record holds no `
                    + `${act.level === "name" ? "handle" : act.level} for them to publish under it` };
      return { observation: obs, level: act.level, shown, chosen_at_edition: Number(act.edition), why: null };
    });
  }


  /** MK-7 — RE-AUTHOR ONE UNSIGNED CASE DOCUMENT'S ATTRIBUTION RUNS FROM THE ACTS, on
   *  `#reauthorAcknowledgements`' rule: only the two runs change, only while `sig_armored IS NULL` and only
   *  over the hash read, so the new hash is what the owner signs and a signature over the old bytes is
   *  refused CASE_RATIFY_STALE. A document carrying no run (it reached no observation when authored) is left
   *  as it is and says so. */
  #reauthorAttributions(doc) {
    if (!SECTIONS.attribution(doc.text.split("\n")))
      return { case_id: doc.case_id, edition: doc.edition, reauthored: false,
               why: "this case document carries no attribution statements to re-author" };
    const fm = parseFrontmatter(doc.text).data || {};
    const rows = this.attributionStatements(doc.case_id, Number(doc.edition), String(fm.case_project ?? "").trim(),
                                            this.#observationsReachedBy(doc.text));
    /* R21: the one splice, so the section's bytes are written one way whoever re-authors them. */
    const { ok: _ok, ...out } = this.reauthorSection({ caseId: doc.case_id, edition: Number(doc.edition),
      docSha: doc.doc_sha, section: "attribution",
      lines: { frontmatter: attributionFrontmatterLines(rows), body: attributionBodyLines(rows) } });
    return out;
  }


  /** MK-7 — WHAT op=caseratify NEEDS TO JUDGE ONE CASE DOCUMENT'S ATTRIBUTION (§4.4): every observation it
   *  reaches, those still naming their author in their own bytes (§4.1, fenced), what the signed-for-review
   *  bytes STATE, and what the acts say NOW. The gate compares the last two, so a document can never carry a
   *  level the author did not choose. */
  attributionFacts(doc) {
    const fm = parseFrontmatter(String(doc && doc.text || "")).data || {};
    const reached = this.#observationsReachedBy(doc && doc.text);
    const stated = (Array.isArray(fm.observation_attributions) ? fm.observation_attributions : [])
      .map((r) => ({ observation: String(r && r.observation != null ? r.observation : ""),
                     level: r && typeof r.level === "string" && r.level !== "null" ? r.level : null,
                     shown: r && r.shown != null && r.shown !== "null" ? String(r.shown) : null }));
    const current = this.attributionStatements(doc.case_id, Number(doc.edition), String(fm.case_project ?? "").trim(), reached);
    return { reached, legacy: this.observationsNamingAuthor(reached), stated, current };
  }

  /** MK-7 — DOES ANY RATIFIED CASE DOCUMENT STATE A CHOSEN LEVEL FOR THIS OBSERVATION? op=ratify asks it before
   *  an observation's own bytes cross as a case's evidence: the words are published only beside a signed
   *  statement of whose they are. Bounded; the text match is the index, the parse the authority. */
  attributionStatedFor(observation) {
    const id = String(observation ?? "");
    if (!id) return false;
    const docs = this.#rows(`SELECT text FROM case_documents WHERE ratified_at IS NOT NULL
                              AND instr(text, ?) > 0 ORDER BY case_id, edition LIMIT 50`, `  - observation: ${id}`);
    return docs.some((d) => {
      const rows = (parseFrontmatter(d.text).data || {}).observation_attributions;
      return Array.isArray(rows) && rows.some((r) => r && String(r.observation) === id
        && ATTRIBUTION_LEVELS.includes(r.level));
    });
  }

  /** MK-7 / IC — op=attribute: THE ATTRIBUTION ACT (MEMBER-KNOWLEDGE-DESIGN.md §4.2–§4.6, MK-3's
   *  replacement (ii)). The observation's AUTHOR, and only they, chooses what one case edition publishes
   *  of who said it: `group | project | cover | name`, per (case edition, observation). It lands at the
   *  edition's PREPARED AND UNSIGNED case document — the door `op=statementack` binds at, for REC-194's
   *  reason: a case id is minted only by publication, so a draft of a new case has no identity to key a
   *  level to — and re-authors that document's attribution runs, so the level is in the bytes its owner
   *  signs. No `publish` capability is needed: it is a decision about the member's own words, not about
   *  the case. `by` is the control plane's stamp and nothing else. */
  attributeObservation({ caseId = null, edition = null, observation = null, level = null, by = null } = {}) {
    const refusal = (code, detail, extra) => {
      const row = ATTRIBUTION_ACT_CHECKS[code];
      return { ok: false, reason: code, code, check: row.check, translation: row.translation,
               detail, ...(extra || {}) };
    };
    const who = typeof by === "string" ? by.trim() : "";
    /* DEC-49 REGION is-attribute-act */
    if (!who || isMachineIdentity(who))
      return refusal("ATTRIBUTION_NOT_A_MEMBER",
        who ? `'${who.slice(0, 60)}' is a machine credential, and how a member's words are attributed is that `
              + `member's own choice` : `this call carries nobody; the plane stamps who chose from the credential`);
    const lv = typeof level === "string" ? level.trim() : "";
    if (!lv)
      return refusal("ATTRIBUTION_NO_LEVEL",
        `no level was chosen. There is no default (MEMBER-KNOWLEDGE-DESIGN.md §4): choose one of `
        + `${ATTRIBUTION_LEVELS.join(", ")}`, { allowed: ATTRIBUTION_LEVELS });
    if (!ATTRIBUTION_LEVELS.includes(lv))
      return refusal("ATTRIBUTION_LEVEL_UNKNOWN",
        `'${lv.slice(0, 40)}' is not a level; choose one of ${ATTRIBUTION_LEVELS.join(", ")}`,
        { allowed: ATTRIBUTION_LEVELS });
    /* END DEC-49 REGION is-attribute-act */
    const obs = typeof observation === "string" ? observation.trim() : "";
    const reg = obs ? this.#one(`SELECT author FROM register WHERE bundle_id=? AND authored=1 LIMIT 1`, obs) : null;
    /* DEC-49 REGION is-attribute-author */
    if (!reg)
      return refusal("ATTRIBUTION_NOT_AN_OBSERVATION",
        `${obs ? obs.slice(0, 80) : "(none named)"} is not a member's firsthand observation in this record, so it `
        + `has no author to choose how it is attributed`, { observation: obs || null });
    if (reg.author !== who)
      return refusal("ATTRIBUTION_NOT_THE_AUTHOR",
        `${obs} was recorded by another member. Only an observation's author chooses how a case shows who said it: `
        + `not a project owner, not an administrator, and not a default (§4.2)`, { observation: obs });
    const me = this.membership.memberFacts(who);
    if (!me || me.status !== "active")
      return refusal("ATTRIBUTION_AUTHOR_NOT_ACTIVE",
        `the author of ${obs} is not an active member, and nobody takes this act for them (§4.5)`, { observation: obs });
    /* END DEC-49 REGION is-attribute-author */
    const cid = typeof caseId === "string" ? caseId.trim() : "";
    const ed = Number(edition);
    const doc = cid && Number.isInteger(ed) && ed >= 1
      ? this.#one(`SELECT case_id, edition, doc_sha, text, sig_armored FROM case_documents WHERE case_id=? AND edition=?`, cid, ed)
      : null;
    const reaches = !!doc && this.#observationsReachedBy(doc.text).includes(obs);
    /* DEC-49 REGION is-attribute-edition
       ONE ANSWER for no such document and a document that does not reach this observation, so the act is not
       a way to learn what cases exist: the author is told only about an edition that uses their words. */
    if (!reaches)
      return refusal("ATTRIBUTION_NOT_REACHED",
        `no prepared case edition ${cid ? `${cid.slice(0, 60)} edition ${Number.isInteger(ed) ? ed : "(none)"}` : "(none named)"} `
        + `rests on ${obs}. An attribution is chosen for an edition that uses the observation, once op=publish has `
        + `prepared its case document`, { observation: obs, caseId: cid || null, edition: Number.isInteger(ed) ? ed : null });
    if (doc.sig_armored)
      return refusal("ATTRIBUTION_EDITION_RATIFIED",
        `${cid} edition ${ed} is already signed, and a signed edition answers forever; your choice applies to the `
        + `next edition, which inherits it until you change it (§4.3)`, { observation: obs, caseId: cid, edition: ed });
    if (lv === "name" && !(me.handle && String(me.handle).trim()))
      return refusal("ATTRIBUTION_NAME_NO_HANDLE",
        `'name' publishes the handle you appear under in this record, and you have none (§4.6). Choose another `
        + `level, or set a handle first`, { observation: obs });
    /* END DEC-49 REGION is-attribute-edition */
    const prior = this.attributionInForce(cid, ed, obs);
    /* c22-batch29 union (CONDUCT #22): D-543's one helper, not a hand-spelled whole-second stamp — MK-7 was cut before
       D-543 and d543-instant-precision named this site. Same value: stampInstant("second") of the current instant. */
    const when = stampInstant("second");
    const same = !!(prior && Number(prior.edition) === ed && prior.level === lv);
    if (!same)
      this.sql.exec(`INSERT INTO observation_attributions (case_id, edition, bundle_id, level, chosen_by, chosen_at)
                     VALUES (?,?,?,?,?,?) ON CONFLICT(case_id, edition, bundle_id) DO UPDATE SET
                       level=excluded.level, chosen_by=excluded.chosen_by, chosen_at=excluded.chosen_at`,
                    cid, ed, obs, lv, who, when);
    const reauthored = this.#reauthorAttributions(doc);
    const fm = parseFrontmatter(doc.text).data || {};
    const stmt = this.attributionStatements(cid, ed, String(fm.case_project ?? "").trim(), [obs])[0];
    return { ok: true, existed: same, observation: obs, caseId: cid, edition: ed, level: lv, shown: stmt.shown,
             previous: prior ? { level: prior.level, edition: Number(prior.edition) } : null,
             case_document: reauthored,
             stated: `edition ${ed} of ${cid} now states ${obs} at level '${lv}'. The case document was re-authored; `
                   + `its owner signs the new bytes. A later edition inherits this choice until you change it.` };
  }
  /* ---- section 8: secure verified export ----
   *
   * Export is the only real answer to a captured root of trust, because a group
   * that cannot leave is a group that can be held. It is also exactly the
   * capability an attacker wants most: a full working-corpus export is the
   * group's entire unpublished position, so if ANY administrator could take it,
   * one captured administrator exfiltrates everything and the feature becomes
   * the most efficient attack in the system.
   *
   * WHO MAY RUN IT is enforced in the control plane, not here, because that is
   * where the credential class is known. The rule is sharper than "an
   * administrator": section 8.1 says the ADMIN_TOKEN-class credential, which a
   * SESSION belonging to an administrator does not satisfy. A session is
   * password-derived; the root of trust is the token set in the hosting
   * dashboard. A stolen password must not reach this, and neither does the
   * founder's own signed-in browser.
   *
   * WHAT "VERIFIED" MEANS: the export carries its own manifest, every file
   * hashed on the way out, so the receiving side can re-derive everything and
   * trust nothing the sender asserts. */
  exportManifest({ note = null } = {}) {
    const bundles = this.#rows(
      `SELECT bundle_id, object_type, title, current_state, bundle_sha, row_version, created, last_updated
       FROM bundles ORDER BY bundle_id`);
    let fileCount = 0;
    const out = bundles.map((b) => {
      const files = this.#rows(
        `SELECT path, sha256, bytes, blob_sha, (content IS NOT NULL) AS inline
         FROM files WHERE bundle_id=? ORDER BY path`, b.bundle_id);
      fileCount += files.length;
      return { ...b,
        files: files.map((f) => ({ path: f.path, sha256: f.sha256, bytes: f.bytes,
                                   blobSha: f.blob_sha ?? null, inline: !!f.inline })),
        /* The manifest chain and the base links, so the receiving side can
           re-derive the chain rather than believe it. `history` holds the
           snapshotted FILES; `manifest` holds the promotion records that link
           them, which is what a chain check actually walks. */
        /* REC-182: `created` is the document's own time and two promotions can tie on it; a tie is
           broken by `rowid`, the store's write order (D-171's precedent), never by the scan. */
        promotions: this.#rows(
          `SELECT snap_key, kind, base, author, created, writer, operation
           FROM manifest WHERE bundle_id=? ORDER BY created, rowid`, b.bundle_id),
        snapshots: this.#rows(
          `SELECT snap_key, path, sha256, created FROM history WHERE bundle_id=? ORDER BY snap_key, path`,
          b.bundle_id),
        refs: this.#rows(`SELECT target_id, kind FROM refs WHERE bundle_id=?`, b.bundle_id),
      };
    });
    const at = new Date().toISOString();
    this.sql.exec(
      `INSERT INTO export_log (at,scope,bundles,files,note) VALUES (?,'working-corpus',?,?,?)`,
      at, bundles.length, fileCount, note ? String(note).slice(0, 280) : null);
    return { ok: true, at, scope: "working-corpus",
      bundles: out,
      counts: { bundles: bundles.length, files: fileCount },
      register: this.#rows(`SELECT bundle_id, path, capture_sha, bytes FROM register ORDER BY bundle_id`),
      recorded: "this export is in the append-only export log and is visible to every administrator",
      verify: "every file carries its sha256 and every bundle its history chain and base links. Re-derive "
            + "them on the way in and byte-compare every registered capture; trust nothing this manifest "
            + "asserts about itself." };
  }

  /** The log, readable by in-app administrators who cannot run an export.
   *
   *  REC-57 — NOT NAMED IN THE ITEM, and the worst instance of its class on the
   *  roster. This op read the log at a literal `LIMIT 200` with no parameter at
   *  all, and published neither the bound nor a truncation flag: an
   *  administrator reading `exports` saw the newest 200 entries of an
   *  APPEND-ONLY log and had no way to tell that from the whole of it. The
   *  sentence the export manifest tells them is "this export is in the
   *  append-only export log and is visible to every administrator" — a
   *  completeness claim, which is exactly what UI-25 says an unstated bound
   *  reads as. On a store past 200 exports, the export that is being looked for
   *  is the one that has fallen off.
   *
   *  `limit` is now accepted (default 200, clamped to 1..1000) so a truncated
   *  reader can ask for more, and the answer carries the bound it applied and
   *  whether it bit. Ordering, columns and the `exports` key are unchanged, and
   *  a caller that passes nothing gets byte-identical rows. */
  exportLog({ limit = null } = {}) {
    const cap = Math.max(1, Math.min(Math.floor(Number(limit) || EXPORT_LOG_LIMIT_DEFAULT),
                                     EXPORT_LOG_LIMIT_MAX));
    /* cap + 1 asked for, cap delivered: the extra row is the whole difference
       between "there are 200 exports" and "here are the first 200". */
    const page = this.#rows(
      `SELECT seq, at, scope, bundles, files, note FROM export_log ORDER BY seq DESC LIMIT ?`, cap + 1);
    return { ok: true, exports: page.slice(0, cap), limit: cap, truncated: page.length > cap };
  }

  /** 8.2: published-record reconstruction, requiring NOTHING.
   *
   *  Published material is content-addressed and its hashes are public, so any
   *  member or any stranger can rebuild and independently verify the published
   *  record without the cooperation, permission, or continued existence of the
   *  instance it came from. Nothing can be withheld here by construction.
   *
   *  READS THE PUBLISHED PROJECTION ONLY. That is the entire safety of an open
   *  endpoint: working material is never consulted, so there is nothing to leak,
   *  exactly as op=verify already works. */
  publishedManifest() {
    const byCase = this.#frozenPairsByCase();
    return { ok: true, scope: "published",
      /* REC-49, and it is CONDUCT's determination enacted rather than a
         convenience: EVERY RATIFIED FINDING CARRIES ITS OWN FROZEN PAIR HERE,
         inside the awaiting window as much as outside it.
         `published_bundles.strength` is the member's OWN signed, ratified pair —
         the same bytes op=publishedcase publishes for that finding and the same
         value the container manifest copies at assembly — so stating it composes
         nothing and makes no new claim. REC-44 already ruled that the findings
         which ratified are published and answerable NOW; an index that withheld
         their pairs until the LAST member landed would understate, for days,
         what the record actually holds.
         WHY IT MATTERS THAT IT IS HERE AND NOT ONLY IN `cases[].manifest`: the
         container's manifest does not exist until the edition completes, so a
         reader of an incomplete case would see nothing at all. A record that
         understates what it holds is still a record that does not say what is
         true, and understatement reads as modesty, which is why nobody
         questions it.
         AND THE ALTITUDE IS THE WHOLE POINT (DEC-44): the pair belongs to a
         FINDING and there is no such thing as a case-level pair. These fields
         sit on the finding rows and must NEVER appear on `cases[]`. */
      published: this.#rows(
        `SELECT p.bundle_id, p.edition, p.title, p.bundle_sha, p.ratified_at, p.attestor_key,
                p.gate_version, p.strength, p.required
         FROM published_bundles p ORDER BY p.bundle_id, p.edition`)
        .map((r) => {
          const row = { ...r,
            strength: r.strength ? JSON.parse(r.strength) : null,
            required: r.required ? JSON.parse(r.required) : null };
          /* ===== REC-170 / BIO_Publication_v0_1.md §3 rule 12 (b)–(d), with IC-74: WHERE THE
             RATIFIED CASE DOCUMENTS PINNING THESE BYTES STATE DIFFERENT FROZEN PAIRS, THE ROW
             SERVES EVERY CASE'S PAIR, EACH NAMED BY ITS CASE, AND NO SCALAR. ======================
             `published_bundles.strength` is written ONCE, at the member's FIRST ratification
             (`ON CONFLICT … DO NOTHING`), so on b5ce975a this row told a stranger one of two false
             things: a BARE NULL where the documents already disagreed at that ratification (the
             committer's `strengthUndetermined`, which reached op=ratify's answer and nothing
             else), or — measured by rec170-manifest-pair.test.mjs, and worse — THE FIRST CASE'S
             PAIR where a later case froze another, one case's reading served as THE pair (IC-74:
             a finding in several cases answers every case, never one). Rule 12 (b) makes the pair
             a fact about ONE case's reading of the finding at that sha, so where two readings
             differ the scalar is null and SAYS why (`strengthUndetermined`, a reason code, the
             `production` sentence's rule that a null is never left to be read), and
             `strengthByCase` carries each ratified case edition's own pair as its document states
             it — the same `caseDocMemberFrozen` read op=publishedcase serves.
             WHERE THE DOCUMENTS AGREE, OR ONE CASE PINS THE FINDING, NOTHING HERE RUNS and the row
             is byte-identical to what it was: an added key on an agreeing row would be a flag
             that is not true. */
          const pinned = byCase.get(`${r.bundle_id}\u0000${r.bundle_sha}`);
          if (!pinned || new Set(pinned.map((p) => JSON.stringify(p.strength))).size < 2) return row;
          return { ...row, strength: null, strengthUndetermined: "CASES_DISAGREE", strengthByCase: pinned };
        }),
      /* REC-44: the CASES, beside the findings rather than instead of them. The
         findings are what carry a signature and a frozen pair; the case is what
         carries the container's manifest, its own hash and the scope. A
         reconstruction needs both, and conflating them is what D-187 records. */
      cases: this.#rows(
        /* REC-47: the acknowledgement is on the PUBLIC index too, and that is
           the point of it — a reader reconstructing the record from this op
           alone must be able to see the bias each case edition was produced
           under without asking us for it. */
        /* CASE-1 / DEC-72: and WHOSE PRODUCTION the case is, on the public index,
           for the same reason the acknowledgement is on it — a reader
           reconstructing the record from this op alone must be able to see which
           project published a case, because under DEC-72 the bar the case was
           held to is THAT PROJECT'S and no other. A LEFT JOIN rather than an
           inner one, and that is the load-bearing half: a case published before
           this model has no `cases` row, and it must still appear here with its
           project stated as unknown rather than disappearing from the index
           because the record gained a table. */
        /* CASE-5 / DEC-72 clause 2: AND THE BAR, on the reconstruction index, for
           the reason the acknowledgement and the project are already on it — a
           reader rebuilding the published record from this op ALONE must be able
           to say what standard each case edition was held to, and until this
           item the only route was one member's stamped `required` block, which is
           one member's copy of a case property. `production` below states what a
           null means so a bare null cannot read as a bar of zero. */
        `SELECT c.case_id, c.edition, c.scope, c.bias_acknowledgement, c.bar, c.ratified_at,
                c.manifest_sha, c.manifest, k.project_id
         FROM published_cases c LEFT JOIN cases k ON k.case_id = c.case_id
         ORDER BY c.case_id, c.edition`)
        .map((c) => ({ ...c, bar: c.bar ? safeJson(c.bar) : null })),
      /* CASE-1 / DEC-72: the member's PINNED VERSION and its AUTHORED ROLE travel
         with the roster row, because they are what the roster row now IS —
         (finding id, version hash, role, ordinal). Both are null until CASE-2
         authors a role and CASE-3 pins a version, and `production` below states
         that in words rather than leaving a reader to read a bare null. */
      caseMembers: this.#rows(
        `SELECT case_id, edition, ord, bundle_id, version_sha, role FROM published_case_members
         ORDER BY case_id, edition, ord`),
      /* CASE-1 / DEC-72, and it exists because "undetermined is first-class and
         must be STATED" is not satisfied by a null. Three different facts arrive
         here as null and a reader cannot tell them apart without this sentence:
         a case nobody published as a project's production, a member nobody
         designated, and a member whose version nobody pinned. */
      production: "DEC-72: a case is a PRODUCTION OF A PROJECT, and the standard of evidence it was "
                + "held to is that project's, told to the publishing act at the time it was made. Where "
                + "`project_id` is null NO PROJECT IS RECORDED as this case's publisher — the case was "
                + "published before this model, and an absent owner is not a claim that it had none, it "
                + "is this record saying it does not know. Where a member's `role` is null NOBODY "
                + "DESIGNATED that member load-bearing or supporting, so nothing here says whether the "
                + "case rests on it: a designation is authored by the publisher and is never derived, so "
                + "the record will not supply one it was not given. Where `version_sha` is null the "
                + "member was rostered without a version being pinned, and the finding it names may have "
                + "moved since. None of the three is a gap in this answer; each is a state of the record. "
                /* CASE-5 / DEC-72: the fourth null, and the ONE instruction a
                   reconstructor cannot do without. `caseMembers[].edition` is the
                   CASE's and `published[].edition` is the FINDING's, and they are
                   no longer the same number — so the join between the two tables
                   is `version_sha` to `bundle_sha` and NEVER edition to edition.
                   Said here rather than left to be inferred because a join on the
                   old equality does not error: it silently drops exactly the
                   members the pin exists for, which is the defect IC-66 measures
                   in this record's own UI. */
                + "Where a case edition's `bar` is null NO STANDARD OF EVIDENCE IS RECORDED for it, and that "
                + "is NOT a bar of zero: the edition predates the case carrying its own bar, or none was "
                + "ever declared, and a case that cleared no declared standard says so. AND THE JOIN "
                + "BETWEEN `caseMembers` AND `published` IS `version_sha` TO `bundle_sha`, NEVER EDITION TO "
                + "EDITION: `caseMembers.edition` is the CASE's edition and `published.edition` is the "
                + "FINDING's own, and since the artifact flip a member of a case's edition 2 may be at its "
                + "own edition 1. A join on the two numbers does not fail — it silently drops the members "
                + "the pin exists to name.",
      shas: this.#rows(
        `SELECT sha256, bundle_id, path, kind, bytes, published FROM published_shas ORDER BY published`),
      altitudes: "a frozen strength pair belongs to a FINDING and travels on that finding's row here. A CASE "
               + "has a scope, a completeness assertion, a bias acknowledgement, editions and a container; "
               + "it has no strength, and "
               + "composing its members' pairs into one letter would be a claim the evidence does not "
               + "support. A member named in caseMembers with no row in published[] is DECLARED AND NOT YET "
               + "RATIFIED: it has no pair because nothing has been signed for it, which is a state of the "
               + "record and not a gap in this answer. "
               /* REC-170: the one null on a finding row that is not "nothing was signed". */
               + "Since the frozen pair is stated in each CASE's document (a case's reading of the finding at "
               + "that hash), a finding several cases pin may carry several pairs: where their documents "
               + "disagree, `strength` is null, `strengthUndetermined` says CASES_DISAGREE, and "
               + "`strengthByCase` lists every ratified case edition's own pair, named by its case and "
               + "edition. None of them is the finding's pair; each is that case's.",
      detail: "every hash here is verifiable by anyone with ssh-keygen and the doorbell, without this "
            + "instance's cooperation or continued existence. Nothing unpublished appears, by construction: "
            + "this reads the published projection and never the working corpus." };
  }
  /* D-442 / BIO_Publication_v0_1.md §3 rule 12: a member's edition and frozen pair as the RATIFIED
     case documents pinning exactly these bytes state them. Null when every pinning document is
     legacy (/1) — those members carried the blocks in their own bytes. The edition and the pair are
     each taken only where every /2 document agrees; a disagreement is returned as undetermined and
     never resolved by picking one (CLAUDE.md §4: undetermined is first-class). */
  frozenFromPinningDocuments(bundleId, bundleSha, pins) {
    const seen = [];
    for (const pin of pins) {
      const map = this.caseDocMemberFrozen(pin.case_id, Number(pin.edition));
      const row = map ? map.get(bundleId) : null;
      if (row && row.version_sha === bundleSha) seen.push(row);
    }
    if (!seen.length) return null;
    const eds = [...new Set(seen.map((r) => r.edition))];
    const pairs = [...new Set(seen.map((r) => JSON.stringify(r.strength)))];
    return { edition: eds.length === 1 ? eds[0] : null,
             strength: pairs.length === 1 && seen[0].strength.length ? seen[0].strength : null,
             strengthUndetermined: pairs.length > 1 };
  }

  /* REC-170 / BIO_Publication_v0_1.md §3 rule 12 (b): EVERY RATIFIED CASE EDITION'S OWN FROZEN PAIR
     FOR EVERY PINNED SHA, keyed `bundle_id NUL bundle_sha`, for `publishedManifest`. One set-based read
     of the pins, then `caseDocMemberFrozen` (the one parser of the per-case facts) once per case edition
     that pins a sha SEVERAL editions pin — a sha pinned by one edition has nothing to disagree with, so
     its document is never opened here. EVERY ratified edition counts, not only a case's latest: each is
     a separate signed document that stated its own reading of those bytes. A LEGACY (/1) document states
     no pair of its own (its members carried theirs, rule 12 (e)) and is left out rather than read as an
     empty pair — which is also where this reader is blind: a /1 reading does not join the comparison. */
  #frozenPairsByCase() {
    const pins = this.#rows(
      `SELECT m.case_id, m.edition, m.bundle_id, m.version_sha FROM published_case_members m
         JOIN published_cases c ON c.case_id=m.case_id AND c.edition=m.edition
        WHERE m.version_sha IS NOT NULL
        ORDER BY m.bundle_id, m.version_sha, m.case_id, m.edition`);
    const groups = new Map();
    for (const p of pins) {
      const k = `${p.bundle_id}\u0000${p.version_sha}`;
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(p);
    }
    const docs = new Map();
    const out = new Map();
    for (const [k, ps] of groups) {
      if (ps.length < 2) continue;
      const stated = [];
      for (const p of ps) {
        const dk = `${p.case_id}\u0000${Number(p.edition)}`;
        if (!docs.has(dk)) docs.set(dk, this.caseDocMemberFrozen(p.case_id, Number(p.edition)));
        const row = docs.get(dk) ? docs.get(dk).get(p.bundle_id) : null;
        if (row && row.version_sha === p.version_sha)
          stated.push({ case_id: p.case_id, edition: Number(p.edition), strength: row.strength });
      }
      out.set(k, stated);
    }
    return out;
  }

  /* REC-44: what a case edition is, and whether it is COMPLETE. One place, so
     the ratify path (which must know whether to assemble the container) and the
     public read path (which must say so) cannot disagree about it. Returns the
     facts the control plane needs to build the manifest and nothing derived:
     in particular NO case-level strength, because there is no such thing —
     every member's frozen PAIR travels with that member. */
  caseEditionState(caseId, ed, group = null) {
    const c = this.#one(`SELECT scope, completeness, bias_acknowledgement, bar, opened, ratified_at, manifest_sha
                         FROM published_cases WHERE case_id=? AND edition=?`, caseId, ed);
    if (!c) return null;
    /* CASE-5 / DEC-72 clause 2: WHOSE PRODUCTION, on the one accessor that
       answers "what IS this case edition". It is the case IDENTITY's project
       (`cases` is keyed on `case_id` alone, CASE-1's sharpest call), so it is
       read once here rather than per edition — a case does not change hands
       between editions and a per-edition read would imply it could. NULL for a
       case published before DEC-72, which CASE-1's schema comment says is the
       honest answer and not a gap. */
    const owner = this.#one(`SELECT project_id FROM cases WHERE case_id=?`, caseId);
    /* CASE-3: `version_sha` — THE PIN — travels with the roster row, because a
       reader of a case edition must be able to say WHICH VERSION of each member
       the case froze, and a freeze nobody can read is not one the reader can
       rely on. It is served beside `bundle_sha` and is NOT a second spelling of
       it: `bundle_sha` is what the published row HOLDS NOW and `version_sha` is
       what the case COMMITTED TO. NULL means rostered and not yet pinned,
       exactly as the column comment says.

       ===== CASE-5 / DEC-72: THE ARTIFACT FLIP, AND THIS PREDICATE IS ITS HEART.
       CASE-3 landed the pin and handed this line on in terms: *"resolving a
       member BY THE PIN instead of by the CASE'S edition number is NOT done …
       CASE-5 is where they can diverge and where the pin starts doing work no
       other column can."* This is that line.

       WHAT IT WAS: `published_bundles WHERE bundle_id=? AND edition=?` at the
       CASE'S edition number — the conflation `schema.mjs`'s `version_sha`
       comment names, *"only correct while one case owns one finding"*. Now that
       `op=publish` stamps a member's OWN edition, a member of case edition 2 can
       sit at its own edition 1, and the old predicate does not merely return a
       different row: IT RETURNS NOTHING. The member falls into `awaiting`, the
       edition reads INCOMPLETE forever, and no container is ever assembled — a
       published case silently claiming it is still waiting for a finding that
       ratified. That is what the negative control arms and it fails by name.

       THE PIN IS THE ONLY COLUMN THAT CAN ANSWER IT, and that is the point
       rather than a preference: a hash identifies a version, and the case
       committed to a hash. `AND version_sha IS NOT NULL` is not needed on the
       lookup — a NULL pin never reaches it, because the fallback below owns that
       row.

       THE FALLBACK IS FOR ROWS WRITTEN BEFORE CASE-3, WHOSE PIN IS HONESTLY
       NULL, and it is the OLD predicate unchanged. Those editions were published
       under the slaved model where the two numbers were equal, so reading them
       at the case's number is not a guess — it is the fact those rows were
       written under. A row that is pinned is never read that way, so a pin can
       never be silently bypassed by the compatibility path. */
    const roster = this.#rows(
      `SELECT ord, bundle_id, version_sha, role FROM published_case_members
       WHERE case_id=? AND edition=? ORDER BY ord`, caseId, ed);
    const MEMBER_COLS = `bundle_id, edition, title, bundle_sha, ratified_at, attestor_key, attestor_member,
                         delivered_by, gate_version, sig_armored, strength, required, parts`;
    const findings = [], awaiting = [];
    /* D-442 / BIO_Publication_v0_1.md §3 rule 12 (b), (d): THE PER-CASE FROZEN FACTS FOLLOW THEIR
       BLOCK. Under /2 each member's edition, frozen pair and grounds are what THIS CASE'S document
       states — this case's reading of that finding at the pinned sha — and not the finding row's
       projection, which carries one reading however many cases pin the bytes. So op=publishedcase and
       the container (both built from this method) read each member's frozen facts from the case
       document; a legacy (/1) case keeps reading the member's own ratified pair, as it always did. */
    const docFrozen = this.caseDocMemberFrozen(caseId, ed);
    for (const m of roster) {
      const r = m.version_sha
        ? this.#one(`SELECT ${MEMBER_COLS} FROM published_bundles WHERE bundle_id=? AND bundle_sha=?`,
                    m.bundle_id, m.version_sha)
        : this.#one(`SELECT ${MEMBER_COLS} FROM published_bundles WHERE bundle_id=? AND edition=?`,
                    m.bundle_id, ed);
      if (!r) { awaiting.push(m.bundle_id); continue; }
      const frozenHere = docFrozen ? docFrozen.get(m.bundle_id) || null : null;
      findings.push({ ord: m.ord, bundle_id: r.bundle_id, title: r.title, bundle_sha: r.bundle_sha,
                      version_sha: m.version_sha ?? null,
                      /* CASE-5: THE MEMBER'S OWN EDITION, served rather than
                         implied. Before the flip a reader could take the case's
                         edition as every member's and be right; now they cannot,
                         and a surface that has to guess would guess wrong on
                         exactly the members the pin exists for. */
                      edition: r.edition,
                      /* CASE-5: the AUTHORED designation on the one accessor
                         that answers what a case edition IS. CASE-2 wrote it into
                         the roster row and into every member's signed bytes; the
                         container manifest and the public read both need it, and
                         both of them come through here. */
                      role: m.role ?? null,
                      ratified_at: r.ratified_at, gate_version: r.gate_version, sig_armored: r.sig_armored,
                      attestor: { member: r.attestor_member, key_b64: r.attestor_key },
                      /* REC-128: who SIGNED is `attestor`; who DELIVERED is this. */
                      delivered_by: this.#deliveredBy(r),
                      strength: frozenHere ? frozenHere.strength : (r.strength ? JSON.parse(r.strength) : null),
                      /* D-442: the frozen BRANCHES, where the case document states them. A legacy
                         member's grounds are in its own signed bytes and were never on this row. */
                      ...(frozenHere ? { grounds: frozenHere.grounds } : {}),
                      frozen_from: frozenHere ? "case_document" : "member_bytes",
                      ...(frozenHere ? { case_excludes: frozenHere.excludes ?? null } : {}),
                      required: r.required ? JSON.parse(r.required) : null,
                      parts: r.parts ? JSON.parse(r.parts) : [] });
    }
    const complete = roster.length > 0 && awaiting.length === 0;
    /* The instant the LAST member landed is the instant the case edition was
       ratified. Stamped once and never re-stamped: a re-ratification of the
       same bytes is a retry, not a revision. */
    if (complete && !c.ratified_at) {
      const at = findings.reduce((mx, x) => (instantOrder(x.ratified_at, mx) > 0 ? x.ratified_at : mx), findings[0].ratified_at);
      this.sql.exec(`UPDATE published_cases SET ratified_at=? WHERE case_id=? AND edition=?`, at, caseId, ed);
      c.ratified_at = at;
    }
    return { caseId, edition: ed, group: group ?? null,
             /* CASE-5 / DEC-72 clause 2, and the pair is one fact in two halves:
                WHOSE production this case is, and WHAT STANDARD it was held to.
                They belong together because the second is only meaningful as the
                first's property — "bar: B/B" with no publisher is a requirement
                nobody asserted, which is the shape DEC-72 spent a whole ruling
                removing. Both are served here rather than derived by any caller,
                so the ratify path and the public read cannot disagree about them
                any more than they can about the scope. */
             project: owner ? owner.project_id : null,
             bar: c.bar ? safeJson(c.bar) : null,
             scope: c.scope ?? null,
             /* ===== CASE-5b: THE SIGNED CASE DOCUMENT, ON THE ONE ACCESSOR THAT
                ANSWERS WHAT A CASE EDITION IS — and it is here rather than in the
                container assembler for REC-44's stated reason: the ratify path
                and the public read must not be able to disagree about the answer.

                WHY A STRANGER NEEDS IT, which is the whole reason this item did
                not stop at deleting six keys. Before CASE-5b a stranger holding
                one member's bundle.md could read the case's scope, roster,
                partition, bias acknowledgement and bar out of that member's
                signed bytes — REC-44's property, and the container manifest's
                whole premise (S9). Those facts are no longer in a member's
                bytes. If the container carried them only as manifest FIELDS,
                they would be assertions THIS INSTANCE made, checkable against
                nothing — exactly the ambiguity the manifest's own format comment
                says it exists to refute. Carrying the document and its signature
                puts the stranger back where they were, holding bytes somebody
                signed, verifiable with ssh-keygen against a key the artifact
                names, WITHOUT contacting this instance.

                NULL UNTIL RATIFIED, and never a partial. An unsigned case
                document is a ceremony in progress and there is nothing for a
                stranger to check in it. */
             document: (() => {
               const d = this.#one(
                 `SELECT doc_sha, text, sig_armored, attestor_key, attestor_member, delivered_by, gate_version, ratified_at
                    FROM case_documents WHERE case_id=? AND edition=? AND ratified_at IS NOT NULL`,
                 caseId, ed);
               return d ? { doc_sha: d.doc_sha, text: d.text, sig_armored: d.sig_armored,
                            attestor: { member: d.attestor_member, key_b64: d.attestor_key },
                            delivered_by: this.#deliveredBy(d),
                            gate_version: d.gate_version, ratified_at: d.ratified_at } : null;
             })(),
             /* REC-47 / DEC-46 (a): the bias the case was produced under travels
                with it, on every surface that serves the case block. DEC-20 is
                the reason it is a plain disclosure here and not a verdict —
                the reader weighs it; this plane never does. */
             bias_acknowledgement: c.bias_acknowledgement ?? null,
             completeness: c.completeness ? JSON.parse(c.completeness) : null,
             /* `opened` STAYS, DECIDED 2026-08-05 (REC-58) — a decision, not an
                omission, which is what that item was raised to leave here.
                It is the instant the case edition was opened, off the
                `published_cases` row this method already reads.

                IT IS COMPUTED HERE AND PUBLISHED NOWHERE, and both halves are
                deliberate. REC-58 re-measured the consumers across the whole
                repository — 228 files, 7,804,893 characters, both embeds of the
                bundled plane excluded structurally and the GENERATOR kept in —
                and found ZERO reads outside this file. The only reads that
                exist are this method reading its own SQL row.

                So why keep it. Removing it would not retire a publication,
                because there is none to retire: both callers of this method
                pick their fields by name (`publishedCase()` since IC-22, and
                the control plane on `publish()`'s side, twice). What removal
                WOULD do is delete a real recorded fact from the one accessor
                whose job is to answer "what IS this case edition" — REC-44 put
                it here precisely so the ratify path and the public read cannot
                disagree about the answer, and a future consumer that needs the
                instant work began should find it here rather than re-deriving
                it from SQL at a second site.

                WHAT THIS IS NOT: it is not a claim that the field is wanted.
                Nothing wants it today, and that is stated rather than dressed
                up. It is the narrower claim that an unconsumed COMPUTATION on
                the internal accessor costs a reader nothing, while an
                unconsumed PUBLICATION costs them a field they must reason
                about — which is the distinction IC-22 acted on and this keeps.

                THE FENCE IS THE PART THAT MATTERS, and it is pinned rather than
                trusted: `test/case-opened.test.mjs` asserts that each of the
                three consumers NAMES its fields and that none spreads this
                state, and holds "computed here AND published nowhere" as ONE
                assertion — so deleting this key and publishing it both fail,
                and the decided state is the only one that passes. */
             opened: c.opened, ratified_at: c.ratified_at ?? null,
             manifest_sha: c.manifest_sha ?? null,
             complete, awaiting, findings,
             detail: complete
               ? "every finding in this case edition is ratified, so the container can be assembled whole"
               : `this case edition is INCOMPLETE: ${awaiting.length} of ${roster.length} findings are not yet `
               + `ratified. The findings that are published answer individually; the container cannot be `
               + `assembled until the last one lands, because it would otherwise claim to carry findings it `
               + `does not have.` };
  }

  /* REC-44: the case CONTAINER's manifest, handed back by the control plane
     (which is where the SHA-256 and the R2 copy live) once the edition
     completed. Stored on the case row rather than on any member's, because the
     manifest describes the CASE — one manifest per case per edition, naming
     every member finding's parts and every member's own signature. The
     published_shas row is what makes it answerable by its own hash and what
     op=publishedbytes checks before serving anything. */
  recordCaseManifest({ caseId, edition, manifest, manifestSha, bytes = null } = {}) {
    if (!caseId || !Number.isInteger(Number(edition)) || !manifest || !manifestSha)
      return { ok: false, reason: "MALFORMED" };
    const ed = Number(edition);
    return this.record.transact(() => {
      const c = this.#one(`SELECT manifest_sha FROM published_cases WHERE case_id=? AND edition=?`, caseId, ed);
      if (!c) return { ok: false, reason: "NO_SUCH_CASE_EDITION", caseId, edition: ed };
      if (c.manifest_sha && c.manifest_sha !== manifestSha)
        return { ok: false, reason: "MANIFEST_EXISTS", caseId, edition: ed, manifest_sha: c.manifest_sha,
                 detail: `case ${caseId} edition ${ed} already has a manifest at a different hash. An edition is `
                       + `a SEPARATE DOCUMENT and its container answers forever; a second manifest under the `
                       + `same number would leave a reader unable to say which container they checked.` };
      this.sql.exec(`UPDATE published_cases SET manifest_sha=?, manifest=? WHERE case_id=? AND edition=?`,
                    manifestSha, JSON.stringify(manifest), caseId, ed);
      this.sql.exec(
        `INSERT INTO published_shas (sha256,bundle_id,path,kind,bytes,published) VALUES (?,?,?,?,?,?)
         ON CONFLICT(sha256,bundle_id,path) DO NOTHING`,
        manifestSha, caseId, "MANIFEST.json", "manifest", bytes ?? null, new Date().toISOString());
      return { ok: true, caseId, edition: ed, manifest_sha: manifestSha };
    });
  }

  /* REC-22 / R4: the PUBLISHED GRAPH, written inside the publishing act's own
     transaction from the RATIFIED BYTES (the control plane reads references[]
     and the division disclosure out of the document the signature covers and
     hands them here) -- never from the working `refs` table, which is a
     projection of whatever bundle.md says TODAY and moves under a published
     edition every time somebody promotes.

     TWO CLASSES AND ONE RESTRICTION.
       - a SERVE edge is admitted only when its target is ITSELF published.
         That restriction is what stops the published graph naming working
         material, and it is checked HERE against published_bundles rather than
         being asserted by the caller.
       - a NAME edge is admitted whatever the target's state, and carries an id
         and nothing else. R4's disclosure lands here and had to: a divided
         parent is TERMINAL and can never be published, so the restriction as
         BUILD-ORDER first wrote it made R4's disclosure impossible on the exact
         surface R4 was written for. The control plane classifies -- a division's
         parent and siblings are name-only BY KIND, even when the target happens
         to be published, because "names its parent and its siblings while
         serving neither" is a rule about the DISCLOSURE and not about what is
         reachable.

     Idempotent on (from, to, kind) so a second edition re-asserting an edge
     does not double it, and the class is REFRESHED on re-publication: whether a
     target is published is a fact about the record now, not about the edition
     that first named it. */
  publishEdges(bundleId, edges, now) {
    if (!Array.isArray(edges)) return { serve: 0, name: 0, dropped: 0 };
    const out = { serve: 0, name: 0, dropped: 0 };
    for (const e of edges) {
      if (!e || typeof e.to !== "string" || !e.to || typeof e.kind !== "string" || !e.kind) continue;
      /* A self-edge discloses nothing and is not a graph. */
      if (e.to === bundleId) continue;
      const nameOnly = e.disclosure === "name";
      if (!nameOnly && !this.#one(`SELECT bundle_id FROM published_bundles WHERE bundle_id=? LIMIT 1`, e.to)) {
        out.dropped++;
        continue;
      }
      this.sql.exec(
        `INSERT INTO published_edges (from_bundle,to_bundle,kind,disclosure,published) VALUES (?,?,?,?,?)
         ON CONFLICT(from_bundle,to_bundle,kind) DO UPDATE SET disclosure=excluded.disclosure`,
        bundleId, e.to, e.kind, nameOnly ? "name" : "serve", now);
      out[nameOnly ? "name" : "serve"]++;
    }
    return out;
  }

  /* ---- the doorbell, store side ---- */

  /* 7a: answers ONLY from the published projection. Working material is not
     consulted, so there is nothing to leak: a hash that was never ratified
     is indistinguishable from a hash that never existed. */
  verifySha(sha) {
    const matches = this.#rows(
      `SELECT bundle_id, path, kind, published FROM published_shas WHERE sha256=? ORDER BY published`, sha);
    return { published: matches.length > 0, sha256: sha, matches };
  }

  /* REC-14 / DEC-12: the public index ENUMERATES EDITIONS rather than one row
     per bundle, because an edition is a separate document and edition 1 keeps
     answering after edition 2 lands. `title` is here — the one deliberate
     divergence from DATA-MODEL 2.4.4 — so a public index is not N+1 reads of
     the bytes to learn what each case is called. */
  publishedList() {
    return { bundles: this.#rows(
      `SELECT bundle_id, edition, title, bundle_sha, ratified_at, attestor_member, delivered_by, gate_version
       FROM published_bundles ORDER BY bundle_id, edition`)
      /* REC-44: each published FINDING names the case it was published in, so a
         public index can be read as the cases it actually is. The finding rows
         stay the rows — a finding is what carries a signature and a frozen pair
         — and the case is stated beside them rather than replacing them.
         CASE-5: resolved BY THE HASH, and `case_edition` is stated beside the
         case id because it is no longer derivable from `edition` on this row —
         that number is the FINDING's. A consumer joining a member to its case on
         the equality of the two numbers is the defect IC-66 measures in the UI. */
      /* D-309 / DEC-72 clause 6: THIS CALLER WANTS **ALL** OF THEM. A public
         index whose purpose is *"so a public index can be read as the cases it
         actually is"* cannot name one case for a finding that serves two — it
         would be telling a reader the record holds less than it does, on the one
         surface a stranger browses. `cases` is the answer; the scalar pair is
         kept and is the SOLE membership or null (`soleCase`), so a consumer
         still reading it receives null rather than a guess. */
      .map((r) => {
        const cms = this.#casesOfSha(r.bundle_id, r.bundle_sha, r.edition);
        const sole = this.soleCase(cms);
        return { ...r, delivered_by: this.#deliveredBy(r),
                 case_id: sole ? sole.case_id : null, case_edition: sole ? sole.edition : null,
                 cases: cms };
      }),
      cases: this.#rows(
      `SELECT case_id, edition, scope, ratified_at, manifest_sha FROM published_cases
       ORDER BY case_id, edition`)
      .map((c) => ({ ...c, findings: this.#rows(
        `SELECT bundle_id FROM published_case_members WHERE case_id=? AND edition=? ORDER BY ord`,
        c.case_id, c.edition).map((m) => m.bundle_id) })) };
  }

  /* One case, every edition it has ever had, each with its OWN signature,
     attestor, time and gate version, and with the frozen assertion and the
     frozen PAIR the group signed. This is what makes "edition 1 still answers"
     checkable rather than merely stated. */
  publishedEditions(bundleId) {
    if (!bundleId) return { ok: false, reason: "NO_ID", detail: "publishededitions requires ?id=" };
    const rows = this.#rows(
      `SELECT bundle_id, edition, title, bundle_sha, ratified_at, attestor_key, attestor_member,
              delivered_by, gate_version, sig_armored, strength, required
       FROM published_bundles WHERE bundle_id=? ORDER BY edition`, bundleId);
    /* REC-44: `completeness` is no longer here and that is the correction — it
       is a CASE assertion, so it is fetched from the case each edition belongs
       to rather than repeated on every member finding of it. */
    return { ok: true, bundleId, editions: rows.map((r) => {
      /* CASE-5: BY THE HASH, and the case's edition comes back WITH the case id
         rather than being taken from `r.edition`. This read is the clearest
         instance of the conflation in the file: it resolved the case at the
         FINDING's edition and then fetched `published_cases` at that same
         number, so a finding at its own edition 1 inside a case at edition 3 was
         answered with edition 1's scope, completeness and bias acknowledgement —
         a case assertion attributed to the wrong edition of the right case. */
      /* D-309: **ALL** OF THEM, and the case-level fields below stay tied to the
         SOLE membership. The scope, completeness assertion, bias acknowledgement
         and bar on this row are ONE CASE EDITION'S claims; a finding serving two
         cases has two of each, and flattening them onto one row is the exact
         defect this read's own comment records one paragraph up — *"a case
         assertion attributed to the wrong edition of the right case"*, which
         becomes "attributed to the wrong CASE" the moment clause 6 is live. So
         when the membership is set-valued those fields go NULL and `cases` names
         where to ask; when it is a single case they are unchanged. */
      const cms = this.#casesOfSha(r.bundle_id, r.bundle_sha, r.edition);
      const cm = this.soleCase(cms);
      const cid = cm ? cm.case_id : null;
      const c = cm ? this.#one(
        `SELECT scope, completeness, bias_acknowledgement, bar, manifest_sha
         FROM published_cases WHERE case_id=? AND edition=?`,
        cm.case_id, cm.edition) : null;
      return { ...r, delivered_by: this.#deliveredBy(r),
               case_id: cid, case_edition: cm ? cm.edition : null, cases: cms,
               bar: c && c.bar ? safeJson(c.bar) : null,
               /* The container's manifest is the CASE edition's, so it is
                  reported from there — one manifest per case per edition,
                  naming every member finding's parts. */
               manifest_sha: c ? (c.manifest_sha ?? null) : null,
               scope: c ? (c.scope ?? null) : null,
               bias_acknowledgement: c ? (c.bias_acknowledgement ?? null) : null,
               completeness: c && c.completeness ? JSON.parse(c.completeness) : null,
               strength: r.strength ? JSON.parse(r.strength) : null,
               required: r.required ? JSON.parse(r.required) : null };
    }) };
  }

  /* REC-22: ONE PUBLISHED EDITION, everything the public read path can say about
     it from the store side. Reads published_bundles and published_edges and
     NOTHING else -- it never joins the working corpus, never reports a working
     state, and carries no title but the one frozen into the edition -- which is
     the whole of why this answers without a credential of any kind (REC-30's
     classification, and schema.mjs:172 says these tables exist to guarantee
     exactly that property).

     RESOLUTION, three ways and one rule (DEC-12): a bundle id alone answers with
     the LATEST edition; an id and an edition answer with that edition; a
     bundle_sha answers with THE EDITION THOSE BYTES ARE -- a hash resolves to
     its own edition and never to the current one, which is what makes "edition 1
     still answers after edition 2 lands" true rather than merely stated.

     A NOT_PUBLISHED answer is IDENTICAL for a bundle that was never published,
     an edition that does not exist and an id that never existed, and it is
     identical by construction rather than by care: there is no other table in
     this method to tell them apart with. */
  /* REC-44 / DEC-44: RESOLUTION NOW HAS A FOURTH ROUTE and the surface answers
     with a CASE. `id` may be the CASE identity or the bundle id of any member
     FINDING — a stranger who was handed one finding's id must be able to reach
     the case it was published in, since that case is the artifact the group put
     its name on. A finding id is answered WITH the case and `asked` names which
     finding was reached for, so the surface resolves without deciding on the
     reader's behalf what they meant.

     AND THERE IS NO `strength` AT THIS LEVEL. Every member finding carries its
     own frozen pair inside findings[]; a case-level letter would be R2's
     forbidden composition arriving at case altitude, and its ABSENCE from this
     answer is asserted by the suite rather than left to review. */
  publishedCase({ id = null, edition = null, sha256 = null, caseId = null } = {}) {
    let theCase = caseId ? String(caseId).trim() : null, ed = null, asked = null;
    /* CASE-5: the FINDING's own edition, kept apart from `ed` (the CASE's) from
       here on. The two used to be one variable on this method as well, and the
       loose-bundle fallback below reads `published_bundles` — which is keyed on
       the finding's number and would have been handed the case's. */
    let askedEdition = null;
    if (sha256) {
      const r = this.#one(`SELECT bundle_id, edition FROM published_bundles WHERE bundle_sha=? ORDER BY edition LIMIT 1`,
                          sha256);
      /* CASE-5 / DEC-72: THE STRANGER'S OWN ROUTE, and the conflation was at its
         worst here. A caller who holds a hash and nothing else — the caller the
         whole published projection exists for — was answered by taking the
         FINDING's edition off its published row and asking for the CASE at that
         number. While the two agreed it worked; after the flip it would fetch a
         different edition of the right case, or none, and hand a stranger one
         edition's scope and completeness assertion over another edition's
         findings. Resolved by the hash the case actually pinned. */
      if (r) {
        asked = r.bundle_id;
        askedEdition = Number(r.edition);
        const cms = this.#casesOfSha(r.bundle_id, sha256, askedEdition);
        /* D-309: THIS CALLER MUST SERVE **ONE** CASE AND SO IT REFUSES RATHER
           THAN PICKS — and that is this method's own stated doctrine rather than
           a new rule. Its header already says a finding id is answered WITH the
           case *"so the surface resolves without deciding on the reader's behalf
           what they meant."* A hash that two cases froze has two honest answers;
           serving the newest would attribute one finding's support to a case the
           reader never asked about, on the surface a stranger uses to check a
           claim. Named, with both candidates, so the reader picks. */
        const got = this.#resolveOneCase(r.bundle_id, cms, caseId);
        if (!got.ok) return got;
        if (got.pick) { theCase = got.pick.case_id; ed = got.pick.edition; }
      }
    } else if (id) {
      const want = edition != null && Number.isInteger(Number(edition)) ? Number(edition) : null;
      if (this.#one(`SELECT case_id FROM published_cases WHERE case_id=? LIMIT 1`, id)) {
        theCase = id;
      } else {
        /* D-309: SITES 3 AND 4 OF CASE-6's NINE — the two spellings of
           `publishedCase()`'s finding-id resolution. SAME DECISION AS THE HASH
           ROUTE ABOVE AND FOR THE SAME REASON: a stranger handed one finding id
           that serves two cases is told BOTH and picks, because this surface
           exists to resolve without choosing for them. Note the edition here is
           the CASE's, so `AND edition=?` can match two different cases that each
           have an edition N — which is exactly the shape the old scalar would
           have resolved by whichever row SQLite handed back first. */
        /* THE TERNARY IS OUTSIDE THE CALL, not inside its argument list, and that
           is this item's own census correcting this item's own code. Written as
           `this.#rows(want != null ? \`…\` : \`…\`)` the receiving call sits behind
           the ternary CONDITION, and `multicase.test.mjs`'s walk — which finds a
           query's kind by looking back from the literal to the call — could not
           see it and reported it UNCLASSIFIED. **That is the matcher being right
           rather than blunt**, so the code moved to the spelling every other
           member of the class uses instead of the matcher being widened to
           tolerate one. A census nobody can read the same way twice is not one. */
        const ms = (want != null
          ? this.#rows(`SELECT case_id, edition FROM published_case_members
                         WHERE bundle_id=? AND edition=? ORDER BY case_id`, id, want)
          : this.#rows(`SELECT case_id, edition FROM published_case_members
                         WHERE bundle_id=? ORDER BY case_id, edition`, id))
          .map((r) => ({ case_id: r.case_id, edition: Number(r.edition) }));
        const got = this.#resolveOneCase(id, ms, caseId);
        if (!got.ok) return got;
        if (got.pick) { theCase = got.pick.case_id; asked = id; }
      }
      if (want != null) ed = want;
    }
    if (theCase && ed == null) {
      const top = this.#one(`SELECT MAX(edition) AS m FROM published_cases WHERE case_id=?`, theCase);
      ed = top && top.m != null ? Number(top.m) : null;
    }
    let state = theCase && ed != null ? this.caseEditionState(theCase, ed) : null;
    /* A RATIFIED BUNDLE THAT IS IN NO CASE still answers here, and it answers
       as what it is: an information bundle (or any non-inquiry) that was
       ratified and is verifiable by hash, carrying NO case identity, NO scope
       and NO completeness assertion, because it is not a case and this surface
       must not manufacture one for it. Before REC-44 it answered as a "case"
       because everything shared one table, which is the conflation D-187
       records. It is stated rather than dropped: the doorbell's promise is that
       ratified bytes answer, and that promise is not about inquiries. */
    if (!state && (asked || sha256 || id)) {
      const who = asked || id;
      /* CASE-5: the FINDING's number, never the case's. `ed` is the case
         edition this method resolved (or the one the caller asked for) and
         `published_bundles` has never been keyed on it. Before the flip the
         substitution was invisible; it is the same class as the two above. */
      const want = askedEdition != null ? askedEdition
                 : (sha256 == null && id != null && edition != null
                    && Number.isInteger(Number(edition)) ? Number(edition) : null);
      const r = sha256
        ? this.#one(`SELECT bundle_id, edition, bundle_sha FROM published_bundles WHERE bundle_sha=? ORDER BY edition LIMIT 1`, sha256)
        : want != null
          ? this.#one(`SELECT bundle_id, edition, bundle_sha FROM published_bundles WHERE bundle_id=? AND edition=?`, who, want)
          : this.#one(`SELECT bundle_id, edition, bundle_sha FROM published_bundles WHERE bundle_id=? ORDER BY edition DESC LIMIT 1`, who);
      /* D-309: THIS CALLER IS ASKING A DIFFERENT QUESTION AND NOW ASKS IT
         EXPLICITLY — not "which case" but "is this in NO case at all", which over
         a set is `length === 0` and was never really a scalar question. It was
         only ever spelled as one because a truthy scalar and a non-empty set
         happened to coincide while a finding could have at most one case. */
      if (r && this.#casesOfSha(r.bundle_id, r.bundle_sha, r.edition).length === 0) {
        const st = this.#looseEditionState(r.bundle_id, r.edition);
        if (st) { theCase = null; ed = r.edition; state = st; }
      }
    }
    /* D-561 (C-98.8): THE CODE CARRIES ITS CANNED TRANSLATION, from its row here (R33): the control plane's `json()`
       decorates by code from the catalogue only, and the row moved with this read. */
    if (!state) {
      /* DEC-49 REGION is-not-published */
      return { ok: false, reason: "NOT_PUBLISHED", ...rowOf("NOT_PUBLISHED"),
               detail: "no published edition answers to that. A case that was never published, an edition "
                     + "that does not exist and an id that never existed are one answer here, because the "
                     + "published projection is the only thing this read can see." };
      /* END DEC-49 REGION is-not-published */
    }

    /* Every edition of this CASE, so a reader holding an older one learns that a
       newer one exists WITHOUT this surface deciding on their behalf that the
       new one supersedes what they read (DEC-12: the supersession is SURFACED,
       never followed -- REC-17 renders the obligation from exactly this).
       Editions are over the CONTAINER, which DEC-44 makes their natural home. */
    const editions = theCase
      ? this.#rows(`SELECT edition, ratified_at, manifest_sha FROM published_cases WHERE case_id=? ORDER BY edition`,
                   theCase)
      : this.#rows(`SELECT edition, ratified_at FROM published_bundles WHERE bundle_id=? ORDER BY edition`,
                   state.findings[0].bundle_id);

    /* The graph, PER FINDING. published_edges is keyed from the finding that
       cited, so a case of two findings has two graphs and they are not merged:
       merging them would attribute one finding's citations to the other, and
       R4's division disclosure is a statement about a particular finding's
       question rather than about the case. */
    const findings = state.findings.map((fnd) => {
      const serves = [], names = [], unresolved = [];
      for (const e of this.#rows(
        `SELECT to_bundle, kind, disclosure FROM published_edges WHERE from_bundle=? ORDER BY kind, to_bundle`,
        fnd.bundle_id)) {
        if (e.disclosure === "name") { names.push({ to: e.to_bundle, kind: e.kind }); continue; }
        const t = this.#one(
          `SELECT edition, title, bundle_sha, ratified_at FROM published_bundles
           WHERE bundle_id=? ORDER BY edition DESC LIMIT 1`, e.to_bundle);
        /* A SERVE edge with nothing published behind it is a CONTRADICTION in the
           index and is REPORTED rather than swallowed. Silently dropping it would
           make the write-time restriction untestable from here — an assertion that
           no served edge names working material would pass on an empty list, which
           is an outcome that costs nothing to produce. It discloses nothing new:
           every row of this table comes from that finding's OWN ratified bundle.md,
           which any caller can fetch by hash, so the id is already public in the
           bytes the group signed. The honest cause is a target published and later
           purged; the dishonest one is the restriction having been broken, and the
           suite's negative control is exactly that. */
        if (!t) { unresolved.push({ to: e.to_bundle, kind: e.kind }); continue; }
        /* CASE-5: BY THE HASH. `t.edition` is the TARGET FINDING's own edition
           and this line asked `published_cases` for a container at that number —
           so a served leg pointing at a finding inside a case whose editions ran
           ahead of the finding's would report the wrong container hash, or none,
           on the surface a reader uses to check the leg. `case_edition` is
           stated so the reader can fetch the container the hash belongs to. */
        /* D-309: **ALL** OF THEM. A served leg points at a FINDING, and under
           clause 6 that finding may be a member of several cases — the shape the
           ruling exists for, since a leg resting on a mined finding is exactly
           the "lasting value" Bob named. Naming one container would tell a reader
           checking this leg to fetch a case the leg was never about. Each entry
           carries its own `manifest_sha` because the container hash is per case
           edition, so the reader can verify whichever one they hold. The scalar
           pair is the sole membership or null, as everywhere else. */
        const tms = this.#casesOfSha(e.to_bundle, t.bundle_sha, t.edition);
        const manifestOf = (cid, ced) =>
          this.#one(`SELECT manifest_sha FROM published_cases WHERE case_id=? AND edition=?`,
                    cid, ced)?.manifest_sha ?? null;
        const tm = this.soleCase(tms);
        serves.push({ to: e.to_bundle, kind: e.kind, edition: t.edition, title: t.title,
                      bundle_sha: t.bundle_sha, ratified_at: t.ratified_at,
                      case_id: tm ? tm.case_id : null, case_edition: tm ? tm.edition : null,
                      cases: tms.map((x) => ({ case_id: x.case_id, edition: x.edition,
                                               manifest_sha: manifestOf(x.case_id, x.edition) })),
                      manifest_sha: tm ? manifestOf(tm.case_id, tm.edition) : null });
      }
      return { ...fnd, serves, names, unresolved,
               division: {
                 parent: names.find((n) => n.kind === "division_parent")?.to ?? null,
                 siblings: names.filter((n) => n.kind === "division_sibling").map((n) => n.to).sort(),
                 detail: "a division's parent and siblings are NAMED and never served: the parent is terminal and "
                       + "can never be published, a sibling may not be, and a reader who can see one half of a "
                       + "divided question is entitled to know the other half exists (R4).",
               } };
    });

    const cRow = theCase
      ? this.#one(`SELECT manifest FROM published_cases WHERE case_id=? AND edition=?`, theCase, ed) : null;
    const manifest = cRow && cRow.manifest ? JSON.parse(cRow.manifest) : null;
    return { ok: true, caseId: theCase, edition: ed, scope: state.scope,
             /* CASE-5 / DEC-72 clause 2, ON THE ANONYMOUS PUBLIC READ, which is
                the surface the whole ruling is FOR. Clause 4's design sentence
                is *"each claim's own derived strength displayed beside the case's
                standard"* — a reader cannot do that if the standard is not on
                the answer, and until this item the only way to reach it was to
                pick one member's `required` block and hope the others agreed.
                `project` beside it because a bar with no publisher is a
                requirement nobody asserted. Both null for a case published
                before DEC-72, and null here is the design's absent-bar posture,
                not a bar of zero: `bar_detail` below says so in words. */
             project: state.project ?? null, bar: state.bar ?? null,
             bar_detail: state.bar
               ? "the standard of evidence this case was held to, read from its publishing project at the "
               + "moment of publication and frozen here (DEC-72). It is the CASE's property: no bar attaches "
               + "to any finding, and nothing composed it across projects. Each member's own derived pair is "
               + "printed beside it inside findings[], and a member may exceed it."
               : "NO BAR IS RECORDED for this case edition, and that is not a bar of zero. Either the case "
               + "was published before a case carried its own standard, or no bar was ever declared — in "
               + "which case the case claims no cleared standard and says so, because undetermined is "
               + "first-class here and is never rounded to a number nobody chose.",
             bias_acknowledgement: state.bias_acknowledgement ?? null,
             /* D-712: THE SIGNED CASE DOCUMENT, SERVED. `caseEditionState` builds `document` for exactly this read (the
                ratify path and the public read must not be able to disagree), and this return picks its fields by
                name (IC-22), so it names it. NULL UNTIL RATIFIED, never a partial; null on the loose branch. */
             document: state.document ?? null,
             /* IC-22, 2026-08-05 (UI-40): `opened` IS NOT PUBLISHED HERE. It was
                the instant the case edition was opened, and NOTHING read it —
                re-measured across the whole repository rather than inherited
                from the item that found it: zero reads in `civicos-ui`, in
                `newgroup`, in `docprofile`, in `pdf-worker`, in `tools`, and not
                one assertion in this battery. The surface renders `ratified_at`,
                which is the instant the record can actually stand behind.
                Removed rather than blanked, on REC-41's precedent: there is no
                key in the answer for a later refactor to re-expose and a caller
                cannot tell one was ever computed.

                CORRECTED 2026-08-05 (REC-58), AND THE CORRECTION IS THE WHOLE
                OF THAT ITEM. This block used to finish: "`caseEditionState`
                still carries `opened` and STILL SHOULD — [the publish-case op]
                returns it to the member who just published, which is a
                different op, a different class and a different question". The
                CONCLUSION was right and the REASON WAS FALSE. `publishCase()`
                computes no `opened`, reads none and returns none — the only
                occurrence of the letters in its whole body is the word
                "reopened" inside a refusal sentence.
                No sibling op was being spared, because no sibling op publishes
                it. REC-58 was queued off this sentence to sweep a site that
                does not exist, which is why the sentence is corrected here
                rather than quietly dropped: an item was spent on it.

                CORRECTED AGAIN 2026-08-08 (M0-12), AND THE SECOND CORRECTION IS
                WHY THAT ITEM EXISTS. Both sentences above named the op as
                `publishcase`. THERE IS NO SUCH OP. `publishcase` is the STORE'S
                DO PATH; `DO_PATH` in index.mjs aliases `op=publish` onto it, so
                the op whose name matches the method is routed AWAY from it and
                a caller sending the path name as `op=` gets `unknown op`. The
                routing chain, in full: **`op=publish` -> DO path `publishcase`
                -> `Store.publishCase()`**. REC-58 was right about the field and
                wrong about the op — REC-41's lesson for the FOURTH time, inside
                the very correction written to close the third. The mechanical
                check is `scripts/op-claims.mjs`, driven by
                `test/op-claims.test.mjs`, and it found this line.

                WHERE IT ACTUALLY GOES, measured: `caseEditionState` has TWO
                callers. `publish()` — the ratification committer — returns the
                state WHOLE as `case: caseState`, and that is an INTERNAL
                Durable Object hop; the control plane then builds `op=ratify`'s
                answer and the container manifest by NAMING their fields, and
                `opened` is in neither list. This method is the other caller and
                picks its fields likewise. So the field reaches no caller on any
                op, and the risk it carries is not that it IS published but that
                it BECOMES published — one `...state` spread in any of the three
                and a field with zero measured demand is on the wire with nobody
                having decided it. `test/case-opened.test.mjs` pins all three
                picks and holds the pair as a RELATION. */
             completeness: state.completeness, ratified_at: state.ratified_at,
             complete: state.complete, awaiting: state.awaiting,
             ...(asked ? { asked } : {}),
             findings,
             /* R36: the evidence package's block, computed at this read by the module that provides it. */
             evidence_package: this.#evidencePackage(theCase, ed, findings),
             manifest_sha: state.manifest_sha, manifest,
             files: (manifest && Array.isArray(manifest.parts) ? manifest.parts : []).map(
               (p) => ({ path: p.path, sha256: p.sha256, kind: p.kind, bytes: p.bytes ?? null,
                         finding: p.finding ?? null })),
             editions: editions.map((e) => e.edition), edition_index: editions,
             latest_edition: editions.length ? editions[editions.length - 1].edition : ed,
             case_detail: "a published case is a CONTAINER over one or more FINDINGS (DEC-44). Each finding "
                        + "carries its OWN conclusion, falsifier, basis and its own frozen PAIR of strengths; "
                        + "the case carries the scope that brought them together, the completeness "
                        + "assertion, and the group's acknowledgement of the bias the case was produced "
                        + "under — the last of these is a DISCLOSURE the reader weighs, never a verdict this "
                        + "plane reached (DEC-20, DEC-46). There is deliberately no case-level strength: "
                        + "composing two findings' strengths into one letter is the substitution R2 forbids.",
             graph_detail: "each finding's serves[] is what this surface may hand over — every entry names a "
                         + "published edition. names[] is what it may only NAME. unresolved[] is an edge "
                         + "classified servable at publication with no published edition behind it now, stated "
                         + "rather than dropped; it should be empty." };
  }

  /* REC-128 — THE ONE READ CHOKEPOINT FOR WHO DELIVERED A RATIFICATION. Every
     read that serves a ratification (the finding rows, the case document, the
     public case read and so the container that travels) answers through here,
     from the stored `delivered_by` column and from NOTHING ELSE: in particular
     never from `attestor_member`, so a row written before the column existed
     reads UNDETERMINED, stated, rather than back-filled from its signer.
     `deliverer.control.mjs`'s `backfill` arm edits exactly this line. */
  #deliveredBy(row) { return delivererOf(row ? row.delivered_by : null); }

  /* A ratified bundle that belongs to NO case, in the same shape as a case
     edition so one renderer serves both — with `caseId: null`, no scope and no
     completeness, because it is not a case and saying otherwise is the exact
     claim DEC-44 corrects. This is what an information bundle's ratification
     is: verifiable bytes with a signature and no case-level assertion. */
  #looseEditionState(bundleId, ed) {
    const r = this.#one(
      `SELECT bundle_id, title, bundle_sha, ratified_at, attestor_key, attestor_member, delivered_by, gate_version,
              sig_armored, strength, required, parts
       FROM published_bundles WHERE bundle_id=? AND edition=?`, bundleId, ed);
    if (!r) return null;
    /* REC-47: `bias_acknowledgement: null` for the same reason `scope` and
       `completeness` are null here — a ratified bundle that is not a case makes
       no case-level assertion, and inventing one would be the exact claim
       DEC-44 corrects. Stated as null rather than omitted, so a renderer sees
       "no such assertion" rather than a missing key it might read as absence of
       bias. */
    return { caseId: null, edition: ed, scope: null, completeness: null,
             bias_acknowledgement: null,
             /* D-712: no case document — this is not a case. Stated as null so both branches answer one key set. */
             document: null,
             /* CASE-5: `project` and `bar` null here for the reason `scope` and
                `completeness` already are — whose production a thing is and what
                standard it was held to are CASE assertions, and this is not a
                case. Stated rather than omitted so a renderer sees "no such
                assertion" instead of a missing key it might read as a bar of
                zero, which is the distinction the design doc's absent-bar clause
                is entirely about. */
             project: null, bar: null,
             opened: r.ratified_at, ratified_at: r.ratified_at, manifest_sha: null,
             complete: true, awaiting: [],
             findings: [{ ord: 0, bundle_id: r.bundle_id, title: r.title, bundle_sha: r.bundle_sha,
                          /* CASE-5: the same two keys `caseEditionState` serves
                             per member, so ONE renderer still serves both shapes
                             — which is this method's whole reason for existing.
                             `version_sha` is null because nothing pinned these
                             bytes: no case committed to them. `role` is null
                             because a designation is a case's partition and there
                             is no case here to be a member of. */
                          version_sha: null, role: null, edition: ed,
                          ratified_at: r.ratified_at, gate_version: r.gate_version, sig_armored: r.sig_armored,
                          attestor: { member: r.attestor_member, key_b64: r.attestor_key },
                          delivered_by: this.#deliveredBy(r),
                          strength: r.strength ? JSON.parse(r.strength) : null,
                          required: r.required ? JSON.parse(r.required) : null,
                          parts: r.parts ? JSON.parse(r.parts) : [] }],
             detail: "this is a RATIFIED BUNDLE that is not a member of any published case: it was never "
                   + "published as a finding, so it carries no case identity, no scope statement, no "
                   + "completeness assertion and no bias acknowledgement — those are claims a CASE makes, "
                   + "and this is not one. Its bytes are verifiable by hash exactly as any other ratified "
                   + "bytes are." };
  }

  /* Which case a published finding belongs to, at a given edition or at its
     latest. ONE lookup on published_case_members' bundle_id index — the query
     that earns the table its second keel. */
  /* Which case a WORKING document is being published into — CORRECTED BY
     CASE-5b, for the reason `#caseClaimInBytes` above carries in full.

     IT WAS READ OUT OF THE DOCUMENT'S OWN `case_id`, and the comment said
     exactly why: C-21.1's freshness comparison is "this case edition against the
     previous edition of THAT SAME CASE", and the case had to be the document's
     own assertion — inside the bytes the member would sign — rather than
     something the projection substituted. That reasoning is UNCHANGED and is why
     this now reads the CASE DOCUMENT: the assertion is still signed, by the
     case's own signer, over bytes that name this finding at this finding's hash.
     What would NOT be acceptable is falling back to `published_case_members`
     alone, because that is the projection, and a document could then be gated
     against a case it is no longer prepared into.

     PINNED FIRST, PREPARED SECOND: a ratified relation is the record's answer
     and an unratified case document is this act's own preparation — the same
     order `publishCase()` resolves a case identity in, and for the same reason. */
  /* ===== D-309 / DEC-72 clause 6, 2026-09-10: SITE 5 OF CASE-6's NINE, AND THE
     DECISION HERE IS **ALL CASES**.

     WHAT THIS ANSWERS AND FOR WHOM. Its one caller is `gateFacts`, which feeds
     `publishedCaseRegistryFor` — the registry C-21.1's freshness rule reads. The
     question is "what case, or cases, is the document being gated prepared into",
     and the freshness comparison is against *the previous edition of THAT SAME
     CASE*. Under clause 6 a finding can be prepared into several, so the honest
     answer is every one of them: giving the registry ONE case would gate the
     document against one case's prior edition and leave the others unexamined,
     which is a check that has quietly stopped asking about half its subject.

     THE CALLER ALREADY WANTED A LIST. `publishedCaseRegistryFor` takes an ARRAY
     and always has; the old scalar was being wrapped in `[ ]` at the call site.
     So this site cost nothing to correct, which is worth recording: the shape was
     right before the fence came down and only the reader was narrow.

     PINNED FIRST, PREPARED SECOND is UNCHANGED and its reasoning above still
     holds in full — a ratified relation is the record's answer and an unratified
     case document is this act's own preparation. What changed is only that each
     half may now answer with more than one. */
  caseClaimsOf(bundleId) {
    const b = this.#headRow(bundleId);
    if (!b) return [];
    const pinned = this.#rows(
      `SELECT DISTINCT case_id FROM published_case_members WHERE bundle_id=? AND version_sha=?
        ORDER BY case_id`, bundleId, b.bundle_sha).map((r) => r.case_id);
    if (pinned.length) return pinned;
    const claim = this.#caseClaimInBytes(bundleId);
    return claim ? [claim.case_id] : [];
  }

  /* ===== D-309: SITES 6 AND 7 OF CASE-6's NINE (the `AND edition=?` spelling and
     the `ORDER BY edition DESC LIMIT 1` spelling), AND THE DECISION IS **ALL
     CASES**, RETURNED AS A SET OF DISTINCT CASE IDS.

     `DISTINCT` IS LOAD-BEARING RATHER THAN TIDY, and it is what keeps the
     over-strictness promise. A finding can be rostered by SEVERAL EDITIONS OF ONE
     CASE — that has always been true and has nothing to do with clause 6 — so a
     row-per-membership answer would report two entries for a finding that serves
     exactly one case, and every caller deciding "is this set-valued" on
     `length > 1` would start calling single-case findings ambiguous. The
     set-valued question this item opened is over CASES, so the set is over cases.

     The old scalar took the HIGHEST edition. Nothing here needs an edition at all
     — the one caller (`publishedRegistryFor`) is building a per-edition registry
     entry and wants the case identity — so the edition sort is dropped rather
     than carried forward unused. */
  #casesOf(bundleId, edition = null) {
    return (edition != null
      ? this.#rows(`SELECT DISTINCT case_id FROM published_case_members WHERE bundle_id=? AND edition=?
                     ORDER BY case_id`, bundleId, edition)
      : this.#rows(`SELECT DISTINCT case_id FROM published_case_members WHERE bundle_id=?
                     ORDER BY case_id`, bundleId)).map((r) => r.case_id);
  }

  /* THE SOLE MEMBERSHIP, OR NULL — D-309's ONE MIGRATION RULE, WRITTEN ONCE SO
     FIVE READ OPS CANNOT SPELL IT FIVE WAYS.

     Every op that used to answer `case_id` / `case_edition` as a scalar now
     serves a `cases` ARRAY beside it and keeps the scalar for the shape that has
     exactly one answer. This computes that scalar, and the ONLY thing it will
     ever return is a case the record genuinely holds alone: **it returns null
     rather than choosing**, which is the entire difference between this item and
     the nine silent `LIMIT 1` guesses CASE-6 refused to ship.

     IT COLLAPSES EDITIONS AND NOT CASES, for `#casesOf`'s reason one paragraph
     up. A finding pinned by editions 1 and 2 of ONE case is NOT set-valued and
     answers with that case at its NEWEST edition — byte-identical to what the old
     `ORDER BY edition DESC LIMIT 1` returned. That equality is the whole of
     D-309's over-strictness arm: a single-case finding answers exactly as it did
     yesterday, and it does so by construction here rather than by care at five
     call sites. */
  soleCase(list) {
    const ids = [...new Set((list || []).map((x) => x.case_id))];
    if (ids.length !== 1) return null;
    let top = null;
    for (const x of list) if (top == null || Number(x.edition) > top) top = Number(x.edition);
    return { case_id: ids[0], edition: top };
  }

  /* D-309: THE READ SURFACE'S HALF OF CLAUSE 6 — one case to serve, chosen by the
     READER and never by this plane.

     `publishedCase()` serves ONE case edition: its scope, its completeness
     assertion, its bias acknowledgement, its bar, its findings. That is a single
     artifact and cannot be two. So when a finding serves several cases this
     surface has three options and only one of them is honest — serve the newest
     (a guess dressed as an answer), serve all (a container that is not an
     artifact anybody published), or SAY SO AND NAME THEM.

     THE CALLER'S OWN `caseId` WINS WHENEVER IT ANSWERS, which is what keeps this
     a resolution aid rather than a wall: a reader who already knows which case
     they mean passes it and is served, and only a reader who has not said is
     asked. That ordering matters — refusing someone who DID say would be a fence
     tighter than its rule.

     IT NEVER REFUSES AN EMPTY LIST. A finding in no case at all is not ambiguous,
     it is loose, and the loose arm further down is what answers it — refusing
     here would break the doorbell's promise that ratified bytes answer. */
  #resolveOneCase(bundleId, list, namedCase = null) {
    const rows = list || [];
    if (!rows.length) return { ok: true, pick: null };
    const named = String(namedCase ?? "").trim();
    if (named) {
      const mine = rows.filter((x) => x.case_id === named);
      if (mine.length) return { ok: true, pick: this.soleCase(mine) };
    }
    const sole = this.soleCase(rows);
    if (sole) return { ok: true, pick: sole };
    const cases = [...new Set(rows.map((x) => x.case_id))].sort();
    /* UI-81 / C-44.2: THE CODE NOW CARRIES ITS CANNED TRANSLATION (DEC-49). It reached the published
       case page raw — no `*_CHECKS` row named it, so the guard could not see the one refusal a stranger
       meets on that page. Built from its row (`rowOf`, C-44.2 moved here with it, R33), so `reason` and `code` are one literal and the wire only GAINS `code`, `check` and
       `translation`; every field it carried is unchanged (IC-185). */
    /* DEC-49 REGION is-finding-in-several-cases */
    return { ok: false, reason: "FINDING_IN_SEVERAL_CASES", ...rowOf("FINDING_IN_SEVERAL_CASES"), target: bundleId, cases,
             memberships: rows.map((x) => ({ case_id: x.case_id, edition: x.edition })),
             detail: `${bundleId} is a published finding of ${cases.length} cases (${cases.join(", ")}). `
                   + `A finding can serve many cases (DEC-72 clause 6), and each case is its own artifact `
                   + `with its own scope and completeness assertion — so this read cannot choose one for `
                   + `you. Ask again naming the case you mean.` };
    /* END DEC-49 REGION is-finding-in-several-cases */
  }

  /* CASE-5 / DEC-72: WHICH CASE EDITION A SET OF PUBLISHED BYTES BELONGS TO,
     RESOLVED BY THE HASH RATHER THAN BY A NUMBER.
     `#casesOf(bundleId, edition)` above takes a CASE edition and is still exactly
     right when a caller holds one. What its callers actually held, in four of
     the five places it was used, was a `published_bundles` row — whose `edition`
     is the FINDING'S, and passing that as the case's is the same conflation
     `caseEditionState` carried, arriving through the argument list instead of
     through a WHERE clause. Before the flip the two numbers agreed and nobody
     could see it; after it a finding at its own edition 1 inside a case at
     edition 2 would resolve to NO CASE AT ALL and read as unpublished material.
     Answers BOTH halves — the case and THE CASE'S EDITION — because every caller
     that wanted one wanted the other and was deriving it from the wrong number.
     The fallback is the pre-CASE-3 row whose pin is honestly NULL, and for those
     rows the finding's edition IS the case's, which is the model they were
     written under.
     IT USED TO SAY `ORDER BY edition DESC LIMIT 1`, described as a real bound
     rather than a formality: one sha can in principle be pinned by more than one
     case edition, so the newest membership answered. Beside it stood the sentence
     that turned out to be the most useful in the file — *"Nothing writes that
     shape today"* — and CASE-6 pointed it at the fence that kept it true.

     ===== D-309, 2026-09-10: SITES 8 AND 9 OF CASE-6's NINE, AND THE SENTENCE IS
     NOW FALSE ON PURPOSE. `FINDING_IN_ANOTHER_CASE` is gone, so something DOES
     write that shape: a finding can be pinned by case A and case B at one hash,
     which is precisely what DEC-72 clause 6 rules it may be. The cross-reference
     did its job — the two moved together, in one item, and neither drifted.

     **THE DECISION HERE IS ALL MEMBERSHIPS, RETURNED AS AN ARRAY, AND IT IS NOT
     A CHOICE BETWEEN SHAPES.** The old comment already diagnosed what would
     happen if this stayed scalar past the fence: it *"starts answering a
     set-valued question with its newest element, which reads as an answer and is
     a guess."* This helper has five callers and they want three different things
     — `publishedList` and `publishedEditions` want to REPORT every membership,
     `publishedCase`'s loose arm wants the BOOLEAN "in no case at all", and
     `publishedCase`'s resolution arms want to serve ONE case and must refuse
     rather than pick when there are two. An array serves all three; a scalar
     serves none of them honestly. Each caller's decision is argued at its own
     site, because deciding them here is how one reader's convenience becomes
     another reader's overclaim.

     THE LEGACY FALLBACK KEEPS ITS MEANING AND ITS ORDER: pre-CASE-3 rows whose
     pin is honestly NULL, for which the finding's edition IS the case's, because
     that is the model they were written under. It is consulted only when the pin
     answers nothing, exactly as before. */
  /* D-309: SITE 2's QUERY, LIFTED OUT OF `publish()` AND PUT BESIDE ITS SIBLINGS,
     AND THE REASON IS A MEASUREMENT RATHER THAN TIDINESS — stated in full because
     a reader could otherwise take it for evasion, and it is the opposite.

     `meaning-bounds.test.mjs` grades an op OPAQUE when its method contains a
     `#rows(` call and publishes no collection: *"rows came out of the store and
     this reader could not say what happened to them."* Correcting site 2 put the
     first `#rows(` into `publish()`'s own body, and the walk moved `op=publish`
     out of NO-COLLECTION and into OPAQUE — a blind spot on the heaviest act in
     the system, which is the state `op=airunlog` was in while a ratchet read
     green over it.

     THE OLD CLASSIFICATION WAS AND REMAINS THE TRUE ONE. These rows do NOT reach
     the wire: they drive a divergence refusal, a per-case flag discharge, and a
     scalar bar projection, and the act answers with `caseCount` — a number — and
     nothing else. `publish()` genuinely publishes no collection. The `#rows(` in
     its body was the only thing making it look otherwise, so the query moved to
     where the file's other which-case readers already live rather than the
     roster growing a member that would have been describing the wrong thing.

     IT IS NOT HIDDEN FROM ANYTHING. This helper is in `store.mjs`, it is counted
     by `multicase.test.mjs`'s census as a full member of CASE-6's class, and the
     census asserts the class total has not shrunk — so a query moved out of sight
     of one walk is still in sight of the one that exists to count it.

     WHAT IT ANSWERS: which case editions froze THESE EXACT BYTES, one entry per
     CASE at that case's newest edition holding them — the same collapse every
     other D-309 site takes, so "how many cases is this member in" has one answer
     across the file. The JOIN on `published_cases` is unchanged and still does its
     job: only case editions that exist are membership. */

  /* D-431 (b): WHICH FINDINGS OF A RATIFIED CASE REST ON THIS BUNDLE, and each one's publishing project.
     Asked over every roster row a RATIFIED case edition PINNED (`version_sha` set, joined to
     `published_cases`, which only `ratifyCaseDocument` writes), at the PINNED bytes — the bytes the case
     froze and the finding will be signed at, never whatever `bundle.md` says today (the working `refs`
     table is a projection of today's document and would be a second edge set). The bytes are read from the
     live file when it is still at the pin and from `history` when the finding has moved since. PINNED BYTES
     THIS STORE CANNOT READ rest on nothing here: the question is then undeterminable, and admitting a
     bundle on an undetermined answer is the direction this defect runs in. The rows are a roster, bounded
     by the cases ever ratified, and never a walk of the corpus. */
  ratifiedFindingsRestingOn(bundleId) {
    const pins = this.#rows(
      `SELECT DISTINCT m.case_id, m.bundle_id, m.version_sha, cs.project_id
         FROM published_case_members m
         JOIN published_cases c ON c.case_id=m.case_id AND c.edition=m.edition
         LEFT JOIN cases cs ON cs.case_id=m.case_id
        WHERE m.version_sha IS NOT NULL AND m.bundle_id<>?
        ORDER BY m.case_id, m.bundle_id`, bundleId);
    const out = [];
    for (const p of pins) {
      const at = { content: this.record.textAtSha(p.bundle_id, p.version_sha) };
      if (!at || typeof at.content !== "string") continue;
      const fm = parseFrontmatter(at.content).data || {};
      if (publishedGraphEdges(fm).some((e) => e.disclosure === "serve" && e.to === bundleId))
        out.push({ case_id: p.case_id, finding: p.bundle_id, project: p.project_id ?? null });
    }
    return out;
  }

  pinnedCaseEditionsOf(bundleId, bundleSha) {
    const rels = this.#rows(
      `SELECT m.case_id, m.edition, m.role FROM published_case_members m
         JOIN published_cases c ON c.case_id=m.case_id AND c.edition=m.edition
        WHERE m.bundle_id=? AND m.version_sha=?
        ORDER BY m.case_id, m.edition DESC`, bundleId, bundleSha);
    const byCase = [];
    for (const r of rels) if (!byCase.some((x) => x.case_id === r.case_id)) byCase.push(r);
    return byCase;
  }

  #casesOfSha(bundleId, bundleSha, fallbackEdition = null) {
    const rows = bundleSha
      ? this.#rows(`SELECT case_id, edition FROM published_case_members
                     WHERE bundle_id=? AND version_sha=? ORDER BY case_id, edition`, bundleId, bundleSha)
      : [];
    if (rows.length) return rows.map((r) => ({ case_id: r.case_id, edition: Number(r.edition) }));
    const legacy = fallbackEdition != null
      ? this.#rows(`SELECT case_id, edition FROM published_case_members
                     WHERE bundle_id=? AND edition=? AND version_sha IS NULL ORDER BY case_id`,
                   bundleId, fallbackEdition)
      : [];
    return legacy.map((r) => ({ case_id: r.case_id, edition: Number(r.edition) }));
  }

  /* REC-22: which of these ids have a published edition, and what each one FROZE
     -- the one indexed lookup that lets the public read path say, per basis leg,
     whether it is a leg the page can SERVE or one it can only NAME. Reuses
     publishedRegistryFor, which C-21.2 already reads: a leg names an edition
     (DEC-12) and the comparison is against THAT edition's frozen pair, so the
     shape a check needs and the shape a reader needs are the same shape. */
  publishedTargets(ids) {
    const list = (Array.isArray(ids) ? ids : String(ids || "").split(","))
      .map((s) => String(s || "").trim()).filter(Boolean).slice(0, 200);
    return { ok: true, registry: this.publishedRegistryFor(null, list) };
  }
  /* REC-14 / P8's justifying query, and the reason inquiry_exclusions exists as
     a TABLE and not only as bytes: "WHICH CASES EXCLUDED THIS DOCUMENT" —
     invariant 7's only mechanical enforcement point at the case level — as ONE
     indexed lookup on inquiry_exclusions_target, never a scan of every
     completeness block in the store.

     Each row carries the case's CURRENT STATE and the EDITION the assertion was
     taken from, so "which PUBLISHED cases excluded it" is a filter the caller
     can apply on what it is given rather than a distinction this read makes on
     their behalf: a case that was reopened after excluding a document has still
     excluded it in every edition already published, and hiding those rows would
     be the surface deciding what the record forgets.

     D-15: viewer-gated like every other read that can name a bundle, and fails
     closed on an absent viewer. */
  excludedBy(targetId, viewer = null) {
    if (!targetId) return { ok: false, reason: "NO_ID", detail: "excludedby requires ?id=" };
    const gate = viewerPredicate(viewer);
    /* inquiry R18: the live exclusions naming the target that the viewer may see, from `inquiry_exclusions`. */
    const rows = [...this.inquiry.exclusionsNaming(targetId, viewer)];
    /* D-442 / BIO_Publication_v0_1.md §3 rule 12 (d): AND THE CASES WHOSE DOCUMENT STATES THE EXCLUSION —
       every case published under rule 12, whose members carry no exclusion of their own. ONE indexed,
       gated statement over `case_exclusions_target`, never a scan of case documents and no read per row:
       the projection already holds one row per MEMBER (the finding a row has always named), with the
       member's own edition and the publishing project. A member the viewer cannot see is gated out by the
       SAME predicate as above. An UNSIGNED document is working material and answers only to standing in its
       project (REC-130's rule, `hasCaseStanding`'s predicate spelled as SQL: a member-scope viewer has it,
       a denied one never, and any other only where it can see the project); a ratified one is public.
       Legacy members keep answering through the first read (rule 12 (e)). */
    const standing = gate.scope === "member" ? "1"
      : gate.scope === "DENY" ? "0"
      : `EXISTS (SELECT 1 FROM bundles b WHERE b.bundle_id = x.project_id AND b.object_type='project' AND (${gate.sql}))`;
    rows.push(...this.#rows(
      `SELECT x.bundle_id, x.ord, x.member_edition AS edition, x.description, x.reason, x.author, x.at,
              b.current_state, b.title, x.case_id, x.edition AS case_edition, 'case_document' AS "from"
         FROM case_exclusions x
         JOIN case_documents d ON d.case_id = x.case_id AND d.edition = x.edition
         JOIN bundles b ON b.bundle_id = x.bundle_id
        WHERE x.target_id=? AND (${gate.sql}) AND (d.ratified_at IS NOT NULL OR ${standing})
        ORDER BY x.case_id, x.edition, x.bundle_id, x.ord`,
      targetId, ...gate.args, ...(standing.startsWith("EXISTS") ? gate.args : [])));
    return { ok: true, targetId, cases: rows,
             detail: "each row is a case that named this document in its completeness exclusions, with the "
                   + "edition the assertion was taken from and the case's current state." };
  }

  /* REC-14: the published projection as the CHECK CATALOG needs it — the shape
     C-21.1 and C-21.2 read. Built for the bundle being written or gated AND for
     every target its basis names, in ONE indexed query rather than a probe per
     leg: a case's own prior edition (freshness) and the frozen pair of every
     published case beneath it (inheritance) are the two facts neither the
     checker nor a caller can supply for itself. */
  /* REC-44: THIS REGISTRY IS PER FINDING AND STAYS PER FINDING. It carries the
     frozen PAIR of every published finding and it is what C-21.2 reads: a
     basis leg rests on a FINDING (one proposition, one falsifier — DEC-32) and
     inherits THAT finding's frozen strength on THAT axis at THAT edition. It no
     longer carries `completeness`, which went up one altitude to the CASE with
     C-21.1 (publishedCaseRegistryFor below). The two must not be collapsed:
     collapsing them is what DEC-44 names as the mistake, one level down. */
  publishedRegistryFor(bundleId, extraTargets = []) {
    const ids = [...new Set([bundleId, ...extraTargets].filter(Boolean))];
    if (!ids.length) return {};
    /* D-390 (2026-09-23): THE LIST IS BOUND AS ONE JSON VALUE, not one variable per id. `publishedTargets`
       hands this a list cut at 200 and a finding's basis is unbounded, and one statement binding more than
       ~100 variables is refused by workerd (D-36) — reproduced through `/publishedtargets` by
       `test/frontier-chunk.test.mjs`. `json_each(?)` is this file's own precedent (the authored-capture read)
       and binds ONE variable whatever the list's length. Not chunked, because a loop around the read hides
       its row source from `derivation-bounds.test.mjs`'s reader while the per-row work is unchanged. */
    /* D-598 (BOB #34, 2026-09-25 03:00Z; BIO_Publication_v0_1.md §3 rule 5): EACH ENTRY IS KEYED ON ITS
       OBJECT TYPE, because C-21.2's inheritance rule applies to published INQUIRIES only. A document or an
       observation published as a case's EVIDENCE (D-431(b)) sits in `published_bundles` beside the findings
       and freezes no strength of its own, so a registry that did not say which was which read every
       evidence document as a published finding and forced every later leg on it to `grade_source:
       inherited` — from nothing. The type is read from `bundles`, the record's own row, never from a
       caller; a published row with no `bundles` row answers `object_type: null`, UNDETERMINED, and
       checkInheritedLeg holds the inquiry rule over it rather than guessing it is evidence. The key is
       carried rather than the non-inquiries dropped because `publishedTargets` serves this same registry
       to the public read path, where a published evidence document is still a leg the page can SERVE. */
    const rows = this.#rows(
      `SELECT p.bundle_id, p.edition, p.title, p.bundle_sha, p.ratified_at, p.strength, b.object_type
       FROM published_bundles p LEFT JOIN bundles b ON b.bundle_id = p.bundle_id
       WHERE p.bundle_id IN (SELECT value FROM json_each(?)) ORDER BY p.bundle_id, p.edition`,
      JSON.stringify(ids));
    const reg = {};
    for (const r of rows) {
      const e = reg[r.bundle_id]
        || (reg[r.bundle_id] = { object_type: r.object_type ?? null, latest: 0, editions: {} });
      const strength = r.strength ? JSON.parse(r.strength) : null;
      const byAxis = {};
      for (const a of Array.isArray(strength) ? strength : [])
        if (a && a.axis) byAxis[a.axis] = { state: a.state, grade: a.grade ?? null };
      e.editions[String(r.edition)] = {
        edition: r.edition, title: r.title, bundle_sha: r.bundle_sha, ratified_at: r.ratified_at,
        /* D-309: **ALL** OF THEM. This registry is per FINDING and stays per
           finding (the header above), and a finding's case membership is now a
           set — so `case_ids` carries every one and `case_id` keeps its old name
           as the sole membership or null. Nothing in the check catalog reads
           either key today (measured: zero hits for this registry's `case_id` in
           `checks/bio-checks.mjs`), so the correction is to the shape rather than
           to a live gate — which is why it is worth making now, before something
           starts reading a field that would have been quietly guessing. */
        case_ids: this.#casesOf(r.bundle_id, r.edition),
        case_id: this.soleCase(
          this.#casesOf(r.bundle_id, r.edition).map((c) => ({ case_id: c, edition: r.edition })))?.case_id ?? null,
        capture: byAxis.capture || null, connection: byAxis.connection || null,
        /* MK-2 / IC-142: the testimony axis ONLY where the edition froze one, so
           every edition published without it answers byte-identically, and
           checkInheritedLeg reads its absence as ABSENT rather than as a grade. */
        ...(byAxis.testimony ? { testimony: byAxis.testimony } : {}) };
      if (Number(r.edition) > e.latest) e.latest = Number(r.edition);
    }
    return reg;
  }

  /* REC-44 / C-21.1: the published projection AT CASE ALTITUDE — what each
     EDITION OF A CASE asserted about its own limits. The freshness gate needs
     exactly this and nothing from any finding: "was this completeness claim
     carried forward byte-identical from the previous edition" is a question
     about the CASE, because what a reader was given is a case edition.
     Deliberately a SECOND function beside publishedRegistryFor rather than one
     registry serving both: they answer at different altitudes and one shape
     serving two altitudes is how the collapse DEC-44 corrects happened. */
  publishedCaseRegistryFor(caseIds = []) {
    const ids = [...new Set((Array.isArray(caseIds) ? caseIds : [caseIds]).filter(Boolean))];
    if (!ids.length) return {};
    const reg = {};
    /* D-443: ONE json_each value, `publishedRegistryFor`'s precedent above (D-36). */
    for (const r of this.#rows(
      `SELECT case_id, edition, scope, completeness, bias_acknowledgement, ratified_at FROM published_cases
       WHERE case_id IN (SELECT value FROM json_each(?)) AND ratified_at IS NOT NULL ORDER BY case_id, edition`, JSON.stringify(ids))) {
      const e = reg[r.case_id] || (reg[r.case_id] = { latest: 0, editions: {} });
      e.editions[String(r.edition)] = {
        edition: r.edition, scope: r.scope ?? null, ratified_at: r.ratified_at,
        /* REC-47: carried BESIDE completeness, never folded into it — C-21.1
           compares both and they are two claims (DEC-46). */
        bias_acknowledgement: r.bias_acknowledgement ?? null,
        completeness: r.completeness ? JSON.parse(r.completeness) : null };
      if (Number(r.edition) > e.latest) e.latest = Number(r.edition);
    }
    return reg;
  }
}

const instances = new WeakMap();

/** The one instance for a host (K61). The first call creates it with `deps` (a test passes its own), creates its
 *  tables, declares them to purge (R31), and registers with promotion what this module provides (K206, N152): the
 *  facts `caseMember` (R4), `publishedRegistry` and `publishedCaseRegistry` (R7), and the revision flag (R5) as its
 *  step's projection, raised in the promotion's transaction after the new version is written. */
export function publicationOf(host, deps) {
  let p = instances.get(host);
  if (!p) {
    const d = deps || {};
    const storage = d.storage || host.storage;
    const record = d.record || recordOf(host);
    const membership = d.membership || membershipOf(host, { record });
    const promotion = d.promotion || promotionOf(host, { record, membership });
    p = new Publication({ ...d, host, storage, record, membership, promotion });
    instances.set(host, p);
    p.migrate();
    record.declarePurge("publication", PUBLICATION_TABLES, { exempt: PUBLICATION_EXEMPT });
    promotion.registerFact("caseMember", "publication", (id) => !!p.caseRelation(id).member);
    promotion.registerFact("publishedRegistry", "publication", (id, targets) => p.publishedRegistryFor(id, targets));
    promotion.registerFact("publishedCaseRegistry", "publication", (ids) => p.publishedCaseRegistryFor(ids));
    /* R5: `base` is the sha this promotion REPLACES; a case edition that froze it is flagged. A pure INSERT that
       refuses nothing, so no promotion fails on it. */
    promotion.registerStep("publication", {
      project: (c) => { p.flagCasesOnRevision(c.bundleId, c.base ?? null, stampInstant("second")); return null; } });
  }
  return p;
}

/** Which purge declaration names one of this module's tables (record-core R21: each owner declares its own). */
export function publicationOwns(t) {
  const name = typeof t === "string" ? t : t && t.name;
  return PUBLICATION_TABLES.some((x) => (typeof x === "string" ? x : x.name) === name) || PUBLICATION_EXEMPT.includes(name);
}

/** The module's ops (K3), as entries of the legacy store's op map. `viewer`, `by` and `secretSha` are the control
 *  plane's stamps, read from the query, so a caller's own copy in a body never wins. */
export function publicationOps(p, url, body) {
  const q = (k) => url.searchParams.get(k);
  const b = body && typeof body === "object" ? body : {};
  return {
    /* CASE-4 / DEC-72: unstamped; every field is already served to a stranger (R6). */
    caseflags: () => p.caseFlags({ caseId: q("case"), target: q("target"), limit: q("limit"),
                                   outstandingOnly: q("outstanding") === "1" }),
    /* MK-7: WHO CHOSE comes from the query string, where the control plane stamped it (R17). */
    attribute: () => p.attributeObservation({ caseId: b.caseId ?? null, edition: b.edition ?? null,
                                              observation: b.observation ?? null, level: b.level ?? null, by: q("by") }),
    publishededitions: () => p.publishedEditions(q("id")),
    /* REC-22: the public read path's store side, unstamped: it reads the published projection only (R25). */
    publishedcase: () => p.publishedCase({ id: q("id"), edition: q("edition"), caseId: q("caseId") || null,
                                           sha256: (q("sha256") || "").toLowerCase() || null }),
    /* REC-44: internal only, and no caller's op (R15). */
    recordcasemanifest: () => p.recordCaseManifest(b),
    publishedtargets: () => p.publishedTargets(q("ids")),
    excludedby: () => p.excludedBy(q("id"), q("viewer")),
    export: () => p.exportManifest({ note: q("note") }),
    exportlog: () => p.exportLog({ limit: q("limit") }),
    publishedmanifest: () => p.publishedManifest(),
    /* REC-130: both carry the viewer the control plane STAMPS, and fail closed on its absence. */
    casedocfacts: () => p.caseDocumentFacts(q("case"), q("edition"), q("viewer")),
    casedocument: () => p.caseDocument(q("case"), q("edition"), q("viewer"), q("secretSha")),
    verify: () => p.verifySha((q("sha256") || "").toLowerCase()),
    publishedlist: () => p.publishedList(),
    /* D-734: internal, the signed text behind a published case-document hash; the control plane re-hashes it. */
    publishedcasedoctext: () => p.publishedCaseDocumentText((q("sha256") || "").toLowerCase()),
  };
}
