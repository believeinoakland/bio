/* notice-producers — the feed's newer producers (requirements: `build/requirements/notice-producers.md`, R1–R17).
 * A new seam after `queue-producers` with no copy (plan T33-82; Choices 8 and 23): each producer derives, on read and
 * writing nothing, the items one provider's facts earn for a viewer, naming each item's subjects and homes for `queue`
 * to home, offer, mint and publish, exactly as `queue-producers` does for the rest.
 *
 *   noticeItems    queue's one read of this module (R1): every item R2–R6, R12–R17 derive for a member and viewer, each homed
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
 *   R14 scan-found               FINDING, file-safety.scanFindings       a file held after a scan, to who may see it
 *   R15 security-tool-off        FINDING, file-safety.securityToolEvents a tool switched off, to administrators
 *   R16 explore-ask              FINDING ("Ask"), ai-use.exploreAsksPending     an account's daily Ask, to its owners
 *       ai-limit-reached         FINDING, ai-use.limitsReached                  a limit reached this period, to its owners
 *       project-account-suspended FINDING, credentials.projectAccountsSuspended a project's sign-in stopped serving
 *   R17 the investigation's items, each told once, keyed by its source's own key (N820; K2418, K2484):
 *       question-find            FINDING, question-explorer.findsFor   "Hint · machine work"; `ai.label.explored` to the owners
 *       step-later-found         FINDING, steps.laterFound
 *       step-date-due, step-reminder  OBLIGATION, steps.stepsDue     to the setter, to the member who asked
 *       step-cost-shared         FINDING, steps.costShares             to the sharing projects' owners
 *       step-cost-message        FINDING, steps.costMessages           to the owners it was relayed to
 *       milestone-overdue        FINDING, investigation.milestonesOverdue (and milestone-reminder, OBLIGATION)
 *       project-quiet            FINDING, investigation.quietPrompts
 *       review-comment-left-out  FINDING, review.reviewCommentsLeftOut
 *
 * REACHED as `noticeProducersOf(host, deps)` (K1563 (1)): one instance per Durable Object storage. It registers nothing
 * and holds no check row: it refuses nothing. `deps` (each defaults to its module's instance on the same host, reached
 * lazily when first asked): membership, people, moneyChecks, duties, answers, inquiry, credentials, following, standards,
 * fileSafety, provenance, aiUse (R16), steps, questionExplorer, investigation, review (R17);
 * and `view`, the jurisdiction view whose time zone R13's, R14's and R15's dates are read in (the profile's, when not given).
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
import { fileSafetyOf, findingKind } from "../file-safety/index.mjs";
import { provenanceOf } from "../provenance/index.mjs";
import { aiUseOf } from "../ai-use/index.mjs";
import { LIMIT_PERIOD_FILL, LIMIT_WHEN_FILL, MONTH_NAMES } from "../ai-use/checks.mjs";
import { stepsOf } from "../steps/index.mjs";
import { questionExplorerOf } from "../question-explorer/index.mjs";
import { investigationOf } from "../investigation/index.mjs";
import { reviewOf } from "../review/index.mjs";
import { NOTICE_WORDS, wordsOf } from "./words.mjs";

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
/** R14 (T37; N762, K2175): the window of `found` notes read, by the note's age (as R13's), and the notes one read follows.
 *  Each read starts again at the window's start (`file-safety` R15's `cursor` is null at its end), so a note older than
 *  the window is never read and never uses up the bound. */
export const SCAN_FINDINGS_DAYS = 90;
export const SCAN_FINDINGS_MAX = 1000;
/** R15: the security tools' events one read follows (`file-safety.securityToolEvents`, its R31). */
export const TOOL_EVENTS_MAX = 1000;
/** R14, R15: the page asked of `file-safety`'s lists (its R15, R31: at most 1,000 a page). */
export const FILE_SAFETY_PAGE = 200;
/** R15: the event `file-safety` lists when it switches a tool off (its R31: `PRIVATE_MODE_NOT_HONOURED`), and the one
 *  that turns it on again (its R29). */
export const TOOL_SWITCHED_OFF = "switched_off";
export const TOOL_TEST_PASSED = "test_passed";
/** The kinds this module raises, with their class (queue R1's `classOfKind` gains them, T33-83; T35-67). */
export const NOTICE_KINDS = Object.freeze({
  "interest-check-noticed": "FINDING",
  "money-detector-noticed": "FINDING",
  "standing-answer": "FINDING",
  "temporal-expectation-due": "FINDING",
  "inquiry-recheck-due": "OBLIGATION",
  "security-level-high": "FINDING",
  "policy-changed-noticed": "FINDING",
  "scan-found": "FINDING",
  "security-tool-off": "FINDING",
  /* R16 (queue R1, T40; K2376 (2), K2394) */
  "explore-ask": "FINDING",
  "ai-limit-reached": "FINDING",
  "project-account-suspended": "FINDING",
  /* R17 (queue R1, T41; K2418, K2484) */
  "question-find": "FINDING",
  "step-later-found": "FINDING",
  "step-date-due": "OBLIGATION",
  "step-reminder": "OBLIGATION",
  "milestone-overdue": "FINDING",
  "milestone-reminder": "OBLIGATION",
  "project-quiet": "FINDING",
  "step-cost-shared": "FINDING",
  "step-cost-message": "FINDING",
  "review-comment-left-out": "FINDING",
});
/** R16, R17: the items one read answers from each of their sources (as R13's and R14's bounds); `facts` states the
 *  bound and `truncated` when a source answers more. */
