/* duties, T48 (T48-22; R33; N1044, K3150): every occurrence `occurrencesOf` answers carries, beside `why`, a
   member-facing `reason`: null unless it is undetermined (the "possibly overdue" band among them), and then
   `{code, says}`, `code` one of the frozen `OCCURRENCE_REASONS`, `says` the words of `duty.reason.<code>` read by key,
   naming no ISO date, no zone id and no ruling or requirement number. Each undetermined path of R10 answers its one
   code, over the real modules on the fictional profile; control: every settled state answers `reason: null` and its
   `why` unchanged. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { world, fictionalView, E, BOB, ZONE } from "./fixture.mjs";
import { OCCURRENCE_REASONS, DUTIES_REASON_WORDS, NEVER_SAID } from "../../../src/duties/index.mjs";
import { OCCURRENCE_REASONS as VOCAB_REASONS } from "../../../src/duties/vocab.mjs";

const WORDS = JSON.parse(await readFile(new URL("../../../../docs/development/ux-substrate/screens/words.json",
  import.meta.url), "utf8")).words;
const day = (value) => ({ value, precision: "day", zone: ZONE });
const AS_OF = "2026-03-09T12:00:00Z";
const occ = (w, id, asOf = AS_OF) => w.duties.occurrencesOf({ dutyId: id, asOf, from: "2026-01-01", to: "2029-12-31", viewer: BOB });
const one = (w, id, asOf) => { const o = occ(w, id, asOf); assert.equal(o.ok, true, JSON.stringify(o).slice(0, 300)); return o.occurrences[0]; };

/* R33's bar for `says`: no ISO date, no zone id (an IANA area/location, or UTC/GMT), no ruling or requirement number. */
function plain(says, what) {
  assert.equal(typeof says, "string", what);
  assert.ok(says.length > 10, what);
  assert.doesNotMatch(says, /\d{4}-\d{2}-\d{2}/, `${what}: an ISO date`);
  assert.doesNotMatch(says, /\b[A-Za-z_]+\/[A-Za-z_]+\b|\bUTC\b|\bGMT\b/, `${what}: a zone id`);
  assert.doesNotMatch(says, /\bK\d+|\bR\d+/, `${what}: a ruling or requirement number`);
  assert.ok(!says.includes(ZONE), `${what}: the profile's zone`);
  for (const word of NEVER_SAID) assert.ok(!says.toLowerCase().includes(word), `${what}: ${word}`);
}
function undetermined(o, code, what) {
  assert.equal(o.state, "undetermined", `${what}: ${o.state} (${o.why})`);
  assert.ok(typeof o.why === "string" && o.why.length > 10, `${what}: why kept`);
  assert.deepEqual(Object.keys(o.reason).sort(), ["code", "says"], what);
  assert.equal(o.reason.code, code, `${what}: ${o.why}`);
  assert.equal(o.reason.says, DUTIES_REASON_WORDS[`duty.reason.${code}`], `${what}: read by key`);
  plain(o.reason.says, what);
}
/* A source-triggered duty's world: `items` the source's items. */
function sourced(items, over = {}) {
  const w = world(over);
  w.duties.registerTriggerSource("actions", () => items);
  return { w, id: w.declare({ trigger: { kind: "source", source: "actions" } }).duty_id };
}

