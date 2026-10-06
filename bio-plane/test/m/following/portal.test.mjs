/* following R10, R11: a portal's dataset snapshotted on the tick, and the keyed field-level diff of two snapshots. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { validAt } from "../../../src/civil-time/index.mjs";
import { world, MEMBER, OUTSIDER, MACHINE, T0, DAY } from "./fixture.mjs";

const PORTAL = "https://data.ellery.example/resource/permits.json";

test("R10 followPortal follows a dataset keyed to its normalised query with a declared key; each tick captures the answer as a snapshot, a vintage valid at its capture instant", async () => {
  const w = world();
  assert.equal(w.f.followPortal({ address: PORTAL, key: "id", author: MACHINE }).reason, "MACHINE_CANNOT_FOLLOW");
  assert.equal(w.f.followPortal({ address: "ftp://data.ellery.example/x", key: "id", author: MEMBER, viewer: MEMBER }).reason, "NO_LOCATOR");
  assert.equal(w.f.followPortal({ address: PORTAL, key: " ", author: MEMBER, viewer: MEMBER }).reason, "NO_KEY");
  const r = w.f.followPortal({ address: `${PORTAL}?status=open&$limit=50`, key: "id", author: MEMBER, viewer: MEMBER });
  assert.equal(r.ok, true);
  /* one query written two ways is one follow: parameters sorted, host folded, those given apart joined */
  const same = w.f.followPortal({ address: "https://DATA.ellery.example/resource/permits.json?$limit=50", query: { status: "open" }, key: "id", author: MEMBER, viewer: MEMBER });
  assert.deepEqual([same.already, same.follow], [true, r.follow]);
  const keyed = w.f.follows({ viewer: MEMBER }).items[0].subject.address;
  assert.equal(keyed, "https://data.ellery.example/resource/permits.json?%24limit=50&status=open");
  w.serve(keyed, [{ id: "1", status: "open" }, { id: "2", status: "open" }]);
  const t = await w.f.followTick(T0);
  const c = t.captured[0];
  assert.equal(c.kind, "portal");
  assert.equal(c.snapshot, 1);
  assert.deepEqual(c.valid, { from: "2026-10-06T12:00:00", to: "2026-10-06T12:00:00", precision: "second", zone: "UTC" });
  assert.equal(validAt({ valid: c.valid }, { value: "2026-10-06T12:00:00", precision: "second", zone: "UTC" }), "in");
  assert.equal(validAt({ valid: c.valid }, { value: "2026-10-07", precision: "day", zone: "UTC" }), "out");
  /* a snapshot is a capture like any other, landed through the host */
  assert.equal(w.landed.at(-1).filed.locator, keyed);
  w.serve(keyed, "id,status\n1,closed\n3,open\n");
  await w.f.followTick(T0 + DAY);
  const s = w.f.snapshots({ follow: r.follow, at: { value: "2026-10-07T12:00:00", precision: "second", zone: "UTC" }, viewer: MEMBER });
  assert.deepEqual(s.snapshots.map((x) => [x.seq, x.at, x.valid_at]), [[1, "2026-10-06T12:00:00Z", "out"], [2, "2026-10-07T12:00:00Z", "in"]]);
  assert.equal(w.f.snapshots({ follow: r.follow, viewer: OUTSIDER }).ok, true, "a group-wide follow is seen by any member");
});

test("R11 snapshotDiff answers added and removed rows by key and each changed field {key, field, before, after}; a key missing or repeated is undetermined with its reason, never matched by position; it writes nothing", async () => {
  const w = world();
  w.project("PRJ-2026-0001-a");
  w.bundle("INFO-2026-0002-a", { project: "PRJ-2026-0001-a" });
  const f = w.f.followPortal({ address: PORTAL, key: "id", home: "INFO-2026-0002-a", author: MEMBER, viewer: MEMBER }).follow;
  w.serve(PORTAL, [{ id: "1", status: "open", fee: 10 }, { id: "2", status: "open" }, { id: "5", n: 1 }, { id: "5", n: 2 }, { status: "orphan" }]);
  await w.f.followTick(T0);
  w.serve(PORTAL, [{ id: "2", status: "open" }, { id: "1", status: "closed", fee: 10 }, { id: "4", status: "new" }, { id: "5", n: 3 }]);
  await w.f.followTick(T0 + DAY);
  const before = JSON.stringify(w.rows(`SELECT * FROM portal_snapshots`));
  const d = w.f.snapshotDiff({ follow: f, from: 1, to: 2, viewer: MEMBER });
  assert.equal(d.ok, true);
  assert.deepEqual(d.added, [{ key: "4", row: { id: "4", status: "new" } }]);
  assert.deepEqual(d.removed, []);
  assert.deepEqual(d.changed, [{ key: "1", field: "status", before: "open", after: "closed" }], "row 1 moved position and is still matched by key");
  assert.deepEqual(d.undetermined.map((u) => u.key), ["5", null]);
  assert.match(d.undetermined[0].why, /repeated in the earlier snapshot/);
  assert.match(d.undetermined[1].why, /carry no id/);
  assert.match(d.note, /never a finding/);
  assert.equal(JSON.stringify(w.rows(`SELECT * FROM portal_snapshots`)), before, "it writes nothing");
  /* the reverse removes what was added; the follow's sight is its home's */
  assert.deepEqual(w.f.snapshotDiff({ follow: f, from: 2, to: 1, viewer: MEMBER }).removed.map((r) => r.key), ["4"]);
  assert.equal(w.f.snapshotDiff({ follow: f, from: 1, to: 2, viewer: OUTSIDER }).reason, "NO_SUCH_FOLLOW");
  assert.equal(w.f.snapshotDiff({ follow: f, from: 1, to: 9, viewer: MEMBER }).reason, "NO_SUCH_SNAPSHOT");
  /* a snapshot that is not rows is undetermined whole */
  w.serve(PORTAL, "<html>maintenance</html>");
  await w.f.followTick(T0 + 2 * DAY);
  const u = w.f.snapshotDiff({ follow: f, from: 2, to: 3, viewer: MEMBER });
  assert.deepEqual([u.added, u.removed, u.changed], [[], [], []]);
  assert.equal(u.undetermined[0].snapshot, 3);
  assert.match(u.undetermined[0].why, /markup, not rows/);
});
