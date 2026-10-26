/* action-producers — the feed's Action-layer to-dos (requirements: `build/requirements/action-producers.md`, R1–R25).
 * Split from `queue-producers` by copy (K617, K624 (1), K2781 (1); as `machinery-producers` was, K1850): its R15–R21 and
 * R29 are this module's R1–R8, then amended by T45 (recipients by take-up and departure, one item per fact, words by
 * basis, the docket and pressure arms), and R9–R12 new (`member-left-items`, `watch-keep-or-stop`, the doors,
 * `plan-review-due` and `plan-look-again`); T46 added R21–R23 (the met-or-waived door, a duty no longer watched, the words
 * by key) and T47 R24 (the two kept details filled) and R25 (`request-unsent`, a request approved and left unsent).
 * Each producer derives, on read and writing nothing, the items an action's
 * clocks, reminders, holds, checkpoints, escalations, templates, local facts, watches and plan reviews earn for a viewer,
 * routed to the member who takes the thing up or set it, never assigned to anybody, naming each item's subjects and home
 * subjects for `queue-producers` to answer in `feedItems` (its R8) and for `queue` to home, offer, mint and publish.
 *
 *   actionItems   queue-producers' one read of this module (R13): every item R1–R12 and R25 derive for a member and viewer, each
 *                 homed through queue's walk and carrying queue's options (both passed in by queue-producers R8), each
 *                 kind's doors first (R11), with `facts` stating each producer's bound and `truncated`, and the
 *                 producers that threw (`failed`). No item carries `disposition` or `catalogue_id`.
 *
 * REACHED as `actionProducersOf(ctx, deps)`: one instance per Durable Object storage. It registers nothing, holds no
 * table and no check row, and refuses nothing a member does.
 * `deps` (each defaults to its module's instance on the same `ctx`, reached lazily when first asked):
 *   record, membership, actions, actionHolds, actionClocks, escalation, actionPlans, planWork, filingTemplates,
 *   localFacts, following, filings   the providers (Uses).
 *
 * `homesOf(subjectIds)` and `optionsOf(subjectIds)` (queue R7, R12) are held for the length of one synchronous
 * `actionItems` read; `#homesAt` (a case at depth 0) is built over `homesOf`. A door is a plain act `{id, label,
 * weight}`: `queue` decorates every option of every item through `affordances.decorate` (its R17).
 */

import { normalizeType } from "../record-grammar/types.mjs";
import { STATES, vocabFor } from "../record-grammar/document.mjs";
import { MACHINE_AUTHOR_PREFIX, MACHINE_CLASS_PREFIX } from "../record-grammar/actors.mjs";
import { recordOf, stampInstant } from "../record-core/index.mjs";
import { membershipOf, viewerPredicate } from "../membership/index.mjs";
import { actionsOf, zoneOf } from "../actions/index.mjs";
import { actionHoldsOf } from "../action-holds/index.mjs";
import { actionClocksOf } from "../action-clocks/index.mjs";
import { escalationOf } from "../escalation/index.mjs";
import { actionPlansOf } from "../action-plans/index.mjs";
import { planWorkOf } from "../plan-work/index.mjs";
import { filingTemplatesOf } from "../filing-templates/index.mjs";
import { localFactsOf } from "../local-facts/index.mjs";
import { followingOf } from "../following/index.mjs";
import { filingsOf } from "../filings/index.mjs";
import { localDay, dayRange, span, isCalendarDate } from "../civil-time/index.mjs";
import { dayWords, say } from "./words.mjs";
import { word, localize } from "../setup-words/index.mjs";

export { ACTION_KEYS, WORDS_CANON, KEPT } from "./words.mjs";

/* The walk queue passes in answers this shape; with none passed, an item is ungrouped rather than given a home. */
const UNGROUPED = Object.freeze({ state: "determined", ungrouped: true, reasons: [], depth_bound: null, ancestors: [] });
/* R9: the day before which `pendingClocks` lists every pending entry (action-clocks R1): every dated entry is before it. */
const PENDING_BEFORE = "9999-12-31";

/** K3000: a member as this module reads her, whichever form names her: the bare member id (`alice`, as queue passes
 *  `member`) or the control plane's stamp of an author (`member:alice`, as action-clocks keeps a reminder's `set_by` and
 *  an action's creator, and plan-work a take-up's `member`). Answers the bare id, or null for nothing, a machine
 *  (`token:`, `class:`) or a stamp naming no one. Every member this module compares, counts or names goes through it. */
const MEMBER_STAMP = "member:";
export function memberIdOf(x) {
  if (typeof x !== "string") return null;
  let m = x.trim();
  if (m.startsWith(MEMBER_STAMP)) m = m.slice(MEMBER_STAMP.length).trim();
  if (m === "" || m.startsWith(MACHINE_AUTHOR_PREFIX) || m.startsWith(MACHINE_CLASS_PREFIX)) return null;
  return m;
}
const person = (x) => memberIdOf(x) !== null;
/** The distinct members a list names, each by its bare id (K3000). */
const membersOf = (list) => [...new Set((Array.isArray(list) ? list : []).map(memberIdOf).filter((m) => m !== null))];

export class ActionProducers {
  #host; #deps;
  /* The read's two functions (R13), held for one synchronous `actionItems` call and cleared after it. */
  #homesFn = null; #optionsFn = null;
  /* R18, R20: the instance's zone, read once per `actionItems` call (undefined until asked) and cleared after it. */
  #zone = undefined;
  /* R1's rule: the read's memos (take-ups, members, sight, owners, administrators), cleared after each call. */
  #memo = null;
  constructor({ host, storage, deps = {} } = {}) {
    this.#host = host;
    this.sql = storage.sql;
    this.#deps = deps || {};
  }

  /* ------------------------------------------------------------------ the providers (Uses), reached lazily */
  #dep(name, make) {
    if (!(name in this.#deps) || this.#deps[name] === undefined) this.#deps[name] = make();
    return this.#deps[name];
  }
  get #record() { return this.#dep("record", () => recordOf(this.#host)); }
  get #membership() { return this.#dep("membership", () => membershipOf(this.#host)); }
  get #actions() { return this.#dep("actions", () => actionsOf(this.#host)); }
  /* T45 (K2781 (1)): the hold reads moved to action-holds (its R3, R8; were actions R54, R59). */
  get #actionHolds() { return this.#dep("actionHolds", () => actionHoldsOf(this.#host)); }
  get #actionClocks() { return this.#dep("actionClocks", () => actionClocksOf(this.#host)); }
  get #escalation() { return this.#dep("escalation", () => escalationOf(this.#host)); }
  get #actionPlans() { return this.#dep("actionPlans", () => actionPlansOf(this.#host)); }
  get #planWork() { return this.#dep("planWork", () => planWorkOf(this.#host)); }
  get #filingTemplates() { return this.#dep("filingTemplates", () => filingTemplatesOf(this.#host)); }
  get #localFacts() { return this.#dep("localFacts", () => localFactsOf(this.#host)); }
  get #following() { return this.#dep("following", () => followingOf(this.#host)); }
  /* T47 (R25; K3100): the approved filings not yet recorded sent (filings R53). */
  get #filings() { return this.#dep("filings", () => filingsOf(this.#host)); }

  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  #one(q, ...a) { const r = this.#rows(q, ...a); return r.length ? r[0] : null; }
  /** R26: an action as an item's sentence names it: its title, else the fallback "a request" (the request-unsent item's own), never its id. */
  #actionName(action) {
    const row = this.#one(`SELECT title FROM bundles WHERE bundle_id=?`, action);
    return row && typeof row.title === "string" && row.title.trim() ? row.title.trim() : "a request";
  }

  /* ------------------------------------------------------------------ the viewer gate (membership R43, R80; R14) */

  /** One id's sight, memoised per read: the id when the viewer sees it (membership R80), else null. A machine
   *  credential (`scope: member`) is not filtered; an absent or unrecognised viewer sees nothing. */
  #bundleRedactor(viewer) {
    const gate = viewerPredicate(viewer);
    if (gate.scope === "member") return (id) => id ?? null;
    if (gate.scope === "DENY") return (id) => (id ? null : id ?? null);
    const memo = new Map();
    return (id) => {
      if (!id) return id ?? null;
      if (!memo.has(id)) memo.set(id, this.#membership.inSight(id, viewer));
      return memo.get(id) ? id : null;
    };
  }

  /* queue's R7 walk and R12 options, as this read was handed them (R13). */
  #homesOf(subjectIds) { return this.#homesFn ? this.#homesFn(subjectIds || []) : { ...UNGROUPED }; }
  #optionsOf(subjectIds) { return this.#optionsFn ? this.#optionsFn(subjectIds || []) || [] : []; }

