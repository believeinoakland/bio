/* scheduler: the three consumers T23 adds to R5 (`gathering-sweep`, monitoring R56; `working-on-seal` and
   `working-on-attest`, network-notices R12, R14, R15, R17), each at its place in R5's order, calling its owner's due,
   wake and tick; isolated when its owner throws (R3); the gathering sweep given the rank (R10); and the sweep's arm
   through promotion's notice (R9). The network-notices consumers also run against the real module, in its own test
   world (`test/m/network-notices/fixture.mjs`). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { SCHEDULER_ORDER, SCHEDULER_KEYS, RANKED, rankBy, Scheduler } from "../../../src/scheduler/index.mjs";
import { world, storage, writes, NOW } from "./fixture.mjs";
import { world as nnWorld, seeded, post, monday, V, WEEK, DAY } from "../network-notices/fixture.mjs";

const NEW = ["gathering-sweep", "working-on-seal", "working-on-attest"];
const OWNED = { "gathering-sweep": ["monitoring.sweepDue", "monitoring.sweepWake", "monitoring.sweepTick"],
                "working-on-seal": ["networkNotices.sealDue", "networkNotices.sealWake", "networkNotices.sealTick"],
                "working-on-attest": ["networkNotices.attestDue", "networkNotices.attestWake", "networkNotices.attestTick"] };

test("R5: gathering-sweep stands after monitor-cadence and before ai-run-reap; working-on-seal, then working-on-attest, close the registry", () => {
  const { s } = world();
  const names = s.consumers();
  const at = (n) => names.indexOf(n);
  for (const n of NEW) assert.ok(at(n) >= 0, `${n} is registered`);
  assert.equal(at("gathering-sweep"), at("monitor-cadence") + 1, "directly after monitor-cadence");
  assert.equal(names[at("gathering-sweep") + 1], "ai-run-reap", "directly before ai-run-reap");
  assert.deepEqual(names.slice(at("deadline-recheck")), ["deadline-recheck", "working-on-seal", "working-on-attest"]);
  assert.deepEqual(NEW.map((n) => SCHEDULER_KEYS[n]), ["gatheringsweep", "workingonseal", "workingonattest"]);
  for (const n of NEW) assert.ok(SCHEDULER_ORDER.includes(n));
});

test("R5, R6: each new consumer calls exactly its owner's due, wake and tick, ticks only when its owner says it is due, and its answer is under its key", async () => {
  for (const n of NEW) {
    const other = NEW.filter((x) => x !== n);
    const answer = { ok: true, of: n };
    const { s, st, calls, set } = world({ [n]: { due: null, wake: NOW + 7000, tick: answer },
                                          ...Object.fromEntries(other.map((x) => [x, { wake: NOW + 9000 }])) });
    const idle = await s.onAlarm(NOW);
    assert.equal(SCHEDULER_KEYS[n] in idle, false, `${n}: not due, absent`);
    assert.equal(calls.some(([m]) => m === OWNED[n][2]), false, `${n}: its tick not called`);
    assert.equal(st.alarm, NOW + 7000, `${n}: its wake weighed`);
    set[n].due = NOW;
    const r = await s.onAlarm(NOW);
    assert.deepEqual(r[SCHEDULER_KEYS[n]], answer, `${n}: answered under ${SCHEDULER_KEYS[n]}`);
    for (const m of OWNED[n]) assert.ok(calls.some(([x]) => x === m), `${n}: ${m}`);
    assert.deepEqual(calls.filter(([m]) => m === OWNED[n][2]).map((c) => c[1]), [NOW], `${n}: ticked once, at the firing`);
    for (const x of other) assert.equal(SCHEDULER_KEYS[x] in r, false, `${x} did not tick at ${n}'s moment`);
    /* an owner's due of `true` is now, a past instant is due, a future one beyond the grace is not */
    set[n].due = NOW + 10_000;
    assert.equal(SCHEDULER_KEYS[n] in (await s.onAlarm(NOW)), false, `${n}: due later is not due now`);
  }
});

test("R3: a new consumer whose due, wake or tick throws is answered under its key as {error}; every other consumer still ticks and the reconcile runs", async () => {
  for (const n of NEW) {
    for (const what of ["due", "wake", "tick"]) {
      const others = NEW.filter((x) => x !== n);
      const { s, st } = world({ [n]: { due: NOW, wake: NOW + 100, throws: what },
                                ...Object.fromEntries(others.map((x) => [x, { due: NOW, wake: NOW + 500, tick: { ok: x } }])) });
      const r = await s.onAlarm(NOW);
      assert.deepEqual(r[SCHEDULER_KEYS[n]], { error: `${n} ${what} broke` }, `${n} ${what}`);
      for (const x of others) assert.deepEqual(r[SCHEDULER_KEYS[x]], { ok: x }, `${n} ${what}: ${x} still ticked`);
      const want = what === "wake" ? NOW + 500 : NOW + 100;
      assert.deepEqual([r.nextAt, st.alarm], [want, want], `${n} ${what}: the reconcile ran`);
    }
  }
});

