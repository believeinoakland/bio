/* duties: the acts that hold a duty (R1–R6) and the reads of it (R7, R8). */
import test from "node:test";
import assert from "node:assert/strict";
import { world, E, BOB, CAROL, MACHINE, SHA, mny, ent, fictionalView } from "./fixture.mjs";
import { DUTIES_CHECKS, MODALITIES, LIST_MAX } from "../../../src/duties/index.mjs";

const row = (r, code) => {
  assert.equal(r.ok, false, `${code}: ${JSON.stringify(r).slice(0, 300)}`);
  assert.equal(r.reason, code);
  assert.equal(r.code, code);
  if (DUTIES_CHECKS[code]) {
    assert.equal(r.check, DUTIES_CHECKS[code].check);
    assert.equal(r.translation, DUTIES_CHECKS[code].translation);
  }
};
const count = (w) => w.sqlRows(`SELECT COUNT(*) AS n FROM duties`)[0].n + w.sqlRows(`SELECT COUNT(*) AS n FROM duty_proposals`)[0].n;

test("R1 refusals for a duty's fields, in order, each writing nothing, with a passing control for each", () => {
  const w = world();
  const d = (over) => w.duties.declare({ ...w.fields(over), clause: "the clause", by: BOB });
  /* modality first, even over a missing obligor */
  row(d({ modality: "advice", obligor: null }), "UNKNOWN_MODALITY");
  for (const m of MODALITIES) assert.equal(d({ modality: m }).ok, true, m);
  /* obligor */
  row(d({ obligor: null, source: { kind: "nowhere" } }), "NO_OBLIGOR");
  row(d({ obligor: ent(99) }), "NO_SUCH_ENTITY");
  assert.equal(d({ obligor: ent(99) }).entity_id, ent(99));
  row(d({ obligee: ent(98) }), "NO_SUCH_ENTITY");
  row(d({ enforcer: ent(97) }), "NO_SUCH_ENTITY");
  /* a person owes only where a held law or court order binds them by name or role */
  row(d({ obligor: E.filer, source: { kind: "practice", statement: "they usually file" } }), "PERSON_OBLIGOR_NEEDS_LAW");
  row(d({ obligor: E.filer }), "PERSON_OBLIGOR_NEEDS_LAW", "a law cited but naming no name or role it binds");
  assert.equal(d({ obligor: E.filer, source: { ...w.fields().source, binds: "every filer of a statement of interests" } }).ok, true);
  /* an organisation outside government needs a line to a public body, then an enforcer */
  row(d({ obligor: E.private }), "NOT_ACTING_FOR_PUBLIC");
  row(d({ obligor: E.undet }), "NOT_ACTING_FOR_PUBLIC", "a sector never guessed: undetermined is not government");
  row(d({ obligor: E.parcel }), "NOT_ACTING_FOR_PUBLIC");
  w.line({ kind: "contracts_with", from: E.council, to: E.contractor });
  row(d({ obligor: E.contractor }), "NO_ENFORCER");
  assert.equal(d({ obligor: E.contractor, enforcer: E.auditor }).ok, true);
  assert.equal(d({ obligor: E.council }).ok, true, "a government body needs no line");
  /* a withdrawn line does not count */
  w.line({ kind: "acts_for", from: E.private, to: E.council, withdrawn: true });
  row(d({ obligor: E.private, enforcer: E.auditor }), "NOT_ACTING_FOR_PUBLIC");
  /* the source */
  row(d({ source: { kind: "rumour" } }), "UNKNOWN_SOURCE_KIND");
  const law = w.fields().source.standard;
  row(d({ source: { kind: "standard", standard: "STD-2026-0099-none" } }), "NO_SUCH_STANDARD");
  row(d({ source: { kind: "standard", standard: law, portion: "s9999" } }), "NO_PORTION");
  assert.equal(d({ source: { kind: "standard", standard: law, portion: "s7922/a" } }).ok, true);
  const later = w.standard({ period: { from: "2027-01-01", to: "2099-12-31" } });   /* the same section's later version */
  const other = w.standard({ cite: "Test Code § 1", portion: "s1" });
  row(d({ source: { kind: "standard", standard: law, version: other } }), "VERSION_NOT_HELD");
  row(d({ source: { kind: "standard", standard: law, version: "STD-2026-0099-none" } }), "VERSION_NOT_HELD");
  assert.equal(d({ source: { kind: "standard", standard: law, version: later } }).ok, true);
  row(d({ source: { kind: "court", standard: law } }), "UNKNOWN_SOURCE_KIND", "a court source names a court standard");
  const decree = w.standard({ kind: "court", cite: "Decree ¶ 4", portion: null });
  assert.equal(d({ source: { kind: "court", standard: decree } }).ok, true);
  assert.equal(d({ source: { kind: "practice", statement: "posted within a week, measured" } }).ok, true);
  assert.equal(d({ source: { kind: "dependency", why: "the budget must precede its year" } }).ok, true);
  /* the trigger */
  row(d({ trigger: { kind: "whim" } }), "UNKNOWN_TRIGGER");
  row(d({ trigger: { kind: "date", date: "2026-02-31" } }), "UNKNOWN_TRIGGER");
  row(d({ trigger: { kind: "event", event_kind: "communication", entity: ent(96) } }), "NO_SUCH_ENTITY");
  row(d({ trigger: { kind: "recurrence", rrule: "FREQ=DAILY", dtstart: "2026-01-05" } }), "BAD_RECURRENCE");
  row(d({ trigger: { kind: "recurrence", rrule: "FREQ=MONTHLY;BYHOUR=9", dtstart: "2026-01-05" } }), "BAD_RECURRENCE");
  assert.equal(d({ trigger: { kind: "recurrence", rrule: "FREQ=MONTHLY;BYMONTHDAY=15", dtstart: "2026-01-15" } }).ok, true);
  /* the basis kind */
  row(d({ time: { basis: "hunch" } }), "UNKNOWN_BASIS_KIND");
  for (const time of [{ basis: "commitment", date: "2026-04-01" }, { basis: "window" }, { basis: "dependency", lead: 3, why: "before the vote" }])
    assert.equal(d({ time }).ok, true, time.basis);
  /* amounts: never held; a pay duty cites money facts */
  row(d({ performance: { act: "pay the grant", amount: "5000.00" } }), "HOLDS_AMOUNT");
  row(d({ performance: { act: "pay", terms: [{ total: "1" }] } }), "HOLDS_AMOUNT");
  const nope = d({ performance: { act: "pay the grant", money_facts: [mny("nope")] } });
  assert.deepEqual([nope.reason, nope.check], ["NO_SUCH_FACT", undefined], "money's one answer (K1569)");
  assert.equal(nope.fact_id, mny("nope"));
  const grant = w.fact({ amount: "5000.00" });
  assert.equal(d({ performance: { act: "pay the grant", money_facts: [grant] } }).ok, true);
  /* the reported status, from the profile's response vocabulary only */
  const c1 = w.passage().contentId;
  row(d({ reported_status: [{ status: "done", extent: c1 }] }), "UNKNOWN_REPORTED_STATUS");
  assert.equal(d({ reported_status: [{ status: "implemented", extent: c1 }] }).ok, true);
  const bare = world({ view: fictionalView({ response_statuses: undefined }) });
  const bc = bare.passage().contentId;
  const none = bare.duties.declare({ ...bare.fields({ reported_status: [{ status: "implemented", extent: bc }] }), clause: "c", by: BOB });
  row(none, "UNKNOWN_REPORTED_STATUS");
  assert.match(none.detail, /hold no response vocabulary/);
  /* nothing refused was written: count the accepted ones */
  assert.equal(w.sqlRows(`SELECT COUNT(*) AS n FROM duties`)[0].n, 17);
});

