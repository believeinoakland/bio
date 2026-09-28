/* consequences — what a breach did, and to whom (requirements: `build/requirements/consequences.md`; Bob's ruling K12;
 * Roadmap v5 §5 Operational Principle 6; Functional Architecture v3 Layer 2 Function 4 and Layer 3 Function 5).
 *
 * For one standard's noncompliant outcome of a live determination (`conformance`), a PART records who or what is
 * affected (a class, a fund, a program, a service, a body; never a person, R10), the measure and the period, in one of
 * three states that are never composed (R11): COMPUTED, the module's own arithmetic over figures the cited passages
 * hold, graded by the weakest operand capture (R2, DEC-21); ASSESSED, a member's stated value with a rationale and
 * what it rests on (R3); UNDETERMINED, with why, never read as zero (R4). That the harm follows from the act is a
 * finding: a part names the inquiry that concluded it, or its causation is `unproven`, stated and never refused or
 * graded low (R5, R12; DEC-14's discipline, applied to the government's act). A part is never edited: a revision is a
 * successor (R6). A member records each part addressed or not, with evidence (R9), which `escalation` reads.
 * Significance is not here (K12): no answer carries a significance, severity, priority or score (R11).
 *
 * A new module (layer 9): no `from`, nothing moved. REACHED as `consequencesModule(host, deps)` (K171 (17)): one instance
 * per host (the Durable Object's `ctx`), created on the first call with `deps`, returned to every later caller. At
 * creation it creates its tables and declares them to record-core's purge (R13, K23). Each part is also a `CONS-`
 * record object promoted through `promotion` (R14), so it has history, audit and export like a finding.
 * `deps` (each reached through its factory on the same host unless given; a test passes its own):
 *   record, membership, promotion   layer 2: `allocId`, `transact`, `declarePurge`, `head`, `readFile`, `bundleInfo`;
 *                                   `sight`, `inSight`, `projectAuthority`; `promote`.
 *   conformance    `determinationRead` (conformance R9; R1 here). No default until conformance is merged: without it
 *                  every determination reads as absent (fail closed).
 *   content        `contentRow` (R2's operands, R9's evidence), `passageNotice` (R8).
 *   passageText    `(contentId) → text | null`, the passage an operand's figure is read from (R2); default
 *                  `content.passageText` where content provides it, else null ("held in a form not read", R4).
 *   provenance     `captureGrade` (R2, K171 (8)).
 *   inquiry        `supersededBy`, `stateHistory` (R5, R8).
 *   strength       `inquiryStrength` (R5).
 *   now            the clock for the instants it writes, an ISO string (default: the wall clock, to the second).
 *
 * READ CONTRACTS it joins in its own SQL: none. Its own tables are `./schema.mjs`. */

import { recordOf, stampInstant, instantOrder } from "../record-core/index.mjs";
import { membershipOf } from "../membership/index.mjs";
import { promotionOf } from "../promotion/index.mjs";
import { provenanceOf } from "../provenance/index.mjs";
import { contentOf } from "../content/index.mjs";
import { inquiryOf } from "../inquiry/index.mjs";
import { strengthOf } from "../strength/index.mjs";
import { isMachineIdentity, normalizeType, MACHINE_CLASS_PREFIX, BASIS_GRADES } from "../../checks/bio-checks.mjs";
import { OPS, parseFigure, passageHolds, compute, addMeasures } from "./figures.mjs";
import { CONSEQUENCES_TABLES, migrateConsequences } from "./schema.mjs";
import { CONSEQUENCES_CHECKS } from "./checks.mjs";

export { OPS, parseFigure, passageHolds, compute, addMeasures } from "./figures.mjs";
export { CONSEQUENCES_SCHEMA, CONSEQUENCES_TABLES } from "./schema.mjs";
export { CONSEQUENCES_CHECKS } from "./checks.mjs";

/** Terms: who or what is affected (R10: no person value). */
export const AFFECTED_KINDS = Object.freeze(["class", "fund", "program", "service", "body", "other"]);
/** Terms: what a measure counts. */
export const UNITS = Object.freeze(["money", "benefits", "services", "time", "count"]);
/** Terms: the three states of a part, never composed (R11). */
export const PART_STATES = Object.freeze(["computed", "assessed", "undetermined"]);
/** R9: what a member records of a part. */
export const ADDRESSED_STATES = Object.freeze(["addressed", "not_addressed"]);
/** R4: why a part is undetermined (the requirement's three, and a computation the arithmetic cannot carry out). */
export const UNDETERMINED_WHY = Object.freeze({
  not_in_record: "the figure is not in the record",
  form_not_read: "the record holds it in a form not read",
  not_assessed: "nobody has assessed it",
  not_computable: "the record holds the figures, and the computation named cannot be carried out over them",
});
/** R3: the longest rationale an assessment carries. */
export const RATIONALE_MAX = 2000;
/** R6, R9: the longest reason a revision or an addressed record carries (conformance R7's bound). */
export const REASON_MAX = 500;

/* R10: a kind, or a key, that would single out a person. Refused by name, before it could be read as `other`. */
const PERSON_KINDS = new Set(["person", "persons", "individual", "individuals", "human", "resident", "citizen",
  "member", "employee", "official", "named_person", "name"]);
const PERSON_KEYS = ["name", "person", "individual", "personal_name", "full_name"];
/* A causation inquiry has concluded when its state is one of these (inquiry R1: `published` is read, never entered). */
const CONCLUDED = new Set(["concluded", "published"]);
const INTERNAL = `${MACHINE_CLASS_PREFIX}admin`;

