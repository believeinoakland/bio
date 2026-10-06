/* duties: occurrences derived on read (R9–R12) and their trigger sources (R16). */
import test from "node:test";
import assert from "node:assert/strict";
import { world, E, BOB, CAROL, MACHINE, evt, ZONE } from "./fixture.mjs";
import { DUTIES_CHECKS, Duties, NEVER_SAID, LEVEL_SEARCHED } from "../../../src/duties/index.mjs";
import { OBSERVATION_LEVELS } from "../../../src/observation-log/index.mjs";

const row = (r, code) => {
  assert.equal(r.ok, false, `${code}: ${JSON.stringify(r).slice(0, 300)}`);
  assert.equal(r.reason, code);
  if (DUTIES_CHECKS[code]) assert.equal(r.check, DUTIES_CHECKS[code].check);
};
const day = (value) => ({ value, precision: "day", zone: ZONE });
const AS_OF = "2026-03-09T12:00:00Z";

/* A records-response duty triggered by each request (a `communication` concerning the clerk), over real events: the
   requests, the responses and an event dated only to its month. `X` maps each name to its real event id. */
let X = {};
function requests(w) {
  const day = (v) => ({ value: v, precision: "day", zone: ZONE });
  X = {
    req1: w.event({ value: day("2026-02-02"), concerns: [E.clerk] }),
    req2: w.event({ value: day("2026-02-16"), concerns: [E.clerk] }),
    req3: w.event({ value: day("2026-03-02"), concerns: [E.clerk] }),
    resp1: w.event({ value: day("2026-02-10"), concerns: [E.group] }),
    resp2: w.event({ value: day("2026-02-27"), concerns: [E.group] }),
    band: w.event({ value: { value: "2026-02", precision: "edtf", zone: ZONE }, concerns: [E.group] }),
  };
  const a = w.declare({ trigger: { kind: "event", event_kind: "communication", entity: E.clerk },
                        exceptions: [{ statement: "a request for exempt records", citation: "s7927" }] });
  return a.duty_id;
}
const occ = (w, id, asOf = AS_OF, from = "2026-01-01", to = "2026-03-31") =>
  w.duties.occurrencesOf({ dutyId: id, asOf, from, to, viewer: BOB });
const byRef = (o) => Object.fromEntries(o.occurrences.map((x) => [x.trigger.ref, x]));

test("R9 each occurrence: a deterministic key, its trigger dated by the event (never a capture), its due date by civil-time with basis and trace; asOf required", () => {
  const w = world();
  const id = requests(w);
  row(w.duties.occurrencesOf({ dutyId: id, from: "2026-01-01", to: "2026-03-31", viewer: BOB }), "NO_AS_OF");
  row(w.duties.occurrencesOf({ dutyId: id, asOf: "2026-03-09", viewer: BOB }), "NO_AS_OF");
  row(w.duties.occurrencesOf({ dutyId: "", asOf: AS_OF, viewer: BOB }), "NO_DUTY");
  row(w.duties.occurrencesOf({ dutyId: "DUT-2026-0099", asOf: AS_OF, viewer: BOB }), "NO_SUCH_DUTY");
  const o = occ(w, id);
  const r = byRef(o);
  assert.deepEqual(Object.keys(r).sort(), [X.req1, X.req2, X.req3].sort());
  assert.equal(r[X.req1].key, Duties.occurrenceKey(id, 1, "event", X.req1));
  assert.equal(occ(w, id).occurrences[0].key, o.occurrences[0].key, "the same key on every read");
  assert.match(r[X.req1].key, /^OCC-[0-9a-f]{32}$/);
  assert.deepEqual(r[X.req1].trigger.date, day("2026-02-02"), "the event's own date");
  assert.deepEqual(r[X.req1].due.date, day("2026-02-12"));
  assert.equal(r[X.req1].due.basis_kind, "rule");
  assert.equal(r[X.req1].due.trace.citation, "Test Code §7922");
  /* the roll: 2026-03-02 + 10 = 03-12 (a Thursday); 02-16 + 10 = 02-26 */
  assert.deepEqual(r[X.req3].due.date, day("2026-03-12"));
  /* a recurrence's instances through civil-time's expandRecurrence, each its own key */
  const m = w.declare({ trigger: { kind: "recurrence", rrule: "FREQ=MONTHLY;BYMONTHDAY=15", dtstart: "2026-01-15" }, time: { basis: "commitment" } });
  const mo = occ(w, m.duty_id);
  assert.deepEqual(mo.occurrences.map((x) => x.trigger.ref), ["2026-01-15", "2026-02-15", "2026-03-15"]);
  assert.equal(new Set(mo.occurrences.map((x) => x.key)).size, 3);
  /* a revision is a new version: the keys follow it */
  w.duties.revise({ dutyId: m.duty_id, performance: { act: "post the report" }, reason: "reworded", by: BOB });
  assert.notEqual(occ(w, m.duty_id).occurrences[0].key, mo.occurrences[0].key);
  /* only the trigger's entity and kind: a communication concerning another entity, or a vote, starts nothing */
  w.event({ value: day("2026-02-05"), concerns: [E.council] });
  w.event({ kind: "vote", value: day("2026-02-06"), concerns: [E.clerk] });
  assert.equal(occ(w, id).occurrences.length, 3);
});