test("R2 a proposed duty is stored apart and labelled, never tracked until a member adopts it in one act naming the clause", () => {
  const w = world();
  const p = w.duties.propose({ ...w.fields(), by: MACHINE, why: "computed from the profile rule" });
  assert.equal(p.ok, true);
  assert.deepEqual(p.label, { by: MACHINE, machine_work: true, state: "machine_proposed" });
  assert.equal(p.tracked, false);
  assert.equal(w.sqlRows(`SELECT COUNT(*) AS n FROM duties`)[0].n, 0, "a proposal is not a duty");
  assert.equal(w.duties.dutiesOf({ entity: E.clerk, viewer: BOB }).count, 0);
  assert.equal(w.duties.recordTransitions({ asOf: "2026-03-02T12:00:00Z" }).duties_read, 0, "never tracked");
  /* a proposal is checked as R1 says */
  row(w.duties.propose({ ...w.fields({ modality: "maybe" }), by: MACHINE }), "UNKNOWN_MODALITY");
  /* the machine never adopts or declares */
  row(w.duties.adopt({ proposalId: p.proposal_id, clause: "s1", by: MACHINE }), "MEMBER_ACT_ONLY");
  row(w.duties.adopt({ proposalId: p.proposal_id, clause: "s1", by: "" }), "MEMBER_ACT_ONLY");
  row(w.duties.declare({ ...w.fields(), clause: "s1", by: MACHINE }), "MEMBER_ACT_ONLY");
  row(w.duties.adopt({ proposalId: p.proposal_id, clause: "  ", by: BOB }), "NO_CLAUSE");
  row(w.duties.adopt({ proposalId: 999, clause: "s1", by: BOB }), "NO_SUCH_PROPOSAL");
  const a = w.duties.adopt({ proposalId: p.proposal_id, clause: "s7922(a)", by: BOB });
  assert.equal(a.ok, true);
  assert.equal(a.duty_id, "DUT-2026-0001");
  const again = w.duties.adopt({ proposalId: p.proposal_id, clause: "s7922(a)", by: CAROL });
  row(again, "ALREADY_ADOPTED");
  assert.equal(again.duty_id, "DUT-2026-0001");
  const read = w.duties.readDuty({ dutyId: a.duty_id, viewer: BOB }).duty;
  assert.deepEqual(read.proposal, { proposal_id: p.proposal_id, by: MACHINE, machine_work: true, state: "machine_proposed",
                                     why: "computed from the profile rule", at: "2026-03-02T12:00:00Z" });
  assert.deepEqual(read.adoption, { by: BOB, at: "2026-03-02T12:00:00Z", clause: "s7922(a)" });
  /* a member's proposal is labelled the member's */
  assert.deepEqual(w.duties.propose({ ...w.fields(), by: CAROL }).label, { by: CAROL, machine_work: false, state: "member_proposed" });
});

