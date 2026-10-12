/* R5: duty occurrences come due, over the real `duties` (its R7–R11) and `civil-time`, on duties' own test world (a
   fictional profile in America/Halifax: a records-response rule of 10 days, rolled on court days, and a monthly rule). */
import test from "node:test";
import assert from "node:assert/strict";
import { world, E, BOB, ZONE } from "../duties/fixture.mjs";
import { producers, fresh, reader, ofKind, sentences, JUDGMENT, notHintFailures } from "./fixture.mjs";
import { HINT_MARK } from "../../../src/notice-producers/index.mjs";

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

test("R5: its age runs from the start of the due day in the due's own zone, never the UTC midnight (K1444 (iii), K1688)", () => {
  const { w, read } = setup();
  w.declare();                                               /* due 2026-02-12 in America/Halifax (UTC-4 in February) */
  const it = ofKind(read("bob", { now: "2026-02-13T04:00:00Z" }), KIND)[0];
  assert.deepEqual(it.age, { state: "determined", since: "2026-02-12", ms: 86_400_000 }, "from 04:00Z, Halifax's midnight");
});

test("R11: a duty's item, overdue or possibly overdue, is no hint: it carries no \"Hint · machine work\" mark and never calls itself a hint or a signal", () => {
  const { w, read } = setup();
  w.declare();
  const overdue = ofKind(read("bob", { now: "2026-02-20T12:00:00Z" }), KIND);
  assert.equal(overdue.length, 1);
  const u = setup();
  u.w.declare({ trigger: { kind: "date", date: "2026-01-31" }, time: { basis: "rule", rule: "monthly_report", applies_to: "claim" } });
  const between = ofKind(u.read("bob", { now: "2026-03-01T16:00:00Z" }), KIND);
  assert.equal(between.length, 1);
  for (const it of [...overdue, ...between]) assert.deepEqual(notHintFailures(it, HINT_MARK), [], it.id);
});

/* R5 (T45; N855; Actions D6d; v0.2 rule 17; following R25): a duty is told only up to the day `following.dutyWatchEnd`
   answers for it (a plan's watch kept until, or stopped on, that day); null is R5 as before. `following` is a stand-in in
   its R25 shape: the end day per duty, every duty it is asked about recorded. */
function watched(ends = {}) {
  const w = world();
  const asked = [];
  const following = { policyChanges: () => ({ ok: true, changes: [], cursor: null }),
                      dutyWatchEnd: (duty) => { asked.push(duty); return Object.prototype.hasOwnProperty.call(ends, duty) ? ends[duty] : null; } };
  const read = (n) => (member, opts) => ofKind(reader(n).read(member, opts), KIND);
  return { w, asked, ends, items: read(fresh(w.host, { membership: w.membership, duties: w.duties, following })),
           plain: read(fresh(w.host, { membership: w.membership, duties: w.duties })) };
}

test("R5 (T45): a duty stopped today raises no item for an occurrence due tomorrow; control: the same duty with no link (dutyWatchEnd null) raises it; the duty stays held and its occurrence readable", () => {
  const { w, asked, ends, items, plain } = watched();
  const a = w.declare();                                     /* due 2026-02-12 */
  const at = "2026-02-20T12:00:00Z";
  const control = plain("bob", { now: at });
  assert.equal(control.length, 1, "control: no link, told as before");
  assert.equal(control[0].due, "2026-02-12");
  assert.deepEqual(items("bob", { now: at }).map((i) => i.id), control.map((i) => i.id), "control: dutyWatchEnd answering null is R5 as before");
  assert.ok(asked.includes(a.duty_id), "the end is read through following.dutyWatchEnd(duty)");
  ends[a.duty_id] = "2026-02-11";                            /* stopped on the 11th: the occurrence falls due the day after */
  assert.deepEqual(items("bob", { now: at }), [], "stopped: no item for an occurrence due after the end day");
  const occ = w.duties.occurrencesOf({ dutyId: a.duty_id, asOf: "2026-02-20T12:00:00Z", viewer: BOB });
  assert.equal(occ.ok, true);
  assert.equal(occ.occurrences.length, 1, "the duty stays held and its occurrence readable (duties R10): only the telling stops");
  ends[a.duty_id] = "2026-02-12";                            /* an end on the due day itself: the occurrence is not after it */
  assert.deepEqual(items("bob", { now: at }).map((i) => i.id), control.map((i) => i.id), "control: due on the end day, still told");
});

