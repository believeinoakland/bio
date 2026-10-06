/* standards — law relations, court links and treatment rows held as data, the reads over them, the citation resolver
 * and the connection owner (requirements: `build/requirements/standards.md`, R20's relation bound, R22–R28, R30; D192,
 * D134; K1443, K1446, K1449, K1486).
 *
 * Everything here is a member's act or a read (R30, K1443): a relation, link or treatment is recorded only by a named
 * member, with the passage that makes it and the member's reason, and never edited or deleted (R14): it is withdrawn,
 * kept with who, when and why. A machine's suggestion of one is a proposal, stored apart, which moves no answer until a
 * member records the row naming it. Temporal and referential relations are two closed sets, never mixed in one list or
 * read (R22). Rows are keyed by ids of their own (`lrel-`, `clink-`, `ctreat-`, `lprop-` and 24 hex characters), not
 * record ids: they are rows of this module's tables, not record documents.
 *
 * REACHED through the `Standards` instance (`./index.mjs`), which constructs `LawRecords` with its internal reads. */
import { isMachineIdentity } from "../record-grammar/actors.mjs";
import { sha256HexSync, BASIS_GRADES } from "../record-grammar/index.mjs";
import { proposalLabel } from "../record-grammar/labels.mjs";
import { BOUNDS, LOWEST_GRADE, derivedId, isRecordId } from "../connection-grammar/index.mjs";
import { validAt } from "../civil-time/index.mjs";
import { recogniseCitations } from "../idspaces.mjs";
import { STANDARDS_CHECKS, refusal } from "./checks.mjs";

/** R22: the two closed sets of relation types, kept apart. */
export const LAW_RELATIONS = Object.freeze({
  temporal: Object.freeze(["amends", "repeals", "renumbers", "recodifies"]),
  referential: Object.freeze(["refers_to", "defines", "excepts", "implements"]),
});
/** R26: the court links; R27: the treatments, and those that end a decision's standing. */
export const COURT_LINKS = Object.freeze(["interprets", "applies", "holds_invalid"]);
export const TREATMENTS = Object.freeze(["reversed", "vacated", "depublished", "overruled", "affirmed"]);
const ENDING = Object.freeze(["reversed", "vacated", "depublished", "overruled"]);
/** R24: the temporal relations that move a provision to another address. */
const MOVES = Object.freeze(["renumbers", "recodifies"]);
const LINK_TARGET_KINDS = Object.freeze(["statute", "regulation", "ordinance"]);

/** R28: the connection kinds this module owns, each with its members' word (K1486). Names of their own, because
 *  `events` holds `amends` (KIND_TAKEN; K1521). */
export const CONNECTION_KINDS = Object.freeze([
  ...LAW_RELATIONS.temporal.map((t) => ({ kind: `law_${t}`, word: { amends: "amends", repeals: "repeals",
    renumbers: "renumbers", recodifies: "recodifies" }[t], class: "evidentiary" })),
  ...LAW_RELATIONS.referential.map((t) => ({ kind: `law_${t}`, word: { refers_to: "refers to", defines: "defines a term of",
    excepts: "makes an exception to", implements: "implements" }[t], class: "evidentiary" })),
  ...COURT_LINKS.map((t) => ({ kind: `court_${t}`, word: { interprets: "interprets", applies: "applies",
    holds_invalid: "holds invalid" }[t], class: "evidentiary" })),
  { kind: "in_force_at_event", word: "was in force on the date of", class: "derived" },
].map((k) => Object.freeze(k)));
export const CONNECTION_OWNER = "standards";
/** R28: the method a derived "in force at an event's date" item names: R20's read. */
export const IN_FORCE_METHOD = "standards.inForceAt (R20): civil-time.validAt over the version's period at the event's date";

const REASON_MAX = 2000, WHY_MAX = 240, PATH_MAX = 200, LIMIT_MAX = 500, LIMIT_DEFAULT = 100, SCAN_MAX = 2000;
const RELATE_KEYS = Object.freeze(["type", "from", "to", "citation", "effective", "reason", "author", "viewer", "proposal"]);
const LINK_KEYS = Object.freeze(["type", "from", "to", "citation", "reason", "author", "viewer", "proposal"]);
const TREAT_KEYS = Object.freeze(["decision", "treatment", "by_decision", "citation", "reason", "author", "viewer", "proposal"]);
const PROPOSAL_FIELDS = Object.freeze({ relation: RELATE_KEYS, link: LINK_KEYS, treatment: TREAT_KEYS });

const str = (v) => (typeof v === "string" ? v.trim() : "");
const isObj = (v) => !!v && typeof v === "object" && !Array.isArray(v);
const isDay = (v) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)
  && new Date(`${v}T00:00:00Z`).toISOString().slice(0, 10) === v;
const dayBefore = (d) => new Date(Date.parse(`${d}T00:00:00Z`) - 86400000).toISOString().slice(0, 10);
const safeJson = (s) => { try { return s == null ? null : JSON.parse(s); } catch { return null; } };
const rankOf = (g) => BASIS_GRADES.indexOf(g);
/* The weaker of two grade letters (BASIS_GRADES is strongest first). */
const weaker = (a, b) => (rankOf(a) >= rankOf(b) ? a : b);

/* R1's reason, as R23, R26 and R27 ask it (DEC-88): a string with something in it, at most 2,000 characters. */
const reasonFault = (r) => (typeof r !== "string" || !r.trim() ? "carries no reason" : [...r].length > REASON_MAX
  ? `carries a reason over the ${REASON_MAX} characters kept` : null);

