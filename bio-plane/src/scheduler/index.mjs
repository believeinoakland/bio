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
 *  The consumers' owners are reached through their factories (K61); a later module (the task drain's and the queue
 *  re-notify's owner `queue`, the group-domain re-check's `instance-setup`, `legacy-store` meanwhile) registers its
 *  consumer through `register` (R8). The producers' notices of the earlier modules are registered here, at
 *  construction (R9, the registration rule K206).
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

/** An alarm may fire a hair early: a consumer due within this window of the firing instant runs (R1). */
export const SCHED_GRACE_MS = 250;

/** R5: the registry's order. `capture-request-drain` before `ai-run-wake` is load-bearing: a request that completes
 *  on an alarm wakes its run on the same alarm. `intent-age` and `notice-sweep` (N164, N167, N178) are appended, so
 *  no earlier position moves. */
export const SCHEDULER_ORDER = Object.freeze([
  "selection-sweep", "task-drain", "archive-monitor", "connection-derive", "overdue-scan", "queue-renotify",
  "monitor-cadence", "ai-run-reap", "capture-request-drain", "ai-run-wake", "calibration-reprobe",
  "group-domain-recheck", "bias-debt", "intent-age", "notice-sweep",
]);

/** R2: each consumer's key in `onAlarm`'s answer. The task drain's counts are spread into the answer's own fields. */
export const SCHEDULER_KEYS = Object.freeze({
  "selection-sweep": "swept", "task-drain": "drain", "archive-monitor": "monitor", "connection-derive": "connderive",
  "overdue-scan": "overduescan", "queue-renotify": "queuerenotify", "monitor-cadence": "monitorcadence",
  "ai-run-reap": "airunreap", "capture-request-drain": "capturerequests", "ai-run-wake": "airunwake",
  "calibration-reprobe": "calibration", "group-domain-recheck": "groupdomain", "bias-debt": "biasdebt",
  "intent-age": "intentage", "notice-sweep": "noticesweep",
});

/** R6: due at every firing. Every other consumer is due only when its owner says so. */
export const ALWAYS_DUE = Object.freeze(["selection-sweep", "task-drain", "archive-monitor", "connection-derive", "overdue-scan"]);

/** R10: the batch-bounded ticks, which receive the rank with their `now`. */
export const RANKED = Object.freeze(["monitor-cadence", "archive-monitor", "capture-request-drain", "bias-debt"]);

/* The answer's own fields (R2); a registered consumer's key may not take one. */
const ANSWER_FIELDS = new Set(["swept", "drained", "created", "folded", "refused", "waiting", "remaining", "rearmed",
                               "nextAt", "probes"]);
const DRAIN_ZERO = Object.freeze({ drained: 0, created: [], folded: [], refused: [], waiting: [], remaining: 0 });
const PROBE_KEY = "sched_probe";
const message = (e) => String((e && e.message) || e).slice(0, 500);

/** R10: the rank. `items` are `{kind, id, waitingSince?, cadenceMs?}` (`kind` one of `address`, `bundle`, `request`,
 *  as intent's `servesOf` names subjects; `waitingSince` the instant the item began to wait, in ms). Answers the items
 *  reordered, each with `rank: {overdue, gaps, aspirations, waited_ms}`: work that has waited longer than one whole
 *  cadence of its own first, then work serving an objective's open gap, then work serving an aspiration in force,
 *  then longest-waiting; ties keep the order given. No aspiration ranks above another (intent R12). `serves` is
 *  intent's `servesOf` (R28); one that throws or answers nothing ranks every item by its wait alone. */
