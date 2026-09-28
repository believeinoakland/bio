/* conformance — the group's recorded judgment that a named government act is compliant, noncompliant or unclear
 * against named standards, resting on published findings (requirements: `build/requirements/conformance.md`;
 * Functional Architecture v3, Layer 2 "Analysis outputs" and Function 4). A member determines; a machine may prepare
 * the comparison (R12) and never determines (R1, R13). A compliant determination carries the same obligations as a
 * noncompliant one (R5). Nothing here ranks significance (R8): whether a breach warrants action, and how urgently, is a
 * member's judgment made with the consequences in front of them (Bob's ruling 1, K12).
 *
 * A new module (layer 9, K102, K171): nothing moved here from the legacy modules. Its tables are `./schema.mjs`, its
 * refusal rows `./checks.mjs` (family C-113).
 *
 * THE ACT. An act is what the government did, the office that did it (role and body, never a person), when, and the
 * content ids that show it. The first determination of an act mints its id (`ACT-`, record-core's `allocId`, stored on
 * the determination, no bundle); a later one names it, and "the same act" is that id's equality (K171 (6)).
 *
 * THE RECORD OBJECT (R17). Each determination is a `CONF-` bundle promoted through `promotion`, with history, audit and
 * export like a finding; its document states the act, the standards with their outcomes, the comparison, the pinned
 * findings and the questions. It is never edited: a correction is a new determination that supersedes it (R7), and a
 * step registered with promotion refuses any other write of a determination (R13).
 *
 * REACHED as `conformanceOf(host, deps)` (K61): one instance per host (the Durable Object's `ctx`), created on the first
 * call with `deps`, returned to every later caller. At creation it creates its tables and declares them to record-core's
 * purge (K23), registers its step with promotion (R13, R17) and its listener with reevaluation's `onBasisChanged`
 * (R10). `deps` (each reached through its factory on the same host unless given; a test passes its own):
 *   record        `allocId`, `transact`, `bundleInfo`, `declarePurge`; `stampInstant`.
 *   membership    `sight`, `existenceAct`, `projectAuthority`, `positionalMember`, `inSight`; `viewerPredicate`.
 *   promotion     `promote`, `registerStep` (R6, R17).
 *   content       `contentRow`, `passageNotice` (R1's evidence, R10).
 *   inquiry       `supersededBy`, `stateHistory` (R10).
 *   strength      `inquiryStrength` (R9).
 *   reevaluation  `onBasisChanged` (R10).
 *   publication   `publishedEditionsOf` (R2, R9, R10; its R37).
 *   standards     `standardRead`, `inForce` (R1, R3, R9, R10).
 *   now           the clock for the instants it writes, an ISO string (default: the wall clock, to the second).
 *
 * READ CONTRACTS it joins in its own SQL: record-core's `bundles` (`bundle_id`, `object_type`, its R37), through
 * membership's viewer predicate over a determination's project (R11, R15). */

import { recordOf, stampInstant, instantOrder } from "../record-core/index.mjs";
import { membershipOf, viewerPredicate, Membership } from "../membership/index.mjs";
import { promotionOf } from "../promotion/index.mjs";
import { contentOf } from "../content/index.mjs";
import { inquiryOf } from "../inquiry/index.mjs";
import { strengthOf } from "../strength/index.mjs";
import { reevaluationOf } from "../reevaluation/index.mjs";
import { publicationOf } from "../publication/index.mjs";
import { standardsOf } from "../standards/index.mjs";
import { isMachineIdentity, proposalLabel, normalizeType, deriveInquiryTitle } from "../../checks/bio-checks.mjs";
import { CONFORMANCE_CHECKS, refusal } from "./checks.mjs";
import { CONFORMANCE_TABLES, migrateConformance } from "./schema.mjs";

export { CONFORMANCE_CHECKS } from "./checks.mjs";
export { CONFORMANCE_SCHEMA, CONFORMANCE_TABLES } from "./schema.mjs";

/** R1, R4: the three outcomes, each given per standard by the member. */
export const OUTCOMES = Object.freeze(["compliant", "noncompliant", "unclear"]);
/** R1: a comparison row's reading. */
export const READINGS = Object.freeze(["aligns", "diverges", "open"]);
/** R8: the keys no input or answer carries. */
export const SIGNIFICANCE_KEYS = Object.freeze(["significance", "severity", "priority", "urgency", "rank", "score"]);
/** R7: the longest reason a supersession carries. */
export const REASON_MAX = 500;
/** R11: the most determinations one page lists. */
export const DETERMINATIONS_PAGE_MAX = 200;
/** The most of each part one determination or comparison carries (bounds, so every write and read is bounded). */
export const LIMITS = Object.freeze({ findings: 50, standards: 50, rows: 200, questions: 20, evidence: 50 });
/** The longest text of one part (a description, a row's `requires` or `did`, a question), in characters. */
export const TEXT_MAX = 4000;
/** R12: the sentence every proposal is answered with. */
export const PROPOSAL_SAYS = "This is a comparison, not a determination: it sets out what the standards require and what "
  + "was done, and it never states whether the act complied. Only a member's determination records that.";
/** R10: the sentence beside the flag. */
export const FLAG_SAYS = "This is a notice: something this determination rests on changed. The determination and its "
  + "outcomes are unchanged until a member supersedes it.";
const UNSEEN = "an object you may not see";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const ID_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
const str = (v) => (typeof v === "string" && v.trim() ? v.trim() : null);
const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const text = (v) => (typeof v === "string" && v.trim() && v.length <= TEXT_MAX ? v.trim() : null);
const isDate = (v) => typeof v === "string" && DATE_RE.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`))
  && new Date(`${v}T00:00:00Z`).toISOString().slice(0, 10) === v;
const q = (s) => `"${String(s ?? "").replace(/[\r\n]+/g, " ").replace(/["\\]/g, "'")}"`;
const oneLine = (s) => String(s ?? "").replace(/[\r\n]+/g, " ").trim();
const safeJson = (s, dflt = null) => { try { return s == null ? dflt : JSON.parse(s); } catch { return dflt; } };
const rand = (n) => Math.random().toString(36).slice(2, 2 + n).padEnd(n, "0");

/* R8: every key anywhere in `v` (objects and lists, nested) named one of SIGNIFICANCE_KEYS, compared lower-cased; the
   walk is bounded, and a value past the bound is not read further (the input's own bounds refuse it first). */
function significanceKeys(v, found = new Set(), depth = 0) {
  if (depth > 12 || found.size > 20) return found;
  if (Array.isArray(v)) { for (const x of v.slice(0, 500)) significanceKeys(x, found, depth + 1); return found; }
  if (isObj(v))
    for (const [k, x] of Object.entries(v).slice(0, 200)) {
      if (SIGNIFICANCE_KEYS.includes(String(k).toLowerCase())) found.add(k);
      significanceKeys(x, found, depth + 1);
    }
  return found;
}

/* R12: whether a proposal names an outcome anywhere (an `outcome` or `outcomes` key, at any depth). */
function namesOutcome(v, depth = 0) {
  if (depth > 12) return false;
  if (Array.isArray(v)) return v.slice(0, 500).some((x) => namesOutcome(x, depth + 1));
  if (isObj(v))
    return Object.entries(v).slice(0, 200).some(([k, x]) =>
      ["outcome", "outcomes", "verdict"].includes(String(k).toLowerCase()) || namesOutcome(x, depth + 1));
  return false;
}

