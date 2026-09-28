/* review — the review copy (requirements: `build/requirements/review.md`; BIO_Publication_v0_1.md §6A, DEC-31, DEC-72):
 * a draft of a case a project's editors prepare, shown inside the instance to members with standing and to named
 * recipients through a revocable, read-and-comment grant, marked as not a publication, as complete as a publication
 * would be, and naming what a publication would still refuse. It never publishes, signs, or leaves the instance (R20):
 * publishing stays ONE irreversible act, and a review copy stands BESIDE it.
 *
 * Extracted from the legacy modules (T8, layer 8; K3, K102): `store.mjs` (REC-126's review copy: `reviewAct` with
 * `#caseDraft`, `#reviewGrant` and `#reviewRevoke`, the draft identity and edition helpers, `#reviewGates`,
 * `#draftPublisher`, the grant and sight predicates, `#reviewLastChange`, `reviewCopy`, `reviewComment`; REC-198's
 * `caseDraftList`; the six dispatch entries), `bio-checks.mjs` (C-87 and C-32.16, now `./checks.mjs`) and `schema.mjs`
 * (`case_drafts`, `review_grants`, `review_comments`, now `./schema.mjs`). The legacy code's comments moved with it,
 * shortened where they only restated the code.
 *
 * THE THREE OBJECTS (§6A):
 *   - THE DRAFT CASE (§6A.4, gap 3) is the production. It holds the arguments `op=publish` would take and is identified
 *     BEFORE any gate runs, because `publishCase` refuses an incomplete case and a review copy must not be refused for
 *     exactly the gaps it is sent to show. It is MUTABLE (Bob, 2026-09-17: "An editor must be able to edit").
 *   - THE GRANT (§6A.2) is a scoped, revocable, read-and-comment capability over ONE draft, bound to ONE case edition,
 *     attributed to its issuer and its recipient. Its read secret is generated at the control plane and this module is
 *     handed only the SHA-256 (R21): nothing here can print a secret because nothing here has ever held one.
 *   - THE COMMENT is attributed, and a recipient's is a RECIPIENT's.
 *
 * WHO MAY AUTHOR A DRAFT, ISSUE A GRANT AND REVOKE ONE (R2; §6A.2 as BOB #15 decided it, 2026-09-18, built by REC-133):
 *   - AUTHOR: the project's EDIT permission (membership's `isProjectEditor`). The draft is the production, and editing
 *     it is editing. Its capability half, `contribute`, is checked at the control plane, where capabilities live.
 *   - ISSUE: the project OWNER only, NO administrator arm. Sending unratified material outside the group is the same
 *     kind of act as publishing, and DEC-72 makes publishing the owner's.
 *   - REVOKE: the project OWNER only. Administrators "audit everything and direct nothing" (Membership v2 §4); a grant
 *     outliving its owners is handled by §7.13: an administrator adds an owner, and that owner revokes.
 * No two-person rule: none is ruled, and inventing one would be a fence tighter than its rule. A machine is refused by
 * name (R1): an addressed act is attributed to a person.
 *
 * REACHED as `reviewOf(host, deps)` (K61): one instance per host (the Durable Object's `ctx`), created on the first call
 * with `deps`, returned to every later caller. At creation it creates its tables, declares them to record-core's purge
 * (R24, K23), and fills publication's review provider (publication R23), because `publication` and `case-authoring`
 * come earlier in the order and call the draft door, the grant door, the live grant and the dead answer back.
 * `deps` (each reached through its factory on the same host unless given; a test passes its own):
 *   record, membership   layer 2: `transact`, `mintOpaqueId`, `seedMintLedger`, `declarePurge`; `isProjectEditor`,
 *                        `isProjectOwner`, `projectOwners`, `existenceAct`, `viewerPredicate`.
 *   strength             `projectBar` (its R14; R11's `required_strength`).
 *   basisVersions        `testimonyReach` (its R39; R16).
 *   publication          `attributionInForce` (its R39; R16) and `registerReviewProvider` (its R23).
 *   caseAuthoring        `publishCase` (its R18; R13) and `statementAcknowledgements`, whose list carries its
 *                        `withheld_stated` sentence (its R20; R15).
 *   now                  the clock for the instants it writes, an ISO string (default: the wall clock, to the ms).
 *
 * READ CONTRACTS it joins in its own SQL: record-core's `bundles` (`bundle_id`, `object_type`, `current_state`) and
 * `files` (`bundle_id`, `path`, `content`), its R37 (R12's findings, R19's project); publication's `cases`
 * (`case_id`, `project_id`) and `published_cases` (`case_id`, `edition`), its R40 (R3, R5).
 *
 * READ CONTRACT it states (R26): `case_drafts` (`draft_id`, `case_id`, `project_id`, `params`, `statement_by`,
 * `created_at`), on record-core R37's terms, which `case-authoring`'s acknowledgements read under `REVIEW_LIST_MAX`;
 * every write to it stays here. */

import { recordOf, stampInstant, instantOrder } from "../record-core/index.mjs";
import { membershipOf, viewerPredicate } from "../membership/index.mjs";
import { strengthOf } from "../strength/index.mjs";
import { basisVersionsOf } from "../basis-versions/index.mjs";
import { isMachineIdentity } from "../../checks/bio-checks.mjs";
import { REVIEW_COPY_CHECKS } from "./checks.mjs";
import { REVIEW_TABLES, migrateReview } from "./schema.mjs";

export { REVIEW_COPY_CHECKS } from "./checks.mjs";
export { REVIEW_SCHEMA, REVIEW_TABLES } from "./schema.mjs";

/** R4: the fields of `op=publish` a draft keeps; every other field of the act is dropped. */
export const REVIEW_DRAFT_FIELDS = Object.freeze(["targets", "target", "caseId", "newCase", "scope", "statement",
  "excluded", "subjectPosition", "subjectJustification", "biasAcknowledgement", "roles"]);
/** R3: a draft's arguments as JSON, at most the size `op=publish` would accept. */
export const REVIEW_DRAFT_MAX = 64 * 1024;
/** R18: a comment's trimmed text. */
export const REVIEW_TEXT_MAX = 4000;
/** R6: a recipient's label. */
export const REVIEW_RECIPIENT_MAX = 200;
/** R14, R19, R26: THE COPY'S LISTS ARE BOUNDED AND SAY SO. Comments, grants and drafts are read under this cap (one row
 *  over it to know), and an answer that hit it says so rather than presenting a page as the whole. `case-authoring`,
 *  earlier in the order, reads `case_drafts` under the same bound and keeps its own copy of it (K242). */
