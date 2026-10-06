/* conformance, T33-70 (K1465, K1485): the act is an event (R25) and an `ACT-` id is an alias of one (R26). Every test
   drives `conformance` at its interface over the real modules it uses (./fixture.mjs): the act's event and its
   participants are `events`' own, the actor's office entity `entities`' own, and the bridge (instance-setup R50) the
   fixture's `offices` map given as `officeEntityOf`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { scene, storage, V, MACHINE } from "./fixture.mjs";
import { Conformance, CONFORMANCE_CHECKS, ACT_ROLES, PARTICIPANTS_SAY, NO_OFFICE_ENTITY, ACTOR_BEFORE_ENTITIES,
         UNALIASED_SAYS } from "../../../src/conformance/index.mjs";
import { migrateConformance } from "../../../src/conformance/schema.mjs";
import { noSuchEvent } from "../../../src/events/index.mjs";

const refused = (r, code) => {
  assert.equal(r.ok, false, `expected ${code}, got ${JSON.stringify(r).slice(0, 300)}`);
  assert.equal(r.reason, code, JSON.stringify(r).slice(0, 300));
  if (CONFORMANCE_CHECKS[code])
    assert.deepEqual([r.code, r.check, r.translation], [code, CONFORMANCE_CHECKS[code].check,
      CONFORMANCE_CHECKS[code].translation]);
};
const nothing = (w, fn) => { const before = w.snapshot(); const r = fn(); assert.deepEqual(w.snapshot(), before, "nothing written"); return r; };
/* A Conformance over the scene's modules with `events` replaced, for the arms the real sight rules do not reach in one
   group (events shows a member every event): it reads and refuses, and never writes a determination. */
const over = (w, events) => new Conformance({ storage: w.st, record: w.record, membership: w.membership,
  promotion: w.promotion, host: w.host, content: w.content, inquiry: w.k, strength: w.strength,
  reevaluation: w.reevaluation, publication: w.publication, standards: w.standards, contradiction: w.contradiction,
  entities: w.entities, events, now: () => w.clock.now });
const proxied = (t, overrides) => new Proxy(t, { get: (o, p) => (p in overrides ? overrides[p]
  : typeof o[p] === "function" ? o[p].bind(o) : o[p]) });

/* A determination recorded before T33: its act an `ACT-` id with a description, a date and no event (R26). */
function legacy(w, proj, ev, std, actId = "ACT-2025-0001", id = "CONF-2025-0001-determination") {
  w.st.sql.exec(`INSERT INTO determinations (determination_id, project_id, act_id, act_minted, act_description, act_role,
                   act_body, act_at, act_evidence, author, at) VALUES (?,?,?,1,?,?,?,?,?,?,?)`,
                id, proj, actId, "The parks department closed the east playground", "Director of Parks", "Parks Department",
                "2025-11-04", JSON.stringify([ev.content]), V("olive"), "2025-11-05T00:00:00Z");
  w.st.sql.exec(`INSERT INTO determination_standards (determination_id, ord, standard_id, outcome, in_force) VALUES (?,0,?,?,?)`,
                id, std, "noncompliant", "in_force");
  return id;
}

test("R25 R1: ACT_NO_EVENT (C-113.29) for an act that names no event, first among the act's refusals; it writes nothing", () => {
  const { w, input } = scene();
  for (const act of [undefined, null, {}, "EVT-2026-0001", [], { event: "" }, { event: "  " }, { event: 42 },
                     { actor: { role: "Director of Parks", body: "Parks Department" }, evidence: input().act.evidence }]) {
    const r = nothing(w, () => w.c.determine(input({ act })));
    refused(r, "ACT_NO_EVENT");
    assert.equal(r.part, "event");
  }
  assert.equal(CONFORMANCE_CHECKS.ACT_NO_EVENT.check, "C-113.29");
  /* first: before the actor and the evidence are looked at */
  refused(w.c.determine(input({ act: { actor: "a person", evidence: [] } })), "ACT_NO_EVENT");
  /* the negative control */
  assert.equal(w.c.determine(input()).ok, true);
});