/* ---- the refusals several acts answer, each minted at one site (DEC-49) ---- */

function machineRelate(author) {
  /* DEC-49 REGION is-law-member */
  if (str(author) && !isMachineIdentity(str(author))) return null;
  return refusal("MACHINE_CANNOT_RELATE", "recording a law relation, court link or treatment is a named member's act; a "
                 + "machine proposes one (lawPropose). Nothing was written.");
  /* END DEC-49 REGION is-law-member */
}

function refuseRelationUnknown(type, allowed) {
  /* DEC-49 REGION is-law-relation-type */
  return refusal("LAW_RELATION_UNKNOWN", `the types this act records are ${allowed.join(", ")}. Nothing was written.`,
                 { type: typeof type === "string" ? type.slice(0, 40) : null, types: [...allowed] });
  /* END DEC-49 REGION is-law-relation-type */
}

function refuseNoCitation(of, citation) {
  /* DEC-49 REGION is-law-relation-cited */
  return refusal("LAW_RELATION_NO_CITATION", `the citation is a content id among the text of ${of}, the passage that makes `
                 + "this row, which you may read. Nothing was written.",
                 { standard: of, citation: typeof citation === "string" ? citation.slice(0, 80) : null });
  /* END DEC-49 REGION is-law-relation-cited */
}

function refuseNotCourt(end, standard, kind) {
  /* DEC-49 REGION is-court-standard */
  return refusal("NOT_A_COURT_STANDARD", `${standard} is a ${kind} standard, not a court decision or order. Nothing was `
                 + "written.", { end, standard, kind });
  /* END DEC-49 REGION is-court-standard */
}

/* An end as given: a standard id, or `{standard, portion?}`. */
function endOf(v) {
  if (typeof v === "string") return { standard: v.trim(), portion: null };
  if (isObj(v)) return { standard: str(v.standard), portion: v.portion == null || v.portion === "" ? null : String(v.portion) };
  return { standard: "", portion: null };
}

/* R23: a temporal relation's effective date or enactment event: `YYYY-MM-DD`, `{date}` or `{event, edge}`. */
function effectiveOf(v) {
  if (isDay(v)) return { date: v, event: null, edge: null };
  if (isObj(v) && isDay(v.date) && v.event == null) return { date: v.date, event: null, edge: null };
  if (isObj(v) && v.date == null && typeof v.event === "string" && /^EVT-/.test(v.event) && isRecordId(v.event)
      && (v.edge === "start" || v.edge === "end")) return { date: null, event: v.event, edge: v.edge };
  return null;
}

export class LawRecords {
  /** `k`: the standards instance's internal reads (`./index.mjs`). */
  constructor(k) { this.k = k; }

