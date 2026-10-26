/* scheduler's test world: a Durable Object storage that holds the one alarm and a key-value map and logs every call,
   and owners whose services answer what a test sets and record every call made to them. */
import { Scheduler } from "../../../src/scheduler/index.mjs";
import { world as monitoringWorld, NOW_MS as MONITORING_NOW } from "../monitoring/fixture.mjs";
import { batchTickAnswers } from "../file-safety/fixtures.mjs";
import { recordTransitionsAnswers } from "../duties/fixtures.mjs";

/* What each owner answers when a test sets nothing, taken from the owner's own code: monitoring's ticks over an empty world,
   file-safety's five batches on an empty store, duties' finished pass over an empty record. Cloned at every answer. */
const monitoringIdle = monitoringWorld();
const MONITORING = { archiveTick: await monitoringIdle.m.archiveTick(MONITORING_NOW, null), cadenceTick: await monitoringIdle.m.cadenceTick(MONITORING_NOW, null),
                     deadlineRecheck: await monitoringIdle.m.deadlineRecheck(MONITORING_NOW) };
const FILE_IDLE = await batchTickAnswers();
const DUTIES_IDLE = recordTransitionsAnswers().empty;

export function storage() {
  const kv = new Map();
  const beat = new Map();
  const log = [];
  let alarm = null;
  return {
    log, kv,
    get alarm() { return alarm; },
    set alarm(v) { alarm = v; },
    async getAlarm() { log.push(["getAlarm"]); return alarm; },
    async setAlarm(t) { log.push(["setAlarm", t]); alarm = t; },
    async deleteAlarm() { log.push(["deleteAlarm"]); alarm = null; },
    async get(k) { if (k === "sched_beat") return beat.get(k); log.push(["get", k]); return kv.has(k) ? structuredClone(kv.get(k)) : undefined; },
    /* the heartbeat (R28, R29) is the one value every firing writes; it is kept in `beat`, outside `kv` and `log`, so the tests
       that say what else a path writes or holds (R17, R18) keep saying it; the R28 tests read and seed `beat.get("sched_beat")` */
    beat,
    async put(k, v) { if (k === "sched_beat") { beat.set(k, v); return; } log.push(["put", k]); kv.set(k, structuredClone(v)); },
  };
}

/** Owners whose due, wake and tick answer the values in `set` (by consumer name: `{due, wake, tick, throws}`), and
 *  record each call in `calls` as `[owner.method, ...args]`. A consumer with no entry is idle: due and wake null. */
