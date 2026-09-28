/* escalation — the escalation protocol (requirements: `build/requirements/escalation.md`; Design Requirement 7 as
 * amended by K14 and K102; Functional Architecture Layer 3, Functions 3 and 5): the stages a group works through to
 * bring a government act back into conformance, from a live noncompliant determination to its end.
 *
 * A new module (T8, layer 9): nothing moves from the legacy modules. Its stages are fixed (R4–R12), so it keeps its own
 * table and does not reuse `progressions`' declared stages (Suggestions).
 *
 * WHAT IT DECIDES, AND WHAT IT NEVER DOES. Every trigger is a fact about the record read through the module that owns
 * it (the determination through `conformance`, a ledger and a clock through `actions`, what is available through
 * `filings`, what was done about the consequences through `consequences`). The read derives, at the moment of reading,
 * which edges out of the current stage have their trigger met, with the instant each was first met and its age (R2);
 * nothing derived is stored, so the same record read later can propose more. A proposal is the protocol's derivation,
 * stated as such (R17): only a member advances, declines, attaches, evaluates, suspends, resumes or ends. An escalation
 * ends only when compliance is restored and the consequences are addressed (R14, Operational Principle 6); suspension
 * never ends it (R15). Nothing here carries a significance, severity, priority, urgency or score (R19), and no place,
 * office or law is named in this module's behaviour or text (R20): offices come from the record and the profile.
 *
 * THE RECORD OBJECT (R21; K108 (3), K171). An escalation is a document of type `escalation` under an `ESC-` id, in its
 * determination's project, promoted through `promotion` like any record object, so it has history, audit and export.
 * Each act is one promotion that appends one entry to the document's Escalation Log (R18); the five tables are that
 * log's projections, written by the module's registered projection inside the promotion's transaction. The module's
 * registered check refuses any other promotion of an escalation document (only a replay restores one), so an act and a
 * raw promotion cannot disagree about what happened.
 *
 * REACHED as `escalationOf(host, deps)` (K61): one instance per host, created on the first call with `deps`, returned
 * to every later caller. At creation it migrates its tables (idempotent), declares them to purge (R20, K23) and
 * registers its step with promotion.
 * `deps` (each reached through its factory on the same host unless given; a test passes its own):
 *   record, membership, promotion   layer 2: `allocId`, `transact`, `head`, `readFile`, `getSetting`, `declarePurge`;
 *                                   `inSight`, `projectAuthority`; `promote`, `registerStep`.
 *   conformance    `determinationRead` (its R9), `determinationsFor` (its R11); default `conformanceOf(host)` (K252).
 *   consequences   `addressed` (its R9); default `consequencesModule(host)` (K250).
 *   actions        `actionRead` (its R29: the ledger, legs, `breach`, counterparty); default `actionsOf(host)` (K253).
 *                  Its `actionFacts` (R12, the one clock rule) is imported, a pure function.
 *   filings        `filingsFor` (its R13), `availableActions` (its R21); default `filingsOf(host)` (K248, B8).
 *   view           the active profiles' combined view (`jurisdictions.combine`, record-core R26), or null.
 *   now            the instance clock, an ISO string (default: the wall clock, to the second). */

import { recordOf, stampInstant, instantOrder } from "../record-core/index.mjs";
import { membershipOf } from "../membership/index.mjs";
import { promotionOf } from "../promotion/index.mjs";
import { conformanceOf } from "../conformance/index.mjs";
import { consequencesModule } from "../consequences/index.mjs";
import { actionsOf, actionFacts } from "../actions/index.mjs";
import { filingsOf } from "../filings/index.mjs";
import { combine } from "../../../jurisdictions/index.mjs";
import { isMachineIdentity } from "../../checks/bio-checks.mjs";
import { ESCALATION, escalationId, escalationDoc, appendEntry, logOf, logSection, parseFm } from "./doc.mjs";
import { ESCALATION_TABLES, migrateEscalation } from "./schema.mjs";
import { ESCALATION_CHECKS, refusal } from "./checks.mjs";

export { ESCALATION_SCHEMA, ESCALATION_TABLES } from "./schema.mjs";
export { ESCALATION_CHECKS } from "./checks.mjs";

/** The stages, in order (Terms). */
export const STAGES = Object.freeze({ 1: "documentation", 2: "notification", 3: "clock", 4: "response_evaluation",
  5: "legal_tools", 6: "sustained_attention", 7: "political_accountability" });
/** The stage table: the edges a member may advance along (Terms; K14 for 5, 6 and 7). */
export const STAGE_TABLE = Object.freeze({ 1: [2], 2: [3], 3: [4], 4: [5, 7], 5: [6, 7], 6: [4], 7: [4] });
/** R9: the stages whose act is an attached breach action. */
export const ATTACHING_STAGES = Object.freeze([2, 5, 7]);
/** R10: a member's reading of a response. */
export const READINGS = Object.freeze(["complied", "partial", "denied", "none"]);
/** R12: the five accountability purposes of a stage-7 act. */
export const ACCOUNTABILITY_PURPOSES = Object.freeze(["official_request", "oversight_request", "audit_request",
  "testimony", "enforcing_legislation"]);
/** R10, R13, R15: a reason's bound. */
export const REASON_MAX = 2000;
/** R16: the most items `escalationsDue` answers. */
export const DUE_MAX = 500;
/** R19: keys no input or answer carries. */
export const JUDGMENT_KEYS = Object.freeze(["significance", "severity", "priority", "urgency", "score", "rank"]);

const PROPOSAL_SAYS = "proposed by the escalation protocol's derivation over the record at the time of reading; it is "
  + "not an act. A member advances it or declines it, with a reason.";
const DAY_MS = 86400000;
const ACT = Symbol("escalation act");
const COMPLETED_READINGS = new Set(["denied", "partial", "none"]);

const str = (v) => (typeof v === "string" ? v.trim() : "");
const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
/* A snap key's tail: eight hex digits, the form the catalogue maps a history file to its manifest entry by (C-12.2). */
const hex8 = () => { const b = new Uint8Array(4); crypto.getRandomValues(b); return [...b].map((x) => x.toString(16).padStart(2, "0")).join(""); };
const isMachine = (who) => str(who) === "" || isMachineIdentity(who);
const json = (v) => (v === null || v === undefined ? null : JSON.stringify(v));
const unjson = (s, d = null) => { try { return s ? JSON.parse(s) : d; } catch { return d; } };

/** A ledger or clock date (`YYYY-MM-DD`) as the instant its day begins; an instant as itself; NaN otherwise. */
const instantMs = (v) => {
  if (typeof v !== "string" || !v) return NaN;
  return /^\d{4}-\d{2}-\d{2}$/.test(v) ? Date.parse(`${v}T00:00:00Z`) : Date.parse(v);
};
const iso = (ms) => stampInstant("second", ms);

/* ---- the providers' answers, read in one place each (their Provides) ---- */

/** conformance R9/R11 (K252): a determination's per-standard outcomes `[{standard, outcome}]`, whether it is live,
 *  its act (`{id, actor: {role, body}, ...}`), its project and when it was recorded (`at`; the act's date is `act.at`). */