test("R25: NO_SUCH_EVENT for an event absent or one the viewer may not see, one answer, events' own (its noSuchEvent); it writes nothing", () => {
  const { w, act, input } = scene();
  const absent = nothing(w, () => w.c.determine(input({ act: { ...input().act, event: "EVT-2026-zzzz" } })));
  assert.deepEqual(absent, noSuchEvent("EVT-2026-zzzz"));
  assert.equal("NO_SUCH_EVENT" in CONFORMANCE_CHECKS, false, "the code is events', minted at one site");
  /* unseen: events answers the viewer found: false, as it does an absent event */
  const hidden = over(w, proxied(w.events, { readEvent: (a) => (a.viewer === V("pat") ? { ok: true, found: false, event_id: a.eventId }
                                                                                     : w.events.readEvent(a)) }));
  const unseen = nothing(w, () => hidden.determine(input({ author: V("pat"), viewer: V("pat") })));
  assert.deepEqual({ ...unseen, event_id: null }, { ...absent, event_id: null }, "absent and unseen alike");
  assert.equal(unseen.event_id, act);
  /* before the actor: an unseen event with a person as actor answers the event */
  refused(hidden.determine(input({ author: V("pat"), viewer: V("pat"),
                                   act: { ...input().act, actor: { entity_id: "ENT-2026-0001" } } })), "NO_SUCH_EVENT");
});

test("R25: ACTOR_NOT_AN_OFFICE (C-113.30) for an entity_id that is not an office entity (a person, an organisation, an absent id); an office entity is the actor, and a person never is", () => {
  const { w, signer, input } = scene();
  const body = w.entity("body", "Parks Department");
  for (const entity_id of [signer, body, "ENT-2026-9999", "not an id", 7]) {
    const r = nothing(w, () => w.c.determine(input({ act: { ...input().act,
      actor: { role: "Director of Parks", body: "Parks Department", entity_id } } })));
    refused(r, "ACTOR_NOT_AN_OFFICE");
  }
  assert.equal(CONFORMANCE_CHECKS.ACTOR_NOT_AN_OFFICE.check, "C-113.30");
  assert.match(CONFORMANCE_CHECKS.ACTOR_NOT_AN_OFFICE.translation, /never as its actor/);
  /* asked before ACT_INCOMPLETE: a person named with no role is refused as not an office */
  refused(w.c.determine(input({ act: { ...input().act, actor: { entity_id: signer } } })), "ACTOR_NOT_AN_OFFICE");
  /* the control: an office entity is held as the actor's, and read back */
  const office = w.entity("office", "Director of Parks");
  const d = w.c.determine(input({ act: { ...input().act, actor: { role: "Director of Parks", body: "Parks Department",
                                                                   entity_id: office } } }));
  assert.equal(d.ok, true, JSON.stringify(d).slice(0, 300));
  assert.deepEqual(d.act.actor, { role: "Director of Parks", body: "Parks Department", entity_id: office });
  assert.equal(w.row(`SELECT act_entity FROM determinations WHERE determination_id=?`, d.id).act_entity, office);
  /* no determination names a person as its actor */
  for (const r of w.rows(`SELECT act_entity FROM determinations WHERE act_entity IS NOT NULL`))
    assert.equal(w.entities.readEntity({ entityId: r.act_entity }).entity.kind, "office");
});

test("R25: an absent entity_id is filled from the office entity seeded for that role and body (the bridge); with none held the actor stands as {role, body, entity_id: null}, stated so", () => {
  const { w, signer, input } = scene();
  const none = w.c.determine(input());
  assert.deepEqual(none.act.actor, { role: "Director of Parks", body: "Parks Department", entity_id: null,
                                     entity_why: NO_OFFICE_ENTITY });
  assert.match(w.text(none.id), new RegExp(NO_OFFICE_ENTITY));
  /* the bridge seeds the office: the next determination carries it, the earlier one stays as recorded */
  const office = w.entity("office", "Director of Parks");
  w.offices.set("Director of Parks|Parks Department", office);
  const filled = w.c.determine(input());
  assert.deepEqual(filled.act.actor, { role: "Director of Parks", body: "Parks Department", entity_id: office });
  assert.match(w.text(filled.id), new RegExp(office));
  assert.equal(w.c.determinationRead({ id: none.id, viewer: V("olive") }).act.actor.entity_id, null);
  /* another office's role and body is not filled from it */
  const other = w.c.determine(input({ act: { ...input().act, actor: { role: "City Clerk", body: "Office of the Clerk" } } }));
  assert.equal(other.act.actor.entity_id, null);
  /* a bridge answer that is not an office entity is never taken as the actor's */
  w.offices.set("City Clerk|Office of the Clerk", signer);
  const wrong = w.c.determine(input({ act: { ...input().act, actor: { role: "City Clerk", body: "Office of the Clerk" } } }));
  assert.deepEqual([wrong.ok, wrong.act.actor.entity_id], [true, null]);
});

