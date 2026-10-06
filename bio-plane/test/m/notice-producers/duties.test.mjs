/* R5: duty occurrences come due, over the real `duties` (its R7–R11) and `civil-time`, on duties' own test world (a
   fictional profile in America/Halifax: a records-response rule of 10 days, rolled on court days, and a monthly rule). */
import test from "node:test";
import assert from "node:assert/strict";
import { world, E, BOB, ZONE } from "../duties/fixture.mjs";
import { producers, fresh, reader, ofKind, sentences, JUDGMENT } from "./fixture.mjs";

const day = (value) => ({ value, precision: "day", zone: ZONE });
const KIND = "temporal-expectation-due";
function setup() {
  const w = world();
  const n = producers(w.host, { membership: w.membership, duties: w.duties });
  return { w, n, ...reader(n) };
}

test("R5: an adopted duty's occurrence the record shows overdue is one FINDING temporal-expectation-due, keyed by duty and occurrence, to the member who adopted it, `due` its local day; pending before", () => {
  const { w, read } = setup();
  const a = w.declare();                                     /* trigger 2026-02-02, due 2026-02-12 */
  assert.equal(a.ok, true);
  assert.deepEqual(ofKind(read("bob", { now: "2026-02-11T12:00:00Z" }), KIND), [], "pending: no item");
  /* 22:00 on the 12th in Halifax is still the due day: no item on the UTC day */
  assert.deepEqual(ofKind(read("bob", { now: "2026-02-13T02:00:00Z" }), KIND), []);
  const items = ofKind(read("bob", { now: "2026-02-13T12:00:00Z" }), KIND);
  assert.equal(items.length, 1);
  const occ = w.duties.occurrencesOf({ dutyId: a.duty_id, asOf: "2026-02-13T12:00:00Z", viewer: BOB }).occurrences[0];
  const it = items[0];
  assert.equal(it.id, `FINDING::${KIND}::${a.duty_id}::${occ.key}::overdue`);
  assert.equal(it.class, "FINDING");
  assert.equal(it.label, "noticed");
  assert.equal(it.due, "2026-02-12");
  assert.deepEqual(it.recipients, ["bob"]);
  assert.equal(it.basis.recipients_rule, "adopter");
  assert.equal(it.subject.kind, "duty");
  assert.equal(it.subject.id, a.duty_id);
  assert.equal(it.subject.occurrence, occ.key);
  assert.deepEqual(it.subject.due, day("2026-02-12"));
  assert.equal(it.subject.basis_kind, "rule");
  assert.deepEqual(it.subject.derivation, occ.derivation);
  /* carol adopted nothing: no item */
  assert.deepEqual(ofKind(read("carol", { now: "2026-02-13T12:00:00Z" }), KIND), []);
});

test("R5: never a violation: the detail is a question with its derivation; it says nothing of a breach", () => {
  const { w, read } = setup();
  w.declare();
  const it = ofKind(read("bob", { now: "2026-02-20T12:00:00Z" }), KIND)[0];
  assert.match(it.detail, /question, not a finding/);
  assert.match(it.summary, /^A question/);
  for (const s of sentences(it)) assert.doesNotMatch(s, JUDGMENT, s);
  assert.equal(it.basis.state, "overdue");
  assert.ok(it.basis.derivation.source_in_force, "the source in force, the trigger date, the due date stated");
});

test("R5: an uncertain due date: between the candidates the item reads possibly overdue: undetermined, because …; after the latest, overdue, a fresh item keyed by its state; before the first, nothing (K1444 (i), K1676)", () => {
  const { w, read } = setup();
  const a = w.declare({ trigger: { kind: "date", date: "2026-01-31" }, time: { basis: "rule", rule: "monthly_report", applies_to: "claim" } });
  assert.deepEqual(ofKind(read("bob", { now: "2026-02-28T16:00:00Z" }), KIND), []);
  const between = ofKind(read("bob", { now: "2026-03-01T16:00:00Z" }), KIND);
  assert.equal(between.length, 1);
  assert.match(between[0].detail, /^possibly overdue: undetermined, because/);
  assert.equal(between[0].subject.state, "possibly overdue");
  assert.equal(between[0].due, "2026-03-01", "a body's due: the latest candidate");
  assert.deepEqual(between[0].subject.due.candidates.map((c) => c.value), ["2026-02-28", "2026-03-01"]);
  const after = ofKind(read("bob", { now: "2026-03-02T16:00:00Z" }), KIND);
  assert.equal(after.length, 1);
  assert.match(between[0].id, /::undetermined$/);
  assert.equal(after[0].id, between[0].id.replace(/::undetermined$/, "::overdue"), "a change of state raises a fresh item (K1676)");
  assert.deepEqual(ofKind(read("bob", { now: "2026-03-09T16:00:00Z" }), KIND).map((i) => i.id), [after[0].id], "raised once per occurrence and state");
  assert.equal(after[0].subject.state, "overdue");
  assert.ok(a.ok);
});

