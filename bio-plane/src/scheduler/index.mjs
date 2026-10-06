/* ===========================================================================
 *  scheduler (layer 10; build/requirements/scheduler.md): THE PLANE'S ONE RECONCILING DURABLE OBJECT ALARM.
 *
 *  DECISION (REC-1, recorded in full in docs/development/SCHEDULER.md): the plane's periodic work runs on ONE
 *  reconciling Durable Object alarm, never on a Worker cron trigger (R14). A cron's floor is a minute where the task
 *  drain coalesces at a second (granularity); a cron fires forever where the alarm is deleted when nothing waits
 *  (self-termination, R15); and every consumer reconciles against the Durable Object's own storage (locality).
 *
 *  MECHANISM. A registry of consumers `{name, key, due(now), wake(now), tick(now)}` (R5): `onAlarm` runs the tick of
 *  every consumer due at the firing instant (within the grace), in registry order, then reconciles the one alarm to
 *  the EARLIEST wake any consumer still wants, over the WHOLE registry, deleting it when none does (R1, R15, R16).
 *  A producer that created work calls `arm`, which reconciles the same way but only ever pulls the alarm earlier
 *  (R4). Each consumer's work, cadence, batch and delay are its owning module's (R7): this module holds the grace
 *  and nothing else, keeps no table (R18), raises no queue item (R19) and names no place (R20).
 *
 *  The consumers' owners are reached through their factories (K61); a later module (the task drain's owner `tasks`,
 *  the queue re-notify's `queue`, the group-domain re-check's `instance-setup`) registers its consumer through
 *  `register` (R8). The producers' notices of the earlier modules are registered here, at
 *  construction (R9, the registration rule K206).
 *
 *  T33-80 (R21): six consumers of T33's new work close the registry. `follow`, `standing-questions` and `dated-waits`
 *  are due and wake when their owners say. `duty-transitions`, `interest-checks` and `money-detectors` state no due or
 *  wake of their own, so they run once per local day at the group's local day start (K1522), and again at the next
 *  firing while their owner says its pass is not done (K1566); the day is `civil-time`'s in the active jurisdiction
 *  view's time zone. Their one piece of state, the day each last finished a pass and the cursor of a pass under way, is
 *  the storage value `sched_daily`, never a table (R18).
 * ========================================================================= */
import { retrievalOf } from "../retrieval/index.mjs";
import { connectionsOf } from "../connections/index.mjs";
import { progressionsOf } from "../progressions/index.mjs";
import { aiRunsOf } from "../ai-runs/index.mjs";
import { captureRequestsOf } from "../capture-requests/index.mjs";
import { calibrationOf } from "../calibration/index.mjs";
import { biasOf } from "../bias/index.mjs";
import { intentOf } from "../intent/index.mjs";
import { reevaluationOf } from "../reevaluation/index.mjs";
import { promotionOf } from "../promotion/index.mjs";
import { captureOf } from "../capture/index.mjs";
import { monitoringOf } from "../monitoring/index.mjs";
import { linkSweepOf } from "../link-sweep/index.mjs";
import { entitiesOf } from "../entities/index.mjs";
import { networkNoticesOf } from "../network-notices/index.mjs";
import { dutiesOf } from "../duties/index.mjs";
import { peopleOf } from "../people/index.mjs";
import { moneyChecksOf } from "../money-checks/index.mjs";
import { answersOf } from "../answers/index.mjs";
import { inquiryOf } from "../inquiry/index.mjs";
import { recordOf } from "../record-core/index.mjs";
import { localDay, dayRange } from "../civil-time/index.mjs";
import { combine } from "../../../jurisdictions/index.mjs";

/** An alarm may fire a hair early: a consumer due within this window of the firing instant runs (R1). */
export const SCHED_GRACE_MS = 250;

/** R5: the registry's order. `capture-request-drain` before `ai-run-wake` is load-bearing: a request that completes
 *  on an alarm wakes its run on the same alarm. `gathering-sweep` (T23) stands after `monitor-cadence`, where R5
 *  places it, so the positions after it move by one; `working-on-seal` and `working-on-attest` (T23) are appended
 *  last. Order is read by name, never by index (K1122). */
export const SCHEDULER_ORDER = Object.freeze([
  "selection-sweep", "task-drain", "archive-monitor", "connection-derive", "overdue-scan", "queue-renotify",
  "monitor-cadence", "gathering-sweep", "ai-run-reap", "capture-request-drain", "ai-run-wake", "calibration-reprobe",
  "group-domain-recheck", "bias-debt", "intent-age", "notice-sweep", "deadline-recheck", "working-on-seal",
  "working-on-attest", "follow", "duty-transitions", "interest-checks", "money-detectors", "standing-questions",
  "dated-waits",
]);

