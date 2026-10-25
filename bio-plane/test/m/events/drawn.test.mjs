/* events (T48-19): the timeline's world items carry their participants and grades (R50); a cited `precedes` relation
   records which came first when no date settles it, read by `sequence` (R51); a role is answered only through an
   attestation in sight (R40), at the interface. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, MEMBER, OUTSIDER, MACHINE, ZONE } from "./fixture.mjs";
import { ITEM_PARTICIPANTS_MAX } from "../../../src/events/index.mjs";
import { word, localize } from "../../../src/setup-words/index.mjs";

const doc = { kind: "document" };
const PROJ = "PROJ-2026-0001-f";
/* A capture fenced in a project alice belongs to and the outsider does not (membership R43). */
const fenced = (w, name) => { if (!w.one(`SELECT 1 AS x FROM bundles WHERE bundle_id=?`, PROJ)) w.project(PROJ, "alice");
  return w.capture(name, { bundleId: `INFO-2026-0003-${name}`, project: PROJ }); };
const item = (t, id) => [...t.world.items, ...t.world.placed_nowhere].find((i) => i.event_id === id);
/* R50: an item's participants are R26's, superseded rows left out, at most the bound, in R26's order */
const asRead = (w, id, viewer) => w.ev.readEvent({ eventId: id, viewer }).event.participants.filter((p) => !p.superseded);

test("R50 a world item answers its participants as R26 answers them (entity, role, vote value, attestation, both grades) with participants_total and participants_truncated, and grade, its governing attestation's grade: a meeting with a mover and two voted participants answers all three", () => {
  const w = world();
  const value = w.ev.view().vocabulary.vote_values[0].value;
  const [mo, v1, v2] = ["Mo Mover", "Val Voter", "Vera Voter"].map((l) => w.entity(l));
  const e = w.event({ value: "2026-03-10", participants: [{ entityId: mo, role: "mover", attestation: 0 },
    { entityId: v1, role: "voted", voteValue: value, attestation: 0 }, { entityId: v2, role: "voted", voteValue: value, attestation: 0 }] }).event_id;
  const it = item(w.ev.timeline({ set: [mo], viewer: MEMBER }), e);
  assert.deepEqual(it.participants, asRead(w, e, MEMBER));
  assert.deepEqual(it.participants.map((p) => [p.entity_id, p.role, p.vote_value ?? null]), [[mo, "mover", null], [v1, "voted", value], [v2, "voted", value]]);
  for (const p of it.participants) assert.deepEqual(Object.keys(p.grades).sort(), ["attestation", "resolution"], "two axes, never one grade");
  assert.deepEqual([it.participants_total, it.participants_truncated], [3, false]);
  const v = w.ev.readEvent({ eventId: e, viewer: MEMBER }).event;
  assert.equal(it.grade, v.attestations.find((a) => a.attestation_id === v.governing).grade);
  assert.equal(it.grade, "B");
  assert.equal(it.grade_why, undefined);
  /* the item keeps its kind, when, roles and concerns beside them */
  assert.deepEqual([it.kind, it.when.value, it.roles], ["meeting", "2026-03-10", ["mover"]]);
  /* an event of the set itself answers the same */
  assert.deepEqual(item(w.ev.timeline({ set: [e], viewer: MEMBER }), e).participants, it.participants);
});

test("R50 R40 only what the viewer may see is answered or counted: a participant attested only in a hidden capture is absent and uncounted (control: a viewer who may see it is answered it)", () => {
  const w = world();
  const a = w.entity("Ann"), b = w.entity("Ben");
  const open = w.capture("open"), hidden = fenced(w, "hid");
  const f = w.ev.recordDatedFact({ captureSha: open, extent: doc, kind: "meeting", value: "2026-04-01", method: "m", by: MEMBER }).dated_fact.dated_fact_id;
  const e = w.ev.createEvent({ kind: "meeting", attestations: [{ datedFactId: f }, { captureSha: hidden, extent: doc }], by: MEMBER,
    participants: [{ entityId: a, role: "present", attestation: 0 }, { entityId: b, role: "present", attestation: 1 }] }).event_id;
  const out = item(w.ev.timeline({ set: [a], viewer: OUTSIDER }), e);
  assert.deepEqual(out.participants.map((p) => p.entity_id), [a]);
  assert.deepEqual([out.participants_total, out.participants_truncated], [1, false]);
  const ins = item(w.ev.timeline({ set: [a], viewer: MEMBER }), e);
  assert.deepEqual(ins.participants.map((p) => p.entity_id), [a, b], "control: the viewer who may see it");
  assert.equal(ins.participants_total, 2);
  assert.deepEqual(ins.participants, asRead(w, e, MEMBER));
});

