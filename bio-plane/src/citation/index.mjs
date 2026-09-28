/* citation — citing, in the record's own terms "this is why I think that" (requirements: `build/requirements/citation.md`).
 * On a case (a `project`) a citation is a `cites` edge in the case's `references[]`; on a question (an `inquiry`) it is
 * a leg of the question's `basis[]`, with the target in its references too. This module holds that act (`cite`, R1–R3),
 * its withdrawal and restoration on a case (`sever`, `reinstate`, R4: status changes, never deletions) and the one rule
 * of what may be cited now (`retiredNotCitable`, R5). It judges nothing about a leg's grammar, grade or the basis
 * graph: it composes legs, and `inquiry` judges them at the write (its R11), as it judges every other leg.
 *
 * Extracted from the legacy modules (T7, T6-2; K3, K64, K83, K102, N55): `store.mjs` (`cite`, `#edgeTransition`,
 * `sever`, `reinstate`, `#retiredNotCitable`, `#spliceEdgeStatus`, `#legExtentLines`, `#spliceBasis`, the three
 * `CITE_*` bounds and `EDGE_NOTE_MAX`, and the three ops' dispatch entries) and `bio-checks.mjs` (rows C-33.15–C-33.19,
 * C-33.39 and C-45.7–C-45.10, now `./checks.mjs`). The legacy code's comments moved with it, shortened where they only
 * restated it.
 *
 * A CITATION EXISTS ONLY IN THE CITING DOCUMENT'S BYTES (R6, D-21). Both acts write the document and promote it; `refs`
 * and `inquiry_basis` are projections of those bytes (`connections`', `inquiry`'s), re-derived inside the promotion, and
 * this module writes neither. That is what makes the write's leg grammar and its cycle guard unavoidable rather than
 * merely available: there is no path from here to either table.
 *
 * FULLY SYNCHRONOUS, and that is load-bearing: nothing between resolving the selection and committing the promotion
 * awaits, and a Durable Object is single threaded, so no other write can interleave. The compare-and-swap is still
 * passed, as a backstop.
 *
 * REACHED as `citationOf(host, deps)` (K61): one instance per host (the Durable Object's `ctx`), created on the first
 * call with `deps`, returned to every later caller. `deps`:
 *   record, membership, promotion, content, retrieval   the modules it uses, through their factories on the same host
 *                unless a test passes its own.
 *   inquiry      `{earned, checkLegExtentGrammar, BASIS_ROLES}` (inquiry R13, R5, R4): the earned registry that fills a
 *                leg's grade, the one leg-part grammar, and the role vocabulary. Passed by the store until `inquiry`'s
 *                own factory is merged (K120's pattern); with none, citing onto a question is refused
 *                `INQUIRY_UNAVAILABLE` (never written ungraded by default).
 *   now          the module's clock, milliseconds since the epoch (default: the wall clock). */

import { normalizeType, OBJECT_TYPES, parseFrontmatter, createSha256 } from "../../checks/bio-checks.mjs";
import { recordOf, stampInstant } from "../record-core/index.mjs";
import { membershipOf } from "../membership/index.mjs";
import { promotionOf, INLINE_MAX } from "../promotion/index.mjs";
import { contentOf, citationExtent } from "../content/index.mjs";
import { retrievalOf, answerChanged } from "../retrieval/index.mjs";
import { CITE_CHECKS, CITE_EXTENT_CHECKS } from "./checks.mjs";
import { spliceEdgeStatus, spliceReferences, spliceBasis, setScalar, appendSessionLog } from "./splice.mjs";

export { CITE_CHECKS, CITE_EXTENT_CHECKS } from "./checks.mjs";
export { spliceEdgeStatus, spliceReferences, spliceBasis, legExtentLines } from "./splice.mjs";

/** R1: citing writes one frontmatter entry per cited record into a single `bundle.md`, so the edges one citing object
 *  can carry are bounded by the inline bound (1 MiB), not by a selection's size. MEASURED at 83 bytes per edge for the
 *  reference block at a 25-character bundle id (2026-07-25, test/cite-scale.mjs); used only to tell a member roughly
 *  how many would fit, never to decide the refusal, which is made on the real encoded length. */
export const CITE_EDGE_BYTES = 83;
/** R1 (REC-219 / D-579(a)): the `    extent_capture: <64 hex>` line a pinned case edge adds, 85 bytes by construction
 *  (20 + 64 + the newline), not measured, because it is fixed width. */
export const CITE_PIN_BYTES = 85;
/** R3, R4: how many ids a Session Log entry names before it summarises, bounded as the audit bounds its offenders. */
export const CITE_LOG_SAMPLE = 20;
/** R1: a note's ceiling (C-33.15). */
export const NOTE_MAX = 200;
/** R1: an extent value's ceiling (C-45.10). */
export const EXTENT_VALUE_MAX = 200;
/** R4: a severance's or reinstatement's reason, at most this long (a copy: `inquiry` holds its own, K57). */
export const EDGE_REASON_MAX = 160;
/** R4: an edge's note, the reasons appended to it, at most this long, the oldest dropped first. */
export const EDGE_NOTE_MAX = 480;

/* R1 (REC-97 / IC-90): the act's part vocabulary, and the TYPE each wire scalar must take to survive a round trip
   through the restricted frontmatter grammar. `int` and `nums` are coerced ONLY when the spelling permits it; a value
   that does not parse is passed through UNCHANGED so the leg grammar's own sentence refuses it rather than a worse one
   written here. FW-19 / IC-125 added the two newer arms and the image reference. */
export const EXTENT_PARAMS = Object.freeze({
  extent_kind: "text",  extent_ref: "text",
  extent_page: "int",   extent_rect: "nums",
  extent_sheet: "text", extent_cell: "text",
  extent_slide: "int",  extent_shape: "int",
  extent_para: "int",   extent_run: "int",
  extent_range: "text", extent_table: "int",
  extent_part: "text",  extent_cited_as: "text",
  content_id: "text",
});

