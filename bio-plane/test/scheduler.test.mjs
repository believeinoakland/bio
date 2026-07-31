/* REC-1: the scheduler — ONE reconciling Durable Object alarm, many consumers.
 *
 * The decision (one DO alarm vs a Worker cron trigger) and its rationale live in
 * docs/development/SCHEDULER.md and at the mechanism in src/store.mjs. This suite
 * is the accepts-when: it proves the MECHANISM, not the individual consumers.
 * The two real consumers moved onto it (selection sweep, D-109 task drain) are
 * proven still-working by selection.test.mjs and task-drain-alarm.test.mjs, which
 * this change leaves green; here we exercise the registry itself with two
 * INDEPENDENT interval consumers (env-gated test probes) so the scheduling
 * properties are deterministic and starvation is detectable BY NAME:
 *
 *   1. two consumers scheduled through the one alarm, each firing at its OWN
 *      interval (probe-fast every 1_000_000 ticks-of-ms, probe-slow every
 *      2_500_000), driven by following the reconciled `nextAt` exactly as
 *      workerd would;
 *   2. NEITHER starves the other — the slow consumer fires INTERLEAVED between
 *      the fast one's fires, because the reconcile keeps every active consumer's
 *      wake and not only the one that just ran;
 *   3. the alarm SELF-TERMINATES (deleteAlarm, getAlarm -> null) once both are
 *      idle;
 *   4. and the RESERVED alarm() workerd invokes really drives it end-to-end, at
 *      a short real cadence, to completion and self-termination.
 *
 * The clock is pinned by driving onAlarm(now) with an explicit virtual `now` and
 * following the returned nextAt; the probes' periods are far larger than the test
 * wall-time so the REAL alarm the arm sets never fires during the deterministic
 * run. This is the task-drain suite's own trick (pin the cadence out of the test
 * window) turned into a full virtual clock.
 *
 * NEGATIVE CONTROL: make the reconcile forget the consumers that are not due at
 * the firing instant — i.e. reconcile over a due-filtered subset instead of the
 * full registry. In src/store.mjs onAlarm, change
 *   `this.#reconcileAlarm(now, reg, true)`
 * to
 *   `this.#reconcileAlarm(now, reg.filter(c => { const d = c.due(now); return d !== null && d <= now + Store.SCHED_GRACE_MS; }), true)`
 * RUN 2026-07-31: a consumer waiting its turn (probe-slow), and even the one that
 * just advanced past `now`, are dropped, so the single alarm terminates a fire
 * early and probe-slow NEVER fires. The suite FAILS 8 assertions naming it:
 *   "probe-slow fires its one time"                             want 1     got 0
 *   "probe-slow fires once (not starved)"                       want 1     got 0
 *   "probe-slow fire is interleaved between probe-fast fires"   want true  got false
 *   "probe-fast and probe-slow are both exhausted"             want [0,0] got [2,1]
 * Restored to `reg` -> 18/18 green.
 */
/* NEGATIVE CONTROL: in src/store.mjs onAlarm, reconcile over a due-filtered subset instead of the full `reg` -> probe-slow never fires; suite FAILS 8 assertions naming it (RUN 2026-07-31, restored green). */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const SRC = fileURLToPath(new URL("../src/store.mjs", import.meta.url));
const script = readFileSync(SRC, "utf8");

const makeMf = (probe) => new Miniflare({
  modules: true, script, modulesRoot: "/", scriptPath: SRC,
  compatibilityDate: "2026-07-01",
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  bindings: { SCHED_PROBE: JSON.stringify(probe) },
});
const getObj = async (mf) => {
  const ns = await mf.getDurableObjectNamespace("STORE");
  return ns.get(ns.idFromName("bio"));
};