test("R50 superseded rows are left out; at most 50 participants per item in R26's order with the total and truncated; the 'what we did' lanes are unchanged", () => {
  const w = world();
  const s = w.capture("big");
  const f = w.ev.recordDatedFact({ captureSha: s, extent: doc, kind: "meeting", value: "2026-05-01", method: "m", by: MEMBER }).dated_fact.dated_fact_id;
  const people = Array.from({ length: ITEM_PARTICIPANTS_MAX + 2 }, (_, i) => w.entity(`P${i}`));
  const e = w.ev.createEvent({ kind: "meeting", attestations: [{ datedFactId: f }], by: MEMBER,
    participants: people.map((entityId) => ({ entityId, role: "present", attestation: 0 })) }).event_id;
  const first = w.rows(`SELECT participant_id FROM event_participants WHERE event_id=? ORDER BY participant_id`, e)[0].participant_id;
  const fixed = w.entity("Corrected");
  w.ev.correctParticipant({ participantId: first, entityId: fixed, reason: "the minutes name another", by: MEMBER });
  w.ev.registerEventSource("actions", () => ({ items: [{ at: "2026-05-02", label: "we wrote", ref: "ACT-1", kind: "letter" }] }));
  const t = w.ev.timeline({ set: [people[1]], viewer: MEMBER });
  const it = item(t, e);
  assert.equal(ITEM_PARTICIPANTS_MAX, 50);
  assert.equal(it.participants.length, 50);
  assert.deepEqual([it.participants_total, it.participants_truncated], [ITEM_PARTICIPANTS_MAX + 2, true]);
  assert.deepEqual(it.participants, asRead(w, e, MEMBER).slice(0, 50), "R26's order");
  assert.ok(!it.participants.some((p) => p.participant_id === Number(first) || p.superseded), "the superseded row is left out");
  assert.ok(asRead(w, e, MEMBER).some((p) => p.entity_id === fixed), "its replacement stands");
  assert.deepEqual(t.ours.sources.map((x) => [x.source, x.truncated, x.items.map(({ order, ...i }) => i)]),
    [["actions", false, [{ at: "2026-05-02", label: "we wrote", ref: "ACT-1", kind: "letter" }]]]);
  assert.ok(t.ours.sources[0].items.every((i) => !("participants" in i) && !("grade" in i)), "a source's items gain nothing");
});

test("R50 an item placed nowhere answers grade null with grade_why saying no attestation dates it; so does one whose dated attestation the viewer cannot see, and one whose cache is stale says so", () => {
  const w = world();
  const p = w.entity("Una");
  const part = [{ entityId: p, role: "present", attestation: 0 }];
  const undated = w.event({ participants: part }).event_id;
  const hidden = fenced(w, "gov");
  const hf = w.ev.recordDatedFact({ captureSha: hidden, extent: doc, kind: "meeting", value: "2026-06-01", method: "m", by: MEMBER }).dated_fact.dated_fact_id;
  const half = w.ev.createEvent({ kind: "meeting", attestations: [{ datedFactId: hf }, { captureSha: w.capture("seen"), extent: doc }], by: MEMBER,
    participants: [{ entityId: p, role: "present", attestation: 1 }] }).event_id;
  const t = w.ev.timeline({ set: [p], viewer: OUTSIDER });
  for (const id of [undated, half]) {
    const it = item(t, id);
    assert.ok(t.world.placed_nowhere.includes(it), id);
    assert.equal(it.grade, null);
    assert.deepEqual(it.grade_why, { key: "events.why.grade_placed_nowhere", vars: {} });
    assert.equal(it.participants_total, 1);
  }
  /* control: the member who may see the governing attestation is answered its grade */
  assert.equal(item(w.ev.timeline({ set: [p], viewer: MEMBER }), half).grade, "B");
  const dated = w.event({ value: "2026-06-02", participants: part }).event_id;
  w.st.sql.exec(`UPDATE event_when_cache SET value='2020-01-01' WHERE event_id=?`, dated);
  const stale = item(w.ev.timeline({ set: [p], viewer: MEMBER }), dated);
  assert.deepEqual([stale.grade, stale.why], [null, { key: "events.why.cache_stale", vars: {} }]);
  assert.deepEqual(stale.grade_why, { key: "events.why.grade_time_unread", vars: {} });
});

