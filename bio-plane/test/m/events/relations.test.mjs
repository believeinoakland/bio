/* events: cited relations (R17–R20) and ACT- aliases (R21), at the interface. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, MEMBER, MACHINE } from "./fixture.mjs";
import { RELATION_KINDS } from "../../../src/events/index.mjs";

const doc = { kind: "document" };

test("R17 relate refuses in order UNKNOWN_RELATION, NO_ENDS, SELF_RELATION, NO_SUCH_EVENT naming the end, NO_ATTESTATION; held with two grades, the assertion's and its ends'", () => {
  const w = world();
  const a = w.event({ kind: "adoption", value: "2026-01-10" }).event_id;
  const b = w.event({ kind: "enactment", value: "2026-01-12" }).event_id;
  const s = w.capture("r17", { fetched: false });
  const rel = (x) => w.ev.relate({ from: a, to: b, kind: "authorises", attestation: { captureSha: s, extent: doc }, by: MEMBER, ...x });
  assert.deepEqual(RELATION_KINDS, ["authorises", "answers", "amends", "reverses", "stated_cause", "within"]);
  assert.equal(rel({ kind: "caused", from: "" }).reason, "UNKNOWN_RELATION");
  assert.equal(rel({ from: "" }).reason, "NO_ENDS");
  assert.equal(rel({ to: a }).reason, "SELF_RELATION");
  const ne = rel({ to: "EVT-2026-aaaaaaaaaaaaaaaa", attestation: null });
  assert.deepEqual([ne.reason, ne.end], ["NO_SUCH_EVENT", "to"]);
  assert.equal(rel({ attestation: null }).reason, "NO_ATTESTATION");
  const r = rel({});
  assert.equal(r.ok, true);
  assert.deepEqual(r.relation.grade, { assertion: w.prov.captureGrade(s).grade ?? null, ends: ["B", "B"] });
  assert.equal(rel({}).already, true);
  const v = w.ev.readEvent({ eventId: b, viewer: MEMBER }).event.relations[0];
  assert.deepEqual([v.kind, v.direction, v.from], ["authorises", "in", a]);
  assert.equal(w.ev.readEvent({ eventId: a, viewer: MEMBER }).event.when.value, "2026-01-10", "a relation's citation never governs an event's when");
});

test("R18 stated_cause is held only as a named source's claim: testimony refused CAUSE_NEEDS_SOURCE, a machine CAUSE_NOT_MACHINE; read as '<source> states'", () => {
  const w = world();
  const a = w.event({ value: "2026-02-01" }).event_id, b = w.event({ value: "2026-02-05" }).event_id;
  const s = w.capture("r18");
  assert.equal(w.ev.relate({ from: a, to: b, kind: "stated_cause", attestation: { testimony: "I think A led to B" }, by: MEMBER }).reason, "CAUSE_NEEDS_SOURCE");
  assert.equal(w.ev.relate({ from: a, to: b, kind: "stated_cause", attestation: { captureSha: s, extent: doc }, by: MACHINE }).reason, "CAUSE_NOT_MACHINE");
  const r = w.ev.relate({ from: a, to: b, kind: "stated_cause", attestation: { captureSha: s, extent: doc }, by: MEMBER });
  assert.equal(r.ok, true);
  for (const v of [r.relation, w.ev.readEvent({ eventId: a, viewer: MEMBER }).event.relations[0]]) {
    assert.match(v.says, /^the document [0-9a-f]{12}… states that one caused the other$/);
    assert.equal(v.asserted_by_record, false);
  }
});

test("R19 within holds a sub-event in a larger one; a within chain that would loop is refused WITHIN_CYCLE", () => {
  const w = world();
  const meeting = w.event({ value: "2026-03-01" }).event_id;
  const item = w.event({ kind: "vote" }).event_id;
  const sub = w.event({ kind: "statement" }).event_id;
  const s = w.capture("r19");
  const att = { captureSha: s, extent: doc };
  assert.equal(w.ev.relate({ from: item, to: meeting, kind: "within", attestation: att, by: MEMBER }).ok, true);
  assert.equal(w.ev.relate({ from: sub, to: item, kind: "within", attestation: att, by: MEMBER }).ok, true);
  assert.equal(w.ev.relate({ from: meeting, to: sub, kind: "within", attestation: att, by: MEMBER }).reason, "WITHIN_CYCLE");
  assert.equal(w.ev.relate({ from: meeting, to: item, kind: "within", attestation: att, by: MEMBER }).reason, "WITHIN_CYCLE");
  assert.deepEqual(w.ev.readEvent({ eventId: item, viewer: MEMBER }).event.within, [meeting]);
  /* the machine writes within and nothing else (R41) */
  const x = w.event({ kind: "publication" }).event_id;
  assert.equal(w.ev.relate({ from: x, to: meeting, kind: "within", attestation: att, by: MACHINE }).ok, true);
  assert.equal(w.ev.relate({ from: x, to: meeting, kind: "answers", attestation: att, by: MACHINE }).reason, "RELATION_NOT_MACHINE");
});