const str = (v) => (typeof v === "string" && v.trim() ? v.trim() : null);
const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const q = (v) => JSON.stringify(v ?? null);
const json = (v) => (v == null ? null : JSON.stringify(v));
const parse = (s) => { if (s == null) return null; try { return JSON.parse(s); } catch { return null; } };
const machine = (who) => !str(who) || isMachineIdentity(str(who));
const second = (iso) => String(iso).replace(/\.\d+Z$/, "Z");
const rand = (n) => [...crypto.getRandomValues(new Uint8Array(n))].map((b) => b.toString(16).padStart(2, "0")).join("");
const HEX64 = /^[0-9a-f]{64}$/;
const DATE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2}))?$/;

/* DEC-49: every refusal carries its code, its C-114 row and the member's translation (`./checks.mjs`). */
function refuse(code, detail, extra = {}) {
  const row = CONSEQUENCES_CHECKS[code];
  return { ok: false, reason: code, code, ...(row ? { check: row.check, translation: row.translation } : {}), detail,
           ...extra };
}

/* ===================================================================== *
 * THE TERMS, CHECKED (R1's shape refusals, R10). Pure.
 * ===================================================================== */

/** R1, R10: an affected is `{kind, description, role?}`; answers the canonical form or a refusal. */
export function checkAffected(a) {
  if (!isObj(a)) return refuse("AFFECTED_UNKNOWN_KIND", `an affected is {kind, description, role?}, kind one of `
                                + `${AFFECTED_KINDS.join(", ")}. Nothing was written.`);
  const kind = str(a.kind) ? a.kind.trim().toLowerCase() : null;
  const personKey = [a, isObj(a.role) ? a.role : {}].flatMap((o) => PERSON_KEYS.filter((k) => o[k] != null && o[k] !== ""));
  if ((kind && PERSON_KINDS.has(kind)) || personKey.length)
    return refuse("AFFECTED_INDIVIDUAL", `people are counted as a class or named in their official role, never singled `
      + `out${personKey.length ? ` (the affected carries ${personKey.join(", ")})` : ""}: record a class (kind "class") `
      + `or an office (role {role, body}). Nothing was written.`, { kind: kind ?? null });
  if (!kind || !AFFECTED_KINDS.includes(kind) || !str(a.description))
    return refuse("AFFECTED_UNKNOWN_KIND", `${!kind || !AFFECTED_KINDS.includes(kind) ? `"${String(a.kind ?? "")}" is not `
      + `a kind of affected` : "an affected is described"}: kind one of ${AFFECTED_KINDS.join(", ")}, with a `
      + `description. Nothing was written.`, { kind: kind ?? null });
  let role = null;
  if (a.role != null) {
    if (!isObj(a.role) || !str(a.role.role) || !str(a.role.body))
      return refuse("AFFECTED_INDIVIDUAL", "a role is an office, {role, body}: the office and the body it belongs to, "
        + "never a person. Nothing was written.", { kind });
    role = { role: a.role.role.trim(), body: a.role.body.trim() };
  }
  return { ok: true, affected: { kind, description: a.description.trim(), ...(role ? { role } : {}) } };
}

/** R1: a measure is `{unit, currency?, value | range}`; answers the canonical form (value and range both optional here:
 *  which a state needs is R2–R4's) or a refusal. */
export function checkMeasure(m) {
  if (m == null) return { ok: true, measure: null };
  if (!isObj(m) || !str(m.unit) || !UNITS.includes(m.unit.trim()))
    return refuse("MEASURE_UNKNOWN_UNIT", `a measure's unit is one of ${UNITS.join(", ")}. Nothing was written.`,
                  { unit: isObj(m) ? m.unit ?? null : null });
  const unit = m.unit.trim();
  const bad = (why) => refuse("MEASURE_INVALID", `${why}. Nothing was written.`, { unit });
  if (m.currency != null && m.currency !== "") {
    if (unit !== "money") return bad(`a currency belongs to a measure of money, and this one is of ${unit}`);
    if (!str(m.currency)) return bad("a currency is named by its code, such as USD");
  }
  const hasValue = m.value !== undefined && m.value !== null;
  const hasRange = m.range !== undefined && m.range !== null;
  if (hasValue && hasRange) return bad("a measure carries a value or a range, not both");
  const out = { unit, ...(str(m.currency) ? { currency: m.currency.trim().toUpperCase() } : {}) };
  if (hasValue) {
    if (typeof m.value !== "number" || !Number.isFinite(m.value)) return bad("the value is not a finite number");
    out.value = m.value;
  }
  if (hasRange) {
    const [low, high] = Array.isArray(m.range) ? m.range : isObj(m.range) ? [m.range.low, m.range.high] : [];
    if (typeof low !== "number" || !Number.isFinite(low) || typeof high !== "number" || !Number.isFinite(high))
      return bad("a range's bounds are two finite numbers, {low, high}");
    if (low > high) return bad("the range is reversed: its low bound is above its high bound");
    out.range = { low, high };
  }
  return { ok: true, measure: out };
}

/** R1: a period is `{from, to}`, two dates (or instants), `from` not after `to`. */
export function checkPeriod(p) {
  const bad = (why) => refuse("PERIOD_INVALID", `${why}. Nothing was written.`);
  if (!isObj(p)) return bad("a period is {from, to}: the dates the consequence ran between");
  const from = str(p.from); const to = str(p.to);
  if (!from || !to || !DATE.test(from) || !DATE.test(to) || Number.isNaN(Date.parse(from)) || Number.isNaN(Date.parse(to)))
    return bad("a period's from and to are dates, YYYY-MM-DD, or instants");
  if (Date.parse(from) > Date.parse(to)) return bad("the period is reversed: it ends before it starts");
  return { ok: true, period: { from, to } };
}

/* ===================================================================== *
 * THE MODULE
 * ===================================================================== */

export class Consequences {
  #deps;

  constructor({ storage, record, membership, promotion, host = null, conformance = null, content = null,
                provenance = null, inquiry = null, strength = null, passageText = null, now = null } = {}) {
    this.sql = storage.sql;
    this.record = record;
    this.membership = membership;
    this.promotion = promotion;
    this.#deps = { host, conformance, content, provenance, inquiry, strength, passageText };
    this.now = typeof now === "function" ? now : () => stampInstant("second");
  }

