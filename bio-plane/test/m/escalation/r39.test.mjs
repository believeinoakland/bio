/* escalation R39: an action whose `clock_overdue` is true (actions R12/R110) meets an overdue stage trigger even when no
   entry is pending; the "action pending" note is drawn only when the action has neither a pending nor an overdue entry. */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, opened, V, ms } from "./fixture.mjs";

const read = (w, nowMs) => w.esc.escalationRead({ id: w.E, viewer: V("bob"), ...(nowMs ? { nowMs } : {}) });
const edge = (r, to) => r.triggers.find((t) => t.to === to);

const adv = (w, to) => w.esc.escalationAdvance({ id: w.E, to, reason: `to ${to}`, author: V("bob"), viewer: V("bob") });

function stage3With(clock) {
  const w = seeded();
  opened(w); adv(w, 2);
  const n = w.action({ project: w.P, restsOn: [w.D], clock });
  assert.equal(w.esc.escalationAttach({ reason: "This act serves the stage.", id: w.E, action: n, author: V("bob"), viewer: V("bob") }).ok, true);
  w.correspond(n, "sent", "2026-09-02");
  assert.equal(adv(w, 3).ok, true);
  return { w, n };
}

test("R39 an action whose only clock entry is stored overdue meets the stage 3 trigger, and draws no 'action pending' note; with no pending and no overdue entry the note is drawn", () => {
  const now = ms("2026-10-25T00:00:00Z");
  /* the stored-overdue entry is the only one */
  {
    const { w, n } = stage3With([{ date: "2026-10-01", status: "overdue" }]);
    const r = read(w, now);
    assert.equal(edge(r, 4).met, true);
    assert.deepEqual(edge(r, 4).ids, [n]);
    assert.deepEqual(r.notes.filter((x) => x.action === n), []);
  }
  /* a stored-overdue entry beside a later pending one */
  {
    const { w, n } = stage3With([{ date: "2026-10-01", status: "overdue" }, { date: "2026-10-30" }]);
    const r = read(w, now);
    assert.equal(edge(r, 4).met, true);
    assert.deepEqual(edge(r, 4).ids, [n]);
  }
  /* control: only a met entry, no pending and no overdue: the note, no trigger */
  {
    const { w, n } = stage3With([{ date: "2026-10-01", status: "met" }]);
    const r = read(w, now);
    assert.equal(edge(r, 4).met, false);
    assert.equal(r.notes.filter((x) => x.action === n).length, 1);
    assert.match(r.notes.find((x) => x.action === n).says, /never triggers by time/);
  }
  /* control: a pending entry not yet past: no trigger and no note */
  {
    const { w, n } = stage3With([{ date: "2026-12-30" }]);
    const r = read(w, now);
    assert.equal(edge(r, 4).met, false);
    assert.deepEqual(r.notes.filter((x) => x.action === n), []);
  }
});