export const ACCOUNT_ITEMS_MAX = 200;
export const INVESTIGATION_ITEMS_MAX = 200;
/** R16 (J1): the fills of `ai.queue.limitreached` for a limit that is not one use's (`words.json` gives them no key). */
export const LIMIT_FOR_EACH_MEMBER = " for each member";
export const LIMIT_USES_OVERALL = "Uses counted in its overall limit";
export const LIMIT_USES_PER_MEMBER = "Each member's uses";
/** R16: the "Ask" item's label (an Ask, DEC-69's form), beside R16's two "Noticed" items' `noticed`. */
export const ASK_LABEL = "ask";
/** R16: the Ask's one act beside disposal: approve exploring on that account today (`ai-use` R9, `op=exploreapprove`). */
export const EXPLORE_APPROVE = Object.freeze({ id: "exploreapprove", label: NOTICE_WORDS["act.owed_exploreapprove.label.queue"], weight: "single" });

const HOUR_MS = 3600e3, DAY_MS = 24 * HOUR_MS;
/* A provider's failure, named in `facts.failed` as the provider it came from (R1). */
const failure = (provider) => Object.assign(new Error(`${provider} did not answer`), { provider });

const filled = (v) => typeof v === "string" && v.trim() !== "";
/* R16, R17: an item's key: `<CLASS>::<kind>::` and its source's own key, as given (a key already of that form is used whole). */
const keyed = (cls, kind, key) => (String(key).startsWith(`${cls}::${kind}::`) ? String(key) : `${cls}::${kind}::${key}`);
/* R16, R17: a source's list cut to its bound, and whether it was. */
const cut = (list, bound) => ({ list: list.slice(0, bound), truncated: list.length > bound });
const capital = (t) => (typeof t === "string" && t ? t[0].toUpperCase() + t.slice(1) : t);
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
  get #fileSafety() { return this.#dep("fileSafety", () => fileSafetyOf(this.#host)); }
  get #provenance() { return this.#dep("provenance", () => provenanceOf(this.#host)); }
  get #aiUse() { return this.#dep("aiUse", () => aiUseOf(this.#host)); }
  get #steps() { return this.#dep("steps", () => stepsOf(this.#host)); }
  get #questionExplorer() { return this.#dep("questionExplorer", () => questionExplorerOf(this.#host)); }
  get #investigation() { return this.#dep("investigation", () => investigationOf(this.#host)); }
  get #review() { return this.#dep("review", () => reviewOf(this.#host)); }

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
      scan_found: { bound: SCAN_FINDINGS_MAX, days: SCAN_FINDINGS_DAYS, truncated: false },
      security_tool_off: { bound: TOOL_EVENTS_MAX, truncated: false },
      explore_ask: { bound: ACCOUNT_ITEMS_MAX, truncated: false },
      ai_limit: { bound: ACCOUNT_ITEMS_MAX, truncated: false },
      signin_suspended: { bound: ACCOUNT_ITEMS_MAX, truncated: false },
      question_find: { bound: INVESTIGATION_ITEMS_MAX, truncated: false },
      step_later_found: { bound: INVESTIGATION_ITEMS_MAX, truncated: false },
      step_due: { bound: INVESTIGATION_ITEMS_MAX, truncated: false },
      step_cost_shared: { bound: INVESTIGATION_ITEMS_MAX, truncated: false },
      step_cost_message: { bound: INVESTIGATION_ITEMS_MAX, truncated: false },
      milestone: { bound: INVESTIGATION_ITEMS_MAX, truncated: false },
      project_quiet: { bound: INVESTIGATION_ITEMS_MAX, truncated: false },
      review_left_out: { bound: INVESTIGATION_ITEMS_MAX, truncated: false },
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
      run("file-safety", () => ({ fact: "scan_found", ...this.#scanFound(me, viewer, at) }));
      run("file-safety", () => ({ fact: "security_tool_off", ...this.#toolsOff(me, viewer, at) }));
      run("ai-use", () => ({ fact: "explore_ask", ...this.#exploreAsks(me, viewer, at) }));
      run("ai-use", () => ({ fact: "ai_limit", ...this.#limitsReached(me, viewer, at) }));
      run("credentials", () => ({ fact: "signin_suspended", ...this.#accountsSuspended(me, viewer, at) }));
      run("question-explorer", () => ({ fact: "question_find", ...this.#questionFinds(me, viewer, at) }));
      run("steps", () => ({ fact: "step_later_found", ...this.#laterFound(me, viewer, at) }));
      run("steps", () => ({ fact: "step_due", ...this.#stepsDue(me, viewer, at) }));
      run("steps", () => ({ fact: "step_cost_shared", ...this.#costShares(me, viewer, at) }));
      run("steps", () => ({ fact: "step_cost_message", ...this.#costMessages(me, viewer, at) }));
      run("investigation", () => ({ fact: "milestone", ...this.#milestones(me, viewer, at) }));
      run("investigation", () => ({ fact: "project_quiet", ...this.#quietPrompts(me, viewer, at) }));
      run("review", () => ({ fact: "review_left_out", ...this.#reviewLeftOut(me, viewer, at) }));
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

  /** R4: what held the AI half back (answers R19), in plain words: the switch, the account, or the paying account's
   *  limit (`ai-use`'s `AI_LIMIT_REACHED`, its words as answers carries them; the retired ceiling's codes are gone,
   *  run-rules R20). The group's Civicsmith is "your group's Civicsmith" to the member (DEC-149, T34-87). */
  static heldBackWords(h) {
    if (!h || typeof h !== "object") return "it was held back";
    if (h.condition === "switch_off") return h.switch === "member" ? "your own switch for standing questions is off"
      : "the assistant's half of standing questions is switched off in your group's Civicsmith";
    if (h.condition === "no_account") return "you have no account of your own set for the assistant";
    if (h.condition === "limit") return filled(h.translation) ? h.translation.replace(/\.$/, "")
      : "the limits of the account that would pay could not be checked";
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
   * capture is no older than the window, read through `since` (T36: never by filtering an unbounded read, so a change
   * older than the window is never read and never uses up the bound), whose `amendment_held` is false, following its
   * cursor to at most the bound of changes read (`facts` states it, and `truncated`). Each goes to the member who declared the policy in
   * `standards` while that member is active, else to the administrators, and only while the recipient sees it (the
   * read is the recipient's own). Its detail is DEC-145 (5)'s sentence, nothing more: never what the change means. */
  #policyChanges(me, viewer, now) {
    const since = now - POLICY_CHANGE_DAYS * DAY_MS;       /* an instant, in ms (following R21 reads it to the whole second at or after) */
    const changes = [];
    let after = null, read = 0, truncated = false;
    for (;;) {
      if (read >= POLICY_CHANGES_MAX) { truncated = true; break; }
      const r = this.#following.policyChanges({ since, after, limit: Math.min(POLICY_CHANGES_PAGE, POLICY_CHANGES_MAX - read), viewer });
      if (!r || r.ok === false || r.since_invalid === true || !Array.isArray(r.changes)) throw failure("following");
      read += r.changes.length;
      for (const c of r.changes) if (c && c.after && c.amendment_held === false) changes.push(c);
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

  /* ================================================================== R14 · a file held after a scan
   * (file-safety R15, R16–R18, R38; N707, N710, DEC-169 (4), K1892, K1913, K1929). The `found` notes
   * `scanFindings` answers this viewer (a capture the viewer may not see is left out by file-safety and never counted
   * here, R7), oldest first; one item per note, to this member while active. (T37; N762, N771, K2175) The read is the
   * window's: `since` the instant SCAN_FINDINGS_DAYS before the call, from the first page, following `cursor` while
   * `truncated`, to at most the bound, never from a cursor kept between reads (file-safety's is null at its end).
   * Its subject is the capture's home (provenance.homeOf); its detail names each finding with its engine, tool and day,
   * in findingKind's words, that the safe view stays open and how the original opens again. It names no member and is
   * no hint: a scanner's verdict, not the machine's noticing. It leaves when its recipient disposes of it (queue's, by
   * its key), or when `scanFindings` answers its note `held: false` (no open hold covers that finding any longer, read
   * in file-safety's same synchronous call): only a note inside the window is read, so only there can it leave on
   * `held`. A note past the window is not read, so its item is no longer answered: the window is the item's life (K2238,
   * as R13's window; queue keeps no item, only dispositions). */
  #scanFound(me, viewer, now) {
    if (!this.#active(me)) return { items: [], facts: {} };
    const since = now - SCAN_FINDINGS_DAYS * DAY_MS;       /* an instant, in ms (file-safety R15: notes at or after it) */
    const found = [];
    let after = null, read = 0, truncated = false;
    for (;;) {
      if (read >= SCAN_FINDINGS_MAX) { truncated = true; break; }
      const r = this.#fileSafety.scanFindings({ since, after, limit: Math.min(FILE_SAFETY_PAGE, SCAN_FINDINGS_MAX - read), viewer });
      if (!r || r.ok !== true || r.since_invalid === true || !Array.isArray(r.findings)) throw failure("file-safety");
      read += r.findings.length;
      found.push(...r.findings);
      if (r.truncated !== true || r.cursor === null || r.cursor === undefined || r.cursor === after) break;
      after = r.cursor;
    }
    const zone = this.#zone();
    const items = [];
    for (const f of found) {
      if (!f || !filled(f.captureSha) || !filled(f.note_id)) continue;
      if (f.held === false) continue;                       /* no open hold covers it any longer: it leaves (N771) */
      let home = null;
      try { const h = this.#provenance.homeOf(f.captureSha); home = h && filled(h.bundleId) ? h.bundleId : null; }
      catch { throw failure("provenance"); }
      const names = (Array.isArray(f.findings) ? f.findings : []).filter(filled);
      const day = NoticeProducers.#localDate(f.at, zone);
      const by = `${f.engine ? `${f.engine}, ` : ""}the tool ${f.tool ?? "not named"}`;
      const explained = names.map((n) => ({ name: n, ...findingKind(n) }));
      const said = explained.length
        ? explained.map((k) => `${k.name}: ${k.words.replace(/\.?$/, ".")}`).join(" ")
        : "The scanner named no finding.";
      items.push({
        id: `FINDING::scan-found::${f.captureSha}::${f.note_id}`, class: "FINDING", kind: "scan-found",
        by: "a scanner's",
        case: home ? this.#homesAt([home], viewer) : this.#homesOf([]),
        subject: { kind: "capture_home", id: home, capture: f.captureSha, note: f.note_id },
        summary: `A file you can see was held after a scan found ${names.length === 1 ? names[0] : names.length ? `${names.length} things` : "something"} in it`,
        detail: `This file is held: on ${day} ${by} found ${names.length ? names.join(", ") : "something"} in it. ${said} `
              + "Its safe view stays open. The original opens again only when two members each release the hold with a "
              + "reason, or when a second, different engine's clean check releases a hold the built-in scanner alone "
              + "placed; the machine never can.",
        basis: { source: "file-safety.scanFindings", capture: f.captureSha, note: f.note_id, tool: f.tool ?? null,
                 engine: f.engine ?? null, at: f.at ?? null, findings: explained, home, zone,
                 detail: "a scanner's `found` note (file-safety R15) places a scan hold (its R16): the original does not "
                       + "open, the safe view stays; two members' releases (its R17) or a second engine's clean check of a "
                       + "hold the built-in scanner alone placed (its R18) open it again." },
        age: ageFrom(f.at, now, "no_scan_instant"),
        assignee: null, assignee_role: null,
        recipients: [me],
        options: this.#optionsOf(home ? [home] : []),
      });
    }
    return { items, facts: { truncated } };
  }

  /* ================================================================== R15 · a security tool switched off
   * (file-safety R27, R29, R31; K1929). To an active administrator alone: the events `securityToolEvents` answers
   * under the administrator's own viewer, following its cursor to at most the bound; one item per event that switched
   * a tool off (`PRIVATE_MODE_NOT_HONOURED`), until the tool is on again (a passed test since, or `securityTools`
   * answering it `on`). It names the tool, never a file or a member. */
  #toolsOff(me, viewer, now) {
    let admins;
    try { admins = (this.#membership.activeAdmins() || []).map(bare); } catch { throw failure("membership"); }
    if (!admins.includes(me)) return { items: [], facts: {} };
    const events = [];
    let after = null, read = 0, truncated = false;
    for (;;) {
      if (read >= TOOL_EVENTS_MAX) { truncated = true; break; }
      const r = this.#fileSafety.securityToolEvents({ after, limit: Math.min(FILE_SAFETY_PAGE, TOOL_EVENTS_MAX - read), viewer });
      if (!r || r.ok !== true || !Array.isArray(r.events)) throw failure("file-safety");
      read += r.events.length;
      events.push(...r.events);
      if (r.truncated !== true || r.cursor === null || r.cursor === undefined || r.cursor === after) break;
      after = r.cursor;
    }
    const offs = events.map((e, i) => ({ e, i })).filter(({ e }) => e && e.event === TOOL_SWITCHED_OFF && filled(e.tool_id) && filled(e.at));
    if (!offs.length) return { items: [], facts: { truncated } };
    const t = this.#fileSafety.securityTools({ viewer });
    if (!t || t.ok !== true || !Array.isArray(t.tools)) throw failure("file-safety");
    const tools = new Map(t.tools.filter((x) => x && filled(x.tool_id)).map((x) => [x.tool_id, x]));
    const zone = this.#zone();
    const items = [];
    for (const { e, i } of offs) {
      const tool = tools.get(e.tool_id);
      if (tool && tool.state === "on") continue;
      if (events.slice(i + 1).some((x) => x && x.tool_id === e.tool_id && x.event === TOOL_TEST_PASSED)) continue;
      const name = tool && filled(tool.provider_id) ? `${tool.provider_id} (${e.tool_id})` : e.tool_id;
      items.push({
        id: `FINDING::security-tool-off::${e.tool_id}::${e.at}`, class: "FINDING", kind: "security-tool-off",
        by: "the group's Civicsmith",
        case: this.#homesOf([]),
        subject: { kind: "civicsmith", id: null, tool: e.tool_id, provider: tool ? tool.provider_id ?? null : null },
        summary: `A security tool was switched off: ${name}`,
        detail: `The security tool ${name} was switched off on ${NoticeProducers.#localDate(e.at, zone)} because it did not `
              + "confirm the private mode its handling requires. It stays off until an administrator tests it again.",
        basis: { source: "file-safety.securityToolEvents", tool: e.tool_id, event: e.event, at: e.at,
                 off_reason: tool ? tool.off_reason ?? null : null, state: tool ? tool.state ?? null : null, zone,
                 detail: "a tool answering PRIVATE_MODE_NOT_HONOURED is switched off (file-safety R31) and is used again "
                       + "only once an administrator's test passes (its R29)." },
        age: ageFrom(e.at, now, "no_event_instant"),
        assignee: null, assignee_role: null,
        recipients: [me],
        options: this.#optionsOf([]),
      });
    }
    return { items, facts: { truncated } };
  }

  /* ================================================================== R16 · the AI accounts' items
   * (ai-use R5, R9; credentials R59; B7, K2353, K2376, K2488; DEC-188 (6), (7)). Each read is the viewer's own: ai-use
   * and credentials answer only the accounts and projects the viewer owns, so each item goes to this member alone. Each
   * is keyed by its source's own stable key, read as given and never composed here (K2488), so `queue` mints it once per
   * account, limit and period. Its words are `words.json`'s, by key (`words.mjs`), the placeholders filled here (J1): it
   * names whose account, which use and the period's end, and never a member. A read answering `unreadable` is its
   * provider's failure (R1), never read as no item. */
  #exploreAsks(me, viewer, now) {
    const r = this.#aiUse.exploreAsksPending({ viewer, at: instantOf(now) });
    if (!r || r.ok !== true || r.unreadable === true || !Array.isArray(r.asks)) throw failure("ai-use");
    const { list, truncated } = cut(r.asks.filter((a) => a && filled(a.key) && filled(a.owner)), ACCOUNT_ITEMS_MAX);
    const items = list.map((a) => {
      const o = this.#owner(a.owner, viewer);
      const what = Array.isArray(a.what) ? a.what.filter(filled).join("; ") : filled(a.what) ? a.what : "";
      const fills = { scope: o.scope, what, account: o.account };
      const text = wordsOf("ai.queue.exploreask", fills);
      return {
        id: keyed("FINDING", "explore-ask", a.key), class: "FINDING", kind: "explore-ask",
        label: ASK_LABEL, by: "the assistant's",
        case: o.project ? this.#homesAt([o.project], viewer) : this.#homesOf([]),
        subject: { kind: "ai_account", id: o.ref, day: a.day ?? null, questions: Array.isArray(a.what) ? [...a.what] : [] },
        summary: text, detail: text, word: "ai.queue.exploreask", fills,
        basis: { source: "ai-use.exploreAsksPending", key: a.key, owner: o.ref, day: a.day ?? null, asked_at: a.asked_at ?? null,
                 estimate: a.estimate ?? null,
                 detail: "an account's Ask is ai-use's (its R9): at most one a local day, answered to that account's owners; "
                       + "silence means no." },
        age: ageFrom(a.asked_at, now, "no_ask_instant"),
        assignee: null, assignee_role: null,
        recipients: [me],
        options: [EXPLORE_APPROVE, ...this.#optionsOf(o.project ? [o.project] : [])],
      };
    });
    return { items, facts: { truncated } };
  }

  #limitsReached(me, viewer, now) {
    const r = this.#aiUse.limitsReached({ viewer, at: instantOf(now) });
    if (!r || r.ok !== true || r.unreadable === true || !Array.isArray(r.reached)) throw failure("ai-use");
    const ok = r.reached.filter((e) => e && filled(e.key) && filled(e.owner) && filled(e.scope)
      && Object.prototype.hasOwnProperty.call(LIMIT_PERIOD_FILL, e.period));
    const { list, truncated } = cut(ok, ACCOUNT_ITEMS_MAX);
    const zone = this.#zone();
    const items = list.map((e) => {
      const o = this.#owner(e.owner, viewer);
      const use = NOTICE_WORDS[`ai.use.${e.scope}.name`] ?? null;
      const fills = {
        account: capital(o.account), period: LIMIT_PERIOD_FILL[e.period],
        for_use: e.scope === "overall" ? "" : e.scope === "per_member" ? LIMIT_FOR_EACH_MEMBER : use ? ` for ${use.toLowerCase()}` : "",
        date: NoticeProducers.#localDate(e.reached_at, zone),
        Uses: e.scope === "overall" ? LIMIT_USES_OVERALL : e.scope === "per_member" ? LIMIT_USES_PER_MEMBER : use ?? LIMIT_USES_OVERALL,
        when: NoticeProducers.#periodEnd(e.period, e.period_start),
      };
      const text = wordsOf("ai.queue.limitreached", fills);
      return {
        id: keyed("FINDING", "ai-limit-reached", e.key), class: "FINDING", kind: "ai-limit-reached",
        label: NOTICED_LABEL, by: "the group's Civicsmith",
        case: o.project ? this.#homesAt([o.project], viewer) : this.#homesOf([]),
        subject: { kind: "ai_account", id: o.ref, scope: e.scope, unit: e.unit ?? null, period: e.period, period_start: e.period_start ?? null },
        summary: text, detail: text, word: "ai.queue.limitreached", fills,
        basis: { source: "ai-use.limitsReached", key: e.key, owner: o.ref, scope: e.scope, unit: e.unit ?? null, period: e.period,
                 period_start: e.period_start ?? null, reached_at: e.reached_at ?? null, zone,
                 detail: "a limit first reached in its current period is ai-use's (its R5), answered to that account's "
                       + "owners; it is told once a period, and names no member." },
        age: ageFrom(e.reached_at, now, "no_reached_instant"),
        assignee: null, assignee_role: null,
        recipients: [me],
        options: this.#optionsOf(o.project ? [o.project] : []),
      };
    });
    return { items, facts: { truncated } };
  }

  #accountsSuspended(me, viewer, now) {
    const r = this.#credentials.projectAccountsSuspended({ viewer, at: instantOf(now) });
    if (!Array.isArray(r)) throw failure("credentials");
    const { list, truncated } = cut(r.filter((e) => e && filled(e.key) && filled(e.project)), ACCOUNT_ITEMS_MAX);
    const items = list.map((e) => {
      const fills = { project: this.#projectName(e.project, viewer) ?? e.project };
      const text = wordsOf("ai.queue.suspended", fills);
      return {
        id: keyed("FINDING", "project-account-suspended", e.key), class: "FINDING", kind: "project-account-suspended",
        label: NOTICED_LABEL, by: "the group's Civicsmith",
        case: this.#homesAt([e.project], viewer),
        subject: { kind: "project", id: e.project, since: e.since ?? null },
        summary: text, detail: text, word: "ai.queue.suspended", fills,
        basis: { source: "credentials.projectAccountsSuspended", key: e.key, project: e.project, since: e.since ?? null,
                 detail: "a project's sign-in account serves only while the project has one member (credentials R54, "
                       + "R59); answered to the project's owners, naming no member." },
        age: ageFrom(e.since, now, "no_suspension_instant"),
        assignee: null, assignee_role: null,
        recipients: [me],
        options: this.#optionsOf([e.project]),
      };
    });
    return { items, facts: { truncated } };
  }

  /** R16, R17: an AI account's owner as its words name it: `group`, `project:<id>` or `member:<id>` (ai-use's owners).
   *  `ref` names it in an item without naming a member (`own` for a member's own account). */
  #owner(owner, viewer) {
    const s = typeof owner === "string" ? owner.trim() : "";
    if (s === "group") return { ref: "group", project: null, scope: NOTICE_WORDS["ai.owner.group"],
                                account: `${NOTICE_WORDS["ai.whose.group"]} account`, label: NOTICE_WORDS["ai.owner.group"] };
    const p = /^project:(.+)$/.exec(s);
    if (p) {
      const name = this.#projectName(p[1], viewer) ?? p[1];
      return { ref: `project:${p[1]}`, project: p[1], scope: name, account: `${name}'s account`, label: name };
    }
    const m = /^member:(.+)$/.exec(s);
    let handle = null;
    if (m) { try { handle = (this.#membership.memberFacts(m[1]) || {}).handle ?? null; } catch { handle = null; } }
    return { ref: "own", project: null, scope: `${NOTICE_WORDS["ai.whose.own"]} questions`,
             account: `${NOTICE_WORDS["ai.whose.own"]} account`, label: handle ?? NOTICE_WORDS["ai.whose.own"] };
  }

  /** A project's name (its bundle's title) when this viewer sees it, else null. */
  #projectName(id, viewer) {
    if (!filled(id)) return null;
    const gate = viewerPredicate(viewer);
    if (gate.scope === "DENY") return null;
    const row = this.#rows(`SELECT b.title FROM bundles b WHERE b.bundle_id=? AND (${gate.scope === "member" ? "1=1" : gate.sql})`,
      id, ...(gate.scope === "member" ? [] : gate.args))[0];
    return row && filled(row.title) ? row.title : null;
  }

  /** R16: when a period's uses go on again: `tomorrow` for a day's, the first of the next month by name for a month's
   *  (ai-use's own fills, R13, so the two modules say it one way). */
  static #periodEnd(period, start) {
    if (period === "day") return LIMIT_WHEN_FILL.day;
    const m = typeof start === "string" ? Number(start.slice(5, 7)) : NaN;
    const name = Number.isInteger(m) && m >= 1 && m <= 12 ? MONTH_NAMES[m % 12] : null;
    return name ? LIMIT_WHEN_FILL.month.replace(/^on /, "").replace("{month}", name) : LIMIT_WHEN_FILL.unjudged;
  }

  /* ================================================================== R17 · the investigation's items
   * (N820; K2405, K2417, K2418, K2484, K2525). Each source answers this viewer its own items, each with a stable key,
   * told once (DEC-94): the item is keyed `<CLASS>::<kind>::<the source's key>`, the key as given (review's already has
   * that form and is used whole). A source that throws or refuses contributes no item and is named in `facts.failed`;
   * a source answering more than the bound is cut, `truncated` stated (as R13's). */
  #questionFinds(me, viewer, now) {
    const r = this.#questionExplorer.findsFor({ viewer, at: instantOf(now), limit: INVESTIGATION_ITEMS_MAX });
    if (!r || r.ok !== true || !Array.isArray(r.finds)) throw failure("question-explorer");
    const c = cut(r.finds.filter((f) => f && filled(f.key) && filled(f.question)), INVESTIGATION_ITEMS_MAX);
    const items = c.list.map((f) => {
      /* D64 (K2484): which account paid is answered only to its owners (question-explorer R5): only then the label
         names it, `{owner}` from ai-use R6's `enabled_by` */
      const owned = filled(f.enabled_by);
      const label = owned ? wordsOf("ai.label.explored", { owner: this.#owner(f.enabled_by, viewer).label }) : "machine";
      const says = filled(f.says) ? f.says : "The system found this while exploring the question.";
      return {
        id: keyed("FINDING", "question-find", f.key), class: "FINDING", kind: "question-find",
        label, ...(owned ? { word: "ai.label.explored" } : {}), mark: HINT_MARK, by: "the system's",
        case: this.#homesAt([f.question], viewer),
        subject: { kind: "explore_find", id: f.find ?? null, question: f.question, ref: f.ref ?? null, find_kind: f.kind ?? null },
        summary: `${HINT_MARK}: found while exploring ${f.question}`,
        detail: `${HINT_MARK}. ${says}`,
        basis: { source: "question-explorer.findsFor", key: f.key, find: f.find ?? null, question: f.question,
                 bearing: f.bearing ?? null, how: f.how ?? null, false_alarm_rate: f.false_alarm_rate ?? null,
                 gold_set: f.gold_set ?? null, ...(owned ? { enabled_by: f.enabled_by } : {}),
                 detail: "a find is the system's work (question-explorer R5), offered once to each of the question's "
                       + "recipients who may see it; it is not evidence until a member takes it in." },
        age: ageFrom(f.at, now, "no_find_instant"),
        assignee: null, assignee_role: null,
        recipients: [me],
        options: this.#optionsOf([f.question]),
      };
    });
    return { items, facts: { truncated: c.truncated || r.truncated === true } };
  }

  #laterFound(me, viewer, now) {
    const r = this.#steps.laterFound({ viewer, at: instantOf(now) });
    if (!r || r.ok !== true || !Array.isArray(r.found)) throw failure("steps");
    const c = cut(r.found.filter((e) => e && filled(e.key) && filled(e.step)), INVESTIGATION_ITEMS_MAX);
    const items = c.list.map((e) => {
      const qs = Array.isArray(e.questions) ? e.questions.filter(filled) : [];
      return this.#r17Item(me, viewer, now, "FINDING", "step-later-found", e.key, {
        homes: qs, at: e.at,
        subject: { kind: "step", id: e.step, look: e.look ?? null, observation: e.observation ?? null, questions: qs },
        summary: `Data a step looked for has arrived: ${e.step}`,
        detail: "Something a step looked for and did not find has since arrived. The earlier look stays as it was; you may "
              + "revise the step's outcome for its questions.",
        basis: { source: "steps.laterFound", key: e.key, step: e.step, look: e.look ?? null, observation: e.observation ?? null,
                 detail: "a later arrival is steps' (its R23): told once to each recipient of a referring question who may "
                       + "see the step and what arrived, and to the member who did the step; no outcome moves by itself." },
      });
    });
    return { items, facts: { truncated: c.truncated } };
  }

  #stepsDue(me, viewer, now) {
    const r = this.#steps.stepsDue({ viewer, at: instantOf(now) });
    if (!r || r.ok !== true || !Array.isArray(r.due)) throw failure("steps");
    const c = cut(r.due.filter((e) => e && filled(e.key) && filled(e.step) && (e.kind === "past_date" || e.kind === "reminder")), INVESTIGATION_ITEMS_MAX);
    const items = c.list.map((e) => {
      const reminder = e.kind === "reminder";
      return this.#r17Item(me, viewer, now, "OBLIGATION", reminder ? "step-reminder" : "step-date-due", e.key, {
        homes: [], due: dayOf(e.date), day: dayOf(e.date),
        subject: { kind: "step", id: e.step, work: e.work ?? null, date: e.date ?? null },
        summary: reminder ? `A reminder you asked for: ${e.work ?? e.step}` : `A step you set a date for is past it: ${e.work ?? e.step}`,
        detail: reminder ? `You asked to be reminded of this step on ${e.date}.`
          : `You set this step to be done by ${e.date}, and it is not yet ended. This is told once.`,
        basis: { source: "steps.stepsDue", key: e.key, step: e.step, kind: e.kind, date: e.date ?? null,
                 detail: "a step's date and a reminder are steps' (its R12): told once, to the member who set the date or "
                       + "asked for the reminder, and to nobody else." },
      });
    });
    return { items, facts: { truncated: c.truncated, ...(r.undetermined === true ? { undetermined: r.why ?? true } : {}) } };
  }

  #costShares(me, viewer, now) {
    const r = this.#steps.costShares({ viewer, at: instantOf(now) });
    if (!r || r.ok !== true || !Array.isArray(r.shares)) throw failure("steps");
    const c = cut(r.shares.filter((e) => e && filled(e.key) && filled(e.step)), INVESTIGATION_ITEMS_MAX);
    const items = c.list.map((e) => {
      const projects = Array.isArray(e.projects) ? e.projects.filter((p) => p && filled(p.id)) : [];
      const totals = e.totals && typeof e.totals === "object" ? e.totals : {};
      const money = Object.entries(totals).map(([cur, amt]) => `${amt} ${cur}`).join(", ");
      return this.#r17Item(me, viewer, now, "FINDING", "step-cost-shared", e.key, {
        homes: projects.map((p) => p.id),
        subject: { kind: "step", id: e.step, totals, projects: projects.map((p) => ({ id: p.id, name: p.name ?? null })) },
        summary: `A costed step is drawn on by ${projects.length} projects`,
        detail: `This step's costs (${money || "none stated"}) serve questions that ${projects.map((p) => p.name ?? p.id).join(", ")} `
              + "draw on. Civicsmith records no split and no payment; you may write to the other projects' owners.",
        basis: { source: "steps.costShares", key: e.key, step: e.step, totals, projects: projects.map((p) => p.id),
                 detail: "a shared cost is steps' (its R14): answered to each owner of each sharing project only, never "
                       + "when any of them is hidden; told once per step, totals and project set." },
      });
    });
    return { items, facts: { truncated: c.truncated } };
  }

  #costMessages(me, viewer, now) {
    const r = this.#steps.costMessages({ viewer });
    if (!r || r.ok !== true || !Array.isArray(r.messages)) throw failure("steps");
    const ok = r.messages.filter((m) => m && (Number.isSafeInteger(m.message) || filled(m.message)) && filled(m.step));
    const c = cut(ok, INVESTIGATION_ITEMS_MAX);
    const items = c.list.map((m) => this.#r17Item(me, viewer, now, "FINDING", "step-cost-message", String(m.message), {
      homes: [], at: m.at,
      subject: { kind: "step", id: m.step, message: m.message },
      summary: `A message about a shared cost from ${m.writer ?? "another project's owner"}`,
      detail: `${m.writer ?? "Another project's owner"} wrote about a cost your project shares: ${m.text ?? ""}`,
      basis: { source: "steps.costMessages", key: String(m.message), step: m.step, message: m.message,
               detail: "a cost message is steps' (its R15): relayed once to the owners of each other sharing project, with "
                     + "its writer's handle, naming no project unless its writer did." },
    }));
    return { items, facts: { truncated: c.truncated } };
  }

  #milestones(me, viewer, now) {
    const r = this.#investigation.milestonesOverdue({ viewer, at: instantOf(now) });
    if (!r || r.ok !== true || !Array.isArray(r.due)) throw failure("investigation");
    const c = cut(r.due.filter((e) => e && filled(e.key) && (e.kind === "overdue" || e.kind === "reminder")), INVESTIGATION_ITEMS_MAX);
    const items = c.list.map((e) => {
      const reminder = e.kind === "reminder";
      const name = e.name ?? `milestone ${e.milestone}`;
      return this.#r17Item(me, viewer, now, reminder ? "OBLIGATION" : "FINDING", reminder ? "milestone-reminder" : "milestone-overdue", e.key, {
        homes: filled(e.project) ? [e.project] : [], due: dayOf(e.date), day: dayOf(e.date),
        subject: { kind: "milestone", id: e.milestone ?? null, project: e.project ?? null, name: e.name ?? null, date: e.date ?? null },
        summary: reminder ? `A reminder you asked for: ${name}` : `A milestone has passed its date: ${name}`,
        detail: reminder ? `You asked to be reminded of the milestone "${name}" today; its date is ${e.date}.`
          : `The milestone "${name}" of a project you take part in was due on ${e.date}. This is told once.`,
        basis: { source: "investigation.milestonesOverdue", key: e.key, kind: e.kind, milestone: e.milestone ?? null,
                 project: e.project ?? null, date: e.date ?? null, state: e.state ?? null,
                 detail: "a milestone overdue is investigation's (its R3): told once to each joined participant; a reminder "
                       + "to the member who asked, on its day, and to nobody else." },
      });
    });
    return { items, facts: { truncated: c.truncated, ...(r.undetermined === true ? { undetermined: r.why ?? true } : {}) } };
  }

  #quietPrompts(me, viewer, now) {
    const r = this.#investigation.quietPrompts({ viewer, at: instantOf(now) });
    if (!r || r.ok !== true || !Array.isArray(r.prompts)) throw failure("investigation");
    const c = cut(r.prompts.filter((e) => e && filled(e.key) && filled(e.project)), INVESTIGATION_ITEMS_MAX);
    const items = c.list.map((e) => {
      const name = this.#projectName(e.project, viewer) ?? e.project;
      const gaps = Array.isArray(e.gaps) ? e.gaps : [];
      return this.#r17Item(me, viewer, now, "FINDING", "project-quiet", e.key, {
        homes: [e.project],
        subject: { kind: "project", id: e.project, spell: e.spell ?? null, objective: e.objective ?? null,
                   condition: e.condition ?? null, gaps, doors: Array.isArray(e.doors) ? [...e.doors] : [] },
        summary: `A project you take part in has gone quiet: ${name}`,
        detail: `${name} has gone quiet. Its objective: ${e.objective ?? "not stated"}; its condition: ${e.condition ?? "not stated"}; `
              + `the record still lacks ${gaps.length} ${gaps.length === 1 ? "thing" : "things"} it names. Write it up, keep `
              + "watching, close it with its gaps, or revise the objective.",
        basis: { source: "investigation.quietPrompts", key: e.key, project: e.project, spell: e.spell ?? null,
                 progress: e.progress ?? null,
                 detail: "a quiet spell is investigation's (its R18): told once per spell to the project's joined "
                       + "participants; no member act declares the objective met." },
      });
    });
    return { items, facts: { truncated: c.truncated } };
  }

  #reviewLeftOut(me, viewer, now) {
    const r = this.#review.reviewCommentsLeftOut({ viewer, limit: INVESTIGATION_ITEMS_MAX });
    if (!r || r.ok !== true || !Array.isArray(r.items)) throw failure("review");
    const c = cut(r.items.filter((e) => e && filled(e.key) && filled(e.case)), INVESTIGATION_ITEMS_MAX);
    const items = c.list.map((e) => this.#r17Item(me, viewer, now, "FINDING", "review-comment-left-out", e.key, {
      homes: filled(e.project) ? [e.project] : [],
      subject: { kind: "case", id: e.case, edition: e.edition ?? null, comments: Array.isArray(e.comments) ? [...e.comments] : [] },
      summary: `Your comments on a review copy were not included: ${e.case}, edition ${e.edition}`,
      detail: `${e.left_out ?? "Some"} of your comments on the review copy of ${e.case} were not included in its published `
            + "edition. You may file a response in its docket.",
      basis: { source: "review.reviewCommentsLeftOut", key: e.key, case: e.case, edition: e.edition ?? null, left_out: e.left_out ?? null,
               detail: "a reviewer's comments left out are review's (its R33): told once to each member reviewer, who may "
                     + "file a response in the case's docket." },
    }));
    return { items, facts: { truncated: c.truncated || r.truncated === true } };
  }

  /** R17: one item of `kind`, keyed by its source's key, to this member alone (each source answers the viewer's own). */
  #r17Item(me, viewer, now, cls, kind, key, { homes = [], due = null, day = null, at = null, subject, summary, detail, basis }) {
    return {
      id: keyed(cls, kind, key), class: cls, kind,
      case: homes.length ? this.#homesAt(homes, viewer) : this.#homesOf([]),
      ...(due ? { due } : {}),
      subject, summary, detail, basis,
      age: day ? ageFrom(day, now, "no_due_day", this.#zone()) : ageFrom(at, now, "no_source_instant"),
      assignee: null, assignee_role: null,
      recipients: [me],
      options: this.#optionsOf([subject.id].filter(filled)),
    };
  }

  /** R14: whether this member is active (membership's member facts); a membership that throws is its failure. */
  #active(me) {
    try { return (this.#membership.memberFacts(me) || {}).status === "active"; } catch { throw failure("membership"); }
  }

  /** R13, R14, R15: the profile's time zone (the jurisdiction view's), or null when none is held. */
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

  /** R13, R14, R15: the local day of an instant in `zone` (civil-time), as `following` reads it, the UTC day when none is held. */
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
