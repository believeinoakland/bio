/* publication — the published record (requirements: `build/requirements/publication.md`; BIO_Publication_v0_1.md
 * §1–§4, §6A.2, §6A.3, §7; Membership v2 §8). Publication is the one irreversible act: what the group stands behind
 * leaves the instance, content-addressed and signed, so a stranger can verify without this instance that the group
 * said what it claims and rested it on what it says. This module holds every case document (unsigned and signed) and
 * the published projection, answers which cases a finding serves, and lets a member choose how their firsthand words
 * are attributed; the verified working-corpus export is `corpus-export`'s (K1024), which this module creates and no
 * longer answers for (N483: its ops are corpus-export's `corpusExportOps`). The two signing ceremonies (`ratification`)
 * and preparing a case (`case-authoring`) write through it (R21, R22), so one module keeps R24: nothing updates or deletes a published
 * row, a signed document or a published object.
 *
 * Extracted from the legacy modules (T8, layer 8; K3, K31, K57, K94, K102): `store.mjs` (the case relation and the
 * revision flags, the case document reads, the MK-7 attribution act, the verified export and its log (moved on to
 * `corpus-export` by the second split, K1024), the pinning helpers and the commits, and the dispatch entries), `index.mjs` (the door's `caseflags` and `casedocument` arms,
 * `./door.mjs`) and the check catalogue (C-92.1–.9, now `./checks.mjs`, with C-122.1 new there). Its tables are
 * `./schema.mjs`. It reads the record's shared grammar (the front-matter parser, actor identity, the one SHA-256, the
 * section locator) from `record-grammar`, never from the catalogue (T19, rule 1). The legacy code's comments moved with it; where one names a store
 * method that is not this module's (`publishCase`, `ratifyCaseDocument`, `publish`, `#caseDocumentText`,
 * `#reauthorAcknowledgements`) it names the act as it stands.
 *
 * Split four ways for size (K617, K651): the case document's grammar is `case-grammar`'s (read from there and
 * re-exported unchanged); the published record served without a credential (verify, the lists, the published case,
 * the manifest) is `public-read`'s, which reads this module's tables under R40 and calls its services R53–R55; a
 * project's stage is `project-stage`'s. Every table and every write stays here. `./worker.mjs`, `../container.mjs`
 * and `../inband.mjs` are `public-read`'s (K697, K702); `../deliverer.mjs` (R14) is this module's.
 *
 * REACHED as `publicationOf(host, deps)` (K61): one instance per host (the Durable Object's `ctx`), created on the first
 * call with `deps`, returned to every later caller. At creation it creates its tables and declares them to
 * record-core's purge (R31), registers with record-core the published registry as audit context (its R69, for the
 * audit's C-21.2) and its opaque case ids as mint-ledger seeds (its R70, K783), registers the facts `caseMember`, `publishedRegistry` and `publishedCaseRegistry` with
 * promotion (R4, R7; the registration rule, K206, N152) and its promotion projection, the revision flag (R5), and
 * registers a case's cited parts and the ratified cases (R41, R43) with reevaluation (its R26, K359).
 * `deps` (each reached through its factory on the same host unless given; a test passes its own):
 *   record, membership, promotion   layer 2: `transact`, `head`, `readFile`, `textAtSha` (R60), `declarePurge`, the
 *                                   `bundles` table (R21's type column, the standing test);
 *                                   `viewerPredicate`, `memberFacts`; `registerStep`, `registerFact`, the fact
 *                                   `producingGroup`.
 *   credentials    `attestingKeys` (its R11; R2's signers), reached lazily (K757).
 *   inquiry        `exclusionsNaming` (R12).
 *   basisVersions  `testimonyReach` (R2, R17).
 *   contradiction  `unresolvedRecordOn` (its R29), for R50 (N345).
 *   sources        `publishableAt` (its R8), for R51 (N364); its `source_knocks` read contract (its R15) joined in
 *                  this module's own SQL, the sources behind a capture.
 *   reevaluation   `registerCaseParts` (its R26), at creation only (R41, R43).
 *   corpusExport   created at creation with this module's clock, so `export_log` exists and is declared at every boot
 *                  (its R4); its ops are spread by the plane's op map (`corpusExportOps`, N483), and nothing here calls it.
 *   now            the clock for the instants it writes, an ISO string (default: the wall clock).
 *
 * READ CONTRACTS it joins in its own SQL: record-core's `bundles` (R21's type column, the standing test) and
 * provenance's `register` (R17's author, R42's captures). */

import { recordOf, stampInstant, instantOrder } from "../record-core/index.mjs";
import { membershipOf, viewerPredicate } from "../membership/index.mjs";
import { promotionOf } from "../promotion/index.mjs";
import { inquiryOf } from "../inquiry/index.mjs";
import { basisVersionsOf } from "../basis-versions/index.mjs";
import { reevaluationOf } from "../reevaluation/index.mjs";
import { credentialsOf } from "../credentials/index.mjs";
import { parseFrontmatter, isMachineIdentity, createSha256, sectionText as caseSectionText } from "../record-grammar/index.mjs";
import { delivererOf } from "../deliverer.mjs";
import { rowOf, ATTRIBUTION_ACT_CHECKS } from "./checks.mjs";
import { PUBLICATION_TABLES, PUBLICATION_EXEMPT, migratePublication, registerCaseDocumentSha,
         caseDocumentPath } from "./schema.mjs";
import { contradictionOf } from "../contradiction/index.mjs";
import { sourcesOf } from "../sources/index.mjs";
import { corpusExportOf } from "../corpus-export/index.mjs";
import { acceptedWorkOf } from "../accepted-work/index.mjs";
import { captureOf } from "../capture/index.mjs";
import { extractionOf } from "../extraction/index.mjs";
import { observerRef, provenanceOf } from "../provenance/index.mjs";
/* The case document's grammar is `case-grammar`'s (K651): the formats and predicates, the /5 blocks and tension
   section, the attribution run's text, the section locators, the signed citations and the edge set a finding rests on.
   This module reads them from there and re-exports, unchanged, every name it exported before the split, so its
   importers import exactly what they imported. */
import { caseDocumentStatesMemberBlocks, caseTensionsOf, disclosedCandidates, caseDocumentBlocks, sourceRowsStanding,
         SECTIONS, REAUTHORABLE_SECTIONS, signedCitations, ATTRIBUTION_LEVELS, attributionFrontmatterLines,
         attributionBodyLines, publishedGraphEdges, caseDocumentRequiresMaterials, acceptedWorkOf as acceptedWorkBlocksOf,
         materialsOf, extractedTextOf, materialAttestationLines } from "../case-grammar/index.mjs";

export { ATTRIBUTION_ACT_CHECKS, CASE_SOURCES_CHECKS } from "./checks.mjs";
export { CASE_DOCUMENT_FORMAT, CASE_DOCUMENT_FORMAT_V4, CASE_DOCUMENT_FORMAT_V3, CASE_DOCUMENT_FORMAT_V2,
         CASE_DOCUMENT_FORMAT_LEGACY, CASE_DOCUMENT_FORMATS_ACCEPTED, caseDocumentStatesMemberBlocks,
         caseDocumentRequiresDisclosures, caseDocumentRequiresV4Disclosures, caseDocumentRequiresTensionSection,
         caseTensionsOf, TENSION_STATE_WORDS, TENSION_HIGHLIGHT_SENTENCE, TENSION_DEPTH_SENTENCE,
         TENSIONS_PREDATE_SENTENCE, TENSIONS_UNREADABLE_SENTENCE,
         caseDocumentBlocks, captureBlockLines, sourceBlockLines, sourceStatement, unnamedSourceStatement,
         CAPTURE_FIELDS, ACKNOWLEDGEMENT_FIELDS, SOURCE_FIELDS, SOURCE_BASES, BLOCKS_PREDATE_SENTENCE,
         BLOCK_UNREADABLE_SENTENCE, NOT_RECORDED_STATED, REAUTHORABLE_SECTIONS, ATTRIBUTION_LEVELS,
         ATTRIBUTION_PROSE_HEAD, attributionFrontmatterLines, attributionBodyLines,
         publishedGraphEdges } from "../case-grammar/index.mjs";
export { PUBLICATION_SCHEMA, PUBLICATION_TABLES, PUBLICATION_EXEMPT, caseDocumentPath } from "./schema.mjs";

/* CASE-4 / DEC-72 / REC-60: the page size for `op=caseflags` (R6). A CHOSEN CONSTANT and never a finding — the flag
   table grows with every revision of every published member and has no natural ceiling, so the read publishes `limit`
   and `truncated` beside its answer rather than scanning whatever is there. 500 is deliberately generous: the common
   ask is one case or one finding, where the real answer is a handful of rows. */
export const CASE_FLAGS_LIMIT = 500;
/** R17 (DEC-88, K1030): the longest reason an attribution choice keeps, in code points; a longer one is refused. */
export const ATTRIBUTION_REASON_MAX = 2000;
/** R37: the ratified editions one `publishedEditionsOf` read answers. */
export const EDITIONS_OF_MAX = 500;
/** R41: the cited parts one `caseCitedParts` read answers. */
export const CITED_PARTS_MAX = 1000;
/** R50: the cases one `caseTensions` page answers, its default and its ceiling. */
export const CASE_TENSIONS_MAX = 200;
/** R42, R43: the page of `restingCapturesOf` and of `ratifiedCases`, its default and its ceiling. */
export const RESTING_CAPTURES_MAX = 1000;
export const RATIFIED_CASES_MAX = 1000;
/** R42 (N315, K380): the resting findings one capture answers, and those one page answers in all. */
export const RESTING_FINDINGS_PER_CAPTURE = 200;
export const RESTING_FINDINGS_PER_PAGE = 10000;
/** R38: the pins one `ratifiedFindingsRestingOn` page reads, its default and its ceiling. */
export const RESTING_PINS_MAX = 1000;
/* A caller's page size: a whole number of rows, floored, clamped to 1–max, the default when absent or not a number. */
const pageOf = (limit, max) => Math.max(1, Math.min(Math.floor(Number(limit)) || max, max));
/* R38: a pin cursor `<case>#<member>#<sha>` as its three keys, the case up to the first `#` and the sha after the last
   (a sha is hex); absent, the start. A string that is not a pin cursor is read as a case id alone: the page starts
   after that case. */