export function owners(set = {}) {
  const calls = [];
  const v = (name, what, now, dflt = null) => {
    const s = set[name] || {};
    if (s.throws === what) throw new Error(`${name} ${what} broke`);
    const x = s[what];
    return typeof x === "function" ? x(now) : x === undefined ? dflt : x;
  };
  const rec = (m, args, r) => { calls.push([m, ...args]); return r; };
  const o = {
    retrieval: { sweepWake: (now) => rec("retrieval.sweepWake", [now], v("selection-sweep", "wake", now)),
                 sweepSelections: () => rec("retrieval.sweepSelections", [], v("selection-sweep", "tick", null, 0)) },
    monitoring: {   /* stand-ins shaped as monitoring R19, R20 (K259) */
      configured: () => rec("monitoring.configured", [], v("monitoring", "configured", null, true)),
      archiveDue: (now) => rec("monitoring.archiveDue", [now], v("archive-monitor", "due", now, now)),
      archiveWake: (now) => rec("monitoring.archiveWake", [now], v("archive-monitor", "wake", now)),
      archiveTick: async (now, rank) => rec("monitoring.archiveTick", [now, rank], v("archive-monitor", "tick", now,
        structuredClone(MONITORING.archiveTick))),
      cadenceDue: (now) => rec("monitoring.cadenceDue", [now], v("monitor-cadence", "due", now)),
      cadenceWake: (now) => rec("monitoring.cadenceWake", [now], v("monitor-cadence", "wake", now)),
      cadenceTick: async (now, rank) => rec("monitoring.cadenceTick", [now, rank], v("monitor-cadence", "tick", now, structuredClone(MONITORING.cadenceTick))),
      deadlineRecheckDue: (now) => rec("monitoring.deadlineRecheckDue", [now], v("deadline-recheck", "due", now)),   /* R50 */
      deadlineRecheckWake: (now) => rec("monitoring.deadlineRecheckWake", [now], v("deadline-recheck", "wake", now)),
      deadlineRecheck: async (now) => rec("monitoring.deadlineRecheck", [now], v("deadline-recheck", "tick", now,
        structuredClone(MONITORING.deadlineRecheck))),   /* R34, R35 */
    },
    linkSweep: {   /* link-sweep R4 */
      sweepDue: (now) => rec("linkSweep.sweepDue", [now], v("gathering-sweep", "due", now)),
      sweepWake: (now) => rec("linkSweep.sweepWake", [now], v("gathering-sweep", "wake", now)),
      sweepTick: async (now, rank) => rec("linkSweep.sweepTick", [now, rank], v("gathering-sweep", "tick", now, { ran: [] })),
    },
    connections: { wake: (now) => rec("connections.wake", [now], v("connection-derive", "wake", now)),
                   sweep: () => rec("connections.sweep", [], v("connection-derive", "tick", null, { entities: 0, remaining: 0, swept: [] })) },
    progressions: { overdueScan: (now) => rec("progressions.overdueScan", [now],
                      { overdue_count: 0, next_deadline: v("overdue-scan", "wake", now), next_deadline_at: null }) },
    aiRuns: {
      reapDue: (now) => rec("aiRuns.reapDue", [now], v("ai-run-reap", "due", now, 0)),
      reapWake: (now) => rec("aiRuns.reapWake", [now], v("ai-run-reap", "wake", now)),
      reap: (now) => rec("aiRuns.reap", [now], v("ai-run-reap", "tick", now, { at: now, lapsed: 0, reaped: [] })),
      wakeDue: (now) => rec("aiRuns.wakeDue", [now], v("ai-run-wake", "due", now, 0)),
      wakeWake: (now) => rec("aiRuns.wakeWake", [now], v("ai-run-wake", "wake", now)),
      wake: async (now) => rec("aiRuns.wake", [now], v("ai-run-wake", "tick", now, { held: [], woken: [] })),
    },
    captureRequests: {
      drainPending: () => rec("captureRequests.drainPending", [], v("capture-request-drain", "due", null, 0)),
      drainIntervalMs: () => rec("captureRequests.drainIntervalMs", [], v("capture-request-drain", "wake", null, 60000)),
      drain: async (a) => rec("captureRequests.drain", [a], v("capture-request-drain", "tick", a.now, { drained: 0 })),
    },
    calibration: {
      calibrationDue: (now) => rec("calibration.calibrationDue", [now], v("calibration-reprobe", "due", now, 0)),
      calibrationWake: (now, grace) => rec("calibration.calibrationWake", [now, grace], v("calibration-reprobe", "wake", now)),
      calibrationTick: (now) => rec("calibration.calibrationTick", [now], v("calibration-reprobe", "tick", now, { due: [] })),
    },
    bias: {
      biasDebtDue: (now) => rec("bias.biasDebtDue", [now], v("bias-debt", "due", now)),
      biasDebtWake: (now) => rec("bias.biasDebtWake", [now], v("bias-debt", "wake", now)),
      biasDebtSweep: async (now, rank) => rec("bias.biasDebtSweep", [now, rank], v("bias-debt", "tick", now, { raised: 0 })),
    },
    intent: {
      ageDue: (now) => rec("intent.ageDue", [now], v("intent-age", "due", now)),
      ageWake: (now) => rec("intent.ageWake", [now], v("intent-age", "wake", now)),
      ageSurfaced: async (now) => rec("intent.ageSurfaced", [now], v("intent-age", "tick", now, { aged: [] })),
      servesOf: (named) => rec("intent.servesOf", [named], v("serves", "tick", null, { ok: true, serves: [], truncated: false })),
    },
    reevaluation: {
      noticeSweepDue: (now) => rec("reevaluation.noticeSweepDue", [now], v("notice-sweep", "due", now)),
      noticeSweepWake: (now) => rec("reevaluation.noticeSweepWake", [now], v("notice-sweep", "wake", now)),
      noticeSweep: (now) => rec("reevaluation.noticeSweep", [now], v("notice-sweep", "tick", now, { pending: false })),
    },
    networkNotices: {   /* network-notices R12, R14, R15, R17 */
      sealDue: (now) => rec("networkNotices.sealDue", [now], v("working-on-seal", "due", now)),
      sealWake: (now) => rec("networkNotices.sealWake", [now], v("working-on-seal", "wake", now)),
      sealTick: async (now) => rec("networkNotices.sealTick", [now], v("working-on-seal", "tick", now, { ok: true, sealed: [] })),
      attestDue: (now) => rec("networkNotices.attestDue", [now], v("working-on-attest", "due", now)),
      attestWake: (now) => rec("networkNotices.attestWake", [now], v("working-on-attest", "wake", now)),
      attestTick: async (now) => rec("networkNotices.attestTick", [now], v("working-on-attest", "tick", now,
        { ok: true, monthly: [], missed: [], closed: [], lapsed: [], openings: [] })),
    },
    /* T33-80 (R21): stand-ins shaped as following R12, R13, duties R13, people R23, money-checks R6, answers R17 and
       inquiry R57; answers and inquiry read `now` as instant text. */
    following: {
      followDue: (now) => rec("following.followDue", [now], v("follow", "due", now)),
      followWake: (now) => rec("following.followWake", [now], v("follow", "wake", now)),
      followTick: async (now, rank) => rec("following.followTick", [now, rank], v("follow", "tick", now,
        { configured: true, at: now, epoch: null, read: 0, captured: 0, unscheduled: [], member_act_required: [], failed: [], paused: false })),
    },
    duties: { recordTransitions: (a) => rec("duties.recordTransitions", [a], v("duty-transitions", "tick", a,
      { ...structuredClone(DUTIES_IDLE), as_of: a.asOf })) },
    people: { evaluateChecks: (a) => rec("people.evaluateChecks", [a], v("interest-checks", "tick", a, { ok: true, evaluated: 0, remaining: false })) },
    moneyChecks: { runDetectors: (a) => rec("moneyChecks.runDetectors", [a], v("money-detectors", "tick", a,
      { ok: true, written: 0, unchanged: 0, raised: 0, skipped: {}, persons_skipped: 0, detectors: 0, remaining: false, cursor: null })) },
    answers: {
      standingDue: (now) => rec("answers.standingDue", [now], v("standing-questions", "due", now, 0)),
      standingWake: (now) => rec("answers.standingWake", [now], v("standing-questions", "wake", now)),
      standingTick: async (now) => rec("answers.standingTick", [now], v("standing-questions", "tick", now, { at: now, ran: [], remaining: 0 })),
    },
    /* T34-51, T41-49 (R22): a stand-in shaped as publish-schedule R2: `publishWake()` the earliest set time (instant
       text or ms), `publishDue(now)` told `now` as instant text, answering a Promise. */
    publishSchedule: {
      publishWake: () => rec("publishSchedule.publishWake", [], v("scheduled-publish", "wake", null)),
      publishDue: async (now) => rec("publishSchedule.publishDue", [now], v("scheduled-publish", "tick", now, { ok: true, taken: [] })),
    },
    /* T41-49 (R26): a stand-in shaped as question-explorer R1: `exploreDue(now)` a count of questions due (0 by default),
       `exploreWake(now)` an instant in `now`'s form or null, `exploreTick(now)` its answer. */
    questionExplorer: {
      exploreDue: (now) => rec("questionExplorer.exploreDue", [now], v("question-explore", "due", now, 0)),
      exploreWake: (now) => rec("questionExplorer.exploreWake", [now], v("question-explore", "wake", now)),
      exploreTick: async (now) => rec("questionExplorer.exploreTick", [now], v("question-explore", "tick", now,
        { at: new Date(now).toISOString(), gate: "open", opened: [], asked: [], refused: 0, considered: 0 })),
    },
    /* T36-29, T37-24 (R24): a stand-in shaped as file-safety R4, R12, R36, R35 and R41, each answering a Promise; its
       R39 wakes (each consumer's `wake` in `set`, the instant in ms or null, none by default); and its R40 notice,
       `onFileWork`, whose listeners it keeps (`listeners`) and whose answer is `set["file-work"].tick` ({ok: true}). */
    fileSafety: {
      listeners: [],
      scanWake: (now) => rec("fileSafety.scanWake", [now], v("file-scan", "wake", now)),
      renderWake: (now) => rec("fileSafety.renderWake", [now], v("file-render", "wake", now)),
      deeperWake: (now) => rec("fileSafety.deeperWake", [now], v("file-deeper", "wake", now)),
      forwardWake: (now) => rec("fileSafety.forwardWake", [now], v("file-forward", "wake", now)),
      reputationWake: (now) => rec("fileSafety.reputationWake", [now], v("file-reputation", "wake", now)),
      refreshReputationLists: async (a) => rec("fileSafety.refreshReputationLists", [a], v("file-reputation", "tick", a,
        { ok: true, refreshed: [], failed: [], skipped: [] })),
      onFileWork(module, fn) {
        const r = v("file-work", "tick", null, { ok: true });
        if (r && r.ok) this.listeners.push(fn);
        return rec("fileSafety.onFileWork", [module], r);
      },
      scanBatch: async (a) => rec("fileSafety.scanBatch", [a], v("file-scan", "tick", a, structuredClone(FILE_IDLE.scan))),
      renderBatch: async (a) => rec("fileSafety.renderBatch", [a], v("file-render", "tick", a, structuredClone(FILE_IDLE.render))),
      deeperBatch: async (a) => rec("fileSafety.deeperBatch", [a], v("file-deeper", "tick", a, structuredClone(FILE_IDLE.deeper))),
      forwardSecurityCounts: async (a) => rec("fileSafety.forwardSecurityCounts", [a], v("file-forward", "tick", a, structuredClone(FILE_IDLE.forward))),
    },
    /* T39-15 (R25): a stand-in shaped as case-carriage R15 and R17: `copyWake(now)` (the `document-copy` consumer's `wake`
       in `set`, the instant in ms or null, none by default), `copyBatch({limit})` answering a Promise, and `onCopyWork`,
       whose listeners it keeps (`listeners`) and whose answer is `set["copy-work"].tick` ({ok: true, module}). */
    caseCarriage: {
      listeners: [],
      copyWake: (now) => rec("caseCarriage.copyWake", [now], v("document-copy", "wake", now)),
      copyBatch: async (a) => rec("caseCarriage.copyBatch", [a], v("document-copy", "tick", a,
        { ok: true, copied: 0, clean: 0, public: 0, refused: 0, failed: 0, remaining: 0 })),
      onCopyWork(module, fn) {
        const r = v("copy-work", "tick", null, { ok: true, module });
        if (r && r.ok) this.listeners.push(fn);
        return rec("caseCarriage.onCopyWork", [module], r);
      },
    },
    /* G55 (R7, R24): a stand-in shaped as calculations R14 states its background ingest: `ingestDue(now)` and `ingestWake(now)`
       (the `ingest` consumer's `due` and `wake` in `set`; none by default), `ingestTick(now)` answering a Promise, and
       `onIngestWork(module, fn)`, whose listeners it keeps and whose answer is `set["ingest-work"].tick` ({ok: true, module}). */
    calculations: {
      listeners: [],
      ingestDue: (now) => rec("calculations.ingestDue", [now], v("ingest", "due", now)),
      ingestWake: (now) => rec("calculations.ingestWake", [now], v("ingest", "wake", now)),
      ingestTick: async (now) => rec("calculations.ingestTick", [now], v("ingest", "tick", now,
        { ok: true, ingest: null, state: "ingesting", rows_done: 0, finished: 0 })),
      onIngestWork(module, fn) {
        const r = v("ingest-work", "tick", null, { ok: true, module });
        if (r && r.ok) this.listeners.push(fn);
        return rec("calculations.onIngestWork", [module], r);
      },
    },
    inquiry: {
      datedWaitsDue: (now) => rec("inquiry.datedWaitsDue", [now], v("dated-waits", "due", now, false)),
      datedWaitsWake: (now) => rec("inquiry.datedWaitsWake", [now], v("dated-waits", "wake", now)),
      datedWaitsTick: (now) => rec("inquiry.datedWaitsTick", [now], v("dated-waits", "tick", now, { marked: [] })),
    },
  };
  return { calls, o, of: Object.fromEntries(Object.entries(o).map(([k, x]) => [k, () => x])) };
}