test("R40 a role is answered only through an attestation in sight: a role resting on a hidden capture is not answered beside a visible one (eventsFor, timeline)", () => {
  const w = world();
  const p = w.entity("Rho");
  const open = w.capture("r-open"), hidden = fenced(w, "r-hid");
  const e = w.ev.createEvent({ kind: "meeting", attestations: [{ captureSha: open, extent: doc }, { captureSha: hidden, extent: doc }], by: MEMBER,
    participants: [{ entityId: p, role: "present", attestation: 0 }, { entityId: p, role: "speaker", attestation: 1 }] }).event_id;
  const roles = (viewer) => [w.ev.eventsFor({ entity: p, viewer }), w.ev.timeline({ set: [p], viewer }).world]
    .map((x) => [...(x.items || []), ...(x.events || []), ...x.placed_nowhere].find((i) => i.event_id === e).roles);
  assert.deepEqual(roles(OUTSIDER), [["present"], ["present"]]);
  assert.deepEqual(roles(MEMBER), [["present", "speaker"], ["present", "speaker"]], "control: the viewer who may see both");
});

/* ---- R51 ---- */

/* Two events on the same day at day precision: their dates leave the order undetermined (R31). */
function sameDay(w, day = "2026-07-01") {
  return [w.event({ value: day }).event_id, w.event({ value: day }).event_id];
}

test("R51 two meetings with day-precision whens on the same day, related precedes from a cited extent, answer before with basis cited, the relation's id and its two grades, never as computed from dates; the pair asked the other way answers after", () => {
  const w = world();
  const [a, b] = sameDay(w);
  assert.equal(w.ev.sequence({ a, b, viewer: MEMBER }).answer, "undetermined");
  const s = w.capture("order");
  const r = w.ev.relate({ from: a, to: b, kind: "precedes", attestation: { captureSha: s, extent: doc }, by: MEMBER });
  assert.equal(r.ok, true);
  assert.deepEqual(r.relation.grade, { assertion: "B", ends: ["B", "B"] }, "held with its two grades");
  const q = w.ev.sequence({ a, b, viewer: MEMBER });
  assert.deepEqual([q.answer, q.basis, q.relation_id], ["before", "cited", r.relation.relation_id]);
  assert.deepEqual(q.grade, r.relation.grade);
  assert.equal(typeof q.dates_why.key, "string", "why the dates do not settle it, a key with its fills");
  const back = w.ev.sequence({ a: b, b: a, viewer: MEMBER });
  assert.deepEqual([back.answer, back.basis, back.relation_id], ["after", "cited", r.relation.relation_id]);
  /* testimony is a citation too, graded D (R17) */
  const [c, d] = sameDay(w, "2026-07-02");
  const t = w.ev.relate({ from: c, to: d, kind: "precedes", attestation: { testimony: "I saw the first end before the second began" }, by: MEMBER });
  assert.equal(t.relation.grade.assertion, "D");
  assert.equal(w.ev.sequence({ a: c, b: d, viewer: MEMBER }).basis, "cited");
});

test("R51 the same act on two events on different days is refused ORDER_ALREADY_DATED naming R31's answer, after R17's refusals; a machine stamp is refused MEMBER_ACT_ONLY; nothing is written", () => {
  const w = world();
  const a = w.event({ value: "2026-07-01" }).event_id, b = w.event({ value: "2026-07-03" }).event_id;
  const s = w.capture("dated");
  const rel = (x) => w.ev.relate({ from: a, to: b, kind: "precedes", attestation: { captureSha: s, extent: doc }, by: MEMBER, ...x });
  const [c, d] = sameDay(w);
  const before = w.rows(`SELECT * FROM event_relations`).length + w.rows(`SELECT * FROM event_attestations`).length;
  const r = rel({});
  assert.deepEqual([r.ok, r.reason, r.answer], [false, "ORDER_ALREADY_DATED", "before"]);
  assert.match(r.detail, /before/);
  assert.equal(rel({ from: b, to: a }).answer, "after");
  /* R17's refusals come first */
  assert.equal(rel({ to: a }).reason, "SELF_RELATION");
  assert.equal(rel({ to: "EVT-2026-aaaaaaaaaaaaaaaa" }).reason, "NO_SUCH_EVENT");
  assert.equal(rel({ attestation: null }).reason, "NO_ATTESTATION");
  assert.equal(rel({ attestation: { captureSha: s } }).reason, "NO_EXTENT");
  /* R41: only a member records an order */
  for (const by of [MACHINE, null]) assert.equal(w.ev.relate({ from: c, to: d, kind: "precedes", attestation: { captureSha: s, extent: doc }, by }).reason, "MEMBER_ACT_ONLY");
  assert.equal(w.rows(`SELECT * FROM event_relations`).length + w.rows(`SELECT * FROM event_attestations`).length, before, "a refusal writes nothing");
  /* control: the same member act on an undetermined pair is held */
  assert.equal(w.ev.relate({ from: c, to: d, kind: "precedes", attestation: { captureSha: s, extent: doc }, by: MEMBER }).ok, true);
});