test("R3 a declaration is its adoption: DUT-<year>-NNNN with who, when and the clause, tracked and told once whatever its basis kind", () => {
  const w = world();
  const ids = [];
  for (const time of [{ basis: "rule", rule: "records_response" }, { basis: "commitment", date: "2026-02-20" },
                      { basis: "dependency", lead: 2, why: "before the hearing" }, { basis: "window", date: "2026-02-25" }]) {
    const r = w.declare({ time });
    assert.equal(r.ok, true);
    assert.equal(r.adopted_by, BOB);
    assert.equal(r.at, "2026-03-02T12:00:00Z");
    assert.equal(r.tracked, true);
    ids.push(r.duty_id);
  }
  assert.deepEqual(ids, ["DUT-2026-0001", "DUT-2026-0002", "DUT-2026-0003", "DUT-2026-0004"]);
  const t = w.duties.recordTransitions({ asOf: "2026-03-02T12:00:00Z" });
  assert.equal(t.duties_read, 4, "every adopted duty is tracked, whatever its basis kind");
  assert.equal(w.duties.recordTransitions({ asOf: "2026-03-02T12:00:00Z" }).recorded, 0, "told once: nothing new on a second pass");
  w.at("2027-03-02T12:00:00.000Z");
  assert.equal(w.declare().duty_id, "DUT-2027-0001", "the year is the adoption's");
});

