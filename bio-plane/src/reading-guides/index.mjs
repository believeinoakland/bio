/* reading-guides — what to look for in one kind of document (requirements: `build/requirements/reading-guides.md`
 * R1–R12; D8, D24, D65; K2405, K2418, K2472).
 *
 * A guide is a short list of items, each a label, what to look for and, if given, where: by hand a checklist, for the
 * assistant what to read for, so the two are one text (D65). Civicsmith's library ships with the release (R1,
 * `library.mjs`); each group keeps its own (R2, R3); guides are offered across groups and reviewed before adoption (R6).
 * A guide says what to look for, never how the assistant may behave (D24): `checkGuide` (R4, `check.mjs`) runs at every
 * draft, review, adoption and offer here, and again at every render (`skills` R40). A guide never grades, concludes or
 * names a body's conduct (R10): it has no field for any of these, and each item opens as a look-for statement.
 *
 * STATES. A member's draft is `usable_by_author` at once (R2); another member's approval makes it the group's (`group`,
 * R3), a refusal keeps it its author's with the reason. An adopted guide enters as `draft`, usable by no one until R3's
 * review in this group approves it (R6). `retired` guides stay readable (R7). Every act is a row of the history, in the
 * order written; nothing is deleted. A machine never drafts, reviews or approves: it proposes, apart (R12), and only a
 * member's R2 act naming the proposal (`based_on`) makes a guide of it.
 *
 * SIGHT (R8, R9). A group guide, in any state, and a proposal are the group's: seen by a viewer membership admits as an
 * active member or an administrator, by a machine credential, and by an internal call with no viewer. Any other
 * viewer (one `viewerPredicate` denies, a member not active) sees Civicsmith's alone.
 *
 * REACHED as `readingGuidesOf(host, deps)` (K61): one instance per host, created on the first call with `deps`. At
 * creation it creates its tables and declares them with their classes (R9). `deps`:
 *   record, membership   the modules it uses, through their factories on the same host unless a test passes its own.
 *   groupSlug    `() → string|null`, the group's slug an offer is labelled with (R6; the plane composes it from
 *                `promotion`'s `producingGroup` fact). Absent or blank, an offer is refused `GUIDE_NO_GROUP_SLUG`.
 *   civicsmith   Civicsmith's library (default `CIVICSMITH_GUIDES`); a test passes entries of its own.
 *   now          the module's clock, an ISO instant (default: the wall clock).
 *
 * No place is named here (R11). */
import { isMachineIdentity } from "../record-grammar/actors.mjs";
import { lawProposalState } from "../record-grammar/labels.mjs";
import { isGuideId } from "../record-grammar/ids.mjs";
import { canonicalJson } from "../record-grammar/json.mjs";
import { sha256HexSync } from "../record-grammar/sha256.mjs";
import { recordOf, stampInstant } from "../record-core/index.mjs";
import { membershipOf, viewerPredicate } from "../membership/index.mjs";
import { READING_GUIDES_CHECKS, refusal } from "./checks.mjs";
import { checkGuide } from "./check.mjs";
import { CIVICSMITH_GUIDES, GUIDE_KINDS } from "./library.mjs";
import { READING_GUIDES_TABLE_CLASSES, migrateReadingGuides } from "./schema.mjs";

export { READING_GUIDES_CHECKS } from "./checks.mjs";
export { checkGuide, registerConductCheck, conductCheckHolder, LOOK_FOR_OPENERS, CONDUCT_LISTS, ITEMS_MAX, LABEL_MAX,
         LOOK_FOR_MAX, WHERE_MAX, ITEM_FIELDS } from "./check.mjs";
export { CIVICSMITH_GUIDES, GUIDE_KINDS, civicsmithGuideProblems, freezeLibrary } from "./library.mjs";
export { READING_GUIDES_SCHEMA, READING_GUIDES_TABLES, READING_GUIDES_TABLE_CLASSES } from "./schema.mjs";

