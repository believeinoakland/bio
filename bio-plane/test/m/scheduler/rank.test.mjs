/* scheduler: ordering by intent (R10). The rank is built here from intent's `servesOf` (its R28) and passed with `now`
   to each batch-bounded tick; applying it to a batch is each owner's, and the last test composes it with monitoring's
   real cadence tick. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { rankBy, RANKED, SCHEDULER_ORDER, Scheduler } from "../../../src/scheduler/index.mjs";
import { MONITOR_CADENCE_BATCH } from "../../../src/monitoring/index.mjs";
import { world, storage, NOW } from "./fixture.mjs";
import { world as monitoringWorld } from "../monitoring/fixture.mjs";

const H = 3600_000;
const serves = (map) => (named) => ({ ok: true, truncated: false,
  serves: [...named.addresses.map((id) => ["address", id]), ...named.bundles.map((id) => ["bundle", id]),
           ...named.requests.map((id) => ["request", id])]
    .map(([kind, id]) => ({ kind, id, gaps: (map[id] || {}).gaps || [], aspirations: (map[id] || {}).aspirations || [] })) });

test("R10: work serving an objective's open gap, then an aspiration in force, then longest-waiting", () => {
  const items = [
    { kind: "address", id: "plain-old", waitingSince: NOW - 5 * H, cadenceMs: 24 * H },
    { kind: "address", id: "aspired", waitingSince: NOW - 1 * H, cadenceMs: 24 * H },
    { kind: "bundle", id: "gap", waitingSince: NOW - 2 * 60_000, cadenceMs: 24 * H },
    { kind: "request", id: "plain-new", waitingSince: NOW - 1000, cadenceMs: 24 * H },
    { kind: "address", id: "both", waitingSince: NOW - 10, cadenceMs: 24 * H },
  ];
  const r = rankBy(serves({ aspired: { aspirations: ["ASP-1"] }, gap: { gaps: ["g1"] }, both: { gaps: ["g2"], aspirations: ["ASP-2"] } }), items, NOW);
  assert.deepEqual(r.map((x) => x.id), ["gap", "both", "aspired", "plain-old", "plain-new"]);
  assert.deepEqual(r[0].rank, { overdue: false, gaps: true, aspirations: false, waited_ms: 120_000 });
});

test("R10: no aspiration ranks above another: two items serving different aspirations order by their wait alone", () => {
  const items = [{ kind: "address", id: "a", waitingSince: NOW - 10 }, { kind: "address", id: "b", waitingSince: NOW - 20 }];
  const r = rankBy(serves({ a: { aspirations: ["ASP-group"] }, b: { aspirations: ["ASP-member", "ASP-project"] } }), items, NOW);
  assert.deepEqual(r.map((x) => x.id), ["b", "a"]);
});

test("R10: work that has waited longer than one whole cadence of its own goes first, so priority orders and never starves", () => {
  const items = [
    { kind: "address", id: "gap", waitingSince: NOW - 1 * H, cadenceMs: 24 * H },
    { kind: "address", id: "starving", waitingSince: NOW - 25 * H, cadenceMs: 24 * H },
    { kind: "address", id: "exactly-one-cadence", waitingSince: NOW - 24 * H, cadenceMs: 24 * H },
  ];
  const r = rankBy(serves({ gap: { gaps: ["g"] } }), items, NOW);
  assert.deepEqual(r.map((x) => x.id), ["starving", "gap", "exactly-one-cadence"]);
  assert.equal(r[0].rank.overdue, true);
});

test("R10: intent is asked once, naming every subject by kind; one that throws or answers nothing ranks by wait alone", () => {
  const asked = [];
  const items = [{ kind: "address", id: "x", waitingSince: NOW - 1 }, { kind: "bundle", id: "y", waitingSince: NOW - 3 },
                 { kind: "request", id: "z", waitingSince: NOW - 2 }, { kind: "other", id: "w", waitingSince: NOW }];
  rankBy((n) => { asked.push(n); return { serves: [] }; }, items, NOW);
  assert.deepEqual(asked, [{ addresses: ["x"], bundles: ["y"], requests: ["z"] }]);
  for (const bad of [() => { throw new Error("no"); }, () => null, () => ({ ok: false }), null])
    assert.deepEqual(rankBy(bad, items, NOW).map((x) => x.id), ["y", "z", "x", "w"]);
  assert.deepEqual(rankBy(serves({}), "not a list", NOW), []);
});

test("R10: each batch-bounded tick receives the rank with its now, reading intent's servesOf; no other tick does", async () => {
  assert.deepEqual([...RANKED].sort(), ["archive-monitor", "bias-debt", "capture-request-drain", "gathering-sweep", "monitor-cadence"]);
  const all = Object.fromEntries(SCHEDULER_ORDER.map((n) => [n, { due: 1 }]));
  for (const n of ["bias-debt", "archive-monitor", "monitor-cadence", "deadline-recheck"]) all[n].due = NOW;
  const { s, calls } = world({ ...all, serves: { tick: { serves: [{ kind: "address", id: "g", gaps: ["k"], aspirations: [] }] } } });
  const got = {};
  s.register("queue", { name: "queue-renotify", key: "queuerenotify", due: (t) => t, wake: () => null,
                               tick: (now, rank) => { got["queue-renotify"] = rank; return {}; } });
  await s.onAlarm(NOW);
  const drainRank = calls.find(([m]) => m === "captureRequests.drain")[1].rank;
  const biasRank = calls.find(([m]) => m === "bias.biasDebtSweep")[2];
  const archiveRank = calls.find(([m]) => m === "monitoring.archiveTick")[2];
  const cadenceRank = calls.find(([m]) => m === "monitoring.cadenceTick")[2];
  for (const rank of [archiveRank, cadenceRank, drainRank, biasRank]) {
    assert.equal(typeof rank, "function");
    const r = rank([{ kind: "address", id: "p", waitingSince: NOW - 9 }, { kind: "address", id: "g", waitingSince: NOW - 1 }]);
    assert.deepEqual(r.map((x) => x.id), ["g", "p"]);
  }
  assert.equal(got["queue-renotify"], undefined, "a tick that is not batch-bounded receives no rank");
  for (const m of ["aiRuns.reap", "calibration.calibrationTick", "intent.ageSurfaced", "reevaluation.noticeSweep",
                   "monitoring.deadlineRecheck"])
    assert.equal(calls.find(([x]) => x === m).length, 2, `${m}: given now alone`);
  assert.ok(calls.some(([m]) => m === "intent.servesOf"));
});

/* R10 composed with its first consumer: the real monitoring (its own test world, `test/m/monitoring/fixture.mjs`) holds
   more due subjects than one cadence batch, and the scheduler's alarm hands its rank to monitoring's `cadenceTick`
   (monitoring R19, N224). The subjects serving an objective's open gap sit at the tail of R16's order, past the batch,
   so only the rank brings them in. */
