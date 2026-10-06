/* events: the ops map (R36) and no place in behaviour, defaults or outward text (R42), at the interface. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, MEMBER } from "./fixture.mjs";
import { eventsOps } from "../../../src/events/index.mjs";

const call = (w, op, query = {}, body = undefined) => {
  const url = new URL("https://plane.test/op");
  for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);
  return eventsOps(w.ev, url, body)[op]();
};

test("R36 eventsOps: one arm per act and read, parameters from the url (the control plane's stamps), an act's arguments from the body, its author always the url's stamp", () => {
  const w = world();
  const ops = Object.keys(eventsOps(w.ev, new URL("https://plane.test/"), {})).sort();
  assert.deepEqual(ops, ["actalias", "datedfact", "datedfacts", "editacts", "event", "eventattest", "eventcreate", "eventforact",
    "eventgovern", "eventimport", "eventmerge", "eventrelate", "eventrelationwithdraw", "eventsfor", "eventsplit", "participantadd",
    "participantcorrect", "proceedingstatus", "readoptin", "registerimport", "sequence", "statementsof", "timeline", "whowassent"].sort());
  const s = w.capture("ops");
  const f = call(w, "datedfact", { by: MEMBER }, { captureSha: s, extent: { kind: "document" }, kind: "meeting", value: "2026-02-02", method: "m", by: "member:forged" });
  assert.equal(f.dated_fact.by, MEMBER, "the body's own author is never read");
  const unstamped = call(w, "datedfact", {}, { captureSha: s, extent: { kind: "document" }, kind: "issued", value: "2026-02-03", method: "m", by: MEMBER });
  assert.equal(unstamped.dated_fact.by, null, "with no stamp, a body's by is still not read");
  const p = w.entity("Ola");
  const e = call(w, "eventcreate", { by: MEMBER }, { kind: "meeting", attestations: [{ datedFactId: f.dated_fact.dated_fact_id }],
                                                     participants: [{ entityId: p, role: "present", attestation: 0 }] });
  assert.equal(e.ok, true);
  assert.equal(call(w, "event", { id: e.event_id, viewer: MEMBER }).event.by, MEMBER);
  assert.equal(call(w, "event", { id: e.event_id }).found, false, "no viewer stamp, nothing seen");
  assert.equal(call(w, "eventsfor", { entity: p, viewer: MEMBER, limit: "5" }).events.length, 1);
  assert.equal(call(w, "timeline", { set: p, viewer: MEMBER, lanes: "world" }).world.items.length, 1);
  assert.equal(call(w, "datedfacts", { sha256: s, viewer: MEMBER }).count, 2);
  assert.equal(call(w, "whowassent", { id: e.event_id, viewer: MEMBER }).participants.length, 1);
  assert.equal(call(w, "statementsof", { entity: p, viewer: MEMBER }).count, 0);
  assert.equal(call(w, "actalias", { by: MEMBER }, { actId: "ACT-2026-0007", eventId: e.event_id }).ok, true);
  assert.equal(call(w, "eventforact", { act: "ACT-2026-0007" }).event_id, e.event_id);
  const e2 = w.event({ value: "2026-02-05" }).event_id;
  assert.equal(call(w, "sequence", { a: e.event_id, b: e2 }).answer, "before");
  assert.equal(call(w, "eventmerge", { by: "class:daemon" }, { keep: e.event_id, absorb: e2, reason: "r" }).reason, "MEMBER_ACT_ONLY");
  assert.equal(call(w, "proceedingstatus", { proceeding: p, at: "2026-02-02", viewer: MEMBER }).reason, "NOT_A_PROCEEDING");
  assert.equal(call(w, "readoptin", { by: MEMBER }, { captureClasses: [] }).reason, "NOT_AN_ADMIN");
  assert.equal(call(w, "eventimport", { by: "class:daemon" }, {}).reason, "NO_BODY");
  assert.equal(call(w, "registerimport", { by: "class:daemon" }, {}).reason, "NO_ENTITY");
  assert.equal(call(w, "editacts", { by: MEMBER }, {}).reason, "NO_SHA");
  for (const op of ["eventattest", "eventgovern", "participantadd", "participantcorrect", "eventsplit", "eventrelate", "eventrelationwithdraw"])
    assert.equal(call(w, op, { by: MEMBER }, undefined).ok, false, `${op} with no body refuses`);
});

test("R42 no place is named in the module's behaviour, defaults or outward text; zones, vote values and flows come from the profile", () => {
  /* every refusal and answer the module gives, over a store with no profile, names no place */
  const w = world({ view: {} });
  const s = w.capture("noplace");
  const out = [];
  const say = (x) => { out.push(JSON.stringify(x)); return x; };
  const f = say(w.ev.recordDatedFact({ captureSha: s, extent: { kind: "document" }, kind: "meeting", value: "2026-02-02", method: "m", by: MEMBER }));
  for (const bad of [{ kind: "x" }, { value: "2026-02-31" }, { method: "" }, { extent: null }])
    say(w.ev.recordDatedFact({ captureSha: s, extent: { kind: "document" }, kind: "meeting", value: "2026-02-02", method: "m", by: MEMBER, ...bad }));
  const e = say(w.ev.createEvent({ kind: "meeting", attestations: [{ datedFactId: f.dated_fact.dated_fact_id }], by: MEMBER })).event_id;
  for (const x of [{ kind: "x" }, { status: "x" }, { attestations: [] }]) say(w.ev.createEvent({ kind: "meeting", attestations: [{ captureSha: s, extent: { kind: "document" } }], by: MEMBER, ...x }));
  say(w.ev.addParticipant({ eventId: e, entityId: w.entity("Pia"), role: "payer", attestation: 1, by: MEMBER }));
  say(w.ev.relate({ from: e, to: e, kind: "stated_cause", attestation: { testimony: "t" }, by: MEMBER }));
  say(w.ev.readEvent({ eventId: e, viewer: MEMBER }));
  say(w.ev.followedImport({}));
  say(w.ev.timeline({ set: [] }));
  const text = out.join("\n");
  assert.ok(!/oakland|alameda|california|los angeles|america\/|port ellery|marlow|halifax/i.test(text), "no place in outward text");
  /* with no profile, nothing local is assumed: no zone, so a date's span is not placed */
  assert.equal(f.dated_fact.zone, null);
  const v = w.ev.readEvent({ eventId: e, viewer: MEMBER }).event;
  assert.deepEqual([v.when.start, v.when.end, v.when.zone], [null, null, null]);
  assert.equal(w.ev.sequence({ a: e, b: e }).answer, "undetermined");
  /* the zone, the vote values and the flows are the view's: another view, another zone */
  const w2 = world({ view: { time_zone: { value: "UTC", status: "researched", basis: "TEST" } } });
  const s2 = w2.capture("utc");
  assert.equal(w2.ev.recordDatedFact({ captureSha: s2, extent: { kind: "document" }, kind: "meeting", value: "2026-02-02", method: "m", by: MEMBER }).dated_fact.zone, "UTC");
});