const outcomesOf = (d) => (Array.isArray(d.outcomes) ? d.outcomes : [])
  .filter((o) => isObj(o) && typeof o.standard === "string").map((o) => ({ standard: o.standard, outcome: o.outcome ?? null }));
const liveOf = (d) => d.live === true;
const actOf = (d) => (isObj(d.act) ? d.act : {});
const actIdOf = (d) => actOf(d).id ?? null;
const projectOf = (d) => d.project ?? null;
const recordedAtOf = (d) => d.at ?? null;

/** actions R25/R29 (K253): an action's correspondence ledger, in order, `[{ord, direction, at, recorded_at}]`. */
function ledgerOf(block) {
  const raw = Array.isArray(block.correspondence) ? block.correspondence : [];
  return raw.map((e, i) => (isObj(e) ? { ord: Number.isInteger(e.ord) ? e.ord : i, direction: e.direction ?? null,
    at: e.at ?? null, recorded_at: e.recorded_at ?? null } : null)).filter(Boolean);
}

export class Escalation {
  constructor(deps) {
    this.record = deps.record;
    this.membership = deps.membership;
    this.promotion = deps.promotion;
    this.sql = (deps.storage || {}).sql;
    this.deps = deps;
    this.now = deps.now || (() => stampInstant("second"));
  }