function pinCursor(after) {
  const s = typeof after === "string" ? after : "";
  const i = s.indexOf("#"), j = s.lastIndexOf("#");
  if (i < 0 || j === i) return [s, "\u{10FFFF}", ""];
  return [s.slice(0, i), s.slice(i + 1, j), s.slice(j + 1)];
}

/* R41 (C-41.15's vocabulary): the citation versions that name the capture a case edition cited. */
const CITATION_NAMES_CAPTURE = Object.freeze(["pinned", "only_capture"]);
/* CPDF-10: a column this module WROTE as JSON, read back; null rather than a throw on a malformed value. */
const safeJson = (s) => { try { return s == null ? null : JSON.parse(s); } catch { return null; } };
const HEX64 = /^[0-9a-f]{64}$/;
const str = (v) => (typeof v === "string" && v.trim() ? v.trim() : "");
const shaOf = (text) => createSha256().update(new TextEncoder().encode(String(text))).hex();

/* R23 (K240, K244): the doors a review provider gives, and the answer each gives when no module has registered one: no
   draft reads, no grant admits, no identity or edition is stated, and the dead answer is a bare NO_REVIEW_COPY refusal.
   It carries no catalogue row: review holds C-87 and is not a use of this module, and this answers only while no
   module has filled R23. */
const REVIEW_DOORS = Object.freeze(["draftForMember", "draftIdentity", "caseIdentitySentence", "statedEdition",
                                    "liveGrant", "grantAdmitsCaseEdition", "deadAnswer"]);
const NO_REVIEW_PROVIDER = Object.freeze({
  registered: false, module: null,
  draftForMember: () => null, draftIdentity: () => null, caseIdentitySentence: () => null, statedEdition: () => null,
  liveGrant: () => null, grantAdmitsCaseEdition: () => false,
  deadAnswer: () => ({ ok: false, reason: "NO_REVIEW_COPY", code: "NO_REVIEW_COPY" }),
  detail: "no module has registered the review provider, so no grant admits and no draft is read through it",
});

/* THE ONE "NO SUCH CASE DOCUMENT" ANSWER (REC-130). Both the genuinely-absent
   branch and the no-standing branch return THIS, so "does not exist" and "you
   may not see it" are the same bytes by construction rather than by care. */
function noCaseDocument(id, ed) {
  return { ok: false, reason: "NO_CASE_DOCUMENT", caseId: id, edition: ed,
           detail: `no case document has been authored for ${id} edition ${ed}. A case document `
                 + `is written by op=publish, which is the act that authors the assertions it `
                 + `carries — this plane does not compose one.` };
}

export class Publication {
  #deps;
  #review = null;        // R23: {module, ...doors}, filled once
  purgeDeclaration = null;   // R31: record-core's answer to this module's purge declaration, set at creation

