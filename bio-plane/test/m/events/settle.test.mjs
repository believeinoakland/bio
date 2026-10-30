/* events (T53, K5809): the defects the settled requirements refuse, at the interface: `sequence` fails closed for an
   absent viewer (Terms, R31, R51), `usesOf` leaves out a use whose event was withdrawn (R46, R61), a vote's check is the
   one recorded when it was written (R11), `from`/`to` never drop an item with no `when` (R27, R29, R33), and every
   undetermined order is shown, however far apart in start order (R29, R27, R33). */
import test from "node:test";
import assert from "node:assert/strict";
import { world, testView, MEMBER, OUTSIDER } from "./fixture.mjs";

const doc = { kind: "document" };
/* An event of `kind` attested by one dated fact of a fresh capture, its date `value` (a day, or an EDTF band as an object). */
const dated = (w, value, extra = {}) => w.event({ value, ...extra }).event_id;

test("R31 R51 Terms (Viewer) sequence with no viewer fails closed: it sees no event, so neither a cited relation nor a date order is answered, as for an absent event; a member who sees the citation gets it", () => {
  const w = world();
  const a = dated(w, "2026-07-01"), b = dated(w, "2026-07-01");
  const r = w.ev.relate({ from: a, to: b, kind: "precedes", attestation: { captureSha: w.capture("order"), extent: doc }, by: MEMBER });
  assert.equal(r.ok, true);
  const c = dated(w, "2026-07-03");
  for (const viewer of [undefined, null, ""]) {
    for (const [x, y] of [[a, b], [a, c]]) {
      const q = w.ev.sequence({ a: x, b: y, viewer });
      assert.equal(q.reason, "NO_SUCH_EVENT");
      assert.deepEqual([q.answer, q.basis, q.relation_id, q.why], [undefined, undefined, undefined, undefined]);
    }
  }
  /* control: a member sees the citation */
  const seen = w.ev.sequence({ a, b, viewer: MEMBER });
  assert.deepEqual([seen.answer, seen.basis, seen.relation_id], ["before", "cited", r.relation.relation_id]);
  /* control: dates that settle the order answer it to a member */
  const settled = w.ev.sequence({ a, b: c, viewer: MEMBER });
  assert.deepEqual([settled.answer, settled.basis], ["before", "dates"]);
});

test("R31 R40 (K5818) an event the viewer may not see is refused NO_SUCH_EVENT, as an absent one, alike, either way round: no order, date or why is answered for it; control: a viewer who sees both gets the order", () => {
  const w = world();
  w.project("PROJ-2026-0001-p", "bob");
  const open = dated(w, "2026-07-01");
  const fencedSha = w.capture("fenced", { bundleId: "INFO-2026-0009-h", project: "PROJ-2026-0001-p" });
  const hidden = w.event({ value: "2026-07-03", capture: fencedSha, by: "member:bob" }).event_id;
  assert.match(hidden, /^EVT-/);
  const ghost = "EVT-2026-9999";
  /* the outsider sees `open`, never `hidden` */
  assert.equal(w.ev.readEvent({ eventId: open, viewer: OUTSIDER }).found, true);
  assert.equal(w.ev.readEvent({ eventId: hidden, viewer: OUTSIDER }).found, false);
  const strip = (x) => ({ ...x, event_id: undefined });
  for (const [x, y, named] of [[open, hidden, hidden], [hidden, open, hidden]]) {
    const q = w.ev.sequence({ a: x, b: y, viewer: OUTSIDER });
    assert.equal(q.reason, "NO_SUCH_EVENT");
    assert.equal(q.event_id, named);
    assert.deepEqual([q.answer, q.why, q.basis], [undefined, undefined, undefined]);
    /* alike: the answer for a hidden event is the answer for one never held, but for the id as asked */
    const absent = w.ev.sequence({ a: x === hidden ? ghost : x, b: y === hidden ? ghost : y, viewer: OUTSIDER });
    assert.deepEqual(strip(q), strip(absent));
  }
  /* control: bob sees both, and the dates order them */
  assert.deepEqual([w.ev.sequence({ a: open, b: hidden, viewer: "member:bob" }).answer, w.ev.sequence({ a: hidden, b: open, viewer: "member:bob" }).answer], ["before", "after"]);
});