  /* The modules reached lazily: each is created on the same host on first use, unless a test passed its own. */
  get content() { return this.#deps.content ||= contentOf(this.#deps.host); }
  get provenance() { return this.#deps.provenance ||= provenanceOf(this.#deps.host); }
  get inquiry() { return this.#deps.inquiry ||= inquiryOf(this.#deps.host); }
  get strength() { return this.#deps.strength ||= strengthOf(this.#deps.host); }
  get conformance() { return this.#deps.conformance; }

  migrate() { migrateConsequences(this.sql); }

  #rows(qs, ...a) { return [...this.sql.exec(qs, ...a)]; }
  #one(qs, ...a) { for (const r of this.sql.exec(qs, ...a)) return r; return null; }
  #when() { const w = this.now(); return second(typeof w === "string" && w ? w : stampInstant("second")); }

  /* R2: the text of the passage an operand names, or null when it is held in a form this module does not read. */
  #passageText(contentId) {
    try {
      const fn = this.#deps.passageText || (typeof this.content.passageText === "function"
        ? (id) => this.content.passageText(id) : null);
      const t = fn ? fn(contentId) : null;
      return typeof t === "string" ? t : isObj(t) && typeof t.text === "string" ? t.text : null;
    } catch { return null; }
  }

  /* R13 (K171 (10)): whether the viewer sees a project's contents: sight first, FULL only. An internal caller (no
     viewer) is not asked; a part outside any project is seen as its determination is. */
  #seesProject(project, viewer) {
    if (viewer === null || viewer === undefined || !project) return true;
    return this.membership.sight(project, viewer) === "full";
  }

  /* R1: the determination through conformance's read (its R9), as `{id, project, outcome(standard), live}`; null when
     absent, invisible, or conformance is not here to answer (fail closed). Read through one adapter so the spelling of
     conformance's answer lives in one place. */
  #determination(id, viewer) {
    const c = this.conformance;
    if (!str(id) || !c || typeof c.determinationRead !== "function") return null;
    let d;
    try { d = c.determinationRead({ id, viewer: viewer ?? INTERNAL }); } catch { return null; }
    if (!isObj(d) || d.ok === false) return null;
    const body = isObj(d.determination) ? { ...d, ...d.determination } : d;
    const outcomes = body.outcomes ?? body.outcome_per_standard ?? body.standards ?? null;
    const outcome = (std) => {
      if (Array.isArray(outcomes)) {
        const o = outcomes.find((x) => isObj(x) && (x.standard === std || x.id === std || (isObj(x.standard) && x.standard.id === std)));
        return o ? o.outcome ?? null : null;
      }
      if (isObj(outcomes)) { const v = outcomes[std]; return isObj(v) ? v.outcome ?? null : v ?? null; }
      return null;
    };
    const sup = body.superseded_by ?? body.supersededBy ?? body.links?.superseded_by ?? null;
    const live = body.live === false ? false : !(Array.isArray(sup) ? sup.length : sup);
    return { id, project: body.project ?? null, outcome, live };
  }

  /* A part's row, or null when absent or in a project the viewer may not see (R13: one answer). */
  #part(id, viewer) {
    if (!str(id)) return null;
    const r = this.#one(`SELECT * FROM consequence_parts WHERE bundle_id=?`, id);
    if (!r || !this.#seesProject(r.project, viewer)) return null;
    return r;
  }

  #successor(id) { return this.#one(`SELECT bundle_id FROM consequence_parts WHERE supersedes=?`, id)?.bundle_id ?? null; }

  /* R5: a named inquiry's causation, as it reads now: established when it is an inquiry the reader may see that has
     concluded and is not superseded; unproven otherwise, with why. */
  #causationNow(inquiryId, viewer) {
    if (!str(inquiryId))
      return { state: "unproven", inquiry: null,
               why: "no inquiry is named whose finding is that the harm follows from the act; sequence alone does not "
                  + "establish it (DEC-14), so the causation is unproven until one concludes" };
    const who = viewer ?? INTERNAL;
    const info = this.record.bundleInfo(inquiryId);
    if (!info || !this.membership.inSight(inquiryId, who) || normalizeType(info.type) !== "inquiry")
      return { state: "unproven", inquiry: inquiryId,
               why: "the inquiry named is not one this record holds that you may see, so it establishes nothing here" };
    const head = this.record.head(inquiryId);
    const st = head ? head.currentState : null;
    const sup = this.#supersededBy(inquiryId);
    if (sup.length)
      return { state: "unproven", inquiry: inquiryId,
               why: `the inquiry named has been superseded (by ${sup.join(", ")}), so its finding does not stand` };
    if (!CONCLUDED.has(st))
      return { state: "unproven", inquiry: inquiryId,
               why: `the inquiry named is ${st ?? "in no state"}, not concluded: until it concludes that the harm follows `
                  + "from the act, the causation is unproven" };
    return { state: "established", inquiry: inquiryId,
             why: `the inquiry named has concluded; its finding is that the harm follows from the act` };
  }

