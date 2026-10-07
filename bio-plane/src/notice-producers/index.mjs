/* notice-producers — the feed's newer producers (requirements: `build/requirements/notice-producers.md`, R1–R13).
 * A new seam after `queue-producers` with no copy (plan T33-82; Choices 8 and 23): each producer derives, on read and
 * writing nothing, the items one provider's facts earn for a viewer, naming each item's subjects and homes for `queue`
 * to home, offer, mint and publish, exactly as `queue-producers` does for the rest.
 *
 *   noticeItems    queue's one read of this module (R1): every item R2–R6, R12, R13 derive for a member and viewer, each homed
 *                  through queue's walk and carrying queue's options (both passed in), with `facts` stating each
 *                  producer's bound and `truncated`, and `failed`, the providers that threw.
 *
 *   R2  interest-check-noticed   FINDING, people.checkResults            the machine's, "Noticed", hypothesis layer; a hint (R11)
 *   R3  money-detector-noticed   FINDING, money-checks.noticed           the machine's, "Noticed", hypothesis layer; a hint (R11)
 *   R4  standing-answer          FINDING, answers.standingAnswersFor     the assistant's machine work, told once
 *   R5  temporal-expectation-due FINDING, duties.dutiesOf/occurrencesOf  a question, never a violation; keyed per state
 *   R6  inquiry-recheck-due      OBLIGATION (K1505 (15), K1522), inquiry.datedWaits, to the wait's setter alone
 *   R12 security-level-high      FINDING, credentials.securityLevel/securityMap  once per High episode, to administrators
 *   R13 policy-changed-noticed   FINDING, following.policyChanges        a policy's silent change, DEC-145 (5)'s words
 *
 * REACHED as `noticeProducersOf(host, deps)` (K1563 (1)): one instance per Durable Object storage. It registers nothing
 * and holds no check row: it refuses nothing. `deps` (each defaults to its module's instance on the same host, reached
 * lazily when first asked): membership, people, moneyChecks, duties, answers, inquiry, credentials, following, standards;
 * and `view`, the jurisdiction view whose time zone R13's date is read in (the profile's, when not given).
 *
 * R7 (queue's homes walk) and R12 (queue's options) stay in queue: `noticeItems` takes them as `homesOf(subjectIds)`
 * and `optionsOf(subjectIds)`, closed over the read's viewer and identity by queue, held for one synchronous read.
 */

import { normalizeType } from "../record-grammar/types.mjs";
import { STATES, vocabFor } from "../record-grammar/document.mjs";
import { MACHINE_AUTHOR_PREFIX, MACHINE_CLASS_PREFIX } from "../record-grammar/actors.mjs";
import { membershipOf, viewerPredicate } from "../membership/index.mjs";
import { overdueOn, dayRange, localDay } from "../civil-time/index.mjs";
import { combine as combineProfiles } from "../../../jurisdictions/index.mjs";
import { peopleOf } from "../people/index.mjs";
import { moneyChecksOf } from "../money-checks/index.mjs";
import { dutiesOf } from "../duties/index.mjs";
import { answersOf } from "../answers/index.mjs";
import { inquiryOf } from "../inquiry/index.mjs";
import { credentialsOf, SECURITY_THRESHOLD, SECURITY_DAYS } from "../credentials/index.mjs";
import { followingOf } from "../following/index.mjs";
import { standardsOf } from "../standards/index.mjs";

/* The walk queue passes in answers this shape; with none passed, an item is ungrouped rather than given a home. */
const UNGROUPED = Object.freeze({ state: "determined", ungrouped: true, reasons: [], depth_bound: null, ancestors: [] });

/** R2, R3: the label every machine-noticed item carries (the machine's, in the hypothesis layer). */
export const NOTICED_LABEL = "noticed";
/** R11 (DEC-131): the mark on every member-facing sentence of an R2 or R3 item; what the machine raised is a "hint",
 *  never a "signal". R4's, R5's and R6's items are not hints and never carry it. */
export const HINT_MARK = "Hint · machine work";
/** R9: the gate (K1504, M-C8): a check or detector is shown only at a measured false-alarm rate of at most 20%. */
export const GATE_RATE_MAX = 0.2;
/** R2, R3 (as queue-producers R4): the projects whose checks and detectors one read asks about, in id order. */
export const NOTICE_PROJECTS_MAX = 50;
/** R4: the pages of 200 standing answers one read follows (answers R20's page). */
export const STANDING_PAGES_MAX = 5;
/** R5: the adopted duties one read derives occurrences for. */
export const DUTIES_MAX = 500;
/** R8: the one act an R2 or R3 item offers beside its disposal (queue's own): take it up as the member's hunch or
 *  hypothesis (`hypotheses`, `op=hypothesishold`). Nothing else: never a citation, never a grade, never a finding. */