test("R10 the states: met, met_late, discharged, pending, overdue and undetermined, each with why", () => {
  const w = world();
  const id = requests(w);
  const before = byRef(occ(w, id));
  w.duties.matchEvent({ dutyId: id, occurrenceKey: before[X.req1].key, eventId: X.resp1, reason: "the response", by: BOB });
  w.duties.matchEvent({ dutyId: id, occurrenceKey: before[X.req2].key, eventId: X.resp2, reason: "the late response", by: BOB });
  w.duties.matchEvent({ dutyId: id, occurrenceKey: before[X.req3].key, exception: 0, reason: "the records asked are exempt", by: BOB });
  const r = byRef(occ(w, id));
  assert.equal(r[X.req1].state, "met");
  assert.equal(r[X.req2].state, "met_late");
  assert.equal(r[X.req3].state, "discharged");
  /* a trigger with no date (a source item the record places nowhere) leaves its occurrence undetermined */
  w.duties.registerTriggerSource("actions", () => [{ ref: "ACT-2026-0009-undated" }]);
  const nowhere = w.declare({ trigger: { kind: "source", source: "actions" } });
  const u = occ(w, nowhere.duty_id).occurrences[0];
  assert.equal(u.state, "undetermined");
  assert.match(u.why, /placed nowhere/);
  for (const o of Object.values(r)) assert.ok(typeof o.why === "string" && o.why.length > 10, o.state);
  /* pending and overdue, on the day asked */
  const fresh = world();
  const fid = requests(fresh);
  const early = byRef(occ(fresh, fid, "2026-02-11T12:00:00Z"));
  assert.equal(early[X.req1].state, "pending");
  const late = byRef(occ(fresh, fid, "2026-02-13T12:00:00Z"));
  assert.equal(late[X.req1].state, "overdue");
  /* on the due day's local evening the occurrence is still due that day (local day, not UTC) */
  assert.equal(byRef(occ(fresh, fid, "2026-02-13T02:00:00Z"))[X.req1].state, "pending", "22:00 on the 12th in Halifax");
  /* a match whose date straddles the due date at its precision is undetermined */
  fresh.duties.matchEvent({ dutyId: fid, occurrenceKey: early[X.req1].key, eventId: X.band, reason: "a response dated only February", by: BOB });
  const band = byRef(occ(fresh, fid))[X.req1];
  assert.equal(band.state, "undetermined");
  assert.match(band.why, /not settled/);
});

test("R10 an uncertain due date: a body is overdue only after the latest candidate, possibly overdue between (K1444 (i))", () => {
  const w = world();
  const a = w.declare({ trigger: { kind: "date", date: "2026-01-31" }, time: { basis: "rule", rule: "monthly_report", applies_to: "claim" } });
  const at = (asOf) => occ(w, a.duty_id, asOf).occurrences[0];
  const o = at("2026-03-01T16:00:00Z");
  assert.deepEqual(o.due.date.candidates.map((c) => c.value), ["2026-02-28", "2026-03-01"]);
  assert.equal(o.state, "undetermined");
  assert.match(o.why, /^possibly overdue: undetermined, because/);
  assert.equal(at("2026-02-28T16:00:00Z").state, "pending");
  assert.equal(at("2026-03-02T16:00:00Z").state, "overdue");
});