/* The answer's view of one strength axis: its state and grade, never composed with another axis (DEC-44). */
const axisOf = (a) => (isObj(a) ? { state: a.state ?? null, grade: a.grade ?? null } : null);

export class Conformance {
  #deps;
  #writing = new Set();   // R13, R17: the determination ids this module is promoting now

  constructor({ storage, record, membership, promotion, host = null, content = null, inquiry = null, strength = null,
                reevaluation = null, publication = null, standards = null, now = null } = {}) {
    this.sql = storage.sql;
    this.record = record;
    this.membership = membership;
    this.promotion = promotion;
    this.#deps = { host, content, inquiry, strength, reevaluation, publication, standards };
    this.now = typeof now === "function" ? now : () => stampInstant("second");
  }

  /* The modules reached lazily: each is created on the same host on first use, unless a test passed its own. */
  get content() { return this.#deps.content ||= contentOf(this.#deps.host); }
  get inquiry() { return this.#deps.inquiry ||= inquiryOf(this.#deps.host); }
  get strength() { return this.#deps.strength ||= strengthOf(this.#deps.host); }
  get reevaluation() { return this.#deps.reevaluation ||= reevaluationOf(this.#deps.host); }
  get publication() { return this.#deps.publication ||= publicationOf(this.#deps.host); }
  get standards() { return this.#deps.standards ||= standardsOf(this.#deps.host); }

  migrate() { migrateConformance(this.sql); }

  #rows(sql, ...a) { return [...this.sql.exec(sql, ...a)]; }
  #one(sql, ...a) { for (const r of this.sql.exec(sql, ...a)) return r; return null; }
  #when() { const w = this.now(); return typeof w === "string" && w ? w : stampInstant("second"); }

  /* ===================================================================== *
   * THE REFUSALS THE ACTS SHARE (R1's head, R8, R15)
   * ===================================================================== */

  /* R1, R13: an empty or machine author. */
  #refuseMachine(author) {
    /* DEC-49 REGION is-determination-member */
    if (!str(author) || isMachineIdentity(author))
      return refusal("MACHINE_CANNOT_DETERMINE", "a determination is a member's judgment; this act names no member "
        + "author, or a machine credential. A machine may prepare a comparison (comparisonPropose). Nothing was written.",
        { author: str(author) });
    /* END DEC-49 REGION is-determination-member */
    return null;
  }

  /* R1, R15 (membership R44): a project the viewer sees only at existence answers membership's own refusal; one not
     seen, absent or not a project, one answer. */
  #projectRefusal(project, viewer) {
    const id = str(project);
    const existence = id ? this.membership.existenceAct(id, viewer) : null;
    if (existence) return existence;
    const info = id ? this.record.bundleInfo(id) : null;
    /* DEC-49 REGION is-project-seen */
    if (!info || normalizeType(info.type) !== "project" || this.membership.sight(id, viewer) !== Membership.SIGHT_FULL)
      return refusal("NO_SUCH_PROJECT", "no project answers to that id here. A project you may not see answers exactly "
        + "as one that does not exist.", { project: id });
    /* END DEC-49 REGION is-project-seen */
    return null;
  }

  /* R1: the author has joined the project (membership R55), translated to this module's code in one line (K171 (11)).
     An author naming no member (the founder's session included) has not joined. */
  #participantRefusal(project, author) {
    const member = this.membership.positionalMember(null, author);
    const denied = member ? this.membership.projectAuthority(project, author, "joined", "determine") : true;
    /* DEC-49 REGION is-project-joined */
    if (denied)
      return refusal("NOT_A_PARTICIPANT", "only a member who has joined the project records its determinations. "
        + "Nothing was written.", { project, author: str(author) });
    /* END DEC-49 REGION is-project-joined */
    return null;
  }

  /* The bounds every determination and comparison keeps (LIMITS). */
  #sizeRefusal(parts) {
    for (const [part, v] of Object.entries(parts)) {
      const n = Array.isArray(v) ? v.length : 0;
      /* DEC-49 REGION is-within-bounds */
      if (n > LIMITS[part])
        return refusal("DETERMINATION_TOO_LARGE", `${n} ${part} is more than one carries (at most ${LIMITS[part]}). `
          + "Nothing was written.", { part, count: n, max: LIMITS[part] });
      /* END DEC-49 REGION is-within-bounds */
    }
    return null;
  }

  /* R8: no significance, severity, priority, urgency, rank or score, anywhere in the input. */
  #refuseSignificance(input) {
    const keys = [...significanceKeys(input)];
    /* DEC-49 REGION is-significance-absent */
    if (keys.length)
      return refusal("SIGNIFICANCE_IS_A_MEMBERS_JUDGMENT", `the input carries ${keys.join(", ")}: whether and how much a `
        + "breach matters is a member's judgment made with the consequences in front of them, and this module records "
        + "none. Nothing was written.", { keys });
    /* END DEC-49 REGION is-significance-absent */
    return null;
  }

  /* ===================================================================== *
   * THE PARTS OF A DETERMINATION (R1–R4, R6, R7)
   * ===================================================================== */

  /* R1, K171 (6): the act. `{id}` names an act an earlier determination of this project minted, and answers it as
     recorded; otherwise every part is required. With `supersedes` and no act id, the act is the predecessor's (R7). */
  #actOf(act, project, supersedes) {
    const a = isObj(act) ? act : {};
    let id = str(a.id);
    if (!id && str(supersedes)) {
      const prev = this.#one(`SELECT act_id FROM determinations WHERE determination_id=? AND project_id=?`,
                             str(supersedes), project);
      if (prev) id = prev.act_id;
    }
    const incomplete = (part, detail, extra = {}) =>
      /* DEC-49 REGION is-act-complete */
      refusal("ACT_INCOMPLETE", `${detail} Nothing was written.`, { part, ...extra });
      /* END DEC-49 REGION is-act-complete */
    if (id) {
      const held = this.#one(`SELECT * FROM determinations WHERE act_id=? AND project_id=? AND act_minted=1 LIMIT 1`,
                             id, project);
      if (!held) return incomplete("id", `the act id ${id.slice(0, 60)} names no act this project has determined.`,
                                   { act: id });
      return { ok: true, act: this.#actView(held), minted: false };
    }
    const description = text(a.description);
    if (!description) return incomplete("description", "the act states no description of what the government did.");
    const actor = isObj(a.actor) ? a.actor : {};
    const role = text(actor.role), body = text(actor.body);
    if (!role || !body)
      return incomplete("actor", "the act names the office that did it by its official role and body, never by a person.");
    let at = null, from = null, to = null;
    if (a.at != null || !isObj(a.period)) {
      if (!isDate(a.at)) return incomplete("at", "the act states when it was done, as a date (YYYY-MM-DD), or a period.");
      at = a.at;
    } else {
      from = a.period.from; to = a.period.to;
      if (!isDate(from) || !isDate(to) || to < from)
        return incomplete("period", "the act's period states both ends as dates (YYYY-MM-DD), the end not before the start.");
    }
    const ev = Array.isArray(a.evidence) ? a.evidence.map(str) : [];
    if (!ev.length || ev.some((x) => !x)) return incomplete("evidence", "the act names the content that shows it.");
    const unheld = [...new Set(ev)].filter((cid) => { try { return !this.content.contentRow(cid); } catch { return true; } });
    if (unheld.length)
      return incomplete("evidence", "the act names content the record does not hold.", { unresolved: unheld.slice(0, 20) });
    return { ok: true, minted: true,
             act: { id: null, description, actor: { role, body }, at, period: at ? null : { from, to },
                    evidence: [...new Set(ev)] } };
  }

  #actView(r) {
    return { id: r.act_id, description: r.act_description, actor: { role: r.act_role, body: r.act_body },
             at: r.act_at ?? null, period: r.act_at ? null : { from: r.act_from, to: r.act_to },
             evidence: safeJson(r.act_evidence, []) };
  }

  /* The dates a standard is read at (R3): the act's date, or each end of its period. */
  static datesOf(act) { return act.at ? [act.at] : [act.period.from, act.period.to]; }

  /* R2: each finding, pinned to a ratified edition of `project` (publication R37). An item is an id or
     `{finding, version?, case?, edition?}`; of the editions left, the latest edition of the last case is pinned. */
  #pinFindings(findings, project) {
    const list = Array.isArray(findings) ? findings : [];
    /* DEC-49 REGION is-finding-named */
    if (!list.length)
      return refusal("NO_FINDINGS", "a determination rests on at least one published finding (R14). Nothing was written.");
    /* END DEC-49 REGION is-finding-named */
    const pins = [], seen = new Set();
    for (const item of list) {
      const f = isObj(item) ? { finding: str(item.finding ?? item.id), version: str(item.version),
                                 case: str(item.case), edition: item.edition == null ? null : Number(item.edition) }
                            : { finding: str(item), version: null, case: null, edition: null };
      let items = [];
      if (f.finding) {
        let r = null;
        try { r = this.publication.publishedEditionsOf({ finding: f.finding, version: f.version, project }); } catch { r = null; }
        items = r && r.ok !== false && Array.isArray(r.items) ? r.items : [];
        items = items.filter((i) => i.project === project && (!f.case || i.case === f.case)
                                    && (f.edition == null || i.edition === f.edition));
      }
      /* DEC-49 REGION is-finding-published */
      if (!items.length)
        return refusal("FINDING_NOT_PUBLISHED", `${String(f.finding ?? "a finding named").slice(0, 80)} is not a finding `
          + "this project has published in a ratified case edition. A finding published only by another project, or not "
          + "at all, is not one. Nothing was written.", { finding: f.finding });
      /* END DEC-49 REGION is-finding-published */
      const pick = items.reduce((best, i) => (!best || i.case > best.case || (i.case === best.case && i.edition > best.edition)
        ? i : best), null);
      if (seen.has(f.finding)) continue;
      seen.add(f.finding);
      pins.push({ finding: f.finding, case: pick.case, edition: pick.edition, version_sha: pick.version_sha ?? null,
                  role: pick.role ?? null, frozen: pick.strength ?? null });
    }
    return { ok: true, pins };
  }

  /* R1, R3, R4: the standards, each read through `standards.inForce` at the act's dates; the outcome is checked later,
     in R1's order (OUTCOME_UNKNOWN after ROWS_INCOMPLETE). */
  #readStandards(standards, act, viewer) {
    const list = Array.isArray(standards) ? standards : [];
    /* DEC-49 REGION is-standard-named */
    if (!list.length)
      return refusal("NO_STANDARDS", "a determination measures the act against at least one standard the record holds "
        + "(R14). Nothing was written.");
    /* END DEC-49 REGION is-standard-named */
    const out = [], byId = new Map();
    for (const item of list) {
      const id = isObj(item) ? str(item.standard ?? item.id) : str(item);
      const outcome = isObj(item) ? item.outcome : undefined;
      let read = null;
      try { read = id ? this.standards.standardRead({ id, viewer }) : null; } catch { read = null; }
      /* DEC-49 REGION is-standard-held */
      if (!read || read.ok === false)
        return refusal("NO_SUCH_STANDARD", `${String(id ?? "a standard named").slice(0, 80)} is not a standard the record `
          + "holds. Nothing was written.", { standard: id });
      /* END DEC-49 REGION is-standard-held */
      const answers = Conformance.datesOf(act).map((d) => this.#inForce(id, d));
      const not = answers.find((x) => x.answer === "not_in_force");
      /* DEC-49 REGION is-standard-in-force */
      if (not)
        return refusal("STANDARD_NOT_IN_FORCE", `${id} was not in force on ${not.date}${not.why ? ` (${not.why})` : ""}. `
          + "Nothing was written.", { standard: id, date: not.date });
      /* END DEC-49 REGION is-standard-in-force */
      const und = answers.find((x) => x.answer !== "in_force");
      if (byId.has(id)) { byId.get(id).outcomes.push(outcome); continue; }
      const s = { standard: id, outcome, outcomes: [outcome], in_force: und ? "undetermined" : "in_force",
                  in_force_why: und ? `on ${und.date}: ${und.why ?? "the record does not decide it"}` : null };
      byId.set(id, s);
      out.push(s);
    }
    return { ok: true, standards: out };
  }

  /* standards R7's answer, as a word and why, whatever spelling the answer takes. */
  #inForce(id, date) {
    let r = null;
    try { r = this.standards.inForce(id, date); } catch { r = null; }
    const answer = typeof r === "string" ? r : isObj(r) ? (r.answer ?? r.state ?? r.in_force ?? null) : null;
    return { date, answer: ["in_force", "not_in_force", "undetermined"].includes(answer) ? answer : "undetermined",
             why: isObj(r) ? (r.why ?? null) : null };
  }

  /* R1: every standard has a row, and every row states what the standard requires, what was done and its reading. */
  #readRows(rows, standards) {
    const list = Array.isArray(rows) ? rows : [];
    const named = new Set(standards.map((s) => s.standard));
    const out = [];
    const incomplete = (detail, extra = {}) =>
      /* DEC-49 REGION is-comparison-complete */
      refusal("ROWS_INCOMPLETE", `${detail} Nothing was written.`, extra);
      /* END DEC-49 REGION is-comparison-complete */
    for (const [i, r] of list.entries()) {
      const row = isObj(r) ? r : {};
      const standard = str(row.standard), requires = text(row.requires), did = text(row.did);
      const reading = READINGS.includes(row.reading) ? row.reading : null;
      if (!standard || !named.has(standard))
        return incomplete(`row ${i} names no standard this determination names.`, { row: i });
      if (!requires || !did || !reading)
        return incomplete(`row ${i} states ${[!requires && "what the standard requires", !did && "what was done",
          !reading && `a reading (${READINGS.join(", ")})`].filter(Boolean).join(", ")}: each is required.`, { row: i });
      const content = Array.isArray(row.content) ? row.content.map(str).filter(Boolean).slice(0, LIMITS.evidence)
        : str(row.content) ? [str(row.content)] : [];
      out.push({ standard, requires, did, reading, content });
    }
    const bare = standards.find((s) => !out.some((r) => r.standard === s.standard));
    if (bare) return incomplete(`${bare.standard} has no row: each standard named is compared.`, { standard: bare.standard });
    return { ok: true, rows: out };
  }

  /* R6: the questions, each `{question, inquiry?}`: an inquiry the author may see, or a new one opened in the act. */
  #readQuestions(questions, outcomes, author) {
    const list = Array.isArray(questions) ? questions : [];
    const out = [];
    const bad = (detail, extra = {}) =>
      /* DEC-49 REGION is-question-named */
      refusal("UNCLEAR_NO_QUESTION", `${detail} Nothing was written.`, extra);
      /* END DEC-49 REGION is-question-named */
    for (const [i, x] of list.entries()) {
      const item = isObj(x) ? x : { question: x };
      const question = text(item.question);
      if (!question) return bad(`question ${i} states no question.`, { question: i });
      const inquiry = str(item.inquiry);
      if (inquiry) {
        const info = this.record.bundleInfo(inquiry);
        if (!info || normalizeType(info.type) !== "inquiry" || !this.membership.inSight(inquiry, author))
          return bad(`question ${i} names no inquiry you may see.`, { question: i });
      }
      out.push({ question, inquiry });
    }
    if (outcomes.includes("unclear") && !out.length)
      return bad("an unclear outcome names at least one open question, each sent back to an inquiry.");
    return { ok: true, questions: out };
  }

  /* R7: `supersedes` names an earlier determination of the same act in the same project, not yet superseded, with a
     reason. */
  #supersession(supersedes, reason, act, project, viewer) {
    const id = str(supersedes);
    if (!id) return { ok: true, prev: null };
    const prev = this.#one(`SELECT * FROM determinations WHERE determination_id=?`, id);
    if (!prev || prev.project_id !== project || this.membership.sight(prev.project_id, viewer) !== Membership.SIGHT_FULL)
      return refuseNoSuchDetermination(id);
    /* DEC-49 REGION is-same-act */
    if (act.id && act.id !== prev.act_id)
      return refusal("SUPERSEDES_ANOTHER_ACT", `${id} is a determination of ${prev.act_id}, and this names ${act.id}. `
        + "Nothing was written.", { supersedes: id, act: act.id, predecessor_act: prev.act_id });
    /* END DEC-49 REGION is-same-act */
    const why = typeof reason === "string" ? reason.trim() : "";
    /* DEC-49 REGION is-reason-stated */
    if (!why || why.length > REASON_MAX)
      return refusal("BAD_REASON", `superseding a determination says why, in 1 to ${REASON_MAX} characters. `
        + "Nothing was written.", { supersedes: id, max: REASON_MAX });
    /* END DEC-49 REGION is-reason-stated */
    const by = this.#one(`SELECT superseded_by FROM determination_supersessions WHERE superseded=?`, id);
    /* DEC-49 REGION is-supersedable */
    if (by)
      return refusal("ALREADY_SUPERSEDED", `${id} was superseded by ${by.superseded_by}. Nothing was written.`,
                     { supersedes: id, superseded_by: by.superseded_by });
    /* END DEC-49 REGION is-supersedable */
    return { ok: true, prev, reason: why };
  }

  /* ===================================================================== *
   * R1–R8, R13, R14, R16, R17: determine
   * ===================================================================== */

  /** R1–R8: a member's determination that `act` is compliant, noncompliant or unclear against each named standard,
   *  resting on findings `project` has published. Refusals in R1's order, then R12's proposal and R7's supersession. The
   *  determination and every inquiry it opens land together or not at all (R6). */
  determine(input = {}) {
    const { project = null, act = null, findings = null, standards = null, rows = null, questions = null,
            supersedes = null, reason = null, proposal = null, author = null } = isObj(input) ? input : {};
    const viewer = input && input.viewer != null ? input.viewer : author;
    const byMachine = this.#refuseMachine(author);
    if (byMachine) return byMachine;
    const pid = str(project);
    const unseen = this.#projectRefusal(pid, viewer);
    if (unseen) return unseen;
    const notJoined = this.#participantRefusal(pid, author);
    if (notJoined) return notJoined;
    const large = this.#sizeRefusal({ findings, standards, rows, questions,
                                      evidence: isObj(act) ? act.evidence : null });
    if (large) return large;
    const a = this.#actOf(act, pid, supersedes);
    if (!a.ok) return a;
    const f = this.#pinFindings(findings, pid);
    if (!f.ok) return f;
    const s = this.#readStandards(standards, a.act, viewer);
    if (!s.ok) return s;
    const r = this.#readRows(rows, s.standards);
    if (!r.ok) return r;
    for (const x of s.standards) {
      const outcomes = [...new Set(x.outcomes)];
      /* DEC-49 REGION is-outcome-stated */
      if (outcomes.length !== 1 || !OUTCOMES.includes(outcomes[0]))
        return refusal("OUTCOME_UNKNOWN", `${x.standard} carries ${outcomes.length > 1 ? "two outcomes" : "no outcome"}: `
          + `each standard carries one of ${OUTCOMES.join(", ")}. Nothing was written.`, { standard: x.standard });
      /* END DEC-49 REGION is-outcome-stated */
      x.outcome = outcomes[0];
    }
    const qs = this.#readQuestions(questions, s.standards.map((x) => x.outcome), author);
    if (!qs.ok) return qs;
    const sig = this.#refuseSignificance(input);
    if (sig) return sig;
    const drew = str(proposal);
    if (drew && !this.#one(`SELECT proposal_id FROM comparison_proposals WHERE proposal_id=? AND project_id=?`, drew, pid))
      return refuseNoSuchProposal(drew);
    const sup = this.#supersession(supersedes, reason, a.act, pid, viewer);
    if (!sup.ok) return sup;
    return this.#write({ project: pid, act: a, pins: f.pins, standards: s.standards, rows: r.rows,
                         questions: qs.questions, sup, proposal: drew, author: str(author), viewer });
  }

  /* R6, R16, R17: one outer transaction: each new inquiry, then the determination's own promotion, then this module's
     rows. A refused promotion refuses the whole act, and nothing is written, no id spent (record-core R32). */
  #write({ project, act, pins, standards, rows, questions, sup, proposal, author, viewer }) {
    const at = this.#when();
    const year = at.slice(0, 4);
    let id = null;
    const out = this.record.transact(() => {
      id = `${this.record.allocId("CONF", year).id}-determination`;
      const actId = act.minted ? this.record.allocId("ACT", year).id : act.act.id;
      const theAct = { ...act.act, id: actId };
      const qs = [];
      for (const x of questions) {
        if (x.inquiry) { qs.push({ ...x, opened: false }); continue; }
        const opened = this.#openInquiry(x.question, id, project, author, viewer, at);
        if (!opened.ok) return { ...opened, question: x.question };
        qs.push({ question: x.question, inquiry: opened.bundleId, opened: true });
      }
      this.#writing.add(id);
      let p;
      try {
        p = this.promotion.promote({ bundleId: id, base: null, snapKey: `${at.replace(/[-:]/g, "")}_${rand(4)}`, author,
          files: [{ path: "bundle.md", text: determinationDoc({ id, project, act: theAct, pins, standards, rows,
                                                                    questions: qs, sup, proposal, author, at }) }],
          meta: { object_type: "determination", current_state: "recorded", created: at, last_updated: at },
          actorIdentity: author, actorViewer: viewer });
      } finally { this.#writing.delete(id); }
      if (!p || !p.ok) return p || { ok: false, reason: "PROMOTION_FAILED" };
      this.sql.exec(
        `INSERT INTO determinations (determination_id, project_id, act_id, act_minted, act_description, act_role, act_body,
           act_at, act_from, act_to, act_evidence, proposal_id, supersedes, reason, author, at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        id, project, actId, act.minted ? 1 : 0, theAct.description, theAct.actor.role, theAct.actor.body,
        theAct.at, theAct.period ? theAct.period.from : null, theAct.period ? theAct.period.to : null,
        JSON.stringify(theAct.evidence), proposal, sup.prev ? sup.prev.determination_id : null,
        sup.prev ? sup.reason : null, author, at);
      standards.forEach((x, i) => this.sql.exec(
        `INSERT INTO determination_standards (determination_id, ord, standard_id, outcome, in_force, in_force_why)
         VALUES (?,?,?,?,?,?)`, id, i, x.standard, x.outcome, x.in_force, x.in_force_why));
      rows.forEach((x, i) => this.sql.exec(
        `INSERT INTO determination_rows (determination_id, ord, standard_id, requires, did, reading, content)
         VALUES (?,?,?,?,?,?,?)`, id, i, x.standard, x.requires, x.did, x.reading, JSON.stringify(x.content)));
      pins.forEach((x, i) => this.sql.exec(
        `INSERT INTO determination_findings (determination_id, ord, finding_id, case_id, edition, version_sha, role, frozen)
         VALUES (?,?,?,?,?,?,?,?)`, id, i, x.finding, x.case, x.edition, x.version_sha, x.role,
        x.frozen ? JSON.stringify(x.frozen) : null));
      qs.forEach((x, i) => this.sql.exec(
        `INSERT INTO determination_questions (determination_id, ord, question, inquiry_id, opened, project_id)
         VALUES (?,?,?,?,?,?)`, id, i, x.question, x.inquiry, x.opened ? 1 : 0, project));
      if (sup.prev)
        this.sql.exec(`INSERT INTO determination_supersessions (superseded, superseded_by, reason, author, at)
                       VALUES (?,?,?,?,?)`, sup.prev.determination_id, id, sup.reason, author, at);
      if (proposal)
        this.sql.exec(`INSERT INTO comparison_proposal_uses (proposal_id, determination_id, at) VALUES (?,?,?)`,
                      proposal, id, at);
      return { ok: true };
    });
    if (!out || !out.ok) return out;
    return { ...this.determinationRead({ id, viewer }), wrote: true };
  }

  /* R6: a new inquiry, `open`, titled from the question, through promotion (so inquiry's own check runs), recorded in
     `project` by this module's rows and named so in its Session Log. */
  #openInquiry(question, determination, project, author, viewer, at) {
    const id = `${this.record.allocId("INQ", at.slice(0, 4)).id}-question`;
    const title = deriveInquiryTitle(question) ?? question.slice(0, 120);
    const md = ["---", `id: ${id}`, "object_type: inquiry", "schema: inquiry@1", `title: ${q(title)}`,
      "current_state: open", "prior_state: null", `created: ${q(at)}`, `last_updated: ${q(at)}`,
      "produced_by:", "  mode: human", "  capability_tier: session", "references: []", "state_history: []",
      "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []",
      "surfaced_by: human", 'disposition_reason: ""', "---", "", "## Question", "", question, "",
      "## What It Rests On", "", "## Conclusion", "", "## What Would Falsify This", "", "## Session Log", "",
      `### Session ${at} | Opened | ${oneLine(author)}`,
      `Changes: opened by the determination ${determination} in the project ${project}, whose outcome is unclear on this `
      + "question.", "", "## Review Notes", ""].join("\n");
    return this.promotion.promote({ bundleId: id, base: null, snapKey: `${at.replace(/[-:]/g, "")}_${rand(4)}`, author,
      files: [{ path: "bundle.md", text: md }],
      meta: { object_type: "inquiry", current_state: "open", created: at, last_updated: at },
      actorIdentity: author, actorViewer: viewer });
  }

  /* ===================================================================== *
   * R9, R10, R15: the reads
   * ===================================================================== */

  /* R15: the determination's row when the viewer sees its project in full, else null (absent and unseen alike). */
  #seen(id, viewer) {
    const r = str(id) ? this.#one(`SELECT * FROM determinations WHERE determination_id=?`, str(id)) : null;
    return r && this.membership.sight(r.project_id, viewer) === Membership.SIGHT_FULL ? r : null;
  }

  /** R9: one determination: the act, each standard with its outcome, whether it was in force and its rows (with any
   *  disagreement stated, R4), each finding's pinned edition with its frozen pair beside its live pair per axis (never
   *  composed), the questions, the author and time, the supersession links and R10's flag. THE ONE SHAPE (K248), which
   *  `consequences`, `actions`, `filings` and `escalation` read, and of which each R11 item is a subset:
   *    {ok, id, project, act: {id, description, actor: {role, body}, at, period, evidence}, outcomes: [{standard,
   *     outcome}], standards: [{standard, outcome, in_force, in_force_why, rows: [{requires, did, reading, content}],
   *     disagreement}], findings: [{finding, case, edition, version_sha, role, frozen, live}], questions: [{question,
   *     inquiry, opened}], author, at, supersedes, reason, superseded_by, live, proposal,
   *     basis_changed: null | {causes: [{kind, subject, source, since, detail, affects?}], says}}
   *  `at` or `period` is null as the act states; a standard or finding the viewer may not see is null beside `says`. */
  determinationRead({ id = null, viewer = null } = {}) {
    const r = this.#seen(id, viewer);
    if (!r) return refuseNoSuchDetermination(id);
    const did = r.determination_id;
    const rows = this.#rows(`SELECT * FROM determination_rows WHERE determination_id=? ORDER BY ord LIMIT ?`,
                            did, LIMITS.rows);
    const seenStd = (sid) => this.membership.inSight(sid, viewer);
    const standards = this.#rows(`SELECT * FROM determination_standards WHERE determination_id=? ORDER BY ord LIMIT ?`,
                                 did, LIMITS.standards).map((s) => {
      const mine = rows.filter((x) => x.standard_id === s.standard_id);
      const readings = mine.map((x) => x.reading);
      /* R4: the member's outcome stands; a disagreement with the rows is stated beside it, never corrected. */
      const disagreement = s.outcome === "noncompliant" && readings.length && readings.every((x) => x === "aligns")
        ? "every row reads aligns, and the member's outcome is noncompliant"
        : s.outcome === "compliant" && readings.includes("diverges")
          ? "a row reads diverges, and the member's outcome is compliant" : null;
      const visible = seenStd(s.standard_id);
      return { standard: visible ? s.standard_id : null, ...(visible ? {} : { says: UNSEEN }), outcome: s.outcome,
               in_force: s.in_force, in_force_why: s.in_force_why,
               rows: mine.map((x) => ({ requires: x.requires, did: x.did, reading: x.reading,
                                        content: safeJson(x.content, []) })),
               disagreement };
    });
    const findings = this.#rows(`SELECT * FROM determination_findings WHERE determination_id=? ORDER BY ord LIMIT ?`,
                                did, LIMITS.findings).map((x) => {
      if (!this.membership.inSight(x.finding_id, viewer)) return { finding: null, says: UNSEEN };
      let live = null;
      try { live = this.strength.inquiryStrength({ id: x.finding_id, viewer }); } catch { live = null; }
      const frozen = safeJson(x.frozen, null);
      return { finding: x.finding_id, case: x.case_id, edition: Number(x.edition), version_sha: x.version_sha,
               role: x.role, frozen: frozen ? { capture: axisOf(frozen.capture), connection: axisOf(frozen.connection),
                                                testimony: axisOf(frozen.testimony) } : null,
               live: live && live.ok !== false ? { capture: axisOf(live.capture), connection: axisOf(live.connection),
                                                   testimony: axisOf(live.testimony) } : null };
    });
    const questions = this.#rows(`SELECT * FROM determination_questions WHERE determination_id=? ORDER BY ord LIMIT ?`,
                                 did, LIMITS.questions).map((x) => ({ question: x.question,
      inquiry: this.membership.inSight(x.inquiry_id, viewer) ? x.inquiry_id : null, opened: x.opened === 1 }));
    const by = this.#one(`SELECT * FROM determination_supersessions WHERE superseded=?`, did);
    const flag = this.#flag(r, viewer);
    return { ok: true, id: did, project: r.project_id, act: this.#actView(r),
             outcomes: standards.map((s) => ({ standard: s.standard, outcome: s.outcome })), standards, findings,
             questions, author: r.author, at: r.at, supersedes: r.supersedes ?? null, reason: r.reason ?? null,
             superseded_by: by ? by.superseded_by : null, live: !by, proposal: r.proposal_id ?? null,
             basis_changed: flag.causes.length ? { causes: flag.causes, says: FLAG_SAYS } : null };
  }

  /* R10: every cause standing on the determination: what reevaluation told (its R8, recorded as it came), and what the
     record answers now (a finding reopened or superseded since, or published in a later edition of its case; a
     standard superseded; a newer capture of a text or evidence passage that does not carry it, or may not). Each once. */
  #flag(r, viewer) {
    const causes = [], keys = new Set();
    const add = (c) => { const k = `${c.kind}|${c.subject}|${c.source}`; if (!keys.has(k)) { keys.add(k); causes.push(c); } };
    for (const x of this.#rows(`SELECT * FROM determination_flags WHERE determination_id=? ORDER BY at, kind, subject
                                LIMIT 200`, r.determination_id))
      add({ kind: x.kind, subject: x.subject, source: x.source, since: x.since || null, detail: x.detail ?? null });
    const pins = this.#rows(`SELECT * FROM determination_findings WHERE determination_id=? ORDER BY ord LIMIT ?`,
                            r.determination_id, LIMITS.findings);
    for (const p of pins) {
      let by = [];
      try { by = this.inquiry.supersededBy(p.finding_id) || []; } catch { by = []; }
      if (by.length) add({ kind: "finding", subject: p.finding_id, source: "superseded", since: null,
                           detail: `${p.finding_id} is superseded` });
      let h = null;
      try { h = this.inquiry.stateHistory(p.finding_id); } catch { h = null; }
      const reopened = (h && h.ok && Array.isArray(h.transitions) ? h.transitions : [])
        .filter((t) => ["open", "surfaced"].includes(t.to) && t.from && t.from !== t.to && t.at
                       && instantOrder(t.at, r.at) >= 0).pop();
      if (reopened) add({ kind: "finding", subject: p.finding_id, source: "reopened", since: reopened.at,
                          detail: `${p.finding_id} was reopened` });
      let eds = null;
      try { eds = this.publication.publishedEditionsOf({ finding: p.finding_id, project: r.project_id }); } catch { eds = null; }
      const later = (eds && Array.isArray(eds.items) ? eds.items : [])
        .filter((i) => i.case === p.case_id && i.edition > Number(p.edition)).pop();
      if (later) add({ kind: "finding", subject: p.finding_id, source: "edition", since: null,
                       detail: `${p.case_id} is published at edition ${later.edition}; this determination pins edition `
                             + `${p.edition}` });
    }
    const passages = new Set(safeJson(r.act_evidence, []));
    for (const s of this.#rows(`SELECT standard_id FROM determination_standards WHERE determination_id=? ORDER BY ord
                                LIMIT ?`, r.determination_id, LIMITS.standards)) {
      let read = null;
      try { read = this.standards.standardRead({ id: s.standard_id, viewer }); } catch { read = null; }
      if (!read || read.ok === false) continue;
      if (str(read.superseded_by))
        add({ kind: "standard", subject: s.standard_id, source: "superseded", since: null,
              detail: `${s.standard_id} is superseded by ${read.superseded_by}` });
      for (const t of (Array.isArray(read.text) ? read.text : []).slice(0, LIMITS.evidence))
        if (typeof t === "string") passages.add(t); else if (isObj(t) && str(t.content_id ?? t.id)) passages.add(str(t.content_id ?? t.id));
    }
    for (const cid of [...passages].slice(0, 2 * LIMITS.evidence)) {
      let n = null;
      try { n = this.content.passageNotice({ contentId: cid, viewer }); } catch { n = null; }
      if (n && n.ok !== false && n.newer && ["affected", "undetermined"].includes(n.affects))
        add({ kind: "passage", subject: cid, source: "newer_capture", since: null, affects: n.affects,
              detail: n.affects === "affected" ? "a newer capture of its document does not carry this passage"
                                               : "a newer capture of its document may not carry this passage" });
    }
    return { causes };
  }

  /** R11: the determinations the filters admit, in id order, at most 200 a page (a lower `limit` honoured), `truncated`
   *  measured by reading one past; only those in projects the viewer sees in full (R15). */
  determinationsFor({ project = null, act = null, standard = null, finding = null, outcome = null, live = null,
                      after = null, limit = null, viewer = null } = {}) {
    const pid = str(project);
    if (pid) { const unseen = this.#projectRefusal(pid, viewer); if (unseen) return unseen; }
    const cap = Number.isInteger(Number(limit)) && Number(limit) >= 1
      ? Math.min(Number(limit), DETERMINATIONS_PAGE_MAX) : DETERMINATIONS_PAGE_MAX;
    const gate = viewerPredicate(viewer);
    const where = [`d.determination_id > ?`, `(${gate.sql})`], args = [str(after) ?? "", ...gate.args];
    if (pid) { where.push(`d.project_id = ?`); args.push(pid); }
    if (str(act)) { where.push(`d.act_id = ?`); args.push(str(act)); }
    if (str(standard)) {
      where.push(`EXISTS (SELECT 1 FROM determination_standards s WHERE s.determination_id = d.determination_id
                          AND s.standard_id = ?)`);
      args.push(str(standard));
    }
    if (str(outcome)) {
      where.push(`EXISTS (SELECT 1 FROM determination_standards s WHERE s.determination_id = d.determination_id
                          AND s.outcome = ?)`);
      args.push(str(outcome));
    }
    if (str(finding)) {
      where.push(`EXISTS (SELECT 1 FROM determination_findings f WHERE f.determination_id = d.determination_id
                          AND f.finding_id = ?)`);
      args.push(str(finding));
    }
    if (live === true || live === "true" || live === "1")
      where.push(`NOT EXISTS (SELECT 1 FROM determination_supersessions x WHERE x.superseded = d.determination_id)`);
    const page = this.#rows(
      `SELECT d.* FROM determinations d JOIN bundles b ON b.bundle_id = d.project_id
        WHERE ${where.join(" AND ")} ORDER BY d.determination_id LIMIT ?`, ...args, cap + 1);
    const truncated = page.length > cap;
    const items = page.slice(0, cap).map((r) => {
      const by = this.#one(`SELECT superseded_by FROM determination_supersessions WHERE superseded=?`, r.determination_id);
      return { id: r.determination_id, project: r.project_id, act: this.#actView(r),
               outcomes: this.#rows(`SELECT standard_id, outcome FROM determination_standards WHERE determination_id=?
                                     ORDER BY ord LIMIT ?`, r.determination_id, LIMITS.standards)
                 .map((s) => ({ standard: this.membership.inSight(s.standard_id, viewer) ? s.standard_id : null,
                                outcome: s.outcome })),
               findings: this.#rows(`SELECT finding_id, case_id, edition, version_sha, role FROM determination_findings
                                     WHERE determination_id=? ORDER BY ord LIMIT ?`, r.determination_id, LIMITS.findings)
                 .map((f) => (this.membership.inSight(f.finding_id, viewer)
                   ? { finding: f.finding_id, case: f.case_id, edition: Number(f.edition), version_sha: f.version_sha,
                       role: f.role }
                   : { finding: null, says: UNSEEN })),
               author: r.author, at: r.at, supersedes: r.supersedes ?? null,
               superseded_by: by ? by.superseded_by : null, live: !by };
    });
    return { ok: true, items, limit: cap, truncated, cursor: truncated ? items[items.length - 1].id : null };
  }

  /* ===================================================================== *
   * R12: the comparison proposed
   * ===================================================================== */

  /** R12: a comparison a machine prepared or a member suggested, stored apart from determinations, labelled with who
   *  made it and whether it is machine work, and answered with the sentence that it is not a determination. It carries
   *  rows and questions and never an outcome. */
  comparisonPropose(input = {}) {
    const { project = null, act = null, standards = null, rows = null, questions = null, proposer = null } =
      isObj(input) ? input : {};
    const viewer = input && input.viewer != null ? input.viewer : proposer;
    const pid = str(project);
    const unseen = this.#projectRefusal(pid, viewer);
    if (unseen) return unseen;
    const large = this.#sizeRefusal({ standards, rows, questions, evidence: isObj(act) ? act.evidence : null });
    if (large) return large;
    /* DEC-49 REGION is-proposal-outcomeless */
    if (namesOutcome(input))
      return refusal("PROPOSAL_CANNOT_DETERMINE", "a comparison carries rows and questions and never an outcome: only a "
        + "member's determination records whether the act complied. Nothing was written.");
    /* END DEC-49 REGION is-proposal-outcomeless */
    const sig = this.#refuseSignificance(input);
    if (sig) return sig;
    const a = isObj(act) ? act : {};
    const theAct = { id: str(a.id), description: text(a.description),
                     actor: isObj(a.actor) ? { role: text(a.actor.role), body: text(a.actor.body) } : null,
                     at: isDate(a.at) ? a.at : null,
                     period: isObj(a.period) ? { from: isDate(a.period.from) ? a.period.from : null,
                                                 to: isDate(a.period.to) ? a.period.to : null } : null,
                     evidence: Array.isArray(a.evidence) ? a.evidence.map(str).filter(Boolean) : [] };
    const stds = (Array.isArray(standards) ? standards : []).map((x) => (isObj(x) ? str(x.standard ?? x.id) : str(x)))
      .filter(Boolean);
    const rs = (Array.isArray(rows) ? rows : []).filter(isObj).map((x) => ({
      standard: str(x.standard), requires: text(x.requires), did: text(x.did),
      reading: READINGS.includes(x.reading) ? x.reading : null,
      content: Array.isArray(x.content) ? x.content.map(str).filter(Boolean).slice(0, LIMITS.evidence) : [] }));
    const qs = (Array.isArray(questions) ? questions : []).map((x) => (isObj(x) ? x : { question: x }))
      .map((x) => ({ question: text(x.question), inquiry: str(x.inquiry) })).filter((x) => x.question);
    const at = this.#when();
    const who = str(proposer);
    let id = null;
    this.record.transact(() => {
      id = this.record.allocId("CMP", at.slice(0, 4)).id;
      this.sql.exec(`INSERT INTO comparison_proposals (proposal_id, project_id, act, standards, rows, questions, proposer,
                       machine, at) VALUES (?,?,?,?,?,?,?,?,?)`,
                    id, pid, JSON.stringify(theAct), JSON.stringify(stds), JSON.stringify(rs), JSON.stringify(qs), who,
                    proposalLabel(who, "comparison").machine_work ? 1 : 0, at);
      return { ok: true };
    });
    return { ok: true, proposal: this.#proposalView(this.#one(`SELECT * FROM comparison_proposals WHERE proposal_id=?`, id),
                                                    viewer), wrote: true };
  }

  /** R12: one proposal, its label and the determinations that drew on it; absent, unseen and another project's alike. */
  comparisonRead({ id = null, viewer = null } = {}) {
    const r = str(id) ? this.#one(`SELECT * FROM comparison_proposals WHERE proposal_id=?`, str(id)) : null;
    if (!r || this.membership.sight(r.project_id, viewer) !== Membership.SIGHT_FULL) return refuseNoSuchProposal(id);
    return { ok: true, proposal: this.#proposalView(r, viewer) };
  }

  #proposalView(r, viewer) {
    const label = proposalLabel(r.proposer ?? null, "comparison");
    const uses = this.#rows(`SELECT determination_id, at FROM comparison_proposal_uses WHERE proposal_id=?
                             ORDER BY determination_id LIMIT ?`, r.proposal_id, DETERMINATIONS_PAGE_MAX);
    return { id: r.proposal_id, project: r.project_id, act: safeJson(r.act, null),
             standards: safeJson(r.standards, []).map((s) => (this.membership.inSight(s, viewer) ? s : null)),
             rows: safeJson(r.rows, []), questions: safeJson(r.questions, []), proposer: r.proposer ?? null, label,
             machine_work: label.machine_work, at: r.at, says: PROPOSAL_SAYS,
             drawn_on_by: uses.map((u) => ({ determination: u.determination_id, at: u.at })) };
  }

  /* ===================================================================== *
   * R10: the notice reevaluation gives (its R8); R13, R17: the step promotion runs
   * ===================================================================== */

  /** R10: reevaluation's `onBasisChanged` listener. A finding's move flags every determination pinning it; a passage's
   *  newer capture (affected or undetermined) flags every determination whose act it evidences. Recorded once; the
   *  determination itself is not touched. */
  basisChanged(event) {
    if (!isObj(event) || !str(event.subject)) return { flagged: 0 };
    const kind = event.kind === "passage" ? "passage" : "finding";
    if (kind === "passage" && !["affected", "undetermined"].includes(event.affects)) return { flagged: 0 };
    const subject = str(event.subject);
    const ids = kind === "finding"
      ? this.#rows(`SELECT DISTINCT determination_id FROM determination_findings WHERE finding_id=?
                    ORDER BY determination_id LIMIT 1000`, subject)
      : this.#rows(`SELECT d.determination_id FROM determinations d, json_each(d.act_evidence) e WHERE e.value=?
                    ORDER BY d.determination_id LIMIT 1000`, subject);
    const at = this.#when();
    const source = str(event.source) ?? (kind === "passage" ? "newer_capture" : "changed");
    const since = str(event.since) ?? "";
    const detail = typeof event.detail === "string" ? event.detail.slice(0, 500) : null;
    this.record.transact(() => {
      for (const { determination_id } of ids)
        this.sql.exec(`INSERT INTO determination_flags (determination_id, kind, subject, source, since, detail, at)
                       VALUES (?,?,?,?,?,?,?) ON CONFLICT DO NOTHING`, determination_id, kind, subject, source, since,
                      detail, at);
      return { ok: true };
    });
    return { flagged: ids.length };
  }

  /** R13, R17 (promotion R39): a determination is written only by `determine`, and never revised: any other promotion
   *  of a `determination` (a raw `op=promote`, a revision) is refused. A migration replay is not asked. */
  check(c) {
    const type = normalizeType(c && c.promotedType);
    if (type !== "determination" || c.replay || this.#writing.has(c.bundleId)) return null;
    /* DEC-49 REGION is-determination-act */
    return refusal("DETERMINATION_ONLY_BY_ITS_ACT", "a determination is recorded by the determination act and never "
      + "revised: a correction is a new determination that supersedes it. Nothing was written.",
      { bundleId: c.bundleId ?? null });
    /* END DEC-49 REGION is-determination-act */
  }
}

/* R9, R15: the one "no such determination" answer, absent and unseen alike. */
function refuseNoSuchDetermination(id) {
  /* DEC-49 REGION is-determination-seen */
  return refusal("NO_SUCH_DETERMINATION", "no determination answers to that id here. One you may not see answers exactly "
    + "as one that does not exist.", { id: str(id) });
  /* END DEC-49 REGION is-determination-seen */
}

/* R12: the one "no such proposal" answer, absent, unseen and another project's alike. */
function refuseNoSuchProposal(id) {
  /* DEC-49 REGION is-proposal-seen */
  return refusal("NO_SUCH_PROPOSAL", "no comparison answers to that id in this project. One you may not see answers "
    + "exactly as one that does not exist. Nothing was written.", { proposal: str(id) });
  /* END DEC-49 REGION is-proposal-seen */
}

/* R17: the determination's own document, the record's word on it, as promotion stores it (history, audit, export). Its
   front matter carries the core fields every record document states; its body states every part in words. */
export function determinationDoc({ id, project, act, pins, standards, rows, questions, sup, proposal, author, at }) {
  const when = act.at ? `on ${act.at}` : `from ${act.period.from} to ${act.period.to}`;
  const title = `Determination: ${oneLine(act.description).slice(0, 100)}`;
  const lines = ["---", `id: ${id}`, "object_type: determination", "schema: determination@1", `title: ${q(title)}`,
    "current_state: recorded", "prior_state: null", `created: ${q(at)}`, `last_updated: ${q(at)}`,
    `project: ${project}`, `act_id: ${act.id}`, `author: ${q(author)}`,
    ...(sup && sup.prev ? [`supersedes: ${sup.prev.determination_id}`] : []),
    ...(proposal ? [`drew_on: ${proposal}`] : []),
    "produced_by:", "  mode: human", "  capability_tier: session", "references: []", "state_history: []",
    "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []", "---", "",
    "## Act", "", `${oneLine(act.description)}`, "",
    `Done by ${oneLine(act.actor.role)}, ${oneLine(act.actor.body)}, ${when}. Shown by: ${act.evidence.join(", ")}.`, "",
    "## Standards and Outcomes", "",
    ...standards.map((s) => `- ${s.standard}: ${s.outcome}${s.in_force === "undetermined"
      ? ` (whether it was in force is undetermined: ${oneLine(s.in_force_why)})` : ""}`), "",
    "## Comparison", "",
    ...rows.map((r) => `- ${r.standard} requires: ${oneLine(r.requires)}. Done: ${oneLine(r.did)}. Reading: ${r.reading}.`
      + (r.content.length ? ` Shown by: ${r.content.join(", ")}.` : "")), "",
    "## Findings", "",
    ...pins.map((p) => `- ${p.finding}, pinned at ${p.case} edition ${p.edition}${p.version_sha ? ` (${p.version_sha})` : ""}`),
    "", "## Open Questions", "",
    ...(questions.length ? questions.map((x) => `- ${oneLine(x.question)} (${x.inquiry})`) : ["None."]), "",
    ...(sup && sup.prev ? ["## Supersedes", "", `${sup.prev.determination_id}: ${oneLine(sup.reason)}`, ""] : []),
    "## Session Log", "", `### Session ${at} | Determined | ${oneLine(author)}`,
    `Changes: determination recorded in ${project}.`, ""];
  return lines.join("\n");
}