  /* The providers used beside this module in layer 9, reached when first needed. */
  get conformance() { return this.#dep("conformance"); }
  get consequences() { return this.#dep("consequences"); }
  get actions() { return this.#dep("actions"); }
  get filings() { return this.#dep("filings"); }
  #dep(name) {
    const d = this.deps[name];
    const v = typeof d === "function" ? d() : d;
    if (!v) throw new ProviderAbsent(name);
    return v;
  }

  /** The module's tables (R20); run at creation, and safe to run again (each `CREATE ... IF NOT EXISTS`). */
  migrate() { migrateEscalation(this.sql); }

  #rows(q, ...a) { return this.sql.exec(q, ...a); }
  #one(q, ...a) { return this.#rows(q, ...a)[0] || null; }

  /* The active profiles' combined view (record-core R26, jurisdictions R12–R16), or null: undetermined wherever a
     local fact is needed (jurisdictions R27). */
  #view() {
    if (this.deps.view !== undefined) return typeof this.deps.view === "function" ? this.deps.view() : this.deps.view;
    const ids = this.record.getSetting("jurisdiction_profiles");
    const c = combine(Array.isArray(ids) ? ids : []);
    return c.ok ? c.view : null;
  }

  /* ===================================================================== *
   * READING AN ESCALATION (R2, R20: absent and unseen are one answer)
   * ===================================================================== */

  #row(id, viewer) {
    if (typeof id !== "string" || !id) return null;
    const r = this.#one(`SELECT * FROM escalations WHERE escalation_id=?`, id);
    if (!r) return null;
    if (viewer !== null && viewer !== undefined && !this.membership.inSight(r.project_id, viewer)) return null;
    return { id: r.escalation_id, project: r.project_id, determination: r.determination_id, act: r.act_id,
             standards: unjson(r.standards_json, []), state: r.state, stage: r.stage, stageSince: r.stage_since,
             stateSince: r.state_since, openedBy: r.opened_by, openedAt: r.opened_at };
  }

  #attachments(id) {
    return this.#rows(`SELECT * FROM escalation_attachments WHERE escalation_id=? ORDER BY seq`, id).map((a) => ({
      action: a.action_id, stage: a.stage, purpose: a.purpose ?? null, standards: unjson(a.standards_json, null),
      author: a.author, at: a.at, seq: a.seq }));
  }

  #evaluations(id) {
    return this.#rows(`SELECT * FROM escalation_evaluations WHERE escalation_id=? ORDER BY seq`, id).map((v) => ({
      seq: v.seq, reading: v.reading, response: v.response_action ? { action: v.response_action, ord: v.response_ord } : null,
      reason: v.reason, author: v.author, at: v.at }));
  }

  #declines(id) {
    return this.#rows(`SELECT * FROM escalation_declines WHERE escalation_id=? ORDER BY seq`, id).map((d) => ({
      seq: d.seq, from: d.from_stage, to: d.to_stage, reason: d.reason, author: d.author, at: d.at }));
  }

  #text(id) {
    const f = this.record.readFile(id, "bundle.md");
    return f && typeof f.text === "string" ? f.text : null;
  }

  /* An action's ledger as `actions` answers it to this viewer; null when it does not answer one. */
  #ledger(action, viewer) {
    const r = this.actions.actionRead({ id: action, viewer });
    return r && r.ok !== false ? ledgerOf(r) : null;
  }


  /* ===================================================================== *
   * THE TRIGGERS (R2, R4–R12): each edge out of the current stage, met or not, from the record at `nowMs`.
   * An edge with alternatives is first met at its earliest alternative met; an alternative's instant is the latest
   * date of the ids that meet it (a ledger date is its day's start; a clock's is the day after its date).
   * ===================================================================== */

  #met(alts) {
    const ok = alts.filter((a) => Number.isFinite(a.ms));
    if (!ok.length) return null;
    return ok.reduce((m, a) => (a.ms < m.ms ? a : m));
  }

  #triggers(e, nowMs, viewer) {
    const edges = STAGE_TABLE[e.stage] || [];
    const attached = this.#attachments(e.id);
    const evaluations = this.#evaluations(e.id);
    const notes = [];
    const out = [];
    const edge = (to, alts, missing, extra = {}) => {
      const m = this.#met(alts);
      out.push(m ? { from: e.stage, to, met: true, ids: m.ids, instant: iso(m.ms), ...extra }
                 : { from: e.stage, to, met: false, ids: [], missing, ...extra });
    };
    const stageActs = (s) => attached.filter((a) => a.stage === s);
    const firstSent = (action) => {
      const l = this.#ledger(action, viewer);
      if (!l) return null;
      const i = l.findIndex((x) => x.direction === "sent");
      return i === -1 ? null : { ledger: l, index: i, entry: l[i] };
    };
    const latest = evaluations.at(-1) || null;
    const byEvaluation = (ev, why) => (ev && COMPLETED_READINGS.has(ev.reading)
      ? [{ ms: instantMs(ev.at), ids: [`${e.id}/evaluation/${ev.seq}`] }] : []);
    const evalMissing = (ev, scope) => (!ev ? `no evaluation ${scope}`
      : ev.reading === "complied" ? `the evaluation in force reads complied: it proposes no stage. Compliance is restored `
        + `only by a live compliant determination of the same act for every standard pursued (escalationEnd)`
      : `no evaluation ${scope} reads denied, partial or none`);

    if (e.stage === 1) {
      /* R4: the determination is live, and its act's actor is an office. */
      const d = this.conformance.determinationRead({ id: e.determination, viewer });
      let missing = null;
      if (!d || d.ok === false) missing = "the determination does not answer to this reader";
      else if (!liveOf(d)) missing = "the determination has been superseded";
      else {
        const actor = actOf(d).actor || {};
        if (!str(actor.role) || !str(actor.body)) missing = "the act's actor names no office (role and body), so a notice has no addressee";
      }
      edge(2, missing ? [] : [{ ms: instantMs(recordedAtOf(d)), ids: [e.determination] }], missing);
    } else if (e.stage === 2) {
      /* R5: a stage-2 action's ledger holds a `sent` entry. */
      const acts = stageActs(2);
      const alts = [];
      for (const a of acts) {
        const s = firstSent(a.action);
        if (s) alts.push({ ms: instantMs(s.entry.at), ids: [a.action, `${a.action}#${s.entry.ord}`] });
      }
      edge(3, alts, acts.length ? "no notification action attached at stage 2 has a sent entry in its ledger"
                                : "no breach action is attached at stage 2");
    } else if (e.stage === 3) {
      /* R6: after the sent entry, a received or no_response entry; or the clock's earliest pending entry is past. */
      const acts = stageActs(2);
      const alts = [];
      for (const a of acts) {
        const s = firstSent(a.action);
        if (s) {
          const reply = s.ledger.slice(s.index + 1).find((x) => x.direction === "received" || x.direction === "no_response");
          if (reply) alts.push({ ms: Math.max(instantMs(s.entry.at), instantMs(reply.at)),
                                 ids: [a.action, `${a.action}#${s.entry.ord}`, `${a.action}#${reply.ord}`] });
        }
        const facts = actionFacts(this.#text(a.action), nowMs) || {};
        if (!facts.clock_next)
          notes.push({ action: a.action, says: "this notification action has no pending clock entry, so stage 3 never "
                       + "triggers by time on it; a member states a clock entry, with its basis, on the action" });
        else if (facts.clock_overdue)
          alts.push({ ms: instantMs(facts.clock_next) + DAY_MS, ids: [a.action], clock: facts.clock_next });
      }
      edge(4, alts, acts.length ? "no reply or no-response entry follows the sent entry, and no clock entry is past"
                                : "no notification action is attached at stage 2");
    } else if (e.stage === 4) {
      /* R7: the latest evaluation made since the escalation entered stage 4. */
      const since = evaluations.filter((v) => instantOrder(v.at, e.stageSince) >= 0).at(-1) || null;
      const missing = evalMissing(since, "since the escalation entered stage 4");
      edge(5, byEvaluation(since), missing);
      edge(7, byEvaluation(since), missing);
    } else if (e.stage === 5) {
      /* R8: a stage-5 action's ledger holds a sent entry; to 7 as R7's, from the evaluation in force. */
      const acts = stageActs(5);
      const alts = [];
      for (const a of acts) {
        const s = firstSent(a.action);
        if (s) alts.push({ ms: instantMs(s.entry.at), ids: [a.action, `${a.action}#${s.entry.ord}`] });
      }
      edge(6, alts, acts.length ? "no action attached at stage 5 has a sent entry in its ledger"
                                : "no breach action is attached at stage 5");
      edge(7, byEvaluation(latest), evalMissing(latest, "in force"));
    } else if (e.stage === 6 || e.stage === 7) {
      /* R11, R12: a received entry on an attached action recorded after the latest evaluation. */
      const alts = [];
      for (const a of attached) {
        const l = this.#ledger(a.action, viewer) || [];
        for (const x of l) {
          if (x.direction !== "received") continue;
          if (latest && !(instantOrder(x.recorded_at, latest.at) > 0)) continue;
          alts.push({ ms: instantMs(x.at), ids: [a.action, `${a.action}#${x.ord}`] });
        }
      }
      edge(4, alts, latest ? "no received entry on an attached action was recorded after the latest evaluation"
                           : "no received entry on an attached action");
    }
    for (const t of out) if (!edges.includes(t.to)) throw new Error("escalation: an edge outside the table");
    return { triggers: out, notes };
  }

  /* R2, R13: the met edges, each with its instant, age and the declines made of it since its trigger was met. */
  #proposed(e, triggers, nowMs) {
    const declines = this.#declines(e.id);
    return triggers.filter((t) => t.met).map((t) => {
      const mine = declines.filter((d) => d.from === t.from && d.to === t.to && instantOrder(d.at, e.stageSince) >= 0);
      const since = mine.filter((d) => instantOrder(d.at, t.instant) >= 0);
      return { from: t.from, to: t.to, stage: STAGES[t.to], ids: t.ids, instant: t.instant,
               age_ms: Math.max(0, nowMs - instantMs(t.instant)), declines: mine, declined_since_met: since.length > 0,
               by: "protocol", says: PROPOSAL_SAYS };
    });
  }

  /* R3, R14: the two exit conditions, answered apart and never composed. */
  #exit(e, viewer) {
    return { compliance: this.#compliance(e, viewer), consequences: this.#consequencesState(e, viewer),
             says: "an escalation ends only when both hold: compliance restored for every standard it pursues, and the "
                 + "consequences addressed. Each is answered on its own." };
  }

  #compliance(e, viewer) {
    if (!e.act) return { state: "undetermined", ids: [], why: "the determination names no act id, so no later determination of the same act can be found" };
    const per = [];
    for (const standard of e.standards) {
      const found = [];
      let after = null;
      for (let page = 0; page < 50; page++) {
        const r = this.conformance.determinationsFor({ act: e.act, standard, outcome: "compliant", live: true, after, viewer });
        if (!r || r.ok === false) return { state: "undetermined", ids: [], why: "the determinations of the act could not be read" };
        for (const d of r.items || []) {
          const o = outcomesOf(d).find((x) => x.standard === standard);
          if (o && o.outcome === "compliant" && liveOf(d) && actIdOf(d) === e.act
              && instantOrder(recordedAtOf(d), e.openedAt) > 0) found.push(d.id);
        }
        if (!r.truncated) break;
        after = r.cursor ?? (r.items || []).at(-1)?.id ?? null;
        if (!after) break;
      }
      per.push({ standard, met: found.length > 0, ids: found });
    }
    const lacking = per.filter((p) => !p.met).map((p) => p.standard);
    return { state: lacking.length ? "not_met" : "met", ids: per.flatMap((p) => p.ids), standards: per,
             why: lacking.length ? `no live compliant determination of the same act recorded after the escalation opened `
                                   + `for: ${lacking.join(", ")}`
                                 : "every standard pursued has a live compliant determination of the same act recorded after the escalation opened" };
  }

  #consequencesState(e, viewer) {
    const r = this.consequences.addressed({ determination: e.determination, viewer });
    if (!r || r.ok === false) return { state: "undetermined", ids: [], why: "the consequences could not be read" };
    const parts = Array.isArray(r.parts) ? r.parts : [];
    const ids = parts.map((p) => (isObj(p) ? p.id ?? p.part ?? null : p)).filter((x) => typeof x === "string");
    const state = r.state === "addressed" ? "met" : r.state === "not_addressed" ? "not_met" : "undetermined";
    const why = state === "met" ? "every live consequence part is addressed"
      : state === "not_met" ? "a consequence part is not addressed, or was never assessed"
      : parts.length ? "a consequence part is undetermined or its causation unproven" : "no consequence recorded";
    return { state, ids, parts, why };
  }

  /* The escalation's attached actions as the reader sees them, with stage 7's statements and R12's undetermined
     election or oversight. */
  #actionsOf(e, viewer) {
    const view = this.#view();
    return this.#attachments(e.id).map((a) => {
      const visible = this.actions.actionRead({ id: a.action, viewer });
      const item = { action: a.action, stage: a.stage, attached_by: a.author, at: a.at };
      if (!visible || visible.ok === false) return { ...item, action: null, says: "an object you may not see" };
      if (a.stage === 7) {
        item.purpose = a.purpose;
        item.standards = a.standards;
        const office = this.#office(visible.counterparty, view);
        if (a.purpose === "official_request" && office.elected === undefined)
          item.election = { state: "undetermined", says: "the active profiles do not say whether this office is elected" };
        if ((a.purpose === "oversight_request" || a.purpose === "audit_request") && office.oversight === undefined)
          item.oversight = { state: "undetermined", says: "the active profiles do not say whether this office is an oversight or audit body" };
      }
      if (a.stage === 5) {
        const f = this.filings.filingsFor({ action: a.action, viewer });
        item.filings = f && f.ok !== false ? { drafts: f.drafts ?? [], packets: f.packets ?? [] } : null;
      }
      return item;
    });
  }

  /* R12: an action's counterparty office in the view, `{elected?, oversight?}`; undefined where the profile is silent. */
  #office(cp, view) {
    if (!isObj(cp) || !str(cp.role) || !str(cp.body) || !view || !Array.isArray(view.counterparties)) return {};
    const o = view.counterparties.find((c) => isObj(c) && c.role === cp.role && c.body === cp.body);
    if (!o) return {};
    return { elected: typeof o.elected === "boolean" ? o.elected : undefined,
             oversight: typeof o.oversight === "boolean" ? o.oversight : undefined };
  }

  /* The history: every act on the escalation, oldest first, from its document's log (R18). */
  #history(id) {
    return logOf(this.#text(id));
  }

  /** R2: the escalation as the record stands at `nowMs`. */
  escalationRead({ id, nowMs, viewer } = {}) {
    const e = this.#row(id, viewer);
    if (!e) return refuseNoSuchEscalation();
    const at = Number.isFinite(nowMs) ? nowMs : instantMs(this.now());
    const { triggers, notes } = this.#triggers(e, at, viewer);
    const proposed = this.#proposed(e, triggers, at);
    const answer = {
      ok: true, id: e.id, project: e.project, determination: e.determination, act: e.act, state: e.state,
      stage: e.stage, stage_name: STAGES[e.stage], stage_since: e.stageSince, opened_by: e.openedBy, opened_at: e.openedAt,
      as_of: iso(at), history: this.#history(e.id), standards: e.standards, actions: this.#actionsOf(e, viewer),
      evaluations: this.#evaluations(e.id), triggers, notes, proposed, exit: this.#exit(e, viewer),
    };
    if (e.state === "suspended")
      answer.suspended = { since: e.stateSince, says: "suspended: its proposals are not reported as due, its clocks keep "
                           + "running in the actions, and it is not ended" };
    if (e.state === "ended") answer.ended = { at: e.stateSince, says: "ended: compliance was restored and the consequences addressed" };
    if (e.stage === 5) {
      const av = this.filings.availableActions({ determination: e.determination, viewer });
      answer.available = av && av.ok !== false ? av
        : { state: "undetermined", says: "the actions available against the determination's offices could not be read" };
    }
    return answer;
  }

  /* ===================================================================== *
   * THE WRITE (R18, R21): every act is one promotion of the escalation's document through `promotion`.
   * ===================================================================== */

  #snap() { return `${this.now().replace(/[-:]/g, "").replace(/\.\d+/, "")}_${hex8()}`; }

  #append(e, entry, { stage, state, blurb }) {
    const head = this.record.head(e.id);
    const text = this.#text(e.id);
    if (!head || text === null) return refuseNoSuchEscalation();
    const seq = logOf(text).length + 1;
    const next = appendEntry(text, { entry, seq, stage, state, fromState: head.currentState, blurb });
    /* DEC-49 REGION is-escalation-spliceable */
    if (next === null) return refusal("UNSPLICEABLE_ESCALATION", "the escalation's document cannot be extended in place. Nothing was written.");
    /* END DEC-49 REGION is-escalation-spliceable */
    const carried = this.record.livePaths(e.id).filter((p) => p !== "bundle.md").map((path) => {
      const f = this.record.readFile(e.id, path);
      return typeof f.text === "string" ? { path, text: f.text, sha256: f.sha256 }
                                        : { path, blobSha: f.blobSha, sha256: f.sha256, bytes: f.bytes };
    });
    const fm = parseFm(next) || {};
    const r = this.promotion.promote({ bundleId: e.id, base: head.bundleSha, snapKey: this.#snap(), author: entry.author,
      files: [{ path: "bundle.md", text: next }, ...carried],
      meta: { object_type: ESCALATION, title: fm.title, current_state: fm.current_state, prior_state: fm.prior_state ?? null,
              created: fm.created, last_updated: fm.last_updated },
      [ACT]: true });
    return r.ok ? { ok: true, seq } : r;
  }

  /* ---- the registered step (promotion R39) ---- */

  /** R17, R18, R21: an escalation document changes only through this module's acts, never by a machine, and its log
   *  only grows; a replay restores one as it was. */
  check(c) {
    const type = c.promotedType;
    const headType = c.head ? c.head.type : null;
    if (type !== ESCALATION && headType !== ESCALATION) return null;
    if (c.replay) return null;
    /* DEC-49 REGION is-escalation-member */
    if (isMachine(c.author))
      return refusal("MACHINE_CANNOT_WRITE_ESCALATION", "an escalation is written only by a member's act; a machine "
                     + "prepares and never acts (Design Requirement 12). Nothing was written.");
    /* END DEC-49 REGION is-escalation-member */
    /* DEC-49 REGION is-escalation-act */
    if (!c.pkg || c.pkg[ACT] !== true)
      return refusal("ESCALATION_BY_ACT_ONLY", "an escalation changes only through its acts (open, attach, evaluate, "
                     + "advance, decline, suspend, resume, end), so its log and its tables never disagree. Nothing was written.");
    /* END DEC-49 REGION is-escalation-act */
    if (c.head) {
      const held = logSection(this.#text(c.bundleId)) || "";
      const now = logSection(c.bundleMd && c.bundleMd.text) || "";
      /* DEC-49 REGION is-escalation-append-only */
      if (!now.startsWith(held))
        return refusal("ESCALATION_HISTORY_REWRITTEN", "an escalation's log is append-only. Nothing was written.");
      /* END DEC-49 REGION is-escalation-append-only */
    }
    return null;
  }

  /** R21: the tables, projected from the promoted document in the promotion's transaction. */
  project(c) {
    if (c.promotedType !== ESCALATION || !c.bundleMd || typeof c.bundleMd.text !== "string") return null;
    const id = c.bundleId, text = c.bundleMd.text;
    const fm = parseFm(text) || {};
    const log = logOf(text).filter((x) => !x.unreadable);
    const held = this.#one(`SELECT log_len FROM escalations WHERE escalation_id=?`, id);
    const from = held ? held.log_len : 0;
    const open = log.find((x) => x.kind === "open") || {};
    const stageAt = log.filter((x) => x.kind === "open" || x.kind === "advance").at(-1) || open;
    const stateAt = log.filter((x) => ["open", "suspend", "resume", "end"].includes(x.kind)).at(-1) || open;
    this.#rows(`INSERT OR REPLACE INTO escalations (escalation_id, project_id, determination_id, act_id, standards_json,
                state, stage, stage_since, state_since, opened_by, opened_at, log_len) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      id, String(fm.project ?? open.project ?? ""), String(fm.determination ?? open.determination ?? ""),
      fm.act === null || fm.act === undefined || fm.act === "null" ? null : String(fm.act),
      JSON.stringify(Array.isArray(fm.standards) ? fm.standards.map(String) : (open.standards || [])),
      String(fm.current_state ?? "open"), Number(fm.stage ?? 1), stageAt.at ?? "", stateAt.at ?? "",
      open.author ?? "", open.at ?? "", log.length);
    for (const x of log.filter((y) => y.seq > from)) {
      if (["open", "advance", "suspend", "resume", "end"].includes(x.kind))
        this.#rows(`INSERT OR REPLACE INTO escalation_moves (escalation_id, seq, kind, from_stage, to_stage, reason,
                    trigger_json, author, at) VALUES (?,?,?,?,?,?,?,?,?)`,
          id, x.seq, x.kind, x.from ?? null, x.to ?? null, x.reason ?? null, json(x.trigger), x.author, x.at);
      else if (x.kind === "evaluate")
        this.#rows(`INSERT OR REPLACE INTO escalation_evaluations (escalation_id, seq, reading, response_action,
                    response_ord, reason, author, at) VALUES (?,?,?,?,?,?,?,?)`,
          id, x.seq, x.reading, x.response ? x.response.action : null, x.response ? x.response.ord : null, x.reason,
          x.author, x.at);
      else if (x.kind === "attach")
        this.#rows(`INSERT OR REPLACE INTO escalation_attachments (action_id, escalation_id, seq, stage, purpose,
                    standards_json, author, at) VALUES (?,?,?,?,?,?,?,?)`,
          x.action, id, x.seq, x.stage, x.purpose ?? null, json(x.standards), x.author, x.at);
      else if (x.kind === "decline")
        this.#rows(`INSERT OR REPLACE INTO escalation_declines (escalation_id, seq, from_stage, to_stage, reason, author, at)
                    VALUES (?,?,?,?,?,?,?)`, id, x.seq, x.from, x.to, x.reason, x.author, x.at);
    }
    return null;
  }

  /* ===================================================================== *
   * THE ACTS
   * ===================================================================== */


  /** R1: open an escalation of a live noncompliant determination, at stage 1. */
  escalationOpen(args = {}) {
    const { determination, author, viewer } = args;
    /* DEC-49 REGION is-open-member */
    if (isMachine(author))
      return refusal("MACHINE_CANNOT_OPEN", "an escalation is opened by a named member; a machine prepares and never acts. Nothing was written.");
    /* END DEC-49 REGION is-open-member */
    const judged = refuseJudgment(args);
    if (judged) return judged;
    const d = typeof determination === "string" && determination
      ? this.conformance.determinationRead({ id: determination, viewer }) : null;
    /* DEC-49 REGION is-determination-seen */
    if (!d || d.ok === false)
      return refusal("NO_SUCH_DETERMINATION", "no determination answers to that id here; one you may not see is answered "
                     + "exactly as one that does not exist.");
    /* END DEC-49 REGION is-determination-seen */
    /* DEC-49 REGION is-determination-live */
    if (!liveOf(d))
      return refusal("DETERMINATION_SUPERSEDED", "that determination has been superseded; an escalation pursues a live "
                     + "determination. Nothing was written.", { superseded_by: d.superseded_by ?? null });
    /* END DEC-49 REGION is-determination-live */
    const pursued = outcomesOf(d).filter((o) => o.outcome === "noncompliant").map((o) => o.standard);
    /* DEC-49 REGION is-determination-noncompliant */
    if (!pursued.length)
      return refusal("NOT_NONCOMPLIANT", "no standard's outcome in that determination is noncompliant, so there is no "
                     + "breach to pursue. Nothing was written.");
    /* END DEC-49 REGION is-determination-noncompliant */
    const project = projectOf(d);
    const fence = this.membership.projectAuthority(project, author, "joined", "escalationOpen");
    /* DEC-49 REGION is-open-joined */
    if (fence)
      return refusal("NOT_A_PARTICIPANT", "an escalation is opened by a member who has joined the determination's "
                     + "project. Nothing was written.", { project, membership: fence.reason });
    /* END DEC-49 REGION is-open-joined */
    const held = this.#one(`SELECT escalation_id FROM escalations WHERE determination_id=? AND state IN ('open','suspended')
                            ORDER BY escalation_id LIMIT 1`, determination);
    /* DEC-49 REGION is-one-escalation */
    if (held)
      return refusal("ALREADY_OPEN", `the escalation ${held.escalation_id} of this determination is not ended; there is `
                     + "one open or suspended escalation per determination. Nothing was written.", { escalation: held.escalation_id });
    /* END DEC-49 REGION is-one-escalation */
    const at = this.now();
    const actId = actIdOf(d);
    const r = this.record.transact(() => {
      const id = escalationId(this.record.allocId("ESC", at.slice(0, 4)).id);
      const entry = { kind: "open", to: 1, determination, project, standards: pursued, author, at };
      const text = escalationDoc({ id, project, determination, act: actId, standards: pursued, author, at, entry });
      const fm = parseFm(text) || {};
      const p = this.promotion.promote({ bundleId: id, base: null, snapKey: this.#snap(), author,
        files: [{ path: "bundle.md", text }],
        meta: { object_type: ESCALATION, title: fm.title, current_state: fm.current_state, created: fm.created,
                last_updated: fm.last_updated }, [ACT]: true });
      return p.ok ? { ok: true, id } : p;
    });
    if (!r.ok) return r;
    const read = this.escalationRead({ id: r.id, viewer });
    return { ok: true, id: r.id, stage: 1, stage_name: STAGES[1], standards: pursued, determination, project,
             opened_by: author, at, proposed: read.proposed };
  }

  /** R9, R12: attach a breach action to the current stage (2, 5 or 7). */
  escalationAttach(args = {}) {
    const { id, action, purpose, standards, author, viewer } = args;
    /* DEC-49 REGION is-attach-member */
    if (isMachine(author))
      return refusal("MACHINE_CANNOT_ATTACH", "an action is attached to an escalation by a named member. Nothing was written.");
    /* END DEC-49 REGION is-attach-member */
    const judged = refuseJudgment(args);
    if (judged) return judged;
    const e = this.#row(id, viewer);
    if (!e) return refuseNoSuchEscalation();
    if (e.state === "ended") return refuseEnded();
    const a = typeof action === "string" && action ? this.actions.actionRead({ id: action, viewer }) : null;
    /* DEC-49 REGION is-action-seen */
    if (!a || a.ok === false)
      return refusal("NO_SUCH_ACTION", "no action answers to that id here; one you may not see is answered exactly as one "
                     + "that does not exist.");
    /* END DEC-49 REGION is-action-seen */
    const legs = Array.isArray(a.legs) ? a.legs : [];
    /* DEC-49 REGION is-breach-action */
    if (a.breach !== true || !legs.some((l) => isObj(l) && l.kind === "rests_on" && l.target === e.determination))
      return refusal("NOT_A_BREACH_ACTION", "an escalation's act is an action whose document states breach: true and "
                     + "that rests on this escalation's determination. Nothing was written.", { determination: e.determination });
    /* END DEC-49 REGION is-breach-action */
    /* DEC-49 REGION is-attaching-stage */
    if (!ATTACHING_STAGES.includes(e.stage))
      return refusal("STAGE_TAKES_NO_ACTION", `stage ${e.stage} (${STAGES[e.stage]}) takes no attached action; stages `
                     + "2, 5 and 7 do. Nothing was written.", { stage: e.stage });
    /* END DEC-49 REGION is-attaching-stage */
    const held = this.#one(`SELECT escalation_id, stage FROM escalation_attachments WHERE action_id=?`, action);
    /* DEC-49 REGION is-attached-once */
    if (held)
      return refusal("ALREADY_ATTACHED", "that action is already attached to an escalation, at one stage. Nothing was written.",
                     held.escalation_id === e.id ? { escalation: e.id, stage: held.stage } : {});
    /* END DEC-49 REGION is-attached-once */
    const entry = { kind: "attach", action, stage: e.stage, author, at: this.now() };
    if (e.stage === 7) {
      /* DEC-49 REGION is-accountability-purpose */
      if (!ACCOUNTABILITY_PURPOSES.includes(purpose))
        return refusal("NOT_ACCOUNTABILITY", "a stage-7 act states one accountability purpose: "
                       + `${ACCOUNTABILITY_PURPOSES.join(", ")}. Policy advocacy and candidate support have none. Nothing was written.`,
                       { purposes: ACCOUNTABILITY_PURPOSES });
      /* END DEC-49 REGION is-accountability-purpose */
      const named = Array.isArray(standards) ? standards.filter((s) => typeof s === "string" && s) : [];
      const foreign = named.filter((s) => !e.standards.includes(s));
      /* DEC-49 REGION is-pursued-standard */
      if (!named.length || foreign.length)
        return refusal("NOT_THE_BREACH", "a stage-7 act names at least one of the escalation's noncompliant standards as "
                       + "the requirement it seeks enforced, and no other. Nothing was written.",
                       { pursued: e.standards, ...(foreign.length ? { not_pursued: foreign } : {}) });
      /* END DEC-49 REGION is-pursued-standard */
      const office = this.#office(a.counterparty, this.#view());
      /* DEC-49 REGION is-elected-office */
      if (purpose === "official_request" && office.elected === false)
        return refusal("COUNTERPARTY_NOT_ELECTED", "an official request asks an elected office to act on the breach, and "
                       + "the active profiles mark this action's office not elected. Nothing was written.");
      /* END DEC-49 REGION is-elected-office */
      /* DEC-49 REGION is-oversight-office */
      if ((purpose === "oversight_request" || purpose === "audit_request") && office.oversight === false)
        return refusal("COUNTERPARTY_NOT_OVERSIGHT", "an oversight or audit request is addressed to an oversight or audit "
                       + "body, and the active profiles mark this action's office not one. Nothing was written.");
      /* END DEC-49 REGION is-oversight-office */
      Object.assign(entry, { purpose, standards: [...new Set(named)] });
    }
    const w = this.#append(e, entry, { blurb: "Action attached" });
    if (!w.ok) return w;
    return { ok: true, id: e.id, action, stage: e.stage, ...(e.stage === 7 ? { purpose, standards: entry.standards } : {}),
             author, at: entry.at };
  }

  /** R10: a member's reading of a response, at stage 4. */
  escalationEvaluate(args = {}) {
    const { id, response, reading, reason, author, viewer } = args;
    /* DEC-49 REGION is-evaluate-member */
    if (isMachine(author))
      return refusal("MACHINE_CANNOT_EVALUATE", "a response is evaluated by a named member. Nothing was written.");
    /* END DEC-49 REGION is-evaluate-member */
    const judged = refuseJudgment(args);
    if (judged) return judged;
    const e = this.#row(id, viewer);
    if (!e) return refuseNoSuchEscalation();
    /* DEC-49 REGION is-evaluation-stage */
    if (e.stage !== 4)
      return refusal("NOT_IN_EVALUATION", `the escalation stands at stage ${e.stage} (${STAGES[e.stage]}); a response is `
                     + "evaluated at stage 4. Nothing was written.", { stage: e.stage });
    /* END DEC-49 REGION is-evaluation-stage */
    if (e.state === "ended") return refuseEnded();
    /* DEC-49 REGION is-reading-known */
    if (!READINGS.includes(reading))
      return refusal("READING_UNKNOWN", `a reading is one of ${READINGS.join(", ")}. Nothing was written.`, { readings: READINGS });
    /* END DEC-49 REGION is-reading-known */
    let named = null;
    if (response !== undefined && response !== null) {
      const ok = isObj(response) && typeof response.action === "string" && Number.isInteger(response.ord)
        && this.#attachments(e.id).some((a) => a.action === response.action)
        && (this.#ledger(response.action, viewer) || []).some((x) => x.ord === response.ord && x.direction === "received");
      if (!ok)
        return refuseNoSuchResponse("the response named is not a received entry of an action attached to this escalation.");
      named = { action: response.action, ord: response.ord };
    } else if (reading !== "none")
      return refuseNoSuchResponse(`a ${reading} reading names the received entry it reads.`);
    /* DEC-49 REGION is-none-unnamed */
    if (named && reading === "none")
      return refusal("RESPONSE_FOR_NONE", "a none reading says nothing came back by the clock, so it names no response. Nothing was written.");
    /* END DEC-49 REGION is-none-unnamed */
    const bad = refuseReason(reason);
    if (bad) return bad;
    const entry = { kind: "evaluate", reading, response: named, reason: str(reason), author, at: this.now() };
    const w = this.#append(e, entry, { blurb: "Response evaluated" });
    if (!w.ok) return w;
    return { ok: true, id: e.id, reading, response: named, reason: entry.reason, author, at: entry.at,
             ...(reading === "complied" ? { says: "a complied reading proposes no stage. Compliance is restored only by a "
               + "live compliant determination of the same act for every standard pursued (escalationEnd)." } : {}),
             ...(reading === "partial" ? { says: "partial compliance is recorded; it does not stop the clock or end the escalation." } : {}) };
  }

  #edgeArgs(kind, { id, to, reason, author, viewer }, args) {
    /* DEC-49 REGION is-edge-member */
    if (isMachine(author))
      return { refused: refusal(kind === "advance" ? "MACHINE_CANNOT_ADVANCE" : "MACHINE_CANNOT_DECLINE",
        `an escalation's stage is ${kind === "advance" ? "advanced" : "declined"} by a named member; a proposal is the `
        + "protocol's derivation, never an act. Nothing was written.") };
    /* END DEC-49 REGION is-edge-member */
    const judged = refuseJudgment(args);
    if (judged) return { refused: judged };
    const e = this.#row(id, viewer);
    if (!e) return { refused: refuseNoSuchEscalation() };
    /* DEC-49 REGION is-edge-open */
    if (e.state !== "open")
      return { refused: refusal("NOT_OPEN", `this escalation is ${e.state}; its stage moves only while it is open. Nothing was written.`,
                                { state: e.state }) };
    /* END DEC-49 REGION is-edge-open */
    const bad = refuseReason(reason);
    if (bad) return { refused: bad };
    const target = typeof to === "string" && /^\d$/.test(to) ? Number(to)
      : typeof to === "string" ? Number(Object.keys(STAGES).find((k) => STAGES[k] === to)) : to;
    const legal = STAGE_TABLE[e.stage] || [];
    /* DEC-49 REGION is-edge-legal */
    if (!legal.includes(target))
      return { refused: refusal("ILLEGAL_STAGE", `stage ${e.stage} (${STAGES[e.stage]}) moves to ${legal.join(" or ")} only. Nothing was written.`,
                                { from: e.stage, legal }) };
    /* END DEC-49 REGION is-edge-legal */
    return { e, target };
  }

  /** R13: advance along a proposed edge. */
  escalationAdvance(args = {}) {
    const a = this.#edgeArgs("advance", args, args);
    if (a.refused) return a.refused;
    const { e, target } = a;
    const nowMs = instantMs(this.now());
    const { triggers } = this.#triggers(e, nowMs, args.viewer);
    const t = triggers.find((x) => x.to === target);
    /* DEC-49 REGION is-trigger-met */
    if (!t || !t.met)
      return refusal("TRIGGER_NOT_MET", `the trigger for stage ${target} (${STAGES[target]}) is not met: ${t ? t.missing : "no trigger"}. Nothing was written.`,
                     { from: e.stage, to: target, missing: t ? t.missing : null });
    /* END DEC-49 REGION is-trigger-met */
    const entry = { kind: "advance", from: e.stage, to: target, reason: str(args.reason), author: args.author,
                    at: this.now(), trigger: { ids: t.ids, instant: t.instant } };
    const w = this.#append(e, entry, { stage: target, blurb: `Advanced to stage ${target}` });
    if (!w.ok) return w;
    return { ok: true, id: e.id, from: e.stage, to: target, stage_name: STAGES[target], reason: entry.reason,
             author: entry.author, at: entry.at, trigger: entry.trigger };
  }

  /** R13: record that a member chose not to advance along a proposed edge now. */
  escalationDecline(args = {}) {
    const a = this.#edgeArgs("decline", args, args);
    if (a.refused) return a.refused;
    const { e, target } = a;
    const { triggers } = this.#triggers(e, instantMs(this.now()), args.viewer);
    const t = triggers.find((x) => x.to === target);
    /* DEC-49 REGION is-edge-proposed */
    if (!t || !t.met)
      return refusal("NOT_PROPOSED", `stage ${target} (${STAGES[target]}) is not proposed: ${t ? t.missing : "no trigger"}. Nothing was written.`,
                     { from: e.stage, to: target });
    /* END DEC-49 REGION is-edge-proposed */
    const entry = { kind: "decline", from: e.stage, to: target, reason: str(args.reason), author: args.author, at: this.now() };
    const w = this.#append(e, entry, { blurb: `Declined stage ${target}` });
    if (!w.ok) return w;
    return { ok: true, id: e.id, from: e.stage, to: target, reason: entry.reason, author: entry.author, at: entry.at,
             says: "the proposal stays in the read, with its age and this decline" };
  }

  /** R14: end an escalation, only when compliance is restored and the consequences are addressed. */
  escalationEnd(args = {}) {
    const { id, author, viewer } = args;
    /* DEC-49 REGION is-end-member */
    if (isMachine(author))
      return refusal("MACHINE_CANNOT_END", "an escalation is ended by a named member. Nothing was written.");
    /* END DEC-49 REGION is-end-member */
    const judged = refuseJudgment(args);
    if (judged) return judged;
    const e = this.#row(id, viewer);
    if (!e) return refuseNoSuchEscalation();
    /* DEC-49 REGION is-end-once */
    if (e.state === "ended") return refusal("ALREADY_ENDED", "this escalation has ended; an ended escalation is never reopened.");
    /* END DEC-49 REGION is-end-once */
    const c = this.#compliance(e, viewer);
    /* DEC-49 REGION is-compliance-restored */
    if (c.state !== "met")
      return refusal("COMPLIANCE_NOT_RESTORED", `compliance is not restored: ${c.why}. Nothing was written.`,
                     { ids: c.ids, standards: c.standards ?? [] });
    /* END DEC-49 REGION is-compliance-restored */
    const q = this.#consequencesState(e, viewer);
    /* DEC-49 REGION is-consequences-addressed */
    if (q.state === "not_met")
      return refusal("CONSEQUENCES_NOT_ADDRESSED", `the consequences are not addressed: ${q.why}. Nothing was written.`, { ids: q.ids });
    /* END DEC-49 REGION is-consequences-addressed */
    /* DEC-49 REGION is-consequences-determined */
    if (q.state !== "met")
      return refusal("CONSEQUENCES_UNDETERMINED", `whether the consequences are addressed is undetermined: ${q.why}. A group `
                     + "that judges the breach had no consequence records an assessed part saying so and addresses it. Nothing was written.",
                     { ids: q.ids });
    /* END DEC-49 REGION is-consequences-determined */
    const entry = { kind: "end", from: e.stage, author, at: this.now(), compliance: c.ids, consequences: q.ids };
    const w = this.#append(e, entry, { state: "ended", blurb: "Escalation ended" });
    if (!w.ok) return w;
    return { ok: true, id: e.id, state: "ended", ended_by: author, at: entry.at, compliance: c.ids, consequences: q.ids };
  }

  /** R15: suspend an open escalation, with a reason. */
  escalationSuspend(args = {}) {
    const { id, reason, author, viewer } = args;
    /* DEC-49 REGION is-suspend-member */
    if (isMachine(author))
      return refusal("MACHINE_CANNOT_SUSPEND", "an escalation is suspended by a named member. Nothing was written.");
    /* END DEC-49 REGION is-suspend-member */
    const judged = refuseJudgment(args);
    if (judged) return judged;
    const e = this.#row(id, viewer);
    if (!e) return refuseNoSuchEscalation();
    if (e.state === "ended") return refuseEnded();
    /* DEC-49 REGION is-suspend-once */
    if (e.state === "suspended") return refusal("ALREADY_SUSPENDED", `suspended since ${e.stateSince}. Nothing was written.`);
    /* END DEC-49 REGION is-suspend-once */
    const bad = refuseReason(reason);
    if (bad) return bad;
    const entry = { kind: "suspend", from: e.stage, reason: str(reason), author, at: this.now() };
    const w = this.#append(e, entry, { state: "suspended", blurb: "Escalation suspended" });
    if (!w.ok) return w;
    return { ok: true, id: e.id, state: "suspended", stage: e.stage, reason: entry.reason, author, at: entry.at,
             says: "suspended: not ended. Its proposals are not reported as due; its clocks keep running in the actions." };
  }

  /** R15: resume a suspended escalation at the same stage. */
  escalationResume(args = {}) {
    const { id, reason, author, viewer } = args;
    /* DEC-49 REGION is-resume-member */
    if (isMachine(author))
      return refusal("MACHINE_CANNOT_RESUME", "an escalation is resumed by a named member. Nothing was written.");
    /* END DEC-49 REGION is-resume-member */
    const judged = refuseJudgment(args);
    if (judged) return judged;
    const e = this.#row(id, viewer);
    if (!e) return refuseNoSuchEscalation();
    if (e.state === "ended") return refuseEnded();
    /* DEC-49 REGION is-resume-suspended */
    if (e.state !== "suspended") return refusal("NOT_SUSPENDED", "this escalation is open. Nothing was written.");
    /* END DEC-49 REGION is-resume-suspended */
    const entry = { kind: "resume", from: e.stage, reason: str(reason) || null, author, at: this.now() };
    const w = this.#append(e, entry, { state: "open", blurb: "Escalation resumed" });
    if (!w.ok) return w;
    return { ok: true, id: e.id, state: "open", stage: e.stage, author, at: entry.at };
  }

  /** R16: every open escalation with a proposed edge not advanced or declined since its trigger was met, oldest first. */
  escalationsDue({ nowMs, limit, viewer } = {}) {
    const at = Number.isFinite(nowMs) ? nowMs : instantMs(this.now());
    const cap = Number.isInteger(limit) && limit > 0 ? Math.min(limit, DUE_MAX) : DUE_MAX;
    const items = [];
    for (const r of this.#rows(`SELECT escalation_id FROM escalations WHERE state='open' ORDER BY escalation_id`)) {
      const e = this.#row(r.escalation_id, viewer);
      if (!e) continue;
      const { triggers } = this.#triggers(e, at, viewer);
      for (const p of this.#proposed(e, triggers, at))
        if (!p.declined_since_met)
          items.push({ id: e.id, project: e.project, from: p.from, to: p.to, stage: p.stage, instant: p.instant,
                       age_ms: p.age_ms, ids: p.ids, by: "protocol" });
    }
    items.sort((a, b) => instantOrder(a.instant, b.instant) || (a.id < b.id ? -1 : a.id > b.id ? 1 : a.to - b.to));
    return { ok: true, as_of: iso(at), items: items.slice(0, cap), truncated: items.length > cap, limit: cap };
  }
}

