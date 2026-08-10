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
/* ==========================================================================
 * FL-4 / IS-9 — THE SUSPENDED RUN'S WAKE, appended to this suite because it is
 * the accepts-when the plan row names (`battery.mjs scheduler`) and because the
 * property under test is the REGISTRY'S, not the run object's.
 *
 * WHAT BLOCKS 4-7 BELOW ASSERT:
 *
 *  4. THE REGISTRY IS THE MECHANISM AND THERE IS STILL ONE ALARM. Ten named
 *     consumers in a pinned ORDER (the wake is appended AFTER the drain, which
 *     is what lets a completion be delivered on the alarm that produced it);
 *     `setAlarm`/`deleteAlarm` reached from `#reconcileAlarm` and NOWHERE else;
 *     and no cron line in `wrangler.jsonc`. That last pair is the plan row's own
 *     negative control ("add the run's own alarm or cron") turned into an arm
 *     that can see it.
 *  5. THE WAKE, END TO END, ON THE ALARM THAT PRODUCED IT. A run requests two
 *     captures at ONE host; the drain's per-host rule (1 per tick) captures one
 *     and holds the other; the wake consumer delivers the completion to the run
 *     ON THE SAME ALARM, appending ONE observation entry and stamping the
 *     request so a second alarm delivers nothing.
 *  6. THE HOLD, AND IT IS A DEFECT BEING CLOSED RATHER THAN A FEATURE. A run
 *     waiting on OUR daemon is not heartbeating, so before this consumer the
 *     reaper took it at the lease and wrote `lease` as the bound that stopped
 *     it — our own pacing recorded as the run's death. The arm drives a run on
 *     a five-second lease past its own expiry and asserts it is still running.
 *  7. SELF-TERMINATION AND THE BOUND. An instance with nothing suspended holds
 *     no alarm; a request past its OWN expiry stops holding its run, so the
 *     hold is not an immortality clause.
 *
 * WHAT THIS SUITE CANNOT SEE, STATED PLAINLY: nothing in the plane RE-ENTERS a
 * woken run. The wake is a fact in the record — the lease held, the observation
 * appended, the completion stamped — and the driver that would consume it is
 * `agent-worker`'s `POST /run`, which the plane has no caller for and no
 * credential to call with (FL-3's standing delegation to RECORD, re-measured by
 * FL-4 and unchanged). So these arms prove a run SURVIVES to be resumed and is
 * TOLD that the daemon answered; they do not and cannot prove it resumed.
 *
 * NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/scheduler.control.mjs` —
 * deliberately NOT a `.test.mjs`, because it EDITS REAL SOURCES while it runs
 * and neither the battery nor the fleet walk must discover it (PL-4's
 * `capturerequests.control.mjs` precedent). Every arm is armed ALONE with the
 * others held open, every restore verified by sha256 AND by content against a
 * uniquely-named per-arm pristine copy.
 * ======================================================================== */
/* NEGATIVE CONTROL: in src/store.mjs onAlarm, reconcile over a due-filtered subset instead of the full `reg` -> probe-slow never fires; suite FAILS 8 assertions naming it (RUN 2026-07-31, restored green). */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

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