  #supersededBy(id) {
    try { const s = this.inquiry.supersededBy(id); return Array.isArray(s) ? s : s ? [s] : []; } catch { return []; }
  }

  /* R9, R3: an evidence or rests-on id resolves to a content row, or a finding (an inquiry), the author may see. */
  #resolvesEvidence(id, who) {
    if (!str(id)) return false;
    if (HEX64.test(id)) {
      const row = this.content.contentRow(id);
      return !!row && this.membership.inSight(row.bundle_id, who);
    }
    const info = this.record.bundleInfo(id);
    return !!info && normalizeType(info.type) === "inquiry" && this.membership.inSight(id, who);
  }

  /* ===================================================================== *
   * R1–R6: RECORDING A PART
   * ===================================================================== */

  /** R1–R5: record one part against one standard's noncompliant outcome of a live determination. */
  consequenceRecord(args = {}) { return this.#record(args, null); }

  /** R6: a part is never edited; a revision records a successor with R1's refusals, and the earlier part stays
   *  readable with the link. The successor keeps the earlier part's determination and standard. */
  consequenceRevise(args = {}) {
    const { id = null, reason = null, author = null, viewer = null } = args;
    const who = viewer ?? author;
    const old = this.#part(id, who);
    if (!old) return refuse("NO_SUCH_PART", "no consequence part answers to that id here; one you may not see is "
                                             + "answered exactly as one that does not exist. Nothing was written.", { id });
    const next = this.#successor(old.bundle_id);
    if (next) return refuse("ALREADY_SUPERSEDED", `${old.bundle_id} has already been revised by ${next}; revise that `
                                                  + "one. Nothing was written.", { id: old.bundle_id, superseded_by: next });
    if (!str(reason)) return refuse("NO_REASON", "a revision says why the part is revised. Nothing was written.");
    if (reason.trim().length > REASON_MAX)
      return refuse("BAD_REASON", `a revision's reason is at most ${REASON_MAX} characters. Nothing was written.`);
    const pick = (k, stored) => (k in args ? args[k] : stored);
    const oldBasis = old.op ? { op: old.op, operands: this.#operands(old.bundle_id).map((o) => ({ content: o.content_id, figure: o.figure })) }
      : old.state === "assessed" ? { rationale: old.rationale, rests_on: parse(old.rests_on) || [] }
      : { why: old.undetermined_code };
    return this.#record({
      determination: old.determination, standard: old.standard,
      affected: pick("affected", parse(old.affected)), measure: pick("measure", parse(old.measure)),
      period: pick("period", parse(old.period)), basis: pick("basis", oldBasis),
      causation: pick("causation", old.causation), author, viewer,
    }, { supersedes: old.bundle_id, reason: reason.trim() });
  }

  #record({ determination = null, standard = null, affected = null, measure = null, period = null, basis = null,
            causation = null, author = null, viewer = null } = {}, rev) {
    const who = viewer ?? (str(author) || null);
    const byMachine = machine(author);
    /* R1, in order. */
    const d = this.#determination(determination, who);
    if (!d || !this.#seesProject(d.project, who))
      return refuse("NO_SUCH_DETERMINATION", "no determination answers to that id here; one you may not see is answered "
                                              + "exactly as one that does not exist. Nothing was written.", { determination });
    if (!str(standard) || d.outcome(standard) !== "noncompliant" || !d.live)
      return refuse("NOT_NONCOMPLIANT", !d.live
        ? `${d.id} has been superseded: a consequence is recorded against a live determination, and the parts of the `
          + "earlier one stay readable, not carried forward. Nothing was written."
        : `${d.id}'s outcome for ${str(standard) ?? "that standard"} is ${d.outcome(standard) ?? "not stated"}, not `
          + "noncompliant: a consequence is what a breach did. Nothing was written.",
        { determination: d.id, standard: standard ?? null });
    /* A member author has joined the determination's project; a machine's computed part answers no project authority
       (K171 (9)), and a machine may record nothing else (R3, below). K171 (11): membership's refusal, translated. */
    if (!byMachine && d.project) {
      const denied = this.membership.projectAuthority(d.project, str(author), "joined", "consequenceRecord");
      if (denied) return refuse("NOT_A_PARTICIPANT", `recording a consequence is work inside ${d.project}, and `
                                  + `${str(author)} has not joined it. Nothing was written.`, { project: d.project });
    }
    const a = checkAffected(affected); if (!a.ok) return a;
    const m = checkMeasure(measure); if (!m.ok) return m;
    const p = checkPeriod(period); if (!p.ok) return p;

    const b = this.#basis(basis, m.measure, who, byMachine);
    if (!b.ok) return b;

    /* R5: the causation, as it reads when recorded; nothing recomputes it (R8). */
    const cause = this.#causationNow(causation, who);
    const at = this.#when();
    return this.record.transact(() => {
      const id = `${this.record.allocId("CONS", at.slice(0, 4)).id}-${a.affected.kind}`;
      const part = { determination: d.id, standard, project: d.project, affected: a.affected,
        measure: b.measure, period: p.period, state: b.state, causation: cause, author: str(author) ?? "",
        machine: byMachine, at, supersedes: rev ? rev.supersedes : null, reason: rev ? rev.reason : null, ...b.doc };
      const done = this.promotion.promote({ bundleId: id, base: null, snapKey: `${at.replace(/[-:]/g, "")}_${rand(4)}`,
        author: str(author) ?? INTERNAL, files: [{ path: "bundle.md", text: partDoc(id, part) }],
        meta: { object_type: "consequence", title: titleOf(part), current_state: "recorded", created: at, last_updated: at } });
      if (done.ok === false) return done;
      this.sql.exec(`INSERT INTO consequence_parts (bundle_id, determination, standard, project, affected, measure,
          period, state, op, value, grade, grade_why, rationale, rests_on, undetermined_code, undetermined_why,
          causation, causation_state, causation_why, machine, author, at, supersedes, reason)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        id, d.id, standard, d.project, json(a.affected), json(b.measure), json(p.period), b.state, b.op ?? null,
        json(b.value), b.grade ?? null, b.gradeWhy ?? null, b.rationale ?? null, json(b.restsOn), b.undeterminedCode ?? null,
        b.undeterminedWhy ?? null, cause.inquiry, cause.state, cause.why, byMachine ? 1 : 0, str(author) ?? "", at,
        rev ? rev.supersedes : null, rev ? rev.reason : null);
      (b.operands || []).forEach((o, i) => this.sql.exec(`INSERT INTO consequence_operands (part_id, ord, content_id,
          figure, number, capture_sha, grade, route, determined, basis) VALUES (?,?,?,?,?,?,?,?,?,?)`,
        id, i, o.content, o.figure ?? null, o.number ?? null, o.capture_sha ?? null, o.grade ?? null, o.route ?? null,
        o.determined ? 1 : 0, o.basis ?? null));
      return { ok: true, id, part: this.#answer(this.#one(`SELECT * FROM consequence_parts WHERE bundle_id=?`, id), who) };
    });
  }

  /* R2–R4: what the basis makes of the part: its state, measure and the fields that state carries, or a refusal. */
  #basis(basis, measure, who, byMachine) {
    const computation = isObj(basis) && ("op" in basis || "operands" in basis);
    if (computation) return this.#computation(basis, measure, who);
    const hasFigure = measure && ("value" in measure || "range" in measure);
    if (byMachine)
      return refuse("MACHINE_CANNOT_ASSESS", "a machine may prepare a computed part, from the record's own figures, and "
        + "propose an assessment as text for a member; it never records an assessment or an undetermined judgment. "
        + "Nothing was written.");
    if (hasFigure) {
      /* R3: a member's assessment. */
      const rationale = isObj(basis) ? str(basis.rationale) : null;
      if (!rationale) return refuse("NO_RATIONALE", "an assessed value says why: a rationale of at most "
                                    + `${RATIONALE_MAX} characters. Nothing was written.`);
      if (rationale.length > RATIONALE_MAX)
        return refuse("BAD_RATIONALE", `a rationale is at most ${RATIONALE_MAX} characters. Nothing was written.`);
      const rests = basis.rests_on ?? basis.restsOn ?? [];
      if (!Array.isArray(rests)) return refuse("BASIS_UNREADABLE", "what an assessment rests on is a list of content ids "
                                               + "or findings, possibly empty. Nothing was written.");
      const unknown = rests.filter((x) => !this.#resolvesEvidence(x, who));
      if (unknown.length) return refuse("NO_SUCH_EVIDENCE", "an assessment rests on content or findings this record holds "
        + "and you may see. Nothing was written.", { unknown: unknown.map((x) => (typeof x === "string" ? x : null)) });
      return { ok: true, state: "assessed", measure, rationale, restsOn: rests.map(String),
               doc: { rationale, rests_on: rests.map(String) } };
    }
    /* R4: no figure stated: undetermined, with why. */
    const code = isObj(basis) && str(basis.why) && UNDETERMINED_WHY[basis.why.trim()] ? basis.why.trim() : "not_assessed";
    return { ok: true, state: "undetermined", measure, undeterminedCode: code, undeterminedWhy: UNDETERMINED_WHY[code],
             doc: { undetermined: code } };
  }

  /* R2, R4: a computation over the record. The value is this module's arithmetic over the figures the passages hold;
     an operand not held, or a figure its passage does not hold, leaves the computation lacking it (undetermined). */
  #computation(basis, measure, who) {
    const op = str(basis.op);
    if (!op || !OPS.includes(op))
      return refuse("BASIS_UNREADABLE", `a computation names its op, one of ${OPS.join(", ")}. Nothing was written.`,
                    { op: basis.op ?? null });
    if (!Array.isArray(basis.operands) || basis.operands.some((o) => !isObj(o) || !str(o.content)))
      return refuse("BASIS_UNREADABLE", "a computation's operands are a list of {content, figure}: the content id whose "
                                         + "passage holds the figure, and the figure as read. Nothing was written.");
    const operands = [];
    let lacking = null;
    for (const [i, raw] of basis.operands.entries()) {
      const o = { content: raw.content.trim(), figure: typeof raw.figure === "string" ? raw.figure : raw.figure == null
        ? null : String(raw.figure) };
      const row = this.content.contentRow(o.content);
      if (!row || !this.membership.inSight(row.bundle_id, who ?? INTERNAL)) {
        lacking ||= { code: "not_in_record", why: `operand ${i} names content this record does not hold, or that you `
                                                   + "may not see" };
        operands.push(o); continue;
      }
      o.capture_sha = row.capture_sha;
      const g = this.provenance.captureGrade(row.capture_sha) || {};
      Object.assign(o, { grade: g.grade ?? null, route: g.route ?? null, determined: !!g.determined, basis: g.basis ?? null });
      if (op !== "count") {
        if (o.figure == null || !String(o.figure).trim()) {
          lacking ||= { code: "not_in_record", why: `operand ${i} states no figure as read` };
        } else {
          const f = parseFigure(o.figure);
          if (!f.ok) return refuse("BASIS_UNREADABLE", `operand ${i}: ${f.why}. Nothing was written.`, { operand: i });
          const text = this.#passageText(o.content);
          if (text === null)
            lacking ||= { code: "form_not_read", why: `operand ${i}'s passage is held in a form this module does not read` };
          else if (!passageHolds(text, o.figure))
            lacking ||= { code: "not_in_record", why: `operand ${i}'s passage does not hold the figure "${o.figure}"` };
          else Object.assign(o, { number: f.number, decimals: f.decimals });
        }
      }
      operands.push(o);
    }
    const stored = operands.map(({ decimals, ...o }) => o);
    const docOps = stored.map((o) => ({ content: o.content, figure: o.figure }));
    if (!lacking && !measure)
      lacking = { code: "not_assessed", why: "no measure is stated, so the computation has no unit" };
    let result = null;
    if (!lacking) {
      result = compute(op, operands);
      if (!result.ok && result.code === "operands_extra")
        return refuse("BASIS_UNREADABLE", `${result.why}. Nothing was written.`);
      if (!result.ok) lacking = { code: result.code === "operand_missing" ? "not_in_record" : "not_computable", why: result.why };
    }
    const unitOnly = measure ? { unit: measure.unit, ...(measure.currency ? { currency: measure.currency } : {}) } : null;
    if (lacking)
      return { ok: true, state: "undetermined", op, measure: unitOnly, operands: stored,
               undeterminedCode: lacking.code, undeterminedWhy: `${UNDETERMINED_WHY[lacking.code]}: ${lacking.why}`,
               doc: { op, operands: docOps, undetermined: lacking.code } };
    /* DEC-21: the part's grade is its weakest operand's capture grade, named; one undetermined operand leaves it
       undetermined, naming that operand. */
    const rank = (g) => BASIS_GRADES.indexOf(g);
    const open = stored.findIndex((o) => !o.grade);
    let grade = null; let gradeWhy;
    if (open >= 0) {
      gradeWhy = `operand ${open}'s capture grade is undetermined (${stored[open].basis ?? stored[open].route ?? "no route"}), `
               + "so the weakest link is not known";
    } else {
      const w = stored.reduce((acc, o, i) => (rank(o.grade) > rank(stored[acc].grade) ? i : acc), 0);
      grade = stored[w].grade;
      gradeWhy = `the weakest operand is ${w} (content ${stored[w].content}), whose capture grade is ${grade} `
               + `(${stored[w].route}); a computation is as strong as its weakest figure (DEC-21)`;
    }
    return { ok: true, state: "computed", op, measure: { ...unitOnly, value: result.value }, value: { value: result.value },
             grade, gradeWhy, operands: stored, doc: { op, operands: docOps, value: result.value, grade } };
  }

  #operands(id) {
    return this.#rows(`SELECT * FROM consequence_operands WHERE part_id=? ORDER BY ord`, id);
  }

  #addressedOf(id) {
    return this.#one(`SELECT * FROM consequence_addressed WHERE part_id=? ORDER BY seq DESC LIMIT 1`, id);
  }

  /* ===================================================================== *
   * THE ANSWER FOR ONE PART (R2–R5, R7, R8, R12)
   * ===================================================================== */

  #answer(r, viewer) {
    const who = viewer ?? INTERNAL;
    const out = { id: r.bundle_id, determination: r.determination, standard: r.standard, project: r.project,
      affected: parse(r.affected), measure: parse(r.measure), period: parse(r.period), state: r.state,
      author: r.author || null, at: r.at, supersedes: r.supersedes, reason: r.reason,
      superseded_by: this.#successor(r.bundle_id) };
    if (r.state === "computed" || r.op) {
      const ops = this.#operands(r.bundle_id).map((o) => {
        const row = this.content.contentRow(o.content_id);
        const seen = row && this.membership.inSight(row.bundle_id, who);
        return seen ? { content: o.content_id, figure: o.figure, number: o.number, capture: o.capture_sha,
                        grade: o.grade, route: o.route, determined: !!o.determined }
                    : { content: null, says: "an object you may not see" };
      });
      out.computation = { op: r.op, operands: ops };
    }
    if (r.state === "computed") {
      out.grade = { grade: r.grade, determined: r.grade !== null, why: r.grade_why };
      out.label = r.machine
        ? { machine_work: true, says: `machine work: computed by ${r.author || "a machine"} from the operands shown` }
        : { machine_work: false, says: `computed from the operands shown; recorded by ${r.author}` };
    } else if (r.state === "assessed") {
      out.assessment = { by: r.author, at: r.at, rationale: r.rationale, rests_on: parse(r.rests_on) || [],
        says: (parse(r.rests_on) || []).length ? "a member's assessment, resting on the ids listed"
          : "a member's assessment, resting on nothing in the record (stated as none)" };
      out.label = { machine_work: false, says: "a member's assessment: never presented, summed or graded as computed" };
    } else {
      out.undetermined = { code: r.undetermined_code, why: r.undetermined_why,
                           says: "undetermined: not known, and never read as zero" };
    }
    out.causation = { state: r.causation_state, inquiry: r.causation, why: r.causation_why };
    if (r.causation_state === "established" && r.causation) {
      let s = null;
      try { s = this.strength.inquiryStrength({ id: r.causation, viewer: who }); } catch { s = null; }
      out.causation.strength = s && s.ok
        ? { capture: s.capture ?? null, connection: s.connection ?? null, testimony: s.testimony ?? null,
            says: "per axis, never composed (DEC-44)" }
        : { capture: null, connection: null, testimony: null, says: "the inquiry's strength could not be read for you" };
      if (!this.membership.inSight(r.causation, who)) { out.causation.inquiry = null; out.causation.why = "an object you may not see"; }
    }
    const a = this.#addressedOf(r.bundle_id);
    out.addressed = a
      ? { state: a.state, evidence: parse(a.evidence) || [], reason: a.reason, by: a.author, at: a.at }
      : { state: "never_assessed", says: "no member has recorded whether this consequence has been addressed" };
    const changed = this.#basisChanged(r, who);
    if (changed.length) out.basis_changed = changed;
    return out;
  }

  /* R8: a notice, never a recomputation: an operand passage whose document has a newer capture that does not carry it,
     or a causation inquiry reopened or superseded since the part was recorded. */
  #basisChanged(r, who) {
    const causes = [];
    if (r.op) {
      for (const o of this.#operands(r.bundle_id)) {
        let n = null;
        try { n = this.content.passageNotice({ contentId: o.content_id, viewer: who }); } catch { n = null; }
        if (n && n.affects === "affected")
          causes.push({ cause: "newer_capture", operand: o.ord, why: `a newer capture of operand ${o.ord}'s document `
            + "does not carry its passage; nothing is recomputed until a member revises this part" });
      }
    }
    if (r.causation) {
      const sup = this.#supersededBy(r.causation);
      if (sup.length) causes.push({ cause: "causation_superseded", why: "the causation inquiry has been superseded" });
      else if (r.causation_state === "established") {
        const head = this.record.head(r.causation);
        let reopened = head && !CONCLUDED.has(head.currentState);
        if (!reopened) {
          let h = null;
          try { h = this.inquiry.stateHistory(r.causation); } catch { h = null; }
          reopened = !!(h && h.ok && h.transitions.some((t) => t.to === "open" && t.at && instantOrder(t.at, r.at) > 0));
        }
        if (reopened) causes.push({ cause: "causation_reopened", why: "the causation inquiry has been reopened since "
                                     + "this part was recorded" });
      }
    }
    return causes;
  }

  /* ===================================================================== *
   * R6, R7: READS
   * ===================================================================== */

  /** R6, R13: one part, superseded or not, with its links; absent and unseen are one answer. */
  consequenceRead({ id = null, viewer = null } = {}) {
    const r = this.#part(id, viewer);
    if (!r) return refuse("NO_SUCH_PART", "no consequence part answers to that id here; one you may not see is answered "
                                           + "exactly as one that does not exist.", { id });
    return { ok: true, part: this.#answer(r, viewer) };
  }

  /* The live parts of a determination (not revised by a successor), optionally of one standard, in id order. */
  #liveParts(determination, standard = null) {
    return this.#rows(`SELECT p.* FROM consequence_parts p WHERE p.determination=? AND (? IS NULL OR p.standard=?)
        AND NOT EXISTS (SELECT 1 FROM consequence_parts s WHERE s.supersedes = p.bundle_id) ORDER BY p.bundle_id`,
      determination, standard, standard);
  }

  /** R7: every live part of the determination, totals only within one state, unit and currency, and the parts that
   *  are undetermined or unproven, in front of the member. */
  consequencesOf({ determination = null, standard = null, viewer = null } = {}) {
    const d = this.#determination(determination, viewer);
    if (!d || !this.#seesProject(d.project, viewer))
      return refuse("NO_SUCH_DETERMINATION", "no determination answers to that id here; one you may not see is answered "
                                              + "exactly as one that does not exist.", { determination });
    const rows = this.#liveParts(d.id, str(standard)).filter((r) => this.#seesProject(r.project, viewer));
    const parts = rows.map((r) => this.#answer(r, viewer));
    const groups = new Map();
    for (const p of parts) {
      if (p.state === "undetermined" || !p.measure) continue;
      const key = `${p.state}\u0000${p.measure.unit}\u0000${p.measure.currency ?? ""}`;
      if (!groups.has(key)) groups.set(key, { state: p.state, unit: p.measure.unit, currency: p.measure.currency ?? null, items: [] });
      groups.get(key).items.push(p);
    }
    const totals = [...groups.values()].map((g) => ({ state: g.state, unit: g.unit, currency: g.currency,
      ...addMeasures(g.items.map((p) => p.measure)), parts: g.items.map((p) => p.id),
      says: `${g.state} parts only, in ${g.unit}${g.currency ? ` (${g.currency})` : ""}: never added to parts in another `
          + "state, unit or currency" }));
    return { ok: true, determination: d.id, standard: str(standard), parts, totals,
             undetermined: parts.filter((p) => p.state === "undetermined").map((p) => p.id),
             unproven: parts.filter((p) => p.causation.state === "unproven").map((p) => p.id),
             says: parts.length ? "each part is what it is: computed, assessed or undetermined; nothing here is composed "
                                  + "into one figure, and nothing ranks it"
                                : "no consequence recorded" };
  }

  /* ===================================================================== *
   * R9: ADDRESSED
   * ===================================================================== */

  /** R9: a member records a part addressed or not, with evidence and a reason. */
  addressedRecord({ id = null, state = null, evidence = null, reason = null, author = null, viewer = null } = {}) {
    if (machine(author))
      return refuse("MACHINE_CANNOT_ADDRESS", "whether a consequence has been addressed is a member's judgment, with "
        + "evidence; a machine never records it. Nothing was written.");
    const who = viewer ?? str(author);
    const r = this.#part(id, who);
    if (!r) return refuse("NO_SUCH_PART", "no consequence part answers to that id here; one you may not see is answered "
                                           + "exactly as one that does not exist. Nothing was written.", { id });
    const next = this.#successor(r.bundle_id);
    if (next) return refuse("ALREADY_SUPERSEDED", `${r.bundle_id} has been revised by ${next}; record it on that one. `
                                                  + "Nothing was written.", { id: r.bundle_id, superseded_by: next });
    if (r.project) {
      const denied = this.membership.projectAuthority(r.project, str(author), "joined", "addressedRecord");
      if (denied) return refuse("NOT_A_PARTICIPANT", `recording whether a consequence is addressed is work inside `
        + `${r.project}, and ${str(author)} has not joined it. Nothing was written.`, { project: r.project });
    }
    if (!ADDRESSED_STATES.includes(state))
      return refuse("ADDRESSED_UNKNOWN_STATE", `a part is recorded ${ADDRESSED_STATES.join(" or ")}. Nothing was written.`,
                    { state: state ?? null });
    if (!str(reason)) return refuse("NO_REASON", "the record says why. Nothing was written.");
    if (reason.trim().length > REASON_MAX)
      return refuse("BAD_REASON", `a reason is at most ${REASON_MAX} characters. Nothing was written.`);
    const ev = evidence == null ? [] : Array.isArray(evidence) ? evidence : [evidence];
    if (state === "addressed" && !ev.length)
      return refuse("ADDRESSED_NO_EVIDENCE", "a consequence is recorded addressed with the evidence that it was: content "
        + "or findings in the record. Partial redress does not end an escalation. Nothing was written.");
    const unknown = ev.filter((x) => !this.#resolvesEvidence(x, who));
    if (unknown.length) return refuse("NO_SUCH_EVIDENCE", "evidence is content or findings this record holds and you may "
      + "see. Nothing was written.", { unknown: unknown.map((x) => (typeof x === "string" ? x : null)) });
    const at = this.#when();
    this.record.transact(() => this.sql.exec(`INSERT INTO consequence_addressed (part_id, state, evidence, reason, author, at)
      VALUES (?,?,?,?,?,?)`, r.bundle_id, state, JSON.stringify(ev.map(String)), reason.trim(), str(author), at));
    return { ok: true, id: r.bundle_id, state, evidence: ev.map(String), reason: reason.trim(), by: str(author), at };
  }

  /** R9: per part, and overall: `addressed` only when every live part is addressed; any undetermined part or unproven
   *  causation makes it `undetermined` (what is not known cannot be addressed); otherwise any part not addressed, or
   *  never assessed, makes it `not_addressed`. No live part is `undetermined`, "no consequence recorded" (K172). Read
   *  for a superseded determination too (escalation R14). */
  addressed({ determination = null, viewer = null } = {}) {
    const d = this.#determination(determination, viewer);
    if (!d || !this.#seesProject(d.project, viewer))
      return refuse("NO_SUCH_DETERMINATION", "no determination answers to that id here; one you may not see is answered "
                                              + "exactly as one that does not exist.", { determination });
    const parts = this.#liveParts(d.id).filter((r) => this.#seesProject(r.project, viewer)).map((r) => {
      const a = this.#addressedOf(r.bundle_id);
      return { id: r.bundle_id, standard: r.standard, part_state: r.state, causation: r.causation_state,
               addressed: a ? a.state : "never_assessed" };
    });
    if (!parts.length)
      return { ok: true, determination: d.id, state: "undetermined", parts, why: "no consequence recorded" };
    const open = parts.filter((p) => p.part_state === "undetermined" || p.causation === "unproven");
    if (open.length)
      return { ok: true, determination: d.id, state: "undetermined", parts,
               why: `${open.map((p) => p.id).join(", ")} ${open.length === 1 ? "is" : "are"} undetermined or unproven, `
                  + "so whether the consequences are addressed is not known" };
    const not = parts.filter((p) => p.addressed !== "addressed");
    if (not.length)
      return { ok: true, determination: d.id, state: "not_addressed", parts,
               why: `${not.map((p) => p.id).join(", ")} ${not.length === 1 ? "is" : "are"} not addressed or never `
                  + "assessed; partial redress does not end an escalation" };
    return { ok: true, determination: d.id, state: "addressed", parts, why: "every live part is recorded addressed, with evidence" };
  }
}

/* ===================================================================== *
 * THE PART'S DOCUMENT (R14): a `CONS-` record object, one state `recorded`.
 * ===================================================================== */

function titleOf(p) {
  return `${p.affected.kind}: ${p.affected.description}`.replace(/\s+/g, " ").slice(0, 110);
}

function partDoc(id, p) {
  const { causation, ...rest } = p;
  const body = { ...rest, causation: { state: causation.state, inquiry: causation.inquiry } };
  return ["---", `id: ${id}`, "object_type: consequence", "schema: consequence@1", `title: ${q(titleOf(p))}`,
    "current_state: recorded", "prior_state: null", `created: ${q(p.at)}`, `last_updated: ${q(p.at)}`,
    `determination: ${q(p.determination)}`, `standard: ${q(p.standard)}`, `part_state: ${p.state}`,
    `causation: ${q(causation.inquiry)}`, `supersedes: ${q(p.supersedes)}`, `author: ${q(p.author)}`,
    `machine_work: ${p.machine ? "true" : "false"}`, "produced_by:", `  mode: ${p.machine ? "agent" : "human"}`,
    "  capability_tier: session", "references: []", "state_history: []", "annotations_open: 0", "reeval_pending:",
    "  flag: false", "  since: null", "  source: null", "visuals: []", "---", "", "## Part", "", "```json",
    JSON.stringify(body, null, 2), "```", "", ...(p.reason ? ["## Why It Was Revised", "", p.reason, ""] : []),
    "## Session Log", "", `### Session ${p.at} | Recorded | ${p.author || "machine"}`,
    `Changes: consequence part recorded${p.supersedes ? `, superseding ${p.supersedes}` : ""}.`, ""].join("\n");
}

