/* scheduler's test world: a Durable Object storage that holds the one alarm and a key-value map and logs every call,
   and owners whose services answer what a test sets and record every call made to them. */
import { Scheduler } from "../../../src/scheduler/index.mjs";

export function storage() {
  const kv = new Map();
  const log = [];
  let alarm = null;
  return {
    log, kv,
    get alarm() { return alarm; },
    set alarm(v) { alarm = v; },
    async getAlarm() { log.push(["getAlarm"]); return alarm; },
    async setAlarm(t) { log.push(["setAlarm", t]); alarm = t; },
    async deleteAlarm() { log.push(["deleteAlarm"]); alarm = null; },
    async get(k) { log.push(["get", k]); return kv.has(k) ? structuredClone(kv.get(k)) : undefined; },
    async put(k, v) { log.push(["put", k]); kv.set(k, structuredClone(v)); },
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
        { configured: true, at: null, checked: 0, epoch: null, eligible: [], fired: [], failed: [], skipped: [] })),
      cadenceDue: (now) => rec("monitoring.cadenceDue", [now], v("monitor-cadence", "due", now)),
      cadenceWake: (now) => rec("monitoring.cadenceWake", [now], v("monitor-cadence", "wake", now)),
      cadenceTick: async (now, rank) => rec("monitoring.cadenceTick", [now, rank], v("monitor-cadence", "tick", now, { ticked: [] })),
      deadlineRecheckDue: (now) => rec("monitoring.deadlineRecheckDue", [now], v("deadline-recheck", "due", now)),   /* R50 */
      deadlineRecheckWake: (now) => rec("monitoring.deadlineRecheckWake", [now], v("deadline-recheck", "wake", now)),
      deadlineRecheck: async (now) => rec("monitoring.deadlineRecheck", [now], v("deadline-recheck", "tick", now,
        { ok: true, at: null, marked: [], failed: [], truncated: false, escalations: null })),   /* R34, R35 */
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
  };
  return { calls, o, of: Object.fromEntries(Object.entries(o).map(([k, x]) => [k, () => x])) };
}

/** A scheduler over a fresh storage and the owners above; `env` its bindings. */
export function world(set = {}, env = null) {
  const st = storage();
  const w = owners(set);
  const s = new Scheduler({ storage: st, env, owners: w.of });
  return { s, st, calls: w.calls, o: w.o, set };
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
