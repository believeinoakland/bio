/* ratification — the two signing ceremonies and what they judge (requirements: `build/requirements/ratification.md`;
 * Membership v2 §7, BIO_Publication_v0_1.md §2–§4). Publication takes two signatures: an owner signs the case document
 * (`op=caseratify`), and each finding and the evidence it rests on crosses by its own signature (`op=ratify`). This
 * module holds both ceremonies: whether the project's conclusion a case document records still stands (R1), whether
 * the document is well-formed (the case-document catalogue, R8, in `./checks.mjs`), what may cross and under whose
 * authority (R3–R5), and the facts the signer's gate reads (R7). It commits through `publication`, which holds the
 * record; it authors nothing and owns no table.
 *
 * Extracted from the legacy modules (T8, layer 8; K3, K6, K57, K61, K83 (3), K93 (3), K94, K102): from `store.mjs`, the
 * case-conclusion comparison (`CASE_BEARING_STATES`, `#caseConclusionFor`, `#editionsRecordingConclusion` and its three
 * statics, with the one writer of a `case_conclusions` row), `ratifyCaseDocument`, `gateFacts`, `publish` and their
 * dispatch entries; from `index.mjs`, the two handlers (now `./ops.mjs`, the Worker half); from `bio-checks.mjs`, the
 * catalogue and rows in `./checks.mjs`. The legacy code's comments moved with it, shortened where they only restated
 * the code; the commit's own SQL is `publication`'s (its R22) and its comments went with it.
 *
 * REACHED as `ratificationOf(host, deps)` (K61): one instance per host (the Durable Object's `ctx`), created on the
 * first call. At creation it registers the case-document catalogue with `promotion` (its R47; R8 here), and the
 * case-member arm of C-2.8 as a promotion check and a record-core audit check (R9).
 * `deps` (each reached through its factory on the same host unless given; a test passes its own):
 *   record, membership, promotion   layer 2: `head`, `textAtSha`, `transact`, `registerAuditCheck`; `caseAuthority`,
 *                                   `inSight`, `existenceAct`, `attestingKeys`; `runCaseGate`, `registerCaseCatalogue`,
 *                                   `registerStep`.
 *   provenance     `registeredFor` (the gate's register rows).
 *   inquiry        `earned`, `subjectEntityOf` (R7's earned registry).
 *   basisVersions  `conclusionOf`, `conclusionRecordOf`, `noProjectConclusionOf`, `projectsDrawingOn` (R1),
 *                  `testimonyReach` (R7).
 *   publication    the case documents, the case relation and pins, the registries, the attribution facts, and the two
 *                  commits (its R2, R4, R7, R17, R22).
 *
 * READ CONTRACTS it reads in its own SQL: publication's `case_documents` and `cases` (its R40), record-core's `manifest` and `history` (`gateFacts`' manifest and history
 * lists, as they were), inquiry's `inquiry_basis` (`bundle_id`, `target_id`, its R40), and connections' `refs`
 * (`gateFacts`' `dangling` list, kept as it was; reported, since connections states no read contract yet). */

import { recordOf, stampInstant } from "../record-core/index.mjs";
import { membershipOf } from "../membership/index.mjs";
import { promotionOf } from "../promotion/index.mjs";
import { provenanceOf } from "../provenance/index.mjs";
import { inquiryOf } from "../inquiry/index.mjs";
import { basisVersionsOf } from "../basis-versions/index.mjs";
import { publicationOf } from "../publication/index.mjs";
import { parseFrontmatter, normalizeType } from "../../checks/bio-checks.mjs";
import { checkCaseDocument, caseMemberFindings, caseMemberImageFindings, completenessFields,
         CASE_CONCLUSION_CHECKS, RATIFY_SCOPE_CHECKS } from "./checks.mjs";

export * from "./checks.mjs";

/* Frontmatter-safe (legacy-store's `#fmSafe`, the rule `caseConclusionRowLines` writes under): the restricted grammar
   has no escapes, and these strings are DERIVED rather than authored, so they are sanitised rather than refused. */