  constructor({ storage, record, membership, promotion, host = null, inquiry = null, basisVersions = null,
                contradiction = null, sources = null, credentials = null, corpusExport = null, acceptedWork = null,
                capture = null, extraction = null, provenance = null, now = null } = {}) {
    this.sql = storage.sql;
    this.record = record;
    this.membership = membership;
    this.promotion = promotion;
    this.#deps = { host, storage, inquiry, basisVersions, contradiction, sources, credentials, corpusExport, acceptedWork,
                   capture, extraction, provenance };
    this.now = typeof now === "function" ? now : () => new Date().toISOString();
  }

  /* The modules reached lazily: each is created on the same host on first use, unless a test passed its own. */
  get inquiry() { return this.#deps.inquiry ||= inquiryOf(this.#deps.host); }
  get basisVersions() { return this.#deps.basisVersions ||= basisVersionsOf(this.#deps.host); }
  get contradiction() { return this.#deps.contradiction ||= contradictionOf(this.#deps.host); }
  get credentials() {
    return this.#deps.credentials ||= credentialsOf(this.#deps.host, { record: this.record, membership: this.membership });
  }
  get acceptedWork() { return this.#deps.acceptedWork ||= acceptedWorkOf(this.#deps.host, { record: this.record, promotion: this.promotion }); }
  get extraction() { return this.#deps.extraction ||= extractionOf(this.#deps.host, { record: this.record, membership: this.membership }); }
  get provenance() { return this.#deps.provenance ||= provenanceOf(this.#deps.host, { record: this.record, membership: this.membership, promotion: this.promotion }); }
  get capture() { return this.#deps.capture ||= captureOf(this.#deps.host, { record: this.record }); }
  get sources() { return this.#deps.sources ||= sourcesOf(this.#deps.host, { record: this.record, membership: this.membership }); }
  get corpusExport() {
    return this.#deps.corpusExport ||= corpusExportOf(this.#deps.host, { storage: this.#deps.storage, record: this.record,
                                                                        now: this.now });
  }

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

  /* The instance's producing group, promotion's fact (instance-setup provides it); null when
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
   *  registration is refused `PROVIDER_DECLARED`; one missing a door `PROVIDER_MALFORMED`. `review` fills
   *  it (legacy-store did until its retirement). */
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
   *  stated, and the dead answer is a bare NO_REVIEW_COPY. */
  reviewProvider() {
    return this.#review ? { registered: true, ...this.#review } : NO_REVIEW_PROVIDER;
  }

  /* R1, R2: whether a live review grant admits exactly this case edition. With no provider, none does. */
  #grantAdmitsCaseEdition(secretSha, caseId, edition) {
    if (!secretSha) return false;
    try { return !!this.reviewProvider().grantAdmitsCaseEdition(secretSha, caseId, edition); } catch { return false; }
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
    const now = str(at) || this.#when();
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
    /* R35: publishing this target turns every name edge a published finding holds to it into a serve edge; R22
       (N256): and every reference held privately for it becomes one. */
    const promoted = this.#promoteNamedEdges(bundleId);
    const linked = this.#linkHeldReferences(bundleId, now);
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
       unbounded row source — taking the ceiling 40 -> 41. The ceiling could only
       FALL, and moving it up to accommodate a new read was precisely what it
       existed to prevent, so the answer changed rather than the figure (that
       suite was deleted in T20; the decision stands on its own reason below).

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
             ...(linked ? { heldLinked: linked } : {}),
             caseCount: byCase.length,
             /* A BOOLEAN AND NOT THE LIST, for `caseCount`'s reason exactly and
                measured the same way. The first draft returned `bars` — the
                per-case bars themselves — and `meaning-bounds.test.mjs` moved
                `op=publish` onto the OPAQUE roster: a collection off an
                unbounded row source, inside a conditional SPREAD, so the walk
                could not even bucket it as bare (that suite was deleted in
                T20). **An op the classifier cannot
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
     both ends are now covered by signatures, so serving it states nothing either signature does not.
     SET-WISE (N237, N277; K351): one count and one statement, so no edge is read into the worker's memory however many
     findings name the target; the count is what the statement then turns, inside the caller's transaction. */
  #promoteNamedEdges(targetId) {
    const turnable = `FROM published_edges e
        WHERE e.to_bundle=? AND e.disclosure='name' AND e.kind NOT IN ('division_parent','division_sibling')
          AND EXISTS (SELECT 1 FROM published_bundles p WHERE p.bundle_id=e.from_bundle)`;
    const n = Number((this.#one(`SELECT COUNT(*) AS n ${turnable}`, targetId) || {}).n) || 0;
    if (n)
      this.sql.exec(`UPDATE published_edges SET disclosure='serve'
                      WHERE rowid IN (SELECT e.rowid ${turnable})`, targetId);
    return n;
  }

  /* R22, R35 (N256; Bob, K283): publishing a target turns every reference HELD PRIVATELY for it (a serve-class edge a
     published finding named before the target was published, `publishEdges` below) into a `serve` edge of the
     published graph, in the same transaction, and stamps the held row with the instant. Set-wise as
     `#promoteNamedEdges` is: one count, one insert, one update, no edge read into memory. Only a reference from a
     finding that is itself published is linked; a row whose target is not this one is untouched. */
  #linkHeldReferences(targetId, now) {
    const held = `FROM published_held_references h
        WHERE h.to_bundle=? AND h.linked_at IS NULL
          AND EXISTS (SELECT 1 FROM published_bundles p WHERE p.bundle_id=h.from_bundle)`;
    const n = Number((this.#one(`SELECT COUNT(*) AS n ${held}`, targetId) || {}).n) || 0;
    if (!n) return 0;
    this.sql.exec(
      `INSERT INTO published_edges (from_bundle,to_bundle,kind,disclosure,published)
       SELECT h.from_bundle, h.to_bundle, h.kind, 'serve', ? ${held}
       ON CONFLICT(from_bundle,to_bundle,kind) DO UPDATE SET disclosure='serve'`, now, targetId);
    this.sql.exec(`UPDATE published_held_references SET linked_at=?
                    WHERE rowid IN (SELECT h.rowid ${held})`, now, targetId);
    return n;
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
    /* R58 (DEC-112; K1268, BOB's decision 5): EVERY EDITION COMMITTED FROM T28 ON CARRIES ITS METHOD AND MATERIALS, so a
       preparation made before T28 (any format but /6) is never committed, nothing written: the remedy is a new
       preparation, which carries them. A retry of an edition already signed answered above, whatever its format. */
    const docFm = parseFrontmatter(doc.text).data || {};
    if (!caseDocumentRequiresMaterials(docFm)) {
      /* DEC-49 REGION is-case-format-current */
      return { ok: false, reason: "CASE_FORMAT_SUPERSEDED", ...rowOf("CASE_FORMAT_SUPERSEDED"), caseId: id, edition: ed,
               format: typeof docFm.format === "string" ? docFm.format : null,
               detail: "this case document was prepared in a format that carries no method and no materials, so nothing "
                     + "was committed. Prepare the case again, and sign the new preparation." };
      /* END DEC-49 REGION is-case-format-current */
    }
    const when = str(at) || this.#when();
    /* R51, R52 (N364; DEC-78 item 5(d)): WHAT THE DOCUMENT STATES OF ITS SOURCES IS RE-READ AT THE COMMIT. A consent
       withdrawn binds only later publications, and this is one: every row of the `sources:` block must still be what
       `sources.publishableAt({audience: "public", at})` answers now, or the capture's unnamed statement. Any other row
       stops the commit, nothing written; the remedy is a new preparation. */
    const lapsed = this.#sourcesLapsed(doc.text, when);
    if (lapsed.length) {
      /* DEC-49 REGION is-source-consent-withdrawn */
      return { ok: false, reason: "SOURCE_CONSENT_WITHDRAWN", ...rowOf("SOURCE_CONSENT_WITHDRAWN"), caseId: id,
               edition: ed, captures: [...new Set(lapsed.map((x) => x.capture))].slice(0, 200),
               detail: `${lapsed.length} statement(s) this case document makes about a source are no longer what may be `
                     + "published of that source, so nothing was committed. What is published under a consent stays "
                     + "published; this edition was not, and a new preparation leaves the detail out." };
      /* END DEC-49 REGION is-source-consent-withdrawn */
    }
    /* R59 (DEC-96 items 1, 4; N522): ANOTHER GROUP'S WORK THE DOCUMENT RESTS ON IS RE-READ AT THE COMMIT, R51's pattern.
       Each `accepted_work:` row's acceptance must still be in force at its edition, and every open flag on that edition
       must be one `accepted_work_flags:` discloses; otherwise nothing is committed and the remedy is a new preparation. */
    const standing = this.#acceptedWorkLapsed(docFm, attestorMember);
    if (standing) {
      /* DEC-49 REGION is-accepted-work-standing */
      if (standing.withdrawn.length)
        return { ok: false, reason: "ACCEPTANCE_WITHDRAWN_SINCE", ...rowOf("ACCEPTANCE_WITHDRAWN_SINCE"), caseId: id,
                 edition: ed, accepted_work: standing.withdrawn,
                 detail: `${standing.withdrawn.length} acceptance(s) of another group's work this case document rests on `
                       + "are no longer known to be in force, so nothing was committed. Prepare the case again." };
      return { ok: false, reason: "FLAG_OPENED_SINCE", ...rowOf("FLAG_OPENED_SINCE"), caseId: id, edition: ed,
               flags: standing.undisclosed,
               detail: `${standing.undisclosed.length} open flag(s) on another group's work this case document rests on `
                     + "are not disclosed by it, so nothing was committed. Prepare the case again, disclosing them." };
      /* END DEC-49 REGION is-accepted-work-standing */
    }
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
    /* R57 (DEC-112 (3)(4); K1316): EVERYTHING THE CASE INCLUDES, HELD BY SHA-256 IN THE SAME ACT, so public-read carries it
       in the case file from the published projection alone. A material this copy cannot hold at its stated digest never
       refuses the commit: it is named, and the case file shows it missing. */
    const held = this.#holdMaterials(docFm, when);
    held.materials.forEach((m, i) => this.sql.exec(
      `INSERT INTO published_case_materials (case_id,edition,ord,sha256,held) VALUES (?,?,?,?,?)
       ON CONFLICT(case_id,edition,ord) DO NOTHING`, id, ed, i, m.sha, m.held));
    return { ...outcome(false), materials: held.materials, materials_unheld: held.unheld };
  }

  /* R57: hold, by SHA-256, each `included: true` material of the signed document's `materials:` block, inside the commit's
     transaction: an observation's whole text and a document's captured bytes where the register holds them as inline
     text (verified against the stated digest), a document's extracted text (`extractedTextOf` over extraction's units,
     only when the index is whole and no unit was cut, verified against `text_sha`), and the timestamp tokens its home's
     provenance names, as text where inline. Bytes held only in the evidence store are registered and answered
     `held: "evidence"`, for ratification R39 to copy. Answers `{materials, unheld}`; never throws. */
  #holdMaterials(fm, when) {
    const materials = [], unheld = [];
    let rows = null;
    try { const m = materialsOf(fm); rows = m && Array.isArray(m.materials) ? m.materials : null; } catch { rows = null; }
    const seen = new Set();
    const hold = (ref, kind, sha, text, bytes) => {
      if (seen.has(sha)) return;
      seen.add(sha);
      if (typeof text === "string") {
        this.sql.exec(`INSERT INTO published_material_texts (sha256,kind,text,bytes,published) VALUES (?,?,?,?,?)
                       ON CONFLICT(sha256) DO NOTHING`, sha, kind, text, new TextEncoder().encode(text).length, when);
      }
      this.sql.exec(`INSERT INTO published_shas (sha256,bundle_id,path,kind,bytes,published) VALUES (?,?,?,?,?,?)
                     ON CONFLICT(sha256,bundle_id,path) DO NOTHING`,
                    sha, ref, `materials/${sha}`, kind, typeof text === "string" ? new TextEncoder().encode(text).length
                      : Number.isInteger(bytes) ? bytes : null, when);
      materials.push({ sha, held: typeof text === "string" ? "inline" : "evidence" });
    };
    for (const m of Array.isArray(rows) ? rows : []) {
      if (!m || typeof m !== "object" || !(m.included === true || m.included === "true")) continue;
      const ref = str(m.ref), sha = str(m.sha).toLowerCase(), kind = m.kind;
      const miss = (what, why) => unheld.push({ ref: ref || null, kind: what, sha256: what === "extracted_text" ? str(m.text_sha) || null : sha || null, why });
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
        if (u && u.state === "whole" && Array.isArray(u.units) && u.units.length && !u.units.some((x) => x.truncated))
          text = extractedTextOf(u.units);
      } catch { text = null; }
      if (typeof text === "string" && HEX64.test(textSha) && shaOf(text) === textSha) hold(ref, "extracted_text", textSha, text);
      else miss("extracted_text", "this copy holds no whole extracted text of that document at its stated digest");
      /* its co-attestation tokens (K1315) */
      for (const t of this.#tokenFiles(home, sha)) {
        const f = this.#fileRow(home.bundle_id, t);
        if (f && typeof f.text === "string") hold(ref, "attestation", shaOf(f.text), f.text);
        else if (f && typeof f.blobSha === "string" && HEX64.test(f.blobSha)) hold(ref, "attestation", f.blobSha, null, f.bytes);
        else miss("attestation", `the timestamp token ${t} is not held`);
      }
    }
    return { materials, unheld: unheld.slice(0, 1000) };
  }

  /* R57: the register row homing a capture on a bundle that exists, or null (provenance's read contract, R48). */
  #registered(sha) {
    return this.#one(`SELECT r.bundle_id, r.path, r.bytes FROM register r JOIN bundles b ON b.bundle_id=r.bundle_id
                       WHERE r.capture_sha=? LIMIT 1`, sha);
  }

  /* R57: a live file's record-core read (R13): inline text, or its blob reference. */
  #fileRow(bundleId, path) { try { return this.record.readFile(bundleId, path); } catch { return null; } }

  /* R57 (K1315): the timestamp token files the home's `data/provenance.json` names for one capture. */
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

  /** R57 (K1317): what a committed case edition held, `[{sha, held}]` in its materials' order, `held` `inline` or
   *  `evidence`, as its commit answered it, so a retried ratification copies what is left (ratification R39); `[]` for
   *  an edition that held nothing or was never committed. Writes nothing; never throws. */
  heldMaterialsOf(caseId, edition) {
    try {
      return this.#rows(`SELECT sha256, held FROM published_case_materials WHERE case_id=? AND edition=? ORDER BY ord`,
                        str(caseId), Number(edition)).map((r) => ({ sha: r.sha256, held: r.held }));
    } catch { return []; }
  }

  /** R57 (K1316): a held material's text by its SHA-256, for `public-read`'s case file: `{found, sha256, kind, text}`,
   *  or `{found: false}`. Answered only for a text a commit held, so working material is unreachable here. */
  publishedMaterialText(sha) {
    const r = this.#one(`SELECT sha256, kind, text FROM published_material_texts WHERE sha256=?`, String(sha ?? "").toLowerCase());
    return r ? { found: true, sha256: r.sha256, kind: r.kind, text: r.text } : { found: false };
  }

  /* R59: the rows of a document's `accepted_work:` block whose acceptance is no longer in force, and the open flags on
     their editions its `accepted_work_flags:` block does not disclose, or null when every row stands. Read through
     `accepted-work` (its R2) as the signer (`member:<signer>`, case-import answering only an active member). A read
     that answers absent, unreadable, null, or (for flags) not complete counts as not in force. Writes nothing. */
  #acceptedWorkLapsed(fm, signer) {
    let blocks = null;
    try { blocks = acceptedWorkBlocksOf(fm); } catch { blocks = null; }
    const rows = blocks && Array.isArray(blocks.accepted_work) ? blocks.accepted_work : [];
    if (!rows.length) return null;
    const disclosed = new Set((Array.isArray(blocks.accepted_work_flags) ? blocks.accepted_work_flags : [])
      .filter((f) => f && typeof f === "object").map((f) => `${f.ref}\u0000${Number(f.edition)}\u0000${f.flag}`));
    const viewer = str(signer) ? `member:${str(signer).replace(/^member:/, "")}` : null;
    const aw = this.acceptedWork;
    const withdrawn = [], undisclosed = [];
    const asked = new Set();
    for (const r of rows) {
      if (!r || typeof r !== "object") continue;
      const ref = str(r.ref), edition = Number(r.edition);
      const key = `${ref}\u0000${edition}`;
      if (asked.has(key)) continue;
      asked.add(key);
      const named = { ref: ref || null, edition: Number.isInteger(edition) ? edition : null };
      const f = aw.acceptedFinding({ ref, edition, viewer });
      const inForce = !!f && typeof f === "object" && !f.absent && !f.unreadable && f.acceptance
        && typeof f.acceptance === "object" && (f.edition === undefined || Number(f.edition) === edition);
      if (!inForce) { withdrawn.push(named); continue; }
      const o = aw.openFlagsOn({ ref, edition, viewer });
      if (!o || typeof o !== "object" || o.absent || o.unreadable || o.complete !== true || !Array.isArray(o.flags)) {
        withdrawn.push(named);
        continue;
      }
      for (const fl of o.flags)
        if (fl && !disclosed.has(`${ref}\u0000${edition}\u0000${fl.flag}`))
          undisclosed.push({ ...named, flag: fl.flag ?? null, issue: typeof fl.issue === "string" ? fl.issue : null });
    }
    return withdrawn.length || undisclosed.length ? { withdrawn, undisclosed: undisclosed.slice(0, 200) } : null;
  }

  /* R51: the `sources:` rows of one document that no longer hold at `at` (`sourceRowsStanding`). The sources behind a
     capture are the pulled knocks `sources` minted for it (its `source_knocks` read contract, R15), each asked what the
     public may be told at `at`; a source that cannot be read answers nothing, so its rows fail closed (R52). A document
     before /5, or one stating no `sources:` block, states no source and has nothing to re-read. */
  #sourcesLapsed(text, at) {
    const { sources: rows } = caseDocumentBlocks(text);
    if (!Array.isArray(rows) || !rows.length) return [];
    const src = this.sources;
    return sourceRowsStanding(rows, (capture) => {
      const knocks = this.#rows(`SELECT source_id, received FROM source_knocks WHERE capture_sha=?
                                  ORDER BY received, knock_id`, capture);
      if (!knocks.length) return null;
      const entries = [];
      for (const s of [...new Set(knocks.map((k) => k.source_id))]) {
        const r = src.publishableAt({ source: s, audience: "public", at });
        if (!r || r.ok !== true || !Array.isArray(r.entries)) return null;
        entries.push(...r.entries);
      }
      return { entries, received: knocks[0].received };
    });
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

  /* ---------------------------------------------------------------- R41, R43: a case's cited parts, for reevaluation */

  /** R41 (N210, N163 (a); K363): a ratified case edition's cited parts, the latest ratified edition when `edition` is
   *  absent: `{case, edition, project, parts: [{bundle_id, capture_sha}], limit, truncated}`, at most CITED_PARTS_MAX,
   *  viewer-free. A cited part is a document the edition cites as evidence: a row of its SIGNED document's
   *  `case_citations` (`{target, version, capture}`, C-41.15) whose version names the capture it was pinned to
   *  (`pinned`, `only_capture`), once per (document, capture), in the document's order; `reevaluation` R14 grades that
   *  capture. A row naming no capture (`undetermined`, `no_capture`, `no_bytes`) has nothing to grade and is no part,
   *  and neither is a member finding (it holds no capture). A document older than /4 signed no citations: no parts.
   *  The part is the capture, not a `bundle_sha`: the edition pins a capture, never the cited document's version
   *  (K365). `project` is
   *  the case's owning project, null for a case older than DEC-72. Registered with R43 as reevaluation's
   *  `registerCaseParts` (its R26). A case with no ratified edition (or not that one) answers `NO_SUCH_CASE_EDITION`;
   *  no case named, `NO_ID`. Writes nothing. */
  caseCitedParts({ case: caseArg = null, caseId = null, edition = null } = {}) {
    const id = str(caseArg ?? caseId);
    if (!id) return { ok: false, reason: "NO_ID", detail: "caseCitedParts names a case" };
    const want = edition == null || edition === "" ? null : Number(edition);
    const row = Number.isInteger(want)
      ? this.#one(`SELECT edition FROM published_cases WHERE case_id=? AND edition=? AND ratified_at IS NOT NULL`, id, want)
      : want === null
        ? this.#one(`SELECT MAX(edition) AS edition FROM published_cases WHERE case_id=? AND ratified_at IS NOT NULL`, id)
        : null;
    if (!row || row.edition == null)
      return { ok: false, reason: "NO_SUCH_CASE_EDITION", case: id, edition: Number.isInteger(want) ? want : null,
               detail: "no ratified edition of that case answers here, so it cites nothing yet" };
    const ed = Number(row.edition);
    const owner = this.#one(`SELECT project_id FROM cases WHERE case_id=?`, id);
    /* The signed bytes, and nothing else: an unsigned re-authoring of the same edition cannot reach here. */
    const doc = this.#one(`SELECT text FROM case_documents WHERE case_id=? AND edition=? AND sig_armored IS NOT NULL`, id, ed);
    const signed = doc ? signedCitations(doc.text) : { state: "undetermined", rows: null };
    const seen = new Set(), parts = [];
    for (const c of Array.isArray(signed.rows) ? signed.rows : []) {
      const target = c && typeof c.target === "string" ? c.target.trim() : "";
      const capture = c && typeof c.capture === "string" ? c.capture.trim().toLowerCase() : "";
      if (!target || !CITATION_NAMES_CAPTURE.includes(c.version) || !/^[0-9a-f]{64}$/.test(capture)) continue;
      const k = `${target}\u0000${capture}`;
      if (seen.has(k)) continue;
      seen.add(k);
      parts.push({ bundle_id: target, capture_sha: capture });
    }
    const truncated = parts.length > CITED_PARTS_MAX;
    return { ok: true, case: id, edition: ed, project: owner ? owner.project_id ?? null : null,
             parts: parts.slice(0, CITED_PARTS_MAX), limit: CITED_PARTS_MAX, truncated };
  }

  /** R43 (N210; K359): the cases holding at least one ratified edition, in case id order after `after`, at most `limit`
   *  (default RATIFIED_CASES_MAX, clamped to 1–RATIFIED_CASES_MAX): `{cases: [case_id], cursor}`, `cursor` the last case
   *  answered when more follow, else null, so reevaluation pages through them (a case is no bundle; only this module
   *  can list them). Viewer-free; writes nothing. */
  ratifiedCases({ after = null, limit = null } = {}) {
    const cap = pageOf(limit, RATIFIED_CASES_MAX);
    const rows = this.#rows(
      `SELECT DISTINCT case_id FROM published_cases WHERE ratified_at IS NOT NULL AND case_id > ?
        ORDER BY case_id LIMIT ?`, typeof after === "string" ? after : "", cap + 1);
    const more = rows.length > cap;
    const cases = rows.slice(0, cap).map((r) => r.case_id);
    return { ok: true, cases, limit: cap, cursor: more ? cases[cases.length - 1] : null };
  }

  /* ---------------------------------------------------------------- R50: tensions after publication */

  /** R50 (N345; DEC-84 item 13, DEC-85): for each case whose LATEST ratified edition `project` owns (every such case
   *  when absent), in case id order after `after`, at most `limit` cases (1–CASE_TENSIONS_MAX, that by default), with
   *  `cursor` the last case answered when more follow: the candidates `contradiction.unresolvedRecordOn` answers over
   *  each member at its pinned sha that the edition did not disclose, each with its case, edition, member, candidate
   *  and state; and each candidate the edition disclosed that the read no longer answers, `resolved_since: true`. Sight
   *  is the owning project's owners': a candidate with a side any owner may not see is answered as the read answers it
   *  for that owner, `unseen_other_side: true` with nothing of that side (DEC-85); a case whose project has no owner is
   *  read by nobody, every side withheld. A member whose read fails or is cut is stated `undetermined` or `truncated`,
   *  never dropped. Read as the plane, for `queue`: it writes nothing, never throws and composes no strength (R26);
   *  the signed edition never changes (R24). */
  caseTensions({ project = null, after = null, limit = null } = {}) {
    try {
      const cap = pageOf(limit, CASE_TENSIONS_MAX);
      const pid = str(project);
      const latest = `SELECT c.case_id, MAX(c.edition) AS edition FROM published_cases c
                       WHERE c.ratified_at IS NOT NULL GROUP BY c.case_id`;
      const rows = this.#rows(
        `SELECT l.case_id, l.edition, k.project_id FROM (${latest}) l LEFT JOIN cases k ON k.case_id=l.case_id
          WHERE l.case_id > ? ${pid ? "AND k.project_id = ?" : ""} ORDER BY l.case_id LIMIT ?`,
        typeof after === "string" ? after : "", ...(pid ? [pid] : []), cap + 1);
      const more = rows.length > cap;
      if (more) rows.length = cap;
      const cases = rows.map((r) => this.#caseTensionsOne(r.case_id, Number(r.edition), r.project_id ?? null));
      return { ok: true, wrote: false, project: pid || null, cases, limit: cap,
               cursor: more ? rows[rows.length - 1].case_id : null,
               says: "each is a contradiction found on what a published case's findings rest on, one level deep, that "
                   + "its latest edition did not disclose, or one it disclosed that has since been resolved. The signed "
                   + "edition does not change; a later edition discloses or resolves it. No strength is composed." };
    } catch (e) {
      return { ok: true, wrote: false, project: str(project) || null, cases: [], limit: pageOf(limit, CASE_TENSIONS_MAX),
               cursor: null, undetermined: true, why: String(e && e.message || e).slice(0, 160) };
    }
  }

  /* R50: one case edition's tensions since publication, read under its owners' sight. */
  #caseTensionsOne(caseId, edition, projectId) {
    const doc = this.#one(`SELECT text FROM case_documents WHERE case_id=? AND edition=? AND sig_armored IS NOT NULL`,
                          caseId, edition);
    const disclosed = doc ? disclosedCandidates(doc.text) : new Set();
    let owners = [];
    try { owners = projectId ? this.membership.projectOwners(projectId) || [] : []; } catch { owners = []; }
    /* No owner reads as nobody: a viewer that sees nothing, so every side is withheld (fail closed, DEC-85). */
    const viewers = owners.length ? owners.map((m) => `member:${m}`) : [""];
    const members = this.#rows(`SELECT bundle_id, version_sha FROM published_case_members
                                 WHERE case_id=? AND edition=? ORDER BY ord`, caseId, edition);
    const tensions = [], resolvedSince = [], unread = [];
    const answered = new Set();
    for (const m of members) {
      if (!m.version_sha) { unread.push({ member: m.bundle_id, undetermined: true, why: "no version was pinned" }); continue; }
      const byCandidate = new Map();
      let undetermined = false, truncated = false;
      for (const viewer of viewers) {
        let r = null;
        try { r = this.contradiction.unresolvedRecordOn({ finding: m.bundle_id, sha: m.version_sha, viewer }); }
        catch { r = null; }
        if (!r || r.undetermined || !Array.isArray(r.candidates)) { undetermined = true; continue; }
        if (r.truncated) truncated = true;
        if (r.undetermined_legs) undetermined = true;
        for (const c of r.candidates) {
          const had = byCandidate.get(c.candidate);
          /* An owner who may not see a side decides: the unseen answer replaces a seen one, never the reverse. */
          if (!had || (c.unseen_other_side && !had.unseen_other_side)) byCandidate.set(c.candidate, c);
        }
      }
      if (undetermined || truncated)
        unread.push({ member: m.bundle_id, ...(undetermined ? { undetermined: true } : {}),
                      ...(truncated ? { truncated: true } : {}) });
      for (const [id, c] of byCandidate) {
        answered.add(id);
        if (disclosed.has(id)) continue;
        tensions.push({ case: caseId, edition, member: m.bundle_id, candidate: id, state: c.state ?? null,
                        ...(c.unseen_other_side ? { unseen_other_side: true, ...(c.side ? { side: c.side } : {}) }
                                                : { a: c.a ?? null, b: c.b ?? null, ...(c.kind ? { kind: c.kind } : {}),
                                                    explanation: c.explanation ?? null }),
                        depth: 1 });
      }
    }
    /* A disclosed candidate the reads no longer answer has been resolved since, unless a read was not made whole. */
    if (!unread.length)
      for (const id of disclosed) if (!answered.has(id)) resolvedSince.push({ case: caseId, edition, candidate: id, resolved_since: true });
    return { case: caseId, edition, project: projectId, tensions, resolved_since: resolvedSince,
             ...(unread.length ? { unread } : {}) };
  }

  /* ---------------------------------------------------------------- R42: the captures published findings rest on */

  /** R42 (N230): in capture order after `after`, each capture a ratified finding's published basis rests on, with those
   *  findings and each one's owning projects: `{captures: [{capture_sha, findings: [{bundle_id, projects}]}], limit,
   *  truncated, cursor}`. `limit` defaults to RESTING_CAPTURES_MAX and is clamped to 1–RESTING_CAPTURES_MAX; `cursor`
   *  is the last capture answered when more follow, else null, so `monitoring` R33 follows it to the end (as intent R7).
   *  N315 (K380): each capture answers at most RESTING_FINDINGS_PER_CAPTURE of its findings, in finding id order, and
   *  `findings_truncated`, true when more rest on it; a page answers at most RESTING_FINDINGS_PER_PAGE findings in all,
   *  ending early (its `cursor` the last capture answered whole) rather than exceed it.
   *  Read as the plane: viewer-free, and it writes nothing.
   *  THE SOURCE ROWS, CONFIRMED (the R42 note): what a finding RESTS ON is its `serve`-class edge set (D-431,
   *  `publishedGraphEdges`), which the published graph holds as `published_edges` rows of disclosure `serve`, and, for
   *  a target not yet published, as the reference held privately for it (N256, `published_held_references`, until it
   *  is linked); a captured byte sequence is the register's (provenance's read contract), homed on a bundle that
   *  exists. A RATIFIED finding is one with a published edition that a committed case edition's roster names; its
   *  owning projects are those cases' (`cases`), null for a case older than DEC-72. `published_bundles` names no
   *  capture, and the published basis files would be a parse per finding, unpageable in capture order. */
  restingCapturesOf({ after = null, limit = null } = {}) {
    const cap = pageOf(limit, RESTING_CAPTURES_MAX);
    const rests = `WITH rests(finding, target) AS (
        SELECT e.from_bundle, e.to_bundle FROM published_edges e WHERE e.disclosure='serve'
        UNION SELECT h.from_bundle, h.to_bundle FROM published_held_references h WHERE h.linked_at IS NULL),
      ratified(finding, project) AS (
        SELECT DISTINCT m.bundle_id, k.project_id FROM published_case_members m
          JOIN published_cases c ON c.case_id=m.case_id AND c.edition=m.edition
          LEFT JOIN cases k ON k.case_id=m.case_id
         WHERE EXISTS (SELECT 1 FROM published_bundles p WHERE p.bundle_id=m.bundle_id))`;
    const held = `FROM register r JOIN bundles b ON b.bundle_id=r.bundle_id
        JOIN rests x ON x.target=r.bundle_id JOIN ratified f ON f.finding=x.finding`;
    /* N315 (K380): each capture of the page with how many findings rest on it, counted to one past the per-capture
       bound, so the page can end before the 10,000th finding without reading one it will not answer. */
    const page = this.#rows(
      `${rests}, caps(capture_sha) AS (
          SELECT DISTINCT r.capture_sha ${held} WHERE r.capture_sha > ? ORDER BY r.capture_sha LIMIT ?)
       SELECT k.capture_sha, (SELECT COUNT(*) FROM (SELECT DISTINCT f.finding ${held}
                                WHERE r.capture_sha=k.capture_sha LIMIT ?)) AS n
         FROM caps k ORDER BY k.capture_sha`,
      typeof after === "string" ? after : "", cap + 1, RESTING_FINDINGS_PER_CAPTURE + 1);
    let truncated = page.length > cap;
    if (truncated) page.length = cap;
    const answered = [];
    let total = 0;
    for (const c of page) {
      const n = Math.min(Number(c.n) || 0, RESTING_FINDINGS_PER_CAPTURE);
      if (total + n > RESTING_FINDINGS_PER_PAGE) { truncated = true; break; }
      total += n;
      answered.push({ capture_sha: c.capture_sha, cut: Number(c.n) > RESTING_FINDINGS_PER_CAPTURE });
    }
    const by = new Map(answered.map((c) => [c.capture_sha, new Map()]));
    if (answered.length)
      for (const r of this.#rows(
        `${rests}, picked(capture_sha, finding) AS (
            SELECT capture_sha, finding FROM (
              SELECT DISTINCT r.capture_sha, f.finding, DENSE_RANK() OVER (PARTITION BY r.capture_sha ORDER BY f.finding) AS nth
                ${held} WHERE r.capture_sha IN (SELECT value FROM json_each(?))) WHERE nth <= ?)
         SELECT DISTINCT r.capture_sha, f.finding, f.project ${held}
           JOIN picked q ON q.capture_sha=r.capture_sha AND q.finding=f.finding
          ORDER BY r.capture_sha, f.finding, f.project`,
        JSON.stringify(answered.map((c) => c.capture_sha)), RESTING_FINDINGS_PER_CAPTURE)) {
        const fs = by.get(r.capture_sha);
        if (!fs) continue;
        if (!fs.has(r.finding)) fs.set(r.finding, []);
        fs.get(r.finding).push(r.project ?? null);
      }
    return { ok: true,
             captures: answered.map((c) => ({ capture_sha: c.capture_sha,
               findings: [...by.get(c.capture_sha)].map(([bundle_id, projects]) => ({ bundle_id, projects })),
               findings_truncated: c.cut })),
             limit: cap, truncated,
             cursor: truncated && answered.length ? answered[answered.length - 1].capture_sha : null };
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
    /* Only an unsigned document whose text names this bundle as a list entry can claim it: `instr` is the index (as in
       `attributionStatedFor`), the parse the authority. Every promotion asks this (promotion's fact `caseMember`), so it
       no longer parses every unsigned case document in the store to answer about one bundle. */
    for (const d of this.#rows(
      `SELECT case_id, edition, text FROM case_documents WHERE ratified_at IS NULL AND instr(text, ?) > 0
        ORDER BY case_id, edition`, `  - target: ${bundleId}\n`)) {
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
       natural ceiling, so an unbounded read here would be a collection published
       off a row source nothing bounds. R6's test (`test/m/publication/
       relation.test.mjs`) holds the bound, the clamp and `truncated` at the
       interface. ONE MORE ROW IS ASKED FOR THAN MAY BE USED,
       which is `deriveConnections`' own discipline: it is the only way the
       answer can say that more existed without a second count, and a `truncated`
       derived from a full page would be a guess.
       THE CAP IS THE CALLER'S TO LOWER AND NOT TO RAISE, in `op=readingname`'s
       own shape — the model every capped op was brought into line with, and
       which is the reason this read takes a `limit`
       at all: a ceiling no caller can address is a bound nothing can drive, and
       an undriven bound is one that grows silently. An over-ask is answered AT
       THE CEILING and the ceiling is what is published, so a caller is never told
       they got more than they did. */
    /* The cap is a whole number of rows: a fractional ask is floored, so LIMIT is always an integer (a fraction reached
       SQLite as a non-integer LIMIT, a datatype error rather than an answer; found at this module's extraction). */
    const cap = Math.max(1, Math.min(Math.floor(Number(limit)) || CASE_FLAGS_LIMIT, CASE_FLAGS_LIMIT));
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
      signers: this.credentials.attestingKeys(),   /* credentials R11: the ONE predicate (D-158) */
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
      /* R2, R20 (N364): a /5 document's `captures:` and `sources:` blocks, as its bytes state them; null (with
         `blocks_detail`) for an older format or a block it does not carry. */
      ...(() => { const b = caseDocumentBlocks(doc.text);
                  return { captures: b.captures, sources: b.sources, blocks_detail: b.detail }; })(),
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

  /* R55 (K651): the one reader of a case document's per-member frozen facts, a service to `public-read` (its R3, R4)
     as to R53 and the commit; it writes nothing and never throws.
     D-442 / BIO_Publication_v0_1.md §3 rule 12 — WHAT A CASE DOCUMENT STATES ABOUT ONE MEMBER, OR
     NULL FOR A LEGACY (/1) DOCUMENT, whose members carried these blocks in their own bytes (rule 12
     (e)). THE ONE READER of `case_roles[].edition`, `case_strength` and `case_strength_grounds`:
     the ratify committer and `caseEditionState` both ask here, so the per-case frozen facts are
     parsed one way. `strength` is the member-bytes block's row shape exactly (`axis`, `state`,
     `grade`, `weakest`, `load_bearing`, `population`, `detail`), so every consumer of the old
     `published_strength` reads it unchanged. */
  caseDocMemberFrozen(caseId, edition) {
    /* R55: never throws; a document this read cannot read or parse states nothing it can answer. */
    try { return this.#caseDocMemberFrozen(caseId, edition); } catch { return null; }
  }

  #caseDocMemberFrozen(caseId, edition) {
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
    /* R60: a capture's SHA-256 (never a bundle id) reads its attesting member's choice, on the same rule. */
    if (typeof observation === "string" && HEX64.test(observation))
      return this.#one(`SELECT level, edition, chosen_by, chosen_at, reason FROM capture_attributions
                         WHERE case_id=? AND capture_sha=? AND edition<=? ORDER BY edition DESC LIMIT 1`,
                       caseId, observation, edition) || null;
    /* R17: the choice is read back with its reason (DEC-88), null on a choice recorded before it. */
    return this.#one(`SELECT level, edition, chosen_by, chosen_at, reason FROM observation_attributions
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

  /** R60 (DEC-119 (3)): THE OFF-THE-RECORD CAPTURES ONE CASE DOCUMENT REACHES: each capture its `sources:` block (case-grammar
   *  R1) states with no basis, the Withheld statement (case-authoring R37, R46), in the document's order, once each. */
  #capturesReachedBy(docText) {
    let rows = null;
    try { rows = caseDocumentBlocks(String(docText || "")).sources; } catch { rows = null; }
    return [...new Set((Array.isArray(rows) ? rows : [])
      .filter((r) => r && typeof r.capture === "string" && HEX64.test(r.capture) && (r.basis == null || r.basis === "null"))
      .map((r) => r.capture))];
  }

  /* R17, R60: everything an edition's attribution statements are about: its observations, then its off-the-record
     captures, keyed by their SHA-256. */
  #attributedReachedBy(docText) {
    return [...this.#observationsReachedBy(docText), ...this.#capturesReachedBy(docText)];
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
      return d ? this.#attributedReachedBy(d.text) : [];
    })();
    return obsList.map((obs) => {
      /* R60 (K1315): an off-the-record capture's row carries `capture`, its SHA-256, in `observation`'s place. */
      const key = HEX64.test(String(obs)) ? { capture: obs } : { observation: obs };
      const act = this.attributionInForce(caseId, edition, obs);
      if (!act) return { ...key, level: null, shown: null, chosen_at_edition: null,
                         why: "its author has chosen no level for this edition or any earlier one" };
      /* R60: a capture's level publishes its attesting member's values, the member who chose it. */
      const g = HEX64.test(String(obs)) ? { author: act.chosen_by }
        : this.#one(`SELECT author FROM register WHERE bundle_id=? AND authored=1 LIMIT 1`, obs);
      const m = g ? this.membership.memberFacts(g.author) : null;
      /* WHAT EACH LEVEL PUBLISHES, and nothing else (a projection, not a refusal site, so it carries no DEC-49 marker). */
      const shown = act.level === "group" ? this.#producingGroup()
        : act.level === "project" ? project
        : act.level === "cover" ? (m && m.cover ? m.cover : null)
        : act.level === "name" ? (m && m.handle ? m.handle : null)
        : null;
      if (shown === null && act.level !== "group")
        return { ...key, level: null, shown: null, chosen_at_edition: null,
                 why: `its author chose '${act.level}' at edition ${act.edition}, and the record holds no `
                    + `${act.level === "name" ? "handle" : act.level} for them to publish under it` };
      return { ...key, level: act.level, shown, chosen_at_edition: Number(act.edition), why: null };
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
                                            this.#attributedReachedBy(doc.text));
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
    const observations = this.#observationsReachedBy(doc && doc.text);
    /* R60: the off-the-record captures beside the observations, keyed by their SHA-256; only an observation can name its
       author in its own files (§4.1), so `legacy` asks of observations alone. */
    const reached = [...observations, ...this.#capturesReachedBy(doc && doc.text)];
    const stated = (Array.isArray(fm.observation_attributions) ? fm.observation_attributions : [])
      .map((r) => ({ ...(r && r.capture != null && r.observation == null ? { capture: String(r.capture) }
                                                                         : { observation: String(r && r.observation != null ? r.observation : "") }),
                     level: r && typeof r.level === "string" && r.level !== "null" ? r.level : null,
                     shown: r && r.shown != null && r.shown !== "null" ? String(r.shown) : null }));
    const current = this.attributionStatements(doc.case_id, Number(doc.edition), String(fm.case_project ?? "").trim(), reached);
    return { reached, legacy: this.observationsNamingAuthor(observations), stated, current };
  }

  /** MK-7 — DOES ANY RATIFIED CASE DOCUMENT STATE A CHOSEN LEVEL FOR THIS OBSERVATION? op=ratify asks it before
   *  an observation's own bytes cross as a case's evidence: the words are published only beside a signed
   *  statement of whose they are. Bounded; the text match is the index, the parse the authority. */
  attributionStatedFor(observation) {
    const id = String(observation ?? "");
    if (!id) return false;
    /* R60 (K1315): a capture's row carries `capture` in `observation`'s place. */
    const field = HEX64.test(id) ? "capture" : "observation";
    const docs = this.#rows(`SELECT text FROM case_documents WHERE ratified_at IS NOT NULL
                              AND instr(text, ?) > 0 ORDER BY case_id, edition LIMIT 50`, `  - ${field}: ${id}`);
    return docs.some((d) => {
      const rows = (parseFrontmatter(d.text).data || {}).observation_attributions;
      return Array.isArray(rows) && rows.some((r) => r && String(r[field]) === id
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
   *  the case. `by` is the control plane's stamp and nothing else. DEC-88: `reason`, the author's words on why
   *  this level, is recorded with the choice (C-92.13). R60 (DEC-119 (3)): `capture` in place of `observation` names a
   *  capture the edition's document states as Withheld, and its attesting member (an actor `capture` recorded) chooses,
   *  by this same act, how the edition credits their attestation; the choice is kept per case, capture and edition. */
  attributeObservation({ caseId = null, edition = null, observation = null, capture = null, level = null, reason = null,
                         by = null } = {}) {
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
    /* DEC-88 (C-92.13): the author's words on why this level, stored as written. Blank is empty after trim; the
       bound counts code points (K1030, K1050's reading). Asked before the level is judged, so nothing is written. */
    const why = typeof reason === "string" ? reason : null;
    const chars = why == null ? 0 : [...why].length;
    if (why == null || !why.trim() || chars > ATTRIBUTION_REASON_MAX)
      return refusal("ATTRIBUTION_NO_REASON",
        why == null
          ? (reason === undefined || reason === null
              ? "give the reason you choose this level, in your own words (reason=…)"
              : `the reason must be your words, as text; a ${typeof reason} was sent`)
          : !why.trim() ? "the reason is blank. Say in your own words why you choose this level"
          : `the reason is ${chars} characters, over the ${ATTRIBUTION_REASON_MAX} a choice's reason is kept to. `
            + "Refused rather than cut", { limit: ATTRIBUTION_REASON_MAX });
    if (!ATTRIBUTION_LEVELS.includes(lv))
      return refusal("ATTRIBUTION_LEVEL_UNKNOWN",
        `'${lv.slice(0, 40)}' is not a level; choose one of ${ATTRIBUTION_LEVELS.join(", ")}`,
        { allowed: ATTRIBUTION_LEVELS });
    /* END DEC-49 REGION is-attribute-act */
    /* R60 (DEC-119 (3)): `capture` in place of `observation` names an off-the-record capture, whose attesting member
       chooses how the edition credits their attestation, by this same act and its refusals. */
    const cap = typeof capture === "string" && capture.trim() ? capture.trim().toLowerCase() : "";
    const obs = cap ? "" : typeof observation === "string" ? observation.trim() : "";
    const subject = cap || obs;
    const cid = typeof caseId === "string" ? caseId.trim() : "";
    const ed = Number(edition);
    const doc = cid && Number.isInteger(ed) && ed >= 1
      ? this.#one(`SELECT case_id, edition, doc_sha, text, sig_armored FROM case_documents WHERE case_id=? AND edition=?`, cid, ed)
      : null;
    const reg = obs ? this.#one(`SELECT author FROM register WHERE bundle_id=? AND authored=1 LIMIT 1`, obs) : null;
    const named = cap ? { capture: cap } : { observation: obs || null };
    /* DEC-49 REGION is-attribute-author */
    if (cap) {
      /* A capture is "such a capture" only where the named edition's document states its source as Withheld: one
         answer for a capture no such document names, so the act is not a way to learn what cases exist. */
      if (!HEX64.test(cap) || !doc || !this.#capturesReachedBy(doc.text).includes(cap))
        return refusal("ATTRIBUTION_NOT_AN_OBSERVATION",
          `${cap.slice(0, 80)} is not material from a source the named case edition shows as Withheld, so it has no `
          + `attesting member to choose how they are credited`, named);
      let actors = [];
      try { actors = (this.capture.captureAccountsOf(cap).actors || []).map((r) => String(r.actor || "").replace(/^member:/, "")); }
      catch { actors = []; }
      if (!actors.includes(who.replace(/^member:/, "")))
        return refusal("ATTRIBUTION_NOT_THE_AUTHOR",
          `${cap} was attested by another member. Only the member who attested off-the-record material chooses how a `
          + `case credits them: not a project owner, not an administrator, and not a default (DEC-119 (3))`, named);
    } else {
      if (!reg)
        return refusal("ATTRIBUTION_NOT_AN_OBSERVATION",
          `${obs ? obs.slice(0, 80) : "(none named)"} is not a member's firsthand observation in this record, so it `
          + `has no author to choose how it is attributed`, named);
      if (reg.author !== who)
        return refusal("ATTRIBUTION_NOT_THE_AUTHOR",
          `${obs} was recorded by another member. Only an observation's author chooses how a case shows who said it: `
          + `not a project owner, not an administrator, and not a default (§4.2)`, named);
    }
    const me = this.membership.memberFacts(who);
    if (!me || me.status !== "active")
      return refusal("ATTRIBUTION_AUTHOR_NOT_ACTIVE",
        `the ${cap ? "attesting member" : "author"} of ${subject} is not an active member, and nobody takes this act for `
        + `them (§4.5)`, named);
    /* END DEC-49 REGION is-attribute-author */
    const reaches = !!doc && (cap ? true : this.#observationsReachedBy(doc.text).includes(obs));
    /* DEC-49 REGION is-attribute-edition
       ONE ANSWER for no such document and a document that does not reach this observation, so the act is not
       a way to learn what cases exist: the author is told only about an edition that uses their words. */
    if (!reaches)
      return refusal("ATTRIBUTION_NOT_REACHED",
        `no prepared case edition ${cid ? `${cid.slice(0, 60)} edition ${Number.isInteger(ed) ? ed : "(none)"}` : "(none named)"} `
        + `rests on ${obs}. An attribution is chosen for an edition that uses the observation, once op=publish has `
        + `prepared its case document`, { ...named, caseId: cid || null, edition: Number.isInteger(ed) ? ed : null });
    if (doc.sig_armored)
      return refusal("ATTRIBUTION_EDITION_RATIFIED",
        `${cid} edition ${ed} is already signed, and a signed edition answers forever; your choice applies to the `
        + `next edition, which inherits it until you change it (§4.3)`, { ...named, caseId: cid, edition: ed });
    if (lv === "name" && !(me.handle && String(me.handle).trim()))
      return refusal("ATTRIBUTION_NAME_NO_HANDLE",
        `'name' publishes the handle you appear under in this record, and you have none (§4.6). Choose another `
        + `level, or set a handle first`, named);
    /* END DEC-49 REGION is-attribute-edition */
    const prior = this.attributionInForce(cid, ed, subject);
    /* c22-batch29 union (CONDUCT #22): D-543's one helper, not a hand-spelled whole-second stamp — MK-7 was cut before
       D-543 and d543-instant-precision named this site. Same value: stampInstant("second") of the current instant. */
    const when = stampInstant("second");
    /* The same level again at the same edition writes nothing, so the first reason stands (K1058); another level is a
       new choice, recorded with its own reason. */
    const same = !!(prior && Number(prior.edition) === ed && prior.level === lv);
    if (!same && cap)
      this.sql.exec(`INSERT INTO capture_attributions (case_id, edition, capture_sha, level, chosen_by, chosen_at, reason)
                     VALUES (?,?,?,?,?,?,?) ON CONFLICT(case_id, edition, capture_sha) DO UPDATE SET
                       level=excluded.level, chosen_by=excluded.chosen_by, chosen_at=excluded.chosen_at,
                       reason=excluded.reason`,
                    cid, ed, cap, lv, who, when, why);
    else if (!same)
      this.sql.exec(`INSERT INTO observation_attributions (case_id, edition, bundle_id, level, chosen_by, chosen_at, reason)
                     VALUES (?,?,?,?,?,?,?) ON CONFLICT(case_id, edition, bundle_id) DO UPDATE SET
                       level=excluded.level, chosen_by=excluded.chosen_by, chosen_at=excluded.chosen_at,
                       reason=excluded.reason`,
                    cid, ed, obs, lv, who, when, why);
    const held = this.attributionInForce(cid, ed, subject);
    const reauthored = this.#reauthorAttributions(doc);
    /* R60 (K1317): the capture's attesting member row in the attestations section follows the choice. */
    const attested = cap ? this.#reauthorCaptureAttestation(cid, ed, cap, who, lv, me) : null;
    const fm = parseFrontmatter(doc.text).data || {};
    const stmt = this.attributionStatements(cid, ed, String(fm.case_project ?? "").trim(), [subject])[0];
    return { ok: true, existed: same, ...(cap ? { capture: cap, observation: null } : { observation: obs }), caseId: cid, edition: ed, level: lv, shown: stmt.shown,
             reason: held ? held.reason ?? null : null,
             previous: prior ? { level: prior.level, edition: Number(prior.edition) } : null,
             case_document: reauthored, ...(attested ? { attestations: attested } : {}),
             stated: `edition ${ed} of ${cid} now states ${subject} at level '${lv}'. The case document was re-authored; `
                   + `its owner signs the new bytes. A later edition inherits this choice until you change it.` };
  }

  /* R60 (K1317; case-authoring R48): RE-AUTHOR THE CAPTURE'S ATTESTING MEMBER ROW in the unsigned document's
     `material_attestations:` section, through R21's one splice: each `member` row the chooser made for a material whose
     SHA-256 is the capture is replaced by one stating the chosen level, carrying the member's handle (or cover) and the
     account's signature only at `cover` or `name`, never at `group` or `project`. Every other row is kept as written. A
     document with no such section or row is left as it is and the answer says so. */
  #reauthorCaptureAttestation(caseId, edition, cap, who, level, me) {
    const doc = this.#one(`SELECT case_id, edition, doc_sha, text, sig_armored FROM case_documents WHERE case_id=? AND edition=?`,
                          caseId, edition);
    if (!doc || doc.sig_armored) return { reauthored: false, why: "no unsigned case document is held for this edition" };
    let m = null;
    try { m = materialsOf(parseFrontmatter(doc.text).data || {}); } catch { m = null; }
    const rows = m && Array.isArray(m.material_attestations) ? m.material_attestations : null;
    const refs = new Set((m && Array.isArray(m.materials) ? m.materials : [])
      .filter((x) => x && String(x.sha || "").toLowerCase() === cap).map((x) => x.ref));
    const bare = (v) => String(v ?? "").replace(/^member:/, "");
    const mine = (r) => r && r.by_kind === "member" && refs.has(r.ref)
      && (r.by == null || r.by === "null" || ["group", "project"].includes(r.level)
          || [bare(who), me.handle, me.cover].filter(Boolean).includes(bare(r.by)));
    if (!rows || !rows.some(mine))
      return { reauthored: false, why: "this case document states no attestation row of yours for that capture" };
    let signature = null;
    try {
      const accounts = (this.capture.captureAccountsOf(cap).accounts || []).filter((a) => bare(a.by) === bare(who));
      signature = accounts.length ? accounts[accounts.length - 1].signature ?? null : null;
    } catch { signature = null; }
    const named = level === "cover" || level === "name";
    const next = rows.map((r) => (!mine(r) ? r : { ...r, level,
      by: named ? (level === "name" ? me.handle ?? null : me.cover ?? null) : null,
      signature: named ? (r.signature && r.signature !== "null" ? r.signature : signature) : null }));
    const { ok: _ok, ...out } = this.reauthorSection({ caseId, edition, docSha: doc.doc_sha, section: "attestations",
      lines: { frontmatter: materialAttestationLines(next), body: [] } });
    return out;
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

  /* R53 (K651): the one answer to what a case edition is, a service to `public-read` (its R3, R6) as to this module's
     commit (R22); it composes no case-level strength (R26), and its one write is the completion stamp below.
     REC-44: what a case edition is, and whether it is COMPLETE. One place, so
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

                THE FENCE IS THE PART THAT MATTERS: R53 names `opened` in this
                answer and its test (`test/m/publication/services.test.mjs`)
                holds the key, so deleting it fails; that each consumer NAMES
                its fields and none spreads this state is the consumer's to
                keep (`public-read` reads it, its R3, R6). */
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
    /* R15: a case id, a whole edition, a manifest object, its SHA-256 as 64 lowercase hex, and a byte count that is a
       whole number or absent; anything else is MALFORMED and nothing is written (never a throw). */
    if (typeof caseId !== "string" || !caseId.trim() || !Number.isInteger(Number(edition)) || Number(edition) < 1
        || !manifest || typeof manifest !== "object" || typeof manifestSha !== "string" || !/^[0-9a-f]{64}$/.test(manifestSha)
        || !(bytes == null || (Number.isInteger(bytes) && bytes >= 0)))
      return { ok: false, reason: "MALFORMED",
               detail: "a case manifest names its case, its edition, the manifest and its SHA-256 (64 lowercase hex)" };
    const ed = Number(edition);
    return this.record.transact(() => {
      const c = this.#one(`SELECT manifest_sha FROM published_cases WHERE case_id=? AND edition=?`, caseId, ed);
      if (!c) return { ok: false, reason: "NO_SUCH_CASE_EDITION", caseId, edition: ed };
      /* R15, R24: recorded once. The same hash again is a retry and writes nothing (the manifest held is the one that
         hash was recorded for, whatever this call carries); another hash is refused. */
      if (c.manifest_sha === manifestSha) return { ok: true, caseId, edition: ed, manifest_sha: manifestSha, existed: true };
      if (c.manifest_sha)
        return { ok: false, reason: "MANIFEST_EXISTS", caseId, edition: ed, manifest_sha: c.manifest_sha,
                 detail: `case ${caseId} edition ${ed} already has a manifest at a different hash. An edition is `
                       + `a SEPARATE DOCUMENT and its container answers forever; a second manifest under the `
                       + `same number would leave a reader unable to say which container they checked.` };
      this.sql.exec(`UPDATE published_cases SET manifest_sha=?, manifest=? WHERE case_id=? AND edition=?`,
                    manifestSha, JSON.stringify(manifest), caseId, ed);
      this.sql.exec(
        `INSERT INTO published_shas (sha256,bundle_id,path,kind,bytes,published) VALUES (?,?,?,?,?,?)
         ON CONFLICT(sha256,bundle_id,path) DO NOTHING`,
        manifestSha, caseId, "MANIFEST.json", "manifest", bytes ?? null, this.#when());
      /* R15 (K1315): every file the manifest lists is registered in the same act, so each is served by hash. */
      let files = 0;
      for (const f of Array.isArray(manifest.files) ? manifest.files : []) {
        if (!f || typeof f !== "object" || typeof f.sha256 !== "string" || !HEX64.test(f.sha256)
            || typeof f.path !== "string" || !f.path) continue;
        this.sql.exec(
          `INSERT INTO published_shas (sha256,bundle_id,path,kind,bytes,published) VALUES (?,?,?,?,?,?)
           ON CONFLICT(sha256,bundle_id,path) DO NOTHING`,
          f.sha256, caseId, f.path, typeof f.kind === "string" && f.kind ? f.kind : "case_file",
          Number.isInteger(f.bytes) ? f.bytes : null, this.#when());
        files++;
      }
      return { ok: true, caseId, edition: ed, manifest_sha: manifestSha, ...(files ? { files } : {}) };
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
     that first named it.

     N256 / K283 (Bob, 2026-09-28): A SERVE-CLASS EDGE WHOSE TARGET IS NOT YET
     PUBLISHED IS HELD PRIVATELY, no longer dropped. It is written to
     `published_held_references`, which the public read path never reads, so the
     target's id stays unpublished; when the target is published, `commitEdition`
     turns it into a `serve` edge (R22, R35). `held` counts them; `dropped` is
     kept in the answer and is now always 0 (nothing is dropped). */
  publishEdges(bundleId, edges, now) {
    if (!Array.isArray(edges)) return { serve: 0, name: 0, held: 0, dropped: 0 };
    const out = { serve: 0, name: 0, held: 0, dropped: 0 };
    for (const e of edges) {
      if (!e || typeof e.to !== "string" || !e.to || typeof e.kind !== "string" || !e.kind) continue;
      /* A self-edge discloses nothing and is not a graph. */
      if (e.to === bundleId) continue;
      const nameOnly = e.disclosure === "name";
      if (!nameOnly && !this.#one(`SELECT bundle_id FROM published_bundles WHERE bundle_id=? LIMIT 1`, e.to)) {
        this.sql.exec(
          `INSERT INTO published_held_references (from_bundle,to_bundle,kind,held_at) VALUES (?,?,?,?)
           ON CONFLICT(from_bundle,to_bundle,kind) DO NOTHING`, bundleId, e.to, e.kind, now);
        out.held++;
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

  /* REC-128 — THE ONE READ CHOKEPOINT FOR WHO DELIVERED A RATIFICATION. Every
     read that serves a ratification (the finding rows, the case document, the
     public case read and so the container that travels) answers through here,
     from the stored `delivered_by` column and from NOTHING ELSE: in particular
     never from `attestor_member`, so a row written before the column existed
     reads UNDETERMINED, stated, rather than back-filled from its signer.
     R14's, R27's and R28's tests (`test/m/publication/convert-deliverer.test.mjs`,
     `published.test.mjs`) read every such answer against its stored column and
     its signer, so a back-fill here fails them. */
  #deliveredBy(row) { return delivererOf(row ? row.delivered_by : null); }

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

  /* R54 (K651): pure, never throws; a service to `public-read` as to this module's commit (R22) and registry (R7).
     THE SOLE MEMBERSHIP, OR NULL — D-309's ONE MIGRATION RULE, WRITTEN ONCE SO
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
    /* R54: never throws; anything that is not a `{case_id, edition}` row names no case. */
    const rows = (Array.isArray(list) ? list : []).filter((x) => x && typeof x === "object" && x.case_id != null);
    const ids = [...new Set(rows.map((x) => x.case_id))];
    if (ids.length !== 1) return null;
    let top = null;
    for (const x of rows) if (top == null || Number(x.edition) > top) top = Number(x.edition);
    return { case_id: ids[0], edition: top };
  }

  /* D-431 (b): WHICH FINDINGS OF A RATIFIED CASE REST ON THIS BUNDLE, and each one's publishing project.
     Asked over every roster row a RATIFIED case edition PINNED (`version_sha` set, joined to
     `published_cases`, which only `ratifyCaseDocument` writes), at the PINNED bytes — the bytes the case
     froze and the finding will be signed at, never whatever `bundle.md` says today (the working `refs`
     table is a projection of today's document and would be a second edge set). The bytes are read from the
     live file when it is still at the pin and from `history` when the finding has moved since. PINNED BYTES
     THIS STORE CANNOT READ rest on nothing here: the question is then undeterminable, and admitting a
     bundle on an undetermined answer is the direction this defect runs in.
     R38 (N308, K380): PAGED BY THE PIN. One call reads at most `limit` pins (a ratified case edition's member with a
     pinned sha, other than `id`; the editions of one case pinning one sha are one pin), in case id, member id and
     pinned sha order after `after`, and `cursor` is the last pin read (`<case>#<member>#<sha>`) when more follow, else
     null. A page may answer no finding while `cursor` is set; a caller follows it to null, so nothing is decided on
     part of the pins (a truncated list would change who may sign, K380). */
  ratifiedFindingsRestingOn(bundleId, { after = null, limit = null } = {}) {
    const id = String(bundleId ?? "");
    const cap = pageOf(limit, RESTING_PINS_MAX);
    const [aCase, aMember, aSha] = pinCursor(after);
    const pins = this.#rows(
      `SELECT DISTINCT m.case_id, m.bundle_id, m.version_sha, cs.project_id
         FROM published_case_members m
         JOIN published_cases c ON c.case_id=m.case_id AND c.edition=m.edition
         LEFT JOIN cases cs ON cs.case_id=m.case_id
        WHERE m.version_sha IS NOT NULL AND m.bundle_id<>?
          AND (m.case_id>? OR (m.case_id=? AND (m.bundle_id>? OR (m.bundle_id=? AND m.version_sha>?))))
        ORDER BY m.case_id, m.bundle_id, m.version_sha LIMIT ?`,
      id, aCase, aCase, aMember, aMember, aSha, cap + 1);
    const more = pins.length > cap;
    if (more) pins.length = cap;
    const findings = [];
    for (const p of pins) {
      const text = this.record.textAtSha(p.bundle_id, p.version_sha);
      if (typeof text !== "string") continue;
      const fm = parseFrontmatter(text).data || {};
      if (publishedGraphEdges(fm).some((e) => e.disclosure === "serve" && e.to === id))
        findings.push({ case_id: p.case_id, finding: p.bundle_id, project: p.project_id ?? null });
    }
    const last = pins[pins.length - 1];
    return { findings, limit: cap, cursor: more ? `${last.case_id}#${last.bundle_id}#${last.version_sha}` : null };
  }

  /* D-309: SITE 2's QUERY, LIFTED OUT OF `publish()` AND PUT BESIDE ITS SIBLINGS,
     AND THE REASON IS A MEASUREMENT RATHER THAN TIDINESS — stated in full because
     a reader could otherwise take it for evasion, and it is the opposite.

     `meaning-bounds.test.mjs` (deleted in T20) graded an op OPAQUE when its method
     contained a `#rows(` call and published no collection: *"rows came out of the
     store and this reader could not say what happened to them."* Correcting site 2
     put the first `#rows(` into `publish()`'s own body, and the walk moved `op=publish`
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

     IT IS NOT HIDDEN FROM ANYTHING. This helper is a public method of this module,
     R38's `pinnedCaseEditionsOf`, and its tests (`test/m/publication/
     relation.test.mjs`, `convert-ratify-authority.test.mjs`) drive it at the
     interface.

     WHAT IT ANSWERS: which case editions froze THESE EXACT BYTES, one entry per
     CASE at that case's newest edition holding them — the same collapse every
     other D-309 site takes, so "how many cases is this member in" has one answer
     across the file. The JOIN on `published_cases` is unchanged and still does its
     job: only case editions that exist are membership. */
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
       ~100 variables is refused by workerd (D-36) — reproduced through `/publishedtargets` by the system suite
       `frontier-chunk.test.mjs` (deleted in T20). `json_each(?)` is this file's own precedent (the authored-capture read)
       and binds ONE variable whatever the list's length. Not chunked: one statement reads the whole bounded
       list, and a loop around it would add statements while the per-row work is unchanged. */
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
           as the sole membership or null. No check reads either key (measured
           when this was written: zero hits for this registry's `case_id` in the
           check catalogue, whose readers of it are inquiry-grammar's since T19),
           so the correction is to the shape rather than
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
 *  tables, declares them to purge (R31), creates corpus-export (K1024; its tables and declaration only), and registers with promotion what this module provides (K206, N152): the
 *  facts `caseMember` (R4), `publishedRegistry` and `publishedCaseRegistry` (R7), and the revision flag (R5) as its
 *  step's projection, raised in the promotion's transaction after the new version is written; and with reevaluation
 *  its cited parts and ratified cases (R41, R43). */
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
    /* R31: the declaration's answer is kept, so a refused one (TABLE_DECLARED: nothing declared) is seen. */
    p.purgeDeclaration = record.declarePurge("publication", PUBLICATION_TABLES, { exempt: PUBLICATION_EXEMPT });
    /* K1024: corpus-export created here, eagerly, so `export_log` exists and is declared exempt at every boot (its R4). */
    void p.corpusExport;
    promotion.registerFact("caseMember", "publication", (id) => !!p.caseRelation(id).member);
    promotion.registerFact("publishedRegistry", "publication", (id, targets) => p.publishedRegistryFor(id, targets));
    promotion.registerFact("publishedCaseRegistry", "publication", (ids) => p.publishedCaseRegistryFor(ids));
    /* R7, record-core R69 (K783): the audit judges each bundle's inherited legs (C-21.2) against the registry this
       module holds, for the bundle and every target its basis names (inquiry R16), as the gate does through the fact. */
    record.registerAuditContext("publication", (id) => {
      const basis = p.inquiry.basisFor(id);
      const targets = basis && basis.ok ? basis.legs.map((l) => l.target_id).filter((t) => typeof t === "string") : [];
      return { publishedRegistry: p.publishedRegistryFor(id, targets) };
    });
    /* R40, record-core R70 (K783): the opaque case ids this module's published tables hold, so the mint ledger never
       draws one again. `cases` and `case_documents` are ratification's registration (record-core R70). */
    record.registerMintSeed("publication", [["CASE", "published_cases", "case_id"],
                                            ["CASE", "published_case_members", "case_id"]]);
    /* R5: `base` is the sha this promotion REPLACES; a case edition that froze it is flagged. A pure INSERT that
       refuses nothing, so no promotion fails on it. */
    promotion.registerStep("publication", {
      project: (c) => { p.flagCasesOnRevision(c.bundleId, c.base ?? null, stampInstant("second")); return null; } });
    /* R41, R43 (N210; K359): reevaluation's R14 case half reads a case's cited parts and pages the ratified cases through
       this one registration (its R26). the plane's store (`plane/store.mjs`) builds reevaluation first, with its `env` (its R25). */
    (d.reevaluation || reevaluationOf(host)).registerCaseParts("publication", {
      parts: (a) => p.caseCitedParts(a || {}), cases: (a) => p.ratifiedCases(a || {}) });
  }
  return p;
}

/** Which purge declaration names one of this module's tables (record-core R21: each owner declares its own). */
export function publicationOwns(t) {
  const name = typeof t === "string" ? t : t && t.name;
  return PUBLICATION_TABLES.some((x) => (typeof x === "string" ? x : x.name) === name) || PUBLICATION_EXEMPT.includes(name);
}

/** The module's ops (K3), as entries of the plane's op map (`plane/store.mjs`). `viewer`, `by` and `secretSha` are the control
 *  plane's stamps, read from the query, so a caller's own copy in a body never wins. The public reads
 *  (`publishededitions`, `publishedcase`, `publishedmanifest`, `verify`, `publishedlist`) are `public-read`'s
 *  `publicReadOps` and `projectstage` is `project-stage`'s `projectStageOps` since K651; the plane's op map
 *  spreads them beside these (K671). */
export function publicationOps(p, url, body) {
  const q = (k) => url.searchParams.get(k);
  const b = body && typeof body === "object" ? body : {};
  return {
    /* CASE-4 / DEC-72: unstamped; every field is already served to a stranger (R6). */
    caseflags: () => p.caseFlags({ caseId: q("case"), target: q("target"), limit: q("limit"),
                                   outstandingOnly: q("outstanding") === "1" }),
    /* MK-7: WHO CHOSE comes from the query string, where the control plane stamped it (R17). */
    attribute: () => p.attributeObservation({ caseId: b.caseId ?? null, edition: b.edition ?? null,
                                              observation: b.observation ?? null, capture: b.capture ?? null,
                                              level: b.level ?? null,
                                              reason: b.reason ?? null, by: q("by") }),
    /* REC-44: internal only, and no caller's op (R15). */
    recordcasemanifest: () => p.recordCaseManifest(b),
    publishedtargets: () => p.publishedTargets(q("ids")),
    excludedby: () => p.excludedBy(q("id"), q("viewer")),
    /* REC-130: both carry the viewer the control plane STAMPS, and fail closed on its absence. */
    casedocfacts: () => p.caseDocumentFacts(q("case"), q("edition"), q("viewer")),
    casedocument: () => p.caseDocument(q("case"), q("edition"), q("viewer"), q("secretSha")),
    /* D-734: internal, the signed text behind a published case-document hash; the control plane re-hashes it. */
    publishedcasedoctext: () => p.publishedCaseDocumentText((q("sha256") || "").toLowerCase()),
  };
}