async function rankedCadence({ gapsServed = true } = {}) {
  const w = monitoringWorld();
  const iso = (ms) => new Date(ms).toISOString().replace(/\.\d+Z$/, "Z");
  const N = MONITOR_CADENCE_BATCH + 12;
  for (let i = 0; i < N; i++) {
    const id = `INFO-2026-9${String(i).padStart(3, "0")}-ranked`;
    w.st.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, current_state, created, last_updated, bundle_sha)
      VALUES (?, 'information', 'test-group', 'collected', ?, ?, ?)`, id, iso(NOW), iso(NOW), "0".repeat(64));
    w.st.sql.exec(`INSERT INTO bundle_projection (bundle_id, monitor_enabled, monitor_frequency, source_locator)
      VALUES (?, 1, 'daily', ?)`, id, `https://ranked.example.org/${i}`);
  }
  const asked = [];
  w.m.monitor = async ({ bundleId }) => { asked.push(bundleId); return { status: 200, body: { ok: true, status: "unchanged" } }; };
  const due = w.m.plan(NOW).due;
  const subject = (d) => ({ kind: d.address ? "address" : "bundle", id: d.address || d.bundle });
  const gapped = due.slice(-10);
  const intent = { servesOf: (named) => ({ ok: true, truncated: false,
    serves: gapsServed ? gapped.map((d) => ({ ...subject(d), gaps: ["objective-open-gap"], aspirations: [] })) : [] }) };
  const s = new Scheduler({ storage: storage(), owners: { monitoring: () => w.m, intent: () => intent } });
  return { w, s, due, gapped, asked, plain: due.map((d) => d.bundle) };
}

test("R10: given the alarm's rank, monitoring's real cadence tick over more due subjects than one batch checks the rank's head, the gap-serving tail first; without the rank, R16's order", async () => {
  const { s, due, gapped, asked, plain } = await rankedCadence();
  assert.ok(due.length > MONITOR_CADENCE_BATCH, `more due than one batch: ${due.length}`);
  const r = await s.onAlarm(NOW);
  assert.equal(r.monitorcadence?.candidates, due.length, JSON.stringify(r.monitorcadence).slice(0, 300));
  const head = [...gapped.map((d) => d.bundle), ...plain.filter((b) => !gapped.some((d) => d.bundle === b))]
    .slice(0, MONITOR_CADENCE_BATCH);
  assert.deepEqual(asked, head, "the batch checked is the rank's head: gap-serving work first, then the rest by wait");
  assert.deepEqual(r.monitorcadence.ticked.map((t) => t.bundle), head);
  /* negative controls, over the same due subjects: so the test sees the rank, not R16's order */
  const bare = await rankedCadence();
  await bare.w.m.cadenceTick(NOW);
  assert.deepEqual(bare.asked, plain.slice(0, MONITOR_CADENCE_BATCH), "without the rank: R16's order");
  assert.ok(gapped.every((d) => !bare.asked.includes(d.bundle)), "R16's order alone never reaches the gap-serving tail");
  const none = await rankedCadence({ gapsServed: false });
  await none.s.onAlarm(NOW);
  assert.deepEqual(none.asked, plain.slice(0, MONITOR_CADENCE_BATCH), "intent naming no gap: the wait alone, R16's order kept");
  const reversed = await rankedCadence();
  await reversed.w.m.cadenceTick(NOW, (items) => [...items].reverse());
  assert.deepEqual(reversed.asked, [...plain].reverse().slice(0, MONITOR_CADENCE_BATCH), "another rank: another batch");
  assert.notDeepEqual(reversed.asked, asked);
});