test("R5: it leaves when the occurrence is met or met late, or no longer overdue", () => {
  const { w, read } = setup();
  const a = w.declare({ trigger: { kind: "event", event_kind: "communication", entity: E.clerk } });
  const req = w.event({ value: day("2026-02-02"), concerns: [E.clerk] });
  const resp = w.event({ value: day("2026-02-20"), concerns: [E.group] });
  assert.ok(req);
  const at = "2026-03-03T12:00:00Z";      /* after the fixture clock the match is recorded at */
  const items = ofKind(read("bob", { now: at }), KIND);
  assert.equal(items.length, 1);
  w.duties.matchEvent({ dutyId: a.duty_id, occurrenceKey: items[0].subject.occurrence, eventId: resp, reason: "the late response", by: BOB });
  assert.deepEqual(ofKind(read("bob", { now: at }), KIND), [], "met late: it leaves");
});

test("R5: an occurrence of the group's own checkpoint is never an item (D234; action-plans R23)", () => {
  const { w, read } = setup();
  w.duties.registerTriggerSource("action-plans", () => [{ ref: "PLN-1#checkpoint", date: "2026-02-02", group_checkpoint: true },
                                                           { ref: "ACT-2026-0001-req", date: "2026-02-02" }]);
  w.declare({ trigger: { kind: "source", source: "action-plans" } });
  const items = ofKind(read("bob", { now: "2026-03-01T12:00:00Z" }), KIND);
  assert.deepEqual(items.map((i) => i.basis.trigger.ref), ["ACT-2026-0001-req"]);
  /* and a provider that answered one anyway is refused here as well */
  const n = fresh(w.host, { membership: w.membership, duties: { ...w.duties,
    dutiesOf: (a) => w.duties.dutiesOf(a),
    occurrencesOf: (a) => { const o = w.duties.occurrencesOf(a); return { ...o, occurrences: o.occurrences.map((x) => ({ ...x, trigger: { ...x.trigger, group_checkpoint: true } })) }; } } });
  assert.deepEqual(ofKind(reader(n).read("bob", { now: "2026-03-01T12:00:00Z" }), KIND), []);
});

test("R5: recipients: the adopting member, else the duty's project's owners, else the administrators; nobody else", () => {
  const { w } = setup();
  const duty = (by, project) => ({ duty_id: "DUT-2026-0042", project, adoption: { by }, performance: { act: "post the minutes" } });
  const occ = { key: "OCC-1", trigger: { kind: "date", ref: "2026-02-02" }, due: { date: day("2026-02-12"), basis_kind: "rule" },
                state: "overdue", why: "the due date has passed", evidence: [], question: "Was it done by 2026-02-12?" };
  const membership = { participation: () => null, projectOwners: (p) => (p === "PROJ-2026-0001-own" ? ["member:olga"] : []),
                       activeAdmins: () => ["ada"] };
  const make = (d) => fresh(w.host, { membership, duties: { dutiesOf: () => ({ ok: true, duties: [d], truncated: false }),
                                                           occurrencesOf: () => ({ ok: true, occurrences: [occ] }) } });
  w.st.sql.exec(`INSERT INTO duties (duty_id, modality, obligor, version, adopted_by, adopted_at, clause) VALUES ('DUT-2026-0042','duty','ENT-x',1,'class:ai','2026-02-01T00:00:00Z','c')`);
  const who = (d) => ["olga", "ada", "bob", "zed"].filter((m) => ofKind(reader(make(d)).read(m, { now: "2026-03-01T12:00:00Z" }), KIND).length);
  assert.deepEqual(who(duty("member:zed", "PROJ-2026-0001-own")), ["zed"]);
  assert.deepEqual(who(duty("class:ai", "PROJ-2026-0001-own")), ["olga"]);
  assert.deepEqual(who(duty("class:ai", null)), ["ada"]);
});