test("R5 (T45): a duty kept until a day raises items up to that day and none after; the item already raised for the earlier occurrence is unchanged", () => {
  const { w, ends, items, plain } = watched();
  const a = w.declare({ trigger: { kind: "event", event_kind: "communication", entity: E.clerk } });
  w.event({ value: day("2026-02-02"), concerns: [E.clerk] });
  w.event({ value: day("2026-03-02"), concerns: [E.clerk] });
  const at = "2026-04-01T12:00:00Z";
  const both = plain("bob", { now: at });
  assert.equal(both.length, 2, "control: with no end, both occurrences are told");
  const [first, second] = [...both].sort((x, y) => (x.due < y.due ? -1 : 1));
  assert.ok(first.due < "2026-03-01" && second.due > "2026-03-01", `${first.due}, ${second.due}`);
  ends[a.duty_id] = "2026-03-01";                            /* kept until 1 March */
  const kept = items("bob", { now: at });
  assert.deepEqual(kept, [first], "the earlier occurrence's item, unchanged; none for the one due after the end day");
  ends[a.duty_id] = second.due;
  assert.deepEqual(items("bob", { now: at }).map((i) => i.id).sort(), both.map((i) => i.id).sort(), "control: kept until the later due day, both told");
});

test("R5 (T45): an undetermined due date is compared by its latest candidate: an end between the candidates tells nothing, an end on the latest tells the possibly-overdue item", () => {
  const { w, ends, items } = watched();
  const a = w.declare({ trigger: { kind: "date", date: "2026-01-31" }, time: { basis: "rule", rule: "monthly_report", applies_to: "claim" } });
  const at = "2026-03-01T16:00:00Z";                         /* between the candidates 2026-02-28 and 2026-03-01 */
  ends[a.duty_id] = "2026-02-28";
  assert.deepEqual(items("bob", { now: at }), [], "the latest candidate falls after the end day");
  ends[a.duty_id] = "2026-03-01";
  const told = items("bob", { now: at });
  assert.equal(told.length, 1, "control: the latest candidate on the end day");
  assert.equal(told[0].subject.state, "possibly overdue");
});

test("R5 (T45) R1: a following whose dutyWatchEnd throws contributes no duty item and is named in facts.failed; an answer that is no day is read as no end (the duty still told); the read writes nothing", () => {
  const w = world();
  w.declare();
  const at = Date.parse("2026-02-20T12:00:00Z");
  const run = (dutyWatchEnd) => reader(fresh(w.host, { membership: w.membership, duties: w.duties,
    following: { policyChanges: () => ({ ok: true, changes: [], cursor: null }), dutyWatchEnd } })).read("bob", { now: at });
  const down = run(() => { throw new Error("down"); });
  assert.deepEqual(ofKind(down, KIND), []);
  assert.deepEqual(down.facts.failed, ["following"]);
  for (const odd of [undefined, 42, "", "12 February", "2026-02-11T00:00:00Z", {}]) {
    const r = run(() => odd);
    assert.equal(ofKind(r, KIND).length, 1, JSON.stringify(odd));
    assert.deepEqual(r.facts.failed, [], JSON.stringify(odd));
  }
  const before = w.st.sql.exec(`SELECT COUNT(*) AS n FROM duties`).one().n;
  run(() => "2026-02-11");
  assert.equal(w.st.sql.exec(`SELECT COUNT(*) AS n FROM duties`).one().n, before);
});
