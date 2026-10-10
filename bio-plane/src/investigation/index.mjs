// @ts-check
/* investigation (layer 7; T41-33, N820; D1, D15, D16, D19, D20, D27, D30, D48, H27, H28): a project's own working
 * material over its steps and objective. It publishes nothing and writes only its own tables (R10).
 *
 *   milestoneSet, milestoneRevise, milestoneRemove, milestoneItemRemove,   milestones, their state derived on read, and
 *   milestonesOf, milestonesOverdue, milestoneReminder (R1–R5)            the one notice each overdue one gives
 *   reportDraft, reportKeep, reportsOf (R6–R9)                            status reports, drafted by code from the record
 *   interviewForm, interviewKeep, interviewOf (R11–R13)                   the intake interview, kept as narrative
 *   narrativeClaim, claimFindStep, claimFound, claimsOf (R14, R15)        a remembered claim, turned into something to find
 *   firsthandAccount (R16)                                                a member who was there: provenance's testimony
 *   planPropose, planProposals, planAccept (R20)                          the assistant's planning proposals, accepted
 *   quietState, quietPrompts, projectWatch, projectCloseWithGaps,         when the work goes quiet, and where the evidence
 *   watchedProjects, watchArrival, projectStanding (R17–R19)              stands
 *   check (R12)                                                           registered with `promotion`
 *
 * SHAPE (K61). `investigationOf(host, deps)` answers the one instance per host; making it creates and declares the
 * tables (R10) and registers the leg check with `promotion` (its R39). `deps` may give `record`, `membership`,
 * `promotion`, `steps`, `legEarning`, `inquiry`, `basisVersions`, `intent`, `captureRequests`, `provenance` (each
 * otherwise its factory on the same host, reached on first use), `view` (the active jurisdiction view, whose
 * `time_zone` gives the local day), `now` (a clock answering an ISO instant) and `personWarning` (a stand-in for
 * inquiry R59's test, for a test).
 *
 * A viewer, and every act's `by`, is the control plane's stamp; an absent one fails closed. Every act here has a path
 * by hand that needs no AI (R21): the assistant only proposes (`planPropose`, a proposed find step, a drafted
 * interview), and a member's act takes it up. Every refusal is `{ok: false, reason, code, check, translation, detail}`
 * and writes nothing. */
import { isMachineIdentity, ACCEPTANCE_FORMS, acceptanceRecord, lawProposalState, sha256HexSync, isStepId }
  from "../record-grammar/index.mjs";
import { recordOf, stampInstant } from "../record-core/index.mjs";
import { membershipOf, noSuchProject, listenerRefusal } from "../membership/index.mjs";
import { promotionOf } from "../promotion/index.mjs";
import { provenanceOf } from "../provenance/index.mjs";
import { legEarningOf } from "../leg-earning/index.mjs";
import { inquiryOf, personWarning as inquiryPersonWarning } from "../inquiry/index.mjs";
import { basisVersionsOf } from "../basis-versions/index.mjs";
import { captureRequestsOf } from "../capture-requests/index.mjs";
import { stepsOf } from "../steps/index.mjs";
import { INTAKE_QUESTIONS } from "../skilldoctrine.mjs";
import { intentOf, CLOSED_REASONS } from "../intent/index.mjs";
import { localDay, isCalendarDate } from "../civil-time/index.mjs";
import { combine as combineProfiles } from "../../../jurisdictions/index.mjs";
import { INVESTIGATION_SCHEMA, INVESTIGATION_TABLES } from "./schema.mjs";
import { INVESTIGATION_CHECKS } from "./checks.mjs";

export { INVESTIGATION_SCHEMA, INVESTIGATION_TABLES, INVESTIGATION_CHECKS };

/** The module's name: its tables' declarer and its promotion step. */
export const OWNER = "investigation";
/** R2: a milestone's states, and how near a date reads as nearing (local days). */
export const MILESTONE_STATES = Object.freeze(["met", "open", "stuck"]);
export const NEARING_DAYS = 7;
/** R1: what a milestone waits on. */
export const ITEM_KINDS = Object.freeze(["question", "step"]);
/** R20: what a planning proposal is. */
export const PLAN_KINDS = Object.freeze(["question", "step"]);
/** R15: how a claim stands, and how its look stands. */
export const CLAIM_STATES = Object.freeze(["as_recalled", "found"]);
export const LOOK_STATES = Object.freeze(["not_yet_looked_for", "looked_for_and_not_found"]);
/** R11: the interview's six questions are `skills`' (its R41), read from there and never re-listed. */
export { INTAKE_QUESTIONS };
/** The work an interview's step names (R12) and a claim's find step names (R14). */
export const INTERVIEW_WORK = "Intake interview";
export const FIND_WORK_PREFIX = "Find the record: ";
export const NAME_MAX = 200, REASON_MAX = 2000, REPORT_MAX = 20000, ANSWER_MAX = 20000, CLAIM_MAX = 2000, PLAN_MAX = 500,
  ABOUT_MAX = 500;
/** The plane's own viewer, which sees every record: R17's quiet is judged the same for every reader. */
export const PLANE_VIEWER = "class:daemon";
const STEP_CLOSED = Object.freeze(["ended", "set_aside"]);
const QUESTION_PAGE = 500, QUESTIONS_MAX = 2000, STEP_PAGE = 1000, STEPS_MAX = 5000;

const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const filled = (v) => typeof v === "string" && v.trim() !== "";
const json = (v) => JSON.stringify(v);
const parse = (s) => { try { return s == null ? null : JSON.parse(s); } catch { return null; } };
const chars = (s) => [...s].length;
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;
const dayNumber = (d) => Date.UTC(Number(d.slice(0, 4)), Number(d.slice(5, 7)) - 1, Number(d.slice(8, 10))) / 86400000;
const yamlString = (s) => `"${String(s).replace(/\\/g, "'").replace(/"/g, "'").replace(/[\r\n]+/g, " ").trim()}"`;

/** Every refusal (Provides): its row's `check` and `translation`, a `detail`, and the caller's fields beside them. */
function refuse(code, detail, extra = {}) {
  const row = INVESTIGATION_CHECKS[code];
  return { ...extra, ok: false, reason: code, code, check: row.check, translation: row.translation, detail };
}

const instances = new WeakMap();
const storageOf = (host) => (host && host.storage ? host.storage : host);

/** K61: the one instance per host, made on the first call (`deps` read then only). */
export function investigationOf(host, deps = {}) {
  const storage = storageOf(host);
  let s = instances.get(storage);
  if (!s) {
    const record = deps.record ?? recordOf(host);
    const membership = deps.membership ?? membershipOf(host, { record });
    const promotion = deps.promotion ?? promotionOf(host, { record, membership });
    s = new Investigation(storage, { ...deps, record, membership, promotion, host });
    instances.set(storage, s);
    s.migrate();
    const r = promotion.registerStep(OWNER, { check: (c) => s.check(c) });
    if (r && r.ok === false) throw new Error(`investigation: registerStep refused: ${r.reason || r.code}`);
  }
  return s;
}

export class Investigation {
  #sql; #record; #membership; #promotion; #host; #deps; #viewFn; #now; #personWarning;
  #runHolder = null;                 // R20: {module, fn(by, run) → {principal} | null}
  #disposition = null;               // R2: {module, fn({project, question}) → "deferred" | "dismissed" | null}
  #declared = false;

  constructor(storage, { record, membership, promotion, host = null, view = null, now = null, personWarning = null, ...rest }) {
    this.#sql = storage.sql;
    this.#record = record;
    this.#membership = membership;
    this.#promotion = promotion;
    this.#host = host;
    this.#deps = { ...rest };
    this.#viewFn = typeof view === "function" ? view : null;
    this.#now = typeof now === "function" ? now : () => new Date().toISOString();
    this.#personWarning = typeof personWarning === "function" ? personWarning : null;
  }

  #rows(q, ...a) { return [...this.#sql.exec(q, ...a)]; }
  #one(q, ...a) { const r = this.#rows(q, ...a); return r.length ? r[0] : null; }
  #at() { return stampInstant("second", Date.parse(this.#now())); }

  /* The modules this one reads, each the one `deps` gave or its factory on the same host, reached on first use. */
  #dep(name, make) {
    if (!this.#deps[name] && this.#host) { try { this.#deps[name] = make(this.#host); } catch { this.#deps[name] = null; } }
    return this.#deps[name] ?? null;
  }
  get #steps() { return this.#dep("steps", (h) => stepsOf(h)); }
  get #legEarning() { return this.#dep("legEarning", (h) => legEarningOf(h)); }
  get #inquiry() { return this.#dep("inquiry", (h) => inquiryOf(h)); }
  get #basisVersions() { return this.#dep("basisVersions", (h) => basisVersionsOf(h)); }
  get #intent() { return this.#dep("intent", (h) => intentOf(h)); }
  get #captureRequests() { return this.#dep("captureRequests", (h) => captureRequestsOf(h)); }
  get #provenance() { return this.#dep("provenance", (h) => provenanceOf(h)); }

  /* ---- boot (R10) ---- */

