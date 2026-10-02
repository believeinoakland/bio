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
import { world as monWorld, infoMd, sweepDef, sha as monSha } from "../monitoring/fixture.mjs";

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
  /* wait equal: the sweep whose bundle serves an open gap ranks above one that serves nothing, whichever is offered first */
  const equal = [{ kind: "sweep", id: "INFO-2026-0001-a#council", waitingSince: NOW - 500 },
                 { kind: "sweep", id: "INFO-2026-0002-b#minutes", waitingSince: NOW - 500 }];
  for (const order of [equal, [...equal].reverse()])
    assert.deepEqual(rank(order).map((x) => x.id), ["INFO-2026-0002-b#minutes", "INFO-2026-0001-a#council"], "wait equal: the gap decides");
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

test("R5, R15: against the real network-notices, the alarm at a week's end runs its weekly seal, once; with nothing left to seal no alarm follows, and a member act in the week under way wakes it at that week's end", async () => {
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
  /* the only act sealed: network-notices' sealWake is null (its R14, N507), so no alarm is held (R15) */
  assert.equal(w.nn.sealWake(now), null, "nothing left to seal: the owner wants no wake");
  assert.deepEqual([r.nextAt, r.rearmed, st.alarm], [null, false, null], "an idle instance holds no timer");
  const again = await s.onAlarm(now + 1000);
  assert.equal("workingonseal" in again, false, "the week sealed: not due again");
  assert.equal(w.count("nn_week_seals"), 1);
  assert.equal(st.alarm, null);
  /* a member act in the week under way: the seal wakes at that week's end, the next week's start */
  w.act(pid, now + 2000, { author: V("alice") });
  assert.equal(await s.arm(now + 3000), nextWeek, "armed at the week's end");
  assert.equal(st.alarm, nextWeek);
  const quiet = await s.onAlarm(now + 4000);
  assert.equal("workingonseal" in quiet, false, "the week is not over: not due");
  assert.equal(st.alarm, nextWeek, "still waiting for the week's end");
  const next = await s.onAlarm(nextWeek);
  assert.equal(next.workingonseal?.ok, true, "the next week's end runs it again");
  assert.deepEqual(next.workingonseal.sealed.map((x) => x.projects), [1], "the week under way sealed");
  assert.equal(w.count("nn_week_seals"), 2);
  assert.deepEqual([next.nextAt, st.alarm], [null, null], "sealed: idle again");
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

/* ---- R5, R9, R10 against the real monitoring (its own test world, `test/m/monitoring/fixture.mjs`) ---- */

const PROJ = "PROJ-2026-0951-sched";
const SITE = "https://records.example.org/council";
const LISTS = ["INFO-2026-0951-a", "INFO-2026-0951-b"];

/** A monitoring world whose capture answers every fetch refused (a seed that fails is recorded, the run goes on,
 *  monitoring R57), and a writer of `data/gathering.json` on a list bundle in PROJ, by its owner alice. */
function sweepMonitoring() {
  const w = monWorld();
  w.inProject(PROJ, { owner: "alice" });
  const fetched = [];
  w.capture.acquire = async (body, opts) => {
    fetched.push(opts.captureRequest.origin.matched_sweep);
    return { status: 502, body: { ok: false, reason: "SOURCE_REFUSED", status: 503 } };
  };
  const write = (id, sweeps) => {
    const t = JSON.stringify({ sweeps });
    const r = w.promote(id, infoMd(id, `${SITE}/list`, { enabled: false, lines: [`project: ${PROJ}`] }),
      { files: [{ path: "data/gathering.json", text: t, bytes: Buffer.byteLength(t), sha256: monSha(t) }], author: "member:alice" });
    assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  };
  return { w, fetched, write };
}

test("R5, R10: gathering-sweep runs the real monitoring's sweepTick on the alarm its sweepDue says, given the rank: the sweep whose bundle serves an open gap runs first; without the rank, R56's order", async () => {
  const { w, fetched, write } = sweepMonitoring();
  for (const id of LISTS) write(id, [sweepDef()]);
  const intent = { servesOf: (named) => ({ ok: true, truncated: false,
    serves: named.bundles.map((id) => ({ kind: "bundle", id, gaps: id === LISTS[1] ? ["objective-open-gap"] : [], aspirations: [] })) }) };
  const s = new Scheduler({ storage: storage(), owners: { monitoring: () => w.m, intent: () => intent } });
  const now = w.clock.ms;
  assert.equal(w.m.sweepDue(now), now, "both never run: due");
  assert.equal(await s.arm(now), w.m.sweepWake(now), "armed at monitoring R56's wake");
  const r = await s.onAlarm(now);
  assert.deepEqual(r.gatheringsweep.ran.map((x) => x.sweep), [`${LISTS[1]}#minutes`, `${LISTS[0]}#minutes`],
    `the rank's order: ${JSON.stringify(r.gatheringsweep).slice(0, 300)}`);
  assert.equal(r.gatheringsweep.due, 2);
  assert.deepEqual(fetched, [`${LISTS[1]}#minutes`, `${LISTS[0]}#minutes`], "each seed fetched under its sweep, in that order");
  /* ran: neither is due again until its cadence passes, so the alarm is at their next run */
  assert.equal(w.m.sweepDue(now + 1000), null);
  assert.equal(r.nextAt, w.m.sweepWake(now), "the reconcile weighs the sweep's next run");
  /* negative control, the same sweeps in a fresh world: monitoring's own order (by full name) when no rank is given */
  const bare = sweepMonitoring();
  for (const id of LISTS) bare.write(id, [sweepDef()]);
  const t = await bare.w.m.sweepTick(bare.w.clock.ms);
  assert.deepEqual(t.ran.map((x) => x.sweep), [`${LISTS[0]}#minutes`, `${LISTS[1]}#minutes`]);
});

test("R3: a gathering sweep whose real owner throws is answered {error} under gatheringsweep, and the other consumers still tick", async () => {
  const { w, write } = sweepMonitoring();
  write(LISTS[0], [sweepDef()]);
  w.m.sweepTick = async () => { throw new Error("the sweep broke"); };
  const s = new Scheduler({ storage: storage(), owners: { monitoring: () => w.m } });
  const r = await s.onAlarm(w.clock.ms);
  assert.deepEqual(r.gatheringsweep, { error: "the sweep broke" });
  assert.equal(typeof r.monitor, "object", "the archive monitor, after it in no order but always due, still ticked");
});

test("R9: through the real promotion's notice, a promotion that ratifies a sweep on an idle instance leaves the alarm armed at the sweep's wake; the unratified sweep's promotion arms nothing", async () => {
  const { w, write } = sweepMonitoring();
  const st = storage();
  /* monitoring's real sweep services; its other arms idle and unconfigured, so only the sweep can ask for the arm (its
     other wakes reach modules whose tables monitoring's test world does not create) */
  const m = { configured: () => false, archiveDue: () => null, archiveWake: () => null, cadenceDue: () => null,
              cadenceWake: () => null, deadlineRecheckDue: () => null, deadlineRecheckWake: () => null,
              sweepDue: (now) => w.m.sweepDue(now), sweepWake: (now) => w.m.sweepWake(now), sweepTick: (now, rank) => w.m.sweepTick(now, rank) };
  const s = new Scheduler({ storage: st, owners: { monitoring: () => m } });
  s.listenTo({ promotion: w.promotion });
  assert.equal(await s.arm(Date.now()), null, "idle: no alarm");
  write(LISTS[0], [sweepDef({ ratified: false })]);
  await new Promise((ok) => setTimeout(ok, 0));
  assert.equal(st.alarm, null, "an unratified sweep: monitoring answers it no wake, so nothing is armed for it");
  const before = Date.now();
  write(LISTS[0], [sweepDef({ ratified: true })]);
  await new Promise((ok) => setTimeout(ok, 0));
  const after = Date.now();
  assert.ok(st.alarm !== null && st.alarm >= before + 1000 && st.alarm <= after + 1000,
    `armed at the sweep's wake, now + 1 s while it is due (monitoring R56): ${st.alarm}`);
});