/* ===================================================================== *
 * THE CODES SEVERAL ACTS ANSWER, each minted once (DEC-49's one code, one site; K231)
 * ===================================================================== */

/** R2, R20: absent and unseen are one answer. */
export function refuseNoSuchEscalation() {
  /* DEC-49 REGION is-escalation-seen */
  return refusal("NO_SUCH_ESCALATION", "no escalation answers to that id here; one in a project you may not see is "
    + "answered exactly as one that does not exist.");
  /* END DEC-49 REGION is-escalation-seen */
}

/** R14: an ended escalation is never reopened, so nothing is added to it. */
export function refuseEnded() {
  /* DEC-49 REGION is-escalation-ended */
  return refusal("ESCALATION_ENDED", "this escalation has ended; nothing is added to it and it is never reopened. "
    + "Nothing was written.");
  /* END DEC-49 REGION is-escalation-ended */
}

/** R10: the evaluation names a received entry of an attached action, or none for `none`. */
export function refuseNoSuchResponse(why) {
  /* DEC-49 REGION is-named-response */
  return refusal("NO_SUCH_RESPONSE", `${why} Nothing was written.`);
  /* END DEC-49 REGION is-named-response */
}

/** R10, R13, R15: a reason of 1 to 2,000 characters; null when it is one. */
export function refuseReason(reason) {
  const r = str(reason);
  /* DEC-49 REGION is-reason-given */
  if (!r || r.length > REASON_MAX)
    return refusal("NO_REASON", `a reason of 1 to ${REASON_MAX} characters is required. Nothing was written.`);
  /* END DEC-49 REGION is-reason-given */
  return null;
}