export function rankBy(serves, items, now) {
  const list = Array.isArray(items) ? items.filter((x) => x && typeof x === "object") : [];
  const named = { addresses: [], bundles: [], requests: [] };
  const bucket = { address: "addresses", bundle: "bundles", request: "requests" };
  for (const x of list) if (bucket[x.kind]) named[bucket[x.kind]].push(x.id);
  let served = [];
  try { const a = serves ? serves(named) : null; served = (a && Array.isArray(a.serves)) ? a.serves : []; } catch { served = []; }
  const of = new Map(served.map((s) => [`${s.kind}\u0000${s.id}`, s]));
  const t = Number.isFinite(now) ? now : Date.now();
  const ranked = list.map((x, i) => {
    const s = of.get(`${x.kind}\u0000${x.id}`) || {};
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

  /** `storage` is the Durable Object's storage (its alarm, and the probe seam's one value); `owners` answers each
   *  consumer's owner (`retrieval`, `monitoring`, `connections`, `progressions`, `aiRuns`, `captureRequests`,
   *  `calibration`, `bias`, `intent`, `reevaluation`), each a function returning the owner, so an owner is reached
   *  only when the registry is built. */
  constructor({ storage, env = null, owners = {} } = {}) {
    this.#storage = storage;
    this.#env = env || {};
    this.#owners = owners;
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
    }
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
    const at = await this.#reconcile(now, this.registry(probe), false);
    if (probe) await this.#storage.put(PROBE_KEY, probe);
    return at;
  }

  /** At the instance's start: reconciles as `arm` does, so an alarm lost to a failed firing or a reset is re-derived
   *  from durable state. It starts no probe that was not already armed. */
  async start(now = Date.now()) {
    const probe = await this.#probeState(now, false);
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
  listenTo({ retrieval, bias, promotion, capture, progressions } = {}) {
    const arm = () => this.arm();
    const configured = () => {
      if (!this.#owners.monitoring) return false;
      try { const m = this.#owner("monitoring"); return !!(m && m.configured()); } catch { return false; }
    };
    const out = {};
    if (retrieval) out.retrieval = retrieval.onSelectionCreated("scheduler", arm);                 /* retrieval R52 */
    if (bias) out.bias = bias.onLensChange("scheduler", () => (bias.biasDebtDue(Date.now()) === null ? null : arm()));   /* bias R23 */
    /* promotion R45: a promotion may leave a bundle monitored or a lens moved; the reconcile weighs monitoring's and
       the debt's own wakes, so the arm is asked whenever either could want one. */
    if (promotion) out.promotion = promotion.onCommitted("scheduler", async () =>
      (configured() || (bias && bias.biasDebtDue(Date.now()) !== null) ? await arm() : null));
    if (capture) out.capture = capture.on("source-outcome", "scheduler",   /* capture R44 */
      async (o) => (o && o.counted && o.outcome !== "success" && configured() ? await arm() : null));
    if (progressions) out.progressions = progressions.onThreaded("scheduler", () => arm());   /* progressions R33 */
    return out;
  }
}

const instances = new WeakMap();

/** The one scheduler of a Durable Object (K61). `deps.owners` replaces the default owners (a test's); `deps.monitoring`
 *  is a function answering the `monitoring` owner (R19, R20 and `configured()`), injected until `monitoring` is merged
 *  (K259). */
export function schedulerOf(ctx, env = null, deps = {}) {
  let s = instances.get(ctx);
  if (!s) {
    const e = env || {};
    const owners = deps.owners || {
      retrieval: () => retrievalOf(ctx), connections: () => connectionsOf(ctx), progressions: () => progressionsOf(ctx, { env: e }),
      aiRuns: () => aiRunsOf(ctx, e), captureRequests: () => captureRequestsOf(ctx), calibration: () => calibrationOf(ctx),
      bias: () => biasOf(ctx), intent: () => intentOf(ctx), reevaluation: () => reevaluationOf(ctx),
    };
    if (!deps.owners && typeof deps.monitoring === "function") owners.monitoring = deps.monitoring;
    s = new Scheduler({ storage: deps.storage || ctx.storage, env: e, owners });
    instances.set(ctx, s);
    if (!deps.owners)
      s.listenTo({ retrieval: retrievalOf(ctx), bias: biasOf(ctx), promotion: promotionOf(ctx), capture: captureOf(ctx),
                   progressions: progressionsOf(ctx, { env: e }) });
  }
  return s;
}