/* The one no-such-project answer (Membership Architecture v2 §7.9): a project this viewer cannot see answers exactly
   as one that does not exist (R9). Byte for byte `membership`'s own, which it does not export (a copy, K57). */
function noSuchProject(project) {
  return { ok: false, reason: "NO_SUCH_PROJECT", project: project ?? null,
           detail: "no project answers to that id here. A project you cannot see is answered exactly as one "
                 + "that does not exist (Membership Architecture v2 §7.9), so this is not a hint either way." };
}

/* A refusal with a catalogue row carries the row's check and translation (R1). */
const rowOf = (family, code) => ({ code, check: family[code].check, translation: family[code].translation });

const rand = (n) => [...crypto.getRandomValues(new Uint8Array(n))].map((b) => b.toString(16).padStart(2, "0")).join("");

/* ------------------------------------------------------------------ the module */

export class Citation {
  constructor({ record, membership, promotion, content, retrieval, inquiry = null, now } = {}) {
    this.record = record;
    this.membership = membership;
    this.promotion = promotion;
    this.content = content;
    this.retrieval = retrieval;
    this.inquiry = inquiry;
    this.now = typeof now === "function" ? now : () => Date.now();
  }

  /* ---- R5 ---- */

  /** R5 (D-444, D-553): THE ONE RETIRED-TARGET PREDICATE, "may this be cited now". True exactly when the bundle's
   *  current state is `retired`, whatever its type: the rule follows the STATE, so any object in a `retired` state is
   *  not citable, by any door and for every caller. An id with no row answers false (an absent target is refused by
   *  another door and this one claims nothing about it). `source_status` is not read: a removed or modified source
   *  stays citable, `retired` is the other axis. NEVER viewer-gated: whether a viewer can see the target decides only
   *  a refusal's WORDING, never citability. Asked by `cite` (R1), `reinstate` (R4), and the later modules that offer
   *  or suggest a citation, so an offer and a refusal cannot answer differently. Never throws. */
  retiredNotCitable(id) {
    try {
      if (typeof id !== "string" || !id) return false;
      const h = this.record.head(id);
      return !!h && String(h.currentState ?? "").trim() === "retired";
    } catch { return false; }
  }

  /* ---- the citing object, R1 and R4's shared opening ---- */