/* ====================================================================== 4
 * FL-4 — THE REGISTRY, ITS ORDER, AND THE FACT THAT THERE IS STILL ONE ALARM.
 *
 * Structural, over the real source, because these are properties an APPEND can
 * quietly change and no behavioural arm would notice: a consumer added in the
 * wrong place still ticks, and a second alarm armed somewhere else still fires.
 * Comments are BLANKED length-preservingly first — this file's subject is named
 * in dozens of comments inside the very span it walks, and a walk over raw
 * source would read the registry's explanation of the one-alarm rule as a
 * breach of it (PL-4's measured false positive, met again here). */
{
  const DIR = dirname(fileURLToPath(import.meta.url));
  const decomment = (src) => src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/[^\n]*/gm, (m, p) => p + " ".repeat(m.length - p.length));
  const bare = decomment(script);

  const at = bare.indexOf("#schedConsumers(probe) {");
  const end = bare.indexOf("for (const name of Object.keys(probe", at);
  const registry = at >= 0 && end > at ? bare.slice(at, end) : "";
  const names = [...registry.matchAll(/name:\s*"([a-z-]+)"/g)].map((m) => m[1]);

  console.log("\n--- FL-4: ten consumers, ONE alarm, and the order is the mechanism ---");
  /* THE CORPUS IS PRINTED AND FLOORED. A totality assertion over an empty slice
     passes for free, which this repository has measured three times. */
  console.log(`    registry span: ${registry.length} chars · consumers: ${names.join(", ")}`);
  t("the registry span was found and is not empty", registry.length > 400, true);
  t("the registry is exactly the ten real consumers, in order", names, [
    "selection-sweep", "task-drain", "archive-monitor", "connection-derive",
    "overdue-scan", "queue-renotify", "monitor-cadence", "ai-run-reap",
    "capture-request-drain", "ai-run-wake"]);
  /* THE ORDER ARM, asserted as a RELATION rather than as an index, so it still
     means what it says after the eleventh consumer is appended. */
  t("the wake is registered AFTER the drain, so a completion is delivered on the alarm that made it",
    names.indexOf("ai-run-wake") > names.indexOf("capture-request-drain"), true);

  /* THE PLAN ROW'S OWN NEGATIVE CONTROL, as an arm that can see it: "add the
     run's own alarm or cron -> the one-alarm assertion fails". Before FL-4 this
     suite had no such assertion, so the control it declared could not have
     failed anything. Corrected rather than exempted. */
  const setSites = (bare.match(/storage\.setAlarm\(/g) || []).length;
  const delSites = (bare.match(/storage\.deleteAlarm\(/g) || []).length;
  const reconcileAt = bare.indexOf("async #reconcileAlarm(now, reg, exact = false) {");
  /* THE END ANCHOR IS CODE AND NOT A COMMENT, and the first draft of this arm
     got it wrong: `decomment` blanks comments before the walk, so an anchor
     inside one is not there to be found and the span read ZERO characters —
     over which BOTH totality assertions below would have passed for free had
     they not been floored. The floor caught it, which is what a floor is for. */
  const reconcileEnd = bare.indexOf("\n  async #armScheduler(", reconcileAt);
  const reconcile = reconcileAt >= 0 && reconcileEnd > reconcileAt
    ? bare.slice(reconcileAt, reconcileEnd) : "";
  console.log(`    setAlarm sites: ${setSites} · deleteAlarm sites: ${delSites} · #reconcileAlarm span: ${reconcile.length} chars`);
  t("#reconcileAlarm was found and is not empty", reconcile.length > 200, true);
  t("EVERY setAlarm in the plane is inside #reconcileAlarm — there is ONE alarm and one place that arms it",
    [setSites, (reconcile.match(/storage\.setAlarm\(/g) || []).length], [2, 2]);
  t("EVERY deleteAlarm is inside #reconcileAlarm too — one place deletes it",
    [delSites, (reconcile.match(/storage\.deleteAlarm\(/g) || []).length], [1, 1]);

  const wrangler = readFileSync(join(DIR, "..", "wrangler.jsonc"), "utf8");
  t("and NO cron: wrangler.jsonc declares no triggers block",
    /"triggers"\s*:/.test(wrangler) || /"crons"\s*:/.test(wrangler), false);
}

/* ====================================================================== 5-7
 * FL-4 — THE WAKE, THE HOLD AND THE BOUND, DRIVEN THROUGH THE OPS.
 *
 * The fixture is built through the control plane (a member, an inquiry, a run,
 * two capture requests) and the alarm is driven through the Durable Object on a
 * PINNED VIRTUAL CLOCK — this suite's own trick from block 1, applied to a real
 * consumer instead of a probe. A store-level fixture would have proved the
 * consumer works on rows nobody can produce.
 *
 * TWO CLOCK FACTS THAT COST THIS BLOCK ITS FIRST RUN, RECORDED RATHER THAN
 * SMOOTHED, because either one makes the arms fail for a reason that has
 * nothing to do with the subject:
 *   - THE VIRTUAL CLOCK MUST START AT `Date.now()` AND NEVER IN THE PAST.
 *     `#reconcileAlarm` sets a REAL alarm at the reconciled instant, and workerd
 *     fires an alarm whose time has already passed IMMEDIATELY — so a fixture
 *     dated 2026-07-03 had the runtime re-entering `onAlarm` with the WALL clock
 *     underneath the suite, and the reaper took the run on a lease the suite had
 *     not yet driven to.
 *   - THE DRAIN'S CADENCE IS PINNED FAR OUT, so the only alarms are this
 *     suite's. The wake consumer FOLLOWS that cadence (capped at a quarter of
 *     the lease), so pinning the one pins both. */
{
  const DIR = dirname(fileURLToPath(import.meta.url));
  const SRCF = (f) => join(DIR, "..", "src", f);
  const sha = (v) => createHash("sha256").update(v).digest("hex");
  const SEEN = [];
  let MF;
  const mf = new Miniflare({
    modules: true, modulesRoot: "/", scriptPath: SRCF("index.mjs"),
    script: readFileSync(SRCF("index.mjs"), "utf8"),
    modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: "Store", useSQLite: true } },
    r2Buckets: ["CAPTURES", "PUBLISHED"],
    bindings: { ADMIN_TOKEN: "adm-fl4", MEMBER_TOKEN: "mem-fl4", PROBE_TOKEN: "prb-fl4",
                DAEMON_TOKEN: "dmn-fl4", VERSION: "0.60.0", INSTANCE_NAME: "biosmoke-fl4",
                GOVERNOR_APPETITE_PER_MIN: "600000",
                CAPTURE_REQUEST_TICK_MS: "3600000", MONITOR_TICK_MS: "3600000" },
    serviceBindings: { SELF: async (request) => MF.dispatchFetch(request) },
    outboundService(request) {
      SEEN.push(request.url);
      return new Response(new Uint8Array(2048).map((_, i) => (i * 17 + 3) % 256),
                          { headers: { "content-type": "application/pdf" } });
    },
  });
  MF = mf;
  const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
  const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
  const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
    { method: "POST", body: JSON.stringify(body ?? {}) })).json());

  try {
    const ns = await mf.getDurableObjectNamespace("STORE");
    const obj = ns.get(ns.idFromName("bio"));
    const DO = async (p, body) => rP(await (await obj.fetch("http://x/" + p,
      body ? { method: "POST", body: JSON.stringify(body) } : {})).json());

    const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
    const T0 = Date.now();
    const iso = (ms) => new Date(ms).toISOString();
    const add = await POST("op=memberadd&token=adm-fl4",
      { memberId: "ruth", cover: "cover for ruth", role: "admin", capabilities: ["contribute", "publish"] });
    const en = await POST("op=enroll", { invite: add.invite, handle: "ruth", password: "ruth-passphrase-1" });
    if (!en.ok) throw new Error(`enroll: ${JSON.stringify(en)}`);
    const lg = await POST("op=login", { role: "member:ruth", password: "ruth-passphrase-1" });
    const RUTH = lg.token;
    if (!RUTH) throw new Error(`login: ${JSON.stringify(lg)}`);

    const INQ = "INQ-2026-4100-fl4-wake";
    const inquiryMd = ["---",
      `id: ${INQ}`, "object_type: inquiry", "schema: inquiry@1",
      `title: "What does ${INQ} rest on?"`, "current_state: open", "prior_state: null",
      `created: "${NOW}"`, `last_updated: "${LATER}"`,
      "produced_by:", "  mode: agent", "  capability_tier: high",
      "group: believe-in-oakland", "references: []", "state_history: []",
      "annotations_open: 0",
      "reeval_pending:", "  flag: false", "  since: null", "  source: null",
      "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
      "recheck_triggers:", "  - text: Revisit after the next budget cycle",
      "    description: The adopted budget may restate the transfer basis.",
      "---", "",
      "## Question", "", `What does ${INQ} rest on?`, "",
      "## What It Rests On", "", "## Conclusion", "",
      "## What Would Falsify This", "", "## Session Log", "",
      `### Session ${LATER} | Formation | agent`,
      "Trigger: surfacing", "Changes: created.", "", "## Review Notes", ""].join("\n");
    const pr = await POST(`op=promote&token=${RUTH}`, {
      bundleId: INQ, base: null, snapKey: `${INQ}-fl4`,
      files: [{ path: "bundle.md", text: inquiryMd, bytes: inquiryMd.length, sha256: sha(inquiryMd) }],
      register: [],
      meta: { object_type: "inquiry", group: "believe-in-oakland", title: `Bundle ${INQ}`,
              current_state: "open", created: NOW, last_updated: LATER } });
    if (!pr.ok) throw new Error(`promote: ${JSON.stringify(pr).slice(0, 400)}`);

    /* A FIVE-SECOND LEASE, so the reaper's own clock lands inside this suite's
       window and the hold has something real to protect the run from. */
    const RUN = "RUN-2026-0809-fl4";
    const LEASE = 5000;
    const opened = await POST(`op=airunopen&token=${RUTH}`, {
      run: RUN, contextType: "inquiry", contextId: INQ,
      label: "FL-4 fixture — the run that waits on the daemon", mode: "check",
      principalClaude: "project", principalClaudeRef: "believe-in-oakland/claude",
      skillVersion: "investigative-session@1", biasManifest: null,
      bounds: [{ bound: "fetches", allowed: 50, unit: "requests" }],
      at: iso(T0), leaseMs: LEASE });
    if (opened?.started !== true) throw new Error(`airunopen: ${JSON.stringify(opened)}`);

    /* TWO REQUESTS, AND THE SECOND ONE NEVER COMPLETES. `A` is fetched on the
       first drain tick. `H` names a host the per-host governor is holding, so it
       is refused NON-TERMINALLY on every tick and stays outstanding — which is
       what a run WAITING on the daemon actually looks like. The cool-off is put
       in place through the governor's OWN reporting path, exactly as a real 429
       would: PL-4's rule, that a state a test can only reach by hand is a state
       the plane may never produce.
       AND `H` IS DATED BACK, so the 24-hour TTL it carries falls inside this
       suite's window — that expiry is the BOUND on the hold, and an arm below
       drives it INDEPENDENTLY of the reaper. */
    const A = "https://www.oaklandca.gov/files/assets/fl4-a.pdf";
    const H = "https://www.cooling-off.example.gov/fl4-held.pdf";
    const H_TTL_LEFT = 30000;
    await DO("governorreport", { host: "www.cooling-off.example.gov", status: 429, retry_after_ms: 86400000 });
    const rqA = await POST(`op=capturerequest&token=${RUTH}`,
      { target: INQ, run: RUN, purpose: "investigate", address: A, at: iso(T0) });
    if (rqA?.ok !== true) throw new Error(`capturerequest A: ${JSON.stringify(rqA)}`);
    const rqH = await POST(`op=capturerequest&token=${RUTH}`,
      { target: INQ, run: RUN, purpose: "investigate", address: H, at: iso(T0 - 86400000 + H_TTL_LEFT) });
    if (rqH?.ok !== true) throw new Error(`capturerequest H: ${JSON.stringify(rqH)}`);

    /* A SECOND RUN THAT HAS RECEIVED NOTHING AT ALL, AND IT EXISTS BECAUSE THE
       NEGATIVE CONTROL DEMANDED IT. Arm (2) of `scheduler.control.mjs` removes
       the HOLD and this suite's first draft did not notice: the run above had a
       completion on alarm 1, and the WAKE renews the lease too, so it survived
       the hold's removal for a reason that was not the hold. This run's only
       request is at the held host, so nothing ever completes for it and the
       hold is the ONLY thing keeping it alive — which makes it the arm that
       measures the hold rather than a neighbour. A control finding the
       INSTRUMENT wrong rather than the subject, recorded rather than smoothed. */
    const RUN2 = "RUN-2026-0809-fl4-waiting";
    const H2 = "https://www.cooling-off.example.gov/fl4-held-2.pdf";
    const opened2 = await POST(`op=airunopen&token=${RUTH}`, {
      run: RUN2, contextType: "inquiry", contextId: INQ,
      label: "FL-4 fixture — the run that has heard nothing back at all", mode: "check",
      principalClaude: "project", principalClaudeRef: "believe-in-oakland/claude",
      skillVersion: "investigative-session@1", biasManifest: null,
      bounds: [{ bound: "fetches", allowed: 50, unit: "requests" }],
      at: iso(T0), leaseMs: LEASE });
    if (opened2?.started !== true) throw new Error(`airunopen 2: ${JSON.stringify(opened2)}`);
    const rqH2 = await POST(`op=capturerequest&token=${RUTH}`,
      { target: INQ, run: RUN2, purpose: "investigate", address: H2, at: iso(T0) });
    if (rqH2?.ok !== true) throw new Error(`capturerequest H2: ${JSON.stringify(rqH2)}`);
    const run2Of = async () => ((await GET(`op=airun&token=${RUTH}&run=${RUN2}`)) || {}).session || {};

    const logOf = async () => (await GET(`op=airunlog&token=${RUTH}&run=${RUN}&limit=200`)) || {};
    const wakeLines = async () => ((await logOf()).entries || [])
      .filter((e) => /the daemon answered/.test(String(e.detail || "")));
    const runOf = async () => ((await GET(`op=airun&token=${RUTH}&run=${RUN}`)) || {}).session || {};
    const reqOf = async (id) => ((await GET(`op=capturerequests&token=adm-fl4&run=${RUN}`)) || {})
      .requests?.find((q) => q.request === id) || {};

    console.log("\n--- FL-4: a run suspended on a capture request wakes when the drain completes ---");
    const before = await runOf();
    /* THE PLANE'S INSTANTS ARE SECOND-GRAINED — `#aiIso` TRUNCATES the millis
       rather than rounding them — and a fixture stamped `at: T0` is written a
       few milliseconds after `Date.now()` returned T0. So every clock arm here
       asserts a BAND of one second below the intended offset rather than an
       exact figure. Stated once: a millisecond-exact expectation fails on the
       truncation and reads as a defect in the subject, which is what the first
       run of this block reported. */
    const within = (got, want) => got <= want && got > want - 2000;
    t("the run is running, nothing has woken it, and its lease is the five seconds it asked for",
      [before.status, ((await logOf()).entries || []).length,
       within(Date.parse(before.expires) - T0, LEASE)],
      ["running", 0, true]);

    /* ONE ALARM. The drain fetches A and holds H, and the wake consumer —
       appended AFTER the drain — delivers A's completion on this SAME alarm
       rather than one cadence later. */
    const r1 = await obj.onAlarm(T0 + 1000);
    console.log(`    alarm 1: captured=${r1.capturerequests?.captured?.length} held=${r1.capturerequests?.held?.length} ` +
                `woken=${r1.airunwake?.woken} held-runs=${r1.airunwake?.held}`);
    t("the drain captured one and held the two at the cooling-off host (a held request is paced, never lost)",
      [r1.capturerequests?.captured?.length ?? -1, r1.capturerequests?.held?.length ?? -1], [1, 2]);
    t("the alarm's own answer NAMES the wake — it did not disappear into `probes`",
      [typeof r1.airunwake, r1.probes], ["object", []]);
    t("ONE run was woken, for ONE completion, on the alarm that produced it",
      [r1.airunwake?.woken, r1.airunwake?.wakes?.[0]?.run, r1.airunwake?.wakes?.[0]?.completions,
       r1.airunwake?.wakes?.[0]?.captured, r1.airunwake?.wakes?.[0]?.woken], [1, RUN, 1, 1, true]);
    t("and BOTH runs were HELD, because the daemon still owes each of them an answer",
      [r1.airunwake?.held, (r1.airunwake?.holds || []).map((h) => [h.run, h.outstanding])],
      [2, [[RUN, 1], [RUN2, 1]]]);

    /* THE RUN WAS TOLD, IN ITS OWN LOG, and the completion is STAMPED on the
       request — that the daemon answered and that the run was told are two
       different facts, and the record can now state both. */
    t("the run's log carries exactly one wake entry", (await wakeLines()).length, 1);
    const wl = (await wakeLines())[0];
    /* `governed` and `terminal` are stored as INTEGERS and published as
       BOOLEANS by op=airunlog — asserted in the shape a CALLER receives, which
       is the one that matters, rather than in the shape the column holds. */
    t("the wake entry is at the internet level, ungoverned, non-terminal, and states what the SEARCH established",
      [wl?.level, wl?.governed, wl?.terminal, wl?.state], ["internet", false, false, "PRESENT"]);
    t("the completed request is stamped with WHEN the run was told; the outstanding one is not",
      [typeof (await reqOf(rqA.request)).run_woken_at, (await reqOf(rqH.request)).run_woken_at],
      ["string", null]);

    /* DELIVERED EXACTLY ONCE. The stamp is what makes this consumer
       self-terminating rather than one that re-delivers for ever. */
    const stampA = (await reqOf(rqA.request)).run_woken_at;
    const r2 = await obj.onAlarm(T0 + 2000);
    t("a second alarm delivers NOTHING new — the completion was consumed exactly once",
      [r2.airunwake?.woken, (await wakeLines()).length, (await reqOf(rqA.request)).run_woken_at],
      [0, 1, stampA]);
    t("but both runs are still HELD, because each still has a request outstanding",
      r2.airunwake?.held, 2);

    console.log("\n--- FL-4: the hold — a run waiting on OUR daemon is not reaped as dead ---");
    /* THE DEFECT THIS CLOSES. The run's own lease was FIVE SECONDS and the
       clock is now well past it. Before this consumer the reaper took exactly
       this run and wrote `lease` as the bound that stopped it — our own
       daemon's pacing recorded as the run's death, which is D-104's split
       inverted at the run grain. */
    t("the clock is past the run's own lease", T0 + 20000 > Date.parse(before.expires), true);
    const r3 = await obj.onAlarm(T0 + 20000);
    const after = await runOf();
    t("the run is STILL RUNNING, not reaped, and no bound was written",
      [after.status, after.condition], ["running", null]);
    t("the reaper found nothing to reap on that alarm", r3.airunreap ?? null, null);
    t("and the hold moved the lease out beyond the clock",
      Date.parse(after.expires) > T0 + 20000, true);
    /* THE ARM THAT MEASURES THE HOLD AND NOTHING ELSE. The run above has had a
       completion, and the WAKE renews a lease too — so its survival is not
       evidence about the hold. This run has heard nothing back at all: only the
       hold stands between it and the reaper. */
    t("and the run that has heard NOTHING back is alive too, on the hold alone",
      [(await run2Of()).status, Date.parse((await run2Of()).expires) > T0 + 20000],
      ["running", true]);
    /* A HOLD IS NOT A HEARTBEAT, and the record still says so: `updated` is when
       the RUN last acted, and the plane declining to kill it is not the run
       acting. A held run must stay distinguishable from a live one. */
    t("`updated` did NOT move — a held run is still visibly silent", after.updated, before.updated);

    console.log("\n--- FL-4: the bound on the hold, and self-termination ---");
    /* THE HOLD IS BOUNDED BY THE REQUEST'S OWN EXPIRY, and this arm is driven
       INDEPENDENTLY of the reaper: at the instant below the request has expired
       and the run's HELD lease has not, so a hold that stopped merely because
       the run had died could not produce this answer. */
    const hRow = await reqOf(rqH.request);
    console.log(`    held request: state=${hRow.state} expires in T0+${Date.parse(hRow.expires) - T0}ms · run lease T0+${Date.parse(after.expires) - T0}ms`);
    t("the outstanding request is still queued and carries its own expiry",
      [hRow.state, within(Date.parse(hRow.expires) - T0, H_TTL_LEFT)], ["requested", true]);
    const PAST = Date.parse(hRow.expires) + 1000;
    t("that instant is past the request's expiry and INSIDE the run's held lease — the arm is independent",
      [PAST > Date.parse(hRow.expires), PAST < Date.parse(after.expires)], [true, true]);
    const r4 = await obj.onAlarm(PAST);
    /* SCOPED TO THIS RUN BY NAME. The second run's own request is dated
       normally and is still well inside its TTL, so it is STILL held here — and
       that is the arm working, not a leak: the bound belongs to each request,
       not to the tick. An assertion on the bare count would have been satisfied
       by the wrong thing. */
    t("past the request's OWN expiry the hold stops for THAT run — it is not an immortality clause",
      [(r4.airunwake?.holds || []).map((h) => h.run), (await runOf()).status],
      [[RUN2], "running"]);

    /* AND THEN THE RUN DIES HONESTLY. Nothing renews the lease once the daemon
       owes nothing, so the reaper takes it at the lease and NAMES that bound. */
    const r5 = await obj.onAlarm(Date.parse(after.expires) + 1000);
    const dead = await runOf();
    t("with nothing left to wait for, the reaper takes the run and names the bound",
      [r5.airunreap?.lapsed ?? 0, dead.status, dead.condition?.bound], [1, "stopped", "lease"]);
    t("and the wake consumer holds nothing for a run that has ENDED — a hold follows the run's own "
    + "status and not merely its requests",
      [(r5.airunwake?.holds || []).some((h) => h.run === RUN), r5.airunwake?.woken ?? 0], [false, 0]);

    /* SELF-TERMINATION, ASSERTED ON A CLEAN INSTANCE rather than on this one,
       whose capture queue legitimately still holds the DRAIN's alarm. "An idle
       instance carries no timer" is a claim about an idle instance, and making
       it on a busy one would be an arm passing for a reason that is not the
       rule — which is the shape this suite's own header warns about. */
    const idle = ns.get(ns.idFromName("fl4-idle"));
    t("an instance with nothing suspended arms no alarm at all",
      [await idle.schedProbeArm(T0), await idle.schedAlarmAt()], [null, null]);
  } finally {
    await mf.dispose();
  }
}

console.log(`\nscheduler: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