/** R19: an input carrying a judgment of significance is refused; null when it carries none. */
export function refuseJudgment(args) {
  const found = isObj(args) ? JUDGMENT_KEYS.filter((k) => k in args) : [];
  /* DEC-49 REGION is-no-judgment */
  if (found.length)
    return refusal("ESCALATION_CARRIES_NO_JUDGMENT", "an escalation records no significance, severity, priority, urgency, "
      + "rank or score: whether a breach warrants action, and how urgently, is a member's judgment, made with the "
      + "consequences in front of them. Nothing was written.", { keys: found });
  /* END DEC-49 REGION is-no-judgment */
  return null;
}

/** K248: a provider built beside this module in layer 9 that this host has not been given. The act or read that needs
 *  it refuses, naming it, and never answers as though its part were empty. */
export function refuseProviderUnavailable(provider) {
  /* DEC-49 REGION is-provider-present */
  return refusal("PROVIDER_UNAVAILABLE", `this answer reads the ${provider} module, which this instance does not have yet; `
    + "nothing is answered in its place.", { provider });
  /* END DEC-49 REGION is-provider-present */
}

class ProviderAbsent extends Error {
  constructor(provider) { super(`escalation: ${provider} was not given`); this.provider = provider; }
}

/* Every service answers PROVIDER_UNAVAILABLE, rather than throwing or answering in part, when a provider it reads is
   absent (K248). */