export const TAKE_UP = Object.freeze({ id: "hypothesishold", label: "Take this hint up as your own hunch or hypothesis", weight: "single" });
/** R6: the setter's own answer to a wait come round: record that they looked (`inquiry` R56, `op=waitlook`). */
export const WAIT_LOOK = Object.freeze({ id: "waitlook", label: "Record that you looked", weight: "single" });
/** R12: the levels `credentials.securityLevel` answers (its R45); anything else is no answer, never `Ordinary`. */
export const SECURITY_LEVELS = Object.freeze(["Ordinary", "Raised", "High"]);
/** R12: the hours one `securityMap` read covers, so it answers hour by hour (its R45: `hour` up to 48 hours). */
export const SECURITY_READ_HOURS = 48;
/** R13 (K1943, K1881): the window of changes read, by the later capture's age, and the changes one read follows. */
export const POLICY_CHANGE_DAYS = 90;
export const POLICY_CHANGES_MAX = 1000;
/** R13: `following.policyChanges`' page (its R21: at most 200). */
export const POLICY_CHANGES_PAGE = 200;
/** The kinds this module raises, with their class (queue R1's `classOfKind` gains them, T33-83; T35-67). */
export const NOTICE_KINDS = Object.freeze({
  "interest-check-noticed": "FINDING",
  "money-detector-noticed": "FINDING",
  "standing-answer": "FINDING",
  "temporal-expectation-due": "FINDING",
  "inquiry-recheck-due": "OBLIGATION",
  "security-level-high": "FINDING",
  "policy-changed-noticed": "FINDING",
});

const HOUR_MS = 3600e3, DAY_MS = 24 * HOUR_MS;
/* A provider's failure, named in `facts.failed` as the provider it came from (R1). */
const failure = (provider) => Object.assign(new Error(`${provider} did not answer`), { provider });

const filled = (v) => typeof v === "string" && v.trim() !== "";
const bare = (m) => { const t = typeof m === "string" ? m.trim() : ""; const x = /^member:(.+)$/.exec(t); return x ? x[1] : t || null; };
const isMachine = (m) => typeof m === "string" && (m.startsWith(MACHINE_AUTHOR_PREFIX) || m.startsWith(MACHINE_CLASS_PREFIX));
const instantOf = (ms) => new Date(ms).toISOString().replace(/\.\d{3}Z$/, "Z");
const dayOf = (v) => { const d = typeof v === "string" ? v.slice(0, 10) : ""; return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null; };
/* An item's age from an instant, or from a day: a day starts at its local midnight in `zone` (civil-time.dayRange),
   never the UTC midnight (K1444 (iii), K1688); with no zone held, a day's age is undetermined. */
const ageFrom = (since, now, reason, zone = null) => {
  const undetermined = (why, detail) => ({ state: "undetermined", reason: why, detail });
  if (!filled(since)) return undetermined(reason, "the provider states no instant this producer can read");
  let ms = NaN;
  if (/^\d{4}-\d{2}-\d{2}$/.test(since)) {
    if (!filled(zone)) return undetermined("no_zone", "no time zone is held for this day, so when it began is not read (never as the UTC day)");
    let r = null;
    try { r = dayRange(since, since, zone); } catch { r = null; }
    if (!r || !filled(r.start)) return undetermined("no_zone", `the day ${since} could not be read in the zone ${zone}`);
    ms = Date.parse(r.start);
  } else ms = Date.parse(since);
  return Number.isFinite(ms) ? { state: "determined", since, ms: Math.max(0, now - ms) }
    : undetermined(reason, "the provider states no instant this producer can read");
};

export class NoticeProducers {
  #host; #deps;
  #homesFn = null; #optionsFn = null;
  constructor({ host, storage, deps = {} } = {}) {
    this.#host = host;
    this.sql = storage.sql;
    this.#deps = { ...(deps || {}) };
  }

