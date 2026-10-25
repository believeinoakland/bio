/* case-authoring R57 (C11; K1494) and R55's people (case-disclosures R24, R25, R27, R28; K1483, K1490): the timeline a
   case carries, composed at authoring from `events.timeline` over the members' subjects and the events their legs cite,
   the two lanes apart, each item with its source, an item with none left out and counted; and the people the case
   names, each with the owner's basis, and the signer's attestation of no undeclared tie. `events` is a stand-in at its
   ruled interface (its R28–R30 `timeline`, its `readEvent`), answering the real module's shapes, where a test must
   control the lanes; the people arms run on the real events and the real case-disclosures; a member's subject and
   event legs are given through case-authoring's view of inquiry. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, AUTHORED, WHAT_CHANGED } from "./fixture.mjs";
import { timelineBodyLines } from "../../../src/case-authoring/document.mjs";
import { timelineOf } from "../../../src/case-grammar/index.mjs";
import { peopleOf, memberTiesOf } from "../../../src/case-disclosures/index.mjs";
import { word } from "../../../src/setup-words/index.mjs";
import { timelineRefusal } from "../events/fixtures.mjs";

const DOC = "INFO-2026-0001-a", Q = "INQ-2026-0001-q", Q2 = "INQ-2026-0002-q";
const SUBJ = "ENT-2026-0001-council", E1 = "EVT-2026-0001-a", E2 = "EVT-2026-0002-b", E3 = "EVT-2026-0003-c", E4 = "EVT-2026-0004-d";
const CAP = "c".repeat(64);

function eventsStandIn(calls = []) {
  const held = {
    [E1]: { event_id: E1, kind: "meeting", status: "held", governing: 7, attestations: [{ attestation_id: 7, capture_sha: CAP }],
            participants: [{ entity_id: "ENT-2026-0009-person" }] },
    [E2]: { event_id: E2, kind: "vote", status: "held", governing: null, attestations: [{ attestation_id: 9, capture_sha: null, testimony: true }],
            participants: [] },
    [E3]: { event_id: E3, kind: "award", status: "held", governing: null, attestations: [], participants: [] },
    [E4]: { event_id: E4, kind: "signing", status: "held", governing: null, attestations: [{ attestation_id: 11, capture_sha: "d".repeat(64) }],
            participants: [] },
  };
  return {
    timeline: ({ set, viewer, audience }) => {
      calls.push({ set, viewer, audience });
      return { ok: true, set,
        world: { label: "what they did", items: [
          { event_id: E1, kind: "meeting", status: "held", when: { value: "2026-03-04", precision: "day", zone: "Z/Somewhere" }, roles: [], concerns: true },
          { event_id: E2, kind: "vote", status: "held", when: { value: "2026-03", precision: "month" }, roles: [], concerns: true },
          { event_id: E3, kind: "award", status: "held", when: { value: "2026-04-01", precision: "day" }, roles: [], concerns: true }],
          placed_nowhere: [{ event_id: E4, kind: "signing", status: "held", when: null, roles: [], concerns: true }] },
        ours: { label: "what we did", sources: [
          { source: "docket", items: [{ at: "2026-05-01", label: "filed a records request", ref: "DKT-2026-0001", kind: "request", public: true },
                                      { at: "2026-05-02", label: "no ref", ref: null, kind: "note", public: true }] },
          { source: "actions", error: "it threw" }] } };
    },
    readEvent: ({ eventId }) => (held[eventId] ? { ok: true, found: true, event: held[eventId] } : { ok: true, found: false }),
  };
}

function setup({ subjects = { [Q]: SUBJ }, eventLegs = { [Q2]: [E1] }, events = null } = {}) {
  const calls = [];
  const inquiry = (real) => new Proxy(real, { get: (t, k) => (k === "subjectEntityOf" ? (id) => subjects[id] ?? null
    : k === "basisFor" ? (id, o) => { const b = t.basisFor(id, o); return b && b.ok !== false
        ? { ...b, legs: [...b.legs, ...(eventLegs[id] || []).map((e, i) => ({ ord: 50 + i, target_id: e, role: "supports" }))] } : b; }
    : typeof t[k] === "function" ? t[k].bind(t) : t[k]) });
  const w = world({ inquiry, deps: { events: events || eventsStandIn(calls) } });
  w.member("alice");
  w.doc(DOC);
  w.finding(Q, [{ target: DOC }]);
  w.finding(Q2, [{ target: DOC }]);
  const P = w.project("Team", "alice", [Q, Q2]);
  return { w, P, calls };
}
const publish = (w, P, over = {}) => w.publish(P, "alice", [Q, Q2], { whatChanged: WHAT_CHANGED, ...over });
const docOf = (w, r) => w.row(`SELECT text FROM case_documents WHERE case_id=? AND edition=?`, r.caseId, r.edition).text;
const bodyOf = (text) => text.slice(text.indexOf("\n---\n", 4) + 5);

test("R57: the timeline is read through events.timeline over the members' subject entities and the events their legs cite, as the publisher sees the record at the act", () => {
  const { w, P, calls } = setup();
  const r = publish(w, P);
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.deepEqual(calls, [{ set: [SUBJ, E1], viewer: V("alice"), audience: "public" }]);
  /* negative control: no subject and no event leg, and events is not asked; the block is written empty */
  const n = setup({ subjects: {}, eventLegs: {} });
  const r2 = publish(n.w, n.P);
  assert.equal(r2.ok, true);
  assert.deepEqual(n.calls, []);
  assert.deepEqual(timelineOf(n.w.fm(docOf(n.w, r2))), { they_did: [], we_did: [] });
});