for (const name of ["escalationOpen", "escalationRead", "escalationAttach", "escalationEvaluate", "escalationAdvance",
                    "escalationDecline", "escalationEnd", "escalationSuspend", "escalationResume", "escalationsDue"]) {
  const f = Escalation.prototype[name];
  Object.defineProperty(Escalation.prototype, name, { configurable: true, writable: true, value: function (...a) {
    try { return f.apply(this, a); }
    catch (e) { if (e instanceof ProviderAbsent) return refuseProviderUnavailable(e.provider); throw e; }
  } });
}

const instances = new WeakMap();

/** K61: the one instance per host, created on the first call with `deps`. It migrates its tables, so a purge that
 *  reads their declaration finds them (K267), declares them to purge (R20) and registers its check and projection with
 *  promotion (R17, R18, R21). */
export function escalationOf(host, deps) {
  let i = instances.get(host);
  if (!i) {
    const d = deps || {};
    const storage = d.storage || host.storage;
    const record = d.record || recordOf(host);
    const membership = d.membership || membershipOf(host, { record });
    const promotion = d.promotion || promotionOf(host, { record, membership });
    /* A provider merged into the tranche is reached through its factory on the same host unless given (K248, K250);
       one not yet merged stays an injected dep, and its absence refuses (PROVIDER_UNAVAILABLE). */
    const conformance = d.conformance || (() => conformanceOf(host, { record, membership, promotion }));
    const actions = d.actions || (() => actionsOf(host, { record, membership, promotion }));
    const filings = d.filings || (() => filingsOf(host, { record, membership, promotion }));
    const consequences = d.consequences
      || (() => consequencesModule(host, { record, membership, promotion, conformance: typeof conformance === "function" ? conformance() : conformance }));
    i = new Escalation({ ...d, storage, record, membership, promotion, conformance, consequences, actions, filings });
    instances.set(host, i);
    i.migrate();
    record.declarePurge("escalation", ESCALATION_TABLES);
    promotion.registerStep("escalation", { check: (c) => i.check(c), project: (c) => i.project(c) });
  }
  return i;
}