/** The terms: a guide's origins and states. */
export const GUIDE_ORIGINS = Object.freeze(["civicsmith", "group", "adopted"]);
export const GUIDE_STATES = Object.freeze(["draft", "usable_by_author", "group", "retired"]);
/** R3: a review's two verdicts. */
export const GUIDE_VERDICTS = Object.freeze(["approve", "refuse"]);
/** R8: the most guides one list answers. */
export const GUIDES_MAX = 200;
/** R3, R7: a reason's length; R12: a run's name. */
export const REASON_MAX = 500, RUN_MAX = 200;
/** R6: the formats of an offer between groups and of a proposal for Civicsmith's library. */
export const GUIDE_OFFER_FORMAT = "bio-reading-guide-offer/1";
export const GUIDE_LIBRARY_PROPOSAL_FORMAT = "bio-reading-guide-library-proposal/1";

/** R12: what a proposal's label says, in each of `record-grammar`'s three proposal states (shaped as its
 *  `proposalLabel` answers; `lawProposalState` decides the state). */
export const GUIDE_PROPOSAL_STATES = Object.freeze({
  machine_proposed: "a machine credential proposed this reading guide. That is machine work, labelled as machine work: "
    + "it can propose what to look for and it can never write, review or approve a guide. It is not a guide until a "
    + "member writes one based on it.",
  member_proposed: "a member proposed this reading guide. It is not a guide until a member writes one based on it.",
  unstated: "who proposed this reading guide is not recorded. It is not a guide until a member writes one based on it.",
});

/** R12: a proposal's label, `{by, state, machine_work, says}`. */
export function guideProposalLabel(proposedBy) {
  const state = lawProposalState(proposedBy);
  return { by: proposedBy ?? null, state, machine_work: state === "machine_proposed", says: GUIDE_PROPOSAL_STATES[state] };
}

const str = (v) => (typeof v === "string" ? v.trim() : "");
const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const safeJson = (s) => { try { return JSON.parse(s); } catch { return null; } };
const argsOf = (a) => (isObj(a) ? a : {});

export class ReadingGuides {
  #sql; #record; #membership; #now; #groupSlug; #civicsmith; #channel = null;

  constructor({ storage, record, membership, now = null, groupSlug = null, civicsmith = CIVICSMITH_GUIDES } = {}) {
    this.#sql = storage.sql;
    this.#record = record;
    this.#membership = membership;
    this.#now = typeof now === "function" ? now : () => new Date().toISOString();
    this.#groupSlug = typeof groupSlug === "function" ? groupSlug : () => null;
    this.#civicsmith = Array.isArray(civicsmith) ? civicsmith : CIVICSMITH_GUIDES;
    migrateReadingGuides(this.#sql);   // the tables exist once the instance does, so no caller migrates
  }

  /** The module's tables, created at construction; kept, idempotent, for the composition root's migration pass. */
  migrate() { migrateReadingGuides(this.#sql); }

  #rows(q, ...a) { return [...this.#sql.exec(q, ...a)]; }
  #one(q, ...a) { return this.#rows(q, ...a)[0] ?? null; }
  #instant() { return stampInstant("second", Date.parse(this.#now())); }

  /* ================================================================ who acts, who sees */

  /* The member `who` names when that member is active or an administrator, else null (a machine, a blank stamp, a
     viewer naming no member, a member not active). */
  #member(who) {
    if (!str(who) || isMachineIdentity(str(who))) return null;
    let m = null;
    /* the founder's own viewer, `admin`, names the founder (`member:admin` is the founder's session) */
    if (str(who) === "admin") m = "admin";
    else try { m = this.#membership.positionalMember(null, str(who)); } catch { m = null; }
    if (!str(m)) return null;
    try {
      if (this.#membership.isAdministrator(m)) return m;
      return this.#membership.memberFacts(m)?.status === "active" ? m : null;
    } catch { return null; }
  }

  /* R8, R9: whether `viewer` sees the group's guides and proposals. */
  #seesGroup(viewer) {
    if (viewer === undefined || viewer === null) return true;
    const g = viewerPredicate(viewer);
    if (g.scope === "DENY") return false;
    if (!g.member && g.scope === "member") return true;   // a machine credential
    return this.#member(viewer) !== null;
  }

  #civic(id) { return this.#civicsmith.find((g) => g.id === id) ?? null; }

  /* A held group guide's row, or null. */
  #held(id) { return isGuideId(id) ? this.#one(`SELECT * FROM reading_guides WHERE guide_id=?`, id) : null; }

  /* The guide an act names, or its refusal: Civicsmith's are read-only, a retired one is done with. */
  #actOn(id) {
    if (isGuideId(id) && this.#civic(id)) return { refused: readOnly(id) };
    const row = this.#held(id);
    if (!row) return { refused: noSuchGuide(id) };
    if (row.state === "retired") return { refused: retiredRefusal(id) };
    return { row };
  }

  #history(id, act, state, by, reason, at) {
    this.#sql.exec(`INSERT INTO reading_guide_history (guide_id, act, state, by_member, reason, at) VALUES (?,?,?,?,?,?)`,
      id, act, state, by, reason ?? null, at);
  }

  #mint(at) {
    const r = this.#record.allocId("GUD", at.slice(0, 4));
    return r && typeof r.id === "string" ? { id: r.id } : { refused: r };
  }