export const REVIEW_LIST_MAX = 500;
/** R11: the marking every copy carries. */
export const REVIEW_MARKING = "REVIEW COPY — NOT A PUBLICATION. This is a draft of a case, shown inside this "
  + "instance to the people it was addressed to. It is not signed, it is not published, it may still "
  + "change, and it may never be published at all. What a publication would require that this draft does "
  + "not yet have is listed under `missing`, in the publish gates' own words.";

const SECRET_SHA = /^[0-9a-f]{64}$/;

/* D-448: ONE CONSTRUCTOR FOR EVERY REFUSAL (REC-79's single-helper shape, as BIO_Assistant_and_AI_Roles_v0_1.md rule 10
   restates DEC-49), reading the canned translation off the row rather than repeating a sentence here. ADDITIVE ON THE
   WIRE: `reason`, each site's own `detail` and its per-site keys, then `code`, `check` and `translation`. */
function refusal(code, detail, extra) {
  const row = REVIEW_COPY_CHECKS[code];
  return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail, ...(extra || {}) };
}

/** R10: THE ONE DEAD ANSWER. A revoked grant, a grant whose draft has moved to another edition, a secret that never
 *  existed, a malformed secret, a draft that does not exist and a draft the caller has no standing in all receive THIS,
 *  built from no argument, so the bytes cannot vary with anything the caller sent or the record holds: a refusal that
 *  said REVOKED would tell the holder their access had existed. */
export function noReviewCopy() {
  /* DEC-49 REGION is-no-review-copy */
  return refusal("NO_REVIEW_COPY",
           "no review copy answers to this request. A review copy is read through the grant that "
         + "was issued for it, or by a member with standing in the project that produced it; a "
         + "grant that was withdrawn, or whose draft has moved to another edition, answers exactly "
         + "as one that was never issued.");
  /* END DEC-49 REGION is-no-review-copy */
}

/* R2: NOT PERMITTED, AND NOT THERE, ARE ONE ANSWER. The DETAIL varies with the ACT (which the caller chose) and with
   nothing the record holds. The code keeps REC-126's name for all three acts (REC-133's choice): exact for ISSUE,
   narrower than the rule for AUTHOR and REVOKE, and renaming it would change an answer callers branch on. */
const AUTHORITY = Object.freeze({
  draft: "authoring a review copy's draft is EDITING the production, and needs the project's edit permission: "
       + "an owner, or a JOINED participant, holding `contribute` (BIO_Publication §6A.2; Membership v2 §7.5).",
  grant: "handing the group's draft to someone outside it is the producing project's own act and is wielded by an "
       + "OWNER of it, as publishing is (DEC-72). An administrator sees every project and directs none of them.",
  revoke: "withdrawing a grant is the producing project's own act and is wielded by an OWNER of it, as issuing "
        + "one is (BIO_Publication §6A.2). An administrator sees every project and directs none of them.",
});
function notReviewOwner(act) {
  /* DEC-49 REGION is-review-authority */
  return refusal("REVIEW_NOT_PROJECT_OWNER",
           `${AUTHORITY[act]} A project, draft or grant you hold no such authority over `
         + "is answered exactly as one that does not exist.");
  /* END DEC-49 REGION is-review-authority */
}

/** R5 (D-568): THE EDITION A DRAFT'S ANSWERS STATE IS NULL WHERE ITS CASE IS DERIVED. The identity's edition 1 for a
 *  draft naming no case is the edition a MINTED case has, and it stays the INTERNAL key (grants and acknowledgements are
 *  written and matched at (case_id NULL, edition 1), so moving it would orphan every grant and reading already given).
 *  On the wire it would claim more than the record holds: a draft naming no case without `newCase` has its case DERIVED
 *  at publication, and which edition it becomes is undetermined until then. `newCase` is read for truthiness, as
 *  `publishCase` reads it. Pure. */
export function statedEdition(ident, newCase) {
  return ident.caseId || newCase ? ident.edition : null;
}

/** R5 (D-538): THE SENTENCE TAKES THE DRAFT'S `newCase`, BECAUSE A CASE ID OF null IS TWO DIFFERENT DRAFTS: one asking
 *  for a new case, and one whose case publication DERIVES from a record that can change before then. A draft naming a
 *  case AND asking for a new one is "the next edition" of nothing: publication refuses the pair together. The sentence
 *  is a member's and a recipient's to read, so it carries no code (the surfaces' DEC-49 guards refuse one on the page).
 *  Pure. */
export function caseIdentitySentence(caseId, edition, newCase) {
  if (caseId && newCase)
    return `the next edition (${edition}) of ${caseId} — but this draft also asks for a new case, and `
         + `publication refuses those two instructions together, so which case it is stays UNDETERMINED `
         + `until one of them is withdrawn`;
  if (caseId) return `the next edition (${edition}) of ${caseId}`;
  if (newCase) return "a new case, whose identity is not yet allocated — a case id is minted only by publication";
  return "a case this draft does not name and publication DERIVES, so which case it is stays UNDETERMINED "
       + "here: the draft names no case and does not ask for a new one, so publication reads the record at "
       + "that moment — a further edition of the one case its findings already serve, a refusal to choose "
       + "if they serve several, and a new case only if they serve none and no prepared, unsigned edition "
       + "claims them";
}

/* The statement as a case document PRINTS it: the frontmatter-safe normalisation the acknowledgements hash, so two
   spellings the record cannot tell apart are one statement (R4). */