/* ===================================================================== *
 * HOW THE MODULE IS REACHED
 * ===================================================================== */

const instances = new WeakMap();

/** K171 (17): one instance per host, created on the first call with `deps`. */
export function consequencesModule(host, deps) {
  let c = instances.get(host);
  if (!c) {
    const d = deps || {};
    const storage = d.storage || host.storage;
    const record = d.record || recordOf(host);
    const membership = d.membership || membershipOf(host, { record });
    const promotion = d.promotion || promotionOf(host, { record, membership });
    c = new Consequences({ ...d, host, storage, record, membership, promotion });
    instances.set(host, c);
    c.migrate();
    record.declarePurge("consequences", CONSEQUENCES_TABLES);
  }
  return c;
}

/** Which purge declaration names one of this module's tables (record-core R21: each owner declares its own). */
export function consequencesOwns(t) {
  const name = typeof t === "string" ? t : t && t.name;
  return CONSEQUENCES_TABLES.some((x) => (typeof x === "string" ? x : x.name) === name);
}

/** The module's ops (K3), as entries of the legacy store's op map. `viewer` and `author` are the control plane's stamps,
 *  read from the query after the body, so a caller's own copy never wins. */
export function consequencesOps(c, url, body) {
  const qp = (k) => url.searchParams.get(k);
  const b = isObj(body) ? body : {};
  const stamps = { author: qp("author"), viewer: qp("viewer") };
  return {
    consequencerecord: () => c.consequenceRecord({ ...b, ...stamps }),
    consequencerevise: () => c.consequenceRevise({ ...b, ...stamps }),
    consequence: () => c.consequenceRead({ id: qp("id"), viewer: qp("viewer") }),
    consequencesof: () => c.consequencesOf({ determination: qp("determination"), standard: qp("standard"),
                                             viewer: qp("viewer") }),
    addressedrecord: () => c.addressedRecord({ ...b, ...stamps }),
    addressed: () => c.addressed({ determination: qp("determination"), viewer: qp("viewer") }),
  };
}