/** R2: each consumer's key in `onAlarm`'s answer. The task drain's counts are spread into the answer's own fields. */
export const SCHEDULER_KEYS = Object.freeze({
  "selection-sweep": "swept", "task-drain": "drain", "archive-monitor": "monitor", "connection-derive": "connderive",
  "overdue-scan": "overduescan", "queue-renotify": "queuerenotify", "monitor-cadence": "monitorcadence",
  "gathering-sweep": "gatheringsweep", "ai-run-reap": "airunreap", "capture-request-drain": "capturerequests", "ai-run-wake": "airunwake",
  "calibration-reprobe": "calibration", "group-domain-recheck": "groupdomain", "bias-debt": "biasdebt",
  "intent-age": "intentage", "notice-sweep": "noticesweep", "deadline-recheck": "deadlinerecheck",
  "working-on-seal": "workingonseal", "working-on-attest": "workingonattest", "follow": "follow",
  "duty-transitions": "dutytransitions", "interest-checks": "interestchecks", "money-detectors": "moneydetectors",
  "standing-questions": "standingquestions", "dated-waits": "datedwaits",
});

/** R6: due at every firing. Every other consumer is due only when its owner says so. */
export const ALWAYS_DUE = Object.freeze(["selection-sweep", "task-drain", "archive-monitor", "connection-derive", "overdue-scan"]);

/** R10: the batch-bounded ticks, which receive the rank with their `now`. */
export const RANKED = Object.freeze(["monitor-cadence", "archive-monitor", "gathering-sweep", "capture-request-drain", "bias-debt",
                                     "follow"]);

/** R21 (K1522): the consumers whose owners state no due or wake: once per local day, and at every firing while a pass
 *  is under way. */
export const DAILY = Object.freeze(["duty-transitions", "interest-checks", "money-detectors"]);

/** money-checks R6 takes a budget and states none; this is the one its sibling owners state as their default
 *  (duties R13's and people R23's `budgetMs`, 1000 ms), passed until money-checks states its own (R7). */
export const DETECTORS_BUDGET_MS = 1000;

/* The answer's own fields (R2); a registered consumer's key may not take one. */
const ANSWER_FIELDS = new Set(["swept", "drained", "created", "folded", "refused", "waiting", "remaining", "rearmed",
                               "nextAt", "probes"]);
const DRAIN_ZERO = Object.freeze({ drained: 0, created: [], folded: [], refused: [], waiting: [], remaining: 0 });
const PROBE_KEY = "sched_probe";
const DAILY_KEY = "sched_daily";
const DAY_MS = 86_400_000;
const message = (e) => String((e && e.message) || e).slice(0, 500);
/* An instant in ms as civil-time's instant text, at the second (ISO_TS_RE). */
const instantText = (ms) => new Date(Math.floor(ms / 1000) * 1000).toISOString().replace(/\.\d{3}Z$/, "Z");
/* An owner's instant: a number in ms, or instant text read to ms; anything else is none. */
const msOf = (v) => (typeof v === "number" && Number.isFinite(v) ? v : typeof v === "string" && Number.isFinite(Date.parse(v)) ? Date.parse(v) : null);
const nextDate = (date) => new Date(Date.parse(`${date}T00:00:00Z`) + DAY_MS).toISOString().slice(0, 10);

/** The group's local day of `ms`: `{date, zone, start, next}` (`start` and `next` the instants in ms its day and the
 *  next begin), through `civil-time.localDay` and `dayRange` in `zone`. With no zone, or one civil-time refuses, the UTC
 *  day, answered with `zone: null` so the answer says which day it read. */
export function localDayOf(ms, zone) {
  if (typeof zone === "string" && zone) {
    try {
      const date = localDay(instantText(ms), zone);
      if (typeof date === "string") {
        const a = dayRange(date, date, zone), b = dayRange(nextDate(date), nextDate(date), zone);
        if (a && typeof a.start === "string" && b && typeof b.start === "string")
          return { date, zone, start: Date.parse(a.start), next: Date.parse(b.start) };
      }
    } catch { /* read as the UTC day below */ }
  }
  const start = Math.floor(ms / DAY_MS) * DAY_MS;
  return { date: instantText(start).slice(0, 10), zone: null, start, next: start + DAY_MS };
}

/** The active jurisdiction view's time zone (record-core's `jurisdiction_profiles`, combined by `jurisdictions`), or
 *  null when none is held. */
export function viewZone(record) {
  try {
    const ids = record && typeof record.getSetting === "function" ? record.getSetting("jurisdiction_profiles") : null;
    const c = Array.isArray(ids) && ids.length ? combine(ids) : null;
    const z = c && c.ok && c.view && c.view.time_zone ? c.view.time_zone.value : null;
    return typeof z === "string" && z ? z : null;
  } catch { return null; }
}

/** R10: the rank. `items` are `{kind, id, waitingSince?, cadenceMs?}` (`kind` one of `address`, `bundle`, `request`,
 *  as intent's `servesOf` names subjects, or `sweep`, `"<bundle>#<id>"` (link-sweep R4), which serves what its
 *  bundle serves, so intent is asked of that bundle; `waitingSince` the instant the item began to wait, in ms). Answers the items
 *  reordered, each with `rank: {overdue, gaps, aspirations, waited_ms}`: work that has waited longer than one whole
 *  cadence of its own first, then work serving an objective's open gap, then work serving an aspiration in force,
 *  then longest-waiting; ties keep the order given. No aspiration ranks above another (intent R12). `serves` is
 *  intent's `servesOf` (R28); one that throws or answers nothing ranks every item by its wait alone. */