const instances = new WeakMap();

/** K61: the one instance per host. At creation: its tables, their purge declaration (K23), its step with promotion
 *  (R13, R17) and its listener with reevaluation (R10). */
export function conformanceOf(host, deps) {
  let c = instances.get(host);
  if (!c) {
    const d = deps || {};
    const storage = d.storage || host.storage;
    const record = d.record || recordOf(host);
    const membership = d.membership || membershipOf(host, { record });
    const promotion = d.promotion || promotionOf(host, { record, membership });
    c = new Conformance({ ...d, host, storage, record, membership, promotion });
    instances.set(host, c);
    c.migrate();
    record.declarePurge("conformance", CONFORMANCE_TABLES);
    promotion.registerStep("conformance", { check: (x) => c.check(x) });
    c.reevaluation.onBasisChanged("conformance", (e) => c.basisChanged(e));
  }
  return c;
}

/** Which purge declaration names one of this module's tables (record-core R21: each owner declares its own). */
export function conformanceOwns(t) {
  const name = typeof t === "string" ? t : t && t.name;
  return CONFORMANCE_TABLES.some((x) => x.name === name);
}

/** The module's ops (K3), as entries of the store's op map. `author`, `viewer` are the control plane's stamps, read from
 *  the query after the body, so a caller's own copy never wins. */
export function conformanceOps(c, url, body) {
  const qp = (k) => url.searchParams.get(k);
  const b = body && typeof body === "object" ? body : {};
  const stamped = { author: qp("author"), viewer: qp("viewer") };
  return {
    determine: () => c.determine({ ...b, ...stamped }),
    determination: () => c.determinationRead({ id: qp("id") ?? b.id, viewer: qp("viewer") }),
    determinations: () => c.determinationsFor({ project: qp("project"), act: qp("act"), standard: qp("standard"),
                                                finding: qp("finding"), outcome: qp("outcome"), live: qp("live"),
                                                after: qp("after"), limit: qp("limit"), viewer: qp("viewer") }),
    comparisonpropose: () => c.comparisonPropose({ ...b, proposer: qp("author"), viewer: qp("viewer") }),
    comparison: () => c.comparisonRead({ id: qp("id") ?? b.id, viewer: qp("viewer") }),
  };
}