test("R5: with no network-notices owner the registry holds neither of its consumers; with no monitoring owner, no gathering-sweep", () => {
  const w = world();
  assert.deepEqual(new Scheduler({ storage: storage(), owners: {} }).consumers(), []);
  const noNotices = new Scheduler({ storage: storage(), owners: { monitoring: () => w.o.monitoring } });
  assert.deepEqual(noNotices.consumers(), ["archive-monitor", "monitor-cadence", "gathering-sweep", "deadline-recheck"]);
  const noMonitoring = new Scheduler({ storage: storage(), owners: { networkNotices: () => w.o.networkNotices } });
  assert.deepEqual(noMonitoring.consumers(), ["working-on-seal", "working-on-attest"]);
});

test("R10: the gathering sweep receives the rank with its now; a sweep is ranked by what its bundle serves", async () => {
  assert.ok(RANKED.includes("gathering-sweep"));
  const served = { ok: true, truncated: false, serves: [{ kind: "bundle", id: "INFO-2026-0002-b", gaps: ["k"], aspirations: [] }] };
  const { s, calls } = world({ "gathering-sweep": { due: NOW }, serves: { tick: served } });
  await s.onAlarm(NOW);
  const [, now, rank] = calls.find(([m]) => m === "monitoring.sweepTick");
  assert.equal(now, NOW);
  assert.equal(typeof rank, "function", "the sweep tick is given the rank");
  const items = [{ kind: "sweep", id: "INFO-2026-0001-a#council", waitingSince: NOW - 9000 },
                 { kind: "sweep", id: "INFO-2026-0002-b#minutes", waitingSince: NOW - 10 },
                 { kind: "sweep", id: "INFO-2026-0001-a#agendas", waitingSince: NOW - 5000 }];
  calls.length = 0;
  const r = rank(items);
  assert.deepEqual(r.map((x) => x.id), ["INFO-2026-0002-b#minutes", "INFO-2026-0001-a#council", "INFO-2026-0001-a#agendas"],
    "the sweep whose bundle serves an open gap first, then by wait");
  assert.deepEqual(r[0].rank, { overdue: false, gaps: true, aspirations: false, waited_ms: 10 });
  assert.deepEqual(calls.filter(([m]) => m === "intent.servesOf").map((c) => c[1]),
    [{ addresses: [], bundles: ["INFO-2026-0001-a", "INFO-2026-0002-b"], requests: [] }], "intent asked once, of each bundle once");
  /* a sweep named without its bundle is ranked by its wait alone */
  assert.deepEqual(rankBy(() => served, [{ kind: "sweep", id: "nameless", waitingSince: NOW - 1 },
    { kind: "sweep", id: "INFO-2026-0002-b#x", waitingSince: NOW }], NOW).map((x) => x.id), ["INFO-2026-0002-b#x", "nameless"]);
});

test("R10: neither network-notices consumer is batch-bounded: each is given its now alone", async () => {
  const { s, calls } = world({ "working-on-seal": { due: NOW }, "working-on-attest": { due: NOW } });
  await s.onAlarm(NOW);
  for (const m of ["networkNotices.sealTick", "networkNotices.attestTick"])
    assert.deepEqual(calls.find(([x]) => x === m), [m, NOW], m);
});

/* ---- R9: the sweep arm, through promotion's notice (R45) ---- */

function promotionNotice() {
  const heard = [];
  return { promotion: { onCommitted: (module, fn) => { heard.push({ module, fn }); return { ok: true }; } }, heard,
           fire: async (p) => await heard[0].fn(p) };
}