  /* ------------------------------------------------------------------ the providers (Uses), reached lazily */
  #dep(name, make) {
    if (!(name in this.#deps) || this.#deps[name] === undefined) this.#deps[name] = make();
    return this.#deps[name];
  }
  get #membership() { return this.#dep("membership", () => membershipOf(this.#host)); }
  get #people() { return this.#dep("people", () => peopleOf(this.#host)); }
  get #moneyChecks() { return this.#dep("moneyChecks", () => moneyChecksOf(this.#host)); }
  get #duties() { return this.#dep("duties", () => dutiesOf(this.#host)); }
  get #answers() { return this.#dep("answers", () => answersOf(this.#host)); }
  get #inquiry() { return this.#dep("inquiry", () => inquiryOf(this.#host)); }
  get #credentials() { return this.#dep("credentials", () => credentialsOf(this.#host)); }
  get #following() { return this.#dep("following", () => followingOf(this.#host)); }
  get #standards() { return this.#dep("standards", () => standardsOf(this.#host)); }

  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  #homesOf(ids) { return this.#homesFn ? this.#homesFn(ids || []) : { ...UNGROUPED }; }
  #optionsOf(ids) { return this.#optionsFn ? this.#optionsFn(ids || []) || [] : []; }

  /* ================================================================== R1 · noticeItems
   * queue's ONE read of this module. Each producer reads one provider; a provider that throws contributes no item and
   * is named in `facts.failed` (the read never throws). `facts` states each producer's bound and whether it cut. R13's
   * second provider (`standards`, the declarer) is named for itself when it is the one that fails. */
  noticeItems({ member = null, viewer = null, now = null, identity = null, homesOf = null, optionsOf = null } = {}) {
    void identity;        // queue's options are closed over it already (its R12); named here as R1 names it
    const me = isMachine(member) ? null : bare(member);
    const at = Number.isFinite(Number(now)) && now !== null && now !== "" ? Number(now) : Date.now();
    this.#homesFn = typeof homesOf === "function" ? homesOf : null;
    this.#optionsFn = typeof optionsOf === "function" ? optionsOf : null;
    const items = [], failed = [];
    const facts = {
      projects: { bound: NOTICE_PROJECTS_MAX, truncated: false },
      interest_check: { truncated: false },
      money_detector: { truncated: false },
      standing_answer: { bound: STANDING_PAGES_MAX * 200, truncated: false },
      temporal_expectation: { bound: DUTIES_MAX, truncated: false },
      inquiry_recheck: { truncated: false },
      security_level: { days: SECURITY_DAYS, truncated: false },
      policy_change: { bound: POLICY_CHANGES_MAX, days: POLICY_CHANGE_DAYS, truncated: false },
      failed,
    };
    const run = (provider, fn) => {
      try { const r = fn(); items.push(...r.items); Object.assign(facts[r.fact], r.facts || {}); }
      catch (e) { const named = e && typeof e.provider === "string" ? e.provider : provider; if (!failed.includes(named)) failed.push(named); }
    };
    try {
      if (!me) return { items, facts };
      let scope = { projects: [], truncated: false };
      try { scope = this.#projects(me, viewer); } catch { failed.push("membership"); }
      facts.projects.truncated = scope.truncated;
      run("people", () => ({ fact: "interest_check", ...this.#interestChecks(me, scope.projects, viewer, at) }));
      run("money-checks", () => ({ fact: "money_detector", ...this.#moneyDetectors(me, scope.projects, viewer, at) }));
      run("answers", () => ({ fact: "standing_answer", ...this.#standingAnswers(me, viewer, at) }));
      run("duties", () => ({ fact: "temporal_expectation", ...this.#dutiesDue(me, viewer, at) }));
      run("inquiry", () => ({ fact: "inquiry_recheck", ...this.#waitsDue(me, viewer, at) }));
      run("credentials", () => ({ fact: "security_level", ...this.#securityHigh(me, at) }));
      run("following", () => ({ fact: "policy_change", ...this.#policyChanges(me, viewer, at) }));
      return { items, facts };
    } catch {
      return { items: [], facts: { ...facts, failed: [...new Set([...failed, "notice-producers"])] } };
    } finally {
      this.#homesFn = null;
      this.#optionsFn = null;
    }
  }

  /* ------------------------------------------------------------------ R7: sight */
  /** The projects this viewer sees in which the member participates (joined or leaving; membership R74), in id order,
   *  at most NOTICE_PROJECTS_MAX; `truncated` when a further one qualifies. A project hidden from the viewer is never
   *  asked about, so nothing inside it is shown or counted (R7). */
  #projects(me, viewer) {
    const gate = viewerPredicate(viewer);
    if (gate.scope === "DENY") return { projects: [], truncated: false };
    const where = gate.scope === "member" ? "1=1" : gate.sql;
    const out = [];
    let truncated = false;
    for (const r of this.#rows(`SELECT b.bundle_id FROM bundles b WHERE b.object_type='project' AND (${where}) ORDER BY b.bundle_id`,
      ...(gate.scope === "member" ? [] : gate.args))) {
      const p = this.#membership.participation(r.bundle_id, me);
      if (!(p && (p.state === "joined" || p.state === "leaving"))) continue;
      if (out.length === NOTICE_PROJECTS_MAX) { truncated = true; break; }
      out.push(r.bundle_id);
    }
    return { projects: out, truncated };
  }

  /** A home set made of the named cases themselves (each at depth 0, when this viewer sees it and it is a case) and
   *  every ancestor queue's walk reaches above them (queue R7). */
  #homesAt(caseIds, viewer) {
    const ids = [...new Set((caseIds || []).filter(filled))];
    const up = this.#homesOf(ids);
    const gate = viewerPredicate(viewer);
    const own = [];
    for (const id of ids) {
      const row = gate.scope === "DENY" ? null : this.#rows(
        `SELECT b.bundle_id, b.object_type, b.current_state, b.title FROM bundles b WHERE b.bundle_id=?
           AND (${gate.scope === "member" ? "1=1" : gate.sql})`, id, ...(gate.scope === "member" ? [] : gate.args))[0];
      if (!row) continue;
      const ty = normalizeType(row.object_type);
      if (!["inquiry", "project"].includes(ty)) continue;
      const spec = vocabFor(STATES, row.object_type);
      const edges = spec && spec.edges ? spec.edges : null;
      const terminal = edges && Object.prototype.hasOwnProperty.call(edges, row.current_state)
        ? edges[row.current_state].length === 0 : null;
      own.push({ id: row.bundle_id, type: ty, title: row.title ?? null, state: row.current_state ?? null, terminal, depth: 0 });
    }
    const ancestors = [...own, ...(up.ancestors || []).filter((a) => !own.some((o) => o.id === a.id))]
      .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    return { ...up, ancestors, ungrouped: up.state === "determined" && ancestors.length === 0 };
  }

  /* ================================================================== R2 · interest checks (people R24, R25)
   * For each of the member's projects, the results `people.checkResults({project, viewer})` answers: only a version
   * whose gate is recorded open and that is switched on for that project, and only a result whose every input this
   * viewer may see (people withholds the rest whole, uncounted). A check with no project of its own runs in each
   * project that has not switched it off. One item per result, homed under every such project of the member's. */
  #interestChecks(me, projects, viewer, now) {
    const byKey = new Map();
    let truncated = false;
    let conditions = null;
    const conditionOf = (check, version) => {
      if (conditions === null) {
        conditions = new Map();
        const l = typeof this.#people.listChecks === "function" ? this.#people.listChecks({ viewer }) : null;
        for (const c of (l && Array.isArray(l.checks) ? l.checks : [])) conditions.set(`${c.check}@${c.version}`, c.condition ?? null);
      }
      return conditions.get(`${check}@${version}`) ?? null;
    };
    for (const project of projects) {
      const r = this.#people.checkResults({ project, viewer });
      if (!r || r.ok === false || !Array.isArray(r.checks)) continue;
      for (const c of r.checks) {
        /* R9: a closed gate raises no item and counts none; only an answer saying the gate is open is read */
        if (!c || c.gated !== false || !Array.isArray(c.results)) continue;
        if (c.truncated === true) truncated = true;
        for (const x of c.results) {
          if (!x || !filled(x.result_id)) continue;
          const id = `FINDING::interest-check-noticed::${c.check}::${x.result_id}`;
          const seen = byKey.get(id);
          if (seen) { seen.projects.push(project); continue; }
          byKey.set(id, { projects: [project], c, x });
        }
      }
    }
    const items = [];
    for (const [id, { projects: ps, c, x }] of byKey) {
      const den = x.denominator && typeof x.denominator === "object" ? x.denominator : { label: c.denominator ?? null, counted: null };
      const condition = conditionOf(c.check, c.version);
      items.push({
        id, class: "FINDING", kind: "interest-check-noticed",
        label: NOTICED_LABEL, layer: "hypothesis", by: "the machine's", mark: HINT_MARK,
        case: this.#homesAt(ps, viewer),
        subject: { kind: "interest_check_result", id: x.result_id, check: c.check, version: c.version, name: c.name ?? x.name ?? null },
        summary: `${HINT_MARK}: a pattern the check "${c.name ?? c.check}" finds in held facts`,
        detail: `${HINT_MARK}. A check noticed this hint, the machine's work, in the hypothesis layer. The check's condition is data: `
              + `${condition ? JSON.stringify(condition) : "as its definition states"}. It is counted against `
              + `${den.label || "its stated set"}${Number.isFinite(den.counted) ? ` (${den.counted} counted on the last full pass)` : ""}, `
              + "and its derivation cites every row it rests on. This hint is a pattern worth a look: never a finding, never "
              + "a basis for a claim, and it says nothing about anyone. Dispose of it, or take it up as your own hunch or hypothesis.",
        basis: { source: "people.checkResults", check: c.check, version: c.version, result: x.result_id, condition,
                 denominator: den, derivation: x.derivation ?? null, gate: "open", projects: ps,
                 detail: "an interest check's result is people's (its R23–R25): shown only once its version's gate is "
                       + "recorded open, switched on for the project, and to a viewer who may see every input." },
        age: ageFrom(x.at, now, "no_result_instant"),
        assignee: null, assignee_role: null,
        recipients: [me],
        options: [TAKE_UP],
      });
    }
    return { items, facts: { truncated } };
  }

  /* ================================================================== R3 · money detectors (money-checks R9, R10)
   * For each of the member's projects, the results `money-checks.noticed({project, viewer})` answers: only versions
   * gated at or under 20% and switched on for it, whose every input this viewer may see. R9 here is a second guard:
   * a result whose gate is not stated at or under the bound is never raised. */
  #moneyDetectors(me, projects, viewer, now) {
    const byKey = new Map();
    let truncated = false;
    for (const project of projects) {
      const r = this.#moneyChecks.noticed({ project, viewer, limit: 500 });
      if (!r || r.ok === false || !Array.isArray(r.items)) continue;
      if (r.truncated === true) truncated = true;
      for (const x of r.items) {
        if (!x || !filled(x.result_id) || !filled(x.detector_id)) continue;
        const rate = x.gate ? Number(x.gate.false_alarm_rate) : NaN;
        if (!(Number.isFinite(rate) && rate <= GATE_RATE_MAX)) continue;
        const id = `FINDING::money-detector-noticed::${x.detector_id}::${x.result_id}`;
        const seen = byKey.get(id);
        if (seen) { seen.projects.push(project); continue; }
        byKey.set(id, { projects: [project], x });
      }
    }
    const items = [];
    const figure = (f) => (f && typeof f === "object" ? f.value ?? null : f ?? null);
    for (const [id, { projects: ps, x }] of byKey) {
      items.push({
        id, class: "FINDING", kind: "money-detector-noticed",
        label: NOTICED_LABEL, layer: "hypothesis", by: "the machine's", mark: HINT_MARK,
        case: this.#homesAt(ps, viewer),
        subject: { kind: "money_detector_result", id: x.result_id, detector: x.detector_id, version: x.version,
                   about: x.subject ?? null },
        summary: `${HINT_MARK}: a pattern the detector "${x.detector_label ?? x.detector_id}" finds in held money facts`,
        detail: `${HINT_MARK}. A detector noticed this hint, the machine's work, in the hypothesis layer: ${figure(x.numerator) ?? "a part"} of `
              + `${figure(x.denominator) ?? "its stated population"}, by the derivation it cites over each input. This hint is a `
              + "pattern worth a look: never a finding, never a basis for a claim, and it says nothing about anyone. "
              + "Dispose of it, or take it up as your own hunch or hypothesis.",
        basis: { source: "money-checks.noticed", detector: x.detector_id, version: x.version, result: x.result_id,
                 numerator: x.numerator ?? null, denominator: x.denominator ?? null, derivation: x.derivation ?? null,
                 inputs: Array.isArray(x.inputs) ? x.inputs : [], gate: x.gate, projects: ps,
                 detail: "a detector's result is money-checks' (its R6–R10): shown only for a version gated at or under "
                       + "20% and switched on for the project, to a viewer who may see every input." },
        age: ageFrom(x.at, now, "no_result_instant"),
        assignee: null, assignee_role: null,
        recipients: [me],
        options: [TAKE_UP],
      });
    }
    return { items, facts: { truncated } };
  }

  /* ================================================================== R4 · standing answers (answers R20)
   * Each run of the member's own standing questions that found something new, one item per run, to its author alone
   * (answers answers nothing of another member's). Told once: raised per run, never repeated. */
  #standingAnswers(me, viewer, now) {
    void viewer;
    const entries = [];
    let after = null, truncated = false;
    for (let page = 0; ; page += 1) {
      if (page === STANDING_PAGES_MAX) { truncated = true; break; }
      const r = this.#answers.standingAnswersFor({ member: `member:${me}`, after });
      if (!r || r.ok === false || !Array.isArray(r.entries)) break;
      entries.push(...r.entries);
      if (r.cursor === null || r.cursor === undefined) break;
      after = r.cursor;
    }
    const items = [];
    for (const e of entries) {
      const q = e && e.question && filled(e.question.id) ? e.question : null;
      if (!q || e.run === undefined || e.run === null) continue;
      const finds = e.finds ?? null;
      const answered = e.answer !== null && e.answer !== undefined;
      const sentences = answered && Array.isArray(e.answer.sentences)
        ? e.answer.sentences.filter((s) => s && filled(s.text)).map((s) => s.text) : [];
      const n = finds && Array.isArray(finds.ids) ? finds.ids.length : null;
      items.push({
        id: `FINDING::standing-answer::${q.id}::${e.run}`, class: "FINDING", kind: "standing-answer",
        label: e.label ?? "machine work, from your standing question", by: "the assistant's",
        case: this.#homesOf([]),
        subject: { kind: "standing_question", id: q.id, question: q.question ?? null, run: e.run },
        summary: `Your standing question found something new: ${q.question ?? q.id}`,
        detail: `Machine work, from your standing question. ${n === null ? "New finds are held" : `${n} new ${n === 1 ? "find" : "finds"}`}`
              + (answered ? (sentences.length ? `; the assistant's answer: ${sentences.join(" ")}` : "; the assistant's answer is held with it")
                : `; the assistant did not answer, because ${NoticeProducers.heldBackWords(e.held_back)}`)
              + ". This is told once.",
        basis: { source: "answers.standingAnswersFor", question: q.id, run: e.run, finds, answer: e.answer ?? null,
                 held_back: e.held_back ?? null, withheld: Array.isArray(e.withheld) ? e.withheld : [],
                 detail: "a standing question's run is answers' (its R17–R20), seen only by its author; one entry per "
                       + "run that found something new, so each new find is told once (DEC-94)." },
        age: ageFrom(e.at, now, "no_run_instant"),
        assignee: null, assignee_role: null,
        recipients: [me],
        options: [],
      });
    }
    return { items, facts: { truncated } };
  }

  /** R4: what held the AI half back (answers R19), in plain words: the switch, the account or the ceiling's refusal.
   *  The group's Civicsmith is "your group's Civicsmith" to the member (DEC-149, T34-87). */
  static heldBackWords(h) {
    if (!h || typeof h !== "object") return "it was held back";
    if (h.condition === "switch_off") return h.switch === "member" ? "your own switch for standing questions is off"
      : "the assistant's half of standing questions is switched off in your group's Civicsmith";
    if (h.condition === "no_account") return "you have no account of your own set for the assistant";
    if (h.condition === "ceiling") return filled(h.translation) ? h.translation.replace(/\.$/, "") : "your own use limit is reached";
    if (h.condition === "not_deployed") return "the assistant is not available in your group's Civicsmith";
    return filled(h.translation) ? h.translation.replace(/\.$/, "") : "it was held back";
  }

  /* ================================================================== R5 · duty occurrences come due (duties R7–R11)
   * The adopted duties `duties.dutiesOf` answers the viewer, by obligor (the obligors from duties' read contract, its
   * R20); for each whose recipient is this member, `occurrencesOf` as of the read's instant. An occurrence `overdue`
   * (only after the latest candidate) or possibly overdue (between the candidates, civil-time R19) is one item, a
   * question and never a violation. The group's own checkpoint is never one (D234; action-plans R23). */
  #dutiesDue(me, viewer, now) {
    const asOf = instantOf(now);
    const obligors = this.#rows(`SELECT DISTINCT obligor FROM duties WHERE obligor IS NOT NULL ORDER BY obligor`).map((r) => r.obligor);
    const items = [];
    let count = 0, truncated = false;
    for (const entity of obligors) {
      if (truncated) break;
      const r = this.#duties.dutiesOf({ entity, as: "obligor", viewer, limit: DUTIES_MAX });
      if (!r || r.ok === false || !Array.isArray(r.duties)) continue;
      if (r.truncated === true) truncated = true;
      for (const d of r.duties) {
        if (!d || !filled(d.duty_id)) continue;
        if (count === DUTIES_MAX) { truncated = true; break; }
        count += 1;
        const to = this.#recipients(d.adoption && d.adoption.by, d.project);
        if (!to.members.includes(me)) continue;
        const o = this.#duties.occurrencesOf({ dutyId: d.duty_id, asOf, viewer });
        if (!o || o.ok === false || !Array.isArray(o.occurrences)) continue;
        for (const occ of o.occurrences) {
          const it = this.#occurrenceItem(d, occ, to, asOf, viewer, now);
          if (it) items.push(it);
        }
      }
    }
    return { items, facts: { truncated } };
  }

  /** Who a duty's item goes to: the member who adopted it, else its project's owners (membership R65), else the
   *  administrators (membership R86); with the rule that chose them. */
  #recipients(author, project) {
    const who = bare(author);
    if (who && !isMachine(author)) return { rule: "adopter", members: [who] };
    const owners = filled(project) ? (this.#membership.projectOwners(project) || []).map(bare) : [];
    if (owners.length) return { rule: "project_owners", members: owners };
    return { rule: "administrators", members: (this.#membership.activeAdmins() || []).map(bare) };
  }

  #occurrenceItem(d, occ, to, asOf, viewer, now) {
    if (!occ || !filled(occ.key)) return null;
    if (occ.trigger && occ.trigger.group_checkpoint === true) return null;
    const due = occ.due && !occ.due.undetermined ? occ.due.date : null;
    let state = null;
    if (occ.state === "overdue") state = "overdue";
    else if (occ.state === "undetermined" && due && Array.isArray(due.candidates) && !(occ.evidence || []).length) {
      const o = overdueOn({ due, at: asOf, side: "body" });
      if (o && o.code === "POSSIBLY_OVERDUE") state = "possibly overdue";
    }
    if (!state) return null;
    /* a body's due is the latest candidate (civil-time R17); its value is the local day in its own zone */
    const body = due && Array.isArray(due.candidates) ? due.candidates[due.candidates.length - 1] : due;
    const first = due && Array.isArray(due.candidates) ? due.candidates[0] : due;
    const dueDay = body && typeof body === "object" ? dayOf(body.value) : dayOf(body);
    const words = due && Array.isArray(due.candidates) ? `between ${due.candidates.map((c) => c.value).join(" and ")}` : `by ${dueDay ?? "its due date"}`;
    const act = d.performance && d.performance.act ? d.performance.act : "what it names";
    const sinceDay = state === "overdue" ? dueDay : first && typeof first === "object" ? dayOf(first.value) : null;
    const sinceZone = state === "overdue" ? (body && typeof body === "object" ? body.zone : null) : (first && typeof first === "object" ? first.zone : null);
    return {
      /* K1676: the key carries the occurrence's state as duties answers it, so possibly overdue becoming overdue is new */
      id: `FINDING::temporal-expectation-due::${d.duty_id}::${occ.key}::${state === "overdue" ? "overdue" : "undetermined"}`,
      class: "FINDING", kind: "temporal-expectation-due",
      label: NOTICED_LABEL, by: "the machine's",
      case: this.#homesAt(filled(d.project) ? [d.project] : [], viewer),
      due: dueDay,
      subject: { kind: "duty", id: d.duty_id, occurrence: occ.key, due: due ?? null,
                 basis_kind: occ.due && occ.due.basis_kind ? occ.due.basis_kind : (d.time && d.time.basis) || null,
                 derivation: occ.derivation ?? null, state },
      summary: state === "overdue"
        ? `A question: was "${act}" done ${words}? No matching event is held`
        : `A question: "${act}" is possibly overdue; its due date is uncertain`,
      detail: state === "overdue"
        ? (occ.question || `the record holds no matching event ${words}, as known on ${asOf.slice(0, 10)}. This is a question, not a finding.`)
        : `${occ.why}. This is a question, not a finding.`,
      basis: { source: "duties.occurrencesOf", duty: d.duty_id, occurrence: occ.key, state: occ.state, why: occ.why ?? null,
               trigger: occ.trigger ?? null, due: occ.due ?? null, derivation: occ.derivation ?? null, as_of: asOf,
               recipients_rule: to.rule,
               detail: "an occurrence's state is duties' (its R9–R11), derived on read as of this read's instant; a "
                     + "body is overdue only after the latest candidate due date, possibly overdue between (K1444 (i))." },
      age: ageFrom(sinceDay, now, "no_due_day", sinceZone),
      assignee: null, assignee_role: null,
      recipients: to.members,
      options: this.#optionsOf([d.duty_id]),
    };
  }

  /* ================================================================== R6 · dated waits come round (inquiry R55)
   * The waits this member set on inquiries the viewer may see, due on the local day (inquiry reads it in the profile's
   * zone). One to-do per (inquiry, date), to the setter alone, naming what is awaited, from whom and by when (DEC-98). */
  #waitsDue(me, viewer, now) {
    const r = this.#inquiry.datedWaits({ member: `member:${me}`, asOf: instantOf(now), viewer });
    if (!r || r.ok === false || !Array.isArray(r.waits)) return { items: [], facts: {} };
    const byKey = new Map();
    for (const w of r.waits) {
      if (!w || w.state !== "due" || !filled(w.inquiry) || !dayOf(w.date) || bare(w.set_by) !== me) continue;
      const id = `OBLIGATION::inquiry-recheck-due::${w.inquiry}::${w.date}`;
      if (!byKey.has(id)) byKey.set(id, []);
      byKey.get(id).push(w);
    }
    const items = [];
    for (const [id, ws] of byKey) {
      const w = ws[0];
      const what = ws.map((x) => `${x.text}${filled(x.description) ? ` (${x.description})` : ""}`).join("; ");
      items.push({
        id, class: "OBLIGATION", kind: "inquiry-recheck-due",
        case: this.#homesAt([w.inquiry], viewer),
        due: w.date,
        subject: { kind: "inquiry", id: w.inquiry, date: w.date,
                   waits: ws.map((x) => ({ index: x.index, text: x.text, description: x.description ?? null, set_at: x.set_at ?? null })) },
        summary: `A to do: look again at ${w.inquiry}, awaiting ${what}, by ${w.date}`,
        detail: `You set this question to be looked at again on ${w.date}, awaiting ${what}. Record that you looked, set a `
              + "new date or remove the wait; it is told once.",
        basis: { source: "inquiry.datedWaits", inquiry: w.inquiry, date: w.date, set_by: w.set_by, zone: r.zone ?? null,
                 waits: ws.map((x) => x.index),
                 detail: "a dated wait is inquiry's (its R54–R57), due from the start of its local day; it goes to the "
                       + "member who set it and to nobody else, and leaves when they look, re-date or remove it, or the "
                       + "question concludes." },
        age: ageFrom(w.date, now, "no_wait_day", r.zone),        /* the local day in inquiry's zone (K1688) */
        assignee: null, assignee_role: null,
        recipients: [me],
        options: [WAIT_LOOK, ...this.#optionsOf([w.inquiry])],
      });
    }
    return { items, facts: {} };
  }
  /* ================================================================== R12 · the security level becomes High
   * (credentials R45; N703, K1874 (Q5), K1875, DEC-165 (7)). To an active administrator alone, while
   * `securityLevel` answers High: one item per episode, keyed by the episode's start. The episode is the unbroken run
   * of whole hours, reaching the call, at whose end the level was High by credentials' own rule (a `through` in the
   * 24 hours ending then, or that hour unusual at its threshold), read back hour by hour from `securityMap` under the
   * administrator's own `by`, at most the days of counts kept; the hour of the call counts as High, as the call says.
   * A level that does not answer one of the three is a failure, never read as Ordinary. Counts only, in its words. */
  #securityHigh(me, now) {
    let admins;
    try { admins = (this.#membership.activeAdmins() || []).map(bare); } catch { throw failure("membership"); }
    if (!admins.includes(me)) return { items: [], facts: {} };
    const lv = this.#credentials.securityLevel();
    if (!lv || typeof lv !== "object" || !SECURITY_LEVELS.includes(lv.level)) throw failure("credentials");
    if (lv.level !== "High") return { items: [], facts: {} };
    const { start, through, truncated } = this.#episode(me, now);
    const from = instantOf(start), to = instantOf(now);
    const got = through === 0 ? "nothing got through"
      : `${through} ${through === 1 ? "sign-in or recovery" : "sign-ins or recoveries"} got through under a paused role`;
    return { items: [{
      id: `FINDING::security-level-high::${from}`, class: "FINDING", kind: "security-level-high",
      label: NOTICED_LABEL, by: "the machine's",
      case: this.#homesOf([]),
      subject: { kind: "civicsmith", id: null, episode: from },
      summary: "The security level of your group's Civicsmith is High",
      detail: `The security level of your group's Civicsmith has been High since ${from}, and in that time ${got}.`,
      screen: { op: "securitymap", from, to },
      basis: { source: "credentials.securityLevel", level: lv.level, level_at: lv.levelAt ?? null, episode: { from, to },
               through, threshold: { ...SECURITY_THRESHOLD },
               detail: "the level is credentials' (its R45), over counts only (its R44); an episode is an unbroken run "
                     + "of hours at whose end the level was High, told once to each administrator, and a later one "
                     + "is told again." },
      age: ageFrom(from, now, "no_episode_start"),
      assignee: null, assignee_role: null,
      recipients: [me],
      options: this.#optionsOf([]),
    }], facts: { truncated } };
  }

  /** R12: the episode reaching `now`: its first hour's start, the `through` count since, and whether the read reached
   *  the days kept still High. `securityMap` refusing is a failure of the provider (R1). */
  #episode(by, now) {
    const cur = Math.floor(now / HOUR_MS);
    const floor = cur - SECURITY_DAYS * 24;
    const hours = new Map();
    let lo = cur + 1;
    const load = () => {
      const fromH = Math.max(floor, lo - SECURITY_READ_HOURS);
      if (fromH >= lo) return false;
      const to = lo === cur + 1 ? now : lo * HOUR_MS;
      const m = this.#credentials.securityMap({ from: instantOf(fromH * HOUR_MS), to: instantOf(to), by: `member:${by}` });
      if (!m || m.ok !== true || m.step !== "hour" || !Array.isArray(m.buckets)) throw failure("credentials");
      for (const b of m.buckets) {
        const h = Math.floor(Date.parse(b.start) / HOUR_MS);
        if (!Number.isFinite(h)) continue;
        hours.set(h, { through: Number(b.counts && b.counts.through) || 0, total: Number(b.counts && b.counts.total) || 0,
                       usual: Number(b.usual && b.usual.total) || 0 });
      }
      lo = fromH;
      return true;
    };
    const at = (h) => { while (h < lo) if (!load()) return null; return hours.get(h) ?? { through: 0, total: 0, usual: 0 }; };
    const unusual = (x) => x.total >= SECURITY_THRESHOLD.atLeast
      && x.total > (x.usual === 0 ? SECURITY_THRESHOLD.times : SECURITY_THRESHOLD.times * x.usual);
    /* credentials R45's rule at the end of hour h: a `through` in the 24 hours ending then, or the hour unusual */
    const highAt = (h) => {
      const x = at(h);
      if (!x) return null;
      if (unusual(x)) return true;
      for (let k = h; k > h - 24 && k >= floor; k--) { const y = at(k); if (y && y.through > 0) return true; }
      return false;
    };
    at(cur);
    let start = cur, truncated = false;
    for (let h = cur - 1; ; h--) {
      if (h < floor) { truncated = true; break; }
      const high = highAt(h);
      if (high === null) { truncated = true; break; }
      if (!high) break;
      start = h;
    }
    let through = 0;
    for (let h = start; h <= cur; h++) through += (hours.get(h) || { through: 0 }).through;
    return { start: start * HOUR_MS, through, truncated };
  }

  /* ================================================================== R13 · a policy's silent change
   * (following R21; N652, K1727, K1740, DEC-145 (5)). The changes `policyChanges` answers this viewer whose later
   * capture is no older than the window and whose `amendment_held` is false, following its cursor to at most the bound
   * of changes read (`facts` states it, and `truncated`). Each goes to the member who declared the policy in
   * `standards` while that member is active, else to the administrators, and only while the recipient sees it (the
   * read is the recipient's own). Its detail is DEC-145 (5)'s sentence, nothing more: never what the change means. */
  #policyChanges(me, viewer, now) {
    const since = now - POLICY_CHANGE_DAYS * DAY_MS;
    const changes = [];
    let after = null, read = 0, truncated = false;
    for (;;) {
      if (read >= POLICY_CHANGES_MAX) { truncated = true; break; }
      const r = this.#following.policyChanges({ after, limit: Math.min(POLICY_CHANGES_PAGE, POLICY_CHANGES_MAX - read), viewer });
      if (!r || r.ok === false || !Array.isArray(r.changes)) throw failure("following");
      read += r.changes.length;
      for (const c of r.changes) {
        const t = c && c.after ? Date.parse(c.after.at) : NaN;
        if (!Number.isFinite(t) || t < since || c.amendment_held !== false) continue;
        changes.push(c);
      }
      if (r.cursor === null || r.cursor === undefined || r.changes.length === 0) break;
      after = r.cursor;
    }
    if (!changes.length) return { items: [], facts: { truncated } };
    const recipientOf = new Map();
    let admins = null;
    const adminsNow = () => {
      if (admins === null) { try { admins = (this.#membership.activeAdmins() || []).map(bare); } catch { throw failure("membership"); } }
      return admins;
    };
    const zone = this.#zone();
    const items = [];
    for (const c of changes) {
      if (!filled(c.standard) || !c.before || !c.after || !filled(c.after.capture)) continue;
      if (!recipientOf.has(c.standard)) {
        let s;
        try { s = this.#standards.standardRead({ id: c.standard, viewer }); } catch { throw failure("standards"); }
        if (!s || s.ok === false) { recipientOf.set(c.standard, null); continue; }
        const declarer = isMachine(s.declared_by) ? null : bare(s.declared_by);
        let active = false;
        try { active = !!declarer && (this.#membership.memberFacts(declarer) || {}).status === "active"; }
        catch { throw failure("membership"); }
        recipientOf.set(c.standard, active ? { rule: "declarer", members: [declarer], cite: s.cite ?? null }
          : { rule: "administrators", members: adminsNow(), cite: s.cite ?? null });
      }
      const to = recipientOf.get(c.standard);
      if (!to || !to.members.includes(me)) continue;
      const date = NoticeProducers.#localDate(c.before.at, zone);
      items.push({
        id: `FINDING::policy-changed-noticed::${c.watch}::${c.after.capture}`, class: "FINDING", kind: "policy-changed-noticed",
        label: NOTICED_LABEL, by: "the machine's",
        case: this.#homesAt([c.standard], viewer),
        subject: { kind: "standard", id: c.standard, cite: to.cite, address: c.address ?? null, watch: c.watch,
                   before: { capture: c.before.capture, at: c.before.at }, after: { capture: c.after.capture, at: c.after.at } },
        summary: `The published copy of ${to.cite ?? c.standard} changed`,
        detail: `Changed without notice: the text differs from the copy captured on ${date}, and no amendment was announced`,
        basis: { source: "following.policyChanges", standard: c.standard, watch: c.watch, address: c.address ?? null,
                 before: c.before, after: c.after, amendment_held: false, recipients_rule: to.rule, zone,
                 detail: "a difference between two captures of a policy's published copy (following R21), never a "
                       + "finding of the record and never what the change means; it leaves when an amendment is held "
                       + "for it or its recipient disposes of it." },
        age: ageFrom(c.after.at, now, "no_capture_instant"),
        assignee: null, assignee_role: null,
        recipients: to.members,
        options: this.#optionsOf([c.standard]),
      });
    }
    return { items, facts: { truncated } };
  }

  /** R13: the profile's time zone (the jurisdiction view's), or null when none is held. */
  #zone() {
    try {
      let view = this.#deps.view;
      if (typeof view === "function") view = view();
      if (!view) {
        const row = this.#rows(`SELECT value FROM settings WHERE name='jurisdiction_profiles' ORDER BY rowid DESC LIMIT 1`)[0];
        const ids = row ? JSON.parse(row.value) : null;
        const c = Array.isArray(ids) && ids.length ? combineProfiles(ids) : null;
        view = c && c.ok ? c.view : null;
      }
      const z = view && view.time_zone && typeof view.time_zone.value === "string" ? view.time_zone.value : null;
      return z && typeof localDay("2026-01-01T00:00:00Z", z) === "string" ? z : null;
    } catch { return null; }
  }

  /** R13: the local day of an instant in `zone` (civil-time), as `following` reads it, the UTC day when none is held. */
  static #localDate(at, zone) {
    try { const d = localDay(at, zone || "UTC"); if (typeof d === "string") return d; } catch { /* below */ }
    return dayOf(at) ?? "an earlier date";
  }
}

const OF = new WeakMap();

/** The one producers instance for this host's storage (`host`, or the storage itself). It registers nothing. */
export function noticeProducersOf(host, deps = {}) {
  const storage = host && host.storage ? host.storage : host;
  let p = OF.get(storage);
  if (!p) {
    p = new NoticeProducers({ host, storage, deps });
    OF.set(storage, p);
  }
  return p;
}