test("R57: the timeline: block writes the world's lane (they_did) and the registered sources' lane (we_did) apart, each in its own order, each item with its source (the governing attestation's capture, else the record entry); an item with no source is left out and counted, as is a source that failed", () => {
  const { w, P } = setup();
  const r = publish(w, P);
  const lanes = timelineOf(w.fm(docOf(w, r)));
  const rows = [...lanes.they_did, ...lanes.we_did];
  assert.deepEqual(rows.map((x) => [x.lane, x.ord, x.when, x.label, x.ref, x.source]), [
    ["they_did", 1, "2026-03-04", "meeting, held", E1, CAP],
    ["they_did", 2, "2026-03", "vote, held", E2, "event_attestation:9"],
    ["they_did", 3, "nowhere", "signing, held", E4, "d".repeat(64)],
    ["we_did", 1, "2026-05-01", "filed a records request", "DKT-2026-0001", "docket:DKT-2026-0001"]]);
  const body = bodyOf(docOf(w, r));
  assert.ok(body.includes("### What they did") && body.includes("### What we did"));
  assert.ok(body.includes("3 item(s) had no source this record could cite and are left out."), "E3, the unref'd item, the failed source");
  assert.ok(body.indexOf("### What they did") < body.indexOf("### What we did"), "two lists, never merged");
  /* no zone is written (R30), and nothing about a person is in a row */
  assert.equal(docOf(w, r).includes("Somewhere"), false);
  assert.equal(JSON.stringify(rows).includes("ENT-2026-0009-person"), false);
});

test("R57: the body's timeline section prints each lane as its own list and says how many items were left out; with no item and none left out there is no section", () => {
  assert.deepEqual(timelineBodyLines([], 0), []);
  const lines = timelineBodyLines([{ lane: "we_did", ord: 1, when: "2026-05-01", label: "asked", ref: "R1", source: "s" }], 2);
  assert.ok(lines.includes(word("case-authoring.document.lane")), "the empty world lane is stated, not dropped");
  assert.ok(lines.includes("1. 2026-05-01 — asked (R1; source s)"));
  assert.ok(lines.includes("2 item(s) had no source this record could cite and are left out."));
});

/* A world with people, on the real case-disclosures and events: PAT signed an event the finding's leg cites (a timeline
   participant), and SAM is named by id in the statement. */
function peopleWorld() {
  const inquiry = (real) => new Proxy(real, { get: (t, k) => (k === "basisFor"
    ? (id, o) => { const b = t.basisFor(id, o); return b && b.ok !== false && id === Q
        ? { ...b, legs: [...b.legs, { ord: 50, target_id: w.SIGNED, role: "supports" }] } : b; }
    : typeof t[k] === "function" ? t[k].bind(t) : t[k]) });
  const w = world({ inquiry });
  w.member("alice");
  const mk = (label) => { const r = w.entities.createEntity({ kind: "person", label, note: "registered by the test", declaredBy: V("alice") });
                          if (!r.ok) throw new Error(JSON.stringify(r)); return r.entity_id; };
  const PAT = mk("Pat Example"), SAM = mk("Sam Private");
  const ev = w.events.createEvent({ kind: "signing", attestations: [{ testimony: "I saw the signing.", value: "2026-03-02" }],
    participants: [{ entityId: PAT, role: "signatory", attestation: 0 }], by: V("alice") });
  if (!ev.ok) throw new Error(JSON.stringify(ev));
  w.SIGNED = ev.event_id;
  w.doc(DOC);
  w.finding(Q, [{ target: DOC }]);
  const P = w.project("Team", "alice", [Q]);
  const statement = `It does not cover what ${SAM} said afterwards.`;
  return { w, P, PAT, SAM, statement };
}
const BASES = (x) => [{ person: x.PAT, basis: "private_party", words: "they signed the award" },
                      { person: x.SAM, basis: "private_party", words: "they spoke at the hearing" }];