/* ---- deterministic: two probes on one alarm, virtual clock following nextAt ---- */
const FAST = 1_000_000, SLOW = 2_500_000;   // far larger than the test's wall-time
{
  const mf = makeMf([
    { name: "probe-fast", period: FAST, fires: 3 },
    { name: "probe-slow", period: SLOW, fires: 1 },
  ]);
  try {
    const obj = await getObj(mf);
    const BASE = Date.now();

    /* Drive the alarm the way workerd does: arm, then fire onAlarm at whatever
       time the reconcile last asked for, until it asks for nothing. */
    let at = await obj.schedProbeArm(BASE);
    const chain = [];
    for (let i = 0; i < 30 && at !== null; i++) {
      const r = await obj.onAlarm(at);
      chain.push(at);
      at = r.nextAt;
    }
    const log = await obj.schedProbeLog();
    const fastF = (log["probe-fast"] || { fires: [] }).fires;
    const slowF = (log["probe-slow"] || { fires: [] }).fires;

    console.log("\n--- two consumers, one alarm, each on its own interval ---");
    t("probe-fast fires its three times", fastF.length, 3);
    t("probe-slow fires its one time", slowF.length, 1);
    t("probe-fast fires at ITS interval, every FAST",
      [fastF[1] - fastF[0], fastF[2] - fastF[1]], [FAST, FAST]);
    t("the alarm was driven exactly as many times as consumers came due", chain.length, 4);

    console.log("\n--- neither starves the other ---");
    /* The one slow fire lands BETWEEN two fast fires: the reconcile kept the
       slow wake while the fast consumer was still cycling, so the slow one was
       served on time rather than shut out by the busier consumer. */
    t("probe-slow fires once (not starved)", slowF.length, 1);
    t("probe-slow fire is interleaved between probe-fast fires (served, not shut out)",
      slowF[0] > fastF[1] && slowF[0] < fastF[2], true);
    t("probe-slow fire honours ITS interval from arming", slowF[0] - BASE, SLOW);

    console.log("\n--- the alarm self-terminates when both are idle ---");
    t("the reconcile asked for no further wake once both went idle", at, null);
    t("and the alarm is actually cleared, not merely un-followed", await obj.schedAlarmAt(), null);
    t("probe-fast and probe-slow are both exhausted",
      [(log["probe-fast"]).remaining, (log["probe-slow"]).remaining], [0, 0]);
  } finally {
    await mf.dispose();
  }
}

/* ---- a REAL consumer and an interval consumer share the one alarm ---- */
{
  /* Proof that a consumer MOVED onto the mechanism (the selection sweep) and an
     interval consumer coexist: the reconcile weighs both, and the interval
     consumer going idle does NOT cancel the real consumer's still-pending wake. */
  /* The probe period is SHORTER than the selection TTL, so the probe fires while
     the selection is still live and the sweep's wake must survive the probe
     going idle. (#sweepSelections keys off the real wall clock, so the selection
     does not actually expire inside the sub-second test.) */
  const mf = makeMf([{ name: "probe-brief", period: 100_000, fires: 1 }]);
  try {
    const obj = await getObj(mf);
    const BASE = Date.now();
    /* Arm the probe FIRST so its interval anchors to BASE, then bring the real
       consumer up alongside it. */
    const armed0 = await obj.schedProbeArm(BASE);
    console.log("\n--- a real consumer and an interval consumer reconcile together ---");
    t("with only the probe active, the alarm is the probe's wake", armed0 - BASE, 100000);
    const made = await obj.selectionCreate({ q: "", owner: "ruth" });   // arms the sweep
    t("a selection is created (arms the real selection-sweep consumer)", made.ok, true);

    /* The sweep wants a wake one TTL+grace out (300000+30000); the probe wants
       one 100000 out. The alarm stays reconciled to the EARLIER of the two
       real+interval consumers — the probe. */
    t("the alarm reconciles to the earliest of sweep and probe (the probe)",
      (await obj.schedAlarmAt()) - BASE, 100000);

    /* Fire the probe to completion at its own time. The selection is still live,
       so the sweep's wake must survive the probe going idle. */
    const r = await obj.onAlarm(BASE + 100_000);
    t("firing the probe's wake runs the probe", r.probes, ["probe-brief"]);
    t("the interval consumer idling does NOT delete the alarm the real one still wants",
      typeof r.nextAt === "number" && r.nextAt !== null, true);
    t("and the surviving wake is the selection sweep's, not a stray",
      r.nextAt - (BASE + 100_000), 330000);
  } finally {
    await mf.dispose();
  }
}

/* ---- end-to-end: the reserved alarm() workerd invokes drives the scheduler ---- */
{
  const mf = makeMf([{ name: "probe-rt", period: 150, fires: 2 }]);
  try {
    const obj = await getObj(mf);
    await obj.schedProbeArm();               // real wall-clock arm; workerd fires alarm() from here
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    let firesSeen = 0;
    for (let i = 0; i < 60; i++) {           // bounded ~6s, so a broken drive FAILS rather than hangs
      await sleep(100);
      const log = await obj.schedProbeLog();
      firesSeen = (log["probe-rt"] || { fires: [] }).fires.length;
      if (firesSeen >= 2) break;
    }
    console.log("\n--- the reserved alarm() drives the scheduler end-to-end ---");
    t("workerd firing the real alarm drove the probe to completion, no manual onAlarm", firesSeen, 2);

    let alarmAt = "unknown";
    for (let i = 0; i < 30; i++) {
      await sleep(100);
      alarmAt = await obj.schedAlarmAt();
      if (alarmAt === null) break;
    }
    t("and once idle the real alarm self-terminated", alarmAt, null);
  } finally {
    await mf.dispose();
  }
}

console.log(`\nscheduler: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