/** The owners of R21's three daily consumers, whose due and wake this module holds: a fresh instance wants their
 *  first pass at once, so a world includes them only when a test asks (`daily`), or names one of them in `set`. */
export const DAILY_OWNERS = Object.freeze({ "duty-transitions": "duties", "interest-checks": "people", "money-detectors": "moneyChecks" });

/** R24's five consumers: a world includes `file-safety` only when a test asks (`files`), or names one of them in `set`. */
export const FILE_CONSUMERS = Object.freeze(["file-scan", "file-render", "file-deeper", "file-forward", "file-reputation"]);

/** R25's consumer: a world includes `case-carriage` only when a test asks (`copies`), or names it in `set`. */
export const COPY_CONSUMER = "document-copy";

/** R26's consumer: a world includes `question-explorer` only when a test asks (`explore`), or names it in `set`. */
export const EXPLORE_CONSUMER = "question-explore";

/** G55's consumer: a world includes `calculations` only when a test asks (`ingest`), or names it in `set`. */
export const INGEST_CONSUMER = "ingest";

/** A scheduler over a fresh storage and the owners above; `env` its bindings; `zone` the group's time zone. */
export function world(set = {}, env = null, { daily = false, files = false, copies = false, explore = false, ingest = false, zone = null, st = null } = {}) {
  const store = st || storage();
  const w = owners(set || {});
  const of = { ...w.of };
  for (const [name, owner] of Object.entries(DAILY_OWNERS)) if (!daily && !(set && name in set)) delete of[owner];
  if (!files && !FILE_CONSUMERS.some((n) => set && n in set)) delete of.fileSafety;
  if (!copies && !(set && COPY_CONSUMER in set)) delete of.caseCarriage;
  if (!explore && !(set && EXPLORE_CONSUMER in set)) delete of.questionExplorer;
  if (!ingest && !(set && INGEST_CONSUMER in set)) delete of.calculations;
  const s = new Scheduler({ storage: store, env, owners: of, zone: () => zone });
  return { s, st: store, calls: w.calls, o: w.o, set };
}

/** A registered consumer answering what it is told, and counting its ticks. */
export function consumer(name, { key, due = null, wake = null, tick = null } = {}) {
  const c = { name, ticks: [], dues: 0, wakes: 0 };
  if (key !== undefined) c.key = key;
  c.due = (now) => { c.dues++; return typeof due === "function" ? due(now) : due; };
  c.wake = (now) => { c.wakes++; return typeof wake === "function" ? wake(now) : wake; };
  c.tick = (now, rank) => { c.ticks.push([now, rank]); return typeof tick === "function" ? tick(now, rank) : tick; };
  return c;
}

/** The storage calls other than the probe seam's value: the alarm calls alone, for a test that nothing else is written. */
export const writes = (st) => st.log.filter(([m]) => m === "setAlarm" || m === "deleteAlarm" || m === "put");
export const NOW = Date.parse("2026-09-28T12:00:00Z");

/** Pins the real clock at `NOW` for the test `t`, so an `arm` a notice makes (it reads `Date.now()`) sees the fixed instants
 *  these tests seed their alarms and wakes at: an alarm more than a minute behind the clock is spent, not armed (R4, R11). */
export function pinNow(t) { t.mock.method(Date, "now", () => NOW); }