test("R51 two standing relations ordering the pair both ways answer undetermined, \"the cited orders disagree\", with both ids; no order is inferred through a chain; a withdrawn relation or one the viewer cannot see orders nothing", () => {
  const w = world();
  const [a, b] = sameDay(w);
  const c = w.event({ value: "2026-07-01" }).event_id;
  const s = w.capture("both"), t = w.capture("other");
  const ab = w.ev.relate({ from: a, to: b, kind: "precedes", attestation: { captureSha: s, extent: doc }, by: MEMBER }).relation.relation_id;
  const bc = w.ev.relate({ from: b, to: c, kind: "precedes", attestation: { captureSha: s, extent: doc }, by: MEMBER }).relation.relation_id;
  const chain = w.ev.sequence({ a, b: c, viewer: MEMBER });
  assert.equal(chain.answer, "undetermined", "a precedes b precedes c says nothing of a and c");
  assert.equal(chain.basis, undefined);
  const ba = w.ev.relate({ from: b, to: a, kind: "precedes", attestation: { captureSha: t, extent: doc }, by: MEMBER }).relation.relation_id;
  const q = w.ev.sequence({ a, b, viewer: MEMBER });
  assert.deepEqual([q.answer, q.why, q.relation_ids], ["undetermined", { key: "events.why.cited_orders_disagree", vars: {} }, [ab, ba]]);
  w.ev.withdrawRelation({ relationId: ba, reason: "the second source misread it", by: MEMBER });
  assert.deepEqual([w.ev.sequence({ a, b, viewer: MEMBER }).answer, w.ev.sequence({ a, b, viewer: MEMBER }).relation_id], ["before", ab]);
  w.ev.withdrawRelation({ relationId: ab, reason: "withdrawn", by: MEMBER });
  assert.equal(w.ev.sequence({ a, b, viewer: MEMBER }).answer, "undetermined", "a withdrawn relation orders nothing");
  /* sight: a relation cited from a capture the viewer cannot see orders nothing for that viewer */
  const hid = fenced(w, "o-hid");
  w.ev.relate({ from: b, to: c, kind: "precedes", attestation: { captureSha: hid, extent: doc }, by: MEMBER });
  w.ev.withdrawRelation({ relationId: bc, reason: "superseded by the fenced source", by: MEMBER });
  assert.equal(w.ev.sequence({ a: b, b: c, viewer: MEMBER }).basis, "cited");
  assert.equal(w.ev.sequence({ a: b, b: c, viewer: OUTSIDER }).answer, "undetermined");
  assert.equal(w.ev.sequence({ a: b, b: c, viewer: null }).answer, "undetermined", "an absent viewer sees no cited order");
});

test("R51 when an attestation later dates the pair, the dates govern and the relation is answered beside with agrees true or false; it is never withdrawn by the module; sequence is computed on each read and stores nothing", () => {
  const w = world();
  const [a, b] = sameDay(w);
  const s = w.capture("later");
  const id = w.ev.relate({ from: a, to: b, kind: "precedes", attestation: { captureSha: s, extent: doc }, by: MEMBER }).relation.relation_id;
  const date = (e, value) => {
    const f = w.ev.recordDatedFact({ captureSha: s, extent: doc, kind: "meeting", value, method: "m", by: MEMBER }).dated_fact.dated_fact_id;
    const att = w.ev.attest({ eventId: e, attestation: { datedFactId: f }, by: MEMBER }).attestation_id;
    w.ev.chooseGoverning({ eventId: e, attestationId: att, reason: "a closer reading", by: MEMBER });
  };
  date(a, "2026-07-01T09:00");
  date(b, "2026-07-01T14:00");
  const agree = w.ev.sequence({ a, b, viewer: MEMBER });
  assert.deepEqual([agree.answer, agree.basis], ["before", "dates"]);
  assert.deepEqual(agree.cited.map((c) => [c.relation_id, c.agrees]), [[id, true]]);
  date(b, "2026-07-01T08:00");
  const disagree = w.ev.sequence({ a, b, viewer: MEMBER });
  assert.deepEqual([disagree.answer, disagree.basis, disagree.cited.map((c) => c.agrees)], ["after", "dates", [false]]);
  assert.equal(w.one(`SELECT withdrawn_at FROM event_relations WHERE relation_id=?`, id).withdrawn_at, null, "never withdrawn by the module");
  /* nothing stored: a read writes no row anywhere */
  const count = () => w.rows(`SELECT name FROM sqlite_master WHERE type='table'`).map((t) => w.one(`SELECT COUNT(*) AS n FROM "${t.name}"`).n).join(",");
  const was = count();
  w.ev.sequence({ a, b, viewer: MEMBER });
  assert.equal(count(), was);
  /* control: a pair the dates order with no relation answers no cited list */
  const x = w.event({ value: "2026-01-01" }).event_id;
  assert.equal(w.ev.sequence({ a: x, b: a, viewer: MEMBER }).cited, undefined);
});