  /* ================================================================ R2: a member's draft */

  /** R2: `{kind, items, based_on?, by}`. Usable by its author at once. `based_on`, when given, names a guide the
   *  author sees, one of Civicsmith's, or a proposal (R12). Answers `{ok, guide, state}`. */
  guideDraft(args) {
    const { kind, items, based_on: basedOn, by } = argsOf(args);
    const member = this.#member(by);
    if (!member) return memberRefusal("writing a reading guide");
    if (!GUIDE_KINDS.includes(kind)) return kindRefusal(kind);
    const checked = checkGuide(items);
    if (!checked.ok) return checked;
    const basis = basedOn === undefined || basedOn === null || basedOn === "" ? null : basedOn;
    /* DEC-49 REGION is-guide-basis */
    if (basis !== null && !(isGuideId(basis) && (this.#civic(basis) || this.#held(basis)
        || this.#one(`SELECT 1 AS x FROM reading_guide_proposals WHERE proposal_id=?`, basis))))
      return refusal("GUIDE_BASED_ON_UNKNOWN", "the guide or proposal named as this guide's basis is not one you can "
        + "see. Nothing was written.", { based_on: typeof basis === "string" ? basis.slice(0, 100) : null });
    /* END DEC-49 REGION is-guide-basis */
    const at = this.#instant();
    return this.#record.transact(() => {
      const m = this.#mint(at);
      if (m.refused) return m.refused;
      this.#sql.exec(`INSERT INTO reading_guides (guide_id, kind, origin, items_json, state, author, reviewed_by, based_on,
                        offered_by, created_at, updated_at) VALUES (?,?,'group',?,'usable_by_author',?,NULL,?,NULL,?,?)`,
        m.id, kind, canonicalJson(checked.items), member, basis, at, at);
      this.#history(m.id, "draft", "usable_by_author", member, null, at);
      return { ok: true, guide: m.id, state: "usable_by_author", at };
    });
  }

  /* ================================================================ R12: a machine's proposal, apart */

  /** R12: `{kind, items, run, by}`, `by` a machine credential and `run` the run that proposed it. Stored apart from
   *  the guides, labelled; it is no guide. Answers `{ok, proposal, label}`. */
  guidePropose(args) {
    const { kind, items, run, by } = argsOf(args);
    /* DEC-49 REGION is-guide-machine */
    if (!str(by) || !isMachineIdentity(str(by)))
      return refusal("GUIDE_PROPOSAL_NOT_MACHINE", "a proposed guide is a machine credential's work; a member writes a "
        + "guide directly. Nothing was written.");
    /* END DEC-49 REGION is-guide-machine */
    /* DEC-49 REGION is-guide-run */
    if (!str(run) || str(run).length > RUN_MAX)
      return refusal("GUIDE_RUN_MISSING", `a proposed guide names the run that proposed it, in at most ${RUN_MAX} `
        + "characters. Nothing was written.");
    /* END DEC-49 REGION is-guide-run */
    if (!GUIDE_KINDS.includes(kind)) return kindRefusal(kind);
    const checked = checkGuide(items);
    if (!checked.ok) return checked;
    const at = this.#instant();
    return this.#record.transact(() => {
      const m = this.#mint(at);
      if (m.refused) return m.refused;
      this.#sql.exec(`INSERT INTO reading_guide_proposals (proposal_id, kind, items_json, run, proposed_by, at)
                      VALUES (?,?,?,?,?,?)`, m.id, kind, canonicalJson(checked.items), str(run), str(by), at);
      return { ok: true, proposal: m.id, label: guideProposalLabel(str(by)), at };
    });
  }

  /** R12: the proposals the viewer may see, newest first, at most 200 (`truncated`), each with its label. */
  guideProposals(args) {
    try {
      const { kind, viewer, limit } = argsOf(args);
      if (!this.#seesGroup(viewer)) return { ok: true, proposals: [], truncated: false };
      const n = capOf(limit);
      const rows = kind === undefined || kind === null
        ? this.#rows(`SELECT * FROM reading_guide_proposals ORDER BY at DESC, proposal_id LIMIT ?`, n + 1)
        : this.#rows(`SELECT * FROM reading_guide_proposals WHERE kind=? ORDER BY at DESC, proposal_id LIMIT ?`, String(kind), n + 1);
      return { ok: true, truncated: rows.length > n,
               proposals: rows.slice(0, n).map((r) => ({ proposal: r.proposal_id, kind: r.kind, items: safeJson(r.items_json),
                 run: r.run, at: r.at, label: guideProposalLabel(r.proposed_by) })) };
    } catch {
      return { ok: true, proposals: [], truncated: false };
    }
  }

  /* ================================================================ R3: review */

  /** R3: `{guide, verdict, reason, by}` by an active member other than the guide's author. `approve` makes it the
   *  group's; `refuse` keeps it as it was (its author's, or an adopted guide still unusable) with the reason, which a
   *  refusal must give. R4 runs again over its items. Answers `{ok, guide, verdict, state}`. */
  guideReview(args) {
    const { guide, verdict, reason, by } = argsOf(args);
    const member = this.#member(by);
    if (!member) return memberRefusal("reviewing a reading guide");
    const { row, refused } = this.#actOn(guide);
    if (refused) return refused;
    /* DEC-49 REGION is-guide-reviewable */
    if (row.state !== "usable_by_author" && row.state !== "draft")
      return refusal("GUIDE_NOT_REVIEWABLE", `${row.guide_id} is already the group's. Nothing was written.`, { guide: row.guide_id });
    /* END DEC-49 REGION is-guide-reviewable */
    /* DEC-49 REGION is-guide-reviewer */
    if (row.author === member)
      return refusal("GUIDE_REVIEW_BY_AUTHOR", `${row.guide_id} was written or adopted by the member reviewing it. `
        + "Nothing was written.", { guide: row.guide_id });
    /* END DEC-49 REGION is-guide-reviewer */
    /* DEC-49 REGION is-guide-verdict */
    if (!GUIDE_VERDICTS.includes(verdict))
      return refusal("GUIDE_VERDICT_UNKNOWN", "a review's verdict is approve or refuse. Nothing was written.", { guide: row.guide_id });
    /* END DEC-49 REGION is-guide-verdict */
    const why = str(reason);
    if (verdict === "refuse" || why) {
      const bad = reasonRefusal(why, verdict === "refuse");
      if (bad) return bad;
    }
    const checked = checkGuide(safeJson(row.items_json));
    if (!checked.ok) return { ...checked, guide: row.guide_id };
    const at = this.#instant();
    const state = verdict === "approve" ? "group" : row.state;
    return this.#record.transact(() => {
      if (verdict === "approve")
        this.#sql.exec(`UPDATE reading_guides SET state='group', reviewed_by=?, updated_at=? WHERE guide_id=?`, member, at, row.guide_id);
      this.#history(row.guide_id, verdict, state, member, why || null, at);
      return { ok: true, guide: row.guide_id, verdict, state, at };
    });
  }

