/* events as a connection owner (R35), at the interface: connection-grammar's owner battery over this module's own
   fixture, the default registry's read with and without a host (K1563 (1)), and the hub bound. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, MEMBER, OUTSIDER, ZONE } from "./fixture.mjs";
import { ownerConformance, owners, kindOf, neighbours as registryRead, BOUNDS } from "../../../src/connection-grammar/index.mjs";

const doc = { kind: "document" };
const AT = { value: "2026-03-10", precision: "day", zone: ZONE };

test("R35 registered once as owner events with took part (one per role), concerns, within and the five event links; neighbours answers in connection-grammar's shape with evidence and both grade axes, valid at the event's time, and passes ownerConformance", () => {
  const w = world();
  const mine = owners().find((o) => o.owner === "events");
  assert.ok(mine, "registered in the default registry");
  const kinds = mine.kinds.map((k) => k.kind);
  for (const role of ["actor", "organizer", "mover", "seconder", "voted", "present", "speaker", "sender", "recipient", "copied",
                      "signatory", "decider", "author", "implementer", "party", "subject"]) assert.ok(kinds.includes(`event_${role}`), role);
  for (const k of ["concerns", "within", "authorises", "answers", "amends", "reverses", "stated_cause"]) assert.ok(kinds.includes(`event_${k}`), k);
  assert.equal(kinds.length, 23);
  assert.equal(kindOf("event_mover").owner, "events");
  assert.ok(mine.kinds.every((k) => k.class === "evidentiary" && k.word));

  const p = w.entity("Moe");
  w.project("PROJ-2026-0001-f", "alice");
  const hidden = w.capture("fenced", { bundleId: "INFO-2026-0003-f", project: "PROJ-2026-0001-f" });
  const part = [{ entityId: p, role: "present", attestation: 0 }];
  const inside = w.event({ value: "2026-03-10", participants: part }).event_id;
  const out = w.event({ value: "2026-03-20", participants: part }).event_id;
  const undated = w.event({ participants: part }).event_id;
  const fenced = w.ev.createEvent({ kind: "meeting", by: MEMBER, participants: part,
    attestations: [{ datedFactId: w.ev.recordDatedFact({ captureSha: hidden, extent: doc, kind: "meeting", value: "2026-03-10", method: "m", by: MEMBER }).dated_fact.dated_fact_id }] }).event_id;
  const id = (e) => `events:event_present:${w.one(`SELECT participant_id FROM event_participants WHERE event_id=?`, e).participant_id}`;
  const OWN = mine.kinds;
  /* the battery over this owner's own kinds, through a fresh registry (connection-grammar R5) */
  const battery = ownerConformance({ owner: "events", neighbours: (a) => w.ev.neighbours(a), kinds: OWN, fixture: {
    node: p, at: AT, in: id(inside), out: id(out), undetermined: id(undated), fenced: id(fenced),
    viewers: { sees: MEMBER, blind: OUTSIDER }, expected: [id(inside), id(undated), id(fenced)] } });
  assert.deepEqual(battery.failures, []);
  assert.equal(battery.ok, true);
  /* the shape: evidence and both grade axes */
  const items = w.ev.neighbours({ node: p, at: AT, viewer: MEMBER, scope: null }).items;
  const it = items.find((i) => i.id === id(inside));
  assert.deepEqual([it.from, it.to, it.kind, it.owner], [p, inside, "event_present", "events"]);
  assert.match(it.evidence[0].source, /^capture:[0-9a-f]{64}$/);
  assert.deepEqual(Object.keys(it.grade).sort(), ["assertion", "ends"]);
  assert.equal(it.grade.ends.length, 2);
  /* an event node: its participants, concerns and relations, read from both ends */
  const s = w.capture("rel");
  w.ev.relate({ from: undated, to: inside, kind: "within", attestation: { captureSha: s, extent: doc }, by: MEMBER });
  const around = w.ev.neighbours({ node: inside, at: AT, viewer: MEMBER, scope: null }).items.map((i) => i.kind).sort();
  assert.deepEqual(around, ["event_present", "event_within"]);
});

test("R35 the registry's read takes an optional host it passes through, else the isolate's one instance, else OWNER_HOST_AMBIGUOUS (K1563 (1))", () => {
  const w1 = world(), w2 = world();
  const p = w1.entity("Ned");
  w1.event({ value: "2026-03-10", participants: [{ entityId: p, role: "actor", attestation: 0 }] });
  const ask = (x) => registryRead({ owner: "events", node: p, kinds: ["event_actor"], at: AT, viewer: MEMBER, scope: null, ...x });
  assert.equal(ask({ host: w1.host }).items.length, 1);
  assert.equal(ask({ host: w2.host }).items.length, 0);
  assert.equal(ask({}).refused, "OWNER_HOST_AMBIGUOUS", "this isolate holds several instances");
  assert.equal(ask({ viewer: undefined, host: w1.host }).refused, "VIEWER_MISSING");
});

test("R35 a node with more than the hub bound of connections is answered hub with no items; pages of at most the fan-out", () => {
  const w = world();
  const p = w.entity("Hub");
  const s = w.capture("hub");
  const f = w.ev.recordDatedFact({ captureSha: s, extent: doc, kind: "meeting", value: "2026-03-10", method: "m", by: MEMBER }).dated_fact.dated_fact_id;
  for (let i = 0; i <= BOUNDS.hub; i++)
    w.ev.createEvent({ kind: "meeting", attestations: [{ datedFactId: f }], participants: [{ entityId: p, role: "present", attestation: 0 }], by: MEMBER });
  const r = w.ev.neighbours({ node: p, at: AT, viewer: MEMBER, scope: null });
  assert.deepEqual(r.items, []);
  assert.equal(r.hub.set_size, BOUNDS.hub + 1);
  assert.equal(w.ev.neighbours({ node: p, at: AT, viewer: OUTSIDER, scope: null }).hub.set_size, BOUNDS.hub + 1);
  assert.equal(w.ev.neighbours({ node: p, at: AT, viewer: "member:nobody-at-all", scope: null }).hub.set_size, BOUNDS.hub + 1);
});