test("R25 R9: determinationRead answers the act's event with its kind, when and attestations, and its participants in decider, author, signatory and implementer, each with its attestation, labelled as who took part, never the actor, never composed into the outcome", () => {
  const { w, ev, input } = scene();
  const people = Object.fromEntries(["decider", "author", "signatory", "implementer", "present", "actor", "speaker"]
    .map((role) => [role, w.entity("person", `Person ${role}`)]));
  const act = w.event(ev, { kind: "adoption", participants: Object.entries(people).map(([role, entityId]) => ({ entityId, role })) });
  const d = w.c.determine(input({ act: { ...input().act, event: act } }));
  assert.equal(d.ok, true, JSON.stringify(d).slice(0, 300));
  const r = w.c.determinationRead({ id: d.id, viewer: V("pat") });
  assert.deepEqual(ACT_ROLES, ["decider", "author", "signatory", "implementer"]);
  assert.deepEqual([r.event.id, r.event.kind, r.event.status, r.event.when.value], [act, "adoption", "EventScheduled", "2026-03-02"]);
  assert.deepEqual(r.event.participants.map((p) => [p.role, p.entity_id]),
                   ACT_ROLES.map((role) => [role, people[role]]), "only the four roles, in events' order");
  for (const p of r.event.participants) {
    assert.equal(p.attestation.attestation_id, r.event.attestations[0].attestation_id, "each with its own attestation");
    assert.ok(p.grades && "attestation" in p.grades && "resolution" in p.grades, "two axes, never one");
  }
  assert.equal(r.event.participants_say, PARTICIPANTS_SAY);
  /* never the actor, never in the outcome */
  assert.deepEqual(r.act.actor, { role: "Director of Parks", body: "Parks Department", entity_id: null, entity_why: NO_OFFICE_ENTITY });
  assert.deepEqual(r.outcomes, [{ standard: input().standards[0].standard, outcome: "noncompliant" }]);
  for (const id of Object.values(people)) {
    assert.equal(JSON.stringify(r.act).includes(id), false);
    assert.equal(JSON.stringify(r.standards).includes(id), false);
  }
  /* a participant corrected in events is read as events now holds it */
  const pid = w.events.readEvent({ eventId: act, viewer: MACHINE }).event.participants.find((p) => p.role === "signatory").participant_id;
  const other = w.entity("person", "Someone else");
  assert.equal(w.events.correctParticipant({ participantId: pid, entityId: other, reason: "misread", by: V("olive") }).ok, true);
  assert.deepEqual(w.c.determinationRead({ id: d.id, viewer: V("pat") }).event.participants
    .filter((p) => p.role === "signatory").map((p) => p.entity_id), [other]);
  /* R5: the same for a compliant determination */
  const c = w.c.determine(input({ act: { ...input().act, event: act }, standards: [{ standard: input().standards[0].standard,
    outcome: "compliant" }], rows: [{ ...input().rows[0], reading: "aligns" }] }));
  assert.deepEqual(Object.keys(w.c.determinationRead({ id: c.id, viewer: V("pat") }).event).sort(), Object.keys(r.event).sort());
});

test("R25 R24: a participant the viewer may not see is withheld whole, and an event the viewer may not see leaves event null; the read states out_of_view: true and the act stands", () => {
  const { w, act, signer, input } = scene();
  const d = w.c.determine(input());
  const dropSigner = over(w, proxied(w.events, { readEvent: (a) => {
    const r = w.events.readEvent(a);
    return a.viewer === V("pat") && r.found ? { ...r, event: { ...r.event, participants: r.event.participants.filter((p) => p.entity_id !== signer) } } : r;
  } }));
  const pat = dropSigner.determinationRead({ id: d.id, viewer: V("pat") });
  assert.deepEqual([pat.event.participants, pat.out_of_view], [[], true]);
  assert.equal(JSON.stringify(pat).includes(signer), false);
  const olive = dropSigner.determinationRead({ id: d.id, viewer: V("olive") });
  assert.deepEqual([olive.event.participants.map((p) => p.entity_id), "out_of_view" in olive], [[signer], false]);
  /* the whole event unseen */
  const noEvent = over(w, proxied(w.events, { readEvent: (a) => (a.viewer === V("pat") ? { ok: true, found: false, event_id: a.eventId }
                                                                                      : w.events.readEvent(a)) }));
  const r = noEvent.determinationRead({ id: d.id, viewer: V("pat") });
  assert.deepEqual([r.event, r.out_of_view, r.act.event, r.act.id], [null, true, act, act], "the act is authored and stands");
  assert.deepEqual(noEvent.determinationRead({ id: d.id, viewer: V("olive") }), w.c.determinationRead({ id: d.id, viewer: V("olive") }));
});