test("R33 OCCURRENCE_REASONS is exported frozen, one object from vocab.mjs and index.mjs; each code's words read by key, duty.reason.<code>, plain words", () => {
  assert.ok(Object.isFrozen(OCCURRENCE_REASONS));
  assert.equal(OCCURRENCE_REASONS, VOCAB_REASONS);
  assert.deepEqual([...OCCURRENCE_REASONS], ["trigger_undated", "deadline_not_held", "due_not_computed", "due_between_days",
                                             "match_undated", "order_unsettled"]);
  assert.ok(Object.isFrozen(DUTIES_REASON_WORDS));
  assert.deepEqual(Object.keys(DUTIES_REASON_WORDS).sort(), OCCURRENCE_REASONS.map((c) => `duty.reason.${c}`).sort());
  for (const [key, says] of Object.entries(DUTIES_REASON_WORDS)) {
    plain(says, key);
    /* the file's word, verbatim, once the design stream gives it; until then this module's interim word, in DEC-149's
       form ("your group's Civicsmith", never "copy", "instance", "plane" or "server") */
    const file = WORDS.find((x) => x.key === key);
    if (file) assert.equal(says, file.en, `${key}: the file's word`);
    assert.doesNotMatch(says, /\b(copy|instance|plane|server)\b/i, key);
    if (/Civicsmith/.test(says)) assert.match(says, /your group's Civicsmith/i, key);
  }
});

test("R33 trigger_undated: a trigger placed nowhere, and one whose date is undetermined", () => {
  const a = sourced([{ ref: "ACT-2026-0001-undated" }]);
  undetermined(one(a.w, a.id), "trigger_undated", "placed nowhere");
  const b = sourced([{ ref: "ACT-2026-0002-unreadable", date: "2026-13-45" }]);
  undetermined(one(b.w, b.id), "trigger_undated", "an unreadable date");
});

test("R33 deadline_not_held: a rule basis the active profiles hold no rule for; a required response with no deadline owed; an event matched against it takes the due's code", () => {
  const w = world();
  const nr = w.declare({ time: { basis: "rule", rule: "no_such_rule" } }).duty_id;
  const o = one(w, nr);
  undetermined(o, "deadline_not_held", "no such rule");
  const resp = w.event({ value: day("2026-02-05"), concerns: [E.group] });
  w.duties.matchEvent({ dutyId: nr, occurrenceKey: o.key, eventId: resp, reason: "the response", by: BOB });
  undetermined(one(w, nr), "deadline_not_held", "matched, the due undetermined");
  const rt = w.declare({ time: { basis: "rule", response_to: { standard: w.recordsLaw, issuer: ["Grand Jury"] } } }).duty_id;
  undetermined(one(w, rt), "deadline_not_held", "no deadline owed the issuer");
});

test("R33 due_not_computed: civil-time cannot compute the due (a year its closure list does not cover); several deadlines owed and none named", () => {
  const w = world();
  const far = w.declare({ trigger: { kind: "date", date: "2028-02-02" } }).duty_id;
  undetermined(one(w, far, "2028-03-09T12:00:00Z"), "due_not_computed", "calendar uncovered");
  const owed = (rule) => ({ rule, applies_to: "report", units: "days", amount: 90, count: "calendar", starts: "received", owed_by: "body",
                            starter: { body: "Grand Jury" }, citation: "Test Penal Code §933", status: "researched", basis: "TEST" });
  const base = fictionalView();
  w.setView({ ...base, deadlines: [...base.deadlines, owed("gj_response_a"), owed("gj_response_b")] });
  const rt = w.declare({ time: { basis: "rule", response_to: { standard: w.recordsLaw, issuer: ["Grand Jury"] } } }).duty_id;
  const o = one(w, rt);
  assert.match(o.why, /hold 2 deadlines/);
  undetermined(o, "due_not_computed", "several deadlines");
});

test("R33 due_between_days: the possibly-overdue band between candidate days, unmatched and matched", () => {
  const w = world();
  const id = w.declare({ trigger: { kind: "date", date: "2026-01-31" }, time: { basis: "rule", rule: "monthly_report", applies_to: "claim" } }).duty_id;
  const o = one(w, id, "2026-03-01T16:00:00Z");
  assert.match(o.why, /^possibly overdue: undetermined, because/, "why unchanged");
  undetermined(o, "due_between_days", "unmatched, between the candidates");
  const ev = w.event({ value: day("2026-03-01"), concerns: [E.group] });
  w.duties.matchEvent({ dutyId: id, occurrenceKey: o.key, eventId: ev, reason: "the report", by: BOB });
  undetermined(one(w, id), "due_between_days", "matched on the later candidate");
});

test("R33 match_undated: the matched event is placed nowhere", () => {
  const w = world();
  const id = w.declare().duty_id;
  const o = one(w, id);
  const nowhere = w.event({ value: null, concerns: [E.group] });
  w.duties.matchEvent({ dutyId: id, occurrenceKey: o.key, eventId: nowhere, reason: "an undated response", by: BOB });
  const m = one(w, id);
  assert.match(m.why, /placed nowhere/);
  undetermined(m, "match_undated", "placed nowhere");
});

test("R33 order_unsettled: the match's precision does not settle whether it fell on or before the due date", () => {
  const w = world();
  const id = w.declare().duty_id;
  const o = one(w, id);
  const band = w.event({ value: { value: "2026-02", precision: "edtf", zone: ZONE }, concerns: [E.group] });
  w.duties.matchEvent({ dutyId: id, occurrenceKey: o.key, eventId: band, reason: "a response dated only February", by: BOB });
  const m = one(w, id);
  assert.match(m.why, /not settled/);
  undetermined(m, "order_unsettled", "a month's precision");
});

test("R33 control: met, met_late, discharged, pending and overdue answer reason null, their why unchanged; the route answers the same", () => {
  const w = world();
  const mk = () => w.declare({ exceptions: [{ statement: "a request for exempt records", citation: "s7927" }] }).duty_id;
  const [met, late, dis, pend] = [mk(), mk(), mk(), mk()];
  const ev = (v) => w.event({ value: day(v), concerns: [E.group] });
  const match = (id, over) => w.duties.matchEvent({ dutyId: id, occurrenceKey: one(w, id).key, reason: "the response", by: BOB, ...over });
  match(met, { eventId: ev("2026-02-10") });
  match(late, { eventId: ev("2026-02-20") });
  match(dis, { exception: 0 });
  const want = {
    met: [met, AS_OF, "the matching event falls on or before the due date"],
    met_late: [late, AS_OF, "the matching event falls after the due date"],
    discharged: [dis, AS_OF, null],
    pending: [pend, "2026-02-11T12:00:00Z", "the due date has not passed and no matching event is held"],
    overdue: [pend, AS_OF, "the due date has passed and no matching event is held, as known on the day asked"],
  };
  for (const [state, [id, asOf, why]] of Object.entries(want)) {
    const o = one(w, id, asOf);
    assert.equal(o.state, state);
    assert.equal(o.reason, null, state);
    if (why) assert.equal(o.why, why, state);
    else assert.match(o.why, /^a held exception applies, as member:bob recorded on/);
  }
  const r = w.ops(`id=${met}&as_of=${AS_OF}&from=2026-01-01&to=2026-03-31&viewer=${BOB}`).dutyoccurrences();
  assert.equal(r.occurrences[0].reason, null);
  const u = w.declare({ time: { basis: "rule", rule: "no_such_rule" } }).duty_id;
  assert.deepEqual(w.ops(`id=${u}&as_of=${AS_OF}&viewer=${BOB}`).dutyoccurrences().occurrences[0].reason,
                   { code: "deadline_not_held", says: DUTIES_REASON_WORDS["duty.reason.deadline_not_held"] });
});

test("R33 (K3243) each remaining path explicitly: a due civil-time cannot settle against asOf without candidates; a match with an open end; measured evidence against an undetermined due", () => {
  const w = world();
  /* a commitment due held open-ended: whether asOf is past it is not settled, and it has no candidates */
  const open = w.declare({ time: { basis: "commitment", date: { value: "2026-03/..", precision: "edtf", zone: ZONE } } }).duty_id;
  const o = one(w, open);
  assert.equal(o.due.date.candidates, undefined);
  undetermined(o, "due_between_days", "an open-ended due, unmatched");
  /* a match whose date has an open end, either way */
  for (const value of ["2026-02-10/..", "../2026-02-10"]) {
    const id = w.declare().duty_id;
    const ev = w.event({ value: { value, precision: "edtf", zone: ZONE }, concerns: [E.group] });
    w.duties.matchEvent({ dutyId: id, occurrenceKey: one(w, id).key, eventId: ev, reason: "an open-ended response", by: BOB });
    const m = one(w, id);
    assert.match(m.why, /open end/);
    undetermined(m, "match_undated", value);
  }
  /* measured evidence (R12) against an undetermined due passes the due's own code; against a settled due, its state */
  w.duties.registerOccurrenceEvidence("calculations", () => [{ evidence: "CALC-2026-0001", when: "2026-02-05" }]);
  const nr = w.declare({ time: { basis: "rule", rule: "no_such_rule" } }).duty_id;
  const n = one(w, nr);
  assert.match(n.why, /^measured evidence is held, and the due date is undetermined/);
  undetermined(n, "deadline_not_held", "measured, the due undetermined");
  const far = w.declare({ trigger: { kind: "date", date: "2028-02-02" } }).duty_id;
  undetermined(one(w, far, "2028-03-09T12:00:00Z"), "due_not_computed", "measured, the due not computed");
  const met = one(w, w.declare().duty_id);
  assert.equal(met.state, "met");
  assert.equal(met.reason, null);
});