test("R4 a duty arising in a proceeding or report names it, and carries reported statuses only as quotes of cited extents", () => {
  const w = world();
  const report = w.passage("grand-jury-report");          /* a captured report, held in its bundle */
  const response = w.passage("response");                 /* the body's response: its quoted passage */
  row(w.declare({ arising_in: ent(55) }), "ARISING_IN_NOT_HELD");
  row(w.declare({ arising_in: E.clerk }), "ARISING_IN_NOT_HELD", "an entity that is not a proceeding");
  row(w.declare({ arising_in: SHA("a capture never held") }), "ARISING_IN_NOT_HELD", "a capture the record does not hold");
  row(w.declare({ arising_in: E.case, reported_status: [{ status: "implemented", extent: SHA("no such passage") }] }), "EXTENT_NOT_HELD");
  const a = w.declare({ arising_in: E.case, reported_status: [{ status: "will_not_implement", extent: response.contentId }] });
  assert.equal(a.ok, true);
  assert.equal(w.declare({ arising_in: report.capSha }).ok, true);
  const d = w.duties.readDuty({ dutyId: a.duty_id, viewer: BOB }).duty;
  assert.equal(d.arising_in, E.case);
  assert.deepEqual(d.reported_status, [{ status: "will_not_implement", extent: response.contentId }],
    "the status is the quote's, from the vocabulary, with its extent; nothing in the record's own words");
});

test("R5 a profile deadline is held as a generic duty of the office the rule names, one occurrence per item of a registered source", () => {
  const w = world();
  const sent = [{ ref: "ACT-2026-0001-request", date: "2026-02-02", label: "records request sent" },
                { ref: "ACT-2026-0002-request", date: "2026-02-20", label: "second request" }];
  w.duties.registerTriggerSource("actions", ({ duty }) => (duty.obligor === E.clerk ? sent : []));
  const law = w.standard();
  row(w.duties.proposeFromRule({ rule: "no_such_rule", office: E.clerk, by: MACHINE }), "BAD_TIME");
  const p = w.duties.proposeFromRule({ rule: "records_response", applies_to: "records_request", office: E.clerk, obligee: E.group,
    source: { kind: "standard", standard: law, portion: "s7922" }, trigger_source: "actions", by: MACHINE });
  assert.equal(p.ok, true);
  assert.equal(p.label.machine_work, true);
  const a = w.duties.adopt({ proposalId: p.proposal_id, clause: "the agency asked responds within 10 days", by: BOB });
  const o = w.duties.occurrencesOf({ dutyId: a.duty_id, asOf: "2026-03-02T12:00:00Z", from: "2026-01-01", to: "2026-03-01", viewer: BOB });
  assert.equal(o.occurrences.length, 2, "one occurrence per request of the one generic duty");
  assert.deepEqual(o.occurrences.map((x) => x.trigger.ref), sent.map((s) => s.ref));
  assert.deepEqual(o.occurrences.map((x) => x.due.date.value), ["2026-02-12", "2026-03-02"]);
  assert.ok(o.occurrences.every((x) => x.due.basis_kind === "rule" && x.due.law_set === true));
  const read = w.duties.readDuty({ dutyId: a.duty_id, viewer: BOB }).duty;
  assert.equal(read.obligor, E.clerk);
  assert.deepEqual(read.trigger, { kind: "source", source: "actions" });
});

