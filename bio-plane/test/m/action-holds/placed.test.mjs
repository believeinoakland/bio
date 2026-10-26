/* action-holds R5, R6, R22 (T51; fix round 10, SCREENS-ACTION #22 J36): a hold placed from a docket entry's legal mark or from a
   pressure record is found, previewed and released with the body that placed it; `holdsPlaced` lists every place a hold was
   stated, with its latest `hold`. Each with its control (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { docketEntryRead } from "../docket/fixtures.mjs";
import { world, V, received } from "./fixture.mjs";
import { actionHoldsOf, actionHoldsOps } from "../../../src/action-holds/index.mjs";

/* docket's published world (a real legal mark on an entry of project P), with this module started on it and no hold placed */
function docketWorld() {
  const { world: w, marked: entry, manager: viewer } = docketEntryRead();
  const h = actionHoldsOf(w.host, { record: w.record, membership: w.membership, now: () => w.clock.now, ratification: null,
                                    docket: w.docket, doorbell: null });
  return { w, h, viewer, entry };
}
const hold = (h, viewer, x) => h.actionHold({ hold: "in_place", reason: "keep", viewer, author: viewer, ...x });
const record = (h, project, viewer) => h.pressureRecord({ project, pressure: { kind: "legal", note: "a letter" }, account: "post", at: "2026-09-20", viewer, author: viewer });

test("R22 holdsPlaced lists a place a hold was stated at, with its latest hold, from, and covered projects; a hold placed from a docket mark is found after holdsDue drops it", () => {
  const { h, w, viewer, entry } = docketWorld();
  assert.deepEqual(h.holdsPlaced({ viewer }), { ok: true, items: [], limit: 500, truncated: false, cursor: null });
  assert.equal(hold(h, viewer, { project: w.P, from: { docket_entry: entry } }).ok, true);
  const r = h.holdsPlaced({ viewer });
  assert.equal(r.items.length, 1);
  const [x] = r.items;
  assert.deepEqual([x.place, x.hold, x.by, x.reason, x.from, x.projects], [{ project: w.P }, "in_place", viewer, "keep", [{ docket_entry: entry }], [w.P]]);
  assert.deepEqual(h.holdsDue({ viewer }).items.map((i) => i.arrived.docket_entry), [], "holdsDue no longer lists it");
  /* served as an op, exactly as the module answers it */
  const op = actionHoldsOps(h, new URL(`https://x/?viewer=${encodeURIComponent(viewer)}&limit=5`), null).holdsplaced();
  assert.deepEqual(op, h.holdsPlaced({ limit: 5, viewer }));
  /* control: a viewer who cannot name the project sees no place */
  assert.deepEqual(h.holdsPlaced({ viewer: V("nobody") }).items, []);
});

test("R22 holdsPlaced lists action and entry places in order, released ones as released, and pages with a cursor; an invisible action is in no page", () => {
  const w = world();
  const P = w.project("alice");
  const A = "ACTN-2026-0001-a", C = "ACTN-2026-0003-c", M = V("alice");
  w.action(A, [`project: ${P}`, ...received(2)]);
  w.action(C, [`project: ${w.project("carol")}`, ...received(1)], { author: V("carol") });
  assert.equal(hold(w.h, M, { target: A, ord: 1 }).ok, true);
  assert.equal(hold(w.h, M, { target: A }).ok, true);
  assert.equal(hold(w.h, V("carol"), { target: C }).ok, true);
  w.clock.ms += 1000;
  assert.equal(w.h.actionHoldRelease({ target: A, reason: "done", viewer: M, author: M }).ok, true);
  const all = w.h.holdsPlaced({ viewer: M });
  assert.deepEqual(all.items.map((i) => [i.place, i.hold]), [[{ target: A, ord: null }, "released"], [{ target: A, ord: 1 }, "in_place"]]);
  assert.ok(!JSON.stringify(all).includes(C), "carol's action is in no page of alice's");
  const one = w.h.holdsPlaced({ limit: 1, viewer: M });
  assert.deepEqual([one.items.length, one.truncated, typeof one.cursor], [1, true, "string"]);
  const two = w.h.holdsPlaced({ limit: 1, after: one.cursor, viewer: M });
  assert.deepEqual([...one.items, ...two.items], all.items);
  assert.equal(two.truncated, false);
});