test("R25 R3: the act's date is its event's when: a band read at each end, an event placed nowhere or an undetermined when read as undetermined, stated beside each standard; an upper bound reads its start undetermined and its end", () => {
  const { w, ev, input } = scene();
  const nowhere = w.event(ev, { date: null });
  const d = w.c.determine(input({ act: { ...input().act, event: nowhere } }));
  assert.equal(d.ok, true, JSON.stringify(d).slice(0, 300));
  assert.deepEqual([d.standards[0].in_force, d.act.when], ["undetermined", null]);
  assert.match(d.standards[0].in_force_why, /placed nowhere/);
  assert.match(w.text(d.id), /placed nowhere/);
  /* a when events answers undetermined (its cache stale) and an upper bound, through events' read */
  const as = (when, why = null) => over(w, proxied(w.events, { readEvent: (a) => {
    const r = w.events.readEvent(a);
    return r.found ? { ...r, event: { ...r.event, when, ...(why ? { why } : {}) } } : r;
  } }));
  /* the dates each when gives, read through the interface's static rule */
  assert.deepEqual(Conformance.datesOf({ when: "undetermined", why: "cache stale" }).map((x) => x.date), [null]);
  assert.match(Conformance.datesOf({ when: "undetermined", why: "cache stale" })[0].why, /cache stale/);
  assert.deepEqual(Conformance.datesOf({ when: { precision: "upper_bound", value: "2026-03-02", zone: "UTC", start: null,
                                                end: "2026-03-03T00:00:00Z" } }).map((x) => x.date), [null, "2026-03-02"]);
  assert.deepEqual(Conformance.datesOf({ when: { precision: "edtf", value: "2026-03-01/2026-03-05", zone: "America/Los_Angeles",
    start: "2026-03-01T08:00:00Z", end: "2026-03-06T08:00:00Z" } }).map((x) => x.date), ["2026-03-01", "2026-03-05"]);
  assert.deepEqual(Conformance.datesOf({ when: { precision: "minute", value: "2026-03-02T23:30", zone: "UTC" } })
    .map((x) => x.date), ["2026-03-02"]);
  /* an upper bound past a standard's end is refused at that end; its start is stated undetermined */
  const ended = w.standard("Ended Code 7", { period: { from: "2020-01-01", to: "2026-03-01" } });
  const ub = w.event(ev, { date: "2026-03-02" });
  const upper = as({ precision: "upper_bound", value: "2026-03-02", zone: "UTC", start: null, end: "2026-03-03T00:00:00Z" });
  refused(upper.determine(input({ act: { ...input().act, event: ub }, standards: [{ standard: ended, outcome: "compliant" }],
    rows: [{ standard: ended, requires: "x", did: "y", reading: "aligns" }] })), "STANDARD_NOT_IN_FORCE");
});

test("R26: an ACT- id recorded before T33 and not aliased reads as recorded with act_unaliased: true, its description, actor and date; a new determination naming it is ACT_NOT_AN_EVENT (C-113.31); an ACT- id this project never recorded is NO_SUCH_EVENT", () => {
  const { w, proj, ev, std, input } = scene();
  const id = legacy(w, proj, ev, std);
  const r = w.c.determinationRead({ id, viewer: V("pat") });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.deepEqual(r.act, { id: "ACT-2025-0001", event: null,
    actor: { role: "Director of Parks", body: "Parks Department", entity_id: null, entity_why: ACTOR_BEFORE_ENTITIES },
    evidence: [ev.content], when: null, description: "The parks department closed the east playground", at: "2025-11-04",
    period: null, act_unaliased: true, act_says: UNALIASED_SAYS });
  assert.equal(r.event, null);
  assert.equal("out_of_view" in r, false, "an unaliased act withholds nothing");
  for (const act of [{ id: "ACT-2025-0001" }, { event: "ACT-2025-0001" }, { ...input().act, event: "ACT-2025-0001" }]) {
    const x = nothing(w, () => w.c.determine(input({ act })));
    refused(x, "ACT_NOT_AN_EVENT");
    assert.equal(x.act, "ACT-2025-0001");
  }
  assert.equal(CONFORMANCE_CHECKS.ACT_NOT_AN_EVENT.check, "C-113.31");
  /* superseding it with no act names its act, so the same refusal */
  refused(nothing(w, () => w.c.determine(input({ act: undefined, supersedes: id, reason: "restated" }))), "ACT_NOT_AN_EVENT");
  /* an ACT- id no determination of this project recorded is no event */
  assert.deepEqual(w.c.determine(input({ act: { event: "ACT-2025-0099" } })), noSuchEvent("ACT-2025-0099", { act: "ACT-2025-0099" }));
  /* the lists answer it too, filtered by its id */
  assert.deepEqual(w.c.determinationsFor({ act: "ACT-2025-0001", viewer: V("pat") }).items.map((i) => [i.id, i.act.act_unaliased]),
                   [[id, true]]);
});