test("R55 (case-disclosures R24, R25): the people the case names are asked of case-disclosures over the parts this act assembles — an id in an authored sentence, a timeline event's participants — and a person named with no basis given refuses PERSON_BASIS_UNRECORDED (C-120.14), naming each with where, before any id is drawn", () => {
  const x = peopleWorld();
  const before = x.w.snapshot();
  const r = x.w.publish(x.P, "alice", [Q], { statement: x.statement });
  assert.deepEqual([r.ok, r.code, r.check], [false, "PERSON_BASIS_UNRECORDED", "C-120.14"], JSON.stringify(r).slice(0, 400));
  assert.deepEqual(r.unrecorded.map((u) => [u.person, u.places.map((p) => p.place)]).sort(),
    [[x.PAT, ["timeline"]], [x.SAM, ["statement"]]].sort());
  assert.deepEqual(x.w.snapshot(), before, "nothing written");
  /* negative control: nobody named, nothing asked */
  const n = setup({ subjects: {}, eventLegs: {} });
  assert.equal(publish(n.w, n.P).ok, true);
});

test("R55 (case-disclosures R25, R28): with each basis given the case publishes, and the people: block, written through case-disclosures' renderer, states each person with the places named and the basis kind, never a judgment of them", () => {
  const x = peopleWorld();
  const ok = x.w.publish(x.P, "alice", [Q], { statement: x.statement, peopleBases: BASES(x) });
  assert.equal(ok.ok, true, JSON.stringify(ok).slice(0, 400));
  const fm = x.w.fm(docOf(x.w, ok));
  const rows = peopleOf(fm);
  assert.deepEqual(rows.map((p) => [p.person, p.basis]).sort(), [[x.PAT, "private_party"], [x.SAM, "private_party"]].sort());
  assert.ok(rows.every((p) => typeof p.places === "string" && p.places.length), "the places named");
});

test("R55 (case-disclosures R27): the signer — the publishing owner — attests no undeclared tie by tieAttested: true, stamped with the author and the act's instant (R25); without it the act refuses TIE_ATTESTATION_MISSING (C-120.16), after the people (R55's order), naming the signer to themself; a body's own signer list is not an attestation; the pre-flight lists both", () => {
  const x = peopleWorld();
  assert.equal(x.w.publish(x.P, "alice", [Q], { statement: x.statement, tieAttested: undefined }).reason, "PERSON_BASIS_UNRECORDED",
    "the people first");
  const before = x.w.snapshot();
  const r = x.w.publish(x.P, "alice", [Q], { statement: x.statement, peopleBases: BASES(x), tieAttested: undefined });
  assert.deepEqual([r.code, r.check, r.missing], ["TIE_ATTESTATION_MISSING", "C-120.16", ["alice"]]);
  const forged = x.w.publish(x.P, "alice", [Q], { statement: x.statement, peopleBases: BASES(x),
                                                  tieAttested: [{ signer: "alice", at: "2020-01-01T00:00:00Z" }] });
  assert.equal(forged.code, "TIE_ATTESTATION_MISSING", "only the act's own attestation counts");
  assert.deepEqual(x.w.snapshot(), before);
  const ok = x.w.publish(x.P, "alice", [Q], { statement: x.statement, peopleBases: BASES(x), tieAttested: true });
  assert.equal(ok.ok, true, JSON.stringify(ok).slice(0, 300));
  assert.deepEqual(memberTiesOf(x.w.fm(docOf(x.w, ok))).filter((t) => t.row === "attestation").map((t) => [t.signer, t.at]),
    [["alice", x.w.clock.now]]);
  /* R34: both are blockers the pre-flight reaches independently */
  const y = peopleWorld();
  const pre = y.w.ca.publishPreflight({ ...AUTHORED, whatChanged: WHAT_CHANGED, statement: y.statement, tieAttested: undefined,
    project: y.P, targets: [Q], roles: { [Q]: "load_bearing" }, viewer: V("alice"), author: "alice" });
  assert.equal(pre.first.code, "PERSON_BASIS_UNRECORDED");
  assert.ok(pre.blockers.some((b) => b.code === "TIE_ATTESTATION_MISSING"), JSON.stringify(pre.blockers).slice(0, 300));
});