export function rankBy(serves, items, now) {
  const list = Array.isArray(items) ? items.filter((x) => x && typeof x === "object") : [];
  const named = { addresses: [], bundles: [], requests: [] };
  const bucket = { address: "addresses", bundle: "bundles", request: "requests" };
  /* the subject intent is asked about: a sweep's is its bundle, the part of its full name before `#` */
  const subject = (x) => (x.kind === "sweep" && typeof x.id === "string" && x.id.includes("#")
    ? ["bundle", x.id.slice(0, x.id.indexOf("#"))] : [x.kind, x.id]);
  for (const x of list) { const [k, id] = subject(x); if (bucket[k] && !named[bucket[k]].includes(id)) named[bucket[k]].push(id); }
  let served = [];
  try { const a = serves ? serves(named) : null; served = (a && Array.isArray(a.serves)) ? a.serves : []; } catch { served = []; }
  const of = new Map(served.map((s) => [`${s.kind}\u0000${s.id}`, s]));
  const t = Number.isFinite(now) ? now : Date.now();
  const ranked = list.map((x, i) => {
    const [k, id] = subject(x);
    const s = of.get(`${k}\u0000${id}`) || {};
    const waited = Number.isFinite(x.waitingSince) ? Math.max(0, t - x.waitingSince) : 0;
    const overdue = Number.isFinite(x.cadenceMs) && x.cadenceMs > 0 && waited > x.cadenceMs;
    return { x, i, rank: { overdue, gaps: (s.gaps || []).length > 0, aspirations: (s.aspirations || []).length > 0, waited_ms: waited } };
  });
  const tier = (r) => (r.overdue ? 0 : r.gaps ? 1 : r.aspirations ? 2 : 3);
  ranked.sort((a, b) => tier(a.rank) - tier(b.rank) || b.rank.waited_ms - a.rank.waited_ms || a.i - b.i);
  return ranked.map(({ x, rank }) => ({ ...x, rank }));
}

export class Scheduler {
  #storage; #env; #owners; #registered = new Map(); #registeredOrder = [];
  /* deadline-recheck: the firing instant of its last tick that marked nothing, or null (see the consumer). */
  #deadlineIdleAt = null;
  /* R21, the daily consumers: `{[name]: {day, cursor, more}}` as the value `sched_daily` holds it (null until read),
     and the names whose last pass found nothing to work over, which want no wake until the instance's next start. */
  #daily = null; #dailyIdle = new Set(); #zone;

  /** `storage` is the Durable Object's storage (its alarm, and the probe seam's and the daily consumers' values);
   *  `owners` answers each consumer's owner (`retrieval`, `monitoring`, `connections`, `progressions`, `aiRuns`,
   *  `captureRequests`, `calibration`, `bias`, `intent`, `reevaluation`, `networkNotices`, `linkSweep`, `following`,
   *  `duties`, `people`, `moneyChecks`, `answers`, `inquiry`), each a function returning the owner, so an owner is
   *  reached only when the registry is built; `zone()` answers the group's time zone or null (R21's local day). */
  constructor({ storage, env = null, owners = {}, zone = null } = {}) {
    this.#storage = storage;
    this.#env = env || {};
    this.#owners = owners;
    this.#zone = typeof zone === "function" ? zone : () => null;
  }