test("R9: a promotion that ratifies or re-ratifies a sweep, on an idle instance, leaves the alarm armed at the sweep's wake; an unratified sweep's promotion arms nothing", async () => {
  const SWEEP = NOW + 3_600_000;
  /* monitoring otherwise wants nothing (unconfigured, no clock pending, no debt): only the sweep can ask */
  const { s, st, set } = world({ monitoring: { configured: false }, "gathering-sweep": { wake: null } });
  const p = promotionNotice();
  s.listenTo(p);
  assert.deepEqual(p.heard.map((h) => h.module), ["scheduler"]);
  /* negative control: the sweep is written but not ratified, so monitoring R56 answers no wake for it */
  st.log.length = 0;
  assert.equal(await p.fire({ bundleId: "INFO-2026-0001-a" }), null, "an unratified sweep's promotion arms nothing");
  assert.deepEqual(writes(st), []);
  assert.equal(st.alarm, null);
  /* ratified: monitoring R56's wake is the sweep's next run */
  set["gathering-sweep"].wake = SWEEP;
  assert.equal(await p.fire({ bundleId: "INFO-2026-0001-a" }), SWEEP);
  assert.equal(st.alarm, SWEEP, "armed at the sweep's wake");
  /* re-ratified with a sooner run: pulled earlier, never later */
  set["gathering-sweep"].wake = SWEEP - 1000;
  await p.fire({ bundleId: "INFO-2026-0001-a" });
  assert.equal(st.alarm, SWEEP - 1000);
  set["gathering-sweep"].wake = SWEEP + 1000;
  await p.fire({ bundleId: "INFO-2026-0001-a" });
  assert.equal(st.alarm, SWEEP - 1000, "a later wake never pushes it later (R4)");
});

test("R9, R17: the sweep arm only schedules: no sweep tick runs and nothing but the alarm is written", async () => {
  const { s, st, calls } = world({ monitoring: { configured: false }, "gathering-sweep": { due: NOW, wake: NOW + 5 } });
  const p = promotionNotice();
  s.listenTo(p);
  st.log.length = 0;
  await p.fire({ bundleId: "B" });
  assert.equal(calls.some(([m]) => m === "monitoring.sweepTick"), false);
  assert.deepEqual(writes(st).map(([m]) => m), ["setAlarm"]);
});

/* ---- R5 against the real network-notices ---- */

function nnScheduler(w) {
  const st = storage();
  return { st, s: new Scheduler({ storage: st, owners: { networkNotices: () => w.nn } }) };
}

test("R5: against the real network-notices, the alarm at a week's end runs its weekly seal, once, and wakes again at the next week's start", async () => {
  const w = nnWorld({ before: (x) => { x.member("alice"); } });
  const pid = w.project("seal", "alice");
  const lastWeek = monday(w.clock.now) - WEEK;
  w.act(pid, lastWeek + DAY, { author: V("alice") });
  const { s, st } = nnScheduler(w);
  const now = w.clock.now;
  const nextWeek = monday(now) + WEEK;
  const r = await s.onAlarm(now);
  assert.equal(r.workingonseal?.ok, true, JSON.stringify(r.workingonseal));
  assert.deepEqual(r.workingonseal.sealed.map((x) => [x.week.length > 0, x.projects]), [[true, 1]], "the last complete week sealed");
  assert.equal(w.count("nn_week_seals"), 1);
  assert.ok(st.alarm !== null && st.alarm <= nextWeek, "a wake at or before the next week's start");
  const again = await s.onAlarm(now + 1000);
  assert.equal("workingonseal" in again, false, "the week sealed: not due again");
  assert.equal(w.count("nn_week_seals"), 1);
  const next = await s.onAlarm(nextWeek);
  assert.equal(next.workingonseal?.ok, true, "the next week's end runs it again");
});

test("R5: against the real network-notices, working-on-attest runs its owner's attestations when its owner says it is due: the day's closing check, then the next month's monthly attestation", async () => {
  const w = seeded();
  const { s, st } = nnScheduler(w);
  const quiet = await s.onAlarm(w.clock.now);
  assert.equal("workingonattest" in quiet, false, "no notice open, no opening kept: not due");
  const posted = await post(w);
  const r = await s.onAlarm(w.clock.now);
  assert.deepEqual([r.workingonattest?.ok, r.workingonattest?.monthly], [true, []], JSON.stringify(r.workingonattest));
  assert.equal("workingonattest" in (await s.onAlarm(w.clock.now + 1000)), false, "the day's check made: not due again that day");
  const tomorrow = Math.floor(w.clock.now / DAY) * DAY + DAY;
  assert.equal(st.alarm, tomorrow, "wakes at the next UTC day while a notice is open");
  const month = Date.UTC(new Date(w.clock.now).getUTCFullYear(), new Date(w.clock.now).getUTCMonth() + 1, 1);
  w.clock.now = month;
  const m = await s.onAlarm(month);
  assert.deepEqual(m.workingonattest.monthly.map((x) => x.notice), [posted.notice], "the month's attestation issued");
  assert.equal(w.rows(`SELECT 1 FROM nn_attestations WHERE kind='monthly'`).length, 1);
  await s.onAlarm(month + 1000);
  assert.equal(w.rows(`SELECT 1 FROM nn_attestations WHERE kind='monthly'`).length, 1, "issued once");
});