export function fmSafe(s) {
  return String(s ?? "").replace(/[\r\n]+/g, " ").replace(/["\\]/g, "'").trim();
}


/* REC-135 / REC-157 — ONE MEMBER'S ROW OF `case_conclusions`, THE ONE WRITER OF IT.
   MOVED HERE BYTE FOR BYTE from `#caseDocumentText` (REC-135 wrote it inline) and
   changed in nothing: the document calls this for every roster member, and
   `editionsRecordingConclusion` calls it to render what a NEW edition would
   record so the comparison is between two rows written by one function and
   read back by one parser — never between a row and a hand-copied idea of one.
   `c` null writes the row a member with no recorded conclusion gets. */
export function caseConclusionRowLines(m, c) {
  return [
    `  - target: ${m}`,
    `    relationship: ${c ? c.relationship : "null"}`,
    `    project: ${c && c.project ? c.project : "null"}`,
    `    version: ${c && c.version ? c.version : "null"}`,
    `    claim_state: ${c && c.claim ? c.claim.state : "null"}`,
    `    claim: "${fmSafe(c && c.claim && c.claim.text ? c.claim.text : "")}"`,
    `    claim_detail: "${fmSafe(c && c.claim && c.claim.detail ? c.claim.detail : "")}"`,
    `    falsifier: "${fmSafe(c && c.falsifier ? c.falsifier : "")}"`,
    `    falsifier_override_by: ${c && c.falsifier_override ? c.falsifier_override.by : "null"}`,
    `    falsifier_override_at: "${fmSafe(c && c.falsifier_override ? c.falsifier_override.at : "")}"`,
    `    concluded_by: ${c && c.by ? c.by : "null"}`,
    `    concluded_at: "${fmSafe(c && c.at ? c.at : "")}"`];}

export class Ratification {
  #deps;

  constructor({ storage, record, membership, promotion, host = null, provenance = null, inquiry = null,
                basisVersions = null, publication = null } = {}) {
    this.sql = storage.sql;
    this.record = record;
    this.membership = membership;
    this.promotion = promotion;
    this.#deps = { host, provenance, inquiry, basisVersions, publication };
  }

  /* The modules reached lazily: each is created on the same host on first use, unless a test passed its own. */
  get provenance() { return this.#deps.provenance ||= provenanceOf(this.#deps.host); }
  get inquiry() { return this.#deps.inquiry ||= inquiryOf(this.#deps.host); }
  get basisVersions() { return this.#deps.basisVersions ||= basisVersionsOf(this.#deps.host); }
  get publication() { return this.#deps.publication ||= publicationOf(this.#deps.host); }

  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  #one(q, ...a) { for (const r of this.sql.exec(q, ...a)) return r; return null; }

  /* publication R40's read contract: a case document's row, unfenced (in-process; the Worker asked standing), and a
     case's owning project (`cases`, keyed on `case_id` alone; null for a case older than DEC-72, `null` row for none). */
  #caseDocumentRow(caseId, edition) {
    return this.#one(`SELECT doc_sha, text, sig_armored, ratified_at FROM case_documents WHERE case_id=? AND edition=?`,
                     caseId, Number(edition));
  }
  #caseOwner(caseId) { return this.#one(`SELECT project_id FROM cases WHERE case_id=?`, caseId); }


  /* ===== REC-135 / INVESTIGATIVE-SESSION.md §7.1 item 4 (BOB #15, 2026-09-18) —
   * IS THIS QUESTION CONCLUDED, AND FOR WHOSE RELATIONSHIP? THE ONE READER THE
   * CASE PATH ASKS.
   *
   * "Everything that asked 'is this inquiry concluded?' asks it FOR A PROJECT."
   * Before this, publishCase() asked bundles.current_state === 'concluded' —
   * the INQUIRY'S OWN SHARED STATE — which is the single stance §7 forbids: on a
   * shared question one team's conclusion admitted every team's case, and a team
   * that HAD concluded through op=conclude&project= could not publish at all,
   * because the project arm deliberately never moves the inquiry's state
   * (conclude(), THE PROJECT'S CONCLUSION IS WRITTEN ON THE PROJECT AND NOWHERE
   * ELSE). Both halves of that are corrected here.
   *
   * IT CALLS THE EXISTING READERS AND COPIES NEITHER. basis-versions' `conclusionOf` is the
   * project half (REC-124/REC-136: the stance, and only while it is a conclusion
   * — a withdrawal is never a standing answer) and `noProjectConclusionOf` is the
   * inquiry's-own-bytes half (REC-124 item 5, REC-136 item 6). BOB #16's
   * one-reader rule at REC-144: two reads of one quantity must be the same
   * function, or the record can disagree with itself about what a project
   * concluded.
   *
   * THE DISJUNCTION IS A PROVISIONAL AND IT IS ARGUED RATHER THAN ASSUMED, and
   * the alternative is named so reversing it is one edit. §7.1 item 8 says a
   * no-project conclusion is visible as information and is never read as P's,
   * and read strictly that refuses publication to every project whose finding was
   * concluded before the project arm existed — which is EVERY published case in
   * this record and every publishing caller in the battery, since op=conclude had
   * no project arm before 2026-09-18. Item 5 rules the opposite way about the
   * same bytes: they are read as the conclusion of the relationship that
   * concluded them, or of the no-project relationship where none can be
   * established — STATED AS SUCH. So the no-project conclusion still admits a
   * case, and what makes that honest rather than lax is the second half of this
   * item: WHICH relationship the case rests on is written into the case document
   * and into this act's answer, PER MEMBER, instead of being left to a reader to
   * assume it was the publisher's. Tightening later is one arm of this function
   * and a refusal message; it is not a migration.
   * (Item 6's aside — a case needs a project (DEC-72), so a no-project conclusion
   * is never published — is FALSE of the code as built, and is reported to BOB
   * rather than quietly made true in either direction.)
   *
   * not_concluded IS NOT ONE FACT AND IS NEVER RETURNED AS ONE (CLAUDE.md §2:
   * sparse is normal, and saying WHICH is a first-class obligation). The project
   * may have concluded and WITHDRAWN (REC-136's history), may have written an act
   * this plane does not recognise (undetermined, never guessed), may have done
   * nothing — and another project may have concluded the same shared question,
   * which is information and is never this project's stance (item 8). Each is
   * named, and the other-projects read publishes its own bound, because an
   * ABSENCE over a truncated set is not a finding.
   *
   * THE STATE FLOOR SURVIVES, and dropping it would have been this item opening a
   * hole while closing one. current_state no longer decides whether the
   * relationship concluded, but it still decides whether the QUESTION can bear a
   * case at all: conclude() refuses a deferred, dismissed or divided question,
   * yet a project's conclusions[] row written while the question was open
   * SURVIVES the group later setting it down or dividing it (DEC-28: divided is
   * terminal and its legs were re-homed onto children). A case asserted over one
   * of those would rest on a question the group has carried forward or put away,
   * which the old expression refused as a side effect and this refuses on
   * purpose. */
  static CASE_BEARING_STATES = ["open", "surfaced", "concluded"];

  caseConclusionFor(projectId, inquiryId, viewer, currentState) {
    const pid = String(projectId ?? "").trim();
    const inq = String(inquiryId ?? "").trim();
    const bearing = Ratification.CASE_BEARING_STATES.includes(currentState);

    const own = pid && bearing ? this.basisVersions.conclusionOf(pid, inq, viewer) : null;
    if (own)
      return { state: "concluded", relationship: "project", project: pid, inquiry: inq,
               version: own.version ?? null,
               claim: { state: own.claim ? "adopted" : "undetermined", text: own.claim ?? null,
                        version: own.version ?? null, detail: null },
               falsifier: own.falsifier ?? "", falsifier_override: own.falsifier_override ?? null,
               by: own.by ?? null, at: own.at ?? null,
               detail: `${pid} concluded this question on reading '${own.version ?? "(unnamed)"}' and still `
                     + `stands on it, so this case records that project's own adopted claim (7.1 items 1-2).` };

    const np = bearing ? this.basisVersions.noProjectConclusionOf(inq) : null;
    if (np)
      return { state: "concluded", relationship: "no_project", project: null, inquiry: inq,
               version: np.claim && np.claim.version ? np.claim.version : null,
               claim: { state: np.claim ? np.claim.state : "undetermined",
                        text: np.claim && np.claim.state === "adopted" ? np.claim.text : null,
                        version: np.claim && np.claim.version ? np.claim.version : null,
                        detail: np.claim && np.claim.state !== "adopted" ? np.claim.detail ?? null : null },
               falsifier: np.falsifier ?? "", falsifier_override: null, by: null, at: null,
               detail: np.relationship_detail };

    /* WHY IT IS NOT CONCLUDED FOR THIS RELATIONSHIP — the states the project
       could be in, and what any OTHER project has done, kept apart. */
    const rec = pid ? this.basisVersions.conclusionRecordOf(pid, inq, viewer) : { history: [], stance: null };
    const st = rec.stance;
    const why = !bearing ? "question_not_case_bearing"
              : !pid ? "no_project_named"
              : !st ? "project_has_never_concluded"
              : st.act === "withdrawn" ? "project_withdrew_its_conclusion"
              : st.act === "concluded" ? "project_has_never_concluded"
              : "project_stance_undetermined";
    const others = [];
    let othersBound = null, othersTruncated = null;
    if (bearing) {
      const drawing = this.basisVersions.projectsDrawingOn(inq, viewer);
      othersBound = drawing.bound ?? null;
      othersTruncated = drawing.truncated === true;
      for (const p of drawing) {
        if (p.id === pid) continue;
        const c = this.basisVersions.conclusionOf(p.id, inq, viewer);
        if (c) others.push({ project: p.id, version: c.version ?? null, at: c.at ?? null });
      }
    }
    return { state: "not_concluded", relationship: pid ? "project" : "no_project", project: pid || null,
             inquiry: inq, why, claim: { state: "undetermined", text: null, version: null, detail: null },
             stance: st ? { act: st.act, version: st.version ?? null, at: st.at ?? null } : null,
             history_length: rec.history.length,
             inquiry_state: currentState ?? null,
             concluded_elsewhere: others,
             concluded_elsewhere_bounds: { projects_bound: othersBound, projects_truncated: othersTruncated,
                                           detail: "a bounded number of projects drawing on this question are "
                                                 + "read, and only those this viewer may see. A conclusion "
                                                 + "reported here is still true; an ABSENCE over a truncated "
                                                 + "or gated set is not." } };
  }

  /* ===== REC-157 / INVESTIGATIVE-SESSION.md §7.1 item 9 (BOB #19, 2026-09-21) —
   * WHICH CASE EDITIONS PINNING THESE BYTES ALREADY RECORD THE CONCLUSION THIS ACT
   * WOULD RECORD? THE ONE COMPARISON `publishCase()`'s ALREADY_A_CASE_MEMBER AND THE
   * `publish` AFFORDANCE (`#editionWarrantedForJoinedProjectOf`) BOTH ASK.
   *
   * WHY IT EXISTS. `ALREADY_A_CASE_MEMBER` used to compare the finding's BYTES alone
   * (publication's `caseRelation` pin), which answered "would a new edition say anything
   * different" correctly only while a case recorded nothing but those bytes. Since
   * REC-135 (IC-166) an edition also records the conclusion it rests on — WHOSE, on
   * which reading, with the claim verbatim — and a project's conclusion lives on the
   * PROJECT, so it moves while the finding's bytes do not. Item 9: *"a new edition is
   * warranted when the publishing project's latest conclusion is not the one the
   * pinned edition recorded, whether or not `bundle_sha` moved. The refusal compares
   * the RELATIONSHIP, exactly as `NOT_CONCLUDED` does."*
   *
   * WHAT IS ASKED. `rel` is publication's `caseRelation(bundleId)` as the caller holds it; `conc`
   * is `caseConclusionFor`'s CONCLUDED answer — in publishCase() the very object the
   * case document will record, carried on `prepared` and never re-read. The editions
   * are every RATIFIED edition whose roster pins this finding at its CURRENT sha
   * (`rel.pinned`, across every case: DEC-72 clause 6 lets a finding serve many) and
   * the unratified preparation that pins it (`rel.prepared`). An edition pinning an
   * OLDER version is not asked: the finding moved since, and the pin already says so.
   *
   * WHAT "ALREADY RECORDS IT" MEANS, per the relationship this act would record:
   *   - THE PROJECT'S OWN conclusion: the edition's row names the relationship
   *     `project` and the same ENTRY of that project's history — the project, the
   *     reading, the claim state, the claim verbatim, the falsifier or its stated
   *     override, who concluded and when. A conclusion is a dated, authored ACT (§7.1
   *     item 1), so one re-taken after a withdrawal is a different conclusion even
   *     where it adopts the same claim, and the history already says so (DEC-19).
   *     Both rows come from `caseConclusionRowLines` and back through the one
   *     parser, so they are compared in ONE spelling.
   *   - THE NO-PROJECT relationship (a question concluded in its own bytes, §7.1 item
   *     5): the edition's row says `no_project`, OR it recorded no conclusion at all
   *     (every edition before REC-135, and every one before the case document
   *     existed). Here the comparison IS THE PIN, not the fields: that conclusion is
   *     written in the finding's own bytes and this edition pins exactly those bytes,
   *     so it is the same conclusion by hash. An edition that recorded nothing rested
   *     on the question's own `concluded` state — the gate before REC-135 read nothing
   *     else — which is this relationship in these bytes. Comparing FIELDS here would
   *     let a later rewording of the READER (basis-versions' `noProjectConclusionOf`) warrant an
   *     edition of bytes nobody moved, which is the liar's direction.
   *   - ANYTHING ELSE an edition recorded — another relationship, another project's
   *     row, a value this plane does not write — is not this conclusion.
   *
   * WHAT IT CANNOT SEE, stated so the next reader does not have to test it:
   *   - two conclusion acts identical in content, author AND second (the record's
   *     timestamps are second-grained) are indistinguishable in the record and read as
   *     one; a new edition would then record byte-identical rows, so the refusal's own
   *     sentence stays true of what the case would say;
   *   - a reading NAME the frontmatter grammar coerces (`null`, a bare number) is
   *     compared AS COERCED on both sides, one writer and one parser, so equal inputs
   *     stay equal — the coercion is REC-135's unquoted `version:` field, unchanged;
   *   - a case document with no readable text counts as recording NOTHING, which then
   *     compares by the pin as above. */
  static #CONCLUSION_ENTRY_FIELDS = ["project", "version", "claim_state", "claim", "falsifier",
    "falsifier_override_by", "falsifier_override_at", "concluded_by", "concluded_at"];

  editionsRecordingConclusion(bundleId, rel, conc) {
    const editions = [
      ...(rel && Array.isArray(rel.pinned) ? rel.pinned : [])
        .map((p) => ({ case_id: p.case_id, edition: Number(p.edition), state: "ratified" })),
      ...(rel && rel.prepared
        ? [{ case_id: rel.prepared.case_id, edition: Number(rel.prepared.edition), state: "prepared" }] : []),
    ];
    const want = Ratification.#conclusionRowParsed(bundleId, conc);
    const pinned = [];
    for (const e of editions) {
      const d = this.#caseDocumentRow(e.case_id, e.edition);
      const rows = d && typeof d.text === "string" ? (parseFrontmatter(d.text).data || {}).case_conclusions : null;
      const had = Array.isArray(rows)
        ? rows.find((r) => r && typeof r === "object" && String(r.target ?? "") === String(bundleId)) || null
        : null;
      pinned.push({ ...e, recorded: Ratification.#recordedConclusionSummary(had),
                    same: Ratification.#sameRecordedConclusion(had, want) });
    }
    return { same: pinned.filter((e) => e.same), pinned };
  }

  /* What a NEW edition would record for this member, rendered by the one writer and
     read back by the one parser — the same path an edition's own row took. */
  static #conclusionRowParsed(bundleId, c) {
    const text = ["---", "case_conclusions:", ...caseConclusionRowLines(bundleId, c), "---", ""].join("\n");
    const rows = (parseFrontmatter(text).data || {}).case_conclusions;
    return Array.isArray(rows) && rows[0] && typeof rows[0] === "object" ? rows[0] : null;
  }

  static #sameRecordedConclusion(had, want) {
    if (!want) return false;
    const relOf = (r) => (r && typeof r.relationship === "string" ? r.relationship : null);
    const hadRel = relOf(had);
    /* THE PIN IS THE COMPARISON for the no-project relationship — the header says why. */
    if (want.relationship === "no_project") return hadRel === "no_project" || hadRel === null;
    if (want.relationship !== "project" || hadRel !== "project") return false;
    const v = (x) => (x === undefined || x === null ? null : String(x));
    return Ratification.#CONCLUSION_ENTRY_FIELDS.every((k) => v(had[k]) === v(want[k]));
  }

  /* What an edition RECORDED, for the act's answer — null where it recorded nothing. */
  static #recordedConclusionSummary(had) {
    if (!had || typeof had.relationship !== "string") return null;
    const v = (x) => (x === undefined || x === null || x === "" ? null : String(x));
    return { relationship: had.relationship, project: v(had.project), version: v(had.version),
             claim_state: v(had.claim_state), claim: v(had.claim),
             concluded_by: v(had.concluded_by), concluded_at: v(had.concluded_at) };
  }
  /* ---- R7: the facts `op=ratify`'s gate reads that are not in the image ----

     The gate and the signature check run at the control plane (`./ops.mjs`); this hands out the facts and commits.
     The manifest and history lists are still answered because older readers consumed them; plane-gate/1.0 reads all
     of that out of the image instead, since the catalogue wants the bundle as a filesystem.

     REC-140 (D-429): SIGHT FIRST, AND ONE ANSWER FOR ABSENT AND HIDDEN. A bundle the viewer cannot see answers with
     the SAME object a never-minted id does, through ONE condition. Before, the facts were read with no viewer and the
     hidden bundle leaked twice: RATIFY_STALE echoed its real sha, and the ratifier-scoped image came back empty and
     was reported as "bundle.md is missing". A viewer that was NOT SENT (null) is not asked: every other reader of
     these facts is a tool, not a caller. */
  gateFacts(bundleId, viewer = null) {
    const head = bundleId ? this.record.head(bundleId) : null;
    const row = head ? { bundle_id: bundleId, object_type: head.type, current_state: head.currentState,
                         bundle_sha: head.bundleSha } : null;
    /* REC-149: EXISTENCE answers C-70.1 (ratify is an act on the bundle); NONE is the line below, unchanged. */
    { const existence = row ? this.membership.existenceAct(bundleId, viewer) : null; if (existence) return existence; }
    if (!row || (viewer !== null && viewer !== undefined && !this.membership.inSight(bundleId, viewer)))
      return { ok: false, reason: "ABSENT", bundleId };
    const targets = this.#rows(`SELECT target_id FROM inquiry_basis WHERE bundle_id=?`, bundleId).map((r) => r.target_id);
    const testimony = this.basisVersions.testimonyReach([bundleId]);
    return {
      ok: true, row,
      /* REC-182: on a `created` tie the prior promotion is the one WRITTEN first (`rowid`, D-171). */
      manifest: this.#rows(`SELECT snap_key, kind, base, created FROM manifest WHERE bundle_id=? ORDER BY created, rowid`, bundleId),
      history: this.#rows(`SELECT snap_key, sha256 FROM history WHERE bundle_id=? AND path='bundle.md'`, bundleId),
      registers: this.provenance.registeredFor(bundleId)
        .map((r) => ({ capture_sha: r.capture_sha, path: r.path, bytes: r.bytes })),
      /* MK-1 (A): whether this bundle IS, or RESTS ON, a member's authored observation — the publication fence's
         one fact (C-53.10/.11). */
      testimony,
      /* MK-7: which of the observations this bundle is or rests on still name their author in their own files
         (§4.1 keeps those fenced), and — for an observation — whether a RATIFIED case document states a chosen level
         for it, which its words may not cross without. */
      testimonyLegacy: this.publication.observationsNamingAuthor([...testimony.self, ...testimony.via.map((v) => v.observation)]),
      attributionStated: this.publication.attributionStatedFor(bundleId),
      dangling: this.#rows(
        `SELECT r.target_id FROM refs r LEFT JOIN bundles b ON b.bundle_id=r.target_id
         WHERE r.bundle_id=? AND b.bundle_id IS NULL`, bundleId).map((r) => r.target_id),
      signers: this.membership.attestingKeys(),   /* membership R70: the ONE predicate (D-158) */
      /* REC-14: the two facts the catalogue cannot get from the bundle — what THIS case asserted at its previous
         edition (C-21.1) and what the cases beneath it FROZE (C-21.2), read with the rows so the gate and the write
         path see the same published record. */
      publishedRegistry: this.publication.publishedRegistryFor(bundleId, targets),
      /* REC-44, D-309: C-21.1's fact is a CASE fact, for EVERY case this document is pinned or prepared into, read
         from the document's own claim and never from a request. */
      publishedCaseRegistry: this.publication.publishedCaseRegistryFor(this.publication.caseClaimsOf(bundleId)),
      /* REC-18: what each basis target EARNS, so an earned grade is confirmed at the ratification gate and not only at
         the write. The subject comes from the PROJECTION here (the document is already promoted). */
      earnedRegistry: this.inquiry.earned(this.inquiry.subjectEntityOf(bundleId), targets),
    };
  }

  /* ---- R2: the case document's catalogue, on the promotion instance (K233) ----

     `op=caseratify`'s gate runs here, in the Durable Object, because the catalogue this module registered (R8) lives
     on the promotion instance of this host; the Worker has none. THE CATALOGUE, over the bytes the signature covers
     and over nothing else: the document is re-read at the `docSha` the Worker verified the signature over, and a
     document that moved since answers CASE_RATIFY_STALE. `priorCase` is C-21.1's fact at case altitude and comes from
     the one facts read that has the rows — passing null would not soften C-21.1, it would blind it. */
  caseGate({ caseId, edition, docSha, viewer = null, secretSha = null } = {}) {
    const facts = this.publication.caseDocumentFacts(caseId, edition, viewer, secretSha);
    if (!facts || !facts.ok) return facts || { ok: false, reason: "NO_CASE_DOCUMENT" };
    if (facts.doc.doc_sha !== docSha)
      return { ok: false, reason: "CASE_RATIFY_STALE", expected: facts.doc.doc_sha, got: docSha ?? null,
               detail: "the case document has changed since it was reviewed; read it again and re-sign" };
    const parsedDoc = parseFrontmatter(facts.doc.text);
    return this.promotion.runCaseGate({
      caseId: facts.doc.case_id, edition: Number(facts.doc.edition),
      /* D-442 / BIO_Publication_v0_1.md §3 rule 12 (d): the body (C-3.1's section) and each member's basis at the
         pinned bytes (C-2.8's testimony and per-ground arms), both from the one facts read. */
      body: typeof parsedDoc.body === "string" ? parsedDoc.body : null,
      memberBasis: facts.memberBasis || null,
      fm: parsedDoc.data || {},
      priorCase: facts.priorCase
        ? { edition: facts.priorCase.edition,
            statement: facts.priorCase.completeness ? (JSON.parse(facts.priorCase.completeness).statement ?? null) : null,
            bias_acknowledgement: facts.priorCase.bias_acknowledgement ?? null }
        : null });
  }


  /* ===== R3 — CASE-5b / DEC-72: THE CASE RATIFICATION COMMITTER ==================

     THIS IS THE METHOD THE WHOLE ITEM EXISTS FOR. Every case fact this plane
     holds is written here, FROM THE SIGNED CASE DOCUMENT AND FROM NOTHING ELSE
     — publication's `publishEdges` doctrine, arriving at the altitude the facts were always
     about. `cases`, `published_cases` and `published_case_members` are all
     parsed out of `case_documents.text`, whose hash the signature covers.

     THE FIRST FENCE IS THE ITEM'S OWN. `CASE_UNSIGNED` refuses a commit that
     arrives without an armored signature and an attestor key. It is a REFUSAL
     and not an `if` around the writes, and the difference is the whole point: a
     silent skip would mean a caller who reached this method without a signature
     got nothing written and no reason, which is indistinguishable from a caller
     whose case had nothing to write. Named, it says exactly what this record
     refuses — committing a group's case assertions from an unsigned request.

     THE PARAMETERS THAT ARE NOT READ FROM THE DOCUMENT are the signature itself,
     the key that made it, the member that key belongs to, and the catalog
     version that judged it. Those are facts about the ACT rather than about the
     case, and an act's own facts are exactly what a request legitimately carries
     — the same split `publish()` already makes one altitude down.

     `docSha` IS CHECKED AGAINST THE STORED ROW rather than trusted, because the
     control plane verified a signature over a hash and this method must be sure
     it is committing the bytes that hash names. A mismatch means the document
     moved between the read and the commit, which is RATIFY_STALE's question
     arriving here.

     IDEMPOTENT ON A RETRY. Re-ratifying the same edition with the same sha and
     the same signature reports `existed` and writes nothing, exactly as
     `publish()` does: a retry is not a revision. A DIFFERENT signature over the
     same edition is refused, because an edition answers forever and two
     attestations of one edition would leave a reader unable to say who stood
     behind it. */
  ratifyCaseDocument({ caseId, edition, docSha, sigArmored, attestorKey, attestorMember,
                       gateVersion, deliveredBy = null } = {}) {
    const id = String(caseId ?? "").trim();
    const ed = Number(edition);
    if (!id || !Number.isInteger(ed) || ed < 1 || !docSha) return { ok: false, reason: "MALFORMED" };
    if (!sigArmored || !attestorKey || !gateVersion)
      return { ok: false, reason: "CASE_UNSIGNED", caseId: id, edition: ed,
               detail: `a case's own assertions — its identity, its producing project, its scope, its `
                     + `roster, its load-bearing partition, its bias acknowledgement and its standard of `
                     + `evidence — are committed from BYTES A MEMBER SIGNED and from nothing else. This `
                     + `request carries no signature over case ${id} edition ${ed}, so committing it would `
                     + `mean this plane asserting a group's case on their behalf. Review the case document `
                     + `(op=casedocument) and ratify it (op=caseratify).` };
    return this.record.transact(() => {
      const doc = this.#caseDocumentRow(id, ed);
      if (!doc) return { ok: false, reason: "NO_CASE_DOCUMENT", caseId: id, edition: ed };
      if (doc.doc_sha !== docSha)
        return { ok: false, reason: "CASE_RATIFY_STALE", caseId: id, edition: ed,
                 expected: doc.doc_sha, got: docSha,
                 detail: `the case document has changed since it was reviewed. Read it again and re-sign: a `
                       + `signature over the previous bytes says nothing about these.` };
      /* OUT OF THE SIGNED BYTES. Parsed here rather than at the control plane
         for `publish()`'s own reason: the bytes are in this store, and re-reading
         them at the layer that already verified a hash over them is where the
         two could come to disagree. Parsed BEFORE the retry check (moved up by
         REC-137) because both of the authority questions below are asked of the
         PUBLISHING PROJECT. */
      const fm = parseFrontmatter(doc.text).data || {};
      const roster = (Array.isArray(fm.case_findings) ? fm.case_findings : [])
        .map((x) => String(x ?? "").trim()).filter(Boolean);
      const rows = (Array.isArray(fm.case_roles) ? fm.case_roles : [])
        .filter((r) => r && typeof r === "object")
        .map((r) => ({ target: String(r.target ?? "").trim(), role: String(r.role ?? "").trim(),
                       version_sha: typeof r.version_sha === "string" ? r.version_sha : null }));
      const project = typeof fm.case_project === "string" && fm.case_project !== "null"
        ? fm.case_project.trim() : null;
      /* ===== REC-137 — WHO AUTHORISES A CASE, AND WHO MAY CARRY IT IN ==================
         Membership Architecture v2 §7, *"A CASE RATIFICATION: who AUTHORISES it and who
         may DELIVER it"* (BOB #15, 2026-09-18). Two questions, two answers, asked in this
         order and BEFORE the idempotent retry below, so a refused deliverer or a
         non-owner's signature is refused whether or not the edition already stands:

         (1) DELIVERY IS CARRIAGE, NOT DIRECTION (AI Roles §3 rule 4: the record states
             signer and deliverer apart). A member with a role in the project may deliver,
             and so may the FOUNDER, as DEC-33's interim publishing route; an enrolled
             administrator with no role in the project may NOT — administrators direct
             nothing (§4.9). The member half is REC-134's ONE positional check, consumed
             and never restated: `deliveredBy` is the control plane's reading of the SESSION
             ROW (`deliveringPrincipal`, REC-128), `member:<id>` for a member's session —
             byte-identical to `resolveSession`'s positional identity for that session — and
             `founder` for the founder's. The founder is told apart HERE by that principal
             and never by the folded name: a member ENROLLED as `admin` delivers as
             `member:admin`, is asked, and is not the founder. An ABSENT deliverer is every
             internal caller (a store-level committer, the legacy arms), not asked, as at
             every REC-134 act.
         (2) THE AUTHORITY IS THE SIGNATURE, AND IT MUST BE AN OWNER'S (DEC-72 clause 5:
             publishing is the project owner's act). Before this the instance-wide signer
             set was the only authority asked, so any registered signer could commit an
             owner's case under their own name. Asked through membership's owner predicate, §7's one
             owner predicate, never a second spelling of it. A case document naming no
             project has no owner to sign it and is refused by the same rule — DEC-72
             removed the project-less case, so this is a legacy document, and an absent
             publisher is not a publisher of none. */
      /* REC-140: both questions now live in membership's `caseAuthority`, which `op=ratify` asks too for a
         finding a ratified case pins — MOVED there, not restated, so there is one rule. */
      const denied = this.membership.caseAuthority({ project, deliveredBy, signer: attestorMember, act: "caseratify",
                                           subject: `case ${id} edition ${ed}`, extra: { caseId: id, edition: ed } });
      if (denied) return denied;
      /* ===== END REC-137 ================================================================ */
      if (doc.ratified_at) {
        if (doc.sig_armored === sigArmored) return { ok: true, existed: true, caseId: id, edition: ed };
        return { ok: false, reason: "CASE_EDITION_ALREADY_RATIFIED", caseId: id, edition: ed,
                 detail: `case ${id} edition ${ed} is already ratified under a different signature. An `
                       + `edition is a separate document and answers forever — a second attestation over the `
                       + `same number would leave a reader unable to say who stood behind what they read. `
                       + `Publish a new edition instead.` };
      }
      /* ===== REC-167 / INVESTIGATIVE-SESSION.md §7.1 items 4 and 9 — THE CONCLUSION A PREPARATION
         RECORDS MUST STILL BE THE ONE ITS PROJECT STANDS ON WHEN IT IS SIGNED ======================
         WHAT WAS WRONG, measured by REC-157 (M-92): a project concludes, `op=publish` prepares an edition
         whose document RECORDS that conclusion (REC-135, `case_conclusions:`), the project WITHDRAWS, and
         this committer still signed the document — the published edition then asserted, as the project's,
         a conclusion the project had given up before anybody signed. Nothing here re-asked the
         relationship: `op=publish` asked it once, at preparation, and the window after is exactly where a
         project's conclusion can move while the finding's bytes and this document do not.
         SO THIS ASKS, PER ROSTER MEMBER, WHAT `op=publish` ASKS, through the SAME two readers and never a
         copy of either: (1) `caseConclusionFor` — is the question concluded FOR THE DOCUMENT'S PUBLISHING
         PROJECT (the NOT_CONCLUDED gate's one reader), and (2) `editionsRecordingConclusion` applied to
         THIS ONE DOCUMENT as the preparation — is that conclusion the one the document RECORDS (item 9's
         comparison: a project conclusion compared as the dated, authored ENTRY; a no-project one by the
         pin). Concluded-ness ALONE would pass a project that withdrew and concluded again on another
         claim — the document would then sign claim A for a project standing on claim B — so both are asked.
         THE VIEWER IS THE SIGNER, who `caseAuthority` just established is an OWNER of the project, so the
         project's own record is in sight; an owner cannot be told a project it owns "never concluded"
         for want of sight.
         ASKED AFTER THE RETRY, deliberately: a ratified edition answers forever (DEC-19 — its conclusion is
         history once signed), so a byte-identical retry of an edition that already stands still reports
         `existed`, and this question is asked only of a document about to be signed. ASKED BEFORE ANY
         WRITE, inside the transaction, so a refusal commits nothing. The route is item 9's: publish again,
         and the new document records what the project stands on now (REC-157 made that edition reachable). */
      const concViewer = attestorMember ? `member:${attestorMember}` : null;
      const moved = [];
      for (const m of roster) {
        const bm = this.record.head(m);
        const conc = this.caseConclusionFor(project, m, concViewer, bm ? bm.currentState : null);
        const rec = this.editionsRecordingConclusion(m, { pinned: [], prepared: { case_id: id, edition: ed } }, conc);
        if (conc.state === "concluded" && rec.same.length) continue;
        moved.push({ target: m, recorded: rec.pinned.length ? rec.pinned[0].recorded : null,
                     now: conc.state === "concluded"
                       ? { state: "concluded", relationship: conc.relationship, project: conc.project,
                           version: conc.version ?? null, claim: conc.claim ? conc.claim.text ?? null : null,
                           concluded_by: conc.by ?? null, concluded_at: conc.at ?? null }
                       : { state: "not_concluded", relationship: conc.relationship, project: conc.project,
                           why: conc.why, stance: conc.stance ?? null } });
      }
      if (moved.length) {
        const refusal = (code, detail) => {
          const row = CASE_CONCLUSION_CHECKS[code];
          return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail,
                   caseId: id, edition: ed, project, moved };
        };
        /* DEC-49 REGION is-caseratify-conclusion-moved */
        return refusal("CASE_CONCLUSION_MOVED",
          `case ${id} edition ${ed}'s document records, for ${moved.map((x) => x.target).join(", ")}, a `
          + `conclusion ${project} no longer stands on: `
          + moved.map((x) => `${x.target} — ${x.now.state === "concluded"
              ? `${project} now stands on a DIFFERENT conclusion (reading '${x.now.version ?? "(unnamed)"}', `
                + `the ${x.now.relationship === "no_project" ? "no-project" : "project's own"} relationship)`
              : `${project} stands on no conclusion (${x.now.why})`}`).join("; ")
          + `. A signed edition records the conclusion it rests on (INVESTIGATIVE-SESSION.md §7.1 item 4), so `
          + `signing this one would publish a conclusion nobody holds. Publish the case again from the project `
          + `(op=publish) — the new document records what the project stands on now (§7.1 item 9) — and sign `
          + `that. Nothing was committed.`);
        /* END DEC-49 REGION is-caseratify-conclusion-moved */
      }
      /* ===== END REC-167 ================================================================ */
      const now = stampInstant("millisecond");
      /* CASE-2's INVARIANT, UNCHANGED AND NOW ASKED ONCE. A case does not change
         hands between editions (DEC-72): the bar is read from the publishing
         project at act time, so two answers here would be two standards of
         evidence for one case with nobody having authored either. `cases` is
         keyed on case_id ALONE precisely so this is a refusal rather than a
         second row. */
      /* REC-212 / §3 rule 13 — READ ONCE, so the committed row and this act's answer cannot come apart.
         `hasOwnProperty` and not truthiness: a document that SAYS UNDETERMINED (`statement_by: null`)
         and one that says NOTHING (no key, authored before rule 13) are two different facts, and
         collapsing them would let the second be read as the first. */
      const stmtWriter = (() => {
        const c = fm.completeness && typeof fm.completeness === "object" ? fm.completeness : null;
        const pub = c && typeof c.author === "string" && c.author.trim() ? c.author.trim() : "(unnamed)";
        if (!c || !Object.prototype.hasOwnProperty.call(c, "statement_by"))
          return { by: null, stated: "this case document says nothing about who wrote its exclusion "
                                   + "statement: it was authored before the record told the statement's "
                                   + "writer apart from the case's publisher (BIO_Publication §3 rule 13), "
                                   + `and ${pub}, who prepared and published it, is not evidence of either.` };
        const by = typeof c.statement_by === "string" && c.statement_by.trim() ? c.statement_by.trim() : null;
        if (!by)
          return { by: null, stated: "UNDETERMINED: this case document states that who wrote its exclusion "
                                   + "statement could not be established, and it is NOT read off "
                                   + `${pub}, who prepared and published the case (BIO_Publication §3 rule 13).` };
        return { by, stated: by === pub
          ? `${by} wrote this case's exclusion statement, and prepared and published the case — two acts, `
            + `one member.`
          : `${by} wrote this case's exclusion statement; ${pub} prepared and published the case — two acts, `
            + `two names (BIO_Publication §3 rule 13).` };
      })();
      const owner = this.#caseOwner(id);
      if (owner && owner.project_id !== project)
        return { ok: false, reason: "CASE_PRODUCTION_DIVERGED", caseId: id, edition: ed,
                 declared: owner.project_id, signed: project,
                 detail: `case ${id} is ${owner.project_id}'s production and this signed case document names `
                       + `${project}. A case does not change hands between editions (DEC-72).` };
      /* THE COMMIT, through publication (its R22), in this transaction and from the signed bytes only (R13): the
         case's owner at its first edition, the edition's scope, completeness and bar, the roster with its roles and
         pins in the roster's own order (the authored publish order), and the signature, signer and deliverer on the
         document. A retry with the same signature answers `existed`, another CASE_EDITION_ALREADY_RATIFIED.
         `deliveredBy` is the control plane's reading of the SESSION and is written as handed — never defaulted to
         `attestorMember` (REC-128, R12). */
      const completeness =
        fm.completeness ? JSON.stringify({
          ...completenessFields(fm),
          subject_position: fm.completeness.subject_position ?? null,
          author: fm.completeness.author ?? null,
          /* REC-212 / §3 rule 13: WHO WROTE THE STATEMENT, committed FROM THE SIGNED BYTES and never
             from `author` above, who prepared and published the case. THREE STATES, not two, and the
             sentence beside the name is what tells them apart for a reader of `op=publishedcase`: a
             name; `null` where this plane established that it could not say (a stated UNDETERMINED);
             and a document authored before this key existed, which says NOTHING about the writer —
             and whose publisher's name is not evidence of either. The last two both commit as null,
             which is why the sentence is committed with them rather than derived by each reader. */
          statement_by: stmtWriter.by,
          statement_by_stated: stmtWriter.stated,
          at: fm.completeness.at ?? null,
          /* D-150 / §3 rule 11: THE SIGNED LIST, committed from the signed bytes. NULL — never
             an empty list — for a document authored before acknowledgements were recorded: it
             says nothing about who else read its statement, which is not the same fact as
             nobody having done so. */
          acknowledgements: Array.isArray(fm.completeness_acknowledgements)
            ? fm.completeness_acknowledgements.filter((a) => a && typeof a === "object")
                .map((a) => ({ kind: a.kind ?? null, by: a.by ?? null,
                               recipient: a.recipient === "null" ? null : a.recipient ?? null, at: a.at ?? null,
                               /* REC-217: a row the publisher's link brought in says so, from the signed bytes. */
                               ...(typeof a.draft === "string" && a.draft && a.draft !== "null"
                                 ? { draft: a.draft } : {}) }))
            : null,
          /* REC-217 / §3 rule 13 (BOB #33): THE LINK AS SIGNED — the draft the publisher named, who and when —
             committed from the signed bytes and present only where the document states one. */
          ...(typeof fm.completeness.draft === "string" && fm.completeness.draft && fm.completeness.draft !== "null"
            ? { draft: { draft_id: fm.completeness.draft, named_by: fm.completeness.draft_named_by ?? null,
                         named_at: fm.completeness.draft_named_at ?? null } } : {}),
          acknowledgements_truncated: Array.isArray(fm.completeness_acknowledgements)
            ? fm.completeness.acknowledgements_truncated === true : null,
        }) : null;
      /* D-442 / BIO_Publication_v0_1.md §3 rule 12: A CASE CAN BE COMPLETE THE MOMENT ITS DOCUMENT IS RATIFIED —
         every member pinned at bytes another case already carried across — and then no op=ratify will ever complete
         it. The group is read off a member's pinned bytes, the same field op=ratify passes, so the commit can hand
         the control plane the edition's state for the container (`assembleCaseContainer`). */
      const firstRow = rows.find((x) => x.target === roster[0]) || {};
      const firstText = roster.length ? this.record.textAtSha(roster[0], firstRow.version_sha ?? null) : null;
      const group = firstText ? ((parseFrontmatter(firstText).data || {}).group ?? null) : null;
      const committed = this.publication.commitCaseEdition({
        case: id, edition: ed, project, at: now, group,
        scope: typeof fm.case_scope === "string" ? fm.case_scope : null,
        completeness,
        biasAcknowledgement: typeof fm.bias_acknowledgement === "string" ? fm.bias_acknowledgement : null,
        bar: fm.required_strength && typeof fm.required_strength === "object" ? JSON.stringify(fm.required_strength) : null,
        roster: roster.map((m) => {
          const r = rows.find((x) => x.target === m) || {};
          return { bundle_id: m, role: r.role ?? null, version_sha: r.version_sha ?? null };
        }),
        sigArmored, attestorKey, attestorMember: attestorMember ?? null, gateVersion, deliveredBy: deliveredBy ?? null });
      if (!committed || !committed.ok) return committed || { ok: false, reason: "CASE_PUBLISH_FAILED", caseId: id, edition: ed };
      if (committed.existed) return { ok: true, existed: true, caseId: id, edition: ed };
      /* R3, publication R5: a ratified newer edition discharges the case's outstanding revision flags, stamped with
         who ratified it and when; never deleted (set-but-never-clear). */
      this.publication.dischargeCaseFlags(id, ed, attestorMember ?? null, now);
      const completedCase = committed.caseState && committed.caseState.complete && !committed.caseState.manifest_sha
        ? committed.caseState : null;
      return { ok: true, caseId: id, edition: ed, project, roster,
               /* REC-212 / §3 rule 13: BOTH NAMES IN THIS ACT'S ANSWER — who wrote the statement and who prepared and
                  published the case — from the one read above, so the answer and the committed row are one fact. */
               statement: { author: fm.completeness && typeof fm.completeness === "object"
                              ? (fm.completeness.author ?? null) : null,
                            by: stmtWriter.by, stated: stmtWriter.stated },
               ...(completedCase ? { completedCase } : {}),
               members: roster.map((m) => {
                 const r = rows.find((x) => x.target === m) || {};
                 return { bundle_id: m, role: r.role ?? null, version_sha: r.version_sha ?? null };
               }),
               ratified_at: now,
               /* THE EDITION IS NOT COMPLETE YET AND THAT IS STATED RATHER THAN HIDDEN. The case is committed; every
                  member still signs its own bytes, because the finding is the unit of truth. `awaiting` is the roster
                  less what is published at its pin. */
               awaiting: Array.isArray(committed.awaiting) ? committed.awaiting : [] };
    });
  }


  /* ===== R5 — THE FINDING COMMITTER: WHAT MAY CROSS, AND UNDER WHOSE AUTHORITY ================================
     REC-14 / DEC-12: the committer APPENDS AN EDITION, and its write is publication's `commitEdition` (its R22).
     What stays here is what decides who may publish: a finding a RATIFIED case pins crosses under the case's rules
     (REC-140), and nothing crosses outside a ratified case (D-431). CASE-5b: eight case parameters left this signature
     — every one of them was a case fact the control plane read out of a MEMBER's frontmatter; the case's facts are
     committed by `ratifyCaseDocument` out of the case's own signed document, and this method resolves the relation
     from the pin. */
  publish({ bundleId, bundleSha, attestorKey, attestorMember, gateVersion, sigArmored, shas,
            edition, title, completeness, strength, edges, group = null, deliveredBy = null,
            /* D-442: whether THESE signed bytes carry their own frozen blocks (a member published
               before BIO_Publication_v0_1.md §3 rule 12, whose `published_strength` the control plane
               read and passed as `strength`). False for a member published under rule 12: its
               edition and frozen pair are then read from the case documents pinning it. */
            memberCarriesBlocks = false } = {}) {
    if (!bundleId || !bundleSha || !attestorKey || !gateVersion || !sigArmored || !Array.isArray(shas))
      return { ok: false, reason: "MALFORMED" };
    return this.record.transact(() => {
      /* ===== REC-140 / D-429 — A FINDING A RATIFIED CASE PINS IS PUBLISHED UNDER THE CASE'S RULES ====
         BIO_Publication_v0_1.md §3 rule 2, as BOB #15 applied it: *wherever op=ratify ratifies a
         finding it takes case ratification's rules* — an OWNER of the publishing project signs, and
         the deliverer is the founder or a JOINED member. Asked through membership's `caseAuthority`, the one
         helper `ratifyCaseDocument` asks, FIRST in this transaction: before the edition refusals and
         before the idempotent retry, so nothing is written on a refusal and a retry is never an
         authority answer to somebody with none.
         WHICH FINDINGS: those whose bytes a RATIFIED case edition pins (publication's `pinnedCaseEditionsOf`, the
         same relation this method commits against below). A ratified case document is public, so the
         project a refusal names is already public — nothing here needs a sight answer.
         WHAT THIS DID NOT REACH, as REC-140 reported it for a ruling: a bundle no ratified case pins —
         an information bundle, a concluded inquiry in no case, and a finding PREPARED into a case whose
         document is not yet ratified — was published exactly as before. D-431 closes all three in the
         block that follows this one.
         SEVERAL PROJECTS: a finding two projects' cases pin is published if SOME publishing project
         passes both questions (its owner signed, its member or the founder delivered); otherwise the
         answer is the first project's refusal, in id order, so it is deterministic. */
      const pinnedBy = this.publication.pinnedCaseEditionsOf(bundleId, bundleSha);
      if (pinnedBy.length) {
        const byProject = new Map();
        for (const pin of pinnedBy) {
          const owner = this.#caseOwner(pin.case_id);
          const pid = owner ? owner.project_id ?? null : null;
          if (!byProject.has(pid)) byProject.set(pid, []);
          byProject.get(pid).push(`${pin.case_id} edition ${Number(pin.edition)}`);
        }
        let refused = null;
        for (const pid of [...byProject.keys()].sort()) {
          const denied = this.membership.caseAuthority({ project: pid, deliveredBy, signer: attestorMember, act: "ratify",
            subject: `finding ${bundleId}, a member of case ${byProject.get(pid).join(", ")},`,
            extra: { bundleId } });
          if (!denied) { refused = null; break; }
          refused = refused || denied;
        }
        if (refused) return refused;
      }
      /* ===== D-431 — NOTHING CROSSES OUTSIDE A RATIFIED CASE (BIO_Publication_v0_1.md §3 rule 2, the second
         note, BOB #16, 2026-09-19; decided from rule 2 and rule 1) =======================================
         REC-140 pinned three publications OUTSIDE a case, as measured: an information bundle in no case, a
         concluded inquiry in no case, and a finding PREPARED into a case whose document was not yet ratified
         (published loose, so the ceremony's order was not enforced). Each is closed here, in the one committer,
         inside its transaction and before the edition refusals and the idempotent retry — so nothing is written
         on a refusal and a retry of bytes that crossed before this rule is not an answer to anybody (what
         crossed stays crossed, rule 1: nothing here retracts a row).
         (a) A FINDING is ratified only at a `bundle_sha` a RATIFIED case pins — the branch above. A finding at
             any other sha is refused C-58.2, naming `op=caseratify` as the act to take first: the case
             document commits the case and its pins BEFORE any member signs (`ratifyCaseDocument`), so "case
             document first" is the ceremony's own order and refusing the other order is not circular.
         (b) ANY OTHER BUNDLE crosses only as EVIDENCE a ratified case's pinned finding RESTS ON
             (publication's `ratifiedFindingsRestingOn`, over `publishedGraphEdges` — the published graph's own edge
             set), signed and delivered as that finding is: `caseAuthority` for that case's project, and when
             several ratified cases' projects rest on it an owner of ANY of them may sign. An inquiry a pinned
             finding rests on crosses here too, as evidence; one nothing rests on is (a)'s.
         SIGHT: the control plane asked it at the gate facts (REC-140), and only PROJECT rows are ever hidden.
         What is consulted here is the RATIFIED cases, which are public, so the answer for a bundle no ratified
         case rests on is the same bytes whether or not some project the caller cannot see is preparing a case
         over it — nothing unratified is read, so there is nothing to disclose. */
      if (!pinnedBy.length) {
        const resting = this.publication.ratifiedFindingsRestingOn(bundleId);
        if (!resting.length) {
          const head = this.record.head(bundleId);
          const refusal = (code, detail) => {
            const row = RATIFY_SCOPE_CHECKS[code];
            return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail, bundleId };
          };
          /* DEC-49 REGION is-ratify-outside-a-case */
          if (head && normalizeType(head.type) === "inquiry")
            return refusal("RATIFY_FINDING_NOT_IN_A_RATIFIED_CASE",
              `${bundleId} at ${String(bundleSha).slice(0, 12)} is not a finding any RATIFIED case pins, and a `
              + `finding is published only as a member of a ratified case (BIO_Publication_v0_1.md §3 rule 2). `
              + `Publish it into a case from its project (op=publish), have an owner of that project sign the `
              + `case document (op=caseratify) FIRST, and then ratify this finding at the version the case `
              + `pinned. Nothing was published.`);
          return refusal("RATIFY_NOT_EVIDENCE_OF_A_RATIFIED_CASE",
            `no finding of a RATIFIED case rests on ${bundleId}, and anything that is not a finding crosses only `
            + `as the evidence a ratified case's finding rests on (BIO_Publication_v0_1.md §3 rule 2). Cite it from `
            + `a finding, publish that finding's case and have an owner sign the case document (op=caseratify); `
            + `then an owner of that project may sign this. Nothing was published.`);
          /* END DEC-49 REGION is-ratify-outside-a-case */
        }
        const byProject = new Map();
        for (const r of resting) {
          if (!byProject.has(r.project)) byProject.set(r.project, []);
          byProject.get(r.project).push(`${r.finding} of case ${r.case_id}`);
        }
        let refused = null;
        for (const pid of [...byProject.keys()].sort()) {
          const denied = this.membership.caseAuthority({ project: pid, deliveredBy, signer: attestorMember, act: "ratify",
            subject: `${bundleId}, the evidence ${byProject.get(pid).join(", ")} rests on,`,
            extra: { bundleId } });
          if (!denied) { refused = null; break; }
          refused = refused || denied;
        }
        if (refused) return refused; /* D-431 (b) */
      }
      /* THE COMMIT, through publication (its R22, R35), in this transaction: the finding's edition — from the signed
         bytes, or for a member published under BIO_Publication §3 rule 12 from the ratified case documents pinning
         them — with EDITION_EXISTS and EDITION_NOT_INCREMENTED (DEC-12: a revision appends; a retry of the same
         bytes is idempotent and reports `existed`), the per-case checks and discharge, the bar projection, every
         file's hash (append-only), and the edges (`serve` only to a published target, `name` otherwise; a `name`
         edge from a published finding to this target becomes `serve`, R16). The signer is the verified signature's
         and the deliverer the control plane's stamp, each from its one source (R12). */
      return this.publication.commitEdition({
        bundleId, bundleSha, pinnedBy, ...(Number.isInteger(edition) ? { edition } : {}), title, completeness,
        strength, memberCarriesBlocks, group, edges, shas, attestorKey, attestorMember: attestorMember ?? null,
        gateVersion, sigArmored, deliveredBy: deliveredBy ?? null, at: stampInstant("millisecond") });
    });
  }

  /* ---- R9: C-2.8's case-member arm, registered with promotion (a check before the write) and record-core (audit) ----
     A replay re-states the record's own past verbatim and is exempt, as every registered check is. The refusal
     names each finding with its check. */
  check(c) {
    if (!c || c.replay || (c.pkg && c.pkg.replay)) return null;
    const md = Array.isArray(c.files) ? c.files.find((f) => f && f.path === "bundle.md") : null;
    if (!md || typeof md.text !== "string") return null;
    let fm = null;
    try { fm = parseFrontmatter(md.text).data; } catch { fm = null; }
    const errs = caseMemberFindings(fm).filter((x) => x.severity === "error");
    if (!errs.length) return null;
    return { ok: false, reason: "CASE_MEMBER_REFUSED",
             detail: "this document's bytes claim to be a published case member (a frozen published_strength block) "
                   + "and do not carry what a case member must carry. Nothing was written.",
             findings: errs.map((x) => ({ check: x.check, detail: x.message, ...(x.repairs ? { repairs: x.repairs } : {}) })) };
  }

  /** R9: the audit check (record-core R59) over one image: every case-member finding of its bundle.md. */
  audit(image) { return caseMemberImageFindings(image, parseFrontmatter); }
}