  #day(now) { let z = null; try { z = this.#zone(); } catch { z = null; } return localDayOf(now, z); }
  #dailyOwned() { return DAILY_OWNER.some(([, o]) => this.#owners[o]); }
  /* The daily consumers' state, read once per instance before a firing, an arm or the start reads a due or a wake. */
  async #loadDaily() {
    if (this.#daily || !this.#dailyOwned()) return;
    let v = null;
    try { v = typeof this.#storage.get === "function" ? await this.#storage.get(DAILY_KEY) : null; } catch { v = null; }
    this.#daily = v && typeof v === "object" ? v : {};
  }

  /* R21: a consumer whose owner states no due or wake. `run(now, cursor)` calls the owner and answers its answer;
     `read(answer)` answers `{more, cursor, nothing}`: whether the pass is under way, where it resumes, and whether it
     found nothing at all to work over. Due at the local day's start until a pass finishes that day; due at every
     firing while one is under way; a pass that throws or is refused counts the day as run, so it never spins (R3). */
  #dailyConsumer(name, key, run, read) {
    const st = () => (this.#daily && this.#daily[name]) || {};
    const want = (now, today) => {
      const s = st();
      if (s.more) return now;
      if (this.#dailyIdle.has(name)) return null;
      return s.day === today.date ? null : today.start;
    };
    return {
      due: (now) => want(now, this.#day(now)),
      wake: (now) => { const today = this.#day(now); const w = want(now, today); return w !== null || this.#dailyIdle.has(name) ? w : today.next; },
      tick: async (now) => {
        const today = this.#day(now), s = st();
        const settle = (v) => { this.#daily = { ...(this.#daily || {}), [name]: v }; };
        let r;
        try { r = await run(now, s.more ? s.cursor ?? null : null); }
        catch (e) { settle({ day: today.date, cursor: null, more: false }); throw e; }
        const ok = !(r && r.ok === false);
        const { more = false, cursor = null, nothing = false } = ok ? read(r || {}) : {};
        settle(more ? { day: s.day ?? null, cursor, more: true } : { day: today.date, cursor: null, more: false });
        if (!more && nothing) this.#dailyIdle.add(name); else this.#dailyIdle.delete(name);
        return { [key]: { ...(r && typeof r === "object" ? r : { answer: r }), local_day: { date: today.date, zone: today.zone } } };
      } };
  }

  #owner(name) { const f = this.#owners[name]; return typeof f === "function" ? f() : null; }

  /* ---- R5, R6: this module's own consumers, each calling its owner's services ---- */
  #own() {
    const o = (n) => this.#owner(n);
    const due = (n) => n > 0;
    /* An owner's due answered as an instant, or as `true` for "now". */
    const instant = (v, now) => (v === true ? now : typeof v === "number" && Number.isFinite(v) ? v : null);
    const c = {};
    if (this.#owners.monitoring) {
      c["archive-monitor"] = {   /* monitoring R20 */
        due: (now) => instant(o("monitoring").archiveDue(now), now), wake: (now) => o("monitoring").archiveWake(now),
        tick: async (now, rank) => ({ monitor: await o("monitoring").archiveTick(now, rank) }) };
      c["monitor-cadence"] = {   /* monitoring R19 */
        due: (now) => instant(o("monitoring").cadenceDue(now), now), wake: (now) => o("monitoring").cadenceWake(now),
        tick: async (now, rank) => ({ monitorcadence: await o("monitoring").cadenceTick(now, rank) }) };
      /* monitoring R34, R35, its due and wake R50. An entry R34 cannot mark stays `pending`, so R50's wake stays in
         the past and every reconcile would find it due again at once: the alarm would spin. So when a tick marks
         nothing, a wake at or before that tick is held to the start of the next UTC day, R50's own granularity (the
         first alarm of a day), never an interval of this module's (R7); a tick that marks something releases it. */
      const held = (w) => {
        if (w === null || w === undefined || !Number.isFinite(w)) return null;
        const idle = this.#deadlineIdleAt;
        return idle !== null && w <= idle ? Math.floor(idle / DAY_MS) * DAY_MS + DAY_MS : w;
      };
      c["deadline-recheck"] = {
        due: (now) => { const d = held(instant(o("monitoring").deadlineRecheckDue(now), now)); return d !== null && d <= now ? d : null; },
        wake: (now) => held(o("monitoring").deadlineRecheckWake(now)),
        tick: async (now) => {
          this.#deadlineIdleAt = now;
          const r = await o("monitoring").deadlineRecheck(now);
          if (r && r.ok !== false && Array.isArray(r.marked) && r.marked.length) this.#deadlineIdleAt = null;
          return { deadlinerecheck: r };
        } };
    }
    if (this.#owners.linkSweep) c["gathering-sweep"] = {   /* link-sweep R4: the ratified sweeps, batch-bounded, given the rank (R10) */
      due: (now) => instant(o("linkSweep").sweepDue(now), now), wake: (now) => o("linkSweep").sweepWake(now),
      tick: async (now, rank) => ({ gatheringsweep: await o("linkSweep").sweepTick(now, rank) }) };
    if (this.#owners.retrieval) c["selection-sweep"] = {   /* retrieval R22, its wake R51 */
      due: (now) => now, wake: (now) => o("retrieval").sweepWake(now),
      tick: () => ({ swept: o("retrieval").sweepSelections() }) };
    if (this.#owners.connections) c["connection-derive"] = {   /* connections R18 */
      due: (now) => now, wake: (now) => o("connections").wake(now),
      tick: () => ({ connderive: o("connections").sweep() }) };
    if (this.#owners.progressions) c["overdue-scan"] = {   /* progressions R17 */
      due: (now) => now, wake: (now) => o("progressions").overdueScan(now).next_deadline,
      tick: (now) => ({ overduescan: o("progressions").overdueScan(now) }) };
    if (this.#owners.aiRuns) {
      c["ai-run-reap"] = {   /* ai-runs R15 */
        due: (now) => (due(o("aiRuns").reapDue(now)) ? now : null), wake: (now) => o("aiRuns").reapWake(now),
        tick: (now) => ({ airunreap: o("aiRuns").reap(now) }) };
      c["ai-run-wake"] = {   /* ai-runs R16, R17, R41 */
        due: (now) => (due(o("aiRuns").wakeDue(now)) ? now : null), wake: (now) => o("aiRuns").wakeWake(now),
        tick: async (now) => ({ airunwake: await o("aiRuns").wake(now) }) };
    }
    if (this.#owners.captureRequests) c["capture-request-drain"] = {   /* capture-requests R11, its due and wake R37 */
      due: (now) => (due(o("captureRequests").drainPending()) ? now : null),
      wake: (now) => (due(o("captureRequests").drainPending()) ? now + o("captureRequests").drainIntervalMs() : null),
      tick: async (now, rank) => ({ capturerequests: await o("captureRequests").drain({ actor: "alarm", now, rank }) }) };
    if (this.#owners.calibration) c["calibration-reprobe"] = {   /* calibration R9, given the grace (K74) */
      due: (now) => (due(o("calibration").calibrationDue(now)) ? now : null),
      wake: (now) => o("calibration").calibrationWake(now, SCHED_GRACE_MS),
      tick: (now) => ({ calibration: o("calibration").calibrationTick(now) }) };
    if (this.#owners.bias) c["bias-debt"] = {   /* bias R33, its due and wake R41 */
      due: (now) => o("bias").biasDebtDue(now), wake: (now) => o("bias").biasDebtWake(now),
      tick: async (now, rank) => ({ biasdebt: await o("bias").biasDebtSweep(now, rank) }) };
    if (this.#owners.intent) c["intent-age"] = {   /* intent R17, its due and wake R27 */
      due: (now) => o("intent").ageDue(now), wake: (now) => o("intent").ageWake(now),
      tick: async (now) => ({ intentage: await o("intent").ageSurfaced(now) }) };
    if (this.#owners.reevaluation) c["notice-sweep"] = {   /* reevaluation R25 */
      due: (now) => o("reevaluation").noticeSweepDue(now), wake: (now) => o("reevaluation").noticeSweepWake(now),
      tick: (now) => ({ noticesweep: o("reevaluation").noticeSweep(now) }) };
    if (this.#owners.networkNotices) {
      c["working-on-seal"] = {   /* network-notices R14, R15: the weekly seal */
        due: (now) => instant(o("networkNotices").sealDue(now), now), wake: (now) => o("networkNotices").sealWake(now),
        tick: async (now) => ({ workingonseal: await o("networkNotices").sealTick(now) }) };
      c["working-on-attest"] = {   /* network-notices R12, R17: the monthly, closed and lapsed attestations, the retried openings */
        due: (now) => instant(o("networkNotices").attestDue(now), now), wake: (now) => o("networkNotices").attestWake(now),
        tick: async (now) => ({ workingonattest: await o("networkNotices").attestTick(now) }) };
    }
    /* ---- R21: the consumers of T33's new work ---- */
    /* An owner's due as an instant: `true` is now, an instant (ms or text) is itself, anything else none. */
    const dueOf = (v, now) => (v === true ? now : msOf(v));
    /* answers R17's due is how many questions are due: any is now. */
    const counted = (v, now) => (typeof v === "number" && v > 0 ? now : null);
    if (this.#owners.following) c["follow"] = {   /* following R12, R13: batch-bounded, given the rank (R10) */
      due: (now) => dueOf(o("following").followDue(now), now), wake: (now) => msOf(o("following").followWake(now)),
      tick: async (now, rank) => ({ follow: await o("following").followTick(now, rank) }) };
    if (this.#owners.duties) c["duty-transitions"] = this.#dailyConsumer("duty-transitions", "dutytransitions",   /* duties R13 */
      (now, cursor) => o("duties").recordTransitions({ asOf: instantText(now), ...(cursor ? { cursor } : {}) }),
      (r) => ({ more: r.done === false, cursor: r.cursor ?? null, nothing: r.duties_read === 0 }));
    if (this.#owners.people) c["interest-checks"] = this.#dailyConsumer("interest-checks", "interestchecks",   /* people R23 */
      () => o("people").evaluateChecks({}),   /* people holds its own cursor */
      (r) => ({ more: r.remaining === true, cursor: null, nothing: r.evaluated === 0 }));
    if (this.#owners.moneyChecks) c["money-detectors"] = this.#dailyConsumer("money-detectors", "moneydetectors",   /* money-checks R6 */
      (now, cursor) => o("moneyChecks").runDetectors({ budgetMs: DETECTORS_BUDGET_MS, cursor }),
      (r) => ({ more: r.remaining === true || !!r.cursor, cursor: r.cursor ?? null, nothing: r.detectors === 0 }));
    /* answers R17 and inquiry R57 read `now` as instant text and answer wakes as instant text. A consumer due now
       wants now, whatever its owner's wake says of later days. */
    if (this.#owners.answers) c["standing-questions"] = {
      due: (now) => counted(o("answers").standingDue(instantText(now)), now),
      wake: (now) => (counted(o("answers").standingDue(instantText(now)), now) !== null ? now : msOf(o("answers").standingWake(instantText(now)))),
      tick: async (now) => ({ standingquestions: await o("answers").standingTick(instantText(now)) }) };
    if (this.#owners.inquiry) c["dated-waits"] = {
      due: (now) => (o("inquiry").datedWaitsDue(instantText(now)) === true ? now : null),
      wake: (now) => (o("inquiry").datedWaitsDue(instantText(now)) === true ? now : msOf(o("inquiry").datedWaitsWake(instantText(now)))),
      tick: async (now) => ({ datedwaits: await o("inquiry").datedWaitsTick(instantText(now)) }) };
    return c;
  }

  /* ---- R8 ---- */

  /** A later module registers each of its consumers once, at start. A name already held (registered, or one of this
   *  module's own) is refused `CONSUMER_DECLARED`; a consumer that is not `{name, key, due, wake, tick}` with a key
   *  outside the answer's own fields is refused `CONSUMER_MALFORMED`. Never throws. */
  register(module, consumer) {
    const c = consumer && typeof consumer === "object" ? consumer : null;
    if (typeof module !== "string" || !module || !c || typeof c.name !== "string" || !c.name
        || typeof c.due !== "function" || typeof c.wake !== "function" || typeof c.tick !== "function")
      return { ok: false, reason: "CONSUMER_MALFORMED", module: typeof module === "string" ? module : null,
               name: c && typeof c.name === "string" ? c.name : null };
    const key = typeof c.key === "string" && c.key ? c.key : (SCHEDULER_KEYS[c.name] || c.name);
    if (this.#registered.has(c.name) || this.#own()[c.name])
      return { ok: false, reason: "CONSUMER_DECLARED", module, name: c.name };
    if (ANSWER_FIELDS.has(key) || this.registry(null).some((r) => r.key === key))
      return { ok: false, reason: "CONSUMER_MALFORMED", module, name: c.name,
               detail: `the key '${key}' is one of the answer's own fields or another consumer's` };
    this.#registered.set(c.name, { name: c.name, key, module, due: c.due, wake: c.wake, tick: c.tick });
    this.#registeredOrder.push(c.name);
    return { ok: true, module, name: c.name, key, placed: SCHEDULER_ORDER.includes(c.name) ? "R5" : "appended" };
  }

  /** The registry, in R5's order, then the registered consumers R5 does not name in the order they registered (the
   *  host registers the modules in their total order), then the test probes (R13). */
  registry(probe = null) {
    const own = this.#own();
    const reg = [];
    for (const name of SCHEDULER_ORDER) {
      const c = own[name] ? { name, key: SCHEDULER_KEYS[name], module: "scheduler", ...own[name] } : this.#registered.get(name);
      if (c) reg.push(c);
    }
    for (const name of this.#registeredOrder) if (!SCHEDULER_ORDER.includes(name)) reg.push(this.#registered.get(name));
    for (const name of Object.keys(probe || {})) {
      if (reg.some((c) => c.name === name)) continue;
      const st = probe[name];
      reg.push({ name, key: name, probe: true,
        due: () => (st.remaining > 0 ? st.next : null),
        wake: () => (st.remaining > 0 ? st.next : null),
        tick: (now) => { st.fires.push(now); st.remaining -= 1;
                         st.next = st.remaining > 0 ? st.next + st.period : null; return { probe: name }; } });
    }
    return reg;
  }

  /** The names of the consumers in the registry as it stands, in order (the probes excluded). */
  consumers() { return this.registry(null).map((c) => c.name); }

  /* ---- R10 ---- */

  /** The rank a batch-bounded tick receives: `rank(items, now?)` orders its due work by what intent's `servesOf`
   *  answers each item serves (`rankBy`). */
  rank(items, now = Date.now()) {
    const intent = this.#owners.intent ? this.#owner("intent") : null;
    return rankBy(intent && typeof intent.servesOf === "function" ? (named) => intent.servesOf(named) : null, items, now);
  }

  /* ---- R1–R3 ---- */

  /** The runtime's `alarm()` is `onAlarm(Date.now())`. */
  async alarm() { return await this.onAlarm(); }

  async onAlarm(now = Date.now()) {
    const probe = await this.#probeState(now, true);
    await this.#loadDaily();
    const reg = this.registry(probe);
    const answers = {};
    const probes = [];
    const rank = (items, at = now) => this.rank(items, at);
    for (const c of reg) {
      let d;
      try { d = c.due(now); } catch (e) { answers[c.key] = { error: message(e) }; continue; }
      if (d === null || d === undefined || d > now + SCHED_GRACE_MS) continue;
      let r;
      /* Awaited, so an asynchronous consumer's work completes inside the alarm. */
      try { r = await c.tick(now, RANKED.includes(c.name) ? rank : undefined); }
      catch (e) { answers[c.key] = { error: message(e) }; continue; }
      if (c.probe) { probes.push(c.name); continue; }
      const v = r && typeof r === "object" && c.key in r ? r[c.key] : r;
      if (v !== null && v !== undefined) answers[c.key] = v;
    }
    /* Reconciled over the FULL registry, not only the consumers that ticked, and authoritatively: a fired alarm is
       spent, so the fresh earliest wake is set outright (R1, R16). */
    const nextAt = await this.#reconcile(now, reg, true, answers);
    if (probe) await this.#storage.put(PROBE_KEY, probe);
    if (this.#daily && DAILY.some((n) => reg.some((c) => c.name === n)) && typeof this.#storage.put === "function") {
      /* a storage that cannot hold the value keeps it for this instance alone; the firing still answers */
      try { await this.#storage.put(DAILY_KEY, this.#daily); } catch { /* kept in memory */ }
    }
    /* R2: the drain's counts (zero when it did not tick); a drain that threw is answered under its key (R3). */
    const { swept = 0, drain = null, ...rest } = answers;
    const d = drain && !drain.error ? { ...DRAIN_ZERO, ...drain } : DRAIN_ZERO;
    const count = (x) => (Array.isArray(x) ? x.length : Number(x) || 0);
    return { swept, drained: d.drained, created: count(d.created), folded: count(d.folded), refused: count(d.refused),
             waiting: count(d.waiting), remaining: d.remaining, rearmed: nextAt !== null, nextAt, probes,
             ...(drain && drain.error ? { drain } : {}), ...rest };
  }

  /** Sets the one alarm to the earliest wake any consumer wants, or deletes it when none does. `exact` sets it
   *  outright (after a firing); otherwise it is only ever pulled earlier (R4). A consumer whose wake throws wants
   *  nothing and, when `errors` is given, is answered under its key (R3). */
  async #reconcile(now, reg, exact, errors = null) {
    const wants = [];
    for (const c of reg) {
      let w;
      try { w = c.wake(now); } catch (e) { if (errors) errors[c.key] = { error: message(e) }; continue; }
      if (w !== null && w !== undefined && Number.isFinite(w)) wants.push(w);
    }
    if (!wants.length) { await this.#storage.deleteAlarm(); return null; }
    const want = Math.min(...wants);
    if (exact) { await this.#storage.setAlarm(want); return want; }
    const at = await this.#storage.getAlarm();
    if (at === null || at === undefined || at > want) { await this.#storage.setAlarm(want); return want; }
    return at;
  }

  /* ---- R4, R11 ---- */

  /** The producers' door: reconciles without firing, never pushing a set alarm later. Runs no tick and writes no
   *  work; answers the alarm as it stands. */
  async arm(now = Date.now()) {
    const probe = await this.#probeState(now, true);
    await this.#loadDaily();
    const at = await this.#reconcile(now, this.registry(probe), false);
    if (probe) await this.#storage.put(PROBE_KEY, probe);
    return at;
  }

  /** At the instance's start: reconciles as `arm` does, so an alarm lost to a failed firing or a reset is re-derived
   *  from durable state. It starts no probe that was not already armed. A daily consumer found idle before is asked
   *  again (R21): its owner's work may have grown since. */
  async start(now = Date.now()) {
    const probe = await this.#probeState(now, false);
    this.#dailyIdle.clear();
    await this.#loadDaily();
    return await this.#reconcile(now, this.registry(probe), false);
  }

  /* ---- R13: the test seam, inert unless SCHED_PROBE is set ---- */

  #probeSpecs() {
    try {
      const s = JSON.parse((this.#env && this.#env.SCHED_PROBE) || "[]");
      return Array.isArray(s) ? s.filter((p) => p && typeof p.name === "string" && p.name
        && Number.isFinite(p.period) && p.period > 0 && Number.isFinite(p.fires)) : [];
    } catch { return []; }
  }
  async #probeState(now, create) {
    const specs = this.#probeSpecs();
    if (!specs.length) return null;
    let st = await this.#storage.get(PROBE_KEY);
    if (!st && !create) return null;
    if (!st) {
      st = {};
      for (const s of specs) st[s.name] = { period: s.period, remaining: s.fires, next: now + s.period, fires: [] };
      await this.#storage.put(PROBE_KEY, st);
    }
    return st;
  }
  async probeArm(now = Date.now()) { return await this.arm(now); }
  async probeLog() { return (await this.#storage.get(PROBE_KEY)) || {}; }
  async alarmAt() { return await this.#storage.getAlarm(); }

  /* ---- R9: the earlier producers' notices ---- */

  /** Registers `arm` with each notice an earlier producer offers (K72 (9), K206). Each listener only schedules.
   *  Whether monitoring is configured is asked of the `monitoring` owner when a notice arrives. */
  listenTo({ retrieval, bias, promotion, capture, progressions, calibration, aiRuns, captureRequests, entities, inquiry } = {}) {
    const arm = () => this.arm();
    /* A notice told inside its owner's transaction, where no storage call may be awaited: the arm is deferred until
       the transaction has returned, once however many notices it told. */
    const deferred = () => {
      let queued = null;
      return () => { queued ||= Promise.resolve().then(() => { queued = null; return arm(); }).catch(() => null); return undefined; };
    };
    const monitoring = (ask) => {
      if (!this.#owners.monitoring) return false;
      try { const m = this.#owner("monitoring"); return !!(m && ask(m)); } catch { return false; }
    };
    const configured = () => monitoring((m) => m.configured());
    /* monitoring R50: an action holding a `pending` clock entry wants the deadline re-check's wake. */
    const clockPending = () => monitoring((m) => m.deadlineRecheckWake(Date.now()) != null);
    /* link-sweep R4: a ratified sweep due or waiting to run wants the gathering sweep's wake. */
    const sweepPending = () => {
      if (!this.#owners.linkSweep) return false;
      try { const l = this.#owner("linkSweep"); return !!(l && l.sweepWake(Date.now()) != null); } catch { return false; }
    };
    const out = {};
    if (retrieval) out.retrieval = retrieval.onSelectionCreated("scheduler", arm);                 /* retrieval R52 */
    if (bias) out.bias = bias.onLensChange("scheduler", () => (bias.biasDebtDue(Date.now()) === null ? null : arm()));   /* bias R23 */
    /* promotion R45: a promotion may leave a bundle monitored, a lens moved, an action holding a `pending` clock entry
       or a sweep ratified or re-ratified; the reconcile weighs monitoring's, the debt's, the re-check's and the
       sweep's own wakes, so the arm is asked whenever any could want one. */
    if (promotion) out.promotion = promotion.onCommitted("scheduler", async () =>
      (configured() || clockPending() || sweepPending() || (bias && bias.biasDebtDue(Date.now()) !== null) ? await arm() : null));
    if (capture) out.capture = capture.on("source-outcome", "scheduler",   /* capture R44 */
      async (o) => (o && o.counted && o.outcome !== "success" && configured() ? await arm() : null));
    if (progressions) out.progressions = progressions.onThreaded("scheduler", () => arm());   /* progressions R33 */
    /* N223: each of these acts creates its consumer's work, so each arms outright; the reconcile reads the owner's
       wake (the re-probe's, the reaper's, the drain's). */
    if (calibration) {
      out.calibrationSubject = calibration.onSubjectRegistered("scheduler", () => arm());   /* calibration R18 */
      out.calibrationSignal = calibration.onSignalRecorded("scheduler", () => arm());       /* calibration R19 */
    }
    if (aiRuns) out.aiRuns = aiRuns.onRunOpened("scheduler", () => arm());                     /* ai-runs R43 */
    if (captureRequests) out.captureRequests = captureRequests.onRequestFiled("scheduler", () => arm());   /* capture-requests R44 */
    /* entities R13: its listeners run inside the resolving transaction, where no storage call may be awaited, so the
       arm is deferred until the transaction has returned, once however many resolutions it inserted or raised; the
       reconcile then reads connections' wake over the entity it marked (connections R17, R18). */
    if (entities) out.entities = entities.onResolved("scheduler", deferred());
    /* inquiry R54 (K1601): a dated wait set or re-dated, told inside the promotion's transaction; the reconcile then
       reads the dated waits' wake (R21). */
    if (inquiry) out.inquiry = inquiry.onWaitSet("scheduler", deferred());
    return out;
  }
}

/* R21: each daily consumer and the owner it calls. */
const DAILY_OWNER = Object.freeze([["duty-transitions", "duties"], ["interest-checks", "people"], ["money-detectors", "moneyChecks"]]);

const instances = new WeakMap();

/** The one scheduler of a Durable Object (K61). `deps.owners` replaces the default owners (a test's). */
export function schedulerOf(ctx, env = null, deps = {}) {
  let s = instances.get(ctx);
  if (!s) {
    const e = env || {};
    const owners = deps.owners || {
      retrieval: () => retrievalOf(ctx), monitoring: () => monitoringOf(ctx), connections: () => connectionsOf(ctx), progressions: () => progressionsOf(ctx, { env: e }),
      aiRuns: () => aiRunsOf(ctx, e), captureRequests: () => captureRequestsOf(ctx), calibration: () => calibrationOf(ctx),
      bias: () => biasOf(ctx), intent: () => intentOf(ctx), reevaluation: () => reevaluationOf(ctx),
      networkNotices: () => networkNoticesOf(ctx, { env: e }), linkSweep: () => linkSweepOf(ctx),
      duties: () => dutiesOf(ctx), people: () => peopleOf(ctx), moneyChecks: () => moneyChecksOf(ctx),
      answers: () => answersOf(ctx), inquiry: () => inquiryOf(ctx),
    };
    const zone = deps.zone || (() => viewZone(recordOf(ctx)));
    s = new Scheduler({ storage: deps.storage || ctx.storage, env: e, owners, zone });
    instances.set(ctx, s);
    if (!deps.owners)
      s.listenTo({ retrieval: retrievalOf(ctx), bias: biasOf(ctx), promotion: promotionOf(ctx), capture: captureOf(ctx),
                   progressions: progressionsOf(ctx, { env: e }), calibration: calibrationOf(ctx), aiRuns: aiRunsOf(ctx, e),
                   captureRequests: captureRequestsOf(ctx), entities: entitiesOf(ctx), inquiry: inquiryOf(ctx) });
  }
  return s;
}