test("R6 revise writes a new version with who, when and why, re-checking R1; withdraw keeps the duty, shown withdrawn, deriving no further occurrences", () => {
  const w = world();
  const a = w.declare({ trigger: { kind: "recurrence", rrule: "FREQ=MONTHLY;BYMONTHDAY=1", dtstart: "2026-01-01" }, time: { basis: "commitment" } });
  row(w.duties.revise({ dutyId: a.duty_id, performance: { act: "post minutes" }, reason: "the clause says minutes", by: MACHINE }), "MEMBER_ACT_ONLY");
  row(w.duties.revise({ dutyId: a.duty_id, performance: { act: "post minutes" }, reason: "", by: BOB }), "NO_REASON");
  row(w.duties.revise({ dutyId: "DUT-2026-0099", reason: "x", by: BOB }), "NO_SUCH_DUTY");
  row(w.duties.revise({ dutyId: a.duty_id, modality: "wish", reason: "x", by: BOB }), "UNKNOWN_MODALITY");
  w.at("2026-03-05T00:00:00.000Z");
  const r = w.duties.revise({ dutyId: a.duty_id, performance: { act: "post the minutes" }, reason: "the clause says minutes", by: CAROL });
  assert.deepEqual(r, { ok: true, duty_id: a.duty_id, version: 2, prior_version: 1, by: CAROL, at: "2026-03-05T00:00:00Z", reason: "the clause says minutes" });
  const d = w.duties.readDuty({ dutyId: a.duty_id, viewer: BOB }).duty;
  assert.equal(d.performance.act, "post the minutes");
  assert.deepEqual(d.versions.map((v) => [v.version, v.by, v.at, v.reason, v.fields.performance.act]), [
    [1, BOB, "2026-03-02T12:00:00Z", null, "respond to the records request"],
    [2, CAROL, "2026-03-05T00:00:00Z", "the clause says minutes", "post the minutes"]]);
  /* withdraw */
  row(w.duties.withdraw({ dutyId: a.duty_id, reason: " ", by: BOB }), "NO_REASON");
  row(w.duties.withdraw({ dutyId: a.duty_id, reason: "repealed", by: MACHINE }), "MEMBER_ACT_ONLY");
  const before = w.duties.occurrencesOf({ dutyId: a.duty_id, asOf: "2026-06-02T00:00:00Z", from: "2026-01-01", to: "2026-06-01", viewer: BOB });
  assert.equal(before.occurrences.length, 6);
  w.at("2026-03-15T00:00:00.000Z");
  const x = w.duties.withdraw({ dutyId: a.duty_id, reason: "repealed by the council", by: BOB });
  assert.equal(x.ok, true);
  assert.deepEqual(w.duties.withdraw({ dutyId: a.duty_id, reason: "again", by: CAROL }),
    { ok: true, already: true, duty_id: a.duty_id, withdrawn_at: "2026-03-15T00:00:00Z", withdrawn_by: BOB });
  const after = w.duties.occurrencesOf({ dutyId: a.duty_id, asOf: "2026-06-02T00:00:00Z", from: "2026-01-01", to: "2026-06-01", viewer: BOB });
  assert.deepEqual(after.occurrences.map((o) => o.trigger.ref), ["2026-01-01", "2026-02-01", "2026-03-01"], "none triggered after the withdrawal");
  assert.deepEqual(after.withdrawn, { at: "2026-03-15T00:00:00Z", by: BOB, reason: "repealed by the council" });
  assert.deepEqual(w.duties.readDuty({ dutyId: a.duty_id, viewer: BOB }).duty.withdrawn, { at: "2026-03-15T00:00:00Z", by: BOB, reason: "repealed by the council" });
  row(w.duties.revise({ dutyId: a.duty_id, performance: { act: "y" }, reason: "x", by: BOB }), "DUTY_WITHDRAWN");
});