test("R5 R6 a hold placed from a docket mark is previewed and released with the body that placed it, and reads released; a from naming none is refused", () => {
  const { h, w, viewer, entry } = docketWorld();
  const place = { project: w.P, from: { docket_entry: entry } };
  assert.equal(hold(h, viewer, place).ok, true);
  const pre = h.holdReleasePreview({ ...place, viewer });
  assert.deepEqual([pre.ok, pre.hold, pre.restarts], [true, "in_place", [w.P]]);
  const via = actionHoldsOps(h, new URL(`https://x/?viewer=${encodeURIComponent(viewer)}`), place).actionholdpreview();
  assert.deepEqual(via, pre, "the door reads the body's from");
  /* controls: a from that names no docket mark you see, at this place, is refused, writing nothing */
  for (const from of [{ docket_entry: "DKT-404" }, { pressure: `${w.P}#pressure/1` }, {}, { mark: { target: "ACTN-1", ord: 0 } }])
    for (const r of [h.holdReleasePreview({ project: w.P, from, viewer }), h.actionHoldRelease({ project: w.P, from, reason: "done", viewer, author: viewer })])
      assert.equal(r.reason, "HOLD_FROM_REFUSED", JSON.stringify(from));
  assert.equal(h.holdsOf({ project: w.P, viewer }).hold, "in_place", "the refusals wrote nothing");
  const rel = h.actionHoldRelease({ ...place, reason: "no longer needed", viewer, author: viewer });
  assert.deepEqual([rel.ok, rel.hold, rel.restarted, rel.from], [true, "released", [w.P], { docket_entry: entry }]);
  assert.equal(h.holdsPlaced({ viewer }).items[0].hold, "released");
  assert.equal(h.holdsOf({ docket_entry: entry, viewer }).hold, "released");
  /* control: a release without from is the project's own place and is already released */
  assert.equal(h.actionHoldRelease({ project: w.P, reason: "again", viewer, author: viewer }).reason, "HOLD_ALREADY_RELEASED");
});

test("R5 R6 R2 a hold placed from a pressure record: holdsOf takes {pressure}, preview and release take its from, and pressureFor reads its hold released", () => {
  const { h, w, viewer } = docketWorld();
  const rec = record(h, w.P, viewer);
  assert.equal(rec.ok, true, JSON.stringify(rec));
  const place = { project: w.P, from: { pressure: rec.pressure } };
  assert.equal(hold(h, viewer, place).ok, true);
  const by = h.holdsOf({ pressure: rec.pressure, viewer });
  assert.deepEqual([by.ok, by.project, by.hold, by.holds[0].from], [true, w.P, "in_place", { pressure: rec.pressure }]);
  assert.equal(h.holdReleasePreview({ ...place, viewer }).hold, "in_place");
  assert.equal(h.actionHoldRelease({ ...place, reason: "done", viewer, author: viewer }).ok, true);
  assert.equal(h.holdsOf({ pressure: rec.pressure, viewer }).hold, "released");
  assert.deepEqual(h.pressureFor({ project: w.P, viewer }).items.filter((i) => i.arrived.pressure).map((i) => i.hold), ["released"]);
  /* controls: an unknown record, and two places, are refused; a viewer who cannot see the project is told no such project */
  assert.equal(h.holdsOf({ pressure: `${w.P}#pressure/9`, viewer }).ok, false);
  assert.equal(h.holdsOf({ pressure: rec.pressure, project: w.P, viewer }).reason, "HOLD_PLACE_REFUSED");
  assert.equal(h.holdsOf({ pressure: rec.pressure, viewer: V("nobody") }).ok, false);
});
