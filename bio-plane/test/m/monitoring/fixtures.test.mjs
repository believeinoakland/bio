/* monitoring's published fixtures (fixtures.mjs): each is called and its answer compared with what the module's real code gives. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, DAEMON, NOW_MS } from "./fixture.mjs";
import { flaggedRefusal, monitorAnswer, monitoringReads } from "./fixtures.mjs";
import { FLAGGED_LIMIT_MAX, MONITOR_TICK_BATCH } from "../../../src/monitoring/index.mjs";

test("R48 flaggedRefusal: the unread answer of flagged, in words, with the default limit and a given one; the same read over a sound world is ok", () => {
  const r = flaggedRefusal();
  assert.deepEqual([r.ok, r.reason, r.items, r.truncated, r.limit], [false, null, [], false, FLAGGED_LIMIT_MAX]);
  assert.match(r.detail, /the flagged monitored documents could not be read/);
  assert.equal(flaggedRefusal({ limit: 7 }).limit, 7);
  assert.equal(world().m.flagged({ viewer: DAEMON }).ok, true, "control: a sound world reads");
});

test("R1 R8 R9 R10 monitorAnswer: one real answer per tick of the clock; a modified source brings a distinct capture each tick, an unchanged one none", async () => {
  const m = await monitorAnswer({ ticks: 3 });
  assert.equal(m.answers.length, 3);
  assert.equal(m.answer, m.answers[2]);
  for (const a of m.answers) assert.deepEqual([a.status, a.body.ok, a.body.status], [200, true, "modified"]);
  const shas = m.answers.map((a) => a.body.capture.sha256);
  assert.equal(new Set(shas).size, 3, "a digest for each tick");
  assert.deepEqual(m.answers.map((a) => a.body.checked), [0, 1, 2].map((i) => new Date(NOW_MS + i * 86400000).toISOString().replace(/\.\d+Z$/, "Z")));
  const q = await monitorAnswer({ ticks: 2, kind: "unchanged" });
  for (const a of q.answers) assert.deepEqual([a.status, a.body.ok, a.body.status, a.body.capture], [200, true, "unchanged", null]);
  await assert.rejects(monitorAnswer({ kind: "gone" }), /no kind/);
});

test("R16 R19 R20 R32 R47 R48 monitoringReads: empty over a world with no monitor; over seeded monitors, each state the module reads", async () => {
  const { empty, seeded } = await monitoringReads();
  assert.deepEqual([empty.monitoring.ok, empty.monitoring.items, empty.monitoring.truncated], [true, [], false]);
  assert.deepEqual([empty.archiveEligible.ok, empty.archiveEligible.eligible, empty.archiveEligible.limit, empty.archiveEligible.truncated],
    [true, [], MONITOR_TICK_BATCH, false]);
  assert.deepEqual(empty.flagged, { ok: true, items: [], limit: FLAGGED_LIMIT_MAX, truncated: false });
  assert.deepEqual([empty.configured, empty.archiveDue], [true, NOW_MS]);

  const b = seeded.bundles, state = (id) => seeded.monitoring.items.find((r) => r.bundle === id)?.state;
  assert.deepEqual(["unscheduled", "due", "scheduled"].map((s) => seeded.monitoring.items.some((r) => r.state === s)), [true, true, true]);
  assert.equal(state(b.unscheduled), "unscheduled");
  assert.equal(state(b.due), "due");
  for (const k of ["modified", "removed", "quiet"]) assert.equal(state(b[k]), "scheduled", k);
  assert.deepEqual(seeded.flagged.items.map((x) => [x.bundleId, x.source_status]),
    [[b.modified, "modified"], [b.removed, "removed"]], "flagged by a real tick, in id order; the quiet one is not");
  assert.deepEqual(seeded.archiveEligible.eligible.map((x) => x.address), [seeded.addresses.gone],
    "three failures are fallback-eligible; two in a young run are at the floor and not");
  assert.deepEqual([seeded.configured, seeded.archiveDue], [true, NOW_MS]);
});