test("R51 R35 precedes is one of the event links: neighbours answers it as an event_precedes connection with its evidence and both grade axes; readEvent answers it among the relations", () => {
  const w = world();
  const [a, b] = sameDay(w);
  const s = w.capture("link");
  const rid = w.ev.relate({ from: a, to: b, kind: "precedes", attestation: { captureSha: s, extent: doc }, by: MEMBER }).relation.relation_id;
  const n = w.ev.neighbours({ node: a, kinds: ["event_precedes"], at: { value: "2026-07-01", precision: "day", zone: ZONE }, viewer: MEMBER, scope: null });
  assert.deepEqual(n.items.map((i) => [i.id, i.from, i.to, i.kind]), [[`events:event_precedes:${rid}`, a, b, "event_precedes"]]);
  assert.deepEqual(n.items[0].evidence, [{ source: `capture:${s}`, extent: doc }]);
  assert.deepEqual(n.items[0].grade, { assertion: "B", ends: ["B", "B"] });
  const v = w.ev.readEvent({ eventId: b, viewer: MEMBER }).event.relations;
  assert.deepEqual(v.map((r) => [r.kind, r.direction, r.from]), [["precedes", "in", a]]);
});

/* ---- R52 ---- */

test("R52 R34's NOT_A_PROCEEDING is entities.notAProceeding's answer (its R53): code, catalogue row and sentence, with the entity asked; through the op too; nothing written (control: a proceeding is not refused)", async () => {
  const { notAProceeding } = await import("../../../src/entities/index.mjs");
  const { eventsOps } = await import("../../../src/events/index.mjs");
  const w = world();
  const person = w.entity("Kim");
  const r = w.ev.proceedingStatusAt({ proceeding: person, at: "2026-01-01", viewer: MEMBER });
  assert.deepEqual(r, notAProceeding(localize("events.index.status_as_of_a_date", "status as of a date is read of an entity of kind proceeding"), { entity_id: person }));
  assert.deepEqual([r.ok, r.reason, r.code, r.entity_id], [false, "NOT_A_PROCEEDING", "NOT_A_PROCEEDING", person]);
  assert.equal(r.translation, notAProceeding().translation);
  assert.equal(r.check, notAProceeding().check);
  const url = new URL(`https://x.test/?proceeding=${person}&at=2026-01-01&viewer=${MEMBER}`);
  assert.deepEqual(eventsOps(w.ev, url, {}).proceedingstatus(), r);
  assert.equal(w.rows(`SELECT * FROM events`).length, 0);
  const proc = w.proceeding("Suit one");
  assert.notEqual(w.ev.proceedingStatusAt({ proceeding: proc, at: "2026-01-01", viewer: MEMBER }).reason, "NOT_A_PROCEEDING");
});

test("R50 the event view's why for a dated attestation the viewer cannot see is {key, vars}, key events.why.dated_attestation_see; control: a viewer who may see it is given no why", () => {
  const w = world();
  const p = w.entity("Una");
  const hidden = fenced(w, "gov");
  const hf = w.ev.recordDatedFact({ captureSha: hidden, extent: doc, kind: "meeting", value: "2026-06-01", method: "m", by: MEMBER }).dated_fact.dated_fact_id;
  const half = w.ev.createEvent({ kind: "meeting", attestations: [{ datedFactId: hf }, { captureSha: w.capture("seen"), extent: doc }], by: MEMBER,
    participants: [{ entityId: p, role: "present", attestation: 1 }] }).event_id;
  const seen = w.ev.readEvent({ eventId: half, viewer: OUTSIDER }).event;
  assert.equal(seen.when, null);
  assert.deepEqual(seen.why, { key: "events.why.dated_attestation_see", vars: {} });
  assert.equal(w.ev.readEvent({ eventId: half, viewer: MEMBER }).event.why, undefined);
});