  #id(prefix, fields) {
    return `${prefix}-${sha256HexSync(JSON.stringify({ ...fields, nonce: this.k.nonce() })).slice(0, 24)}`;
  }

  /* NO_SUCH_STANDARD (R17) for an end the viewer may not read, else the row. A viewer never sent is an internal
     caller, which sight does not ask (membership's terms); a viewer the record admits to nothing reads nothing. */
  #held(id, viewer, end) {
    const row = this.k.row(id);
    if (!row || (viewer != null && !this.k.readable(id, viewer))) return { refused: this.k.noSuchStandard(id || null, { id: id || null, end }) };
    return { row };
  }

  /* A citation that is one of `standardId`'s text passages and that the viewer may read. */
  #cited(standardId, citation, viewer) {
    if (typeof citation !== "string" || !citation.trim()) return false;
    if (!this.k.texts(standardId).includes(citation.trim())) return false;
    const c = this.k.content().contentRow(citation.trim());
    return !!c && (viewer == null || this.k.membership.inSight(c.bundle_id, viewer));
  }

  /* A proposal named by an adoption: held, of this kind, not yet adopted; its fields, or a refusal. */
  #proposalFor(id, what) {
    if (id == null || id === "") return { fields: {}, id: null };
    const p = this.k.one(`SELECT * FROM law_proposals WHERE proposal_id=? AND what=?`, String(id), what);
    if (!p) return { refused: this.k.refuseNoSuchProposal(String(id).slice(0, 80)) };
    const held = this.#adoption(p.proposal_id);
    if (held) return { refused: this.k.refuseProposalAdopted(p.proposal_id, held) };
    return { fields: safeJson(p.fields_json) || {}, id: p.proposal_id };
  }

  #adoption(proposalId) {
    for (const [t, col] of [["law_relations", "relation_id"], ["court_links", "link_id"], ["court_treatments", "treatment_id"]]) {
      const r = this.k.one(`SELECT ${col} AS id FROM ${t} WHERE proposal_id=?`, proposalId);
      if (r) return r.id;
    }
    return null;
  }

  /* A member's act over a proposal's fields: each field the member does not state is the proposal's. */
  #merge(a, what) {
    const p = this.#proposalFor(a.proposal, what);
    if (p.refused) return p;
    const out = { ...a };
    const taken = [];
    for (const [f, v] of Object.entries(p.fields)) if (out[f] == null || out[f] === "") { out[f] = v; taken.push(f); }
    return { args: out, proposal: p.id, taken };
  }

  /* ===================================================================== *
   * R23: A LAW RELATION, BY A MEMBER'S ACT
   * ===================================================================== */

  lawRelate(args = {}) {
    const a0 = isObj(args) ? args : {};
    const byMachine = machineRelate(a0.author);
    if (byMachine) return byMachine;
    const unknown = this.k.refuseFieldUnknown(a0, RELATE_KEYS);
    if (unknown) return unknown;
    const m = this.#merge(a0, "relation");
    if (m.refused) return m.refused;
    const r = this.#relateRefusal(m.args);
    if (r.ok === false) return r;
    return this.k.record.transact(() => {
      const at = this.k.when();
      const f = r.fields;
      const id = this.#id("lrel", { ...f, at });
      this.k.sql.exec(`INSERT INTO law_relations (relation_id, type, class, from_standard, from_portion, to_standard,
                         to_portion, citation, effective_date, effective_event, effective_edge, proposal_id, reason, author, at)
                       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                      id, f.type, f.cls, f.from.standard, f.from.portion, f.to.standard, f.to.portion, f.citation,
                      f.effective ? f.effective.date : null, f.effective ? f.effective.event : null,
                      f.effective ? f.effective.edge : null, m.proposal, f.reason, str(a0.author), at);
      return { ok: true, relation: this.#relationAnswer(this.k.one(`SELECT * FROM law_relations WHERE relation_id=?`, id)),
               ...(m.proposal ? { adopted: { proposal: m.proposal, from_proposal: m.taken } } : {}) };
    });
  }

  /* R23's refusals after the author, in order; `{ok: true, fields}` when none applies. */
  #relateRefusal(a) {
    const type = a.type;
    const cls = LAW_RELATIONS.temporal.includes(type) ? "temporal" : LAW_RELATIONS.referential.includes(type) ? "referential" : null;
    if (!cls) return refuseRelationUnknown(type, [...LAW_RELATIONS.temporal, ...LAW_RELATIONS.referential]);
    const viewer = a.viewer ?? null;
    const from = endOf(a.from), to = endOf(a.to);
    const f = this.#held(from.standard, viewer, "from");
    if (f.refused) return f.refused;
    const t = this.#held(to.standard, viewer, "to");
    if (t.refused) return t.refused;
    for (const [end, e, row] of [["from", from, f.row], ["to", to, t.row]])
      if (e.portion !== null && e.portion !== row.portion_path) return this.k.portionUnknown(end, e.standard, e.portion);
    /* DEC-49 REGION is-relation-two-ends */
    if (from.standard === to.standard && from.portion === to.portion)
      return refusal("LAW_RELATION_SELF", "both ends name the same standard and portion. Nothing was written.",
                     { standard: from.standard, portion: from.portion });
    /* END DEC-49 REGION is-relation-two-ends */
    if (!this.#cited(from.standard, a.citation, viewer)) return refuseNoCitation(from.standard, a.citation);
    let effective = null;
    if (cls === "temporal") {
      effective = effectiveOf(a.effective);
      /* DEC-49 REGION is-temporal-effective */
      if (!effective)
        return refusal("LAW_RELATION_NO_EFFECTIVE", "a temporal relation takes effect on a date (YYYY-MM-DD) or at an "
                       + "enactment event ({event: EVT-…, edge: start or end}). Nothing was written.");
      /* END DEC-49 REGION is-temporal-effective */
    }
    const fault = reasonFault(a.reason);
    if (fault) return this.k.refuseReason(fault);
    return { ok: true, fields: { type, cls, from, to, citation: a.citation.trim(), effective, reason: a.reason } };
  }

  #relationAnswer(r) {
    const w = this.#withdrawal(r.relation_id);
    return { id: r.relation_id, type: r.type, class: r.class,
             from: { standard: r.from_standard, portion: r.from_portion ?? null },
             to: { standard: r.to_standard, portion: r.to_portion ?? null }, citation: r.citation,
             effective: r.class === "temporal" ? (r.effective_event ? { event: r.effective_event, edge: r.effective_edge }
                                                                    : { date: r.effective_date }) : null,
             reason: r.reason, by: r.author, at: r.at, proposal: r.proposal_id ?? null,
             withdrawn: w ? { by: w.withdrawn_by, at: w.withdrawn_at, reason: w.reason } : null };
  }

  #withdrawal(id) { return this.k.one(`SELECT * FROM law_withdrawals WHERE item_id=?`, id); }

  /** R22, R23: the relations a standard is an end of, temporal and referential in two lists, never mixed; a relation
   *  whose passage the viewer may not read is neither answered nor counted. Withdrawn ones are answered, marked. */
  lawRelationsOf({ standard = null, viewer = null } = {}) {
    const id = str(standard);
    if (!id) return this.k.refuseNoId("lawrelations");
    const h = this.#held(id, viewer, "standard");
    if (h.refused) return h.refused;
    const rows = this.k.rows(`SELECT * FROM law_relations WHERE from_standard=? OR to_standard=? ORDER BY relation_id
                              LIMIT ?`, id, id, SCAN_MAX + 1);
    const seen = rows.slice(0, SCAN_MAX).filter((r) => this.#sees(r.citation, viewer)).map((r) => ({
      ...this.#relationAnswer(r), direction: r.from_standard === id ? "out" : "in" }));
    return { ok: true, standard: id, temporal: seen.filter((r) => r.class === "temporal"),
             referential: seen.filter((r) => r.class === "referential"), truncated: rows.length > SCAN_MAX,
             says: "temporal relations (amends, repeals, renumbers, recodifies) and referential ones (refers to, defines, "
                 + "excepts, implements) are kept apart and never read as one list (D192)" };
  }

  #sees(contentId, viewer) {
    const c = this.k.content().contentRow(contentId);
    return !!c && (viewer == null || this.k.membership.inSight(c.bundle_id, viewer));
  }

  /** R23, R26, R27: withdraw a relation, link or treatment, kept with who, when and why. */
  lawWithdraw({ relation = null, reason = null, author = null } = {}) {
    const byMachine = machineRelate(author);
    if (byMachine) return byMachine;
    const id = str(relation);
    const table = id.startsWith("lrel-") ? ["law_relations", "relation_id"] : id.startsWith("clink-") ? ["court_links", "link_id"]
      : id.startsWith("ctreat-") ? ["court_treatments", "treatment_id"] : null;
    const held = table ? this.k.one(`SELECT 1 AS x FROM ${table[0]} WHERE ${table[1]}=?`, id) : null;
    /* DEC-49 REGION is-law-item-held */
    if (!held)
      return refusal("NO_SUCH_LAW_ITEM", "no law relation, court link or treatment answers to that id here. Nothing was "
                     + "written.", { relation: id || null });
    /* END DEC-49 REGION is-law-item-held */
    const fault = reasonFault(reason);
    if (fault) return this.k.refuseReason(fault);
    const w = this.#withdrawal(id);
    if (w) return { ok: true, already: true, relation: id, withdrawn: { by: w.withdrawn_by, at: w.withdrawn_at, reason: w.reason } };
    return this.k.record.transact(() => {
      const at = this.k.when();
      this.k.sql.exec(`INSERT INTO law_withdrawals (item_id, reason, withdrawn_by, withdrawn_at) VALUES (?,?,?,?)`,
                      id, reason, str(author), at);
      return { ok: true, relation: id, withdrawn: { by: str(author), at, reason },
               says: "withdrawn, never deleted: the row stays, read as withdrawn, and moves no answer" };
    });
  }

  /** R23, R26, R27, R30: a suggestion of a relation, link or treatment, stored apart, labelled with who proposed it and
   *  whether it is machine work. It moves no answer: only a member's act naming it (`proposal`) records a row. */
  lawPropose(args = {}) {
    const a = isObj(args) ? args : {};
    const what = a.what;
    if (!Object.hasOwn(PROPOSAL_FIELDS, what ?? "")) return refuseRelationUnknown(what, Object.keys(PROPOSAL_FIELDS));
    const keys = [...PROPOSAL_FIELDS[what].filter((k) => !["author", "viewer", "proposal", "reason"].includes(k)), "what",
                  "why", "proposer", "viewer"];
    const unknown = this.k.refuseFieldUnknown(a, keys);
    if (unknown) return unknown;
    const who = str(a.proposer);
    if (!who) return this.k.refuseProposerUnnamed();
    const why = str(a.why);
    if (!why || why.length > WHY_MAX) return this.k.refuseWhyInvalid();
    const fields = Object.fromEntries(Object.entries(a).filter(([k]) => !["what", "why", "proposer", "viewer"].includes(k)));
    return this.k.record.transact(() => {
      const at = this.k.when();
      const id = this.#id("lprop", { what, fields, at });
      this.k.sql.exec(`INSERT INTO law_proposals (proposal_id, what, fields_json, why, proposed_by, proposed_at)
                       VALUES (?,?,?,?,?,?)`, id, what, JSON.stringify(fields), why, who, at);
      const label = proposalLabel(who, "standard");
      return { ok: true, proposal: { id, what, fields, why, at, by: label.by, state: label.state,
                                     machine_work: label.machine_work, adopted_as: null },
               recorded: false,
               says: `this is a proposal of a ${what} and not one: it moves no answer, and nothing is recorded until a `
                   + "member records it naming this proposal" };
    });
  }

  /* ===================================================================== *
   * R26, R27: COURT LINKS AND TREATMENT ROWS
   * ===================================================================== */

  courtLink(args = {}) {
    const a0 = isObj(args) ? args : {};
    const byMachine = machineRelate(a0.author);
    if (byMachine) return byMachine;
    const unknown = this.k.refuseFieldUnknown(a0, LINK_KEYS);
    if (unknown) return unknown;
    const m = this.#merge(a0, "link");
    if (m.refused) return m.refused;
    const r = this.#linkRefusal(m.args);
    if (r.ok === false) return r;
    return this.k.record.transact(() => {
      const at = this.k.when();
      const f = r.fields;
      const id = this.#id("clink", { ...f, at });
      this.k.sql.exec(`INSERT INTO court_links (link_id, type, from_standard, to_standard, to_portion, citation, proposal_id,
                         reason, author, at) VALUES (?,?,?,?,?,?,?,?,?,?)`,
                      id, f.type, f.from, f.to.standard, f.to.portion, f.citation, m.proposal, f.reason, str(a0.author), at);
      return { ok: true, link: this.#linkAnswer(this.k.one(`SELECT * FROM court_links WHERE link_id=?`, id)),
               ...(m.proposal ? { adopted: { proposal: m.proposal, from_proposal: m.taken } } : {}) };
    });
  }

  #linkRefusal(a) {
    if (!COURT_LINKS.includes(a.type)) return refuseRelationUnknown(a.type, COURT_LINKS);
    const viewer = a.viewer ?? null;
    const from = endOf(a.from), to = endOf(a.to);
    const f = this.#held(from.standard, viewer, "from");
    if (f.refused) return f.refused;
    const t = this.#held(to.standard, viewer, "to");
    if (t.refused) return t.refused;
    if (f.row.kind !== "court") return refuseNotCourt("from", from.standard, f.row.kind);
    /* DEC-49 REGION is-link-target-law */
    if (!LINK_TARGET_KINDS.includes(t.row.kind))
      return refusal("COURT_LINK_TARGET_NOT_LAW", `${to.standard} is a ${t.row.kind} standard; a court link ends at a `
                     + `${LINK_TARGET_KINDS.join(", ")}. Nothing was written.`, { standard: to.standard, kind: t.row.kind });
    /* END DEC-49 REGION is-link-target-law */
    if (to.portion !== null && to.portion !== t.row.portion_path) return this.k.portionUnknown("to", to.standard, to.portion);
    if (!this.#cited(from.standard, a.citation, viewer)) return refuseNoCitation(from.standard, a.citation);
    const fault = reasonFault(a.reason);
    if (fault) return this.k.refuseReason(fault);
    return { ok: true, fields: { type: a.type, from: from.standard, to, citation: a.citation.trim(), reason: a.reason } };
  }

  #linkAnswer(r) {
    const w = this.#withdrawal(r.link_id);
    return { id: r.link_id, type: r.type, from: { standard: r.from_standard },
             to: { standard: r.to_standard, portion: r.to_portion ?? null }, citation: r.citation, reason: r.reason,
             by: r.author, at: r.at, proposal: r.proposal_id ?? null,
             withdrawn: w ? { by: w.withdrawn_by, at: w.withdrawn_at, reason: w.reason } : null };
  }

  courtTreat(args = {}) {
    const a0 = isObj(args) ? args : {};
    const byMachine = machineRelate(a0.author);
    if (byMachine) return byMachine;
    const unknown = this.k.refuseFieldUnknown(a0, TREAT_KEYS);
    if (unknown) return unknown;
    const m = this.#merge(a0, "treatment");
    if (m.refused) return m.refused;
    const r = this.#treatRefusal(m.args);
    if (r.ok === false) return r;
    return this.k.record.transact(() => {
      const at = this.k.when();
      const f = r.fields;
      const id = this.#id("ctreat", { ...f, at });
      this.k.sql.exec(`INSERT INTO court_treatments (treatment_id, decision, treatment, by_decision, citation, proposal_id,
                         reason, author, at) VALUES (?,?,?,?,?,?,?,?,?)`,
                      id, f.decision, f.treatment, f.by, f.citation, m.proposal, f.reason, str(a0.author), at);
      return { ok: true, treatment: this.#treatAnswer(this.k.one(`SELECT * FROM court_treatments WHERE treatment_id=?`, id)),
               ...(m.proposal ? { adopted: { proposal: m.proposal, from_proposal: m.taken } } : {}) };
    });
  }

  #treatRefusal(a) {
    /* DEC-49 REGION is-treatment-known */
    if (!TREATMENTS.includes(a.treatment))
      return refusal("TREATMENT_UNKNOWN", `a treatment is one of ${TREATMENTS.join(", ")}. Nothing was written.`,
                     { treatment: typeof a.treatment === "string" ? a.treatment.slice(0, 40) : null,
                       treatments: [...TREATMENTS] });
    /* END DEC-49 REGION is-treatment-known */
    const viewer = a.viewer ?? null;
    const decision = str(a.decision), by = str(a.by_decision);
    const d = this.#held(decision, viewer, "decision");
    if (d.refused) return d.refused;
    const b = this.#held(by, viewer, "by_decision");
    if (b.refused) return b.refused;
    if (d.row.kind !== "court") return refuseNotCourt("decision", decision, d.row.kind);
    if (b.row.kind !== "court") return refuseNotCourt("by_decision", by, b.row.kind);
    /* DEC-49 REGION is-relation-two-ends */
    if (decision === by)
      return refusal("LAW_RELATION_SELF", "a decision is treated by a later decision, and both named are the same. Nothing "
                     + "was written.", { standard: decision, portion: null });
    /* END DEC-49 REGION is-relation-two-ends */
    if (!this.#cited(by, a.citation, viewer)) return refuseNoCitation(by, a.citation);
    const fault = reasonFault(a.reason);
    if (fault) return this.k.refuseReason(fault);
    return { ok: true, fields: { decision, treatment: a.treatment, by, citation: a.citation.trim(), reason: a.reason } };
  }

  #treatAnswer(r) {
    const w = this.#withdrawal(r.treatment_id);
    return { id: r.treatment_id, decision: r.decision, treatment: r.treatment, by_decision: r.by_decision,
             citation: r.citation, reason: r.reason, by: r.author, at: r.at, proposal: r.proposal_id ?? null,
             withdrawn: w ? { by: w.withdrawn_by, at: w.withdrawn_at, reason: w.reason } : null };
  }

  /** R27: whether a decision still stood on a date: `not_standing` on a held ending treatment effective (the later
   *  decision's stated start) on or before `date`; `standing` on a held affirmance so effective and no ending one;
   *  otherwise `undetermined`, saying the later history is not read. Never a default of standing. Writes nothing. */
  stillStanding({ decision = null, date = null, viewer = null } = {}) {
    const id = str(decision);
    if (!id) return this.k.refuseNoId("stillstanding");
    if (!isDay(date)) return this.k.refuseDateInvalid(date);
    const h = this.#held(id, viewer, "decision");
    if (h.refused) return h.refused;
    if (h.row.kind !== "court") return refuseNotCourt("decision", id, h.row.kind);
    const rows = this.k.rows(`SELECT t.* FROM court_treatments t WHERE t.decision=? AND NOT EXISTS
                                (SELECT 1 FROM law_withdrawals w WHERE w.item_id=t.treatment_id) ORDER BY t.treatment_id`, id)
      .filter((t) => this.#sees(t.citation, viewer));
    const eff = (t) => { const b = this.k.row(t.by_decision); return b ? b.period_from ?? null : null; };
    const ending = rows.filter((t) => ENDING.includes(t.treatment));
    const ended = ending.filter((t) => eff(t) !== null && eff(t) <= date);
    const base = { ok: true, decision: id, date, treatments: rows.map((t) => ({ ...this.#treatAnswer(t), effective: eff(t) })) };
    if (ended.length)
      return { ...base, state: "not_standing", by: ended.map((t) => t.treatment_id),
               why: ended.map((t) => `${t.by_decision} ${t.treatment} it, effective ${eff(t)}`).join("; ") };
    const unsure = ending.filter((t) => eff(t) === null);
    if (unsure.length)
      return { ...base, state: "undetermined", by: unsure.map((t) => t.treatment_id),
               why: unsure.map((t) => `${t.by_decision} ${t.treatment} it, and the record does not state when`).join("; ") };
    const affirmed = rows.filter((t) => t.treatment === "affirmed" && eff(t) !== null && eff(t) <= date);
    if (affirmed.length)
      return { ...base, state: "standing", by: affirmed.map((t) => t.treatment_id),
               why: `affirmed by ${affirmed.map((t) => t.by_decision).join(", ")} on or before ${date}, and no reversal, `
                  + "vacatur, depublication or overruling effective by then is held" };
    return { ...base, state: "undetermined", by: [],
             why: `the record holds no treatment of ${id} effective by ${date}: its later history is not read, so whether `
                + "it still stood is undetermined, never assumed" };
  }

  /* ===================================================================== *
   * R20's relation bound; R24: RECODIFICATION ACROSS ADDRESSES
   * ===================================================================== */

  /** R20: the adopted temporal relations that end `standardId`'s period, each with its effective date or event. */
  boundsOn(standardId) {
    return this.k.rows(`SELECT r.* FROM law_relations r WHERE r.to_standard=? AND r.class='temporal' AND NOT EXISTS
                          (SELECT 1 FROM law_withdrawals w WHERE w.item_id=r.relation_id) ORDER BY r.relation_id`, standardId);
  }

  /** R24: every key and portion the provision has been held under, following adopted `renumbers` and `recodifies`
   *  relations both ways, bounded by connection-grammar's default depth. Never throws. */
  addressesOf({ key = null, portion = null, viewer = null } = {}) {
    try {
      const k = str(key);
      if (!k) return this.k.refuseNoId("addresses");
      const p = portion == null || portion === "" ? null : String(portion);
      const start = this.k.rows(`SELECT standard_id FROM standards WHERE instrument=? ${p !== null ? "AND portion_path=?" : ""}
                                 ORDER BY standard_id`, ...(p !== null ? [k, p] : [k])).map((r) => r.standard_id);
      const seen = new Set(start), out = [];
      let frontier = start, depth = 0, truncated = false;
      while (frontier.length) {
        if (depth >= BOUNDS.depth_default) { truncated = true; break; }
        depth++;
        const next = [];
        for (const id of frontier) {
          const rels = this.k.rows(`SELECT r.* FROM law_relations r WHERE (r.from_standard=? OR r.to_standard=?) AND r.type IN
                                      ('renumbers','recodifies') AND NOT EXISTS (SELECT 1 FROM law_withdrawals w
                                      WHERE w.item_id=r.relation_id) ORDER BY r.relation_id`, id, id);
          for (const r of rels) {
            if (viewer != null && !this.#sees(r.citation, viewer)) continue;
            const other = r.from_standard === id ? r.to_standard : r.from_standard;
            if (seen.has(other)) continue;
            seen.add(other);
            next.push(other);
            const o = this.k.row(other);
            out.push({ standard: other, key: o ? o.instrument ?? null : null, portion: o ? o.portion_path ?? null : null,
                       via: { relation: r.relation_id, type: r.type,
                              effective: r.effective_event ? { event: r.effective_event, edge: r.effective_edge }
                                                           : { date: r.effective_date } }, depth });
          }
        }
        frontier = next;
      }
      return { ok: true, key: k, portion: p, held_under: start, addresses: out, truncated,
               ...(truncated ? { why: `the chain of renumberings and recodifications runs past ${BOUNDS.depth_default} steps; `
                                    + "those past it are not followed" } : {}) };
    } catch {
      return { ok: true, key: str(key), portion: portion ?? null, addresses: [], truncated: true,
               why: "the addresses could not be read" };
    }
  }

  /* ===================================================================== *
   * R25: THE CITATION RESOLVER (COURTS C1; K1449)
   * ===================================================================== */

  /** R25: `verified` only when a held capture the viewer may see states the citation (volume, reporter and page): a
   *  passage of a `court` standard's text. Otherwise `not verified`, refusing nothing (D88). With `lookup: true` the
   *  keyed lookup's matches are added, labelled as the service's and never as verified; switched off, it says so. It
   *  writes nothing. */
  async resolveCourtCitation({ citation = null, viewer = null, lookup = false } = {}) {
    const read = typeof citation === "string" ? (this.k.recognise(citation).citations || [])[0] || null
      : isObj(citation) ? citation : null;
    const c = read && Number.isInteger(Number(read.volume)) && typeof read.reporter === "string"
      && Number.isInteger(Number(read.page)) ? { volume: Number(read.volume), reporter: read.reporter, page: Number(read.page) }
      : null;
    const base = { ok: true, citation: c, as_given: typeof citation === "string" ? citation.slice(0, 400) : citation ?? null };
    let answer;
    if (!c) {
      answer = { ...base, state: "not verified", verified: false, held: [],
                 why: "no court citation (volume, reporter and page) was read from what was given, so none is verified" };
    } else {
      const held = this.#statedIn(c, viewer);
      answer = held.found.length
        ? { ...base, state: "verified", verified: true, held: held.found,
            why: `a held capture states ${c.volume} ${c.reporter} ${c.page}: ${held.found.map((h) => h.standard).join(", ")}` }
        : { ...base, state: "not verified", verified: false, held: [],
            why: `no held capture you may see states ${c.volume} ${c.reporter} ${c.page}${held.truncated
              ? `; only the first ${SCAN_MAX} court standards were read` : ""}: whether the case exists is not decided here` };
    }
    if (!lookup) return { ...answer, lookup: null };
    const text = typeof citation === "string" ? citation : c ? `${c.volume} ${c.reporter} ${c.page}` : null;
    let l;
    try { l = text ? await this.k.citationLookup({ text, viewer }) : null; } catch { l = { ok: false, reason: "LOOKUP_FAILED" }; }
    if (!l || l.ok !== true)
      return { ...answer, lookup: { on: false, reason: l ? l.reason ?? null : "NO_TEXT",
                                    says: "the keyed citation lookup did not answer (it is switched off, holds no key, or "
                                        + "refused); this answer stands without it" } };
    return { ...answer, lookup: { on: true, service: l.service ?? null, citations: l.citations ?? [], verified: false,
                                  label: l.label ?? "the service's answer, never verified" } };
  }

  /* The court standards whose text passages state the citation, each with the capture and extent. */
  #statedIn(c, viewer) {
    const courts = this.k.rows(`SELECT standard_id FROM standards WHERE kind='court' ORDER BY standard_id LIMIT ?`, SCAN_MAX + 1);
    const found = [];
    for (const { standard_id: sid } of courts.slice(0, SCAN_MAX)) {
      for (const cid of this.k.texts(sid)) {
        const row = this.k.content().contentRow(cid);
        if (!row || !this.k.membership.inSight(row.bundle_id, viewer)) continue;
        const text = this.k.content().passageText(cid);
        if (typeof text !== "string") continue;
        const hit = (this.k.recognise(text).citations || []).find((x) => x.volume === c.volume && x.reporter === c.reporter
                                                                      && x.page === c.page);
        if (hit) found.push({ standard: sid, content_id: cid, capture_sha: row.capture_sha, bundle_id: row.bundle_id,
                              extent: { kind: row.extent_kind, ...(safeJson(row.extent) || {}) },
                              at: { start: hit.start, end: hit.end } });
      }
    }
    return { found, truncated: courts.length > SCAN_MAX };
  }

  /* ===================================================================== *
   * R28: THE CONNECTION OWNER
   * ===================================================================== */

  /** R28 (`connection-grammar` R6–R8): for a standard node, its relations and links valid at `at`; for an event node,
   *  the held standards in force at the event's `when` (R20), each a derived item. Sight: an evidentiary item is
   *  answered only when the viewer may read its passage; a derived one only when the viewer may read the event. */
  neighbours({ node = null, kinds = null, at = null, page = null, viewer, scope = null } = {}) {
    if (viewer === undefined || viewer === null || viewer === "")
      return { refused: "VIEWER_MISSING", why: "a read names the member reading; an absent viewer is neither an administrator nor the public" };
    const own = CONNECTION_KINDS.map((k) => k.kind);
    const asked = Array.isArray(kinds) ? kinds.filter((k) => own.includes(k)) : own;
    const id = typeof node === "string" ? node : "";
    const all = /^EVT-/.test(id) ? this.#eventItems(id, asked, viewer) : this.#standardItems(id, asked, viewer);
    const live = [];
    for (const item of all) {
      let v;
      try { v = validAt({ valid: item.valid }, at); } catch (e) { v = { undetermined: true, why: String(e?.message ?? e) }; }
      if (v === "out" || (v && v.refused)) continue;
      live.push(v === "in" ? item : { ...item, undetermined: { why: v.why || "undetermined at the date asked" } });
    }
    live.sort((x, y) => (x.id < y.id ? -1 : x.id > y.id ? 1 : 0));
    if (live.length > BOUNDS.hub)
      return { items: [], hub: { set_size: live.length, why: `this node has ${live.length} connections, more than the hub `
                                                             + `bound of ${BOUNDS.hub}; it is named, never expanded` } };
    const after = isObj(page) && typeof page.after === "string" ? page.after : null;
    const rest = after ? live.filter((i) => i.id > after) : live;
    const items = rest.slice(0, BOUNDS.fanout);
    return rest.length > BOUNDS.fanout ? { items, next: { after: items[items.length - 1].id }, truncated: true } : { items };
  }

  /* The relations and links with `id` at one end, not withdrawn, whose passage the viewer may read. */
  #standardItems(id, asked, viewer) {
    if (!this.k.row(id)) return [];
    const out = [];
    const rels = this.k.rows(`SELECT r.* FROM law_relations r WHERE (r.from_standard=? OR r.to_standard=?) AND NOT EXISTS
                                (SELECT 1 FROM law_withdrawals w WHERE w.item_id=r.relation_id)`, id, id);
    for (const r of rels) {
      if (!asked.includes(`law_${r.type}`) || !this.#sees(r.citation, viewer)) continue;
      out.push(this.#item({ id: r.relation_id, kind: `law_${r.type}`, from: r.from_standard, to: r.to_standard,
        citation: r.citation, effective: r.effective_event ? this.k.eventDay(r.effective_event, r.effective_edge, viewer)
                                                           : r.effective_date, ...(r.from_portion ? { from_portion: r.from_portion } : {}),
        ...(r.to_portion ? { to_portion: r.to_portion } : {}) }));
    }
    const links = this.k.rows(`SELECT l.* FROM court_links l WHERE (l.from_standard=? OR l.to_standard=?) AND NOT EXISTS
                                 (SELECT 1 FROM law_withdrawals w WHERE w.item_id=l.link_id)`, id, id);
    for (const l of links) {
      if (!asked.includes(`court_${l.type}`) || !this.#sees(l.citation, viewer)) continue;
      out.push(this.#item({ id: l.link_id, kind: `court_${l.type}`, from: l.from_standard, to: l.to_standard,
                            citation: l.citation, effective: null, ...(l.to_portion ? { to_portion: l.to_portion } : {}) }));
    }
    return out;
  }

  /* An evidentiary item: valid over its `from` standard's period, starting at the relation's effective date when it
     has one; graded by the passage's transcription ceiling and each end's text. */
  #item({ id, kind, from, to, citation, effective, ...extra }) {
    const f = this.k.row(from);
    const p = this.k.periodOf(f);
    const start = typeof effective === "string" ? effective : effective && effective.day ? effective.day : p.from;
    const assertion = this.k.gradeOf([citation]);
    return { id, from, to, kind, owner: CONNECTION_OWNER,
             valid: { from: start ?? null, to: p.to ?? null, precision: "day", zone: this.k.zone() },
             evidence: [{ source: citation, content_id: citation }],
             grade: { assertion: assertion.grade, ends: [this.k.gradeOf(this.k.texts(from)).grade, this.k.gradeOf(this.k.texts(to)).grade] },
             grade_why: assertion.why, derived: null, ...extra };
  }

  /* The held standards in force at the event's `when` (R20), each a derived item; nothing for an event the viewer may
     not read or with no `when`, or when no events module is wired (each said in the item's absence, never a guess). */
  #eventItems(eventId, asked, viewer) {
    if (!asked.includes("in_force_at_event")) return [];
    const ev = this.k.eventWhen(eventId, viewer);
    if (!ev || !ev.day) return [];
    const ids = this.k.rows(`SELECT standard_id FROM standards WHERE NOT ((period_from IS NOT NULL AND period_from > ?)
                               OR (period_to IS NOT NULL AND period_to < ?)) ORDER BY standard_id`,
                            ev.day, ev.day).map((r) => r.standard_id);
    /* every candidate is asked, so the hub bound (neighbours) is judged on the whole set, never a cut one */
    const out = [];
    for (const sid of ids) {
      const f = this.k.inForceAt({ standard: sid, date: ev.day, viewer });
      if (!f || f.ok === false || f.state === "not_in_force") continue;
      const p = this.k.periodOf(this.k.row(sid));
      const derived = { method: IN_FORCE_METHOD, inputs: [eventId, sid], as_of: ev.day };
      out.push({ id: derivedId({ kind: "in_force_at_event", from: eventId, to: sid, as_of: ev.day, method: IN_FORCE_METHOD }),
                 from: eventId, to: sid, kind: "in_force_at_event", owner: CONNECTION_OWNER,
                 valid: { from: p.from ?? null, to: p.to ?? null, precision: "day", zone: this.k.zone() },
                 evidence: [], grade: { assertion: LOWEST_GRADE, ends: [LOWEST_GRADE, this.k.gradeOf(this.k.texts(sid)).grade] },
                 grade_why: "derived on read from the event's date and the standard's period, so it carries no grade of its own",
                 derived, in_force: { state: f.state, why: f.why } });
    }
    return out;
  }
}

/** The grade a set of passages earns on the transcription axis: the weakest ceiling among them, D (the lowest) with
 *  why when any is undetermined or not held. */
export function weakestCeiling(standings, ids) {
  let grade = null;
  const whys = [];
  for (const id of ids) {
    const s = standings[id];
    const g = s && s.transcription ? s.transcription.ceiling : null;
    if (!BASIS_GRADES.includes(g)) { whys.push(`${String(id).slice(0, 12)}…: ${s && s.transcription ? s.transcription.why || "undetermined" : "not held"}`);
                                     grade = LOWEST_GRADE; continue; }
    grade = grade === null ? g : weaker(grade, g);
  }
  return { grade: grade ?? LOWEST_GRADE, why: whys.length ? `the lowest grade, because ${whys.join("; ")}` : null };
}

/** Row census helpers for tests: the codes this file mints. */
export const LAW_CODES = Object.freeze(Object.keys(STANDARDS_CHECKS).filter((c) => STANDARDS_CHECKS[c].where.includes("law.mjs")));
