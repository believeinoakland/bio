/* case-authoring R57 (C11; K1494) and R55's people (case-disclosures R24, R25, R27, R28; K1483, K1490): the timeline a
   case carries, composed at authoring from `events.timeline` over the members' subjects and the events their legs cite,
   the two lanes apart, each item with its source, an item with none left out and counted; and the people the case
   names, each with the owner's basis, and the signer's attestation of no undeclared tie. `events` is a stand-in at its
   ruled interface (its R28–R30 `timeline`, its `readEvent`), answering the real module's shapes; the people judgments
   are case-disclosures' (the fixture's stand-in until its job merges, K1563 (1)); a member's subject and event legs are
   given through case-authoring's view of inquiry. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, AUTHORED, WHAT_CHANGED } from "./fixture.mjs";
import { timelineBodyLines } from "../../../src/case-authoring/document.mjs";

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
    timeline: ({ set, viewer }) => {
      calls.push({ set, viewer });
      return { ok: true, set,
        world: { label: "what they did", items: [
          { event_id: E1, kind: "meeting", status: "held", when: { value: "2026-03-04", precision: "day", zone: "Z/Somewhere" }, roles: [], concerns: true },
          { event_id: E2, kind: "vote", status: "held", when: { value: "2026-03", precision: "month" }, roles: [], concerns: true },
          { event_id: E3, kind: "award", status: "held", when: { value: "2026-04-01", precision: "day" }, roles: [], concerns: true }],
          placed_nowhere: [{ event_id: E4, kind: "signing", status: "held", when: null, roles: [], concerns: true }] },
        ours: { label: "what we did", sources: [
          { source: "docket", items: [{ at: "2026-05-01", label: "filed a records request", ref: "DKT-2026-0001", kind: "request" },
                                      { at: "2026-05-02", label: "no ref", ref: null, kind: "note" }] },
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
  assert.deepEqual(calls, [{ set: [SUBJ, E1], viewer: V("alice") }]);
  /* negative control: no subject and no event leg, and events is not asked; the block is written empty */
  const n = setup({ subjects: {}, eventLegs: {} });
  const r2 = publish(n.w, n.P);
  assert.equal(r2.ok, true);
  assert.deepEqual(n.calls, []);
  assert.deepEqual(n.w.fm(docOf(n.w, r2)).timeline || [], []);
});

test("R57: the timeline: block writes the world's lane (they_did) and the registered sources' lane (we_did) apart, each in its own order, each item with its source (the governing attestation's capture, else the record entry); an item with no source is left out and counted, as is a source that failed", () => {
  const { w, P } = setup();
  const r = publish(w, P);
  const rows = w.fm(docOf(w, r)).timeline;
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
  assert.ok(lines.includes("Nothing in this lane."), "the empty world lane is stated, not dropped");
  assert.ok(lines.includes("1. 2026-05-01 — asked (R1; source s)"));
  assert.ok(lines.includes("2 item(s) had no source this record could cite and are left out."));
});

test("R55 (case-disclosures R24): the people the case names are asked over the parts this act assembles — the authored sentences, the conclusions, the members' subjects, the lens, the timeline with each event's participants, and the money the calculations cite — as the publisher sees them", () => {
  const { w, P } = setup();
  publish(w, P);
  const asked = w.people.asked.find((a) => a.peopleNamed).peopleNamed;
  assert.equal(asked.viewer, V("alice"));
  assert.deepEqual(Object.keys(asked.parts).sort(), ["bias", "conclusions", "excluded", "justification", "lens", "money", "scope",
    "statement", "subjects", "timeline"]);
  assert.equal(asked.parts.statement, AUTHORED.statement);
  assert.deepEqual(asked.parts.subjects, [{ target: Q, entity: SUBJ }]);
  assert.deepEqual(asked.parts.timeline.find((x) => x.ref === E1).participants, ["ENT-2026-0009-person"]);
  assert.deepEqual(asked.parts.conclusions.map((c) => c.target), [Q, Q2]);
});

test("R55 (case-disclosures R25, R28): a person the case names with no basis given refuses as case-disclosures answers (PERSON_BASIS_UNRECORDED), before any id is drawn; with each basis given it publishes and the people: block is written through its renderer", () => {
  const { w, P } = setup();
  w.people.named = [{ person: "ENT-2026-0009-person", places: ["timeline"] }];
  const before = w.snapshot();
  const r = publish(w, P);
  assert.deepEqual([r.ok, r.reason, r.people], [false, "PERSON_BASIS_UNRECORDED", ["ENT-2026-0009-person"]]);
  assert.deepEqual(w.snapshot(), before, "nothing written");
  const ok = publish(w, P, { peopleBases: [{ person: "ENT-2026-0009-person", basis: "act_or_position", ref: "LIN-2026-0001" }] });
  assert.equal(ok.ok, true, JSON.stringify(ok).slice(0, 300));
  assert.deepEqual(w.fm(docOf(w, ok)).people, [{ person: "ENT-2026-0009-person", basis: "act_or_position", ref: "LIN-2026-0001" }]);
  const judged = w.people.asked.filter((a) => a.peopleJudged).at(-1).peopleJudged;
  assert.deepEqual(judged.bases, [{ person: "ENT-2026-0009-person", basis: "act_or_position", ref: "LIN-2026-0001" }], "handed whole");
});

test("R55 (case-disclosures R27): the signer — the publishing owner, the author stamp — is asked the attestation of no undeclared tie, with the money the case cites; one missing refuses as case-disclosures answers, after the people (R55's order); the pre-flight lists both", () => {
  const { w, P } = setup();
  w.people.tiesRequired = true;
  w.people.named = [{ person: "ENT-2026-0009-person", places: ["timeline"] }];
  assert.equal(publish(w, P).reason, "PERSON_BASIS_UNRECORDED", "the people first");
  const bases = { peopleBases: [{ person: "ENT-2026-0009-person", basis: "consent", ref: CAP }] };
  const r = publish(w, P, bases);
  assert.deepEqual([r.reason, r.signers], ["TIE_ATTESTATION_MISSING", ["alice"]]);
  const asked = w.people.asked.filter((a) => a.tieAttestationJudged).at(-1).tieAttestationJudged;
  assert.deepEqual([asked.signers, asked.moneyParties, asked.attested], [["alice"], [], null]);
  assert.equal(publish(w, P, { ...bases, tieAttested: { by: "alice", none_undeclared: true } }).ok, true);
  /* R34: both are blockers the pre-flight reaches */
  const n = setup();
  n.w.people.tiesRequired = true;
  n.w.people.named = [{ person: "ENT-2026-0009-person", places: ["timeline"] }];
  const pre = n.w.ca.publishPreflight({ ...AUTHORED, whatChanged: WHAT_CHANGED, project: n.P, targets: [Q, Q2],
    roles: { [Q]: "load_bearing", [Q2]: "load_bearing" }, viewer: V("alice"), author: "alice" });
  assert.equal(pre.first.reason, "PERSON_BASIS_UNRECORDED");
  assert.ok(pre.blockers.some((b) => b.reason === "TIE_ATTESTATION_MISSING"), JSON.stringify(pre.blockers).slice(0, 300));
});