  /* The citing object, answered through sight BEFORE position (REC-138 / D-426, R9): an existence-only sight is
     `membership`'s C-70.1 (REC-149), and an absent id and one this viewer cannot see give the same answer. */
  #citingObject(project, viewer) {
    const h = typeof project === "string" && project ? this.record.head(project) : null;
    if (h) { const existence = this.membership.existenceAct(project, viewer); if (existence) return { refusal: existence }; }
    if (!h || !this.membership.inSight(project, viewer)) return { refusal: noSuchProject(project) };
    return { head: h };
  }

  /* The live `bundle.md`, parsed, or its readability refusal. */
  #document(project, detail) {
    const f = this.record.readFile(project, "bundle.md");
    if (!f || typeof f.text !== "string") return { refusal: { ok: false, reason: "NO_BUNDLE_MD", project } };
    const parsed = parseFrontmatter(f.text);
    if (!parsed.data)
      return { refusal: { ok: false, reason: "UNPARSEABLE_FRONTMATTER", project, ...(detail ? { detail } : {}) } };
    return { text: f.text, data: parsed.data };
  }

  /* Promote the rewritten `bundle.md` over the head, every OTHER live file carried forward untouched: promote writes a
     whole image, so a writer that mentions one file deletes the rest (the default that once destroyed a provenance
     register). Hand-authored, not mechanical: a member citing evidence is authorship, so no writer and no operation
     are claimed. */
  #write(project, head, text, when, author, fm, objectType) {
    const carried = [];
    for (const path of this.record.livePaths(project) || []) {
      if (path === "bundle.md") continue;
      const f = this.record.readFile(project, path);
      if (!f) continue;
      carried.push(typeof f.text === "string"
        ? { path, text: f.text, sha256: f.sha256 }
        : { path, blobSha: f.blobSha, sha256: f.sha256, bytes: f.bytes });
    }
    const bytes = new TextEncoder().encode(text);
    return this.promotion.promote({
      bundleId: project, base: head.bundleSha, snapKey: `${when.replace(/[-:]/g, "")}_${rand(4)}`,
      author: author || "member",
      files: [{ path: "bundle.md", text, bytes: bytes.length, sha256: createSha256().update(bytes).hex() }, ...carried],
      meta: {
        object_type: objectType, title: fm.title,
        current_state: fm.current_state, prior_state: fm.prior_state ?? null,
        created: fm.created, last_updated: when,
        criticality: fm.criticality ?? null,
      },
    });
  }

  /* ---- sever, reinstate (R4) ---- */

  /** R4: SEVERING and REINSTATING a case's `cites` edges, both at weight `refuse` (R7). SEVERING IS NOT DELETION: the
   *  edge stays, with its target and rel intact, and only its status moves, so a reader can see that the group once
   *  relied on something and stopped, and why. A REASON IS REQUIRED by both: the catalogue's own remedy for a bad edge
   *  is "sever with reason" (C-6.1), and State Rules §5.1 has a human confirming or severing. One method for both
   *  directions, because they are the same operation over the same grammar. */
  #edgeTransition({ project, handle, viewer, owner, reason, author, from, to, verb, resultKey, identity = null }) {
    /* Weight `refuse`, hard-coded exactly as `cite` hard-codes `report`: a caller that could choose the weight would
       make the distinction advisory (R7). */
    const sel = this.retrieval.selectionResolve({ handle, viewer, owner, weight: "refuse" });
    if (!sel.ok) return sel;

    const obj = this.#citingObject(project, viewer);
    if (obj.refusal) return obj.refusal;
    const p = obj.head;
    if (p.type !== "project")
      return { ok: false, reason: "NOT_A_PROJECT", project, got: p.type,
               detail: "cites lives on the citing object and this action edits a Project's edges" };
    /* REC-134: moving a project's own citation edge is work inside that project (§7.5). */
    const denied = this.membership.projectAuthority(project, identity, "joined", resultKey === "severed" ? "sever" : "reinstate");
    if (denied) return denied;

    const why = String(reason ?? "").trim();
    if (!why)
      return { ok: false, reason: "NO_REASON",
               detail: `${verb} an edge records WHY. The catalog's own remediation for a bad reference is `
                     + `"sever with reason", and an edge moved with no reason is an unexplained change `
                     + `wearing a status field.` };
    if (why.length > EDGE_REASON_MAX || /["\\\r\n]/.test(why))
      return { ok: false, reason: "BAD_REASON",
               detail: `a reason is at most ${EDGE_REASON_MAX} characters and cannot contain a quote, `
                     + `a backslash, or a newline: the restricted frontmatter grammar has no escapes, so `
                     + `those would reshape the document rather than appear in it` };

    /* An EMPTY selection is refused, not a successful no-op: promoting an UNCHANGED document would put a revision
       recording that nothing happened into an append-only history. */
    if (!sel.members.length)
      return { ok: false, reason: "EMPTY_SELECTION", project, handle, drift: sel.drift,
               detail: "this selection resolves to no members, so there is nothing to move. It may have "
                     + "named ids that do not exist, or its members may have been purged or hidden since "
                     + "it was made." };

    /* THE MIRROR OF `cite`'s CITABILITY TEST (REC-72): a case may cite information or a question, so it may also
       withdraw from and restore either; through `normalizeType`, so a legacy `focus`/`problem` spelling is the
       question it names (the MAP RULE). The whole call is refused rather than narrowed. */
    const offenders = [];
    for (const id of sel.members) {
      const b = this.record.head(id);
      const ty = b ? normalizeType(b.type) : null;
      if (!(ty === "information" || ty === "inquiry")) offenders.push(id);
    }
    if (offenders.length)
      return { ok: false, reason: "NOT_INFORMATION", project, handle, offenders: offenders.sort(),
               citable: ["information", "inquiry"],
               detail: "a case's citation edges point at material or at a question, and these members of the "
                     + "selection are neither, so they carry no citation edge to move. The whole call is "
                     + "refused rather than narrowed." };

    /* REC-183 / C-33.39: moving an edge INTO `confirmed` is a citation made now, so it asks cite's question through
       R5's one predicate, with the same code and the same whole-call refusal; otherwise severing, retiring and
       reinstating would rest a case on a retired item. `severed` is not asked: withdrawing reliance on a retired item
       is the direction the rule wants. Not a DEC-49 region: the row's one `where` is cite's (is-cite-retired). */
    if (to === "confirmed") {
      const retiredMembers = sel.members.filter((id) => this.retiredNotCitable(id));
      if (retiredMembers.length)
        return { ok: false, reason: "RETIRED_NOT_CITABLE", ...rowOf(CITE_CHECKS, "RETIRED_NOT_CITABLE"),
                 project, handle, offenders: retiredMembers.sort(), drift: sel.drift,
                 detail: "the group has RETIRED these since the edge was severed, recording that they are "
                       + "superseded or no longer stand, and reinstating the edge would read to every later "
                       + "member as live support. Cite what superseded them, or re-collect the source as a new "
                       + "bundle and cite that. The whole call is refused rather than narrowed to the members "
                       + "that are not retired." };
    }

    const doc = this.#document(project, null);
    if (doc.refusal) return doc.refusal;

    const current = new Map();
    for (const r of Array.isArray(doc.data.references) ? doc.data.references : [])
      if (r && typeof r === "object" && r.rel === "cites" && typeof r.target === "string")
        current.set(r.target, r);

    /* THE WHOLE SET MOVES OR NONE OF IT DOES. A member in the wrong state means the member is looking at a stale view,
       so the batch is refused by name rather than partially applied: a half-run state change is what weight `refuse`
       exists to prevent. */
    const wrong = [];
    for (const id of sel.members) {
      const e = current.get(id);
      if (!e || !from.includes(e.status)) wrong.push(id);
    }
    if (wrong.length)
      return { ok: false, reason: from.includes("severed") ? "NOT_SEVERED" : "NOT_CITED",
               project, handle, offenders: wrong.sort(), drift: sel.drift,
               detail: `${verb} requires an edge currently in ${from.map((s) => `'${s}'`).join(" or ")}. `
                     + `These targets are not, so the whole call is refused: a batch that moved only the `
                     + `eligible members would be a state change the operator did not ask for.` };

    const when = stampInstant("second", this.now());
    /* The reason is APPENDED to the note, never substituted: the reason an edge was cited is as much a part of the
       record as the reason it stopped being relied on. Bounded, the oldest text dropped first, because the superseded
       revision is in history and the newest reasoning is what a reader needs first. */
    const changes = new Map();
    for (const id of sel.members) {
      const prev = String(current.get(id).note ?? "");
      let note = (prev ? prev + " | " : "") + `${verb} ${when}: ${why}`;
      if (note.length > EDGE_NOTE_MAX) note = note.slice(note.length - EDGE_NOTE_MAX);
      changes.set(id, { status: to, note });
    }

    const spliced = spliceEdgeStatus(doc.text, changes);
    if (!spliced)
      return { ok: false, reason: "UNSPLICEABLE_REFERENCES", project,
               detail: "the references block is not in a shape this grammar can edit in place" };

    let text = setScalar(spliced, "last_updated", `"${when}"`);
    const ids = [...sel.members].sort();
    const shown = ids.slice(0, CITE_LOG_SAMPLE);
    const listed = shown.join(", ") + (ids.length > shown.length ? `, and ${ids.length - shown.length} more` : "");
    text = appendSessionLog(text,
      `### Session ${when} | ${verb} ${ids.length} citation${ids.length === 1 ? "" : "s"}`
      + ` | ${author || "member"}\n`
      + `Trigger: selection ${handle}\n`
      + `Changes: cites edges to ${listed} moved to '${to}'. Reason: ${why}.\n`);

    const bytes = new TextEncoder().encode(text);
    if (bytes.length > INLINE_MAX)
      return { ok: false, reason: "CITATION_TOO_LARGE", project, bytes: bytes.length, limit: INLINE_MAX,
               detail: "the reasons appended to these edges would push bundle.md past the 1MB inline limit" };
    const promoted = this.#write(project, p, text, when, author, doc.data, "project");
    if (!promoted.ok) return { ...promoted, project, handle, drift: sel.drift };

    return { ok: true, project, handle, weight: "refuse", moved: sel.moved, drift: sel.drift,
             /* `why` and NOT `reason`: every refusal returns a REASON CODE under that name, and returning the member's
                prose under the same key would make a success indistinguishable from a refusal to a caller checking
                `reason`. */
             [resultKey]: ids, why, from, to,
             bundleSha: promoted.bundleSha, rowVersion: promoted.rowVersion, gate: sel.gate };
  }

  sever({ project, handle, viewer = null, owner = null, reason = "", author = null, identity = null } = {}) {
    return this.#edgeTransition({ project, handle, viewer, owner, reason, author, identity,
      from: ["confirmed", "proposed"], to: "severed", verb: "Severed", resultKey: "severed" });
  }

  reinstate({ project, handle, viewer = null, owner = null, reason = "", author = null, identity = null } = {}) {
    return this.#edgeTransition({ project, handle, viewer, owner, reason, author, identity,
      from: ["severed"], to: "confirmed", verb: "Reinstated", resultKey: "reinstated" });
  }

  /* ---- cite (R1–R3) ---- */

  /** R1–R3: CITING, at weight `report` (R7): material, or a question, becomes part of what a case or a question rests
   *  on. ONE ACT (REC-37): where the record keeps it differs (a case's `references[]`, a question's `basis[]`) and
   *  what the member did does not, so one op serves both arms and `project` names the citing object either way.
   *
   *  WHAT THE INQUIRY ARM DOES NOT DO, and each absence is a decision:
   *   - IT DOES NOT GRADE (R8). A leg's connection grade is FILLED from `inquiry.earned`, the same registry the read
   *     answers from and the write enforces with; a target the record earns nothing for lands with NO grade, axis or
   *     source: undetermined, stated by the absence, inert (DEC-18). There is no grade control and no default letter.
   *   - IT DOES NOT CHECK FOR A CYCLE. `SELF_BASIS` and `BASIS_CYCLE` are the write's (inquiry R11), reached because
   *     the leg lands THROUGH THE DOCUMENT; a second rule here would be a second answer waiting to disagree.
   *   - IT DOES NOT VALIDATE A LEG beyond routing its part through `inquiry.checkLegExtentGrammar`, the same function
   *     that judges it again at the write.
   *   - IT ASKS ONE THING ABOUT A TARGET'S STATE, ON BOTH ARMS: whether the group RETIRED it (R5). */
  cite({ project = null, handle = null, viewer = null, owner = null,
         note = "", author = null, role = null, extent = null, identity = null } = {}) {
    /* The gate first, so an unknown or someone else's selection is refused before a project is looked at. */
    const sel = this.retrieval.selectionResolve({ handle, viewer, owner, weight: "report" });
    if (!sel.ok) return sel;

    const obj = this.#citingObject(project, viewer);
    if (obj.refusal) return obj.refusal;
    const p = obj.head;
    /* Through normalizeType, so a legacy focus/problem spelling lands on the inquiry arm — the MAP RULE. */
    const ontoInquiry = normalizeType(p.type) === "inquiry";
    if (p.type !== "project" && !ontoInquiry)
      return { ok: false, reason: "NOT_A_PROJECT", project, got: p.type,
               detail: "citations live on the CITING object, and this is neither a case nor a question. A case "
                     + "keeps them in its references; a question keeps them in the basis its answer rests on "
                     + "(State Rules 5.2). Nothing else in the record holds either." };
    /* REC-134: citing INTO A PROJECT edits that project's document, work inside it, so the actor must have JOINED it
       (§7.5). The question arm is untouched: an inquiry is shared material, not a project's (INVESTIGATIVE-SESSION §7). */
    if (!ontoInquiry) {
      const denied = this.membership.projectAuthority(project, identity, "joined", "cite");
      if (denied) return denied;
    }

    /* A note is written into the restricted frontmatter grammar, which understands no escapes: a quote or a newline
       would silently reshape the document. Refused rather than sanitised: mangling a member's words is worse than
       declining them. */
    /* DEC-49 REGION is-cite-note — REC-64/C-33.15. */
    const nt = String(note ?? "");
    if (nt.length > NOTE_MAX || /["\\\r\n]/.test(nt))
      return { ok: false, reason: "BAD_NOTE", ...rowOf(CITE_CHECKS, "BAD_NOTE"),
               detail: "a note is at most 200 characters and cannot contain a quote, a backslash, or a newline" };
    /* END DEC-49 REGION is-cite-note */

    /* THE ROLE (REC-37), judged before the members so a member who has not said what the material DOES is told that
       first. REQUIRED on the inquiry arm and refused BY NAME (R8): `cuts_against` is first-class (Invariant 7) and is
       exactly the leg a default would silently turn into `supports`. The vocabulary travels WITH the refusal. REFUSED,
       not ignored, on the case arm: a `cites` edge has no role, and a field authored in one place and honoured nowhere
       is the D-21 class in miniature. */
    /* The instance's own wiring, not a member's mistake: the question arm cannot run without inquiry's services. */
    if (ontoInquiry && (!this.inquiry || typeof this.inquiry.earned !== "function"
                        || typeof this.inquiry.checkLegExtentGrammar !== "function" || !Array.isArray(this.inquiry.BASIS_ROLES)))
      return { ok: false, reason: "INQUIRY_UNAVAILABLE", project, handle, drift: sel.drift,
               detail: "citing onto a question needs the inquiry module's role vocabulary, leg grammar and earned "
                     + "registry, and this instance was created without them, so nothing was written." };
    /* DEC-49 REGION is-cite-role — REC-64/C-33.16-18. */
    const rl = role === null || role === undefined || String(role) === "" ? null : String(role);
    if (ontoInquiry) {
      const roles = this.inquiry.BASIS_ROLES;
      if (rl === null)
        return { ok: false, reason: "NO_ROLE", ...rowOf(CITE_CHECKS, "NO_ROLE"), project, handle, roles: roles.slice(),
                 drift: sel.drift,
                 detail: "a leg of a question's basis says what the material DOES for the answer, and this call "
                       + "does not say. It is never assumed: a leg that cuts against the case is first-class "
                       + "here, and guessing would put a claim about your own reasoning in the record that you "
                       + `did not make. State role as one of: ${roles.join(", ")}.` };
      if (!roles.includes(rl))
        return { ok: false, reason: "BAD_ROLE", ...rowOf(CITE_CHECKS, "BAD_ROLE"), project, handle, got: rl,
                 roles: roles.slice(), drift: sel.drift,
                 detail: `'${rl}' is not a role a basis leg can carry. The set is closed and is published by `
                       + `op=affordances beside the act: ${roles.join(", ")}.` };
    } else if (rl !== null) {
      return { ok: false, reason: "ROLE_NOT_APPLICABLE", ...rowOf(CITE_CHECKS, "ROLE_NOT_APPLICABLE"), project, handle,
               got: rl, drift: sel.drift,
               detail: "a role says what material does for a QUESTION's answer, and this citing object is a "
                     + "case. A case's citation edge carries no role, so this one would be dropped rather than "
                     + "recorded — refused instead, because a field stated in one place and honoured nowhere is "
                     + "how the record and its projections drift apart." };
    }
    /* END DEC-49 REGION is-cite-role */

    /* Every member must be CITABLE: information, or a QUESTION, on both arms (REC-72: a case may draw on a question;
       REC-37: a question rests on material or another question, DEC-23). A question citing ITSELF is not caught here:
       that cycle MEANS something and the write names the path it closes (SELF_BASIS). Either way the whole call is
       refused with the offenders named, never filtered down: narrowing a set changes what the member's click meant. */
    const offenders = [];
    for (const id of sel.members) {
      const b = this.record.head(id);
      const ty = b ? normalizeType(b.type) : null;
      if (!(ty === "information" || ty === "inquiry")) offenders.push(id);
    }
    if (offenders.length)
      return ontoInquiry
        /* Its own reason, because on this arm an inquiry IS citable. */
        ? { ok: false, reason: "NOT_CITABLE", project, handle,
            offenders: offenders.sort(), drift: sel.drift, citable: ["information", "inquiry"],
            detail: "a question rests on material or on another question, and nothing else in the record can be "
                  + "a leg of its basis. These members of the selection are neither, and the whole call is "
                  + "refused rather than narrowed to the ones that are." }
        /* The wire string does not move (renaming a reason code is a break, REC-37); `detail` says what is refused
           and `citable` carries the vocabulary. Renaming it is recorded as Bob's decision, not taken here. */
        : { ok: false, reason: "NOT_INFORMATION", project, handle,
            offenders: offenders.sort(), drift: sel.drift, citable: ["information", "inquiry"],
            detail: "a case rests on material, or on a question the group is asking. These members of the "
                  + "selection are neither, and the whole call is refused rather than narrowed to the ones "
                  + "that are." };

    /* DEC-49 REGION is-cite-retired — D-168 / C-33.39. A RETIRED ITEM IS NOT CITABLE (State Rules §4.1): a citation
       made after the retirement is the harm `retire`'s CITED refusal guards, entered by the other door. Asked through
       R5's one predicate. Neither `source_status` (the other axis) nor the edges already written are asked. */
    const retiredMembers = sel.members.filter((id) => this.retiredNotCitable(id));
    if (retiredMembers.length)
      return { ok: false, reason: "RETIRED_NOT_CITABLE", ...rowOf(CITE_CHECKS, "RETIRED_NOT_CITABLE"),
               project, handle, offenders: retiredMembers.sort(), drift: sel.drift,
               detail: "the group has RETIRED these, recording that they are superseded or no longer stand, and "
                     + "a citation made now would read to every later member as live support. Cite what "
                     + "superseded them, or re-collect the source as a new bundle and cite that. The whole call "
                     + "is refused rather than narrowed to the members that are not retired." };
    /* END DEC-49 REGION is-cite-retired */

    const doc = this.#document(project, "the project's own bundle.md does not parse under the restricted grammar");
    if (doc.refusal) return doc.refusal;

    /* Partition the selection against what the document already carries. SEVERED IS NOT ABSENT: a severed edge is a
       recorded human judgment, and reinstating one is a state change that cannot ride inside a report-weight act
       (Bob, 2026-07-25). On the inquiry arm ALREADY means "already carries a LEG" (a question can reference a document
       without resting on it; basis ⊆ references, never the reverse). A second leg on the same target is legal by
       design (D4) but is an authored statement, not a repeat of this act, so citing stays safely retryable. */
    const existing = Array.isArray(doc.data.references) ? doc.data.references : [];
    const byTarget = new Map();
    for (const r of existing)
      if (r && typeof r === "object" && r.rel === "cites" && typeof r.target === "string")
        byTarget.set(r.target, r.status);
    /* EVERY references target whatever its rel, so the inquiry arm never writes a SECOND entry for a target already
       referenced under another relation (C-6.3 asks that a leg's target be in references[], not for a duplicate). */
    const referenced = new Set(existing
      .filter((r) => r && typeof r === "object" && typeof r.target === "string").map((r) => r.target));
    const legged = new Set(ontoInquiry && Array.isArray(doc.data.basis)
      ? doc.data.basis.filter((l) => l && typeof l === "object" && typeof l.target === "string").map((l) => l.target)
      : []);

    const severed = [], already = [], add = [];
    for (const id of sel.members) {
      const st = byTarget.get(id);
      if (st === "severed") severed.push(id);
      else if (ontoInquiry ? legged.has(id) : st !== undefined) already.push(id);
      else add.push(id);
    }
    /* DEC-49 REGION is-cite-severed — REC-64/C-33.19. */
    if (severed.length)
      return { ok: false, reason: "SEVERED_EDGE", ...rowOf(CITE_CHECKS, "SEVERED_EDGE"), project, handle,
               offenders: severed.sort(), drift: sel.drift,
               detail: "these targets already carry a SEVERED cites edge, which is a recorded decision to cut "
                     + "the dependency, not the absence of one. Citing neither reverses it silently nor skips "
                     + "past it. Reinstating a severance is a separate action that records its own reason." };
    /* END DEC-49 REGION is-cite-severed */

    /* REC-97 / IC-90 — WHAT PART OF THE DOCUMENT THE LEG RESTS ON. Nothing here is dropped: every arm refuses BY NAME
       (a part once sent beside the act was dropped in silence, the record then claiming something other than what the
       member did). This owns no grammar: what it judges is what only the ACT can know (which fields it carries, which
       arm it is on, how many legs one part would be written onto, whether a value can be written at all). ABSENT IS
       `document` AND IS NEVER REFUSED (Bob's 5.3): with no part field none of this is reached and the act is
       byte-identical to one that never heard of parts. AN EMPTY VALUE IS NOT AN AUTHORED ONE; the FIELD NAME is judged
       whatever its value. */
    /* DEC-49 REGION is-cite-extent — REC-97/C-45.7-10. */
    const bag = extent && typeof extent === "object" ? extent : {};
    const unknownFields = Object.keys(bag).filter((k) => !(k in EXTENT_PARAMS)).sort();
    if (unknownFields.length)
      return { ok: false, reason: "UNKNOWN_EXTENT_FIELD", ...rowOf(CITE_EXTENT_CHECKS, "UNKNOWN_EXTENT_FIELD"),
               project, handle, drift: sel.drift, got: unknownFields, fields: Object.keys(EXTENT_PARAMS),
               detail: `this call names ${unknownFields.map((k) => `'${k}'`).join(", ")}, which this act `
                     + `does not carry, so the record cannot tell what part of the document was meant. It is `
                     + `REFUSED rather than ignored: a field accepted and quietly dropped leaves a citation `
                     + `that looks like the one you made and is not. The fields this act takes are: `
                     + `${Object.keys(EXTENT_PARAMS).join(", ")}.` };
    const authored = Object.keys(bag).filter((k) => String(bag[k] ?? "").trim() !== "").sort();
    if (authored.length && !ontoInquiry)
      return { ok: false, reason: "EXTENT_NOT_APPLICABLE", ...rowOf(CITE_EXTENT_CHECKS, "EXTENT_NOT_APPLICABLE"),
               project, handle, got: authored, drift: sel.drift,
               detail: "which part of a document a citation rests on is recorded on a leg of a QUESTION's "
                     + "basis, and this citing object is a case. A case's citation edge names the document "
                     + "and has no slot for a page or a passage, so this extent would be dropped rather "
                     + "than recorded — refused instead, for the reason a role is refused here: a field "
                     + "stated in one place and honoured nowhere is how the record and its projections "
                     + "drift apart." };
    if (authored.length && add.length > 1)
      return { ok: false, reason: "EXTENT_ON_MANY", ...rowOf(CITE_EXTENT_CHECKS, "EXTENT_ON_MANY"),
               project, handle, offenders: add.slice().sort(), drift: sel.drift,
               detail: `a part of a document is a part of ONE document, and this call would write `
                     + `${add.length} legs. Writing the same page or passage onto each of them would put `
                     + `claims in the record that nobody made — the extent was named once. Cite the one `
                     + `document this part belongs to, and cite the rest separately.` };
    /* THE SPELLING FENCE, BAD_NOTE's rule one field down: these values are written as frontmatter scalars. */
    const legFields = {};
    for (const k of authored) {
      const raw = String(bag[k]).trim();
      if (raw.length > EXTENT_VALUE_MAX || /["\\\r\n#]/.test(raw))
        return { ok: false, reason: "BAD_EXTENT_VALUE", ...rowOf(CITE_EXTENT_CHECKS, "BAD_EXTENT_VALUE"),
                 project, handle, field: k, drift: sel.drift,
                 detail: `'${k}' cannot be written into the record as it stands: a value describing which `
                       + `part of a document is at most 200 characters and cannot contain a quotation mark, `
                       + `a backslash, a line break or a comment mark. Those characters would reshape the `
                       + `document rather than appear in it.` };
      const t = EXTENT_PARAMS[k];
      if (t === "int" && /^\d+$/.test(raw)) legFields[k] = parseInt(raw, 10);
      else if (t === "nums") {
        const parts = raw.replace(/^\[|\]$/g, "").split(",").map((s) => s.trim());
        const nums = parts.map((s) => (/^-?\d+(\.\d+)?$/.test(s) ? parseFloat(s) : NaN));
        legFields[k] = nums.every((n) => Number.isFinite(n)) ? nums : raw;
      } else legFields[k] = raw;
    }
    /* END DEC-49 REGION is-cite-extent */

    /* AND NOW THE LEG GRAMMAR JUDGES IT, under the write's own name: the composed part goes through
       `inquiry.checkLegExtentGrammar`, the same function that judges it again at the write, so an unlanded kind, an
       unparseable page, a malformed content id and a leg naming both an id and an extent are refused HERE, before a
       byte moves, in the catalogue's own words. The record-only arms (the page set, the chain) are the write's.
       Outside the region above, because `BASIS_REFUSED` is not a row of this module's. */
    if (authored.length) {
      const ef = [];
      this.inquiry.checkLegExtentGrammar(legFields, "the part of the document this citation names", "C-2.8", ef);
      const exErrs = ef.filter((x) => x.severity === "error");
      if (exErrs.length)
        return { ok: false, reason: "BASIS_REFUSED", project, handle, drift: sel.drift,
                 findings: exErrs.map((x) => ({ check: x.check, code: x.code ?? null,
                                                detail: x.message, repairs: x.repairs ?? [] })),
                 detail: "the part of the document this citation names is refused by the SAME catalog "
                       + "function op=promote runs at the write, so nothing was written. A citation that "
                       + "names no part means the whole document, which is always a legal thing to cite." };
    }

    const when = stampInstant("second", this.now());

    if (!sel.members.length)
      return { ok: false, reason: "EMPTY_SELECTION", project, handle, drift: sel.drift,
               detail: "this selection resolves to no members, so there is nothing to cite. It may have "
                     + "named ids that do not exist, or its members may have been purged or hidden since "
                     + "it was made." };
    /* Nothing to do is a SUCCESS that writes nothing: citing must be safely retryable, since drift is reported rather
       than fatal and a member who reads a drift report will reasonably press again. AND WHEN A PART WAS NAMED, SAY
       THAT IT WENT NOWHERE (narrowing an existing citation is its own act, Bob's 5.3). */
    if (!add.length)
      return { ok: true, project, handle, weight: "report", moved: sel.moved, drift: sel.drift,
               cited: [], alreadyCited: already.sort(), severed: [],
               bundleSha: p.bundleSha, rowVersion: null,
               detail: "every member of the selection was already cited; nothing was written"
                     + (authored.length
                        ? ". The part of the document this call named was written NOWHERE, because no leg "
                        + "was written at all: making an existing citation more specific is a separate "
                        + "authored act on this record's own plan."
                        : "") };

    /* THE WRITE, PER ARM; both go through the document (R6). */
    let spliced = null, filled = [];
    /* REC-219 / D-579(a): a CASE's edge carries the capture the record presents at this act (`content.captureFor`),
       as `extent_capture` in the edge's own bytes, so which bytes a case cited is a fact the record holds rather than
       a question asked again at every later read. Not stamped on a question target (no bytes, DEC-21) or where the
       record holds no capture of the document. */
    const edgePins = new Map();
    if (!ontoInquiry)
      for (const target of add)
        if (normalizeType(OBJECT_TYPES[String(target).split("-")[0]]) === "information") {
          const pin = this.content.captureFor(target);
          if (pin) edgePins.set(target, pin);
        }
    if (!ontoInquiry) {
      spliced = spliceReferences(
        doc.text, add.map((target) => ({ rel: "cites", target, status: "confirmed", note: nt,
                                         ...(edgePins.has(target) ? { extent_capture: edgePins.get(target) } : {}) })));
      if (!spliced)
        return { ok: false, reason: "UNSPLICEABLE_REFERENCES", project,
                 detail: "the project's references block is not in a shape this grammar can extend in place. "
                       + "Citing edits only that block and never rewrites the rest of the document." };
    } else {
      /* THE SUBJECT COMES FROM THE BYTES, the authority, not from a projection of them. */
      const subject = typeof doc.data.subject_entity === "string" && doc.data.subject_entity.trim() !== ""
        ? doc.data.subject_entity.trim() : null;
      const reg = this.inquiry.earned(subject, add);
      /* REC-220: the capture a document leg rests on, PINNED at the act as `extent_capture` (Bob, 2026-09-25, rule 1:
         a reference is pinned to the version it was made against). Not where the leg names a `content_id` (the id is a
         hash over its capture, already pinned), on a question target, or where the record holds no capture. */
      const pinOf = (target) => {
        if (typeof legFields.content_id === "string" && legFields.content_id.trim()) return null;
        if (normalizeType(OBJECT_TYPES[target.split("-")[0]]) !== "information") return null;
        return this.content.captureFor(target);
      };
      filled = add.map((target) => {
        const earned = reg && reg.earned && reg.earned.connection ? reg.earned.connection[target] : null;
        const pin = pinOf(target);
        const pinned = pin ? { extent_capture: pin } : {};
        /* ONLY THE CONNECTION AXIS IS FILLED: the capture axis's earned value is a ceiling, not a measurement. */
        return earned && earned.grade
          ? { target, role: rl, grade: earned.grade, grade_axis: "connection", grade_source: "resolution",
              note: nt, why: earned.why, ...legFields, ...pinned }
          : { target, role: rl, note: nt, why: null, ...legFields, ...pinned };
      });
      /* references FIRST and only where the document does not already carry the target: C-6.3 refuses a leg whose
         target is not in references[], and the two projections of one document must not disagree. */
      const newRefs = add.filter((t) => !referenced.has(t))
        .map((target) => ({ rel: "cites", target, status: "confirmed", note: nt }));
      const withRefs = newRefs.length ? spliceReferences(doc.text, newRefs) : doc.text;
      if (!withRefs)
        return { ok: false, reason: "UNSPLICEABLE_REFERENCES", project,
                 detail: "the question's references block is not in a shape this grammar can extend in place. "
                       + "Citing edits only that block and the basis block, and never rewrites the rest of "
                       + "the document." };
      spliced = spliceBasis(withRefs, filled);
      if (!spliced)
        /* ITS OWN REASON: a member told "references" about a basis failure would look in the wrong block. */
        return { ok: false, reason: "UNSPLICEABLE_BASIS", project,
                 detail: "the question's basis block is not in a shape this grammar can extend in place. "
                       + "Citing appends legs to that block and never rewrites the rest of the document." };
    }

    /* last_updated moves, so a Session Log entry accounts for the act (C-13.2), BOUNDED (R3): the edges are the
       record; the entry accounts for the act. On the inquiry arm it STATES how many legs were left undetermined: an
       ungraded leg is inert and invisible in the derived pair, so this is the one place a member learns it. The drift
       clause reads `answerChanged` (REC-55), so a query selection whose answer swapped at a constant count says so. */
    let text = setScalar(spliced, "last_updated", `"${when}"`);
    const shown = add.slice(0, CITE_LOG_SAMPLE);
    const listed = shown.join(", ") + (add.length > shown.length ? `, and ${add.length - shown.length} more` : "");
    const ungraded = filled.filter((l) => !l.grade).length;
    const graded = filled.length - ungraded;
    const setMovedNote = answerChanged(sel.drift, sel.moved)
      ? " (the set had moved since it was made; citing is report-weight and proceeded)" : "";
    text = appendSessionLog(text, ontoInquiry
      ? `### Session ${when} | Rested this question on ${add.length} record${add.length === 1 ? "" : "s"}`
        + ` (${rl}) | ${author || "member"}\n`
        + `Trigger: selection ${handle}${setMovedNote}\n`
        + `Changes: basis legs added for ${listed}, each with role ${rl}. `
        + `Grades: ${graded} filled from the record's own resolutions to this question's subject; `
        + `${ungraded} left undetermined and stated.`
        + `${nt ? ` Note: ${nt}.` : ""}\n`
      : `### Session ${when} | Cited ${add.length} Information record${add.length === 1 ? "" : "s"}`
        + ` | ${author || "member"}\n`
        + `Trigger: selection ${handle}${setMovedNote}\n`
        + `Changes: cites edges added to ${listed}.`
        + `${nt ? ` Note: ${nt}.` : ""}\n`);

    /* Past the inline bound, refused here in words that name the real limit (a maximum legal selection once reached
       the write as OVERSIZE_INLINE), the whole call rather than a prefix, which would silently change which records
       the click meant. `roomFor` is an estimate that errs toward "fewer would fit"; it never decides the refusal. */
    const bytes = new TextEncoder().encode(text);
    if (bytes.length > INLINE_MAX) {
      const perEdge = CITE_EDGE_BYTES + (edgePins.size ? CITE_PIN_BYTES : 0);
      const overhead = bytes.length - add.length * perEdge;
      return { ok: false, reason: "CITATION_TOO_LARGE",
               project, handle, drift: sel.drift,
               requested: add.length, bytes: bytes.length, limit: INLINE_MAX,
               roomFor: Math.max(0, Math.floor((INLINE_MAX - overhead) / perEdge)),
               detail: `citing this many records at once would push this ${ontoInquiry ? "question" : "case"}'s `
                     + "bundle.md past the 1MB inline limit. Every edge is written into the document, so the "
                     + "ceiling is on edges in ONE object, not on the size of a selection. Cite in smaller "
                     + "batches; nothing has been written." };
    }

    const fm = doc.data;
    /* The type from the DOCUMENT (op=conclude's precedent): byte-identical for a case, correct for a question. */
    const promoted = this.#write(project, p, text, when, author, fm, fm.object_type ?? p.type);
    /* THE WRITE'S REFUSALS COME BACK UNCHANGED (inquiry R11: BASIS_REFUSED, SELF_BASIS, BASIS_CYCLE): this act
       composes legs; the write judges them. */
    if (!promoted.ok) return { ...promoted, project, handle, drift: sel.drift };

    return { ok: true, project, handle, weight: "report", moved: sel.moved, drift: sel.drift,
             cited: add.slice().sort(), alreadyCited: already.sort(), severed: [],
             ...(ontoInquiry ? {} : { pinned_captures: Object.fromEntries(
               add.slice().sort().map((t) => [t, edgePins.get(t) ?? null])) }),
             bundleSha: promoted.bundleSha, rowVersion: promoted.rowVersion,
             gate: sel.gate, expires: sel.expires,
             /* R3: what the act landed on the question, per leg, from the leg it composed (never an echo of the
                request): the role, the grade the RECORD earned with the registry's `why` or an explicit null, the
                capture it pinned, and the part as written, ABSENT for every leg that names none. */
             ...(ontoInquiry ? { citingObjectType: "inquiry", role: rl,
                                 legs: filled.map((l) => ({ target: l.target, role: l.role,
                                   grade: l.grade ?? null, grade_axis: l.grade_axis ?? null,
                                   grade_source: l.grade_source ?? null, why: l.why ?? null,
                                   pinned_capture: l.extent_capture ?? null,
                                   ...(Object.keys(legFields).length
                                       ? { extent: citationExtent(l),
                                           ...(l.content_id ? { content_id: l.content_id } : {}) }
                                       : {}) })),
                                 gradesFilled: filled.filter((l) => l.grade).length,
                                 gradesUndetermined: filled.filter((l) => !l.grade).length }
                             : {}) };
  }
}

/* ------------------------------------------------------------------ reaching it */

const instances = new WeakMap();

export function citationOf(host, deps) {
  let c = instances.get(host);
  if (!c) {
    const d = deps || {};
    const record = d.record || recordOf(host);
    const membership = d.membership || membershipOf(host, { record });
    const promotion = d.promotion || promotionOf(host, { record, membership });
    const content = d.content || contentOf(host, { record, membership });
    const retrieval = d.retrieval || retrievalOf(host, { record, membership, promotion });
    c = new Citation({ ...d, record, membership, promotion, content, retrieval });
    instances.set(host, c);
  }
  return c;
}

/* The Durable Object routes this module answers, as entries of the legacy store's op map (its dispatcher spreads them
   in; K3). `url` carries the control plane's stamps (`viewer`, `owner`, `author`, `identity`); weight is never read
   from the caller (R7). */
export function citationOps(c, url) {
  const q = (key) => url.searchParams.get(key);
  return {
    cite: () => c.cite({
      project: q("project"), handle: q("handle"), viewer: q("viewer"), owner: q("owner"),
      note: q("note") ?? "", author: q("author"), identity: q("identity"),
      /* REC-37: the leg's ROLE, read only on the inquiry arm and REFUSED rather than dropped on the other. */
      role: q("role"),
      /* REC-97 / IC-90: every parameter the leg-part grammar could own arrives WHOLE and the act decides, by name,
         which ones it carries; a named `get()` per field is what once dropped a part in silence. None sent is an empty
         bag, which is `document`. */
      extent: Object.fromEntries([...url.searchParams].filter(([k]) => k === "content_id" || k.startsWith("extent_"))),
    }),
    sever: () => c.sever({ project: q("project"), handle: q("handle"), viewer: q("viewer"), owner: q("owner"),
                           reason: q("reason") ?? "", author: q("author"), identity: q("identity") }),
    reinstate: () => c.reinstate({ project: q("project"), handle: q("handle"), viewer: q("viewer"), owner: q("owner"),
                                   reason: q("reason") ?? "", author: q("author"), identity: q("identity") }),
  };
}