  /** The tables, their triggers and their declaration (R10). Idempotent; a refused declaration is a defect of the
   *  wiring and throws. */
  migrate() {
    const bare = INVESTIGATION_SCHEMA.split("\n").map((l) => l.replace(/--.*$/, "")).join("\n");
    for (const part of bare.split(/(?=CREATE TRIGGER)/)) {
      if (part.startsWith("CREATE TRIGGER")) {
        const end = part.indexOf("END;");
        this.#sql.exec(part.slice(0, end + 4));
        for (const st of part.slice(end + 4).split(";")) if (st.trim()) this.#sql.exec(st.trim());
      } else for (const st of part.split(";")) if (st.trim()) this.#sql.exec(st.trim());
    }
    if (this.#declared) return { ok: true, already: true };
    /* R10: working material, never carried in any export to the public; the group's own administrators may export it;
       every row goes with its project. */
    const base = { purge: "clear", expunge: "none", export: "admin-only", sight: "bundle", derive: "stored", version_chain: false };
    const d = this.#record.declareTable(OWNER, INVESTIGATION_TABLES.map((t) => ({ ...base, name: t.name, keys: [...t.keys] })));
    if (d && d.ok === false) throw new Error(`investigation: declareTable refused: ${d.reason}`);
    this.#declared = true;
    return { ok: true };
  }

  /* ---- registrations (R2, R20) ---- */

  /** R20: the read of whether a machine credential holds a run, registered once (as `steps` R1's): `fn(by, run)`
   *  answers `{principal}` (the member viewer the run acts for) or null. */
  registerRunHolder(module, fn) {
    const refused = listenerRefusal(this.#runHolder ? { module: this.#runHolder.module } : null, module, fn);
    if (refused) return refused;
    this.#runHolder = { module, fn };
    return { ok: true, module };
  }
  /** R2: a later module that holds a project's own deferral or dismissal of a question (`queue`'s project arm, inquiry
   *  R39) registers its read once: `fn({project, question})` answers `"deferred"`, `"dismissed"` or null. */
  registerProjectDisposition(module, fn) {
    const refused = listenerRefusal(this.#disposition ? { module: this.#disposition.module } : null, module, fn);
    if (refused) return refused;
    this.#disposition = { module, fn };
    return { ok: true, module };
  }

  /* ---- who is asking ---- */

  /* The act's stamp read: a machine credential, a member (with her viewer stamp), or null (absent, fails closed). */
  #actor(by) {
    if (!filled(by)) return null;
    if (isMachineIdentity(by)) return { machine: true, by, member: null, viewer: by.replace(/\/.*$/, "") };
    let m = null;
    try { m = this.#membership.positionalMember(by); } catch { m = null; }
    return filled(m) ? { machine: false, by, member: m, viewer: `member:${m}` } : null;
  }
  #memberOf(viewer) {
    if (!filled(viewer) || isMachineIdentity(viewer)) return null;
    try { const m = this.#membership.positionalMember(viewer); return filled(m) ? m : null; } catch { return null; }
  }
  #handle(member) {
    try { const f = this.#membership.memberFacts(member); return f && filled(f.handle) ? f.handle : null; } catch { return null; }
  }
  #shown(stamp) { const m = this.#memberOf(stamp); return m ? this.#handle(m) : stamp; }

  /* ---- the project (membership R44, R55) ---- */

  /* R1's read gate: a project the viewer sees at FULL; at EXISTENCE C-70.1, otherwise absent. Null to proceed. */
  #projectSeen(project, viewer) {
    const b = filled(project) ? this.#record.bundleInfo(project) : null;
    const ex = b && b.type === "project" && filled(viewer) ? this.#membership.existenceAct(project, viewer) : null;
    if (ex) return ex;
    if (!b || b.type !== "project" || !filled(viewer) || !this.#membership.inSight(project, viewer))
      return noSuchProject(filled(project) ? project : null);
    return null;
  }
  /* An act's gate: a member (`INVESTIGATION_MEMBER_ONLY` for a machine), seeing the project, joined in it. */
  #memberGate(project, by, act) {
    const a = this.#actor(by);
    if (a && a.machine) return { refusal: refuse("INVESTIGATION_MEMBER_ONLY", `${act} is a member's act`) };
    if (!a) return { refusal: noSuchProject(filled(project) ? project : null) };
    const seen = this.#projectSeen(project, a.viewer);
    if (seen) return { refusal: seen };
    const bad = this.#membership.projectAuthority(project, a.viewer, "joined", act);
    return bad ? { refusal: bad } : { actor: a };
  }

  /* ---- the local day ---- */

  #zone() {
    let view = null;
    try {
      if (this.#viewFn) view = this.#viewFn();
      else {
        const ids = this.#record.getSetting("jurisdiction_profiles");
        const c = Array.isArray(ids) && ids.length ? combineProfiles(ids) : null;
        view = c && c.ok ? c.view : null;
      }
    } catch { view = null; }
    const z = view && view.time_zone && typeof view.time_zone.value === "string" ? view.time_zone.value : null;
    if (!z) return null;
    try { return typeof localDay("2026-01-01T00:00:00Z", z) === "string" ? z : null; } catch { return null; }
  }
  #today(instant) {
    const zone = this.#zone();
    if (!zone || !filled(instant)) return null;
    try { const d = localDay(String(instant).replace(/\.\d+Z$/, "Z"), zone); return typeof d === "string" ? d : null; } catch { return null; }
  }

  /* ---- what the project works on (basis-versions R41, R22; steps R4) ---- */

  /* Every question the project draws on, with this project's stance (basis-versions R41), in id order; null when the
     read fails or passes its bound. Viewer-free: the caller fences the project and each question. */
  #questionsOf(project) {
    const bv = this.#basisVersions;
    if (!bv || typeof bv.projectQuestions !== "function") return null;
    const out = [];
    let after = null;
    try {
      for (;;) {
        const r = bv.projectQuestions({ project, after, limit: QUESTION_PAGE });
        if (!isObj(r) || !Array.isArray(r.items)) return null;
        out.push(...r.items);
        if (!filled(r.cursor) || !r.items.length) break;
        if (out.length > QUESTIONS_MAX) return null;
        after = r.cursor;
      }
    } catch { return null; }
    return out;
  }
  /* The project's questions a viewer sees. */
  #questionsSeen(project, viewer) {
    const qs = this.#questionsOf(project);
    return qs === null ? null : qs.filter((q) => this.#seenBundle(q.inquiry, viewer));
  }
  #seenBundle(id, viewer) { try { return !!this.#record.bundleInfo(id) && this.#membership.inSight(id, viewer) === true; } catch { return false; } }