test("R7 readDuty answers every field, its versions, proposal, adoption and in_force; dutiesOf by place, bounded 1–500 with truncated", () => {
  const w = world();
  row(w.duties.readDuty({ dutyId: "", viewer: BOB }), "NO_DUTY");
  assert.deepEqual(w.duties.readDuty({ dutyId: "DUT-2026-0042", viewer: BOB }), { ok: true, found: false, duty_id: "DUT-2026-0042" });
  w.line({ kind: "acts_for", from: E.contractor, to: E.council });
  const a = w.declare({ obligor: E.contractor, enforcer: E.auditor, observed_by: E.group, exceptions: [{ statement: "unless exempt", citation: "s7927" }] });
  const d = w.duties.readDuty({ dutyId: a.duty_id, viewer: BOB, at: "2026-03-01" }).duty;
  for (const k of ["duty_id", "modality", "obligor", "obligee", "performance", "source", "trigger", "time", "exceptions", "enforcer", "observed_by",
                   "version", "versions", "proposal", "adoption", "withdrawn", "in_force"])
    assert.ok(k in d, k);
  assert.deepEqual([d.in_force.date, d.in_force.state], ["2026-03-01", "in_force"]);
  assert.match(d.in_force.why, /lies within the period in force/);
  assert.equal(d.words, "obligation");
  for (let i = 0; i < 4; i++) w.declare({ obligee: E.council });
  assert.equal(w.duties.dutiesOf({ entity: E.clerk, viewer: BOB }).count, 4);
  assert.equal(w.duties.dutiesOf({ entity: E.council, as: "obligee", viewer: BOB }).count, 4);
  assert.equal(w.duties.dutiesOf({ entity: E.auditor, as: "enforcer", viewer: BOB }).count, 1);
  const two = w.duties.dutiesOf({ entity: E.clerk, limit: 2, viewer: BOB });
  assert.deepEqual([two.count, two.limit, two.truncated], [2, 2, true]);
  const big = w.duties.dutiesOf({ entity: E.clerk, limit: 100000, viewer: BOB });
  assert.deepEqual([big.limit, big.truncated], [LIST_MAX, false]);
  assert.equal(w.duties.dutiesOf({ entity: E.clerk, limit: 0, viewer: BOB }).limit, 1);
  assert.equal(w.duties.dutiesOf({ entity: E.clerk, limit: 4, viewer: BOB }).truncated, false);
  assert.equal(w.duties.dutiesOf({ entity: "", viewer: BOB }).reason, "NO_ENTITY");
  assert.equal(w.duties.dutiesOf({ entity: E.clerk, as: "friend", viewer: BOB }).reason, "BAD_PLACE");
  /* the index the read uses */
  assert.ok(w.sqlRows(`EXPLAIN QUERY PLAN SELECT * FROM duties WHERE obligor=? ORDER BY duty_id`, E.clerk).some((r) => /duties_obligor/.test(r.detail)));
});

test("R8 in_force is derived on each read, never stored: a standard's or court's through standards.inForceAt; practice and dependency held as such", () => {
  const w = world();
  const oldStd = w.standard({ period: { from: "2000-01-01", to: "2025-12-31" } });
  const openStd = w.standard({ cite: "Test Code § 8", period: { from: "2020-01-01", to: null } });
  const old = w.declare({ source: { kind: "standard", standard: oldStd } });
  const open = w.declare({ source: { kind: "standard", standard: openStd } });
  const prac = w.declare({ source: { kind: "practice", statement: "minutes posted within a week, measured over a year" } });
  const dep = w.declare({ source: { kind: "dependency", why: "the report precedes the vote" } });
  const f = (id, at) => w.duties.readDuty({ dutyId: id, viewer: BOB, at }).duty.in_force;
  assert.deepEqual([f(old.duty_id, "2025-06-01").state, f(old.duty_id, "2025-06-01").date], ["in_force", "2025-06-01"]);
  assert.equal(f(old.duty_id, "2026-06-01").state, "not_in_force");
  const u = f(open.duty_id, "2026-06-01");
  assert.equal(u.state, "undetermined");
  assert.match(u.why, /does not state when it ceased to be in force/, "an undetermined answer carries its reason");
  assert.equal(f(prac.duty_id, "2026-06-01").state, "held as practice");
  assert.equal(f(dep.duty_id, "2026-06-01").state, "held as a dependency");
  /* never stored: no column holds it, and no version holds it in its fields */
  assert.ok(!w.sqlRows(`PRAGMA table_info(duties)`).some((c) => /in_?force/.test(c.name)));
  assert.ok(w.sqlRows(`SELECT fields_json FROM duty_versions`).every((r) => !/in_force|not_in_force/.test(r.fields_json)));
});