test("R46 R61 usesOf answers no use whose event was withdrawn by withdrawEvent, as none withdrawn by withdrawUse; the event stays readable, shown withdrawn; another use is still answered", () => {
  const w = world();
  const s = w.capture("decision");
  const director = w.entity("Dana Director"), owner = w.entity("Owen Owner");
  const use = (day) => w.ev.recordDiscretion({ kind: "discretion", provision: { standard: "STD-2026-0001" }, statedReason: "none",
    outcome: { value: "granted", extent: { captureSha: s, extent: doc } },
    attestations: [{ datedFactId: w.ev.recordDatedFact({ captureSha: s, extent: doc, kind: "signed", value: day, method: "read by a member", by: MEMBER }).dated_fact.dated_fact_id }],
    participants: [{ entityId: director, role: "decider", attestation: 0 }, { entityId: owner, role: "subject", attestation: 0 }], by: MEMBER });
  const kept = use("2026-03-04"), gone = use("2026-03-05"), used = use("2026-03-06");
  assert.ok(kept.ok && gone.ok && used.ok);
  const ids = () => w.ev.usesOf({ viewer: MEMBER }).items.map((i) => i.event_id).sort();
  assert.deepEqual(ids(), [kept.event_id, gone.event_id, used.event_id].sort());
  assert.equal(w.ev.withdrawEvent({ eventId: gone.event_id, reason: "recorded on the wrong file", by: MEMBER }).ok, true);
  assert.equal(w.ev.withdrawUse({ eventId: used.event_id, reason: "recorded wrongly", by: MEMBER }).ok, true);
  const r = w.ev.usesOf({ viewer: MEMBER });
  assert.deepEqual(r.items.map((i) => i.event_id), [kept.event_id]);
  assert.equal(r.count, 1);
  assert.deepEqual(w.ev.usesOf({ viewer: MEMBER, decider: director }).items.map((i) => i.event_id), [kept.event_id]);
  const v = w.ev.readEvent({ eventId: gone.event_id, viewer: MEMBER });
  assert.equal(v.found, true);
  assert.equal(v.event.withdrawn.by, MEMBER);
});

test("R11 a vote kept as written while no profile holds vote values reads vote_value_checked false with its why after a profile with values is added; a vote written against the values reads true; neither changes when the values change again", () => {
  let view = testView({ votes: "none" });
  const w = world({ view: () => view });
  const ev = w.ev.createEvent({ kind: "vote", attestations: [{ captureSha: w.capture("roll"), extent: doc }], by: MEMBER });
  const att = ev.attestation_ids[0];
  const early = w.entity("Ada Early"), late = w.entity("Lee Late"), made = w.entity("Mo Made");
  const before = w.ev.addParticipant({ eventId: ev.event_id, entityId: early, role: "voted", attestation: att, voteValue: "yes", by: MEMBER });
  assert.equal(before.ok, true);
  const created = w.ev.createEvent({ kind: "vote", attestations: [{ captureSha: w.capture("roll-2"), extent: doc }],
    participants: [{ entityId: made, role: "voted", voteValue: "yes", attestation: 0 }], by: MEMBER });
  assert.equal(created.ok, true);
  view = testView();
  const value = view.vocabulary.vote_values[0].value;
  const after = w.ev.addParticipant({ eventId: ev.event_id, entityId: late, role: "voted", attestation: att, voteValue: value, by: MEMBER });
  assert.equal(after.ok, true);
  const parts = (id) => Object.fromEntries(w.ev.readEvent({ eventId: id, viewer: MEMBER }).event.participants.map((p) => [p.entity_id, p]));
  const check = () => {
    const p = parts(ev.event_id), q = parts(created.event_id);
    for (const unchecked of [p[early], q[made]]) {
      assert.equal(unchecked.vote_value, "yes");
      assert.equal(unchecked.vote_value_checked, false);
      assert.equal(unchecked.vote_value_why.key, "events.vote_value_why");
    }
    assert.deepEqual([p[late].vote_value, p[late].vote_value_checked, p[late].vote_value_why], [value, true, undefined]);
  };
  check();
  view = testView({ votes: "none" });
  check();
  /* the timeline's participants read the same record (R50) */
  view = testView();
  const lane = w.ev.timeline({ set: [ev.event_id], viewer: MEMBER, lanes: ["world"] }).world, items = [...lane.items, ...lane.placed_nowhere];
  const tp = Object.fromEntries(items.find((i) => i.event_id === ev.event_id).participants.map((p) => [p.entity_id, p.vote_value_checked]));
  assert.deepEqual([tp[early], tp[late]], [false, true]);
  /* a corrected row keeps the check its row recorded (R13) */
  const fixed = w.ev.correctParticipant({ participantId: before.participant_id, entityId: made, reason: "the roll names another", by: MEMBER });
  assert.equal(fixed.ok, true);
  const now = w.ev.readEvent({ eventId: ev.event_id, viewer: MEMBER }).event.participants.find((p) => p.participant_id === fixed.participant_id);
  assert.equal(now.vote_value_checked, false);
});