  /* ================================================================ R7: retire */

  /** R7: `{guide, reason, by}`. A guide that is its author's (`usable_by_author`, or an adopted `draft`) is retired by
   *  its author; a group's guide by any active member other than its author (R3's approvers). The guide stays
   *  readable. Answers `{ok, guide, state: "retired"}`. */
  guideRetire(args) {
    const { guide, reason, by } = argsOf(args);
    const member = this.#member(by);
    if (!member) return memberRefusal("retiring a reading guide");
    const { row, refused } = this.#actOn(guide);
    if (refused) return refused;
    const approver = row.state === "group" ? row.author !== member : row.author === member;
    /* DEC-49 REGION is-guide-approver */
    if (!approver)
      return refusal("GUIDE_RETIRE_NOT_APPROVER", row.state === "group"
        ? `${row.guide_id} is the group's, and is retired by a member other than its author. Nothing was written.`
        : `${row.guide_id} is its author's, and is retired by its author. Nothing was written.`, { guide: row.guide_id });
    /* END DEC-49 REGION is-guide-approver */
    const bad = reasonRefusal(str(reason), true);
    if (bad) return bad;
    const at = this.#instant();
    return this.#record.transact(() => {
      this.#sql.exec(`UPDATE reading_guides SET state='retired', updated_at=? WHERE guide_id=?`, at, row.guide_id);
      this.#history(row.guide_id, "retire", "retired", member, str(reason), at);
      return { ok: true, guide: row.guide_id, state: "retired", at };
    });
  }

  /* ================================================================ R6: across groups */

  /** R6 (K31's pattern): the one channel between groups (`network-notices`, later; BOB's). `fn(offer)` is handed each
   *  offer and each proposal for Civicsmith's library once made; its answer is reported, its failure changes nothing. */
  registerGuideChannel(module, fn) {
    if (typeof module !== "string" || !module || typeof fn !== "function")
      return { ok: false, reason: "PROVIDER_MALFORMED", detail: "a channel names the module that registers it and its function" };
    if (this.#channel)
      return { ok: false, reason: "PROVIDER_DECLARED", module, detail: `${this.#channel.module} already provides the channel between groups` };
    this.#channel = { module, fn };
    return { ok: true, module };
  }

  /** R6: `{guide, by}` by an active member: the group's guide as canonical bytes and their digest, labelled with this
   *  group's slug, for another group to adopt. Answers `{ok, guide, bytes, digest, group, channel?}`. */
  guideOffer(args) { return this.#export(argsOf(args), GUIDE_OFFER_FORMAT, "offer"); }

  /** R6: the same export, marked as a proposal for Civicsmith's library. Its adoption there is a release's. */
  guideProposeToCivicsmith(args) { return this.#export(argsOf(args), GUIDE_LIBRARY_PROPOSAL_FORMAT, "propose_to_civicsmith"); }

  #export({ guide, by }, format, act) {
    const member = this.#member(by);
    if (!member) return memberRefusal("offering a reading guide");
    const { row, refused } = this.#actOn(guide);
    if (refused) return refused;
    const off = offerable(row);
    if (off) return off;
    const items = safeJson(row.items_json);
    const checked = checkGuide(items);
    if (!checked.ok) return { ...checked, guide: row.guide_id };
    let slug = null;
    try { slug = str(this.#groupSlug()); } catch { slug = null; }
    if (!slug) return slugRefusal();
    const bytes = canonicalJson({ format, group: slug, guide: row.guide_id, kind: row.kind, items: checked.items });
    const digest = `sha256:${sha256HexSync(bytes)}`;
    const at = this.#instant();
    this.#record.transact(() => { this.#history(row.guide_id, act, row.state, member, null, at); });
    const out = { ok: true, guide: row.guide_id, bytes, digest, group: slug, at };
    if (this.#channel) {
      try {
        const sent = this.#channel.fn({ format, bytes, digest, group: slug, guide: row.guide_id });
        if (sent && typeof sent.then === "function") { sent.then(null, () => {}); out.channel = { module: this.#channel.module, pending: true }; }
        else out.channel = { module: this.#channel.module, answer: sent ?? null };
      } catch (e) {
        out.channel = { module: this.#channel.module, failed: String(e && e.message ? e.message : e).slice(0, 200) };
      }
    }
    return out;
  }

  /** R6: `{bytes, by}`: another group's offer, imported as `adopted`, `based_on` the offer's digest, `draft` until R3's
   *  review here approves it. An offer already adopted and not retired answers that guide (`already: true`). Answers
   *  `{ok, guide, state: "draft", based_on, offered_by}`. */
  guideAdopt(args) {
    const { bytes, by } = argsOf(args);
    const member = this.#member(by);
    if (!member) return memberRefusal("adopting a reading guide");
    const offer = typeof bytes === "string" && bytes.length <= 200000 ? safeJson(bytes) : null;
    const whole = isObj(offer) && canonicalJson(offer) === bytes && offer.format === GUIDE_OFFER_FORMAT
      && str(offer.group) !== "" && str(offer.group).length <= 100 && isGuideId(offer.guide)
      && Object.keys(offer).sort().join() === "format,group,guide,items,kind";
    /* DEC-49 REGION is-guide-offer */
    if (!whole)
      return refusal("GUIDE_OFFER_UNREADABLE", "what was given is not another group's offer of a reading guide, byte "
        + "for byte as offered. Nothing was written.");
    /* END DEC-49 REGION is-guide-offer */
    if (!GUIDE_KINDS.includes(offer.kind)) return kindRefusal(offer.kind);
    const checked = checkGuide(offer.items);
    if (!checked.ok) return checked;
    const digest = `sha256:${sha256HexSync(bytes)}`;
    const held = this.#one(`SELECT guide_id, state FROM reading_guides WHERE origin='adopted' AND based_on=? AND state<>'retired'
                            ORDER BY created_at, guide_id LIMIT 1`, digest);
    if (held) return { ok: true, already: true, guide: held.guide_id, state: held.state, based_on: digest, offered_by: str(offer.group) };
    const at = this.#instant();
    return this.#record.transact(() => {
      const m = this.#mint(at);
      if (m.refused) return m.refused;
      this.#sql.exec(`INSERT INTO reading_guides (guide_id, kind, origin, items_json, state, author, reviewed_by, based_on,
                        offered_by, created_at, updated_at) VALUES (?,?,'adopted',?,'draft',?,NULL,?,?,?,?)`,
        m.id, offer.kind, canonicalJson(checked.items), member, digest, str(offer.group), at, at);
      this.#history(m.id, "adopt", "draft", member, null, at);
      return { ok: true, guide: m.id, state: "draft", based_on: digest, offered_by: str(offer.group), at };
    });
  }

  /* ================================================================ R5, R8: reads */

  /** R5: the guide in force for `kind`: the viewer's own usable guide, else the group's, else Civicsmith's, else none;
   *  each candidate passes R4 again, and one that no longer does is passed over and named in `withheld`. Answers
   *  `{ok: true, kind, guide, origin, withheld}`, `guide` null with `origin` null for none. Never throws. */
  guideFor(args) {
    const none = (kind, withheld = []) => ({ ok: true, kind: typeof kind === "string" ? kind : null, guide: null, origin: null, withheld });
    try {
      const { kind, viewer } = argsOf(args);
      if (!GUIDE_KINDS.includes(kind)) return none(kind);
      const withheld = [];
      const pass = (g) => {
        if (!g) return null;
        const c = checkGuide(g.items);
        if (c.ok) return g;
        withheld.push({ guide: g.id, origin: g.origin, reason: c.reason, item: c.item ?? null });
        return null;
      };
      const sees = this.#seesGroup(viewer);
      const member = viewer === undefined || viewer === null ? null : this.#member(viewer);
      if (sees && member) {
        for (const r of this.#rows(`SELECT * FROM reading_guides WHERE kind=? AND state='usable_by_author' AND author=?
                                     ORDER BY updated_at DESC, guide_id`, kind, member)) {
          const g = pass(viewOf(r));
          if (g) return { ok: true, kind, guide: g, origin: g.origin, withheld };
        }
      }
      if (sees) {
        for (const r of this.#rows(`SELECT * FROM reading_guides WHERE kind=? AND state='group' ORDER BY updated_at DESC, guide_id`, kind)) {
          const g = pass(viewOf(r));
          if (g) return { ok: true, kind, guide: g, origin: g.origin, withheld };
        }
      }
      for (const c of this.#civicsmith.filter((x) => x.kind === kind)) {
        const g = pass(civicView(c));
        if (g) return { ok: true, kind, guide: g, origin: "civicsmith", withheld };
      }
      return none(kind, withheld);
    } catch {
      return none(null);
    }
  }

  /** R8: `{kind?, state?, viewer, limit?}`: the guides the viewer may see, Civicsmith's first, then the group's in the
   *  order made; at most 200 (`limit` may lower it), `truncated` when more were held. Never throws. */
  guidesOf(args) {
    try {
      const { kind, state, viewer, limit } = argsOf(args);
      const n = capOf(limit);
      const kindOk = kind === undefined || kind === null || GUIDE_KINDS.includes(kind);
      const stateOk = state === undefined || state === null || GUIDE_STATES.includes(state);
      if (!kindOk || !stateOk) return { ok: true, guides: [], truncated: false };
      const civic = this.#civicsmith.filter((g) => (kind == null || g.kind === kind) && (state == null || g.state === state)).map(civicView);
      let group = [];
      if (this.#seesGroup(viewer)) {
        const where = [], a = [];
        if (kind != null) { where.push("kind=?"); a.push(kind); }
        if (state != null) { where.push("state=?"); a.push(state); }
        group = this.#rows(`SELECT * FROM reading_guides ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
                            ORDER BY created_at, guide_id LIMIT ?`, ...a, n + 1).map(viewOf);
      }
      const all = [...civic, ...group];
      return { ok: true, guides: all.slice(0, n), truncated: all.length > n };
    } catch {
      return { ok: true, guides: [], truncated: false };
    }
  }

  /** R3, R7: one guide the viewer may see, with its history in the order written (`{act, state, by, reason, at}`), or
   *  `NO_SUCH_GUIDE`. Civicsmith's carry no history here. */
  guideRead(args) {
    const { guide, viewer } = argsOf(args);
    const c = isGuideId(guide) ? this.#civic(guide) : null;
    if (c) return { ok: true, guide: civicView(c), history: [] };
    const row = this.#seesGroup(viewer) ? this.#held(guide) : null;
    if (!row) return noSuchGuide(guide);
    const history = this.#rows(`SELECT act, state, by_member, reason, at FROM reading_guide_history WHERE guide_id=? ORDER BY seq`, row.guide_id)
      .map((h) => ({ act: h.act, state: h.state, by: h.by_member, reason: h.reason ?? null, at: h.at }));
    return { ok: true, guide: viewOf(row), history };
  }
}

/* ================================================================ views */

function viewOf(r) {
  return { id: r.guide_id, kind: r.kind, origin: r.origin, items: safeJson(r.items_json), state: r.state, author: r.author,
           reviewed_by: r.reviewed_by ?? null, based_on: r.based_on ?? null, offered_by: r.offered_by ?? null };
}

function civicView(g) {
  return { id: g.id, kind: g.kind, origin: "civicsmith", items: g.items.map((it) => ({ ...it })), state: g.state, author: g.author,
           reviewed_by: g.reviewed_by, based_on: g.based_on ?? null, approved_by: g.approved_by,
           measured_use: { ...g.measured_use } };
}

const capOf = (limit) => (Number.isInteger(limit) && limit >= 1 && limit < GUIDES_MAX ? limit : GUIDES_MAX);

/* ================================================================ refusals minted at one site each (DEC-49) */

/* R2, R3, R6, R7: every act on a guide is an active member's. */
function memberRefusal(act) {
  /* DEC-49 REGION is-guide-member */
  return refusal("GUIDE_MEMBER_ACT", `${act} is an active member's act; an assistant may propose a guide for a member `
    + "to take up. Nothing was written.");
  /* END DEC-49 REGION is-guide-member */
}

function kindRefusal(kind) {
  /* DEC-49 REGION is-guide-kind */
  return refusal("GUIDE_KIND_UNKNOWN", `a reading guide is for one of these kinds of document: ${GUIDE_KINDS.join(", ")}. `
    + "Nothing was written.", { kind: typeof kind === "string" ? kind.slice(0, 100) : null });
  /* END DEC-49 REGION is-guide-kind */
}

function noSuchGuide(id) {
  /* DEC-49 REGION is-guide-held */
  return refusal("NO_SUCH_GUIDE", "no reading guide you can see answers to that id. Nothing was written.",
    { guide: typeof id === "string" ? id.slice(0, 100) : null });
  /* END DEC-49 REGION is-guide-held */
}

function readOnly(id) {
  /* DEC-49 REGION is-guide-ours */
  return refusal("GUIDE_READ_ONLY", `${id} comes with every copy of Civicsmith and no group can change it. Nothing was written.`,
    { guide: id });
  /* END DEC-49 REGION is-guide-ours */
}

function retiredRefusal(id) {
  /* DEC-49 REGION is-guide-live */
  return refusal("GUIDE_RETIRED", `${id} has been retired. Nothing was written.`, { guide: id });
  /* END DEC-49 REGION is-guide-live */
}

/* R3, R7: a reason, required for a refusal and a retirement, at most 500 characters wherever given. */
function reasonRefusal(why, required) {
  /* DEC-49 REGION is-guide-reason */
  if ((required && !why) || why.length > REASON_MAX)
    return refusal("GUIDE_REASON_MISSING", `a reason is given in at most ${REASON_MAX} characters. Nothing was written.`);
  /* END DEC-49 REGION is-guide-reason */
  return null;
}

/* R6: only the group's guide is offered. */
function offerable(row) {
  /* DEC-49 REGION is-guide-offerable */
  if (row.state !== "group")
    return refusal("GUIDE_NOT_OFFERABLE", `${row.guide_id} is not yet the group's. Nothing was sent.`, { guide: row.guide_id });
  /* END DEC-49 REGION is-guide-offerable */
  return null;
}

function slugRefusal() {
  /* DEC-49 REGION is-guide-slug */
  return refusal("GUIDE_NO_GROUP_SLUG", "no group slug is recorded, so an offer cannot be labelled. Nothing was sent.");
  /* END DEC-49 REGION is-guide-slug */
}

/** The ops whose handlers are this module's (K3): the control plane routes, authenticates and stamps them (`by` in the
 *  body; `viewer` in the URL, read after the body so a body cannot set it). `plane` composes them, once
 *  `op-declarations` declares them (their L11 jobs). */
export function readingGuidesOps(s, url, body) {
  const qp = (k) => url.searchParams.get(k);
  const b = isObj(body) ? body : {};
  return {
    guidedraft: () => s.guideDraft(b),
    guidepropose: () => s.guidePropose(b),
    guidereview: () => s.guideReview(b),
    guideretire: () => s.guideRetire(b),
    guideoffer: () => s.guideOffer(b),
    guideadopt: () => s.guideAdopt(b),
    guideproposetocivicsmith: () => s.guideProposeToCivicsmith(b),
    guidefor: () => s.guideFor({ kind: qp("kind") ?? b.kind, viewer: qp("viewer") }),
    guides: () => s.guidesOf({ kind: qp("kind") ?? b.kind, state: qp("state") ?? b.state, viewer: qp("viewer") }),
    guide: () => s.guideRead({ guide: qp("guide") ?? b.guide, viewer: qp("viewer") }),
    guideproposals: () => s.guideProposals({ kind: qp("kind") ?? b.kind, viewer: qp("viewer") }),
  };
}

const instances = new WeakMap();

/** K61: the one instance per host, created on the first call with `deps`. Its tables are created with it and declared
 *  with their classes (R9, record-core R21). */
export function readingGuidesOf(host, deps) {
  let s = instances.get(host);
  if (!s) {
    const d = deps || {};
    const storage = d.storage || host.storage;
    const record = d.record || recordOf(host);
    const membership = d.membership || membershipOf(host, { record });
    s = new ReadingGuides({ ...d, storage, record, membership });
    instances.set(host, s);
    record.declareTable("reading-guides", READING_GUIDES_TABLE_CLASSES.map((e) => ({ ...e, keys: [...e.keys] })));
  }
  return s;
}