test("R26 R7 R11: once a member aliases an ACT- id to an event, it answers that event and is the same act: read, listed and superseded as one; a determination naming it by id alone takes its recorded actor and evidence; no ACT- id is minted", () => {
  const { w, proj, ev, std, act, input } = scene();
  const id = legacy(w, proj, ev, std);
  assert.equal(w.events.aliasAct({ actId: "ACT-2025-0001", eventId: act, by: V("olive") }).ok, true);
  const r = w.c.determinationRead({ id, viewer: V("pat") });
  assert.deepEqual([r.act.id, r.act.event, "act_unaliased" in r.act, r.event.id], ["ACT-2025-0001", act, false, act]);
  assert.equal(r.act.description, "The parks department closed the east playground", "read as recorded");
  /* named by its ACT- id alone: the event, with the actor and evidence it was recorded with */
  const byId = w.c.determine(input({ act: { id: "ACT-2025-0001" } }));
  assert.equal(byId.ok, true, JSON.stringify(byId).slice(0, 300));
  assert.deepEqual([byId.act.id, byId.act.event, byId.act.actor.role, byId.act.evidence], [act, act, "Director of Parks", [ev.content]]);
  const byEvent = w.c.determine(input());
  /* one act: listed by either id */
  for (const a of ["ACT-2025-0001", act])
    assert.deepEqual(w.c.determinationsFor({ act: a, viewer: V("pat") }).items.map((i) => i.id), [byId.id, byEvent.id, id].sort(), a);
  /* superseded as the same act, by the event or with no act given */
  const sup = w.c.determine(input({ supersedes: id, reason: "restated against its event" }));
  assert.deepEqual([sup.ok, sup.act.event, sup.supersedes], [true, act, id]);
  assert.equal(w.c.determinationRead({ id, viewer: V("pat") }).superseded_by, sup.id);
  const sup2 = w.c.determine(input({ act: undefined, supersedes: byId.id, reason: "again" }));
  assert.deepEqual([sup2.ok, sup2.act.event], [true, act]);
  /* another event is another act */
  refused(w.c.determine(input({ act: { ...input().act, event: w.event(ev) }, supersedes: byEvent.id, reason: "r" })),
          "SUPERSEDES_ANOTHER_ACT");
  /* no ACT- id is minted from T33 on */
  assert.deepEqual(w.rows(`SELECT DISTINCT act_id FROM determinations WHERE act_id LIKE 'ACT-%'`).map((x) => x.act_id), ["ACT-2025-0001"]);
});

test("R25 R26 R16: a store made before T33 gains the act's columns at migration, its rows kept as written", () => {
  const st = storage();
  st.sql.exec(`CREATE TABLE determinations (determination_id TEXT PRIMARY KEY, project_id TEXT NOT NULL, act_id TEXT NOT NULL,
    act_minted INTEGER NOT NULL DEFAULT 0, act_description TEXT NOT NULL, act_role TEXT NOT NULL, act_body TEXT NOT NULL,
    act_at TEXT, act_from TEXT, act_to TEXT, act_evidence TEXT NOT NULL, proposal_id TEXT, supersedes TEXT, reason TEXT,
    author TEXT NOT NULL, at TEXT NOT NULL)`);
  st.sql.exec(`INSERT INTO determinations (determination_id, project_id, act_id, act_description, act_role, act_body,
    act_evidence, author, at) VALUES ('CONF-2025-0001-determination','PROJ-1','ACT-2025-0001','d','r','b','[]','member:o','t')`);
  migrateConformance(st.sql);
  migrateConformance(st.sql);
  const cols = st.sql.exec(`PRAGMA table_info(determinations)`).toArray().map((c) => c.name);
  for (const c of ["act_event", "act_entity", "act_when"]) assert.ok(cols.includes(c), c);
  assert.deepEqual(st.sql.exec(`SELECT act_id, act_event FROM determinations`).toArray(), [{ act_id: "ACT-2025-0001", act_event: null }]);
});
