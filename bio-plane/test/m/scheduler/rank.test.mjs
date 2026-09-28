/* scheduler: ordering by intent (R10). The rank is built here from intent's `servesOf` (its R28) and passed with `now`
   to each batch-bounded tick; applying it to a batch is each owner's. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { rankBy, RANKED, SCHEDULER_ORDER } from "../../../src/scheduler/index.mjs";
import { world, NOW } from "./fixture.mjs";

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
  assert.deepEqual([...RANKED].sort(), ["archive-monitor", "bias-debt", "capture-request-drain", "monitor-cadence"]);
  const all = Object.fromEntries(SCHEDULER_ORDER.map((n) => [n, { due: 1 }]));
  for (const n of ["bias-debt", "archive-monitor", "monitor-cadence"]) all[n].due = NOW;
  const { s, calls } = world({ ...all, serves: { tick: { serves: [{ kind: "address", id: "g", gaps: ["k"], aspirations: [] }] } } });
  const got = {};
  s.register("legacy-store", { name: "queue-renotify", key: "queuerenotify", due: (t) => t, wake: () => null,
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
  for (const m of ["aiRuns.reap", "calibration.calibrationTick", "intent.ageSurfaced", "reevaluation.noticeSweep"])
    assert.equal(calls.find(([x]) => x === m).length, 2, `${m}: given now alone`);
  assert.ok(calls.some(([m]) => m === "intent.servesOf"));
});

test.todo("R10: each batch-bounded tick orders the work it takes by the rank when its due work exceeds its batch (not yet met: monitoring R19/R20, capture-requests R11–R12 and bias R33 state no rank; REPORT to BOB)");