const printed = (s) => String(s ?? "").replace(/[\r\n]+/g, " ").replace(/["\\]/g, "'").trim();

/* R14, R19: the caller may ask for less, never for more; an absent or unreadable limit is the ceiling. */
function listCap(limit) {
  const asked = Number.parseInt(String(limit ?? ""), 10);
  return Number.isInteger(asked) && asked >= 1 ? Math.min(asked, REVIEW_LIST_MAX) : REVIEW_LIST_MAX;
}

/** R17 (REC-200, BOB #32's ruling of 2026-09-23 on §6A.3 point 1): THE COPY CARRIES THE DATE OF ITS LAST CHANGE, the
 *  newest DATED ACT these bytes carry, and only those they carry: the draft's own last edit, a comment served, a grant
 *  served (or the recipient's own) with its issue and its revocation, and an acknowledgement served. It is computed over
 *  the rows SERVED, so an act beyond a list cap moves neither the hash nor this date.
 *  RANKED BY INSTANT, NEVER BY STRING (D-543): `…:00Z` sorts after `…:00.123Z` as a string though it is the earlier
 *  instant, and anything unparseable is not ranked at all. Equal instants keep the FIRST candidate in the order above.
 *  A WHOLE-SECOND STAMP NAMES ITS SECOND AND NOT WHERE IN IT THE ACT FELL (D-573, BOB #34, 2026-09-25): beside another
 *  act in that second the order between them is one the record cannot support, so the instant pick is kept as the one
 *  in-band date and each such act is named in `undetermined_within`, with `stated` saying why.
 *  THE AUTHOR DOES NOT MOVE WITH IT: the quartet's author stays the draft's `updated_by` (a recipient who comments has
 *  not authored the copy), and `by` here says who made the last change. What the copy draws live and dates nowhere
 *  (finding text, the gates' verdict, the floors) is named in `stated`. */
function lastChange({ draft, comments, grants, acknowledgements }) {
  const cand = [];
  const add = (at, by, byKind, kind) => {
    if (typeof at === "string" && at && !Number.isNaN(Date.parse(at)))
      cand.push({ at, by: by ?? null, by_kind: byKind, kind });
  };
  add(draft.updated_at, draft.updated_by, "member", "edit");
  for (const c of comments)
    add(c.at, c.author_kind === "recipient" ? c.recipient : c.author,
        c.author_kind === "recipient" ? "recipient" : "member", "comment");
  for (const g of grants) {
    add(g.issued_at, g.issued_by, "member", "grant");
    add(g.revoked_at, g.revoked_by, "member", "revocation");
  }
  for (const a of acknowledgements)
    add(a.at, a.kind === "recipient" ? a.recipient : a.by,
        a.kind === "recipient" ? "recipient" : "member", "statement acknowledgement");
  let last = null;
  for (const c of cand) if (!last || instantOrder(c.at, last.at) > 0) last = c;
  const who = (c) => `${c.kind === "edit" ? "an edit of the draft" : `a ${c.kind}`} by `
                   + `${c.by ?? "somebody this record does not name"}`;
  const act = !last ? "UNDETERMINED: these bytes carry no dated act at all"
    : `the newest dated act these bytes carry is ${who(last)}`;
  const WHOLE = /T\d{2}:\d{2}:\d{2}Z$/;
  const second = (at) => Math.floor(Date.parse(at) / 1000);
  const tied = !last ? [] : cand.filter((c) => c !== last && second(c.at) === second(last.at)
                                             && (WHOLE.test(c.at) || WHOLE.test(last.at)));
  const tieStated = tied.map((c) => {
    const [a, b] = WHOLE.test(c.at) ? [c, last] : [last, c];
    return ` Which of ${who(a)} (${a.at}) and ${who(b)} (${b.at}) came later is undetermined: `
         + (WHOLE.test(b.at) ? "both were recorded to the second" : `${who(a)} was recorded to the second`)
         + `, so the date this copy carries is the instant order's pick and not an order the record holds `
         + `(BOB #34, 2026-09-25).`;
  }).join("");
  return {
    at: last ? last.at : null, by: last ? last.by : null,
    by_kind: last ? last.by_kind : null, kind: last ? last.kind : null,
    undetermined_within: tied.map((c) => ({ at: c.at, by: c.by, by_kind: c.by_kind, kind: c.kind })),
    stated: `${act}.${tieStated} THIS IS THE DATE THE COPY CARRIES IN-BAND (BIO_Publication_v0_1.md §6A.3 point 1, as `
          + `BOB #32 ruled it on 2026-09-23): the copy's LAST CHANGE, so a comment, a grant, an `
          + `acknowledgement or an edit moves both the hash and this date. IT DOES NOT SEE what this copy `
          + `draws live and dates nowhere — each finding's text, the publish gates' verdict, and the `
          + `project's declared floors — any of which can move the hash without moving this date.`,
  };
}

/* R13: the dry run's own throw, so a rollback is told apart from a failure. */
const ROLLBACK = Symbol("review-dry-run");

export class Review {
  #deps;
  #seeded = false;

  constructor({ storage, record, membership, host = null, strength = null, basisVersions = null, publication = null,
                caseAuthoring = null, now = null } = {}) {
    this.sql = storage.sql;
    this.record = record;
    this.membership = membership;
    this.#deps = { host, strength, basisVersions, publication, caseAuthoring };
    this.now = typeof now === "function" ? now : () => stampInstant("millisecond");
  }

  /* The modules reached lazily: each is created on the same host on first use, unless a test passed its own. */
  get strength() { return this.#deps.strength ||= strengthOf(this.#deps.host); }
  get basisVersions() { return this.#deps.basisVersions ||= basisVersionsOf(this.#deps.host); }
  get publication() { return this.#deps.publication; }
  get caseAuthoring() { return this.#deps.caseAuthoring; }

  migrate() { migrateReview(this.sql); }

  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  #one(q, ...a) { for (const r of this.sql.exec(q, ...a)) return r; return null; }
  #when() { const w = this.now(); return typeof w === "string" && w ? w : stampInstant("millisecond"); }
  #draftRow(id) { return this.#one(`SELECT * FROM case_drafts WHERE draft_id=?`, String(id ?? "").trim()); }

  /* D-432 (record-core R40): before this module's first mint, the opaque minter's ledger learns every draft and grant
     id standing in a live row, so a store written before the ledger existed never has an id drawn twice. */
  #seedLedger() {
    if (this.#seeded) return;
    this.record.seedMintLedger([["DRAFT", "case_drafts", "draft_id"], ["DRAFT", "review_grants", "draft_id"],
                                ["RVG", "review_grants", "grant_id"]]);
    this.#seeded = true;
  }

  /* publication's `cases` and `published_cases` (R3, R5): a case's owning project, and its highest published edition. */
  #caseProject(caseId) {
    const r = this.#one(`SELECT project_id FROM cases WHERE case_id=?`, caseId);
    return r ? r.project_id : null;
  }
  #topEdition(caseId) {
    const r = this.#one(`SELECT MAX(edition) AS m FROM published_cases WHERE case_id=?`, caseId);
    return r && r.m != null ? Number(r.m) : 0;
  }

  /** R5: A DRAFT'S CASE IDENTITY IS READ FROM THE PUBLISHED RECORD EVERY TIME, never stored and never taken from the
   *  caller (`publishCase`'s own rule, DEC-12 as DEC-44 rehomes it): a named case stands at its highest published
   *  edition plus one; a draft naming none stands at edition 1, the internal key (see `statedEdition`). */
  draftIdentity(draft) {
    const named = String((draft && draft.case_id) ?? "").trim() || null;
    if (!named) return { caseId: null, edition: 1 };
    return { caseId: named, edition: this.#topEdition(named) + 1 };
  }

  /** R8: THE LIVE-GRANT PREDICATE, the one place a grant is judged, read by the copy, its comment, the case document and
   *  the acknowledgements alike, so they cannot disagree. Live: a grant with this fingerprint exists, is NOT REVOKED,
   *  its draft exists, and the draft STILL STANDS AT THE CASE IDENTITY THE GRANT WAS BOUND TO (so a grant whose edition
   *  was published and signed is dead exactly as a revoked one). A malformed fingerprint is never live. Answers
   *  `{grant, draft}` or null. */
  liveGrant(secretSha) {
    const s = String(secretSha ?? "");
    if (!SECRET_SHA.test(s)) return null;
    const g = this.#one(`SELECT * FROM review_grants WHERE secret_sha=? AND revoked_at IS NULL`, s);
    if (!g) return null;
    const d = this.#draftRow(g.draft_id);
    if (!d) return null;
    const now = this.draftIdentity(d);
    if ((now.caseId ?? null) !== (g.case_id ?? null) || now.edition !== Number(g.edition)) return null;
    return { grant: g, draft: d };
  }

  /** R8: whether a live grant admits one case edition: it must be bound to exactly that named case and edition. */
  grantAdmitsCaseEdition(secretSha, caseId, edition) {
    if (!secretSha) return false;
    const live = this.liveGrant(secretSha);
    return !!(live && live.grant.case_id && live.grant.case_id === caseId
              && Number(live.grant.edition) === Number(edition));
  }

  /** R9: the draft, when the viewer has standing in its project's drafts; else null. */
  draftForMember(draftId, viewer) {
    const d = this.#draftRow(draftId);
    if (!d) return null;
    return this.seesProjectDrafts(d.project_id, viewer) ? d : null;
  }

  /** R9 (REC-198; BOB #32, 2026-09-23; §3 rule 15 (a)): THE DRAFT FENCE, AND THERE IS EXACTLY ONE OF IT. The single read
   *  and the list both CALL it. It is membership's sight predicate over the producing PROJECT bundle: a machine class
   *  compiles unfiltered, an identified member must be a participant (invited or joined) or an active administrator,
   *  and anything the predicate does not recognise is DENY. */
  seesProjectDrafts(projectId, viewer) {
    const gate = viewerPredicate(viewer);
    if (gate.scope === "DENY") return false;
    if (gate.scope === "member") return true;
    return !!this.#one(`SELECT 1 AS seen FROM bundles b WHERE b.bundle_id=? AND b.object_type='project' AND ${gate.sql}`,
                       projectId, ...gate.args);
  }

  /** publication R23: the one review provider this module fills. */
  provider() {
    return {
      draftForMember: (draftId, viewer) => this.draftForMember(draftId, viewer),
      draftIdentity: (draft) => this.draftIdentity(draft),
      caseIdentitySentence, statedEdition,
      liveGrant: (secretSha) => this.liveGrant(secretSha),
      grantAdmitsCaseEdition: (secretSha, caseId, edition) => this.grantAdmitsCaseEdition(secretSha, caseId, edition),
      deadAnswer: noReviewCopy,
    };
  }

  /** R1: THE THREE AUTHORING ACTS ENTER THROUGH ONE DOOR, and the door is where the MACHINE FENCE (C-32.16) stands,
   *  before any act is chosen: the act is ADDRESSED and ATTRIBUTED (§6A.2), so the record must name the person. */
  act({ act = "", author = null, ...args } = {}) {
    const who = String(author ?? "").trim();
    /* DEC-49 REGION is-machine-review — REC-126/C-32.16. The fence alone. */
    if (!who || isMachineIdentity(who))
      return refusal("MACHINE_CANNOT_REVIEW",
               "a review copy is an addressed act: somebody in this group hands a draft to a named "
             + "person and the record says who. A machine credential may prepare the material and "
             + "may not put the group's draft in front of anyone. Sign in as a member.");
    /* END DEC-49 REGION is-machine-review */
    if (act === "draft") return this.#draft(who, args);
    if (act === "grant") return this.#grant(who, args);
    if (act === "revoke") return this.#revoke(who, args);
    /* DEC-49 REGION is-review-unknown-act */
    return refusal("REVIEW_UNKNOWN_ACT", "the review copy's authoring acts are draft, grant and revoke.", { act });
    /* END DEC-49 REGION is-review-unknown-act */
  }

  /* R3, R4: create a draft, or edit one in place. */
  #draft(who, { draft = null, project = null, viewer = null, ...rest } = {}) {
    const proj = String(project ?? "").trim();
    /* REC-149: a NEW draft under a DISCOVERABLE project its caller is outside is refused positionally (C-70.1); every
       other caller keeps the one answer below, which says nothing about whether the project exists. */
    if (!draft && proj) { const existence = this.membership.existenceAct(proj, viewer); if (existence) return existence; }
    const existing = draft ? this.#draftRow(draft) : null;
    if (draft && !existing) return notReviewOwner("draft");
    const owning = existing ? existing.project_id : proj;
    if (!owning)
      /* DEC-49 REGION is-review-no-project */
      return refusal("REVIEW_NO_PROJECT",
               "a draft case is a production of a project, as a published case is (DEC-72): pass "
             + "project=<project id>.");
      /* END DEC-49 REGION is-review-no-project */
    if (existing && proj && proj !== existing.project_id)
      /* DEC-49 REGION is-review-draft-changes-project */
      return refusal("REVIEW_DRAFT_CHANGES_PROJECT",
               `this draft is ${existing.project_id}'s production, and a case does not change hands `
             + `(DEC-72). Draft this material as a new case under the other project instead.`);
      /* END DEC-49 REGION is-review-draft-changes-project */
    if (!this.membership.isProjectEditor(owning, who)) return notReviewOwner("draft");
    const params = {};
    for (const k of REVIEW_DRAFT_FIELDS) if (k in rest) params[k] = rest[k];
    const named = typeof params.caseId === "string" && params.caseId.trim() ? params.caseId.trim() : null;
    if (named) {
      if (this.#caseProject(named) !== owning)
        /* DEC-49 REGION is-review-no-such-case */
        return refusal("REVIEW_NO_SUCH_CASE",
                 `no case of ${owning}'s answers to ${named}. A draft names an EXISTING case to be its `
               + `next edition, and a case this project did not publish is answered exactly as one `
               + `that does not exist.`, { caseId: named });
        /* END DEC-49 REGION is-review-no-such-case */
      params.caseId = named;
    }
    const json = JSON.stringify(params);
    if (json.length > REVIEW_DRAFT_MAX)
      /* DEC-49 REGION is-review-draft-too-large */
      return refusal("REVIEW_DRAFT_TOO_LARGE",
               "a draft's arguments are at most 64 KiB, the size of what op=publish would accept.");
      /* END DEC-49 REGION is-review-draft-too-large */
    const when = this.#when();
    /* R4 (REC-193, §3 rule 13): THE STATEMENT'S AUTHOR IS THE MEMBER WHO WROTE ITS CURRENT BYTES, stamped here from the
       session the act runs as; no caller-supplied field reaches it. An edit that leaves the statement text (as a case
       document would print it) alone leaves the stamp alone; a write supplying a statement to a draft whose author is
       unrecorded stamps it (that member did write the bytes that now stand); an emptied statement has no author. */
    const priorStatement = existing ? printed(JSON.parse(existing.params).statement ?? "") : "";
    const nextStatement = printed(params.statement ?? "");
    const statementBy = !nextStatement ? null
      : (existing && nextStatement === priorStatement && existing.statement_by) ? existing.statement_by
      : who;
    let id;
    if (existing) {
      id = existing.draft_id;
      this.sql.exec(`UPDATE case_drafts SET case_id=?, params=?, updated_by=?, updated_at=?, statement_by=?
                     WHERE draft_id=?`, named, json, who, when, statementBy, id);
    } else {
      /* REC-151: OPAQUE, never the DRAFT counter (Membership v2 §7): a draft is its project's editors' alone. */
      this.#seedLedger();
      id = this.record.mintOpaqueId("DRAFT", when.slice(0, 4), "", (d) =>
        !!(this.#one(`SELECT 1 FROM case_drafts WHERE draft_id=?`, d)
          || this.#one(`SELECT 1 FROM review_grants WHERE draft_id=? LIMIT 1`, d)));
      if (!id) return { ok: false, reason: "MINT_EXHAUSTED",
                        detail: "the plane could not find a free draft id; nothing was written" };
      this.sql.exec(`INSERT INTO case_drafts (draft_id,project_id,case_id,params,created_by,created_at,
                     updated_by,updated_at,statement_by) VALUES (?,?,?,?,?,?,?,?,?)`,
                    id, owning, named, json, who, when, who, when, statementBy);
    }
    const ident = this.draftIdentity({ case_id: named });
    return { ok: true, draftId: id, project: owning, edited: !!existing,
             caseId: ident.caseId, edition: statedEdition(ident, !!params.newCase),
             caseIdentity: caseIdentitySentence(ident.caseId, ident.edition, !!params.newCase),
             read: `op=reviewcopy&draft=${id}` };
  }

  /* R6: issue a grant bound to the draft's case identity at issue. */
  #grant(who, { draft = null, recipient = "", secretSha = null } = {}) {
    const d = this.#draftRow(draft);
    if (!d || !this.membership.isProjectOwner(d.project_id, who)) return notReviewOwner("grant");
    const to = String(recipient ?? "").trim();
    if (!to || to.length > REVIEW_RECIPIENT_MAX || /[\r\n]/.test(to))
      /* DEC-49 REGION is-review-recipient */
      return refusal("REVIEW_NO_RECIPIENT",
               `name the person or group this copy is addressed to, in one line of at most `
             + `${REVIEW_RECIPIENT_MAX} characters. An addressed act with no addressee is not `
             + `attributed, and the grant is the record of who was handed what.`);
      /* END DEC-49 REGION is-review-recipient */
    const s = String(secretSha ?? "");
    if (!SECRET_SHA.test(s))
      /* DEC-49 REGION is-review-secret */
      return refusal("REVIEW_NO_SECRET", "the read secret's fingerprint is set by the control plane and was absent.");
      /* END DEC-49 REGION is-review-secret */
    const when = this.#when();
    const ident = this.draftIdentity(d);
    /* REC-151: OPAQUE, never the RVG counter (Membership v2 §7): a grant is its project owner's alone. */
    this.#seedLedger();
    const id = this.record.mintOpaqueId("RVG", when.slice(0, 4), "",
      (g) => !!this.#one(`SELECT 1 FROM review_grants WHERE grant_id=?`, g));
    if (!id) return { ok: false, reason: "MINT_EXHAUSTED",
                      detail: "the plane could not find a free grant id; nothing was issued" };
    this.sql.exec(`INSERT INTO review_grants (grant_id,draft_id,case_id,edition,recipient,secret_sha,issued_by,issued_at)
                   VALUES (?,?,?,?,?,?,?,?)`, id, d.draft_id, ident.caseId, ident.edition, to, s, who, when);
    /* D-568: the ROW binds at the internal key; the ANSWER states the edition only where the record holds one. */
    const newCase = !!JSON.parse(d.params).newCase;
    return { ok: true, grantId: id, draftId: d.draft_id, caseId: ident.caseId,
             edition: statedEdition(ident, newCase),
             recipient: to, issuedBy: who, issuedAt: when,
             boundTo: `this grant reads ${caseIdentitySentence(ident.caseId, ident.edition, newCase)} and nothing `
                    + `else. It ends when it is revoked, and when that edition is published and signed.` };
  }

  /* R7: withdraw a grant, once; a repeat answers the first revocation. */
  #revoke(who, { grant = null } = {}) {
    const gid = String(grant ?? "").trim();
    /* An ABSENT argument says nothing about what exists, so it is named as the payload complaint it is rather than
       answered as a grant nobody owns. */
    if (!gid)
      /* DEC-49 REGION is-review-grant-named */
      return refusal("REVIEW_NO_GRANT", "name the grant to withdraw: grant=<the grant id op=reviewgrant answered with>.");
      /* END DEC-49 REGION is-review-grant-named */
    const g = this.#one(`SELECT g.*, d.project_id FROM review_grants g JOIN case_drafts d ON d.draft_id=g.draft_id
                         WHERE g.grant_id=?`, gid);
    if (!g || !this.membership.isProjectOwner(g.project_id, who)) return notReviewOwner("revoke");
    if (g.revoked_at)
      return { ok: true, existed: true, grantId: g.grant_id, revokedBy: g.revoked_by, revokedAt: g.revoked_at };
    const when = this.#when();
    this.sql.exec(`UPDATE review_grants SET revoked_by=?, revoked_at=? WHERE grant_id=? AND revoked_at IS NULL`,
                  who, when, g.grant_id);
    return { ok: true, existed: false, grantId: g.grant_id, revokedBy: who, revokedAt: when };
  }

  /* R13: WHO THE GATES ARE RUN AS. Publishing is an owner's act (DEC-72) and `publishCase` runs its owner fence first,
     so a dry run as a non-owner editor would answer NOT_THE_PROJECT_OWNER for every such draft and hide the gaps the
     copy exists to show. So: the last editor when they own the project, otherwise its lowest-id owner (deterministic),
     and only for a project with NO owner the editor, whose NOT_THE_PROJECT_OWNER is then the true first gap. */
  #publisher(row) {
    if (this.membership.isProjectOwner(row.project_id, row.updated_by)) return row.updated_by;
    const [first] = [...this.membership.projectOwners(row.project_id)].sort();
    return first ?? row.updated_by;
  }

  /* R13: WHAT IS MISSING IS THE PUBLISH GATES' OWN ANSWER (§6A.4). The real act is run over the draft's arguments inside
     a transaction that is ALWAYS rolled back, so every write it would make (the case document, a minted case id) is
     undone and what survives is the gates' verdict in their own words: a second implementation of the gates here would
     be the second vocabulary §6A.4 forbids. `publishCase` stops at its first refusal and is not rebuilt to collect
     them, so what lies beyond the first is UNDETERMINED rather than absent, and `evaluated` says so. */
  #gates(row) {
    let out = null;
    try {
      this.record.transact(() => {
        const by = this.#publisher(row);
        out = this.caseAuthoring.publishCase({ ...JSON.parse(row.params), project: row.project_id,
                                               viewer: `member:${by}`, author: by });
        throw ROLLBACK;
      });
    } catch (e) {
      if (e !== ROLLBACK) throw e;
    }
    if (out && out.ok) return { gates: "passed", missing: [],
      evaluated: "every publish gate was run over this draft and none refused. Nothing was published: "
               + "publication still needs the act itself and a member's signature over the case document." };
    if (!out) return { gates: "undetermined", missing: [],
      evaluated: "the publish gates gave no answer over this draft, so what is missing is UNDETERMINED." };
    const { ok: _ok, ...refused } = out;
    return { gates: "refused", missing: [refused],
      evaluated: "the publish gates run in order and stop at the first refusal, so this is the first refusal "
               + "only. Whether any later gate would also refuse is UNDETERMINED, not absent." };
  }

  /* R10: the two doors. A recipient through a live grant (a named draft must be the grant's own), or a member with
     standing (R9). Answers `{draft, grant, reader}` or null for the dead answer. */
  #door({ draft, secretSha, viewer, bySecret }) {
    if (bySecret) {
      const live = this.liveGrant(secretSha);
      if (!live || (draft && String(draft).trim() !== live.draft.draft_id)) return null;
      return { draft: live.draft, grant: live.grant, reader: "recipient" };
    }
    const d = this.draftForMember(draft, viewer);
    return d ? { draft: d, grant: null, reader: "member" } : null;
  }

  /** R10–R17: the review copy (`op=reviewcopy`), or the dead answer. */
  copy({ draft = null, secretSha = null, viewer = null, bySecret = false, limit = null } = {}) {
    const door = this.#door({ draft, secretSha, viewer, bySecret });
    if (!door) return noReviewCopy();
    const { draft: d, grant, reader } = door;
    const params = JSON.parse(d.params);
    const ident = this.draftIdentity(d);
    const targets = Array.isArray(params.targets) ? params.targets
                  : typeof params.targets === "string" && params.targets.trim() ? params.targets.split(",")
                  : params.target ? [params.target] : [];
    /* R12: THE FINDINGS ARE READ AS THE DRAFT'S EDITOR SEES THEM, for both doors: the grant is the editor's act, so a
       recipient is shown exactly what the editor put in front of them and never a document the editor could not see. */
    const gate = viewerPredicate(`member:${d.updated_by}`);
    const findings = targets.map((raw) => {
      const id = String(raw ?? "").trim();
      /* D-539: THE ROLE IS THE DRAFT'S OWN AUTHORED FACT, said back whether or not the finding can be read, so an edit
         written from the answer does not lose it. It discloses nothing the target id beside it does not. */
      const role = params.roles && typeof params.roles === "object" ? params.roles[id] ?? null : null;
      const b = this.#one(`SELECT b.bundle_id, b.object_type, b.current_state FROM bundles b
                           WHERE b.bundle_id=? AND (${gate.sql})`, id, ...gate.args);
      if (!b) return { target: id, present: false, role,
                       detail: "this draft names a finding its editor cannot read, or one that does not exist." };
      const md = this.#one(`SELECT content FROM files WHERE bundle_id=? AND path='bundle.md'`, id);
      return { target: id, present: true, object_type: b.object_type, state: b.current_state, role,
               text: md ? md.content : null };
    });
    const gates = this.#gates(d);
    const cap = listCap(limit);
    const commentRows = this.#rows(`SELECT c.comment_id, c.author_kind, c.author, c.grant_id, c.text, c.at,
                                        g.recipient FROM review_comments c
                                 LEFT JOIN review_grants g ON g.grant_id=c.grant_id
                                 WHERE c.draft_id=? ORDER BY c.comment_id LIMIT ?`, d.draft_id, cap + 1);
    const comments = commentRows.slice(0, cap)
      .map((c) => ({ comment_id: c.comment_id, author_kind: c.author_kind, author: c.author,
                     grant_id: c.grant_id ?? null, recipient: c.author_kind === "recipient" ? c.recipient : null,
                     text: c.text, at: c.at }));
    /* R14: THE RECIPIENT DOOR SEES ITS OWN GRANT; THE MEMBER DOOR SEES THE ROSTER, under the cap, LIVE judged once for
       the draft (every grant here is this draft's, so live is unrevoked and bound to the identity it stands at now). A
       grant bound to no case was given at (NULL, 1) for a draft either new or derived, and the row does not record
       which: a live one states the draft's own stated edition, a dead one null (D-568). */
    let grantPart;
    if (grant) {
      grantPart = { grant: { grant_id: grant.grant_id, recipient: grant.recipient, issued_by: grant.issued_by,
                             issued_at: grant.issued_at } };
    } else {
      const grantRows = this.#rows(`SELECT grant_id, case_id, edition, recipient, secret_sha, issued_by, issued_at,
                                           revoked_by, revoked_at FROM review_grants WHERE draft_id=?
                                    ORDER BY issued_at, grant_id LIMIT ?`, d.draft_id, cap + 1);
      const grants = grantRows.slice(0, cap).map((g) => {
        const live = !g.revoked_at && (g.case_id ?? null) === (ident.caseId ?? null) && Number(g.edition) === ident.edition;
        return { ...g, live, edition: g.case_id ? g.edition : live ? statedEdition(ident, !!params.newCase) : null };
      });
      grantPart = { grants, grants_truncated: grantRows.length > cap };
    }
    /* R15 (D-150, §3 rule 11; REC-194, REC-213): WHO HAS ACKNOWLEDGED THE STATEMENT AS IT STANDS NOW, case-authoring's
       one list, at this draft's identity (the draft is passed: for a draft naming no case the draft IS the identity the
       reading was given for). The WRITER is asked (`statement_by`, the member whose write made the statement's bytes,
       never `updated_by`): a reading by the sentence's own writer is not a second reading, so it is withheld and
       COUNTED, never hidden; `{by: null}` is undetermined and withholds every participant row, counted. */
    const writer = { by: d.statement_by ?? null };
    const acks = this.caseAuthoring.statementAcknowledgements(d.project_id, ident.caseId, ident.edition,
                                                              params.statement ?? "", null, writer, d.draft_id);
    const withheld = acks.byWriter + acks.withheldWriterUndetermined;
    const statementAcks = { statement_sha: acks.statementSha, acknowledgements: acks.rows,
                            truncated: acks.truncated,
                            withheld,
                            ...(acks.byWriter ? { acknowledgements_by_statement_writer_not_listed: acks.byWriter } : {}),
                            ...(acks.withheldWriterUndetermined
                              ? { acknowledgements_withheld_writer_undetermined: acks.withheldWriterUndetermined }
                              : {}),
                            withheld_stated: acks.withheld_stated,
                            act: "op=statementack&draft=" + d.draft_id };
    return {
      ok: true, kind: "review-copy", marking: REVIEW_MARKING, published: false,
      signature: { signed: false, detail: "a review copy is never signed. A signature is given only over a case "
                                        + "document at publication (op=caseratify)." },
      draft: d.draft_id, project: d.project_id, reader,
      /* REC-199: `newCase` IS SAID BACK, beside the case it is the other half of one choice with, as the gates read it
         (a boolean), because a read that drops a field an edit writes back loses it. */
      case: { case_id: ident.caseId, edition: statedEdition(ident, !!params.newCase),
              identity: caseIdentitySentence(ident.caseId, ident.edition, !!params.newCase),
              newCase: !!params.newCase },
      authored: { scope: params.scope ?? null, statement: params.statement ?? null,
                  excluded: params.excluded ?? null, subjectPosition: params.subjectPosition ?? null,
                  subjectJustification: params.subjectJustification ?? null,
                  biasAcknowledgement: params.biasAcknowledgement ?? null },
      findings, gates: gates.gates, missing: gates.missing, evaluated: gates.evaluated,
      comments, comments_truncated: commentRows.length > cap, list_limit: cap,
      statement_acknowledgements: statementAcks,
      observations: this.#observations(findings, ident),
      updated_by: d.updated_by, updated_at: d.updated_at,
      last_change: lastChange({ draft: d, comments, acknowledgements: statementAcks.acknowledgements,
                                grants: grantPart.grants ?? (grantPart.grant ? [grantPart.grant] : []) }),
      /* R11 (REC-193, §3 rule 13): WHO WROTE THE STATEMENT THAT STANDS, beside the editor of everything else. */
      statement_by: d.statement_by ?? null,
      statement_by_stated: d.statement_by
        ? `${d.statement_by} wrote the exclusion statement as it now stands`
        : "UNDETERMINED: this draft predates the recording of the statement's author, and its last editor "
          + "is not evidence of who wrote the statement",
      ...grantPart,
      /* R11 (REC-148): the project's bar AS `op=publish` WOULD FREEZE IT, for the control plane's in-band floors. Read
         now, because a draft is not frozen. */
      required_strength: this.strength.projectBar(d.project_id),
    };
  }

  /* R16 (MK-7, MEMBER-KNOWLEDGE-DESIGN.md §4.2): EVERY OBSERVATION THE EDITION WOULD REACH from its present findings,
     with whether its author has chosen an attribution level for this case edition, never the level itself (that is the
     author's to state, in the case document). A draft naming no case has no identity a level can be keyed to. */
  #observations(findings, ident) {
    const seen = findings.filter((f) => f.present).map((f) => f.target);
    const r = this.basisVersions.testimonyReach(seen);
    return [...new Set([...r.self, ...r.via.map((v) => v.observation)])].map((obs) => {
      const chosen = ident.caseId ? this.publication.attributionInForce(ident.caseId, ident.edition, obs) : null;
      return { observation: obs, chosen: !!chosen,
               stated: chosen ? `its author has chosen a level for ${ident.caseId} edition ${ident.edition}`
                 : ident.caseId ? `its author has chosen no level for ${ident.caseId} edition ${ident.edition}; `
                                  + "the edition cannot be signed until they do (op=attribute)"
                 : "this draft names no case yet, so no level can be chosen; its author chooses one "
                   + "(op=attribute) once op=publish has prepared the case document" };
    });
  }

  /** R18: a comment through R10's doors (`op=reviewcomment`). A recipient's is attributed to the grant, a member's to
   *  the member. */
  comment({ draft = null, secretSha = null, viewer = null, bySecret = false, text = "" } = {}) {
    const v = String(viewer ?? "");
    const door = bySecret || v.startsWith("member:") ? this.#door({ draft, secretSha, viewer: v, bySecret }) : null;
    if (!door) return noReviewCopy();
    const { draft: d, grant } = door;
    const kind = grant ? "recipient" : "member";
    const author = grant ? grant.grant_id : v.slice("member:".length);
    const body = String(text ?? "").trim();
    if (!body || body.length > REVIEW_TEXT_MAX)
      /* DEC-49 REGION is-review-comment-text */
      return refusal("REVIEW_NO_COMMENT_TEXT",
               `a comment says something: at least one character and at most ${REVIEW_TEXT_MAX}.`);
      /* END DEC-49 REGION is-review-comment-text */
    const when = this.#when();
    const grantId = grant ? grant.grant_id : null;
    this.sql.exec(`INSERT INTO review_comments (draft_id,author_kind,author,grant_id,text,at) VALUES (?,?,?,?,?,?)`,
                  d.draft_id, kind, author, grantId, body, when);
    const row = this.#one(`SELECT last_insert_rowid() AS id`);
    return { ok: true, comment: { comment_id: row ? row.id : null, draft_id: d.draft_id, author_kind: kind,
                                  author, grant_id: grantId, text: body, at: when } };
  }

  /** R19 (REC-198, §6A.4): THE LIST OF A PROJECT'S DRAFTS (`op=casedrafts`), fenced exactly as the single read: a
   *  project that does not exist and a viewer without standing receive the dead answer, so the list is no oracle for
   *  which projects exist or hold drafts. Bounded as R14, `total` counted over the project's drafts. Writes nothing. */
  list({ project = null, viewer = null, limit = null } = {}) {
    const pid = String(project ?? "").trim();
    if (!pid || !this.#one(`SELECT 1 AS p FROM bundles WHERE bundle_id=? AND object_type='project'`, pid)
        || !this.seesProjectDrafts(pid, viewer)) return noReviewCopy();
    const cap = listCap(limit);
    const counted = this.#one(`SELECT COUNT(*) AS n FROM case_drafts WHERE project_id=?`, pid);
    const total = counted ? Number(counted.n) : 0;
    const rows = this.#rows(`SELECT draft_id, case_id, params, created_by, created_at, updated_by, updated_at,
                             statement_by FROM case_drafts WHERE project_id=? ORDER BY created_at, draft_id
                             LIMIT ?`, pid, cap);
    const drafts = rows.map((d) => {
      const ident = this.draftIdentity(d);
      const newCase = !!JSON.parse(d.params).newCase;
      return { draft_id: d.draft_id,
               case: { case_id: ident.caseId, edition: statedEdition(ident, newCase),
                       identity: caseIdentitySentence(ident.caseId, ident.edition, newCase) },
               created_by: d.created_by, created_at: d.created_at,
               updated_by: d.updated_by, updated_at: d.updated_at,
               /* REC-193: null where the draft predates the stamp — UNDETERMINED, not the editor. */
               statement_by: d.statement_by ?? null,
               read: `op=reviewcopy&draft=${d.draft_id}` };
    });
    return { ok: true, kind: "review-drafts", project: pid, drafts, count: drafts.length,
             total, limit: cap, truncated: total > drafts.length };
  }
}

const instances = new WeakMap();

/** K61: the one instance per host, created on the first call with `deps`. It creates its tables and declares them to
 *  purge (R24). */
export function reviewOf(host, deps) {
  let r = instances.get(host);
  if (!r) {
    const d = deps || {};
    const storage = d.storage || host.storage;
    const record = d.record || recordOf(host);
    const membership = d.membership || membershipOf(host, { record });
    r = new Review({ ...d, host, storage, record, membership });
    instances.set(host, r);
    r.migrate();
    record.declarePurge("review", REVIEW_TABLES);
  }
  return r;
}

/** Which purge declaration names one of this module's tables (record-core R21: each owner declares its own). */
export function reviewOwns(t) {
  const name = typeof t === "string" ? t : t && t.name;
  return REVIEW_TABLES.some((x) => x.name === name);
}

/** The module's ops (K3), as entries of the legacy store's op map. Every identity (`author`, `viewer`, `secretSha`,
 *  `bySecret`) is the control plane's stamp, read from the query and spread after the body, so a body naming one is
 *  overwritten, never honoured (R22). */
export function reviewOps(r, url, body) {
  const q = (k) => url.searchParams.get(k);
  const b = body && typeof body === "object" ? body : {};
  return {
    /* REC-149: `viewer` is stamped, and asked only for existence. */
    casedraft: () => r.act({ ...b, act: "draft", author: q("author"), viewer: q("viewer") }),
    reviewgrant: () => r.act({ act: "grant", draft: b.draft ?? q("draft"), recipient: b.recipient ?? q("recipient"),
                               author: q("author"), secretSha: q("secretSha") }),
    reviewrevoke: () => r.act({ act: "revoke", grant: b.grant ?? q("grant"), author: q("author") }),
    reviewcopy: () => r.copy({ draft: q("draft"), secretSha: q("secretSha"), viewer: q("viewer"),
                               bySecret: q("bySecret") === "1", limit: q("limit") }),
    reviewcomment: () => r.comment({ draft: q("draft"), secretSha: q("secretSha"), viewer: q("viewer"),
                                     bySecret: q("bySecret") === "1", text: b.text }),
    /* REC-198: the store fails closed on an absent `viewer`. */
    casedrafts: () => r.list({ project: q("project"), viewer: q("viewer"), limit: q("limit") }),
  };
}