test("R27 R29 R33 with from and to, eventsFor and statementsOf keep every item with no when, listed apart as placed_nowhere; a dated item outside the bounds is left out, one inside kept", () => {
  const w = world();
  const who = w.entity("Sam Speaker");
  const att = (value) => value === null ? { captureSha: w.capture(`c-${Math.random()}`), extent: doc }
    : { datedFactId: w.ev.recordDatedFact({ captureSha: w.capture(`c-${Math.random()}`), extent: doc, kind: "issued", value, method: "read by a member", by: MEMBER }).dated_fact.dated_fact_id };
  const said = (value) => w.ev.createEvent({ kind: "statement", attestations: [att(value)], participants: [{ entityId: who, role: "speaker", attestation: 0 }], by: MEMBER }).event_id;
  const inside = said("2026-05-10"), outside = said("2026-01-10"), nowhere = said(null);
  const bounds = { from: "2026-05-01", to: "2026-05-31" };
  for (const read of [(x) => w.ev.eventsFor({ entity: who, viewer: MEMBER, ...x }), (x) => w.ev.statementsOf({ entity: who, viewer: MEMBER, ...x })]) {
    const all = read({}), cut = read(bounds);
    const placed = (r) => (r.events || r.statements).map((i) => i.event_id);
    assert.deepEqual(placed(all).sort(), [inside, outside].sort());
    assert.deepEqual(all.placed_nowhere.map((i) => i.event_id), [nowhere]);
    assert.deepEqual(placed(cut), [inside]);
    assert.deepEqual(cut.placed_nowhere.map((i) => i.event_id), [nowhere]);
    assert.equal(cut.count, 2);
    assert.equal(read({ from: "2026-02-31" }).reason, "BAD_DATE");
  }
});

test("R29 R27 R33 every undetermined order is shown: a year band is marked undetermined with each of 60 days inside it, however far apart in start order, and each day with it; for every pair of the list the mark is the one sequence answers", () => {
  const w = world();
  const who = w.entity("Pat Party");
  const at = (value) => w.event({ value, participants: [{ entityId: who, role: "party", attestation: 0 }] }).event_id;
  const days = [];
  for (let i = 0; i < 60; i++) days.push(at(new Date(Date.UTC(2026, 1, 1 + i)).toISOString().slice(0, 10)));
  const year = at({ value: "2026", precision: "edtf" });
  const open = at({ value: "2026-03-15/..", precision: "edtf" });
  const after = at("2027-02-01"), minute = at("2026-02-10T09:30");
  const list = w.ev.eventsFor({ entity: who, viewer: MEMBER, limit: 500 });
  assert.equal(list.ok, true);
  const by = new Map(list.events.map((i) => [i.event_id, i]));
  assert.equal(by.size, 64);
  const yr = by.get(year);
  assert.equal(yr.order.undetermined, true);
  for (const d of days) assert.ok(yr.order.with.includes(d));
  for (const d of days) assert.ok(by.get(d).order.with.includes(year));
  assert.deepEqual([yr.order.band.start, yr.order.band.end], [yr.when.start, yr.when.end]);
  /* full compliance: each item's marks are exactly the items `sequence` answers undetermined with (R31) */
  for (const x of list.events) {
    const expect = list.events.filter((y) => y.event_id !== x.event_id
      && w.ev.sequence({ a: x.event_id, b: y.event_id, viewer: MEMBER }).answer === "undetermined").map((y) => y.event_id).sort();
    assert.deepEqual((x.order.with || []).slice().sort(), expect, x.event_id);
  }
  assert.ok(by.get(open).order.with.includes(after));
  assert.ok(by.get(minute).order.with.includes(days[9]));
  assert.ok(!by.get(days[0]).order.with.includes(days[1]));
});

test("R29 control: the timeline's world lane marks the same far-apart undetermined orders", () => {
  const w = world();
  const who = w.entity("Pat Party");
  const at = (value) => w.event({ value, participants: [{ entityId: who, role: "party", attestation: 0 }] }).event_id;
  const days = [];
  for (let i = 0; i < 60; i++) days.push(at(new Date(Date.UTC(2026, 1, 1 + i)).toISOString().slice(0, 10)));
  const year = at({ value: "2026", precision: "edtf" });
  const items = w.ev.timeline({ set: [who], viewer: MEMBER, lanes: ["world"], limit: 500 }).world.items;
  const yr = items.find((i) => i.event_id === year);
  assert.deepEqual(days.filter((d) => yr.order.with.includes(d)), days);
  assert.equal(w.ev.timeline({ set: [who], viewer: OUTSIDER, lanes: ["world"] }).ok, true);
});