const instances = new WeakMap();

/** K61: the one instance per host, created on the first call with `deps`. It registers the case-document catalogue
 *  with promotion (its R47; R8 here) and C-2.8's case-member arm as a promotion check and an audit check (R9). */
export function ratificationOf(host, deps) {
  let r = instances.get(host);
  if (!r) {
    const d = deps || {};
    const storage = d.storage || host.storage;
    const record = d.record || recordOf(host);
    const membership = d.membership || membershipOf(host, { record });
    const promotion = d.promotion || promotionOf(host, { record, membership });
    r = new Ratification({ ...d, host, storage, record, membership, promotion });
    instances.set(host, r);
    promotion.registerCaseCatalogue("ratification", checkCaseDocument);
    promotion.registerStep("ratification", { check: (c) => r.check(c) });
    record.registerAuditCheck("ratification", (image) => r.audit(image));
  }
  return r;
}

/** The module's store-half ops (K3), as entries of the legacy store's op map: `gatefacts` (R7), `casegate` (R2's
 *  gate), `caseratify` (R3) and `publish` (R5), the internal hops of the two ceremonies. `viewer` is the control
 *  plane's stamp, read from the query. */
export function ratificationOps(r, url, body) {
  const q = (k) => url.searchParams.get(k);
  const b = body && typeof body === "object" ? body : {};
  return {
    gatefacts: () => r.gateFacts(q("id"), q("viewer") ?? null),
    casegate: () => r.caseGate({ caseId: b.caseId ?? q("case"), edition: Number(b.edition ?? q("edition")),
                                 docSha: b.docSha ?? q("docSha"), viewer: q("viewer") ?? null,
                                 secretSha: q("secretSha") ?? null }),
    caseratify: () => r.ratifyCaseDocument(b),
    publish: () => r.publish(b),
  };
}