  /* Every page of one of steps' reads (R4), as `viewer`; null when it fails or passes its bound. */
  #allSteps(read, args) {
    const s = this.#steps;
    if (!s || typeof s[read] !== "function") return null;
    const out = [];
    let after = null;
    try {
      for (;;) {
        const r = s[read]({ ...args, after, limit: STEP_PAGE });
        if (!isObj(r) || r.ok === false || !Array.isArray(r.steps)) return null;
        out.push(...r.steps);
        if (!r.truncated) break;
        if (out.length > STEPS_MAX) return null;
        after = r.next && r.next.after;
      }
    } catch { return null; }
    return out;
  }
  /* The project's steps and those on the questions it draws on, each once, as `viewer` sees them; null when a read
     fails. `question` narrows to one question's. */
  #workSteps(project, viewer, questions, question = null) {
    const by = new Map();
    const own = question ? [] : this.#allSteps("stepsIn", { project, viewer });
    if (own === null) return null;
    for (const s of own) by.set(s.step, s);
    for (const q of question ? [question] : questions.map((x) => x.inquiry)) {
      const on = this.#allSteps("stepsOn", { question: q, viewer });
      if (on === null) return null;
      for (const s of on) by.set(s.step, s);
    }
    return [...by.values()].sort((a, b) => (a.step < b.step ? -1 : 1));
  }

  /* ---- milestones (R1–R5) ---- */

  /* R1: a `waitsOn` list read for an actor: `[{kind, ref}]`, or a refusal. An item not of this project, or not seen, is
     `MILESTONE_ITEM_UNKNOWN`, answered as absent. */
  #items(project, waitsOn, viewer) {
    if (!Array.isArray(waitsOn) || waitsOn.length === 0)
      return { refusal: refuse("MILESTONE_WAITS_ON_NOTHING", "a milestone names at least one question or step it waits on") };
    const qs = this.#questionsSeen(project, viewer);
    if (qs === null) return { refusal: refuse("MILESTONE_ITEM_UNKNOWN", "the questions this project draws on could not be read") };
    const qids = new Set(qs.map((q) => q.inquiry));
    const out = [];
    for (const raw of waitsOn) {
      const it = typeof raw === "string" ? { kind: isStepId(raw.trim()) ? "step" : "question", ref: raw.trim() }
        : isObj(raw) ? { kind: raw.kind, ref: typeof raw.ref === "string" ? raw.ref.trim() : (raw.question ?? raw.step ?? "") } : null;
      if (it && !filled(it.kind) && isObj(raw)) it.kind = raw.question ? "question" : raw.step ? "step" : "";
      if (!it || !ITEM_KINDS.includes(it.kind) || !filled(it.ref))
        return { refusal: refuse("MILESTONE_ITEM_UNKNOWN", "an item is a question or a step, by id", { item: raw ?? null }) };
      if (it.kind === "question" && !qids.has(it.ref))
        return { refusal: refuse("MILESTONE_ITEM_UNKNOWN", "no question this project draws on by that id that you can see", { item: it.ref }) };
      if (it.kind === "step" && !this.#stepOfProject(it.ref, project, qids, viewer))
        return { refusal: refuse("MILESTONE_ITEM_UNKNOWN", "no step of this project by that id that you can see", { item: it.ref }) };
      if (!out.some((o) => o.kind === it.kind && o.ref === it.ref)) out.push({ kind: it.kind, ref: it.ref });
    }
    return { items: out };
  }
  /* A step the viewer sees, placed in this project or on a question it draws on. */
  #stepOfProject(stepId, project, qids, viewer) {
    try {
      const s = this.#steps.step({ step: stepId, viewer });
      if (!s || s.ok !== true) return false;
      return s.place.project === project || (Array.isArray(s.place.questions) && s.place.questions.some((q) => qids.has(q)));
    } catch { return false; }
  }

  #history(milestoneId, project, act, detail, by, at) {
    this.#sql.exec(`INSERT INTO inv_milestone_history (milestone_id, project_id, act, detail_json, by_actor, at) VALUES (?,?,?,?,?,?)`,
      milestoneId, project, act, detail === null ? null : json(detail), by, at);
  }

  /** R1: `milestoneSet({project, name, date, waitsOn, by})`, by a joined participant; history kept. */
  milestoneSet({ project = null, name = null, date = null, waitsOn = null, by = null } = {}) {
    const g = this.#memberGate(project, by, "milestoneSet");
    if (g.refusal) return g.refusal;
    if (!filled(name) || chars(name.trim()) > NAME_MAX) return refuse("MILESTONE_NO_NAME", `a milestone's name is 1–${NAME_MAX} characters`);
    if (!filled(date) || !isCalendarDate(date)) return refuse("MILESTONE_BAD_DATE", "a milestone's date is YYYY-MM-DD");
    const it = this.#items(project, waitsOn, g.actor.viewer);
    if (it.refusal) return it.refusal;
    const at = this.#at();
    return this.#record.transact(() => {
      this.#sql.exec(`INSERT INTO inv_milestones (project_id, name, date, by_actor, at) VALUES (?,?,?,?,?)`, project, name.trim(), date, by, at);
      const id = Number(this.#one(`SELECT MAX(milestone_id) AS id FROM inv_milestones`).id);
      for (const i of it.items)
        this.#sql.exec(`INSERT INTO inv_milestone_items (milestone_id, project_id, kind, ref, by_actor, at) VALUES (?,?,?,?,?,?)`, id, project, i.kind, i.ref, by, at);
      this.#history(id, project, "set", { name: name.trim(), date, waitsOn: it.items }, by, at);
      return { ok: true, milestone: id, project, at };
    });
  }

  /* A milestone held and not removed, and the act's gate on its project. */
  #milestoneGate(milestone, by, act) {
    const m = Number.isSafeInteger(Number(milestone)) && milestone !== null && milestone !== ""
      ? this.#one(`SELECT * FROM inv_milestones WHERE milestone_id = ? AND removed_at IS NULL`, Number(milestone)) : null;
    const noSuch = refuse("NO_SUCH_MILESTONE", "no milestone by that number is held that you can see", { milestone: milestone ?? null });
    if (!m) return { refusal: noSuch };
    const a = this.#actor(by);
    if (!a || a.machine || this.#projectSeen(m.project_id, a.viewer)) return { refusal: a && a.machine ? refuse("INVESTIGATION_MEMBER_ONLY", `${act} is a member's act`) : noSuch };
    const bad = this.#membership.projectAuthority(m.project_id, a.viewer, "joined", act);
    return bad ? { refusal: bad } : { m, actor: a };
  }

  /** R1: `milestoneRevise({milestone, name?, date?, waitsOn?, by})`: a new name, date or added items, with history. */
  milestoneRevise({ milestone = null, name = undefined, date = undefined, waitsOn = undefined, by = null } = {}) {
    const g = this.#milestoneGate(milestone, by, "milestoneRevise");
    if (g.refusal) return g.refusal;
    const { m } = g;
    if (name !== undefined && (!filled(name) || chars(name.trim()) > NAME_MAX)) return refuse("MILESTONE_NO_NAME", `a milestone's name is 1–${NAME_MAX} characters`);
    if (date !== undefined && (!filled(date) || !isCalendarDate(date))) return refuse("MILESTONE_BAD_DATE", "a milestone's date is YYYY-MM-DD");
    let add = [];
    if (waitsOn !== undefined) {
      const it = this.#items(m.project_id, waitsOn, g.actor.viewer);
      if (it.refusal) return it.refusal;
      const held = this.#itemRows(m.milestone_id).filter((r) => !r.removed_at);
      add = it.items.filter((i) => !held.some((h) => h.kind === i.kind && h.ref === i.ref));
    }
    const at = this.#at();
    return this.#record.transact(() => {
      const detail = {};
      if (name !== undefined && name.trim() !== m.name) { this.#sql.exec(`UPDATE inv_milestones SET name = ? WHERE milestone_id = ?`, name.trim(), m.milestone_id); detail.name = { from: m.name, to: name.trim() }; }
      if (date !== undefined && date !== m.date) { this.#sql.exec(`UPDATE inv_milestones SET date = ? WHERE milestone_id = ?`, date, m.milestone_id); detail.date = { from: m.date, to: date }; }
      for (const i of add)
        this.#sql.exec(`INSERT INTO inv_milestone_items (milestone_id, project_id, kind, ref, by_actor, at) VALUES (?,?,?,?,?,?)`, m.milestone_id, m.project_id, i.kind, i.ref, by, at);
      if (add.length) detail.added = add;
      this.#history(m.milestone_id, m.project_id, "revise", detail, by, at);
      return { ok: true, milestone: Number(m.milestone_id), at };
    });
  }

  /** R1: `milestoneRemove({milestone, reason, by})`: it leaves every read; its history stays. */
  milestoneRemove({ milestone = null, reason = null, by = null } = {}) {
    const g = this.#milestoneGate(milestone, by, "milestoneRemove");
    if (g.refusal) return g.refusal;
    if (!filled(reason) || chars(reason) > REASON_MAX) return refuse("INVESTIGATION_NO_REASON", `say why, in 1–${REASON_MAX} characters`);
    const at = this.#at();
    return this.#record.transact(() => {
      this.#sql.exec(`UPDATE inv_milestones SET removed_by = ?, removed_at = ?, removed_reason = ? WHERE milestone_id = ?`, by, at, reason.trim(), g.m.milestone_id);
      this.#history(g.m.milestone_id, g.m.project_id, "remove", { reason: reason.trim() }, by, at);
      return { ok: true, milestone: Number(g.m.milestone_id), removed: true, at };
    });
  }

  /** R1, R2: `milestoneItemRemove({milestone, item, reason, by})`: a member takes an item off, recorded. */
  milestoneItemRemove({ milestone = null, item = null, reason = null, by = null } = {}) {
    const g = this.#milestoneGate(milestone, by, "milestoneItemRemove");
    if (g.refusal) return g.refusal;
    const ref = typeof item === "string" ? item.trim() : isObj(item) ? String(item.ref ?? item.question ?? item.step ?? "").trim() : "";
    const row = this.#itemRows(g.m.milestone_id).find((r) => !r.removed_at && r.ref === ref);
    if (!row) return refuse("MILESTONE_ITEM_UNKNOWN", "this milestone waits on no item by that id", { item: ref || null });
    if (!filled(reason) || chars(reason) > REASON_MAX) return refuse("INVESTIGATION_NO_REASON", `say why, in 1–${REASON_MAX} characters`);
    const at = this.#at();
    return this.#record.transact(() => {
      this.#sql.exec(`UPDATE inv_milestone_items SET removed_by = ?, removed_at = ?, removed_reason = ? WHERE item_id = ?`, by, at, reason.trim(), row.item_id);
      this.#history(g.m.milestone_id, g.m.project_id, "item_remove", { item: { kind: row.kind, ref }, reason: reason.trim() }, by, at);
      return { ok: true, milestone: Number(g.m.milestone_id), item: { kind: row.kind, ref }, removed: true, at };
    });
  }

  #itemRows(milestoneId) { return this.#rows(`SELECT * FROM inv_milestone_items WHERE milestone_id = ? ORDER BY item_id`, milestoneId); }

  /* R2: a question's own deferral or dismissal for this project: its own state, or the registered read; null else. */
  #disposed(project, question) {
    try {
      const h = this.#record.head(question);
      if (h && (h.currentState === "deferred" || h.currentState === "dismissed")) return h.currentState;
    } catch { /* read below */ }
    if (!this.#disposition) return null;
    try { const r = this.#disposition.fn({ project, question }); return r === "deferred" || r === "dismissed" ? r : null; } catch { return null; }
  }

  /* R2: one item's state for a viewer: `done`, `open`, `stuck` (naming why) or `undetermined`. */
  #itemState(project, item, viewer, stances) {
    if (item.kind === "question") {
      if (!this.#seenBundle(item.ref, viewer)) return { state: "undetermined", why: "not a question you can see" };
      const stance = stances.get(item.ref);
      if (stance === "concluded") return { state: "done", why: "this project concluded on it" };
      const d = this.#disposed(project, item.ref);
      if (d) return { state: "stuck", why: d };
      return { state: "open", ...(stance === undefined ? { why: "this project no longer draws on it" } : {}) };
    }
    let s = null;
    try { s = this.#steps.step({ step: item.ref, viewer }); } catch { s = null; }
    if (!s || s.ok !== true) return { state: "undetermined", why: "not a step you can see" };
    if (s.state === "ended") return { state: "done", why: "ended" };
    if (s.state === "set_aside") return { state: "stuck", why: "set_aside" };
    return { state: "open", step_state: s.state };
  }

  /* R2: a milestone as a viewer reads it. */
  #milestoneView(m, viewer, today, stances) {
    const items = this.#itemRows(m.milestone_id).map((r) => {
      const base = { kind: r.kind, ref: r.ref };
      if (r.removed_at) return { ...base, removed: { by: this.#shown(r.removed_by), at: r.removed_at, reason: r.removed_reason } };
      return { ...base, ...this.#itemState(m.project_id, r, viewer, stances) };
    });
    const live = items.filter((i) => !i.removed);
    const stuck = live.filter((i) => i.state === "stuck");
    const state = stuck.length ? "stuck" : live.length && live.every((i) => i.state === "done") ? "met" : "open";
    const delta = today ? dayNumber(m.date) - dayNumber(today) : null;
    return {
      milestone: Number(m.milestone_id), project: m.project_id, name: m.name, date: m.date, state,
      ...(stuck.length ? { stuck_on: stuck.map((i) => ({ kind: i.kind, ref: i.ref, why: i.why })) } : {}),
      nearing: delta === null ? null : state !== "met" && delta >= 0 && delta <= NEARING_DAYS,
      overdue: delta === null ? null : state !== "met" && delta < 0,
      ...(today ? {} : { why: "no time zone is held for your group's Civicsmith, so the local day is not known" }),
      items, by: this.#shown(m.by_actor), at: m.at,
      history: this.#rows(`SELECT act, detail_json, by_actor, at FROM inv_milestone_history WHERE milestone_id = ? ORDER BY seq`, m.milestone_id)
        .map((h) => ({ act: h.act, detail: parse(h.detail_json), by: this.#shown(h.by_actor), at: h.at })),
    };
  }
  #stances(project) {
    const qs = this.#questionsOf(project) ?? [];
    return new Map(qs.map((q) => [q.inquiry, q.stance]));
  }

  /** R1, R2, R4: `milestonesOf({project, viewer})`: the project's milestones, to a viewer at FULL sight of it. */
  milestonesOf({ project = null, viewer = null } = {}) {
    const seen = this.#projectSeen(project, viewer);
    if (seen) return seen;
    try {
      const today = this.#today(this.#now());
      const stances = this.#stances(project);
      const milestones = this.#rows(`SELECT * FROM inv_milestones WHERE project_id = ? AND removed_at IS NULL ORDER BY date, milestone_id`, project)
        .map((m) => this.#milestoneView(m, viewer, today, stances));
      return { ok: true, project, milestones };
    } catch { return noSuchProject(project); }
  }

  /* The projects a member is joined in (membership R120's read contract). */
  #joinedProjects(member) {
    try { return this.#rows(`SELECT project_id FROM project_participants WHERE member_id = ? AND state = 'joined' ORDER BY project_id`, member).map((r) => r.project_id); }
    catch { return []; }
  }

  /** R3: `milestonesOverdue({viewer, at})`, for `notice-producers`: each overdue milestone once to each joined
   *  participant (key per milestone and date), and each reminder she asked for, on its day, to her alone. Nothing
   *  else reminds (DEC-94). */
  milestonesOverdue({ viewer = null, at = null } = {}) {
    const member = this.#memberOf(viewer);
    if (!member) return { ok: true, due: [] };
    const today = filled(at) ? this.#today(at) : null;
    if (!today) return { ok: true, due: [], undetermined: true, why: "no time zone is held for your group's Civicsmith, or no instant was given" };
    const due = [];
    try {
      for (const project of this.#joinedProjects(member)) {
        if (!this.#membership.isJoinedParticipant(project, member) || this.#projectSeen(project, viewer)) continue;
        const stances = this.#stances(project);
        for (const m of this.#rows(`SELECT * FROM inv_milestones WHERE project_id = ? AND removed_at IS NULL AND date < ? ORDER BY milestone_id`, project, today)) {
          const v = this.#milestoneView(m, viewer, today, stances);
          if (v.state === "met") continue;
          due.push({ kind: "overdue", milestone: v.milestone, project, name: v.name, date: v.date, state: v.state,
                     key: sha256HexSync(`investigation:overdue:${v.milestone}:${v.date}`) });
        }
      }
      for (const r of this.#rows(`SELECT r.seq, r.day, m.* FROM inv_milestone_reminders r JOIN inv_milestones m ON m.milestone_id = r.milestone_id
                                   WHERE r.member = ? AND r.day = ? AND m.removed_at IS NULL ORDER BY r.seq`, member, today)) {
        if (this.#projectSeen(r.project_id, viewer)) continue;
        due.push({ kind: "reminder", milestone: Number(r.milestone_id), project: r.project_id, name: r.name, date: r.date,
                   key: sha256HexSync(`investigation:reminder:${r.seq}`) });
      }
    } catch { return { ok: true, due: [] }; }
    return { ok: true, due };
  }

  /** R3: `milestoneReminder({milestone, at, by})`: a reminder she asked for, answered to her alone on that day. */
  milestoneReminder({ milestone = null, at = null, by = null } = {}) {
    const g = this.#milestoneGate(milestone, by, "milestoneReminder");
    if (g.refusal) return g.refusal;
    if (!filled(at) || !isCalendarDate(at)) return refuse("MILESTONE_BAD_DATE", "a reminder names a calendar day, YYYY-MM-DD");
    const when = this.#at();
    return this.#record.transact(() => {
      this.#sql.exec(`INSERT INTO inv_milestone_reminders (milestone_id, project_id, member, day, at) VALUES (?,?,?,?,?)`,
        g.m.milestone_id, g.m.project_id, g.actor.member, at, when);
      return { ok: true, milestone: Number(g.m.milestone_id), day: at, at: when };
    });
  }

  /* ---- status reports (R6–R9) ---- */

  /* R6: the last report kept for the project (question null) or for that question in the project. */
  #lastReport(project, question) {
    return question
      ? this.#one(`SELECT * FROM inv_reports WHERE project_id = ? AND question_id = ? ORDER BY report_id DESC LIMIT 1`, project, question)
      : this.#one(`SELECT * FROM inv_reports WHERE project_id = ? AND question_id IS NULL ORDER BY report_id DESC LIMIT 1`, project);
  }
  /* R6: the question a report is on, among the project's questions the viewer sees; a refusal else. */
  #reportQuestion(project, question, viewer) {
    if (question === undefined || question === null || question === "") return { question: null, qs: this.#questionsSeen(project, viewer) };
    const qs = this.#questionsSeen(project, viewer);
    if (!qs || !qs.some((q) => q.inquiry === question))
      return { refusal: refuse("NO_SUCH_QUESTION", "no question this project draws on by that id that you can see", { question }) };
    return { question, qs };
  }

  /** R6, R8: `reportDraft({project, question?, viewer})` composes, by code and with no AI, from the record since the
   *  last report kept for that project (or that question in it): steps taken and ended, with outcomes and learned
   *  lines; what was found; what is waiting. Each line cites its source; only what the viewer sees enters; handles
   *  appear only as attribution, never counted. It writes nothing. */
  reportDraft({ project = null, question = null, viewer = null } = {}) {
    const seen = this.#projectSeen(project, viewer);
    if (seen) return seen;
    const rq = this.#reportQuestion(project, question, viewer);
    if (rq.refusal) return rq.refusal;
    if (rq.qs === null) return { ok: false, reason: "UNDETERMINED", project, detail: "the questions this project draws on could not be read, so no draft was made" };
    return this.#draft(project, rq.question, rq.qs, viewer);
  }

  #draft(project, question, qs, viewer) {
    const last = this.#lastReport(project, question);
    const since = last ? last.at : null;
    const before = last ? parse(last.steps_json) ?? {} : {};
    const after = (t) => filled(t) && (since === null || t > since);
    const steps = this.#workSteps(project, viewer, qs, question);
    if (steps === null) return { ok: false, reason: "UNDETERMINED", project, detail: "the steps could not be read, so no draft was made" };
    const lines = [];
    const line = (section, text, source) => lines.push({ section, text, source });
    const outcomeWords = { helped: "helped", dead_end: "a dead end", undetermined: "not yet judged" };
    const ended = [];
    for (const s of steps) {
      const doer = s.doer === "system" ? "the system" : s.doer;
      if (after(s.at)) line("taken", `${doer} took a step: ${s.work}`, { kind: "step", id: s.step });
      if (STEP_CLOSED.includes(s.state) && !STEP_CLOSED.includes(before[s.step])) {
        ended.push(s);
        const outs = (s.outcomes ?? []).map((o) => `${o.question ? `for ${o.question} ` : ""}${outcomeWords[o.outcome] ?? o.outcome}`).join("; ");
        line("ended", `${s.state === "ended" ? "Ended" : "Set aside"}: ${s.work}${outs ? ` (${outs})` : ""}`, { kind: "step", id: s.step });
        for (const l of s.learned ?? []) line("ended", `${l.by ?? "a member"} wrote what was learned: ${l.text}`, { kind: "step", id: s.step });
      }
    }
    /* what was found: products of the steps taken or ended since, legs added, the project's conclusions and withdrawals */
    const touched = steps.filter((s) => after(s.at) || ended.includes(s));
    for (const s of touched) {
      let p = null;
      try { p = this.#steps.productsOf({ step: s.step, viewer }); } catch { p = null; }
      for (const x of (p && p.ok ? p.products : [])) line("found", `The step "${s.work}" produced ${x.kind} ${x.id}`, { kind: x.kind, id: x.id, step: s.step });
    }
    const scope = question ? qs.filter((q) => q.inquiry === question) : qs;
    for (const q of scope) {
      let b = null;
      try { b = this.#legEarning.basisFor(q.inquiry); } catch { b = null; }
      for (const l of (b && b.ok ? b.legs : [])) {
        if (!after(l.at) || !this.#legSeen(l, viewer)) continue;
        line("found", `A leg ${l.role === "cuts_against" ? "cutting against" : "supporting"} ${q.inquiry} was added, resting on ${l.target_id}${l.grade ? ` at grade ${l.grade}` : ""}`,
          { kind: "leg", id: q.inquiry, target: l.target_id });
      }
      let rec = null;
      try { rec = this.#basisVersions.conclusionRecordOf(project, q.inquiry, viewer); } catch { rec = null; }
      for (const h of (rec && Array.isArray(rec.history) ? rec.history : [])) {
        if (!after(h.at)) continue;
        if (h.act === "concluded") line("found", `This project concluded on ${q.inquiry}: ${h.claim ?? "a claim that cannot be read"}`, { kind: "conclusion", id: q.inquiry });
        else if (h.act === "withdrawn") line("found", `This project withdrew its conclusion on ${q.inquiry}`, { kind: "conclusion", id: q.inquiry });
      }
    }
    /* what is waiting: step waits, the questions' waits (inquiry R55, R58), open milestones */
    for (const s of steps) {
      if (STEP_CLOSED.includes(s.state)) continue;
      for (const w of s.waits ?? []) {
        if (w.met === true) continue;
        const on = w.on.step ? `the step ${w.on.step}` : w.on.date ? `the date ${w.on.date}` : w.on.arrival ? `${w.on.arrival.kind} ${w.on.arrival.id}` : "something you cannot see";
        line("waiting", `"${s.work}" waits on ${on}`, { kind: "step", id: s.step });
      }
    }
    for (const q of scope) {
      let w = null;
      try { w = this.#inquiry.questionWaits({ question: q.inquiry, viewer }); } catch { w = null; }
      for (const x of (w && Array.isArray(w.waits) ? w.waits : []))
        if (x.state !== "ended") line("waiting", `${q.inquiry} waits on ${x.text}${x.date ? ` by ${x.date}` : ""}`, { kind: "wait", id: q.inquiry, index: x.index });
    }
    let dw = null;
    try { dw = scope.length ? this.#inquiry.documentWaits({ questions: scope.map((q) => q.inquiry), viewer }) : null; } catch { dw = null; }
    for (const e of (dw && Array.isArray(dw.questions) ? dw.questions : []))
      for (const x of (Array.isArray(e.waits) ? e.waits : [])) line("waiting", `${e.question} waits on a document set aside: ${x.document}`, { kind: "document-wait", id: e.question, document: x.document });
    if (!question) {
      const today = this.#today(this.#now());
      const stances = new Map(qs.map((q) => [q.inquiry, q.stance]));
      for (const m of this.#rows(`SELECT * FROM inv_milestones WHERE project_id = ? AND removed_at IS NULL ORDER BY date, milestone_id`, project)) {
        const v = this.#milestoneView(m, viewer, today, stances);
        if (v.state !== "met") line("waiting", `The milestone "${v.name}" (${v.date}) is ${v.state}`, { kind: "milestone", id: v.milestone });
      }
    }
    const heads = { taken: "Steps taken", ended: "Steps ended", found: "What was found", waiting: "What is waiting" };
    const text = Object.entries(heads).map(([k, h]) => {
      const ls = lines.filter((l) => l.section === k);
      return ls.length ? `${h}\n${ls.map((l) => `- ${l.text} [${l.source.kind} ${l.source.id}]`).join("\n")}` : null;
    }).filter(Boolean).join("\n\n");
    return { ok: true, project, question, since, lines, text, drafted_by: "code", machine_work: false };
  }
  /* A leg the viewer may see: one on a bundle she sees, or on a target that is no bundle (a passage, a derived
     connection), which the inquiry's own sight covers. */
  #legSeen(leg, viewer) {
    const t = leg && typeof leg.target_id === "string" ? leg.target_id : "";
    if (!t) return false;
    try { return this.#record.bundleInfo(t) ? this.#membership.inSight(t, viewer) === true : true; } catch { return false; }
  }

  /** R7, R9: `reportKeep({project, question?, text, since, corrects?, by})`, by a joined participant: kept as she keeps
   *  it, dated, with its author, never edited after; a later report may correct it. Nothing requires or schedules one. */
  reportKeep({ project = null, question = null, text = null, since = null, corrects = null, by = null } = {}) {
    const g = this.#memberGate(project, by, "reportKeep");
    if (g.refusal) return g.refusal;
    const rq = this.#reportQuestion(project, question, g.actor.viewer);
    if (rq.refusal) return rq.refusal;
    if (!filled(text) || chars(text) > REPORT_MAX) return refuse("REPORT_NO_TEXT", `a report is 1–${REPORT_MAX} characters`);
    const at = this.#at();
    if (since !== null && since !== undefined && (!filled(since) || !ISO.test(since) || Date.parse(since) > Date.parse(at) + 1000))
      return refuse("REPORT_BAD_SINCE", "since is an ISO instant no later than now");
    let corr = null;
    if (corrects !== null && corrects !== undefined) {
      corr = this.#one(`SELECT report_id FROM inv_reports WHERE report_id = ? AND project_id = ?`, Number(corrects), project);
      if (!corr) return refuse("REPORT_NO_TEXT", "the report it corrects is not one of this project's", { corrects });
    }
    const steps = rq.qs === null ? null : this.#workSteps(project, g.actor.viewer, rq.qs, rq.question);
    const snapshot = Object.fromEntries((steps ?? []).map((s) => [s.step, s.state]));
    const last = this.#lastReport(project, rq.question);
    const from = filled(since) ? since : last ? last.at : at;
    return this.#record.transact(() => {
      this.#sql.exec(`INSERT INTO inv_reports (project_id, question_id, text, since, corrects, steps_json, author, at) VALUES (?,?,?,?,?,?,?,?)`,
        project, rq.question, text, from, corr ? Number(corr.report_id) : null, json(snapshot), g.actor.member, at);
      return { ok: true, report: Number(this.#one(`SELECT MAX(report_id) AS id FROM inv_reports`).id), project, question: rq.question, at };
    });
  }

  /** R7: `reportsOf({project, viewer})`: the kept reports, newest first, to the project's participants. */
  reportsOf({ project = null, viewer = null } = {}) {
    const seen = this.#projectSeen(project, viewer);
    if (seen) return seen;
    const reports = this.#rows(`SELECT * FROM inv_reports WHERE project_id = ? ORDER BY report_id DESC LIMIT 500`, project)
      .filter((r) => !r.question_id || this.#seenBundle(r.question_id, viewer))
      .map((r) => ({ report: Number(r.report_id), question: r.question_id ?? null, text: r.text, since: r.since,
                     ...(r.corrects ? { corrects: Number(r.corrects) } : {}), author: this.#handle(r.author), at: r.at }));
    return { ok: true, project, reports };
  }

  /* ---- the warning about a person in no public role (R22) ---- */

  /* inquiry R59's test over `text`, for `viewer`: null when it names no person in no public role, or when the test
     cannot be asked (a warning, never a refusal). */
  #warning(text, viewer) {
    try {
      if (this.#personWarning) return this.#personWarning({ text, viewer }) ?? null;
      const inq = this.#inquiry;
      const facts = inq && typeof inq.personFacts === "function" ? inq.personFacts({ text, viewer }) : [];
      return inquiryPersonWarning({ text, entities: facts, viewer }) ?? null;
    } catch { return null; }
  }

  /* ---- the intake interview (R11–R13) ---- */

  /** R11: `interviewForm({project, viewer})`: the one page the by-hand path asks, the six questions as `skills` holds
   *  them. */
  interviewForm({ project = null, viewer = null } = {}) {
    const seen = this.#projectSeen(project, viewer);
    if (seen) return seen;
    return { ok: true, project, questions: INTAKE_QUESTIONS.map((q, i) => ({ index: i, question: q })), path: "by_hand" };
  }

  /* R12: six answers read from an array of strings or of `{answer}`; null when not six strings. */
  static #answers(a) {
    if (!Array.isArray(a) || a.length !== INTAKE_QUESTIONS.length) return null;
    const out = a.map((x) => (typeof x === "string" ? x : isObj(x) && typeof x.answer === "string" ? x.answer : null));
    if (out.some((x) => x === null || chars(x) > ANSWER_MAX) || !out.some((x) => x.trim() !== "")) return null;
    return out.map((x) => x.trim());
  }

  /** R12, R22: `interviewKeep({project, answers, from_draft?, by})`, by a joined participant, after she checks them:
   *  each answer kept in her words as narrative, with whether it began as the assistant's draft and was kept unchanged
   *  or edited (record-grammar R52). The interview is a project-placed step of the project, its record the step's
   *  product, held here. */
  interviewKeep({ project = null, answers = null, from_draft = null, by = null } = {}) {
    const g = this.#memberGate(project, by, "interviewKeep");
    if (g.refusal) return g.refusal;
    const mine = Investigation.#answers(answers);
    if (!mine) return refuse("INTERVIEW_BAD_ANSWERS", `six answers, each 0–${ANSWER_MAX} characters, at least one written`);
    let draft = null;
    if (from_draft !== null && from_draft !== undefined) {
      draft = isObj(from_draft) ? Investigation.#answers(from_draft.answers) : null;
      if (!draft) return refuse("INTERVIEW_BAD_ANSWERS", "the assistant's draft holds the same six answers");
    }
    const kept = mine.map((answer, i) => {
      const began = !!draft && draft[i] !== "";
      return { index: i, question: INTAKE_QUESTIONS[i], answer, kind: "narrative", began_as_draft: began,
               kept: began ? (draft[i] === answer ? "unchanged" : "edited") : null };
    });
    const warning = this.#warning(mine.join("\n"), g.actor.viewer);
    const at = this.#at();
    return this.#record.transact(() => {
      const s = this.#steps;
      const made = s.stepCreate({ place: { project }, work: INTERVIEW_WORK, project, by });
      if (!made || made.ok !== true) return made;
      const st = s.stepStart({ step: made.step, by });
      if (!st || st.ok !== true) return st;
      const en = s.stepEnd({ step: made.step, end: "ended", by });
      if (!en || en.ok !== true) return en;
      const acceptance = draft
        ? acceptanceRecord({ proposal: `interview-draft:${made.step}`, form: kept.every((k) => !k.began_as_draft || k.kept === "unchanged") ? "as_proposed" : "edited",
                             by, at, kind: "interview" })
        : null;
      this.#sql.exec(`INSERT INTO inv_interviews (project_id, step_id, answers_json, acceptance_json, run, warning_json, author, at) VALUES (?,?,?,?,?,?,?,?)`,
        project, made.step, json(kept), acceptance ? json(acceptance) : null, draft && filled(from_draft.run) ? from_draft.run : null,
        warning ? json(warning) : null, g.actor.member, at);
      const id = Number(this.#one(`SELECT MAX(interview_id) AS id FROM inv_interviews`).id);
      return { ok: true, interview: id, project, step: made.step, answers: kept, ...(acceptance ? { acceptance } : {}),
               ...(warning ? { warning } : {}), at };
    });
  }

  /** R13: `interviewOf({project, viewer})`: the kept interviews, each labelled as the member's own account. */
  interviewOf({ project = null, viewer = null } = {}) {
    const seen = this.#projectSeen(project, viewer);
    if (seen) return seen;
    const interviews = this.#rows(`SELECT * FROM inv_interviews WHERE project_id = ? ORDER BY interview_id`, project).map((r) => {
      const handle = this.#handle(r.author);
      return { interview: Number(r.interview_id), step: r.step_id, author: handle,
               label: `${handle ?? "a member"}'s own account, in her words: narrative, never evidence`,
               evidence: false, answers: parse(r.answers_json) ?? [], acceptance: parse(r.acceptance_json),
               ...(r.warning_json ? { warning: parse(r.warning_json) } : {}), at: r.at };
    });
    return { ok: true, project, interviews };
  }

  /* ---- narrative claims (R14, R15) ---- */

  /** R14, R22: `narrativeClaim({project, source, text, about?, by})`: a claim in a member's narrative about what a
   *  public body said or did, a quoted span of an interview answer (`{interview, answer}`) or her own words
   *  (`{own: true}`). */
  narrativeClaim({ project = null, source = null, text = null, about = null, by = null } = {}) {
    const g = this.#memberGate(project, by, "narrativeClaim");
    if (g.refusal) return g.refusal;
    if (!filled(text) || chars(text.trim()) > CLAIM_MAX) return refuse("CLAIM_NO_TEXT", `a claim is 1–${CLAIM_MAX} characters`);
    if (about !== null && about !== undefined && (!filled(about) || chars(about) > ABOUT_MAX)) return refuse("CLAIM_NO_TEXT", `what it is about is 1–${ABOUT_MAX} characters`);
    let src;
    if (isObj(source) && source.own === true && Object.keys(source).length === 1) src = { own: true };
    else if (isObj(source) && source.interview !== undefined && Number.isInteger(source.answer)) {
      const iv = this.#one(`SELECT * FROM inv_interviews WHERE interview_id = ? AND project_id = ?`, Number(source.interview), project);
      if (!iv) return refuse("NO_SUCH_INTERVIEW", "no interview of this project by that number", { interview: source.interview });
      const a = (parse(iv.answers_json) ?? [])[source.answer];
      if (!a || typeof a.answer !== "string" || !a.answer.includes(text.trim()))
        return refuse("CLAIM_BAD_SOURCE", "the claim is not a quoted span of that answer");
      src = { interview: Number(iv.interview_id), answer: source.answer };
    } else return refuse("CLAIM_BAD_SOURCE", "a claim's source is {interview, answer} or {own: true}");
    const warning = this.#warning(`${text}\n${about ?? ""}`, g.actor.viewer);
    const at = this.#at();
    return this.#record.transact(() => {
      this.#sql.exec(`INSERT INTO inv_claims (project_id, source_json, text, about, warning_json, author, at) VALUES (?,?,?,?,?,?,?)`,
        project, json(src), text.trim(), filled(about) ? about.trim() : null, warning ? json(warning) : null, g.actor.member, at);
      const id = Number(this.#one(`SELECT MAX(claim_id) AS id FROM inv_claims`).id);
      return { ok: true, claim: id, project, stated_as: "as_recalled", ...(warning ? { warning } : {}), at };
    });
  }

  #claimRow(claim) {
    return Number.isSafeInteger(Number(claim)) && claim !== null && claim !== "" ? this.#one(`SELECT * FROM inv_claims WHERE claim_id = ?`, Number(claim)) : null;
  }

  /** R14, R21: `claimFindStep({claim, question?, run?, by})`: a member creates the "find the record" step, on the
   *  claim's question (one the project draws on) or in the project; the assistant proposes it (`steps` R24). */
  claimFindStep({ claim = null, question = null, run = null, by = null } = {}) {
    const c = this.#claimRow(claim);
    const a = this.#actor(by);
    const noSuch = refuse("NO_SUCH_CLAIM", "no claim by that number is held that you can see", { claim: claim ?? null });
    if (!c || !a) return noSuch;
    const viewer = a.machine ? this.#principal(by, run) : a.viewer;
    if (!viewer) return refuse("PLAN_NOT_YOUR_RUN", "the assistant proposes only for a run it holds", { run: run ?? null });
    if (this.#projectSeen(c.project_id, viewer)) return noSuch;
    if (filled(question)) {
      const qs = this.#questionsSeen(c.project_id, viewer);
      if (!qs || !qs.some((q) => q.inquiry === question)) return refuse("NO_SUCH_QUESTION", "no question this project draws on by that id that you can see", { question });
    }
    const place = filled(question) ? { questions: [question] } : { project: c.project_id };
    const work = `${FIND_WORK_PREFIX}${c.text}`.slice(0, 500);
    if (a.machine) {
      const p = this.#steps.stepPropose({ place, work, why: "A member recalls this; the record has not yet been found.", run, by });
      if (!p || p.ok !== true) return p;
      this.#sql.exec(`UPDATE inv_claims SET find_proposal = ? WHERE claim_id = ?`, Number(p.proposal), c.claim_id);
      return { ok: true, claim: Number(c.claim_id), proposal: p.proposal, label: p.label };
    }
    if (c.find_step) return { ok: true, claim: Number(c.claim_id), step: c.find_step, already: true };
    return this.#record.transact(() => {
      const made = this.#steps.stepCreate({ place, work, project: c.project_id, by });
      if (!made || made.ok !== true) return made;
      this.#sql.exec(`UPDATE inv_claims SET find_step = ? WHERE claim_id = ?`, made.step, c.claim_id);
      return { ok: true, claim: Number(c.claim_id), step: made.step, at: made.at };
    });
  }

  /** R15: `claimFound({claim, record, by})`: a member ties the record to the claim's find step (`steps` R9) and marks
   *  the claim found. */
  claimFound({ claim = null, record = null, step = null, by = null } = {}) {
    const c = this.#claimRow(claim);
    const a = this.#actor(by);
    if (a && a.machine) return refuse("INVESTIGATION_MEMBER_ONLY", "marking a claim found is a member's act");
    if (!c || !a || this.#projectSeen(c.project_id, a.viewer)) return refuse("NO_SUCH_CLAIM", "no claim by that number is held that you can see", { claim: claim ?? null });
    /* a find step the assistant proposed and a member accepted is named by `step` */
    const find = c.find_step ?? (filled(step) ? step : null);
    if (!find) return refuse("CLAIM_NO_FIND_STEP", "the claim has no find step yet");
    const at = this.#at();
    return this.#record.transact(() => {
      const t = this.#steps.stepProduct({ step: find, record, by });
      if (!t || t.ok !== true) return t;
      this.#sql.exec(`UPDATE inv_claims SET find_step = ?, found_record = ?, found_by = ?, found_at = ? WHERE claim_id = ?`,
        find, t.product.id, a.member, at, c.claim_id);
      return { ok: true, claim: Number(c.claim_id), stated_as: "found", record: t.product.id, at };
    });
  }

  /* R15: a claim's look: the find step's looks (observation-log), "looked for and not found" naming where. */
  #look(c, viewer) {
    if (!c.find_step) return { state: "not_yet_looked_for" };
    let p = null;
    try { p = this.#steps.productsOf({ step: c.find_step, viewer }); } catch { p = null; }
    const absent = (p && p.ok && Array.isArray(p.looks) ? p.looks : []).filter((l) => l.state === "LOOKED_ABSENT" || l.state === "LOOKED_INDETERMINATE");
    if (!absent.length) return { state: "not_yet_looked_for" };
    return { state: "looked_for_and_not_found", where: absent.map((l) => ({ level: l.level, subject_kind: l.subject_kind, subject: l.subject, state: l.state, at: l.at })) };
  }

  /** R15: `claimsOf({project, viewer})`: each claim as recalled until found, with its look; never shown as what the body
   *  said while it is as recalled. */
  claimsOf({ project = null, viewer = null } = {}) {
    const seen = this.#projectSeen(project, viewer);
    if (seen) return seen;
    const claims = this.#rows(`SELECT * FROM inv_claims WHERE project_id = ? ORDER BY claim_id`, project).map((c) => {
      const handle = this.#handle(c.author);
      const found = !!c.found_record && this.#recordSeen(c.found_record, viewer);
      return { claim: Number(c.claim_id), source: parse(c.source_json), text: c.text, about: c.about ?? null, author: handle,
               stated_as: found ? "found" : "as_recalled",
               label: found ? `found in the record: ${c.found_record}` : `as ${handle ?? "a member"} recalls it; not what the body said`,
               ...(found ? { found: { record: c.found_record, by: this.#handle(c.found_by), at: c.found_at } } : { look: this.#look(c, viewer) }),
               find_step: c.find_step ?? null, ...(c.find_proposal ? { find_proposal: Number(c.find_proposal) } : {}),
               ...(c.warning_json ? { warning: parse(c.warning_json) } : {}), at: c.at };
    });
    return { ok: true, project, claims };
  }
  #recordSeen(id, viewer) { try { return this.#record.bundleInfo(id) ? this.#membership.inSight(id, viewer) === true : true; } catch { return false; } }

  /* ---- a firsthand account (R16) ---- */

  /** R16: `firsthandAccount({words, observedAt, title?, by})`: a member who was present records it through the built
   *  `testify` path (`provenance` R28), testimony graded and labelled as hers; this module grades nothing and keeps
   *  nothing of it. */
  firsthandAccount({ words = null, observedAt = null, title = null, by = null } = {}) {
    const a = this.#actor(by);
    if (!a || a.machine) return refuse("INVESTIGATION_MEMBER_ONLY", "a firsthand account is a person's own word");
    const r = this.#provenance.testify({ words, observedAt, title, author: by });
    if (!r || r.ok !== true) return r;
    const handle = this.#handle(a.member);
    return { ...r, label: `${handle ?? "a member"}'s own firsthand account: testimony, resting on her word` };
  }

  /* ---- planning proposals (R20) ---- */

  #principal(by, run) {
    let held = null;
    try { held = this.#runHolder && filled(run) ? this.#runHolder.fn(by, run) : null; } catch { held = null; }
    return isObj(held) && filled(held.principal) ? held.principal : null;
  }

  /** R20, R21: `planPropose({project, kind, text, question?, run, by})`, from mode `enquire`: a proposed question or step
   *  drawn from a member's words, stored apart and labelled the system's; never a question or step until accepted. */
  planPropose({ project = null, kind = null, text = null, question = null, run = null, by = null } = {}) {
    if (!isMachineIdentity(by)) return refuse("PLAN_NOT_A_MACHINE", "a proposal is the assistant's; a member writes her own");
    const viewer = this.#principal(by, run);
    if (!viewer) return refuse("PLAN_NOT_YOUR_RUN", "the assistant proposes only for a run it holds", { run: run ?? null });
    const seen = this.#projectSeen(project, viewer);
    if (seen) return seen;
    if (!PLAN_KINDS.includes(kind)) return refuse("PLAN_BAD_KIND", `a proposal is a ${PLAN_KINDS.join(" or a ")}`);
    if (!filled(text) || chars(text.trim()) > PLAN_MAX) return refuse("PLAN_NO_TEXT", `1–${PLAN_MAX} characters`);
    if (filled(question)) {
      const qs = this.#questionsSeen(project, viewer);
      if (!qs || !qs.some((q) => q.inquiry === question)) return refuse("NO_SUCH_QUESTION", "no question this project draws on by that id", { question });
    }
    const at = this.#at();
    const state = lawProposalState(by);
    return this.#record.transact(() => {
      this.#sql.exec(`INSERT INTO inv_plan_proposals (project_id, kind, text, question_id, run, by_actor, label_state, status, at) VALUES (?,?,?,?,?,?,?,?,?)`,
        project, kind, text.trim(), filled(question) ? question : null, run, by, state, "proposed", at);
      const id = Number(this.#one(`SELECT MAX(proposal_id) AS id FROM inv_plan_proposals`).id);
      return { ok: true, proposal: id, label: { by, state, machine_work: state === "machine_proposed" }, at };
    });
  }

  #planView(p) {
    return { proposal: Number(p.proposal_id), project: p.project_id, kind: p.kind, text: p.text, question: p.question_id ?? null,
             label: { by: p.by_actor, state: p.label_state, machine_work: p.label_state === "machine_proposed" }, status: p.status, at: p.at,
             ...(p.status !== "proposed" ? { form: p.form, made: p.made, reason: p.reason, acceptance: parse(p.acceptance_json),
                                              decided_by: this.#handle(p.decided_by), decided_at: p.decided_at } : {}) };
  }

  /** R20: `planProposals({project, viewer})`: the project's proposals, a set-aside one with her reason. */
  planProposals({ project = null, viewer = null } = {}) {
    const seen = this.#projectSeen(project, viewer);
    if (seen) return seen;
    return { ok: true, project, proposals: this.#rows(`SELECT * FROM inv_plan_proposals WHERE project_id = ? ORDER BY proposal_id`, project).map((p) => this.#planView(p)) };
  }

  /** R20: `planAccept({proposal, form, text?, reason?, by})`: the member's one accepting act (record-grammar R52): a
   *  question by her own promotion, a step by `steps` R1 in her name; `own_instead` sets the proposal aside for her own
   *  words. Nothing becomes a question or step without it. */
  planAccept({ proposal = null, form = null, text = null, reason = null, by = null } = {}) {
    const p = Number.isSafeInteger(Number(proposal)) && proposal !== null && proposal !== ""
      ? this.#one(`SELECT * FROM inv_plan_proposals WHERE proposal_id = ?`, Number(proposal)) : null;
    const a = this.#actor(by);
    if (a && a.machine) return refuse("INVESTIGATION_MEMBER_ONLY", "accepting a proposal is a member's act");
    if (!p || !a || this.#projectSeen(p.project_id, a.viewer)) return refuse("NO_SUCH_PROPOSAL", "no proposal by that number is held that you can see", { proposal: proposal ?? null });
    const g = this.#memberGate(p.project_id, by, "planAccept");
    if (g.refusal) return g.refusal;
    if (p.status !== "proposed") return refuse("PLAN_DECIDED", `this proposal was ${p.status === "accepted" ? "taken up" : "set aside"}`, { proposal: Number(p.proposal_id) });
    if (!ACCEPTANCE_FORMS.includes(form)) return refuse("PLAN_BAD_FORM", `the form is one of ${ACCEPTANCE_FORMS.join(", ")}`);
    const words = form === "as_proposed" ? p.text : text;
    if (!filled(words) || chars(words.trim()) > PLAN_MAX) return refuse("PLAN_NO_TEXT", `1–${PLAN_MAX} characters`);
    if (reason !== null && reason !== undefined && (!filled(reason) || chars(reason) > REASON_MAX)) return refuse("INVESTIGATION_NO_REASON", `1–${REASON_MAX} characters`);
    const at = this.#at();
    return this.#record.transact(() => {
      let made;
      if (p.kind === "step") {
        const r = this.#steps.stepCreate({ place: p.question_id ? { questions: [p.question_id] } : { project: p.project_id }, work: words.trim(), project: p.project_id, by });
        if (!r || r.ok !== true) return r;
        made = r.step;
      } else {
        const r = this.#openQuestion(words.trim(), p, by, a.viewer, at);
        if (!r || r.ok !== true) return r;
        made = r.bundleId;
      }
      const acceptance = acceptanceRecord({ proposal: `plan:${p.proposal_id}`, form, by, at, kind: `plan-${p.kind}` });
      this.#sql.exec(`UPDATE inv_plan_proposals SET status = ?, form = ?, acceptance_json = ?, made = ?, reason = ?, decided_by = ?, decided_at = ? WHERE proposal_id = ?`,
        form === "own_instead" ? "set_aside" : "accepted", form, json(acceptance), made, filled(reason) ? reason.trim() : null, a.member, at, p.proposal_id);
      return { ok: true, proposal: Number(p.proposal_id), form, kind: p.kind, made, acceptance, at };
    });
  }

  /* R20: a question opened by the member's own promotion, at `surfaced`, in her name. */
  #openQuestion(question, p, by, viewer, at) {
    const id = `${this.#record.allocId("INQ", at.slice(0, 4)).id}-question`;
    const text = ["---", `id: ${id}`, "object_type: inquiry", "schema: inquiry@1", `title: ${yamlString(question.slice(0, 120))}`,
      "current_state: surfaced", "prior_state: null", `created: "${at}"`, `last_updated: "${at}"`,
      "produced_by:", "  mode: human", "  capability_tier: session", "references: []", "state_history: []",
      "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []",
      "surfaced_by: human", 'disposition_reason: ""', "---", "", "## Question", "", question, "", "## What It Rests On", "",
      `Taken up by a member from a planning proposal (${p.by_actor}, run ${p.run}).`, "", "## Conclusion", "",
      "## What Would Falsify This", "", "## Session Log", "", `### Session ${at} | Surfaced | ${by}`,
      "Changes: opened by a member from a planning proposal.", "", "## Review Notes", ""].join("\n");
    return this.#promotion.promote({ bundleId: id, base: null, snapKey: `${at.replace(/[-:]/g, "")}_plan${p.proposal_id}`, author: by,
      files: [{ path: "bundle.md", text }], meta: { object_type: "inquiry", current_state: "surfaced", created: at, last_updated: at },
      actorIdentity: by, actorViewer: viewer, actorMemberId: this.#memberOf(by) });
  }

  /* ---- when the work goes quiet (R17, R18) ---- */

  /* R17: whether the project's work is quiet, judged as the plane (the same for every reader): `{quiet}` or
     `{quiet: false, undetermined: why}`. A project with no step has not gone quiet: its work has not begun. */
  #quiet(project) {
    const qs = this.#questionsOf(project);
    if (qs === null) return { quiet: false, undetermined: "the questions this project draws on could not be read" };
    const steps = this.#workSteps(project, PLANE_VIEWER, qs);
    if (steps === null) return { quiet: false, undetermined: "the steps could not be read" };
    if (!steps.length) return { quiet: false, why: "no step has been taken" };
    /* R18 (K2524): something arrived from a watched source, and no step has been taken since: the work is reopened */
    const arrival = this.#one(`SELECT at FROM inv_watch_arrivals WHERE project_id = ? ORDER BY seq DESC LIMIT 1`, project);
    if (arrival && !steps.some((s) => s.at >= arrival.at)) return { quiet: false, why: "something arrived from a watched source", reopened: true };
    if (steps.some((s) => !STEP_CLOSED.includes(s.state))) return { quiet: false, why: "a step is still open" };
    for (const q of qs) {
      let w = null;
      try { w = this.#inquiry.questionWaits({ question: q.inquiry, viewer: PLANE_VIEWER }); } catch { w = null; }
      if (!w || !Array.isArray(w.waits)) return { quiet: false, undetermined: "a question's waits could not be read" };
      if (w.waits.some((x) => x.state !== "ended")) return { quiet: false, why: "a dated wait is still awaited" };
      for (const state of ["requested", "draining"]) {
        let r = null;
        try { r = this.#captureRequests.captureRequests({ target: q.inquiry, state, limit: 1, viewer: PLANE_VIEWER }); } catch { r = null; }
        const rows = r && (Array.isArray(r.requests) ? r.requests : Array.isArray(r.rows) ? r.rows : null);
        if (!rows) return { quiet: false, undetermined: "the capture requests could not be read" };
        if (rows.length) return { quiet: false, why: "a capture request is still open" };
      }
    }
    return { quiet: true };
  }
  /* R18: the open spell of quiet for a project, opened or closed to match `quiet`; its id, or null. */
  #spell(project, quiet) {
    const open = this.#one(`SELECT * FROM inv_quiet_spells WHERE project_id = ? AND ended_at IS NULL ORDER BY spell_id DESC LIMIT 1`, project);
    try {
      if (quiet && !open) {
        this.#sql.exec(`INSERT INTO inv_quiet_spells (project_id, began_at) VALUES (?, ?)`, project, this.#at());
        return Number(this.#one(`SELECT MAX(spell_id) AS id FROM inv_quiet_spells WHERE project_id = ?`, project).id);
      }
      if (!quiet && open) { this.#sql.exec(`UPDATE inv_quiet_spells SET ended_at = ? WHERE spell_id = ?`, this.#at(), open.spell_id); return null; }
    } catch { /* a spell not recorded changes no answer */ }
    return open ? Number(open.spell_id) : null;
  }

  /** R17: `quietState({project, viewer})`: `quiet: true` when every step of the project and of its questions is ended
   *  or set aside and nothing is awaited; a display, never a stage. */
  quietState({ project = null, viewer = null } = {}) {
    const seen = this.#projectSeen(project, viewer);
    if (seen) return seen;
    const q = this.#quiet(project);
    this.#spell(project, q.quiet);
    return { ok: true, project, quiet: q.quiet, display: q.quiet ? "quiet" : null, stage: null,
             ...(q.undetermined ? { undetermined: q.undetermined } : {}), ...(q.why ? { why: q.why } : {}) };
  }

  /** R18: `quietPrompts({viewer, at})`, for `notice-producers`: once per quiet spell, to each joined participant, the
   *  objective, its condition, progress and gaps, and the doors open to the members. Nothing more is asked in that
   *  spell once a member acted on it. No member act declares the objective met (H28). */
  quietPrompts({ viewer = null, at = null } = {}) {
    void at;
    const member = this.#memberOf(viewer);
    if (!member) return { ok: true, prompts: [] };
    const prompts = [];
    for (const project of this.#joinedProjects(member)) {
      try {
        if (!this.#membership.isJoinedParticipant(project, member) || this.#projectSeen(project, viewer)) continue;
        const q = this.#quiet(project);
        const spell = this.#spell(project, q.quiet);
        if (!q.quiet || spell === null) continue;
        if (this.#one(`SELECT 1 AS x FROM inv_quiet_acts WHERE project_id = ? AND spell_id = ? LIMIT 1`, project, spell)) continue;
        const progress = this.#intent.progress({ project, viewer });
        const gaps = this.#intent.gaps({ project, viewer });
        const satisfied = progress && progress.ok !== false && progress.satisfied === true;
        prompts.push({ project, spell, key: sha256HexSync(`investigation:quiet:${project}:${spell}`),
                       objective: progress && progress.ok !== false ? progress.objective : null,
                       condition: progress && progress.ok !== false ? progress.condition : null, progress,
                       gaps: gaps && gaps.ok !== false ? gaps.gaps : null,
                       doors: satisfied ? ["write_up_and_act"] : ["watch", "close_with_gaps", "revise_objective"] });
      } catch { /* a project that cannot be read is not prompted */ }
    }
    return { ok: true, prompts };
  }

  /* R18: a door's gate: a joined participant, on a project whose work is quiet; the spell, or a refusal. */
  #doorGate(project, by, act) {
    const g = this.#memberGate(project, by, act);
    if (g.refusal) return g;
    const q = this.#quiet(project);
    if (!q.quiet) return { refusal: refuse("QUIET_NOT_QUIET", q.undetermined ?? q.why ?? "the work has not gone quiet", { project }) };
    return { actor: g.actor };
  }

  /** R18: `projectWatch({project, by})`: keep watching the sources `intent` R7 names (`monitoring` reads
   *  `watchedProjects`) and reopen the work when something arrives. */
  projectWatch({ project = null, by = null } = {}) {
    const g = this.#doorGate(project, by, "projectWatch");
    if (g.refusal) return g.refusal;
    const at = this.#at();
    return this.#record.transact(() => {
      this.#sql.exec(`INSERT INTO inv_quiet_acts (project_id, spell_id, act, by_actor, at) VALUES (?,?,?,?,?)`, project, this.#spell(project, true), "watch", by, at);
      return { ok: true, project, watching: true, at };
    });
  }

  /** R18: `watchedProjects()` (in-process, for `monitoring`): each project a member chose to watch, with what `intent`
   *  R7 says to watch. */
  watchedProjects() {
    const out = [];
    for (const r of this.#rows(`SELECT project_id, MAX(at) AS at FROM inv_quiet_acts WHERE act = 'watch' GROUP BY project_id ORDER BY project_id`)) {
      if (!this.#watched(r.project_id)) continue;
      let watch = null;
      try { watch = this.#intent.watchSet({ project: r.project_id }); } catch { watch = null; }
      out.push({ project: r.project_id, since: r.at, watch });
    }
    return { ok: true, projects: out };
  }

  /* R18: whether a member's latest door on the project is to watch it. */
  #watched(project) {
    const r = this.#one(`SELECT act FROM inv_quiet_acts WHERE project_id = ? ORDER BY seq DESC LIMIT 1`, project);
    return !!r && r.act === "watch";
  }

  /** R18 (K2524): `watchArrival({project, source, at})`, for `monitoring` only: a source a watched project keeps
   *  watching brought something new. The project's work reads reopened (no longer quiet, so a later quiet spell
   *  prompts again), and the arrival is answered with the project's reads. A project not watched is refused, writing
   *  nothing. */
  watchArrival({ project = null, source = null, at = null } = {}) {
    const src = typeof source === "string" ? source.trim() : isObj(source) ? json(source) : "";
    if (!src || chars(src) > REASON_MAX || !filled(at) || !ISO.test(at)) return refuse("ARRIVAL_BAD", "an arrival is {project, source, at: an ISO instant}");
    const b = filled(project) ? this.#record.bundleInfo(project) : null;
    if (!b || b.type !== "project" || !this.#watched(project))
      return refuse("PROJECT_NOT_WATCHED", "no member chose to watch this project's sources", { project: filled(project) ? project : null });
    const when = this.#at();
    const done = this.#record.transact(() => {
      this.#sql.exec(`INSERT INTO inv_watch_arrivals (project_id, source, arrived_at, at) VALUES (?,?,?,?)`, project, src, at, when);
      this.#spell(project, false);
      return { ok: true };
    });
    if (!done || done.ok !== true) return done;
    return { ok: true, project, arrival: { source: src, at }, reopened: true,
             reads: { quiet: this.quietState({ project, viewer: PLANE_VIEWER }), standing: this.projectStanding({ project, viewer: PLANE_VIEWER }),
                      milestones: this.milestonesOf({ project, viewer: PLANE_VIEWER }) } };
  }

  /** R18: `projectCloseWithGaps({project, reason, note?, by})`: the project closes with `closed_reason` `reason`
   *  (`intent` R29), the gaps read at the act kept beside it as what remains unknown. */
  projectCloseWithGaps({ project = null, reason = null, note = null, by = null } = {}) {
    const g = this.#doorGate(project, by, "projectCloseWithGaps");
    if (g.refusal) return g.refusal;
    if (!CLOSED_REASONS.includes(reason)) return refuse("CLOSE_BAD_REASON", `the reason is one of ${CLOSED_REASONS.join(", ")}`);
    if (note !== null && note !== undefined && (!filled(note) || chars(note) > REASON_MAX)) return refuse("INVESTIGATION_NO_REASON", `1–${REASON_MAX} characters`);
    const gaps = this.#intent.gaps({ project, viewer: g.actor.viewer });
    const kept = gaps && gaps.ok !== false ? { gaps: gaps.gaps ?? [], ...(gaps.why ? { why: gaps.why } : {}) } : { gaps: null, why: "the gaps could not be read" };
    const at = this.#at();
    return this.#record.transact(() => {
      const w = this.#closeProject(project, reason, note, by, g.actor.viewer, at);
      if (!w || w.ok !== true) return w;
      this.#sql.exec(`INSERT INTO inv_quiet_acts (project_id, spell_id, act, closed_reason, note, gaps_json, by_actor, at) VALUES (?,?,?,?,?,?,?,?)`,
        project, this.#spell(project, true), "close", reason, filled(note) ? note.trim() : null, json(kept), by, at);
      return { ok: true, project, closed_reason: reason, gaps: kept.gaps, at };
    });
  }

  /* R18: the project's close as a revision of its document through `promotion`: `closed`, `closed_reason`, an entry. */
  #closeProject(project, reason, note, by, viewer, at) {
    const head = this.#record.head(project);
    const f = this.#record.readFile(project, "bundle.md");
    if (!head || !f || typeof f.text !== "string") return noSuchProject(project);
    const from = head.currentState;
    let text = f.text;
    const lines = text.split("\n");
    const end = lines.indexOf("---", 1);
    if (lines[0] !== "---" || end === -1) return noSuchProject(project);
    const set = (key, value) => {
      const ls = text.split("\n"); const e = ls.indexOf("---", 1);
      for (let i = 1; i < e; i++) if (ls[i].startsWith(`${key}:`)) { ls[i] = `${key}: ${value}`; text = ls.join("\n"); return; }
      ls.splice(e, 0, `${key}: ${value}`); text = ls.join("\n");
    };
    set("current_state", "closed");
    set("prior_state", from);
    set("closed_reason", reason);
    set("last_updated", `"${at}"`);
    const entry = [`  - timestamp: "${at}"`, `    from_state: ${from}`, "    to_state: closed",
                   `    blurb: ${yamlString(`closed with the gaps recorded as what remains unknown${filled(note) ? `: ${note}` : ""}`)}`, `    author: ${by}`];
    const ls = text.split("\n"); const e = ls.indexOf("---", 1);
    const at0 = ls.findIndex((l, i) => i > 0 && i < e && /^state_history:/.test(l));
    if (at0 === -1) ls.splice(e, 0, "state_history:", ...entry);
    else if (ls[at0].slice("state_history:".length).trim() === "[]") ls.splice(at0, 1, "state_history:", ...entry);
    else { let last = at0; for (let i = at0 + 1; i < e && /^\s/.test(ls[i]) && ls[i].trim() !== ""; i++) last = i; ls.splice(last + 1, 0, ...entry); }
    text = ls.join("\n");
    const carried = (typeof this.#record.livePaths === "function" ? this.#record.livePaths(project) : []).filter((p) => p !== "bundle.md").map((path) => {
      const x = this.#record.readFile(project, path);
      return typeof x.text === "string" ? { path, text: x.text, sha256: x.sha256 } : { path, blobSha: x.blobSha, sha256: x.sha256, bytes: x.bytes };
    });
    return this.#promotion.promote({ bundleId: project, base: head.bundleSha, snapKey: `${at.replace(/[-:]/g, "")}_close`, author: by,
      files: [{ path: "bundle.md", text }, ...carried],
      meta: { object_type: head.type, title: head.title, current_state: "closed", prior_state: from, last_updated: at },
      actorIdentity: by, actorViewer: viewer, actorMemberId: this.#memberOf(by) });
  }

  /* ---- the project page (R19) ---- */

  /** R19: `projectStanding({project, viewer})`: the objective and its condition, progress (or that it cannot be
   *  computed), each question the project draws on with its legs grouped as supporting or cutting against and this
   *  project's conclusion beside the bar, and the gaps. No score, and no member's share. */
  projectStanding({ project = null, viewer = null } = {}) {
    const seen = this.#projectSeen(project, viewer);
    if (seen) return seen;
    const progress = this.#intent.progress({ project, viewer });
    if (progress && progress.ok === false) return progress;
    const gaps = this.#intent.gaps({ project, viewer });
    const qs = this.#questionsSeen(project, viewer);
    const bar = progress && isObj(progress.condition) && isObj(progress.condition.required) ? progress.condition.required.grade ?? null : null;
    const questions = (qs ?? []).map((q) => {
      let b = null;
      try { b = this.#legEarning.basisFor(q.inquiry); } catch { b = null; }
      const legs = (b && b.ok ? b.legs : []).filter((l) => this.#legSeen(l, viewer))
        .map((l) => ({ target: l.target_id, grade: l.grade ?? null, axis: l.grade_axis ?? null }));
      const roles = (b && b.ok ? b.legs : []).filter((l) => this.#legSeen(l, viewer)).map((l) => l.role);
      let stance = null;
      try { const r = this.#basisVersions.conclusionRecordOf(project, q.inquiry, viewer); stance = r && r.stance ? r.stance : null; } catch { stance = null; }
      return { question: q.inquiry,
               legs: { supporting: legs.filter((_, i) => roles[i] !== "cuts_against"), cutting_against: legs.filter((_, i) => roles[i] === "cuts_against") },
               conclusion: stance ? { state: stance.state, claim: stance.claim ?? null, at: stance.at ?? null } : null, bar };
    });
    return { ok: true, project, objective: progress ? progress.objective ?? null : null, condition: progress ? progress.condition ?? null : null,
             progress: progress && progress.computable === false ? { computable: false, why: progress.why ?? "cannot be computed" } : progress,
             questions, ...(qs === null ? { questions_undetermined: "the questions this project draws on could not be read" } : {}),
             gaps: gaps && gaps.ok !== false ? gaps.gaps : null };
  }

  /* ---- registered with promotion (R12) ---- */

  /** R12 (promotion R39): no leg's target is an interview, refused inside `BASIS_REFUSED` as `NARRATIVE_NOT_A_LEG`. */
  check(c) {
    if (!isObj(c) || !isObj(c.docFm) || !Array.isArray(c.docFm.basis)) return null;
    const findings = [];
    c.docFm.basis.forEach((leg, ord) => {
      const target = isObj(leg) && typeof leg.target === "string" ? leg.target.trim() : null;
      if (!target || !isStepId(target)) return;
      if (!this.#one(`SELECT 1 AS x FROM inv_interviews WHERE step_id = ? LIMIT 1`, target)) return;
      const row = INVESTIGATION_CHECKS.NARRATIVE_NOT_A_LEG;
      findings.push({ check: row.check, code: "NARRATIVE_NOT_A_LEG", severity: "error", translation: row.translation,
                      detail: `basis[${ord}] rests on ${target}, an intake interview: a member's narrative is never evidence (D20)`, ord, target });
    });
    return findings.length ? { ok: false, reason: "BASIS_REFUSED", findings, detail: "a leg rests on an interview, which is narrative and never evidence. Nothing was written." } : null;
  }
}
