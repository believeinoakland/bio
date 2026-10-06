/* events: the reads (R26–R34) and sight (R40), at the interface. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, testView, MEMBER, OUTSIDER } from "./fixture.mjs";
import { LIMIT_MAX } from "../../../src/events/index.mjs";

const doc = { kind: "document" };

test("R26 readEvent: NO_EVENT for an empty id, found: false for an absent one, an alias answers its kept event; it answers kind, status, when, where, concerns, within, attestations with grades, participants with superseded rows, relations in and out, merges and splits", () => {
  const w = world();
  assert.equal(w.ev.readEvent({ eventId: "", viewer: MEMBER }).reason, "NO_EVENT");
  assert.deepEqual(w.ev.readEvent({ eventId: "EVT-2026-aaaaaaaaaaaaaaaa", viewer: MEMBER }), { ok: true, found: false, event_id: "EVT-2026-aaaaaaaaaaaaaaaa" });
  const p = w.entity("Ada"), q = w.entity("Bea");
  const meeting = w.event({ value: "2026-04-01", where: "the town hall", concerns: [p], participants: [{ entityId: p, role: "present", attestation: 0 }] }).event_id;
  const item = w.event({ kind: "vote" }).event_id;
  const s = w.capture("r26");
  w.ev.relate({ from: item, to: meeting, kind: "within", attestation: { captureSha: s, extent: doc }, by: MEMBER });
  const pid = w.rows(`SELECT participant_id FROM event_participants`)[0].participant_id;
  w.ev.correctParticipant({ participantId: pid, entityId: q, reason: "misread", by: MEMBER });
  const dup = w.event({ value: "2026-04-01" }).event_id;
  w.ev.mergeEvents({ keep: meeting, absorb: dup, reason: "same meeting", by: MEMBER });
  const v = w.ev.readEvent({ eventId: dup, viewer: MEMBER });
  assert.equal(v.alias_of, meeting);
  const e = v.event;
  for (const k of ["kind", "status", "when", "where", "concerns", "within", "attestations", "participants", "relations", "merges_and_splits"]) assert.ok(k in e, k);
  assert.equal(e.where, "the town hall");
  assert.deepEqual(e.concerns, [p]);
  assert.ok(e.attestations.every((a) => "grade" in a));
  assert.equal(e.participants.filter((x) => x.superseded).length, 1);
  assert.deepEqual(e.relations.map((r) => [r.kind, r.direction, r.from]), [["within", "in", item]]);
  assert.deepEqual(w.ev.readEvent({ eventId: item, viewer: MEMBER }).event.within, [meeting]);
  assert.equal(e.merges_and_splits[0].kind, "merged_in");
});

test("R27 eventsFor: the events an entity takes part in or that concern it, in R31's order with its roles; limit clamped 1–500 (default 100), truncated by reading one past", () => {
  const w = world();
  const p = w.entity("Cal");
  assert.equal(w.ev.eventsFor({ entity: "", viewer: MEMBER }).reason, "NO_ENTITY");
  for (const d of ["2026-03-03", "2026-01-01", "2026-02-02"]) w.event({ value: d, participants: [{ entityId: p, role: "speaker", attestation: 0 }] });
  const c = w.event({ value: "2026-01-15", concerns: [p] }).event_id;
  w.event({ value: "2026-01-16" });
  const r = w.ev.eventsFor({ entity: p, viewer: MEMBER });
  assert.deepEqual(r.events.map((e) => e.when.value), ["2026-01-01", "2026-01-15", "2026-02-02", "2026-03-03"]);
  assert.deepEqual(r.events.find((e) => e.event_id === c).roles, []);
  assert.equal(r.events.find((e) => e.event_id === c).concerns, true);
  assert.deepEqual(r.events[0].roles, ["speaker"]);
  assert.equal(r.limit, 100);
  const two = w.ev.eventsFor({ entity: p, limit: 2, viewer: MEMBER });
  assert.deepEqual([two.events.length, two.truncated, two.limit], [2, true, 2]);
  assert.equal(w.ev.eventsFor({ entity: p, limit: 9999, viewer: MEMBER }).limit, LIMIT_MAX);
  assert.equal(w.ev.eventsFor({ entity: p, limit: 0, viewer: MEMBER }).limit, 100);
  assert.equal(w.ev.eventsFor({ entity: p, limit: -4, viewer: MEMBER }).limit, 1);
  assert.equal(w.ev.eventsFor({ entity: p, kinds: ["vote"], viewer: MEMBER }).events.length, 0);
  assert.deepEqual(w.ev.eventsFor({ entity: p, from: "2026-01-10", to: "2026-02-28", viewer: MEMBER }).events.map((e) => e.when.value), ["2026-01-15", "2026-02-02"]);
});

test("R28 R30 timeline: an explicit set (NO_SET when empty), the world's events and, apart, each registered source's items; the lanes never interleaved; a source that throws answered as {source, error} beside the others", () => {
  const w = world();
  const p = w.entity("Dee");
  assert.equal(w.ev.timeline({ set: [], viewer: MEMBER }).reason, "NO_SET");
  w.event({ value: "2026-05-05", participants: [{ entityId: p, role: "actor", attestation: 0 }] });
  assert.equal(w.ev.registerEventSource("actions", ({ set }) => [{ at: "2026-05-06T10:00:00Z", label: "we wrote", ref: "ACTN-2026-0001-x", kind: "letter", set }]).ok, true);
  assert.equal(w.ev.registerEventSource("escalation", () => { throw new Error("down"); }).ok, true);
  assert.equal(w.ev.registerEventSource("actions", () => []).reason, "LISTENER_DECLARED");
  assert.equal(w.ev.registerEventSource("docket", "x").reason, "LISTENER_MALFORMED");
  const t = w.ev.timeline({ set: [p], viewer: MEMBER });
  assert.equal(t.world.label, "what they did");
  assert.equal(t.world.items.length, 1);
  assert.equal(t.ours.label, "what we did");
  assert.deepEqual(t.ours.sources.map((s) => s.source), ["actions", "escalation"], "MODULE_ORDER");
  assert.deepEqual(t.ours.sources[0].items.map(({ order, ...x }) => x), [{ at: "2026-05-06T10:00:00Z", label: "we wrote", ref: "ACTN-2026-0001-x", kind: "letter" }]);
  assert.match(t.ours.sources[1].error, /down/);
  assert.ok(!t.world.items.some((i) => "ref" in i), "no item of ours in the world's lane");
  assert.deepEqual(Object.keys(w.ev.timeline({ set: [p], lanes: ["world"], viewer: MEMBER })).sort(), ["ok", "set", "world"]);
});

test("R29 within a lane items in R31's order, undetermined orders shown with their bands, items with no when apart as placed nowhere; limit per lane", () => {
  const w = world();
  const p = w.entity("Eve");
  const part = [{ entityId: p, role: "present", attestation: 0 }];
  const day = w.event({ value: "2026-06-10", participants: part }).event_id;
  const minute = w.event({ value: "2026-06-10T14:00", participants: part }).event_id;
  const later = w.event({ value: "2026-06-12", participants: part }).event_id;
  const nowhere = w.event({ participants: part }).event_id;
  const t = w.ev.timeline({ set: [p], viewer: MEMBER }).world;
  assert.deepEqual(t.items.map((i) => i.event_id), [day, minute, later]);
  const d = t.items[0];
  assert.deepEqual([d.order.undetermined, d.order.with, d.order.band], [true, [minute], { start: "2026-06-10T03:00:00Z", end: "2026-06-11T03:00:00Z" }]);
  assert.equal(t.items[2].order.undetermined, false);
  assert.deepEqual(t.placed_nowhere.map((i) => i.event_id), [nowhere]);
  assert.equal(w.ev.timeline({ set: [p], limit: 1, viewer: MEMBER }).world.truncated, true);
});

test("R31 sequence: before, after or undetermined with why, through civil-time.compare; a day band against a minute in it is undetermined, equal values undetermined, no when placed nowhere; never stored", () => {
  const w = world();
  const a = w.event({ value: "2026-07-01" }).event_id;
  const b = w.event({ value: "2026-07-01T10:00" }).event_id;
  const c = w.event({ value: "2026-07-02T09:00" }).event_id;
  const a2 = w.event({ value: "2026-07-01" }).event_id;
  const n = w.event({}).event_id;
  const s = (x, y) => w.ev.sequence({ a: x, b: y });
  assert.equal(s(a, c).answer, "before");
  assert.equal(s(c, a).answer, "after");
  assert.equal(s(b, c).answer, "before");
  const band = s(a, b);
  assert.equal(band.answer, "undetermined");
  assert.match(band.why, /overlap|precision/);
  assert.match(s(a, a2).why, /both are 2026-07-01/);
  assert.match(s(a, n).why, /placed nowhere/);
  assert.equal(s(a, "EVT-2026-aaaaaaaaaaaaaaaa").reason, "NO_SUCH_EVENT");
  const stored = w.rows(`SELECT name FROM sqlite_master WHERE type='table'`).map((r) => r.name).filter((x) => !x.startsWith("sqlite_") && /sequence|order/.test(x));
  assert.deepEqual(stored, []);
});

test("R32 whoWasSent: a communication, issuance or meeting's senders, recipients, copied and present, each with its attestation, in the words sent to, copied, present; never knew or saw", () => {
  const w = world();
  const [s1, r1, c1, x1] = ["Fay", "Gus", "Hal", "Ivy"].map((n) => w.entity(n));
  const e = w.event({ kind: "communication", value: "2026-08-01", participants: [
    { entityId: s1, role: "sender", attestation: 0 }, { entityId: r1, role: "recipient", attestation: 0 },
    { entityId: c1, role: "copied", attestation: 0 }, { entityId: x1, role: "subject", attestation: 0 }] }).event_id;
  const r = w.ev.whoWasSent({ eventId: e, viewer: MEMBER });
  assert.deepEqual(r.participants.map((p) => [p.entity_id, p.words]), [[s1, "sent by"], [r1, "sent to"], [c1, "copied"]]);
  assert.ok(r.participants.every((p) => p.attestation && p.attestation.attestation_id));
  assert.ok(!/\b(knew|saw)\b/.test(JSON.stringify(r.participants)));
  assert.equal(w.ev.whoWasSent({ eventId: w.event({ kind: "payment", value: "2026-08-02" }).event_id, viewer: MEMBER }).reason, "NOT_A_COMMUNICATION");
  const m = w.event({ kind: "meeting", value: "2026-08-03", participants: [{ entityId: x1, role: "present", attestation: 0 }] }).event_id;
  assert.deepEqual(w.ev.whoWasSent({ eventId: m, viewer: MEMBER }).participants.map((p) => p.words), ["present"]);
});

test("R33 statementsOf: an entity's statement and communication events as speaker, sender, author or actor, in R31's order, bounded as R27", () => {
  const w = world();
  const p = w.entity("Jo");
  w.event({ kind: "statement", value: "2026-09-02", participants: [{ entityId: p, role: "speaker", attestation: 0 }] });
  w.event({ kind: "communication", value: "2026-09-01", participants: [{ entityId: p, role: "author", attestation: 0 }] });
  w.event({ kind: "communication", value: "2026-09-03", participants: [{ entityId: p, role: "recipient", attestation: 0 }] });
  w.event({ kind: "meeting", value: "2026-09-04", participants: [{ entityId: p, role: "speaker", attestation: 0 }] });
  const r = w.ev.statementsOf({ entity: p, viewer: MEMBER });
  assert.deepEqual(r.statements.map((s) => [s.kind, s.when.value]), [["communication", "2026-09-01"], ["statement", "2026-09-02"]]);
  assert.equal(w.ev.statementsOf({ entity: p, limit: 1, viewer: MEMBER }).truncated, true);
  assert.equal(w.ev.statementsOf({ entity: "", viewer: MEMBER }).reason, "NO_ENTITY");
});

test("R34 proceedingStatusAt refuses NO_ENTITY, NO_SUCH_ENTITY, NOT_A_PROCEEDING; answers the profile flow's stage the held events reach on a date with what it rests on, else undetermined with why, never a stage by default", () => {
  const view = testView();
  view.proceeding_flows = [{ kind: "commitment_suit", stages: [
    { stage: "filed", label: "filed", reached_by: ["filing"] }, { stage: "heard", label: "heard", reached_by: ["hearing"] },
    { stage: "decided", label: "decided", reached_by: ["order"] }], citation: "Marlow Ct. R. 2", basis: "TEST" }];
  const w = world({ view });
  const proc = w.proceeding("Suit one");
  const other = w.proceeding("Inquiry", "harbour_inquiry");
  const person = w.entity("Kim");
  const st = (at, p = proc) => w.ev.proceedingStatusAt({ proceeding: p, at, viewer: MEMBER });
  assert.equal(w.ev.proceedingStatusAt({ proceeding: "", at: "2026-01-01", viewer: MEMBER }).reason, "NO_ENTITY");
  assert.equal(st("2026-01-01", "ENT-2026-9999").reason, "NO_SUCH_ENTITY");
  assert.equal(st("2026-01-01", person).reason, "NOT_A_PROCEEDING");
  assert.match(st("2026-01-01").why, /no held event/);
  assert.match(st("2026-01-01", other).why, /no active profile holds a flow/);
  const filed = w.event({ kind: "filing", value: "2026-02-01", concerns: [proc] }).event_id;
  w.event({ kind: "hearing", value: "2026-03-10", concerns: [proc] });
  assert.match(st("2026-01-15").why, /no held event/);
  const a = st("2026-02-15");
  assert.deepEqual([a.stage, a.label, a.rests_on.map((x) => x.event_id), a.citation], ["filed", "filed", [filed], "Marlow Ct. R. 2"]);
  assert.equal(st("2026-04-01").stage, "heard");
  const und = st("2026-03-10T12:00:00Z");
  assert.equal(und.stage, "undetermined", "a day-precision hearing against an instant inside that day");
  w.event({ kind: "order", concerns: [proc] });
  assert.equal(st("2026-04-01").stage, "undetermined", "an order placed nowhere leaves the later stage undetermined");
});

test("R40 sight: an event, dated fact or relation is answered only through attestations whose capture the viewer may see; one with none visible is neither answered nor counted; testimony inside a hidden project fenced", () => {
  const w = world();
  w.project("PROJ-2026-0001-hidden", "bob");
  const hidden = w.capture("hidden", { bundleId: "INFO-2026-0002-h", project: "PROJ-2026-0001-hidden" });
  const open = w.capture("open");
  const p = w.entity("Lu");
  const onlyHidden = w.ev.createEvent({ kind: "meeting", attestations: [{ captureSha: hidden, extent: doc }],
                                       participants: [{ entityId: p, role: "present", attestation: 0 }], by: "member:bob" }).event_id;
  const mixed = w.ev.createEvent({ kind: "meeting", attestations: [{ captureSha: open, extent: doc }, { captureSha: hidden, extent: doc }],
                                  participants: [{ entityId: p, role: "present", attestation: 1 }], by: "member:bob" }).event_id;
  const fenced = w.ev.createEvent({ kind: "statement", attestations: [{ testimony: "said in our project", project: "PROJ-2026-0001-hidden" }],
                                   participants: [{ entityId: p, role: "speaker", attestation: 0 }], by: "member:bob" }).event_id;
  assert.equal(w.ev.readEvent({ eventId: onlyHidden, viewer: OUTSIDER }).found, false);
  assert.equal(w.ev.readEvent({ eventId: onlyHidden, viewer: "member:bob" }).found, true);
  assert.equal(w.ev.readEvent({ eventId: fenced, viewer: OUTSIDER }).found, false);
  const m = w.ev.readEvent({ eventId: mixed, viewer: OUTSIDER }).event;
  assert.equal(m.attestations.length, 1);
  assert.equal(m.participants.length, 0, "a participant resting on a hidden capture is withheld");
  assert.equal(w.ev.eventsFor({ entity: p, viewer: OUTSIDER }).count, 0, "nothing hidden is counted");
  assert.equal(w.ev.eventsFor({ entity: p, viewer: "member:bob" }).count, 3);
  assert.equal(w.ev.readEvent({ eventId: mixed }).found, false, "an absent viewer sees nothing");
  assert.equal(w.ev.datedFactsFor({ captureSha: hidden, viewer: OUTSIDER }).count, 0);
  /* an attestation of a capture the actor cannot see is refused as absent */
  assert.equal(w.ev.attest({ eventId: mixed, attestation: { captureSha: hidden, extent: doc }, by: OUTSIDER }).reason, "CAPTURE_NOT_HELD");
  /* tables declared with their classes */
  const d = w.record.declaredTables().filter((t) => t.module === "events");
  assert.ok(d.length >= 10);
  assert.equal(d.find((t) => t.name === "event_when_cache").derive, "derived-rebuildable");
  assert.equal(d.find((t) => t.name === "event_attestations").sight, "source");
});