test("R10 a missed dependency date is a fact about sequence, never a legal deadline; a missing rule leaves the due undetermined", () => {
  const w = world();
  w.event({ kind: "vote", value: day("2026-03-10"), concerns: [E.council] });
  const dep = w.declare({ obligor: E.council, source: { kind: "dependency", why: "the report must precede the vote" },
                          trigger: { kind: "event", event_kind: "vote", entity: E.council },
                          time: { basis: "dependency", lead: 3, why: "published three days before the vote" } });
  const o = occ(w, dep.duty_id).occurrences[0];
  assert.deepEqual(o.due.date, day("2026-03-07"));
  assert.equal(o.due.law_set, false);
  assert.equal(o.state, "overdue");
  assert.match(o.question, /^A fact about sequence/);
  assert.match(o.question, /not a deadline the law sets/);
  assert.equal(o.derivation.law_set, false);
  const nr = w.declare({ time: { basis: "rule", rule: "no_such_rule" } });
  const u = occ(w, nr.duty_id).occurrences[0];
  assert.equal(u.state, "undetermined");
  assert.match(u.why, /hold no rule no_such_rule/);
});

test("R11 overdue is answered as a question with its derivation; met with the same derivation; never as a violation", () => {
  const w = world();
  const id = requests(w);
  const keys = byRef(occ(w, id));
  w.duties.matchEvent({ dutyId: id, occurrenceKey: keys[X.req1].key, eventId: X.resp1, reason: "the response", by: BOB });
  const r = byRef(occ(w, id));
  const over = r[X.req3];
  assert.equal(r[X.req2].state, "overdue");
  for (const o of [r[X.req1], r[X.req2]]) {
    assert.deepEqual(Object.keys(o.derivation).sort(), ["basis_kind", "due_date", "law_set", "level_says", "level_searched", "source_in_force", "trigger_date"]);
    assert.equal(o.derivation.level_searched, LEVEL_SEARCHED);
    assert.ok(LEVEL_SEARCHED in OBSERVATION_LEVELS, "a level of observation-log's vocabulary");
    assert.equal(o.derivation.source_in_force.state, "in_force");
    assert.deepEqual(o.derivation.trigger_date, o.trigger.date);
  }
  assert.match(r[X.req2].question, /^Was "respond to the records request" done by 2026-02-26\?/);
  assert.match(r[X.req2].question, /a question, not a finding/);
  assert.equal(r[X.req1].question, undefined);
  assert.equal(over.state, "pending");
  const text = JSON.stringify(occ(w, id)).toLowerCase();
  for (const word of NEVER_SAID) assert.ok(!text.includes(word), word);
});

test("R12 matchEvent is a member's act, recorded with who, when and why, and correctable by a later act that keeps the earlier", () => {
  const w = world();
  const id = requests(w);
  const k = byRef(occ(w, id))[X.req1].key;
  const m = (over) => w.duties.matchEvent({ dutyId: id, occurrenceKey: k, eventId: X.resp1, reason: "the response", by: BOB, ...over });
  row(m({ by: MACHINE }), "MEMBER_ACT_ONLY");
  row(m({ reason: "" }), "NO_REASON");
  row(m({ dutyId: "DUT-2026-0077" }), "NO_SUCH_DUTY");
  row(m({ eventId: evt("nothing") }), "NO_SUCH_EVENT");
  row(m({ occurrenceKey: "OCC-0000" }), "NO_SUCH_OCCURRENCE");
  row(m({ exception: 5, eventId: null }), "NO_SUCH_EVENT");
  assert.equal(w.sqlRows(`SELECT COUNT(*) AS n FROM duty_matches`)[0].n, 0, "refusals write nothing");
  w.at("2026-03-03T12:00:00.000Z");
  const first = m({ eventId: X.resp2, reason: "the first reading" });
  assert.deepEqual(first, { ok: true, duty_id: id, occurrence_key: k, event_id: X.resp2, exception: null, by: BOB,
                            at: "2026-03-03T12:00:00Z", reason: "the first reading" });
  assert.equal(byRef(occ(w, id))[X.req1].state, "met_late");
  w.at("2026-03-04T12:00:00.000Z");
  m({ by: CAROL, reason: "the earlier letter is the response" });
  const now = byRef(occ(w, id))[X.req1];
  assert.equal(now.state, "met");
  assert.equal(now.evidence[0].by, CAROL);
  assert.equal(now.evidence[0].corrects.length, 1, "the earlier act is kept and named");
  assert.equal(w.sqlRows(`SELECT COUNT(*) AS n FROM duty_matches`)[0].n, 2);
  /* as known on an earlier day, the earlier act governs, and before any act none does */
  assert.equal(byRef(occ(w, id, "2026-03-03T18:00:00Z"))[X.req1].state, "met_late");
  assert.equal(byRef(occ(w, id, "2026-03-02T18:00:00Z"))[X.req1].state, "overdue");
});