  /** A home set made of the named cases themselves (each at depth 0, when this viewer sees it and it is a case) and
   *  every ancestor above them (queue R7). `walkFrom` names the subjects the walk starts from when they are not the
   *  cases themselves: an action's item is homed under its project at depth 0 and under whatever its action's own walk
   *  reaches. */
  #homesAt(caseIds, viewer, walkFrom = caseIds) {
    const up = this.#homesOf(walkFrom);
    const gate = viewerPredicate(viewer);
    const own = [];
    for (const id of [...new Set((caseIds || []).filter((x) => typeof x === "string" && x))]) {
      const row = this.#one(
        `SELECT b.bundle_id, b.object_type, b.current_state, b.title FROM bundles b
          WHERE b.bundle_id=? AND (${gate.sql})`, id, ...gate.args);
      if (!row) continue;
      const ty = normalizeType(row.object_type);
      if (!ActionProducers.QUEUE_CASE_TYPES.includes(ty)) continue;
      const spec = vocabFor(STATES, row.object_type);
      const edges = spec && spec.edges ? spec.edges : null;
      const terminal = edges && Object.prototype.hasOwnProperty.call(edges, row.current_state)
        ? edges[row.current_state].length === 0 : null;
      own.push({ id: row.bundle_id, type: ty, title: row.title ?? null, state: row.current_state ?? null, terminal, depth: 0 });
    }
    const ancestors = [...own, ...up.ancestors.filter((a) => !own.some((o) => o.id === a.id))]
      .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    return { ...up, ancestors, ungrouped: up.state === "determined" && ancestors.length === 0 };
  }

  /** The homes of an item about an action: its project at depth 0 (as `#homesAt`), and whatever the walk reaches from
   *  the action itself (queue R7). */
  #actionHomes(action, project, viewer) {
    const cases = typeof project === "string" && project ? [project] : [];
    return this.#homesAt(cases, viewer, [action, ...cases]);
  }

  /** The homes of an item about a project's thing that is no bundle (a plan, a docket entry, a pressure record): the
   *  project, when this viewer sees it, at depth 0 and above it; else ungrouped. */
  #projectHomes(project, viewer) {
    return typeof project === "string" && project ? this.#homesAt([project], viewer) : this.#homesOf([]);
  }

  /* ------------------------------------------------------------------ R18, R20: the local day, through civil-time
     Every day this module derives or compares is a local day in the subject's zone (`civil-time` R1, R7, R24), never
     the UTC day; with no zone held, the day and the age are undetermined, stated, never counted on UTC (K1444 (iii)). */

  /** The zone `actions` R12 reads (`zoneOf` over `actions.place()`: the active profiles' combined view's `time_zone`),
   *  held for the length of one read; null when none is held, or when the runtime does not know it. R2's and R12's
   *  "instance profile's time_zone", and the zone of R7's facts. */
  #instanceZone() {
    if (this.#zone === undefined) {
      let z = null;
      try { const a = this.#actions; z = zoneOf(a && typeof a.place === "function" ? a.place() : null); } catch { z = null; }
      this.#zone = ActionProducers.#knownZone(z);
    }
    return this.#zone;
  }

  /** R1, R4: an action's zone: the one its provider names on the item (`zone`) when it names one, else the zone
   *  `actions` R12 reads. */
  #actionZone(e) { return ActionProducers.#knownZone(e && e.zone) || this.#instanceZone(); }

  static #knownZone(z) {
    if (typeof z !== "string" || !z.trim()) return null;
    try { return typeof localDay("2000-01-01T00:00:00Z", z.trim()) === "string" ? z.trim() : null; } catch { return null; }
  }

  /** The local day of a day or an instant in `zone`: a `YYYY-MM-DD` is already a local day and is answered as it is;
   *  an instant is read in the zone (civil-time R1). Null when neither, or when the instant needs a zone none holds. */
  static #localDayOf(v, zone) {
    const raw = typeof v === "string" ? v.trim() : "";
    if (isCalendarDate(raw)) return raw;
    if (!raw || !zone) return null;
    try { const d = localDay(raw, zone); return typeof d === "string" ? d : null; } catch { return null; }
  }

  /** The first instant of a local day (`edge` "start") or the first instant after it ("end") in `zone` (civil-time R7). */
  static #dayEdge(day, zone, edge) {
    if (!zone || !isCalendarDate(day)) return null;
    try { const r = dayRange(day, day, zone); return r && typeof r[edge] === "string" ? r[edge] : null; } catch { return null; }
  }

  /** The local day of the read's instant in `zone`. */
  static #today(now, zone) {
    if (!zone) return null;
    try { const d = localDay(stampInstant("second", now), zone); return typeof d === "string" ? d : null; } catch { return null; }
  }

  /** R20: the whole local days from `from` to `to` (civil-time R24's `span`), never fewer than none; null when unknown. */
  static #daysBetween(from, to, zone) {
    if (!zone || !isCalendarDate(from) || !isCalendarDate(to)) return null;
    if (to < from) return 0;
    try {
      const s = span({ value: from, precision: "day", zone }, { value: to, precision: "day", zone }, { unit: "days" });
      return s && Number.isFinite(s.min) ? Math.max(0, s.min) : null;
    } catch { return null; }
  }

  static ZONE_UNDETERMINED = "no time zone is held for it in your team's Civicsmith, so the local day it is counted from is "
    + "undetermined; it is never counted on the UTC day";

  /** R20: an item's `age` from a day or an instant, counted on local days in `zone`: a day ages from its first local
   *  instant, an instant from itself; `days` the whole local days since. With no zone held it is undetermined
   *  (`zone_undetermined`); with nothing readable, undetermined for `reason`. */
  static #localAge(v, zone, now, reason, detail) {
    const raw = typeof v === "string" ? v.trim() : "";
    const day = isCalendarDate(raw);
    const readable = day || (raw !== "" && Number.isFinite(Date.parse(raw)));
    if (!readable) return { state: "undetermined", reason, detail };
    if (!zone) return { state: "undetermined", reason: "zone_undetermined", detail: ActionProducers.ZONE_UNDETERMINED };
    const since = day ? ActionProducers.#dayEdge(raw, zone, "start") : raw;
    const from = ActionProducers.#localDayOf(raw, zone);
    const sinceMs = since ? Date.parse(since) : NaN;
    if (!Number.isFinite(sinceMs) || !from) return { state: "undetermined", reason, detail };
    return { state: "determined", since, ms: Math.max(0, now - sinceMs),
             days: ActionProducers.#daysBetween(from, ActionProducers.#today(now, zone), zone) };
  }

  /** An age from a fact's own instant (a trigger, a mark, a release, a request, a question come due): never this
   *  read's clock. */
  static #instantAge(at, now, reason, detail) {
    const ms = Date.parse(typeof at === "string" ? at : "");
    return Number.isFinite(ms) ? { state: "determined", since: at, ms: Math.max(0, now - ms) }
      : { state: "undetermined", reason, detail };
  }

  /** R18 (DEC-110 (1)): the day an item's subject is due, `YYYY-MM-DD`, for queue R49's sort: the local day in the
   *  subject's zone (civil-time R1), never the UTC day. A clock entry's date (R1, R4) is already a local day of the
   *  action's zone and is carried as it is; a checkpoint (R2) or a review (R12) stated as an instant is read in the
   *  instance profile's zone. Null when none can be read as a day, or when an instant meets no zone held. */
  static #dueDay(v, zone) { return ActionProducers.#localDayOf(v, zone); }

  /* ------------------------------------------------------------------ the bounds and the doors */
  /** Which object types can BE a case (queue's R7 vocabulary, through normalizeType): an inquiry or a project. */
  static QUEUE_CASE_TYPES = ["inquiry", "project"];
  /** How many pages of a provider's paged read (each at most 500 entries) one read follows. */
  static QUEUE_ACTION_PAGES = 20;
  /** R9: how many routed items one departure's item names (beyond it, the count of the rest the recipient may see). */
  static MEMBER_LEFT_ITEMS_MAX = 50;
  /** R9: how many actions' reminders (`remindersFor`, one read each) one read asks. */
  static MEMBER_LEFT_REMINDER_ACTIONS = 200;

  /** R11: the doors, each the act whose taking makes the item leave, or routes it (take-up, plan-work R11). Plain acts:
   *  `queue` decorates every option (its R17). */
  static CORRESPOND = Object.freeze({ id: "actioncorrespond", label: say("door.actioncorrespond"), weight: "single" });
  /** R21: the door stating an entry met or waived. No action-clocks op states it: it is a member's revision of the
   *  action's document (`op=promote`, actions' revision within its R1 and R33), changing only that entry's `status` to
   *  `met` or `waived`. Its label is `door.clockentrystate` (R23); `#entryStateDoor` keys it to the action and entry. */
  static ENTRY_STATE = Object.freeze({ id: "promote", label: say("door.clockentrystate"), weight: "single" });
  static TAKE_UP = Object.freeze({ id: "itemtakeup", label: say("door.itemtakeup"), weight: "single" });
  static CHECKPOINT_JUDGE = Object.freeze({ id: "checkpointrecord", label: say("door.checkpointrecord"), weight: "single" });
  static STAGE_ADVANCE = Object.freeze({ id: "escalationadvance", label: say("door.escalationadvance"), weight: "single" });
  static STAGE_DECLINE = Object.freeze({ id: "escalationdecline", label: say("door.escalationdecline"), weight: "single" });
  static REMINDER_ANSWER = Object.freeze({ id: "reminderanswer", label: say("door.reminderanswer"), weight: "single" });
  /** R5: a member's statement that a hold is in place (action-holds R2, `op=actionhold`), or its release, its own act
   *  (action-holds R5, `op=actionholdrelease`, which words.json does not hold: its label stays), DEC-113. */
  static HOLD_STATE = Object.freeze({ id: "actionhold", label: say("door.actionhold"), weight: "single" });
  static HOLD_RELEASE = Object.freeze({ id: "actionholdrelease", label: word("action-producers.label.record_hold_needed"), weight: "single" });
  static TEMPLATE_REVIEW = Object.freeze({ id: "templatereview", label: word("action-producers.label.review_template_version"), weight: "single" });
  static FACT_CONFIRM = Object.freeze({ id: "factconfirm", label: word("action-producers.label.confirm_correct_dispute"), weight: "single" });
  static WATCH_ANSWER = Object.freeze({ id: "watchanswer", label: say("door.watchanswer"), weight: "single" });
  static REVIEW_RECORD = Object.freeze({ id: "planreviewrecord", label: say("door.planreviewrecord"), weight: "single" });
  static PLAN_RESUME = Object.freeze({ id: "planresume", label: say("door.planresume"), weight: "single" });
  /** R25 (DEC-212): the unsent request's doors: the action's screen at its step (`op=action`, actions R47's read, the
   *  screen opening at the send step; its label is this module's own, words.json holding none), keeping it for later
   *  (`queuesnooze`, queue's act) and dropping the request with a reason (`actionmove` to `abandoned`, actions' move). */
  static OPEN_ACTION = Object.freeze({ id: "action", label: say("request-unsent.open"), weight: "single" });
  static SNOOZE = Object.freeze({ id: "queuesnooze", label: say("act.queuesnooze.label.queue"), weight: "single" });
  static DROP_REQUEST = Object.freeze({ id: "actionmove", label: say("act.actionmove.label.queue"), weight: "single" });

  /** R11: each kind's doors, in order (the producers lead their options with exactly these). */
  static DOORS = Object.freeze({
    "action-clock-overdue": ["actioncorrespond", "promote", "itemtakeup"],
    "plan-checkpoint-due": ["checkpointrecord", "itemtakeup"],
    "escalation-stage-proposed": ["escalationadvance", "escalationdecline", "itemtakeup"],
    "action-reminder": ["reminderanswer"],
    "litigation-hold": ["actionhold", "actionholdrelease"],
    "local-fact-due": ["factconfirm"],
    "member-left-items": ["itemtakeup"],
    "watch-keep-or-stop": ["watchanswer"],
    "plan-review-due": ["planreviewrecord"],
    "plan-look-again": ["planreviewrecord", "planresume"],
    "request-unsent": ["action", "queuesnooze", "actionmove"],
  });

  /* ================================================================== R13 · actionItems
   * queue-producers' ONE read of this module (its R8). Every producer is a pure read; one that throws contributes no
   * item and is named in `facts.failed`, so the rest of the feed stands. `facts[<kind>]` states each producer's bound
   * and whether it cut. */
  actionItems({ member = null, viewer = null, now = null, homesOf = null, optionsOf = null } = {}) {
    const me = memberIdOf(member);
    const at = Number.isFinite(Number(now)) && now !== null && now !== "" ? Number(now) : Date.now();
    this.#homesFn = typeof homesOf === "function" ? homesOf : null;
    this.#optionsFn = typeof optionsOf === "function" ? optionsOf : null;
    this.#zone = undefined;
    this.#memo = { reads: new Map(), takeUps: null, facts: new Map(), sight: new Map(), owners: new Map(), admins: null, part: new Map(),
                   watchEnds: new Map() };
    const items = [];
    const facts = { failed: [] };
    const run = (kind, produce) => {
      try {
        const r = produce();
        items.push(...r.items);
        facts[kind] = r.bound;
      } catch {
        facts.failed.push(kind);
      }
    };
    try {
      /* R1–R5: an overdue date, a checkpoint come due, a stage proposed, a reminder asked for, a legal threat with no
         hold stated; R8 (DEC-113): a hold in place released. */
      run("action-clock-overdue", () => this.#conditionsActionClockOverdue(me, viewer, at));
      run("plan-checkpoint-due", () => this.#obligationsPlanCheckpointDue(me, viewer, at));
      run("escalation-stage-proposed", () => this.#obligationsEscalationStageProposed(me, viewer, at));
      run("action-reminder", () => this.#obligationsActionReminder(me, viewer, at));
      run("litigation-hold", () => this.#obligationsLitigationHold(me, viewer, at));
      run("litigation-hold-released", () => this.#findingsHoldReleased(me, viewer, at));
      /* R6, R7 (K921): a template version a member was asked to review; a local fact a live deadline reads, due. */
      run("template-review-requested", () => this.#obligationsTemplateReview(me, viewer, at));
      run("local-fact-due", () => this.#obligationsLocalFactDue(me, viewer, at));
      /* R9–R12 (T45): a member who left, a watch's once-only question, a review the group asked for, a look again. */
      run("member-left-items", () => this.#findingsMemberLeft(me, viewer, at));
      run("watch-keep-or-stop", () => this.#obligationsWatchKeepOrStop(me, viewer, at));
      run("plan-review-due", () => this.#obligationsPlanReviewDue(me, viewer, at));
      run("plan-look-again", () => this.#obligationsPlanLookAgain(me, viewer, at));
      /* R25 (T47; DEC-212): a request a member approved and nobody has recorded sent. */
      run("request-unsent", () => this.#conditionsRequestUnsent(me, viewer, at));
      return { items, facts };
    } finally {
      this.#homesFn = null;
      this.#optionsFn = null;
      this.#zone = undefined;
      this.#memo = null;
    }
  }

  /* ======================================================================
   * K608 · R1–R5, R8 — THE ACTION LAYER (monitoring R34, R35; action-clocks R3, R5, R16–R18; escalation R16;
   * action-plans R17; action-holds R3, R8).
   *
   * Bob's notification rulings (DEC-10, DEC-69, DEC-70, DEC-94; K613–K615): an item informs once at the occurrence, is
   * dispositionable and ages; a nearing deadline changes an item's position, colour or wording only and mints none; no
   * outside channel is used; nothing is repeated unless the member asks. Each kind reads the one fact its owning
   * module offers, derived on read and writing nothing, so an item leaves when that module stops answering it. A caller
   * with no member is none of the members these name, and is told none of them.
   *
   * R1's rule (T45; N881; Actions D14; v0.2 rule 18): an item goes to the first of the member who last took the thing
   * up (plan-work R11) and the member who created or set it, each only while an active member who may see it; else to
   * the project's active owners; else to the administrators. Nobody assigns anybody; R9 tells the owners once when a
   * member leaves.
   * ====================================================================== */

  /** Whether a member is an active member of the group (membership R68), memoised per read. */
  #active(who) {
    const m = memberIdOf(who);
    if (m === null) return false;
    if (!this.#memo.facts.has(m)) {
      let f = null;
      try { f = this.#membership.memberFacts(m); } catch { f = null; }
      this.#memo.facts.set(m, !!f && f.status === "active");
    }
    return this.#memo.facts.get(m);
  }

  /** Whether a member may see a bundle (membership R80, as `member:<id>`), memoised per read. */
  #sees(who, id) {
    if (typeof id !== "string" || !id) return true;
    const m = memberIdOf(who);
    if (m === null) return false;
    const k = `${m}\n${id}`;
    if (!this.#memo.sight.has(k)) {
      let s = false;
      try { s = this.#membership.inSight(id, `member:${m}`); } catch { s = false; }
      this.#memo.sight.set(k, !!s);
    }
    return this.#memo.sight.get(k);
  }

  /** A member's participation in a project (membership R74), memoised per read; null when none is held. */
  #participation(project, m) {
    const k = `${project}\n${m}`;
    if (!this.#memo.part.has(k)) {
      let p = null;
      try { p = this.#membership.participation(project, m); } catch { p = null; }
      this.#memo.part.set(k, p);
    }
    return this.#memo.part.get(k);
  }

  /** A project's active owners (membership R65), each an active member of the group who has joined it. */
  #activeOwners(project) {
    if (typeof project !== "string" || !project) return [];
    if (!this.#memo.owners.has(project)) {
      const owners = membersOf(this.#membership.projectOwners(project)).filter((m) => {
        const p = this.#participation(project, m);
        return this.#active(m) && !!p && p.state === "joined";
      });
      this.#memo.owners.set(project, owners);
    }
    return this.#memo.owners.get(project);
  }

  /** One provider read per `actionItems` call, shared by the producers that need it (R1 and R9 read the same pages). */
  #once(name, read) {
    if (!this.#memo.reads.has(name)) this.#memo.reads.set(name, read());
    return this.#memo.reads.get(name);
  }

  #admins() {
    if (this.#memo.admins === null) this.#memo.admins = membersOf(this.#membership.activeAdmins());
    return this.#memo.admins;
  }

  /** plan-work R11: the member who last took up each item, keyed as `#takeUpKey` names it. Read once per read, as the
   *  plane (every take-up), followed by its cursor; who may see the item is asked of each candidate here. */
  #takenBy(key) {
    if (this.#memo.takeUps === null) {
      const last = new Map();
      let after = null;
      for (let page = 0; page < ActionProducers.QUEUE_ACTION_PAGES; page += 1) {
        const r = this.#planWork.takeUpsFor({ after, viewer: null });
        if (!r || r.ok === false || !Array.isArray(r.items)) break;
        for (const t of r.items) {
          const k = ActionProducers.#takeUpKey(t && t.item);
          if (k && person(t.member)) last.set(k, memberIdOf(t.member));
        }
        if (!r.truncated || r.cursor === null || r.cursor === undefined) break;
        after = r.cursor;
      }
      this.#memo.takeUps = last;
    }
    return key ? this.#memo.takeUps.get(key) ?? null : null;
  }

  /** The one key an item taken up is matched by: a clock entry by its action and position, a checkpoint by its plan,
   *  scenario and phase, an escalation by its id (R3: "the member who last took up the escalation"), a hold by its
   *  action and position. */
  static #takeUpKey(item) {
    if (!item || typeof item !== "object") return null;
    if (item.kind === "clock" && item.action) return `clock\n${item.action}\n${Number(item.entry)}`;
    if (item.kind === "checkpoint" && item.plan) return `checkpoint\n${item.plan}\n${item.scenario}\n${item.phase}`;
    if (item.kind === "escalation_stage" && item.escalation) return `escalation\n${item.escalation}`;
    if (item.kind === "hold" && item.target) return `hold\n${item.target}\n${item.ord ?? ""}`;
    return null;
  }

  /** R1's rule: `taken` the take-up key (or null where nothing is taken up), `author` who created or set the thing,
   *  `seen` the bundle a candidate must see (the action, the escalation, the plan's project), `project` whose active
   *  owners come next. Answers the members and the arm that chose them. */
  #recipients({ taken = null, author = null, seen = null, project = null } = {}) {
    const takenBy = this.#takenBy(taken);
    if (takenBy && this.#active(takenBy) && this.#sees(takenBy, seen)) return { rule: "took_up", members: [takenBy] };
    if (person(author) && this.#active(author) && this.#sees(author, seen)) return { rule: "author", members: [memberIdOf(author)] };
    const owners = this.#activeOwners(project);
    if (owners.length) return { rule: "project_owners", members: [...owners] };
    return { rule: "administrators", members: [...this.#admins()] };
  }

  /** A provider's paged read followed by its cursor, at most QUEUE_ACTION_PAGES pages; `truncated` when it was cut;
   *  `zone_undetermined` the entries its pages left out for want of a zone (action-clocks R3; K1658), summed. `list`
   *  names the page's array (`items`, or following R24's `questions`). */
  #pages(read, list = "items") {
    const items = [];
    let after = null, cut = false, unzoned = 0;
    for (let page = 0; ; page += 1) {
      if (page === ActionProducers.QUEUE_ACTION_PAGES) { cut = true; break; }
      const r = read(after);
      if (!r || r.ok === false || !Array.isArray(r[list])) break;
      items.push(...r[list]);
      if (Number.isInteger(r.zone_undetermined) && r.zone_undetermined > 0) unzoned += r.zone_undetermined;
      if (!r.cursor || (list === "items" && !r.truncated)) break;
      after = r.cursor;
    }
    return { items, truncated: cut, zone_undetermined: unzoned };
  }

  /** R1's words by basis (v0.2 rule 6): the key of the sentence an overdue entry's summary reads. The group's own date
   *  (`owed_by: group`, action-clocks R18) is `ours`; the other side's stated date (basis kind `stated`, its R7) is
   *  `theirs`; any other (the addressee's, or one whose owner is not stated) is canon's question, `noreply`. */
  static #wordsKey(e) {
    if (e && e.owed_by === "group") return "queue.action-clock-overdue.ours.summary";
    if (e && e.basis_of && e.basis_of.kind === "stated") return "queue.action-clock-overdue.theirs.summary";
    return "queue.action-clock-overdue.noreply";
  }

  /** R1's detail where no key's words are true of the entry: canon's question and the other side's date for every
   *  entry, and the group's own date where `overdueClocks` answers no office or venue (R24). `.theirs.detail` is keyed in
   *  words.json but keeps this present text, returned to BOB, so no `detail_key` is answered (R23: it says "no reply is
   *  recorded since", untrue once a reply is recorded while nothing marks the entry met). */
  static #detailOf(e, dated, steps) {
    const stepsSentence = steps.length
      ? ` ${word("action-producers.step_stand_date", { plural: steps.length > 1 ? "s" : "", steps: steps.join(", "), plural_2: steps.length > 1 ? "" : "s" })}`
      : "";
    return word("action-producers.dated_nothing_marks", { text: String(e.text ? `"${e.text}"` : word("action-producers.entry_action_clock")), dated: String(dated ? e.date : word("action-producers.date")), basis: String(e.basis ? ` (${e.basis})` : ""), plural: stepsSentence });
  }

  /** R24 (action-clocks R23): the office or venue a group's own date is owed at, as the record states it: an office as
   *  its role and body ("<role>, <body>"; its role alone with no body), a venue by its name. Null when none is held, or
   *  what is held names nothing. */
  static #venueWords(v) {
    const s = (x) => (typeof x === "string" && x.trim() ? x.trim() : null);
    if (!v || typeof v !== "object") return null;
    if (v.kind === "office") return s(v.role) ? (s(v.body) ? `${s(v.role)}, ${s(v.body)}` : s(v.role)) : null;
    if (v.kind === "venue") return s(v.name);
    return null;
  }

  /** R21: the door stating this entry met or waived: the action's revision (`op=promote`), keyed to the action and the
   *  entry's position, changing only that entry's `status` to `met` or `waived`. */
  static #entryStateDoor(action, entry) {
    return { ...ActionProducers.ENTRY_STATE, revision: { action, entry, field: "status", to: ["met", "waived"] } };
  }

  /** R22 (N926; following R25): whether an entry carrying `noticed_by` is drawn after all: when the duty's watch has
   *  ended, `following.dutyWatchEnd(duty)` answering a day before the read's local day in the action's zone, the duty's
   *  Noticed item tells nothing of it and R1's item stands. With no `noticed_by` it stands; while that read answers null,
   *  a day not yet passed, or throws, or no local day of the read is held, it does not, so one fact is never two items.
   *  Memoised per duty per read. */
  #standsAlone(e, now) {
    const n = e && e.noticed_by;
    if (!n) return { stands: true, end: null };
    const duty = n && typeof n === "object" ? n.duty : n;
    let end = null;
    if (typeof duty === "string" && duty) {
      if (!this.#memo.watchEnds.has(duty)) {
        let d = null;
        try { const f = this.#following; d = f && typeof f.dutyWatchEnd === "function" ? f.dutyWatchEnd(duty) : null; } catch { d = null; }
        this.#memo.watchEnds.set(duty, isCalendarDate(d) ? d : null);
      }
      end = this.#memo.watchEnds.get(duty);
    }
    const today = ActionProducers.#today(now, this.#actionZone(e));
    return { stands: !!(end && today && end < today), end };
  }

  /** `action-clock-overdue` (R1; monitoring R34; action-clocks R3, R16–R18; K611): one CONDITION per clock entry
   *  `action-clocks.overdueClocks` answers the viewer, to R1's recipients, homed under the action's project and the
   *  action's own walk, aged from the day after the entry's date. One item per fact: none for an entry an adopted
   *  duty's Noticed item stands for (`noticed_by`), and an entry steps stand for (`steps`) is this one item, naming them.
   *  Its summary is read by key, by basis; it never says the body failed. Raised once per entry: it stands until the
   *  entry is met or waived, or the action is resolved or abandoned, and then the read no longer answers it. */
  #conditionsActionClockOverdue(me, viewer, now) {
    const bound = { pages_bound: ActionProducers.QUEUE_ACTION_PAGES, truncated: false, zone_undetermined: 0 };
    if (!me) return { items: [], bound };
    const page = this.#once("overdueClocks", () => this.#pages((after) => this.#actionClocks.overdueClocks({ after, viewer, now })));
    Object.assign(bound, { truncated: page.truncated, zone_undetermined: page.zone_undetermined });
    const out = [];
    for (const e of page.items) {
      if (!e || typeof e.action !== "string" || !e.action || !Number.isInteger(e.ord)) continue;
      /* R1: the duty's Noticed item replaces it (action-clocks R17), until the duty's watch has ended (R22) */
      const alone = this.#standsAlone(e, now);
      if (!alone.stands) continue;
      const to = this.#recipients({ taken: `clock\n${e.action}\n${e.ord}`, author: e.created_by, seen: e.action, project: e.project });
      if (!to.members.includes(me)) continue;
      /* R20: past from the first instant after the entry's local day, in the action's zone (civil-time R7) */
      const zone = this.#actionZone(e);
      const dated = isCalendarDate(e.date);
      const after = dated ? ActionProducers.#dayEdge(e.date, zone, "end") : null;
      const key = ActionProducers.#wordsKey(e);
      const today = ActionProducers.#today(now, zone) || (typeof e.local_day === "string" ? e.local_day : null);
      const steps = Array.isArray(e.steps) ? e.steps.filter((s) => typeof s === "string" && s) : [];
      const what = e.text || word("action-producers.entry_clock");
      const summary = say(key, { date: dated ? dayWords(e.date, today) : "its date", what });
      /* R24: the group's own date names the office or venue it is owed at, by key; with none held (or no date to name),
         the key's sentence would be untrue, so the present detail stands and no detail_key is answered */
      const venue = e.owed_by === "group" ? ActionProducers.#venueWords(e.venue) : null;
      const ours = venue && dated
        ? { detail: say("queue.action-clock-overdue.ours.detail", { what, venue, date: dayWords(e.date, today) }),
            detail_key: "queue.action-clock-overdue.ours.detail" }
        : { detail: ActionProducers.#detailOf(e, dated, steps) };
      out.push({
        id: `CONDITION::action-clock-overdue::${e.action}::${e.ord}`,
        class: "CONDITION",
        kind: "action-clock-overdue",
        case: this.#actionHomes(e.action, e.project, viewer),
        due: ActionProducers.#dueDay(dated ? e.date : null, zone),
        subject: { kind: "action", id: e.action, entry: e.ord, date: e.date ?? null, basis: e.basis ?? null,
                   text: e.text ?? null, project: e.project ?? null, owed_by: e.owed_by ?? null, steps },
        summary,
        summary_key: key,
        ...ours,
        basis: { source: "action-clocks.overdueClocks", action: e.action, entry: e.ord, date: e.date ?? null,
                 basis: e.basis ?? null, text: e.text ?? null, status: e.status ?? null, past: e.past ?? null,
                 project: e.project ?? null, created_by: e.created_by ?? null, owed_by: e.owed_by ?? null, steps,
                 recipients_rule: to.rule, zone, words: key,
                 ...(e.noticed_by ? { noticed_by: e.noticed_by, duty_watch_end: alone.end } : {}),
                 ...(e.owed_by === "group" ? { venue: e.venue && typeof e.venue === "object" ? e.venue : null,
                                               venue_why: typeof e.venue_why === "string" ? e.venue_why : null } : {}),
                 local_day: typeof e.local_day === "string" ? e.local_day : null,
                 basis_of: e.basis_of && typeof e.basis_of === "object" ? e.basis_of : null,
                 bound: { pages_bound: ActionProducers.QUEUE_ACTION_PAGES, truncated: page.truncated,
                          zone_undetermined: page.zone_undetermined },
                 detail: localize("action-producers.index.a_passed_date_is_action", "a passed date is action-clocks' fact (its R3): a stored status, or a pending entry dated before the action's local day (`local_day`), its basis kind as `basis_of` names it; a pending entry of an action whose zone is not held is left out and counted (`zone_undetermined`). It goes to the member who last took the entry up, else the member who created the action, each while an active member who may see it, else the project's active owners, else the administrators, and is raised once: nothing here repeats it.") },
        age: dated
          ? ActionProducers.#localAge(after || "", zone, now, "zone_undetermined", ActionProducers.ZONE_UNDETERMINED)
          : { state: "undetermined", reason: "no_entry_date",
              detail: "the entry carries no date this producer can read, so when it passed is not derivable" },
        assignee: null,
        assignee_role: null,
        recipients: to.members,
        options: [ActionProducers.CORRESPOND, ActionProducers.#entryStateDoor(e.action, e.ord), ActionProducers.TAKE_UP,
                  ...this.#optionsOf([e.action])],
      });
    }
    return { items: out, bound };
  }

  /** `plan-checkpoint-due` (R2; action-plans R17, K711): one OBLIGATION per checkpoint `action-plans.checkpointsDue`
   *  answers at the read's instant, on a plan whose project this viewer sees (the read names no viewer, so the plan's
   *  project is asked here, R14), to R1's recipients (who took the checkpoint up, then who set the scenario's current
   *  version), homed under that project, aged from the checkpoint's day. Never a FINDING or a CONDITION (action-plans
   *  R23). It leaves when a member judges the checkpoint or closes the plan. */
  #obligationsPlanCheckpointDue(me, viewer, now) {
    const bound = { limit: null, truncated: false };
    if (!me) return { items: [], bound };
    const r = this.#once("checkpointsDue", () => this.#actionPlans.checkpointsDue({ nowMs: now }));
    if (!r || r.ok === false || !Array.isArray(r.items)) return { items: [], bound };
    Object.assign(bound, { limit: r.limit ?? null, truncated: r.truncated === true });
    const visible = this.#bundleRedactor(viewer);
    const out = [];
    for (const c of r.items) {
      if (!c || typeof c.plan !== "string" || !c.plan || typeof c.project !== "string" || !c.project) continue;
      if (visible(c.project) === null) continue;     // R14: a plan of a project this viewer may not see is no item
      const to = this.#recipients({ taken: `checkpoint\n${c.plan}\n${c.scenario}\n${c.phase}`, author: c.set_by,
                                    seen: c.project, project: c.project });
      if (!to.members.includes(me)) continue;
      const due = typeof c.due === "string" ? c.due : null;
      /* R18, R20: the checkpoint's local day in the instance profile's zone */
      const zone = this.#instanceZone();
      out.push({
        id: `OBLIGATION::plan-checkpoint-due::${c.plan}::${c.scenario}::${c.phase}`,
        class: "OBLIGATION",
        kind: "plan-checkpoint-due",
        case: this.#homesAt([c.project], viewer),
        due: ActionProducers.#dueDay(due, zone),
        subject: { kind: "plan", id: c.plan, project: c.project, scenario: c.scenario ?? null, phase: c.phase ?? null,
                   version: c.version ?? null },
        summary: word("action-producers.summary.checkpoint_plan_come", { plan: String(c.plan), scenario: String(c.scenario), phase: String(c.phase) }),
        detail: "the day this plan's scenario set for judging a phase has come, and no member has judged it. A member "
              + "records whether what it set was met; nothing here judges it, and a checkpoint passed unjudged says "
              + "nothing about the government.",
        basis: { source: "action-plans.checkpointsDue", plan: c.plan, project: c.project, scenario: c.scenario ?? null,
                 phase: c.phase ?? null, version: c.version ?? null, set_by: c.set_by ?? null, due,
                 days_since_due: Number.isFinite(c.days_since_due) ? c.days_since_due : null, recipients_rule: to.rule, zone,
                 bound: { limit: r.limit ?? null, truncated: r.truncated === true },
                 detail: localize("action-producers.index.a_checkpoint_come_due_is", "a checkpoint come due is action-plans' fact (its R17): read here at the read's instant and never stored. It goes to the member who last took it up, else the member who set the scenario's current version, each while an active member who may see the plan, else the project's active owners, else the administrators, and leaves when a member judges it or closes the plan.") },
        age: ActionProducers.#localAge(due, zone, now, "no_checkpoint_day", "the checkpoint carries no day this producer can read"),
        assignee: null,
        assignee_role: null,
        recipients: to.members,
        options: [ActionProducers.CHECKPOINT_JUDGE, ActionProducers.TAKE_UP],
      });
    }
    return { items: out, bound };
  }

  /** `escalation-stage-proposed` (R3; monitoring R35, escalation R16): one OBLIGATION per (escalation, proposed edge)
   *  `escalation.escalationsDue` answers the viewer, to R1's recipients (who last took the escalation up, then who
   *  opened it), homed under the escalation's project, aged from the trigger's instant (escalation R2, a fact of the
   *  record). It leaves when a member advances or declines the edge, or the escalation is suspended, stopped or ended:
   *  a `stopped_pursuing` escalation proposes nothing (escalation R16, R31), and none is answered here. */
  #obligationsEscalationStageProposed(me, viewer, now) {
    const bound = { limit: null, truncated: false };
    if (!me) return { items: [], bound };
    const r = this.#once("escalationsDue", () => this.#escalation.escalationsDue({ nowMs: now, viewer }));
    if (!r || r.ok === false || !Array.isArray(r.items)) return { items: [], bound };
    Object.assign(bound, { limit: r.limit ?? null, truncated: r.truncated === true });
    const out = [];
    for (const p of r.items) {
      if (!p || typeof p.id !== "string" || !p.id || p.to === undefined || p.to === null) continue;
      if (p.state === "stopped_pursuing") continue;
      const to = this.#recipients({ taken: `escalation\n${p.id}`, author: p.opened_by, seen: p.id, project: p.project });
      if (!to.members.includes(me)) continue;
      out.push({
        id: `OBLIGATION::escalation-stage-proposed::${p.id}::${p.to}`,
        class: "OBLIGATION",
        kind: "escalation-stage-proposed",
        case: this.#homesAt(typeof p.project === "string" && p.project ? [p.project] : [], viewer),
        subject: { kind: "escalation", id: p.id, project: p.project ?? null, from: p.from ?? null, to: p.to,
                   stage: p.stage ?? null },
        summary: word("action-producers.summary.escalation_move_next", { id: String(p.id), stage: String(p.stage || `stage ${p.to}`) }),
        detail: "the record now meets the trigger for this escalation's next stage. A member advances it or declines to "
              + "for now, with a reason; nothing moves until a member does.",
        basis: { source: "escalation.escalationsDue", escalation: p.id, project: p.project ?? null, from: p.from ?? null,
                 to: p.to, stage: p.stage ?? null, instant: p.instant ?? null, ids: Array.isArray(p.ids) ? p.ids : [],
                 opened_by: p.opened_by ?? null, recipients_rule: to.rule,
                 bound: { limit: r.limit ?? null, truncated: r.truncated === true },
                 detail: localize("action-producers.index.a_proposed_stage_is_escalations", "a proposed stage is escalation's (its R16): its trigger met by the record, dated by the record's own instant and never by this read. It goes to the member who last took the escalation up, else the member who opened it, each while an active member who may see it, else the project's active owners, else the administrators.") },
        age: ActionProducers.#instantAge(p.instant, now, "no_trigger_instant",
          "the proposal carries no trigger instant this producer can read"),
        assignee: null,
        assignee_role: null,
        recipients: to.members,
        options: [ActionProducers.STAGE_ADVANCE, ActionProducers.STAGE_DECLINE, ActionProducers.TAKE_UP],
      });
    }
    return { items: out, bound };
  }

  /** `action-reminder` (R4; DEC-94 (1), K613 (1), K614; action-clocks R4–R6, R16): one OBLIGATION per reminder
   *  `action-clocks.remindersDue` answers the viewer, to the member who set it and to nobody else, and only while she
   *  is an active member who may see the action (else none: R9 names it), homed as R1's, aged from the reminder's day,
   *  offering its answer: another reminder on a later day, or none (action-clocks R6). A reminder on an entry and a
   *  step's on the same day for a step standing for it are one item, as remindersDue answers them once (its R16). It
   *  leaves when that member answers it, or the entry is no longer pending, or the action is resolved or abandoned.
   *  Nothing reminds that no member asked for (DEC-69). */
  #obligationsActionReminder(me, viewer, now) {
    const bound = { pages_bound: ActionProducers.QUEUE_ACTION_PAGES, truncated: false };
    if (!me) return { items: [], bound };
    const page = this.#pages((after) => this.#actionClocks.remindersDue({ nowMs: now, after, viewer }));
    bound.truncated = page.truncated;
    const out = [];
    for (const x of page.items) {
      if (!x || typeof x.action !== "string" || !x.action || !Number.isInteger(x.ord) || memberIdOf(x.set_by) !== me) continue;
      if (!this.#active(me) || !this.#sees(me, x.action)) continue;
      /* R20: the reminder's day is a local day of the action's zone; it ages from that day's first local instant */
      const zone = this.#actionZone(x);
      out.push({
        id: `OBLIGATION::action-reminder::${x.action}::${x.ord}::${x.on}`,
        class: "OBLIGATION",
        kind: "action-reminder",
        case: this.#actionHomes(x.action, x.project, viewer),
        due: ActionProducers.#dueDay(isCalendarDate(x.date) ? x.date : null, zone),
        subject: { kind: "action", id: x.action, entry: x.ord, date: x.date ?? null, basis: x.basis ?? null,
                   text: x.text ?? null, on: x.on ?? null, project: x.project ?? null },
        summary: word("action-producers.summary.reminder_asked", { text: String(x.text || word("action-producers.summary.clock_entry")), action: this.#actionName(x.action), date: String(x.date ? `, due ${x.date}` : "") }),
        detail: `you asked to be reminded of this date on ${x.on}. Answer it with another reminder on a later day, or with `
              + "none; nothing reminds you again unless you ask.",
        basis: { source: "action-clocks.remindersDue", action: x.action, entry: x.ord, date: x.date ?? null,
                 basis: x.basis ?? null, text: x.text ?? null, on: x.on ?? null, set_by: x.set_by,
                 project: x.project ?? null, zone, steps: Array.isArray(x.steps) ? x.steps : [],
                 bound: { pages_bound: ActionProducers.QUEUE_ACTION_PAGES, truncated: page.truncated },
                 detail: localize("action-producers.index.a_reminder_is_the_members", "a reminder is the member's own request, held by action-clocks (its R4) and due when its day has come (its R5): it goes to the member who set it, while she is an active member who may see the action, and to nobody else, and it leaves when that member answers it (its R6) or the entry or the action no longer calls for it.") },
        age: ActionProducers.#localAge(isCalendarDate(x.on) ? x.on : null, zone, now, "no_reminder_day",
          "the reminder carries no day this producer can read"),
        assignee: null,
        assignee_role: null,
        recipients: [me],
        options: [ActionProducers.REMINDER_ANSWER, ...this.#optionsOf([x.action])],
      });
    }
    return { items: out, bound };
  }

  /** `litigation-hold` (R5; K899 (7), DEC-61, N-A19; action-holds R2, R3, R12): one OBLIGATION per `legal` mark or
   *  record `action-holds.holdsDue` answers the viewer with no hold stated on it: an action's mark (keyed by the action
   *  and the entry's position), a docket entry's mark (`docket::<entry>`, its subject the case) and a pressure record
   *  made outside any action (`pressure::<record>`, its subject the record's project). Each goes to every administrator
   *  member, or the `admin` machine credential as R14's, and to the member who marked or recorded it while she is an
   *  active member; to nobody else. Aged from the mark's instant; raised once; it leaves when a hold is stated on it. */
  #obligationsLitigationHold(me, viewer, now) {
    const bound = { pages_bound: ActionProducers.QUEUE_ACTION_PAGES, truncated: false };
    const admin = me ? this.#membership.isAdministrator(me) : viewer === `${MACHINE_CLASS_PREFIX}admin`;
    if (!me && !admin) return { items: [], bound };
    const page = this.#once("holdsDue", () => this.#pages((after) => this.#actionHolds.holdsDue({ after, viewer })));
    bound.truncated = page.truncated;
    const visible = this.#bundleRedactor(viewer);
    const out = [];
    for (const m of page.items) {
      if (!m || typeof m !== "object") continue;
      const arrived = m.arrived && typeof m.arrived === "object" ? m.arrived
        : typeof m.action === "string" ? { action: m.action, ord: m.ord } : {};
      const marker = memberIdOf(m.marked_by);
      const markerTold = marker && this.#active(marker) ? marker : null;
      if (!admin && markerTold !== me) continue;
      const recipients = [...new Set([...this.#admins(), ...(markerTold ? [markerTold] : [])])];
      const project = typeof m.project === "string" && m.project && visible(m.project) !== null ? m.project : null;
      const age = ActionProducers.#instantAge(m.marked_at, now, "no_mark_instant", "the mark carries no instant this producer can read");
      const said = m.note ? ` ("${m.note}")` : "";
      const common = { class: "OBLIGATION", kind: "litigation-hold", age, assignee: null, assignee_role: null, recipients };
      const basisOf = (where, extra, detail) => ({ source: "action-holds.holdsDue", ...where, note: m.note ?? null,
        marked_by: marker, marked_at: m.marked_at ?? null, project, recipients_rule: "administrators_and_marker", ...extra,
        bound: { pages_bound: ActionProducers.QUEUE_ACTION_PAGES, truncated: page.truncated }, detail });
      if (typeof arrived.action === "string" && arrived.action && Number.isInteger(arrived.ord)) {
        if (visible(arrived.action) === null) continue;   // R14: a mark on an action this viewer may not see is no item
        out.push({ ...common,
          id: `OBLIGATION::litigation-hold::${arrived.action}::${arrived.ord}`,
          case: this.#actionHomes(arrived.action, project, viewer),
          subject: { kind: "action", id: arrived.action, entry: arrived.ord, note: m.note ?? null, project },
          summary: word("action-producers.summary.legal_threat_recorded", { action: this.#actionName(arrived.action) }),
          detail: `a received entry of this action (position ${arrived.ord}) was marked as a legal threat${said}. Record `
                + "that the team is preserving what the matter may reach (a hold in place), or that it need not (a "
                + "release), with a reason. This is told once; it leaves when a member records either.",
          basis: basisOf({ action: arrived.action, entry: arrived.ord }, {},
            localize("action-producers.index.a_legal_pressure_mark_with", "a legal pressure mark with no hold stated is action-holds' fact (its R2, R3), read here and never stored. It goes to every administrator and to the member who marked it (DEC-61), is raised once (DEC-69, DEC-70), and leaves when any member states a hold on that mark: in place (its R2) or released (its R5).")),
          options: [ActionProducers.HOLD_STATE, ActionProducers.HOLD_RELEASE, ...this.#optionsOf([arrived.action])] });
      } else if (typeof arrived.docket_entry === "string" && arrived.docket_entry) {
        if (!project) continue;                          // R14: a docket mark of a project this viewer may not see
        const kase = typeof arrived.case === "string" && arrived.case ? arrived.case : null;
        out.push({ ...common,
          id: `OBLIGATION::litigation-hold::docket::${arrived.docket_entry}`,
          case: this.#projectHomes(project, viewer),
          subject: { kind: "case", id: kase, entry: arrived.docket_entry, note: m.note ?? null, project },
          /* R23: the summary by key (a protected word); the detail keeps its present text, returned to BOB */
          summary: say("queue.litigation-hold.docket.summary", { entry: arrived.docket_entry }),
          summary_key: "queue.litigation-hold.docket.summary",
          detail: localize("action-producers.index.an_entry_on_this_cases", "an entry on this case's docket was marked as a legal threat{said}. Record that the team is preserving what the matter may reach: a hold placed from this mark. This is told once; it leaves when a hold is stated on the mark.", { said: String(said) }),
          basis: basisOf({ docket_entry: arrived.docket_entry, case: kase }, {},
            localize("action-producers.index.a_legal_mark_on_a", "a legal mark on a docket entry with no hold placed from it is action-holds' fact (its R3, over docket R27), read here and never stored. It goes to every administrator, and to whoever marked it while an active member, once (DEC-69, DEC-70), and leaves when a hold is placed from the mark (action-holds R2).")),
          options: [ActionProducers.HOLD_STATE] });
      } else if (typeof arrived.pressure === "string" && arrived.pressure) {
        if (!project) continue;                          // R14: a record in a project this viewer may not see
        out.push({ ...common,
          id: `OBLIGATION::litigation-hold::pressure::${arrived.pressure}`,
          case: this.#projectHomes(project, viewer),
          subject: { kind: "project", id: project, record: arrived.pressure, note: m.note ?? null },
          summary: word("action-producers.summary.legal_threat_recorded_litigation", { project: String(project) }),
          detail: `pressure that arrived outside any action was recorded here as a legal threat${said}. Record that the `
                + "team is preserving what the matter may reach: a hold placed from this record. This is told once; it "
                + "leaves when a hold is stated on the record.",
          basis: basisOf({ pressure: arrived.pressure }, {},
            localize("action-producers.index.a_legal_pressure_record_with", "a legal pressure record with no hold placed from it is action-holds' fact (its R3, R12), read here and never stored. It goes to every administrator and to the member who recorded it while an active member, once (DEC-69, DEC-70), and leaves when a hold is placed from the record (action-holds R2).")),
          options: [ActionProducers.HOLD_STATE] });
      }
    }
    return { items: out, bound };
  }

  /** `litigation-hold-released` (R8; DEC-113: "the administrators and whoever placed the hold are told once";
   *  action-holds R5, R8): one FINDING per release `action-holds.holdsReleased` answers the viewer (a `released`
   *  statement that ended a hold in place), keyed by the action, the entry's position and the statement's sequence, to
   *  every administrator member, or the `admin` machine credential as R14's, and to each member among the release's
   *  `placers`; to nobody else. Its subject the action, naming who released the hold, the reason, and the restarted
   *  projects this viewer may name (K2581: action-holds R8's "may name": seen at FULL, or a hidden project an
   *  administrator sees at EXISTENCE, membership R44, R60, D54, told by its id alone); homed as R1's, aged from the
   *  release. Raised once and never repeated: it leaves when its recipient disposes of it (queue's disposition). */
  #findingsHoldReleased(me, viewer, now) {
    const bound = { pages_bound: ActionProducers.QUEUE_ACTION_PAGES, truncated: false };
    const admin = me ? this.#membership.isAdministrator(me) : viewer === `${MACHINE_CLASS_PREFIX}admin`;
    if (!me && !admin) return { items: [], bound };
    const page = this.#pages((after) => this.#actionHolds.holdsReleased({ after, viewer }));
    bound.truncated = page.truncated;
    const visible = this.#bundleRedactor(viewer);
    /* K2581 (D54; membership R60): a restarted project this viewer may name: one it sees whole, or a hidden one an
       administrator sees at EXISTENCE (its id, never its contents); a member at a discoverable project's EXISTENCE
       may not (action-holds R2). */
    const named = new Map();
    const nameable = (p) => {
      if (visible(p) !== null) return true;
      if (!named.has(p)) named.set(p, this.#membership.sight(p, viewer) === "existence"
        && this.#membership.visibilityOf(p) === "hidden");
      return named.get(p);
    };
    const out = [];
    for (const x of page.items) {
      if (!x || typeof x.action !== "string" || !x.action || !Number.isInteger(x.ord) || !Number.isInteger(x.seq)) continue;
      if (visible(x.action) === null) continue;      // R14: a release on an action this viewer may not see is no item
      const placers = membersOf(x.placers);
      if (!admin && !placers.includes(me)) continue;
      const admins = this.#admins();
      const restarted = (Array.isArray(x.restarted) ? x.restarted : [])
        .filter((p) => typeof p === "string" && p && nameable(p));
      const by = typeof x.released_by === "string" && x.released_by ? x.released_by : null;
      /* the action's project (record-core's `bundleInfo`), for R1's homes; withheld when this viewer may not see it */
      const info = this.#record.bundleInfo(x.action);
      const project = info && typeof info.project === "string" && info.project && visible(info.project) !== null
        ? info.project : null;
      out.push({
        id: `FINDING::litigation-hold-released::${x.action}::${x.ord}::${x.seq}`,
        class: "FINDING",
        kind: "litigation-hold-released",
        case: this.#actionHomes(x.action, project, viewer),
        subject: { kind: "action", id: x.action, entry: x.ord, sequence: x.seq, released_by: by,
                   reason: x.reason ?? null, restarted },
        summary: word("action-producers.summary.released_litigation_hold", { by: String(by || "a member"), action: this.#actionName(x.action) }),
        detail: localize("action-producers.index.the_hold_on_a_legal", "the hold on a legal threat recorded on this action (position {ord}) was released{v1}. {v2} This is told once, to the administrators and to whoever placed the hold.", { ord: String(x.ord), v1: String(x.reason ? `, because "${x.reason}"` : ""), v2: String(restarted.length
                ? `Ordinary deletion restarts for ${restarted.join(", ")}.`
                : "No project you may name restarts its ordinary deletion.") }),
        basis: { source: "action-holds.holdsReleased", action: x.action, entry: x.ord, sequence: x.seq, released_by: by,
                 released_at: x.released_at ?? null, reason: x.reason ?? null, placers, restarted,
                 raised_to: [...new Set([...admins, ...placers])], recipients_rule: "administrators_and_placers",
                 bound: { pages_bound: ActionProducers.QUEUE_ACTION_PAGES, truncated: page.truncated },
                 detail: localize("action-producers.index.a_release_that_ended_a", "a release that ended a hold in place is action-holds' fact (its R5, R8), read here and never stored. It is told to every administrator and to each member who placed the hold (DEC-113), once (DEC-69, DEC-70), and leaves when its recipient disposes of it.") },
        age: ActionProducers.#instantAge(x.released_at, now, "no_release_instant",
          "the release carries no instant this producer can read"),
        assignee: null,
        assignee_role: null,
        recipients: [...new Set([...admins, ...placers])],
        options: this.#optionsOf([x.action]),
      });
    }
    return { items: out, bound };
  }

  /* ======================================================================
   * K921 · R6, R7 — FILING TEMPLATES AND LOCAL FACTS (filing-templates R7, R20; local-facts R1, R4; action-clocks R11).
   * Each reads the one fact its owning module offers, derived on read and writing nothing, so an item leaves when that
   * module stops answering it; raised once and never repeated unless the member asks (DEC-69, DEC-94).
   * ====================================================================== */

  /** `template-review-requested` (R6; K921; filing-templates R7, R20): one OBLIGATION per (version, member)
   *  `filing-templates.reviewsRequested` answers the viewer, to that member and to nobody else, naming the version's
   *  name and kind and the member who asked, aged from the instant asked. It leaves when the member reviews the
   *  version's present text or the version leaves `in_review` (the read no longer answers it). Homed under the
   *  template's project, the `project` the read answers (filing-templates R20; N476), at depth 0 and above it through
   *  queue's walk (R7); a `group` template's item (project null) has no project to be homed under and is ungrouped. */
  #obligationsTemplateReview(me, viewer, now) {
    const bound = { pages_bound: ActionProducers.QUEUE_ACTION_PAGES, truncated: false };
    if (!me) return { items: [], bound };
    const page = this.#pages((after) => this.#filingTemplates.reviewsRequested({ after, viewer }));
    bound.truncated = page.truncated;
    const visible = this.#bundleRedactor(viewer);
    const out = [];
    for (const x of page.items) {
      if (!x || typeof x.version !== "string" || !x.version || memberIdOf(x.member) !== me) continue;
      const asker = x.asked_by && typeof x.asked_by === "object" ? { id: x.asked_by.id ?? null, name: x.asked_by.name ?? null } : null;
      const askerName = asker && (asker.name || asker.id) ? asker.name || asker.id : "a member";
      const project = typeof x.project === "string" && x.project ? visible(x.project) : null;   // R14
      out.push({
        id: `OBLIGATION::template-review-requested::${x.version}::${x.member}`,
        class: "OBLIGATION",
        kind: "template-review-requested",
        case: project ? this.#homesAt([project], viewer) : this.#homesOf([]),
        subject: { kind: "template_version", id: x.version, template: x.template ?? null, name: x.name ?? null,
                   template_kind: x.kind ?? null, asked_by: asker, project },
        summary: word("action-producers.summary.asked_review_template", { asker_name: String(askerName), name: String(x.name ? `"${x.name}"` : x.version), version: String(x.version) }),
        detail: "a draft of this filing template was sent for review and you are one of the members asked. Review its "
              + "present text; this is told once, and it leaves when you have reviewed that text or the version leaves "
              + "review.",
        basis: { source: "filing-templates.reviewsRequested", template: x.template ?? null, version: x.version,
                 name: x.name ?? null, template_kind: x.kind ?? null, project, member: x.member, asked_by: asker,
                 asked_at: x.asked_at ?? null, recipients_rule: "asked_member",
                 bound: { pages_bound: ActionProducers.QUEUE_ACTION_PAGES, truncated: page.truncated },
                 detail: localize("action-producers.index.a_review_asked_for_is", "a review asked for is filing-templates' fact (its R7, R20): a member named a reviewer of a version in review who has not reviewed its present text. It goes to that member and to nobody else, and is raised once (DEC-69, DEC-94).") },
        age: ActionProducers.#instantAge(x.asked_at, now, "no_asked_instant", "the request carries no instant this producer can read"),
        assignee: null,
        assignee_role: null,
        recipients: [me],
        options: [ActionProducers.TEMPLATE_REVIEW],
      });
    }
    return { items: out, bound };
  }

  /** `local-fact-due` (R7; K921, K1000; local-facts R4, action-clocks R11): one OBLIGATION per fact and status, keyed
   *  `OBLIGATION::local-fact-due::<path>::<status>` so a fact disputed after it was unconfirmed is raised again: per fact
   *  `local-facts.factsDue({paths})` answers due, `paths` those `action-clocks.calendarFactsRead` answers the viewer, to
   *  R1's recipients of each action that reads it, taken together (the member who created the action while an active
   *  member who may see it, else its project's active owners, else the administrators); its subject the first such
   *  action, naming the fact, its status and why it is due. It leaves when a member confirms or corrects the fact or no
   *  live action reads it (either read no longer answers it). Each reading action is `{action, project, created_by}`. */
  #obligationsLocalFactDue(me, viewer, now) {
    const bound = { actions_limit: null, truncated: false };
    if (!me) return { items: [], bound };
    const read = this.#actionClocks.calendarFactsRead({ viewer, now });
    const listed = read && read.ok !== false && Array.isArray(read.paths) ? read.paths : [];
    Object.assign(bound, { actions_limit: read && read.actions_limit ? read.actions_limit : null, truncated: !!read && read.truncated === true });
    const readers = new Map();
    for (const p of listed) {
      if (!p || typeof p.path !== "string" || !p.path) continue;
      const acts = (Array.isArray(p.actions) ? p.actions : [])
        .filter((a) => a && typeof a === "object" && typeof a.action === "string" && a.action);
      if (acts.length) readers.set(p.path, acts);
    }
    if (readers.size === 0) return { items: [], bound };
    const due = this.#localFacts.factsDue({ paths: [...readers.keys()], viewer });
    const list = due && due.ok !== false && Array.isArray(due.due) ? due.due : [];
    const out = [];
    for (const f of list) {
      const acts = f && typeof f.path === "string" ? readers.get(f.path) : null;
      if (!acts) continue;
      const rules = new Set(), members = new Set();
      for (const a of acts) {
        const to = this.#recipients({ author: a.created_by, seen: a.action, project: a.project });
        rules.add(to.rule);
        for (const m of to.members) members.add(m);
      }
      if (!members.has(me)) continue;
      const first = acts[0];
      const status = typeof f.status === "string" ? f.status : null;
      /* aged from the dispute, else from the day the confirmation lapsed, else from the day the fact fell due */
      const latestAt = f.latest && typeof f.latest === "object" && typeof f.latest.at === "string" ? f.latest.at : null;
      const since = status === "disputed" ? latestAt : (f.lapsed && f.lapses_on ? f.lapses_on : f.due_from ?? null);
      /* R20: a day here is a local day of the fact's profile's zone (local-facts R3), the instance's combined view's */
      const zone = this.#instanceZone();
      out.push({
        id: `OBLIGATION::local-fact-due::${f.path}::${status}`,
        class: "OBLIGATION",
        kind: "local-fact-due",
        case: this.#actionHomes(first.action, first.project, viewer),
        subject: { kind: "action", id: first.action, project: first.project ?? null, path: f.path, fact: f.fact ?? null,
                   status, why: f.why ?? null },
        summary: word("action-producers.summary.local_fact_deadline", { action: this.#actionName(first.action), status: String(status === "disputed" ? "disputed" : "unconfirmed"), why: String(f.why ? `: ${f.why}` : "") }),
        detail: "a deadline on this action is counted in business days over a local calendar or office's hours that no "
              + "member here has confirmed as current, or that a member disputed. Confirm it, correct it with its source, "
              + "or dispute it. This is told once for each status the fact takes; it leaves when a member confirms or "
              + "corrects the fact, or no live action reads it.",
        basis: { source: "local-facts.factsDue + action-clocks.calendarFactsRead", path: f.path, fact: f.fact ?? null,
                 status, due: f.due ?? null, why: f.why ?? null, latest: f.latest ?? null,
                 ...(f.lapsed ? { lapsed: f.lapsed } : {}), ...(f.due_from ? { due_from: f.due_from } : {}),
                 ...(f.lapses_on ? { lapses_on: f.lapses_on } : {}),
                 actions: acts.map((a) => a.action), recipients: [...members].sort(),
                 recipients_rule: [...rules].sort().join("+"), zone,
                 bound: { actions_limit: read.actions_limit ?? null, truncated: read.truncated === true },
                 detail: localize("action-producers.index.a_fact_due_is_local", "a fact due is local-facts' (its R4), asked of the paths a live deadline reads, which are action-clocks' (its R11). It goes to the members who created those actions while active members who may see them, else their projects' active owners, else the administrators, and is raised once per fact and status.") },
        age: ActionProducers.#localAge(since, zone, now, "no_due_instant", "the fact carries no day it fell due this producer can read"),
        assignee: null,
        assignee_role: null,
        recipients: [...members].sort(),
        options: [ActionProducers.FACT_CONFIRM, ...this.#optionsOf([first.action])],
      });
    }
    return { items: out, bound };
  }

  /* ======================================================================
   * T45 · R9–R12 — DEPARTURES, WATCHES, DOORS AND PLAN REVIEWS (draft-T45-upper "queue-producers" R40–R43; N855, N881,
   * N890; Actions D6d, D14, D27; v0.2 rules 17, 18, 20).
   * ====================================================================== */

  /** A member is gone from a project when she is no longer an active member of the group (membership R68), or holds
   *  no participation in the project (membership R74; a member who leaves holds none). */
  #gone(who, project) {
    const m = memberIdOf(who);
    if (m === null) return false;
    if (!this.#active(m)) return true;
    if (typeof project !== "string" || !project) return false;
    const p = this.#participation(project, m);
    return !p || p.state === "left";
  }

  /** R9 (reading 3): who created an action, as action-clocks R3 states it: the author of its first manifest entry. */
  #createdBy(action) {
    try {
      const im = this.#record.readImage(action);
      const m = im ? im["_history/manifest.json"] : null;
      const entries = (JSON.parse(typeof m === "string" ? m : "{}").entries) || [];
      const first = [...entries].sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0))[0];
      return first && typeof first.author === "string" ? first.author : null;
    } catch { return null; }
  }

  /** R9: the open dated items this viewer may see, each with the member it routes its to-dos to (she took it up last,
   *  else she created or set it) and its project: pending and passed clock entries, checkpoints come due, proposed
   *  escalation stages, legal marks and records with no hold stated, and reminders standing on pending entries. */
  #routedItems(viewer, now) {
    const out = [];
    const cut = { truncated: false };
    const visible = this.#bundleRedactor(viewer);
    const routed = (taken, author) => this.#takenBy(taken) || memberIdOf(author);
    /* clock entries: the passed ones with their creator and project (action-clocks R3), the pending ones (its R1) */
    const entries = new Map();
    const overdue = this.#once("overdueClocks", () => this.#pages((after) => this.#actionClocks.overdueClocks({ after, viewer, now })));
    const pending = this.#pages((after) => this.#actionClocks.pendingClocks({ before: PENDING_BEFORE, after, viewer }));
    if (overdue.truncated || pending.truncated) cut.truncated = true;
    /* an entry a duty's Noticed item stands for (R1, R22) is no item of R1's, nor named here; its pending copy neither */
    const told = new Set();
    for (const e of [...overdue.items, ...pending.items]) {
      if (!e || typeof e.action !== "string" || !Number.isInteger(e.ord)) continue;
      const k = `${e.action}#${e.ord}`;
      if (told.has(k)) continue;
      if (e.noticed_by && !this.#standsAlone(e, now).stands) { told.add(k); continue; }
      if (!entries.has(k)) entries.set(k, e);
    }
    /* who created each action and its project: as overdueClocks states them, else as action-clocks R3 defines them */
    const actionFacts = new Map();
    for (const e of overdue.items)
      if (e && typeof e.action === "string" && !actionFacts.has(e.action))
        actionFacts.set(e.action, { created_by: e.created_by ?? null, project: e.project ?? null });
    const factsOf = (a) => {
      if (!actionFacts.has(a)) {
        const info = this.#record.bundleInfo(a);
        actionFacts.set(a, { created_by: this.#createdBy(a), project: info && typeof info.project === "string" ? info.project : null });
      }
      return actionFacts.get(a);
    };
    for (const e of entries.values()) {
      const f = factsOf(e.action);
      const taken = `clock\n${e.action}\n${e.ord}`;
      out.push({ kind: "clock", subject: e.action, entry: e.ord, date: e.date ?? null, basis: e.basis ?? null,
                 project: f.project, member: routed(taken, f.created_by), door: { kind: "clock", action: e.action, entry: e.ord } });
    }
    /* reminders a member set on those entries, still standing (action-clocks R4: `waiting` or `due`) */
    const actions = [...new Set([...entries.values()].map((e) => e.action))];
    if (actions.length > ActionProducers.MEMBER_LEFT_REMINDER_ACTIONS) cut.truncated = true;
    for (const a of actions.slice(0, ActionProducers.MEMBER_LEFT_REMINDER_ACTIONS)) {
      const r = this.#actionClocks.remindersFor({ action: a, viewer, now });
      for (const x of r && r.ok !== false && Array.isArray(r.reminders) ? r.reminders : []) {
        const e = entries.get(`${a}#${x.entry}`);
        if (!e || !person(x.set_by) || x.state === "answered") continue;
        out.push({ kind: "reminder", subject: a, entry: x.entry, date: x.on ?? null, basis: e.basis ?? null,
                   project: factsOf(a).project, member: memberIdOf(x.set_by), door: { kind: "clock", action: a, entry: x.entry } });
      }
    }
    /* checkpoints come due on plans this viewer's projects hold (action-plans R17) */
    const cps = this.#once("checkpointsDue", () => this.#actionPlans.checkpointsDue({ nowMs: now }));
    if (cps && cps.truncated === true) cut.truncated = true;
    for (const c of cps && cps.ok !== false && Array.isArray(cps.items) ? cps.items : []) {
      if (!c || typeof c.plan !== "string" || visible(c.project) === null) continue;
      const taken = `checkpoint\n${c.plan}\n${c.scenario}\n${c.phase}`;
      out.push({ kind: "checkpoint", subject: c.plan, entry: `${c.scenario}/${c.phase}`, date: c.due ?? null, basis: null,
                 project: c.project, member: routed(taken, c.set_by),
                 door: { kind: "checkpoint", plan: c.plan, scenario: c.scenario, phase: c.phase } });
    }
    /* proposed escalation stages (escalation R16) */
    const esc = this.#once("escalationsDue", () => this.#escalation.escalationsDue({ nowMs: now, viewer }));
    if (esc && esc.truncated === true) cut.truncated = true;
    for (const p of esc && esc.ok !== false && Array.isArray(esc.items) ? esc.items : []) {
      if (!p || typeof p.id !== "string" || p.to === undefined || p.to === null) continue;
      out.push({ kind: "escalation_stage", subject: p.id, entry: p.to, date: p.instant ?? null, basis: p.stage ?? null,
                 project: p.project ?? null, member: routed(`escalation\n${p.id}`, p.opened_by),
                 door: { kind: "escalation_stage", escalation: p.id, stage: p.to } });
    }
    /* legal marks and records she made with no hold stated (action-holds R3) */
    const holds = this.#once("holdsDue", () => this.#pages((after) => this.#actionHolds.holdsDue({ after, viewer })));
    if (holds.truncated) cut.truncated = true;
    for (const m of holds.items) {
      const a = m && m.arrived && typeof m.arrived === "object" ? m.arrived : m && m.action ? { action: m.action, ord: m.ord } : null;
      if (!a || !person(m.marked_by)) continue;
      if (typeof a.action === "string" && Number.isInteger(a.ord)) {
        out.push({ kind: "hold", subject: a.action, entry: a.ord, date: m.marked_at ?? null, basis: m.note ?? null,
                   project: m.project ?? null, member: routed(`hold\n${a.action}\n${a.ord}`, m.marked_by),
                   door: { kind: "hold", target: a.action, ord: a.ord } });
      } else if (typeof a.pressure === "string" && typeof m.project === "string") {
        out.push({ kind: "hold", subject: m.project, entry: a.pressure, date: m.marked_at ?? null, basis: m.note ?? null,
                   project: m.project, member: memberIdOf(m.marked_by), door: { kind: "hold", project: m.project } });
      }
    }
    return { items: out, truncated: cut.truncated };
  }

  /** `member-left-items` (R9; N881; Actions D14; v0.2 rule 18): one FINDING per (member, project) where the member is
   *  no longer an active member of the group or a participant of the project, and open dated items of that project
   *  route their to-dos to her (she took the item up last, or created or set it and nobody took it up), keyed
   *  `FINDING::member-left-items::<member>::<project | none>`, to the project's active owners (the others, when she was
   *  one), else the administrators; items of no project to the administrators under `none`. Its detail lists each item
   *  the recipient may see, with its take-up door; it never says why she left, and she is never told. Its age is
   *  undetermined: membership answers no departure instant. Raised once; it leaves when its recipient disposes of it. */
  #findingsMemberLeft(me, viewer, now) {
    const bound = { items_max: ActionProducers.MEMBER_LEFT_ITEMS_MAX, truncated: false };
    if (!me) return { items: [], bound };
    const visible = this.#bundleRedactor(viewer);
    const read = this.#routedItems(viewer, now);
    bound.truncated = read.truncated;
    const groups = new Map();
    for (const it of read.items) {
      if (!it.member || !this.#gone(it.member, it.project)) continue;
      const project = typeof it.project === "string" && it.project && visible(it.project) !== null ? it.project : null;
      if (it.project && !project) continue;             // R14: an item of a project this viewer may not see
      const k = `${it.member}\n${project || "none"}`;
      if (!groups.has(k)) groups.set(k, { member: it.member, project, items: [] });
      groups.get(k).items.push(it);
    }
    const out = [];
    for (const g of groups.values()) {
      if (g.member === me) continue;                    // she herself is never told
      const owners = g.project ? this.#activeOwners(g.project).filter((m) => m !== g.member) : [];
      const recipients = owners.length ? owners : [...this.#admins()].filter((m) => m !== g.member);
      if (!recipients.includes(me)) continue;
      const order = (a, b) => (a.kind < b.kind ? -1 : a.kind > b.kind ? 1 : a.subject < b.subject ? -1 : a.subject > b.subject ? 1
        : String(a.entry) < String(b.entry) ? -1 : String(a.entry) > String(b.entry) ? 1 : 0);
      const listed = [...g.items].sort(order);
      const named = listed.slice(0, ActionProducers.MEMBER_LEFT_ITEMS_MAX).map((it) => ({
        kind: it.kind, subject: it.subject, entry: it.entry, date: it.date, basis: it.basis,
        door: { ...ActionProducers.TAKE_UP, item: it.door } }));
      const where = g.project || "none";
      out.push({
        id: `FINDING::member-left-items::${g.member}::${where}`,
        class: "FINDING",
        kind: "member-left-items",
        case: this.#projectHomes(g.project, viewer),
        subject: { kind: "member_departure", member: g.member, project: g.project, items: named,
                   more: Math.max(0, listed.length - named.length) },
        /* R23: by key; {n} and {items} count and name only the items this recipient may see (R14) */
        summary: say("queue.member-left-items.summary", { member: g.member, n: listed.length }),
        summary_key: "queue.member-left-items.summary",
        detail: say("queue.member-left-items.detail", { member: g.member, place: g.project || "the team",
          items: ActionProducers.#itemsWords(named, listed.length - named.length) }),
        detail_key: "queue.member-left-items.detail",
        basis: { source: "membership.memberFacts + membership.participation + plan-work.takeUpsFor", member: g.member,
                 project: g.project, count: listed.length, recipients_rule: owners.length ? "project_owners" : "administrators",
                 bound: { items_max: ActionProducers.MEMBER_LEFT_ITEMS_MAX, truncated: read.truncated },
                 detail: localize("action-producers.index.whether_a_member_is_still", "whether a member is still here is membership's (its R68, R74); which items routed to her is the latest take-up (plan-work R11), else who created or set the item. The list holds only items you may see, and is told to the project's active owners, else the administrators, once.") },
        age: { state: "undetermined", reason: "departure_undetermined",
               detail: "membership answers no instant at which the member left, so how long ago is not derivable" },
        assignee: null,
        assignee_role: null,
        recipients,
        options: [ActionProducers.TAKE_UP],
      });
    }
    return { items: out, bound };
  }

  /** R23: the items a departure's finding names, in words: "the clock entry 0 on ACT-1 (2026-08-29)", …, and how many
   *  more the recipient may see beyond the list's bound. */
  static #itemsWords(named, more) {
    const KIND = { clock: word("action-producers.clock_entry"), reminder: word("action-producers.reminder_entry"), checkpoint: "the checkpoint",
                   escalation_stage: word("action-producers.proposed_stage"), hold: word("action-producers.legal_threat") };
    const one = (x) => `${KIND[x.kind] || "the item"} ${x.entry} on ${x.subject}${typeof x.date === "string" && x.date ? ` (${x.date.slice(0, 10)})` : ""}`;
    const words = named.map(one).join("; ");
    return more > 0 ? localize("action-producers.index.words_and_more_more", "{words}; and {more} more", { words: String(words), more: String(more) }) : words;
  }

  /** `watch-keep-or-stop` (R10; N855; Actions D6d; v0.2 rule 17; K2781 (2)): one OBLIGATION per entry
   *  `following.watchQuestions` answers the viewer (its R24), keyed `OBLIGATION::watch-keep-or-stop::<link>`, to that
   *  entry's recipients and to nobody else; its subject the plan, homed under the plan's project, naming the watch, its
   *  present end date and the cause. It offers `watchanswer` (following R25) as its door when `offered` is not empty; a
   *  relied-on watch is shown with no door. Aged from `due_at`; raised once; it leaves when the link is answered or its
   *  watch ends (the read no longer answers it). */
  #obligationsWatchKeepOrStop(me, viewer, now) {
    const bound = { pages_bound: ActionProducers.QUEUE_ACTION_PAGES, truncated: false };
    if (!me) return { items: [], bound };
    const page = this.#pages((after) => this.#following.watchQuestions({ after, viewer, now }), "questions");
    bound.truncated = page.truncated;
    const visible = this.#bundleRedactor(viewer);
    const projects = new Map();
    const projectOf = (plan) => {
      if (!projects.has(plan)) {
        let p = null;
        try { const r = this.#actionPlans.planRead({ id: plan, viewer, nowMs: now }); p = r && r.ok !== false ? r.project ?? null : null; }
        catch { p = null; }
        projects.set(plan, typeof p === "string" && p && visible(p) !== null ? p : null);
      }
      return projects.get(plan);
    };
    const out = [];
    for (const q of page.items) {
      if (!q || q.link === undefined || q.link === null || typeof q.plan !== "string") continue;
      const recipients = membersOf(q.recipients);
      if (!recipients.includes(me)) continue;
      const project = projectOf(q.plan);
      const w = q.watch && typeof q.watch === "object" ? q.watch : {};
      const offered = Array.isArray(q.offered) ? q.offered : [];
      const relied = q.relied_on === true || offered.length === 0;
      const why = q.cause === "promises_met" ? word("action-producers.promise_plan_matters")
        : word("action-producers.plan_closed");
      out.push({
        id: `OBLIGATION::watch-keep-or-stop::${q.link}`,
        class: "OBLIGATION",
        kind: "watch-keep-or-stop",
        case: this.#projectHomes(project, viewer),
        subject: { kind: "plan", id: q.plan, project, link: q.link, watch: { kind: w.kind ?? null, id: w.id ?? null,
                   ends: w.ends ?? null }, cause: q.cause ?? null, relied_on: relied },
        /* R23: the summary by key on every entry; the detail by key where `watchanswer` is offered; a relied-on
           entry keeps its present detail (the key would offer what following R25 refuses, WATCH_RELIED_ON) */
        summary: say("queue.watch-keep-or-stop.summary", { what: ActionProducers.#watchWords(w) }),
        summary_key: "queue.watch-keep-or-stop.summary",
        ...(relied
          ? { detail: `${why}. This watch is relied on elsewhere, so it is shown here and not offered for keeping or stopping.` }
          : { detail: say("queue.watch-keep-or-stop.detail", { plan: q.plan }), detail_key: "queue.watch-keep-or-stop.detail" }),
        basis: { source: "following.watchQuestions", link: q.link, plan: q.plan, project, watch: { kind: w.kind ?? null,
                 id: w.id ?? null, ends: w.ends ?? null }, cause: q.cause ?? null, due_at: q.due_at ?? null,
                 relied_on: relied, offered, recipients, recipients_rule: "following",
                 bound: { pages_bound: ActionProducers.QUEUE_ACTION_PAGES, truncated: page.truncated },
                 detail: localize("action-producers.index.a_watchs_once_only_question", "a watch's once-only question is following's (its R24): due when the plan closes or every promise its matters adopted reads met, to the link's author while an active member who may see the plan, else the project's active owners, else the administrators (a standing question's to its author alone). It is raised once and leaves when the link is answered or its watch ends.") },
        age: ActionProducers.#instantAge(q.due_at, now, "no_due_instant", "the question carries no instant this producer can read"),
        assignee: null,
        assignee_role: null,
        recipients,
        options: relied ? [] : [ActionProducers.WATCH_ANSWER],
      });
    }
    return { items: out, bound };
  }

  /** R23: a watch in words for `{what}`: its kind and what it watches ("the follow F-1"), else "this watch". */
  static #watchWords(w) {
    const KIND = { follow: "the follow", address: "the address", duty: "the duty", question: word("action-producers.standing_question") };
    if (!w || w.id === undefined || w.id === null || w.id === "") return "this watch";
    return `${KIND[w.kind] || "the watch"} ${w.id}`;
  }

  /** `plan-review-due` (R12; N890; Actions D27; v0.2 rule 20): one OBLIGATION per review day a plan's member-set rhythm
   *  reaches with no review entry recorded since (`plan-work.planReviewsDue`, its R4), keyed by the plan and the day,
   *  to the member who set the rhythm while she is an active member who may see the plan, else the project's active
   *  owners, else the administrators; its subject the plan, its `due` and `age` local days in the instance profile's
   *  zone. Raised once per day reached; it leaves when a review entry is recorded or the plan is closed. */
  #obligationsPlanReviewDue(me, viewer, now) {
    const bound = { limit: null, truncated: false };
    if (!me) return { items: [], bound };
    const r = this.#planWork.planReviewsDue({ nowMs: now });
    if (!r || r.ok === false || !Array.isArray(r.items)) return { items: [], bound };
    Object.assign(bound, { limit: r.limit ?? null, truncated: r.truncated === true });
    const visible = this.#bundleRedactor(viewer);
    const zone = this.#instanceZone();
    const out = [];
    for (const x of r.items) {
      if (!x || typeof x.plan !== "string" || !x.plan || typeof x.project !== "string" || visible(x.project) === null) continue;
      const to = this.#recipients({ author: x.member, seen: x.project, project: x.project });
      if (!to.members.includes(me)) continue;
      const day = isCalendarDate(x.day) ? x.day : ActionProducers.#localDayOf(x.due, zone);
      const dueDay = ActionProducers.#dueDay(x.due, zone);
      /* R24 (plan-work R18): the detail by key, naming the plan's title, the rhythm in words and the day reviews are
         counted since; where the rhythm is not one occurrence a period, or no such day is answered, the key's sentence
         would be untrue or empty, so the present detail stands and no detail_key is answered */
      const rhythm = ActionProducers.#rhythmWords(x.recurrence);
      const since = x.since && typeof x.since === "object" && isCalendarDate(x.since.day) ? x.since.day : null;
      const today = ActionProducers.#today(now, zone) || ActionProducers.#today(now, ActionProducers.#knownZone(x.zone));
      const title = this.#planTitle(x.plan, viewer, now);
      const keyed = rhythm && since
        ? { detail: say("queue.plan-review-due.detail", { plan: title ? `"${title}"` : x.plan, rhythm, date: dayWords(since, today) }),
            detail_key: "queue.plan-review-due.detail" }
        : { detail: localize("action-producers.index.the_rhythm_a_member_set", "the rhythm a member set for reviewing this plan has reached a review day, and no review is recorded since. Open the review to see what changed, and record what the members decided. You are reminded only because the team asked for it.") };
      out.push({
        id: `OBLIGATION::plan-review-due::${x.plan}::${day}`,
        class: "OBLIGATION",
        kind: "plan-review-due",
        case: this.#homesAt([x.project], viewer),
        due: dueDay,
        subject: { kind: "plan", id: x.plan, project: x.project, day, set_by: x.member ?? null },
        /* R23: the summary by key; R24: the detail by key where the item holds the rhythm in words and the day since */
        summary: say("queue.plan-review-due.summary", { plan: x.plan }),
        summary_key: "queue.plan-review-due.summary",
        ...keyed,
        basis: { source: "plan-work.planReviewsDue", plan: x.plan, project: x.project, set_by: x.member ?? null,
                 due_at: x.due ?? null, day, rhythm_zone: x.zone ?? null, zone, recipients_rule: to.rule,
                 recurrence: x.recurrence && typeof x.recurrence === "object" ? x.recurrence : null,
                 since: x.since && typeof x.since === "object" ? x.since : null, title,
                 bound: { limit: r.limit ?? null, truncated: r.truncated === true },
                 detail: localize("action-producers.index.a_review_come_due_is", "a review come due is plan-work's (its R4): a member-set rhythm reached a day with no review entry since. It goes to the member who set the rhythm while an active member who may see the plan, else the project's active owners, else the administrators, and is raised once per day.") },
        age: ActionProducers.#localAge(dueDay, zone, now, "no_review_day", "the review carries no day this producer can read"),
        assignee: null,
        assignee_role: null,
        recipients: to.members,
        options: [ActionProducers.REVIEW_RECORD],
      });
    }
    return { items: out, bound };
  }

  /** R24: a plan's title, as `action-plans.planRead` answers it to this viewer (its R6), memoised per read; null when
   *  none is answered. */
  #planTitle(plan, viewer, now) {
    const k = `title\n${plan}`;
    if (!this.#memo.reads.has(k)) {
      let t = null;
      try { const r = this.#actionPlans.planRead({ id: plan, viewer, nowMs: now }); t = r && r.ok !== false ? r.title ?? null : null; }
      catch { t = null; }
      this.#memo.reads.set(k, typeof t === "string" && t.trim() ? t.trim() : null);
    }
    return this.#memo.reads.get(k);
  }

  /** R24: a member-set rhythm (plan-work R18's `recurrence`, civil-time R20's subset) in words for `{rhythm}`: "week",
   *  "2 weeks", "month", "year". Null where the rule is unreadable or names more than one occurrence a period (several
   *  BYDAY, BYMONTHDAY or BYSETPOS values), where "every <period>" would be untrue. */
  static #rhythmWords(rec) {
    const rule = rec && typeof rec === "object" && typeof rec.rrule === "string" ? rec.rrule.trim().replace(/^RRULE:/i, "") : "";
    if (!rule) return null;
    const parts = new Map();
    for (const kv of rule.split(";")) {
      const i = kv.indexOf("=");
      if (i <= 0) return null;
      parts.set(kv.slice(0, i).trim().toUpperCase(), kv.slice(i + 1).trim());
    }
    const unit = { WEEKLY: "week", MONTHLY: "month", YEARLY: "year" }[String(parts.get("FREQ") || "").toUpperCase()];
    if (!unit) return null;
    for (const many of ["BYDAY", "BYMONTHDAY", "BYSETPOS"]) if (parts.has(many) && parts.get(many).split(",").length > 1) return null;
    const raw = parts.has("INTERVAL") ? parts.get("INTERVAL") : "1";
    if (!/^[1-9]\d{0,3}$/.test(raw)) return null;
    const n = Number(raw);
    return n === 1 ? unit : `${n} ${unit}s`;
  }

  /** `request-unsent` (R25; DEC-212; K1364; filings R53): one CONDITION per filing `filings.approvedUnsent` answers the
   *  viewer (a draft or communication approved and not recorded sent), keyed `CONDITION::request-unsent::<filing>`, to
   *  the member who approved it, else the action's creator, each only while an active member who may see the action,
   *  else its project's active owners (R25 names no further arm). Its subject the action, homed under its project,
   *  naming what is asked (the action itself: its title, K3122) and the approval's local day. Its doors: the action's
   *  screen at its step, `queuesnooze`, `actionmove` to `abandoned` with a reason. It is a reminder the group may take or
   *  leave (K1364 B4): it leaves when the filing is recorded sent (the read no longer answers it) or the action is
   *  resolved or abandoned. Aged from the approval. */
  #conditionsRequestUnsent(me, viewer, now) {
    const bound = { limit: null, truncated: false };
    if (!me) return { items: [], bound };
    const r = this.#filings.approvedUnsent({ viewer });
    if (!r || r.ok === false || !Array.isArray(r.items)) return { items: [], bound };
    Object.assign(bound, { limit: r.limit ?? null, truncated: r.truncated === true });
    const visible = this.#bundleRedactor(viewer);
    const zone = this.#instanceZone();
    const today = ActionProducers.#today(now, zone);
    const out = [];
    for (const x of r.items) {
      if (!x || typeof x.filing !== "string" || !x.filing || typeof x.action !== "string" || !x.action) continue;
      if (visible(x.action) === null) continue;        // R14: a filing on an action this viewer may not see is no item
      const row = this.#one(`SELECT current_state, title FROM bundles WHERE bundle_id=?`, x.action);
      if (row && ["resolved", "abandoned"].includes(row.current_state)) continue;   // dropped or done: nothing waits
      const project = typeof x.project === "string" && x.project && visible(x.project) !== null ? x.project : null;
      const approver = memberIdOf(x.approved_by);
      const creator = this.#createdBy(x.action);
      let to;
      if (approver && this.#active(approver) && this.#sees(approver, x.action)) to = { rule: "approver", members: [approver] };
      else if (person(creator) && this.#active(creator) && this.#sees(creator, x.action)) to = { rule: "author", members: [memberIdOf(creator)] };
      else to = { rule: "project_owners", members: [...this.#activeOwners(project)] };
      if (!to.members.includes(me)) continue;
      const what = row && typeof row.title === "string" && row.title.trim() ? row.title.trim() : "a request";
      const approved = ActionProducers.#localDayOf(x.approved_at, zone);
      out.push({
        id: `CONDITION::request-unsent::${x.filing}`,
        class: "CONDITION",
        kind: "request-unsent",
        case: this.#actionHomes(x.action, project, viewer),
        subject: { kind: "action", id: x.action, filing: x.filing, what, approved_by: approver, approved_at: x.approved_at ?? null,
                   project },
        /* R25: this module's own words (words.json holds no key for them), returned to BOB */
        summary: say(approver === me && to.rule === "approver" ? "request-unsent.summary.mine" : "request-unsent.summary", { what }),
        detail: approved ? say("request-unsent.detail", { date: dayWords(approved, today) }) : say("request-unsent.detail.undated"),
        screen: { op: "action", id: x.action, step: "send" },
        basis: { source: "filings.approvedUnsent", filing: x.filing, action: x.action, project, approved_by: approver,
                 approved_at: x.approved_at ?? null, approved_day: approved, created_by: memberIdOf(creator), zone,
                 action_state: row ? row.current_state ?? null : null, recipients_rule: to.rule,
                 bound: { limit: r.limit ?? null, truncated: r.truncated === true },
                 detail: localize("action-producers.index.an_approved_draft_or_communication", "an approved draft or communication not recorded sent is filings' fact (its R53), read here and never stored. It goes to the member who approved it, else the member who created the action, each while an active member who may see it, else the project's active owners. It leaves when the sending is recorded, or the action is dropped or resolved; nothing here repeats it.") },
        age: ActionProducers.#instantAge(x.approved_at, now, "no_approval_instant",
          "the approval carries no instant this producer can read"),
        assignee: null,
        assignee_role: null,
        recipients: to.members,
        options: [{ ...ActionProducers.OPEN_ACTION, screen: { op: "action", id: x.action, step: "send" } },
                  ActionProducers.SNOOZE,
                  { ...ActionProducers.DROP_REQUEST, move: { action: x.action, to: "abandoned", reason: "required" } },
                  ...this.#optionsOf([x.action])],
      });
    }
    return { items: out, bound };
  }

  /** `plan-look-again` (R12; N890; Actions D27; v0.2 rule 20; action-plans R40): one OBLIGATION per paused plan whose
   *  look-again day has come (`action-plans.plansToLookAgain`), keyed by the plan and that day, to the member who
   *  paused it by R1's rule, its subject the plan, due on that day; it offers the review entry act and the resume act.
   *  Raised once; it leaves when the plan is resumed or closed. */
  #obligationsPlanLookAgain(me, viewer, now) {
    const bound = { limit: null, truncated: false };
    if (!me) return { items: [], bound };
    const r = this.#actionPlans.plansToLookAgain({ nowMs: now });
    if (!r || r.ok === false || !Array.isArray(r.items)) return { items: [], bound };
    Object.assign(bound, { limit: r.limit ?? null, truncated: r.truncated === true });
    const visible = this.#bundleRedactor(viewer);
    const zone = this.#instanceZone();
    const out = [];
    for (const x of r.items) {
      if (!x || typeof x.plan !== "string" || !x.plan || typeof x.project !== "string" || visible(x.project) === null) continue;
      if (!isCalendarDate(x.look_again)) continue;
      const to = this.#recipients({ author: x.paused_by, seen: x.project, project: x.project });
      if (!to.members.includes(me)) continue;
      out.push({
        id: `OBLIGATION::plan-look-again::${x.plan}::${x.look_again}`,
        class: "OBLIGATION",
        kind: "plan-look-again",
        case: this.#homesAt([x.project], viewer),
        due: x.look_again,
        subject: { kind: "plan", id: x.plan, project: x.project, title: x.title ?? null, look_again: x.look_again,
                   paused_by: x.paused_by ?? null },
        /* R23: the summary by key; the detail keeps its present text, returned to BOB */
        summary: say("queue.plan-look-again.summary", { plan: x.title ? `"${x.title}"` : x.plan }),
        summary_key: "queue.plan-look-again.summary",
        detail: `a member paused this plan${x.reason ? `, because "${x.reason}"` : ""}, and named this day to look at it `
              + "again. What it set running has gone on. Review it, and resume it if the members decide to.",
        basis: { source: "action-plans.plansToLookAgain", plan: x.plan, project: x.project, look_again: x.look_again,
                 paused_by: x.paused_by ?? null, paused_at: x.paused_at ?? null, reason: x.reason ?? null,
                 pause: x.pause ?? null, zone, recipients_rule: to.rule,
                 bound: { limit: r.limit ?? null, truncated: r.truncated === true },
                 detail: localize("action-producers.index.a_paused_plans_day_to", "a paused plan's day to look again is action-plans' (its R40), told once. It goes to the member who paused it while an active member who may see the plan, else the project's active owners, else the administrators, and leaves when the plan is resumed or closed.") },
        age: ActionProducers.#localAge(x.look_again, zone, now, "no_look_again_day", "the pause carries no day this producer can read"),
        assignee: null,
        assignee_role: null,
        recipients: to.members,
        options: [ActionProducers.REVIEW_RECORD, ActionProducers.PLAN_RESUME],
      });
    }
    return { items: out, bound };
  }
}

const OF = new WeakMap();

/** The one action-producers instance for this Durable Object's storage (`ctx`, or the storage itself). It registers
 *  nothing. */
export function actionProducersOf(ctx, deps = {}) {
  const storage = ctx && ctx.storage ? ctx.storage : ctx;
  let p = OF.get(storage);
  if (!p) {
    p = new ActionProducers({ host: ctx, storage, deps: { ...(deps || {}) } });
    OF.set(storage, p);
  }
  return p;
}