test("R57, R26: a lane events cut at its limit (truncated) is stated as stopping at its bound, never read as whole; a timeline read that fails is stated as not read, never as empty", () => {
  const cutEvents = eventsStandIn();
  const real = cutEvents.timeline;
  cutEvents.timeline = (a) => { const r = real(a); return { ...r, world: { ...r.world, truncated: true },
    ours: { ...r.ours, sources: r.ours.sources.map((s) => (s.source === "docket" ? { ...s, truncated: true } : s)) } }; };
  const c = setup({ events: cutEvents });
  const body = bodyOf(docOf(c.w, publish(c.w, c.P)));
  assert.ok(body.includes(word("case-authoring.cuts.map.list_did_stops")));
  assert.ok(body.includes("What we did, from docket, stops at its bound: that source holds more than this case lists."));
  /* negative control: nothing cut, nothing said of a bound */
  const whole = setup();
  assert.equal(bodyOf(docOf(whole.w, publish(whole.w, whole.P))).includes("stops at its bound"), false);
  /* a read that fails */
  const failing = { ...eventsStandIn(), timeline: () => timelineRefusal().noSet };
  const f = setup({ events: failing });
  const fr = publish(f.w, f.P);
  assert.equal(fr.ok, true, JSON.stringify(fr).slice(0, 300));
  const fb = bodyOf(docOf(f.w, fr));
  assert.ok(fb.includes("The timeline could not be read when this case was published (NO_SET). It is stated as not read, not as empty"));
  assert.deepEqual(timelineBodyLines([], 0, { cut: [] }), [], "nothing to say, no section");
});

test("R57 (T45; v0.2 rules 15, 17): the we_did lane is the case's published record of actions: events.timeline is asked with audience \"public\", only items their source marks public: true are written, any other is left out and counted in the lane's withheld count, never written, and no word is added to a label", () => {
  const calls = [];
  const stub = eventsStandIn(calls);
  stub.timeline = (a) => { calls.push(a); return { ok: true, set: a.set, world: { label: "what they did", items: [], placed_nowhere: [] },
    ours: { label: "what we did", sources: [{ source: "actions", items: [
      { at: "2026-06-01", label: "met counsel about the matter", ref: "ACT-2026-0001", kind: "meeting" },
      { at: "2026-06-02", label: "sent the request for comment", ref: "ACT-2026-0002", kind: "request", public: true },
      { at: "2026-06-03", label: "drafted a reply", ref: "ACT-2026-0003", kind: "draft", public: "true" },
      { at: "2026-06-04", label: "stopped pursuing the escalation", ref: "ESC-2026-0001", kind: "escalation", public: true }] }] } }; };
  const { w, P } = setup({ events: stub });
  const r = publish(w, P);
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.equal(calls.length, 1);
  assert.equal(calls[0].audience, "public");
  const text = docOf(w, r);
  const lanes = timelineOf(w.fm(text));
  assert.deepEqual(lanes.we_did.map((x) => [x.ref, x.label, x.when]),
    [["ACT-2026-0002", "sent the request for comment", "2026-06-02"],
     ["ESC-2026-0001", "stopped pursuing the escalation", "2026-06-04"]], "the label as the source put it, nothing added");
  assert.deepEqual(r.timeline, { we_did: 2, withheld: 2 });
  for (const hidden of ["ACT-2026-0001", "met counsel", "ACT-2026-0003", "drafted a reply"])
    assert.equal(text.includes(hidden), false, `${hidden} is never written`);
  assert.ok(bodyOf(text).includes("2 of the team's own act(s) were not marked public by the record that holds them and are left out of this published record of what we did."));
  /* control: one item without the mark and one with it: only the second is written, withheld: 1 */
  const c = [];
  const one = eventsStandIn(c);
  one.timeline = (a) => { c.push(a); return { ok: true, set: a.set, world: { items: [], placed_nowhere: [] },
    ours: { sources: [{ source: "actions", items: [{ at: "2026-06-01", label: "a", ref: "ACT-2026-0001" },
                                                   { at: "2026-06-02", label: "b", ref: "ACT-2026-0002", public: true }] }] } }; };
  const k = setup({ events: one });
  const kr = publish(k.w, k.P);
  assert.deepEqual(timelineOf(k.w.fm(docOf(k.w, kr))).we_did.map((x) => x.ref), ["ACT-2026-0002"]);
  assert.deepEqual(kr.timeline, { we_did: 1, withheld: 1 });
  assert.equal(c[0].audience, "public");
  /* and with nothing withheld no such sentence is written */
  const n = setup();
  const nr = publish(n.w, n.P);
  assert.equal(nr.timeline.withheld, 0);
  assert.equal(bodyOf(docOf(n.w, nr)).includes("not marked public"), false);
});