test("R12 registerOccurrenceEvidence: once per module; measured evidence read as a match and cited as such", () => {
  const w = world();
  const id = requests(w);
  assert.equal(w.duties.registerOccurrenceEvidence("", () => []).reason, "LISTENER_MALFORMED");
  assert.equal(w.duties.registerOccurrenceEvidence("calculations", "nope").reason, "LISTENER_MALFORMED");
  const seen = [];
  assert.equal(w.duties.registerOccurrenceEvidence("calculations", ({ duty, occurrence }) => {
    seen.push([duty.duty_id, occurrence.key]);
    return occurrence.trigger.ref === X.req2 ? [{ evidence: "CALC-2026-0001", when: "2026-02-20" }] : [];
  }).ok, true);
  assert.equal(w.duties.registerOccurrenceEvidence("calculations", () => []).reason, "LISTENER_DECLARED");
  w.duties.registerOccurrenceEvidence("workbooks", () => { throw new Error("no workbook"); });
  const r = byRef(occ(w, id));
  assert.equal(r[X.req2].state, "met");
  assert.deepEqual(r[X.req2].evidence[0], { kind: "measured", source: "calculations", evidence: "CALC-2026-0001", when: day("2026-02-20"),
                                                 says: "measured evidence, cited as such" });
  assert.ok(r[X.req1].evidence.some((e) => e.source === "workbooks" && /no workbook/.test(e.error)));
  assert.equal(r[X.req1].state, "overdue", "a source that throws is not a match");
  assert.ok(seen.length >= 3);
});

test("R16 registerTriggerSource: once per module; its items trigger occurrences; one that throws is answered beside them", () => {
  const w = world();
  assert.equal(w.duties.registerTriggerSource(null, () => []).reason, "LISTENER_MALFORMED");
  assert.equal(w.duties.registerTriggerSource("actions", ({ from, to }) => [{ ref: "ACT-2026-0001-req", date: "2026-02-02", from, to }]).ok, true);
  assert.equal(w.duties.registerTriggerSource("actions", () => []).reason, "LISTENER_DECLARED");
  w.duties.registerTriggerSource("filings", () => { throw new Error("filings unreadable"); });
  const a = w.declare({ trigger: { kind: "source", source: "actions" } });
  const b = w.declare({ trigger: { kind: "source", source: "filings" } });
  const c = w.declare({ trigger: { kind: "source", source: "escalation" } });
  const oa = occ(w, a.duty_id);
  assert.deepEqual(oa.occurrences.map((o) => [o.trigger.ref, o.due.date.value, o.state]), [["ACT-2026-0001-req", "2026-02-12", "overdue"]]);
  const ob = occ(w, b.duty_id);
  assert.deepEqual(ob.occurrences, []);
  assert.deepEqual(ob.source_errors, [{ source: "filings", error: "filings unreadable" }]);
  assert.deepEqual(occ(w, c.duty_id).source_errors, [{ source: "escalation", error: "no module has registered this trigger source" }]);
});