test("R20 withdrawRelation refuses NO_REASON and NO_SUCH_RELATION; a repeat answers already; a withdrawn relation remains, shown withdrawn with who, when and why", () => {
  const w = world();
  const a = w.event({ value: "2026-04-01" }).event_id, b = w.event({ value: "2026-04-02" }).event_id;
  const s = w.capture("r20");
  const id = w.ev.relate({ from: a, to: b, kind: "amends", attestation: { captureSha: s, extent: doc }, by: MEMBER }).relation.relation_id;
  assert.equal(w.ev.withdrawRelation({ relationId: id, reason: "", by: MEMBER }).reason, "NO_REASON");
  assert.equal(w.ev.withdrawRelation({ relationId: 999, reason: "r", by: MEMBER }).reason, "NO_SUCH_RELATION");
  const r = w.ev.withdrawRelation({ relationId: id, reason: "it amends another", by: "member:bob" });
  assert.deepEqual([r.relation.withdrawn.by, r.relation.withdrawn.reason], ["member:bob", "it amends another"]);
  assert.equal(w.ev.withdrawRelation({ relationId: id, reason: "again", by: MEMBER }).already, true);
  const v = w.ev.readEvent({ eventId: a, viewer: MEMBER }).event.relations;
  assert.equal(v.length, 1);
  assert.ok(v[0].withdrawn.at);
  assert.equal(w.rows(`SELECT * FROM event_relations`).length, 1, "nothing deleted");
});

test("R21 aliasAct refuses NO_ACT, NO_SUCH_EVENT, then ACT_ALIASED; eventForAct answers the event or found: false and never throws", () => {
  const w = world();
  const a = w.event({ value: "2026-05-01" }).event_id, b = w.event({ value: "2026-05-02" }).event_id;
  assert.equal(w.ev.aliasAct({ actId: "EVT-2026-0001", eventId: a, by: MEMBER }).reason, "NO_ACT");
  assert.equal(w.ev.aliasAct({ actId: "ACT-2026-0001", eventId: "EVT-2026-aaaaaaaaaaaaaaaa", by: MEMBER }).reason, "NO_SUCH_EVENT");
  assert.equal(w.ev.aliasAct({ actId: "ACT-2026-0001", eventId: a, by: MEMBER }).ok, true);
  assert.equal(w.ev.aliasAct({ actId: "ACT-2026-0001", eventId: a, by: MEMBER }).already, true);
  assert.equal(w.ev.aliasAct({ actId: "ACT-2026-0001", eventId: b, by: MEMBER }).reason, "ACT_ALIASED");
  assert.deepEqual(w.ev.eventForAct("ACT-2026-0001"), { ok: true, found: true, act_id: "ACT-2026-0001", event_id: a });
  assert.equal(w.ev.eventForAct("ACT-2026-0002").found, false);
  for (const x of [null, undefined, 7, {}, ""]) assert.equal(w.ev.eventForAct(x).found, false);
  /* through a merge, the act names the kept event */
  w.ev.mergeEvents({ keep: b, absorb: a, reason: "same", by: MEMBER });
  assert.equal(w.ev.eventForAct("ACT-2026-0001").event_id, b);
});
